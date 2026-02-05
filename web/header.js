(async function headerNavBoot(){
  "use strict";

  /* ==========================================
     1. CSSの注入
     ========================================== */
  const cssText = `
    :root { --content-max: 1100px; --hdr-h: 68px; --logo-size: 50px; --apple-red: #cf3a3a; }
    
    .lz-hdr { 
      position: fixed !important; inset: 0 0 auto 0 !important; height: var(--hdr-h) !important; 
      background: var(--apple-red) !important; z-index: 9000 !important; color: #fff !important; 
      box-shadow: 0 4px 18px rgba(0,0,0,.12) !important;
      display: block !important;
    }

    .lz-hwrap { height: 100% !important; max-width: var(--content-max) !important; margin: 0 auto !important; padding: 0 clamp(12px, 4vw, 24px) !important; display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 16px; }
    .lz-right { display: flex !important; align-items: center !important; gap: 16px !important; }
    .lz-logo { position: relative !important; display: flex !important; align-items: center !important; gap: 12px !important; color: #fff !important; text-decoration: none !important; height: var(--hdr-h) !important; padding-left: calc(var(--logo-size) + 12px) !important; }
    .lz-logo__img { position: absolute !important; top: calc((var(--hdr-h) - var(--logo-size)) / 2) !important; left: 0 !important; width: var(--logo-size) !important; height: var(--logo-size) !important; border-radius: 5px !important; object-fit: cover !important; }
    .lz-logo__txt { display: flex !important; flex-direction: column !important; line-height: 1.05 !important; font-family: system-ui,sans-serif !important; white-space: nowrap !important; }
    .lz-t1 { font-weight: 400 !important; font-size: clamp(1.05rem, 1.9vw, 1.35rem) !important; opacity: .95 !important; }
    .lz-t2 { font-weight: 800 !important; font-size: clamp(1.55rem, 2.7vw, 2.1rem) !important; margin-top: 4px !important; }
    
    /* PCナビ */
    .lz-hnav { display: none; }
    @media (min-width: 769px) { .lz-hnav { display: block !important; } }
    .lz-hnav__list { display: flex !important; align-items: center !important; gap: 22px !important; margin: 0 !important; padding: 0 !important; list-style: none !important; }
    .lz-hnav__item { position: relative !important; height: var(--hdr-h); display: flex; align-items: center; }
    .lz-hnav__l1 { font-weight: 550 !important; font-size: clamp(1.22rem, 2.3vw, 1.58rem) !important; color: #fff !important; text-decoration: none !important; padding: 10px 12px !important; border-radius: 8px !important; transition: background .2s; }
    .lz-hnav__l1:hover { background: rgba(255, 255, 255, .15) !important; }
    
    .lz-hnav__panel { 
      position: absolute !important; right: 0 !important; top: 100% !important; 
      background: #fff !important; color: #222 !important; border-radius: 12px !important; 
      box-shadow: 0 18px 50px rgba(0,0,0,.18) !important; padding: 10px !important; 
      display: none; min-width: 220px !important; z-index: 10001 !important; 
    }
    .lz-hnav__panel.is-open { display: block !important; }
    .lz-hnav__panel a { display: block !important; padding: 12px 14px !important; color: #222 !important; text-decoration: none !important; border-radius: 8px !important; font-weight: 550 !important; font-size: 1.25rem !important; border-bottom: 1px solid #f0f0f0 !important; }
    .lz-hnav__panel a:hover { background: #f5f5f5 !important; }
    .lz-hnav__panel a:last-child { border-bottom: none !important; }

    /* 読み込み中アニメーション */
    .lz-nav-loading { padding: 20px !important; text-align: center !important; color: #999 !important; font-size: 1.1rem !important; }
    .lz-loading-dots::after { content: '...'; animation: lz-dots 1.5s steps(4, end) infinite; }
    @keyframes lz-dots { 0%, 20% { content: ''; } 40% { content: '.'; } 60% { content: '..'; } 80% { content: '...'; } }

    /* 言語プルダウン (クリック式) */
    .lz-lang { position: relative !important; display: none; height: var(--hdr-h); align-items: center; }
    @media (min-width: 769px) { .lz-lang { display: flex !important; } }
    .lz-lang__btn { display: inline-flex !important; align-items: center !important; gap: 8px !important; height: 40px !important; padding: 0 14px !important; border: 1px solid rgba(255, 255, 255, .6) !important; background: transparent !important; color: #fff !important; border-radius: 20px !important; cursor: pointer !important; font-weight: 550 !important; }
    .lz-lang__btn::after { content: ""; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #fff; transition: transform .3s; }
    .lz-lang__btn.is-active::after { transform: rotate(180deg); }
    
    .lz-lang__menu { 
      position: absolute !important; right: 0 !important; top: 100% !important; margin-top: 5px !important;
      background: #fff !important; border-radius: 12px !important; 
      box-shadow: 0 10px 30px rgba(0,0,0,.15) !important; padding: 8px !important; 
      display: none; min-width: 170px !important; flex-direction: column !important; z-index: 10002; 
    }
    .lz-lang__menu.is-open { display: flex !important; }
    .lz-lang__menu a { display: block !important; padding: 10px 14px !important; color: #222 !important; text-decoration: none !important; border-radius: 8px !important; font-weight: 550; font-size: 1rem; }
    .lz-lang__menu a:hover:not(.is-disabled) { background: #f5f5f5; }
    .lz-lang__menu a.is-disabled { color: #bbb !important; cursor: not-allowed !important; pointer-events: none !important; }

    /* スマホドロワー */
    .lz-hamb { display: flex !important; width: 44px !important; height: 44px !important; border: 1px solid rgba(255,255,255,.6) !important; background: transparent !important; border-radius: 10px !important; color: #fff !important; flex-direction: column !important; justify-content: center !important; align-items: center !important; gap: 6px !important; cursor: pointer; }
    @media (min-width: 769px) { .lz-hamb { display: none !important; } }
    .lz-hamb__bar { width: 24px !important; height: 2px !important; background: #fff !important; border-radius: 2px !important; }
    .lz-dw-backdrop { position: fixed !important; inset: 0 !important; background: rgba(0,0,0,.35) !important; z-index: 19999 !important; display: none; }
    .lz-dw-backdrop.is-open { display: block !important; }
    .lz-drawer { position: fixed !important; right: 0 !important; top: 0 !important; bottom: 0 !important; width: 80vw !important; max-width: 360px !important; background: #fff !important; z-index: 20001 !important; transform: translateX(100%) !important; transition: transform .3s ease !important; overflow-y: auto !important; }
    .lz-drawer.is-open { transform: translateX(0) !important; }
    .lz-dw-group { border-bottom: 1px solid #eee; }
    .lz-dw-l1-row { display: flex !important; align-items: center; justify-content: space-between; width: 100%; }
    .lz-dw-l1a { flex: 1; display: block; padding: 18px 20px; font-weight: bold; font-size: 1.15rem; color: #333 !important; text-decoration: none !important; }
    .lz-dw-arrow { padding: 18px 20px; color: var(--apple-red); cursor: pointer; transition: transform .3s; font-size: 1.2rem; display: flex; align-items: center; }
    .lz-dw-group.is-active .lz-dw-arrow { transform: rotate(180deg); }
    .lz-dw-l2-area { background: #f9f9f9; display: none; padding: 5px 0 15px 30px; }
    .lz-dw-group.is-active .lz-dw-l2-area { display: block; }
    .lz-dw-l2-area a { display: block; padding: 12px 0; color: #666 !important; text-decoration: none !important; font-size: 1.05rem; }

    @media (max-width:768px){ body { padding-top: var(--hdr-h) !important; } }
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
      <a class="lz-logo" id="lzLogo" href="https://appletown-iizuna.com">
        <img class="lz-logo__img" src="https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ca7ecd0-96ba-013e-3700-0a58a9feac02/%E3%82%8A%E3%82%93%E3%81%93%E3%82%99%E3%83%AD%E3%82%B3%E3%82%99_%E7%99%BD.png" alt="ロゴ">
        <span class="lz-logo__txt">
          <span class="lz-t1">飯綱町産りんごポータルサイト</span>
          <span class="lz-t2">りんごのまちいいづな</span>
        </span>
      </a>
      <div class="lz-right">
        <nav class="lz-hnav"><ul class="lz-hnav__list" id="lzNavList"></ul></nav>
        <div class="lz-lang" id="lzLang">
          <button class="lz-lang__btn" type="button"><span>日本語</span></button>
          <div class="lz-lang__menu">
            <a href="#" data-lang="ja">日本語</a>
            <a href="#" data-lang="en" class="is-disabled">English（準備中）</a>
            <a href="#" data-lang="zh" class="is-disabled">中文（準備中）</a>
          </div>
        </div>
        <button class="lz-hamb" id="lzHamb"><span class="lz-hamb__bar"></span><span class="lz-hamb__bar"></span><span class="lz-hamb__bar"></span></button>
      </div>
    </div>
  </header>
  <div class="lz-dw-backdrop" id="lzDwBackdrop"></div>
  <aside class="lz-drawer" id="lzDrawer">
    <div class="lz-dw-head" style="padding:15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-weight:bold; font-size:1.2rem; color:#333;">メニュー</div>
      <button id="lzDwClose" style="border:none; background:none; font-size:32px; color:#999; cursor:pointer;">&times;</button>
    </div>
    <nav class="lz-dw-nav" id="lzDwNav"></nav>
  </aside>`;

  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  /* ==========================================
     3. 制御ロジック
     ========================================== */
  const config = await new Promise(resolve => {
    const check = () => window.LZ_CONFIG ? resolve(window.LZ_CONFIG) : setTimeout(check, 50);
    check();
  });
  const { ENDPOINT, MENU_ORDER, MENU_URL } = config;

  function renderSkeleton(){
    const ul = document.getElementById('lzNavList'), dw = document.getElementById('lzDwNav');
    const loadingHTML = '<div class="lz-nav-loading"><span class="lz-loading-dots">読み込み中</span></div>';
    if(ul) ul.innerHTML = MENU_ORDER.map(l1 => `<li class="lz-hnav__item"><a href="${MENU_URL[l1]}" class="lz-hnav__l1">${l1}</a><div class="lz-hnav__panel">${loadingHTML}</div></li>`).join('');
    if(dw) dw.innerHTML = MENU_ORDER.map(l1 => `<div class="lz-dw-group" data-l1="${l1}"><div class="lz-dw-l1-row"><a class="lz-dw-l1a" href="${MENU_URL[l1]}">${l1}</a><div class="lz-dw-arrow">▼</div></div><div class="lz-dw-l2-area">${loadingHTML}</div></div>`).join('');
  }

  function setupEvents(){
    const drawer = document.getElementById('lzDrawer'), backdrop = document.getElementById('lzDwBackdrop');
    const closeDrawer = () => { drawer.classList.remove('is-open'); backdrop.classList.remove('is-open'); };

    // PCメニュー：排他的ホバー制御
    let closeTimer;
    const items = document.querySelectorAll('.lz-hnav__item');
    
    items.forEach(item => {
      const panel = item.querySelector('.lz-hnav__panel');
      
      item.onmouseenter = () => {
        clearTimeout(closeTimer);
        // 他のすべてのパネルを即座に閉じる
        items.forEach(other => {
          if (other !== item) other.querySelector('.lz-hnav__panel').classList.remove('is-open');
        });
        // 自分のパネルを開く
        panel.classList.add('is-open');
      };

      item.onmouseleave = () => {
        // マウスが外れたら少し待ってから閉じる（ただし他へ移動したら即キャンセルされる）
        closeTimer = setTimeout(() => {
          panel.classList.remove('is-open');
        }, 300);
      };
    });

    // 言語プルダウン：完全クリック式
    const langWrap = document.getElementById('lzLang');
    const langBtn = langWrap?.querySelector('.lz-lang__btn');
    const langMenu = langWrap?.querySelector('.lz-lang__menu');
    
    if(langBtn && langMenu) {
      langBtn.onclick = (e) => {
        e.stopPropagation();
        // 他のメニューパネルを閉じる
        items.forEach(other => other.querySelector('.lz-hnav__panel').classList.remove('is-open'));
        
        const isOpen = langMenu.classList.toggle('is-open');
        langBtn.classList.toggle('is-active', isOpen);
      };

      // 外側クリックで閉じる
      document.addEventListener('click', (e) => {
        if (!langWrap.contains(e.target)) {
          langMenu.classList.remove('is-open');
          langBtn.classList.remove('is-active');
        }
      });
    }

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
        const l2s = map.get(l1) || [];
        const links = l2s.map(l2 => `<a href="${MENU_URL[l1]}?section=${encodeURIComponent(l2)}">${l2}</a>`).join('');
        const panels = document.querySelectorAll('.lz-hnav__panel');
        if(panels[i]) panels[i].innerHTML = links || '<div class="lz-nav-loading">（記事なし）</div>';
        const dwGroups = document.querySelectorAll('.lz-dw-group');
        if(dwGroups[i]) {
          const dwArea = dwGroups[i].querySelector('.lz-dw-l2-area'), dwArrow = dwGroups[i].querySelector('.lz-dw-arrow'), dwLink = dwGroups[i].querySelector('.lz-dw-l1a');
          if(l2s.length > 0) {
            dwArea.innerHTML = links;
            const toggle = (e) => { e.preventDefault(); dwGroups[i].classList.toggle('is-active'); };
            dwArrow.onclick = toggle;
            dwLink.onclick = (e) => { if (!dwGroups[i].classList.contains('is-active')) toggle(e); else closeDrawer(); };
          } else {
            dwArea.remove(); dwArrow.style.display = 'none';
            dwLink.onclick = () => { closeDrawer(); };
          }
        }
      });
    }
  } catch(e) { console.error(e); }
})();