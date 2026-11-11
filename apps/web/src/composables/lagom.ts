import { reactive } from 'vue';
import { adminToken } from './bling';
import { lagomOperations, lagomSchemas, type LagomField, type LagomKind, type LagomOperation } from '../generated/lagom-catalog';

export { lagomOperations, lagomSchemas };
export type { LagomField, LagomOperation };

const messages: Record<string, string> = {
  UNAUTHORIZED: 'O proxy do painel não enviou a chave do .env (ADMIN_API_TOKEN).',
  LAGOM_NOT_CONFIGURED: 'Preencha LAGOM_ORGANIZATION e LAGOM_TOKEN no .env e reinicie a API.',
  LAGOM_CREDENTIALS_INVALID: 'O Lagom recusou a organização/token configurados.',
  LAGOM_UNAVAILABLE: 'O Lagom não respondeu. Tente novamente em instantes.',
  LAGOM_WRITE_DISABLED: 'Escrita no Lagom desligada (LAGOM_WRITE_ENABLED=false no .env).',
  LAGOM_BAD_REQUEST: 'O Lagom recusou os dados enviados.',
  LAGOM_ACCESS_REJECTED: 'O Lagom recusou o token de acesso.',
  LAGOM_FORBIDDEN: 'Sem permissão no Lagom para esta operação.',
  LAGOM_RATE_LIMIT: 'Limite de requisições do Lagom atingido.',
  LAGOM_REQUEST_FAILED: 'O Lagom retornou um erro.',
  LAGOM_RESPONSE_INVALID: 'O Lagom retornou uma resposta inesperada.',
  LAGOM_BODY_INVALID: 'Corpo da requisição inválido para esta operação.',
  LAGOM_OPERATION_UNKNOWN: 'Operação não existe no catálogo.',
  BLING_NOT_ENABLED: 'A conexão Bling está desligada (BLING_OAUTH_ENABLED).',
  RECONNECT_REQUIRED: 'Conecte a Bling na tela Conexões.',
  SNAPSHOT_RUNNING: 'Já existe uma leitura da Bling em andamento.',
  LAGOM_LOAD_RUNNING: 'Já existe uma carga em andamento.',
  RUN_NOT_FOUND: 'Execução não encontrada no log.',
  RUNS_FILTERS_INVALID: 'Filtros do log inválidos.',
  MAPPING_OPTIONS_INVALID: 'Revise as opções de mapeamento.',
};

export class LagomApiError extends Error {
  constructor(message: string, readonly code: string, readonly status: number, readonly detail?: string) { super(message); }
}

export async function lagomRequest<T = any>(path: string, method = 'GET', body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch('/api/lagom/' + path, {
      method, headers: { ...(adminToken.value ? { Authorization: 'Bearer ' + adminToken.value } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), Accept: 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch { throw new LagomApiError('Não foi possível acessar o servidor.', 'NETWORK', 0); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const e = data.lagomError;
    const detail = [e?.error, Array.isArray(e?.message) ? e.message.join(' · ') : e?.message, data.reason, data.operation, ...(data.issues ?? [])].filter(Boolean).join(' — ');
    throw new LagomApiError(messages[data.code] ?? `Falha (HTTP ${response.status}${data.code ? ' · ' + data.code : ''}).`, data.code ?? 'UNKNOWN', response.status, detail || undefined);
  }
  return data as T;
}

export const kindLabel: Record<LagomKind, string> = { cadastro: 'Cadastros', transacao: 'Transações', consulta: 'Consultas', retorno: 'Retorno de integração', auth: 'Autenticação', outro: 'Outros' };
export const kindOrder: LagomKind[] = ['cadastro', 'transacao', 'consulta', 'retorno'];

export interface LagomStatus { configured: boolean; organization: string | null; baseUrl: string; writeEnabled: boolean; authenticated: boolean; accessTokenExpiresAt: string | null }
export const lagomState = reactive<{ status?: LagomStatus; error?: string }>({});
export async function refreshLagomStatus() {
  try { lagomState.status = await lagomRequest<LagomStatus>('status'); lagomState.error = undefined; }
  catch (e) { lagomState.error = e instanceof Error ? e.message : 'Falha'; }
}

/** Exemplo de corpo para o editor a partir do schema do OpenAPI. */
export function exampleBody(op: LagomOperation): unknown {
  const b = op.body;
  if (!b) return undefined;
  if (b.example !== undefined) return b.example;
  const fromFields = (fields: LagomField[]) => Object.fromEntries(fields.filter(f => f.required || f.example !== undefined).map(f => [f.name,
    f.example ?? (f.type === 'number' ? 0 : f.type === 'boolean' ? true : f.type === 'array' ? [] : f.format === 'YYYY-MM-DD' ? new Date().toISOString().slice(0, 10) : '')]));
  if (b.schema) { const obj = fromFields(lagomSchemas[b.schema]?.fields ?? []); return b.array ? [obj] : obj; }
  if (b.fields) return fromFields(b.fields);
  return b.primitive === 'number' ? [0] : [''];
}
