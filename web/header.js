/**
 * header.js - ナビゲーション・コンポーネント (Mobile Logo Fixed Edition)
 * 役割: ロゴのスマホ表示修正、双方向アンカーリンク、ページ跨ぎジャンプ機能
 */
(async function headerNavBoot(){
  "use strict";

  const C = window.LZ_COMMON;
  if (!C) return;

  /* ==========================================
     1. CSSの注入 (ロゴの表示をFlexboxで安定化)
     ========================================== */
  const cssText = `
    :root { --content-max: 1100px; --hdr-h: 68px; --logo-size: 46px; --apple-red: #cf3a3a; --soft-red: #fff5f5; --text-dark: #333; }
    
    .lz-hdr { 
      position: fixed !important; inset: 0 0 auto 0 !important; height: var(--hdr-h) !important; 
      background: var(--apple-red) !important; z-index: 9000 !important; color: #fff !important; 
      box-shadow: 0 4px 18px rgba(0,0,0,.12) !important;
      opacity: 0; visibility: hidden; transform: translateY(-30px);
      transition: opacity 1.5s cubic-bezier(0.22, 1, 0.36, 1), transform 1.5s cubic-bezier(0.22, 1, 0.36, 1), visibility 1.5s;
    }
    .lz-hdr.is-visible { opacity: 1 !important; visibility: visible !important; transform: translateY(0) !important; }

    .lz-hwrap { height: 100% !important; max-width: var(--content-max) !important; margin: 0 auto !important; padding: 0 clamp(10px, 3vw, 20px) !important; display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 10px; flex-wrap: nowrap !important; }
    
    /* ★ロゴ表示の修正：以前の安定したFlex形式へ */
    .lz-logo { 
      display: flex !important; align-items: center !important; gap: 10px !important; 
      color: #fff !important; text-decoration: none !important; 
      flex-shrink: 0 !important; /* スマホで潰れないように固定 */
      min-width: 0 !important;
    }
    .lz-logo__img { 
      width: var(--logo-size) !important; height: var(--logo-size) !important; 
      border-radius: 6px !important; object-fit: cover !important; 
      flex-shrink: 0 !important;
    }
    .lz-logo__txt { display: flex !important; flex-direction: column !important; line-height: 1.1 !important; font-family: system-ui,sans-serif !important; white-space: nowrap !important; }
    .lz-t1 { font-weight: 400 !important; font-size: clamp(0.95rem, 1.8vw, 1.2rem) !important; opacity: .9 !important; }
    .lz-t2 { font-weight: 800 !important; font-size: clamp(1.4rem, 2.5vw, 1.9rem) !important; letter-spacing: .01em !important; }
    
    .lz-right { display: flex !important; align-items: center !important; gap: clamp(8px, 2vw, 16px) !important; flex-shrink: 0 !important; }

    /* PCナビ */
    .lz-hnav { display: none; }
    @media (min-width: 1024px) { .lz-hnav { display: block !important; } }
    .lz-hnav__list { display: flex !important; align-items: center !important; gap: 20px !important; margin: 0 !important; padding: 0 !important; list-style: none !important; }
    .lz-hnav__item { position: relative !important; height: var(--hdr-h); display: flex; align-items: center; }
    .lz-hnav__l1 { font-weight: 600 !important; font-size: clamp(1.15rem, 2vw, 1.45rem) !important; color: #fff !important; text-decoration: none !important; padding: 8px 12px !important; border-radius: 10px !important; transition: background 0.3s; }
    .lz-hnav__l1:hover { background: rgba(255, 255, 255, .15) !important; }
    
    .lz-hnav__panel { 
      position: absolute !important; right: 0 !important; top: 100% !important; 
      background: #fff !important; border-radius: 20px !important; 
      box-shadow: 0 15px 50px rgba(0,0,0,.15) !important; padding: 10px !important; 
      display: none; min-width: 240px !important; z-index: 10001 !important; 
      transform-origin: top center; animation: lz-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .lz-hnav__panel.is-open { display: block !important; }
    .lz-hnav__panel a { display: block !important; padding: 12px 18px !important; color: #333 !important; text-decoration: none !important; border-radius: 12px !important; font-weight: 600; font-size: 1.25rem; transition: 0.2s; }
    .lz-hnav__panel a:hover { background: var(--soft-red); color: var(--apple-red); }

    .lz-nav-loading { padding: 20px !important; text-align: center !important; color: #bbb !important; }

    /* 言語設定 */
    .lz-lang-pc { position: relative !important; display: none; height: var(--hdr-h); align-items: center; }
    @media (min-width: 1024px) { .lz-lang-pc { display: flex !important; } }
    .lz-lang-pc__btn { height: 36px !important; padding: 0 14px !important; border: 1px solid rgba(255, 255, 255, .6) !important; background: transparent !important; color: #fff !important; border-radius: 18px !important; cursor: pointer; font-weight: 600; font-size: 1rem; }
    .lz-lang-pc__menu { position: absolute !important; right: 0 !important; top: 100% !important; background: #fff !important; border-radius: 16px !important; padding: 8px !important; display: none; min-width: 150px !important; z-index: 10002; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,.15); }
    .lz-lang-pc__menu.is-open { display: flex !important; }
    .lz-lang-pc__menu a { padding: 10px 14px !important; color: #333 !important; text-decoration: none !important; border-radius: 10px !important; font-weight: 600; }

    .lz-lang-mob { position: relative !important; display: flex !important; }
    @media (min-width: 1024px) { .lz-lang-mob { display: none !important; } }
    .lz-lang-mob__btn { width: 36px !important; height: 36px !important; display: flex !important; align-items: center !important; justify-content: center !important; border: 1px solid rgba(255,255,255,0.6) !important; border-radius: 50% !important; color: #fff !important; font-size: 13px !important; font-weight: 700 !important; background: transparent !important; }
    .lz-lang-mob__menu { position: absolute !important; right: 0 !important; top: calc(100% + 10px) !important; background: #fff !important; border-radius: 12px !important; padding: 8px !important; display: none; min-width: 150px !important; flex-direction: column; z-index: 10003; box-shadow: 0 8px 25px rgba(0,0,0,0.2); }
    .lz-lang-mob__menu.is-open { display: flex !important; }
    .lz-lang-mob__menu a { padding: 10px 14px !important; color: #333 !important; text-decoration: none !important; font-size: 1.1rem; font-weight: 600; border-radius: 8px; }
    .is-disabled { color: #ccc !important; cursor: not-allowed !important; pointer-events: none !important; opacity: 0.5; }

    /* スマホドロワー */
    .lz-hamb { display: flex !important; width: 40px !important; height: 40px !important; border: 1px solid rgba(255,255,255,.6) !important; background: transparent !important; border-radius: 10px !important; flex-direction: column !important; justify-content: center !important; align-items: center !important; gap: 5px !important; cursor: pointer; }
    @media (min-width: 1024px) { .lz-hamb { display: none !important; } }
    .lz-hamb__bar { width: 22px !important; height: 2px !important; background: #fff !important; border-radius: 2px !important; }
    
    .lz-dw-backdrop { position: fixed !important; inset: 0 !important; background: rgba(0,0,0,.35) !important; z-index: 19999 !important; display: none; }
    .lz-dw-backdrop.is-open { display: block !important; }
    
    .lz-drawer { position: fixed !important; right: 0 !important; top: 0 !important; bottom: 0 !important; width: 85vw !important; max-width: 320px !important; background: #fff !important; z-index: 20001 !important; transform: translateX(100%) !important; transition: transform .4s cubic-bezier(0.16, 1, 0.3, 1) !important; display: flex !important; flex-direction: column !important; overflow-y: auto !important; border-radius: 24px 0 0 24px !important; }
    .lz-drawer.is-open { transform: translateX(0) !important; }
    
    .lz-dw-head { padding: 18px 20px !important; border-bottom: 1px solid #f0f0f0 !important; display: flex !important; justify-content: space-between !important; align-items: center !important; }
    .lz-dw-head-title { font-weight: 800 !important; font-size: 1.2rem !important; color: var(--apple-red) !important; }
    .lz-dw-group { border-bottom: 1px solid #f9f9f9; }
    .lz-dw-l1-row { display: flex !important; align-items: center !important; justify-content: space-between !important; width: 100% !important; }
    .lz-dw-l1a { flex: 1 !important; display: block !important; padding: 18px 20px !important; font-weight: 700 !important; font-size: 1.3rem !important; color: #222 !important; text-decoration: none !important; }
    .lz-dw-arrow { padding: 18px 20px !important; color: var(--apple-red) !important; cursor: pointer !important; transition: transform 0.4s; font-size: 1.2rem !important; }
    .lz-dw-group.is-active .lz-dw-arrow { transform: rotate(180deg) !important; }
    
    .lz-dw-l2-area { background: var(--soft-red) !important; display: none; padding: 5px 0 15px 0 !important; }
    .lz-dw-group.is-active .lz-dw-l2-area { display: block !important; }
    .lz-dw-l2-area a { display: flex !important; align-items: center !important; padding: 12px 20px 12px 36px !important; color: #444 !important; text-decoration: none !important; font-size: 1.2rem !important; font-weight: 600 !important; position: relative; }
    .lz-dw-l2-area a::before { content: ""; position: absolute; left: 20px; width: 4px; height: 16px; background: var(--apple-red); border-radius: 10px; opacity: 0.3; }

    @media (max-width: 1023px) { body { padding-top: var(--hdr-h) !important; } }
    @keyframes lz-slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `;
  const styleTag = document.createElement('style');
  styleTag.textContent = cssText;
  document.head.appendChild(styleTag);

  /* ==========================================
     2. HTML構造の注入
     ========================================== */
  const headerHTML = `
  <header class="lz-hdr" id="lzHdr">
    <div class="lz-hwrap">
      <a class="lz-logo" href="https://appletown-iizuna.com">
        <img class="lz-logo__img" src="https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ca7ecd0-96ba-013e-3700-0a58a9feac02/%E3%82%8A%E3%82%93%E3%81%93%E3%82%99%E3%83%AD%E3%82%B3%E3%82%99_%E7%99%BD.png" alt="ロゴ">
        <span class="lz-logo__txt">
          <span class="lz-t1">飯綱町産りんごポータルサイト</span>
          <span class="lz-t2">りんごのまちいいづな</span>
        </span>
      </a>
      <div class="lz-right">
        <nav class="lz-hnav"><ul class="lz-hnav__list" id="lzNavList"></ul></nav>
        <div class="lz-lang-mob" id="lzLangMob">
          <button class="lz-lang-mob__btn" type="button">日</button>
          <div class="lz-lang-mob__menu">
            <a href="#">日本語</a>
            <a href="#" class="is-disabled">English（準備中）</a>
            <a href="#" class="is-disabled">中文（準備中）</a>
          </div>
        </div>
        <div class="lz-lang-pc" id="lzLangPc">
          <button class="lz-lang-pc__btn" type="button">日本語</button>
          <div class="lz-lang-pc__menu">
            <a href="#">日本語</a>
            <a href="#" class="is-disabled">English（準備中）</a>
            <a href="#" class="is-disabled">中文（準備中）</a>
          </div>
        </div>
        <button class="lz-hamb" id="lzHamb"><span class="lz-hamb__bar"></span><span class="lz-hamb__bar"></span><span class="lz-hamb__bar"></span></button>
      </div>
    </div>
  </header>
  <div class="lz-dw-backdrop" id="lzDwBackdrop"></div>
  <aside class="lz-drawer" id="lzDrawer">
    <div class="lz-dw-head">
      <div class="lz-dw-head-title">MENU</div>
      <button id="lzDwClose" style="border:none; background:none; font-size:32px; color:#999; cursor:pointer;">&times;</button>
    </div>
    <nav class="lz-dw-nav" id="lzDwNav"></nav>
  </aside>`;

  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  /* ==========================================
     3. スクロール処理ユーティリティ
     ========================================== */
  function smoothScrollToL2(label) {
    const target = document.querySelector(`.lz-section[data-l2="${label}"]`);
    if (!target) return;
    const offset = 68 + 15;
    const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  /* ==========================================
     4. 制御ロジック
     ========================================== */
  const config = await new Promise(resolve => {
    const check = () => window.LZ_CONFIG ? resolve(window.LZ_CONFIG) : setTimeout(check, 50);
    check();
  });
  const { ENDPOINT, MENU_ORDER, MENU_URL } = config;

  function renderSkeleton(){
    const ul = document.getElementById('lzNavList'), dw = document.getElementById('lzDwNav');
    const load = '<div class="lz-nav-loading">読み込み中...</div>';
    if(ul) ul.innerHTML = MENU_ORDER.map(l1 => `<li class="lz-hnav__item"><a href="${MENU_URL[l1]}" class="lz-hnav__l1">${l1}</a><div class="lz-hnav__panel">${load}</div></li>`).join('');
    if(dw) dw.innerHTML = MENU_ORDER.map(l1 => `
      <div class="lz-dw-group" data-l1="${l1}">
        <div class="lz-dw-l1-row"><a class="lz-dw-l1a" href="${MENU_URL[l1]}">${l1}</a><div class="lz-dw-arrow">▼</div></div>
        <div class="lz-dw-l2-area">${load}</div>
      </div>`).join('');
    
    const hdr = document.getElementById('lzHdr');
    const showHeader = () => { hdr.classList.add('is-visible'); window.removeEventListener('scroll', showHeader); clearTimeout(safeTimer); };
    const safeTimer = setTimeout(showHeader, 4000);
    window.addEventListener('scroll', showHeader);
    if (window.scrollY > 20) showHeader();
  }

  function setupEvents(){
    const drawer = document.getElementById('lzDrawer'), backdrop = document.getElementById('lzDwBackdrop');
    const closeDrawer = () => { drawer.classList.remove('is-open'); backdrop.classList.remove('is-open'); };

    let closeTimer;
    const items = document.querySelectorAll('.lz-hnav__item');
    items.forEach(item => {
      const panel = item.querySelector('.lz-hnav__panel');
      item.onmouseenter = () => { clearTimeout(closeTimer); items.forEach(o => { if(o !== item) o.querySelector('.lz-hnav__panel').classList.remove('is-open'); }); panel.classList.add('is-open'); };
      item.onmouseleave = () => { closeTimer = setTimeout(() => panel.classList.remove('is-open'), 300); };
    });

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a || !a.hash) return;
      const url = new URL(a.href);
      if (url.pathname === window.location.pathname) {
        const label = decodeURIComponent(a.hash.replace('#', ''));
        const target = document.querySelector(`.lz-section[data-l2="${label}"]`);
        if (target) { e.preventDefault(); smoothScrollToL2(label); closeDrawer(); }
      }
    });

    const setupLang = (cid, bc, mc) => {
      const c = document.getElementById(cid), b = c?.querySelector('.'+bc), m = c?.querySelector('.'+mc);
      if(!b || !m) return;
      b.onclick = (e) => { e.stopPropagation(); items.forEach(i => i.querySelector('.lz-hnav__panel').classList.remove('is-open')); m.classList.toggle('is-open'); };
      document.addEventListener('click', (e) => { if(!c?.contains(e.target)) m.classList.remove('is-open'); });
    };
    setupLang('lzLangPc', 'lz-lang-pc__btn', 'lz-lang-pc__menu');
    setupLang('lzLangMob', 'lz-lang-mob__btn', 'lz-lang-mob__menu');

    const hamb = document.getElementById('lzHamb'), close = document.getElementById('lzDwClose');
    hamb.onclick = () => { drawer.classList.add('is-open'); backdrop.classList.add('is-open'); };
    [backdrop, close].forEach(el => { if(el) el.onclick = closeDrawer; });
  }

  renderSkeleton(); setupEvents();

  try {
    const res = await fetch(`${ENDPOINT}?all=1`);
    const json = await res.json();
    if(json.ok) {
      const map = new Map();
      json.items.forEach(it => { if(!map.has(it.l1)) map.set(it.l1, []); if(!map.get(it.l1).includes(it.l2)) map.get(it.l1).push(it.l2); });
      MENU_ORDER.forEach((l1, i) => {
        const l2s = map.get(l1) || [], 
              links = l2s.map(l2 => `<a href="${MENU_URL[l1]}#${encodeURIComponent(l2)}">${l2}</a>`).join('');
        const panels = document.querySelectorAll('.lz-hnav__panel');
        if(panels[i]) panels[i].innerHTML = links || '<div class="lz-nav-loading">（記事なし）</div>';
        const dwGroups = document.querySelectorAll('.lz-dw-group');
        if(dwGroups[i]) {
          const area = dwGroups[i].querySelector('.lz-dw-l2-area'), arrow = dwGroups[i].querySelector('.lz-dw-arrow'), link = dwGroups[i].querySelector('.lz-dw-l1a');
          if(l2s.length > 0) {
            area.innerHTML = links;
            const t = (e) => { e.preventDefault(); dwGroups[i].classList.toggle('is-active'); };
            arrow.onclick = t; 
            link.onclick = (e) => { if(!dwGroups[i].classList.contains('is-active')) t(e); else closeDrawer(); };
          } else { area.innerHTML = ''; arrow.style.display='none'; link.onclick=closeDrawer; }
        }
      });
    }
  } catch(e) { console.error(e); }

  window.addEventListener('load', () => {
    if (window.location.hash) {
      const label = decodeURIComponent(window.location.hash.replace('#', ''));
      const checkReady = setInterval(() => {
        const target = document.querySelector(`.lz-section[data-l2="${label}"].lz-ready`);
        if (target) { clearInterval(checkReady); setTimeout(() => smoothScrollToL2(label), 400); }
      }, 100);
      setTimeout(() => clearInterval(checkReady), 5000);
    }
  });

})();