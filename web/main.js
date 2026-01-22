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
  HOST.addEventListener("click",e=>{ if(e.target===HOST) lzClose(); },{passive:true});
  document.addEventListener("keydown",e=>{ if(e.key==="Escape") lzClose(); },{passive:true});
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
  try{ history.replaceState(null, "", location.pathname + location.search); }catch(e){}
}
window.lzClose = lzClose;

function shareUrlFromCard(card){
  const base = location.origin + location.pathname;
  return `${base}#${card.dataset.id}`;
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
      data-id="${esc(id)}" data-title="${esc(title)}" data-lead="${esc(it.lead||"")}"
      data-body='${esc(it.body||"")}'
      data-main="${esc(it.mainImage||"")}"
      data-sub='${esc(JSON.stringify(subs))}'
      data-sns='${esc(JSON.stringify(sns))}'
      data-related='${esc(JSON.stringify(related))}'
      data-address="${esc(it.address||"")}" data-hours="${esc(it.hours||"")}"
      data-form="${esc(it.form||"")}" data-email="${esc(it.email||"")}" data-tel="${esc(it.tel||"")}"
      data-home="${esc(it.home||"")}" data-ec="${esc(it.ec||"")}"
      data-hours-combined="${esc(dataAttrs.hoursCombined)}"
      data-event-date="${esc(dataAttrs.eventDate)}"
      data-event-time="${esc(dataAttrs.eventTime)}"
      data-biz-days="${esc(dataAttrs.bizDays)}"
      data-biz-open="${esc(dataAttrs.bizOpen)}"
      data-biz-close="${esc(dataAttrs.bizClose)}"
      data-holiday="${esc(dataAttrs.holiday)}"
      data-biz-note="${esc(dataAttrs.bizNote)}"
      data-start-date="${esc(dataAttrs.startDate)}"
      data-end-date="${esc(dataAttrs.endDate)}"
      data-start-time="${esc(dataAttrs.startTime)}"
      data-end-time="${esc(dataAttrs.endTime)}"
      data-fee="${esc(dataAttrs.fee)}"
      data-bring="${esc(dataAttrs.bring)}"
      data-target="${esc(it.target||"")}"
      data-apply="${esc(it.apply||"")}"
      data-org="${esc(it.organizer||"")}"
      data-org-tel="${esc(it.organizerTel||"")}"
      data-venue-note="${esc(dataAttrs.venueNote)}"
      data-note="${esc(dataAttrs.note)}"
      data-dl="${esc(dataAttrs.dl)}"
      data-group="${esc(groupKey)}">
      <div class="lz-media ${hasMain ? "" : "is-empty"}" style="--ratio:${pad}">
    ${hasMain ? `<img loading="lazy" decoding="async" crossorigin="anonymous"
        referrerpolicy="no-referrer-when-downgrade"
        src="${esc(it.mainImage)}"
        alt="${esc(title)}"
        onerror="this.remove(); this.parentElement.classList.add('is-empty');">` : ""}
      </div>
      <div class="lz-body">
        <h3 class="lz-title-sm">${esc(title)}</h3>
        <div class="lz-lead">${esc(it.lead||"")}</div>
      </div>
    </article>`;
}

function buildInfoTableHTML(card){
  const rows = [];
  const addr = card.dataset.address;
  const form = card.dataset.form, email = card.dataset.email, tel = card.dataset.tel;
  if (addr) rows.push(`<tr><th>住所</th><td>${esc(addr)}</td></tr>`);
  if (card.dataset.bizDays) rows.push(`<tr><th>営業曜日</th><td>${esc(card.dataset.bizDays)}</td></tr>`);
  if (card.dataset.holiday) rows.push(`<tr><th>定休日</th><td>${esc(card.dataset.holiday)}</td></tr>`);
  const hoursCombined = card.dataset.hoursCombined;
  const bizOpen = card.dataset.bizOpen, bizClose = card.dataset.bizClose;
  if (hoursCombined) { rows.push(`<tr><th>営業時間</th><td>${esc(hoursCombined)}</td></tr>`); }
  else if (bizOpen && bizClose) { rows.push(`<tr><th>営業時間</th><td>${esc(bizOpen)}〜${esc(bizClose)}</td></tr>`); }
  else { if (bizOpen) rows.push(`<tr><th>営業開始時刻</th><td>${esc(bizOpen)}</td></tr>`); if (bizClose) rows.push(`<tr><th>営業終了時刻</th><td>${esc(bizClose)}</td></tr>`); }
  if (card.dataset.bizNote) rows.push(`<tr><th>営業に関する注意事項</th><td>${esc(card.dataset.bizNote)}</td></tr>`);
  const eventDate = card.dataset.eventDate, startDate = card.dataset.startDate, endDate = card.dataset.endDate;
  if (eventDate) { rows.push(`<tr><th>開催日</th><td>${esc(eventDate)}</td></tr>`); }
  else { if (startDate) rows.push(`<tr><th>開始日</th><td>${esc(startDate)}</td></tr>`); if (endDate) rows.push(`<tr><th>終了日</th><td>${esc(endDate)}</td></tr>`); }
  const eventTime = card.dataset.eventTime, startTime = card.dataset.startTime, endTime = card.dataset.endTime;
  if (eventTime) { rows.push(`<tr><th>開催時間</th><td>${esc(eventTime)}</td></tr>`); }
  else if (startTime && endTime) { rows.push(`<tr><th>開催時間</th><td>${esc(startTime)}〜${esc(endTime)}</td></tr>`); }
  else { if (startTime) rows.push(`<tr><th>開始時刻</th><td>${esc(startTime)}</td></tr>`); if (endTime) rows.push(`<tr><th>終了時刻</th><td>${esc(endTime)}</td></tr>`); }
  if (card.dataset.fee) rows.push(`<tr><th>参加費</th><td>${esc(card.dataset.fee)}</td></tr>`);
  if (card.dataset.bring) rows.push(`<tr><th>もちもの</th><td>${esc(card.dataset.bring)}</td></tr>`);
  if (card.dataset.target) rows.push(`<tr><th>対象</th><td>${esc(card.dataset.target)}</td></tr>`);
  if (card.dataset.apply) rows.push(`<tr><th>申し込み方法</th><td>${esc(card.dataset.apply)}</td></tr>`);
  if (card.dataset.org) rows.push(`<tr><th>主催者名</th><td>${esc(card.dataset.org)}</td></tr>`);
  if (card.dataset.orgTel) rows.push(`<tr><th>主催者連絡先</th><td>${esc(card.dataset.orgTel)}</td></tr>`);
  if (card.dataset.venueNote) rows.push(`<tr><th>会場に関する注意事項</th><td>${esc(card.dataset.venueNote)}</td></tr>`);
  if (card.dataset.note) rows.push(`<tr><th>備考</th><td>${esc(card.dataset.note)}</td></tr>`);
  const links = [];
  if (form) links.push(`<a href="${esc(form)}" target="_blank" rel="noopener">フォーム</a>`);
  if (email) links.push(`<a href="mailto:${esc(email)}">${esc(email)}</a>`);
  if (tel) links.push(`<a href="tel:${esc(tel)}">${esc(tel)}</a>`);
  if (links.length) rows.push(`<tr><th>問い合わせ</th><td>${links.join(' / ')}</td></tr>`);
  return rows.length ? `<table class="lz-info"><tbody>${rows.join("")}</tbody></table>` : "";
}

function buildSNSIconsHTML(card){
  let sns={}; try{ sns = JSON.parse(card.dataset.sns||"{}"); }catch{}
  const home = card.dataset.home || "", ec = card.dataset.ec || "";
  const btn = (url, key, label) => url ? `<a class="lz-sns-btn" data-sns="${key}" href="${esc(url)}" target="_blank" rel="noopener" aria-label="${label}">${ICON[key]}</a>` : "";
  const html = [ btn(home, "web", "HP"), btn(ec, "ec", "EC"), btn(sns.instagram, "ig", "IG"), btn(sns.facebook, "fb", "FB"), btn(sns.x, "x", "X"), btn(sns.line, "line","Line"), btn(sns.tiktok, "tt", "TT") ].filter(Boolean).join("");
  return html ? `<div class="lz-sns">${html}</div>` : "";
}

function showModalFromCard(card){
  if(!card) return;
  try{ history.replaceState(null, "", shareUrlFromCard(card)); }catch(e){}
  const t=card.dataset.title, lead=card.dataset.lead, body=card.dataset.body;
  const main=card.dataset.main;
  let subs=[]; try{ subs=JSON.parse(card.dataset.sub||"[]"); }catch{}
  const gallery=[main, ...subs].filter(Boolean);
  const imageBlock = gallery.length ? `<div class="lz-mm"><img id="lz-mainimg" crossorigin="anonymous" referrerpolicy="no-referrer-when-downgrade" src="${esc(gallery[0])}" alt="${esc(t)}"></div>` : '';
  const galleryBlock = (gallery.length>1) ? `<div class="lz-g" id="lz-gallery">${gallery.map((u,i)=>`<img crossorigin="anonymous" referrerpolicy="no-referrer-when-downgrade" src="${esc(u)}" data-img-idx="${i}" class="${i===0?'is-active':''}" alt="">`).join("")}</div>` : '';
  const shareBtn = `<button class="lz-btn lz-share" type="button" aria-label="共有"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg><span class="lz-label">共有</span></button>`;
  const dlUrl = card.dataset.dl || "";
  const dlBtn = dlUrl ? `<a class="lz-btn lz-dl" href="${esc(dlUrl)}" target="_blank" rel="noopener" aria-label="DL"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"></path><path d="M7 10l5 5 5-5"></path><path d="M5 20h14"></path></svg><span class="lz-label">DL</span></a>` : "";
  const pdfBtn = (window.innerWidth >= 769) ? `<button class="lz-btn lz-pdf" type="button" aria-label="印刷"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg><span class="lz-label">印刷</span></button>` : "";
  const closeBtn = `<button class="lz-btn lz-x" type="button" onclick="lzClose()" aria-label="閉じる"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg><span class="lz-label">閉じる</span></button>`;
  const infoTable = buildInfoTableHTML(card), snsIcons = buildSNSIconsHTML(card);
  let relatedBlock = "";
  try{ const rel = JSON.parse(card.dataset.related || "[]").filter(x => x && (x.title || x.url)); if (rel.length){ relatedBlock = `<div class="lz-related" style="padding:0 12px 12px;">${rel.map(a => { const url = a.url ? esc(a.url) : "#"; const lbl = a.title ? esc(a.title) : esc(a.url || "関連"); return `<div><a href="${url}" target="_blank" rel="noopener">${lbl}</a></div>`; }).join("")}</div>`; } }catch(_){}
  lzOpen(`<div class="lz-mh"><h3 class="lz-mt">${esc(t)}</h3><div class="lz-actions">${shareBtn}${dlBtn}${pdfBtn}${closeBtn}</div></div>${imageBlock}${lead ? `<div class="lz-lead-strong">${esc(lead)}</div>` : ""}${body ? `<div class="lz-txt">${esc(body)}</div>` : ""}${galleryBlock}${infoTable}${snsIcons}${relatedBlock}`);
  const mainImg = document.getElementById("lz-mainimg");
  if (gallery.length>1 && mainImg){
    const thumbs=[...document.querySelectorAll("#lz-gallery img")];
    const setActive = i => thumbs.forEach((el,idx)=>el.classList.toggle("is-active", idx===i));
    const swap = i => {
      const nextSrc = gallery[i]; if(!nextSrc || !mainImg || mainImg.src===nextSrc) return;
      mainImg.classList.add("lz-fadeout");
      mainImg.addEventListener("transitionend", function h(){ mainImg.removeEventListener("transitionend", h); mainImg.src = nextSrc; if(mainImg.complete){ requestAnimationFrame(()=> mainImg.classList.remove("lz-fadeout")); } else{ mainImg.addEventListener("load", ()=> mainImg.classList.remove("lz-fadeout"), {once:true}); } }, {once:true});
      setActive(i);
    };
    document.getElementById("lz-gallery")?.addEventListener("click", e=>{ const img=e.target.closest("img[data-img-idx]"); if(img) swap(parseInt(img.dataset.imgIdx||"0",10)||0); });
  }
  MODAL.querySelector(".lz-share")?.addEventListener("click", async ()=>{
    const url = shareUrlFromCard(card);
    const payload = `${RED_APPLE}${card.dataset.title}${GREEN_APPLE}\n${(card.dataset.lead||"") ? card.dataset.lead + "\n" : ""}ーーー\n詳しくはこちら\n${url}\n\n#いいづなりんご #飯綱町`;
    try{ if(navigator.share){ await navigator.share({ text: payload }); } else if(navigator.clipboard && window.isSecureContext){ await navigator.clipboard.writeText(payload); toast("共有テキストをコピーしました"); } else{ const ta=document.createElement("textarea"); ta.value=payload; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); toast("共有テキストをコピーしました"); } }catch(e){}
  });
  if(window.innerWidth >= 769){
    MODAL.querySelector(".lz-pdf")?.addEventListener("click", async ()=>{
      if(!confirm("PDFを新しいタブで開きます。よろしいですか？")) return;
      try{
        await ensurePdfLibs(); const url = shareUrlFromCard(card);
        const clone = MODAL.cloneNode(true); clone.querySelector(".lz-actions")?.remove(); clone.style.maxHeight="none"; clone.style.height="auto"; clone.style.width="800px";
        clone.querySelectorAll("img").forEach(img=>{ img.setAttribute("crossorigin","anonymous"); img.setAttribute("referrerpolicy","no-referrer-when-downgrade"); });
        document.body.appendChild(clone);
        const qrDiv = document.createElement("div"); new QRCode(qrDiv,{ text:url, width:64, height:64, correctLevel: QRCode.CorrectLevel.L });
        const qrCanvas = qrDiv.querySelector("canvas"), qrData = qrCanvas ? qrCanvas.toDataURL("image/png") : "";
        const canvas = await html2canvas(clone,{scale:2, backgroundColor:"#ffffff", useCORS:true, allowTaint:false}); document.body.removeChild(clone);
        const { jsPDF } = window.jspdf; const pdf = new jsPDF("p","mm","a4");
        const margin=12, pageW=pdf.internal.pageSize.getWidth(), pageH=pdf.internal.pageSize.getHeight(), innerW=pageW-margin*2, innerH=pageH-margin*2;
        const imgData = canvas.toDataURL("image/png"), imgWmm = innerW, imgHmm = canvas.height * imgWmm / canvas.width;
        const totalPages = Math.max(1, Math.ceil(imgHmm / innerH)); let heightLeft = imgHmm, position = margin, pageCount = 1;
        const yBaseDT = pageH - PDF_FOOTER.dtBottomMm; pdf.setFontSize(PDF_FOOTER.dtPt);
        const jpPx = Math.round(pt2px(PDF_FOOTER.jpPt)), jpImg = renderFooterImagePx("本PDF データは飯綱町産りんごPR事業の一環で作成されました。", jpPx, "#000"), imgH = pt2mm(PDF_FOOTER.jpPt), imgW = imgH/jpImg.ar, xJP = margin, yJP = yBaseDT - imgH + PDF_FOOTER.jpBaselineGapMm;
        while(heightLeft > 0){
          pdf.addImage(imgData,"PNG", margin, position, imgWmm, imgHmm);
          if(qrData){ const q = PDF_FOOTER.qrSizeMm; pdf.addImage(qrData,"PNG", pageW-margin-q, pageH-margin-q, q, q); }
          pdf.addImage(jpImg.data, "PNG", xJP, yJP, imgW, imgH);
          const now = new Date(), ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
          pdf.text(`${ts} / ${pageCount}/${totalPages}`, pageW - margin, yBaseDT, {align:"right"});
          heightLeft -= innerH; if(heightLeft > 0){ pdf.addPage(); position = margin - (imgHmm - heightLeft); pageCount++; }
        }
        window.open(pdf.output("bloburl"), "_blank");
      }catch(e){ console.error(e); alert("PDF生成失敗"); }
    });
  }
}

function showModal(i){ if(i<0) i=CARDS.length-1; if(i>=CARDS.length) i=0; IDX=i; showModalFromCard(CARDS[i]); }

/* --- Core Rendering --- */
async function renderSection(root){
  const { l1="", l2="", heading="", cardWidth="33.33%", cardWidthSm="50%", imageRatio="16:9", autoplay="false", autoplayInterval="", autoplayStep="" } = root.dataset;
  if(!LZ_ENDPOINT || !l2){ root.innerHTML=`<div style="padding:12px;color:#b91c1c;">設定エラー</div>`; return; }
  const mql=window.matchMedia("(max-width:768px)"); root.style.setProperty("--cw", mql.matches ? cardWidthSm : cardWidth); root.style.setProperty("--ratio", ratio(imageRatio));
  root.innerHTML = `<div class="lz-head"><div class="lz-titlewrap"><h2 class="lz-title">${esc(heading || l2)}</h2></div></div><div class="lz-groupwrap"><div class="lz-loading" role="status" aria-live="polite"><div class="lz-loading-inner"><svg class="lz-logo" viewBox="-60 -60 720 720" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style="overflow:visible"><path class="lz-logo-path" pathLength="1000" d="M287.04,32.3c.29.17,1.01.63,1.46,1.55.57,1.19.29,2.29.2,2.57-7.08,18.09-14.18,36.17-21.26,54.26,5.96-.91,14.77-2.45,25.28-5.06,17.98-4.45,22.46-7.44,33.44-9.85,18.59-4.08,33.88-1.67,44.51,0,21.1,3.32,37.42,10.74,47.91,16.6-4.08,8.59-11.1,20.05-23.06,29.99-18.47,15.35-38.46,18.54-52.07,20.7-7.55,1.21-21.61,3.32-39.12.24-13.71-2.41-11-4.76-30.72-9.36-6.73-1.56-12.82-2.64-17.98-7.87-3.73-3.77-4.92-7.63-6.74-7.3-2.44.43-1.84,7.58-4.5,16.85-.98,3.46-5.56,19.45-14.05,21.35-5.5,1.23-9.85-4.07-17.02-9.79-17.52-13.96-36.26-17.94-45.91-19.99-7.62-1.62-25.33-5.16-45.19,1.36-6.6,2.17-19.57,7.82-35.2,23.74-48.04,48.93-49.39,127.17-49.69,143.97-.08,5-.47,48.18,16.56,90.06,6.63,16.3,14.21,28.27,24.85,38.3,4.2,3.97,12.19,11.37,24.85,16.56,13.72,5.63,26.8,6.15,31.06,6.21,8.06.12,9.06-1.03,14.49,0,10.22,1.95,13.47,7.33,22.77,12.42,10.16,5.56,19.45,6.3,30.02,7.25,8.15.73,18.56,1.67,31.15-1.99,9.83-2.85,16.44-7.18,25.24-12.93,2.47-1.61,9.94-6.61,20.55-16.18,12.76-11.51,21.35-21.79,25.53-26.87,26.39-32.12,39.71-48.12,50.73-71.43,12.87-27.23,17.2-49.56,18.63-57.97,3.23-18.95,5.82-35.27,0-54.87-2.24-7.54-6.98-23.94-21.74-37.27-5.26-4.76-12.9-11.66-24.85-13.46-17.04-2.58-30.24,7.19-33.13,9.32-9.71,7.17-13.91,16.56-21.93,35.04-1.81,4.19-8.26,19.38-14.31,43.63-2.82,11.32-6.43,25.97-8.28,45.55-1.47,15.61-3.27,34.6,1.04,59.01,4.92,27.9,15.01,47.01,17.6,51.76,5.58,10.26,12.02,21.83,24.85,33.13,6.45,5.69,17.55,15.24,35.2,19.77,19.17,4.92,34.7.98,38.3,0,14.29-3.9,24.02-11.27,28.99-15.63"/></svg><div class="lz-loading-label">記事読み込み中…</div></div></div></div>`;
  const wrap = root.querySelector(".lz-groupwrap"); root.classList.add("lz-ready");
  const _svg = root.querySelector('.lz-loading .lz-logo'); if(_svg) lzCenterLogoSVG(_svg);
  let json; try{ json = await LZ_NET.json(`${LZ_ENDPOINT}?l1=${encodeURIComponent(l1)}&l2=${encodeURIComponent(l2)}`); }catch{ wrap.innerHTML = `<div style="padding:12px;color:#b91c1c;">読み込み失敗</div>`; return; }
  if(!json || !json.ok){ wrap.innerHTML = `<div style="padding:12px;color:#b91c1c;">データなし</div>`; return; }
  const items = json.items || [], groups = new Map();
  for(const it of items){ const key = (it.l3 || it.L3 || it.L3_LABEL || "").trim(); if(!groups.has(key)) groups.set(key, []); groups.get(key).push(it); }
  const pad = ratio(imageRatio); let html = "";
  const none = groups.get("") || []; if(none.length){ html += `<div class="lz-track" data-group="">${none.map(it => cardHTML(it, pad, "")).join("")}</div>`; groups.delete(""); }
  for(const [key, arr] of groups){ const safe = esc(key); html += `<div class="lz-l3head"><span class="lz-l3bar"></span><h3 class="lz-l3title">${safe}</h3></div><div class="lz-track" data-group="${safe}">${arr.map(it => cardHTML(it, pad, key)).join("")}</div>`; }
  wrap.innerHTML = html;
  if (String(autoplay).toLowerCase() === "true") {
    const iv = parseInt(autoplayInterval, 10), stp = parseInt(autoplayStep, 10);
    const opt = { interval: Number.isFinite(iv) && iv > 0 ? iv : 4000, stepCards: Number.isFinite(stp) && stp > 0 ? stp : 1 };
    wrap.querySelectorAll(".lz-track").forEach(track => setupAutoPlay(track, opt));
  }
  wrap.addEventListener("click", e=>{ const card = e.target.closest(".lz-card"); if(!card) return; const track = card.closest(".lz-track"); CARDS = [...track.querySelectorAll(".lz-card")]; IDX = CARDS.indexOf(card); showModal(IDX); }, {passive:true});
  wrap.querySelectorAll('.lz-media > img').forEach(img=>{ img.addEventListener('error', ()=>{ const m = img.parentElement; img.remove(); m?.classList.add('is-empty'); }, { once:true }); });
}

function buildNav(options={}){
  const sections = Array.from(document.querySelectorAll(".lz-section[data-l2]")); if(!sections.length) return;
  sections.forEach((s,i)=>{ if(!s.id){ const base = (s.dataset.l2||`l2-${i+1}`); let id=base,c=1; while(document.getElementById(id)) id=`${base}-${++c}`; s.id=id; }});
  const navs=document.querySelectorAll(".lz-nav"); if(!navs.length) return;
  const html=`<div class="lz-nav-inner">${sections.map(s=>`<a href="#${s.id}" data-target="${s.id}">${esc(s.dataset.l2)}</a>`).join("")}</div>`;
  navs.forEach(n=>n.innerHTML=html);
  const links=[...document.querySelectorAll(".lz-nav a")], byId=Object.fromEntries(links.map(a=>[a.dataset.target,a])), offset=parseInt(navs[0].dataset.offset||options.offset||0,10)||0;
  document.addEventListener("click",e=>{
    const a=e.target.closest(".lz-nav a[href^='#']"); if(!a) return; e.preventDefault();
    const id=a.getAttribute("href").slice(1), el=document.getElementById(id); if(!el) return;
    const y=el.getBoundingClientRect().top + window.pageYOffset - offset; window.scrollTo({top:y,behavior:"smooth"}); history.replaceState(null,"",`#${id}`);
  },{passive:false});
  if("IntersectionObserver" in window){
    const io=new IntersectionObserver(es=>{ es.forEach(en=>{ if(en.isIntersecting){ links.forEach(x=>x.classList.remove("is-active")); const a=byId[en.target.id]; if(a) a.classList.add("is-active"); } }); },{rootMargin:"-40% 0px -55% 0px"});
    sections.forEach(s=>io.observe(s));
  }
}

function openFromHashWithRetry(){
  const raw=(location.hash||"").slice(1); if(!raw) return; const id=decodeURIComponent(raw);
  const openIfReady=()=>{ const card=document.getElementById(id); if(card){ const track = card.closest(".lz-track"); CARDS = [...track.querySelectorAll(".lz-card")]; IDX = CARDS.indexOf(card); showModal(IDX); return true; } return false; };
  if(openIfReady()) return; const mo=new MutationObserver(()=>{ if(openIfReady()){ mo.disconnect(); clearTimeout(timer); }});
  mo.observe(document.documentElement,{childList:true,subtree:true}); const timer=setTimeout(()=>mo.disconnect(),8000);
}

function boot(){
  const sections=document.querySelectorAll(".lz-section[data-l2]"); if(!sections.length) return;
  buildNav({offset:(document.querySelector(".pera1-header")?.offsetHeight||0)});
  const hasHash = !!(location.hash||"").slice(1);
  if(hasHash){ sections.forEach(s=>renderSection(s)); openFromHashWithRetry(); } else {
    const mql=window.matchMedia("(max-width:768px)");
    const applyWidth=()=>sections.forEach(s=>{ const {cardWidth="33.33%", cardWidthSm="80%"} = s.dataset; s.style.setProperty("--cw", mql.matches ? cardWidthSm : cardWidth); });
    applyWidth(); mql.addEventListener?.("change", applyWidth);
    const io=("IntersectionObserver" in window) ? new IntersectionObserver(entries=>{ entries.forEach(e=>{ if(e.isIntersecting){ io.unobserve(e.target); renderSection(e.target); } }); },{rootMargin:"200px 0px"}) : null;
    sections.forEach(s=>{ if(io) io.observe(s); else renderSection(s); });
  }
  window.addEventListener("hashchange", openFromHashWithRetry, {passive:true});
}
if(document.readyState==="loading") { document.addEventListener("DOMContentLoaded", boot); } else { boot(); }

/* ====== Eager Load Patch ====== */
(function forceEagerLoadForLZ(){
  var _origRenderSection = window.renderSection; if (typeof _origRenderSection !== 'function') return;
  function guardedRenderSection(el){ if (!el || el.classList?.contains('lz-ready') || el.dataset.lzDone === '1') return; el.dataset.lzDone = '1'; return _origRenderSection(el); }
  window.renderSection = guardedRenderSection;
  function eager(){ var sections = document.querySelectorAll('.lz-section[data-l2]'); sections.forEach(function(s){ guardedRenderSection(s); }); if (typeof window.openFromHashWithRetry === 'function'){ window.openFromHashWithRetry(); } }
  if (document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', eager); } else { eager(); }
})();

/* ====== Appletown Analytics (Optimized) ====== */
(function () {
  "use strict";
  if (window.__APZ_NS?.bound) return; (window.__APZ_NS ||= {}).bound = true;

  // 設定（config.jsに移行することも可能です）
  const ENDPOINT = "https://script.google.com/macros/s/AKfycbw-yjVPRQi10WWTBja0jrhgodXYPSWPaStjDQjEC32i9OHa-AiYZmP7GJZgLrbVDjdOmg/exec";
  const VISITOR_COOKIE = "apz_vid_v1", VISITOR_LSKEY = "apz_vid_ls_v1", SESSION_TTL_MS = 30 * 60 * 1000;
  
  const D = document, W = window, N = navigator, S = screen, now = () => Date.now();
  const text = el => (el?.getAttribute?.("aria-label") || el?.textContent || "").trim();

  // --- 滞在時間計測の精密化 ---
  let activeTime = 0, lastVisibleTs = now(), tPage = now();
  const updateActiveTime = () => {
    if (D.visibilityState === "visible") {
      lastVisibleTs = now();
    } else {
      activeTime += now() - lastVisibleTs;
    }
  };
  D.addEventListener("visibilitychange", updateActiveTime);

  // --- 地理情報取得 (Geo) ---
  const GEO_CACHE_KEY = "apz_geo_v1", GEO_TTL_MS = 24 * 60 * 60 * 1000;
  let GEO = null;
  async function loadGeo(){
    try{ 
      const cached = localStorage.getItem(GEO_CACHE_KEY); 
      if (cached){ 
        const obj = JSON.parse(cached); 
        if (now() - (obj.t||0) < GEO_TTL_MS){ GEO = obj.d; return GEO; } 
      }
      const ctrl = new AbortController(), timer = setTimeout(()=> ctrl.abort(), 1500);
      const res = await fetch("https://ipapi.co/json/", { signal:ctrl.signal });
      clearTimeout(timer); 
      if (!res.ok) throw new Error("geo_fail"); 
      const j = await res.json();
      GEO = { ip: j.ip||"", country: j.country_name||j.country||"", region: j.region||"", city: j.city||"", postal: j.postal||"", lat: j.latitude??null, lon: j.longitude??null };
      localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ t:now(), d:GEO })); 
      return GEO;
    } catch(_){ return null; }
  }

  // --- ID管理 (Visitor / Session) ---
  const uuid4 = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c=>{ const r = Math.random()*16|0, v = c==="x" ? r : ((r&3)|8); return v.toString(16); });
  const setCookie = (k,v,days)=>{ try{ const d = new Date(); d.setTime(d.getTime() + days*864e5); D.cookie = `${k}=${encodeURIComponent(v)}; path=/; SameSite=Lax; expires=${d.toUTCString()}`; }catch(_){} };
  const getCookie = k => { try{ const m = D.cookie.match(new RegExp("(?:^|; )"+k.replace(/([.*+?^${}()|[\]\\])/g,"\\$&")+"=([^;]*)")); return m ? decodeURIComponent(m[1]) : null; }catch(_){return null;} };
  
  function ensureVisitorId(){ 
    let vid = getCookie(VISITOR_COOKIE); 
    if (vid){ localStorage.setItem(VISITOR_LSKEY, vid); return vid; } 
    vid = localStorage.getItem(VISITOR_LSKEY); 
    if (vid){ setCookie(VISITOR_COOKIE, vid, 365*3); return vid; } 
    vid = uuid4(); 
    setCookie(VISITOR_COOKIE, vid, 365*3); localStorage.setItem(VISITOR_LSKEY, vid); 
    return vid; 
  }
  let visitorId = ensureVisitorId();

  const S_ID="apz_sid", S_TS="apz_sid_ts";
  function touchSession(){ 
    let sid = sessionStorage.getItem(S_ID); 
    const t = now(), last = +sessionStorage.getItem(S_TS) || 0; 
    if (!sid || (t-last) > SESSION_TTL_MS) sid = uuid4(); 
    sessionStorage.setItem(S_ID, sid); 
    sessionStorage.setItem(S_TS, t); 
    return sid; 
  }
  let sessionId = touchSession();

  const utm = (() => { const p = new URLSearchParams(location.search); return { utm_source: p.get("utm_source")||"", utm_medium: p.get("utm_medium")||"", utm_campaign: p.get("utm_campaign")||"" }; })();

  // --- イベント送信コア ---
  function sendEvent(event_name, event_params){
    try {
      sessionId = touchSession();
      const payload = { 
        visitor_id: visitorId, session_id: sessionId, event_name, 
        event_params: event_params || {}, page_url: location.href, 
        page_title: D.title || "", referrer: D.referrer || "", 
        ...utm, screen_w: S?.width??null, screen_h: S?.height??null, ua: N.userAgent||"" 
      };
      if (GEO){ 
        payload.geo_ip=GEO.ip; payload.geo_country=GEO.country; payload.geo_region=GEO.region; 
        payload.geo_city=GEO.city; payload.geo_postal=GEO.postal; payload.geo_lat=GEO.lat; payload.geo_lon=GEO.lon; 
      }
      
      const body = JSON.stringify(payload);
      
      // 1. sendBeacon (離脱時など)
      if (N.sendBeacon && N.sendBeacon(ENDPOINT, new Blob([body], {type:"text/plain;charset=UTF-8"}))) return;
      
      // 2. Fetch (通常時)
      fetch(ENDPOINT, { method:"POST", mode:"no-cors", body }).catch(() => {
        // 3. Image Pixel (最終手段)
        const img = new Image();
        img.src = `${ENDPOINT}?d=${encodeURIComponent(body)}&t=${now()}`;
      });
    } catch(_){}
  }

  W.mzTrack ||= ((name,params)=> sendEvent(name,params));
  
  // 初回計測
  Promise.race([ loadGeo(), new Promise(r=>setTimeout(r,800)) ]).finally(() => {
    setTimeout(() => sendEvent("page_view", {}), 100);
  });

  // --- 自動トラッキング設定 ---
  let lastCard = null;
  const cardMeta = card => card ? { card_id: card.dataset.id||card.id||"", title: card.dataset.title||"", group: card.dataset.group||"", has_main: !!card.dataset.main } : {};

  D.addEventListener("click", e => {
    const t = e.target;
    // カードクリック
    const card = t.closest?.(".lz-card"); 
    if (card){ lastCard = cardMeta(card); sendEvent("card_click", {...lastCard}); return; }
    
    // ボタンアクション
    const btn = t.closest?.(".lz-btn");
    if (btn){
      const kind = btn.classList.contains("lz-share") ? "share" : btn.classList.contains("lz-pdf") ? "pdf" : btn.classList.contains("lz-dl") ? "download" : btn.classList.contains("lz-x") ? "close" : "btn";
      sendEvent("modal_action", { action:kind, label:text(btn), ...(lastCard||{}) });
      return;
    }
    
    // SNS / 外部リンク / ギャラリー
    const sns = t.closest?.(".lz-sns a, .lz-sns-btn");
    if (sns){ sendEvent("sns_click", { platform:sns.dataset.sns||"web", href:sns.href||"", ...(lastCard||{}) }); return; }
    
    const th = t.closest?.("#lz-gallery img[data-img-idx]");
    if (th){ sendEvent("gallery_thumb_click", { idx:(+th.dataset.imgIdx||0), ...(lastCard||{}) }); return; }
    
    const ext = t.closest?.(".lz-info a[href], .lz-related a[href]");
    if (ext){ sendEvent("external_link", { href:ext.href||"", label:text(ext), ...(lastCard||{}) }); return; }
  }, {capture:true, passive:true});

  // モーダル監視 (MutationObserver)
  (function(){
    const observeModal = () => {
      const mo = new MutationObserver(muts => {
        for(const m of muts) {
          for(const n of m.addedNodes) {
            if(n.nodeType === 1 && (n.matches?.(".lz-modal") || n.querySelector?.(".lz-modal"))) {
              const title = D.querySelector(".lz-modal .lz-mt")?.textContent?.trim() || "modal";
              sendEvent("modal_open", { modal_name: title, ...(lastCard || {}) });
            }
          }
        }
      });
      mo.observe(D.documentElement, {childList:true, subtree:true});

      const mo2 = new MutationObserver(() => {
        if(!D.querySelector(".lz-backdrop.open") && !D.querySelector(".lz-modal.is-open")){
          // 以前のセッションでモーダルが開いていたかチェックする等のロジックは必要に応じて
        }
      });
      mo2.observe(D.documentElement, {attributes:true, subtree:true, attributeFilter:["class"]});
    };
    observeModal();
  })();

  // --- 離脱計測の堅牢化 ---
  let closedSent = false;
  function flushClose(reason){
    if (closedSent) return;
    closedSent = true; // 即座にフラグを立てる (重要)
    
    // 最終的なアクティブ時間を算出
    const finalActiveTime = D.visibilityState === "visible" 
      ? activeTime + (now() - lastVisibleTs) 
      : activeTime;

    sendEvent("page_close", { 
      total_engaged_ms: now() - tPage, 
      active_engaged_ms: finalActiveTime,
      reason: String(reason || "") 
    });
  }

  W.addEventListener("pagehide", e => flushClose(e.persisted ? "bfcache" : "unload"), {capture:true});
  D.addEventListener("visibilitychange", () => {
    if (D.visibilityState === "hidden") {
      // モバイルブラウザ向けに、非表示になった瞬間に一度予備送信
      setTimeout(() => flushClose("visibility_hidden"), 0);
    }
  }, {capture:true});
})();