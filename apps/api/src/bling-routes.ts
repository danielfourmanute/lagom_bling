import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { AppConfig } from './config.js';
import { BlingConnection, BlingError, secureEqual } from './bling.js';
import { buildBlingRequest } from './bling-explorer.js';
import { blingEndpoints } from './generated/bling-get-catalog.js';

export async function registerBling(app: FastifyInstance, config: AppConfig, connection = new BlingConnection(config)) {
  connection.onEvent = (event, detail) => {
    const msg = { TOKEN_REFRESHED: 'Token Bling renovado automaticamente', TOKEN_REFRESH_REJECTED: 'Bling recusou o refresh token: nova autorização necessária', TOKEN_REFRESH_FAILED: 'Falha temporária ao renovar token Bling; nova tentativa em 60s', ACCESS_TOKEN_REJECTED: 'Bling recusou o access token; renovando e repetindo a leitura' }[event];
    app.log[event === 'TOKEN_REFRESHED' ? 'info' : event === 'TOKEN_REFRESH_REJECTED' ? 'error' : 'warn']({ event, ...detail }, msg);
  };
  const cookieName = 'bling_oauth_session';
  const session = (req: FastifyRequest) => req.headers.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith(cookieName + '='))?.slice(cookieName.length + 1) ?? '';
  const callback = new URL(config.BLING_REDIRECT_URI);
  const cookie = (value: string, age: number) => `${cookieName}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}${config.NODE_ENV === 'production' ? '; Secure' : ''}`;
  const admin = async (req: FastifyRequest) => {
    if (!secureEqual(req.headers.authorization ?? '', `Bearer ${config.ADMIN_API_TOKEN}`)) throw new BlingError('UNAUTHORIZED', 401);
  };
  app.addHook('onSend', async (request, reply) => {
    if (request.url.startsWith('/api/bling') || request.url.split('?')[0] === callback.pathname) {
      reply.header('Cache-Control', 'no-store').header('Referrer-Policy', 'no-referrer');
    }
  });
  app.post('/api/bling/connect', { preHandler: admin }, async (_req, reply) => {
    const started = await connection.start();
    return reply.header('Set-Cookie', cookie(started.session, 600)).send({ authorizationUrl: started.url });
  });
  app.post('/api/bling/complete', { preHandler: admin }, async (req, reply) => {
    const parsed = z.object({ callbackUrl: z.url().max(4096) }).safeParse(req.body);
    if (!parsed.success) throw new BlingError('OAUTH_CALLBACK_INVALID', 400);
    const received = new URL(parsed.data.callbackUrl);
    if (received.origin !== callback.origin || received.pathname !== callback.pathname) throw new BlingError('OAUTH_CALLBACK_INVALID', 400);
    const state = received.searchParams.get('state');
    const code = received.searchParams.get('code');
    if (!state || !code || received.searchParams.has('error')) throw new BlingError('OAUTH_CALLBACK_INVALID_OR_DENIED', 400);
    await connection.complete(state, session(req), code);
    return reply.header('Set-Cookie', cookie('', 0)).send({ connected: true });
  });
  app.get('/api/bling/status', { preHandler: admin }, async () => connection.status());
  // Also supports the currently registered root callback; no need to paste codes.
  const callbackPaths = [...new Set([callback.pathname, '/api/bling/callback'])];
  for (const path of callbackPaths) app.get(path, async (req, reply) => {
    reply.header('Set-Cookie', cookie('', 0));
    const parsed = z.object({ state: z.string().min(1).max(256), code: z.string().min(1).max(1024) }).safeParse(req.query);
    if (!parsed.success) throw new BlingError('OAUTH_CALLBACK_INVALID_OR_DENIED', 400);
    await connection.complete(parsed.data.state, session(req), parsed.data.code);
    return reply.type('text/html').send('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Bling conectada</title><p>Bling conectada. Volte ao painel e clique em Atualizar ou Testar conexão.</p></html>');
  });
  app.get('/api/bling/products', { preHandler: admin }, async (req) => {
    const parsed = z.object({
      pagina: z.coerce.number().int().min(1).max(100000).default(1),
      limite: z.coerce.number().int().min(1).max(100).default(25),
      nome: z.string().trim().max(200).optional(),
      codigo: z.string().trim().max(100).optional(),
    }).strict().safeParse(req.query);
    if (!parsed.success) throw new BlingError('PRODUCT_FILTERS_INVALID', 400);
    return connection.products(parsed.data);
  });
  app.post('/api/bling/test', { preHandler: admin }, async () => connection.test());
  // Explorador somente leitura: apenas GET, apenas endpoints e parâmetros do catálogo oficial.
  app.get('/api/bling/catalog', { preHandler: admin }, async () => ({ total: blingEndpoints.length, endpoints: blingEndpoints }));
  app.get<{ Params: { endpointId: string } }>('/api/bling/v3/:endpointId', { preHandler: admin }, async (req, reply) => {
    const { path, query } = buildBlingRequest(req.params.endpointId, new URL(req.url, 'http://localhost').searchParams);
    const response = await connection.read(path, query);
    const text = await response.text();
    try { return reply.type('application/json').send(text ? JSON.parse(text) : {}); }
    catch { throw new BlingError('BLING_RESPONSE_INVALID'); }
  });
  app.addHook('onReady', async () => {
    try { await connection.maintain(); }
    catch (error) { app.log.warn({ code: error instanceof BlingError ? error.code : 'BLING_MAINTENANCE_FAILED' }, 'Conexão Bling será verificada novamente automaticamente'); }
  });
  let running = false;
  const timer = setInterval(async () => {
    if (running) return;
    running = true;
    try { await connection.maintain(); }
    catch (error) { app.log.warn({ code: error instanceof BlingError ? error.code : 'BLING_MAINTENANCE_FAILED' }, 'Falha na manutenção da conexão Bling'); }
    finally { running = false; }
  }, 60000);
  timer.unref();
  app.addHook('onClose', async () => { clearInterval(timer); await connection.db.$disconnect(); });
}
