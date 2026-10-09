# API-backed digest generation

## Objective
Validate real source collection in isolation, then add the smallest safe model-generation path after selecting a provider at the collection checkpoint.

## Problem
The repository can prepare deterministic model-ready packets, but the collection credentials are not configured and no runtime model client exists. Cybersecurity has no collected feed evidence.

## Authorization and constraints
- The user authorized collection first, then model integration, with a validation checkpoint between them.
- Run the first collection against a disposable copy under the user's home directory.
- Prompt for secrets with hidden terminal input. Do not persist, print, commit, or send credentials to chat.
- Do not modify the active checkout during the isolated collection test.
- Do not dispatch GitHub Actions, push, publish, deliver, schedule, or activate workflows.
- Preserve local `.gitignore` and `.codegraph/` state.
- Model provider selection remains a user decision after collection evidence exists.
- Commits remain pending explicit user authorization.

## Delivery
- Branch: `feat/api-backed-digest-generation`
- Strategy: `ask-on-risk`
- Forecast: approximately 180–320 authored changed lines, excluding generated feeds and disposable test artifacts.
- Expected work units: isolated collection evidence; model client with deterministic tests and usage documentation.

## Tasks
- [x] **ADG-1 — Run and validate isolated source collection**
  - Create a disposable copy outside the active checkout.
  - Capture `X_BEARER_TOKEN` and an optional `POD2TXT_API_KEY` through hidden terminal prompts without persistence.
  - Run AI Builders X and blog collection separately; run podcast collection only when a Pod2txt key is supplied and otherwise record it as skipped.
  - Run Cybersecurity X collection separately.
  - Validate output structure, source errors, item counts, package isolation, and active-checkout immutability.
  - Remove the disposable copy after evidence is recorded or retain it only with explicit user approval.
  - Route: delegated exploration mapped the workflow because repository evidence exceeded the inline read budget; command verification routes to `gentle-ai-verify`.
  - Commit: pending authorized work-unit commit.

- [ ] **ADG-2 — Select the model provider and generation contract**
  - Stop at the collection checkpoint and present verified evidence.
  - Ask the user to select the provider and credential boundary.
  - Define the minimum request, response, timeout, error, and explicit-save behavior.
  - Route: parent-owned product decision after read-only exploration.

- [ ] **ADG-3 — Implement and verify model-backed generation**
  - Add the smallest provider-specific client and CLI that reuse the existing preparation envelope and edition store.
  - Use test-first development with deterministic mocked transport; never call a paid model from tests.
  - Keep generation separate from delivery and publication.
  - Document secure configuration and terminal usage.
  - Run focused and full checks, then assess the work-unit candidate under repository review policy.
  - Route: one bounded `gentle-ai-worker` because implementation will touch multiple non-trivial files; verification follows the native risk plan.

## Acceptance criteria
- Real collection succeeds or fails with provider-specific evidence while the active checkout remains byte-for-byte unchanged except for this authorized task record and existing local tooling state.
- No credential value appears in repository files, command output, logs, shell history, or agent messages.
- AI Builders and Cybersecurity output paths remain isolated.
- Model generation does not begin until the collection checkpoint is accepted and the provider is selected.
- The final generation path preserves source links, applies package prompts, validates output, and saves only through an explicit command.
- No delivery, publication, scheduling, or workflow activation occurs.

## Verification evidence
- 2026-10-08: The isolated live run completed in `follow-builders-collection-tests/run.m6HCqi`. Independent verification confirmed exit 0 for AI Builders X, AI Builders blogs, and Cybersecurity X; podcasts were explicitly skipped.
- 2026-10-08: Fresh evidence contains AI Builders X with 20 accounts and 41 tweets, AI Builders blogs with 3 posts, and Cybersecurity X with 14 accounts and 27 tweets. All fresh outputs report zero provider errors and valid JSON.
- 2026-10-08: Package-isolated paths, active-checkout immutability, absence of credential files, and absence of Git metadata in the disposable copy were verified. No publication, push, delivery, or workflow dispatch occurred.
- 2026-10-08: Read-only mapping confirmed that `scripts/generate-feed.js` derives write paths from its own location, so collection must run from a copied tree. The script uses only Node built-ins and current repository modules.
- 2026-10-08: Created disposable wizard `run-follow-builders-collection-test.sh`. It captures credentials with hidden input, keeps them in process memory only, runs four isolated channel/package collections, records credential-free logs and a JSON summary, and checks that active-checkout status stays unchanged.
- 2026-10-08: Independent static verification passed `bash -n` and all credential, isolation, exit-code, and no-push checks. ShellCheck is unavailable. A parent syntax spot check also passed after removing credentials from process arguments.
- 2026-10-08: The user chose to omit Pod2txt. The wizard now accepts an empty Pod2txt key, skips the podcast call, and marks both its status and output as skipped rather than reading the copied stale podcast snapshot as fresh evidence.
- 2026-10-08: Independent static verification of the optional-Pod2txt path passed syntax, gating, stale-feed, credential, and no-publication checks. ShellCheck remains unavailable. The parent syntax spot check passed.
- 2026-10-08: The user authorized deletion of the successful disposable run `run.m6HCqi`; independent verification confirmed its removal and no active-checkout feed changes.
- 2026-10-08: Cleanup inspection found `run.W54pJG`, a superseded wizard copy that stopped before external collection. It had no logs, summary, fresh feeds, `.env`, credential artifacts, or process references. The user authorized deletion, and independent verification confirmed that no `run.*` directories remain and active feeds are clean.

## Next step
Create the authorized ADG-1 work-unit commit, record its identity, then select the model provider and generation contract.
