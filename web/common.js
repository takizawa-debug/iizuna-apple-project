/**
 * common.js - Appletown 基盤コンポーネント (安定・統合版)
 * 役割: 高信頼通信(NET)、共通変数(CSS/JS)、ユーティリティ
 */
window.LZ_COMMON = (function() {
  "use strict";

  /* ==========================================
     1. 高信頼通信インフラ (LZ_NET)
     ========================================== */
  var NET = (function(){
    var MAX_CONCURRENCY = 20;
    var RETRIES = 2;
    var TIMEOUT_MS = 12000;
    var inFlight = 0;
    var q = [];

    function runNext(){
      if (inFlight >= MAX_CONCURRENCY) return;
      var job = q.shift();
      if (!job) return;
      inFlight++;
      job().finally(function(){ inFlight--; runNext(); });
    }

    function enqueue(task){
      return new Promise(function(resolve, reject){
        q.push(function(){ return task().then(resolve, reject); });
        runNext();
      });
    }

    async function fetchJSON(url, opt){
      opt = opt || {};
      var attempt = 0;
      while (true){
        attempt++;
        var ac = new AbortController();
        var timer = setTimeout(function(){ ac.abort(); }, opt.timeout || TIMEOUT_MS);
        try {
          var res = await fetch(url, {
            mode: "cors",
            cache: "no-store",
            credentials: "omit",
            signal: ac.signal
          });
          clearTimeout(timer);
          if (!res.ok) throw new Error("HTTP " + res.status);
          return await res.json();
        } catch(err) {
          clearTimeout(timer);
          if (attempt > RETRIES) throw err;
          var backoff = (200 * Math.pow(2, attempt - 1)) + Math.random() * 300;
          await new Promise(function(r){ setTimeout(r, backoff); });
        }
      }
    }
    return { json: function(url, opt){ return enqueue(function(){ return fetchJSON(url, opt); }); } };
  })();

  /* ==========================================
     2. デザイン・コア (CSS Variables)
     ========================================== */
  var injectCoreStyles = function() {
    var style = document.createElement('style');
    style.id = 'lz-common-styles';
    style.textContent = [
      ':root {',
      '  --fz-l2: clamp(2.4rem, 5vw, 3.2rem); --fw-l2: 550;',
      '  --fz-card-title: 1.65rem; --fw-card-title: 600;',
      '  --fz-modal-title: 2.0rem; --fw-modal-title: 600;',
      '  --fz-lead: 1.25rem; --fw-lead: 400;',
      '  --fz-body: 1.5rem; --fw-body: 400;',
      '  --apple-red: #cf3a3a; --apple-red-strong: #a82626;',
      '  --apple-green: #2aa85c; --apple-brown: #5b3a1e;',
      '  --ink-dark: #1b1b1b; --ink-light: #495057;',
      '  --border: #e7d3c8; --radius: 14px; --card-radius: 20px;',
      '  --font-base: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans JP", sans-serif;',
      '  --font-article: "筑須A丸ゴシック Std M", "Tsukushi A Maru Gothic Std", "Hiragino Maru Gothic ProN", "Yu Gothic", sans-serif;',
      '  --loading-h: clamp(220px, 38vh, 360px); --fz-l3: 1.85rem;',
      '}',
      '.lz-section, .lz-nav, .lz-backdrop, .lz-modal { font-family: var(--font-base); font-size: var(--fz-body); color: var(--ink-dark); }',
      '.lz-lead, .lz-lead-strong, .lz-txt { font-family: var(--font-article); }',
      '.lz-toast { position: fixed; left: 50%; bottom: 20px; transform: translateX(-50%); background: rgba(17, 17, 17, .88); color: #fff; padding: 10px 14px; border-radius: 12px; font-size: 13px; z-index: 10001; opacity: 0; pointer-events: none; transition: opacity .2s ease; }',
      '.lz-toast.show { opacity: 1; }'
    ].join('\n');
    document.head.appendChild(style);
  };
  injectCoreStyles();

  /* ==========================================
     3. ユーティリティ
     ========================================== */
  return {
    NET: NET,
    esc: function(s){ return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); },
    ratio: function(r){ return ({"16:9":"56.25%","4:3":"75%","1:1":"100%","3:2":"66.67%"}[r] || "56.25%"); },
    loadScript: function(src){
      return new Promise(function(res, rej){
        if ([].slice.call(document.scripts).some(function(s){ return s.src === src; })) return res();
        var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
      });
    },
    originalTitle: document.title,
    RED_APPLE: "\u{1F34E}\uFE0F",
    GREEN_APPLE: "\u{1F34F}\uFE0F",
    PDF_FOOTER: { dtPt:8, dtBottomMm:7, jpPt:16, jpBaselineGapMm:1.8, qrSizeMm:18 },
    pt2mm: function(pt){ return pt * 0.3528; },
    pt2px: function(pt){ return pt * (96/72); }
  };
})();