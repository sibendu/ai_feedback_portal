CREATE TABLE "feedback_batches" (
  "id" TEXT NOT NULL,
  "uploadedById" TEXT NOT NULL,
  "sourceFileName" TEXT NOT NULL,
  "totalRows" INTEGER NOT NULL,
  "createdCount" INTEGER NOT NULL DEFAULT 0,
  "emailSentCount" INTEGER NOT NULL DEFAULT 0,
  "emailFailedCount" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'created',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "feedback_batches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "feedback" (
  "id" TEXT NOT NULL,
  "batchId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "productCode" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  "purchaseDate" TIMESTAMP(3) NOT NULL,
  "linkIdentifier" TEXT NOT NULL,
  "emailStatus" TEXT NOT NULL DEFAULT 'pending',
  "emailAttemptedAt" TIMESTAMP(3),
  "emailSentAt" TIMESTAMP(3),
  "emailError" TEXT,
  "rating" INTEGER,
  "feedbackMessage" TEXT,
  "submittedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "feedback_batches_uploadedById_createdAt_idx" ON "feedback_batches"("uploadedById", "createdAt");
CREATE UNIQUE INDEX "feedback_linkIdentifier_key" ON "feedback"("linkIdentifier");
CREATE INDEX "feedback_batchId_idx" ON "feedback"("batchId");
CREATE INDEX "feedback_email_idx" ON "feedback"("email");

ALTER TABLE "feedback_batches" ADD CONSTRAINT "feedback_batches_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "feedback_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
