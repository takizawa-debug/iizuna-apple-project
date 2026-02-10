/**
 * logic.js - 動的データ連動・UI最適化版 (カテゴリー初期非表示・休業連動版)
 */
import { utils } from './utils.js';

const genreIdMap = { "飲食": "eat", "買い物": "buy", "宿泊": "stay", "観光": "tour", "相談": "consult", "産業": "industry", "暮らし": "life" };

export async function initFormLogic() {
  const ENDPOINT = "https://script.google.com/macros/s/AKfycby1OYtOSLShDRw9Jlzv8HS09OehhUpuSKwjMOhV_dXELtp8wNdz_naZ72IyuBBjDGPwKg/exec";
  const days = ["月", "火", "水", "木", "金", "土", "日"];

  // --- 🍎 1. カテゴリーの生成 (初期状態でサブエリアを隠す) ---
  async function loadAndBuildGenres() {
    const container = document.getElementById('lz-dynamic-category-area');
    if (!container) return;
    try {
      const res = await fetch(`${ENDPOINT}?mode=form_genres`);
      const json = await res.json();
      if (!json.ok) throw new Error("取得失敗");
      const genres = json.items;
      let html = '';

      // 大カテゴリ(L1)チップ形式
      html += '<div id="box-shop-cat" class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> この場所でできること（複数選択可）</label><div class="lz-choice-grid">';
      Object.keys(genres).forEach(l1 => {
        const id = l1 === '大カテゴリその他' ? 'id="catRootOtherCheck"' : '';
        html += `<label class="lz-choice-item"><input type="checkbox" name="cat_l1" value="${l1}" ${id}><span class="lz-choice-inner">${l1}</span></label>`;
      });
      html += '</div></div>';

      // 各サブカテゴリ(L2)チップ形式 (style="display:none"を付与)
      Object.keys(genres).forEach(l1 => {
        if (l1 === '大カテゴリその他') return;
        const baseId = genreIdMap[l1] || 'custom';
        html += `<div id="sub-${baseId}" class="lz-dynamic-sub-area" style="display:none;"><label class="lz-label" style="font-size:1.1rem; color:#5b3a1e;">${l1}のジャンル</label><div class="lz-sub-choice-grid">`;
        genres[l1].forEach(l2 => {
          const isOther = l2.includes('その他');
          html += `<label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cat_${baseId}" value="${l2}" class="${isOther ? 'lz-sub-trigger' : ''}"><span class="lz-choice-inner">${l2}</span></label>`;
        });
        html += `</div><input type="text" name="cat_${baseId}_val" class="lz-input lz-sub-other-field" style="display:none;" placeholder="具体的な内容をご記入ください"></div>`;
      });
      
      // 大カテゴリ「その他」用自由記述 (初期非表示)
      html += `<div id="sub-cat-root-other" class="lz-dynamic-sub-area" style="display:none; border-left-color: #cf3a3a; margin-left: 0;"><label class="lz-label">カテゴリーの詳細（自由記述）</label><input type="text" name="cat_root_other_val" class="lz-input" placeholder="具体的にご記入ください"></div>`;
      container.innerHTML = html;
      bindDynamicEvents();
    } catch (e) { container.innerHTML = '<div style="color:#cf3a3a;">カテゴリーの取得に失敗しました。</div>'; }
  }

  // --- 🍎 2. 動的要素へのイベントバインド (大カテゴリその他連動含む) ---
  function bindDynamicEvents() {
    document.getElementsByName('cat_l1').forEach(c => c.onchange = () => {
      const v = Array.from(document.getElementsByName('cat_l1')).filter(i => i.checked).map(i => i.value);
      Object.keys(genreIdMap).forEach(key => {
        const el = document.getElementById(`sub-${genreIdMap[key]}`);
        if(el) el.style.display = v.includes(key) ? 'flex' : 'none';
      });
      // 大カテゴリ「その他」のボタン連動修正
      const otherRoot = document.getElementById('sub-cat-root-other');
      if(otherRoot) otherRoot.style.display = v.includes('大カテゴリその他') ? 'flex' : 'none';
    });

    document.querySelectorAll('.lz-sub-trigger').forEach(trigger => {
      trigger.onchange = (e) => {
        const parent = e.target.closest('.lz-dynamic-sub-area');
        const otherInput = parent ? parent.querySelector('.lz-sub-other-field') : null;
        if(otherInput) otherInput.style.display = e.target.checked ? 'block' : 'none';
      };
    });
  }

  // スケジュール：休業チェック時の無効化ロジック
  const customBody = document.getElementById('customSchedBody');
  if (customBody) {
    days.forEach(d => {
      const tr = document.createElement('tr'); tr.id = `row-${d}`;
      tr.innerHTML = `
        <td><strong>${d}曜日</strong></td>
        <td data-label="休業"><input type="checkbox" name="c_closed_${d}" class="lz-closed-check"></td>
        <td data-label="開店時間"><div class="lz-time-box">${utils.createTimeSelectorHTML('c_s_'+d)}</div></td>
        <td data-label="閉店時間"><div class="lz-time-box">${utils.createTimeSelectorHTML('c_e_'+d)}</div></td>
      `;
      customBody.appendChild(tr);
      
      const closedCheck = tr.querySelector('.lz-closed-check');
      const timeSelects = tr.querySelectorAll('select');
      closedCheck.onchange = (e) => {
        const isClosed = e.target.checked;
        tr.style.opacity = isClosed ? "0.4" : "1";
        timeSelects.forEach(sel => sel.disabled = isClosed); // 入力を禁止
      };
    });
  }

  // 各種セレクターのセット
  const setHtml = (id, html) => { const el = document.getElementById(id); if(el) el.innerHTML = html; };
  setHtml('sel-simple-start', utils.createTimeSelectorHTML('simple_s'));
  setHtml('sel-simple-end', utils.createTimeSelectorHTML('simple_e'));
  setHtml('sel-ev-start', utils.createTimeSelectorHTML('ev_s'));
  setHtml('sel-ev-end', utils.createTimeSelectorHTML('ev_e'));

  // 既存のタブ、住所検索、タイプ別表示、SNS連動ロジックは維持
  const tabs = document.querySelectorAll('.lz-form-tab');
  tabs.forEach(t => t.onclick = () => {
    tabs.forEach(x => x.classList.toggle('is-active', x === t));
    document.querySelectorAll('.lz-form-body').forEach(b => b.classList.remove('is-active'));
    const target = document.getElementById(`pane-${t.dataset.type}`);
    if (target) target.classList.add('is-active');
  });

  const zipBtn = document.getElementById('zipBtnAction');
  if (zipBtn) {
    zipBtn.onclick = async () => {
      const zip = document.getElementById('zipCode')?.value;
      if (!zip) return alert('郵便番号を入力してください');
      try {
        const addr = await utils.fetchAddress(zip);
        const addrField = document.getElementById('addressField');
        if (addrField) addrField.value = addr;
      } catch(e) { alert(e.message); }
    };
  }

  const typeRadios = document.getElementsByName('art_type');
  const fieldsContainer = document.getElementById('article-fields-container');
  function updateTypeView() {
    const selected = Array.from(typeRadios).find(r => r.checked);
    if (!selected) { if (fieldsContainer) fieldsContainer.style.display = 'none'; return; }
    if (fieldsContainer) fieldsContainer.style.display = 'flex';
    const type = selected.value;
    const toggle = (id, cond) => { const el = document.getElementById(id); if(el) el.style.display = cond ? 'flex' : 'none'; };
    toggle('pane-shop-detail', type === 'shop');
    toggle('pane-event-detail', type === 'event');
    const lblTitle = document.getElementById('lbl-title'), lblLead = document.getElementById('lbl-lead'), inpTitle = document.getElementById('inp-title');
    if (type === 'shop') {
      if(lblTitle) lblTitle.textContent = "店名・施設名"; if(lblLead) lblLead.textContent = "お店の概要";
      if(inpTitle) inpTitle.placeholder = "正式な店舗名をご記入ください";
    } else if (type === 'event') {
      if(lblTitle) lblTitle.textContent = "イベント名"; if(lblLead) lblLead.textContent = "イベントの概要";
      if(inpTitle) inpTitle.placeholder = "イベント名称をご記入ください";
    } else {
      if(lblTitle) lblTitle.textContent = "記事タイトル"; if(lblLead) lblLead.textContent = "記事の概要";
      if(inpTitle) inpTitle.placeholder = "読みたくなるタイトルをご記入ください";
    }
  }
  typeRadios.forEach(r => r.onchange = updateTypeView);
  updateTypeView();

  const snsTriggers = document.getElementsByName('sns_trigger');
  snsTriggers.forEach(trigger => {
    trigger.onchange = () => {
      const vals = Array.from(snsTriggers).filter(i => i.checked).map(i => i.value);
      ['home', 'ec', 'ig', 'fb', 'x', 'line'].forEach(t => {
        const box = document.getElementById(`f-${t}`);
        if(box) box.style.display = vals.includes(t) ? 'block' : 'none';
      });
    };
  });

  document.getElementsByName('shop_mode').forEach(r => r.onchange = (e) => {
    const s = document.getElementById('shop-simple'), c = document.getElementById('shop-custom');
    if(s) s.style.display = (e.target.value === 'simple' ? 'block' : 'none');
    if(c) c.style.display = (e.target.value === 'custom' ? 'block' : 'none');
  });

  document.getElementsByName('cm').forEach(c => c.onchange = () => {
    const v = Array.from(document.getElementsByName('cm')).filter(i => i.checked).map(i => i.value);
    const cmT = (id, cond) => { const el = document.getElementById(id); if(el) el.style.display = cond ? 'flex' : 'none'; };
    cmT('cm-form-box', v.includes('form')); cmT('cm-email-box', v.includes('email'));
    cmT('cm-tel-box', v.includes('tel')); cmT('cm-other-box', v.includes('other'));
    const sync = document.getElementById('syncField');
    if(sync) sync.style.display = v.includes('email') ? 'flex' : 'none';
  });

  const admMail = document.getElementById('adminEmail'), pubMail = document.getElementById('pubEmail'), syncCheck = document.getElementById('syncCheck');
  if (admMail && pubMail && syncCheck) {
    admMail.oninput = () => { if(syncCheck.checked) pubMail.value = admMail.value; };
    syncCheck.onchange = () => { pubMail.readOnly = syncCheck.checked; if(syncCheck.checked) pubMail.value = admMail.value; };
  }

  await loadAndBuildGenres();
}