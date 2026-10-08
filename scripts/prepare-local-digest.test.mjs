import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { prepareLocalDigest } from './prepare-local-digest.js';

const cli = fileURLToPath(new URL('./prepare-local-digest.js', import.meta.url));
const root = fileURLToPath(new URL('..', import.meta.url));

function run(args = [], home = '/nonexistent-home', imports = []) {
  return spawnSync(process.execPath, [...imports.flatMap((entry) => ['--import', entry]), cli, ...args], {
    encoding: 'utf8', env: { ...process.env, HOME: home }, timeout: 10_000,
  });
}

test('AI Builders CLI prepares a local packet without writing or fetching', async () => {
  const before = await readdir(root);
  const feedBefore = await Promise.all(['feed-x.json', 'feed-podcasts.json', 'feed-blogs.json'].map((file) => stat(join(root, file))));
  const noNetwork = `data:text/javascript,${encodeURIComponent(`
    import fs from 'node:fs';
    import { syncBuiltinESMExports } from 'node:module';
    globalThis.fetch = () => { throw new Error('fetch must not be called'); };
    for (const method of ['writeFile', 'appendFile', 'mkdir', 'rename', 'open']) {
      fs.promises[method] = () => { throw new Error('filesystem write must not be called: ' + method); };
    }
    for (const method of ['writeFileSync', 'appendFileSync', 'mkdirSync', 'renameSync']) {
      fs[method] = () => { throw new Error('filesystem write must not be called: ' + method); };
    }
    syncBuiltinESMExports();
  `)}`;
  const result = run(['--package', 'ai-builders-digest'], '/nonexistent-home', [noNetwork]);
  assert.equal(result.status, 0, result.stderr);
  const packet = JSON.parse(result.stdout);
  assert.equal(packet.status, 'ok');
  assert.equal(packet.digest.id, 'ai-builders-digest');
  assert.ok(packet.content.x.length > 0);
  assert.ok(packet.prompts.digest_intro.includes('AI'));
  assert.deepEqual(packet.preferences, { language: 'en', frequency: 'daily', delivery: { method: 'stdout' } });
  assert.deepEqual(await readdir(root), before);
  const feedAfter = await Promise.all(['feed-x.json', 'feed-podcasts.json', 'feed-blogs.json'].map((file) => stat(join(root, file))));
  assert.deepEqual(feedAfter.map((entry) => entry.mtimeMs), feedBefore.map((entry) => entry.mtimeMs));
});

function fixture(packageId, files = {}) {
  const seen = [];
  const pathRoot = '/fixture-checkout';
  const homeDirectory = '/fixture-home';
  return {
    seen,
    prepare: () => prepareLocalDigest({
      packageId, repositoryRoot: pathRoot, homeDirectory,
      generatedAt: '2026-10-08T12:00:00.000Z',
      readLocalFile: async (path) => {
        if (path instanceof URL) return readFile(path, 'utf8');
        seen.push(path);
        return files[path] ?? null;
      },
    }),
  };
}

const cyberX = '/fixture-checkout/feeds/cybersecurity-digest/feed-x.json';
const buildersX = '/fixture-checkout/feed-x.json';
const cyberConfig = '/fixture-home/.cybersecurity-digest/config.json';
const buildersConfig = '/fixture-home/.ai-builders-digest/config.json';

test('both package IDs use only their isolated local feeds and bundled prompts', async () => {
  for (const [id, feedPath, otherPath] of [
    ['ai-builders-digest', buildersX, cyberX],
    ['cybersecurity-digest', cyberX, buildersX],
  ]) {
    const { seen, prepare } = fixture(id, {
      [feedPath]: JSON.stringify({ generatedAt: '2026-10-08T11:00:00.000Z', x: [{ tweets: [{ text: 'source' }] }] }),
      [otherPath]: JSON.stringify({ x: [{ tweets: [{ text: 'wrong package' }] }] }),
    });
    const packet = await prepare();
    assert.equal(packet.digest.id, id);
    assert.deepEqual(packet.content.x, [{ tweets: [{ text: 'source' }] }]);
    assert.deepEqual(packet.stats.channels, { x: 1, podcasts: 0, blogs: 0 });
    assert.ok(packet.prompts.digest_intro.length > 0);
    assert.ok(packet.errors.some((error) => error.includes('Missing local podcasts feed')));
    assert.ok(!seen.includes(otherPath));
  }
});

test('all missing or all empty feeds fail without a packet', async () => {
  await assert.rejects(fixture('cybersecurity-digest').prepare(), /No usable local feed content.*Missing local x feed/);
  await assert.rejects(fixture('cybersecurity-digest', {
    [cyberX]: JSON.stringify({ x: [] }),
    '/fixture-checkout/feeds/cybersecurity-digest/feed-podcasts.json': JSON.stringify({ podcasts: [] }),
    '/fixture-checkout/feeds/cybersecurity-digest/feed-blogs.json': JSON.stringify({ blogs: [] }),
  }).prepare(), /No usable local feed content/);
  for (const args of [['--package', 'cybersecurity-digest'], ['--package', 'unknown-digest']]) {
    const result = run(args);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.equal(JSON.parse(result.stderr).status, 'error');
  }
});

test('malformed feed and config are reported while usable evidence and override survive', async () => {
  const { prepare } = fixture('cybersecurity-digest', {
    [cyberX]: '{not-json',
    '/fixture-checkout/feeds/cybersecurity-digest/feed-blogs.json': JSON.stringify({ blogs: [{ title: 'local evidence' }], errors: ['source warning'] }),
    [cyberConfig]: '{bad-config',
    '/fixture-home/.cybersecurity-digest/prompts/digest-intro.md': 'User-only introduction',
  });
  const packet = await prepare();
  assert.deepEqual(packet.content.blogs, [{ title: 'local evidence' }]);
  assert.deepEqual(packet.content.x, []);
  assert.equal(packet.prompts.digest_intro, 'User-only introduction');
  assert.deepEqual(packet.preferences, { language: 'en', frequency: 'daily', delivery: { method: 'stdout' } });
  assert.ok(packet.errors.some((error) => error.includes('Invalid local x feed: malformed JSON')));
  assert.ok(packet.errors.some((error) => error.includes('Could not read config:')));
  assert.ok(packet.errors.some((error) => error.includes('source warning')));
});

test('unreadable config is an envelope error when another channel is usable', async () => {
  const packet = await prepareLocalDigest({
    packageId: 'cybersecurity-digest', repositoryRoot: '/fixture-checkout', homeDirectory: '/fixture-home',
    readLocalFile: async (path) => {
      if (path === cyberConfig) throw Object.assign(new Error('permission denied'), { code: 'EACCES' });
      if (path === cyberX) return JSON.stringify({ x: [{ tweets: [] }] });
      if (path instanceof URL) return readFile(path, 'utf8');
      return null;
    },
  });
  assert.ok(packet.errors.includes('Could not read config: permission denied'));
});

test('package-isolated valid config overrides defaults', async () => {
  const packet = await fixture('ai-builders-digest', {
    [buildersX]: JSON.stringify({ x: [{ tweets: [] }] }),
    [buildersConfig]: JSON.stringify({ language: 'es', frequency: 'weekly', delivery: { method: 'stdout' } }),
  }).prepare();
  assert.equal(packet.preferences.language, 'es');
  assert.equal(packet.preferences.frequency, 'weekly');
});

test('unsupported, duplicate, and malformed package arguments fail with JSON stderr only', () => {
  for (const args of [
    ['--package', 'unknown-digest'], ['--package', 'ai-builders-digest', '--package', 'cybersecurity-digest'],
    ['--package'], ['--package', 'Not-Canonical'], ['--package=ai-builders-digest'], ['--unknown'],
  ]) {
    const result = run(args);
    assert.equal(result.status, 1, String(args));
    assert.equal(result.stdout, '');
    assert.equal(JSON.parse(result.stderr).status, 'error');
  }
});
