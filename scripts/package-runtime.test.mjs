import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  loadDigestPackage,
  loadSourceCatalog,
  resolveArtifactPaths,
  resolveDeliveryRuntime,
  selectPackageId,
  validateDigestPackage,
} from './package-runtime.js';

test('source catalog loader returns a valid local catalog unchanged', async () => {
  const catalog = await loadSourceCatalog(new URL('./fixtures/source-catalogs/valid.json', import.meta.url));
  assert.equal(catalog.x_accounts[0].handle, 'builder_1');
  assert.equal(catalog.podcasts[0].rssUrl, 'https://example.com/feed.xml');
  assert.equal(catalog.blogs[0].indexUrl, 'https://claude.com/blog');
});

test('source catalog loader reports malformed JSON as an invalid catalog', async () => {
  await assert.rejects(
    loadSourceCatalog(new URL('./fixtures/source-catalogs/invalid-json.json', import.meta.url)),
    /Invalid source catalog: malformed JSON/,
  );
});

test('source catalog loader requires an object with all three arrays', async () => {
  for (const [file, message] of [
    ['null.json', 'expected a top-level object'],
    ['missing-arrays.json', 'blogs must be an array'],
    ['non-array.json', 'podcasts must be an array'],
  ]) {
    await assert.rejects(
      loadSourceCatalog(new URL(`./fixtures/source-catalogs/${file}`, import.meta.url)),
      new RegExp(`Invalid source catalog: ${message}`),
    );
  }
});

test('source catalog loader requires current entry fields and types', async () => {
  for (const [file, field] of [
    ['bad-entry.json', 'x_accounts[0].name'],
    ['bad-podcast.json', 'podcasts[0].rssUrl'],
    ['bad-blog.json', 'blogs[0].fetchMethod'],
  ]) {
    await assert.rejects(
      loadSourceCatalog(new URL(`./fixtures/source-catalogs/${file}`, import.meta.url)),
      (error) => error.message.includes(`Invalid source catalog: ${field} must be a non-empty string`),
    );
  }
});

test('source catalog loader rejects invalid and case-insensitive duplicate X handles', async () => {
  for (const [file, reason] of [
    ['bad-handle.json', 'x_accounts[0].handle must be an X handle'],
    ['duplicate-handle.json', 'x_accounts[1].handle duplicates x_accounts[0].handle'],
  ]) {
    await assert.rejects(
      loadSourceCatalog(new URL(`./fixtures/source-catalogs/${file}`, import.meta.url)),
      (error) => error.message.startsWith(`Invalid source catalog: ${reason}`),
    );
  }
});

test('source catalog loader rejects malformed absolute URLs', async () => {
  await assert.rejects(
    loadSourceCatalog(new URL('./fixtures/source-catalogs/bad-url.json', import.meta.url)),
    /Invalid source catalog: podcasts\[0\]\.rssUrl must be an absolute HTTP\(S\) URL/,
  );
});

test('source catalog loader rejects duplicate podcast RSS and blog index identities', async () => {
  for (const [file, reason] of [
    ['duplicate-podcast.json', 'podcasts[1].rssUrl duplicates podcasts[0].rssUrl'],
    ['duplicate-blog.json', 'blogs[1].indexUrl duplicates blogs[0].indexUrl'],
  ]) {
    await assert.rejects(
      loadSourceCatalog(new URL(`./fixtures/source-catalogs/${file}`, import.meta.url)),
      (error) => error.message === `Invalid source catalog: ${reason}`,
    );
  }
});

test('source catalog loader rejects blog configurations outside the current scrape targets', async () => {
  for (const file of ['unsupported-blog.json', 'unsupported-method.json', 'unsupported-base.json']) {
    await assert.rejects(
      loadSourceCatalog(new URL(`./fixtures/source-catalogs/${file}`, import.meta.url)),
      /Invalid source catalog: blogs\[0\] must use a supported scrape target/,
    );
  }
});

test('source catalog loader accepts a fully empty catalog', async () => {
  assert.deepEqual(
    await loadSourceCatalog(new URL('./fixtures/source-catalogs/empty.json', import.meta.url)),
    { x_accounts: [], podcasts: [], blogs: [] },
  );
});

test('source catalog loader accepts both current package catalogs unchanged', async () => {
  for (const id of ['ai-builders-digest', 'cybersecurity-digest']) {
    const { sources } = await loadDigestPackage(id);
    const catalog = await loadSourceCatalog(sources.catalog);
    assert.ok(catalog.x_accounts.length > 0, `${id} has X accounts`);
    if (id === 'ai-builders-digest') {
      assert.equal(catalog.podcasts.length, 6);
      assert.equal(catalog.blogs.length, 2);
    } else {
      assert.equal(catalog.podcasts.length, 0);
      assert.equal(catalog.blogs.length, 0);
    }
  }
});

test('package selection defaults to ai-builders-digest', () => {
  assert.equal(selectPackageId([]), 'ai-builders-digest');
});

test('delivery runtime uses the selected package user files and email branding', async () => {
  const selected = await loadDigestPackage('ai-builders-digest');
  const runtime = resolveDeliveryRuntime(selected, '/home/reader', () => false);

  assert.deepEqual(runtime, {
    configPath: '/home/reader/.ai-builders-digest/config.json',
    envPath: '/home/reader/.ai-builders-digest/.env',
    email: selected.delivery.email,
  });
  assert.equal(runtime.email.sender, 'AI Builders Digest <digest@resend.dev>');
  assert.equal(runtime.email.subjectPrefix, 'AI Builders Digest');
});

test('delivery runtime keeps AI Builders legacy files when they exist', async () => {
  const selected = await loadDigestPackage('ai-builders-digest');
  const runtime = resolveDeliveryRuntime(
    selected,
    '/home/reader',
    (path) => path.startsWith('/home/reader/.follow-builders/'),
  );

  assert.equal(runtime.configPath, '/home/reader/.follow-builders/config.json');
  assert.equal(runtime.envPath, '/home/reader/.follow-builders/.env');
});

test('delivery runtime isolates sibling files and branding', () => {
  const sibling = {
    resolveUserFile: (home, file) => `${home}/.cybersecurity-digest/${file}`,
    delivery: {
      email: {
        sender: 'Cybersecurity Digest <cyber@resend.dev>',
        subjectPrefix: 'Cybersecurity Digest',
        subjectLocale: 'en-US',
        subjectDateOptions: { year: 'numeric' },
      },
    },
  };

  assert.deepEqual(resolveDeliveryRuntime(sibling, '/home/reader'), {
    configPath: '/home/reader/.cybersecurity-digest/config.json',
    envPath: '/home/reader/.cybersecurity-digest/.env',
    email: sibling.delivery.email,
  });
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

test('package validation rejects missing preparation and delivery exports', () => {
  const validModule = {
    digestPackage: {
      id: 'test-digest',
      declaration: 'Test digest declaration',
    },
    declaration: 'Test digest declaration',
    runtime: { userAgent: 'Test-Digest/1.0' },
    sources: { catalog: new URL('file:///catalog.json') },
    prompts: { digestIntro: new URL('file:///digest-intro.md') },
    preparation: {
      feeds: [],
      promptBaseUrl: 'https://example.com/prompts/',
    },
    resolveUserFile() {},
    createCollectors() {},
    delivery: {
      email: {
        sender: 'Test Digest <test@example.com>',
        subjectPrefix: 'Test Digest',
        subjectLocale: 'en-US',
        subjectDateOptions: { year: 'numeric' },
      },
    },
  };
  const invalidExports = [
    ['digestPackage.declaration', { digestPackage: { id: 'test-digest' } }],
    ['prompts', { prompts: undefined }],
    ['preparation.feeds', { preparation: { feeds: undefined } }],
    [
      'preparation.promptBaseUrl',
      { preparation: { feeds: [], promptBaseUrl: '' } },
    ],
    ['resolveUserFile', { resolveUserFile: undefined }],
    ['delivery.email', { delivery: undefined }],
    [
      'delivery.email.sender',
      { delivery: { email: { ...validModule.delivery.email, sender: '' } } },
    ],
    [
      'delivery.email.subjectPrefix',
      { delivery: { email: { ...validModule.delivery.email, subjectPrefix: '' } } },
    ],
    [
      'delivery.email.subjectLocale',
      { delivery: { email: { ...validModule.delivery.email, subjectLocale: '' } } },
    ],
    [
      'delivery.email.subjectDateOptions',
      { delivery: { email: { ...validModule.delivery.email, subjectDateOptions: null } } },
    ],
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
