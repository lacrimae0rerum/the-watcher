# Roadmap

## Migration milestone — independent ownership

| Phase | State | Priority | Dependency | Gate |
| --- | --- | --- | --- | --- |
| TWM-1: feed and prompt URLs (F-02) | done | high | Inherited runtime | Local URL ownership tests passed. |
| TWM-2: identity and records (F-03) | done | high | TWM-1 | Local suite, metadata, syntax, readback, and scoped diff check passed. |
| TWM-3: public repository (F-04) | done | high | TWM-2 | Public non-fork default `main` at initial SHA `f4b3d6ba9330f50a4bf8e1f5e3b3b7741fb96736`; origin matches; all three feeds and five prompts returned HTTP 200 with valid, byte-identical local content. |
| New-repository collection setup (F-05, B-01) | blocked | high | TWM-3, credentials | Configure both missing credentials and observe an operator-approved successful run; no collection or delivery occurred. |

## Cybersecurity pilot — approved later work unit

| Phase | State | Priority | Dependency | Gate |
| --- | --- | --- | --- | --- |
| CSP-1: isolated package and 40-source catalog (F-06) | done | high | F-04, `digest-core` | Offline validator, focused/full tests, syntax and path checks; no remote assets claimed. |
| CSP-2: collection and source management (F-07) | planned | high | CSP-1, operator-approved access | Validate source edits, collector support, failures, and theme-isolated workflow. |
| CSP-3: Spanish edition and two-channel delivery (F-08) | planned | high | CSP-2, model and channel access | Evidence-backed non-empty edition; durable Telegram and X Article delivery verified. |
| CSP-4: three-calendar-day schedule (F-09) | planned | high | CSP-3, first date and opt-in | Noon Europe/Madrid across daylight-saving transitions; no early publication. |

CSP-1 only declares intended URLs. The package's feeds and prompts are not yet
published or generated. No active cybersecurity schedule or dual delivery exists.

## Publication gate
TWM-3 publication and hosted asset checks passed. Operational collection remains
blocked on credentials and a successful run; no active schedule is verified.
