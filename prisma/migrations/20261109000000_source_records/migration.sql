-- CreateTable
CREATE TABLE "source_records" (
    "system" "DataSystem" NOT NULL,
    "resource" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "fetchedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_records_pkey" PRIMARY KEY ("system","resource","externalId")
);

-- CreateIndex
CREATE INDEX "source_records_system_resource_fetchedAt_idx" ON "source_records"("system", "resource", "fetchedAt");
