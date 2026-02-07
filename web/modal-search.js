/**
 * modal-search.js - モーダル内広域検索エンジン (キーワード動的取得版)
 * 役割: スプレッドシートの「キーワード定義」シートから多言語ワードを取得してリンク化。
 */
window.lzSearchEngine = (function() {
  "use strict";
  var C = window.LZ_COMMON;

  // 固定リストを廃止し、動的格納用の変数を用意
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
      '.lz-s-img-placeholder img { width:100%; height:100%; object-fit:contain; opacity:0.15; filter:grayscale(1); }'
    ].join('\n');
    document.head.appendChild(style);
  };

  /**
   * 【新規追加】スプレッドシートからキーワードを取得
   */
  async function prefetchKeywords() {
    try {
      // mode=keywords パラメーターでGASを叩く
      var res = await fetch(window.LZ_CONFIG.ENDPOINT + "?mode=keywords");
      var json = await res.json();
      if (json.ok) {
        DYNAMIC_KEYWORDS = json.items || [];
        // データ取得完了時にモーダルが開いていればリンクを更新
        if (window.lzModal && window.lzModal.refreshLinks) {
          window.lzModal.refreshLinks();
        }
      }
    } catch(e) { console.error("Keywords fetch failed", e); }
  }
  prefetchKeywords();

  return {
    /**
     * オートリンク生成ロジック (キーワード部分を動的に修正)
     */
    applyLinks: function(text, currentId, targetLang) {
      var cardsInDom = document.querySelectorAll('.lz-card');
      var map = {};
      
      // 1. スプレッドシートから取得したキーワード(緑)を現在の言語に合わせて登録
      DYNAMIC_KEYWORDS.forEach(function(kw) {
        var word = kw[targetLang] || kw['ja']; // 指定言語がなければ日本語を優先
        if (word && word.length > 1) {
          // data-keywordには常に日本語(ja)をセットして、検索の正確性を担保
          map[word] = { word: word, originalJa: kw.ja, type: 'search' };
        }
      });

      // 2. ページ内のカード(赤)を登録 (維持：同ページのみ)
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
            : '<span class="lz-auto-link search" data-keyword="'+(item.originalJa || item.word)+'">'+match+'</span>';
          return token;
        });
      });
      tokens.forEach(function(html, idx){ escaped = escaped.replace(new RegExp("###LZT_" + idx + "###", "g"), html); });
      return escaped;
    },

    /**
     * 広域検索実行 (維持)
     */
    run: async function(keyword, targetLang, modalEl, backFunc) {
      injectSearchStyles(); // スタイルの注入
      
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
            
            // サムネイル画像エリアの構築
            var thumbHtml = '';
            if (it.mainImage && it.mainImage.trim() !== "") {
              thumbHtml = '<img src="' + C.esc(it.mainImage) + '" style="width:100%; height:100%; object-fit:cover;">';
            } else {
              // 画像がない場合の薄いグレー ＆ 余白ありの図形描写
              thumbHtml = '<div class="lz-s-img-placeholder">' +
                          '<img src="' + C.esc(window.LZ_CONFIG.ASSETS.LOGO_RED) + '">' +
                          '</div>';
            }

            // スニペット生成
            var combinedText = (lead + " " + body).replace(/\s+/g, ' ');
            var idx = combinedText.indexOf(keyword);
            var start = Math.max(0, idx - 20);
            var snippet = (start > 0 ? "..." : "") + combinedText.substring(start, start + 70) + "...";

            html += '<div class="lz-s-item" data-goto-id="' + it.title + '" data-l1="' + it.l1 + '" style="padding:12px; margin-bottom:12px;">';
            html += '  <div style="display:flex; gap:15px; align-items:center;">';
            // サムネイル (1:1)
            html += '    <div style="flex:0 0 80px; width:80px; height:80px; border-radius:10px; overflow:hidden; border:1px solid #eee; background:#fff;">' + thumbHtml + '</div>';
            // コンテンツ
            html += '    <div style="flex:1; min-width:0;">';
            html += '      <div style="margin-bottom:4px;"><span class="lz-s-cat">' + C.esc(l1 + " / " + l2) + '</span></div>';
            html += '      <div class="lz-s-name" style="font-size:1.2rem; margin-bottom:4px;">' + hl(C.esc(title)) + '</div>';
            html += '      <div class="lz-s-body" style="font-size:0.95rem; color:#666; -webkit-line-clamp:2; display:-webkit-box; -webkit-box-orient:vertical; overflow:hidden;">' + hl(C.esc(snippet)) + '</div>';
            html += '    </div>';
            html += '  </div>';
            html += '</div>';
          });
        }
        
        // アクセシビリティを考慮した「戻る」ボタン
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