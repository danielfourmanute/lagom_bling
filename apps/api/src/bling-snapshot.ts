import { createHash } from 'node:crypto';
import type { Prisma, PrismaClient } from '@prisma/client';
import { BlingError, type BlingConnection } from './bling.js';

/** Recursos da Bling guardados localmente para o mapeamento de cadastros. */
export const SNAPSHOT_RESOURCES = ['empresa', 'deposito', 'categoria', 'grupo-produto', 'forma-pagamento', 'contato', 'contato-detalhe', 'produto', 'produto-detalhe', 'produto-fornecedor'] as const;
export type SnapshotResource = typeof SNAPSHOT_RESOURCES[number];
export type SnapshotMode = 'incremental' | 'full';
export interface SnapshotState {
  status: 'idle' | 'running' | 'done' | 'failed';
  mode?: SnapshotMode; startedAt?: string; finishedAt?: string;
  step?: string; done: number; total: number; detailErrors: number; errorCodes: Record<string, number>; errorCode?: string;
}
type Json = Record<string, unknown>;
type Log = { info: (o: object, m: string) => void; warn: (o: object, m: string) => void };

const CHECKPOINT = { direction: 'BLING_TO_LAGOM' as const, tenantId: 'default', resource: 'bling-snapshot' };
const hashOf = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
/** Formato de data da Bling ("2024-01-31 10:00:00"), no fuso da conta. */
export function blingDateTime(date: Date) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(date).map(p => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

/**
 * Copia os cadastros da Bling para `source_records` (somente leitura na Bling).
 * Listagens são relidas por inteiro; detalhes de produto/contato (1 GET cada) só são lidos
 * quando faltam no banco, quando a Bling indica alteração desde o último snapshot, ou no modo "full".
 */
export class BlingSnapshot {
  state: SnapshotState = { status: 'idle', done: 0, total: 0, detailErrors: 0, errorCodes: {} };
  constructor(private bling: BlingConnection, private db: PrismaClient, private log: Log) {}

  start(mode: SnapshotMode) {
    if (this.state.status === 'running') throw new BlingError('SNAPSHOT_RUNNING', 409);
    this.state = { status: 'running', mode, startedAt: new Date().toISOString(), done: 0, total: 0, detailErrors: 0, errorCodes: {}, step: 'Iniciando' };
    void this.run(mode).then(
      () => { Object.assign(this.state, { status: 'done', finishedAt: new Date().toISOString(), step: 'Concluído' }); this.log.info({ ...this.state }, 'Snapshot Bling concluído'); },
      (error) => {
        Object.assign(this.state, { status: 'failed', finishedAt: new Date().toISOString(), errorCode: error instanceof BlingError ? error.code : 'SNAPSHOT_FAILED' });
        this.log.warn({ code: this.state.errorCode }, 'Snapshot Bling interrompido');
      });
    return this.state;
  }

  async counts() {
    const rows = await this.db.sourceRecord.groupBy({ by: ['resource'], where: { system: 'BLING' }, _count: { _all: true }, _max: { fetchedAt: true } });
    const checkpoint = await this.db.syncCheckpoint.findUnique({ where: { direction_tenantId_resource: CHECKPOINT } });
    return {
      lastSuccessAt: checkpoint?.watermarkAt?.toISOString() ?? null,
      resources: Object.fromEntries(rows.map(r => [r.resource, { count: r._count._all, lastFetchedAt: r._max.fetchedAt?.toISOString() ?? null }])),
    };
  }

  /** Leitura com nova tentativa para falhas temporárias (429/indisponível), com espera crescente. */
  private async json(path: string, query: Record<string, string> = {}): Promise<unknown> {
    for (let attempt = 1; ; attempt++) {
      try { return await this.jsonOnce(path, query); }
      catch (error) {
        const code = error instanceof BlingError ? error.code : '';
        if (attempt >= 5 || !['BLING_RATE_LIMIT', 'BLING_UNAVAILABLE', 'BLING_READ_FAILED'].includes(code)) throw error;
        await new Promise(r => setTimeout(r, (code === 'BLING_RATE_LIMIT' ? 5000 : 2000) * attempt));
      }
    }
  }
  private async jsonOnce(path: string, query: Record<string, string>) {
    const response = await this.bling.read(path, new URLSearchParams(query));
    const body = await response.json().catch(() => null) as { data?: unknown } | null;
    if (!body || typeof body !== 'object') throw new BlingError('BLING_RESPONSE_INVALID');
    return body.data;
  }
  private async pages(path: string, query: Record<string, string> = {}) {
    const all: Json[] = [];
    for (let pagina = 1; pagina < 10_000; pagina++) {
      this.state.step = `Lendo ${path} (página ${pagina})`;
      const data = await this.json(path, { ...query, pagina: String(pagina), limite: '100' });
      if (!Array.isArray(data)) throw new BlingError('BLING_RESPONSE_INVALID');
      all.push(...data as Json[]);
      if (data.length < 100) break;
    }
    return all;
  }
  private async save(resource: SnapshotResource, rows: { id: string; payload: unknown }[]) {
    for (let i = 0; i < rows.length; i += 500) {
      await this.db.$transaction(rows.slice(i, i + 500).map(r => {
        const data = { payload: r.payload as Prisma.InputJsonValue, payloadHash: hashOf(r.payload), fetchedAt: new Date() };
        return this.db.sourceRecord.upsert({ where: { system_resource_externalId: { system: 'BLING', resource, externalId: r.id } }, create: { system: 'BLING', resource, externalId: r.id, ...data }, update: data });
      }));
    }
  }
  /** Substitui a listagem completa de um recurso: apaga o que deixou de existir na Bling. */
  private async replace(resource: SnapshotResource, items: Json[], idOf = (x: Json) => String(x.id)) {
    const rows = items.map(x => ({ id: idOf(x), payload: x }));
    await this.save(resource, rows);
    await this.db.sourceRecord.deleteMany({ where: { system: 'BLING', resource, externalId: { notIn: rows.map(r => r.id) } } });
    return rows.map(r => r.id);
  }
  private async details(resource: 'produto-detalhe' | 'contato-detalhe', ids: string[], path: string) {
    this.state.total += ids.length;
    for (const id of ids) {
      this.state.step = `Detalhe ${resource === 'produto-detalhe' ? 'de produto' : 'de contato'} ${this.state.done + 1}/${this.state.total}`;
      for (let attempt = 1; ; attempt++) {
        try {
          const data = await this.json(`${path}/${encodeURIComponent(id)}`);
          await this.save(resource, [{ id, payload: data }]);
          break;
        } catch (error) {
          const code = error instanceof BlingError ? error.code : 'UNKNOWN';
          if (code === 'BLING_NOT_FOUND') { await this.db.sourceRecord.deleteMany({ where: { system: 'BLING', resource, externalId: id } }); break; }
          if (['RECONNECT_REQUIRED', 'ACCESS_REJECTED', 'SCOPE_REQUIRED'].includes(code)) throw error;
          if (attempt < 2 && code === 'BLING_RESPONSE_INVALID') { await new Promise(r => setTimeout(r, 3000)); continue; }
          this.state.detailErrors++;
          this.state.errorCodes[code] = (this.state.errorCodes[code] ?? 0) + 1;
          this.log.warn({ code, resource, id }, 'Falha ao ler detalhe na Bling');
          break;
        }
      }
      this.state.done++;
    }
  }
  private async detailTargets(resource: 'produto-detalhe' | 'contato-detalhe', ids: string[], changed: Set<string> | null, mode: SnapshotMode) {
    if (mode === 'full') return ids;
    const existing = new Set((await this.db.sourceRecord.findMany({ where: { system: 'BLING', resource }, select: { externalId: true } })).map(r => r.externalId));
    // Sem checkpoint (primeira leitura ou leitura interrompida) só busca o que falta.
    return ids.filter(id => !existing.has(id) || changed?.has(id));
  }

  private async run(mode: SnapshotMode) {
    const startedAt = new Date();
    const checkpoint = await this.db.syncCheckpoint.findUnique({ where: { direction_tenantId_resource: CHECKPOINT } });
    // Sem snapshot anterior bem-sucedido, o incremental não sabe o que mudou: relê todos os detalhes ausentes.
    const since = mode === 'incremental' && checkpoint?.watermarkAt ? blingDateTime(new Date(checkpoint.watermarkAt.getTime() - 10 * 60_000)) : null;

    const empresa = await this.json('/empresas/me/dados-basicos');
    await this.replace('empresa', [empresa as Json], () => 'me');
    await this.replace('deposito', await this.pages('/depositos'));
    await this.replace('categoria', await this.pages('/categorias/produtos'));
    await this.replace('grupo-produto', await this.pages('/grupos-produtos'));
    await this.replace('forma-pagamento', await this.pages('/formas-pagamentos'));

    // Contatos: a listagem não traz o tipo; marca cada um com os tipos consultados por filtro.
    const tipos = (await this.json('/contatos/tipos')) as { id: number; descricao: string }[];
    const contatos = await this.pages('/contatos');
    const tiposDe = new Map<string, string[]>();
    for (const tipo of tipos.filter(t => ['cliente', 'fornecedor'].includes(norm(t.descricao)))) {
      for (const c of await this.pages('/contatos', { idTipoContato: String(tipo.id) })) {
        tiposDe.set(String(c.id), [...(tiposDe.get(String(c.id)) ?? []), tipo.descricao]);
      }
    }
    const contatoIds = await this.replace('contato', contatos.map(c => ({ ...c, _tipos: tiposDe.get(String(c.id)) ?? [] })));
    await this.db.sourceRecord.deleteMany({ where: { system: 'BLING', resource: 'contato-detalhe', externalId: { notIn: contatoIds } } });

    // Ativos (2) e inativos (3); excluídos ficam de fora. Inativos seguem com active=false no Lagom.
    const produtosDe = async (q: Record<string, string> = {}) => [...await this.pages('/produtos', { ...q, criterio: '2' }), ...await this.pages('/produtos', { ...q, criterio: '3' })];
    const produtoIds = await this.replace('produto', await produtosDe());
    await this.db.sourceRecord.deleteMany({ where: { system: 'BLING', resource: 'produto-detalhe', externalId: { notIn: produtoIds } } });
    await this.replace('produto-fornecedor', await this.pages('/produtos/fornecedores'));

    const changedProdutos = since ? new Set((await produtosDe({ dataAlteracaoInicial: since })).map(p => String(p.id))) : null;
    const changedContatos = since ? new Set((await this.pages('/contatos', { dataAlteracaoInicial: since })).map(c => String(c.id))) : null;
    const produtos = await this.detailTargets('produto-detalhe', produtoIds, changedProdutos, mode);
    const contatosAlvo = await this.detailTargets('contato-detalhe', contatoIds, changedContatos, mode);
    await this.details('contato-detalhe', contatosAlvo, '/contatos');
    await this.details('produto-detalhe', produtos, '/produtos');

    if (this.state.detailErrors === 0) {
      await this.db.syncCheckpoint.upsert({ where: { direction_tenantId_resource: CHECKPOINT }, create: { ...CHECKPOINT, watermarkAt: startedAt }, update: { watermarkAt: startedAt } });
    }
  }
}
