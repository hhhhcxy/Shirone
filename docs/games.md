# 游戏资料与评测

在内容仓的 content/games/<slug>/index.md 中维护一款游戏，封面和正文图片放同目录。源码模式对应 src/content/games，npm 包模式对应 shirones/content/games。content 同步挂载会自动覆盖 games 子目录；空游戏库保留该目录的 .gitkeep。

slug 使用小写英文、数字和连字符，不得使用 service 或 product。draft: true 的游戏不会输出路由或进入列表。

必填 title、kind（service 或 product）。grade 可为 S+、S、A、B、C，省略为未评级。status 是作者维护的文字；hours 是非负小时数；lastPlayed 使用 YYYY-MM-DD，缺省不进入最近游玩。platforms 和 tags 是字符串数组，tags 不影响 kind，也不会混入文章分类和标签。summary 建议不超过 20 字。cover: ./cover.jpg 引用同目录封面。links 是 label/url 数组，只在详情页展示，URL 仅接受 HTTP(S)。steamAppId 可预留 Steam 数字 ID。

推荐区只显示 S+ 和 S，先按固定等级排序，再按 recommendationOrder 数字升序，最后按 slug 稳定排序；最近游玩按日期降序，同日按 slug 排序。两区最多各 10 款，允许重复出现同一款。

frontmatter 后的 Markdown 正文是长评测，可写标题和相对图片，也可留空。当前不提供评级历史、版本或多维评分。示例游戏均标为示例，替换时请改成自己的记录。

config/games.yaml 的 enable 控制整个板块，description 是概览页简述。旧 data/games.ts 和配置 items 不再作为页面内容来源，请迁移为以上目录格式。

## 手动概览与标签

在 games 配置中设置 recentIds 和 recommendationIds 为游戏 slug 数组，数组顺序为手动顺序；省略则使用自动选择，空数组表示不展示。榜单仅展示 S+、S，按 frontmatter 评级分组，不设置第二份评级。无效引用和重复 slug 不显示，草稿不入选。小卡片只展示封面与名称。

侧栏添加 type: gameTags、pages: [games]、enable: true、slot: sticky 即可显示独立游戏标签；桌面在侧栏，手机随侧栏放到正文之后。标签使用 gameTag 查询参数，不进入文章分类与标签。游戏详情采用阅读卡片与紧凑资料头，Markdown 为评测主体。

## Steam import
Run `node scripts/steam/sync.mjs <content-root>` manually with Node 24. The content root `.env` may contain `STEAM_WEB_API_KEY`; the process environment takes precedence. Keep this file ignored. The numeric Steam profile URL is read from `config/profile.yaml`. New entries are drafts, with provisional product classification; review classification, tags and publication before enabling. Existing entries are matched by steamAppId and only hours/available lastPlayed are updated. Markdown, grades and editorial fields are preserved. Missing/private responses never delete content. The command is independent of build and deployment.

Game navigation includes overview, all, categories, tags and reviews. Category links keep the service and product URLs. Reviews require a non-empty Markdown body and use the review date for ordering. Tags always show library-wide counts; category switches preserve the selected tag. The slugs all, service, product, categories, tags and reviews are reserved. Recommendation tiers remain S+ and S; imported records do not receive invented grades.

## Reviews and ordering
Empty Markdown bodies show a localized no-review message. All/category/tag lists sort by reviewUpdated descending, followed by undated reviews and empty bodies; title and slug break ties. Set reviewUpdated to an ISO timestamp when editing a local review. Playtime synchronization never changes it. Overview recent-played and recommendation selection remain independent.

Run `node scripts/steam/reviews.mjs <content-root> [max-pages-per-game]` to try public review import (default 5, maximum 50 pages per game). No API key is needed. Reviews are matched against the numeric Steam profile in config/profile.yaml. Only empty bodies are imported; local prose is never overwritten. Imported entries receive reviewUpdated and steamReviewUrl. Original responses and changed-review candidates stay in ignored `.work/steam-reviews/`; inspect these before manually updating local Markdown. The status file distinguishes a fully exhausted search (not-found), bounded search (incomplete), and request failure (failed). Neither failure nor incomplete search proves that no review exists. This tool does not build or deploy. Steam BBCode conversion preserves common formatting and escapes HTML; inspect unfamiliar formatting after import.

## Readable directories and stable links

Steam imports use lowercase English title slugs, with the app ID appended for collisions. Existing games are still matched by `steamAppId`; subsequent title changes do not rename directories. Titles without Latin characters fall back to `steam-<id>` and may be renamed manually. Keep `steamAppId` when moving the whole directory. Every published Steam game also generates `/games/steam-<id>/` as a static redirect to its current directory URL. Use `aliases: [old-slug]` for other previous directory names. Duplicate, invalid and reserved aliases fail the build. Drafts and disabled games generate no redirect.

Run `node scripts/steam/link.mjs <content-root> <steamAppId|slug>` to print a Markdown link with the configured base path. It rejects unpublished targets and uses the stable Steam route when available. This is ordinary Markdown, requiring no additional browser runtime or custom syntax. If the site's base path changes, regenerate existing links.

`status` is optional author-maintained play status (e.g. playing, finished, paused); new imports leave it empty. It does not control publication. Missing covers and failed image loads retain an empty 8:5 frame.

## Gameplay tag enrichment

Run `node scripts/steam/tags.mjs <content-root> [--refresh]` manually. Only explicitly empty `tags: []` fields are filled; existing editorial tags are never overwritten. Store tags are filtered through the gameplay whitelist in `scripts/steam/game-metadata.mjs`, normalized and limited to five. Raw tags and request results are cached under the content root's ignored `.work/steam-tags/`. `--refresh` refreshes the cache for eligible entries; it still does not overwrite populated tags. Missing tags, age gates, delisted pages and network failures leave content unchanged. This is separate from builds and requires no API key. If needed, Node's `--use-env-proxy` uses your configured HTTPS_PROXY environment variable.
