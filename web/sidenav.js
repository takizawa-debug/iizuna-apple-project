/**
 * sidenav.js - サイド・ドットナビ コンポーネント (修正版)
 * 役割: 全デバイス対応のページ内ナビゲーション生成、スクロール監視
 */
(function() {
  "use strict";

  // common.js が読み込まれているか確認
  if (!window.LZ_COMMON) return;

  /* ==========================================
     1. CSSの注入 (サイドナビ専用デザイン)
     ========================================== */
  const injectNavStyles = () => {
    const style = document.createElement('style');
    style.id = 'lz-sidenav-styles';
    style.textContent = `
      /* ナビゲーション本体 */
      .lz-sidenav {
        position: fixed; right: 12px; top: 50%; transform: translateY(-50%);
        display: flex; flex-direction: column; gap: 14px; z-index: 8000;
        background: rgba(255,255,255,0.3); /* 背景に溶け込む透明度 */
        padding: 16px 8px; border-radius: 40px;
        backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        opacity: 0; transition: opacity 0.8s, transform 0.8s; pointer-events: none;
      }
      /* 表示トリガー：少しでもスクロールされたら出現 */
      body.is-scrolled .lz-sidenav,
      .lz-sidenav.is-visible { opacity: 1; pointer-events: auto; }

      /* ドット（基本：スマホ・タブレット共通） */
      .lz-sideitem {
        position: relative; width: 8px; height: 8px; background: #ccc; border-radius: 50%;
        cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      /* アクティブ状態：りんごの赤 */
      .lz-sideitem.is-active { background: var(--apple-red); transform: scale(1.4); box-shadow: 0 0 10px rgba(207, 58, 58, 0.4); }

      /* PC版の高度な装飾 (1025px以上) */
      @media (min-width: 1025px) {
        .lz-sidenav { right: 24px; padding: 20px 10px; background: rgba(255,255,255,0.7); }
        .lz-sideitem { width: 10px; height: 10px; }
        .lz-sideitem:hover { transform: scale(1.5); background: var(--apple-red); }

        /* ホバー時にセクション名をフワッと表示 */
        .lz-sideitem::before {
          content: attr(data-label); position: absolute; right: 28px; top: 50%; transform: translateY(-50%);
          background: var(--apple-red); color: #fff; padding: 6px 14px; border-radius: 20px;
          font-size: 1.15rem; font-weight: 700; white-space: nowrap; opacity: 0; 
          transition: all 0.3s ease; pointer-events: none;
        }
        .lz-sideitem:hover::before { opacity: 1; right: 34px; }
      }

      /* スマホ版：タップしやすさを向上 */
      @media (max-width: 1024px) {
        .lz-sidenav { padding: 20px 12px; right: 8px; }
        .lz-sideitem { margin: 6px 0; }
      }
    `;
    document.head.appendChild(style);
  };

  /* ==========================================
     2. ロジック: ナビゲーション構築
     ========================================== */
  function buildSideNav() {
    // 重複生成防止
    if (document.querySelector('.lz-sidenav')) return;

    const containers = Array.from(document.querySelectorAll(".lz-container"));
    if (!containers.length) return;

    const sideNav = document.createElement('div');
    sideNav.className = 'lz-sidenav';
    document.body.appendChild(sideNav);

    containers.forEach(con => {
      const label = con.dataset.l2;
      if (!label) return;

      const item = document.createElement('div');
      item.className = 'lz-sideitem';
      item.dataset.label = label;
      
      // クリックイベント：対象セクションの中央へスムーズスクロール
      item.onclick = () => {
        const target = con.querySelector('.lz-section');
        if (!target) return;
        const offset = (document.querySelector(".lz-hdr")?.offsetHeight || 68) + 20;
        const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: y, behavior: "smooth" });
      };
      
      sideNav.appendChild(item);
    });

    /* ==========================================
       3. スクロール監視 (アクティブ判定)
       ========================================== */
    const updateNavigation = () => {
      const scrollPos = window.scrollY;
      let currentLabel = "";

      // スクロール状態をbodyに付与（CSSでの表示切り替え用）
      document.body.classList.toggle('is-scrolled', scrollPos > 100);
      if (scrollPos > 100) sideNav.classList.add('is-visible');

      containers.forEach(con => {
        const sec = con.querySelector('.lz-section');
        if (sec && scrollPos >= (con.offsetTop - 350)) {
          currentLabel = con.dataset.l2;
        }
      });

      sideNav.querySelectorAll('.lz-sideitem').forEach(item => {
        item.classList.toggle('is-active', item.dataset.label === currentLabel);
      });
    };

    window.addEventListener('scroll', updateNavigation, { passive: true });
    updateNavigation(); // 初回実行
  }

  /* ==========================================
     4. 起動シーケンス
     ========================================== */
  const bootNav = () => {
    injectNavStyles();
    
    // section.js による記事描画（lz-ready）を待ってから構築
    const observer = new MutationObserver((mutations) => {
      const allReady = Array.from(document.querySelectorAll('.lz-container'))
                            .every(c => c.querySelector('.lz-ready'));
      if (allReady) {
        buildSideNav();
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 万が一のためのタイムアウト起動
    setTimeout(buildSideNav, 3000);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootNav);
  else bootNav();

})();