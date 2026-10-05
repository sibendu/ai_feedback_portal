# Registration Profile And Google Consent Requirements

- Module: registration
- Delivery iteration id: registration-profile-consent
- Delivery iteration title: Registration Profile And Google Consent
- Status: elaborated for delivery
- Taxonomy: 1.0
- Last updated: 2026-09-14

## Scope

Extend the current OAuth-backed customer registration capability so first name and last name are captured, stored, and preserved on user records. For Google registration, distinguish first-time registration from returning-user login and require explicit consent before the application uses Google-provided profile fields to create or complete an account. Existing registered users must still be able to sign in.

Out of scope for this iteration: welcome email, authenticated dashboard shell, feedback request upload, public feedback form submission, Configure menu behavior, theme toggling, and browser automation execution.

## Evidence

- The delivery iteration requests first name and last name capture/storage, a first-time Google registration consent gate, normal login for existing users, no completed registration when Google consent is rejected, non-browser verification, and pending browser verification.
- `package.json` includes Next.js, TypeScript, NextAuth, Prisma Client, Prisma CLI, and the Prisma Auth adapter.
- `prisma/schema.prisma` currently defines `User.name`, `User.email`, `User.emailVerified`, and `User.image`, but no `firstName` or `lastName` fields.
- `src/auth.ts` currently configures `PrismaAdapter`, Google and GitHub providers, database sessions, `/sign-in`, and `trustHost`.
- `src/app/sign-in/page.tsx` currently offers Google and GitHub provider actions and submits Google directly through `signIn("google", { redirectTo: "/" })`, so first-time Google consent gating is new behavior.
- Existing baseline requirements for the prior registration iteration live at `.ai_factory/docs/requirements/modules/feedback/registration-requirements.md`.

## Assumptions And Definitions

- "First-time Google registration" means the Google provider identity does not already have a linked `Account` row and is not being used through an existing authenticated account-linking flow.
- "Existing Google login" means the Google provider identity already has a linked `Account` row and can authenticate through the current NextAuth flow without additional profile-consent prompts.
- Explicit consent must be a user action that is separate from clicking the provider sign-in button.
- Consent covers using Google-provided email, first name, last name, and profile identity data for account setup.
- `firstName` and `lastName` are customer profile fields, distinct from the existing display `name`.
- GitHub remains available through the existing baseline registration/sign-in behavior unless later requirements change it.

## Story Requirements

### registration-profile-schema

Persist first name and last name in user storage.

Requirements:

- The `User` persistence model shall include `firstName` and `lastName` fields.
- The schema change shall be compatible with existing user records created before these fields existed.
- The migration shall not require backfilling names for existing users before deployment.
- Server-side registration code shall write `firstName` and `lastName` when those values are supplied by a completed registration path.
- Returning-user login shall not erase existing `firstName` or `lastName` values.
- Existing Auth.js fields, provider account linkage, and database sessions shall remain available.
- The existing `name` field may remain for display/provider compatibility, but it shall not be the only stored representation of first and last names.

Acceptance criteria:

- Given the Prisma schema is updated, when it is validated, then the `User` model includes `firstName` and `lastName`.
- Given an existing user row without profile names, when the migration is applied, then the row remains valid.
- Given a new successful registration includes first and last names, when the user is persisted, then both fields are stored on the `User` record.
- Given an existing registered user signs in, when the session is created, then stored profile names are preserved.

Edge cases:

- Existing OAuth users may have null `firstName` or `lastName` until they update their profile in a later flow.
- Provider names may be absent, single-token, or not reliably separable into first and last names.
- Extremely long names, blank names, whitespace-only names, and names with punctuation or non-English characters require server-side validation behavior.
- Duplicate OAuth callback processing must not create conflicting or duplicate user profile data.

### registration-name-capture-ui

Capture first and last names during non-Google registration paths that require manual entry.

Requirements:

- The registration experience shall provide fields for first name and last name where the application is collecting user-entered registration details.
- First name and last name fields shall be labeled clearly and submitted through a typed server path.
- Validation shall reject blank or whitespace-only first name and last name values for new manual/profile registration completion.
- Validation errors shall be visible to the user without creating a completed account.
- Submitted names shall be normalized consistently before persistence, at minimum trimming leading and trailing whitespace.
- Successful registration shall continue into the existing post-auth flow for the registered user.

Acceptance criteria:

- Given a new registration form is displayed, when the user reviews the form, then first name and last name inputs are present and understandable.
- Given a user submits valid first and last names, when registration succeeds, then those names are stored in `User.firstName` and `User.lastName`.
- Given a user submits missing or whitespace-only first or last name, when validation runs, then no completed account is created and a clear validation message is shown.
- Given registration succeeds, when the user reaches the post-auth route, then the authenticated session is associated with the newly registered user.

Edge cases:

- Leading/trailing whitespace should not be stored as part of names.
- The UI should handle slow submission or server validation failure without double-creating accounts.
- Browser autofill may provide only one name field or stale values; server validation remains authoritative.
- Users may navigate away before submission; no account should be created solely because the form was viewed.

### google-registration-consent-gate

Require explicit consent before first-time Google registration uses Google profile fields.

Requirements:

- The Google path shall distinguish returning Google login from first-time Google registration before completing account creation.
- Returning Google-linked users shall be allowed to sign in through Google without being forced through the first-time consent gate again.
- First-time Google users shall be shown a consent step before the application creates or completes a registered account.
- Consent copy shall explicitly state that the application will use Google-provided email, first name, and last name for account setup.
- Accepting consent shall create or complete the account and persist available first and last names.
- Rejecting consent shall leave the user unauthenticated and shall not create a completed registration.
- The application shall avoid retaining Google profile data for rejected first-time registration beyond what is technically required for the transient auth decision.

Acceptance criteria:

- Given a Google provider identity already linked to an account, when the user signs in, then login succeeds without a consent prompt for first-time registration.
- Given a Google provider identity is not linked to an account, when the provider returns profile data, then the user must explicitly accept consent before account creation is completed.
- Given the first-time Google user accepts consent, when the flow completes, then a user/account is created and available profile names are stored.
- Given the first-time Google user rejects consent, when the flow exits, then no completed user/account registration exists for that attempt and no authenticated session remains.
- Given Google does not provide a first or last name, when consent is accepted, then the flow requires a defined fallback such as prompting for missing values before completion.

Edge cases:

- Google may provide a display name but not structured given/family names.
- Google may provide no verified email, a changed email, or a profile image only.
- The user may refresh, duplicate-submit, or navigate back during the consent step.
- The consent step may expire or lose its transient state; the user should return safely to sign-in and retry.
- A same-email account from another provider shall not be automatically merged solely because Google returns that email.

### auth-flow-routing-and-session-safety

Preserve safe session and redirect behavior across the updated registration and login flows.

Requirements:

- Successful manual/profile registration and accepted Google registration shall end with an authenticated session.
- Rejected Google consent shall not leave an authenticated session.
- Existing provider login shall remain available for registered users.
- Callback and redirect behavior shall not bypass the consent gate for first-time Google registration.
- Authentication errors shall return users to a safe sign-in or registration surface with customer-safe messaging.
- Session state shall not expose OAuth access tokens, refresh tokens, id tokens, client secrets, auth secrets, or database connection strings to browser-visible application state.
- The post-registration redirect for this iteration shall remain compatible with the current application until the dashboard iteration changes it.

Acceptance criteria:

- Given a user completes registration successfully, when the flow finishes, then a valid persisted session exists for that user.
- Given a first-time Google user rejects consent, when the flow finishes, then the user is unauthenticated and can return to sign-in.
- Given a registered Google user signs in again, when the callback completes, then the user reaches the configured post-auth route.
- Given an auth error occurs, when the user is returned to the application, then the visible message does not expose secrets or raw provider payloads.
- Given a first-time Google callback occurs, when consent is required, then direct callback or redirect manipulation cannot create a completed account without acceptance.

Edge cases:

- Expired, replayed, or deleted session tokens must not authenticate users.
- OAuth state mismatch, invalid callback code, denied provider authorization, and provider downtime should leave the user unauthenticated.
- Duplicate callbacks should not create duplicate users, accounts, or sessions.
- A database write failure during registration should not result in a valid authenticated session for a partial account.

### registration-non-browser-verification

Verify registration profile and consent behavior without browser execution in this run.

Requirements:

- Verification shall use non-browser checks only in this Codex task run.
- Prisma schema validation shall be run with `npx.cmd prisma validate` when the implementation is present.
- TypeScript verification shall be run with `npx.cmd tsc --noEmit --incremental false` when the implementation is present.
- Targeted non-browser tests or source-level checks shall cover name persistence, existing Google login, first-time Google consent acceptance, and first-time Google consent rejection.
- Browser verification shall be documented as pending or not run for this run, never as passed without controller evidence.
- Verification evidence shall identify the exact commands run and whether each passed, failed, or was blocked by environment setup.
- Browser launch, permission, dependency, and test page setup failures shall be treated as environment blockers, not application defects.

Acceptance criteria:

- Given Prisma validation is run, then the result records success or the exact validation failure.
- Given TypeScript verification is run, then the result records success or the exact compiler failure.
- Given targeted non-browser checks are available, when they run, then they exercise successful name persistence, existing Google login, accepted Google consent registration, and rejected Google consent.
- Given browser verification is not approved in this task, when reporting verification, then browser status is recorded as pending/not run and not claimed as passed.

Edge cases:

- If `npx.cmd` is unavailable, report the exact command failure as an environment blocker.
- If dependency setup prevents non-browser checks from starting, report the setup failure as blocked with evidence.
- If a command stalls, do not repeatedly retry it.
- Do not alter application behavior merely to mask an environment or test setup failure.

## Cross-Story Rules

- Preserve planned story ids exactly: `registration-profile-schema`, `registration-name-capture-ui`, `google-registration-consent-gate`, `auth-flow-routing-and-session-safety`, and `registration-non-browser-verification`.
- Do not edit test-design artifacts from this business-analysis task.
- Keep this iteration focused on registration profile persistence and Google consent.
- Do not send welcome email in this iteration.
- Do not implement dashboard, left navigation, feedback upload, customer feedback forms, Configure behavior, or theme toggle in this iteration.
- Do not automatically link separate provider accounts solely by matching email.
- Do not expose OAuth tokens or secrets in user-facing messages, requirement examples, or verification evidence.
