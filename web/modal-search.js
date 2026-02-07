/**
 * modal-search.js - モーダル内広域検索エンジン (全域リンク自動パッチ版)
 * 役割: サイト全域のタイトルを検知。データが届き次第、未処理のリンクを自動で赤文字に塗り替える。
 */
window.lzSearchEngine = (function() {
  "use strict";
  var C = window.LZ_COMMON;

  var MASTER_TAGS = [
    "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月", "4月", "5月", "6月", "7月",
    "北信五岳", "移住", "子育て", "ふじ", "高坂りんご", "ブラムリー", "サンふじ",
    "シードル", "アップルミュージアム", "アクセス", "歴史", "機能性成分", "プロシアニジン", "甘みと酸味のバランス"
  ];

  /* スタイル注入：ホバー色・プレースホルダー・アクセシビリティ */
  var injectSearchStyles = function() {
    if (document.getElementById('lz-search-engine-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-search-engine-styles';
    style.textContent = [
      '.lz-btn-search-back { margin-top:20px; width:100%; border:2px solid #27ae60 !important; color:#27ae60 !important; background:#fff !important; transition:.2s; font-weight:800; }',
      '.lz-btn-search-back:hover { background:#27ae60 !important; color:#fff !important; }',
      '.lz-s-img-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; padding:20px; box-sizing:border-box; background:#f9f9f9; }',
      '.lz-s-img-placeholder img { width:100%; height:100%; object-fit:contain; opacity:0.15; filter:grayscale(1); }',
      'mark { background:#fff566; border-radius:2px; padding:0 2px; }'
    ].join('\n');
    document.head.appendChild(style);
  };

  /* データを裏側で先読みし、読み終わったら開いているモーダルのリンクを更新する */
  async function prefetchData() {
    if (window.LZ_DATA && window.LZ_DATA.length > 0) return;
    try {
      var res = await fetch(window.LZ_CONFIG.ENDPOINT);
      var json = await res.json();
      window.LZ_DATA = json.items || [];
      // データが届いた瞬間にモーダルが開いていれば、リンクを最新データで更新する
      if (typeof window.lzModal !== "undefined" && window.lzModal.refreshLinks) {
        window.lzModal.refreshLinks();
      }
    } catch(e) {}
  }
  prefetchData();

  return {
    /**
     * オートリンク生成ロジック
     * ページ内のカード（即座） ＋ サイト全域データ（届き次第）を組み合わせて赤リンク化
     */
    applyLinks: function(text, currentId, targetLang) {
      var map = {};
      
      // 1. キーワード(緑)を仮登録
      MASTER_TAGS.forEach(function(tag) { map[tag] = { word: tag, type: 'search' }; });

      // 2. ページ内のカード(赤)を登録（DOMベースなので即座に可能）
      document.querySelectorAll('.lz-card').forEach(function(card) {
        try {
          var d = JSON.parse(card.dataset.item || "{}");
          var title = C.L(d, 'title', targetLang);
          if (title && title.length > 1 && card.dataset.id !== currentId) {
            map[title] = { word: title, id: card.dataset.id, type: 'direct' };
          }
        } catch(e){}
      });

      // 3. サイト全域データ(赤)を登録（prefetch完了後であれば反映される）
      if (window.LZ_DATA && Array.isArray(window.LZ_DATA)) {
        window.LZ_DATA.forEach(function(item) {
          var title = C.L(item, 'title', targetLang); // システム標準 C.L で解決
          // 自分自身ではなく、まだ登録されていない(または緑を赤で上書き)タイトルを登録
          if (title && title.length > 1 && item.title !== currentId) {
             map[title] = { word: title, id: item.title, type: 'direct' };
          }
        });
      }

      var candidates = Object.values(map).sort(function(a,b){ return b.word.length - a.word.length; });
      var escaped = C.esc(text), tokens = [];
      candidates.forEach(function(item, idx) {
        var regex = new RegExp(item.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        escaped = escaped.replace(regex, function(match) {
          var token = "###LZT_" + idx + "###";
          tokens[idx] = item.type === 'direct' 
            ? '<span class="lz-auto-link direct" data-goto-id="'+item.id+'">'+match+'</span>'
            : '<span class="lz-auto-link search" data-keyword="'+item.word+'">'+match+'</span>';
          return token;
        });
      });
      tokens.forEach(function(html, idx){ if(html) escaped = escaped.replace(new RegExp("###LZT_" + idx + "###", "g"), html); });
      return escaped;
    },

    /**
     * 広域検索実行 (search.jsと同じGAS検索手法)
     */
    run: async function(keyword, targetLang, modalEl, backFunc) {
      injectSearchStyles();
      modalEl.innerHTML = '<div style="padding:60px; text-align:center;"><p style="font-weight:bold; color:#cf3a3a;">' + (C.T('検索しています...') || 'Searching...') + '</p></div>';
      
      try {
        var endpoint = window.LZ_CONFIG.SEARCH_ENDPOINT + "?q=" + encodeURIComponent(keyword) + "&limit=50";
        var res = await fetch(endpoint);
        var json = await res.json();
        var currentId = new URLSearchParams(location.search).get('id');
        var results = (json.items || []).filter(function(it){ return it.title !== currentId; });

        var hl = function(text){ return text.split(keyword).join('<mark>' + keyword + '</mark>'); };
        var html = '<div class="lz-s-wrap"><div class="lz-s-title">「' + C.esc(keyword) + '」に関連する情報</div>';
        
        if(results.length === 0) {
          html += '<div style="padding:30px; border:2px dashed #eee; border-radius:12px; text-align:center; color:#888;">' + (C.T('見つかりませんでした') || 'No results found.') + '</div>';
        } else {
          results.forEach(function(it) {
            var l1 = C.L(it, 'l1', targetLang), l2 = C.L(it, 'l2', targetLang), title = C.L(it, 'title', targetLang);
            var lead = C.L(it, 'lead', targetLang) || "", body = C.L(it, 'body', targetLang) || "";
            var imgHtml = it.mainImage ? '<img src="' + C.esc(it.mainImage) + '" style="width:100%; height:100%; object-fit:cover;">' 
                                      : '<div class="lz-s-img-placeholder"><img src="' + C.esc(window.LZ_CONFIG.ASSETS.LOGO_RED) + '"></div>';

            var combinedText = (lead + " " + body).replace(/\s+/g, ' ');
            var idx = combinedText.indexOf(keyword);
            var start = Math.max(0, idx - 20);
            var snippet = (start > 0 ? "..." : "") + combinedText.substring(start, start + 80) + "...";

            html += '<div class="lz-s-item" data-goto-id="' + it.title + '" data-l1="' + it.l1 + '" style="padding:12px; margin-bottom:12px; cursor:pointer;">';
            html += '  <div style="display:flex; gap:15px; align-items:center;">';
            html += '    <div style="flex:0 0 80px; width:80px; height:80px; border-radius:10px; overflow:hidden; border:1px solid #eee; background:#fff;">' + imgHtml + '</div>';
            html += '    <div style="flex:1; min-width:0;">';
            html += '      <div style="margin-bottom:4px;"><span class="lz-s-cat">' + C.esc(l1 + " / " + l2) + '</span></div>';
            html += '      <div class="lz-s-name" style="font-size:1.2rem; margin-bottom:4px;">' + hl(C.esc(title)) + '</div>';
            html += '      <div class="lz-s-body" style="font-size:0.95rem; color:#666; -webkit-line-clamp:2; display:-webkit-box; -webkit-box-orient:vertical; overflow:hidden;">' + hl(C.esc(snippet)) + '</div>';
            html += '    </div>';
            html += '  </div>';
            html += '</div>';
          });
        }
        
        html += '<button class="lz-btn lz-btn-search-back">' + (targetLang === 'ja' ? '← 記事に戻る' : '← Back to Article') + '</button></div>';

        modalEl.innerHTML = html;
        modalEl.querySelector('.lz-btn-search-back').onclick = backFunc;
        modalEl.querySelectorAll('.lz-s-item').forEach(function(item) {
          item.onclick = function() {
            var cardInDom = document.querySelector('.lz-card[data-id="'+item.dataset.gotoId+'"]');
            if(cardInDom) window.lzModal.open(cardInDom);
            else location.href = (window.LZ_CONFIG.MENU_URL[item.dataset.l1] || location.origin) + "?lang=" + targetLang + "&id=" + encodeURIComponent(item.dataset.gotoId);
          };
        });
        modalEl.scrollTop = 0;
      } catch(e) {
        modalEl.innerHTML = '<div style="padding:20px; text-align:center; color:#cf3a3a;">⚠️ エラー: ' + C.esc(e.message) + '</div>';
      }
    }
  };
})();