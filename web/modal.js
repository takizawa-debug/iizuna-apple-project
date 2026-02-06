/**
 * modal.js - 詳細表示・高度な機能コンポーネント (完全無欠版)
 * 役割: モーダルUI、多機能テーブル、SNS連携、精密PDF生成(文字化け対策済)
 */
window.lzModal = (function() {
  "use strict";

  var C = window.LZ_COMMON;
  if (!C) return;

  // アイコン定義 (main.jsより移植)
  var ICON = {
    web:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
    ec:'<svg viewBox="0 0 24 24"><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20 8H6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="19" r="1.6" fill="currentColor"/><circle cx="17" cy="19" r="1.6" fill="currentColor"/></svg>',
    ig:'<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7z"/><path fill="currentColor" d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>',
    fb:'<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13 22v-8h3l1-4h-4V7c0-1.1.9-2 2-2h2V1h-3a5 5 0 0 0-5 5v3H6v4h3v8h4z"/></svg>',
    x:'<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3l8.5 9.7L3.8 21H7l5.2-6.6L17.6 21H21l-9-10.3L20.2 3H17L12 9.2 7.6 3H3z"/></svg>',
    line:'<svg viewBox="0 0 24 24"><path fill="currentColor" d="M6.2 3.5H17.8c2.6 0 4.7 2 4.7 4.6v6.2c0 2.6-2.1 4.6-4.7 4.6H12c-.3 0 -.6.1 -.8.3l-2.9 2.4c-.3.2 -.7 0 -.7 -.4l.2 -2.5c0 -.3 -.2 -.6 -.5 -.7C5.3 17.7 3.5 15.7 3.5 14.3V8.1c0 -2.6 2.1 -4.6 4.7 -4.6Z"/></svg>',
    tt:'<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2h3.2c.2 1.7 1.5 3 3.3 3.3V9c-1.9 -.1 -3.4 -.7 -4.5 -1.8v6.8c0 3 -2.4 5.4 -5.4 5.4S3.2 17 3.2 14s2.4 -5.4 5.4 -5.4c.6 0 1.2 .1 1.7 .3V12c-.3 -.1 -.6 -.2 -1 -.2-1.3 0-2.4 1.1-2.4 2.4S7.9 16.6 9.2 16.6c1.3 0 2.4 -1.1 2.4 -2.4V2z"/></svg>'
  };

  /* ==========================================
     1. CSSの注入 (完全版デザイン)
     ========================================== */
  var injectStyles = function() {
    if (document.getElementById('lz-modal-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-modal-styles';
    style.textContent = [
      '.lz-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, .4); display: none; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }',
      '.lz-backdrop.open { display: flex; }',
      '.lz-shell { position: relative; width: 100%; display: flex; align-items: center; justify-content: center; padding: 20px 0; }',
      '.lz-modal { position: relative; width: min(860px, 94vw); max-height: 90vh; overflow-y: auto; background: #fff; border: 2px solid var(--apple-red); border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }',
      '@media(max-width:768px) { .lz-modal { max-height: 84svh; } }',
      
      /* ヘッダー */
      '.lz-mh { background: #fff; border-bottom: 1px solid var(--border); padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 20; }',
      '.lz-mt { margin: 0; font-weight: 700; font-size: clamp(1.6rem, 4vw, 2.0rem); color: var(--apple-red-strong); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }',
      '.lz-actions { display: flex; gap: 6px; }',
      
      /* ボタン群 */
      '.lz-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--apple-red); background: #fff; border-radius: 999px; padding: 6px 12px; cursor: pointer; color: var(--apple-red); font-weight: 600; transition: .2s; text-decoration: none; font-size: 1.25rem; }',
      '.lz-btn:hover { background: var(--apple-red); color: #fff; }',
      '.lz-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2.5; }',
      '@media (max-width:768px) { .lz-btn .lz-label { display: none; } .lz-btn { width: 36px; height: 36px; padding: 0; } }',

      /* メイン画像・ギャラリー */
      '.lz-mm { position: relative; background: #faf7f5; overflow: hidden; }',
      '.lz-mm::before { content: ""; display: block; padding-top: 56.25%; }',
      '.lz-mm img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; transition: opacity .25s; }',
      '.lz-mm img.lz-fadeout { opacity: 0; }',
      '.lz-g { padding: 12px; display: grid; gap: 8px; grid-template-columns: repeat(5, 1fr); border-top: 1px solid var(--border); }',
      '.lz-g img { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 6px; border: 1px solid var(--border); cursor: pointer; transition: .2s; background: #f9f9f9; }',
      '.lz-g img.is-active { outline: 3px solid var(--apple-red); outline-offset: 2px; }',

      /* 情報テーブル (main.jsのデザイン) */
      '.lz-info { margin: 16px; width: calc(100% - 32px); border-collapse: separate; border-spacing: 0 6px; }',
      '.lz-info th, .lz-info td { padding: 12px; vertical-align: top; border-radius: 8px; font-size: 1.4rem; }',
      '.lz-info th { width: 9em; background: #fff3f2; color: var(--apple-red-strong); font-weight: 700; text-align: left; }',
      '.lz-info td { background: #fafafa; color: #1b1b1b; line-height: 1.6; }',
      '.lz-info a { color: var(--apple-green); font-weight: 700; text-decoration: underline; }',
      '@media (max-width:768px) { .lz-info th, .lz-info td { display: block; width: auto; } .lz-info th { border-radius: 8px 8px 0 0; } .lz-info td { border-radius: 0 0 8px 8px; border-top: 1px dashed #eee; } }',

      /* SNSアイコン */
      '.lz-sns { display: flex; gap: 10px; flex-wrap: wrap; padding: 0 16px 16px; }',
      '.lz-sns a { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; color: #fff; transition: .2s; }',
      '.lz-sns a svg { width: 20px; height: 20px; fill: currentColor; }',
      '.lz-sns a:hover { transform: translateY(-2px); filter: brightness(1.1); }',

      /* テキスト装飾 */
      '.lz-lead-strong { padding: 16px 16px 0; font-weight: 800; font-size: 1.7rem; color: #1b1b1b; line-height: 1.5; }',
      '.lz-txt { padding: 16px; font-size: 1.5rem; color: #444; line-height: 1.8; white-space: pre-wrap; }',
      '.lz-related { padding: 0 16px 16px; font-size: 1.4rem; }',
      '.lz-related div { margin-top: 6px; }',
      '.lz-related a { color: var(--apple-red); font-weight: 700; text-decoration: none; }',

      /* 前後ナビ */
      '.lz-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.9); border: 1px solid var(--apple-red); border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 100; box-shadow: 0 4px 15px rgba(0,0,0,0.15); transition: .2s; }',
      '.lz-arrow svg { width: 24px; height: 24px; stroke: var(--apple-red); stroke-width: 3; fill: none; }',
      '.lz-arrow:hover { background: var(--apple-red); } .lz-arrow:hover svg { stroke: #fff; }',
      '.lz-prev { left: -60px; } .lz-next { right: -60px; }',
      '@media(max-width:1024px) { .lz-prev, .lz-next { top: auto; bottom: -65px; } .lz-prev { left: calc(50% - 65px); } .lz-next { right: calc(50% - 65px); } }'
    ].join('\n');
    document.head.appendChild(style);
  };

  /* ==========================================
     2. ロジックコア
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

  // テーブルビルダー (main.jsから完全移植)
  function buildInfoTableHTML(d) {
    var rows = [];
    if (d.address) rows.push('<tr><th>住所</th><td>' + C.esc(d.address) + '</td></tr>');
    if (d.bizDays) rows.push('<tr><th>営業曜日</th><td>' + C.esc(d.bizDays) + '</td></tr>');
    if (d.holiday) rows.push('<tr><th>定休日</th><td>' + C.esc(d.holiday) + '</td></tr>');
    if (d.hoursCombined) rows.push('<tr><th>営業時間</th><td>' + C.esc(d.hoursCombined) + '</td></tr>');
    if (d.fee) rows.push('<tr><th>料金/参加費</th><td>' + C.esc(d.fee) + '</td></tr>');
    if (d.target) rows.push('<tr><th>対象</th><td>' + C.esc(d.target) + '</td></tr>');
    
    var links = [];
    if (d.form) links.push('<a href="' + C.esc(d.form) + '" target="_blank">予約フォーム</a>');
    if (d.tel) links.push('<a href="tel:' + C.esc(d.tel) + '">' + C.esc(d.tel) + '</a>');
    if (links.length) rows.push('<tr><th>問い合わせ</th><td>' + links.join(' / ') + '</td></tr>');

    return rows.length ? '<table class="lz-info"><tbody>' + rows.join('') + '</tbody></table>' : "";
  }

  // SNSアイコンビルダー (main.jsから完全移植)
  function buildSNSHTML(d) {
    var sns = {}; try { sns = JSON.parse(d.sns || "{}"); } catch(e) {}
    var btns = [];
    var addBtn = function(url, key, color) {
      if(!url) return;
      btns.push('<a href="'+C.esc(url)+'" target="_blank" data-sns="'+key+'" style="background:'+color+'">'+ICON[key]+'</a>');
    };
    addBtn(d.home, "web", "#5b667a");
    addBtn(d.ec, "ec", "#0ea5e9");
    addBtn(sns.instagram, "ig", "#E4405F");
    addBtn(sns.facebook, "fb", "#1877F2");
    addBtn(sns.x, "x", "#000");
    addBtn(sns.line, "line", "#06C755");
    return btns.length ? '<div class="lz-sns">' + btns.join('') + '</div>' : "";
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
      '    <button class="lz-btn lz-pdf-btn"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span class="lz-label">印刷</span></button>',
      '    <button class="lz-btn" onclick="lzModal.close()"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span class="lz-label">閉じる</span></button>',
      '  </div>',
      '</div>',
      '<div class="lz-body-inner">',
      gallery.length ? '  <div class="lz-mm"><img id="lz-mainimg" src="' + C.esc(gallery[0]) + '" referrerpolicy="no-referrer-when-downgrade"></div>' : '',
      '  <div class="lz-lead-strong">' + C.esc(d.lead || "") + '</div>',
      '  <div class="lz-txt">' + C.esc(d.body || "") + '</div>',
      gallery.length > 1 ? '  <div class="lz-g">' + gallery.map(function(u, i){ return '<img src="'+C.esc(u)+'" data-idx="'+i+'" class="'+(i===0?'is-active':'')+'">'; }).join('') + '</div>' : '',
      buildInfoTableHTML(d),
      buildSNSHTML(d),
      related.length ? '<div class="lz-related">' + related.map(function(r){ return '<div><a href="'+C.esc(r.url)+'" target="_blank">→ '+C.esc(r.title)+'</a></div>'; }).join('') + '</div>' : '',
      '</div>'
    ].join('');

    // 画像切替ロジック
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

    // 共有・PDF・矢印の制御は ensureModal 内ではなく render 毎に行う
    MODAL.querySelector(".lz-share-btn").onclick = function() {
      var text = C.RED_APPLE + title + C.GREEN_APPLE + "\n" + (d.lead || "") + "\n" + location.href;
      if (navigator.share) navigator.share({ title: title, text: d.lead, url: location.href });
      else {
        var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
        alert("紹介文をコピーしました！");
      }
    };

    MODAL.querySelector(".lz-pdf-btn").onclick = function() { generatePdf(MODAL, title); };

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

  /* ==========================================
     3. 精密PDF生成 (文字化け対策済・完全移植)
     ========================================== */
  // 日本語フッターをCanvasで描画する補助関数 (main.jsより移植)
  function renderFooterImagePx(text, px, color) {
    var scale = 2, w = 1200, h = Math.round(px * 2.4);
    var canvas = document.createElement("canvas"); canvas.width = w * scale; canvas.height = h * scale;
    var ctx = canvas.getContext("2d"); ctx.scale(scale, scale);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = color; ctx.font = px + 'px "Noto Sans JP", sans-serif'; ctx.textBaseline = "middle";
    ctx.fillText(text, 2, h / 2);
    return { data: canvas.toDataURL("image/png"), ar: h / w };
  }

  async function generatePdf(element, title) {
    if(!confirm("PDFを作成して新しいタブで開きますか？")) return;
    try {
      await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js");

      var clone = element.cloneNode(true);
      clone.style.width = "800px"; clone.style.maxHeight = "none";
      clone.querySelector(".lz-mh").remove();
      clone.querySelectorAll("img").forEach(function(img){ img.setAttribute("referrerpolicy","no-referrer-when-downgrade"); });
      document.body.appendChild(clone);

      // QRコード生成
      var qrDiv = document.createElement("div"); 
      new QRCode(qrDiv, { text: location.href, width: 128, height: 128 });
      await new Promise(function(r){ setTimeout(r, 300); });
      var qrCanvas = qrDiv.querySelector("canvas"), qrData = qrCanvas ? qrCanvas.toDataURL("image/png") : "";

      var canvas = await html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      document.body.removeChild(clone);

      var pdf = new window.jspdf.jsPDF("p", "mm", "a4");
      var margin = 12, pW = pdf.internal.pageSize.getWidth(), pH = pdf.internal.pageSize.getHeight();
      var innerW = pW - margin * 2, innerH = pH - margin * 2;
      
      var imgData = canvas.toDataURL("image/png");
      var imgWmm = innerW, imgHmm = (canvas.height * imgWmm) / canvas.width;

      // フッター画像化 (文字化け防止)
      var jpImg = renderFooterImagePx("本PDFデータは飯綱町産りんごPR事業の一環で作成されました。", 16, "#333");
      var footerH = C.pt2mm(16), footerW = footerH / jpImg.ar;

      pdf.addImage(imgData, "PNG", margin, margin, imgWmm, imgHmm);
      if(qrData) pdf.addImage(qrData, "PNG", pW - margin - 20, pH - margin - 20, 20, 20);
      pdf.addImage(jpImg.data, "PNG", margin, pH - margin - 5, footerW, footerH);
      
      pdf.setFontSize(8);
      pdf.text(new Date().toLocaleString() + " | " + title, pW - margin, pH - margin + 2, { align: "right" });

      window.open(pdf.output("bloburl"), "_blank");
    } catch(e) { console.error(e); alert("PDF生成に失敗しました。"); }
  }

  /* ==========================================
     4. 初期化
     ========================================== */
  injectStyles();

  var checkDeepLink = function() {
    var id = new URLSearchParams(location.search).get('id');
    if (!id) return;
    var attempts = 0;
    var timer = setInterval(function() {
      var card = document.getElementById(id);
      if (card) { clearInterval(timer); window.lzModal.open(card); }
      if (++attempts > 80) clearInterval(timer);
    }, 100);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", checkDeepLink);
  else checkDeepLink();

  return { 
    open: function(card) { ensureModal(); render(card); },
    close: close
  };
})();