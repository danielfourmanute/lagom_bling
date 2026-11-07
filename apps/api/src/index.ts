import { loadConfig } from './config.js';
import { buildServer } from './server.js';

const config = loadConfig();
const app = await buildServer(config);

try {
  await app.listen({ host: config.APP_HOST, port: config.APP_PORT });
  app.log.info({ port: config.APP_PORT }, 'API iniciada; sincronizações permanecem desligadas.');
} catch (error) {
  app.log.error({ err: error }, 'Não foi possível iniciar a API.');
  process.exitCode = 1;
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    void app.close().finally(() => process.exit(0));
  });
}
