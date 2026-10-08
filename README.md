# The Watcher

The Watcher is a thematic digest pipeline. It collects published content, prepares it for a host language-model agent to summarize, and delivers the resulting edition. JavaScript handles collection, preparation, and delivery; it does **not** run a language model or summarize content automatically.

Two thematic packages are supplied: **AI Builders Digest** (`ai-builders-digest`) has the initial running collection, preparation, and delivery paths for X posts, podcasts, and blogs; **Cybersecurity Digest** (`cybersecurity-digest`) is a local foundation with 40 approved X accounts and empty blog and podcast catalogs. The platform uses reusable `digest-core` interfaces and scripts that accept `--package <id>`. The cybersecurity package has no generated or published feeds or active automation. There is no plugin registry or descriptor-driven collection.

## Preview local evidence (no generation)

From the repository root, inspect the validated source catalog, local feed snapshots, and saved-edition metadata for either package:

```bash
node scripts/preview-digest.js --package ai-builders-digest
node scripts/preview-digest.js --package cybersecurity-digest
node scripts/preview-digest.js --package ai-builders-digest --json
node scripts/preview-digest.js --package cybersecurity-digest --json
```

The preview is read-only and offline. AI Builders uses the legacy root feed files; Cybersecurity uses `feeds/cybersecurity-digest/`. Missing feeds or an edition are reported as missing; malformed feeds are reported per channel. Source counts come from the validated local catalog. Feed timestamps, counts, and errors describe saved snapshots, not freshness or successful live collection. Saved-edition metadata never includes edition text. The command does not collect, prepare, generate, save, deliver, publish, or schedule anything. Invalid catalog/package/arguments fail; there is no API-based preview.

## Prepare a local digest packet (no model or network)

From the repository root, select a package:

```bash
node scripts/prepare-local-digest.js --package ai-builders-digest
node scripts/prepare-local-digest.js --package cybersecurity-digest
```

Omitting `--package` defaults to AI Builders. The command reads only this checkout's package-isolated feed files (AI Builders at the root; Cybersecurity under `feeds/cybersecurity-digest/`), the selected package's local user config, and local prompts. User prompt overrides take priority over bundled package prompts; it never downloads hosted prompts. It emits the existing preparation JSON envelope to stdout. Available feed arrays survive other missing or malformed feeds, which appear in `errors`; malformed config also appears there with defaults applied. If all feeds are missing, invalid, or empty, it exits non-zero with a JSON error on stderr and no packet on stdout. Cybersecurity currently has no local feeds, so its real command fails safely. Feed availability does not prove freshness or evidence quality. A terminal agent must inspect the errors and sources before composing text; this command does not invoke a model, generate an edition, write a file, collect, deliver, publish, or schedule. Saving already written text remains a separate explicit `scripts/save-edition.js` action.

The existing `scripts/prepare-digest.js` is a different reader that fetches remote feeds and prompts; its behavior is unchanged.

## Read or save a local cybersecurity pulse

From the repository root, read the latest **saved** edition on demand:

```bash
node scripts/latest-edition.js --package cybersecurity-digest
# Include stored package, language, generation time, and text as JSON:
node scripts/latest-edition.js --package cybersecurity-digest --json
```

The plain command prints the exact stored text. Until an edition is explicitly saved, it exits with "No saved edition" and creates nothing. To save text that already exists, use a local UTF-8 file:

```bash
node scripts/save-edition.js --package cybersecurity-digest --file /path/to/existing-pulse.txt
```

Saving defaults to language `es` and the actual current UTC time. Use `--language es` and `--generated-at 2026-10-07T12:00:00.000Z` to supply known metadata instead. Both commands require `--package`; this does not change the AI Builders defaults in the existing runtime. The store is local, latest-only, and ignored by Git: it is not an archive or synchronized across clones. An agent in another checkout needs the saved file in that checkout. This does not collect sources, generate text, publish, or schedule a chat message. Cybersecurity source collection and automatic generation/save integration remain pending.

## Editorial baseline

Both themes' bundled digest and source-summary prompts exclude advertising or promotional-only content, trivial content, and engagement bait. They retain substantive, source-verifiable technical or research announcements, including vendor announcements; a podcast ad break alone does not disqualify an otherwise substantive episode. Each theme keeps its own language, output, security, and evidence rules. Future themes must apply the same baseline. These are agent instructions, not a runtime filter or a guarantee that a model follows them. Remote preparation may use a user override first, a hosted prompt second, and a bundled prompt last. Offline preparation uses only a local user override or bundled prompt; neither path activates cybersecurity publication.

## Edit keyword catalogs

Each theme has a static catalog: [AI Builders keywords](packages/ai-builders-digest/config/keywords.yaml) and [Cybersecurity keywords](packages/cybersecurity-digest/config/keywords.yaml). All 15 groups start empty; commented examples are inactive. To add a keyword, replace `Topics: []` with a block list (do not leave `[]` in place):

```yaml
Topics:
  - "example topic"
```

Prefix an entry with `#` to disable that line. To disable a whole group, prefix its key and every entry with `#`. These files are not consumed by the runtime yet. Future matching may prioritize or tag content, but it must never exclude unmatched items. See the [package asset contract](docs/digest-package-portfolio-design.md#4-current-13-file-parity-contract).

## Run an edition manually

Use Node.js 20 (the version used by the collection workflow). Install dependencies in `scripts/`; there is no root npm package.

```bash
git clone https://github.com/lacrimae0rerum/the-watcher.git
cd the-watcher/scripts
npm install
node prepare-digest.js --package ai-builders-digest > /tmp/the-watcher-input.json
```

Give `/tmp/the-watcher-input.json` to your host language-model agent. Ask it to apply the JSON's `prompts` to its `content` and `preferences`, preserve source links, and write **digest text**, not the input JSON, to `/tmp/the-watcher-edition.txt`. Inspect the input's `errors` and available content before composing an edition. Then deliver the text:

```bash
node deliver.js --package ai-builders-digest --file /tmp/the-watcher-edition.txt
```

Delivery defaults to stdout, so this command prints the edition unless you configure Telegram or email. `deliver.js` also accepts `--message "text"` or text on stdin. Do not pipe preparation JSON directly into delivery: that bypasses the agent and sends raw input, not a summary. Reader preparation fetches published feed snapshots; it does not collect live sources.

### Optional agent skill

For a compatible agent that loads local skill directories, install the repository as a skill named `the-watcher` in that agent's skill directory (for example, `~/.claude/skills/the-watcher` for Claude Code). Run `npm install` in that checkout's `scripts/` directory. The included [agent instructions](SKILL.md) can guide an agent through the same prepare → summarize → deliver sequence; the host agent, not these JavaScript scripts, must perform the summarization. Local skill installation does not schedule collection or guarantee unattended delivery.

## Reader configuration and delivery

For AI Builders, place optional preferences in `~/.ai-builders-digest/config.json`:

```json
{
  "language": "en",
  "frequency": "daily",
  "delivery": { "method": "stdout" }
}
```

`frequency` describes a preference; the manual commands do not schedule editions. Without a config file, preparation uses English, daily, and stdout defaults. For cybersecurity Spanish preferences, set `"language": "es"` in `~/.cybersecurity-digest/config.json`; [schema defaults](packages/cybersecurity-digest/config/config-schema.json) are not runtime defaults. For remote preparation, user prompt overrides at `~/.ai-builders-digest/prompts/<filename>.md` take priority over hosted prompts, then bundled files in [the AI Builders package](packages/ai-builders-digest/prompts/). Offline preparation does not consult hosted prompts. See its [configuration schema](packages/ai-builders-digest/config/config-schema.json) for supported fields.

Delivery supports only stdout, Telegram, and email via Resend. To select Telegram, set `"delivery": { "method": "telegram", "chatId": "<chat ID>" }` in the config, and put `TELEGRAM_BOT_TOKEN=<bot token>` in `~/.ai-builders-digest/.env`. Create a Telegram bot and message it first so you can obtain a chat ID. To select email, use `"delivery": { "method": "email", "email": "you@example.com" }` and set `RESEND_API_KEY=<key>` in the same `.env` file. A Resend account/API key and recipient address are required. Keep secrets out of the JSON and out of version control. Neither delivery adapter is needed for stdout. No other messaging channels are implemented by `deliver.js`.

## Collection operator setup

The [GitHub Actions workflow](.github/workflows/generate-feed.yml) collects AI Builders content into `feed-x.json`, `feed-podcasts.json`, `feed-blogs.json`, and `state-feed.json`. Its schedule is **06:17 UTC daily**; manual workflow dispatch offers `all` (default), `tweets-only`, `podcasts-only`, and `blogs-only`. The default all-feeds run needs repository secrets `X_BEARER_TOKEN` (X API) and `POD2TXT_API_KEY` (podcast transcripts). Blog-only collection does not need those two keys. Collection uses the package's [source catalog](packages/ai-builders-digest/config/default-sources.json), not a generic source descriptor dispatch system.

AI Builders snapshots are accessible, but the current repository has no collection credentials configured and no successful refresh has been observed. Snapshot availability is not a freshness guarantee; do not expect daily updated feeds or automatic digest delivery until an operator configures credentials, verifies collection, and separately arranges an agent-driven edition schedule. No workflow run or paid API is required to read the existing snapshots.

## Code and checks

- [`scripts/generate-feed.js`](scripts/generate-feed.js) collects and writes feeds; [`scripts/prepare-digest.js`](scripts/prepare-digest.js) fetches remote snapshots and prompts into JSON; [`scripts/prepare-local-digest.js`](scripts/prepare-local-digest.js) prepares a read-only offline packet; [`scripts/deliver.js`](scripts/deliver.js) accepts edition text and selects the delivery adapter. Each accepts `--package <id>`; the manual example uses AI Builders.
- [`packages/digest-core/`](packages/digest-core/) defines reusable stage interfaces. [`packages/ai-builders-digest/`](packages/ai-builders-digest/) supplies the initial running theme. [`packages/cybersecurity-digest/`](packages/cybersecurity-digest/) supplies the cybersecurity foundation, including its [source catalog](packages/cybersecurity-digest/config/default-sources.json), prompts, and configuration. NaN drafting, Telegram plus X Article publication, and the three-day Europe/Madrid cadence remain planned, not operational.
- From the repository root, run `node --test` for local tests. Tests do not establish remote feed freshness, collection credentials, or successful external delivery.
