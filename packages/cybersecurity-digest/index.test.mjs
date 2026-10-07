import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { collectFeed, isContentItem } from '../digest-core/index.js';
import { buildPreparationEnvelope, loadDigestPackage, resolveArtifactPaths } from '../../scripts/package-runtime.js';

const base = 'https://raw.githubusercontent.com/lacrimae0rerum/the-watcher/main/';

async function theme() {
  return loadDigestPackage('cybersecurity-digest');
}

test('cybersecurity theme loads through the existing package validator', async () => {
  const loaded = await theme();
  assert.equal(loaded.digestPackage.id, 'cybersecurity-digest');
  assert.equal(loaded.digestPackage.declaration, loaded.declaration);
  assert.deepEqual(loaded.sources.channels, ['x', 'podcasts', 'blogs']);
});

test('catalog keeps generator-compatible arrays and unique X handles', async () => {
  const loaded = await theme();
  const catalog = JSON.parse(await readFile(loaded.sources.catalog, 'utf8'));
  assert.deepEqual(Object.keys(catalog).sort(), ['blogs', 'podcasts', 'x_accounts']);
  for (const channel of ['blogs', 'podcasts', 'x_accounts']) {
    assert.ok(Array.isArray(catalog[channel]), `${channel} must be an array`);
  }
  for (const { name, handle } of catalog.x_accounts) {
    assert.equal(typeof name, 'string');
    assert.match(handle, /^[A-Za-z0-9_]+$/);
  }
  const handles = catalog.x_accounts.map(({ handle }) => handle.toLowerCase());
  assert.equal(new Set(handles).size, handles.length);
});

test('digest-core ships the shared collector used by the cybersecurity theme', async () => {
  const manifest = JSON.parse(await readFile(new URL('../digest-core/package.json', import.meta.url), 'utf8'));
  assert.ok(manifest.files.includes('collection.js'));
});

test('package assets and intended feed URLs belong to this theme, not AI Builders', async () => {
  const loaded = await theme();
  const assets = [loaded.sources.catalog, loaded.config.schema, ...Object.values(loaded.prompts)];
  for (const url of assets) {
    assert.ok(url.href.startsWith(new URL('./', import.meta.url).href));
    assert.ok((await readFile(url, 'utf8')).length > 0);
  }
  assert.deepEqual(loaded.preparation.feeds.map(({ id, contentKey, url }) => [id, contentKey, url]), [
    ['x', 'x', `${base}feeds/cybersecurity-digest/feed-x.json`],
    ['podcasts', 'podcasts', `${base}feeds/cybersecurity-digest/feed-podcasts.json`],
    ['blogs', 'blogs', `${base}feeds/cybersecurity-digest/feed-blogs.json`],
  ]);
  assert.equal(loaded.preparation.promptBaseUrl, `${base}packages/cybersecurity-digest/prompts/`);
  assert.deepEqual(resolveArtifactPaths('cybersecurity-digest', '/repo'), {
    directory: '/repo/feeds/cybersecurity-digest',
    statePath: '/repo/feeds/cybersecurity-digest/state-feed.json',
    xFeedPath: '/repo/feeds/cybersecurity-digest/feed-x.json',
    podcastsFeedPath: '/repo/feeds/cybersecurity-digest/feed-podcasts.json',
    blogsFeedPath: '/repo/feeds/cybersecurity-digest/feed-blogs.json',
  });
  assert.equal(loaded.resolveUserFile('/home/ada', 'config.json', () => true),
    '/home/ada/.cybersecurity-digest/config.json');
  assert.equal(loaded.resolveUserFile('/home/ada', 'prompts/digest-intro.md', () => true),
    '/home/ada/.cybersecurity-digest/prompts/digest-intro.md');
});

test('shared collectors normalize three provider shapes without theme-specific invented metadata', async () => {
  const { createCollectors } = await theme();
  const collectors = createCollectors({
    x: async () => [{ name: 'INCIBE', handle: 'INCIBE', bio: '', tweets: [{
      id: '123', url: 'https://x.com/INCIBE/status/123', createdAt: '2026-10-07T10:00:00Z',
      text: 'A claim requiring corroboration.', likes: 1, retweets: 0, replies: 0,
      isQuote: false, quotedTweetId: null,
    }] }],
    podcast: async () => [{ guid: 'ep-1', title: 'Episode', url: 'https://example.com/ep',
      publishedAt: '2026-10-07T10:00:00Z', transcript: 'A transcript.', name: 'Podcast' }],
    web: async () => [{ title: 'Advisory', url: 'https://example.com/advisory',
      publishedAt: '2026-10-07T10:00:00Z', content: 'Details.', name: 'Blog',
      description: 'Summary.' }],
  });
  const { snapshot } = await collectFeed({
    sources: [{ id: 'x', type: 'x' }, { id: 'podcasts', type: 'podcast' }, { id: 'blogs', type: 'web' }],
    collectors, checkpoint: { seen: {} }, generatedAt: '2026-10-07T11:00:00Z',
  });
  assert.equal(snapshot.items.every(isContentItem), true);
  assert.deepEqual(snapshot.items.map(({ id, kind, source }) => [id, kind, source]), [
    ['123', 'post', 'x'], ['ep-1', 'episode', 'podcasts'],
    ['https://example.com/advisory', 'article', 'blogs'],
  ]);
  assert.equal(snapshot.items[0].metadata.handle, 'INCIBE');
  assert.equal(snapshot.items[1].metadata.guid, 'ep-1');
  assert.equal(snapshot.items[2].metadata.description, 'Summary.');
});

test('preparation envelope has no AI Builders aliases', async () => {
  const loaded = await theme();
  const content = { x: [{ tweets: [] }], podcasts: [], blogs: [] };
  const remix = (await import('../digest-core/index.js')).prepare({
    digestPackage: loaded.digestPackage, preferences: { language: 'es' }, content, prompts: {},
  });
  const output = buildPreparationEnvelope({ remix, feeds: {}, errors: ['Feed unavailable'],
    generatedAt: '2026-10-07T11:00:00Z' });
  assert.deepEqual(output.stats, { channels: { x: 1, podcasts: 0, blogs: 0 } });
  assert.equal(output.digest.id, 'cybersecurity-digest');
  for (const alias of ['config', 'x', 'podcasts', 'blogs']) assert.equal(alias in output, false);
  assert.deepEqual(output.errors, ['Feed unavailable']);
});

test('offline preparation uses isolated URLs and reports unpublished feeds', async () => {
  const fetchMock = `data:text/javascript,${encodeURIComponent(`
    globalThis.fetch = async (input) => {
      const url = String(input);
      if (!url.startsWith('${base}')) throw new Error('Unexpected fetch: ' + url);
      return { ok: false };
    };
  `)}`;
  const run = spawnSync(process.execPath, ['--import', fetchMock,
    fileURLToPath(new URL('../../scripts/prepare-digest.js', import.meta.url)),
    '--package', 'cybersecurity-digest'], {
    encoding: 'utf8', env: { ...process.env, HOME: '/nonexistent-home' }, timeout: 10_000,
  });
  assert.equal(run.status, 0, run.stderr);
  const output = JSON.parse(run.stdout);
  assert.equal(output.digest.id, 'cybersecurity-digest');
  assert.deepEqual(output.content, { x: [], podcasts: [], blogs: [] });
  assert.equal(output.errors.length, 3);
  assert.ok(output.errors.every((error) => /feed/i.test(error)));
  assert.equal('config' in output, false);
  assert.equal('x' in output, false);
});

test('twelve assets contain Spanish, evidence-first editorial guidance and a fictional sample', async () => {
  const directory = new URL('./', import.meta.url);
  const files = (await Promise.all(['.', 'config', 'prompts', 'examples'].map(async (folder) => {
    const entries = await readdir(new URL(`${folder}/`, directory), { withFileTypes: true });
    return entries.filter((entry) => entry.isFile()).map((entry) => `${folder}/${entry.name}`);
  }))).flat();
  assert.equal(files.length, 12);
  const loaded = await theme();
  const schema = JSON.parse(await readFile(loaded.config.schema, 'utf8'));
  assert.equal(schema.properties.language.default, 'es');
  assert.equal(schema.properties.intervalDays.default, 3);
  assert.equal(schema.properties.deliveryTime.default, '12:00');
  assert.equal(schema.properties.timezone.default, 'Europe/Madrid');
  assert.match(schema.properties.intervalDays.description, /not.*schedul/i);
  const promptTexts = await Promise.all(Object.values(loaded.prompts).map((url) => readFile(url, 'utf8')));
  assert.ok(promptTexts.every((text) => text.startsWith('# ') && /Spanish/i.test(text)));
  assert.match(promptTexts.join('\n'), /unconfirmed/i);
  assert.match(promptTexts.join('\n'), /affected versions/i);
  const sample = await readFile(new URL('./examples/sample-digest.md', import.meta.url), 'utf8');
  assert.match(sample, /Ejemplo ficticio/);
  assert.match(sample, /https:\/\/example\.com\//);
  assert.doesNotMatch(sample, /https:\/\/x\.com\//);
});
