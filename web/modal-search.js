/**
 * modal-search.js - モーダル内広域検索エンジン (キーワード動的取得版)
 * 役割: スプレッドシートから多言語ワードを取得。大文字小文字を区別せずリンク化し、正確にハイライト。
 */
window.lzSearchEngine = (function() {
  "use strict";
  var C = window.LZ_COMMON;

  var DYNAMIC_KEYWORDS = [];

  // 検索画面専用の追加スタイル (維持)
  var injectSearchStyles = function() {
    if (document.getElementById('lz-search-engine-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-search-engine-styles';
    style.textContent = [
      '.lz-btn-search-back { margin-top:20px; width:100%; border:2px solid #27ae60 !important; color:#27ae60 !important; background:#fff !important; transition:.2s; font-weight:800; }',
      '.lz-btn-search-back:hover { background:#27ae60 !important; color:#fff !important; }',
      '.lz-s-item { display:block; text-decoration:none; color:inherit; }',
      '.lz-s-img-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; padding:20px; box-sizing:border-box; background:#f9f9f9; }',
      '.lz-s-img-placeholder img { width:100%; height:100%; object-fit:contain; opacity:0.15; filter:grayscale(1); }',
      'mark { background:#fff566; border-radius:2px; padding:0 2px; }'
    ].join('\n');
    document.head.appendChild(style);
  };

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
     * オートリンク生成ロジック (大文字小文字無視 ＆ 表示ワード保存)
     */
    applyLinks: function(text, currentId, targetLang) {
      var cardsInDom = document.querySelectorAll('.lz-card');
      var map = {};
      
      DYNAMIC_KEYWORDS.forEach(function(kw) {
        var word = kw[targetLang] || kw['ja'];
        if (word && word.length > 1) {
          // 同一単語の大文字小文字違いを統合して管理
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
        // 'gi'フラグで大文字小文字を無視してマッチング
        var regex = new RegExp(item.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        escaped = escaped.replace(regex, function(match) {
          var token = "###LZT_" + idx + "###";
          // data-displayに実際に本文中で使われていた表記(match)を保存
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
     * 広域検索実行 (ハイライト表記の維持)
     */
    run: async function(keyword, targetLang, modalEl, backFunc) {
      injectSearchStyles();
      
      // クリックされた際の実際の表示文字を取得
      var displayWord = keyword;
      if (window.event && window.event.currentTarget && window.event.currentTarget.dataset.display) {
        displayWord = window.event.currentTarget.dataset.display;
      }
      
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

        // ハイライト関数：大文字小文字を無視しつつ元の表記を崩さない
        var hl = function(text) {
          if (!displayWord) return text;
          var r = new RegExp(displayWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          return text.replace(r, function(m){ return '<mark>' + m + '</mark>'; });
        };

        var html = '<div class="lz-s-wrap"><div class="lz-s-title">「' + C.esc(displayWord) + '」に関連する情報</div>';
        
        if(results.length === 0) {
          html += '<div style="padding:30px; border:2px dashed #eee; border-radius:12px; text-align:center; color:#888;">' + (C.T('見つかりませんでした') || 'No results found.') + '</div>';
        } else {
          results.forEach(function(it) {
            var l1 = C.L(it, 'l1', targetLang), l2 = C.L(it, 'l2', targetLang), title = C.L(it, 'title', targetLang);
            var lead = C.L(it, 'lead', targetLang) || "";
            var body = C.L(it, 'body', targetLang) || "";
            
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
            var snippet = (start > 0 ? "..." : "") + combinedText.substring(start, start + 80) + "...";

            html += '<div class="lz-s-item" data-goto-id="' + it.title + '" data-l1="' + it.l1 + '" style="padding:12px; margin-bottom:12px;">';
            html += '  <div style="display:flex; gap:15px; align-items:center;">';
            html += '    <div style="flex:0 0 80px; width:80px; height:80px; border-radius:10px; overflow:hidden; border:1px solid #eee; background:#fff;">' + thumbHtml + '</div>';
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