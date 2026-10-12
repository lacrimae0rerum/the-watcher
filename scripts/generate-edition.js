#!/usr/bin/env node
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { prepareLocalDigest } from './prepare-local-digest.js';
import { selectPackageId } from './package-runtime.js';

const endpoint = 'https://api.nan.builders/v1/chat/completions';

function providerError(response, body, apiKey, packet) {
  const packetText = JSON.stringify(packet);
  const fields = [body?.error?.type, body?.error?.code]
    .filter((value) => typeof value === 'string' && /^[a-zA-Z0-9_.-]{1,64}$/.test(value) &&
      !value.includes(apiKey) && !apiKey.includes(value) && !packetText.includes(value));
  const status = Number.isInteger(response.status) && response.status >= 100 && response.status <= 599
    ? response.status : 'unknown';
  return new Error(`NaN provider error (${status}${fields.length ? `: ${fields.join(', ')}` : ''})`);
}

export async function generateEdition({ packageId, repositoryRoot, homeDirectory, apiKey = process.env.NAN_API_KEY,
  fetchImpl = fetch, generatedAt, readLocalFile } = {}) {
  if (!apiKey) throw new Error('NAN_API_KEY is required');
  let packet;
  try {
    packet = await prepareLocalDigest({ packageId, repositoryRoot, homeDirectory, generatedAt, readLocalFile });
  } catch (error) {
    if (error.message === `Unknown package: ${packageId}`) throw error;
    throw new Error('Cannot prepare local digest');
  }
  let response;
  try {
    response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: 'Apply the packet prompts to its content and preferences. Preserve source links. Output only final digest text.' },
          { role: 'user', content: JSON.stringify(packet) },
        ],
        max_tokens: 8192,
        stream: false,
      }),
      signal: AbortSignal.timeout(600_000),
    });
  } catch (error) {
    throw new Error(error?.name === 'TimeoutError' || error?.name === 'AbortError'
      ? 'NaN request timed out' : 'NaN network request failed');
  }
  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error('Invalid NaN response');
  }
  if (!response.ok) throw providerError(response, body, apiKey, packet);
  const text = body?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error('Invalid NaN response: missing digest text');
  return text;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 0 && (args.length !== 2 || args[0] !== '--package')) {
    selectPackageId(args);
    throw new Error('Usage: node scripts/generate-edition.js [--package <canonical-id>]');
  }
  const packageId = selectPackageId(args);
  const text = await generateEdition({
    packageId,
    repositoryRoot: fileURLToPath(new URL('..', import.meta.url)),
    homeDirectory: homedir(),
  });
  process.stdout.write(`${text}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
