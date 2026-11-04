# Update headline — iteration 1 tester evidence

Version: 1.0. Taxonomy: 1.0. Date: 2026-11-04.
Action: test. Module: update headline. Iteration: 1.
Run: 75402611-9878-455d-ab3f-0753d2d9a9da.
Intake: e2c25451-2add-4b1f-9146-bbf9f23c151f.
Story: `update-homepage-headline` (the complete planned iteration).

## Scope and method

Reviewed the iteration plan, requirements, test design, implementation evidence,
current source, browser configuration, and tracked diff. Added a reproducible
non-browser harness at
`.ai_factory/tests/integration/update-headline/iteration-1.test.mjs`.
It transpiles the real TypeScript modules in memory and injects providers through
the existing import boundary. It renders the real async homepage using React's
static renderer and a simple anchor replacement for `next/link`. This verifies
generated markup without starting an application server or browser. It does not
exercise Next.js routing, hydration, browser accessibility computation, or CSS layout.

## Executed results

- `node --test .ai_factory/tests/integration/update-headline/iteration-1.test.mjs`
  exited 0: 15 tests passed, 0 failed, 0 skipped/cancelled/todo (7 parent cases
  including 8 fixture subtests). Initial duration: 4663.454104 ms; final rerun
  after the test-helper rename also exited 0 (3650.395784 ms, 15 passed).
- `git diff --check` exited 0 with no whitespace diagnostics.
- `git diff --stat` exited 0: the existing tracked implementation diff contains
  only the shared title and the two legacy headline expectations (11 insertions,
  3 deletions). New tester artifacts are untracked and are not counted by this command.
- Initial `npm run lint` exited 1 on the new test helper at line 23:
  `Do not assign to the variable module` (`@next/next/no-assign-module-variable`).
  Renamed that local helper to `evaluatedModule`; production source was untouched.
  This was a tester-authored harness issue corrected in this task.
- Final `npm run lint` (`eslint .`) exited 0 with no lint diagnostics.
  npm printed an informational update notice; no update was performed.
- Additional whitespace inspection used `git diff --no-index --check /dev/null`
  for each new tester artifact: no whitespace diagnostics; exit 1 denotes the
  new-file differences, not a passing application test.

## Acceptance and regression evidence

| Requirements / designed cases | Observed result |
| --- | --- |
| Requirements AC1; UH-001 | Shared default, real provider, and normal client return exactly `Process your customer signals into clearer next moves`. Static homepage output contains exactly one h1 with that complete text and no old statement. Passed non-browser checks. |
| Requirements AC2; UH-004 / UH-005 | Missing, empty, whitespace-only, null and numeric titles resolve to the replacement. Throwing provider, null data and undefined envelope return the shared fallback object. Valid supplied titles retain existing behavior. Passed. |
| Requirements AC3; UH-006 | Rendered hero retains `aria-labelledby="hero-title"`, `h1#hero-title`, and primary/secondary actions. Content deep comparison against HEAD differs only by title; page, client and global styles match HEAD byte for byte. Passed non-browser checks. Browser interaction not run. |
| Requirements AC4; UH-007 | Both desktop/mobile assertions require the full exact level-1 heading. Test-source comparison confirms no other assertion changes and preserves 390 × 844 viewport. Passed source checks. Desktop/mobile visibility, wrapping, clipping, and overflow (UH-002 / UH-003) remain pending. |
| Requirements AC5; UH-008 | Diff review and recorded commands performed. Browser status explicitly pending. See executed results and limits. |

The test design uses the plan's four AC identifiers; this table explicitly uses
the requirements document's five identifiers to avoid confusing their numbering.

## Limits and operational traceability

Tester outcome: succeeded for the authorized non-browser verification; no open
defects or blockers. No application defect was observed in the executed checks. Browser acceptance is
not certified: UH-002, UH-003 and the browser portion of UH-006 were not run under
the explicit execution prohibition. No Playwright command, e2e test, build,
browser launch, temporary server, dependency installation or background launch
was performed. No deployment, publishing, external contact, Git branch/worktree
change, commit, push, or PR was performed. Existing application edits and factory
artifacts were preserved.

The legacy browser suite remains outside the configured default discovery root
(`__ai_factory__/tests/functional` versus `.ai_factory/tests/functional`) and has
a pre-existing `Request demo` assertion while the current header renders `Sign in`.
These were documented before implementation and explicitly excluded from repair
by the approved requirements. They are future execution limits, not an observed
browser failure or a new headline defect. No browser-suite pass is claimed.

The snapshot's historical `gpt-5.5` setting is superseded by the recorded owner
decision approving `gpt-6.1-sol`, retained by `restore-workspace-access` and
`restore-git-availability`. Historical documents and snapshot were preserved.
