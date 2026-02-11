/**
 * logic.js - 動的データ連動・UI最適化版
 */
import { utils } from './utils.js';
import { catLabels } from './templates.js';

export async function initFormLogic() {
  const ENDPOINT = "https://script.google.com/macros/s/AKfycby1OYtOSLShDRw9Jlzv8HS09OehhUpuSKwjMOhV_dXELtp8wNdz_naZ72IyuBBjDGPwKg/exec";
  const days = ["月", "火", "水", "木", "金", "土", "日"];

  let currentFetchType = null; // 🍎 要求管理用のフラグを追加

  async function loadAndBuildGenres(type = 'shop') {
    const container = document.getElementById('lz-dynamic-category-area');
    if (!container) return;
    
    currentFetchType = type; // 🍎 現在処理すべきタイプを記録
    container.innerHTML = '<div style="font-size:0.9rem; color:#888;">カテゴリーを取得中...</div>';

    try {
      // 🍎 ?_t= で独自URL化（キャッシュ回避）し、要求を確実化
      const res = await fetch(`${ENDPOINT}?mode=form_genres&type=${type}&_t=${Date.now()}`);
      const json = await res.json();
      
      // 🍎 重要：通信中に別のタブが押された（typeが変わった）場合、古いデータは破棄する
      if (type !== currentFetchType) return; 

      if (!json.ok) throw new Error("取得失敗");
      const genres = json.items;
      
      // 🍎 見出しは templates.js と updateTypeView で制御するため、ここではチップの枠のみ作る
      let l1Html = '<div class="lz-choice-flex">';
      let l2Html = '';

      // 大カテゴリとサブカテゴリを同時に組み立てる
      Object.keys(genres).forEach((l1, idx) => {
        const baseId = `gen-${idx}`;
        const isRootOther = l1 === '大カテゴリその他' || l1 === 'その他';
        const idAttr = isRootOther ? 'id="catRootOtherCheck"' : '';
        
        // 大カテゴリ（チップ）に data-subid を直接付与
        l1Html += `<label class="lz-choice-item"><input type="checkbox" name="cat_l1" value="${l1}" ${idAttr} data-subid="${baseId}"><span class="lz-choice-inner">${l1}</span></label>`;

        // サブカテゴリ（ジャンル）のエリアを作成
        if (!isRootOther) {
          l2Html += `<div id="sub-${baseId}" class="lz-dynamic-sub-area" style="display:none;"><label class="lz-label" style="font-size:1.1rem; color:#5b3a1e;">${l1}のジャンル</label><div class="lz-choice-flex">`;
          genres[l1].forEach(l2 => {
            const isOther = l2.includes('その他');
            l2Html += `<label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cat_${baseId}" value="${l2}" class="${isOther ? 'lz-sub-trigger' : ''}"><span class="lz-choice-inner">${l2}</span></label>`;
          });
          l2Html += `</div><input type="text" name="cat_${baseId}_val" class="lz-input lz-sub-other-field" style="display:none;" placeholder="具体的な内容をご記入ください"></div>`;
        }
      });

      // 🍎 外側の lz-field を閉じないよう 1つ </div> を減らす
      let finalHtml = l1Html + '</div>' + l2Html;
      
      // ルートの「その他」自由記述欄を追加
      finalHtml += `<div id="sub-cat-root-other" class="lz-dynamic-sub-area" style="display:none; border-left-color: #cf3a3a;"><label class="lz-label">カテゴリーの詳細（自由記述）</label><input type="text" name="cat_root_other_val" class="lz-input" placeholder="具体的にご記入ください"></div>`;
      
      container.innerHTML = finalHtml;

     // 🍎 品種・加工品チップ生成と「その他」連動
      const buildChips = (targetId, list, namePrefix) => {
        const area = document.getElementById(targetId);
        if (!area || !list) return;

        // チップのHTML生成
        area.innerHTML = list.map(item => `<label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="${namePrefix}" value="${item}"><span class="lz-choice-inner">${item}</span></label>`).join('') + 
        `<label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="${namePrefix}" value="その他" class="pr-other-trigger" data-target="${targetId === 'area-apple-varieties' ? 'pr-variety-other-input' : 'pr-product-other-input'}"><span class="lz-choice-inner">その他</span></label>`;

        // 「その他」のクリックイベントを個別にバインド
        area.querySelectorAll('.pr-other-trigger').forEach(chk => {
          chk.onchange = (e) => {
            const inputEl = document.getElementById(e.target.dataset.target);
            if (inputEl) inputEl.style.display = e.target.checked ? 'block' : 'none';
          };
        });
      };

      
      buildChips('area-apple-varieties', json.appleVarieties, 'pr_variety');
      buildChips('area-apple-products', json.appleProducts, 'pr_product');

      bindDynamicEvents(); // イベントを再バインド
    } catch (e) { 
      container.innerHTML = '<div style="color:#cf3a3a;">カテゴリーの取得に失敗しました。</div>'; 
    }
  }// 🍎 loadAndBuildGenres の閉じカッコを追加



  function bindDynamicEvents() {
    /* 🍎 全ての大カテゴリに対して一律で連動ロジックを設定 */
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

  // --- 🍎 2. 曜日別設定：休業連動（無効化） ＆ スマホカード化 ---
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

  /* logic.js の initFormLogic 内に追記 */

  // 🍎 イベントの「1日のみ/期間あり」切り替えロジック
  const evPeriodRadios = document.getElementsByName('ev_period_type');
  const evEndDateBox = document.getElementById('ev-end-date-box');
  
  if (evPeriodRadios && evEndDateBox) {
    evPeriodRadios.forEach(r => {
      r.addEventListener('change', (e) => {
        evEndDateBox.style.display = e.target.value === 'period' ? 'flex' : 'none';
      });
    });
  }

  // 🍎 生産者のインボイス番号表示切り替え
  document.querySelectorAll('.pr-invoice-trigger').forEach(r => {
    r.addEventListener('change', (e) => {
      const numBox = document.getElementById('pr-invoice-num-box');
      if (numBox) numBox.style.display = e.target.value === 'yes' ? 'block' : 'none';
    });
  });

// 🍎 りんご以外の作物の詳細入力切り替え
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


function updateTypeView() {
    const type = typeSelect.value;
    const url = new URL(window.location); // 🍎 先にURLオブジェクトを作成

    // 🍎 「未選択」の場合の処理
    if (!type || type === "") { 
      if (fieldsContainer) fieldsContainer.style.display = 'none'; 
      
      url.searchParams.delete('type'); // 🍎 URLから type パラメータを削除
      window.history.replaceState({}, '', url.pathname + url.search); // 🍎 パラメータなしのURLに更新
      return; 
    }

    // 🍎 選択されている場合の処理
    if (fieldsContainer) fieldsContainer.style.display = 'flex';

    url.searchParams.set('type', type); // 🍎 URLに type をセット
    window.history.replaceState({}, '', url.pathname + url.search); // 🍎 パラメータありのURLに更新

    // 🍎 タブ切り替えと同時に見出しを即座に更新...
    const lblDynCat = document.getElementById('lbl-dynamic-cat');
    if (lblDynCat) {
      lblDynCat.textContent = catLabels[type] || catLabels.shop;
    }

    loadAndBuildGenres(type);

    const toggle = (id, cond) => { const el = document.getElementById(id); if(el) el.style.display = cond ? 'flex' : 'none'; };
    
    // --- パネルの出し分け ---
    toggle('pane-shop-detail', type === 'shop');
    toggle('pane-event-detail', type === 'event');
    toggle('pane-producer-detail', type === 'producer');

    toggle('ev-venue-box', type === 'event' || type === 'other');

    // 🍎 記事登録(other)以外の場合のみ、代行オプションを表示
    toggle('box-writing-assist', type !== 'other');

    // --- 基本情報のラベル・切替 ---
    if (type === 'shop') {
      if(lblTitle) lblTitle.textContent = "店名・施設名"; 
      if(lblLead) lblLead.textContent = "お店の概要";
      if(inpTitle) inpTitle.placeholder = "正式な店舗名をご記入ください";
    } else if (type === 'event') {
      if(lblTitle) lblTitle.textContent = "イベント名"; 
      if(lblLead) lblLead.textContent = "イベントの概要";
      if(inpTitle) inpTitle.placeholder = "イベント名称をご記入ください";
      } else if (type === 'producer') { // 🍎追加
      if(lblTitle) lblTitle.textContent = "農園・団体名"; 
      if(lblLead) lblLead.textContent = "生産者の概要";
      if(inpTitle) inpTitle.placeholder = "正式な屋号や農園名をご記入ください";
    } else {
      if(lblTitle) lblTitle.textContent = "記事タイトル"; 
      if(lblLead) lblLead.textContent = "記事の概要";
      if(inpTitle) inpTitle.placeholder = "読みたくなるタイトルをご記入ください";
    }

    // --- 場所情報の制御 ---
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

// 🍎 会場名のラベル名をタイプによって切り替える
    const venueBox = document.getElementById('ev-venue-box');
    if (venueBox) {
      const venueLabel = venueBox.querySelector('.lz-label');
      // バッジを残しつつテキストだけ書き換え
      const labelText = type === 'other' ? '関連する場所の名称' : '会場名';
      venueLabel.innerHTML = `<span class="lz-badge opt" style="background:#999;">任意</span> ${labelText}`;
      
      // プレースホルダも調整（任意）
      const venueInp = venueBox.querySelector('input');
      if (venueInp) {
        venueInp.placeholder = type === 'other' ? '例：いいづなコネクトEAST' : '例：飯綱ふれあいパーク';
      }
    }

    // --- 🍎 注意事項ラベルの最適化 ---
    if (lblNotes) {
      if (type === 'event') lblNotes.textContent = '会場に関する注意事項';
      else if (type === 'shop') lblNotes.textContent = '店舗/施設に関する注意事項';
      else if (type === 'producer') lblNotes.textContent = '農場訪問時の注意事項（防疫等）';
      else lblNotes.textContent = '場所に関する注意事項';
    }

    // --- 🍎 主催者・問い合わせセクションの見出し切替 ---
    const lblInqHead = document.getElementById('lbl-inquiry-head');
    
    // 主催者名（ev-org-field）はイベント時のみ。セクション（SNS・問い合わせ方法）は常に表示
    toggle('ev-org-field', isEvent); 
    
    if (lblInqHead) {
      // イベントなら主催者を含めた見出し、それ以外なら問い合わせ先のみの見出しにする
      lblInqHead.textContent = isEvent ? "主催・お問い合わせ先" : "問い合わせ先（公開）";
      lblInqHead.style.display = 'block'; // 確実に表示させる
    }
  }


  
  // 🍎 ページ読み込み時にURLパラメータ (?type=...) があれば反映させる
const urlParams = new URLSearchParams(window.location.search);
  const typeFromUrl = urlParams.get('type');
  if (typeFromUrl) {
    typeSelect.value = typeFromUrl; // 直接値をセット
  }

// 🍎 イベントリスナーの登録
  typeSelect.onchange = updateTypeView;
  updateTypeView();

  /* 🍎 選択肢に rel を追加し、入力検知ロジックを連結 */
const snsTriggers = document.getElementsByName('sns_trigger');
snsTriggers.forEach(trigger => {
  trigger.onchange = () => {
    const vals = Array.from(snsTriggers).filter(i => i.checked).map(i => i.value);
    // 関連リンク（rel）はflex配置にするため条件分け
    ['home', 'ec', 'rel', 'ig', 'fb', 'x', 'line','tt'].forEach(t => {
      const box = document.getElementById(`f-${t}`);
      if(box) box.style.display = vals.includes(t) ? (t === 'rel' ? 'flex' : 'block') : 'none';
    });
  };
});

// 🍎 関連リンクの2件目自動表示ロジック
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

/* logic.js の既存のメール同期処理を以下のコードに置き換え */

  // --- 🍎 メールアドレス同期：掲載用メールがある場合のみ表示・連動 ---
  const pubMail = document.getElementById('pubEmail');
  const admMail = document.getElementById('adminEmail');
  const syncCheck = document.getElementById('syncCheck');
  const syncField = document.getElementById('syncField');

  if (pubMail && admMail && syncCheck) {
    const updateSyncVisibility = () => {
      // 掲載用メールに値がある場合のみボタンを表示
      const hasValue = pubMail.value.trim().length > 0;
      syncField.style.display = hasValue ? "block" : "none";
      
      // チェックが入っていれば値を即座にコピー
      if (syncCheck.checked && hasValue) {
        admMail.value = pubMail.value;
      }
    };

    // 掲載用メールの入力イベント
    pubMail.addEventListener('input', updateSyncVisibility);

    // 同期チェックボックスの切り替えイベント
    syncCheck.addEventListener('change', () => {
      if (syncCheck.checked) {
        admMail.value = pubMail.value;
        admMail.style.background = "#f0f0f0"; // 同期中であることを視覚的に示す
        admMail.readOnly = true; 
      } else {
        admMail.style.background = "#fafafa";
        admMail.readOnly = false;
      }
    });
  }

  // --- 🍎 画像プレビュー＆追加・削除ロジック ---
  let uploadedFiles = []; // 画像データを保持する配列
  const imgInput = document.getElementById('art_images_input');
  const imgAddBtn = document.getElementById('imgAddBtn');
  const previewArea = document.getElementById('imgPreviewArea');

  if (imgAddBtn && imgInput) {
    imgAddBtn.onclick = () => imgInput.click();
    imgInput.onchange = (e) => {
      Array.from(e.target.files).forEach(file => {
        if (uploadedFiles.length >= 6) return; // 6枚制限
        uploadedFiles.push(file);
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const div = document.createElement('div');
          div.className = 'lz-img-container';
          div.innerHTML = `<img src="${event.target.result}"><div class="lz-img-remove">×</div>`;
          
          // 削除ボタンの挙動
          div.querySelector('.lz-img-remove').onclick = () => {
            div.remove();
            uploadedFiles = uploadedFiles.filter(f => f !== file);
            imgAddBtn.style.display = 'flex'; // 削除されたら追加ボタンを再表示
          };
          
          previewArea.insertBefore(div, imgAddBtn);
          if (uploadedFiles.length >= 6) imgAddBtn.style.display = 'none'; // 6枚で追加ボタンを隠す
        };
        reader.readAsDataURL(file);
      });
      imgInput.value = ""; // 同じファイルの再選択を許可
    };
  }

  // 🍎 文章作成を事務局に任せる連動ロジック：入力エリアを完全に非表示化
  const chkAssist = document.getElementById('chk-writing-assist');
  const msgAssist = document.getElementById('msg-writing-assist');
  const inpLead = document.getElementsByName('art_lead')[0];
  const inpBody = document.getElementsByName('art_body')[0];

  if (chkAssist && inpLead && inpBody) {
    const fieldLead = inpLead.closest('.lz-field'); // 概要の親要素
    const fieldBody = inpBody.closest('.lz-field'); // 本文の親要素

    const syncAssist = () => {
      const isHandled = chkAssist.checked;
      
      // 入力欄とその親要素（ラベル・タイトル含む）をまるごと消去/表示
      if (fieldLead) fieldLead.style.display = isHandled ? 'none' : 'flex';
      if (fieldBody) fieldBody.style.display = isHandled ? 'none' : 'flex';
      
      // 必須設定の解除（非表示のまま送信可能にするため重要）
      inpLead.required = !isHandled;
      inpBody.required = !isHandled;
      
      // 注意事項メッセージの表示
      if(msgAssist) msgAssist.style.display = isHandled ? "block" : "none";
    };

    chkAssist.onchange = syncAssist; 
    syncAssist(); // 初期化時にも実行
  }
}