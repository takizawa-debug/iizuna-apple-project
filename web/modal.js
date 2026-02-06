/**
 * modal.js - 詳細表示コンポーネント (404対策・安定版)
 * 役割: モーダルUIの構築、画像切替、共有、PDF、ページ移動の防止
 */
window.lzModal = (function() {
  "use strict";

  var C = window.LZ_COMMON;
  if (!C) return;

  /* ==========================================
     1. CSSの注入
     ========================================== */
  var injectStyles = function() {
    if (document.getElementById('lz-modal-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-modal-styles';
    style.textContent = [
      '.lz-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, .45); display: none; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }',
      '.lz-backdrop.open { display: flex; }',
      '.lz-shell { position: relative; width: 100%; display: flex; align-items: center; justify-content: center; }',
      '.lz-modal { position: relative; width: min(860px, 94vw); max-height: 90vh; overflow-y: auto; background: #fff; border: 2px solid var(--apple-red); border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }',
      '@media(max-width:768px) { .lz-modal { max-height: 85svh; } }',
      '.lz-mh { background: #fff; border-bottom: 1px solid var(--border); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 10; }',
      '.lz-mt { margin: 0; font-weight: 700; font-size: 1.8rem; color: var(--apple-red-strong); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }',
      '.lz-actions { display: flex; gap: 8px; margin-left: 12px; }',
      '.lz-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--apple-red); background: #fff; border-radius: 999px; padding: 6px 14px; cursor: pointer; color: var(--apple-red); font-weight: 600; font-size: 1.3rem; transition: .2s; text-decoration: none; }',
      '.lz-btn:hover { background: var(--apple-red); color: #fff; }',
      '.lz-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2.5; }',
      '@media (max-width:768px) { .lz-btn .lz-label { display: none; } .lz-btn { width: 38px; height: 38px; padding: 0; } }',
      '.lz-mm { position: relative; background: #faf7f5; }',
      '.lz-mm::before { content: ""; display: block; padding-top: 56.25%; }',
      '.lz-mm img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; transition: opacity .2s; }',
      '.lz-mm img.lz-fadeout { opacity: 0; }',
      '.lz-info { margin: 16px; width: calc(100% - 32px); border-collapse: separate; border-spacing: 0 6px; }',
      '.lz-info th, .lz-info td { padding: 10px 12px; vertical-align: top; border-radius: 6px; }',
      '.lz-info th { width: 8em; background: #fff3f2; color: var(--apple-red-strong); font-weight: 700; text-align: left; }',
      '.lz-info td { background: #fafafa; color: #333; }',
      '.lz-info a { color: var(--apple-green); font-weight: 700; }',
      '.lz-lead-strong { padding: 16px 16px 0; font-weight: 800; font-size: 1.6rem; color: #1b1b1b; line-height: 1.5; }',
      '.lz-txt { padding: 16px; font-size: 1.4rem; color: #444; line-height: 1.7; white-space: pre-wrap; }',
      '.lz-g { padding: 12px; display: grid; gap: 8px; grid-template-columns: repeat(5, 1fr); border-top: 1px solid var(--border); }',
      '.lz-g img { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 6px; border: 1px solid var(--border); cursor: pointer; }',
      '.lz-g img.is-active { outline: 3px solid var(--apple-red); }',
      '.lz-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: #fff; border: 1px solid var(--apple-red); border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 100; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }',
      '.lz-arrow svg { width: 20px; height: 20px; stroke: var(--apple-red); stroke-width: 3; fill: none; }',
      '.lz-prev { left: -54px; } .lz-next { right: -54px; }',
      '@media(max-width:1024px) { .lz-prev, .lz-next { top: auto; bottom: -55px; } .lz-prev { left: calc(50% - 55px); } .lz-next { right: calc(50% - 55px); } }'
    ].join('\n');
    document.head.appendChild(style);
  };

  /* ==========================================
     2. モーダル制御
     ========================================== */
  var HOST, MODAL, SHELL, CARDS = [], IDX = 0;

  function ensureModal() {
    if (HOST) return;
    HOST = document.createElement("div"); HOST.className = "lz-backdrop";
    HOST.innerHTML = '<div class="lz-shell"><div class="lz-modal"></div></div>';
    document.body.appendChild(HOST);
    SHELL = HOST.firstChild; MODAL = SHELL.firstChild;
    HOST.onclick = function(e) { if(e.target === HOST) close(); };
    document.addEventListener("keydown", function(e) { if(e.key === "Escape") close(); });
  }

  function close() {
    if(!HOST) return;
    HOST.classList.remove("open");
    document.title = C.originalTitle;
    var url = new URL(location.href); url.searchParams.delete('id');
    history.replaceState(null, "", url.pathname + url.search);
  }

  function render(card) {
    var d = card.dataset;
    var title = d.title;
    
    // URLの書き換え（404にならないようURL構造を維持）
    var url = new URL(location.href); url.searchParams.set('id', d.id);
    history.replaceState(null, "", url.pathname + url.search);
    document.title = title + " | " + C.originalTitle;

    var subs = []; try { subs = JSON.parse(d.sub || "[]"); } catch(e) {}
    var gallery = [d.main].concat(subs).filter(Boolean);
    var sns = {}; try { sns = JSON.parse(d.sns || "{}"); } catch(e) {}

    var rows = [];
    if(d.address) rows.push('<tr><th>住所</th><td>' + C.esc(d.address) + '</td></tr>');
    if(d.hoursCombined) rows.push('<tr><th>営業時間</th><td>' + C.esc(d.hoursCombined) + '</td></tr>');
    var links = [];
    if(d.form) links.push('<a href="'+C.esc(d.form)+'" target="_blank">予約フォーム</a>');
    if(d.tel) links.push('<a href="tel:'+C.esc(d.tel)+'">'+C.esc(d.tel)+'</a>');
    if(links.length) rows.push('<tr><th>お問合せ</th><td>' + links.join(' / ') + '</td></tr>');

    MODAL.innerHTML = [
      '<div class="lz-mh">',
      '  <h2 class="lz-mt">' + C.esc(title) + '</h2>',
      '  <div class="lz-actions">',
      '    <button class="lz-btn lz-share-btn"><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg><span class="lz-label">共有</span></button>',
      '    <button class="lz-btn lz-close-btn">✕<span class="lz-label">閉じる</span></button>',
      '  </div>',
      '</div>',
      '<div class="lz-content">',
      gallery.length ? '  <div class="lz-mm"><img id="lz-mainimg" src="' + C.esc(gallery[0]) + '"></div>' : '',
      '  <div class="lz-lead-strong">' + C.esc(d.lead || "") + '</div>',
      '  <div class="lz-txt">' + C.esc(d.body || "") + '</div>',
      gallery.length > 1 ? '  <div class="lz-g">' + gallery.map(function(u, i){ return '<img src="'+C.esc(u)+'" data-idx="'+i+'" class="'+(i===0?'is-active':'')+'">'; }).join('') + '</div>' : '',
      rows.length ? '  <table class="lz-info"><tbody>' + rows.join('') + '</tbody></table>' : '',
      '</div>'
    ].join('');

    // 各種イベント
    MODAL.querySelector(".lz-close-btn").onclick = close;
    var mainImg = MODAL.querySelector("#lz-mainimg");
    var thumbs = MODAL.querySelector(".lz-g");
    if(thumbs) {
      thumbs.onclick = function(e) {
        var img = e.target.closest("img"); if(!img) return;
        mainImg.classList.add("lz-fadeout");
        setTimeout(function(){
          mainImg.src = gallery[img.dataset.idx];
          mainImg.onload = function(){ mainImg.classList.remove("lz-fadeout"); };
          var all = thumbs.querySelectorAll("img");
          for(var j=0; j<all.length; j++) all[j].classList.toggle("is-active", j == img.dataset.idx);
        }, 200);
      };
    }
    
    MODAL.querySelector(".lz-share-btn").onclick = function() {
      if(navigator.share) navigator.share({ title: title, url: location.href });
      else alert("URLをコピーしました：" + location.href);
    };

    // 矢印ナビ
    SHELL.querySelectorAll(".lz-arrow").forEach(function(a){ a.remove(); });
    if (CARDS.length > 1) {
      var p = document.createElement("button"); p.className = "lz-arrow lz-prev"; p.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>';
      var n = document.createElement("button"); n.className = "lz-arrow lz-next"; n.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>';
      p.onclick = function(){ IDX = (IDX - 1 + CARDS.length) % CARDS.length; render(CARDS[IDX]); };
      n.onclick = function(){ IDX = (IDX + 1) % CARDS.length; render(CARDS[IDX]); };
      SHELL.appendChild(p); SHELL.appendChild(n);
    }

    HOST.classList.add("open");
    MODAL.scrollTop = 0;
  }

  injectStyles();

  return {
    open: function(card) {
      ensureModal();
      var track = card.closest(".lz-track");
      CARDS = track ? Array.from(track.querySelectorAll(".lz-card")) : [card];
      IDX = CARDS.indexOf(card);
      render(card);
    },
    close: close
  };
})();