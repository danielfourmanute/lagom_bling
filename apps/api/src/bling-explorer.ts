import { BlingError } from './bling.js';
import { blingEndpoints, type BlingEndpoint, type BlingParam } from './generated/bling-get-catalog.js';

const byId = new Map(blingEndpoints.map(e => [e.id, e]));
const PATH_VALUE = /^[A-Za-z0-9._~-]{1,256}$/;
const MAX_VALUE = 500;
const MAX_ARRAY = 100;

function invalid(field: string, reason: string): never {
  throw new BlingError('EXPLORER_PARAMS_INVALID', 400, { field, reason });
}
function checkValue(param: BlingParam, value: string) {
  if (value.length > MAX_VALUE) invalid(param.name, 'valor muito longo');
  if (param.type === 'integer' && !/^-?\d+$/.test(value)) invalid(param.name, 'esperado número inteiro');
  if (param.type === 'number' && !/^-?\d+(\.\d+)?$/.test(value)) invalid(param.name, 'esperado número');
  if (param.type === 'boolean' && !['true', 'false', '0', '1'].includes(value)) invalid(param.name, 'esperado true/false');
  if (param.enum && !param.enum.map(String).includes(value)) invalid(param.name, 'valor fora da lista permitida');
}

/**
 * Converte a query recebida do painel numa chamada GET da Bling, aceitando apenas
 * endpoints do catálogo e parâmetros declarados no OpenAPI oficial.
 */
export function buildBlingRequest(endpointId: string, input: URLSearchParams): { endpoint: BlingEndpoint; path: string; query: URLSearchParams } {
  const endpoint = byId.get(endpointId);
  if (!endpoint) throw new BlingError('EXPLORER_ENDPOINT_UNKNOWN', 404);
  const params = new Map(endpoint.params.map(p => [p.name, p]));
  for (const key of new Set(input.keys())) if (!params.has(key)) invalid(key, 'parâmetro não suportado por este endpoint');

  let path = endpoint.path;
  const query = new URLSearchParams();
  for (const param of endpoint.params) {
    const values = input.getAll(param.name).map(v => v.trim()).filter(Boolean);
    if (param.in === 'path') {
      if (values.length !== 1) invalid(param.name, 'obrigatório');
      const value = values[0]!;
      if (!PATH_VALUE.test(value)) invalid(param.name, 'caracteres inválidos');
      checkValue(param, value);
      path = path.replace(`{${param.name}}`, encodeURIComponent(value));
      continue;
    }
    if (!values.length) { if (param.required) invalid(param.name, 'obrigatório'); continue; }
    if (!param.isArray && values.length > 1) invalid(param.name, 'aceita um único valor');
    if (values.length > MAX_ARRAY) invalid(param.name, 'valores demais');
    for (const value of values) { checkValue(param, value); query.append(param.name, value); }
  }
  if (/\{[^}]+\}/.test(path)) throw new BlingError('EXPLORER_PARAMS_INVALID', 400, { field: 'path', reason: 'parâmetro de caminho ausente' });
  return { endpoint, path, query };
}
