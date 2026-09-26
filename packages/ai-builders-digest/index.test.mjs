import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const expectedDeclaration = 'AI builders digest — monitors top AI builders on X and YouTube podcasts, remixes their content into digestible summaries. Follow builders, not influencers.';

test('ai-builders-digest exports its thematic manifest', async () => {
  const {
    declaration,
    editorialPolicies,
    prompts,
    sources,
  } = await import('./index.js');

  assert.equal(declaration, expectedDeclaration);
  assert.deepEqual(sources.channels, ['x', 'podcasts', 'blogs']);

  const sourceCatalog = JSON.parse(await readFile(sources.catalog, 'utf8'));
  assert.ok(sourceCatalog.x_accounts.length > 0);
  assert.ok(sourceCatalog.podcasts.length > 0);
  assert.ok(sourceCatalog.blogs.length > 0);

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
    'https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/prompts/',
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
