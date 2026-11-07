# Mapeamento de APIs — Lagom DRP ↔ Bling

> **Atualizado em 2026-11-07:** o Lagom agora tem 36 operações. O mapeamento completo Lagom ← Bling está em [lagom-bling-mapping.md](lagom-bling-mapping.md).

**Estado:** análise documental; nenhuma chamada autenticada de escrita foi executada.  
**Convenção:** rotas externas são relativas à base indicada; não confundir rotas do middleware com endpoints externos.

## Lagom sandbox

O OpenAPI publicado é OAS 3.0, versão `1.0.0`, em `https://beta-api-sandbox.lagomtech.com.br/api-json`. O documento declara `servers: []`; probes não mutáveis confirmaram que as operações estão na raiz do host, apesar de a UI Swagger estar em `/api`. As operações protegidas usam Bearer JWT. Login e refresh não têm security no próprio operation. [1] [2]

| Entidade | Operação | Método | Rota | Auth | Estado | Observações |
|---|---|---:|---|---|---|---|
| Sessão | Obter tokens | PUT | `/login` | organization + token | CONFIRMADO documentalmente | Retorna access/refresh tokens; ainda sem teste autenticado. |
| Sessão | Renovar tokens | POST | `/login/refresh` | refresh token | CONFIRMADO documentalmente | 401 documentado para refresh inválido/expirado. |
| Pré-ordem de compra | Listar elegíveis | GET | `/pre-purchase-order` | Bearer JWT | CONFIRMADO documentalmente | Sem query, filtros ou paginação no OAS. |
| Pré-ordem de compra | Marcar finalizada | PUT | `/pre-purchase-order/done` | Bearer JWT | CONFIRMADO documentalmente | Só chamar após confirmação verificável no destino e homologação da regra de estado. |
| Ordem de compra | Consultar por filtro | POST | `/purchase-order` | Bearer JWT | CONFIRMADO documentalmente | `code` com `=` e `like` está evidenciado; não extrapolar outros filtros. |
| Ordem de compra | Upsert em lote | PUT | `/purchase-order` | Bearer JWT | CONFIRMADO documentalmente | `PurchaseOrderDTO`; sem regra de negócio aprovada para transformar automaticamente. |
| Sugestão de transferência | Listar | GET | `/transfer-suggestion` | Bearer JWT | CONFIRMADO documentalmente | Sem filtros ou paginação no OAS. |
| Sugestão de transferência | Fechar | PUT | `/transfer-suggestion/done` | Bearer JWT | CONFIRMADO documentalmente | Não fechar até confirmar aplicação no destino. |
| Transferência | Upsert em lote | PUT | `/transfer` | Bearer JWT | CONFIRMADO no Lagom | Não comprova que o Bling aceite a operação equivalente. |
| Produto/item | Upsert em lote | PUT | `/item` | Bearer JWT | CONFIRMADO documentalmente | Leitura geral de itens não encontrada no OAS. |
| Fornecedor | Upsert em lote | PUT | `/supplier` | Bearer JWT | CONFIRMADO documentalmente | Leitura geral de fornecedores não encontrada no OAS. |
| Filial | Upsert em lote | PUT | `/branch` | Bearer JWT | CONFIRMADO documentalmente | Não equiparar automaticamente a depósito Bling. |
| Estoque | Upsert em lote | PUT | `/stock` | Bearer JWT | CONFIRMADO documentalmente | Requer mapeamento item/filial; paginação e limites não publicados. |

## Bling API v3

Base REST de produção documentada: `https://api.bling.com.br/Api/v3`. OAuth usa Authorization Code, Basic para troca/refresh e Bearer para recursos. O host OAuth apresenta divergência nas fontes oficiais; as URLs finais ficam sem configuração até confirmação. [3] [4] [5]

| Entidade | Operação | Método | Rota | Auth | Estado | Observações |
|---|---|---:|---|---|---|---|
| Pedido de compra | Listar | GET | `/pedidos/compras` | OAuth Bearer | CONFIRMADO | `pagina`, `limite`, fornecedor, situação, período da compra e nota fiscal. |
| Pedido de compra | Obter por ID | GET | `/pedidos/compras/{idPedidoCompra}` | OAuth Bearer | CONFIRMADO | Schema de detalhe documentado. |
| Pedido de compra | Criar | POST | `/pedidos/compras` | OAuth Bearer | CONFIRMADO documentalmente; escrita não implementada | O schema exige fornecedor e itens. Não foi chamada. |
| Pedido de compra | Actualizar | PUT | `/pedidos/compras/{idPedidoCompra}` | OAuth Bearer | CONFIRMADO documentalmente; escrita não implementada | Sem execução real. |
| Pedido de compra | Alterar situação | PATCH | `/pedidos/compras/{idPedidoCompra}/situacoes/{idSituacao}` | OAuth Bearer | CONFIRMADO | O ID de cancelamento por conta não é universalmente mapeado. |
| Pedido de compra | Remover | DELETE | `/pedidos/compras/{idPedidoCompra}` | OAuth Bearer | CONFIRMADO no contrato | “Remover” não significa cancelar; não usar automaticamente. |
| Depósito | Listar/detalhar | GET | `/depositos`, `/depositos/{idDeposito}` | OAuth Bearer | CONFIRMADO | Cadastro/consulta não equivale a transferência. |
| Saldo | Consultar todos/por depósito | GET | `/estoques/saldos`, `/estoques/saldos/{idDeposito}` | OAuth Bearer | CONFIRMADO | Consulta read-only; limite de 100 produtos na condição multiempresa documentada. |
| Registro de estoque | Criar | POST | `/estoques` | OAuth Bearer | CONFIRMADO no contrato | Opera num depósito com `B`, `E` ou `S`; não tem par origem/destino. |
| Transferência entre depósitos | Criar | — | — | — | **BLOQUEADO** | Nenhum endpoint nativo confirmado no OpenAPI consultado. Não simular com entrada/saída ou ajuste. |

## Carga Bling → Lagom: candidatos, não activados

| Recurso candidato | Bling — leitura | Lagom — escrita | Política/decisão actual |
|---|---|---|---|
| Produtos | `GET /produtos`, inclui filtros de data de alteração | `PUT /item` | PENDENTE: fonte da verdade por campo, IDs e transformação. |
| Fornecedores | `GET /contatos`, `/contatos/tipos` | `PUT /supplier` | PENDENTE: confirmar classificação e propriedade cadastral. |
| Depósitos/filiais | `GET /depositos` | `PUT /branch` | BLOQUEADO até validar equivalência depósito↔filial. |
| Saldos | `GET /estoques/saldos` e variante por depósito | `PUT /stock` | PENDENTE: mapear depósito↔filial e definir sistema mestre. |
| Pedidos de compra | `GET /pedidos/compras` | `POST /purchase-order` (consulta) / `PUT /purchase-order` (upsert) | PENDENTE; início read-only/reconciliação para evitar loops de documentos Lagom→Bling. |
| Transferências | Sem endpoint Bling confirmado | `PUT /transfer` | BLOQUEADO: ausência de recurso nativo do lado Bling. |

## Restrições relevantes

O Lagom não declara paginação ou filtros genéricos por data de alteração nos endpoints consultados. No Bling, os endpoints paginados usam `pagina`/`limite` quando declarados; o padrão documentado de `limite` é 100, mas não há máximo geral. Produtos e contatos incluem filtros de data de alteração; compras filtram período da compra, que não é o mesmo que data de alteração. As quotas Bling são globais por conta: 3 requests/segundo e 120.000/dia; o scaffold parte de 2 requests/segundo. [4] [6] [7]

## Referências

[1]: https://beta-api-sandbox.lagomtech.com.br/api#/ "Swagger UI oficial Lagom"
[2]: https://beta-api-sandbox.lagomtech.com.br/api-json "OpenAPI JSON Lagom"
[3]: https://developer.bling.com.br/referencia "Referência API Bling"
[4]: https://developer.bling.com.br/build/assets/openapi-CR5QY_N1.json "OpenAPI Bling v3"
[5]: https://developer.bling.com.br/aplicativos "Aplicativos OAuth Bling"
[6]: https://developer.bling.com.br/limites "Limites da API Bling"
[7]: https://developer.bling.com.br/boas-praticas "Boas práticas da API Bling"
[8]: https://developer.bling.com.br/changelogs "Changelog Bling"
[9]: https://developer.bling.com.br/migracao-jwt "Migração JWT Bling"
