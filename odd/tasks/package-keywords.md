# Package keyword catalogs

## Goal and scope
Provide editable `config/keywords.yaml` in both existing thematic packages with the 15 approved groups: CVEs, Technologies, Topics, Vendors, CERTs, Cyberincidents, ThreatActors, Malware, AttackTechniques, VulnerabilityTypes, DefensiveActions, Tools, Sectors, Regions, Regulations. Empty lists and commented examples must not activate any keyword. Users can comment individual entries or every line of a group with `#`.

Keywords are intended to prioritize and classify, never exclude unmatched content. This work adds static catalogs and editing instructions only; runtime parsing/ranking is pending. No collection, generation, publication, installs, or API calls. The shared digest-core library needs no catalog. Future thematic packages inherit the asset contract.

## Task
- [x] KW-1 (done): Added catalogs, documented editing and runtime boundary, updated asset contract/tests, and verified the existing suite.

## Routing and checks
Delegated writer: multi-file change. Use Ponytail full. Static config/documentation has no runtime behavior RED requirement; focused asset assertions may be written first. Run `node --test` from repository root and `git diff --check`. No new YAML parser/dependency; structural assertions are not a claim of full YAML parsing. Independently assess the completed candidate and follow native review/verification routing.

## Delivery
Forecast: 150–250 authored diff lines. Strategy: ask-on-risk. Existing branch: feat/cybersecurity-edition-read. Preserve unrelated .gitignore and .codegraph/. No commits or push authorized for this request; commit identity: none.

## Evidence
Read-only exploration confirmed npm `files` already includes config/ in both packages. Cybersecurity has an exact 12-asset test; approved additional YAML changes the current asset contract to 13. Historical completion evidence must remain intact.

## Verification outcome
Both thematic packages contain all 15 empty groups and commented editing instructions. Writer observed two focused asset failures before creating the files, then 15/15 focused checks and 51/51 root tests passed. Independent verifier repeated `node --test`: 51/51 passed, none skipped. `git diff --check` passed for writer, parent spot check, and verifier. YAML validity was inspected structurally, not validated with a YAML parser.

Native review `review-cea455c86222b2cb` approved the implementation candidate and exact acknowledgement completed (authority burned). Four informational findings did not block or open correction; no changes were made for them. Native assessment was unavailable due its untracked declaration requirement, so an independent verifier ran and passed. The unrelated existing .gitignore change was included by the native workspace projection but was not edited by this work. This task-closure record was updated after the implementation review. No commits or publication performed.

## Next step
Populate chosen keywords when authorized. Runtime parsing and prioritization/classification remain pending; the catalogs alone do not affect editions.
