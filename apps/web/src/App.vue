<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { adminToken, connection, refreshConnection } from './composables/bling';
import { lagomState, refreshLagomStatus } from './composables/lagom';

const time = (iso?: string) => iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—';
const statusText = computed(() => ({
  ACTIVE: `Bling conectada · renovação automática (última ${time(connection.lastRefreshAt)})`,
  PENDING: 'Bling não autorizada — conecte em Conexões',
  EXPIRED: 'Bling exige nova autorização — vá em Conexões',
  NO_KEY: 'Verificando conexão…',
  BAD_KEY: 'Proxy sem a chave do .env — veja Conexões',
  OFFLINE: 'API do middleware indisponível',
  unknown: 'Verificando conexão…',
}[connection.state]));
const statusClass = computed(() => connection.state === 'ACTIVE' ? 'dot-ok' : ['EXPIRED', 'PENDING', 'OFFLINE', 'BAD_KEY'].includes(connection.state) ? 'dot-bad' : '');
let timer: ReturnType<typeof setInterval> | undefined;
onMounted(() => { void refreshConnection(); void refreshLagomStatus(); timer = setInterval(refreshConnection, 60000); });
onBeforeUnmount(() => clearInterval(timer));
watch(adminToken, () => void refreshConnection());
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand-lockup">
        <div class="brand-mark" aria-hidden="true">L↔B</div>
        <div>
          <strong>Lagom <span>×</span> Bling</strong>
          <small>Central de integrações</small>
        </div>
      </div>

      <nav class="navigation" aria-label="Navegação principal">
        <RouterLink to="/bling" class="nav-link" active-class="active">
          <span class="nav-symbol">API</span> APIs Bling (GET)
        </RouterLink>
        <RouterLink to="/lagom" class="nav-link" :class="{ active: $route.path === '/lagom' || $route.path.startsWith('/lagom/op') }">
          <span class="nav-symbol">LGM</span> APIs Lagom
        </RouterLink>
        <RouterLink to="/lagom/dados" class="nav-link" active-class="active">
          <span class="nav-symbol">DRP</span> Dados no Lagom
        </RouterLink>
        <RouterLink to="/lagom/compatibilidade" class="nav-link" active-class="active">
          <span class="nav-symbol">B→L</span> Cadastros Bling → Lagom
        </RouterLink>
        <RouterLink to="/lagom/log" class="nav-link" active-class="active">
          <span class="nav-symbol">LOG</span> Log das cargas
        </RouterLink>
        <RouterLink to="/products" class="nav-link" active-class="active">
          <span class="nav-symbol">P</span> Produtos Bling
        </RouterLink>
        <RouterLink to="/" class="nav-link" exact-active-class="active">
          <span class="nav-symbol">01</span> Visão geral
        </RouterLink>
        <RouterLink to="/transactions" class="nav-link" active-class="active">
          <span class="nav-symbol">02</span> Transações
        </RouterLink>
        <RouterLink to="/jobs" class="nav-link" active-class="active">
          <span class="nav-symbol">03</span> Agendamentos
        </RouterLink>
        <RouterLink to="/connections" class="nav-link" active-class="active">
          <span class="nav-symbol">04</span> Conexões e contratos
        </RouterLink>
      </nav>

      <div class="sidebar-foot">
        <span :class="['status-dot', statusClass]" aria-hidden="true"></span>
        <RouterLink to="/connections" class="status-link" :title="connection.expiresAt ? 'Token atual válido até ' + new Date(connection.expiresAt).toLocaleString('pt-BR') : ''">{{ statusText }}</RouterLink>
      </div>
    </aside>

    <main class="main-area">
      <header class="topbar">
        <span class="eyebrow">MIDDLEWARE · AMBIENTE LOCAL</span>
        <span class="topbar-badge">BLING · SOMENTE LEITURA · LAGOM · {{ lagomState.status?.writeEnabled ? 'ESCRITA LIBERADA' : 'ESCRITA BLOQUEADA' }}</span>
      </header>
      <RouterView />
    </main>
  </div>
</template>
