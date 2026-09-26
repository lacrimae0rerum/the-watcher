import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const declaration = 'AI builders digest — monitors top AI builders on X and YouTube podcasts, remixes their content into digestible summaries. Follow builders, not influencers.';

export const digestPackage = Object.freeze({
  id: 'ai-builders-digest',
  declaration,
});

export const sources = Object.freeze({
  catalog: new URL('./config/default-sources.json', import.meta.url),
  channels: Object.freeze(['x', 'podcasts', 'blogs']),
});

export const config = Object.freeze({
  schema: new URL('./config/config-schema.json', import.meta.url),
});

export const prompts = Object.freeze({
  summarizePodcast: new URL('./prompts/summarize-podcast.md', import.meta.url),
  summarizeTweets: new URL('./prompts/summarize-tweets.md', import.meta.url),
  summarizeBlogs: new URL('./prompts/summarize-blogs.md', import.meta.url),
  digestIntro: new URL('./prompts/digest-intro.md', import.meta.url),
  translate: new URL('./prompts/translate.md', import.meta.url),
});

export const preparation = Object.freeze({
  feeds: Object.freeze([
    Object.freeze({
      id: 'x',
      contentKey: 'x',
      url: 'https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-x.json',
      unavailableMessage: 'Could not fetch tweet feed',
      problemPrefix: 'Tweet feed problem',
    }),
    Object.freeze({
      id: 'podcasts',
      contentKey: 'podcasts',
      url: 'https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-podcasts.json',
      unavailableMessage: 'Could not fetch podcast feed',
      problemPrefix: 'Podcast feed problem',
    }),
    Object.freeze({
      id: 'blogs',
      contentKey: 'blogs',
      url: 'https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-blogs.json',
      unavailableMessage: 'Could not fetch blog feed',
      problemPrefix: 'Blog feed problem',
    }),
  ]),
  promptBaseUrl: 'https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/packages/ai-builders-digest/prompts/',
});

export const delivery = Object.freeze({
  email: Object.freeze({
    sender: 'AI Builders Digest <digest@resend.dev>',
    subjectPrefix: 'AI Builders Digest',
    subjectLocale: 'en-US',
    subjectDateOptions: Object.freeze({
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  }),
});

export const editorialPolicies = Object.freeze({
  substantiveContentOnly: true,
  originalSourceLinksRequired: true,
  fabricationAllowed: false,
  tone: 'sharp and conversational',
  mobileFirst: true,
});

export function resolveUserFile(homeDirectory, relativePath, exists = existsSync) {
  const canonical = join(homeDirectory, '.ai-builders-digest', relativePath);
  const legacy = join(homeDirectory, '.follow-builders', relativePath);
  return !exists(canonical) && exists(legacy) ? legacy : canonical;
}

export { createCollectors } from './collection.js';
