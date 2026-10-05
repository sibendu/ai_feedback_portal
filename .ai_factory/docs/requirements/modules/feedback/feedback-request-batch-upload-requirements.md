# Feedback Request Batch Upload Requirements

- Module: feedback
- Delivery iteration id: feedback-request-batch-upload
- Delivery iteration title: Feedback Request Batch Upload
- Status: elaborated for delivery
- Taxonomy: 1.0
- Last updated: 2026-09-15
- Planned story ids: `feedback-batch-data-model`, `feedback-excel-upload-ui`, `feedback-file-parser-validation`, `feedback-batch-creation`, `feedback-link-generation`, `feedback-request-email-sender`, `feedback-email-status-tracking`, `feedback-upload-non-browser-verification`

## Scope

Implement the authenticated Feedback Request batch upload workflow. An authenticated admin user shall upload a single Excel workbook containing customer purchase rows with `email`, `type`, `product_code`, `product_name`, and `purchase_date` columns. The application shall validate the file and rows, support only `type=purchase` in this iteration, create a traceable feedback batch, create one feedback request record for each valid customer row, generate a unique feedback-link identifier for each request, and attempt to email each customer through a server-only, mockable Gmail sender.

Out of scope for this iteration: public customer feedback form submission, rating/message capture, Configure behavior, changing registration/profile consent, changing welcome-email behavior except for reusable sender patterns, browser execution, Playwright execution, app server startup, deployment, publishing, and contacting real customers during tests.

## Evidence

- Delivery scope for `feedback-request-batch-upload` requests the Feedback Request page for Excel uploads with `email`, `type`, `product_code`, `product_name`, and `purchase_date` columns.
- Delivery scope requires validation, initial support for `type=purchase` only, feedback batch creation, feedback rows for each valid customer row, and email to each customer with a unique feedback-link identifier.
- Prior planning preserved the story ids `feedback-batch-data-model`, `feedback-excel-upload-ui`, `feedback-file-parser-validation`, `feedback-batch-creation`, `feedback-link-generation`, `feedback-request-email-sender`, `feedback-email-status-tracking`, and `feedback-upload-non-browser-verification`.
- `src/app/dashboard/feedback-request/page.tsx` currently renders a protected placeholder that says upload and email workflow controls will be added in this iteration.
- `src/app/dashboard/layout.tsx` protects dashboard routes through the authenticated dashboard shell delivered in the prior iteration.
- `prisma/schema.prisma` currently contains Auth.js, registration, welcome-email, and registration failure models, but no `FeedbackBatch` or `Feedback` models.
- `package.json` includes Next.js, TypeScript, Prisma, Auth.js, ESLint, and Playwright dependencies, but no Excel parser dependency is currently listed.
- `src/features/registration/welcome-email.ts` and `src/features/registration/welcome-delivery.ts` demonstrate the existing server-only, injectable Gmail SMTP sender and sanitized delivery-failure handling pattern.
- `.env.local` was previously confirmed to contain the Gmail key names `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `GMAIL_FROM` without exposing values.
- Browser verification is not approved for this task run and shall remain pending/not run until a later approved controller run supplies evidence.

## Assumptions And Definitions

- "Admin user" means the authenticated dashboard user uploading the workbook. No new role/permission model is required in this iteration unless one already exists by delivery time.
- "Excel workbook" means an uploaded `.xlsx` file, unless implementation explicitly supports additional Excel formats without weakening validation.
- "Required columns" means exact normalized headers for `email`, `type`, `product_code`, `product_name`, and `purchase_date`; whitespace around headers may be trimmed.
- "Valid upload" means every non-empty data row passes validation. This iteration uses all-or-nothing creation; invalid files shall not create partial feedback batches or feedback records.
- "Feedback link identifier" means the unique, non-guessable token stored on the feedback row and included in the emailed URL for the later public feedback form iteration.
- "Feedback URL" means a URL containing the identifier in the route or query string for future customer feedback submission. The public form itself is out of scope here.
- "Email sent" means the sender reported success. Tests must use an injectable or mocked sender and must not contact Gmail or real customers.
- "Useful error" means an admin-facing message that names the failed file/row condition without exposing secrets, stack traces, raw SMTP credentials, database connection strings, or provider tokens.

## Story Requirements

### feedback-batch-data-model

Add database persistence for uploaded feedback batches and individual feedback request rows.

Requirements:

- FDB-MODEL-001: The Prisma schema shall define a `FeedbackBatch` model or equivalent persisted entity for each uploaded workbook.
- FDB-MODEL-002: A feedback batch shall be linked to the authenticated uploading user.
- FDB-MODEL-003: A feedback batch shall store traceable metadata such as id, created timestamp, updated timestamp where appropriate, source file name or safe display name, row count, created request count, and aggregate email outcome counts.
- FDB-MODEL-004: The Prisma schema shall define a `Feedback` model or equivalent persisted entity for each customer feedback request row.
- FDB-MODEL-005: Each feedback row shall store recipient email, type, product code, product name, purchase date, unique link identifier, email delivery status, timestamps, and relationship to its batch.
- FDB-MODEL-006: The feedback row shall be suitable for the later customer feedback form iteration by allowing rating/message/submission fields to be added now or later without blocking this iteration.
- FDB-MODEL-007: Link identifiers shall be constrained unique at the database level.
- FDB-MODEL-008: Schema changes shall not require destructive changes to existing auth, registration, welcome-email, dashboard, Account, Session, or User data.
- FDB-MODEL-009: Model and field names should use existing Prisma naming style, while preserving uploaded business fields in clearly traceable camelCase equivalents.

Acceptance criteria:

- Given the schema is inspected, then feedback batch and feedback request persistence is present and related to the uploading user.
- Given a feedback row is inspected, then it can trace back to its batch and contains the original recipient/product/purchase context.
- Given two feedback rows attempt to store the same link identifier, then the database uniqueness constraint rejects the duplicate.
- Given existing user/session data is present, when the migration is applied, then existing auth and registration records do not require backfill that would fail.
- Given a future public feedback form needs to resolve a request, then the stored feedback row contains enough product and purchase context to render the form.

Edge cases:

- Existing users with no prior feedback batches must remain valid.
- Uploaded file names may contain unsafe characters and should be stored only after sanitization or treated as display-only metadata.
- Very long product names or product codes should be bounded by validation before persistence.
- Multiple batches from the same admin may contain the same customer email and product context; uniqueness applies to link identifiers, not necessarily email.
- Deleting an admin user should follow an explicit referential rule that does not accidentally orphan sensitive feedback rows.
- Database failures during creation must not leave half-related records.

### feedback-excel-upload-ui

Replace the protected Feedback Request placeholder with an authenticated upload form for Excel files.

Requirements:

- FDB-UI-001: `/dashboard/feedback-request` shall remain protected inside the authenticated dashboard shell.
- FDB-UI-002: The page shall provide a single-file Excel upload control.
- FDB-UI-003: The page shall communicate the required columns: `email`, `type`, `product_code`, `product_name`, and `purchase_date`.
- FDB-UI-004: The page shall provide a submit action that sends the file to a server-side handler.
- FDB-UI-005: The UI shall show deterministic idle, submitting, validation-error, upload-failed, and success states.
- FDB-UI-006: Success state shall summarize created batch/request counts and email-send outcomes where available.
- FDB-UI-007: Validation errors shall be useful to the admin and include row numbers when row-specific failures exist.
- FDB-UI-008: The page shall not imply that Configure, customer rating submission, or non-purchase feedback types are implemented.
- FDB-UI-009: Upload controls shall remain usable in the existing dashboard expanded/collapsed navigation and light/dark theme states.

Acceptance criteria:

- Given an authenticated user opens `/dashboard/feedback-request`, then the upload form is available inside the dashboard shell.
- Given an unauthenticated user opens `/dashboard/feedback-request`, then protected upload controls are not rendered and sign-in is required.
- Given no file is selected, when the admin submits, then the page reports that a file is required.
- Given a valid upload succeeds, then the page shows batch creation and email result summary.
- Given validation fails, then the page shows errors and does not claim that feedback requests were created.
- Given the file is being submitted, then the UI prevents confusing duplicate submissions or clearly handles repeated submissions.

Edge cases:

- Users may choose a non-Excel file with an Excel-like name; server-side validation remains authoritative.
- Large files should fail with a clear size or row-limit message if implementation defines limits.
- A selected file may be replaced before submission; only the latest selected file should be submitted.
- Client-side validation is helpful but cannot be the only validation.
- Long validation messages, file names, or product names must not overlap dashboard controls.
- Refreshing after a completed upload should not silently resubmit the file.

### feedback-file-parser-validation

Parse the uploaded Excel workbook and validate file shape and row content before creating records.

Requirements:

- FDB-VALID-001: The server shall parse the uploaded workbook with a deterministic Excel parser.
- FDB-VALID-002: The first supported worksheet or defined worksheet selection rule shall be documented in code or requirements.
- FDB-VALID-003: Required headers shall be validated before row processing.
- FDB-VALID-004: Missing, duplicate, or misspelled required headers shall reject the file with useful errors.
- FDB-VALID-005: Empty workbooks, empty worksheets, and files with headers but no valid data rows shall be rejected.
- FDB-VALID-006: Row validation shall require non-empty `email`, `type`, `product_code`, `product_name`, and `purchase_date`.
- FDB-VALID-007: `email` shall be validated as a syntactically valid email address.
- FDB-VALID-008: `type` shall accept only `purchase` for this iteration.
- FDB-VALID-009: `purchase_date` shall be parsed into a valid date without silently accepting invalid calendar values.
- FDB-VALID-010: Product code and product name shall be trimmed and bounded to implementation-defined maximum lengths.
- FDB-VALID-011: Validation shall return row-level errors using spreadsheet row numbers where possible.
- FDB-VALID-012: If any row is invalid, no feedback batch or feedback row shall be created.
- FDB-VALID-013: Parser and validation failures shall not expose stack traces, local file paths, secrets, or raw binary content to admins.

Acceptance criteria:

- Given a workbook missing `product_code`, when submitted, then the upload is rejected with a missing-column error.
- Given a workbook includes unsupported `type=service_request`, when submitted, then the upload is rejected and no rows are created.
- Given a workbook includes an invalid email, when submitted, then the upload is rejected with the affected row identified.
- Given a workbook includes an invalid purchase date, when submitted, then the upload is rejected with the affected row identified.
- Given a workbook has required headers but no customer rows, when submitted, then it is rejected as empty.
- Given all rows are valid purchases, when submitted, then validation passes to batch creation.

Edge cases:

- Header cells may contain leading/trailing spaces and should be normalized consistently.
- Additional columns may be ignored if required columns are valid, unless delivery explicitly chooses stricter rejection.
- Fully blank trailing rows should not create validation noise or feedback records.
- Rows with formulas should resolve to safe cell values or be rejected deterministically.
- Excel date serials, ISO date strings, and localized date strings must not be parsed ambiguously; accepted formats should be deterministic.
- Duplicate customer emails in the same workbook may be allowed as separate purchase requests unless delivery defines a duplicate rule, but each row still needs a unique link identifier.

### feedback-batch-creation

Create a feedback batch and associated feedback records for a valid upload.

Requirements:

- FDB-CREATE-001: Valid uploads shall create exactly one feedback batch.
- FDB-CREATE-002: The feedback batch shall be tied to the authenticated uploading user.
- FDB-CREATE-003: Each valid customer row shall create exactly one feedback row linked to the batch.
- FDB-CREATE-004: Stored values shall preserve recipient email, type, product code, product name, and purchase date after normalization.
- FDB-CREATE-005: Batch and feedback row creation shall be transactional.
- FDB-CREATE-006: If any database write fails, the transaction shall roll back and leave no incomplete batch.
- FDB-CREATE-007: Creation shall reject unauthenticated server calls even if the UI route is protected.
- FDB-CREATE-008: Created batch metadata shall support later audit or dashboard display, including counts and timestamps.

Acceptance criteria:

- Given a valid workbook with three customer rows, when an authenticated admin submits it, then one batch and three feedback rows are created.
- Given the same valid workbook is submitted by two different authenticated admins, then each upload creates a distinct batch tied to the submitting admin.
- Given a database write fails after the batch is created but before all rows are created, then no partial batch remains.
- Given an unauthenticated request calls the upload action, then no batch or feedback rows are created.
- Given normalized row values are stored, then product code, product name, purchase date, type, and recipient email remain traceable to the uploaded row.

Edge cases:

- Concurrent uploads by the same admin should create independent batches.
- Large valid workbooks should either complete within defined limits or fail before creation with a clear limit error.
- Mixed-case emails and type values should be normalized consistently before persistence.
- Time zone handling for purchase dates should avoid shifting a displayed purchase date to the wrong calendar day.
- Retrying after a failed transaction should not reuse partially created records.
- Database constraint failures should surface as safe admin-facing errors.

### feedback-link-generation

Generate a unique feedback-link identifier for every feedback record.

Requirements:

- FDB-LINK-001: Each feedback row shall receive a unique, non-guessable link identifier.
- FDB-LINK-002: Link identifiers shall be generated server-side.
- FDB-LINK-003: Link identifiers shall be unique across all feedback rows, not only within one batch.
- FDB-LINK-004: Link identifiers shall be safe for inclusion in a URL without leaking internal database ids.
- FDB-LINK-005: The email link shall include the identifier in the route or query format intended for the future public feedback form.
- FDB-LINK-006: Identifier collision handling shall retry or fail safely without exposing internal constraint details.
- FDB-LINK-007: The implementation shall not require the public feedback form to be completed in this iteration.

Acceptance criteria:

- Given a valid upload creates multiple feedback rows, then every row has a distinct link identifier.
- Given an identifier collision occurs, then the system retries generation or fails the upload without persisting an inconsistent batch.
- Given a customer email is rendered, then the URL contains the feedback row identifier and not the raw database id as the sole secret.
- Given the public form is not implemented yet, then generated links still follow a stable route contract that the later iteration can implement.
- Given source-level tests inspect generation behavior, then generated identifiers are not predictable fixed strings in production code.

Edge cases:

- Randomness source failure should produce a safe failure rather than duplicate or empty identifiers.
- Identifier length should balance URL usability and guessing resistance.
- Identifiers must not include customer email, product code, or other personal data.
- Duplicate file rows still require unique identifiers.
- Logs should not unnecessarily print full identifiers unless needed for safe audit; customer-facing errors should avoid exposing them.
- Future link expiry is out of scope unless delivery chooses to store an expiry field now for compatibility.

### feedback-request-email-sender

Add server-only feedback request email delivery using the existing Gmail configuration pattern without contacting real customers in tests.

Requirements:

- FDB-EMAIL-001: Feedback request email sending shall be implemented in server-only code.
- FDB-EMAIL-002: The sender shall read Gmail settings from server-side `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `GMAIL_FROM`.
- FDB-EMAIL-003: Gmail credentials and secrets shall not be exposed to client code, rendered HTML, admin errors, test fixtures, or logs.
- FDB-EMAIL-004: The sender shall be injectable or mockable for source-level tests.
- FDB-EMAIL-005: Email content shall include enough product context for the customer to recognize the purchase request.
- FDB-EMAIL-006: Email content shall include the unique feedback link URL or identifier route.
- FDB-EMAIL-007: Missing Gmail configuration, invalid recipient, and provider send failures shall return deterministic status values.
- FDB-EMAIL-008: Tests shall not contact Gmail or send real customer emails.
- FDB-EMAIL-009: Reusable sender code should follow the existing welcome-email pattern where appropriate without coupling feedback status to registration status.

Acceptance criteria:

- Given Gmail env keys are configured, when a feedback request email is sent through the production sender, then the sender uses server-side Gmail settings.
- Given Gmail env keys are missing, when sending is attempted, then the result is a deterministic missing-configuration status.
- Given a feedback row has an invalid recipient that escaped prior validation, when sending is attempted, then the result is deterministic invalid-recipient status.
- Given the sender is mocked in tests, when a batch upload is processed, then tests can assert email attempts without contacting Gmail.
- Given email content is rendered, then it includes product name or product code and the unique feedback link.

Edge cases:

- SMTP failures should be sanitized before storage or logging.
- Email rendering should escape product names and other user-provided workbook values in HTML.
- One email failure should not prevent status tracking for other rows in an already-created valid batch.
- Delivery should avoid logging full recipient lists where unnecessary.
- Gmail rate limits or transient failures should be represented as failed/attempted outcomes in this iteration; retry queues are out of scope unless explicitly added.
- The sender should not import client-only modules or run in client components.

### feedback-email-status-tracking

Record email-send attempt and outcome for each feedback request row and summarize upload results for the admin.

Requirements:

- FDB-STATUS-001: Each feedback row shall record email delivery status.
- FDB-STATUS-002: Each feedback row shall record when an email send was attempted.
- FDB-STATUS-003: Each feedback row shall record when an email send succeeded, if applicable.
- FDB-STATUS-004: Each feedback row shall record a sanitized failure code or reason when sending fails.
- FDB-STATUS-005: Send failures shall not erase the already-created batch or feedback rows.
- FDB-STATUS-006: The upload result shall summarize created request count, attempted send count, sent count, and failed count.
- FDB-STATUS-007: Batch-level aggregate counts shall match the statuses of child feedback rows or be derived reliably from them.
- FDB-STATUS-008: Secret values, Gmail credentials, raw provider tokens, and full SMTP transcripts shall never be stored as failure reasons.

Acceptance criteria:

- Given all emails send successfully, then each feedback row records sent status and the upload result reports all sent.
- Given one email send fails after records are created, then that row records failed status and the batch remains created.
- Given Gmail configuration is missing, then created rows record deterministic missing-configuration outcomes or the upload fails before email according to the chosen delivery design, with no secret exposure.
- Given upload result is shown to the admin, then it reports created and delivery counts consistently.
- Given stored failure reasons are inspected, then they do not include Gmail app passwords, auth secrets, database URLs, access tokens, or raw SMTP transcripts.

Edge cases:

- If the process fails after some emails have been attempted, existing records should reflect attempted statuses as far as the transaction and delivery design allows.
- Re-running the same upload is a new batch unless delivery explicitly implements duplicate-upload detection.
- Rows may be created even if no email is sent because delivery failed; the status must make that clear.
- Concurrent status updates should not overwrite a sent status with a later stale failure.
- Admin-facing summaries should remain accurate for zero-sent/all-failed cases.
- Failure messages should be short enough for storage and display.

### feedback-upload-non-browser-verification

Cover the batch upload workflow with approved non-browser checks only.

Requirements:

- FDB-VERIFY-001: Verification in this Codex task run shall not launch browsers, run Playwright, run `test:e2e`, or start a temporary application server.
- FDB-VERIFY-002: TypeScript verification shall use `npx.cmd tsc --noEmit --incremental false`.
- FDB-VERIFY-003: Prisma validation shall use `npx.cmd prisma validate` after schema changes.
- FDB-VERIFY-004: Lint verification shall use `npm.cmd run lint` if the script remains available.
- FDB-VERIFY-005: Source-level tests should cover file shape validation, unsupported type rejection, valid batch/feedback row creation, unique identifier generation, mocked email sending, and email failure status handling.
- FDB-VERIFY-006: Tests shall not contact Gmail, external providers, browsers, or real customer recipients.
- FDB-VERIFY-007: Verification evidence shall record each command run and the exact failure for any blocker.
- FDB-VERIFY-008: Browser verification shall be reported as pending/not run for this restricted run, never as passed without controller evidence.

Acceptance criteria:

- Given Prisma validation is run, then the result records success or the exact Prisma failure.
- Given TypeScript verification is run, then the result records success or the exact compiler failure.
- Given lint verification is run, then the result records success or the exact lint failure.
- Given source-level tests are run, then their pass/fail count is recorded without claiming unexecuted tests passed.
- Given `npm.cmd` or `npx.cmd` is unavailable, then the blocker records the exact command and error.
- Given browser verification remains restricted, then final reporting states it was not run and remains pending.

Edge cases:

- A stalled command should not be repeatedly retried.
- PowerShell `.ps1` shims shall not be used for Node package commands.
- TypeScript verification should disable incremental output to avoid writing build-info cache in restricted workspaces.
- Browser launch, permission, dependency, and test page-setup failures are environment blockers, not application defects.
- Production build verification is not required for each iteration under recorded process decision and should not be claimed unless explicitly run.
- Test fixtures must avoid real customer data and real Gmail credentials.

## Cross-Story Rules

- Preserve planned story ids exactly: `feedback-batch-data-model`, `feedback-excel-upload-ui`, `feedback-file-parser-validation`, `feedback-batch-creation`, `feedback-link-generation`, `feedback-request-email-sender`, `feedback-email-status-tracking`, and `feedback-upload-non-browser-verification`.
- Do not edit test-design artifacts from this business-analysis task.
- Keep this iteration focused on authenticated batch upload, validation, persistence, link generation, and request email delivery.
- Do not implement or require the public customer feedback form, rating field, feedback message submission, Configure behavior, or support for non-purchase request types in this iteration.
- The upload flow shall be all-or-nothing for validation and persistence: invalid files do not create partial batches or partial feedback rows.
- Email delivery failures after valid persistence shall be tracked as delivery outcomes and shall not erase traceable batch or feedback records.
- All email sending must be mockable or injectable for tests, and tests must not contact real customers or Gmail.
- Do not expose OAuth tokens, session tokens, database connection strings, provider secrets, Gmail credentials, raw SMTP transcripts, or auth secrets in UI copy, requirement examples, redirects, logs, persisted error fields, or verification evidence.
- Browser, Playwright, e2e tests, temporary app server startup, deployment, and publishing remain out of scope for this task run unless separately approved by the controller.
