(async function headerNavBoot(){
  "use strict";

  /* ==========================================
     1. CSSの注入 (スマホドロワーのデザインを完全踏襲)
     ========================================== */
  const cssText = `
    :root { --content-max: 1100px; --hdr-h: 68px; --logo-size: 50px; --apple-red: #cf3a3a; }
    
    /* ヘッダー全体の設定（もわっと登場） */
    .lz-hdr { 
      position: fixed !important; inset: 0 0 auto 0 !important; height: var(--hdr-h) !important; 
      background: var(--apple-red) !important; z-index: 9000 !important; color: #fff !important; 
      box-shadow: 0 4px 18px rgba(0,0,0,.12) !important;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-30px);
      transition: opacity 1.5s cubic-bezier(0.22, 1, 0.36, 1), 
                  transform 1.5s cubic-bezier(0.22, 1, 0.36, 1), 
                  visibility 1.5s;
    }
    .lz-hdr.is-visible { opacity: 1 !important; visibility: visible !important; transform: translateY(0) !important; }

    .lz-hwrap { height: 100% !important; max-width: var(--content-max) !important; margin: 0 auto !important; padding: 0 clamp(12px, 4vw, 24px) !important; display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 16px; flex-wrap: nowrap !important; }
    .lz-right { display: flex !important; align-items: center !important; gap: 16px !important; flex: 0 0 auto !important; }
    
    /* ロゴ・タイトル（大きいサイズ維持） */
    .lz-logo { position: relative !important; display: flex !important; align-items: center !important; gap: 12px !important; color: #fff !important; text-decoration: none !important; height: var(--hdr-h) !important; padding-left: calc(var(--logo-size) + 12px) !important; flex: 1 1 auto !important; min-width: 0 !important; }
    .lz-logo__img { position: absolute !important; top: calc((var(--hdr-h) - var(--logo-size)) / 2) !important; left: 0 !important; width: var(--logo-size) !important; height: var(--logo-size) !important; border-radius: 5px !important; object-fit: cover !important; }
    .lz-logo__txt { display: flex !important; flex-direction: column !important; line-height: 1.05 !important; font-family: system-ui,sans-serif !important; white-space: nowrap !important; }
    .lz-t1 { font-weight: 400 !important; font-size: clamp(1.05rem, 1.9vw, 1.35rem) !important; letter-spacing: .01em !important; opacity: .95 !important; }
    .lz-t2 { font-weight: 800 !important; font-size: clamp(1.55rem, 2.7vw, 2.1rem) !important; letter-spacing: .01em !important; margin-top: 4px !important; }
    
    /* PCナビ */
    .lz-hnav { display: none; }
    @media (min-width: 1024px) { .lz-hnav { display: block !important; } }
    .lz-hnav__list { display: flex !important; align-items: center !important; gap: 22px !important; margin: 0 !important; padding: 0 !important; list-style: none !important; }
    .lz-hnav__item { position: relative !important; height: var(--hdr-h); display: flex; align-items: center; }
    .lz-hnav__l1 { font-weight: 550 !important; font-size: clamp(1.22rem, 2.3vw, 1.58rem) !important; color: #fff !important; text-decoration: none !important; padding: 10px 12px !important; border-radius: 8px !important; }
    .lz-hnav__panel { position: absolute !important; right: 0 !important; top: 100% !important; background: #fff !important; color: #222 !important; border-radius: 12px !important; box-shadow: 0 18px 50px rgba(0,0,0,.18) !important; padding: 10px !important; display: none; min-width: 220px !important; z-index: 10001 !important; }
    .lz-hnav__panel.is-open { display: block !important; }
    .lz-hnav__panel a { display: block !important; padding: 12px 14px !important; color: #222 !important; text-decoration: none !important; border-radius: 8px !important; font-weight: 550; font-size: 1.25rem; border-bottom: 1px solid #f0f0f0 !important; }

    /* 読み込み中アニメ */
    .lz-nav-loading { padding: 20px !important; text-align: center !important; color: #999 !important; font-size: 1.1rem !important; }
    .lz-loading-dots::after { content: '...'; animation: lz-dots 1.5s steps(4, end) infinite; }
    @keyframes lz-dots { 0%, 20% { content: ''; } 40% { content: '.'; } 60% { content: '..'; } 80% { content: '...'; } }

    /* 言語設定 */
    .lz-lang-pc { position: relative !important; display: none; height: var(--hdr-h); align-items: center; }
    @media (min-width: 1024px) { .lz-lang-pc { display: flex !important; } }
    .lz-lang-pc__btn { display: inline-flex !important; align-items: center !important; gap: 6px !important; height: 40px !important; padding: 0 14px !important; border: 1px solid rgba(255, 255, 255, .6) !important; background: transparent !important; color: #fff !important; border-radius: 20px !important; cursor: pointer !important; font-weight: 550; font-size: 1.1rem !important; }
    .lz-lang-pc__btn::after { content: ""; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #fff; transition: transform .3s; }
    .lz-lang-pc__btn.is-active::after { transform: rotate(180deg); }
    .lz-lang-pc__menu { position: absolute !important; right: 0 !important; top: 100% !important; margin-top: 5px !important; background: #fff !important; border-radius: 12px !important; box-shadow: 0 10px 30px rgba(0,0,0,.15) !important; padding: 8px !important; display: none; min-width: 160px !important; flex-direction: column !important; z-index: 10002; }
    .lz-lang-pc__menu.is-open { display: flex !important; }
    .lz-lang-pc__menu a { display: block !important; padding: 10px 14px !important; color: #222 !important; text-decoration: none !important; border-radius: 8px !important; font-weight: 550; font-size: 1rem; }
    .is-disabled { color: #bbb !important; cursor: not-allowed !important; pointer-events: none !important; opacity: 0.6; }

    .lz-lang-mob { position: relative !important; display: flex !important; }
    @media (min-width: 1024px) { .lz-lang-mob { display: none !important; } }
    .lz-lang-mob__btn { width: 40px !important; height: 40px !important; display: flex !important; align-items: center !important; justify-content: center !important; border: 1px solid rgba(255,255,255,0.6) !important; border-radius: 50% !important; color: #fff !important; font-size: 14px !important; font-weight: 700 !important; background: transparent !important; cursor: pointer; }
    .lz-lang-mob__menu { position: absolute !important; right: 0 !important; top: calc(100% + 10px) !important; background: #fff !important; border-radius: 10px !important; box-shadow: 0 8px 25px rgba(0,0,0,0.2) !important; padding: 6px !important; display: none; min-width: 160px !important; flex-direction: column !important; z-index: 10003; }
    .lz-lang-mob__menu.is-open { display: flex !important; }
    .lz-lang-mob__menu a { display: block !important; padding: 12px 14px !important; color: #333 !important; text-decoration: none !important; font-size: 14px !important; font-weight: 600 !important; border-radius: 6px !important; }

    /* ★スマホドロワー復元セクション★ */
    .lz-hamb { display: flex !important; width: 44px !important; height: 44px !important; border: 1px solid rgba(255,255,255,.6) !important; background: transparent !important; border-radius: 10px !important; color: #fff !important; flex-direction: column !important; justify-content: center !important; align-items: center !important; gap: 6px !important; cursor: pointer; }
    @media (min-width: 1024px) { .lz-hamb { display: none !important; } }
    .lz-hamb__bar { width: 24px !important; height: 2px !important; background: #fff !important; border-radius: 2px !important; }
    .lz-dw-backdrop { position: fixed !important; inset: 0 !important; background: rgba(0,0,0,.35) !important; z-index: 19999 !important; display: none; }
    .lz-dw-backdrop.is-open { display: block !important; }
    .lz-drawer { position: fixed !important; right: 0 !important; top: 0 !important; bottom: 0 !important; width: 80vw !important; max-width: 320px !important; background: #fff !important; z-index: 20001 !important; transform: translateX(100%) !important; transition: transform .3s ease !important; overflow-y: auto !important; }
    .lz-drawer.is-open { transform: translateX(0) !important; }
    
    .lz-dw-group { border-bottom: 1px solid #eee; }
    .lz-dw-l1-row { display: flex !important; align-items: center !important; justify-content: space-between !important; width: 100% !important; }
    .lz-dw-l1a { flex: 1 !important; display: block !important; padding: 18px 20px !important; font-weight: bold !important; font-size: 1.15rem !important; color: #333 !important; text-decoration: none !important; }
    .lz-dw-arrow { padding: 18px 20px !important; color: var(--apple-red) !important; cursor: pointer !important; transition: transform .3s !important; font-size: 1.2rem !important; display: flex !important; align-items: center !important; }
    .lz-dw-group.is-active .lz-dw-arrow { transform: rotate(180deg) !important; }
    
    .lz-dw-l2-area { background: #f9f9f9 !important; display: none; padding: 5px 0 15px 30px !important; }
    .lz-dw-group.is-active .lz-dw-l2-area { display: block !important; }
    .lz-dw-l2-area a { display: block !important; padding: 12px 0 !important; color: #666 !important; text-decoration: none !important; font-size: 1.05rem !important; }

    @media (max-width:1023px){ body { padding-top: var(--hdr-h) !important; } }
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
          <button class="lz-lang-pc__btn" type="button"><span>日本語</span></button>
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
    <div class="lz-dw-head" style="padding:15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-weight:bold; font-size:1.15rem; color:#333;">メニュー</div>
      <button id="lzDwClose" style="border:none; background:none; font-size:28px; color:#999; cursor:pointer;">&times;</button>
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
    const load = '<div class="lz-nav-loading"><span class="lz-loading-dots">読み込み中</span></div>';
    
    if(ul) ul.innerHTML = MENU_ORDER.map(l1 => `<li class="lz-hnav__item"><a href="${MENU_URL[l1]}" class="lz-hnav__l1">${l1}</a><div class="lz-hnav__panel">${load}</div></li>`).join('');
    
    if(dw) dw.innerHTML = MENU_ORDER.map(l1 => `
      <div class="lz-dw-group" data-l1="${l1}">
        <div class="lz-dw-l1-row">
          <a class="lz-dw-l1a" href="${MENU_URL[l1]}">${l1}</a>
          <div class="lz-dw-arrow">▼</div>
        </div>
        <div class="lz-dw-l2-area">${load}</div>
      </div>`).join('');
    
    // スクロール検知
    const hdr = document.getElementById('lzHdr');
    const onScroll = () => {
      if (window.scrollY > 20) {
        hdr.classList.add('is-visible');
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
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

    const setupLangToggle = (cid, bc, mc) => {
      const c = document.getElementById(cid), b = c?.querySelector('.'+bc), m = c?.querySelector('.'+mc);
      if(!b || !m) return;
      b.onclick = (e) => { e.stopPropagation(); items.forEach(i => i.querySelector('.lz-hnav__panel').classList.remove('is-open')); const open = m.classList.toggle('is-open'); b.classList.toggle('is-active', open); };
      document.addEventListener('click', (e) => { if(!c.contains(e.target)) { m.classList.remove('is-open'); b.classList.remove('is-active'); } });
    };

    setupLangToggle('lzLangPc', 'lz-lang-pc__btn', 'lz-lang-pc__menu');
    setupLangToggle('lzLangMob', 'lz-lang-mob__btn', 'lz-lang-mob__menu');

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
        const l2s = map.get(l1) || [], links = l2s.map(l2 => `<a href="${MENU_URL[l1]}?section=${encodeURIComponent(l2)}">${l2}</a>`).join('');
        
        // PC反映
        const panels = document.querySelectorAll('.lz-hnav__panel');
        if(panels[i]) panels[i].innerHTML = links || '<div class="lz-nav-loading">（記事なし）</div>';
        
        // スマホ反映（アコーディオン再接続）
        const dwGroups = document.querySelectorAll('.lz-dw-group');
        if(dwGroups[i]) {
          const area = dwGroups[i].querySelector('.lz-dw-l2-area'), arrow = dwGroups[i].querySelector('.lz-dw-arrow'), link = dwGroups[i].querySelector('.lz-dw-l1a');
          if(l2s.length > 0) {
            area.innerHTML = links;
            const t = (e) => { e.preventDefault(); dwGroups[i].classList.toggle('is-active'); };
            arrow.onclick = t; 
            link.onclick = (e) => { if(!dwGroups[i].classList.contains('is-active')) t(e); else closeDrawer(); };
          } else { 
            area.innerHTML = ''; area.style.padding = '0';
            arrow.style.display='none'; 
            link.onclick=closeDrawer; 
          }
        }
      });
    }
  } catch(e) { console.error(e); }
})();