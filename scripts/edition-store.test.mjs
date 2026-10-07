import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdtemp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { readLatestEdition, saveEdition } from './edition-store.js';

const sourceScripts = fileURLToPath(new URL('.', import.meta.url));
const id = 'cybersecurity-digest';
const otherId = 'ai-builders-digest';
const time = '2026-10-07T12:00:00.000Z';
const edition = { packageId: id, language: 'es', generatedAt: time, text: 'Pulso\n\nLínea final\n' };

async function root() {
  return mkdtemp(join(tmpdir(), 'edition-store-test-'));
}

async function cliFixture() {
  const repositoryRoot = await root();
  const scripts = join(repositoryRoot, 'scripts');
  await mkdir(scripts);
  for (const name of ['edition-store.js', 'package-runtime.js', 'save-edition.js', 'latest-edition.js']) {
    await copyFile(join(sourceScripts, name), join(scripts, name));
  }
  await writeFile(join(scripts, 'package.json'), '{"type":"module"}\n');
  const run = (name, args) => spawnSync(process.execPath, [join(scripts, name), ...args], {
    cwd: repositoryRoot, encoding: 'utf8', env: { PATH: process.env.PATH },
  });
  return { repositoryRoot, run };
}

test('exact text roundtrip and replacement leave one latest edition', async () => {
  const repositoryRoot = await root();
  await saveEdition(edition, repositoryRoot);
  assert.deepEqual(await readLatestEdition(id, repositoryRoot), edition);
  const replacement = { ...edition, text: 'Segundo\n', generatedAt: '2026-10-08T00:00:00.000Z' };
  await saveEdition(replacement, repositoryRoot);
  assert.deepEqual(await readLatestEdition(id, repositoryRoot), replacement);
  await assert.rejects(saveEdition({ ...edition, text: ' \n' }, repositoryRoot), /Invalid edition/);
  assert.deepEqual(await readLatestEdition(id, repositoryRoot), replacement);
  assert.deepEqual(await readdir(join(repositoryRoot, 'editions', id)), ['latest.json']);
});

test('invalid identity, metadata and text reject before creating an edition', async () => {
  const repositoryRoot = await root();
  for (const packageId of ['../other', 'bad/id', 'Bad-ID']) {
    await assert.rejects(saveEdition({ ...edition, packageId }, repositoryRoot), /Invalid package ID/);
    await assert.rejects(readLatestEdition(packageId, repositoryRoot), /Invalid package ID/);
  }
  for (const invalid of [
    { text: '' }, { text: ' \n\t' }, { text: 42 },
    { language: '' }, { language: 'es/mx' }, { language: ' es' },
    { generatedAt: 'yesterday' }, { generatedAt: '2026-02-30T00:00:00.000Z' },
  ]) {
    await assert.rejects(saveEdition({ ...edition, ...invalid }, repositoryRoot), /Invalid edition/);
  }
  assert.deepEqual(await readdir(repositoryRoot), []);
});

test('missing reads create nothing, while corrupt and cross-package payloads fail', async () => {
  const repositoryRoot = await root();
  await assert.rejects(readLatestEdition(id, repositoryRoot), /No saved edition/);
  assert.deepEqual(await readdir(repositoryRoot), []);
  const directory = join(repositoryRoot, 'editions', id);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'latest.json'), '{broken');
  await assert.rejects(readLatestEdition(id, repositoryRoot), /Invalid saved edition/);
  await writeFile(join(directory, 'latest.json'), JSON.stringify({ ...edition, packageId: otherId }));
  await assert.rejects(readLatestEdition(id, repositoryRoot), /package ID mismatch/);
  await writeFile(join(directory, 'latest.json'), JSON.stringify({ ...edition, generatedAt: 'invalid' }));
  await assert.rejects(readLatestEdition(id, repositoryRoot), /Invalid saved edition/);
});

test('package namespaces stay isolated', async () => {
  const repositoryRoot = await root();
  await saveEdition(edition, repositoryRoot);
  await assert.rejects(readLatestEdition(otherId, repositoryRoot), /No saved edition/);
  await saveEdition({ ...edition, packageId: otherId, text: 'Other' }, repositoryRoot);
  assert.equal((await readLatestEdition(id, repositoryRoot)).text, edition.text);
  assert.equal((await readLatestEdition(otherId, repositoryRoot)).text, 'Other');
});

test('CLI saves explicit file and reads exact text or metadata JSON without read writes', async () => {
  const { repositoryRoot, run } = await cliFixture();
  const input = join(repositoryRoot, 'draft.txt');
  await writeFile(input, edition.text);
  const save = run('save-edition.js', ['--package', id, '--file', input, '--language', 'es', '--generated-at', time]);
  assert.equal(save.status, 0, save.stderr);
  const stored = join(repositoryRoot, 'editions', id, 'latest.json');
  const before = await readFile(stored, 'utf8');
  const plain = run('latest-edition.js', ['--package', id]);
  assert.equal(plain.status, 0, plain.stderr);
  assert.equal(plain.stdout, edition.text);
  const json = run('latest-edition.js', ['--package', id, '--json']);
  assert.equal(json.status, 0, json.stderr);
  assert.deepEqual(JSON.parse(json.stdout), edition);
  assert.equal(await readFile(stored, 'utf8'), before);
  assert.deepEqual(await readdir(join(repositoryRoot, 'editions', id)), ['latest.json']);
});

test('CLI missing, corrupt and argument errors are nonzero and read creates nothing', async () => {
  const { repositoryRoot, run } = await cliFixture();
  const missing = run('latest-edition.js', ['--package', id]);
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /No saved edition/);
  assert.equal(missing.stdout, '');
  assert.deepEqual(await readdir(repositoryRoot), ['scripts']);
  for (const args of [
    ['--bogus'], ['--output', 'out'], ['--json', '--json'], ['--package'],
    ['--package', id, '--package', id], ['--package', '../escape'], ['--package=' + id],
  ]) {
    const result = run('latest-edition.js', args);
    assert.notEqual(result.status, 0, `read accepted ${args}`);
    assert.equal(result.stdout, '');
  }
  for (const args of [
    [], ['--file'], ['--file', 'a', '--file', 'b'], ['--package', id],
    ['--package', id, '--file', 'missing', '--unexpected'],
    ['--package', '../escape', '--file', 'missing'],
    ['--package', id, '--file', 'missing', '--language'],
    ['--package', id, '--file', 'missing', '--generated-at', 'invalid'],
  ]) {
    assert.notEqual(run('save-edition.js', args).status, 0, `save accepted ${args}`);
  }
  assert.deepEqual(await readdir(repositoryRoot), ['scripts']);
  const directory = join(repositoryRoot, 'editions', id);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'latest.json'), '{broken');
  const corrupt = run('latest-edition.js', ['--package', id]);
  assert.notEqual(corrupt.status, 0);
  assert.match(corrupt.stderr, /Invalid saved edition/);
  assert.doesNotMatch(corrupt.stderr, /No saved edition/);
  await writeFile(join(directory, 'latest.json'), JSON.stringify({ ...edition, packageId: otherId }));
  const mismatch = run('latest-edition.js', ['--package', id]);
  assert.notEqual(mismatch.status, 0);
  assert.match(mismatch.stderr, /package ID mismatch/);
});
