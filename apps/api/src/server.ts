import Fastify, { LogController, type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import { registerBling } from './bling-routes.js';
import { BlingConnection, BlingError } from './bling.js';
import type { AppConfig } from './config.js';
import { LagomError } from './lagom.js';
import { registerLagom } from './lagom-routes.js';

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
    externalWritesEnabled: config.LAGOM_WRITE_ENABLED,
  }));

  const bling = config.BLING_OAUTH_ENABLED ? new BlingConnection(config) : undefined;
  if (bling) await registerBling(app, config, bling);
  // Lagom precisa da chave administrativa (rotas protegidas) e do banco (snapshot/relatório).
  if (config.ADMIN_API_TOKEN) {
    const db = bling?.db ?? new PrismaClient();
    await registerLagom(app, config, { db, bling });
    if (!bling) app.addHook('onClose', async () => db.$disconnect());
  }

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof BlingError || error instanceof LagomError) return void reply.status(error.status).send({ ...error.details, code: error.code });
    if ((error as { statusCode?: number }).statusCode === 400 || (error as { statusCode?: number }).statusCode === 413) return void reply.status((error as { statusCode: number }).statusCode).send({ code: 'REQUEST_INVALID' });
    request.log.error({ code: 'INTERNAL_ERROR' }, 'Falha não tratada na API');
    void reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Erro interno.' });
  });

  return app;
}
