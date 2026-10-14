# Work log

## 2026-10-14 — Local NaN attribution preview

Objective: Add a smaller "Powered by NaN.builders" link to the right of the header brand block, using the user's supplied logo. The user reviewed the local version and then authorized publication: "funciona. publicala".

Changes: Added the linked credit, preserved the supplied PNG byte for byte as `web/nan-builders.png`, and kept the existing wordmark, counts and controls. The link opens `https://nan.builders/` with `noopener noreferrer`. On narrow screens the credit stacks below the brand. A scoped alignment adjustment prevents the wordmark's click area from stretching across the controls.

Verification: The missing-link regression failed before implementation, then passed. The full suite passed 150/150; the focused test and whitespace check passed again after the final CSS adjustment. At 1665 × 949, Orca confirmed the credit is to the right, its text is 10px versus the 24px wordmark, the 100 × 22 logo loads, and the credit does not overlap the controls. The desktop screenshot was inspected. The initial 320px probe exposed the stretched click area; after its correction, the responsive recheck could not finish because Orca closed the connection (`runtime_unavailable`, job 13 exit 1). No retry or application restart was attempted. The final reload and accessibility snapshot did succeed before disconnection.

Delivery: The user confirmed the local result and explicitly authorized publication. Commit `06c2f3a4021e44a5a89ec06f9061b842017e0147` was pushed and deployed successfully in [run 38622949919](https://github.com/lacrimae0rerum/the-watcher/actions/runs/38622949919). X/NaN generation was skipped. Public `nan-builders.png` and `styles.css` returned HTTP 200 and matched the local files byte for byte (12,386 and 15,251 bytes respectively). The homepage HTTP check returned 403 with `cf-mitigated: challenge`, so the combined public check exited 1 and byte-identical HTML was not verified. No security setting was changed and no request was retried. The automated mobile recheck also remains unavailable; no completed mobile geometry proof is claimed. Publication is complete, while a human browser check of the public header remains outstanding.

## 2026-10-14 — First complete live Cybersecurity cycle

Objective: Run exactly one real publication after the user said "pruebalo". The user was told that X/NaN APIs would be used and a saved edition would restart the three-calendar-day cadence. No workflow retry, Telegram delivery or X Article publication was requested.

Execution: [Run 38619256699](https://github.com/lacrimae0rerum/the-watcher/actions/runs/38619256699), a single `workflow_dispatch` with `publish=now`, succeeded from `9535d1c`. X collection, NaN generation, the publication gate, edition persistence, Git commit/push through the new credential helper, and the separate read-only deployment job all passed. The generated edition is commit `9f1ace91abf1bbcf01cbf766dfef2bf6ceaabacd`.

Verification: The clean local checkout fast-forwarded to that edition. It contains 12 items in Spanish, generated at `2026-10-14T18:56:21.209Z`, with no marked operator sections. Saved-record SHA-256: `43ee32cfc198eca0276c2f03df320ef252b4a4bfd32e8d8acc5696988e41316e`. The public `/data/editions.js` returned HTTP 200 without a challenge and matched a fresh local export byte for byte (24,752 bytes; SHA-256 `7255f4ee92357e5454c3ac3b4a4cee2fa2a15d0d01a7c8b713049570bf6e6080`). Jobs 8 and 9 exited 0.

Limits: This verifies the integrated live path and its published result, not every claim's factual accuracy, complete coverage of all sources, destination safety, or a cron-triggered run. No full editorial audit or new model request was performed after generation. Next scheduled edition is due on 17 October 2026 at 12:00 Europe/Madrid. Earlier 16 October due dates in this log are historical and superseded by this successful manual edition.

## 2026-10-14 — Publication security corrections (B-04–B-06)

Objective: Apply the three prioritized corrections from the Claude Code Opus audit after the user said "Corrige": keep operator-only text out of public edition records, validate link provenance, and isolate deployment from repository-write credentials. The user subsequently authorized commit, push and web deployment with "autorizado". No history rewrite, live generation call, or disabling of the legacy AI Builders workflow is included.

Changes: The publication CLI removes marked operator sections/items before saving. Cybersecurity publication requires a nonempty local X feed; source fields must use collected post URLs and auxiliary links must already appear as HTTPS URLs in the collected text. The deployment runs in a separate `contents: read` job at the exact prepared revision. Neither checkout persists credentials, and only the commit step receives Git authentication through an environment-only helper. README and CLI help describe the new boundary.

Verification: Each correction had an observed RED before implementation. Publication/export checks pass 28/28; workflow checks pass 8/8. Refused CLI cases assert exact exit/stdout/stderr and unchanged saved edition, public web data and, where applicable, feed evidence. The full suite passes 149/149. Independent verification passed all four checks (operator privacy, evidence links, job isolation and documentation), repeated 149/149, and passed syntax/whitespace checks. `actionlint` is unavailable. Local workflow checks were static; the authorized deployment subsequently passed in production. Generation, publication validation and the workflow's Git-write authentication were skipped by the push event and remain unverified in a live generation cycle.

Limits: Provenance does not guarantee factual accuracy or destination safety; source text may contain harmful links. No redirects are fetched. Existing saved editions/history, manually reviewed saves, other packages, Telegram/X Article and the legacy workflow are unchanged. Wrangler still resolves its dependency tree at deployment, but outside the repository-write job. Local correction and verification are complete.

Delivery: Commit `ce8209455306a0a5b4aef7e951017e115bdb71c5` was pushed to main. [Run 38615103629](https://github.com/lacrimae0rerum/the-watcher/actions/runs/38615103629) succeeded with separate `publish` and `deploy` jobs. X collection, NaN generation, edition checking/saving and the edition commit were skipped; no new edition was generated. The public `/app.js` returned HTTP 200 and matched the checkout byte for byte (45,554 bytes; SHA-256 `f6ee1a5a2e54e394019fb0a88795a1f72b3f313970df5041c943c9d23743eef9`). That unchanged asset confirms availability, not execution of the new publication gate. Next step: observe the next scheduled generation cycle; no manual paid run was requested.

## 2026-10-14 — Local Digest node shape trial

Objective: Preview slightly larger Digest nodes, alternating hexagons, squares and octagons, in the existing local Orca browser before any production approval. The user will supply separate logo concepts for light adaptation; those concepts have not arrived.

Changes: The first trial increased the Digest base radius from 22 to 25.3 (+15%) and assigned 6/4/8-sided outlines in clockwise ring order. The user then requested nodes 60% larger; the current radius is 40.48 (25.3 × 1.6). A further request enlarges the central Watchers chip square and eye by 50%: square half-size is 0.42 of the core radius instead of 0.28, its corner radius scales equally, and all eye geometry scales by 1.5. The outer core octagon, node colors, source/edition nodes and Digest interior symbol types remain unchanged. Live outline pulses follow each Digest shape. After reviewing the local iteration, the user explicitly authorized release: "commit y push a produccion".

Verification: A temporary Canvas-output probe in ignored `.wrangler/digest-shapes-check.js` observed RED before the edit: all seven Digest outlines had six sides and base radius 22. For the first variant, JavaScript syntax, whitespace and the 145-test suite passed. Orca reloaded the local page, but the Canvas probe timed out after 30 seconds; its screenshot step did not execute and was not retried. For the user's new size requests, syntax, whitespace and the 145-test suite passed again. The new local reload, accessibility snapshot and screenshot succeeded (job-22, exit 0). Visual inspection of the captured page confirmed the larger Digest contours, enlarged central square/eye, intact outer octagon, readable labels and no clipped nodes at the current desktop viewport. No Canvas-frame probe was retried; exact automated geometry GREEN and a new interaction sweep were not performed. The user's subsequent commit/push request authorizes publication of this local iteration.

Delivery: The user confirmed: "Esta todo correcto. Publica". Independent review confirmed the requested geometry values, scope, syntax and 145 passing tests. The earlier auxiliary geometry probe was incorrectly treated as a release requirement; it belongs to the superseded size variant and is not evidence of a geometry defect. Release used source checks, the inspected screenshot and explicit human approval; no automated geometry GREEN is claimed. Commit `3185ef3` was pushed to main and deployed successfully in [run 38601802737](https://github.com/lacrimae0rerum/the-watcher/actions/runs/38601802737). The public `/app.js` returned HTTP 200 and matched that commit byte for byte (45,554 bytes; SHA-256 `f6ee1a5a2e54e394019fb0a88795a1f72b3f313970df5041c943c9d23743eef9`). X collection and NaN generation were skipped. Production now serves the approved visual changes. Preserve the original concepts when the user supplies Digest logo ideas; no new logo design is included in this release.

## 2026-10-14 — Social link preview (B-03)

Objective: Add and publish a share thumbnail after the user reported an empty link preview and approved a branded card.

Changes: Added static `web/social-preview.svg` and a 1200 × 630 PNG using the existing eye-chip, dark palette and watcher colors. The initial HTML now declares absolute Open Graph image/canonical URLs, image dimensions/type/alt text, and X large-image card metadata. Existing title, description, styles and scripts remain unchanged. No new dependency or Cloudflare configuration change.

Verification: RED 1/2 on missing metadata; GREEN 2/2 focused and full suite 145/145. PNG is 216,678 bytes and passed visual inspection without clipped text. Metadata and PNG checks are in `scripts/social-preview.test.mjs`. Independent verification passed; privacy patterns, PNG ancillary-metadata and whitespace checks passed. After deployment, the public PNG returned HTTP 200 with image/png and matched the local file byte for byte. The browser confirmed the deployed OG/X metadata and decoded the 1200 × 630 image.

Delivery: Commit `29daaf7` was pushed to main and deployed by successful [run 38569248724](https://github.com/lacrimae0rerum/the-watcher/actions/runs/38569248724). X collection and NaN generation were skipped. Existing Node action-runtime and Ubuntu runner-transition advisories did not block deployment.

Remaining gate: The direct HTTP page check failed with 403 and `cf-mitigated: challenge`; a browser still loads it. This may prevent preview crawlers from reading the metadata, but no specific sharing provider has been tested. B-03 remains blocked on the user's target sharing application and provider-level verification; its missing-image implementation is complete. No Cloudflare security rule changed. Next step: Ask which application shows the missing preview, then distinguish its cache from crawler access before proposing any narrowly scoped security change.

## 2026-10-14 — First scheduled-publication deployment (APB-5)

Objective: Merge the scheduled-publication branch, push main, and verify the first Cloudflare deployment after the operator stored the four publication secrets and explicitly approved release.

Changes: Merged APB-3/APB-4 locally in `a9599bd`. Fixed B-02: the human preview CLI test now uses isolated missing/saved edition fixtures instead of assuming that the checkout has no edition. Production behavior is unchanged.

Verification: Publication-focused tests passed 22/22. Initial full suite failed 142/143 on the stale preview assumption; after the fixture correction, focused tests passed 7/7 and the full suite passed 143/143. Independent integration verification found no pre-deployment blockers. Bash syntax and whitespace checks passed. GitHub metadata confirmed all four secret names and an environment branch policy allowing only main. Pre-deployment DNS A/AAAA queries returned no answers; secret values were not read.

Delivery: `02ccdf2` was pushed to main. GitHub Actions run [38563293486](https://github.com/lacrimae0rerum/the-watcher/actions/runs/38563293486) succeeded; export and Cloudflare deployment passed, while X collection and NaN generation were skipped. The HTTPS browser showed the saved 13 October edition. A DOM interaction check opened an article, verified its source link, and returned to the seven-item summary; the browser console returned no messages. APB-5 setup/deployment/site-check is done; scheduled generation is not yet verified.

Limits: The direct HTTP check failed with a Cloudflare managed challenge (403), so byte-identical asset checks were not completed. An Orca reference-click closed the reader; that automation check is inconclusive, although DOM interaction passed. No security rule was changed. GitHub reported Node 20 action-runtime deprecation and an upcoming Ubuntu 26 runner migration. No manual paid edition ran. Next step: Observe the scheduled cycle due on 16 October 2026 at 12:00 Europe/Madrid, or obtain separate approval for an immediate paid edition. See `odd/tasks/automatic-publication.md`, L13–L14.

## 2026-10-12 — Local X Article and delivery receipt (CSP-3A)

Objective: Add explicit single-channel X Article delivery and durable observed-success suppression without generating or saving an edition.

Changes: Added a DraftJS text adapter with injected transport and runtime user-auth token; it drafts then publishes against the confirmed X endpoints. Added a package-scoped ignored receipt keyed by canonical package ID and exact text; corruption fails closed, and successful publication with failed receipt reports uncertainty for manual reconciliation. Cybersecurity config accepts `x-article` and an explicit title. Telegram/email and stdout remain unchanged.

Verification: Focused vertical RED on missing public adapter and missing delivery-state module; later RED exposed missing uncertain-outcome reporting after a failed publish response. GREEN: 9/9 focused tests with fake transport and in-memory filesystem. Syntax and whitespace checks are recorded in the writer handoff; full suite and independent review remain for the parent.

Limits: No credentials, network request, real edition save, external publication, or schedule was used. Local receipts cannot guarantee exactly-once external delivery or prevent concurrent attempts. Next step: Parent full-suite verification and review, then separate human authorization before CSP-3B.

## 2026-10-12 — Manual NaN edition generation (ADG-3)

Objective: Add an explicit model-generation command without coupling it to saving or publication.

Changes: Added a provider-specific NaN `deepseek-v4-flash` CLI that reuses the local preparation packet, accepts a process-only key, sends one non-streaming request with a ten-minute timeout, validates non-empty output, and prints only digest text. Bounded provider type/code fields exclude secret or packet substrings; transport and invalid-response errors omit raw details. Documented the separate explicit save step and adjusted F-08/CSP-3 to reflect local implementation only.

Verification: Initial test-first RED failed 6/7 because the generation module was absent. Later focused failures exposed an unknown-package CLI message, a provider field that echoed the injected test key, and strict key-fragment leakage; each was fixed through RED/GREEN cycles. Final focused GREEN passed 8/8; full `node --test` passed 95/95; syntax and scoped whitespace checks passed. The unset-key CLI exited 1 with `NAN_API_KEY is required` and no stdout. Request tests use fake transport. Separately, exactly one live NaN `deepseek-v4-flash` call for `ai-builders-digest` succeeded. Its credential-free summary reports 8,929 bytes, 47 lines, 18 source URLs, and a canonical timestamp; the active checkout remained unchanged. Digest text, the key, and the hash value were not saved or exposed.

Limits: The model may omit links or invent claims. The live response does not establish digest quality or Cybersecurity generation. No edition save, delivery, publication, retry, X recollection, push, or schedule occurred. Next step: Parent review of the uncommitted ADG-3 work; inspect source links and claims before separately authorizing persistence or delivery.

## 2026-10-08 — Offline local preparation packet (LAG-1)

Objective: Prepare an existing model-ready envelope from selected package-local evidence without network, model, or file writes.

Changes: Added a read-only local CLI using the shared package selector, loader, artifact paths, core preparation, and envelope. AI Builders reads root snapshots; Cybersecurity reads its isolated feed directory. Local config defaults and prompt override precedence are preserved without hosted prompts. Missing or invalid feeds report errors beside usable content; zero usable content fails with JSON stderr and empty stdout. Documented this boundary and updated F-08/requirements/roadmap wording without claiming generation or delivery.

Verification: The first focused RED failed because the CLI module was absent. A second RED (6/7 passing) exposed an unreadable-config error that escaped the envelope; the focused GREEN passed 7/7 after the fix. Focused integration tests passed 41/41. Independent verification passed 7/7 focused and 87/87 full tests, both syntax checks, whitespace checks, and both real package scenarios without changing repository state. Native review `review-14f76e5daeb9e61b` approved and its exact acknowledgement burned authority. A bounded terminal-agent trial consumed the AI Builders packet, produced four source-linked preview items without saving, omitted unsupported podcast claims, and repeated the safe Cybersecurity failure. Work-unit commit: `62ab75b3aef61d183a46b153e1f7c60d068d0a02` (`feat(digest): add offline agent handoff`).

Limits: Cybersecurity has no local feeds, so its real CLI returns an error. Existing snapshots do not prove freshness or source accuracy. The terminal agent must inspect evidence and produce any text outside this command; saving remains an explicit separate action. Next step: Collect real Cybersecurity evidence under separate authorization; external model APIs, delivery, scheduling, and publication remain deferred.

## 2026-10-08 — Offline terminal evidence preview (CSP-2B)

Objective: Report local evidence for either package without creating an edition or contacting a provider.

Changes: Added a pure preview seam and read-only terminal command. It validates the local catalog, reads package-isolated feed files and latest saved-edition state, reports missing/invalid evidence, and omits saved text. Documented the terminal-only boundary and updated F-07/F-08 and the CSP-2 local milestone. No API, generation, delivery, or publication was added.

Verification: Public-seam RED failed on missing export; later feed-read and invalid-edition tests failed before their fixes. GREEN: 7/7 preview, 30/30 runtime, 80/80 full tests; both syntax checks and `git diff --check` passed. Independent read-only verification repeated 7/7 and 80/80, syntax and whitespace checks, and both canonical terminal previews without changing repository state. Terminal JSON showed AI Builders source counts 26/6/2 and available feeds with counts 14/1/1, including one podcast error; Cybersecurity counted 40/0/0 with all feeds missing. Both latest editions were missing. Native review `review-66e8f0fc6377d74d` approved the frozen candidate and its exact acknowledgement burned authority. Work-unit commit: `63d3c9128cccc37c73a72f94d3be37940089883b` (`feat(preview): add offline digest evidence command`).

Limits: Snapshot timestamps are not freshness guarantees. CLI tests inspect checked-in local state; no live collection or filesystem write was performed by the preview. CSP-3 generation/delivery and CSP-4 activation remain open. Next step: Separately authorize collection/workflow checks before claiming F-07 complete.

## 2026-10-08 — Source catalog validation (CSP-2A)

Objective: Fail closed on local source catalogs before the feed generator collects either package.

Changes: Added the public `loadSourceCatalog(catalogUrl)` seam, offline JSON fixtures and tests, and generator wiring. Updated source-management instructions. The loader preserves both current catalogs, accepts empty arrays, and rejects malformed JSON, entries, handles, URLs, identities, and blog targets the collector cannot scrape.

Verification: Focused RED first failed on a missing export; later RED runs failed on malformed JSON, shape, entry fields, handles, URLs, duplicate identities, and unsupported blogs before their respective implementation. Focused GREEN passed 30/30; full `node --test` passed 73/73; both script syntax checks and `git diff --check` passed.

Limits: Tests use local catalogs and deterministic repository fixtures. They do not contact remote sources, prove live collection, or verify generator behavior with credentials. CSP-2B preview, generation, delivery, scheduling, and publication remain separate. Next step: Parent review of CSP-2A, then CSP-2B.

## 2026-10-08 — Cybersecurity assembly readability (CP-1 follow-up)

Objective: Make the existing cybersecurity assembly prompt easier to scan without
changing its urgency/action grouping or source-evidence boundary.

Changes: Reorganized the intro into short sections with a Spanish item skeleton,
raw X/blog/podcast source rules, and explicit direct-link and handle presentation.
Added one scoped contract test; retained the existing CP-1 and editorial rules.

Verification: The new test failed before the prompt edit (15/16 focused passed).
After the edit, focused tests passed 16/16 and the full Node suite passed 63/63.
These tests check prompt text, not model output.

Pending: User or hosted prompts may override this local file. Model behavior and
publication remain unverified. Next step: Hand this bounded correction to the
parent for review; no runtime or distribution change was made.

## 2026-10-08 — Cybersecurity prompt precision (CP-1)

Objective: Make the local Spanish bulletin guidance more precise without changing runtime or publication.

Changes: Updated the five bundled cybersecurity prompts and fictional sample for ordered action sections, raw feed fields, source dates, attribution, bounded per-issue lengths, deduplication, and missing-content status. Added three focused presence/sample checks and updated F-13 and the scoped product contract.

Verification: The focused test first failed 3/15 before prompt edits and passed 15/15 afterward. Full `node --test` passed 62/62; `git diff --check` passed. Tests check text contracts, not model behavior; the fictional sample was inspected manually.

Pending: User and hosted prompts can override local copies. Model generation, real feed validation, and publication remain separate. Next step: Hand CP-1 changes and observed verification to the parent for review.

## 2026-10-08 — Common editorial exclusions (EE-1)

Objective: Apply the approved editorial baseline to the two implemented themes.

Changes: Added the same English exclusion and substantive-announcement guidance to
all eight bundled editorial prompts. Podcast prompts exempt otherwise substantive
episodes with ad breaks. Kept existing language, output, security, and evidence
rules. Added eight individually named prompt-presence tests and updated product
records for the baseline required of future themes.

Decisions: Exclusions do not depend on keyword catalogs. Local bundled prompt
instructions cannot override user or hosted prompts or guarantee model compliance.
No runtime filter, generation, publication, or future package was added.

Verification: The focused test run failed 8/23 before the prompt edits and passed
23/23 afterward. The full `node --test` suite passed 59/59 and `git diff --check`
passed. Tests verify prompt text, not model selection behavior.

Pending: Independent review and any later prompt distribution remain separate.
Next step: Hand local prompt and test evidence to the parent for review.

## 2026-10-08 — Static thematic keyword catalogs (KW-1)

Objective: Supply editable keyword groups without activating runtime matching.

Changes: Added `config/keywords.yaml` to AI Builders and Cybersecurity with 15 empty
lists and commented editing instructions. Updated structural tests, the current
13-file thematic asset contract, README, PRD, and F-11. Preserved the design's
historical 12-file checked evidence and recorded a dated amendment.

Decisions: Comments are inactive examples, not approved keywords. Future matching
may prioritize or tag, never exclude unmatched items. No parser, weights,
discovery export, runtime matching, or collection behavior was added.

Verification: Focused tests first failed 2/15 (missing AI Builders asset and
cybersecurity count 12 instead of 13); after adding assets, they passed 15/15.
The full `node --test` suite passed 51/51; `git diff --check` passed. Tests
check structure, not full YAML parsing.

Pending: Runtime parsing and matching require a separate authorized work unit.
Next step: Hand the static change to the parent for review and task closure.

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
