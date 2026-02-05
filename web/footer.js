/* web/footer.js - 二重表示ガード付き・軽量版 */
(async function lzFooterBoot() {
  "use strict";

  // ★ここが重要！すでにフッターがあれば、この先の処理をすべてキャンセルします
  if (document.getElementById('lzFooterMain')) return;

  // 0. Configの読み込み待機
  const config = await new Promise(resolve => {
    const check = () => window.LZ_CONFIG ? resolve(window.LZ_CONFIG) : setTimeout(check, 50);
    check();
  });

  const { MENU_ORDER, MENU_URL, FOOTER_LINKS, COPYRIGHT } = config;

  // 1. CSSの注入
  const style = document.createElement('style');
  style.textContent = `
    #lzFooterMain { clear: both; width: 100%; margin-top: 80px; }
    .lz-journey { background: #f9f5f4; padding: 40px 16px; border-top: 1px solid #eee; }
    .lz-steps { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; max-width: 1200px; margin: 0 auto; }
    .lz-step {
      font-family: system-ui, sans-serif; font-weight: 700; font-size: 1.4rem; padding: 12px 24px; border-radius: 50px;
      background: #fff; color: #cf3a3a; border: 2px solid #cf3a3a; text-decoration: none; transition: all .2s;
    }
    .lz-step:hover { background: #cf3a3a; color: #fff; }
    .lz-step.is-current { background: #e5e7eb; border-color: #e5e7eb; color: #9ca3af; pointer-events: none; }
    .lz-footer { background: #cf3a3a; color: #fff; padding: 60px 20px; }
    .lz-fwrap { max-width:1100px; margin:0 auto; display:flex; flex-direction:column; align-items:center; gap:20px; }
    .lz-fnav { display:flex; flex-wrap:wrap; gap:18px 28px; justify-content:center; }
    .lz-fnav__link { color:#fff; text-decoration:none; font-weight:550; font-size:1.2rem; }
    .lz-fcopy { font-size:1.1rem; opacity: 0.8; margin-top:20px; }
    @media (max-width: 768px) { .lz-step { font-size: 1.1rem; padding: 10px 18px; } }
  `;
  document.head.appendChild(style);

  // 2. HTML構造の生成
  const journeyLinks = MENU_ORDER.map(label => {
    const url = new URL(MENU_URL[label], location.origin);
    return `<a href="${MENU_URL[label]}" class="lz-step" data-path="${url.pathname}">${label}</a>`;
  }).join('');

  const footerLinks = FOOTER_LINKS.map(item => `<a href="${item.url}" class="lz-fnav__link">${item.label}</a>`).join('');

  const footerHTML = `
    <div id="lzFooterMain">
      <div class="lz-journey"><div class="lz-steps">${journeyLinks}</div></div>
      <footer class="lz-footer">
        <div class="lz-fwrap">
          <nav class="lz-fnav">${footerLinks}</nav>
          <div class="lz-fcopy">${COPYRIGHT}</div>
        </div>
      </footer>
    </div>
  `;

  // 3. 実行（bodyの一番最後に差し込む）
  document.body.insertAdjacentHTML('beforeend', footerHTML);

  // 4. 現在地のハイライト
  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
  document.querySelectorAll('#lzFooterMain .lz-step').forEach(a => {
    const linkPath = a.dataset.path.replace(/\/+$/, '') || '/';
    if (linkPath === currentPath) a.classList.add('is-current');
  });

})();