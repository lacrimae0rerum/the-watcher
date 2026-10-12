import { createHash, randomUUID } from 'node:crypto';
import * as filesystem from 'node:fs/promises';
import { join } from 'node:path';
import { resolveArtifactPaths } from './package-runtime.js';

export function editionIdentity(packageId, text) {
  resolveArtifactPaths(packageId, '.');
  if (typeof text !== 'string' || !text.trim()) throw new Error('Edition text is required');
  return createHash('sha256').update(JSON.stringify([packageId, text])).digest('hex');
}

export function createDeliveryState({ repositoryRoot, fsImpl = filesystem }) {
  function pathFor(packageId, channel) {
    resolveArtifactPaths(packageId, repositoryRoot);
    if (typeof channel !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(channel)) {
      throw new Error('Invalid delivery channel');
    }
    return join(repositoryRoot, 'editions', packageId, 'delivery-state.json');
  }

  async function readState(packageId, path) {
    let raw;
    try {
      raw = await fsImpl.readFile(path, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') return { version: 1, packageId, delivered: {} };
      throw new Error('Cannot read delivery state');
    }
    try {
      const state = JSON.parse(raw);
      if (state?.version !== 1 || state.packageId !== packageId ||
          !state.delivered || typeof state.delivered !== 'object' || Array.isArray(state.delivered) ||
          !Object.entries(state.delivered).every(([channel, hashes]) =>
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(channel) && Array.isArray(hashes) &&
            hashes.every((hash) => typeof hash === 'string' && /^[a-f0-9]{64}$/.test(hash)))) {
        throw new Error('invalid');
      }
      return state;
    } catch {
      throw new Error('Invalid delivery state; manual reconciliation required');
    }
  }

  return {
    async wasDelivered(packageId, channel, identity) {
      const path = pathFor(packageId, channel);
      return (await readState(packageId, path)).delivered[channel]?.includes(identity) ?? false;
    },
    async recordSuccess(packageId, channel, identity) {
      const path = pathFor(packageId, channel);
      if (typeof identity !== 'string' || !/^[a-f0-9]{64}$/.test(identity)) throw new Error('Invalid edition identity');
      const state = await readState(packageId, path);
      const delivered = state.delivered[channel] ?? [];
      if (delivered.includes(identity)) return;
      state.delivered[channel] = [...delivered, identity];
      const directory = join(repositoryRoot, 'editions', packageId);
      const temporary = join(directory, `.delivery-state-${randomUUID()}.tmp`);
      try {
        await fsImpl.mkdir(directory, { recursive: true });
        await fsImpl.writeFile(temporary, JSON.stringify(state), { flag: 'wx' });
        await fsImpl.rename(temporary, path);
      } catch {
        await fsImpl.unlink(temporary).catch(() => {});
        throw new Error('Cannot persist delivery state');
      }
    },
  };
}
