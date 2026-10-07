import { readFile, mkdir, rename, unlink, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { resolveArtifactPaths } from './package-runtime.js';

function editionPath(packageId, repositoryRoot) {
  resolveArtifactPaths(packageId, repositoryRoot); // Use the runtime's canonical ID guard.
  return join(repositoryRoot, 'editions', packageId, 'latest.json');
}

function validateEdition(edition) {
  const validTime = typeof edition?.generatedAt === 'string' &&
    /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(edition.generatedAt) &&
    !Number.isNaN(Date.parse(edition.generatedAt)) &&
    new Date(edition.generatedAt).toISOString() === edition.generatedAt;
  if (!edition || typeof edition !== 'object' || Array.isArray(edition) ||
      typeof edition.language !== 'string' || !/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(edition.language) ||
      !validTime || typeof edition.text !== 'string' || !edition.text.trim()) {
    throw new Error('Invalid edition: language, canonical ISO generatedAt, and nonempty text are required');
  }
}

export async function saveEdition(edition, repositoryRoot) {
  const path = editionPath(edition?.packageId, repositoryRoot);
  validateEdition(edition);
  const directory = join(repositoryRoot, 'editions', edition.packageId);
  const temporary = join(directory, `.latest-${randomUUID()}.tmp`);
  await mkdir(directory, { recursive: true });
  try {
    await writeFile(temporary, JSON.stringify({
      packageId: edition.packageId,
      language: edition.language,
      generatedAt: edition.generatedAt,
      text: edition.text,
    }), { flag: 'wx' });
    await rename(temporary, path);
  } catch (error) {
    await unlink(temporary).catch((cleanupError) => {
      if (cleanupError.code !== 'ENOENT') throw cleanupError;
    });
    throw error;
  }
}

export async function readLatestEdition(packageId, repositoryRoot) {
  const path = editionPath(packageId, repositoryRoot);
  let raw;
  try {
    raw = await readFile(path, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error(`No saved edition for ${packageId}`);
    throw error;
  }
  let edition;
  try {
    edition = JSON.parse(raw);
    validateEdition(edition);
  } catch (error) {
    throw new Error(`Invalid saved edition for ${packageId}: ${error.message}`);
  }
  if (edition.packageId !== packageId) {
    throw new Error(`Saved edition package ID mismatch: expected ${packageId}`);
  }
  return edition;
}
