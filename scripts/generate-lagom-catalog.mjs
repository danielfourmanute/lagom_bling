#!/usr/bin/env node
// Gera o catálogo completo da Integration API do Lagom DRP (todas as operações + DTOs)
// a partir do OpenAPI publicado. Uso: node scripts/generate-lagom-catalog.mjs [caminho-ou-url]
// Saída (mesmo conteúdo): apps/api/src/generated/lagom-catalog.ts e apps/web/src/generated/lagom-catalog.ts
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_SOURCE = 'https://beta-api-sandbox.lagomtech.com.br/api-json';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2] ?? DEFAULT_SOURCE;
const spec = JSON.parse(/^https?:/.test(source) ? await (await fetch(source)).text() : await readFile(source, 'utf8'));
const schemas = spec.components?.schemas ?? {};

const clean = (text = '') => text
  .replace(/<br\s*\/?>/gi, '\n').replace(/<\/?(p|li|ul|ol|div|h\d)[^>]*>/gi, '\n').replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  .split('\n').map(s => s.trim()).filter(Boolean).join('\n');
const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// "#/components/schemas/" vazio aparece no OpenAPI para arrays de strings (DELETE).
const refName = (node) => node?.$ref ? node.$ref.split('/').pop() || null : null;

function field(name, node, required) {
  const ref = refName(node);
  const type = ref ? 'object' : node.type === 'integer' ? 'number' : (node.type ?? (node.$ref !== undefined ? 'string' : 'object'));
  const out = { name, type, required };
  if (ref) out.ref = ref;
  if (type === 'array') {
    const itemRef = refName(node.items);
    out.items = itemRef ?? (node.items?.type === 'integer' ? 'number' : node.items?.type ?? 'string');
  }
  if (node.nullable) out.nullable = true;
  for (const key of ['format', 'maxLength', 'minLength', 'minimum', 'maximum', 'enum']) if (node[key] !== undefined) out[key] = node[key];
  const description = clean(node.description);
  if (description) out.description = description;
  // O OpenAPI do Lagom declara alguns campos "object" que na prática são códigos (ex.: ItemGroupDTO.father).
  if (type === 'object' && !ref && node.example !== undefined && typeof node.example !== 'object') out.type = 'string';
  if (node.example !== undefined && node.example !== null) out.example = node.example;
  return out;
}
const fieldsOf = (schema) => Object.entries(schema.properties ?? {}).map(([name, node]) => field(name, node, (schema.required ?? []).includes(name)));
const catalogSchemas = Object.fromEntries(Object.entries(schemas).map(([name, schema]) => [name, { name, fields: fieldsOf(schema) }]));

const KIND = {
  cadastro: ['/branch', '/branch-group', '/branch-item-parameter', '/brand', '/customer-group', '/customer', '/item', '/item-composition', '/item-group', '/item-secondary-group', '/payment-terms', '/substitute', '/previous-version', '/supplier', '/supplier-brand', '/item-custom-attribute/option', '/item-custom-attribute/value'],
  transacao: ['/movement', '/stock', '/purchase-order', '/transfer', '/future-movement'],
};
function classify(method, path) {
  if (path.startsWith('/login')) return 'auth';
  if (path.endsWith('/done')) return 'retorno';
  if (method === 'get' || (method === 'post')) return 'consulta';
  if (KIND.cadastro.includes(path)) return 'cadastro';
  if (KIND.transacao.includes(path)) return 'transacao';
  return 'outro';
}
function bodyOf(op) {
  const content = op.requestBody?.content?.['application/json'];
  if (!content?.schema) return undefined;
  let schema = content.schema;
  if (schema.oneOf) schema = schema.oneOf.find(s => !s.deprecated) ?? schema.oneOf[0];
  const example = content.examples ? Object.values(content.examples)[0]?.value : schema.example;
  const ref = refName(schema);
  if (ref) return { array: false, schema: ref, ...(example !== undefined ? { example } : {}) };
  if (schema.type === 'array') {
    const itemRef = refName(schema.items);
    return itemRef ? { array: true, schema: itemRef } : { array: true, primitive: schema.items?.type === 'number' ? 'number' : 'string', ...(example !== undefined ? { example } : {}) };
  }
  return { array: false, fields: fieldsOf(schema), ...(example !== undefined ? { example } : {}) };
}
function responseOf(op) {
  const [status, res] = Object.entries(op.responses ?? {}).find(([code]) => code.startsWith('2')) ?? [];
  const schema = res?.content?.['application/json']?.schema;
  if (!schema) return { status: Number(status ?? 200) };
  const ref = refName(schema) ?? refName(schema.items);
  return { status: Number(status), array: schema.type === 'array', ...(ref ? { schema: ref } : {}), ...(schema.example ? { example: schema.example } : {}) };
}

const operations = [];
for (const [path, item] of Object.entries(spec.paths)) {
  for (const [method, op] of Object.entries(item)) {
    if (!['get', 'post', 'put', 'delete', 'patch'].includes(method)) continue;
    const kind = classify(method, path);
    operations.push({
      id: `${method}-${slug(path)}`, method: method.toUpperCase(), path, tag: op.tags?.[0] ?? 'outros', kind,
      // Consultas (GET e POST de filtro) não alteram dados; o resto escreve no Lagom.
      mutating: !['consulta', 'auth'].includes(kind),
      summary: clean(op.summary) || path, description: clean(op.description),
      body: bodyOf(op), response: responseOf(op),
    });
  }
}
const ids = new Set();
for (const o of operations) { if (ids.has(o.id)) throw new Error('ID duplicado: ' + o.id); ids.add(o.id); }

const tsType = (f) => {
  const base = f.type === 'array' ? `${/^[A-Z]/.test(f.items) ? f.items : f.items}[]` : f.ref ?? (f.type === 'object' ? 'Record<string, unknown>' : f.type);
  return f.nullable ? `${base} | null` : base;
};
const interfaces = Object.values(catalogSchemas).map(s => `export interface ${s.name} {\n${s.fields.map(f => `  /** ${(f.description ?? '').replace(/\*\//g, '').replace(/\n/g, ' · ')} */\n  ${f.name}${f.required ? '' : '?'}: ${tsType(f)};`).join('\n')}\n}`).join('\n');
const bodyType = (b) => !b ? 'undefined' : b.schema ? `${b.schema}${b.array ? '[]' : ''}` : b.primitive ? `${b.primitive}[]` : `{ ${b.fields.map(f => `${f.name}${f.required ? '' : '?'}: ${tsType(f)}`).join('; ')} }`;
const respType = (r) => r.schema ? `${r.schema}${r.array ? '[]' : ''}` : 'unknown';
const opMap = operations.map(o => `  '${o.id}': { body: ${bodyType(o.body)}; response: ${respType(o.response)} };`).join('\n');

const banner = `// GERADO por scripts/generate-lagom-catalog.mjs — não editar manualmente.\n// Fonte: ${source} (${spec.info?.title ?? ''} ${spec.info?.version ?? ''}); ${operations.length} operações, ${Object.keys(catalogSchemas).length} schemas.\n`;
const body = `${banner}
export interface LagomField { name: string; type: 'string' | 'number' | 'boolean' | 'object' | 'array'; required: boolean; nullable?: boolean; ref?: string; items?: string; format?: string; maxLength?: number; minLength?: number; minimum?: number; maximum?: number; enum?: unknown[]; description?: string; example?: unknown }
export interface LagomSchema { name: string; fields: LagomField[] }
export type LagomKind = 'auth' | 'cadastro' | 'transacao' | 'consulta' | 'retorno' | 'outro';
export interface LagomBody { array: boolean; schema?: string; primitive?: 'string' | 'number'; fields?: LagomField[]; example?: unknown }
export interface LagomOperation { id: string; method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; path: string; tag: string; kind: LagomKind; mutating: boolean; summary: string; description: string; body?: LagomBody; response: { status: number; array?: boolean; schema?: string; example?: unknown } }

export const lagomSchemas: Record<string, LagomSchema> = ${JSON.stringify(catalogSchemas, null, 1)};

export const lagomOperations: LagomOperation[] = ${JSON.stringify(operations, null, 1)};

${interfaces}

/** Corpo e resposta tipados de cada operação, pelo id do catálogo. */
export interface LagomOperationMap {
${opMap}
}
export type LagomOperationId = keyof LagomOperationMap;
`;
for (const target of ['apps/api/src/generated/lagom-catalog.ts', 'apps/web/src/generated/lagom-catalog.ts']) {
  await mkdir(dirname(resolve(root, target)), { recursive: true });
  await writeFile(resolve(root, target), body);
}
console.log(`${operations.length} operações e ${Object.keys(catalogSchemas).length} schemas gerados.`);
