import { utils } from './utils.js';

export async function initFormLogic() {
  const ENDPOINT = "https://script.google.com/macros/s/AKfycby1OYtOSLShDRw9Jlzv8HS09OehhUpuSKwjMOhV_dXELtp8wNdz_naZ72IyuBBjDGPwKg/exec";
  const days = ["月", "火", "水", "木", "金", "土", "日"];

  // 1. カテゴリー取得（既存機能）
  async function loadAndBuildGenres() {
    const container = document.getElementById('lz-dynamic-category-area');
    if (!container) return;
    try {
      const res = await fetch(`${ENDPOINT}?mode=form_genres`);
      const json = await res.json();
      if (!json.ok) throw new Error();
      const genres = json.items;
      let html = '<div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> この場所でできること</label><div class="lz-choice-flex">';
      Object.keys(genres).forEach(l1 => {
        html += `<label class="lz-choice-item"><input type="checkbox" name="cat_l1" value="${l1}"><span class="lz-choice-inner">${l1}</span></label>`;
      });
      html += '</div></div>';
      container.innerHTML = html;
    } catch (e) { container.innerHTML = 'カテゴリーの取得に失敗しました。'; }
  }

  // 2. 🍎 高度な画像プレビュー管理
  let selectedFiles = [];
  const imgInput = document.getElementById('imgInput');
  const imgGrid = document.getElementById('imgPreviewGrid');
  const addTrigger = document.getElementById('imgAddTrigger');

  if (addTrigger) {
    addTrigger.onclick = () => imgInput.click();
    imgInput.onchange = (e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        if (selectedFiles.length < 6) selectedFiles.push(file);
      });
      renderPreviews();
      imgInput.value = ""; // リセットして再選択を可能に
    };
  }

  function renderPreviews() {
    document.querySelectorAll('.lz-img-item').forEach(el => el.remove());
    selectedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const div = document.createElement('div');
        div.className = 'lz-img-item';
        div.innerHTML = `<img src="${e.target.result}"><button type="button" class="lz-img-del" data-index="${index}">×</button>`;
        imgGrid.insertBefore(div, addTrigger);
        div.querySelector('.lz-img-del').onclick = () => {
          selectedFiles.splice(index, 1);
          renderPreviews();
        };
      };
      reader.readAsDataURL(file);
    });
    addTrigger.style.display = selectedFiles.length >= 6 ? 'none' : 'flex';
  }

  // 3. 🍎 メール同期ロジックの改善
  const pubEmail = document.getElementById('pubEmail');
  const adminEmail = document.getElementById('adminEmail');
  const syncCheck = document.getElementById('syncCheck');
  const syncField = document.getElementById('syncField');

  function updateSyncState() {
    const isEmailMode = Array.from(document.getElementsByName('cm')).some(c => c.value === 'email' && c.checked);
    const hasPubValue = pubEmail.value.trim().length > 0;
    
    // 掲載用メールが有効な場合のみチェックボックスを表示
    syncField.style.display = (isEmailMode && hasPubValue) ? 'block' : 'none';
    
    if (syncCheck.checked && isEmailMode) {
      adminEmail.value = pubEmail.value;
      adminEmail.readOnly = true;
      adminEmail.style.opacity = "0.7";
    } else {
      adminEmail.readOnly = false;
      adminEmail.style.opacity = "1";
    }
  }

  if (pubEmail && adminEmail && syncCheck) {
    pubEmail.oninput = updateSyncState;
    syncCheck.onchange = updateSyncState;
    document.getElementsByName('cm').forEach(c => c.onchange = () => {
      const emailBox = document.getElementById('cm-email-box');
      if(emailBox) emailBox.style.display = Array.from(document.getElementsByName('cm')).some(cb => cb.value === 'email' && cb.checked) ? 'block' : 'none';
      updateSyncState();
    });
  }

  // 4. その他のUI連動（現状維持）
  const zipBtn = document.getElementById('zipBtnAction');
  if (zipBtn) {
    zipBtn.onclick = async () => {
      const zip = document.getElementById('zipCode')?.value;
      try {
        const addr = await utils.fetchAddress(zip);
        document.getElementById('addressField').value = addr;
      } catch(e) { alert(e.message); }
    };
  }

  const typeRadios = document.getElementsByName('art_type');
  typeRadios.forEach(r => r.onchange = () => {
    document.getElementById('article-fields-container').style.display = 'flex';
    const type = r.value;
    document.getElementById('pane-shop-detail').style.display = type === 'shop' ? 'block' : 'none';
    document.getElementById('pane-event-detail').style.display = type === 'event' ? 'block' : 'none';
  });

  document.getElementsByName('shop_mode').forEach(r => r.onchange = (e) => {
    document.getElementById('shop-simple').style.display = e.target.value === 'simple' ? 'block' : 'none';
    document.getElementById('shop-custom').style.display = e.target.value === 'custom' ? 'block' : 'none';
  });

  const simpleBox = document.getElementById('box-simple-days');
  if (simpleBox) {
    days.forEach(d => {
      simpleBox.insertAdjacentHTML('beforeend', `<label class="lz-day-chip"><input type="checkbox" name="simple_days" value="${d}"><span class="lz-day-text">${d}</span></label>`);
    });
  }

  await loadAndBuildGenres();
}