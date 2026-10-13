import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { checkEdition, publicationDue } from './publish-edition.js';
import { saveEdition } from './edition-store.js';

const sourceScripts = fileURLToPath(new URL('.', import.meta.url));
const sample = await readFile(new URL('../packages/cybersecurity-digest/examples/sample-digest.md', import.meta.url), 'utf8');

const edition = ({ summary = 'Uno [1] y dos [2].', items = [
  '**[1] Aviso uno**\n- Fuente: https://example.com/one\n- Hechos: uno.',
  '**[2] Aviso dos**\n- Fuente: https://example.com/two\n- Hechos: dos.',
], extra = '' } = {}) =>
  `${summary === null ? '' : `## Resumen\n\n${summary}\n\n`}## En seguimiento\n\n${items.join('\n\n')}\n${extra}`;

test('the fictional sample and a minimal cited edition are publishable', () => {
  assert.deepEqual(checkEdition(sample), []);
  assert.deepEqual(checkEdition(edition()), []);
});

test('an edition without a summary or without numbered items is not publishable', () => {
  assert.deepEqual(checkEdition(edition({ summary: null })), ['missing Resumen summary']);
  assert.deepEqual(checkEdition('## Resumen\n\nNada que contar.\n'), ['no numbered items']);
});

test('every item needs a number, a source URL and a citation in the summary', () => {
  assert.deepEqual(checkEdition(edition({ items: [
    '**[1] Aviso uno**\n- Fuente: https://example.com/one',
    '**[2] Aviso dos**\n- Fuente: cuenta sin enlace',
  ] })), ['item [2] has no source URL']);
  assert.deepEqual(checkEdition(edition({ summary: 'Solo uno [1].' })), ['item [2] is not cited in the summary']);
  assert.deepEqual(checkEdition(edition({ extra: '\n**Aviso sin número**\n- Fuente: https://example.com/three\n' })),
    ['item 3 has no number']);
  assert.deepEqual(checkEdition(edition({ summary: 'Uno [1], dos [2] y tres [3].' })), ['summary cites missing item [3]']);
  assert.deepEqual(checkEdition(edition({ items: [
    '**[1] Aviso uno**\n- Fuente: https://example.com/one',
    '**[2] Aviso dos**\n- Fuente: https://example.com/two',
    '**[2] Aviso repetido**\n- Fuente: https://example.com/three',
  ] })), ['duplicate item number [2]']);
});

test('operator notes that survive the exporter block publication', () => {
  const leaks = [
    edition({ extra: '\nNOTA DE OPERACIÓN: CANALES SIN CONFIGURAR\n' }),
    edition({ extra: '\n> Nota de operación: canales sin configurar\n' }),
    edition({ extra: '\n*Nota de operación — canales sin configurar*\n' }),
    edition({ extra: '\n## Nota de operación\n\nCanales sin configurar.\n' }),
    edition({ extra: '\n- Nota de operación: canales sin configurar\n' }),
    `Nota de operación: canales sin configurar\n\n${edition()}`,
    edition({ summary: 'Uno [1] y dos [2]. Faltan feeds: Missing local podcasts feed.' }),
  ];
  for (const text of leaks) assert.deepEqual(checkEdition(text), ['operator note in public text'], text);
  assert.deepEqual(checkEdition(edition({ extra: '\n## Estado de operación (operador)\n\nCanales sin configurar.\n' })), []);
});

test('operator notes in other wordings and raw collection errors block publication, even where the exporter hides the label', () => {
  const leaks = [
    edition({ extra: '\n*Nota: errores registrados: «Cybersecurity x feed problem: X API: Rate limited, skipping remaining accounts».*\n' }),
    edition({ extra: '\n**Nota de operación:**\nErrores: Cybersecurity x feed problem: X API: Failed to fetch tweets for @incibe_cert: HTTP 403\n' }),
    edition({ extra: '\n*Nota de operación: los canales de podcasts y blogs no están configurados.*\n' }),
    edition({ extra: '\n*Nota: los canales de podcasts y blogs no están configurados.*\n' }),
    edition({ extra: '\nNota operativa: sin novedades de blogs.\n' }),
    edition({ extra: '\n## Estado operativo\n\nTodo correcto.\n' }),
    edition({ extra: '\n## Estado de la recolección\n\nTodo correcto.\n' }),
    edition({ extra: '\nOperator status: podcasts feed unavailable.\n' }),
    edition({ summary: 'Uno [1] y dos [2]. Esta edición no incluye podcasts ni blogs.' }),
    edition({ extra: '\nFaltan los feeds locales de podcasts.\n' }),
    edition({ extra: '\nPodcast: Error processing Darknet Diaries: timeout\n' }),
    edition({ extra: '\nCould not fetch cybersecurity podcasts feed\n' }),
  ];
  for (const text of leaks) assert.ok(checkEdition(text).includes('operator note in public text'), text);
});

test('a compliant operator section and a bold source label do not block publication', () => {
  assert.deepEqual(checkEdition(edition({ extra: [
    '', '## Estado de operación (operador)', '', '**Canales**',
    '- Podcasts y blogs: sin configurar (Missing local podcasts feed).',
    '- X: Cybersecurity x feed problem: X API: Rate limited.', '',
  ].join('\n') })), []);
  assert.deepEqual(checkEdition(edition({ items: [
    '**[1] Aviso uno**\n- **Fuente:** https://example.com/one',
    '**[2] Aviso dos**\n- **Fuente**: https://example.com/two',
  ] })), []);
});

test('a local path of the running machine blocks publication', () => {
  const text = edition({ extra: "\nError: ENOENT, open '/home/tester/.follow-builders/config.json'\n" });
  assert.deepEqual(checkEdition(text, { privatePaths: ['/home/tester'] }), ['local path in public text']);
  assert.deepEqual(checkEdition(text, { privatePaths: ['/home/someone-else'] }), []);
});

test('an edition is due at 12:00 Madrid time three Madrid calendar days after the last one', () => {
  const last = '2026-10-13T20:05:10.412Z'; // 22:05 in Madrid (CEST) on 13 October
  assert.deepEqual(publicationDue(new Date('2026-10-16T09:59:59.000Z'), last),
    { due: false, reason: 'before 12:00 Europe/Madrid' });
  assert.deepEqual(publicationDue(new Date('2026-10-16T10:00:00.000Z'), last),
    { due: true, reason: 'last edition 2026-10-13, due from 2026-10-16' });
  assert.deepEqual(publicationDue(new Date('2026-10-15T15:00:00.000Z'), last),
    { due: false, reason: 'last edition 2026-10-13, next due 2026-10-16' });
  assert.deepEqual(publicationDue(new Date('2026-10-13T21:00:00.000Z'), last),
    { due: false, reason: 'last edition 2026-10-13, next due 2026-10-16' });
  assert.deepEqual(publicationDue(new Date('2026-10-20T10:00:00.000Z'), last).due, true);
  assert.deepEqual(publicationDue(new Date('2026-10-16T10:00:00.000Z'), null), { due: true, reason: 'no saved edition' });
});

test('the cadence follows Madrid dates and noon across the DST change', () => {
  // 22:30 UTC on 13 October is 00:30 on 14 October in Madrid.
  assert.equal(publicationDue(new Date('2026-10-16T10:00:00.000Z'), '2026-10-13T22:30:00.000Z').due, false);
  // Madrid switches to CET (UTC+1) on 25 October 2026: noon is 11:00 UTC.
  assert.equal(publicationDue(new Date('2026-10-26T10:30:00.000Z'), '2026-10-23T10:00:00.000Z').due, false);
  assert.equal(publicationDue(new Date('2026-10-26T11:00:00.000Z'), '2026-10-23T10:00:00.000Z').due, true);
});

async function repository() {
  const root = await mkdtemp(join(tmpdir(), 'publish-edition-test-'));
  for (const name of ['ai-builders-digest', 'cybersecurity-digest', 'digest-core']) {
    await mkdir(join(root, 'packages', name), { recursive: true });
  }
  await mkdir(join(root, 'scripts'));
  for (const name of ['publish-edition.js', 'export-web-editions.js', 'edition-store.js', 'package-runtime.js']) {
    await copyFile(join(sourceScripts, name), join(root, 'scripts', name));
  }
  await writeFile(join(root, 'scripts', 'package.json'), '{"type":"module"}\n');
  return root;
}

const cli = (root, args) => spawnSync(process.execPath, [join(root, 'scripts', 'publish-edition.js'), ...args], {
  cwd: root, encoding: 'utf8', env: { PATH: process.env.PATH },
});

test('CLI --due prints a due line for the workflow and the reason on stderr', async () => {
  const root = await repository();
  assert.equal(cli(root, ['--package', 'cybersecurity-digest', '--due', '--now', '2026-10-16T10:00:00.000Z']).stdout,
    'due=true\n');
  await saveEdition({ packageId: 'cybersecurity-digest', language: 'es', generatedAt: '2026-10-13T20:05:10.412Z', text: sample }, root);
  const run = cli(root, ['--package', 'cybersecurity-digest', '--due', '--now', '2026-10-15T10:00:00.000Z']);
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stdout, 'due=false\n');
  assert.equal(run.stderr, 'Not due: last edition 2026-10-13, next due 2026-10-16\n');
});

test('CLI publishes a passing edition: saves it with the run time and exports the web data', async () => {
  const root = await repository();
  const file = join(root, 'edition.md');
  await writeFile(file, sample);
  const run = cli(root, ['--package', 'cybersecurity-digest', '--file', file, '--now', '2026-10-16T10:00:00.000Z']);
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stdout, 'Published cybersecurity-digest edition generated at 2026-10-16T10:00:00.000Z\n');
  const saved = JSON.parse(await readFile(join(root, 'editions', 'cybersecurity-digest', 'latest.json'), 'utf8'));
  assert.deepEqual(saved, { packageId: 'cybersecurity-digest', language: 'es', generatedAt: '2026-10-16T10:00:00.000Z', text: sample });
  assert.match(await readFile(join(root, 'web', 'data', 'editions.js'), 'utf8'), /"ref": 3/);
});

test('CLI refuses a failing edition, names every problem and keeps the previous edition', async () => {
  const root = await repository();
  await saveEdition({ packageId: 'cybersecurity-digest', language: 'es', generatedAt: '2026-10-13T20:05:10.412Z', text: sample }, root);
  const latest = join(root, 'editions', 'cybersecurity-digest', 'latest.json');
  const before = await readFile(latest, 'utf8');
  const file = join(root, 'edition.md');
  await writeFile(file, edition({ summary: 'Solo uno [1].', extra: '\nNOTA DE OPERACIÓN: SIN FEEDS\n' }));
  const run = cli(root, ['--package', 'cybersecurity-digest', '--file', file, '--now', '2026-10-16T10:00:00.000Z']);
  assert.equal(run.status, 1);
  assert.equal(run.stdout, '');
  assert.equal(run.stderr, 'Not published: item [2] is not cited in the summary; operator note in public text\n');
  assert.equal(await readFile(latest, 'utf8'), before);
  await assert.rejects(readFile(join(root, 'web', 'data', 'editions.js')), { code: 'ENOENT' });
});

test('CLI rejects unknown or incomplete arguments with its usage', async () => {
  const root = await repository();
  for (const args of [[], ['--package', 'cybersecurity-digest'], ['--package', 'cybersecurity-digest', '--due', '--file', 'x'],
    ['--package', 'cybersecurity-digest', '--due', '--now', 'tomorrow'], ['--package', 'cybersecurity-digest', '--force']]) {
    const run = cli(root, args);
    assert.equal(run.status, 1, args.join(' '));
    assert.match(run.stderr, /Usage: node scripts\/publish-edition\.js --package <id> (?:--due|--file <text-file>)|Invalid or duplicate argument|Invalid --now/);
  }
});
