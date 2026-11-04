# Update headline — iteration 1 test design

Version: 1.0. Taxonomy: 1.0. Module: update headline. Action: design-tests.
Date: 2026-11-04. Run: 75402611-9878-455d-ab3f-0753d2d9a9da.
Intake: e2c25451-2add-4b1f-9146-bbf9f23c151f.
Story: `update-homepage-headline` (the only planned story).

## Authority and acceptance mapping

Shared plan: `.ai_factory/delivery/runs/75402611-9878-455d-ab3f-0753d2d9a9da/iteration-1-plan-stories.md`.
Intake: `.ai_factory/delivery/intakes/e2c25451-2add-4b1f-9146-bbf9f23c151f.md`.

The following AC labels reference the four bullets in the shared plan; they do not amend requirements.

| Plan criterion | Coverage |
| --- | --- |
| AC1: exact homepage hero h1, no trailing period | UH-001, UH-002, UH-003, UH-004, UH-005 |
| AC2: shared hero.title, normal/fallback paths, preserved semantics/style/actions/copy | UH-001, UH-002, UH-003, UH-004, UH-005, UH-006 |
| AC3: replace both legacy desktop/mobile headline assertions | UH-007 |
| AC4: diff review, applicable non-browser checks, accurate browser status | UH-006, UH-007, UH-008 |

## Fixtures and execution boundaries

- Exact expected text, E: `Process your customer signals into clearer next moves`.
- Old text, O: `Turn every customer signal into a clearer next move.`.
- Public homepage `/`, no authentication or customer data needed.
- Desktop viewport 1280 × 800; mobile viewport 390 × 844, matching the legacy mobile case.
- For failure-path checks, use an isolated non-browser module harness with a mocked `getLandingContentResponse`; import the real client and content, reset the module/mock between cases, and never mutate production source. The provider is an in-process function, not an HTTP endpoint; browser request interception cannot exercise these fallbacks.
- Baseline for preservation checks: the pre-story source/diff, especially `src/features/landing/content.ts`, `src/features/landing/client.ts`, `src/app/page.tsx`, and `src/app/globals.css`.
- These are designed cases, not executed tests. No browser execution, Playwright invocation, e2e execution, temporary server, or background process is permitted in this run. Browser cases remain pending a separately authorized run; the current controller will not execute its local Playwright runner.

## Traceable cases

All cases below belong to story `update-homepage-headline`. P0 means acceptance-critical; P1 means supporting regression coverage. Every case is currently **not run**.

| ID | AC / priority / method | Preconditions and steps | Expected result and failure detection |
| --- | --- | --- | --- |
| UH-001 | AC1, AC2 / P0 / source review and non-browser content check | Read `fallbackLandingContent.hero.title`; call `getLandingContentResponse()` and await `fetchLandingPageContent()` using the real provider. Compare each returned title strictly with E. | All three titles equal E character for character. A period, old singular phrasing, changed capitalization, missing word, or extra whitespace fails equality. Source confirms one shared value supplies normal and fallback paths. |
| UH-002 | AC1, AC2 / P0 / browser pending | Open `/` at desktop size. Query the main heading with level 1, exact accessible name E. Check count, visibility, text, id, and hero relationship. | Exactly one visible main h1 reads E and retains `id="hero-title"`; hero section retains `aria-labelledby="hero-title"`. No h1 with O appears. A duplicate, hidden replacement, or plain-text element substituted for h1 fails. |
| UH-003 | AC1, AC2 / P0 / browser pending, layout failure | Open `/` at 390 × 844. Perform the exact h1 checks from UH-002. Inspect heading bounds, wrapping, horizontal page overflow, navigation, and hero actions. | Full E remains readable without clipping, overlap, or horizontal scrolling caused by the longer copy. Existing navigation and hero actions remain usable. Wrapping is allowed; no new font or layout requirement is introduced. |
| UH-004 | AC1, AC2 / P0 / non-browser failure injection | Mock provider responses based on the real content with only hero.title changed, separately using omitted, empty string, whitespace-only string, null, and numeric values. Await the real `fetchLandingPageContent()` for each fixture. | Every invalid title resolves to E through existing normalization. No blank, old, or invalid title escapes to rendering. Use runtime fixtures for deliberately invalid types rather than loosening production TypeScript types. |
| UH-005 | AC1, AC2 / P0 / non-browser failure injection | In separate isolated cases, make the synchronous provider throw an Error, return `{ data: null }`, and return undefined. Await the real client in each case. | Existing catch fallback returns shared landing content with title E without rejecting. No new exception handling or API behavior is required by this copy change. |
| UH-006 | AC2, AC4 / P0 / diff review; browser regression pending | Inspect the story diff against baseline. Confirm only the content title and planned test assertions change in source. Review unchanged page binding, h1 semantics, styles, copy, navigation and actions. In a future authorized browser run, check hero body/eyebrow, `Create your account` → `/sign-in`, and `Explore the platform` → `#product`. | Surrounding content and behavior match baseline, and `src/app/page.tsx` still binds h1 to `content.hero.title`. No unrelated source/style changes or legacy suite migration accompany this story. Browser behavior remains unverified until actually executed. |
| UH-007 | AC3, AC4 / P0 / test-source review, negative assertions | Inspect both headline expectations in `__ai_factory__/tests/functional/feedback/build-saas-landing-home.spec.ts`: the desktop full-string matcher and mobile `/Turn every customer signal/` matcher. | Both use E with exact matching; prefer `getByRole("heading", { level: 1, name: E, exact: true })`. Neither old full text nor old mobile prefix matcher remains in these assertions. A partial matcher that could accept E plus a period fails this review. Unrelated assertions remain unchanged per plan. |
| UH-008 | AC4 / P1 / non-browser commands and evidence review | After implementation, run `git diff --check` and `npm run lint` from the project root. Record exact commands, exit codes and relevant output. Review the scoped diff and browser status. | Checks exit successfully or failures are reported accurately with evidence. Dependency/permission/setup failures are environment blockers, not application defects. No unrun check or inherited historical result is presented as a current pass. Browser status says not run/pending. |

## Source evidence and known verification limits

Reviewed during design:

- `src/features/landing/content.ts`: currently contains O at `fallbackLandingContent.hero.title`; `getLandingContentResponse()` returns that shared object. This is the expected pre-implementation state, not a delivery defect in this design task.
- `src/features/landing/client.ts`: `hasText()` rejects non-strings and whitespace-only strings; normalization uses the shared fallback for invalid hero titles. `fetchLandingPageContent()` synchronously obtains content inside a try/catch and returns the shared fallback on errors.
- `src/app/page.tsx`: awaits the client and renders `<h1 id="hero-title">{content.hero.title}</h1>` in a labelled hero section. Current primary action is `Create your account` linking to `/sign-in`.
- `src/app/globals.css`: supplies h1/hero styles and a 760px responsive breakpoint; visual fit cannot be established by source review alone.
- Legacy spec: desktop assertion uses O and mobile uses an old prefix regex. The mobile case also expects `Request demo`, while the current header says `Sign in`. That stale assertion precedes its heading assertion and may prevent the heading check from being reached in future execution. Preserve it under the plan's instruction not to repair unrelated assertions; do not claim this suite passes from the headline edit alone.
- `playwright.config.ts`: `testDir` is `.ai_factory/tests/functional`, which excludes the legacy `__ai_factory__/tests/functional` suite by default. A future authorized runner must explicitly include the legacy file and record actual discovery/execution before asserting coverage. Do not migrate suites or modify runner configuration in this story.
- `package.json`: `lint` is `eslint .`; `test:e2e` invokes Playwright and is prohibited for this run. No package installation or build/server startup is needed for test design.

The recorded owner retry decision authorizes `gpt-6.1-sol`, retained by `restore-workspace-access` and `restore-git-availability`; it supersedes the snapshot's older `gpt-5.5` wording. Historical artifacts and requirements were preserved.

## Design completion and evidence

Source and plan inspection completed using read-only shell commands (`rg`, `cat`, `sed`, `git status --short`). All four acceptance criteria and the one planned story have mapped cases, including invalid/missing title and provider failure paths. No required information is missing.

This task creates only this test-design artifact. It does not change requirements, application source, the legacy suite, or runner configuration. No application tests or lint were executed; all cases remain not run. Design integrity and whitespace checks are recorded in `.ai_factory/tests/reports/update-headline-iteration-1-design-review.md`.
