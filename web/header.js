/**
 * header.js - ナビゲーション・コンポーネント (Complete Conflict-Free Edition)
 * 役割: 絶縁設計による他パーツへの干渉防止、スマホロゴ表示復旧、アンカーリンク機能
 */
(async function headerNavBoot(){
  "use strict";

  const C = window.LZ_COMMON;
  if (!C) return;

  /* ==========================================
     1. CSSの注入 (クラス名を lz-h- に統一して絶縁)
     ========================================== */
  const cssText = `
    :root { --lz-h-max: 1100px; --lz-h-height: 68px; --lz-h-red: #cf3a3a; }
    
    .lz-hdr { 
      position: fixed !important; inset: 0 0 auto 0 !important; height: var(--lz-h-height) !important; 
      background: var(--lz-h-red) !important; z-index: 9000 !important; color: #fff !important; 
      box-shadow: 0 4px 18px rgba(0,0,0,.12) !important;
      opacity: 0; visibility: hidden; transform: translateY(-30px);
      transition: opacity 1.5s cubic-bezier(0.22, 1, 0.36, 1), transform 1.5s cubic-bezier(0.22, 1, 0.36, 1), visibility 1.5s;
    }
    .lz-hdr.is-visible { opacity: 1 !important; visibility: visible !important; transform: translateY(0) !important; }

    .lz-h-wrap { 
      height: 100% !important; max-width: var(--lz-h-max) !important; margin: 0 auto !important; 
      padding: 0 clamp(15px, 4vw, 24px) !important; 
      display: flex !important; align-items: center !important; justify-content: space-between !important; 
      gap: 12px; flex-wrap: nowrap !important; 
    }

    /* ★ロゴ表示：Flexboxで絶対配置を廃止し、左端切れを完全に防止 */
    .lz-h-brand { 
      display: flex !important; align-items: center !important; gap: 12px !important; 
      color: #fff !important; text-decoration: none !important; 
      flex: 0 1 auto !important; min-width: 0 !important;
    }
    .lz-h-brand__img { 
      width: 48px !important; height: 48px !important; 
      border-radius: 6px !important; object-fit: cover !important; 
      flex-shrink: 0 !important; /* スマホで画像が潰れるのを防ぐ */
    }
    .lz-h-brand__txt { display: flex !important; flex-direction: column !important; line-height: 1.1 !important; white-space: nowrap !important; overflow: hidden; }
    .lz-h-t1 { font-weight: 400 !important; font-size: clamp(0.85rem, 1.8vw, 1.1rem) !important; opacity: .9 !important; }
    .lz-h-t2 { font-weight: 800 !important; font-size: clamp(1.3rem, 2.5vw, 1.8rem) !important; letter-spacing: .01em !important; }
    
    .lz-h-right { display: flex !important; align-items: center !important; gap: clamp(10px, 2vw, 20px) !important; flex-shrink: 0 !important; }

    /* PCナビ・プルダウン */
    .lz-h-nav { display: none; }
    @media (min-width: 1024px) { .lz-h-nav { display: block !important; } }
    .lz-h-nav__list { display: flex !important; align-items: center !important; gap: 20px !important; margin: 0 !important; padding: 0 !important; list-style: none !important; }
    .lz-h-nav__item { position: relative !important; height: var(--lz-h-height); display: flex; align-items: center; }
    .lz-h-nav__l1 { font-weight: 600 !important; font-size: clamp(1.1rem, 2vw, 1.4rem) !important; color: #fff !important; text-decoration: none !important; padding: 8px 12px !important; border-radius: 10px !important; transition: 0.3s; }
    .lz-h-nav__l1:hover { background: rgba(255, 255, 255, .15) !important; }
    
    .lz-h-panel { 
      position: absolute !important; right: 0 !important; top: 100% !important; 
      background: #fff !important; border-radius: 20px !important; 
      box-shadow: 0 15px 50px rgba(0,0,0,.15) !important; padding: 10px !important; 
      display: none; min-width: 240px !important; z-index: 10001 !important; 
      transform-origin: top center; animation: lz-h-slide 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .lz-h-panel.is-open { display: block !important; }
    .lz-h-panel a { display: block !important; padding: 12px 18px !important; color: #333 !important; text-decoration: none !important; border-radius: 12px !important; font-weight: 600; font-size: 1.25rem; transition: 0.2s; position: relative; }
    .lz-h-panel a:hover { background: #fff5f5 !important; color: var(--lz-h-red) !important; padding-left: 26px !important; }

    /* スマホドロワー */
    .lz-h-hamb { display: flex !important; width: 42px !important; height: 42px !important; border: 1px solid rgba(255,255,255,.6) !important; background: transparent !important; border-radius: 10px !important; flex-direction: column !important; justify-content: center !important; align-items: center !important; gap: 5px !important; cursor: pointer; }
    .lz-h-hamb__bar { width: 22px !important; height: 2px !important; background: #fff !important; border-radius: 2px !important; }
    
    .lz-h-drawer { position: fixed !important; right: 0 !important; top: 0 !important; bottom: 0 !important; width: 85vw !important; max-width: 320px !important; background: #fff !important; z-index: 20001 !important; transform: translateX(100%) !important; transition: transform .4s cubic-bezier(0.16, 1, 0.3, 1) !important; overflow-y: auto !important; border-radius: 24px 0 0 24px !important; }
    .lz-h-drawer.is-open { transform: translateX(0) !important; }
    .lz-h-dw-head { padding: 18px 20px !important; border-bottom: 1px solid #f0f0f0 !important; display: flex !important; justify-content: space-between !important; align-items: center !important; }
    .lz-h-dw-l1a { display: block !important; padding: 18px 20px !important; font-weight: 700 !important; font-size: 1.3rem !important; color: #222 !important; text-decoration: none !important; }
    .lz-h-dw-l2-area { background: #fff5f5 !important; display: none; padding: 5px 0 15px 0 !important; }
    .lz-h-dw-group.is-active .lz-h-dw-l2-area { display: block !important; }
    .lz-h-dw-l2-area a { display: flex !important; align-items: center !important; padding: 12px 20px 12px 36px !important; color: #444 !important; text-decoration: none !important; font-size: 1.2rem !important; font-weight: 600 !important; }

    @keyframes lz-h-slide { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 1023px) { body { padding-top: var(--lz-h-height) !important; } }
  `;
  const styleTag = document.createElement('style');
  styleTag.textContent = cssText;
  document.head.appendChild(styleTag);

  /* ==========================================
     2. HTML構造の注入 (lz-h- 接頭辞を徹底)
     ========================================== */
  const headerHTML = `
  <header class="lz-hdr" id="lzHdr">
    <div class="lz-h-wrap">
      <a class="lz-h-brand" href="https://appletown-iizuna.com">
        <img class="lz-h-brand__img" src="https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ca7ecd0-96ba-013e-3700-0a58a9feac02/%E3%82%8A%E3%82%93%E3%81%93%E3%82%99%E3%83%AD%E3%82%B3%E3%82%99_%E7%99%BD.png" alt="ロゴ">
        <span class="lz-h-brand__txt">
          <span class="lz-h-t1">飯綱町産りんごポータルサイト</span>
          <span class="lz-h-t2">りんごのまちいいづな</span>
        </span>
      </a>
      <div class="lz-h-right">
        <nav class="lz-h-nav"><ul class="lz-h-nav__list" id="lzNavList"></ul></nav>
        <div class="lz-lang-mob" id="lzLangMob">
          <button class="lz-lang-mob__btn" style="width:36px;height:36px;border:1px solid rgba(255,255,255,0.6);border-radius:50%;background:none;color:#fff;font-weight:700;">日</button>
          <div class="lz-lang-mob__menu" style="position:absolute;right:0;top:100%;background:#fff;padding:10px;display:none;min-width:140px;box-shadow:0 8px 20px rgba(0,0,0,0.1);border-radius:10px;z-index:10003;">
            <a href="#" style="color:#333;text-decoration:none;font-weight:600;display:block;padding:8px;">日本語</a>
          </div>
        </div>
        <button class="lz-h-hamb" id="lzHamb"><span class="lz-h-hamb__bar"></span><span class="lz-h-hamb__bar"></span><span class="lz-h-hamb__bar"></span></button>
      </div>
    </div>
  </header>
  <div id="lzDwBackdrop" style="position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:19999;display:none;"></div>
  <aside class="lz-h-drawer" id="lzDrawer">
    <div class="lz-h-dw-head">
      <div style="font-weight:800;color:#cf3a3a;">MENU</div>
      <button id="lzDwClose" style="border:none;background:none;font-size:32px;color:#999;cursor:pointer;">&times;</button>
    </div>
    <nav id="lzDwNav"></nav>
  </aside>`;

  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  /* ==========================================
     3. スクロール処理・イベント
     ========================================== */
  function smoothScrollToL2(label) {
    const target = document.querySelector(`.lz-section[data-l2="${label}"]`);
    if (!target) return;
    const offset = 68 + 20;
    const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  const config = await new Promise(resolve => {
    const check = () => window.LZ_CONFIG ? resolve(window.LZ_CONFIG) : setTimeout(check, 50);
    check();
  });
  const { ENDPOINT, MENU_ORDER, MENU_URL } = config;

  function renderSkeleton(){
    const ul = document.getElementById('lzNavList'), dw = document.getElementById('lzDwNav');
    const load = '<div style="padding:20px;text-align:center;color:#bbb;">読み込み中...</div>';
    if(ul) ul.innerHTML = MENU_ORDER.map(l1 => `<li class="lz-h-nav__item"><a href="${MENU_URL[l1]}" class="lz-h-nav__l1">${l1}</a><div class="lz-h-panel">${load}</div></li>`).join('');
    if(dw) dw.innerHTML = MENU_ORDER.map(l1 => `
      <div class="lz-h-dw-group" data-l1="${l1}">
        <div style="display:flex;align-items:center;justify-content:space-between;width:100%;">
          <a class="lz-h-dw-l1a" href="${MENU_URL[l1]}">${l1}</a>
          <div class="lz-h-dw-arrow" style="padding:18px 20px;color:#cf3a3a;cursor:pointer;transition:0.3s;">▼</div>
        </div>
        <div class="lz-h-dw-l2-area">${load}</div>
      </div>`).join('');
    
    const hdr = document.getElementById('lzHdr');
    const showHeader = () => { hdr.classList.add('is-visible'); window.removeEventListener('scroll', showHeader); clearTimeout(safeTimer); };
    const safeTimer = setTimeout(showHeader, 4000);
    window.addEventListener('scroll', showHeader);
    if (window.scrollY > 20) showHeader();
  }

  function setupEvents(){
    const drawer = document.getElementById('lzDrawer'), backdrop = document.getElementById('lzDwBackdrop');
    const closeDrawer = () => { drawer.classList.remove('is-open'); backdrop.style.display = 'none'; };

    let closeTimer;
    const items = document.querySelectorAll('.lz-h-nav__item');
    items.forEach(item => {
      const panel = item.querySelector('.lz-h-panel');
      item.onmouseenter = () => { clearTimeout(closeTimer); items.forEach(o => o.querySelector('.lz-h-panel').classList.remove('is-open')); panel.classList.add('is-open'); };
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

    const langBtn = document.querySelector('.lz-lang-mob__btn'), langMenu = document.querySelector('.lz-lang-mob__menu');
    if(langBtn) langBtn.onclick = (e) => { e.stopPropagation(); langMenu.style.display = (langMenu.style.display === 'block' ? 'none' : 'block'); };
    document.addEventListener('click', () => { if(langMenu) langMenu.style.display = 'none'; });

    const hamb = document.getElementById('lzHamb'), close = document.getElementById('lzDwClose');
    hamb.onclick = () => { drawer.classList.add('is-open'); backdrop.style.display = 'block'; };
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
        const l2s = map.get(l1) || [], links = l2s.map(l2 => `<a href="${MENU_URL[l1]}#${encodeURIComponent(l2)}">${l2}</a>`).join('');
        const panels = document.querySelectorAll('.lz-h-panel');
        if(panels[i]) panels[i].innerHTML = links || '<div style="padding:10px;text-align:center;color:#999;">（記事なし）</div>';
        const dwGroups = document.querySelectorAll('.lz-h-dw-group');
        if(dwGroups[i]) {
          const area = dwGroups[i].querySelector('.lz-h-dw-l2-area'), arrow = dwGroups[i].querySelector('.lz-h-dw-arrow'), link = dwGroups[i].querySelector('.lz-h-dw-l1a');
          if(l2s.length > 0) {
            area.innerHTML = links;
            const t = (e) => { e.preventDefault(); dwGroups[i].classList.toggle('is-active'); arrow.style.transform = dwGroups[i].classList.contains('is-active') ? 'rotate(180deg)' : 'rotate(0)'; };
            arrow.onclick = t; 
            link.onclick = (e) => { if(!dwGroups[i].classList.contains('is-active')) t(e); else closeDrawer(); };
          } else { area.innerHTML = ''; if(arrow) arrow.style.display='none'; link.onclick=closeDrawer; }
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