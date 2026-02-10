import { utils } from './utils.js';

const genreIdMap = { "飲食": "eat", "買い物": "buy", "宿泊": "stay", "観光": "tour", "相談": "consult", "産業": "industry", "暮らし": "life" };

export async function initFormLogic() {
  const ENDPOINT = "https://script.google.com/macros/s/AKfycby1OYtOSLShDRw9Jlzv8HS09OehhUpuSKwjMOhV_dXELtp8wNdz_naZ72IyuBBjDGPwKg/exec";
  const days = ["月", "火", "水", "木", "金", "土", "日"];

  // --- 🍎 カテゴリー生成 ---
  async function loadAndBuildGenres() {
    const container = document.getElementById('lz-dynamic-category-area');
    if (!container) return;
    try {
      const res = await fetch(`${ENDPOINT}?mode=form_genres`);
      const json = await res.json();
      if (!json.ok) throw new Error();
      const genres = json.items;
      let html = '<div id="box-shop-cat" class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> この場所でできること（複数選択可）</label><div class="lz-choice-flex">';
      Object.keys(genres).forEach(l1 => {
        html += `<label class="lz-choice-item"><input type="checkbox" name="cat_l1" value="${l1}"><span class="lz-choice-inner">${l1}</span></label>`;
      });
      html += '</div></div>';
      container.innerHTML = html;
      bindDynamicEvents();
    } catch (e) { container.innerHTML = 'カテゴリーの取得に失敗しました。'; }
  }

  function bindDynamicEvents() {
    document.getElementsByName('cat_l1').forEach(c => c.onchange = () => {
      const v = Array.from(document.getElementsByName('cat_l1')).filter(i => i.checked).map(i => i.value);
      Object.keys(genreIdMap).forEach(key => {
        const el = document.getElementById(`sub-${genreIdMap[key]}`);
        if(el) el.style.display = v.includes(key) ? 'flex' : 'none';
      });
    });
  }

  // --- 🍎 各種UI制御（現状維持・タブ復元） ---
  const customBody = document.getElementById('customSchedBody');
  if (customBody) {
    days.forEach(d => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><strong>${d}</strong></td><td data-label="休業"><input type="checkbox" class="lz-closed-trigger"></td><td data-label="開始"><div class="lz-time-box">${utils.createTimeSelectorHTML('c_s_'+d)}</div></td><td data-label="終了"><div class="lz-time-box">${utils.createTimeSelectorHTML('c_e_'+d)}</div></td>`;
      customBody.appendChild(tr);
    });
  }

  const simpleBox = document.getElementById('box-simple-days');
  if (simpleBox) { days.forEach(d => { simpleBox.insertAdjacentHTML('beforeend', `<label class="lz-day-chip"><input type="checkbox" name="simple_days" value="${d}"><span class="lz-day-text">${d}</span></label>`); }); }

  const setHtml = (id, html) => { const el = document.getElementById(id); if(el) el.innerHTML = html; };
  setHtml('sel-simple-start', utils.createTimeSelectorHTML('simple_s')); setHtml('sel-simple-end', utils.createTimeSelectorHTML('simple_e'));

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
      const zip = document.getElementById('zipCode').value;
      try { const addr = await utils.fetchAddress(zip); document.getElementById('addressField').value = addr; } catch(e) { alert(e.message); }
    };
  }

  const typeRadios = document.getElementsByName('art_type');
  typeRadios.forEach(r => r.onchange = () => {
    document.getElementById('article-fields-container').style.display = 'flex';
    document.getElementById('pane-shop-detail').style.display = r.value === 'shop' ? 'block' : 'none';
  });

  document.getElementsByName('shop_mode').forEach(r => r.onchange = (e) => {
    document.getElementById('shop-simple').style.display = e.target.value === 'simple' ? 'block' : 'none';
    document.getElementById('shop-custom').style.display = e.target.value === 'custom' ? 'block' : 'none';
  });

  document.getElementsByName('cm').forEach(c => c.onchange = () => {
    document.getElementById('cm-email-box').style.display = Array.from(document.getElementsByName('cm')).some(i => i.value === 'email' && i.checked) ? 'block' : 'none';
    updateSync();
  });

  // --- 🍎 画像プレビュー＆追加・削除ロジック ---
  let uploadedFiles = [];
  const imgInput = document.getElementById('art_images_input');
  const imgAddBtn = document.getElementById('imgAddBtn');
  const previewArea = document.getElementById('imgPreviewArea');

  if (imgAddBtn && imgInput) {
    imgAddBtn.onclick = () => imgInput.click();
    imgInput.onchange = (e) => {
      Array.from(e.target.files).forEach(file => {
        if (uploadedFiles.length >= 6) return;
        uploadedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          const div = document.createElement('div');
          div.className = 'lz-img-container';
          div.innerHTML = `<img src="${event.target.result}"><div class="lz-img-remove">×</div>`;
          div.querySelector('.lz-img-remove').onclick = () => {
            div.remove();
            uploadedFiles = uploadedFiles.filter(f => f !== file);
            imgAddBtn.style.display = 'flex';
          };
          previewArea.insertBefore(div, imgAddBtn);
          if (uploadedFiles.length >= 6) imgAddBtn.style.display = 'none';
        };
        reader.readAsDataURL(file);
      });
      imgInput.value = ""; 
    };
  }

  // --- 🍎 メールアドレス同期ロジック（統合版） ---
  const pubMail = document.getElementById('pubEmail');
  const admMail = document.getElementById('adminEmail');
  const syncCheck = document.getElementById('syncCheck');
  const syncField = document.getElementById('syncField');

  function updateSync() {
    if (!pubMail || !admMail || !syncCheck) return;
    const isEmailMode = Array.from(document.getElementsByName('cm')).some(i => i.value === 'email' && i.checked);
    const hasPubValue = pubMail.value.trim() !== "";
    syncField.style.display = (isEmailMode && hasPubValue) ? "block" : "none";
    if (syncCheck.checked && isEmailMode && hasPubValue) {
      admMail.value = pubMail.value;
      admMail.readOnly = true;
    } else {
      admMail.readOnly = false;
    }
  }

  if (pubMail) pubMail.oninput = updateSync;
  if (syncCheck) syncCheck.onchange = updateSync;

  await loadAndBuildGenres();
}