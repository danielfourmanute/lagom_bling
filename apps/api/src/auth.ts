import type { FastifyRequest } from 'fastify';
import { BlingError, secureEqual } from './bling.js';
import type { AppConfig } from './config.js';

/** preHandler que exige a chave administrativa (ADMIN_API_TOKEN) em Authorization: Bearer. */
export const adminGuard = (config: AppConfig) => async (req: FastifyRequest) => {
  if (!config.ADMIN_API_TOKEN || !secureEqual(req.headers.authorization ?? '', `Bearer ${config.ADMIN_API_TOKEN}`)) throw new BlingError('UNAUTHORIZED', 401);
};
