/**
 * search.js - サイト内検索 (AI Intelligent Recommend Edition)
 * 役割: GASデータからの動的レコメンド、高視認性UI、ダイレクト遷移
 */
(async function apzSearchBoot() {
  "use strict";

  const config = await new Promise(resolve => {
    const check = () => window.LZ_CONFIG ? resolve(window.LZ_CONFIG) : setTimeout(check, 50);
    check();
  });

  const { SEARCH_ENDPOINT, ENDPOINT, MENU_URL, ASSETS } = config;
  const FALLBACK_IMG = ASSETS.LOGO_RED;

  /* ==========================================
     1. CSS (ワイドウィンドウ & 巨大文字)
     ========================================== */
  const style = document.createElement('style');
  style.textContent = `
    .apz-search-fab { position:fixed; right:20px; bottom:20px; width:64px; height:64px; border-radius:50%; background:#cf3a3a; color:#fff; box-shadow:0 8px 24px rgba(0,0,0,.3); display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:12000; transition: transform 0.2s; }
    .apz-search-fab:hover { transform: scale(1.05); }
    .apz-search-fab__icon { width:30px; height:30px; }

    .apz-search-float { position:fixed; right:24px; bottom:100px; z-index:12000; pointer-events:none; opacity:0; transform:translateY(12px); transition:all .25s cubic-bezier(0.16, 1, 0.3, 1); }
    .apz-search-float.is-open { opacity:1; transform:translateY(0); pointer-events:auto; }

    .apz-search-card { width:min(680px, 94vw); background:#fff; border-radius:28px; box-shadow:0 25px 70px rgba(0,0,0,.4); padding:24px; box-sizing:border-box; }
    
    .apz-search-card__head { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
    .apz-search-card__title { font-size:1.6rem; font-weight:800; color:#cf3a3a; letter-spacing:0.02em; }
    .apz-search-card__close { width:36px; height:36px; border-radius:50%; border:none; background:#f5f5f5; cursor:pointer; font-size:24px; display:flex; align-items:center; justify-content:center; color:#999; }

    .apz-search__box { position:relative; margin-bottom:20px; }
    #apzSearchInput { width:100%; box-sizing:border-box; height:60px; border-radius:30px; border:2px solid #eee; padding:0 60px 0 24px; font-size:1.4rem; font-weight:600; outline:none; transition: all 0.3s; background:#fcfcfc; }
    #apzSearchInput:focus { border-color: #cf3a3a; background:#fff; box-shadow:0 0 0 4px rgba(207,58,58,0.1); }
    .apz-search__clear { position:absolute; right:14px; top:50%; transform:translateY(-50%); width:32px; height:32px; border:none; border-radius:50%; background:#ddd; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:18px; }

    /* レコメンドエリア */
    .apz-search-suggest { margin-bottom: 20px; padding: 16px; background: #fafafa; border-radius: 20px; border: 1px dashed #eee; }
    .apz-search-suggest__label { font-size: 1rem; font-weight: 800; color: #666; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .apz-search-suggest__label::before { content: "✨"; }
    .apz-search-tags { display: flex; flex-wrap: wrap; gap: 10px; }
    .apz-search-tag { padding: 8px 18px; background: #fff; color: #cf3a3a; border-radius: 22px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; border: 1px solid #f0f0f0; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .apz-search-tag:hover { background: #cf3a3a; color: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(207,58,58,0.2); }

    /* 結果リスト */
    .apz-search-results { max-height:450px; overflow:auto; padding-right: 4px; }
    .apz-search-list { list-style:none; margin:0; padding:0; }
    .apz-item-btn { width:100%; display:flex; align-items:center; gap:20px; padding:16px; border:none; border-bottom: 1px solid #f5f5f5; background:transparent; cursor:pointer; text-align:left; border-radius: 16px; transition: 0.2s; }
    .apz-item-btn:hover { background:#fff5f5; }
    
    .apz-thumb { flex:0 0 85px; height: 85px; border-radius:15px; overflow:hidden; background:#f6f7f9; }
    .apz-thumb img { width:100%; height:100%; object-fit:cover; }
    
    .apz-meta { flex:1; min-width:0; }
    .apz-l2l3 { font-size:1rem; color:#a0a0a0; margin-bottom:6px; font-weight:600; }
    .apz-title { font-size:1.4rem; font-weight:800; color:#222; margin-bottom:6px; line-height:1.4; }
    .apz-snippet { font-size:1.1rem; color:#666; line-height:1.6; }
    .apz-hit { background:#fff6a0; color: #000; padding:0 3px; border-radius: 3px; }
    .apz-empty { padding:40px; text-align:center; font-size:1.2rem; color:#bbb; font-weight:600; }

    @media (max-width:768px) {
      .apz-search-float { left:0; right:0; bottom:0; transform:translateY(100%); }
      .apz-search-float.is-open { transform:translateY(0); }
      .apz-search-card { width:100%; height:90vh; border-radius:28px 28px 0 0; padding:20px; }
      .apz-search-results { max-height:calc(90vh - 280px); }
      .apz-title { font-size:1.25rem; }
    }
  `;
  document.head.appendChild(style);

  /* ==========================================
     2. HTML構造
     ========================================== */
  const searchHTML = `
    <div class="apz-search-fab" id="apzSearchFab" role="button" aria-label="検索">
      <svg viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="apz-search-fab__icon">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </div>
    <div class="apz-search-float" id="apzSearchFloat" aria-hidden="true">
      <div class="apz-search-card">
        <div class="apz-search-card__head">
          <div class="apz-search-card__title">いいづな林檎サーチ</div>
          <button class="apz-search-card__close" id="apzSearchClose">✕</button>
        </div>
        <div class="apz-search__box">
          <input id="apzSearchInput" type="search" placeholder="キーワードを入力してください..." autocomplete="off">
          <button class="apz-search__clear" id="apzSearchClear" style="display:none;">✕</button>
        </div>
        
        <div class="apz-search-suggest" id="apzSearchSuggest">
          <div class="apz-search-suggest__label">AIおすすめキーワード</div>
          <div class="apz-search-tags" id="apzRecommendTags">
            </div>
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
     3. AIレコメンド & 検索ロジック
     ========================================== */
  const D = document;
  const fab = D.getElementById("apzSearchFab");
  const float = D.getElementById("apzSearchFloat");
  const input = D.getElementById("apzSearchInput");
  const clearBt = D.getElementById("apzSearchClear");
  const listEl = D.getElementById("apzSearchList");
  const emptyEl = D.getElementById("apzSearchEmpty");
  const suggestEl = D.getElementById("apzSearchSuggest");
  const tagArea = D.getElementById("apzRecommendTags");

  let lastResults = [];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));

  // ★ AIレコメンド：データからキーワードをランダム抽出
  async function loadAIRecommendations() {
    try {
      const res = await fetch(`${ENDPOINT}?all=1`);
      const json = await res.json();
      if (!json.ok) return;

      // カテゴリー名(L3)と記事タイトルからランダムにピックアップ
      const candidates = new Set();
      json.items.forEach(it => {
        if (it.l3) candidates.add(it.l3);
        // 短めのタイトルならそのままキーワード候補に
        if (it.title && it.title.length < 10) candidates.add(it.title);
      });

      const shuffled = Array.from(candidates).sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 6); // 6つ表示

      tagArea.innerHTML = selected.map(word => `<span class="apz-search-tag">${esc(word)}</span>`).join('');
      
      // クリックイベントの付与
      tagArea.querySelectorAll('.apz-search-tag').forEach(tag => {
        tag.onclick = () => {
          input.value = tag.textContent;
          runSearch(input.value);
        };
      });
    } catch (e) { console.error("Recommend error:", e); }
  }

  function highlightInline(text, query){
    const q = String(query || "").trim(); if (!text || !q) return esc(text);
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
    return esc(text).replace(re, m => `<span class="apz-hit">${esc(m)}</span>`);
  }

  function highlightSnippet(text, query){
    const t = String(text || ""); const q = String(query || "").trim();
    if (!t || !q) return esc(t.slice(0, 80));
    const idx = t.toLowerCase().indexOf(q.toLowerCase());
    const start = Math.max(0, idx - 30);
    const end = Math.min(t.length, idx + q.length + 40);
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
    return (start > 0 ? "…" : "") + esc(t.slice(start, end)).replace(re, m => `<span class="apz-hit">${esc(m)}</span>`) + (end < t.length ? "…" : "");
  }

  const openFloat = () => { float.classList.add("is-open"); loadAIRecommendations(); setTimeout(() => input.focus(), 10); };
  const closeFloat = () => { float.classList.remove("is-open"); };

  function renderResults(results, query){
    lastResults = results || []; listEl.innerHTML = "";
    const q = query.trim();
    if (!q) { suggestEl.style.display = "block"; emptyEl.style.display = "none"; return; }

    suggestEl.style.display = "none";
    if (!results || !results.length){
      emptyEl.textContent = "「" + q + "」に一致する記事は見つかりませんでした。";
      emptyEl.style.display = "block"; return;
    }
    
    emptyEl.style.display = "none";
    listEl.innerHTML = results.map((it, idx) => {
      const pathHtml = [it.l1, it.l2, it.l3].filter(Boolean).map(x => highlightInline(x, q)).join(" / ");
      return `<li><button class="apz-item-btn" type="button" data-idx="${idx}"><div class="apz-thumb"><img src="${esc(it.mainImage || FALLBACK_IMG)}"></div><div class="apz-meta"><div class="apz-l2l3">${pathHtml}</div><div class="apz-title">${highlightInline(it.title, q)}</div><div class="apz-snippet">${highlightSnippet(it.body || it.lead || "", q)}</div></div></button></li>`;
    }).join("");
  }

  async function runSearch(query){
    const q = query.trim();
    clearBt.style.display = q ? "flex" : "none";
    if (!q) { renderResults([], ""); return; }
    try {
      const res = await fetch(`${SEARCH_ENDPOINT}?q=${encodeURIComponent(q)}&limit=50`);
      const json = await res.json();
      renderResults(json.items || [], q);
    } catch(_) { renderResults([], q); }
  }

  fab.onclick = openFloat;
  D.getElementById("apzSearchClose").onclick = closeFloat;
  clearBt.onclick = () => { input.value = ""; runSearch(""); input.focus(); };
  
  let timer = null;
  input.oninput = () => { clearTimeout(timer); timer = setTimeout(() => runSearch(input.value), 300); };

  listEl.onclick = (e) => {
    const btn = e.target.closest(".apz-item-btn"); if (!btn) return;
    const hit = lastResults[+btn.dataset.idx]; if (!hit) return;
    closeFloat();
    location.href = `${MENU_URL[hit.l1] || location.origin}?id=${encodeURIComponent(hit.title)}`;
  };
  
  D.addEventListener("click", (e) => { if (!e.target.closest(".apz-search-card") && !e.target.closest("#apzSearchFab")) closeFloat(); });
})();