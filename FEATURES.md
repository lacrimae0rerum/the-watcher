# Features

States distinguish verified publication from pending collection setup.

| ID | Feature | Origin | State | Priority | Dependency | Acceptance |
| --- | --- | --- | --- | --- | --- | --- |
| F-01 | AI Builders Digest theme | Inherited project | done | high | `digest-core` | The package retains its thematic declaration, sources, and prompts. |
| F-02 | Independent feed and prompt URLs | TWM-1 | done | high | F-04 | URLs target `lacrimae0rerum/the-watcher/main`; all three feeds and five prompts returned HTTP 200 with valid, byte-identical local content. |
| F-03 | The Watcher platform identity | TWM-2 | done | high | F-01 | Root skill, command, install directories, workflow display, and scripts metadata agree locally. |
| F-04 | Public standalone GitHub repository | TWM-3 | done | high | F-02, F-03 | Public non-fork `lacrimae0rerum/the-watcher` has default `main`, origin matches, and published `main` starts at verified SHA `f4b3d6ba9330f50a4bf8e1f5e3b3b7741fb96736`; hosted assets pass F-02 checks. |
| F-05 | Scheduled collection in new repository | TWM-3 setup | blocked | high | F-04, operator credentials | Configure `X_BEARER_TOKEN` and `POD2TXT_API_KEY`, then observe an operator-approved successful run; no collection or delivery has occurred. |
| F-06 | Cybersecurity defensive package and approved catalog | Cybersecurity pilot, CSP-1 | done | high | F-04, `digest-core` | Local validator loads the isolated package; exactly 40 approved X handles, empty blogs/podcasts, Spanish editorial assets, offline regression checks; no remote feeds implied. |
| F-07 | Cybersecurity source management and collection | Cybersecurity pilot, CSP-2 | planned | high | F-06, provider credentials and collection validation | User or agent edits one catalog; validator and collector handle malformed, duplicate, unsupported, or empty sources without invented output; workflow selects theme and isolates artifacts. |
| F-08 | Evidence-based Spanish generation and Telegram + X Article publication | Cybersecurity pilot, CSP-3 | planned | high | F-07, model/channel access and approved external checks | NaN `deepseek-v4-flash` drafts both versions from linked evidence; unsupported/empty editions suppressed; durable per-channel state prevents duplicate delivery. |
| F-09 | Three-calendar-day noon Madrid activation | Cybersecurity pilot, CSP-4 | planned | high | F-08, first date and operator opt-in | Three-day intervals remain correct across DST; delivery is inactive until approved verification and activation. |
| F-10 | On-demand latest saved cybersecurity pulse | Cybersecurity pilot, CER-1 | done | high | F-06, a separately supplied real edition | An agent with checkout and saved-file access displays the latest text exactly or reports it missing; local save is explicit and atomic, with no retrieval-time collection, generation, publication, or schedule. No real edition has been saved by this work. |

F-03 local verification: 36/36 tests, three script syntax checks, package/lock name check,
and structural readback passed. Registry publication is unknown.
