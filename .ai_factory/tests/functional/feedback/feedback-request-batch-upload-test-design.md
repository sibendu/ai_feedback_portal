# Feedback Request Batch Upload Test Design

- Module: feedback
- Requested task module: registration
- Delivery iteration id: feedback-request-batch-upload
- Delivery iteration title: Feedback Request Batch Upload
- Test design version: 0.1
- Taxonomy: 1.0
- Last updated: 2026-09-15
- Requirements source: `.ai_factory/docs/requirements/modules/feedback/feedback-request-batch-upload-requirements.md`
- Planned story ids: `feedback-batch-data-model`, `feedback-excel-upload-ui`, `feedback-file-parser-validation`, `feedback-batch-creation`, `feedback-link-generation`, `feedback-request-email-sender`, `feedback-email-status-tracking`, `feedback-upload-non-browser-verification`
- Browser status for this Codex task: not run; browser execution is not approved and remains pending controller-approved verification

## Evidence Reviewed

- `.ai_factory/docs/requirements/modules/feedback/feedback-request-batch-upload-requirements.md` defines the batch-upload scope, assumptions, acceptance criteria, edge cases, and cross-story rules.
- Prior planning for iteration `feedback-request-batch-upload` defines eight planned stories: data model, upload UI, file parser validation, batch creation, link generation, request email sender, email status tracking, and non-browser verification.
- `src/app/dashboard/feedback-request/page.tsx` currently renders a protected placeholder, so the upload form and server action are delivery work for this iteration.
- `src/app/dashboard/layout.tsx` protects dashboard routes through the authenticated dashboard shell from the prior approved iteration.
- `prisma/schema.prisma` currently includes Auth.js, registration, welcome-email, and registration failure models, but no `FeedbackBatch` or `Feedback` models.
- `package.json` includes Next.js, React, TypeScript, NextAuth, Prisma Client, Prisma CLI, ESLint, and Playwright dependencies. It does not currently list an Excel parser dependency.
- `src/features/registration/welcome-email.ts` provides an existing server-only, injectable Gmail SMTP pattern that can inform feedback request email delivery.
- Browser, Playwright, e2e tests, temporary app server startup, deployment, publishing, and real customer/Gmail email delivery are explicitly disallowed for this Codex task.

## Test Approach

Use source-level and non-browser tests for this restricted run, then complete UI/layout confidence later through controller-approved browser verification.

- Schema and migration checks verify feedback batch and feedback row persistence, relationships, uniqueness, and non-destructive migration behavior.
- Server-action or integration tests use mocked authenticated sessions, isolated data stores, and mocked email senders to verify all-or-nothing validation, transactional creation, link generation, and status tracking.
- Parser tests use generated in-memory workbook fixtures and avoid real customer data.
- Static and component-level checks verify the protected upload page exposes the correct controls, result states, and scope boundaries.
- Email tests inject mocked senders and never contact Gmail or real recipients.
- Security checks assert that secrets, tokens, database URLs, raw SMTP transcripts, and stack traces are not rendered, logged, or persisted as user-facing errors.
- Browser tests are designed as pending only and must not be reported as passed unless a later controller-approved run provides evidence.
- Environment setup failures for command resolution, dependency setup, browser launch, browser permissions, or test page setup are blockers, not application defects.

## Traceable Test Cases

| Test id | Story ids | Type | Priority | Test case | Expected result |
| --- | --- | --- | --- | --- | --- |
| FDB-UPLOAD-TC-001 | feedback-batch-data-model | Schema/static | P0 | Inspect Prisma schema after delivery. | A persisted `FeedbackBatch` model or equivalent exists for uploaded workbooks. |
| FDB-UPLOAD-TC-002 | feedback-batch-data-model | Schema/static | P0 | Inspect batch-to-user relationship. | Each feedback batch is linked to the authenticated uploading user with an explicit relation or foreign key. |
| FDB-UPLOAD-TC-003 | feedback-batch-data-model | Schema/static | P0 | Inspect batch metadata fields. | Batch stores traceable metadata such as id, timestamps, safe source file name, row count, created request count, and email outcome counts or derivable equivalents. |
| FDB-UPLOAD-TC-004 | feedback-batch-data-model | Schema/static | P0 | Inspect feedback row model. | A persisted `Feedback` model or equivalent exists for individual customer request rows. |
| FDB-UPLOAD-TC-005 | feedback-batch-data-model | Schema/static | P0 | Inspect required feedback fields. | Each row stores recipient email, type, product code, product name, purchase date, link identifier, delivery status, timestamps, and batch relation. |
| FDB-UPLOAD-TC-006 | feedback-batch-data-model | Schema/static | P0 | Inspect link identifier indexes. | Link identifier has a database uniqueness constraint across all feedback rows. |
| FDB-UPLOAD-TC-007 | feedback-batch-data-model | Migration | P0 | Validate new migration against existing auth/registration/welcome schema. | Existing `User`, `Account`, `Session`, welcome-email, and registration failure rows require no destructive backfill. |
| FDB-UPLOAD-TC-008 | feedback-batch-data-model | Integration/failure | P0 | Attempt to persist two feedback rows with the same link identifier. | Database rejects the duplicate identifier and returns a safe error path. |
| FDB-UPLOAD-TC-009 | feedback-batch-data-model | Schema/future-compatibility | P1 | Inspect feedback row compatibility with later public form work. | Stored request row contains enough product and purchase context for a later feedback form to render. |
| FDB-UPLOAD-TC-010 | feedback-batch-data-model | Security/static | P1 | Inspect persisted file-name handling. | Unsafe uploaded file names are sanitized, bounded, or stored only as safe display metadata. |
| FDB-UPLOAD-TC-011 | feedback-excel-upload-ui | Static/component | P0 | Inspect `/dashboard/feedback-request` after delivery. | Protected placeholder is replaced by an authenticated single-file Excel upload form inside the dashboard shell. |
| FDB-UPLOAD-TC-012 | feedback-excel-upload-ui | Security/route | P0 | Render or invoke `/dashboard/feedback-request` with no session in a non-browser harness. | Upload controls are not rendered; unauthenticated users are redirected to sign in. |
| FDB-UPLOAD-TC-013 | feedback-excel-upload-ui | Component | P0 | Render the upload page with an authenticated session. | Page exposes a single-file control and submit action. |
| FDB-UPLOAD-TC-014 | feedback-excel-upload-ui | Component/content | P0 | Inspect visible upload guidance. | Required columns `email`, `type`, `product_code`, `product_name`, and `purchase_date` are communicated. |
| FDB-UPLOAD-TC-015 | feedback-excel-upload-ui | Component/failure | P0 | Submit without selecting a file. | User receives a useful file-required error and no server-side batch is created. |
| FDB-UPLOAD-TC-016 | feedback-excel-upload-ui | Component/state | P0 | Submit a valid fixture with mocked server success. | UI shows success summary with batch/request counts and email outcome counts. |
| FDB-UPLOAD-TC-017 | feedback-excel-upload-ui | Component/state/failure | P0 | Submit a fixture that returns validation errors. | UI shows useful errors, including row numbers when available, and does not claim records were created. |
| FDB-UPLOAD-TC-018 | feedback-excel-upload-ui | Component/state/failure | P1 | Simulate a server-side upload failure after submit. | UI shows a safe upload-failed state without stack traces, file paths, secrets, or raw binary content. |
| FDB-UPLOAD-TC-019 | feedback-excel-upload-ui | Component/state | P1 | Trigger repeated submit while a file is already being processed. | UI prevents confusing duplicate submissions or handles repeated submits deterministically. |
| FDB-UPLOAD-TC-020 | feedback-excel-upload-ui | Static/scope | P0 | Inspect Feedback Request page copy and controls. | Page does not imply Configure, public customer form submission, or non-purchase feedback types are implemented. |
| FDB-UPLOAD-TC-021 | feedback-excel-upload-ui | Browser pending/layout | P1 | In a later approved browser run, view upload page with expanded/collapsed nav and light/dark themes. | Upload controls remain usable and do not overlap dashboard shell controls. |
| FDB-UPLOAD-TC-022 | feedback-file-parser-validation | Unit/parser | P0 | Parse a valid `.xlsx` workbook with the required headers and one purchase row. | Parser returns one normalized row ready for validation/creation. |
| FDB-UPLOAD-TC-023 | feedback-file-parser-validation | Unit/parser/failure | P0 | Parse a workbook missing `product_code`. | Upload is rejected with a missing-column error and no creation is attempted. |
| FDB-UPLOAD-TC-024 | feedback-file-parser-validation | Unit/parser/failure | P0 | Parse a workbook with misspelled `purchase_date`. | Upload is rejected with a useful header error. |
| FDB-UPLOAD-TC-025 | feedback-file-parser-validation | Unit/parser/failure | P0 | Parse a workbook with duplicate required header names. | Upload is rejected with a duplicate-header error. |
| FDB-UPLOAD-TC-026 | feedback-file-parser-validation | Unit/parser | P1 | Parse headers with leading/trailing whitespace. | Headers are normalized consistently and valid required headers are recognized. |
| FDB-UPLOAD-TC-027 | feedback-file-parser-validation | Unit/parser | P1 | Parse a workbook with additional irrelevant columns. | Required columns are accepted and extra columns are ignored or rejected according to documented implementation behavior. |
| FDB-UPLOAD-TC-028 | feedback-file-parser-validation | Unit/parser/failure | P0 | Parse an empty workbook or worksheet. | Upload is rejected as empty with no batch or feedback rows created. |
| FDB-UPLOAD-TC-029 | feedback-file-parser-validation | Unit/parser/failure | P0 | Parse headers-only workbook with no customer data rows. | Upload is rejected as having no valid data rows. |
| FDB-UPLOAD-TC-030 | feedback-file-parser-validation | Unit/validation/failure | P0 | Validate a row with blank email. | Row is rejected with spreadsheet row number and no persistence occurs. |
| FDB-UPLOAD-TC-031 | feedback-file-parser-validation | Unit/validation/failure | P0 | Validate a row with malformed email. | Row is rejected with spreadsheet row number and no persistence occurs. |
| FDB-UPLOAD-TC-032 | feedback-file-parser-validation | Unit/validation/failure | P0 | Validate a row with `type=service_request`. | Upload is rejected because only `purchase` is supported in this iteration; no records are created. |
| FDB-UPLOAD-TC-033 | feedback-file-parser-validation | Unit/validation | P1 | Validate a row with mixed-case or padded `type` value representing purchase. | Type is normalized consistently or rejected according to documented implementation behavior. |
| FDB-UPLOAD-TC-034 | feedback-file-parser-validation | Unit/validation/failure | P0 | Validate blank `product_code` or `product_name`. | Row is rejected with spreadsheet row number and no persistence occurs. |
| FDB-UPLOAD-TC-035 | feedback-file-parser-validation | Unit/validation/failure | P0 | Validate product code or product name beyond configured maximum length. | Row is rejected or truncated only if explicitly documented; error is useful and safe. |
| FDB-UPLOAD-TC-036 | feedback-file-parser-validation | Unit/validation/failure | P0 | Validate impossible `purchase_date`, such as 2026-02-30. | Row is rejected without silently correcting calendar value. |
| FDB-UPLOAD-TC-037 | feedback-file-parser-validation | Unit/validation | P1 | Validate accepted deterministic date format. | Purchase date is parsed to the intended calendar day without timezone shifting. |
| FDB-UPLOAD-TC-038 | feedback-file-parser-validation | Unit/validation | P1 | Parse fully blank trailing rows. | Blank trailing rows do not create feedback records and do not produce noisy validation errors. |
| FDB-UPLOAD-TC-039 | feedback-file-parser-validation | Unit/security/failure | P0 | Force parser error with malformed or non-Excel file content. | Admin receives a safe parse error without stack traces, local paths, secrets, or raw binary content. |
| FDB-UPLOAD-TC-040 | feedback-file-parser-validation | Unit/transaction/failure | P0 | Validate workbook with one valid row and one invalid row. | Entire upload is rejected and no partial batch or feedback row is created. |
| FDB-UPLOAD-TC-041 | feedback-batch-creation | Integration | P0 | Submit a valid workbook with three customer rows as an authenticated admin. | Exactly one batch and three feedback rows are created. |
| FDB-UPLOAD-TC-042 | feedback-batch-creation | Integration | P0 | Submit the same valid workbook as two different authenticated admins. | Two distinct batches are created, each tied to the submitting admin. |
| FDB-UPLOAD-TC-043 | feedback-batch-creation | Integration/security/failure | P0 | Invoke the upload server action with no authenticated user. | No batch or feedback rows are created and a sign-in or unauthorized result is returned. |
| FDB-UPLOAD-TC-044 | feedback-batch-creation | Integration/transaction/failure | P0 | Simulate database failure after batch insert but before all feedback rows insert. | Transaction rolls back and no incomplete batch remains. |
| FDB-UPLOAD-TC-045 | feedback-batch-creation | Integration | P0 | Inspect persisted values after valid upload. | Recipient email, type, product code, product name, and purchase date remain traceable to normalized uploaded row values. |
| FDB-UPLOAD-TC-046 | feedback-batch-creation | Integration/concurrency | P1 | Submit two valid uploads concurrently for the same admin. | Uploads create independent batches and do not cross-link feedback rows. |
| FDB-UPLOAD-TC-047 | feedback-batch-creation | Integration/failure | P1 | Submit a workbook exceeding configured size or row limit. | Upload fails before creation with a useful limit error. |
| FDB-UPLOAD-TC-048 | feedback-batch-creation | Integration/failure | P1 | Retry after a transaction failure. | Retry starts cleanly and does not reuse or expose partially created records. |
| FDB-UPLOAD-TC-049 | feedback-link-generation | Unit | P0 | Generate identifiers for multiple rows in one upload. | Every feedback row receives a distinct non-empty identifier. |
| FDB-UPLOAD-TC-050 | feedback-link-generation | Static/security | P0 | Inspect identifier generation implementation. | Identifier is server-side, non-guessable, URL-safe, and not derived from email, product code, or database id. |
| FDB-UPLOAD-TC-051 | feedback-link-generation | Integration | P0 | Persist identifiers from separate batches. | Identifiers are unique across all feedback rows, not only within a batch. |
| FDB-UPLOAD-TC-052 | feedback-link-generation | Unit/integration/failure | P0 | Simulate an identifier collision. | Implementation retries or fails safely without persisting inconsistent records or exposing constraint internals. |
| FDB-UPLOAD-TC-053 | feedback-link-generation | Unit/email-content | P0 | Render customer email link for a feedback row. | Link includes the unique identifier using a stable future public feedback URL contract. |
| FDB-UPLOAD-TC-054 | feedback-link-generation | Static/scope | P0 | Inspect delivery for public form dependencies. | Link generation does not require the public feedback form to be implemented in this iteration. |
| FDB-UPLOAD-TC-055 | feedback-link-generation | Unit/failure | P1 | Simulate randomness source failure. | Upload fails safely or reports deterministic failure without creating duplicate or empty identifiers. |
| FDB-UPLOAD-TC-056 | feedback-request-email-sender | Static/security | P0 | Inspect feedback request email sender imports and consumers. | Sender is server-only and is not imported by client components. |
| FDB-UPLOAD-TC-057 | feedback-request-email-sender | Unit/config | P0 | Initialize sender with `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `GMAIL_FROM` present. | Sender uses server-side Gmail settings without exposing them in rendered UI or test output. |
| FDB-UPLOAD-TC-058 | feedback-request-email-sender | Unit/config/failure | P0 | Attempt to send with one or more Gmail env keys missing. | Sender returns deterministic missing-configuration status and no real Gmail connection is attempted in tests. |
| FDB-UPLOAD-TC-059 | feedback-request-email-sender | Unit/failure | P0 | Attempt to send to an invalid recipient that escaped parser validation. | Sender returns deterministic invalid-recipient status. |
| FDB-UPLOAD-TC-060 | feedback-request-email-sender | Unit/mockability | P0 | Inject a mocked sender into upload processing. | Tests can assert per-row send attempts without contacting Gmail or real customers. |
| FDB-UPLOAD-TC-061 | feedback-request-email-sender | Unit/content | P0 | Render feedback request email for a valid purchase row. | Content includes product name or product code and the unique feedback link URL. |
| FDB-UPLOAD-TC-062 | feedback-request-email-sender | Unit/security | P0 | Render email with markup-like product name. | User-provided product fields are escaped in HTML email output. |
| FDB-UPLOAD-TC-063 | feedback-request-email-sender | Unit/failure | P1 | Mock provider authentication error, timeout, or rate-limit result. | Sender returns deterministic failed status with sanitized error context. |
| FDB-UPLOAD-TC-064 | feedback-request-email-sender | Security | P0 | Inspect logs, stored errors, UI errors, and email templates. | No Gmail app password, OAuth secret, Auth.js secret, database URL, provider token, or raw SMTP transcript is exposed. |
| FDB-UPLOAD-TC-065 | feedback-email-status-tracking | Integration | P0 | Process valid upload where all mocked email sends succeed. | Each feedback row records sent status, attempted timestamp, sent timestamp, and upload summary reports all sent. |
| FDB-UPLOAD-TC-066 | feedback-email-status-tracking | Integration/failure | P0 | Process valid upload where one mocked send fails. | Batch and all feedback rows remain created; failed row records failed status and sanitized reason. |
| FDB-UPLOAD-TC-067 | feedback-email-status-tracking | Integration/failure | P0 | Process valid upload with missing Gmail configuration using the chosen delivery design. | Rows record deterministic missing-configuration outcomes or upload fails before email as documented, without secret exposure. |
| FDB-UPLOAD-TC-068 | feedback-email-status-tracking | Integration | P0 | Inspect upload result summary after mixed send outcomes. | Created, attempted, sent, and failed counts match child feedback row statuses. |
| FDB-UPLOAD-TC-069 | feedback-email-status-tracking | Integration/failure | P1 | Simulate process failure after some email attempts when feasible in source-level tests. | Persisted statuses reflect completed attempts according to documented transaction/delivery design. |
| FDB-UPLOAD-TC-070 | feedback-email-status-tracking | Integration/concurrency | P1 | Simulate stale status update after a row was already marked sent. | Sent status is not overwritten by a later stale failure. |
| FDB-UPLOAD-TC-071 | feedback-email-status-tracking | Security/static | P0 | Inspect persisted failure reason length and content. | Failure reason is sanitized, bounded, and excludes credentials, tokens, and raw provider transcripts. |
| FDB-UPLOAD-TC-072 | feedback-upload-non-browser-verification | Command | P0 | Run dependency verification with `npm.cmd ls next next-auth @auth/prisma-adapter @prisma/client prisma typescript --depth=0`. | Required baseline dependencies are present, or the exact failure is reported as blocker or defect according to cause. |
| FDB-UPLOAD-TC-073 | feedback-upload-non-browser-verification | Command | P0 | Run Excel parser dependency verification after implementation, such as `npm.cmd ls <selected-excel-parser> --depth=0`. | Selected parser dependency is present, or missing package is reported with exact evidence. |
| FDB-UPLOAD-TC-074 | feedback-upload-non-browser-verification | Command | P0 | Run Prisma validation with `npx.cmd prisma validate` after schema changes. | Prisma schema validates, or the exact validation failure is reported. |
| FDB-UPLOAD-TC-075 | feedback-upload-non-browser-verification | Command | P0 | Run TypeScript verification with `npx.cmd tsc --noEmit --incremental false`. | TypeScript check passes, or the exact compiler failure is reported. |
| FDB-UPLOAD-TC-076 | feedback-upload-non-browser-verification | Command | P0 | Run lint verification with `npm.cmd run lint` if the script remains available. | Lint passes, or the exact lint failure is reported. |
| FDB-UPLOAD-TC-077 | feedback-upload-non-browser-verification | Unit | P0 | Run targeted non-browser tests for file shape and row validation. | Tests cover missing columns, empty files, invalid email/date, unsupported type, and all-or-nothing rejection. |
| FDB-UPLOAD-TC-078 | feedback-upload-non-browser-verification | Unit/integration | P0 | Run targeted non-browser tests for valid batch and feedback row creation. | Tests prove valid uploads create one batch and one feedback row per customer. |
| FDB-UPLOAD-TC-079 | feedback-upload-non-browser-verification | Unit/integration | P0 | Run targeted non-browser tests for unique identifier generation and collision handling. | Tests prove identifiers are unique and collisions fail or retry safely. |
| FDB-UPLOAD-TC-080 | feedback-upload-non-browser-verification | Unit/integration | P0 | Run targeted non-browser tests with mocked email sending. | Tests prove send attempts and success/failure statuses without contacting Gmail or customers. |
| FDB-UPLOAD-TC-081 | feedback-upload-non-browser-verification | Browser pending | P0 | Run controller-approved browser upload verification later. | Browser coverage records actual evidence only when approved; this Codex task must not report it as passed. |

## Coverage Matrix

| Story id | Covered by |
| --- | --- |
| feedback-batch-data-model | FDB-UPLOAD-TC-001 through FDB-UPLOAD-TC-010 |
| feedback-excel-upload-ui | FDB-UPLOAD-TC-011 through FDB-UPLOAD-TC-021 |
| feedback-file-parser-validation | FDB-UPLOAD-TC-022 through FDB-UPLOAD-TC-040 |
| feedback-batch-creation | FDB-UPLOAD-TC-041 through FDB-UPLOAD-TC-048 |
| feedback-link-generation | FDB-UPLOAD-TC-049 through FDB-UPLOAD-TC-055 |
| feedback-request-email-sender | FDB-UPLOAD-TC-056 through FDB-UPLOAD-TC-064 |
| feedback-email-status-tracking | FDB-UPLOAD-TC-065 through FDB-UPLOAD-TC-071 |
| feedback-upload-non-browser-verification | FDB-UPLOAD-TC-072 through FDB-UPLOAD-TC-081 |

## Required Test Data And Fixtures

- Isolated non-production database and Auth.js session fixtures for authenticated admin, unauthenticated request, expired session, and session lookup failure.
- Valid Excel workbook fixture with headers `email`, `type`, `product_code`, `product_name`, and `purchase_date` and one `purchase` row.
- Valid Excel workbook fixture with three customer purchase rows.
- Header failure fixtures for missing, misspelled, duplicate, padded, reordered, and additional columns.
- Empty workbook, empty worksheet, headers-only workbook, blank trailing rows, malformed binary content, and non-Excel file fixtures.
- Row validation fixtures for invalid email, blank required values, unsupported `service_request` type, unsupported complaint-like type, impossible date, ambiguous date, long product code, and long product name.
- Duplicate row fixture with the same customer email and product context twice, proving uniqueness applies to link identifiers.
- Mock Prisma or isolated database fixtures for transaction success, transaction rollback, identifier uniqueness conflict, database write failure, and concurrent uploads.
- Identifier generation fixtures for normal random values, forced collision, empty generator result, and randomness failure.
- Feedback email fixtures with safe product context, markup-like product values, invalid recipient, missing Gmail env keys, provider authentication failure, timeout, and rate-limit failure.
- Mock feedback request sender fixture that records calls and never contacts Gmail.
- Secret-scrubbing helper for assertions against rendered markup, redirect URLs, upload results, logs, thrown errors, persisted failure reasons, and test reports.

## Non-Browser Execution Plan

Run these commands when implementation is present, from the project root:

1. `npm.cmd ls next next-auth @auth/prisma-adapter @prisma/client prisma typescript --depth=0`
2. `npm.cmd ls <selected-excel-parser> --depth=0`, for example `npm.cmd ls xlsx --depth=0` or `npm.cmd ls exceljs --depth=0` if selected.
3. `npx.cmd prisma validate`
4. `npx.cmd tsc --noEmit --incremental false`
5. `npm.cmd run lint`
6. Targeted non-browser unit or integration tests for parser validation, transactional batch creation, link generation, mocked email sending, and delivery status tracking once implemented.

Do not run `npm.cmd run test:e2e`, Playwright, browser launch commands, temporary application servers, deployment, publishing, or real Gmail/customer email delivery in this Codex task. Browser execution remains pending and must be reported as pending unless controller evidence exists.

## Execution Notes

- Do not use real customer data, real OAuth tokens, production database credentials, Gmail credentials, provider secrets, or real customer delivery in automated tests.
- Do not record Gmail app passwords, OAuth client secrets, Auth.js secrets, provider tokens, refresh tokens, id tokens, session tokens, database URLs, raw SMTP transcripts, or full feedback link secrets in evidence.
- If `npm.cmd` or `npx.cmd` cannot be found, record the exact command failure as an environment blocker.
- If dependency installation is required for the selected Excel parser but unavailable in the environment, record the exact blocker instead of changing application behavior to mask it.
- If browser launch, browser permissions, dependency installation, page setup, or temporary app-server startup fails in a later approved run, report that as an environment blocker rather than an application defect.
- Production build verification is not required for each iteration under the recorded process decision and is not part of this test-design action.
- No browser verification, Playwright test, e2e test, app server startup, deployment, publishing, real Gmail delivery, or real customer communication was executed while producing this test design.
