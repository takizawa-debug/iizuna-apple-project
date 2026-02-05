/* web/app.js - バトンリレー（完全同期）ローダー */
(function() {
  "use strict";

  // 更新時はここを変えるだけ
  const v = "20260206_relay_v1"; 
  const base = "https://cdn.jsdelivr.net/gh/takizawa-debug/iizuna-apple-project@main/web/";

  // 順番が命のファイルリスト
  const files = [
    { type: 'css', url: base + "style.css" },
    { type: 'js',  url: base + "config.js" },
    { type: 'js',  url: base + "main.js" },
    { type: 'js',  url: base + "header.js" },
    { type: 'js',  url: base + "search.js" },
    { type: 'js',  url: base + "footer.js" }
  ];

  // 1つずつ順番に読み込む関数（バトンリレー）
  function relayLoad(index) {
    if (index >= files.length) {
      console.log("Appletown System: All components loaded in order.");
      return;
    }

    const file = files[index];
    const url = `${file.url}?v=${v}`;

    if (file.type === 'css') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
      // CSSはロードを待たずに次のJSへ（描画を止めないため）
      relayLoad(index + 1);
    } else {
      const script = document.createElement('script');
      script.src = url;
      // ★ここが肝：読み込みが終わったら次のファイルを呼ぶ
      script.onload = () => relayLoad(index + 1);
      script.onerror = () => console.error("Failed to load: " + url);
      document.body.appendChild(script);
    }
  }

  // 最初（index 0）からスタート
  relayLoad(0);
})();