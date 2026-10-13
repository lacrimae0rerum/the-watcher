import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdtemp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import test from 'node:test';

import { exportWebEditions, parseEdition, parseInline } from './export-web-editions.js';
import { saveEdition } from './edition-store.js';

const sourceScripts = fileURLToPath(new URL('.', import.meta.url));
const time = '2026-10-13T12:01:05.752Z';

const sample = [
  '**Cybersecurity Digest**',
  '',
  '## Acciones prioritarias',
  '',
  '**Chrome: actualización que corrige múltiples vulnerabilidades**',
  '- Fuente: osiseguridad — https://x.com/osiseguridad/status/2109960067277812000',
  '- Hechos: incluye un enlace (https://t.co/t2wxba9PoT) para actualizar.',
  '- Sin confirmar: no aporta versiones afectadas.',
  '',
  'Resumen breve con **énfasis** y [aviso](https://www.incibe.es/aviso).',
  '',
  '**Estado de canales (operador)**',
  '- Los feeds de pódcast y blogs no están configurados.',
  '',
].join('\n');

function loadExport(source) {
  const context = { window: {} };
  vm.runInNewContext(source, context);
  return context.window.WATCHERS_EDITIONS;
}

async function fixtureRoot() {
  const repositoryRoot = await mkdtemp(join(tmpdir(), 'export-web-editions-test-'));
  for (const name of ['ai-builders-digest', 'cybersecurity-digest', 'digest-core']) {
    await mkdir(join(repositoryRoot, 'packages', name), { recursive: true });
  }
  return repositoryRoot;
}

test('edition markdown becomes a title, sections, items with labelled fields and paragraphs', () => {
  const parsed = parseEdition(sample);
  assert.equal(parsed.title, 'Cybersecurity Digest');
  assert.deepEqual(parsed.blocks[0], { type: 'section', text: 'Acciones prioritarias' });
  const item = parsed.blocks[1];
  assert.equal(item.type, 'item');
  assert.equal(item.title, 'Chrome: actualización que corrige múltiples vulnerabilidades');
  assert.deepEqual(item.fields.map((field) => field.label), ['Fuente', 'Hechos', 'Sin confirmar']);
  assert.deepEqual(item.fields[0].value, [
    { text: 'osiseguridad — ' },
    { text: 'https://x.com/osiseguridad/status/2109960067277812000', href: 'https://x.com/osiseguridad/status/2109960067277812000' },
  ]);
  assert.deepEqual(parsed.blocks[2], {
    type: 'paragraph',
    text: [
      { text: 'Resumen breve con ' },
      { text: 'énfasis', bold: true },
      { text: ' y ' },
      { text: 'aviso', href: 'https://www.incibe.es/aviso' },
      { text: '.' },
    ],
  });
});

test('a Resumen section becomes the summary and its [n] cite numbered items', () => {
  const parsed = parseEdition([
    '**Cybersecurity Digest**', '',
    '## Resumen', '',
    'Chrome corrige fallos [1] y GitLab publica un **aviso** [2]; [9] no existe.', '',
    '## Acciones prioritarias', '',
    '**[1] Chrome: actualización**',
    '- Fuente: osiseguridad — https://x.com/osiseguridad/status/1', '',
    '## En seguimiento', '',
    '**[2] GitLab: múltiples vulnerabilidades**',
    '- Hechos: aviso [2] citado.', '',
  ].join('\n'));
  assert.equal(parsed.title, 'Cybersecurity Digest');
  assert.deepEqual(parsed.summary, [[
    { text: 'Chrome corrige fallos ' },
    { text: '[1]', ref: 1 },
    { text: ' y GitLab publica un ' },
    { text: 'aviso', bold: true },
    { text: ' ' },
    { text: '[2]', ref: 2 },
    { text: '; [9] no existe.' },
  ]]);
  assert.deepEqual(parsed.blocks.map((block) => (block.type === 'item' ? [block.ref, block.title] : block.text)), [
    'Acciones prioritarias', [1, 'Chrome: actualización'], 'En seguimiento', [2, 'GitLab: múltiples vulnerabilidades'],
  ]);
  assert.deepEqual(parsed.blocks[3].fields[0].value, [{ text: 'aviso [2] citado.' }]);

  const legacy = parseEdition(sample);
  assert.deepEqual(legacy.summary, []);
  assert.equal(Object.hasOwn(legacy.blocks[1], 'ref'), false);
});

test('operator-only items and sections are left out of the public edition', () => {
  const parsed = parseEdition(sample);
  assert.equal(parsed.blocks.length, 3);
  assert.doesNotMatch(JSON.stringify(parsed), /operador|feeds de pódcast/);
  const section = parseEdition('Title\n\n## Estado (operator)\n\n- internal note\n\n## Public\n\nVisible text\n');
  assert.deepEqual(section.blocks, [
    { type: 'section', text: 'Public' },
    { type: 'paragraph', text: [{ text: 'Visible text' }] },
  ]);
});

test('only http links are linked and trailing punctuation stays outside the URL', () => {
  assert.deepEqual(parseInline('ver (https://t.co/abc), luego.'), [
    { text: 'ver (' },
    { text: 'https://t.co/abc', href: 'https://t.co/abc' },
    { text: '), luego.' },
  ]);
  assert.deepEqual(parseInline('[x](javascript:alert(1)) y [y](data:text/html,hi)'), [
    { text: '[x](javascript:alert(1)) y [y](data:text/html,hi)' },
  ]);
});

test('plain-text editions keep their first line as title and capitalised lines as sections', () => {
  const parsed = parseEdition('AI Builders Digest — October 12, 2026\n\nX / TWITTER\n\nBoris Cherny ships agents.\n');
  assert.equal(parsed.title, 'AI Builders Digest — October 12, 2026');
  assert.deepEqual(parsed.blocks, [
    { type: 'section', text: 'X / TWITTER' },
    { type: 'paragraph', text: [{ text: 'Boris Cherny ships agents.' }] },
  ]);
});

test('export writes every saved watcher edition and skips watchers without one', async () => {
  const repositoryRoot = await fixtureRoot();
  await saveEdition({ packageId: 'cybersecurity-digest', language: 'es', generatedAt: time, text: sample }, repositoryRoot);
  const before = await readFile(join(repositoryRoot, 'editions', 'cybersecurity-digest', 'latest.json'), 'utf8');

  const result = await exportWebEditions(repositoryRoot);

  assert.deepEqual(result.exported, ['cybersecurity-digest']);
  assert.deepEqual(result.missing, ['ai-builders-digest']);
  const editions = loadExport(await readFile(join(repositoryRoot, 'web', 'data', 'editions.js'), 'utf8'));
  assert.deepEqual(Object.keys(editions), ['cybersecurity-digest']);
  assert.equal(editions['cybersecurity-digest'].language, 'es');
  assert.equal(editions['cybersecurity-digest'].generatedAt, time);
  assert.equal(editions['cybersecurity-digest'].title, 'Cybersecurity Digest');
  assert.equal(editions['cybersecurity-digest'].blocks.length, 3);
  assert.equal(await readFile(join(repositoryRoot, 'editions', 'cybersecurity-digest', 'latest.json'), 'utf8'), before);
  assert.deepEqual(await readdir(join(repositoryRoot, 'web', 'data')), ['editions.js']);
});

test('a corrupt saved edition fails the export without writing the web data', async () => {
  const repositoryRoot = await fixtureRoot();
  const directory = join(repositoryRoot, 'editions', 'cybersecurity-digest');
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'latest.json'), '{broken');
  await assert.rejects(exportWebEditions(repositoryRoot), /Invalid saved edition/);
  await assert.rejects(readdir(join(repositoryRoot, 'web')), { code: 'ENOENT' });
});

test('importing the exporter from a stdin script does not run or crash the CLI', () => {
  const run = spawnSync(process.execPath, ['--input-type=module', '-'], {
    input: `const m = await import(${JSON.stringify(new URL('./export-web-editions.js', import.meta.url).href)});\n` +
      'process.stdout.write(typeof m.parseEdition);\n',
    encoding: 'utf8',
  });
  assert.equal(run.stderr, '');
  assert.equal(run.status, 0);
  assert.equal(run.stdout, 'function');
});

test('CLI exports and reports the written file', async () => {
  const repositoryRoot = await fixtureRoot();
  const scripts = join(repositoryRoot, 'scripts');
  await mkdir(scripts);
  for (const name of ['export-web-editions.js', 'edition-store.js', 'package-runtime.js']) {
    await copyFile(join(sourceScripts, name), join(scripts, name));
  }
  await writeFile(join(scripts, 'package.json'), '{"type":"module"}\n');
  await saveEdition({ packageId: 'cybersecurity-digest', language: 'es', generatedAt: time, text: sample }, repositoryRoot);

  const run = spawnSync(process.execPath, [join(scripts, 'export-web-editions.js')], {
    cwd: repositoryRoot, encoding: 'utf8', env: { PATH: process.env.PATH },
  });

  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /Exported 1 edition to web\/data\/editions\.js \(cybersecurity-digest\); no edition yet: ai-builders-digest/);
  const editions = loadExport(await readFile(join(repositoryRoot, 'web', 'data', 'editions.js'), 'utf8'));
  assert.deepEqual(Object.keys(editions), ['cybersecurity-digest']);
});
