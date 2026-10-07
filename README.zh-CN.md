[English](README.md) | **中文**

# The Watcher

The Watcher 是独立的摘要平台，初始主题为 AI Builders Digest。

> AI builders digest — monitors top AI builders on X and YouTube podcasts, remixes their content into digestible summaries. Follow builders, not influencers.

这是一个 AI 驱动的信息聚合工具，追踪 AI 领域的重要建造者，并将他们的最新动态整理成易于阅读的摘要。

**理念：** 追踪那些真正在做产品、有独立见解的人，而非只会搬运信息的网红。

## 你会得到什么

每日或每周推送到你常用的通讯工具（Telegram、Discord、WhatsApp 等），包含：

- 顶级 AI 播客新节目的精华摘要
- 26 位精选 AI 建造者在 X/Twitter 上的关键观点和洞察
- AI 公司官方博客的完整文章（Anthropic Engineering、Claude Blog）
- 所有原始内容的链接
- 支持英文、中文或双语版本

## 快速开始

1. 在你的 AI agent 中安装此 skill（OpenClaw 或 Claude Code）
2. 输入 "set up AI builders digest" 或执行 `/the-watcher`
3. Agent 会以对话方式引导你完成设置——不需要手动编辑任何配置文件

Agent 会询问你：
- 推送频率（每日或每周）和时间
- 语言偏好
- 推送方式（Telegram、邮件或直接在聊天中显示）

读者无需提供采集所用的 API key。仓库运营者必须先配置采集凭证，并发布可用的 feed；随后才能按配置获取摘要。

## 修改设置

通过对话即可修改推送偏好。直接告诉你的 agent：

- "改成每周一早上推送"
- "语言换成中文"
- "把摘要写得更简短一些"
- "显示我当前的设置"

信息源列表（建造者和播客）由中心化管理；采集正常运行后，feed 才会更新。

## 自定义摘要风格

Skill 使用纯文本 prompt 文件来控制内容的摘要方式。你可以通过两种方式自定义：

**通过对话（推荐）：**
直接告诉你的 agent——"摘要写得更简练一些"、"多关注可操作的洞察"、"用更轻松的语气"。Agent 会自动帮你更新 prompt。

**直接编辑（高级用户）：**
编辑 `packages/ai-builders-digest/prompts/` 文件夹中的文件：
- `summarize-podcast.md` — 播客节目的摘要方式
- `summarize-tweets.md` — X/Twitter 帖子的摘要方式
- `summarize-blogs.md` — 博客文章的摘要方式
- `digest-intro.md` — 整体摘要的格式和语气
- `translate.md` — 英文内容翻译为中文的方式

这些都是纯文本指令，不是代码。修改后下次推送即生效。

## 默认信息源

### 播客（6个）
- [Latent Space](https://www.youtube.com/@LatentSpacePod)
- [Training Data](https://www.youtube.com/playlist?list=PLOhHNjZItNnMm5tdW61JpnyxeYH5NDDx8)
- [No Priors](https://www.youtube.com/@NoPriorsPodcast)
- [Unsupervised Learning](https://www.youtube.com/@RedpointAI)
- [The MAD Podcast with Matt Turck](https://www.youtube.com/@DataDrivenNYC)
- [AI & I by Every](https://www.youtube.com/playlist?list=PLuMcoKK9mKgHtW_o9h5sGO2vXrffKHwJL)

### X 上的 AI 建造者（26位）
[Andrej Karpathy](https://x.com/karpathy), [Swyx](https://x.com/swyx), [Josh Woodward](https://x.com/joshwoodward), [Boris Cherny](https://x.com/bcherny), [Thibault Sottiaux](https://x.com/thsottiaux), [Peter Yang](https://x.com/petergyang), [Nan Yu](https://x.com/thenanyu), [Madhu Guru](https://x.com/realmadhuguru), [Amanda Askell](https://x.com/AmandaAskell), [Cat Wu](https://x.com/_catwu), [Thariq](https://x.com/trq212), [Google Labs](https://x.com/GoogleLabs), [Amjad Masad](https://x.com/amasad), [Guillermo Rauch](https://x.com/rauchg), [Alex Albert](https://x.com/alexalbert__), [Aaron Levie](https://x.com/levie), [Ryo Lu](https://x.com/ryolu_), [Garry Tan](https://x.com/garrytan), [Matt Turck](https://x.com/mattturck), [Zara Zhang](https://x.com/zarazhangrui), [Nikunj Kothari](https://x.com/nikunj), [Peter Steinberger](https://x.com/steipete), [Dan Shipper](https://x.com/danshipper), [Aditya Agarwal](https://x.com/adityaag), [Sam Altman](https://x.com/sama), [Claude](https://x.com/claudeai)

### 官方博客（2个）
- [Anthropic Engineering](https://www.anthropic.com/engineering) — Anthropic 团队的技术深度文章
- [Claude Blog](https://claude.com/blog) — Claude 的产品公告与更新

## 安装

独立仓库发布后，请通过 Git 安装。是否会发布到注册表尚未确定；目前本项目没有可用的 ClawHub 包。

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

## 系统要求

- 一个 AI agent（OpenClaw、Claude Code 或类似工具）
- 网络连接（用于获取中心化 feed）

读者无需提供采集凭证。仓库运营者需要配置 `X_BEARER_TOKEN` 和 `POD2TXT_API_KEY`；定时更新须在凭证配置完成且成功运行后才能视为可用。

## 工作原理

1. 定时工作流可更新中心化 feed，采集信息源的内容（博客文章通过网页抓取，播客字幕通过 pod2txt，X/Twitter 通过官方 API）
2. 准备脚本并行发起三个 feed 请求，并最多发起五个远程 prompt 请求，同时优先采用用户自定义内容并保留内置回退副本
3. 你的 agent 根据你的偏好将原始内容重新混编为易消化的摘要
4. 摘要推送到你的通讯工具（或直接在聊天中显示）

`ai-builders-digest` 负责信息源目录、用户配置 schema、prompt、编辑策略和品牌内容；它通过通用的 `digest-core` 收集、准备和推送接口工作，核心 package 不包含 AI 建造者主题策略。

查看[摘要示例](packages/ai-builders-digest/examples/sample-digest.md)了解输出格式。

## 隐私

- 读者无需向 skill 提供采集用的 API key；采集由仓库运营者集中执行
- 如果你使用 Telegram/邮件推送，相关 key 仅存储在本地 `~/.ai-builders-digest/.env`
- Skill 只读取公开内容（公开的博客文章、YouTube 视频和 X 帖子）
- 你的配置、偏好和阅读记录都保留在你自己的设备上
