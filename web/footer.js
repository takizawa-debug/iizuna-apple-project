/* web/footer.js - ページ最下部絶対死守版 */
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
     1. CSSの注入 (!importantを多用してペライチに勝つ)
     ========================================== */
  const style = document.createElement('style');
  style.textContent = `
    #lzFooterMain { 
      clear: both !important; 
      display: block !important; 
      width: 100% !important; 
      margin-top: 100px !important; 
      padding: 0 !important;
      position: relative !important;
      visibility: visible !important;
      z-index: 9999 !important;
    }
    /* ジャーニーナビ */
    .lz-journey { background:#f9f5f4 !important; padding:40px 16px !important; border-top: 1px solid #eee !important; }
    .lz-steps { display:flex !important; justify-content:center !important; gap:16px !important; flex-wrap:wrap !important; max-width:1200px !important; margin:0 auto !important; }
    .lz-step {
      font-family: system-ui, -apple-system, sans-serif !important; 
      font-weight:700 !important; font-size:1.4rem !important; padding:14px 24px !important; border-radius:50px !important;
      background:#fff !important; color:#cf3a3a !important; border:2px solid #cf3a3a !important; 
      text-decoration:none !important; transition: all .2s !important;
    }
    .lz-step:hover { background:#cf3a3a !important; color:#fff !important; }
    .lz-step.is-current { background:#e5e7eb !important; border-color:#e5e7eb !important; color:#9ca3af !important; pointer-events:none !important; cursor: default !important; }

    /* フッター */
    .lz-footer { background:#cf3a3a !important; color:#fff !important; padding:60px 20px !important; }
    .lz-fwrap { max-width:1100px !important; margin:0 auto !important; display:flex !important; flex-direction:column !important; align-items:center !important; gap:20px !important; }
    .lz-fnav { display:flex !important; flex-wrap:wrap !important; gap:18px 28px !important; justify-content:center !important; }
    .lz-fnav__link { color:#fff !important; text-decoration:none !important; font-weight:550 !important; font-size:1.25rem !important; }
    .lz-fcopy { font-size:1.1rem !important; opacity:0.85 !important; margin-top:20px !important; font-family: sans-serif !important; }

    @media (max-width: 768px) {
      .lz-step { font-size: 1.1rem !important; padding: 10px 18px !important; }
    }
  `;
  document.head.appendChild(style);

  /* ==========================================
     2. HTML構造の生成
     ========================================== */
  const journeyLinks = MENU_ORDER.map(label => {
    const url = new URL(MENU_URL[label], location.origin);
    return `<a href="${MENU_URL[label]}" class="lz-step" data-path="${url.pathname}">${label}</a>`;
  }).join('');

  const footerLinks = FOOTER_LINKS.map(item => {
    return `<a href="${item.url}" class="lz-fnav__link">${item.label}</a>`;
  }).join('');

  const footerHTML = `
    <div id="lzFooterMain">
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
     3. 最後尾ワープ ＆ 監視ロジック
     ========================================== */
  const moveToAbsoluteBottom = () => {
    let footer = document.getElementById('lzFooterMain');
    
    // 1. なければ作る
    if (!footer) {
      document.body.insertAdjacentHTML('beforeend', footerHTML);
      footer = document.getElementById('lzFooterMain');
      
      // 現在地ハイライト
      const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
      footer.querySelectorAll('.lz-step').forEach(a => {
        const linkPath = a.dataset.path.replace(/\/+$/, '') || '/';
        if (linkPath === currentPath) {
          a.classList.add('is-current');
          a.setAttribute('aria-current', 'page');
        }
      });
    }

    // 2. 自分が「最後の子要素」かチェック（SCRIPTなどは無視）
    // 自分より後ろに表示要素（div, section, main等）があれば、自分を末尾に移動
    let last = document.body.lastElementChild;
    while (last && (last.tagName === 'SCRIPT' || last.tagName === 'STYLE' || last.tagName === 'LINK')) {
      last = last.previousElementSibling;
    }

    if (footer && last && last !== footer) {
      document.body.appendChild(footer); // 自分の位置を一番最後に移動
    }
  };

  // 監視開始: ペライチが新しい要素（lz-sectionなど）を追加したら即座に反応
  const observer = new MutationObserver(moveToAbsoluteBottom);
  observer.observe(document.body, { childList: true });

  // リロード直後の「後出し」対策：5秒間、100msおきに強制チェック
  let pollCount = 0;
  const poller = setInterval(() => {
    moveToAbsoluteBottom();
    if (pollCount++ > 50) clearInterval(poller);
  }, 100);

  // 読み込み完了時・リサイズ時も実行
  window.addEventListener('load', moveToAbsoluteBottom);
  window.addEventListener('resize', moveToAbsoluteBottom);
  
  moveToAbsoluteBottom();

})();