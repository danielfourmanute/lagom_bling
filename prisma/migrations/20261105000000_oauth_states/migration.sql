CREATE TABLE "oauth_states" (
  "stateHash" TEXT NOT NULL PRIMARY KEY,
  "sessionHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ(6) NOT NULL
);
CREATE INDEX "oauth_states_expiresAt_idx" ON "oauth_states"("expiresAt");
