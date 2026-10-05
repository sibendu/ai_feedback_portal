# Feedback Module Test Design: Iteration 1 Landing Home

- Version: 0.1
- Date: 2026-09-12
- Module: feedback
- Delivery iteration: 1
- Action: design-tests
- Scope: Single delivery iteration covering the landing home intake
- Intake: `.ai_factory/delivery/intakes/3fee0f21-511f-4c78-a8b3-561d1098ba7c.md`
- Requirements: `.ai_factory/docs/requirements/modules/feedback/iteration-1-landing-home-requirements.md`
- Planning evidence: `.ai_factory/delivery/runs/e24f1813-1cc3-4f3a-abf2-b0c7497699ef/tasks/planning-1-plan-attempt-1.json`
- Project brief: `.ai_factory/docs/project-brief.md`
- Taxonomy version: 1.0

## Test Strategy

This test design covers the planned iteration 1 stories for the `feedback` module. It is written for a greenfield Next.js, TypeScript, and Playwright SaaS proof of concept with a backend-for-frontend layer, original Customer Feedback Portal landing content, required header, horizontal navigation, footer, responsive behavior, accessibility expectations, and traceable delivery evidence.

The primary execution target is Playwright functional browser coverage under `.ai_factory/tests/functional/`. Build, lint, and TypeScript checks are included as supporting verification for bootstrap and BFF contracts. No tests were executed as part of this design task.

## Coverage Matrix

| Story ID | Coverage focus | Test case IDs |
| --- | --- | --- |
| `bootstrap-nextjs-app` | App structure, package scripts, home route, absence of starter boilerplate | `FB-I1-TC-001`, `FB-I1-TC-002`, `FB-I1-TC-003`, `FB-I1-TC-004` |
| `establish-bff-layer` | BFF endpoint, typed content path, fallback and invalid data handling | `FB-I1-TC-005`, `FB-I1-TC-006`, `FB-I1-TC-007`, `FB-I1-TC-008` |
| `build-saas-landing-home` | Hero, SaaS sections, original content, professional visual completeness | `FB-I1-TC-009`, `FB-I1-TC-010`, `FB-I1-TC-011`, `FB-I1-TC-012` |
| `add-header-navigation-footer` | Header identity, horizontal navigation, footer groups, responsive adaptation | `FB-I1-TC-013`, `FB-I1-TC-014`, `FB-I1-TC-015`, `FB-I1-TC-016` |
| `implement-responsive-accessible-ui` | Semantic landmarks, keyboard access, accessible names, responsive layout | `FB-I1-TC-017`, `FB-I1-TC-018`, `FB-I1-TC-019`, `FB-I1-TC-020`, `FB-I1-TC-021` |
| `add-playwright-coverage` | Playwright configuration, functional coverage location, mobile coverage, failure evidence | `FB-I1-TC-022`, `FB-I1-TC-023`, `FB-I1-TC-024`, `FB-I1-TC-025` |
| `document-iteration-delivery` | Delivery documentation, traceability, truthful test status, no Git dependency | `FB-I1-TC-026`, `FB-I1-TC-027`, `FB-I1-TC-028`, `FB-I1-TC-029` |

## Test Cases

### FB-I1-TC-001 - Verify Next.js TypeScript App Foundation

- Story: `bootstrap-nextjs-app`
- Type: structural
- Preconditions: Implementation task has created the app in the project root.
- Steps:
  1. Inspect root application files.
  2. Verify Next.js and TypeScript dependencies and configuration are present.
  3. Verify routing follows framework-native conventions for the selected Next.js version.
- Expected result: A Next.js TypeScript app exists at the project root using native routing and source structure.
- Failure case: Missing `package.json`, missing TypeScript setup, or non-Next.js structure fails the story.
- Evidence: File listing, relevant config excerpts, build or type-check output when executed.

### FB-I1-TC-002 - Verify Required Package Scripts

- Story: `bootstrap-nextjs-app`
- Type: structural
- Preconditions: `package.json` exists.
- Steps:
  1. Inspect `package.json`.
  2. Confirm scripts exist for development, build, linting, and Playwright test execution.
- Expected result: Scripts are present and have commands appropriate for the implemented tooling.
- Failure case: Any missing script blocks acceptance for the bootstrap story.
- Evidence: `package.json` script section.

### FB-I1-TC-003 - Verify Home Route Replaces Starter Boilerplate

- Story: `bootstrap-nextjs-app`
- Type: Playwright functional
- Preconditions: App can be served locally by the test runner.
- Steps:
  1. Navigate to `/`.
  2. Verify visible Customer Feedback Portal landing content.
  3. Assert common framework starter text and default starter links are absent.
- Expected result: The home route renders product-specific landing content without starter boilerplate.
- Failure case: Default Next.js starter copy, logos, or edit-instructions remain visible.
- Evidence: Playwright trace, screenshot, assertion output.

### FB-I1-TC-004 - Verify Bootstrap Failure Reporting

- Story: `bootstrap-nextjs-app`
- Type: process failure
- Preconditions: Dependency installation or generator execution fails during implementation.
- Steps:
  1. Capture the failed command and error output.
  2. Verify delivery evidence records the blocker without claiming build or test success.
- Expected result: The failure is documented truthfully and marked as blocking or failed as appropriate.
- Failure case: A failed setup is reported as successful, or unexecuted checks are described as passed.
- Evidence: Command output and delivery evidence.

### FB-I1-TC-005 - Verify Landing Content BFF Endpoint Exists

- Story: `establish-bff-layer`
- Type: integration or route-handler verification
- Preconditions: BFF implementation is complete.
- Steps:
  1. Inspect the Next.js route handler or equivalent endpoint.
  2. Request the landing content endpoint where executable.
  3. Verify the response includes the expected landing-page content/configuration shape.
- Expected result: A BFF endpoint exists and returns landing-page content/configuration.
- Failure case: The landing page relies only on untyped UI-local constants with no BFF path.
- Evidence: Source path, API response output, route test result.

### FB-I1-TC-006 - Verify Typed BFF Contract Consumption

- Story: `establish-bff-layer`
- Type: static and functional
- Preconditions: Home page implementation exists.
- Steps:
  1. Inspect shared or server-side types for landing content.
  2. Verify the home page consumes content through the typed BFF data path.
  3. Run TypeScript validation when available.
- Expected result: Typed content connects the BFF and home page, and type validation surfaces contract mismatches.
- Failure case: The content is passed as `any`, duplicated untyped blobs, or disconnected from the BFF response.
- Evidence: Type definitions and type-check output.

### FB-I1-TC-007 - Verify BFF Unavailable Fallback

- Story: `establish-bff-layer`
- Type: Playwright failure-path functional
- Preconditions: Test can simulate a failed BFF response through request interception or a fixture.
- Steps:
  1. Intercept or otherwise force the BFF content request to fail.
  2. Navigate to `/`.
  3. Verify a coherent fallback landing experience renders.
- Expected result: The page remains usable and visibly coherent when the BFF response is unavailable.
- Failure case: Blank page, unhandled exception, exposed stack trace, or broken layout.
- Evidence: Playwright trace, screenshot, console output.

### FB-I1-TC-008 - Verify Partial or Invalid BFF Data Handling

- Story: `establish-bff-layer`
- Type: Playwright failure-path functional
- Preconditions: Test can provide partial or invalid content data.
- Steps:
  1. Serve a BFF response with missing optional fields and empty required-like fields.
  2. Navigate to `/`.
  3. Verify required sections use defaults or omit optional items gracefully.
- Expected result: Missing or partial content does not break layout or produce empty interactive labels.
- Failure case: Undefined text, empty primary actions, layout collapse, or runtime errors.
- Evidence: Playwright trace, screenshot, assertion output.

### FB-I1-TC-009 - Verify First-Viewport Hero

- Story: `build-saas-landing-home`
- Type: Playwright visual-functional
- Preconditions: Home page implementation exists.
- Steps:
  1. Navigate to `/` at a desktop viewport.
  2. Verify the first viewport includes Customer Feedback Portal or equivalent product identity.
  3. Verify a value proposition and primary call to action are visible.
- Expected result: The first viewport clearly establishes the SaaS feedback concept.
- Failure case: Product purpose is absent, below the fold, or obscured.
- Evidence: Screenshot and locator assertions.

### FB-I1-TC-010 - Verify Placeholder SaaS Content Sections

- Story: `build-saas-landing-home`
- Type: Playwright functional
- Preconditions: Home page implementation exists.
- Steps:
  1. Navigate through the page.
  2. Verify sections for value proposition, workflow highlights, insights or admin review, and CTA content.
  3. Verify section copy is contextual and not lorem ipsum.
- Expected result: Placeholder sections support future content replacement while communicating the POC intent.
- Failure case: Required sections are missing, generic lorem ipsum appears, or page has only a hero.
- Evidence: Locator assertions and screenshot set.

### FB-I1-TC-011 - Verify Original Content and Brand Safety

- Story: `build-saas-landing-home`
- Type: content review
- Preconditions: Home page content is implemented.
- Steps:
  1. Inspect visible copy, navigation labels, image alt text, and footer labels.
  2. Check for OpenAI trademarks, proprietary copy, exact cloned section names, or third-party brand claims.
- Expected result: Content is original and specific to Customer Feedback Portal or placeholder-safe SaaS language.
- Failure case: OpenAI brand terms, protected copy, or exact cloned content are used as product content.
- Evidence: Content review notes and page text sample.

### FB-I1-TC-012 - Verify Professional Visual Completeness

- Story: `build-saas-landing-home`
- Type: exploratory visual review
- Preconditions: App can render locally.
- Steps:
  1. Capture desktop and mobile screenshots.
  2. Review spacing, typography, section rhythm, visual hierarchy, and polish.
  3. Verify there are no obvious unfinished placeholders such as broken images or raw TODO text.
- Expected result: The page presents as a credible SaaS POC suitable for stakeholder review.
- Failure case: Broken visual assets, unfinished scaffolding, raw TODO markers, or incoherent spacing.
- Evidence: Screenshots and review notes.

### FB-I1-TC-013 - Verify Header Product Identity

- Story: `add-header-navigation-footer`
- Type: Playwright functional
- Preconditions: Home page implementation exists.
- Steps:
  1. Navigate to `/`.
  2. Locate the page header.
  3. Verify recognizable Customer Feedback Portal product identity appears in or near the header.
- Expected result: Header identity is visible and appropriate to the portal.
- Failure case: Header is missing, identity is absent, or third-party brand identity is shown.
- Evidence: Locator assertions and screenshot.

### FB-I1-TC-014 - Verify Desktop Horizontal Navigation

- Story: `add-header-navigation-footer`
- Type: Playwright functional
- Preconditions: Desktop viewport is available.
- Steps:
  1. Navigate to `/` at desktop width.
  2. Verify top navigation is horizontal and visible.
  3. Verify labels are appropriate to a SaaS feedback portal POC.
- Expected result: Desktop users see usable horizontal navigation with product-safe labels.
- Failure case: Navigation is missing, vertical-only on desktop, overlapping, or uses third-party labels.
- Evidence: Locator assertions and screenshot.

### FB-I1-TC-015 - Verify Footer Groupings

- Story: `add-header-navigation-footer`
- Type: Playwright functional
- Preconditions: Home page implementation exists.
- Steps:
  1. Navigate to `/`.
  2. Scroll to the footer.
  3. Verify SaaS-style product, resource, and company-style groups or equivalent supporting content.
- Expected result: Footer appears and provides grouped supporting links or content.
- Failure case: Footer is absent, ungrouped enough to be hard to scan, or contains misleading external dependencies.
- Evidence: Locator assertions and screenshot.

### FB-I1-TC-016 - Verify Narrow-Viewport Navigation Adaptation

- Story: `add-header-navigation-footer`
- Type: Playwright responsive failure-path
- Preconditions: Mobile viewport is available.
- Steps:
  1. Set viewport to a representative mobile size.
  2. Navigate to `/`.
  3. Verify header navigation adapts without overlapping hero content or clipping labels.
  4. If a menu control is used, open it and verify links are reachable and named.
- Expected result: Header and navigation remain usable on mobile.
- Failure case: Horizontal nav overflows, links are clipped, menu cannot be opened, or content is obscured.
- Evidence: Mobile screenshot, locator assertions.

### FB-I1-TC-017 - Verify Semantic Landmarks

- Story: `implement-responsive-accessible-ui`
- Type: accessibility structural
- Preconditions: Home page implementation exists.
- Steps:
  1. Inspect the rendered page using role locators.
  2. Verify header/banner, navigation, main content, and footer/contentinfo landmarks exist.
- Expected result: Semantic landmarks are present and align with the page structure.
- Failure case: Landmark roles are missing or duplicated in confusing ways.
- Evidence: Playwright role assertions or accessibility inspection notes.

### FB-I1-TC-018 - Verify Heading Order

- Story: `implement-responsive-accessible-ui`
- Type: accessibility structural
- Preconditions: Home page implementation exists.
- Steps:
  1. Inspect headings in DOM order.
  2. Verify there is a logical primary heading and section headings do not skip confusingly.
- Expected result: Heading hierarchy supports scanning and assistive technology navigation.
- Failure case: Missing `h1`, multiple unrelated `h1` elements, or chaotic heading jumps.
- Evidence: Heading extraction output or accessibility review notes.

### FB-I1-TC-019 - Verify Keyboard Navigation and Focus Visibility

- Story: `implement-responsive-accessible-ui`
- Type: Playwright accessibility functional
- Preconditions: Page includes interactive links or controls.
- Steps:
  1. Navigate to `/`.
  2. Use keyboard tabbing through all interactive elements.
  3. Verify each focused element has a visible focus state and meaningful accessible name.
- Expected result: Keyboard users can reach and identify all interactive elements.
- Failure case: Focus disappears, controls are skipped, accessible names are empty, or tab order is confusing.
- Evidence: Playwright keyboard assertions, screenshot or trace.

### FB-I1-TC-020 - Verify Responsive Layout Across Representative Viewports

- Story: `implement-responsive-accessible-ui`
- Type: Playwright responsive
- Preconditions: App can render locally.
- Steps:
  1. Render `/` at mobile, tablet, and desktop widths.
  2. Verify text remains readable and sections remain coherent.
  3. Verify no horizontal page overflow occurs.
- Expected result: The landing page is visually coherent across representative viewports.
- Failure case: Overlap, horizontal scrolling, clipped buttons, unreadable text, or broken section order.
- Evidence: Screenshot set and viewport assertion output.

### FB-I1-TC-021 - Verify Long Placeholder Label Handling

- Story: `implement-responsive-accessible-ui`
- Type: responsive failure-path
- Preconditions: Test can use a fixture or content override with long labels.
- Steps:
  1. Provide long navigation or CTA labels through the content path where possible.
  2. Render at narrow and desktop widths.
  3. Verify text wraps, truncates, or adapts without breaking layout.
- Expected result: Long labels do not overlap adjacent UI or escape containers.
- Failure case: Text overlaps, pushes critical content off-screen, or becomes unreadable.
- Evidence: Screenshot and assertion output.

### FB-I1-TC-022 - Verify Playwright Configuration

- Story: `add-playwright-coverage`
- Type: structural
- Preconditions: Test setup implementation exists.
- Steps:
  1. Inspect Playwright configuration.
  2. Verify it targets the Next.js app and supports local execution.
  3. Verify package scripts call Playwright appropriately.
- Expected result: Playwright is configured for the application.
- Failure case: No Playwright config, unusable base URL, or missing test script.
- Evidence: Config path and script excerpts.

### FB-I1-TC-023 - Verify Functional Test Location and Scope

- Story: `add-playwright-coverage`
- Type: structural
- Preconditions: Playwright tests have been added.
- Steps:
  1. Locate functional test files.
  2. Verify they are under `.ai_factory/tests/functional/` or a documented native exception.
  3. Confirm tests cover home page load plus header, navigation, hero, and footer visibility.
- Expected result: Functional coverage follows taxonomy guidance and covers the planned landing-page surface.
- Failure case: Tests are absent, stored in an undocumented location, or miss key page areas.
- Evidence: Test file paths and assertion summary.

### FB-I1-TC-024 - Verify Mobile Coverage Exists

- Story: `add-playwright-coverage`
- Type: structural and functional
- Preconditions: Playwright tests have been added.
- Steps:
  1. Inspect or execute the Playwright suite.
  2. Verify at least one mobile-sized viewport check exists.
  3. Confirm the check validates mobile usability rather than only page load.
- Expected result: The suite includes meaningful mobile coverage.
- Failure case: Only desktop coverage exists, or mobile test has no assertions beyond navigation.
- Evidence: Test file assertion summary and execution output when run.

### FB-I1-TC-025 - Verify Test Execution Failure Evidence Handling

- Story: `add-playwright-coverage`
- Type: process failure
- Preconditions: Test execution is attempted during implementation or validation.
- Steps:
  1. If browsers, dependencies, or dev server are unavailable, capture the failed command output.
  2. Verify reports do not claim unexecuted or failed tests passed.
- Expected result: Failure or skipped execution is recorded truthfully.
- Failure case: Missing browser or server failure is hidden or reported as passing.
- Evidence: Test report or delivery evidence.

### FB-I1-TC-026 - Verify Delivery Documentation Scope

- Story: `document-iteration-delivery`
- Type: documentation review
- Preconditions: Delivery documentation has been updated.
- Steps:
  1. Inspect relevant AI Factory delivery and documentation artifacts.
  2. Verify they describe implemented landing-page scope, technology choices, and BFF foundation.
- Expected result: Documentation accurately records what was implemented.
- Failure case: Documentation is absent, stale, or omits major implementation choices.
- Evidence: Artifact paths and relevant section references.

### FB-I1-TC-027 - Verify Intake and Brief Traceability

- Story: `document-iteration-delivery`
- Type: documentation review
- Preconditions: Delivery documentation has been updated.
- Steps:
  1. Inspect delivery evidence.
  2. Verify references to the intake and project brief paths are present.
  3. Verify module `feedback` and iteration `1` are included.
- Expected result: Evidence traces back to intake, project brief, module, and iteration.
- Failure case: Reviewers cannot connect the delivery to the originating intake or brief.
- Evidence: Delivery artifact references.

### FB-I1-TC-028 - Verify Truthful Test Status Documentation

- Story: `document-iteration-delivery`
- Type: documentation failure-path
- Preconditions: Tests have been run, failed, skipped, or not run.
- Steps:
  1. Inspect delivery evidence and reports.
  2. Verify executed tests, failures, skipped checks, and unrun tests are stated accurately.
- Expected result: Test execution status is truthful and supported by evidence.
- Failure case: Documentation says tests passed without successful execution evidence.
- Evidence: Test reports, command outputs, delivery notes.

### FB-I1-TC-029 - Verify No Git Dependency in Evidence

- Story: `document-iteration-delivery`
- Type: documentation review
- Preconditions: Delivery evidence has been prepared.
- Steps:
  1. Inspect delivery evidence.
  2. Verify it does not require a Git commit hash because the project has no Git repository requirement for this iteration.
- Expected result: Evidence remains valid without Git metadata.
- Failure case: Delivery documentation is blocked solely by missing Git commit information.
- Evidence: Delivery notes.

## Regression and Exploratory Charter

- Confirm landing-page behavior after any future content replacement in the BFF response.
- Explore visual polish at common viewport widths: 375, 768, 1024, and 1440 pixels.
- Review console errors and network failures during home page load.
- Check that placeholder links do not navigate to misleading third-party destinations.
- Check that focus order follows the visible reading order after responsive layout changes.

## Test Data and Fixtures

- Default landing content fixture: complete BFF payload with product identity, navigation labels, hero content, section summaries, CTA labels, and footer groups.
- BFF unavailable fixture: failed response, timeout, or handler exception.
- Partial content fixture: missing optional sections and empty optional copy.
- Long-label fixture: extended navigation and CTA labels to exercise wrapping and overflow.

## Evidence Expectations

- Functional execution evidence should be stored under `.ai_factory/tests/reports/` when tests are run.
- Screenshots and traces should identify module `feedback`, iteration `1`, and relevant test case IDs where practical.
- Failed or unrun checks must be recorded as failed, blocked, or not run; they must not be reported as passed.

## Not Run

No tests were executed for this test-design task. This artifact defines planned test coverage only.
