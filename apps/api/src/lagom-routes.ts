import type { PrismaClient, Prisma } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { adminGuard } from './auth.js';
import { BlingError, type BlingConnection } from './bling.js';
import { BlingSnapshot } from './bling-snapshot.js';
import { buildPlan, defaultMappingOptions, MappingOptionsSchema, summarize, type MappingOptions } from './bling-lagom-mapping.js';
import type { AppConfig } from './config.js';
import { lagomOperations, lagomSchemas, type LagomOperationId } from './generated/lagom-catalog.js';
import { LagomClient, LagomError, lagomOperation } from './lagom.js';
import { LagomLoader, loadBlingData } from './lagom-load.js';

const OPTIONS_KEY = { direction: 'BLING_TO_LAGOM' as const, resource: 'cadastros' };

export async function registerLagom(app: FastifyInstance, config: AppConfig, deps: { db: PrismaClient; bling?: BlingConnection; client?: LagomClient }) {
  const { db } = deps;
  const client = deps.client ?? new LagomClient(config);
  client.onEvent = (event, detail) => app.log[event === 'REFRESH_FAILED' || event === 'TOKEN_REJECTED' ? 'warn' : 'info']({ event, ...detail }, `Lagom: ${event}`);
  const snapshot = deps.bling ? new BlingSnapshot(deps.bling, db, app.log) : undefined;
  const loader = new LagomLoader(client, db, config.LAGOM_BATCH_SIZE);
  const admin = adminGuard(config);

  app.addHook('onSend', async (request, reply) => { if (request.url.startsWith('/api/lagom')) reply.header('Cache-Control', 'no-store'); });

  /* Conexão e catálogo */
  app.get('/api/lagom/status', { preHandler: admin }, async () => client.status());
  app.post('/api/lagom/test', { preHandler: admin }, async () => client.test());
  app.get('/api/lagom/catalog', { preHandler: admin }, async () => ({ total: lagomOperations.length, operations: lagomOperations, schemas: lagomSchemas }));
  // Executa qualquer operação do catálogo (exceto login). Escritas exigem LAGOM_WRITE_ENABLED=true.
  app.post<{ Params: { id: string } }>('/api/lagom/op/:id', { preHandler: admin, bodyLimit: 10 * 1024 * 1024 }, async (req) => {
    const op = lagomOperation(req.params.id);
    const parsed = z.object({ body: z.unknown().optional() }).strict().safeParse(req.body ?? {});
    if (!parsed.success) throw new LagomError('LAGOM_BODY_INVALID', 400);
    if (op.body && op.body.array && !Array.isArray(parsed.data.body)) throw new LagomError('LAGOM_BODY_INVALID', 400, { reason: 'esperada uma lista' });
    if (op.body && !op.body.array && (typeof parsed.data.body !== 'object' || parsed.data.body === null || Array.isArray(parsed.data.body))) throw new LagomError('LAGOM_BODY_INVALID', 400, { reason: 'esperado um objeto' });
    const startedAt = Date.now();
    const data = await client.call(op.id as LagomOperationId, (op.body ? parsed.data.body : undefined) as never);
    return { operation: `${op.method} ${op.path}`, durationMs: Date.now() - startedAt, count: Array.isArray(data) ? data.length : undefined, data };
  });

  /* Snapshot Bling */
  const requireSnapshot = () => { if (!snapshot) throw new BlingError('BLING_NOT_ENABLED', 409); return snapshot; };
  app.get('/api/lagom/snapshot', { preHandler: admin }, async () => ({ state: snapshot?.state ?? { status: 'idle' }, ...(snapshot ? await snapshot.counts() : {}) }));
  app.post('/api/lagom/snapshot', { preHandler: admin }, async (req) => {
    const parsed = z.object({ mode: z.enum(['incremental', 'full']).default('incremental') }).strict().safeParse(req.body ?? {});
    if (!parsed.success) throw new LagomError('SNAPSHOT_OPTIONS_INVALID', 400);
    return { state: requireSnapshot().start(parsed.data.mode) };
  });

  /* Decisões de mapeamento (persistidas) */
  async function readOptions(): Promise<MappingOptions> {
    const row = await db.integrationConfiguration.findUnique({ where: { direction_resource: OPTIONS_KEY } });
    const parsed = MappingOptionsSchema.safeParse(row?.settings ?? {});
    return parsed.success ? parsed.data : defaultMappingOptions();
  }
  app.get('/api/lagom/options', { preHandler: admin }, async () => ({ options: await readOptions(), defaults: defaultMappingOptions() }));
  app.put('/api/lagom/options', { preHandler: admin }, async (req) => {
    const parsed = MappingOptionsSchema.safeParse(req.body ?? {});
    if (!parsed.success) throw new LagomError('MAPPING_OPTIONS_INVALID', 400, { issues: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) });
    const settings = parsed.data as unknown as Prisma.InputJsonValue;
    await db.integrationConfiguration.upsert({ where: { direction_resource: OPTIONS_KEY }, create: { ...OPTIONS_KEY, name: 'Cadastros Bling → Lagom', settings, enabled: false, dryRun: true }, update: { settings } });
    cache = undefined;
    return { options: parsed.data };
  });

  /* Compatibilidade (relatório calculado sobre o snapshot) */
  let cache: { key: string; at: string; plan: ReturnType<typeof buildPlan> } | undefined;
  async function currentPlan() {
    const options = await readOptions();
    const latest = await db.sourceRecord.aggregate({ where: { system: 'BLING' }, _max: { fetchedAt: true }, _count: { _all: true } });
    const key = JSON.stringify(options) + latest._max.fetchedAt?.toISOString() + latest._count._all;
    if (cache?.key !== key) cache = { key, at: new Date().toISOString(), plan: buildPlan(await loadBlingData(db), options) };
    return { ...cache, options, snapshotAt: latest._max.fetchedAt?.toISOString() ?? null, records: latest._count._all };
  }
  app.get('/api/lagom/compat', { preHandler: admin }, async () => {
    const { plan, at, options, snapshotAt, records } = await currentPlan();
    const resources = plan.resources.map(summarize);
    const totals = resources.reduce((t, r) => ({ total: t.total + r.total, ready: t.ready + r.ready, withErrors: t.withErrors + r.withErrors, skipped: t.skipped + r.skipped }), { total: 0, ready: 0, withErrors: 0, skipped: 0 });
    return { generatedAt: at, snapshotAt, snapshotRecords: records, options, totals, findings: plan.findings, resources };
  });
  app.get<{ Params: { resource: string } }>('/api/lagom/compat/:resource', { preHandler: admin }, async (req) => {
    const q = z.object({
      filter: z.enum(['all', 'erro', 'aviso', 'ok', 'skipped']).default('all'), code: z.string().max(60).optional(), search: z.string().trim().max(120).optional(),
      pagina: z.coerce.number().int().min(1).default(1), limite: z.coerce.number().int().min(1).max(200).default(50),
    }).strict().safeParse(req.query);
    if (!q.success) throw new LagomError('COMPAT_FILTERS_INVALID', 400);
    const { plan } = await currentPlan();
    const resource = plan.resources.find(r => r.resource === req.params.resource);
    if (!resource) throw new LagomError('LAGOM_RESOURCE_UNKNOWN', 404);
    const { filter, code, search, pagina, limite } = q.data;
    const term = search?.toLowerCase();
    if (filter === 'skipped') {
      const rows = resource.skipped.filter(k => !term || k.name.toLowerCase().includes(term) || k.sourceId.includes(term));
      return { total: rows.length, pagina, limite, skipped: rows.slice((pagina - 1) * limite, pagina * limite) };
    }
    const rows = resource.records.filter(r =>
      (filter === 'all' || (filter === 'ok' ? !r.issues.some(i => i.severity === 'erro') : r.issues.some(i => i.severity === filter)))
      && (!code || r.issues.some(i => i.code === code))
      && (!term || r.name.toLowerCase().includes(term) || r.code.includes(term)));
    return { total: rows.length, pagina, limite, records: rows.slice((pagina - 1) * limite, pagina * limite) };
  });

  /* Carga no Lagom */
  app.get('/api/lagom/load', { preHandler: admin }, async () => ({ state: loader.state, writeEnabled: client.writeEnabled }));
  app.post('/api/lagom/load', { preHandler: admin }, async (req) => {
    const parsed = z.object({ resources: z.array(z.string().max(60)).max(30).optional(), dryRun: z.boolean().default(true) }).strict().safeParse(req.body ?? {});
    if (!parsed.success) throw new LagomError('LAGOM_LOAD_OPTIONS_INVALID', 400);
    return { state: loader.start(await readOptions(), parsed.data) };
  });

  /* Log das cargas (integration_runs + integration_events) */
  app.get('/api/lagom/runs', { preHandler: admin }, async (req) => {
    const q = z.object({ pagina: z.coerce.number().int().min(1).default(1), limite: z.coerce.number().int().min(1).max(100).default(20) }).strict().safeParse(req.query);
    if (!q.success) throw new LagomError('RUNS_FILTERS_INVALID', 400);
    const { pagina, limite } = q.data;
    const where = { jobName: 'bling-to-lagom-cadastros' };
    const [total, runs] = await Promise.all([
      db.integrationRun.count({ where }),
      db.integrationRun.findMany({ where, orderBy: { startedAt: 'desc' }, skip: (pagina - 1) * limite, take: limite, include: { _count: { select: { events: true } } } }),
    ]);
    return { total, pagina, limite, live: loader.state.status === 'running' ? loader.state.runId ?? null : null, runs };
  });
  app.get<{ Params: { id: string } }>('/api/lagom/runs/:id', { preHandler: admin }, async (req) => {
    if (!z.string().uuid().safeParse(req.params.id).success) throw new LagomError('RUN_NOT_FOUND', 404);
    const run = await db.integrationRun.findUnique({ where: { id: req.params.id }, include: { events: { orderBy: { createdAt: 'asc' } } } });
    if (!run) throw new LagomError('RUN_NOT_FOUND', 404);
    const live = loader.state.status === 'running' && loader.state.runId === run.id;
    const { events, ...summary } = run;
    return { run: summary, live, current: live ? loader.state.current ?? null : null, events };
  });
}
