import { afterEach, describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';
import { buildServer } from '../src/server.js';

let app: Awaited<ReturnType<typeof buildServer>> | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

describe('API safety baseline', () => {
  it('returns a read-only health status', async () => {
    const config = loadConfig({ NODE_ENV: 'test', APP_PORT: '3000', LOG_LEVEL: 'silent' });
    app = await buildServer(config);
    const response = await app.inject({ method: 'GET', url: '/api/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'ok',
      schedulerEnabled: false,
      externalWritesEnabled: false,
    });
  });

  it('refuses any scheduler or write enablement in this scaffold', () => {
    expect(() => loadConfig({ SCHEDULER_ENABLED: 'true' })).toThrow(/mantenha todas as flags/);
    expect(() => loadConfig({ WRITE_ENABLED: 'true' })).toThrow(/mantenha todas as flags/);
  });
});
