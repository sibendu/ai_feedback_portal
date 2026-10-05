import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../../../${path}`, import.meta.url), "utf8");

test("feedback batch and feedback records are modeled with traceable unique links", () => {
  const schema = read("prisma/schema.prisma");
  const migration = read("prisma/migrations/20260915100000_feedback_request_batch_upload/migration.sql");

  assert.match(schema, /model FeedbackBatch \{/);
  assert.match(schema, /uploadedBy\s+User\s+@relation\(fields: \[uploadedById\], references: \[id\], onDelete: Cascade\)/);
  assert.match(schema, /feedbacks\s+Feedback\[\]/);
  assert.match(schema, /model Feedback \{/);
  assert.match(schema, /email\s+String/);
  assert.match(schema, /type\s+String/);
  assert.match(schema, /productCode\s+String/);
  assert.match(schema, /productName\s+String/);
  assert.match(schema, /purchaseDate\s+DateTime/);
  assert.match(schema, /linkIdentifier\s+String\s+@unique/);
  assert.match(schema, /emailStatus\s+String\s+@default\("pending"\)/);
  assert.match(schema, /@@map\("feedback"\)/);
  assert.match(migration, /CREATE TABLE "feedback_batches"/);
  assert.match(migration, /CREATE TABLE "feedback"/);
  assert.match(migration, /CREATE UNIQUE INDEX "feedback_linkIdentifier_key"/);
});

test("protected feedback request page exposes the Excel upload workflow", () => {
  const page = read("src/app/dashboard/feedback-request/page.tsx");
  const form = read("src/app/dashboard/feedback-request/upload-form.tsx");
  const action = read("src/app/dashboard/feedback-request/actions.ts");
  const state = read("src/app/dashboard/feedback-request/state.ts");

  assert.match(page, /FeedbackRequestUploadForm/);
  assert.match(page, /email, type, product_code, product_name, purchase_date/);
  assert.match(form, /"use client"/);
  assert.match(form, /useActionState\(uploadFeedbackRequests, initialFeedbackUploadState\)/);
  assert.match(state, /initialFeedbackUploadState/);
  assert.match(form, /accept="\.xlsx"/);
  assert.match(form, /Processing upload/);
  assert.match(form, /Rows created/);
  assert.match(action, /const session = await auth\(\)/);
  assert.match(action, /parseAndValidateFeedbackUpload\(file\)/);
  assert.match(action, /sanitizeUploadedFileName\(file\.name\)/);
  assert.match(action, /replace\(\/\[\^a-zA-Z0-9\._ -\]\/g, "_"\)/);
  assert.match(action, /safeName\.slice\(0, 120\)/);
  assert.match(action, /createFeedbackBatchFromRows/);
});

test("workbook validation rejects invalid shape and unsupported request types", () => {
  const validation = read("src/features/feedback-request/validation.ts");
  const xlsx = read("src/features/feedback-request/xlsx.ts");

  assert.match(validation, /REQUIRED_COLUMNS = \["email", "type", "product_code", "product_name", "purchase_date"\]/);
  assert.match(validation, /Upload a \.xlsx workbook/);
  assert.match(validation, /Missing required column/);
  assert.match(validation, /findDuplicateRequiredColumns/);
  assert.match(validation, /Duplicate required column/);
  assert.match(validation, /type !== "purchase"/);
  assert.match(validation, /is not supported\. Use purchase/);
  assert.match(validation, /email must be a valid email address/);
  assert.match(validation, /purchase_date must be a valid date/);
  assert.match(validation, /isExactUtcDate/);
  assert.match(validation, /\(\?:\[T\\s\]\.\*\)\?/);
  assert.match(validation, /return null;\s*\}\s*function isValidDate/s);
  assert.match(validation, /product_code must be \$\{MAX_PRODUCT_CODE_LENGTH\} characters or fewer/);
  assert.match(validation, /product_name must be \$\{MAX_PRODUCT_NAME_LENGTH\} characters or fewer/);
  assert.match(validation, /return \{ ok: false, errors \}/);
  assert.match(xlsx, /inflateRawSync/);
  assert.match(xlsx, /parseFirstWorksheet/);
  assert.match(xlsx, /sharedStrings\.xml/);
  assert.match(xlsx, /workbook\.xml\.rels/);
});

test("valid uploads create a batch transaction and unique link identifiers", () => {
  const service = read("src/features/feedback-request/service.ts");

  assert.match(service, /prisma\.\$transaction\(async \(transaction\) =>/);
  assert.match(service, /transaction\.feedbackBatch\.create/);
  assert.match(service, /feedbacks: \{/);
  assert.match(service, /create: feedbackRows\.map/);
  assert.match(service, /randomBytes\(24\)\.toString\("base64url"\)/);
  assert.match(service, /prisma\.feedback\.findUnique\(\{ where: \{ linkIdentifier \} \}\)/);
  assert.match(service, /throw new Error\("Could not generate a unique feedback link identifier\."\)/);
});

test("feedback request email delivery is mockable and tracks row-level outcomes", () => {
  const email = read("src/features/feedback-request/email.ts");
  const service = read("src/features/feedback-request/service.ts");

  assert.match(email, /import "server-only"/);
  assert.match(email, /export type FeedbackRequestEmailSender/);
  assert.match(email, /readGmailConfig/);
  assert.match(email, /sendWithGmailSmtp/);
  assert.match(email, /\/feedback\/\$\{request\.linkIdentifier\}/);
  assert.match(email, /sanitizeFeedbackEmailFailure/);
  assert.doesNotMatch(email, /console\.log\(.*GMAIL_APP_PASSWORD/s);
  assert.match(service, /sender: FeedbackRequestEmailSender = createFeedbackRequestEmailSender\(\)/);
  assert.match(service, /emailStatus: "sent"/);
  assert.match(service, /emailStatus: "failed"/);
  assert.match(service, /emailSentCount \+= 1/);
  assert.match(service, /emailFailedCount \+= 1/);
  assert.match(service, /completed-with-email-failures/);
});
