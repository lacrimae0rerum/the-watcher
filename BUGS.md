# Known blockers and limitations

Pending credentials and a successful run are operational setup, not a regression. Resolved test defects are recorded below.

| ID | State | Severity | Reproduction or evidence | Expected behavior | Cause / fix / regression check |
| --- | --- | --- | --- | --- | --- |
| B-01 | blocked | high | Public non-fork repository and all three feeds/five prompts are verified; the new repository secret list is empty and no collection run occurred. | Collection succeeds after operator setup. | Publication is done. Configure `X_BEARER_TOKEN` and `POD2TXT_API_KEY`, then observe an operator-approved successful run; no collection regression check exists yet. |

| B-02 | done | low | The full suite failed 142/143 after the publication branch added the saved Cybersecurity edition: the human preview test expected `Latest saved edition: missing`. | Preview tests pass with or without a saved edition and never modify it. | The test read checkout state. It now runs the public CLI in an isolated fixture, asserts exact stdout, empty stderr and exit status, and checks both missing and unchanged saved editions. Focused 7/7 and full 143/143 pass; independent verification passed. |

| B-03 | blocked | medium | Sharing the site produced no thumbnail; the initial HTML lacked image metadata. After deployment, the PNG returns HTTP 200, but a plain HTTP request for the page returns 403 with `cf-mitigated: challenge`. | Sharing services can discover a public branded image in the initial HTML. | Missing asset/metadata fixed in `29daaf7`; run `38569248724` deployed successfully. RED 1/2, GREEN 2/2, full suite 145/145; independent verification passed. Browser confirms deployed OG/X metadata and 1200 × 630 image; public PNG is byte-identical. Actual sharing-service behavior remains unverified pending the user's target application. A Cloudflare challenge may affect crawlers; do not weaken security or claim a specific provider is blocked without evidence. |

| B-04 | done | low | A synthetic private path in a marked operator section passed validation and remained in the saved raw edition, although the web parser hid it. | Internal blocks never enter a newly published edition's public Git record. | Fixed locally: the CLI strips marked operator sections/items before saving. RED observed; full suite 149/149 and independent verification pass. Not deployed; existing editions/history are unchanged. |
| B-05 | done | medium | An edition with an arbitrary uncollected source URL passed the publication gate. | Cybersecurity sources must match collected posts; auxiliary links must occur in the collected evidence. | Fixed locally: fail-closed X-feed provenance checks, refusal-state and compatible-link tests. RED observed; full suite 149/149 and independent verification pass. Not deployed. This does not establish destination safety. |
| B-06 | done | medium | The deployment package tree ran in the same job as a persisted repository-write token. | Third-party deployment code has no repository-write credentials. | Fixed locally: separate read-only deployment job, exact prepared revision, no persisted checkout credentials, and commit-step-only Git authentication. RED observed; workflow checks pass 8/8, full suite 149/149 and independent static verification pass. Not deployed; live authentication/workflow behavior remains unverified. |

## Boundaries
Repository publication is complete; credential setup remains pending.
No credential values are recorded here.
Registry distribution remains unpublished or unknown; Git installation uses the published repository.
Other defects: unknown.
