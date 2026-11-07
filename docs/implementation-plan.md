# Plano de implementação

| Fase | Entrega | Critério para avançar |
|---|---|---|
| 0 — Base local | Monorepo, API health, interface inicial, schema de auditoria, testes e compose. | Build/testes limpos; flags externas false; sem segredos no Git. |
| 1 — Contratos e credenciais de sandbox | Cliente Lagom login/refresh e OAuth Bling com configuração validada; fixtures anonimizadas. | Respostas de leitura autenticadas testadas em sandbox; scopes e hosts registados. |
| 2 — Persistência e observabilidade | Prisma repositories, logs sanitizados, correlação, attempts, checkpoints, métricas básicas. | Migrações aplicadas em ambiente isolado; testes de restart e retenção. |
| 3 — Compras Lagom → Bling | Transformação, idempotência, resolução de fornecedor/produto, criação e confirmação do pedido. | Contratos e regra de negócio aprovados; homologação sem duplicações; confirmação por ID do destino. |
| 4 — Transferências | Manter BLOQUEADO até prova de endpoint/semântica nativos do Bling ou aprovação formal de alternativa. | Evidência documental e homologação de stock/contabilidade/atomicidade. |
| 5 — Carga Bling → Lagom | Activar apenas entidades autorizadas e campos com origem da verdade definida. | Matriz de propriedade, prevenção de loops, paginação/reconciliação testadas. |
| 6 — Filas e scheduler | BullMQ, lock distribuído, recuperação, rate-limit global e dead-letter. | Testes concorrentes/restart; jobs continuam desligados até aprovação operacional. |
| 7 — Painel | API autenticada, RBAC, tabela server-side, detalhe, reconciliação, reprocessamento auditado. | Testes de segurança e UI; nenhum segredo no browser. |
| 8 — Homologação/produção | Runbooks, backups, rollback, alertas e activação controlada. | Aprovação operacional explícita; produção com feature flags activadas de modo controlado. |

Esta base entrega apenas a Fase 0. Não inclui OAuth executável, chamadas reais de escrita, scheduler, reconciliação activa ou autenticação administrativa.