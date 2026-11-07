<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { adminToken, needsKey, blingRequest } from '../composables/bling';
interface Product { id: number | string; nome: string; codigo?: string; preco?: number | null; unidade?: string; situacao?: string }
const products = ref<Product[]>([]);
const name = ref('');
const code = ref('');
const pageSize = ref(25);
const page = ref(1);
const busy = ref(false);
const error = ref('');
const loaded = ref(false);
const hasMore = ref(false);
const applied = ref({ nome: '', codigo: '', limite: 25 });
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
async function load(target = 1, search = false) {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  const filters = search ? { nome: name.value.trim(), codigo: code.value.trim(), limite: pageSize.value } : applied.value;
  try {
    const query = new URLSearchParams({ pagina: String(target), limite: String(filters.limite) });
    if (filters.nome) query.set('nome', filters.nome);
    if (filters.codigo) query.set('codigo', filters.codigo);
    const result = await blingRequest('products?' + query);
    products.value = result.data;
    page.value = result.pagina;
    hasMore.value = result.hasMore;
    applied.value = filters;
    loaded.value = true;
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Não foi possível consultar os produtos.';
  } finally { busy.value = false; }
}
onMounted(() => { if (!needsKey.value) void load(1, true); });
</script>

<template>
  <section class="page-content products-page">
    <div class="page-heading">
      <div><p class="eyebrow">CATÁLOGO BLING</p><h1>Produtos</h1><p class="lead">Consulte o catálogo da sua conta com busca por nome ou código.</p></div>
      <span class="state-pill">Somente leitura</span>
    </div>
    <form class="product-filters" @submit.prevent="load(1, true)">
      <label v-if="needsKey" class="credential-field">Chave administrativa
        <input v-model="adminToken" type="password" autocomplete="off" placeholder="Informe a chave do painel" :disabled="busy" />
      </label>
      <label>Nome do produto<input v-model="name" maxlength="200" placeholder="Ex.: Tinta acrílica" :disabled="busy" /></label>
      <label>Código / SKU<input v-model="code" maxlength="100" placeholder="Ex.: PROD-001" :disabled="busy" /></label>
      <label>Por página<select v-model.number="pageSize" :disabled="busy"><option :value="25">25</option><option :value="50">50</option><option :value="100">100</option></select></label>
      <button class="button-primary" :disabled="busy || needsKey" type="submit">{{ busy ? 'Consultando…' : 'Consultar produtos' }}</button>
    </form>
    <div v-if="error" class="notice notice-warn" role="alert"><div><strong>{{ error }}</strong><p><RouterLink to="/connections">Ir para Conexões</RouterLink></p></div></div>
    <p v-if="busy" role="status" class="lead" style="margin:20px 0">Buscando produtos na Bling…</p>
    <template v-if="loaded">
      <div class="section-heading"><h2>{{ products.length }} produto(s) nesta página</h2><span class="lead">Página {{ page }}</span></div>
      <div v-if="products.length" class="table-wrap" :aria-busy="busy">
        <table><thead><tr><th>Produto</th><th>Código / SKU</th><th>Unidade</th><th>Preço de venda</th><th>Situação</th></tr></thead>
          <tbody><tr v-for="product in products" :key="product.id">
            <td><strong>{{ product.nome }}</strong><small class="product-id">ID {{ product.id }}</small></td>
            <td><code>{{ product.codigo || '—' }}</code></td><td>{{ product.unidade || '—' }}</td>
            <td>{{ product.preco == null ? '—' : currency.format(product.preco) }}</td>
            <td><span :class="['state-pill', product.situacao === 'A' ? 'text-green' : 'state-disabled']">{{ product.situacao === 'A' ? 'Ativo' : product.situacao === 'I' ? 'Inativo' : product.situacao || '—' }}</span></td>
          </tr></tbody>
        </table>
      </div>
      <div v-else class="empty-state"><h2>Nenhum produto encontrado</h2><p>Revise os filtros ou volte à página anterior.</p></div>
      <nav class="product-pagination" aria-label="Páginas dos produtos">
        <button class="button-secondary" :disabled="busy || page <= 1" @click="load(page - 1)">Anterior</button>
        <span>Página {{ page }}</span>
        <button class="button-secondary" :disabled="busy || !hasMore" @click="load(page + 1)">Próxima</button>
      </nav>
    </template>
    <div v-else-if="!busy && !error" class="empty-state"><h2>Seu catálogo, direto da Bling</h2><p>Informe a chave administrativa e clique em Consultar produtos. Para autorizar sua conta pela primeira vez, acesse <RouterLink to="/connections">Conexões</RouterLink>.</p></div>
  </section>
</template>
