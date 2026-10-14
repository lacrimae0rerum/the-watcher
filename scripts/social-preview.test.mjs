import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const origin = 'https://custodes-intellegentiae.exdataveritas.com';
const html = await readFile(new URL('../web/index.html', import.meta.url), 'utf8');
const metadata = new Map([...html.matchAll(/<meta\s+(?:property|name)="([^"]+)"\s+content="([^"]*)"\s*\/?>/g)]
  .map(([, name, content]) => [name, content]));

test('sharing the site declares a public PNG preview for Open Graph and X without JavaScript', async () => {
  assert.equal(metadata.get('og:url'), `${origin}/`);
  assert.equal(metadata.get('og:image'), `${origin}/social-preview.png`);
  assert.equal(metadata.get('og:image:type'), 'image/png');
  assert.equal(metadata.get('og:image:width'), '1200');
  assert.equal(metadata.get('og:image:height'), '630');
  assert.ok(metadata.get('og:image:alt')?.includes('THE WATCHERS'));
  assert.equal(metadata.get('twitter:card'), 'summary_large_image');
  assert.equal(metadata.get('twitter:image'), metadata.get('og:image'));
  assert.equal(metadata.get('twitter:image:alt'), metadata.get('og:image:alt'));
  const image = await readFile(new URL('../web/social-preview.png', import.meta.url));
  assert.deepEqual([...image.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(image.toString('ascii', 12, 16), 'IHDR');
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
  assert.ok(image.length < 1_000_000, 'Keep the share image below 1 MB');
  assert.doesNotMatch(await readFile(new URL('../web/.assetsignore', import.meta.url), 'utf8'), /social-preview|\*\.png/);
});

test('social metadata preserves the existing title, Spanish description and web entry points', () => {
  assert.match(html, /<title>THE WATCHERS<\/title>/);
  assert.equal(metadata.get('og:title'), 'THE WATCHERS');
  assert.equal(metadata.get('og:type'), 'website');
  assert.equal(metadata.get('og:description'), 'Vigilantes automáticos de fuentes públicas que publican ediciones con enlaces a cada fuente.');
  assert.match(html, /<link rel="stylesheet" href="styles\.css">/);
  assert.match(html, /<script src="data\/editions\.js"><\/script>/);
  assert.match(html, /<script src="app\.js"><\/script>/);
});
