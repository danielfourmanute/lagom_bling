#!/usr/bin/env node
// Gera o catálogo de endpoints GET da Bling API v3 a partir do OpenAPI oficial.
// Uso: node scripts/generate-bling-catalog.mjs [caminho-ou-url-do-openapi.json]
// Saída (mesmo conteúdo, um por pacote): apps/api/src/generated e apps/web/src/generated.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_SOURCE = 'https://developer.bling.com.br/build/assets/openapi-CR5QY_N1.json';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2] ?? DEFAULT_SOURCE;

const spec = JSON.parse(/^https?:/.test(source) ? await (await fetch(source)).text() : await readFile(source, 'utf8'));
const deref = (node) => {
  if (!node?.$ref) return node;
  const target = node.$ref.replace(/^#\//, '').split('/').reduce((acc, key) => acc?.[key], spec);
  return deref(target);
};
const clean = (text = '') => text
  .replace(/<br\s*\/?>/gi, '\n').replace(/<\/?(p|li|ul|ol|div)[^>]*>/gi, '\n').replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  .split('\n').map(s => s.trim()).filter(Boolean).join('\n');
const slug = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const endpoints = [];
for (const [path, item] of Object.entries(spec.paths)) {
  const op = item.get;
  if (!op) continue;
  const template = [...path.matchAll(/\{([^}]+)\}/g)].map(m => m[1]);
  const declared = [...(item.parameters ?? []), ...(op.parameters ?? [])].map(deref);
  const params = [];
  const seen = new Set();
  for (const p of declared) {
    if (!p?.name || !['query', 'path'].includes(p.in)) continue;
    if (p.in === 'path' && !template.includes(p.name)) continue; // nome divergente no OpenAPI
    const key = p.in + ':' + p.name;
    if (seen.has(key)) continue;
    seen.add(key);
    const schema = deref(p.schema) ?? {};
    const isArray = schema.type === 'array' || p.name.endsWith('[]');
    const inner = schema.type === 'array' ? deref(schema.items) ?? {} : schema;
    params.push({
      name: p.name, in: p.in, required: p.in === 'path' || !!p.required, isArray,
      type: ['integer', 'number', 'boolean'].includes(inner.type) ? inner.type : 'string',
      ...(inner.format ? { format: inner.format } : {}),
      ...(inner.enum ? { enum: inner.enum } : {}),
      ...(schema.default !== undefined ? { default: schema.default } : {}),
      ...(p.description ? { description: clean(p.description) } : {}),
      ...(inner.example !== undefined ? { example: String(inner.example) } : {}),
    });
  }
  for (const name of template) {
    if (!seen.has('path:' + name)) params.push({ name, in: 'path', required: true, isArray: false, type: 'string' });
  }
  params.sort((a, b) => (a.in === b.in ? 0 : a.in === 'path' ? -1 : 1));
  const tag = op.tags?.[0] ?? 'Outros';
  const id = slug(path.replace(/\{[^}]+\}/g, "id"));
  endpoints.push({
    id, tag, group: slug(tag), path, summary: clean(op.summary) || path, description: clean(op.description),
    action: op['x-api-action'] ?? '', params, paginated: params.some(p => p.name === 'pagina'),
  });
}
// Liga cada listagem à operação de detalhe "<path>/{id}" para navegação a partir da tabela.
for (const e of endpoints) {
  const detail = endpoints.find(d => d.path.startsWith(e.path + '/{') && /^\/\{[^}/]+\}$/.test(d.path.slice(e.path.length)));
  if (detail) e.detailId = detail.id;
}
endpoints.sort((a, b) => a.tag.localeCompare(b.tag, 'pt-BR') || a.path.localeCompare(b.path));
const ids = new Set();
for (const e of endpoints) { if (ids.has(e.id)) throw new Error('ID duplicado: ' + e.id); ids.add(e.id); }

const banner = `// GERADO por scripts/generate-bling-catalog.mjs — não editar manualmente.\n// Fonte: ${source} (OpenAPI ${spec.info?.version ?? ''}); ${endpoints.length} endpoints GET.\n`;
const body = `${banner}
export interface BlingParam { name: string; in: 'query' | 'path'; required: boolean; isArray: boolean; type: 'string' | 'integer' | 'number' | 'boolean'; format?: string; enum?: (string | number)[]; default?: unknown; description?: string; example?: string }
export interface BlingEndpoint { id: string; tag: string; group: string; path: string; summary: string; description: string; action: string; params: BlingParam[]; paginated: boolean; detailId?: string }

export const blingEndpoints: BlingEndpoint[] = ${JSON.stringify(endpoints, null, 1)};
`;
for (const target of ['apps/api/src/generated/bling-get-catalog.ts', 'apps/web/src/generated/bling-get-catalog.ts']) {
  await mkdir(dirname(resolve(root, target)), { recursive: true });
  await writeFile(resolve(root, target), body);
}
console.log(`${endpoints.length} endpoints GET em ${new Set(endpoints.map(e => e.tag)).size} recursos.`);
