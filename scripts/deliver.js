#!/usr/bin/env node

// ============================================================================
// Digest Package — Delivery Script
// ============================================================================
// Sends a digest to the user via their chosen delivery method.
// Supports: Telegram bot, Email (via Resend), or stdout (default).
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
//   - "stdout" (default): just prints to terminal
// ============================================================================

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { config as loadEnv } from 'dotenv';
import { deliver } from '../packages/digest-core/index.js';
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

// -- Main --------------------------------------------------------------------

async function main() {
  const selected = await loadDigestPackage(selectPackageId(process.argv.slice(2)));
  const { configPath, envPath, email } = resolveDeliveryRuntime(selected, homedir());

  // Load env and config
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

main();
