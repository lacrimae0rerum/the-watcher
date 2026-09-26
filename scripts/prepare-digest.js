#!/usr/bin/env node

// ============================================================================
// AI Builders Digest — Prepare Digest
// ============================================================================
// Gathers everything the LLM needs to produce a digest:
// - Fetches the central feeds (X posts + podcasts + blogs)
// - Fetches the latest prompts from GitHub
// - Reads the user's config (language, delivery method)
// - Outputs a single JSON blob to stdout
//
// The LLM's ONLY job is to read this JSON, remix the content, and output
// the digest text. Everything else is handled here deterministically.
//
// Usage: node prepare-digest.js
// Output: JSON to stdout
// ============================================================================

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { prepare } from '../packages/digest-core/index.js';
import {
  digestPackage,
  preparation,
  prompts as packagePrompts,
  resolveUserFile,
} from '../packages/ai-builders-digest/index.js';

// -- Constants ---------------------------------------------------------------

const CONFIG_PATH = resolveUserFile(homedir(), 'config.json');

// -- Fetch helpers -----------------------------------------------------------

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.text();
}

// -- Main --------------------------------------------------------------------

async function main() {
  const errors = [];

  // 1. Read user config
  let config = {
    language: 'en',
    frequency: 'daily',
    delivery: { method: 'stdout' }
  };
  if (existsSync(CONFIG_PATH)) {
    try {
      config = JSON.parse(await readFile(CONFIG_PATH, 'utf-8'));
    } catch (err) {
      errors.push(`Could not read config: ${err.message}`);
    }
  }

  // 2. Fetch the feeds declared by the thematic package
  const feedResults = await Promise.all(
    preparation.feeds.map(async (feed) => [feed, await fetchJSON(feed.url)]),
  );
  const content = {};
  const feeds = {};
  for (const [feed, result] of feedResults) {
    feeds[feed.id] = result;
    content[feed.contentKey] = result?.[feed.contentKey] || [];
    if (!result) errors.push(feed.unavailableMessage);
    if (result?.errors?.length) {
      errors.push(
        ...result.errors.map((error) => `${feed.problemPrefix}: ${error}`),
      );
    }
  }

  // 3. Load prompts with priority: user custom > remote (GitHub) > local default
  //
  // If the user has a custom prompt at ~/.ai-builders-digest/prompts/<file>,
  // use that (they personalized it — don't overwrite with remote updates).
  // Otherwise, fetch the latest from GitHub so they get central improvements.
  // If GitHub is unreachable, fall back to the local copy shipped with the skill.
  const resolvedPrompts = {};
  for (const bundledPrompt of Object.values(packagePrompts)) {
    const filename = decodeURIComponent(
      new URL(bundledPrompt).pathname.split('/').pop(),
    );
    const key = filename.replace('.md', '').replace(/-/g, '_');
    const userPath = resolveUserFile(homedir(), join('prompts', filename));

    // Priority 1: user's custom prompt (they personalized it)
    if (existsSync(userPath)) {
      resolvedPrompts[key] = await readFile(userPath, 'utf-8');
      continue;
    }

    // Priority 2: latest from GitHub (central updates)
    const remote = await fetchText(new URL(filename, preparation.promptBaseUrl));
    if (remote) {
      resolvedPrompts[key] = remote;
      continue;
    }

    // Priority 3: local copy shipped with the skill
    if (existsSync(bundledPrompt)) {
      resolvedPrompts[key] = await readFile(bundledPrompt, 'utf-8');
    } else {
      errors.push(`Could not load prompt: ${filename}`);
    }
  }

  // 4. Build the generic remix package, then retain the current CLI envelope
  const remix = prepare({
    digestPackage,
    preferences: {
      language: config.language || 'en',
      frequency: config.frequency || 'daily',
      delivery: config.delivery || { method: 'stdout' }
    },
    content,
    prompts: resolvedPrompts,
  });
  const feedX = feeds.x;
  const feedPodcasts = feeds.podcasts;
  const feedBlogs = feeds.blogs;
  const output = {
    status: 'ok',
    generatedAt: new Date().toISOString(),

    // User preferences
    config: remix.preferences,

    // Content to remix
    podcasts: remix.content.podcasts,
    x: remix.content.x,
    blogs: remix.content.blogs,

    // Stats for the LLM to reference
    stats: {
      podcastEpisodes: feedPodcasts?.podcasts?.length || 0,
      xBuilders: feedX?.x?.length || 0,
      totalTweets: (feedX?.x || []).reduce((sum, a) => sum + a.tweets.length, 0),
      blogPosts: feedBlogs?.blogs?.length || 0,
      feedGeneratedAt: feedX?.generatedAt || feedPodcasts?.generatedAt || feedBlogs?.generatedAt || null
    },

    // Prompts — the LLM reads these and follows the instructions
    prompts: remix.prompts,

    // Non-fatal errors
    errors: errors.length > 0 ? errors : undefined
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch(err => {
  console.error(JSON.stringify({
    status: 'error',
    message: err.message
  }));
  process.exit(1);
});
