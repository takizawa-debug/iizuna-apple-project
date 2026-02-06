/**
 * modal.js - 詳細表示・機能コンポーネント (完全無欠版)
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

  var injectStyles = function() {
    if (document.getElementById('lz-modal-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-modal-styles';
    style.textContent = [
      '.lz-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, .35); display: none; align-items: center; justify-content: center; z-index: 9999; }',
      '.lz-backdrop.open { display: flex; }',
      '.lz-shell { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; }',
      '.lz-modal { position: relative; width: min(860px, 92vw); max-height: 88vh; overflow: auto; background: #fff; border: 2px solid var(--apple-red); border-radius: 12px; }',
      '.lz-mh { background: #fff; border-bottom: 1px solid var(--border); padding: 8px 10px; display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; position: sticky; top: 0; z-index: 10; }',
      '.lz-mt { margin: 0; font-weight: 600; font-size: 2.0rem; color: var(--apple-red-strong); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
      '.lz-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--apple-red); background: #fff; border-radius: 999px; padding: .42em .8em; cursor: pointer; color: var(--apple-red); font-weight: 500; line-height: 1; transition: .15s; }',
      '.lz-btn:hover { background: var(--apple-red); color: #fff; }',
      '.lz-mm { position: relative; background: #faf7f5; overflow: hidden; }',
      '.lz-mm::before { content: ""; display: block; padding-top: 56.25%; }',
      '.lz-mm img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; transition: opacity .22s ease; }',
      '.lz-info { margin: 12px 12px 0; width: calc(100% - 24px); border-collapse: separate; border-spacing: 0 6px; }',
      '.lz-info th { width: 9em; font-weight: 600; color: #a82626; background: #fff3f2; text-align: left; border-radius: 8px 0 0 8px; padding: 10px 12px; }',
      '.lz-info td { background: #ffffff; border-radius: 0 8px 8px 0; padding: 10px 12px; word-break: break-word; }',
      '.lz-sns { display: flex; gap: 8px; flex-wrap: wrap; padding: 12px; }',
      '.lz-sns a { width: 36px; height: 36px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #fff; }',
      '.lz-sns a[data-sns="web"] { background: #5b667a; } .lz-sns a[data-sns="ig"] { background: #E4405F; }',
      '.lz-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255, 255, 255, .92); border: 1px solid var(--apple-red); border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 100; }',
      '.lz-prev { left: -60px; } .lz-next { right: -60px; }',
      '@media(max-width:1024px) { .lz-prev, .lz-next { top: auto; bottom: -54px; } .lz-prev { left: calc(50% - 55px); } .lz-next { right: calc(50% - 55px); } }'
    ].join('\n');
    document.head.appendChild(style);
  };

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
    if(!confirm("PDFを作成して新しいタブで開きます。よろしいですか？")) return;
    try {
      await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js");

      var url = window.location.origin + window.location.pathname + "?id=" + encodeURIComponent(cardId);
      var clone = element.cloneNode(true);
      clone.querySelector(".lz-actions").remove();
      clone.style.maxHeight = "none"; clone.style.width = "800px";
      document.body.appendChild(clone);

      var qrDiv = document.createElement("div"); 
      new QRCode(qrDiv, { text: url, width: 128, height: 128 });
      var qrCanvas = qrDiv.querySelector("canvas");

      var canvas = await html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      document.body.removeChild(clone);

      var pdf = new window.jspdf.jsPDF("p", "mm", "a4");
      var margin = 12, pageW = pdf.internal.pageSize.getWidth(), pageH = pdf.internal.pageSize.getHeight();
      var imgData = canvas.toDataURL("image/png"), imgWmm = pageW - margin * 2, imgHmm = canvas.height * imgWmm / canvas.width;
      
      pdf.addImage(imgData, "PNG", margin, margin, imgWmm, imgHmm);
      if(qrCanvas) pdf.addImage(qrCanvas.toDataURL("image/png"), "PNG", pageW - margin - 20, pageH - margin - 25, 20, 20);
      
      var now = new Date();
      var ts = now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes();
      pdf.setFontSize(8);
      pdf.text(ts + " / 1-1", pageW - margin, pageH - 8, {align:"right"});
      
      var jpImg = renderFooterImagePx("本PDFデータは飯綱町産りんごPR事業の一環で作成されました。", C.pt2px(16), "#000");
      pdf.addImage(jpImg.data, "PNG", margin, pageH - 12, 5 / jpImg.ar, 5);
      
      window.open(pdf.output("bloburl"), "_blank");
    } catch(e) { alert("PDF生成失敗"); }
  }

  var HOST, SHELL, MODAL, CARDS = [], IDX = 0;

  function render(card) {
    var d = card.dataset;
    var title = d.title;
    document.title = title + " | " + C.originalTitle;

    var subs = []; try { subs = JSON.parse(d.sub || "[]"); } catch(e){}
    var gallery = [d.main].concat(subs).filter(Boolean);
    var sns = {}; try { sns = JSON.parse(d.sns || "{}"); } catch(e){}

    var rows = [];
    if(d.address) rows.push('<tr><th>住所</th><td>' + C.esc(d.address) + '</td></tr>');
    if(d.hoursCombined) rows.push('<tr><th>営業時間</th><td>' + C.esc(d.hoursCombined) + '</td></tr>');
    if(d.tel) rows.push('<tr><th>問い合わせ</th><td><a href="tel:'+C.esc(d.tel)+'">'+C.esc(d.tel)+'</a></td></tr>');

    MODAL.innerHTML = [
      '<div class="lz-mh"><h2 class="lz-mt">' + C.esc(title) + '</h2><div class="lz-actions">',
      '<button class="lz-btn lz-share">共有</button>',
      (window.innerWidth >= 769 ? '<button class="lz-btn lz-pdf-btn">印刷</button>' : ''),
      '<button class="lz-btn" onclick="lzModal.close()">✕</button></div></div>',
      '<div>' + (gallery.length ? '<div class="lz-mm"><img id="lz-mainimg" src="' + C.esc(gallery[0]) + '"></div>' : '') + '',
      '<div class="lz-lead-strong">' + C.esc(d.lead || "") + '</div>',
      '<div class="lz-txt">' + C.esc(d.body || "") + '</div>',
      (gallery.length > 1 ? '<div class="lz-g">' + gallery.map(function(u, i){ return '<img src="'+C.esc(u)+'" data-idx="'+i+'" class="'+(i===0?'is-active':'')+'">'; }).join('') + '</div>' : '') + '',
      '<table class="lz-info"><tbody>' + rows.join('') + '</tbody></table>',
      '<div class="lz-sns">' + (d.home ? '<a data-sns="web" href="'+C.esc(d.home)+'" target="_blank">'+ICON.web+'</a>' : '') + (sns.instagram ? '<a data-sns="ig" href="'+C.esc(sns.instagram)+'" target="_blank">'+ICON.ig+'</a>' : '') + '</div></div>'
    ].join('');

    MODAL.querySelector(".lz-share").onclick = function() {
      var shareUrl = window.location.origin + window.location.pathname + "?id=" + encodeURIComponent(d.id);
      var payload = C.RED_APPLE + title + C.GREEN_APPLE + "\n" + (d.lead || "") + "\nーーー\n詳しくはこちら\n" + shareUrl + "\n\n#いいづなりんご #飯綱町";
      if(navigator.share) navigator.share({ text: payload });
      else { var ta=document.createElement("textarea"); ta.value=payload; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); alert("コピーしました"); }
    };

    if(MODAL.querySelector(".lz-pdf-btn")) MODAL.querySelector(".lz-pdf-btn").onclick = function(){ generatePdf(MODAL, title, d.id); };

    // 矢印ナビの復元
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

  function open(card) {
    if (!HOST) {
      HOST = document.createElement("div"); HOST.className = "lz-backdrop";
      HOST.innerHTML = '<div class="lz-shell"><div class="lz-modal"></div></div>';
      document.body.appendChild(HOST);
      SHELL = HOST.firstChild; MODAL = SHELL.firstChild;
      HOST.onclick = function(e){ if(e.target === HOST) close(); };
    }
    var track = card.closest(".lz-track");
    CARDS = track ? Array.from(track.querySelectorAll(".lz-card")) : [card];
    IDX = CARDS.indexOf(card);
    render(card);
  }

  function close() { if(HOST) HOST.classList.remove("open"); document.title = C.originalTitle; }

  injectStyles();

  // ★重要: 日本語・記号リンク対応のディープリンク探索
  var checkDeepLink = function() {
    var urlId = new URLSearchParams(location.search).get('id');
    if (!urlId) return;
    var attempts = 0;
    var timer = setInterval(function() {
      // id属性だけでなく、data-id属性で全探索
      var cards = document.querySelectorAll(".lz-card");
      for(var i=0; i<cards.length; i++){
        if(cards[i].dataset.id === urlId){
          clearInterval(timer);
          open(cards[i]);
          return;
        }
      }
      if (++attempts > 100) clearInterval(timer);
    }, 100);
  };

  checkDeepLink();

  return { open: open, close: close };
})();