# The Watcher product contract

## Problem and users
Readers want curated digests without maintaining their own collection pipeline.
The repository operator needs an independent home for feeds, prompts, and support.

## Goal
The Watcher is an independent thematic digest platform hosted at
`lacrimae0rerum/the-watcher`. AI Builders Digest is the initial theme.

## Requirements
- The root skill and command use `the-watcher`; the initial digest remains AI Builders Digest.
- The initial theme owns its sources, prompts, editorial rules, and user configuration.
- `digest-core` supplies collection, preparation, and delivery interfaces.
- Existing `~/.ai-builders-digest` configuration and read-only `~/.follow-builders` fallback remain compatible.
- Feeds and prompts are served from the independent repository's `main` branch after publication.

## Constraints and non-goals
Preserve original author credit and history; upstream declared no license.
Do not generalize the workflow to select themes or add a second theme in this migration.
No collection or delivery runs, secret transfers, or checkout moves are part of TWM-2.

## Success criteria
Local naming, install instructions, and metadata agree; tests and structural checks pass.
Public repository availability and working collection remain pending separate verification.
