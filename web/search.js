/**
 * search.js - サイト内検索 (Highlight & Dynamic Refresh Edition)
 * 役割: ヒットワードの黄色ハイライト、×ボタンでの5語レコメンド更新、高視認性UI
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
     1. 厳選キーワードリスト（約100個）
     ========================================== */
  const RECOMMEND_WORDS = [
    "サンふじ", "シナノゴールド", "シナノスイート", "秋映", "紅玉", "グラニースミス", "ブラムリー", "高坂りんご", "メイポール", "ドルゴ", "和リンゴ", "ムーンルージュ", "なかののきらめき", "いろどり", "ぐんま名月", "王林", "ジョナゴールド", "つがる", "きたろう", "はるか", "あいかの香り", "千秋", "世界一", "ニュートン",
    "直売所", "いいづなマルシェむれ", "さんちゃん", "横手販売所", "アップルパイ", "タルトタタン", "シードル", "りんごジュース", "ジャム", "ドライフルーツ", "焼きりんご", "りんご飴", "コンポート", "りんごバター", "ドレッシング",
    "ふるさと納税", "オーナー制度", "収穫体験", "りんご狩り", "剪定", "摘花", "袋掛け", "葉取らず", "蜜入り", "完熟", "産地直送", "贈答用", "家庭用", "お徳用",
    "飯綱町", "三水", "牟礼", "北信州", "霊仙寺湖", "飯縄山", "北信五岳", "丹霞郷", "いいづな歴史", "英国りんご", "クッキングアップル", "加工用りんご",
    "いいづなコネクト", "廃校活用", "ワークラボ", "りんごの聖地", "1127の日", "いいづな事業部", "農家直送", "りんご並木", "雪中貯蔵", "スマート農業",
    "レシピ", "離乳食", "簡単デザート", "お弁当", "健康", "美容", "ポリフェノール", "ビタミンC", "整腸作用", "ダイエット", "医者いらず",
    "カフェ", "レストラン", "スイーツショップ", "観光", "散策", "サイクリング", "写真映え", "冬景色", "花見", "りんごの花", "お土産", "人気ランキング", "おすすめ", "隠れた名店"
  ];

  /* ==========================================
     2. CSS (巨大化 ＋ ハイライト ＋ 検索中アニメ)
     ========================================== */
  const style = document.createElement('style');
  style.textContent = `
    .apz-search-fab { position:fixed; right:20px; bottom:20px; width:64px; height:64px; border-radius:50%; background:#cf3a3a; color:#fff; box-shadow:0 8px 24px rgba(0,0,0,.3); display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:12000; }
    .apz-search-fab__icon { width:32px; height:32px; }

    .apz-search-float { position:fixed; right:24px; bottom:100px; z-index:12000; pointer-events:none; opacity:0; transform:translateY(12px); transition:all .25s cubic-bezier(0.16, 1, 0.3, 1); }
    .apz-search-float.is-open { opacity:1; transform:translateY(0); pointer-events:auto; }

    .apz-search-card { width:min(680px, 94vw); background:#fff; border-radius:28px; box-shadow:0 25px 70px rgba(0,0,0,.4); padding:24px; box-sizing:border-box; }
    .apz-search-card__head { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
    .apz-search-card__title { font-size:1.6rem; font-weight:800; color:#cf3a3a; }
    .apz-search-card__close { width:36px; height:36px; border-radius:50%; border:none; background:#f5f5f5; cursor:pointer; font-size:24px; color:#999; display:flex; align-items:center; justify-content:center; }

    .apz-search__box { position:relative; margin-bottom:20px; }
    #apzSearchInput { width:100%; box-sizing:border-box; height:64px; border-radius:32px; border:2px solid #eee; padding:0 60px 0 24px; font-size:1.5rem; font-weight:600; outline:none; transition: all 0.3s; background:#fcfcfc; }
    #apzSearchInput:focus { border-color: #cf3a3a; background:#fff; }
    .apz-search__clear { position:absolute; right:16px; top:50%; transform:translateY(-50%); width:32px; height:32px; border:none; border-radius:50%; background:#ddd; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:18px; }

    /* おすすめレコメンド */
    .apz-search-suggest { margin-bottom: 20px; padding: 16px; background: #fafafa; border-radius: 20px; border: 1px dashed #ddd; }
    .apz-search-suggest__label { font-size: 1rem; font-weight: 800; color: #888; margin-bottom: 12px; }
    .apz-search-tags { display: flex; flex-wrap: wrap; gap: 10px; }
    .apz-search-tag { padding: 8px 18px; background: #fff; color: #cf3a3a; border-radius: 22px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: 0.2s; border: 1px solid #f0f0f0; }
    .apz-search-tag:hover { background: #cf3a3a; color: #fff; transform: translateY(-2px); }

    /* 検索中ローディング */
    .apz-search-searching { display:none; padding:40px; text-align:center; flex-direction:column; align-items:center; gap:16px; }
    .apz-search-searching.is-active { display:flex; }
    .apz-search-spinner { width:40px; height:40px; border:4px solid rgba(207,58,58,0.1); border-top-color:#cf3a3a; border-radius:50%; animation: apz-spin 0.8s linear infinite; }
    @keyframes apz-spin { to { transform: rotate(360deg); } }

    /* 結果リスト ＋ ハイライト */
    .apz-search-results { max-height:450px; overflow:auto; }
    .apz-item-btn { width:100%; display:flex; align-items:center; gap:20px; padding:18px; border:none; border-bottom: 1px solid #f5f5f5; background:transparent; cursor:pointer; text-align:left; border-radius:16px; }
    .apz-item-btn:hover { background:#fff5f5; }
    .apz-thumb { flex:0 0 90px; height: 90px; border-radius:15px; overflow:hidden; background:#f6f7f9; }
    .apz-thumb img { width:100%; height:100%; object-fit:cover; }
    .apz-title { font-size:1.5rem; font-weight:800; color:#222; margin-bottom:6px; line-height:1.4; }
    .apz-snippet { font-size:1.15rem; color:#666; line-height:1.6; }
    
    /* ★ワードハイライト（黄色い編みかけ） */
    .apz-hit { background:#fff6a0 !important; color:#000 !important; padding:0 2px !important; border-radius:3px !important; font-weight:bold !important; }

    .apz-empty { padding:50px; text-align:center; font-size:1.3rem; color:#bbb; display:none; }

    @media (max-width:768px) {
      .apz-search-float { left:0; right:0; bottom:0; transform:translateY(100%); }
      .apz-search-float.is-open { transform:translateY(0); }
      .apz-search-card { width:100%; height:88vh; border-radius:28px 28px 0 0; }
    }
  `;
  document.head.appendChild(style);

  /* ==========================================
     3. HTML構造
     ========================================== */
  const searchHTML = `
    <div class="apz-search-fab" id="apzSearchFab" role="button">
      <svg viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="apz-search-fab__icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
    </div>
    <div class="apz-search-float" id="apzSearchFloat" aria-hidden="true">
      <div class="apz-search-card">
        <div class="apz-search-card__head">
          <div class="apz-search-card__title">サイト内検索</div>
          <button class="apz-search-card__close" id="apzSearchClose">✕</button>
        </div>
        <div class="apz-search__box">
          <input id="apzSearchInput" type="search" placeholder="何をお探しですか？" autocomplete="off">
          <button class="apz-search__clear" id="apzSearchClear" style="display:none;">✕</button>
        </div>
        <div class="apz-search-suggest" id="apzSearchSuggest">
          <div class="apz-search-suggest__label">✨ おすすめキーワード</div>
          <div class="apz-search-tags" id="apzRecommendTags"></div>
        </div>
        <div class="apz-search-searching" id="apzSearchSearching">
          <div class="apz-search-spinner"></div>
          <div style="font-size:1.3rem;font-weight:600;color:#cf3a3a;margin-top:12px;">検索しています...</div>
        </div>
        <div class="apz-search-results" id="apzSearchResults">
          <ul class="apz-search-list" id="apzSearchList" style="list-style:none;margin:0;padding:0;"></ul>
          <div class="apz-empty" id="apzSearchEmpty">見つかりませんでした</div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', searchHTML);

  /* ==========================================
     4. ユーティリティ: ハイライト・スニペット
     ========================================== */
  const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));

  function highlight(text, query) {
    if (!query) return esc(text);
    const q = query.trim();
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
    return esc(text).replace(re, '<span class="apz-hit">$1</span>');
  }

  function getSnippet(text, query) {
    const t = String(text || "");
    const q = query.trim();
    const idx = t.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return esc(t.slice(0, 80)) + "...";
    const start = Math.max(0, idx - 30);
    const end = Math.min(t.length, idx + q.length + 50);
    const snippet = (start > 0 ? "..." : "") + t.slice(start, end) + (end < t.length ? "..." : "");
    return highlight(snippet, q);
  }

  /* ==========================================
     5. 検索・レコメンドロジック
     ========================================== */
  const D = document, fab = D.getElementById("apzSearchFab"), float = D.getElementById("apzSearchFloat");
  const input = D.getElementById("apzSearchInput"), clearBt = D.getElementById("apzSearchClear");
  const listEl = D.getElementById("apzSearchList"), emptyEl = D.getElementById("apzSearchEmpty");
  const suggestEl = D.getElementById("apzSearchSuggest"), tagArea = D.getElementById("apzRecommendTags");
  const searchingEl = D.getElementById("apzSearchSearching");

  let lastResults = [];

  // ★レコメンド更新：5つに絞ってランダム抽出
  function refreshRecommendations() {
    const shuffled = [...RECOMMEND_WORDS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    tagArea.innerHTML = selected.map(word => `<span class="apz-search-tag">${word}</span>`).join('');
    tagArea.querySelectorAll('.apz-search-tag').forEach(tag => {
      tag.onclick = () => { input.value = tag.textContent; runSearch(input.value); };
    });
  }

  function renderResults(results, query){
    lastResults = results || []; 
    listEl.innerHTML = "";
    searchingEl.classList.remove("is-active"); 

    if (!query.trim()) { suggestEl.style.display = "block"; emptyEl.style.display = "none"; return; }

    suggestEl.style.display = "none";
    if (!results || !results.length){ emptyEl.style.display = "block"; return; }
    
    emptyEl.style.display = "none";
    listEl.innerHTML = results.map((it, idx) => `
      <li><button class="apz-item-btn" type="button" data-idx="${idx}">
        <div class="apz-thumb"><img src="${it.mainImage || FALLBACK_IMG}"></div>
        <div class="apz-meta">
          <div class="apz-l2l3">${esc(it.l1)} / ${esc(it.l2)}</div>
          <div class="apz-title">${highlight(it.title, query)}</div>
          <div class="apz-snippet">${getSnippet(it.body || it.lead || "", query)}</div>
        </div>
      </button></li>`).join("");
  }

  async function runSearch(query){
    const q = query.trim();
    clearBt.style.display = q ? "flex" : "none";
    if (!q) { renderResults([], ""); return; }

    listEl.innerHTML = "";
    emptyEl.style.display = "none";
    suggestEl.style.display = "none";
    searchingEl.classList.add("is-active");

    try {
      const res = await fetch(`${SEARCH_ENDPOINT}?q=${encodeURIComponent(q)}&limit=50`);
      const json = await res.json();
      renderResults(json.items || [], q);
    } catch(_) { renderResults([], q); }
  }

  const openFloat = () => { float.classList.add("is-open"); refreshRecommendations(); setTimeout(() => input.focus(), 10); };
  
  fab.onclick = openFloat;
  D.getElementById("apzSearchClose").onclick = () => float.classList.remove("is-open");
  
  // ★×ボタンクリック時にレコメンドを更新する
  clearBt.onclick = () => { 
    input.value = ""; 
    refreshRecommendations(); // リストを新しくする
    runSearch(""); 
    input.focus(); 
  };
  
  let timer = null;
  input.oninput = () => { 
    clearTimeout(timer); 
    if (!input.value.trim()) {
      refreshRecommendations(); // 文字を全部消した時も更新
      renderResults([], "");
    } else {
      timer = setTimeout(() => runSearch(input.value), 400); 
    }
  };

  listEl.onclick = (e) => {
    const btn = e.target.closest(".apz-item-btn"); if (!btn) return;
    const hit = lastResults[+btn.dataset.idx]; if (!hit) return;
    location.href = `${MENU_URL[hit.l1] || location.origin}?id=${encodeURIComponent(hit.title)}`;
  };
  
  D.addEventListener("click", (e) => { if (!e.target.closest(".apz-search-card") && !e.target.closest("#apzSearchFab")) float.classList.remove("is-open"); });
})();