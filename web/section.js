/**
 * section.js - 記事一覧コンポーネント (多言語対応・Manual Infinity Edition)
 */
(function () {
  "use strict";

  var C = window.LZ_COMMON;
  if (!C) return;

  /* ==========================================
     1. CSS (既存デザインを完全維持)
     ========================================== */
  var injectStyles = function () {
    if (document.getElementById('lz-section-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-section-styles';
    style.textContent = [
      '.lz-section { margin: 20px 0; position: relative; visibility: visible; min-height: 400px; }',
      '.lz-section.lz-ready { min-height: auto; }',
      '.lz-head { margin: 0 0 20px; position: relative; z-index: 10; }',
      '.lz-titlewrap { position: relative; display: inline-flex; align-items: center; padding: 12px 36px 12px 20px; box-sizing: border-box; background: linear-gradient(135deg, rgba(207, 58, 58, 0.04) 0%, rgba(255, 255, 255, 0.9) 100%); border-left: 5px solid var(--apple-red); border-radius: 0 40px 40px 0; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }',
      '.lz-title { margin: 0; font-weight: 600; font-size: 2.6rem; color: var(--apple-brown); letter-spacing: .08em; }',
      '.lz-l3head { display: flex; align-items: center; gap: .55em; margin: 24px 2px 10px; }',
      '.lz-l3bar { width: 10px; height: 1.4em; background: var(--apple-brown); border-radius: 3px; flex: 0 0 auto; }',
      '.lz-l3title { margin: 0; font-weight: 600; font-size: var(--fz-l3, 1.85rem); color: var(--apple-brown); line-height: 1.25; }',
      '.lz-loading { position: relative; display: flex; align-items: center; justify-content: center; height: 360px; border: none; background: transparent; }',
      '.lz-loading-inner { display: flex; flex-direction: column; align-items: center; gap: 10px; color: #ccc; }',
      '.lz-logo { width: 80px; height: 80px; display: block; object-fit: contain; animation: lz-pulse 1.5s infinite ease-in-out; opacity: 0.8; }',
      '@keyframes lz-pulse { 0% { transform: scale(0.95); opacity: 0.6; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.6; } }',
      '.lz-loading-label { font-weight: 550; font-size: 1.4rem; letter-spacing: .1em; }',
      '.lz-track-outer { position: relative; width: 100%; overflow: hidden; }',
      '.lz-track { display: grid; grid-auto-flow: column; grid-auto-columns: var(--cw, calc((100% - 32px) / 3.2)); gap: 24px; overflow-x: auto; padding: 12px 12px 24px; scroll-snap-type: none; -webkit-overflow-scrolling: touch; cursor: grab; user-select: none; scrollbar-width: none; -ms-overflow-style: none; }',
      '.lz-track:active { cursor: grabbing; }',
      '.lz-track::-webkit-scrollbar { display: none; }',
      '@media (max-width: 768px) { .lz-track { grid-auto-columns: var(--cw-sm, calc(100% / 1.25)); gap: 16px; } }',
      '.lz-card { position: relative; border: 1px solid rgba(231, 211, 200, 0.4); border-radius: 16px; background: #fff; transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.4s ease, border-color 0.3s ease; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }',
      '.lz-card:hover, .lz-card.is-active { transform: translateY(-8px) scale(1.01); border-color: rgba(207, 58, 58, 0.3); box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 0 20px rgba(207, 58, 58, 0.05); }',
      '.lz-body { padding: 20px 16px; display: grid; gap: 10px; }',
      '.lz-title-sm { margin: 0; font-weight: 700; font-size: 1.6rem; color: var(--ink-dark); position: relative; transition: padding-left 0.3s ease, color 0.3s ease; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }',
      '.lz-card:hover .lz-title-sm, .lz-card.is-active .lz-title-sm { padding-left: 24px; color: var(--apple-red); }',
      '.lz-title-sm::before { content: ""; position: absolute; left: 0; top: 12px; transform: translateY(-50%) rotate(-15deg); width: 14px; height: 14px; background: var(--apple-green); border-radius: 0 80% 0 80%; opacity: 0; transition: opacity 0.3s ease; }',
      '.lz-card:hover .lz-title-sm::before, .lz-card.is-active .lz-title-sm::before { opacity: 1; }',
      '.lz-lead { font-size: 1.25rem; color: #666; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }',
      '.lz-media { position: relative; background: #fdfaf8; overflow: hidden; }',
      '.lz-media::before { content: ""; display: block; padding-top: var(--ratio, 60%); }',
      '.lz-media > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; pointer-events: none; transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1); }',
      '.lz-card:hover .lz-media > img, .lz-card.is-active .lz-media > img { transform: scale(1.05); }',
      '.lz-media.is-empty::after { content: ""; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 40%; aspect-ratio: 1/1; background-image: url("https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ca4e300-96ba-013e-36ff-0a58a9feac02/%E3%82%8A%E3%82%93%E3%81%93%E3%82%99%E3%83%AD%E3%82%B3%E3%82%99_%E8%B5%A4.png"); background-position: center; background-repeat: no-repeat; background-size: contain; opacity: 0.15; }'
    ].join('\n');
    document.head.appendChild(style);
  };

  /* ==========================================
     2. ロジック: 双方向無限手動ループ
     ========================================== */
  function setupInfinityTrack(track) {
    if (!track) return;
    if (track.scrollWidth <= track.clientWidth) return;
    var originalHTML = track.innerHTML;
    track.innerHTML = originalHTML + originalHTML + originalHTML;
    var isMouseDown = false;
    var startX, scrollLeftInitial;
    var resetToCenter = function () {
      var singleWidth = track.scrollWidth / 3;
      track.scrollLeft = singleWidth;
    };
    setTimeout(resetToCenter, 50);
    track.addEventListener('scroll', function () {
      var singleWidth = track.scrollWidth / 3;
      if (track.scrollLeft >= singleWidth * 2) {
        track.scrollLeft -= singleWidth;
      } else if (track.scrollLeft <= 0) {
        track.scrollLeft += singleWidth;
      }
    }, { passive: true });
    track.addEventListener('mousedown', function (e) {
      isMouseDown = true;
      startX = e.pageX - track.offsetLeft;
      scrollLeftInitial = track.scrollLeft;
    });
    window.addEventListener('mouseup', function () { isMouseDown = false; });
    track.addEventListener('mousemove', function (e) {
      if (!isMouseDown || e.buttons !== 1) return;
      e.preventDefault();
      var x = e.pageX - track.offsetLeft;
      var walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeftInitial - walk;
    });
  }

  /* ==========================================
     3. ユーティリティ
     ========================================== */
  /* ==========================================
     3. ユーティリティ
     ========================================== */
  function cardHTML(it, pad, groupKey) {
    // コンテンツ言語に合わせて取得
    var title = C.L(it, 'title') || "(無題)";
    var lead = C.L(it, 'lead') || "";
    var body = C.L(it, 'body') || "";

    var subs = it.subImages || [];
    var sns = it.sns || {};
    var related = it.relatedArticles || [];

    return [
      '<article class="lz-card" data-id="' + C.esc(it.title || "") + '" data-title="' + C.esc(title) + '"',
      '  data-item=\'' + C.esc(JSON.stringify(it)) + '\' ', // ★追加：全言語のデータをモーダルに引き継ぐ
      '  data-lead="' + C.esc(lead) + '" data-body="' + C.esc(body) + '" data-main="' + C.esc(it.mainImage || "") + '"',
      '  data-sub=\'' + C.esc(JSON.stringify(subs)) + '\' data-sns=\'' + C.esc(JSON.stringify(sns)) + '\'',
      '  data-related=\'' + C.esc(JSON.stringify(related)) + '\'',
      '  data-address="' + C.esc(it.address || "") + '" data-hours-combined="' + C.esc(it.hoursCombined || "") + '"',
      '  data-form="' + C.esc(it.form || "") + '" data-tel="' + C.esc(it.tel || "") + '" data-home="' + C.esc(it.home || "") + '"',
      '  data-ec="' + C.esc(it.ec || "") + '" data-target="' + C.esc(it.target || "") + '" data-org="' + C.esc(it.organizer || "") + '"',
      '  data-group="' + C.esc(groupKey) + '">',
      '  <div class="lz-media ' + (it.mainImage ? "" : "is-empty") + '" style="--ratio:' + pad + '">',
      it.mainImage ? '    <img src="' + C.esc(it.mainImage) + '" loading="lazy" decoding="async" onerror="this.parentElement.classList.add(\'is-empty\'); this.remove();">' : '',
      '  </div>',
      '  <div class="lz-body"><h3 class="lz-title-sm">' + C.esc(title) + '</h3><div class="lz-lead">' + C.esc(lead) + '</div></div>',
      '</article>'
    ].join('');
  }

  window.renderSection = async function (root) {
    if (root.dataset.lzDone === '1') return;
    var config = window.LZ_CONFIG, l1 = root.dataset.l1 || config.L1, l2 = root.dataset.l2 || "";
    if (!l2) return;

    var heading = root.dataset.heading || C.T(l2);
    var imageRatio = root.dataset.imageRatio || "16:9";
    var customWidth = root.dataset.cardWidth;
    var customWidthSm = root.dataset.cardWidthSm;
    var mql = window.matchMedia("(max-width:768px)");

    root.style.setProperty("--ratio", C.ratio(imageRatio));
    if (customWidth) root.style.setProperty("--cw", customWidth);
    if (customWidthSm) root.style.setProperty("--cw-sm", customWidthSm);

    // ローディング文言の多言語対応
    var loadingLabel = window.LZ_CURRENT_LANG === 'ja' ? '記事読み込み中…' : 'Loading articles...';

    root.innerHTML = [
      '<div class="lz-section">',
      '  <div class="lz-head"><div class="lz-titlewrap"><h2 class="lz-title">' + C.esc(heading) + '</h2></div></div>',
      '  <div class="lz-groupwrap"><div class="lz-loading"><div class="lz-loading-inner">',
      '    <img class="lz-logo" src="https://cdn.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ca4e300-96ba-013e-36ff-0a58a9feac02/%E3%82%8A%E3%82%93%E3%81%93%E3%82%99%E3%83%AD%E3%82%B3%E3%82%99_%E8%B5%A4.png" alt="Loading">',
      '    <div class="lz-loading-label">' + C.esc(loadingLabel) + '</div></div></div></div>',
      '</div>'
    ].join('');
    if (_svg) { setTimeout(function () { lzCenterLogoSVG(_svg); }, 10); }

    try {
      var json = await C.NET.json(config.ENDPOINT + "?l1=" + encodeURIComponent(l1) + "&l2=" + encodeURIComponent(l2));
      if (!json || !json.ok) throw new Error("no data");
      var items = json.items || [], groups = new Map();

      /* ★修正：大項目(L2)のタイトルを翻訳後のデータで上書き */
      if (items.length > 0) {
        var l2Title = C.L(items[0], "l2");
        var titleEl = root.querySelector(".lz-title");
        if (titleEl && l2Title) titleEl.textContent = l2Title;
      }

      items.forEach(function (it) {
        var k = (it.l3 || "").trim();
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(it);
      });
      var html = "", pad = C.ratio(imageRatio);
      groups.forEach(function (arr, key) {
        var localizedL3 = C.L(arr[0], 'l3');
        if (key) html += '<div class="lz-l3head"><span class="lz-l3bar"></span><h3 class="lz-l3title">' + C.esc(localizedL3) + '</h3></div>';
        html += '<div class="lz-track-outer"><div class="lz-track">' + arr.map(function (it) { return cardHTML(it, pad, key); }).join("") + '</div></div>';
      });
      root.querySelector(".lz-groupwrap").innerHTML = html;
      root.querySelector(".lz-section").classList.add("lz-ready");
      root.dataset.lzDone = '1';
      root.querySelectorAll(".lz-track").forEach(setupInfinityTrack);

      if (mql.matches) {
        var updateActiveCard = function (track) {
          var trackCenter = track.getBoundingClientRect().left + track.clientWidth / 2;
          var cards = track.querySelectorAll(".lz-card");
          var closestCard = null;
          var minDistance = Infinity;
          cards.forEach(function (card) {
            card.classList.remove("is-active");
            var rect = card.getBoundingClientRect();
            var cardCenter = rect.left + rect.width / 2;
            var distance = Math.abs(trackCenter - cardCenter);
            if (distance < minDistance) {
              minDistance = distance;
              closestCard = card;
            }
          });
          if (closestCard) closestCard.classList.add("is-active");
        };
        root.querySelectorAll(".lz-track").forEach(function (track) {
          updateActiveCard(track);
          track.addEventListener("scroll", function () { updateActiveCard(track); }, { passive: true });
        });
      }
      root.addEventListener("click", function (e) {
        var card = e.target.closest(".lz-card");
        if (card && window.lzModal) { e.preventDefault(); window.lzModal.open(card); }
      });
    } catch (e) {
      var errorLabel = window.LZ_CURRENT_LANG === 'ja' ? '読み込みに失敗しました' : 'Failed to load content';
      root.querySelector(".lz-groupwrap").innerHTML = '<div style="padding:40px; text-align:center; color:#999;">' + C.esc(errorLabel) + '</div>';
    }
  };

  var boot = function () {
    injectStyles();
    var waitConfig = setInterval(function () {
      if (window.LZ_CONFIG) { clearInterval(waitConfig); var els = document.querySelectorAll(".lz-container, .lz-section[data-l2]"); for (var i = 0; i < els.length; i++) { window.renderSection(els[i]); } }
    }, 50);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();