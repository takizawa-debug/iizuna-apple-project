/* web/app.js (順序最適化版) */
(function() {
  const v = "20260205_2301"; // 更新時はここを書き換え
  const base = "https://cdn.jsdelivr.net/gh/takizawa-debug/iizuna-apple-project@main/web/";
  
  const files = [
    // 1. まずはベースの見た目(CSS)
    { type: 'css', url: base + "style.css" },
    
    // 2. 次にメインビジュアル（ここを最優先！）
    { type: 'js',  url: base + "slideshow.js" },
    
    // 3. 共通パーツ
    { type: 'js',  url: base + "header.js" },
    { type: 'js',  url: base + "search.js" },
    { type: 'js',  url: base + "footer.js" },
    
    // 4. 重たいメインロジックは一番最後
    { type: 'js',  url: base + "main.js" }
  ];

  files.forEach(file => {
    const url = `${file.url}?v=${v}`;
    if (file.type === 'css') {
      const link = document.createElement('link');
      link.rel = 'stylesheet'; link.href = url;
      document.head.appendChild(link);
    } else {
      const script = document.createElement('script');
      script.src = url; 
      script.defer = true; // 他の処理を止めないように
      document.head.appendChild(script);
    }
  });
})();