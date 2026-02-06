/**
 * modal.js - 詳細表示・機能コンポーネント (Navigation & Related Links Restored)
 * 役割: モーダル構築、関連記事表示、前後ナビ矢印、SNSシェア、精密PDF生成
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
     1. CSS
     ========================================== */
  var injectStyles = function() {
    if (document.getElementById('lz-modal-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-modal-styles';
    style.textContent = [
      '.lz-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, .45); display: none; align-items: center; justify-content: center; z-index: 15000; }',
      '.lz-backdrop.open { display: flex; }',
      '.lz-shell { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }',
      '.lz-modal { position: relative; width: min(860px, 92vw); max-height: 85vh; overflow-y: auto; background: #fff; border: 2px solid var(--apple-red); border-radius: 12px; z-index: 10; }',
      '.lz-mh { background: #fff; border-bottom: 1px solid #eee; padding: 10px 15px; display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; position: sticky; top: 0; z-index: 20; }',
      '.lz-mt { margin: 0; font-weight: 800; font-size: 1.8rem; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
      '.lz-actions { display: flex; gap: 8px; align-items: center; }',
      '.lz-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--apple-red); background: #fff; border-radius: 999px; padding: 6px 12px; cursor: pointer; color: var(--apple-red); font-weight: 600; transition: .2s; }',
      '.lz-btn:hover { background: var(--apple-red); color: #fff; }',
      '@media (max-width:768px) { .lz-btn .lz-label { display: none; } .lz-btn { width: 38px; height: 38px; padding: 0; } }',
      '.lz-mm { background: #fdfaf8; position: relative; overflow: hidden; aspect-ratio: 16/9; }',
      '.lz-mm img { width: 100%; height: 100%; object-fit: contain; transition: opacity .25s ease; }',
      '.lz-lead-strong { padding: 15px 15px 0; font-weight: 700; font-size: 1.5rem; line-height: 1.6; color: #222; }',
      '.lz-txt { padding: 15px; font-size: 1.45rem; color: #444; line-height: 1.8; white-space: pre-wrap; }',
      '.lz-info { margin: 15px; width: calc(100% - 30px); border-collapse: separate; border-spacing: 0 4px; }',
      '.lz-info th { width: 8em; background: #fff5f5; color: var(--apple-red); text-align: left; padding: 10px; border-radius: 8px 0 0 8px; font-size: 1.3rem; }',
      '.lz-info td { background: #fff; border: 1px solid #f0f0f0; padding: 10px; border-radius: 0 8px 8px 0; font-size: 1.3rem; }',
      '.lz-sns { display: flex; gap: 10px; padding: 0 15px 15px; flex-wrap: wrap; }',
      '.lz-sns a { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; }',
      
      /* ★関連記事のスタイル */
      '.lz-rel-area { margin: 10px 15px 20px; padding-top: 15px; border-top: 1px solid #eee; }',
      '.lz-rel-label { font-size: 1.2rem; font-weight: 800; color: #888; margin-bottom: 8px; }',
      '.lz-rel-link { display: inline-block; padding: 10px 15px; background: #f9f9f9; color: var(--apple-red); text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 1.3rem; margin-right: 8px; margin-bottom: 8px; border: 1px solid #eee; transition: .2s; }',
      '.lz-rel-link:hover { background: #fff5f5; border-color: var(--apple-red); }',

      /* ★矢印ナビの強化：z-indexと色を確実に */
      '.lz-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: #fff; border: 2px solid var(--apple-red); border-radius: 50%; width: 52px; height: 52px; display: flex !important; align-items: center; justify-content: center; cursor: pointer; z-index: 16000; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }',
      '.lz-arrow svg { width: 28px; height: 28px; stroke: var(--apple-red); stroke-width: 3; fill: none; }',
      '.lz-prev { left: 20px; } .lz-next { right: 20px; }',
      '@media(max-width:1024px) { .lz-arrow { top: auto; bottom: 30px; } .lz-prev { left: 50%; transform: translateX(-130%); } .lz-next { right: 50%; transform: translateX(30%); } }'
    ].join('\n');
    document.head.appendChild(style);
  };

  /* ==========================================
     2. ロジック (PDF/関連記事/矢印)
     ========================================== */
  async function generatePdf(element, title, cardId) {
    if(!confirm("PDFを作成して新しいタブで開きます。よろしいですか？")) return;
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
      var margin = 12, pageW = pdf.internal.pageSize.getWidth();
      var imgWmm = pageW - margin * 2, imgHmm = canvas.height * imgWmm / canvas.width;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, margin, imgWmm, imgHmm);
      if(qrCanvas) {
        var qSize = C.PDF_FOOTER.qrSizeMm;
        pdf.addImage(qrCanvas.toDataURL("image/png"), "PNG", pageW - margin - qSize, pdf.internal.pageSize.getHeight() - margin - qSize - 8, qSize, qSize);
      }
      window.open(pdf.output("bloburl"), "_blank");
    } catch(e) { alert("PDF生成失敗"); }
  }

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

    var rows = [];
    var fields = [{k:'address', l:'住所'}, {k:'hoursCombined', l:'営業時間'}, {k:'bizDays', l:'営業曜日'}, {k:'holiday', l:'定休日'}, {k:'fee', l:'参加費'}, {k:'target', l:'対象'}, {k:'org', l:'主催者名'}];
    for(var i=0; i<fields.length; i++) { if(d[fields[i].k]) rows.push('<tr><th>' + fields[i].l + '</th><td>' + C.esc(d[fields[i].k]) + '</td></tr>'); }
    if (d.tel) rows.push('<tr><th>問い合わせ</th><td><a href="tel:'+C.esc(d.tel)+'">'+C.esc(d.tel)+'</a></td></tr>');

    var snsHtml = [];
    var addSns = function(url, key) { if(url) snsHtml.push('<a data-sns="'+key+'" href="'+C.esc(url)+'" target="_blank">'+ICON[key]+'</a>'); };
    addSns(d.home, "web"); addSns(d.ec, "ec"); addSns(sns.instagram, "ig"); addSns(sns.facebook, "fb"); addSns(sns.x, "x"); addSns(sns.line, "line"); addSns(sns.tiktok, "tt");

    /* ★関連記事リンクの構築 */
    var relHtml = "";
    var rels = [];
    if(d.rel1Url && d.rel1Title) rels.push('<a class="lz-rel-link" href="'+C.esc(d.rel1Url)+'" target="_blank">🔗 '+C.esc(d.rel1Title)+'</a>');
    if(d.rel2Url && d.rel2Title) rels.push('<a class="lz-rel-link" href="'+C.esc(d.rel2Url)+'" target="_blank">🔗 '+C.esc(d.rel2Title)+'</a>');
    if(rels.length > 0) relHtml = '<div class="lz-rel-area"><div class="lz-rel-label">こちらの記事もおすすめ</div>' + rels.join('') + '</div>';

    MODAL.innerHTML = [
      '<div class="lz-mh"><h2 class="lz-mt">' + C.esc(title) + '</h2><div class="lz-actions">',
      '<button class="lz-btn lz-share"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg><span class="lz-label">共有</span></button>',
      (window.innerWidth >= 769 ? '<button class="lz-btn lz-pdf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span class="lz-label">印刷</span></button>' : ''),
      '<button class="lz-btn" onclick="lzModal.close()">✕<span class="lz-label">閉じる</span></button></div></div>',
      '<div>',
      gallery.length ? '<div class="lz-mm"><img id="lz-mainimg" src="' + C.esc(gallery[0]) + '" referrerpolicy="no-referrer-when-downgrade"></div>' : '',
      d.lead ? '<div class="lz-lead-strong">' + C.esc(d.lead) + '</div>' : '',
      d.body ? '<div class="lz-txt">' + C.esc(d.body) + '</div>' : '',
      relHtml, // ★関連記事を表示
      gallery.length > 1 ? '<div class="lz-g" style="padding:0 15px 15px;display:grid;gap:8px;grid-template-columns:repeat(5,1fr);">' + gallery.map(function(u, i){ return '<img src="'+C.esc(u)+'" data-idx="'+i+'" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:8px;cursor:pointer;" class="'+(i===0?'is-active':'')+'">'; }).join('') + '</div>' : '',
      rows.length ? '<table class="lz-info"><tbody>' + rows.join('') + '</tbody></table>' : '',
      snsHtml.length ? '<div class="lz-sns">' + snsHtml.join('') + '</div>' : '',
      '</div>'
    ].join('');

    MODAL.querySelector(".lz-share").onclick = function() {
      var shareUrl = window.location.origin + window.location.pathname + "?id=" + encodeURIComponent(d.id);
      var payload = C.RED_APPLE + title + C.GREEN_APPLE + "\n" + (d.lead || "") + "\nーーー\n" + shareUrl;
      if(navigator.share) navigator.share({ text: payload });
      else { var ta=document.createElement("textarea"); ta.value=payload; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); alert("コピーしました！"); }
    };
    if(MODAL.querySelector(".lz-pdf")) MODAL.querySelector(".lz-pdf").onclick = function(){ generatePdf(MODAL, title, d.id); };

    // 矢印ナビの描画
    SHELL.querySelectorAll(".lz-arrow").forEach(function(a){ a.remove(); });
    if (CARDS.length > 1) {
      var p = document.createElement("button"); p.className = "lz-arrow lz-prev"; p.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>';
      var n = document.createElement("button"); n.className = "lz-arrow lz-next"; n.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>';
      p.onclick = function(e){ e.stopPropagation(); IDX = (IDX - 1 + CARDS.length) % CARDS.length; render(CARDS[IDX]); };
      n.onclick = function(e){ e.stopPropagation(); IDX = (IDX + 1) % CARDS.length; render(CARDS[IDX]); };
      SHELL.appendChild(p); SHELL.appendChild(n);
    }

    HOST.classList.add("open");
    MODAL.scrollTop = 0;
  }

  function close() { if(HOST) HOST.classList.remove("open"); document.title = C.originalTitle; var url = new URL(location.href); url.searchParams.delete('id'); history.replaceState(null, "", url.toString()); }

  injectStyles();

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