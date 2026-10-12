import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('./generate-edition.js', import.meta.url));
const key = 'secret-not-for-output';
const ids = ['ai-builders-digest', 'cybersecurity-digest'];

function run(args = [], env = {}) {
  return spawnSync(process.execPath, [cli, ...args], {
    encoding: 'utf8', env: { ...process.env, NAN_API_KEY: '', ...env }, timeout: 10_000,
  });
}

function localFixture(packageId) {
  const selected = packageId === ids[0] ? '/fixture/feed-x.json' : '/fixture/feeds/cybersecurity-digest/feed-x.json';
  const other = packageId === ids[0] ? '/fixture/feeds/cybersecurity-digest/feed-x.json' : '/fixture/feed-x.json';
  const readPaths = [];
  return {
    readPaths, other,
    options: {
      packageId, apiKey: key, repositoryRoot: '/fixture', homeDirectory: '/fixture-home',
      generatedAt: '2026-10-08T12:00:00.000Z',
      readLocalFile: async (path) => {
        if (path instanceof URL) return readFile(path, 'utf8');
        readPaths.push(path);
        if (path === selected) return JSON.stringify({ x: [{ tweets: [{ text: 'fixture evidence', url: 'https://example.test/source' }] }] });
        if (path === other) throw new Error('cross-package read');
        return null;
      },
    },
  };
}

function transport(assertRequest, body = { choices: [{ message: { content: 'Final digest\nhttps://example.test/source' } }] }, status = 200) {
  let calls = 0;
  return {
    get calls() { return calls; },
    fetch: async (url, request) => {
      calls++;
      assertRequest?.(url, request);
      return { ok: status === 200, status, json: async () => body };
    },
  };
}

test('both packages send the complete isolated local packet in one non-streaming request and return text only', async () => {
  const { generateEdition } = await import('./generate-edition.js');
  for (const packageId of ids) {
    const fixture = localFixture(packageId);
    const timeout = AbortSignal.timeout;
    AbortSignal.timeout = (milliseconds) => {
      assert.equal(milliseconds, 600_000);
      return timeout(milliseconds);
    };
    const mock = transport((url, request) => {
      assert.equal(url, 'https://api.nan.builders/v1/chat/completions');
      assert.equal(request.method, 'POST');
      assert.equal(request.headers.Authorization, `Bearer ${key}`);
      assert.equal(request.headers['Content-Type'], 'application/json');
      assert.ok(request.signal instanceof AbortSignal);
      const body = JSON.parse(request.body);
      assert.equal(body.model, 'deepseek-v4-flash');
      assert.equal(body.max_tokens, 8192);
      assert.equal(body.stream, false);
      assert.equal(body.messages.length, 2);
      const packet = JSON.parse(body.messages[1].content);
      assert.equal(packet.digest.id, packageId);
      assert.deepEqual(packet.content.x, [{ tweets: [{ text: 'fixture evidence', url: 'https://example.test/source' }] }]);
      assert.ok(packet.prompts.digest_intro.length > 0);
      assert.equal(packet.generatedAt, '2026-10-08T12:00:00.000Z');
      assert.equal(packet.stats.channels.x, 1);
      assert.ok(body.messages[0].content.includes('source links'));
    });
    try {
      assert.equal(await generateEdition({ ...fixture.options, fetchImpl: mock.fetch }), 'Final digest\nhttps://example.test/source');
    } finally {
      AbortSignal.timeout = timeout;
    }
    assert.equal(mock.calls, 1);
    assert.ok(!fixture.readPaths.includes(fixture.other));
  }
});

test('missing process key fails before preparing or fetching', async () => {
  const { generateEdition } = await import('./generate-edition.js');
  let reads = 0;
  let calls = 0;
  await assert.rejects(generateEdition({ ...localFixture(ids[0]).options, apiKey: '',
    readLocalFile: async () => { reads++; throw Error('should not prepare'); },
    fetchImpl: async () => { calls++; throw Error('should not fetch'); },
  }), /NAN_API_KEY/);
  assert.equal(reads, 0);
  assert.equal(calls, 0);
  const result = run(['--package', ids[0]]);
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /NAN_API_KEY/);
  assert.ok(!result.stderr.includes(key));
});

test('provider errors expose only safe status and bounded codes, never echoed secrets or response data', async () => {
  const { generateEdition } = await import('./generate-edition.js');
  const mock = transport(null, { error: { type: 'quota_error', code: 'limit_reached', message: `Private ${key} fixture evidence` }, request_headers: key }, 402);
  await assert.rejects(generateEdition({ ...localFixture(ids[0]).options, fetchImpl: mock.fetch }), (error) => {
    assert.match(error.message, /402.*quota_error.*limit_reached/);
    assert.ok(!error.message.includes(key));
    assert.ok(!error.message.includes('fixture evidence'));
    return true;
  });
  assert.equal(mock.calls, 1);
  const unsafe = transport(null, { error: { type: `bad_${key}`, code: 'x'.repeat(65), message: key } }, 503);
  await assert.rejects(generateEdition({ ...localFixture(ids[0]).options, fetchImpl: unsafe.fetch }), (error) => {
    assert.equal(error.message, 'NaN provider error (503)');
    return true;
  });
});

test('provider error fields that are strict key fragments are omitted', async () => {
  const { generateEdition } = await import('./generate-edition.js');
  const mock = transport(null, { error: { type: 'secret-not', code: 'for-output' } }, 403);
  await assert.rejects(generateEdition({ ...localFixture(ids[0]).options, fetchImpl: mock.fetch }), (error) => {
    assert.equal(error.message, 'NaN provider error (403)');
    return true;
  });
  assert.equal(mock.calls, 1);
});

test('invalid, empty, and malformed responses fail closed', async () => {
  const { generateEdition } = await import('./generate-edition.js');
  for (const body of [{}, { choices: [] }, { choices: [{ message: { content: '  ' } }] }, { choices: [{ message: { content: 3 } }] }]) {
    const mock = transport(null, body);
    await assert.rejects(generateEdition({ ...localFixture(ids[0]).options, fetchImpl: mock.fetch }), /Invalid NaN response/);
    assert.equal(mock.calls, 1);
  }
  await assert.rejects(generateEdition({ ...localFixture(ids[0]).options, fetchImpl: async () => ({ ok: true, json: async () => { throw new Error(key); } }) }),
    (error) => !error.message.includes(key));
});

test('network and timeout failures reveal no transport detail and never retry', async () => {
  const { generateEdition } = await import('./generate-edition.js');
  for (const name of ['Error', 'TimeoutError']) {
    let calls = 0;
    await assert.rejects(generateEdition({ ...localFixture(ids[0]).options, fetchImpl: async () => {
      calls++;
      throw Object.assign(new Error(key), { name });
    } }), (error) => !error.message.includes(key));
    assert.equal(calls, 1);
  }
});

test('CLI rejects malformed and duplicate selectors without fetching or writing', () => {
  for (const args of [['--unknown'], ['--package'], ['--package=ai-builders-digest'], ['--package', 'Not-Canonical'],
    ['--package', 'unknown-digest'], ['--package', ids[0], '--package', ids[1]]]) {
    const result = run(args, { NAN_API_KEY: key });
    assert.equal(result.status, 1, String(args));
    assert.equal(result.stdout, '');
    assert.ok(!result.stderr.includes(key));
    assert.match(result.stderr, /error|package|Usage/i);
  }
});

test('CLI default selects AI Builders, prints only digest text, and performs no filesystem writes', () => {
  const intercept = `data:text/javascript,${encodeURIComponent(`
    import fs from 'node:fs';
    import { syncBuiltinESMExports } from 'node:module';
    globalThis.fetch = async (_url, request) => {
      if (JSON.parse(request.body).messages[1].content.includes('"id":"ai-builders-digest"')) {
        return { ok: true, json: async () => ({ choices: [{ message: { content: 'Local result' } }] }) };
      }
      throw Error('wrong package');
    };
    for (const method of ['writeFile', 'appendFile', 'mkdir', 'rename', 'open']) {
      fs.promises[method] = () => { throw Error('filesystem write: ' + method); };
    }
    for (const method of ['writeFileSync', 'appendFileSync', 'mkdirSync', 'renameSync']) {
      fs[method] = () => { throw Error('filesystem write: ' + method); };
    }
    syncBuiltinESMExports();
  `)}`;
  const result = spawnSync(process.execPath, ['--import', intercept, cli], {
    encoding: 'utf8', env: { ...process.env, NAN_API_KEY: key, HOME: '/nonexistent-home' }, timeout: 10_000,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'Local result\n');
  assert.equal(result.stderr, '');
});
