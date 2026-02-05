/* web/app.js (軽量・機能特化版) */
(function() {
  const v = "20260205_2355"; 
  const base = "https://cdn.jsdelivr.net/gh/takizawa-debug/iizuna-apple-project@main/web/";
  
  const files = [
    // CSSとHeaderは <head> に移動したので、ここには残さない
    { type: 'js',  url: base + "search.js" },
    { type: 'js',  url: base + "main.js" },
    { type: 'js',  url: base + "footer.js" } // フッターを最後にする
  ];

  files.forEach(file => {
    const url = `${file.url}?v=${v}`;
    const script = document.createElement('script');
    script.src = url; 
    script.async = false; // 順番を死守する
    script.defer = true;
    document.head.appendChild(script);
  });
  console.log("Appletown Functions: Loaded v" + v);
})();