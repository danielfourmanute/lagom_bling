# Explorador de APIs Bling (somente GET)

O painel tem uma tela para cada um dos **100 endpoints GET** da Bling API v3 (49 recursos), gerada a partir do OpenAPI oficial (`https://developer.bling.com.br/build/assets/openapi-CR5QY_N1.json`).

- Painel: `/bling` (catálogo, busca, verificação de disponibilidade) e `/bling/<endpoint>` (formulário, tabela, detalhe, JSON, CSV).
- API: `GET /api/bling/v3/:endpointId?<parâmetros>` (chave administrativa obrigatória). Aceita **apenas** endpoints do catálogo e parâmetros declarados no OpenAPI; valida tipos, enums e valores de caminho. Nunca envia outro método além de GET.
- Quota: chamadas espaçadas por `BLING_RATE_LIMIT_PER_SECOND` (padrão 2/s).

## Regenerar o catálogo

```bash
node scripts/generate-bling-catalog.mjs            # baixa o OpenAPI oficial
node scripts/generate-bling-catalog.mjs openapi.json   # ou um arquivo local
```

Gera `apps/api/src/generated/bling-get-catalog.ts` e `apps/web/src/generated/bling-get-catalog.ts` (idênticos). Se a Bling publicar um novo OpenAPI com outro hash no nome, atualize `DEFAULT_SOURCE` no script.

## Disponibilidade na conta conectada (verificado em 2026-11-07)

Listagens sem parâmetros obrigatórios, consultadas com `limite=1`. Os escopos vêm da aplicação Bling; para liberar um recurso, adicione o escopo na aplicação e reautorize em Conexões.

**Disponíveis (30):** campos customizados (módulos, tipos), canais de venda (+ tipos), categorias de lojas, de produtos e de receitas/despesas, contatos (+ tipos, consumidor final), depósitos, empresa (dados básicos), formas de pagamento, grupos de produtos, homologação, logísticas (+ serviços), naturezas de operação, NFC-e, NF-e, notificações (+ quantidade), ordens de produção, pedidos de compra, pedidos de venda, produtos, produtos–fornecedores, produtos–lojas, situações–módulos, vendedores.

**Sem permissão — HTTP 403 `insufficient_scope` (9):** caixas e bancos, contas a pagar, contas a receber, contas financeiras (`/contas-contabeis`), contratos, NFS-e (+ configurações), ordens de serviço, propostas comerciais.

**Requerem parâmetros (61):** os detalhes por ID (herdam a permissão da listagem do recurso) e listagens com filtro obrigatório, como `estoques/saldos` (`idsProdutos[]`), `produtos/lotes`, `anuncios` (`tipoIntegracao` + `idLoja`), `logisticas/etiquetas` e `contas/receber/boletos`. Testes manuais confirmaram `produtos/{id}` e `estoques/saldos`.

Use "Verificar disponibilidade" no painel para refazer a verificação após mudar escopos.
