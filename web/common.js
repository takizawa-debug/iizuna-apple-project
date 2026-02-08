/**
 * common.js - Appletown 基盤コンポーネント (シールド解除タイミング最適化版)
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
     2. デザイン・シールド CSS 🍎
     ========================================== */
  var injectCoreStyles = function() {
    var style = document.createElement('style');
    style.id = 'lz-common-styles';
    style.textContent = [
      ':root {',
      '  --fz-l2: clamp(2.4rem, 5vw, 3.2rem); --apple-red: #cf3a3a; --apple-red-strong: #a82626;',
      '  --apple-green: #2aa85c; --apple-brown: #5b3a1e; --font-base: system-ui, -apple-system, sans-serif;',
      '}',
      'body.lz-is-loading { overflow: hidden !important; height: 100vh !important; }',
      '.lz-global-shield { position: fixed; inset: 0; background: #fff; z-index: 30000; display: flex; align-items: center; justify-content: center; opacity: 1; transition: opacity 0.4s ease-out; }',
      '.lz-global-shield.is-hidden { opacity: 0; pointer-events: none; }',
      '.lz-shield-logo { width: 80px; height: auto; animation: lz-pulse 1.5s infinite ease-in-out; }',
      '@keyframes lz-pulse { 0% { transform: scale(0.92); opacity: 0.6; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(0.92); opacity: 0.6; } }'
    ].join('\n');
    document.head.appendChild(style);
  };
  injectCoreStyles();

  /* ==========================================
     3. シールド表示と「看板設置」での解除ロジック 🍎
     ========================================== */
  var initShield = function() {
    document.body.classList.add('lz-is-loading');
    var shield = document.createElement('div');
    shield.className = 'lz-global-shield';
    shield.id = 'lzGlobalShield';
    shield.innerHTML = '<img class="lz-shield-logo" src="https://cdn.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ca4e300-96ba-013e-36ff-0a58a9feac02/%E3%82%8A%E3%82%93%E3%81%93%E3%82%99%E3%83%AD%E3%82%B3%E3%82%99_%E8%B5%A4.png">';
    document.body.insertAdjacentElement('afterbegin', shield);

    // 🍎 監視ロジックの変更：
    // 全ての .lz-container または [data-l2] の中に
    // section.js が見出しの殻（.lz-section）を流し込んだ瞬間に解除する
    var checkCount = 0;
    var waitReady = setInterval(function() {
      var targets = document.querySelectorAll('.lz-container, .lz-section[data-l2]');
      var readyCount = 0;

      for (var i = 0; i < targets.length; i++) {
        // targets[i] の中に .lz-section という div が生成されたかチェック
        if (targets[i].querySelector('.lz-section')) {
          readyCount++;
        }
      }
      
      // セクションが見つからないページ、または全てのセクションの「殻」ができた場合
      if (targets.length === 0 || readyCount >= targets.length) {
        unlock();
      }
      
      if (++checkCount > 120) unlock(); // セーフティ（6秒）
    }, 50); // 頻度を上げてレスポンスを改善

    function unlock() {
      clearInterval(waitReady);
      setTimeout(function() {
        var s = document.getElementById('lzGlobalShield');
        if (s) s.classList.add('is-hidden');
        document.body.classList.remove('lz-is-loading');
      }, 100); // 殻ができたらほぼノータイムで解除
    }
  };

  /* ==========================================
     4. 多言語管理 (全維持)
     ========================================== */
  var initLang = function() {
    var urlParams = new URLSearchParams(window.location.search);
    var lang = urlParams.get('lang');
    if (!window.LZ_CONFIG.LANG.SUPPORTED.includes(lang)) lang = window.LZ_CONFIG.LANG.DEFAULT;
    window.LZ_CURRENT_LANG = lang;
  };

  var boot = function() {
    if (window.LZ_CONFIG) { initLang(); initShield(); }
    else { setTimeout(boot, 20); }
  };
  boot();

  return {
    NET: NET,
    T: function(key) { var dict = window.LZ_CONFIG.LANG.I18N[window.LZ_CURRENT_LANG] || window.LZ_CONFIG.LANG.I18N[window.LZ_CONFIG.LANG.DEFAULT]; return dict[key] || key; },
    L: function(item, key) { if (!item) return ""; var lang = window.LZ_CURRENT_LANG; if (lang === window.LZ_CONFIG.LANG.DEFAULT) return item[key] || ""; if (item[lang] && (item[lang][key] !== undefined && item[lang][key] !== "")) return item[lang][key]; return item[key] || ""; },
    esc: function(s){ return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); },
    ratio: function(r){ return ({"16:9":"56.25%","4:3":"75%","1:1":"100%","3:2":"66.67%"}[r] || "56.25%"); },
    loadScript: function(src){ return new Promise(function(res, rej){ if ([].slice.call(document.scripts).some(function(s){ return s.src === src; })) return res(); var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); },
    originalTitle: document.title,
    RED_APPLE: "\u{1F34E}\uFE0F", GREEN_APPLE: "\u{1F34F}\uFE0F"
  };
})();