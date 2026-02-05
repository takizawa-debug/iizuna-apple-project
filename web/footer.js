/* web/footer.js - 最下部固定・最適化版 */
(async function lzFooterBoot() {
  "use strict";

  /* ==========================================
     0. Configの読み込み待機
     ========================================== */
  const config = await new Promise(resolve => {
    const check = () => window.LZ_CONFIG ? resolve(window.LZ_CONFIG) : setTimeout(check, 50);
    check();
  });

  const { MENU_ORDER, MENU_URL, FOOTER_LINKS, COPYRIGHT } = config;

  /* ==========================================
     1. CSSの注入
     ========================================== */
  const style = document.createElement('style');
  style.textContent = `
    /* フッター全体のコンテナ：他の要素に被らせない */
    .lz-footer-anchor { 
      clear: both !important; 
      display: block !important; 
      width: 100% !important; 
      margin-top: 60px !important;
    }
    /* ジャーニーナビ */
    .lz-journey { background:#f9f5f4; padding:28px 16px; overflow:hidden; }
    .lz-steps { display:flex; justify-content:center; gap:16px; flex-wrap:wrap; }
    .lz-step {
      font-family: system-ui,-apple-system,sans-serif;
      font-weight:700; font-size:1.4rem; padding:14px 24px; border-radius:50px;
      background:#fff; color:#cf3a3a; border:2px solid #cf3a3a;
      text-decoration:none; transition: all .2s ease;
    }
    .lz-step:hover { background:#cf3a3a; color:#fff; }
    .lz-step.is-current { background:#e5e7eb; border-color:#e5e7eb; color:#9ca3af; cursor:default; pointer-events:none; }

    /* フッター本体 */
    .lz-footer { background:#cf3a3a; color:#fff; padding:30px 20px; }
    .lz-fwrap { max-width:1100px; margin:0 auto; display:flex; flex-direction:column; align-items:center; gap:18px; text-align:center; }
    .lz-fnav { display:flex; flex-wrap:wrap; gap:18px 28px; justify-content:center; }
    .lz-fnav__link { color:#fff; text-decoration:none; font-family: system-ui,-apple-system,sans-serif; font-weight:550; font-size:1.25rem; transition:color .2s ease; }
    .lz-fnav__link:hover { color:#ffe6e6; }
    .lz-fcopy { font-size:1.1rem; opacity:0.85; font-family: system-ui,-apple-system,sans-serif; margin-top:10px; }
  `;
  document.head.appendChild(style);

  /* ==========================================
     2. HTML構造の生成（Config連動）
     ========================================== */
  const journeyLinks = MENU_ORDER.map(label => {
    return `<a href="${MENU_URL[label]}" data-step="${label}" class="lz-step">${label}</a>`;
  }).join('');

  const footerLinks = FOOTER_LINKS.map(item => {
    return `<a href="${item.url}" class="lz-fnav__link">${item.label}</a>`;
  }).join('');

  const footerHTML = `
    <div class="lz-footer-anchor" id="lzFooterMain">
      <div class="lz-journey">
        <div class="lz-steps" id="lzSteps">${journeyLinks}</div>
      </div>
      <footer class="lz-footer">
        <div class="lz-fwrap">
          <nav class="lz-fnav" aria-label="フッターメニュー">${footerLinks}</nav>
          <div class="lz-fcopy">${COPYRIGHT}</div>
        </div>
      </footer>
    </div>
  `;

  /* ==========================================
     3. 注入タイミングの制御（ここが重要）
     ========================================== */
  const injectFooter = () => {
    // すでに存在する場合は二重に作らない
    if (document.getElementById('lzFooterMain')) return;

    // bodyの「最後（beforeend）」に差し込む
    document.body.insertAdjacentHTML('beforeend', footerHTML);

    // 現在地ハイライトの実行
    const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
    document.querySelectorAll('.lz-steps .lz-step').forEach(a => {
      let path = '';
      try {
        path = new URL(a.getAttribute('href'), window.location.origin).pathname.replace(/\/+$/, '') || '/';
      } catch(e) {
        path = a.getAttribute('href').replace(/[?#].*$/, '').replace(/\/+$/, '') || '/';
      }
      if (path === currentPath) {
        a.classList.add('is-current');
        a.setAttribute('aria-current', 'page');
        a.onclick = (e) => e.preventDefault();
      }
    });
  };

  // ページが完全に準備できてから（画像や他のブロックが並んだ後）実行する
  if (document.readyState === 'complete') {
    injectFooter();
  } else {
    window.addEventListener('load', injectFooter);
  }
})();