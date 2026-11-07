# Lacunas e bloqueios

| Item | Estado | Decisão segura / evidência necessária |
|---|---|---|
| Repositório original | PENDENTE | A pasta não estava disponível nesta sandbox; esta pasta foi criada agora como scaffold novo, não uma alteração do repositório original. Reconciliar depois com a cópia real. |
| Login Lagom funcional | PENDENTE | O OAS confirma `PUT /login` e `POST /login/refresh` com bearer JWT nas rotas protegidas; falta conta sandbox para testar. |
| Host OAuth Bling | PENDENTE | Documentação e exemplos variam entre `bling.com.br`, `www.bling.com.br` e `api.bling.com.br`; confirmar para o aplicativo registado. |
| Validade authorization_code | PENDENTE | Uma consulta oficial indicou 30 s e outra extracção indicou 1 min; confirmar duração vigente. |
| Scopes Bling para compras | PENDENTE | OAS não publica nomes/IDs de scopes específicos; confirmar no cadastro do aplicativo. |
| Transferência nativa Bling entre depósitos | BLOQUEADO | Não há endpoint/tag de transferência no OpenAPI consultado. Não usar ajuste ou lançamentos separados como substituto. |
| Situação/cancelamento de pedido de compra | PENDENTE | PATCH de situação confirmado, mas falta mapear o `idSituacao` da conta. DELETE é remoção, não cancelamento. |
| Paginação Lagom | PENDENTE | O OAS não mostra `page`, `limit`, cursor ou filtros de alteração para as listas de pré-ordem/sugestão. Validar volumetria e ciclo da API. |
| Limites de lote Lagom | PENDENTE | O OAS não documenta limites gerais; confirmar com Lagom antes de sincronização real. |
| Incremental Bling em compras/saldos | PENDENTE | Compras filtram período da compra; saldos não têm filtro temporal documentado. Definir reconciliação segura. |
| Origem da verdade e conflitos | PENDENTE | Aprovar por entidade/campo para produtos, fornecedores, depósitos/filiais, saldos e compras. |
| Credenciais e cifra de tokens | PENDENTE | Ainda não existem credenciais configuradas. Definir Secret Store/rotação e chave de cifra fora do Git. |
| Autenticação/RBAC do painel | PENDENTE | O painel actual é uma base visual; não disponibilizar acções privadas sem autenticação, RBAC e auditoria. |
| Execução Docker Compose | PENDENTE | Docker não está instalado nesta sandbox; configuração será validada estaticamente, não iniciada aqui. |

## Guardas actuais

`SCHEDULER_ENABLED`, `WRITE_ENABLED`, `LAGOM_TO_BLING_ENABLED` e `BLING_TO_LAGOM_ENABLED` estão definidos como `false` por omissão. A API valida e recusa o arranque se qualquer flag for activada neste scaffold. O worker não regista filas. Nenhuma escrita externa foi implementada ou executada.