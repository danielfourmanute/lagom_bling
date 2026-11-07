# Modelo de dados

O schema canónico está em `prisma/schema.prisma`; este documento é explicação, não um segundo schema. Migrações ficam exclusivamente em `prisma/migrations/`.

| Tabela | Finalidade | Índices/garantias principais |
|---|---|---|
| `integration_configurations` | Regras e estado de cada recurso/direcção. | Unicidade de direcção + recurso; desactivado/dry-run por omissão. |
| `integration_runs` | Execuções agendadas/manuais e checkpoints antes/depois. | Job, estado, direcção, início e correlação. |
| `integration_transactions` | Documento individual com sistemas, IDs, estado, hash e correlação. | UNIQUE por tenant/direcção/tipo/chave idempotente. |
| `integration_attempts` | Tentativas HTTP sanitizadas, códigos e latência. | UNIQUE por transacção/número da tentativa. |
| `entity_links` | IDs correspondentes entre Lagom e Bling. | UNIQUE por tenant/tipo/sistema origem/ID/sistema destino. |
| `sync_checkpoints` | Cursor/watermark por direcção, tenant e recurso. | UNIQUE por direcção/tenant/recurso. |
| `reconciliation_results` | Divergências encontradas entre sistemas. | Tenant/tipo/estado/data e execução. |
| `integration_events` | Trilha cronológica de estado e actividade. | Correlação, transacção e timestamp. |
| `integration_dead_letters` | Falhas que exigem revisão/reprocessamento manual. | Uma dead letter por transacção; estado e data. |
| `oauth_connections` | Metadados e tokens OAuth cifrados. | Unicidade de provider/account e validade; nunca guardar tokens em claro. |
| `oauth_states` | Hashes de state e sessão OAuth; uso único e validade de dez minutos. | State único; índice de expiração. |
| `audit_actions` | Acções administrativas, actor, justificação e resultado. | Actor e alvo por timestamp. |

A chave idempotente em `packages/domain` deriva de tenant/empresa, direcção, tipo documental, ID de origem e versão/acção. `UNKNOWN` não avança directamente para novo envio: exige `RECONCILING`. Timestamps são `timestamptz`; aplicação deverá persistir UTC e converter para `America/Sao_Paulo` apenas na apresentação/agenda.