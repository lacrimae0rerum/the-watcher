# Features

States describe verified local work, not public availability.

| ID | Feature | Origin | State | Priority | Dependency | Acceptance |
| --- | --- | --- | --- | --- | --- | --- |
| F-01 | AI Builders Digest theme | Inherited project | done | high | `digest-core` | The package retains its thematic declaration, sources, and prompts. |
| F-02 | Independent feed and prompt URLs | TWM-1 | done | high | New repository publication | Local URLs target `lacrimae0rerum/the-watcher/main`; hosted responses await TWM-3. |
| F-03 | The Watcher platform identity | TWM-2 | done | high | F-01 | Root skill, command, install directories, workflow display, and scripts metadata agree locally. |
| F-04 | Public standalone GitHub repository | TWM-3 | planned | high | F-02, F-03 | Public non-fork `main` contains verified content and hosted endpoints respond. |
| F-05 | Scheduled collection in new repository | TWM-3 setup | blocked | high | F-04, operator credentials | Credentials are configured and a collection run succeeds. |
| F-06 | Second thematic package | Later decision | proposed | low | F-04 | Scope and acceptance are unknown. |

F-03 local verification: 36/36 tests, three script syntax checks, package/lock name check,
and structural readback passed. Registry publication is unknown.
