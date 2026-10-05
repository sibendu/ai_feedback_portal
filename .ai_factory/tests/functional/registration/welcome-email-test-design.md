# Welcome Email On Registration Test Design

- Module: registration
- Delivery iteration id: welcome-email
- Delivery iteration title: Welcome Email On Registration
- Test design version: 0.1
- Taxonomy: 1.0
- Last updated: 2026-09-14
- Requirements source: `.ai_factory/docs/requirements/modules/registration/welcome-email-requirements.md`
- Planned story ids: `welcome-email-sender-configuration`, `welcome-email-registration-trigger`, `welcome-email-failure-handling`, `welcome-email-duplicate-avoidance`, `welcome-email-non-browser-verification`
- Browser status for this Codex task: not run; browser execution is not approved and remains pending controller-approved verification

## Evidence Reviewed

- `.ai_factory/docs/requirements/modules/registration/welcome-email-requirements.md` defines the welcome-email scope, acceptance criteria, edge cases, and cross-story rules.
- Prior planning for iteration `welcome-email` defines five planned story ids and requires Gmail environment configuration, new-registration triggering, failure handling, duplicate avoidance, and mocked or injectable sender verification.
- `package.json` includes Next.js, TypeScript, Prisma, NextAuth, and the Prisma adapter. It does not currently include a dedicated mail package such as Nodemailer.
- `prisma/schema.prisma` includes the prerequisite `User.firstName` and `User.lastName` fields from `registration-profile-consent`.
- `src/auth.ts` uses `PrismaAdapter(prisma)`, Google and GitHub providers, database sessions, and a sign-in callback that distinguishes existing provider accounts from first-time Google registration.
- `src/app/register/actions.ts` stores transient first and last names, sets Google profile consent for accepted Google registration, and redirects rejected consent without creating an authenticated session.
- `.env.local` was treated as secret-bearing configuration; prior readiness evidence records presence of key names `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `GMAIL_FROM` without exposing values.

## Test Approach

Use non-browser source-level tests for this iteration because browser execution, Playwright, temporary application servers, deployment, publishing, and real Gmail delivery are not approved for this Codex task.

- Server-only configuration tests verify Gmail env keys are read through server code and secrets are not bundled or logged.
- Unit tests exercise the injectable welcome sender with mocked success, missing configuration, invalid recipient, provider failure, timeout, and template failure results.
- Auth or registration integration tests use mocked Prisma/Auth.js seams to prove welcome attempts happen only after new user creation.
- Duplicate tests verify existing-user login and repeated callback/event execution do not send extra registration welcomes.
- Failure tests prove registration success semantics survive welcome sender errors.
- Browser tests are documented as pending only and must run later in a controller-approved environment.
- Environment setup failures for dependency resolution, browser launch, permissions, Prisma validation, TypeScript setup, or page setup are blockers, not application defects.

## Traceable Test Cases

| Test id | Story ids | Type | Priority | Test case | Expected result |
| --- | --- | --- | --- | --- | --- |
| REG-WE-TC-001 | welcome-email-sender-configuration | Static/security | P0 | Inspect the implemented welcome email sender module imports and consumers. | Sender code is server-only, is not imported by client components, and Gmail secrets cannot enter browser-visible bundles. |
| REG-WE-TC-002 | welcome-email-sender-configuration | Unit/config | P0 | Initialize sender configuration with `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `GMAIL_FROM` present. | Configuration succeeds and uses `GMAIL_FROM` as the outbound from address, even when it differs from `GMAIL_USER`. |
| REG-WE-TC-003 | welcome-email-sender-configuration | Unit/config/failure | P0 | Request a welcome send with `GMAIL_USER` missing. | Sender returns or throws a deterministic missing-configuration result handled by registration code; no secret values are logged. |
| REG-WE-TC-004 | welcome-email-sender-configuration | Unit/config/failure | P0 | Request a welcome send with `GMAIL_APP_PASSWORD` missing. | Sender returns or throws a deterministic missing-configuration result handled by registration code; no secret values are logged. |
| REG-WE-TC-005 | welcome-email-sender-configuration | Unit/config/failure | P0 | Request a welcome send with `GMAIL_FROM` missing. | Sender returns or throws a deterministic missing-configuration result handled by registration code; no secret values are logged. |
| REG-WE-TC-006 | welcome-email-sender-configuration | Unit/failure | P0 | Send to blank, whitespace-only, or malformed recipient email values. | Sender reports invalid recipient or skipped delivery without contacting Gmail and without blocking registration success. |
| REG-WE-TC-007 | welcome-email-sender-configuration | Unit/content | P1 | Generate welcome email content for a user with first name, last name, display name, and email. | Content identifies Customer Feedback Portal and uses only safe account-facing fields; it excludes OAuth tokens, database ids, app passwords, and raw provider payloads. |
| REG-WE-TC-008 | welcome-email-sender-configuration | Unit/content | P1 | Generate welcome email content when first or last name is absent. | Content falls back to display name, email, or a generic greeting without throwing. |
| REG-WE-TC-009 | welcome-email-sender-configuration | Unit/mockability | P0 | Inject a mock sender into welcome-registration logic. | Test can assert sender calls without making a real Gmail connection. |
| REG-WE-TC-010 | welcome-email-registration-trigger | Integration | P0 | Complete a new manual/profile registration with valid first name, last name, and email. | User creation succeeds first, then exactly one welcome email attempt is made for the new user. |
| REG-WE-TC-011 | welcome-email-registration-trigger | Integration | P0 | Complete accepted first-time Google registration with profile consent and a usable email. | User/account creation succeeds first, then exactly one welcome email attempt is made for the new Google-registered user. |
| REG-WE-TC-012 | welcome-email-registration-trigger | Integration/failure | P0 | Reject first-time Google consent. | No completed registration is created and no welcome email attempt is made. |
| REG-WE-TC-013 | welcome-email-registration-trigger | Integration/failure | P0 | Simulate user persistence failure before account creation completes. | No welcome email attempt is made because registration did not succeed. |
| REG-WE-TC-014 | welcome-email-registration-trigger | Integration/failure | P0 | Complete new registration where the provider or form yields no usable recipient email. | Registration remains successful, email delivery is skipped or marked failed deterministically, and no real Gmail call is made. |
| REG-WE-TC-015 | welcome-email-registration-trigger | Integration | P1 | Complete first-time GitHub registration using the existing profile-name capture flow. | New persisted user is eligible for one welcome email attempt if an email address is available. |
| REG-WE-TC-016 | welcome-email-registration-trigger | Integration | P1 | Simulate session creation failure after user creation where the selected implementation uses a create-user event. | Welcome behavior follows documented account-created semantics and does not create duplicate user rows. |
| REG-WE-TC-017 | welcome-email-failure-handling | Unit/failure | P0 | Mock sender rejects with a provider authentication error after user creation. | Error is caught, registration remains successful, and safe failure status/log context is produced. |
| REG-WE-TC-018 | welcome-email-failure-handling | Unit/failure | P0 | Mock sender rejects with a timeout after user creation. | Error is caught, registration remains successful, and no retry loop blocks the auth callback. |
| REG-WE-TC-019 | welcome-email-failure-handling | Unit/failure | P0 | Mock sender returns missing-configuration status after user creation. | Registration remains successful and failure handling is deterministic for tests. |
| REG-WE-TC-020 | welcome-email-failure-handling | Unit/failure | P0 | Mock email template rendering throws before provider send. | Error is caught like a send failure and does not roll back the created user/account/session. |
| REG-WE-TC-021 | welcome-email-failure-handling | Security | P0 | Capture logs or returned failure messages from sender errors. | Messages include safe context such as user id or recipient email but exclude `GMAIL_APP_PASSWORD`, OAuth tokens, refresh tokens, id tokens, database URLs, Auth.js secrets, and raw provider payloads. |
| REG-WE-TC-022 | welcome-email-failure-handling | Integration | P1 | After a welcome send failure, sign in later as the newly created user. | User remains registered and can authenticate normally. |
| REG-WE-TC-023 | welcome-email-failure-handling | Documentation/static | P1 | Inspect implementation notes for failed welcome delivery behavior. | Code or docs define whether failed welcome sends are one-time logged failures or future retry/outbox candidates. |
| REG-WE-TC-024 | welcome-email-duplicate-avoidance | Integration | P0 | Sign in with an already linked Google account. | Existing-user login succeeds and sends no welcome email. |
| REG-WE-TC-025 | welcome-email-duplicate-avoidance | Integration | P0 | Sign in with an already linked GitHub account. | Existing-user login succeeds and sends no welcome email. |
| REG-WE-TC-026 | welcome-email-duplicate-avoidance | Unit/integration | P0 | Process the same new-user welcome trigger twice for the same persisted user. | At most one welcome email is sent for that registration. |
| REG-WE-TC-027 | welcome-email-duplicate-avoidance | Unit/integration | P0 | Repeat an OAuth callback, browser refresh, or provider retry after the user/account already exists. | Repeat execution follows existing-user semantics and does not send another welcome. |
| REG-WE-TC-028 | welcome-email-duplicate-avoidance | Integration/failure | P1 | Previous welcome send failed, then the same user logs in later. | Implementation follows its documented rule and does not accidentally treat login as a fresh registration welcome. |
| REG-WE-TC-029 | welcome-email-duplicate-avoidance | Integration/concurrency | P1 | Simulate concurrent processing for the same newly created user when duplicate prevention state is persisted. | Duplicate handling is resilient enough that at most one welcome is recorded or sent. |
| REG-WE-TC-030 | welcome-email-duplicate-avoidance | Migration/static | P1 | If a sent-status or outbox field/table is introduced, validate migration compatibility with existing users. | Migration preserves existing rows and uses nullable/default values that do not require unsafe backfill. |
| REG-WE-TC-031 | welcome-email-duplicate-avoidance | Integration | P1 | Delete and recreate a user with the same email in isolated test data. | Welcome behavior follows the new persisted user record semantics, not email-address matching alone. |
| REG-WE-TC-032 | welcome-email-non-browser-verification | Command | P0 | Run dependency verification with `npm.cmd ls next next-auth @auth/prisma-adapter @prisma/client prisma typescript --depth=0`. | Required baseline dependencies are present, or the exact failure is reported as blocker or defect according to cause. |
| REG-WE-TC-033 | welcome-email-non-browser-verification | Command | P0 | Run mail dependency verification after implementation, such as `npm.cmd ls nodemailer @types/nodemailer --depth=0` if Nodemailer is selected. | Selected sender dependencies are present, or missing packages are reported as delivery work/blocker based on task phase. |
| REG-WE-TC-034 | welcome-email-non-browser-verification | Command | P0 | Run Prisma validation with `npx.cmd prisma validate`. | Prisma schema validates, or the exact validation failure is reported. |
| REG-WE-TC-035 | welcome-email-non-browser-verification | Command | P0 | Run TypeScript verification with `npx.cmd tsc --noEmit --incremental false`. | TypeScript check passes, or the exact compiler failure is reported. |
| REG-WE-TC-036 | welcome-email-non-browser-verification | Unit | P0 | Run targeted non-browser tests for Gmail env configuration. | Tests cover present and missing env keys without printing secret values. |
| REG-WE-TC-037 | welcome-email-non-browser-verification | Unit/integration | P0 | Run targeted non-browser tests for successful new-user welcome attempts. | Tests assert exactly one mocked sender attempt after successful new registration. |
| REG-WE-TC-038 | welcome-email-non-browser-verification | Unit/integration/failure | P0 | Run targeted non-browser tests for existing-user duplicate avoidance. | Tests assert no mocked sender call for existing Google and GitHub logins. |
| REG-WE-TC-039 | welcome-email-non-browser-verification | Unit/integration/failure | P0 | Run targeted non-browser tests for sender failure handling. | Tests assert sender errors are caught and registration success remains observable. |
| REG-WE-TC-040 | welcome-email-non-browser-verification | Browser pending | P0 | Run controller-approved browser registration verification later. | Browser coverage records real evidence only when approved; this Codex task must not report it as passed. |

## Coverage Matrix

| Story id | Covered by |
| --- | --- |
| welcome-email-sender-configuration | REG-WE-TC-001 through REG-WE-TC-009 |
| welcome-email-registration-trigger | REG-WE-TC-010 through REG-WE-TC-016 |
| welcome-email-failure-handling | REG-WE-TC-017 through REG-WE-TC-023 |
| welcome-email-duplicate-avoidance | REG-WE-TC-024 through REG-WE-TC-031 |
| welcome-email-non-browser-verification | REG-WE-TC-032 through REG-WE-TC-040 |

## Required Test Data And Fixtures

- Isolated PostgreSQL test database configured through a non-production `DATABASE_URL`.
- New manual/profile registration fixture with first name, last name, display name, and email.
- Accepted first-time Google registration fixture with provider account id, email, `given_name`, `family_name`, and consent accepted.
- Rejected Google consent fixture with no completed user/account/session.
- Existing Google-linked and GitHub-linked user fixtures with one `User`, one `Account`, and optional database `Session`.
- Existing legacy user fixture created before welcome-email duplicate state, if a sent-status or outbox migration is added.
- Provider profile fixtures with missing email, malformed email, missing structured names, display-name-only profile, and same visible email from another provider.
- Gmail env fixtures for all keys present, each key missing individually, blank values, whitespace values, and invalid credentials represented by mocked provider failure.
- Mock sender fixtures for success, missing configuration, invalid recipient, provider authentication failure, timeout, rate limit, and thrown template-rendering error.
- Secret-scrubbing helper for assertions against logs, response bodies, rendered email content, thrown errors, and test reports.

## Non-Browser Execution Plan

Run these commands when the implementation is present, from the project root:

1. `npm.cmd ls next next-auth @auth/prisma-adapter @prisma/client prisma typescript --depth=0`
2. `npm.cmd ls <selected-mail-dependency> --depth=0`, for example `npm.cmd ls nodemailer @types/nodemailer --depth=0` if Nodemailer is selected.
3. `npx.cmd prisma validate`
4. `npx.cmd tsc --noEmit --incremental false`
5. Targeted unit or integration tests for `REG-WE-TC-036` through `REG-WE-TC-039` once implemented.

Do not run `npm.cmd run test:e2e`, Playwright, browser launch commands, temporary application servers, deployment, publishing, or real Gmail delivery in this Codex task. Browser execution remains pending and must be reported as pending unless controller evidence exists.

## Execution Notes

- Do not use real customer data, real OAuth tokens, production database credentials, or real Gmail delivery in automated tests.
- Do not record Gmail app passwords, OAuth client secrets, Auth.js secrets, provider tokens, refresh tokens, id tokens, session tokens, or database URLs in evidence.
- If `npm.cmd` or `npx.cmd` cannot be found, record the exact command failure as an environment blocker.
- If a dependency install is required for the selected sender but unavailable in the environment, record the exact blocker instead of masking it with application code.
- If browser launch, browser permissions, dependency installation, or page setup fails in a later approved run, report that as an environment blocker rather than an application defect.
- No browser verification, Playwright test, app server startup, deployment, publishing, or real Gmail delivery was executed while producing this test design.
