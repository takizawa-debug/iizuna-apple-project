/* web/footer.js - 安定配置版 */
(async function lzFooterBoot() {
  "use strict";

  // 1. 二重表示ガード：既に存在して「表示されている」場合は終了
  const existing = document.getElementById('lzFooterMain');
  if (existing) return;

  const config = await new Promise(resolve => {
    const check = () => window.LZ_CONFIG ? resolve(window.LZ_CONFIG) : setTimeout(check, 50);
    check();
  });

  const { MENU_ORDER, MENU_URL, FOOTER_LINKS, COPYRIGHT } = config;

  // 2. CSSの注入
  const style = document.createElement('style');
  style.textContent = `
    #lzFooterMain { clear: both !important; width: 100% !important; margin-top: 80px !important; display: block !important; }
    .lz-journey { background: #f9f5f4; padding: 40px 16px; border-top: 1px solid #eee; }
    .lz-steps { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; max-width: 1200px; margin: 0 auto; }
    .lz-step {
      font-family: system-ui, sans-serif; font-weight: 700; font-size: 1.4rem; padding: 12px 24px; border-radius: 50px;
      background: #fff; color: #cf3a3a; border: 2px solid #cf3a3a; text-decoration: none; transition: all .2s;
    }
    .lz-step:hover { background: #cf3a3a; color: #fff; }
    .lz-step.is-current { background: #e5e7eb; border-color: #e5e7eb; color: #9ca3af; pointer-events: none; }
    .lz-footer { background: #cf3a3a; color: #fff; padding: 60px 20px; }
    .lz-fwrap { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 20px; }
    .lz-fnav { display: flex; flex-wrap: wrap; gap: 18px 28px; justify-content: center; }
    .lz-fnav__link { color: #fff; text-decoration: none; font-weight: 550; font-size: 1.2rem; }
    .lz-fcopy { font-size: 1.1rem; opacity: 0.8; margin-top: 20px; }
    @media (max-width: 768px) { .lz-step { font-size: 1.1rem; padding: 10px 18px; } }
  `;
  document.head.appendChild(style);

  // 3. リンクの生成
  const journeyLinks = MENU_ORDER.map(label => {
    // 基準URLを絶対パスで比較するために加工
    const targetUrl = MENU_URL[label].startsWith('http') ? MENU_URL[label] : location.origin + MENU_URL[label];
    return `<a href="${MENU_URL[label]}" class="lz-step" data-fullurl="${targetUrl}">${label}</a>`;
  }).join('');

  const footerLinks = FOOTER_LINKS.map(item => `<a href="${item.url}" class="lz-fnav__link">${item.label}</a>`).join('');

  // 4. HTMLの構築
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

  // 5. 【修正ポイント】bodyの最後へ確実に挿入する
  document.body.insertAdjacentHTML('beforeend', footerHTML);

  // 6. カレント表示の判定（より厳密に）
  const currentUrl = location.href.split(/[?#]/)[0].replace(/\/+$/, '');
  document.querySelectorAll('#lzFooterMain .lz-step').forEach(a => {
    const linkUrl = a.dataset.fullurl.split(/[?#]/)[0].replace(/\/+$/, '');
    if (linkUrl === currentUrl) {
      a.classList.add('is-current');
    }
  });

})();