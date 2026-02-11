/**
 * logic.js - 動的データ連動・UI最適化版（完全修正版）
 */
import { utils } from './utils.js';
import { catLabels } from './templates.js';

export async function initFormLogic() {
  const ENDPOINT = "https://script.google.com/macros/s/AKfycby1OYtOSLShDRw9Jlzv8HS09OehhUpuSKwjMOhV_dXELtp8wNdz_naZ72IyuBBjDGPwKg/exec";
  const days = ["月", "火", "水", "木", "金", "土", "日"];

  let currentFetchType = null;

  async function loadAndBuildGenres(type = 'shop') {
    const container = document.getElementById('lz-dynamic-category-area');
    if (!container) return;
    
    currentFetchType = type;
    container.innerHTML = '<div style="font-size:0.9rem; color:#888;">カテゴリーを取得中...</div>';

    try {
      const res = await fetch(`${ENDPOINT}?mode=form_genres&type=${type}&_t=${Date.now()}`);
      const json = await res.json();
      
      if (type !== currentFetchType) return; 

      if (!json.ok) throw new Error("取得失敗");
      const genres = json.items;
      
      let l1Html = '<div class="lz-choice-flex">';
      let l2Html = '';

      Object.keys(genres).forEach((l1, idx) => {
        const baseId = `gen-${idx}`;
        const isRootOther = l1 === '大カテゴリその他' || l1 === 'その他';
        const idAttr = isRootOther ? 'id="catRootOtherCheck"' : '';
        
        l1Html += `<label class="lz-choice-item"><input type="checkbox" name="cat_l1" value="${l1}" ${idAttr} data-subid="${baseId}"><span class="lz-choice-inner">${l1}</span></label>`;

        if (!isRootOther) {
          l2Html += `<div id="sub-${baseId}" class="lz-dynamic-sub-area" style="display:none;"><label class="lz-label" style="font-size:1.1rem; color:#5b3a1e;">${l1}のジャンル</label><div class="lz-choice-flex">`;
          genres[l1].forEach(l2 => {
            const isOther = l2.includes('その他');
            l2Html += `<label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cat_${baseId}" value="${l2}" class="${isOther ? 'lz-sub-trigger' : ''}"><span class="lz-choice-inner">${l2}</span></label>`;
          });
          l2Html += `</div><input type="text" name="cat_${baseId}_val" class="lz-input lz-sub-other-field" style="display:none;" placeholder="具体的な内容をご記入ください"></div>`;
        }
      });

      let finalHtml = l1Html + '</div>' + l2Html;
      finalHtml += `<div id="sub-cat-root-other" class="lz-dynamic-sub-area" style="display:none; border-left-color: #cf3a3a;"><label class="lz-label">カテゴリーの詳細（自由記述）</label><input type="text" name="cat_root_other_val" class="lz-input" placeholder="具体的にご記入ください"></div>`;
      
      container.innerHTML = finalHtml;

      const buildChips = (targetId, list, namePrefix) => {
        const area = document.getElementById(targetId);
        if (!area || !list) return;

        area.innerHTML = list.map(item => `<label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="${namePrefix}" value="${item}"><span class="lz-choice-inner">${item}</span></label>`).join('') + 
        `<label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="${namePrefix}" value="その他" class="pr-other-trigger" data-target="${targetId === 'area-apple-varieties' ? 'pr-variety-other-input' : 'pr-product-other-input'}"><span class="lz-choice-inner">その他</span></label>`;

        area.querySelectorAll('.pr-other-trigger').forEach(chk => {
          chk.onchange = (e) => {
            const inputEl = document.getElementById(e.target.dataset.target);
            if (inputEl) inputEl.style.display = e.target.checked ? 'block' : 'none';
          };
        });
      };

      buildChips('area-apple-varieties', json.appleVarieties, 'pr_variety');
      buildChips('area-apple-products', json.appleProducts, 'pr_product');

      bindDynamicEvents();
    } catch (e) { 
      container.innerHTML = '<div style="color:#cf3a3a;">カテゴリーの取得に失敗しました。</div>'; 
    }
  }

  function bindDynamicEvents() {
    document.getElementsByName('cat_l1').forEach(c => {
      c.onchange = (e) => {
        const targetId = e.target.getAttribute('data-subid');
        const el = document.getElementById(`sub-${targetId}`);
        if (el) el.style.display = e.target.checked ? 'flex' : 'none';

        const otherRoot = document.getElementById('sub-cat-root-other');
        const isOtherChecked = Array.from(document.getElementsByName('cat_l1'))
          .some(i => (i.value === '大カテゴリその他' || i.value === 'その他') && i.checked);
        if (otherRoot) otherRoot.style.display = isOtherChecked ? 'flex' : 'none';
      };
    });

    document.querySelectorAll('.lz-sub-trigger').forEach(trigger => {
      trigger.onchange = (e) => {
        const parent = e.target.closest('.lz-dynamic-sub-area');
        const otherInput = parent ? parent.querySelector('.lz-sub-other-field') : null;
        if(otherInput) otherInput.style.display = e.target.checked ? 'block' : 'none';
      };
    });
  }

  const customBody = document.getElementById('customSchedBody');
  if (customBody) {
    days.forEach(d => {
      const tr = document.createElement('tr'); tr.id = `row-${d}`;
      tr.innerHTML = `
        <td><strong>${d}曜日</strong></td>
        <td data-label="休業"><input type="checkbox" name="c_closed_${d}" class="lz-closed-trigger"></td>
        <td data-label="開店時間"><div class="lz-time-box">${utils.createTimeSelectorHTML('c_s_'+d)}</div></td>
        <td data-label="閉店時間"><div class="lz-time-box">${utils.createTimeSelectorHTML('c_e_'+d)}</div></td>
      `;
      customBody.appendChild(tr);

      const trigger = tr.querySelector('.lz-closed-trigger');
      const timeBoxes = tr.querySelectorAll('.lz-time-box');
      trigger.onchange = (e) => {
        const isClosed = e.target.checked;
        tr.style.opacity = isClosed ? "0.4" : "1";
        timeBoxes.forEach(box => {
          box.classList.toggle('is-disabled', isClosed);
          box.querySelectorAll('select').forEach(sel => sel.disabled = isClosed);
        });
      };
    });
  }

  const simpleBox = document.getElementById('box-simple-days');
  if (simpleBox) {
    days.forEach(d => {
      const l = document.createElement('label'); l.className = 'lz-day-chip';
      l.innerHTML = `<input type="checkbox" name="simple_days" value="${d}"><span class="lz-day-text">${d}</span>`;
      simpleBox.appendChild(l);
    });
  }

  const setHtml = (id, html) => { const el = document.getElementById(id); if(el) el.innerHTML = html; };
  setHtml('sel-simple-start', utils.createTimeSelectorHTML('simple_s'));
  setHtml('sel-simple-end', utils.createTimeSelectorHTML('simple_e'));
  setHtml('sel-ev-s', utils.createTimeSelectorHTML('ev_s'));
  setHtml('sel-ev-e', utils.createTimeSelectorHTML('ev_e'));

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

  const typeSelect = document.getElementById('art_type_select');
  const fieldsContainer = document.getElementById('article-fields-container');
  const lblTitle = document.getElementById('lbl-title');
  const lblLead = document.getElementById('lbl-lead');
  const inpTitle = document.getElementById('inp-title');
  const inpLead = document.getElementsByName('art_lead')[0];
  const inpBody = document.getElementsByName('art_body')[0];

  function updateTypeView() {
    if (!typeSelect) return;
    const type = typeSelect.value;
    const url = new URL(window.location);

    if (!type || type === "") { 
      if (fieldsContainer) fieldsContainer.style.display = 'none'; 
      url.searchParams.delete('type');
      window.history.replaceState({}, '', url.pathname + url.search);
      return; 
    }

    if (fieldsContainer) fieldsContainer.style.display = 'flex';
    url.searchParams.set('type', type);
    window.history.replaceState({}, '', url.pathname + url.search);

    const lblDynCat = document.getElementById('lbl-dynamic-cat');
    if (lblDynCat) {
      lblDynCat.textContent = catLabels[type] || catLabels.shop;
    }

    loadAndBuildGenres(type);

    const toggle = (id, cond) => { const el = document.getElementById(id); if(el) el.style.display = cond ? 'flex' : 'none'; };
    
    toggle('pane-shop-detail', type === 'shop');
    toggle('pane-event-detail', type === 'event');
    toggle('pane-producer-detail', type === 'producer');
    toggle('ev-venue-box', type === 'event' || type === 'other');
    toggle('box-writing-assist', type !== 'other');

    if (type === 'shop') {
      if(lblTitle) lblTitle.textContent = "店名・施設名"; 
      if(lblLead) lblLead.textContent = "お店の概要";
      if(inpTitle) inpTitle.placeholder = "正式な店舗名をご記入ください";
      if(inpLead) inpLead.placeholder = "お店の特徴や魅力を100文字以内で";
      if(inpBody) inpBody.placeholder = "メニュー、こだわり、サービス内容などを詳しく教えてください";
    } else if (type === 'event') {
      if(lblTitle) lblTitle.textContent = "イベント名"; 
      if(lblLead) lblLead.textContent = "イベントの概要";
      if(inpTitle) inpTitle.placeholder = "イベント名称をご記入ください";
      if(inpLead) inpLead.placeholder = "どんなイベントか一言で！";
      if(inpBody) inpBody.placeholder = "当日の内容、タイムスケジュール、参加方法などの詳細を教えてください";
    } else if (type === 'producer') {
      if(lblTitle) lblTitle.textContent = "農園・団体名"; 
      if(lblLead) lblLead.textContent = "生産者の概要";
      if(inpTitle) inpTitle.placeholder = "正式な屋号や農園名をご記入ください";
      if(inpLead) inpLead.placeholder = "栽培へのこだわりや農園の特徴を一言で";
      if(inpBody) inpBody.placeholder = "農園の歴史、栽培している品種の想い、購入方法などを教えてください";
    } else {
      if(lblTitle) lblTitle.textContent = "記事タイトル"; 
      if(lblLead) lblLead.textContent = "記事の概要";
      if(inpTitle) inpTitle.placeholder = "読みたくなるタイトルをご記入ください";
      if(inpLead) inpLead.placeholder = "この記事で伝えたいことを100文字以内で";
      if(inpBody) inpBody.placeholder = "町の発見、インタビュー、体験談など自由に詳しく書いてください";
    }

    const isShop = type === 'shop';
    const isEvent = type === 'event';
    const zipInp = document.getElementById('zipCode');
    const addrInp = document.getElementById('addressField');
    const zipBadge = document.getElementById('zipBadge');
    const addrBadge = document.getElementById('addrBadge');
    const lblNotes = document.getElementById('lbl-notes');

    if (zipInp && addrInp && zipBadge && addrBadge) {
      zipInp.required = isShop;
      addrInp.required = isShop;
      zipBadge.textContent = isShop ? '必須' : '任意';
      addrBadge.textContent = isShop ? '必須' : '任意';
      zipBadge.style.background = isShop ? '#cf3a3a' : '#999';
      addrBadge.style.background = isShop ? '#cf3a3a' : '#999';
    }

    const venueBox = document.getElementById('ev-venue-box');
    if (venueBox) {
      const venueLabel = venueBox.querySelector('.lz-label');
      if (venueLabel) {
        const labelText = type === 'other' ? '関連する場所の名称' : '会場名';
        venueLabel.innerHTML = `<span class="lz-badge opt" style="background:#999;">任意</span> ${labelText}`;
      }
      const venueInp = venueBox.querySelector('input');
      if (venueInp) {
        venueInp.placeholder = type === 'other' ? '例：いいづなコネクトEAST' : '例：飯綱ふれあいパーク';
      }
    }

    if (lblNotes) {
      if (type === 'event') lblNotes.textContent = '会場に関する注意事項';
      else if (type === 'shop') lblNotes.textContent = '店舗/施設に関する注意事項';
      else if (type === 'producer') lblNotes.textContent = '農場訪問時の注意事項（防疫等）';
      else lblNotes.textContent = '場所に関する注意事項';
    }

    const lblInqHead = document.getElementById('lbl-inquiry-head');
    toggle('ev-org-field', isEvent); 
    if (lblInqHead) {
      lblInqHead.textContent = isEvent ? "主催・お問い合わせ先" : "問い合わせ先（公開）";
      lblInqHead.style.display = 'block';
    }
    // 🍎 追加：タイプ切り替え時に生産者のオプション入力をリセットして隠す
    if (type !== 'producer') {
      const invoiceNum = document.getElementById('pr-invoice-num-box');
      if (invoiceNum) invoiceNum.style.display = 'none';
      ['pr-crop-fruit-input', 'pr-crop-veg-input', 'pr-crop-other-input'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
    }
  }

  // --- 🍎 ここから下がイベント登録・初期化の重要セクション ---

  // 1. SNS・問い合わせ項目のイベント登録（先に登録する）
  const snsBox = document.getElementById('box-sns-links');
  if (snsBox) {
    snsBox.addEventListener('change', (e) => {
      if (e.target.name === 'sns_trigger') {
        const triggers = document.getElementsByName('sns_trigger');
        const checkedVals = Array.from(triggers).filter(i => i.checked).map(i => i.value);
        ['home', 'ec', 'rel', 'ig', 'fb', 'x', 'line', 'tt'].forEach(t => {
          const targetInp = document.getElementById(`f-${t}`);
          if (targetInp) {
            targetInp.style.display = checkedVals.includes(t) ? (t === 'rel' ? 'flex' : 'block') : 'none';
          }
        });
      }
    });
  }

  // --- 🍎 ここから追加：栽培品目とインボイスの連動 ---
  // 生産者のインボイス番号表示切り替え
  document.querySelectorAll('.pr-invoice-trigger').forEach(r => {
    r.addEventListener('change', (e) => {
      const numBox = document.getElementById('pr-invoice-num-box');
      if (numBox) numBox.style.display = e.target.value === 'yes' ? 'block' : 'none';
    });
  });

  // りんご以外の作物の詳細入力切り替え
  document.querySelectorAll('.pr-crop-trigger').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const val = e.target.value;
      let targetId = '';
      if (val === 'fruit') targetId = 'pr-crop-fruit-input';
      if (val === 'vegetable') targetId = 'pr-crop-veg-input';
      if (val === 'other') targetId = 'pr-crop-other-input';
      
      const targetInput = document.getElementById(targetId);
      if (targetInput) targetInput.style.display = e.target.checked ? 'block' : 'none';
    });
  });


  document.getElementsByName('cm').forEach(c => {
    c.onchange = () => {
      const v = Array.from(document.getElementsByName('cm')).filter(i => i.checked).map(i => i.value);
      const cmT = (id, cond) => { const el = document.getElementById(id); if(el) el.style.display = cond ? 'flex' : 'none'; };
      cmT('cm-form-box', v.includes('form')); cmT('cm-email-box', v.includes('email'));
      cmT('cm-tel-box', v.includes('tel')); cmT('cm-other-box', v.includes('other'));
      const sync = document.getElementById('syncField');
      if(sync) sync.style.display = v.includes('email') ? 'flex' : 'none';
    };
  });

  // 2. 登録内容（タイプ）の初期化
  const urlParams = new URLSearchParams(window.location.search);
  const typeFromUrl = urlParams.get('type');
  if (typeSelect) {
    if (typeFromUrl) typeSelect.value = typeFromUrl;
    typeSelect.onchange = updateTypeView;
    updateTypeView();
  }

  // 3. 事務局代行の初期化
  const chkAssist = document.getElementById('chk-writing-assist');
  const msgAssist = document.getElementById('msg-writing-assist');
  if (chkAssist && inpLead && inpBody) {
    const fieldLead = inpLead.closest('.lz-field');
    const fieldBody = inpBody.closest('.lz-field');
    const syncAssist = () => {
      const isHandled = chkAssist.checked;
      if (fieldLead) fieldLead.style.display = isHandled ? 'none' : 'flex';
      if (fieldBody) fieldBody.style.display = isHandled ? 'none' : 'flex';
      inpLead.required = !isHandled;
      inpBody.required = !isHandled;
      if(msgAssist) msgAssist.style.display = isHandled ? "block" : "none";
    };
    chkAssist.onchange = syncAssist; 
    syncAssist();
  }

  // 4. その他のUIイベント（リンク追加、メール同期、画像等）
  const relUrl1 = document.getElementById('rel_url1');
  const relTitle1 = document.getElementById('rel_title1');
  const rel2Row = document.getElementById('rel-link2-row');
  if (relUrl1 && relTitle1 && rel2Row) {
    const toggleRel2 = () => {
      const hasContent = relUrl1.value.trim() !== "" || relTitle1.value.trim() !== "";
      rel2Row.style.display = hasContent ? 'grid' : 'none';
    };
    relUrl1.oninput = toggleRel2;
    relTitle1.oninput = toggleRel2;
  }

  const pubMail = document.getElementById('pubEmail');
  const admMail = document.getElementById('adminEmail');
  const syncCheck = document.getElementById('syncCheck');
  const syncField = document.getElementById('syncField');
  if (pubMail && admMail && syncCheck) {
    pubMail.addEventListener('input', () => {
      syncField.style.display = pubMail.value.trim().length > 0 ? "block" : "none";
      if (syncCheck.checked) admMail.value = pubMail.value;
    });
    syncCheck.addEventListener('change', () => {
      if (syncCheck.checked) {
        admMail.value = pubMail.value;
        admMail.style.background = "#f0f0f0";
        admMail.readOnly = true; 
      } else {
        admMail.style.background = "#fafafa";
        admMail.readOnly = false;
      }
    });
  }

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
}