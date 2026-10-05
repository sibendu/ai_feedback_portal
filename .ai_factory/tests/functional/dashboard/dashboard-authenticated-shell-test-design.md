# Authenticated Dashboard Shell Test Design

- Module: dashboard
- Requested task module: registration
- Delivery iteration id: authenticated-dashboard-shell
- Delivery iteration title: Authenticated Dashboard Shell
- Test design version: 0.1
- Taxonomy: 1.0
- Last updated: 2026-09-15
- Requirements source: `.ai_factory/docs/requirements/modules/dashboard/dashboard-authenticated-shell-requirements.md`
- Planned story ids: `protect-dashboard-routing`, `dashboard-home-shell`, `collapsible-dashboard-navigation`, `dashboard-topbar-session-controls`, `dashboard-theme-toggle`, `dashboard-non-browser-verification`
- Browser status for this Codex task: not run; browser execution is not approved and remains pending controller-approved verification

## Evidence Reviewed

- `.ai_factory/docs/requirements/modules/dashboard/dashboard-authenticated-shell-requirements.md` defines the dashboard shell scope, acceptance criteria, edge cases, assumptions, and cross-story rules.
- Prior planning for iteration `authenticated-dashboard-shell` defines six planned stories: protected routing, Home shell, collapsible navigation, topbar session controls, theme toggle, and non-browser verification.
- `package.json` includes Next.js, React, TypeScript, NextAuth, Prisma Client, Prisma CLI, ESLint, and Playwright dependencies, with `lint`, `build`, `dev`, `start`, and `test:e2e` scripts.
- `src/auth.ts` exports `auth`, `handlers`, `signIn`, and `signOut`, uses the Prisma adapter, uses database-backed sessions, configures `/sign-in`, exposes `session.user.name`, and currently includes registration/welcome-email callbacks.
- `src/app/sign-in/page.tsx` currently calls `signIn(provider.id, { redirectTo: "/" })`, so post-login routing to `/dashboard` is a required delivery change.
- `src/app/register/actions.ts` currently calls `signIn(provider, { redirectTo: "/" })` for provider registration and accepted Google consent, so post-registration routing to `/dashboard` is a required delivery change.
- Current `src/app` inspection found no `src/app/dashboard` route, no dashboard shell route group, no dashboard placeholders, no logout form/control, and no theme/menu-state implementation yet.
- `src/app/page.tsx` is the public landing page and is the required logout return destination.
- Browser, Playwright, e2e tests, temporary app server startup, deployment, and publishing are explicitly disallowed for this Codex task.

## Test Approach

Use a layered design that can be implemented with source-level and non-browser tests first, then completed with controller-approved browser verification later.

- Server route and component tests verify dashboard pages call the Auth.js session boundary before rendering protected content.
- Source/static checks verify login and registration redirects target `/dashboard` and logout uses Auth.js `signOut` with callback URL `/`.
- Component or render-level tests with mocked session data verify Home fallback identity behavior, protected placeholders, active navigation, collapsed menu state, and topbar control ordering.
- Client-state unit tests verify theme and menu toggles persist or recover safely without changing route/session data.
- Accessibility checks cover icon-only controls, collapsed navigation, keyboard operation, focus states, and accessible names.
- Browser and layout tests are designed but must remain pending in this restricted run until the controller allows browser execution.
- Environment setup failures for command resolution, dependency setup, browser launch, browser permissions, or test page setup are blockers, not application defects.

## Traceable Test Cases

| Test id | Story ids | Type | Priority | Test case | Expected result |
| --- | --- | --- | --- | --- | --- |
| DASH-SHELL-TC-001 | protect-dashboard-routing | Static/route | P0 | Inspect implemented app routes after delivery. | `/dashboard` exists as the canonical authenticated destination. |
| DASH-SHELL-TC-002 | protect-dashboard-routing | Static/security | P0 | Inspect `/dashboard` page or layout implementation. | Protected dashboard content is gated by `auth()` or an equivalent framework-native Auth.js session check before rendering. |
| DASH-SHELL-TC-003 | protect-dashboard-routing | Unit/integration/failure | P0 | Render or invoke `/dashboard` with no session in a non-browser harness. | Dashboard shell and Home content are not returned; user is redirected to `/sign-in` or the approved sign-in entry point. |
| DASH-SHELL-TC-004 | protect-dashboard-routing | Unit/integration/failure | P0 | Render or invoke `/dashboard/feedback-request` with no session. | Protected placeholder content is not returned; user is redirected to sign in. |
| DASH-SHELL-TC-005 | protect-dashboard-routing | Unit/integration/failure | P0 | Render or invoke `/dashboard/configure` with no session. | Protected placeholder content is not returned; user is redirected to sign in. |
| DASH-SHELL-TC-006 | protect-dashboard-routing | Unit/integration/failure | P0 | Simulate an expired, deleted, or invalid database session for a dashboard route. | The request is treated as unauthenticated and fails closed. |
| DASH-SHELL-TC-007 | protect-dashboard-routing | Static/routing | P0 | Inspect sign-in provider actions after implementation. | Successful login redirects to `/dashboard`, replacing the current `/` target. |
| DASH-SHELL-TC-008 | protect-dashboard-routing | Static/routing | P0 | Inspect registration provider actions and accepted Google consent actions after implementation. | Successful registration redirects to `/dashboard`, replacing the current `/` target. |
| DASH-SHELL-TC-009 | protect-dashboard-routing | Security/failure | P0 | Inspect dashboard redirects, route params, rendered markup, and errors. | No session tokens, provider tokens, database URLs, OAuth credentials, Gmail credentials, or auth secrets are exposed. |
| DASH-SHELL-TC-010 | protect-dashboard-routing | Integration/failure | P1 | Attempt to manipulate callback or redirect parameters to land on dashboard without a session. | Redirect manipulation does not bypass the dashboard session requirement. |
| DASH-SHELL-TC-011 | protect-dashboard-routing | Integration/failure | P1 | Simulate session lookup/database failure while loading a dashboard route. | The route fails closed or shows safe error handling without protected data or internal details. |
| DASH-SHELL-TC-012 | dashboard-home-shell | Component | P0 | Render `/dashboard` with an authenticated session containing `user.name`. | Home is shown by default and displays a welcome message containing the friendly name. |
| DASH-SHELL-TC-013 | dashboard-home-shell | Component | P0 | Render `/dashboard` with no `user.name` but with `user.email`. | Welcome message uses email or a generic safe fallback without throwing. |
| DASH-SHELL-TC-014 | dashboard-home-shell | Component/failure | P0 | Render `/dashboard` with missing or whitespace-only `user.name` and missing email. | Home still renders using a generic welcome fallback. |
| DASH-SHELL-TC-015 | dashboard-home-shell | Component/security | P0 | Render Home with a display name containing HTML or script-like text. | Name is rendered as text, not interpreted as markup. |
| DASH-SHELL-TC-016 | dashboard-home-shell | Component/navigation | P0 | Render `/dashboard` with a valid session. | Home navigation entry is marked as current or selected. |
| DASH-SHELL-TC-017 | dashboard-home-shell | Static/scope | P0 | Inspect Home content for this iteration. | Home does not include Excel upload controls, batch submit controls, customer email-sending controls, or copy implying Feedback Request is complete. |
| DASH-SHELL-TC-018 | dashboard-home-shell | Browser pending/layout | P1 | In a later approved browser run, view Home with expanded navigation at desktop and mobile widths. | Welcome content remains readable and visible beside or below navigation. |
| DASH-SHELL-TC-019 | dashboard-home-shell | Browser pending/layout | P1 | In a later approved browser run, view Home with collapsed navigation. | Main content remains visible and does not sit underneath the menu. |
| DASH-SHELL-TC-020 | dashboard-home-shell | Component/layout | P1 | Render Home with a very long display name or email. | Identity and welcome content truncate, wrap, or otherwise fit without breaking the shell. |
| DASH-SHELL-TC-021 | collapsible-dashboard-navigation | Component | P0 | Render the authenticated dashboard shell in expanded state. | Left navigation contains Home, Feedback Request, and Configure labels. |
| DASH-SHELL-TC-022 | collapsible-dashboard-navigation | Component/state | P0 | Activate the collapse control in a non-browser component harness. | Menu enters collapsed state without navigating away from the current dashboard route. |
| DASH-SHELL-TC-023 | collapsible-dashboard-navigation | Component/state | P0 | Activate the expand control after collapse. | Menu returns to expanded state and labels are available again. |
| DASH-SHELL-TC-024 | collapsible-dashboard-navigation | Accessibility | P0 | Inspect collapse/expand control and collapsed icon links. | Icon-only controls have accessible names and keyboard-focusable elements. |
| DASH-SHELL-TC-025 | collapsible-dashboard-navigation | Component/navigation | P0 | Navigate or render the Feedback Request dashboard destination with a valid session. | A protected future-ready placeholder is shown and no upload workflow starts. |
| DASH-SHELL-TC-026 | collapsible-dashboard-navigation | Component/navigation | P0 | Navigate or render the Configure dashboard destination with a valid session. | A protected future-ready placeholder indicates future implementation and exposes no configuration feature. |
| DASH-SHELL-TC-027 | collapsible-dashboard-navigation | Component/navigation | P0 | Render each dashboard route. | The corresponding navigation item is visually marked active. |
| DASH-SHELL-TC-028 | collapsible-dashboard-navigation | Keyboard/accessibility | P1 | Tab through dashboard navigation and activate entries in a non-browser accessibility harness where feasible. | Collapse/expand and all entries can receive focus and activate with keyboard semantics. |
| DASH-SHELL-TC-029 | collapsible-dashboard-navigation | Browser pending/layout | P1 | In a later approved browser run, collapse and expand at small widths. | Main content remains reachable; focus is not trapped and controls do not overlap. |
| DASH-SHELL-TC-030 | collapsible-dashboard-navigation | Routing/failure | P1 | Request an unknown dashboard subroute with and without a valid session. | Unauthenticated users are redirected to sign in; authenticated users receive framework-native not-found or safe redirect behavior. |
| DASH-SHELL-TC-031 | dashboard-topbar-session-controls | Component | P0 | Render the dashboard shell with authenticated `user.name`. | The name appears in the top-right identity area. |
| DASH-SHELL-TC-032 | dashboard-topbar-session-controls | Component | P0 | Render the dashboard shell with no name and a valid email. | The email appears as the identity fallback. |
| DASH-SHELL-TC-033 | dashboard-topbar-session-controls | Component/failure | P0 | Render the dashboard shell with no name and no email. | Topbar renders a safe generic identity without crashing. |
| DASH-SHELL-TC-034 | dashboard-topbar-session-controls | Component/order | P0 | Inspect topbar control order. | Logout appears after identity text, with the theme toggle also fitting in the session-control area. |
| DASH-SHELL-TC-035 | dashboard-topbar-session-controls | Static/auth | P0 | Inspect the Logout implementation. | Logout uses framework-native Auth.js `signOut` or approved Auth.js sign-out endpoint/action. |
| DASH-SHELL-TC-036 | dashboard-topbar-session-controls | Unit/integration | P0 | Invoke logout action with a valid session in a non-browser harness. | Sign-out invalidates the active session and redirects or returns to `/`. |
| DASH-SHELL-TC-037 | dashboard-topbar-session-controls | Integration/failure | P0 | Attempt to open `/dashboard` after logout has completed. | The route requires sign-in again. |
| DASH-SHELL-TC-038 | dashboard-topbar-session-controls | Security | P0 | Inspect client code, logout forms, URLs, and logs. | Logout does not expose raw tokens, session identifiers, provider tokens, database connection strings, or secrets. |
| DASH-SHELL-TC-039 | dashboard-topbar-session-controls | Failure | P1 | Trigger logout twice or simulate a double-submit. | User is not left partially signed in; final state is landing page or safe unauthenticated state. |
| DASH-SHELL-TC-040 | dashboard-topbar-session-controls | Browser pending/layout | P1 | In a later approved browser run, render a long identity at desktop and mobile widths. | Identity does not cover Logout or theme toggle. |
| DASH-SHELL-TC-041 | dashboard-theme-toggle | Component | P0 | Render the dashboard shell with an authenticated session. | An icon-only theme toggle is available near identity and Logout. |
| DASH-SHELL-TC-042 | dashboard-theme-toggle | Accessibility | P0 | Inspect the theme toggle element. | The visible control is icon-only and exposes an accessible name for assistive technology. |
| DASH-SHELL-TC-043 | dashboard-theme-toggle | Unit/state | P0 | Activate the theme toggle from light mode. | Dashboard state changes to dark theme without changing route, session, or main content. |
| DASH-SHELL-TC-044 | dashboard-theme-toggle | Unit/state | P0 | Activate the theme toggle from dark mode. | Dashboard state changes to light theme without changing route, session, or main content. |
| DASH-SHELL-TC-045 | dashboard-theme-toggle | Unit/state | P0 | Navigate among Home, Feedback Request placeholder, and Configure placeholder after changing theme. | Selected theme remains applied across dashboard navigation where the implementation stores shared shell state. |
| DASH-SHELL-TC-046 | dashboard-theme-toggle | Unit/state | P1 | Refresh or remount the dashboard after changing theme with storage available. | Theme persists when technically feasible through the selected storage pattern. |
| DASH-SHELL-TC-047 | dashboard-theme-toggle | Unit/failure | P1 | Simulate unavailable or failing theme storage. | Dashboard remains usable and falls back to a deterministic light/dark default. |
| DASH-SHELL-TC-048 | dashboard-theme-toggle | Unit/failure | P1 | Toggle theme rapidly multiple times. | Final state is a valid light or dark theme and storage is not corrupted. |
| DASH-SHELL-TC-049 | dashboard-theme-toggle | Accessibility/browser pending | P1 | In a later approved browser or accessibility run, inspect focus and contrast in both themes. | Text, icons, selected navigation, controls, and focus indicators remain readable in light and dark modes. |
| DASH-SHELL-TC-050 | dashboard-theme-toggle | Security | P0 | Inspect theme persistence storage keys and values. | Theme storage contains only non-sensitive theme preference data, never session or personal information. |
| DASH-SHELL-TC-051 | dashboard-non-browser-verification | Command | P0 | Run dependency verification with `npm.cmd ls next next-auth @auth/prisma-adapter @prisma/client prisma typescript --depth=0`. | Required baseline dependencies are present, or the exact failure is reported as blocker or defect according to cause. |
| DASH-SHELL-TC-052 | dashboard-non-browser-verification | Command | P0 | Run Prisma validation with `npx.cmd prisma validate` when implementation is present. | Prisma schema validates, or the exact validation failure is reported. |
| DASH-SHELL-TC-053 | dashboard-non-browser-verification | Command | P0 | Run TypeScript verification with `npx.cmd tsc --noEmit --incremental false`. | TypeScript check passes, or the exact compiler failure is reported. |
| DASH-SHELL-TC-054 | dashboard-non-browser-verification | Command | P0 | Run lint verification with `npm.cmd run lint` if the script remains available. | Lint passes, or the exact lint failure is reported. |
| DASH-SHELL-TC-055 | dashboard-non-browser-verification | Unit/static | P0 | Run targeted non-browser tests or source checks for protected routing. | Tests prove unauthenticated requests cannot render dashboard shell/content. |
| DASH-SHELL-TC-056 | dashboard-non-browser-verification | Unit/static | P0 | Run targeted non-browser tests or source checks for Home/default route behavior. | Tests prove authenticated `/dashboard` renders Home and safe identity fallbacks. |
| DASH-SHELL-TC-057 | dashboard-non-browser-verification | Unit/static | P0 | Run targeted non-browser tests or source checks for placeholders. | Tests prove Feedback Request and Configure placeholders exist and remain protected. |
| DASH-SHELL-TC-058 | dashboard-non-browser-verification | Unit/static | P0 | Run targeted non-browser tests or source checks for logout wiring. | Tests prove Logout uses Auth.js sign-out semantics and targets `/`. |
| DASH-SHELL-TC-059 | dashboard-non-browser-verification | Unit/static | P0 | Run targeted non-browser tests or source checks for theme/menu controls. | Tests prove menu collapse and theme toggle have deterministic state and accessible names where feasible. |
| DASH-SHELL-TC-060 | dashboard-non-browser-verification | Browser pending | P0 | Run controller-approved browser dashboard verification later. | Browser coverage records actual evidence only when approved; this Codex task must not report it as passed. |

## Coverage Matrix

| Story id | Covered by |
| --- | --- |
| protect-dashboard-routing | DASH-SHELL-TC-001 through DASH-SHELL-TC-011 |
| dashboard-home-shell | DASH-SHELL-TC-012 through DASH-SHELL-TC-020 |
| collapsible-dashboard-navigation | DASH-SHELL-TC-021 through DASH-SHELL-TC-030 |
| dashboard-topbar-session-controls | DASH-SHELL-TC-031 through DASH-SHELL-TC-040 |
| dashboard-theme-toggle | DASH-SHELL-TC-041 through DASH-SHELL-TC-050 |
| dashboard-non-browser-verification | DASH-SHELL-TC-051 through DASH-SHELL-TC-060 |

## Required Test Data And Fixtures

- Isolated non-production database and Auth.js session fixtures for valid user, expired session, deleted session, invalid token/session, and session lookup failure.
- Authenticated user fixture with `name`, `email`, and database `Session`.
- Authenticated user fixture with missing `name` and valid `email`.
- Authenticated user fixture with missing or whitespace-only `name` and missing `email`.
- Long identity fixture with a very long display name and a very long email address.
- Display-name security fixture containing markup-like and script-like characters that must render as text.
- Dashboard route fixtures for `/dashboard`, `/dashboard/feedback-request`, `/dashboard/configure`, and an unknown dashboard subroute.
- Component fixtures or render harness mocks for expanded navigation, collapsed navigation, active route state, topbar identity, logout action, and theme state.
- Theme-state fixtures for light default, dark selected, storage unavailable, corrupted stored value, and rapid toggle sequences.
- Accessibility fixtures or queries for icon-only controls, collapsed navigation links, visible focus state, and keyboard activation.
- Secret-scrubbing helper for assertions against rendered markup, redirect URLs, logs, thrown errors, source snapshots, and test reports.

## Non-Browser Execution Plan

Run these commands when implementation is present, from the project root:

1. `npm.cmd ls next next-auth @auth/prisma-adapter @prisma/client prisma typescript --depth=0`
2. `npx.cmd prisma validate`
3. `npx.cmd tsc --noEmit --incremental false`
4. `npm.cmd run lint`
5. Targeted non-browser unit, integration, or static tests for `DASH-SHELL-TC-055` through `DASH-SHELL-TC-059` once implemented.

Do not run `npm.cmd run test:e2e`, Playwright, browser launch commands, temporary application servers, deployment, publishing, or real provider/email actions in this Codex task. Browser execution remains pending and must be reported as pending unless controller evidence exists.

## Execution Notes

- Do not use real customer data, real OAuth tokens, production database credentials, Gmail credentials, provider secrets, or auth secrets in test fixtures or reports.
- Do not record OAuth client secrets, auth secrets, provider tokens, refresh tokens, id tokens, session tokens, database URLs, Gmail app passwords, or raw provider payloads in evidence.
- If `npm.cmd` or `npx.cmd` cannot be found, record the exact command failure as an environment blocker.
- If browser launch, browser permissions, dependency installation, page setup, or temporary app-server startup fails in a later approved run, report that as an environment blocker rather than an application defect.
- Production build verification is not required for this iteration under the recorded process decision and is not part of this test-design action.
- No browser verification, Playwright test, e2e test, app server startup, deployment, publishing, or real external communication was executed while producing this test design.
