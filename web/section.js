/**
 * section.js - 記事表示コンポーネント (修正版)
 * 役割: 記事カード生成、カルーセル(チラ見せ)制御、自動再生
 */
(async function() {
  "use strict";

  // common.js からの依存取得
  const { NET, esc, ratio } = window.LZ_COMMON;

  // LZ_CONFIG の待機
  const config = await new Promise(r => {
    const check = () => window.LZ_CONFIG ? r(window.LZ_CONFIG) : setTimeout(check, 50);
    check();
  });

  /* ==========================================
     1. CSSの注入 (一覧・カード・カルーセル専用)
     ========================================== */
  const injectSectionStyles = () => {
    const style = document.createElement('style');
    style.id = 'lz-section-styles';
    style.textContent = `
      /* セクション外殻 */
      .lz-section { visibility: hidden; margin: 48px 0; position: relative; opacity: 0; transition: opacity 0.5s ease; }
      .lz-section.lz-ready { visibility: visible; opacity: 1; }

      /* L2タイトル（赤帯） - マスクの影響を受けないよう隔離 */
      .lz-head { margin: 0 0 16px; position: relative; z-index: 10; }
      .lz-titlewrap { display: block; width: 100%; background: var(--apple-red); color: #fff; border-radius: var(--radius); padding: 14px 16px; box-sizing: border-box; }
      .lz-title { margin: 0; font-weight: var(--fw-l2); font-size: var(--fz-l2); letter-spacing: .02em; white-space: nowrap; }

      /* L3見出し（小見出し） */
      .lz-l3head { display: flex; align-items: center; gap: .55em; margin: 18px 2px 10px; }
      .lz-l3bar { width: 10px; height: 1.4em; background: var(--apple-brown); border-radius: 3px; flex: 0 0 auto; }
      .lz-l3title { margin: 0; font-weight: 600; font-size: var(--fz-l3); color: var(--apple-brown); line-height: 1.25; }

      /* カルーセル構造（チラ見せ設計） */
      .lz-track-outer { position: relative; width: 100%; overflow: hidden; }
      /* 右側のグラデーションマスク */
      .lz-track-outer::after {
        content: ""; position: absolute; top: 0; right: 0; width: 60px; height: 100%;
        background: linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.95));
        pointer-events: none; z-index: 2;
      }
      .lz-track { 
        display: grid; grid-auto-flow: column; 
        grid-auto-columns: var(--cw, calc((100% - 32px) / 3.2)); /* PC: 3.2枚表示 */
        gap: 18px; overflow-x: auto; padding: 12px 12px 32px; 
        scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; 
      }
      .lz-track::-webkit-scrollbar { display: none; }

      @media (max-width: 768px) {
        .lz-track { grid-auto-columns: calc(100% / 1.22); gap: 14px; padding-left: 16px; padding-right: 40px; }
      }

      /* カードデザイン & ホバー演出 */
      .lz-card { 
        border: 1px solid var(--border); border-radius: var(--card-radius); 
        overflow: hidden; scroll-snap-align: start; cursor: pointer; background: #fff; 
        transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.6s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.4s ease;
        will-change: transform;
      }
      .lz-card:hover { transform: translateY(-8px); border-color: var(--apple-red); box-shadow: 0 20px 45px rgba(207, 58, 58, 0.12); }

      /* 画像エリア */
      .lz-media { position: relative; background: #fdfaf8; overflow: hidden; }
      .lz-media::before { content: ""; display: block; padding-top: var(--ratio, 56.25%); }
      .lz-media > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
      .lz-card:hover .lz-media > img { transform: scale(1.08); }

      /* 画像なし時の「リンゴ図形」プレースホルダー */
      .lz-media.is-empty::after {
        content: ""; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
        width: min(40%, 180px); aspect-ratio: 1/1;
        background-image: url('https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ca4e300-96ba-013e-3700-0a58a9feac02/%E3%82%8A%E3%82%93%E3%81%93%E3%82%99%E3%83%AD%E3%82%B3%E3%82%99_%E8%B5%A4.png');
        background-position: center; background-repeat: no-repeat; background-size: contain; opacity: 0.35;
      }

      .lz-body { padding: 14px; display: grid; gap: 6px; }
      .lz-title-sm { margin: 0; font-weight: var(--fw-card-title); font-size: var(--fz-card-title); color: var(--apple-brown); line-height: 1.4; }
      .lz-lead { font-weight: var(--fw-lead); font-size: var(--fz-lead); line-height: 1.6; color: var(--ink-light); min-height: 2.2em; }

      /* ローディング */
      .lz-loading { position: relative; display: flex; align-items: center; justify-content: center; height: var(--loading-h); margin: 8px 0 4px; border: 1px dashed var(--border); border-radius: 12px; background: #fffaf8; }
      .lz-loading-inner { display: flex; flex-direction: column; align-items: center; gap: 10px; color: #a94a4a; }
      .lz-logo { width: 160px; height: 160px; margin-left: -70px; }
      .lz-logo-path { fill: none; stroke: #cf3a3a; stroke-width: 15; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: lz-draw 2.4s ease-in-out infinite alternate; }
      @keyframes lz-draw { from { stroke-dashoffset: 1000; opacity: .8; } to { stroke-dashoffset: 0; opacity: 1; } }
    `;
    document.head.appendChild(style);
  };
  injectSectionStyles();

  /* ==========================================
     2. ロジック: カードHTML・自動再生
     ========================================== */
  function cardHTML(it, pad, groupKey) {
    const title = it.title || "(無題)";
    const hasMain = !!(it.mainImage && it.mainImage.trim() !== "");
    // 全てのカスタムデータ属性を保持
    return `
      <article class="lz-card" id="${esc(title)}" 
        data-id="${esc(title)}" data-title="${esc(title)}" 
        data-lead="${esc(it.lead||"")}" data-body='${esc(it.body||"")}' data-main="${esc(it.mainImage||"")}"
        data-sub='${esc(JSON.stringify(it.subImages||[]))}' data-sns='${esc(JSON.stringify(it.sns||{}))}'
        data-address="${esc(it.address||"")}" data-group="${esc(groupKey)}"
        data-hours-combined="${esc(it.hoursCombined||"")}" data-tel="${esc(it.tel||"")}"
        data-ec="${esc(it.ec||"")}" data-home="${esc(it.home||"")}">
        <div class="lz-media ${hasMain ? "" : "is-empty"}" style="--ratio:${pad}">
          ${hasMain ? `<img src="${esc(it.mainImage)}" loading="lazy" decoding="async" onerror="this.parentElement.classList.add('is-empty'); this.remove();">` : ""}
        </div>
        <div class="lz-body">
          <h3 class="lz-title-sm">${esc(title)}</h3>
          <div class="lz-lead">${esc(it.lead||"")}</div>
        </div>
      </article>`;
  }

  function setupAutoPlay(track, { interval=4000, stepCards=1 } = {}){
    let timer = null;
    const tick = () => {
      const first = track.querySelector(".lz-card");
      if(!first) return;
      const step = Math.max(1, stepCards) * (first.getBoundingClientRect().width + 18);
      let next = track.scrollLeft + step;
      if (next >= (track.scrollWidth - track.clientWidth) - 5) next = 0;
      track.scrollTo({ left: next, behavior: "smooth" });
    };
    const start = () => { if (!timer) timer = setInterval(tick, interval); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? start() : stop()), { threshold: 0.2 });
    io.observe(track);
    ["pointerenter", "touchstart", "wheel"].forEach(ev => track.addEventListener(ev, stop, { passive:true }));
    track.addEventListener("pointerleave", start, { passive:true });
  }

  /* ==========================================
     3. ロジック: セクション描画 (renderSection)
     ========================================== */
  window.renderSection = async function(root) {
    if (root.dataset.lzDone === '1') return;
    const { l1=config.L1, l2="", heading="", cardWidth="33.33%", cardWidthSm="80%", imageRatio="16:9", autoplay="false", autoplayInterval="4000", autoplayStep="1" } = root.dataset;
    
    const mql = window.matchMedia("(max-width:768px)");
    root.style.setProperty("--cw", mql.matches ? cardWidthSm : cardWidth);
    root.style.setProperty("--ratio", ratio(imageRatio));

    // 骨組みの生成
    root.innerHTML = `
      <div class="lz-section">
        <div class="lz-head"><div class="lz-titlewrap"><h2 class="lz-title">${esc(heading || l2)}</h2></div></div>
        <div class="lz-groupwrap">
          <div class="lz-loading"><div class="lz-loading-inner">
            <svg class="lz-logo" viewBox="-60 -60 720 720"><path class="lz-logo-path" d="M287.04,32.3c.29.17,1.01.63,1.46,1.55.57,1.19.29,2.29.2,2.57-7.08,18.09-14.18,36.17-21.26,54.26,5.96-.91,14.77-2.45,25.28-5.06,17.98-4.45,22.46-7.44,33.44-9.85,18.59-4.08,33.88-1.67,44.51,0,21.1,3.32,37.42,10.74,47.91,16.6-4.08,8.59-11.1,20.05-23.06,29.99-18.47,15.35-38.46,18.54-52.07,20.7-7.55,1.21-21.61,3.32-39.12.24-13.71-2.41-11-4.76-30.72-9.36-6.73-1.56-12.82-2.64-17.98-7.87-3.73-3.77-4.92-7.63-6.74-7.3-2.44.43-1.84,7.58-4.5,16.85-.98,3.46-5.56,19.45-14.05,21.35-5.5,1.23-9.85-4.07-17.02-9.79-17.52-13.96-36.26-17.94-45.91-19.99-7.62-1.62-25.33-5.16-45.19,1.36-6.6,2.17-19.57,7.82-35.2,23.74-48.04,48.93-49.39,127.17-49.69,143.97-.08,5-.47,48.18,16.56,90.06,6.63,16.3,14.21,28.27,24.85,38.3,4.2,3.97,12.19,11.37,24.85,16.56,13.72,5.63,26.8,6.15,31.06,6.21,8.06.12,9.06-1.03,14.49,0,10.22,1.95,13.47,7.33,22.77,12.42,10.16,5.56,19.45,6.3,30.02,7.25,8.15.73,18.56,1.67,31.15-1.99,9.83-2.85,16.44-7.18,25.24-12.93,2.47-1.61,9.94-6.61,20.55-16.18,12.76-11.51,21.35-21.79,25.53-26.87,26.39-32.12,39.71-48.12,50.73-71.43,12.87-27.23,17.2-49.56,18.63-57.97,3.23-18.95,5.82-35.27,0-54.87-2.24-7.54-6.98-23.94-21.74-37.27-5.26-4.76-12.9-11.66-24.85-13.46-17.04-2.58-30.24,7.19-33.13,9.32-9.71,7.17-13.91,16.56-21.93,35.04-1.81,4.19-8.26,19.38-14.31,43.63-2.82,11.32-6.43,25.97-8.28,45.55-1.47,15.61-3.27,34.6,1.04,59.01,4.92,27.9,15.01,47.01,17.6,51.76,5.58,10.26,12.02,21.83,24.85,33.13,6.45,5.69,17.55,15.24,35.2,19.77,19.17,4.92,34.7.98,38.3,0,14.29-3.9,24.02-11.27,28.99-15.63"/></svg>
          </div></div>
        </div>
      </div>`;

    const secEl = root.querySelector(".lz-section");
    try {
      const json = await NET.json(`${config.ENDPOINT}?l1=${encodeURIComponent(l1)}&l2=${encodeURIComponent(l2)}`);
      if (!json || !json.ok) throw new Error("Data fail");

      const groups = new Map();
      json.items.forEach(it => { const k = (it.l3||"").trim(); if(!groups.has(k)) groups.set(k, []); groups.get(k).push(it); });

      let html = "";
      const pad = ratio(imageRatio);
      // カルーセル外枠（マスク）でトラックを包む
      const wrapTrack = (content, key) => `<div class="lz-track-outer"><div class="lz-track" data-group="${esc(key)}">${content}</div></div>`;

      groups.forEach((arr, key) => {
        if(key) html += `<div class="lz-l3head"><span class="lz-l3bar"></span><h3 class="lz-l3title">${esc(key)}</h3></div>`;
        html += wrapTrack(arr.map(it => cardHTML(it, pad, key)).join(""), key);
      });

      root.querySelector(".lz-groupwrap").innerHTML = html;
      
      // ★表示の開始★
      secEl.classList.add("lz-ready");
      root.dataset.lzDone = '1';

      if (autoplay === "true") {
        root.querySelectorAll(".lz-track").forEach(t => setupAutoPlay(t, { interval: parseInt(autoplayInterval), stepCards: parseInt(autoplayStep) }));
      }

      // カードクリックイベント（modal.jsとの連携）
      root.addEventListener("click", e => {
        const card = e.target.closest(".lz-card");
        if (card && window.lzModal) window.lzModal.open(card);
      });

    } catch(e) {
      console.error("LZ Section Render Error:", e);
      root.querySelector(".lz-groupwrap").innerHTML = `<div style="padding:40px; text-align:center; color:#999;">記事の読み込みに失敗しました</div>`;
    }
  };

  /* ==========================================
     4. 起動シーケンス
     ========================================== */
  const boot = () => {
    const containers = document.querySelectorAll(".lz-container");
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { io.unobserve(en.target); window.renderSection(en.target); } });
    }, { rootMargin: "200px" });
    containers.forEach(c => io.observe(c));
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

})();