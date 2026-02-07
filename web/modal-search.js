/**
 * modal-search.js - モーダル内広域検索エンジン (フィードバック強化版)
 * 役割: search.js と同じGAS検索ロジックを使いつつ、エラー原因を詳細に表示する。
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
     * オートリンク生成ロジック (同期実行)
     * DOM上のカードタイトルとMASTER_TAGSからリンクタグを作成。
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
      tokens.forEach(function(html, idx){ if(html) escaped = escaped.replace(new RegExp("###LZT_" + idx + "###", "g"), html); });
      return escaped;
    },

    /**
     * 広域検索実行 (非同期実行・詳細フィードバック付)
     */
    run: async function(keyword, targetLang, modalEl, backFunc) {
      // 1. 検索開始メッセージの表示
      modalEl.innerHTML = '<div style="padding:60px; text-align:center;">' + 
        '<p style="font-weight:bold; color:#cf3a3a;">' + (C.T('検索しています...') || 'Searching...') + '</p>' +
        '<p style="font-size:0.9rem; color:#888; margin-top:10px;">接続先: GASサーバーエンジン</p>' + 
        '</div>';
      
      try {
        // 2. GASエンドポイントへのリクエスト
        var endpoint = window.LZ_CONFIG.SEARCH_ENDPOINT + "?q=" + encodeURIComponent(keyword) + "&limit=50";
        var res = await fetch(endpoint);
        
        if (!res.ok) throw new Error("通信エラー: HTTP " + res.status);

        var json = await res.json();
        
        // 3. サーバー側での処理成功フラグの確認
        if (!json.ok) {
          throw new Error("サーバーエラー: " + (json.error || "データ取得に失敗しました"));
        }

        var results = json.items || [];
        
        // 4. 起点となった記事をタイトル(ID)で除外
        var currentId = new URLSearchParams(location.search).get('id');
        results = results.filter(function(it){ return it.title !== currentId; });

        // 5. 結果の描画ロジック
        var hl = function(text){ return text.split(keyword).join('<mark>' + keyword + '</mark>'); };
        var html = '<div class="lz-s-wrap"><div class="lz-s-title">「' + C.esc(keyword) + '」に関連する情報</div>';
        
        if(results.length === 0) {
          html += '<div style="padding:30px; border:2px dashed #eee; border-radius:12px; text-align:center; color:#888;">' + 
            '<p style="font-size:1.4rem; font-weight:800;">' + (C.T('見つかりませんでした') || 'No results found.') + '</p>' +
            '<p style="margin-top:10px; font-size:1rem;">全記事データベースを検索しましたが、一致する項目がありませんでした。</p>' +
            '</div>';
        } else {
          results.forEach(function(it) {
            // ID(タイトル)・カテゴリ・本文・リードを多言語解決して表示
            var l1 = C.L(it, 'l1', targetLang), l2 = C.L(it, 'l2', targetLang), title = C.L(it, 'title', targetLang);
            var snippet = C.L(it, 'body', targetLang) || C.L(it, 'lead', targetLang) || "";
            
            html += '<div class="lz-s-item" data-goto-id="' + it.title + '" data-l1="' + it.l1 + '">';
            html += '<div class="lz-s-item-head"><span class="lz-s-cat">' + C.esc(l1 + " / " + l2) + '</span><span class="lz-s-name">' + hl(C.esc(title)) + '</span></div>';
            html += '<div class="lz-s-body">' + hl(C.esc(snippet.substring(0, 80))) + '...</div></div>';
          });
        }
        
        html += '<button class="lz-btn lz-s-back" style="margin-top:20px; width:100%; border-color:#27ae60; color:#27ae60;">← 記事に戻る</button></div>';

        modalEl.innerHTML = html;
        modalEl.querySelector('.lz-s-back').onclick = backFunc;
        
        // 6. クリック時の挙動判定 (ページ内遷移 or 別ページ遷移)
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
        // ❌ エラー原因のフィードバック表示
        modalEl.innerHTML = '<div class="lz-s-wrap" style="border:2px solid #cf3a3a; background:#fffafa; border-radius:12px; padding:20px;">' +
          '<h3 style="color:#cf3a3a; margin-bottom:10px;">⚠️ 検索エラーが発生しました</h3>' +
          '<p style="font-size:1.1rem; color:#333;">原因: ' + C.esc(e.message) + '</p>' +
          '<p style="font-size:0.9rem; color:#666; margin-top:10px;">・サーバーの同時接続制限にかかっている可能性があります。<br>・ネットワーク接続を確認し、数秒後にもう一度「← 記事に戻る」から試してください。</p>' +
          '<button class="lz-btn lz-s-back" style="margin-top:20px; width:100%;" onclick="location.reload()">ページをリロードする</button>' +
          '</div>';
      }
    }
  };
})();