import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { buildEvidencePreview } from './package-runtime.js';
import { readLatestEdition, saveEdition } from './edition-store.js';

const catalog = { x_accounts: [{ handle: 'builder' }], podcasts: [{ name: 'Show' }], blogs: [{ name: 'Blog' }] };

test('AI Builders preview reports only local evidence metadata', () => {
  assert.deepEqual(buildEvidencePreview({
    packageId: 'ai-builders-digest', catalog,
    feeds: {
      x: JSON.stringify({ generatedAt: '2026-10-08T00:00:00.000Z', x: [{ tweets: [{ text: 'private post' }] }], errors: ['X unavailable'] }),
      podcasts: JSON.stringify({ generatedAt: '2026-10-07T00:00:00.000Z', podcasts: [] }),
      blogs: JSON.stringify({ generatedAt: '2026-10-06T00:00:00.000Z', blogs: [{ content: 'private article' }] }),
    },
    edition: null,
  }), {
    kind: 'local-evidence-preview', packageId: 'ai-builders-digest',
    sources: { x: 1, podcasts: 1, blogs: 1 },
    feeds: {
      x: { status: 'available', generatedAt: '2026-10-08T00:00:00.000Z', count: 1, errors: ['X unavailable'] },
      podcasts: { status: 'available', generatedAt: '2026-10-07T00:00:00.000Z', count: 0, errors: [] },
      blogs: { status: 'available', generatedAt: '2026-10-06T00:00:00.000Z', count: 1, errors: [] },
    },
    latestEdition: { status: 'missing' },
  });
});

test('cybersecurity preview keeps empty catalog channels and missing feeds distinct', () => {
  const preview = buildEvidencePreview({
    packageId: 'cybersecurity-digest',
    catalog: { x_accounts: Array(40).fill({ handle: 'x' }), podcasts: [], blogs: [] },
    feeds: { x: null, podcasts: null, blogs: null }, edition: null,
  });
  assert.deepEqual(preview.sources, { x: 40, podcasts: 0, blogs: 0 });
  assert.deepEqual(preview.feeds, {
    x: { status: 'missing' }, podcasts: { status: 'missing' }, blogs: { status: 'missing' },
  });
  assert.deepEqual(preview.latestEdition, { status: 'missing' });
});

test('a malformed or unreadable feed does not hide other channels', () => {
  const preview = buildEvidencePreview({
    packageId: 'ai-builders-digest', catalog,
    feeds: { x: '{broken', podcasts: new Error('EACCES'), blogs: JSON.stringify({ blogs: [] }) },
    edition: null,
  });
  assert.deepEqual(preview.feeds.x, { status: 'invalid', error: 'Invalid local x feed: malformed JSON' });
  assert.deepEqual(preview.feeds.podcasts, { status: 'invalid', error: 'Cannot read local podcasts feed: EACCES' });
  assert.deepEqual(preview.feeds.blogs, { status: 'available', generatedAt: null, count: 0, errors: [] });
});

test('saved edition is reported by metadata only and invalid edition stays explicit', () => {
  const input = { packageId: 'cybersecurity-digest', catalog, feeds: {},
    edition: { packageId: 'cybersecurity-digest', language: 'es', generatedAt: '2026-10-07T12:00:00.000Z', text: 'Secret bulletin' } };
  const preview = buildEvidencePreview(input);
  assert.deepEqual(preview.latestEdition, { status: 'available', language: 'es', generatedAt: '2026-10-07T12:00:00.000Z' });
  assert.doesNotMatch(JSON.stringify(preview), /Secret bulletin/);
  assert.deepEqual(buildEvidencePreview({ ...input, edition: new Error('Invalid saved edition for cybersecurity-digest: malformed JSON') }).latestEdition,
    { status: 'invalid', error: 'Invalid saved edition for cybersecurity-digest: malformed JSON' });
});

const command = fileURLToPath(new URL('./preview-digest.js', import.meta.url));
const run = (args, script = command) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', env: {} });

test('CLI emits one local-only JSON object for each package without edition text', () => {
  for (const id of ['ai-builders-digest', 'cybersecurity-digest']) {
    const result = run(['--package', id, '--json']);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.kind, 'local-evidence-preview');
    assert.equal(report.packageId, id);
    assert.deepEqual(Object.keys(report.feeds), ['x', 'podcasts', 'blogs']);
    assert.deepEqual(Object.keys(report.sources), ['x', 'podcasts', 'blogs']);
    assert.equal(result.stderr, '');
    assert.equal('text' in report.latestEdition, false);
  }
});

test('CLI human mode labels evidence with or without a saved edition and leaves it unchanged', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'preview-digest-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await cp(new URL('../packages', import.meta.url), join(root, 'packages'), { recursive: true });
  await mkdir(join(root, 'scripts'));
  for (const name of ['preview-digest.js', 'package-runtime.js', 'edition-store.js', 'package.json']) {
    await cp(new URL(name, import.meta.url), join(root, 'scripts', name));
  }
  const edition = { packageId: 'cybersecurity-digest', language: 'es',
    generatedAt: '2026-10-07T12:00:00.000Z', text: 'Private fixture edition' };
  for (const saved of [false, true]) {
    if (saved) await saveEdition(edition, root);
    const result = run(['--package', edition.packageId], join(root, 'scripts', 'preview-digest.js'));
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, '');
    assert.equal(result.stdout, [
      'Local evidence preview — cybersecurity-digest (not a generated digest)',
      'Validated sources: X 40, podcasts 0, blogs 0',
      'x: missing', 'podcasts: missing', 'blogs: missing',
      `Latest saved edition: ${saved ? 'available; language es; generated 2026-10-07T12:00:00.000Z' : 'missing'}`,
      'No generation or publication occurred.', '',
    ].join('\n'));
    if (saved) assert.deepEqual(await readLatestEdition(edition.packageId, root), edition);
    else await assert.rejects(readLatestEdition(edition.packageId, root), { message: 'No saved edition for cybersecurity-digest' });
  }
});

test('CLI fails closed on invalid, duplicate, unknown, or missing arguments', () => {
  for (const args of [[], ['--json'], ['--package'], ['--package=ai-builders-digest'],
    ['--package', '../escape'], ['--package', 'unknown-digest'],
    ['--package', 'ai-builders-digest', '--json', '--json'],
    ['--package', 'ai-builders-digest', '--bogus'],
    ['--package', 'ai-builders-digest', '--package', 'cybersecurity-digest']]) {
    const result = run(args);
    assert.equal(result.status, 1, `${args}: ${result.stderr}`);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /Usage|Invalid package ID|Unknown package/);
  }
});
