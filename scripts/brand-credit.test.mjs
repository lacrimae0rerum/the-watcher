import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('the header links the supplied NaN logo as a smaller attribution without replacing the brand or controls', async () => {
  const html = await readFile(new URL('../web/index.html', import.meta.url), 'utf8');
  const credit = html.match(/<a class="brand-credit"([^>]*)>([\s\S]*?)<\/a>/);
  assert.ok(credit, 'the brand header needs a provider credit link');
  assert.match(credit[1], /href="https:\/\/nan\.builders\/"/);
  assert.match(credit[1], /target="_blank"/);
  assert.match(credit[1], /rel="noopener noreferrer"/);
  assert.match(credit[2], /<span>Powered by<\/span>/);
  assert.match(credit[2], /<img src="nan-builders\.png" alt="NaN\.builders"/);
  const png = await readFile(new URL('../web/nan-builders.png', import.meta.url));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.match(html, /<a class="wordmark" href="\.\/">· THE WATCHERS ·<\/a>/);
  for (const id of ['digestCount', 'liveCount', 'plannedCount', 'langToggle', 'themeToggle']) {
    assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) ?? []).length, 1);
  }
});
