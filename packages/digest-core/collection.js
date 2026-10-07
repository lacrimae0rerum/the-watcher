function normalizeX(groups, sourceId) {
  return groups.flatMap((group) => group.tweets.map((tweet) => ({
    id: tweet.id,
    kind: 'post',
    source: sourceId,
    title: group.name,
    url: tweet.url,
    publishedAt: tweet.createdAt,
    content: tweet.text,
    author: group.name,
    metadata: {
      channel: 'x',
      handle: group.handle,
      bio: group.bio,
      likes: tweet.likes,
      retweets: tweet.retweets,
      replies: tweet.replies,
      isQuote: tweet.isQuote,
      quotedTweetId: tweet.quotedTweetId,
    },
  })));
}

function normalizePodcasts(episodes, sourceId) {
  return episodes.map((episode) => ({
    id: episode.guid,
    kind: 'episode',
    source: sourceId,
    title: episode.title,
    url: episode.url,
    publishedAt: episode.publishedAt,
    content: episode.transcript,
    author: episode.name,
    metadata: {
      channel: 'podcast',
      name: episode.name,
      guid: episode.guid,
    },
  }));
}

function normalizeWeb(articles, sourceId) {
  return articles.map((article) => ({
    id: article.url,
    kind: 'article',
    source: sourceId,
    title: article.title,
    url: article.url,
    publishedAt: article.publishedAt,
    content: article.content,
    author: article.author || null,
    metadata: {
      channel: 'blog',
      name: article.name,
      description: article.description,
    },
  }));
}

/**
 * Wraps the current provider collectors with shared normalization.
 */
export function createCollectors(providers) {
  return Object.freeze({
    x: Object.freeze({
      collect: async (source) => normalizeX(await providers.x(source), source.id),
    }),
    podcast: Object.freeze({
      collect: async (source) => normalizePodcasts(
        await providers.podcast(source),
        source.id,
      ),
    }),
    web: Object.freeze({
      collect: async (source) => normalizeWeb(await providers.web(source), source.id),
    }),
  });
}
