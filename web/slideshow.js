/**
 * slideshow.js - スライドショー・コンポーネント (シンプル版)
 */
(function() {
  "use strict";

  const injectStyles = function() {
    if (document.getElementById('lz-slideshow-styles')) return;
    const style = document.createElement('style');
    style.id = 'lz-slideshow-styles';
    style.textContent = `
      .lz-ss-container { position: relative; width: 100%; height: 60vh; overflow: hidden; background: #eee; }
      .lz-ss-item { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0; animation: lz-ss-fade 25s infinite; }
      @keyframes lz-ss-fade { 0% { opacity: 0; } 5% { opacity: 1; } 20% { opacity: 1; } 25% { opacity: 0; } 100% { opacity: 0; } }
      .lz-ss-text {
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        color: #fff; text-align: center; z-index: 10; width: 100%; padding: 0 4vw; box-sizing: border-box;
        font-family: system-ui, -apple-system, sans-serif; font-weight: 700; line-height: 1.4;
        font-size: clamp(1.8rem, 4.5vw, 3.2rem);
        text-shadow: 0 0 25px rgba(0,0,0,0.9), 2px 2px 10px rgba(0,0,0,0.6);
        transition: opacity .8s ease;
      }
      @media (max-width: 768px) { .lz-ss-text { font-size: clamp(1.6rem, 5.2vw, 2.8rem); line-height: 1.5; } }
    `;
    document.head.appendChild(style);
  };

  const init = function() {
    const root = document.getElementById('lz-slideshow-app');
    if (!root) return;

    // 言語判定（未設定なら ja）
    const lang = window.LZ_CURRENT_LANG || "ja";

    // テキスト取得：指定言語用属性（data-text-en等）を優先し、なければ標準（data-text）
    let text = root.getAttribute('data-text-' + lang) || root.getAttribute('data-text') || "";
    const images = JSON.parse(root.getAttribute('data-images') || "[]");

    injectStyles();

    let html = '<div class="lz-ss-container">';
    // \n を改行に変換して流し込むだけ
    html += `<div class="lz-ss-text">${text.replace(/\\n/g, '<br>').replace(/\n/g, '<br>')}</div>`;

    images.forEach((img, i) => {
      html += `<div class="lz-ss-item" style="background-image: url('${img}'); animation-delay: ${i * 5}s;"></div>`;
    });

    html += '</div>';
    root.innerHTML = html;
  };

  // 余計な監視をせず、読み込み完了と同時に即実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();