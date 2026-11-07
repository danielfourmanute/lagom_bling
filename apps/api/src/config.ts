import { config as loadDotEnv } from 'dotenv';
import { fileURLToPath } from 'node:url';
loadDotEnv({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) });
import { z } from 'zod';

const envBoolean = z.preprocess((value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false' || value === '') return false;
  }
  return value;
}, z.boolean().default(false));

const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_HOST: z.string().default('127.0.0.1'),
  APP_PORT: z.coerce.number().int().min(1024).max(65535).default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  LAGOM_API_BASE_URL: z.url().default('https://beta-api-sandbox.lagomtech.com.br'),
  BLING_API_BASE_URL: z.url().default('https://api.bling.com.br/Api/v3'),
  BLING_OAUTH_ENABLED: envBoolean,
  BLING_OAUTH_AUTHORIZE_URL: z.url().default('https://www.bling.com.br/Api/v3/oauth/authorize'),
  BLING_OAUTH_TOKEN_URL: z.url().default('https://api.bling.com.br/Api/v3/oauth/token'),
  BLING_CLIENT_ID: z.string().default(''),
  BLING_CLIENT_SECRET: z.string().default(''),
  BLING_REDIRECT_URI: z.string().default(''),
  TOKEN_ENCRYPTION_KEY: z.string().default(''),
  ADMIN_API_TOKEN: z.string().default(''),
  BLING_RATE_LIMIT_PER_SECOND: z.coerce.number().min(0.2).max(3).default(2),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120000).default(30000),
  SCHEDULER_ENABLED: envBoolean,
  WRITE_ENABLED: envBoolean,
  LAGOM_TO_BLING_ENABLED: envBoolean,
  BLING_TO_LAGOM_ENABLED: envBoolean,
});

export type AppConfig = z.infer<typeof EnvironmentSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = EnvironmentSchema.parse(env);
  if (parsed.SCHEDULER_ENABLED || parsed.WRITE_ENABLED || parsed.LAGOM_TO_BLING_ENABLED || parsed.BLING_TO_LAGOM_ENABLED) {
    throw new Error('Este scaffold não implementa jobs/escritas reais; mantenha todas as flags de integração false.');
  }
  if (parsed.BLING_OAUTH_ENABLED) {
    if (!/^[a-f0-9]{64}$/i.test(parsed.TOKEN_ENCRYPTION_KEY) || parsed.ADMIN_API_TOKEN.length < 32 || !parsed.BLING_CLIENT_ID || !parsed.BLING_CLIENT_SECRET) {
      throw new Error('OAuth exige credenciais, TOKEN_ENCRYPTION_KEY hexadecimal de 32 bytes e ADMIN_API_TOKEN de pelo menos 32 caracteres.');
    }
    const callback = new URL(parsed.BLING_REDIRECT_URI);
    if (callback.protocol !== 'https:' && !(['localhost', '127.0.0.1'].includes(callback.hostname) && parsed.NODE_ENV !== 'production')) throw new Error('Callback OAuth exige HTTPS.');
    if (parsed.BLING_OAUTH_TOKEN_URL !== 'https://api.bling.com.br/Api/v3/oauth/token' || parsed.BLING_OAUTH_AUTHORIZE_URL !== 'https://www.bling.com.br/Api/v3/oauth/authorize' || parsed.BLING_API_BASE_URL !== 'https://api.bling.com.br/Api/v3') throw new Error('Utilize os endpoints oficiais da Bling.');
  }
  return parsed;
}
