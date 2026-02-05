(function apzSearchBoot(){
  "use strict";

  const ENDPOINT = "https://script.google.com/macros/s/AKfycbzpisDW6hyUhU-bE8-lYbhAusRUtbiU2sw4d39te38CWS6Q4TsxHvslIdNDulMiZ03c/exec";
  const FALLBACK_IMG = "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ca4e300-96ba-013e-36ff-0a58a9feac02/%E3%82%8A%E3%82%93%E3%81%93%E3%82%99%E3%83%AD%E3%82%B3%E3%82%99_%E8%B5%A4.png";

  const MENU_URL = {
    "知る":"https://appletown-iizuna.com/learn",
    "味わう":"https://appletown-iizuna.com/taste",
    "体験する":"https://appletown-iizuna.com/experience",
    "働く・住む":"https://appletown-iizuna.com/live-work",
    "販売・発信する":"https://appletown-iizuna.com/sell-promote"
  };

  const D = document;
  const fab     = D.getElementById("apzSearchFab");
  const float   = D.getElementById("apzSearchFloat");
  const closeBt = D.getElementById("apzSearchClose");
  const input   = D.getElementById("apzSearchInput");
  const clearBt = D.getElementById("apzSearchClear");
  const listEl  = D.getElementById("apzSearchList");
  const emptyEl = D.getElementById("apzSearchEmpty");

  if (!fab || !float || !closeBt || !input || !clearBt || !listEl || !emptyEl) return;

  let lastQuery = "";
  let lastResults = [];

  const esc = s => String(s ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");

  function highlightInline(text, query){
    const t = String(text || ""); const q = String(query || "").trim();
    if (!t || !q) return esc(t);
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
    return esc(t).replace(re, m => `<span class="apz-hit">${esc(m)}</span>`);
  }

  function highlightSnippet(text, query){
    const t = String(text || ""); const q = String(query || "").trim();
    if (!t || !q) return esc(t);
    const idx = t.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return esc(t);
    const span = 24; const start = Math.max(0, idx - span); const end = Math.min(t.length, idx + q.length + span);
    const raw = t.slice(start, end);
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
    return (start > 0 ? "…" : "") + esc(raw).replace(re, m => `<span class="apz-hit">${esc(m)}</span>`) + (end < t.length ? "…" : "");
  }

  function openFloat(){ float.classList.add("is-open"); float.setAttribute("aria-hidden", "false"); setTimeout(() => input.focus(), 10); }
  function closeFloat(){ float.classList.remove("is-open"); float.setAttribute("aria-hidden", "true"); }

  function renderResults(results, query){
    lastResults = results || []; listEl.innerHTML = ""; emptyEl.style.display = "none";
    if (!query.trim()) return;
    if (!results || !results.length){ emptyEl.textContent = "該当する記事が見つかりませんでした。"; emptyEl.style.display = "block"; return; }

    const q = query.trim();
    listEl.innerHTML = results.map((it, idx) => {
      const pathHtml = [it.l1, it.l2, it.l3].filter(Boolean).map(x => highlightInline(x, q)).join(" / ");
      const inBody = it.body && it.body.toLowerCase().includes(q.toLowerCase());
      const snippetHTML = inBody ? highlightSnippet(it.body, q) : highlightSnippet(it.lead || "", q) || esc((it.body || it.lead || "").slice(0, 60));
      return `<li><button class="apz-item-btn" type="button" data-idx="${idx}"><div class="apz-thumb"><img src="${esc(it.mainImage || FALLBACK_IMG)}" alt=""></div><div class="apz-meta"><div class="apz-l2l3">${pathHtml}</div><div class="apz-title">${highlightInline(it.title, q)}</div><div class="apz-snippet">${snippetHTML}</div></div></button></li>`;
    }).join("");
  }

  async function runSearch(query){
    const q = String(query || "").trim(); lastQuery = q;
    if (!q) return;
    try {
      const res = await fetch(`${ENDPOINT}?q=${encodeURIComponent(q)}&limit=50`, { mode:"cors", cache:"no-store" });
      const json = await res.json();
      const items = (json.items || []).filter(it => it && (it.title || it.lead || it.body));
      renderResults(items, q);
      if (window.innerWidth <= 768) input.blur();
    } catch(_) { renderResults([], q); }
  }

  fab.addEventListener("click", () => float.classList.contains("is-open") ? closeFloat() : openFloat());
  closeBt.addEventListener("click", closeFloat);

  let timer = null;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => runSearch(input.value), 260);
  });

  clearBt.addEventListener("click", () => { input.value = ""; listEl.innerHTML = ""; emptyEl.style.display = "none"; input.focus(); });

  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".apz-item-btn"); if (!btn) return;
    const hit = lastResults[+btn.dataset.idx]; if (!hit) return;
    const base = MENU_URL[hit.l1] || location.origin;
    
    closeFloat();
    /* 【修正】#形式から ?id=形式へ変更 */
    location.href = `${base}?id=${encodeURIComponent(hit.title || "")}`;
  });

  document.addEventListener("click", (e) => { if (!e.target.closest("#apzSearchFloat") && !e.target.closest("#apzSearchFab")) closeFloat(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeFloat(); }, { passive:true });
})();