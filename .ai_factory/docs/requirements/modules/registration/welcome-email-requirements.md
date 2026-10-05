# Welcome Email Requirements

- Module: registration
- Delivery iteration id: welcome-email
- Delivery iteration title: Welcome Email On Registration
- Status: elaborated for delivery
- Taxonomy: 1.0
- Last updated: 2026-09-14

## Scope

Add server-side Gmail-provider delivery for a welcome email that is attempted only after successful new-user registration. The implementation must use Gmail parameters from `.env.local`, keep registration successful even when email delivery fails, avoid welcomes for existing users, and support source-level tests through a mocked or injectable sender.

Out of scope for this iteration: dashboard routing and layout, feedback request batch upload, public feedback form submission, Configure behavior, theme toggling, real Gmail delivery during automated tests, browser automation execution, and deployment.

## Evidence

- The planned delivery iteration id is `welcome-email`, depends on `registration-profile-consent`, and requires Gmail-provider email delivery after successful new-user registration.
- Prior iteration delivery added `User.firstName` and `User.lastName` to `prisma/schema.prisma`, with Auth.js registration flow updates in `src/auth.ts`, `src/app/register/actions.ts`, `src/app/register/page.tsx`, `src/app/register/google-consent/page.tsx`, and `src/features/registration/profile.ts`.
- `.env.local` contains the Gmail environment key names `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `GMAIL_FROM`; values were not inspected or recorded.
- `package.json` includes Next.js, TypeScript, Prisma, NextAuth, and the Prisma adapter. It does not currently include a dedicated mail package such as Nodemailer.
- `src/auth.ts` uses Auth.js with `PrismaAdapter(prisma)`, Google and GitHub providers, database sessions, and sign-in callbacks that gate first-time Google registration by consent while allowing existing linked accounts to log in.

## Assumptions And Definitions

- "New registration" means the application has just created a new `User` record through the manual/profile registration path or accepted first-time Google registration path.
- "Existing user" means a user/account already existed before the current sign-in attempt, including repeat OAuth callbacks for an already linked provider account.
- "Welcome email" is a transactional account-created notification sent to the registering user's email address.
- Gmail delivery uses `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `GMAIL_FROM` from server-side environment variables.
- The welcome sender must be injectable or mockable so tests can assert behavior without contacting Gmail.
- Email failure must not roll back or invalidate a successfully created registration.
- Duplicate avoidance in this iteration may be implemented by using an Auth.js create-user event/hook or an equivalent new-user-only server path. A persistent sent-status/outbox field is desirable only if needed to survive duplicate callback/event execution in the current flow.

## Story Requirements

### welcome-email-sender-configuration

Configure a server-only, injectable Gmail sender for welcome emails.

Requirements:

- The application shall provide a server-only welcome email sender abstraction.
- The sender shall read `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `GMAIL_FROM` from environment variables.
- Mail configuration and secret values shall not be imported by client components or exposed in browser-visible bundles.
- Missing Gmail configuration shall produce a deterministic server-side configuration error or skipped-send result that delivery code can handle.
- The sender shall accept the recipient email address and safe personalization fields such as first name, last name, and display name.
- The sender shall define a stable result shape for success, missing configuration, invalid recipient, and provider-send failure.
- The sender shall be injectable or mockable in tests without changing production code paths.
- The email content shall identify Customer Feedback Portal and welcome the user after account creation.

Acceptance criteria:

- Given all Gmail environment variables are present, when the sender is initialized, then it can construct a Gmail delivery transport or equivalent provider configuration without exposing secrets.
- Given any required Gmail environment variable is missing, when a welcome send is requested, then the result or log clearly indicates mail configuration is unavailable and does not include secret values.
- Given a test supplies a mock sender, when welcome-email registration logic runs, then no real Gmail connection is attempted.
- Given welcome email content is generated, when it is addressed to a user, then it includes only safe user-facing account information and not OAuth tokens, database IDs, app passwords, or raw provider payloads.

Edge cases:

- `GMAIL_FROM` may differ from `GMAIL_USER`; sender configuration should honor the explicit from address.
- Gmail credentials may be present but invalid; that is a send failure, not a registration failure.
- The user may not have an email address from the provider; delivery should be skipped or failed clearly without blocking registration.
- Recipient email strings may be blank, malformed, or whitespace-padded.
- Server logs should include enough context to diagnose the failure, such as user id or email, without logging app passwords or provider tokens.

### welcome-email-registration-trigger

Trigger the welcome email only after a new user registration has been successfully created.

Requirements:

- The application shall attempt the welcome email only after the new user has been persisted successfully.
- Manual/profile registration through provider selection shall be eligible for a welcome email after the resulting account is created.
- Accepted first-time Google registration shall be eligible for a welcome email after consent has been accepted and the user/account is created.
- Rejected Google consent shall not trigger a welcome email.
- Existing-user login shall not trigger a welcome email.
- The trigger shall use a server-side point that can distinguish newly created users from returning sign-ins.
- The registration success redirect/session behavior shall not depend on the email send succeeding.

Acceptance criteria:

- Given a new manual/profile registration succeeds, when the user is created, then one welcome email attempt is made for that new user if an email address is available.
- Given a first-time Google registration has accepted consent and account creation succeeds, when the user is created, then one welcome email attempt is made for that new user if an email address is available.
- Given first-time Google consent is rejected, when the flow returns unauthenticated to sign-in, then no welcome email attempt is made.
- Given an existing linked provider account signs in, when authentication completes, then no welcome email attempt is made.
- Given user persistence fails, when registration does not complete, then no welcome email attempt is made.

Edge cases:

- OAuth callbacks can be repeated by refresh, back navigation, provider retry, or network retry.
- A user may register through GitHub or Google with the same visible email as another account; welcome triggering should follow actual new-user creation, not email matching alone.
- Provider profile data may omit first or last name; email content should gracefully fall back to display name or a generic greeting.
- If session creation fails after user creation, the welcome trigger still represents an account-created event and should follow the selected implementation's documented behavior.

### welcome-email-failure-handling

Ensure email delivery failures are clear but do not break successful registration.

Requirements:

- Welcome email send errors shall be caught by registration/auth server code.
- A failed welcome email shall not delete the newly created user, linked account, or session.
- A failed welcome email shall not prevent the user from signing in again.
- Failure handling shall log or return a deterministic status suitable for source-level tests.
- Logs shall not include `GMAIL_APP_PASSWORD`, OAuth tokens, raw id tokens, refresh tokens, database connection strings, or full provider payloads.
- User-facing registration flow shall remain successful even when the welcome email cannot be sent.
- The implementation shall document whether email failures are one-time logged failures or eligible for future retry/outbox behavior.

Acceptance criteria:

- Given Gmail send fails after user creation, when registration completes, then the user remains registered.
- Given Gmail send fails, when the application records or logs the failure, then the message contains safe diagnostic context and no secret values.
- Given the sender returns a missing-configuration result, when registration completes, then the application does not throw an unhandled exception to the user.
- Given a mocked sender throws, when source-level tests run, then they can assert registration logic handled the failure deterministically.

Edge cases:

- SMTP or provider timeouts should be handled as delivery failure without repeatedly blocking the auth callback.
- Provider rate limiting should not cause duplicate account creation or duplicate welcome retries in the same registration flow.
- Invalid recipient addresses from provider data should be handled as email failure/skipped delivery, not application registration failure.
- Errors thrown during email template rendering should be treated like send failures and caught safely.

### welcome-email-duplicate-avoidance

Avoid duplicate welcome emails for existing users and repeated callbacks.

Requirements:

- Existing users shall not receive a registration welcome during normal login.
- Duplicate callback/event execution for an already-created user shall not send multiple welcome emails.
- Duplicate avoidance shall be based on new-user creation semantics or a persisted welcome status, not solely on recipient email address.
- If a persistent sent-status field or outbox is introduced, it shall be compatible with existing user rows and migrations.
- The implementation shall document the expected duplicate behavior for failed sends and future retry enhancement.
- Duplicate avoidance logic shall be covered by non-browser tests using a mocked sender.

Acceptance criteria:

- Given a user signs in with an already linked Google account, when the auth flow completes, then no welcome email is sent.
- Given a user signs in with an already linked GitHub account, when the auth flow completes, then no welcome email is sent.
- Given the same newly created user create event or registration callback is processed more than once, when duplicate avoidance is applied, then at most one welcome email is sent for that registration.
- Given a previous send failed, when the same user signs in later, then the implementation follows a defined rule and does not accidentally send a welcome as if this were a new registration.

Edge cases:

- Concurrent callback handling may attempt to process the same new user; duplicate handling should be resilient to practical race conditions.
- A user may delete and later recreate an account with the same email; behavior should follow whether this is a new persisted user record.
- If a user has no email address, duplicate avoidance should not rely on sending-address uniqueness.
- If a send-status migration is added, nullable defaults should preserve compatibility with users created before this iteration.

### welcome-email-non-browser-verification

Cover the welcome email behavior with non-browser checks using a mocked or injectable sender.

Requirements:

- Verification shall not launch browsers, run Playwright, start a temporary app server, deploy, publish, or send real email in this Codex task.
- Verification shall include source-level tests or equivalent checks that use a mocked or injectable sender.
- Tests shall cover environment-based Gmail configuration without recording secret values.
- Tests shall cover successful new-user welcome attempts.
- Tests shall cover existing-user duplicate avoidance.
- Tests shall cover sender failure handling that preserves registration success semantics.
- Prisma schema validation shall be run with `npx.cmd prisma validate` when implementation is present.
- TypeScript verification shall be run with `npx.cmd tsc --noEmit --incremental false` when implementation is present.
- Any package command shall use `npm.cmd` or `npx.cmd` explicitly on Windows.
- Browser verification shall be reported as not run or pending, never as passed without controller evidence.

Acceptance criteria:

- Given Gmail configuration tests run, then they confirm required env keys are read from server-side configuration and can be absent without exposing values.
- Given a mocked successful sender, when a new-user registration trigger is exercised, then exactly one welcome attempt is asserted.
- Given a mocked sender failure, when the trigger is exercised, then failure is caught and registration-success behavior remains assertable.
- Given an existing-user login scenario is exercised, then the mocked sender records no welcome attempt.
- Given `npx.cmd prisma validate` is run, then the result is recorded as passed, failed, or blocked with exact evidence.
- Given `npx.cmd tsc --noEmit --incremental false` is run, then the result is recorded as passed, failed, or blocked with exact evidence.

Edge cases:

- If `npm.cmd` or `npx.cmd` is unavailable, report the exact command failure as an environment blocker.
- If a dependency install is required for the sender but unavailable in the environment, report the blocker rather than masking it with application code.
- If a command stalls, do not repeatedly retry it.
- Do not claim real Gmail delivery, browser verification, Playwright, or deployment passed unless those approved actions are actually performed in a later task.

## Cross-Story Rules

- Preserve planned story ids exactly: `welcome-email-sender-configuration`, `welcome-email-registration-trigger`, `welcome-email-failure-handling`, `welcome-email-duplicate-avoidance`, and `welcome-email-non-browser-verification`.
- Keep welcome email behavior server-side only.
- Do not expose Gmail credentials, OAuth tokens, Auth.js secrets, database connection strings, or raw provider payloads in client code, customer-visible messages, logs intended for users, or test evidence.
- Do not contact Gmail or send real email from automated tests.
- Do not edit test-design artifacts from this business-analysis task.
- Do not implement dashboard, left navigation, feedback upload, customer feedback forms, Configure behavior, or theme toggle in this iteration.
- Registration remains successful even when welcome delivery fails after user creation.
- Duplicate prevention must prioritize actual new-user creation semantics over email-address matching.
