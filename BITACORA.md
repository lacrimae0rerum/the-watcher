# Work log

## 2026-10-07 — The Watcher README (TWR-1)

Objective: Document the current platform and its initial AI Builders theme accurately.

Changes: Rewrote `README.md` around the agent-owned summarization boundary, manual commands, delivery prerequisites, collection operator setup, and current limits. Removed `README.zh-CN.md`.

Verification: Writer and independent verifier observed 36/36 passing tests. Scoped `git diff --check` and structural checks passed: the Chinese file is absent and no active inbound Markdown link remains. README readback found 10 valid local links, no prohibited names or change narrative, and no language link.

Pending: Publication remains a separate decision. Local work-unit evidence is recorded in `odd/tasks/the-watcher-readme.md`; no remote publication occurred.

## 2026-10-07 — Independent platform migration (TWM)

Objective: Move the existing digest platform to independently owned infrastructure.

Changes: TWM-1 moved local live feed and prompt URLs to
`lacrimae0rerum/the-watcher/main` and recorded 36/36 full tests passing.
TWM-2 updated platform-facing names, instructions, metadata, and provenance.
TWM-3 published the standalone public non-fork `lacrimae0rerum/the-watcher` with
origin matching it, default `main`, and initial `main` SHA
`f4b3d6ba9330f50a4bf8e1f5e3b3b7741fb96736`.

Decisions: The owner selected `the-watcher` and confirmed author permission.
Keep AI Builders Digest as the initial theme and retain inherited Git history.
No upstream license was declared; NOTICE.md is not a license.
The Orca workspace display name is now `the-watcher`; its physical checkout did not
move. Orca retains the original stored projectId, which the documented CLI cannot
rebind in place. No history rewrite, fork relationship, or original-repository mutation occurred.

Verification: TWM-1 evidence is in `odd/tasks/the-watcher-migration.md`.
TWM-2 passed 36/36 tests, three script syntax checks, package/lock JSON identity,
structural readback, and scoped diff check.
TWM-3 read-only verification observed HTTP 200 and valid, byte-identical local
content for all three feeds and five prompts; 36/36 Node tests, five JavaScript
syntax checks, and committed-range diff check passed. Heuristic pattern/entropy
scans found zero known credential matches in tracked content and 324 reachable
commits; they cannot prove all secrets absent. Native review was unavailable due
to a retained-selection mismatch; independent verification passed.

Blockers: The new repository secret list is empty: `X_BEARER_TOKEN` and
`POD2TXT_API_KEY` are not set. No collection, delivery, or workflow dispatch occurred.

Pending: Operational collection setup and successful run; no active schedule is verified.
Next step: Configure both credentials, then perform a successful operator-approved collection run.
