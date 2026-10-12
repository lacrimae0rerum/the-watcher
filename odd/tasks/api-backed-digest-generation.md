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
- The selected model provider is NaN with `deepseek-v4-flash`, preserving the current PRD requirement.
- Verify the current NaN API contract from primary documentation before implementation.
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
  - Commit: `5b3264c` (`docs(odd): record isolated collection evidence`).

- [x] **ADG-2 — Select the model provider and generation contract**
  - Stop at the collection checkpoint and present verified evidence.
  - Ask the user to select the provider and credential boundary.
  - Define the minimum request, response, timeout, error, and explicit-save behavior.
  - Route: parent-owned product decision after read-only exploration.
  - Provider: NaN, model `deepseek-v4-flash`, endpoint `POST https://api.nan.builders/v1/chat/completions`.
  - Credential: `NAN_API_KEY` from the current process environment only.
  - Request: one non-streaming call with the complete local preparation packet, `max_tokens: 8192`, and a 10-minute timeout.
  - Response: require non-empty `choices[0].message.content`; print only final digest text to stdout.
  - Errors: surface provider status and sanitized OpenAI-shaped error fields; do not retry automatically, because a repeated generation can duplicate metered work.
  - Persistence: none during generation; saving remains a separate explicit `save-edition.js` command.
  - Commit: `08c23bd` (`docs(odd): define NaN generation contract`).

- [x] **ADG-3 — Implement and verify model-backed generation**
  - Add the smallest provider-specific client and CLI that reuse the existing preparation envelope and edition store.
  - Use test-first development with deterministic mocked transport; never call a paid model from tests.
  - Keep generation separate from delivery and publication.
  - Document secure configuration and terminal usage.
  - Run focused and full checks, then assess the work-unit candidate under repository review policy.
  - Route: one bounded `gentle-ai-worker` because implementation will touch multiple non-trivial files; verification follows the native risk plan.
  - Live-test scope: one AI Builders NaN generation using existing local snapshots; no Cybersecurity recollection and no second model call.
  - Retention: the user chose to keep the credential-free live summary and both external wizard scripts for possible future runs.
  - Commit: `10befc8` (`feat(digest): add NaN edition generation`).

## ADG-2 provider evidence
- NaN documents an OpenAI-compatible API at `https://api.nan.builders/v1`, authenticated with `Authorization: Bearer <key>`; personal keys are created under platform user settings. Source: https://www.nan.builders/docs
- NaN documents `POST /v1/chat/completions`, request fields `model` and `messages`, and response text at `choices[0].message.content`. Source: https://www.nan.builders/es/docs/getting-started
- NaN lists `deepseek-v4-flash` as an exact callable model ID with a 1M context window and 3B-token monthly member quota. The key-filtered authority is `GET /v1/models`. Source: https://www.nan.builders/docs/choose-a-model
- NaN documents OpenAI-shaped errors, no retry for `401`/`402`/`403`/`404`, and delayed retries for `429`/`5xx`. Source: https://www.nan.builders/es/docs/getting-started
- Minimum local contract: use Node's built-in `fetch` without a new SDK; make one non-streaming request; emit validated model text to stdout; keep persistence explicit through the existing `save-edition.js`; keep delivery separate.
- Credential decision: accept `NAN_API_KEY` only from the current process environment for the first integration; do not read or write a `.env` file.

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
- 2026-10-09: ADG-1 closed in `5b3264c` (`docs(odd): record isolated collection evidence`). Native committed-range assessment was unassessable because unrelated untracked state requires explicit declaration; the required independent verifier passed the exact range, scope, credential-absence, cleanup, and whitespace checks. The parent commit spot check passed.
- 2026-10-09: ADG-2 closed in `08c23bd` (`docs(odd): define NaN generation contract`). Native assessment was again unassessable under unrelated untracked state and reported RDD off; the required independent verifier passed the exact one-file range, credential-absence, contract, source, and whitespace checks. The parent commit spot check passed.
- 2026-10-12: ADG-3 test-first implementation added `scripts/generate-edition.js`, 8 deterministic tests, secure terminal documentation, and truthful management-record updates. Initial RED passed 1/7 and failed 6/7 while the module was absent; focused GREEN now passes 8/8 and the full suite passes 95/95.
- 2026-10-12: Syntax, missing-key fail-closed behavior, no-write behavior, exact NaN request shape, both package paths, invalid responses, timeout/network errors, provider-error sanitization, whitespace, and scope checks passed. A verifier-found strict-key-fragment leak was corrected through a second RED/GREEN cycle and independently reverified.
- 2026-10-12: Native assessment of the uncommitted candidate was unassessable under unrelated untracked state with RDD off; the required independent verifier passed. The parent focused spot check passed 8/8. No live NaN call, save, delivery, publication, or commit occurred.
- 2026-10-12: Created `run-follow-builders-nan-test.sh` for the authorized single AI Builders live call. Independent static verification confirmed hidden process-only credentials, exactly one model call, no retry or digest persistence, metadata-only evidence, atomic success gating, active-checkout drift detection, and cleanup of transient validation code. ShellCheck is unavailable; `bash -n` and the parent syntax spot check passed.
- 2026-10-12: Exactly one live NaN `deepseek-v4-flash` call for AI Builders succeeded. Credential-free evidence reports 8,929 bytes, 47 lines, 18 source URLs, canonical ISO time, a valid hidden SHA-256 format, and an unchanged active checkout. The digest text, key, and hash value were not saved or exposed.
- 2026-10-12: Final independent verification passed 8/8 focused and 95/95 full tests, syntax, safe missing-key behavior, no-write checks, scoped whitespace checks, live metadata validation, and documentation-boundary review. It confirmed that Cybersecurity live generation, digest quality, saving, delivery, publication, retry, push, and scheduling remain unverified or not performed.
- 2026-10-12: ADG-3 closed in `10befc8` (`feat(digest): add NaN edition generation`). Native committed-range assessment remained unassessable under unrelated untracked state with RDD off; the required independent verifier passed the exact eight-file range, 8/8 focused and 95/95 full tests, syntax, safe missing-key behavior, scope, security, and whitespace checks. The parent commit spot check passed.

## Next step
Await the user's delivery decision. Push, merge, saved-edition persistence, delivery, publication, and scheduling remain separate actions.
