/* web/slideshow.js - 強制表示＆最優先版 */
(function() {
  "use strict";

  const style = document.createElement('style');
  style.textContent = `
    .lz-slideshow-container { 
      position: relative !important; 
      width: 100% !important; 
      height: 60vh !important; 
      min-height: 400px !important;
      overflow: hidden !important; 
      background: #000 !important; /* 真っ黒にして画像がないか確認 */
      display: block !important;
      z-index: 100 !important;
    }
    
    .lz-slide-item { 
      position: absolute !important; 
      inset: 0 !important;
      width: 100% !important; 
      height: 100% !important; 
      background-size: cover !important; 
      background-position: center !important; 
      background-repeat: no-repeat !important;
      opacity: 0; /* 最初は透明 */
      z-index: 101 !important;
      display: block !important;
      animation: lz-fade-loop 25s infinite !important; 
    }

    /* 文字を一番手前に */
    .lz-slide-text {
      position: absolute !important; 
      top: 50% !important; 
      left: 50% !important; 
      transform: translate(-50%, -48%) !important;
      color: #fff !important; 
      z-index: 110 !important;
      font-size: clamp(1.8rem, 4.5vw, 3.2rem) !important; 
      font-weight: 700 !important; 
      text-align: center !important;
      text-shadow: 0 0 15px rgba(0,0,0,0.8) !important;
      width: 90% !important;
      opacity: 0;
      transition: all 0.8s ease !important;
      pointer-events: none !important;
    }
    .lz-slide-text.is-show { opacity: 1 !important; transform: translate(-50%, -50%) !important; }

    @keyframes lz-fade-loop {
      0%, 100% { opacity: 0; }
      5%, 20% { opacity: 1; }
      25% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  const startSlides = () => {
    const items = document.querySelectorAll('.lz-slide-item');
    const text = document.querySelector('.lz-slide-text');

    if (items.length === 0) return;

    // 各スライドにアニメーションの遅延を強制セット
    items.forEach((item, index) => {
      item.style.animationDelay = (index * 5) + "s";
      // デバッグ用：画像が読み込めているか確認
      console.log("lz-slide-item " + index + " initialized");
    });

    if(text) setTimeout(() => text.classList.add('is-show'), 800);
  };

  // ペライチの読み込み遅延に備えて3回実行する
  window.addEventListener('load', startSlides);
  setTimeout(startSlides, 500);
  setTimeout(startSlides, 2000); 
})();