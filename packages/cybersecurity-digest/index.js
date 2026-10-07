import { join } from 'node:path';

export const declaration = 'Cybersecurity Digest — Spanish defensive updates with source links, uncertainty labels, and evidence-based actions.';

export const digestPackage = Object.freeze({
  id: 'cybersecurity-digest',
  declaration,
});

export const runtime = Object.freeze({
  userAgent: 'Cybersecurity-Digest/1.0 (feed aggregator)',
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

const base = 'https://raw.githubusercontent.com/lacrimae0rerum/the-watcher/main/';

// Intended asset locations only. Feeds are not yet generated or published.
export const preparation = Object.freeze({
  feeds: Object.freeze(['x', 'podcasts', 'blogs'].map((id) => Object.freeze({
    id,
    contentKey: id,
    url: `${base}feeds/cybersecurity-digest/feed-${id}.json`,
    unavailableMessage: `Could not fetch cybersecurity ${id} feed`,
    problemPrefix: `Cybersecurity ${id} feed problem`,
  }))),
  promptBaseUrl: `${base}packages/cybersecurity-digest/prompts/`,
});

// The shared validator requires email branding; this pilot does not select email delivery.
export const delivery = Object.freeze({
  email: Object.freeze({
    sender: 'Cybersecurity Digest <digest@resend.dev>',
    subjectPrefix: 'Cybersecurity Digest',
    subjectLocale: 'es-ES',
    subjectDateOptions: Object.freeze({
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }),
  }),
});

export const editorialPolicies = Object.freeze({
  substantiveContentOnly: true,
  originalSourceLinksRequired: true,
  fabricationAllowed: false,
  language: 'es',
  focus: 'defensive actions with evidence and explicit uncertainty',
});

export function resolveUserFile(homeDirectory, relativePath) {
  return join(homeDirectory, '.cybersecurity-digest', relativePath);
}

export { createCollectors } from './collection.js';
