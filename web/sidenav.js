/**
 * sidenav.js - サイド・ドットナビ コンポーネント (完全復元版)
 * 役割: ページ内ナビゲーション生成、スクロール監視、アクティブ判定
 */
(function() {
  "use strict";

  var C = window.LZ_COMMON;
  if (!C) return;

  /* ==========================================
     1. CSS復元 (style.css の定義を100%再現)
     ========================================== */
  var injectStyles = function() {
    if (document.getElementById('lz-sidenav-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-sidenav-styles';
    style.textContent = [
      '.lz-sidenav {',
      '  position: fixed; right: 24px; top: 50%; transform: translateY(-50%);',
      '  display: flex; flex-direction: column; gap: 18px; z-index: 8000;',
      '  background: rgba(255,255,255,0.7); padding: 20px 10px; border-radius: 40px;',
      '  backdrop-filter: blur(8px); box-shadow: 0 10px 30px rgba(0,0,0,0.05);',
      '  opacity: 0; transition: opacity 0.8s, transform 0.8s; pointer-events: none;',
      '}',
      /* スクロールされたら表示するトリガー */
      'body.is-scrolled .lz-sidenav { opacity: 1; pointer-events: auto; }',

      '.lz-sideitem {',
      '  position: relative; width: 10px; height: 10px; background: #ccc; border-radius: 50%;',
      '  cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);',
      '}',
      '.lz-sideitem:hover { transform: scale(1.5); background: var(--apple-red); }',
      '.lz-sideitem.is-active { background: var(--apple-red); transform: scale(1.6); box-shadow: 0 0 12px rgba(207, 58, 58, 0.5); }',

      /* ホバー時に左側に浮かび上がるラベル (data-label属性を使用) */
      '.lz-sideitem::before {',
      '  content: attr(data-label); position: absolute; right: 28px; top: 50%; transform: translateY(-50%);',
      '  background: var(--apple-red); color: #fff; padding: 6px 14px; border-radius: 20px;',
      '  font-size: 1.15rem; font-weight: 700; white-space: nowrap; opacity: 0; transition: 0.3s ease; pointer-events: none;',
      '  font-family: var(--font-base);',
      '}',
      '.lz-sideitem:hover::before { opacity: 1; right: 34px; }',

      '@media (max-width: 1024px) { .lz-sidenav { display: none; } }'
    ].join('\n');
    document.head.appendChild(style);
  };

  /* ==========================================
     2. ロジック: ナビゲーション構築
     ========================================== */
  function buildSideNav() {
    if (document.querySelector('.lz-sidenav')) return;

    // data-l2 属性を持つセクションをすべて取得
    var sections = Array.prototype.slice.call(document.querySelectorAll(".lz-section[data-l2]"));
    if (sections.length === 0) return;

    var sideNav = document.createElement('div');
    sideNav.className = 'lz-sidenav';
    document.body.appendChild(sideNav);

    // 各セクションに対応するドットを生成
    for (var i = 0; i < sections.length; i++) {
      (function(idx) {
        var sec = sections[idx];
        var label = sec.getAttribute('data-l2');
        if (!label) return;

        var item = document.createElement('div');
        item.className = 'lz-sideitem';
        item.setAttribute('data-label', label);
        
        // クリック時にスムーズスクロール (ヘッダー高さを考慮)
        item.onclick = function() {
          var header = document.querySelector(".pera1-header, .lz-hdr");
          var offset = (header ? header.offsetHeight : 68) + 20;
          var y = sec.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: y, behavior: "smooth" });
        };
        
        sideNav.appendChild(item);
      })(i);
    }

    /* ==========================================
       3. スクロール監視 (アクティブ状態の切り替え)
       ========================================== */
    var updateActive = function() {
      var scrollY = window.scrollY;
      var currentLabel = "";

      // 一定以上スクロールされたらナビを表示
      document.body.classList.toggle('is-scrolled', scrollY > 200);

      for (var j = 0; j < sections.length; j++) {
        if (scrollY >= (sections[j].offsetTop - 250)) {
          currentLabel = sections[j].getAttribute('data-label') || sections[j].getAttribute('data-l2');
        }
      }

      var dotItems = sideNav.querySelectorAll('.lz-sideitem');
      for (var k = 0; k < dotItems.length; k++) {
        dotItems[k].classList.toggle('is-active', dotItems[k].getAttribute('data-label') === currentLabel);
      }
    };

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }

  /* ==========================================
     4. 起動シーケンス (section.js の完了を待つ)
     ========================================== */
  var bootNav = function() {
    injectStyles();
    
    // 全ての .lz-section が描画（lz-ready）されるのを MutationObserver で監視
    var observer = new MutationObserver(function() {
      var allSections = document.querySelectorAll('.lz-section[data-l2]');
      var readySections = document.querySelectorAll('.lz-section[data-l2].lz-ready');
      
      // 全てのセクションが準備完了、または少なくとも1つ以上の準備ができたら構築開始
      if (allSections.length > 0 && readySections.length >= allSections.length) {
        buildSideNav();
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // バックアップ用タイムアウト起動
    setTimeout(buildSideNav, 4000);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootNav);
  } else {
    bootNav();
  }

})();