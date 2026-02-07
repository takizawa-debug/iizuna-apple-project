/**
 * modal-search.js - モーダル内検索ロジック (ページ内カード限定・安定版ロジック)
 */
window.lzSearchEngine = (function() {
  "use strict";
  var C = window.LZ_COMMON;

  // 定数
  var MASTER_TAGS = [
    "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月", "4月", "5月", "6月", "7月",
    "北信五岳", "移住", "子育て", "ふじ", "高坂りんご", "ブラムリー", "サンふじ",
    "シードル", "アップルミュージアム", "アクセス", "歴史", "機能性成分", "プロシアニジン", "甘みと酸味のバランス"
  ];

  return {
    /* オートリンクタグ生成ロジック (安定版をそのまま抽出) */
    applyLinks: function(text, currentId, targetLang) {
      var cardsInDom = document.querySelectorAll('.lz-card');
      var map = {}; 

      MASTER_TAGS.forEach(function(tag) { if (tag.length > 1) map[tag] = { word: tag, type: 'search' }; });

      cardsInDom.forEach(function(card) {
        try {
          var data = JSON.parse(card.dataset.item || "{}");
          // 言語に合わせたタイトル取得
          var title = (targetLang === 'ja') ? (data.title || "") : (data[targetLang]?.title || data.title || "");
          if (title && title.length > 1 && card.dataset.id !== currentId) {
            map[title] = { word: title, id: card.dataset.id, type: 'direct' };
          }
        } catch(e) {}
      });

      var candidates = Object.values(map).sort(function(a, b) { return b.word.length - a.word.length; });
      var escaped = C.esc(text);
      var tokens = [];

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
      tokens.forEach(function(html, idx) { if(html) escaped = escaped.replace(new RegExp("###LZT_" + idx + "###", "g"), html); });
      return escaped;
    },

    /* 検索結果リスト生成ロジック (安定版：DOMカード限定をそのまま抽出) */
    run: function(keyword, targetLang, modalEl, backFunc) {
      var cards = document.querySelectorAll('.lz-card');
      var results = [];
      var seenIds = new Set(); 

      cards.forEach(function(c) {
        if (seenIds.has(c.dataset.id)) return;
        try {
          var data = JSON.parse(c.dataset.item || "{}");
          var title = (targetLang === 'ja') ? (data.title || "") : (data[targetLang]?.title || data.title || "");
          var body = (targetLang === 'ja') ? (data.body || "") : (data[targetLang]?.body || data.body || "");
          var cat = c.dataset.group || "";

          if (title.includes(keyword) || body.includes(keyword) || (c.dataset.tags && c.dataset.tags.includes(keyword))) {
            seenIds.add(c.dataset.id);
            var idx = body.indexOf(keyword);
            var start = Math.max(0, idx - 25);
            var snippet = (start > 0 ? "..." : "") + body.substring(start, start + 70) + (body.length > start + 70 ? "..." : "");
            results.push({ card: c, title: title, body: snippet, cat: cat });
          }
        } catch(e){}
      });

      var hl = function(text) { return text.split(keyword).join('<mark>' + keyword + '</mark>'); };
      var html = '<div class="lz-s-wrap"><div class="lz-s-title">「' + C.esc(keyword) + '」に関連する情報</div>';
      if(results.length === 0) html += '<div>見つかりませんでした。</div>';
      else results.forEach(function(res) {
        html += '<div class="lz-s-item" data-goto-id="' + res.card.dataset.id + '">';
        html += '<div class="lz-s-item-head"><span class="lz-s-cat">' + C.esc(res.cat) + '</span><span class="lz-s-name">' + hl(C.esc(res.title)) + '</span></div>';
        html += '<div class="lz-s-body">' + hl(C.esc(res.body)) + '</div></div>';
      });
      html += '<button class="lz-btn lz-s-back" style="margin-top:20px; width:100%; border-color:#27ae60; color:#27ae60;">← 記事に戻る</button></div>';

      modalEl.innerHTML = html;
      modalEl.querySelector('.lz-s-back').onclick = backFunc;
      modalEl.querySelectorAll('.lz-s-item').forEach(function(item) {
        item.onclick = function() { window.lzModal.open(document.querySelector('.lz-card[data-id="'+item.dataset.gotoId+'"]')); };
      });
      modalEl.scrollTop = 0;
    }
  };
})();