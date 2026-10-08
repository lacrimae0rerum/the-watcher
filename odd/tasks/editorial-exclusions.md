# Shared editorial exclusions

## Goal
Apply the user's editorial baseline to every implemented thematic package: exclude advertising, trivial content, and engagement bait. Keep substantive, verifiable technical announcements. This policy is independent of keyword prioritization.

## Scope
Update digest-intro, summarize-tweets, summarize-blogs and summarize-podcast prompts in ai-builders-digest and cybersecurity-digest, with per-prompt regression checks and concise canonical documentation. Translation prompts are not content selection. Future thematic packages must follow the same baseline.

## Constraints
Do not modify runtime prompt resolution, user overrides, remote resources, keywords, source catalogs, credentials, .gitignore or .codegraph. No installs, generation, publication, staging, or commits. Local bundled prompts only: runtime can prefer user/remote prompts, so do not claim deployed or universal runtime enforcement. Shared wording is a prompt instruction, not a deterministic content filter.

## Task
- [x] EE-1 (done): Applied consistent exclusions to all eight editorial prompts, verified each independently, and documented limits.

## Routing and verification
Delegate multi-file implementation to gentle-ai-worker; Ponytail full. Write prompt-contract tests first and observe their failure, then update prompts and run focused package tests plus root `node --test` and `git diff --check`. Checks must assert all three exclusions per editorial prompt, not across concatenated files, and exempt translate.md. No dependency or new parser. Tests prove instruction presence, not model compliance.

## Delivery
Existing feature branch, preserve all prior uncommitted KW work. Forecast 100–180 diff lines; ask-on-risk strategy. No commit authorized; commit identity none. Native review/assessment follows current switch and candidate evidence.

## Evidence and next step
Explorer found AI tweets already excluded promotional/trivial/engagement content; other editorial prompts lacked the complete baseline. All eight bundled editorial prompts now state the shared rule, preserve substantive verifiable vendor announcements, and skip podcast ad segments without discarding useful episodes.

Observed RED: 8/23 focused tests failed before prompt edits. GREEN: 23/23 focused tests passed after edits, and again after wording cleanup. Root suite: 59/59 passed, none skipped. Independent verifier repeated root suite (59/59) and `git diff --check`, both passed; parent repeated the diff check and read back a podcast diff. No generated-output quality test or remote/user-override verification was performed.

Native review review-ea383a38b31a17b5 approved the candidate; exact acknowledgement completed and authority was burned. Three informational findings concern existing asset tests and did not open correction. Assessment was unavailable due its untracked declaration requirement; independent verification fallback passed. Native workspace candidate included earlier KW work and ambient .gitignore, neither changed in EE-1. This closure record was updated after implementation review. No commit or publication occurred.

Next: pending AI-specific keyword taxonomy correction remains separate (KW-1). Publishing bundled prompts and reconciling external overrides require their own authorized action; model compliance is not established by instruction-presence tests.
