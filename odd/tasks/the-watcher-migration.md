# Migrate the platform to the-watcher

## Objective

Rename the platform to `the-watcher` and publish the current implementation as the independent public repository `lacrimae0rerum/the-watcher`, with feeds and prompts served from its `main` branch.

## Problem and why

The checkout still uses the original repository as its Git remote and as the live host for feeds, prompts, installation links, and support. The user wants their own GitHub infrastructure and project identity.

## Authorization and constraints

- The user selected `the-watcher`, their authenticated account `lacrimae0rerum`, and public visibility, and confirmed author permission to reuse and publish inherited source.
- Permission is user-confirmed; no upstream license was independently established. Do not invent a license or remove provenance.
- Authorized external actions: create the standalone public repository, point origin at it, publish the verified current implementation to its new `main`, and update Orca display metadata.
- Preserve Git history and original author credit. Do not use the GitHub fork API, rewrite history, force-push, delete branches, or alter the original repository.
- Preserve the unrelated modified `.gitignore`, untracked `.codegraph/`, and historical ODD/design evidence.
- Keep `digest-core` and `ai-builders-digest` thematic identities and existing user-config paths, including the read-only `.follow-builders` fallback.
- Do not move the live Orca checkout directory or resume/modify historical provider sessions.
- No sibling packages, generic collection redesign, workflow package selection, paid collection runs, credential copying, or secret disclosure.
- Generated feed snapshots and deduplication state are preserved, not refreshed.
- Technical artifacts use English, except the existing Chinese README.

## Delivery

- Branch point: `b4c37608bba5c9f8f53b3cf4d3f5403ddcbb6258`.
- Feature branch: `feat/the-watcher-migration`.
- Strategy: feature-branch-chain, continuing the previously selected local work-unit delivery policy; publication to the new standalone repository is explicitly authorized.
- Forecast: approximately 300–380 authored changed lines excluding generated snapshots; publish only verified work units.
- The new repository needs its own `X_BEARER_TOKEN` and `POD2TXT_API_KEY`. Their values are unknown and will not be copied or invented.

## Tasks

- [x] **TWM-1 — Move live feed and prompt hosting to the new repository**
  - Status: done.
  - Route: delegated writer; runtime descriptor, regression tests, and user-facing prompt/sample require coordinated multi-file edits.
  - Change only live feed/prompt/outro URLs to `lacrimae0rerum/the-watcher/main`.
  - Strict TDD: first add a failing regression assertion that all live feed and prompt URLs use the selected owner/project; observe RED, then update descriptor and fixture expectations, observe GREEN, and read back.
  - Acceptance: selected repository owns all live feed/prompt URLs; package identity, legacy user paths, content topology, adapters, and generated snapshots remain unchanged.
  - Checks: focused package/preparation tests, full `node --test`, script syntax checks, and scoped diff checks. No network collection or delivery.

- [x] **TWM-2 — Rename platform identity and document independent ownership**
  - Status: done.
  - Route: delegated writer; platform identity, install/support instructions, workflow naming, and project records are coordinated non-trivial documentation/configuration edits.
  - Rename root skill/command and platform-facing installation instructions to `the-watcher`; keep the default thematic product AI Builders Digest.
  - Update English and Chinese READMEs, script package metadata/lock names, workflow display names, and active issue/install links. Do not advertise a published registry package.
  - Add concise provenance in `NOTICE.md` without inventing a license.
  - Create minimal `PRD.md`, `FEATURES.md`, `BUGS.md`, `BITACORA.md`, and `ROADMAP.md` from verified facts; mark unknowns explicitly and retain pending publication/setup states.
  - Acceptance: current operational instructions no longer point users at the original host; provenance and migration fallback remain explicit; no platform/package identity confusion; records accurately distinguish local implementation, public publication, and operational setup.
  - Checks: full `node --test`, JSON metadata consistency, syntax/diff checks, and structural readback of root skill/workflow/docs. Passive prose uses structural verification, not fabricated RED.

- [x] **TWM-3 — Publish and verify independent GitHub infrastructure**
  - Status: done.
  - Route: parent for authorized GitHub/Git/Orca state mutations; delegated read-only verifier for publication safety and hosted endpoint checks.
  - Before publication, inspect tracked files and history for credential risks without displaying secret values.
  - Create `lacrimae0rerum/the-watcher` as public standalone repository, change origin, and publish verified HEAD to new `main` without modifying the existing local `main` or rewriting history.
  - Set/verify default branch `main`; update the current Orca workspace display name safely without moving its checkout.
  - Acceptance: repository is public and not a fork; origin uses the selected owner/project; main contains current verified code; every live feed URL and representative hosted prompt responds successfully; original repository remains untouched.
  - Record missing secrets and do not claim scheduled collection operational before setup and a successful run.
  - Checks: repository metadata, remote refs, tracked/history credential scan, hosted JSON/prompt reads, committed-range diff/suite checks, and preservation of unrelated workspace state.

## Progress and evidence

- 2026-10-07: Current origin is the original `zarazhangrui/follow-builders`; authenticated GitHub owner is `lacrimae0rerum`; destination repository does not exist.
- 2026-10-07: GitHub reports no original license. User confirmed author authorization before public migration was resumed.
- 2026-10-07: Existing implementation includes verified PPE-4 at `b4c37608`; local main is still the inherited upstream boundary, so the new remote main must receive the verified feature content.
- 2026-10-07: Orca current worktree is the existing main checkout. Its local directory path stays unchanged to avoid disrupting live sessions.

- 2026-10-07: TWM-1 observed RED: the new URL-ownership assertion failed on all four original hosted URLs. GREEN: focused tests 10/10; full tests 36/36. Three script syntax checks and scoped diff checks passed; independent verification passed without findings.
- 2026-10-07: TWM-1 source/test diff is 26 insertions and 11 deletions across five files. Generated feed/state snapshots, thematic identity, and user-config compatibility remain unchanged. Hosted network reads await publication in TWM-3.
- 2026-10-07: Native assessment is unassessable because unrelated untracked files need explicit inventory; its required independent-verifier fallback was completed.
- 2026-10-07: TWM-1 work-unit commit: `c5795733a1cc867307ecefc5cc1901d21b3022cb` (`feat(the-watcher): host digest assets in independent repository`).

- 2026-10-07: TWM-2 completed platform/root command naming, installation and issue links, workflow display names, matching script package metadata, provenance notice, and the five minimal project records. Registry publication is explicitly unavailable/unknown rather than advertised.
- 2026-10-07: TWM-2 uses structural verification because passive documentation/metadata have no meaningful RED. Full suite 36/36, script syntax and metadata identity checks passed; independent readback approved every surface. Generated data and thematic identities are unchanged.
- 2026-10-07: Publication safety scan found zero known token/private-key patterns in current tracked content or 324 reachable commits, and zero high-entropy credential-shaped assignments in tracked files. No dedicated scanner is installed; regex/entropy scanning is heuristic and does not establish absence of all possible secrets. No values were displayed. New records were also inspected; the task's local absolute directory reference was genericized.

- 2026-10-07: TWM-2 work-unit commit: `f4b3d6ba9330f50a4bf8e1f5e3b3b7741fb96736` (`feat(the-watcher): establish independent platform identity`); 174 insertions and 60 deletions across 13 files including this record.
- 2026-10-07: Native committed-range review of the migration slice could not start because retained intended-untracked selection was bound to the unrelated ambient `.gitignore` candidate (`native-start-retained-selection-candidate-mismatch`). No authority mutation occurred. Native fallback required writer verification and independent verification; both passed. No review switch or authority recovery was changed.

- 2026-10-07: TWM-3 created `https://github.com/lacrimae0rerum/the-watcher` as PUBLIC, `isFork: false`, default branch `main`; origin fetch/push now use that repository. Initial published main equals `f4b3d6ba9330f50a4bf8e1f5e3b3b7741fb96736`. Git history was retained; the original repository and existing local main were not changed.
- 2026-10-07: Independent publication verification observed HTTP 200 for all three hosted feeds and all five package prompts; all were byte-identical to local files, feeds parsed as JSON. Full suite 36/36, five JavaScript syntax checks, and exact committed-range diff checks passed.
- 2026-10-07: New repository secrets list is empty: `X_BEARER_TOKEN` and `POD2TXT_API_KEY` are missing. No collection, delivery, or workflow dispatch ran. Publication is complete; operational collection remains blocked until credential setup and a successful approved run.
- 2026-10-07: Orca workspace display name is `the-watcher`; the live checkout stayed in place. Orca's stored projectId still references the original registration and cannot be rebound through the documented CLI in place. This UI metadata limitation does not change the new Git remote or hosted URLs; no session or admin storage was modified.
- 2026-10-07: FEATURES, BUGS, BITACORA, and ROADMAP now distinguish completed publication from blocked collection setup. Their scoped diff and structural checks passed.

## Next step

Configure the two collection credentials in the new GitHub repository, then observe a successful operator-approved workflow run. Orca stored project identity cleanup is a separate UI/re-registration step; do not disrupt live sessions or move the checkout to achieve it.
