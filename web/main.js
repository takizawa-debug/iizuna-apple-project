/* ====== 高信頼フェッチ：timeout / retry / concurrency 制御 (LZ_NET) ====== */
const LZ_NET = (function(){
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

/* ====== 設定 ====== */
const LZ_ENDPOINT = window.LZ_CONFIG.ENDPOINT;
if (!window.CSS || !CSS.escape) { window.CSS = window.CSS || {}; CSS.escape = s => String(s).replace(/[^a-zA-Z0-9_\-]/g,"\\$&"); }
const PDF_FOOTER = { dtPt:8, dtBottomMm:7, jpPt:16, jpBaselineGapMm:1.8, qrSizeMm:18 };

/* ====== 外部ライブラリ読み込み ====== */
function LZ_loadScript(src){
  return new Promise((res,rej)=>{
    if ([...document.scripts].some(s => s.src === src)) return res();
    const s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s);
  });
}
async function ensurePdfLibs(){
  if(!window.jspdf){ await LZ_loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"); }
  if(!window.html2canvas){ await LZ_loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"); }
  if(!window.QRCode){ await LZ_loadScript("https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"); }
}

/* ====== ユーティリティ ====== */
const esc = s => String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const ratio = r => ({"16:9":"56.25%","4:3":"75%","1:1":"100%","3:2":"66.67%"}[r]||"56.25%");
const RED_APPLE="\u{1F34E}\uFE0F", GREEN_APPLE="\u{1F34F}\uFE0F";
const pt2mm = pt => pt * 0.3528, pt2px = pt => pt * (96/72);

function lzCenterLogoSVG(svg){
  try{
    const path = svg.querySelector('path, .lz-logo-path');
    if(!path) return;
    const bb = path.getBBox();
    const cx = bb.x + bb.width / 2;
    const cy = bb.y + bb.height / 2;
    const box = Math.max(bb.width, bb.height);
    svg.setAttribute('viewBox', `${cx - box/2} ${cy - box/2} ${box} ${box}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  }catch(e){}
}

function setupAutoPlay(track, { interval=4000, stepCards=1 } = {}){
  let timer = null;
  const cardW = () => {
    const first = track.querySelector(".lz-card");
    return first ? first.getBoundingClientRect().width + 12 : track.clientWidth * 0.9;
  };
  function tick(){
    const next = (track.scrollLeft + Math.max(1, stepCards) * cardW());
    track.scrollTo({ left: (next >= track.scrollWidth - track.clientWidth - 2 ? 0 : next), behavior: "smooth" });
  }
  function start(){ if (!timer) timer = setInterval(tick, interval); }
  function stop(){ if (timer) { clearInterval(timer); timer = null; } }
  const io = new IntersectionObserver(es=>{ es.forEach(e=> e.isIntersecting ? start() : stop()); }, { threshold: 0.3 });
  io.observe(track);
  track.addEventListener("pointerenter", stop, { passive:true });
  track.addEventListener("pointerleave", start, { passive:true });
}

const ICON = {
  web:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
  ec:`<svg viewBox="0 0 24 24"><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20 8H6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="19" r="1.6" fill="currentColor"/><circle cx="17" cy="19" r="1.6" fill="currentColor"/></svg>`,
  ig:`<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7z"/><path fill="currentColor" d="M12 7a5 5 0 1 1 0 10 5 5 0 1 1 0-10zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>`,
  fb:`<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13 22v-8h3l1-4h-4V7c0-1.1.9-2 2-2h2V1h-3a5 5 0 0 0-5 5v3H6v4h3v8h4z"/></svg>`,
  x:`<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3l8.5 9.7L3.8 21H7l5.2-6.6L17.6 21H21l-9-10.3L20.2 3H17L12 9.2 7.6 3H3z"/></svg>`,
  line:`<svg viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M6.2 3.5H17.8c2.6 0 4.7 2 4.7 4.6v6.2c0 2.6-2.1 4.6-4.7 4.6H12c-.3 0 -.6.1 -.8.3l-2.9 2.4c-.3.2 -.7 0 -.7 -.4l.2 -2.5c0 -.3 -.2 -.6 -.5 -.7C5.3 17.7 3.5 15.7 3.5 14.3V8.1c0 -2.6 2.1 -4.6 4.7 -4.6Z"/></svg>`,
  tt:`<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2h3.2c.2 1.7 1.5 3 3.3 3.3V9c-1.9 -.1 -3.4 -.7 -4.5 -1.8v6.8c0 3 -2.4 5.4 -5.4 5.4S3.2 17 3.2 14s2.4 -5.4 5.4 -5.4c.6 0 1.2 .1 1.7 .3V12c-.3 -.1 -.6 -.2 -1 -.2-1.3 0-2.4 1.1-2.4 2.4S7.9 16.6 9.2 16.6c1.3 0 2.4 -1.1 2.4 -2.4V2z"/></svg>`
};

let TOAST=null;
function toast(msg="コピーしました"){
  if(!TOAST){ TOAST=document.createElement("div"); TOAST.className="lz-toast"; document.body.appendChild(TOAST); }
  TOAST.textContent=msg; TOAST.classList.add("show"); setTimeout(()=>TOAST.classList.remove("show"), 1400);
}

let HOST=null, SHELL=null, MODAL=null, CARDS=[], IDX=0;
let originalTitle = document.title; // 【SEO】

function ensureModal(){
  if(HOST) return;
  HOST=document.createElement("div"); HOST.className="lz-backdrop";
  HOST.innerHTML=`<div class="lz-shell"><div class="lz-modal"></div></div>`;
  document.body.appendChild(HOST);
  SHELL = HOST.firstElementChild; MODAL = SHELL.firstElementChild;
  HOST.addEventListener("click",e=>{ if(e.target===HOST) lzClose(); },{passive:true});
  document.addEventListener("keydown",e=>{ if(e.key==="Escape") lzClose(); },{passive:true});
}

function lzOpen(html){
  ensureModal(); MODAL.innerHTML = html;
  SHELL.querySelectorAll(".lz-prev, .lz-next").forEach(b=>b.remove());
  if (CARDS.length > 1){
    const prev = document.createElement("button"); prev.className = "lz-arrow lz-prev";
    prev.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
    const next = document.createElement("button"); next.className = "lz-arrow lz-next";
    next.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
    prev.onclick = ()=> showModal(IDX-1); next.onclick = ()=> showModal(IDX+1);
    SHELL.appendChild(prev); SHELL.appendChild(next);
  }
  HOST.classList.add("open");
}

function lzClose(){
  if(!HOST) return; HOST.classList.remove("open");
  document.title = originalTitle; 
  try{ 
    const url = new URL(window.location.href);
    url.searchParams.delete('id');
    history.replaceState(null, "", url.pathname + url.search); 
  }catch(e){}
}
window.lzClose = lzClose;

function shareUrlFromCard(card){
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('id', card.dataset.id);
  return url.toString();
}

function renderFooterImagePx(text, px=16, color="#000"){
  const scale = 2, w=1200, h=Math.round(px*2.4);
  const canvas = document.createElement("canvas"); canvas.width=w*scale; canvas.height=h*scale;
  const ctx = canvas.getContext("2d"); ctx.scale(scale, scale);
  ctx.fillStyle="#fff"; ctx.fillRect(0,0,w,h);
  ctx.fillStyle=color; ctx.font = `${px}px "Noto Sans JP","Yu Gothic",sans-serif`; ctx.textBaseline="middle";
  ctx.fillText(text, 2, h/2);
  return { data: canvas.toDataURL("image/png"), ar: h/w };
}

function get(obj, keys){ for(const k of keys){ if(obj && obj[k]!=null && obj[k]!=="" ) return obj[k]; } return ""; }

function cardHTML(it, pad, groupKey){
  const title = (it.title || "(無題)");
  return `<article class="lz-card" id="${esc(title)}" data-id="${esc(title)}" data-title="${esc(title)}" data-lead="${esc(it.lead||"")}" data-body='${esc(it.body||"")}' data-main="${esc(it.mainImage||"")}" data-sub='${esc(JSON.stringify(it.subImages||[]))}' data-sns='${esc(JSON.stringify(it.sns||{}))}' data-related='${esc(JSON.stringify(it.relatedArticles||[]))}' data-address="${esc(it.address||"")}" data-form="${esc(it.form||"")}" data-email="${esc(it.email||"")}" data-tel="${esc(it.tel||"")}" data-home="${esc(it.home||"")}" data-ec="${esc(it.ec||"")}" data-hours-combined="${esc(it.hoursCombined)}" data-event-date="${esc(it.eventDate)}" data-event-time="${esc(it.eventTime)}" data-biz-days="${esc(it.bizDays)}" data-holiday="${esc(it.holiday)}" data-biz-note="${esc(it.bizNote)}" data-fee="${esc(it.fee)}" data-bring="${esc(it.bring)}" data-target="${esc(it.target||"")}" data-apply="${esc(it.apply||"")}" data-org="${esc(it.organizer||"")}" data-org-tel="${esc(it.organizerTel||"")}" data-venue-note="${esc(it.venueNote)}" data-note="${esc(it.note)}" data-dl="${esc(it.downloadUrl)}" data-group="${esc(groupKey)}">
    <div class="lz-media ${it.mainImage ? "" : "is-empty"}" style="--ratio:${pad}">${it.mainImage ? `<img loading="lazy" crossorigin="anonymous" src="${esc(it.mainImage)}" alt="${esc(title)}の画像">` : ""}</div>
    <div class="lz-body"><h3 class="lz-title-sm">${esc(title)}</h3><div class="lz-lead">${esc(it.lead||"")}</div></div>
  </article>`;
}

function buildInfoTableHTML(card){
  const rows = [];
  const fields = [ {k:"address", l:"住所"}, {k:"biz-days", l:"営業曜日"}, {k:"holiday", l:"定休日"}, {k:"hours-combined", l:"営業時間"}, {k:"biz-note", l:"営業注意事項"}, {k:"event-date", l:"開催日"}, {k:"event-time", l:"開催時間"}, {k:"fee", l:"参加費"}, {k:"bring", l:"もちもの"}, {k:"target", l:"対象"}, {k:"apply", l:"申し込み方法"}, {k:"org", l:"主催者名"}, {k:"org-tel", l:"連絡先"}, {k:"venue-note", l:"会場注意事項"}, {k:"note", l:"備考"} ];
  fields.forEach(f=>{ if(card.dataset[f.k]) rows.push(`<tr><th>${f.l}</th><td>${esc(card.dataset[f.k])}</td></tr>`); });
  const links = [];
  if(card.dataset.form) links.push(`<a href="${esc(card.dataset.form)}" target="_blank">フォーム</a>`);
  if(card.dataset.email) links.push(`<a href="mailto:${esc(card.dataset.email)}">${esc(card.dataset.email)}</a>`);
  if(card.dataset.tel) links.push(`<a href="tel:${esc(card.dataset.tel)}">${esc(card.dataset.tel)}</a>`);
  if(links.length) rows.push(`<tr><th>問い合わせ</th><td>${links.join(' / ')}</td></tr>`);
  return rows.length ? `<table class="lz-info"><tbody>${rows.join("")}</tbody></table>` : "";
}

function buildSNSIconsHTML(card){
  let sns={}; try{ sns = JSON.parse(card.dataset.sns||"{}"); }catch{}
  const btn = (url, key, label) => url ? `<a class="lz-sns-btn" data-sns="${key}" href="${esc(url)}" target="_blank" aria-label="${label}">${ICON[key]}</a>` : "";
  return `<div class="lz-sns">${[btn(card.dataset.home,"web","HP"), btn(card.dataset.ec,"ec","EC"), btn(sns.instagram,"ig","IG"), btn(sns.facebook,"fb","FB"), btn(sns.x,"x","X"), btn(sns.line,"line","Line"), btn(sns.tiktok,"tt","TT")].filter(Boolean).join("")}</div>`;
}

function showModalFromCard(card){
  if(!card) return;
  const t = card.dataset.title;
  document.title = `${t} | ${originalTitle}`;
  try{ history.replaceState(null, "", shareUrlFromCard(card)); }catch(e){}

  let subs=[]; try{ subs=JSON.parse(card.dataset.sub||"[]"); }catch{}
  const gallery=[card.dataset.main, ...subs].filter(Boolean);
  const imageBlock = gallery.length ? `<div class="lz-mm"><img id="lz-mainimg" crossorigin="anonymous" src="${esc(gallery[0])}" alt="${esc(t)}のメイン画像"></div>` : '';
  const galleryBlock = (gallery.length>1) ? `<div class="lz-g" id="lz-gallery">${gallery.map((u,i)=>`<img crossorigin="anonymous" src="${esc(u)}" data-img-idx="${i}" class="${i===0?'is-active':''}" alt="">`).join("")}</div>` : '';

  lzOpen(`<div class="lz-mh"><h2 class="lz-mt">${esc(t)}</h2><div class="lz-actions"><button class="lz-btn lz-share">共有</button>${card.dataset.dl ? `<a class="lz-btn lz-dl" href="${esc(card.dataset.dl)}" target="_blank">DL</a>` : ""}${window.innerWidth >= 769 ? `<button class="lz-btn lz-pdf">印刷</button>` : ""}<button class="lz-btn lz-x" onclick="lzClose()">閉じる</button></div></div>${imageBlock}<div class="lz-lead-strong">${esc(card.dataset.lead)}</div><div class="lz-txt">${esc(card.dataset.body)}</div>${galleryBlock}${buildInfoTableHTML(card)}${buildSNSIconsHTML(card)}`);

  const mainImgEl = document.getElementById("lz-mainimg");
  if (gallery.length>1 && mainImgEl){
    document.getElementById("lz-gallery").onclick = e => {
      const img = e.target.closest("img[data-img-idx]");
      if(img) { mainImgEl.src = img.src; [...document.querySelectorAll("#lz-gallery img")].forEach((el,idx)=> el.classList.toggle("is-active", idx==img.dataset.imgIdx)); }
    };
  }
  MODAL.querySelector(".lz-share").onclick = async ()=>{
    const payload = `${RED_APPLE}${t}${GREEN_APPLE}\n詳しくはこちら\n${shareUrlFromCard(card)}`;
    try{ await navigator.share({ text: payload }); }catch(e){ navigator.clipboard.writeText(payload); toast("コピーしました"); }
  };

  /* ====== PDF生成（S3逆変換ロジック搭載） ====== */
  if(MODAL.querySelector(".lz-pdf")){
    MODAL.querySelector(".lz-pdf").onclick = async ()=>{
      if(!confirm("PDFを生成します。よろしいですか？")) return;
      try{
        await ensurePdfLibs();
        const clone = MODAL.cloneNode(true); clone.querySelector(".lz-actions")?.remove();
        clone.style.width="800px"; clone.style.maxHeight="none"; clone.style.height="auto";
        const images = clone.querySelectorAll("img");
        images.forEach(img => {
          let src = img.src;
          const cdnPattern = /^https:\/\/cdn\.peraichi\.com\//i;
          if (cdnPattern.test(src)) { src = src.replace(cdnPattern, "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/"); }
          img.crossOrigin = "anonymous";
          img.src = src + (src.indexOf('?') === -1 ? '?' : '&') + "pdf_retry=" + Date.now();
        });
        document.body.appendChild(clone);
        await Promise.all([...images].map(img => img.complete ? Promise.resolve() : new Promise(res=>img.onload=img.onerror=res)));
        const canvas = await html2canvas(clone,{ scale:2, useCORS:true, backgroundColor:"#ffffff", logging:false });
        document.body.removeChild(clone);
        const pdf = new jspdf.jsPDF("p","mm","a4");
        const imgData = canvas.toDataURL("image/png"), imgW = 190, imgH = canvas.height * imgW / canvas.width;
        pdf.addImage(imgData, "PNG", 10, 10, imgW, imgH);
        pdf.setFontSize(8); pdf.text(`${new Date().toLocaleString()} | 飯綱町産りんごPR事業`, 10, pdf.internal.pageSize.getHeight() - 10);
        window.open(pdf.output("bloburl"), "_blank");
      }catch(e){ console.error(e); alert("PDF生成失敗。"); }
    };
  }
}

function showModal(i){ if(i<0) i=CARDS.length-1; if(i>=CARDS.length) i=0; IDX=i; showModalFromCard(CARDS[i]); }

async function renderSection(root){
  const { l1="", l2="", cardWidth="33.33%", cardWidthSm="80%", imageRatio="16:9" } = root.dataset;
  root.style.setProperty("--cw", window.innerWidth > 768 ? cardWidth : cardWidthSm);
  root.style.setProperty("--ratio", ratio(imageRatio));
  root.innerHTML = `<div class="lz-head"><div class="lz-titlewrap"><h2 class="lz-title">${esc(l2)}</h2></div></div><div class="lz-groupwrap"><div class="lz-loading">読み込み中...</div></div>`;
  try{
    const json = await LZ_NET.json(`${LZ_ENDPOINT}?l1=${encodeURIComponent(l1)}&l2=${encodeURIComponent(l2)}`);
    const wrap = root.querySelector(".lz-groupwrap");
    if(!json.ok || !json.items.length) { wrap.innerHTML="データがありません"; return; }
    const groups = new Map();
    json.items.forEach(it => { const k = it.l3||""; if(!groups.has(k)) groups.set(k,[]); groups.get(k).push(it); });
    let html = "";
    groups.forEach((items, key)=>{
      if(key) html += `<div class="lz-l3head"><span class="lz-l3bar"></span><h3 class="lz-l3title">${esc(key)}</h3></div>`;
      html += `<div class="lz-track">${items.map(it => cardHTML(it, ratio(imageRatio), key)).join("")}</div>`;
    });
    wrap.innerHTML = html; root.classList.add("lz-ready");
    wrap.onclick = e => {
      const card = e.target.closest(".lz-card"); if(!card) return;
      const track = card.closest(".lz-track"); CARDS = [...track.querySelectorAll(".lz-card")]; IDX = CARDS.indexOf(card); showModal(IDX);
    };
  } catch(e) { console.error(e); }
}

function buildNav(){
  const sections = document.querySelectorAll(".lz-section[data-l2]");
  const navs = document.querySelectorAll(".lz-nav");
  if(!sections.length || !navs.length) return;
  const html = `<div class="lz-nav-inner">${[...sections].map(s=> { if(!s.id) s.id = s.dataset.l2; return `<a href="?section=${esc(s.id)}" data-target="${esc(s.id)}">${esc(s.dataset.l2)}</a>`; }).join("")}</div>`;
  navs.forEach(n => {
    n.innerHTML = html;
    n.onclick = e => {
      const a = e.target.closest("a"); if(!a) return; e.preventDefault();
      const id = a.dataset.target, el = document.getElementById(id);
      if(el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
      const url = new URL(location.href); url.searchParams.set("section", id); history.replaceState(null, "", url.pathname + url.search);
    };
  });
}

function boot(){
  buildNav();
  document.querySelectorAll(".lz-section").forEach(s => renderSection(s));
  const params = new URLSearchParams(location.search);
  if(params.get('id')) {
    const openWhenReady = () => { const el = document.getElementById(params.get('id')); if(el){ el.click(); return true; } return false; };
    if(!openWhenReady()){ const mo = new MutationObserver(()=>{ if(openWhenReady()) mo.disconnect(); }); mo.observe(document.documentElement, {childList:true,subtree:true}); setTimeout(()=>mo.disconnect(), 8000); }
  }
  if(params.get('section')) setTimeout(()=>{ const el=document.getElementById(params.get('section')); if(el) window.scrollTo({top:el.offsetTop-80}); }, 1000);
}
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();

/* ====== Eager Load Patch ====== */
(function forceEagerLoadForLZ(){
  var _origRenderSection = window.renderSection; if (typeof _origRenderSection !== 'function') return;
  function guardedRenderSection(el){ if (!el || el.classList?.contains('lz-ready') || el.dataset.lzDone === '1') return; el.dataset.lzDone = '1'; return _origRenderSection(el); }
  window.renderSection = guardedRenderSection;
  function eager(){ var sections = document.querySelectorAll('.lz-section[data-l2]'); sections.forEach(function(s){ guardedRenderSection(s); }); }
  if (document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', eager); } else { eager(); }
})();

/* ====== Appletown Analytics (Optimized) ====== */
(function () {
  "use strict";
  if (window.__APZ_NS?.bound) return; (window.__APZ_NS ||= {}).bound = true;
  const CONF = window.LZ_CONFIG?.ANALYTICS;
  if (!CONF) return; 
  const ENDPOINT = CONF.ENDPOINT, VISITOR_COOKIE = CONF.VISITOR_COOKIE, VISITOR_LSKEY = CONF.VISITOR_LSKEY, SESSION_TTL_MS = CONF.SESSION_TTL;
  const D = document, W = window, N = navigator, S = screen, now = () => Date.now();
  const text = el => (el?.getAttribute?.("aria-label") || el?.textContent || "").trim();
  let activeTime = 0, lastVisibleTs = now(), tPage = now();
  const updateActiveTime = () => { if (D.visibilityState === "visible") { lastVisibleTs = now(); } else { activeTime += now() - lastVisibleTs; } };
  D.addEventListener("visibilitychange", updateActiveTime);
  const GEO_CACHE_KEY = "apz_geo_v1", GEO_TTL_MS = 24 * 60 * 60 * 1000;
  let GEO = null;
  async function loadGeo(){ try{ const cached = localStorage.getItem(GEO_CACHE_KEY); if (cached){ const obj = JSON.parse(cached); if (now() - (obj.t||0) < GEO_TTL_MS){ GEO = obj.d; return GEO; } } const ctrl = new AbortController(), timer = setTimeout(()=> ctrl.abort(), 1500); const res = await fetch("https://ipapi.co/json/", { signal:ctrl.signal }); clearTimeout(timer); if (!res.ok) throw new Error("geo_fail"); const j = await res.json(); GEO = { ip: j.ip||"", country: j.country_name||j.country||"", region: j.region||"", city: j.city||"", postal: j.postal||"", lat: j.latitude??null, lon: j.longitude??null }; localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ t:now(), d:GEO })); return GEO; } catch(_){ return null; } }
  const uuid4 = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c=>{ const r = Math.random()*16|0, v = c==="x" ? r : ((r&3)|8); return v.toString(16); });
  const setCookie = (k,v,days)=>{ try{ const d = new Date(); d.setTime(d.getTime() + days*864e5); D.cookie = `${k}=${encodeURIComponent(v)}; path=/; SameSite=Lax; expires=${d.toUTCString()}`; }catch(_){} };
  const getCookie = k => { try{ const m = D.cookie.match(new RegExp("(?:^| )"+k.replace(/([.*+?^${}()|[\]\\])/g,"\\$&")+"=([^;]*)")); return m ? decodeURIComponent(m[1]) : null; }catch(_){return null;} };
  function ensureVisitorId(){ let vid = getCookie(VISITOR_COOKIE); if (vid){ localStorage.setItem(VISITOR_LSKEY, vid); return vid; } vid = localStorage.getItem(VISITOR_LSKEY); if (vid){ setCookie(VISITOR_COOKIE, vid, 365*3); return vid; } vid = uuid4(); setCookie(VISITOR_COOKIE, vid, 365*3); localStorage.setItem(VISITOR_LSKEY, vid); return vid; }
  let visitorId = ensureVisitorId();
  const S_ID="apz_sid", S_TS="apz_sid_ts";
  function touchSession(){ let sid = sessionStorage.getItem(S_ID); const t = now(), last = +sessionStorage.getItem(S_TS) || 0; if (!sid || (t-last) > SESSION_TTL_MS) sid = uuid4(); sessionStorage.setItem(S_ID, sid); sessionStorage.setItem(S_TS, t); return sid; }
  let sessionId = touchSession();
  const utm = (() => { const p = new URLSearchParams(location.search); return { utm_source: p.get("utm_source")||"", utm_medium: p.get("utm_medium")||"", utm_campaign: p.get("utm_campaign")||"" }; })();
  function sendEvent(event_name, event_params){ try { sessionId = touchSession(); const payload = { visitor_id: visitorId, session_id: sessionId, event_name, event_params: event_params || {}, page_url: location.href, page_title: D.title || "", referrer: D.referrer || "", ...utm, screen_w: S?.width??null, screen_h: S?.height??null, ua: N.userAgent||"" }; if (GEO){ payload.geo_ip=GEO.ip; payload.geo_country=GEO.country; payload.geo_region=GEO.region; payload.geo_city=GEO.city; payload.geo_postal=GEO.postal; payload.geo_lat=GEO.lat; payload.geo_lon=GEO.lon; } const body = JSON.stringify(payload); if (N.sendBeacon && N.sendBeacon(ENDPOINT, new Blob([body], {type:"text/plain;charset=UTF-8"}))) return; fetch(ENDPOINT, { method:"POST", mode:"no-cors", body }).catch(() => { const img = new Image(); img.src = `${ENDPOINT}?d=${encodeURIComponent(body)}&t=${now()}`; }); } catch(_){} }
  W.mzTrack ||= ((name,params)=> sendEvent(name,params));
  Promise.race([ loadGeo(), new Promise(r=>setTimeout(r,800)) ]).finally(() => { setTimeout(() => sendEvent("page_view", {}), 100); });
  let lastCard = null;
  const cardMeta = card => card ? { card_id: card.dataset.id||card.id||"", title: card.dataset.title||"", group: card.dataset.group||"", has_main: !!card.dataset.main } : {};
  D.addEventListener("click", e => {
    const t = e.target, card = t.closest?.(".lz-card"); 
    if (card){ lastCard = cardMeta(card); sendEvent("card_click", {...lastCard}); return; }
    const btn = t.closest?.(".lz-btn");
    if (btn){ const kind = btn.classList.contains("lz-share") ? "share" : btn.classList.contains("lz-pdf") ? "pdf" : btn.classList.contains("lz-dl") ? "download" : btn.classList.contains("lz-x") ? "close" : "btn"; sendEvent("modal_action", { action:kind, label:text(btn), ...(lastCard||{}) }); return; }
    const sns = t.closest?.(".lz-sns a, .lz-sns-btn");
    if (sns){ sendEvent("sns_click", { platform:sns.dataset.sns||"web", href:sns.href||"", ...(lastCard||{}) }); return; }
    const th = t.closest?.("#lz-gallery img[data-img-idx]");
    if (th){ sendEvent("gallery_thumb_click", { idx:(+th.dataset.imgIdx||0), ...(lastCard||{}) }); return; }
    const ext = t.closest?.(".lz-info a[href], .lz-related a[href]");
    if (ext){ sendEvent("external_link", { href:ext.href||"", label:text(ext), ...(lastCard||{}) }); return; }
  }, {capture:true, passive:true});
  (function(){
    const observeModal = () => {
      const mo = new MutationObserver(muts => {
        for(const m of muts) { for(const n of m.addedNodes) { if(n.nodeType === 1 && (n.matches?.(".lz-modal") || n.querySelector?.(".lz-modal"))) { const title = D.querySelector(".lz-modal .lz-mt")?.textContent?.trim() || "modal"; sendEvent("modal_open", { modal_name: title, ...(lastCard || {}) }); } } }
      });
      mo.observe(D.documentElement, {childList:true, subtree:true});
    };
    observeModal();
  })();
  let closedSent = false;
  function flushClose(reason){ if (closedSent) return; closedSent = true; const finalActiveTime = D.visibilityState === "visible" ? activeTime + (now() - lastVisibleTs) : activeTime; sendEvent("page_close", { total_engaged_ms: now() - tPage, active_engaged_ms: finalActiveTime, reason: String(reason || "") }); }
  W.addEventListener("pagehide", e => flushClose(e.persisted ? "bfcache" : "unload"), {capture:true});
  D.addEventListener("visibilitychange", () => { if (D.visibilityState === "hidden") setTimeout(() => flushClose("visibility_hidden"), 0); }, {capture:true});
})();