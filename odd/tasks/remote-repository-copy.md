# Remote repository copy

## Goal
Copy the complete current repository state to the empty SSH repository at `ssh://git@a15-tuf.taile5a8d2.ts.net:2222/infotrash-labs/the-watchers.git` without changing the existing `origin` remote.

## Scope
- Include the current committed history and all intentional local source, prompt, documentation, test, keyword-catalog, and ODD task changes.
- Exclude local generated/index state such as `.codegraph/` unless repository policy already tracks it.
- Preserve coherent work-unit boundaries and keep tests and documentation with their behavior.
- Add a separate remote for the destination, then push the current branch and any required default branch/history.
- Do not force-push, delete remote refs, publish releases, or modify the existing GitHub remote.

## Delivery
- Branch: `feat/cybersecurity-edition-read`.
- Destination is currently empty (`git ls-remote` returned no refs).
- User explicitly authorized copying the complete current state, including organizing local changes into commits and pushing the current branch.
- Route: delegated read-only mapping, parent-owned commit and remote delivery, delegated command verification.
- Forecast: one accumulated digest-configuration commit totaling about 400 changed lines, plus tracking evidence.
- Strategy: one bounded commit for the already interleaved keyword, editorial-baseline, and cybersecurity prompt work; a separate tracking commit. The shared tests and product records contain contiguous mixed hunks, so this preserves the verified workspace state without risky source reconstruction. No pull request requested.

## Tasks
- [x] **RC-1 — Map and commit the accumulated local work**
  - Committed the interleaved package keyword catalogs, common editorial exclusions, and cybersecurity prompt precision as one bounded digest-configuration unit.
  - Preserved unrelated local state and excluded `.gitignore` and `.codegraph/`.
  - Commit: `7d5a33929a184ae1e089dafc07a9b106fa3184fb` (`feat(digests): add thematic editorial configuration`).
- [x] **RC-2 — Verify the complete committed state**
  - Independent verification passed 63/63 tests and committed-range whitespace checks.
  - Confirmed the range contains 22 files, 523 additions, and 45 deletions; remaining workspace state is limited to `.gitignore`, `.codegraph/`, and this tracking document.
- [x] **RC-3 — Copy the repository to the authorized SSH destination**
  - Added the non-destructive `infotrash` secondary remote.
  - Pushed the current branch and `main` without rewriting or deleting refs.
  - Independently confirmed both destination refs at the delivered commit.

## Evidence
- 2026-10-08: Commit `7d5a33929a184ae1e089dafc07a9b106fa3184fb` records 22 intended files with 523 additions and 45 deletions. Pre-commit and independent committed-range verification both passed 63/63 tests and whitespace checks; `.gitignore`, `.codegraph/`, and this tracking document remained outside the commit. Native assessment was unavailable because untracked paths require an explicit declaration, so the required independent fallback was used.
- 2026-10-08: Existing `origin` points to `https://github.com/lacrimae0rerum/the-watcher.git`; it was not modified.
- 2026-10-08: Destination `git ls-remote` initially returned no refs. After delivery, independent verification confirmed `refs/heads/main` and `refs/heads/feat/cybersecurity-edition-read` at the delivered local HEAD.
- 2026-10-08: Current branch is `feat/cybersecurity-edition-read` with accumulated tracked and untracked work from three completed local task documents.

## Next step
No repository-copy work remains. Keep `.gitignore` and `.codegraph/` local unless a separate task explicitly authorizes them.
