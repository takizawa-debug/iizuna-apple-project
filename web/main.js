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
let originalTitle = document.title; // 【SEO】元のタイトル

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
  document.title = originalTitle; // 【SEO】
  try{ 
    const url = new URL(window.location.href);
    url.searchParams.delete('id');
    window.history.replaceState(null, "", url.pathname + url.search); 
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
    ${hasMain ? `<img loading="lazy" decoding="async"
        crossorigin="anonymous"
        referrerpolicy="no-referrer-when-downgrade"
        src="${esc(it.mainImage)}"
        alt="${esc(title)}の画像"
        onerror="this.closest('.lz-media')?.classList.add('is-empty');">` : ""}
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
  const t = card.dataset.title;
  document.title = `${t} | ${originalTitle}`; // 【SEO】タイトル更新

  try{ history.replaceState(null, "", shareUrlFromCard(card)); }catch(e){}
  const lead=card.dataset.lead, body=card.dataset.body, main=card.dataset.main;
  let subs=[]; try{ subs=JSON.parse(card.dataset.sub||"[]"); }catch{}
  const gallery=[main, ...subs].filter(Boolean);

  // 【SEO】alt属性 & crossorigin 対策
  const imageBlock = gallery.length ? `<div class="lz-mm"><img id="lz-mainimg" crossorigin="anonymous" referrerpolicy="no-referrer-when-downgrade" src="${esc(gallery[0])}" alt="${esc(t)}のメイン画像"></div>` : '';
  const galleryBlock = (gallery.length>1) ? `<div class="lz-g" id="lz-gallery">${gallery.map((u,i)=>`<img crossorigin="anonymous" referrerpolicy="no-referrer-when-downgrade" src="${esc(u)}" data-img-idx="${i}" class="${i===0?'is-active':''}" alt="${esc(t)}の画像 ${i+1}">`).join("")}</div>` : '';
  const shareBtn = `<button class="lz-btn lz-share" type="button" aria-label="共有"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg><span class="lz-label">共有</span></button>`;
  const dlUrl = card.dataset.dl || "";
  const dlBtn = dlUrl ? `<a class="lz-btn lz-dl" href="${esc(dlUrl)}" target="_blank" rel="noopener" aria-label="DL"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"></path><path d="M7 10l5 5 5-5"></path><path d="M5 20h14"></path></svg><span class="lz-label">DL</span></a>` : "";
  const pdfBtn = (window.innerWidth >= 769) ? `<button class="lz-btn lz-pdf" type="button" aria-label="印刷"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg><span class="lz-label">印刷</span></button>` : "";
  const closeBtn = `<button class="lz-btn lz-x" type="button" onclick="lzClose()" aria-label="閉じる"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg><span class="lz-label">閉じる</span></button>`;
  const infoTable = buildInfoTableHTML(card), snsIcons = buildSNSIconsHTML(card);
  let relatedBlock = "";
  try{ const rel = JSON.parse(card.dataset.related || "[]").filter(x => x && (x.title || x.url)); if (rel.length){ relatedBlock = `<div class="lz-related" style="padding:0 12px 12px;">${rel.map(a => { const url = a.url ? esc(a.url) : "#"; const lbl = a.title ? esc(a.title) : esc(a.url || "関連"); return `<div><a href="${url}" target="_blank" rel="noopener">${lbl}</a></div>`; }).join("")}</div>`; } }catch(_){}
  
  // 【SEO】h3 -> h2
  lzOpen(`<div class="lz-mh"><h2 class="lz-mt">${esc(t)}</h2><div class="lz-actions">${shareBtn}${dlBtn}${pdfBtn}${closeBtn}</div></div>${imageBlock}${lead ? `<div class="lz-lead-strong">${esc(lead)}</div>` : ""}${body ? `<div class="lz-txt">${esc(body)}</div>` : ""}${galleryBlock}${infoTable}${snsIcons}${relatedBlock}`);
  
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

  /* ====== PDF生成（画像ロード問題 最終修正版） ====== */
  if(window.innerWidth >= 769){
    MODAL.querySelector(".lz-pdf")?.addEventListener("click", async ()=>{
      if(!confirm("PDFを新しいタブで開きます。よろしいですか？")) return;
      try{
        await ensurePdfLibs();
        const url = shareUrlFromCard(card);

        const clone = MODAL.cloneNode(true);
        clone.querySelector(".lz-actions")?.remove();
        clone.style.maxHeight="none"; clone.style.height="auto"; clone.style.width="800px";
        
        // 外部画像に crossorigin を付けて、さらにキャッシュ無視用のクエリを足す（重要）
        const imgs = Array.from(clone.querySelectorAll("img"));
        imgs.forEach(img => {
          const baseSrc = img.src.split('?')[0];
          img.crossOrigin = "anonymous";
          img.src = baseSrc + "?pdf_render=" + Date.now();
        });

        document.body.appendChild(clone);

        // クローン内のすべての画像が読み終わるまで確実に待つ
        await Promise.all(imgs.map(img => {
          return new Promise(res => {
            if (img.complete) res();
            img.onload = res;
            img.onerror = res;
          });
        }));

        const canvas = await html2canvas(clone, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          allowTaint: false,
          logging: false
        });
        document.body.removeChild(clone);

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("p", "mm", "a4");
        const margin = 12, pageW = pdf.internal.pageSize.getWidth(), pageH = pdf.internal.pageSize.getHeight();
        const innerW = pageW - margin * 2, innerH = pageH - margin * 2;
        const imgData = canvas.toDataURL("image/png"), imgWmm = innerW, imgHmm = canvas.height * imgWmm / canvas.width;
        const totalPages = Math.max(1, Math.ceil(imgHmm / innerH)); 
        let heightLeft = imgHmm, position = margin, pageCount = 1;

        const yBaseDT = pageH - PDF_FOOTER.dtBottomMm;
        pdf.setFontSize(PDF_FOOTER.dtPt);
        const jpPx = Math.round(pt2px(PDF_FOOTER.jpPt)), jpImg = renderFooterImagePx("本PDF データは飯綱町産りんごPR事業の一環で作成されました。", jpPx, "#000");
        const imgH_mm = pt2mm(PDF_FOOTER.jpPt), imgW_mm = imgH_mm / jpImg.ar;

        while(heightLeft > 0){
          pdf.addImage(imgData, "PNG", margin, position, imgWmm, imgHmm);
          pdf.addImage(jpImg.data, "PNG", margin, yBaseDT - imgH_mm + PDF_FOOTER.jpBaselineGapMm, imgW_mm, imgH_mm);
          const now = new Date(), ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
          pdf.text(`${ts} / ${pageCount}/${totalPages}`, pageW - margin, yBaseDT, {align:"right"});
          heightLeft -= innerH; if(heightLeft > 0){ pdf.addPage(); position = margin - (imgHmm - heightLeft); pageCount++; }
        }
        window.open(pdf.output("bloburl"), "_blank");
      }catch(e){
        console.error(e); alert("PDF生成失敗。画像読み込みエラーが原因の可能性があります。");
      }
    });
  }
}

function showModal(i){ if(i<0) i=CARDS.length-1; if(i>=CARDS.length) i=0; IDX=i; showModalFromCard(CARDS[i]); }

/* --- Core Rendering --- */
async function renderSection(root){
  const { l1="", l2="", heading="", cardWidth="33.33%", cardWidthSm="80%", imageRatio="16:9", autoplay="false", autoplayInterval="", autoplayStep="" } = root.dataset;
  if(!LZ_ENDPOINT || !l2){ root.innerHTML=`<div style="padding:12px;color:#b91c1c;">設定エラー</div>`; return; }
  const mql=window.matchMedia("(max-width:768px)"); root.style.setProperty("--cw", mql.matches ? cardWidthSm : cardWidth); root.style.setProperty("--ratio", ratio(imageRatio));
  root.innerHTML = `<div class="lz-head"><div class="lz-titlewrap"><h2 class="lz-title">${esc(heading || l2)}</h2></div></div><div class="lz-groupwrap"><div class="lz-loading">読み込み中…</div></div>`;
  const wrap = root.querySelector(".lz-groupwrap"); root.classList.add("lz-ready");
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
}

function buildNav(options={}){
  const sections = Array.from(document.querySelectorAll(".lz-section[data-l2]")); if(!sections.length) return;
  sections.forEach((s,i)=>{ if(!s.id){ const base = (s.dataset.l2||`l2-${i+1}`); let id=base,c=1; while(document.getElementById(id)) id=`${base}-${++c}`; s.id=id; }});
  const navs=document.querySelectorAll(".lz-nav"); if(!navs.length) return;
  const html=`<div class="lz-nav-inner">${sections.map(s=>`<a href="?section=${s.id}" data-target="${s.id}">${esc(s.dataset.l2)}</a>`).join("")}</div>`;
  navs.forEach(n=>n.innerHTML=html);
  const links=[...document.querySelectorAll(".lz-nav a")], byId=Object.fromEntries(links.map(a=>[a.dataset.target,a])), offset=parseInt(navs[0].dataset.offset||options.offset||0,10)||0;
  document.addEventListener("click",e=>{
    const a=e.target.closest(".lz-nav a[data-target]"); if(!a) return; e.preventDefault();
    const id=a.dataset.target, el=document.getElementById(id); if(!el) return;
    const y=el.getBoundingClientRect().top + window.pageYOffset - offset; window.scrollTo({top:y,behavior:"smooth"});
    if(HOST?.classList.contains("open")) lzClose();
    const url = new URL(location.href);
    url.searchParams.set("section", id); url.searchParams.delete("id");
    history.replaceState(null,"",url.pathname + url.search);
  },{passive:false});
  if("IntersectionObserver" in window){
    const io=new IntersectionObserver(es=>{ es.forEach(en=>{ if(en.isIntersecting){ links.forEach(x=>x.classList.remove("is-active")); const a=byId[en.target.id]; if(a) a.classList.add("is-active"); } }); },{rootMargin:"-40% 0px -55% 0px"});
    sections.forEach(s=>io.observe(s));
  }
}

function openFromQueryWithRetry(){
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id'); if(!id) return;
  const openIfReady=()=>{ 
    const card=document.getElementById(id); 
    if(card){ const track = card.closest(".lz-track"); CARDS = [...track.querySelectorAll(".lz-card")]; IDX = CARDS.indexOf(card); showModal(IDX); return true; } 
    return false; 
  };
  if(openIfReady()) return; 
  const mo=new MutationObserver(()=>{ if(openIfReady()){ mo.disconnect(); clearTimeout(timer); }});
  mo.observe(document.documentElement,{childList:true,subtree:true}); 
  const timer=setTimeout(()=>mo.disconnect(),8000);
}

function boot(){
  const sections=document.querySelectorAll(".lz-section[data-l2]"); if(!sections.length) return;
  const offset = document.querySelector(".pera1-header")?.offsetHeight||0;
  buildNav({offset});

  const handleUrlParams = (isInitialLoad = false) => {
    const params = new URLSearchParams(window.location.search);
    const modalId = params.get('id'), sectionId = params.get('section');
    if (modalId) {
      openFromQueryWithRetry();
    } else if (sectionId) {
      const scrollTo = () => {
        const el = document.getElementById(sectionId);
        if (el) {
          const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: y, behavior: isInitialLoad ? 'auto' : 'smooth' });
          return true;
        }
        return false;
      };
      if (scrollTo()) return;
      const mo = new MutationObserver(() => { if (scrollTo()) mo.disconnect(); });
      mo.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(() => mo.disconnect(), 8000);
    }
  };

  const params = new URLSearchParams(window.location.search);
  if (params.has('id') || params.has('section')) {
    sections.forEach(s => renderSection(s));
    handleUrlParams(true);
  } else {
    const mql=window.matchMedia("(max-width:768px)");
    const applyWidth=()=>sections.forEach(s=>{ const {cardWidth="33.33%", cardWidthSm="80%"} = s.dataset; s.style.setProperty("--cw", mql.matches ? cardWidthSm : cardWidth); });
    applyWidth(); mql.addEventListener?.("change", applyWidth);
    const io=("IntersectionObserver" in window) ? new IntersectionObserver(entries=>{ entries.forEach(e=>{ if(e.isIntersecting){ io.unobserve(e.target); renderSection(e.target); } }); },{rootMargin:"200px 0px"}) : null;
    sections.forEach(s=>{ if(io) io.observe(s); else renderSection(s); });
  }
  window.addEventListener("popstate", () => handleUrlParams(false), {passive:true});
}
if(document.readyState==="loading") { document.addEventListener("DOMContentLoaded", boot); } else { boot(); }

/* ====== Eager Load Patch ====== */
(function forceEagerLoadForLZ(){
  var _origRenderSection = window.renderSection; if (typeof _origRenderSection !== 'function') return;
  function guardedRenderSection(el){ if (!el || el.classList?.contains('lz-ready') || el.dataset.lzDone === '1') return; el.dataset.lzDone = '1'; return _origRenderSection(el); }
  window.renderSection = guardedRenderSection;
  function eager(){ var sections = document.querySelectorAll('.lz-section[data-l2]'); sections.forEach(function(s){ guardedRenderSection(s); }); if (typeof window.openFromQueryWithRetry === 'function'){ window.openFromQueryWithRetry(); } }
  if (document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', eager); } else { eager(); }
})();