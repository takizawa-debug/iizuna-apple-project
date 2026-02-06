/**
 * analytics.js - Appletown Analytics (独立観測コンポーネント)
 * 役割: ユーザー行動追跡、滞在時間の精密計測、Geo情報取得
 */
(function () {
  "use strict";

  // 二重起動を防止
  if (window.__APZ_NS?.bound) return;
  (window.__APZ_NS ||= {}).bound = true;

  // LZ_CONFIG の待機
  const init = async () => {
    const CONF = await new Promise(r => {
      const check = () => window.LZ_CONFIG?.ANALYTICS ? r(window.LZ_CONFIG.ANALYTICS) : setTimeout(check, 50);
      check();
    });

    const D = document, W = window, N = navigator, S = screen;
    const now = () => Date.now();
    const text = el => (el?.getAttribute?.("aria-label") || el?.textContent || "").trim();

    /* ==========================================
       1. 状態管理 (Visitor / Session / Time)
       ========================================== */
    let activeTime = 0, lastVisibleTs = now(), tPage = now();

    // 実際にページを見ていた時間（タブが裏にある時間は除外）を計算
    const updateActiveTime = () => {
      if (D.visibilityState === "visible") lastVisibleTs = now();
      else activeTime += now() - lastVisibleTs;
    };
    D.addEventListener("visibilitychange", updateActiveTime);

    // ID管理
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

    // 永続ビジターID
    const visitorId = (() => {
      let vid = getCookie(CONF.VISITOR_COOKIE);
      if (vid) return vid;
      vid = localStorage.getItem(CONF.VISITOR_LSKEY) || uuid4();
      setCookie(CONF.VISITOR_COOKIE, vid, 365 * 3);
      localStorage.setItem(CONF.VISITOR_LSKEY, vid);
      return vid;
    })();

    // セッションID
    const touchSession = () => {
      let sid = sessionStorage.getItem("apz_sid");
      const t = now(), last = +sessionStorage.getItem("apz_sid_ts") || 0;
      if (!sid || (t - last) > CONF.SESSION_TTL) sid = uuid4();
      sessionStorage.setItem("apz_sid", sid);
      sessionStorage.setItem("apz_sid_ts", t);
      return sid;
    };

    /* ==========================================
       2. Geo情報取得 (ipapi.co)
       ========================================== */
    let GEO = null;
    const loadGeo = async () => {
      const KEY = "apz_geo_v1";
      try {
        const cached = JSON.parse(localStorage.getItem(KEY) || "{}");
        if (cached.d && (now() - cached.t < 864e5)) { GEO = cached.d; return; }
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const j = await res.json();
          GEO = { ip: j.ip, country: j.country_name, region: j.region, city: j.city, lat: j.latitude, lon: j.longitude };
          localStorage.setItem(KEY, JSON.stringify({ t: now(), d: GEO }));
        }
      } catch (e) {}
    };

    /* ==========================================
       3. 送信コアロジック
       ========================================== */
    const sendEvent = (event_name, event_params = {}) => {
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
        if (N.sendBeacon && N.sendBeacon(CONF.ENDPOINT, new Blob([body], { type: "text/plain" }))) return;
        fetch(CONF.ENDPOINT, { method: "POST", mode: "no-cors", body }).catch(() => {});
      } catch (e) {}
    };

    window.mzTrack = sendEvent;

    /* ==========================================
       4. 自動イベント計測
       ========================================== */
    // クリック計測（イベント委譲）
    D.addEventListener("click", e => {
      const t = e.target;
      const card = t.closest(".lz-card");
      if (card) return sendEvent("card_click", { id: card.dataset.id, title: card.dataset.title });
      
      const btn = t.closest(".lz-btn");
      if (btn) return sendEvent("ui_click", { label: text(btn) });

      const sns = t.closest(".lz-sns a");
      if (sns) return sendEvent("sns_click", { url: sns.href });
    }, { capture: true, passive: true });

    // モーダル開閉監視
    const obs = new MutationObserver(ms => {
      ms.forEach(m => {
        m.addedNodes.forEach(n => {
          if (n.nodeType === 1 && n.classList?.contains("lz-backdrop")) {
            setTimeout(() => {
              const title = D.querySelector(".lz-modal .lz-mt")?.textContent;
              if (title) sendEvent("modal_open", { title });
            }, 100);
          }
        });
      });
    });
    obs.observe(D.body, { childList: true });

    // ライフサイクルイベント
    loadGeo().finally(() => {
      setTimeout(() => sendEvent("page_view"), 500);
    });

    let isClosed = false;
    const flush = () => {
      if (isClosed) return; isClosed = true;
      const finalActive = D.visibilityState === "visible" ? activeTime + (now() - lastVisibleTs) : activeTime;
      sendEvent("page_close", { total_ms: now() - tPage, active_ms: finalActive });
    };
    W.addEventListener("pagehide", flush);
    W.addEventListener("beforeunload", flush);
  };

  // 起動
  init();

})();