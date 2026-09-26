# Agnostic Digest Packages

## Objective

Extract the reusable digest pipeline into `digest-core` and ship the current product as an independently packaged `ai-builders-digest` implementation.

## Product declaration

> AI builders digest — monitors top AI builders on X and YouTube podcasts, remixes their content into digestible summaries. Follow builders, not influencers.

## Problem

The repository already contains reusable collection, deduplication, prompt resolution, preparation, and delivery behavior, but its interfaces, schemas, paths, prompts, and copy are coupled to one editorial theme. That coupling prevents another independently packaged digest from reusing the same mechanics.

## Why

Independent thematic packages should be able to reuse one small, behavior-rich core without inheriting AI-builder branding or requiring a plugin framework, database, or hosted control plane.

## Authorized scope

- Introduce the `digest-core` package and public interfaces.
- Introduce the `ai-builders-digest` package and preserve the exact declaration above.
- Move current source, prompt, editorial, and branding policy behind the thematic package interface.
- Preserve the current AI digest's observable collection, preparation, remix, and delivery behavior unless a focused test exposes a contradiction.
- Add focused tests and update documentation, examples, workflow configuration, and package metadata needed by the new package model.
- Do not push, open a pull request, merge, deploy, or perform remote operations.

## Constraints

- Package model: independently published thematic packages sharing an internal generic core.
- Canonical identities: `digest-core` and `ai-builders-digest`.
- TDD mode: strict, selected by the user.
- Test runner: Node.js built-in test runner (`node --test`) unless repository evidence proves it cannot support a required seam.
- TDD loop: observed RED before implementation, then GREEN; tests exercise only confirmed public seams.
- Confirmed seams:
  1. `digest-core` collection/normalization produces `ContentItem` and `FeedSnapshot`.
  2. `prepare()` produces a `RemixPackage` from a thematic package plus audience preferences.
  3. `deliver()` sends an `Edition` through a delivery target.
  4. `ai-builders-digest` exports its declaration, sources, prompts, and editorial policies.
- Reuse existing algorithms before adding abstractions or dependencies.
- No speculative plugin system, database, admin UI, or application server.
- Technical artifacts are written in English.

## Delivery

- Strategy: `ask-on-risk`.
- Forecast: approximately 700–1,000 authored changed lines across four work units; generated feed snapshots are excluded.
- 400-line budget risk: High.
- Chain strategy: `feature-branch-chain`, selected by the user.
- Branch: `feat/agnostic-digest-packages`.
- First reviewed boundary: `ff444307fdb1de23b70fbbefabe6a43e91e2bf04`.
- Planned chain: tracker → ADP-1 contracts → ADP-2 collection → ADP-3 preparation/delivery → ADP-4 package cutover/docs → ADP-4 identifier correction.

## Tasks

- [x] **ADP-1 — Establish package contracts and strict-TDD harness**
  - Route: delegated direct writer.
  - Trigger evidence: introduces multiple non-trivial files and reads existing package/runtime files to prepare writes.
  - Write failing public-interface tests for the package manifest and normalized core types.
  - Add the minimum package layout and exports required to pass them.
  - Acceptance: the exact product declaration is exported by `ai-builders-digest`; generic core exports do not contain AI-builder branding.
  - Checks: capture RED and GREEN results for `node --test`; run the package entrypoint as a runtime harness.
  - Commits: implementation `8ba9379175709eb75fcf8239a2026bf9c448435c`; evidence `b8df5f1bf084d8b69fddff037bb15981de86ced8`.

- [x] **ADP-2 — Normalize collection and checkpoint behavior**
  - Route: delegated direct writer.
  - Trigger evidence: extraction spans the generator, package modules, schemas, state compatibility, and tests.
  - Add one failing behavior test at a time for normalized X, podcast, and web items plus checkpoint deduplication.
  - Move provider-specific collection behind source adapters while preserving current behavior.
  - Acceptance: collectors return normalized `ContentItem` values and a `FeedSnapshot` without thematic terminology in core interfaces.
  - Checks: capture RED and GREEN results for `node --test`; run a fixture-backed generation harness without remote calls.
  - Commit: `4bb70405b3938c5c6c76696d6d99d12b1e1f7f6f` (`feat(collection): normalize source adapters`).

- [x] **ADP-3 — Generalize preparation and delivery**
  - Route: delegated direct writer.
  - Trigger evidence: preparation, delivery, package configuration, prompt resolution, and tests span multiple non-trivial files.
  - Add failing tests for `prepare()` and `deliver()` through their confirmed public interfaces.
  - Make feed topology, prompt set, branding, and delivery subject/sender package-owned.
  - Acceptance: a thematic package can produce a `RemixPackage` and deliver an `Edition` without core knowledge of AI builders.
  - Checks: capture RED and GREEN results for `node --test`; run stdout delivery as the runtime harness.
  - Commit: `c18de81dd89bb2d10ae51b5f3b226299f1de594a` (`feat(digest): generalize preparation and delivery`).

- [x] **ADP-4 — Cut over the AI Builders package and documentation**
  - Route: delegated direct writer.
  - Trigger evidence: user-facing skill instructions, prompts, examples, workflow, metadata, and READMEs require coordinated edits.
  - Move current sources and editorial policy into `ai-builders-digest`.
  - Update skill orchestration, examples, workflow, package metadata, and documentation to describe independent thematic packages and the shared core accurately.
  - Acceptance: installation and usage instructions name `ai-builders-digest`; architecture documentation names `digest-core`; the exact declaration appears consistently; documented transcript and request behavior matches code.
  - Checks: full `node --test`; package preparation and stdout-delivery smoke tests; structural link/path readback.
  - Commits: cutover `3e8aea3c6fc5d6d12613e60b0153a37b1d7f5166`; correction `122b7e85432e2535279069fab835696ab9fc4906`.

## Progress and evidence

- 2026-09-26: Repository architecture mapped. No source files changed.
- 2026-09-26: User chose independent thematic packages, names `digest-core` and `ai-builders-digest`, strict TDD, and confirmed the four public test seams.
- 2026-09-26: Feature branch created. Implementation has not started.
- 2026-09-26: User selected `feature-branch-chain`; branch point recorded as `ff444307fdb1de23b70fbbefabe6a43e91e2bf04`.
- 2026-09-26: ADP-1 RED — `node --test`: failed as expected with 1 failed test and `ERR_MODULE_NOT_FOUND` for `packages/digest-core/index.js`.
- 2026-09-26: ADP-1 GREEN — `node --test`: passed 2 tests, 0 failed.
- 2026-09-26: ADP-1 runtime harness — `node -e "Promise.all([import('./packages/digest-core/index.js'), import('./packages/ai-builders-digest/index.js')]).then(([core,pkg]) => { if (typeof core.createContentItem !== 'function' || typeof core.createFeedSnapshot !== 'function' || pkg.declaration !== 'AI builders digest — monitors top AI builders on X and YouTube podcasts, remixes their content into digestible summaries. Follow builders, not influencers.') process.exit(1); console.log(pkg.declaration) })"`: passed and printed the exact declaration.
- 2026-09-26: ADP-1 refactor pass reviewed naming and validation flow; no behavior change was needed.
- 2026-09-26: ADP-1 rollback boundary — revert the ADP-1 implementation and evidence commits to remove only `packages/digest-core/`, `packages/ai-builders-digest/`, and this task evidence; existing source configuration, prompts, and generated feed snapshots remain unchanged.
- 2026-09-26: ADP-1 authored line count — 340 additions (233 package code, tests, and metadata; 107 task-document lines first tracked on this branch).
- 2026-09-26: Parent spot check — `node --test`: passed 2 tests, 0 failed.
- 2026-09-26: RDD was globally off. Native risk assessment returned `high/unassessable` because local untracked `.atl/` and `.codegraph/` required explicit inventory handling; the required independent verifier then passed all ADP-1 requirements and both commands with no findings.
- 2026-09-26: ADP-2 RED — successive `node --test` runs failed as intended with `collectFeed is not a function`; the duplicate item remaining in `snapshot.items`; collector error `unavailable` escaping; and `createCollectors is not a function` (one failed test in each run).
- 2026-09-26: ADP-2 GREEN — `node --test`: passed 6 tests, 0 failed.
- 2026-09-26: ADP-2 fixture harness — `node -e "import('./packages/digest-core/index.js').then(async ({ collectFeed }) => { const result = await collectFeed({ sources: [{ id: 'demo', type: 'demo' }], collectors: { demo: { collect: async () => [{ id: '1', kind: 'note', source: 'demo', title: 'Fixture', url: 'https://example.com/item', publishedAt: '2026-09-26T00:00:00Z', content: 'Body' }] } }, checkpoint: { seen: {} }, generatedAt: '2026-09-26T01:00:00Z' }); if (result.snapshot.items.length !== 1 || !result.checkpoint.seen['demo:1']) process.exit(1); console.log(result.snapshot.items[0].id) })"`: passed and printed `1` without network calls.
- 2026-09-26: ADP-2 rollback boundary — revert `4bb70405b3938c5c6c76696d6d99d12b1e1f7f6f` to remove `collectFeed`, thematic collection adapters, their public tests, and generator routing; legacy provider algorithms, state keys, and generated feed snapshots remain unchanged.
- 2026-09-26: ADP-2 authored line count relative to `af4d306` — 385 additions plus deletions; generated feed snapshots excluded because none changed.
- 2026-09-26: ADP-2 parent spot check — `node --test`: passed 6 tests, 0 failed.
- 2026-09-26: ADP-2 native assessment — `high` because `scripts/generate-feed.js` crosses a process boundary; RDD remained globally off.
- 2026-09-26: ADP-2 independent verification — passed all requirements plus `node --test`, the fixture harness, `node --check scripts/generate-feed.js`, and `git diff --check af4d306..HEAD`; no regressions found.
- 2026-09-26: ADP-3 RED — successive `node --test` runs failed as intended with `prepare is not a function` (1 of 7 tests), `deliver is not a function` (1 of 8 tests), and the package-owned `digestPackage` export missing (1 of 9 tests).
- 2026-09-26: ADP-3 GREEN — `node --test`: passed 9 tests, 0 failed.
- 2026-09-26: ADP-3 runtime harness — the required import harness called generic `prepare`, routed `deliver` through an in-memory stdout adapter without network access, and passed with `demo:Hello`.
- 2026-09-26: ADP-3 verification — both script syntax checks and `git diff --check 86ef1ec..HEAD` passed with no output.
- 2026-09-26: ADP-3 rollback boundary — revert `c18de81dd89bb2d10ae51b5f3b226299f1de594a` to remove only generic preparation/delivery, thematic preparation and delivery configuration, public tests, and script routing; ADP-1/ADP-2 contracts, collectors, generated feed snapshots, and the ADP-4 cutover remain unchanged.
- 2026-09-26: ADP-3 authored line count relative to `86ef1ec` — 392 additions plus deletions; generated feed snapshots excluded because none changed.
- 2026-09-26: ADP-3 parent spot check — `node --test`: passed 9 tests, 0 failed.
- 2026-09-26: ADP-3 native assessment — `high` because `scripts/deliver.js` crosses a process boundary; RDD remained globally off.
- 2026-09-26: ADP-3 independent verification — passed all requirements plus 9 tests, the in-memory delivery harness, both syntax checks, and `git diff --check 86ef1ec..HEAD`; no regressions found. Direct delivery execution remained intentionally skipped because the pre-existing `dotenv` dependency is not installed and real adapters can cause external effects.
- 2026-09-26: ADP-4 RED — package asset ownership test failed as intended with 1 of 9 tests failing because the source catalog still resolved outside `packages/ai-builders-digest/`; compatibility resolution then failed as intended with 1 of 10 tests and `resolveUserFile is not a function`.
- 2026-09-26: ADP-4 GREEN — `node --test`: passed 10 tests, 0 failed after moving the catalog, schema, prompts, and sample under `packages/ai-builders-digest/` and adding canonical-first legacy path resolution.
- 2026-09-26: ADP-4 package asset harness — the required package import/access command passed and printed `ai-builders-digest`; the package-owned catalog and all five prompts were readable.
- 2026-09-26: ADP-4 preparation/stdout smoke — the in-memory public `prepare()` → `deliver()` harness passed and printed `stdout:ai-builders-digest` without remote calls or delivery effects.
- 2026-09-26: ADP-4 script checks — `node --check` passed for `scripts/generate-feed.js`, `scripts/prepare-digest.js`, and `scripts/deliver.js`; direct delivery execution remained intentionally skipped because `dotenv` is not installed and real adapters can cause external effects.
- 2026-09-26: ADP-4 structural documentation readback — passed across 17 changed documentation, workflow, package, prompt, example, and metadata files. It confirmed the exact declaration, canonical package and local-state names, pod2txt terminology, three feed/up-to-five prompt request claims, X → official blogs → podcasts sample order without `@` handles, package-owned referenced paths, and removal of the unsupported root MIT claim.
- 2026-09-26: ADP-4 rollback boundary — revert the ADP-4 implementation and evidence commits to restore the root `config/`, `prompts/`, and `examples/` assets plus the `~/.follow-builders` canonical namespace; ADP-1/2/3 generic contracts, algorithms, delivery mechanics, and generated feed snapshots remain unchanged.
- 2026-09-26: ADP-4 correction RED — `node --test` failed as intended with 10 passed and 1 failed because the public `runtime` export was undefined.
- 2026-09-26: ADP-4 correction GREEN — `node --test` passed 11 tests, the canonical runtime harness printed `AI-Builders-Digest/1.0 (feed aggregator)`, and all three script syntax checks passed.
- 2026-09-26: ADP-4 correction structural readback — confirmed canonical `/ai-builders-digest` invocations and `/tmp/ai-builders-digest.txt` in `SKILL.md`, two active `runtime.userAgent` uses, and no active `FollowBuilders/1.0` runtime source.
- 2026-09-26: ADP-4 correction commit — `122b7e85432e2535279069fab835696ab9fc4906` (`fix(ai-builders): canonicalize remaining runtime identifiers`); rollback it to restore only the superseded User-Agent, invocation, and temporary-path identifiers.
- 2026-09-26: ADP-4 authored line count relative to `79966ac` — 414 additions plus deletions; generated feed snapshots excluded because none changed.
- 2026-09-26: ADP-4 parent spot check — `node --test`: passed 11 tests, 0 failed.
- 2026-09-26: ADP-4 native assessment — `high` because delivery/workflow files cross process and shell boundaries; RDD remained globally off.
- 2026-09-26: ADP-4 independent reverification — passed the package/runtime harness, 11 tests, all three script syntax checks, diff checks, documentation/path inspection, and corrected-identifier search with no regressions.
- 2026-09-26: ADP-4 delivery split — `79966ac..7a82cc6` is a 373-line cutover slice on `feat/agnostic-digest-packages-04-ai-builders-cutover`; `7a82cc6..122b7e8` is a dependent 43-line correction slice on `feat/agnostic-digest-packages-05-identifier-correction`. Both stay under the 400-line budget and must integrate together.

## Next step

All implementation tasks are verified. Delivery remains user-owned: push/open the tracker and five dependent child PRs only if explicitly requested.
