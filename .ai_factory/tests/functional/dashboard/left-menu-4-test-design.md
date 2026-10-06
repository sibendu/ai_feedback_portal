# Left Menu 4 Test Design

- Module: dashboard
- Requested task module: Left menu 4
- Delivery iteration id: left-menu-4
- Delivery iteration title: Two-Level Left Menu
- Test design version: 0.1
- Taxonomy: 1.0
- Last updated: 2026-10-06
- Intake source: `.ai_factory/delivery/intakes/79c6bb5e-3ef7-4777-85dd-9b30fd20ee75.md`
- Planned story source: `.ai_factory/delivery/runs/d8c49425-ee5a-4399-bf43-03d048abc9d7/tasks/planning-1-plan-attempt-1.json`
- Browser status for this Codex task: not run; browser execution, Playwright, e2e tests, and temporary application server startup are disallowed in this task and remain pending controller-approved verification.

## Evidence Reviewed

- Intake `Left menu 4` requests the authenticated left menu become a two-level menu with Level 1 entries Home, Feedback, and Configure.
- Intake requests renaming the current Level 1 `Feedback Request` label to `Feedback`.
- Intake requests Level 2 entries under Feedback: `Provide Feedvack` and `Past Feedbacks`. The shared story plan normalizes the typo to `Provide Feedback`; tests should assert the planned display text `Provide Feedback` unless a later owner decision changes it.
- Intake requests Level 2 entries under Configure: `Profile` and `Change Password`.
- Intake requests Level 1 entries with submenus expand/collapse Level 2 entries without changing main content; Home has no submenu and may change main content.
- Planning story `define-two-level-navigation-model` defines the target navigation model and explicit route/active-state metadata.
- Planning story `implement-expand-collapse-menu-behavior` defines Level 1 toggle behavior, Home navigation, `aria-expanded`, and focus expectations.
- Planning story `add-submenu-destination-pages` defines destination pages and required main headings for Provide Feedback, Past Feedbacks, Profile, and Change Password.
- Planning story `update-dashboard-navigation-styling` defines nested menu styling, active child styling, desktop text fit, and collapsed-sidebar usability.
- Planning story `verify-navigation-and-routing` defines non-browser checks and pending browser coverage.
- Current source review found `src/features/dashboard/shell.tsx` still has a flat `navItems` array with `Home`, `Feedback Request`, and `Configure`.
- Current source review found `src/app/dashboard/layout.tsx` protects dashboard routes through `auth()` and redirects unauthenticated users to `/sign-in?callbackUrl=/dashboard`.
- Current source review found existing dashboard pages at `/dashboard`, `/dashboard/feedback-request`, and `/dashboard/configure`.
- Browser, Playwright, e2e tests, temporary app server startup, deployment, publishing, and external contact were not executed.

## Test Approach

Design coverage is split into source/static checks, component or unit state checks, route/page checks, accessibility checks, negative/failure cases, and controller-run browser checks.

- Static checks verify the navigation model has Level 1 and Level 2 structure, labels, routes, and active-state metadata.
- Component or unit checks verify expand/collapse state changes without navigation side effects.
- Route/page checks verify each submenu destination renders the exact required main heading and remains protected by the dashboard layout.
- Accessibility checks verify Level 1 submenu controls expose button semantics, accessible names, `aria-expanded`, keyboard operation, and focus behavior.
- Styling checks verify nested visual hierarchy, active submenu styling, collapsed-sidebar behavior, and text containment.
- Failure cases cover unknown routes, unauthenticated access, repeated toggles, direct URL entry, current-route preservation, and stale legacy label exposure.
- Browser and layout checks are designed but must be executed only by the controller-approved runner.

## Traceable Test Cases

| Test id | Story ids | Type | Priority | Test case | Expected result |
| --- | --- | --- | --- | --- | --- |
| LEFT-MENU-4-TC-001 | define-two-level-navigation-model | Static/source | P0 | Inspect the implemented dashboard navigation data model. | Level 1 entries are exactly Home, Feedback, and Configure in the intended order. |
| LEFT-MENU-4-TC-002 | define-two-level-navigation-model | Static/source/failure | P0 | Inspect visible navigation labels for the legacy first-level label. | `Feedback Request` is not exposed as a Level 1 menu label after implementation. |
| LEFT-MENU-4-TC-003 | define-two-level-navigation-model | Static/source | P0 | Inspect Home navigation metadata. | Home has no Level 2 children and has a route to `/dashboard`. |
| LEFT-MENU-4-TC-004 | define-two-level-navigation-model | Static/source | P0 | Inspect Feedback navigation metadata. | Feedback has no direct navigation side effect and has Level 2 children Provide Feedback and Past Feedbacks. |
| LEFT-MENU-4-TC-005 | define-two-level-navigation-model | Static/source | P0 | Inspect Configure navigation metadata. | Configure has no direct navigation side effect and has Level 2 children Profile and Change Password. |
| LEFT-MENU-4-TC-006 | define-two-level-navigation-model | Static/source | P0 | Inspect submenu route and active-state metadata. | Each Level 2 item has explicit routing or view mapping that can mark the current child active. |
| LEFT-MENU-4-TC-007 | define-two-level-navigation-model | Static/source/failure | P1 | Inspect navigation model for duplicate labels, duplicate hrefs, or missing ids. | No duplicate menu identities or ambiguous route mappings exist. |
| LEFT-MENU-4-TC-008 | define-two-level-navigation-model | Static/source/failure | P1 | Inspect label spelling after implementation. | Planned display text is `Provide Feedback`, not the intake typo `Provide Feedvack`, unless superseded by an owner decision. |
| LEFT-MENU-4-TC-009 | implement-expand-collapse-menu-behavior | Component/state | P0 | Render the dashboard shell with Feedback collapsed, then activate Feedback. | Feedback expands and its two Level 2 children become available. |
| LEFT-MENU-4-TC-010 | implement-expand-collapse-menu-behavior | Component/state | P0 | Activate Feedback while it is expanded. | Feedback collapses and its Level 2 children are hidden or removed from the active navigation tree. |
| LEFT-MENU-4-TC-011 | implement-expand-collapse-menu-behavior | Component/state | P0 | Render a page with known main content, then activate collapsed Feedback. | Main content remains unchanged because Feedback is a Level 1 submenu toggle. |
| LEFT-MENU-4-TC-012 | implement-expand-collapse-menu-behavior | Component/state | P0 | Render a page with known main content, then activate collapsed Configure. | Main content remains unchanged because Configure is a Level 1 submenu toggle. |
| LEFT-MENU-4-TC-013 | implement-expand-collapse-menu-behavior | Component/navigation | P0 | Activate Home from a non-Home dashboard route. | Home navigates to `/dashboard` and Home main content is shown. |
| LEFT-MENU-4-TC-014 | implement-expand-collapse-menu-behavior | Accessibility | P0 | Inspect Feedback and Configure Level 1 controls. | Controls use button semantics or equivalent keyboard-operable controls and expose accessible names. |
| LEFT-MENU-4-TC-015 | implement-expand-collapse-menu-behavior | Accessibility | P0 | Inspect `aria-expanded` for Feedback and Configure. | `aria-expanded` is false when collapsed and true when expanded. |
| LEFT-MENU-4-TC-016 | implement-expand-collapse-menu-behavior | Keyboard/accessibility | P0 | Focus Feedback and Configure and activate via keyboard in a non-browser harness where feasible. | Keyboard activation toggles the submenu without route changes. |
| LEFT-MENU-4-TC-017 | implement-expand-collapse-menu-behavior | Component/state/failure | P1 | Rapidly toggle Feedback multiple times. | Final expanded/collapsed state is deterministic and no duplicate submenu rows are created. |
| LEFT-MENU-4-TC-018 | implement-expand-collapse-menu-behavior | Component/state/failure | P1 | Expand Feedback, then expand Configure. | Implementation either supports both expanded or closes one by design, but state remains deterministic and documented by tests. |
| LEFT-MENU-4-TC-019 | implement-expand-collapse-menu-behavior | Component/state/failure | P1 | Collapse the whole sidebar while a Level 1 submenu is expanded. | Sidebar remains usable; submenu state is preserved or safely hidden according to implementation design without broken focus. |
| LEFT-MENU-4-TC-020 | add-submenu-destination-pages | Route/page | P0 | Activate Provide Feedback from the Feedback submenu. | Main content shows a page heading exactly `Provide Feedback`. |
| LEFT-MENU-4-TC-021 | add-submenu-destination-pages | Route/page | P0 | Activate Past Feedbacks from the Feedback submenu. | Main content shows a page heading exactly `Past Feedbacks`. |
| LEFT-MENU-4-TC-022 | add-submenu-destination-pages | Route/page | P0 | Activate Profile from the Configure submenu. | Main content shows a page heading exactly `Profile`. |
| LEFT-MENU-4-TC-023 | add-submenu-destination-pages | Route/page | P0 | Activate Change Password from the Configure submenu. | Main content shows a page heading exactly `Change Password`. |
| LEFT-MENU-4-TC-024 | add-submenu-destination-pages | Route/page | P0 | Directly request the Provide Feedback destination URL with an authenticated session. | The page renders under the dashboard shell and shows the Provide Feedback heading. |
| LEFT-MENU-4-TC-025 | add-submenu-destination-pages | Route/page | P0 | Directly request Past Feedbacks, Profile, and Change Password destination URLs with an authenticated session. | Each page renders under the dashboard shell and shows its matching heading. |
| LEFT-MENU-4-TC-026 | add-submenu-destination-pages | Route/security/failure | P0 | Request every new submenu destination without an authenticated session. | Protected content does not render; user is redirected to sign in through the dashboard layout. |
| LEFT-MENU-4-TC-027 | add-submenu-destination-pages | Regression | P0 | Inspect the Provide Feedback implementation against existing Feedback Request upload functionality. | Existing upload workflow is preserved under Provide Feedback or explicitly mapped by implementation notes. |
| LEFT-MENU-4-TC-028 | add-submenu-destination-pages | Route/failure | P1 | Request an unknown dashboard submenu route with and without a session. | Unauthenticated users are redirected to sign in; authenticated users receive framework-native not-found or safe redirect behavior. |
| LEFT-MENU-4-TC-029 | add-submenu-destination-pages | Security/failure | P1 | Render headings using submenu labels and inspect output. | Labels are rendered as text and cannot inject markup through navigation data. |
| LEFT-MENU-4-TC-030 | update-dashboard-navigation-styling | Static/style | P0 | Inspect CSS and rendered class structure for Level 2 menu rows. | Level 2 items are visually subordinate to Level 1 items. |
| LEFT-MENU-4-TC-031 | update-dashboard-navigation-styling | Component/style | P0 | Render each submenu destination and inspect active classes/attributes. | The active Level 2 item is distinguishable from inactive children. |
| LEFT-MENU-4-TC-032 | update-dashboard-navigation-styling | Component/style | P0 | Render a child route whose parent submenu starts collapsed or uninitialized. | Parent submenu is expanded or otherwise exposes the active child so the active location is discoverable. |
| LEFT-MENU-4-TC-033 | update-dashboard-navigation-styling | Component/style/failure | P1 | Render longest labels `Past Feedbacks` and `Change Password` in expanded sidebar. | Text fits without overlap or unreadable wrapping at supported desktop widths. |
| LEFT-MENU-4-TC-034 | update-dashboard-navigation-styling | Component/style/failure | P1 | Render the sidebar in collapsed mode. | Collapsed state remains usable through icons, titles, or accessible names; no text overlap occurs. |
| LEFT-MENU-4-TC-035 | update-dashboard-navigation-styling | Accessibility | P1 | Inspect focus indicators for Level 1 and Level 2 items. | Focus state is visible for submenu buttons and child links. |
| LEFT-MENU-4-TC-036 | update-dashboard-navigation-styling | Browser pending/layout | P1 | In controller-approved browser verification, view expanded menu at desktop width. | Sidebar, nested rows, and main content do not overlap; labels are readable. |
| LEFT-MENU-4-TC-037 | update-dashboard-navigation-styling | Browser pending/layout | P1 | In controller-approved browser verification, view collapsed sidebar at desktop width. | Main content remains visible and submenu controls remain operable or intentionally hidden with accessible alternatives. |
| LEFT-MENU-4-TC-038 | update-dashboard-navigation-styling | Browser pending/layout | P1 | In controller-approved browser verification, resize to supported narrow viewport. | Menu and main content remain reachable without incoherent overlap. |
| LEFT-MENU-4-TC-039 | verify-navigation-and-routing | Command | P0 | Run TypeScript verification from the project root after implementation. | `npx.cmd tsc --noEmit --incremental false` completes successfully, or exact compiler failure is reported. |
| LEFT-MENU-4-TC-040 | verify-navigation-and-routing | Command | P0 | Run lint verification if the script remains available. | `npm.cmd run lint` completes successfully, or exact lint failure is reported. |
| LEFT-MENU-4-TC-041 | verify-navigation-and-routing | Unit/static | P0 | Add or run targeted non-browser tests for the navigation model. | Tests prove the two-level model, labels, and submenu routes match the planned stories. |
| LEFT-MENU-4-TC-042 | verify-navigation-and-routing | Unit/static | P0 | Add or run targeted non-browser tests for Level 1 toggle behavior. | Tests prove Feedback and Configure toggle without content/navigation changes. |
| LEFT-MENU-4-TC-043 | verify-navigation-and-routing | Unit/static | P0 | Add or run targeted non-browser tests for submenu destination headings. | Tests prove each Level 2 option maps to the correct main heading. |
| LEFT-MENU-4-TC-044 | verify-navigation-and-routing | Unit/static | P0 | Add or run targeted non-browser tests for authenticated route protection. | Tests prove new submenu destinations remain protected by the dashboard session boundary. |
| LEFT-MENU-4-TC-045 | verify-navigation-and-routing | Browser pending | P0 | Run the controller-approved Playwright suite after implementation acceptance. | Browser behavior is verified only with controller evidence; this Codex task must not mark browser tests as passed. |

## Coverage Matrix

| Story id | Covered by |
| --- | --- |
| define-two-level-navigation-model | LEFT-MENU-4-TC-001 through LEFT-MENU-4-TC-008 |
| implement-expand-collapse-menu-behavior | LEFT-MENU-4-TC-009 through LEFT-MENU-4-TC-019 |
| add-submenu-destination-pages | LEFT-MENU-4-TC-020 through LEFT-MENU-4-TC-029 |
| update-dashboard-navigation-styling | LEFT-MENU-4-TC-030 through LEFT-MENU-4-TC-038 |
| verify-navigation-and-routing | LEFT-MENU-4-TC-039 through LEFT-MENU-4-TC-045 |

## Required Test Data And Fixtures

- Authenticated dashboard user fixture with a valid session.
- Unauthenticated request fixture.
- Current-route fixtures for `/dashboard`, Provide Feedback destination, Past Feedbacks destination, Profile destination, Change Password destination, and an unknown dashboard route.
- Navigation state fixtures for all collapsed, Feedback expanded, Configure expanded, both expanded if supported, collapsed sidebar, and active child route.
- Text fixtures for exact labels: Home, Feedback, Configure, Provide Feedback, Past Feedbacks, Profile, and Change Password.
- Regression fixture for existing Feedback Request upload workflow content or component mapping.
- Accessibility queries for Level 1 submenu buttons, Level 2 links, `aria-expanded`, `aria-current`, icon-only collapsed controls, and focusable elements.
- Layout fixtures for long sidebar labels and supported desktop/narrow viewport checks in controller browser execution.

## Non-Browser Execution Plan

Run these commands only when implementation is present, from the project root:

1. `npx.cmd tsc --noEmit --incremental false`
2. `npm.cmd run lint`
3. Targeted non-browser unit or static tests covering `LEFT-MENU-4-TC-041` through `LEFT-MENU-4-TC-044` once implemented.

Do not run `npm.cmd run test:e2e`, Playwright, browser launch commands, temporary application servers, deployment, publishing, or external communication in this Codex task. Browser execution remains pending and must be reported as pending unless controller evidence exists.

## Execution Notes

- Do not use real customer data, production database credentials, OAuth credentials, auth secrets, provider tokens, session tokens, or Gmail credentials in fixtures or reports.
- If `npm.cmd` or `npx.cmd` cannot be found, record the exact command failure as an environment blocker.
- If browser launch, browser permissions, dependency installation, page setup, or temporary app-server startup fails in a later approved run, report that as an environment blocker rather than an application defect.
- This task produced test design only. It did not execute non-browser checks, browser checks, Playwright, e2e tests, app server startup, deployment, publishing, or external contact.
