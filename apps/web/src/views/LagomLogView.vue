<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { lagomRequest, LagomApiError } from '../composables/lagom';

type Status = 'PENDING' | 'PROCESSING' | 'CONFIRMED' | 'REJECTED' | 'FAILED' | string;
interface Run { id: string; status: Status; startedAt: string; finishedAt: string | null; durationMs: number | null; itemsRead: number; itemsConfirmed: number; itemsFailed: number; errorCode: string | null; errorMessage: string | null; _count?: { events: number } }
interface Rejection { code: string; name?: string; status?: number; message?: string }
interface PlanRow { resource: string; title: string; operation: string; total: number; eligible: number; blocked: number; unchanged: number; pending: number }
interface EventRow { id: string; action: string; status: Status | null; createdAt: string; details: Record<string, any> | null }
interface Detail { run: Run; live: boolean; current: string | null; events: EventRow[] }

const route = useRoute();
const router = useRouter();
const runs = ref<Run[]>([]);
const total = ref(0);
const liveId = ref<string | null>(null);
const detail = ref<Detail | null>(null);
const error = ref('');
const filter = reactive({ resource: '', message: '', search: '', limit: 100 });

const selectedId = computed(() => (route.query.run as string | undefined) ?? runs.value[0]?.id);
const fmt = (iso?: string | null) => iso ? new Date(iso).toLocaleString('pt-BR') : '—';
const time = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR');
const dur = (ms?: number | null) => ms == null ? '—' : ms < 1000 ? `${ms} ms` : ms < 60_000 ? `${(ms / 1000).toFixed(1).replace('.', ',')} s` : `${Math.floor(ms / 60_000)} min ${Math.round((ms % 60_000) / 1000)} s`;
const n = (v: number) => v.toLocaleString('pt-BR');
const msg = (e: unknown) => e instanceof LagomApiError ? `${e.message}${e.detail ? ' — ' + e.detail : ''}` : 'Falha ao ler o log.';
const statusLabel: Record<string, string> = { PROCESSING: 'EM ANDAMENTO', CONFIRMED: 'CONCLUÍDA', REJECTED: 'COM REJEIÇÕES', FAILED: 'FALHOU', PENDING: 'PENDENTE' };
const pill = (s?: Status | null) => s === 'CONFIRMED' ? 'state-ok' : s === 'REJECTED' ? 'state-pending' : s === 'FAILED' ? 'state-blocked' : s === 'PROCESSING' ? 'state-live' : 'state-disabled';
const isLive = (r: Run) => r.id === liveId.value;
const elapsed = (r: Run) => r.durationMs ?? (r.finishedAt ? new Date(r.finishedAt).getTime() - new Date(r.startedAt).getTime() : Date.now() - new Date(r.startedAt).getTime());

/* Derivados do detalhe */
const plan = computed<PlanRow[]>(() => detail.value?.events.find(e => e.action === 'INICIO')?.details?.resources ?? []);
const batches = computed(() => (detail.value?.events ?? []).filter(e => e.action.startsWith('PUT ')));
const progressBy = computed(() => {
  const m = new Map<string, { sent: number; confirmed: number; rejected: number; batches: number; ms: number }>();
  for (const e of batches.value) {
    const d = e.details ?? {}; const key = d.resource ?? e.action.slice(4);
    const p = m.get(key) ?? { sent: 0, confirmed: 0, rejected: 0, batches: 0, ms: 0 };
    p.sent += d.size ?? 0; p.confirmed += d.confirmed ?? 0; p.rejected += d.rejected ?? (d.rejections?.length ?? 0); p.batches++; p.ms += d.durationMs ?? 0;
    m.set(key, p);
  }
  return m;
});
const titleOf = (resource: string) => plan.value.find(p => p.resource === resource)?.title ?? resource;
const runProgress = computed(() => {
  const r = detail.value?.run; if (!r || !r.itemsRead) return 0;
  return Math.min(100, Math.round(((r.itemsConfirmed + r.itemsFailed) / r.itemsRead) * 100));
});
const failure = computed(() => detail.value?.events.find(e => e.action === 'FALHA')?.details);

function describe(e: EventRow) {
  const d = e.details ?? {};
  if (e.action === 'INICIO') return `Carga iniciada: ${n(d.toSend ?? 0)} registros a enviar em ${(d.resources ?? []).filter((r: PlanRow) => r.pending).length} cadastros, lotes de ${d.batchSize ?? '?'}.`;
  if (e.action === 'FIM') return `Carga concluída em ${dur(d.durationMs)}: ${n(d.confirmed ?? 0)} confirmados, ${n(d.rejected ?? 0)} rejeitados.`;
  if (e.action === 'FALHA') return `Carga interrompida${d.title ? ` em ${d.title} (lote a partir de ${d.batchStart + 1})` : ''}: ${d.code}${d.message && d.message !== d.code ? ' — ' + d.message : ''}`;
  if (e.action.startsWith('PUT ')) {
    const start = (d.batchStart ?? 0) + 1; const end = (d.batchStart ?? 0) + (d.size ?? 0);
    const rej = d.rejected ?? d.rejections?.length ?? 0;
    return `${d.title ?? titleOf(d.resource ?? e.action.slice(4))} · registros ${n(start)}–${n(end)}: ${n(d.confirmed ?? 0)} confirmados${rej ? `, ${n(rej)} rejeitados` : ''}${d.durationMs != null ? ` em ${dur(d.durationMs)}` : ''}${d.batchError ? ' · lote inteiro recusado pelo Lagom' : ''}`;
  }
  return e.action;
}
const eventLabel = (e: EventRow) => e.action === 'INICIO' ? 'Início' : e.action === 'FIM' ? 'Fim' : e.action === 'FALHA' ? 'Falha' : 'Lote';

/* Rejeições */
const rejections = computed(() => batches.value.flatMap(e => ((e.details?.rejections ?? []) as Rejection[]).map(r => ({ ...r, resource: e.details?.resource ?? e.action.slice(4), at: e.createdAt }))));
const truncated = computed(() => batches.value.some(e => (e.details?.rejected ?? 0) > (e.details?.rejections?.length ?? 0)));
const reasons = computed(() => {
  const m = new Map<string, { message: string; resource: string; count: number }>();
  for (const r of rejections.value) { const k = `${r.resource}|${r.message ?? ''}`; const x = m.get(k) ?? { message: r.message || `HTTP ${r.status ?? '?'} (sem mensagem)`, resource: r.resource, count: 0 }; x.count++; m.set(k, x); }
  return [...m.values()].sort((a, b) => b.count - a.count);
});
const filtered = computed(() => {
  const term = filter.search.trim().toLowerCase();
  return rejections.value.filter(r => (!filter.resource || r.resource === filter.resource)
    && (!filter.message || (r.message || `HTTP ${r.status ?? '?'} (sem mensagem)`) === filter.message)
    && (!term || r.code.toLowerCase().includes(term) || (r.name ?? '').toLowerCase().includes(term)));
});
const rejResources = computed(() => [...new Set(rejections.value.map(r => r.resource))]);
function pickReason(r: { message: string; resource: string }) { filter.resource = r.resource; filter.message = r.message; filter.limit = 100; }
function clearFilters() { Object.assign(filter, { resource: '', message: '', search: '', limit: 100 }); }
function exportCsv() {
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [['cadastro', 'codigo', 'nome', 'status', 'mensagem', 'quando'].join(';'), ...filtered.value.map(r => [titleOf(r.resource), r.code, r.name, r.status, r.message, fmt(r.at)].map(esc).join(';'))];
  const url = URL.createObjectURL(new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = `rejeicoes-lagom-${detail.value?.run.startedAt.slice(0, 16).replace(/[:T]/g, '-') ?? 'carga'}.csv`; a.click();
  URL.revokeObjectURL(url);
}

/* Carregamento */
async function refreshRuns() {
  const r = await lagomRequest<{ total: number; live: string | null; runs: Run[] }>('runs?limite=30');
  runs.value = r.runs; total.value = r.total; liveId.value = r.live;
}
async function refreshDetail() {
  const id = selectedId.value; if (!id) { detail.value = null; return; }
  detail.value = await lagomRequest<Detail>(`runs/${id}`);
}
async function refresh() {
  try { await refreshRuns(); await refreshDetail(); error.value = ''; }
  catch (e) { error.value = msg(e); }
}
function select(id: string) { void router.replace({ query: { ...route.query, run: id } }); }
watch(selectedId, (a, b) => { if (a !== b) { clearFilters(); void refreshDetail().catch(e => { error.value = msg(e); }); } });

let timer: ReturnType<typeof setTimeout> | undefined;
let stopped = false;
async function loop() {
  await refresh();
  if (!stopped) timer = setTimeout(loop, liveId.value ? 2500 : 15000);
}
onMounted(() => { void loop(); });
onBeforeUnmount(() => { stopped = true; clearTimeout(timer); });
</script>

<template>
  <section class="page-content">
    <nav class="crumbs" aria-label="Trilha"><RouterLink to="/lagom/compatibilidade">Cadastros Bling → Lagom</RouterLink> / <span>Log das cargas</span></nav>
    <div class="page-heading">
      <div>
        <p class="eyebrow">CARGA DE CADASTROS · LOG</p>
        <h1>Log das cargas</h1>
        <p class="lead">Cada envio ao Lagom, lote a lote: o que foi planejado, o que foi confirmado, o que o Lagom recusou e por quê. Atualiza sozinho enquanto uma carga está rodando.</p>
      </div>
      <span v-if="liveId" class="state-pill state-live"><span class="live-dot"></span>CARGA EM ANDAMENTO</span>
    </div>
    <div v-if="error" class="notice notice-warn" role="alert"><strong>{{ error }}</strong></div>

    <div v-if="!runs.length && !error" class="connection-card"><p class="lead">Nenhuma carga registrada ainda. Envie pela tela <RouterLink to="/lagom/compatibilidade">Cadastros Bling → Lagom</RouterLink> — simulações não ficam no log.</p></div>

    <div v-else class="log-layout">
      <!-- Execuções -->
      <aside class="run-list" aria-label="Execuções">
        <div class="section-heading"><h2>Execuções</h2><span class="lead">{{ total }}</span></div>
        <button v-for="r in runs" :key="r.id" :class="['run-item', { selected: r.id === selectedId }]" @click="select(r.id)">
          <span class="run-top"><strong>{{ fmt(r.startedAt) }}</strong><span :class="['state-pill', pill(isLive(r) ? 'PROCESSING' : r.status)]">{{ isLive(r) ? 'AO VIVO' : statusLabel[r.status] ?? r.status }}</span></span>
          <span class="run-nums"><span class="text-green">{{ n(r.itemsConfirmed) }} ok</span><span :class="r.itemsFailed ? 'text-red' : ''">{{ n(r.itemsFailed) }} rejeit.</span><span>{{ dur(elapsed(r)) }}</span></span>
        </button>
      </aside>

      <!-- Detalhe -->
      <div v-if="detail" class="run-detail">
        <div class="metric-grid metric-grid-5">
          <div class="metric-card"><span class="metric-label">Situação</span><span :class="['state-pill', pill(detail.live ? 'PROCESSING' : detail.run.status)]">{{ detail.live ? 'EM ANDAMENTO' : statusLabel[detail.run.status] ?? detail.run.status }}</span><small>{{ fmt(detail.run.startedAt) }}<template v-if="detail.run.finishedAt"> → {{ time(detail.run.finishedAt) }}</template></small></div>
          <div class="metric-card"><span class="metric-label">A enviar</span><span class="metric-value">{{ n(detail.run.itemsRead) }}</span><small>registros novos ou alterados</small></div>
          <div class="metric-card"><span class="metric-label">Confirmados</span><span class="metric-value text-green">{{ n(detail.run.itemsConfirmed) }}</span></div>
          <div class="metric-card"><span class="metric-label">Rejeitados</span><span :class="['metric-value', detail.run.itemsFailed ? 'text-red' : '']">{{ n(detail.run.itemsFailed) }}</span></div>
          <div class="metric-card"><span class="metric-label">Duração</span><span class="metric-value">{{ dur(elapsed(detail.run)) }}</span></div>
        </div>

        <div v-if="detail.live || detail.run.status === 'PROCESSING'" class="connection-card live-card" role="status">
          <div class="live-row"><span class="live-dot"></span><strong>{{ detail.live ? `Enviando ${detail.current ?? '…'}` : 'Execução sem atividade (a API pode ter reiniciado no meio da carga)' }}</strong><span class="lead">{{ runProgress }}%</span></div>
          <div class="bar"><span :style="{ width: runProgress + '%' }"></span></div>
        </div>
        <div v-if="failure" class="notice notice-error" role="alert"><strong>Carga interrompida</strong><span>{{ failure.code }}{{ failure.title ? ` em ${failure.title}, lote a partir do registro ${failure.batchStart + 1}` : '' }}{{ failure.message && failure.message !== failure.code ? ` — ${failure.message}` : '' }}{{ failure.detail ? ` · ${JSON.stringify(failure.detail)}` : '' }}</span></div>

        <!-- Plano × andamento por cadastro -->
        <template v-if="plan.length">
          <div class="section-heading"><h2>Por cadastro</h2><span class="lead">plano no início da carga × o que já voltou do Lagom</span></div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Cadastro</th><th>Bloqueados</th><th>Sem alteração</th><th>A enviar</th><th>Progresso</th><th>Confirmados</th><th>Rejeitados</th><th>Tempo</th></tr></thead>
              <tbody>
                <tr v-for="p in plan" :key="p.resource" :class="{ 'row-muted': !p.pending }">
                  <td>{{ p.title }} <small class="lead"><code>{{ p.operation }}</code></small></td>
                  <td :class="p.blocked ? 'text-amber' : ''">{{ n(p.blocked) }}</td>
                  <td>{{ n(p.unchanged) }}</td>
                  <td>{{ n(p.pending) }}</td>
                  <td class="cell-bar"><template v-if="p.pending"><div class="bar small"><span :style="{ width: Math.min(100, Math.round(((progressBy.get(p.resource)?.sent ?? 0) / p.pending) * 100)) + '%' }"></span></div><small>{{ n(progressBy.get(p.resource)?.sent ?? 0) }}/{{ n(p.pending) }}</small></template><small v-else class="lead">nada a enviar</small></td>
                  <td class="text-green">{{ n(progressBy.get(p.resource)?.confirmed ?? 0) }}</td>
                  <td :class="progressBy.get(p.resource)?.rejected ? 'text-red' : ''">{{ n(progressBy.get(p.resource)?.rejected ?? 0) }}</td>
                  <td>{{ progressBy.get(p.resource) ? dur(progressBy.get(p.resource)!.ms) : '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="plan.some(p => p.blocked)" class="lead small-note">Bloqueados não são enviados (erro de compatibilidade); veja o motivo em <RouterLink to="/lagom/compatibilidade">Cadastros Bling → Lagom</RouterLink>.</p>
        </template>

        <!-- Rejeições -->
        <template v-if="rejections.length">
          <div class="section-heading"><h2>Rejeições do Lagom</h2><span class="lead">{{ n(rejections.length) }} registros · {{ reasons.length }} motivos</span></div>
          <div class="reason-list">
            <button v-for="r in reasons" :key="r.resource + r.message" :class="['reason', { active: filter.resource === r.resource && filter.message === r.message }]" @click="pickReason(r)">
              <strong class="text-red">{{ n(r.count) }}</strong><span>{{ r.message }}</span><small>{{ titleOf(r.resource) }}</small>
            </button>
          </div>
          <p v-if="truncated" class="lead small-note">Execuções antigas guardavam só as 50 primeiras rejeições de cada lote; as novas guardam todas.</p>
          <div class="log-filters">
            <select v-model="filter.resource" aria-label="Cadastro"><option value="">Todos os cadastros</option><option v-for="r in rejResources" :key="r" :value="r">{{ titleOf(r) }}</option></select>
            <select v-model="filter.message" aria-label="Motivo"><option value="">Todos os motivos</option><option v-for="m in [...new Set(reasons.map(r => r.message))]" :key="m" :value="m">{{ m }}</option></select>
            <input v-model="filter.search" type="search" placeholder="Código ou nome" aria-label="Buscar código ou nome" />
            <button class="button-secondary" @click="clearFilters">Limpar</button>
            <button class="button-secondary" :disabled="!filtered.length" @click="exportCsv">Exportar CSV ({{ n(filtered.length) }})</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Cadastro</th><th>Código</th><th>Nome</th><th>HTTP</th><th>Mensagem do Lagom</th><th>Quando</th></tr></thead>
              <tbody>
                <tr v-for="r in filtered.slice(0, filter.limit)" :key="r.resource + r.code + r.at">
                  <td>{{ titleOf(r.resource) }}</td><td><code>{{ r.code }}</code></td><td>{{ r.name ?? '—' }}</td><td>{{ r.status ?? '—' }}</td><td class="text-red">{{ r.message ?? '—' }}</td><td>{{ time(r.at) }}</td>
                </tr>
                <tr v-if="!filtered.length"><td colspan="6" class="lead">Nenhuma rejeição com esses filtros.</td></tr>
              </tbody>
            </table>
          </div>
          <button v-if="filtered.length > filter.limit" class="button-secondary more" @click="filter.limit += 200">Mostrar mais ({{ n(filtered.length - filter.limit) }} restantes)</button>
        </template>

        <!-- Linha do tempo -->
        <div class="section-heading"><h2>Linha do tempo</h2><span class="lead">{{ detail.events.length }} eventos</span></div>
        <ol class="timeline">
          <li v-for="e in [...detail.events].reverse()" :key="e.id" :class="['tl-' + (e.status ?? 'none').toLowerCase()]">
            <span class="tl-time">{{ time(e.createdAt) }}</span>
            <span :class="['state-pill', pill(e.status)]">{{ eventLabel(e) }}</span>
            <span class="tl-text">{{ describe(e) }}</span>
          </li>
          <li v-if="!detail.events.length"><span class="lead">Sem eventos.</span></li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.log-layout { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 20px; align-items: start; }
.run-list { position: sticky; top: 16px; display: flex; flex-direction: column; gap: 8px; max-height: calc(100vh - 32px); overflow-y: auto; }
.run-list .section-heading { margin-top: 0; }
.run-item { display: flex; flex-direction: column; gap: 8px; padding: 12px; border: 1px solid var(--surface-line); border-radius: 10px; background: var(--surface); color: var(--text); text-align: left; cursor: pointer; font: inherit; }
.run-item:hover { border-color: rgba(112,224,188,.35); }
.run-item.selected { border-color: var(--accent); box-shadow: inset 3px 0 0 var(--accent); }
.run-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 12px; }
.run-nums { display: flex; gap: 12px; font-size: 11px; color: var(--muted); }
.run-detail { min-width: 0; display: flex; flex-direction: column; gap: 14px; }
.run-detail .section-heading { margin: 10px 0 0; }
.metric-grid-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.metric-grid-5 .metric-label { margin-bottom: 10px; }
.state-ok { color: var(--accent); border-color: rgba(112,224,188,.3); background: rgba(112,224,188,.06); }
.state-live { gap: 6px; color: #8ec5ff; border-color: rgba(142,197,255,.3); background: rgba(142,197,255,.07); }
.live-dot { width: 7px; height: 7px; border-radius: 50%; background: #8ec5ff; animation: pulse 1.2s ease-in-out infinite; flex: 0 0 auto; }
@keyframes pulse { 50% { opacity: .25; } }
@media (prefers-reduced-motion: reduce) { .live-dot { animation: none; } }
.live-card { display: flex; flex-direction: column; gap: 10px; }
.live-row { display: flex; align-items: center; gap: 10px; }
.live-row .lead { margin-left: auto; }
.bar { height: 6px; border-radius: 999px; background: rgba(255,255,255,.07); overflow: hidden; }
.bar span { display: block; height: 100%; background: var(--accent); transition: width .4s ease; }
.bar.small { height: 4px; min-width: 80px; }
.cell-bar { min-width: 120px; }
.cell-bar small { display: block; margin-top: 4px; color: var(--muted); font-size: 10px; }
.row-muted td { opacity: .55; }
.small-note { font-size: 11px; margin: 0; }
.notice-error { border-color: rgba(242,141,141,.25); background: rgba(242,141,141,.05); }
.notice-error strong { color: var(--red); }
.reason-list { display: flex; flex-direction: column; gap: 6px; }
.reason { display: grid; grid-template-columns: 64px minmax(0,1fr) auto; gap: 12px; align-items: center; padding: 10px 12px; border: 1px solid var(--surface-line); border-radius: 8px; background: var(--surface); color: var(--text); font: inherit; font-size: 12px; text-align: left; cursor: pointer; }
.reason:hover, .reason.active { border-color: rgba(242,141,141,.4); }
.reason small { color: var(--muted); }
.log-filters { display: flex; flex-wrap: wrap; gap: 8px; }
.log-filters select, .log-filters input { padding: 8px 10px; border: 1px solid var(--surface-line); border-radius: 8px; background: var(--surface); color: var(--text); font: inherit; font-size: 12px; min-width: 0; }
.log-filters input { flex: 1 1 200px; }
.more { align-self: center; }
.timeline { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; border: 1px solid var(--surface-line); border-radius: 10px; overflow: hidden; }
.timeline li { display: grid; grid-template-columns: 70px 92px minmax(0, 1fr); gap: 12px; align-items: center; padding: 9px 14px; border-top: 1px solid var(--surface-line); font-size: 12px; }
.timeline li:first-child { border-top: 0; }
.timeline .state-pill { justify-content: center; }
.tl-time { color: var(--muted); font-family: 'DM Mono', monospace; font-size: 11px; }
.tl-failed { background: rgba(242,141,141,.05); }
.tl-rejected .tl-text { color: #f3d9a0; }
@media (max-width: 1100px) { .metric-grid-5 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 860px) {
  .log-layout { grid-template-columns: minmax(0, 1fr); }
  .run-list { position: static; max-height: 260px; }
  .timeline li { grid-template-columns: 60px minmax(0, 1fr); }
  .timeline .tl-text { grid-column: 1 / -1; }
  .reason { grid-template-columns: 48px minmax(0,1fr); }
  .reason small { grid-column: 2; }
}
</style>
