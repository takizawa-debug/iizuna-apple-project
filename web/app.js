/* web/app.js (順番制御版) */
(function() {
  const v = "20260205_2351"; 
  const base = "https://cdn.jsdelivr.net/gh/takizawa-debug/iizuna-apple-project@main/web/";
  
  const files = [
    { type: 'css', url: base + "style.css" },
    { type: 'js',  url: base + "header.js" },
    { type: 'js',  url: base + "search.js" },
    { type: 'js',  url: base + "main.js" },   // 記事を読み込むメインJS
    { type: 'js',  url: base + "footer.js" }  // 必ず最後に実行
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
      script.async = false; // 配列の順番通りに実行させる魔法
      script.defer = true;
      document.head.appendChild(script);
    }
  });
})();