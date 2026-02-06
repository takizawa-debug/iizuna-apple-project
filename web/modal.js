/**
 * modal.js - 詳細表示・機能コンポーネント (完全復元版)
 * 役割: モーダル構築、前後ナビ、SNSシェア、文字化け対策済PDF生成
 */
window.lzModal = (function() {
  "use strict";

  var C = window.LZ_COMMON;
  if (!C) return;

  var ICON = {
    web:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    ec:`<svg viewBox="0 0 24 24"><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20 8H6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="19" r="1.6" fill="currentColor"/><circle cx="17" cy="19" r="1.6" fill="currentColor"/></svg>`,
    ig:`<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7z"/><path fill="currentColor" d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>`,
    fb:`<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13 22v-8h3l1-4h-4V7c0-1.1.9-2 2-2h2V1h-3a5 5 0 0 0-5 5v3H6v4h3v8h4z"/></svg>`,
    x:`<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3l8.5 9.7L3.8 21H7l5.2-6.6L17.6 21H21l-9-10.3L20.2 3H17L12 9.2 7.6 3H3z"/></svg>`,
    line:`<svg viewBox="0 0 24 24"><path fill="currentColor" d="M6.2 3.5H17.8c2.6 0 4.7 2 4.7 4.6v6.2c0 2.6-2.1 4.6-4.7 4.6H12c-.3 0 -.6.1 -.8.3l-2.9 2.4c-.3.2 -.7 0 -.7 -.4l.2 -2.5c0 -.3 -.2 -.6 -.5 -.7C5.3 17.7 3.5 15.7 3.5 14.3V8.1c0 -2.6 2.1 -4.6 4.7 -4.6Z"/></svg>`,
    tt:`<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2h3.2c.2 1.7 1.5 3 3.3 3.3V9c-1.9 -.1 -3.4 -.7 -4.5 -1.8v6.8c0 3 -2.4 5.4 -5.4 5.4S3.2 17 3.2 14s2.4 -5.4 5.4 -5.4c.6 0 1.2 .1 1.7 .3V12c-.3 -.1 -.6 -.2 -1 -.2-1.3 0-2.4 1.1-2.4 2.4S7.9 16.6 9.2 16.6c1.3 0 2.4 -1.1 2.4 -2.4V2z"/></svg>`
  };

  /* ==========================================
     1. CSS復元 (style.cssの定義を忠実に再現)
     ========================================== */
  var injectStyles = function() {
    if (document.getElementById('lz-modal-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-modal-styles';
    style.textContent = [
      '.lz-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, .35); display: none; align-items: center; justify-content: center; z-index: 9999; }',
      '.lz-backdrop.open { display: flex; }',
      '.lz-shell { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; }',
      '.lz-modal { position: relative; width: min(860px, 92vw); max-height: 88vh; overflow-y: auto; background: #fff; border: 2px solid var(--apple-red); border-radius: 12px; }',
      '@media(max-width:768px) { .lz-modal { max-height: 82svh; } }',
      '.lz-mh { background: #fff; border-bottom: 1px solid var(--border); padding: 8px 10px; display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; position: sticky; top: 0; z-index: 10; }',
      '.lz-mt { margin: 0; font-weight: 600; font-size: 2.0rem; color: var(--apple-red-strong); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
      '.lz-actions { display: flex; gap: 8px; align-items: center; }',
      '.lz-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--apple-red); background: #fff; border-radius: 999px; padding: .42em .8em; cursor: pointer; color: var(--apple-red); font-weight: 500; line-height: 1; transition: .15s; text-decoration: none; }',
      '.lz-btn:hover { background: var(--apple-red); color: #fff; }',
      '.lz-btn svg { width: 18px; height: 18px; }',
      '@media (max-width:768px) { .lz-btn { width: 36px; height: 36px; padding: 0; } .lz-btn .lz-label { display: none; } }',
      '.lz-mm { position: relative; background: #faf7f5; overflow: hidden; }',
      '.lz-mm::before { content: ""; display: block; padding-top: 56.25%; }',
      '.lz-mm > img { position: absolute; inset: 0; max-width: 100%; max-height: 100%; margin: auto; object-fit: contain; transition: opacity .22s ease; }',
      '.lz-mm > img.lz-fadeout { opacity: 0; }',
      '.lz-info { margin: 12px 12px 0; width: calc(100% - 24px); border-collapse: separate; border-spacing: 0 6px; }',
      '.lz-info th, .lz-info td { padding: 10px 12px; vertical-align: top; }',
      '.lz-info th { width: 9em; font-weight: 600; color: #a82626; background: #fff3f2; text-align: left; border-right: 1px solid #f0e2de; border-radius: 8px 0 0 8px; }',
      '.lz-info td { background: #ffffff; color: var(--ink-dark); border-radius: 0 8px 8px 0; word-break: break-word; }',
      '.lz-info a { color: var(--apple-green); text-decoration: none; font-weight: 500; word-break: break-all; }',
      '@media (max-width:768px) { .lz-info th, .lz-info td { display: block; width: auto; border-radius: 8px; } .lz-info td { border-top: 1px dashed #f0e2de; } }',
      '.lz-sns { display: flex; gap: 8px; flex-wrap: wrap; padding: 12px 12px 0; margin-bottom: 16px; }',
      '.lz-sns a { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; color: #fff; transition: .2s; }',
      '.lz-sns a svg { width: 20px; height: 20px; fill: currentColor; }',
      '.lz-sns a[data-sns="web"] { background: #5b667a; } .lz-sns a[data-sns="ec"] { background: #0ea5e9; }',
      '.lz-sns a[data-sns="ig"] { background: #E4405F; } .lz-sns a[data-sns="fb"] { background: #1877F2; }',
      '.lz-sns a[data-sns="x"] { background: #000000; } .lz-sns a[data-sns="line"] { background: #06C755; }',
      '.lz-sns a[data-sns="tt"] { background: #010101; }',
      '.lz-lead-strong { padding: 12px 12px 0; font-weight: 600; font-size: 1.5rem; line-height: 1.7; font-family: var(--font-article); }',
      '.lz-txt { padding: 12px; font-size: 1.5rem; color: #495057; line-height: 1.75; white-space: pre-wrap; font-family: var(--font-article); }',
      '.lz-g { padding: 0 12px 12px; display: grid; gap: 8px; grid-template-columns: repeat(5, 1fr); }',
      '.lz-g img { width: 100%; aspect-ratio: 16/9; object-fit: cover; background: #f6f7f9; border-radius: 8px; border: 1px solid var(--border); cursor: pointer; }',
      '.lz-g img.is-active { outline: 2px solid var(--apple-red); outline-offset: 2px; }',
      '.lz-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255, 255, 255, .92); border: 1px solid var(--apple-red); border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 100; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }',
      '.lz-arrow svg { width: 20px; height: 20px; stroke: var(--apple-red); stroke-width: 3; fill: none; }',
      '.lz-prev { left: -54px; } .lz-next { right: -54px; }',
      '@media(max-width:1024px) { .lz-prev, .lz-next { top: auto; bottom: -54px; } .lz-prev { left: calc(50% - 55px); } .lz-next { right: calc(50% - 55px); } }'
    ].join('\n');
    document.head.appendChild(style);
  };

  /* ==========================================
     2. ロジック: PDF文字化け対策フッター画像化
     ========================================== */
  function renderFooterImagePx(text, px, color) {
    var scale = 2, w = 1200, h = Math.round(px * 2.4);
    var canvas = document.createElement("canvas"); canvas.width = w * scale; canvas.height = h * scale;
    var ctx = canvas.getContext("2d"); ctx.scale(scale, scale);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = color; ctx.font = px + "px 'Noto Sans JP',sans-serif"; ctx.textBaseline = "middle";
    ctx.fillText(text, 2, h / 2);
    return { data: canvas.toDataURL("image/png"), ar: h / w };
  }

  /* ==========================================
     3. ロジック: PDF生成本体 (精密レイアウト)
     ========================================== */
  async function generatePdf(element, title, cardId) {
    if(!confirm("PDFを作成して新しいタブで開きます。よろしいですか？")) return;
    try {
      await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js");

      var url = window.location.origin + window.location.pathname + "?id=" + encodeURIComponent(cardId);
      var clone = element.cloneNode(true);
      clone.querySelector(".lz-actions").remove();
      clone.style.maxHeight = "none"; clone.style.width = "800px";
      clone.querySelectorAll("img").forEach(img => img.setAttribute("referrerpolicy", "no-referrer-when-downgrade"));
      document.body.appendChild(clone);

      var qrDiv = document.createElement("div"); 
      new QRCode(qrDiv, { text: url, width: 128, height: 128, correctLevel: QRCode.CorrectLevel.L });
      var qrCanvas = qrDiv.querySelector("canvas");

      var canvas = await html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      document.body.removeChild(clone);

      var pdf = new window.jspdf.jsPDF("p", "mm", "a4");
      var margin = 12, pageW = pdf.internal.pageSize.getWidth(), pageH = pdf.internal.pageSize.getHeight();
      var innerW = pageW - margin * 2, innerH = pageH - margin * 2;
      var imgData = canvas.toDataURL("image/png"), imgWmm = innerW, imgHmm = canvas.height * imgWmm / canvas.width;
      
      // フッター画像化 (文字化け対策)
      var jpImg = renderFooterImagePx("本PDFデータは飯綱町産りんごPR事業の一環で作成されました。", C.pt2px(C.PDF_FOOTER.jpPt), "#000");
      var yBaseDT = pageH - C.PDF_FOOTER.dtBottomMm;
      
      // 描画
      pdf.addImage(imgData, "PNG", margin, margin, imgWmm, imgHmm);
      if(qrCanvas) {
        var qSize = C.PDF_FOOTER.qrSizeMm;
        pdf.addImage(qrCanvas.toDataURL("image/png"), "PNG", pageW - margin - qSize, pageH - margin - qSize, qSize, qSize);
      }
      
      // フッターテキストと日時 (QRコードの横・下付近)
      pdf.addImage(jpImg.data, "PNG", margin, yBaseDT - 5, 5 / jpImg.ar, 5);
      
      var now = new Date();
      var ts = now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes();
      pdf.setFontSize(C.PDF_FOOTER.dtPt);
      pdf.text(ts + " / 1-1", pageW - margin, yBaseDT, {align:"right"});
      
      window.open(pdf.output("bloburl"), "_blank");
    } catch(e) { console.error(e); alert("PDF生成失敗"); }
  }

  /* ==========================================
     4. UI構築ロジック (HTML生成)
     ========================================== */
  var HOST, SHELL, MODAL, CARDS = [], IDX = 0;

  function render(card) {
    var d = card.dataset;
    var title = d.title;
    document.title = title + " | " + C.originalTitle;

    var subs = []; try { subs = JSON.parse(d.sub || "[]"); } catch(e){}
    var gallery = [d.main].concat(subs).filter(Boolean);
    var sns = {}; try { sns = JSON.parse(d.sns || "{}"); } catch(e){}
    var related = []; try { related = JSON.parse(d.related || "[]"); } catch(e){}

    // テーブル構築
    var rows = [];
    var fields = [
      {k:'address', l:'住所'}, {k:'hoursCombined', l:'営業時間'},
      {k:'bizDays', l:'営業曜日'}, {k:'holiday', l:'定休日'},
      {k:'fee', l:'参加費'}, {k:'target', l:'対象'}, {k:'org', l:'主催者名'}
    ];
    for(var i=0; i<fields.length; i++) {
      if(d[fields[i].k]) rows.push('<tr><th>' + fields[i].l + '</th><td>' + C.esc(d[fields[i].k]) + '</td></tr>');
    }
    var links = [];
    if(d.form) links.push('<a href="'+C.esc(d.form)+'" target="_blank">フォーム</a>');
    if(d.tel) links.push('<a href="tel:'+C.esc(d.tel)+'">'+C.esc(d.tel)+'</a>');
    if(links.length) rows.push('<tr><th>問い合わせ</th><td>' + links.join(' / ') + '</td></tr>');

    // SNS構築
    var snsHtml = [];
    var addSns = function(url, key) { if(url) snsHtml.push('<a data-sns="'+key+'" href="'+C.esc(url)+'" target="_blank">'+ICON[key]+'</a>'); };
    addSns(d.home, "web"); addSns(d.ec, "ec");
    addSns(sns.instagram, "ig"); addSns(sns.facebook, "fb");
    addSns(sns.x, "x"); addSns(sns.line, "line"); addSns(sns.tiktok, "tt");

    MODAL.innerHTML = [
      '<div class="lz-mh">',
      '  <h2 class="lz-mt">' + C.esc(title) + '</h2>',
      '  <div class="lz-actions">',
      '    <button class="lz-btn lz-share"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg><span class="lz-label">共有</span></button>',
      (window.innerWidth >= 769 ? '    <button class="lz-btn lz-pdf-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span class="lz-label">印刷</span></button>' : ''),
      '    <button class="lz-btn" onclick="lzModal.close()">✕<span class="lz-label">閉じる</span></button>',
      '  </div>',
      '</div>',
      '<div>',
      gallery.length ? '  <div class="lz-mm"><img id="lz-mainimg" src="' + C.esc(gallery[0]) + '" referrerpolicy="no-referrer-when-downgrade"></div>' : '',
      d.lead ? '  <div class="lz-lead-strong">' + C.esc(d.lead) + '</div>' : '',
      d.body ? '  <div class="lz-txt">' + C.esc(d.body) + '</div>' : '',
      gallery.length > 1 ? '  <div class="lz-g">' + gallery.map(function(u, i){ return '<img src="'+C.esc(u)+'" data-idx="'+i+'" class="'+(i===0?'is-active':'')+'">'; }).join('') + '</div>' : '',
      rows.length ? '  <table class="lz-info"><tbody>' + rows.join('') + '</tbody></table>' : '',
      snsHtml.length ? '  <div class="lz-sns">' + snsHtml.join('') + '</div>' : '',
      related.length ? '  <div class="lz-related" style="padding:0 12px 12px;">' + related.map(function(r){ return '<div><a href="'+C.esc(r.url)+'" target="_blank" style="color:var(--apple-red);font-weight:700;text-decoration:none;">→ '+C.esc(r.title)+'</a></div>'; }).join('') + '</div>' : '',
      '</div>'
    ].join('');

    // ギャラリー制御
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

    // 共有テキスト (滝澤さん指定フォーマット)
    MODAL.querySelector(".lz-share").onclick = function() {
      var shareUrl = window.location.origin + window.location.pathname + "?id=" + encodeURIComponent(d.id);
      var payload = C.RED_APPLE + title + C.GREEN_APPLE + "\n" + (d.lead || "") + "\nーーー\n詳しくはこちら\n" + shareUrl + "\n\n#いいづなりんご #飯綱町";
      if(navigator.share) {
        navigator.share({ text: payload });
      } else {
        var ta = document.createElement("textarea"); ta.value = payload; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
        alert("コピーしました。SNS等に貼り付けてください！");
      }
    };

    if(MODAL.querySelector(".lz-pdf-btn")) {
      MODAL.querySelector(".lz-pdf-btn").onclick = function(){ generatePdf(MODAL, title, d.id); };
    }

    // ★重要: 前後ナビ矢印の生成
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

  function close() { if(HOST) HOST.classList.remove("open"); document.title = C.originalTitle; }

  /* ==========================================
     5. 公開API
     ========================================== */
  injectStyles();

  return {
    open: function(card) {
      if (!card) return;
      if (!HOST) {
        HOST = document.createElement("div"); HOST.className = "lz-backdrop";
        HOST.innerHTML = '<div class="lz-shell"><div class="lz-modal"></div></div>';
        document.body.appendChild(HOST);
        SHELL = HOST.firstChild; MODAL = SHELL.firstChild;
        HOST.onclick = function(e){ if(e.target === HOST) close(); };
        document.addEventListener("keydown", function(e){ if(e.key === "Escape") close(); });
      }
      // 同じリスト内のカードを取得してナビ配列を構築
      var track = card.closest(".lz-track");
      CARDS = track ? Array.from(track.querySelectorAll(".lz-card")) : [card];
      IDX = CARDS.indexOf(card);
      render(card);
    },
    close: close
  };
})();