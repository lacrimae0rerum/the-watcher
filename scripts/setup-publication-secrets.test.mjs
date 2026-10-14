import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmod, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(new URL('./setup-publication-secrets.sh', import.meta.url));

// A fake gh records each call's arguments and standard input.
async function fakeGh() {
  const directory = await mkdtemp(join(tmpdir(), 'setup-publication-secrets-test-'));
  const log = join(directory, 'calls.log');
  await writeFile(join(directory, 'gh'), `#!/usr/bin/env bash
input=""
if [[ "$1" == secret ]]; then input=$(cat); fi
printf 'ARGS %s | STDIN %s\\n' "$*" "$input" >> "${log}"
`);
  await chmod(join(directory, 'gh'), 0o755);
  return { directory, log };
}

const run = (gh, input) => spawnSync('bash', [script], {
  input, encoding: 'utf8', env: { PATH: `${gh.directory}:${process.env.PATH}`, HOME: gh.directory },
});

test('stores the four publication secrets through stdin in an environment only main can use', async () => {
  const gh = await fakeGh();
  const result = run(gh, 'x-token-value\nnan-key-value\ncf-token-value\ncf-account-value\n');
  assert.equal(result.status, 0, result.stderr);
  const calls = (await readFile(gh.log, 'utf8')).trim().split('\n');
  const repo = calls.find((call) => call.includes('environments/publication '))?.match(/repos\/([^/]+\/[^/ ]+)\/environments/)?.[1];
  assert.match(repo, /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/);
  assert.ok(calls.includes(`ARGS api --method PUT repos/${repo}/environments/publication -F deployment_branch_policy[protected_branches]=false -F deployment_branch_policy[custom_branch_policies]=true | STDIN `));
  assert.ok(calls.includes(`ARGS api --method POST repos/${repo}/environments/publication/deployment-branch-policies -f name=main -f type=branch | STDIN `));
  for (const [name, value] of [['X_BEARER_TOKEN', 'x-token-value'], ['NAN_API_KEY', 'nan-key-value'],
    ['CLOUDFLARE_API_TOKEN', 'cf-token-value'], ['CLOUDFLARE_ACCOUNT_ID', 'cf-account-value']]) {
    assert.ok(calls.includes(`ARGS secret set ${name} --env publication --repo ${repo} | STDIN ${value}`), name);
  }
  for (const call of calls) assert.doesNotMatch(call.split(' | STDIN ')[0], /value/);
  assert.doesNotMatch(result.stdout + result.stderr, /-value/);
});

test('an empty answer keeps the stored secret instead of overwriting it', async () => {
  const gh = await fakeGh();
  const result = run(gh, '\nnan-key-value\n\n\n');
  assert.equal(result.status, 0, result.stderr);
  const secrets = (await readFile(gh.log, 'utf8')).split('\n').filter((call) => call.startsWith('ARGS secret set'));
  assert.deepEqual(secrets.map((call) => call.split(' ')[3]), ['NAN_API_KEY']);
  assert.match(result.stdout, /X_BEARER_TOKEN: kept/);
});
