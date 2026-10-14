# Known blockers and limitations

Pending credentials and a successful run are operational setup, not a regression. Resolved test defects are recorded below.

| ID | State | Severity | Reproduction or evidence | Expected behavior | Cause / fix / regression check |
| --- | --- | --- | --- | --- | --- |
| B-01 | blocked | high | Public non-fork repository and all three feeds/five prompts are verified; the new repository secret list is empty and no collection run occurred. | Collection succeeds after operator setup. | Publication is done. Configure `X_BEARER_TOKEN` and `POD2TXT_API_KEY`, then observe an operator-approved successful run; no collection regression check exists yet. |

| B-02 | done | low | The full suite failed 142/143 after the publication branch added the saved Cybersecurity edition: the human preview test expected `Latest saved edition: missing`. | Preview tests pass with or without a saved edition and never modify it. | The test read checkout state. It now runs the public CLI in an isolated fixture, asserts exact stdout, empty stderr and exit status, and checks both missing and unchanged saved editions. Focused 7/7 and full 143/143 pass; independent verification passed. |

| B-03 | in_progress | medium | Sharing the site produced no thumbnail; local and deployed HTML had no `og:image`, `og:url`, or X card metadata, and no standalone image asset. | Sharing services can discover a public branded image in the initial HTML. | Added a static 1200 × 630 PNG with editable SVG and Open Graph/X metadata. RED 1/2, GREEN 2/2, full suite 145/145. Deployment and public image checks pending; provider caching and Cloudflare crawler access remain separate verification limits. |

## Boundaries
Repository publication is complete; credential setup remains pending.
No credential values are recorded here.
Registry distribution remains unpublished or unknown; Git installation uses the published repository.
Other defects: unknown.
