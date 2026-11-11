<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { lagomState, refreshLagomStatus } from '../composables/lagom';
import { adminToken, needsKey, blingRequest as request, connection, forgetAdminToken, refreshConnection } from '../composables/bling';
const fmt = (iso?: string) => iso ? new Date(iso).toLocaleString('pt-BR') : '—';
const status = computed(() => ({
  ACTIVE: 'Conectada — o servidor renova o token sozinho, sem ação sua.',
  PENDING: 'Aguardando a primeira autorização.',
  EXPIRED: 'A Bling recusou a renovação (autorização revogada ou sem uso por mais de 30 dias). Clique em Conectar Bling.',
  NO_KEY: 'Informe a chave administrativa para ver o status.',
  BAD_KEY: 'Chave administrativa inválida.',
  OFFLINE: 'API do middleware indisponível.',
  unknown: 'Verificando…',
}[connection.state]));
onMounted(() => { void refreshConnection(); void refreshLagomStatus(); });
const message = ref('');
const busy = ref(false);
const authorizationUrl = ref('');
const callbackUrl = ref('');
async function action(kind: 'connect' | 'status' | 'test' | 'complete') {
  busy.value = true;
  message.value = '';
  try {
    const data = await request(kind, kind === 'status' ? 'GET' : 'POST', kind === 'complete' ? { callbackUrl: callbackUrl.value } : undefined);
    if (kind === 'connect') authorizationUrl.value = data.authorizationUrl;
    if (kind === 'complete') { callbackUrl.value = ''; authorizationUrl.value = ''; message.value = 'Autorização salva com segurança.'; }
    if (kind === 'status' || kind === 'complete') await refreshConnection();
    if (kind === 'test') message.value = 'Conexão confirmada: consulta de produtos realizada com sucesso.';
  } catch (error) { message.value = error instanceof Error ? error.message : 'Falha na conexão'; }
  finally { busy.value = false; }
}
</script>

<template>
  <section class="page-content">
    <div class="page-heading"><div><p class="eyebrow">CONEXÕES</p><h1>Conexões</h1><p class="lead">Autorize a Bling e acompanhe a conexão.</p></div></div>
    <div class="connection-grid">
      <article class="connection-card">
        <h2>Bling API v3</h2><p>{{ status }}</p>
        <p v-if="connection.state === 'ACTIVE'">Última renovação: {{ fmt(connection.lastRefreshAt) }} · token atual válido até {{ fmt(connection.expiresAt) }}</p>
        <template v-if="needsKey"><label for="admin-token">Chave administrativa</label>
        <input id="admin-token" v-model="adminToken" type="password" autocomplete="off" placeholder="ADMIN_API_TOKEN do servidor" style="display:block;width:100%;margin:12px 0;padding:10px;box-sizing:border-box" />
        <p>A chave fica lembrada neste navegador. Ela protege o painel; a conexão Bling é mantida pelo servidor. <button type="button" class="link-button" @click="forgetAdminToken">Esquecer chave</button></p></template>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button :disabled="busy || needsKey" @click="action('connect')">Conectar Bling</button>
          <button :disabled="busy || needsKey" @click="action('status')">Atualizar</button>
          <button :disabled="busy || needsKey" @click="action('test')">Testar conexão</button>
        </div>
        <div v-if="authorizationUrl" style="margin-top:16px">
          <a :href="authorizationUrl" target="_blank" rel="noreferrer">Abrir autorização na Bling</a>
          <p>Se o retorno automático ainda não estiver configurado, cole aqui a URL de retorno em até 30 segundos após autorizar.</p>
          <label for="callback-url">URL de retorno</label>
          <input id="callback-url" v-model="callbackUrl" type="password" autocomplete="off" style="display:block;width:100%;margin:12px 0;box-sizing:border-box" />
          <button :disabled="busy || !callbackUrl" @click="action('complete')">Concluir autorização</button>
        </div>
        <p role="status">{{ message }}</p>
      </article>
      <article class="connection-card"><h2>Lagom DRP</h2>
        <p v-if="lagomState.status?.configured">Organização <strong>{{ lagomState.status.organization }}</strong> · login e renovação automáticos pelo servidor. Escrita {{ lagomState.status.writeEnabled ? 'liberada' : 'bloqueada (LAGOM_WRITE_ENABLED=false)' }}.</p>
        <p v-else>Preencha LAGOM_ORGANIZATION e LAGOM_TOKEN no .env.</p>
        <RouterLink to="/lagom">Testar e explorar as APIs Lagom</RouterLink></article>
      <article class="connection-card"><h2>Cadastros Bling → Lagom</h2><p>Leitura dos cadastros da Bling, relatório de compatibilidade e carga no Lagom.</p><RouterLink to="/lagom/compatibilidade">Abrir</RouterLink></article>
    </div>
  </section>
</template>
