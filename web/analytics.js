/**
 * analytics.js - Appletown Analytics (独立観測コンポーネント)
 * 役割: ユーザー行動追跡、滞在時間計測、Geo情報取得、自動イベント発火
 */
(function () {
  "use strict";

  // 二重起動防止
  if (window.__APZ_NS?.bound) return;
  (window.__APZ_NS ||= {}).bound = true;

  const CONF = window.LZ_CONFIG?.ANALYTICS;
  if (!CONF) return;

  const D = document, W = window, N = navigator, S = screen;
  const now = () => Date.now();
  const text = el => (el?.getAttribute?.("aria-label") || el?.textContent || "").trim();

  /* ==========================================
     1. 状態管理 (Visitor / Session / Time)
     ========================================== */
  let activeTime = 0, lastVisibleTs = now(), tPage = now();

  // 滞在時間の精密計測（タブが裏に回っている時間は除外）
  const updateActiveTime = () => {
    if (D.visibilityState === "visible") lastVisibleTs = now();
    else activeTime += now() - lastVisibleTs;
  };
  D.addEventListener("visibilitychange", updateActiveTime);

  // ID生成 (UUID v4)
  const uuid4 = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === "x" ? r : ((r & 3) | 8);
    return v.toString(16);
  });

  const setCookie = (k, v, days) => {
    const d = new Date(); d.setTime(d.getTime() + days * 864e5);
    D.cookie = `${k}=${encodeURIComponent(v)}; path=/; SameSite=Lax; expires=${d.toUTCString()}`;
  };

  const getCookie = k => {
    const m = D.cookie.match(new RegExp("(?:^| )" + k.replace(/([.*+?^${}()|[\]\\])/g, "\\$&") + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : null;
  };

  // ビジターID（永続）
  function ensureVisitorId() {
    let vid = getCookie(CONF.VISITOR_COOKIE);
    if (vid) { localStorage.setItem(CONF.VISITOR_LSKEY, vid); return vid; }
    vid = localStorage.getItem(CONF.VISITOR_LSKEY) || uuid4();
    setCookie(CONF.VISITOR_COOKIE, vid, 365 * 3);
    localStorage.setItem(CONF.VISITOR_LSKEY, vid);
    return vid;
  }
  const visitorId = ensureVisitorId();

  // セッションID（ブラウザを閉じるまで）
  function touchSession() {
    let sid = sessionStorage.getItem("apz_sid");
    const t = now(), last = +sessionStorage.getItem("apz_sid_ts") || 0;
    if (!sid || (t - last) > CONF.SESSION_TTL) sid = uuid4();
    sessionStorage.setItem("apz_sid", sid);
    sessionStorage.setItem("apz_sid_ts", t);
    return sid;
  }

  /* ==========================================
     2. Geo情報 (ipapi.co)
     ========================================== */
  let GEO = null;
  async function loadGeo() {
    const GEO_CACHE_KEY = "apz_geo_v1";
    try {
      const cached = JSON.parse(localStorage.getItem(GEO_CACHE_KEY) || "{}");
      if (cached.d && (now() - cached.t < 864e5)) { GEO = cached.d; return; }
      
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const j = await res.json();
        GEO = { ip: j.ip, country: j.country_name, region: j.region, city: j.city, lat: j.latitude, lon: j.longitude };
        localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ t: now(), d: GEO }));
      }
    } catch (e) {}
  }

  /* ==========================================
     3. 送信コア
     ========================================== */
  function sendEvent(event_name, event_params = {}) {
    try {
      const payload = {
        visitor_id: visitorId, session_id: touchSession(),
        event_name, event_params,
        page_url: location.href, page_title: D.title,
        referrer: D.referrer, ua: N.userAgent,
        screen_w: S.width, screen_h: S.height,
        ...(GEO ? { geo: GEO } : {})
      };
      const body = JSON.stringify(payload);
      // 離脱時でも確実に届くsendBeaconを優先、失敗ならFetch
      if (N.sendBeacon && N.sendBeacon(CONF.ENDPOINT, new Blob([body], { type: "text/plain" }))) return;
      fetch(CONF.ENDPOINT, { method: "POST", mode: "no-cors", body }).catch(() => {});
    } catch (e) {}
  }

  window.mzTrack = sendEvent;

  /* ==========================================
     4. 自動トラッキング設定
     ========================================== */
  // クリックイベントのキャプチャ
  D.addEventListener("click", e => {
    const t = e.target;
    
    const card = t.closest(".lz-card");
    if (card) return sendEvent("card_click", { id: card.dataset.id, title: card.dataset.title, group: card.dataset.group });
    
    const btn = t.closest(".lz-btn");
    if (btn) return sendEvent("ui_click", { type: "button", label: text(btn) });

    const sns = t.closest(".lz-sns a, .lz-sns-btn");
    if (sns) return sendEvent("sns_click", { platform: sns.dataset.sns, url: sns.href });
    
    const ext = t.closest("a[href^='http']");
    if (ext && !ext.href.includes(location.hostname)) return sendEvent("external_link", { url: ext.href });
  }, { capture: true, passive: true });

  // モーダル開閉監視 (MutationObserver)
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.classList?.contains("lz-backdrop")) {
          // モーダルが開いた瞬間
          setTimeout(() => {
            const title = D.querySelector(".lz-modal .lz-mt")?.textContent;
            if (title) sendEvent("modal_open", { title });
          }, 100);
        }
      });
    });
  });
  observer.observe(D.body, { childList: true });

  /* ==========================================
     5. ライフサイクル
     ========================================== */
  // 初回ページビュー
  loadGeo().finally(() => {
    setTimeout(() => sendEvent("page_view"), 500);
  });

  // 離脱（ページを閉じる時）
  let closed = false;
  const flushClose = () => {
    if (closed) return; closed = true;
    const finalActive = D.visibilityState === "visible" ? activeTime + (now() - lastVisibleTs) : activeTime;
    sendEvent("page_close", { total_ms: now() - tPage, active_ms: finalActive });
  };
  W.addEventListener("pagehide", flushClose);
  W.addEventListener("beforeunload", flushClose);

})();