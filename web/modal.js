/**
 * modal.js - 詳細表示・機能コンポーネント (Full Restoration & Fix)
 * 役割: 関連記事表示の復旧、矢印ナビの視認性改善、精密PDF生成
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

  var injectStyles = function() {
    if (document.getElementById('lz-modal-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-modal-styles';
    style.textContent = [
      '.lz-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, .6); display: none; align-items: center; justify-content: center; z-index: 10000; transition: opacity 0.3s; }',
      '.lz-backdrop.open { display: flex; }',
      '.lz-shell { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: none; }',
      '.lz-modal { position: relative; width: min(860px, 90vw); max-height: 85vh; overflow: auto; background: #fff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); pointer-events: auto; }',
      '.lz-mh { background: #fff; border-bottom: 1px solid #f0f0f0; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 10; }',
      '.lz-mt { margin: 0; font-weight: 800; font-size: 1.8rem; color: var(--apple-red); }',
      '.lz-actions { display: flex; gap: 8px; }',
      '.lz-btn { border: 1px solid #eee; background: #f8f8f8; border-radius: 8px; padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 600; transition: 0.2s; }',
      '.lz-btn:hover { background: #eee; }',
      '.lz-mm { width: 100%; background: #f9f9f9; } .lz-mm img { width: 100%; display: block; object-fit: contain; }',
      '.lz-lead-strong { padding: 20px 20px 0; font-weight: 700; font-size: 1.4rem; line-height: 1.6; color: #222; }',
      '.lz-txt { padding: 16px 20px; font-size: 1.25rem; line-height: 1.8; color: #444; white-space: pre-wrap; }',
      
      /* ★関連記事エリアのデザイン復元 */
      '.lz-rel-area { margin: 15px 20px; padding: 15px; background: #fff5f5; border-radius: 12px; border: 1px solid #fce4e4; }',
      '.lz-rel-head { font-weight: 800; font-size: 1.1rem; color: var(--apple-red); margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }',
      '.lz-rel-link { display: block; color: #333; text-decoration: none; font-weight: 600; padding: 8px 0; border-bottom: 1px dashed #eecaca; transition: 0.2s; }',
      '.lz-rel-link:last-child { border-bottom: none; }',
      '.lz-rel-link:hover { color: var(--apple-red); transform: translateX(4px); }',

      '.lz-info { margin: 20px; width: calc(100% - 40px); border-collapse: collapse; }',
      '.lz-info th { width: 100px; text-align: left; padding: 12px; background: #fdf2f2; color: #cf3a3a; font-size: 1.1rem; border-bottom: 1px solid #fff; }',
      '.lz-info td { padding: 12px; border-bottom: 1px solid #f9f9f9; font-size: 1.15rem; }',

      '.lz-sns { display: flex; gap: 10px; padding: 0 20px 20px; flex-wrap: wrap; }',
      '.lz-sns a { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; }',

      /* ★矢印ナビの表示修正：絶対配置の重なりを解消 */
      '.lz-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.9); border: 2px solid var(--apple-red); cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10005; pointer-events: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.15); }',
      '.lz-arrow svg { width: 24px; height: 24px; stroke: var(--apple-red); stroke-width: 3; fill: none; }',
      '.lz-prev { left: 20px; } .lz-next { right: 20px; }',
      '@media(max-width:1100px) { .lz-arrow { top: auto; bottom: 20px; transform: none; } .lz-prev { left: calc(50% - 60px); } .lz-next { right: calc(50% - 60px); } }'
    ].join('\n');
    document.head.appendChild(style);
  };

  /* PDF生成ロジックは以前の完成版を維持 */
  async function generatePdf(element, title, cardId) {
    if(!confirm("PDFを作成します。よろしいですか？")) return;
    try {
      await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      var canvas = await html2canvas(element, { scale: 2, useCORS: true });
      var pdf = new window.jspdf.jsPDF("p", "mm", "a4");
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, 190, (canvas.height * 190) / canvas.width);
      window.open(pdf.output("bloburl"), "_blank");
    } catch(e) { alert("PDF生成失敗"); }
  }

  var HOST, SHELL, MODAL, CARDS = [], IDX = 0;

  function render(card) {
    if (!card) return;
    var d = card.dataset;
    
    // URL同期
    var url = new URL(window.location.href); url.searchParams.set('id', d.id);
    window.history.replaceState(null, "", url.toString());

    var sns = {}; try { sns = JSON.parse(d.sns || "{}"); } catch(e){}
    var rows = [];
    var fields = [{k:'address', l:'住所'}, {k:'hoursCombined', l:'時間'}, {k:'fee', l:'料金'}, {k:'target', l:'対象'}];
    fields.forEach(f => { if(d[f.k]) rows.push('<tr><th>'+f.l+'</th><td>'+C.esc(d[f.k])+'</td></tr>'); });

    var snsHtml = [];
    var addSns = (u, k) => { if(u) snsHtml.push('<a data-sns="'+k+'" href="'+C.esc(u)+'" style="background:'+(k==='web'?'#666':k==='ig'?'#E4405F':'#000')+'" target="_blank">'+ICON[k]+'</a>'); };
    addSns(d.home, "web"); addSns(sns.instagram, "ig");

    /* ★関連記事セクションのHTML生成 */
    var relHtml = "";
    if((d.rel1Url && d.rel1Title) || (d.rel2Url && d.rel2Title)) {
      relHtml = '<div class="lz-rel-area"><div class="lz-rel-head">🍎 関連記事</div>';
      if(d.rel1Url) relHtml += '<a class="lz-rel-link" href="'+C.esc(d.rel1Url)+'" target="_blank">'+C.esc(d.rel1Title)+'</a>';
      if(d.rel2Url) relHtml += '<a class="lz-rel-link" href="'+C.esc(d.rel2Url)+'" target="_blank">'+C.esc(d.rel2Title)+'</a>';
      relHtml += '</div>';
    }

    MODAL.innerHTML = `
      <div class="lz-mh">
        <h2 class="lz-mt">${C.esc(d.title)}</h2>
        <div class="lz-actions">
          <button class="lz-btn lz-share">共有</button>
          <button class="lz-btn" onclick="lzModal.close()">✕</button>
        </div>
      </div>
      <div class="lz-mm"><img src="${C.esc(d.main)}"></div>
      <div class="lz-lead-strong">${C.esc(d.lead || "")}</div>
      <div class="lz-txt">${C.esc(d.body || "")}</div>
      ${relHtml}
      <table class="lz-info"><tbody>${rows.join('')}</tbody></table>
      <div class="lz-sns">${snsHtml.join('')}</div>
    `;

    // 矢印ナビの構築
    SHELL.querySelectorAll(".lz-arrow").forEach(a => a.remove());
    if (CARDS.length > 1) {
      var p = document.createElement("button"); p.className = "lz-arrow lz-prev"; p.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>';
      var n = document.createElement("button"); n.className = "lz-arrow lz-next"; n.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>';
      p.onclick = () => { IDX = (IDX - 1 + CARDS.length) % CARDS.length; render(CARDS[IDX]); };
      n.onclick = () => { IDX = (IDX + 1) % CARDS.length; render(CARDS[IDX]); };
      SHELL.appendChild(p); SHELL.appendChild(n);
    }

    HOST.classList.add("open");
    MODAL.scrollTop = 0;
  }

  function close() { 
    if(HOST) HOST.classList.remove("open"); 
    var url = new URL(location.href); url.searchParams.delete('id');
    history.replaceState(null, "", url.toString());
  }

  injectStyles();

  return { 
    open: function(card) {
      if (!HOST) {
        HOST = document.createElement("div"); HOST.className = "lz-backdrop";
        HOST.innerHTML = '<div class="lz-shell"><div class="lz-modal"></div></div>';
        document.body.appendChild(HOST);
        SHELL = HOST.firstChild; MODAL = SHELL.firstChild;
        HOST.onclick = (e) => { if(e.target === HOST) close(); };
      }
      var track = card.closest(".lz-track");
      CARDS = track ? Array.from(track.querySelectorAll(".lz-card")) : [card];
      IDX = CARDS.indexOf(card);
      render(card);
    },
    close: close
  };
})();