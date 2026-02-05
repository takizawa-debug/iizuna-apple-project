(async function headerNavBoot(){
  "use strict";

  /* ==========================================
     1. CSSの自動注入 (ハードコーディングの自動化)
     ========================================== */
  const cssText = `
    :root { --content-max: 1100px; --hdr-h: 68px; --logo-size: 50px; --apple-red: #cf3a3a; }
    .sr-only { position: absolute !important; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
    .lz-hdr { position: fixed !important; inset: 0 0 auto 0 !important; height: var(--hdr-h) !important; background: var(--apple-red) !important; z-index: 9000 !important; color: #fff !important; box-shadow: 0 4px 18px rgba(0,0,0,.12) !important; }
    .lz-hwrap { height: 100% !important; max-width: var(--content-max) !important; margin: 0 auto !important; padding: 0 clamp(12px, 4vw, 24px) !important; display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 16px; flex-wrap: nowrap !important; }
    .lz-right { display: flex !important; align-items: center !important; gap: 16px !important; flex: 0 0 auto !important; }
    .lz-logo { position: relative !important; display: flex !important; align-items: center !important; gap: 12px !important; color: #fff !important; text-decoration: none !important; height: var(--hdr-h) !important; padding-left: calc(var(--logo-size) + 12px) !important; opacity: 1 !important; pointer-events: auto !important; flex: 1 1 auto !important; min-width: 0 !important; }
    .lz-logo__img { position: absolute !important; top: 0 !important; left: 0 !important; width: var(--logo-size) !important; height: var(--logo-size) !important; border-radius: 5px !important; object-fit: cover !important; transform-origin: top left !important; transform: translateY(calc((var(--hdr-h) - var(--logo-size)) / 2)) !important; }
    .lz-logo__txt { display: flex !important; flex-direction: column !important; line-height: 1.05 !important; font-family: system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans JP",sans-serif !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
    .lz-t1 { font-weight: 400 !important; font-size: clamp(1.05rem, 1.9vw, 1.35rem) !important; letter-spacing: .01em !important; opacity: .95 !important; }
    .lz-t2 { font-weight: 800 !important; font-size: clamp(1.55rem, 2.7vw, 2.1rem) !important; letter-spacing: .01em !important; margin-top: 4px !important; }
    @media (max-width:768px){ :root { --logo-size: 50px !important; } .lz-t1 { font-size: clamp(1.1rem, 4.5vw, 1.45rem) !important; } .lz-t2 { font-size: clamp(1.7rem, 6.2vw, 2.3rem) !important; } }
    .lz-hnav { display: none; }
    @media (min-width: 769px) { .lz-hnav { display: block !important; } }
    .lz-hnav__list { display: flex !important; align-items: center !important; gap: 22px !important; margin: 0 !important; padding: 0 !important; list-style: none !important; }
    .lz-hnav__item { position: relative !important; }
    .lz-hnav__l1 { font-family: system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue", Arial,"Noto Sans JP",sans-serif !important; font-weight: 550 !important; font-size: clamp(1.22rem, 2.3vw, 1.58rem) !important; color: #fff !important; text-decoration: none !important; padding: 12px 10px !important; border-radius: 10px !important; }
    .lz-hnav__l1:hover { background: rgba(255, 255, 255, .12) !important; }
    .lz-hnav__panel { position: absolute !important; right: 0 !important; top: 100% !important; margin-top: 12px !important; background: #fff !important; color: #222 !important; border-radius: 12px !important; box-shadow: 0 18px 50px rgba(0,0,0,.18) !important; padding: 10px !important; display: none; min-width: 220px !important; max-width: 360px !important; z-index: 10001 !important; }
    .lz-hnav__panel.is-open { display: block !important; }
    .lz-hnav__panel a { display: block !important; padding: 12px 14px !important; color: #222 !important; text-decoration: none !important; border-radius: 8px !important; white-space: nowrap !important; font-family: system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue", Arial,"Noto Sans JP",sans-serif !important; font-weight: 550 !important; font-size: 1.28rem !important; text-align: left !important; border-bottom: 1px solid #f0f0f0 !important; }
    .lz-hnav__panel a:last-child { border-bottom: none !important; }
    .lz-hnav__panel a:hover { background: #f5f5f7 !important; }
    .lz-lang { position: relative !important; display: none; }
    @media (min-width: 769px) { .lz-lang { display: block !important; } }
    .lz-lang__btn { display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important; height: 44px !important; padding: 0 14px !important; border: 1px solid rgba(255, 255, 255, .6) !important; background: transparent !important; color: #fff !important; border-radius: 10px !important; cursor: pointer !important; font-weight: 550 !important; font-size: 1.15rem !important; white-space: nowrap !important; }
    .lz-lang__caret { width: 14px !important; height: 14px !important; flex-shrink: 0 !important; }
    .lz-lang__menu { position: absolute !important; right: 0 !important; top: calc(100% + 10px) !important; background: #fff !important; border-radius: 12px !important; box-shadow: 0 18px 50px rgba(0,0,0,.18) !important; padding: 8px !important; display: none; min-width: 140px !important; z-index: 10002 !important; flex-direction: column !important; }
    .lz-lang__menu.is-open { display: flex !important; }
    .lz-lang__menu a { display: block !important; padding: 10px 14px !important; color: #222 !important; text-decoration: none !important; border-radius: 8px !important; font-weight: 550 !important; text-align: left !important; }
    .lz-lang__menu a:hover { background: #f5f5f7 !important; }
    .lz-hamb { display: flex !important; width: 44px !important; height: 44px !important; border: 1px solid rgba(255,255,255,.6) !important; background: transparent !important; border-radius: 10px !important; color: #fff !important; flex-direction: column !important; justify-content: center !important; align-items: center !important; gap: 6px !important; }
    @media (min-width: 769px) { .lz-hamb { display: none !important; } }
    .lz-hamb__bar { width: 24px !important; height: 2px !important; background: #fff !important; border-radius: 2px !important; }
    .lz-dw-backdrop { position: fixed !important; inset: 0 !important; background: rgba(0,0,0,.35) !important; z-index: 19999 !important; display: none; }
    .lz-dw-backdrop.is-open { display: block !important; }
    .lz-drawer { position: fixed !important; right: 0 !important; top: 0 !important; bottom: 0 !important; width: 66.6vw !important; max-width: 360px !important; background: #fff !important; z-index: 20001 !important; transform: translateX(100%) !important; transition: transform .22s ease !important; display: flex !important; flex-direction: column !important; }
    .lz-drawer.is-open { transform: translateX(0) !important; }
    @media (min-width:769px) and (max-width:1024px){ .lz-t1{ font-size: 1.1rem !important; } .lz-t2{ font-size: 1.6rem !important; } .lz-hnav__l1{ padding: 10px 6px !important; } }
    body { padding-top: var(--hdr-h) !important; }
  `;
  const styleTag = document.createElement('style');
  styleTag.textContent = cssText;
  document.head.appendChild(styleTag);

  /* ==========================================
     2. HTML構造の自動注入
     ========================================== */
  const headerHTML = `
  <header class="lz-hdr" id="lzHdr">
    <div class="lz-hwrap">
      <a class="lz-logo" id="lzLogo" href="https://appletown-iizuna.com">
        <img class="lz-logo__img" src="https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ca7ecd0-96ba-013e-3700-0a58a9feac02/%E3%82%8A%E3%82%93%E3%81%93%E3%82%99%E3%83%AD%E3%82%B3%E3%82%99_%E7%99%BD.png" alt="飯綱町りんご ロゴ">
        <span class="lz-logo__txt">
          <span class="lz-t1">飯綱町産りんごポータルサイト</span>
          <span class="lz-t2">りんごのまちいいづな</span>
        </span>
      </a>
      <div class="lz-right">
        <nav class="lz-hnav" aria-label="メインメニュー"><ul class="lz-hnav__list" id="lzNavList"></ul></nav>
        <div class="lz-lang" id="lzLang">
          <button class="lz-lang__btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="lzLangMenu">
            <span>日本語</span>
            <svg viewbox="0 0 24 24" class="lz-lang__caret" aria-hidden="true"><polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
          </button>
          <div class="lz-lang__menu" id="lzLangMenu" role="menu" aria-hidden="true">
            <a role="menuitem" href="#" data-lang="ja">日本語</a>
            <a role="menuitem" href="#" data-lang="en">English</a>
            <a role="menuitem" href="#" data-lang="zh">中文</a>
          </div>
        </div>
        <button class="lz-hamb" id="lzHamb" aria-label="メニューを開く" aria-controls="lzDrawer" aria-expanded="false">
          <span class="lz-hamb__bar"></span><span class="lz-hamb__bar"></span><span class="lz-hamb__bar"></span>
        </button>
      </div>
    </div>
  </header>
  <div class="lz-dw-backdrop" id="lzDwBackdrop"></div>
  <aside class="lz-drawer" id="lzDrawer" aria-hidden="true">
    <div class="lz-dw-head" style="padding:15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-weight:bold;">メニュー</div>
      <button id="lzDwClose" style="border:none; background:none; font-size:24px; cursor:pointer;">&times;</button>
    </div>
    <nav class="lz-dw-nav" id="lzDwNav" aria-label="モバイルメニュー"></nav>
  </aside>`;

  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  /* ==========================================
     3. ナビゲーション制御ロジック
     ========================================== */
  const getConfig = () => window.LZ_CONFIG || null;
  const config = await new Promise(resolve => {
    const check = () => getConfig() ? resolve(getConfig()) : setTimeout(check, 100);
    check();
  });
  const { ENDPOINT, MENU_ORDER, MENU_URL } = config;

  function renderSkeleton(){
    const ul = document.getElementById('lzNavList'), dw = document.getElementById('lzDwNav');
    if(ul) ul.innerHTML = MENU_ORDER.map(l1 => `<li class="lz-hnav__item"><a href="${MENU_URL[l1]}" class="lz-hnav__l1">${l1}</a><div class="lz-hnav__panel" role="menu"></div></li>`).join('');
    if(dw) dw.innerHTML = MENU_ORDER.map(l1 => `<div class="lz-dw-group"><a class="lz-dw-l1a" href="${MENU_URL[l1]}" style="display:block; padding:15px; font-weight:bold; border-bottom:1px solid #eee; text-decoration:none; color:#333;">${l1}</a><div class="lz-dw-l2-area" style="padding-left:20px; display:none;"></div></div>`).join('');
  }

  function setupEvents(){
    document.querySelectorAll('.lz-hnav__item').forEach(item => {
      item.onmouseenter = () => item.querySelector('.lz-hnav__panel').classList.add('is-open');
      item.onmouseleave = () => item.querySelector('.lz-hnav__panel').classList.remove('is-open');
    });
    const langWrap = document.getElementById('lzLang'), langBtn = langWrap?.querySelector('.lz-lang__btn'), langMenu = langWrap?.querySelector('.lz-lang__menu');
    if(langBtn) langBtn.onclick = (e) => { e.stopPropagation(); langMenu.classList.toggle('is-open'); };
    document.addEventListener('click', () => langMenu?.classList.remove('is-open'));

    const hamb = document.getElementById('lzHamb'), drawer = document.getElementById('lzDrawer'), backdrop = document.getElementById('lzDwBackdrop'), close = document.getElementById('lzDwClose');
    hamb.onclick = () => { drawer.classList.add('is-open'); backdrop.classList.add('is-open'); };
    [backdrop, close].forEach(el => { if(el) el.onclick = () => { drawer.classList.remove('is-open'); backdrop.classList.remove('is-open'); } });
  }

  renderSkeleton(); setupEvents();

  try {
    const res = await fetch(`${ENDPOINT}?all=1`);
    const json = await res.json();
    if(json.ok) {
      const map = new Map();
      json.items.forEach(it => { if(!map.has(it.l1)) map.set(it.l1, []); if(!map.get(it.l1).includes(it.l2)) map.get(it.l1).push(it.l2); });
      MENU_ORDER.forEach((l1, i) => {
        const l2s = map.get(l1) || [];
        const links = l2s.map(l2 => `<a href="${MENU_URL[l1]}?section=${encodeURIComponent(l2)}" style="display:block; padding:10px; text-decoration:none; color:#666; border-bottom:1px dashed #eee;">${l2}</a>`).join('');
        const panels = document.querySelectorAll('.lz-hnav__panel');
        if(panels[i]) panels[i].innerHTML = links;
        const dwAreas = document.querySelectorAll('.lz-dw-l2-area');
        if(dwAreas[i] && l2s.length > 0) { dwAreas[i].style.display = 'block'; dwAreas[i].innerHTML = links; }
      });
    }
  } catch(e) { console.error(e); }
})();