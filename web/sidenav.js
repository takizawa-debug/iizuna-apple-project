/**
 * sidenav.js - サイド・ドットナビ コンポーネント
 * 役割: ページ内ナビゲーションの生成とスクロール監視
 */
(function() {
  "use strict";

  /* ==========================================
     1. CSSの注入 (サイドナビ専用デザイン)
     ========================================== */
  const injectNavStyles = () => {
    const style = document.createElement('style');
    style.id = 'lz-sidenav-styles';
    style.textContent = `
      /* ナビゲーション・コンテナ */
      .lz-sidenav {
        position: fixed; right: 12px; top: 50%; transform: translateY(-50%);
        display: flex; flex-direction: column; gap: 14px; z-index: 8000;
        background: rgba(255,255,255,0.4); /* 背景に溶け込む透明感 */
        padding: 16px 8px; border-radius: 40px;
        backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
        opacity: 0; transition: opacity 0.8s, transform 0.8s; pointer-events: none;
      }
      /* ヘッダーが表示されたら出現（共通ルールとの連動） */
      .lz-hdr.is-visible ~ .lz-sidenav, 
      body.is-scrolled .lz-sidenav { opacity: 1; pointer-events: auto; }

      /* ドット（基本：スマホサイズ） */
      .lz-sideitem {
        position: relative; width: 8px; height: 8px; background: #ddd; border-radius: 50%;
        cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      /* アクティブ（現在地）の演出 */
      .lz-sideitem.is-active { background: var(--apple-red); transform: scale(1.4); box-shadow: 0 0 10px rgba(207, 58, 58, 0.3); }

      /* PC版の最適化 */
      @media (min-width: 1025px) {
        .lz-sidenav { right: 24px; padding: 20px 10px; background: rgba(255,255,255,0.7); }
        .lz-sideitem { width: 10px; height: 10px; }
        .lz-sideitem:hover { transform: scale(1.5); background: var(--apple-red); }

        /* ホバー時にセクション名を表示（PCのみ） */
        .lz-sideitem::before {
          content: attr(data-label); position: absolute; right: 28px; top: 50%; transform: translateY(-50%);
          background: var(--apple-red); color: #fff; padding: 6px 14px; border-radius: 20px;
          font-size: 1.15rem; font-weight: 700; white-space: nowrap; opacity: 0; 
          transition: all 0.3s ease; pointer-events: none;
        }
        .lz-sideitem:hover::before { opacity: 1; right: 34px; }
      }

      /* スマホ版：タップ領域の確保 */
      @media (max-width: 1024px) {
        .lz-sidenav { padding: 20px 12px; }
        .lz-sideitem { margin: 6px 0; }
      }
    `;
    document.head.appendChild(style);
  };

  /* ==========================================
     2. ナビゲーション構築ロジック
     ========================================== */
  function buildSideNav() {
    // 既に存在する場合は作成しない
    if (document.querySelector('.lz-sidenav')) return;

    const sections = Array.from(document.querySelectorAll(".lz-container"));
    if (!sections.length) return;

    const sideNav = document.createElement('div');
    sideNav.className = 'lz-sidenav';
    document.body.appendChild(sideNav);

    sections.forEach(con => {
      const label = con.dataset.l2;
      if (!label) return;

      const item = document.createElement('div');
      item.className = 'lz-sideitem';
      item.dataset.label = label;
      
      // クリックで該当セクションへジャンプ
      item.onclick = () => {
        const target = con.querySelector('.lz-section');
        if (!target) return;
        const offset = (document.querySelector(".lz-hdr")?.offsetHeight || 68) + 20;
        const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: y, behavior: "smooth" });
      };
      
      sideNav.appendChild(item);
    });

    // スクロール監視：現在地のドットを光らせる
    const updateActive = () => {
      let currentLabel = "";
      sections.forEach(con => {
        const sec = con.querySelector('.lz-section');
        if (sec && window.scrollY >= (con.offsetTop - 300)) {
          currentLabel = con.dataset.l2;
        }
      });

      sideNav.querySelectorAll('.lz-sideitem').forEach(item => {
        item.classList.toggle('is-active', item.dataset.label === currentLabel);
      });
    };

    window.addEventListener('scroll', updateActive, { passive: true });
    // 初回実行
    setTimeout(updateActive, 500); 
  }

  /* ==========================================
     3. 起動処理
     ========================================== */
  const boot = () => {
    injectNavStyles();
    // コンテナが動的に生成されるのを待つために少し遅延
    setTimeout(buildSideNav, 1000);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

})();