#!/usr/bin/env node
// Exports each watcher's saved edition into web/data/editions.js as structured,
// link-safe blocks for the public site. Reads editions/ only; never writes there.
import { randomUUID } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { mkdir, readdir, rename, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readLatestEdition } from './edition-store.js';

const OPERATOR_ONLY = /\((?:operador|operator)\)/i;
const OPERATOR_NOTE = /^[*_]*\s*(?:nota (?:de operaci[oó]n|del operador)|operator note)\s*:/i;
const HEADING = /^(#{1,6})\s+(.+?)\s*#*$/;
const STRONG_LINE = /^\*\*([^*].*?)\*\*:?$/;
const BULLET = /^(?:[-*•]|\d+[.)])\s+(.+)$/;
const FIELD = /^\*{0,2}([^:*]{1,40}?)\*{0,2}:\s+(.+)$/;
const INLINE = /\*\*(.+?)\*\*|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>"']+)/g;
const TRAILING_PUNCTUATION = /[.,;:!?)\]]+$/;
const SUMMARY_HEADING = /^(?:resumen|summary)$/i;
const NUMBERED_ITEM = /^\[(\d{1,3})\]\s+(.+)$/;
const CITATION = /\[(\d{1,3})\]/g;
const OUTPUT = ['web', 'data', 'editions.js'];

// Inline text becomes plain, bold, or http(s)-only link segments.
export function parseInline(text) {
  const segments = [];
  const push = (segment) => {
    if (!segment.text) return;
    const last = segments.at(-1);
    if (last && !last.bold && !last.href && !segment.bold && !segment.href) last.text += segment.text;
    else segments.push(segment);
  };
  let index = 0;
  for (const match of text.matchAll(INLINE)) {
    push({ text: text.slice(index, match.index) });
    index = match.index + match[0].length;
    if (match[1] !== undefined) {
      push({ text: match[1], bold: true });
    } else if (match[2] !== undefined) {
      push({ text: match[2], href: match[3] });
    } else {
      const url = match[4].replace(TRAILING_PUNCTUATION, '');
      push({ text: url, href: url });
      push({ text: match[4].slice(url.length) });
    }
  }
  push({ text: text.slice(index) });
  return segments;
}

function isCapsHeading(line) {
  return line.length <= 60 && !/https?:\/\//i.test(line) && /\p{Lu}/u.test(line) && !/\p{Ll}/u.test(line);
}

function parseField(text) {
  const match = text.match(FIELD);
  if (!match) return { label: null, value: parseInline(text) };
  return { label: match[1].trim(), value: parseInline(match[2]) };
}

// Summary citations become reference segments only when that numbered item exists.
function cite(segments, refs) {
  const out = [];
  const plain = (text) => {
    const last = out.at(-1);
    if (last && Object.keys(last).length === 1) last.text += text;
    else out.push({ text });
  };
  for (const segment of segments) {
    if (segment.href || segment.bold) {
      out.push(segment);
      continue;
    }
    let at = 0;
    for (const match of segment.text.matchAll(CITATION)) {
      const ref = Number(match[1]);
      if (!refs.has(ref)) continue;
      if (match.index > at) plain(segment.text.slice(at, match.index));
      out.push({ text: match[0], ref });
      at = match.index + match[0].length;
    }
    if (at < segment.text.length) plain(segment.text.slice(at));
  }
  return out;
}

// Editions are model-written markdown or plain text. Operator-only blocks and lines that
// open with an operator-note label are dropped.
// A `Resumen` section becomes the summary; `**[n] Heading**` items carry their number.
export function parseEdition(text) {
  const blocks = [];
  const summary = [];
  let title = '';
  let item = null;
  let list = null;
  let sectionSkip = false;
  let itemSkip = false;
  let inSummary = false;

  for (const raw of String(text).replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim();
    if (!line) {
      list = null;
      continue;
    }
    const heading = line.match(HEADING);
    const strong = line.match(STRONG_LINE);
    const strongTitle = strong && !strong[1].includes('**') ? strong[1].trim() : null;
    const bullet = line.match(BULLET);

    if (!title && !blocks.length && !summary.length && !inSummary && !bullet &&
        !(heading && heading[1].length > 1)) {
      title = heading ? heading[2].trim() : strongTitle ?? line;
      continue;
    }
    if (heading || (!bullet && !strongTitle && isCapsHeading(line))) {
      const sectionTitle = heading ? heading[2].trim() : line;
      item = list = null;
      itemSkip = false;
      inSummary = SUMMARY_HEADING.test(sectionTitle);
      sectionSkip = !inSummary && OPERATOR_ONLY.test(sectionTitle);
      if (!sectionSkip && !inSummary) blocks.push({ type: 'section', text: sectionTitle });
      continue;
    }
    if (sectionSkip) continue;
    if (!bullet && !strongTitle && OPERATOR_NOTE.test(line)) {
      item = list = null;
      continue;
    }
    if (inSummary && !strongTitle) {
      summary.push(bullet ? bullet[1] : line);
      continue;
    }
    if (strongTitle) {
      inSummary = false;
      list = null;
      itemSkip = OPERATOR_ONLY.test(strongTitle) || OPERATOR_NOTE.test(strongTitle);
      const numbered = strongTitle.match(NUMBERED_ITEM);
      item = itemSkip ? null : numbered
        ? { type: 'item', ref: Number(numbered[1]), title: numbered[2].trim(), fields: [] }
        : { type: 'item', title: strongTitle, fields: [] };
      if (item) blocks.push(item);
      continue;
    }
    if (itemSkip) continue;
    if (bullet) {
      if (item) {
        item.fields.push(parseField(bullet[1]));
        continue;
      }
      if (!list) {
        list = { type: 'list', items: [] };
        blocks.push(list);
      }
      list.items.push(parseInline(bullet[1]));
      continue;
    }
    item = list = null;
    blocks.push({ type: 'paragraph', text: parseInline(line) });
  }
  const refs = new Set(blocks.filter((block) => block.ref).map((block) => block.ref));
  return { title, summary: summary.map((line) => cite(parseInline(line), refs)), blocks };
}

export async function exportWebEditions(repositoryRoot) {
  const entries = await readdir(join(repositoryRoot, 'packages'), { withFileTypes: true });
  const ids = entries
    .filter((entry) => entry.isDirectory() && entry.name.endsWith('-digest'))
    .map((entry) => entry.name)
    .sort();
  const editions = {};
  const exported = [];
  const missing = [];
  for (const id of ids) {
    let edition;
    try {
      edition = await readLatestEdition(id, repositoryRoot);
    } catch (error) {
      if (error.message !== `No saved edition for ${id}`) throw error;
      missing.push(id);
      continue;
    }
    editions[id] = { language: edition.language, generatedAt: edition.generatedAt, ...parseEdition(edition.text) };
    exported.push(id);
  }

  const path = join(repositoryRoot, ...OUTPUT);
  const directory = join(repositoryRoot, ...OUTPUT.slice(0, -1));
  const temporary = join(directory, `.editions-${randomUUID()}.tmp`);
  await mkdir(directory, { recursive: true });
  try {
    await writeFile(temporary,
      '// Generated by scripts/export-web-editions.js from editions/. Do not edit.\n' +
      `window.WATCHERS_EDITIONS = ${JSON.stringify(editions, null, 2)};\n`,
      { flag: 'wx' });
    await rename(temporary, path);
  } catch (error) {
    await unlink(temporary).catch(() => {});
    throw error;
  }
  return { exported, missing, path };
}

async function main() {
  if (process.argv.length > 2) throw new Error('Usage: node scripts/export-web-editions.js');
  const { exported, missing } = await exportWebEditions(fileURLToPath(new URL('..', import.meta.url)));
  const count = `${exported.length} edition${exported.length === 1 ? '' : 's'}`;
  const pending = missing.length ? `; no edition yet: ${missing.join(', ')}` : '';
  process.stdout.write(`Exported ${count} to ${OUTPUT.join('/')} (${exported.join(', ') || 'none'})${pending}\n`);
}

// Compare real paths: temp and home directories are often reached through symlinks.
// argv[1] is not a file when this module is imported from stdin or -e scripts.
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
