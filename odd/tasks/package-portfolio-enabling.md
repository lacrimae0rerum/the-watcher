# Package Portfolio Enabling

## Objective

Add the smallest reusable runtime seam needed to select and load a thematic digest package while preserving the current AI Builders generator behavior.

## Problem

`digest-core` and `ai-builders-digest` already separate generic mechanics from thematic policy, but executable scripts still statically import AI Builders. No sibling package can be selected at runtime.

## Why

A validated package selector and dynamic loader are prerequisites for package-scoped artifacts, descriptor-driven generation, dynamic preparation, package-aware delivery, workflows, and skills. Implementing this seam first avoids creating inert sibling directories or a speculative plugin framework.

## Authorized scope

- Reconcile Section 10 of `docs/digest-package-portfolio-design.md` against current code and tests.
- Add a validated `--package` selector with an AI Builders compatibility default.
- Dynamically load and validate the selected package through the existing thematic package interface.
- Route `scripts/generate-feed.js` through that runtime seam without changing AI Builders collection, feed names, state paths, workflow behavior, source selection, or remote behavior.
- Add focused public-seam regression tests.
- Do not implement sibling package directories, package-scoped artifacts, descriptor-driven iteration, workflow/skill parameterization, or X-Clusters in this work unit.
- Do not select sources, accounts, retention, editorial, political, publication, or delivery policy.
- Do not push, open a pull request, deploy, publish, or perform remote operations.

## Constraints

- Reuse the existing package/core seam.
- No plugin discovery, registration manifest, event bus, dependency-injection container, lifecycle hooks, or extension SDK.
- Preserve the exact 12-file sibling package contract documented in `docs/digest-package-portfolio-design.md`; this repository-level work adds no sibling-internal file.
- Preserve the modified `.gitignore` and untracked `.codegraph/`; never stage or alter them.
- Technical artifacts are written in English.
- TDD mode: strict, carried forward from the user-selected mode recorded in `odd/tasks/agnostic-digest-packages.md:32-34` for this continuing package-platform initiative.
- Test runner: Node.js built-in test runner (`node --test`).
- TDD loop: observed RED before implementation, then GREEN, then a bounded refactor/readback.
- Confirmed public seams from the authorized design: CLI `--package` selection and the thematic package module interface in Section 10.1-2.

## Reconciliation of Section 10 at `361b153`

| Requirement | State | Evidence |
| --- | --- | --- |
| 1. Validated `--package` | Missing | `scripts/generate-feed.js:1010-1016` supports only channel flags; preparation has no argument parsing; `scripts/deliver.js:41-42` handles only message/file input. |
| 2. Dynamic import | Missing | Static AI Builders imports remain in `scripts/generate-feed.js:19-24`, `scripts/prepare-digest.js:23-29`, and `scripts/deliver.js:27-31`. |
| 3. Descriptor-driven collection | Partial | `packages/digest-core/index.js:144-191` and `packages/ai-builders-digest/collection.js:63-77` provide a generic collector seam, but `scripts/generate-feed.js:1071-1145` still dispatches fixed X, podcast, and blog branches. |
| 4. Package-scoped state and feeds | Missing | `scripts/generate-feed.js:43-45,1105,1134,1161` uses fixed root state/feed paths. |
| 5. Dynamic preparation envelope | Partial | `packages/digest-core/index.js:97-116` returns a generic remix package, but `scripts/prepare-digest.js:121-160` flattens it into fixed channel keys and stats. |
| 6. Package-owned paths and branding | Partial | `scripts/prepare-digest.js:33,97-106` and `scripts/deliver.js:34-35,197` use package-owned user paths, prompts, and email branding; generator artifacts and root skill paths remain fixed. |
| 7. Workflow parameterization | Missing | `.github/workflows/generate-feed.yml:3-17,36-52` has only a collection-mode input and stages fixed files. |
| 8. Package-aware root skill | Missing | `SKILL.md:313-419` assumes AI Builders and fixed X/podcast/blog content. |
| 9. Contract tests | Partial | Core and AI Builders regression tests exist, but selector, traversal rejection, dynamic loading, package-scoped artifacts, descriptor iteration, generic CLI envelope, branding isolation, and X relation semantics are absent. |

## Delivery

- Strategy: `ask-on-risk`.
- Forecast: approximately 220-320 authored changed lines for one work unit, including tests and this record.
- 400-line budget risk: Low.
- Current branch: `feat/agnostic-digest-packages-05-identifier-correction`.
- Starting boundary: `361b15352651011e116f1af6444d25dbb949560d`.

## Tasks

- [x] **PPE-1 — Select and validate the generator package at runtime**
  - Route: delegated direct writer.
  - Trigger evidence: implementation adds a runtime module and tests and changes the non-trivial generator entrypoint.
  - Add one failing public-interface test at a time for the default AI Builders selection, explicit canonical IDs, missing values, separator/traversal rejection, unknown package failure, and thematic interface validation.
  - Implement the smallest package runtime module using standard ESM dynamic import.
  - Replace the generator's static thematic import with the selected validated package while retaining existing flags and observable AI Builders behavior.
  - Acceptance:
    1. No `--package` selects `ai-builders-digest` for backward compatibility.
    2. `--package <canonical-id>` is parsed without consuming or changing existing channel flags.
    3. Missing values, path separators, traversal, unknown package paths, and malformed thematic interfaces fail closed.
    4. The loaded package ID must match the requested ID.
    5. Existing AI Builders tests and generator syntax checks still pass.
  - Checks:
    - RED evidence from the focused runtime test before implementation.
    - GREEN: focused runtime test and full `node --test`.
    - Runtime harness: load the real `ai-builders-digest` package through the new seam and print its canonical ID.
    - `node --check scripts/generate-feed.js`.
    - `git diff --check 361b153..HEAD` after commit, with the pre-existing trailing whitespace in `docs/digest-package-portfolio-design.md:3` reported separately if still present in the historical base range.
  - Rollback boundary: revert the PPE-1 work-unit commit to remove only the selector/loader seam, its tests, generator wiring, and this task evidence; prior core/package extraction and the portfolio design remain unchanged.

## Progress and evidence

- 2026-09-27: Repository `AGENTS.md` is absent; global injected project instructions remain authoritative.
- 2026-09-27: Reconciled branch `feat/agnostic-digest-packages-05-identifier-correction` at `361b153` against merge-base `ff444307` and inspected the complete 27-file committed diff (1,827 insertions, 268 deletions).
- 2026-09-27: Preserved unrelated modified `.gitignore` and untracked `.codegraph/`.
- 2026-09-27: Section 10 result is 0 fully implemented, 4 partial, and 5 missing requirements. The smallest dependency-ready slice is selector + dynamic loading in the generator; package-scoped artifacts remain the next separate slice.
- 2026-09-27: `git diff --check ff444307..361b153` reports one pre-existing trailing-whitespace error at `docs/digest-package-portfolio-design.md:3`; no correction is included in PPE-1 unless separately authorized.
- 2026-09-27: Existing `odd/tasks/agnostic-digest-packages.md` remains closed because its objective and rollback boundaries cover core extraction and AI Builders cutover, not multi-package runtime enablement.
- 2026-09-27: PPE-1 RED — the focused test first failed with `ERR_MODULE_NOT_FOUND` for `scripts/package-runtime.js`; later tracer tests exposed generator package selection occurring after environment validation and non-string IDs reaching unknown-package handling.
- 2026-09-27: PPE-1 GREEN — `node --test scripts/package-runtime.test.mjs` passed 12 tests and full `node --test` passed 23 tests.
- 2026-09-27: Runtime harness — loading real `ai-builders-digest` through `loadDigestPackage()` passed and printed `ai-builders-digest`.
- 2026-09-27: Syntax and candidate diff checks passed for `scripts/generate-feed.js`, `scripts/package-runtime.js`, `scripts/package-runtime.test.mjs`, and this record.
- 2026-09-27: Native assessment was unavailable because intended untracked files require explicit review inventory; with RDD off, the returned plan required writer self-verification plus an independent verifier.
- 2026-09-27: Independent verification passed all PPE-1 acceptance criteria. Its initial concern about validating `declaration` was withdrawn after Section 3, Section 4, and Section 10.2 confirmed declaration is part of the thematic identity interface.
- 2026-09-27: Parent spot check reran full `node --test`: 23 passed, 0 failed.
- 2026-09-27: Pre-commit authored size is 358 additions plus deletions across the runtime module, tests, generator wiring, and this record.
- 2026-09-27: PPE-1 work-unit commit — `ce833ad1fb80f5d84d3c213ff8ec4ae141bbbd84` (`feat(digest): select generator package at runtime`).
- 2026-09-27: Committed-range `git diff --check 361b153..ce833ad` passed with no output. The exact work-unit diff is 354 insertions and 12 deletions across four files.
- 2026-09-27: Post-commit status contains only the preserved unrelated modified `.gitignore` and untracked `.codegraph/.gitignore`.

## Next step

PPE-1 is complete. The next dependency-ready slice is package-scoped state and feed paths, which remains unimplemented and requires separate authorization.
