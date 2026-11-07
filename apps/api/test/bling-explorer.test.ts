import { describe, expect, it } from 'vitest';
import { buildBlingRequest } from '../src/bling-explorer.js';
import { blingEndpoints } from '../src/generated/bling-get-catalog.js';

const q = (s: string) => new URLSearchParams(s);

describe('Bling GET explorer', () => {
  it('catalog contains only unique GET endpoints with resolved path params', () => {
    expect(blingEndpoints.length).toBeGreaterThanOrEqual(100);
    expect(new Set(blingEndpoints.map(e => e.id)).size).toBe(blingEndpoints.length);
    for (const e of blingEndpoints) {
      const template = [...e.path.matchAll(/\{([^}]+)\}/g)].map(m => m[1]).sort();
      expect(e.params.filter(p => p.in === 'path').map(p => p.name).sort()).toEqual(template);
    }
  });
  it('builds list and detail requests', () => {
    const list = buildBlingRequest('produtos', q('pagina=2&limite=10&idsProdutos[]=1&idsProdutos[]=2'));
    expect(list.path).toBe('/produtos');
    expect(list.query.toString()).toBe('pagina=2&limite=10&idsProdutos%5B%5D=1&idsProdutos%5B%5D=2');
    expect(buildBlingRequest('produtos-id', q('idProduto=123')).path).toBe('/produtos/123');
  });
  it('rejects unknown endpoints, unknown params, bad types and path injection', () => {
    expect(() => buildBlingRequest('nope', q(''))).toThrow('EXPLORER_ENDPOINT_UNKNOWN');
    expect(() => buildBlingRequest('produtos', q('foo=1'))).toThrow('EXPLORER_PARAMS_INVALID');
    expect(() => buildBlingRequest('produtos', q('pagina=abc'))).toThrow('EXPLORER_PARAMS_INVALID');
    expect(() => buildBlingRequest('produtos', q('criterio=9'))).toThrow('EXPLORER_PARAMS_INVALID');
    expect(() => buildBlingRequest('produtos-id', q(''))).toThrow('EXPLORER_PARAMS_INVALID');
    expect(() => buildBlingRequest('produtos-id', q('idProduto=../../oauth'))).toThrow('EXPLORER_PARAMS_INVALID');
    expect(() => buildBlingRequest('produtos', q('nome=a&nome=b'))).toThrow('EXPLORER_PARAMS_INVALID');
  });
});
