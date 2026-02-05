(async function apzSearchBoot() {
  "use strict";

  /* ==========================================
     0. Configの読み込み待機
     ========================================== */
  const config = await new Promise(resolve => {
    const check = () => window.LZ_CONFIG ? resolve(window.LZ_CONFIG) : setTimeout(check, 50);
    check();
  });

  const { SEARCH_ENDPOINT, MENU_URL, ASSETS } = config;
  const FALLBACK_IMG = ASSETS.LOGO_RED;

  /* ==========================================
     1. CSSの注入
     ========================================== */
  const style = document.createElement('style');
  style.textContent = `
    .apz-search-fab { position:fixed; right:16px; bottom:16px; width:52px; height:52px; border-radius:999px; background:#cf3a3a; color:#fff; box-shadow:0 8px 20px rgba(0,0,0,.25); display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:12000; }
    .apz-search-fab__icon { width:24px; height:24px; flex-shrink: 0; }
    .apz-search-float { position:fixed; right:20px; bottom:88px; z-index:12000; pointer-events:none; opacity:0; transform:translateY(8px); transition:opacity .16s ease, transform .16s ease; }
    .apz-search-float.is-open { opacity:1; transform:translateY(0); pointer-events:auto; }
    .apz-search-card { width:min(520px, 80vw); background:#fff; color:#222; border-radius:18px; box-shadow:0 18px 50px rgba(0,0,0,.28); padding:12px 12px 10px; box-sizing:border-box; }
    .apz-search-card__head { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px; }
    .apz-search-card__title { font-size:1.1rem; font-weight:600; }
    .apz-search-card__close { width:26px; height:26px; border-radius:999px; border:1px solid #ddd; background:#f8f8f8; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px; line-height:1; }
    .apz-search__box { position:relative; margin-bottom:8px; }
    #apzSearchInput { width:100%; box-sizing:border-box; height:38px; border-radius:999px; border:1px solid #ddd; padding:0 34px 0 12px; font-size:0.95rem; font-family:system-ui,-apple-system,sans-serif; }
    #apzSearchInput::-webkit-search-cancel-button { -webkit-appearance: none; }
    .apz-search__clear { position:absolute; right:6px; top:50%; transform:translateY(-50%); width:22px; height:22px; border:none; border-radius:50%; background:rgba(0,0,0,.08); color:#333; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:13px; }
    .apz-search-results { max-height:280px; overflow:auto; -webkit-overflow-scrolling:touch; }
    .apz-search-list { list-style:none; margin:0; padding:4px 0 6px; }
    .apz-item-btn { width:100%; display:flex; align-items:flex-start; gap:10px; padding:8px 10px; font-size:1rem; border:none; border-bottom: 1px solid #f0f0f0; background:transparent; cursor:pointer; text-align:left; }
    .apz-item-btn:hover { background:#f5f5f7; }
    .apz-thumb { flex:0 0 56px; position:relative; border-radius:10px; overflow:hidden; background:#f6f7f9; }
    .apz-thumb::before { content:""; display:block; padding-top:100%; }
    .apz-thumb img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
    .apz-meta { flex:1 1 auto; min-width:0; }
    .apz-l2l3 { font-size:0.85rem; color:#888; margin-bottom:2px; }
    .apz-title { font-size:1.05rem; font-weight:600; color:#222; margin-bottom:2px; }
    .apz-snippet { font-size:0.9rem; color:#555; line-height:1.5; }
    .apz-hit { background:#fff6a0; padding:0 0.08em; }
    .apz-empty { padding:10px 12px; font-size:0.95rem; color:#666; }
    @media (max-width:768px) {
      .apz-search-float { left:0; right:0; bottom:0; top:auto; transform:translateY(8px); }
      .apz-search-float.is-open { transform:translateY(0); }
      .apz-search-card { width:100%; max-width:none; max-height:60vh; border-radius:18px 18px 0 0; }
      #apzSearchInput { height:44px; font-size:16px; }
      .apz-search-results { max-height:calc(60vh - 72px); }
    }
  `;
  document.head.appendChild(style);

  /* ==========================================
     2. HTML構造の注入
     ========================================== */
  const searchHTML = `
    <div class="apz-search-fab" id="apzSearchFab" role="button" aria-label="検索">
      <svg viewbox="0 0 24 24" aria-hidden="true" class="apz-search-fab__icon">
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"></circle>
        <line x1="16" y1="16" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
      </svg>
    </div>
    <div class="apz-search-float" id="apzSearchFloat" aria-hidden="true">
      <div class="apz-search-card">
        <div class="apz-search-card__head">
          <div class="apz-search-card__title">サイト内検索</div>
          <button class="apz-search-card__close" id="apzSearchClose">×</button>
        </div>
        <div class="apz-search__box">
          <input id="apzSearchInput" type="search" placeholder="キーワードで探す" autocomplete="off">
          <button class="apz-search__clear" id="apzSearchClear">×</button>
        </div>
        <div class="apz-search-results" id="apzSearchResults">
          <ul class="apz-search-list" id="apzSearchList"></ul>
          <div class="apz-empty" id="apzSearchEmpty" style="display:none;"></div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', searchHTML);

  /* ==========================================
     3. 検索ロジック
     ========================================== */
  const D = document;
  const fab     = D.getElementById("apzSearchFab");
  const float   = D.getElementById("apzSearchFloat");
  const closeBt = D.getElementById("apzSearchClose");
  const input   = D.getElementById("apzSearchInput");
  const clearBt = D.getElementById("apzSearchClear");
  const listEl  = D.getElementById("apzSearchList");
  const emptyEl = D.getElementById("apzSearchEmpty");

  let lastResults = [];
  const esc = s => String(s ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");

  function highlightInline(text, query){
    const q = String(query || "").trim(); if (!text || !q) return esc(text);
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
    return esc(text).replace(re, m => `<span class="apz-hit">${esc(m)}</span>`);
  }

  function highlightSnippet(text, query){
    const t = String(text || ""); const q = String(query || "").trim();
    if (!t || !q) return esc(t);
    const idx = t.toLowerCase().indexOf(q.toLowerCase()); if (idx === -1) return esc(t);
    const span = 24; const start = Math.max(0, idx - span); const end = Math.min(t.length, idx + q.length + span);
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
    return (start > 0 ? "…" : "") + esc(t.slice(start, end)).replace(re, m => `<span class="apz-hit">${esc(m)}</span>`) + (end < t.length ? "…" : "");
  }

  const openFloat = () => { float.classList.add("is-open"); float.setAttribute("aria-hidden", "false"); setTimeout(() => input.focus(), 10); };
  const closeFloat = () => { float.classList.remove("is-open"); float.setAttribute("aria-hidden", "true"); };

  function renderResults(results, query){
    lastResults = results || []; listEl.innerHTML = ""; emptyEl.style.display = "none";
    if (!query.trim()) return;
    if (!results || !results.length){ emptyEl.textContent = "該当する記事が見つかりませんでした。"; emptyEl.style.display = "block"; return; }
    
    listEl.innerHTML = results.map((it, idx) => {
      const pathHtml = [it.l1, it.l2, it.l3].filter(Boolean).map(x => highlightInline(x, query)).join(" / ");
      return `<li><button class="apz-item-btn" type="button" data-idx="${idx}"><div class="apz-thumb"><img src="${esc(it.mainImage || FALLBACK_IMG)}"></div><div class="apz-meta"><div class="apz-l2l3">${pathHtml}</div><div class="apz-title">${highlightInline(it.title, query)}</div><div class="apz-snippet">${it.body ? highlightSnippet(it.body, query) : esc((it.lead || "").slice(0, 60))}</div></div></button></li>`;
    }).join("");
  }

  async function runSearch(query){
    const q = query.trim(); if (!q) return;
    try {
      const res = await fetch(`${SEARCH_ENDPOINT}?q=${encodeURIComponent(q)}&limit=50`);
      const json = await res.json();
      const items = (json.items || []).filter(it => it && (it.title || it.lead || it.body));
      renderResults(items, q);
      if (window.innerWidth <= 768) input.blur();
    } catch(_) { renderResults([], q); }
  }

  fab.onclick = () => float.classList.contains("is-open") ? closeFloat() : openFloat();
  closeBt.onclick = closeFloat;
  clearBt.onclick = () => { input.value = ""; listEl.innerHTML = ""; emptyEl.style.display = "none"; input.focus(); };
  
  let timer = null;
  input.oninput = () => { clearTimeout(timer); timer = setTimeout(() => runSearch(input.value), 260); };

  listEl.onclick = (e) => {
    const btn = e.target.closest(".apz-item-btn"); if (!btn) return;
    const hit = lastResults[+btn.dataset.idx]; if (!hit) return;
    closeFloat();
    location.href = `${MENU_URL[hit.l1] || location.origin}?id=${encodeURIComponent(hit.title)}`;
  };
  
  document.addEventListener("click", (e) => { if (!e.target.closest("#apzSearchFloat") && !e.target.closest("#apzSearchFab")) closeFloat(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeFloat(); }, { passive:true });
})();