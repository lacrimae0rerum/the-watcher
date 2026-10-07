# Known blockers and limitations

No new software defect is confirmed by TWM-2. Do not treat pending setup as a regression.

| ID | State | Severity | Reproduction or evidence | Expected behavior | Cause / fix / regression check |
| --- | --- | --- | --- | --- | --- |
| B-01 | blocked | high | TWM task records the new repository as unpublished and its two credentials as unknown. | Hosted feed and prompt URLs respond after publication; scheduled collection succeeds after setup. | Publish and verify the standalone repository, configure `X_BEARER_TOKEN` and `POD2TXT_API_KEY`, then verify a run. No regression run yet. |

## Boundaries
The repository publication and credential setup belong to TWM-3, not TWM-2.
No credential values are recorded here.
The impact of unpublished registry distribution is limited to installation instructions;
Git installation is the documented path after the new repository is published.
Other defects: unknown.
