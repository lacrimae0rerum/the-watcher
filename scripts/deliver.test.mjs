import assert from 'node:assert/strict';
import test from 'node:test';
import { deliver } from '../packages/digest-core/index.js';
import { createOAuth1Authorization, deliverXArticle } from './deliver.js';
import { createDeliveryState, editionIdentity } from './delivery-state.js';

const edition = { text: 'First paragraph\n\nSecond paragraph' };
const target = { type: 'x-article', title: 'Reviewed bulletin' };

function memoryFs() {
  const files = new Map();
  const calls = [];
  return {
    files, calls,
    async readFile(path) {
      if (!files.has(path)) throw Object.assign(new Error('missing'), { code: 'ENOENT' });
      return files.get(path);
    },
    async mkdir() {},
    async writeFile(path, value, options) {
      assert.equal(options.flag, 'wx');
      files.set(path, value);
      calls.push('write');
    },
    async rename(from, to) {
      files.set(to, files.get(from));
      files.delete(from);
      calls.push('rename');
    },
    async unlink(path) { files.delete(path); },
  };
}

test('X Article delivers plain text as a DraftJS draft then publishes it', async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url, ...options });
    return requests.length === 1
      ? { status: 201, json: async () => ({ data: { id: '123' } }) }
      : { status: 200, json: async () => ({ data: { post_id: '456' } }) };
  };
  const state = { wasDelivered: async () => false, recordSuccess: async () => {} };
  const result = await deliver({
    edition,
    target,
    adapters: { 'x-article': { deliver: (text, destination) => deliverXArticle({
      edition: text, target: destination, token: 'runtime-token', packageId: 'cybersecurity-digest',
      repositoryRoot: '/repository', fetchImpl, state,
    }) } },
  });
  assert.deepEqual(result, { status: 'ok', method: 'x-article', articleId: '123', postId: '456' });
  assert.deepEqual(requests, [
    { url: 'https://api.x.com/2/articles/draft', method: 'POST',
      headers: { Authorization: 'Bearer runtime-token', 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Reviewed bulletin', content_state: {
        blocks: [
          { key: '00000', text: 'First paragraph', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} },
          { key: '00001', text: '', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} },
          { key: '00002', text: 'Second paragraph', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} },
        ], entities: [],
      } }),
    },
    { url: 'https://api.x.com/2/articles/123/publish', method: 'POST',
      headers: { Authorization: 'Bearer runtime-token', 'Content-Type': 'application/json' },
      body: '{}' },
  ]);
});

test('OAuth 1.0a signs each X Article request without exposing credentials', async () => {
  const oauth1 = {
    consumerKey: 'key', consumerSecret: 'secret',
    accessToken: 'token', accessTokenSecret: 'token-secret',
  };
  assert.equal(createOAuth1Authorization({
    method: 'POST', url: 'https://api.x.com/2/articles/draft', oauth1,
    nonce: 'nonce', timestamp: '1700000000',
  }), 'OAuth oauth_consumer_key="key", oauth_nonce="nonce", oauth_signature="PChaAE1RAh2n6HlqnlrYWL0uXOc%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1700000000", oauth_token="token", oauth_version="1.0"');
  assert.match(createOAuth1Authorization({
    method: 'POST', url: 'https://api.x.com/2/articles/draft?z=last&A=first&a=second', oauth1,
    nonce: 'nonce', timestamp: '1700000000',
  }), /oauth_signature="10aUWZxM%2FQGgvHmAHGY%2FdkRdGXU%3D"/);

  const requests = [];
  const nonces = ['draft-nonce', 'publish-nonce'];
  const result = await deliverXArticle({
    edition, target, oauth1, packageId: 'cybersecurity-digest', repositoryRoot: '/repository',
    oauthNonce: () => nonces.shift(), oauthTimestamp: () => '1700000000',
    state: { wasDelivered: async () => false, recordSuccess: async () => {} },
    fetchImpl: async (url, options) => {
      requests.push({ url, ...options });
      return requests.length === 1
        ? { status: 201, json: async () => ({ data: { id: '123' } }) }
        : { status: 200, json: async () => ({ data: { post_id: '456' } }) };
    },
  });
  assert.equal(result.status, 'ok');
  assert.equal(requests.length, 2);
  assert.match(requests[0].headers.Authorization, /^OAuth /);
  assert.match(requests[0].headers.Authorization, /oauth_nonce="draft-nonce"/);
  assert.match(requests[1].headers.Authorization, /oauth_nonce="publish-nonce"/);
  assert.notEqual(requests[0].headers.Authorization, requests[1].headers.Authorization);
  for (const request of requests) {
    assert.doesNotMatch(request.headers.Authorization, /secret|token-secret/);
    assert.equal(request.headers['Content-Type'], 'application/json');
  }
});

test('recorded delivery skips repeat X calls while draft and publish errors record no success', async () => {
  const saved = new Set();
  const state = {
    wasDelivered: async (_packageId, _channel, id) => saved.has(id),
    recordSuccess: async (_packageId, _channel, id) => { saved.add(id); },
  };
  let calls = 0;
  const send = (fetchImpl, overrides = {}) => deliverXArticle({ edition, target: { ...target, ...overrides },
    token: 'runtime-token', packageId: 'cybersecurity-digest', repositoryRoot: '/repo', fetchImpl, state });
  await assert.rejects(send(async () => { calls++; return { status: 400, json: async () => ({ secret: edition.text }) }; }), /draft failed/);
  assert.equal(saved.size, 0);
  await assert.rejects(send(async () => {
    calls++;
    return calls === 2 ? { status: 201, json: async () => ({ data: { id: '123' } }) }
      : { status: 429, json: async () => ({ secret: edition.text }) };
  }), /publish failed.*manual reconciliation required.*outcome uncertain/);
  assert.equal(saved.size, 0);
  const result = await send(async () => {
    calls++;
    return calls === 4 ? { status: 201, json: async () => ({ data: { id: '123' } }) }
      : { status: 200, json: async () => ({ data: { post_id: '456' } }) };
  });
  assert.equal(result.status, 'ok');
  assert.equal(saved.size, 1);
  assert.deepEqual(await send(() => { throw new Error('network must not run'); }, { title: 'Another title' }),
    { status: 'skipped', method: 'x-article', reason: 'already-delivered' });
  assert.equal(calls, 5);
});

test('publish success without a durable receipt reports uncertainty without leaking provider data', async () => {
  const secret = 'runtime-token';
  let calls = 0;
  const state = {
    wasDelivered: async () => false,
    recordSuccess: async () => { throw new Error(`disk failed ${secret} ${edition.text}`); },
  };
  const fetchImpl = async () => {
    calls++;
    return calls === 1 ? { status: 201, json: async () => ({ data: { id: '123' } }) }
      : { status: 200, json: async () => ({ data: { post_id: '456' }, raw: secret }) };
  };
  await assert.rejects(deliverXArticle({ edition, target, token: secret,
    packageId: 'cybersecurity-digest', repositoryRoot: '/repo', fetchImpl, state }), error => {
    assert.match(error.message, /published.*manual reconciliation required.*outcome uncertain/);
    assert.doesNotMatch(error.message, /runtime-token|First paragraph|disk failed|raw/);
    return true;
  });
  assert.equal(calls, 2);
});

test('edition identity is stable, exact-text-sensitive, and scoped to a canonical package', () => {
  assert.equal(editionIdentity('cybersecurity-digest', edition.text),
    'b419e61655df1f25f02f324570e8e9d8df169183f6cbca729e10119ef841271b');
  assert.notEqual(editionIdentity('cybersecurity-digest', edition.text + '\n'),
    editionIdentity('cybersecurity-digest', edition.text));
  assert.notEqual(editionIdentity('ai-builders-digest', edition.text),
    editionIdentity('cybersecurity-digest', edition.text));
  assert.throws(() => editionIdentity('../escape', edition.text), /Invalid package ID/);
});

test('missing provider IDs and transport errors stay redacted and cannot record success', async () => {
  const secret = 'runtime-token';
  const state = { wasDelivered: async () => false, recordSuccess: async () => { throw new Error('unexpected record'); } };
  const args = { edition, target, token: secret, packageId: 'cybersecurity-digest', repositoryRoot: '/repo', state };
  await assert.rejects(deliverXArticle({ ...args, fetchImpl: async () => ({ status: 201,
    json: async () => ({ data: { id: secret }, body: edition.text }) }) }), /draft returned an invalid ID/);
  let calls = 0;
  await assert.rejects(deliverXArticle({ ...args, fetchImpl: async () => {
    calls++;
    if (calls === 1) return { status: 201, json: async () => ({ data: { id: '123' } }) };
    throw new Error(`${secret} ${edition.text}`);
  } }), error => {
    assert.match(error.message, /publish transport failed.*manual reconciliation required.*outcome uncertain/);
    assert.doesNotMatch(error.message, /runtime-token|First paragraph/);
    return true;
  });
});

test('missing token, title, or usable text blocks X before network', async () => {
  let calls = 0;
  const fetchImpl = () => { calls++; throw new Error('network forbidden'); };
  const state = { wasDelivered: async () => false };
  const args = { edition, target, token: 'runtime-token', packageId: 'cybersecurity-digest',
    repositoryRoot: '/repo', fetchImpl, state };
  await assert.rejects(deliverXArticle({ ...args, token: '' }), /X Article user authentication is required/);
  await assert.rejects(deliverXArticle({ ...args, token: undefined, oauth1: {
    consumerKey: 'key', consumerSecret: '', accessToken: 'token', accessTokenSecret: 'token-secret',
  } }), /Complete OAuth 1.0a credentials are required/);
  await assert.rejects(deliverXArticle({ ...args, target: { type: 'x-article' } }), /delivery.title is required/);
  await assert.rejects(deliverXArticle({ ...args, edition: { text: '  \n ' } }), /X Article text is required/);
  await assert.rejects(deliverXArticle({ ...args, packageId: '../escape' }), /Invalid package ID/);
  assert.equal(calls, 0);
});

test('delivery state persists successful identities per package and channel with atomic replacement', async () => {
  const fsImpl = memoryFs();
  const state = createDeliveryState({ repositoryRoot: '/repo', fsImpl });
  const identity = editionIdentity('cybersecurity-digest', edition.text);
  assert.equal(await state.wasDelivered('cybersecurity-digest', 'x-article', identity), false);
  await state.recordSuccess('cybersecurity-digest', 'x-article', identity);
  assert.deepEqual(fsImpl.calls, ['write', 'rename']);
  assert.equal(await state.wasDelivered('cybersecurity-digest', 'x-article', identity), true);
  assert.equal(await state.wasDelivered('cybersecurity-digest', 'telegram', identity), false);
  assert.equal(await state.wasDelivered('ai-builders-digest', 'x-article', identity), false);
  assert.equal(fsImpl.files.has('/repo/editions/cybersecurity-digest/delivery-state.json'), true);
  assert.equal([...fsImpl.files.keys()].length, 1);
  await state.recordSuccess('cybersecurity-digest', 'x-article', editionIdentity('cybersecurity-digest', 'Next'));
  assert.equal(await state.wasDelivered('cybersecurity-digest', 'x-article', identity), true);
});

test('a failed atomic state replacement does not report a recorded success', async () => {
  const fsImpl = memoryFs();
  fsImpl.rename = async () => { throw new Error('disk failed'); };
  const state = createDeliveryState({ repositoryRoot: '/repo', fsImpl });
  const id = editionIdentity('cybersecurity-digest', edition.text);
  await assert.rejects(state.recordSuccess('cybersecurity-digest', 'x-article', id), /Cannot persist delivery state/);
  assert.equal(await state.wasDelivered('cybersecurity-digest', 'x-article', id), false);
  assert.equal(fsImpl.files.size, 0);
});

test('corrupt delivery state fails closed and does not overwrite or call X', async () => {
  const fsImpl = memoryFs();
  const path = '/repo/editions/cybersecurity-digest/delivery-state.json';
  fsImpl.files.set(path, '{broken');
  const state = createDeliveryState({ repositoryRoot: '/repo', fsImpl });
  let calls = 0;
  await assert.rejects(deliverXArticle({ edition, target, token: 'runtime-token',
    packageId: 'cybersecurity-digest', repositoryRoot: '/repo', state,
    fetchImpl: () => { calls++; throw new Error('network forbidden'); } }), /Invalid delivery state; manual reconciliation required/);
  assert.equal(calls, 0);
  assert.equal(fsImpl.files.get(path), '{broken');
  fsImpl.files.set(path, JSON.stringify({ version: 1, packageId: 'ai-builders-digest', delivered: {} }));
  await assert.rejects(state.wasDelivered('cybersecurity-digest', 'x-article', 'a'.repeat(64)), /Invalid delivery state/);
  await assert.rejects(state.recordSuccess('cybersecurity-digest', 'x-article', 'a'.repeat(64)), /Invalid delivery state/);
});
