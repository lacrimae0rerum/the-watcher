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
