# LAURA LANA — 项目状态文档
*最后更新：2026 年 8 月*

> 这份文档的作用：让任何一个新开的对话（网页端 Claude.ai 或本地 Claude Code）一打开就知道这个项目现在在哪、用的什么技术、设计上定过哪些规矩、还差什么没做。请把这份文档更新到本 Project 的 **Project Knowledge**（项目知识库）里。本地 `C:\dev\lauralana` 根目录还有一份 `CLAUDE.md`，是 Claude Code 专用的技术说明，两者内容会有重叠，但这份是给人看、也给网页端 Claude 看的完整背景。

---

## 一、项目是什么

**LAURA LANA**（www.lauralana.au）—— 原创设计、独一无二、手工编织的马海毛女装毛衣与毛裙品牌。

**核心定位**：不是普通电商网店，是"作品陈列 + 直接购藏 / 定制咨询"并存的画廊/工作室模式。**每件作品都是真实存在的孤品（One of One）**——网站上陈列的就是实际库存，不是预设的品类占位。

**关键事实（不要弄错）**：
- 纱线**从意大利顶级马海毛纺线商采购**（不是自己养羊剪毛）
- 编织工作在**澳洲**由设计师本人完成
- 品牌最大的差异化卖点是**色彩极其丰富**（意大利纱线商以饱和色著称）
- 语言：**英文为主，中文为辅**（默认打开是英文，右上角可切换）
- **每件作品的颜色是从实拍图里真实取样的**，不再强行套用固定的"品牌六色"——六色现在只用于品牌视觉故事（首页色彩圆点、logo），不用于限定实际陈列

---

## 二、技术栈 & 部署链路

- **代码托管**：GitHub，仓库 `github.com/shenbrian/lauralana`
- **网站部署**：Vercel（项目名 `lauralana`），GitHub 仓库和 Vercel 项目已经打通——每次 `git push` 到 main 分支自动重新部署
- **域名**：`www.lauralana.au`，DNS 在 Crazy Domains，已指向 Vercel
- **本地开发环境**：Windows，项目文件夹 `C:\dev\lauralana`，VS Code + 内置终端（PowerShell），**现已安装 Claude Code**（可以直接在项目目录里对话式改文件、跑 git）
- **网站本身**：静态前端（`index.html` + `css/style.css` + `js/main.js`，无构建步骤）**+ 一个 Vercel Serverless Function**（`api/create-checkout-session.js`，处理 Stripe 结账）

### 日常更新流程
- 如果用 Claude Code：直接在终端里说需求，它会改文件并可以直接跑 git 命令
- 如果通过网页端 Claude.ai：下载文件覆盖到本地对应位置，然后：
  ```
  git add .
  git commit -m "描述这次改了什么"
  git push
  ```
- 每次改了 CSS 或 JS，`index.html` 里引用的 `?v=数字` 要 +1（当前 v=19），否则浏览器/CDN 可能读到旧文件缓存

### 常见坑
- Windows 下载同名文件容易变成 `style (6).css` 导致 404，下载前清空同名旧文件
- `git status` 是排查"是不是真的改了/push了"最好用的命令

---

## 三、设计系统

### 字体
- 品牌名 `LAURA LANA`：`Italiana`，全大写，字距拉宽
- 大标题：英文 `Fraunces`，中文 `Noto Serif SC`
- 正文/按钮：英文 `Work Sans`，中文 `Noto Sans SC`

### 配色
- 背景本色：`#F7F4EE`（bone）　卡片白：`#FFFFFF`　墨黑正文：`#17140F`
- 次要文字：`#5B584F` / `#8A8677`　分隔线：`#DDD6C6`
- 强调色（极少量使用）：深酒红 `#5B2A32`

### 品牌六色（仅用于品牌视觉故事，不再用于限定商品陈列）
樱桃红 `#B5232F`　钴蓝 `#1F4E9C`　祖母绿 `#146B4F`　藏红花黄 `#D98A1F`　洋红 `#A62368`　紫罗兰 `#5B3A87`

### 毛线球图标（Yarn Ball Mark）
SVG symbol，全站通过 `<use href="#yarnball">` 复用；线头方向靠 `.yarn-mark--down/--right/--left/--up` 控制。容器尺寸需设成文字字号的约 2.6 倍并用负 margin 裁掉留白，才能让球的视觉大小匹配文字。

---

## 四、作品陈列系统 ——「作品志 / The Ledger」（2026年8月新增）

这是本月最大的一次改版：把"作品"板块从电商网格卡片，改成了呼应画廊/拍卖行编目方式的**单列纵向账本式陈列**，因为每件都是孤品，货架式陈列会削弱这一点。

**版式**：每件作品一个条目，从上到下：
1. **编目行**：`N° 001` 编号 + 价格（编号是真实的制作顺序，不是装饰）
2. **视觉区**：
   - 双联图（衣架照 + 平摊照，并排，呼应首屏 hero 的 diptych 视觉语言）
   - 下方一小行：针法纹理特写 + 一枚从实拍图取样的**真实色卡**（带颜色命名，如"燕麦/Oat"）——这枚色卡呼应意大利纱线厂"色卡"传统，是品牌差异化故事的延伸，不是纯装饰
3. **信息区**：分类、名称、描述、操作区

**操作区**（未售出 vs 已售出）：
- 未售出：价格 + 文字链接"购藏此作 / Acquire This Piece"（点击走 Stripe 结账，不是电商实心按钮）
- 已售出：不叫"SOLD"，改叫"已被珍藏 / Now with its owner"，图片做轻微低饱和处理；同时仍保留"咨询定制相近款式"链接，引导去做一件类似的新孤品

**数据结构**（`data/products.json`，唯一数据源，前端渲染和 Stripe 后端共用）：
```json
{
  "id": "emerald-crewneck",
  "no": 1,
  "zh": "祖母绿圆领衫", "en": "Emerald Crewneck",
  "catZh": "毛衣 · 马海毛混纺", "catEn": "Sweater · Mohair Blend",
  "descZh": "...", "descEn": "...",
  "colourNameZh": "祖母绿", "colourNameEn": "Emerald",
  "swatch": "#297865",
  "images": { "hanger": "images/xxx-hanger.jpg", "flat": "images/xxx-flat.jpg", "texture": "images/xxx-texture.jpg" },
  "priceAUD": 60000,
  "sold": false
}
```
目前已上架：**N° 001 祖母绿圆领衫**（用的是压缩过的示范图，等原图到位后直接替换同名文件即可，不用改 JSON）。

**当前每件作品需要 3 张图**：衣架照、平摊照、针法纹理特写。**手机发送图片建议选"原图"**，避免微信/社交软件默认压缩导致网站上显示发虚（桌面端大图展示建议短边 ≥1200px，理想 1800–2000px）。

---

## 五、Stripe 支付集成（2026年8月新增）

- **账户**：Brian 有独立的 Stripe 账户专门给 LAURA LANA 用（跟另一个 DEAR SAUCE 项目账户分开），目前是 Sandbox 测试模式
- **后端**：`api/create-checkout-session.js`，Vercel Serverless Function，读取 `data/products.json` 中的价格/售出状态，调用 Stripe REST API 动态生成 Checkout Session（不需要预先在 Stripe 后台建商品，价格改 JSON 文件即可）
- **环境变量**：Vercel 项目需要设置 `STRIPE_SECRET_KEY`（Settings → Environment Variables），值是 Stripe 账户的 Secret key（测试期用 `sk_test_...`，正式收款前换成 `sk_live_...`）。改了环境变量需要重新部署一次才生效
- **购买流程**：点击"购藏此作" → 调用 `/api/create-checkout-session` → 跳转 Stripe 托管结账页 → 完成后跳回网站显示中英文提示条（成功/取消两种状态）
- **标记售出**：目前是手动流程——卖出一件后，把 `data/products.json` 里对应条目的 `"sold"` 改成 `true` 并 push。这样前端会隐藏购买按钮，后端也会拒绝对该商品的新支付请求（双重保险）。**注意：这不是自动化的**——没有接数据库，所以库存状态需要人工同步

---

## 六、页面结构

单页网站（`index.html`），锚点导航跳转：

1. **首屏 Hero**：左右两张实拍照片拼接，文字叠在左边大图上，CTA + 品牌印记；首屏下方六色色彩故事圆点
2. **材质故事 / Why Mohair**：马海毛+意大利纱线来源，四个特性卡片
3. **作品 / The Ledger**：见上方第四节，单列编目式陈列，目前 1 件真实上架（N° 001）
4. **工艺 / The Craft**：01–04 四步流程
5. **关于我们 / About**：图文两栏，实拍工作室毛衣挂架照
6. **联系 / Contact**：询价表单（mailto 方案，无后端收件）+ 直接联系方式
7. **页脚**

---

## 七、还没做 / 待确认

- 更多真实作品的高清三连图（衣架/平摊/纹理特写）陆续补充中
- 联系表单仍是纯前端 mailto，没有真正后端收件（可接 Formspree / Netlify Forms）
- 联系方式（邮箱 hello@lauralana.au、Instagram @lauralana.au、微信号 LauraLana_Studio）**仍是占位，需核实**
- Stripe 目前是测试模式，正式收款前需要在 Stripe 后台完成 Activate payments（公司信息、银行账户等），并把 key 换成 live 版本
- 售出状态目前手动维护；未来如果订单量变大，可以考虑加 Stripe Webhook + 数据库（Supabase）自动同步"已售出"状态
- 已有一份《竞品格局与定价策略报告》，定价参考区间 A$450–900（毛衣/开衫）、A$700–1,400+（连衣裙）

---

## 八、怎么把这份文档接入新对话

1. 打开这个 Project（LAURA LANA）的设置 → **Project Knowledge**
2. 用这份新版覆盖旧版
3. 本地 `C:\dev\lauralana\CLAUDE.md` 是 Claude Code 专用的技术细节文档，两者保持大致同步即可，不用完全一致

**维护建议**：每次做完一轮比较大的改动（新的设计方向、新功能、数据结构变化），让 Claude 重新生成一版这份文档。小调整不用每次都更新。
