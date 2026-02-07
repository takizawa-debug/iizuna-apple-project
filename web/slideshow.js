/**
 * slideshow.js - スライドショー・コンポーネント (干渉対策・多言語完全版)
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
        /* 強力な視認性：2重シャドウ */
        text-shadow: 0 0 25px rgba(0,0,0,0.9), 2px 2px 10px rgba(0,0,0,0.6);
        opacity: 0; transition: opacity .9s ease, transform .9s ease;
      }

      .lz-ss-text.is-show { opacity: 1; transform: translate(-50%, -50%); }

      @media (max-width: 768px) {
        .lz-ss-text { font-size: clamp(1.6rem, 5.2vw, 2.8rem); line-height: 1.5; width: 90vw; word-break: keep-all; }
      }
    `;
    document.head.appendChild(style);
  };

  // 2. 実行メインロジック
  const init = function() {
    const root = document.getElementById('lz-slideshow-app');
    if (!root) return;

    // 言語判定 (common.js 連携、未設定時は "ja")
    const lang = window.LZ_CURRENT_LANG || "ja";

    // 各属性を明示的に取得（干渉対策）
    const attrJa = root.getAttribute('data-text-ja');
    const attrEn = root.getAttribute('data-text-en');
    const attrZh = root.getAttribute('data-text-zh');
    const attrFallback = root.getAttribute('data-text'); // 予備

    let textContent = "";

    // 言語設定に応じたテキスト選択ロジック
    if (lang === "en") {
      textContent = attrEn || attrFallback || "";
    } else if (lang === "zh") {
      textContent = attrZh || attrFallback || "";
    } else {
      // 日本語の場合：data-text-ja を最優先し、予備として data-text を見る
      textContent = attrJa || attrFallback || "";
    }

    const imagesStr = root.getAttribute('data-images') || "[]";
    let images = [];
    try {
      images = JSON.parse(imagesStr);
    } catch(e) {
      console.error("Slideshow: Invalid images data", e);
    }

    injectStyles();

    // DOM構築
    let html = '<div class="lz-ss-container">';
    
    // テキスト表示（改行記号 \n を <br> に変換。null/undefined対策含む）
    const safeText = String(textContent || "").replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
    html += `<div class="lz-ss-text">${safeText}</div>`;

    // 画像スライド
    images.forEach((img, i) => {
      const delay = i * 5;
      html += `<div class="lz-ss-item" style="background-image: url('${img}'); animation-delay: ${delay}s;"></div>`;
    });

    html += '</div>';
    root.innerHTML = html;

    // 演出：少し待ってからテキストをふわっと出す
    setTimeout(() => {
      const txt = root.querySelector('.lz-ss-text');
      if (txt) txt.classList.add('is-show');
    }, 800);
  };

  // 起動（config.jsの読み込み待ちを考慮）
  var boot = function() {
    var timer = setInterval(function() {
      // common.js による初期化（LZ_CURRENT_LANGの設定）を待つ
      if (window.LZ_COMMON) {
        clearInterval(timer);
        init();
      }
    }, 50);
    // 5秒経っても起動しない場合は強制実行
    setTimeout(function() { clearInterval(timer); init(); }, 5000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();