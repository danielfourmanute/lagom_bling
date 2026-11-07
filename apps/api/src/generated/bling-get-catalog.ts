// GERADO por scripts/generate-bling-catalog.mjs — não editar manualmente.
// Fonte: https://developer.bling.com.br/build/assets/openapi-CR5QY_N1.json (OpenAPI 3.0); 100 endpoints GET.

export interface BlingParam { name: string; in: 'query' | 'path'; required: boolean; isArray: boolean; type: 'string' | 'integer' | 'number' | 'boolean'; format?: string; enum?: (string | number)[]; default?: unknown; description?: string; example?: string }
export interface BlingEndpoint { id: string; tag: string; group: string; path: string; summary: string; description: string; action: string; params: BlingParam[]; paginated: boolean; detailId?: string }

export const blingEndpoints: BlingEndpoint[] = [
 {
  "id": "anuncios",
  "tag": "Anúncios",
  "group": "anuncios",
  "path": "/anuncios",
  "summary": "Obtém anúncios",
  "description": "Obtém anúncios paginados.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "situacao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     1,
     2,
     3,
     4
    ],
    "default": 1,
    "description": "Situação do anúncio\n`1` Publicado\n`2` Rascunho\n`3` Com problema\n`4` Pausado"
   },
   {
    "name": "idProduto",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do produto",
    "example": "12345"
   },
   {
    "name": "tipoIntegracao",
    "in": "query",
    "required": true,
    "isArray": false,
    "type": "string",
    "description": "Tipo de integração",
    "example": "MercadoLivre"
   },
   {
    "name": "idLoja",
    "in": "query",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da loja",
    "example": "1"
   }
  ],
  "paginated": true,
  "detailId": "anuncios-id"
 },
 {
  "id": "anuncios-id",
  "tag": "Anúncios",
  "group": "anuncios",
  "path": "/anuncios/{idAnuncio}",
  "summary": "Obtém um anúncio",
  "description": "Obtém os detalhes de um anúncio específico pelo seu ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idAnuncio",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do anúncio",
    "example": "12345678"
   },
   {
    "name": "tipoIntegracao",
    "in": "query",
    "required": true,
    "isArray": false,
    "type": "string",
    "description": "Tipo de integração",
    "example": "MercadoLivre"
   },
   {
    "name": "idLoja",
    "in": "query",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da loja",
    "example": "1"
   }
  ],
  "paginated": false
 },
 {
  "id": "anuncios-categorias",
  "tag": "Anúncios - Categorias",
  "group": "anuncios-categorias",
  "path": "/anuncios/categorias",
  "summary": "Obtém categorias de anúncios",
  "description": "Obtém categorias de anúncios.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "tipoIntegracao",
    "in": "query",
    "required": true,
    "isArray": false,
    "type": "string",
    "description": "Tipo de integração",
    "example": "MercadoLivre"
   },
   {
    "name": "idLoja",
    "in": "query",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da loja",
    "example": "1"
   },
   {
    "name": "idCategoria",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID da categoria",
    "example": "10"
   },
   {
    "name": "tipoProduto",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "description": "Tipo do produto",
    "example": "eletronico"
   }
  ],
  "paginated": false,
  "detailId": "anuncios-categorias-id"
 },
 {
  "id": "anuncios-categorias-id",
  "tag": "Anúncios - Categorias",
  "group": "anuncios-categorias",
  "path": "/anuncios/categorias/{idCategoria}",
  "summary": "Obtém uma categoria de anúncio",
  "description": "Obtém uma categoria de anúncio pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idCategoria",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "string",
    "description": "ID da categoria no marketplace (ex.: Mercado Livre)",
    "example": "MLB1430"
   },
   {
    "name": "tipoIntegracao",
    "in": "query",
    "required": true,
    "isArray": false,
    "type": "string",
    "description": "Tipo de integração",
    "example": "MercadoLivre"
   },
   {
    "name": "idLoja",
    "in": "query",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da loja",
    "example": "1"
   }
  ],
  "paginated": false
 },
 {
  "id": "borderos-id",
  "tag": "Borderôs",
  "group": "borderos",
  "path": "/borderos/{idBordero}",
  "summary": "Obtém um borderô",
  "description": "Obtém um borderô pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idBordero",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do bordero"
   }
  ],
  "paginated": false
 },
 {
  "id": "caixas",
  "tag": "Caixas e Bancos",
  "group": "caixas-e-bancos",
  "path": "/caixas",
  "summary": "Obtém lista de lançamentos de caixas e bancos.",
  "description": "Obtém lista de lançamentos de caixas e bancos.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "dataInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data inicial de consulta de movimentações, só serão retornados os lançamentos a partir dessa data. Deve ser informada no formato AAAA-MM-DD. Caso não informado, o padrão será o primeiro dia do mês atual.",
    "example": "2024-12-01"
   },
   {
    "name": "dataFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data final de consulta de movimentações, só serão retornados os lançamentos até essa data. Deve ser informada no formato AAAA-MM-DD. Caso não informado, o padrão será o último dia do mês atual.",
    "example": "2024-12-31"
   },
   {
    "name": "idsCategorias",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "integer",
    "description": "IDs das categorias de movimentações."
   },
   {
    "name": "idContaFinanceira",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID da conta financeira.",
    "example": "1"
   },
   {
    "name": "pesquisa",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "description": "Pesquisa por descrição do lançamento.",
    "example": "Compra de mercadorias"
   },
   {
    "name": "valor",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "number",
    "description": "Valor do lançamento.",
    "example": "100"
   },
   {
    "name": "situacaoConciliacao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     1,
     2,
     3
    ],
    "default": 3,
    "description": "Situação da conciliação do lançamento\n`1` Registros conciliados\n`2` Registros não conciliados\n`3` Todos os registros",
    "example": "3"
   },
   {
    "name": "situacao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "enum": [
     "R",
     "E"
    ],
    "default": "R",
    "description": "Situação do lançamento.\n'R' para registros\n'E' para excluídos",
    "example": "R"
   }
  ],
  "paginated": true,
  "detailId": "caixas-id"
 },
 {
  "id": "caixas-id",
  "tag": "Caixas e Bancos",
  "group": "caixas-e-bancos",
  "path": "/caixas/{idCaixa}",
  "summary": "Obtém um lançamento de caixa e banco.",
  "description": "Obtém um lançamento de caixa e banco.",
  "action": "Obter",
  "params": [
   {
    "name": "idCaixa",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do lançamento de caixas e bancos",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "campos-customizados-id",
  "tag": "Campos Customizados",
  "group": "campos-customizados",
  "path": "/campos-customizados/{idCampoCustomizado}",
  "summary": "Obtém um campo customizado",
  "description": "Obtém um campo customizado pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idCampoCustomizado",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do campo customizado",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "campos-customizados-modulos",
  "tag": "Campos Customizados",
  "group": "campos-customizados",
  "path": "/campos-customizados/modulos",
  "summary": "Obtém módulos que possuem campos customizados",
  "description": "Obtém módulos que possuem campos customizados.",
  "action": "ObterModulosCamposCustomizados",
  "params": [],
  "paginated": false,
  "detailId": "campos-customizados-modulos-id"
 },
 {
  "id": "campos-customizados-modulos-id",
  "tag": "Campos Customizados",
  "group": "campos-customizados",
  "path": "/campos-customizados/modulos/{idModulo}",
  "summary": "Obtém campos customizados por módulo",
  "description": "Obtém campos customizados por módulo paginados.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "idModulo",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "example": "12345678"
   },
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   }
  ],
  "paginated": true
 },
 {
  "id": "campos-customizados-tipos",
  "tag": "Campos Customizados",
  "group": "campos-customizados",
  "path": "/campos-customizados/tipos",
  "summary": "Obtém tipos de campos customizados",
  "description": "Obtém tipos de campos customizados.",
  "action": "ObterTiposCamposCustomizados",
  "params": [],
  "paginated": false
 },
 {
  "id": "canais-venda",
  "tag": "Canais de Venda",
  "group": "canais-de-venda",
  "path": "/canais-venda",
  "summary": "Obtém canais de venda",
  "description": "Obtém canais de venda paginados.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "tipos[]",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "string",
    "description": "Parâmetro para filtrar os registros através de uma lista de tipos de canal de venda."
   },
   {
    "name": "situacao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     1,
     2
    ],
    "description": "Parâmetro para filtrar os registros através da situação\n`1` Habilitado\n`2` Desabilitado"
   },
   {
    "name": "agrupador",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     1,
     2,
     3,
     4
    ],
    "description": "Agrupador do canal de venda\n`1` Loja virtual\n`2` Hub\n`3` Marketplace\n`4` API",
    "example": "1"
   }
  ],
  "paginated": true,
  "detailId": "canais-venda-id"
 },
 {
  "id": "canais-venda-id",
  "tag": "Canais de Venda",
  "group": "canais-de-venda",
  "path": "/canais-venda/{idCanalVenda}",
  "summary": "Obtém um canal de venda",
  "description": "Obtém uma canal de venda pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idCanalVenda",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do canal de venda",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "canais-venda-tipos",
  "tag": "Canais de Venda",
  "group": "canais-de-venda",
  "path": "/canais-venda/tipos",
  "summary": "Obtém os tipos de canais de venda",
  "description": "Obtém os tipos de canais de venda paginados.",
  "action": "ObterTiposCanaisVenda",
  "params": [
   {
    "name": "agrupador",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     1,
     2,
     3,
     4
    ],
    "description": "Agrupador do canal de venda\n`1` Loja virtual\n`2` Hub\n`3` Marketplace\n`4` API",
    "example": "1"
   }
  ],
  "paginated": false
 },
 {
  "id": "categorias-lojas",
  "tag": "Categorias - Lojas",
  "group": "categorias-lojas",
  "path": "/categorias/lojas",
  "summary": "Obtém categorias de lojas virtuais vinculadas a de produtos",
  "description": "Obtém categorias de lojas virtuais vinculadas a de produtos paginadas.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "idLoja",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID da loja",
    "example": "12345678"
   },
   {
    "name": "idCategoriaProduto",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID da categoria do produto",
    "example": "12345678"
   },
   {
    "name": "idCategoriaProdutoPai",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID da categoria do produto pai",
    "example": "12345678"
   }
  ],
  "paginated": true,
  "detailId": "categorias-lojas-id"
 },
 {
  "id": "categorias-lojas-id",
  "tag": "Categorias - Lojas",
  "group": "categorias-lojas",
  "path": "/categorias/lojas/{idCategoriaLoja}",
  "summary": "Obtém uma categoria da loja vinculada a de produto",
  "description": "Obtém uma categoria da loja vinculada a de produto pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idCategoriaLoja",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do vínculo da categoria de produto com a da loja",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "categorias-produtos",
  "tag": "Categorias - Produtos",
  "group": "categorias-produtos",
  "path": "/categorias/produtos",
  "summary": "Obtém categorias de produtos",
  "description": "Obtém categorias de produtos paginadas.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   }
  ],
  "paginated": true,
  "detailId": "categorias-produtos-id"
 },
 {
  "id": "categorias-produtos-id",
  "tag": "Categorias - Produtos",
  "group": "categorias-produtos",
  "path": "/categorias/produtos/{idCategoriaProduto}",
  "summary": "Obtém uma categoria de produto",
  "description": "Obtém uma categoria de produto pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idCategoriaProduto",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da categoria de produto",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "categorias-receitas-despesas",
  "tag": "Categorias - Receitas e Despesas",
  "group": "categorias-receitas-e-despesas",
  "path": "/categorias/receitas-despesas",
  "summary": "Obtém categorias de receitas e despesas",
  "description": "Obtém categorias de receitas e despesas paginadas.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "tipo",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     0,
     1,
     2,
     3
    ],
    "default": 0,
    "description": "`0` Todas\n`1` Despesa\n`2` Receita\n`3` Receita e despesa"
   },
   {
    "name": "situacao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     0,
     1,
     2
    ],
    "default": 0,
    "description": "`0` Ativas e Inativas\n`1` Ativas\n`2` Inativas"
   }
  ],
  "paginated": true,
  "detailId": "categorias-receitas-despesas-id"
 },
 {
  "id": "categorias-receitas-despesas-id",
  "tag": "Categorias - Receitas e Despesas",
  "group": "categorias-receitas-e-despesas",
  "path": "/categorias/receitas-despesas/{idCategoria}",
  "summary": "Obtém uma categoria de receita e despesa",
  "description": "Obtém uma categoria de receita e despesa pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idCategoria",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da categoria de receita e despesa",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "contas-pagar",
  "tag": "Contas a Pagar",
  "group": "contas-a-pagar",
  "path": "/contas/pagar",
  "summary": "Obtém contas a pagar",
  "description": "Obtém contas a pagar paginadas.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "dataEmissaoInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data de emissão inicial da conta a pagar",
    "example": "2023-01-12"
   },
   {
    "name": "dataEmissaoFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data de emissão final da conta a pagar",
    "example": "2023-01-12"
   },
   {
    "name": "dataVencimentoInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data de vencimento inicial da conta a pagar",
    "example": "2023-01-12"
   },
   {
    "name": "dataVencimentoFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data de vencimento final da conta a pagar",
    "example": "2023-01-12"
   },
   {
    "name": "dataPagamentoInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data de pagamento inicial da conta",
    "example": "2023-01-12"
   },
   {
    "name": "dataPagamentoFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data de pagamento final da conta",
    "example": "2023-01-12"
   },
   {
    "name": "situacao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     1,
     2,
     3,
     4,
     5
    ],
    "description": "`1` Em aberto\n`2` Pago\n`3` Parcialmente pago\n`4` Devolvido\n`5` Cancelado",
    "example": "1"
   },
   {
    "name": "idContato",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do contato",
    "example": "12345678"
   }
  ],
  "paginated": true,
  "detailId": "contas-pagar-id"
 },
 {
  "id": "contas-pagar-id",
  "tag": "Contas a Pagar",
  "group": "contas-a-pagar",
  "path": "/contas/pagar/{idContaPagar}",
  "summary": "Obtém uma conta a pagar",
  "description": "Obtém uma conta a pagar pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idContaPagar",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da conta a pagar",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "contas-receber",
  "tag": "Contas a Receber",
  "group": "contas-a-receber",
  "path": "/contas/receber",
  "summary": "Obtém contas a receber",
  "description": "Obtém contas a receber paginadas.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "situacoes[]",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "integer",
    "description": "`1` Em aberto\n`2` Recebido\n`3` Parcialmente recebido\n`4` Devolvido\n`5` Cancelado"
   },
   {
    "name": "tipoFiltroData",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "enum": [
     "E",
     "V",
     "R"
    ],
    "default": "E",
    "description": "Referente ao campo que será considerado ao filtrar por data inicial e final\n`E` Data de emissão\n`V` Data de vencimento\n`R` Data de recebimento"
   },
   {
    "name": "dataInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data inicial. Por padrão, um ano antes da data atual.",
    "example": "2022-01-01"
   },
   {
    "name": "dataFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data final. Por padrão, a data atual.",
    "example": "2023-01-01"
   },
   {
    "name": "idsCategorias[]",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "integer",
    "description": "IDs das categorias de receitas e despesas"
   },
   {
    "name": "idPortador",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID da conta financeira",
    "example": "12345678"
   },
   {
    "name": "idContato",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do contato",
    "example": "12345678"
   },
   {
    "name": "idVendedor",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do vendedor",
    "example": "12345678"
   },
   {
    "name": "idFormaPagamento",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID da forma de pagamento",
    "example": "12345678"
   },
   {
    "name": "boletoGerado",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     0,
     1
    ],
    "description": "Obtém contas com ou sem boletos emitidos via integração, `0` para boletos não emitidos e `1` para boletos emitidos",
    "example": "1"
   }
  ],
  "paginated": true,
  "detailId": "contas-receber-id"
 },
 {
  "id": "contas-receber-id",
  "tag": "Contas a Receber",
  "group": "contas-a-receber",
  "path": "/contas/receber/{idContaReceber}",
  "summary": "Obtém uma conta a receber",
  "description": "Obtém uma conta a receber pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idContaReceber",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da conta a receber",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "contas-receber-boletos",
  "tag": "Contas a Receber",
  "group": "contas-a-receber",
  "path": "/contas/receber/boletos",
  "summary": "Obtém boletos de contas a receber",
  "description": "Obtém os boletos vinculados a um idOrigem, o qual corresponde ao ID de uma venda ou nota fiscal.",
  "action": "ObterBoletos",
  "params": [
   {
    "name": "idOrigem",
    "in": "query",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da venda ou nota fiscal",
    "example": "12345678"
   },
   {
    "name": "situacoes[]",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "integer",
    "default": 1,
    "description": "`1` Em aberto\n`2` Recebido\n`3` Parcialmente recebido\n`4` Devolvido\n`5` Parcialmente devolvido\n`6` Cancelado"
   }
  ],
  "paginated": false
 },
 {
  "id": "contas-contabeis",
  "tag": "Contas Financeiras",
  "group": "contas-financeiras",
  "path": "/contas-contabeis",
  "summary": "Obtém contas financeiras",
  "description": "Obtém contas financeiras paginadas.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "ocultarInvisiveis",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "boolean",
    "description": "Oculta contas financeiras invisíveis",
    "example": "true"
   },
   {
    "name": "ocultarTipoContaBancaria",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "boolean",
    "description": "Oculta contas financeiras do tipo conta bancária",
    "example": "true"
   },
   {
    "name": "situacoes",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "integer",
    "enum": [
     1,
     2,
     3,
     4
    ],
    "description": "Situação da conta financeira\n`1` Ativo\n`2` Inativo\n`3` Pendente\n`4` Cancelada"
   },
   {
    "name": "aliasIntegracao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "description": "Alias da integração",
    "example": "BlingPagamentos"
   },
   {
    "name": "ordenacao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "enum": [
     "descricao",
     "-descricao"
    ],
    "description": "Ordenação da obtenção pelos campos:\n`descricao`",
    "example": "descricao"
   }
  ],
  "paginated": true,
  "detailId": "contas-contabeis-id"
 },
 {
  "id": "contas-contabeis-id",
  "tag": "Contas Financeiras",
  "group": "contas-financeiras",
  "path": "/contas-contabeis/{idContaContabil}",
  "summary": "Obtém uma conta financeira",
  "description": "Obtém uma conta financeira pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idContaContabil",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da conta financeira",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "contatos",
  "tag": "Contatos",
  "group": "contatos",
  "path": "/contatos",
  "summary": "Obtém contatos",
  "description": "Obtém contatos paginados.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "pesquisa",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "description": "Nome, CPF/CNPJ, fantasia, e-mail ou código do contato"
   },
   {
    "name": "criterio",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     1,
     2,
     3,
     4
    ],
    "default": 3,
    "description": "Criterio de listagem\n`1` Todos\n`2` Excluídos\n`3` Últimos incluídos\n`4` Sem movimento"
   },
   {
    "name": "dataInclusaoInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "datetime",
    "description": "Data de inclusão inicial",
    "example": "2022-01-01 10:00:00"
   },
   {
    "name": "dataInclusaoFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "datetime",
    "description": "Data de inclusão final",
    "example": "2022-01-01 15:00:00"
   },
   {
    "name": "dataAlteracaoInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "datetime",
    "description": "Data de alteração inicial",
    "example": "2022-01-01 10:00:00"
   },
   {
    "name": "dataAlteracaoFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "datetime",
    "description": "Data de alteração final",
    "example": "2022-01-01 15:00:00"
   },
   {
    "name": "idTipoContato",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do tipo do contato",
    "example": "12345678"
   },
   {
    "name": "idVendedor",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do vendedor relacionado ao contato",
    "example": "12345678"
   },
   {
    "name": "uf",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "description": "UF do contato",
    "example": "RS"
   },
   {
    "name": "telefone",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "description": "Telefone do contato",
    "example": "(51) 99999-9999"
   },
   {
    "name": "idsContatos[]",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "integer",
    "description": "IDs dos contatos"
   },
   {
    "name": "numeroDocumento",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "description": "CPF/CNPJ, desconsiderando a pontuação",
    "example": "12345678910"
   },
   {
    "name": "tipoPessoa",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     1,
     2,
     3
    ],
    "description": "Tipo de pessoa\n`1` Física\n`2` Jurídica\n`3` Estrangeiro",
    "example": "1"
   }
  ],
  "paginated": true,
  "detailId": "contatos-id"
 },
 {
  "id": "contatos-id",
  "tag": "Contatos",
  "group": "contatos",
  "path": "/contatos/{idContato}",
  "summary": "Obtém um contato",
  "description": "Obtém um contato pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idContato",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do contato",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "contatos-id-tipos",
  "tag": "Contatos",
  "group": "contatos",
  "path": "/contatos/{idContato}/tipos",
  "summary": "Obtém os tipos de contato de um contato",
  "description": "Obtém os tipos de contato de um contato pelo ID.",
  "action": "ObterTipoContato",
  "params": [
   {
    "name": "idContato",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do contato",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "contatos-consumidor-final",
  "tag": "Contatos",
  "group": "contatos",
  "path": "/contatos/consumidor-final",
  "summary": "Obtém os dados do contato Consumidor Final",
  "description": "Obtém os dados do contato Consumidor Final. O consumidor final é um contato padrão do sistema que é criado automaticamente e não pode ser alterado.",
  "action": "Obter",
  "params": [],
  "paginated": false
 },
 {
  "id": "contatos-tipos",
  "tag": "Contatos - Tipos",
  "group": "contatos-tipos",
  "path": "/contatos/tipos",
  "summary": "Obtém tipos de contato",
  "description": "Obtém tipos de contato pelo ID.",
  "action": "ObterTipoContatoMultiplos",
  "params": [],
  "paginated": false
 },
 {
  "id": "contratos",
  "tag": "Contratos",
  "group": "contratos",
  "path": "/contratos",
  "summary": "Obtém contratos",
  "description": "Obtém contratos paginados.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "dataCriacaoInicio",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data inicial de criação",
    "example": "2023-01-01"
   },
   {
    "name": "dataCriacaoFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data final de criação",
    "example": "2023-01-15"
   },
   {
    "name": "dataBaseInicio",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data base inicial para geração de cobranças",
    "example": "2023-01-01"
   },
   {
    "name": "dataBaseFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data base final para geração de cobranças",
    "example": "2023-01-15"
   },
   {
    "name": "situacao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "enum": [
     0,
     1,
     2,
     3
    ],
    "default": 1,
    "description": "`0` Inativo\n`1` Ativo\n`2` Baixado\n`3` Isento"
   },
   {
    "name": "idContato",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do contato",
    "example": "1245678"
   },
   {
    "name": "idContatoCobranca",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do contato de cobrança",
    "example": "1245678"
   }
  ],
  "paginated": true,
  "detailId": "contratos-id"
 },
 {
  "id": "contratos-id",
  "tag": "Contratos",
  "group": "contratos",
  "path": "/contratos/{idContrato}",
  "summary": "Obtém um contrato",
  "description": "Obtém um contrato pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idContrato",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do contrato",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "depositos",
  "tag": "Depósitos",
  "group": "depositos",
  "path": "/depositos",
  "summary": "Obtém depósitos",
  "description": "Obtém depósitos paginados.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "descricao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "description": "Descrição do depósito",
    "example": "Geral"
   },
   {
    "name": "situacao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     0,
     1
    ],
    "default": 1,
    "description": "`0` Inativo\n`1` Ativo"
   }
  ],
  "paginated": true,
  "detailId": "depositos-id"
 },
 {
  "id": "depositos-id",
  "tag": "Depósitos",
  "group": "depositos",
  "path": "/depositos/{idDeposito}",
  "summary": "Obtém um depósito",
  "description": "Obtém um depósito pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idDeposito",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do depósito",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "documentos-compartilhados-id",
  "tag": "Documentos Compartilhados",
  "group": "documentos-compartilhados",
  "path": "/documentos-compartilhados/{token}",
  "summary": "Obtém um documento compartilhado.",
  "description": "Obtém um documento compartilhado pelo token.",
  "action": "Obter",
  "params": [
   {
    "name": "token",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "string",
    "description": "Token HMAC assinado contendo os dados do documento e prazo de validade.",
    "example": "eyJkaWQiOjEyMzQ1Nn0.abc123xyz"
   }
  ],
  "paginated": false
 },
 {
  "id": "empresas-me-dados-basicos",
  "tag": "Empresas",
  "group": "empresas",
  "path": "/empresas/me/dados-basicos",
  "summary": "Obtém dados básicos da empresa",
  "description": "Obtém CNPJ, razão social e e-mail da empresa.",
  "action": "Obter",
  "params": [],
  "paginated": false
 },
 {
  "id": "estoques-saldos",
  "tag": "Estoques",
  "group": "estoques",
  "path": "/estoques/saldos",
  "summary": "Obtém o saldo em estoque de produtos",
  "description": "Obtém o saldo em estoque de produtos, em todos os depósitos.",
  "action": "ObterSaldosEstoque",
  "params": [
   {
    "name": "idsProdutos[]",
    "in": "query",
    "required": true,
    "isArray": true,
    "type": "integer",
    "description": "IDs dos produtos. Com saldo multiempresa ativo, máximo de 100 por requisição."
   },
   {
    "name": "codigos[]",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "string",
    "description": "Códigos dos produtos"
   },
   {
    "name": "filtroSaldoEstoque",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     0,
     1,
     2
    ],
    "default": 1,
    "description": "Filtra o saldo em estoque\n`0` zerado\n`1` positivo\n`2` negativo\nCom o módulo multiempresa ativo, ao consultar todos os depósitos ou o depósito virtual, o saldo filtrado é o `saldoMultiempresa` do depósito virtual (consolidado do grupo, descontando as reservas de estoque) somado ao saldo físico dos depósitos locais não vinculados ao multiempresa."
   }
  ],
  "paginated": false,
  "detailId": "estoques-saldos-id"
 },
 {
  "id": "estoques-saldos-id",
  "tag": "Estoques",
  "group": "estoques",
  "path": "/estoques/saldos/{idDeposito}",
  "summary": "Obtém o saldo em estoque de produtos por depósito",
  "description": "Obtém o saldo em estoque de produtos pelo ID do depósito.",
  "action": "ObterSaldosEstoqueDeposito",
  "params": [
   {
    "name": "idDeposito",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do depósito",
    "example": "12345678"
   },
   {
    "name": "idsProdutos[]",
    "in": "query",
    "required": true,
    "isArray": true,
    "type": "integer",
    "description": "IDs dos produtos. Com saldo multiempresa ativo, máximo de 100 por requisição."
   },
   {
    "name": "codigos[]",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "string",
    "description": "Códigos dos produtos"
   },
   {
    "name": "filtroSaldoEstoque",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     0,
     1,
     2
    ],
    "default": 1,
    "description": "Filtra o saldo em estoque\n`0` zerado\n`1` positivo\n`2` negativo\nCom o módulo multiempresa ativo, ao consultar todos os depósitos ou o depósito virtual, o saldo filtrado é o `saldoMultiempresa` do depósito virtual (consolidado do grupo, descontando as reservas de estoque) somado ao saldo físico dos depósitos locais não vinculados ao multiempresa."
   }
  ],
  "paginated": false
 },
 {
  "id": "formas-pagamentos",
  "tag": "Formas de Pagamentos",
  "group": "formas-de-pagamentos",
  "path": "/formas-pagamentos",
  "summary": "Obtém formas de pagamentos",
  "description": "Obtém formas de pagamentos paginadas.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "descricao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "description": "Descrição da forma de pagamento",
    "example": "Dinheiro"
   },
   {
    "name": "tiposPagamentos[]",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "integer",
    "description": "`1` Dinheiro\n`2` Cheque\n`3` Cartão de Crédito\n`4` Cartão de Débito\n`5` Cartão da Loja (Private Label)\n`10` Vale Alimentação\n`11` Vale Refeição\n`12` Vale Presente\n`13` Vale Combustível\n`14` Duplicata Mercantil\n`15` Boleto Bancário\n`16` Depósito Bancário\n`17` Pagamento Instantâneo (PIX) - Dinâmico\n`18` Transferência Bancária, Carteira Digital\n`19` Programa de Fidelidade, Cashback, Crédito Virtual\n`20` Pagamento Instantâneo (PIX) – Estático\n`21` Crédito em loja\n`22` Pagamento Eletrônico não Informado - falha de hardware do sistema emissor\n`90` Sem pagamento\n`99` Outros"
   },
   {
    "name": "situacao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     0,
     1
    ],
    "description": "`0` Inativa\n`1` Ativa"
   }
  ],
  "paginated": true,
  "detailId": "formas-pagamentos-id"
 },
 {
  "id": "formas-pagamentos-id",
  "tag": "Formas de Pagamentos",
  "group": "formas-de-pagamentos",
  "path": "/formas-pagamentos/{idFormaPagamento}",
  "summary": "Obtém uma forma de pagamento",
  "description": "Obtém uma forma de pagamento pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idFormaPagamento",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da forma de pagamento",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "grupos-produtos",
  "tag": "Grupos de Produtos",
  "group": "grupos-de-produtos",
  "path": "/grupos-produtos",
  "summary": "Obtém grupos de produtos",
  "description": "Obtém grupos de produtos paginados.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "nome",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "description": "O nome do grupo"
   },
   {
    "name": "nomePai",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "description": "O nome do grupo pai"
   },
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   }
  ],
  "paginated": true,
  "detailId": "grupos-produtos-id"
 },
 {
  "id": "grupos-produtos-id",
  "tag": "Grupos de Produtos",
  "group": "grupos-de-produtos",
  "path": "/grupos-produtos/{idGrupoProduto}",
  "summary": "Obtém um grupo de produtos",
  "description": "Obtém um grupo de produtos pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idGrupoProduto",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do grupo de produto",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "homologacao-produtos",
  "tag": "Homologação",
  "group": "homologacao",
  "path": "/homologacao/produtos",
  "summary": "Obtém o produto da homologação",
  "description": "Obtém o produto que será utilizado durante os demais passos da homologação, e, inicia o processo de validação, o qual deve ser acompanhando via interface do cadastro de aplicativos.",
  "action": "Obter",
  "params": [],
  "paginated": false
 },
 {
  "id": "logisticas",
  "tag": "Logísticas",
  "group": "logisticas",
  "path": "/logisticas",
  "summary": "Obtém logísticas",
  "description": "Obtém logísticas paginados.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "tipoIntegracao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "enum": [
     "AmazonDBA",
     "B2WEntrega",
     "B2WO2O",
     "Correios",
     "CorreiosLog",
     "CustomLogistic",
     "DafitiMilkrun",
     "Envvias",
     "Frenet",
     "FreteDescomplicado",
     "Intelipost",
     "Jadlog",
     "Jamef",
     "Kangu",
     "LogisticaAliExpress",
     "LogisticaShopee",
     "Loggi",
     "MagaluEntregas",
     "Mandae",
     "MelhorEnvio",
     "MercadoEnvios",
     "OlistFulfillment",
     "TotalExpress"
    ],
    "default": "",
    "description": "Parâmetro para filtrar os registros através do tipo da logística."
   },
   {
    "name": "tiposIntegracoes[]",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "string",
    "description": "Parâmetro para filtrar os registros através de uma lista de tipos de logística."
   },
   {
    "name": "situacao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "enum": [
     "H",
     "D"
    ],
    "description": "Parâmetro para filtrar os registros através da situação\n`H` Habilitado\n`D` Desabilitado"
   },
   {
    "name": "logisticasReversas",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "boolean",
    "default": false,
    "description": "Parâmetro para filtrar apenas as logísticas que possuem serviço de reversão. É sobrescrito pelo parâmetro tipoIntegracao, caso enviado junto.",
    "example": "false"
   }
  ],
  "paginated": true,
  "detailId": "logisticas-id"
 },
 {
  "id": "logisticas-id",
  "tag": "Logísticas",
  "group": "logisticas",
  "path": "/logisticas/{idLogistica}",
  "summary": "Obtém uma logística",
  "description": "Obtém uma logística pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idLogistica",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da logística",
    "example": "12345678"
   },
   {
    "name": "listarServicosInativos",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "boolean",
    "default": false,
    "description": "Parâmetro para incluir serviços inativos na resposta.\n`true` Inclui serviços ativos e inativos\n`false` Inclui apenas serviços ativos (padrão)",
    "example": "false"
   }
  ],
  "paginated": false
 },
 {
  "id": "logisticas-etiquetas",
  "tag": "Logísticas - Etiquetas",
  "group": "logisticas-etiquetas",
  "path": "/logisticas/etiquetas",
  "summary": "Obtém etiquetas das vendas",
  "description": "Obtém as etiquetas dos pedidos de venda a partir dos ID's dos pedidos. No momento, o filtro está limitado para apenas um ID.",
  "action": "ObterEtiquetaMultiplos",
  "params": [
   {
    "name": "formato",
    "in": "query",
    "required": true,
    "isArray": false,
    "type": "string",
    "enum": [
     "PDF",
     "ZPL"
    ],
    "description": "Parâmetro para definir o formato do arquivo de impressão.\n`PDF` - Formato PDF\n`ZPL` - Formato ZPL"
   },
   {
    "name": "idsVendas[]",
    "in": "query",
    "required": true,
    "isArray": true,
    "type": "integer",
    "description": "IDs dos pedidos de venda para impressão"
   }
  ],
  "paginated": false
 },
 {
  "id": "logisticas-objetos-id",
  "tag": "Logísticas - Objetos",
  "group": "logisticas-objetos",
  "path": "/logisticas/objetos/{idObjeto}",
  "summary": "Obtém um objeto de logística",
  "description": "Obtém um objeto de logística pelo ID.",
  "action": "ObterObjetoLogistico",
  "params": [
   {
    "name": "idObjeto",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do objeto logístico",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "logisticas-id-remessas",
  "tag": "Logísticas - Remessas",
  "group": "logisticas-remessas",
  "path": "/logisticas/{idLogistica}/remessas",
  "summary": "Obtém as remessas de postagem de uma logística",
  "description": "Obtém as remessas de postagem de uma logística pelo ID.",
  "action": "ObterLogisticaRemessaMultiplos",
  "params": [
   {
    "name": "idLogistica",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da logística",
    "example": "12345678"
   },
   {
    "name": "situacao",
    "in": "query",
    "required": true,
    "isArray": false,
    "type": "integer",
    "enum": [
     -4,
     -3,
     -2,
     -1,
     0,
     1,
     2,
     3,
     4,
     5,
     6
    ],
    "description": "Filtro obrigatório de situação da remessa.",
    "example": "0"
   }
  ],
  "paginated": false
 },
 {
  "id": "logisticas-remessas-id",
  "tag": "Logísticas - Remessas",
  "group": "logisticas-remessas",
  "path": "/logisticas/remessas/{idRemessa}",
  "summary": "Obtém uma remessa de postagem",
  "description": "Obtém uma remessa de postagem pelo ID.",
  "action": "ObterRemessa",
  "params": [
   {
    "name": "idRemessa",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da remessa de postagem",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "logisticas-servicos",
  "tag": "Logísticas - Serviços",
  "group": "logisticas-servicos",
  "path": "/logisticas/servicos",
  "summary": "Obtém serviços de logísticas",
  "description": "Obtém serviços de logísticas paginados.",
  "action": "ObterServicoLogisticoMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "tipoIntegracao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "enum": [
     "AmazonDBA",
     "B2WEntrega",
     "B2WO2O",
     "Correios",
     "CorreiosLog",
     "CustomLogistic",
     "DafitiMilkrun",
     "Envvias",
     "Frenet",
     "FreteDescomplicado",
     "Intelipost",
     "Jadlog",
     "Jamef",
     "Kangu",
     "LogisticaAliExpress",
     "LogisticaShopee",
     "Loggi",
     "MagaluEntregas",
     "Mandae",
     "MelhorEnvio",
     "MercadoEnvios",
     "OlistFulfillment",
     "TotalExpress",
     ""
    ],
    "default": "",
    "description": "Parâmetro para filtrar os registros através do tipo da logística."
   }
  ],
  "paginated": true,
  "detailId": "logisticas-servicos-id"
 },
 {
  "id": "logisticas-servicos-id",
  "tag": "Logísticas - Serviços",
  "group": "logisticas-servicos",
  "path": "/logisticas/servicos/{idLogisticaServico}",
  "summary": "Obtém um servico de logística",
  "description": "Obtém um servico de logística pelo ID.",
  "action": "ObterServicoLogistico",
  "params": [
   {
    "name": "idLogisticaServico",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do serviço",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "naturezas-operacoes",
  "tag": "Naturezas de Operações",
  "group": "naturezas-de-operacoes",
  "path": "/naturezas-operacoes",
  "summary": "Obtém naturezas de operações",
  "description": "Obtém naturezas de operação paginadas.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "situacao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     0,
     1
    ],
    "description": "`0` Inativo\n`1` Ativo",
    "example": "1"
   },
   {
    "name": "descricao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "description": "Descrição da natureza de operação",
    "example": "Compra de mercadoria"
   }
  ],
  "paginated": true
 },
 {
  "id": "nfce",
  "tag": "Notas Fiscais de Consumidor Eletrônicas",
  "group": "notas-fiscais-de-consumidor-eletronicas",
  "path": "/nfce",
  "summary": "Obtém notas fiscais de consumidor",
  "description": "Obtém notas fiscais de consumidor paginadas.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "idTransportador",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do contato do transportador",
    "example": "12345678"
   },
   {
    "name": "chaveAcesso",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "Chave de acesso",
    "example": "35250145752681000182650010000266371238060760"
   },
   {
    "name": "numero",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "Número da nota fiscal de consumidor",
    "example": "1258"
   },
   {
    "name": "serie",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "Série",
    "example": "1"
   },
   {
    "name": "situacao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     1,
     2,
     3,
     4,
     5,
     6,
     7,
     8,
     9,
     10,
     11,
     12
    ],
    "description": "`1` Pendente\n`2` Cancelada\n`3` Aguardando recibo\n`4` Rejeitada\n`5` Autorizada\n`6` Emitida DANFE\n`7` Registrada\n`8` Aguardando protocolo\n`9` Denegada\n`10` Consulta situação\n`11` Bloqueada",
    "example": "1"
   },
   {
    "name": "dataEmissaoInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "datetime",
    "description": "Data e hora inicial de emissão",
    "example": "2021-12-01 00:00:00"
   },
   {
    "name": "dataEmissaoFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "datetime",
    "description": "Data e hora final de emissão",
    "example": "2021-12-31 23:59:59"
   }
  ],
  "paginated": true,
  "detailId": "nfce-id"
 },
 {
  "id": "nfce-id",
  "tag": "Notas Fiscais de Consumidor Eletrônicas",
  "group": "notas-fiscais-de-consumidor-eletronicas",
  "path": "/nfce/{idNotaFiscalConsumidor}",
  "summary": "Obtém uma nota fiscal de consumidor",
  "description": "Obtém uma nota fiscal de consumidor pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idNotaFiscalConsumidor",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da nota fiscal de consumidor",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "nfse",
  "tag": "Notas Fiscais de Serviço Eletrônicas",
  "group": "notas-fiscais-de-servico-eletronicas",
  "path": "/nfse",
  "summary": "Obtém notas de serviços",
  "description": "Obtém notas de serviços paginadas.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "situacao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     1,
     2,
     3,
     4
    ],
    "description": "`0` Pendente\n`1` Emitida\n`2` Disponível para consulta\n`3` Cancelada"
   },
   {
    "name": "dataEmissaoInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data incial do período de emissão",
    "example": "2022-12-01"
   },
   {
    "name": "dataEmissaoFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data final do período de emissão",
    "example": "2023-01-01"
   }
  ],
  "paginated": true,
  "detailId": "nfse-id"
 },
 {
  "id": "nfse-id",
  "tag": "Notas Fiscais de Serviço Eletrônicas",
  "group": "notas-fiscais-de-servico-eletronicas",
  "path": "/nfse/{idNotaServico}",
  "summary": "Obtém uma nota de serviço",
  "description": "Obtém uma nota de serviço pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idNotaServico",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da nota de serviço",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "nfse-configuracoes",
  "tag": "Notas Fiscais de Serviço Eletrônicas",
  "group": "notas-fiscais-de-servico-eletronicas",
  "path": "/nfse/configuracoes",
  "summary": "Configurações de nota de serviço",
  "description": "Obtém todas as configurações de nota de serviço.",
  "action": "ObterConfiguracoes",
  "params": [],
  "paginated": false
 },
 {
  "id": "nfe",
  "tag": "Notas Fiscais Eletrônicas",
  "group": "notas-fiscais-eletronicas",
  "path": "/nfe",
  "summary": "Obtém notas fiscais",
  "description": "Obtém notas fiscais paginadas.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "numeroLoja",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "description": "Número do pedido na loja",
    "example": "123455678"
   },
   {
    "name": "idTransportador",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do contato do transportador",
    "example": "12345678"
   },
   {
    "name": "chaveAcesso",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "Chave de acesso",
    "example": "35250145752681000182650010000266371238060760"
   },
   {
    "name": "numero",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "Número da nota fiscal",
    "example": "158"
   },
   {
    "name": "serie",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "Série",
    "example": "1"
   },
   {
    "name": "situacao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     1,
     2,
     3,
     4,
     5,
     6,
     7,
     8,
     9,
     10,
     11
    ],
    "description": "`1` Pendente\n`2` Cancelada\n`3` Aguardando recibo\n`4` Rejeitada\n`5` Autorizada\n`6` Emitida DANFE\n`7` Registrada\n`8` Aguardando protocolo\n`9` Denegada\n`10` Consulta situação\n`11` Bloqueada\n**Observação:** Caso este parâmetro não seja informado, as notas canceladas não serão incluídas na consulta.",
    "example": "1"
   },
   {
    "name": "tipo",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "enum": [
     "0",
     "1"
    ],
    "default": "1",
    "description": "`0` Entrada\n`1` Saída"
   },
   {
    "name": "dataEmissaoInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data e hora incial de emissão",
    "example": "2021-12-01 00:00:00"
   },
   {
    "name": "dataEmissaoFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data e hora final de emissão",
    "example": "2021-12-31 23:59:59"
   }
  ],
  "paginated": true,
  "detailId": "nfe-id"
 },
 {
  "id": "nfe-id",
  "tag": "Notas Fiscais Eletrônicas",
  "group": "notas-fiscais-eletronicas",
  "path": "/nfe/{idNotaFiscal}",
  "summary": "Obtém uma nota fiscal",
  "description": "Obtém uma nota fiscal pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idNotaFiscal",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da nota fiscal",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "nfe-documento-id",
  "tag": "Notas Fiscais Eletrônicas",
  "group": "notas-fiscais-eletronicas",
  "path": "/nfe/documento/{chaveAcesso}",
  "summary": "Obtém o documento de uma nota fiscal",
  "description": "Obtém o PDF ou XML de uma nota fiscal pela chave de acesso. O formato desejado deve ser informado via query param.",
  "action": "ObterDocumentoNotaFiscal",
  "params": [
   {
    "name": "chaveAcesso",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "string",
    "description": "Chave de acesso da nota fiscal (44 dígitos)",
    "example": "42260290209032000194550010012900751642381235"
   },
   {
    "name": "formato",
    "in": "query",
    "required": true,
    "isArray": false,
    "type": "string",
    "enum": [
     "pdf",
     "xml"
    ],
    "description": "Formato do documento. `pdf` para o DANFE em PDF, `xml` para o XML da NF-e."
   }
  ],
  "paginated": false
 },
 {
  "id": "notificacoes",
  "tag": "Notificações",
  "group": "notificacoes",
  "path": "/notificacoes",
  "summary": "Obtém todas as notificações de uma empresa em um período",
  "description": "Obtém todas as notificações de uma empresa no período informado. Caso período não seja informado, será considerado o ano atual.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "periodo",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "description": "Apenas ano ou ano e mês em que a empresa foi notificada. Caso não informado, será utilizado o ano atual.",
    "example": "2023-01"
   }
  ],
  "paginated": false
 },
 {
  "id": "notificacoes-quantidade",
  "tag": "Notificações",
  "group": "notificacoes",
  "path": "/notificacoes/quantidade",
  "summary": "Obtém a quantidade de notificações de uma empresa em um período",
  "description": "Obtém a quantidade de notificações de uma empresa no período informado. Caso período não seja informado, será considerado o ano atual.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "periodo",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "description": "Apenas ano ou ano e mês em que a empresa foi notificada. Caso não informado, será utilizado o ano atual.",
    "example": "2023-01"
   }
  ],
  "paginated": false
 },
 {
  "id": "ordens-producao",
  "tag": "Ordens de Produção",
  "group": "ordens-de-producao",
  "path": "/ordens-producao",
  "summary": "Obtém ordens de produção",
  "description": "Obtém ordens de produção paginadas.",
  "action": "ObterAcaoMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "idsSituacoes[]",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "integer",
    "description": "IDs das situações"
   }
  ],
  "paginated": true,
  "detailId": "ordens-producao-id"
 },
 {
  "id": "ordens-producao-id",
  "tag": "Ordens de Produção",
  "group": "ordens-de-producao",
  "path": "/ordens-producao/{idOrdemProducao}",
  "summary": "Obtém uma ordem de produção",
  "description": "Obtém uma ordem de produção pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idOrdemProducao",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da ordem de produção",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "ordens-servico",
  "tag": "Ordens de Serviço",
  "group": "ordens-de-servico",
  "path": "/ordens/servico",
  "summary": "Obtém ordens de serviço",
  "description": "Obtém ordens de serviço paginadas.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "idsSituacoes[]",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "integer",
    "description": "Conjunto de IDs de situações da ordem de serviço"
   },
   {
    "name": "dataInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data inicial de entrada",
    "example": "2026-01-01"
   },
   {
    "name": "dataFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data final de entrada",
    "example": "2026-01-31"
   },
   {
    "name": "dataPrevistaInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data inicial prevista",
    "example": "2026-01-01"
   },
   {
    "name": "dataPrevistaFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data final prevista",
    "example": "2026-01-31"
   },
   {
    "name": "dataConclusaoInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data inicial de conclusão",
    "example": "2026-01-01"
   },
   {
    "name": "dataConclusaoFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data final de conclusão",
    "example": "2026-01-31"
   },
   {
    "name": "dataSaidaInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data inicial de saída",
    "example": "2026-01-01"
   },
   {
    "name": "dataSaidaFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data final de saída",
    "example": "2026-01-31"
   },
   {
    "name": "dataGarantiaInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data inicial de vencimento da garantia",
    "example": "2026-01-01"
   },
   {
    "name": "dataGarantiaFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data final de vencimento da garantia",
    "example": "2026-01-31"
   },
   {
    "name": "idContato",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do contato",
    "example": "12345678"
   },
   {
    "name": "idVendedor",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "example": "12345678"
   },
   {
    "name": "numero",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "description": "Número da ordem de serviço",
    "example": "1024"
   },
   {
    "name": "numeroSerie",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "description": "Número de série do equipamento",
    "example": "SN-99887766"
   }
  ],
  "paginated": true,
  "detailId": "ordens-servico-id"
 },
 {
  "id": "ordens-servico-id",
  "tag": "Ordens de Serviço",
  "group": "ordens-de-servico",
  "path": "/ordens/servico/{idOrdemServico}",
  "summary": "Obtém uma ordem de serviço",
  "description": "Obtém uma ordem de serviço pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idOrdemServico",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da ordem de serviço",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "pedidos-compras",
  "tag": "Pedidos - Compras",
  "group": "pedidos-compras",
  "path": "/pedidos/compras",
  "summary": "Obtém pedidos de compras",
  "description": "Obtém pedidos de compras paginados.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "idFornecedor",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do contato do tipo fornecedor",
    "example": "12345678"
   },
   {
    "name": "valorSituacao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "Valor da situação",
    "example": "1"
   },
   {
    "name": "idSituacao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID da situação",
    "example": "12345678"
   },
   {
    "name": "dataInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data inicial do período da compra",
    "example": "2023-01-01"
   },
   {
    "name": "dataFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data final do período da compra",
    "example": "2023-01-01"
   },
   {
    "name": "idsNotasFiscais[]",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "integer",
    "description": "IDs das notas fiscais de entrada"
   }
  ],
  "paginated": true,
  "detailId": "pedidos-compras-id"
 },
 {
  "id": "pedidos-compras-id",
  "tag": "Pedidos - Compras",
  "group": "pedidos-compras",
  "path": "/pedidos/compras/{idPedidoCompra}",
  "summary": "Obtém um pedido de compra",
  "description": "Obtém um pedido de compra pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idPedidoCompra",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do pedido de compra",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "pedidos-vendas",
  "tag": "Pedidos - Vendas",
  "group": "pedidos-vendas",
  "path": "/pedidos/vendas",
  "summary": "Obtém pedidos de vendas",
  "description": "Obtém pedidos de vendas paginados.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "idContato",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do contato",
    "example": "12345678"
   },
   {
    "name": "idsSituacoes[]",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "integer",
    "description": "Conjunto de situações"
   },
   {
    "name": "dataInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data incial",
    "example": "2022-01-01"
   },
   {
    "name": "dataFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data final",
    "example": "2022-01-15"
   },
   {
    "name": "dataAlteracaoInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "datetime",
    "description": "Data inicial da alteração",
    "example": "2022-01-01 10:00:00"
   },
   {
    "name": "dataAlteracaoFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "datetime",
    "description": "Data final da alteração",
    "example": "2022-01-15 11:00:00"
   },
   {
    "name": "dataPrevistaInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data inicial prevista",
    "example": "2022-01-01"
   },
   {
    "name": "dataPrevistaFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data final prevista",
    "example": "2022-01-15"
   },
   {
    "name": "numero",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "Número do pedido de venda",
    "example": "12345"
   },
   {
    "name": "idLoja",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID da loja",
    "example": "12345678"
   },
   {
    "name": "idVendedor",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do vendedor",
    "example": "12345678"
   },
   {
    "name": "idControleCaixa",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do controle de caixa",
    "example": "12345678"
   },
   {
    "name": "numerosLojas[]",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "string",
    "description": "Conjunto de números de pedidos nas lojas"
   },
   {
    "name": "idUnidadeNegocio",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID da unidade de negócio (filial)",
    "example": "12345678"
   }
  ],
  "paginated": true,
  "detailId": "pedidos-vendas-id"
 },
 {
  "id": "pedidos-vendas-id",
  "tag": "Pedidos - Vendas",
  "group": "pedidos-vendas",
  "path": "/pedidos/vendas/{idPedidoVenda}",
  "summary": "Obtém um pedido de venda",
  "description": "Obtém um pedido de venda pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idPedidoVenda",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do pedido de venda",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "produtos",
  "tag": "Produtos",
  "group": "produtos",
  "path": "/produtos",
  "summary": "Obtém produtos",
  "description": "Obtém produtos paginados.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "criterio",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     1,
     2,
     3,
     4,
     5
    ],
    "default": 1,
    "description": "Critério de listagem\n`1` Últimos incluídos\n`2` Ativos\n`3` Inativos\n`4` Excluídos\n`5` Todos"
   },
   {
    "name": "tipo",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "enum": [
     "T",
     "P",
     "S",
     "E",
     "PS",
     "C",
     "V"
    ],
    "default": "T",
    "description": "`T` Todos\n`P` Produtos\n`S` Serviços\n`E` Composições\n`PS` Produtos simples\n`C` Com variações\n`V` Variações"
   },
   {
    "name": "idComponente",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do componente. Utilizado quando o filtro **tipo** for `E`.",
    "example": "12345678"
   },
   {
    "name": "dataInclusaoInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "datetime",
    "description": "Data de inclusão inicial",
    "example": "2020-01-01 12:00:00"
   },
   {
    "name": "dataInclusaoFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "datetime",
    "description": "Data de inclusão final",
    "example": "2020-01-01 13:00:00"
   },
   {
    "name": "dataAlteracaoInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "datetime",
    "description": "Data de alteração inicial",
    "example": "2020-01-01 10:00:00"
   },
   {
    "name": "dataAlteracaoFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "datetime",
    "description": "Data de alteração final",
    "example": "2020-01-01 11:00:00"
   },
   {
    "name": "idCategoria",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID da categoria do produto",
    "example": "12345678"
   },
   {
    "name": "idLoja",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID da loja",
    "example": "12345678"
   },
   {
    "name": "nome",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "description": "Nome do produto",
    "example": " "
   },
   {
    "name": "idsProdutos[]",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "integer",
    "description": "IDs dos produtos"
   },
   {
    "name": "codigos[]",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "string",
    "description": "Códigos (SKU) dos produtos"
   },
   {
    "name": "gtins[]",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "string",
    "description": "GTINs/EANs dos produtos"
   },
   {
    "name": "filtroSaldoEstoque",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "enum": [
     0,
     1,
     2
    ],
    "default": 1,
    "description": "Filtra o saldo em estoque\n`0` zerado\n`1` positivo\n`2` negativo\nCom o módulo multiempresa ativo, ao consultar todos os depósitos ou o depósito virtual, o saldo filtrado é o `saldoMultiempresa` do depósito virtual (consolidado do grupo, descontando as reservas de estoque) somado ao saldo físico dos depósitos locais não vinculados ao multiempresa."
   },
   {
    "name": "filtroSaldoEstoqueDeposito",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do depósito para considerar no filtro de saldo em estoque. Se omitido, considera todos os depósitos.",
    "example": "12345678"
   }
  ],
  "paginated": true,
  "detailId": "produtos-id"
 },
 {
  "id": "produtos-id",
  "tag": "Produtos",
  "group": "produtos",
  "path": "/produtos/{idProduto}",
  "summary": "Obtém um produto",
  "description": "Obtém um produto pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idProduto",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do produto",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "produtos-estruturas-id",
  "tag": "Produtos - Estruturas",
  "group": "produtos-estruturas",
  "path": "/produtos/estruturas/{idProdutoEstrutura}",
  "summary": "Obtém a estrutura de um produto com composição",
  "description": "Obtém a estrutura de um produto com composição pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idProdutoEstrutura",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do produto com composição",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "produtos-fornecedores",
  "tag": "Produtos - Fornecedores",
  "group": "produtos-fornecedores",
  "path": "/produtos/fornecedores",
  "summary": "Obtém produtos fornecedores",
  "description": "Obtém produtos fornecedores paginados.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "idProduto",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do produto",
    "example": "12345678"
   },
   {
    "name": "idFornecedor",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do contato do tipo fornecedor",
    "example": "12345678"
   }
  ],
  "paginated": true,
  "detailId": "produtos-fornecedores-id"
 },
 {
  "id": "produtos-fornecedores-id",
  "tag": "Produtos - Fornecedores",
  "group": "produtos-fornecedores",
  "path": "/produtos/fornecedores/{idProdutoFornecedor}",
  "summary": "Obtém um produto fornecedor",
  "description": "Obtém um produto fornecedor pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idProdutoFornecedor",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do produto fornecedor",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "produtos-lojas",
  "tag": "Produtos - Lojas",
  "group": "produtos-lojas",
  "path": "/produtos/lojas",
  "summary": "Obtém vínculos de produtos com lojas",
  "description": "Obtém vínculos de produtos com lojas paginados.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "idProduto",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do produto",
    "example": "12345678"
   },
   {
    "name": "idLoja",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID da loja",
    "example": "12345678"
   },
   {
    "name": "idCategoriaProduto",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID da categoria do produto vinculada à loja",
    "example": "12345678"
   },
   {
    "name": "dataAlteracaoInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "datetime",
    "description": "Data de alteração inicial",
    "example": "2020-01-01 10:00:00"
   },
   {
    "name": "dataAlteracaoFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "datetime",
    "description": "Data de alteração final",
    "example": "2020-01-01 11:00:00"
   }
  ],
  "paginated": true,
  "detailId": "produtos-lojas-id"
 },
 {
  "id": "produtos-lojas-id",
  "tag": "Produtos - Lojas",
  "group": "produtos-lojas",
  "path": "/produtos/lojas/{idProdutoLoja}",
  "summary": "Obtém um vínculo de produto com loja",
  "description": "Obtém um vínculo de produto com loja pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idProdutoLoja",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do vínculo do produto com a loja",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "produtos-lotes",
  "tag": "Produtos - Lotes",
  "group": "produtos-lotes",
  "path": "/produtos/lotes",
  "summary": "Obtém lotes de produtos",
  "description": "Obtém lotes de produtos paginados.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "idsProdutos[]",
    "in": "query",
    "required": true,
    "isArray": true,
    "type": "integer",
    "description": "IDs dos produtos"
   },
   {
    "name": "idsLotes[]",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "string",
    "description": "IDs dos lotes"
   },
   {
    "name": "idsDepositos[]",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "integer",
    "description": "IDs dos depósitos"
   },
   {
    "name": "codigosLotes[]",
    "in": "query",
    "required": false,
    "isArray": true,
    "type": "string",
    "description": "Códigos dos lotes"
   },
   {
    "name": "status",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "enum": [
     "A",
     "I"
    ],
    "description": "Status do lote",
    "example": "A"
   },
   {
    "name": "dataValidadeInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data de validade inicial",
    "example": "2020-01-01"
   },
   {
    "name": "dataValidadeFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data de validade final",
    "example": "2020-01-01"
   },
   {
    "name": "dataFabricacaoInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data de fabricação inicial",
    "example": "2020-01-01"
   },
   {
    "name": "dataFabricacaoFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data de fabricação final",
    "example": "2020-01-01"
   },
   {
    "name": "dataCriacaoInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "datetime",
    "description": "Data de inclusão inicial",
    "example": "2020-01-01 12:00:00"
   },
   {
    "name": "dataCriacaoFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "datetime",
    "description": "Data de inclusão final",
    "example": "2020-01-01 13:00:00"
   }
  ],
  "paginated": true,
  "detailId": "produtos-lotes-id"
 },
 {
  "id": "produtos-lotes-id",
  "tag": "Produtos - Lotes",
  "group": "produtos-lotes",
  "path": "/produtos/lotes/{idLote}",
  "summary": "Obtém um lote de um produto",
  "description": "Obtém um lote de um produto pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idLote",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do lote",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "produtos-lotes-controla-lote",
  "tag": "Produtos - Lotes",
  "group": "produtos-lotes",
  "path": "/produtos/lotes/controla-lote",
  "summary": "Obtém a informação se determinados produtos possuem controle de lote",
  "description": "Obtém a informação se determinados produtos possuem controle de lote.",
  "action": "ObterMultiplosProdutoControlaLote",
  "params": [
   {
    "name": "idsProdutos[]",
    "in": "query",
    "required": true,
    "isArray": true,
    "type": "integer",
    "description": "IDs dos produtos"
   }
  ],
  "paginated": false
 },
 {
  "id": "produtos-id-lotes-id-depositos-id-saldo",
  "tag": "Produtos - Lotes Lançamentos",
  "group": "produtos-lotes-lancamentos",
  "path": "/produtos/{idProduto}/lotes/{idLote}/depositos/{idDeposito}/saldo",
  "summary": "Obtém o saldo de um lote de produto",
  "description": "Obtém o saldo de um lote de produto.",
  "action": "ObterSaldosLote",
  "params": [
   {
    "name": "idLote",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do lote",
    "example": "12345678"
   },
   {
    "name": "idProduto",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do produto",
    "example": "12345678"
   },
   {
    "name": "idDeposito",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do depósito",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "produtos-id-lotes-depositos-id-saldo",
  "tag": "Produtos - Lotes Lançamentos",
  "group": "produtos-lotes-lancamentos",
  "path": "/produtos/{idProduto}/lotes/depositos/{idDeposito}/saldo",
  "summary": "Obtém os saldos dos lotes de um produto por depósito",
  "description": "Obtém os saldos dos lotes de um produto por depósito.",
  "action": "ObterSaldosLote",
  "params": [
   {
    "name": "idProduto",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do produto",
    "example": "12345678"
   },
   {
    "name": "idDeposito",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do depósito",
    "example": "12345678"
   },
   {
    "name": "idsLotes[]",
    "in": "query",
    "required": true,
    "isArray": true,
    "type": "integer",
    "description": "IDs dos lotes"
   }
  ],
  "paginated": false
 },
 {
  "id": "produtos-id-lotes-depositos-id-saldo-soma",
  "tag": "Produtos - Lotes Lançamentos",
  "group": "produtos-lotes-lancamentos",
  "path": "/produtos/{idProduto}/lotes/depositos/{idDeposito}/saldo/soma",
  "summary": "Obtém a soma dos saldos dos lotes de um produto em um depósito",
  "description": "Obtém a soma dos saldos dos lotes de um produto em um depósito.",
  "action": "ObterSaldosLote",
  "params": [
   {
    "name": "idProduto",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do produto",
    "example": "12345678"
   },
   {
    "name": "idDeposito",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do depósito",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "produtos-id-lotes-saldo-soma",
  "tag": "Produtos - Lotes Lançamentos",
  "group": "produtos-lotes-lancamentos",
  "path": "/produtos/{idProduto}/lotes/saldo/soma",
  "summary": "Obtém o saldo total dos lotes de um produto",
  "description": "Obtém o saldo total dos lotes de um produto pelo ID do produto.",
  "action": "ObterSaldosLote",
  "params": [
   {
    "name": "idProduto",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do produto",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "produtos-lotes-id-lancamentos",
  "tag": "Produtos - Lotes Lançamentos",
  "group": "produtos-lotes-lancamentos",
  "path": "/produtos/lotes/{idLote}/lancamentos",
  "summary": "Obtém os lançamentos de um lote de produto",
  "description": "Obtém os lançamentos de um lote de produto pelo ID.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "idLote",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do lote",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "produtos-lotes-lancamentos-id",
  "tag": "Produtos - Lotes Lançamentos",
  "group": "produtos-lotes-lancamentos",
  "path": "/produtos/lotes/lancamentos/{idLancamento}",
  "summary": "Obtém um lançamento de um lote de produto",
  "description": "Obtém um lançamento de um lote de produto pelo ID do lançamento.",
  "action": "Obter",
  "params": [
   {
    "name": "idLancamento",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do lançamento",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "produtos-variacoes-id",
  "tag": "Produtos - Variações",
  "group": "produtos-variacoes",
  "path": "/produtos/variacoes/{idProdutoPai}",
  "summary": "Obtém o produto e variações",
  "description": "Obtém o produto e variações pelo ID do produto pai.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "idProdutoPai",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do produto pai",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "propostas-comerciais",
  "tag": "Propostas Comerciais",
  "group": "propostas-comerciais",
  "path": "/propostas-comerciais",
  "summary": "Obtém propostas comerciais",
  "description": "Obtém propostas comerciais paginadas.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "situacao",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "description": "O valor referente a situação da proposta: Pendente, Aguardando, Não aprovado, Aprovado, Concluido, Rascunho. Para mais situações, pesquisar pelo número separado por vírgula."
   },
   {
    "name": "idContato",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "format": "int64",
    "description": "ID do contato"
   },
   {
    "name": "dataInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data inicial",
    "example": "2020-08-24"
   },
   {
    "name": "dataFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date",
    "description": "Data final",
    "example": "2020-08-24"
   },
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   }
  ],
  "paginated": true,
  "detailId": "propostas-comerciais-id"
 },
 {
  "id": "propostas-comerciais-id",
  "tag": "Propostas Comerciais",
  "group": "propostas-comerciais",
  "path": "/propostas-comerciais/{idPropostaComercial}",
  "summary": "Obtém uma proposta comercial",
  "description": "Obtém uma proposta comercial pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idPropostaComercial",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "format": "int64",
    "description": "ID da proposta comercial"
   }
  ],
  "paginated": false
 },
 {
  "id": "situacoes-id",
  "tag": "Situações",
  "group": "situacoes",
  "path": "/situacoes/{idSituacao}",
  "summary": "Obtém uma situação",
  "description": "Obtém uma situação pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idSituacao",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da situação",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "situacoes-modulos",
  "tag": "Situações - Módulos",
  "group": "situacoes-modulos",
  "path": "/situacoes/modulos",
  "summary": "Obtém módulos",
  "description": "Obtém módulos.",
  "action": "ObterMultiplos",
  "params": [],
  "paginated": false,
  "detailId": "situacoes-modulos-id"
 },
 {
  "id": "situacoes-modulos-id",
  "tag": "Situações - Módulos",
  "group": "situacoes-modulos",
  "path": "/situacoes/modulos/{idModuloSistema}",
  "summary": "Obtém situações de um módulo",
  "description": "Obtém situações de um módulo pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idModuloSistema",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do módulo do sistema",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "situacoes-modulos-id-acoes",
  "tag": "Situações - Módulos",
  "group": "situacoes-modulos",
  "path": "/situacoes/modulos/{idModuloSistema}/acoes",
  "summary": "Obtém as ações de um módulo",
  "description": "Obtém as ações de um módulo pelo ID.",
  "action": "ObterAcaoMultiplos",
  "params": [
   {
    "name": "idModuloSistema",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do módulo do sistema",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "situacoes-modulos-id-transicoes",
  "tag": "Situações - Módulos",
  "group": "situacoes-modulos",
  "path": "/situacoes/modulos/{idModuloSistema}/transicoes",
  "summary": "Obtém as transições de um módulo",
  "description": "Obtém as transições de um módulo pelo ID.",
  "action": "ObterTransicaoMultiplos",
  "params": [
   {
    "name": "idModuloSistema",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do módulo do sistema",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "situacoes-transicoes-id",
  "tag": "Situações - Transições",
  "group": "situacoes-transicoes",
  "path": "/situacoes/transicoes/{idTransicao}",
  "summary": "Obtém uma transição",
  "description": "Obtém uma transição pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idTransicao",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID da transição",
    "example": "12345678"
   }
  ],
  "paginated": false
 },
 {
  "id": "usuarios-verificar-hash",
  "tag": "Usuários",
  "group": "usuarios",
  "path": "/usuarios/verificar-hash",
  "summary": "Valida o hash recebido",
  "description": "Valida o hash recebido por e-mail.",
  "action": "Obter",
  "params": [
   {
    "name": "hash",
    "in": "query",
    "required": true,
    "isArray": false,
    "type": "string",
    "example": "da24312119016fab3d3e8bf52409db4b"
   }
  ],
  "paginated": false
 },
 {
  "id": "vendedores",
  "tag": "Vendedores",
  "group": "vendedores",
  "path": "/vendedores",
  "summary": "Obtém vendedores",
  "description": "Obtém vendedores paginados.",
  "action": "ObterMultiplos",
  "params": [
   {
    "name": "pagina",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 1,
    "description": "N° da página da listagem"
   },
   {
    "name": "limite",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "default": 100,
    "description": "Quantidade de registros que devem ser exibidos por página"
   },
   {
    "name": "nomeContato",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "description": "Nome do contato do vendedor",
    "example": " "
   },
   {
    "name": "situacaoContato",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "enum": [
     "A",
     "I",
     "S",
     "E",
     "T"
    ],
    "default": "A",
    "description": "Situação do contato do vendedor\n`A` Ativo\n`I` Inativo\n`S` Sem movimento\n`E` Excluído\n`T` Todos"
   },
   {
    "name": "idContato",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID do contato do vendedor",
    "example": "12345678"
   },
   {
    "name": "idLoja",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "integer",
    "description": "ID da loja vinculada ao vendedor",
    "example": "12345678"
   },
   {
    "name": "dataAlteracaoInicial",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date-time",
    "description": "Data de alteração inicial",
    "example": "YYYY-MM-DD hh:mm:ss"
   },
   {
    "name": "dataAlteracaoFinal",
    "in": "query",
    "required": false,
    "isArray": false,
    "type": "string",
    "format": "date-time",
    "description": "Data de alteração final",
    "example": "YYYY-MM-DD hh:mm:ss"
   }
  ],
  "paginated": true,
  "detailId": "vendedores-id"
 },
 {
  "id": "vendedores-id",
  "tag": "Vendedores",
  "group": "vendedores",
  "path": "/vendedores/{idVendedor}",
  "summary": "Obtém um vendedor",
  "description": "Obtém um vendedor pelo ID.",
  "action": "Obter",
  "params": [
   {
    "name": "idVendedor",
    "in": "path",
    "required": true,
    "isArray": false,
    "type": "integer",
    "description": "ID do vendedor",
    "example": "12345678"
   }
  ],
  "paginated": false
 }
];
