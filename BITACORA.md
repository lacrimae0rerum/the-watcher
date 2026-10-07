# Work log

## 2026-10-07 — On-demand saved cybersecurity edition (CER-1)

Objective: Let an agent with this checkout read the latest explicitly saved pulse in chat.

Changes: Added a local latest-only edition store, explicit save CLI, read-only CLI,
ignored generated editions, offline tests, and an early agent retrieval route. The
reader prints saved text unchanged; missing or corrupt editions fail without a
collection or generation fallback. No real edition was saved.

Decisions: The bulletin CLIs require `--package`; save defaults to `es` and the
current UTC time. A separate checkout must receive the saved file separately.
This retrieval path does not activate a schedule or change CSP-3 generation and
publication plans.

Verification: The first focused run failed with `ERR_MODULE_NOT_FOUND` before
implementation. After implementation, focused tests passed 6/6 and the full Node
suite passed 50/50. The three new script syntax checks passed. Offline CLI tests
used temporary checkout fixtures outside the repository.

Pending: A real edition must be supplied and explicitly saved. Source collection,
generation, automatic save integration, publication, and scheduling remain separate.
Next step: Review CER-1; integrate saving only when the future generator is verified.

## 2026-10-07 — Cybersecurity package foundation (CSP-1)

Objective: Add the approved cybersecurity theme locally without activating collection or publication.

Changes: Added the validated thematic package, 40 exact approved X handles, empty
podcasts/blogs, Spanish defensive editorial prompts and fictional sample. Moved
unchanged provider normalization to `digest-core` and kept the AI Builders public
collector export. Added scoped cybersecurity catalog editing instructions and
updated product records for the approved pilot.

Decisions: The X catalog `name` repeats the approved handle as a technical label,
not a verified display name. Intended package-owned URLs are not published feeds.
The requested three-day noon Madrid cadence and Telegram + X Article delivery
remain product requirements, not runtime capabilities.

Verification: Observed the initial focused RED (`Unknown package: cybersecurity-digest`),
then 7/7 focused and 43/43 full Node tests passing with mocked offline preparation.
Both thematic collector paths preserve normalization. Three package JSON files parsed,
three syntax checks and `git diff --check` passed. No external calls were made.

Independent review confirmed the initial 40 handles. The correction leaves the catalog
unchanged and tests its generic structure, valid unique X handles, and string names
without pinning current membership or empty future podcast/blog arrays. A one-time
read-only comparison against the approved tracker confirmed all 40 handles in order.
The new digest-core manifest test first failed (7/8 focused); adding `collection.js`
to its shipped files made 8/8 focused and 44/44 full Node tests pass. The shared
collector export is unchanged. README remains scoped to the initial AI Builders theme;
this package correction does not change that documentation scope.

Blockers: Live source collection, NaN generation, dual-channel publication, and
true three-calendar-day scheduling are not implemented. No first date, destination,
or credentials are configured. Existing preparation defaults to English without
explicit user config; schema defaults are documentation, not runtime defaults.

Pending: CSP-2 validates collection and source edits; CSP-3 implements verified
generation and delivery; CSP-4 schedules only after explicit activation. Next
step: Hand off the locally verified CSP-1 diff for independent review.

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
