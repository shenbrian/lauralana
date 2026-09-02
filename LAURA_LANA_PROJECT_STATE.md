# LAURA LANA — 项目状态文档
*最后更新：2026 年 8 月*

> 这份文档的作用：让任何一个新开的对话（网页端 Claude.ai 或本地 Claude Code）一打开就知道这个项目现在在哪。请把这份文档更新到本 Project 的 **Project Knowledge**。本地 `C:\dev\lauralana\CLAUDE.md` 是 Claude Code 专用的技术细节文档，两者保持大致同步即可。

---

## 一、项目是什么

**LAURA LANA**（www.lauralana.au）—— 原创设计、独一无二、手工编织的马海毛女装毛衣与毛裙品牌。**核心定位**：画廊/工作室模式，每件作品都是真实存在的孤品（One of One），网站陈列的就是实际库存。

**品牌灵魂宣言**（创始人 Laura 原话，已上线为独立板块）：
> "把喜欢的颜色，都织进了毛衣里。"
> "Every colour I've ever loved, I've knitted into a sweater."

- 纱线从意大利顶级马海毛纺线商采购，编织在澳洲由设计师本人完成，**全程手工编织，工具是"一对毛衣针"（a pair of knitting needles），不是织机**
- 语言：英文为主（默认），中文为辅——**草拟任何文案时英文是主稿，中文是翻译稿**
- 每件作品的颜色从实拍图真实取样，不套用固定色系
- **品牌定位澄清**：Laura 是按照自己的设计和感觉创作，**不接受外部指定需求的定制**。网站文案强调"作品已完成、独一无二地存在着，等待被拥有"，不是"欢迎联系定制"

---

## 二、技术栈 & 部署

- GitHub `github.com/shenbrian/lauralana` → Vercel 自动部署，域名 `www.lauralana.au`
- 本地：Windows，`C:\dev\lauralana`，VS Code + **Claude Code**（日常改动主要通过它完成）
- 架构：静态前端（`index.html` + `css/style.css` + `js/main.js`）+ 一个 Vercel Serverless Function（`api/create-checkout-session.js`）
- 每次改 CSS/JS，`index.html` 里 `?v=数字` 要 +1（当前 **v=30**）

---

## 三、作品陈列系统 ——「作品志 / The Ledger」

**版式**：
1. 编目行：`N° 001` + 价格
2. **左右等宽双框**：左框商品照片（`p.img`，`object-fit: contain` 完整显示不裁切——之前用 `cover` 会把长裙/套装类的上下部分裁掉，已修正），右框**参数化生成的植物学插画**（`botanicalMark()`），花头颜色取该商品 swatch，茎叶固定鼠尾草绿，底部标签显示颜色名（如 "FUCHSIA"）
   - 插画基于商品 id 做**确定性随机化**（`seedFromId()` + `mulberry32()` PRNG）：花苞角度、叶片形态、花瓣旋转起始角、水彩纹理噪点，每件构图各不相同但同一件每次刷新一致
3. 信息区：分类、名称、描述、操作区
   - 未售出：价格 + "购藏此作 / Acquire This Piece" 文字链接（走 Stripe）
   - 已售出："已被珍藏 / **Cherished by a collector**"（英文措辞已从最初的 "Now with its owner" 改为现在这版，更有情感和身份感），图片+插画同步做灰度处理，下方保留"咨询近似款式 / Enquire About a Similar Piece"链接（询问未来是否有类似灵感的新作品，不是要求定制）。"已被珍藏"统一指代两种情况：作者自留不出售、或已被客户购藏——网站上不做区分

**数据结构**（`data/products.json`，唯一数据源）：每条含：
- `id`：唯一 slug
- `no`：**页面上显示的编目编号**（N° 001 这种），代表作品的真实身份，大致对应制作先后顺序，**不受展示顺序影响**
- `displayOrder`：**网站上从上到下的排列位置**，与 `no` 完全解耦的独立字段（新增机制，见下方说明）
- `zh/en, catZh/catEn, descZh/descEn, colourNameZh/En, swatch, img, priceAUD, sold`
- `images.hanger/flat/texture` 字段仍保留但当前版式未使用（用 `img` 这个顶层字段渲染主图）

**no 与 displayOrder 的关系（重要）**：两者从 2026年8月起正式解耦。`no` 是身份编号，永远跟着这条记录本身，不会因为调整网站展示顺序而改变；`displayOrder` 只决定网站上第几个位置显示哪件作品。这样可以把"已售出"和"待售"的作品交错排列（避免网站看起来像是"前半是可以买的，后半全部卖完了"），同时保留每件作品真实的编目编号不被打乱。

**当前共 28 件真实作品**（no:1–28，其中 no:15–28 是第二批新品，images 已入库，价格已设，且这批**全部标记为已被珍藏 / sold:true**，即这14件目前只做陈列展示、不接受购买）。第一批 no:1–14 里除已标注的以外均可购买。

**分类**：Sweater / Skirt / Top / Dress / Set（两件套，如 charcoal-knit-set / cornflower-knit-set），均为 "· Mohair Blend"。

**价格由 Laura 直接决定，会不定期调整**——每次调价都是"改 `priceAUD` 字段 + git diff 核对 + git push"，只改目标字段，避免误改到其他商品。截至目前已经过多轮调价，具体数值以 `data/products.json` 实际内容为准，不在本文档里逐条列出（避免文档很快过时）。

---

## 四、品牌宣言板块

位置：首屏 Hero 和"材质故事"之间的独立板块 `.statement`。中文用行书字体 **Ma Shan Zheng**（仅此一处使用，强制单行不换行，`clamp(17px,4.2vw,34px)`），英文用 **Fraunces**、`font-variation-settings: "opsz" 144` 强化花体连笔感。这是全站唯一使用手写字体的地方，专门标记"这是创始人原话"。

---

## 五、Stripe 支付 —— **已转正式收款（Live 模式）**

- **账户结构**：Stripe 账户 **LAURA LANA** 是独立新建的（不是复用 DuDaoDong 那个已有账户），但法人主体和收款银行账户与另一个项目（Angel Brand Advisors Pty Limited，CBA 银行账户）共用——即 Stripe 后台的交易记录/报表完全分开，钱最终进同一个银行账户
- **Statement descriptor**：已设为 `LAURA LANA`
- **已完成 Activate 流程**：业务信息、KYC、银行账户、打款频率（每周四自动打款）均已设置
- **Vercel 环境变量 `STRIPE_SECRET_KEY` 已从 `sk_test_...` 换成 `sk_live_...`**，已重新部署
- ⚠️ **现在网站上的购买是真实扣款**，测试卡（4242...）不再适用
- **售出状态目前手动维护**：卖出后需手动把 `products.json` 对应条目的 `sold` 改成 `true` 并 push，没有接数据库自动同步

---

## 六、联系方式状态

- **邮箱已确认为真实地址**：`laura.li6500@hotmail.com`，网站显示文字和 mailto 链接均已更新
- **Instagram、微信号仍是占位**，尚未建立真实账号，待补
- 联系表单仍是纯前端 mailto 方案，无真正后端收件

---

## 七、印刷物料

- **品牌圆形徽章 logo**：已生成印刷级成品文件 `LauraLana_Logo_60mm_margin1.5mm_1200dpi.png` / `.pdf`（60mm 直径、1.5mm 白边、1200 DPI），已提交进仓库留档

---

## 八、本地工作流

- **Claude Code 已安装**，日常改动主要通过它在 `C:\dev\lauralana` 完成，网页端 Claude.ai 主要用于设计方向讨论、图片评估、拟稿、给 Claude Code 下达指令
- **重要习惯**：Claude Code 汇报"截图已发"时，如果没有实际上传图片文件到网页对话里，视觉类改动（排版、字体、插画美观度）不能仅凭文字描述确认，需要要求真实截图；但**可脚本验证的事实性改动**（git diff、HTTP 状态码、DOM dump、字符串匹配）可以直接采信，不必强求截图
- **Claude Code 的 git 提交习惯很好**：会主动把不相关的改动（文档更新、印刷文件、图片资产）从当前任务的提交里摘出来或提醒确认，保持每条 commit 名副其实；多批改动会建议拆分成多个 commit 而不是混在一起——这个习惯值得继续保持
- **新增商品的标准流程**：① 给 Claude Code 一个装有原始图片的文件夹，让它逐张查看内容、按颜色/款式分组，先列清单不动手；② 用户确认分组和疑问点（是否套装、裙子还是连衣裙等）；③ Claude Code 按分组重命名图片、取色、写入 `products.json` 草稿（价格留空/TODO）；④ 用户逐批确认文案，最后统一给出价格；⑤ 全部确认后 commit + push

---

## 九、还没做 / 待确认

- Instagram、微信号真实账号建立
- Rose Lace Dress 照片左下角有个标签贴纸痕迹，待裁图
- 部分商品仍缺 `images.flat`/`images.texture` 原图（当前版式暂未使用，但以后可能用到单品详情页）
- 联系表单换成真正后端收件（如 Formspree）
- 首次真实交易验证：需要用真实银行卡走一遍完整流程确认到账

---

## 十、怎么把这份文档接入新对话

打开这个 Project → **Project Knowledge**，用这份新版覆盖旧版即可。
