# Roadmap

## Migration milestone — independent ownership

| Phase | State | Priority | Dependency | Gate |
| --- | --- | --- | --- | --- |
| TWM-1: feed and prompt URLs (F-02) | done | high | Inherited runtime | Local URL ownership tests passed. |
| TWM-2: identity and records (F-03) | done | high | TWM-1 | Local suite, metadata, syntax, readback, and scoped diff check passed. |
| TWM-3: public repository (F-04) | done | high | TWM-2 | Public non-fork default `main` at initial SHA `f4b3d6ba9330f50a4bf8e1f5e3b3b7741fb96736`; origin matches; all three feeds and five prompts returned HTTP 200 with valid, byte-identical local content. |
| New-repository collection setup (F-05, B-01) | blocked | high | TWM-3, credentials | Configure both missing credentials and observe an operator-approved successful run; no collection or delivery occurred. |

## Later direction
A second thematic package (F-06) and workflow/skill generalization are deferred.
Their requirements and timing are unknown; neither is part of this migration.

## Publication gate
TWM-3 publication and hosted asset checks passed. Operational collection remains
blocked on credentials and a successful run; no active schedule is verified.
