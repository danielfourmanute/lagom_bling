import Fastify, { LogController, type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { registerBling } from './bling-routes.js';
import { BlingError } from './bling.js';
import type { AppConfig } from './config.js';

export async function buildServer(config: AppConfig): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          '*.password',
          '*.token',
          '*.accessToken',
          '*.refreshToken',
          '*.clientSecret',
          '*.client_secret',
        ],
        censor: '[REDACTED]',
      },
    },
    logController: new LogController({ disableRequestLogging: true }),
  });

  await app.register(cors, {
    origin: config.NODE_ENV === 'development' ? ['http://localhost:5173'] : false,
  });

  app.get('/api/health', async () => ({
    status: 'ok',
    service: 'lagom-bling-api',
    timestamp: new Date().toISOString(),
    schedulerEnabled: false,
    externalWritesEnabled: false,
  }));

  if (config.BLING_OAUTH_ENABLED) await registerBling(app, config);

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof BlingError) return void reply.status(error.status).send({ ...error.details, code: error.code });
    request.log.error({ code: 'INTERNAL_ERROR' }, 'Falha não tratada na API');
    void reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Erro interno.' });
  });

  return app;
}
