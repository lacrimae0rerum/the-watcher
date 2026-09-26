function requireRecord(value, contract) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${contract} must be an object`);
  }
}

function requireString(value, field, allowEmpty = false) {
  if (typeof value !== 'string' || (!allowEmpty && value.trim() === '')) {
    throw new TypeError(`${field} must be ${allowEmpty ? 'a string' : 'a non-empty string'}`);
  }
  return value;
}

function normalizeDate(value, field, allowNull = false) {
  if (allowNull && value === null) return null;
  requireString(value, field);
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    throw new TypeError(`${field} must be a valid date`);
  }
  return date.toISOString();
}

function normalizeUrl(value) {
  requireString(value, 'ContentItem.url');
  try {
    return new URL(value).href;
  } catch {
    throw new TypeError('ContentItem.url must be an absolute URL');
  }
}

/**
 * Creates a normalized item collected from any digest source.
 */
export function createContentItem(input) {
  requireRecord(input, 'ContentItem');
  const metadata = input.metadata ?? {};
  requireRecord(metadata, 'ContentItem.metadata');

  return Object.freeze({
    id: requireString(input.id, 'ContentItem.id'),
    kind: requireString(input.kind, 'ContentItem.kind'),
    source: requireString(input.source, 'ContentItem.source'),
    title: requireString(input.title, 'ContentItem.title'),
    url: normalizeUrl(input.url),
    publishedAt: normalizeDate(input.publishedAt, 'ContentItem.publishedAt', true),
    content: requireString(input.content, 'ContentItem.content', true),
    author: input.author === null || input.author === undefined
      ? null
      : requireString(input.author, 'ContentItem.author'),
    metadata: Object.freeze({ ...metadata }),
  });
}

export function isContentItem(value) {
  try {
    createContentItem(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates a timestamped collection of normalized content items.
 */
export function createFeedSnapshot(input) {
  requireRecord(input, 'FeedSnapshot');
  if (!Array.isArray(input.items)) {
    throw new TypeError('FeedSnapshot.items must be an array');
  }
  const errors = input.errors ?? [];
  if (!Array.isArray(errors)) {
    throw new TypeError('FeedSnapshot.errors must be an array');
  }

  return Object.freeze({
    generatedAt: normalizeDate(input.generatedAt, 'FeedSnapshot.generatedAt'),
    items: Object.freeze(input.items.map(createContentItem)),
    errors: Object.freeze(errors.map((error) => requireString(error, 'FeedSnapshot.errors[]'))),
  });
}

export function isFeedSnapshot(value) {
  try {
    createFeedSnapshot(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Collects configured sources through source-type adapters.
 */
export async function collectFeed({ sources, collectors, checkpoint, generatedAt }) {
  if (!Array.isArray(sources)) {
    throw new TypeError('collectFeed.sources must be an array');
  }
  requireRecord(collectors, 'collectFeed.collectors');
  requireRecord(checkpoint, 'collectFeed.checkpoint');
  requireRecord(checkpoint.seen, 'collectFeed.checkpoint.seen');

  const nextCheckpoint = JSON.parse(JSON.stringify(checkpoint));
  const items = [];
  const errors = [];
  const normalizedGeneratedAt = normalizeDate(generatedAt, 'collectFeed.generatedAt');

  for (const source of sources) {
    requireRecord(source, 'collectFeed.sources[]');
    const sourceId = requireString(source.id, 'collectFeed.sources[].id');
    const sourceType = requireString(source.type, 'collectFeed.sources[].type');
    try {
      const collector = collectors[sourceType];
      requireRecord(collector, `collectFeed.collectors.${sourceType}`);
      if (typeof collector.collect !== 'function') {
        throw new TypeError(`collectFeed.collectors.${sourceType}.collect must be a function`);
      }

      const collected = await collector.collect(source);
      if (!Array.isArray(collected)) {
        throw new TypeError(`Collector ${sourceType} must return an array`);
      }
      for (const input of collected) {
        const item = createContentItem(input);
        const checkpointId = `${sourceId}:${item.id}`;
        if (Object.hasOwn(nextCheckpoint.seen, checkpointId)) continue;
        items.push(item);
        nextCheckpoint.seen[checkpointId] = normalizedGeneratedAt;
      }
    } catch (error) {
      errors.push(`${sourceId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return {
    snapshot: createFeedSnapshot({
      generatedAt: normalizedGeneratedAt,
      items,
      errors,
    }),
    checkpoint: nextCheckpoint,
  };
}
