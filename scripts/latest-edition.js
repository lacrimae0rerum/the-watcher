#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { selectPackageId } from './package-runtime.js';
import { readLatestEdition } from './edition-store.js';

async function main() {
  const args = process.argv.slice(2);
  let json = false;
  let packageId;
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (flag === '--json' && !json) {
      json = true;
    } else if (flag === '--package' && !packageId && args[index + 1] && !args[index + 1].startsWith('--')) {
      packageId = selectPackageId(['--package', args[++index]]);
    } else {
      throw new Error(`Invalid or duplicate argument: ${flag}`);
    }
  }
  if (!packageId) {
    throw new Error('Usage: node scripts/latest-edition.js --package cybersecurity-digest [--json]');
  }
  const edition = await readLatestEdition(packageId, fileURLToPath(new URL('..', import.meta.url)));
  process.stdout.write(json ? `${JSON.stringify(edition)}\n` : edition.text);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
