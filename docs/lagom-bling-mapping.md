# Mapeamento Lagom DRP ← Bling (todas as APIs Lagom)

**Fonte Lagom:** `https://beta-api-sandbox.lagomtech.com.br/api-json` (Integration API 1.0.0, consultada em 2026-11-07): **36 operações** em 26 recursos. Substitui a tabela parcial (13 operações) em [api-mapping.md](api-mapping.md).
**Fonte Bling:** OpenAPI v3 oficial + amostras reais da conta conectada (somente GET).
**Estado:** análise. Nenhuma escrita no Lagom foi feita (`LAGOM_ORGANIZATION`/`LAGOM_TOKEN` estão vazios no `.env`, e `WRITE_ENABLED=false`).

## Convenções do Lagom que valem para tudo

- Todos os PUT são **upsert em lote** (array). A chave é o `code`, que o Lagom chama de "identificador único no seu sistema". Proposta: usar o **ID numérico da Bling** como `code` (é estável; `codigo`/SKU pode mudar ou vir vazio).
- Campos marcados "pode ser omitido" não alteram o valor já gravado quando ausentes.
- Referências (`brand`, `itemGroup`, `branch`, `customer`, `supplier`…) precisam existir antes. Daí a **ordem de carga** no fim do documento.
- Autenticação: `PUT /login` (organization + token) → Bearer JWT; `POST /login/refresh`.

## 1. Cadastros — alimentados pela Bling

| Lagom (PUT) | Fonte Bling (GET) | Mapeamento de campos | Lacunas / decisão |
|---|---|---|---|
| **/branch** — Filial | `/depositos` | `code`←`id` · `name`←`descricao` · `active`←`situacao==1` · `branchGroup`←grupo fixo | Conta tem 1 depósito ("Geral"). **Decidir:** filial = depósito, ou filial = empresa/loja? |
| **/branch-group** — Grupo de filial | — (sem equivalente) | `code`/`name` fixos (ex.: `BLING`) | Criar 1 grupo padrão. |
| **/brand** — Marca | `produtos/{id}.marca` (texto livre) | `code`←marca normalizada (maiúsculas, sem acento) · `name`←marca · `active`←true | A Bling não tem cadastro de marcas, só texto no produto. Exige ler o **detalhe** de cada produto. Produto sem marca → marca `SEM-MARCA`. |
| **/item-group** — Grupo de item | `/categorias/produtos` | `code`←`id` · `name`←`descricao` · `father`←`categoriaPai.id` (0 → null) | Carregar pais antes dos filhos. Alternativa: `/grupos-produtos` (vazio nesta conta). |
| **/item-secondary-group** | `/grupos-produtos` ou `linhaProduto` | `code`←`id` · `name`←`nome` | Vazio nesta conta: opcional. |
| **/item** — Item | `/produtos` + `/produtos/{id}` | `code`←`id` · `name`←`nome` · `brand`←marca normalizada · `itemGroup`←`categoria.id` · `measurementUnity`←`unidade` · `supplierCode`←`fornecedor.codigo` · `mainSupplier`←`fornecedor.contato.id` (se ≠0) · `barcode`←`gtin` · `description`←`descricaoCurta` ou `nome` · `weight`←`pesoBruto` · `length`←`dimensoes.profundidade` · `createdAt`← *(não há na Bling)* · `makeToStock`←`formato!='E'`? · `purchase`←true · `active`←`situacao=='A'` · `multiplePurchase`/`packingQuantity`←`itensPorCaixa` | **Obrigatórios sem dado na amostra:** `barcode` (GTIN vazio) e `supplierCode` (vazio). **Decidir** o fallback (ex.: `barcode`←SKU `codigo`). `measurementUnity` precisa já existir no Lagom. Variações: cada variação vira um item. **Decidir** `makeToStock`. |
| **/item-composition** | `/produtos/estruturas/{id}` (produtos `formato=E`) | `item`←id do produto · `component`←`componentes[].produto.id` · `quantity`←`quantidade` · `loss`←0 · `manufacturingTime`←0 | Bling não tem perda/tempo: enviar 0. |
| **/supplier** — Fornecedor | `/contatos?idTipoContato=<Fornecedor>` (+ detalhe) | `code`←`id` · `name`←`nome` · `document`←`numeroDocumento` · `email`←`email` · `freight`←padrão fixo · `paymentTerm`←`financeiro.condicaoPagamento`/padrão · `active`←`situacao=='A'` | Tipo "Fornecedor" existe (`14580796962`). `freight` e `paymentTerm` são obrigatórios: **definir padrões**. |
| **/supplier-brand** | derivado: produtos (`fornecedor` × `marca`) | `supplier`←`fornecedor.contato.id` · `brand`←marca | Na amostra o fornecedor do produto vem "Não definido": provavelmente poucos pares. |
| **/customer-group** | — (derivável) | `code`/`name` ← tipo de pessoa (F/J) ou grupo único `BLING` | **Decidir** a regra. |
| **/customer** — Cliente | `/contatos?idTipoContato=<Cliente>` + detalhe | `code`←`id` · `name`←`nome` · `customerGroup`←regra acima · `city`←`endereco.geral.municipio` · `state`←`endereco.geral.uf` · `country`←`pais.nome` ou "Brasil" · `active`←`situacao=='A'` | City/state só no detalhe (1 GET por contato). Alternativa: só os clientes que aparecem nas notas/pedidos. |
| **/payment-terms** | `/formas-pagamentos` | `code`←`id` · `name`←`descricao` | Direto. |
| **/item-custom-attribute/option** e **/value** | `/campos-customizados/modulos/{id}` + `produtos/{id}.camposCustomizados` | option: `attributeName`←nome do campo · `optionCode`/`optionValue`←opções · value: `item`, `attributeName`, `optionCode`←`valor` | Opcional; só se a conta usar campos customizados de produto. |
| **/branch-item-parameter** | `produtos/{id}.estoque` | `branch`←depósito · `item`←id · `strategicStock`←`estoque.minimo` · `upperStockLimit`←`estoque.maximo` | O resto (lead time, comprador, múltiplos) é parâmetro de planejamento do Lagom, sem fonte na Bling. Enviar só o que existe. |
| **/substitute**, **/previous-version** | — | — | **Sem fonte na Bling.** Cadastrar no próprio Lagom. |

## 2. Transações — alimentadas pela Bling

| Lagom (PUT) | Fonte Bling (GET) | Mapeamento | Lacunas / decisão |
|---|---|---|---|
| **/movement** — Movimentação (histórico de vendas, base da previsão) | **Opção A:** `/nfe?tipo=1` (saída) + `/nfe/{id}` · **Opção B:** `/pedidos/vendas` + detalhe | Uma linha por item: `code`←`<idNota>-<seq>` · `branch`←depósito · `item`←id do produto · `customer`←`contato.id` · `date`←`dataEmissao` (ISO `T00:00:00.000Z`) · `quantity`←`quantidade` · `saleValue`←`valorTotal` · `document`←`numero`/`chaveAcesso` · `participateInDemand`←true (false para bonificação/devolução) · `returned`←nota cancelada/denegada | **Decidir A ou B.** A NF-e reflete a venda faturada, mas o item da NF-e traz `codigo` (SKU), não o ID do produto: precisa resolver SKU→ID. Pedidos trazem `itens[].produto.id`. Notas canceladas → reenviar com `returned=true`; exclusão via `DELETE /movement`. Filtro de data de no máximo 366 dias. |
| **/stock** — Estoque | `/estoques/saldos?idsProdutos[]=…` (lotes de até 100 produtos) | `branch`←`depositos[].id` · `item`←`produto.id` · `quantity`←`saldoFisico` · `date`←agora · `location`←`estoque.localizacao` · `averageCost`←`fornecedor.precoCusto` · `replenishmentValue`/`purchaseValue`←`fornecedor.precoCompra` | `averageCost`, `replenishmentValue` e `purchaseValue` são obrigatórios: na amostra vêm 0. Confirmar se 0 é aceitável. |
| **/purchase-order** — Ordem de compra | `/pedidos/compras` + detalhe | Uma linha por item: `code`←`<idPedido>-<seq>` · `branch`←depósito · `item`←`itens[].produto.id` · `orderDate`←`data` · `estimatedDeliveryDate`←`dataPrevista` · `requestedQuantity`←`quantidade` · `deliveredQuantity`←recebida (derivar da situação) · `status`←O/C pela situação · `supplier`←`fornecedor.id` · `purchaseValue`←`valor` · `purchaseType`←`C` | Conta sem pedidos de compra hoje. A Bling não expõe quantidade recebida por item: atendido → total, em aberto → 0. **Cuidado com loop:** pedidos criados a partir do Lagom (pré-ordem) não devem voltar como novos. |
| **/future-movement** — Vendas firmes (carteira) | `/pedidos/vendas` em situações "Em aberto"/"Em andamento" | `code`←`<idPedido>-<seq>` · `branch` · `item`←`produto.id` · `orderDate`←`data` · `quantity` · `deliveredQuantity`←0 · `status`←O (C quando faturado/cancelado) | Precisa do mapa das situações da conta (`/situacoes/modulos`): há situações customizadas (ex.: `728590`). |
| **/transfer** — Transferência | — | — | **Bloqueado:** a Bling não tem transferência entre depósitos (já registrado em [gaps.md](gaps.md)); a conta tem 1 depósito. |

## 3. Saídas do Lagom (não são alimentadas pela Bling)

| Lagom | Uso |
|---|---|
| `GET /pre-purchase-order` + `PUT /pre-purchase-order/done` | Pré-pedidos sugeridos pelo Lagom → **criar** `POST /pedidos/compras` na Bling (escrita; fase futura, fora do "somente GET"). |
| `GET /transfer-suggestion` + `PUT /transfer-suggestion/done` | Sem destino na Bling (sem transferência nativa). |

## 4. Consultas do Lagom (leitura, úteis para conferência)

`POST /branch-item-parameter/get`, `POST /purchase-order` (filtro), `POST /ideal-stock/get`, `POST /daily-data-dfu`, `POST /forecast/monthly`: permitem conferir o que foi carregado e mostrar previsão e estoque ideal no painel. Exclusões: `DELETE /movement`, `DELETE /purchase-order`.

## Ordem de carga proposta

1. `branch-group` → `branch` (depósitos)
2. `payment-terms` → `supplier` → `brand` → `supplier-brand`
3. `item-group` (pais antes dos filhos) → `item-secondary-group` → `item` → `item-composition` → atributos customizados → `branch-item-parameter`
4. `customer-group` → `customer`
5. `stock` → `movement` (histórico) → `purchase-order` → `future-movement`

Cargas recorrentes: cadastros por `dataAlteracaoInicial` (produtos e contatos têm esse filtro); estoque completo diário; movimentos e pedidos por janela de data.

## Volume e quota

A quota da Bling é de 3 req/s e 120.000/dia por conta. Marca, unidade, estrutura e campos customizados só vêm no **detalhe** do produto: carga inicial ≈ 1 GET por produto (+ 1 por variação). Cidade/UF do cliente: 1 GET por contato. A 2 req/s, 10.000 produtos ≈ 1h30 na carga inicial. Depois disso, só o incremental.

## Decisões pendentes (bloqueiam a implementação)

1. **Filial:** depósito Bling = filial Lagom?
2. **Movimentação:** NF-e de saída ou pedido de venda?
3. **Item sem GTIN / sem código de fornecedor:** qual fallback (ex.: SKU)?
4. **makeToStock:** todos `true`, ou por tipo/formato?
5. **Fornecedor:** valores padrão de `freight` e `paymentTerm`.
6. **Grupo de cliente:** grupo único, ou por PF/PJ?
7. **Situações** de pedido de venda/compra que significam aberto × fechado × cancelado.
8. **Credenciais Lagom** (`LAGOM_ORGANIZATION`, `LAGOM_TOKEN`) e autorização para escrever no sandbox.
