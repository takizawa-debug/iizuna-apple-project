/**
 * section.js - 修正版
 */
(function() {
  "use strict";

  const { NET, esc, ratio } = window.LZ_COMMON;

  // 1. スタイルの即時注入
  const style = document.createElement('style');
  style.textContent = `
    .lz-head { margin: 0 0 16px; position: relative; z-index: 10; }
    .lz-titlewrap { background: var(--apple-red); color: #fff; border-radius: var(--radius); padding: 14px 16px; }
    .lz-title { margin: 0; font-size: var(--fz-l2); white-space: nowrap; }
    .lz-track-outer { position: relative; width: 100%; }
    .lz-track-outer::after {
      content: ""; position: absolute; top: 0; right: 0; width: 60px; height: 100%;
      background: linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.95));
      pointer-events: none; z-index: 2;
    }
    .lz-track { display: grid; grid-auto-flow: column; grid-auto-columns: var(--cw, calc((100% - 32px) / 3.2)); gap: 18px; overflow: auto; padding: 12px 12px 32px; scroll-snap-type: x mandatory; scrollbar-width: none; }
    @media (max-width: 768px) { .lz-track { grid-auto-columns: calc(100% / 1.22); padding-right: 40px; } }
    .lz-card { border: 1px solid var(--border); border-radius: var(--card-radius); overflow: hidden; background: #fff; cursor: pointer; transition: 0.6s cubic-bezier(0.22, 1, 0.36, 1); will-change: transform; }
    .lz-card:hover { transform: translateY(-8px); box-shadow: 0 20px 45px rgba(207, 58, 58, 0.12); }
    .lz-media { position: relative; background: #fdfaf8; overflow: hidden; }
    .lz-media::before { content: ""; display: block; padding-top: var(--ratio); }
    .lz-media > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: 0.8s; }
    .lz-card:hover .lz-media > img { transform: scale(1.08); }
    .lz-media.is-empty::after { content: ""; position: absolute; inset: 0; margin: auto; width: 40%; aspect-ratio: 1/1; opacity: 0.35; background: url('https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ca4e300-96ba-013e-3700-0a58a9feac02/%E3%82%8A%E3%82%93%E3%81%93%E3%82%99%E3%83%AD%E3%82%B3%E3%82%99_%E8%B5%A4.png') center/contain no-repeat; }
    .lz-body { padding: 14px; display: grid; gap: 6px; }
    .lz-title-sm { margin: 0; font-size: 1.65rem; color: var(--apple-brown); }
    .lz-lead { font-size: 1.25rem; line-height: 1.6; color: #495057; }
  `;
  document.head.appendChild(style);

  // 2. カードHTML
  function cardHTML(it, pad, groupKey) {
    const title = it.title || "(無題)", hasMain = !!(it.mainImage && it.mainImage.trim() !== "");
    return `
      <article class="lz-card" data-id="${esc(title)}" data-title="${esc(title)}" data-lead="${esc(it.lead||"")}" data-body='${esc(it.body||"")}' data-main="${esc(it.mainImage||"")}" data-sub='${esc(JSON.stringify(it.subImages||[]))}' data-sns='${esc(JSON.stringify(it.sns||{}))}' data-home="${esc(it.home||"")}" data-ec="${esc(it.ec||"")}" data-group="${esc(groupKey)}">
        <div class="lz-media ${hasMain ? "" : "is-empty"}" style="--ratio:${pad}">
          ${hasMain ? `<img src="${esc(it.mainImage)}" loading="lazy" onerror="this.parentElement.classList.add('is-empty'); this.remove();">` : ""}
        </div>
        <div class="lz-body"><h3 class="lz-title-sm">${esc(title)}</h3><div class="lz-lead">${esc(it.lead||"")}</div></div>
      </article>`;
  }

  // 3. 描画関数
  window.renderSection = async function(root) {
    if (root.dataset.lzDone === '1') return;
    root.dataset.lzDone = '1';

    // 内部で設定を待機（スクリプト全体の進行は止めない）
    const cfg = window.LZ_CONFIG || await new Promise(r => { const i = setInterval(() => { if(window.LZ_CONFIG){ clearInterval(i); r(window.LZ_CONFIG); } }, 50); });

    const { l2="", heading="", cardWidth="33.33%", cardWidthSm="80%", imageRatio="16:9" } = root.dataset;
    const mql = window.matchMedia("(max-width:768px)");
    root.style.setProperty("--cw", mql.matches ? cardWidthSm : cardWidth);
    root.style.setProperty("--ratio", ratio(imageRatio));

    root.innerHTML = `<div class="lz-section"><div class="lz-head"><div class="lz-titlewrap"><h2 class="lz-title">${esc(heading || l2)}</h2></div></div><div class="lz-groupwrap" style="min-height:200px;"></div></div>`;
    const wrap = root.querySelector(".lz-groupwrap");

    try {
      const json = await NET.json(`${cfg.ENDPOINT}?l1=${encodeURIComponent(cfg.L1)}&l2=${encodeURIComponent(l2)}`);
      if (!json || !json.ok) return;

      const groups = new Map();
      json.items.forEach(it => { const k = (it.l3||"").trim(); if(!groups.has(k)) groups.set(k, []); groups.get(k).push(it); });

      let html = "";
      const pad = ratio(imageRatio);
      groups.forEach((arr, key) => {
        if(key) html += `<div class="lz-l3head"><span class="lz-l3bar"></span><h3 class="lz-l3title">${esc(key)}</h3></div>`;
        html += `<div class="lz-track-outer"><div class="lz-track">${arr.map(it => cardHTML(it, pad, key)).join("")}</div></div>`;
      });
      wrap.innerHTML = html;
      root.querySelector(".lz-section").classList.add("lz-ready");
      
      // クリックイベント
      root.addEventListener("click", e => {
        const c = e.target.closest(".lz-card");
        if (c && window.lzModal) window.lzModal.open(c);
      });
    } catch(e) { console.error("Render error:", e); }
  };

  // 4. 起動
  const boot = () => {
    const containers = document.querySelectorAll(".lz-container");
    const io = new IntersectionObserver(es => es.forEach(en => { if(en.isIntersecting){ io.unobserve(en.target); window.renderSection(en.target); } }), { rootMargin: "300px" });
    containers.forEach(c => io.observe(c));
    // 万が一の予備：2秒後に見えていなくても強制的に一番上のコンテナだけ描画
    setTimeout(() => { if(containers[0] && !containers[0].dataset.lzDone) window.renderSection(containers[0]); }, 2000);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();