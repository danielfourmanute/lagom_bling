import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { PrismaClient, type Prisma } from '@prisma/client';
import { z } from 'zod';
import type { AppConfig } from './config.js';

export class BlingError extends Error {
  constructor(public code: string, public status = 502, public details?: Record<string, unknown>) { super(code); }
}
export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export function secureEqual(a: string, b: string) { return timingSafeEqual(Buffer.from(hash(a)), Buffer.from(hash(b))); }
export function encrypt(value: string, key: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map(b => b.toString('base64')).join('.');
}
export function decrypt(value: string, key: string) {
  const [iv, tag, ciphertext] = value.split('.').map(s => Buffer.from(s, 'base64'));
  if (!iv || !tag || !ciphertext) throw new BlingError('TOKEN_STORAGE_INVALID', 500);
  const decipher = createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
const TokenSchema = z.object({ access_token: z.string().min(1), refresh_token: z.string().min(1), expires_in: z.number().positive(), scope: z.string().optional() });
const identity = { provider: 'BLING' as const, accountKey: 'default' };
const where = { provider_accountKey: identity };

export class BlingConnection {
  /** Eventos do ciclo do token (sem segredos), para diagnóstico nos logs. */
  onEvent: (event: 'TOKEN_REFRESHED' | 'TOKEN_REFRESH_REJECTED' | 'TOKEN_REFRESH_FAILED' | 'ACCESS_TOKEN_REJECTED', detail?: Record<string, unknown>) => void = () => {};
  constructor(private config: AppConfig, readonly db = new PrismaClient(), private http: typeof fetch = fetch) {}
  private async locked<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(63817421)`;
      return fn(tx);
    }, { timeout: 25000, maxWait: 30000 });
  }
  async start() {
    const state = randomBytes(32).toString('hex');
    const session = randomBytes(32).toString('hex');
    await this.db.oAuthState.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    await this.db.oAuthState.create({ data: { stateHash: hash(state), sessionHash: hash(session), expiresAt: new Date(Date.now() + 600000) } });
    const url = new URL(this.config.BLING_OAUTH_AUTHORIZE_URL);
    url.search = new URLSearchParams({ response_type: 'code', client_id: this.config.BLING_CLIENT_ID, state }).toString();
    return { url: url.toString(), session };
  }
  private async exchange(params: Record<string, string>) {
    let response: Response;
    try {
      response = await this.http(this.config.BLING_OAUTH_TOKEN_URL, {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
        headers: { Authorization: 'Basic ' + Buffer.from(`${this.config.BLING_CLIENT_ID}:${this.config.BLING_CLIENT_SECRET}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: new URLSearchParams(params),
      });
    } catch { throw new BlingError('BLING_UNAVAILABLE'); }
    if (!response.ok) {
      const payload = await response.json().catch(() => ({})) as { error?: string | { type?: string } };
      const kind = typeof payload.error === 'string' ? payload.error : payload.error?.type;
      throw new BlingError(kind === 'invalid_grant' ? 'RECONNECT_REQUIRED' : kind === 'invalid_client' ? 'CLIENT_CREDENTIALS_INVALID' : 'BLING_OAUTH_FAILED');
    }
    const result = TokenSchema.safeParse(await response.json());
    if (!result.success) throw new BlingError('BLING_RESPONSE_INVALID');
    return result.data;
  }
  private async save(tx: Prisma.TransactionClient, token: z.infer<typeof TokenSchema>) {
    const data = {
      status: 'ACTIVE' as const,
      accessTokenCiphertext: encrypt(token.access_token, this.config.TOKEN_ENCRYPTION_KEY),
      refreshTokenCiphertext: encrypt(token.refresh_token, this.config.TOKEN_ENCRYPTION_KEY),
      accessTokenExpiresAt: new Date(Date.now() + token.expires_in * 1000),
      scopes: token.scope?.split(/\s+/).filter(Boolean) ?? [], lastRefreshAt: new Date(),
    };
    await tx.oAuthConnection.upsert({ where, create: { ...identity, ...data }, update: data });
  }
  async complete(state: string, session: string, code: string) {
    const consumed = await this.db.oAuthState.deleteMany({ where: { stateHash: hash(state), sessionHash: hash(session), expiresAt: { gt: new Date() } } });
    if (consumed.count !== 1) throw new BlingError('OAUTH_STATE_INVALID', 400);
    await this.locked(async tx => this.save(tx, await this.exchange({ grant_type: 'authorization_code', code })));
  }
  async status() {
    const connection = await this.db.oAuthConnection.findUnique({ where, select: { status: true, accessTokenExpiresAt: true, lastRefreshAt: true } });
    return connection ?? { status: 'PENDING' };
  }
  async accessToken() {
    const token = await this.locked(async tx => {
      const connection = await tx.oAuthConnection.findUnique({ where });
      if (connection?.status !== 'ACTIVE' || !connection.refreshTokenCiphertext) return null;
      if (connection.accessTokenCiphertext && connection.accessTokenExpiresAt && connection.accessTokenExpiresAt.getTime() > Date.now() + 120000) return decrypt(connection.accessTokenCiphertext, this.config.TOKEN_ENCRYPTION_KEY);
      try {
        const next = await this.exchange({ grant_type: 'refresh_token', refresh_token: decrypt(connection.refreshTokenCiphertext, this.config.TOKEN_ENCRYPTION_KEY) });
        await this.save(tx, next);
        this.onEvent('TOKEN_REFRESHED', { expiresInSeconds: next.expires_in });
        return next.access_token;
      } catch (error) {
        if (error instanceof BlingError && error.code === 'RECONNECT_REQUIRED') {
          this.onEvent('TOKEN_REFRESH_REJECTED');
          await tx.oAuthConnection.update({ where, data: { status: 'EXPIRED' } });
          return null;
        }
        this.onEvent('TOKEN_REFRESH_FAILED', { code: error instanceof BlingError ? error.code : 'UNKNOWN' });
        throw error;
      }
    });
    if (!token) throw new BlingError('RECONNECT_REQUIRED', 409);
    return token;
  }
  private nextSlot = 0;
  // Quota Bling é global por conta: espaça as chamadas deste processo.
  private async throttle() {
    const interval = 1000 / Math.max(1, this.config.BLING_RATE_LIMIT_PER_SECOND);
    const now = Date.now();
    const wait = Math.max(0, this.nextSlot - now);
    this.nextSlot = Math.max(now, this.nextSlot) + interval;
    if (wait) await new Promise(r => setTimeout(r, wait));
  }
  /** Leitura GET autenticada; `path` é relativo à base v3 e já deve estar codificado. */
  async read(path: string, query: URLSearchParams, forbiddenCode = 'SCOPE_REQUIRED') {
    let token = await this.accessToken();
    const read = async () => {
      await this.throttle();
      const qs = query.toString();
      try {
        return await this.http(this.config.BLING_API_BASE_URL + path + (qs ? '?' + qs : ''), { method: 'GET', redirect: 'error', signal: AbortSignal.timeout(this.config.REQUEST_TIMEOUT_MS), headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
      } catch { throw new BlingError('BLING_UNAVAILABLE'); }
    };
    let response = await read();
    if (response.status === 401) {
      await response.body?.cancel();
      this.onEvent('ACCESS_TOKEN_REJECTED', { path });
      // Invalidate only the rejected token; another process may already have renewed it.
      await this.locked(async tx => {
        const current = await tx.oAuthConnection.findUnique({ where });
        if (current?.accessTokenCiphertext && secureEqual(decrypt(current.accessTokenCiphertext, this.config.TOKEN_ENCRYPTION_KEY), token)) {
          await tx.oAuthConnection.update({ where, data: { accessTokenExpiresAt: new Date(0) } });
        }
      });
      token = await this.accessToken();
      response = await read(); // Only a read is repeated, once.
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: { type?: unknown; message?: unknown; description?: unknown; fields?: unknown } } | null;
      const e = payload?.error;
      // Repassa apenas a mensagem de erro da Bling (sem cabeçalhos nem tokens).
      const blingError = e && typeof e === 'object' ? { type: e.type, message: e.message, description: e.description, fields: e.fields } : undefined;
      const code = response.status === 403 ? forbiddenCode : response.status === 401 ? 'ACCESS_REJECTED' : response.status === 429 ? 'BLING_RATE_LIMIT' : response.status === 404 ? 'BLING_NOT_FOUND' : response.status === 400 || response.status === 422 ? 'BLING_BAD_REQUEST' : 'BLING_READ_FAILED';
      throw new BlingError(code, [400, 403, 404, 422, 429].includes(response.status) ? response.status : 502, { httpStatus: response.status, blingError });
    }
    return response;
  }
  private readProducts(query: URLSearchParams) { return this.read('/produtos', query, 'PRODUCT_SCOPE_REQUIRED'); }
  async test() {
    const response = await this.readProducts(new URLSearchParams({ pagina: '1', limite: '1' }));
    await response.body?.cancel();
    return { connected: true, httpStatus: response.status };
  }
  async products(filters: { pagina: number; limite: number; nome?: string; codigo?: string }) {
    const query = new URLSearchParams({ pagina: String(filters.pagina), limite: String(filters.limite) });
    if (filters.nome) query.set('nome', filters.nome);
    if (filters.codigo) query.set('codigo', filters.codigo);
    const response = await this.readProducts(query);
    const schema = z.object({ data: z.array(z.object({
      id: z.union([z.number(), z.string()]), nome: z.string(), codigo: z.string().optional(),
      preco: z.number().nullable().optional(), unidade: z.string().optional(), situacao: z.string().optional(),
    })) });
    const result = schema.safeParse(await response.json().catch(() => null));
    if (!result.success) throw new BlingError('BLING_RESPONSE_INVALID');
    return { data: result.data.data, pagina: filters.pagina, limite: filters.limite, hasMore: result.data.data.length === filters.limite };

  }
  async maintain() {
    if ((await this.status()).status === 'ACTIVE') await this.accessToken();
  }
}
