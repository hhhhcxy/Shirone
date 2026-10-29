# 游戏资料与评测

在内容仓的 content/games/<slug>/index.md 中维护一款游戏，封面和正文图片放同目录。源码模式对应 src/content/games，npm 包模式对应 shirones/content/games。content 同步挂载会自动覆盖 games 子目录；空游戏库保留该目录的 .gitkeep。

slug 使用小写英文、数字和连字符，不得使用 service 或 product。draft: true 的游戏不会输出路由或进入列表。

必填 title、kind（service 或 product）。grade 可为 S+、S、A、B、C，省略为未评级。status 是作者维护的文字；hours 是非负小时数；lastPlayed 使用 YYYY-MM-DD，缺省不进入最近游玩。platforms 和 tags 是字符串数组，tags 不影响 kind，也不会混入文章分类和标签。summary 建议不超过 20 字。cover: ./cover.jpg 引用同目录封面。links 是 label/url 数组，只在详情页展示，URL 仅接受 HTTP(S)。steamAppId 可预留 Steam 数字 ID。

推荐区只显示 S+ 和 S，先按固定等级排序，再按 recommendationOrder 数字升序，最后按 slug 稳定排序；最近游玩按日期降序，同日按 slug 排序。两区最多各 10 款，允许重复出现同一款。

frontmatter 后的 Markdown 正文是长评测，可写标题和相对图片，也可留空。当前不提供评级历史、版本或多维评分。示例游戏均标为示例，替换时请改成自己的记录。

config/games.yaml 的 enable 控制整个板块，description 是概览页简述。旧 data/games.ts 和配置 items 不再作为页面内容来源，请迁移为以上目录格式。
