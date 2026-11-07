<script setup lang="ts">
const schedules = [
  { name: 'lagom-to-bling-outbound', direction: 'Lagom → Bling', cron: '*/10 * * * *', timezone: 'America/Sao_Paulo', status: 'Desactivado' },
  { name: 'bling-to-lagom-daily', direction: 'Bling → Lagom', cron: '0 20 * * *', timezone: 'America/Sao_Paulo', status: 'Desactivado' },
];
</script>

<template>
  <section class="page-content">
    <div class="page-heading"><div><p class="eyebrow">EXECUÇÃO CONTROLADA</p><h1>Agendamentos</h1><p class="lead">Horários previstos pelo projecto; nenhuma agenda é registada no worker.</p></div></div>
    <div class="notice notice-warn"><strong>Scheduler desligado</strong><span>A activação exige conectores homologados, controlo de concorrência, RBAC e autorização operacional.</span></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Job</th><th>Direcção</th><th>Expressão cron</th><th>Fuso horário</th><th>Estado</th></tr></thead>
        <tbody><tr v-for="job in schedules" :key="job.name"><td><code>{{ job.name }}</code></td><td>{{ job.direction }}</td><td><code>{{ job.cron }}</code></td><td>{{ job.timezone }}</td><td><span class="state-pill state-disabled">{{ job.status }}</span></td></tr></tbody>
      </table>
    </div>
  </section>
</template>
