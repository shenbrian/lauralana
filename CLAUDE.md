# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this site is

LAURA LANA (`www.lauralana.au`) is a one-of-one hand-knit mohair womenswear brand. This is not a conventional e-commerce catalogue — every piece is unique, so the site works like a gallery/ledger of individual pieces rather than a shop with repeatable SKUs. Yarn is sourced from top Italian mohair mills; knitting is done in Australia by the designer. The brand's key differentiator is very saturated colour, which is why the site has an explicit six-colour brand palette baked into the design system. Default language is English with a Chinese toggle (see i18n below).

## Architecture

Static site, **no build step, no framework, no package.json**. Deployed on Vercel; every push to `main` auto-deploys. Two moving parts:

- **Static frontend**: `index.html` + `css/style.css` + `js/main.js`, served as-is.
- **One Vercel Serverless Function**: `api/create-checkout-session.js`, for Stripe Checkout.

### Product data flow (single source of truth)

`data/products.json` is the *only* place product data lives — both the frontend and the backend read it independently:

- `js/main.js` `loadAndRenderProducts()` fetches `data/products.json` client-side and renders the product ledger (`#productLedger` in `index.html`) via `renderLedger()`.
- `api/create-checkout-session.js` (Node, CommonJS) `require()`s the same JSON file server-side to validate the product id, price, and `sold` status before creating a Stripe Checkout Session.

To add/edit/retire a piece, edit `data/products.json` only — do not hardcode product data in JS or HTML. Each entry: `id` (slug, must match between frontend and any Stripe metadata), `no` (catalogue number), `zh`/`en` name, `catZh`/`catEn`, `descZh`/`descEn`, `colourNameZh`/`colourNameEn`, `swatch` (hex sampled from the actual piece), `images: { hanger, flat, texture }` (each `""` shows a placeholder frame until a real photo path is filled in), `priceAUD` (in **cents**), `sold` (bool — hides the buy action and blocks checkout server-side).

### Checkout flow

"Acquire This Piece" button → `startCheckout()` in `main.js` → `POST /api/create-checkout-session` with `{ id }` → function looks up the product, re-validates price/sold state, builds a Stripe Checkout Session via raw `fetch` to the Stripe API (no `stripe` SDK dependency), returns `{ url }` → browser redirects to Stripe-hosted checkout. Success/cancel return to `/?checkout=success|cancelled`, handled by `initCheckoutBanner()` in `main.js`.

Requires `STRIPE_SECRET_KEY` set in the Vercel project's environment variables (`sk_test_...` for testing, `sk_live_...` for real payments). Without it, the endpoint returns a 500 with a "payments not configured" message instead of erroring.

### i18n pattern

No i18n library. Any bilingual text node in `index.html` looks like:

```html
<span class="i18n" data-zh="中文文案" data-en="English copy"></span>
```

`applyLanguage()` in `main.js` swaps `.textContent` for every `.i18n` element based on the active language, toggles `<html lang>`/`data-lang`, and persists the choice to `localStorage` (`ll-lang`). JS-rendered content (the product ledger) must follow the same `data-zh`/`data-en` attribute pattern so it participates in language switching — `renderLedger()` re-runs `applyLanguage()` after injecting markup for exactly this reason.

### Brand mark (yarn ball icon)

Defined once as an SVG `<symbol id="yarnball">` in `index.html` and reused everywhere via `<use href="#yarnball">`. Direction of the trailing thread is controlled purely with CSS rotation classes (`.yarn-mark--up/--down/--left/--right`) — never draw a second variant. The visible ball only fills ~38% of the 220×220 viewBox (space is reserved for the thread swinging out), so a container needs to be roughly **2.6×** the adjacent text's font size (with negative margin to crop the slack) to look correctly sized next to it.

### Design tokens

CSS custom properties at the top of `css/style.css` (`:root`) define the palette and type scale — reference these rather than hardcoding colours/fonts:

- Palette is deliberately restrained (Loro Piana-style bone/ink, not colourful) except for the six brand colours reserved for the product ledger's colour story: cherry `#B5232F`, cobalt `#1F4E9C`, emerald `#146B4F`, saffron `#D98A1F`, magenta `#A62368`, violet `#5B3A87`.
- Wordmark font is `Italiana` (all-caps, single line, letter-spaced — never stack it to two lines). Headings use `Fraunces` (EN) / `Noto Serif SC` (ZH). Body/UI uses `Work Sans` (EN) / `Noto Sans SC` (ZH).
- Tone: this is a commission/enquiry gallery, not a shop — copy says "One of One" / "Enquire to Commission", not "Add to Cart" (the Stripe checkout button is the one exception, added after this convention was set).

## Deployment / cache-busting

No build tooling — deploy is just `git push` to `main` (Vercel auto-deploys). `index.html` references `css/style.css?v=N` and `js/main.js?v=N`; **bump both version query strings whenever either file changes**, or browsers/CDN may keep serving stale assets. After deploying, hard-refresh (Ctrl+F5) when checking `www.lauralana.au`.

## Known placeholder/unverified content

Contact details in the Contact section and in `main.js`'s mailto fallback (`hello@lauralana.au`, Instagram `@lauralana.au`, WeChat `LauraLana_Studio`) are placeholders pending confirmation — don't treat them as verified when referencing or changing contact flows.
