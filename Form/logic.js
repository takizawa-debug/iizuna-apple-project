import { utils } from './utils.js';

const genreIdMap = { "飲食": "eat", "買い物": "buy", "宿泊": "stay", "観光": "tour", "相談": "consult", "産業": "industry", "暮らし": "life" };

export async function initFormLogic() {
  const ENDPOINT = "https://script.google.com/macros/s/AKfycby1OYtOSLShDRw9Jlzv8HS09OehhUpuSKwjMOhV_dXELtp8wNdz_naZ72IyuBBjDGPwKg/exec";
  const days = ["月", "火", "水", "木", "金", "土", "日"];

  // --- 🍎 1. カテゴリー動的生成 (チョイスカード対応) ---
  async function loadAndBuildGenres() {
    const container = document.getElementById('lz-dynamic-category-area');
    if (!container) return;
    try {
      const res = await fetch(`${ENDPOINT}?mode=form_genres`);
      const json = await res.json();
      if (!json.ok) throw new Error("ジャンル取得失敗");
      const genres = json.items;
      let html = '<div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> できること（複数選択）</label><div class="lz-choice-grid">';
      Object.keys(genres).forEach(l1 => {
        html += `<label class="lz-choice-card"><input type="checkbox" name="cat_l1" value="${l1}"><div class="lz-choice-content">${l1}</div></label>`;
      });
      html += '</div></div>';

      Object.keys(genres).forEach(l1 => {
        if (l1 === '大カテゴリその他') return;
        const baseId = genreIdMap[l1] || 'custom';
        html += `<div id="sub-${baseId}" class="lz-dynamic-sub-area"><label class="lz-label">${l1}のジャンル</label><div class="lz-choice-grid">`;
        genres[l1].forEach(l2 => {
          html += `<label class="lz-choice-card"><input type="checkbox" name="cat_${baseId}" value="${l2}" class="${l2.includes('その他') ? 'lz-sub-trigger' : ''}"><div class="lz-choice-content">${l2}</div></label>`;
        });
        html += `</div><input type="text" name="cat_${baseId}_val" class="lz-input lz-sub-other-field" style="display:none;" placeholder="詳細をご記入ください"></div>`;
      });
      container.innerHTML = html;
      bindDynamicEvents();
    } catch (e) { container.innerHTML = '<div style="color:#cf3a3a; padding:10px;">再読み込みしてください。</div>'; }
  }

  function bindDynamicEvents() {
    document.getElementsByName('cat_l1').forEach(c => c.onchange = () => {
      const v = Array.from(document.getElementsByName('cat_l1')).filter(i => i.checked).map(i => i.value);
      Object.keys(genreIdMap).forEach(key => {
        const el = document.getElementById(`sub-${genreIdMap[key]}`);
        if(el) el.style.display = v.includes(key) ? 'flex' : 'none';
      });
    });
    document.querySelectorAll('.lz-sub-trigger').forEach(trigger => {
      trigger.onchange = (e) => {
        const parent = e.target.closest('.lz-dynamic-sub-area');
        const otherInput = parent ? parent.querySelector('.lz-sub-other-field') : null;
        if(otherInput) otherInput.style.display = e.target.checked ? 'block' : 'none';
      };
    });
  }

  // --- 🍎 2. スケジュール生成 (スマホ用データラベル) ---
  const simpleBox = document.getElementById('box-simple-days');
  const customBody = document.getElementById('customSchedBody');
  if (simpleBox && customBody) {
    days.forEach(d => {
      // 標準設定の曜日チップ
      const l = document.createElement('label'); l.className = 'lz-choice-card';
      l.innerHTML = `<input type="checkbox" name="simple_days" value="${d}"><div class="lz-choice-content">${d}</div>`;
      simpleBox.appendChild(l);

      // 詳細設定のカード化対応行
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><strong>${d}曜日</strong></td>
        <td data-label="休業"><input type="checkbox" name="c_closed_${d}"></td>
        <td data-label="開店時間"><div class="lz-time-box">${utils.createTimeSelectorHTML('c_s_'+d)}</div></td>
        <td data-label="閉店時間"><div class="lz-time-box">${utils.createTimeSelectorHTML('c_e_'+d)}</div></td>`;
      customBody.appendChild(tr);
      tr.querySelector('input[type="checkbox"]').onchange = (e) => tr.style.opacity = e.target.checked ? "0.5" : "1";
    });
  }

  // 標準営業時間のセット
  const selSimple = document.getElementById('sel-simple-time');
  if(selSimple) selSimple.innerHTML = utils.createTimeSelectorHTML('simple_s') + '<span style="font-weight:bold;">〜</span>' + utils.createTimeSelectorHTML('simple_e');

  // --- 🍎 3. その他 UI連動ロジック (Nullガード付き) ---
  const tabs = document.querySelectorAll('.lz-form-tab');
  tabs.forEach(t => t.onclick = () => {
    tabs.forEach(x => x.classList.toggle('is-active', x === t));
    document.querySelectorAll('.lz-form-body').forEach(b => b.classList.remove('is-active'));
    const target = document.getElementById(`pane-${t.dataset.type}`);
    if (target) target.classList.add('is-active');
  });

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
  }
  typeRadios.forEach(r => r.onchange = updateTypeView);

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

  document.getElementsByName('cm').forEach(c => c.onchange = () => {
    const v = Array.from(document.getElementsByName('cm')).filter(i => i.checked).map(i => i.value);
    const cmT = (id, cond) => { const el = document.getElementById(id); if(el) el.style.display = cond ? 'flex' : 'none'; };
    cmT('cm-form-box', v.includes('form')); cmT('cm-email-box', v.includes('email'));
    cmT('cm-tel-box', v.includes('tel')); cmT('cm-other-box', v.includes('other'));
    const sync = document.getElementById('syncField');
    if(sync) sync.style.display = v.includes('email') ? 'flex' : 'none';
  });

  await loadAndBuildGenres();
}