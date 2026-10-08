import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const DEFAULT_PACKAGE_ID = 'ai-builders-digest';
const PACKAGE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertCanonicalPackageId(id) {
  if (typeof id !== 'string' || !PACKAGE_ID_PATTERN.test(id)) {
    throw new Error(`Invalid package ID: ${String(id)}`);
  }
}

export function resolveArtifactPaths(id, repositoryRoot) {
  assertCanonicalPackageId(id);
  const directory =
    id === DEFAULT_PACKAGE_ID
      ? repositoryRoot
      : join(repositoryRoot, 'feeds', id);
  return {
    directory,
    statePath: join(directory, 'state-feed.json'),
    xFeedPath: join(directory, 'feed-x.json'),
    podcastsFeedPath: join(directory, 'feed-podcasts.json'),
    blogsFeedPath: join(directory, 'feed-blogs.json'),
  };
}

// Accept already-loaded local evidence; no I/O or edition text escapes this seam.
export function buildEvidencePreview({ packageId, catalog, feeds, edition }) {
  const channels = { x: 'x', podcasts: 'podcasts', blogs: 'blogs' };
  return {
    kind: 'local-evidence-preview',
    packageId,
    sources: {
      x: catalog.x_accounts.length,
      podcasts: catalog.podcasts.length,
      blogs: catalog.blogs.length,
    },
    feeds: Object.fromEntries(Object.entries(channels).map(([channel, field]) => {
      const raw = feeds[channel];
      if (raw == null) return [channel, { status: 'missing' }];
      if (raw instanceof Error) {
        return [channel, { status: 'invalid', error: `Cannot read local ${channel} feed: ${raw.code ?? raw.message}` }];
      }
      try {
        const feed = JSON.parse(raw);
        if (!feed || !Array.isArray(feed[field])) {
          throw new Error(`expected ${field} array`);
        }
        return [channel, {
          status: 'available', generatedAt: feed.generatedAt ?? null,
          count: feed[field].length, errors: Array.isArray(feed.errors) ? feed.errors : [],
        }];
      } catch (error) {
        return [channel, { status: 'invalid', error: `Invalid local ${channel} feed: ${error instanceof SyntaxError ? 'malformed JSON' : error.message}` }];
      }
    })),
    latestEdition: edition instanceof Error
      ? { status: 'invalid', error: edition.message }
      : edition ? { status: 'available', language: edition.language, generatedAt: edition.generatedAt }
        : { status: 'missing' },
  };
}

export function resolveDeliveryRuntime(packageModule, homeDirectory, exists) {
  return {
    configPath: packageModule.resolveUserFile(homeDirectory, 'config.json', exists),
    envPath: packageModule.resolveUserFile(homeDirectory, '.env', exists),
    email: packageModule.delivery.email,
  };
}

export function buildPreparationEnvelope({ remix, feeds, errors, generatedAt }) {
  const legacyAiBuilders = remix.digest.id === DEFAULT_PACKAGE_ID;
  const feedX = feeds.x;
  const feedPodcasts = feeds.podcasts;
  const feedBlogs = feeds.blogs;

  return {
    status: 'ok',
    generatedAt,
    digest: remix.digest,
    preferences: remix.preferences,
    content: remix.content,
    ...(legacyAiBuilders
      ? {
          config: remix.preferences,
          podcasts: remix.content.podcasts,
          x: remix.content.x,
          blogs: remix.content.blogs,
        }
      : {}),
    stats: {
      channels: Object.fromEntries(
        Object.entries(remix.content).map(([channel, items]) => [
          channel,
          Array.isArray(items) ? items.length : 0,
        ]),
      ),
      ...(legacyAiBuilders
        ? {
            podcastEpisodes: feedPodcasts?.podcasts?.length || 0,
            xBuilders: feedX?.x?.length || 0,
            totalTweets: (feedX?.x || []).reduce(
              (sum, account) => sum + account.tweets.length,
              0,
            ),
            blogPosts: feedBlogs?.blogs?.length || 0,
            feedGeneratedAt:
              feedX?.generatedAt ||
              feedPodcasts?.generatedAt ||
              feedBlogs?.generatedAt ||
              null,
          }
        : {}),
    },
    prompts: remix.prompts,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function selectPackageId(args) {
  if (args.some((arg) => arg.startsWith('--package='))) {
    throw new Error('Use --package <canonical-id>');
  }
  const selectors = args.filter((arg) => arg === '--package');
  if (selectors.length > 1) {
    throw new Error('--package may be specified only once');
  }
  const index = args.indexOf('--package');
  if (index === -1) return DEFAULT_PACKAGE_ID;

  const id = args[index + 1];
  if (!id || id.startsWith('--')) {
    throw new Error('--package requires a canonical package ID');
  }
  assertCanonicalPackageId(id);
  return id;
}

export function validateDigestPackage(packageModule, requestedId) {
  const loadedId = packageModule.digestPackage?.id;
  if (loadedId !== requestedId) {
    throw new Error(
      `Package ID mismatch: requested ${requestedId}, loaded ${loadedId}`,
    );
  }

  const checks = [
    [
      'declaration',
      typeof packageModule.declaration === 'string' &&
        packageModule.declaration.trim(),
    ],
    [
      'runtime.userAgent',
      typeof packageModule.runtime?.userAgent === 'string' &&
        packageModule.runtime.userAgent.trim(),
    ],
    [
      'sources.catalog',
      packageModule.sources?.catalog instanceof URL ||
        (typeof packageModule.sources?.catalog === 'string' &&
          packageModule.sources.catalog.trim()),
    ],
    ['createCollectors', typeof packageModule.createCollectors === 'function'],
    [
      'digestPackage.declaration',
      typeof packageModule.digestPackage?.declaration === 'string' &&
        packageModule.digestPackage.declaration.trim(),
    ],
    [
      'prompts',
      packageModule.prompts !== null &&
        typeof packageModule.prompts === 'object' &&
        !Array.isArray(packageModule.prompts),
    ],
    ['preparation.feeds', Array.isArray(packageModule.preparation?.feeds)],
    [
      'preparation.promptBaseUrl',
      typeof packageModule.preparation?.promptBaseUrl === 'string' &&
        packageModule.preparation.promptBaseUrl.trim(),
    ],
    ['resolveUserFile', typeof packageModule.resolveUserFile === 'function'],
    ...['sender', 'subjectPrefix', 'subjectLocale'].map((field) => [
      `delivery.email.${field}`,
      typeof packageModule.delivery?.email?.[field] === 'string' &&
        packageModule.delivery.email[field].trim(),
    ]),
    [
      'delivery.email.subjectDateOptions',
      packageModule.delivery?.email?.subjectDateOptions !== null &&
        typeof packageModule.delivery?.email?.subjectDateOptions === 'object' &&
        !Array.isArray(packageModule.delivery.email.subjectDateOptions),
    ],
  ];
  const invalidExport = checks.find(([, valid]) => !valid)?.[0];
  if (invalidExport) {
    throw new Error(
      `Invalid package ${requestedId}: ${invalidExport} is required`,
    );
  }
  return packageModule;
}

function requireCatalogString(entry, field, location) {
  if (typeof entry[field] !== 'string' || !entry[field].trim()) {
    throw new Error(`Invalid source catalog: ${location}.${field} must be a non-empty string`);
  }
}

function catalogHttpUrl(value, location) {
  let url;
  try {
    url = new URL(value);
  } catch {
    // A relative URL or invalid hostname cannot identify a collection source.
  }
  if (!url || !['http:', 'https:'].includes(url.protocol) || !url.hostname ||
      url.username || url.password || /\s/.test(value)) {
    throw new Error(`Invalid source catalog: ${location} must be an absolute HTTP(S) URL`);
  }
  return url.href;
}

export async function loadSourceCatalog(catalogUrl) {
  const text = await readFile(catalogUrl, 'utf8');
  let catalog;
  try {
    catalog = JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid source catalog: malformed JSON', { cause: error });
    }
    throw error;
  }
  if (catalog === null || typeof catalog !== 'object' || Array.isArray(catalog)) {
    throw new Error('Invalid source catalog: expected a top-level object');
  }
  for (const field of ['x_accounts', 'podcasts', 'blogs']) {
    if (!Array.isArray(catalog[field])) {
      throw new Error(`Invalid source catalog: ${field} must be an array`);
    }
  }
  const handles = new Map();
  const identities = { podcasts: new Map(), blogs: new Map() };
  for (const [channel, fields] of [
    ['x_accounts', ['name', 'handle']],
    ['podcasts', ['name', 'rssUrl', 'url']],
    ['blogs', ['name', 'type', 'indexUrl', 'articleBaseUrl', 'fetchMethod']],
  ]) {
    catalog[channel].forEach((entry, index) => {
      const location = `${channel}[${index}]`;
      if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
        throw new Error(`Invalid source catalog: ${location} must be an object`);
      }
      for (const field of fields) requireCatalogString(entry, field, location);
      if (channel === 'podcasts' || channel === 'blogs') {
        const identityField = channel === 'podcasts' ? 'rssUrl' : 'indexUrl';
        for (const field of channel === 'podcasts'
          ? ['rssUrl', 'url']
          : ['indexUrl', 'articleBaseUrl']) {
          const url = catalogHttpUrl(entry[field], `${location}.${field}`);
          if (field === identityField) {
            if (identities[channel].has(url)) {
              throw new Error(`Invalid source catalog: ${location}.${field} duplicates ${channel}[${identities[channel].get(url)}].${field}`);
            }
            identities[channel].set(url, index);
          }
        }
      }
      if (channel === 'blogs') {
        const supported = {
          'https://www.anthropic.com/engineering': 'https://www.anthropic.com/engineering/',
          'https://claude.com/blog': 'https://claude.com/blog/',
        };
        if (entry.type !== 'scrape' || entry.fetchMethod !== 'http' ||
            supported[entry.indexUrl] !== entry.articleBaseUrl) {
          throw new Error(`Invalid source catalog: ${location} must use a supported scrape target (Anthropic Engineering or Claude Blog, type scrape, fetchMethod http, matching articleBaseUrl)`);
        }
      }
      if (channel === 'x_accounts') {
        if (!/^[A-Za-z0-9_]{1,15}$/.test(entry.handle)) {
          throw new Error(`Invalid source catalog: ${location}.handle must be an X handle (1–15 letters, digits, or underscores)`);
        }
        const key = entry.handle.toLowerCase();
        if (handles.has(key)) {
          throw new Error(`Invalid source catalog: ${location}.handle duplicates x_accounts[${handles.get(key)}].handle`);
        }
        handles.set(key, index);
      }
    });
  }
  return catalog;
}

export async function loadDigestPackage(id) {
  assertCanonicalPackageId(id);
  const packageUrl = new URL(`../packages/${id}/index.js`, import.meta.url);
  if (!existsSync(packageUrl)) {
    throw new Error(`Unknown package: ${id}`);
  }
  return validateDigestPackage(await import(packageUrl), id);
}
