/* web/footer.js - 強制最後尾ワープ版 */
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
      margin-top: 100px !important;
      padding: 0 !important;
    }
    .lz-journey { background:#f9f5f4; padding:40px 16px; overflow:hidden; }
    .lz-steps { display:flex; justify-content:center; gap:16px; flex-wrap:wrap; }
    .lz-step {
      font-family: system-ui,-apple-system,sans-serif;
      font-weight:700; font-size:1.4rem; padding:14px 24px; border-radius:50px;
      background:#fff; color:#cf3a3a; border:2px solid #cf3a3a;
      text-decoration:none; transition: all .2s ease;
    }
    .lz-step:hover { background:#cf3a3a; color:#fff; }
    .lz-step.is-current { background:#e5e7eb; border-color:#e5e7eb; color:#9ca3af; cursor:default; pointer-events:none; }

    .lz-footer { background:#cf3a3a; color:#fff; padding:50px 20px; }
    .lz-fwrap { max-width:1100px; margin:0 auto; display:flex; flex-direction:column; align-items:center; gap:20px; text-align:center; }
    .lz-fnav { display:flex; flex-wrap:wrap; gap:18px 28px; justify-content:center; }
    .lz-fnav__link { color:#fff; text-decoration:none; font-weight:550; font-size:1.25rem; }
    .lz-fcopy { font-size:1.1rem; opacity:0.85; margin-top:20px; }
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
     3. 鉄壁の最後尾確保ロジック
     ========================================== */
  const ensureLastPosition = () => {
    let footer = document.getElementById('lzFooterMain');
    
    // 1. まだ無ければ作る
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

    // 2. 自分が body の「最後の要素」ではない場合、一番最後に移動する
    // ただし、自分より後ろにあるのが scriptタグや他の透明な要素なら無視する
    const lastElem = document.body.lastElementChild;
    if (lastElem && lastElem !== footer && lastElem.tagName !== 'SCRIPT') {
      document.body.appendChild(footer);
    }
  };

  // 監視開始（MutationObserver）
  const observer = new MutationObserver(() => {
    ensureLastPosition();
  });

  // body直下の要素の追加・削除を監視
  observer.observe(document.body, { childList: true });

  // リロード対策：最初の数秒間は定期的にチェックして位置を補正する
  let pollCount = 0;
  const poller = setInterval(() => {
    ensureLastPosition();
    pollCount++;
    if (pollCount > 20) clearInterval(poller); // 4秒程度で終了
  }, 200);

  // 初回実行
  ensureLastPosition();
})();