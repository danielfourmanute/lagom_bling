# Checklist de homologação

## Contratos e dados

- [ ] Guardar snapshots OpenAPI versionados sem segredos e identificar data/versão.
- [ ] Confirmar hostname OAuth Bling, prazo do authorization code e scopes do aplicativo.
- [ ] Validar login e refresh Lagom em sandbox com credenciais autorizadas.
- [ ] Aprovar sistema mestre e propriedade de campos para cada entidade.
- [ ] Aprovar conversões de unidade, moeda, valores, arredondamento, datas e estados.
- [ ] Confirmar filtros/paginação e limites de lotes; não assumir capacidades ausentes.
- [ ] Manter transferência Bling bloqueada até endpoint e semântica homologados.

## Segurança e fiabilidade

- [ ] `.env` está ignorado e não aparece em commits/logs.
- [ ] Tokens OAuth cifrados em repouso, mascarados em logs e com rotina de rotação.
- [ ] Testar `401`, `403`, `429`, `5xx`, timeout e resposta ambígua sem duplicação.
- [ ] Confirmar chave idempotente e UNIQUE no PostgreSQL.
- [ ] Confirmar lock distribuído, retries limitados, jitter, dead-letter e recuperação após restart.
- [ ] Confirmar checkpoint apenas após confirmação verificável do destino.
- [ ] Verificar RBAC, CSRF, sanitização, paginação server-side e trilha de auditoria.

## Operação

- [ ] Testar apenas sandbox/homologação e dados autorizados/anonimizados.
- [ ] Confirmar `SCHEDULER_ENABLED=false` e `WRITE_ENABLED=false` durante desenvolvimento.
- [ ] Simular os cron `*/10 * * * *` e `0 20 * * *` com relógio controlado, fuso `America/Sao_Paulo`.
- [ ] Produzir relatório de execução e plano de rollback.
- [ ] Obter autorização operacional antes de habilitar escrita/jobs em produção.
