/* ===========================================================
   LAURA LANA — site behaviour
   1. Bilingual (zh/en) text toggle
   2. Mobile nav
   3. Thread scroll indicator (signature element)
   4. Product grid render — swap `img` in PRODUCTS to go live
   5. Contact form -> mailto fallback (no backend required)
=========================================================== */

/* -----------------------------------------------------------
   1) PRODUCT DATA
   -----------------------------------------------------------
   To add a real photo: set `img` to the file path, e.g.
   img: "images/dusk-dress.jpg"
   Leave img: "" to keep the placeholder frame.
------------------------------------------------------------ */
const PRODUCTS = [
  {
    zh: "樱桃毛裙", en: "Cherry Knit Dress",
    catZh: "连衣裙 · 马海毛混纺", catEn: "Dress · Mohair Blend",
    descZh: "落肩廓形，高饱和樱桃红——意大利纱线特有的浓郁色彩。",
    descEn: "Dropped shoulders in a saturated cherry red, straight from the Italian dye house.",
    swatch: "#B5232F",
    img: ""
  },
  {
    zh: "钴蓝圆领衫", en: "Cobalt Crewneck",
    catZh: "毛衣 · 100% 马海毛", catEn: "Sweater · 100% Mohair",
    descZh: "蓬松晕光质地，深邃钴蓝，四季可叠穿。",
    descEn: "A soft, hazy halo in a deep cobalt blue — layers easily through the seasons.",
    swatch: "#1F4E9C",
    img: ""
  },
  {
    zh: "祖母绿高领衫", en: "Emerald Turtleneck",
    catZh: "毛衣 · 马海毛混纺", catEn: "Sweater · Mohair Blend",
    descZh: "修身高领设计，浓郁祖母绿手工染色纱线。",
    descEn: "A fitted turtleneck in a rich, hand-dyed emerald yarn.",
    swatch: "#146B4F",
    img: ""
  },
  {
    zh: "藏红花开衫", en: "Saffron Cardigan",
    catZh: "开衫 · 马海毛混纺", catEn: "Cardigan · Mohair Blend",
    descZh: "藏红花黄，肌理蓬松温暖，手工盘扣。",
    descEn: "A warm, luminous saffron yellow with hand-tied buttons.",
    swatch: "#D98A1F",
    img: ""
  },
  {
    zh: "洋红连衣裙", en: "Fuchsia Dress",
    catZh: "连衣裙 · 马海毛混纺", catEn: "Dress · Mohair Blend",
    descZh: "及踝长度，浓烈洋红，裙长可根据身高定制。",
    descEn: "Ankle-length in a bold fuchsia — hem length can be made to order.",
    swatch: "#A62368",
    img: ""
  },
  {
    zh: "紫罗兰背心", en: "Violet Vest",
    catZh: "背心 · 马海毛混纺", catEn: "Vest · Mohair Blend",
    descZh: "深紫罗兰色，无袖廓形，适合叠穿于衬衫或连衣裙外。",
    descEn: "A deep violet sleeveless layer, made to sit over a shirt or dress.",
    swatch: "#5B3A87",
    img: ""
  }
];

const placeholderIcon = `
<svg class="placeholder-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 10c0-3.5 3.6-6 12-6s12 2.5 12 6v4l9 3 4 14-7 2-2-9v34H16V30l-2 9-7-2 4-14 9-3v-4Z"
    stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>
</svg>`;

function renderProducts(){
  const grid = document.getElementById('productGrid');
  grid.innerHTML = PRODUCTS.map(p => `
    <article class="product-card">
      <div class="product-media">
        <span class="product-tag i18n" data-zh="独一无二" data-en="One of One"></span>
        ${p.img
          ? `<img src="${p.img}" alt="${p.zh} / ${p.en}" loading="lazy">`
          : `${placeholderIcon}<span class="placeholder-tag i18n" data-zh="样品图片待补充" data-en="Photo coming soon"></span>`
        }
        <span class="colour-bar" style="background:${p.swatch}" title="${p.swatch}"></span>
      </div>
      <div class="product-body">
        <span class="product-cat i18n" data-zh="${p.catZh}" data-en="${p.catEn}"></span>
        <h3 class="product-name">
          <span class="yarn-mark yarn-mark--right title-yarn"><svg><use href="#yarnball"></use></svg></span>
          <span class="i18n" data-zh="${p.zh}" data-en="${p.en}"></span>
        </h3>
        <p class="i18n" data-zh="${p.descZh}" data-en="${p.descEn}"></p>
        <div class="product-foot">
          <a class="product-link i18n" data-zh="咨询定制" data-en="Enquire to Commission"
             href="#contact" data-item-zh="${p.zh}" data-item-en="${p.en}"></a>
        </div>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.product-link').forEach(link => {
    link.addEventListener('click', () => {
      const lang = document.documentElement.getAttribute('data-lang');
      const itemField = document.querySelector('#contactForm [name="item"]');
      if(itemField){
        itemField.value = lang === 'zh' ? link.dataset.itemZh : link.dataset.itemEn;
      }
    });
  });
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

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  initLanguage();
  initMobileNav();
  initContactForm();
});
