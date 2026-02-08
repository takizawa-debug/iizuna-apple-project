/**
 * modal.js - 詳細表示・機能コンポーネント (UI・安定機能維持版)
 * 役割: 画像表示、PDF生成、SNS共有、言語切り替え、ページめくりを担当。
 * 修正: 自動反映されるリンクが確実に動作するよう「イベントデリゲーション」を統合。
 */
window.lzModal = (function() {
  "use strict";

  var C = window.LZ_COMMON;
  if (!C) return;

  var MODAL_ACTIVE_LANG = null;
  var ORIGINAL_SITE_LANG = null;

  var ICON = {
    web:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    ec:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20 8H6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="19" r="1.6" fill="currentColor"/><circle cx="17" cy="19" r="1.6" fill="currentColor"/></svg>`,
    ig:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7z"/><path fill="currentColor" d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>`,
    fb:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13 22v-8h3l1-4h-4V7c0-1.1.9-2 2-2h2V1h-3a5 5 0 0 0-5 5v3H6v4h3v8h4z"/></svg>`,
    x:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
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
      '.lz-mm::before { content: ""; display: block; padding-top: 56.25%; }',
      '.lz-mm img { position: absolute; inset: 0; max-width: 100%; max-height: 100%; margin: auto; object-fit: contain; transition: opacity .22s ease; }',
      '.lz-mm img.lz-fadeout { opacity: 0; }',
      '.lz-lead-strong { padding: 15px 15px 0; font-weight: 700; font-size: 1.55rem; line-height: 1.6; color: #222; }',
      '.lz-txt { padding: 15px; font-size: 1.45rem; color: #444; line-height: 1.8; white-space: pre-wrap; }',
      '.lz-auto-link { text-decoration: underline; font-weight: 700; cursor: pointer; padding: 0 1px; border-radius: 2px; opacity: 0; transition: opacity 0.8s ease; }',
      '.lz-auto-link.is-active { opacity: 1; }',
      '.lz-auto-link.direct { color: #cf3a3a; }',
      '.lz-auto-link.search { color: #27ae60; }',
      '.lz-auto-link:hover { background: #f5f5f5; }',
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
      '.lz-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255, 255, 255, .96); border: 1px solid #cf3a3a; border-radius: 50%; width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 21000; box-shadow: 0 6px 20px rgba(0,0,0,0.15); transition: .2s; }',
      '.lz-arrow svg { width: 28px; height: 28px; stroke: #cf3a3a; stroke-width: 3.5; fill: none; }',
      '.lz-arrow:hover { background: #cf3a3a; } .lz-arrow:hover svg { stroke: #fff; }',
      '.lz-prev { left: -75px; } .lz-next { right: -75px; }',
      '@media(max-width:1080px) { .lz-prev { left: 10px; } .lz-next { right: 10px; } }',
      '@media(max-width:768px) { .lz-prev, .lz-next { top: auto; bottom: -68px; left: 50%; transform: none; } .lz-prev { transform: translateX(-120%); } .lz-next { transform: translateX(20%); } }',
      '.lz-btn.lz-dl { border-color: #27ae60 !important; color: #27ae60 !important; } .lz-btn.lz-dl:hover { background: #27ae60 !important; color: #fff !important; }'
    ].join('\n');
    document.head.appendChild(style);
  };

  function getLangText(data, key, targetLang) {
    if (targetLang === 'ja') return data[key] || "";
    if (data[targetLang] && data[targetLang][key]) return data[targetLang][key];
    return data[key] || "";
  }

  function getTranslation(key, targetLang) {
    var dict = window.LZ_CONFIG.LANG.I18N[targetLang] || window.LZ_CONFIG.LANG.I18N['ja'];
    return dict[key] || key;
  }

  /* PDF精密生成ロジック (維持) */
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
    
    // 表示データの取得
    var title = getLangText(rawData, 'title', MODAL_ACTIVE_LANG);
    var lead = getLangText(rawData, 'lead', MODAL_ACTIVE_LANG);
    var bodyText = getLangText(rawData, 'body', MODAL_ACTIVE_LANG);
    
    // 重要：リンク生成ロジック（lzSearchEngine）を呼び出す
    var linkedBody = window.lzSearchEngine ? window.lzSearchEngine.applyLinks(bodyText, d.id, MODAL_ACTIVE_LANG) : bodyText;
    
    var url = new URL(window.location.href);
    url.searchParams.set('lang', MODAL_ACTIVE_LANG); url.searchParams.set('id', d.id);
    window.history.replaceState(null, "", url.toString());
    document.title = title + " | " + C.originalTitle;

    var gallery = [d.main].concat(JSON.parse(d.sub || "[]")).filter(Boolean);
    var rows = [];
    var fields = [
      {k:'address', l:getTranslation('住所', MODAL_ACTIVE_LANG)},
      {k:'tel', l:getTranslation('問い合わせ電話', MODAL_ACTIVE_LANG)},
      {k:'email', l:getTranslation('問い合わせメール', MODAL_ACTIVE_LANG)},
      {k:'form', l:getTranslation('問い合わせフォーム', MODAL_ACTIVE_LANG)}, // 🍎 ボタンから表へ移動
      {k:'bizDays', l:getTranslation('営業曜日', MODAL_ACTIVE_LANG)}, 
      {k:'holiday', l:getTranslation('定休日', MODAL_ACTIVE_LANG)}, 
      {k:'hoursCombined', l:getTranslation('営業時間', MODAL_ACTIVE_LANG)}, 
      {k:'bizNote', l:getTranslation('営業注意事項', MODAL_ACTIVE_LANG)}, // 🍎 追加
      {k:'eventDate', l:getTranslation('開催日', MODAL_ACTIVE_LANG)},
      {k:'eventTime', l:getTranslation('開催時間', MODAL_ACTIVE_LANG)}, // 🍎 追加
      {k:'fee', l:getTranslation('参加費', MODAL_ACTIVE_LANG)},
      {k:'target', l:getTranslation('対象', MODAL_ACTIVE_LANG)},
      {k:'orgApply', l:getTranslation('申し込み方法', MODAL_ACTIVE_LANG)},
      {k:'bring', l:getTranslation('もちもの', MODAL_ACTIVE_LANG)},      // 🍎 追加
      {k:'venueNote', l:getTranslation('会場注意事項', MODAL_ACTIVE_LANG)}, // 🍎 追加
      {k:'note', l:getTranslation('備考', MODAL_ACTIVE_LANG)},
      {k:'organizer', l:getTranslation('主催者名', MODAL_ACTIVE_LANG)},
      {k:'orgTel', l:getTranslation('主催者連絡先', MODAL_ACTIVE_LANG)} // 🍎 追加
    ];

// --- ① 情報テーブルの生成 (rawData を使い GASの全情報を拾う) ---
    for(var i=0; i<fields.length; i++) {
      var val = rawData[fields[i].k];
      if(val && String(val).trim() !== "") {
        var strVal = String(val).trim();
        var displayHtml = C.esc(strVal);
        
        // 🍎 判定：httpから始まる場合はリンクにする
        if (strVal.startsWith('http')) {
          displayHtml = '<a href="' + C.esc(strVal) + '" target="_blank" style="color:#cf3a3a; text-decoration:underline; font-weight:700;">' + displayHtml + '</a>';
        }
        
        rows.push('<tr><th>' + fields[i].l + '</th><td>' + displayHtml + '</td></tr>');
      }
    }

    // --- ② リンク(SNS+HP+EC)の統合組み立て (snsHtml等の古い記述は削除) ---
    var snsLinksHtml = [];
    var addLink = function(url, iconKey) { 
      if(url && String(url).trim() !== "") {
        snsLinksHtml.push('<a data-sns="'+iconKey+'" href="'+C.esc(url)+'" target="_blank">'+ICON[iconKey]+'</a>');
      }
    };
    
    addLink(rawData.home, "web"); // ホームページ
    addLink(rawData.ec, "ec");     // ECサイト
    if(rawData.sns) {
      addLink(rawData.sns.instagram, "ig");
      addLink(rawData.sns.facebook, "fb");
      addLink(rawData.sns.x, "x");
      addLink(rawData.sns.line, "line");
      addLink(rawData.sns.tiktok, "tt");
    }

    // --- ③ 関連記事の組み立て (ra.title || ra.url ロジックを適用) ---
    var relHtml = "";
    if (rawData.relatedArticles && rawData.relatedArticles.length > 0) {
      relHtml = '<div style="padding:15px; border-top:1px solid #eee;"><h3 style="font-size:1.1rem; color:#a82626; margin-bottom:10px;">' + getTranslation('関連記事', MODAL_ACTIVE_LANG) + '</h3><div style="display:grid; gap:8px;">' + 
        rawData.relatedArticles.map(function(ra){
          if(!ra.url) return "";
          var displayTitle = ra.title || ra.url; 
          return '<a href="'+C.esc(ra.url)+'" target="_blank" style="display:block; padding:12px; background:#f9f9f9; border-radius:10px; color:#cf3a3a; text-decoration:none; font-weight:700; border:1px solid #eee; font-size:1.1rem;">🔗 '+C.esc(displayTitle)+'</a>';
        }).join('') + '</div></div>';
    }

    // --- ④ タブの準備 ---
    var langTabs = '<div class="lz-m-lang-tabs">' + window.LZ_CONFIG.LANG.SUPPORTED.map(function(l){
        var label = window.LZ_CONFIG.LANG.LABELS[l]; return '<div class="lz-m-lang-btn '+(l === MODAL_ACTIVE_LANG ? 'active' : '')+'" data-lang="'+l+'">'+label+'</div>';
      }).join('') + '</div>';

    // この後に MODAL.innerHTML = [ ... ] が続きます

    MODAL.innerHTML = [
      '<div class="lz-mh"><h2 class="lz-mt">' + C.esc(title) + '</h2><div class="lz-actions">',
      (rawData.downloadUrl ? '<button class="lz-btn lz-dl" onclick="window.open(\''+C.esc(rawData.downloadUrl)+'\',\'_blank\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg><span class="lz-label">' + getTranslation('保存', MODAL_ACTIVE_LANG) + '</span></button>' : ''),
      '<button class="lz-btn lz-share"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg><span class="lz-label">' + getTranslation('共有', MODAL_ACTIVE_LANG) + '</span></button>',
      (window.innerWidth >= 769 ? '<button class="lz-btn lz-pdf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span class="lz-label">' + getTranslation('印刷', MODAL_ACTIVE_LANG) + '</span></button>' : ''),
      '    <button class="lz-btn" onclick="lzModal.close()">✕<span class="lz-label">' + getTranslation('閉じる', MODAL_ACTIVE_LANG) + '</span></button></div></div>',
      langTabs, '<div>', (gallery.length ? '  <div class="lz-mm"><img id="lz-mainimg" src="' + C.esc(gallery[0]) + '" referrerpolicy="no-referrer-when-downgrade"></div>' : ''),
      (lead ? '  <div class="lz-lead-strong">' + C.esc(lead) + '</div>' : ''), 
      '  <div class="lz-txt lz-modal-body-txt" data-id="' + d.id + '">' + linkedBody + '</div>',
      /* --- 問い合わせ(form)ボタンの配置 --- */
      (gallery.length > 1 ? '  <div class="lz-g">' + gallery.map(function(u, i){ return '<img src="'+C.esc(u)+'" data-idx="'+i+'" class="'+(i===0?'is-active':'')+'">'; }).join('') + '</div>' : ''),
      (rows.length ? '  <table class="lz-info"><tbody>' + rows.join('') + '</tbody></table>' : ''),
      /* --- SNS・HP・ECリンクを表示 --- */
      (snsLinksHtml.length ? '  <div class="lz-sns">' + snsLinksHtml.join('') + '</div>' : ''),
      relHtml,
      '</div>'
    ].join('');

    // リンクへのis-active付与（既存のリンクがある場合用）
    MODAL.querySelectorAll('.lz-auto-link').forEach(function(l){ l.classList.add('is-active'); });

    MODAL.querySelectorAll('.lz-m-lang-btn').forEach(function(btn){ btn.onclick = function(){ render(card, btn.dataset.lang); }; });
    
    // 共有ボタンのクリックイベント
    MODAL.querySelector(".lz-share").onclick = function() {
      // 「詳しくはこちら」などの文言を辞書から取得
      var detailsLabel = getTranslation('詳しくはこちら', MODAL_ACTIVE_LANG);
      var hashtags = getTranslation('hashtags', MODAL_ACTIVE_LANG);
      
      // 送信テキストの組み立て
      var payload = [
        C.RED_APPLE + title + C.GREEN_APPLE,   // 🍎タイトル🍏
        (lead ? lead : ""),                    // リード文（あれば）
        "ーーー",                               // 区切り線
        detailsLabel,                          // 詳しくはこちら
        window.location.href,                  // 現在のページのURL（ID付き）
        "",                                    // 改行用空行
        hashtags                 // ハッシュタグ
      ].join("\n"); // 各要素を改行でつなぐ

      if(navigator.share) {
        // スマホなどの標準共有機能を使用
        navigator.share({ text: payload });
      } else {
        // PCなどで共有機能がない場合はクリップボードにコピー
        var ta = document.createElement("textarea");
        ta.value = payload;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        alert(getTranslation("共有テキストをコピーしました！", MODAL_ACTIVE_LANG));
      }
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

        /* 重要：イベントデリゲーションを統合（書き換えられてもクリックが効く） */
        MODAL.addEventListener('click', function(e) {
          var el = e.target.closest('.lz-auto-link');
          if (!el) return;
          e.preventDefault();
          if (el.dataset.gotoId) {
            render(document.querySelector('.lz-card[data-id="' + el.dataset.gotoId + '"]'), MODAL_ACTIVE_LANG);
          } else if (window.lzSearchEngine) {
            window.lzSearchEngine.run(el.dataset.keyword, MODAL_ACTIVE_LANG, MODAL, function() {
              render(CURRENT_CARD, MODAL_ACTIVE_LANG);
            });
          }
        });
        
        HOST.onclick = function(e){ if(e.target === HOST) close(); };
        document.addEventListener("keydown", function(e){ if(e.key === "Escape") close(); });
      }
      ORIGINAL_SITE_LANG = window.LZ_CURRENT_LANG; MODAL_ACTIVE_LANG = ORIGINAL_SITE_LANG;
      var track = card.closest(".lz-track"); CARDS = track ? Array.from(track.querySelectorAll(".lz-card")) : [card];
      IDX = CARDS.indexOf(card); render(card, MODAL_ACTIVE_LANG);
    },
    close: close,
    /* 同期用の再描画機能 */
    refresh: function() { if(HOST && HOST.classList.contains("open")) render(CURRENT_CARD, MODAL_ACTIVE_LANG); },
    backToCurrent: function() { render(CURRENT_CARD, MODAL_ACTIVE_LANG); }
  };
})();