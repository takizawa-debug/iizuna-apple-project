/**
 * modal.js - 詳細表示・機能コンポーネント (頑丈版)
 * 役割: モーダルUI、ギャラリー、SNSシェア、PDF自動生成
 */
window.lzModal = (function() {
  "use strict";

  // 1. 依存関係のチェック
  var C = window.LZ_COMMON;
  if (!C) return;

  /* ==========================================
     2. CSSの注入 (詳細画面専用デザイン)
     ========================================== */
  var injectModalStyles = function() {
    if (document.getElementById('lz-modal-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-modal-styles';
    style.textContent = [
      /* 背景レイヤー */
      '.lz-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, .35); display: none; align-items: center; justify-content: center; z-index: 9000; backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); }',
      '.lz-backdrop.open { display: flex; }',
      '.lz-shell { position: relative; display: flex; align-items: center; justify-content: center; padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom); }',
      
      /* モーダル本体 */
      '.lz-modal { position: relative; width: min(860px, 92vw); max-height: 88vh; overflow-y: auto; background: #fff; border: 2px solid var(--apple-red); border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }',
      '@media(max-width:768px) { .lz-modal { max-height: 82svh; } }',

      /* ヘッダー */
      '.lz-mh { background: #fff; border-bottom: 1px solid var(--border); padding: 12px 16px; display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center; position: sticky; top: 0; z-index: 30; }',
      '.lz-mt { margin: 0; font-weight: var(--fw-modal-title); font-size: var(--fz-modal-title); color: var(--apple-red-strong); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
      '.lz-actions { display: flex; gap: 8px; align-items: center; }',

      /* アクションボタン */
      '.lz-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--apple-red); background: #fff; border-radius: 999px; padding: .5em 1em; cursor: pointer; color: var(--apple-red); font-weight: 600; line-height: 1; transition: .2s; text-decoration: none; }',
      '.lz-btn:hover { background: var(--apple-red); color: #fff; }',
      '.lz-btn svg { width: 18px; height: 18px; stroke: currentColor; fill: none; stroke-width: 2; }',
      '@media (max-width:768px) { .lz-btn { width: 40px; height: 40px; padding: 0; } .lz-btn .lz-label { display: none; } }',

      /* 画像エリア */
      '.lz-mm { position: relative; background: #faf7f5; overflow: hidden; }',
      '.lz-mm::before { content: ""; display: block; padding-top: 56.25%; }',
      '.lz-mm > img { position: absolute; inset: 0; max-width: 100%; max-height: 100%; margin: auto; object-fit: contain; transition: opacity .22s ease; opacity: 1; }',
      '.lz-mm > img.lz-fadeout { opacity: 0; }',
      
      /* ギャラリーサムネイル */
      '.lz-g { padding: 12px; display: grid; gap: 8px; grid-template-columns: repeat(5, 1fr); border-top: 1px solid var(--border); }',
      '.lz-g img { width: 100%; aspect-ratio: 16/9; object-fit: cover; background: #f6f7f9; border-radius: 8px; border: 1px solid var(--border); cursor: pointer; transition: .2s; }',
      '.lz-g img.is-active { outline: 3px solid var(--apple-red); outline-offset: 2px; }',

      /* 情報テーブル */
      '.lz-info { margin: 16px; width: calc(100% - 32px); border-collapse: separate; border-spacing: 0 8px; }',
      '.lz-info th, .lz-info td { padding: 12px; vertical-align: top; border-radius: 8px; }',
      '.lz-info th { width: 9em; font-weight: 700; color: var(--apple-red-strong); background: #fff3f2; text-align: left; }',
      '.lz-info td { background: #fafafa; color: #1b1b1b; word-break: break-word; }',
      '.lz-info a { color: var(--apple-green); font-weight: 700; text-decoration: underline; }',

      /* SNS & テキスト */
      '.lz-sns { display: flex; gap: 12px; flex-wrap: wrap; padding: 0 16px 16px; }',
      '.lz-sns a { display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 50%; color: #fff; transition: .2s; }',
      '.lz-sns a svg { width: 22px; height: 22px; fill: currentColor; }',
      '.lz-lead-strong { padding: 16px 16px 0; font-weight: 800; font-size: 1.6rem; line-height: 1.5; }',
      '.lz-txt { padding: 16px; font-size: 1.4rem; color: #444; line-height: 1.8; white-space: pre-wrap; }',

      /* ナビゲーション矢印 */
      '.lz-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255, 255, 255, 0.95); border: 1px solid var(--apple-red); border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }',
      '.lz-arrow svg { width: 24px; height: 24px; stroke: var(--apple-red); stroke-width: 3; fill: none; }',
      '.lz-prev { left: -64px; } .lz-next { right: -64px; }',
      '@media(max-width:1024px) { .lz-prev, .lz-next { top: auto; bottom: -60px; transform: none; } .lz-prev { left: calc(50% - 60px); } .lz-next { right: calc(50% - 60px); } }'
    ].join('\n');
    document.head.appendChild(style);
  };

  /* ==========================================
     3. ロジック本体
     ========================================== */
  var HOST, SHELL, MODAL, CARDS = [], IDX = 0;

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
    
    // URLとタイトルの更新
    var url = new URL(location.href); url.searchParams.set('id', d.id);
    history.replaceState(null, "", url.pathname + url.search);
    document.title = title + " | " + C.originalTitle;

    // 画像・SNSデータの解析
    var subs = []; try { subs = JSON.parse(d.sub || "[]"); } catch(e) {}
    var gallery = [d.main].concat(subs).filter(Boolean);
    var sns = {}; try { sns = JSON.parse(d.sns || "{}"); } catch(e) {}
    var related = []; try { related = JSON.parse(d.related || "[]"); } catch(e) {}

    // テーブル行の構築 (MICE設計)
    var rows = [];
    var fields = [
      {k:'address', l:'住所'}, {k:'hoursCombined', l:'営業時間'},
      {k:'bizDays', l:'営業日'}, {k:'holiday', l:'定休日'},
      {k:'fee', l:'料金/参加費'}, {k:'target', l:'対象'}, {k:'org', l:'主催'}
    ];
    for(var i=0; i<fields.length; i++) {
      if(d[fields[i].k]) rows.push('<tr><th>' + fields[i].l + '</th><td>' + C.esc(d[fields[i].k]) + '</td></tr>');
    }
    var links = [];
    if(d.form) links.push('<a href="' + C.esc(d.form) + '" target="_blank">予約/申込フォーム</a>');
    if(d.tel) links.push('<a href="tel:' + C.esc(d.tel) + '">' + C.esc(d.tel) + '</a>');
    if(links.length) rows.push('<tr><th>お問合せ</th><td>' + links.join(' / ') + '</td></tr>');

    // モーダル内HTML
    MODAL.innerHTML = [
      '<div class="lz-mh">',
      '  <h2 class="lz-mt">' + C.esc(title) + '</h2>',
      '  <div class="lz-actions">',
      '    <button class="lz-btn lz-share"><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg><span class="lz-label">共有</span></button>',
      '    <button class="lz-btn lz-pdf-btn"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span class="lz-label">印刷</span></button>',
      '    <button class="lz-btn" onclick="lzModal.close()"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span class="lz-label">閉じる</span></button>',
      '  </div>',
      '</div>',
      '<div>',
      gallery.length ? '  <div class="lz-mm"><img id="lz-mainimg" src="' + C.esc(gallery[0]) + '" referrerpolicy="no-referrer-when-downgrade"></div>' : '',
      d.lead ? '  <div class="lz-lead-strong">' + C.esc(d.lead) + '</div>' : '',
      d.body ? '  <div class="lz-txt">' + C.esc(d.body) + '</div>' : '',
      gallery.length > 1 ? '  <div class="lz-g">' + gallery.map(function(u, i){ return '<img src="'+C.esc(u)+'" data-idx="'+i+'" class="'+(i===0?'is-active':'')+'">'; }).join('') + '</div>' : '',
      rows.length ? '  <table class="lz-info"><tbody>' + rows.join('') + '</tbody></table>' : '',
      '<div class="lz-sns">',
      d.home ? '  <a href="'+C.esc(d.home)+'" target="_blank" style="background:#5b667a"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" stroke="currentColor" stroke-width="2" fill="none"/></svg></a>' : '',
      sns.instagram ? '  <a href="'+C.esc(sns.instagram)+'" target="_blank" style="background:#E4405F"><svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="18" cy="6" r="1" fill="currentColor"/></svg></a>' : '',
      '</div>',
      related.length ? '<div class="lz-related">' + related.map(function(r){ return '<div><a href="'+C.esc(r.url)+'" target="_blank">→ '+C.esc(r.title)+'</a></div>'; }).join('') + '</div>' : '',
      '</div>'
    ].join('');

    // ギャラリー制御
    var mainImg = MODAL.querySelector("#lz-mainimg");
    var thumbs = MODAL.querySelector(".lz-g");
    if (thumbs) {
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

    // シェア機能
    MODAL.querySelector(".lz-share").onclick = function() {
      var text = C.RED_APPLE + title + C.GREEN_APPLE + "\n" + (d.lead || "") + "\n" + location.href;
      if (navigator.share) {
        navigator.share({ title: title, text: d.lead, url: location.href });
      } else {
        var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
        alert("リンクと紹介文をコピーしました！SNSに貼り付けてください。");
      }
    };

    // PDF生成ボタン
    MODAL.querySelector(".lz-pdf-btn").onclick = function() { generatePdf(MODAL, title); };

    // 前後ナビの更新
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

  /* ==========================================
     4. PDF生成 (遅延読込)
     ========================================== */
  async function generatePdf(element, title) {
    if(!confirm("PDFを作成して新しいタブで開きますか？")) return;
    try {
      await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      
      var clone = element.cloneNode(true);
      clone.style.width = "800px"; clone.style.maxHeight = "none";
      clone.querySelector(".lz-mh").remove();
      document.body.appendChild(clone);
      
      var canvas = await html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      document.body.removeChild(clone);

      var pdf = new window.jspdf.jsPDF("p", "mm", "a4");
      var pdfW = pdf.internal.pageSize.getWidth();
      var imgW = pdfW - 20;
      var imgH = (canvas.height * imgW) / canvas.width;
      
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, imgW, imgH);
      pdf.setFontSize(9);
      pdf.text("いいづなりんごポータル | " + title, 10, 285);
      window.open(pdf.output("bloburl"), "_blank");
    } catch(e) { console.error(e); alert("PDFの作成に失敗しました。"); }
  }

  /* ==========================================
     5. 外部公開API & 初期化
     ========================================== */
  injectModalStyles();

  // ディープリンク待機処理
  var checkDeepLink = function() {
    var id = new URLSearchParams(location.search).get('id');
    if (!id) return;
    var attempts = 0;
    var timer = setInterval(function() {
      var card = document.getElementById(id);
      if (card) {
        clearInterval(timer);
        window.lzModal.open(card);
      }
      if (++attempts > 80) clearInterval(timer); // 最大8秒待機
    }, 100);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", checkDeepLink);
  else checkDeepLink();

  return { 
    open: function(card) { open(card); },
    close: function() { close(); }
  };
})();