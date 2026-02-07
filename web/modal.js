/**
 * modal.js - 詳細表示・機能コンポーネント (グローバル検索 & 優先順位色分け Edition)
 * 役割: 既存機能を100%維持。モーダル起動は即座に行い、キーワードクリック時のみ全データから多言語検索を行う。
 */
window.lzModal = (function() {
  "use strict";

  var C = window.LZ_COMMON;
  if (!C) return;

  // ==========================================
  // 【共通設定】自動でリンクを有効にしたい単語リスト
  // ==========================================
  var MASTER_TAGS = [
    "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月", "4月", "5月", "6月", "7月",
    "北信五岳", "移住", "子育て", "ふじ", "高坂りんご", "ブラムリー", "サンふじ",
    "シードル", "アップルミュージアム", "アクセス", "歴史", "機能性成分", "プロシアニジン", "甘みと酸味のバランス"
  ];

  var MODAL_ACTIVE_LANG = null;
  var ORIGINAL_SITE_LANG = null;

  var ICON = {
    web:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    ec:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20 8H6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="19" r="1.6" fill="currentColor"/><circle cx="17" cy="19" r="1.6" fill="currentColor"/></svg>`,
    ig:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7z"/><path fill="currentColor" d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>`,
    fb:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13 22v-8h3l1-4h-4V7c0-1.1.9-2 2-2h2V1h-3a5 5 0 0 0-5 5v3H6v4h3v8h4z"/></svg>`,
    x:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 3l8.5 9.7L3.8 21H7l5.2-6.6L17.6 21H21l-9-10.3L20.2 3H17L12 9.2 7.6 3H3z"/></svg>`,
    line:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M6.2 3.5H17.8c2.6 0 4.7 2 4.7 4.6v6.2c0 2.6-2.1 4.6-4.7 4.6H12c-.3 0 -.6.1 -.8.3l-2.9 2.4c-.3.2 -.7 0 -.7 -.4l.2 -2.5c0 -.3 -.2 -.6 -.5 -.7C5.3 17.7 3.5 15.7 3.5 14.3V8.1c0 -2.6 2.1 -4.6 4.7 -4.6Z"/></svg>`,
    tt:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2h3.2c.2 1.7 1.5 3 3.3 3.3V9c-1.9 -.1 -3.4 -.7 -4.5 -1.8v6.8c0 3 -2.4 5.4 -5.4 5.4S3.2 17 3.2 14s2.4 -5.4 5.4 -5.4c.6 0 1.2 .1 1.7 .3V12c-.3 -.1 -.6 -.2 -1 -.2-1.3 0-2.4 1.1-2.4 2.4S7.9 16.6 9.2 16.6c1.3 0 2.4 -1.1 2.4 -2.4V2z"/></svg>`
  };

  var injectStyles = function() {
    if (document.getElementById('lz-modal-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-modal-styles';
    style.textContent = [
      '.lz-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, .35); display: none; align-items: center; justify-content: center; z-index: 20000; }',
      '.lz-backdrop.open { display: flex; }',
      '.lz-shell { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }',
      '.lz-modal { position: relative; width: min(860px, 92vw); max-height: 88vh; overflow: auto; background: #fff; border: 2px solid #cf3a3a; border-radius: 12px; z-index: 20001; }',
      '.lz-mh { background: #fff; border-bottom: 1px solid #eee; padding: 8px 10px; display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; position: sticky; top: 0; z-index: 10; }',
      '.lz-mt { margin: 0; font-weight: 600; font-size: 1.8rem; color: #a82626; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
      '.lz-actions { display: flex; gap: 6px; align-items: center; }',
      '.lz-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid #cf3a3a; background: #fff; border-radius: 999px; padding: .45em .9em; cursor: pointer; color: #cf3a3a; font-weight: 600; font-size: 1.15rem; line-height: 1; transition: .2s; }',
      '.lz-btn:hover { background: #cf3a3a; color: #fff; }',
      '.lz-btn.active { background: #cf3a3a; color: #fff; }',
      '.lz-btn svg { width: 18px; height: 18px; stroke-width: 2.5; }',
      '@media (max-width:768px) { .lz-btn { width: 38px; height: 38px; padding: 0; } .lz-btn .lz-label { display: none; } }',
      '.lz-m-lang-tabs { display: flex; gap: 4px; padding: 10px 15px; background: #fdfaf8; border-bottom: 1px solid #eee; }',
      '.lz-m-lang-btn { padding: 4px 12px; border-radius: 6px; font-size: 1rem; font-weight: 700; cursor: pointer; border: 1px solid #ddd; background: #fff; color: #888; transition: .2s; }',
      '.lz-m-lang-btn.active { background: #cf3a3a; color: #fff; border-color: #cf3a3a; }',
      '.lz-mm { position: relative; background: #faf7f5; overflow: hidden; }',
      '.lz-mm img { position: absolute; inset: 0; max-width: 100%; max-height: 100%; margin: auto; object-fit: contain; transition: opacity .22s ease; }',
      '.lz-mm img.lz-fadeout { opacity: 0; }',
      '.lz-lead-strong { padding: 15px 15px 0; font-weight: 700; font-size: 1.55rem; line-height: 1.6; color: #222; }',
      '.lz-txt { padding: 15px; font-size: 1.45rem; color: #444; line-height: 1.8; white-space: pre-wrap; }',
      /* オートリンク色分け */
      '.lz-auto-link { text-decoration: underline; font-weight: 700; cursor: pointer; padding: 0 1px; border-radius: 2px; }',
      '.lz-auto-link.direct { color: #cf3a3a; } /* 赤：タイトル直行 */',
      '.lz-auto-link.search { color: #27ae60; } /* 緑：キーワード検索 */',
      '.lz-auto-link:hover { background: #f5f5f5; }',
      /* 検索結果・ハイライトデザイン */
      '.lz-s-wrap { padding: 25px; } .lz-s-title { font-size: 1.4rem; font-weight: 800; color: #333; margin-bottom: 20px; border-left: 4px solid #27ae60; padding-left: 10px; }',
      '.lz-s-item { padding: 18px; background: #fff; border: 1px solid #eee; border-radius: 12px; margin-bottom: 12px; cursor: pointer; transition: .2s; }',
      '.lz-s-item:hover { border-color: #27ae60; background: #f9fffb; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }',
      '.lz-s-item-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }',
      '.lz-s-cat { font-size: 0.8rem; color: #fff; background: #27ae60; padding: 2px 8px; border-radius: 4px; font-weight: 800; flex-shrink: 0; }',
      '.lz-s-name { font-weight: 800; font-size: 1.3rem; color: #cf3a3a; }',
      '.lz-s-body { font-size: 1rem; color: #666; line-height: 1.5; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }',
      '.lz-s-item mark { background: #fff566; color: inherit; font-weight: 700; padding: 0 2px; border-radius: 2px; }',
      '.lz-info { margin: 15px; width: calc(100% - 30px); border-collapse: separate; border-spacing: 0 4px; }',
      '.lz-info th { width: 9em; font-weight: 700; color: #a82626; background: #fff1f0; text-align: left; border-radius: 8px 0 0 8px; padding: 12px; font-size: 1.2rem; border: 1px solid #fce4e2; border-right: none; }',
      '.lz-info td { background: #fff; border-radius: 0 8px 8px 0; padding: 12px; border: 1px solid #eee; font-size: 1.25rem; }',
      '.lz-sns { display: flex; gap: 10px; flex-wrap: wrap; padding: 15px; }',
      '.lz-sns a { width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #fff; transition: transform .2s; }',
      '.lz-sns a:hover { transform: scale(1.1); }',
      '.lz-sns a svg { width: 22px; height: 22px; }',
      '.lz-sns a[data-sns="web"] { background: #5b667a; } .lz-sns a[data-sns="ec"] { background: #e67e22; }',
      '.lz-sns a[data-sns="ig"] { background: #E4405F; } .lz-sns a[data-sns="fb"] { background: #1877F2; }',
      '.lz-sns a[data-sns="x"] { background: #000; } .lz-sns a[data-sns="line"] { background: #06C755; } .lz-sns a[data-sns="tt"] { background: #000; }',
      '.lz-g { padding: 0 15px 15px; display: grid; gap: 10px; grid-template-columns: repeat(5, 1fr); }',
      '.lz-g img { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 8px; border: 1px solid #eee; cursor: pointer; transition: opacity .2s; }',
      '.lz-g img.is-active { outline: 3px solid #cf3a3a; outline-offset: 2px; }',
      '.lz-related { padding: 15px; background: #fafafa; border-top: 1px solid #eee; border-radius: 0 0 12px 12px; }',
      '.lz-related-label { font-size: 1.1rem; color: #888; font-weight: 800; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }',
      '.lz-related-item a { display: block; color: #cf3a3a; text-decoration: none; font-weight: 700; padding: 10px 0; font-size: 1.35rem; border-bottom: 1px dashed #ddd; transition: .2s; }',
      '.lz-related-item a:hover { background: #fff5f5; padding-left: 8px; }',
      '.lz-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255, 255, 255, .96); border: 1px solid #cf3a3a; border-radius: 50%; width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 21000; box-shadow: 0 6px 20px rgba(0,0,0,0.15); transition: .2s; }',
      '.lz-arrow svg { width: 28px; height: 28px; stroke: #cf3a3a; stroke-width: 3.5; fill: none; }',
      '.lz-arrow:hover { background: #cf3a3a; } .lz-arrow:hover svg { stroke: #fff; }',
      '.lz-prev { left: -75px; } .lz-next { right: -75px; }',
      '@media(max-width:1080px) { .lz-prev { left: 10px; } .lz-next { right: 10px; } }',
      '@media(max-width:768px) { .lz-prev, .lz-next { top: auto; bottom: -68px; left: 50%; transform: none; } .lz-prev { transform: translateX(-120%); } .lz-next { transform: translateX(20%); } }'
    ].join('\n');
    document.head.appendChild(style);
  };

  function getTranslation(key, targetLang) {
    var dict = window.LZ_CONFIG.LANG.I18N[targetLang] || window.LZ_CONFIG.LANG.I18N['ja'];
    return dict[key] || key;
  }

  /* 検索機能: 全データ(window.LZ_DATA)を多言語解決(C.L)して検索。起点記事を除外。 */
  async function renderSearchResults(keyword, targetLang) {
    MODAL.innerHTML = '<div style="padding:40px; text-align:center;">'+getTranslation('検索しています...', targetLang)+'</div>';
    
    // データがなければ取得を試みる
    if (!window.LZ_DATA) {
      try { window.LZ_DATA = await C.NET.json(window.LZ_CONFIG.ENDPOINT); } catch(e) { console.error(e); }
    }
    
    var allData = window.LZ_DATA || [];
    var results = [];
    var seenIds = new Set(); 
    var currentArticleId = CURRENT_CARD ? CURRENT_CARD.dataset.id : "";

    allData.forEach(function(item) {
      if (item.id === currentArticleId || seenIds.has(item.id)) return; // 起点記事と重複を除外

      // システム標準 C.L を使用して言語を解決
      var title = C.L(item, 'title', targetLang) || "";
      var lead = C.L(item, 'lead', targetLang) || "";
      var body = C.L(item, 'body', targetLang) || "";
      var l1 = C.L(item, 'l1', targetLang) || "";
      var l2 = C.L(item, 'l2', targetLang) || "";

      // 検索対象: タイトル・リード・本文
      if (title.includes(keyword) || lead.includes(keyword) || body.includes(keyword)) {
        seenIds.add(item.id);
        var combined = lead + " " + body;
        var idx = combined.indexOf(keyword);
        var start = Math.max(0, idx - 25);
        var snippet = (start > 0 ? "..." : "") + combined.substring(start, start + 70) + (combined.length > start + 70 ? "..." : "");
        results.push({ id: item.id, title: title, body: snippet, cat: (l1 + " / " + l2), l1: item.l1 });
      }
    });

    var hl = function(text) { return text.split(keyword).join('<mark>' + keyword + '</mark>'); };

    var html = '<div class="lz-s-wrap"><div class="lz-s-title">「' + C.esc(keyword) + '」に関連する情報</div>';
    if(results.length === 0) html += '<div style="padding:20px;">' + getTranslation('見つかりませんでした', targetLang) + '</div>';
    else results.forEach(function(res) {
      html += '<div class="lz-s-item" data-goto-id="' + res.id + '" data-l1="' + res.l1 + '">';
      html += '<div class="lz-s-item-head"><span class="lz-s-cat">' + C.esc(res.cat) + '</span><span class="lz-s-name">' + hl(C.esc(res.title)) + '</span></div>';
      html += '<div class="lz-s-body">' + hl(C.esc(res.body)) + '</div></div>';
    });
    html += '<button class="lz-btn" style="margin-top:20px; width:100%; border-color:#27ae60; color:#27ae60;" onclick="lzModal.backToCurrent()">← 記事に戻る</button></div>';

    MODAL.innerHTML = html;
    MODAL.querySelectorAll('.lz-s-item').forEach(function(item) {
      item.onclick = function() {
        var cardInDom = document.querySelector('.lz-card[data-id="'+item.dataset.gotoId+'"]');
        if(cardInDom) render(cardInDom, targetLang);
        else {
          // 他ページにある場合は遷移
          var menuUrl = window.LZ_CONFIG.MENU_URL[item.dataset.l1] || location.origin;
          location.href = menuUrl + "?lang=" + targetLang + "&id=" + encodeURIComponent(item.dataset.gotoId);
        }
      };
    });
    MODAL.scrollTop = 0;
  }

  /* オートリンク機能: 赤(直行)優先 ＆ トークナイザーによる多重置換防止 */
  function applyAutoLinks(text, currentId, targetLang) {
    var cardsInDom = document.querySelectorAll('.lz-card');
    var map = {}; 

    // 1. まずキーワード(緑)を登録
    MASTER_TAGS.forEach(function(tag) { if (tag.length > 1) map[tag] = { word: tag, type: 'search' }; });

    // 2. DOM上の他記事タイトル(赤)を登録（被った場合はこちらで上書き＝赤優先）
    cardsInDom.forEach(function(card) {
      try {
        var data = JSON.parse(card.dataset.item || "{}");
        var title = C.L(data, 'title', targetLang);
        if (title && title.length > 1 && card.dataset.id !== currentId) {
          map[title] = { word: title, id: card.dataset.id, type: 'direct' };
        }
      } catch(e) {}
    });

    var candidates = Object.values(map).sort(function(a, b) { return b.word.length - a.word.length; });
    var escaped = C.esc(text);
    var tokens = [];
    candidates.forEach(function(item, idx) {
      var regex = new RegExp(item.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      escaped = escaped.replace(regex, function(match) {
        var token = "###LZT_" + idx + "###";
        tokens[idx] = item.type === 'direct' 
          ? '<span class="lz-auto-link direct" data-goto-id="'+item.id+'">'+match+'</span>'
          : '<span class="lz-auto-link search" data-keyword="'+item.word+'">'+match+'</span>';
        return token;
      });
    });
    tokens.forEach(function(html, idx) { if(html) escaped = escaped.replace(new RegExp("###LZT_" + idx + "###", "g"), html); });
    return escaped;
  }

  /* PDF・基本機能 (既存維持) */
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
    var confirmMsg = getTranslation("PDFを作成して新しいタブで開きます。よろしいですか？", MODAL_ACTIVE_LANG);
    if(!confirm(confirmMsg)) return;
    try {
      if (!window.jspdf) await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      if (!window.html2canvas) await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      if (!window.QRCode) await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js");
      var qrUrl = window.location.origin + window.location.pathname + "?lang=" + MODAL_ACTIVE_LANG + "&id=" + encodeURIComponent(cardId);
      var clone = element.cloneNode(true);
      clone.querySelector(".lz-actions").remove();
      if(clone.querySelector(".lz-m-lang-tabs")) clone.querySelector(".lz-m-lang-tabs").remove();
      clone.style.maxHeight = "none"; clone.style.height = "auto"; clone.style.width = "800px";
      clone.querySelectorAll("img").forEach(function(img){ img.setAttribute("referrerpolicy","no-referrer-when-downgrade"); });
      document.body.appendChild(clone);
      var qrDiv = document.createElement("div"); 
      new QRCode(qrDiv, { text: qrUrl, width: 128, height: 128, correctLevel: QRCode.CorrectLevel.L });
      var qrCanvas = qrDiv.querySelector("canvas");
      var qrData = qrCanvas ? qrCanvas.toDataURL("image/png") : "";
      var canvas = await html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      document.body.removeChild(clone);
      var { jsPDF } = window.jspdf;
      var pdf = new jsPDF("p", "mm", "a4");
      var margin = 12, pageW = pdf.internal.pageSize.getWidth(), pageH = pdf.internal.pageSize.getHeight(), innerW = pageW - margin * 2, innerH = pageH - margin * 2;
      var imgData = canvas.toDataURL("image/png");
      var imgWmm = innerW, imgHmm = canvas.height * imgWmm / canvas.width;
      var totalPages = Math.max(1, Math.ceil(imgHmm / innerH));
      var heightLeft = imgHmm, position = margin, pageCount = 1;
      while(heightLeft > 0) {
        pdf.addImage(imgData, "PNG", margin, position, imgWmm, imgHmm);
        if(qrData){ var qSize = 22; pdf.addImage(qrData, "PNG", pageW - margin - qSize, pageH - margin - qSize - 3, qSize, qSize); }
        var footerText = getTranslation("本PDFデータは飯綱町産りんごPR事業の一環で作成されました。", MODAL_ACTIVE_LANG);
        var jpImg = renderFooterImagePx(footerText, 18, "#000");
        var footerH = 8; pdf.addImage(jpImg.data, "PNG", margin, pageH - margin - 2, footerH / jpImg.ar, footerH);
        var now = new Date(); var ts = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + " " + now.getHours() + ":" + ("0" + now.getMinutes()).slice(-2);
        var tsFull = ts + " / " + pageCount + "/" + totalPages;
        pdf.setFontSize(11); var tsWidth = pdf.getTextWidth(tsFull); pdf.text(tsFull, pageW - margin - tsWidth, pageH - margin +4);
        heightLeft -= innerH; if(heightLeft > 0) { pdf.addPage(); position = margin - (imgHmm - heightLeft); pageCount++; }
      }
      window.open(pdf.output("bloburl"), "_blank");
    } catch(e) { console.error(e); alert(getTranslation("PDF生成に失敗しました。", MODAL_ACTIVE_LANG)); }
  }

  /* モーダル制御 */
  var HOST, SHELL, MODAL, CARDS = [], IDX = 0, CURRENT_CARD = null;

  function render(card, targetLang) {
    if (!card) return;
    CURRENT_CARD = card;
    var d = card.dataset;
    MODAL_ACTIVE_LANG = targetLang || MODAL_ACTIVE_LANG || window.LZ_CURRENT_LANG;
    var rawData = {};
    try { rawData = JSON.parse(d.item || "{}"); } catch(e) { rawData = { title: d.title, lead: d.lead, body: d.body, l3: d.group }; }
    
    // システム標準 C.L を使用して、多言語階層から正確に取得
    var title = C.L(rawData, 'title', MODAL_ACTIVE_LANG);
    var lead = C.L(rawData, 'lead', MODAL_ACTIVE_LANG);
    var bodyText = C.L(rawData, 'body', MODAL_ACTIVE_LANG);
    
    // モーダルを開く処理は同期(即座)に行い、リンク生成だけを差し込む
    var linkedBody = applyAutoLinks(bodyText, d.id, MODAL_ACTIVE_LANG);
    var url = new URL(window.location.href);
    url.searchParams.set('lang', MODAL_ACTIVE_LANG); url.searchParams.set('id', d.id);
    window.history.replaceState(null, "", url.toString());
    document.title = title + " | " + C.originalTitle;
    var gallery = [d.main].concat(JSON.parse(d.sub || "[]")).filter(Boolean);
    var rows = [];
    var fields = [
      {k:'address', l:getTranslation('住所', MODAL_ACTIVE_LANG)}, {k:'bizDays', l:getTranslation('営業曜日', MODAL_ACTIVE_LANG)}, 
      {k:'holiday', l:getTranslation('定休日', MODAL_ACTIVE_LANG)}, {k:'hoursCombined', l:getTranslation('営業時間', MODAL_ACTIVE_LANG)}, 
      {k:'eventDate', l:getTranslation('開催日', MODAL_ACTIVE_LANG)}, {k:'eventTime', l:getTranslation('開催時間', MODAL_ACTIVE_LANG)},
      {k:'fee', l:getTranslation('参加費', MODAL_ACTIVE_LANG)}, {k:'note', l:getTranslation('備考', MODAL_ACTIVE_LANG)}
    ];
    for(var i=0; i<fields.length; i++) if(d[fields[i].k] && d[fields[i].k].trim() !== "") rows.push('<tr><th>' + fields[i].l + '</th><td>' + C.esc(d[fields[i].k]) + '</td></tr>');
    var sns = JSON.parse(d.sns || "{}");
    var snsHtml = [];
    var addSns = function(url, key) { if(url && url.trim() !== "") snsHtml.push('<a data-sns="'+key+'" href="'+C.esc(url)+'" target="_blank">'+ICON[key]+'</a>'); };
    addSns(d.home, "web"); addSns(d.ec, "ec"); addSns(sns.instagram, "ig"); addSns(sns.facebook, "fb");
    var langTabs = '<div class="lz-m-lang-tabs">' + window.LZ_CONFIG.LANG.SUPPORTED.map(function(l){
        var label = window.LZ_CONFIG.LANG.LABELS[l]; return '<div class="lz-m-lang-btn '+(l === MODAL_ACTIVE_LANG ? 'active' : '')+'" data-lang="'+l+'">'+label+'</div>';
      }).join('') + '</div>';

    MODAL.innerHTML = [
      '<div class="lz-mh"><h2 class="lz-mt">' + C.esc(title) + '</h2><div class="lz-actions"><button class="lz-btn lz-share"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg><span class="lz-label">' + getTranslation('共有', MODAL_ACTIVE_LANG) + '</span></button>',
      (window.innerWidth >= 769 ? '    <button class="lz-btn lz-pdf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span class="lz-label">' + getTranslation('印刷', MODAL_ACTIVE_LANG) + '</span></button>' : ''),
      '    <button class="lz-btn" onclick="lzModal.close()">✕<span class="lz-label">' + getTranslation('閉じる', MODAL_ACTIVE_LANG) + '</span></button></div></div>',
      langTabs, '<div>', (gallery.length ? '  <div class="lz-mm"><img id="lz-mainimg" src="' + C.esc(gallery[0]) + '" referrerpolicy="no-referrer-when-downgrade"></div>' : ''),
      (lead ? '  <div class="lz-lead-strong">' + C.esc(lead) + '</div>' : ''), '  <div class="lz-txt">' + linkedBody + '</div>',
      (gallery.length > 1 ? '  <div class="lz-g">' + gallery.map(function(u, i){ return '<img src="'+C.esc(u)+'" data-idx="'+i+'" class="'+(i===0?'is-active':'')+'">'; }).join('') + '</div>' : ''),
      (rows.length ? '  <table class="lz-info"><tbody>' + rows.join('') + '</tbody></table>' : ''),
      (snsHtml.length ? '  <div class="lz-sns">' + snsHtml.join('') + '</div>' : ''), '</div>'
    ].join('');

    MODAL.querySelectorAll('.lz-auto-link').forEach(function(el) {
      el.onclick = function() { 
        if(el.dataset.gotoId) render(document.querySelector('.lz-card[data-id="'+el.dataset.gotoId+'"]'), MODAL_ACTIVE_LANG); 
        else if(el.dataset.keyword) renderSearchResults(el.dataset.keyword, MODAL_ACTIVE_LANG); 
      };
    });
    MODAL.querySelectorAll('.lz-m-lang-btn').forEach(function(btn){ btn.onclick = function(){ render(card, btn.dataset.lang); }; });
    var pdfBtnEl = MODAL.querySelector(".lz-pdf"); if(pdfBtnEl) { pdfBtnEl.onclick = function(){ generatePdf(MODAL, title, d.id); }; }
    MODAL.querySelector(".lz-share").onclick = function() {
      var shareUrl = window.location.origin + window.location.pathname + "?lang=" + MODAL_ACTIVE_LANG + "&id=" + encodeURIComponent(d.id);
      var payload = C.RED_APPLE + title + C.GREEN_APPLE + "\n" + (lead || "") + "\nーーー\n" + getTranslation('詳しくはこちら', MODAL_ACTIVE_LANG) + "\n" + shareUrl;
      if(navigator.share) navigator.share({ text: payload }); else { var ta=document.body.appendChild(document.createElement("textarea")); ta.value=payload; ta.select(); document.execCommand("copy"); document.body.removeChild(ta); alert(getTranslation("共有テキストをコピーしました！", MODAL_ACTIVE_LANG)); }
    };
    var mainImg = MODAL.querySelector("#lz-mainimg"); var thumbs = MODAL.querySelector(".lz-g");
    if(thumbs && mainImg) {
      thumbs.onclick = function(e) {
        var img = e.target.closest("img"); if(!img) return;
        mainImg.classList.add("lz-fadeout");
        setTimeout(function(){ mainImg.src = gallery[img.dataset.idx]; mainImg.onload = function(){ mainImg.classList.remove("lz-fadeout"); }; var all = thumbs.querySelectorAll("img"); for(var j=0; j<all.length; j++) all[j].classList.toggle("is-active", j == img.dataset.idx); }, 200);
      };
    }
    SHELL.querySelectorAll(".lz-arrow").forEach(function(a){ a.remove(); });
    if (CARDS.length > 1) {
      var p = SHELL.appendChild(document.createElement("button")); p.className = "lz-arrow lz-prev"; p.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>';
      var n = SHELL.appendChild(document.createElement("button")); n.className = "lz-arrow lz-next"; n.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>';
      p.onclick = function(e){ e.stopPropagation(); IDX = (IDX - 1 + CARDS.length) % CARDS.length; render(CARDS[IDX], MODAL_ACTIVE_LANG); };
      n.onclick = function(e){ e.stopPropagation(); IDX = (IDX + 1) % CARDS.length; render(CARDS[IDX], MODAL_ACTIVE_LANG); };
    }
    HOST.classList.add("open"); MODAL.scrollTop = 0;
  }

  function close() { if(HOST) HOST.classList.remove("open"); document.title = C.originalTitle; var url = new URL(location.href); url.searchParams.delete('id'); url.searchParams.set('lang', ORIGINAL_SITE_LANG); window.history.replaceState(null, "", url.toString()); MODAL_ACTIVE_LANG = null; }

  var checkDeepLink = function() {
    var rawId = new URLSearchParams(location.search).get('id'); if (!rawId) return;
    var urlId = decodeURIComponent(rawId).trim(); var attempts = 0;
    var timer = setInterval(function() {
      var cards = document.querySelectorAll(".lz-card");
      for(var i=0; i<cards.length; i++){ if(decodeURIComponent(cards[i].dataset.id).trim() === urlId){ clearInterval(timer); window.lzModal.open(cards[i]); return; } }
      if (++attempts > 100) clearInterval(timer);
    }, 150);
  };

  injectStyles();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", checkDeepLink); else checkDeepLink();

  return { 
    open: function(card) {
      if (!HOST) {
        HOST = document.body.appendChild(document.createElement("div")); HOST.className = "lz-backdrop";
        HOST.innerHTML = '<div class="lz-shell"><div class="lz-modal"></div></div>';
        SHELL = HOST.firstChild; MODAL = SHELL.firstChild;
        HOST.onclick = function(e){ if(e.target === HOST) close(); };
        document.addEventListener("keydown", function(e){ if(e.key === "Escape") close(); });
      }
      ORIGINAL_SITE_LANG = window.LZ_CURRENT_LANG; MODAL_ACTIVE_LANG = ORIGINAL_SITE_LANG;
      var track = card.closest(".lz-track"); CARDS = track ? Array.from(track.querySelectorAll(".lz-card")) : [card];
      IDX = CARDS.indexOf(card); render(card, MODAL_ACTIVE_LANG);
    },
    close: close,
    backToCurrent: function() { render(CURRENT_CARD, MODAL_ACTIVE_LANG); }
  };
})();