<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import JsonTree from '../components/JsonTree.vue';
import { exampleBody, kindLabel, lagomOperations, lagomRequest, lagomSchemas, lagomState, refreshLagomStatus, LagomApiError, type LagomField } from '../composables/lagom';

const route = useRoute();
const op = computed(() => lagomOperations.find(o => o.id === route.params.id));
const bodyText = ref('');
const busy = ref(false);
const error = ref<{ message: string; detail?: string } | null>(null);
const result = ref<{ operation: string; durationMs: number; count?: number; data: unknown } | null>(null);
const view = ref<'tree' | 'json'>('tree');
const bodyFields = computed<LagomField[]>(() => op.value?.body?.schema ? lagomSchemas[op.value.body.schema]?.fields ?? [] : op.value?.body?.fields ?? []);
const responseFields = computed<LagomField[]>(() => op.value?.response.schema ? lagomSchemas[op.value.response.schema]?.fields ?? [] : []);
const blocked = computed(() => !!op.value?.mutating && !lagomState.status?.writeEnabled);

watch(op, o => { result.value = null; error.value = null; bodyText.value = o?.body ? JSON.stringify(exampleBody(o), null, 2) : ''; }, { immediate: true });
onMounted(() => { if (!lagomState.status) void refreshLagomStatus(); });

async function run() {
  if (!op.value || busy.value) return;
  let body: unknown;
  if (op.value.body) {
    try { body = JSON.parse(bodyText.value); } catch { error.value = { message: 'O corpo não é um JSON válido.' }; return; }
  }
  busy.value = true; error.value = null; result.value = null;
  try { result.value = await lagomRequest(`op/${op.value.id}`, 'POST', op.value.body ? { body } : {}); }
  catch (e) { error.value = e instanceof LagomApiError ? { message: e.message, detail: e.detail } : { message: 'Falha.' }; }
  finally { busy.value = false; }
}
const typeLabel = (f: LagomField) => (f.type === 'array' ? `${f.items}[]` : f.ref ?? f.type) + (f.format ? ` (${f.format})` : '') + (f.maxLength ? ` · máx ${f.maxLength}` : '');
</script>

<template>
  <section v-if="op" class="page-content">
    <nav class="crumbs" aria-label="Trilha"><RouterLink to="/lagom">APIs Lagom</RouterLink> / <span>{{ kindLabel[op.kind] }}</span></nav>
    <div class="page-heading">
      <div>
        <p class="eyebrow">{{ kindLabel[op.kind].toUpperCase() }} · {{ op.tag.toUpperCase() }}</p>
        <h1>{{ op.summary }}</h1>
        <p class="lead" style="white-space:pre-line">{{ op.description }}</p>
        <p class="endpoint-line"><span :class="['method', `method-${op.method.toLowerCase()}`]">{{ op.method }}</span> <code>{{ op.path }}</code></p>
      </div>
      <span :class="['state-pill', op.mutating ? 'state-pending' : 'text-green']">{{ op.mutating ? 'GRAVA NO LAGOM' : 'SOMENTE LEITURA' }}</span>
    </div>

    <template v-if="bodyFields.length">
      <div class="section-heading"><h2>Corpo · {{ op.body?.schema ?? 'filtro' }}{{ op.body?.array ? ' (lista)' : '' }}</h2></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Campo</th><th>Tipo</th><th>Descrição</th></tr></thead>
        <tbody><tr v-for="f in bodyFields" :key="f.name">
          <td><code>{{ f.name }}</code><b v-if="f.required" class="required">*</b></td>
          <td><small>{{ typeLabel(f) }}{{ f.nullable ? ' · null' : '' }}</small></td>
          <td style="white-space:pre-line"><small>{{ f.description || '—' }}</small></td>
        </tr></tbody>
      </table></div>
    </template>

    <form class="lagom-run" @submit.prevent="run">
      <label v-if="op.body">Corpo JSON
        <textarea v-model="bodyText" spellcheck="false" rows="12" :disabled="busy"></textarea>
      </label>
      <div class="result-actions">
        <button class="button-primary" type="submit" :disabled="busy || blocked">{{ busy ? 'Executando…' : op.mutating ? 'Enviar ao Lagom' : 'Consultar' }}</button>
        <span v-if="blocked" class="text-amber">Escrita bloqueada: defina <code>LAGOM_WRITE_ENABLED=true</code> no .env para liberar.</span>
      </div>
    </form>

    <div v-if="error" class="notice notice-warn" role="alert"><div><strong>{{ error.message }}</strong><p v-if="error.detail">{{ error.detail }}</p></div></div>
    <template v-if="result">
      <div class="section-heading"><h2>Resposta<span v-if="result.count !== undefined"> · {{ result.count }} registro(s)</span></h2>
        <span class="lead">{{ result.durationMs }} ms · <button class="link-button" @click="view = view === 'tree' ? 'json' : 'tree'">{{ view === 'tree' ? 'JSON bruto' : 'Árvore' }}</button></span></div>
      <div v-if="view === 'tree'" class="json-panel"><JsonTree :value="result.data" /></div>
      <pre v-else class="json-raw">{{ JSON.stringify(result.data, null, 2) }}</pre>
    </template>

    <template v-if="responseFields.length">
      <div class="section-heading"><h2>Resposta esperada · {{ op.response.schema }}{{ op.response.array ? '[]' : '' }}</h2></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Campo</th><th>Tipo</th><th>Descrição</th></tr></thead>
        <tbody><tr v-for="f in responseFields" :key="f.name"><td><code>{{ f.name }}</code></td><td><small>{{ typeLabel(f) }}</small></td><td><small>{{ f.description || '—' }}</small></td></tr></tbody>
      </table></div>
    </template>
  </section>
  <section v-else class="page-content"><div class="empty-state"><h2>Operação não encontrada</h2><p><RouterLink to="/lagom">Voltar ao catálogo</RouterLink></p></div></section>
</template>
