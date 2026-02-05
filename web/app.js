/* web/app.js (順番制御・強化版) */
(function() {
  const v = "20260205_2330"; 
  const base = "https://cdn.jsdelivr.net/gh/takizawa-debug/iizuna-apple-project@main/web/";
  
  // 【重要】ここに書いた順番通りに実行されます
  const files = [
    { type: 'css', url: base + "style.css" },   // 1. まず見た目
    { type: 'js',  url: base + "header.js" },  // 2. 次にヘッダー
    { type: 'js',  url: base + "search.js" },  // 3. 検索
    { type: 'js',  url: base + "main.js" },    // 4. 重たいメイン処理
    { type: 'js',  url: base + "footer.js" }   // 5. 最後にフッター（しんがり）
  ];

  files.forEach(file => {
    const url = `${file.url}?v=${v}`;
    if (file.type === 'css') {
      const link = document.createElement('link');
      link.rel = 'stylesheet'; 
      link.href = url;
      document.head.appendChild(link);
    } else {
      const script = document.createElement('script');
      script.src = url; 
      // 【ここが秘訣】asyncをfalseにすると、配列の順番通りに実行するようブラウザに強制します
      script.async = false; 
      script.defer = true;
      document.head.appendChild(script);
    }
  });
  console.log("Appletown System: Loaded in order v" + v);
})();