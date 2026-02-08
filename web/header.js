/**
 * header.js - 最終安定版
 */
(async function headerNavBoot(){
  "use strict";

  const C = window.LZ_COMMON;
  if (!C) return;

  // --- 1. CSS注入 ---
  const cssText = `
    :root { --lz-h-max: 1100px; --lz-h-height: 75px; --lz-h-red: #cf3a3a; }
    .lz-hdr { position: fixed !important; inset: 0 0 auto 0 !important; height: var(--lz-h-height) !important; background: var(--lz-h-red) !important; z-index: 9000 !important; color: #fff !important; box-shadow: 0 4px 18px rgba(0,0,0,.12) !important; opacity: 0; visibility: hidden; transform: translateY(-30px); transition: opacity 1.5s ease, transform 1.5s ease; }
    .lz-hdr.is-visible { opacity: 1 !important; visibility: visible !important; transform: translateY(0) !important; }
    .lz-h-wrap { height: 100% !important; max-width: var(--lz-h-max) !important; margin: 0 auto !important; padding: 0 20px !important; display: flex !important; align-items: center !important; justify-content: space-between !important; }
    .lz-h-brand { display: flex !important; align-items: center !important; gap: 10px !important; color: #fff !important; text-decoration: none !important; }
    .lz-h-brand__img { width: 48px !important; height: 48px !important; border-radius: 6px !important; }
    .lz-h-brand__txt { display: flex !important; flex-direction: column !important; line-height: 1.1 !important; }
    .lz-h-t1 { font-size: 0.9rem !important; opacity: .9 !important; }
    .lz-h-t2 { font-weight: 800 !important; font-size: 1.6rem !important; }
    .lz-h-nav__list { display: flex !important; align-items: center !important; gap: 15px !important; list-style: none !important; margin:0; padding:0; }
    .lz-h-nav__l1 { font-weight: 600 !important; color: #fff !important; text-decoration: none !important; padding: 8px 12px !important; font-size: 1.2rem !important; }
    .lz-h-panel { position: absolute !important; background: #fff !important; border-radius: 12px !important; box-shadow: 0 10px 30px rgba(0,0,0,0.1); padding: 10px !important; display: none; min-width: 220px !important; z-index: 10001 !important; }
    .lz-h-panel.is-open { display: block !important; }
    .lz-h-panel a { display: block !important; padding: 12px 15px !important; color: #333 !important; text-decoration: none !important; font-weight: 600; border-radius: 8px; }
    .lz-h-panel a:hover { background: #fff5f5 !important; color: #cf3a3a !important; }
    .lz-lang-pc__btn { border: 1px solid rgba(255,255,255,0.6) !important; background: transparent !important; color: #fff !important; border-radius: 20px !important; padding: 5px 15px !important; cursor: pointer; }
    .lz-h-hamb { display: flex !important; width: 36px !important; height: 36px !important; border: 1px solid rgba(255,255,255,.6) !important; background: none; border-radius: 8px; flex-direction: column; justify-content: center; align-items: center; gap: 4px; }
    .lz-h-hamb__bar { width: 20px !important; height: 2px !important; background: #fff !important; }
    .lz-h-drawer { position: fixed !important; right: 0; top: 0; bottom: 0; width: 280px; background: #fff; z-index: 20001; transform: translateX(100%); transition: transform .3s ease; }
    .lz-h-drawer.is-open { transform: translateX(0); }
  `;
  const styleTag = document.createElement('style'); styleTag.textContent = cssText; document.head.appendChild(styleTag);

  // --- 2. スクロール・言語関数 ---
  function smoothScrollToL2(label) {
    // .lz-readyが付いた「描き出し完了後の要素」を探す
    const target = document.querySelector(`.lz-section[data-l2="${label}"].lz-ready`) || document.querySelector(`[data-l2="${label}"]`);
    if (!target) return;
    const offset = 75 + 20;
    const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  function getLangLinks() {
    return window.LZ_CONFIG.LANG.SUPPORTED.map(l => {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', l);
      url.hash = ""; // 🍎 重要：エラー防止のためハッシュは消去
      return `<a href="${url.toString()}">${window.LZ_CONFIG.LANG.LABELS[l]}</a>`;
    }).join('');
  }

  // --- 3. HTML注入 ---
  const headerHTML = `
    <header class="lz-hdr" id="lzHdr">
      <div class="lz-h-wrap">
        <a class="lz-h-brand" href="https://appletown-iizuna.com?lang=${window.LZ_CURRENT_LANG}">
          <img class="lz-h-brand__img" src="${window.LZ_CONFIG.ASSETS.LOGO_WHITE}">
          <span class="lz-h-brand__txt"><span class="lz-h-t1">飯綱町産りんごポータル</span><span class="lz-h-t2">りんごのまちいいづna</span></span>
        </a>
        <div class="lz-h-right" style="display:flex; align-items:center; gap:15px;">
          <nav class="lz-h-nav"><ul class="lz-h-nav__list" id="lzNavList"></ul></nav>
          <div class="lz-lang-pc" id="lzLangPc" style="position:relative;">
            <button class="lz-lang-pc__btn">${window.LZ_CONFIG.LANG.LABELS[window.LZ_CURRENT_LANG]}</button>
            <div class="lz-lang-pc__menu" style="position:absolute; top:100%; right:0; background:#fff; border-radius:12px; display:none; flex-direction:column; box-shadow:0 10px 30px rgba(0,0,0,0.1); padding:10px;">${getLangLinks()}</div>
          </div>
          <button class="lz-h-hamb" id="lzHamb"><span class="lz-h-hamb__bar"></span><span class="lz-h-hamb__bar"></span><span class="lz-h-hamb__bar"></span></button>
        </div>
      </div>
    </header>
    <div id="lzDwBackdrop" style="position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:19999;display:none;"></div>
    <aside class="lz-h-drawer" id="lzDrawer"><div style="padding:20px; font-weight:800; color:#cf3a3a;">MENU</div><nav id="lzDwNav"></nav></aside>`;

  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  // --- 4. リンク生成ロジック ---
  const { ENDPOINT, MENU_ORDER, MENU_URL } = window.LZ_CONFIG;
  try {
    const res = await fetch(`${ENDPOINT}?all=1`);
    const json = await res.json();
    if(json.ok) {
      const map = new Map();
      json.items.forEach(it => {
        if(!map.has(it.l1)) map.set(it.l1, []);
        if(!map.get(it.l1).some(x => x.key === it.l2)) map.get(it.l1).push({ key: it.l2, label: C.L(it, 'l2') });
      });

      document.getElementById('lzNavList').innerHTML = MENU_ORDER.map((l1, i) => {
        const l2Data = map.get(l1) || [];
        // 🍎 # ではなく ?jump= パラメータを付与
        const links = l2Data.map(d => `<a href="${MENU_URL[l1]}?lang=${window.LZ_CURRENT_LANG}&jump=${encodeURIComponent(d.key)}">${d.label}</a>`).join('');
        return `<li class="lz-h-nav__item" style="position:relative;"><a href="${MENU_URL[l1]}?lang=${window.LZ_CURRENT_LANG}" class="lz-h-nav__l1">${C.T(l1)}</a><div class="lz-h-panel">${links}</div></li>`;
      }).join('');
    }
  } catch(e) { console.error(e); }

  // --- 5. イベント設定 ---
  const hamb = document.getElementById('lzHamb'), drawer = document.getElementById('lzDrawer'), backdrop = document.getElementById('lzDwBackdrop');
  hamb.onclick = () => { drawer.classList.add('is-open'); backdrop.style.display = 'block'; };
  backdrop.onclick = () => { drawer.classList.remove('is-open'); backdrop.style.display = 'none'; };

  document.querySelectorAll('.lz-h-nav__item').forEach(item => {
    const p = item.querySelector('.lz-h-panel');
    item.onmouseenter = () => p.classList.add('is-open');
    item.onmouseleave = () => p.classList.remove('is-open');
  });

  document.getElementById('lzLangPc').onclick = (e) => {
    const m = e.currentTarget.querySelector('.lz-lang-pc__menu');
    m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
  };

  // 🍎 ページ内クリック時
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const url = new URL(a.href);
    const jumpVal = url.searchParams.get('jump');
    if (url.pathname === window.location.pathname && jumpVal) {
      e.preventDefault(); smoothScrollToL2(jumpVal);
      drawer.classList.remove('is-open'); backdrop.style.display = 'none';
    }
  });

  // --- 6. 到着後の自動ジャンプ監視 ---
  window.addEventListener('load', () => {
    const jumpTarget = new URLSearchParams(window.location.search).get('jump');
    if (jumpTarget) {
      let attempts = 0;
      const check = setInterval(() => {
        const target = document.querySelector(`.lz-section[data-l2="${jumpTarget}"].lz-ready`);
        if (target) {
          clearInterval(check);
          setTimeout(() => {
            smoothScrollToL2(jumpTarget);
            const u = new URL(window.location.href); u.searchParams.delete('jump');
            history.replaceState(null, "", u.pathname + u.search);
          }, 600);
        }
        if (++attempts > 100) clearInterval(check);
      }, 150);
    }
  });

  const hdr = document.getElementById('lzHdr');
  setTimeout(() => hdr.classList.add('is-visible'), 100);
})();