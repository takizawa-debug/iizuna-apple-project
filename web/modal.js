/**
 * modal.js - 詳細表示コンポーネント (完全機能復元版)
 * 役割: モーダルUI、高機能PDF生成、SNS共有、画像ギャラリー、詳細情報テーブル
 */
window.lzModal = (function() {
  "use strict";

  var C = window.LZ_COMMON;
  if (!C) return;

  /* --- 1. アイコン定義 (main.jsより完全移植) --- */
  var ICON = {
    web: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
    ec: '<svg viewBox="0 0 24 24"><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20 8H6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="19" r="1.6" fill="currentColor"/><circle cx="17" cy="19" r="1.6" fill="currentColor"/></svg>',
    ig: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7z"/><path fill="currentColor" d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>',
    fb: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13 22v-8h3l1-4h-4V7c0-1.1.9-2 2-2h2V1h-3a5 5 0 0 0-5 5v3H6v4h3v8h4z"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3l8.5 9.7L3.8 21H7l5.2-6.6L17.6 21H21l-9-10.3L20.2 3H17L12 9.2 7.6 3H3z"/></svg>',
    line: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M6.2 3.5H17.8c2.6 0 4.7 2 4.7 4.6v6.2c0 2.6-2.1 4.6-4.7 4.6H12c-.3 0 -.6.1 -.8.3l-2.9 2.4c-.3.2 -.7 0 -.7 -.4l.2 -2.5c0 -.3 -.2 -.6 -.5 -.7C5.3 17.7 3.5 15.7 3.5 14.3V8.1c0 -2.6 2.1 -4.6 4.7 -4.6Z"/></svg>',
    tt: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2h3.2c.2 1.7 1.5 3 3.3 3.3V9c-1.9 -.1 -3.4 -.7 -4.5 -1.8v6.8c0 3 -2.4 5.4 -5.4 5.4S3.2 17 3.2 14s2.4 -5.4 5.4 -5.4c.6 0 1.2 .1 1.7 .3V12c-.3 -.1 -.6 -.2 -1 -.2-1.3 0-2.4 1.1-2.4 2.4S7.9 16.6 9.2 16.6c1.3 0 2.4 -1.1 2.4 -2.4V2z"/></svg>'
  };

  /* --- 2. CSS注入 (style.cssより移植・整理) --- */
  var injectStyles = function() {
    if (document.getElementById('lz-modal-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-modal-styles';
    style.textContent = [
      '.lz-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, .45); display: none; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }',
      '.lz-backdrop.open { display: flex; }',
      '.lz-modal { position: relative; width: min(860px, 94vw); max-height: 90vh; overflow-y: auto; background: #fff; border: 2px solid var(--apple-red); border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }',
      '@media(max-width:768px) { .lz-modal { max-height: 85svh; } }',
      '.lz-mh { background: #fff; border-bottom: 1px solid var(--border); padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 30; }',
      '.lz-mt { margin: 0; font-weight: 700; font-size: 1.8rem; color: var(--apple-red-strong); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
      '.lz-actions { display: flex; gap: 6px; }',
      '.lz-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--apple-red); background: #fff; border-radius: 999px; padding: 6px 12px; cursor: pointer; color: var(--apple-red); font-weight: 600; transition: .2s; text-decoration: none; font-size: 1.2rem; }',
      '.lz-btn:hover { background: var(--apple-red); color: #fff; }',
      '.lz-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2.5; }',
      '@media (max-width:768px) { .lz-btn .lz-label { display: none; } .lz-btn { width: 36px; height: 36px; padding: 0; } }',
      '.lz-mm { position: relative; background: #faf7f5; overflow: hidden; }',
      '.lz-mm::before { content: ""; display: block; padding-top: 56.25%; }',
      '.lz-mm img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; transition: opacity .22s; }',
      '.lz-mm img.lz-fadeout { opacity: 0; }',
      '.lz-info { margin: 16px; width: calc(100% - 32px); border-collapse: separate; border-spacing: 0 6px; }',
      '.lz-info th, .lz-info td { padding: 10px 12px; vertical-align: top; border-radius: 6px; font-size: 1.4rem; }',
      '.lz-info th { width: 9em; background: #fff3f2; color: var(--apple-red-strong); text-align: left; }',
      '.lz-info td { background: #fafafa; color: #1b1b1b; }',
      '@media(max-width:768px) { .lz-info th, .lz-info td { display: block; width: auto; } .lz-info th { border-bottom-left-radius: 0; border-bottom-right-radius: 0; } .lz-info td { border-top-left-radius: 0; border-top-right-radius: 0; border-top: 1px dashed #eee; } }',
      '.lz-sns { display: flex; gap: 8px; flex-wrap: wrap; padding: 0 16px 16px; }',
      '.lz-sns a { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; color: #fff; transition: .2s; }',
      '.lz-sns a svg { width: 20px; height: 20px; fill: currentColor; }',
      '.lz-sns a[data-sns="web"] { background: #5b667a; } .lz-sns a[data-sns="ec"] { background: #0ea5e9; } .lz-sns a[data-sns="ig"] { background: #E4405F; } .lz-sns a[data-sns="fb"] { background: #1877F2; } .lz-sns a[data-sns="x"] { background: #000; } .lz-sns a[data-sns="line"] { background: #06C755; } .lz-sns a[data-sns="tt"] { background: #010101; }',
      '.lz-g { padding: 12px; display: grid; gap: 8px; grid-template-columns: repeat(5, 1fr); border-top: 1px solid var(--border); }',
      '.lz-g img { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 6px; border: 1px solid var(--border); cursor: pointer; }',
      '.lz-g img.is-active { outline: 3px solid var(--apple-red); outline-offset: 1px; }',
      '.lz-lead-strong { padding: 16px 16px 0; font-weight: 800; font-size: 1.6rem; color: #111; line-height: 1.6; }',
      '.lz-txt { padding: 16px; font-size: 1.45rem; color: #444; line-height: 1.8; white-space: pre-wrap; }',
      '.lz-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: #fff; border: 1px solid var(--apple-red); border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 100; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }',
      '.lz-arrow svg { width: 22px; height: 22px; stroke: var(--apple-red); stroke-width: 3; fill: none; }',
      '.lz-prev { left: -54px; } .lz-next { right: -54px; }',
      '@media(max-width:1100px) { .lz-prev, .lz-next { top: auto; bottom: -55px; } .lz-prev { left: calc(50% - 60px); } .lz-next { right: calc(50% - 60px); } }'
    ].join('\n');
    document.head.appendChild(style);
  };

  /* --- 3. ロジック本体 --- */
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

  function buildInfoTable(d) {
    var rows = [];
    if(d.address) rows.push('<tr><th>住所</th><td>' + C.esc(d.address) + '</td></tr>');
    if(d.bizDays) rows.push('<tr><th>営業曜日</th><td>' + C.esc(d.bizDays) + '</td></tr>');
    if(d.holiday) rows.push('<tr><th>定休日</th><td>' + C.esc(d.holiday) + '</td></tr>');
    if(d.hoursCombined) rows.push('<tr><th>営業時間</th><td>' + C.esc(d.hoursCombined) + '</td></tr>');
    if(d.fee) rows.push('<tr><th>料金/参加費</th><td>' + C.esc(d.fee) + '</td></tr>');
    if(d.target) rows.push('<tr><th>対象</th><td>' + C.esc(d.target) + '</td></tr>');
    
    var links = [];
    if(d.form) links.push('<a href="' + C.esc(d.form) + '" target="_blank">申込フォーム</a>');
    if(d.tel) links.push('<a href="tel:' + C.esc(d.tel) + '">' + C.esc(d.tel) + '</a>');
    if(links.length) rows.push('<tr><th>お問合せ</th><td>' + links.join(' / ') + '</td></tr>');
    
    return rows.length ? '<table class="lz-info"><tbody>' + rows.join('') + '</tbody></table>' : '';
  }

  function buildSNS(d) {
    var sns = {}; try { sns = JSON.parse(d.sns || "{}"); } catch(e) {}
    var html = [];
    var btn = function(url, key, label) {
      return url ? '<a data-sns="' + key + '" href="' + C.esc(url) + '" target="_blank" aria-label="' + label + '">' + ICON[key] + '</a>' : '';
    };
    html.push(btn(d.home, "web", "HP"));
    html.push(btn(d.ec, "ec", "EC"));
    html.push(btn(sns.instagram, "ig", "Instagram"));
    html.push(btn(sns.facebook, "fb", "Facebook"));
    html.push(btn(sns.x, "x", "X"));
    html.push(btn(sns.line, "line", "Line"));
    return html.join('') ? '<div class="lz-sns">' + html.join('') + '</div>' : '';
  }

  function render(card) {
    var d = card.dataset;
    var title = d.title;
    
    var url = new URL(location.href); url.searchParams.set('id', d.id);
    history.replaceState(null, "", url.pathname + url.search);
    document.title = title + " | " + C.originalTitle;

    var subs = []; try { subs = JSON.parse(d.sub || "[]"); } catch(e) {}
    var gallery = [d.main].concat(subs).filter(Boolean);
    var related = []; try { related = JSON.parse(d.related || "[]"); } catch(e) {}

    MODAL.innerHTML = [
      '<div class="lz-mh">',
      '  <h2 class="lz-mt">' + C.esc(title) + '</h2>',
      '  <div class="lz-actions">',
      '    <button class="lz-btn lz-share-btn"><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg><span class="lz-label">共有</span></button>',
      (window.innerWidth >= 769 ? '    <button class="lz-btn lz-pdf-btn"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span class="lz-label">印刷</span></button>' : ''),
      '    <button class="lz-btn" onclick="lzModal.close()">✕<span class="lz-label">閉じる</span></button>',
      '  </div>',
      '</div>',
      '<div>',
      gallery.length ? '  <div class="lz-mm"><img id="lz-mainimg" src="' + C.esc(gallery[0]) + '" referrerpolicy="no-referrer-when-downgrade"></div>' : '',
      d.lead ? '  <div class="lz-lead-strong">' + C.esc(d.lead) + '</div>' : '',
      d.body ? '  <div class="lz-txt">' + C.esc(d.body) + '</div>' : '',
      gallery.length > 1 ? '  <div class="lz-g">' + gallery.map(function(u, i){ return '<img src="'+C.esc(u)+'" data-idx="'+i+'" class="'+(i===0?'is-active':'')+'">'; }).join('') + '</div>' : '',
      buildInfoTable(d),
      buildSNS(d),
      related.length ? '<div class="lz-related" style="padding:0 16px 16px;">' + related.map(function(r){ return '<div><a href="'+C.esc(r.url)+'" target="_blank">→ '+C.esc(r.title)+'</a></div>'; }).join('') + '</div>' : '',
      '</div>'
    ].join('');

    // イベント紐付け
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

    MODAL.querySelector(".lz-share-btn").onclick = function() {
      var text = C.RED_APPLE + title + C.GREEN_APPLE + "\n" + (d.lead || "") + "\n" + location.href;
      if (navigator.share) navigator.share({ title: title, text: d.lead, url: location.href });
      else {
        var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
        alert("リンクをコピーしました！");
      }
    };

    var pdfBtn = MODAL.querySelector(".lz-pdf-btn");
    if(pdfBtn) pdfBtn.onclick = function() { generatePdf(MODAL, title); };

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

  /* --- 4. 高機能PDF生成ロジック (main.jsより完全移植) --- */
  async function generatePdf(element, title) {
    if(!confirm("PDFを作成して新しいタブで開きますか？")) return;
    try {
      await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js");
      
      var clone = element.cloneNode(true);
      clone.style.width = "800px"; clone.style.maxHeight = "none";
      clone.querySelector(".lz-mh").remove();
      document.body.appendChild(clone);
      
      var qrDiv = document.createElement("div"); 
      new QRCode(qrDiv, { text: location.href, width: 128, height: 128 });
      
      // 画像読み込み完了を待つ
      var imgs = clone.querySelectorAll("img");
      for(var i=0; i<imgs.length; i++) {
        if(!imgs[i].complete) await new Promise(function(r){ imgs[i].onload=r; imgs[i].onerror=r; });
      }

      var canvas = await html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      document.body.removeChild(clone);

      var pdf = new window.jspdf.jsPDF("p", "mm", "a4");
      var margin = 12;
      var pageW = pdf.internal.pageSize.getWidth();
      var pageH = pdf.internal.pageSize.getHeight();
      var imgWmm = pageW - (margin * 2);
      var imgHmm = (canvas.height * imgWmm) / canvas.width;
      
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, margin, imgWmm, imgHmm);
      
      // QRコード追加
      var qrCanvas = qrDiv.querySelector("canvas");
      if(qrCanvas) {
        pdf.addImage(qrCanvas.toDataURL("image/png"), "PNG", pageW - 35, pageH - 35, 25, 25);
      }
      
      pdf.setFontSize(8);
      pdf.text("いいづなりんごポータル | " + title, margin, pageH - 10);
      window.open(pdf.output("bloburl"), "_blank");
    } catch(e) { console.error(e); alert("PDF生成に失敗しました。"); }
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