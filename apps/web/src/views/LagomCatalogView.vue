<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { kindLabel, kindOrder, lagomOperations, lagomRequest, lagomState, refreshLagomStatus, LagomApiError } from '../composables/lagom';

const search = ref('');
const testing = ref(false);
const testResult = ref<{ ok: boolean; message: string } | null>(null);
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const groups = computed(() => {
  const term = norm(search.value.trim());
  return kindOrder.map(kind => ({
    kind, label: kindLabel[kind],
    ops: lagomOperations.filter(o => o.kind === kind && (!term || norm(`${o.summary} ${o.path} ${o.description}`).includes(term))),
  })).filter(g => g.ops.length);
});
onMounted(refreshLagomStatus);
async function test() {
  testing.value = true; testResult.value = null;
  try {
    const r = await lagomRequest<{ organization: string; accessTokenExpiresAt: string }>('test', 'POST');
    testResult.value = { ok: true, message: `Conectado à organização ${r.organization}. Token válido até ${new Date(r.accessTokenExpiresAt).toLocaleTimeString('pt-BR')}.` };
    await refreshLagomStatus();
  } catch (e) { testResult.value = { ok: false, message: e instanceof LagomApiError ? `${e.message}${e.detail ? ' — ' + e.detail : ''}` : 'Falha.' }; }
  finally { testing.value = false; }
}
</script>

<template>
  <section class="page-content">
    <div class="page-heading">
      <div>
        <p class="eyebrow">LAGOM DRP · INTEGRATION API</p>
        <h1>APIs Lagom</h1>
        <p class="lead">{{ lagomOperations.filter(o => o.kind !== 'auth').length }} operações do OpenAPI oficial. Consultas rodam direto; operações que gravam exigem <code>LAGOM_WRITE_ENABLED=true</code>.</p>
      </div>
      <span :class="['state-pill', lagomState.status?.writeEnabled ? 'state-pending' : 'state-disabled']">{{ lagomState.status?.writeEnabled ? 'ESCRITA LIBERADA' : 'ESCRITA BLOQUEADA' }}</span>
    </div>

    <div class="connection-card lagom-conn">
      <div>
        <h2>Conexão</h2>
        <p v-if="lagomState.error" class="text-red">{{ lagomState.error }}</p>
        <p v-else-if="lagomState.status">
          <template v-if="lagomState.status.configured">Organização <strong>{{ lagomState.status.organization }}</strong> em <code>{{ lagomState.status.baseUrl }}</code>.
            {{ lagomState.status.authenticated ? 'Sessão ativa até ' + new Date(lagomState.status.accessTokenExpiresAt!).toLocaleTimeString('pt-BR') + ' (renovação automática).' : 'Login é feito na primeira chamada.' }}</template>
          <template v-else>Credenciais ausentes: preencha <code>LAGOM_ORGANIZATION</code> e <code>LAGOM_TOKEN</code> no .env.</template>
        </p>
        <p v-if="testResult" :class="testResult.ok ? 'text-green' : 'text-red'" role="status">{{ testResult.message }}</p>
      </div>
      <div class="lagom-conn-actions">
        <button class="button-primary" :disabled="testing" @click="test">{{ testing ? 'Testando…' : 'Testar conexão' }}</button>
        <RouterLink class="button-secondary" to="/lagom/compatibilidade">Cadastros Bling → Lagom</RouterLink>
      </div>
    </div>

    <div class="product-filters"><label>Buscar<input v-model="search" placeholder="Ex.: item, fornecedor, estoque" /></label></div>

    <div class="catalog-grid">
      <article v-for="g in groups" :key="g.kind" class="connection-card catalog-card">
        <h2>{{ g.label }}</h2>
        <ul>
          <li v-for="o in g.ops" :key="o.id">
            <RouterLink :to="`/lagom/op/${o.id}`">
              <span class="endpoint-summary"><span :class="['method', `method-${o.method.toLowerCase()}`]">{{ o.method }}</span> {{ o.summary }}</span>
              <code>{{ o.path }}</code>
            </RouterLink>
            <span v-if="o.mutating" class="state-pill state-pending" title="Grava dados no Lagom">grava</span>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>
