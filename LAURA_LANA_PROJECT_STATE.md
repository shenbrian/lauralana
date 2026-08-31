# LAURA LANA — 项目状态文档
*最后更新：2026 年 8 月*

> 这份文档的作用：让任何一个新开的对话（网页端 Claude.ai 或本地 Claude Code）一打开就知道这个项目现在在哪。请把这份文档更新到本 Project 的 **Project Knowledge**。本地 `C:\dev\lauralana\CLAUDE.md` 是 Claude Code 专用的技术细节文档，两者保持大致同步即可。

---

## 一、项目是什么

**LAURA LANA**（www.lauralana.au）—— 原创设计、独一无二、手工编织的马海毛女装毛衣与毛裙品牌。**核心定位**：画廊/工作室模式，每件作品都是真实存在的孤品（One of One），网站陈列的就是实际库存。

**品牌灵魂宣言**（创始人 Laura 原话，已上线为独立板块）：
> "把喜欢的颜色，都织进了毛衣里。"
> "Every colour I've ever loved, I've knitted into a sweater."

- 纱线从意大利顶级马海毛纺线商采购，编织在澳洲由设计师本人完成
- 语言：英文为主（默认），中文为辅——**草拟任何文案时英文是主稿，中文是翻译稿**
- 每件作品的颜色从实拍图真实取样，不套用固定色系

---

## 二、技术栈 & 部署

- GitHub `github.com/shenbrian/lauralana` → Vercel 自动部署，域名 `www.lauralana.au`
- 本地：Windows，`C:\dev\lauralana`，VS Code + **Claude Code**（已安装，日常改动主要通过它完成）
- 架构：静态前端（`index.html` + `css/style.css` + `js/main.js`）+ 一个 Vercel Serverless Function（`api/create-checkout-session.js`）
- 每次改 CSS/JS，`index.html` 里 `?v=数字` 要 +1（当前 **v=25**）

---

## 三、作品陈列系统 ——「作品志 / The Ledger」

**版式**（本月经过一次结构调整，从"双联图+纹理特写+方色块"简化为现在这版）：
1. 编目行：`N° 001` + 价格
2. **左右等宽双框**：左框商品照片（`p.img`），右框**参数化生成的植物学插画**（`botanicalMark()`），花头颜色取该商品 swatch，茎叶固定鼠尾草绿，底部标签显示颜色名（如 "FUCHSIA"）
   - 插画基于商品 id 做**确定性随机化**（`seedFromId()` + `mulberry32()` PRNG）：花苞角度、叶片形态、花瓣旋转起始角、水彩纹理噪点，17 件各不相同但同一件每次刷新构图一致
3. 信息区：分类、名称、描述、操作区（未售出："购藏此作"文字链接走 Stripe；已售出："已被珍藏 / Cherished by a collector"，图片+插画同步做灰度处理）

**数据结构**（`data/products.json`，唯一数据源）：每条含 `id, no, zh/en, catZh/catEn, descZh/descEn, colourNameZh/En, swatch, img, priceAUD, sold`（`images.hanger/flat/texture` 字段仍保留但当前版式未使用）

**当前 17 件真实上架，最终编号与定价**（no:1、no:2 是刻意调整过位置的开场品牌印象）：

| no | id | 名称 | 价格 |
|---|---|---|---|
| 1 | fuchsia-crewneck | Fuchsia Crewneck | A$490 |
| 2 | olive-crewneck | Olive Crewneck | A$420 |
| 3 | indigo-marl-crewneck | Indigo Marl Crewneck | A$380 |
| 4 | cornflower-crewneck | Cornflower Crewneck | A$680 |
| 5 | cornflower-cable-skirt | Cornflower Cable Skirt | A$680 |
| 6 | dusty-mauve-crewneck | Dusty Mauve Crewneck | A$780 |
| 7 | lavender-crewneck | Lavender Crewneck | A$790 |
| 8 | lilac-crewneck | Lilac Crewneck | A$360 |
| 9 | grey-lavender-batwing | Grey Lavender Batwing Top | A$280 |
| 10 | oat-lace-crewneck | Oat Lace Crewneck | A$380 |
| 11 | sage-cable-crewneck | Sage Cable Crewneck | A$780 |
| 12 | teal-crewneck | Teal Crewneck | A$370 |
| 13 | rose-lace-dress | Rose Lace Dress | A$780 |
| 14 | emerald-crewneck | Emerald Crewneck | A$360 |
| 15 | mushroom-open-knit | Mushroom Open-Knit Sweater | A$380 |
| 16 | periwinkle-open-knit | Periwinkle Open-Knit Sweater | A$380 |
| 17 | oat-cable-trim-crewneck | Oat Cable-Trim Crewneck | A$490 |

分类目前有四种：Sweater / Skirt / Top / Dress（均为 "· Mohair Blend"）。

---

## 四、品牌宣言板块（新增）

位置：首屏 Hero 和"材质故事"之间的独立板块 `.statement`。中文用行书字体 **Ma Shan Zheng**（仅此一处使用，强制单行不换行，`clamp(17px,4.2vw,34px)`），英文用 **Fraunces**、`font-variation-settings: "opsz" 144` 强化花体连笔感。这是全站唯一使用手写字体的地方，专门标记"这是创始人原话"。

---

## 五、Stripe 支付 —— **已转正式收款（Live 模式）**

- **账户结构**：Stripe 账户 **LAURA LANA** 是独立新建的（不是复用 DuDaoDong 那个已有账户），但法人主体和收款银行账户与另一个项目（Angel Brand Advisors Pty Limited，CBA 银行账户）共用——即 Stripe 后台的交易记录/报表完全分开，钱最终进同一个银行账户
- **Statement descriptor**：已设为 `LAURA LANA`（客户信用卡账单上会显示这个名字，不是公司全名或别的项目名）
- **已完成 Activate 流程**：业务信息、KYC、银行账户、打款频率（每周四自动打款）均已设置
- **Vercel 环境变量 `STRIPE_SECRET_KEY` 已从 `sk_test_...` 换成 `sk_live_...`**，已重新部署
- ⚠️ **现在网站上的购买是真实扣款**，测试卡（4242...）不再适用
- **售出状态目前手动维护**：卖出后需手动把 `products.json` 对应条目的 `sold` 改成 `true` 并 push，没有接数据库自动同步

---

## 六、联系方式状态

- **邮箱已确认为真实地址**：`laura.li6500@hotmail.com`（替换了之前的占位 `hello@lauralana.au`），网站显示文字和 mailto 链接均已更新
- **Instagram、微信号仍是占位**，尚未建立真实账号，待补
- 联系表单仍是纯前端 mailto 方案，无真正后端收件

---

## 七、本地工作流

- **Claude Code 已安装**，日常改动主要通过它在 `C:\dev\lauralana` 完成，网页端 Claude.ai 主要用于设计方向讨论、图片评估、拟稿、给 Claude Code 下达指令
- **重要习惯**：Claude Code 汇报"截图已发"时，那些截图是它本地生成的文件，**不会自动出现在网页对话里**，需要用户手动上传实际图片文件才能被网页端 Claude 看到并确认视觉效果；纯文字/数据类验证（如哈希对比、URL 抓取）可以直接采信不需要截图

---

## 八、还没做 / 待确认

- Instagram、微信号真实账号建立
- Rose Lace Dress（no:13）照片左下角有个标签贴纸痕迹，待裁图
- 部分商品仍缺 `images.flat`/`images.texture` 原图（当前版式暂未使用，但以后可能用到单品详情页）
- 联系表单换成真正后端收件（如 Formspree）
- 首次真实交易验证：需要用真实银行卡走一遍完整流程确认到账

---

## 九、怎么把这份文档接入新对话

打开这个 Project → **Project Knowledge**，用这份新版覆盖旧版即可。
