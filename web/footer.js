/* web/footer.js - デザイナーズ・統合版 */
(async function lzFooterBoot() {
  "use strict";

  // 1. 二重表示ガード
  if (document.getElementById('lzFooterMain')) return;

  const config = await new Promise(resolve => {
    const check = () => window.LZ_CONFIG ? resolve(window.LZ_CONFIG) : setTimeout(check, 50);
    check();
  });

  const { MENU_ORDER, MENU_URL, FOOTER_LINKS, COPYRIGHT } = config;

  // 2. CSSの注入（ヘッダーの世界観と統一）
  const style = document.createElement('style');
  style.textContent = `
    #lzFooterMain { clear: both !important; width: 100% !important; margin-top: 100px !important; display: block !important; font-family: system-ui, -apple-system, sans-serif !important; }
    
    /* ジャーニーセクション（次のページへの誘い） */
    .lz-journey { background: var(--soft-red, #fff5f5); padding: 80px 20px; border-top: 1px solid rgba(207, 58, 58, 0.05); text-align: center; }
    .lz-journey__title { font-weight: 800; font-size: 1.6rem; color: #cf3a3a; margin-bottom: 40px; letter-spacing: 0.05em; }
    
    .lz-steps { display: flex; justify-content: center; gap: 18px; flex-wrap: wrap; max-width: 1100px; margin: 0 auto; }
    
    /* ステップボタン（ヘッダーのプルダウンとデザイン統合） */
    .lz-step {
      position: relative;
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 160px; padding: 18px 32px;
      background: #fff; color: #333; 
      border-radius: 40px; /* 大胆な角丸で可愛く */
      font-weight: 700; font-size: 1.3rem; text-decoration: none;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid rgba(0,0,0,0.02);
    }

    /* ホバー：ヘッダーと同じく赤いラインがスッと出る演出 */
    .lz-step:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(207, 58, 58, 0.12);
      color: #cf3a3a;
      padding-bottom: 18px;
    }
    .lz-step::after {
      content: ""; position: absolute; bottom: 12px; width: 0; height: 3px; 
      background: #cf3a3a; border-radius: 10px; transition: width 0.3s ease;
    }
    .lz-step:hover::after { width: 30px; }

    /* 現在のページ：押せない・控えめなデザイン */
    .lz-step.is-current {
      background: rgba(0,0,0,0.03); color: #bbb; border: 1px dashed #ddd;
      box-shadow: none; pointer-events: none; transform: none;
    }
    .lz-step.is-current::after { display: none; }

    /* メインフッター（ブランドカラー） */
    .lz-footer { background: #cf3a3a; color: #fff; padding: 80px 20px; }
    .lz-fwrap { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 40px; }
    
    .lz-fnav { display: flex; flex-wrap: wrap; gap: 20px 40px; justify-content: center; }
    .lz-fnav__link { 
      color: #fff; text-decoration: none; font-weight: 600; font-size: 1.15rem; 
      opacity: 0.9; transition: opacity 0.3s; 
    }
    .lz-fnav__link:hover { opacity: 1; text-decoration: underline; }
    
    .lz-fcopy { font-size: 1rem; opacity: 0.7; letter-spacing: 0.03em; }

    /* スマホ調整 */
    @media (max-width: 768px) {
      .lz-journey { padding: 60px 16px; }
      .lz-journey__title { font-size: 1.3rem; }
      .lz-step { min-width: 140px; padding: 14px 20px; font-size: 1.1rem; }
      .lz-footer { padding: 60px 16px; }
      .lz-fnav { gap: 15px 25px; }
    }
  `;
  document.head.appendChild(style);

  // 3. リンクの生成
  const journeyLinks = MENU_ORDER.map(label => {
    const targetUrl = MENU_URL[label].startsWith('http') ? MENU_URL[label] : location.origin + MENU_URL[label];
    return `<a href="${MENU_URL[label]}" class="lz-step" data-fullurl="${targetUrl}">${label}</a>`;
  }).join('');

  const footerLinks = FOOTER_LINKS.map(item => `<a href="${item.url}" class="lz-fnav__link">${item.label}</a>`).join('');

  // 4. HTMLの構築（一流デザイナーの構成）
  const footerHTML = `
    <div id="lzFooterMain">
      <div class="lz-journey">
        <div class="lz-journey__title">りんごのまちを旅する</div>
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

  // 5. 挿入
  document.body.insertAdjacentHTML('beforeend', footerHTML);

  // 6. カレント判定
  const currentUrl = location.href.split(/[?#]/)[0].replace(/\/+$/, '');
  document.querySelectorAll('#lzFooterMain .lz-step').forEach(a => {
    const linkUrl = a.dataset.fullurl.split(/[?#]/)[0].replace(/\/+$/, '');
    if (linkUrl === currentUrl) {
      a.classList.add('is-current');
    }
  });

})();