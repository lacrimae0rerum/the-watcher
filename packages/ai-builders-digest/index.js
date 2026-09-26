export const declaration = 'AI builders digest — monitors top AI builders on X and YouTube podcasts, remixes their content into digestible summaries. Follow builders, not influencers.';

export const sources = Object.freeze({
  catalog: new URL('../../config/default-sources.json', import.meta.url),
  channels: Object.freeze(['x', 'podcasts', 'blogs']),
});

export const prompts = Object.freeze({
  summarizePodcast: new URL('../../prompts/summarize-podcast.md', import.meta.url),
  summarizeTweets: new URL('../../prompts/summarize-tweets.md', import.meta.url),
  summarizeBlogs: new URL('../../prompts/summarize-blogs.md', import.meta.url),
  digestIntro: new URL('../../prompts/digest-intro.md', import.meta.url),
  translate: new URL('../../prompts/translate.md', import.meta.url),
});

export const editorialPolicies = Object.freeze({
  substantiveContentOnly: true,
  originalSourceLinksRequired: true,
  fabricationAllowed: false,
  tone: 'sharp and conversational',
  mobileFirst: true,
});

export { createCollectors } from './collection.js';
