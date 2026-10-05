# Registration Requirements

- Module: feedback
- Intake: `.ai_factory/delivery/intakes/13612888-96ef-4fa4-a304-4a400d9f2e24.md`
- Delivery iteration: 1
- Source plan: `.ai_factory/delivery/planning/registration-baseline.md`
- Status: elaborated for delivery

## Scope

Add customer registration and sign-in through Google and GitHub accounts for the Customer Feedback Portal. The feature establishes customer identity, persists OAuth-backed account records, creates database-backed sessions, and provides a customer-facing sign-in experience. Administrator authorization, customer profile enrichment, manual account linking, password registration, and protected feedback workflows are out of scope for this iteration.

## Evidence

- Intake requests: "Add a Registration feature, allowing customers to register using their Google and Github accounts."
- Baseline plan chooses Auth.js / NextAuth v5, Google and GitHub OAuth providers, Prisma/PostgreSQL persistence, database sessions, callback routes `/api/auth/callback/google` and `/api/auth/callback/github`, and post-registration redirect `/`.
- `src/auth.ts` configures `PrismaAdapter`, Google and GitHub providers, database session strategy, `AUTH_SECRET` / `NEXTAUTH_SECRET` secret resolution, and `/sign-in` as the sign-in page.
- `src/app/api/auth/[...nextauth]/route.ts` exposes the Auth.js route handlers.
- `src/app/sign-in/page.tsx` renders Customer Feedback Portal customer access branding and Google/GitHub provider actions.
- `prisma/schema.prisma` defines PostgreSQL-backed Auth.js-compatible `User`, `Account`, `Session`, and `VerificationToken` models, including unique provider account and session token constraints.
- `prisma/migrations/20260913153623_registration_baseline/migration.sql` creates the corresponding database tables, indexes, and cascading foreign keys.

## Story Requirements

### registration-auth-foundation

Configure Google and GitHub OAuth registration for customers.

Requirements:

- The application shall support customer registration and sign-in through Google OAuth.
- The application shall support customer registration and sign-in through GitHub OAuth.
- The Google provider shall read `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- The GitHub provider shall read `GITHUB_ID` and `GITHUB_SECRET`.
- The authentication secret shall resolve from `AUTH_SECRET` when present, otherwise from `NEXTAUTH_SECRET`.
- The application shall expose Auth.js handlers through the framework-native `/api/auth/[...nextauth]` route.
- The OAuth callback URLs shall be compatible with `/api/auth/callback/google` and `/api/auth/callback/github`.
- A successful provider callback shall redirect customers to `/`.
- The feature shall not promise or grant administrator access.

Acceptance criteria:

- Given provider credentials are configured, when a customer chooses Google, then the application starts the Google Auth.js provider flow.
- Given provider credentials are configured, when a customer chooses GitHub, then the application starts the GitHub Auth.js provider flow.
- Given a successful Google callback, when Auth.js completes registration or sign-in, then the customer is redirected to `/`.
- Given a successful GitHub callback, when Auth.js completes registration or sign-in, then the customer is redirected to `/`.
- Given `AUTH_SECRET` is absent and `NEXTAUTH_SECRET` is present, when the auth configuration loads, then the session secret is still available.

Edge cases:

- Missing or invalid provider credentials should fail configuration or provider startup without exposing secret values.
- Provider callback requests with invalid state, code, or provider identifiers should be rejected by Auth.js.
- Customers who abandon the provider flow should not be considered registered.
- Direct visits to unknown Auth.js provider routes should not create identities or sessions.

### registration-prisma-persistence

Persist registered customer identities with Prisma.

Requirements:

- The application shall use PostgreSQL through Prisma for registration persistence.
- The Prisma datasource shall read its connection string from `DATABASE_URL`.
- The first successful OAuth registration shall create a `User` record.
- The first successful OAuth registration shall create an `Account` record linked to the `User`.
- Account uniqueness shall be enforced by provider and provider account id.
- Repeat sign-in with the same provider identity shall reuse the existing linked account.
- Deleting a user shall cascade deletion to related accounts and sessions.
- Product-specific customer profile fields are not required in this iteration.

Acceptance criteria:

- Given a new Google provider identity, when registration succeeds, then one `User` and one Google `Account` are persisted.
- Given a new GitHub provider identity, when registration succeeds, then one `User` and one GitHub `Account` are persisted.
- Given an existing provider identity, when the customer signs in again, then no duplicate `Account` is created for the same provider and provider account id.
- Given a persisted user is deleted, when referential actions run, then related `Account` and `Session` rows are removed.

Edge cases:

- If the provider does not return an email address, registration may still rely on the provider account identity and available profile data.
- If two providers return the same email address, they shall not be automatically linked unless Auth.js does so through an explicitly signed-in linking flow outside this scope.
- Database unavailability should prevent registration completion rather than creating a partial application identity.
- Duplicate callback processing should not create duplicate provider account rows.

### registration-database-sessions

Create and clear database-backed sessions for registered customers.

Requirements:

- The application shall use the Auth.js database session strategy.
- Successful registration or sign-in shall create a persisted session record.
- Session cookies shall resolve to persisted sessions through Auth.js.
- Signing out shall remove or invalidate the persisted session.
- Unauthenticated customers shall be able to reach `/sign-in`.
- Session handling shall avoid storing raw provider tokens in browser-visible application state.

Acceptance criteria:

- Given a successful provider callback, when the customer is signed in, then a `Session` row exists for that customer.
- Given a valid session cookie, when Auth.js resolves the session, then the associated user identity is available to the application.
- Given a signed-in customer signs out, when sign-out completes, then the prior session can no longer authenticate the customer.
- Given no valid session exists, when a customer navigates to `/sign-in`, then the sign-in page is available.

Edge cases:

- Expired sessions should not authenticate customers.
- Replayed or deleted session tokens should not authenticate customers.
- Multiple active sessions for the same user may exist unless later policy defines a single-session restriction.
- Browser cookie clearing should leave any orphaned expired sessions to normal session cleanup behavior.

### registration-sign-in-experience

Provide the customer-facing sign-in and registration UI.

Requirements:

- The application shall provide a `/sign-in` page for customer registration and sign-in.
- The page shall display Customer Feedback Portal branding.
- The page shall clearly present Google and GitHub registration/sign-in actions.
- Provider actions shall submit to the matching Auth.js provider.
- Provider actions shall be keyboard accessible.
- Copy shall remain scoped to customer access and future customer features.
- The UI shall not describe administrator authorization as part of this registration feature.

Acceptance criteria:

- Given a customer opens `/sign-in`, then the page displays Customer Feedback Portal branding.
- Given a customer opens `/sign-in`, then Google and GitHub actions are visible.
- Given keyboard navigation, when focus reaches a provider action, then the customer can activate it with standard button behavior.
- Given the Google action is activated, then the Google provider flow begins.
- Given the GitHub action is activated, then the GitHub provider flow begins.

Edge cases:

- If a provider flow returns an Auth.js error, the page or Auth.js error state should remain customer-safe and not expose secrets.
- If JavaScript hydration is delayed, server actions and framework behavior should still preserve a valid provider submission path.
- Provider labels should remain understandable to customers who are registering for the first time or returning to sign in.

### registration-failure-handling

Handle cancelled or rejected provider registration.

Requirements:

- Provider cancellation shall not create a customer identity.
- Provider rejection shall not create a customer identity.
- OAuth errors shall not create a persisted session.
- Failure handling shall not expose client secrets, auth secrets, raw access tokens, refresh tokens, id tokens, or provider error payloads to customers.
- Customers shall be able to return to sign-in after a failed, cancelled, or rejected provider attempt.

Acceptance criteria:

- Given a customer cancels Google authorization, when the provider returns to the application, then no new `User`, `Account`, or `Session` row is created for that attempt.
- Given a customer cancels GitHub authorization, when the provider returns to the application, then no new `User`, `Account`, or `Session` row is created for that attempt.
- Given a provider rejects or errors during OAuth, when the application handles the result, then no session is created.
- Given an OAuth failure is visible to a customer, then the visible state contains no secrets or raw provider tokens.

Edge cases:

- Provider downtime should leave the customer unauthenticated and able to retry later.
- State mismatch, invalid callback code, denied consent, and expired callback code should all be treated as failed registration attempts.
- Partial database writes should be avoided; if persistence fails during callback handling, the customer should not receive a valid authenticated session.

### registration-verification-coverage

Verify the registration acceptance checks.

Requirements:

- Verification shall confirm required Auth.js, Prisma adapter, Prisma Client, and Prisma CLI dependencies are installed.
- Verification shall validate the Prisma schema.
- Verification shall run the TypeScript check.
- Verification shall run lint.
- Functional verification shall cover provider option visibility and error-safe behavior where local OAuth constraints allow.
- Verification evidence shall identify commands that were run and whether they passed, failed, or were blocked by environment setup.
- Browser launch, permission, dependency, and test page setup failures shall be reported as environment blockers rather than application defects.

Acceptance criteria:

- Given dependency verification is run, then `next-auth`, `@auth/prisma-adapter`, `@prisma/client`, and `prisma` are confirmed present or a blocker is reported.
- Given Prisma validation is run, then schema validity is confirmed or the exact failure is reported.
- Given TypeScript and lint checks are run, then pass/fail results are recorded without claiming unexecuted tests passed.
- Given Playwright or equivalent functional checks cannot run because of local OAuth, browser, permission, or setup constraints, then the limitation is recorded as a blocker or constrained evidence rather than hidden.

Edge cases:

- OAuth provider flows may require real provider apps and reachable callback URLs; unavailable provider apps should constrain functional coverage.
- A local browser or Playwright setup failure should be treated as an environment blocker.
- A stalled command should not be repeatedly retried.
- Verification artifacts should live under `.ai_factory/tests/` or delivery run evidence paths according to the project taxonomy.

## Cross-Story Rules

- Preserve planned story ids exactly as written in the iteration plan.
- Keep registration scoped to customer identity and access; roles and administrator capabilities require separate requirements.
- Do not add password, email magic-link, or custom credential registration in this iteration.
- Do not automatically merge unrelated provider accounts solely by matching email.
- Do not expose OAuth tokens, database connection strings, or auth secrets in customer-facing UI, logs intended for users, or requirement examples.
