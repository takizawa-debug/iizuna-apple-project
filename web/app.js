/* web/app.js - 手動タグ再現版 */
(function() {
  "use strict";

  // 【重要】更新時はここを変えるだけ！
  const v = "20260206_final"; 
  const base = "https://cdn.jsdelivr.net/gh/takizawa-debug/iizuna-apple-project@main/web/";

  // 手動で貼っていたタグを、そのまま順番通りに「書き出し」ます
  const tags = [
    `<script src="${base}config.js?v=${v}"></script>`,
    `<link rel="stylesheet" href="${base}style.css?v=${v}">`,
    `<script src="${base}main.js?v=${v}"></script>`,
    `<script src="${base}header.js?v=${v}"></script>`,
    `<script src="${base}search.js?v=${v}"></script>`,
    `<script src="${base}footer.js?v=${v}"></script>`
  ];

  // 順番通りにHTMLとして流し込む
  document.write(tags.join('\n'));

  console.log("Appletown System: Legacy Mode Loaded v" + v);
})();