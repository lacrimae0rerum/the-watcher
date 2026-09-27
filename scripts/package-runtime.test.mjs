import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  loadDigestPackage,
  resolveArtifactPaths,
  selectPackageId,
  validateDigestPackage,
} from './package-runtime.js';

test('package selection defaults to ai-builders-digest', () => {
  assert.equal(selectPackageId([]), 'ai-builders-digest');
});

test('artifact paths preserve AI Builders root files', () => {
  assert.deepEqual(resolveArtifactPaths('ai-builders-digest', '/repo'), {
    directory: '/repo',
    statePath: '/repo/state-feed.json',
    xFeedPath: '/repo/feed-x.json',
    podcastsFeedPath: '/repo/feed-podcasts.json',
    blogsFeedPath: '/repo/feed-blogs.json',
  });
});

test('artifact paths isolate non-default packages under feeds', () => {
  assert.deepEqual(resolveArtifactPaths('cybersecurity-digest', '/repo'), {
    directory: '/repo/feeds/cybersecurity-digest',
    statePath: '/repo/feeds/cybersecurity-digest/state-feed.json',
    xFeedPath: '/repo/feeds/cybersecurity-digest/feed-x.json',
    podcastsFeedPath: '/repo/feeds/cybersecurity-digest/feed-podcasts.json',
    blogsFeedPath: '/repo/feeds/cybersecurity-digest/feed-blogs.json',
  });
});

test('artifact paths keep sibling package namespaces disjoint', () => {
  const first = resolveArtifactPaths('cybersecurity-digest', '/repo');
  const second = resolveArtifactPaths('engineering-digest', '/repo');

  for (const key of Object.keys(first)) {
    assert.notEqual(first[key], second[key]);
  }
});

test('artifact paths reject invalid IDs before resolving paths', () => {
  for (const id of ['../ai-builders-digest', 'ai/builders', '.', undefined]) {
    assert.throws(() => resolveArtifactPaths(id, '/repo'), /Invalid package ID/);
  }
});

test('package selection accepts one canonical ID among existing channel flags', () => {
  const args = [
    '--tweets-only',
    '--package',
    'cybersecurity-digest',
    '--blogs-only',
  ];

  assert.equal(selectPackageId(args), 'cybersecurity-digest');
  assert.deepEqual(args, [
    '--tweets-only',
    '--package',
    'cybersecurity-digest',
    '--blogs-only',
  ]);
});

test('package selection rejects duplicate selectors', () => {
  assert.throws(
    () =>
      selectPackageId([
        '--package',
        'ai-builders-digest',
        '--package',
        'cybersecurity-digest',
      ]),
    /--package may be specified only once/,
  );
});

test('package selection rejects missing or unusable values', () => {
  for (const args of [
    ['--package'],
    ['--package', ''],
    ['--package', '--tweets-only'],
  ]) {
    assert.throws(
      () => selectPackageId(args),
      /--package requires a canonical package ID/,
    );
  }
});

test('package selection rejects equals-form selectors', () => {
  for (const selector of ['--package=', '--package=ai-builders-digest']) {
    assert.throws(
      () => selectPackageId([selector]),
      /Use --package <canonical-id>/,
    );
  }
});

test('package selection rejects paths, traversal, and non-canonical IDs', () => {
  for (const id of [
    '../ai-builders-digest',
    'ai/builders',
    'ai\\builders',
    '.',
    'AI-Builders',
    'ai_builders',
    '-ai-builders',
    'ai-builders-',
    'ai--builders',
  ]) {
    assert.throws(
      () => selectPackageId(['--package', id]),
      /Invalid package ID/,
    );
  }
});

test('package loader imports the selected thematic package', async () => {
  const packageModule = await loadDigestPackage('ai-builders-digest');

  assert.equal(packageModule.digestPackage.id, 'ai-builders-digest');
});

test('package loader fails closed for an unknown canonical package', async () => {
  await assert.rejects(
    loadDigestPackage('unknown-digest'),
    /Unknown package: unknown-digest/,
  );
});

test('package loader rejects malformed IDs before import resolution', async () => {
  for (const id of ['../ai-builders-digest', undefined, null, 123]) {
    await assert.rejects(loadDigestPackage(id), /Invalid package ID/);
  }
});

test('generator CLI loads the explicitly selected package before collection', () => {
  const result = spawnSync(
    process.execPath,
    [
      fileURLToPath(new URL('./generate-feed.js', import.meta.url)),
      '--package',
      'unknown-digest',
      '--tweets-only',
    ],
    { encoding: 'utf8', env: {} },
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown package: unknown-digest/);
});

test('package validation requires the loaded ID to match the requested ID', () => {
  assert.throws(
    () =>
      validateDigestPackage(
        { digestPackage: { id: 'other-digest' } },
        'requested-digest',
      ),
    /Package ID mismatch: requested requested-digest, loaded other-digest/,
  );
});

test('package validation rejects missing or empty generator exports', () => {
  const validModule = {
    digestPackage: { id: 'test-digest' },
    declaration: 'Test digest declaration',
    runtime: { userAgent: 'Test-Digest/1.0' },
    sources: { catalog: new URL('file:///catalog.json') },
    createCollectors() {},
  };
  const invalidExports = [
    ['declaration', { declaration: '   ' }],
    ['runtime.userAgent', { runtime: {} }],
    ['sources.catalog', { sources: {} }],
    ['createCollectors', { createCollectors: undefined }],
  ];

  for (const [exportName, replacement] of invalidExports) {
    assert.throws(
      () =>
        validateDigestPackage(
          { ...validModule, ...replacement },
          'test-digest',
        ),
      new RegExp(exportName.replace('.', '\\.')),
    );
  }
});
