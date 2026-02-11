/**
 * logic.js - 制御エンジン
 */
import { utils } from './utils.js';
import { i18n } from './i18n.js';

export async function initFormLogic() {
  const ENDPOINT = "https://script.google.com/macros/s/AKfycby1OYtOSLShDRw9Jlzv8HS09OehhUpuSKwjMOhV_dXELtp8wNdz_naZ72IyuBBjDGPwKg/exec";
  const days = ["月", "火", "水", "木", "金", "土", "日"];
  let currentFetchType = null;

  // 🍎 要素のキャッシュ
  const typeSelect = document.getElementById('art_type_select');
  const fieldsContainer = document.getElementById('article-fields-container');
  const lblTitle = document.getElementById('lbl-title');
  const lblLead = document.getElementById('lbl-lead');
  const inpTitle = document.getElementById('inp-title');
  const inpLead = document.getElementsByName('art_lead')[0];
  const inpBody = document.getElementsByName('art_body')[0];

  /** 🍎 UI更新：i18nデータに基づく宣言型制御 */
  function updateTypeView() {
    if (!typeSelect) return;
    const type = typeSelect.value;
    const set = i18n.types[type];
    const url = new URL(window.location);

    if (!type || !set) {
      if (fieldsContainer) fieldsContainer.style.display = 'none';
      url.searchParams.delete('type');
      window.history.replaceState({}, '', url.pathname + url.search);
      return;
    }

    // 表示切り替えとURL同期
    fieldsContainer.style.display = 'flex';
    url.searchParams.set('type', type);
    window.history.replaceState({}, '', url.pathname + url.search);

    // テキスト・ラベルの一括反映
    const lblDynCat = document.getElementById('lbl-dynamic-cat');
    if (lblDynCat) lblDynCat.textContent = set.catLabel;
    lblTitle.textContent = set.titleLabel;
    lblLead.textContent = set.leadLabel;
    inpTitle.placeholder = set.titlePlace;
    inpLead.placeholder = set.leadPlace;
    inpBody.placeholder = set.bodyPlace;
    if (document.getElementById('art_memo')) document.getElementById('art_memo').placeholder = set.memoPlace;
    if (document.getElementById('lbl-notes')) document.getElementById('lbl-notes').textContent = set.notesLabel;

    // パネル出し分け
    const toggle = (id, cond) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = cond ? 'flex' : 'none';
        el.querySelectorAll('input, textarea, select').forEach(f => {
          if (cond) { if (f.dataset.needed === "true") f.required = true; } 
          else { if (f.required) f.dataset.needed = "true"; f.required = false; }
        });
      }
    };

    toggle('pane-shop-detail', type === 'shop');
    toggle('pane-event-detail', type === 'event');
    toggle('pane-producer-detail', type === 'producer');
    toggle('ev-venue-box', type === 'event' || type === 'other');
    toggle('ev-org-field', type === 'event');
    toggle('box-writing-assist', type !== 'other');

    // 住所必須制御
    const isShop = type === 'shop';
    const zipBadge = document.getElementById('zipBadge'), addrBadge = document.getElementById('addrBadge');
    const zipInp = document.getElementById('zipCode'), addrInp = document.getElementById('addressField');
    if (zipBadge && addrBadge) {
      zipBadge.style.display = addrBadge.style.display = isShop ? 'inline-block' : 'none';
      zipInp.required = addrInp.required = isShop;
    }

    // 会場名ラベル調整
    const venueBox = document.getElementById('ev-venue-box');
    if (venueBox) {
      const vLabel = venueBox.querySelector('.lz-label');
      if (vLabel) vLabel.textContent = (type === 'other') ? '関連する場所の名称' : '会場名';
    }

    loadAndBuildGenres(type);
  }

  /* --- 以下、既存の機能ロジック（変更なし） --- */

  async function loadAndBuildGenres(type) {
    const container = document.getElementById('lz-dynamic-category-area');
    if (!container) return;
    currentFetchType = type;
    container.innerHTML = '<div style="font-size:0.9rem; color:#888;">カテゴリーを取得中...</div>';
    try {
      const res = await fetch(`${ENDPOINT}?mode=form_genres&type=${type}&_t=${Date.now()}`);
      const json = await res.json();
      if (type !== currentFetchType) return;
      if (!json.ok) throw new Error();
      
      let l1Html = '<div class="lz-choice-flex">';
      let l2Html = '';
      Object.keys(json.items).forEach((l1, idx) => {
        const baseId = `gen-${idx}`;
        const isOther = l1.includes('その他');
        l1Html += `<label class="lz-choice-item"><input type="checkbox" name="cat_l1" value="${l1}" data-subid="${baseId}"><span class="lz-choice-inner">${l1}</span></label>`;
        if (!isOther) {
          l2Html += `<div id="sub-${baseId}" class="lz-dynamic-sub-area" style="display:none;"><label class="lz-label" style="font-size:1.1rem;">${l1}のジャンル</label><div class="lz-choice-flex">`;
          json.items[l1].forEach(l2 => {
            l2Html += `<label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cat_${baseId}" value="${l2}" class="${l2.includes('その他') ? 'lz-sub-trigger' : ''}"><span class="lz-choice-inner">${l2}</span></label>`;
          });
          l2Html += `</div><input type="text" name="cat_${baseId}_val" class="lz-input lz-sub-other-field" style="display:none;" placeholder="詳細入力"></div>`;
        }
      });
      container.innerHTML = l1Html + '</div>' + l2Html + `<div id="sub-cat-root-other" class="lz-dynamic-sub-area" style="display:none;"><label class="lz-label">詳細記述</label><input type="text" name="cat_root_other_val" class="lz-input"></div>`;
      bindDynamicEvents();
    } catch (e) { container.innerHTML = '取得失敗'; }
  }

  function bindDynamicEvents() {
    document.getElementsByName('cat_l1').forEach(c => {
      c.onchange = (e) => {
        const el = document.getElementById(`sub-${e.target.dataset.subid}`);
        if (el) el.style.display = e.target.checked ? 'flex' : 'none';
      };
    });
    document.querySelectorAll('.lz-sub-trigger').forEach(t => {
      t.onchange = (e) => {
        const inp = e.target.closest('.lz-dynamic-sub-area').querySelector('.lz-sub-other-field');
        if (inp) inp.style.display = e.target.checked ? 'block' : 'none';
      };
    });
  }

  // タブ切り替えロジック
  document.querySelectorAll('.lz-form-tab').forEach(t => t.onclick = () => {
    document.querySelectorAll('.lz-form-tab').forEach(x => x.classList.toggle('is-active', x === t));
    document.querySelectorAll('.lz-form-body').forEach(b => {
      b.classList.remove('is-active');
      b.querySelectorAll('[required]').forEach(el => { el.dataset.required = "true"; el.required = false; });
    });
    const target = document.getElementById(`pane-${t.dataset.type}`);
    if (target) {
      target.classList.add('is-active');
      target.querySelectorAll('[data-required="true"]').forEach(el => el.required = true);
    }
    if (t.dataset.type === 'article') updateTypeView();
  });

  // 時間セレクター注入
  const setHtml = (id, html) => { const el = document.getElementById(id); if(el) el.innerHTML = html; };
  setHtml('sel-simple-start', utils.createTimeSelectorHTML('simple_s'));
  setHtml('sel-simple-end', utils.createTimeSelectorHTML('simple_e'));
  setHtml('sel-ev-s', utils.createTimeSelectorHTML('ev_s'));
  setHtml('sel-ev-e', utils.createTimeSelectorHTML('ev_e'));

  // 郵便番号検索
  const zipBtn = document.getElementById('zipBtnAction');
  if (zipBtn) zipBtn.onclick = async () => {
    const zip = document.getElementById('zipCode').value;
    try { document.getElementById('addressField').value = await utils.fetchAddress(zip); } catch(e) { alert(e.message); }
  };

  // 送信処理
  const form = document.getElementById('lz-article-form');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('.lz-send-btn');
      btn.disabled = true; btn.textContent = i18n.common.sending;
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      payload.cat_l1 = Array.from(form.querySelectorAll('[name="cat_l1"]:checked')).map(i => i.value);
      try {
        const res = await fetch(ENDPOINT, { method: "POST", body: JSON.stringify(payload) });
        const result = await res.json();
        if (result.ok) { alert(result.message); window.location.reload(); }
      } catch (err) { alert("送信失敗"); } finally { btn.disabled = false; btn.textContent = i18n.common.sendBtn; }
    };
  }

  // 初期化
  typeSelect.onchange = updateTypeView;
  updateTypeView();
}