/**
 * modal.js - 詳細表示・機能コンポーネント (UX Fixed Edition)
 * 役割: 関連記事表示(REL1/2対応)、矢印ナビ干渉防止、URL同期、SNSシェア、PDF生成
 */
window.lzModal = (function() {
  "use strict";

  var C = window.LZ_COMMON;
  if (!C) return;

  var ICON = {
    web:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    ec:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20 8H6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="19" r="1.6" fill="currentColor"/><circle cx="17" cy="19" r="1.6" fill="currentColor"/></svg>`,
    ig:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7z"/><path fill="currentColor" d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>`,
    fb:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13 22v-8h3l1-4h-4V7c0-1.1.9-2 2-2h2V1h-3a5 5 0 0 0-5 5v3H6v4h3v8h4z"/></svg>`,
    x:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 3l8.5 9.7L3.8 21H7l5.2-6.6L17.6 21H21l-9-10.3L20.2 3H17L12 9.2 7.6 3H3z"/></svg>`,
    line:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M6.2 3.5H17.8c2.6 0 4.7 2 4.7 4.6v6.2c0 2.6-2.1 4.6-4.7 4.6H12c-.3 0 -.6.1 -.8.3l-2.9 2.4c-.3.2 -.7 0 -.7 -.4l.2 -2.5c0 -.3 -.2 -.6 -.5 -.7C5.3 17.7 3.5 15.7 3.5 14.3V8.1c0 -2.6 2.1 -4.6 4.7 -4.6Z"/></svg>`,
    tt:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2h3.2c.2 1.7 1.5 3 3.3 3.3V9c-1.9 -.1 -3.4 -.7 -4.5 -1.8v6.8c0 3 -2.4 5.4 -5.4 5.4S3.2 17 3.2 14s2.4 -5.4 5.4 -5.4c.6 0 1.2 .1 1.7 .3V12c-.3 -.1 -.6 -.2 -1 -.2-1.3 0-2.4 1.1-2.4 2.4S7.9 16.6 9.2 16.6c1.3 0 2.4 -1.1 2.4 -2.4V2z"/></svg>`
  };

  /* ==========================================
     1. CSS (矢印ナビの干渉防止 & 関連記事デザイン)
     ========================================== */
  var injectStyles = function() {
    if (document.getElementById('lz-modal-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-modal-styles';
    style.textContent = [
      '.lz-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, .35); display: none; align-items: center; justify-content: center; z-index: 9999; }',
      '.lz-backdrop.open { display: flex; }',
      '.lz-shell { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }',
      '.lz-modal { position: relative; width: min(860px, 92vw); max-height: 88vh; overflow-y: auto; overflow-x: hidden; background: #fff; border: 2px solid var(--apple-red); border-radius: 12px; }',
      '.lz-mh { background: #fff; border-bottom: 1px solid var(--border); padding: 8px 10px; display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; position: sticky; top: 0; z-index: 10; }',
      '.lz-mt { margin: 0; font-weight: 600; font-size: 2.0rem; color: var(--apple-red-strong); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
      '.lz-actions { display: flex; gap: 8px; align-items: center; }',
      '.lz-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--apple-red); background: #fff; border-radius: 999px; padding: .42em .8em; cursor: pointer; color: var(--apple-red); font-weight: 500; line-height: 1; transition: .15s; }',
      '.lz-btn:hover { background: var(--apple-red); color: #fff; }',
      '.lz-btn svg { width: 18px; height: 18px; }',
      '@media (max-width:768px) { .lz-btn .lz-label { display: none; } .lz-btn { width: 36px; height: 36px; padding: 0; } }',
      '.lz-mm { position: relative; background: #faf7f5; overflow: hidden; }',
      '.lz-mm::before { content: ""; display: block; padding-top: 56.25%; }',
      '.lz-mm img { position: absolute; inset: 0; max-width: 100%; max-height: 100%; margin: auto; object-fit: contain; transition: opacity .22s ease; }',
      '.lz-mm img.lz-fadeout { opacity: 0; }',
      '.lz-lead-strong { padding: 12px 12px 0; font-weight: 600; font-size: 1.5rem; line-height: 1.7; }',
      '.lz-txt { padding: 12px; font-size: 1.5rem; color: #495057; line-height: 1.75; white-space: pre-wrap; }',
      '.lz-info { margin: 12px; width: calc(100% - 24px); border-collapse: separate; border-spacing: 0 6px; }',
      '.lz-info th { width: 9em; font-weight: 600; color: #a82626; background: #fff3f2; text-align: left; border-radius: 8px 0 0 8px; padding: 10px 12px; border: 1px solid #f0e2de; border-right: none; }',
      '.lz-info td { background: #ffffff; border-radius: 0 8px 8px 0; padding: 10px 12px; border: 1px solid #f0e2de; border-left: 1px dashed #f0e2de; }',
      '.lz-sns { display: flex; gap: 8px; flex-wrap: wrap; padding: 12px; }',
      '.lz-sns a { width: 36px; height: 36px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #fff; }',
      '.lz-g { padding: 0 12px 12px; display: grid; gap: 8px; grid-template-columns: repeat(5, 1fr); }',
      '.lz-g img { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); cursor: pointer; }',
      '.lz-g img.is-active { outline: 2px solid var(--apple-red); outline-offset: 2px; }',
      
      /* ★関連記事のスタイル */
      '.lz-rel { padding: 12px; margin: 12px; background: #fdfaf8; border-radius: 10px; border-left: 4px solid var(--apple-red); }',
      '.lz-rel-t { font-weight: 800; font-size: 1.2rem; color: var(--apple-red); margin-bottom: 8px; }',
      '.lz-rel-item { display: block; margin-bottom: 6px; color: #333; font-weight: 600; text-decoration: none; font-size: 1.3rem; }',
      '.lz-rel-item:hover { text-decoration: underline; color: var(--apple-red); }',

      /* ★矢印ナビの干渉防止（lz-m-arrowへ改名） */
      '.lz-m-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255, 255, 255, .92); border: 1px solid var(--apple-red); border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10005; box-shadow: 0 6px 15px rgba(0,0,0,0.15); transition: 0.2s; }',
      '.lz-m-arrow:hover { background: var(--apple-red); }',
      '.lz-m-arrow svg { width: 24px; height: 24px; stroke: var(--apple-red); stroke-width: 3; fill: none; transition: 0.2s; }',
      '.lz-m-arrow:hover svg { stroke: #fff; }',
      '.lz-m-prev { left: -68px; } .lz-m-next { right: -68px; }',
      '@media(max-width:1080px) { .lz-m-prev { left: 10px; } .lz-m-next { right: 10px; } .lz-m-arrow { width: 40px; height: 40px; background: rgba(255,255,255,0.8); } }'
    ].join('\n');
    document.head.appendChild(style);
  };

  /* ==========================================
     2. PDFロジック復元 (維持)
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

  async function generatePdf(element, title, cardId) {
    if(!confirm("PDFを作成します。よろしいですか？")) return;
    try {
      await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js");
      var qrUrl = window.location.origin + window.location.pathname + "?id=" + encodeURIComponent(cardId);
      var clone = element.cloneNode(true);
      clone.querySelector(".lz-actions").remove();
      clone.style.maxHeight = "none"; clone.style.width = "800px";
      document.body.appendChild(clone);
      var qrDiv = document.createElement("div"); 
      new QRCode(qrDiv, { text: qrUrl, width: 128, height: 128, correctLevel: QRCode.CorrectLevel.L });
      var qrCanvas = qrDiv.querySelector("canvas");
      var canvas = await html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      document.body.removeChild(clone);
      var pdf = new window.jspdf.jsPDF("p", "mm", "a4");
      var margin = 12, pageW = pdf.internal.pageSize.getWidth(), pageH = pdf.internal.pageSize.getHeight();
      var imgWmm = pageW - margin * 2, imgHmm = canvas.height * imgWmm / canvas.width;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, margin, imgWmm, imgHmm);
      if(qrCanvas) {
        var qSize = 20;
        pdf.addImage(qrCanvas.toDataURL("image/png"), "PNG", pageW - margin - qSize, pageH - margin - qSize - 8, qSize, qSize);
      }
      window.open(pdf.output("bloburl"), "_blank");
    } catch(e) { alert("PDF生成失敗"); }
  }

  /* ==========================================
     3. モーダル本体制御
     ========================================== */
  var HOST, SHELL, MODAL, CARDS = [], IDX = 0;

  function render(card) {
    if (!card) return;
    var d = card.dataset;
    var title = d.title;

    var url = new URL(window.location.href);
    url.searchParams.set('id', d.id);
    window.history.replaceState(null, "", url.toString());
    document.title = title + " | " + C.originalTitle;

    var subs = []; try { subs = JSON.parse(d.sub || "[]"); } catch(e){}
    var gallery = [d.main].concat(subs).filter(Boolean);
    var sns = {}; try { sns = JSON.parse(d.sns || "{}"); } catch(e){}

    // ★関連記事ロジックの復元 (REL1_URL, JSON双方に対応)
    var relList = [];
    if(d.rel1Url) relList.push({u:d.rel1Url, t:d.rel1Title || "関連記事1"});
    if(d.rel2Url) relList.push({u:d.rel2Url, t:d.rel2Title || "関連記事2"});
    try {
      var relJson = JSON.parse(d.related || "[]");
      relJson.forEach(function(r){ if(r.url) relList.push({u:r.url, t:r.title || "関連記事"}); });
    } catch(e){}

    var rows = [];
    var fields = [{k:'address', l:'住所'}, {k:'hoursCombined', l:'営業時間'}, {k:'bizDays', l:'営業曜日'}, {k:'holiday', l:'定休日'}, {k:'fee', l:'参加費'}, {k:'target', l:'対象'}, {k:'org', l:'主催者名'}];
    for(var i=0; i<fields.length; i++) {
      if(d[fields[i].k]) rows.push('<tr><th>' + fields[i].l + '</th><td>' + C.esc(d[fields[i].k]) + '</td></tr>');
    }
    if (d.tel) rows.push('<tr><th>問い合わせ</th><td><a href="tel:'+C.esc(d.tel)+'">'+C.esc(d.tel)+'</a></td></tr>');

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
      (window.innerWidth >= 769 ? '    <button class="lz-btn lz-pdf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span class="lz-label">印刷</span></button>' : ''),
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
      /* ★関連記事エリアの描画 */
      relList.length ? '  <div class="lz-rel"><div class="lz-rel-t">関連記事</div>' + relList.map(function(r){ return '<a class="lz-rel-item" href="'+C.esc(r.u)+'" target="_blank">🔗 '+C.esc(r.t)+'</a>'; }).join('') + '</div>' : '',
      '</div>'
    ].join('');

    // 各ボタンイベント
    MODAL.querySelector(".lz-share").onclick = function() {
      var shareUrl = window.location.origin + window.location.pathname + "?id=" + encodeURIComponent(d.id);
      var payload = C.RED_APPLE + title + C.GREEN_APPLE + "\n" + (d.lead || "") + "\nーーー\n詳しくはこちら\n" + shareUrl + "\n\n#いいづなりんご #飯綱町";
      if(navigator.share) navigator.share({ text: payload });
      else { var ta=document.createElement("textarea"); ta.value=payload; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); alert("コピーしました！"); }
    };
    if(MODAL.querySelector(".lz-pdf")) MODAL.querySelector(".lz-pdf").onclick = function(){ generatePdf(MODAL, title, d.id); };

    // ギャラリー制御
    var mainImg = MODAL.querySelector("#lz-mainimg");
    var thumbs = MODAL.querySelector(".lz-g");
    if(thumbs && mainImg) {
      thumbs.onclick = function(e) {
        var img = e.target.closest("img"); if(!img) return;
        mainImg.classList.add("lz-fadeout");
        setTimeout(function(){ mainImg.src = gallery[img.dataset.idx]; mainImg.onload = function(){ mainImg.classList.remove("lz-fadeout"); }; var all = thumbs.querySelectorAll("img"); for(var j=0; j<all.length; j++) all[j].classList.toggle("is-active", j == img.dataset.idx); }, 200);
      };
    }

    // ★矢印ナビ復旧 (干渉防止のため専用クラス lz-m-arrow 使用)
    SHELL.querySelectorAll(".lz-m-arrow").forEach(function(a){ a.remove(); });
    if (CARDS.length > 1) {
      var p = document.createElement("button"); p.className = "lz-m-arrow lz-m-prev"; p.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>';
      var n = document.createElement("button"); n.className = "lz-m-arrow lz-m-next"; n.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>';
      p.onclick = function(){ IDX = (IDX - 1 + CARDS.length) % CARDS.length; render(CARDS[IDX]); };
      n.onclick = function(){ IDX = (IDX + 1) % CARDS.length; render(CARDS[IDX]); };
      SHELL.appendChild(p); SHELL.appendChild(n);
    }

    HOST.classList.add("open");
    MODAL.scrollTop = 0;
  }

  function close() { if(HOST) HOST.classList.remove("open"); document.title = C.originalTitle; var url = new URL(location.href); url.searchParams.delete('id'); history.replaceState(null, "", url.toString()); }

  injectStyles();

  var checkDeepLink = function() {
    var urlId = new URLSearchParams(location.search).get('id');
    if (!urlId) return;
    var attempts = 0;
    var timer = setInterval(function() {
      var cards = document.querySelectorAll(".lz-card");
      for(var i=0; i<cards.length; i++){ if(cards[i].dataset.id === urlId){ clearInterval(timer); window.lzModal.open(cards[i]); return; } }
      if (++attempts > 100) clearInterval(timer);
    }, 100);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", checkDeepLink); else checkDeepLink();

  return { 
    open: function(card) {
      if (!HOST) {
        HOST = document.createElement("div"); HOST.className = "lz-backdrop";
        HOST.innerHTML = '<div class="lz-shell"><div class="lz-modal"></div></div>';
        document.body.appendChild(HOST);
        SHELL = HOST.firstChild; MODAL = SHELL.firstChild;
        HOST.onclick = function(e){ if(e.target === HOST) close(); };
        document.addEventListener("keydown", function(e){ if(e.key === "Escape") close(); });
      }
      var track = card.closest(".lz-track");
      CARDS = track ? Array.from(track.querySelectorAll(".lz-card")) : [card];
      IDX = CARDS.indexOf(card);
      render(card);
    },
    close: close
  };
})();