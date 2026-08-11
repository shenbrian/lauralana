# LAURA LANA 官网 — 使用说明

这是一个纯静态网站（HTML + CSS + JS），不依赖任何后端或构建工具，
可以直接部署到 `www.lauralana.au`。

## 文件结构

```
lauralana/
├── index.html          网站主页（唯一页面，含全部板块）
├── css/style.css        样式与设计系统
├── js/main.js            交互逻辑 + 作品数据
├── assets/favicon.svg    网站图标
└── images/                存放您上传的真实产品照片（目前为空）
```

## 如何添加真实产品图片

打开 `js/main.js`，找到顶部的 `PRODUCTS` 数组。每件作品是一个对象，例如：

```js
{
  zh: "暮色毛裙", en: "Dusk Knit Dress",
  ...
  img: ""   // ← 把图片路径填在这里
}
```

1. 把照片放进 `images/` 文件夹，例如 `images/dusk-dress.jpg`
2. 把对应作品的 `img: ""` 改成 `img: "images/dusk-dress.jpg"`
3. 保存刷新页面，占位框会自动替换为真实图片

在补全图片之前，该位置会显示一个手绘线稿占位框 + "样品图片待补充"字样，
不会显示空白或破损图片。

## 如何增减作品 / 修改文案

- 增减作品：直接在 `PRODUCTS` 数组中增加或删除一个对象（复制粘贴一份改内容即可）
- 修改中英文文案：`index.html` 中大部分文字都是这样的写法：
  ```html
  <span class="i18n" data-zh="中文文案" data-en="English copy"></span>
  ```
  直接修改 `data-zh` / `data-en` 属性里的文字即可，两种语言分开维护。

## 联系方式

`index.html` 的「联系」板块中，请把以下占位信息替换为真实信息：
- 邮箱 `hello@lauralana.au`
- Instagram `@lauralana.au`
- 微信号 `LauraLana_Studio`

## 关于询价表单

目前表单提交后会调起访客自己的邮件客户端（mailto:），
把询价内容自动填好发给您 —— **不需要任何后端服务器**，
但访客需要在设备上配置好默认邮箱客户端才能正常跳转。

如果希望访客直接在网页内提交、您在后台收到邮件（无需依赖访客的邮件客户端），
可以接入 Formspree / Netlify Forms 等免费表单服务，替换
`js/main.js` 中 `initContactForm()` 的提交逻辑即可，需要时可以再找我帮您接入。

## 部署到 www.lauralana.au

这是纯静态文件，可部署在任意静态托管平台，例如：
- **Netlify / Vercel / Cloudflare Pages**：直接把 `lauralana` 文件夹拖拽上传，
  再在平台后台绑定自定义域名 `www.lauralana.au` 即可（需要在您的域名 DNS
  处按平台提示添加 CNAME / A 记录）。
- **传统虚拟主机**：通过 FTP 把文件夹内所有文件上传到网站根目录即可。

## 后续可以扩展的方向

- 加入购物车与在线支付（当前版本为「展示 + 询价」模式，未来可升级为完整电商）
- 为每件作品增加详情弹窗/独立页面（尺码表、材质成分、护理说明等）
- 接入邮件订阅（新品上架通知）
