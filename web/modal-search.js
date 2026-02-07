/**
 * modal-search.js - モーダル内広域検索エンジン (多言語 ＆ 視認性完成版)
 * 役割: 既存の1:1サムネイル、文字拡大、大文字小文字無視を完全維持し、翻訳の文法不備を解消。
 */
window.lzSearchEngine = (function() {
  "use strict";
  var C = window.LZ_COMMON;
  var DYNAMIC_KEYWORDS = [];

  // 検索画面専用のスタイル (現在の拡大サイズを完全に維持)
  var injectSearchStyles = function() {
    if (document.getElementById('lz-search-engine-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-search-engine-styles';
    style.textContent = [
      '.lz-s-wrap { padding: 25px; }',
      '.lz-s-title { font-size: 1.65rem; font-weight: 800; color: #333; margin-bottom: 20px; border-left: 5px solid #27ae60; padding-left: 12px; line-height: 1.4; }',
      '.lz-s-name { font-size: 1.45rem; font-weight: 800; color: #cf3a3a; margin-bottom: 6px; line-height: 1.4; }',
      '.lz-s-body { font-size: 1.15rem; color: #555; line-height: 1.6; -webkit-line-clamp: 3; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }',
      '.lz-s-cat { font-size: 0.85rem; background: #27ae60; color: #fff; padding: 3px 8px; border-radius: 4px; font-weight: 800; }',
      '.lz-btn-search-back { margin-top:25px; width:100%; border:2px solid #27ae60 !important; color:#27ae60 !important; background:#fff !important; transition:.2s; font-weight:800; font-size: 1.2rem; padding: 12px 0; cursor: pointer; border-radius: 999px; text-align:center; display:block; }',
      '.lz-btn-search-back:hover { background:#27ae60 !important; color:#fff !important; }',
      '.lz-s-item { display:block; text-decoration:none; color:inherit; }',
      '.lz-s-img-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; padding:20px; box-sizing:border-box; background:#f9f9f9; }',
      '.lz-s-img-placeholder img { width:100%; height:100%; object-fit:contain; opacity:0.15; filter:grayscale(1); }',
      'mark { background:#fff566; border-radius:2px; padding:0 2px; }'
    ].join('\n');
    document.head.appendChild(style);
  };

  /**
   * 辞書から翻訳を取得するヘルパー
   */
  function getMsg(key, lang) {
    var dict = window.LZ_CONFIG.LANG.I18N[lang] || window.LZ_CONFIG.LANG.I18N['ja'];
    return dict[key] || key;
  }

  async function prefetchKeywords() {
    try {
      var res = await fetch(window.LZ_CONFIG.ENDPOINT + "?mode=keywords");
      var json = await res.json();
      if (json.ok) {
        DYNAMIC_KEYWORDS = json.items || [];
        if (window.lzModal && window.lzModal.refreshLinks) {
          window.lzModal.refreshLinks();
        }
      }
    } catch(e) { console.error("Keywords fetch failed", e); }
  }
  prefetchKeywords();

  return {
    /**
     * オートリンク生成ロジック (維持：大文字小文字無視 ＆ 表示ワード保存)
     */
    applyLinks: function(text, currentId, targetLang) {
      var cardsInDom = document.querySelectorAll('.lz-card');
      var map = {};
      
      DYNAMIC_KEYWORDS.forEach(function(kw) {
        var word = kw[targetLang] || kw['ja'];
        if (word && word.length > 1) {
          map[word.toLowerCase()] = { word: word, originalJa: kw.ja, type: 'search' };
        }
      });

      cardsInDom.forEach(function(card) {
        try {
          var d = JSON.parse(card.dataset.item || "{}");
          var title = C.L(d, 'title', targetLang);
          if (title && title.length > 1 && card.dataset.id !== currentId) {
            map[title.toLowerCase()] = { word: title, id: card.dataset.id, type: 'direct' };
          }
        } catch(e){}
      });

      var candidates = Object.values(map).sort(function(a,b){ return b.word.length - a.word.length; });
      var escaped = C.esc(text), tokens = [];
      candidates.forEach(function(item, idx) {
        var regex = new RegExp(item.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        escaped = escaped.replace(regex, function(match) {
          var token = "###LZT_" + idx + "###";
          tokens[idx] = item.type === 'direct' 
            ? '<span class="lz-auto-link direct" data-goto-id="'+item.id+'">'+match+'</span>'
            : '<span class="lz-auto-link search" data-keyword="'+(item.originalJa || item.word)+'" data-display="'+match+'">'+match+'</span>';
          return token;
        });
      });
      tokens.forEach(function(html, idx){ if(html) escaped = escaped.replace(new RegExp("###LZT_" + idx + "###", "g"), html); });
      return escaped;
    },

    /**
     * 広域検索実行 (多言語タイトル・文字拡大対応)
     */
    run: async function(keyword, targetLang, modalEl, backFunc) {
      injectSearchStyles();
      
      var displayWord = keyword;
      if (window.event && window.event.currentTarget && window.event.currentTarget.dataset.display) {
        displayWord = window.event.currentTarget.dataset.display;
      }
      
      // 「検索しています...」の多言語表示
      modalEl.innerHTML = '<div style="padding:60px; text-align:center;">' + 
        '<p style="font-weight:bold; color:#cf3a3a;">' + getMsg('searching', targetLang) + '</p>' +
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

        // ハイライト：大文字小文字を無視しつつ元の表記を崩さない
        var hl = function(text) {
          if (!displayWord) return text;
          var r = new RegExp(displayWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          return text.replace(r, function(m){ return '<mark>' + m + '</mark>'; });
        };

        // タイトルの組み立て：辞書の「{0}」を検索ワードに置換
        var resTitle = getMsg('search_res_title', targetLang).replace('{0}', C.esc(displayWord));

        var html = '<div class="lz-s-wrap"><div class="lz-s-title">' + resTitle + '</div>';
        
        if(results.length === 0) {
          html += '<div style="padding:30px; border:2px dashed #eee; border-radius:12px; text-align:center; color:#888;">' + getMsg('not_found', targetLang) + '</div>';
        } else {
          results.forEach(function(it) {
            var l1 = C.L(it, 'l1', targetLang), l2 = C.L(it, 'l2', targetLang), title = C.L(it, 'title', targetLang);
            var lead = C.L(it, 'lead', targetLang) || "", body = C.L(it, 'body', targetLang) || "";
            
            var thumbHtml = '';
            if (it.mainImage && it.mainImage.trim() !== "") {
              thumbHtml = '<img src="' + C.esc(it.mainImage) + '" style="width:100%; height:100%; object-fit:cover;">';
            } else {
              thumbHtml = '<div class="lz-s-img-placeholder"><img src="' + C.esc(window.LZ_CONFIG.ASSETS.LOGO_RED) + '"></div>';
            }

            var combinedText = (lead + " " + body).replace(/\s+/g, ' ');
            var idx = combinedText.toLowerCase().indexOf(displayWord.toLowerCase());
            if (idx === -1) idx = 0;
            var start = Math.max(0, idx - 20);
            var snippet = (start > 0 ? "..." : "") + combinedText.substring(start, start + 100) + "...";

            html += '<div class="lz-s-item" data-goto-id="' + it.title + '" data-l1="' + it.l1 + '" style="padding:15px; margin-bottom:15px; cursor:pointer; background:#fff; border-radius:12px; border:1px solid #eee;">';
            html += '  <div style="display:flex; gap:18px; align-items:center;">';
            // サムネイル 90px 拡大を維持
            html += '    <div style="flex:0 0 90px; width:90px; height:90px; border-radius:12px; overflow:hidden; border:1px solid #eee; background:#fff;">' + thumbHtml + '</div>';
            html += '    <div style="flex:1; min-width:0;">';
            html += '      <div style="margin-bottom:6px;"><span class="lz-s-cat">' + C.esc(l1 + " / " + l2) + '</span></div>';
            html += '      <div class="lz-s-name">' + hl(C.esc(title)) + '</div>';
            html += '      <div class="lz-s-body">' + hl(C.esc(snippet)) + '</div>';
            html += '    </div>';
            html += '  </div>';
            html += '</div>';
          });
        }
        
        // 戻るボタンの多言語化
        html += '<button class="lz-btn lz-btn-search-back">' + getMsg('back_to_article', targetLang) + '</button></div>';

        modalEl.innerHTML = html;
        modalEl.querySelector('.lz-btn-search-back').onclick = backFunc;
        
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