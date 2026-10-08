import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { buildEvidencePreview } from './package-runtime.js';

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
const run = (args) => spawnSync(process.execPath, [command, ...args], { encoding: 'utf8', env: {} });

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

test('CLI human mode labels evidence and does not claim generation or publication', () => {
  const result = run(['--package', 'cybersecurity-digest']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Local evidence preview — cybersecurity-digest \(not a generated digest\)/);
  assert.match(result.stdout, /No generation or publication occurred\./);
  assert.match(result.stdout, /Latest saved edition: missing/);
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
