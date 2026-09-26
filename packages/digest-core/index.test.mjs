import assert from 'node:assert/strict';
import test from 'node:test';

test('digest-core constructs and validates normalized content contracts', async () => {
  const {
    createContentItem,
    createFeedSnapshot,
    isContentItem,
    isFeedSnapshot,
  } = await import('./index.js');

  const item = createContentItem({
    id: 'article-42',
    kind: 'article',
    source: 'Example Journal',
    title: 'A useful release',
    url: 'https://example.com/articles/42',
    publishedAt: '2026-09-25T12:00:00Z',
    content: 'The release adds a smaller, dependable interface.',
    author: 'A. Writer',
    metadata: { language: 'en' },
  });

  assert.deepEqual(item, {
    id: 'article-42',
    kind: 'article',
    source: 'Example Journal',
    title: 'A useful release',
    url: 'https://example.com/articles/42',
    publishedAt: '2026-09-25T12:00:00.000Z',
    content: 'The release adds a smaller, dependable interface.',
    author: 'A. Writer',
    metadata: { language: 'en' },
  });
  assert.equal(isContentItem(item), true);
  assert.throws(
    () => createContentItem({ ...item, url: 'not-an-absolute-url' }),
    /ContentItem\.url/,
  );

  const snapshot = createFeedSnapshot({
    generatedAt: '2026-09-26T09:30:00Z',
    items: [item],
    errors: ['One source was unavailable.'],
  });

  assert.deepEqual(snapshot, {
    generatedAt: '2026-09-26T09:30:00.000Z',
    items: [item],
    errors: ['One source was unavailable.'],
  });
  assert.equal(isFeedSnapshot(snapshot), true);
  assert.throws(
    () => createFeedSnapshot({ generatedAt: 'invalid', items: [] }),
    /FeedSnapshot\.generatedAt/,
  );
});

test('collectFeed dispatches a source and returns a normalized checkpointed snapshot', async () => {
  const { collectFeed } = await import('./index.js');
  const generatedAt = '2026-09-26T01:00:00Z';

  const result = await collectFeed({
    sources: [{ id: 'demo', type: 'demo' }],
    collectors: {
      demo: {
        collect: async () => [{
          id: '1',
          kind: 'note',
          source: 'demo',
          title: 'Fixture',
          url: 'https://example.com/item',
          publishedAt: '2026-09-26T00:00:00Z',
          content: 'Body',
        }],
      },
    },
    checkpoint: { seen: {} },
    generatedAt,
  });

  assert.deepEqual(result.snapshot, {
    generatedAt: '2026-09-26T01:00:00.000Z',
    items: [{
      id: '1',
      kind: 'note',
      source: 'demo',
      title: 'Fixture',
      url: 'https://example.com/item',
      publishedAt: '2026-09-26T00:00:00.000Z',
      content: 'Body',
      author: null,
      metadata: {},
    }],
    errors: [],
  });
  assert.deepEqual(result.checkpoint, {
    seen: { 'demo:1': '2026-09-26T01:00:00.000Z' },
  });
});

test('collectFeed omits normalized IDs already present in the checkpoint', async () => {
  const { collectFeed } = await import('./index.js');
  const checkpoint = { seen: { 'demo:1': '2026-09-25T00:00:00.000Z' } };

  const result = await collectFeed({
    sources: [{ id: 'demo', type: 'demo' }],
    collectors: {
      demo: {
        collect: async () => [{
          id: '1',
          kind: 'note',
          source: 'demo',
          title: 'Already seen',
          url: 'https://example.com/item',
          publishedAt: null,
          content: 'Duplicate body',
        }],
      },
    },
    checkpoint,
    generatedAt: '2026-09-26T01:00:00Z',
  });

  assert.deepEqual(result.snapshot.items, []);
  assert.deepEqual(result.checkpoint, checkpoint);
});

test('collectFeed records one collector failure without discarding successful items', async () => {
  const { collectFeed } = await import('./index.js');

  const result = await collectFeed({
    sources: [
      { id: 'working', type: 'working' },
      { id: 'broken', type: 'broken' },
    ],
    collectors: {
      working: {
        collect: async () => [{
          id: 'kept',
          kind: 'note',
          source: 'working',
          title: 'Successful item',
          url: 'https://example.com/kept',
          publishedAt: null,
          content: 'Keep this item.',
        }],
      },
      broken: {
        collect: async () => {
          throw new Error('unavailable');
        },
      },
    },
    checkpoint: { seen: {} },
    generatedAt: '2026-09-26T01:00:00Z',
  });

  assert.deepEqual(result.snapshot.items.map(({ id }) => id), ['kept']);
  assert.deepEqual(result.snapshot.errors, ['broken: unavailable']);
  assert.ok(result.checkpoint.seen['working:kept']);
});
