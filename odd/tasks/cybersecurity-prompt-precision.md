# Cybersecurity prompt precision

## Goal and scope
Improve the five cybersecurity prompts and the existing Spanish fictional sample with explicit structure, bounded length, source-field discipline and empty-state handling. Preserve defensive evidence rules, uncertainty, source-supported actions and shared editorial exclusions. Do not copy AI's channel-first ordering.

## Output contract
Order substantive items by urgency/action: `Acciones prioritarias`, `En seguimiento`, then `Contexto y aprendizaje`; omit empty sections. Include a period only when supplied. Each item states source/date if available, verified facts, what is unconfirmed, who should check exposure and a source-supported safe next step (or explicitly unavailable). Targets: X 60–100 words per distinct issue, blogs 100–180, podcasts 120–200; prefer shorter over padding, never remove evidence/qualifiers to meet a target. No invented CVE/version/CVSS/attribution, quotes, publication dates, or priority. Deduplicate same issue while retaining distinct evidence. Missing or unconfigured feeds are not proof of no incidents. Do not create an edition when there is no usable evidence.

## Task
- [x] CP-1 (done): Improved prompts/sample and added focused contract checks; verified and documented the bounded result.
- [x] CP-2 (done): Corrected the assembly-prompt hierarchy and source-presentation gaps, added a focused regression check, and verified.

## Routing and checks
Delegated writer (multi-file change), Ponytail full. Write new prompt contract tests and observe RED before editing prompts, then GREEN with `node --test packages/cybersecurity-digest/index.test.mjs`; run root `node --test` and `git diff --check`. Human-readable sample review is required too. Tests show contract presence, not model compliance. No API/model-generation tests authorized.

## Constraints and delivery
Keep existing filenames and 13-asset contract. English instructions; Spanish output sample explicitly fictional with reserved example.com links and no real advisories or CVEs. Read raw feed shape, not normalized collection fields. No changes to runtime, keywords, sources, provider, schedule, publication, user overrides, AI prompts, .gitignore or .codegraph. Keep existing uncommitted work. No commits/push authorized. Forecast 150–220 incremental diff lines; ask-on-risk strategy. Commit identity: none.

## Evidence and next step
Prompts receive raw x/podcasts/blogs channel arrays. Tweet text/url/createdAt, blog content/description/url/publishedAt and podcast transcript/url/publishedAt are available when supplied. Cyber blogs/podcasts catalogs are empty. Preparation may prefer user or hosted prompts over bundled files.

Writer observed RED: 3/15 focused tests failed before prompt edits; GREEN: 15/15 passed afterward. Root suite passed 62/62. Independent verifier repeated root suite: 62/62, no failures; diff checks passed for writer, verifier and parent. Verifier inspected raw-field correspondence, all required sample fields, reserved URLs, empty-state handling and preserved exclusions. Parent read back the Spanish sample. No model generation or remote/user-override validation performed.

Native review review-7a72ee779dc0cffe approved the implementation candidate and exact acknowledgement burned authority. Four informational findings did not open correction. Assessment could not run due its untracked declaration requirement; independent verification fallback passed. Native scope included earlier uncommitted work (427 total changed lines), not just CP-1; delivery should separate coherent units before any authorized commit/PR. Task closure note updated after review. No commit or publication performed. Verifier memory save failed because of ambiguous active sessions; parent persists the outcome here and in its task mirror.

## CP-2 follow-up
User requested fixing the still-dense digest-intro.md after direct comparison with AI Builders. Scope: cyber digest-intro.md, index.test.mjs and BITACORA.md only. Delegated writer reorganized the intro with an item template, per-channel presentation rules and Telegram-safe handle display while preserving source URLs and urgency ordering. Initial new test failed (15/16); final focused suite passed 16/16 and root suite passed 63/63. Two intermediate line-sensitive assertions failed and were resolved before final GREEN. Parent read back the 96-line intro. Native review review-288a64f5146ec562 approved the implementation and exact acknowledgement burned authority. Two informational test suggestions did not open correction. Assessment failed on its untracked declaration requirement; independent verifier repeated root 63/63 and clean diff check, and confirmed the hierarchy, template, source fields, Telegram handling and preserved evidence rules. No model-output or hosted/override validation. No generation, publication or commit. Tracking for this follow-up was recorded after the writer returned, rather than before its edits (process deviation).

Next: AI-specific keyword taxonomy correction remains pending separately. Real output quality and deployment remain unverified until separately authorized generation/publication.
