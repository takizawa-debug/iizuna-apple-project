/* web/app.js (司令塔JS) */
(function() {
  // ここでバージョンを一括管理！ 
  // 更新した時はこの日付部分を書き換えるだけで全ページに反映されます
  const v = "20260205_2308"; 
  const base = "https://cdn.jsdelivr.net/gh/takizawa-debug/iizuna-apple-project@main/web/";
  
  const files = [
    { type: 'css', url: base + "style.css" },
    { type: 'js',  url: base + "main.js" },
    { type: 'js',  url: base + "header.js" },
    { type: 'js',  url: base + "search.js" },
    { type: 'js',  url: base + "footer.js" }
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
      script.defer = true;
      document.head.appendChild(script);
    }
  });
  console.log("Appletown System: Loaded v" + v);
})();