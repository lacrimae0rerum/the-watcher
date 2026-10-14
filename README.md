# The Watcher

The Watcher is a thematic digest pipeline. It collects published content, prepares it for a host language-model agent to summarize, and delivers the resulting edition. JavaScript handles collection, preparation, and delivery. An optional manual NaN command requests a model-generated digest from local evidence. The separate Cybersecurity publication workflow now collects, generates, checks, saves, and deploys editions when their three-day cadence is due.

Two thematic packages are supplied: **AI Builders Digest** (`ai-builders-digest`) has the initial running collection, preparation, and delivery paths for X posts, podcasts, and blogs; **Cybersecurity Digest** (`cybersecurity-digest`) is a local foundation with 40 approved X accounts and empty blog and podcast catalogs. The platform uses reusable `digest-core` interfaces and scripts that accept `--package <id>`. Cybersecurity web publication is enabled; a complete manual live cycle passed, while cron-triggered generation remains unverified. There is no plugin registry or descriptor-driven collection.

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

## Generate a digest with NaN (manual, metered)

Only run this command after inspecting the local packet and approving a paid model call. Provide `NAN_API_KEY` in the current process environment without placing it in command arguments, a file, or chat. For example, use a hidden terminal prompt:

```bash
read -r -s -p 'NaN API key: ' NAN_API_KEY; printf '\n'
export NAN_API_KEY
node scripts/generate-edition.js --package ai-builders-digest
unset NAN_API_KEY
```

Omitting `--package` selects AI Builders; `--package cybersecurity-digest` selects the separate local Cybersecurity feeds. Cybersecurity generation needs usable local feed evidence first; it currently has no checked-in local feeds. The command reads local config and prompts through `prepare-local-digest.js`, sends the complete preparation packet to NaN `deepseek-v4-flash` once, and prints only non-empty digest text to stdout. The request has a ten-minute timeout and no retry. A model response is not proof that links or claims are correct: inspect the text and source links before saving. Errors go to stderr without exposing the key or packet. This path does not read `.env`, write an edition, deliver, publish, or schedule anything.

To persist an approved digest, separately place the reviewed text in a local UTF-8 file and explicitly run `node scripts/save-edition.js --package <canonical-id> --file <existing-text-file>`. The save command is not part of generation.

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

Saving defaults to language `es` and the actual current UTC time. Use `--language es` and `--generated-at 2026-10-07T12:00:00.000Z` to supply known metadata instead. Both commands require `--package`; this does not change the AI Builders defaults in the existing runtime. The store is latest-only and is not an archive. It is ignored by Git, except `editions/cybersecurity-digest/latest.json`, which the publication workflow commits so the schedule knows when the last edition came out; other packages' editions and delivery state stay local to each checkout. This does not collect sources, generate text, publish, or schedule a chat message. The separate publication workflow integrates automatic generation and saving; this manual command does not activate it. Local NaN generation is available only after usable local evidence exists and an operator explicitly authorizes a model call.

## Public web preview

`web/` is a static site that maps every watcher as a node graph and opens each watcher's latest saved edition in a reader. Export the saved editions for it, then open `web/index.html` directly in a browser (no server needed):

```bash
node scripts/export-web-editions.js
```

The export reads `editions/<package>/latest.json` for every `packages/*-digest` package and writes `web/data/editions.js`, which is ignored by Git. Watchers without a saved edition are reported and show an empty state on the site. Edition text becomes structured blocks: only `http(s)` links are kept as links, and items or sections marked `(operador)` or `(operator)`, plus lines that open with an operator-note label such as `Nota de operación:`, are left out of the public page. The Cybersecurity prompt puts operator status under a `## Estado de operación (operador)` heading. A corrupt saved edition stops the export without touching the previous output. When an edition has a `## Resumen` section (the Cybersecurity prompt asks for one), the reader shows that summary first with an index of items; an index entry opens the item's detail card, and the back button or Esc returns to the summary. Items numbered as `**[n] Heading**` also make the summary's `[n]` citations open their card. Editions without a summary show the full list of items. Each watcher has a shareable address such as `web/index.html#cybersecurity-digest`. The export does not generate, save, deploy, or publish anything.

### Link previews

The initial HTML declares Open Graph and X large-image card metadata with absolute HTTPS URLs. `web/social-preview.png` is the shared 1200 × 630 image; `web/social-preview.svg` is its editable source. Regenerate the PNG at the same dimensions after editing the SVG and keep both files together. No runtime image renderer or additional dependency is required. Run `node --test scripts/social-preview.test.mjs` to check the metadata, image dimensions, size, and existing page entry points.

Every watcher uses the same site card: the current `#watcher` navigation is a URL fragment, not a separate server-rendered page. Sharing services must be able to fetch both the HTML and PNG without a browser challenge. Cloudflare can return HTTP 403 to automated clients even when the browser works; missing previews can also remain cached by the sharing service. Check the specific service before changing security rules. These metadata checks do not prove that a service has fetched or refreshed its card.

## Unattended publication check

`scripts/publish-edition.js` is the gate for editions that publish without a human review:

```bash
# Prints due=true or due=false for a workflow step; the reason goes to stderr.
node scripts/publish-edition.js --package cybersecurity-digest --due
# Requires the package's collected feed-x.json; checks, strips internal blocks, saves and exports.
node scripts/publish-edition.js --package cybersecurity-digest --file edition.md
```

An edition is due at or after 12:00 Europe/Madrid once the last saved edition's Madrid date is at least three calendar days earlier, so repeated triggers on the same day do nothing and the hour follows daylight saving time. With no saved edition, it is due at any time from 12:00 in Madrid. A refused edition leaves the cadence unchanged, so the next trigger tries again.

The check reads the edition as the public page would show it, except that it also reads operator-note lines the export would hide, because the text after such a line would still be shown. It refuses an edition without a `## Resumen` summary or numbered items, an item without a number or a `Fuente:` URL, a duplicate number, an item the summary does not cite, a citation to a missing item, or the home directory path of the machine running the check. It also refuses operator status outside the `(operador)` section: operator-note labels such as `Nota de operación`, `Observación de operación`, `Nota operativa` or `Operator status`, headings such as `Estado operativo` or `Estado de la recolección`, sentences saying that podcast or blog channels are not configured, returned nothing or are not included, and the raw collection error formats (`X API:`, `Podcast:`/`Blog:` errors, `… feed problem:`, `Missing local … feed`, `Could not fetch …`, `fetch failed`, `Rate limited`). Notes in other wordings are not recognized. A refused edition exits with status 1 and lists the reasons without the edition text; nothing is saved or exported, so the site keeps the previous edition. A passing edition is saved in Spanish with the run time as its generation time. Before saving, marked `(operador)`/`(operator)` sections and items are removed from the markdown itself: they must not enter the public Git history, not just be hidden on the website. Existing saved editions and historical commits are not rewritten. `--now` replaces the current time for both modes and takes a canonical UTC time with milliseconds, such as `2026-10-16T10:00:00.000Z`.

For Cybersecurity, `--file` also requires a valid, nonempty `feeds/cybersecurity-digest/feed-x.json` from collection:

- Each `Fuente:` URL must exactly match a collected `tweets[].url`.
- Other links must exactly match a collected post URL or an HTTPS link already present in its text. HTTP URLs and URLs containing credentials are not accepted as evidence.
- A missing, invalid or empty feed fails with `Cannot verify links: missing, invalid or empty local X feed`. Unknown sources or links fail without printing their values or changing the saved edition or web data.

This verifies provenance, not the truth of a claim or the safety of a linked destination. It does not follow redirects. A compromised source can still supply a harmful link. The current Cybersecurity gate supports its X-only catalog; adding blogs or podcasts requires extending evidence validation first. `--due` needs no feeds. Other packages and the low-level `checkEdition` API retain structural-only checks unless evidence sets are supplied; the manual `save-edition.js` command remains an explicitly reviewed local save, not an unattended publication gate.

## Automatic publication (Cybersecurity)

`.github/workflows/publish-cybersecurity.yml` publishes the Cybersecurity watcher on its own, with no per-edition review, to `https://custodes-intellegentiae.exdataveritas.com`:

Live status (14 October 2026): [the complete manual run](https://github.com/lacrimae0rerum/the-watcher/actions/runs/38619256699) passed X collection, NaN generation, publication validation, edition commit and Cloudflare deployment. The new Spanish edition contains 12 items; the public edition-data asset returned HTTP 200 and matched the local export byte for byte. The next edition is due on 17 October at 12:00 Europe/Madrid. A cron-triggered generation and a full factual/editorial audit remain unverified. Cloudflare may still challenge other non-browser requests; no security settings were changed.

1. It runs daily at 10:00 and 11:00 UTC, which is 12:00 in Madrid in summer and in winter, and always reads the current `main`. `publish-edition.js --due` decides whether an edition is due, so once an edition is published the remaining runs of that day do nothing; in summer, a refused 10:00 run is tried again at 11:00.
2. When an edition is due, it collects X posts from the last 72 hours (the Cybersecurity package declares this window to match its three-day cadence; X returns at most 5 recent posts per account and up to 3 new ones are kept, so busy accounts cover less), generates the edition with NaN, and runs the publication check. The catalog has no podcasts or blogs, so the run gives the edition request empty podcast and blog feeds instead of missing-feed errors. A refused edition fails the run: nothing is saved or deployed, the site keeps the previous edition, and GitHub notifies the repository owner.
3. A passing edition, without operator-only blocks, is committed as `editions/cybersecurity-digest/latest.json`. Git write authentication is supplied only to that step through an environment-only credential helper; checkout does not persist credentials.
4. A separate deployment job has only `contents: read`. It checks out the exact revision prepared by the first job, also without persisted credentials, exports `web/data/editions.js`, and deploys `web/` as a Cloudflare Workers static-assets site (`wrangler.jsonc`). Cloudflare secrets are provided only to this job's deployment step. Wrangler and its dependencies never share the repository-write job. A scheduled run that is not due does not start deployment.

A manual run (Actions → *The Watcher: Publish Cybersecurity edition* → *Run workflow*) redeploys the site, and publishes when an edition is due; choose `publish: now` to publish a new edition immediately, which restarts the three-day count. A push to `main` that changes `web/`, `editions/`, the exporter or `wrangler.jsonc` redeploys the site. X Article and Telegram delivery are not part of this workflow.

The credentials live only as secrets of the `publication` GitHub environment, which only `main` can use: `X_BEARER_TOKEN`, `NAN_API_KEY`, `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Store them once, before the workflow reaches `main` (its first push already deploys), from a terminal where `gh` is logged in to an account that can administer the repository:

```bash
scripts/setup-publication-secrets.sh
```

The script creates the environment, limits it to `main`, says where to find each value, and reads each one with hidden input; it hands values to `gh secret set` on standard input, never as arguments. Run it again to replace a value: an empty answer keeps the stored one. The Cloudflare token comes from the *Edit Cloudflare Workers* template, limited to your account and the `exdataveritas.com` zone. Remove any existing DNS record for `custodes-intellegentiae.exdataveritas.com` before the first deploy: the Workers custom domain creates its own record and certificate. None of them, and no account identifier, is stored in the repository. This repository's Actions logs are public: the edition text goes to a temporary file instead of the log, and the deploy step shows only Wrangler's result lines, error lines and error codes, with email addresses removed.

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

Delivery defaults to stdout and selects one channel per run. To select Telegram, set `"delivery": { "method": "telegram", "chatId": "<chat ID>" }` in the config, and put `TELEGRAM_BOT_TOKEN=<bot token>` in `~/.ai-builders-digest/.env`. Create a Telegram bot and message it first so you can obtain a chat ID. To select email, use `"delivery": { "method": "email", "email": "you@example.com" }` and set `RESEND_API_KEY=<key>` in the same `.env` file. A Resend account/API key and recipient address are required. Keep secrets out of the JSON and out of version control. Neither delivery adapter is needed for stdout.

For a separately approved Cybersecurity X Article run, set `"delivery": { "method": "x-article", "title": "<reviewed nonempty title>" }` in that package's config. Supply a runtime user-auth `X_ARTICLE_ACCESS_TOKEN` with `tweet.read`, `tweet.write`, and `users.read` scopes. Pass the reviewed plain edition text explicitly to `node scripts/deliver.js --package cybersecurity-digest --file <existing-text-file>`. The adapter posts a DraftJS text draft and then publishes it; no edition is generated or saved by delivery. Its local receipt at `editions/cybersecurity-digest/delivery-state.json` records a hash of the package ID and exact text after observed publish success. A repeat with the same text skips X even if the title changes. Corrupt state stops before network. When X answers with an unexpected status, the error message appends X's documented `type`, `title`, and `detail` fields when present; a field that echoes a credential is omitted. A publish attempt with an uncertain outcome, or a successful publish followed by receipt failure, requires manual reconciliation; do not retry automatically. No credentials, network delivery, live X verification, dual-channel dispatch, or schedule was performed for this local implementation. External publication requires separate approval.

## Collection operator setup

The [GitHub Actions workflow](.github/workflows/generate-feed.yml) collects AI Builders content into `feed-x.json`, `feed-podcasts.json`, `feed-blogs.json`, and `state-feed.json`. Its schedule is **06:17 UTC daily**; manual workflow dispatch offers `all` (default), `tweets-only`, `podcasts-only`, and `blogs-only`. The default all-feeds run needs repository secrets `X_BEARER_TOKEN` (X API) and `POD2TXT_API_KEY` (podcast transcripts). Blog-only collection does not need those two keys. Collection uses the package's [source catalog](packages/ai-builders-digest/config/default-sources.json), not a generic source descriptor dispatch system.

AI Builders snapshots are accessible, but the current repository has no collection credentials configured and no successful refresh has been observed. Snapshot availability is not a freshness guarantee; do not expect daily updated feeds or automatic digest delivery until an operator configures credentials, verifies collection, and separately arranges an agent-driven edition schedule. No workflow run or paid API is required to read the existing snapshots.

## Code and checks

- [`scripts/generate-feed.js`](scripts/generate-feed.js) collects and writes feeds; [`scripts/prepare-digest.js`](scripts/prepare-digest.js) fetches remote snapshots and prompts into JSON; [`scripts/prepare-local-digest.js`](scripts/prepare-local-digest.js) prepares a read-only offline packet; [`scripts/generate-edition.js`](scripts/generate-edition.js) makes an explicit NaN model request without saving; [`scripts/deliver.js`](scripts/deliver.js) accepts edition text and selects the delivery adapter. Each accepts `--package <id>`; the manual example uses AI Builders.
- [`packages/digest-core/`](packages/digest-core/) defines reusable stage interfaces. [`packages/ai-builders-digest/`](packages/ai-builders-digest/) supplies the initial running theme. [`packages/cybersecurity-digest/`](packages/cybersecurity-digest/) supplies the cybersecurity foundation, including its [source catalog](packages/cybersecurity-digest/config/default-sources.json), prompts, and configuration. The local NaN request path passed one live AI Builders call; this does not verify Cybersecurity generation or digest quality. The X Article adapter is implemented and tested with fake transport only; Telegram plus X Article dual delivery remains planned. The web-only three-day Europe/Madrid schedule is enabled but awaits its first observed generation cycle.
- From the repository root, run `node --test` for local tests. Tests do not establish remote feed freshness, collection credentials, or successful external delivery.
