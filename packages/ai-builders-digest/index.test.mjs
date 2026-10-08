import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const expectedDeclaration = 'AI builders digest — monitors top AI builders on X and YouTube podcasts, remixes their content into digestible summaries. Follow builders, not influencers.';

test('ai-builders-digest exports its thematic manifest', async () => {
  const {
    config,
    declaration,
    editorialPolicies,
    prompts,
    sources,
  } = await import('./index.js');

  assert.equal(declaration, expectedDeclaration);
  assert.deepEqual(sources.channels, ['x', 'podcasts', 'blogs']);

  const packageDirectory = new URL('./', import.meta.url).href;
  assert.equal(sources.catalog.href.startsWith(packageDirectory), true);
  assert.equal(config.schema.href.startsWith(packageDirectory), true);
  assert.equal(
    Object.values(prompts).every(({ href }) => href.startsWith(packageDirectory)),
    true,
  );

  const sourceCatalog = JSON.parse(await readFile(sources.catalog, 'utf8'));
  assert.ok(sourceCatalog.x_accounts.length > 0);
  assert.ok(sourceCatalog.podcasts.length > 0);
  assert.ok(sourceCatalog.blogs.length > 0);
  const configSchema = JSON.parse(await readFile(config.schema, 'utf8'));
  assert.match(configSchema.description, /ai-builders-digest/);

  assert.deepEqual(Object.keys(prompts), [
    'summarizePodcast',
    'summarizeTweets',
    'summarizeBlogs',
    'digestIntro',
    'translate',
  ]);
  const promptText = await Promise.all(
    Object.values(prompts).map((prompt) => readFile(prompt, 'utf8')),
  );
  assert.equal(promptText.every((text) => text.startsWith('# ')), true);

  assert.deepEqual(editorialPolicies, {
    substantiveContentOnly: true,
    originalSourceLinksRequired: true,
    fabricationAllowed: false,
    tone: 'sharp and conversational',
    mobileFirst: true,
  });
});

for (const file of ['digest-intro.md', 'summarize-tweets.md', 'summarize-blogs.md', 'summarize-podcast.md']) {
  test(`AI Builders ${file} applies the common editorial baseline`, async () => {
    const text = await readFile(new URL(`./prompts/${file}`, import.meta.url), 'utf8');
    assert.match(text, /advertising or promotional-only content/i);
    assert.match(text, /trivial content/i);
    assert.match(text, /engagement bait/i);
    assert.match(text, /substantive, source-verifiable technical or research announcements/i);
    assert.match(text, /vendor/i);
    if (file === 'summarize-podcast.md') assert.match(text, /ad break/i);
  });
}

test('ai-builders-digest ships an empty static keyword catalog', async () => {
  const catalog = await readFile(new URL('./config/keywords.yaml', import.meta.url), 'utf8');
  assert.deepEqual(catalog.split('\n').filter((line) => line && !line.startsWith('#')), [
    'CVEs: []', 'Technologies: []', 'Topics: []', 'Vendors: []', 'CERTs: []',
    'Cyberincidents: []', 'ThreatActors: []', 'Malware: []', 'AttackTechniques: []',
    'VulnerabilityTypes: []', 'DefensiveActions: []', 'Tools: []', 'Sectors: []',
    'Regions: []', 'Regulations: []',
  ]);
});

test('ai-builders-digest owns preparation topology and delivery branding', async () => {
  const { delivery, digestPackage, preparation } = await import('./index.js');

  assert.deepEqual(digestPackage, {
    id: 'ai-builders-digest',
    declaration: expectedDeclaration,
  });
  assert.deepEqual(
    preparation.feeds.map(({ id, contentKey }) => [id, contentKey]),
    [['x', 'x'], ['podcasts', 'podcasts'], ['blogs', 'blogs']],
  );
  assert.equal(
    preparation.feeds.every(({ url }) => url.startsWith('https://')),
    true,
  );
  assert.equal(
    preparation.promptBaseUrl,
    'https://raw.githubusercontent.com/lacrimae0rerum/the-watcher/main/packages/ai-builders-digest/prompts/',
  );
  assert.deepEqual(delivery.email, {
    sender: 'AI Builders Digest <digest@resend.dev>',
    subjectPrefix: 'AI Builders Digest',
    subjectLocale: 'en-US',
    subjectDateOptions: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  });
});

test('ai-builders-digest hosts every live feed and prompt on the-watcher main', async () => {
  const { preparation } = await import('./index.js');
  const base = 'https://raw.githubusercontent.com/lacrimae0rerum/the-watcher/main/';

  assert.deepEqual(
    [...preparation.feeds.map(({ url }) => url), preparation.promptBaseUrl],
    [
      `${base}feed-x.json`,
      `${base}feed-podcasts.json`,
      `${base}feed-blogs.json`,
      `${base}packages/ai-builders-digest/prompts/`,
    ],
  );
});

test('ai-builders-digest resolves canonical user state before the legacy fallback', async () => {
  const { resolveUserFile } = await import('./index.js');
  const home = '/home/ada';
  const canonical = '/home/ada/.ai-builders-digest/config.json';
  const legacy = '/home/ada/.follow-builders/config.json';

  assert.equal(resolveUserFile(home, 'config.json', () => false), canonical);
  assert.equal(resolveUserFile(home, 'config.json', (path) => path === legacy), legacy);
  assert.equal(
    resolveUserFile(home, 'config.json', (path) => [canonical, legacy].includes(path)),
    canonical,
  );
});

test('ai-builders-digest exports its canonical runtime identity', async () => {
  const { runtime } = await import('./index.js');

  assert.deepEqual(runtime, {
    userAgent: 'AI-Builders-Digest/1.0 (feed aggregator)',
  });
});

test('AI Builders collectors normalize X, podcast, and web content through digest-core', async () => {
  const { collectFeed, isContentItem } = await import('../digest-core/index.js');
  const { createCollectors } = await import('./index.js');
  const collectors = createCollectors({
    x: async () => [{
      source: 'x',
      name: 'Ada Builder',
      handle: 'ada',
      bio: 'Builds useful tools.',
      tweets: [{
        id: 'tweet-1',
        text: 'A small interface shipped today.',
        createdAt: '2026-09-26T00:00:00Z',
        url: 'https://x.com/ada/status/tweet-1',
        likes: 7,
        retweets: 2,
        replies: 1,
        isQuote: false,
        quotedTweetId: null,
      }],
    }],
    podcast: async () => [{
      source: 'podcast',
      name: 'Builder Radio',
      title: 'Deep modules',
      guid: 'episode-1',
      url: 'https://www.youtube.com/watch?v=episode-1',
      publishedAt: '2026-09-25T00:00:00Z',
      transcript: 'A deep module hides complexity.',
    }],
    web: async () => [{
      source: 'blog',
      name: 'Builder Journal',
      title: 'Locality wins',
      url: 'https://example.com/locality',
      publishedAt: '2026-09-24T00:00:00Z',
      author: 'Grace Writer',
      description: 'A short description.',
      content: 'Fix behavior once at the shared seam.',
    }],
  });

  const { snapshot } = await collectFeed({
    sources: [
      { id: 'x', type: 'x' },
      { id: 'podcasts', type: 'podcast' },
      { id: 'blogs', type: 'web' },
    ],
    collectors,
    checkpoint: { seen: {} },
    generatedAt: '2026-09-26T01:00:00Z',
  });

  assert.equal(snapshot.items.every(isContentItem), true);
  assert.deepEqual(snapshot.items.map(({ id, kind, source, title, content }) => [
    id, kind, source, title, content,
  ]), [
    ['tweet-1', 'post', 'x', 'Ada Builder', 'A small interface shipped today.'],
    ['episode-1', 'episode', 'podcasts', 'Deep modules', 'A deep module hides complexity.'],
    ['https://example.com/locality', 'article', 'blogs', 'Locality wins', 'Fix behavior once at the shared seam.'],
  ]);
  assert.deepEqual(snapshot.items[0].metadata, {
    channel: 'x',
    handle: 'ada',
    bio: 'Builds useful tools.',
    likes: 7,
    retweets: 2,
    replies: 1,
    isQuote: false,
    quotedTweetId: null,
  });
  assert.equal(snapshot.items[1].metadata.guid, 'episode-1');
  assert.equal(snapshot.items[2].metadata.description, 'A short description.');
});
