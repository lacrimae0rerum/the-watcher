#!/usr/bin/env node

// ============================================================================
// Digest Package — Delivery Script
// ============================================================================
// Sends a digest to the user via their chosen delivery method.
// Supports: Telegram bot, Email (via Resend), X Article, or stdout (default).
//
// Usage:
//   echo "digest text" | node deliver.js
//   node deliver.js --message "digest text"
//   node deliver.js --file /path/to/digest.txt
//
// The script reads delivery config and API keys from the selected package's user files.
//
// Delivery methods:
//   - "telegram": sends via Telegram Bot API (needs TELEGRAM_BOT_TOKEN + chat ID)
//   - "email": sends via Resend API (needs RESEND_API_KEY + email address)
//   - "x-article": draft then publish with a runtime user-auth token and local receipt
//   - "stdout" (default): just prints to terminal
// ============================================================================

import { createHmac, randomBytes } from 'node:crypto';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { fileURLToPath } from 'node:url';
import { deliver } from '../packages/digest-core/index.js';
import { createDeliveryState, editionIdentity } from './delivery-state.js';
import {
  loadDigestPackage,
  resolveDeliveryRuntime,
  selectPackageId,
} from './package-runtime.js';

// -- Read input --------------------------------------------------------------

// The digest text can come from stdin, --message flag, or --file flag
async function getDigestText() {
  const args = process.argv.slice(2);

  // Check --message flag
  const msgIdx = args.indexOf('--message');
  if (msgIdx !== -1 && args[msgIdx + 1]) {
    return args[msgIdx + 1];
  }

  // Check --file flag
  const fileIdx = args.indexOf('--file');
  if (fileIdx !== -1 && args[fileIdx + 1]) {
    return await readFile(args[fileIdx + 1], 'utf-8');
  }

  // Read from stdin
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

// -- Telegram Delivery -------------------------------------------------------

// Sends the digest via Telegram Bot API.
// The user creates a bot via @BotFather and provides the token.
// The chat ID is obtained when the user sends their first message to the bot.
async function sendTelegram(text, botToken, chatId) {
  // Telegram has a 4096 character limit per message.
  // If the digest is longer, we split it into chunks.
  const MAX_LEN = 4000;
  const chunks = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= MAX_LEN) {
      chunks.push(remaining);
      break;
    }
    // Try to split at a newline near the limit
    let splitAt = remaining.lastIndexOf('\n', MAX_LEN);
    if (splitAt < MAX_LEN * 0.5) splitAt = MAX_LEN;
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt);
  }

  for (const chunk of chunks) {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: chunk,
          parse_mode: 'Markdown',
          disable_web_page_preview: true
        })
      }
    );

    if (!res.ok) {
      const err = await res.json();
      // If Markdown parsing fails, retry without parse_mode
      if (err.description && err.description.includes("can't parse")) {
        await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: chunk,
              disable_web_page_preview: true
            })
          }
        );
      } else {
        throw new Error(`Telegram API error: ${err.description}`);
      }
    }

    // Small delay between chunks to avoid rate limiting
    if (chunks.length > 1) await new Promise(r => setTimeout(r, 500));
  }
}

// -- Email Delivery (Resend) -------------------------------------------------

// Sends the digest via Resend's email API.
// The user provides their own Resend API key and email address.
async function sendEmail(text, apiKey, toEmail, branding) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      from: branding.sender,
      to: [toEmail],
      subject: `${branding.subjectPrefix} — ${new Date().toLocaleDateString(
        branding.subjectLocale,
        branding.subjectDateOptions,
      )}`,
      text: text
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Resend API error: ${err.message || JSON.stringify(err)}`);
  }
}

// -- X Article Delivery ------------------------------------------------------

function oauthEncode(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, character =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

function validateOAuth1(oauth1) {
  const required = ['consumerKey', 'consumerSecret', 'accessToken', 'accessTokenSecret'];
  if (!oauth1 || required.some(key => typeof oauth1[key] !== 'string' || !oauth1[key].trim())) {
    throw new Error('Complete OAuth 1.0a credentials are required');
  }
}

export function createOAuth1Authorization({ method, url, oauth1, nonce, timestamp }) {
  validateOAuth1(oauth1);
  if (typeof nonce !== 'string' || !nonce || typeof timestamp !== 'string' || !/^\d+$/.test(timestamp)) {
    throw new Error('OAuth 1.0a nonce and timestamp are required');
  }
  const parsed = new URL(url);
  const parameters = [
    ...parsed.searchParams.entries(),
    ['oauth_consumer_key', oauth1.consumerKey],
    ['oauth_nonce', nonce],
    ['oauth_signature_method', 'HMAC-SHA1'],
    ['oauth_timestamp', timestamp],
    ['oauth_token', oauth1.accessToken],
    ['oauth_version', '1.0'],
  ].map(([key, value]) => [oauthEncode(key), oauthEncode(value)])
    .sort(([leftKey, leftValue], [rightKey, rightValue]) =>
      (leftKey < rightKey ? -1 : leftKey > rightKey ? 1 :
        leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0));
  const normalized = parameters.map(([key, value]) => `${key}=${value}`).join('&');
  const baseUrl = `${parsed.origin}${parsed.pathname}`;
  const signatureBase = [method.toUpperCase(), baseUrl, normalized].map(oauthEncode).join('&');
  const signingKey = `${oauthEncode(oauth1.consumerSecret)}&${oauthEncode(oauth1.accessTokenSecret)}`;
  const signature = createHmac('sha1', signingKey).update(signatureBase).digest('base64');
  const header = [...parameters.filter(([key]) => key.startsWith('oauth_')),
    ['oauth_signature', oauthEncode(signature)]]
    .sort(([leftKey], [rightKey]) => leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0);
  return `OAuth ${header.map(([key, value]) => `${key}="${value}"`).join(', ')}`;
}

export async function deliverXArticle({
  edition, target, token, oauth1, packageId, repositoryRoot, fetchImpl = fetch,
  state = createDeliveryState({ repositoryRoot }),
  oauthNonce = () => randomBytes(16).toString('hex'),
  oauthTimestamp = () => Math.floor(Date.now() / 1000).toString(),
}) {
  const bearerToken = typeof token === 'string' && token.trim();
  if (bearerToken && oauth1) throw new Error('Use exactly one X Article authentication method');
  if (!bearerToken && oauth1 === undefined) throw new Error('X Article user authentication is required');
  if (oauth1 !== undefined) validateOAuth1(oauth1);
  if (typeof target?.title !== 'string' || !target.title.trim()) throw new Error('delivery.title is required for X Article');
  if (typeof edition?.text !== 'string' || !edition.text.trim()) throw new Error('X Article text is required');
  const identity = editionIdentity(packageId, edition.text);
  if (await state.wasDelivered(packageId, 'x-article', identity)) {
    return { status: 'skipped', method: 'x-article', reason: 'already-delivered' };
  }
  const authorization = (url) => bearerToken
    ? `Bearer ${bearerToken}`
    : createOAuth1Authorization({
      method: 'POST', url, oauth1, nonce: oauthNonce(), timestamp: oauthTimestamp(),
    });
  const blocks = edition.text.split(/\r?\n/).map((text, index) => ({
    key: index.toString(36).padStart(5, '0'), text, type: 'unstyled', depth: 0,
    inlineStyleRanges: [], entityRanges: [], data: {},
  }));
  async function request(url, body, expectedStatus, idField, phase) {
    const uncertain = phase === 'publish' ? '; manual reconciliation required (outcome uncertain)' : '';
    let response;
    try {
      response = await fetchImpl(url, {
        method: 'POST',
        headers: { Authorization: authorization(url), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      throw new Error(`X Article ${phase} transport failed${uncertain}`);
    }
    if (response.status !== expectedStatus) {
      const code = Number.isInteger(response.status) && response.status >= 100 && response.status <= 599
        ? response.status : 'unknown';
      throw new Error(`X Article ${phase} failed (HTTP ${code})${uncertain}`);
    }
    let payload;
    try { payload = await response.json(); } catch { throw new Error(`X Article ${phase} returned invalid JSON${uncertain}`); }
    const id = payload?.data?.[idField];
    if (typeof id !== 'string' || !/^\d+$/.test(id)) throw new Error(`X Article ${phase} returned an invalid ID${uncertain}`);
    return id;
  }
  const articleId = await request('https://api.x.com/2/articles/draft', {
    title: target.title, content_state: { blocks, entities: [] },
  }, 201, 'id', 'draft');
  const postId = await request(`https://api.x.com/2/articles/${articleId}/publish`, {}, 200, 'post_id', 'publish');
  try {
    await state.recordSuccess(packageId, 'x-article', identity);
  } catch {
    throw new Error('X Article published but local state could not be saved; manual reconciliation required (outcome uncertain)');
  }
  return { status: 'ok', method: 'x-article', articleId, postId };
}

// -- Main --------------------------------------------------------------------

async function main() {
  const selected = await loadDigestPackage(selectPackageId(process.argv.slice(2)));
  const { configPath, envPath, email } = resolveDeliveryRuntime(selected, homedir());

  // Load env and config
  const { config: loadEnv } = await import('dotenv');
  loadEnv({ path: envPath });

  let config = {};
  if (existsSync(configPath)) {
    config = JSON.parse(await readFile(configPath, 'utf-8'));
  }

  const deliveryConfig = config.delivery || { method: 'stdout' };
  const digestText = await getDigestText();

  if (!digestText || digestText.trim().length === 0) {
    console.log(JSON.stringify({ status: 'skipped', reason: 'Empty digest text' }));
    return;
  }

  try {
    const adapters = {
      telegram: {
        deliver: async (edition, target) => {
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          const chatId = target.chatId;
          if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN not found in .env');
          if (!chatId) throw new Error('delivery.chatId not found in config.json');
          await sendTelegram(edition.text, botToken, chatId);
          return {
            status: 'ok',
            method: 'telegram',
            message: 'Digest sent to Telegram'
          };
        },
      },
      email: {
        deliver: async (edition, target) => {
          const apiKey = process.env.RESEND_API_KEY;
          const toEmail = target.email;
          if (!apiKey) throw new Error('RESEND_API_KEY not found in .env');
          if (!toEmail) throw new Error('delivery.email not found in config.json');
          await sendEmail(edition.text, apiKey, toEmail, email);
          return {
            status: 'ok',
            method: 'email',
            message: `Digest sent to ${toEmail}`
          };
        },
      },
      'x-article': {
        deliver: (edition, target) => deliverXArticle({
          edition, target, token: process.env.X_ARTICLE_ACCESS_TOKEN,
          packageId: selected.digestPackage.id, repositoryRoot: process.cwd(),
        }),
      },
      stdout: {
        deliver: async (edition) => {
          console.log(edition.text);
          return null;
        },
      },
    };
    const type = Object.hasOwn(adapters, deliveryConfig.method)
      ? deliveryConfig.method
      : 'stdout';
    const result = await deliver({
      edition: { text: digestText },
      target: { ...deliveryConfig, type },
      adapters,
    });
    if (result) {
      console.log(JSON.stringify(result));
    }
  } catch (err) {
    console.log(JSON.stringify({
      status: 'error',
      method: deliveryConfig.method,
      message: err.message
    }));
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
