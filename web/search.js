/**
 * search.js - サイト内検索コンポーネント (Guided & High-Visibility Edition)
 * 役割: 高視認性UI、おすすめキーワード提案、アンカーリンク遷移
 */
(async function apzSearchBoot() {
  "use strict";

  const config = await new Promise(resolve => {
    const check = () => window.LZ_CONFIG ? resolve(window.LZ_CONFIG) : setTimeout(check, 50);
    check();
  });

  const { SEARCH_ENDPOINT, MENU_URL, ASSETS } = config;
  const FALLBACK_IMG = ASSETS.LOGO_RED;

  /* ==========================================
     1. CSSの注入 (ウィンドウ拡大 & 文字サイズ大幅アップ)
     ========================================== */
  const style = document.createElement('style');
  style.textContent = `
    .apz-search-fab { position:fixed; right:20px; bottom:20px; width:64px; height:64px; border-radius:50%; background:#cf3a3a; color:#fff; box-shadow:0 8px 24px rgba(0,0,0,.3); display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:12000; transition: transform 0.2s; }
    .apz-search-fab:hover { transform: scale(1.05); }
    .apz-search-fab__icon { width:30px; height:30px; }

    .apz-search-float { position:fixed; right:24px; bottom:100px; z-index:12000; pointer-events:none; opacity:0; transform:translateY(12px); transition:all .25s cubic-bezier(0.16, 1, 0.3, 1); }
    .apz-search-float.is-open { opacity:1; transform:translateY(0); pointer-events:auto; }

    /* ★ウィンドウサイズ拡大：520px -> 680px */
    .apz-search-card { width:min(680px, 94vw); background:#fff; border-radius:24px; box-shadow:0 20px 60px rgba(0,0,0,.35); padding:20px; box-sizing:border-box; }
    
    .apz-search-card__head { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
    .apz-search-card__title { font-size:1.4rem; font-weight:800; color:#cf3a3a; }
    .apz-search-card__close { width:32px; height:32px; border-radius:50%; border:none; background:#f0f0f0; cursor:pointer; font-size:20px; display:flex; align-items:center; justify-content:center; }

    /* 検索ボックス巨大化 */
    .apz-search__box { position:relative; margin-bottom:16px; }
    #apzSearchInput { width:100%; box-sizing:border-box; height:54px; border-radius:27px; border:2px solid #eee; padding:0 50px 0 20px; font-size:1.25rem; font-weight:600; outline:none; transition: border-color 0.2s; }
    #apzSearchInput:focus { border-color: #cf3a3a; }
    .apz-search__clear { position:absolute; right:12px; top:50%; transform:translateY(-50%); width:28px; height:28px; border:none; border-radius:50%; background:#eee; cursor:pointer; display:flex; align-items:center; justify-content:center; }

    /* ★新機能：おすすめタグエリア */
    .apz-search-suggest { margin-bottom: 16px; }
    .apz-search-suggest__label { font-size: 0.9rem; font-weight: 700; color: #999; margin-bottom: 8px; margin-left: 4px; }
    .apz-search-tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .apz-search-tag { padding: 6px 14px; background: #fdf2f2; color: #cf3a3a; border-radius: 18px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: 0.2s; border: 1px solid transparent; }
    .apz-search-tag:hover { background: #cf3a3a; color: #fff; }

    /* 検索結果リスト */
    .apz-search-results { max-height:400px; overflow:auto; padding-right: 4px; }
    .apz-search-results::-webkit-scrollbar { width: 6px; }
    .apz-search-results::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
    
    .apz-search-list { list-style:none; margin:0; padding:0; }
    .apz-item-btn { width:100%; display:flex; align-items:center; gap:16px; padding:12px; border:none; border-bottom: 1px solid #f5f5f5; background:transparent; cursor:pointer; text-align:left; border-radius: 12px; transition: 0.2s; }
    .apz-item-btn:hover { background:#fff5f5; }
    
    .apz-thumb { flex:0 0 70px; height: 70px; border-radius:12px; overflow:hidden; background:#f6f7f9; }
    .apz-thumb img { width:100%; height:100%; object-fit:cover; }
    
    .apz-meta { flex:1; min-width:0; }
    .apz-l2l3 { font-size:0.95rem; color:#888; margin-bottom:4px; font-weight:500; }
    .apz-title { font-size:1.2rem; font-weight:700; color:#222; margin-bottom:4px; line-height:1.3; }
    .apz-snippet { font-size:1rem; color:#666; line-height:1.5; }
    .apz-hit { background:#fff6a0; color: #000; padding:0 2px; border-radius: 2px; }
    .apz-empty { padding:30px; text-align:center; font-size:1.1rem; color:#999; }

    @media (max-width:768px) {
      .apz-search-float { left:0; right:0; bottom:0; transform:translateY(100%); }
      .apz-search-float.is-open { transform:translateY(0); }
      .apz-search-card { width:100%; height:85vh; border-radius:24px 24px 0 0; }
      #apzSearchInput { height:50px; font-size:1.1rem; }
      .apz-search-results { max-height:calc(85vh - 200px); }
    }
  `;
  document.head.appendChild(style);

  /* ==========================================
     2. HTML構造の注入 (おすすめタグを追加)
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
          <div class="apz-search-card__title">飯綱町の林檎を探す</div>
          <button class="apz-search-card__close" id="apzSearchClose">✕</button>
        </div>
        <div class="apz-search__box">
          <input id="apzSearchInput" type="search" placeholder="キーワードを入力..." autocomplete="off">
          <button class="apz-search__clear" id="apzSearchClear" style="display:none;">✕</button>
        </div>
        
        <div class="apz-search-suggest" id="apzSearchSuggest">
          <div class="apz-search-suggest__label">おすすめのキーワード</div>
          <div class="apz-search-tags">
            <span class="apz-search-tag">サンふじ</span>
            <span class="apz-search-tag">シナノゴールド</span>
            <span class="apz-search-tag">直売所</span>
            <span class="apz-search-tag">アップルパイ</span>
            <span class="apz-search-tag">ふるさと納税</span>
            <span class="apz-search-tag">いいづな歴史</span>
          </div>
        </div>

        <div class="apz-search-results" id="apzSearchResults">
          <ul class="apz-search-list" id="apzSearchList"></ul>
          <div class="apz-empty" id="apzSearchEmpty" style="display:none;">キーワードを入力してください</div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', searchHTML);

  /* ==========================================
     3. 検索ロジック
     ========================================== */
  const D = document;
  const fab = D.getElementById("apzSearchFab");
  const float = D.getElementById("apzSearchFloat");
  const closeBt = D.getElementById("apzSearchClose");
  const input = D.getElementById("apzSearchInput");
  const clearBt = D.getElementById("apzSearchClear");
  const listEl = D.getElementById("apzSearchList");
  const emptyEl = D.getElementById("apzSearchEmpty");
  const suggestEl = D.getElementById("apzSearchSuggest");

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
    const idx = t.toLowerCase().indexOf(q.toLowerCase()); if (idx === -1) return esc(t.slice(0, 60));
    const span = 30; const start = Math.max(0, idx - span); const end = Math.min(t.length, idx + q.length + span);
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
    return (start > 0 ? "…" : "") + esc(t.slice(start, end)).replace(re, m => `<span class="apz-hit">${esc(m)}</span>`) + (end < t.length ? "…" : "");
  }

  const openFloat = () => { float.classList.add("is-open"); setTimeout(() => input.focus(), 10); };
  const closeFloat = () => { float.classList.remove("is-open"); };

  function renderResults(results, query){
    lastResults = results || []; 
    listEl.innerHTML = "";
    const q = query.trim();

    if (!q) {
      suggestEl.style.display = "block";
      emptyEl.style.display = "block";
      emptyEl.textContent = "キーワードを入力してください";
      return;
    }

    suggestEl.style.display = "none";
    if (!results || !results.length){
      emptyEl.textContent = "「" + q + "」に一致する記事は見つかりませんでした。";
      emptyEl.style.display = "block";
      return;
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
  closeBt.onclick = closeFloat;
  clearBt.onclick = () => { input.value = ""; runSearch(""); input.focus(); };
  
  // おすすめタグのクリックイベント
  D.querySelectorAll(".apz-search-tag").forEach(tag => {
    tag.onclick = () => {
      input.value = tag.textContent;
      runSearch(input.value);
    };
  });

  let timer = null;
  input.oninput = () => { clearTimeout(timer); timer = setTimeout(() => runSearch(input.value), 300); };

  listEl.onclick = (e) => {
    const btn = e.target.closest(".apz-item-btn"); if (!btn) return;
    const hit = lastResults[+btn.dataset.idx]; if (!hit) return;
    closeFloat();
    // アンカーリンク形式で遷移
    location.href = `${MENU_URL[hit.l1]}#${encodeURIComponent(hit.l2)}`;
  };
  
  D.addEventListener("click", (e) => { if (!e.target.closest(".apz-search-card") && !e.target.closest("#apzSearchFab")) closeFloat(); });
})();