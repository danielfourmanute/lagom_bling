import { createHash } from 'node:crypto';
import { z } from 'zod';
import { lagomSchemas, type LagomOperationId } from './generated/lagom-catalog.js';

/* ------------------------------------------------------------------ *
 * Mapeamento dos cadastros Bling → Lagom DRP (funções puras).
 * Entrada: snapshot da Bling. Saída: payloads Lagom prontos, registros
 * ignorados com motivo e problemas de compatibilidade por registro.
 * ------------------------------------------------------------------ */

type J = Record<string, any>;
export interface BlingData {
  empresa?: J;
  depositos: J[]; categorias: J[]; gruposProdutos: J[]; formas: J[];
  contatos: J[]; contatoDetalhes: Map<string, J>;
  produtos: J[]; produtoDetalhes: Map<string, J>; produtoFornecedores: J[];
}

export const MappingOptionsSchema = z.object({
  /** Grupo de filial único que agrupa os depósitos Bling. */
  branchGroupCode: z.string().trim().min(1).max(60).default('BLING'),
  branchGroupName: z.string().trim().max(120).default(''),
  /** Itens "Garantia: …" (par espelho de cada peça, com estoque próprio). */
  includeWarrantyItems: z.boolean().default(true),
  /** Produtos com tipo Serviço na Bling. */
  includeServices: z.boolean().default(false),
  /** Produto pai de variações (formato V) não tem estoque: por padrão só as variações viram itens. */
  includeVariationParents: z.boolean().default(false),
  /** none: não envia; virtual: só kits de estoque virtual (V); all: inclui também os de estoque físico (F). */
  compositions: z.enum(['none', 'virtual', 'all']).default('virtual'),
  /** Código de barras quando o produto não tem GTIN válido. */
  barcodeFallback: z.enum(['sku', 'id', 'none']).default('sku'),
  /** Código do fornecedor quando o vínculo produto/fornecedor não tem código. */
  supplierCodeFallback: z.enum(['sku', 'none']).default('sku'),
  makeToStock: z.boolean().default(true),
  /** Unidade Bling → nome da unidade de medida já cadastrada no Lagom. */
  unitMap: z.record(z.string(), z.string()).default({}),
  /** Valores padrão exigidos pelo Lagom para fornecedor (sem equivalente na Bling). */
  supplierFreight: z.string().trim().max(60).default(''),
  supplierPaymentTerm: z.string().trim().max(60).default(''),
  /** cliente: só contatos do tipo Cliente; todos: todo contato que não é só fornecedor. */
  customerScope: z.enum(['cliente', 'todos']).default('todos'),
  customerGroupMode: z.enum(['uf', 'tipo-pessoa', 'unico']).default('uf'),
  customerGroupBillingTarget: z.enum(['M', 'I', 'C']).default('M'),
  sendBranchItemParameters: z.boolean().default(true),
});
export type MappingOptions = z.infer<typeof MappingOptionsSchema>;
export const defaultMappingOptions = (): MappingOptions => MappingOptionsSchema.parse({});

export type Severity = 'erro' | 'aviso' | 'info';
export interface Issue { code: string; severity: Severity; message: string; sourceId?: string; name?: string; field?: string }
export interface MappedRecord { code: string; sourceId: string; name: string; payload: J; hash: string; issues: Issue[] }
export interface ResourcePlan {
  resource: string; title: string; operationId: LagomOperationId; schema: string; order: number;
  source: string; records: MappedRecord[]; skipped: { sourceId: string; name: string; reason: string }[];
  notes: Issue[];
}
export interface Finding { severity: Severity; title: string; detail: string; count?: number }

/* ---------------------------- utilitários ---------------------------- */
const s = (v: unknown) => (v === null || v === undefined ? '' : String(v)).trim();
const id = (v: unknown) => { const x = s(v); return x && x !== '0' ? x : ''; };
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v) || 0);
const digits = (v: unknown) => s(v).replace(/\D/g, '');
const stripHtml = (v: unknown) => s(v).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const fold = (v: string) => v.normalize('NFD').replace(/[̀-ͯ]/g, '');
export const hashPayload = (payload: unknown) => createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 32);
/** Código estável de marca: maiúsculas, sem acento, separador "-". */
export const brandCode = (marca: string) => fold(marca).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
/** GTIN-8/12/13/14 com dígito verificador válido. */
export function validGtin(value: string) {
  if (!/^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(value) || /^0+$/.test(value)) return false;
  const body = value.slice(0, -1).split('').reverse().map(Number);
  const sum = body.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === Number(value.at(-1));
}
const isWarranty = (nome: string) => /^garantia\s*:/i.test(nome);
const COUNTRY: Record<string, string> = { '': 'BR', brasil: 'BR', brazil: 'BR', argentina: 'AR', paraguai: 'PY', uruguai: 'UY', chile: 'CL', china: 'CN', 'estados unidos': 'US' };

/** Validação genérica contra o DTO do OpenAPI do Lagom. */
export function validateAgainstSchema(schemaName: string, payload: J, allowNull: string[] = []): Issue[] {
  const schema = lagomSchemas[schemaName];
  if (!schema) return [{ code: 'SCHEMA_DESCONHECIDO', severity: 'erro', message: `Schema ${schemaName} não existe no catálogo Lagom.` }];
  const issues: Issue[] = [];
  const known = new Set(schema.fields.map(f => f.name));
  for (const key of Object.keys(payload)) if (!known.has(key)) issues.push({ code: 'CAMPO_DESCONHECIDO', severity: 'erro', field: key, message: `Campo ${key} não existe em ${schemaName}.` });
  for (const f of schema.fields) {
    const v = payload[f.name];
    if (v === undefined) { if (f.required) issues.push({ code: 'OBRIGATORIO_AUSENTE', severity: 'erro', field: f.name, message: `${f.name} é obrigatório no Lagom.` }); continue; }
    if (v === null) { if (!f.nullable && !allowNull.includes(f.name)) issues.push({ code: 'NULO_NAO_PERMITIDO', severity: 'erro', field: f.name, message: `${f.name} não aceita null.` }); continue; }
    const type = Array.isArray(v) ? 'array' : typeof v;
    if (f.type !== 'object' && type !== f.type) { issues.push({ code: 'TIPO_INVALIDO', severity: 'erro', field: f.name, message: `${f.name} deve ser ${f.type}.` }); continue; }
    if (typeof v === 'string') {
      if (f.required && !v.trim()) issues.push({ code: 'OBRIGATORIO_VAZIO', severity: 'erro', field: f.name, message: `${f.name} é obrigatório e está vazio.` });
      if (f.maxLength !== undefined && v.length > f.maxLength) issues.push({ code: 'TAMANHO_EXCEDIDO', severity: 'erro', field: f.name, message: `${f.name} aceita no máximo ${f.maxLength} caracteres.` });
      if (f.format === 'YYYY-MM-DD' && !/^\d{4}-\d{2}-\d{2}$/.test(v)) issues.push({ code: 'DATA_INVALIDA', severity: 'erro', field: f.name, message: `${f.name} deve estar no formato AAAA-MM-DD.` });
    }
    if (typeof v === 'number') {
      if (f.minimum !== undefined && v < f.minimum) issues.push({ code: 'VALOR_MINIMO', severity: 'erro', field: f.name, message: `${f.name} deve ser ≥ ${f.minimum}.` });
      if (f.maximum !== undefined && v > f.maximum) issues.push({ code: 'VALOR_MAXIMO', severity: 'erro', field: f.name, message: `${f.name} deve ser ≤ ${f.maximum}.` });
    }
  }
  return issues;
}

/* ------------------------------ plano ------------------------------ */
interface Builder { plan: ResourcePlan; add(code: string, sourceId: string, name: string, payload: J, issues?: Issue[], allowNull?: string[]): void; skip(sourceId: string, name: string, reason: string): void; note(i: Issue): void }
function builder(resource: string, title: string, operationId: LagomOperationId, schema: string, order: number, source: string): Builder {
  const plan: ResourcePlan = { resource, title, operationId, schema, order, source, records: [], skipped: [], notes: [] };
  const seen = new Set<string>();
  return {
    plan,
    add(code, sourceId, name, payload, issues = [], allowNull = []) {
      // A validação genérica não repete campos que já têm um erro específico (ex.: decisão pendente).
      const explained = new Set(issues.filter(i => i.severity === 'erro' && i.field).map(i => i.field));
      const all = [...issues, ...validateAgainstSchema(schema, payload, allowNull).filter(i => !explained.has(i.field))];
      if (seen.has(code)) all.push({ code: 'CODIGO_DUPLICADO', severity: 'erro', message: `Código ${code} repetido no lote.` });
      seen.add(code);
      plan.records.push({ code, sourceId, name, payload, hash: hashPayload(payload), issues: all.map(i => ({ ...i, sourceId, name })) });
    },
    skip(sourceId, name, reason) { plan.skipped.push({ sourceId, name, reason }); },
    note(i) { plan.notes.push(i); },
  };
}

export function buildPlan(data: BlingData, options: MappingOptions = defaultMappingOptions()): { resources: ResourcePlan[]; findings: Finding[] } {
  const findings: Finding[] = [];
  const resources: ResourcePlan[] = [];
  const detail = (p: J) => data.produtoDetalhes.get(String(p.id));
  const listById = new Map(data.produtos.map(p => [String(p.id), p]));

  /* 1. Grupo de filial */
  const bg = builder('branch-group', 'Grupo de filial', 'put-branch-group', 'BranchGroupDTO', 1, 'Fixo (sem equivalente na Bling)');
  const groupName = options.branchGroupName || s(data.empresa?.nome) || 'Bling';
  bg.add(options.branchGroupCode, 'fixo', groupName, { code: options.branchGroupCode, name: groupName });
  bg.note({ code: 'SEM_ORIGEM', severity: 'info', message: 'A Bling não tem grupo de filial: criado um grupo único que agrupa todos os depósitos.' });
  resources.push(bg.plan);

  /* 2. Filial ← depósito */
  const br = builder('branch', 'Filial', 'put-branch', 'BranchDTO', 2, 'GET /depositos');
  const branchCodes = new Set<string>();
  let defaultBranch = '';
  for (const d of data.depositos) {
    const code = s(d.id);
    const issues: Issue[] = [];
    if (d.desconsiderarSaldo) issues.push({ code: 'DEPOSITO_DESCONSIDERA_SALDO', severity: 'aviso', message: 'Depósito marcado para desconsiderar saldo na Bling.' });
    br.add(code, code, s(d.descricao), { code, name: s(d.descricao), active: num(d.situacao) === 1, branchGroup: options.branchGroupCode }, issues);
    branchCodes.add(code);
    if (d.padrao || !defaultBranch) defaultBranch = code;
  }
  if (!data.depositos.length) br.note({ code: 'SEM_DEPOSITO', severity: 'erro', message: 'Nenhum depósito na Bling: o Lagom precisa de pelo menos uma filial.' });
  br.note({ code: 'DECISAO_FILIAL', severity: 'info', message: 'Filial Lagom = depósito Bling (código = ID do depósito).' });
  resources.push(br.plan);

  /* 3. Marca ← produto.marca (texto livre no detalhe) */
  const brands = new Map<string, { name: string; variants: Set<string>; count: number }>();
  const brandOf = (p: J): string => {
    const d = detail(p);
    let marca = s(d?.marca);
    if (!marca && d?.variacao?.produtoPai?.id) marca = s(data.produtoDetalhes.get(String(d.variacao.produtoPai.id))?.marca);
    return marca;
  };

  /* 4. Grupo de item ← categoria de produto */
  const ig = builder('item-group', 'Grupo de item', 'put-item-group', 'ItemGroupDTO', 4, 'GET /categorias/produtos');
  const catById = new Map(data.categorias.map(c => [String(c.id), c]));
  const depth = (c: J, guard = 0): number => { const pai = id(c.categoriaPai?.id); return !pai || guard > 20 || !catById.has(pai) ? 0 : 1 + depth(catById.get(pai)!, guard + 1); };
  const itemGroupCodes = new Set<string>();
  for (const c of [...data.categorias].sort((a, b) => depth(a) - depth(b))) {
    const code = s(c.id); const pai = id(c.categoriaPai?.id);
    const issues: Issue[] = [];
    if (pai && !catById.has(pai)) issues.push({ code: 'PAI_INEXISTENTE', severity: 'erro', field: 'father', message: `Categoria pai ${pai} não existe na Bling.` });
    ig.add(code, code, s(c.descricao), { code, name: s(c.descricao), father: pai || null }, issues, ['father']);
    itemGroupCodes.add(code);
  }
  const roots = data.categorias.filter(c => !id(c.categoriaPai?.id)).length;
  if (roots) ig.note({ code: 'FATHER_RAIZ', severity: 'aviso', message: `${roots} categoria(s) raiz enviadas com father = null. O OpenAPI marca "father" como obrigatório; confirmar no sandbox que null é aceito para grupos raiz.` });

  /* 5. Grupo secundário ← grupo de produtos (tributação) */
  const isg = builder('item-secondary-group', 'Grupo secundário de item', 'put-item-secondary-group', 'ItemSecondaryGroupDTO', 5, 'GET /grupos-produtos');
  const secondaryCodes = new Set<string>();
  for (const g of data.gruposProdutos) { const code = s(g.id); isg.add(code, code, s(g.nome ?? g.descricao), { code, name: s(g.nome ?? g.descricao) }); secondaryCodes.add(code); }
  if (!data.gruposProdutos.length) isg.note({ code: 'SEM_DADOS', severity: 'info', message: 'Conta Bling sem grupos de produtos: nada a enviar (campo opcional no item).' });

  /* 6. Termo de pagamento ← forma de pagamento */
  const pt = builder('payment-terms', 'Termo de pagamento', 'put-payment-terms', 'PaymentTermDTO', 6, 'GET /formas-pagamentos');
  const paymentCodes = new Set<string>();
  for (const f of data.formas) { const code = s(f.id); pt.add(code, code, s(f.descricao), { code, name: s(f.descricao) }); paymentCodes.add(code); }
  pt.note({ code: 'SEMANTICA_DIFERENTE', severity: 'aviso', message: 'Bling tem "formas de pagamento" (boleto, PIX…), não prazos/condições. São enviadas como termos de pagamento só para o fornecedor ter um padrão válido.' });

  /* 7. Fornecedor ← contato tipo Fornecedor */
  const sup = builder('supplier', 'Fornecedor', 'put-supplier', 'SupplierDTO', 7, 'GET /contatos?idTipoContato=Fornecedor + GET /contatos/{id}');
  const isSupplier = (c: J) => (c._tipos ?? []).some((t: string) => fold(t).toLowerCase() === 'fornecedor');
  const isCustomer = (c: J) => (c._tipos ?? []).some((t: string) => fold(t).toLowerCase() === 'cliente');
  const supplierCodes = new Set<string>();
  for (const c of data.contatos.filter(isSupplier)) {
    const code = s(c.id); const d = data.contatoDetalhes.get(code) ?? {};
    const doc = digits(d.numeroDocumento ?? c.numeroDocumento);
    const issues: Issue[] = [];
    if (doc.length !== 14) issues.push({ code: doc ? 'DOCUMENTO_NAO_CNPJ' : 'DOCUMENTO_AUSENTE', severity: doc ? 'aviso' : 'erro', field: 'document', message: doc ? 'Documento não é CNPJ (o Lagom pede CNPJ).' : 'Fornecedor sem CNPJ.' });
    if (!options.supplierFreight) issues.push({ code: 'DECISAO_FRETE', severity: 'erro', field: 'freight', message: 'Defina o tipo de frete padrão (obrigatório no Lagom, inexistente na Bling).' });
    if (!options.supplierPaymentTerm) issues.push({ code: 'DECISAO_TERMO_PAGAMENTO', severity: 'erro', field: 'paymentTerm', message: 'Defina o termo de pagamento padrão do fornecedor.' });
    else if (!paymentCodes.has(options.supplierPaymentTerm)) issues.push({ code: 'REFERENCIA_INEXISTENTE', severity: 'aviso', field: 'paymentTerm', message: `Termo ${options.supplierPaymentTerm} não está entre as formas de pagamento enviadas: precisa existir no Lagom.` });
    const payload: J = { code, name: s(c.nome), document: doc, freight: options.supplierFreight, paymentTerm: options.supplierPaymentTerm, active: s(c.situacao) !== 'I' };
    if (s(d.email)) payload.email = s(d.email);
    sup.add(code, code, s(c.nome), payload, issues);
    supplierCodes.add(code);
  }

  /* 8. Item ← produto (+ detalhe) */
  const it = builder('item', 'Item', 'put-item', 'ItemDTO', 8, 'GET /produtos + GET /produtos/{id}');
  const itemCodes = new Set<string>();
  const units = new Map<string, number>();
  const linkByProduct = new Map<string, J>();
  for (const l of data.produtoFornecedores) { const pid = s(l.produto?.id); if (pid && (l.padrao || !linkByProduct.has(pid))) linkByProduct.set(pid, l); }
  let gtinOk = 0, gtinInvalid = 0, withoutDetail = 0;
  for (const p of data.produtos) {
    const code = s(p.id); const nome = s(p.nome); const d = detail(p);
    if (s(p.formato) === 'V' && !options.includeVariationParents) { it.skip(code, nome, 'Produto pai de variações (sem estoque próprio); as variações são enviadas.'); continue; }
    if (isWarranty(nome) && !options.includeWarrantyItems) { it.skip(code, nome, 'Item de garantia excluído pelas opções.'); continue; }
    if (s(p.tipo) === 'S' && !options.includeServices) { it.skip(code, nome, 'Cadastrado como serviço na Bling.'); continue; }
    const issues: Issue[] = [];
    if (!d) { withoutDetail++; issues.push({ code: 'DETALHE_AUSENTE', severity: 'erro', message: 'Detalhe do produto ainda não carregado no snapshot (marca, unidade, categoria).' }); }
    const pai = d?.variacao?.produtoPai?.id ? data.produtoDetalhes.get(String(d.variacao.produtoPai.id)) : undefined;
    // Marca
    const marca = brandOf(p);
    const bcode = marca ? brandCode(marca) : 'SEM-MARCA';
    if (d && !marca) issues.push({ code: 'SEM_MARCA', severity: 'aviso', field: 'brand', message: 'Produto sem marca na Bling: vai para a marca SEM-MARCA.' });
    if (d) { const b = brands.get(bcode) ?? { name: marca || 'SEM MARCA', variants: new Set<string>(), count: 0 }; b.variants.add(marca || 'SEM MARCA'); b.count++; brands.set(bcode, b); }
    // Categoria
    let cat = id(d?.categoria?.id) || id(pai?.categoria?.id);
    if (d && !cat) { cat = 'SEM-CATEGORIA'; issues.push({ code: 'SEM_CATEGORIA', severity: 'aviso', field: 'itemGroup', message: 'Produto sem categoria: vai para o grupo SEM-CATEGORIA.' }); }
    else if (cat && !itemGroupCodes.has(cat)) issues.push({ code: 'REFERENCIA_INEXISTENTE', severity: 'erro', field: 'itemGroup', message: `Categoria ${cat} não existe na listagem de categorias.` });
    // Unidade
    const unidade = s(d?.unidade);
    if (d) units.set(unidade || '(vazia)', (units.get(unidade || '(vazia)') ?? 0) + 1);
    const unit = options.unitMap[unidade] ?? unidade;
    // GTIN
    const gtin = digits(d?.gtin);
    let barcode = '';
    if (gtin && validGtin(gtin)) { barcode = gtin; gtinOk++; }
    else {
      if (gtin) { gtinInvalid++; issues.push({ code: 'GTIN_INVALIDO', severity: 'aviso', field: 'barcode', message: `GTIN ${gtin} com dígito verificador inválido.` }); }
      barcode = options.barcodeFallback === 'sku' ? s(p.codigo) : options.barcodeFallback === 'id' ? code : '';
      if (d && barcode) issues.push({ code: 'BARCODE_FALLBACK', severity: 'info', field: 'barcode', message: `Sem GTIN válido: código de barras = ${options.barcodeFallback === 'sku' ? 'SKU' : 'ID Bling'} (código interno).` });
    }
    // Fornecedor
    const link = linkByProduct.get(code);
    const supplierId = id(d?.fornecedor?.contato?.id) || id(link?.fornecedor?.id);
    const supplierCode = s(d?.fornecedor?.codigo) || s(link?.codigo) || (options.supplierCodeFallback === 'sku' ? s(p.codigo) : '');
    const payload: J = {
      code, name: nome, brand: bcode, itemGroup: cat, measurementUnity: unit, supplierCode, barcode,
      description: stripHtml(d?.descricaoCurta) || nome, makeToStock: options.makeToStock, purchase: true, active: s(p.situacao) === 'A',
    };
    const secondary = id(d?.tributacao?.grupoProduto?.id);
    if (secondary) {
      if (secondaryCodes.has(secondary)) payload.itemSecondaryGroup = secondary;
      else issues.push({ code: 'REFERENCIA_INEXISTENTE', severity: 'aviso', field: 'itemSecondaryGroup', message: `Grupo de produtos ${secondary} não encontrado; campo omitido.` });
    }
    if (supplierId) {
      if (supplierCodes.has(supplierId)) payload.mainSupplier = supplierId;
      else issues.push({ code: 'FORNECEDOR_NAO_ENVIADO', severity: 'aviso', field: 'mainSupplier', message: `Fornecedor ${supplierId} não é contato do tipo Fornecedor; campo omitido.` });
    }
    if (num(d?.pesoBruto) > 0) payload.weight = num(d?.pesoBruto);
    if (num(d?.dimensoes?.profundidade) > 0) payload.length = num(d?.dimensoes?.profundidade);
    if (num(d?.itensPorCaixa) > 1) payload.packingQuantity = num(d?.itensPorCaixa);
    it.add(code, code, nome, payload, issues);
    itemCodes.add(code);
  }

  /* 3 (cont.) Marca — montada a partir dos itens */
  const bd = builder('brand', 'Marca', 'put-brand', 'BrandDTO', 3, 'produto.marca (detalhe)');
  for (const [code, b] of [...brands].sort()) {
    const issues: Issue[] = [];
    if (b.variants.size > 1) issues.push({ code: 'MARCA_GRAFIAS', severity: 'aviso', message: `Grafias diferentes unificadas: ${[...b.variants].join(' | ')}.` });
    bd.add(code, code, b.name, { code, name: b.name, active: true }, issues);
  }
  bd.note({ code: 'SEM_CADASTRO_ORIGEM', severity: 'info', message: 'A Bling não tem cadastro de marcas: as marcas são o texto livre do campo marca de cada produto, com código normalizado.' });
  resources.push(bd.plan, ig.plan);
  if (it.plan.records.some(r => r.payload.itemGroup === 'SEM-CATEGORIA')) {
    ig.add('SEM-CATEGORIA', 'fixo', 'Sem categoria', { code: 'SEM-CATEGORIA', name: 'Sem categoria', father: null }, [], ['father']);
  }
  resources.push(isg.plan, pt.plan, sup.plan, it.plan);

  /* 9. Fornecedor × marca */
  const sb = builder('supplier-brand', 'Fornecedor/Marca', 'put-supplier-brand', 'SupplierBrandDTO', 9, 'derivado: item.mainSupplier × item.brand');
  const pairs = new Set<string>();
  for (const r of it.plan.records) if (r.payload.mainSupplier) pairs.add(`${r.payload.mainSupplier}|${r.payload.brand}`);
  for (const pair of pairs) { const [supplier, brand] = pair.split('|') as [string, string]; sb.add(pair, pair, pair, { supplier, brand }); }
  if (!pairs.size) sb.note({ code: 'SEM_DADOS', severity: 'info', message: 'Nenhum produto tem fornecedor vinculado na Bling: não há relação fornecedor/marca a enviar.' });
  resources.push(sb.plan);

  /* 10. Composição ← estrutura */
  const ic = builder('item-composition', 'Composição de item', 'put-item-composition', 'ItemCompositionDto', 10, 'produto.estrutura (detalhe)');
  const edges = new Map<string, Set<string>>();
  for (const [pid, d] of data.produtoDetalhes) for (const c of d.estrutura?.componentes ?? []) { const cid = id(c.produto?.id); if (cid) edges.set(pid, (edges.get(pid) ?? new Set()).add(cid)); }
  // Só itens que de fato serão enviados (sem erro) podem ser item/componente de uma composição.
  const itemReady = new Set(it.plan.records.filter(r => !r.issues.some(i => i.severity === 'erro')).map(r => r.code));
  let mirrors = 0, fisicos = 0;
  for (const p of data.produtos) {
    const d = detail(p); const pid = s(p.id);
    const comps = d?.estrutura?.componentes ?? [];
    if (!comps.length) continue;
    const tipo = s(d!.estrutura.tipoEstoque);
    // Espelho: A tem só B como componente e B tem só A.
    const other = edges.get(id(comps[0].produto?.id));
    const mirror = comps.length === 1 && other?.size === 1 && other.has(pid);
    if (mirror) { mirrors++; ic.skip(pid, s(p.nome), 'Composição espelho (A ↔ B, cada um componente do outro): é vínculo entre peça e garantia, não estrutura de produto.'); continue; }
    if (options.compositions === 'none' || (options.compositions === 'virtual' && tipo !== 'V')) { if (tipo !== 'V') fisicos++; ic.skip(pid, s(p.nome), `Estrutura com estoque ${tipo === 'F' ? 'físico' : tipo || 'indefinido'} ignorada pelas opções.`); continue; }
    for (const c of comps) {
      const cid = id(c.produto?.id); const issues: Issue[] = [];
      if (!itemReady.has(pid)) issues.push({ code: 'REFERENCIA_INEXISTENTE', severity: 'erro', field: 'item', message: `Item ${pid} não será enviado${itemCodes.has(pid) ? ' (item com erro)' : ''}.` });
      if (!itemReady.has(cid)) issues.push({ code: 'REFERENCIA_INEXISTENTE', severity: 'erro', field: 'component', message: `Componente ${cid} (${s(listById.get(cid)?.nome) || 'desconhecido'}) não será enviado como item${itemCodes.has(cid) ? ' (item com erro)' : ''}.` });
      ic.add(`${pid}:${cid}`, pid, s(p.nome), { item: pid, component: cid, quantity: num(c.quantidade), loss: 0, manufacturingTime: 0 }, issues);
    }
  }
  // Ciclos entre as composições que seriam enviadas.
  const sent = new Map<string, string[]>();
  for (const r of ic.plan.records) sent.set(r.payload.item, [...(sent.get(r.payload.item) ?? []), r.payload.component]);
  const cyclic = new Set<string>();
  const visit = (n: string, stack: Set<string>, seen: Set<string>) => {
    if (stack.has(n)) { stack.forEach(x => cyclic.add(x)); return; }
    if (seen.has(n)) return; seen.add(n); stack.add(n);
    for (const m of sent.get(n) ?? []) visit(m, stack, seen);
    stack.delete(n);
  };
  const seenNodes = new Set<string>();
  for (const n of sent.keys()) visit(n, new Set(), seenNodes);
  for (const r of ic.plan.records) if (cyclic.has(r.payload.item)) r.issues.push({ code: 'COMPOSICAO_CICLICA', severity: 'erro', sourceId: r.sourceId, name: r.name, message: 'Composição circular (o item acaba sendo componente de si mesmo).' });
  if (mirrors) findings.push({ severity: 'aviso', title: 'Composições espelho peça ↔ garantia', count: mirrors, detail: `${mirrors} produtos têm como "composição" o seu par (ex.: "Aro 24" ↔ "Garantia: Aro 24"), um apontando para o outro. Isso é um vínculo operacional da Bling e formaria ciclos no Lagom; essas composições não são enviadas.` });
  ic.note({ code: 'SUBSTITUI_TUDO', severity: 'info', message: 'PUT /item-composition remove as composições antigas e grava a lista enviada.' });
  if (fisicos && options.compositions === 'virtual') ic.note({ code: 'ESTRUTURA_FISICA', severity: 'info', message: `${fisicos} estruturas com estoque físico não foram enviadas (opção "virtual").` });
  resources.push(ic.plan);

  /* 11. Grupo de cliente + 12. Cliente */
  const cg = builder('customer-group', 'Grupo de cliente', 'put-customer-group', 'CustomerGroupDTO', 11, `derivado (${options.customerGroupMode})`);
  const cu = builder('customer', 'Cliente', 'put-customer', 'CustomerDTO', 12, 'GET /contatos + GET /contatos/{id}');
  const groups = new Map<string, string>();
  for (const c of data.contatos) {
    const code = s(c.id); const nome = s(c.nome);
    if (options.customerScope === 'cliente' ? !isCustomer(c) : isSupplier(c) && !isCustomer(c)) { cu.skip(code, nome, options.customerScope === 'cliente' ? 'Contato não é do tipo Cliente.' : 'Contato só fornecedor.'); continue; }
    const d = data.contatoDetalhes.get(code);
    const issues: Issue[] = [];
    if (!d) issues.push({ code: 'DETALHE_AUSENTE', severity: 'erro', message: 'Detalhe do contato (endereço) ainda não carregado no snapshot.' });
    const end = d?.endereco?.geral ?? {};
    const uf = s(end.uf).toUpperCase(); const city = s(end.municipio);
    const paisNome = fold(s(d?.pais?.nome)).toLowerCase();
    const country = COUNTRY[paisNome] ?? (paisNome.length === 2 ? paisNome.toUpperCase() : '');
    if (d && !country) issues.push({ code: 'PAIS_DESCONHECIDO', severity: 'erro', field: 'country', message: `País "${s(d?.pais?.nome)}" sem código ISO de 2 letras mapeado.` });
    const tipoPessoa = s(d?.tipo) || (digits(c.numeroDocumento).length === 11 ? 'F' : 'J');
    const group = options.customerGroupMode === 'unico' ? 'BLING' : options.customerGroupMode === 'tipo-pessoa' ? (tipoPessoa === 'F' ? 'PF' : tipoPessoa === 'E' ? 'EX' : 'PJ') : (uf || 'SEM-UF');
    groups.set(group, options.customerGroupMode === 'unico' ? 'Clientes Bling' : options.customerGroupMode === 'tipo-pessoa' ? ({ PF: 'Pessoa física', PJ: 'Pessoa jurídica', EX: 'Estrangeiro' } as J)[group] : group);
    cu.add(code, code, nome, { code, name: nome, customerGroup: group, city, state: uf, country, active: s(c.situacao) !== 'I' }, issues);
  }
  for (const [code, name] of [...groups].sort()) cg.add(code, code, name, { code, name, billingTarget: options.customerGroupBillingTarget });
  resources.push(cg.plan, cu.plan);

  /* 13. Parâmetro filial × item ← estoque mínimo/máximo */
  const bip = builder('branch-item-parameter', 'Parâmetro filial/item', 'put-branch-item-parameter', 'BranchItemParameterDTO', 13, 'produto.estoque.minimo/maximo (detalhe)');
  if (options.sendBranchItemParameters && defaultBranch) {
    for (const r of it.plan.records) {
      const d = data.produtoDetalhes.get(r.code); const min = num(d?.estoque?.minimo); const max = num(d?.estoque?.maximo);
      if (min <= 0 && max <= 0) continue;
      const payload: J = { branch: defaultBranch, item: r.code };
      if (min > 0) payload.strategicStock = min;
      if (max > 0) payload.upperStockLimit = max;
      bip.add(`${defaultBranch}:${r.code}`, r.code, r.name, payload);
    }
    bip.note({ code: 'ESTOQUE_POR_PRODUTO', severity: 'info', message: 'Na Bling, mínimo/máximo são por produto (não por depósito): aplicados à filial padrão. Mínimo → estoque estratégico; máximo → limite superior.' });
  }
  resources.push(bip.plan);

  /* Validações cruzadas de referência */
  const brandCodes = new Set(bd.plan.records.map(r => r.code));
  const groupCodes = new Set(ig.plan.records.map(r => r.code));
  for (const r of it.plan.records) {
    if (r.payload.brand && !brandCodes.has(r.payload.brand)) r.issues.push({ code: 'REFERENCIA_INEXISTENTE', severity: 'erro', field: 'brand', sourceId: r.sourceId, name: r.name, message: `Marca ${r.payload.brand} não será enviada.` });
    if (r.payload.itemGroup && !groupCodes.has(r.payload.itemGroup) && r.payload.itemGroup !== '') r.issues.push({ code: 'REFERENCIA_INEXISTENTE', severity: 'erro', field: 'itemGroup', sourceId: r.sourceId, name: r.name, message: `Grupo ${r.payload.itemGroup} não será enviado.` });
  }
  for (const r of br.plan.records) if (!branchCodes.has(r.code)) r.issues.push({ code: 'REFERENCIA_INEXISTENTE', severity: 'erro', message: 'Filial inconsistente.' });

  /* Sem origem na Bling */
  const none = (resource: string, title: string, operationId: LagomOperationId, schema: string, order: number, message: string) => {
    const b = builder(resource, title, operationId, schema, order, '—'); b.note({ code: 'SEM_ORIGEM', severity: 'info', message }); resources.push(b.plan);
  };
  const custom = [...data.produtoDetalhes.values()].filter(d => (d.camposCustomizados ?? []).length).length;
  none('item-custom-attribute-option', 'Atributo personalizado (opções)', 'put-item-custom-attribute-option', 'ItemCustomAttributeOptionDTO', 14, custom ? `${custom} produtos têm campos customizados; mapeamento ainda não definido.` : 'Nenhum produto usa campos customizados na Bling.');
  none('item-custom-attribute-value', 'Atributo personalizado (valores)', 'put-item-custom-attribute-value', 'ItemCustomAttributeValueDTO', 15, 'Depende das opções de atributo acima.');
  none('substitute', 'Substituto', 'put-substitute', 'SubstituteDTO', 16, 'A Bling não tem cadastro de substitutos: manter no próprio Lagom.');
  none('previous-version', 'Versão anterior', 'put-previous-version', 'PreviousVersionDTO', 17, 'A Bling não tem relação de versão anterior: manter no próprio Lagom.');

  /* Constatações gerais */
  const warranty = data.produtos.filter(p => isWarranty(s(p.nome))).length;
  if (warranty) findings.push({ severity: 'aviso', title: 'Itens de garantia', count: warranty, detail: `${warranty} produtos "Garantia: …" são pares das peças, com estoque próprio. ${options.includeWarrantyItems ? 'Estão sendo enviados como itens; se as vendas em garantia não devem compor a previsão de demanda, desmarque nas opções ou trate na movimentação.' : 'Estão excluídos dos itens.'}` });
  if (withoutDetail) findings.push({ severity: 'erro', title: 'Snapshot incompleto', count: withoutDetail, detail: `${withoutDetail} produtos ainda sem detalhe (marca, unidade, categoria). Rode o snapshot até o fim antes de enviar.` });
  const unitList = [...units].map(([u, n]) => `${u} (${n})`).join(', ');
  if (units.size) findings.push({ severity: 'aviso', title: 'Unidades de medida precisam existir no Lagom', count: units.size, detail: `A API do Lagom não cadastra unidades ("Deve existir"). Unidades usadas: ${unitList}. Confirme que existem no Lagom com o mesmo nome ou ajuste o mapa de unidades.` });
  const detailed = data.produtos.filter(p => detail(p)).length;
  if (detailed) findings.push({ severity: 'info', title: 'Código de barras', detail: `${gtinOk} de ${detailed} produtos com GTIN válido${gtinInvalid ? `, ${gtinInvalid} com GTIN inválido` : ''}. O campo é obrigatório no Lagom; os demais usam ${options.barcodeFallback === 'none' ? 'nada (vão falhar)' : options.barcodeFallback === 'sku' ? 'o SKU' : 'o ID Bling'} como código interno.` });
  const noSupplier = it.plan.records.filter(r => !r.payload.mainSupplier).length;
  if (noSupplier) findings.push({ severity: 'info', title: 'Fornecedor principal', count: noSupplier, detail: `${noSupplier} itens sem fornecedor vinculado na Bling (campo opcional). "supplierCode" é obrigatório: ${options.supplierCodeFallback === 'sku' ? 'usa o SKU como código' : 'fica vazio e será rejeitado'}.` });
  if (!options.supplierFreight || !options.supplierPaymentTerm) findings.push({ severity: 'erro', title: 'Decisão pendente: padrões de fornecedor', detail: 'O Lagom exige frete e termo de pagamento padrão para cada fornecedor, e a Bling não tem esses dados. Defina os dois nas opções.' });

  resources.sort((a, b) => a.order - b.order);
  return { resources, findings };
}

/* --------------------------- relatório --------------------------- */
export interface ResourceSummary {
  resource: string; title: string; operation: string; schema: string; order: number; source: string;
  total: number; ready: number; withErrors: number; withWarnings: number; skipped: number;
  issues: { code: string; severity: Severity; message: string; field?: string; count: number; examples: { sourceId?: string; name?: string }[] }[];
  skippedReasons: { reason: string; count: number; examples: { sourceId: string; name: string }[] }[];
  notes: Issue[]; sample: J[];
}
export function summarize(plan: ResourcePlan): ResourceSummary {
  const issues = new Map<string, ResourceSummary['issues'][number]>();
  for (const r of plan.records) for (const i of r.issues) {
    const key = `${i.severity}|${i.code}|${i.field ?? ''}`;
    const entry = issues.get(key) ?? { code: i.code, severity: i.severity, message: i.message, field: i.field, count: 0, examples: [] };
    entry.count++; if (entry.examples.length < 5) entry.examples.push({ sourceId: i.sourceId, name: i.name });
    issues.set(key, entry);
  }
  const reasons = new Map<string, ResourceSummary['skippedReasons'][number]>();
  for (const k of plan.skipped) { const e = reasons.get(k.reason) ?? { reason: k.reason, count: 0, examples: [] }; e.count++; if (e.examples.length < 5) e.examples.push({ sourceId: k.sourceId, name: k.name }); reasons.set(k.reason, e); }
  const rank = { erro: 0, aviso: 1, info: 2 };
  return {
    resource: plan.resource, title: plan.title, operation: plan.operationId, schema: plan.schema, order: plan.order, source: plan.source,
    total: plan.records.length,
    ready: plan.records.filter(r => !r.issues.some(i => i.severity === 'erro')).length,
    withErrors: plan.records.filter(r => r.issues.some(i => i.severity === 'erro')).length,
    withWarnings: plan.records.filter(r => r.issues.some(i => i.severity === 'aviso')).length,
    skipped: plan.skipped.length,
    issues: [...issues.values()].sort((a, b) => rank[a.severity] - rank[b.severity] || b.count - a.count),
    skippedReasons: [...reasons.values()].sort((a, b) => b.count - a.count),
    notes: plan.notes, sample: plan.records.slice(0, 3).map(r => r.payload),
  };
}
