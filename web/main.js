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
if (!window.CSS || !CSS.escape) { window.CSS = window.CSS || {}; CSS.escape = s => String(s).replace(/[^a-zA-Z0-9_\-]/g,"\\$& "); }
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
  const maxLeft = () => track.scrollWidth - track.clientWidth;
  function tick(){
    const step = Math.max(1, stepCards) * cardW();
    let next = track.scrollLeft + step;
    if (next >= maxLeft() - 2) next = 0;
    track.scrollTo({ left: next, behavior: "smooth" });
  }
  function start(){ if (!timer) timer = setInterval(tick, interval); }
  function stop(){ if (timer) { clearInterval(timer); timer = null; } }
  const io = new IntersectionObserver(es=>{ es.forEach(e=> e.isIntersecting ? start() : stop()); }, { threshold: 0.3 });
  io.observe(track);
  track.addEventListener("pointerenter", stop, { passive:true });
  track.addEventListener("pointerleave", start, { passive:true });
  track.addEventListener("touchstart",  stop, { passive:true });
  track.addEventListener("wheel",        stop, { passive:true });
}

/* --- アイコン定義 --- */
const ICON = {
  web:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
  ec:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20 8H6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="19" r="1.6" fill="currentColor"/><circle cx="17" cy="19" r="1.6" fill="currentColor"/></svg>`,
  ig:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7z"/><path fill="currentColor" d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>`,
  fb:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13 22v-8h3l1-4h-4V7c0-1.1.9-2 2-2h2V1h-3a5 5 0 0 0-5 5v3H6v4h3v8h4z"/></svg>`,
  x:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 3l8.5 9.7L3.8 21H7l5.2-6.6L17.6 21H21l-9-10.3L20.2 3H17L12 9.2 7.6 3H3z"/></svg>`,
  line:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M6.2 3.5H17.8c2.6 0 4.7 2 4.7 4.6v6.2c0 2.6-2.1 4.6-4.7 4.6H12c-.3 0 -.6.1 -.8.3l-2.9 2.4c-.3.2 -.7 0 -.7 -.4l.2 -2.5c0 -.3 -.2 -.6 -.5 -.7C5.3 17.7 3.5 15.7 3.5 14.3V8.1c0 -2.6 2.1 -4.6 4.7 -4.6Z"/></svg>`,
  tt:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2h3.2c.2 1.7 1.5 3 3.3 3.3V9c-1.9 -.1 -3.4 -.7 -4.5 -1.8v6.8c0 3 -2.4 5.4 -5.4 5.4S3.2 17 3.2 14s2.4 -5.4 5.4 -5.4c.6 0 1.2 .1 1.7 .3V12c-.3 -.1 -.6 -.2 -1 -.2-1.3 0-2.4 1.1-2.4 2.4S7.9 16.6 9.2 16.6c1.3 0 2.4 -1.1 2.4 -2.4V2z"/></svg>`
};

/* --- UI管理 --- */
let TOAST=null;
function toast(msg="コピーしました"){
  if(!TOAST){ TOAST=document.createElement("div"); TOAST.className="lz-toast"; document.body.appendChild(TOAST); }
  TOAST.textContent=msg; TOAST.classList.add("show"); setTimeout(()=>TOAST.classList.remove("show"), 1400);
}

let HOST=null, SHELL=null, MODAL=null;
let CARDS=[], IDX=0;

function ensureModal(){
  if(HOST) return;
  HOST=document.createElement("div"); HOST.className="lz-backdrop";
  HOST.innerHTML=`<div class="lz-shell"><div class="lz-modal"></div></div>`;
  document.body.appendChild(HOST);
  SHELL = HOST.firstElementChild; MODAL = SHELL.firstElementChild;
  HOST.addEventListener("click",e=>{
    if(e.target===HOST) lzClose();
  },{passive:true});
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape") lzClose();
  },{passive:true});
}

function lzOpen(html){
  ensureModal();
  MODAL.innerHTML = html;
  SHELL.querySelector(".lz-prev")?.remove();
  SHELL.querySelector(".lz-next")?.remove();
  const needArrows = CARDS.length > 1;
  if (needArrows){
    const prev = document.createElement("button");
    prev.className = "lz-arrow lz-prev";
    prev.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
    const next = document.createElement("button");
    next.className = "lz-arrow lz-next";
    next.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
    prev.addEventListener("click", ()=> showModal(IDX-1));
    next.addEventListener("click", ()=> showModal(IDX+1));
    SHELL.appendChild(prev); SHELL.appendChild(next);
  }
  HOST.classList.add("open");
}

function lzClose(){
  if(!HOST) return;
  HOST.classList.remove("open");
  try{ 
    const url = new URL(location.href);
    url.searchParams.delete('id');
    history.replaceState(null, "", url.pathname + url.search); 
  }catch(e){}
}
window.lzClose = lzClose;

function shareUrlFromCard(card){
  const url = new URL(location.origin + location.pathname);
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

/* --- HTML Building --- */
function cardHTML(it, pad, groupKey){
  const title = (it.title || "(無題)");
  const id    = title;
  const subs  = (it.subImages||[]).slice(0,5);
  const sns   = it.sns || {};
  const related = it.relatedArticles || [];
  const dataAttrs = {
    hoursCombined: get(it, ["hoursCombined"]),
    eventDate:     get(it, ["eventDate"]),
    eventTime:     get(it, ["eventTime"]),
    bizDays:   get(it, ["bizDays","営業曜日"]),
    bizOpen:   get(it, ["bizOpen","営業開始時刻"]),
    bizClose:  get(it, ["bizClose","営業終了時刻"]),
    holiday:   get(it, ["holiday","定休日"]),
    bizNote:   get(it, ["bizNote","営業に関する注意事項"]),
    startDate: get(it, ["startDate","開始日"]),
    endDate:   get(it, ["endDate","終了日"]),
    startTime: get(it, ["startTime","開始時刻"]),
    endTime:   get(it, ["endTime","終了時刻"]),
    fee:       get(it, ["fee","参加費"]),
    bring:     get(it, ["bring","もちもの"]),
    venueNote: get(it, ["venueNote","会場に関する注意事項"]),
    note:      get(it, ["note","備考"]),
    dl:        get(it, ["downloadUrl","ダウンロードURL"])
  };
  const hasMain = !!(it.mainImage);
  return `
    <article class="lz-card" id="${esc(id)}"
      data-id="${esc(id)}" data-title="${esc(title)}" data-lead="${esc(it.lead||