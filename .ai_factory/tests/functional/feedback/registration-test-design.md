# Registration Test Design

- Module: feedback
- Intake: `.ai_factory/delivery/intakes/13612888-96ef-4fa4-a304-4a400d9f2e24.md`
- Delivery iteration: 1
- Test design version: 0.1
- Requirements source: `.ai_factory/docs/requirements/modules/feedback/registration-requirements.md`
- Plan source: `.ai_factory/delivery/planning/registration-baseline.md`
- Scope: customer registration and sign-in with Google and GitHub using Auth.js, Prisma, PostgreSQL, and database sessions

## Evidence Reviewed

- `.ai_factory/docs/requirements/modules/feedback/registration-requirements.md` defines six planned story ids, acceptance criteria, edge cases, and cross-story rules.
- `.ai_factory/delivery/planning/registration-baseline.md` defines provider choices, database sessions, Prisma/PostgreSQL persistence, callback routes, redirect target `/`, and account-linking boundaries.
- `src/auth.ts` wires `PrismaAdapter`, Google and GitHub providers, database session strategy, secret fallback, and `/sign-in`.
- `src/app/api/auth/[...nextauth]/route.ts` exposes Auth.js `GET` and `POST` handlers.
- `src/app/sign-in/page.tsx` renders Customer Feedback Portal branding and Google/GitHub server-action sign-in buttons.
- `prisma/schema.prisma` defines Auth.js-compatible `User`, `Account`, `Session`, and `VerificationToken` models with provider-account and session-token uniqueness.
- `package.json` defines `lint`, `build`, and `test:e2e` scripts and includes Next.js, TypeScript, Playwright, NextAuth/Auth.js, Prisma adapter, Prisma Client, and Prisma CLI dependencies.

## Test Approach

Use a layered test set because full OAuth completion depends on external provider apps and reachable callback URLs.

- Static and configuration tests verify provider wiring, secret resolution, route exposure, Prisma schema structure, and dependency availability.
- Playwright browser tests verify `/sign-in` rendering, accessible provider actions, safe error-state rendering, and provider initiation redirects or requests.
- Integration tests with a controlled test database or Auth.js adapter harness verify User, Account, and Session persistence behavior for successful and repeated sign-ins.
- Failure-path tests use mocked provider callbacks, Auth.js test harnesses, or controlled callback requests where live OAuth cannot be exercised.
- Environment setup failures for browser launch, permissions, dependency installation, Prisma validation, database connection, or page setup are blockers, not application defects.

## Traceable Test Cases

| Test id | Story ids | Type | Priority | Test case | Expected result |
| --- | --- | --- | --- | --- | --- |
| REG-TC-001 | registration-auth-foundation | Static/config | P0 | Inspect Auth.js configuration for Google provider credential mapping. | Google provider reads `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`; no secret values are exposed in source or output. |
| REG-TC-002 | registration-auth-foundation | Static/config | P0 | Inspect Auth.js configuration for GitHub provider credential mapping. | GitHub provider reads `GITHUB_ID` and `GITHUB_SECRET`; no secret values are exposed in source or output. |
| REG-TC-003 | registration-auth-foundation | Static/config | P0 | Load auth configuration with `AUTH_SECRET` absent and `NEXTAUTH_SECRET` present. | Auth configuration resolves a non-empty secret through the documented fallback. |
| REG-TC-004 | registration-auth-foundation | API/route | P0 | Request Auth.js provider sign-in endpoint for Google with valid local configuration. | Application starts the Google Auth.js flow and redirects to the Google authorization endpoint or Auth.js provider handoff. |
| REG-TC-005 | registration-auth-foundation | API/route | P0 | Request Auth.js provider sign-in endpoint for GitHub with valid local configuration. | Application starts the GitHub Auth.js flow and redirects to the GitHub authorization endpoint or Auth.js provider handoff. |
| REG-TC-006 | registration-auth-foundation | API/route | P0 | Inspect or exercise `/api/auth/[...nextauth]` route handlers. | Route exports both `GET` and `POST` handlers from Auth.js. |
| REG-TC-007 | registration-auth-foundation, registration-prisma-persistence | Failure | P0 | Submit callback request with an unknown provider id. | Auth.js rejects the request; no User, Account, or Session row is created. |
| REG-TC-008 | registration-auth-foundation, registration-failure-handling | Failure | P0 | Submit callback request with invalid or missing OAuth `state`. | Auth.js rejects the request; customer is unauthenticated and no secrets or tokens are visible. |
| REG-TC-009 | registration-auth-foundation, registration-failure-handling | Failure | P1 | Run provider-startup/config verification with missing Google credentials in an isolated environment. | Provider startup fails safely or produces a configuration error without printing client secret values. |
| REG-TC-010 | registration-auth-foundation, registration-failure-handling | Failure | P1 | Run provider-startup/config verification with missing GitHub credentials in an isolated environment. | Provider startup fails safely or produces a configuration error without printing client secret values. |
| REG-TC-011 | registration-prisma-persistence | Static/schema | P0 | Validate Prisma datasource and generator configuration. | `datasource db` uses PostgreSQL and `env("DATABASE_URL")`; Prisma Client generator is present. |
| REG-TC-012 | registration-prisma-persistence | Static/schema | P0 | Validate Auth.js persistence model structure. | `User`, `Account`, `Session`, and `VerificationToken` models exist with required relation fields. |
| REG-TC-013 | registration-prisma-persistence | Static/schema | P0 | Validate Account uniqueness constraint. | `Account` enforces uniqueness on provider and provider account id. |
| REG-TC-014 | registration-prisma-persistence | Static/schema | P0 | Validate cascade delete behavior. | Account and Session relations cascade when a User is deleted. |
| REG-TC-015 | registration-prisma-persistence | Integration | P0 | Complete first successful Google OAuth registration against a test database. | Exactly one User and one Google Account are persisted for the provider identity. |
| REG-TC-016 | registration-prisma-persistence | Integration | P0 | Complete first successful GitHub OAuth registration against a test database. | Exactly one User and one GitHub Account are persisted for the provider identity. |
| REG-TC-017 | registration-prisma-persistence | Integration | P0 | Repeat Google sign-in for the same provider account id. | Existing Account is reused; no duplicate Account row is created. |
| REG-TC-018 | registration-prisma-persistence | Integration | P0 | Repeat GitHub sign-in for the same provider account id. | Existing Account is reused; no duplicate Account row is created. |
| REG-TC-019 | registration-prisma-persistence | Integration/failure | P1 | Replay a successful callback or adapter account-link operation for the same provider account id. | Duplicate processing is rejected or idempotently resolved without duplicate Account rows. |
| REG-TC-020 | registration-prisma-persistence | Integration/failure | P1 | Simulate provider profile without email. | Registration relies on provider account identity and persists available profile data without requiring product-specific profile fields. |
| REG-TC-021 | registration-prisma-persistence | Integration/failure | P1 | Register Google and GitHub identities that share an email while not already signed in for linking. | Accounts are not automatically merged solely because email matches; behavior follows Auth.js account-linking rules. |
| REG-TC-022 | registration-prisma-persistence, registration-failure-handling | Integration/failure | P0 | Simulate database unavailability during provider callback persistence. | Registration does not complete; no authenticated session is issued; partial writes are avoided or rolled back. |
| REG-TC-023 | registration-database-sessions | Static/config | P0 | Inspect Auth.js session configuration. | Session strategy is `database`. |
| REG-TC-024 | registration-database-sessions | Integration | P0 | Complete a successful provider callback and inspect test database. | Session row exists for the signed-in user. |
| REG-TC-025 | registration-database-sessions | Integration/API | P0 | Resolve an authenticated request with a valid session cookie. | Auth.js resolves the cookie to the persisted session and associated user identity. |
| REG-TC-026 | registration-database-sessions | Integration/API | P0 | Sign out a registered customer. | Prior session is removed or invalidated and can no longer authenticate the customer. |
| REG-TC-027 | registration-database-sessions | Browser | P0 | Navigate to `/sign-in` without a valid session. | Sign-in page is reachable and renders normally. |
| REG-TC-028 | registration-database-sessions | Integration/failure | P1 | Attempt authentication with an expired database session. | Customer is not authenticated. |
| REG-TC-029 | registration-database-sessions | Integration/failure | P1 | Attempt authentication with a deleted or replayed session token. | Customer is not authenticated. |
| REG-TC-030 | registration-database-sessions | Browser/security | P1 | Inspect browser-visible state after successful sign-in. | Raw provider tokens are not stored in browser-visible application state. |
| REG-TC-031 | registration-sign-in-experience | Browser | P0 | Open `/sign-in`. | Customer Feedback Portal branding is visible. |
| REG-TC-032 | registration-sign-in-experience | Browser | P0 | Open `/sign-in` and locate provider actions. | Google and GitHub actions are visible with understandable customer-facing labels. |
| REG-TC-033 | registration-sign-in-experience | Browser/accessibility | P0 | Navigate provider actions by keyboard and activate each with standard button behavior. | Focus reaches both provider actions; activation submits the matching provider action. |
| REG-TC-034 | registration-sign-in-experience | Browser/API | P0 | Activate Google action from `/sign-in`. | Google provider flow begins through Auth.js. |
| REG-TC-035 | registration-sign-in-experience | Browser/API | P0 | Activate GitHub action from `/sign-in`. | GitHub provider flow begins through Auth.js. |
| REG-TC-036 | registration-sign-in-experience | Browser/content | P1 | Inspect `/sign-in` visible copy. | Copy is scoped to customer access and does not promise administrator authorization. |
| REG-TC-037 | registration-sign-in-experience | Browser/progressive enhancement | P1 | Validate provider submission path when hydration is delayed or JavaScript is unavailable where framework test setup supports it. | Server action or framework fallback preserves a valid provider submission path, or a documented framework limitation is recorded. |
| REG-TC-038 | registration-failure-handling | Integration/failure | P0 | Simulate Google denied consent or cancelled provider return. | No new User, Account, or Session row is created for the attempt; customer can return to sign-in. |
| REG-TC-039 | registration-failure-handling | Integration/failure | P0 | Simulate GitHub denied consent or cancelled provider return. | No new User, Account, or Session row is created for the attempt; customer can return to sign-in. |
| REG-TC-040 | registration-failure-handling | Integration/failure | P0 | Simulate provider OAuth error during callback handling. | No session is created; visible state contains no client secrets, auth secrets, access tokens, refresh tokens, id tokens, or raw provider token payloads. |
| REG-TC-041 | registration-failure-handling | Integration/failure | P1 | Simulate expired callback code. | Auth.js rejects the callback; no application identity or session is created. |
| REG-TC-042 | registration-failure-handling | Integration/failure | P1 | Simulate provider downtime while starting or completing OAuth. | Customer remains unauthenticated and can retry later; no secrets are exposed. |
| REG-TC-043 | registration-verification-coverage | Command | P0 | Run dependency verification: `npm.cmd ls next-auth @auth/core @auth/prisma-adapter @prisma/client prisma --depth=0`. | Required dependencies are present, or exact failure is reported as blocker or defect according to cause. |
| REG-TC-044 | registration-verification-coverage | Command | P0 | Run Prisma schema validation: `npx.cmd prisma validate`. | Prisma schema validates, or exact failure is reported. |
| REG-TC-045 | registration-verification-coverage | Command | P0 | Run TypeScript verification: `npx.cmd tsc --noEmit --incremental false`. | TypeScript check passes, or exact failure is reported. |
| REG-TC-046 | registration-verification-coverage | Command | P0 | Run lint verification: `npm.cmd run lint`. | Lint passes, or exact failure is reported. |
| REG-TC-047 | registration-verification-coverage | Command/browser | P0 | Run functional verification: `npm.cmd run test:e2e` or targeted Playwright registration tests once implemented. | Provider option visibility and error-safe behavior pass, or browser/page/dependency setup failure is reported as an environment blocker. |

## Coverage Matrix

| Story id | Covered by |
| --- | --- |
| registration-auth-foundation | REG-TC-001 through REG-TC-010 |
| registration-prisma-persistence | REG-TC-011 through REG-TC-022 |
| registration-database-sessions | REG-TC-023 through REG-TC-030 |
| registration-sign-in-experience | REG-TC-031 through REG-TC-037 |
| registration-failure-handling | REG-TC-007 through REG-TC-010, REG-TC-022, REG-TC-038 through REG-TC-042 |
| registration-verification-coverage | REG-TC-043 through REG-TC-047 |

## Required Test Data And Fixtures

- Isolated test PostgreSQL database configured through `DATABASE_URL`.
- OAuth provider test applications for Google and GitHub with callback URLs matching `/api/auth/callback/google` and `/api/auth/callback/github`.
- Mocked or controlled provider callback data for cancellation, denied consent, invalid state, invalid code, expired code, missing email, duplicate callback, and provider downtime cases.
- Database cleanup fixture that removes test Users, Accounts, Sessions, and VerificationTokens between tests.
- Secret-scrubbing assertion helper for visible page content, response bodies, logs captured for test evidence, and browser storage inspection.

## Execution Notes

- Live OAuth completion should be run only in an environment approved for provider test credentials and reachable callback URLs.
- Where live OAuth is unavailable, provider initiation, UI rendering, safe error handling, and adapter persistence behavior should still be tested through route-level, mocked-provider, or adapter-level tests.
- Do not record real OAuth client secrets, auth secrets, provider tokens, refresh tokens, id tokens, session tokens, or database credentials in test reports.
- Do not report browser launch, permission, dependency, or page setup failures as application defects. Record the exact failed command and error as blockers.
- No tests were executed while producing this test design.
