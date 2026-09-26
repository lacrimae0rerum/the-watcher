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
