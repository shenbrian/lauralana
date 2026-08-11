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
    zh: "暮色毛裙", en: "Dusk Knit Dress",
    catZh: "连衣裙 · 马海毛混纺", catEn: "Dress · Mohair Blend",
    descZh: "落肩廓形，裙摆自然垂坠，暮色紫灰渐染。",
    descEn: "Dropped shoulders and a soft, fluid hem in a dusk-grey mauve.",
    priceZh: "询价", priceEn: "Enquire",
    tagZh: "限量", tagEn: "Limited",
    img: ""
  },
  {
    zh: "云绒圆领衫", en: "Cloud Crewneck",
    catZh: "毛衣 · 100% 马海毛", catEn: "Sweater · 100% Mohair",
    descZh: "蓬松晕光质地，米白本色，四季可叠穿。",
    descEn: "A soft, hazy halo in undyed cream — layers easily through the seasons.",
    priceZh: "询价", priceEn: "Enquire",
    tagZh: "新品", tagEn: "New",
    img: ""
  },
  {
    zh: "低语高领", en: "Whisper Turtleneck",
    catZh: "毛衣 · 马海毛混纺", catEn: "Sweater · Mohair Blend",
    descZh: "修身高领设计，藕粉色手工染色纱线。",
    descEn: "A fitted turtleneck in a hand-dyed dusty-rose yarn.",
    priceZh: "询价", priceEn: "Enquire",
    tagZh: "", tagEn: "",
    img: ""
  },
  {
    zh: "苔痕开衫", en: "Moss Cardigan",
    catZh: "开衫 · 马海毛混纺", catEn: "Cardigan · Mohair Blend",
    descZh: "植物染苔绿色，肌理如林间苔藓，手工盘扣。",
    descEn: "Botanically dyed moss green with a lichen-like texture and hand-tied buttons.",
    priceZh: "询价", priceEn: "Enquire",
    tagZh: "手工染色", tagEn: "Hand-Dyed",
    img: ""
  },
  {
    zh: "初雪连衣裙", en: "First Snow Dress",
    catZh: "连衣裙 · 马海毛混纺", catEn: "Dress · Mohair Blend",
    descZh: "及踝长度，雪白本色，可根据身高定制裙长。",
    descEn: "Ankle-length in undyed white — hem length can be made to order.",
    priceZh: "询价", priceEn: "Enquire",
    tagZh: "可定制", tagEn: "Made to Order",
    img: ""
  },
  {
    zh: "深栗背心", en: "Chestnut Vest",
    catZh: "背心 · 马海毛混纺", catEn: "Vest · Mohair Blend",
    descZh: "深栗色，无袖廓形，适合叠穿于衬衫或连衣裙外。",
    descEn: "A deep chestnut sleeveless layer, made to sit over a shirt or dress.",
    priceZh: "询价", priceEn: "Enquire",
    tagZh: "", tagEn: "",
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
      <div class="product-media" style="color: var(--fleece-dim)">
        ${p.tagZh ? `<span class="product-tag i18n" data-zh="${p.tagZh}" data-en="${p.tagEn}"></span>` : ''}
        ${p.img
          ? `<img src="${p.img}" alt="${p.zh} / ${p.en}" loading="lazy">`
          : `${placeholderIcon}<span class="placeholder-tag i18n" data-zh="样品图片待补充" data-en="Photo coming soon"></span>`
        }
      </div>
      <div class="product-body">
        <span class="product-cat i18n" data-zh="${p.catZh}" data-en="${p.catEn}"></span>
        <h3 class="i18n" data-zh="${p.zh}" data-en="${p.en}"></h3>
        <p class="i18n" data-zh="${p.descZh}" data-en="${p.descEn}"></p>
        <div class="product-foot">
          <span class="product-price i18n" data-zh="${p.priceZh}" data-en="${p.priceEn}"></span>
          <a class="product-link i18n" data-zh="询价" data-en="Enquire"
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
  const lang = saved || 'zh';
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
   4) THREAD SCROLL INDICATOR
------------------------------------------------------------ */
function initThreadRail(){
  const path = document.getElementById('threadPath');
  const needle = document.getElementById('threadNeedle');
  if(!path || !needle) return;
  const length = path.getTotalLength();

  function update(){
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    const point = path.getPointAtLength(progress * length);
    needle.style.top = (progress * (window.innerHeight - 20) + 10) + 'px';
    needle.style.left = point.x + 'px';
  }
  update();
  window.addEventListener('scroll', update, { passive:true });
  window.addEventListener('resize', update);
}

/* -----------------------------------------------------------
   5) CONTACT FORM -> mailto fallback
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
  initThreadRail();
  initContactForm();
});
