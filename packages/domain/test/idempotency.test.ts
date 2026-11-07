import { describe, expect, it } from 'vitest';
import { canTransition, createIdempotencyKey } from '../src/index.js';

const base = {
  tenantId: 'empresa-1',
  direction: 'LAGOM_TO_BLING' as const,
  documentType: 'PURCHASE_ORDER',
  sourceDocumentId: 'pedido-123',
  versionOrAction: 'v1:create',
};

describe('createIdempotencyKey', () => {
  it('produz a mesma chave para a mesma identidade e versão', () => {
    expect(createIdempotencyKey(base)).toBe(createIdempotencyKey({ ...base }));
  });

  it('separa a chave quando muda o documento ou a acção', () => {
    expect(createIdempotencyKey(base)).not.toBe(
      createIdempotencyKey({ ...base, versionOrAction: 'v2:update' }),
    );
    expect(createIdempotencyKey(base)).not.toBe(
      createIdempotencyKey({ ...base, sourceDocumentId: 'pedido-124' }),
    );
  });

  it('rejeita componentes vazios', () => {
    expect(() => createIdempotencyKey({ ...base, tenantId: ' ' })).toThrow();
  });
});

describe('transições de estado', () => {
  it('permite confirmação verificável depois do envio', () => {
    expect(canTransition('SENT', 'CONFIRMED')).toBe(true);
  });

  it('obriga reconciliação antes de repetir um resultado desconhecido', () => {
    expect(canTransition('UNKNOWN', 'PENDING')).toBe(false);
    expect(canTransition('UNKNOWN', 'RECONCILING')).toBe(true);
  });
});
