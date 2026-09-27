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
