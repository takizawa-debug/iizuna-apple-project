/**
 * logic.js - UI制御・動的連動ロジック
 * 役割: タブ切り替え、郵便番号検索、カテゴリー連動、営業時間、フォームの動的展開を管理。
 */
import { utils } from './utils.js';

export function initFormLogic() {
  const days = ["月", "火", "水", "木", "金", "土", "日", "祝"];

  // 1. スケジュール要素の動的生成
  const simpleBox = document.getElementById('box-simple-days');
  const customBody = document.getElementById('customSchedBody');
  
  if (simpleBox && customBody) {
    days.forEach(d => {
      // 標準設定の曜日チェックボックス
      const l = document.createElement('label'); 
      l.className = 'lz-main-label'; l.style.fontSize = "1.1rem";
      l.innerHTML = `<input type="checkbox" name="simple_days" value="${d}"> ${d}`;
      simpleBox.appendChild(l);

      // 詳細設定の曜日別テーブル行
      const tr = document.createElement('tr'); tr.id = `row-${d}`;
      tr.innerHTML = `<td>${d}</td><td><input type="checkbox" name="c_closed_${d}"></td>
        <td><div class="lz-time-box">${utils.createTimeSelectorHTML('c_s_'+d)}</div></td>
        <td><div class="lz-time-box">${utils.createTimeSelectorHTML('c_e_'+d)}</div></td>`;
      customBody.appendChild(tr);
      tr.querySelector('input[type="checkbox"]').onchange = (e) => tr.style.opacity = e.target.checked ? "0.4" : "1";
    });
  }

  // 時間セレクターの初期化
  const selSimple = document.getElementById('sel-simple-time');
  const selEvS = document.getElementById('sel-ev-s');
  const selEvE = document.getElementById('sel-ev-e');
  if (selSimple) selSimple.innerHTML = utils.createTimeSelectorHTML('simple_s') + '<span>〜</span>' + utils.createTimeSelectorHTML('simple_e');
  if (selEvS) selEvS.innerHTML = utils.createTimeSelectorHTML('ev_s');
  if (selEvE) selEvE.innerHTML = utils.createTimeSelectorHTML('ev_e');

  // 2. タブ切り替えロジック
  const tabs = document.querySelectorAll('.lz-form-tab');
  tabs.forEach(t => t.onclick = () => {
    tabs.forEach(x => x.classList.toggle('is-active', x === t));
    document.querySelectorAll('.lz-form-body').forEach(b => b.classList.remove('is-active'));
    document.getElementById(`pane-${t.dataset.type}`).classList.add('is-active');
  });

  // 3. 郵便番号からの住所検索
  const zipBtn = document.getElementById('zipBtnAction');
  if (zipBtn) {
    zipBtn.onclick = async () => {
      const zip = document.getElementById('zipCode').value;
      try {
        const addr = await utils.fetchAddress(zip);
        document.getElementById('addressField').value = addr;
      } catch(e) { alert(e.message); }
    };
  }

  // 4. カテゴリー連動表示 (L1)
  document.getElementsByName('cat_l1').forEach(c => c.onchange = () => {
    const v = Array.from(document.getElementsByName('cat_l1')).filter(i => i.checked).map(i => i.value);
    document.getElementById('sub-eat').style.display = v.includes('飲食') ? 'flex' : 'none';
    document.getElementById('sub-buy').style.display = v.includes('買い物') ? 'flex' : 'none';
    document.getElementById('sub-stay').style.display = v.includes('宿泊') ? 'flex' : 'none';
    document.getElementById('sub-tour').style.display = v.includes('観光') ? 'flex' : 'none';
    document.getElementById('sub-consult').style.display = v.includes('相談') ? 'flex' : 'none';
    document.getElementById('sub-industry').style.display = v.includes('産業') ? 'flex' : 'none';
    document.getElementById('sub-life').style.display = v.includes('暮らし') ? 'flex' : 'none';
    document.getElementById('sub-cat-root-other').style.display = v.includes('大カテゴリその他') ? 'flex' : 'none';
  });

  // 5. サブカテゴリー「その他」の入力欄表示制御
  document.querySelectorAll('.lz-sub-trigger').forEach(trigger => {
    trigger.onchange = (e) => {
      const parent = e.target.closest('.lz-dynamic-sub-area');
      const otherInput = parent.querySelector('.lz-sub-other-field');
      if (otherInput) otherInput.style.display = e.target.checked ? 'block' : 'none';
    };
  });

  // 6. 登録タイプ（お店/イベント/その他）による表示制御
  const typeRadios = document.getElementsByName('art_type');
  const lblTitle = document.getElementById('lbl-title');
  const lblLead = document.getElementById('lbl-lead');
  const inpTitle = document.getElementById('inp-title');
  const fieldsContainer = document.getElementById('article-fields-container');

  function updateLabels() {
    const selectedRadio = Array.from(typeRadios).find(r => r.checked);
    
    // 何も選ばれていない場合はフィールドを全て隠す
    if (!selectedRadio) {
      if (fieldsContainer) fieldsContainer.style.display = 'none';
      return;
    }

    // 選択されたらコンテナを表示
    fieldsContainer.style.display = 'flex';
    const type = selectedRadio.value;

    // タイプ別の詳細ブロック表示制御
    document.getElementById('pane-shop-detail').style.display = (type === 'shop' ? 'flex' : 'none');
    document.getElementById('pane-event-detail').style.display = (type === 'event' ? 'flex' : 'none');
    
    // カテゴリー選択は「お店」「イベント」の場合のみ表示（「その他」の記事は不要な場合が多いため）
    document.getElementById('box-shop-cat').style.display = (type === 'other' ? 'none' : 'flex');

    // 文脈に応じたラベルとプレースホルダーの切り替え
    if (type === 'shop') {
      lblTitle.textContent = "店名・施設名"; 
      lblLead.textContent = "お店の概要";
      inpTitle.placeholder = "正式な店舗名をご記入ください";
    } else if (type === 'event') {
      lblTitle.textContent = "イベント名"; 
      lblLead.textContent = "イベントの概要";
      inpTitle.placeholder = "イベントの名称をご記入ください";
    } else {
      lblTitle.textContent = "記事タイトル"; 
      lblLead.textContent = "記事の概要";
      inpTitle.placeholder = "読みたくなるタイトルを付けてください";
    }
  }

  typeRadios.forEach(r => r.onchange = updateLabels);
  updateLabels(); // 初期実行（未選択なら隠す）

  // 7. その他のUI連動 (営業時間モード / イベント日程形式 / 問い合わせ手段)
  document.getElementsByName('shop_mode').forEach(r => r.onchange = (e) => {
    document.getElementById('shop-simple').style.display = (e.target.value === 'simple' ? 'block' : 'none');
    document.getElementById('shop-custom').style.display = (e.target.value === 'custom' ? 'block' : 'none');
  });

  document.getElementsByName('ev_date_type').forEach(r => r.onchange = (e) => {
    document.getElementById('edate-box').style.display = (e.target.value === 'multi' ? 'flex' : 'none');
  });

  document.getElementsByName('cm').forEach(c => c.onchange = () => {
    const vals = Array.from(document.getElementsByName('cm')).filter(i => i.checked).map(i => i.value);
    document.getElementById('cm-form-box').style.display = vals.includes('form') ? 'flex' : 'none';
    document.getElementById('cm-email-box').style.display = vals.includes('email') ? 'flex' : 'none';
    document.getElementById('cm-tel-box').style.display = vals.includes('tel') ? 'flex' : 'none';
    document.getElementById('cm-other-box').style.display = vals.includes('other') ? 'flex' : 'none';
    document.getElementById('syncField').style.display = vals.includes('email') ? 'flex' : 'none';
  });

  // 8. 事務局メールと掲載用メールの同期ロジック
  const admMail = document.getElementById('adminEmail');
  const pubMail = document.getElementById('pubEmail');
  const syncCheck = document.getElementById('syncCheck');
  if (admMail && pubMail && syncCheck) {
    admMail.oninput = () => { if (syncCheck.checked) pubMail.value = admMail.value; };
    syncCheck.onchange = () => { pubMail.readOnly = syncCheck.checked; if (syncCheck.checked) pubMail.value = admMail.value; };
  }
}