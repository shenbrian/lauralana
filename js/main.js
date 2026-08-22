/* ===========================================================
   LAURA LANA — site behaviour
   1. Bilingual (zh/en) text toggle
   2. Mobile nav
   3. Product grid render — data now loaded from data/products.json
   4. Stripe Checkout — Buy Now per product, Sold state
   5. Post-checkout banner (success / cancelled)
   6. Contact form -> mailto fallback (no backend required)
=========================================================== */

/* -----------------------------------------------------------
   1) PRODUCT DATA
   -----------------------------------------------------------
   Every piece lives in data/products.json — this is the single
   source of truth, shared with the Stripe checkout function on
   the backend. There is no fixed catalogue size or fixed colour
   set: what's listed here IS the current one-of-one inventory.

   Each entry:
     id            unique slug, e.g. "oat-crewneck"
     no            sequential catalogue number (integer)
     zh / en       piece name
     catZh / catEn category + material line
     descZh / descEn   short description
     colourNameZh / colourNameEn   the true colour's name
     swatch        hex sampled from the actual piece
     images: { hanger, flat, texture }   each "" until photographed
     priceAUD      price in cents
     sold          true once the piece has found its owner

   Leave an image field "" to keep its placeholder frame.
   Set "sold": true to move a piece into the archive state —
   this hides the acquire action and blocks new checkout
   attempts for that item server-side.
------------------------------------------------------------ */
let PRODUCTS = [];

const placeholderIcon = `
<svg class="placeholder-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 10c0-3.5 3.6-6 12-6s12 2.5 12 6v4l9 3 4 14-7 2-2-9v34H16V30l-2 9-7-2 4-14 9-3v-4Z"
    stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>
</svg>`;

function formatPriceAUD(cents){
  return 'A$' + Math.round(cents / 100).toLocaleString('en-AU');
}

function formatNo(n){
  return 'N° ' + String(n).padStart(3, '0');
}

/* Deterministic per-piece pseudo-randomness: the same product id always
   produces the same seed, and the same seed always produces the same
   sequence of PRNG draws — so each product's botanical illustration is
   stable across reloads, but distinct from every other product's. */
function seedFromId(id) {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) + h) ^ id.charCodeAt(i);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function jitterPoint(x, y, px, py, angleDeg, scale) {
  const rad = angleDeg * Math.PI / 180;
  const dx = (x - px) * scale, dy = (y - py) * scale;
  return [
    px + dx * Math.cos(rad) - dy * Math.sin(rad),
    py + dx * Math.sin(rad) + dy * Math.cos(rad)
  ];
}

function buildLeaf(pivot, bladePts, veinPts, angleDeg, scale) {
  const [px, py] = pivot;
  const jb = bladePts.map(([x, y]) => jitterPoint(x, y, px, py, angleDeg, scale));
  const jv = veinPts.map(([x, y]) => jitterPoint(x, y, px, py, angleDeg, scale));
  const f = n => n.toFixed(1);
  const bladePath = `M${f(px)} ${f(py)} C ${f(jb[0][0])} ${f(jb[0][1])}, ${f(jb[1][0])} ${f(jb[1][1])}, ${f(jb[2][0])} ${f(jb[2][1])} C ${f(jb[3][0])} ${f(jb[3][1])}, ${f(jb[4][0])} ${f(jb[4][1])}, ${f(px)} ${f(py)} Z`;
  const veinPath = `M${f(jv[0][0])} ${f(jv[0][1])} C ${f(jv[1][0])} ${f(jv[1][1])}, ${f(jv[2][0])} ${f(jv[2][1])}, ${f(jv[3][0])} ${f(jv[3][1])}`;
  return { bladePath, veinPath };
}

function botanicalMark(hex, size = 320, seed = 0) {
  const stem = '#6B7A5E';
  const ink = '#5B584F';
  const rng = mulberry32(seed);
  const range = (min, max) => min + rng() * (max - min);
  const f = n => n.toFixed(1);

  const filterId = 'wc-' + hex.replace('#', '') + '-' + seed;

  // Bud: one angle drives both its tilt and its swing around the stem
  // attachment point, relative to the original fixed -48deg design.
  const budAngle = range(-60, -35);
  const budDelta = budAngle + 48;
  const stemPivot = [99, 152];
  const [bc1x, bc1y] = jitterPoint(84, 148, stemPivot[0], stemPivot[1], budDelta, 1);
  const [bc2x, bc2y] = jitterPoint(68, 140, stemPivot[0], stemPivot[1], budDelta, 1);
  const [bex, bey] = jitterPoint(56, 128, stemPivot[0], stemPivot[1], budDelta, 1);
  const [budCx, budCy] = jitterPoint(50, 122, stemPivot[0], stemPivot[1], budDelta, 1);
  const budBranch = `M${stemPivot[0]} ${stemPivot[1]} C ${f(bc1x)} ${f(bc1y)}, ${f(bc2x)} ${f(bc2y)}, ${f(bex)} ${f(bey)}`;

  // Leaves: rotate + uniformly scale each leaf's free points around its
  // fixed stem attachment point, so it stays leaf-shaped, just angled/sized differently.
  const baseLeaf = buildLeaf([98, 230],
    [[72, 227], [52, 212], [45, 188], [71, 190], [91, 208]],
    [[60, 197], [68, 205], [78, 214], [90, 221]],
    range(-13, 13), range(0.87, 1.15));
  const midLeaf = buildLeaf([99, 195],
    [[76, 190], [59, 175], [53, 152], [77, 156], [94, 173]],
    [[62, 160], [70, 169], [81, 178], [92, 186]],
    range(-13, 13), range(0.87, 1.15));
  const upperLeaf = buildLeaf([101, 165],
    [[123, 158], [139, 141], [144, 117], [121, 123], [105, 143]],
    [[137, 129], [128, 137], [117, 146], [106, 154]],
    range(-13, 13), range(0.87, 1.15));

  // Flower head: rotate the whole 5-petal arrangement's starting angle.
  const flowerRotOffset = range(0, 72);
  const petalAngles = [0, 72, 144, 216, 288].map(a => a + flowerRotOffset);

  const outerWash = petalAngles.map(a => `
    <ellipse cx="100" cy="52" rx="26" ry="44" fill="${hex}" fill-opacity="0.14"
      transform="rotate(${f(a)} 100 88)"/>`).join('');
  const midWash = petalAngles.map(a => `
    <ellipse cx="100" cy="60" rx="18" ry="34" fill="${hex}" fill-opacity="0.30"
      transform="rotate(${f(a)} 100 88)"/>`).join('');
  const inkPetals = petalAngles.map(a => `
    <ellipse cx="100" cy="66" rx="11" ry="24" fill="${hex}" fill-opacity="0.6"
      stroke="${ink}" stroke-width="0.5" stroke-opacity="0.55"
      transform="rotate(${f(a)} 100 88)"/>`).join('');

  const turbulenceSeed = Math.floor(range(1, 999));

  return `
  <svg class="ledger-botanical-svg" width="${size}" height="${size}" viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="${filterId}" x="-40%" y="-40%" width="180%" height="180%">
        <feTurbulence type="fractalNoise" baseFrequency="0.018 0.03" numOctaves="2" seed="${turbulenceSeed}" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>

    <g filter="url(#${filterId})">
      <path d="M100 250 C 92 205, 110 165, 99 118" stroke="${stem}" stroke-width="2" fill="none"/>

      <path d="${baseLeaf.bladePath}" fill="${stem}" fill-opacity="0.48" stroke="${stem}" stroke-width="0.4" stroke-opacity="0.4"/>
      <path d="${baseLeaf.veinPath}" stroke="${stem}" stroke-width="0.5" fill="none" opacity="0.5"/>

      <path d="${midLeaf.bladePath}" fill="${stem}" fill-opacity="0.5" stroke="${stem}" stroke-width="0.4" stroke-opacity="0.4"/>
      <path d="${midLeaf.veinPath}" stroke="${stem}" stroke-width="0.5" fill="none" opacity="0.5"/>

      <path d="${upperLeaf.bladePath}" fill="${stem}" fill-opacity="0.5" stroke="${stem}" stroke-width="0.4" stroke-opacity="0.4"/>
      <path d="${upperLeaf.veinPath}" stroke="${stem}" stroke-width="0.5" fill="none" opacity="0.5"/>

      <path d="${budBranch}" stroke="${stem}" stroke-width="1.2" fill="none"/>
      <ellipse cx="${f(budCx)}" cy="${f(budCy)}" rx="8.5" ry="14" fill="${hex}" fill-opacity="0.5" stroke="${ink}" stroke-width="0.45" stroke-opacity="0.45" transform="rotate(${f(budAngle)} ${f(budCx)} ${f(budCy)})"/>
      <path d="M${f(budCx)} ${f(budCy - 13)} L ${f(budCx)} ${f(budCy + 1)}" stroke="${ink}" stroke-width="0.4" stroke-opacity="0.35" fill="none" transform="rotate(${f(budAngle)} ${f(budCx)} ${f(budCy)})"/>

      ${outerWash}
      ${midWash}
      ${inkPetals}
      <circle cx="100" cy="88" r="6" fill="${hex}"/>
      <circle cx="100" cy="88" r="6" fill="none" stroke="${ink}" stroke-width="0.4" stroke-opacity="0.5"/>
      <circle cx="100" cy="88" r="2" fill="#FDFBF6"/>
    </g>
  </svg>`;
}

async function loadAndRenderProducts(){
  try {
    const res = await fetch('data/products.json', { cache: 'no-store' });
    if(!res.ok) throw new Error('Failed to fetch products.json');
    PRODUCTS = await res.json();
  } catch (err) {
    console.error('Could not load products:', err);
    PRODUCTS = [];
  }
  renderLedger();
}

function renderLedger(){
  const ledger = document.getElementById('productLedger');
  if(!ledger) return;

  if(PRODUCTS.length === 0){
    ledger.innerHTML = `<div class="ledger-empty i18n"
      data-zh="首件作品即将呈现，敬请期待。"
      data-en="The first piece from the collection is on its way."></div>`;
    applyLanguage(document.documentElement.getAttribute('data-lang') || 'en');
    return;
  }

  PRODUCTS.sort((a, b) => a.no - b.no);

  ledger.innerHTML = PRODUCTS.map(p => {
    const hasPrice = typeof p.priceAUD === 'number' && p.priceAUD > 0;
    const botanical = botanicalMark(p.swatch || '#DDD6C6', undefined, seedFromId(p.id));

    const photoBlock = p.img
      ? `<div class="ledger-photo"><img src="${p.img}" alt="${p.zh} / ${p.en}" loading="lazy"></div>`
      : `<div class="ledger-photo">${placeholderIcon}<span class="ledger-photo-label i18n" data-zh="照片待补充" data-en="Photo coming soon"></span></div>`;

    const botanicalBlock = `
      <div class="ledger-botanical">
        ${botanical}
        <span class="ledger-botanical-label i18n" data-zh="${p.colourNameZh || ''}" data-en="${p.colourNameEn || ''}"></span>
      </div>`;

    const actionBlock = p.sold
      ? `<span class="ledger-archived i18n" data-zh="已被珍藏" data-en="Now with its owner"></span>`
      : hasPrice
        ? `<button type="button" class="ledger-acquire" data-product-id="${p.id}">
             <span class="i18n" data-zh="购藏此作" data-en="Acquire This Piece"></span>
           </button>`
        : '';

    return `
    <article class="ledger-item" data-sold="${p.sold ? 'true' : 'false'}">
      <div class="ledger-meta">
        <span class="ledger-no">${formatNo(p.no)}</span>
        ${hasPrice ? `<span class="ledger-price">${formatPriceAUD(p.priceAUD)}</span>` : ''}
      </div>
      <div class="ledger-body">
        <div class="ledger-visual">
          ${photoBlock}
          ${botanicalBlock}
        </div>
        <div class="ledger-info">
          <span class="ledger-cat i18n" data-zh="${p.catZh}" data-en="${p.catEn}"></span>
          <h3 class="ledger-title">
            <span class="yarn-mark yarn-mark--right title-yarn"><svg><use href="#yarnball"></use></svg></span>
            <span class="i18n" data-zh="${p.zh}" data-en="${p.en}"></span>
          </h3>
          <p class="ledger-desc i18n" data-zh="${p.descZh}" data-en="${p.descEn}"></p>
          <div class="ledger-actions">
            ${actionBlock}
            <a class="ledger-enquire i18n" data-zh="咨询定制相近款式" data-en="Enquire About a Similar Piece"
               href="#contact" data-item-zh="${p.zh}" data-item-en="${p.en}"></a>
          </div>
        </div>
      </div>
    </article>
  `;
  }).join('');

  ledger.querySelectorAll('.ledger-enquire').forEach(link => {
    link.addEventListener('click', () => {
      const lang = document.documentElement.getAttribute('data-lang');
      const itemField = document.querySelector('#contactForm [name="item"]');
      if(itemField){
        itemField.value = lang === 'zh' ? link.dataset.itemZh : link.dataset.itemEn;
      }
    });
  });

  ledger.querySelectorAll('.ledger-acquire').forEach(btn => {
    btn.addEventListener('click', () => startCheckout(btn.dataset.productId, btn));
  });

  // Re-apply the current language to the freshly injected markup
  applyLanguage(document.documentElement.getAttribute('data-lang') || 'en');
}

/* -----------------------------------------------------------
   STRIPE CHECKOUT
------------------------------------------------------------ */
async function startCheckout(productId, btn){
  const lang = document.documentElement.getAttribute('data-lang') || 'en';
  const label = btn.querySelector('.i18n');
  const originalZh = label ? label.getAttribute('data-zh') : null;
  const originalEn = label ? label.getAttribute('data-en') : null;

  btn.disabled = true;
  if(label){
    label.textContent = lang === 'zh' ? '跳转支付中…' : 'Redirecting…';
  }

  try {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: productId })
    });
    const data = await res.json();

    if(res.ok && data.url){
      window.location.href = data.url;
      return;
    }

    alert(data.error || (lang === 'zh'
      ? '出了点问题，请稍后重试，或直接联系工作室。'
      : 'Something went wrong — please try again, or contact the studio directly.'));
  } catch (err) {
    console.error('Checkout error:', err);
    alert(lang === 'zh' ? '网络错误，请稍后重试。' : 'Network error — please try again.');
  }

  btn.disabled = false;
  if(label && originalZh && originalEn){
    label.setAttribute('data-zh', originalZh);
    label.setAttribute('data-en', originalEn);
    label.textContent = lang === 'zh' ? originalZh : originalEn;
  }
}

/* -----------------------------------------------------------
   POST-CHECKOUT BANNER (?checkout=success|cancelled)
------------------------------------------------------------ */
function initCheckoutBanner(){
  const params = new URLSearchParams(window.location.search);
  const status = params.get('checkout');
  const banner = document.getElementById('checkoutBanner');
  if(!status || !banner) return;

  const text = banner.querySelector('.i18n');
  const closeBtn = banner.querySelector('.checkout-banner-close');

  if(status === 'success'){
    banner.classList.add('success');
    text.setAttribute('data-zh', '订单已收到，感谢您的信任！我们会尽快通过邮件与您联系，确认细节与发货安排。');
    text.setAttribute('data-en', "Your order is in — thank you! We'll email shortly to confirm details and arrange shipping.");
  } else if(status === 'cancelled'){
    banner.classList.add('cancelled');
    text.setAttribute('data-zh', '支付已取消，未产生扣款。如有疑问欢迎随时联系我们。');
    text.setAttribute('data-en', 'Checkout was cancelled — you have not been charged. Feel free to reach out with any questions.');
  } else {
    return;
  }

  const lang = document.documentElement.getAttribute('data-lang') || 'en';
  text.textContent = text.getAttribute(lang === 'zh' ? 'data-zh' : 'data-en');
  banner.hidden = false;

  if(closeBtn){
    closeBtn.addEventListener('click', () => { banner.hidden = true; });
  }

  const url = new URL(window.location.href);
  url.searchParams.delete('checkout');
  url.searchParams.delete('item');
  window.history.replaceState({}, '', url.toString());
}

/* -----------------------------------------------------------
   2) LANGUAGE TOGGLE
------------------------------------------------------------ */
function applyLanguage(lang){
  document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
  document.documentElement.setAttribute('data-lang', lang);
  document.querySelectorAll('.i18n').forEach(el => {
    const text = el.getAttribute(lang === 'zh' ? 'data-zh' : 'data-en');
    if(text !== null) el.textContent = text;
  });
  document.querySelectorAll('.lang-opt').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.langBtn === lang);
  });
  localStorage.setItem('ll-lang', lang);
}

function initLanguage(){
  const saved = localStorage.getItem('ll-lang');
  const lang = saved || 'en';
  applyLanguage(lang);
  document.getElementById('langToggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-lang');
    applyLanguage(current === 'zh' ? 'en' : 'zh');
  });
}

/* -----------------------------------------------------------
   3) MOBILE NAV
------------------------------------------------------------ */
function initMobileNav(){
  const btn = document.getElementById('menuBtn');
  const links = document.getElementById('navLinks');
  btn.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
}

/* -----------------------------------------------------------
   4) CONTACT FORM -> mailto fallback
------------------------------------------------------------ */
function initContactForm(){
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const lang = document.documentElement.getAttribute('data-lang');
    const subject = lang === 'zh' ? `官网询价 — ${data.get('name')}` : `Website Enquiry — ${data.get('name')}`;
    const bodyLines = lang === 'zh'
      ? [`姓名：${data.get('name')}`, `联系方式：${data.get('reach')}`, `感兴趣的作品：${data.get('item') || '未填写'}`, '', '留言：', data.get('message')]
      : [`Name: ${data.get('name')}`, `Reach: ${data.get('reach')}`, `Interested piece: ${data.get('item') || 'N/A'}`, '', 'Message:', data.get('message')];
    const body = bodyLines.join('\n');
    window.location.href = `mailto:hello@lauralana.au?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initLanguage();
  await loadAndRenderProducts();
  initMobileNav();
  initContactForm();
  initCheckoutBanner();
});
