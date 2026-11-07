<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { adminToken, needsKey, availability, BlingApiError } from '../composables/bling';
import { availabilityLabel, blingEndpoints, blingGroups, probeAvailability, probeable } from '../composables/blingCatalog';

const search = ref('');
const onlyAvailable = ref(false);
const probing = ref(false);
const progress = ref({ done: 0, total: 0 });
const error = ref('');
const signal = { cancelled: false };
onBeforeUnmount(() => { signal.cancelled = true; });

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const groups = computed(() => {
  const term = norm(search.value.trim());
  return blingGroups.map(g => ({
    ...g,
    endpoints: g.endpoints.filter(e =>
      (!term || norm(`${g.tag} ${e.summary} ${e.path}`).includes(term)) &&
      (!onlyAvailable.value || availability[e.id]?.state === 'ok')),
  })).filter(g => g.endpoints.length);
});
const counts = computed(() => {
  const c = { ok: 0, forbidden: 0, error: 0 };
  for (const e of blingEndpoints) { const s = availability[e.id]?.state; if (s === 'ok' || s === 'forbidden' || s === 'error') c[s]++; }
  return c;
});
const probeTotal = blingEndpoints.filter(probeable).length;

async function probe() {
  probing.value = true; error.value = ''; signal.cancelled = false;
  progress.value = { done: 0, total: probeTotal };
  try { await probeAvailability(blingEndpoints, (done, total) => { progress.value = { done, total }; }, signal); }
  catch (e) { error.value = e instanceof BlingApiError ? e.message : 'Falha na verificação.'; }
  finally { probing.value = false; }
}
function stop() { signal.cancelled = true; }
</script>

<template>
  <section class="page-content">
    <div class="page-heading">
      <div>
        <p class="eyebrow">BLING API V3 · REFERÊNCIA OFICIAL</p>
        <h1>APIs Bling</h1>
        <p class="lead">{{ blingEndpoints.length }} consultas GET em {{ blingGroups.length }} recursos. Todas somente leitura, pelo token da sua conta.</p>
      </div>
      <span class="state-pill">Somente GET</span>
    </div>

    <div class="product-filters">
      <label v-if="needsKey" class="credential-field">Chave administrativa
        <input v-model="adminToken" type="password" autocomplete="off" placeholder="Informe a chave do painel" :disabled="probing" />
      </label>
      <label>Buscar<input v-model="search" placeholder="Ex.: pedidos, nfe, estoque" /></label>
      <label class="check-inline"><input v-model="onlyAvailable" type="checkbox" /> Só disponíveis</label>
      <button v-if="!probing" class="button-primary" :disabled="needsKey" @click="probe">Verificar disponibilidade</button>
      <button v-else class="button-secondary" @click="stop">Parar ({{ progress.done }}/{{ progress.total }})</button>
    </div>

    <div v-if="error" class="notice notice-warn" role="alert"><strong>{{ error }}</strong><span><RouterLink to="/connections">Ir para Conexões</RouterLink></span></div>
    <p class="lead probe-summary" role="status">
      <template v-if="probing">Verificando {{ progress.done }} de {{ progress.total }} — respeitando o limite de requisições da Bling…</template>
      <template v-else-if="counts.ok + counts.forbidden + counts.error">
        <span class="text-green">{{ counts.ok }} disponíveis</span> · <span class="text-red">{{ counts.forbidden }} sem permissão</span> · <span class="text-amber">{{ counts.error }} com erro</span>.
        Endpoints que exigem um ID são inferidos pela listagem do recurso.
      </template>
      <template v-else>A verificação faz uma consulta mínima (1 registro) em cada listagem para descobrir os escopos liberados ao seu usuário — cerca de {{ Math.ceil(probeTotal / 2) }}s.</template>
    </p>

    <div class="catalog-grid">
      <article v-for="g in groups" :key="g.group" class="connection-card catalog-card">
        <h2>{{ g.tag }}</h2>
        <ul>
          <li v-for="e in g.endpoints" :key="e.id">
            <RouterLink :to="`/bling/${e.id}`">
              <span class="endpoint-summary">{{ e.summary }}</span>
              <code>{{ e.path }}</code>
            </RouterLink>
            <span v-if="availability[e.id]" :class="['state-pill', `avail-${availability[e.id]!.state}`]" :title="availability[e.id]!.detail">{{ availabilityLabel[availability[e.id]!.state] }}</span>
          </li>
        </ul>
      </article>
    </div>
    <div v-if="!groups.length" class="empty-state"><h2>Nenhum endpoint encontrado</h2><p>Altere a busca ou desmarque "Só disponíveis".</p></div>
  </section>
</template>
