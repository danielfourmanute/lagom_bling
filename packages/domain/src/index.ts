import { createHash } from 'node:crypto';

export const integrationStatuses = [
  'PENDING',
  'VALIDATING',
  'PROCESSING',
  'SENT',
  'CONFIRMED',
  'REJECTED',
  'FAILED',
  'UNKNOWN',
  'RECONCILING',
  'REPROCESSED',
] as const;

export type IntegrationStatus = (typeof integrationStatuses)[number];

export type IdempotencyInput = {
  tenantId: string;
  direction: 'LAGOM_TO_BLING' | 'BLING_TO_LAGOM';
  documentType: string;
  sourceDocumentId: string;
  versionOrAction: string;
};

export function createIdempotencyKey(input: IdempotencyInput): string {
  const parts = [
    input.tenantId,
    input.direction,
    input.documentType,
    input.sourceDocumentId,
    input.versionOrAction,
  ];
  if (parts.some((part) => part.trim().length === 0)) {
    throw new Error('Todos os componentes da chave de idempotência são obrigatórios.');
  }
  return createHash('sha256').update(JSON.stringify(parts), 'utf8').digest('hex');
}

const transitions: Record<IntegrationStatus, readonly IntegrationStatus[]> = {
  PENDING: ['VALIDATING', 'FAILED'],
  VALIDATING: ['PROCESSING', 'REJECTED', 'FAILED'],
  PROCESSING: ['SENT', 'UNKNOWN', 'FAILED', 'REJECTED'],
  SENT: ['CONFIRMED', 'UNKNOWN', 'RECONCILING'],
  CONFIRMED: [],
  REJECTED: ['PENDING', 'REPROCESSED'],
  FAILED: ['PENDING', 'RECONCILING', 'REPROCESSED'],
  UNKNOWN: ['RECONCILING'],
  RECONCILING: ['CONFIRMED', 'FAILED', 'REPROCESSED', 'UNKNOWN'],
  REPROCESSED: ['PENDING'],
};

export function canTransition(from: IntegrationStatus, to: IntegrationStatus): boolean {
  return transitions[from].includes(to);
}

export function assertTransition(from: IntegrationStatus, to: IntegrationStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Transição de integração inválida: ${from} → ${to}`);
  }
}
