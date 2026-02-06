/**
 * section.js - 記事一覧コンポーネント (安定版)
 * 役割: 記事カード生成、チラ見せカルーセル、画像なし対応、自動再生
 */
(function() {
  "use strict";

  // 1. common.js の生存確認と依存取得
  var C = window.LZ_COMMON;
  if (!C) {
    console.error("section.js: LZ_COMMON is missing. Check load order.");
    return;
  }

  // 2. CSSの注入 (JS完結型)
  var injectStyles = function() {
    if (document.getElementById('lz-section-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-section-styles';
    style.textContent = [
      /* セクション全体：初期は見える状態にするが、コンテンツが空なら高さを持たない */
      '.lz-section { margin: 48px 0; position: relative; }',
      '.lz-section.lz-ready { visibility: visible; }',

      /* L2タイトル（赤帯） */
      '.lz-head { margin: 0 0 16px; position: relative; z-index: 10; }',
      '.lz-titlewrap { display: block; width: 100%; background: var(--apple-red); color: #fff; border-radius: var(--radius); padding: 14px 16px; box-sizing: border-box; }',
      '.lz-title { margin: 0; font-weight: var(--fw-l2); font-size: var(--fz-l2); letter-spacing: .02em; white-space: nowrap; }',

      /* L3見出し */
      '.lz-l3head { display: flex; align-items: center; gap: .55em; margin: 18px 2px 10px; }',
      '.lz-l3bar { width: 10px; height: 1.4em; background: var(--apple-brown); border-radius: 3px; flex: 0 0 auto; }',
      '.lz-l3title { margin: 0; font-weight: 600; font-size: var(--fz-l3); color: var(--apple-brown); line-height: 1.25; }',

      /* カルーセル構造（チラ見せ設計） */
      '.lz-track-outer { position: relative; width: 100%; overflow: hidden; }',
      '.lz-track-outer::after {',
      '  content: ""; position: absolute; top: 0; right: 0; width: 60px; height: 100%;',
      '  background: linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.95));',
      '  pointer-events: none; z-index: 2;',
      '}',
      '.lz-track {',
      '  display: grid; grid-auto-flow: column;',
      '  grid-auto-columns: var(--cw, calc((100% - 32px) / 3.2));',
      '  gap: 18px; overflow-x: auto; padding: 12px 12px 32px;',
      '  scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none;',
      '}',
      '.lz-track::-webkit-scrollbar { display: none; }',

      '@media (max-width: 768px) {',
      '  .lz-track { grid-auto-columns: calc(100% / 1.22); gap: 14px; padding-left: 16px; padding-right: 40px; }',
      '}',

      /* カード & ホバー演出 */
      '.lz-card { border: 1px solid var(--border); border-radius: var(--card-radius); overflow: hidden; scroll-snap-align: start; cursor: pointer; background: #fff; transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.6s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.4s ease; will-change: transform; }',
      '.lz-card:hover { transform: translateY(-8px); border-color: var(--apple-red); box-shadow: 0 20px 45px rgba(207, 58, 58, 0.12); }',
      '.lz-media { position: relative; background: #fdfaf8; overflow: hidden; }',
      '.lz-media::before { content: ""; display: block; padding-top: var(--ratio, 56.25%); }',
      '.lz-media > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1); }',
      '.lz-card:hover .lz-media > img { transform: scale(1.08); }',
      '.lz-media.is-empty::after { content: ""; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(40%, 180px); aspect-ratio: 1/1; background-image: url("https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ca4e300-96ba-013e-3700-0a58a9feac02/%E3%82%8A%E3%82%93%E3%81%93%E3%82%99%E3%83%AD%E3%82%B3%E3%82%99_%E8%B5%A4.png"); background-position: center; background-repeat: no-repeat; background-size: contain; opacity: 0.35; }',
      '.lz-body { padding: 14px; display: grid; gap: 6px; }',
      '.lz-title-sm { margin: 0; font-weight: var(--fw-card-title); font-size: var(--fz-card-title); color: var(--apple-brown); line-height: 1.4; }',
      '.lz-lead { font-weight: var(--fw-lead); font-size: var(--fz-lead); line-height: 1.6; color: var(--ink-light); min-height: 2.2em; }',

      /* ローディング */
      '.lz-loading { display: flex; align-items: center; justify-content: center; height: var(--loading-h); border: 1px dashed var(--border); border-radius: 12px; background: #fffaf8; }'
    ].join('\n');
    document.head.appendChild(style);
  };

  /* ==========================================
     3. 描画ロジック
     ========================================== */
  function cardHTML(it, pad, groupKey) {
    var title = it.title || "(無題)";
    var hasMain = !!(it.mainImage && it.mainImage.trim() !== "");
    return [
      '<article class="lz-card" id="' + C.esc(title) + '" data-id="' + C.esc(title) + '" data-title="' + C.esc(title) + '"',
      '  data-lead="' + C.esc(it.lead || "") + '" data-body="' + C.esc(it.body || "") + '" data-main="' + C.esc(it.mainImage || "") + '"',
      '  data-sub=\'' + C.esc(JSON.stringify(it.subImages || [])) + '\' data-sns=\'' + C.esc(JSON.stringify(it.sns || {})) + '\'',
      '  data-address="' + C.esc(it.address || "") + '" data-hours-combined="' + C.esc(it.hoursCombined || "") + '"',
      '  data-form="' + C.esc(it.form || "") + '" data-tel="' + C.esc(it.tel || "") + '" data-home="' + C.esc(it.home || "") + '" data-group="' + C.esc(groupKey) + '">',
      '  <div class="lz-media ' + (hasMain ? "" : "is-empty") + '" style="--ratio:' + pad + '">',
      hasMain ? '    <img src="' + C.esc(it.mainImage) + '" loading="lazy" onerror="this.parentElement.classList.add(\'is-empty\'); this.remove();">' : '',
      '  </div>',
      '  <div class="lz-body"><h3 class="lz-title-sm">' + C.esc(title) + '</h3><div class="lz-lead">' + C.esc(it.lead || "") + '</div></div>',
      '</article>'
    ].join('');
  }

  window.renderSection = async function(root) {
    if (root.dataset.lzDone === '1') return;
    var config = window.LZ_CONFIG;
    var l1 = root.dataset.l1 || config.L1;
    var l2 = root.dataset.l2 || "";
    var heading = root.dataset.heading || l2;
    var cardWidth = root.dataset.cardWidth || "33.33%";
    var cardWidthSm = root.dataset.cardWidthSm || "80%";
    var imageRatio = root.dataset.imageRatio || "16:9";

    // CSS変数の適用
    var mql = window.matchMedia("(max-width:768px)");
    root.style.setProperty("--cw", mql.matches ? cardWidthSm : cardWidth);
    root.style.setProperty("--ratio", C.ratio(imageRatio));

    // スケルトン表示
    root.innerHTML = '<div class="lz-head"><div class="lz-titlewrap"><h2 class="lz-title">' + C.esc(heading) + '</h2></div></div><div class="lz-groupwrap"><div class="lz-loading">記事読み込み中...</div></div>';
    
    try {
      var json = await C.NET.json(config.ENDPOINT + "?l1=" + encodeURIComponent(l1) + "&l2=" + encodeURIComponent(l2));
      if (!json || !json.ok) throw new Error("no data");

      var groups = {};
      json.items.forEach(function(it) {
        var k = (it.l3 || "").trim();
        if (!groups[k]) groups[k] = [];
        groups[k].push(it);
      });

      var html = "";
      var pad = C.ratio(imageRatio);
      Object.keys(groups).forEach(function(key) {
        if (key) html += '<div class="lz-l3head"><span class="lz-l3bar"></span><h3 class="lz-l3title">' + C.esc(key) + '</h3></div>';
        html += '<div class="lz-track-outer"><div class="lz-track" data-group="' + C.esc(key) + '">' + groups[key].map(function(it){ return cardHTML(it, pad, key); }).join("") + '</div></div>';
      });

      root.querySelector(".lz-groupwrap").innerHTML = html;
      root.classList.add("lz-ready");
      root.dataset.lzDone = '1';

      // モーダル連携（クリックイベント）
      root.addEventListener("click", function(e) {
        var card = e.target.closest(".lz-card");
        if (card && window.lzModal) window.lzModal.open(card);
      });

    } catch(e) {
      root.querySelector(".lz-groupwrap").innerHTML = '<div style="padding:20px; color:#999;">読み込みに失敗しました</div>';
    }
  };

  // 4. 初期化
  var boot = function() {
    injectStyles();
    // LZ_CONFIGが利用可能になるのを待つ
    var waitConfig = setInterval(function() {
      if (window.LZ_CONFIG) {
        clearInterval(waitConfig);
        document.querySelectorAll(".lz-container, .lz-section[data-l2]").forEach(function(el) {
          window.renderSection(el);
        });
      }
    }, 50);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

})();