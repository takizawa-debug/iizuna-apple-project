/**
 * slideshow.js - スライドショー・コンポーネント (演出強化版)
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
      
      /* テキストの初期状態：透明＆少しだけ小さい */
      .lz-ss-text {
        position: absolute; top: 50%; left: 50%;
        transform: translate(-50%, -50%) scale(0.96); /* 初期位置と少し縮小 */
        opacity: 0; /* 最初は透明 */
        color: #fff; text-align: center; z-index: 10; width: 100%; padding: 0 4vw; box-sizing: border-box;
        font-family: system-ui, -apple-system, sans-serif; font-weight: 700; line-height: 1.4;
        font-size: clamp(1.8rem, 4.5vw, 3.2rem);
        text-shadow: 0 0 25px rgba(0,0,0,0.9), 2px 2px 10px rgba(0,0,0,0.6);
        /* ゆっくり、もわっと現れるためのトランジション設定 (2秒かけて変化) */
        transition: opacity 2s ease-out, transform 2s ease-out;
        pointer-events: none; /* 表示されるまでクリック等を防止 */
      }
      /* テキストが表示される時の状態 */
      .lz-ss-text.is-visible {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1); /* 元のサイズに戻る */
        pointer-events: auto;
      }

      @media (max-width: 768px) { .lz-ss-text { font-size: clamp(1.6rem, 5.2vw, 2.8rem); line-height: 1.5; } }
    `;
    document.head.appendChild(style);
  };

  const init = function() {
    const root = document.getElementById('lz-slideshow-app');
    if (!root) return;

    const lang = window.LZ_CURRENT_LANG || "ja";
    let text = root.getAttribute('data-text-' + lang) || root.getAttribute('data-text') || "";
    const images = JSON.parse(root.getAttribute('data-images') || "[]");

    injectStyles();

    let html = '<div class="lz-ss-container">';
    // テキスト（初期状態は非表示）
    html += `<div class="lz-ss-text">${text.replace(/\\n/g, '<br>').replace(/\n/g, '<br>')}</div>`;

    images.forEach((img, i) => {
      html += `<div class="lz-ss-item" style="background-image: url('${img}'); animation-delay: ${i * 5}s;"></div>`;
    });

    html += '</div>';
    root.innerHTML = html;

    // --- 演出ロジック ---
    const textEl = root.querySelector('.lz-ss-text');
    if (!textEl) return;

    if (images.length > 0) {
      // 1枚目の画像の読み込みを監視
      const imgLoader = new Image();
      imgLoader.onload = () => {
        // 画像読み込み完了後、少しだけ間を置いてからテキストを表示させる
        setTimeout(() => {
          textEl.classList.add('is-visible');
        }, 600); // 0.6秒のタメを作る
      };
      // 万が一画像が読み込めなくても、一定時間後にテキストは表示する（保険）
      imgLoader.onerror = () => {
        setTimeout(() => textEl.classList.add('is-visible'), 2000);
      };
      imgLoader.src = images[0];
    } else {
      // 画像がない場合は即表示
      textEl.classList.add('is-visible');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();