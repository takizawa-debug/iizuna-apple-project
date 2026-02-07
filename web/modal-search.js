/**
 * modal-search.js - モーダル内広域検索エンジン
 */
window.lzSearchEngine = (function() {
  "use strict";
  var C = window.LZ_COMMON;

  // 定数：オートリンク対象
  var MASTER_TAGS = [
    "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月", "4月", "5月", "6月", "7月",
    "北信五岳", "移住", "子育て", "ふじ", "高坂りんご", "ブラムリー", "サンふじ",
    "シードル", "アップルミュージアム", "アクセス", "歴史", "機能性成分", "プロシアニジン", "甘みと酸味のバランス"
  ];

  /* 全データの取得・管理 (ここを忠実に実装) */
  async function ensureData() {
    if (window.LZ_DATA) return window.LZ_DATA;
    try {
      var res = await fetch(window.LZ_CONFIG.ENDPOINT);
      var json = await res.json();
      window.LZ_DATA = json.items || []; // GAS側の items 配列をセット
      return window.LZ_DATA;
    } catch(e) { return []; }
  }

  return {
    /* オートリンクタグ生成（DOMベースの赤優先ロジック） */
    applyLinks: function(text, currentId, targetLang) {
      var map = {};
      MASTER_TAGS.forEach(tag => map[tag] = { word: tag, type: 'search' });
      document.querySelectorAll('.lz-card').forEach(card => {
        try {
          var d = JSON.parse(card.dataset.item || "{}");
          var title = C.L(d, 'title', targetLang);
          if (title && title.length > 1 && card.dataset.id !== currentId) {
            map[title] = { word: title, id: card.dataset.id, type: 'direct' };
          }
        } catch(e){}
      });
      var candidates = Object.values(map).sort((a,b) => b.word.length - a.word.length);
      var escaped = C.esc(text), tokens = [];
      candidates.forEach((item, idx) => {
        var regex = new RegExp(item.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        escaped = escaped.replace(regex, match => {
          var token = "###LZT_" + idx + "###";
          tokens[idx] = item.type === 'direct' 
            ? '<span class="lz-auto-link direct" data-goto-id="'+item.id+'">'+match+'</span>'
            : '<span class="lz-auto-link search" data-keyword="'+item.word+'">'+match+'</span>';
          return token;
        });
      });
      tokens.forEach((html, idx) => escaped = escaped.replace(new RegExp("###LZT_" + idx + "###", "g"), html));
      return escaped;
    },

    /* 全記事検索実行 (忠実な実装) */
    run: async function(keyword, targetLang, modalEl, backFunc) {
      modalEl.innerHTML = '<div style="padding:60px; text-align:center;">'+ (window.LZ_CONFIG.LANG.I18N[targetLang]?.['検索しています...'] || '検索中...') +'</div>';
      
      // ここで「サイト全体」の記事データを確実にロードする
      var allData = await ensureData();
      var results = [];
      var seenIds = new Set();
      var currentId = new URLSearchParams(location.search).get('id');

      allData.forEach(item => {
        if (item.id === currentId || seenIds.has(item.id)) return;
        
        // タイトル・リード文・本文すべてを検索対象にする
        var title = C.L(item, 'title', targetLang) || "";
        var lead = C.L(item, 'lead', targetLang) || "";
        var body = C.L(item, 'body', targetLang) || "";
        
        if (title.includes(keyword) || lead.includes(keyword) || body.includes(keyword)) {
          seenIds.add(item.id);
          var combined = lead + " " + body;
          var idx = combined.indexOf(keyword);
          var start = Math.max(0, idx - 25);
          var snippet = (start > 0 ? "..." : "") + combined.substring(start, start + 70) + (combined.length > start + 70 ? "..." : "");
          results.push({ id: item.id, title: title, body: snippet, cat: (C.L(item, 'l1', targetLang) + " / " + C.L(item, 'l2', targetLang)), l1: item.l1 });
        }
      });

      var hl = text => text.split(keyword).join('<mark>' + keyword + '</mark>');
      var html = '<div class="lz-s-wrap"><div class="lz-s-title">「' + C.esc(keyword) + '」に関連する情報</div>';
      
      if(results.length === 0) html += '<div style="padding:20px;">見つかりませんでした。</div>';
      else results.forEach(res => {
        html += '<div class="lz-s-item" data-goto-id="' + res.id + '" data-l1="' + res.l1 + '">';
        html += '<div class="lz-s-item-head"><span class="lz-s-cat">' + C.esc(res.cat) + '</span><span class="lz-s-name">' + hl(C.esc(res.title)) + '</span></div>';
        html += '<div class="lz-s-body">' + hl(C.esc(res.body)) + '</div></div>';
      });
      html += '<button class="lz-btn lz-s-back" style="margin-top:20px; width:100%; border-color:#27ae60; color:#27ae60;">← 記事に戻る</button></div>';

      modalEl.innerHTML = html;
      modalEl.querySelector('.lz-s-back').onclick = backFunc;
      modalEl.querySelectorAll('.lz-s-item').forEach(item => {
        item.onclick = function() {
          var cardInDom = document.querySelector('.lz-card[data-id="'+item.dataset.gotoId+'"]');
          if(cardInDom) {
            window.lzModal.open(cardInDom);
          } else {
            // 別ページにある場合は、search.jsと同じ挙動でページ遷移
            var menuUrl = window.LZ_CONFIG.MENU_URL[item.dataset.l1] || location.origin;
            location.href = menuUrl + "?lang=" + targetLang + "&id=" + encodeURIComponent(item.dataset.gotoId);
          }
        };
      });
      modalEl.scrollTop = 0;
    }
  };
})();