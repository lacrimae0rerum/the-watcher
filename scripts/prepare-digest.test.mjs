import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { buildPreparationEnvelope } from './package-runtime.js';

const fetchMock = `data:text/javascript,${encodeURIComponent(`
  globalThis.fetch = async (input) => {
    const url = String(input);
    const feeds = {
      'https://raw.githubusercontent.com/lacrimae0rerum/the-watcher/main/feed-x.json': {
        generatedAt: '2026-09-27T11:00:00.000Z',
        x: [{ tweets: [{}, {}] }],
      },
      'https://raw.githubusercontent.com/lacrimae0rerum/the-watcher/main/feed-podcasts.json': {
        generatedAt: '2026-09-27T10:00:00.000Z',
        podcasts: [{ id: 'podcast-1' }],
      },
      'https://raw.githubusercontent.com/lacrimae0rerum/the-watcher/main/feed-blogs.json': {
        generatedAt: '2026-09-27T09:00:00.000Z',
        blogs: [{ id: 'blog-1' }],
      },
    };
    if (feeds[url]) {
      return { ok: true, json: async () => feeds[url] };
    }
    const promptBase = 'https://raw.githubusercontent.com/lacrimae0rerum/the-watcher/main/packages/ai-builders-digest/prompts/';
    if (url.startsWith(promptBase)) {
      return { ok: true, text: async () => \`remote:\${url.slice(promptBase.length)}\` };
    }
    throw new Error(\`Unexpected fetch: \${url}\`);
  };
`)}`;

function runPrepare(args = []) {
  return spawnSync(
    process.execPath,
    [
      '--import',
      fetchMock,
      fileURLToPath(new URL('./prepare-digest.js', import.meta.url)),
      ...args,
    ],
    {
      encoding: 'utf8',
      env: { HOME: '/nonexistent-home' },
      timeout: 10_000,
    },
  );
}

test('preparation envelope omits AI Builders compatibility fields for other packages', () => {
  const preferences = { language: 'en' };
  const content = {
    advisories: [{ id: 'advisory-1' }],
    reports: [],
  };
  const prompts = { digest_intro: 'Summarize material changes.' };
  const errors = ['Source warning'];
  const generatedAt = '2026-09-27T12:00:00.000Z';

  assert.deepEqual(
    buildPreparationEnvelope({
      remix: {
        digest: {
          id: 'cybersecurity-digest',
          declaration: 'Operational cybersecurity updates.',
        },
        preferences,
        content,
        prompts,
      },
      feeds: {},
      errors,
      generatedAt,
    }),
    {
      status: 'ok',
      generatedAt,
      digest: {
        id: 'cybersecurity-digest',
        declaration: 'Operational cybersecurity updates.',
      },
      preferences,
      content,
      stats: {
        channels: { advisories: 1, reports: 0 },
      },
      prompts,
      errors,
    },
  );
});

test('preparation envelope adds generic package data without changing AI Builders fields', () => {
  const preferences = {
    language: 'en',
    frequency: 'daily',
    delivery: { method: 'stdout' },
  };
  const content = {
    x: [{ tweets: [{}, {}] }],
    podcasts: [{ id: 'podcast-1' }, { id: 'podcast-2' }],
    blogs: [{ id: 'blog-1' }],
  };
  const prompts = { digest_intro: 'Write an intro.' };
  const errors = ['Feed warning'];
  const generatedAt = '2026-09-27T12:00:00.000Z';

  const output = buildPreparationEnvelope({
    remix: {
      digest: {
        id: 'ai-builders-digest',
        declaration: 'Follow builders, not influencers.',
      },
      preferences,
      content,
      prompts,
    },
    feeds: {
      x: { generatedAt: '2026-09-27T11:00:00.000Z', x: content.x },
      podcasts: {
        generatedAt: '2026-09-27T10:00:00.000Z',
        podcasts: content.podcasts,
      },
      blogs: {
        generatedAt: '2026-09-27T09:00:00.000Z',
        blogs: content.blogs,
      },
    },
    errors,
    generatedAt,
  });

  assert.deepEqual(output, {
    status: 'ok',
    generatedAt,
    digest: {
      id: 'ai-builders-digest',
      declaration: 'Follow builders, not influencers.',
    },
    preferences,
    content,
    config: preferences,
    podcasts: content.podcasts,
    x: content.x,
    blogs: content.blogs,
    stats: {
      channels: { x: 1, podcasts: 2, blogs: 1 },
      podcastEpisodes: 2,
      xBuilders: 1,
      totalTweets: 2,
      blogPosts: 1,
      feedGeneratedAt: '2026-09-27T11:00:00.000Z',
    },
    prompts,
    errors,
  });
});

test('preparation CLI defaults to AI Builders and accepts its explicit package ID', () => {
  for (const args of [[], ['--package', 'ai-builders-digest']]) {
    const result = runPrepare(args);

    assert.equal(result.error, undefined);
    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(result.stdout);
    assert.equal(output.digest.id, 'ai-builders-digest');
    assert.deepEqual(output.preferences, {
      language: 'en',
      frequency: 'daily',
      delivery: { method: 'stdout' },
    });
    assert.deepEqual(output.content, {
      x: [{ tweets: [{}, {}] }],
      podcasts: [{ id: 'podcast-1' }],
      blogs: [{ id: 'blog-1' }],
    });
    assert.deepEqual(output.stats.channels, {
      x: 1,
      podcasts: 1,
      blogs: 1,
    });
    assert.equal(output.prompts.digest_intro, 'remote:digest-intro.md');
    assert.deepEqual(output.x, output.content.x);
    assert.deepEqual(output.podcasts, output.content.podcasts);
    assert.deepEqual(output.blogs, output.content.blogs);
    assert.equal(output.stats.podcastEpisodes, 1);
    assert.equal(output.stats.xBuilders, 1);
    assert.equal(output.stats.totalTweets, 2);
    assert.equal(output.stats.blogPosts, 1);
    assert.equal(output.stats.feedGeneratedAt, '2026-09-27T11:00:00.000Z');
    assert.equal('errors' in output, false);
  }
});

test('preparation CLI fails closed for an unknown selected package', () => {
  const result = runPrepare(['--package', 'unknown-digest']);

  assert.equal(result.error, undefined);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown package: unknown-digest/);
});
