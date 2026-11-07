import { computed, reactive, ref, watch } from 'vue';
// Chave do painel lembrada neste navegador (painel só escuta em 127.0.0.1), para que
// recarregar a página não pareça uma "queda" da conexão Bling. "Esquecer chave" limpa.
const STORAGE_KEY = 'lagom-bling-admin-key';
const readStored = () => { try { return localStorage.getItem(STORAGE_KEY) ?? ''; } catch { return ''; } };
export const adminToken = ref(readStored());
watch(adminToken, value => {
  try { if (value) localStorage.setItem(STORAGE_KEY, value); else localStorage.removeItem(STORAGE_KEY); } catch { /* armazenamento indisponível */ }
});
export function forgetAdminToken() { adminToken.value = ''; }
// O proxy do painel (nginx/Vite) injeta a chave do .env. Só se pede a chave quando ele não a injeta.
const authHeader = (): Record<string, string> => adminToken.value ? { Authorization: 'Bearer ' + adminToken.value } : {};
export const blingErrors: Record<string, string> = {
  UNAUTHORIZED: 'O proxy do painel não enviou a chave do .env (ADMIN_API_TOKEN). Informe a chave ou reinicie o painel.',
  RECONNECT_REQUIRED: 'Conecte sua conta Bling na tela Conexões para continuar.',
  OAUTH_STATE_INVALID: 'A autorização expirou ou pertence a outro navegador. Inicie novamente.',
  OAUTH_CALLBACK_INVALID: 'A URL de retorno não corresponde ao endereço configurado.',
  OAUTH_CALLBACK_INVALID_OR_DENIED: 'A autorização não foi concluída ou a URL está incompleta.',
  CLIENT_CREDENTIALS_INVALID: 'As credenciais da aplicação Bling precisam ser corrigidas no servidor.',
  PRODUCT_SCOPE_REQUIRED: 'Autorize a permissão de consulta de produtos na aplicação Bling.',
  PRODUCT_FILTERS_INVALID: 'Revise os filtros e a página solicitada.',
  BLING_UNAVAILABLE: 'A Bling não respondeu. Tente novamente em instantes.',
  BLING_RATE_LIMIT: 'O limite de consultas da Bling foi atingido. Aguarde antes de tentar novamente.',
  ACCESS_REJECTED: 'A Bling recusou o acesso. Verifique a autorização da aplicação.',
};
export async function blingRequest(path: string, method = 'GET', body?: object) {
  let response: Response;
  try {
    response = await fetch('/api/bling/' + path, { method, headers: { ...authHeader(), ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  } catch { throw new Error('Não foi possível acessar o servidor. Verifique se a aplicação está rodando.'); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(blingErrors[data.code] ?? 'Não foi possível concluir a consulta. Tente novamente.');
  return data;
}

Object.assign(blingErrors, {
  SCOPE_REQUIRED: 'Sua aplicação Bling não tem permissão (escopo) para este recurso.',
  BLING_NOT_FOUND: 'Registro não encontrado na Bling.',
  BLING_BAD_REQUEST: 'A Bling recusou os parâmetros informados.',
  BLING_READ_FAILED: 'A Bling retornou um erro ao consultar este recurso.',
  BLING_RESPONSE_INVALID: 'A Bling retornou uma resposta inesperada.',
  EXPLORER_ENDPOINT_UNKNOWN: 'Endpoint não disponível no catálogo.',
  EXPLORER_PARAMS_INVALID: 'Revise os parâmetros informados.',
});

export class BlingApiError extends Error {
  constructor(message: string, readonly code: string, readonly status: number, readonly detail?: string) { super(message); }
}

/** Consulta GET de qualquer endpoint do catálogo, via proxy somente-leitura da API. */
export async function blingGet(endpointId: string, query: URLSearchParams) {
  let response: Response;
  try {
    response = await fetch(`/api/bling/v3/${encodeURIComponent(endpointId)}?${query}`, { headers: { ...authHeader(), Accept: 'application/json' } });
  } catch { throw new BlingApiError('Não foi possível acessar o servidor. Verifique se a aplicação está rodando.', 'NETWORK', 0); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const e = data.blingError;
    const fields = Array.isArray(e?.fields) ? e.fields.map((f: { element?: string; msg?: string }) => [f.element, f.msg].filter(Boolean).join(': ')).join(' · ') : '';
    const detail = data.field ? `${data.field}: ${data.reason}` : [e?.message, e?.description, fields].filter(Boolean).join(' — ');
    throw new BlingApiError(blingErrors[data.code] ?? `Falha na consulta (HTTP ${response.status}).`, data.code ?? 'UNKNOWN', response.status, detail || undefined);
  }
  return data as { data?: unknown; [key: string]: unknown };
}

export type Availability = 'ok' | 'forbidden' | 'error' | 'checking' | 'needs-input';
/** Resultado da verificação de disponibilidade; vive só enquanto o painel está aberto. */
export const availability = reactive<Record<string, { state: Availability; detail?: string }>>({});

/** Estado da conexão Bling mantida pelo servidor (renovação automática do token). */
export const connection = reactive<{ state: 'unknown' | 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'NO_KEY' | 'BAD_KEY' | 'OFFLINE'; expiresAt?: string; lastRefreshAt?: string; checkedAt?: Date }>({ state: 'unknown' });
export async function refreshConnection() {
  try {
    const r = await fetch('/api/bling/status', { headers: authHeader() });
    if (r.status === 401) { connection.state = 'BAD_KEY'; return; }
    if (!r.ok) { connection.state = 'OFFLINE'; return; }
    const d = await r.json();
    Object.assign(connection, { state: d.status, expiresAt: d.accessTokenExpiresAt, lastRefreshAt: d.lastRefreshAt, checkedAt: new Date() });
  } catch { connection.state = 'OFFLINE'; }
}

/** Verdadeiro só quando o servidor recusou a chave (proxy sem ADMIN_API_TOKEN): aí o painel pede a chave. */
export const needsKey = computed(() => connection.state === 'BAD_KEY');
