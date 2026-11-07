import { randomBytes } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import Fastify from 'fastify';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { BlingConnection, BlingError, decrypt, encrypt } from '../src/bling.js';
import { registerBling } from '../src/bling-routes.js';
import { loadConfig } from '../src/config.js';

const key = randomBytes(32).toString('hex');
const config = loadConfig({ NODE_ENV: 'test', LOG_LEVEL: 'silent', BLING_OAUTH_ENABLED: 'true', TOKEN_ENCRYPTION_KEY: key, ADMIN_API_TOKEN: 'a'.repeat(48), BLING_CLIENT_ID: 'client', BLING_CLIENT_SECRET: 'secret', BLING_REDIRECT_URI: 'http://localhost:3000/api/bling/callback' });
const token = (suffix: string, expires = 3600) => new Response(JSON.stringify({ access_token: 'access-' + suffix, refresh_token: 'refresh-' + suffix, expires_in: expires, scope: 'products' }));

describe('Token encryption and configuration', () => {
  it('uses authenticated encryption and a unique IV; rejects tampering and wrong keys', () => {
    const encrypted = encrypt('secret-token', key);
    expect(decrypt(encrypted, key)).toBe('secret-token');
    expect(encrypt('secret-token', key)).not.toBe(encrypted);
    const pieces = encrypted.split('.');
    pieces[2] = Buffer.from('tampered').toString('base64');
    expect(() => decrypt(pieces.join('.'), key)).toThrow();
    expect(() => decrypt(encrypted, randomBytes(32).toString('hex'))).toThrow();
  });
  it('rejects incomplete configuration and unofficial token destinations', () => {
    expect(() => loadConfig({ BLING_OAUTH_ENABLED: 'true' })).toThrow();
    expect(() => loadConfig({ ...config, BLING_OAUTH_ENABLED: 'true', BLING_OAUTH_TOKEN_URL: 'https://example.com/token' } as unknown as NodeJS.ProcessEnv)).toThrow();
  });
});

const integration = process.env.TEST_DATABASE_URL ? describe : describe.skip;
integration('Bling OAuth with PostgreSQL and simulated provider', () => {
  const db = new PrismaClient({ datasourceUrl: process.env.TEST_DATABASE_URL });
  const http = vi.fn<typeof fetch>();
  const service = new BlingConnection(config, db, http);
  beforeEach(async () => {
    await db.oAuthState.deleteMany();
    await db.oAuthConnection.deleteMany();
    http.mockReset();
  });
  afterAll(async () => db.$disconnect());
  async function connect() {
    const start = await service.start();
    const state = new URL(start.url).searchParams.get('state')!;
    http.mockResolvedValueOnce(token('first'));
    await service.complete(state, start.session, 'valid-code');
    return { start, state };
  }
  it('rejects wrong browser, expired states and replay without contacting Bling', async () => {
    const start = await service.start();
    const state = new URL(start.url).searchParams.get('state')!;
    await expect(service.complete(state, 'wrong', 'code')).rejects.toMatchObject({ code: 'OAUTH_STATE_INVALID' });
    await db.oAuthState.updateMany({ data: { expiresAt: new Date(0) } });
    await expect(service.complete(state, start.session, 'code')).rejects.toMatchObject({ code: 'OAUTH_STATE_INVALID' });
    const connected = await connect();
    await expect(service.complete(connected.state, connected.start.session, 'code')).rejects.toThrow();
    expect(http).toHaveBeenCalledTimes(1);
  });
  it('persists ciphertext across restarts; serializes refreshes and stores rotated tokens', async () => {
    await connect();
    const stored = await db.oAuthConnection.findFirstOrThrow();
    expect(stored.accessTokenCiphertext).not.toContain('access-first');
    expect(decrypt(stored.refreshTokenCiphertext!, key)).toBe('refresh-first');
    await db.oAuthConnection.update({ where: { id: stored.id }, data: { accessTokenExpiresAt: new Date(0) } });
    http.mockResolvedValueOnce(token('renewed'));
    const secondInstance = new BlingConnection(config, db, http);
    expect(await Promise.all([service.accessToken(), secondInstance.accessToken()])).toEqual(['access-renewed', 'access-renewed']);
    expect(http).toHaveBeenCalledTimes(2);
    const body = http.mock.calls[1]![1]!.body as URLSearchParams;
    expect(body.get('refresh_token')).toBe('refresh-first');
    expect(decrypt((await db.oAuthConnection.findFirstOrThrow()).refreshTokenCiphertext!, key)).toBe('refresh-renewed');
  });
  it('marks invalid refresh as expired but preserves active connection on temporary failure', async () => {
    await connect();
    await db.oAuthConnection.updateMany({ data: { accessTokenExpiresAt: new Date(0) } });
    http.mockResolvedValueOnce(new Response('{}', { status: 503 }));
    await expect(service.accessToken()).rejects.toMatchObject({ code: 'BLING_OAUTH_FAILED' });
    expect((await service.status()).status).toBe('ACTIVE');
    http.mockResolvedValueOnce(new Response(JSON.stringify({ error: { type: 'invalid_grant' } }), { status: 400 }));
    await expect(service.accessToken()).rejects.toMatchObject({ code: 'RECONNECT_REQUIRED' });
    expect((await service.status()).status).toBe('EXPIRED');
  });
  it('renews on a rejected access token and repeats only the read once', async () => {
    await connect();
    http.mockResolvedValueOnce(new Response('{}', { status: 401 }));
    http.mockResolvedValueOnce(token('after-401'));
    http.mockResolvedValueOnce(new Response('{"data":[]}'));
    expect(await service.test()).toEqual({ connected: true, httpStatus: 200 });
    expect(http).toHaveBeenCalledTimes(4);
    expect((http.mock.calls[3]![1]!.headers as Record<string, string>).Authorization).toBe('Bearer access-after-401');
  });
  it('completes the local fallback only with matching callback, admin key and browser cookie', async () => {
    const app = Fastify({ logger: false });
    app.setErrorHandler((error, _req, reply) => reply.status(error instanceof BlingError ? error.status : 500).send({ code: error.message }));
    await registerBling(app, config, service);
    try {
      const headers = { authorization: `Bearer ${config.ADMIN_API_TOKEN}` };
      const start = await app.inject({ method: 'POST', url: '/api/bling/connect', headers });
      const state = new URL(start.json().authorizationUrl).searchParams.get('state');
      const callbackUrl = config.BLING_REDIRECT_URI + '?code=valid&state=' + state;
      const cookie = `${start.cookies[0]!.name}=${start.cookies[0]!.value}`;
      const wrongOrigin = await app.inject({ method: 'POST', url: '/api/bling/complete', headers: { ...headers, cookie }, payload: { callbackUrl: callbackUrl.replace('localhost', 'attacker.example') } });
      expect(wrongOrigin.statusCode).toBe(400);
      expect((await app.inject({ method: 'POST', url: '/api/bling/complete', headers, payload: { callbackUrl } })).statusCode).toBe(400);
      expect(http).not.toHaveBeenCalled();
      http.mockResolvedValueOnce(token('manual'));
      const result = await app.inject({ method: 'POST', url: '/api/bling/complete', headers: { ...headers, cookie }, payload: { callbackUrl } });
      expect(result.json()).toEqual({ connected: true });
      expect((await service.status()).status).toBe('ACTIVE');
    } finally { await app.close(); }
  });
  it('automatically renews a restored connection when the API starts', async () => {
    await connect();
    await db.oAuthConnection.updateMany({ data: { accessTokenExpiresAt: new Date(0) } });
    http.mockResolvedValueOnce(token('startup'));
    const app = Fastify({ logger: false });
    await registerBling(app, config, new BlingConnection(config, db, http));
    try {
      await app.ready();
      expect(http).toHaveBeenCalledTimes(2);
      expect(decrypt((await db.oAuthConnection.findFirstOrThrow()).accessTokenCiphertext!, key)).toBe('access-startup');
      expect((await service.status()).status).toBe('ACTIVE');
    } finally { await app.close(); }
  });
  it('lists only allowed product fields, encodes filters and preserves pagination', async () => {
    await connect();
    http.mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ id: 12, nome: 'Tinta & azul', codigo: 'SKU/1', unidade: 'UN', situacao: 'A', preco: 0, precoCusto: 80, private: 'hidden' }] })));
    const result = await service.products({ pagina: 2, limite: 1, nome: 'Tinta & azul', codigo: 'SKU/1' });
    expect(result).toEqual({ data: [{ id: 12, nome: 'Tinta & azul', codigo: 'SKU/1', unidade: 'UN', situacao: 'A', preco: 0 }], pagina: 2, limite: 1, hasMore: true });
    const url = new URL(String(http.mock.calls[1]![0]));
    expect(url.pathname).toBe('/Api/v3/produtos');
    expect(Object.fromEntries(url.searchParams)).toEqual({ pagina: '2', limite: '1', nome: 'Tinta & azul', codigo: 'SKU/1' });
    http.mockResolvedValueOnce(new Response('{"data":[]}'));
    expect(await service.products({ pagina: 3, limite: 1 })).toEqual({ data: [], pagina: 3, limite: 1, hasMore: false });
  });
  it('rejects invalid product responses and missing permission without leaking payloads', async () => {
    await connect();
    http.mockResolvedValueOnce(new Response('{"data":"wrong"}'));
    await expect(service.products({ pagina: 1, limite: 25 })).rejects.toMatchObject({ code: 'BLING_RESPONSE_INVALID' });
    http.mockResolvedValueOnce(new Response('{"secret":"do-not-return"}', { status: 403 }));
    await expect(service.products({ pagina: 1, limite: 25 })).rejects.toMatchObject({ code: 'PRODUCT_SCOPE_REQUIRED' });
  });
  it('protects product queries and rejects invalid filters before calling Bling', async () => {
    const app = Fastify({ logger: false });
    app.setErrorHandler((error, _req, reply) => reply.status(error instanceof BlingError ? error.status : 500).send({ code: error.message }));
    await registerBling(app, config, service);
    try {
      expect((await app.inject({ url: '/api/bling/products' })).statusCode).toBe(401);
      const headers = { authorization: `Bearer ${config.ADMIN_API_TOKEN}` };
      for (const query of ['pagina=0', 'limite=101', 'pagina=1.5', 'url=https://example.com', 'nome=' + 'x'.repeat(201)]) {
        const response = await app.inject({ url: '/api/bling/products?' + query, headers });
        expect(response.statusCode).toBe(400);
      }
      expect(http).not.toHaveBeenCalled();
      expect((await app.inject({ url: '/api/bling/products', headers })).statusCode).toBe(409);
      expect(http).not.toHaveBeenCalled();
    } finally { await app.close(); }
  });
  it('protects administrative routes, completes cookie-bound callback, returns no tokens or product data', async () => {
    const app = Fastify({ logger: false });
    app.setErrorHandler((error, _req, reply) => reply.status(error instanceof BlingError ? error.status : 500).send({ code: error.message }));
    await registerBling(app, config, service);
    try {
      expect((await app.inject({ method: 'POST', url: '/api/bling/connect' })).statusCode).toBe(401);
      const headers = { authorization: `Bearer ${config.ADMIN_API_TOKEN}` };
      const started = await app.inject({ method: 'POST', url: '/api/bling/connect', headers });
      const state = new URL(started.json().authorizationUrl).searchParams.get('state');
      expect(started.cookies[0]!.httpOnly).toBe(true);
      http.mockResolvedValueOnce(token('route'));
      const callback = await app.inject({ url: '/api/bling/callback?code=code&state=' + state, headers: { cookie: `${started.cookies[0]!.name}=${started.cookies[0]!.value}` } });
      expect(callback.statusCode).toBe(200);
      expect(callback.headers['cache-control']).toBe('no-store');
      http.mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ id: 123, nome: 'Private product' }] })));
      const result = await app.inject({ method: 'POST', url: '/api/bling/test', headers });
      expect(result.json()).toEqual({ connected: true, httpStatus: 200 });
      const status = await app.inject({ url: '/api/bling/status', headers });
      expect(status.body).not.toContain('access-route');
      expect(status.body).not.toContain('refresh-route');
    } finally { await app.close(); }
  });
});
