#!/usr/bin/env node
// Unattended publication: decides when an edition is due and publishes a generated edition
// only when the public page would pass the automatic check. A refused edition saves nothing.
import { realpathSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { readLatestEdition, saveEdition } from './edition-store.js';
import { exportWebEditions, parseEdition } from './export-web-editions.js';
import { selectPackageId } from './package-runtime.js';

const SOURCE_LABEL = /^(?:fuentes?|sources?)$/i;
const CITATION = /\[(\d{1,3})\]/g;
// Operator notes and collection errors the exporter did not drop.
const OPERATOR_TEXT = /nota de operaci[oó]n|nota del operador|operator note|estado de operaci[oó]n|\((?:operador|operator)\)|\b(?:missing|cannot read|invalid) local [a-z]+ feed\b|could not (?:read config|load prompt)|no usable local feed/i;
const MADRID = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
});
const DAY = 86_400_000;
const USAGE = 'Usage: node scripts/publish-edition.js --package <id> --due [--now ISO-UTC]\n' +
  '       node scripts/publish-edition.js --package <id> --file <text-file> [--now ISO-UTC]';

function publicText({ title, summary, blocks }) {
  const parts = [title];
  const add = (segments) => segments.forEach((segment) => parts.push(segment.text, segment.href ?? ''));
  summary.forEach(add);
  for (const block of blocks) {
    if (block.type === 'section') parts.push(block.text);
    else if (block.type === 'paragraph') add(block.text);
    else if (block.type === 'list') block.items.forEach(add);
    else {
      parts.push(block.title);
      for (const field of block.fields) {
        parts.push(field.label ?? '');
        add(field.value);
      }
    }
  }
  return parts.join('\n');
}

// Returns the reasons the public page must not be published; an empty list means publishable.
export function checkEdition(text, { privatePaths = [homedir()] } = {}) {
  const parsed = parseEdition(text);
  const items = parsed.blocks.filter((block) => block.type === 'item');
  const problems = [];
  if (!parsed.summary.length) problems.push('missing Resumen summary');
  if (!items.some((item) => item.ref)) problems.push('no numbered items');

  const cited = new Set(parsed.summary.flat().filter((segment) => segment.ref).map((segment) => segment.ref));
  const seen = new Set();
  items.forEach((item, index) => {
    if (!item.ref) {
      problems.push(`item ${index + 1} has no number`);
      return;
    }
    const sourced = item.fields.some((field) => SOURCE_LABEL.test(field.label ?? '') && field.value.some((segment) => segment.href));
    if (!sourced) problems.push(`item [${item.ref}] has no source URL`);
    if (seen.has(item.ref)) problems.push(`duplicate item number [${item.ref}]`);
    else if (parsed.summary.length && !cited.has(item.ref)) problems.push(`item [${item.ref}] is not cited in the summary`);
    seen.add(item.ref);
  });
  for (const segment of parsed.summary.flat()) {
    if (segment.ref || segment.href || segment.bold) continue;
    for (const match of segment.text.matchAll(CITATION)) problems.push(`summary cites missing item [${match[1]}]`);
  }

  const visible = publicText(parsed);
  if (OPERATOR_TEXT.test(visible)) problems.push('operator note in public text');
  if (privatePaths.some((path) => path.length > 1 && visible.includes(path))) problems.push('local path in public text');
  return problems;
}

function madrid(date) {
  const part = Object.fromEntries(MADRID.formatToParts(date).map(({ type, value }) => [type, value]));
  return { day: Date.UTC(Number(part.year), Number(part.month) - 1, Number(part.day)) / DAY, hour: Number(part.hour) };
}

const isoDay = (day) => new Date(day * DAY).toISOString().slice(0, 10);

// Due at or after 12:00 Europe/Madrid once three Madrid calendar days have passed since the last edition.
export function publicationDue(now, lastGeneratedAt) {
  const today = madrid(now);
  if (today.hour < 12) return { due: false, reason: 'before 12:00 Europe/Madrid' };
  if (!lastGeneratedAt) return { due: true, reason: 'no saved edition' };
  const last = madrid(new Date(lastGeneratedAt)).day;
  const due = today.day - last >= 3;
  return { due, reason: `last edition ${isoDay(last)}, ${due ? 'due from' : 'next due'} ${isoDay(last + 3)}` };
}

function parseArguments(args) {
  const values = {};
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (flag === '--due' && !('--due' in values)) {
      values[flag] = true;
    } else if (['--package', '--file', '--now'].includes(flag) && !(flag in values) &&
        args[index + 1] && !args[index + 1].startsWith('--')) {
      values[flag] = args[++index];
    } else {
      throw new Error(`Invalid or duplicate argument: ${flag}`);
    }
  }
  if (!values['--package'] || Boolean(values['--due']) === Boolean(values['--file'])) throw new Error(USAGE);
  const now = values['--now'] ? new Date(values['--now']) : new Date();
  if (values['--now'] && (Number.isNaN(now.getTime()) || now.toISOString() !== values['--now'])) {
    throw new Error('Invalid --now: canonical ISO UTC time required');
  }
  return { packageId: selectPackageId(['--package', values['--package']]), due: values['--due'], file: values['--file'], now };
}

async function main() {
  const { packageId, due, file, now } = parseArguments(process.argv.slice(2));
  const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
  if (due) {
    let last = null;
    try {
      last = (await readLatestEdition(packageId, repositoryRoot)).generatedAt;
    } catch (error) {
      if (error.message !== `No saved edition for ${packageId}`) throw error;
    }
    const result = publicationDue(now, last);
    process.stdout.write(`due=${result.due}\n`);
    process.stderr.write(`${result.due ? 'Due' : 'Not due'}: ${result.reason}\n`);
    return;
  }
  const text = await readFile(file, 'utf8');
  const problems = checkEdition(text);
  if (problems.length) throw new Error(`Not published: ${problems.join('; ')}`);
  const generatedAt = now.toISOString();
  await saveEdition({ packageId, language: 'es', generatedAt, text }, repositoryRoot);
  await exportWebEditions(repositoryRoot);
  process.stdout.write(`Published ${packageId} edition generated at ${generatedAt}\n`);
}

function invokedDirectly() {
  try {
    return realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
}

if (process.argv[1] && invokedDirectly()) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
