/**
 * logic.js - 動的データ連動・UI制御
 */
import { utils } from './utils.js';

const genreIdMap = { "飲食": "eat", "買い物": "buy", "宿泊": "stay", "観光": "tour", "相談": "consult", "産業": "industry", "暮らし": "life" };

export async function initFormLogic() {
  const ENDPOINT = "https://script.google.com/macros/s/AKfycby1OYtOSLShDRw9Jlzv8HS09OehhUpuSKwjMOhV_dXELtp8wNdz_naZ72IyuBBjDGPwKg/exec";
  
  // 🍎 曜日の定義から「祝」を除去
  const days = ["月", "火", "水", "木", "金", "土", "日"];

  async function loadAndBuildGenres() {
    const container = document.getElementById('lz-dynamic-category-area');
    if (!container) return;
    try {
      const res = await fetch(`${ENDPOINT}?mode=form_genres`);
      const json = await res.json();
      if (!json.ok) throw new Error("ジャンル取得失敗");
      const genres = json.items;
      let html = '';
      html += '<div id="box-shop-cat" class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> この場所でできること（複数選択可）</label><div class="lz-choice-group-main">';
      Object.keys(genres).forEach(l1 => {
        const idSuffix = l1 === '大カテゴリその他' ? 'catRootOtherCheck' : '';
        html += `<label class="lz-main-label"><input type="checkbox" name="cat_l1" value="${l1}" id="${idSuffix}"> ${l1}</label>`;
      });
      html += '</div></div>';
      Object.keys(genres).forEach(l1 => {
        if (l1 === '大カテゴリその他') return;
        const baseId = genreIdMap[l1] || 'custom';
        html += `<div id="sub-${baseId}" class="lz-dynamic-sub-area"><label class="lz-label" style="font-size:1.1rem; color:#5b3a1e;">${l1}のジャンル</label><div class="lz-choice-group-sub">`;
        genres[l1].forEach(l2 => {
          const isOther = l2.includes('その他');
          html += `<label class="lz-sub-label"><input type="checkbox" name="cat_${baseId}" value="${l2}" class="${isOther ? 'lz-sub-trigger' : ''}"> ${l2}</label>`;
        });
        html += `</div><input type="text" name="cat_${baseId}_val" class="lz-input lz-sub-other-field" style="display:none;" placeholder="具体的な内容をご記入ください"></div>`;
      });
      html += `<div id="sub-cat-root-other" class="lz-dynamic-sub-area" style="border-left-color: #cf3a3a; margin-left: 0; margin-top: 10px;"><label class="lz-label">カテゴリーの詳細（自由記述）</label><input type="text" name="cat_root_other_val" class="lz-input" placeholder="大カテゴリーに当てはまらない内容をご記入ください"></div>`;
      container.innerHTML = html;
      bindDynamicEvents();
    } catch (e) { container.innerHTML = '<div style="color:#cf3a3a; padding:10px; border:1px dashed #cf3a3a;">カテゴリーの取得に失敗しました。</div>'; }
  }

  function bindDynamicEvents() {
    document.getElementsByName('cat_l1').forEach(c => c.onchange = () => {
      const v = Array.from(document.getElementsByName('cat_l1')).filter(i => i.checked).map(i => i.value);
      Object.keys(genreIdMap).forEach(key => {
        const el = document.getElementById(`sub-${genreIdMap[key]}`);
        if(el) el.style.display = v.includes(key) ? 'flex' : 'none';
      });
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

  // 🍎 スケジュール生成 (チップセレクター ＆ スマホ用データラベル付与)
  const simpleBox = document.getElementById('box-simple-days');
  const customBody = document.getElementById('customSchedBody');
  if (simpleBox && customBody) {
    days.forEach(d => {
      const l = document.createElement('label'); 
      l.className = 'lz-day-chip';
      l.innerHTML = `<input type="checkbox" name="simple_days" value="${d}"><span class="lz-day-text">${d}</span>`;
      simpleBox.appendChild(l);

      const tr = document.createElement('tr'); tr.id = `row-${d}`;
      // スマホ版での見出しを data-label で定義
      tr.innerHTML = `
        <td><strong>${d}曜日</strong></td>
        <td data-label="休業"><input type="checkbox" name="c_closed_${d}"></td>
        <td data-label="開店時間"><div class="lz-time-box">${utils.createTimeSelectorHTML('c_s_'+d)}</div></td>
        <td data-label="閉店時間"><div class="lz-time-box">${utils.createTimeSelectorHTML('c_e_'+d)}</div></td>
      `;
      customBody.appendChild(tr);
      tr.querySelector('input[type="checkbox"]').onchange = (e) => tr.style.opacity = e.target.checked ? "0.4" : "1";
    });
  }

  const setHtml = (id, html) => { const el = document.getElementById(id); if(el) el.innerHTML = html; };
  setHtml('sel-simple-time', utils.createTimeSelectorHTML('simple_s') + '<span>〜</span>' + utils.createTimeSelectorHTML('simple_e'));
  setHtml('sel-ev-s', utils.createTimeSelectorHTML('ev_s'));
  setHtml('sel-ev-e', utils.createTimeSelectorHTML('ev_e'));

  const typeRadios = document.getElementsByName('art_type');
  const fieldsContainer = document.getElementById('article-fields-container');
  const lblTitle = document.getElementById('lbl-title');
  const lblLead = document.getElementById('lbl-lead');
  const inpTitle = document.getElementById('inp-title');

  function updateTypeView() {
    const selected = Array.from(typeRadios).find(r => r.checked);
    if (!selected) { if (fieldsContainer) fieldsContainer.style.display = 'none'; return; }
    if (fieldsContainer) fieldsContainer.style.display = 'flex';
    const type = selected.value;
    const toggle = (id, cond) => { const el = document.getElementById(id); if(el) el.style.display = cond ? 'flex' : 'none'; };
    toggle('pane-shop-detail', type === 'shop');
    toggle('pane-event-detail', type === 'event');
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
      ['home', 'ec', 'ig', 'fb', 'x', 'line', 'tt'].forEach(t => {
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