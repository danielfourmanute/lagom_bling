<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import JsonTree from '../components/JsonTree.vue';
import { lagomRequest, LagomApiError } from '../composables/lagom';

type Row = Record<string, unknown>;
interface Field { key: string; label: string; type: 'text' | 'date' | 'list' | 'bool'; placeholder?: string }
interface Tab { id: string; op: string; label: string; help: string; fields: Field[]; body: (f: Record<string, any>) => unknown; nested?: string; columns?: string[] }

const today = new Date().toISOString().slice(0, 10);
const list = (v: string) => String(v ?? '').split(/[,;\s]+/).map(s => s.trim()).filter(Boolean);
const tabs: Tab[] = [
  { id: 'estoque-ideal', op: 'post-ideal-stock-get', label: 'Estoque ideal', help: 'Ideais de estoque calculados pelo Lagom por filial, marca e item. Sem filtros, retorna tudo.',
    fields: [{ key: 'branches', label: 'Filiais', type: 'list', placeholder: 'códigos, separados por vírgula' }, { key: 'brands', label: 'Marcas', type: 'list', placeholder: 'ex.: VELOSTER' }, { key: 'items', label: 'Itens', type: 'list', placeholder: 'códigos de item' }, { key: 'onlyWithChanges', label: 'Só com alteração', type: 'bool' }],
    body: f => ({ ...(list(f.branches).length ? { branches: list(f.branches) } : {}), ...(list(f.brands).length ? { brands: list(f.brands) } : {}), ...(list(f.items).length ? { items: list(f.items) } : {}), onlyWithChanges: !!f.onlyWithChanges }),
    columns: ['branchCode', 'brandCode', 'itemCode', 'itemName', 'lowerIdeal', 'resupplyTriggerIdeal', 'upperIdeal', 'coverage'] },
  { id: 'pre-ordens', op: 'get-pre-purchase-order', label: 'Pré-ordens de compra', help: 'Sugestões de compra geradas no Lagom e prontas para integrar ao ERP.', fields: [], body: () => undefined, nested: 'items',
    columns: ['code', 'branch', 'supplier', 'supplierName', 'suggestionDate', 'estimatedDeliveryDate', 'itemCount', 'totalValue', 'createdBy'] },
  { id: 'transferencias', op: 'get-transfer-suggestion', label: 'Sugestões de transferência', help: 'Transferências entre filiais sugeridas pelo Lagom.', fields: [], body: () => undefined,
    columns: ['id', 'sourceBranch', 'destinationBranch', 'item', 'itemName', 'quantity', 'unitOfMeasure', 'date', 'estimatedDeliveryDate', 'type'] },
  { id: 'ordens-compra', op: 'post-purchase-order', label: 'Ordens de compra', help: 'Ordens de compra gravadas no Lagom. Filtro por código com "=" ou "like" (% = qualquer texto).',
    fields: [{ key: 'like', label: 'Código (like)', type: 'text', placeholder: '%' }], body: f => [{ code: { like: f.like || '%' } }],
    columns: ['code', 'branch', 'item', 'supplier', 'orderDate', 'estimatedDeliveryDate', 'deliveryDate', 'requestedQuantity', 'deliveredQuantity', 'status', 'purchaseValue'] },
  { id: 'parametros', op: 'post-branch-item-parameter-get', label: 'Parâmetros filial/item', help: 'Parâmetros de planejamento por filial e item (estoque estratégico, limites, lead time…).',
    fields: [{ key: 'branch', label: 'Filiais', type: 'list', placeholder: 'códigos' }, { key: 'item', label: 'Itens', type: 'list', placeholder: 'códigos' }],
    body: f => ({ branch: list(f.branch), item: list(f.item) }), columns: ['branch', 'item', 'strategicStock', 'upperStockLimit', 'minimumPurchase', 'multiplePurchase', 'leadTimeType', 'planningType', 'buyer'] },
  { id: 'dfu', op: 'post-daily-data-dfu', label: 'Dados diários (DFU)', help: 'Dados usados no cálculo de demanda por item/filial na data de processamento.',
    fields: [{ key: 'date', label: 'Data', type: 'date' }], body: f => ({ date: f.date || today }),
    columns: ['date', 'itemCode', 'itemName', 'brandCode', 'destinationBranchCode', 'destinationStockQuantity', 'destinationAvgSalesLast3Months', 'destinationDaysOfCoverage', 'destinationABCCurveItem', 'destinationLeadTime'] },
  { id: 'previsao', op: 'post-forecast-monthly', label: 'Previsão mensal', help: 'Previsões de demanda dos próximos 13 meses (t0…t12). O Lagom exige os cinco filtros.',
    fields: [{ key: 'branch', label: 'Filial', type: 'text' }, { key: 'item', label: 'Item', type: 'text' }, { key: 'brand', label: 'Marca', type: 'text' }, { key: 'itemGroup', label: 'Grupo', type: 'text' }, { key: 'mainSupplier', label: 'Fornecedor', type: 'text' }],
    body: f => ({ branch: f.branch ?? '', item: f.item ?? '', brand: f.brand ?? '', itemGroup: f.itemGroup ?? '', mainSupplier: f.mainSupplier ?? '' }) },
];

const route = useRoute();
const router = useRouter();
const tab = computed(() => tabs.find(t => t.id === route.query.aba) ?? tabs[0]!);
const forms = reactive<Record<string, Record<string, any>>>(Object.fromEntries(tabs.map(t => [t.id, t.id === 'dfu' ? { date: today } : {}])));
const results = reactive<Record<string, { rows: Row[]; at: Date; ms: number } | undefined>>({});
const errors = reactive<Record<string, { message: string; detail?: string } | undefined>>({});
const busy = ref(false);
const search = ref('');
const selected = ref<Row | null>(null);
const page = ref(1);
const PAGE = 50;

async function run(t = tab.value) {
  busy.value = true; errors[t.id] = undefined; selected.value = null; page.value = 1;
  try {
    const body = t.body(forms[t.id]!);
    const r = await lagomRequest<{ data: unknown; durationMs: number }>(`op/${t.op}`, 'POST', body === undefined ? {} : { body });
    results[t.id] = { rows: Array.isArray(r.data) ? r.data as Row[] : r.data ? [r.data as Row] : [], at: new Date(), ms: r.durationMs };
  } catch (e) { errors[t.id] = e instanceof LagomApiError ? { message: e.message, detail: e.detail } : { message: 'Falha.' }; }
  finally { busy.value = false; }
}
watch(tab, t => { search.value = ''; if (!results[t.id] && !errors[t.id] && (t.id !== 'previsao')) void run(t); }, { immediate: true });

const rows = computed(() => results[tab.value.id]?.rows ?? []);
const columns = computed(() => {
  const keys: string[] = [];
  for (const r of rows.value.slice(0, 50)) for (const k of Object.keys(r)) if (!keys.includes(k) && k !== tab.value.nested) keys.push(k);
  const preferred = (tab.value.columns ?? []).filter(c => keys.includes(c));
  return preferred.length ? preferred : keys.slice(0, 10);
});
const filtered = computed(() => {
  const term = search.value.trim().toLowerCase();
  return term ? rows.value.filter(r => Object.values(r).some(v => v != null && typeof v !== 'object' && String(v).toLowerCase().includes(term))) : rows.value;
});
const pageRows = computed(() => filtered.value.slice((page.value - 1) * PAGE, page.value * PAGE));
const cell = (v: unknown) => v == null || v === '' ? '—' : typeof v === 'number' ? v.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : typeof v === 'boolean' ? (v ? 'sim' : 'não') : typeof v === 'object' ? (Array.isArray(v) ? `${v.length} item(ns)` : '{…}') : String(v);
function exportCsv() {
  const keys = [...new Set(rows.value.flatMap(r => Object.keys(r)))];
  const esc = (s: string) => /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  const csv = '﻿' + [keys.join(';'), ...filtered.value.map(r => keys.map(k => esc(typeof r[k] === 'object' && r[k] ? JSON.stringify(r[k]) : String(r[k] ?? ''))).join(';'))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  Object.assign(document.createElement('a'), { href: url, download: `lagom-${tab.value.id}.csv` }).click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <section class="page-content">
    <nav class="crumbs" aria-label="Trilha"><RouterLink to="/lagom">APIs Lagom</RouterLink> / <span>Dados no Lagom</span></nav>
    <div class="page-heading">
      <div>
        <p class="eyebrow">LAGOM DRP · CONSULTAS</p>
        <h1>Dados no Lagom</h1>
        <p class="lead">O que o Lagom calculou e guardou, lido pelas consultas da Integration API. Somente leitura.</p>
      </div>
      <span class="state-pill text-green">SOMENTE LEITURA</span>
    </div>

    <div class="sibling-tabs" role="tablist">
      <button v-for="t in tabs" :key="t.id" role="tab" :aria-selected="t.id === tab.id" :class="['sibling-tab', { active: t.id === tab.id }]" @click="router.replace({ query: { aba: t.id } })">
        {{ t.label }}<span v-if="results[t.id]" class="tab-count">{{ results[t.id]!.rows.length }}</span>
      </button>
    </div>
    <p class="lead">{{ tab.help }}</p>

    <form class="product-filters" @submit.prevent="run()">
      <label v-for="f in tab.fields" :key="f.key" :class="{ 'check-inline': f.type === 'bool' }">
        <template v-if="f.type === 'bool'"><input v-model="forms[tab.id]![f.key]" type="checkbox" /> {{ f.label }}</template>
        <template v-else>{{ f.label }}<input v-model="forms[tab.id]![f.key]" :type="f.type === 'date' ? 'date' : 'text'" :placeholder="f.placeholder" /></template>
      </label>
      <label v-if="rows.length">Buscar no resultado<input v-model="search" placeholder="filtra as linhas" @input="page = 1" /></label>
      <button class="button-primary" type="submit" :disabled="busy">{{ busy ? 'Consultando…' : 'Consultar' }}</button>
      <button v-if="rows.length" class="button-secondary" type="button" @click="exportCsv">Exportar CSV</button>
    </form>

    <div v-if="errors[tab.id]" class="notice notice-warn" role="alert"><div><strong>{{ errors[tab.id]!.message }}</strong><p v-if="errors[tab.id]!.detail">{{ errors[tab.id]!.detail }}</p></div></div>
    <p v-if="busy" class="lead" role="status">Consultando o Lagom…</p>

    <template v-else-if="results[tab.id]">
      <div class="section-heading"><h2>{{ filtered.length }} registro(s)</h2><span class="lead">{{ results[tab.id]!.ms }} ms · {{ results[tab.id]!.at.toLocaleTimeString('pt-BR') }}</span></div>
      <div v-if="filtered.length" class="table-wrap">
        <table>
          <thead><tr><th v-for="c in columns" :key="c">{{ c }}</th></tr></thead>
          <tbody><tr v-for="(r, i) in pageRows" :key="i" class="compat-row" @click="selected = selected === r ? null : r"><td v-for="c in columns" :key="c">{{ cell(r[c]) }}</td></tr></tbody>
        </table>
      </div>
      <div v-else class="empty-state"><h2>Nada no Lagom para esta consulta</h2><p>O Lagom só gera ideais, sugestões e previsões depois de receber cadastros, estoque e histórico de movimentação, e de rodar o cálculo.</p></div>
      <nav v-if="filtered.length > PAGE" class="product-pagination">
        <button class="button-secondary" :disabled="page <= 1" @click="page--">Anterior</button>
        <span>Página {{ page }} de {{ Math.ceil(filtered.length / PAGE) }}</span>
        <button class="button-secondary" :disabled="page * PAGE >= filtered.length" @click="page++">Próxima</button>
      </nav>
      <div v-if="selected" class="json-panel"><strong>Registro completo</strong><JsonTree :value="selected" /></div>
    </template>
  </section>
</template>
