<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getApiHealth, type ApiHealth } from '../services/api.js';

const health = ref<ApiHealth | null>(null);
const error = ref('');
const loading = ref(true);

async function refresh() {
  loading.value = true;
  error.value = '';
  try {
    health.value = await getApiHealth();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Não foi possível consultar a API interna.';
  } finally {
    loading.value = false;
  }
}

onMounted(refresh);
</script>

<template>
  <section class="page-content">
    <div class="page-heading">
      <div>
        <p class="eyebrow">ESTADO DO SISTEMA</p>
        <h1>Visão geral</h1>
        <p class="lead">Base operacional do middleware Lagom DRP ↔ Bling.</p>
      </div>
      <button class="button-secondary" type="button" @click="refresh">Actualizar estado</button>
    </div>

    <div class="notice notice-warn">
      <strong>Modo de preparação</strong>
      <span>Os conectores e os jobs ainda não executam operações reais. Nenhuma compra, transferência ou carga foi enviada.</span>
    </div>

    <div class="metric-grid">
      <article class="metric-card">
        <span class="metric-label">API do middleware</span>
        <strong class="metric-value" :class="health ? 'text-green' : 'text-muted'">
          {{ loading ? 'A verificar…' : health ? 'Disponível' : 'Sem ligação' }}
        </strong>
        <small>{{ error || (health ? `Última verificação: ${new Date(health.timestamp).toLocaleTimeString('pt-BR')}` : 'Aguarda resposta da API interna') }}</small>
      </article>
      <article class="metric-card">
        <span class="metric-label">Transacções persistidas</span>
        <strong class="metric-value text-muted">—</strong>
        <small>Repositório de leitura ainda não ligado à interface</small>
      </article>
      <article class="metric-card">
        <span class="metric-label">Agendamentos</span>
        <strong class="metric-value text-amber">Desactivados</strong>
        <small>Serão habilitados apenas após homologação e autorização</small>
      </article>
    </div>

    <div class="section-heading">
      <div>
        <p class="eyebrow">PRÓXIMAS DECISÕES</p>
        <h2>Bloqueios que exigem validação</h2>
      </div>
    </div>
    <div class="decision-list">
      <div class="decision-row"><span class="decision-number">01</span><div><strong>Transferência de stock no Bling</strong><p>Sem endpoint nativo confirmado; o fluxo permanece bloqueado.</p></div><span class="state-pill state-blocked">BLOQUEADO</span></div>
      <div class="decision-row"><span class="decision-number">02</span><div><strong>OAuth e permissões do Bling</strong><p>Confirmar hostname OAuth e permissões com a aplicação registada.</p></div><span class="state-pill state-pending">PENDENTE</span></div>
      <div class="decision-row"><span class="decision-number">03</span><div><strong>Origem da verdade por entidade</strong><p>Definir propriedade de produtos, fornecedores, filiais, saldos e compras.</p></div><span class="state-pill state-pending">PENDENTE</span></div>
    </div>
  </section>
</template>
