/* web/app.js - バージョン一括管理システム */
(function() {
  "use strict";

  // 【重要】更新時はここを書き換えるだけで、全ファイルに新しいバージョンが付きます
  const v = "20260206_001"; 
  const base = "https://cdn.jsdelivr.net/gh/takizawa-debug/iizuna-apple-project@main/web/";

  // 読み込むファイルのリスト（順番が重要）
  const files = [
    { type: 'css', url: base + "style.css" },
    { type: 'js',  url: base + "config.js" },
    { type: 'js',  url: base + "main.js" },
    { type: 'js',  url: base + "header.js" },
    { type: 'js',  url: base + "search.js" },
    { type: 'js',  url: base + "footer.js" }
  ];

  files.forEach(file => {
    const fileUrl = `${file.url}?v=${v}`;
    
    if (file.type === 'css') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fileUrl;
      document.head.appendChild(link);
    } else {
      const script = document.createElement('script');
      script.src = fileUrl;
      script.async = false; // 順番通りに実行
      script.defer = true;
      document.body.appendChild(script);
    }
  });

  console.log("Appletown System: All files loaded with version " + v);
})();