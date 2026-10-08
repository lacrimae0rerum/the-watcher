#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepare } from '../packages/digest-core/index.js';
import { buildPreparationEnvelope, loadDigestPackage, resolveArtifactPaths, selectPackageId } from './package-runtime.js';

const defaults = { language: 'en', frequency: 'daily', delivery: { method: 'stdout' } };

async function optionalFile(path) {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

export async function prepareLocalDigest({ packageId, repositoryRoot, homeDirectory, generatedAt = new Date().toISOString(), readLocalFile = optionalFile }) {
  const { digestPackage, preparation, prompts, resolveUserFile } = await loadDigestPackage(packageId);
  const paths = resolveArtifactPaths(packageId, repositoryRoot);
  const errors = [];
  let config = defaults;
  try {
    const configText = await readLocalFile(resolveUserFile(homeDirectory, 'config.json'));
    if (configText !== null) {
      const parsed = JSON.parse(configText);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('expected an object');
      config = parsed;
    }
  } catch (error) {
    errors.push(`Could not read config: ${error.message}`);
  }

  const feeds = {};
  const content = {};
  for (const feed of preparation.feeds) {
    const path = paths[`${feed.id}FeedPath`];
    if (!path) throw new Error(`No local feed path for ${feed.id}`);
    let raw;
    try {
      raw = await readLocalFile(path);
    } catch (error) {
      errors.push(`Cannot read local ${feed.id} feed: ${error.message}`);
      content[feed.contentKey] = [];
      continue;
    }
    if (raw === null) {
      errors.push(`Missing local ${feed.id} feed`);
      content[feed.contentKey] = [];
      continue;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed[feed.contentKey]) ||
          (feed.id === 'x' && parsed.x.some((account) => !account || !Array.isArray(account.tweets)))) {
        throw new Error(`expected ${feed.contentKey} array${feed.id === 'x' ? ' with tweets arrays' : ''}`);
      }
      feeds[feed.id] = parsed;
      content[feed.contentKey] = parsed[feed.contentKey];
      if (Array.isArray(parsed.errors)) {
        errors.push(...parsed.errors.map((error) => `${feed.problemPrefix}: ${error}`));
      }
    } catch (error) {
      errors.push(`Invalid local ${feed.id} feed: ${error instanceof SyntaxError ? 'malformed JSON' : error.message}`);
      content[feed.contentKey] = [];
    }
  }
  if (Object.values(content).every((items) => items.length === 0)) {
    throw new Error(`No usable local feed content for ${packageId}: ${errors.join('; ')}`);
  }

  const resolvedPrompts = {};
  for (const bundledPrompt of Object.values(prompts)) {
    if (bundledPrompt.protocol !== 'file:') throw new Error('Local preparation requires bundled local prompts');
    const filename = decodeURIComponent(bundledPrompt.pathname.split('/').pop());
    const key = filename.replace(/\.md$/, '').replace(/-/g, '_');
    const userPrompt = await readLocalFile(resolveUserFile(homeDirectory, join('prompts', filename)));
    const bundled = userPrompt ?? await readLocalFile(bundledPrompt);
    if (bundled === null) errors.push(`Could not load prompt: ${filename}`);
    else resolvedPrompts[key] = bundled;
  }
  const remix = prepare({
    digestPackage,
    preferences: {
      language: config.language || defaults.language,
      frequency: config.frequency || defaults.frequency,
      delivery: config.delivery || defaults.delivery,
    },
    content,
    prompts: resolvedPrompts,
  });
  return buildPreparationEnvelope({ remix, feeds, errors, generatedAt });
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 0 && (args.length !== 2 || args[0] !== '--package')) {
    // Keep duplicate-selector errors from the shared parser.
    selectPackageId(args);
    throw new Error('Usage: node scripts/prepare-local-digest.js [--package <canonical-id>]');
  }
  const packageId = selectPackageId(args);
  const packet = await prepareLocalDigest({
    packageId,
    repositoryRoot: fileURLToPath(new URL('..', import.meta.url)),
    homeDirectory: homedir(),
  });
  process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    process.stderr.write(`${JSON.stringify({ status: 'error', message: error.message })}\n`);
    process.exitCode = 1;
  });
}
