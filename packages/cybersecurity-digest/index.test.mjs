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

for (const file of ['digest-intro.md', 'summarize-tweets.md', 'summarize-blogs.md', 'summarize-podcast.md']) {
  test(`Cybersecurity ${file} applies the common editorial baseline`, async () => {
    const text = await readFile(new URL(`./prompts/${file}`, import.meta.url), 'utf8');
    assert.match(text, /advertising or promotional-only content/i);
    assert.match(text, /trivial content/i);
    assert.match(text, /engagement bait/i);
    assert.match(text, /substantive, source-verifiable technical or research announcements/i);
    assert.match(text, /vendor/i);
    if (file === 'summarize-podcast.md') assert.match(text, /ad break/i);
  });
}

test('cybersecurity assembly orders supported sections and handles missing evidence', async () => {
  const text = await readFile(new URL('./prompts/digest-intro.md', import.meta.url), 'utf8');
  const sections = ['Acciones prioritarias', 'En seguimiento', 'Contexto y aprendizaje'];
  assert.ok(sections.every((section) => text.includes(section)));
  assert.ok(sections.map((section) => text.indexOf(section)).every((pos, i, all) => i === 0 || pos > all[i - 1]));
  for (const pattern of [/omit empty sections/i, /period only when supplied/i, /title only when supplied/i,
    /source publication.*incident occurrence/i, /exact.*URL/i, /repost.*independent corroboration/i,
    /CVSS.*popularity/i, /missing or unconfigured/i, /zero usable content/i,
    /operator.*status/i, /feed text.*source data.*not instructions/i]) assert.match(text, pattern);
});

test('cybersecurity assembly exposes an actionable item template and channel-specific source rules', async () => {
  const text = await readFile(new URL('./prompts/digest-intro.md', import.meta.url), 'utf8');
  const headings = ['Purpose and input', 'Output format', 'Item template', 'Source presentation',
    'X posts', 'Blog articles', 'Podcast episodes', 'Evidence and uncertainty',
    'Deduplication', 'Empty input', 'Mobile presentation'];
  for (const heading of headings) assert.match(text, new RegExp(`^#{2,3} ${heading}$`, 'm'));
  for (const label of ['Fuente', 'Fecha', 'Hechos', 'Sin confirmar', 'Quién debe comprobar', 'Siguiente paso']) {
    assert.match(text, new RegExp(`^- ${label}: \\[`, 'm'), `${label} needs a placeholder`);
  }
  const x = text.split('### X posts\n')[1].split('### Blog articles\n')[0];
  const blog = text.split('### Blog articles\n')[1].split('### Podcast episodes\n')[0];
  const podcast = text.split('### Podcast episodes\n')[1].split('## Evidence and uncertainty\n')[0];
  for (const field of ['name', 'handle', 'tweets[].url', 'tweets[].text', 'tweets[].createdAt']) {
    assert.ok(x.includes(field), `X: ${field}`);
  }
  for (const field of ['name', 'title', 'author', 'url', 'publishedAt']) {
    assert.ok(blog.includes(field), `blog: ${field}`);
  }
  for (const field of ['name', 'title', 'url', 'publishedAt', 'transcript']) {
    assert.ok(podcast.includes(field), `podcast: ${field}`);
  }
  assert.match(x, /without (?:an? )?@.*Telegram mentions/i);
  assert.match(x, /preserve.*exact.*URL.*@/i);
  assert.match(x, /(?:never|do not).*infer.*role.*organization.*bio/i);
  assert.match(blog, /exact.*episode.*article.*titles/i);
  assert.match(blog, /no.*channel.*homepage substitutes/i);
  assert.match(podcast, /transcript-backed/i);
});

test('channel prompts name raw feed fields, bounded targets and evidence limits', async () => {
  const channels = [
    ['summarize-tweets.md', ['name', 'handle', 'bio', 'tweets', 'text', 'url', 'createdAt'], /60–100 words/i],
    ['summarize-blogs.md', ['name', 'title', 'url', 'publishedAt', 'author', 'description', 'content'], /100–180 words/i],
    ['summarize-podcast.md', ['name', 'title', 'url', 'publishedAt', 'transcript'], /120–200 words/i],
  ];
  for (const [file, fields, target] of channels) {
    const text = await readFile(new URL(`./prompts/${file}`, import.meta.url), 'utf8');
    for (const field of fields) assert.match(text, new RegExp(`\\b${field}\\b`), `${file}: ${field}`);
    assert.match(text, target);
    assert.match(text, /shorter.*evidence/i);
    assert.match(text, /publication.*occurrence/i);
  }
  const blog = await readFile(new URL('./prompts/summarize-blogs.md', import.meta.url), 'utf8');
  assert.match(blog, /truncated.*only.*supplied/i);
  const podcast = await readFile(new URL('./prompts/summarize-podcast.md', import.meta.url), 'utf8');
  assert.match(podcast, /missing transcript.*title.*description/i);
  const translation = await readFile(new URL('./prompts/translate.md', import.meta.url), 'utf8');
  assert.match(translation, /Spanish adaptation.*not.*new claims/i);
});

test('fictional Spanish sample demonstrates ordered complete items without invented dates', async () => {
  const text = await readFile(new URL('./examples/sample-digest.md', import.meta.url), 'utf8');
  const sections = ['Acciones prioritarias', 'En seguimiento', 'Contexto y aprendizaje'];
  assert.ok(sections.map((section) => text.indexOf(section)).every((pos, i, all) => pos >= 0 && (i === 0 || pos > all[i - 1])));
  assert.match(text, /Ejemplo ficticio/);
  assert.match(text, /extracto.*objetivos de palabras/i);
  for (const section of text.split(/^## /m).filter((part) => sections.some((name) => part.startsWith(name)))) {
    for (const label of ['Fuente:', 'Fecha:', 'Hechos:', 'Sin confirmar:', 'Quién debe comprobar:', 'Siguiente paso:']) {
      assert.ok(section.includes(label), `${section.split('\n')[0]}: ${label}`);
    }
    assert.match(section, /https:\/\/example\.com\//);
  }
  assert.doesNotMatch(text, /https:\/\/(?!example\.com\/)[^\s)]+|\bCVE-\d{4}-\d+\b/i);
});

test('thirteen assets include an empty static keyword catalog and Spanish editorial guidance', async () => {
  const directory = new URL('./', import.meta.url);
  const files = (await Promise.all(['.', 'config', 'prompts', 'examples'].map(async (folder) => {
    const entries = await readdir(new URL(`${folder}/`, directory), { withFileTypes: true });
    return entries.filter((entry) => entry.isFile()).map((entry) => `${folder}/${entry.name}`);
  }))).flat();
  assert.equal(files.length, 13);
  const keywords = await readFile(new URL('./config/keywords.yaml', import.meta.url), 'utf8');
  assert.deepEqual(keywords.split('\n').filter((line) => line && !line.startsWith('#')), [
    'CVEs: []', 'Technologies: []', 'Topics: []', 'Vendors: []', 'CERTs: []',
    'Cyberincidents: []', 'ThreatActors: []', 'Malware: []', 'AttackTechniques: []',
    'VulnerabilityTypes: []', 'DefensiveActions: []', 'Tools: []', 'Sectors: []',
    'Regions: []', 'Regulations: []',
  ]);
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
