/* web/app.js (即戦力・機能特化版) */
(function() {
  const v = "20260205_2400"; 
  const base = "https://cdn.jsdelivr.net/gh/takizawa-debug/iizuna-apple-project@main/web/";
  
  const files = [
    { type: 'js',  url: base + "header.js" },
    { type: 'js',  url: base + "search.js" },
    { type: 'js',  url: base + "main.js" }   // ヘッダーの挙動に必要なメインロジック
  ];

  files.forEach(file => {
    const url = `${file.url}?v=${v}`;
    const script = document.createElement('script');
    script.src = url; 
    script.async = false; // 順番を死守
    script.defer = true;
    document.head.appendChild(script);
  });
  console.log("Appletown Top Functions: Loaded v" + v);
})();