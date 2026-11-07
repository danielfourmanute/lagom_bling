<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import JsonTree from '../components/JsonTree.vue';
import { adminToken, needsKey, availability, BlingApiError, blingGet } from '../composables/bling';
import { availabilityLabel, blingGroups, endpointById, paramHelp, paramOptions, type BlingParam } from '../composables/blingCatalog';

const route = useRoute();
const router = useRouter();
const endpoint = computed(() => endpointById.get(String(route.params.id)));
const siblings = computed(() => blingGroups.find(g => g.group === endpoint.value?.group)?.endpoints ?? []);

const form = reactive<Record<string, string | string[]>>({});
const busy = ref(false);
const error = ref<{ message: string; detail?: string } | null>(null);
const result = ref<Record<string, unknown> | null>(null);
const view = ref<'table' | 'json'>('table');
const showAllColumns = ref(false);
const lastQuery = ref('');

const hasOptions = (p: BlingParam) => paramOptions(p).length > 0;
const inputType = (p: BlingParam) => p.format === 'date' ? 'date' : (p.format === 'datetime' || p.format === 'date-time') ? 'datetime-local' : (p.type === 'integer' || p.type === 'number') && !p.isArray ? 'number' : 'text';
const pathParams = computed(() => endpoint.value?.params.filter(p => p.in === 'path') ?? []);
const queryParams = computed(() => endpoint.value?.params.filter(p => p.in === 'query' && p.name !== 'pagina') ?? []);
const label = (p: BlingParam) => p.name.replace(/\[\]$/, '');

// Formulário espelha a query da URL: links de detalhe e recarregamentos preservam os filtros.
function resetForm() {
  for (const k of Object.keys(form)) delete form[k];
  const e = endpoint.value;
  if (!e) return;
  for (const p of e.params) {
    const fromUrl = route.query[p.name];
    const values = (Array.isArray(fromUrl) ? fromUrl : fromUrl != null ? [fromUrl] : []).map(String);
    if (p.isArray && hasOptions(p)) form[p.name] = values;
    else if (p.isArray) form[p.name] = values.join(', ');
    else {
      let v = values[0] ?? (p.name === 'limite' ? '25' : '');
      if (inputType(p) === 'datetime-local' && v) v = v.replace(' ', 'T').slice(0, 16);
      form[p.name] = v;
    }
  }
}
function toQuery(page?: number) {
  const q = new URLSearchParams();
  for (const p of endpoint.value?.params ?? []) {
    const raw = form[p.name];
    let values = Array.isArray(raw) ? raw : p.isArray ? String(raw ?? '').split(/[,;\s]+/) : [String(raw ?? '')];
    values = values.map(v => v.trim()).filter(Boolean);
    if (inputType(p) === 'datetime-local') values = values.map(v => v.replace('T', ' ') + (v.length === 16 ? ':00' : ''));
    for (const v of values) q.append(p.name, v);
  }
  if (endpoint.value?.paginated) q.set('pagina', String(page ?? (Number(route.query.pagina) || 1)));
  return q;
}
const missingRequired = computed(() => endpoint.value?.params.some(p => p.required && !String(form[p.name] ?? '').trim()) ?? true);
const page = computed(() => Number(route.query.pagina) || 1);

async function run(page?: number) {
  const e = endpoint.value;
  if (!e || busy.value) return;
  const q = toQuery(page);
  await router.replace({ query: Object.fromEntries([...new Set(q.keys())].map(k => [k, q.getAll(k).length > 1 ? q.getAll(k) : q.get(k)!])) });
  busy.value = true; error.value = null;
  try {
    result.value = await blingGet(e.id, q);
    lastQuery.value = q.toString();
    availability[e.id] = { state: 'ok' };
  } catch (cause) {
    result.value = null;
    error.value = cause instanceof BlingApiError ? { message: cause.message, detail: cause.detail } : { message: 'Falha na consulta.' };
    if (cause instanceof BlingApiError && cause.status === 403) availability[e.id] = { state: 'forbidden', detail: cause.detail };
  } finally { busy.value = false; }
}

watch(() => route.params.id, () => {
  result.value = null; error.value = null; view.value = 'table'; showAllColumns.value = false;
  resetForm();
  if (!needsKey.value && !missingRequired.value && endpoint.value) void run();
}, { immediate: true });

// ---- Apresentação dos resultados
const rows = computed(() => {
  const d = result.value?.data;
  return Array.isArray(d) && d.every(r => r && typeof r === 'object' && !Array.isArray(r)) ? d as Record<string, unknown>[] : null;
});
const record = computed(() => {
  const d = result.value?.data;
  return d && typeof d === 'object' && !Array.isArray(d) ? d as Record<string, unknown> : null;
});
const allColumns = computed(() => {
  const keys: string[] = [];
  for (const r of rows.value?.slice(0, 100) ?? []) for (const k of Object.keys(r)) if (!keys.includes(k)) keys.push(k);
  return keys;
});
const columns = computed(() => showAllColumns.value ? allColumns.value : allColumns.value.slice(0, 8));
const hasMore = computed(() => !!rows.value && rows.value.length >= (Number(form.limite) || 100));
const detail = computed(() => endpoint.value?.detailId ? endpointById.get(endpoint.value.detailId) : undefined);

function cell(v: unknown): string {
  if (v == null || v === '') return '—';
  if (typeof v !== 'object') return String(v);
  if (Array.isArray(v)) return `${v.length} item(ns)`;
  const o = v as Record<string, unknown>;
  const name = o.nome ?? o.descricao ?? o.numero ?? o.valor;
  if (name != null) return o.id != null ? `${name} (#${o.id})` : String(name);
  if (o.id != null) return `#${o.id}`;
  const prims = Object.entries(o).filter(([, x]) => x == null || typeof x !== 'object').slice(0, 3);
  return prims.map(([k, x]) => `${k}: ${x ?? '—'}`).join(' · ') || '{…}';
}
function openDetail(row: Record<string, unknown>) {
  const d = detail.value;
  const pathParam = d?.params.find(p => p.in === 'path');
  if (d && pathParam && row.id != null) void router.push({ path: `/bling/${d.id}`, query: { [pathParam.name]: String(row.id) } });
}
const scalarFields = computed(() => Object.entries(record.value ?? {}).filter(([, v]) => v == null || typeof v !== 'object'));
const nestedFields = computed(() => Object.entries(record.value ?? {}).filter(([, v]) => v != null && typeof v === 'object'));

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click(); URL.revokeObjectURL(url);
}
function exportJson() { download(`bling-${endpoint.value?.id}.json`, JSON.stringify(result.value, null, 2), 'application/json'); }
function exportCsv() {
  const esc = (s: string) => /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  const lines = [allColumns.value.join(';'), ...(rows.value ?? []).map(r => allColumns.value.map(c => esc(typeof r[c] === 'object' && r[c] ? JSON.stringify(r[c]) : String(r[c] ?? ''))).join(';'))];
  download(`bling-${endpoint.value?.id}-p${page.value}.csv`, '﻿' + lines.join('\n'), 'text/csv;charset=utf-8');
}
async function copyJson() { await navigator.clipboard?.writeText(JSON.stringify(result.value, null, 2)); }
</script>

<template>
  <section v-if="endpoint" class="page-content">
    <nav class="crumbs" aria-label="Trilha"><RouterLink to="/bling">APIs Bling</RouterLink> / <span>{{ endpoint.tag }}</span></nav>
    <div class="page-heading">
      <div>
        <p class="eyebrow">{{ endpoint.tag.toUpperCase() }}</p>
        <h1>{{ endpoint.summary }}</h1>
        <p class="lead">{{ endpoint.description }}</p>
        <p class="endpoint-line"><span class="method">GET</span> <code>/Api/v3{{ endpoint.path }}</code></p>
      </div>
      <span v-if="availability[endpoint.id]" :class="['state-pill', `avail-${availability[endpoint.id]!.state}`]">{{ availabilityLabel[availability[endpoint.id]!.state] }}</span>
    </div>

    <div v-if="siblings.length > 1" class="sibling-tabs" role="tablist">
      <RouterLink v-for="s in siblings" :key="s.id" :to="`/bling/${s.id}`" :class="['sibling-tab', { active: s.id === endpoint.id }]">{{ s.summary }}</RouterLink>
    </div>

    <form class="product-filters endpoint-form" @submit.prevent="run(1)">
      <label v-if="needsKey" class="credential-field">Chave administrativa
        <input v-model="adminToken" type="password" autocomplete="off" placeholder="Informe a chave do painel" :disabled="busy" />
      </label>
      <label v-for="p in [...pathParams, ...queryParams]" :key="p.in + p.name" :class="{ 'wide-field': p.isArray && hasOptions(p) }" :title="p.description">
        <span>{{ label(p) }}<b v-if="p.required" class="required">*</b> <small v-if="p.in === 'path'" class="param-kind">caminho</small></span>
        <div v-if="p.isArray && hasOptions(p)" class="check-group">
          <label v-for="o in paramOptions(p)" :key="o.value" class="check-inline"><input v-model="form[p.name]" type="checkbox" :value="o.value" /> {{ o.label }}</label>
        </div>
        <select v-else-if="hasOptions(p) || p.type === 'boolean'" v-model="form[p.name]" :required="p.required" :disabled="busy">
          <option value="">— {{ p.default != null ? `padrão: ${p.default}` : 'qualquer' }} —</option>
          <template v-if="hasOptions(p)"><option v-for="o in paramOptions(p)" :key="o.value" :value="o.value">{{ o.label }}</option></template>
          <template v-else><option value="true">Sim</option><option value="false">Não</option></template>
        </select>
        <input v-else v-model="form[p.name]" :type="inputType(p)" :required="p.required" :disabled="busy" :step="inputType(p) === 'number' ? 'any' : undefined"
          :placeholder="p.isArray ? 'Valores separados por vírgula' : p.example ?? ''" />
        <small v-if="paramHelp(p)" class="param-help">{{ paramHelp(p) }}</small>
      </label>
      <button class="button-primary" type="submit" :disabled="busy || needsKey || missingRequired">{{ busy ? 'Consultando…' : 'Consultar' }}</button>
    </form>

    <div v-if="error" class="notice notice-warn" role="alert">
      <div><strong>{{ error.message }}</strong><p v-if="error.detail" class="lead">{{ error.detail }}</p>
        <p class="lead"><RouterLink to="/connections">Conexões</RouterLink></p></div>
    </div>
    <p v-if="busy" role="status" class="lead" style="margin:20px 0">Consultando a Bling…</p>

    <template v-if="result && !busy">
      <div class="section-heading">
        <h2 v-if="rows">{{ rows.length }} registro(s){{ endpoint.paginated ? ` · página ${page}` : '' }}</h2>
        <h2 v-else>Resultado</h2>
        <div class="result-actions">
          <button type="button" :class="view === 'table' ? 'button-primary' : 'button-secondary'" @click="view = 'table'">Tabela</button>
          <button type="button" :class="view === 'json' ? 'button-primary' : 'button-secondary'" @click="view = 'json'">JSON</button>
          <button v-if="rows?.length" type="button" class="button-secondary" @click="exportCsv">CSV</button>
          <button type="button" class="button-secondary" @click="exportJson">Baixar JSON</button>
          <button type="button" class="button-secondary" @click="copyJson">Copiar</button>
        </div>
      </div>
      <p class="lead endpoint-line"><code>GET /Api/v3{{ endpoint.path }}{{ lastQuery ? '?' + lastQuery : '' }}</code></p>

      <template v-if="view === 'table'">
        <template v-if="rows">
          <div v-if="rows.length" class="table-wrap">
            <table>
              <thead><tr><th v-for="c in columns" :key="c">{{ c }}</th><th v-if="detail"></th></tr></thead>
              <tbody>
                <tr v-for="(r, i) in rows" :key="String(r.id ?? i)" :class="{ clickable: detail && r.id != null }" @click="openDetail(r)">
                  <td v-for="c in columns" :key="c">{{ cell(r[c]) }}</td>
                  <td v-if="detail"><span v-if="r.id != null" class="detail-link">Detalhes →</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state"><h2>Nenhum registro</h2><p>Revise os filtros ou volte à página anterior.</p></div>
          <div class="table-foot">
            <label v-if="allColumns.length > 8" class="check-inline"><input v-model="showAllColumns" type="checkbox" /> Mostrar todas as {{ allColumns.length }} colunas</label>
            <nav v-if="endpoint.paginated" class="product-pagination" aria-label="Paginação">
              <button type="button" class="button-secondary" :disabled="page <= 1" @click="run(page - 1)">Anterior</button>
              <span>Página {{ page }}</span>
              <button type="button" class="button-secondary" :disabled="!hasMore" @click="run(page + 1)">Próxima</button>
            </nav>
          </div>
        </template>
        <template v-else-if="record">
          <dl class="kv-grid">
            <template v-for="[k, v] in scalarFields" :key="k"><dt>{{ k }}</dt><dd>{{ v ?? '—' }}</dd></template>
          </dl>
          <div v-if="nestedFields.length" class="json-panel">
            <JsonTree v-for="[k, v] in nestedFields" :key="k" :label="k" :value="v" :depth="1" />
          </div>
        </template>
        <div v-else class="json-panel"><JsonTree :value="result" /></div>
      </template>
      <pre v-else class="json-raw">{{ JSON.stringify(result, null, 2) }}</pre>
    </template>
    <div v-else-if="!busy && !error" class="empty-state">
      <h2>Pronto para consultar</h2>
      <p>{{ missingRequired ? 'Preencha os campos obrigatórios (*) e clique em Consultar.' : 'Informe a chave administrativa e clique em Consultar.' }}</p>
    </div>
  </section>
  <section v-else class="page-content"><div class="empty-state"><h2>Endpoint não encontrado</h2><p><RouterLink to="/bling">Voltar ao catálogo</RouterLink></p></div></section>
</template>
