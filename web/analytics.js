/**
 * analytics.js - Appletown Analytics (独立観測コンポーネント)
 * 役割: ユーザー行動追跡、滞在時間の精密計測、Geo情報取得、インタラクション分析
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

    const D = document, W = window, N = navigator, S = screen, L = location;
    const now = () => Date.now();
    const text = el => (el?.getAttribute?.("aria-label") || el?.textContent || "").trim();

    /* ==========================================
       1. 状態管理 (Visitor / Session / Time / Scroll)
       ========================================== */
    let activeTime = 0, lastVisibleTs = now(), tPage = now(), maxScroll = 0;

    const updateActiveTime = () => {
      if (D.visibilityState === "visible") lastVisibleTs = now();
      else activeTime += now() - lastVisibleTs;
    };
    D.addEventListener("visibilitychange", updateActiveTime);

    const updateScrollDepth = () => {
      const h = D.documentElement;
      const p = W.scrollY / (h.scrollHeight - h.clientHeight);
      if (p > maxScroll) maxScroll = p;
    };
    D.addEventListener("scroll", updateScrollDepth, { passive: true });

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

    const visitorId = (() => {
      let vid = getCookie(CONF.VISITOR_COOKIE);
      if (vid) return vid;
      vid = localStorage.getItem(CONF.VISITOR_LSKEY) || uuid4();
      setCookie(CONF.VISITOR_COOKIE, vid, 365 * 3);
      localStorage.setItem(CONF.VISITOR_LSKEY, vid);
      return vid;
    })();

    const touchSession = () => {
      let sid = sessionStorage.getItem("apz_sid");
      const t = now(), last = +sessionStorage.getItem("apz_sid_ts") || 0;
      if (!sid || (t - last) > CONF.SESSION_TTL) sid = uuid4();
      sessionStorage.setItem("apz_sid", sid);
      sessionStorage.setItem("apz_sid_ts", t);
      return sid;
    };

    const getUtmParams = () => {
      const params = new URLSearchParams(L.search);
      return {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign')
      };
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
          page_url: L.href, page_title: D.title,
          language: D.documentElement.lang || N.language,
          referrer: D.referrer, ua: N.userAgent,
          screen_w: S.width, screen_h: S.height,
          ...getUtmParams(),
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
    // クリック計測
    D.addEventListener("click", e => {
      const t = e.target;

      const extLink = t.closest('a[href^="http"]:not([href*="' + L.hostname + '"])');
      if (extLink) {
        return sendEvent("outbound_click", {
          href: extLink.href, label: text(extLink),
          link_domain: new URL(extLink.href).hostname
        });
      }

      const sugg = t.closest(".lz-search-suggestion");
      if (sugg) {
        return sendEvent("search_suggestion_click", {
          search_term: sugg.dataset.term, card_id: sugg.dataset.id, label: sugg.dataset.title
        });
      }

      const card = t.closest(".lz-card");
      if (card) return sendEvent("card_click", { card_id: card.dataset.id, label: card.dataset.title });
      
      const btn = t.closest("a.lz-btn, button.lz-btn");
      if (btn) return sendEvent("ui_click", { label: text(btn), href: btn.href });

      const sns = t.closest(".lz-sns a");
      if (sns) return sendEvent("share_click", { platform: sns.dataset.platform, href: sns.href });

      const toolBtn = t.closest("[data-action]");
      if (toolBtn) return sendEvent("tool_click", { action: toolBtn.dataset.action });

    }, { capture: true, passive: true });

    // フォーム送信
    D.addEventListener("submit", e => {
      if (e.target.matches(".lz-search-form")) {
        const input = e.target.querySelector("input[type=search]");
        if (input.value) sendEvent("search_submit", { search_term: input.value });
      }
    });

    // 属性変更監視 (モーダル, 言語切替)
    const obs = new MutationObserver(ms => {
      ms.forEach(m => {
        // 言語切替
        if (m.type === 'attributes' && m.attributeName === 'lang') {
          return sendEvent('language_switched', { 
            label: `${m.oldValue} -> ${D.documentElement.lang}`,
            group: D.documentElement.lang
          });
        }
        // モーダル表示
        m.addedNodes.forEach(n => {
          if (n.nodeType === 1 && n.classList?.contains("lz-backdrop")) {
            setTimeout(() => {
              const title = D.querySelector(".lz-modal .lz-mt")?.textContent;
              if (title) sendEvent("modal_open", { modal_name: title });
            }, 100);
          }
        });
      });
    });
    obs.observe(D.documentElement, { attributes: true, attributeOldValue: true, subtree: true, childList: true });

    // ライフサイクルイベント
    loadGeo().finally(() => {
      setTimeout(() => sendEvent("page_view"), 500);
    });

    let isClosed = false;
    const flush = () => {
      if (isClosed) return; isClosed = true;
      updateScrollDepth();
      const finalActive = D.visibilityState === "visible" ? activeTime + (now() - lastVisibleTs) : activeTime;
      sendEvent("page_close", { 
        engaged_ms: finalActive, 
        total_ms: now() - tPage,
        scroll_depth: Math.round(maxScroll * 100)
      });
    };
    W.addEventListener("pagehide", flush);
    W.addEventListener("beforeunload", flush);
  };

  // 起動
  init();

})();
