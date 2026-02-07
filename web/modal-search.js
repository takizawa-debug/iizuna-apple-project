/**
 * modal-search.js - モーダル内広域検索エンジン (アニメーション ＆ 視認性極大版)
 * 役割: スプレッドシート連携・多言語対応を維持し、検索タイトル拡大とロード用アニメーションを追加。
 */
window.lzSearchEngine = (function() {
  "use strict";
  var C = window.LZ_COMMON;
  var DYNAMIC_KEYWORDS = [];

  // 検索画面専用のスタイル
  var injectSearchStyles = function() {
    if (document.getElementById('lz-search-engine-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-search-engine-styles';
    style.textContent = [
      '.lz-s-wrap { padding: 25px; }',
      /* リスト全体のタイトル：1.65rem -> 1.9rem に極大化 */
      '.lz-s-title { font-size: 1.9rem; font-weight: 800; color: #333; margin-bottom: 25px; border-left: 6px solid #27ae60; padding-left: 15px; line-height: 1.4; }',
      '.lz-s-name { font-size: 1.45rem; font-weight: 800; color: #cf3a3a; margin-bottom: 6px; line-height: 1.4; }',
      '.lz-s-body { font-size: 1.15rem; color: #555; line-height: 1.6; -webkit-line-clamp: 3; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }',
      '.lz-s-cat { font-size: 0.85rem; background: #27ae60; color: #fff; padding: 3px 8px; border-radius: 4px; font-weight: 800; }',
      '.lz-btn-search-back { margin-top:25px; width:100%; border:2px solid #27ae60 !important; color:#27ae60 !important; background:#fff !important; transition:.2s; font-weight:800; font-size: 1.2rem; padding: 12px 0; cursor: pointer; border-radius: 999px; text-align:center; display:block; }',
      '.lz-btn-search-back:hover { background:#27ae60 !important; color:#fff !important; }',
      '.lz-s-img-p { width:100%; height:100%; display:flex; align-items:center; justify-content:center; padding:20px; box-sizing:border-box; background:#f9f9f9; }',
      '.lz-s-img-p img { width:100%; height:100%; object-fit:contain; opacity:0.15; filter:grayscale(1); }',
      'mark { background:#fff566; border-radius:2px; padding:0 2px; }',
      /* りんごアニメーション用CSS */
      '.lz-s-loading { padding: 80px 0; text-align: center; }',
      '.lz-s-loading-apple { width: 60px; height: 60px; margin: 0 auto 20px; animation: lzApplePulse 1.5s ease-in-out infinite; opacity: 0.3; color: #888; }',
      '@keyframes lzApplePulse { 0% { transform: scale(0.9); opacity: 0.2; } 50% { transform: scale(1.1); opacity: 0.5; } 100% { transform: scale(0.9); opacity: 0.2; } }'
    ].join('\n');
    document.head.appendChild(style);
  };

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
        if (window.lzModal && window.lzModal.refreshLinks) window.lzModal.refreshLinks();
      }
    } catch(e) { console.error("Keywords fetch failed", e); }
  }
  prefetchKeywords();

  return {
    /**
     * オートリンク生成ロジック (維持)
     */
    applyLinks: function(text, currentId, targetLang) {
      var map = {};
      DYNAMIC_KEYWORDS.forEach(function(kw) {
        var word = kw[targetLang] || kw['ja'];
        if (word && word.length > 1) {
          map[word.toLowerCase()] = { word: word, originalJa: kw.ja, type: 'search' };
        }
      });
      document.querySelectorAll('.lz-card').forEach(function(card) {
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
          tokens[idx] = (item.type === 'direct')
            ? '<span class="lz-auto-link direct" data-goto-id="'+item.id+'">'+match+'</span>'
            : '<span class="lz-auto-link search" data-keyword="'+(item.originalJa || item.word)+'" data-display="'+match+'">'+match+'</span>';
          return token;
        });
      });
      tokens.forEach(function(html, idx){ if(html) escaped = escaped.replace(new RegExp("###LZT_" + idx + "###", "g"), html); });
      return escaped;
    },

    /**
     * 広域検索実行 (アニメーション ＆ タイトル極大対応)
     */
    run: async function(keyword, targetLang, modalEl, backFunc) {
      injectSearchStyles();
      var displayWord = keyword;
      if (window.event && window.event.currentTarget && window.event.currentTarget.dataset.display) {
        displayWord = window.event.currentTarget.dataset.display;
      }
      
      // りんごのアニメーション（グレー）を伴う「検索中」画面
      modalEl.innerHTML = [
        '<div class="lz-s-loading">',
        '  <div class="lz-s-loading-apple">',
        '    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5,12c0,0.55-0.45,1-1,1s-1-0.45-1-1s0.45-1,1-1S17.5,11.45,17.5,12z M12,2C9.24,2,7,4.24,7,7c0,1.21,0.44,2.3,1.16,3.15 C6.3,10.6,5,12.15,5,14c0,2.21,1.79,4,4,4c0.33,0,0.65-0.04,0.96-0.12C10.51,19.12,12,20,12,20s1.49-0.88,2.04-2.12 C14.35,17.96,14.67,18,15,18c2.21,0,4-1.79,4-4c0-1.85-1.3-3.4-3.16-3.85C16.56,9.3,17,8.21,17,7C17,4.24,14.76,2,12,2z M12,4 c1.65,0,3,1.35,3,3c0,0.38-0.08,0.73-0.21,1.06C14.15,7.43,13.15,7,12,7s-2.15,0.43-2.79,1.06C9.08,7.73,9,7.38,9,7C9,5.35,10.35,4,12,4 z M15,16c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S16.1,16,15,16z M9,16c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S10.1,16,9,16z"/></svg>',
        '  </div>',
        '  <p style="font-weight:bold; color:#888;">' + getMsg('searching', targetLang) + '</p>',
        '</div>'
      ].join('');
      
      try {
        var endpoint = window.LZ_CONFIG.SEARCH_ENDPOINT + "?q=" + encodeURIComponent(keyword) + "&limit=50";
        var res = await fetch(endpoint);
        var json = await res.json();
        var currentId = new URLSearchParams(location.search).get('id');
        var results = (json.items || []).filter(function(it){ return it.title !== currentId; });

        var hl = function(text) {
          if (!displayWord) return text;
          var r = new RegExp(displayWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          return text.replace(r, function(m){ return '<mark>' + m + '</mark>'; });
        };

        // タイトル組み立て ＆ 検索結果タイトルの極大化反映
        var resTitle = getMsg('search_res_title', targetLang).replace('{0}', C.esc(displayWord));
        var html = '<div class="lz-s-wrap"><div class="lz-s-title">' + resTitle + '</div>';
        
        if(results.length === 0) {
          html += '<div style="padding:30px; border:2px dashed #eee; border-radius:12px; text-align:center; color:#888;">' + getMsg('not_found', targetLang) + '</div>';
        } else {
          results.forEach(function(it) {
            var l1 = C.L(it, 'l1', targetLang), l2 = C.L(it, 'l2', targetLang), title = C.L(it, 'title', targetLang);
            var lead = C.L(it, 'lead', targetLang) || "", body = C.L(it, 'body', targetLang) || "";
            var imgHtml = it.mainImage ? '<img src="' + C.esc(it.mainImage) + '" style="width:100%; height:100%; object-fit:cover;">' 
                                      : '<div class="lz-s-img-p"><img src="' + C.esc(window.LZ_CONFIG.ASSETS.LOGO_RED) + '"></div>';

            var combinedText = (lead + " " + body).replace(/\s+/g, ' ');
            var idx = combinedText.toLowerCase().indexOf(displayWord.toLowerCase());
            if (idx === -1) idx = 0;
            var start = Math.max(0, idx - 20);
            var snippet = (start > 0 ? "..." : "") + combinedText.substring(start, start + 100) + "...";

            html += '<div class="lz-s-item" data-goto-id="' + it.title + '" data-l1="' + it.l1 + '" style="padding:15px; margin-bottom:15px; cursor:pointer; background:#fff; border-radius:12px; border:1px solid #eee; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">';
            html += '  <div style="display:flex; gap:18px; align-items:center;">';
            html += '    <div style="flex:0 0 90px; width:90px; height:90px; border-radius:12px; overflow:hidden; border:1px solid #eee; background:#fff;">' + imgHtml + '</div>';
            html += '    <div style="flex:1; min-width:0;">';
            html += '      <div style="margin-bottom:6px;"><span class="lz-s-cat">' + C.esc(l1 + " / " + l2) + '</span></div>';
            html += '      <div class="lz-s-name">' + hl(C.esc(title)) + '</div>';
            html += '      <div class="lz-s-body">' + hl(C.esc(snippet)) + '</div>';
            html += '    </div>';
            html += '  </div>';
            html += '</div>';
          });
        }
        
        html += '<button class="lz-btn lz-btn-search-back">' + getMsg('back_to_article', targetLang) + '</button></div>';

        modalEl.innerHTML = html;
        modalEl.querySelector('.lz-btn-search-back').onclick = backFunc;
        
        modalEl.querySelectorAll('.lz-s-item').forEach(function(item) {
          item.onclick = function() {
            var targetId = item.dataset.gotoId;
            var cardInDom = document.querySelector('.lz-card[data-id="'+targetId+'"]');
            if(cardInDom) window.lzModal.open(cardInDom);
            else location.href = (window.LZ_CONFIG.MENU_URL[item.dataset.l1] || location.origin) + "?lang=" + targetLang + "&id=" + encodeURIComponent(targetId);
          };
        });
        modalEl.scrollTop = 0;

      } catch(e) {
        modalEl.innerHTML = '<div class="lz-s-wrap" style="padding:20px; text-align:center; color:#cf3a3a;">⚠️ Error: ' + C.esc(e.message) + '</div>';
      }
    }
  };
})();