/**
 * common.js - Appletown OS (基盤インフラ)
 * 役割: 通信、共通ユーティリティ、グローバルデザインルール
 */
window.LZ_COMMON = (function() {
  "use strict";

  /* ==========================================
     1. 高信頼フェッチ (LZ_NET)
     ========================================== */
  const NET = (function(){
    const MAX_CONCURRENCY = 20;
    const RETRIES = 2;
    const TIMEOUT_MS = 12000;

    let inFlight = 0;
    const q = [];

    function runNext(){
      if (inFlight >= MAX_CONCURRENCY) return;
      const job = q.shift();
      if (!job) return;
      inFlight++;
      job().finally(()=>{ inFlight--; runNext(); });
    }

    function enqueue(task){
      return new Promise((resolve, reject)=>{
        q.push(()=> task().then(resolve, reject));
        runNext();
      });
    }

    async function fetchJSON(url, opt={}){
      let attempt = 0;
      while (true){
        attempt++;
        const ac = new AbortController();
        const timer = setTimeout(()=> ac.abort(), opt.timeout || TIMEOUT_MS);
        try{
          const res = await fetch(url, {
            mode: "cors",
            cache: "no-store",
            credentials: "omit",
            signal: ac.signal,
            ...opt
          });
          clearTimeout(timer);
          if (!res.ok) throw new Error("HTTP " + res.status);
          return await res.json();
        }catch(err){
          clearTimeout(timer);
          if (attempt > (opt.retries ?? RETRIES) + 1) throw err;
          const backoff = (200 * Math.pow(2, attempt-1)) + Math.random()*300;
          await new Promise(r=>setTimeout(r, backoff));
        }
      }
    }

    return { json: (url, opt) => enqueue(()=> fetchJSON(url, opt)) };
  })();

  /* ==========================================
     2. デザイン・コア (CSS Variables)
     ========================================== */
  const injectCoreStyles = () => {
    const style = document.createElement('style');
    style.id = 'lz-common-styles';
    style.textContent = `
      :root {
        --fz-l2: clamp(2.4rem, 5vw, 3.2rem); --fw-l2: 550;
        --fz-card-title: 1.65rem; --fw-card-title: 600;
        --fz-modal-title: 2.0rem; --fw-modal-title: 600;
        --fz-lead: 1.25rem; --fw-lead: 400;
        --fz-body: 1.5rem; --fw-body: 400;
        --apple-red: #cf3a3a; --apple-red-strong: #a82626;
        --apple-green: #2aa85c; --apple-brown: #5b3a1e;
        --ink-dark: #1b1b1b; --ink-light: #495057;
        --border: #e7d3c8; --radius: 14px; --card-radius: 20px;
        --font-base: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans JP", sans-serif;
        --font-article: "筑須A丸ゴシック Std M", "Tsukushi A Maru Gothic Std", "Hiragino Maru Gothic ProN", "Yu Gothic", sans-serif;
        --loading-h: clamp(220px, 38vh, 360px);
        --fz-l3: 1.85rem;
      }
      .lz-section, .lz-nav, .lz-backdrop, .lz-modal {
        font-family: var(--font-base); font-weight: var(--fw-body); font-size: var(--fz-body); color: var(--ink-dark);
      }
      .lz-lead, .lz-lead-strong, .lz-txt { font-family: var(--font-article); }
      
      /* トースト通知 */
      .lz-toast { position: fixed; left: 50%; bottom: 20px; transform: translateX(-50%); background: rgba(17, 17, 17, .88); color: #fff; padding: 10px 14px; border-radius: 12px; font-size: 13px; z-index: 10001; opacity: 0; pointer-events: none; transition: opacity .2s ease; }
      .lz-toast.show { opacity: 1; }
    `;
    document.head.appendChild(style);
  };
  injectCoreStyles();

  /* ==========================================
     3. ユーティリティ
     ========================================== */
  const esc = s => String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
  const ratio = r => ({"16:9":"56.25%","4:3":"75%","1:1":"100%","3:2":"66.67%"}[r]||"56.25%");
  const RED_APPLE="\u{1F34E}\uFE0F", GREEN_APPLE="\u{1F34F}\uFE0F";
  const PDF_FOOTER = { dtPt:8, dtBottomMm:7, jpPt:16, jpBaselineGapMm:1.8, qrSizeMm:18 };
  const pt2mm = pt => pt * 0.3528, pt2px = pt => pt * (96/72);

  // 公開API
  return {
    NET, esc, ratio, RED_APPLE, GREEN_APPLE, PDF_FOOTER, pt2mm, pt2px,
    originalTitle: document.title
  };
})();