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
| CSP-2: local source validation and terminal preview (F-07 partial) | done | high | CSP-1 | CSP-2A validates catalogs; CSP-2B previews package-isolated local evidence. Live collection, provider checks, and theme-isolated workflow remain separate, operator-gated work. |
| CSP-3: Spanish edition and two-channel delivery (F-08) | in_progress | high | CSP-2, model and channel access | Manual NaN request path passes mocked tests; one live AI Builders call succeeded without saving. The X Article adapter and local success receipt passed focused fake-transport tests. Cybersecurity generation and web publication passed the complete manual run `38619256699` on 14 October (12 Spanish items, byte-identical public data). Full digest-quality verification, live X publication and durable Telegram delivery remain unverified. |
| CSP-4 / APB: three-calendar-day web schedule (F-09) | in_progress | high | CSP-2, generation, operator opt-in | Web-only workflow enabled with Madrid/DST checks; complete manual run `38619256699` passed. Next edition due 17 October 2026 at noon Madrid; a cron-triggered generation remains unobserved. |
| APB-5: first web deployment (F-14) | done | high | APB-1–APB-4, publication secrets | Run `38563293486` deployed main `02ccdf2`; HTTPS browser and reader DOM checks passed. X Article and Telegram remain off. |

The following paragraph records the earlier foundation-stage limits; APB status above supersedes its scheduling and web-publication limits.

CSP-1 only declares intended URLs. The package's feeds and prompts are not yet
published or generated. CSP-2's terminal preview reads local evidence; it is not
an API, generation path, collection activation, or publication gate. LAG-1 adds
read-only offline preparation for a terminal agent, but missing cybersecurity
feeds prevent a real packet today. Manual NaN drafting passed one live AI Builders
call; that result does not verify Cybersecurity generation. Explicit saving, dual
delivery, and activation remain separate; no live X delivery, active cybersecurity schedule, or dual
delivery exists.

## Publication gate
TWM-3 repository publication and APB-5 web deployment passed. The web-only Cybersecurity schedule is enabled. Its first complete collection/generation/commit/deploy cycle passed as an authorized manual run `38619256699`; the cron trigger itself remains unobserved. AI Builders collection (F-05, B-01) and Telegram/X Article delivery remain separate. Direct HTTP automation was challenged by Cloudflare (403); browser verification succeeded without security changes.
