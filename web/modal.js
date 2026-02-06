/**
 * modal.js - 詳細表示・機能コンポーネント
 * 役割: モーダルUI、ギャラリー制御、SNSシェア、PDF生成、トースト通知
 */
window.lzModal = (function() {
  "use strict";

  const { NET, esc, loadScript, pt2mm, pt2px, RED_APPLE, GREEN_APPLE, PDF_FOOTER, originalTitle } = window.LZ_COMMON;

  /* ==========================================
     1. CSSの注入 (モーダル・詳細表示専用)
     ========================================== */
  const injectModalStyles = () => {
    const style = document.createElement('style');
    style.id = 'lz-modal-styles';
    style.textContent = `
      /* 背景・外殻 */
      .lz-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, .35); display: none; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(2px); }
      .lz-backdrop.open { display: flex; }
      .lz-shell { position: relative; display: flex; align-items: center; justify-content: center; padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom); }
      
      /* モーダル本体 */
      .lz-modal { 
        position: relative; width: min(860px, 92vw); max-height: 88vh; overflow-y: auto; 
        background: #fff; border: 2px solid var(--apple-red); border-radius: 12px; 
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }
      @media(max-width:768px) { .lz-modal { max-height: 82svh; } }

      /* ヘッダーエリア */
      .lz-mh { background: #fff; border-bottom: 1px solid var(--border); padding: 12px 16px; display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center; position: sticky; top: 0; z-index: 20; }
      .lz-mt { margin: 0; font-weight: var(--fw-modal-title); font-size: var(--fz-modal-title); color: var(--apple-red-strong); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .lz-actions { display: flex; gap: 8px; align-items: center; }

      /* ボタンデザイン */
      .lz-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--apple-red); background: #fff; border-radius: 999px; padding: .5em 1em; cursor: pointer; color: var(--apple-red); font-weight: 600; line-height: 1; transition: .2s; text-decoration: none; }
      .lz-btn:hover { background: var(--apple-red); color: #fff; transform: translateY(-1px); }
      .lz-btn svg { width: 18px; height: 18px; stroke: currentColor; fill: none; }
      @media (max-width:768px) { .lz-btn { width: 40px; height: 40px; padding: 0; } .lz-btn .lz-label { display: none; } .lz-mh { padding: 10px; } }

      /* メイン画像 & ギャラリー */
      .lz-mm { position: relative; background: #faf7f5; overflow: hidden; }
      .lz-mm::before { content: ""; display: block; padding-top: 56.25%; }
      .lz-mm > img { position: absolute; inset: 0; max-width: 100%; max-height: 100%; margin: auto; object-fit: contain; transition: opacity .22s ease; }
      .lz-mm > img.lz-fadeout { opacity: 0; }
      
      .lz-g { padding: 12px; display: grid; gap: 8px; grid-template-columns: repeat(5, 1fr); border-top: 1px solid var(--border); }
      .lz-g img { width: 100%; aspect-ratio: 16/9; object-fit: cover; background: #f6f7f9; border-radius: 8px; border: 1px solid var(--border); cursor: pointer; transition: .2s; }
      .lz-g img:hover { transform: scale(1.05); }
      .lz-g img.is-active { outline: 3px solid var(--apple-red); outline-offset: 2px; }

      /* 詳細情報テーブル */
      .lz-info { margin: 16px; width: calc(100% - 32px); border-collapse: separate; border-spacing: 0 8px; }
      .lz-info th, .lz-info td { padding: 12px; vertical-align: top; border-radius: 8px; }
      .lz-info th { width: 9em; font-weight: 700; color: var(--apple-red-strong); background: #fff3f2; text-align: left; }
      .lz-info td { background: #fafafa; color: var(--ink-dark); word-break: break-word; }
      .lz-info a { color: var(--apple-green); font-weight: 700; text-decoration: underline; }

      /* SNSボタン */
      .lz-sns { display: flex; gap: 12px; flex-wrap: wrap; padding: 0 16px 16px; }
      .lz-sns a { display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 50%; color: #fff; transition: .2s; }
      .lz-sns a svg { width: 22px; height: 22px; fill: currentColor; }
      .lz-sns a:hover { transform: scale(1.1); filter: brightness(1.1); }
      
      /* テキストエリア */
      .lz-lead-strong { padding: 16px 16px 0; font-weight: 800; font-size: 1.6rem; color: var(--ink-dark); line-height: 1.5; }
      .lz-txt { padding: 16px; font-size: 1.4rem; color: #444; line-height: 1.8; white-space: pre-wrap; }
      .lz-related { padding: 0 16px 16px; font-weight: 700; }
      .lz-related a { color: var(--apple-red); }

      /* 前後ナビ矢印 */
      .lz-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255, 255, 255, 0.95); border: 1px solid var(--apple-red); border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: .2s; }
      .lz-arrow:hover { background: var(--apple-red); }
      .lz-arrow:hover svg { stroke: #fff; }
      .lz-arrow svg { width: 24px; height: 24px; stroke: var(--apple-red); stroke-width: 3; }
      .lz-prev { left: -64px; } .lz-next { right: -64px; }
      @media(max-width:1024px) { .lz-prev, .lz-next { top: auto; bottom: -60px; transform: none; } .lz-prev { left: calc(50% - 60px); } .lz-next { right: calc(50% - 60px); } }
    `;
    document.head.appendChild(style);
  };

  /* ==========================================
     2. モーダル制御ロジック
     ========================================== */
  let HOST, SHELL, MODAL, CARDS = [], IDX = 0;

  function toast(msg) {
    let t = document.querySelector(".lz-toast");
    if(!t) { t = document.createElement("div"); t.className = "lz-toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2000);
  }

  function ensureModal() {
    if(HOST) return;
    HOST = document.createElement("div"); HOST.className = "lz-backdrop";
    HOST.innerHTML = `<div class="lz-shell"><div class="lz-modal"></div></div>`;
    document.body.appendChild(HOST);
    SHELL = HOST.firstElementChild; MODAL = SHELL.firstElementChild;
    HOST.onclick = e => { if(e.target === HOST) close(); };
    document.addEventListener("keydown", e => { if(e.key === "Escape") close(); });
  }

  function open(targetCard) {
    ensureModal();
    // 同じグループのカードをリスト化（前後ナビ用）
    const track = targetCard.closest(".lz-track");
    CARDS = track ? Array.from(track.querySelectorAll(".lz-card")) : [targetCard];
    IDX = CARDS.indexOf(targetCard);
    render(targetCard);
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
    
    // URL更新
    const url = new URL(location.href); url.searchParams.set('id', d.id);
    history.replaceState(null, "", url.pathname + url.search);

    // 画像ギャラリー準備
    let subs = []; try { subs = JSON.parse(d.sub || "[]"); } catch(e) {}
    const gallery = [d.main, ...subs].filter(Boolean);

    // HTML構築
    const infoTable = buildInfoTable(d);
    const snsIcons = buildSNS(d);
    let related = ""; try { const rel = JSON.parse(d.related || "[]"); if(rel.length) related = `<div class="lz-related">${rel.map(r => `<div><a href="${r.url}" target="_blank">→ ${esc(r.title)}</a></div>`).join("")}</div>`; } catch(e) {}

    MODAL.innerHTML = `
      <div class="lz-mh">
        <h2 class="lz-mt">${esc(title)}</h2>
        <div class="lz-actions">
          <button class="lz-btn lz-share"><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg><span class="lz-label">共有</span></button>
          <button class="lz-btn lz-pdf-trigger"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span class="lz-label">印刷</span></button>
          <button class="lz-btn" onclick="lzModal.close()"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span class="lz-label">閉じる</span></button>
        </div>
      </div>
      <div class="lz-modal-scroll">
        ${gallery.length ? `<div class="lz-mm"><img id="lz-mainimg" src="${esc(gallery[0])}" referrerpolicy="no-referrer-when-downgrade"></div>` : ''}
        ${d.lead ? `<div class="lz-lead-strong">${esc(d.lead)}</div>` : ""}
        ${d.body ? `<div class="lz-txt">${esc(d.body)}</div>` : ""}
        ${gallery.length > 1 ? `<div class="lz-g">${gallery.map((u, i) => `<img src="${esc(u)}" data-idx="${i}" class="${i===0?'is-active':''}">`).join("")}</div>` : ""}
        ${infoTable}
        ${snsIcons}
        ${related}
      </div>
    `;

    // ギャラリー切り替えイベント
    const mainImg = MODAL.querySelector("#lz-mainimg");
    MODAL.querySelector(".lz-g")?.addEventListener("click", e => {
      if(e.target.tagName !== 'IMG') return;
      const idx = e.target.dataset.idx;
      mainImg.classList.add("lz-fadeout");
      setTimeout(() => {
        mainImg.src = gallery[idx];
        mainImg.onload = () => mainImg.classList.remove("lz-fadeout");
        MODAL.querySelectorAll(".lz-g img").forEach((img, i) => img.classList.toggle("is-active", i == idx));
      }, 200);
    });

    // シェアイベント
    MODAL.querySelector(".lz-share").onclick = async () => {
      const shareData = { title: d.title, text: d.lead, url: location.href };
      try {
        if(navigator.share) await navigator.share(shareData);
        else { await navigator.clipboard.writeText(location.href); toast("リンクをコピーしました"); }
      } catch(e) {}
    };

    // PDFイベント
    MODAL.querySelector(".lz-pdf-trigger").onclick = () => generatePdf(MODAL, d.title);

    // ナビ矢印
    SHELL.querySelectorAll(".lz-arrow").forEach(a => a.remove());
    if(CARDS.length > 1) {
      const p = document.createElement("button"); p.className = "lz-arrow lz-prev"; p.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>`;
      const n = document.createElement("button"); n.className = "lz-arrow lz-next"; n.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>`;
      p.onclick = () => render(CARDS[(IDX - 1 + CARDS.length) % CARDS.length]);
      n.onclick = () => render(CARDS[(IDX + 1) % CARDS.length]);
      SHELL.append(p, n);
    }

    HOST.classList.add("open");
    MODAL.scrollTop = 0;
  }

  function buildInfoTable(d) {
    const fields = [
      {k:'address', l:'住所'}, {k:'bizDays', l:'営業日'}, {k:'holiday', l:'定休日'},
      {k:'hoursCombined', l:'営業時間'}, {k:'eventDate', l:'開催日'}, {k:'eventTime', l:'時間'},
      {k:'fee', l:'参加費'}, {k:'target', l:'対象'}, {k:'org', l:'主催者'}
    ];
    const rows = fields.map(f => d[f.k] ? `<tr><th>${f.l}</th><td>${esc(d[f.k])}</td></tr>` : "").join("");
    const links = [];
    if(d.form) links.push(`<a href="${esc(d.form)}" target="_blank">予約フォーム</a>`);
    if(d.tel) links.push(`<a href="tel:${esc(d.tel)}">${esc(d.tel)}</a>`);
    if(links.length) return `<table class="lz-info"><tbody>${rows}<tr><th>お問合せ</th><td>${links.join(" / ")}</td></tr></tbody></table>`;
    return rows ? `<table class="lz-info"><tbody>${rows}</tbody></table>` : "";
  }

  function buildSNS(d) {
    let sns = {}; try { sns = JSON.parse(d.sns || "{}"); } catch(e) {}
    const icons = {
      web: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" stroke="currentColor" stroke-width="2"/></svg>`,
      ig: `<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="6" r="1" fill="currentColor"/></svg>`
    };
    const btns = [];
    if(d.home) btns.push(`<a href="${esc(d.home)}" target="_blank" style="background:#5b667a">${icons.web}</a>`);
    if(sns.instagram) btns.push(`<a href="${esc(sns.instagram)}" target="_blank" style="background:#E4405F">${icons.ig}</a>`);
    return btns.length ? `<div class="lz-sns">${btns.join("")}</div>` : "";
  }

  /* ==========================================
     3. PDF生成ロジック (ライブラリ遅延ロード)
     ========================================== */
  async function generatePdf(element, title) {
    if(!confirm("PDFを作成して新しいタブで開きますか？")) return;
    toast("PDFを作成中...");
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js");

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
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgW = pdfW - 20;
      const imgH = (canvas.height * imgW) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgW, imgH);
      pdf.setFontSize(9);
      pdf.text(`りんごのまちいいづなポータル | ${title}`, 10, pdfH - 10);
      
      window.open(pdf.output("bloburl"), "_blank");
    } catch(e) { console.error(e); alert("PDFの作成に失敗しました"); }
  }

  /* ==========================================
     4. 初期化
     ========================================== */
  injectModalStyles();

  // ディープリンク対応（?id=... があれば自動で開く）
  setTimeout(() => {
    const id = new URLSearchParams(location.search).get('id');
    if(id) {
      const card = document.getElementById(id);
      if(card) open(card);
    }
  }, 1500);

  return { open, close };
})();