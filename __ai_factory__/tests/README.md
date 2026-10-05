# Tests

Browser functional tests use Playwright by default. Follow technology-native conventions for other test types.

The Playwright configuration uses installed Chrome on Windows and starts its own production application server at http://127.0.0.1:3187. It must not reuse the control-plane server on port 3000.

`npm run test:e2e -- --list` only discovers tests; it does not build the application or start a browser. Actual `npm run test:e2e` execution builds the application as part of Playwright's managed server startup, then runs `next start`. The development server uses `.next`; production builds and `next start` use `.next-production`, preventing a running development server from overwriting the production build. Neither output folder contains source files.

Browser launch was verified within the Codex Windows sandbox. Full execution subsequently timed out while creating a page; this is not a passing test result.

An explicitly approved local check can run with `node .ai_factory/tests/run-browser-check.cjs`. This runs the project tests and temporary server with a three-minute limit, writing results to `.ai_factory/tests/reports/local-browser-check.json`. Running this outside the coding-agent sandbox requires the project owner's approval. Do not use it as an automatic fallback around sandbox failures or claim tests passed without a successful report.

The owner has now approved the control-plane built-in local runner for run `e24f1813-1cc3-4f3a-abf2-b0c7497699ef`. For this run, agents must not execute Playwright or the helper script inside their sandbox. The controller performs browser verification after successful implementation/test steps. Its reports are in `.ai_factory/tests/reports/local-runner/`, with task and attempt identity and a four-minute outer time limit. A real check passed on 2026-09-12 with one test, exit 0, and no skipped or flaky tests. Each subsequent testable step requires a fresh controller result; do not reuse this pass as evidence for changed code.
