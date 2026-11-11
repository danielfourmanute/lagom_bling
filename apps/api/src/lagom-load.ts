import type { Prisma, PrismaClient } from '@prisma/client';
import { buildPlan, type BlingData, type MappingOptions, type MappedRecord, type ResourcePlan } from './bling-lagom-mapping.js';
import { LagomError, type LagomClient } from './lagom.js';

const TENANT = 'default';
type J = Record<string, any>;

/** Lê o snapshot Bling guardado em source_records. */
export async function loadBlingData(db: PrismaClient): Promise<BlingData> {
  const rows = await db.sourceRecord.findMany({ where: { system: 'BLING' }, select: { resource: true, externalId: true, payload: true } });
  const by = (resource: string) => rows.filter(r => r.resource === resource).map(r => r.payload as J);
  const map = (resource: string) => new Map(rows.filter(r => r.resource === resource).map(r => [r.externalId, r.payload as J]));
  return {
    empresa: by('empresa')[0], depositos: by('deposito'), categorias: by('categoria'), gruposProdutos: by('grupo-produto'), formas: by('forma-pagamento'),
    contatos: by('contato'), contatoDetalhes: map('contato-detalhe'),
    produtos: by('produto'), produtoDetalhes: map('produto-detalhe'), produtoFornecedores: by('produto-fornecedor'),
  };
}

export interface LoadResourceResult { resource: string; operation: string; eligible: number; unchanged: number; blocked: number; sent: number; confirmed: number; rejected: number; rejections: { code: string; status?: number; message?: string }[] }
export interface LoadState {
  status: 'idle' | 'running' | 'done' | 'failed'; dryRun?: boolean; runId?: string; startedAt?: string; finishedAt?: string;
  current?: string; results: LoadResourceResult[]; errorCode?: string; errorDetail?: unknown;
}

/** Status de cada registro na resposta do Lagom (OkResponse e variantes). */
export function outcome<T extends Pick<MappedRecord, 'code'>>(response: unknown, batch: T[]) {
  const list = Array.isArray(response) ? response as J[] : response && typeof response === 'object' ? [response as J] : [];
  const keyOf = (r: J) => r.code !== undefined && r.code !== null && typeof r.code !== 'object' ? String(r.code)
    : r.branchItem ? `${r.branchItem.branch}:${r.branchItem.item}` : r.supplier && r.brand ? `${r.supplier}|${r.brand}` : undefined;
  // Normaliza separadores: composição volta como "item-componente" e é enviada como "item:componente".
  const norm = (k: string | undefined) => k?.replace(/[-:|]/g, ':');
  const codes = new Set(batch.map(r => norm(r.code)));
  const byCode = new Map<string, J>();
  const unkeyed: J[] = [];
  for (const r of list) { const k = norm(keyOf(r)); if (k !== undefined && codes.has(k)) byCode.set(k, r); else unkeyed.push(r); }
  // O Lagom pode devolver só os erros identificados (fora da ordem) e os sucessos com code "0".
  // Registros sem resposta própria: se as respostas sem identificação são todas iguais, valem para eles;
  // sem nenhuma identificação, casa pela posição; senão, ficam indeterminados (rejeitados).
  const uniform = unkeyed.length > 0 && unkeyed.every(r => r.status === unkeyed[0]!.status) ? unkeyed[0] : undefined;
  return batch.map((rec, i) => {
    const r = byCode.get(norm(rec.code)!) ?? (byCode.size === 0 && list.length === batch.length ? list[i] : uniform);
    const status = typeof r?.status === 'number' ? r.status : undefined;
    return { rec, ok: status === undefined ? list.length === 0 : status >= 200 && status < 300, status, message: typeof r?.message === 'string' ? r.message : undefined };
  });
}

/**
 * Envia os cadastros ao Lagom na ordem de dependência. Só envia registros sem erro de
 * compatibilidade e cujo conteúdo mudou desde o último envio confirmado (hash em entity_links).
 * Em dryRun nada é enviado: devolve o que seria enviado.
 */
export class LagomLoader {
  state: LoadState = { status: 'idle', results: [] };
  constructor(private client: LagomClient, private db: PrismaClient, private batchSize: number) {}

  async prepare(options: MappingOptions, resources?: string[]) {
    const plan = buildPlan(await loadBlingData(this.db), options);
    const selected = plan.resources.filter(r => r.records.length && (!resources?.length || resources.includes(r.resource)));
    const links = await this.db.entityLink.findMany({ where: { tenantId: TENANT, sourceSystem: 'BLING', destinationSystem: 'LAGOM', entityType: { in: selected.map(r => r.resource) } }, select: { entityType: true, sourceId: true, recordHash: true } });
    const sentHash = new Map(links.map(l => [`${l.entityType}|${l.sourceId}`, l.recordHash]));
    return selected.map(plan => {
      const eligible = plan.records.filter(r => !r.issues.some(i => i.severity === 'erro'));
      const pending = eligible.filter(r => sentHash.get(`${plan.resource}|${r.code}`) !== r.hash);
      return { plan, eligible, pending, blocked: plan.records.length - eligible.length };
    });
  }

  start(options: MappingOptions, input: { resources?: string[]; dryRun: boolean }) {
    if (this.state.status === 'running') throw new LagomError('LAGOM_LOAD_RUNNING', 409);
    if (!input.dryRun && !this.client.writeEnabled) throw new LagomError('LAGOM_WRITE_DISABLED', 403);
    this.state = { status: 'running', dryRun: input.dryRun, startedAt: new Date().toISOString(), results: [] };
    const run = this.run(options, input);
    void run.catch(error => {
      Object.assign(this.state, { status: 'failed', finishedAt: new Date().toISOString(), errorCode: error instanceof LagomError ? error.code : 'LAGOM_LOAD_FAILED', errorDetail: error instanceof LagomError ? error.details : undefined });
    });
    return this.state;
  }

  private async run(options: MappingOptions, input: { resources?: string[]; dryRun: boolean }) {
    const prepared = await this.prepare(options, input.resources);
    const run = input.dryRun ? undefined : await this.db.integrationRun.create({ data: { jobName: 'bling-to-lagom-cadastros', direction: 'BLING_TO_LAGOM', status: 'PROCESSING' } });
    this.state.runId = run?.id;
    // Linha do tempo da execução em integration_events (lida pela tela de log).
    const log = (action: string, status: 'PROCESSING' | 'CONFIRMED' | 'REJECTED' | 'FAILED', details: J) =>
      run ? this.db.integrationEvent.create({ data: { integrationRunId: run.id, action, status, details: details as Prisma.InputJsonValue } }) : undefined;
    const started = Date.now();
    const toSend = prepared.reduce((a, p) => a + p.pending.length, 0);
    let confirmedTotal = 0, failedTotal = 0;
    let where: J = {};
    try {
      await log('INICIO', 'PROCESSING', { batchSize: this.batchSize, toSend, resources: prepared.map(p => ({ resource: p.plan.resource, title: p.plan.title, operation: p.plan.operationId, total: p.plan.records.length, eligible: p.eligible.length, blocked: p.blocked, unchanged: p.eligible.length - p.pending.length, pending: p.pending.length })) });
      if (run) await this.db.integrationRun.update({ where: { id: run.id }, data: { itemsRead: toSend } });
      for (const { plan, eligible, pending, blocked } of prepared) {
        const result: LoadResourceResult = { resource: plan.resource, operation: plan.operationId, eligible: eligible.length, unchanged: eligible.length - pending.length, blocked, sent: 0, confirmed: 0, rejected: 0, rejections: [] };
        this.state.results.push(result);
        this.state.current = plan.title;
        if (input.dryRun) continue;
        for (let i = 0; i < pending.length; i += this.batchSize) {
          const batch = pending.slice(i, i + this.batchSize);
          where = { resource: plan.resource, title: plan.title, batchStart: i, size: batch.length };
          const t0 = Date.now();
          let outcomes: ReturnType<typeof outcome<MappedRecord>>;
          let batchError: J | undefined;
          try {
            const response = await this.client.call(plan.operationId, batch.map(r => r.payload) as never);
            outcomes = outcome(response, batch);
          } catch (error) {
            // Lote inteiro recusado (400): registra e segue; demais erros (auth, rede) interrompem a carga.
            if (!(error instanceof LagomError) || error.code !== 'LAGOM_BAD_REQUEST') throw error;
            batchError = { code: error.code, status: error.status, detail: error.details };
            outcomes = batch.map(rec => ({ rec, ok: false, status: error.status, message: `Lote recusado: ${typeof error.details === 'string' ? error.details : JSON.stringify(error.details ?? error.code)}`.slice(0, 500) }));
          }
          result.sent += batch.length;
          const ok = outcomes.filter(o => o.ok);
          const rejected = outcomes.filter(o => !o.ok);
          for (const o of rejected) if (result.rejections.length < 200) result.rejections.push({ code: o.rec.code, status: o.status, message: o.message });
          result.confirmed += ok.length; result.rejected += rejected.length;
          confirmedTotal += ok.length; failedTotal += rejected.length;
          await this.recordLinks(plan, ok.map(o => o.rec));
          await log(`PUT ${plan.resource}`, rejected.length ? 'REJECTED' : 'CONFIRMED', { ...where, operation: plan.operationId, durationMs: Date.now() - t0, confirmed: ok.length, rejected: rejected.length, batchError, rejections: rejected.map(o => ({ code: o.rec.code, name: o.rec.name, status: o.status, message: o.message })) });
          if (run) await this.db.integrationRun.update({ where: { id: run.id }, data: { itemsConfirmed: confirmedTotal, itemsFailed: failedTotal } });
        }
      }
      await log('FIM', failedTotal ? 'REJECTED' : 'CONFIRMED', { durationMs: Date.now() - started, confirmed: confirmedTotal, rejected: failedTotal });
      if (run) await this.db.integrationRun.update({ where: { id: run.id }, data: { status: failedTotal ? 'REJECTED' : 'CONFIRMED', finishedAt: new Date(), durationMs: Date.now() - started, itemsConfirmed: confirmedTotal, itemsFailed: failedTotal } });
      Object.assign(this.state, { status: 'done', finishedAt: new Date().toISOString(), current: undefined });
    } catch (error) {
      const code = error instanceof LagomError ? error.code : 'LAGOM_LOAD_FAILED';
      const message = error instanceof Error ? error.message : String(error);
      await Promise.resolve(log('FALHA', 'FAILED', { ...where, code, message, detail: error instanceof LagomError ? error.details : undefined })).catch(() => undefined);
      if (run) await this.db.integrationRun.update({ where: { id: run.id }, data: { status: 'FAILED', finishedAt: new Date(), durationMs: Date.now() - started, itemsConfirmed: confirmedTotal, itemsFailed: failedTotal, errorCode: code, errorMessage: message.slice(0, 1000) } });
      throw error;
    }
  }

  private async recordLinks(plan: ResourcePlan, records: MappedRecord[]) {
    for (let i = 0; i < records.length; i += 500) {
      await this.db.$transaction(records.slice(i, i + 500).map(r => {
        const key = { tenantId: TENANT, entityType: plan.resource, sourceSystem: 'BLING' as const, sourceId: r.code, destinationSystem: 'LAGOM' as const };
        return this.db.entityLink.upsert({ where: { tenantId_entityType_sourceSystem_sourceId_destinationSystem: key }, create: { ...key, destinationId: r.code, canonicalSource: 'BLING', recordHash: r.hash }, update: { recordHash: r.hash, destinationId: r.code } });
      }));
    }
  }
}
