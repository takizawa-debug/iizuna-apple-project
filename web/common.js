/**
 * common.js - 基盤コンポーネント
 */
window.LZ_COMMON = (function() {
  "use strict";

  const NET = (function(){
    const MAX_CONCURRENCY = 20, RETRIES = 2, TIMEOUT_MS = 12000;
    let inFlight = 0; const q = [];
    function runNext(){ if (inFlight >= MAX_CONCURRENCY) return; const job = q.shift(); if (!job) return; inFlight++; job().finally(()=>{ inFlight--; runNext(); }); }
    function enqueue(task){ return new Promise((res, rej)=>{ q.push(()=> task().then(res, rej)); runNext(); }); }
    async function fetchJSON(url, opt={}){
      let attempt = 0;
      while (attempt <= RETRIES){
        attempt++; const ac = new AbortController();
        const timer = setTimeout(()=> ac.abort(), opt.timeout || TIMEOUT_MS);
        try{
          const res = await fetch(url, { mode: "cors", cache: "no-store", signal: ac.signal, ...opt });
          clearTimeout(timer); if (!res.ok) throw new Error("HTTP " + res.status); return await res.json();
        }catch(err){
          clearTimeout(timer); if (attempt > RETRIES) throw err;
          await new Promise(r=>setTimeout(r, (200 * Math.pow(2, attempt-1)) + Math.random()*300));
        }
      }
    }
    return { json: (url, opt) => enqueue(()=> fetchJSON(url, opt)) };
  })();

  const esc = s => String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
  const ratio = r => ({"16:9":"56.25%","4:3":"75%","1:1":"100%","3:2":"66.67%"}[r]||"56.25%");
  const loadScript = src => new Promise((res,rej)=>{ if([...document.scripts].some(s=>s.src===src)) return res(); const s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); });

  // CSS変数の注入
  const style = document.createElement('style');
  style.id = 'lz-common-styles';
  style.textContent = `
    :root {
      --fz-l2: clamp(2.4rem, 5vw, 3.2rem); --fw-l2: 550;
      --fz-card-title: 1.65rem; --fw-card-title: 600;
      --fz-modal-title: 2.0rem; --fw-modal-title: 600;
      --fz-lead: 1.25rem; --fw-lead: 400;
      --fz-body: 1.5rem; --fw-body: 400;
      --fz-l3: 1.85rem;
      --apple-red: #cf3a3a; --apple-red-strong: #a82626; --apple-green: #2aa85c; --apple-brown: #5b3a1e;
      --border: #e7d3c8; --radius: 14px; --card-radius: 20px;
      --font-base: system-ui, -apple-system, sans-serif;
      --font-article: "筑須A丸ゴシック Std M", sans-serif;
      --loading-h: 300px;
    }
    /* 監視用の最小高さを確保 */
    .lz-container { min-height: 100px; display: block; width: 100%; }
    .lz-section { font-family: var(--font-base); opacity: 0; transition: opacity 0.5s ease; }
    .lz-section.lz-ready { opacity: 1; }
  `;
  document.head.appendChild(style);

  return { NET, esc, ratio, loadScript, RED_APPLE: "\u{1F34E}\uFE0F", GREEN_APPLE: "\u{1F34F}\uFE0F", originalTitle: document.title };
})();