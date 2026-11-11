<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import JsonTree from '../components/JsonTree.vue';
import { lagomRequest, lagomState, refreshLagomStatus, LagomApiError } from '../composables/lagom';

type Severity = 'erro' | 'aviso' | 'info';
interface Issue { code: string; severity: Severity; message: string; field?: string; count: number; examples: { sourceId?: string; name?: string }[] }
interface Summary { resource: string; title: string; operation: string; schema: string; order: number; source: string; total: number; ready: number; withErrors: number; withWarnings: number; skipped: number; issues: Issue[]; skippedReasons: { reason: string; count: number; examples: { sourceId: string; name: string }[] }[]; notes: { code: string; severity: Severity; message: string }[]; sample: unknown[] }
interface Report { generatedAt: string; snapshotAt: string | null; snapshotRecords: number; totals: { total: number; ready: number; withErrors: number; skipped: number }; findings: { severity: Severity; title: string; detail: string; count?: number }[]; resources: Summary[] }
interface SnapshotInfo { state: { status: string; mode?: string; step?: string; done: number; total: number; detailErrors: number; errorCode?: string; startedAt?: string; finishedAt?: string }; lastSuccessAt?: string | null; resources?: Record<string, { count: number; lastFetchedAt: string | null }> }
interface LoadResult { resource: string; operation: string; eligible: number; unchanged: number; blocked: number; sent: number; confirmed: number; rejected: number; rejections: { code: string; status?: number; message?: string }[] }
interface LoadInfo { state: { status: string; dryRun?: boolean; runId?: string; current?: string; results: LoadResult[]; errorCode?: string; errorDetail?: unknown; startedAt?: string; finishedAt?: string }; writeEnabled: boolean }
type Options = Record<string, any>;

const snapshot = ref<SnapshotInfo | null>(null);
const report = ref<Report | null>(null);
const load = ref<LoadInfo | null>(null);
const options = reactive<Options>({});
const unitMapText = ref('');
const error = ref('');
const busy = ref('');
const open = ref<string | null>(null);
const browser = reactive<{ resource: string; filter: string; code: string; search: string; pagina: number; total: number; rows: any[]; loading: boolean }>({ resource: '', filter: 'erro', code: '', search: '', pagina: 1, total: 0, rows: [], loading: false });

const fmt = (iso?: string | null) => iso ? new Date(iso).toLocaleString('pt-BR') : '—';
const msg = (e: unknown) => e instanceof LagomApiError ? `${e.message}${e.detail ? ' — ' + e.detail : ''}` : 'Falha.';
const snapshotLabels: Record<string, string> = { empresa: 'Empresa', deposito: 'Depósitos', categoria: 'Categorias', 'grupo-produto': 'Grupos de produtos', 'forma-pagamento': 'Formas de pagamento', contato: 'Contatos', 'contato-detalhe': 'Detalhes de contato', produto: 'Produtos', 'produto-detalhe': 'Detalhes de produto', 'produto-fornecedor': 'Vínculos produto/fornecedor' };
const running = computed(() => snapshot.value?.state.status === 'running');
const loading = computed(() => load.value?.state.status === 'running');
const progress = computed(() => { const s = snapshot.value?.state; return s && s.total ? Math.round((s.done / s.total) * 100) : 0; });
const hasData = computed(() => (snapshot.value?.resources?.produto?.count ?? 0) > 0);

async function refreshSnapshot() { snapshot.value = await lagomRequest<SnapshotInfo>('snapshot'); }
async function refreshReport() { if (hasData.value) report.value = await lagomRequest<Report>('compat'); }
async function refreshLoad() { load.value = await lagomRequest<LoadInfo>('load'); }
async function refreshOptions() {
  const r = await lagomRequest<{ options: Options }>('options');
  Object.assign(options, r.options);
  unitMapText.value = Object.entries(r.options.unitMap ?? {}).map(([k, v]) => `${k}=${v}`).join(', ');
}
async function init() {
  error.value = '';
  try { await Promise.all([refreshSnapshot(), refreshOptions(), refreshLoad(), refreshLagomStatus()]); await refreshReport(); }
  catch (e) { error.value = msg(e); }
}

let timer: ReturnType<typeof setInterval> | undefined;
let wasRunning = false;
onMounted(() => {
  void init();
  timer = setInterval(async () => {
    try {
      if (running.value || wasRunning) { await refreshSnapshot(); if (wasRunning && !running.value) await refreshReport(); wasRunning = running.value; }
      if (loading.value) await refreshLoad();
    } catch { /* próxima tentativa */ }
  }, 3000);
});
onBeforeUnmount(() => clearInterval(timer));

async function startSnapshot(mode: 'incremental' | 'full') {
  busy.value = 'snapshot'; error.value = '';
  try { snapshot.value = { ...snapshot.value, ...(await lagomRequest<SnapshotInfo>('snapshot', 'POST', { mode })) }; wasRunning = true; }
  catch (e) { error.value = msg(e); } finally { busy.value = ''; }
}
async function saveOptions() {
  busy.value = 'options'; error.value = '';
  const unitMap = Object.fromEntries(unitMapText.value.split(/[,;\n]+/).map(s => s.split('=').map(x => x.trim())).filter(([k, v]) => k && v));
  try { await lagomRequest('options', 'PUT', { ...options, unitMap }); await refreshOptions(); await refreshReport(); }
  catch (e) { error.value = msg(e); } finally { busy.value = ''; }
}
async function startLoad(dryRun: boolean) {
  if (!dryRun && !window.confirm('Enviar ao Lagom todos os cadastros sem erro, na ordem de dependência? Os registros já enviados e sem alteração são ignorados.')) return;
  busy.value = 'load'; error.value = '';
  try { load.value = { ...(load.value as LoadInfo), ...(await lagomRequest<LoadInfo>('load', 'POST', { dryRun })) }; }
  catch (e) { error.value = msg(e); } finally { busy.value = ''; }
}
async function browse(resource: string, patch: Partial<typeof browser> = {}) {
  Object.assign(browser, { resource, pagina: 1, ...patch, loading: true });
  try {
    const q = new URLSearchParams({ filter: browser.filter, pagina: String(browser.pagina), limite: '25' });
    if (browser.code) q.set('code', browser.code);
    if (browser.search) q.set('search', browser.search);
    const r = await lagomRequest<{ total: number; records?: any[]; skipped?: any[] }>(`compat/${resource}?${q}`);
    browser.total = r.total; browser.rows = r.records ?? r.skipped ?? [];
  } catch (e) { error.value = msg(e); } finally { browser.loading = false; }
}
function toggle(resource: string) {
  open.value = open.value === resource ? null : resource;
  if (open.value) { const r = report.value?.resources.find(x => x.resource === resource); void browse(resource, { filter: r?.withErrors ? 'erro' : r?.total ? 'all' : 'skipped', code: '', search: '' }); }
}
const sevClass = (s: Severity) => s === 'erro' ? 'state-blocked' : s === 'aviso' ? 'state-pending' : 'state-disabled';
const loadTotals = computed(() => (load.value?.state.results ?? []).reduce((t, r) => ({ pending: t.pending + r.eligible - r.unchanged, confirmed: t.confirmed + r.confirmed, rejected: t.rejected + r.rejected }), { pending: 0, confirmed: 0, rejected: 0 }));
</script>

<template>
  <section class="page-content">
    <nav class="crumbs" aria-label="Trilha"><RouterLink to="/lagom">APIs Lagom</RouterLink> / <span>Cadastros Bling → Lagom</span></nav>
    <div class="page-heading">
      <div>
        <p class="eyebrow">CARGA DE CADASTROS · BLING → LAGOM</p>
        <h1>Compatibilidade de cadastros</h1>
        <p class="lead">Lê os cadastros da Bling, converte para os DTOs do Lagom, valida contra o OpenAPI e as referências entre cadastros, e prepara o envio na ordem de dependência.</p>
      </div>
      <span :class="['state-pill', lagomState.status?.writeEnabled ? 'state-pending' : 'state-disabled']">{{ lagomState.status?.writeEnabled ? 'ESCRITA LIBERADA' : 'ESCRITA BLOQUEADA' }}</span>
    </div>
    <div v-if="error" class="notice notice-warn" role="alert"><strong>{{ error }}</strong></div>

    <!-- 1. Snapshot -->
    <div class="section-heading"><h2>1 · Dados da Bling</h2><span class="lead">Último snapshot completo: {{ fmt(snapshot?.lastSuccessAt) }}</span></div>
    <div class="connection-card">
      <div class="snapshot-grid">
        <div v-for="(label, key) in snapshotLabels" :key="key" class="snapshot-item"><span>{{ label }}</span><strong>{{ snapshot?.resources?.[key]?.count ?? 0 }}</strong></div>
      </div>
      <div v-if="running" class="snapshot-progress" role="status">
        <div class="bar"><span :style="{ width: progress + '%' }"></span></div>
        <small>{{ snapshot?.state.step }} — os detalhes são lidos a 2 req/s (limite da Bling); pode levar mais de 1 hora na primeira vez. A leitura continua no servidor se você fechar a página.</small>
      </div>
      <p v-else-if="snapshot?.state.status === 'failed'" class="text-red">Leitura interrompida ({{ snapshot.state.errorCode }}). Rode novamente: o que já foi lido fica guardado.</p>
      <p v-else-if="snapshot?.state.status === 'done'" class="text-green">Leitura concluída em {{ fmt(snapshot.state.finishedAt) }}{{ snapshot.state.detailErrors ? ` · ${snapshot.state.detailErrors} detalhe(s) com erro` : '' }}.</p>
      <div class="result-actions">
        <button class="button-primary" :disabled="running || busy === 'snapshot'" @click="startSnapshot('incremental')">{{ hasData ? 'Atualizar da Bling' : 'Ler cadastros da Bling' }}</button>
        <button class="button-secondary" :disabled="running || busy === 'snapshot'" @click="startSnapshot('full')" title="Relê o detalhe de todos os produtos e contatos">Releitura completa</button>
      </div>
    </div>

    <template v-if="report">
      <!-- 2. Constatações -->
      <div class="section-heading"><h2>2 · Compatibilidade</h2><span class="lead">{{ report.totals.ready }} de {{ report.totals.total }} registros prontos · {{ report.totals.withErrors }} com erro · {{ report.totals.skipped }} ignorados</span></div>
      <div class="finding-list">
        <div v-for="f in report.findings" :key="f.title" class="finding">
          <span :class="['state-pill', sevClass(f.severity)]">{{ f.severity.toUpperCase() }}</span>
          <div><strong>{{ f.title }}<template v-if="f.count"> · {{ f.count }}</template></strong><p>{{ f.detail }}</p></div>
        </div>
      </div>

      <!-- 3. Opções -->
      <details class="connection-card options-card">
        <summary><strong>Decisões de mapeamento</strong> <small class="lead">— ajuste e o relatório é recalculado</small></summary>
        <form class="options-grid" @submit.prevent="saveOptions">
          <label>Frete padrão do fornecedor <b class="required">*</b><input v-model="options.supplierFreight" placeholder="Valor aceito pelo Lagom (ex.: CIF)" /></label>
          <label>Termo de pagamento padrão <b class="required">*</b><input v-model="options.supplierPaymentTerm" placeholder="Código do termo (ex.: ID da forma Bling)" /></label>
          <label>Código do grupo de filial<input v-model="options.branchGroupCode" /></label>
          <label>Nome do grupo de filial<input v-model="options.branchGroupName" placeholder="(nome da empresa)" /></label>
          <label>Código de barras sem GTIN<select v-model="options.barcodeFallback"><option value="sku">SKU da Bling</option><option value="id">ID da Bling</option><option value="none">Não preencher</option></select></label>
          <label>Código do fornecedor ausente<select v-model="options.supplierCodeFallback"><option value="sku">SKU da Bling</option><option value="none">Não preencher</option></select></label>
          <label>Composições<select v-model="options.compositions"><option value="virtual">Só kits de estoque virtual</option><option value="all">Também estoque físico</option><option value="none">Não enviar</option></select></label>
          <label>Grupo de cliente<select v-model="options.customerGroupMode"><option value="uf">Por UF</option><option value="tipo-pessoa">PF / PJ</option><option value="unico">Grupo único</option></select></label>
          <label>Clientes<select v-model="options.customerScope"><option value="todos">Todos os contatos (exceto só fornecedor)</option><option value="cliente">Só tipo Cliente</option></select></label>
          <label>Alvo de cobrança do grupo<select v-model="options.customerGroupBillingTarget"><option value="M">M · filial do movimento</option><option value="I">I · filial do produto</option><option value="C">C · filial do cliente</option></select></label>
          <label>Mapa de unidades (Bling=Lagom)<input v-model="unitMapText" placeholder="UN=UN, CX=CAIXA" /></label>
          <div class="options-checks">
            <label class="check-inline"><input v-model="options.includeWarrantyItems" type="checkbox" /> Enviar itens "Garantia:"</label>
            <label class="check-inline"><input v-model="options.includeServices" type="checkbox" /> Enviar produtos tipo serviço</label>
            <label class="check-inline"><input v-model="options.includeVariationParents" type="checkbox" /> Enviar produto pai de variações</label>
            <label class="check-inline"><input v-model="options.makeToStock" type="checkbox" /> makeToStock (gera previsão de demanda)</label>
            <label class="check-inline"><input v-model="options.sendBranchItemParameters" type="checkbox" /> Enviar estoque mínimo/máximo</label>
          </div>
          <div class="result-actions"><button class="button-primary" :disabled="busy === 'options'" type="submit">{{ busy === 'options' ? 'Recalculando…' : 'Salvar e recalcular' }}</button></div>
        </form>
      </details>

      <!-- Recursos -->
      <div class="table-wrap compat-table">
        <table>
          <thead><tr><th>#</th><th>Cadastro Lagom</th><th>Origem Bling</th><th>Registros</th><th>Prontos</th><th>Com erro</th><th>Ignorados</th></tr></thead>
          <tbody>
            <template v-for="r in report.resources" :key="r.resource">
              <tr :class="['compat-row', { open: open === r.resource }]" @click="toggle(r.resource)">
                <td>{{ r.order }}</td>
                <td><strong>{{ r.title }}</strong><small class="product-id">{{ r.operation }}</small></td>
                <td><small>{{ r.source }}</small></td>
                <td>{{ r.total }}</td>
                <td :class="r.ready === r.total && r.total ? 'text-green' : ''">{{ r.ready }}</td>
                <td :class="r.withErrors ? 'text-red' : ''">{{ r.withErrors }}</td>
                <td>{{ r.skipped }}</td>
              </tr>
              <tr v-if="open === r.resource" class="compat-detail"><td colspan="7">
                <div v-for="n in r.notes" :key="n.code" class="finding"><span :class="['state-pill', sevClass(n.severity)]">{{ n.severity.toUpperCase() }}</span><p>{{ n.message }}</p></div>
                <div v-for="i in r.issues" :key="i.severity + i.code + i.field" class="finding">
                  <span :class="['state-pill', sevClass(i.severity)]">{{ i.severity.toUpperCase() }}</span>
                  <div><strong>{{ i.count }} × {{ i.code }}<template v-if="i.field"> ({{ i.field }})</template></strong><p>{{ i.message }}</p>
                    <button class="link-button" @click.stop="browse(r.resource, { filter: 'all', code: i.code })">ver registros</button></div>
                </div>
                <div v-for="k in r.skippedReasons" :key="k.reason" class="finding">
                  <span class="state-pill state-disabled">IGNORADO</span>
                  <div><strong>{{ k.count }} registro(s)</strong><p>{{ k.reason }}</p><button class="link-button" @click.stop="browse(r.resource, { filter: 'skipped', code: '' })">ver registros</button></div>
                </div>
                <details v-if="r.sample.length" class="json-panel"><summary>Exemplo do payload enviado ({{ r.schema }})</summary><JsonTree :value="r.sample" /></details>

                <div class="product-filters browser-filters" @click.stop>
                  <label>Mostrar<select v-model="browser.filter" @change="browse(r.resource, { filter: browser.filter })"><option value="all">Todos</option><option value="ok">Prontos</option><option value="erro">Com erro</option><option value="aviso">Com aviso</option><option value="skipped">Ignorados</option></select></label>
                  <label>Buscar<input v-model="browser.search" placeholder="Nome ou código" @keyup.enter="browse(r.resource, { search: browser.search })" /></label>
                  <span v-if="browser.code" class="state-pill">{{ browser.code }} <button class="link-button" @click="browse(r.resource, { code: '' })">×</button></span>
                  <span class="lead">{{ browser.loading ? 'Carregando…' : `${browser.total} registro(s)` }}</span>
                </div>
                <div class="table-wrap" @click.stop>
                  <table>
                    <thead><tr><th>Código</th><th>Nome</th><th>{{ browser.filter === 'skipped' ? 'Motivo' : 'Problemas / payload' }}</th></tr></thead>
                    <tbody>
                      <tr v-for="row in browser.rows" :key="row.code ?? row.sourceId">
                        <td><code>{{ row.code ?? row.sourceId }}</code></td>
                        <td>{{ row.name }}</td>
                        <td v-if="browser.filter === 'skipped'"><small>{{ row.reason }}</small></td>
                        <td v-else>
                          <div v-for="(i, idx) in row.issues" :key="idx"><small :class="i.severity === 'erro' ? 'text-red' : i.severity === 'aviso' ? 'text-amber' : 'text-muted'">{{ i.message }}</small></div>
                          <details><summary><small>payload</small></summary><pre class="json-raw">{{ JSON.stringify(row.payload, null, 2) }}</pre></details>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <nav class="product-pagination" @click.stop>
                  <button class="button-secondary" :disabled="browser.pagina <= 1 || browser.loading" @click="browse(r.resource, { pagina: browser.pagina - 1 })">Anterior</button>
                  <span>Página {{ browser.pagina }} de {{ Math.max(1, Math.ceil(browser.total / 25)) }}</span>
                  <button class="button-secondary" :disabled="browser.pagina * 25 >= browser.total || browser.loading" @click="browse(r.resource, { pagina: browser.pagina + 1 })">Próxima</button>
                </nav>
              </td></tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- 4. Carga -->
      <div class="section-heading"><h2>3 · Enviar ao Lagom</h2><span class="lead">Só registros sem erro; reenvia apenas o que mudou desde o último envio confirmado.</span></div>
      <div class="connection-card">
        <p v-if="!load?.writeEnabled">A escrita está <strong>bloqueada</strong> (<code>LAGOM_WRITE_ENABLED=false</code>). A simulação mostra exatamente o que seria enviado, sem tocar no Lagom.</p>
        <div class="result-actions">
          <button class="button-secondary" :disabled="loading || busy === 'load'" @click="startLoad(true)">Simular envio</button>
          <button class="button-primary" :disabled="loading || busy === 'load' || !load?.writeEnabled" @click="startLoad(false)">Enviar ao Lagom</button>
          <span v-if="loading" class="lead">Enviando {{ load?.state.current }}…</span>
          <RouterLink v-if="load?.state.runId || loading" :to="{ path: '/lagom/log', query: load?.state.runId ? { run: load.state.runId } : {} }" class="button-secondary">Acompanhar no log →</RouterLink>
        </div>
        <p v-if="load?.state.status === 'failed'" class="text-red">Carga interrompida: {{ load.state.errorCode }} {{ load.state.errorDetail ? JSON.stringify(load.state.errorDetail) : '' }}</p>
        <div v-if="load?.state.results.length" class="table-wrap">
          <table>
            <thead><tr><th>Cadastro</th><th>Prontos</th><th>Sem alteração</th><th>Bloqueados</th><th>{{ load.state.dryRun ? 'Seriam enviados' : 'Enviados' }}</th><th>Confirmados</th><th>Rejeitados</th></tr></thead>
            <tbody>
              <tr v-for="r in load.state.results" :key="r.resource">
                <td><code>{{ r.operation }}</code></td><td>{{ r.eligible }}</td><td>{{ r.unchanged }}</td><td :class="r.blocked ? 'text-red' : ''">{{ r.blocked }}</td>
                <td>{{ load.state.dryRun ? r.eligible - r.unchanged : r.sent }}</td><td class="text-green">{{ r.confirmed }}</td>
                <td :class="r.rejected ? 'text-red' : ''" :title="r.rejections.slice(0, 10).map(x => `${x.code}: ${x.message ?? x.status}`).join('\n')">{{ r.rejected }}</td>
              </tr>
            </tbody>
          </table>
          <p class="lead">{{ load.state.dryRun ? `Simulação: ${loadTotals.pending} registros seriam enviados.` : `${loadTotals.confirmed} confirmados, ${loadTotals.rejected} rejeitados.` }} {{ fmt(load.state.finishedAt) }}</p>
        </div>
      </div>
    </template>
    <div v-else-if="snapshot && !hasData && !running" class="empty-state"><h2>Nenhum dado da Bling ainda</h2><p>Clique em "Ler cadastros da Bling" para começar. A leitura é somente consulta na Bling.</p></div>
  </section>
</template>
