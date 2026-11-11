# Integração Lagom DRP — API, snapshot Bling e carga de cadastros

## Configuração (.env)

| Variável | Padrão | Uso |
|---|---|---|
| `LAGOM_API_BASE_URL` | sandbox `https://beta-api-sandbox.lagomtech.com.br` | Rotas na raiz do host. |
| `LAGOM_ORGANIZATION` / `LAGOM_TOKEN` | — | Apelido da empresa + token da API (PUT `/login`). |
| `LAGOM_WRITE_ENABLED` | `false` | Libera PUT/DELETE no Lagom. Com `false`, toda escrita responde `403 LAGOM_WRITE_DISABLED` sem tocar a rede. |
| `LAGOM_BATCH_SIZE` | `500` | Registros por requisição nos upserts em lote. |
| `LAGOM_TIMEOUT_MS` | `30000` | Timeout por requisição. |

As rotas `/api/lagom/*` exigem `ADMIN_API_TOKEN` (o proxy do painel injeta a chave).

## Catálogo e cliente

- `scripts/generate-lagom-catalog.mjs` gera `apps/{api,web}/src/generated/lagom-catalog.ts` a partir de `/api-json`: as 35 operações (método, rota, tipo, se grava), os 55 schemas com campos/obrigatoriedade e interfaces TypeScript (`ItemDTO`, `LagomOperationMap`…). Para atualizar: `node scripts/generate-lagom-catalog.mjs`.
- `apps/api/src/lagom.ts` — `LagomClient.call(id, body)` executa qualquer operação tipada. Login com organização + token; o JWT (4h) fica só em memória, é renovado por `POST /login/refresh` 2 min antes de expirar e, se o refresh falhar, faz novo login. Um 401 é repetido uma vez com token novo.
- Classificação: **consultas** (GET e POST de filtro — não gravam), **cadastros**, **transações** e **retorno** (`/done`), sendo as três últimas escrita.

## Rotas

| Rota | Função |
|---|---|
| `GET /api/lagom/status`, `POST /api/lagom/test` | Estado e teste de login + consulta. |
| `GET /api/lagom/catalog` | Catálogo completo. |
| `POST /api/lagom/op/:id` `{ body }` | Executa uma operação do catálogo (escrita só com `LAGOM_WRITE_ENABLED`). |
| `GET/POST /api/lagom/snapshot` `{ mode: incremental \| full }` | Lê os cadastros da Bling para `source_records`. |
| `GET/PUT /api/lagom/options` | Decisões de mapeamento (persistidas em `integration_configurations`). |
| `GET /api/lagom/compat`, `GET /api/lagom/compat/:recurso` | Relatório de compatibilidade e registros por filtro. |
| `GET/POST /api/lagom/load` `{ dryRun, resources? }` | Simulação ou envio ao Lagom. |

## Fluxo de carga

1. **Snapshot Bling** (somente leitura): depósitos, categorias, grupos de produtos, formas de pagamento, contatos (marcados com o tipo Cliente/Fornecedor), produtos ativos e inativos, vínculos produto/fornecedor e o **detalhe** de cada produto e contato (1 GET cada, a 2 req/s). O incremental só relê detalhes ausentes ou alterados desde o último snapshot completo (`dataAlteracaoInicial`).
2. **Mapeamento** (`bling-lagom-mapping.ts`, funções puras) gera o payload de cada DTO, valida contra o schema do OpenAPI (obrigatórios, tipos, tamanho, datas) e as referências entre cadastros (marca, grupo, fornecedor, componente, filial) e detecta composições espelho e ciclos.
3. **Carga** (`lagom-load.ts`) na ordem: grupo de filial → filial → marca → grupo de item → grupo secundário → termo de pagamento → fornecedor → item → fornecedor/marca → composição → grupo de cliente → cliente → parâmetro filial/item. Só registros sem erro; só os que mudaram desde o último envio confirmado (hash em `entity_links`). Cada execução fica em `integration_runs` e `integration_events`.

Detalhes do mapeamento e da compatibilidade: [lagom-bling-mapping.md](lagom-bling-mapping.md).
