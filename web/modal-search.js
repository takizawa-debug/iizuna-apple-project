/**
 * modal-search.js - モーダル内検索エンジン (全記事・全項目検索版)
 * 役割: モーダルの表示機能を止めずに、バックグラウンドで全データ(LZ_DATA)を検索。
 */
window.lzSearchEngine = (function() {
  "use strict";
  var C = window.LZ_COMMON;

  // 定数：オートリンク対象（キーワード検索：緑）
  var MASTER_TAGS = [
    "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月", "4月", "5月", "6月", "7月",
    "北信五岳", "移住", "子育て", "ふじ", "高坂りんご", "ブラムリー", "サンふじ",
    "シードル", "アップルミュージアム", "アクセス", "歴史", "機能性成分", "プロシアニジン", "甘みと酸味のバランス"
  ];

  /* 1. サイト全体のデータを安全に取得・管理する関数 */
  async function ensureData() {
    // すでにデータがある場合はそれを使う
    if (window.LZ_DATA && window.LZ_DATA.length > 0) return window.LZ_DATA;
    try {
      // なければGASエンドポイントから取得
      var res = await fetch(window.LZ_CONFIG.ENDPOINT);
      var json = await res.json();
      window.LZ_DATA = json.items || [];
      return window.LZ_DATA;
    } catch(e) { 
      console.error("Data fetch failed:", e);
      return []; 
    }
  }

  // 起動時に裏側でこっそりデータを読み込んでおく（待ち時間を減らすため）
  ensureData();

  return {
    /* 2. オートリンク生成：全記事のタイトルを対象にする */
    applyLinks: function(text, currentId, targetLang) {
      var map = {};
      
      // まず緑色（検索用キーワード）を登録
      MASTER_TAGS.forEach(function(tag) { if (tag.length > 1) map[tag] = { word: tag, type: 'search' }; });

      // サイト全体のデータがあれば、そのタイトルを赤色（直行リンク）として上書き登録
      var allData = window.LZ_DATA || [];
      allData.forEach(function(item) {
        var title = C.L(item, 'title', targetLang); // システム標準 C.L で多言語対応
        if (title && title.length > 1 && item.id !== currentId) {
          map[title] = { word: title, id: item.id, type: 'direct' };
        }
      });

      // 長い単語から順にソート（二重置換バグ防止）
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

    /* 3. 全記事検索実行：タイトル・リード・本文を現在の言語で検索 */
    run: async function(keyword, targetLang, modalEl, backFunc) {
      modalEl.innerHTML = '<div style="padding:60px; text-align:center;">' + (window.LZ_CONFIG.LANG.I18N[targetLang]?.['検索しています...'] || 'Searching...') + '</div>';
      
      var allData = await ensureData();
      var results = [];
      var seenIds = new Set();
      // 現在開いている記事のID（URLパラメータから取得、またはグローバル変数から）
      var currentId = new URLSearchParams(location.search).get('id');

      allData.forEach(function(item) {
        // 自分自身と、重複したIDは除外
        if (item.id === currentId || seenIds.has(item.id)) return;

        var title = C.L(item, 'title', targetLang) || "";
        var lead = C.L(item, 'lead', targetLang) || "";
        var body = C.L(item, 'body', targetLang) || "";

        // 検索対象：タイトル・リード文・本文
        if (title.includes(keyword) || lead.includes(keyword) || body.includes(keyword)) {
          seenIds.add(item.id);
          var combined = lead + " " + body;
          var idx = combined.indexOf(keyword);
          var start = Math.max(0, idx - 25);
          var snippet = (start > 0 ? "..." : "") + combined.substring(start, start + 70) + (combined.length > start + 70 ? "..." : "");
          results.push({ 
            id: item.id, 
            title: title, 
            body: snippet, 
            cat: (C.L(item, 'l1', targetLang) + " / " + C.L(item, 'l2', targetLang)),
            l1: item.l1 
          });
        }
      });

      var hl = function(text){ return text.split(keyword).join('<mark>' + keyword + '</mark>'); };
      var html = '<div class="lz-s-wrap"><div class="lz-s-title">「' + C.esc(keyword) + '」に関連する情報</div>';
      
      if(results.length === 0) {
        html += '<div style="padding:20px;">' + (window.LZ_CONFIG.LANG.I18N[targetLang]?.['見つかりませんでした'] || 'Not found.') + '</div>';
      } else {
        results.forEach(function(res) {
          html += '<div class="lz-s-item" data-goto-id="' + res.id + '" data-l1="' + res.l1 + '">';
          html += '<div><span class="lz-s-cat">' + C.esc(res.cat) + '</span><span class="lz-s-name">' + hl(C.esc(res.title)) + '</span></div>';
          html += '<div class="lz-s-body">' + hl(C.esc(res.body)) + '</div></div>';
        });
      }
      html += '<button class="lz-btn lz-s-back" style="margin-top:20px; width:100%; border-color:#27ae60; color:#27ae60;">← 記事に戻る</button></div>';

      modalEl.innerHTML = html;
      modalEl.querySelector('.lz-s-back').onclick = backFunc;
      
      modalEl.querySelectorAll('.lz-s-item').forEach(function(item) {
        item.onclick = function() {
          var targetId = item.dataset.gotoId;
          var cardInDom = document.querySelector('.lz-card[data-id="'+targetId+'"]');
          if(cardInDom) {
            // 同じページにあればモーダルを開き直す
            window.lzModal.open(cardInDom);
          } else {
            // 別ページにあれば遷移
            var menuUrl = window.LZ_CONFIG.MENU_URL[item.dataset.l1] || location.origin;
            location.href = menuUrl + "?lang=" + targetLang + "&id=" + encodeURIComponent(targetId);
          }
        };
      });
      modalEl.scrollTop = 0;
    }
  };
})();