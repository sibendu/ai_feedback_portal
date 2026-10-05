# Customer Feedback Form Test Design

- Module: feedback
- Requested task module: registration
- Delivery iteration id: customer-feedback-form
- Delivery iteration title: Customer Feedback Form Submission
- Test design version: 0.1
- Taxonomy: 1.0
- Last updated: 2026-09-15
- Requirements source: `.ai_factory/docs/requirements/modules/feedback/customer-feedback-form-requirements.md`
- Planned story ids: `feedback-public-link-resolution`, `feedback-link-expiry-rule`, `feedback-form-display`, `feedback-server-validation`, `feedback-record-update`, `feedback-repeat-submission-display`, `feedback-form-non-browser-verification`
- Browser status for this Codex task: not run; browser execution is not approved and remains pending controller-approved verification

## Evidence Reviewed

- `.ai_factory/docs/requirements/modules/feedback/customer-feedback-form-requirements.md` defines the public feedback form scope, acceptance criteria, edge cases, and cross-story rules.
- Prior planning for iteration `customer-feedback-form` defines seven planned stories: public link resolution, 30-day expiry, form display, server validation, record update, repeat-submission display, and non-browser verification.
- `prisma/schema.prisma` contains `FeedbackBatch` and `Feedback` models. `Feedback` includes `productName`, `purchaseDate`, unique `linkIdentifier`, nullable `rating`, nullable `feedbackMessage`, nullable `submittedAt`, and creation/update timestamps.
- `src/features/feedback-request/email.ts` renders customer email links with the `/feedback/{linkIdentifier}` URL contract.
- `src/features/feedback-request/service.ts` creates feedback rows with server-generated unique link identifiers.
- Current source has no public `/feedback` route yet; public route, form, server action, and feedback submission service are delivery work for this iteration.
- Browser, Playwright, e2e tests, temporary app server startup, deployment, publishing, and real email/customer contact are explicitly disallowed for this Codex task.

## Test Approach

Use source-level and non-browser tests for this restricted run, then complete UI/layout confidence later through controller-approved browser verification.

- Route and lookup checks verify that `/feedback/{identifier}` is public, resolves only by `Feedback.linkIdentifier`, validates identifier shape before lookup, and exposes only customer-safe fields.
- Expiry checks use an injectable or parameterized server time to verify 30-day behavior at valid, boundary, and expired ages.
- Display checks inspect the public page/component source and non-browser render paths for product name, purchase date, 1-10 star rating, message textarea, safe escaping, and absence of dashboard/admin UI.
- Validation checks exercise the server-side submission parser with valid ratings, invalid ratings, required normalized message behavior, 200-character limit, tampered fields, malformed identifiers, expired links, and already-submitted rows.
- Persistence checks use mocked Prisma or an isolated test database strategy to prove valid submit updates only `rating`, `feedbackMessage`, `submittedAt`, and normal update timestamps on the existing feedback row.
- Repeat-submission checks verify submitted feedback renders read-only and direct repeat submit attempts do not overwrite stored values.
- Security checks assert that public UI, errors, logs, redirect URLs, and test reports do not expose recipient email, admin data, internal ids, stack traces, database URLs, Auth.js secrets, Gmail credentials, provider tokens, or raw SMTP transcripts.
- Browser tests are designed as pending only and must not be reported as passed unless a later controller-approved run provides evidence.
- Environment setup failures for command resolution, dependency setup, browser launch, browser permissions, or test page setup are blockers, not application defects.

## Traceable Test Cases

| Test id | Story ids | Type | Priority | Test case | Expected result |
| --- | --- | --- | --- | --- | --- |
| FCF-FORM-TC-001 | feedback-public-link-resolution | Route/static | P0 | Inspect delivered `src/app/feedback/[identifier]` route or equivalent. | Public route exists for `/feedback/{identifier}`. |
| FCF-FORM-TC-002 | feedback-public-link-resolution | Route/security | P0 | Invoke or inspect the public feedback route with no Auth.js session. | Route does not require login and does not redirect customers to sign-in, registration, or dashboard. |
| FCF-FORM-TC-003 | feedback-public-link-resolution | Unit/lookup | P0 | Resolve a syntactically valid known identifier. | Lookup returns exactly one feedback row by `Feedback.linkIdentifier`. |
| FCF-FORM-TC-004 | feedback-public-link-resolution | Static/security | P0 | Inspect lookup implementation after delivery. | Lookup does not use raw feedback id, batch id, email, product code, or admin user id. |
| FCF-FORM-TC-005 | feedback-public-link-resolution | Unit/failure | P0 | Resolve an unknown syntactically valid identifier. | Safe unavailable state is returned without exposing nearby identifier existence or database details. |
| FCF-FORM-TC-006 | feedback-public-link-resolution | Unit/failure | P0 | Resolve a missing or empty identifier. | Safe unavailable state is returned and no unrestricted database lookup is performed. |
| FCF-FORM-TC-007 | feedback-public-link-resolution | Unit/failure | P0 | Resolve an identifier with unsupported characters, path traversal-like content, or URL-encoded control characters. | Identifier is rejected safely before unsafe lookup. |
| FCF-FORM-TC-008 | feedback-public-link-resolution | Unit/failure | P0 | Resolve an overlong identifier. | Identifier is rejected before database lookup or with a bounded safe query path. |
| FCF-FORM-TC-009 | feedback-public-link-resolution | Security/static | P0 | Inspect resolved page props or data transfer object. | Only product name, purchase date, submission state, rating/message when submitted, and submit target/token are exposed. |
| FCF-FORM-TC-010 | feedback-public-link-resolution | Security/static | P0 | Search public feedback rendering and errors for internal fields. | Batch metadata, admin user id, recipient email, database ids, stack traces, provider details, and secrets are not exposed. |
| FCF-FORM-TC-011 | feedback-public-link-resolution | Unit/failure | P1 | Simulate database lookup failure. | Customer receives a safe unavailable/failure state and server evidence is sanitized. |
| FCF-FORM-TC-012 | feedback-public-link-resolution | Compatibility | P0 | Verify request email link contract against public route. | `/feedback/{linkIdentifier}` links generated by feedback request emails resolve with the delivered route pattern. |
| FCF-FORM-TC-013 | feedback-link-expiry-rule | Unit/time | P0 | Evaluate a row created 29 days before injected current time. | Link is available if otherwise valid and unsubmitted. |
| FCF-FORM-TC-014 | feedback-link-expiry-rule | Unit/time-boundary | P0 | Evaluate a row at exactly the 30-day boundary. | Boundary behavior is explicitly implemented and source-tested according to the delivery rule. |
| FCF-FORM-TC-015 | feedback-link-expiry-rule | Unit/time | P0 | Evaluate a row older than 30 days. | Link is expired and the form is not available for new submission. |
| FCF-FORM-TC-016 | feedback-link-expiry-rule | Unit/submission-failure | P0 | Directly submit valid payload for an expired identifier. | Database record is not updated and a safe expired/unavailable result is returned. |
| FCF-FORM-TC-017 | feedback-link-expiry-rule | Unit/time | P0 | Run expiry checks with injected server current time. | Tests are deterministic and do not depend on wall-clock timing. |
| FCF-FORM-TC-018 | feedback-link-expiry-rule | Security/static | P0 | Inspect expiry enforcement after delivery. | Expiry is checked server-side on both render and submit paths, not only with client time or hidden fields. |
| FCF-FORM-TC-019 | feedback-link-expiry-rule | Unit/timezone | P1 | Evaluate expiry for feedback created near midnight UTC and local time boundaries. | Thirty-day window is not shifted unexpectedly by client or server timezone display. |
| FCF-FORM-TC-020 | feedback-link-expiry-rule | Unit/state-precedence | P1 | Open a submitted feedback row that is also older than 30 days. | Implementation follows documented precedence between expired and submitted/read-only states. |
| FCF-FORM-TC-021 | feedback-form-display | Component/static | P0 | Render or inspect valid unsubmitted feedback page. | Page displays product name, purchase date, rating control, message textarea, and submit action. |
| FCF-FORM-TC-022 | feedback-form-display | Component/content | P0 | Render product name from stored `Feedback.productName`. | Product name shown to customer matches stored row value after safe display normalization. |
| FCF-FORM-TC-023 | feedback-form-display | Component/content | P0 | Render stored `purchaseDate` that includes a time component. | Customer sees a clear date-only purchase date for the intended purchase calendar day. |
| FCF-FORM-TC-024 | feedback-form-display | Component/static | P0 | Inspect rating UI source. | Rating is presented as a 1 through 10 star scale with accessible names or labels. |
| FCF-FORM-TC-025 | feedback-form-display | Component/static | P0 | Inspect message textarea source. | Textarea is present and communicates or enforces a 200-character limit as client convenience. |
| FCF-FORM-TC-026 | feedback-form-display | Route/security | P0 | Render valid feedback page while unauthenticated. | Public form remains viewable and submittable without an authenticated session. |
| FCF-FORM-TC-027 | feedback-form-display | Security/render | P0 | Render product name containing `<script>` or HTML-like characters. | Product name is escaped and displayed as text, not executed markup. |
| FCF-FORM-TC-028 | feedback-form-display | Unit/failure | P1 | Resolve a row with unexpectedly blank product name. | Page uses a safe fallback or unavailable state and does not crash. |
| FCF-FORM-TC-029 | feedback-form-display | Static/scope | P0 | Inspect public feedback page layout. | Dashboard navigation, admin identity controls, upload controls, Configure controls, and logout controls are absent. |
| FCF-FORM-TC-030 | feedback-form-display | Browser pending/layout | P1 | In a later approved browser run, view long product name on desktop and mobile widths. | Text wraps without covering rating, textarea, or submit controls. |
| FCF-FORM-TC-031 | feedback-form-display | Browser pending/accessibility | P1 | In a later approved browser run, operate the 10-star rating with keyboard and screen-reader labels. | Rating control is understandable and keyboard accessible. |
| FCF-FORM-TC-032 | feedback-form-display | Unit/no-side-effect | P0 | Reload a valid unsubmitted feedback page without submitting. | No feedback database update occurs on read-only page load. |
| FCF-FORM-TC-033 | feedback-server-validation | Unit/validation | P0 | Submit rating `1` with a valid message. | Validation passes. |
| FCF-FORM-TC-034 | feedback-server-validation | Unit/validation | P0 | Submit rating `10` with a valid message. | Validation passes. |
| FCF-FORM-TC-035 | feedback-server-validation | Unit/validation-failure | P0 | Submit rating `0`. | Validation fails and database is not updated. |
| FCF-FORM-TC-036 | feedback-server-validation | Unit/validation-failure | P0 | Submit rating `11`. | Validation fails and database is not updated. |
| FCF-FORM-TC-037 | feedback-server-validation | Unit/validation-failure | P0 | Submit decimal rating `5.5`. | Validation fails and database is not updated. |
| FCF-FORM-TC-038 | feedback-server-validation | Unit/validation-failure | P0 | Submit blank, missing, or non-numeric rating. | Validation fails and database is not updated. |
| FCF-FORM-TC-039 | feedback-server-validation | Unit/validation | P0 | Submit message with exactly 200 normalized characters and valid rating. | Validation passes and message can be persisted. |
| FCF-FORM-TC-040 | feedback-server-validation | Unit/validation-failure | P0 | Submit message with 201 normalized characters. | Validation fails and database is not updated. |
| FCF-FORM-TC-041 | feedback-server-validation | Unit/validation-failure | P0 | Submit empty or whitespace-only message. | Validation fails and database is not updated. |
| FCF-FORM-TC-042 | feedback-server-validation | Unit/normalization | P0 | Submit message with leading and trailing whitespace. | Message is normalized server-side before persistence and length check. |
| FCF-FORM-TC-043 | feedback-server-validation | Unit/input | P1 | Submit message with line breaks and multi-byte characters. | Character counting follows the documented implementation rule consistently. |
| FCF-FORM-TC-044 | feedback-server-validation | Unit/security | P0 | Submit payload with tampered product name, purchase date, email, batch id, or link identifier fields. | Server ignores untrusted fields and uses resolved database row context only. |
| FCF-FORM-TC-045 | feedback-server-validation | Unit/failure | P0 | Direct POST for unknown identifier with otherwise valid payload. | Database is not updated and a safe unavailable error is returned. |
| FCF-FORM-TC-046 | feedback-server-validation | Unit/failure | P0 | Direct POST for malformed identifier with otherwise valid payload. | Database is not updated and no unsafe lookup is performed. |
| FCF-FORM-TC-047 | feedback-server-validation | Unit/failure | P0 | Direct POST for already-submitted identifier with different rating/message. | Database is not changed and repeat-submission rule is enforced. |
| FCF-FORM-TC-048 | feedback-server-validation | Security/failure | P0 | Force malformed form data or server validation error. | Errors are useful but do not expose database ids, stack traces, secrets, or query details. |
| FCF-FORM-TC-049 | feedback-record-update | Integration/persistence | P0 | Submit valid rating `8` and valid message for an unexpired unsubmitted row. | Existing feedback row stores rating `8`, normalized message, and server-side `submittedAt`. |
| FCF-FORM-TC-050 | feedback-record-update | Integration/persistence | P0 | Inspect changed fields after valid submit. | Only `rating`, `feedbackMessage`, `submittedAt`, and normal update timestamp fields change. |
| FCF-FORM-TC-051 | feedback-record-update | Integration/security | P0 | Include tampered immutable fields in valid submit payload. | Stored email, type, productCode, productName, purchaseDate, batchId, linkIdentifier, and email status fields remain unchanged. |
| FCF-FORM-TC-052 | feedback-record-update | Integration/time | P0 | Submit without any client-provided timestamp. | `submittedAt` is set from server-side submission time. |
| FCF-FORM-TC-053 | feedback-record-update | Integration/result | P0 | Submit valid feedback and inspect returned state/page. | Customer sees confirmation or submitted state. |
| FCF-FORM-TC-054 | feedback-record-update | Integration/failure | P0 | Simulate database update failure. | Customer sees safe failure state and success is not claimed. |
| FCF-FORM-TC-055 | feedback-record-update | Integration/concurrency | P0 | Simulate two near-simultaneous valid submits for the same row. | Conditional update or transaction prevents overwriting an already-submitted record. |
| FCF-FORM-TC-056 | feedback-record-update | Integration/failure | P1 | Delete feedback row between render and submit. | Submit fails safely and does not create a replacement feedback row. |
| FCF-FORM-TC-057 | feedback-record-update | Static/scope | P0 | Inspect persistence path after delivery. | Public form updates an existing feedback row and never creates FeedbackBatch or Feedback rows. |
| FCF-FORM-TC-058 | feedback-repeat-submission-display | Component/state | P0 | Open a feedback link where `submittedAt` is non-null. | Existing feedback is shown in submitted/read-only state. |
| FCF-FORM-TC-059 | feedback-repeat-submission-display | Component/state | P0 | Render read-only state for submitted rating. | Existing rating is displayed safely and cannot be edited. |
| FCF-FORM-TC-060 | feedback-repeat-submission-display | Component/state | P0 | Render read-only state for submitted message. | Existing message is displayed safely and cannot be edited. |
| FCF-FORM-TC-061 | feedback-repeat-submission-display | Component/static | P0 | Inspect submitted/read-only page controls. | No enabled edit or resubmit control is rendered. |
| FCF-FORM-TC-062 | feedback-repeat-submission-display | Integration/failure | P0 | Direct repeat submit with different rating and message. | Stored rating, message, and original `submittedAt` do not change. |
| FCF-FORM-TC-063 | feedback-repeat-submission-display | Security/render | P0 | Render submitted message containing HTML-like characters. | Message is escaped and displayed as text, not executed markup. |
| FCF-FORM-TC-064 | feedback-repeat-submission-display | Unit/failure | P1 | Render legacy submitted row with `submittedAt` but missing rating or message. | Page fails safely or uses a clear fallback without crashing or enabling resubmission. |
| FCF-FORM-TC-065 | feedback-repeat-submission-display | Integration/state | P0 | Submit valid feedback and immediately reload the link. | Reloaded page shows submitted/read-only state. |
| FCF-FORM-TC-066 | feedback-repeat-submission-display | Browser pending | P1 | In a later approved browser run, use browser back-button resubmission after submit. | Existing submitted values are not overwritten and user sees read-only/submitted state. |
| FCF-FORM-TC-067 | feedback-form-non-browser-verification | Command | P0 | Run dependency verification with `npm.cmd ls next next-auth @auth/prisma-adapter @prisma/client prisma typescript --depth=0`. | Required baseline dependencies are present, or exact failure is reported as blocker or defect according to cause. |
| FCF-FORM-TC-068 | feedback-form-non-browser-verification | Command | P0 | Run Prisma validation with `npx.cmd prisma validate`. | Prisma schema validates, or exact validation failure is reported. |
| FCF-FORM-TC-069 | feedback-form-non-browser-verification | Command | P0 | Run TypeScript verification with `npx.cmd tsc --noEmit --incremental false`. | TypeScript check passes, or exact compiler failure is reported. |
| FCF-FORM-TC-070 | feedback-form-non-browser-verification | Command | P0 | Run lint verification with `npm.cmd run lint` if the script remains available. | Lint passes, or exact lint failure is reported. |
| FCF-FORM-TC-071 | feedback-form-non-browser-verification | Unit | P0 | Run targeted non-browser tests for identifier resolution and safe unavailable states. | Tests cover known, unknown, malformed, missing, and overlong identifiers. |
| FCF-FORM-TC-072 | feedback-form-non-browser-verification | Unit | P0 | Run targeted non-browser tests for 30-day expiry. | Tests cover valid, boundary, expired, and direct-submit expired cases. |
| FCF-FORM-TC-073 | feedback-form-non-browser-verification | Unit/component | P0 | Run targeted non-browser tests for valid form display data. | Tests cover product name, purchase date, rating scale, textarea limit, unauthenticated access, and escaping. |
| FCF-FORM-TC-074 | feedback-form-non-browser-verification | Unit | P0 | Run targeted non-browser tests for server validation. | Tests cover rating bounds, invalid numeric forms, message required/length rules, tampered fields, and safe errors. |
| FCF-FORM-TC-075 | feedback-form-non-browser-verification | Integration | P0 | Run targeted non-browser persistence tests for valid submit. | Tests prove the existing feedback row is updated atomically and immutable fields are preserved. |
| FCF-FORM-TC-076 | feedback-form-non-browser-verification | Unit/integration | P0 | Run targeted non-browser tests for repeat-submission display and rejection. | Tests prove read-only display and no overwrite on direct repeat submit. |
| FCF-FORM-TC-077 | feedback-form-non-browser-verification | Browser pending | P0 | Run controller-approved browser feedback form verification later. | Browser coverage records actual evidence only when approved; this Codex task must not report it as passed. |

## Coverage Matrix

| Story id | Covered by |
| --- | --- |
| feedback-public-link-resolution | FCF-FORM-TC-001 through FCF-FORM-TC-012 |
| feedback-link-expiry-rule | FCF-FORM-TC-013 through FCF-FORM-TC-020 |
| feedback-form-display | FCF-FORM-TC-021 through FCF-FORM-TC-032 |
| feedback-server-validation | FCF-FORM-TC-033 through FCF-FORM-TC-048 |
| feedback-record-update | FCF-FORM-TC-049 through FCF-FORM-TC-057 |
| feedback-repeat-submission-display | FCF-FORM-TC-058 through FCF-FORM-TC-066 |
| feedback-form-non-browser-verification | FCF-FORM-TC-067 through FCF-FORM-TC-077 |

## Required Test Data And Fixtures

- Feedback row fixtures for valid unsubmitted link, unknown link, malformed identifier, overlong identifier, deleted row, expired row, boundary-age row, and submitted row.
- Product context fixtures for normal product name, long product name, blank product name, HTML-like product name, and purchase dates with time components.
- Server-time fixtures for 29 days old, exactly 30 days old, older than 30 days, near-midnight UTC, and timezone-sensitive boundaries.
- Rating fixtures for `1`, `10`, `0`, `11`, `5.5`, blank, missing, negative, and non-numeric text.
- Message fixtures for valid text, leading/trailing whitespace, whitespace-only text, exactly 200 normalized characters, 201 normalized characters, line breaks, multi-byte characters, and HTML-like content.
- Tampered payload fixtures containing changed product name, purchase date, recipient email, batch id, raw feedback id, link identifier, submittedAt, and email delivery status fields.
- Mock Prisma or isolated database fixtures for successful update, conditional no-op for already-submitted row, expired-row no-op, deleted-row failure, update exception, and near-simultaneous duplicate submit.
- Secret-scrubbing helper for assertions against rendered markup, redirect URLs, form errors, server logs, thrown errors, and test reports.

## Non-Browser Execution Plan

Run these commands when implementation is present, from the project root:

1. `npm.cmd ls next next-auth @auth/prisma-adapter @prisma/client prisma typescript --depth=0`
2. `npx.cmd prisma validate`
3. `npx.cmd tsc --noEmit --incremental false`
4. `npm.cmd run lint`
5. Targeted non-browser unit or integration tests for identifier resolution, expiry, display data, validation, persistence updates, immutable-field preservation, and repeat-submission handling once implemented.

Do not run `npm.cmd run test:e2e`, Playwright, browser launch commands, temporary application servers, deployment, publishing, or real Gmail/customer email delivery in this Codex task. Browser execution remains pending and must be reported as pending unless controller evidence exists.

## Execution Notes

- Do not use real customer data, real OAuth tokens, production database credentials, Gmail credentials, provider secrets, or real customer delivery in automated tests.
- Do not record Gmail app passwords, OAuth client secrets, Auth.js secrets, provider tokens, refresh tokens, id tokens, session tokens, database URLs, raw SMTP transcripts, recipient email addresses, or full feedback link secrets in evidence.
- If `npm.cmd` or `npx.cmd` cannot be found, record the exact command failure as an environment blocker.
- If browser launch, browser permissions, dependency installation, page setup, or temporary app-server startup fails in a later approved run, report that as an environment blocker rather than an application defect.
- Production build verification is not required for each iteration under the recorded process decision and is not part of this test-design action.
- No browser verification, Playwright test, e2e test, app server startup, deployment, publishing, real Gmail delivery, or real customer communication was executed while producing this test design.
