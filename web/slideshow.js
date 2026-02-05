/* web/slideshow.js */
(function() {
  "use strict";

  // 1. CSSの自動注入
  const style = document.createElement('style');
  style.textContent = `
    .slideshow-container { 
      position: relative; 
      width: 100%; 
      height: 60vh; 
      overflow: hidden; 
      background: #eee; 
    }
    .slideshow { 
      position: absolute; 
      inset: 0;
      width: 100%; 
      height: 100%; 
      background-size: cover; 
      background-position: center; 
      opacity: 0; 
      animation: lz-fade-anim 25s infinite; 
    }

    /* 重要：slideshow-textが1番目の要素なので、
       画像は2番目（nth-child(2)）から設定します
    */
    .slideshow:nth-child(2) { animation-delay: 0s; }
    .slideshow:nth-child(3) { animation-delay: 5s; }
    .slideshow:nth-child(4) { animation-delay: 10s; }
    .slideshow:nth-child(5) { animation-delay: 15s; }
    .slideshow:nth-child(6) { animation-delay: 20s; }

    @keyframes lz-fade-anim {
      0% { opacity: 0; }
      5% { opacity: 1; }
      20% { opacity: 1; }
      25% { opacity: 0; }
      100% { opacity: 0; }
    }

    .slideshow-text {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -48%);
      color: #fff; font-family: system-ui,-apple-system,sans-serif;
      font-size: clamp(1.8rem, 4.5vw, 3.2rem); font-weight: 700; text-align: center;
      line-height: 1.4; text-shadow: 0 0 10px rgba(0,0,0,0.4); z-index: 10;
      width: 100%; max-width: 100%; padding: 0 4vw; box-sizing: border-box;
      opacity: 0; transition: opacity .9s ease, transform .9s ease; will-change: opacity, transform;
      pointer-events: none;
    }
    .slideshow-text.is-show { opacity: 1; transform: translate(-50%, -50%); }

    @media (max-width: 768px) {
      .slideshow-text { font-size: clamp(2rem, 5.2vw, 3.2rem); line-height: 1.5; width: 90vw; padding: 0 2vw; word-break: keep-all; }
    }
  `;
  document.head.appendChild(style);

  // 2. 文字のフェードイン処理
  const initSlideshow = () => {
    const el = document.querySelector('.slideshow-text');
    if(!el) return;
    // 少し待ってから文字を表示
    setTimeout(() => el.classList.add('is-show'), 700);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlideshow);
  } else {
    initSlideshow();
  }
})();