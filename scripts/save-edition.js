#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { selectPackageId } from './package-runtime.js';
import { saveEdition } from './edition-store.js';

async function main() {
  const args = process.argv.slice(2);
  const values = {};
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    if (!['--package', '--file', '--language', '--generated-at'].includes(flag) || flag in values ||
        !args[index + 1] || args[index + 1].startsWith('--')) {
      throw new Error(`Invalid or duplicate argument: ${flag}`);
    }
    values[flag] = args[index + 1];
  }
  if (!values['--package'] || !values['--file']) {
    throw new Error('Usage: node scripts/save-edition.js --package cybersecurity-digest --file <text-file> [--language es] [--generated-at ISO-UTC]');
  }
  const packageId = selectPackageId(['--package', values['--package']]);
  const text = await readFile(values['--file'], 'utf8');
  await saveEdition({
    packageId, text,
    language: values['--language'] ?? 'es',
    generatedAt: values['--generated-at'] ?? new Date().toISOString(),
  }, fileURLToPath(new URL('..', import.meta.url)));
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
