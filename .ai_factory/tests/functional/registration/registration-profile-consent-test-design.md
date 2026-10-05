# Registration Profile And Google Consent Test Design

- Module: registration
- Delivery iteration id: registration-profile-consent
- Delivery iteration title: Registration Profile And Google Consent
- Test design version: 0.1
- Taxonomy: 1.0
- Last updated: 2026-09-14
- Requirements source: `.ai_factory/docs/requirements/modules/registration/registration-profile-consent-requirements.md`
- Planned story ids: `registration-profile-schema`, `registration-name-capture-ui`, `google-registration-consent-gate`, `auth-flow-routing-and-session-safety`, `registration-non-browser-verification`
- Browser status for this Codex task: not run; browser execution is not approved and remains pending controller-approved verification

## Evidence Reviewed

- `.ai_factory/docs/requirements/modules/registration/registration-profile-consent-requirements.md` defines the registration profile and Google consent scope, acceptance criteria, edge cases, and cross-story rules.
- `package.json` includes Next.js, TypeScript, Prisma, NextAuth, Prisma adapter, and Playwright dependencies, plus `lint`, `build`, and `test:e2e` scripts.
- `prisma/schema.prisma` currently defines Auth.js-compatible `User`, `Account`, `Session`, and `VerificationToken` models. At design time, `User` has no `firstName` or `lastName` fields.
- `src/auth.ts` configures `PrismaAdapter`, Google and GitHub providers, database session strategy, `/sign-in`, and `trustHost`.
- `src/app/sign-in/page.tsx` currently offers Google and GitHub provider actions and sends Google directly through `signIn("google", { redirectTo: "/" })`, so first-time Google consent gating is new behavior.
- Prior iteration planning result defines the delivery story list and states browser verification must remain pending in this run.

## Test Approach

Use a layered, non-browser-first design because live OAuth and browser automation are constrained for this run.

- Schema and migration checks verify persistence fields are compatible with existing Auth.js user rows.
- Server-side validation tests cover required first and last name handling, normalization, and prevention of incomplete account creation.
- Auth adapter or route-level tests with mocked provider profile data cover existing Google login, first-time Google consent acceptance, consent rejection, duplicate callbacks, and callback manipulation.
- Session and redirect checks verify successful registration creates a valid persisted session while rejection and provider failures leave the user unauthenticated.
- Browser tests are designed but not executed in this Codex task; they should run later only in a controller-approved browser environment.
- Environment setup failures for browser launch, permissions, dependency resolution, Prisma validation, or TypeScript setup are blockers, not application defects.

## Traceable Test Cases

| Test id | Story ids | Type | Priority | Test case | Expected result |
| --- | --- | --- | --- | --- | --- |
| REG-PC-TC-001 | registration-profile-schema | Static/schema | P0 | Inspect Prisma `User` model after implementation. | `User` includes `firstName` and `lastName` fields separate from `name`. |
| REG-PC-TC-002 | registration-profile-schema | Migration | P0 | Apply the registration profile migration to a database containing legacy users without profile-name values. | Migration succeeds and legacy user rows remain valid without required backfill. |
| REG-PC-TC-003 | registration-profile-schema | Static/schema | P0 | Validate that existing Auth.js models and relations remain present after schema changes. | `User`, `Account`, `Session`, and `VerificationToken` still satisfy adapter needs; provider-account uniqueness remains intact. |
| REG-PC-TC-004 | registration-profile-schema | Integration | P0 | Persist a new user through the completed registration path with first name `Asha` and last name `Rao`. | The user row stores `firstName=Asha` and `lastName=Rao`; `name` is not the only persisted name representation. |
| REG-PC-TC-005 | registration-profile-schema | Integration/failure | P0 | Sign in an existing registered user whose stored profile names already differ from the provider display name. | Login succeeds and existing `firstName`/`lastName` values are not overwritten by routine login. |
| REG-PC-TC-006 | registration-profile-schema | Integration/failure | P1 | Replay a provider callback or adapter account-link operation for an already-linked Google provider account. | No duplicate user/account rows are created and profile names remain consistent. |
| REG-PC-TC-007 | registration-profile-schema | Integration/failure | P1 | Simulate database write failure after registration profile validation but before account completion. | No authenticated session is issued for a partial or incomplete account. |
| REG-PC-TC-008 | registration-name-capture-ui | Browser pending | P0 | Open the registration surface once browser verification is approved. | First name and last name controls are visible, clearly labeled, and reachable by keyboard. |
| REG-PC-TC-009 | registration-name-capture-ui | Unit/server validation | P0 | Submit valid first and last names with leading and trailing spaces. | Values are trimmed before persistence and registration can complete. |
| REG-PC-TC-010 | registration-name-capture-ui | Unit/server validation | P0 | Submit missing first name with a valid last name. | Validation fails, a safe validation message is returned, and no completed account is created. |
| REG-PC-TC-011 | registration-name-capture-ui | Unit/server validation | P0 | Submit a valid first name with missing last name. | Validation fails, a safe validation message is returned, and no completed account is created. |
| REG-PC-TC-012 | registration-name-capture-ui | Unit/server validation | P0 | Submit whitespace-only first and last names. | Validation rejects both fields and does not persist a completed account. |
| REG-PC-TC-013 | registration-name-capture-ui | Unit/server validation | P1 | Submit names containing apostrophes, hyphens, accents, or non-English characters. | Accepted characters are preserved after trimming; validation does not force ASCII-only names. |
| REG-PC-TC-014 | registration-name-capture-ui | Unit/server validation | P1 | Submit names longer than the defined maximum length. | Validation rejects overlong values with a user-safe message and no account creation. |
| REG-PC-TC-015 | registration-name-capture-ui | Integration/failure | P1 | Duplicate-submit the registration completion action. | At most one completed user/account/session is created. |
| REG-PC-TC-016 | google-registration-consent-gate | Integration | P0 | Authenticate with a Google provider identity that already has a linked `Account` row. | Login succeeds through the existing account without showing or requiring first-time consent. |
| REG-PC-TC-017 | google-registration-consent-gate | Integration | P0 | Start Google registration for an unlinked Google provider identity. | Account creation is paused before completion and the user is routed to an explicit consent step. |
| REG-PC-TC-018 | google-registration-consent-gate | Browser pending/content | P0 | Inspect the Google first-time registration consent step once browser verification is approved. | Copy explicitly covers use of Google-provided email, first name, and last name for account setup. |
| REG-PC-TC-019 | google-registration-consent-gate | Integration | P0 | Accept consent for a first-time Google registration with structured `given_name` and `family_name`. | A user/account is created, `firstName` and `lastName` are stored, and the user becomes authenticated. |
| REG-PC-TC-020 | google-registration-consent-gate | Integration/failure | P0 | Reject consent for a first-time Google registration. | No completed user/account registration remains for the attempt, no authenticated session exists, and the user returns to a safe unauthenticated state. |
| REG-PC-TC-021 | google-registration-consent-gate | Integration/failure | P0 | Attempt to bypass consent by calling the callback or completion route directly for an unlinked Google identity. | Account creation is blocked until a valid consent acceptance is present. |
| REG-PC-TC-022 | google-registration-consent-gate | Integration/failure | P1 | Accept consent when Google provides display name but no structured first or last name. | Flow follows the defined fallback, such as requiring missing name entry, before completed registration. |
| REG-PC-TC-023 | google-registration-consent-gate | Integration/failure | P1 | Accept consent when Google provides no usable email or an unverified email. | Registration follows the defined safe handling rule and does not silently create an unsafe account. |
| REG-PC-TC-024 | google-registration-consent-gate | Integration/failure | P1 | Start first-time Google registration with an email matching an existing account from another provider. | Accounts are not automatically merged solely because the email matches. |
| REG-PC-TC-025 | google-registration-consent-gate | Integration/failure | P1 | Refresh or repeat-submit the Google consent decision. | The consent decision is handled idempotently; no duplicate users, accounts, or sessions are created. |
| REG-PC-TC-026 | google-registration-consent-gate | Integration/failure | P1 | Let transient consent state expire, then submit acceptance. | Completion fails safely and sends the user back to sign-in or restart registration. |
| REG-PC-TC-027 | auth-flow-routing-and-session-safety | Integration | P0 | Complete manual/profile registration successfully. | A valid persisted session exists for the newly registered user and redirect target remains compatible with the current app. |
| REG-PC-TC-028 | auth-flow-routing-and-session-safety | Integration | P0 | Complete first-time Google registration after accepting consent. | A valid persisted session exists for the new Google-registered user. |
| REG-PC-TC-029 | auth-flow-routing-and-session-safety | Integration/failure | P0 | Reject first-time Google consent and inspect session state. | No valid session cookie or database session authenticates the rejected attempt. |
| REG-PC-TC-030 | auth-flow-routing-and-session-safety | Integration | P0 | Sign in again as a registered Google user after the consented account exists. | Existing login reaches the configured post-auth route without repeating first-time consent. |
| REG-PC-TC-031 | auth-flow-routing-and-session-safety | Integration/failure | P0 | Simulate OAuth denied authorization, invalid state, or invalid callback code. | User remains unauthenticated and no new user/account/session is created. |
| REG-PC-TC-032 | auth-flow-routing-and-session-safety | Security | P0 | Inspect user-visible auth error messages and returned session data. | No OAuth access tokens, refresh tokens, id tokens, client secrets, auth secrets, database URLs, or raw provider payloads are exposed. |
| REG-PC-TC-033 | auth-flow-routing-and-session-safety | Integration/failure | P1 | Attempt authentication with expired, deleted, or replayed session tokens. | User is not authenticated. |
| REG-PC-TC-034 | auth-flow-routing-and-session-safety | Integration/failure | P1 | Simulate provider downtime or callback timeout. | User remains unauthenticated, can retry later, and no secrets are exposed. |
| REG-PC-TC-035 | registration-non-browser-verification | Command | P0 | Run dependency verification with `npm.cmd ls next next-auth @auth/prisma-adapter @prisma/client prisma typescript --depth=0`. | Required dependencies are present, or the exact failure is reported as blocker or defect according to cause. |
| REG-PC-TC-036 | registration-non-browser-verification | Command | P0 | Run Prisma validation with `npx.cmd prisma validate`. | Prisma schema validates, or the exact validation failure is reported. |
| REG-PC-TC-037 | registration-non-browser-verification | Command | P0 | Run TypeScript verification with `npx.cmd tsc --noEmit --incremental false`. | TypeScript check passes, or the exact compiler failure is reported. |
| REG-PC-TC-038 | registration-non-browser-verification | Unit/integration | P0 | Run targeted non-browser tests for name persistence after implementation. | Tests prove stored `firstName` and `lastName` for successful registration. |
| REG-PC-TC-039 | registration-non-browser-verification | Unit/integration | P0 | Run targeted non-browser tests for existing Google login after implementation. | Tests prove existing linked Google users log in without first-time consent. |
| REG-PC-TC-040 | registration-non-browser-verification | Unit/integration | P0 | Run targeted non-browser tests for accepted first-time Google consent after implementation. | Tests prove accepted consent creates/completes the account and stores available names. |
| REG-PC-TC-041 | registration-non-browser-verification | Unit/integration/failure | P0 | Run targeted non-browser tests for rejected first-time Google consent after implementation. | Tests prove rejected consent creates no completed registration and leaves no authenticated session. |
| REG-PC-TC-042 | registration-non-browser-verification | Browser pending | P0 | Run controller-approved browser registration verification later. | Browser coverage records actual evidence when approved; this Codex task must not report it as passed. |

## Coverage Matrix

| Story id | Covered by |
| --- | --- |
| registration-profile-schema | REG-PC-TC-001 through REG-PC-TC-007 |
| registration-name-capture-ui | REG-PC-TC-008 through REG-PC-TC-015 |
| google-registration-consent-gate | REG-PC-TC-016 through REG-PC-TC-026 |
| auth-flow-routing-and-session-safety | REG-PC-TC-027 through REG-PC-TC-034 |
| registration-non-browser-verification | REG-PC-TC-035 through REG-PC-TC-042 |

## Required Test Data And Fixtures

- Isolated PostgreSQL test database configured through a non-production `DATABASE_URL`.
- Legacy user fixture with no `firstName` and `lastName` values.
- Existing Google-linked user fixture with one `User`, one Google `Account`, and optional database `Session`.
- New Google profile fixtures:
  - structured name profile with email, `given_name`, and `family_name`
  - display-name-only profile
  - missing-name profile
  - missing or unverified email profile
  - same-email different-provider profile
- Manual/profile registration input fixtures for valid names, missing names, whitespace-only names, overlong names, punctuation, accents, and non-English characters.
- Mockable Auth.js or adapter harness to simulate provider callbacks, consent acceptance/rejection, duplicate callbacks, expired transient state, provider denial, invalid state, invalid code, and database write failure.
- Secret-scrubbing helper for assertions against rendered messages, response bodies, logs, and session payloads.

## Non-Browser Execution Plan

Run these commands when the implementation is present, from the project root:

1. `npm.cmd ls next next-auth @auth/prisma-adapter @prisma/client prisma typescript --depth=0`
2. `npx.cmd prisma validate`
3. `npx.cmd tsc --noEmit --incremental false`
4. Targeted unit or integration tests for `REG-PC-TC-038` through `REG-PC-TC-041` once implemented.

Do not run `npm.cmd run test:e2e`, Playwright, browser launch commands, or temporary application servers in this Codex task. Browser execution remains pending and must be reported as pending unless controller evidence exists.

## Execution Notes

- Do not use real customer data, real OAuth tokens, or production database credentials in test fixtures or reports.
- Do not record OAuth client secrets, auth secrets, provider tokens, refresh tokens, id tokens, session tokens, or database URLs in evidence.
- If `npm.cmd` or `npx.cmd` cannot be found, record the exact command failure as an environment blocker.
- If browser launch, browser permissions, dependency installation, or page setup fails in a later approved run, report that as an environment blocker rather than an application defect.
- No browser verification was executed while producing this test design.
