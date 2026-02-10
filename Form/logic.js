import { utils } from './utils.js';

export async function initFormLogic() {
  const ENDPOINT = "https://script.google.com/macros/s/AKfycby1OYtOSLShDRw9Jlzv8HS09OehhUpuSKwjMOhV_dXELtp8wNdz_naZ72IyuBBjDGPwKg/exec";
  const days = ["月", "火", "水", "木", "金", "土", "日"];
  let uploadedFiles = []; // 画像管理用配列

  // 🍎 画像プレビュー ＆ 削除機能
  const artImagesInput = document.getElementById('artImagesInput');
  const previewContainer = document.getElementById('imagePreviewContainer');
  const addTrigger = document.getElementById('imageAddTrigger');

  if (artImagesInput && previewContainer) {
    artImagesInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (uploadedFiles.length + files.length > 6) return alert("画像は最大6枚までです");
      
      files.forEach(file => {
        uploadedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
          const div = document.createElement('div');
          div.className = 'lz-image-preview';
          div.innerHTML = `<img src="${ev.target.result}"><button type="button" class="lz-image-delete">×</button>`;
          div.querySelector('.lz-image-delete').onclick = () => {
            uploadedFiles = uploadedFiles.filter(f => f !== file);
            div.remove();
            if (uploadedFiles.length < 6) addTrigger.style.display = 'flex';
          };
          previewContainer.insertBefore(div, addTrigger);
        };
        reader.readAsDataURL(file);
      });
      if (uploadedFiles.length >= 6) addTrigger.style.display = 'none';
      artImagesInput.value = ""; // リセットして同じファイルの再選択を可能に
    });
  }

  // 🍎 メール同期ロジックの改善 (掲載用 -> 事務局用)
  const pubEmail = document.getElementById('pubEmail');
  const admMail = document.getElementById('adminEmail');
  const syncCheck = document.getElementById('syncCheck');
  const syncField = document.getElementById('syncField');

  if (pubEmail && admMail && syncCheck) {
    const updateSyncView = () => { syncField.style.display = pubEmail.value.includes('@') ? 'block' : 'none'; };
    pubEmail.addEventListener('input', () => {
      updateSyncView();
      if (syncCheck.checked) admMail.value = pubEmail.value;
    });
    syncCheck.addEventListener('change', () => {
      admMail.readOnly = syncCheck.checked;
      if (syncCheck.checked) admMail.value = pubEmail.value;
    });
  }

  // ...カテゴリー読み込みロジック (既存維持)...
  async function loadAndBuildGenres() {
    const container = document.getElementById('lz-dynamic-category-area');
    if (!container) return;
    try {
      const res = await fetch(`${ENDPOINT}?mode=form_genres`);
      const json = await res.json();
      const genres = json.items;
      let html = '<div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> この場所でできること</label><div class="lz-choice-flex">';
      Object.keys(genres).forEach(l1 => {
        html += `<label class="lz-choice-item"><input type="checkbox" name="cat_l1" value="${l1}"><span class="lz-choice-inner">${l1}</span></label>`;
      });
      html += '</div></div>';
      // (サブカテゴリ生成ロジックは以前の安定版を維持)
      container.innerHTML = html;
      bindDynamicEvents();
    } catch (e) { console.error(e); }
  }

  // 🍎 営業時間・定休日：既存の安定ロジック
  const customBody = document.getElementById('customSchedBody');
  if (customBody) {
    days.forEach(d => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><strong>${d}</strong></td><td data-label="休業"><input type="checkbox" name="c_closed_${d}" class="lz-closed-trigger"></td><td data-label="営業開始"><div class="lz-time-box">${utils.createTimeSelectorHTML('c_s_'+d)}</div></td><td data-label="営業終了"><div class="lz-time-box">${utils.createTimeSelectorHTML('c_e_'+d)}</div></td>`;
      customBody.appendChild(tr);
      const trigger = tr.querySelector('.lz-closed-trigger');
      trigger.onchange = (e) => {
        tr.style.opacity = e.target.checked ? "0.4" : "1";
        tr.querySelectorAll('select').forEach(s => s.disabled = e.target.checked);
      };
    });
  }

  // その他タブ切り替え、住所検索、各種バリデーションを初期化
  const simpleBox = document.getElementById('box-simple-days');
  if (simpleBox) { days.forEach(d => {
    const l = document.createElement('label'); l.className = 'lz-day-chip';
    l.innerHTML = `<input type="checkbox" name="simple_days" value="${d}"><span class="lz-day-text">${d}</span>`;
    simpleBox.appendChild(l);
  }); }
  
  const setHtml = (id, html) => { const el = document.getElementById(id); if(el) el.innerHTML = html; };
  setHtml('sel-simple-start', utils.createTimeSelectorHTML('simple_s'));
  setHtml('sel-simple-end', utils.createTimeSelectorHTML('simple_e'));
  setHtml('sel-ev-s', utils.createTimeSelectorHTML('ev_s'));
  setHtml('sel-ev-e', utils.createTimeSelectorHTML('ev_e'));

  const tabs = document.querySelectorAll('.lz-form-tab');
  tabs.forEach(t => t.onclick = () => {
    tabs.forEach(x => x.classList.toggle('is-active', x === t));
    document.querySelectorAll('.lz-form-body').forEach(b => b.classList.remove('is-active'));
    document.getElementById(`pane-${t.dataset.type}`).classList.add('is-active');
  });

  document.getElementById('zipBtnAction').onclick = async () => {
    try {
      const addr = await utils.fetchAddress(document.getElementById('zipCode').value);
      document.getElementById('addressField').value = addr;
    } catch(e) { alert(e.message); }
  };

  const typeRadios = document.getElementsByName('art_type');
  typeRadios.forEach(r => r.onchange = () => {
    document.getElementById('article-fields-container').style.display = 'flex';
    const type = r.value;
    document.getElementById('pane-shop-detail').style.display = (type === 'shop' ? 'flex' : 'none');
    document.getElementById('pane-event-detail').style.display = (type === 'event' ? 'flex' : 'none');
  });

  await loadAndBuildGenres();
}