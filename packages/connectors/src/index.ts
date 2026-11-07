import type { IntegrationStatus } from '@lagom-bling/domain';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type SystemName = 'LAGOM' | 'BLING';

export interface ApiOperationContract {
  system: SystemName;
  entity: string;
  method: HttpMethod | null;
  path: string | null;
  status: IntegrationStatus | 'BLOCKED';
  note: string;
}

/** Evidence register only. No HTTP request is issued by this package yet. */
export const verifiedApiOperations: readonly ApiOperationContract[] = [
  { system: 'LAGOM', entity: 'login', method: 'PUT', path: '/login', status: 'CONFIRMED', note: 'organization + token; contract observed in beta OAS.' },
  { system: 'LAGOM', entity: 'token refresh', method: 'POST', path: '/login/refresh', status: 'CONFIRMED', note: 'Refresh token exchange; beta OAS.' },
  { system: 'LAGOM', entity: 'eligible purchase pre-orders', method: 'GET', path: '/pre-purchase-order', status: 'CONFIRMED', note: 'No pagination or filters documented.' },
  { system: 'LAGOM', entity: 'purchase-order query', method: 'POST', path: '/purchase-order', status: 'CONFIRMED', note: 'Filter body; code operators = and like evidenced.' },
  { system: 'LAGOM', entity: 'transfer suggestions', method: 'GET', path: '/transfer-suggestion', status: 'CONFIRMED', note: 'No pagination or filters documented.' },
  { system: 'LAGOM', entity: 'purchase-order upsert', method: 'PUT', path: '/purchase-order', status: 'CONFIRMED', note: 'Batch PurchaseOrderDTO; business mapping still pending.' },
  { system: 'LAGOM', entity: 'transfer upsert', method: 'PUT', path: '/transfer', status: 'CONFIRMED', note: 'Lagom operation only; does not establish Bling support.' },
  { system: 'BLING', entity: 'purchase-order create', method: 'POST', path: '/pedidos/compras', status: 'CONFIRMED', note: 'OpenAPI documented; no live write performed.' },
  { system: 'BLING', entity: 'purchase-order list', method: 'GET', path: '/pedidos/compras', status: 'CONFIRMED', note: 'Pagination and documented filters available.' },
  { system: 'BLING', entity: 'product list', method: 'GET', path: '/produtos', status: 'CONFIRMED', note: 'Documented alteration-date filters.' },
  { system: 'BLING', entity: 'contacts list', method: 'GET', path: '/contatos', status: 'CONFIRMED', note: 'Documented alteration-date filters.' },
  { system: 'BLING', entity: 'native stock transfer', method: null, path: null, status: 'BLOCKED', note: 'No official transfer endpoint confirmed; do not emulate with stock entries/exits.' },
];

export interface PurchaseCandidate {
  sourceId: string;
  companyId: string;
  payloadHash: string;
}

export interface LagomReadPort {
  listEligiblePurchasePreOrders(): Promise<readonly PurchaseCandidate[]>;
  listTransferSuggestions(): Promise<readonly PurchaseCandidate[]>;
}

export interface BlingReadPort {
  findPurchaseOrderByExternalReference(reference: string): Promise<{ id: string } | null>;
}

export class ExternalWriteDisabledError extends Error {
  constructor(operation: string) {
    super(`Escrita externa desactivada nesta fase: ${operation}`);
    this.name = 'ExternalWriteDisabledError';
  }
}

export function requireWriteApproval(writeEnabled: boolean, operation: string): void {
  if (!writeEnabled) throw new ExternalWriteDisabledError(operation);
}
