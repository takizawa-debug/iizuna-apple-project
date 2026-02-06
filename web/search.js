/**
 * search.js - サイト内検索 (AI Intelligent & Loading UI Edition)
 * 役割: 検索中のローディング演出、動的キーワード提案、高視認性UI
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
     1. CSS (巨大文字・ウィンドウ・ローディング)
     ========================================== */
  const style = document.createElement('style');
  style.textContent = `
    .apz-search-fab { position:fixed; right:20px; bottom:20px; width:64px; height:64px; border-radius:50%; background:#cf3a3a; color:#fff; box-shadow:0 8px 24px rgba(0,0,0,.3); display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:12000; transition: transform 0.2s; }
    .apz-search-fab__icon { width:30px; height:30px; }

    .apz-search-float { position:fixed; right:24px; bottom:100px; z-index:12000; pointer-events:none; opacity:0; transform:translateY(12px); transition:all .25s cubic-bezier(0.16, 1, 0.3, 1); }
    .apz-search-float.is-open { opacity:1; transform:translateY(0); pointer-events:auto; }

    /* ウィンドウサイズ 680px */
    .apz-search-card { width:min(680px, 94vw); background:#fff; border-radius:28px; box-shadow:0 25px 70px rgba(0,0,0,.4); padding:24px; box-sizing:border-box; }
    .apz-search-card__title { font-size:1.6rem; font-weight:800; color:#cf3a3a; }
    
    #apzSearchInput { width:100%; box-sizing:border-box; height:64px; border-radius:32px; border:2px solid #eee; padding:0 60px 0 24px; font-size:1.5rem; font-weight:600; outline:none; background:#fcfcfc; transition: all 0.3s; }
    #apzSearchInput:focus { border-color: #cf3a3a; background:#fff; }

    /* レコメンドエリア */
    .apz-search-suggest { margin: 15px 0 20px; padding: 18px; background: #fafafa; border-radius: 20px; border: 1px dashed #ddd; }
    .apz-search-suggest__label { font-size: 1.1rem; font-weight: 800; color: #777; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .apz-search-tags { display: flex; flex-wrap: wrap; gap: 10px; min-height: 40px; }
    .apz-search-tag { padding: 8px 18px; background: #fff; color: #cf3a3a; border-radius: 22px; font-size: 1.15rem; font-weight: 700; cursor: pointer; border: 1px solid #eee; box-shadow: 0 2px 5px rgba(0,0,0,0.05); transition: 0.2s; }
    .apz-search-tag:hover { background: #cf3a3a; color: #fff; transform: translateY(-2px); }

    /* ★検索中 UI */
    .apz-searching-ui { padding: 40px; text-align: center; display: none; flex-direction: column; align-items: center; gap: 15px; }
    .apz-spinner { width: 40px; height: 40px; border: 4px solid rgba(207,58,58,0.1); border-top-color: #cf3a3a; border-radius: 50%; animation: apz-spin 0.8s linear infinite; }
    @keyframes apz-spin { to { transform: rotate(360deg); } }
    .apz-searching-txt { font-size: 1.2rem; font-weight: 600; color: #999; }

    /* 結果表示 */
    .apz-search-results { max-height:450px; overflow-auto; }
    .apz-item-btn { width:100%; display:flex; align-items:center; gap:20px; padding:18px; border:none; border-bottom: 1px solid #f5f5f5; background:transparent; cursor:pointer; text-align:left; border-radius: 16px; }
    .apz-item-btn:hover { background:#fff5f5; }
    .apz-thumb { flex:0 0 85px; height: 85px; border-radius:15px; overflow:hidden; }
    .apz-thumb img { width:100%; height:100%; object-fit:cover; }
    
    .apz-title { font-size:1.4rem; font-weight:800; color:#222; margin-bottom:6px; line-height:1.4; }
    .apz-snippet { font-size:1.1rem; color:#666; line-height:1.6; }
    .apz-hit { background:#fff6a0; color: #000; padding:0 3px; border-radius: 3px; }

    @media (max-width:768px) {
      .apz-search-float { left:0; right:0; bottom:0; }
      .apz-search-card { width:100%; height:90vh; border-radius:28px 28px 0 0; }
    }
  `;
  document.head.appendChild(style);

  /* ==========================================
     2. HTML構造
     ========================================== */
  const searchHTML = `
    <div class="apz-search-fab" id="apzSearchFab" role="button" aria-label="検索">
      <svg viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="apz-search-fab__icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
    </div>
    <div class="apz-search-float" id="apzSearchFloat">
      <div class="apz-search-card">
        <div class="apz-search-card__head">
          <div class="apz-search-card__title">飯綱町の林檎を探す</div>
          <button id="apzSearchClose" style="background:none;border:none;font-size:30px;cursor:pointer;color:#ccc;">✕</button>
        </div>
        <div class="apz-search__box">
          <input id="apzSearchInput" type="search" placeholder="キーワードを入力..." autocomplete="off">
        </div>
        
        <div class="apz-search-suggest" id="apzSearchSuggest">
          <div class="apz-search-suggest__label">✨ おすすめキーワード</div>
          <div class="apz-search-tags" id="apzRecommendTags">
            <span style="color:#bbb;font-size:0.9rem;">読み込み中...</span>
          </div>
        </div>

        <div id="apzSearchingUI" class="apz-searching-ui">
          <div class="apz-spinner"></div>
          <div class="apz-searching-txt">検索しています...</div>
        </div>

        <div class="apz-search-results" id="apzSearchResults">
          <ul class="apz-search-list" id="apzSearchList"></ul>
          <div id="apzSearchEmpty" style="display:none;padding:40px;text-align:center;color:#999;font-size:1.2rem;"></div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', searchHTML);

  /* ==========================================
     3. AIレコメンド & 検索ロジック
     ========================================== */
  const D = document;
  const input = D.getElementById("apzSearchInput");
  const listEl = D.getElementById("apzSearchList");
  const emptyEl = D.getElementById("apzSearchEmpty");
  const suggestEl = D.getElementById("apzSearchSuggest");
  const tagArea = D.getElementById("apzRecommendTags");
  const searchingUI = D.getElementById("apzSearchingUI");

  let lastResults = [];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));

  // AIレコメンドキーワードの生成
  async function refreshAIRecommendations() {
    try {
      tagArea.innerHTML = '<span style="color:#bbb;font-size:0.9rem;">AIが考え中...</span>';
      const res = await fetch(`${ENDPOINT}?all=1`);
      const json = await res.json();
      if (!json.ok) throw new Error();

      const candidates = new Set();
      json.items.forEach(it => {
        if (it.l3 && it.l3.length > 1) candidates.add(it.l3.trim());
        if (it.title && it.title.length < 12) candidates.add(it.title.trim());
      });

      const shuffled = Array.from(candidates).sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 6);

      tagArea.innerHTML = selected.map(word => `<span class="apz-search-tag">${esc(word)}</span>`).join('');
      tagArea.querySelectorAll('.apz-search-tag').forEach(tag => {
        tag.onclick = () => { input.value = tag.textContent; runSearch(input.value); };
      });
    } catch (e) { tagArea.innerHTML = '<span style="color:#bbb;">おすすめが見つかりませんでした</span>'; }
  }

  function renderResults(results, query){
    searchingUI.style.display = "none";
    lastResults = results || []; 
    listEl.innerHTML = "";
    if (!query.trim()) { suggestEl.style.display = "block"; return; }

    suggestEl.style.display = "none";
    if (!results.length){
      emptyEl.textContent = "「" + query + "」に関する記事は見つかりませんでした。";
      emptyEl.style.display = "block"; return;
    }
    
    emptyEl.style.display = "none";
    listEl.innerHTML = results.map((it, idx) => {
      return `<li><button class="apz-item-btn" type="button" data-idx="${idx}"><div class="apz-thumb"><img src="${esc(it.mainImage || FALLBACK_IMG)}"></div><div class="apz-meta"><div class="apz-title">${esc(it.title)}</div><div class="apz-snippet">${esc(it.lead || "")}</div></div></button></li>`;
    }).join("");
  }

  async function runSearch(query){
    const q = query.trim();
    if (!q) { renderResults([], ""); return; }
    
    listEl.innerHTML = "";
    emptyEl.style.display = "none";
    searchingUI.style.display = "flex"; // 検索中UIを表示

    try {
      const res = await fetch(`${SEARCH_ENDPOINT}?q=${encodeURIComponent(q)}&limit=50`);
      const json = await res.json();
      renderResults(json.items || [], q);
    } catch(_) { renderResults([], q); }
  }

  D.getElementById("apzSearchFab").onclick = () => {
    D.getElementById("apzSearchFloat").classList.add("is-open");
    refreshAIRecommendations(); // 開くたびにキーワードを更新
    setTimeout(() => input.focus(), 10);
  };

  D.getElementById("apzSearchClose").onclick = () => D.getElementById("apzSearchFloat").classList.remove("is-open");
  
  let timer = null;
  input.oninput = () => {
    clearTimeout(timer);
    timer = setTimeout(() => runSearch(input.value), 400);
  };

  listEl.onclick = (e) => {
    const btn = e.target.closest(".apz-item-btn");
    if (!btn) return;
    const hit = lastResults[+btn.dataset.idx];
    D.getElementById("apzSearchFloat").classList.remove("is-open");
    location.href = `${MENU_URL[hit.l1] || location.origin}?id=${encodeURIComponent(hit.title)}`;
  };
})();