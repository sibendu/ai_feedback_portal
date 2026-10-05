# Dashboard Authenticated Shell Requirements

- Module: dashboard
- Delivery iteration id: authenticated-dashboard-shell
- Delivery iteration title: Authenticated Dashboard Shell
- Status: elaborated for delivery
- Taxonomy: 1.0
- Last updated: 2026-09-15
- Planned story ids: `protect-dashboard-routing`, `dashboard-home-shell`, `collapsible-dashboard-navigation`, `dashboard-topbar-session-controls`, `dashboard-theme-toggle`, `dashboard-non-browser-verification`

## Scope

Build the authenticated post-login dashboard experience for Customer Feedback Portal users. After successful registration or login, authenticated users shall land on `/dashboard`, where Home is the default content. The logged-in area shall provide a protected dashboard shell with a collapsible left menu containing Home, Feedback Request, and Configure; a top-right user identity display; logout; and an icon-only dark/light theme toggle.

Out of scope for this iteration: Feedback Request Excel upload and batch creation, customer feedback link generation, public customer feedback form submission, implemented Configure behavior, welcome email delivery changes, Google registration consent changes, and registration first/last-name capture changes. Feedback Request and Configure are required as protected future-ready placeholders only.

## Evidence

- Delivery scope for `authenticated-dashboard-shell` requests a protected dashboard after successful registration/login, Home default content, collapsible left menu entries, top-right user name, logout to landing page, and an icon-based dark/light theme toggle.
- Prior planning preserved the story ids `protect-dashboard-routing`, `dashboard-home-shell`, `collapsible-dashboard-navigation`, `dashboard-topbar-session-controls`, `dashboard-theme-toggle`, and `dashboard-non-browser-verification`.
- `src/auth.ts` exports `auth`, `signIn`, and `signOut`, uses the Prisma adapter, configures Google and GitHub providers, and uses database-backed sessions.
- `src/auth.ts` currently sets Auth.js sign-in page to `/sign-in` and session callback currently exposes `session.user.name`.
- Completed registration work in `prisma/schema.prisma` and `src/auth.ts` supports user names through `User.name`, `User.firstName`, `User.lastName`, and `User.email`, giving the dashboard identity source fields to prefer and fall back through.
- `src/app/sign-in/page.tsx` currently submits provider sign-in with `redirectTo: "/"`, so changing post-auth routing to `/dashboard` is required in this iteration.
- `src/app/register/actions.ts` currently uses `signIn(..., { redirectTo: "/" })` for provider registration flows, so accepted registration flows also need dashboard routing.
- `src/app/page.tsx` is the current public landing page and is the required logout return destination.
- Current `src/app` inspection found no `src/app/dashboard` route, no dashboard navigation, no dashboard top bar, and no theme toggle implementation yet.
- `src/app/layout.tsx` is a minimal root layout with global styles, and `src/app/globals.css` currently contains landing/sign-in/registration styling only.
- `package.json` includes Next.js, TypeScript, NextAuth, Prisma Client, Prisma CLI, ESLint, and Playwright dependencies.

## Assumptions And Definitions

- "Dashboard" means the authenticated application area. `/dashboard` is the canonical route for this iteration.
- "Home" means the default dashboard content shown at `/dashboard`.
- "Feedback Request" in this iteration means a protected placeholder navigation destination, not the Excel upload workflow.
- "Configure" means a protected future-ready placeholder destination with no configuration features.
- "User display name" means the best available authenticated identity, preferring a friendly name derived from `session.user.name`, `firstName`/`lastName` if exposed to the session, then email, then a generic fallback.
- "Invalidates the session" means the session used by the current browser can no longer authorize `/dashboard` after logout completes.
- "Icon-only theme toggle" means the visible control is an icon without adjacent instructional text, while still exposing an accessible name to assistive technology.
- Browser verification is not approved for this task run and shall remain pending/not run until a later approved controller run supplies evidence.

## Story Requirements

### protect-dashboard-routing

Create and protect the authenticated dashboard routing surface.

Requirements:

- DASH-AUTH-001: The application shall provide `/dashboard` as the authenticated destination for completed login and registration flows.
- DASH-AUTH-002: Dashboard routes shall require a valid Auth.js session before rendering protected dashboard shell or content.
- DASH-AUTH-003: Unauthenticated users who request `/dashboard` or dashboard subroutes shall be redirected to `/sign-in` or an equivalent sign-in entry point.
- DASH-AUTH-004: Successful provider login from `/sign-in` shall target `/dashboard`, replacing the current `/` redirect.
- DASH-AUTH-005: Successful provider registration and accepted Google consent registration shall target `/dashboard`, replacing the current `/` redirect.
- DASH-AUTH-006: Protected dashboard routing shall use framework-native Next.js and Auth.js patterns already present in the project.
- DASH-AUTH-007: Redirect URLs and rendered dashboard content shall not expose session tokens, provider tokens, database connection strings, OAuth credentials, Gmail credentials, or auth secrets.

Acceptance criteria:

- Given an existing authenticated user completes login, when Auth.js finishes the provider flow, then the user lands on `/dashboard`.
- Given a newly registered user completes registration, when Auth.js finishes the accepted registration flow, then the user lands on `/dashboard`.
- Given no valid session exists, when a user opens `/dashboard`, then protected dashboard content is not rendered and the user is sent to sign in.
- Given no valid session exists, when a user opens `/dashboard/feedback-request` or `/dashboard/configure`, then the user is sent to sign in before any protected placeholder content renders.
- Given a session is expired, deleted, or invalid, when the user opens a dashboard route, then the request is treated as unauthenticated.
- Given a valid session exists, when the user opens `/dashboard`, then the dashboard shell renders with Home selected by default.

Edge cases:

- A direct request to a nested dashboard placeholder route without a valid session must not reveal protected shell content.
- A user with a valid session but missing display name should still be allowed into the dashboard.
- Redirect loops between `/sign-in`, registration pages, and `/dashboard` must be avoided.
- Manipulated callback or redirect parameters must not bypass the session requirement.
- OAuth callback errors shall continue to land on a safe sign-in or registration error surface, not on a partially rendered dashboard.
- If session lookup fails because of an infrastructure/database error, the app shall fail closed for dashboard access and avoid exposing internals.

### dashboard-home-shell

Render the default Home page within the logged-in dashboard layout.

Requirements:

- DASH-HOME-001: `/dashboard` shall render Home as the default dashboard page for authenticated users.
- DASH-HOME-002: Home shall show a welcome message suitable for a signed-in Customer Feedback Portal user.
- DASH-HOME-003: The welcome message shall use the user's available friendly display name when present.
- DASH-HOME-004: If a friendly name is unavailable, Home shall use email when available, then a generic welcome fallback.
- DASH-HOME-005: Home shall render inside the logged-in dashboard shell, not as a public landing-page variant.
- DASH-HOME-006: Home shall not include the Feedback Request upload workflow or imply batch upload is complete in this iteration.
- DASH-HOME-007: Home shall remain readable and reachable in both expanded and collapsed navigation states.

Acceptance criteria:

- Given an authenticated user with a display name, when `/dashboard` loads, then Home displays a welcome message containing that name.
- Given an authenticated user without a display name but with an email, when `/dashboard` loads, then Home displays a welcome message using the email or a generic fallback.
- Given an authenticated user opens `/dashboard`, then the Home navigation item is marked as the current location.
- Given the left menu is expanded, when Home is displayed, then the main welcome content remains visible beside the menu.
- Given the left menu is collapsed, when Home is displayed, then the main welcome content remains visible and does not sit underneath the menu.
- Given Feedback Request is not delivered in this iteration, when Home renders, then it does not show Excel upload controls, batch submit controls, or customer email sending controls.

Edge cases:

- Long names or email addresses should truncate, wrap, or otherwise fit without breaking the shell layout.
- Missing `session.user.name` and missing `session.user.email` should not cause a server render failure.
- Refreshing `/dashboard` should preserve authenticated access and selected Home navigation state.
- Mobile layout should keep Home content reachable without relying on hover-only controls.
- Empty or whitespace-only display names should be treated as unavailable.
- Special characters in display names or email addresses shall be rendered as text, not interpreted as markup.

### collapsible-dashboard-navigation

Provide a collapsible left navigation for logged-in dashboard pages.

Requirements:

- DASH-NAV-001: The dashboard shell shall include a left navigation menu.
- DASH-NAV-002: The left navigation shall include Home, Feedback Request, and Configure entries using those labels when expanded.
- DASH-NAV-003: The left menu shall support expanded and collapsed states.
- DASH-NAV-004: Collapsing the left menu shall not hide, overlap, or disable primary dashboard content.
- DASH-NAV-005: Navigation entries shall route only to protected dashboard destinations.
- DASH-NAV-006: The active destination shall be visually identifiable.
- DASH-NAV-007: Feedback Request shall render a protected future-ready placeholder in this iteration.
- DASH-NAV-008: Configure shall render a protected future-ready placeholder indicating the feature is not implemented yet.
- DASH-NAV-009: Navigation controls shall be keyboard accessible and expose accessible names for icon-only, collapsed, or toggle controls.
- DASH-NAV-010: Navigation state shall be stable enough that expanding or collapsing the menu does not unexpectedly navigate away from the current dashboard destination.

Acceptance criteria:

- Given an authenticated user views the dashboard shell, then Home, Feedback Request, and Configure are available from the left navigation.
- Given the user activates the collapse control, when the menu collapses, then the main content remains visible and usable.
- Given the user activates the expand control, when the menu expands, then labels and entries become available again.
- Given the user navigates to Feedback Request in this iteration, then a protected placeholder page or equivalent placeholder state is shown without starting the upload workflow.
- Given the user navigates to Configure, then a protected placeholder page or equivalent placeholder state clearly indicates future implementation.
- Given a dashboard route is active, then its corresponding navigation entry is visibly selected.
- Given the user uses keyboard navigation, then the collapse/expand control and all menu entries can receive focus and be activated.

Edge cases:

- Collapsed navigation must still allow users to identify entries through icons, accessible labels, title text, or equivalent non-visible labels.
- Keyboard focus should remain logical when collapsing or expanding the menu.
- Unknown dashboard subroutes should use framework-native not-found or redirect behavior without exposing protected data.
- Long menu labels or future localized text should not resize the shell unpredictably.
- Menu state may reset on refresh unless persistence is intentionally implemented, but reset behavior must remain usable.
- Collapsing the menu on small screens shall not trap focus or make the main content unreachable.

### dashboard-topbar-session-controls

Show authenticated identity and logout controls in the dashboard top bar.

Requirements:

- DASH-TOP-001: The dashboard shell shall include top-right authenticated session controls.
- DASH-TOP-002: The user's display name shall appear in the top-right area when available.
- DASH-TOP-003: If the user's display name is unavailable, the top-right identity shall fall back to email when available.
- DASH-TOP-004: A Logout control shall appear after the identity text.
- DASH-TOP-005: Activating Logout shall call the framework-native Auth.js sign-out path.
- DASH-TOP-006: Logout shall invalidate the active session and return the user to the public landing page `/`.
- DASH-TOP-007: After logout, protected dashboard routes shall no longer be accessible in that browser session without signing in again.
- DASH-TOP-008: Logout behavior shall not expose raw tokens, session identifiers, provider tokens, database connection strings, or secrets to the client.
- DASH-TOP-009: Identity text, logout, and theme controls shall fit together without overlapping at common desktop and mobile widths.

Acceptance criteria:

- Given an authenticated user with a name, when the dashboard shell renders, then that name appears at the top right.
- Given an authenticated user without a name but with an email, when the dashboard shell renders, then the email appears as the identity fallback.
- Given the dashboard shell renders, then Logout appears after the identity text.
- Given the user activates Logout, when sign-out completes, then the user is returned to `/`.
- Given the user has logged out, when the user attempts to open `/dashboard`, then the app requires sign-in again.
- Given the identity value is long, when the shell renders, then it does not cover or displace Logout or the theme toggle.

Edge cases:

- Double-clicking Logout should not leave the user partially signed in.
- A failed sign-out request should leave the user in a safe state and not expose implementation details.
- Long identity text should truncate, wrap, or otherwise fit without covering adjacent controls.
- Users with multiple active sessions may remain signed in elsewhere unless broader session policy later changes that behavior.
- Logout from a nested dashboard placeholder should still return to `/`.
- Logout should remain keyboard accessible and should not require JavaScript beyond the framework-native form/action behavior if a server action pattern is used.

### dashboard-theme-toggle

Add an icon-only dark/light theme toggle to the logged-in dashboard shell.

Requirements:

- DASH-THEME-001: The dashboard shell shall include a compact icon-only light/dark theme control alongside the identity and Logout controls.
- DASH-THEME-002: The visible control shall use a recognizable sun/moon or equivalent theme icon, without adjacent instructional text.
- DASH-THEME-003: The control shall expose an accessible name for assistive technology.
- DASH-THEME-004: Activating the control shall switch the dashboard between light and dark themes.
- DASH-THEME-005: Theme switching shall not disrupt the authenticated session, selected route, menu state, or visible main content.
- DASH-THEME-006: The selected theme should persist across dashboard navigation and page refresh when technically feasible within the chosen client-side pattern.
- DASH-THEME-007: The implementation shall avoid exposing a settings feature or Configure behavior beyond the toggle itself.
- DASH-THEME-008: Both themes shall maintain readable contrast for dashboard text, navigation, placeholders, controls, focus states, and selected navigation indicators.

Acceptance criteria:

- Given the dashboard shell renders, then an icon-only theme toggle is available near the user identity and Logout controls.
- Given the current theme is light, when the user activates the toggle, then the dashboard changes to dark theme.
- Given the current theme is dark, when the user activates the toggle, then the dashboard changes to light theme.
- Given the user toggles theme, when they navigate among dashboard Home, Feedback Request placeholder, and Configure placeholder, then the selected theme remains applied.
- Given the user toggles theme, then the authenticated session remains valid and no navigation data is lost.
- Given the toggle receives keyboard focus, then it has a visible focus state and can be activated without a pointer.

Edge cases:

- The initial theme may follow system preference or an application default, but the behavior must be deterministic.
- Theme choice storage failure should not prevent dashboard use.
- Icon color contrast must remain sufficient in both light and dark modes.
- Server-rendered and client-rendered theme states should avoid distracting flashes where feasible.
- Toggling rapidly should settle on a valid light or dark state without corrupting storage.
- Theme persistence should not store personal information or session secrets.

### dashboard-non-browser-verification

Verify dashboard implementation with approved non-browser checks only.

Requirements:

- DASH-VERIFY-001: Verification in this Codex task run shall not launch browsers, run Playwright, run `test:e2e`, or start a temporary application server.
- DASH-VERIFY-002: TypeScript verification shall use `npx.cmd tsc --noEmit --incremental false`.
- DASH-VERIFY-003: Lint verification shall use `npm.cmd run lint` if the script remains available.
- DASH-VERIFY-004: Prisma validation shall use `npx.cmd prisma validate` if schema or auth persistence behavior changes.
- DASH-VERIFY-005: Verification evidence shall record each command run, its result, and exact output for failures or blockers.
- DASH-VERIFY-006: Browser verification shall be reported as pending/not run for this restricted run, never as passed without controller evidence.
- DASH-VERIFY-007: Browser launch, permission, dependency, and test page-setup failures shall be treated as environment blockers rather than application defects.
- DASH-VERIFY-008: Non-browser source checks or tests should cover protected route gating, default Home rendering contract, placeholder route presence, logout wiring, and theme/menu state where feasible.

Acceptance criteria:

- Given TypeScript verification is run, then the result records success or the exact compiler failure.
- Given lint verification is run, then the result records success or the exact lint failure.
- Given Prisma validation is relevant and run, then the result records success or the exact Prisma validation failure.
- Given a command cannot start because `npm.cmd` or `npx.cmd` is unavailable, then the blocker records the exact command and error.
- Given browser verification is restricted, then reports state it was not run and remains pending.
- Given targeted source tests are added, then they do not require a browser, Playwright, a temporary app server, or real external providers.

Edge cases:

- A stalled command should not be repeatedly retried.
- PowerShell `.ps1` shims shall not be used for Node package commands in this process.
- TypeScript verification should disable incremental output to avoid writing build-info cache in restricted workspaces.
- Environment setup failures must not be hidden by application code changes.
- Production build verification is not required for each iteration under recorded process decision and should not be claimed unless explicitly run.
- Browser verification remains pending even if source-level checks pass.

## Cross-Story Rules

- Preserve planned story ids exactly: `protect-dashboard-routing`, `dashboard-home-shell`, `collapsible-dashboard-navigation`, `dashboard-topbar-session-controls`, `dashboard-theme-toggle`, and `dashboard-non-browser-verification`.
- Do not edit test-design artifacts from this business-analysis task.
- Keep this iteration focused on the authenticated dashboard shell.
- Do not implement Feedback Request Excel upload, feedback batch creation, customer feedback forms, welcome email sending, registration profile capture, or Google registration consent in this iteration.
- Dashboard routes and placeholders must remain protected behind authenticated sessions.
- Post-login and post-registration redirects shall consistently prefer `/dashboard`; logout shall consistently return to `/`.
- User-facing dashboard text shall not imply Feedback Request or Configure are complete before their delivery iterations.
- Do not expose OAuth tokens, session tokens, database connection strings, provider secrets, Gmail credentials, or auth secrets in UI copy, requirement examples, redirects, logs, or verification evidence.
