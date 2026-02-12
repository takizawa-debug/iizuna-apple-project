/**
 * logic.js - 制御エンジン（i18n・Skeleton完全同期版）
 * 役割：ユーザー操作の検知、UIの動的変更、データの収集、API通信
 */
import { utils } from './utils.js';
import { i18n } from './i18n.js';
import { catLabels } from './templates.js';

export async function initFormLogic() {
  const ENDPOINT = "https://script.google.com/macros/s/AKfycby1OYtOSLShDRw9Jlzv8HS09OehhUpuSKwjMOhV_dXELtp8wNdz_naZ72IyuBBjDGPwKg/exec";
  const days = i18n.common.dayList; // 🍎 i18nから曜日リストを取得
  let currentFetchType = null;
  let uploadedFiles = []; // 🍎 画像管理用配列の維持

  // 要素のキャッシュ
  const typeSelect = document.getElementById('art_type_select');
  const fieldsContainer = document.getElementById('article-fields-container');
  const lblTitle = document.getElementById('lbl-title');
  const lblLead = document.getElementById('lbl-lead');
  const inpTitle = document.getElementById('inp-title');
  const inpLead = document.getElementsByName('art_lead')[0];
  const inpBody = document.getElementsByName('art_body')[0];

  /** 🍎 1. UI更新：i18nデータに基づく宣言型制御 */
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

    if (fieldsContainer) fieldsContainer.style.display = 'flex';
    url.searchParams.set('type', type);
    window.history.replaceState({}, '', url.pathname + url.search);

    // テキスト・ラベル・プレースホルダの一括反映
    const lblDynCat = document.getElementById('lbl-dynamic-cat');
    if (lblDynCat) lblDynCat.textContent = catLabels[type];
    
    lblTitle.textContent = set.title;
    lblLead.textContent = set.lead;
    inpLead.placeholder = set.leadPlaceholder || i18n.placeholders.art_lead;
    inpTitle.placeholder = i18n.placeholders.art_title || set.title;
    inpBody.placeholder = i18n.placeholders.art_body;
    if (document.getElementById('art_memo')) document.getElementById('art_memo').placeholder = i18n.placeholders.art_memo;
    if (document.getElementById('lbl-notes')) document.getElementById('lbl-notes').textContent = set.notes;

    // パネル出し分けと必須属性制御（旧版のtoggle強化版を継承）
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
    toggle('pane-farmer-detail', type === 'farmer');
    toggle('ev-venue-box', type === 'event' || type === 'other');
    toggle('ev-org-field', type === 'event');
    toggle('box-writing-assist', type !== 'other');

    // 住所必須バッジ制御
    const isShop = type === 'shop';
    const zipBadge = document.getElementById('zipBadge'), addrBadge = document.getElementById('addrBadge');
    const zipInp = document.getElementById('zipCode'), addrInp = document.getElementById('addressField');
    if (zipBadge && addrBadge && zipInp && addrInp) {
      zipBadge.style.display = addrBadge.style.display = isShop ? 'inline-block' : 'none';
      zipInp.required = addrInp.required = isShop;
      zipBadge.textContent = addrBadge.textContent = i18n.badges.required;
    }

    // 会場名ラベル調整
    const venueBox = document.getElementById('ev-venue-box');
    if (venueBox) {
      const vLabel = venueBox.querySelector('.lz-label');
      if (vLabel) vLabel.textContent = (type === 'other') ? i18n.labels.other_venue_name : i18n.labels.ev_venue_name;
    }

    // タイプ別エリアの強制リセット
   if (type !== 'farmer') {
      const invBox = document.getElementById('pr-invoice-num-box');
      if (invBox) invBox.style.display = 'none';
      ['pr-crop-fruit-input', 'pr-crop-veg-input', 'pr-crop-other-input'].forEach(id => {
        const el = document.getElementById(id); if (el) el.style.display = 'none';
      });
    }
    if (type !== 'event') {
      const evEnd = document.getElementById('ev-end-date-box'); if (evEnd) evEnd.style.display = 'none';
    }
    if (type !== 'shop') {
      const sSimple = document.getElementById('shop-simple'), sCustom = document.getElementById('shop-custom');
      if (sSimple) sSimple.style.display = 'none'; if (sCustom) sCustom.style.display = 'none';
    }

    loadAndBuildGenres(type);
  }

  /** 🍎 2. カテゴリー生成（旧版ロジック完全継承・i18n同期） */
  async function loadAndBuildGenres(type) {
    const container = document.getElementById('lz-dynamic-category-area');
    if (!container) return;
    currentFetchType = type;
    container.innerHTML = `<div style="font-size:0.9rem; color:#888;">${i18n.status.loading_cat}</div>`;
    try {
      const res = await fetch(`${ENDPOINT}?mode=form_genres&type=${type}&_t=${Date.now()}`);
      const json = await res.json();
      if (type !== currentFetchType) return;
      if (!json.ok) throw new Error();
      
      let l1Html = '<div class="lz-choice-flex">';
      let l2Html = '';
      Object.keys(json.items).forEach((l1, idx) => {
        const baseId = `gen-${idx}`;
        const isRootOther = l1 === i18n.common.cat_other_label || l1 === i18n.common.other_label;
        const idAttr = isRootOther ? 'id="catRootOtherCheck"' : '';
        
        l1Html += `<label class="lz-choice-item"><input type="checkbox" name="cat_l1" value="${l1}" ${idAttr} data-subid="${baseId}"><span class="lz-choice-inner">${l1}</span></label>`;

        if (!isRootOther) {
          l2Html += `<div id="sub-${baseId}" class="lz-dynamic-sub-area" style="display:none;"><label class="lz-label" style="font-size:1.1rem; color:#5b3a1e;">${l1}${i18n.labels.genre_suffix}</label><div class="lz-choice-flex">`;
          json.items[l1].forEach(l2 => {
            const isOther = l2.includes(i18n.common.other_label);
            l2Html += `<label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cat_${baseId}" value="${l2}" class="${isOther ? 'lz-sub-trigger' : ''}"><span class="lz-choice-inner">${l2}</span></label>`;
          });
          l2Html += `</div><input type="text" name="cat_${baseId}_val" class="lz-input lz-sub-other-field" style="display:none;" placeholder="${i18n.placeholders.genre_detail}"></div>`;
        }
      });
      container.innerHTML = l1Html + '</div>' + l2Html + `<div id="sub-cat-root-other" class="lz-dynamic-sub-area" style="display:none; border-left-color: #cf3a3a;"><label class="lz-label">${i18n.labels.genre_free}</label><input type="text" name="cat_root_other_val" class="lz-input" placeholder="${i18n.placeholders.genre_free}"></div>`;
      
      // 品種・加工品チップ生成
      const buildChips = (targetId, list, namePrefix) => {
        const area = document.getElementById(targetId);
        if (!area || !list) return;
        area.innerHTML = list.map(item => `<label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="${namePrefix}" value="${item}"><span class="lz-choice-inner">${item}</span></label>`).join('') + 
        `<label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="${namePrefix}" value="${i18n.common.other_label}" class="pr-other-trigger" data-target="${targetId === 'area-apple-varieties' ? 'pr-variety-other-input' : 'pr-product-other-input'}"><span class="lz-choice-inner">${i18n.common.other_label}</span></label>`;
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
    } catch (e) { container.innerHTML = `<div style="color:#cf3a3a;">${i18n.status.error_cat}</div>`; }
  }

  function bindDynamicEvents() {
    document.getElementsByName('cat_l1').forEach(c => {
      c.onchange = (e) => {
  const targetId = e.target.getAttribute('data-subid');
  const el = document.getElementById(`sub-${targetId}`);
  if (el) {
    const isChecked = e.target.checked;
    el.style.display = isChecked ? 'flex' : 'none';
    // 🍎 追加：チェックを外した時、子要素の入力をすべてリセット
    if (!isChecked) {
      el.querySelectorAll('input[type="checkbox"]').forEach(i => i.checked = false);
      const otherField = el.querySelector('.lz-sub-other-field');
      if (otherField) { otherField.style.display = 'none'; otherField.value = ''; }
    }
  }
        const otherRoot = document.getElementById('sub-cat-root-other');
        const isOtherChecked = Array.from(document.getElementsByName('cat_l1')).some(i => (i.value === i18n.common.cat_other_label || i.value === i18n.common.other_label) && i.checked);
        if (otherRoot) otherRoot.style.display = isOtherChecked ? 'flex' : 'none';
      };
    });
    document.querySelectorAll('.lz-sub-trigger').forEach(trigger => {
      trigger.onchange = (e) => {
        const inp = e.target.closest('.lz-dynamic-sub-area').querySelector('.lz-sub-other-field');
        if(inp) inp.style.display = e.target.checked ? 'block' : 'none';
      };
    });
  }

  /** 🍎 3. 各種イベントバインド（旧版の全リスナーを網羅） */
  
  // 曜日別設定テーブル生成
  const customBody = document.getElementById('customSchedBody');
  if (customBody) {
    days.forEach(d => {
      const tr = document.createElement('tr'); tr.id = `row-${d}`;
      tr.innerHTML = `<td><strong>${d}${i18n.labels.day_suffix}</strong></td><td data-label="${i18n.labels.closed}"><input type="checkbox" name="c_closed_${d}" class="lz-closed-trigger"></td><td data-label="${i18n.labels.open_time}"><div class="lz-time-box">${utils.createTimeSelectorHTML('c_s_'+d)}</div></td><td data-label="${i18n.labels.close_time}"><div class="lz-time-box">${utils.createTimeSelectorHTML('c_e_'+d)}</div></td>`;
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

  // 簡易曜日チップ
  const simpleBox = document.getElementById('box-simple-days');
  if (simpleBox) {
    days.forEach(d => {
      const l = document.createElement('label'); l.className = 'lz-day-chip';
      l.innerHTML = `<input type="checkbox" name="simple_days" value="${d}"><span class="lz-day-text">${d}</span>`;
      simpleBox.appendChild(l);
    });
  }

  // 時間セレクター注入
  const setHtml = (id, html) => { const el = document.getElementById(id); if(el) el.innerHTML = html; };
  setHtml('sel-simple-start', utils.createTimeSelectorHTML('simple_s'));
  setHtml('sel-simple-end', utils.createTimeSelectorHTML('simple_e'));
  setHtml('sel-ev-s', utils.createTimeSelectorHTML('ev_s'));
  setHtml('sel-ev-e', utils.createTimeSelectorHTML('ev_e'));

  // タブ切り替えと必須属性管理
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

  // 郵便番号検索
  const zipBtn = document.getElementById('zipBtnAction');
  if (zipBtn) zipBtn.onclick = async () => {
    const zip = document.getElementById('zipCode').value;
    if (!zip) return alert(i18n.alerts.zip_empty);
    try { document.getElementById('addressField').value = await utils.fetchAddress(zip); } catch(e) { alert(e.message); }
  };

  // SNSトリガー連動
  const snsBox = document.getElementById('box-sns-links');
  if (snsBox) {
    snsBox.addEventListener('change', (e) => {
      if (e.target.name === 'sns_trigger') {
        const checkedVals = Array.from(document.getElementsByName('sns_trigger')).filter(i => i.checked).map(i => i.value);
        ['home', 'ec', 'rel', 'ig', 'fb', 'x', 'line', 'tt'].forEach(t => {
          const targetInp = document.getElementById(`f-${t}`);
          if (targetInp) targetInp.style.display = checkedVals.includes(t) ? (t === 'rel' ? 'flex' : 'block') : 'none';
        });
      }
    });
  }

  // 生産者インボイス・作物連動
  document.querySelectorAll('.pr-invoice-trigger').forEach(r => {
    r.addEventListener('change', (e) => {
      const numBox = document.getElementById('pr-invoice-num-box');
      if (numBox) numBox.style.display = e.target.value === 'yes' ? 'block' : 'none';
    });
  });
  document.querySelectorAll('.pr-crop-trigger').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const targetMap = { fruit: 'pr-crop-fruit-input', vegetable: 'pr-crop-veg-input', other: 'pr-crop-other-input' };
      const targetInput = document.getElementById(targetMap[e.target.value]);
      if (targetInput) targetInput.style.display = e.target.checked ? 'block' : 'none';
    });
  });

  // イベント期間連動
  const evEndDateBox = document.getElementById('ev-end-date-box');
  document.getElementsByName('ev_period_type').forEach(r => {
    r.addEventListener('change', (e) => { if(evEndDateBox) evEndDateBox.style.display = e.target.value === 'period' ? 'flex' : 'none'; });
  });

// 🍎 修正：日付逆転チェック（入力時）
const evS = document.getElementsByName('ev_sdate')[0];
const evE = document.getElementsByName('ev_edate')[0];

const validateEventDates = () => {
  if (evS.value && evE.value && evE.value < evS.value) {
    alert("終了日は開始日以降の日付を選択してください。");
    evE.value = ""; // 不正な方を消去
  }
};

if (evS && evE) {
  evS.addEventListener('change', validateEventDates);
  evE.addEventListener('change', validateEventDates);
}

  // 店舗モード連動
  document.getElementsByName('shop_mode').forEach(r => {
    r.onchange = (e) => {
      const s = document.getElementById('shop-simple'), c = document.getElementById('shop-custom');
      if (s) s.style.display = e.target.value === 'simple' ? 'block' : 'none';
      if (c) c.style.display = e.target.value === 'custom' ? 'block' : 'none';
    };
  });

  // 問い合わせ方法連動
  document.getElementsByName('cm').forEach(c => {
    c.onchange = () => {
      const v = Array.from(document.getElementsByName('cm')).filter(i => i.checked).map(i => i.value);
      ['form', 'email', 'tel', 'other'].forEach(m => {
        const el = document.getElementById(`cm-${m}-box`);
        if (el) el.style.display = v.includes(m) ? 'flex' : 'none';
      });
      const sync = document.getElementById('syncField');
      if (sync) sync.style.display = v.includes('email') ? 'flex' : 'none';
    };
  });

  // 事務局代行連動
  const chkAssist = document.getElementById('chk-writing-assist');
  if (chkAssist && inpLead && inpBody) {
    const fieldLead = inpLead.closest('.lz-field'), fieldBody = inpBody.closest('.lz-field');
    const syncAssist = () => {
      const isHandled = chkAssist.checked;
      if (fieldLead) fieldLead.style.display = isHandled ? 'none' : 'flex';
      if (fieldBody) fieldBody.style.display = isHandled ? 'none' : 'flex';
      inpLead.required = inpBody.required = !isHandled;
      const msg = document.getElementById('msg-writing-assist');
      if (msg) msg.style.display = isHandled ? "block" : "none";
    };
    chkAssist.onchange = syncAssist; syncAssist();
  }

  // 関連リンク自動追加
  const relUrl1 = document.getElementById('rel_url1'), relTitle1 = document.getElementById('rel_title1'), rel2Row = document.getElementById('rel-link2-row');
  if (relUrl1 && relTitle1 && rel2Row) {
    const toggleRel2 = () => { rel2Row.style.display = (relUrl1.value.trim() !== "" || relTitle1.value.trim() !== "") ? 'grid' : 'none'; };
    relUrl1.oninput = relTitle1.oninput = toggleRel2;
  }

  // メール同期
  const pubMail = document.getElementById('pubEmail'), admMail = document.getElementById('adminEmail'), syncCheck = document.getElementById('syncCheck');
  if (pubMail && admMail && syncCheck) {
    pubMail.addEventListener('input', () => {
      const syncField = document.getElementById('syncField');
      if (syncField) syncField.style.display = pubMail.value.trim().length > 0 ? "block" : "none";
      if (syncCheck.checked) admMail.value = pubMail.value;
    });
    syncCheck.addEventListener('change', () => {
      if (syncCheck.checked) { admMail.value = pubMail.value; admMail.style.background = "#f0f0f0"; admMail.readOnly = true; } 
      else { admMail.style.background = "#fafafa"; admMail.readOnly = false; }
    });
  }

  // 画像プレビュー管理
  const imgInput = document.getElementById('art_images_input'), imgAddBtn = document.getElementById('imgAddBtn'), previewArea = document.getElementById('imgPreviewArea');
  if (imgAddBtn && imgInput) {
    imgAddBtn.onclick = () => imgInput.click();
    imgInput.onchange = (e) => {
      Array.from(e.target.files).forEach(file => {
        if (uploadedFiles.length >= 6) return;
        uploadedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          const div = document.createElement('div'); div.className = 'lz-img-container';
          div.innerHTML = `<img src="${event.target.result}"><div class="lz-img-remove">×</div>`;
          div.querySelector('.lz-img-remove').onclick = () => {
            div.remove(); uploadedFiles = uploadedFiles.filter(f => f !== file);
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

  // 送信処理（画像Base64変換含む）
  const form = document.getElementById('lz-article-form');

  // 🍎 修正後：送信処理（バリデーション・タイポ・括弧エラー解決版）
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('.lz-send-btn');
      btn.disabled = true;
      btn.textContent = i18n.common.sending;

      try {
        const formData = new FormData(form);
        const payload = {};

        // 1. データの収集（バリデーションの前にまずこれを実行）
        formData.forEach((value, key) => {
          if (payload[key]) {
            if (!Array.isArray(payload[key])) payload[key] = [payload[key]];
            payload[key].push(value);
          } else {
            payload[key] = value;
          }
        });

        // 2. 🍎 修正：送信前バリデーション（データ収集後に実行することで正しく判定）
        if (payload.art_type === 'event' && payload.ev_sdate && payload.ev_edate) {
          if (payload.ev_edate < payload.ev_sdate) {
            alert("エラー：終了日は開始日以降の日付を選択してください。");
            btn.disabled = false;
            btn.textContent = i18n.common.sendBtn;
            return; // ここで中断
          }
        }

        // 3. 🍎 修正：曜日別設定のタイポ（e_e → e_m）
        days.forEach(d => {
          ['s_h', 's_m', 'e_h', 'e_m'].forEach(suffix => { // e_m に修正済み
            const key = `c_${suffix}_${d}`;
            if (!payload[key]) payload[key] = "";
          });
        });

        // 4. 必須配列フィールドの固定化
        const arrayFields = ['cat_l1', 'cm', 'sns_trigger', 'simple_days', 'pr_other_crops', 'pr_variety', 'pr_product'];
        Object.keys(payload).forEach(key => {
          if (key.startsWith('cat_gen-') || arrayFields.includes(key)) {
            if (!Array.isArray(payload[key])) payload[key] = [payload[key]];
          }
        });

        // 5. 画像データの付与（Base64変換）
        if (uploadedFiles.length > 0) {
          payload.images = await Promise.all(uploadedFiles.map(file => new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result);
            reader.readAsDataURL(file);
          })));
        }

        // 6. 添付ファイルの検知とBase64変換
        const docFileInput = form.querySelector('input[name="art_file"]');
        if (docFileInput && docFileInput.files.length > 0) {
          const docFile = docFileInput.files[0];
          payload.art_file_name = docFile.name.replace(/\s+/g, '_'); 
          payload.art_file_data = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result);
            reader.readAsDataURL(docFile);
          });
        }

        // 7. GASへ送信（JSON形式）
        const res = await fetch(ENDPOINT, {
          method: "POST",
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`Server status: ${res.status}`);
        const result = await res.json();
        
        if (result.ok) {
          alert(i18n.types[payload.art_type]?.label + " " + i18n.common.sendBtn + "に成功しました！"); 
          window.location.reload();
        } else {
          throw new Error(result.error || "Unknown Error");
        }

      } catch (err) {
        console.error("Submission failed:", err);
        alert(i18n.alerts.send_error + "\n理由: " + err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = i18n.common.sendBtn;
      }
    };
  }

  // 初期化実行
  const urlParams = new URLSearchParams(window.location.search);
  const typeFromUrl = urlParams.get('type');
  if (typeSelect) {
    if (typeFromUrl) typeSelect.value = typeFromUrl;
    typeSelect.onchange = updateTypeView;
    updateTypeView();
  }
}