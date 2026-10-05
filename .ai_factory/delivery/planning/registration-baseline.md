# Registration baseline plan

## Decision record

- **Authentication:** Auth.js / NextAuth v5 with Google and GitHub OAuth providers. The provider configuration explicitly maps the existing `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_ID`, and `GITHUB_SECRET` values; it does not depend on Auth.js `AUTH_*` environment-name inference.
- **Sessions:** Database sessions through the Prisma adapter.
- **Persistence:** PostgreSQL through Prisma. The initial migration creates the standard `User`, `Account`, `Session`, and `VerificationToken` models.
- **Callback route:** `/api/auth/callback/google` and `/api/auth/callback/github`.
- **Post-registration redirect:** `/`.
- **Account linking:** Accounts are linked only when the provider reports the same account identity. Automatic linking of two provider accounts by matching email is not enabled; a signed-in account-linking flow is a later feature.
- **Customer data:** The baseline persists only provider identity and profile data required by Auth.js. Product-specific customer profile fields remain out of scope until their requirements are defined.

## Delivery steps

1. Generate the Prisma client and apply the initial `registration_baseline` migration to the configured PostgreSQL database.
2. Configure Google and GitHub OAuth applications with their local callback URLs.
3. Exercise first sign-in, repeat sign-in, provider cancellation/failure, and persistence of the user, account, and session rows.
4. Add protected feedback and administrator capabilities in later stories with explicit roles and authorization rules.

## Acceptance checks

- The sign-in page presents Google and GitHub options.
- Each provider starts through its Auth.js route and returns to `/` after a successful callback.
- A first successful sign-in creates a `User` and `Account`; subsequent sign-ins reuse the account.
- A database session is created and removed on sign-out.
- A cancelled or rejected provider login does not create an application account or session.
