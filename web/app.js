/* web/app.js - 確実な順番待ちローダー */
(async function() {
  "use strict";

  const v = "20260206_0020"; // 更新時はここを変える
  const base = "https://cdn.jsdelivr.net/gh/takizawa-debug/iizuna-apple-project@main/web/";

  const files = [
    { type: 'css', url: base + "style.css" },
    { type: 'js',  url: base + "config.js" },
    { type: 'js',  url: base + "main.js" },
    { type: 'js',  url: base + "header.js" },
    { type: 'js',  url: base + "search.js" },
    { type: 'js',  url: base + "footer.js" }
  ];

  // ファイルを1つずつ読み込む関数
  async function loadFile(file) {
    return new Promise((resolve, reject) => {
      const url = `${file.url}?v=${v}`;
      
      if (file.type === 'css') {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
      } else {
        const script = document.createElement('script');
        script.src = url;
        script.async = false; // ブラウザの並列実行を抑制
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      }
    });
  }

  // リストの順番通りに1つずつ実行
  for (const file of files) {
    try {
      await loadFile(file);
      console.log(`Loaded: ${file.url}`);
    } catch (e) {
      console.error(`Failed to load: ${file.url}`, e);
    }
  }

  console.log("Appletown System: All components initialized successfully.");
})();