/**
 * slideshow.js - スライドショー・コンポーネント (多言語対応版)
 */
(function() {
  "use strict";

  // 1. 強力な視認性を確保したCSSを注入 (既存デザインを完全維持)
  const injectStyles = function() {
    if (document.getElementById('lz-slideshow-styles')) return;
    const style = document.createElement('style');
    style.id = 'lz-slideshow-styles';
    style.textContent = `
      .lz-ss-container { position: relative; width: 100%; height: 60vh; overflow: hidden; background: #eee; }
      .lz-ss-item { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0; animation: lz-ss-fade 25s infinite; }
      
      @keyframes lz-ss-fade {
        0% { opacity: 0; }
        5% { opacity: 1; }
        20% { opacity: 1; }
        25% { opacity: 0; }
        100% { opacity: 0; }
      }

      .lz-ss-text {
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -48%);
        color: #fff; text-align: center; z-index: 10; width: 100%; padding: 0 4vw; box-sizing: border-box;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 700; line-height: 1.4;
        font-size: clamp(1.8rem, 4.5vw, 3.2rem);
        text-shadow: 0 0 25px rgba(0,0,0,0.9), 2px 2px 10px rgba(0,0,0,0.6);
        opacity: 0; transition: opacity .9s ease, transform .9s ease;
      }

      .lz-ss-text.is-show { opacity: 1; transform: translate(-50%, -50%); }

      @media (max-width: 768px) {
        .lz-ss-text { font-size: clamp(2rem, 5.2vw, 3.2rem); line-height: 1.5; width: 90vw; word-break: keep-all; }
      }
    `;
    document.head.appendChild(style);
  };

  // 2. 実行メインロジック (多言語テキスト選択を追加)
  const init = function() {
    const root = document.getElementById('lz-slideshow-app');
    if (!root) return;

    // ★言語判定 (common.js で設定された window.LZ_CURRENT_LANG を参照)
    const lang = window.LZ_CURRENT_LANG || "ja";

    // ★多言語テキストの取得
    // 例: langが"en"なら data-text-en を優先。なければ通常の data-text を使用。
    let textContent = root.getAttribute('data-text-' + lang);
    if (!textContent) {
      textContent = root.getAttribute('data-text') || "";
    }
    
    const images = JSON.parse(root.getAttribute('data-images') || "[]");

    injectStyles();

    // DOM構築
    let html = '<div class="lz-ss-container">';
    
    // テキスト (改行コード \n がある場合は <br> に変換して反映)
    html += `<div class="lz-ss-text">${textContent.replace(/\n/g, '<br>')}</div>`;

    // 画像スライド
    images.forEach((img, i) => {
      const delay = i * 5;
      html += `<div class="lz-ss-item" style="background-image: url('${img}'); animation-delay: ${delay}s;"></div>`;
    });

    html += '</div>';
    root.innerHTML = html;

    // 演出：少し待ってからテキストを出す
    setTimeout(() => {
      const txt = root.querySelector('.lz-ss-text');
      if (txt) txt.classList.add('is-show');
    }, 700);
  };

  // 起動
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();