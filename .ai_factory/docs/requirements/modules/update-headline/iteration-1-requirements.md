# Update headline — iteration 1 requirements

Version: 1.1 (compatible addition to the existing landing-page requirements).
Taxonomy: 1.0. Action: analyze. Module: update headline. Delivery iteration: 1.
Run: 75402611-9878-455d-ab3f-0753d2d9a9da.
Intake: `.ai_factory/delivery/intakes/e2c25451-2add-4b1f-9146-bbf9f23c151f.md`.
Plan: `.ai_factory/delivery/runs/75402611-9878-455d-ab3f-0753d2d9a9da/iteration-1-plan-stories.md`.
Project brief: `.ai_factory/docs/project-brief.md`.
Baseline: `__ai_factory__/docs/requirements/modules/feedback/iteration-1-landing-home-requirements.md` (version 0.1; historical scope retained).

## Story: update-homepage-headline — Update the homepage headline

As a homepage visitor, I want the headline to explain the portal's promise so I understand how customer signals inform my next actions.

### Requirements

- R1: Replace the homepage (`/`) hero statement with exactly `Process your customer signals into clearer next moves`. Capitalization and plural wording are intentional. The quotation marks delimit the intake text; they are not displayed. Do not append a period.
- R2: Use `hero.title` in `src/features/landing/content.ts` as the shared source for normal content and existing fallback behavior. Keep the typed content contract and normalization behavior intact.
- R3: Render the replacement in the existing `h1#hero-title`, preserving the hero section's accessible heading association. Preserve typography, responsive styling, navigation, actions, links, and surrounding copy.
- R4: Maintain the existing desktop and mobile headline expectations in `__ai_factory__/tests/functional/feedback/build-saas-landing-home.spec.ts` using the full new text. This existing suite remains at its legacy path; no test migration or unrelated assertion repair is required by this story.
- R5: Delivery evidence must record the reviewed diff and actual applicable non-browser check results. Browser verification remains pending under the execution policy; browser execution is prohibited for this run.

### Acceptance criteria

1. AC1 (R1): When `/` renders normal landing content, its hero h1 text is exactly `Process your customer signals into clearer next moves`, without quotation marks or a trailing period. The old statement is no longer displayed there.
2. AC2 (R2): The shared `hero.title` contains that exact replacement. When the existing content-loading path falls back, the hero uses the same replacement. A missing, empty, or whitespace-only hero title also resolves to that shared default through existing normalization.
3. AC3 (R3): The heading remains `h1#hero-title`, and the enclosing section retains `aria-labelledby="hero-title"`. Existing styling, actions, navigation, and other copy remain unchanged.
4. AC4 (R3, R4): The full replacement is readable on desktop and mobile, including the existing 390 × 844 mobile viewport. Normal line wrapping is allowed; clipping, hidden words, or headline-induced horizontal overflow is not. Both existing old-headline assertions are updated to require the full replacement text.
5. AC5 (R5): The implementation diff is reviewed and applicable non-browser checks have recorded outcomes. Any failures or checks not run are stated accurately. Browser verification is explicitly pending or not run, never reported as passed without controller evidence.

### Edge cases

- Exact copy: reject the previous singular wording, added punctuation, altered capitalization, quote characters, or truncated wording. Layout-driven line breaks may vary without changing the text.
- Fallback: a loading/parsing exception returns shared fallback content; missing, empty, or whitespace-only title values use the shared default. No new error handling or content service is required.
- Valid supplied content: existing normalization accepts a nonempty supplied title. Do not introduce a forced override of hypothetical future external content; the current provider returns the shared content.
- Narrow screens: allow natural wrapping using existing styles. Browser behavior requires later verification; source inspection alone cannot establish visual success.
- Legacy coverage: the mobile suite contains unrelated expectations (for example, `Request demo`). Do not broaden this copy story to repair those expectations. If they fail during later authorized execution, record the observed failure separately.
- Historic documents may retain the old wording as evidence. Removing historical references is not an acceptance condition.

### Dependencies, boundaries, and open questions

Dependencies: none beyond the existing landing content and rendering path. No new package, schema, integration, API contract, or migration is required. Implementation ownership covers the shared title and two existing headline assertions. This analysis owns only requirement artifacts, not source changes or test-design artifacts.

No open business questions or missing required information were identified. Authentication, dashboard behavior, other marketing copy, visual redesign, deployment, publishing, and external contact are outside this story.

## Evidence and operational traceability

- Intake explicitly supplies the exact replacement statement; the plan contains one story, `update-homepage-headline`, preserved here without adding delivery stories.
- `src/features/landing/content.ts:13` contains the old statement; lines 147–150 return the shared content from `getLandingContentResponse()`.
- `src/features/landing/client.ts:122` selects a valid title or the shared fallback; lines 229–234 use the shared response and return fallback content on an exception.
- `src/app/page.tsx:30` associates the hero section with `hero-title`; line 33 renders `content.hero.title` in that h1.
- `__ai_factory__/tests/functional/feedback/build-saas-landing-home.spec.ts:11` asserts the old full headline; line 61 asserts its old prefix. Line 56 defines the mobile viewport as 390 × 844.
- `package.json` exposes `lint` and `build` as available non-browser checks. They were inspected, not executed during this requirements task.
- The historical landing requirements allow replaceable placeholder copy. This intake makes this one headline exact; broader historical requirements are not reopened.
- The run snapshot retains older `gpt-5.5` wording. The explicit owner retry decision authorizes `gpt-6.1-sol`, retained by `restore-workspace-access` and `restore-git-availability`, and supersedes that snapshot wording. The snapshot is preserved.

Source reads, plan/intake review, and Git status inspection succeeded. Initial Git status showed only generated intake/run artifacts and no application-source edits. No tests were run, browsers launched, servers started, dependencies installed, or external people contacted. Browser verification remains pending. This document elaborates requirements; it does not certify implementation or acceptance completion.

Document verification: `git diff --check` succeeded. An optional document consistency check attempted with `python -` could not start (`/bin/bash: line 1: python: command not found`); the equivalent check using `node -` succeeded, verifying the preserved story id, five acceptance criteria, edge-case section, exact copy, and absence of trailing whitespace. These are document checks, not application tests. Final status also showed `.ai_factory/tests/functional/update-headline/` from concurrent work; this task did not edit it.
