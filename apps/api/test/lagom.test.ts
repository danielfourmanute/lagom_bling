import { describe, expect, it, vi } from 'vitest';
import { brandCode, buildPlan, defaultMappingOptions, summarize, validateAgainstSchema, validGtin, type BlingData } from '../src/bling-lagom-mapping.js';
import { loadConfig } from '../src/config.js';
import { lagomOperations } from '../src/generated/lagom-catalog.js';
import { LagomClient } from '../src/lagom.js';
import { outcome } from '../src/lagom-load.js';

const jwt = (expSeconds: number) => `h.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expSeconds })).toString('base64url')}.s`;
const tokens = (access = 3600, refresh = 86400) => new Response(JSON.stringify({ accessToken: jwt(access), refreshToken: jwt(refresh) }));
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const config = (extra: Record<string, string> = {}) => loadConfig({ NODE_ENV: 'test', LAGOM_ORGANIZATION: 'org', LAGOM_TOKEN: 'tok', ...extra });

describe('Catálogo Lagom', () => {
  it('cobre todas as operações e classifica escrita × leitura', () => {
    expect(lagomOperations.length).toBe(35);
    expect(lagomOperations.find(o => o.id === 'put-item')).toMatchObject({ method: 'PUT', kind: 'cadastro', mutating: true, body: { array: true, schema: 'ItemDTO' } });
    expect(lagomOperations.find(o => o.id === 'post-purchase-order')).toMatchObject({ kind: 'consulta', mutating: false });
    expect(lagomOperations.filter(o => !o.mutating && o.kind !== 'auth').map(o => o.id).sort()).toEqual(['get-pre-purchase-order', 'get-transfer-suggestion', 'post-branch-item-parameter-get', 'post-daily-data-dfu', 'post-forecast-monthly', 'post-ideal-stock-get', 'post-purchase-order']);
  });
});

describe('LagomClient', () => {
  it('faz login uma vez, reutiliza o JWT e envia Bearer', async () => {
    const http = vi.fn<typeof fetch>().mockResolvedValueOnce(tokens()).mockImplementation(async () => json([]));
    const client = new LagomClient(config(), http);
    await Promise.all([client.call('get-transfer-suggestion', undefined), client.call('get-pre-purchase-order', undefined)]);
    const login = http.mock.calls.filter(c => String(c[0]).endsWith('/login'));
    expect(login).toHaveLength(1);
    expect(JSON.parse(String(login[0]![1]!.body))).toEqual({ organization: 'org', token: 'tok' });
    expect((http.mock.calls[1]![1]!.headers as Record<string, string>).Authorization).toMatch(/^Bearer h\./);
  });
  it('renova pelo refresh token quando o access token vai expirar', async () => {
    const http = vi.fn<typeof fetch>().mockResolvedValueOnce(tokens(60)).mockResolvedValueOnce(json([])).mockResolvedValueOnce(tokens()).mockResolvedValueOnce(json([]));
    const client = new LagomClient(config(), http);
    await client.call('get-transfer-suggestion', undefined);
    await client.call('get-transfer-suggestion', undefined);
    expect(http.mock.calls.map(c => String(c[0]).replace(/^https:\/\/[^/]+/, ''))).toEqual(['/login', '/transfer-suggestion', '/login/refresh', '/transfer-suggestion']);
  });
  it('repete uma vez após 401 com novo token', async () => {
    const http = vi.fn<typeof fetch>().mockResolvedValueOnce(tokens()).mockResolvedValueOnce(json({}, 401)).mockResolvedValueOnce(tokens()).mockResolvedValueOnce(json([{ code: 'x' }]));
    const client = new LagomClient(config(), http);
    await expect(client.call('get-pre-purchase-order', undefined)).resolves.toEqual([{ code: 'x' }]);
  });
  it('bloqueia escrita sem LAGOM_WRITE_ENABLED, sem tocar a rede', async () => {
    const http = vi.fn<typeof fetch>();
    await expect(new LagomClient(config(), http).call('put-brand', [{ code: 'A', name: 'A', active: true }])).rejects.toMatchObject({ code: 'LAGOM_WRITE_DISABLED', status: 403 });
    expect(http).not.toHaveBeenCalled();
  });
  it('permite escrita quando liberada e repassa o erro do Lagom', async () => {
    const http = vi.fn<typeof fetch>().mockResolvedValueOnce(tokens()).mockResolvedValueOnce(json({ error: 'Bad Request', message: 'x', statusCode: 400 }, 400));
    await expect(new LagomClient(config({ LAGOM_WRITE_ENABLED: 'true' }), http).call('put-brand', [])).rejects.toMatchObject({ code: 'LAGOM_BAD_REQUEST', details: { lagomError: { message: 'x' } } });
  });
  it('credenciais inválidas viram LAGOM_CREDENTIALS_INVALID', async () => {
    const http = vi.fn<typeof fetch>().mockResolvedValueOnce(json({}, 401));
    await expect(new LagomClient(config(), http).test()).rejects.toMatchObject({ code: 'LAGOM_CREDENTIALS_INVALID' });
  });
});

describe('Mapeamento Bling → Lagom', () => {
  it('valida GTIN e normaliza marcas', () => {
    expect(validGtin('7891000315507')).toBe(true);
    expect(validGtin('7891000315508')).toBe(false);
    expect(validGtin('1528')).toBe(false);
    expect(brandCode(' Zümpy  Motors ')).toBe('ZUMPY-MOTORS');
  });
  it('valida payload contra o DTO do OpenAPI', () => {
    expect(validateAgainstSchema('CustomerDTO', { code: '1', name: 'x', customerGroup: 'SP', city: 'X', state: 'SPX', country: 'BR', active: true })).toEqual([expect.objectContaining({ code: 'TAMANHO_EXCEDIDO', field: 'state' })]);
    expect(validateAgainstSchema('BrandDTO', { code: '1', name: '', extra: 1 }).map(i => i.code).sort()).toEqual(['CAMPO_DESCONHECIDO', 'OBRIGATORIO_AUSENTE', 'OBRIGATORIO_VAZIO']);
  });

  const produto = (id: number, extra: Record<string, unknown> = {}) => ({ id, nome: `Peça ${id}`, codigo: `SKU${id}`, tipo: 'P', situacao: 'A', formato: 'S', ...extra });
  const detalhe = (id: number, extra: Record<string, unknown> = {}) => ({ id, marca: 'Veloster', unidade: 'UN', gtin: '', categoria: { id: 10 }, fornecedor: { contato: { id: 0 }, codigo: '' }, estoque: { minimo: 0, maximo: 0 }, ...extra });
  const base = (): BlingData => ({
    empresa: { nome: 'Empresa' }, depositos: [{ id: 1, descricao: 'Geral', situacao: 1, padrao: true }],
    categorias: [{ id: 10, descricao: 'Peças', categoriaPai: { id: 0 } }, { id: 11, descricao: 'Sub', categoriaPai: { id: 10 } }],
    gruposProdutos: [], formas: [{ id: 5, descricao: 'PIX' }],
    contatos: [{ id: 7, nome: 'Fornecedor X', situacao: 'A', numeroDocumento: '39655400000170', _tipos: ['Fornecedor'] }, { id: 8, nome: 'Cliente Y', situacao: 'A', numeroDocumento: '12345678901', _tipos: ['Cliente'] }],
    contatoDetalhes: new Map([['7', { email: 'f@x.com' }], ['8', { tipo: 'F', endereco: { geral: { municipio: 'Recife', uf: 'pe' } }, pais: { nome: '' } }]]),
    produtos: [], produtoDetalhes: new Map(), produtoFornecedores: [],
  });

  it('gera itens, marcas e grupos coerentes e pula pais de variação', () => {
    const data = base();
    data.produtos = [produto(1), produto(2, { formato: 'V' }), produto(3, { idProdutoPai: 2, formato: 'S' })];
    data.produtoDetalhes = new Map([['1', detalhe(1, { gtin: '7891000315507', estoque: { minimo: 5, maximo: 0 } })], ['2', detalhe(2)], ['3', detalhe(3, { marca: '', categoria: { id: 0 }, variacao: { produtoPai: { id: 2 } } })]]);
    const plan = buildPlan(data);
    const item = plan.resources.find(r => r.resource === 'item')!;
    expect(item.records.map(r => r.code)).toEqual(['1', '3']);
    expect(item.skipped).toHaveLength(1);
    expect(item.records[0]!.payload).toMatchObject({ barcode: '7891000315507', brand: 'VELOSTER', itemGroup: '10', measurementUnity: 'UN', supplierCode: 'SKU1' });
    // Variação herda marca e categoria do pai.
    expect(item.records[1]!.payload).toMatchObject({ brand: 'VELOSTER', itemGroup: '10', barcode: 'SKU3' });
    expect(item.records.every(r => !r.issues.some(i => i.severity === 'erro'))).toBe(true);
    const groups = plan.resources.find(r => r.resource === 'item-group')!;
    expect(groups.records.map(r => r.payload)).toEqual([{ code: '10', name: 'Peças', father: null }, { code: '11', name: 'Sub', father: '10' }]);
    expect(plan.resources.find(r => r.resource === 'branch-item-parameter')!.records[0]!.payload).toEqual({ branch: '1', item: '1', strategicStock: 5 });
    expect(plan.resources.find(r => r.resource === 'customer')!.records[0]!.payload).toEqual({ code: '8', name: 'Cliente Y', customerGroup: 'PE', city: 'Recife', state: 'PE', country: 'BR', active: true });
  });

  it('fornecedor fica bloqueado até definir frete e termo; depois passa', () => {
    const plan = buildPlan(base());
    const sup = summarize(plan.resources.find(r => r.resource === 'supplier')!);
    expect(sup).toMatchObject({ total: 1, ready: 0 });
    expect(sup.issues.map(i => i.code).sort()).toEqual(['DECISAO_FRETE', 'DECISAO_TERMO_PAGAMENTO']);
    const ok = buildPlan(base(), { ...defaultMappingOptions(), supplierFreight: 'CIF', supplierPaymentTerm: '5' });
    expect(summarize(ok.resources.find(r => r.resource === 'supplier')!)).toMatchObject({ ready: 1 });
  });

  it('não envia composição espelho (peça ↔ garantia) e detecta ciclos', () => {
    const data = base();
    data.produtos = [produto(1, { formato: 'E' }), produto(2, { formato: 'E', nome: 'Garantia: Peça 1' }), produto(3, { formato: 'E' }), produto(4, { formato: 'E' }), produto(5, { formato: 'E' })];
    const est = (tipo: string, ...ids: number[]) => ({ estrutura: { tipoEstoque: tipo, componentes: ids.map(i => ({ produto: { id: i }, quantidade: 1 })) } });
    data.produtoDetalhes = new Map([
      ['1', detalhe(1, est('F', 2))], ['2', detalhe(2, est('F', 1))], // espelho
      ['3', detalhe(3, est('V', 4, 5))], ['4', detalhe(4, est('V', 5))], ['5', detalhe(5, est('V', 3))], // ciclo 3→4→5→3
    ]);
    const plan = buildPlan(data, { ...defaultMappingOptions(), compositions: 'all' });
    const comp = plan.resources.find(r => r.resource === 'item-composition')!;
    expect(comp.skipped.map(s => s.sourceId).sort()).toEqual(['1', '2']);
    expect(comp.records.length).toBe(4);
    expect(comp.records.every(r => r.issues.some(i => i.code === 'COMPOSICAO_CICLICA'))).toBe(true);
    expect(plan.findings.some(f => f.title.includes('espelho') && f.count === 2)).toBe(true);
  });

  it('produto sem detalhe no snapshot é bloqueado', () => {
    const data = base();
    data.produtos = [produto(1)];
    const item = summarize(buildPlan(data).resources.find(r => r.resource === 'item')!);
    expect(item).toMatchObject({ total: 1, ready: 0 });
    expect(item.issues[0]!.code).toBe('DETALHE_AUSENTE');
  });

  it('composição cujo componente está bloqueado (sem detalhe) também fica bloqueada', () => {
    const data = base();
    data.produtos = [produto(1, { formato: 'E' }), produto(2)];
    data.produtoDetalhes = new Map([['1', detalhe(1, { estrutura: { tipoEstoque: 'V', componentes: [{ produto: { id: 2 }, quantidade: 1 }] } })]]);
    const comp = buildPlan(data).resources.find(r => r.resource === 'item-composition')!;
    expect(comp.records).toHaveLength(1);
    expect(comp.records[0]!.issues.some(i => i.code === 'REFERENCIA_INEXISTENTE' && i.field === 'component')).toBe(true);
  });
});

describe('Resposta do Lagom na carga', () => {
  it('casa erros por código (item-componente) mesmo fora de ordem e sucessos com code "0"', () => {
    const batch = [{ code: '10:11' }, { code: '20:21' }, { code: '30:31' }];
    const res = [{ status: 400, message: 'Componente não existe.', code: '20-21' }, { status: 200, code: '0' }, { status: 200, code: '0' }];
    expect(outcome(res, batch).map(o => o.ok)).toEqual([true, false, true]);
  });

  it('sem identificação: casa pela posição; OkResponse único vale para o lote', () => {
    expect(outcome([{ status: 200, code: '0' }, { status: 400, code: '0' }], [{ code: 'a' }, { code: 'b' }]).map(o => o.ok)).toEqual([true, false]);
    expect(outcome({ status: 200 }, [{ code: 'a' }, { code: 'b' }]).map(o => o.ok)).toEqual([true, true]);
  });
});
