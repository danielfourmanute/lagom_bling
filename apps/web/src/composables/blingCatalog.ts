import { blingEndpoints, type BlingEndpoint, type BlingParam } from '../generated/bling-get-catalog';
import { availability, BlingApiError, blingGet } from './bling';

export { blingEndpoints };
export type { BlingEndpoint, BlingParam };

export const endpointById = new Map(blingEndpoints.map(e => [e.id, e]));

export interface BlingGroup { group: string; tag: string; endpoints: BlingEndpoint[] }
export const blingGroups: BlingGroup[] = [...blingEndpoints.reduce((map, e) => {
  if (!map.has(e.group)) map.set(e.group, { group: e.group, tag: e.tag, endpoints: [] });
  map.get(e.group)!.endpoints.push(e);
  return map;
}, new Map<string, BlingGroup>()).values()];

/** Opções legíveis: usa o enum e, quando existir, a legenda "`X` Rótulo" da descrição. */
export function paramOptions(param: BlingParam): { value: string; label: string }[] {
  const labels = new Map<string, string>();
  for (const line of param.description?.split('\n') ?? []) {
    const m = line.match(/^`([^`]+)`\s*[-–:]?\s*(.+)$/);
    if (m) labels.set(m[1]!, m[2]!);
  }
  const values = param.enum?.map(String) ?? [...labels.keys()];
  return values.map(value => ({ value, label: labels.has(value) ? `${value} · ${labels.get(value)}` : value }));
}
/** Descrição sem as linhas de legenda já mostradas como opções. */
export function paramHelp(param: BlingParam) {
  return (param.description ?? '').split('\n').filter(l => !/^`[^`]+`/.test(l)).join(' ');
}

/** Endpoint pode ser verificado sem dados informados pelo usuário. */
export const probeable = (e: BlingEndpoint) => !e.params.some(p => p.required);

/**
 * Verifica, um a um (respeitando a quota da Bling), quais endpoints a conta autorizada consegue ler.
 * 403 indica escopo não concedido à aplicação.
 */
export async function probeAvailability(endpoints = blingEndpoints, onProgress?: (done: number, total: number) => void, signal?: { cancelled: boolean }) {
  const targets = endpoints.filter(probeable);
  for (const e of endpoints) if (!probeable(e)) availability[e.id] = { state: 'needs-input' };
  let done = 0;
  for (const e of targets) {
    if (signal?.cancelled) break;
    availability[e.id] = { state: 'checking' };
    try {
      await blingGet(e.id, new URLSearchParams(e.paginated && e.params.some(p => p.name === 'limite') ? { pagina: '1', limite: '1' } : {}));
      availability[e.id] = { state: 'ok' };
    } catch (error) {
      if (error instanceof BlingApiError && (error.code === 'UNAUTHORIZED' || error.code === 'RECONNECT_REQUIRED' || error.code === 'NETWORK')) {
        delete availability[e.id];
        throw error;
      }
      // 404 numa listagem significa "sem registros", não falta de permissão.
      if (error instanceof BlingApiError && error.status === 404) availability[e.id] = { state: 'ok', detail: 'Sem registros' };
      else availability[e.id] = { state: error instanceof BlingApiError && error.status === 403 ? 'forbidden' : 'error', detail: error instanceof BlingApiError ? error.detail ?? error.message : String(error) };
    }
    onProgress?.(++done, targets.length);
  }
  // Detalhes herdam o resultado da listagem do mesmo recurso.
  for (const e of endpoints) {
    const list = blingEndpoints.find(l => l.detailId === e.id);
    if (list && availability[list.id] && availability[e.id]?.state === 'needs-input') {
      const s = availability[list.id]!.state;
      if (s === 'ok' || s === 'forbidden') availability[e.id] = { state: s, detail: 'Inferido pela listagem' };
    }
  }
}

export const availabilityLabel: Record<string, string> = {
  ok: 'Disponível', forbidden: 'Sem permissão', error: 'Erro', checking: 'Verificando…', 'needs-input': 'Requer parâmetros',
};
