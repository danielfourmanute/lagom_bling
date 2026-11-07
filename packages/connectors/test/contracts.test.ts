import { describe, expect, it } from 'vitest';
import { ExternalWriteDisabledError, requireWriteApproval, verifiedApiOperations } from '../src/index.js';

describe('safety guards and contract register', () => {
  it('keeps native Bling stock transfer blocked without a verified endpoint', () => {
    const transfer = verifiedApiOperations.find((item) => item.entity === 'native stock transfer');
    expect(transfer?.status).toBe('BLOCKED');
    expect(transfer?.path).toBeNull();
  });

  it('rejects external writes when approval is disabled', () => {
    expect(() => requireWriteApproval(false, 'POST /pedidos/compras')).toThrow(ExternalWriteDisabledError);
  });

  it('allows only a caller-approved operation to pass the guard', () => {
    expect(() => requireWriteApproval(true, 'sandbox test')).not.toThrow();
  });
});
