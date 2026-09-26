import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const expectedDeclaration = 'AI builders digest — monitors top AI builders on X and YouTube podcasts, remixes their content into digestible summaries. Follow builders, not influencers.';

test('ai-builders-digest exports its thematic manifest', async () => {
  const {
    declaration,
    editorialPolicies,
    prompts,
    sources,
  } = await import('./index.js');

  assert.equal(declaration, expectedDeclaration);
  assert.deepEqual(sources.channels, ['x', 'podcasts', 'blogs']);

  const sourceCatalog = JSON.parse(await readFile(sources.catalog, 'utf8'));
  assert.ok(sourceCatalog.x_accounts.length > 0);
  assert.ok(sourceCatalog.podcasts.length > 0);
  assert.ok(sourceCatalog.blogs.length > 0);

  assert.deepEqual(Object.keys(prompts), [
    'summarizePodcast',
    'summarizeTweets',
    'summarizeBlogs',
    'digestIntro',
    'translate',
  ]);
  const promptText = await Promise.all(
    Object.values(prompts).map((prompt) => readFile(prompt, 'utf8')),
  );
  assert.equal(promptText.every((text) => text.startsWith('# ')), true);

  assert.deepEqual(editorialPolicies, {
    substantiveContentOnly: true,
    originalSourceLinksRequired: true,
    fabricationAllowed: false,
    tone: 'sharp and conversational',
    mobileFirst: true,
  });
});
