import 'dotenv/config';
import { z } from 'zod';

const envBoolean = z.preprocess((value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false' || value === '') return false;
  }
  return value;
}, z.boolean().default(false));

const config = z.object({
  SCHEDULER_ENABLED: envBoolean,
  WRITE_ENABLED: envBoolean,
  LAGOM_TO_BLING_ENABLED: envBoolean,
  BLING_TO_LAGOM_ENABLED: envBoolean,
}).parse(process.env);

if (config.SCHEDULER_ENABLED || config.WRITE_ENABLED || config.LAGOM_TO_BLING_ENABLED || config.BLING_TO_LAGOM_ENABLED) {
  console.error(JSON.stringify({
    level: 'error',
    event: 'worker_start_blocked',
    reason: 'O scaffold ainda não implementa jobs nem escritas externas; todas as flags devem permanecer false.',
  }));
  process.exitCode = 1;
} else {
  console.info(JSON.stringify({
    level: 'info',
    event: 'worker_idle',
    schedulerEnabled: false,
    externalWritesEnabled: false,
    message: 'Worker inerte; nenhum job foi registado.',
  }));
  const keepAlive = setInterval(() => undefined, 60_000);
  const stop = () => {
    clearInterval(keepAlive);
    console.info(JSON.stringify({ level: 'info', event: 'worker_stopped' }));
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
}
