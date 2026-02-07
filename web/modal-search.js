/**
 * modal-search.js - モーダル内広域検索エンジン (高機能表示版)
 * 役割: search.js と同じGAS検索ロジックを使用。リード文も検索・表示対象にし、1:1のサムネイル画像を追加。
 */
window.lzSearchEngine = (function() {
  "use strict";
  var C = window.LZ_COMMON;

  var MASTER_TAGS = [
    "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月", "4月", "5月", "6月", "7月",
    "北信五岳", "移住", "子育て", "ふじ", "高坂りんご", "ブラムリー", "サンふじ",
    "シードル", "アップルミュージアム", "アクセス", "歴史", "機能性成分", "プロシアニジン", "甘みと酸味のバランス"
  ];

  return {
    /**
     * オートリンク生成ロジック (同期)
     */
    applyLinks: function(text, currentId, targetLang) {
      var cardsInDom = document.querySelectorAll('.lz-card');
      var map = {};
      MASTER_TAGS.forEach(function(tag) { map[tag] = { word: tag, type: 'search' }; });
      cardsInDom.forEach(function(card) {
        try {
          var d = JSON.parse(card.dataset.item || "{}");
          var title = C.L(d, 'title', targetLang);
          if (title && title.length > 1 && card.dataset.id !== currentId) {
            map[title] = { word: title, id: card.dataset.id, type: 'direct' };
          }
        } catch(e){}
      });
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
      tokens.forEach(function(html, idx){ escaped = escaped.replace(new RegExp("###LZT_" + idx + "###", "g"), html); });
      return escaped;
    },

    /**
     * 広域検索実行 (非同期・リード文・画像表示対応)
     */
    run: async function(keyword, targetLang, modalEl, backFunc) {
      modalEl.innerHTML = '<div style="padding:60px; text-align:center;">' + 
        '<p style="font-weight:bold; color:#cf3a3a;">' + (C.T('検索しています...') || 'Searching...') + '</p>' +
        '</div>';
      
      try {
        var endpoint = window.LZ_CONFIG.SEARCH_ENDPOINT + "?q=" + encodeURIComponent(keyword) + "&limit=50";
        var res = await fetch(endpoint);
        if (!res.ok) throw new Error("HTTP " + res.status);
        var json = await res.json();
        if (!json.ok) throw new Error(json.error || "Server Error");

        var results = json.items || [];
        var currentId = new URLSearchParams(location.search).get('id');
        results = results.filter(function(it){ return it.title !== currentId; });

        var hl = function(text){ return text.split(keyword).join('<mark>' + keyword + '</mark>'); };
        var html = '<div class="lz-s-wrap"><div class="lz-s-title">「' + C.esc(keyword) + '」に関連する情報</div>';
        
        if(results.length === 0) {
          html += '<div style="padding:30px; border:2px dashed #eee; border-radius:12px; text-align:center; color:#888;">' + (C.T('見つかりませんでした') || 'No results found.') + '</div>';
        } else {
          results.forEach(function(it) {
            var l1 = C.L(it, 'l1', targetLang), l2 = C.L(it, 'l2', targetLang), title = C.L(it, 'title', targetLang);
            var lead = C.L(it, 'lead', targetLang) || "";
            var body = C.L(it, 'body', targetLang) || "";
            var img = it.mainImage || window.LZ_CONFIG.ASSETS.LOGO_RED; // 代替画像

            // リード文と本文を統合してスニペットを作成
            var combinedText = (lead + " " + body).replace(/\s+/g, ' ');
            var idx = combinedText.indexOf(keyword);
            var start = Math.max(0, idx - 20);
            var snippet = (start > 0 ? "..." : "") + combinedText.substring(start, start + 80) + "...";

            html += '<div class="lz-s-item" data-goto-id="' + it.title + '" data-l1="' + it.l1 + '" style="padding:12px;">';
            html += '  <div style="display:flex; gap:15px; align-items:flex-start;">';
            // サムネイル画像 (1:1)
            html += '    <div style="flex:0 0 80px; width:80px; height:80px; border-radius:8px; overflow:hidden; background:#f5f5f5; border:1px solid #eee;">';
            html += '      <img src="' + C.esc(img) + '" style="width:100%; height:100%; object-fit:cover;">';
            html += '    </div>';
            // コンテンツエリア
            html += '    <div style="flex:1; min-width:0;">';
            html += '      <div style="margin-bottom:4px;"><span class="lz-s-cat">' + C.esc(l1 + " / " + l2) + '</span></div>';
            html += '      <div class="lz-s-name" style="font-size:1.2rem; margin-bottom:6px;">' + hl(C.esc(title)) + '</div>';
            html += '      <div class="lz-s-body" style="font-size:0.95rem; color:#666; -webkit-line-clamp:2;">' + hl(C.esc(snippet)) + '</div>';
            html += '    </div>';
            html += '  </div>';
            html += '</div>';
          });
        }
        
        html += '<button class="lz-btn lz-s-back" style="margin-top:20px; width:100%; border-color:#27ae60; color:#27ae60;">' + (targetLang === 'ja' ? '← 記事に戻る' : '← Back to Article') + '</button></div>';

        modalEl.innerHTML = html;
        modalEl.querySelector('.lz-s-back').onclick = backFunc;
        
        modalEl.querySelectorAll('.lz-s-item').forEach(function(item) {
          item.onclick = function() {
            var targetId = item.dataset.gotoId;
            var cardInDom = document.querySelector('.lz-card[data-id="'+targetId+'"]');
            if(cardInDom) {
              window.lzModal.open(cardInDom);
            } else {
              var menuUrl = window.LZ_CONFIG.MENU_URL[item.dataset.l1] || location.origin;
              location.href = menuUrl + "?lang=" + targetLang + "&id=" + encodeURIComponent(targetId);
            }
          };
        });
        modalEl.scrollTop = 0;

      } catch(e) {
        modalEl.innerHTML = '<div class="lz-s-wrap" style="padding:20px; text-align:center; color:#cf3a3a;">⚠️ エラー: ' + C.esc(e.message) + '</div>';
      }
    }
  };
})();