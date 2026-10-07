# Features

States distinguish verified publication from pending collection setup.

| ID | Feature | Origin | State | Priority | Dependency | Acceptance |
| --- | --- | --- | --- | --- | --- | --- |
| F-01 | AI Builders Digest theme | Inherited project | done | high | `digest-core` | The package retains its thematic declaration, sources, and prompts. |
| F-02 | Independent feed and prompt URLs | TWM-1 | done | high | F-04 | URLs target `lacrimae0rerum/the-watcher/main`; all three feeds and five prompts returned HTTP 200 with valid, byte-identical local content. |
| F-03 | The Watcher platform identity | TWM-2 | done | high | F-01 | Root skill, command, install directories, workflow display, and scripts metadata agree locally. |
| F-04 | Public standalone GitHub repository | TWM-3 | done | high | F-02, F-03 | Public non-fork `lacrimae0rerum/the-watcher` has default `main`, origin matches, and published `main` starts at verified SHA `f4b3d6ba9330f50a4bf8e1f5e3b3b7741fb96736`; hosted assets pass F-02 checks. |
| F-05 | Scheduled collection in new repository | TWM-3 setup | blocked | high | F-04, operator credentials | Configure `X_BEARER_TOKEN` and `POD2TXT_API_KEY`, then observe an operator-approved successful run; no collection or delivery has occurred. |
| F-06 | Second thematic package | Later decision | proposed | low | F-04 | Scope and acceptance are unknown. |

F-03 local verification: 36/36 tests, three script syntax checks, package/lock name check,
and structural readback passed. Registry publication is unknown.
