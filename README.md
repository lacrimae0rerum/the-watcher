# The Watcher

The Watcher is a thematic digest pipeline. It collects published content, prepares it for a host language-model agent to summarize, and delivers the resulting edition. JavaScript handles collection, preparation, and delivery; it does **not** run a language model or summarize content automatically.

The current thematic package, **AI Builders Digest** (`ai-builders-digest`), covers X posts, podcast episodes, and blog articles. The platform uses reusable `digest-core` collection, preparation, and delivery interfaces. Its scripts accept `--package <id>`, but only `ai-builders-digest` is supplied here. There is no installed portfolio of themes, plugin registry, or descriptor-driven collection.

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

For this theme, place optional preferences in `~/.ai-builders-digest/config.json`:

```json
{
  "language": "en",
  "frequency": "daily",
  "delivery": { "method": "stdout" }
}
```

`frequency` describes a preference; the manual commands do not schedule editions. Without a config file, preparation uses English, daily, and stdout defaults. User prompt overrides at `~/.ai-builders-digest/prompts/<filename>.md` take priority over hosted prompts, which take priority over bundled files in [the package](packages/ai-builders-digest/prompts/). See the [configuration schema](packages/ai-builders-digest/config/config-schema.json) for supported fields.

Delivery supports only stdout, Telegram, and email via Resend. To select Telegram, set `"delivery": { "method": "telegram", "chatId": "<chat ID>" }` in the config, and put `TELEGRAM_BOT_TOKEN=<bot token>` in `~/.ai-builders-digest/.env`. Create a Telegram bot and message it first so you can obtain a chat ID. To select email, use `"delivery": { "method": "email", "email": "you@example.com" }` and set `RESEND_API_KEY=<key>` in the same `.env` file. A Resend account/API key and recipient address are required. Keep secrets out of the JSON and out of version control. Neither delivery adapter is needed for stdout. No other messaging channels are implemented by `deliver.js`.

## Collection operator setup

The [GitHub Actions workflow](.github/workflows/generate-feed.yml) collects AI Builders content into `feed-x.json`, `feed-podcasts.json`, `feed-blogs.json`, and `state-feed.json`. Its schedule is **06:17 UTC daily**; manual workflow dispatch offers `all` (default), `tweets-only`, `podcasts-only`, and `blogs-only`. The default all-feeds run needs repository secrets `X_BEARER_TOKEN` (X API) and `POD2TXT_API_KEY` (podcast transcripts). Blog-only collection does not need those two keys. Collection uses the package's [source catalog](packages/ai-builders-digest/config/default-sources.json), not a generic source descriptor dispatch system.

Hosted snapshots are accessible, but the current repository has no collection credentials configured and no successful refresh has been observed. Snapshot availability is not a freshness guarantee; do not expect daily updated feeds or automatic digest delivery until an operator configures credentials, verifies collection, and separately arranges an agent-driven edition schedule. No workflow run or paid API is required to read the existing snapshots.

## Code and checks

- [`scripts/generate-feed.js`](scripts/generate-feed.js) collects and writes feeds; [`scripts/prepare-digest.js`](scripts/prepare-digest.js) reads snapshots, preferences, and prompts into JSON; [`scripts/deliver.js`](scripts/deliver.js) accepts edition text and selects the delivery adapter. Each accepts `--package ai-builders-digest`.
- [`packages/digest-core/`](packages/digest-core/) defines reusable stage interfaces. [`packages/ai-builders-digest/`](packages/ai-builders-digest/) supplies the present theme's sources, prompts, configuration, and delivery branding.
- From the repository root, run `node --test` for local tests. Tests do not establish remote feed freshness, collection credentials, or successful external delivery.
