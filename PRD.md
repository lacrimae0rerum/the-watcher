# The Watcher product contract

## Problem and users
Readers want curated digests without maintaining their own collection pipeline.
The repository operator needs an independent home for feeds, prompts, and support.

## Goal
The Watcher is an independent thematic digest platform hosted at
`lacrimae0rerum/the-watcher`. AI Builders Digest is the initial theme. A second, locally loadable cybersecurity
package is the approved pilot; it is not an operational publication.

## Requirements
- The root skill and command use `the-watcher`; the initial digest remains AI Builders Digest.
- The initial theme owns its sources, prompts, editorial rules, and user configuration.
- `digest-core` supplies collection, preparation, and delivery interfaces.
- Existing `~/.ai-builders-digest` configuration and read-only `~/.follow-builders` fallback remain compatible.
- Published AI Builders feeds and prompts are served from the independent repository's `main` branch.
- The cybersecurity pilot is a Spanish defensive bulletin using the 40 approved X
  handles in `odd/tasks/cybersecurity-pulse.md`; blogs and podcasts start empty.
  Readers can edit its canonical source catalog directly or ask the agent to edit
  that same file. Items require direct evidence URLs, explicit uncertainty, and
  source-supported defensive actions; social claims alone do not confirm exploitation.
  Bundled cybersecurity guidance orders supported items by action, preserves raw
  source dates and uncertainties, and reports unavailable or empty feeds to the
  operator instead of inventing a bulletin. Lengths are editorial targets, not
  enforced limits; bundled guidance alone does not prove model compliance.
- The requested publication cadence is every three calendar days at 12:00
  Europe/Madrid. Telegram and X Article are the selected channels, and NaN
  `deepseek-v4-flash` is the requested drafting model. These are product requirements,
  not active schedules, selected runtime channels, or verified integrations.
- The cybersecurity package has isolated user files and intended package-owned
  feed and prompt URLs. Its remote assets are not yet generated or published.
- All thematic packages, including future themes, instruct their editorial prompts to
  exclude advertising or promotional-only content, trivial content, and engagement
  bait. Preserve substantive, source-verifiable technical or research announcements,
  including vendor announcements; an ad break alone does not disqualify a podcast.
  Keep each package's language, output, security, and source-evidence rules. This is
  editorial guidance, not a deterministic filter or a guarantee of model compliance.
- Each thematic package, including future themes, has a `config/keywords.yaml` asset
  with 15 editable groups: CVEs, Technologies, Topics, Vendors, CERTs,
  Cyberincidents, ThreatActors, Malware, AttackTechniques, VulnerabilityTypes,
  DefensiveActions, Tools, Sectors, Regions, and Regulations. Initial lists are
  empty; commented examples do not approve active keywords. The catalogs are
  static for now. Future matching may prioritize or tag, but must not exclude
  unmatched items. Runtime parsing and matching require separate implementation.
- An operator can preview either package's local evidence in the terminal, with
  validated source counts, package-isolated feed status, and saved-edition
  metadata only. Missing or malformed local evidence is reported, not generated.
  This read-only offline preview adds no API, model, collection, delivery, or
  publication path. A feed snapshot does not establish freshness.
- A user can ask an agent with access to this checkout and its saved edition file
  for the latest cybersecurity pulse in chat. The agent reads only the saved text;
  a missing edition ends the request without generation or publication. Saving
  an existing edition is an explicit separate action. This local latest-only
  store does not synchronize across clones or schedule chat delivery.

## Constraints and non-goals
Preserve original author credit and history; upstream declared no license.
TWM-2 did not generalize the workflow or add a second theme; the later approved
cybersecurity pilot is a separate work unit. CSP-1 does not change generator,
workflow, preparation, or delivery runtime. No collection, model calls, delivery,
secret transfers, or checkout moves are part of CSP-1. KW-1 adds no runtime
matching, weights, parser, discovery export, or source exclusion. First
publication date and destination/credentials remain unset.

## Success criteria
Local naming, install instructions, and metadata agree; tests and structural checks pass.
AI Builders public asset availability was subsequently verified (F-02/F-04);
working collection remains blocked. CSP-1 succeeds locally when the real validator
loads the cybersecurity package, approved catalog and paths pass offline tests,
and existing AI Builders behavior is preserved. The saved-edition reader is ready for on-demand retrieval after a real edition is
saved; it does not prove that a real edition exists. Live collection, generation,
automatic save integration, Telegram + X Article delivery, and scheduling require
separate verification.
