# Project Taxonomy

- Version: 1.0
- Previous version: none

## Documentation

All AI Factory artifacts live under .ai_factory/.
Use .ai_factory/docs/project-brief.md for evolving purpose, scope, technology, integrations and source layout.
Use .ai_factory/docs/architecture/, .ai_factory/docs/requirements/, .ai_factory/docs/design/, .ai_factory/docs/decisions/, .ai_factory/docs/security/, and .ai_factory/docs/operations/ as appropriate.
For large projects use requirements/modules/<module>/ and design/modules/<module>/; put cross-cutting work under shared/.

## Delivery

Use .ai_factory/delivery/intakes/, .ai_factory/delivery/planning/, .ai_factory/delivery/processes/, .ai_factory/delivery/agents/, .ai_factory/delivery/actions/, .ai_factory/delivery/runs/, .ai_factory/delivery/reviews/, and .ai_factory/delivery/releases/.
Run-specific evidence belongs under .ai_factory/delivery/runs/<run-id>/; iteration and task identifiers must remain traceable.
PostgreSQL owns live execution state. Files under .ai_factory/delivery/runs/ are reviewable exports, not recovery checkpoints.

## Tests and source

Use .ai_factory/tests/functional/ for Playwright browser tests by default, and .ai_factory/tests/reports/ for evidence.
Use .ai_factory/tests/unit/, .ai_factory/tests/integration/, and .ai_factory/tests/fixtures/ where the technology allows it.
Native conventions take precedence for source and co-located tests (for example src/test/ in Java).
Add or update tests during feature and defect-remediation iterations. Keep module identifiers consistent across requirements, design and tests.

## Versioning

Increment the human-readable version for changes. Use a minor increment for compatible additions and a major increment for restructuring.
Process runs keep an immutable copy of the taxonomy version used at their start.
