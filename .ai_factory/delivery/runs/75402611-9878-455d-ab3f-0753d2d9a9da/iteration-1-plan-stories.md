# Update headline — iteration 1 stories

Version: 1.0. Taxonomy: 1.0. Action: plan-stories. Module: update headline.
Intake: e2c25451-2add-4b1f-9146-bbf9f23c151f.

## Ordered delivery story

1. **update-homepage-headline — Update the homepage headline**

   As a homepage visitor, I want to read “Process your customer signals into clearer next moves” so I understand the portal's promise.

   Dependencies: none; use the existing landing content and rendering path. No new package, service, migration, or integration is needed.

   Acceptance criteria:
   - The homepage hero h1 reads exactly `Process your customer signals into clearer next moves`, with no trailing period.
   - Update `hero.title` in `src/features/landing/content.ts`; normal and fallback content use the same replacement. Preserve the existing h1 semantics, styling, navigation, actions, and surrounding copy.
   - Update the two old-headline expectations in `__ai_factory__/tests/functional/feedback/build-saas-landing-home.spec.ts` for desktop and mobile coverage, using the exact new heading text. Keep this copy change scoped; do not migrate the legacy suite or repair unrelated assertions as part of this story.
   - Review the diff and perform applicable non-browser checks, recording actual results. Browser verification remains pending: do not launch browsers, Playwright, test:e2e, or temporary application servers during this run.

## Source evidence and scope

- `src/features/landing/content.ts`: `fallbackLandingContent.hero.title` currently contains `Turn every customer signal into a clearer next move.`; `getLandingContentResponse()` returns this shared content.
- `src/features/landing/client.ts`: normalizes the hero title with the shared fallback and returns fallback content if fetching fails.
- `src/app/page.tsx`: renders `content.hero.title` inside `<h1 id="hero-title">`.
- `__ai_factory__/tests/functional/feedback/build-saas-landing-home.spec.ts`: desktop and mobile assertions both reference the old headline. This is an existing legacy path, not a new artifact location.
- `package.json`: provides `lint` and `build` scripts; browser execution is prohibited for this task.
- `.ai_factory/delivery/intakes/e2c25451-2add-4b1f-9146-bbf9f23c151f.md`: supplies the exact replacement text.

## Operational traceability and verification

The snapshot retains older `gpt-5.5` model wording. The recorded owner retry decision authorizes `gpt-6.1-sol`, subsequently retained by restore-workspace-access and restore-git-availability; that decision supersedes the snapshot wording. The snapshot was preserved.

Source reads and `git status --short` succeeded. Before this plan was added, Git showed only generated intake/run records and no application-source edits. No tests were run, no application source was changed, and no browser or background process was started. No missing information or dependency blocks this single delivery story.
