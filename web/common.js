/**
 * common.js - Appletown 基盤コンポーネント (安定版ベース・シールド解除最適化)
 */
window.LZ_COMMON = (function() {
  "use strict";

  /* ==========================================
     1. 通信インフラ (LZ_NET)
     ========================================== */
  var NET = (function(){
    var MAX_CONCURRENCY = 20, RETRIES = 2, TIMEOUT_MS = 12000, inFlight = 0, q = [];
    function runNext(){ if (inFlight >= MAX_CONCURRENCY) return; var job = q.shift(); if (!job) return; inFlight++; job().finally(function(){ inFlight--; runNext(); }); }
    function enqueue(task){ return new Promise(function(resolve, reject){ q.push(function(){ return task().then(resolve, reject); }); runNext(); }); }
    async function fetchJSON(url, opt){
      opt = opt || {}; var attempt = 0;
      while (true){
        attempt++; var ac = new AbortController(), timer = setTimeout(function(){ ac.abort(); }, opt.timeout || TIMEOUT_MS);
        try {
          var res = await fetch(url, { mode: "cors", cache: "no-store", credentials: "omit", signal: ac.signal });
          clearTimeout(timer); if (!res.ok) throw new Error("HTTP " + res.status); return await res.json();
        } catch(err) {
          clearTimeout(timer); if (attempt > RETRIES) throw err;
          var backoff = (200 * Math.pow(2, attempt - 1)) + Math.random() * 300; await new Promise(function(r){ setTimeout(r, backoff); });
        }
      }
    }
    return { json: function(url, opt){ return enqueue(function(){ return fetchJSON(url, opt); }); } };
  })();

  /* ==========================================
     2. デザイン・演出設定 (シールド解除アニメ)
     ========================================== */
  var injectCoreStyles = function() {
    if (document.getElementById('lz-common-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-common-styles';
    style.textContent = [
      ':root { --fz-l2: clamp(2.4rem, 5vw, 3.2rem); --apple-red: #cf3a3a; --font-base: system-ui, -apple-system, sans-serif; }',
      '.lz-global-shield.is-hidden { opacity: 0; transition: opacity 0.4s ease-out; pointer-events: none; }'
    ].join('\n');
    document.head.appendChild(style);
  };
  injectCoreStyles();

  /* ==========================================
     3. シールド解除ロジック 🍎
     ========================================== */
  var initShieldController = function() {
    // 看板（L2）が設置された瞬間に解除する監視ロジック
    var checkCount = 0;
    var waitReady = setInterval(function() {
      var targets = document.querySelectorAll('.lz-container, .lz-section[data-l2]');
      var readyCount = 0;

      for (var i = 0; i < targets.length; i++) {
        // 見出しの殻（.lz-section）が生成されたかチェック
        if (targets[i].querySelector('.lz-section')) { readyCount++; }
      }
      
      // セクションがないページ、または全ての看板ができた場合
      if (targets.length === 0 || readyCount >= targets.length) {
        unlock();
      }
      
      if (++checkCount > 100) unlock(); // 最大5秒で強制解除
    }, 50);

    function unlock() {
      clearInterval(waitReady);
      // 🍎 正常に解除されるので、Headタグの安全タイマーを止める
      if (window._lzSafetyFuse) clearTimeout(window._lzSafetyFuse);

      setTimeout(function() {
        var s = document.getElementById('lzGlobalShield');
        if (s) s.classList.add('is-hidden');
        // 🍎 ここでクラスを削除し、スクロールを可能にする
        document.documentElement.classList.remove('lz-loading-lock');
      }, 100);
    }
  };

  /* ==========================================
     4. 多言語管理 ＆ 起動
     ========================================== */
  initShieldController();

  var initLang = function() {
    var urlParams = new URLSearchParams(window.location.search);
    var lang = urlParams.get('lang');
    if (window.LZ_CONFIG && !window.LZ_CONFIG.LANG.SUPPORTED.includes(lang)) lang = window.LZ_CONFIG.LANG.DEFAULT;
    window.LZ_CURRENT_LANG = lang || 'ja';
  };

  var boot = function() {
    if (window.LZ_CONFIG) { initLang(); }
    else { setTimeout(boot, 20); }
  };
  boot();

  return {
    NET: NET,
    T: function(key) { var dict = (window.LZ_CONFIG && window.LZ_CONFIG.LANG.I18N[window.LZ_CURRENT_LANG]) || {}; return dict[key] || key; },
    L: function(item, key) { if (!item) return ""; var lang = window.LZ_CURRENT_LANG; if (lang === 'ja') return item[key] || ""; if (item[lang] && (item[lang][key] !== undefined && item[lang][key] !== "")) return item[lang][key]; return item[key] || ""; },
    esc: function(s){ return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); },
    ratio: function(r){ return ({"16:9":"56.25%","4:3":"75%","1:1":"100%","3:2":"66.67%"}[r] || "56.25%"); },
    loadScript: function(src){ return new Promise(function(res, rej){ if ([].slice.call(document.scripts).some(function(s){ return s.src === src; })) return res(); var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); },
    originalTitle: document.title,
    RED_APPLE: "\u{1F34E}\uFE0F", GREEN_APPLE: "\u{1F34F}\uFE0F"
  };
})();