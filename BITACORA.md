# Work log

## 2026-10-07 — Independent platform migration (TWM)

Objective: Move the existing digest platform to independently owned infrastructure.

Changes: TWM-1 moved local live feed and prompt URLs to
`lacrimae0rerum/the-watcher/main` and recorded 36/36 full tests passing.
TWM-2 updated platform-facing names, instructions, metadata, and provenance.

Decisions: The owner selected `the-watcher` and confirmed author permission.
Keep AI Builders Digest as the initial theme and retain inherited Git history.
No upstream license was declared; NOTICE.md is not a license.

Verification: TWM-1 evidence is in `odd/tasks/the-watcher-migration.md`.
TWM-2 passed 36/36 tests, three script syntax checks, package/lock JSON identity,
structural readback, and scoped diff check.

Blockers: The standalone public repository is not published yet.
`X_BEARER_TOKEN` and `POD2TXT_API_KEY` in the new repository are unknown.

Pending: Parent-owned TWM-3 publication, hosted endpoint checks, and credential setup.
Next step: Perform TWM-3 publication safety checks, then publish and verify hosted assets.
