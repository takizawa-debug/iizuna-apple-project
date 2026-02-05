/* web/footer.js - 監視機能付き・完全最下部固定版 */
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
    .lz-footer-anchor { 
      clear: both !important; 
      display: block !important; 
      width: 100% !important; 
      margin-top: 80px !important;
    }
    .lz-journey { background:#f9f5f4; padding:36px 16px; overflow:hidden; }
    .lz-steps { display:flex; justify-content:center; gap:16px; flex-wrap:wrap; }
    .lz-step {
      font-family: system-ui,-apple-system,sans-serif;
      font-weight:700; font-size:1.4rem; padding:14px 24px; border-radius:50px;
      background:#fff; color:#cf3a3a; border:2px solid #cf3a3a;
      text-decoration:none; transition: all .2s ease;
    }
    .lz-step:hover { background:#cf3a3a; color:#fff; }
    .lz-step.is-current { background:#e5e7eb; border-color:#e5e7eb; color:#9ca3af; cursor:default; pointer-events:none; }

    .lz-footer { background:#cf3a3a; color:#fff; padding:40px 20px; }
    .lz-fwrap { max-width:1100px; margin:0 auto; display:flex; flex-direction:column; align-items:center; gap:20px; text-align:center; }
    .lz-fnav { display:flex; flex-wrap:wrap; gap:18px 28px; justify-content:center; }
    .lz-fnav__link { color:#fff; text-decoration:none; font-weight:550; font-size:1.25rem; }
    .lz-fcopy { font-size:1.1rem; opacity:0.85; margin-top:15px; }
  `;
  document.head.appendChild(style);

  /* ==========================================
     2. HTML構造の生成
     ========================================== */
  const journeyLinks = MENU_ORDER.map(label => `<a href="${MENU_URL[label]}" class="lz-step">${label}</a>`).join('');
  const footerLinks = FOOTER_LINKS.map(item => `<a href="${item.url}" class="lz-fnav__link">${item.label}</a>`).join('');

  const footerHTML = `
    <div class="lz-footer-anchor" id="lzFooterMain">
      <div class="lz-journey">
        <div class="lz-steps">${journeyLinks}</div>
      </div>
      <footer class="lz-footer">
        <div class="lz-fwrap">
          <nav class="lz-fnav">${footerLinks}</nav>
          <div class="lz-fcopy">${COPYRIGHT}</div>
        </div>
      </footer>
    </div>
  `;

  /* ==========================================
     3. 注入 ＆ 最下部監視ロジック
     ========================================== */
  const injectFooter = () => {
    let footer = document.getElementById('lzFooterMain');
    
    if (!footer) {
      document.body.insertAdjacentHTML('beforeend', footerHTML);
      footer = document.getElementById('lzFooterMain');
      // 現在地ハイライト
      const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
      footer.querySelectorAll('.lz-step').forEach(a => {
        const path = new URL(a.getAttribute('href'), window.location.origin).pathname.replace(/\/+$/, '') || '/';
        if (path === currentPath) a.classList.add('is-current');
      });
    }

    // もし自分の後ろに要素があるなら、自分を一番下に移動させる
    if (footer.nextElementSibling) {
      document.body.appendChild(footer);
    }
  };

  // --- 監視開始 ---
  // ペライチが後からブロックを追加しても、それを検知してフッターを下に移動する
  const observer = new MutationObserver(() => {
    injectFooter();
  });

  observer.observe(document.body, { childList: true });

  // 初回実行
  if (document.readyState === 'complete') {
    injectFooter();
  } else {
    window.addEventListener('load', injectFooter);
  }
})();