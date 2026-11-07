import type { IntegrationStatus } from '@lagom-bling/domain';

export interface IntegrationTransactionRecord {
  id: string;
  tenantId: string;
  direction: 'LAGOM_TO_BLING' | 'BLING_TO_LAGOM';
  documentType: string;
  sourceDocumentId: string;
  destinationDocumentId?: string;
  idempotencyKey: string;
  status: IntegrationStatus;
  payloadHash?: string;
}

/** Persistence port; a Prisma-backed implementation is a later phase. */
export interface IntegrationTransactionRepository {
  findByIdempotencyKey(tenantId: string, key: string): Promise<IntegrationTransactionRecord | null>;
  createPending(record: Omit<IntegrationTransactionRecord, 'id' | 'status'>): Promise<IntegrationTransactionRecord>;
  transition(id: string, next: IntegrationStatus, evidence?: { destinationDocumentId?: string }): Promise<IntegrationTransactionRecord>;
}

export interface SyncCheckpointRepository {
  read(direction: IntegrationTransactionRecord['direction'], tenantId: string, resource: string): Promise<string | null>;
  advance(direction: IntegrationTransactionRecord['direction'], tenantId: string, resource: string, value: string): Promise<void>;
}
