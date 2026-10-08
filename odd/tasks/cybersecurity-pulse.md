# Cybersecurity pulse

## Objective and approved requirements
Build a broad defensive cybersecurity bulletin in Spanish, every three calendar days at 12:00 Europe/Madrid, with automatic Telegram and X Article publication and NaN `deepseek-v4-flash` drafting. First publication date and credentials remain unset; no external publication or paid collection is part of this local work unit.

Sources support X accounts, blogs, and podcasts. Users can edit the canonical package catalog or ask the agent to edit the same file. Named blogs/podcasts are deferred. The user confirms the 40 supplied X accounts exist; do not independently reselect or replace them.

Approved handles (preserve spelling): INCIBE, osiseguridad, incibe_cert, IncibeEmprende, CCNCERT, AEPD_es, guardiacivil, policia, chemaalonso, rootedcon, mindcrypt, bquintero, lawwait, pablogonzalezpe, aramosf, w3af, Seifreed, jantonioCalles, dipudaswani, RadioHacking, lostinsecurity, BTshell, ilazaro, monivalle, aiglesiasfraga, eduSatoe, pablofb, RafaelCisneros, Miguel_Arroyo76, H3dicho, daboblog, Seguridadjabali, CiberPoliES, r0bertmart1nez, ottoreuss, Securizame, criptored, ElevenPaths, s2grupo, Tarlogic.

## Scope and constraints
- First local work unit builds the loadable thematic package with real approved catalog, explicit defensive editorial rules, source management instructions, and offline regression tests.
- Reuse existing runtime selection/artifact isolation/preparation/delivery contracts; do not introduce a plugin framework or new dependencies.
- Existing generator provider/channel limits remain explicit; a declared catalog does not prove live collection works.
- Preserve AI Builders behavior, canonical/legacy paths, default selection, generated feed snapshots, and unrelated `.gitignore`/`.codegraph/`.
- Do not populate invented blogs/podcasts, invented vulnerability metadata, or unapproved source accounts.
- No X/NaN/Telegram API calls, credential access, installs, secret configuration, workflow dispatch, publication, or push in this unit.
- No new schedule anchored to today; no day-of-month `*/3` approximation of three-day intervals.
- English code/docs; actual sample bulletin and generation instructions require Spanish output as user approved.
- Exactly 12 sibling-package assets per existing package contract. Shared provider normalization may move to digest-core only if behavior and AI Builders API remain compatible and tested.

## Delivery
- Current branch: `feat/cybersecurity-edition-read`; latest delivered boundary before this work is `bb4d49536e45cbce8a80c4e8b65b028965cc39fb`.
- Route: sequential delegated writer per bounded multi-file work unit; parent owns commits and delivery.
- Current authorization: implement every safe local/offline capability possible for both packages. Test through the terminal agent first. Do not add APIs, credentials, X, Telegram, scheduling, publication, or workflow activation.
- Forecast: CSP-2A 180–280 authored lines; CSP-2B 180–300 authored lines, including tests and current records. Strategy: `ask-on-risk`; each work unit should remain independently reviewable.

## Tasks
- [x] **CSP-1 — Build the cybersecurity package and approved source catalog**
  - Status: done.
  - Load `cybersecurity-digest` through existing runtime, with isolated user files and feeds.
  - Catalog contains exactly approved 40 X handles and empty blogs/podcasts arrays using generator-compatible input shapes.
  - Add strict TDD for loadability/identity, complete catalog, isolated paths, collector normalization, Spanish editorial/sample assets, and absence of AI Builders preparation aliases.
  - Keep source management simple: one catalog, documented shapes; agent instructions to edit/validate the same file without rewriting unrelated sources or adding unapproved ones.
  - Declared hosted asset URLs identify intended package-owned locations, not claimed published assets. Missing remote feeds must remain explicit preparation errors; no empty edition publication is implemented by this unit.
  - Reconcile PRD/FEATURES/ROADMAP/BITACORA to user-approved pilot scope and distinguish package readiness from live automation.
  - Checks: focused tests showing actual RED/GREEN, full `node --test`, syntax/diff checks, independent no-network verification, preserved AI Builders regression behavior. Review assessment and native review per current switch; truthful fallback if unavailable.
- [x] **CSP-2 — Complete local source validation and terminal evidence preview**
  - Status: done locally; live collection and workflow activation remain pending.
  - [x] **CSP-2A — Validate source catalogs through one public runtime seam.**
    - Added `loadSourceCatalog` validation for JSON shape, required arrays, supported fields, malformed handles/URLs, duplicates, and supported blog targets before collection.
    - Wired `generate-feed.js` through the validator without external service calls in tests.
    - Public seam: `loadSourceCatalog(catalogUrl)` in `scripts/package-runtime.js`.
    - Commit: `12b7e183a83d6178a8b60860271f68bdfcce44a7` (`feat(sources): validate package source catalogs`).
    - Evidence: strict RED/GREEN completed; focused 30/30 and full 73/73 tests passed. Native review `review-8cda6f815e19f518` approved and exact acknowledgement burned authority. Committed-range assessment was unavailable due unrelated untracked state; independent fallback repeated 73/73 and clean syntax/whitespace checks.
  - [x] **CSP-2B — Preview local package evidence safely from terminal.**
    - Added an offline command that selects either package and reports validated catalog counts, local feed availability/time/count/errors, and saved-edition metadata only.
    - The command labels output as local evidence; it never generates bulletin prose, saves an edition, or contacts the network.
    - Public seam: `buildEvidencePreview(...)` plus `scripts/preview-digest.js --package <id> [--json]`.
    - Commit: `63d3c916553bc716497a72038ca71bca984e33ac` (`feat(preview): add offline digest evidence command`).
  - Preserve package-specific artifact isolation. Workflow activation and live collection remain deferred until APIs are authorized.
- [ ] **CSP-3 — Generate and deliver one durable edition**
  - Status: planned.
  - Call NaN with bounded requests; produce Spanish Telegram and X Article versions from evidence; validate outputs and suppress empty/unsupported editions.
  - Integrate the completed CER-1 local edition store for on-demand agent retrieval. Reading an edition is separate from generation/publication, never invokes either, and requires access to the saved files. See `odd/tasks/cybersecurity-edition-read.md` for verified behavior; automatic saving from the future generator is still pending.
  - Add X Article adapter and durable per-channel delivery state to prevent duplicate publication on retry. Credentials and end-to-end external checks are separate gates.
- [ ] **CSP-4 — Schedule and activate after functional verification**
  - Status: planned.
  - Use true three-calendar-day cadence at noon Europe/Madrid across DST, with explicit first edition date and no publication before opt-in activation.
  - Require bounded usage/account access and successful approved end-to-end verification. First date, destination IDs and credential setup remain pending.

## Evidence
- 2026-10-08: CSP-2B strict public-seam RED failed on missing export; later malformed/unreadable feed and invalid saved-edition tests failed before their fixes. GREEN: 7/7 focused preview, 30/30 runtime, and 80/80 full Node tests passed; both syntax checks, both terminal JSON previews, and `git diff --check` passed. Independent read-only verification repeated 7/7 and 80/80, both syntax checks, whitespace checks, and both canonical previews without changing repository state. AI Builders showed 26/6/2 validated sources and available X/podcast/blog snapshots (14/1/1) with one podcast error; Cybersecurity showed 40/0/0 and all three feeds missing. Neither package had a saved edition in this checkout. Native review `review-66e8f0fc6377d74d` approved the frozen candidate and its exact acknowledgement burned authority; advisory findings remain separate follow-up work. No collection, prose generation, save, publication, or API access occurred. Live collection and workflow selection remain outside CSP-2's local completion.
- 2026-10-08: CSP-2A public seam `loadSourceCatalog(catalogUrl)` reads and validates local catalogs before `generate-feed.js` collects. RED first failed on the missing export; later focused RED failures covered malformed JSON/shape, entries, handles, URLs, duplicate identities, and unsupported blogs. GREEN: 30/30 focused and 73/73 full Node tests, both script syntax checks, and `git diff --check` passed. Tests use only repository fixtures and package catalogs; they do not prove live collection or remote existence. No CSP-2B preview, generation, delivery, scheduling, or publication was added. Parent review and commit remain pending.
- 2026-10-07: Current code has validated dynamic package loading, isolated feed paths, generic preparation, and package-aware delivery. Workflow/root instructions still assume AI Builders; full automated generation/publication is not implemented.
- 2026-10-07: Proposed second-theme non-goals in existing records are superseded by the user's explicit cybersecurity pilot decisions; update those records from actual approved scope.

- 2026-10-07: CSP-1 RED: package load test failed with `Unknown package: cybersecurity-digest`; GREEN: seven focused tests and 43 total tests passed. Correction RED: shipped-core-collector assertion failed; GREEN: eight focused tests and 44 total tests passed.
- 2026-10-07: The real catalog contains the exact 40 approved handles with handle labels (not verified display names); blogs/podcasts remain empty. Independent one-time comparison confirmed all handles. Permanent tests validate structure and uniqueness instead of pinning a fixed catalog, so later source edits need no test edits.
- 2026-10-07: Shared provider normalization moved unchanged to digest-core; both thematic collection modules re-export it. Core manifest now includes collection.js. AI Builders regression checks pass.
- 2026-10-07: Independent final verification passed 44/44 tests, six syntax checks, and diff checks. Twelve sibling assets, isolated paths, missing-feed errors, source instructions, and Spanish editorial sample were checked offline. Package tarball validation and live API checks were not run.
- 2026-10-07: Existing preparation defaults remain English when user configuration is absent; cybersecurity users must set language es. Schema cadence/language defaults are preferences, not operational scheduling. README and canonical records explicitly distinguish this foundation from future generation and delivery.
- 2026-10-07: Native assessment was unassessable due to unrelated untracked inventory; required independent verification completed. No live collection, LLM request, publication, credential access, or push occurred.

- 2026-10-07: CSP-1 work-unit commit `a9206429be050b754948f4820d6144319448db4d` (`feat(cybersecurity): add evidence-first pulse package and source catalog`), 640 insertions and 98 deletions across 22 files. Scope exceeded the initial estimate due to the shared normalization move, full asset tests and current product records; no source/generalization work from later tasks was included.
- 2026-10-07: Native committed-range review could not start (`native-start-retained-selection-candidate-mismatch`); no authority mutation occurred. Native unavailable-review assessment required writer checks plus independent verification, both completed. No authority reset or review-mode change was attempted.

## Next step
Live collection/workflow selection still needs separate operator authorization. CSP-3 API generation, external delivery, and CSP-4 activation remain deferred by user decision.
