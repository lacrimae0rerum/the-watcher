#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { readLatestEdition } from './edition-store.js';
import { buildEvidencePreview, loadDigestPackage, loadSourceCatalog, resolveArtifactPaths, selectPackageId } from './package-runtime.js';

async function localFeed(path) {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    return error.code === 'ENOENT' ? null : error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  if (args.length !== (json ? 3 : 2) || args[0] !== '--package' || (json && args[2] !== '--json')) {
    throw new Error('Usage: node scripts/preview-digest.js --package <id> [--json]');
  }
  const packageId = selectPackageId(args);
  const selected = await loadDigestPackage(packageId);
  if (new URL(selected.sources.catalog).protocol !== 'file:') {
    throw new Error('Preview requires a local source catalog');
  }
  const catalog = await loadSourceCatalog(selected.sources.catalog);
  const root = fileURLToPath(new URL('..', import.meta.url));
  const paths = resolveArtifactPaths(packageId, root);
  const [x, podcasts, blogs, edition] = await Promise.all([
    localFeed(paths.xFeedPath), localFeed(paths.podcastsFeedPath), localFeed(paths.blogsFeedPath),
    readLatestEdition(packageId, root).catch((error) => {
      if (error.message === `No saved edition for ${packageId}`) return null;
      return error;
    }),
  ]);
  const report = buildEvidencePreview({ packageId, catalog, feeds: { x, podcasts, blogs }, edition });
  if (json) {
    process.stdout.write(`${JSON.stringify(report)}\n`);
    return;
  }
  const lines = [
    `Local evidence preview — ${packageId} (not a generated digest)`,
    `Validated sources: X ${report.sources.x}, podcasts ${report.sources.podcasts}, blogs ${report.sources.blogs}`,
    ...Object.entries(report.feeds).map(([channel, feed]) =>
      `${channel}: ${feed.status}${feed.status === 'available' ? `; generated ${feed.generatedAt ?? 'unknown'}; count ${feed.count}; errors ${feed.errors.length ? feed.errors.join('; ') : 'none'}` : feed.error ? `; ${feed.error}` : ''}`),
    `Latest saved edition: ${report.latestEdition.status}${report.latestEdition.status === 'available' ? `; language ${report.latestEdition.language}; generated ${report.latestEdition.generatedAt}` : report.latestEdition.error ? `; ${report.latestEdition.error}` : ''}`,
    'No generation or publication occurred.',
  ];
  process.stdout.write(`${lines.join('\n')}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
