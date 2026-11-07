-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "DataSystem" AS ENUM ('LAGOM', 'BLING');

-- CreateEnum
CREATE TYPE "IntegrationDirection" AS ENUM ('LAGOM_TO_BLING', 'BLING_TO_LAGOM');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('PENDING', 'VALIDATING', 'PROCESSING', 'SENT', 'CONFIRMED', 'REJECTED', 'FAILED', 'UNKNOWN', 'RECONCILING', 'REPROCESSED');

-- CreateEnum
CREATE TYPE "DeadLetterStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISCARDED');

-- CreateEnum
CREATE TYPE "OAuthConnectionStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'REVOKED', 'ERROR');

-- CreateTable
CREATE TABLE "integration_configurations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "direction" "IntegrationDirection" NOT NULL,
    "resource" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "dryRun" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "integration_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_runs" (
    "id" UUID NOT NULL,
    "jobName" TEXT NOT NULL,
    "direction" "IntegrationDirection" NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'PENDING',
    "correlationId" UUID,
    "startedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMPTZ(6),
    "durationMs" INTEGER,
    "itemsRead" INTEGER NOT NULL DEFAULT 0,
    "itemsConfirmed" INTEGER NOT NULL DEFAULT 0,
    "itemsFailed" INTEGER NOT NULL DEFAULT 0,
    "checkpointBefore" TEXT,
    "checkpointAfter" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,

    CONSTRAINT "integration_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_transactions" (
    "id" UUID NOT NULL,
    "integrationRunId" UUID,
    "correlationId" UUID NOT NULL,
    "tenantId" TEXT NOT NULL,
    "direction" "IntegrationDirection" NOT NULL,
    "sourceSystem" "DataSystem" NOT NULL,
    "destinationSystem" "DataSystem" NOT NULL,
    "documentType" TEXT NOT NULL,
    "sourceDocumentId" TEXT NOT NULL,
    "destinationDocumentId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "payloadHash" TEXT,
    "sanitizedPayload" JSONB,
    "startedAt" TIMESTAMPTZ(6),
    "finishedAt" TIMESTAMPTZ(6),
    "durationMs" INTEGER,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "integration_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_attempts" (
    "id" UUID NOT NULL,
    "integrationTransactionId" UUID NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "method" TEXT,
    "endpoint" TEXT,
    "httpStatus" INTEGER,
    "durationMs" INTEGER,
    "requestSummary" JSONB,
    "responseSummary" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMPTZ(6),

    CONSTRAINT "integration_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_links" (
    "id" UUID NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "sourceSystem" "DataSystem" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "destinationSystem" "DataSystem" NOT NULL,
    "destinationId" TEXT NOT NULL,
    "canonicalSource" "DataSystem",
    "sourceVersion" TEXT,
    "recordHash" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "entity_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_checkpoints" (
    "id" UUID NOT NULL,
    "direction" "IntegrationDirection" NOT NULL,
    "tenantId" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "cursor" TEXT,
    "watermarkAt" TIMESTAMPTZ(6),
    "lastSuccessfulRunId" UUID,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sync_checkpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_results" (
    "id" UUID NOT NULL,
    "integrationRunId" UUID,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "sourceDocumentId" TEXT,
    "destinationDocumentId" TEXT,
    "status" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reconciliation_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_events" (
    "id" UUID NOT NULL,
    "integrationRunId" UUID,
    "integrationTransactionId" UUID,
    "correlationId" UUID,
    "actor" TEXT,
    "action" TEXT NOT NULL,
    "status" "IntegrationStatus",
    "details" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_dead_letters" (
    "id" UUID NOT NULL,
    "integrationTransactionId" UUID NOT NULL,
    "status" "DeadLetterStatus" NOT NULL DEFAULT 'OPEN',
    "failureCategory" TEXT NOT NULL,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "assignedTo" TEXT,
    "resolution" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "integration_dead_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_connections" (
    "id" UUID NOT NULL,
    "provider" "DataSystem" NOT NULL,
    "accountKey" TEXT NOT NULL,
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "accessTokenCiphertext" TEXT,
    "refreshTokenCiphertext" TEXT,
    "accessTokenExpiresAt" TIMESTAMPTZ(6),
    "status" "OAuthConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "lastRefreshAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "oauth_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_actions" (
    "id" UUID NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "justification" TEXT,
    "outcome" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "integration_configurations_direction_resource_key" ON "integration_configurations"("direction", "resource");

-- CreateIndex
CREATE INDEX "integration_runs_jobName_status_startedAt_idx" ON "integration_runs"("jobName", "status", "startedAt");

-- CreateIndex
CREATE INDEX "integration_runs_direction_startedAt_idx" ON "integration_runs"("direction", "startedAt");

-- CreateIndex
CREATE INDEX "integration_runs_correlationId_idx" ON "integration_runs"("correlationId");

-- CreateIndex
CREATE INDEX "integration_transactions_status_createdAt_idx" ON "integration_transactions"("status", "createdAt");

-- CreateIndex
CREATE INDEX "integration_transactions_sourceSystem_destinationSystem_doc_idx" ON "integration_transactions"("sourceSystem", "destinationSystem", "documentType", "sourceDocumentId");

-- CreateIndex
CREATE INDEX "integration_transactions_correlationId_idx" ON "integration_transactions"("correlationId");

-- CreateIndex
CREATE INDEX "integration_transactions_integrationRunId_idx" ON "integration_transactions"("integrationRunId");

-- CreateIndex
CREATE UNIQUE INDEX "integration_transactions_tenantId_direction_documentType_id_key" ON "integration_transactions"("tenantId", "direction", "documentType", "idempotencyKey");

-- CreateIndex
CREATE INDEX "integration_attempts_startedAt_idx" ON "integration_attempts"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "integration_attempts_integrationTransactionId_attemptNumber_key" ON "integration_attempts"("integrationTransactionId", "attemptNumber");

-- CreateIndex
CREATE INDEX "entity_links_tenantId_entityType_destinationSystem_destinat_idx" ON "entity_links"("tenantId", "entityType", "destinationSystem", "destinationId");

-- CreateIndex
CREATE UNIQUE INDEX "entity_links_tenantId_entityType_sourceSystem_sourceId_dest_key" ON "entity_links"("tenantId", "entityType", "sourceSystem", "sourceId", "destinationSystem");

-- CreateIndex
CREATE INDEX "sync_checkpoints_watermarkAt_idx" ON "sync_checkpoints"("watermarkAt");

-- CreateIndex
CREATE UNIQUE INDEX "sync_checkpoints_direction_tenantId_resource_key" ON "sync_checkpoints"("direction", "tenantId", "resource");

-- CreateIndex
CREATE INDEX "reconciliation_results_tenantId_entityType_status_createdAt_idx" ON "reconciliation_results"("tenantId", "entityType", "status", "createdAt");

-- CreateIndex
CREATE INDEX "reconciliation_results_integrationRunId_idx" ON "reconciliation_results"("integrationRunId");

-- CreateIndex
CREATE INDEX "integration_events_correlationId_createdAt_idx" ON "integration_events"("correlationId", "createdAt");

-- CreateIndex
CREATE INDEX "integration_events_integrationTransactionId_createdAt_idx" ON "integration_events"("integrationTransactionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "integration_dead_letters_integrationTransactionId_key" ON "integration_dead_letters"("integrationTransactionId");

-- CreateIndex
CREATE INDEX "integration_dead_letters_status_createdAt_idx" ON "integration_dead_letters"("status", "createdAt");

-- CreateIndex
CREATE INDEX "oauth_connections_status_accessTokenExpiresAt_idx" ON "oauth_connections"("status", "accessTokenExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_connections_provider_accountKey_key" ON "oauth_connections"("provider", "accountKey");

-- CreateIndex
CREATE INDEX "audit_actions_actorId_createdAt_idx" ON "audit_actions"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_actions_targetType_targetId_createdAt_idx" ON "audit_actions"("targetType", "targetId", "createdAt");

-- AddForeignKey
ALTER TABLE "integration_transactions" ADD CONSTRAINT "integration_transactions_integrationRunId_fkey" FOREIGN KEY ("integrationRunId") REFERENCES "integration_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_attempts" ADD CONSTRAINT "integration_attempts_integrationTransactionId_fkey" FOREIGN KEY ("integrationTransactionId") REFERENCES "integration_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_results" ADD CONSTRAINT "reconciliation_results_integrationRunId_fkey" FOREIGN KEY ("integrationRunId") REFERENCES "integration_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_events" ADD CONSTRAINT "integration_events_integrationRunId_fkey" FOREIGN KEY ("integrationRunId") REFERENCES "integration_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_events" ADD CONSTRAINT "integration_events_integrationTransactionId_fkey" FOREIGN KEY ("integrationTransactionId") REFERENCES "integration_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_dead_letters" ADD CONSTRAINT "integration_dead_letters_integrationTransactionId_fkey" FOREIGN KEY ("integrationTransactionId") REFERENCES "integration_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

