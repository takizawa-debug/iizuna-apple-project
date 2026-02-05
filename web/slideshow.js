/* web/slideshow.js - JS強制スタイル適用版 */
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
      background: #222 !important;
      display: block !important;
    }
    .lz-slide-item { 
      position: absolute !important; 
      inset: 0 !important;
      background-size: cover !important; 
      background-position: center !important; 
      opacity: 0; 
      z-index: 1;
      animation: lz-fade-loop 25s infinite !important; 
    }
    @keyframes lz-fade-loop {
      0%, 100% { opacity: 0; }
      5%, 20% { opacity: 1; }
      25% { opacity: 0; }
    }
    .lz-slide-text {
      position: absolute !important; top: 50% !important; left: 50% !important;
      transform: translate(-50%, -48%) !important;
      color: #fff !important; z-index: 10 !important;
      font-size: clamp(1.8rem, 4.5vw, 3.2rem) !important; font-weight: 700 !important;
      text-align: center !important; width: 90% !important;
      text-shadow: 0 0 15px rgba(0,0,0,0.8) !important;
      opacity: 0; transition: all 0.8s ease;
    }
    .lz-slide-text.is-show { opacity: 1 !important; transform: translate(-50%, -50%) !important; }
  `;
  document.head.appendChild(style);

  const startSlides = () => {
    const container = document.querySelector('.lz-slideshow-container');
    const items = document.querySelectorAll('.lz-slide-item');
    const text = document.querySelector('.lz-slide-text');

    if(!container) {
      console.error("Slideshow: Container not found");
      return;
    }

    // JSで直接、アニメーションの遅延時間を書き込む（CSSのnth-childに頼らない）
    items.forEach((item, index) => {
      item.style.animationDelay = (index * 5) + "s";
      console.log(`Slide ${index} initialized with ${item.style.backgroundImage}`);
    });

    if(text) setTimeout(() => text.classList.add('is-show'), 800);
  };

  // ページ読み込み完了時、および少し遅れて実行（ペライチのレンダリング対策）
  window.addEventListener('load', startSlides);
  setTimeout(startSlides, 1500); 
})();