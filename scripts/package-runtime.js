import { existsSync } from 'node:fs';
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
  ];
  const invalidExport = checks.find(([, valid]) => !valid)?.[0];
  if (invalidExport) {
    throw new Error(
      `Invalid package ${requestedId}: ${invalidExport} is required`,
    );
  }
  return packageModule;
}

export async function loadDigestPackage(id) {
  assertCanonicalPackageId(id);
  const packageUrl = new URL(`../packages/${id}/index.js`, import.meta.url);
  if (!existsSync(packageUrl)) {
    throw new Error(`Unknown package: ${id}`);
  }
  return validateDigestPackage(await import(packageUrl), id);
}
