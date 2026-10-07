# Roadmap

## Migration milestone — independent ownership

| Phase | State | Priority | Dependency | Gate |
| --- | --- | --- | --- | --- |
| TWM-1: feed and prompt URLs (F-02) | done | high | Inherited runtime | Local URL ownership tests passed. |
| TWM-2: identity and records (F-03) | done | high | TWM-1 | Local suite, metadata, syntax, readback, and scoped diff check passed. |
| TWM-3: public repository (F-04) | planned | high | TWM-2 | Public standalone `main`, safe history, and hosted endpoint checks. |
| New-repository collection setup (F-05, B-01) | blocked | high | TWM-3, credentials | Configure credentials and observe a successful run. |

## Later direction
A second thematic package (F-06) and workflow/skill generalization are deferred.
Their requirements and timing are unknown; neither is part of this migration.

## Publication gate
Local implementation does not establish public availability.
The owner handles publishing and verifying the independent repository in TWM-3.
