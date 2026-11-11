import { z } from 'zod';
import type { AppConfig } from './config.js';
import { lagomOperations, type LagomOperation, type LagomOperationId, type LagomOperationMap } from './generated/lagom-catalog.js';

export class LagomError extends Error {
  constructor(public code: string, public status = 502, public details?: Record<string, unknown>) { super(code); }
}

const TokenPair = z.object({ accessToken: z.string().min(1), refreshToken: z.string().min(1) });
type Session = { accessToken: string; refreshToken: string; accessExpiresAt: number; refreshExpiresAt: number };
const byId = new Map(lagomOperations.map(o => [o.id, o]));

/** Expiração de um JWT (sem validar assinatura: só para saber quando renovar). */
export function jwtExpiry(token: string): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8')) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : 0;
  } catch { return 0; }
}

export function lagomOperation(id: string): LagomOperation {
  const op = byId.get(id);
  if (!op || op.kind === 'auth') throw new LagomError('LAGOM_OPERATION_UNKNOWN', 404);
  return op;
}

/**
 * Cliente da Integration API do Lagom DRP. Autentica com organização + token (PUT /login),
 * mantém o JWT só em memória e renova com POST /login/refresh antes de expirar; se o refresh
 * falhar, faz login de novo. Operações que escrevem exigem LAGOM_WRITE_ENABLED=true.
 */
export class LagomClient {
  private session?: Session;
  private pending?: Promise<Session>;
  onEvent: (event: 'LOGIN' | 'REFRESH' | 'REFRESH_FAILED' | 'TOKEN_REJECTED', detail?: Record<string, unknown>) => void = () => {};
  constructor(private config: AppConfig, private http: typeof fetch = fetch) {}

  get configured() { return Boolean(this.config.LAGOM_ORGANIZATION && this.config.LAGOM_TOKEN); }
  get writeEnabled() { return this.config.LAGOM_WRITE_ENABLED; }

  private async post(path: string, method: 'PUT' | 'POST', body: unknown) {
    try {
      return await this.http(this.config.LAGOM_API_BASE_URL + path, {
        method, redirect: 'error', signal: AbortSignal.timeout(this.config.LAGOM_TIMEOUT_MS),
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body),
      });
    } catch { throw new LagomError('LAGOM_UNAVAILABLE'); }
  }
  private async tokens(response: Response): Promise<Session> {
    const parsed = TokenPair.safeParse(await response.json().catch(() => null));
    if (!parsed.success) throw new LagomError('LAGOM_RESPONSE_INVALID');
    const { accessToken, refreshToken } = parsed.data;
    return { accessToken, refreshToken, accessExpiresAt: jwtExpiry(accessToken), refreshExpiresAt: jwtExpiry(refreshToken) };
  }
  private async login(): Promise<Session> {
    if (!this.configured) throw new LagomError('LAGOM_NOT_CONFIGURED', 409);
    const response = await this.post('/login', 'PUT', { organization: this.config.LAGOM_ORGANIZATION, token: this.config.LAGOM_TOKEN });
    if (response.status === 401 || response.status === 400) { await response.body?.cancel(); throw new LagomError('LAGOM_CREDENTIALS_INVALID', 409); }
    if (!response.ok) { await response.body?.cancel(); throw new LagomError('LAGOM_LOGIN_FAILED', 502, { httpStatus: response.status }); }
    this.onEvent('LOGIN');
    return this.tokens(response);
  }
  private async refresh(current: Session): Promise<Session> {
    const response = await this.post('/login/refresh', 'POST', { refreshToken: current.refreshToken });
    if (!response.ok) { await response.body?.cancel(); throw new LagomError('LAGOM_REFRESH_FAILED', 502, { httpStatus: response.status }); }
    this.onEvent('REFRESH');
    return this.tokens(response);
  }
  /** Token válido por pelo menos mais 2 minutos; chamadas concorrentes partilham o mesmo login/refresh. */
  async accessToken(force = false): Promise<string> {
    const margin = Date.now() + 120_000;
    if (!force && this.session && this.session.accessExpiresAt > margin) return this.session.accessToken;
    this.pending ??= (async () => {
      const current = this.session;
      if (current && current.refreshExpiresAt > margin) {
        try { return await this.refresh(current); }
        catch (error) { this.onEvent('REFRESH_FAILED', { code: error instanceof LagomError ? error.code : 'UNKNOWN' }); }
      }
      return this.login();
    })().then(s => (this.session = s), e => { this.session = undefined; throw e; }).finally(() => { this.pending = undefined; });
    return (await this.pending).accessToken;
  }
  status() {
    return {
      configured: this.configured, organization: this.config.LAGOM_ORGANIZATION || null, baseUrl: this.config.LAGOM_API_BASE_URL,
      writeEnabled: this.writeEnabled, authenticated: Boolean(this.session && this.session.accessExpiresAt > Date.now()),
      accessTokenExpiresAt: this.session ? new Date(this.session.accessExpiresAt).toISOString() : null,
    };
  }
  async test() {
    await this.accessToken(true);
    const transfers = await this.call('get-transfer-suggestion', undefined);
    return { connected: true, organization: this.config.LAGOM_ORGANIZATION, accessTokenExpiresAt: this.status().accessTokenExpiresAt, transferSuggestions: transfers.length };
  }

  /** Executa qualquer operação do catálogo. Escritas exigem LAGOM_WRITE_ENABLED. */
  async call<K extends LagomOperationId>(id: K, body: LagomOperationMap[K]['body']): Promise<LagomOperationMap[K]['response']> {
    const op = lagomOperation(id);
    if (op.mutating && !this.writeEnabled) throw new LagomError('LAGOM_WRITE_DISABLED', 403, { operation: `${op.method} ${op.path}` });
    if (op.body && body === undefined) throw new LagomError('LAGOM_BODY_REQUIRED', 400);
    let token = await this.accessToken();
    const send = async () => {
      try {
        return await this.http(this.config.LAGOM_API_BASE_URL + op.path, {
          method: op.method, redirect: 'error', signal: AbortSignal.timeout(this.config.LAGOM_TIMEOUT_MS),
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', ...(op.body ? { 'Content-Type': 'application/json' } : {}) },
          body: op.body ? JSON.stringify(body) : undefined,
        });
      } catch { throw new LagomError('LAGOM_UNAVAILABLE'); }
    };
    let response = await send();
    // Um 401 é repetido uma única vez, e apenas para consultas: repetir uma escrita só é seguro
    // porque todos os PUT do Lagom são upsert idempotentes por "code".
    if (response.status === 401) {
      await response.body?.cancel();
      this.onEvent('TOKEN_REJECTED', { operation: op.id });
      token = await this.accessToken(true);
      response = await send();
    }
    const text = await response.text();
    let payload: unknown = null;
    try { payload = text ? JSON.parse(text) : null; } catch { payload = null; }
    if (!response.ok) {
      const e = payload && typeof payload === 'object' ? payload as { message?: unknown; error?: unknown } : {};
      const code = response.status === 401 ? 'LAGOM_ACCESS_REJECTED' : response.status === 403 ? 'LAGOM_FORBIDDEN' : response.status === 400 || response.status === 422 ? 'LAGOM_BAD_REQUEST' : response.status === 429 ? 'LAGOM_RATE_LIMIT' : 'LAGOM_REQUEST_FAILED';
      throw new LagomError(code, [400, 403, 422, 429].includes(response.status) ? response.status : 502, { httpStatus: response.status, lagomError: { error: e.error, message: e.message } });
    }
    if (text && payload === null) throw new LagomError('LAGOM_RESPONSE_INVALID');
    return payload as LagomOperationMap[K]['response'];
  }
}
