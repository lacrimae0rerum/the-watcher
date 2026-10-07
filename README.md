**English** | [中文](README.zh-CN.md)

# The Watcher

The Watcher is an independent digest platform. Its initial theme is AI Builders Digest.

AI builders digest — monitors top AI builders on X and YouTube podcasts, remixes their content into digestible summaries. Follow builders, not influencers.

**Philosophy:** Follow people who build products and have original opinions, not
influencers who regurgitate information.

## What You Get

A daily or weekly digest delivered to your preferred messaging app (Telegram, Discord,
WhatsApp, etc.) with:

- Summaries of new podcast episodes from top AI podcasts
- Key posts and insights from 26 curated AI builders on X/Twitter
- Full articles from official AI company blogs (Anthropic Engineering, Claude Blog)
- Links to all original content
- Available in English, Chinese, or bilingual

## Quick Start

1. Install the skill in your agent (OpenClaw or Claude Code).
2. Say "set up AI builders digest" or invoke `/the-watcher`.
3. The agent walks you through setup conversationally — no config files to edit.

The agent will ask you:
- How often you want your digest (daily or weekly) and what time
- What language you prefer
- How you want it delivered (Telegram, email, or in-chat)

Readers need no collection API keys; the repository operator must configure collection
credentials and publish a working feed first. A digest can arrive after the feed is
available and delivery is configured.

## Changing Settings

Your delivery preferences are configurable through conversation. Just tell your agent:

- "Switch to weekly digests on Monday mornings"
- "Change language to Chinese"
- "Make the summaries shorter"
- "Show me my current settings"

The source list (builders and podcasts) is curated centrally and updates
through the central feed when collection is operational.

## Customizing the Summaries

The skill uses plain-English prompt files to control how content is summarized.
You can customize them two ways:

**Through conversation (recommended):**
Tell your agent what you want — "Make summaries more concise," "Focus on actionable
insights," "Use a more casual tone." The agent updates the prompts for you.

**Direct editing (power users):**
Edit the files in `packages/ai-builders-digest/prompts/`:
- `summarize-podcast.md` — how podcast episodes are summarized
- `summarize-tweets.md` — how X/Twitter posts are summarized
- `summarize-blogs.md` — how blog posts are summarized
- `digest-intro.md` — the overall digest format and tone
- `translate.md` — how English content is translated to Chinese

These are plain English instructions, not code. Changes take effect on the next digest.

## Default Sources

### Podcasts (6)
- [Latent Space](https://www.youtube.com/@LatentSpacePod)
- [Training Data](https://www.youtube.com/playlist?list=PLOhHNjZItNnMm5tdW61JpnyxeYH5NDDx8)
- [No Priors](https://www.youtube.com/@NoPriorsPodcast)
- [Unsupervised Learning](https://www.youtube.com/@RedpointAI)
- [The MAD Podcast with Matt Turck](https://www.youtube.com/@DataDrivenNYC)
- [AI & I by Every](https://www.youtube.com/playlist?list=PLuMcoKK9mKgHtW_o9h5sGO2vXrffKHwJL)

### AI Builders on X (26)
[Andrej Karpathy](https://x.com/karpathy), [Swyx](https://x.com/swyx), [Josh Woodward](https://x.com/joshwoodward), [Boris Cherny](https://x.com/bcherny), [Thibault Sottiaux](https://x.com/thsottiaux), [Peter Yang](https://x.com/petergyang), [Nan Yu](https://x.com/thenanyu), [Madhu Guru](https://x.com/realmadhuguru), [Amanda Askell](https://x.com/AmandaAskell), [Cat Wu](https://x.com/_catwu), [Thariq](https://x.com/trq212), [Google Labs](https://x.com/GoogleLabs), [Amjad Masad](https://x.com/amasad), [Guillermo Rauch](https://x.com/rauchg), [Alex Albert](https://x.com/alexalbert__), [Aaron Levie](https://x.com/levie), [Ryo Lu](https://x.com/ryolu_), [Garry Tan](https://x.com/garrytan), [Matt Turck](https://x.com/mattturck), [Zara Zhang](https://x.com/zarazhangrui), [Nikunj Kothari](https://x.com/nikunj), [Peter Steinberger](https://x.com/steipete), [Dan Shipper](https://x.com/danshipper), [Aditya Agarwal](https://x.com/adityaag), [Sam Altman](https://x.com/sama), [Claude](https://x.com/claudeai)

### Official Blogs (2)
- [Anthropic Engineering](https://www.anthropic.com/engineering) — technical deep-dives from the Anthropic team
- [Claude Blog](https://claude.com/blog) — product announcements and updates from Claude

## Installation

Install from Git after the independent repository is published. Registry publication
is unknown; no ClawHub package is available from this project at this time.

### OpenClaw
```bash
git clone https://github.com/lacrimae0rerum/the-watcher.git ~/skills/the-watcher
cd ~/skills/the-watcher/scripts && npm install
```

### Claude Code
```bash
git clone https://github.com/lacrimae0rerum/the-watcher.git ~/.claude/skills/the-watcher
cd ~/.claude/skills/the-watcher/scripts && npm install
```

## Requirements

- An AI agent (OpenClaw, Claude Code, or similar)
- Internet connection (to fetch the central feed)

Readers do not need collection API keys. The repository operator needs
`X_BEARER_TOKEN` and `POD2TXT_API_KEY` for collection; scheduled updates are
not operational until those credentials are configured and a run succeeds.

## How It Works

1. A scheduled workflow can update the central feed with content from the sources
   (blog articles via web scraping, podcast transcripts via pod2txt, X/Twitter via the official API)
2. The preparation script makes three feed requests in parallel and up to five remote
   prompt requests, while preferring user overrides and retaining bundled fallbacks
3. Your agent remixes the raw content into a digestible summary using your preferences
4. The digest is delivered to your messaging app (or shown in-chat)

`ai-builders-digest` owns the source catalog, user configuration schema, prompts,
editorial policy, and branding. It uses the generic `digest-core` collection,
preparation, and delivery interfaces without putting AI-builder policy in the core.

See [the sample digest](packages/ai-builders-digest/examples/sample-digest.md) for what the output looks like.

## Privacy

- Readers do not send collection API keys to the skill; the operator runs central collection
- If you use Telegram/email delivery, those keys are stored locally in `~/.ai-builders-digest/.env`
- The skill only reads public content (public blog posts, public YouTube videos, public X posts)
- Your configuration, preferences, and reading history stay on your machine
