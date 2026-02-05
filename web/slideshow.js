/* web/slideshow.js - 干渉対策版 */
(function() {
  "use strict";

  const style = document.createElement('style');
  style.textContent = `
    .slideshow-container { 
      position: relative; 
      width: 100%; 
      height: 60vh; 
      min-height: 300px;
      overflow: hidden; 
      background: #000; /* 背景を黒にしておくと画像読み込み待ちが目立たない */
    }
    
    /* クラス名を lz-slide-item に変更して干渉を回避 */
    .lz-slide-item { 
      position: absolute; 
      inset: 0;
      width: 100%; 
      height: 100%; 
      background-size: cover; 
      background-position: center; 
      opacity: 0; 
      /* アニメーション設定 */
      animation: lz-fade-anim 25s infinite !important; 
    }

    /* 2番目の要素（最初の画像）からアニメーションをずらす */
    .lz-slide-item:nth-child(2) { animation-delay: 0s !important; }
    .lz-slide-item:nth-child(3) { animation-delay: 5s !important; }
    .lz-slide-item:nth-child(4) { animation-delay: 10s !important; }
    .lz-slide-item:nth-child(5) { animation-delay: 15s !important; }
    .lz-slide-item:nth-child(6) { animation-delay: 20s !important; }

    @keyframes lz-fade-anim {
      0% { opacity: 0; }
      5% { opacity: 1; }
      20% { opacity: 1; }
      25% { opacity: 0; }
      100% { opacity: 0; }
    }

    .slideshow-text {
      position: absolute; top: 50%; left: 50%; 
      transform: translate(-50%, -48%);
      color: #fff; font-family: system-ui,-apple-system,sans-serif;
      font-size: clamp(1.8rem, 4.5vw, 3.2rem); font-weight: 700; text-align: center;
      line-height: 1.4; text-shadow: 0 0 15px rgba(0,0,0,0.6); z-index: 10;
      width: 100%; max-width: 100%; padding: 0 4vw; box-sizing: border-box;
      opacity: 0; transition: opacity .9s ease, transform .9s ease; will-change: opacity, transform;
      pointer-events: none;
    }
    .slideshow-text.is-show { opacity: 1; transform: translate(-50%, -50%); }

    @media (max-width: 768px) {
      .slideshow-text { font-size: clamp(2rem, 5.2vw, 3.2rem); line-height: 1.5; width: 90vw; }
    }
  `;
  document.head.appendChild(style);

  const initSlides = () => {
    const el = document.querySelector('.slideshow-text');
    if(el) setTimeout(() => el.classList.add('is-show'), 800);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlides);
  } else {
    initSlides();
  }
})();