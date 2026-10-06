# Left Menu Two-Level Requirements

- Module: dashboard
- Delivery iteration id: left-menu-4
- Delivery iteration title: Left menu 4
- Status: elaborated for delivery
- Taxonomy: 1.0
- Last updated: 2026-10-06
- Planned story ids: `define-two-level-navigation-model`, `implement-expand-collapse-menu-behavior`, `add-submenu-destination-pages`, `update-dashboard-navigation-styling`, `verify-navigation-and-routing`

## Scope

Turn the authenticated dashboard left menu from a flat first-level menu into a two-level menu. The first level shall show Home, Feedback, and Configure. Home has no submenu and continues to navigate to the dashboard Home page. Feedback and Configure become expandable parent controls whose clicks show or hide their second-level options without changing the main content area. Second-level options navigate to protected dashboard content pages whose primary page heading matches the clicked option.

Out of scope for this iteration: changing authentication policy, changing logout or theme behavior except where the menu layout must continue to coexist with them, delivering new feedback history functionality beyond a page surface for Past Feedbacks, delivering profile-management behavior beyond a Profile page surface, and delivering password-change behavior beyond a Change Password page surface.

## Evidence

- Intake `Left menu 4` requests a two-level left menu after login, first-level items Home, Feedback, and Configure, and renames the existing Feedback Request first-level label to Feedback.
- Intake lists Feedback submenu options as "Provide Feedvack" and "Past Feedbacks"; this requirements artifact treats "Provide Feedvack" as a typo and uses the corrected user-facing label "Provide Feedback" because the planned story already names `Provide Feedback`.
- Intake lists Configure submenu options Profile and Change Password.
- Intake says submenu clicks should display the corresponding page heading in the main content section.
- Intake says clicking a first-level item should show or hide second-level options but not change main content, unless the first-level item has no submenu such as Home.
- Prior planning for this run produced the preserved story ids `define-two-level-navigation-model`, `implement-expand-collapse-menu-behavior`, `add-submenu-destination-pages`, `update-dashboard-navigation-styling`, and `verify-navigation-and-routing`.
- Current `src/features/dashboard/shell.tsx` defines a flat `navItems` array with Home, Feedback Request, and Configure links.
- Current dashboard source has protected routes for `/dashboard`, `/dashboard/feedback-request`, and `/dashboard/configure`.
- Current `src/app/dashboard/feedback-request/page.tsx` contains the existing Feedback Request upload workflow, which should be preserved under the new Provide Feedback destination unless implementation review finds a better local mapping.
- Current dashboard styles in `src/app/globals.css` include expanded and collapsed sidebar states, active nav styling, mobile nav grid behavior, dashboard content layout, and feedback upload panel styling.
- Browser and Playwright verification are restricted in this Codex task; controller-owned browser verification remains pending.

## Assumptions And Definitions

- "Level 1" means the primary left-menu items visible after login: Home, Feedback, and Configure.
- "Level 2" means child menu items displayed beneath an expanded Level 1 item.
- "Parent item" means a Level 1 item with Level 2 children.
- "Leaf item" means a menu item that navigates to dashboard content. Home is a Level 1 leaf; all Level 2 entries are leaf items.
- "Main content section" means the dashboard page content rendered inside `main.dashboard-main`.
- "Corresponding Page Heading" means the page's primary `h1` text exactly matches the visible submenu label for Level 2 destinations.
- Existing authenticated dashboard protections remain in force for all new submenu destinations.
- The existing Feedback Request upload behavior should continue to be reachable through Provide Feedback unless implementation review finds a lower-risk route migration pattern that preserves user access.

## Story Requirements

### define-two-level-navigation-model

Define a dashboard navigation model that represents Level 1 items and optional Level 2 children.

Requirements:

- LM-NAVMODEL-001: The authenticated dashboard navigation model shall define exactly three Level 1 items for this iteration: Home, Feedback, and Configure.
- LM-NAVMODEL-002: The Level 1 label Feedback shall replace the current Level 1 label Feedback Request.
- LM-NAVMODEL-003: Home shall be modeled as a leaf item with no Level 2 children.
- LM-NAVMODEL-004: Feedback shall be modeled as a parent item with Level 2 children Provide Feedback and Past Feedbacks.
- LM-NAVMODEL-005: Configure shall be modeled as a parent item with Level 2 children Profile and Change Password.
- LM-NAVMODEL-006: Every leaf item shall have an explicit protected dashboard route or equivalent route metadata.
- LM-NAVMODEL-007: Parent items shall have enough metadata to derive expanded, collapsed, and active-parent states from route state and user actions.
- LM-NAVMODEL-008: The model shall not expose implementation-only route names, database identifiers, auth tokens, provider tokens, or secrets in visible labels or accessibility names.

Acceptance criteria:

- Given the dashboard shell renders after login, then the visible Level 1 menu labels are Home, Feedback, and Configure.
- Given the Feedback Level 1 item is expanded, then Provide Feedback and Past Feedbacks are available as Level 2 options.
- Given the Configure Level 1 item is expanded, then Profile and Change Password are available as Level 2 options.
- Given the user navigates to a submenu destination directly by URL, then the corresponding parent can be identified as active from route metadata.
- Given future dashboard items are added later, then this iteration's model remains structured enough to add children without returning to a flat-only data shape.

Edge cases:

- The prior `/dashboard/feedback-request` page may still exist during migration; active-state rules must avoid showing both old Feedback Request and new Feedback labels as separate first-level items.
- A malformed or unknown dashboard subroute must not cause the navigation renderer to fail.
- Long future labels must not require changes to the model shape.
- Duplicate route definitions for leaf items should be avoided because they create ambiguous active states.

### implement-expand-collapse-menu-behavior

Implement Level 1 expansion behavior without changing main content for parent items.

Requirements:

- LM-BEHAVIOR-001: Clicking Home shall navigate to `/dashboard` because Home has no Level 2 submenu.
- LM-BEHAVIOR-002: Clicking Feedback shall toggle visibility of its Level 2 children and shall not navigate or replace current main content.
- LM-BEHAVIOR-003: Clicking Configure shall toggle visibility of its Level 2 children and shall not navigate or replace current main content.
- LM-BEHAVIOR-004: Clicking a visible Level 2 item shall navigate to its destination and update the main content section.
- LM-BEHAVIOR-005: The current main content shall remain unchanged when a parent Level 1 item is expanded or collapsed.
- LM-BEHAVIOR-006: Parent controls shall expose button semantics and `aria-expanded` state.
- LM-BEHAVIOR-007: Keyboard users shall be able to focus and activate Home, Feedback, Configure, and every visible Level 2 option.
- LM-BEHAVIOR-008: The existing whole-sidebar collapse control shall continue to expand and collapse the sidebar independently of Level 1 submenu expansion.
- LM-BEHAVIOR-009: A route loaded directly to a Level 2 destination should render with its parent submenu open or otherwise make the active child discoverable.

Acceptance criteria:

- Given the current main content is Home, when the user clicks Feedback, then Feedback's submenu becomes visible and Home remains the main content.
- Given Feedback's submenu is visible, when the user clicks Feedback again, then the submenu hides and the main content remains unchanged.
- Given the current main content is Provide Feedback, when the user clicks Configure, then Configure's submenu becomes visible and Provide Feedback remains the main content.
- Given the user clicks Home, then the app navigates to the Home page because Home has no submenu.
- Given the user uses the keyboard, then parent menu items can be expanded and collapsed without requiring pointer input.
- Given the sidebar itself is collapsed, then expanding it again does not corrupt the Level 1/Level 2 menu state into an unusable state.

Edge cases:

- Rapid repeated clicks on a parent item should settle into either a visible or hidden submenu without duplicate children.
- Collapsing a parent while focus is inside its submenu should move focus predictably or allow browser focus handling without trapping the user.
- Opening one parent submenu does not have to close another unless implementation chooses accordion behavior, but the behavior must be deterministic.
- Browser refresh may reset manually expanded submenus, but direct routes to Level 2 pages must remain usable.
- Parent item activation must not add unwanted history entries when it only toggles expansion.

### add-submenu-destination-pages

Provide protected dashboard content destinations for each Level 2 item.

Requirements:

- LM-PAGES-001: Provide Feedback shall navigate to a protected dashboard page whose primary heading is `Provide Feedback`.
- LM-PAGES-002: Past Feedbacks shall navigate to a protected dashboard page whose primary heading is `Past Feedbacks`.
- LM-PAGES-003: Profile shall navigate to a protected dashboard page whose primary heading is `Profile`.
- LM-PAGES-004: Change Password shall navigate to a protected dashboard page whose primary heading is `Change Password`.
- LM-PAGES-005: Provide Feedback shall preserve the existing Feedback Request upload workflow unless implementation review finds a better local mapping with lower compatibility risk.
- LM-PAGES-006: Past Feedbacks may be a future-ready page surface if feedback history functionality is not already implemented.
- LM-PAGES-007: Profile may be a future-ready page surface if profile editing functionality is not already implemented.
- LM-PAGES-008: Change Password may be a future-ready page surface if password-change functionality is not already implemented.
- LM-PAGES-009: All submenu destinations shall render inside the authenticated dashboard layout.
- LM-PAGES-010: All submenu destinations shall remain inaccessible to unauthenticated users except through the existing sign-in redirect behavior.

Acceptance criteria:

- Given an authenticated user clicks Provide Feedback, then the main content section shows an `h1` of Provide Feedback.
- Given an authenticated user clicks Past Feedbacks, then the main content section shows an `h1` of Past Feedbacks.
- Given an authenticated user clicks Profile, then the main content section shows an `h1` of Profile.
- Given an authenticated user clicks Change Password, then the main content section shows an `h1` of Change Password.
- Given an unauthenticated user opens any submenu route, then protected dashboard content is not rendered before authentication.
- Given the existing upload workflow is preserved under Provide Feedback, then upload controls remain available from the Feedback submenu rather than the old first-level Feedback Request item.

Edge cases:

- Existing external or bookmarked access to `/dashboard/feedback-request` should be handled intentionally through redirect, compatibility route, or documented replacement; it should not expose a stale first-level label.
- Placeholder copy for Past Feedbacks, Profile, or Change Password must not claim unavailable business functionality is complete.
- Page headings must be rendered as text and must not depend on URL parsing that could expose malformed route text.
- Submenu routes should use framework-native not-found behavior for unsupported nested paths.

### update-dashboard-navigation-styling

Style the nested left menu so parent, child, active, collapsed, and mobile states are clear and consistent.

Requirements:

- LM-STYLE-001: Level 2 items shall appear visually subordinate to their Level 1 parent.
- LM-STYLE-002: Active Level 2 items shall be visually distinguishable from inactive Level 2 items.
- LM-STYLE-003: Parent Level 1 items shall show a clear expanded or collapsed affordance.
- LM-STYLE-004: Parent Level 1 items shall show an active-parent state when one of their children is the current route.
- LM-STYLE-005: The existing left-sidebar collapse state shall remain usable after nested menu styling is added.
- LM-STYLE-006: Navigation labels shall not overlap icons, controls, topbar content, or main content at supported desktop and mobile widths.
- LM-STYLE-007: Collapsed sidebar behavior shall preserve accessible names or titles for icon-only navigation controls.
- LM-STYLE-008: Styling shall remain consistent with the current dashboard design language and theme variables.
- LM-STYLE-009: Light and dark dashboard themes shall both provide readable contrast for parent items, child items, active states, hover states, and focus states.

Acceptance criteria:

- Given Feedback is expanded, then Provide Feedback and Past Feedbacks are presented as child options rather than peer Level 1 items.
- Given Configure is expanded, then Profile and Change Password are presented as child options rather than peer Level 1 items.
- Given a submenu item is active, then the active child and its parent relationship are visually recognizable.
- Given the sidebar is collapsed, then the menu remains usable and does not obscure the main content.
- Given the viewport is narrow, then nested menu controls fit without text collision or inaccessible horizontal overflow.
- Given dark theme is active, then active and focus states remain visible.

Edge cases:

- Long labels such as Change Password and Past Feedbacks must fit within the available navigation width.
- A hidden child submenu must not leave stray margins or empty clickable space.
- Mobile layout must avoid a three-column grid that clips expanded child items unless styling is adapted for nested navigation.
- Focus outlines must not be clipped by the sidebar container.
- Theme-specific active colors should not make parent and child states indistinguishable.

### verify-navigation-and-routing

Verify the requirements with approved non-browser checks and leave browser verification to the controller.

Requirements:

- LM-VERIFY-001: This Codex task run shall not launch browsers, run Playwright, run `test:e2e`, or start a temporary application server.
- LM-VERIFY-002: TypeScript verification shall use `npx.cmd tsc --noEmit --incremental false`.
- LM-VERIFY-003: Lint verification shall use `npm.cmd run lint` if the script remains available.
- LM-VERIFY-004: Source-level tests or checks should cover the navigation labels, submenu structure, parent toggle behavior, submenu route headings, and old Feedback Request label removal where practical.
- LM-VERIFY-005: Verification evidence shall record each command run, its result, and exact output for failures or blockers.
- LM-VERIFY-006: Browser and Playwright verification shall be reported as pending or not run unless the controller supplies evidence.
- LM-VERIFY-007: Browser launch, permission, dependency, and test page-setup failures shall be treated as environment blockers rather than application defects.

Acceptance criteria:

- Given TypeScript verification is run, then the result records success or the exact compiler failure.
- Given lint verification is run, then the result records success or the exact lint failure.
- Given focused source tests are added, then they do not require a browser, Playwright, external providers, or a temporary app server.
- Given browser verification is restricted for this task, then final evidence does not claim Playwright passed.
- Given `npm.cmd` or `npx.cmd` is unavailable, then the implementation task reports the exact environment blocker instead of using PowerShell `.ps1` shims.

Edge cases:

- A stalled command should not be repeatedly retried.
- TypeScript incremental output must be disabled to avoid writing build-info cache in a restricted workspace.
- Environment setup failures must not be hidden by application code changes.
- Passing non-browser checks does not prove interactive browser behavior; controller verification remains the source of browser evidence.

## Cross-Story Rules

- Preserve planned story ids exactly: `define-two-level-navigation-model`, `implement-expand-collapse-menu-behavior`, `add-submenu-destination-pages`, `update-dashboard-navigation-styling`, and `verify-navigation-and-routing`.
- Do not edit test-design artifacts from this business-analysis task.
- Keep all new dashboard destinations protected by the existing authenticated dashboard layout.
- Do not create a separate first-level Feedback Request menu item.
- Do not change the main content area when toggling parent Level 1 items with children.
- Do not claim Past Feedbacks, Profile, or Change Password business workflows are complete unless implementation actually delivers them.
- Browser verification remains pending for the controller-run Playwright suite.
