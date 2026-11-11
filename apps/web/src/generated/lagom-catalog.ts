// GERADO por scripts/generate-lagom-catalog.mjs — não editar manualmente.
// Fonte: https://beta-api-sandbox.lagomtech.com.br/api-json (Integration API 1.0.0); 35 operações, 55 schemas.

export interface LagomField { name: string; type: 'string' | 'number' | 'boolean' | 'object' | 'array'; required: boolean; nullable?: boolean; ref?: string; items?: string; format?: string; maxLength?: number; minLength?: number; minimum?: number; maximum?: number; enum?: unknown[]; description?: string; example?: unknown }
export interface LagomSchema { name: string; fields: LagomField[] }
export type LagomKind = 'auth' | 'cadastro' | 'transacao' | 'consulta' | 'retorno' | 'outro';
export interface LagomBody { array: boolean; schema?: string; primitive?: 'string' | 'number'; fields?: LagomField[]; example?: unknown }
export interface LagomOperation { id: string; method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; path: string; tag: string; kind: LagomKind; mutating: boolean; summary: string; description: string; body?: LagomBody; response: { status: number; array?: boolean; schema?: string; example?: unknown } }

export const lagomSchemas: Record<string, LagomSchema> = {
 "BranchDTO": {
  "name": "BranchDTO",
  "fields": [
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Identificador único da filial no seu sistema",
    "example": "1"
   },
   {
    "name": "name",
    "type": "string",
    "required": true,
    "description": "Nome (Descrição)",
    "example": "filial 1"
   },
   {
    "name": "active",
    "type": "boolean",
    "required": true,
    "description": "Status (Ativo/Inativo)"
   },
   {
    "name": "branchGroup",
    "type": "string",
    "required": false,
    "nullable": true,
    "description": "Identificador único do grupo de filial no seu sistema\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "address",
    "type": "string",
    "required": false,
    "nullable": true,
    "description": "Endereço da filial no seu sistema\nPode ser omitido (Não altera o valor cadastrado)"
   }
  ]
 },
 "OkResponse": {
  "name": "OkResponse",
  "fields": [
   {
    "name": "status",
    "type": "number",
    "required": true,
    "description": "Código de status http para o processamento do registro",
    "example": 200
   },
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Código de referência do registro",
    "example": "1"
   }
  ]
 },
 "BadRequestResponse": {
  "name": "BadRequestResponse",
  "fields": [
   {
    "name": "error",
    "type": "string",
    "required": true,
    "example": "Bad Request"
   },
   {
    "name": "message",
    "type": "string",
    "required": true,
    "example": "Unexpected string in JSON at position 50"
   },
   {
    "name": "statusCode",
    "type": "number",
    "required": true,
    "example": 400
   }
  ]
 },
 "UnauthorizedResponse": {
  "name": "UnauthorizedResponse",
  "fields": [
   {
    "name": "error",
    "type": "string",
    "required": true,
    "example": "Unauthorized"
   },
   {
    "name": "message",
    "type": "string",
    "required": true,
    "example": "Sem token"
   },
   {
    "name": "statusCode",
    "type": "number",
    "required": true,
    "example": 401
   }
  ]
 },
 "InternalErrorResponse": {
  "name": "InternalErrorResponse",
  "fields": [
   {
    "name": "error",
    "type": "string",
    "required": true,
    "example": "Internal Server Error"
   },
   {
    "name": "message",
    "type": "string",
    "required": true,
    "example": "Error:... "
   },
   {
    "name": "statusCode",
    "type": "number",
    "required": true,
    "example": 500
   }
  ]
 },
 "BranchGroupDTO": {
  "name": "BranchGroupDTO",
  "fields": [
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Identificador único do grupo de filial no seu sistema",
    "example": "1"
   },
   {
    "name": "name",
    "type": "string",
    "required": true,
    "description": "Nome da filial (Descrição)",
    "example": "filial"
   },
   {
    "name": "crossDockingBranch",
    "type": "string",
    "required": false,
    "nullable": true,
    "description": "Identificado único da filial utilizada para cross-docking\nPode ser omitido (Não altera o valor cadastrado)",
    "example": "1"
   }
  ]
 },
 "BranchItemParameterDTO": {
  "name": "BranchItemParameterDTO",
  "fields": [
   {
    "name": "branch",
    "type": "string",
    "required": true,
    "description": "Identificador único da filial no seu sistema",
    "example": "1"
   },
   {
    "name": "item",
    "type": "string",
    "required": true,
    "description": "Identificador único do item no seu sistema",
    "example": "1"
   },
   {
    "name": "strategicStock",
    "type": "number",
    "required": false,
    "nullable": true,
    "description": "Quantidade de estoque estratégico\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "purchase",
    "type": "boolean",
    "required": false,
    "nullable": true,
    "description": "Indica se o item está para compra na filial\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "upperStockLimit",
    "type": "number",
    "required": false,
    "nullable": true,
    "description": "Limite de estoque superior\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "receivesTransfer",
    "type": "boolean",
    "required": false,
    "nullable": true,
    "description": "Indica se recebe transferência\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "minimumPurchase",
    "type": "number",
    "required": false,
    "nullable": true,
    "description": "Mínimo de Compra\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "minimumResupply",
    "type": "number",
    "required": false,
    "nullable": true,
    "description": "Mínimo de Ressuprimento\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "multiplePurchase",
    "type": "number",
    "required": false,
    "nullable": true,
    "description": "Múltiplo de Compra\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "purchaseConversionRate",
    "type": "number",
    "required": false,
    "nullable": true,
    "description": "Taxa de Conversão de Compra\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "purchaseConversionRateUnit",
    "type": "string",
    "required": false,
    "nullable": true,
    "description": "Unidade de Conversão de Compra\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "transferConversionRate",
    "type": "number",
    "required": false,
    "nullable": true,
    "description": "Múltiplo de Transferência\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "transferConversionRateUnit",
    "type": "string",
    "required": false,
    "nullable": true,
    "description": "Unidade para o Múltiplo de Transferência\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "leadTimeType",
    "type": "string",
    "required": false,
    "description": "Tipo de Lead Time - \"c\": calculado; \"i\" - informado;\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "planningType",
    "type": "string",
    "required": false,
    "description": "Tipo de Planejamento - \"s\": make to stock; \"o\" - make to order;\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "expositionStock",
    "type": "number",
    "required": false,
    "nullable": true,
    "description": "Quantidade para estoque de exposição\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "expositionStockExpiration",
    "type": "string",
    "required": false,
    "nullable": true,
    "format": "YYYY-MM-DD",
    "description": "Data limite para considerar estoque de exposição\nPode ser omitido (Não altera o valor cadastrado)",
    "example": "2019-05-17"
   },
   {
    "name": "buyer",
    "type": "string",
    "required": false,
    "nullable": true,
    "description": "Login do responsável de compras\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "logisticsAnalyst",
    "type": "string",
    "required": false,
    "nullable": true,
    "description": "Login do analista logístico\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "blockPurchaseUntil",
    "type": "string",
    "required": false,
    "nullable": true,
    "format": "YYYY-MM-DD",
    "description": "Data para bloquear compras até\nPode ser omitido (Não altera o valor cadastrado)",
    "example": "2019-05-17"
   },
   {
    "name": "blockTransferUntil",
    "type": "string",
    "required": false,
    "nullable": true,
    "format": "YYYY-MM-DD",
    "description": "Data para bloquear transferências até\nPode ser omitido (Não altera o valor cadastrado)",
    "example": "2019-05-17"
   },
   {
    "name": "daysUsedToCalculateSafetyStock",
    "type": "number",
    "required": false,
    "nullable": true,
    "description": "Número de dias usado no cálculo do Estoque de Segurança\nPode ser omitido (Não altera o valor cadastrado)"
   }
  ]
 },
 "BranchItem": {
  "name": "BranchItem",
  "fields": [
   {
    "name": "branch",
    "type": "string",
    "required": true,
    "example": "1"
   },
   {
    "name": "item",
    "type": "string",
    "required": true,
    "example": "1"
   }
  ]
 },
 "BranchItemResponse": {
  "name": "BranchItemResponse",
  "fields": [
   {
    "name": "status",
    "type": "number",
    "required": true,
    "example": 200
   },
   {
    "name": "branchItem",
    "type": "object",
    "required": true,
    "ref": "BranchItem"
   }
  ]
 },
 "BrandDTO": {
  "name": "BrandDTO",
  "fields": [
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Identificador único da marca no seu sistema",
    "example": "1"
   },
   {
    "name": "name",
    "type": "string",
    "required": true,
    "description": "Nome da Marca (Descrição)",
    "example": "marca x"
   },
   {
    "name": "active",
    "type": "boolean",
    "required": true,
    "description": "Status (Ativo/Inativo)"
   }
  ]
 },
 "CustomerGroupDTO": {
  "name": "CustomerGroupDTO",
  "fields": [
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Identificador único do grupo de clientes no seu sistema",
    "example": "1"
   },
   {
    "name": "name",
    "type": "string",
    "required": true,
    "description": "Nome do grupo de cliente (Descrição)",
    "example": "PR"
   },
   {
    "name": "billingTarget",
    "type": "string",
    "required": false,
    "nullable": true,
    "description": "Alvo de cobrança do grupo de cliente, utilizado para indicar onde os movimentos serão agrupados para realizar a previsão de demanda\n(M - Filial do Movimento, I - Filial padrão do cadastro do produto, C - Filial padrão do cliente)",
    "example": "M"
   }
  ]
 },
 "CustomerDTO": {
  "name": "CustomerDTO",
  "fields": [
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Identificador único do cliente no seu sistema",
    "example": "1"
   },
   {
    "name": "name",
    "type": "string",
    "required": true,
    "description": "Nome do Cliente (Descrição)",
    "example": "cliente"
   },
   {
    "name": "customerGroup",
    "type": "string",
    "required": true,
    "description": "Identificador do grupo de cliente no seu sistema",
    "example": "3"
   },
   {
    "name": "city",
    "type": "string",
    "required": true,
    "description": "Cidade do cliente",
    "example": "SAO PAULO"
   },
   {
    "name": "state",
    "type": "string",
    "required": true,
    "maxLength": 2,
    "description": "Estado do cliente",
    "example": "SP"
   },
   {
    "name": "country",
    "type": "string",
    "required": true,
    "maxLength": 2,
    "description": "País do cliente",
    "example": "BR"
   },
   {
    "name": "billingBranch",
    "type": "string",
    "required": false,
    "nullable": true,
    "description": "Identificador único da filial de faturamento no seu sistema\nPode ser omitido (Não altera o valor cadastrado)",
    "example": "1"
   },
   {
    "name": "active",
    "type": "boolean",
    "required": true,
    "description": "Status (Ativo/Inativo)"
   }
  ]
 },
 "ItemDTO": {
  "name": "ItemDTO",
  "fields": [
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Identificador único do item no seu sistema",
    "example": "3123556"
   },
   {
    "name": "name",
    "type": "string",
    "required": true,
    "description": "Nome do item (Descrição)",
    "example": "item x"
   },
   {
    "name": "brand",
    "type": "string",
    "required": true,
    "description": "Identificador único da marca do item no seu sistema"
   },
   {
    "name": "itemGroup",
    "type": "string",
    "required": true,
    "description": "Identificador único do grupo do item no seu sistema"
   },
   {
    "name": "itemSecondaryGroup",
    "type": "string",
    "required": false,
    "nullable": true,
    "description": "Identificador único do grupo secundário do item no seu sistema\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "mainSupplier",
    "type": "string",
    "required": false,
    "nullable": true,
    "description": "Identificador único do Fornecedor Principal do item no seu sistema\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "measurementUnity",
    "type": "string",
    "required": true,
    "description": "Nome da unidade de medida (Descrição)\nDeve existir"
   },
   {
    "name": "supplierCode",
    "type": "string",
    "required": true,
    "description": "Código do fornecedor"
   },
   {
    "name": "minimumPurchase",
    "type": "number",
    "required": false,
    "nullable": true,
    "description": "Quantidade Mínima aceita pelo fornecedor (quantidade para pedido minimo)\nPode ser omitido (Não altera o valor cadastrado)\nCaso o valor enviado seja 0, será salvo como nulo"
   },
   {
    "name": "multiplePurchase",
    "type": "number",
    "required": false,
    "nullable": true,
    "description": "Quantidade Múltipla de compra no fornecedor\nPode ser omitido (Não altera o valor cadastrado)\nCaso o valor enviado seja 0, será salvo como nulo"
   },
   {
    "name": "packingQuantity",
    "type": "number",
    "required": false,
    "nullable": true,
    "description": "Quantidade de itens por embalagem para transferências\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "barcode",
    "type": "string",
    "required": true,
    "description": "Código de barras do produto\nEAN 13 ou DUM14 ou CODIGO DE BARRAS INTERNO DA EMPRESA"
   },
   {
    "name": "description",
    "type": "string",
    "required": true,
    "description": "Descrição\nAplicação do item/frota/tabela fipe/etc"
   },
   {
    "name": "createdAt",
    "type": "string",
    "required": false,
    "nullable": true,
    "format": "YYYY-MM-DD",
    "description": "Data de criação do item\nPode ser omitido (Não altera o valor cadastrado)",
    "example": "2019-05-17"
   },
   {
    "name": "makeToStock",
    "type": "boolean",
    "required": true,
    "description": "Tipo do item - se gera previsão de demanda (true) ou se é produto de encomenda (false)"
   },
   {
    "name": "weight",
    "type": "number",
    "required": false,
    "nullable": true,
    "description": "Peso unitário do item\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "length",
    "type": "number",
    "required": false,
    "nullable": true,
    "description": "Comprimento unitário do item\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "purchase",
    "type": "boolean",
    "required": true,
    "description": "Status de compra do item (Ativo/Inativo pra compras)\nDeprecated - Enviar como true"
   },
   {
    "name": "active",
    "type": "boolean",
    "required": true,
    "description": "Status do item (Ativo/Inativo)"
   }
  ]
 },
 "ItemCompositionDto": {
  "name": "ItemCompositionDto",
  "fields": [
   {
    "name": "item",
    "type": "string",
    "required": true,
    "description": "Identificador único do item no seu sistema"
   },
   {
    "name": "component",
    "type": "string",
    "required": true,
    "description": "Identificador único do componente(item) no seu sistema"
   },
   {
    "name": "quantity",
    "type": "number",
    "required": true,
    "description": "Quantidade da correlação"
   },
   {
    "name": "loss",
    "type": "number",
    "required": true,
    "description": "Percentual de perda (0 a 100)"
   },
   {
    "name": "manufacturingTime",
    "type": "number",
    "required": true,
    "description": "Tempo de fabricação"
   }
  ]
 },
 "ItemGroupDTO": {
  "name": "ItemGroupDTO",
  "fields": [
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Identificador único do grupo do item no seu sistema",
    "example": "1.1.1"
   },
   {
    "name": "name",
    "type": "string",
    "required": true,
    "description": "Nome do grupo de item (Descrição)",
    "example": "grupo x"
   },
   {
    "name": "father",
    "type": "string",
    "required": true,
    "description": "Identificador único do grupo pai (deve ter sido cadastrado previamente)",
    "example": "1.1"
   }
  ]
 },
 "ItemSecondaryGroupDTO": {
  "name": "ItemSecondaryGroupDTO",
  "fields": [
   {
    "name": "name",
    "type": "string",
    "required": true,
    "description": "Nome (Descrição)",
    "example": "grupo x"
   },
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Identificador único do grupo secundário de itens no seu sistema",
    "example": "1"
   }
  ]
 },
 "LoginDTO": {
  "name": "LoginDTO",
  "fields": [
   {
    "name": "organization",
    "type": "string",
    "required": true,
    "description": "Identificador único da empresa",
    "example": "empresa"
   },
   {
    "name": "token",
    "type": "string",
    "required": true,
    "description": "Token de acesso à API",
    "example": "004484a2-9d32-4a2d-80de-989d6ee0c72d"
   }
  ]
 },
 "RefreshTokenDTO": {
  "name": "RefreshTokenDTO",
  "fields": [
   {
    "name": "refreshToken",
    "type": "string",
    "required": true,
    "description": "Refresh token retornado no login",
    "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
  ]
 },
 "MovementDTO": {
  "name": "MovementDTO",
  "fields": [
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Identificador único da movimentação no seu sistema",
    "example": "123-C"
   },
   {
    "name": "branch",
    "type": "string",
    "required": true,
    "description": "Identificador único da filial no seu sistema",
    "example": "01"
   },
   {
    "name": "item",
    "type": "string",
    "required": true,
    "description": "Identificador único do item no seu sistema",
    "example": "34541982"
   },
   {
    "name": "customer",
    "type": "string",
    "required": false,
    "nullable": true,
    "description": "Identificador único do cliente no seu sistema",
    "example": "11"
   },
   {
    "name": "date",
    "type": "string",
    "required": true,
    "format": "YYYY-MM-DDT00:00:00.000Z",
    "description": "Data da movimentação",
    "example": "2019-05-17T00:00:00.000Z"
   },
   {
    "name": "quantity",
    "type": "number",
    "required": true,
    "description": "Quantidade da Venda (Caso seja valor fracionado enviar valor decimal separado por . (PONTO)",
    "example": 10
   },
   {
    "name": "saleValue",
    "type": "number",
    "required": true,
    "description": "Valor total de cada movimento do produto (Este campo será usado para cálculo da Margem de Contribuição",
    "example": 78.9
   },
   {
    "name": "participateInDemand",
    "type": "boolean",
    "required": true,
    "nullable": true,
    "description": "Indica se o movimento deve participar da previsão de demanda",
    "example": true
   },
   {
    "name": "document",
    "type": "string",
    "required": true,
    "description": "Identificador da nota no seu sistema",
    "example": "123"
   },
   {
    "name": "returned",
    "type": "boolean",
    "required": true,
    "nullable": true,
    "description": "Indica se o movimento foi devolvido ou cancelado",
    "example": false
   }
  ]
 },
 "MovementResponse": {
  "name": "MovementResponse",
  "fields": [
   {
    "name": "status",
    "type": "number",
    "required": true,
    "description": "Código de status http para o processamento do registro",
    "example": 200
   },
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Código de referência do registro",
    "example": "1"
   },
   {
    "name": "message",
    "type": "string",
    "required": false,
    "example": "Item não existe."
   }
  ]
 },
 "MovementDeleteResponse": {
  "name": "MovementDeleteResponse",
  "fields": [
   {
    "name": "document",
    "type": "string",
    "required": true,
    "description": "Identificador da nota informado na requisição",
    "example": "10001"
   },
   {
    "name": "status",
    "type": "number",
    "required": true,
    "description": "Código de status http para o processamento do registro",
    "example": 200
   },
   {
    "name": "removed",
    "type": "array",
    "required": true,
    "items": "string",
    "description": "Identificadores únicos das movimentações removidas para este documento",
    "example": [
     "12321-A"
    ]
   }
  ]
 },
 "PaymentTermDTO": {
  "name": "PaymentTermDTO",
  "fields": [
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Identificador único do termo de pagamento no seu sistema",
    "example": "1"
   },
   {
    "name": "name",
    "type": "string",
    "required": true,
    "description": "Nome do termo de pagamento (Descrição)",
    "example": "term 1"
   }
  ]
 },
 "PrePurchaseItem": {
  "name": "PrePurchaseItem",
  "fields": [
   {
    "name": "code",
    "type": "string",
    "required": true,
    "example": "1"
   },
   {
    "name": "name",
    "type": "string",
    "required": true,
    "example": "item"
   },
   {
    "name": "unitOfMeasure",
    "type": "string",
    "required": true,
    "example": "UN"
   },
   {
    "name": "suggestedQuantity",
    "type": "number",
    "required": true,
    "example": 5
   },
   {
    "name": "quantity",
    "type": "number",
    "required": true,
    "example": 4
   },
   {
    "name": "itemValue",
    "type": "number",
    "required": true,
    "example": 30.5
   },
   {
    "name": "estimatedDeliveryDate",
    "type": "string",
    "required": true,
    "format": "date-time",
    "example": "2024-01-24"
   },
   {
    "name": "version",
    "type": "string",
    "required": true,
    "example": "1"
   },
   {
    "name": "purchaseConversionRateUnit",
    "type": "string",
    "required": true,
    "example": "CX"
   },
   {
    "name": "convertedQuantity",
    "type": "number",
    "required": true,
    "example": 20
   },
   {
    "name": "convertedOriginalQuantity",
    "type": "number",
    "required": true,
    "example": 20
   }
  ]
 },
 "PrePurchaseOrderDTO": {
  "name": "PrePurchaseOrderDTO",
  "fields": [
   {
    "name": "code",
    "type": "string",
    "required": true,
    "example": "1"
   },
   {
    "name": "branch",
    "type": "string",
    "required": true,
    "example": "1"
   },
   {
    "name": "name",
    "type": "string",
    "required": true,
    "example": "order 1"
   },
   {
    "name": "suggestionDate",
    "type": "string",
    "required": true,
    "format": "date-time",
    "example": "2024-01-01"
   },
   {
    "name": "estimatedDeliveryDate",
    "type": "string",
    "required": true,
    "format": "date-time",
    "example": "2024-01-01"
   },
   {
    "name": "supplier",
    "type": "string",
    "required": true,
    "example": "1"
   },
   {
    "name": "supplierName",
    "type": "string",
    "required": true,
    "example": "supplier"
   },
   {
    "name": "freight",
    "type": "string",
    "required": true,
    "example": "CIF"
   },
   {
    "name": "paymentTerm",
    "type": "string",
    "required": true,
    "example": "1"
   },
   {
    "name": "observations",
    "type": "string",
    "required": true,
    "example": "observation"
   },
   {
    "name": "createdAt",
    "type": "string",
    "required": true,
    "format": "date-time",
    "example": "2023-02-15T00:00:00.000Z"
   },
   {
    "name": "createdBy",
    "type": "string",
    "required": true,
    "example": "Usuário 1"
   },
   {
    "name": "totalValue",
    "type": "number",
    "required": true,
    "example": 300
   },
   {
    "name": "sapOrderType",
    "type": "string",
    "required": true,
    "description": "Código do tipo de ordem, para clientes SAP",
    "example": "001"
   },
   {
    "name": "sapOrderTypeName",
    "type": "string",
    "required": true,
    "description": "Nome do tipo de ordem, para clientes SAP",
    "example": "purchase order"
   },
   {
    "name": "itemCount",
    "type": "number",
    "required": true,
    "example": 3
   },
   {
    "name": "items",
    "type": "array",
    "required": true,
    "items": "PrePurchaseItem"
   }
  ]
 },
 "PrePurchaseOrderDoneDTO": {
  "name": "PrePurchaseOrderDoneDTO",
  "fields": [
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Identificador único da pré ordem",
    "example": "1"
   },
   {
    "name": "success",
    "type": "boolean",
    "required": true,
    "description": "Indica se a pré ordem foi finalizada com sucesso",
    "example": true
   },
   {
    "name": "errorMessage",
    "type": "string",
    "required": false,
    "description": "Texto da mensagem de erro",
    "example": "fornecedor indisponível"
   },
   {
    "name": "erpOrderCode",
    "type": "string",
    "required": false,
    "description": "Código do pedido criado no ERP. Só é gravado quando success é true; se não for enviado, o código já gravado é mantido",
    "example": "ASE1234"
   }
  ]
 },
 "PrePurchaseOrderDoneResponse": {
  "name": "PrePurchaseOrderDoneResponse",
  "fields": [
   {
    "name": "status",
    "type": "number",
    "required": true,
    "description": "Código de status http para o processamento do registro",
    "example": 200
   },
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Código de referência do registro",
    "example": "1"
   },
   {
    "name": "message",
    "type": "string",
    "required": false,
    "example": "Pré ordem de compra não encontrada"
   }
  ]
 },
 "PurchaseOrderDTO": {
  "name": "PurchaseOrderDTO",
  "fields": [
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Identificador único da ordem de compra no seu sistema",
    "example": "1"
   },
   {
    "name": "branch",
    "type": "string",
    "required": true,
    "description": "Identificador único da filial no seu sistema"
   },
   {
    "name": "item",
    "type": "string",
    "required": true,
    "description": "Identificador único do item no seu sistema"
   },
   {
    "name": "orderDate",
    "type": "string",
    "required": true,
    "format": "date-time",
    "description": "Data da ordem de compra"
   },
   {
    "name": "deliveryDate",
    "type": "string",
    "required": false,
    "nullable": true,
    "format": "date-time",
    "description": "Data de entrega da compra\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "requestedQuantity",
    "type": "number",
    "required": true,
    "description": "Quantidade solicitada na ordem de compra"
   },
   {
    "name": "deliveredQuantity",
    "type": "number",
    "required": true,
    "description": "Quantidade já recebida na ordem de compra"
   },
   {
    "name": "status",
    "type": "string",
    "required": true,
    "description": "Status da ordem de compra\nO = Open (aberta), C = Closed (cancelada, finalizada)"
   },
   {
    "name": "estimatedDeliveryDate",
    "type": "string",
    "required": false,
    "nullable": true,
    "description": "Data esimada de entrega da compra\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "purchaseValue",
    "type": "number",
    "required": false,
    "nullable": true,
    "description": "Valor da compra\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "purchaseType",
    "type": "string",
    "required": false,
    "nullable": true,
    "description": "Tipo da compra\nC = Confirmed (confirmada), P = Planned (planejada)\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "supplier",
    "type": "string",
    "required": false,
    "nullable": true,
    "description": "Identificador único do fornecedor no seu sistema\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "unit",
    "type": "string",
    "required": false,
    "nullable": true,
    "description": "Unidade usada na compra\nSe for a mesma cadastrada como Parâmetro Filial Item, irá multiplicar a quantidade dentro da ordem\nPode ser omitido (Não altera o valor cadastrado)"
   }
  ]
 },
 "PurchaseOrderMutationResponse": {
  "name": "PurchaseOrderMutationResponse",
  "fields": [
   {
    "name": "status",
    "type": "number",
    "required": true,
    "description": "Código de status http para o processamento do registro",
    "example": 200
   },
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Código de referência do registro",
    "example": "1"
   },
   {
    "name": "message",
    "type": "string",
    "required": false,
    "example": "Item não existe."
   }
  ]
 },
 "PurchaseOrderFilter": {
  "name": "PurchaseOrderFilter",
  "fields": [
   {
    "name": "code",
    "type": "object",
    "required": true
   }
  ]
 },
 "PurchaseOrderResponse": {
  "name": "PurchaseOrderResponse",
  "fields": [
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Identificador único da ordem de compra no seu sistema",
    "example": "1"
   },
   {
    "name": "orderDate",
    "type": "string",
    "required": true,
    "nullable": true,
    "format": "date-time",
    "example": "2023-12-12"
   },
   {
    "name": "deliveryDate",
    "type": "string",
    "required": true,
    "nullable": true,
    "format": "date-time",
    "example": "2023-12-12"
   },
   {
    "name": "requestedQuantity",
    "type": "number",
    "required": true,
    "nullable": true,
    "example": 10
   },
   {
    "name": "deliveredQuantity",
    "type": "number",
    "required": true,
    "nullable": true,
    "example": 10
   },
   {
    "name": "status",
    "type": "string",
    "required": true,
    "example": "C"
   },
   {
    "name": "estimatedDeliveryDate",
    "type": "string",
    "required": true,
    "nullable": true,
    "format": "date-time",
    "example": "2023-12-12"
   },
   {
    "name": "purchaseValue",
    "type": "number",
    "required": true,
    "nullable": true,
    "example": 100
   },
   {
    "name": "purchaseType",
    "type": "string",
    "required": true,
    "nullable": true,
    "example": "C"
   },
   {
    "name": "branch",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Identificador único da filial no seu sistema",
    "example": "1"
   },
   {
    "name": "item",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Identificador único do item no seu sistema",
    "example": "1"
   },
   {
    "name": "supplier",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Identificador único do fornecedor no seu sistema",
    "example": "2"
   }
  ]
 },
 "StockDTO": {
  "name": "StockDTO",
  "fields": [
   {
    "name": "branch",
    "type": "string",
    "required": true,
    "description": "Identificador único da filial no seu sistema"
   },
   {
    "name": "item",
    "type": "string",
    "required": true,
    "description": "Identificador único do item no seu sistema"
   },
   {
    "name": "date",
    "type": "string",
    "required": true,
    "format": "date-time",
    "description": "Data e hora da última atualização do estoque na base do sistema de gestão"
   },
   {
    "name": "quantity",
    "type": "number",
    "required": true,
    "description": "Quantidade em estoque (Caso seja valor fracionado enviar valor decimal separado por . (PONTO)"
   },
   {
    "name": "location",
    "type": "string",
    "required": true,
    "description": "Caso o sistema de gestão tenha uma localização preferencial do item naquele depósito pode ser enviado para facilitar a separação"
   },
   {
    "name": "averageCost",
    "type": "number",
    "required": true,
    "description": "Custo médio"
   },
   {
    "name": "replenishmentValue",
    "type": "number",
    "required": true,
    "description": "Custo de reposição\nValor da última compra do item naquele local\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "purchaseValue",
    "type": "number",
    "required": true,
    "description": "Valor de compra\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "averageSaleValue",
    "type": "number",
    "required": false,
    "description": "Valor médio de compra\nPode ser omitido (Não altera o valor cadastrado)"
   }
  ]
 },
 "StockUpdateResultCode": {
  "name": "StockUpdateResultCode",
  "fields": [
   {
    "name": "item",
    "type": "string",
    "required": true,
    "description": "Identificador único do item no seu sistema",
    "example": "23104"
   },
   {
    "name": "branch",
    "type": "string",
    "required": true,
    "description": "Identificador único da filial no seu sistema",
    "example": "1"
   },
   {
    "name": "stockType",
    "type": "string",
    "required": true,
    "description": "Tipo de estoque informado",
    "example": "common"
   }
  ]
 },
 "StockUpdateResponse": {
  "name": "StockUpdateResponse",
  "fields": [
   {
    "name": "status",
    "type": "number",
    "required": true,
    "description": "Código de status http para o processamento do registro",
    "example": 200
   },
   {
    "name": "code",
    "type": "object",
    "required": true,
    "description": "Referência do registro do estoque processado"
   },
   {
    "name": "message",
    "type": "string",
    "required": false,
    "example": "Item não existe."
   }
  ]
 },
 "SubstituteDTO": {
  "name": "SubstituteDTO",
  "fields": [
   {
    "name": "item",
    "type": "string",
    "required": true,
    "description": "Identificador único do item no seu sistema",
    "example": "1"
   },
   {
    "name": "substitutes",
    "type": "array",
    "required": true,
    "items": "string",
    "description": "Identificadores dos substitutos do item",
    "example": [
     "2",
     "3",
     "4"
    ]
   }
  ]
 },
 "SubstituteResponse": {
  "name": "SubstituteResponse",
  "fields": [
   {
    "name": "status",
    "type": "number",
    "required": true,
    "description": "Código de status http para o processamento do registro",
    "example": 200
   },
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Código de referência do registro",
    "example": "1"
   },
   {
    "name": "message",
    "type": "string",
    "required": false,
    "example": "Item não existe."
   }
  ]
 },
 "PreviousVersionDTO": {
  "name": "PreviousVersionDTO",
  "fields": [
   {
    "name": "child",
    "type": "string",
    "required": true,
    "description": "Identificador único do item novo (filho) no seu sistema",
    "example": "20"
   },
   {
    "name": "parent",
    "type": "string",
    "required": true,
    "description": "Identificador único do item antigo (pai) no seu sistema",
    "example": "10"
   },
   {
    "name": "startDate",
    "type": "string",
    "required": false,
    "nullable": true,
    "format": "YYYY-MM-DD",
    "description": "Data de início da cópia\nPode ser omitida (não altera o valor gravado) ou enviada como null (apaga o valor gravado)",
    "example": "2026-01-01"
   },
   {
    "name": "endDate",
    "type": "string",
    "required": false,
    "nullable": true,
    "format": "YYYY-MM-DD",
    "description": "Data de fim da cópia, posterior à data de início\nPode ser omitida (não altera o valor gravado) ou enviada como null (apaga o valor gravado)",
    "example": "2026-12-31"
   },
   {
    "name": "relationPercent",
    "type": "number",
    "required": true,
    "minimum": 1,
    "maximum": 999,
    "description": "Percentual da venda do item pai copiado para o filho, de 1 a 999, com casas decimais",
    "example": 100
   }
  ]
 },
 "PreviousVersionResponse": {
  "name": "PreviousVersionResponse",
  "fields": [
   {
    "name": "status",
    "type": "number",
    "required": true,
    "description": "Código de status http para o processamento do registro",
    "example": 200
   },
   {
    "name": "child",
    "type": "string",
    "required": false,
    "description": "Item filho do registro (ausente na resposta a uma lista vazia)",
    "example": "20"
   },
   {
    "name": "parent",
    "type": "string",
    "required": false,
    "description": "Item pai do registro (ausente na resposta a uma lista vazia)",
    "example": "10"
   },
   {
    "name": "message",
    "type": "string",
    "required": false,
    "example": "Item pai não existe."
   }
  ]
 },
 "SupplierDTO": {
  "name": "SupplierDTO",
  "fields": [
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Identificador úninco do fornecedor no seu sistema",
    "example": "1"
   },
   {
    "name": "name",
    "type": "string",
    "required": true,
    "description": "Nome do fornecedor (Descrição)",
    "example": "fornecedor z"
   },
   {
    "name": "document",
    "type": "string",
    "required": true,
    "description": "CPNJ do fornecedor",
    "example": "81029941000150"
   },
   {
    "name": "email",
    "type": "string",
    "required": false,
    "description": "E-mail do fornecedor\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "freight",
    "type": "string",
    "required": true,
    "description": "Tipo de frete padrão\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "paymentTerm",
    "type": "string",
    "required": true,
    "description": "Código do Termo de pagamento padrão\nPode ser omitido (Não altera o valor cadastrado)"
   },
   {
    "name": "active",
    "type": "boolean",
    "required": false,
    "description": "Status (Ativo/Inativo)\nPode ser omitido (Não altera o valor cadastrado)"
   }
  ]
 },
 "SupplierResponse": {
  "name": "SupplierResponse",
  "fields": [
   {
    "name": "status",
    "type": "number",
    "required": true,
    "description": "Código de status http para o processamento do registro",
    "example": 200
   },
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Código de referência do registro",
    "example": "1"
   },
   {
    "name": "message",
    "type": "string",
    "required": false,
    "example": "O termo de pagamento não existe."
   }
  ]
 },
 "SupplierBrandDTO": {
  "name": "SupplierBrandDTO",
  "fields": [
   {
    "name": "supplier",
    "type": "string",
    "required": true,
    "description": "Identificador único do fornecedor no seu sistema"
   },
   {
    "name": "brand",
    "type": "string",
    "required": true,
    "description": "Identificador único da marca no seu sistema"
   }
  ]
 },
 "SupplierBrandResponse": {
  "name": "SupplierBrandResponse",
  "fields": [
   {
    "name": "status",
    "type": "number",
    "required": true,
    "description": "Código de status http para o processamento do registro",
    "example": 200
   },
   {
    "name": "message",
    "type": "string",
    "required": false,
    "example": "Fornecedor não existe."
   },
   {
    "name": "supplier",
    "type": "string",
    "required": false,
    "description": "Identificador único do fornecedor no seu sistema",
    "example": "1"
   },
   {
    "name": "brand",
    "type": "string",
    "required": false,
    "description": "Identificador único da marca no seu sistema",
    "example": "1"
   }
  ]
 },
 "TransferDTO": {
  "name": "TransferDTO",
  "fields": [
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Identificador único da transferência no seu sistema",
    "example": "1"
   },
   {
    "name": "sourceBranch",
    "type": "string",
    "required": false,
    "nullable": true,
    "description": "Identificador único da filial no seu sistema que identifica a filial de origem da transferência\nPode informar a filial de origem no caso de transferência entre filial, ou deixar em branco no caso de uma ordem vindo do fornecedor\nPode ser omitido (Não altera o valor cadastrado)",
    "example": "1"
   },
   {
    "name": "destinationBranch",
    "type": "string",
    "required": true,
    "description": "Identificador único da filial no seu sistema que identifica a filial de destino da transferência",
    "example": "1"
   },
   {
    "name": "item",
    "type": "string",
    "required": true,
    "description": "Identificador único do item no seu sistema",
    "example": "1"
   },
   {
    "name": "transferDate",
    "type": "string",
    "required": true,
    "format": "YYYY-MM-DD",
    "description": "Data e hora da emissão do pedido no sistema de gestão",
    "example": "1999-12-31"
   },
   {
    "name": "estimatedDeliveryDate",
    "type": "string",
    "required": false,
    "nullable": true,
    "format": "YYYY-MM-DD",
    "description": "Data estimada de entrega\nPode ser omitido (Não altera o valor cadastrado)",
    "example": "2000-01-01"
   },
   {
    "name": "deliveryDate",
    "type": "string",
    "required": false,
    "nullable": true,
    "format": "YYYY-MM-DD",
    "description": "Data de entrega\nPode ser omitido (Não altera o valor cadastrado)",
    "example": "2000-01-01"
   },
   {
    "name": "requestedQuantity",
    "type": "number",
    "required": true,
    "description": "Quantidade solicitada no pedido de transferência",
    "example": 10
   },
   {
    "name": "deliveredQuantity",
    "type": "number",
    "required": true,
    "description": "Quantidade já recebida no pedido de transferência",
    "example": 10
   },
   {
    "name": "status",
    "type": "string",
    "required": true,
    "description": "Status da transferência\nO = Open (aberta), C = Closed (cancelada, finalizada)",
    "example": "C"
   }
  ]
 },
 "TransferResponse": {
  "name": "TransferResponse",
  "fields": [
   {
    "name": "status",
    "type": "number",
    "required": true,
    "description": "Código de status http para o processamento do registro",
    "example": 200
   },
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Código de referência do registro",
    "example": "1"
   },
   {
    "name": "message",
    "type": "string",
    "required": false,
    "example": "Item não existe."
   }
  ]
 },
 "TransferSuggestionDTO": {
  "name": "TransferSuggestionDTO",
  "fields": [
   {
    "name": "id",
    "type": "number",
    "required": true,
    "example": 1
   },
   {
    "name": "sourceBranch",
    "type": "string",
    "required": true,
    "example": "10"
   },
   {
    "name": "destinationBranch",
    "type": "string",
    "required": true,
    "example": "20"
   },
   {
    "name": "item",
    "type": "string",
    "required": true,
    "example": "1088237719"
   },
   {
    "name": "itemName",
    "type": "string",
    "required": true,
    "example": "item"
   },
   {
    "name": "unitOfMeasure",
    "type": "string",
    "required": true,
    "example": "UN"
   },
   {
    "name": "date",
    "type": "string",
    "required": true,
    "format": "date-time",
    "example": "2025-05-30T03:00:00.000Z"
   },
   {
    "name": "estimatedDeliveryDate",
    "type": "string",
    "required": true,
    "format": "date-time",
    "example": "2025-05-30T03:00:00.000Z"
   },
   {
    "name": "quantity",
    "type": "number",
    "required": true,
    "example": 200
   },
   {
    "name": "transferConversionRateUnit",
    "type": "string",
    "required": true,
    "example": "PL"
   },
   {
    "name": "convertedQuantity",
    "type": "number",
    "required": true,
    "example": 2
   },
   {
    "name": "averageCost",
    "type": "number",
    "required": true,
    "example": 25.62
   },
   {
    "name": "type",
    "type": "string",
    "required": true,
    "example": "s"
   },
   {
    "name": "integrationBatch",
    "type": "number",
    "required": true,
    "example": 28
   },
   {
    "name": "createdAt",
    "type": "string",
    "required": true,
    "format": "date-time",
    "example": "2025-05-22T17:14:52.634Z"
   },
   {
    "name": "createdByUsername",
    "type": "string",
    "required": true,
    "example": "cristiano.conte"
   },
   {
    "name": "createdByName",
    "type": "string",
    "required": true,
    "example": "Cristiano Conte"
   },
   {
    "name": "originalDestinationBranch",
    "type": "string",
    "required": true,
    "example": "22"
   }
  ]
 },
 "TransferSuggestionDoneDTO": {
  "name": "TransferSuggestionDoneDTO",
  "fields": [
   {
    "name": "code",
    "type": "number",
    "required": true,
    "description": "Identificador único da sugestão de transferência",
    "example": "1"
   },
   {
    "name": "success",
    "type": "boolean",
    "required": true,
    "description": "Indica se a sugestão de transferência foi finalizada com sucesso",
    "example": true
   },
   {
    "name": "errorMessage",
    "type": "string",
    "required": false,
    "description": "Texto da mensagem de erro",
    "example": "transporte indisponível"
   }
  ]
 },
 "TransferSuggestionDoneResponse": {
  "name": "TransferSuggestionDoneResponse",
  "fields": [
   {
    "name": "status",
    "type": "number",
    "required": true,
    "description": "Código de status http para o processamento do registro",
    "example": 200
   },
   {
    "name": "code",
    "type": "number",
    "required": true,
    "description": "Código de referência do registro",
    "example": 1
   },
   {
    "name": "message",
    "type": "string",
    "required": false,
    "example": "Sugestão não encontrada"
   }
  ]
 },
 "FutureMovementDTO": {
  "name": "FutureMovementDTO",
  "fields": [
   {
    "name": "code",
    "type": "string",
    "required": true,
    "description": "Identificador único da venda firme no seu sistema",
    "example": "1"
   },
   {
    "name": "branch",
    "type": "string",
    "required": true,
    "description": "Identificador único da filial no seu sistema"
   },
   {
    "name": "item",
    "type": "string",
    "required": true,
    "description": "Identificador único do item no seu sistema"
   },
   {
    "name": "orderDate",
    "type": "string",
    "required": true,
    "format": "date-time",
    "description": "Data da venda firme"
   },
   {
    "name": "quantity",
    "type": "number",
    "required": true,
    "description": "Quantidade total solicitada na venda firme"
   },
   {
    "name": "deliveredQuantity",
    "type": "number",
    "required": false,
    "description": "Quantidade da venda firme já entregue\nOpcional. Quando ausente, vale zero.\nA demanda considerada pelo sistema é o saldo: quantidade total menos entregue.",
    "example": 0
   },
   {
    "name": "status",
    "type": "string",
    "required": true,
    "description": "Status da venda firme\nO = Open (aberta), C = Closed (cancelada, finalizada)"
   }
  ]
 },
 "IdealStockDTO": {
  "name": "IdealStockDTO",
  "fields": [
   {
    "name": "brands",
    "type": "array",
    "required": false,
    "items": "string"
   },
   {
    "name": "items",
    "type": "array",
    "required": false,
    "items": "string"
   },
   {
    "name": "branches",
    "type": "array",
    "required": false,
    "items": "string"
   },
   {
    "name": "onlyWithChanges",
    "type": "boolean",
    "required": false
   }
  ]
 },
 "IdealStockResponse": {
  "name": "IdealStockResponse",
  "fields": [
   {
    "name": "branchCode",
    "type": "string",
    "required": true,
    "description": "Identificador único da filial no seu sistema",
    "example": "1"
   },
   {
    "name": "branchName",
    "type": "string",
    "required": true,
    "description": "Nome da filial",
    "example": "Filial 1"
   },
   {
    "name": "brandCode",
    "type": "string",
    "required": true,
    "description": "Identificador único da marca no seu sistema",
    "example": "1"
   },
   {
    "name": "brandName",
    "type": "string",
    "required": true,
    "description": "Nome da marca",
    "example": "Marca 1"
   },
   {
    "name": "itemCode",
    "type": "string",
    "required": true,
    "description": "Identificador único do produto no seu sistema",
    "example": "1"
   },
   {
    "name": "itemName",
    "type": "string",
    "required": true,
    "description": "Nome do produto",
    "example": "Item 1"
   },
   {
    "name": "lowerIdeal",
    "type": "number",
    "required": true,
    "description": "Ideal Inferior",
    "example": 10
   },
   {
    "name": "upperIdeal",
    "type": "number",
    "required": true,
    "description": "Ideal Superior",
    "example": 20
   },
   {
    "name": "resupplyTriggerIdeal",
    "type": "number",
    "required": true,
    "description": "Quantidade em estoque para disparar o processo de ressuprimento",
    "example": 8
   },
   {
    "name": "coverage",
    "type": "number",
    "required": true,
    "description": "Estoque total (físico + trânsitos em aberto para a filial) sobre o ideal inferior. 1 quando o ideal inferior é zero. A lista vem ordenada por ele, do menor para o maior.",
    "example": 0.33
   }
  ]
 },
 "ItemCustomAttributeOptionDTO": {
  "name": "ItemCustomAttributeOptionDTO",
  "fields": [
   {
    "name": "attributeName",
    "type": "string",
    "required": true,
    "description": "Nome do atributo",
    "example": "Tamanho do Item"
   },
   {
    "name": "optionCode",
    "type": "string",
    "required": true,
    "description": "Código da opção",
    "example": "1001"
   },
   {
    "name": "optionValue",
    "type": "string",
    "required": true,
    "description": "Valor/Nome da opção",
    "example": "Grande"
   },
   {
    "name": "active",
    "type": "boolean",
    "required": true,
    "description": "Status da opção (Ativo/Inativo)",
    "example": true
   }
  ]
 },
 "ItemCustomAttributeValueDTO": {
  "name": "ItemCustomAttributeValueDTO",
  "fields": [
   {
    "name": "item",
    "type": "string",
    "required": true,
    "description": "Identificador único do item no seu sistema",
    "example": "34541982"
   },
   {
    "name": "attributeName",
    "type": "string",
    "required": true,
    "description": "Nome do atributo",
    "example": "Tamanho do Item"
   },
   {
    "name": "optionCode",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Código da opção",
    "example": "1001"
   }
  ]
 },
 "DailyDataDfuFilter": {
  "name": "DailyDataDfuFilter",
  "fields": [
   {
    "name": "date",
    "type": "string",
    "required": true,
    "format": "YYYY-MM-DD",
    "description": "Data do processamento",
    "example": "2019-05-17"
   }
  ]
 },
 "DailyDataDfuResponse": {
  "name": "DailyDataDfuResponse",
  "fields": [
   {
    "name": "date",
    "type": "string",
    "required": true,
    "description": "Data do processamento",
    "example": "2019-05-17"
   },
   {
    "name": "itemCode",
    "type": "string",
    "required": true,
    "description": "Identificador único do item no seu sistema",
    "example": "13123215"
   },
   {
    "name": "itemName",
    "type": "string",
    "required": true,
    "example": "Item Exemplo"
   },
   {
    "name": "brandCode",
    "type": "string",
    "required": true,
    "description": "Identificador único da marca no seu sistema",
    "example": "32"
   },
   {
    "name": "brandName",
    "type": "string",
    "required": true,
    "example": "Marca Exemplo"
   },
   {
    "name": "itemGroupCode",
    "type": "string",
    "required": true,
    "description": "Identificador único do grupo de item no seu sistema",
    "example": "34"
   },
   {
    "name": "itemGroupName",
    "type": "string",
    "required": true,
    "example": "Grupo Exemplo"
   },
   {
    "name": "itemSecondaryGroupCode",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Identificador único do subgrupo de item no seu sistema",
    "example": "12"
   },
   {
    "name": "itemSecondaryGroupName",
    "type": "string",
    "required": true,
    "nullable": true,
    "example": "Subgrupo Exemplo"
   },
   {
    "name": "itemLifePhase",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Fase de vida do item",
    "example": "Maduro"
   },
   {
    "name": "destinationBranchCode",
    "type": "string",
    "required": true,
    "description": "Identificador único da filial de destino no seu sistema",
    "example": "01"
   },
   {
    "name": "destinationBranchName",
    "type": "string",
    "required": true,
    "example": "Filial Exemplo"
   },
   {
    "name": "destinationABCCurveItemBranch",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Curva ABC do item na filial de destino",
    "example": "A"
   },
   {
    "name": "destinationABCCurveItem",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Curva ABC do item",
    "example": "A"
   },
   {
    "name": "destinationAverageCost",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Custo médio na filial de destino",
    "example": 12.5
   },
   {
    "name": "destinationAvgSalesLast12Months",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Média de vendas dos últimos 12 meses na filial de destino",
    "example": 120
   },
   {
    "name": "destinationAvgSalesLast3Months",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Média de vendas dos últimos 3 meses na filial de destino",
    "example": 30
   },
   {
    "name": "destinationAvgSalesLast6Months",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Média de vendas dos últimos 6 meses na filial de destino",
    "example": 60
   },
   {
    "name": "destinationBlockPurchase",
    "type": "boolean",
    "required": true,
    "nullable": true,
    "description": "Indica se a compra está bloqueada na filial de destino",
    "example": false
   },
   {
    "name": "destinationBlockTransfer",
    "type": "boolean",
    "required": true,
    "nullable": true,
    "description": "Indica se a transferência está bloqueada na filial de destino",
    "example": false
   },
   {
    "name": "destinationBuyerName",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Comprador responsável na filial de destino",
    "example": "Comprador Exemplo"
   },
   {
    "name": "destinationCalendarName",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Calendário utilizado na filial de destino",
    "example": "Calendário Padrão"
   },
   {
    "name": "destinationDaysOfCoverageWithTransfers",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Dias de cobertura considerando transferências, na filial de destino",
    "example": 15
   },
   {
    "name": "destinationDaysWithoutSales",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Dias sem venda na filial de destino",
    "example": 5
   },
   {
    "name": "destinationBlockPurchaseUntil",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Data até quando a compra está bloqueada na filial de destino",
    "example": "2024-01-01"
   },
   {
    "name": "destinationDaysOfCoverage",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Dias de cobertura na filial de destino",
    "example": 10
   },
   {
    "name": "destinationPlanningType",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Tipo de planejamento na filial de destino",
    "example": "MIN_MAX"
   },
   {
    "name": "destinationSecurityStock",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Estoque de segurança na filial de destino",
    "example": 20
   },
   {
    "name": "destinationStrategicStock",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Estoque estratégico na filial de destino",
    "example": 5
   },
   {
    "name": "destinationExpositionStock",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Estoque de exposição na filial de destino",
    "example": 3
   },
   {
    "name": "destinationExpositionStockExpirationDate",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Data de validade do estoque de exposição na filial de destino",
    "example": "2024-06-01"
   },
   {
    "name": "destinationIdealDays",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Dias ideais de estoque na filial de destino",
    "example": 30
   },
   {
    "name": "destinationMinimumPurchase",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Quantidade mínima de compra na filial de destino",
    "example": 1
   },
   {
    "name": "destinationMultiplePurchase",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Múltiplo de compra na filial de destino",
    "example": 1
   },
   {
    "name": "destinationSafetyStockMinimumPercentReserved",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Percentual mínimo reservado de estoque de segurança na filial de destino",
    "example": 0.1
   },
   {
    "name": "destinationServiceLevel",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Nível de serviço na filial de destino",
    "example": 0.95
   },
   {
    "name": "destinationTotalSalesCurrentMonth",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Total de vendas do mês corrente na filial de destino",
    "example": 100
   },
   {
    "name": "destinationTotalSalesOneMonthAgo",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Total de vendas de um mês atrás na filial de destino",
    "example": 90
   },
   {
    "name": "destinationTotalSalesThreeMonthsAgo",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Total de vendas de três meses atrás na filial de destino",
    "example": 80
   },
   {
    "name": "destinationTotalSalesTwoMonthsAgo",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Total de vendas de dois meses atrás na filial de destino",
    "example": 85
   },
   {
    "name": "destinationOpenPurchaseOrderQuantity",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Quantidade em aberto de pedidos de compra na filial de destino",
    "example": 50
   },
   {
    "name": "destinationStockLevel",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Classificação do nível de estoque na filial de destino",
    "example": "NORMAL"
   },
   {
    "name": "destinationStockQuantity",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Quantidade em estoque na filial de destino",
    "example": 200
   },
   {
    "name": "destinationOpenTransferQuantity",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Quantidade em aberto de transferências na filial de destino",
    "example": 20
   },
   {
    "name": "destinationLogisticsAnalyst",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Analista de logística responsável pela filial de destino",
    "example": "Analista Exemplo"
   },
   {
    "name": "destinationPurchaseConversionRate",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Fator de conversão de compra na filial de destino",
    "example": 1
   },
   {
    "name": "destinationTransferConversionRate",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Fator de conversão de transferência na filial de destino",
    "example": 1
   },
   {
    "name": "destinationLeadTime",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Lead time na filial de destino",
    "example": 7
   },
   {
    "name": "supplierCode",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Identificador único do fornecedor no seu sistema, quando a origem é um fornecedor",
    "example": "9000"
   },
   {
    "name": "supplierName",
    "type": "string",
    "required": true,
    "nullable": true,
    "example": "Fornecedor Exemplo"
   },
   {
    "name": "sourceBranchCode",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Identificador único da filial de origem no seu sistema. Nulo quando a origem é um fornecedor",
    "example": "02"
   },
   {
    "name": "sourceBranchName",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Nulo quando a origem é um fornecedor",
    "example": "Filial Origem Exemplo"
   },
   {
    "name": "sourceDaysOfCoverage",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Dias de cobertura na origem",
    "example": 12
   },
   {
    "name": "sourceExpositionStock",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Estoque de exposição na origem",
    "example": 2
   },
   {
    "name": "sourceExpositionStockExpirationDate",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Data de validade do estoque de exposição na origem",
    "example": "2024-06-01"
   },
   {
    "name": "sourceIdealDays",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Dias ideais de estoque na origem",
    "example": 25
   },
   {
    "name": "sourceMinimumPurchase",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Quantidade mínima de compra na origem",
    "example": 1
   },
   {
    "name": "sourcePlanningType",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Tipo de planejamento na origem",
    "example": "MIN_MAX"
   },
   {
    "name": "sourceSafetyStockMinimumPercentReserved",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Percentual mínimo reservado de estoque de segurança na origem",
    "example": 0.1
   },
   {
    "name": "sourceStockQuantity",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Quantidade em estoque na origem",
    "example": 150
   },
   {
    "name": "sourceStrategicStock",
    "type": "number",
    "required": true,
    "nullable": true,
    "description": "Estoque estratégico na origem",
    "example": 5
   },
   {
    "name": "sourceBlockPurchaseUntil",
    "type": "string",
    "required": true,
    "nullable": true,
    "description": "Data até quando a compra está bloqueada na origem",
    "example": "2024-01-01"
   }
  ]
 },
 "MonthlyForecastFilterDto": {
  "name": "MonthlyForecastFilterDto",
  "fields": [
   {
    "name": "branch",
    "type": "string",
    "required": true
   },
   {
    "name": "item",
    "type": "string",
    "required": true
   },
   {
    "name": "brand",
    "type": "string",
    "required": true
   },
   {
    "name": "itemGroup",
    "type": "string",
    "required": true
   },
   {
    "name": "mainSupplier",
    "type": "string",
    "required": true
   }
  ]
 },
 "MonthlyForecastDTO": {
  "name": "MonthlyForecastDTO",
  "fields": [
   {
    "name": "item",
    "type": "string",
    "required": true,
    "example": "13123215"
   },
   {
    "name": "createdAt",
    "type": "string",
    "required": true,
    "format": "date-time",
    "description": "Dia do cálculo",
    "example": "2024-01-01"
   },
   {
    "name": "t0",
    "type": "number",
    "required": true,
    "description": "Previsão mês corrente do Dia do Cálculo"
   },
   {
    "name": "t1",
    "type": "number",
    "required": true,
    "description": "Previsão mês (corrente do Dia do Cálculo) + 1"
   },
   {
    "name": "t2",
    "type": "number",
    "required": true,
    "description": "Previsão mês (corrente do Dia do Cálculo) + 2"
   },
   {
    "name": "t3",
    "type": "number",
    "required": true,
    "description": "Previsão mês (corrente do Dia do Cálculo) + 3"
   },
   {
    "name": "t4",
    "type": "number",
    "required": true,
    "description": "Previsão mês (corrente do Dia do Cálculo) + 4"
   },
   {
    "name": "t5",
    "type": "number",
    "required": true,
    "description": "Previsão mês (corrente do Dia do Cálculo) + 5"
   },
   {
    "name": "t6",
    "type": "number",
    "required": true,
    "description": "Previsão mês (corrente do Dia do Cálculo) + 6"
   },
   {
    "name": "t7",
    "type": "number",
    "required": true,
    "description": "Previsão mês (corrente do Dia do Cálculo) + 7"
   },
   {
    "name": "t8",
    "type": "number",
    "required": true,
    "description": "Previsão mês (corrente do Dia do Cálculo) + 8"
   },
   {
    "name": "t9",
    "type": "number",
    "required": true,
    "description": "Previsão mês (corrente do Dia do Cálculo) + 9"
   },
   {
    "name": "t10",
    "type": "number",
    "required": true,
    "description": "Previsão mês (corrente do Dia do Cálculo) + 10"
   },
   {
    "name": "t11",
    "type": "number",
    "required": true,
    "description": "Previsão mês (corrente do Dia do Cálculo) + 11"
   },
   {
    "name": "t12",
    "type": "number",
    "required": true,
    "description": "Previsão mês (corrente do Dia do Cálculo) + 12"
   }
  ]
 }
};

export const lagomOperations: LagomOperation[] = [
 {
  "id": "put-branch",
  "method": "PUT",
  "path": "/branch",
  "tag": "branch",
  "kind": "cadastro",
  "mutating": true,
  "summary": "Filial",
  "description": "Recebe uma lista de uma ou mais filiais\nInsere ou atualiza filiais",
  "body": {
   "array": true,
   "schema": "BranchDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "OkResponse"
  }
 },
 {
  "id": "put-branch-group",
  "method": "PUT",
  "path": "/branch-group",
  "tag": "branch-group",
  "kind": "cadastro",
  "mutating": true,
  "summary": "Grupo de Filial",
  "description": "Recebe uma lista de um ou mais grupos de filial\nInsere ou atualiza grupos de filial",
  "body": {
   "array": true,
   "schema": "BranchGroupDTO"
  },
  "response": {
   "status": 200,
   "array": false,
   "schema": "OkResponse"
  }
 },
 {
  "id": "put-branch-item-parameter",
  "method": "PUT",
  "path": "/branch-item-parameter",
  "tag": "branch-item-parameter",
  "kind": "cadastro",
  "mutating": true,
  "summary": "Parâmetro Filial Item",
  "description": "Recebe uma lista de um ou mais parâmetros para uma filial e um item\nInsere ou atualiza parâmetros de item",
  "body": {
   "array": true,
   "schema": "BranchItemParameterDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "BranchItemResponse"
  }
 },
 {
  "id": "post-branch-item-parameter-get",
  "method": "POST",
  "path": "/branch-item-parameter/get",
  "tag": "branch-item-parameter",
  "kind": "consulta",
  "mutating": false,
  "summary": "Consulta Parâmetro Filial Item",
  "description": "Retorna uma lista de parâmetros para uma filial e um item",
  "body": {
   "array": false,
   "fields": [
    {
     "name": "branch",
     "type": "array",
     "required": false,
     "items": "string",
     "description": "Lista de códigos de filiais",
     "example": [
      "1"
     ]
    },
    {
     "name": "item",
     "type": "array",
     "required": false,
     "items": "string",
     "description": "Lista de códigos de itens",
     "example": [
      "1"
     ]
    }
   ]
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "BranchItemParameterDTO"
  }
 },
 {
  "id": "put-brand",
  "method": "PUT",
  "path": "/brand",
  "tag": "brand",
  "kind": "cadastro",
  "mutating": true,
  "summary": "Marca",
  "description": "Recebe uma lista uma ou mais marcas\nInsere ou atualiza marcas",
  "body": {
   "array": true,
   "schema": "BrandDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "OkResponse"
  }
 },
 {
  "id": "put-customer-group",
  "method": "PUT",
  "path": "/customer-group",
  "tag": "customer-group",
  "kind": "cadastro",
  "mutating": true,
  "summary": "Grupo de Cliente",
  "description": "Recebe uma lista de um ou mais grupos de clientes\nInsere ou atuaiza grupos de cliente",
  "body": {
   "array": true,
   "schema": "CustomerGroupDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "OkResponse"
  }
 },
 {
  "id": "put-customer",
  "method": "PUT",
  "path": "/customer",
  "tag": "customer",
  "kind": "cadastro",
  "mutating": true,
  "summary": "Cliente",
  "description": "Recebe uma lista de um ou mais clientes\nInsere ou atualiza clientes",
  "body": {
   "array": true,
   "schema": "CustomerDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "OkResponse"
  }
 },
 {
  "id": "put-item",
  "method": "PUT",
  "path": "/item",
  "tag": "item",
  "kind": "cadastro",
  "mutating": true,
  "summary": "Item",
  "description": "Recebe uma lista de um ou mais itens\nInsere ou atualiza itens",
  "body": {
   "array": true,
   "schema": "ItemDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "OkResponse"
  }
 },
 {
  "id": "put-item-composition",
  "method": "PUT",
  "path": "/item-composition",
  "tag": "item-composition",
  "kind": "cadastro",
  "mutating": true,
  "summary": "Composições de Itens",
  "description": "Recebe uma lista de composições de itens\n- Remove as composições antiga e insere sua lista de composições",
  "body": {
   "array": true,
   "schema": "ItemCompositionDto"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "OkResponse"
  }
 },
 {
  "id": "put-item-group",
  "method": "PUT",
  "path": "/item-group",
  "tag": "item-group",
  "kind": "cadastro",
  "mutating": true,
  "summary": "Grupo de Item",
  "description": "Recebe uma lista de um ou mais grupos de item\nInsere ou atualiza grupos de item",
  "body": {
   "array": true,
   "schema": "ItemGroupDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "OkResponse"
  }
 },
 {
  "id": "put-item-secondary-group",
  "method": "PUT",
  "path": "/item-secondary-group",
  "tag": "item-secondary-group",
  "kind": "cadastro",
  "mutating": true,
  "summary": "Grupo Secundário de Item",
  "description": "Recebe uma lista de um ou mais grupos secundários de item\nInsere ou atualiza grupos secundários de item",
  "body": {
   "array": true,
   "schema": "ItemSecondaryGroupDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "OkResponse"
  }
 },
 {
  "id": "put-login",
  "method": "PUT",
  "path": "/login",
  "tag": "login",
  "kind": "auth",
  "mutating": false,
  "summary": "Login",
  "description": "Recebe o apelido, o token da empresa e retorna o token de login da api.",
  "body": {
   "array": false,
   "schema": "LoginDTO",
   "example": {
    "organization": "empresa",
    "token": "004484a2-9d32-4a2d-80de-989d6ee0c72d"
   }
  },
  "response": {
   "status": 200,
   "array": false,
   "example": {
    "accessToken": "accessToken",
    "refreshToken": "refreshToken"
   }
  }
 },
 {
  "id": "post-login-refresh",
  "method": "POST",
  "path": "/login/refresh",
  "tag": "login",
  "kind": "auth",
  "mutating": false,
  "summary": "Refresh token",
  "description": "Recebe um refresh token válido e retorna um novo par de tokens (access e refresh).",
  "body": {
   "array": false,
   "schema": "RefreshTokenDTO"
  },
  "response": {
   "status": 201,
   "array": false,
   "example": {
    "accessToken": "accessToken",
    "refreshToken": "refreshToken"
   }
  }
 },
 {
  "id": "put-movement",
  "method": "PUT",
  "path": "/movement",
  "tag": "movement",
  "kind": "transacao",
  "mutating": true,
  "summary": "Movimentação",
  "description": "Recebe uma lista de uma ou mais movimentações\nInsere ou atualiza movimentações",
  "body": {
   "array": true,
   "schema": "MovementDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "MovementResponse"
  }
 },
 {
  "id": "delete-movement",
  "method": "DELETE",
  "path": "/movement",
  "tag": "movement",
  "kind": "transacao",
  "mutating": true,
  "summary": "Delete Movimentação",
  "description": "Recebe uma lista de um ou mais documentos\nApaga todas as movimentações destes documentos",
  "body": {
   "array": true,
   "primitive": "string",
   "example": [
    "10001"
   ]
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "MovementDeleteResponse"
  }
 },
 {
  "id": "put-payment-terms",
  "method": "PUT",
  "path": "/payment-terms",
  "tag": "payment-terms",
  "kind": "cadastro",
  "mutating": true,
  "summary": "Termo de Pagamento",
  "description": "Recebe uma lista de um ou mais termos de pagamento\nInsere ou atualiza termos de pagamento",
  "body": {
   "array": true,
   "schema": "PaymentTermDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "OkResponse"
  }
 },
 {
  "id": "get-pre-purchase-order",
  "method": "GET",
  "path": "/pre-purchase-order",
  "tag": "pre-purchase-order",
  "kind": "consulta",
  "mutating": false,
  "summary": "Pré Ordens de Compra",
  "description": "Retorna uma lista de pré ordens de compra.",
  "response": {
   "status": 200,
   "array": true,
   "schema": "PrePurchaseOrderDTO"
  }
 },
 {
  "id": "put-pre-purchase-order-done",
  "method": "PUT",
  "path": "/pre-purchase-order/done",
  "tag": "pre-purchase-order",
  "kind": "retorno",
  "mutating": true,
  "summary": "Pré Ordens de Compra",
  "description": "Atualiza o status de uma lista de pré ordens de compra para integrada/finalizada.",
  "body": {
   "array": true,
   "schema": "PrePurchaseOrderDoneDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "PrePurchaseOrderDoneResponse"
  }
 },
 {
  "id": "put-purchase-order",
  "method": "PUT",
  "path": "/purchase-order",
  "tag": "purchase-order",
  "kind": "transacao",
  "mutating": true,
  "summary": "Ordens de Compra",
  "description": "Recebe uma lista de uma ou mais ordens de compra\n- Insere ou atualiza ordens de compra",
  "body": {
   "array": true,
   "schema": "PurchaseOrderDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "PurchaseOrderMutationResponse"
  }
 },
 {
  "id": "post-purchase-order",
  "method": "POST",
  "path": "/purchase-order",
  "tag": "purchase-order",
  "kind": "consulta",
  "mutating": false,
  "summary": "Ordens de Compra",
  "description": "Recebe uma lista de objetos, contendo um ou mais códigos com o operador\nRetorna uma lista de uma ou mais ordens de compra",
  "body": {
   "array": true,
   "schema": "PurchaseOrderFilter"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "PurchaseOrderResponse"
  }
 },
 {
  "id": "delete-purchase-order",
  "method": "DELETE",
  "path": "/purchase-order",
  "tag": "purchase-order",
  "kind": "transacao",
  "mutating": true,
  "summary": "Ordens de Compra",
  "description": "Recebe uma lista de um ou mais códigos de ordens de compra\nExclui ordens de compra",
  "body": {
   "array": true,
   "primitive": "string",
   "example": [
    "1"
   ]
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "PurchaseOrderMutationResponse"
  }
 },
 {
  "id": "put-stock",
  "method": "PUT",
  "path": "/stock",
  "tag": "stock",
  "kind": "transacao",
  "mutating": true,
  "summary": "Estoque",
  "description": "Recebe uma lista de um ou mais estoques\nInsere ou atualiza estoques",
  "body": {
   "array": true,
   "schema": "StockDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "StockUpdateResponse"
  }
 },
 {
  "id": "put-substitute",
  "method": "PUT",
  "path": "/substitute",
  "tag": "substitute",
  "kind": "cadastro",
  "mutating": true,
  "summary": "Substituto",
  "description": "Recebe uma lista de um ou mais substitutos de um item\n- Insere ou atualiza substitutos de um item",
  "body": {
   "array": true,
   "schema": "SubstituteDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "SubstituteResponse"
  }
 },
 {
  "id": "put-previous-version",
  "method": "PUT",
  "path": "/previous-version",
  "tag": "previous-version",
  "kind": "cadastro",
  "mutating": true,
  "summary": "Versão anterior",
  "description": "Recebe uma lista de uma ou mais versões anteriores de itens\nInclui a relação entre o item filho (novo) e o item pai (antigo), ou altera as datas e o percentual da relação que já existe\nNão exclui relações: as que não vierem na lista continuam gravadas\nData omitida mantém a data gravada; data enviada como null apaga a data gravada\nA data de início deve ser anterior à data de fim, considerando a data gravada quando uma delas é omitida\nO percentual indica quanto da venda do item pai é copiado para o filho: 100 copia a venda inteira, 200 o dobro; aceita casas decimais\nNão aceita a relação inversa de uma que já existe, nem a de uma linha anterior da mesma lista\nA mesma relação repetida na lista vale pela última ocorrência\nCada linha recebe seu próprio status; as linhas válidas são gravadas mesmo quando outras são recusadas\nCampo obrigatório ausente, percentual fora de 1 a 999 ou data que não esteja no formato AAAA-MM-DD recusam a lista inteira (400)",
  "body": {
   "array": true,
   "schema": "PreviousVersionDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "PreviousVersionResponse"
  }
 },
 {
  "id": "put-supplier",
  "method": "PUT",
  "path": "/supplier",
  "tag": "supplier",
  "kind": "cadastro",
  "mutating": true,
  "summary": "Fornecedor",
  "description": "Recebe uma lista de um ou mais fornecedores\nInsere ou atualiza fornecedores",
  "body": {
   "array": true,
   "schema": "SupplierDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "SupplierResponse"
  }
 },
 {
  "id": "put-supplier-brand",
  "method": "PUT",
  "path": "/supplier-brand",
  "tag": "supplier-brand",
  "kind": "cadastro",
  "mutating": true,
  "summary": "Fornecedor/Marca",
  "description": "Recebe uma lista de relações entre fornecedores e marcas\nInsere relações fornecedores e marcas",
  "body": {
   "array": true,
   "schema": "SupplierBrandDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "SupplierBrandResponse"
  }
 },
 {
  "id": "put-transfer",
  "method": "PUT",
  "path": "/transfer",
  "tag": "transfer",
  "kind": "transacao",
  "mutating": true,
  "summary": "Transferência",
  "description": "Recebe uma lista de uma ou mais transferências\nInsere ou atualiza transferências",
  "body": {
   "array": true,
   "schema": "TransferDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "TransferResponse"
  }
 },
 {
  "id": "get-transfer-suggestion",
  "method": "GET",
  "path": "/transfer-suggestion",
  "tag": "transfer-suggestion",
  "kind": "consulta",
  "mutating": false,
  "summary": "Sugestão de Transferência",
  "description": "Retorna uma lista de transferências disponíveis para integração.",
  "response": {
   "status": 200,
   "array": true,
   "schema": "TransferSuggestionDTO"
  }
 },
 {
  "id": "put-transfer-suggestion-done",
  "method": "PUT",
  "path": "/transfer-suggestion/done",
  "tag": "transfer-suggestion",
  "kind": "retorno",
  "mutating": true,
  "summary": "Sugestão de Transferências",
  "description": "Atualiza o status de uma lista de sugestões de transferência para fechado.",
  "body": {
   "array": true,
   "schema": "TransferSuggestionDoneDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "TransferSuggestionDoneResponse"
  }
 },
 {
  "id": "put-future-movement",
  "method": "PUT",
  "path": "/future-movement",
  "tag": "future-movement",
  "kind": "transacao",
  "mutating": true,
  "summary": "Vendas Firmes",
  "description": "Recebe uma lista de uma ou mais vendas firmes\n- Insere ou atualiza vendas firmes",
  "body": {
   "array": true,
   "schema": "FutureMovementDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "OkResponse"
  }
 },
 {
  "id": "post-ideal-stock-get",
  "method": "POST",
  "path": "/ideal-stock/get",
  "tag": "ideal-stock",
  "kind": "consulta",
  "mutating": false,
  "summary": "Estoque Ideal",
  "description": "Recebe um objeto que pode conter uma lista de filiais, uma lista de produtos e uma lista de marcas\n- Retorna uma lista de produtos, filiais, marcas e seus ideais de estoque\n- Nenhum dos filtros é obrigatório",
  "body": {
   "array": false,
   "schema": "IdealStockDTO",
   "example": {
    "branches": [
     "1"
    ]
   }
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "IdealStockResponse"
  }
 },
 {
  "id": "put-item-custom-attribute-option",
  "method": "PUT",
  "path": "/item-custom-attribute/option",
  "tag": "item-custom-attribute",
  "kind": "cadastro",
  "mutating": true,
  "summary": "Atributo Personalizado do Item - Opções",
  "description": "Recebe uma lista de um ou mais atributos customizados de item",
  "body": {
   "array": true,
   "schema": "ItemCustomAttributeOptionDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "OkResponse"
  }
 },
 {
  "id": "put-item-custom-attribute-value",
  "method": "PUT",
  "path": "/item-custom-attribute/value",
  "tag": "item-custom-attribute",
  "kind": "cadastro",
  "mutating": true,
  "summary": "Atributo Personalizado do Item - Valor",
  "description": "Recebe uma lista de um ou mais de ligações entre itens e seus atributos personalizados",
  "body": {
   "array": true,
   "schema": "ItemCustomAttributeValueDTO"
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "OkResponse"
  }
 },
 {
  "id": "post-daily-data-dfu",
  "method": "POST",
  "path": "/daily-data-dfu",
  "tag": "daily-data-dfu",
  "kind": "consulta",
  "mutating": false,
  "summary": "Dados Diários de DFU",
  "description": "Retorna os dados diários utilizados no cálculo de DFU (Demand Forecast Unit) para a data informada.",
  "body": {
   "array": false,
   "schema": "DailyDataDfuFilter",
   "example": {
    "date": "2019-05-17"
   }
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "DailyDataDfuResponse"
  }
 },
 {
  "id": "post-forecast-monthly",
  "method": "POST",
  "path": "/forecast/monthly",
  "tag": "forecast/monthly",
  "kind": "consulta",
  "mutating": false,
  "summary": "Previsões Mensais",
  "description": "Retorna uma lista de previsões mensais.",
  "body": {
   "array": false,
   "schema": "MonthlyForecastFilterDto",
   "example": {
    "branch": "1",
    "item": "32726",
    "brand": "32",
    "itemGroup": "34",
    "mainSupplier": "9000"
   }
  },
  "response": {
   "status": 200,
   "array": true,
   "schema": "MonthlyForecastDTO"
  }
 }
];

export interface BranchDTO {
  /** Identificador único da filial no seu sistema */
  code: string;
  /** Nome (Descrição) */
  name: string;
  /** Status (Ativo/Inativo) */
  active: boolean;
  /** Identificador único do grupo de filial no seu sistema · Pode ser omitido (Não altera o valor cadastrado) */
  branchGroup?: string | null;
  /** Endereço da filial no seu sistema · Pode ser omitido (Não altera o valor cadastrado) */
  address?: string | null;
}
export interface OkResponse {
  /** Código de status http para o processamento do registro */
  status: number;
  /** Código de referência do registro */
  code: string;
}
export interface BadRequestResponse {
  /**  */
  error: string;
  /**  */
  message: string;
  /**  */
  statusCode: number;
}
export interface UnauthorizedResponse {
  /**  */
  error: string;
  /**  */
  message: string;
  /**  */
  statusCode: number;
}
export interface InternalErrorResponse {
  /**  */
  error: string;
  /**  */
  message: string;
  /**  */
  statusCode: number;
}
export interface BranchGroupDTO {
  /** Identificador único do grupo de filial no seu sistema */
  code: string;
  /** Nome da filial (Descrição) */
  name: string;
  /** Identificado único da filial utilizada para cross-docking · Pode ser omitido (Não altera o valor cadastrado) */
  crossDockingBranch?: string | null;
}
export interface BranchItemParameterDTO {
  /** Identificador único da filial no seu sistema */
  branch: string;
  /** Identificador único do item no seu sistema */
  item: string;
  /** Quantidade de estoque estratégico · Pode ser omitido (Não altera o valor cadastrado) */
  strategicStock?: number | null;
  /** Indica se o item está para compra na filial · Pode ser omitido (Não altera o valor cadastrado) */
  purchase?: boolean | null;
  /** Limite de estoque superior · Pode ser omitido (Não altera o valor cadastrado) */
  upperStockLimit?: number | null;
  /** Indica se recebe transferência · Pode ser omitido (Não altera o valor cadastrado) */
  receivesTransfer?: boolean | null;
  /** Mínimo de Compra · Pode ser omitido (Não altera o valor cadastrado) */
  minimumPurchase?: number | null;
  /** Mínimo de Ressuprimento · Pode ser omitido (Não altera o valor cadastrado) */
  minimumResupply?: number | null;
  /** Múltiplo de Compra · Pode ser omitido (Não altera o valor cadastrado) */
  multiplePurchase?: number | null;
  /** Taxa de Conversão de Compra · Pode ser omitido (Não altera o valor cadastrado) */
  purchaseConversionRate?: number | null;
  /** Unidade de Conversão de Compra · Pode ser omitido (Não altera o valor cadastrado) */
  purchaseConversionRateUnit?: string | null;
  /** Múltiplo de Transferência · Pode ser omitido (Não altera o valor cadastrado) */
  transferConversionRate?: number | null;
  /** Unidade para o Múltiplo de Transferência · Pode ser omitido (Não altera o valor cadastrado) */
  transferConversionRateUnit?: string | null;
  /** Tipo de Lead Time - "c": calculado; "i" - informado; · Pode ser omitido (Não altera o valor cadastrado) */
  leadTimeType?: string;
  /** Tipo de Planejamento - "s": make to stock; "o" - make to order; · Pode ser omitido (Não altera o valor cadastrado) */
  planningType?: string;
  /** Quantidade para estoque de exposição · Pode ser omitido (Não altera o valor cadastrado) */
  expositionStock?: number | null;
  /** Data limite para considerar estoque de exposição · Pode ser omitido (Não altera o valor cadastrado) */
  expositionStockExpiration?: string | null;
  /** Login do responsável de compras · Pode ser omitido (Não altera o valor cadastrado) */
  buyer?: string | null;
  /** Login do analista logístico · Pode ser omitido (Não altera o valor cadastrado) */
  logisticsAnalyst?: string | null;
  /** Data para bloquear compras até · Pode ser omitido (Não altera o valor cadastrado) */
  blockPurchaseUntil?: string | null;
  /** Data para bloquear transferências até · Pode ser omitido (Não altera o valor cadastrado) */
  blockTransferUntil?: string | null;
  /** Número de dias usado no cálculo do Estoque de Segurança · Pode ser omitido (Não altera o valor cadastrado) */
  daysUsedToCalculateSafetyStock?: number | null;
}
export interface BranchItem {
  /**  */
  branch: string;
  /**  */
  item: string;
}
export interface BranchItemResponse {
  /**  */
  status: number;
  /**  */
  branchItem: BranchItem;
}
export interface BrandDTO {
  /** Identificador único da marca no seu sistema */
  code: string;
  /** Nome da Marca (Descrição) */
  name: string;
  /** Status (Ativo/Inativo) */
  active: boolean;
}
export interface CustomerGroupDTO {
  /** Identificador único do grupo de clientes no seu sistema */
  code: string;
  /** Nome do grupo de cliente (Descrição) */
  name: string;
  /** Alvo de cobrança do grupo de cliente, utilizado para indicar onde os movimentos serão agrupados para realizar a previsão de demanda · (M - Filial do Movimento, I - Filial padrão do cadastro do produto, C - Filial padrão do cliente) */
  billingTarget?: string | null;
}
export interface CustomerDTO {
  /** Identificador único do cliente no seu sistema */
  code: string;
  /** Nome do Cliente (Descrição) */
  name: string;
  /** Identificador do grupo de cliente no seu sistema */
  customerGroup: string;
  /** Cidade do cliente */
  city: string;
  /** Estado do cliente */
  state: string;
  /** País do cliente */
  country: string;
  /** Identificador único da filial de faturamento no seu sistema · Pode ser omitido (Não altera o valor cadastrado) */
  billingBranch?: string | null;
  /** Status (Ativo/Inativo) */
  active: boolean;
}
export interface ItemDTO {
  /** Identificador único do item no seu sistema */
  code: string;
  /** Nome do item (Descrição) */
  name: string;
  /** Identificador único da marca do item no seu sistema */
  brand: string;
  /** Identificador único do grupo do item no seu sistema */
  itemGroup: string;
  /** Identificador único do grupo secundário do item no seu sistema · Pode ser omitido (Não altera o valor cadastrado) */
  itemSecondaryGroup?: string | null;
  /** Identificador único do Fornecedor Principal do item no seu sistema · Pode ser omitido (Não altera o valor cadastrado) */
  mainSupplier?: string | null;
  /** Nome da unidade de medida (Descrição) · Deve existir */
  measurementUnity: string;
  /** Código do fornecedor */
  supplierCode: string;
  /** Quantidade Mínima aceita pelo fornecedor (quantidade para pedido minimo) · Pode ser omitido (Não altera o valor cadastrado) · Caso o valor enviado seja 0, será salvo como nulo */
  minimumPurchase?: number | null;
  /** Quantidade Múltipla de compra no fornecedor · Pode ser omitido (Não altera o valor cadastrado) · Caso o valor enviado seja 0, será salvo como nulo */
  multiplePurchase?: number | null;
  /** Quantidade de itens por embalagem para transferências · Pode ser omitido (Não altera o valor cadastrado) */
  packingQuantity?: number | null;
  /** Código de barras do produto · EAN 13 ou DUM14 ou CODIGO DE BARRAS INTERNO DA EMPRESA */
  barcode: string;
  /** Descrição · Aplicação do item/frota/tabela fipe/etc */
  description: string;
  /** Data de criação do item · Pode ser omitido (Não altera o valor cadastrado) */
  createdAt?: string | null;
  /** Tipo do item - se gera previsão de demanda (true) ou se é produto de encomenda (false) */
  makeToStock: boolean;
  /** Peso unitário do item · Pode ser omitido (Não altera o valor cadastrado) */
  weight?: number | null;
  /** Comprimento unitário do item · Pode ser omitido (Não altera o valor cadastrado) */
  length?: number | null;
  /** Status de compra do item (Ativo/Inativo pra compras) · Deprecated - Enviar como true */
  purchase: boolean;
  /** Status do item (Ativo/Inativo) */
  active: boolean;
}
export interface ItemCompositionDto {
  /** Identificador único do item no seu sistema */
  item: string;
  /** Identificador único do componente(item) no seu sistema */
  component: string;
  /** Quantidade da correlação */
  quantity: number;
  /** Percentual de perda (0 a 100) */
  loss: number;
  /** Tempo de fabricação */
  manufacturingTime: number;
}
export interface ItemGroupDTO {
  /** Identificador único do grupo do item no seu sistema */
  code: string;
  /** Nome do grupo de item (Descrição) */
  name: string;
  /** Identificador único do grupo pai (deve ter sido cadastrado previamente) */
  father: string;
}
export interface ItemSecondaryGroupDTO {
  /** Nome (Descrição) */
  name: string;
  /** Identificador único do grupo secundário de itens no seu sistema */
  code: string;
}
export interface LoginDTO {
  /** Identificador único da empresa */
  organization: string;
  /** Token de acesso à API */
  token: string;
}
export interface RefreshTokenDTO {
  /** Refresh token retornado no login */
  refreshToken: string;
}
export interface MovementDTO {
  /** Identificador único da movimentação no seu sistema */
  code: string;
  /** Identificador único da filial no seu sistema */
  branch: string;
  /** Identificador único do item no seu sistema */
  item: string;
  /** Identificador único do cliente no seu sistema */
  customer?: string | null;
  /** Data da movimentação */
  date: string;
  /** Quantidade da Venda (Caso seja valor fracionado enviar valor decimal separado por . (PONTO) */
  quantity: number;
  /** Valor total de cada movimento do produto (Este campo será usado para cálculo da Margem de Contribuição */
  saleValue: number;
  /** Indica se o movimento deve participar da previsão de demanda */
  participateInDemand: boolean | null;
  /** Identificador da nota no seu sistema */
  document: string;
  /** Indica se o movimento foi devolvido ou cancelado */
  returned: boolean | null;
}
export interface MovementResponse {
  /** Código de status http para o processamento do registro */
  status: number;
  /** Código de referência do registro */
  code: string;
  /**  */
  message?: string;
}
export interface MovementDeleteResponse {
  /** Identificador da nota informado na requisição */
  document: string;
  /** Código de status http para o processamento do registro */
  status: number;
  /** Identificadores únicos das movimentações removidas para este documento */
  removed: string[];
}
export interface PaymentTermDTO {
  /** Identificador único do termo de pagamento no seu sistema */
  code: string;
  /** Nome do termo de pagamento (Descrição) */
  name: string;
}
export interface PrePurchaseItem {
  /**  */
  code: string;
  /**  */
  name: string;
  /**  */
  unitOfMeasure: string;
  /**  */
  suggestedQuantity: number;
  /**  */
  quantity: number;
  /**  */
  itemValue: number;
  /**  */
  estimatedDeliveryDate: string;
  /**  */
  version: string;
  /**  */
  purchaseConversionRateUnit: string;
  /**  */
  convertedQuantity: number;
  /**  */
  convertedOriginalQuantity: number;
}
export interface PrePurchaseOrderDTO {
  /**  */
  code: string;
  /**  */
  branch: string;
  /**  */
  name: string;
  /**  */
  suggestionDate: string;
  /**  */
  estimatedDeliveryDate: string;
  /**  */
  supplier: string;
  /**  */
  supplierName: string;
  /**  */
  freight: string;
  /**  */
  paymentTerm: string;
  /**  */
  observations: string;
  /**  */
  createdAt: string;
  /**  */
  createdBy: string;
  /**  */
  totalValue: number;
  /** Código do tipo de ordem, para clientes SAP */
  sapOrderType: string;
  /** Nome do tipo de ordem, para clientes SAP */
  sapOrderTypeName: string;
  /**  */
  itemCount: number;
  /**  */
  items: PrePurchaseItem[];
}
export interface PrePurchaseOrderDoneDTO {
  /** Identificador único da pré ordem */
  code: string;
  /** Indica se a pré ordem foi finalizada com sucesso */
  success: boolean;
  /** Texto da mensagem de erro */
  errorMessage?: string;
  /** Código do pedido criado no ERP. Só é gravado quando success é true; se não for enviado, o código já gravado é mantido */
  erpOrderCode?: string;
}
export interface PrePurchaseOrderDoneResponse {
  /** Código de status http para o processamento do registro */
  status: number;
  /** Código de referência do registro */
  code: string;
  /**  */
  message?: string;
}
export interface PurchaseOrderDTO {
  /** Identificador único da ordem de compra no seu sistema */
  code: string;
  /** Identificador único da filial no seu sistema */
  branch: string;
  /** Identificador único do item no seu sistema */
  item: string;
  /** Data da ordem de compra */
  orderDate: string;
  /** Data de entrega da compra · Pode ser omitido (Não altera o valor cadastrado) */
  deliveryDate?: string | null;
  /** Quantidade solicitada na ordem de compra */
  requestedQuantity: number;
  /** Quantidade já recebida na ordem de compra */
  deliveredQuantity: number;
  /** Status da ordem de compra · O = Open (aberta), C = Closed (cancelada, finalizada) */
  status: string;
  /** Data esimada de entrega da compra · Pode ser omitido (Não altera o valor cadastrado) */
  estimatedDeliveryDate?: string | null;
  /** Valor da compra · Pode ser omitido (Não altera o valor cadastrado) */
  purchaseValue?: number | null;
  /** Tipo da compra · C = Confirmed (confirmada), P = Planned (planejada) · Pode ser omitido (Não altera o valor cadastrado) */
  purchaseType?: string | null;
  /** Identificador único do fornecedor no seu sistema · Pode ser omitido (Não altera o valor cadastrado) */
  supplier?: string | null;
  /** Unidade usada na compra · Se for a mesma cadastrada como Parâmetro Filial Item, irá multiplicar a quantidade dentro da ordem · Pode ser omitido (Não altera o valor cadastrado) */
  unit?: string | null;
}
export interface PurchaseOrderMutationResponse {
  /** Código de status http para o processamento do registro */
  status: number;
  /** Código de referência do registro */
  code: string;
  /**  */
  message?: string;
}
export interface PurchaseOrderFilter {
  /**  */
  code: Record<string, unknown>;
}
export interface PurchaseOrderResponse {
  /** Identificador único da ordem de compra no seu sistema */
  code: string;
  /**  */
  orderDate: string | null;
  /**  */
  deliveryDate: string | null;
  /**  */
  requestedQuantity: number | null;
  /**  */
  deliveredQuantity: number | null;
  /**  */
  status: string;
  /**  */
  estimatedDeliveryDate: string | null;
  /**  */
  purchaseValue: number | null;
  /**  */
  purchaseType: string | null;
  /** Identificador único da filial no seu sistema */
  branch: string | null;
  /** Identificador único do item no seu sistema */
  item: string | null;
  /** Identificador único do fornecedor no seu sistema */
  supplier: string | null;
}
export interface StockDTO {
  /** Identificador único da filial no seu sistema */
  branch: string;
  /** Identificador único do item no seu sistema */
  item: string;
  /** Data e hora da última atualização do estoque na base do sistema de gestão */
  date: string;
  /** Quantidade em estoque (Caso seja valor fracionado enviar valor decimal separado por . (PONTO) */
  quantity: number;
  /** Caso o sistema de gestão tenha uma localização preferencial do item naquele depósito pode ser enviado para facilitar a separação */
  location: string;
  /** Custo médio */
  averageCost: number;
  /** Custo de reposição · Valor da última compra do item naquele local · Pode ser omitido (Não altera o valor cadastrado) */
  replenishmentValue: number;
  /** Valor de compra · Pode ser omitido (Não altera o valor cadastrado) */
  purchaseValue: number;
  /** Valor médio de compra · Pode ser omitido (Não altera o valor cadastrado) */
  averageSaleValue?: number;
}
export interface StockUpdateResultCode {
  /** Identificador único do item no seu sistema */
  item: string;
  /** Identificador único da filial no seu sistema */
  branch: string;
  /** Tipo de estoque informado */
  stockType: string;
}
export interface StockUpdateResponse {
  /** Código de status http para o processamento do registro */
  status: number;
  /** Referência do registro do estoque processado */
  code: Record<string, unknown>;
  /**  */
  message?: string;
}
export interface SubstituteDTO {
  /** Identificador único do item no seu sistema */
  item: string;
  /** Identificadores dos substitutos do item */
  substitutes: string[];
}
export interface SubstituteResponse {
  /** Código de status http para o processamento do registro */
  status: number;
  /** Código de referência do registro */
  code: string;
  /**  */
  message?: string;
}
export interface PreviousVersionDTO {
  /** Identificador único do item novo (filho) no seu sistema */
  child: string;
  /** Identificador único do item antigo (pai) no seu sistema */
  parent: string;
  /** Data de início da cópia · Pode ser omitida (não altera o valor gravado) ou enviada como null (apaga o valor gravado) */
  startDate?: string | null;
  /** Data de fim da cópia, posterior à data de início · Pode ser omitida (não altera o valor gravado) ou enviada como null (apaga o valor gravado) */
  endDate?: string | null;
  /** Percentual da venda do item pai copiado para o filho, de 1 a 999, com casas decimais */
  relationPercent: number;
}
export interface PreviousVersionResponse {
  /** Código de status http para o processamento do registro */
  status: number;
  /** Item filho do registro (ausente na resposta a uma lista vazia) */
  child?: string;
  /** Item pai do registro (ausente na resposta a uma lista vazia) */
  parent?: string;
  /**  */
  message?: string;
}
export interface SupplierDTO {
  /** Identificador úninco do fornecedor no seu sistema */
  code: string;
  /** Nome do fornecedor (Descrição) */
  name: string;
  /** CPNJ do fornecedor */
  document: string;
  /** E-mail do fornecedor · Pode ser omitido (Não altera o valor cadastrado) */
  email?: string;
  /** Tipo de frete padrão · Pode ser omitido (Não altera o valor cadastrado) */
  freight: string;
  /** Código do Termo de pagamento padrão · Pode ser omitido (Não altera o valor cadastrado) */
  paymentTerm: string;
  /** Status (Ativo/Inativo) · Pode ser omitido (Não altera o valor cadastrado) */
  active?: boolean;
}
export interface SupplierResponse {
  /** Código de status http para o processamento do registro */
  status: number;
  /** Código de referência do registro */
  code: string;
  /**  */
  message?: string;
}
export interface SupplierBrandDTO {
  /** Identificador único do fornecedor no seu sistema */
  supplier: string;
  /** Identificador único da marca no seu sistema */
  brand: string;
}
export interface SupplierBrandResponse {
  /** Código de status http para o processamento do registro */
  status: number;
  /**  */
  message?: string;
  /** Identificador único do fornecedor no seu sistema */
  supplier?: string;
  /** Identificador único da marca no seu sistema */
  brand?: string;
}
export interface TransferDTO {
  /** Identificador único da transferência no seu sistema */
  code: string;
  /** Identificador único da filial no seu sistema que identifica a filial de origem da transferência · Pode informar a filial de origem no caso de transferência entre filial, ou deixar em branco no caso de uma ordem vindo do fornecedor · Pode ser omitido (Não altera o valor cadastrado) */
  sourceBranch?: string | null;
  /** Identificador único da filial no seu sistema que identifica a filial de destino da transferência */
  destinationBranch: string;
  /** Identificador único do item no seu sistema */
  item: string;
  /** Data e hora da emissão do pedido no sistema de gestão */
  transferDate: string;
  /** Data estimada de entrega · Pode ser omitido (Não altera o valor cadastrado) */
  estimatedDeliveryDate?: string | null;
  /** Data de entrega · Pode ser omitido (Não altera o valor cadastrado) */
  deliveryDate?: string | null;
  /** Quantidade solicitada no pedido de transferência */
  requestedQuantity: number;
  /** Quantidade já recebida no pedido de transferência */
  deliveredQuantity: number;
  /** Status da transferência · O = Open (aberta), C = Closed (cancelada, finalizada) */
  status: string;
}
export interface TransferResponse {
  /** Código de status http para o processamento do registro */
  status: number;
  /** Código de referência do registro */
  code: string;
  /**  */
  message?: string;
}
export interface TransferSuggestionDTO {
  /**  */
  id: number;
  /**  */
  sourceBranch: string;
  /**  */
  destinationBranch: string;
  /**  */
  item: string;
  /**  */
  itemName: string;
  /**  */
  unitOfMeasure: string;
  /**  */
  date: string;
  /**  */
  estimatedDeliveryDate: string;
  /**  */
  quantity: number;
  /**  */
  transferConversionRateUnit: string;
  /**  */
  convertedQuantity: number;
  /**  */
  averageCost: number;
  /**  */
  type: string;
  /**  */
  integrationBatch: number;
  /**  */
  createdAt: string;
  /**  */
  createdByUsername: string;
  /**  */
  createdByName: string;
  /**  */
  originalDestinationBranch: string;
}
export interface TransferSuggestionDoneDTO {
  /** Identificador único da sugestão de transferência */
  code: number;
  /** Indica se a sugestão de transferência foi finalizada com sucesso */
  success: boolean;
  /** Texto da mensagem de erro */
  errorMessage?: string;
}
export interface TransferSuggestionDoneResponse {
  /** Código de status http para o processamento do registro */
  status: number;
  /** Código de referência do registro */
  code: number;
  /**  */
  message?: string;
}
export interface FutureMovementDTO {
  /** Identificador único da venda firme no seu sistema */
  code: string;
  /** Identificador único da filial no seu sistema */
  branch: string;
  /** Identificador único do item no seu sistema */
  item: string;
  /** Data da venda firme */
  orderDate: string;
  /** Quantidade total solicitada na venda firme */
  quantity: number;
  /** Quantidade da venda firme já entregue · Opcional. Quando ausente, vale zero. · A demanda considerada pelo sistema é o saldo: quantidade total menos entregue. */
  deliveredQuantity?: number;
  /** Status da venda firme · O = Open (aberta), C = Closed (cancelada, finalizada) */
  status: string;
}
export interface IdealStockDTO {
  /**  */
  brands?: string[];
  /**  */
  items?: string[];
  /**  */
  branches?: string[];
  /**  */
  onlyWithChanges?: boolean;
}
export interface IdealStockResponse {
  /** Identificador único da filial no seu sistema */
  branchCode: string;
  /** Nome da filial */
  branchName: string;
  /** Identificador único da marca no seu sistema */
  brandCode: string;
  /** Nome da marca */
  brandName: string;
  /** Identificador único do produto no seu sistema */
  itemCode: string;
  /** Nome do produto */
  itemName: string;
  /** Ideal Inferior */
  lowerIdeal: number;
  /** Ideal Superior */
  upperIdeal: number;
  /** Quantidade em estoque para disparar o processo de ressuprimento */
  resupplyTriggerIdeal: number;
  /** Estoque total (físico + trânsitos em aberto para a filial) sobre o ideal inferior. 1 quando o ideal inferior é zero. A lista vem ordenada por ele, do menor para o maior. */
  coverage: number;
}
export interface ItemCustomAttributeOptionDTO {
  /** Nome do atributo */
  attributeName: string;
  /** Código da opção */
  optionCode: string;
  /** Valor/Nome da opção */
  optionValue: string;
  /** Status da opção (Ativo/Inativo) */
  active: boolean;
}
export interface ItemCustomAttributeValueDTO {
  /** Identificador único do item no seu sistema */
  item: string;
  /** Nome do atributo */
  attributeName: string;
  /** Código da opção */
  optionCode: string | null;
}
export interface DailyDataDfuFilter {
  /** Data do processamento */
  date: string;
}
export interface DailyDataDfuResponse {
  /** Data do processamento */
  date: string;
  /** Identificador único do item no seu sistema */
  itemCode: string;
  /**  */
  itemName: string;
  /** Identificador único da marca no seu sistema */
  brandCode: string;
  /**  */
  brandName: string;
  /** Identificador único do grupo de item no seu sistema */
  itemGroupCode: string;
  /**  */
  itemGroupName: string;
  /** Identificador único do subgrupo de item no seu sistema */
  itemSecondaryGroupCode: string | null;
  /**  */
  itemSecondaryGroupName: string | null;
  /** Fase de vida do item */
  itemLifePhase: string | null;
  /** Identificador único da filial de destino no seu sistema */
  destinationBranchCode: string;
  /**  */
  destinationBranchName: string;
  /** Curva ABC do item na filial de destino */
  destinationABCCurveItemBranch: string | null;
  /** Curva ABC do item */
  destinationABCCurveItem: string | null;
  /** Custo médio na filial de destino */
  destinationAverageCost: number | null;
  /** Média de vendas dos últimos 12 meses na filial de destino */
  destinationAvgSalesLast12Months: number | null;
  /** Média de vendas dos últimos 3 meses na filial de destino */
  destinationAvgSalesLast3Months: number | null;
  /** Média de vendas dos últimos 6 meses na filial de destino */
  destinationAvgSalesLast6Months: number | null;
  /** Indica se a compra está bloqueada na filial de destino */
  destinationBlockPurchase: boolean | null;
  /** Indica se a transferência está bloqueada na filial de destino */
  destinationBlockTransfer: boolean | null;
  /** Comprador responsável na filial de destino */
  destinationBuyerName: string | null;
  /** Calendário utilizado na filial de destino */
  destinationCalendarName: string | null;
  /** Dias de cobertura considerando transferências, na filial de destino */
  destinationDaysOfCoverageWithTransfers: number | null;
  /** Dias sem venda na filial de destino */
  destinationDaysWithoutSales: number | null;
  /** Data até quando a compra está bloqueada na filial de destino */
  destinationBlockPurchaseUntil: string | null;
  /** Dias de cobertura na filial de destino */
  destinationDaysOfCoverage: number | null;
  /** Tipo de planejamento na filial de destino */
  destinationPlanningType: string | null;
  /** Estoque de segurança na filial de destino */
  destinationSecurityStock: number | null;
  /** Estoque estratégico na filial de destino */
  destinationStrategicStock: number | null;
  /** Estoque de exposição na filial de destino */
  destinationExpositionStock: number | null;
  /** Data de validade do estoque de exposição na filial de destino */
  destinationExpositionStockExpirationDate: string | null;
  /** Dias ideais de estoque na filial de destino */
  destinationIdealDays: number | null;
  /** Quantidade mínima de compra na filial de destino */
  destinationMinimumPurchase: number | null;
  /** Múltiplo de compra na filial de destino */
  destinationMultiplePurchase: number | null;
  /** Percentual mínimo reservado de estoque de segurança na filial de destino */
  destinationSafetyStockMinimumPercentReserved: number | null;
  /** Nível de serviço na filial de destino */
  destinationServiceLevel: number | null;
  /** Total de vendas do mês corrente na filial de destino */
  destinationTotalSalesCurrentMonth: number | null;
  /** Total de vendas de um mês atrás na filial de destino */
  destinationTotalSalesOneMonthAgo: number | null;
  /** Total de vendas de três meses atrás na filial de destino */
  destinationTotalSalesThreeMonthsAgo: number | null;
  /** Total de vendas de dois meses atrás na filial de destino */
  destinationTotalSalesTwoMonthsAgo: number | null;
  /** Quantidade em aberto de pedidos de compra na filial de destino */
  destinationOpenPurchaseOrderQuantity: number | null;
  /** Classificação do nível de estoque na filial de destino */
  destinationStockLevel: string | null;
  /** Quantidade em estoque na filial de destino */
  destinationStockQuantity: number | null;
  /** Quantidade em aberto de transferências na filial de destino */
  destinationOpenTransferQuantity: number | null;
  /** Analista de logística responsável pela filial de destino */
  destinationLogisticsAnalyst: string | null;
  /** Fator de conversão de compra na filial de destino */
  destinationPurchaseConversionRate: number | null;
  /** Fator de conversão de transferência na filial de destino */
  destinationTransferConversionRate: number | null;
  /** Lead time na filial de destino */
  destinationLeadTime: number | null;
  /** Identificador único do fornecedor no seu sistema, quando a origem é um fornecedor */
  supplierCode: string | null;
  /**  */
  supplierName: string | null;
  /** Identificador único da filial de origem no seu sistema. Nulo quando a origem é um fornecedor */
  sourceBranchCode: string | null;
  /** Nulo quando a origem é um fornecedor */
  sourceBranchName: string | null;
  /** Dias de cobertura na origem */
  sourceDaysOfCoverage: number | null;
  /** Estoque de exposição na origem */
  sourceExpositionStock: number | null;
  /** Data de validade do estoque de exposição na origem */
  sourceExpositionStockExpirationDate: string | null;
  /** Dias ideais de estoque na origem */
  sourceIdealDays: number | null;
  /** Quantidade mínima de compra na origem */
  sourceMinimumPurchase: number | null;
  /** Tipo de planejamento na origem */
  sourcePlanningType: string | null;
  /** Percentual mínimo reservado de estoque de segurança na origem */
  sourceSafetyStockMinimumPercentReserved: number | null;
  /** Quantidade em estoque na origem */
  sourceStockQuantity: number | null;
  /** Estoque estratégico na origem */
  sourceStrategicStock: number | null;
  /** Data até quando a compra está bloqueada na origem */
  sourceBlockPurchaseUntil: string | null;
}
export interface MonthlyForecastFilterDto {
  /**  */
  branch: string;
  /**  */
  item: string;
  /**  */
  brand: string;
  /**  */
  itemGroup: string;
  /**  */
  mainSupplier: string;
}
export interface MonthlyForecastDTO {
  /**  */
  item: string;
  /** Dia do cálculo */
  createdAt: string;
  /** Previsão mês corrente do Dia do Cálculo */
  t0: number;
  /** Previsão mês (corrente do Dia do Cálculo) + 1 */
  t1: number;
  /** Previsão mês (corrente do Dia do Cálculo) + 2 */
  t2: number;
  /** Previsão mês (corrente do Dia do Cálculo) + 3 */
  t3: number;
  /** Previsão mês (corrente do Dia do Cálculo) + 4 */
  t4: number;
  /** Previsão mês (corrente do Dia do Cálculo) + 5 */
  t5: number;
  /** Previsão mês (corrente do Dia do Cálculo) + 6 */
  t6: number;
  /** Previsão mês (corrente do Dia do Cálculo) + 7 */
  t7: number;
  /** Previsão mês (corrente do Dia do Cálculo) + 8 */
  t8: number;
  /** Previsão mês (corrente do Dia do Cálculo) + 9 */
  t9: number;
  /** Previsão mês (corrente do Dia do Cálculo) + 10 */
  t10: number;
  /** Previsão mês (corrente do Dia do Cálculo) + 11 */
  t11: number;
  /** Previsão mês (corrente do Dia do Cálculo) + 12 */
  t12: number;
}

/** Corpo e resposta tipados de cada operação, pelo id do catálogo. */
export interface LagomOperationMap {
  'put-branch': { body: BranchDTO[]; response: OkResponse[] };
  'put-branch-group': { body: BranchGroupDTO[]; response: OkResponse };
  'put-branch-item-parameter': { body: BranchItemParameterDTO[]; response: BranchItemResponse[] };
  'post-branch-item-parameter-get': { body: { branch?: string[]; item?: string[] }; response: BranchItemParameterDTO[] };
  'put-brand': { body: BrandDTO[]; response: OkResponse[] };
  'put-customer-group': { body: CustomerGroupDTO[]; response: OkResponse[] };
  'put-customer': { body: CustomerDTO[]; response: OkResponse[] };
  'put-item': { body: ItemDTO[]; response: OkResponse[] };
  'put-item-composition': { body: ItemCompositionDto[]; response: OkResponse[] };
  'put-item-group': { body: ItemGroupDTO[]; response: OkResponse[] };
  'put-item-secondary-group': { body: ItemSecondaryGroupDTO[]; response: OkResponse[] };
  'put-login': { body: LoginDTO; response: unknown };
  'post-login-refresh': { body: RefreshTokenDTO; response: unknown };
  'put-movement': { body: MovementDTO[]; response: MovementResponse[] };
  'delete-movement': { body: string[]; response: MovementDeleteResponse[] };
  'put-payment-terms': { body: PaymentTermDTO[]; response: OkResponse[] };
  'get-pre-purchase-order': { body: undefined; response: PrePurchaseOrderDTO[] };
  'put-pre-purchase-order-done': { body: PrePurchaseOrderDoneDTO[]; response: PrePurchaseOrderDoneResponse[] };
  'put-purchase-order': { body: PurchaseOrderDTO[]; response: PurchaseOrderMutationResponse[] };
  'post-purchase-order': { body: PurchaseOrderFilter[]; response: PurchaseOrderResponse[] };
  'delete-purchase-order': { body: string[]; response: PurchaseOrderMutationResponse[] };
  'put-stock': { body: StockDTO[]; response: StockUpdateResponse[] };
  'put-substitute': { body: SubstituteDTO[]; response: SubstituteResponse[] };
  'put-previous-version': { body: PreviousVersionDTO[]; response: PreviousVersionResponse[] };
  'put-supplier': { body: SupplierDTO[]; response: SupplierResponse[] };
  'put-supplier-brand': { body: SupplierBrandDTO[]; response: SupplierBrandResponse[] };
  'put-transfer': { body: TransferDTO[]; response: TransferResponse[] };
  'get-transfer-suggestion': { body: undefined; response: TransferSuggestionDTO[] };
  'put-transfer-suggestion-done': { body: TransferSuggestionDoneDTO[]; response: TransferSuggestionDoneResponse[] };
  'put-future-movement': { body: FutureMovementDTO[]; response: OkResponse[] };
  'post-ideal-stock-get': { body: IdealStockDTO; response: IdealStockResponse[] };
  'put-item-custom-attribute-option': { body: ItemCustomAttributeOptionDTO[]; response: OkResponse[] };
  'put-item-custom-attribute-value': { body: ItemCustomAttributeValueDTO[]; response: OkResponse[] };
  'post-daily-data-dfu': { body: DailyDataDfuFilter; response: DailyDataDfuResponse[] };
  'post-forecast-monthly': { body: MonthlyForecastFilterDto; response: MonthlyForecastDTO[] };
}
export type LagomOperationId = keyof LagomOperationMap;
