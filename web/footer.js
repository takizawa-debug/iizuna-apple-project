(function lzFooterBoot() {
  "use strict";

  /* ==========================================
     1. CSSの注入 (ジャーニーナビ & フッター)
     ========================================== */
  const style = document.createElement('style');
  style.textContent = `
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
    .lz-step.is-current, .lz-step[aria-current="page"] {
      background:#e5e7eb; border-color:#e5e7eb; color:#9ca3af; cursor:default; pointer-events:none;
    }
    .lz-step:focus-visible { outline:3px solid rgba(207,58,58,.5); outline-offset:2px; }

    /* フッター */
    .lz-footer { background:#cf3a3a; color:#fff; padding:30px 20px; margin-top:60px; }
    .lz-fwrap { max-width:1100px; margin:0 auto; display:flex; flex-direction:column; align-items:center; gap:18px; text-align:center; }
    .lz-fnav { display:flex; flex-wrap:wrap; gap:18px 28px; justify-content:center; }
    .lz-fnav__link { color:#fff; text-decoration:none; font-family: system-ui,-apple-system,sans-serif; font-weight:550; font-size:1.25rem; transition:color .2s ease; }
    .lz-fnav__link:hover { color:#ffe6e6; }
    .lz-fcopy { font-size:1.1rem; opacity:0.85; font-family: system-ui,-apple-system,sans-serif; }
  `;
  document.head.appendChild(style);

  /* ==========================================
     2. HTML構造の注入 (ジャーニーナビ ＋ フッター)
     ========================================== */
  const footerHTML = `
    <div class="lz-journey">
      <div class="lz-steps" id="lzSteps">
        <a href="https://appletown-iizuna.com/learn" data-step="知る" class="lz-step">知る</a>
        <a href="https://appletown-iizuna.com/taste" data-step="味わう" class="lz-step">味わう</a>
        <a href="https://appletown-iizuna.com/experience" data-step="体験する" class="lz-step">体験する</a>
        <a href="https://appletown-iizuna.com/live-work" data-step="働く・住む" class="lz-step">働く・住む</a>
        <a href="https://appletown-iizuna.com/sell-promote" data-step="販売・発信する" class="lz-step">販売・発信する</a>
      </div>
    </div>
    <footer class="lz-footer">
      <div class="lz-fwrap">
        <nav class="lz-fnav" aria-label="フッターメニュー">
          <a href="https://appletown-iizuna.com/contact" class="lz-fnav__link">お問い合わせ</a>
          <a href="#" class="lz-fnav__link">サイトマップ</a>
          <a href="https://appletown-iizuna.com/site-policy" class="lz-fnav__link">サイトポリシー</a>
          <a href="https://appletown-iizuna.com/privacy-policy" class="lz-fnav__link">個人情報保護方針</a>
        </nav>
        <div class="lz-fcopy">© 2025 Iizuna Town All Rights Reserved.</div>
      </div>
    </footer>
  `;
  document.body.insertAdjacentHTML('beforeend', footerHTML);

  /* ==========================================
     3. 現在地ハイライト処理
     ========================================== */
  const markCurrentStep = () => {
    const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
    const links = document.querySelectorAll('.lz-steps .lz-step');
    
    links.forEach(a => {
      let path = '';
      try {
        path = new URL(a.getAttribute('href'), window.location.origin).pathname.replace(/\/+$/, '') || '/';
      } catch(e) {
        path = a.getAttribute('href').replace(/[?#].*$/, '').replace(/\/+$/, '') || '/';
      }

      if (path === currentPath) {
        a.classList.add('is-current');
        a.setAttribute('aria-current', 'page');
        a.setAttribute('aria-disabled', 'true');
        a.setAttribute('tabindex', '-1');
        a.onclick = (e) => e.preventDefault();
      }
    });
  };

  markCurrentStep();
})();