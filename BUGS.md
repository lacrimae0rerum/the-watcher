# Known blockers and limitations

No new software defect is confirmed by the migration. Pending credentials and a successful run are operational setup, not a regression.

| ID | State | Severity | Reproduction or evidence | Expected behavior | Cause / fix / regression check |
| --- | --- | --- | --- | --- | --- |
| B-01 | blocked | high | Public non-fork repository and all three feeds/five prompts are verified; the new repository secret list is empty and no collection run occurred. | Collection succeeds after operator setup. | Publication is done. Configure `X_BEARER_TOKEN` and `POD2TXT_API_KEY`, then observe an operator-approved successful run; no collection regression check exists yet. |

## Boundaries
Repository publication is complete; credential setup remains pending.
No credential values are recorded here.
Registry distribution remains unpublished or unknown; Git installation uses the published repository.
Other defects: unknown.
