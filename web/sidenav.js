/**
 * sidenav.js - サイド・ドットナビ コンポーネント (頑丈版)
 * 役割: ページ内ナビゲーション生成、スクロール監視、アクティブ判定
 */
(function() {
  "use strict";

  // 1. 依存関係のチェック
  var C = window.LZ_COMMON;
  if (!C) return;

  /* ==========================================
     2. CSSの注入 (JS完結・レスポンシブ)
     ========================================== */
  var injectNavStyles = function() {
    if (document.getElementById('lz-sidenav-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-sidenav-styles';
    style.textContent = [
      '.lz-sidenav {',
      '  position: fixed; right: 12px; top: 50%; transform: translateY(-50%);',
      '  display: flex; flex-direction: column; gap: 14px; z-index: 8000;',
      '  background: rgba(255,255,255,0.3); padding: 16px 8px; border-radius: 40px;',
      '  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);',
      '  opacity: 0; transition: opacity 0.8s, transform 0.8s; pointer-events: none;',
      '}',
      'body.is-scrolled .lz-sidenav { opacity: 1; pointer-events: auto; }',

      /* ドット基本設定 */
      '.lz-sideitem {',
      '  position: relative; width: 8px; height: 8px; background: #ccc; border-radius: 50%;',
      '  cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);',
      '}',
      '.lz-sideitem.is-active { background: var(--apple-red); transform: scale(1.4); box-shadow: 0 0 10px rgba(207, 58, 58, 0.4); }',

      /* PC版のラベル表示 (1025px以上) */
      '@media (min-width: 1025px) {',
      '  .lz-sidenav { right: 24px; padding: 20px 10px; background: rgba(255,255,255,0.7); }',
      '  .lz-sideitem { width: 10px; height: 10px; }',
      '  .lz-sideitem:hover { transform: scale(1.5); background: var(--apple-red); }',
      '  .lz-sideitem::before {',
      '    content: attr(data-label); position: absolute; right: 28px; top: 50%; transform: translateY(-50%);',
      '    background: var(--apple-red); color: #fff; padding: 6px 14px; border-radius: 20px;',
      '    font-size: 1.15rem; font-weight: 700; white-space: nowrap; opacity: 0;',
      '    transition: all 0.3s ease; pointer-events: none;',
      '  }',
      '  .lz-sideitem:hover::before { opacity: 1; right: 34px; }',
      '}',

      /* スマホ版の調整 */
      '@media (max-width: 1024px) {',
      '  .lz-sidenav { padding: 20px 12px; right: 8px; }',
      '  .lz-sideitem { margin: 6px 0; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  };

  /* ==========================================
     3. ナビゲーション構築ロジック
     ========================================== */
  function buildSideNav() {
    if (document.querySelector('.lz-sidenav')) return;

    // 描画済みのセクションを取得
    var containers = document.querySelectorAll(".lz-section.lz-ready");
    if (containers.length === 0) return;

    var sideNav = document.createElement('div');
    sideNav.className = 'lz-sidenav';
    document.body.appendChild(sideNav);

    for (var i = 0; i < containers.length; i++) {
      (function(index) {
        var con = containers[index].parentElement; // .lz-container または親要素
        var label = con.dataset.l2;
        if (!label) return;

        var item = document.createElement('div');
        item.className = 'lz-sideitem';
        item.setAttribute('data-label', label);
        
        item.onclick = function() {
          var header = document.querySelector(".pera1-header, .lz-hdr");
          var offset = (header ? header.offsetHeight : 68) + 20;
          var rect = containers[index].getBoundingClientRect();
          var targetY = rect.top + window.pageYOffset - offset;
          window.scrollTo({ top: targetY, behavior: "smooth" });
        };
        
        sideNav.appendChild(item);
      })(i);
    }

    /* ==========================================
       4. スクロール監視
       ========================================== */
    var updateNavigation = function() {
      var scrollPos = window.scrollY;
      var currentLabel = "";

      // 出現制御
      document.body.classList.toggle('is-scrolled', scrollPos > 200);

      for (var j = 0; j < containers.length; j++) {
        var con = containers[j].parentElement;
        if (scrollPos >= (con.offsetTop - 350)) {
          currentLabel = con.dataset.l2;
        }
      }

      var items = sideNav.querySelectorAll('.lz-sideitem');
      for (var k = 0; k < items.length; k++) {
        var it = items[k];
        if (it.getAttribute('data-label') === currentLabel) {
          it.classList.add('is-active');
        } else {
          it.classList.remove('is-active');
        }
      }
    };

    window.addEventListener('scroll', updateNavigation, { passive: true });
    updateNavigation();
  }

  /* ==========================================
     5. 起動処理 (MutationObserver)
     ========================================== */
  var bootNav = function() {
    injectNavStyles();
    
    // 記事が描画されるのを監視
    var observer = new MutationObserver(function() {
      var readySections = document.querySelectorAll('.lz-section.lz-ready');
      var totalContainers = document.querySelectorAll('.lz-container, .lz-section[data-l2]');
      
      if (readySections.length > 0 && readySections.length >= totalContainers.length) {
        buildSideNav();
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 念のためのバックアップ起動
    setTimeout(buildSideNav, 5000);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootNav);
  else bootNav();

})();