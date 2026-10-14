import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const workflowPath = '.github/workflows/publish-cybersecurity.yml';

test('the publication workflow runs at Madrid noon in both CET and CEST and lets the cadence decide', async () => {
  const workflow = await read(workflowPath);
  assert.match(workflow, /- cron: '0 10 \* \* \*'/);
  assert.match(workflow, /- cron: '0 11 \* \* \*'/);
  assert.match(workflow, /workflow_dispatch:\n {4}inputs:\n {6}publish:/);
  assert.match(workflow, /PUBLISH: \$\{\{ inputs\.publish \}\}\n {8}run: \|\n {10}if \[ "\$PUBLISH" = now \]/);
  assert.doesNotMatch(workflow, /run:[^\n]*\$\{\{ inputs\./);
  assert.match(workflow, /node scripts\/publish-edition\.js --package cybersecurity-digest --due >> "\$GITHUB_OUTPUT"/);
  assert.match(workflow, /concurrency:\n {2}group: publish-cybersecurity\n {2}cancel-in-progress: false/);
});

test('the workflow checks an edition before saving, committing or deploying it', async () => {
  const workflow = await read(workflowPath);
  const order = [
    'node generate-feed.js --package cybersecurity-digest --tweets-only',
    'node scripts/generate-edition.js --package cybersecurity-digest > "$RUNNER_TEMP/edition.md"',
    'node scripts/publish-edition.js --package cybersecurity-digest --file "$RUNNER_TEMP/edition.md"',
    'git add editions/cybersecurity-digest/latest.json',
    'node scripts/export-web-editions.js',
    'wrangler@4.143.1 deploy',
  ].map((step) => workflow.indexOf(step));
  assert.ok(order.every((position, index) => position >= 0 && (index === 0 || position > order[index - 1])), String(order));
});

test('credentials come only from the publication environment and stay out of the repository and logs', async () => {
  const workflow = await read(workflowPath);
  assert.match(workflow, /environment: publication/);
  const secrets = [...workflow.matchAll(/\$\{\{ secrets\.([A-Z_]+) \}\}/g)].map((match) => match[1]).sort();
  assert.deepEqual([...new Set(secrets)], ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_API_TOKEN', 'NAN_API_KEY', 'X_BEARER_TOKEN']);
  assert.doesNotMatch(workflow, /set -x|echo "\$\{\{ secrets/);
  // Wrangler can print the account email on authentication errors; the public log only gets result lines.
  assert.match(workflow, /wrangler@4\.143\.1 deploy > "\$RUNNER_TEMP\/wrangler\.log" 2>&1/);
  assert.match(workflow, /\[email\]/);
  const wrangler = await read('wrangler.jsonc');
  assert.doesNotMatch(wrangler, /account_id|[0-9a-f]{32}/);
});

test('the site is served as static assets on the custom domain without a workers.dev address', async () => {
  const wrangler = JSON.parse((await read('wrangler.jsonc')).replace(/^\s*\/\/.*$/gm, ''));
  assert.deepEqual(wrangler.assets, { directory: './web' });
  assert.deepEqual(wrangler.routes, [{ pattern: 'custodes-intellegentiae.exdataveritas.com', custom_domain: true }]);
  assert.equal(wrangler.workers_dev, false);
  assert.equal(wrangler.preview_urls, false);
  assert.match(await read('web/.assetsignore'), /^\.gitignore$/m);
});

test('Git keeps the latest Cybersecurity edition but not delivery state or other packages', () => {
  const ignored = (path) => spawnSync('git', ['check-ignore', '--no-index', '-q', path], { cwd: root }).status === 0;
  assert.equal(ignored('editions/cybersecurity-digest/latest.json'), false);
  assert.equal(ignored('editions/cybersecurity-digest/delivery-state.json'), true);
  assert.equal(ignored('editions/cybersecurity-digest/.latest-1.tmp'), true);
  assert.equal(ignored('editions/ai-builders-digest/latest.json'), true);
});

test('runs read the current main, install nothing and keep Cloudflare error codes in the log', async () => {
  const workflow = await read(workflowPath);
  // A queued scheduled run would otherwise check out the commit from when it was created.
  assert.match(workflow, /- uses: actions\/checkout@v4\n {8}with:\n {10}ref: main/);
  assert.doesNotMatch(workflow, /npm (?:ci|install)/);
  assert.match(workflow, /\\\[code: \[0-9\]\+\\\]/);
  assert.match(await read('.gitignore'), /^\.wrangler\/$/m);
});

test('deployment runs in a separate read-only job at the prepared revision without persisted Git credentials', async () => {
  const workflow = await read(workflowPath);
  const publish = workflow.match(/^  publish:\n([\s\S]*?)(?=^  deploy:)/m)?.[1];
  const deploy = workflow.match(/^  deploy:\n([\s\S]*)/m)?.[1];
  assert.ok(publish && deploy, 'generation/commit and third-party deployment must use separate jobs');
  assert.match(publish, /permissions:\n {6}contents: write/);
  assert.doesNotMatch(publish, /CLOUDFLARE_|wrangler/);
  assert.match(deploy, /needs: publish/);
  assert.match(deploy, /if: needs\.publish\.outputs\.revision != ''/);
  assert.match(deploy, /permissions:\n {6}contents: read/);
  assert.doesNotMatch(deploy, /contents: write|GH_TOKEN|github\.token|git push/);
  assert.match(deploy, /ref: \$\{\{ needs\.publish\.outputs\.revision \}\}/);
  assert.equal((workflow.match(/persist-credentials: false/g) ?? []).length, 2);
  assert.match(publish, /revision: \$\{\{ steps\.deployment\.outputs\.revision \}\}/);
  assert.match(publish, /id: deployment\n {8}if: github\.event_name != 'schedule' \|\| steps\.due\.outputs\.due == 'true'/);
  assert.match(publish, /echo "revision=\$\(git rev-parse HEAD\)" >> "\$GITHUB_OUTPUT"/);
  const commit = publish.match(/- name: Commit the published edition\n([\s\S]*?)(?=\n {6}- name:)/)?.[1];
  assert.match(commit, /GH_TOKEN: \$\{\{ github\.token \}\}/);
  assert.match(commit, /GIT_CONFIG_KEY_0: credential\.helper/);
  assert.match(commit, /GIT_CONFIG_VALUE_0: '!gh auth git-credential'/);
  assert.doesNotMatch(workflow, /https:\/\/[^\s]*\$\{?GH_TOKEN|git config[^\n]*credential/);
});

test('empty podcast and blog feeds are written only while the catalog has no podcasts or blogs', async () => {
  const workflow = await read(workflowPath);
  const catalog = JSON.parse(await read('packages/cybersecurity-digest/config/default-sources.json'));
  assert.match(workflow, /printf '\{"podcasts":\[\]\}\\n' > feeds\/cybersecurity-digest\/feed-podcasts\.json/);
  assert.match(workflow, /printf '\{"blogs":\[\]\}\\n' > feeds\/cybersecurity-digest\/feed-blogs\.json/);
  assert.deepEqual([catalog.podcasts.length, catalog.blogs.length], [0, 0],
    'collect podcasts and blogs in the workflow before adding them to the catalog');
});
