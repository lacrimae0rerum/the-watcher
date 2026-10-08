# Local agent digest generation

## Objective
Create a deterministic offline terminal handoff for both digest packages. The command must assemble a model-ready work packet from package-isolated local feeds, local configuration, and local prompts. A terminal agent can then draft an edition and use the existing explicit save command.

## Authorization and constraints
- User authorized this work after the local evidence preview was completed and delivered.
- Work on `feat/local-agent-digest-generation`.
- Preserve AI Builders keyword configuration and existing remote preparation behavior.
- Use package-isolated local artifacts and canonical package IDs.
- No model client, network request, API, credential, X, Telegram, delivery, scheduling, workflow activation, or publication.
- Do not invent cybersecurity evidence. The real cybersecurity command must fail safely while its local feeds are absent.
- Reuse `scripts/save-edition.js` and the edition store. Do not add dependencies or a plugin framework.
- Preserve unrelated local `.gitignore` and `.codegraph/` state.

## Task
- [ ] **LAG-1 — Build and verify the offline terminal handoff**
  - Add a local-only preparation command for either package.
  - Resolve prompts with local user override first and bundled prompt fallback second. Never fetch remote prompts.
  - Read package-isolated local feeds, retain partial evidence with explicit errors, and fail when all evidence is missing, invalid, or empty.
  - Emit the existing preparation envelope so an agent receives content, preferences, prompts, source errors, and generation instructions.
  - Keep saving explicit through the existing `save-edition.js` command.
  - Add deterministic tests for both packages, offline behavior, prompt precedence, malformed or empty feeds, argument errors, and no writes.
  - Document the agent handoff, safe failure boundary, and explicit save/read commands.
  - Run focused and full tests, syntax and whitespace checks, both terminal package scenarios, native review when enabled, and independent committed-range verification.
  - Close with a Conventional Commit and record its identity below.

## Evidence
- 2026-10-08: Delegated test-first implementation observed RED when the CLI was absent and again when unreadable config escaped the envelope. Focused GREEN passed 7/7; the related preparation/runtime set passed 41/41.
- 2026-10-08: Independent verification passed 7/7 focused and 87/87 full tests, both syntax checks, `git diff --check`, and both real package terminal scenarios. AI Builders produced a local packet with 14 X accounts, one podcast, one blog, five prompts, and one propagated podcast error. Cybersecurity failed safely with empty stdout because all local feeds are absent. Repository status was unchanged by both commands.

## Next step
Complete native review, run one bounded agent consumption trial for available AI Builders evidence, then commit and record the work-unit identity.
