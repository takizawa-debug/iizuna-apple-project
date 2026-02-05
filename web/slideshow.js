/* web/slideshow.js - 強制上書き・干渉回避版 */
(function() {
  "use strict";

  const style = document.createElement('style');
  style.textContent = `
    /* コンテナ：高さを死守し、背景を黒にしておく */
    .lz-slideshow-container { 
      position: relative !important; 
      width: 100% !important; 
      height: 60vh !important; 
      min-height: 350px !important;
      overflow: hidden !important; 
      background: #000 !important; 
      display: block !important;
      z-index: 1 !important;
    }
    
    /* スライド画像：既存の .fade 等と干渉しないクラス名 */
    .lz-slide-item { 
      position: absolute !important; 
      inset: 0 !important;
      width: 100% !important; 
      height: 100% !important; 
      background-size: cover !important; 
      background-position: center !important; 
      background-repeat: no-repeat !important;
      opacity: 0 !important; 
      z-index: 2 !important;
      display: block !important;
      /* アニメーション名はlz-独自にする */
      animation: lz-fade-loop 25s infinite !important; 
    }

    /* 順番にアニメーションをずらす（HTMLの並び順で計算） */
    /* 1番目の要素はテキストなので、画像は2枚目(nth-child(2))から */
    .lz-slide-item:nth-child(2) { animation-delay: 0s !important; }
    .lz-slide-item:nth-child(3) { animation-delay: 5s !important; }
    .lz-slide-item:nth-child(4) { animation-delay: 10s !important; }
    .lz-slide-item:nth-child(5) { animation-delay: 15s !important; }
    .lz-slide-item:nth-child(6) { animation-delay: 20s !important; }

    @keyframes lz-fade-loop {
      0% { opacity: 0; }
      5% { opacity: 1; }
      20% { opacity: 1; }
      25% { opacity: 0; }
      100% { opacity: 0; }
    }

    /* テキスト：画像より前面(z-index: 10)に配置 */
    .lz-slide-text {
      position: absolute !important; 
      top: 50% !important; 
      left: 50% !important; 
      transform: translate(-50%, -48%) !important;
      color: #fff !important; 
      font-family: system-ui,-apple-system,"Segoe UI",Roboto,sans-serif !important;
      font-size: clamp(1.8rem, 4.5vw, 3.2rem) !important; 
      font-weight: 700 !important; 
      text-align: center !important;
      line-height: 1.4 !important; 
      text-shadow: 0 0 15px rgba(0,0,0,0.6) !important; 
      z-index: 10 !important;
      width: 90% !important; 
      max-width: 1000px !important;
      opacity: 0 !important; 
      transition: opacity .9s ease, transform .9s ease !important;
      pointer-events: none !important; /* 文字がクリックを邪魔しないように */
    }
    .lz-slide-text.is-show { 
      opacity: 1 !important; 
      transform: translate(-50%, -50%) !important; 
    }

    @media (max-width: 768px) {
      .lz-slideshow-container { height: 55vh !important; }
      .lz-slide-text { font-size: 1.8rem !important; }
    }
  `;
  document.head.appendChild(style);

  // 文字の表示処理
  const initSlides = () => {
    const el = document.querySelector('.lz-slide-text');
    if(el) setTimeout(() => el.classList.add('is-show'), 800);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlides);
  } else {
    initSlides();
  }
})();