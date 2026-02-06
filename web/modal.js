/**
 * modal.js - 詳細表示・機能コンポーネント (修正版)
 * 役割: モーダルUI構築、画像ギャラリー、SNSシェア、PDF生成、ディープリンク処理
 */
window.lzModal = (function() {
  "use strict";

  // common.js からの依存取得
  const { esc, loadScript, pt2mm, pt2px, RED_APPLE, GREEN_APPLE, PDF_FOOTER, originalTitle } = window.LZ_COMMON;

  /* ==========================================
     1. CSSの注入 (モーダル・詳細表示専用デザイン)
     ========================================== */
  const injectModalStyles = () => {
    const style = document.createElement('style');
    style.id = 'lz-modal-styles';
    style.textContent = `
      /* 背景レイヤー */
      .lz-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, .35); display: none; align-items: center; justify-content: center; z-index: 9000; backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); }
      .lz-backdrop.open { display: flex; }
      .lz-shell { position: relative; display: flex; align-items: center; justify-content: center; padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom); }
      
      /* モーダル本体 */
      .lz-modal { 
        position: relative; width: min(860px, 92vw); max-height: 88vh; overflow-y: auto; 
        background: #fff; border: 2px solid var(--apple-red); border-radius: 12px; 
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }
      @media(max-width:768px) { .lz-modal { max-height: 82svh; } }

      /* ヘッダー */
      .lz-mh { background: #fff; border-bottom: 1px solid var(--border); padding: 12px 16px; display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center; position: sticky; top: 0; z-index: 30; }
      .lz-mt { margin: 0; font-weight: var(--fw-modal-title); font-size: var(--fz-modal-title); color: var(--apple-red-strong); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .lz-actions { display: flex; gap: 8px; align-items: center; }

      /* ボタン */
      .lz-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--apple-red); background: #fff; border-radius: 999px; padding: .5em 1em; cursor: pointer; color: var(--apple-red); font-weight: 600; line-height: 1; transition: .2s; text-decoration: none; }
      .lz-btn:hover { background: var(--apple-red); color: #fff; }
      .lz-btn svg { width: 18px; height: 18px; stroke: currentColor; fill: none; stroke-width: 2; }
      @media (max-width:768px) { .lz-btn { width: 40px; height: 40px; padding: 0; } .lz-btn .lz-label { display: none; } }

      /* 画像エリア */
      .lz-mm { position: relative; background: #faf7f5; overflow: hidden; }
      .lz-mm::before { content: ""; display: block; padding-top: 56.25%; }
      .lz-mm > img { position: absolute; inset: 0; max-width: 100%; max-height: 100%; margin: auto; object-fit: contain; transition: opacity .22s ease; opacity: 1; }
      .lz-mm > img.lz-fadeout { opacity: 0; }
      
      /* ギャラリー */
      .lz-g { padding: 12px; display: grid; gap: 8px; grid-template-columns: repeat(5, 1fr); border-top: 1px solid var(--border); }
      .lz-g img { width: 100%; aspect-ratio: 16/9; object-fit: cover; background: #f6f7f9; border-radius: 8px; border: 1px solid var(--border); cursor: pointer; transition: .2s; }
      .lz-g img.is-active { outline: 3px solid var(--apple-red); outline-offset: 2px; }

      /* 情報テーブル */
      .lz-info { margin: 16px; width: calc(100% - 32px); border-collapse: separate; border-spacing: 0 8px; }
      .lz-info th, .lz-info td { padding: 12px; vertical-align: top; border-radius: 8px; }
      .lz-info th { width: 9em; font-weight: 700; color: var(--apple-red-strong); background: #fff3f2; text-align: left; }
      .lz-info td { background: #fafafa; color: #1b1b1b; word-break: break-word; }
      .lz-info a { color: var(--apple-green); font-weight: 700; text-decoration: underline; }

      /* SNSボタン */
      .lz-sns { display: flex; gap: 12px; flex-wrap: wrap; padding: 0 16px 16px; }
      .lz-sns a { display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 50%; color: #fff; transition: .2s; }
      .lz-sns a svg { width: 22px; height: 22px; fill: currentColor; }
      
      /* テキスト */
      .lz-lead-strong { padding: 16px 16px 0; font-weight: 800; font-size: 1.6rem; line-height: 1.5; }
      .lz-txt { padding: 16px; font-size: 1.4rem; color: #444; line-height: 1.8; white-space: pre-wrap; }
      .lz-related { padding: 0 16px 16px; }

      /* 矢印ナビ */
      .lz-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255, 255, 255, 0.95); border: 1px solid var(--apple-red); border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      .lz-arrow svg { width: 24px; height: 24px; stroke: var(--apple-red); stroke-width: 3; fill: none; }
      .lz-prev { left: -64px; } .lz-next { right: -64px; }
      @media(max-width:1024px) { .lz-prev, .lz-next { top: auto; bottom: -60px; transform: none; } .lz-prev { left: calc(50% - 60px); } .lz-next { right: calc(50% - 60px); } }
    `;
    document.head.appendChild(style);
  };

  /* ==========================================
     2. モーダル制御ロジック
     ========================================== */
  let HOST, SHELL, MODAL, CARDS = [], IDX = 0;

  function ensureModal() {
    if(HOST) return;
    HOST = document.createElement("div"); HOST.className = "lz-backdrop";
    HOST.innerHTML = `<div class="lz-shell"><div class="lz-modal"></div></div>`;
    document.body.appendChild(HOST);
    SHELL = HOST.firstElementChild; MODAL = SHELL.firstElementChild;
    HOST.onclick = e => { if(e.target === HOST) close(); };
    document.addEventListener("keydown", e => { if(e.key === "Escape") close(); });
  }

  function open(card) {
    ensureModal();
    const track = card.closest(".lz-track");
    CARDS = track ? Array.from(track.querySelectorAll(".lz-card")) : [card];
    IDX = CARDS.indexOf(card);
    render(card);
  }

  function close() {
    if(!HOST) return;
    HOST.classList.remove("open");
    document.title = originalTitle;
    const url = new URL(location.href); url.searchParams.delete('id');
    history.replaceState(null, "", url.pathname + url.search);
  }

  function render(card) {
    const d = card.dataset;
    const title = d.title;
    document.title = `${title} | ${originalTitle}`;
    
    // URL同期
    const url = new URL(location.href); url.searchParams.set('id', d.id);
    history.replaceState(null, "", url.pathname + url.search);

    // データ解析
    let subs = []; try { subs = JSON.parse(d.sub || "[]"); } catch(e) {}
    const gallery = [d.main, ...subs].filter(Boolean);
    let sns = {}; try { sns = JSON.parse(d.sns || "{}"); } catch(e) {}

    // 詳細テーブル構築
    const buildRows = () => {
      const rows = [];
      if (d.address) rows.push(`<tr><th>住所</th><td>${esc(d.address)}</td></tr>`);
      if (d.hoursCombined) rows.push(`<tr><th>営業時間</th><td>${esc(d.hoursCombined)}</td></tr>`);
      const links = [];
      if (d.form) links.push(`<a href="${esc(d.form)}" target="_blank">予約フォーム</a>`);
      if (d.tel) links.push(`<a href="tel:${esc(d.tel)}">${esc(d.tel)}</a>`);
      if (links.length) rows.push(`<tr><th>お問合せ</th><td>${links.join(" / ")}</td></tr>`);
      return rows.join("");
    };

    MODAL.innerHTML = `
      <div class="lz-mh">
        <h2 class="lz-mt">${esc(title)}</h2>
        <div class="lz-actions">
          <button class="lz-btn lz-share"><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg><span class="lz-label">共有</span></button>
          <button class="lz-btn lz-pdf-trigger"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span class="lz-label">印刷</span></button>
          <button class="lz-btn" onclick="lzModal.close()"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span class="lz-label">閉じる</span></button>
        </div>
      </div>
      <div>
        ${gallery.length ? `<div class="lz-mm"><img id="lz-mainimg" src="${esc(gallery[0])}" referrerpolicy="no-referrer-when-downgrade"></div>` : ''}
        ${d.lead ? `<div class="lz-lead-strong">${esc(d.lead)}</div>` : ""}
        ${d.body ? `<div class="lz-txt">${esc(d.body)}</div>` : ""}
        ${gallery.length > 1 ? `<div class="lz-g">${gallery.map((u, i) => `<img src="${esc(u)}" data-idx="${i}" class="${i===0?'is-active':''}">`).join("")}</div>` : ""}
        <table class="lz-info"><tbody>${buildRows()}</tbody></table>
        <div class="lz-sns">
          ${d.home ? `<a href="${esc(d.home)}" target="_blank" style="background:#5b667a"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" stroke="currentColor" stroke-width="2" fill="none"/></svg></a>` : ""}
          ${sns.instagram ? `<a href="${esc(sns.instagram)}" target="_blank" style="background:#E4405F"><svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="18" cy="6" r="1" fill="currentColor"/></svg></a>` : ""}
        </div>
      </div>
    `;

    // ギャラリー制御
    const mainImg = MODAL.querySelector("#lz-mainimg");
    MODAL.querySelector(".lz-g")?.onclick = e => {
      const img = e.target.closest("img"); if(!img) return;
      mainImg.classList.add("lz-fadeout");
      setTimeout(() => {
        mainImg.src = gallery[img.dataset.idx];
        mainImg.onload = () => mainImg.classList.remove("lz-fadeout");
        MODAL.querySelectorAll(".lz-g img").forEach((el, i) => el.classList.toggle("is-active", i == img.dataset.idx));
      }, 200);
    };

    // SNS共有
    MODAL.querySelector(".lz-share").onclick = async () => {
      const text = `${RED_APPLE}${title}${GREEN_APPLE}\n${d.lead || ""}\n${location.href}`;
      try {
        if(navigator.share) await navigator.share({ title, text: d.lead, url: location.href });
        else { await navigator.clipboard.writeText(text); alert("リンクをコピーしました"); }
      } catch(e) {}
    };

    // PDF生成
    MODAL.querySelector(".lz-pdf-trigger").onclick = () => generatePdf(MODAL, title);

    // 前後ナビ生成
    SHELL.querySelectorAll(".lz-arrow").forEach(a => a.remove());
    if(CARDS.length > 1) {
      const p = document.createElement("button"); p.className="lz-arrow lz-prev"; p.innerHTML=`<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>`;
      const n = document.createElement("button"); n.className="lz-arrow lz-next"; n.innerHTML=`<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>`;
      p.onclick = () => { IDX = (IDX - 1 + CARDS.length) % CARDS.length; render(CARDS[IDX]); };
      n.onclick = () => { IDX = (IDX + 1) % CARDS.length; render(CARDS[IDX]); };
      SHELL.append(p, n);
    }

    HOST.classList.add("open");
    MODAL.scrollTop = 0;
  }

  /* ==========================================
     3. PDF生成 (ライブラリ遅延読込)
     ========================================== */
  async function generatePdf(element, title) {
    if(!confirm("PDFを作成しますか？")) return;
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      
      const clone = element.cloneNode(true);
      clone.style.width = "800px"; clone.style.maxHeight = "none";
      clone.querySelector(".lz-mh")?.remove();
      document.body.appendChild(clone);
      
      const canvas = await html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      document.body.removeChild(clone);

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const pdfW = pdf.internal.pageSize.getWidth();
      const imgW = pdfW - 20;
      const imgH = (canvas.height * imgW) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 10, 10, imgW, imgH);
      pdf.setFontSize(9); pdf.text(`Iizuna Apple Project | ${title}`, 10, 285);
      window.open(pdf.output("bloburl"), "_blank");
    } catch(e) { console.error(e); alert("PDF作成失敗"); }
  }

  /* ==========================================
     4. 起動 & ディープリンク処理
     ========================================== */
  injectModalStyles();

  // section.js がカードを描画するのを待ってから id をチェック
  const checkDeepLink = () => {
    const id = new URLSearchParams(location.search).get('id');
    if(!id) return;
    
    // 該当するカードが見つかるまで最大5秒監視
    let attempts = 0;
    const timer = setInterval(() => {
      const card = document.getElementById(id);
      if(card) {
        open(card);
        clearInterval(timer);
      }
      if(++attempts > 50) clearInterval(timer);
    }, 100);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", checkDeepLink);
  else checkDeepLink();

  return { open, close };
})();