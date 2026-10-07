# On-demand saved cybersecurity edition

## Goal
Any agent with access to this checkout can show the latest saved cybersecurity pulse on user request, without generating, collecting, or republishing content.

## Scope
- Add a small filesystem edition store, an explicit local save CLI, and a separate read-only latest-edition CLI.
- Use `editions/<canonical-package-id>/latest.json` under the checkout. Keep local editions out of Git with `editions/.gitignore`; do not modify the unrelated root `.gitignore`.
- Store the exact nonempty edition text, package identity, language, and generation time. Validate metadata and read errors; reject traversal and cross-package payloads.
- Atomic save with a temporary sibling file and rename; readers see complete editions. A failed save must preserve the preceding edition.
- Read CLI displays exact text; optional JSON includes metadata. Missing editions are explicit, never generated. Corrupt editions fail rather than masquerading as missing.
- Default read command targets cybersecurity-digest explicitly; document package argument. No network, AI requests, source fetching, Telegram/X publication, scheduling or credentials.
- Add agent instructions and accurate README/product records. Reading never invokes the save CLI.
- Other clones and remote agents need access to the edition files; do not claim automatic cross-machine synchronization.
- Source collection, NaN generation, per-edition archive/history and future automatic save integration remain separate work units.
- Preserve AI Builders behavior, generated feeds, approved source catalog, `.gitignore` and `.codegraph/`.

## Delivery
Branch `feat/cybersecurity-edition-read`, base `ee495edc3845a754829c37697e1d85af4eb2d770`. Local work-unit commit only; no push or generated edition committed. Forecast 300–450 diff lines with tests and instructions; preserve readable cohesive behavior.

## Tasks
- [x] **CER-1 — Persist and read a saved edition on demand**
  - Status: done.
  - Route: delegated writer (store, CLIs, tests and instructions span multiple files).
  - Strict TDD: missing store/read interface RED, GREEN exact roundtrip, invalid/empty/missing/corrupt/isolation and CLI read-only cases.
  - Acceptance: exact text survives save/read; latest replace atomic; missing read creates nothing; traversal/cross-theme/corrupt metadata rejected; read never regenerates or republishes; instructions route retrieval before existing onboarding/generation.
  - Checks: focused Node tests, full `node --test`, syntax and diff checks, offline CLI fixtures; independent verifier under native risk plan.

## Evidence
- 2026-10-07: No durable edition persistence currently exists. Existing delivery accepts text only. Package ID validation is available in package-runtime; do not duplicate it unnecessarily.
- 2026-10-07: User explicitly selected on-demand chat retrieval, not scheduled chat delivery, and authorized implementation.

- 2026-10-07: Observed RED was ERR_MODULE_NOT_FOUND before the store existed. GREEN: six focused tests and 50 repository-root tests passed; three syntax checks and scoped whitespace/readback checks passed.
- 2026-10-07: Independent verification passed validation, byte-exact readback, isolation, CLI argument rejection, missing/corrupt distinction, atomic replacement, and early agent routing. A verifier initially ran the suite in scripts/ (30 tests); a separate repository-root rerun confirmed 50/50 and corrected that report.
- 2026-10-07: Actual read command returned exit 1 with `No saved edition for cybersecurity-digest` and created no directory or edition. No real bulletin was invented. No network, credentials, model calls, collection, or publication occurred.
- 2026-10-07: Store assumes a trusted local checkout (no hostile preplanted directory symlinks); no cross-machine synchronization or edition history. Filesystem rename-failure injection and external integrations were not tested. Existing user `.gitignore` and `.codegraph/` remain untouched.

- 2026-10-07: Work-unit commit `274345b155b79c87e991c3be96b1aa9bdd2c4a23` (`feat(cybersecurity): retrieve saved editions on demand`), 371 insertions and 2 deletions across 12 files. No push occurred.
- 2026-10-07: Native committed-range review could not start due to retained intended-untracked candidate mismatch; no authority mutation occurred. Native unavailable-review fallback required writer and independent checks, both completed. No review mode or recovery authority was changed.

## Next step
Read an existing saved edition on demand. Future CSP-3 generation must call the save contract after completing a valid edition; this unit does not create a real bulletin or activate publication.
