/**
 * slideshow.js - スライドショー・コンポーネント (Visual Logic Edition)
 * 役割: スタイルの注入、DOM構築、強力なシャドウUXの反映
 */
(function() {
  "use strict";

  // 1. 強力な視認性を確保したCSSを注入
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
        /* ★強力な視認性：2重シャドウ */
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

  // 2. 実行メインロジック
  const init = function() {
    const root = document.getElementById('lz-slideshow-app');
    if (!root) return;

    // データ属性から取得
    const textContent = root.getAttribute('data-text') || "";
    const images = JSON.parse(root.getAttribute('data-images') || "[]");

    injectStyles();

    // DOM構築
    let html = '<div class="lz-ss-container">';
    
    // テキスト
    html += `<div class="lz-ss-text">${textContent}</div>`;

    // 画像スライド（逆順に重なるのを防ぐため、delayを計算）
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