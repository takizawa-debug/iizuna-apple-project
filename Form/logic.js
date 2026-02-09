import { utils } from './utils.js';

export function initFormLogic() {
  const days = ["月", "火", "水", "木", "金", "土", "日", "祝"];

  // --- 🍎 1. タブ切り替え（最優先：ここが止まると全てが死ぬため Null ガード徹底） ---
  const tabs = document.querySelectorAll('.lz-form-tab');
  tabs.forEach(t => {
    t.onclick = () => {
      tabs.forEach(x => x.classList.toggle('is-active', x === t));
      document.querySelectorAll('.lz-form-body').forEach(b => b.classList.remove('is-active'));
      const target = document.getElementById(`pane-${t.dataset.type}`);
      if (target) target.classList.add('is-active');
    };
  });

  // --- 🍎 2. 動的要素の生成（要素が存在する場合のみ安全に実行） ---
  const simpleBox = document.getElementById('box-simple-days');
  const customBody = document.getElementById('customSchedBody');
  if (simpleBox && customBody) {
    days.forEach(d => {
      const l = document.createElement('label'); 
      l.className = 'lz-main-label'; l.style.fontSize = "1.1rem";
      l.innerHTML = `<input type="checkbox" name="simple_days" value="${d}"> ${d}`;
      simpleBox.appendChild(l);
      const tr = document.createElement('tr'); tr.id = `row-${d}`;
      tr.innerHTML = `<td>${d}</td><td><input type="checkbox" name="c_closed_${d}"></td>
        <td><div class="lz-time-box">${utils.createTimeSelectorHTML('c_s_'+d)}</div></td>
        <td><div class="lz-time-box">${utils.createTimeSelectorHTML('c_e_'+d)}</div></td>`;
      customBody.appendChild(tr);
      tr.querySelector('input[type="checkbox"]').onchange = (e) => tr.style.opacity = e.target.checked ? "0.4" : "1";
    });
  }

  const setHtml = (id, html) => { const el = document.getElementById(id); if(el) el.innerHTML = html; };
  setHtml('sel-simple-time', utils.createTimeSelectorHTML('simple_s') + '<span>〜</span>' + utils.createTimeSelectorHTML('simple_e'));
  setHtml('sel-ev-s', utils.createTimeSelectorHTML('ev_s'));
  setHtml('sel-ev-e', utils.createTimeSelectorHTML('ev_e'));

  // --- 🍎 3. 住所検索 ---
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

  // --- 🍎 4. 登録タイプによる動的展開とラベル変更 ---
  const typeRadios = document.getElementsByName('art_type');
  const fieldsContainer = document.getElementById('article-fields-container');
  const lblTitle = document.getElementById('lbl-title');
  const lblLead = document.getElementById('lbl-lead');
  const inpTitle = document.getElementById('inp-title');

  function updateTypeView() {
    const selected = Array.from(typeRadios).find(r => r.checked);
    if (!selected) {
      if (fieldsContainer) fieldsContainer.style.display = 'none';
      return;
    }
    if (fieldsContainer) fieldsContainer.style.display = 'flex';
    const type = selected.value;
    const toggle = (id, cond) => { const el = document.getElementById(id); if(el) el.style.display = cond ? 'flex' : 'none'; };
    toggle('pane-shop-detail', type === 'shop');
    toggle('pane-event-detail', type === 'event');
    toggle('box-shop-cat', type !== 'other');
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

  // --- 🍎 5. カテゴリー連動 ---
  document.getElementsByName('cat_l1').forEach(c => c.onchange = () => {
    const v = Array.from(document.getElementsByName('cat_l1')).filter(i => i.checked).map(i => i.value);
    const catT = (id, cond) => { const el = document.getElementById(id); if(el) el.style.display = cond ? 'flex' : 'none'; };
    catT('sub-eat', v.includes('飲食')); catT('sub-buy', v.includes('買い物')); catT('sub-stay', v.includes('宿泊'));
    catT('sub-tour', v.includes('観光')); catT('sub-consult', v.includes('相談')); catT('sub-industry', v.includes('産業'));
    catT('sub-life', v.includes('暮らし')); catT('sub-cat-root-other', v.includes('大カテゴリその他'));
  });

  // --- 🍎 6. SNSリンク連動ロジック (復活：チェック連動型) ---
  const snsTriggers = document.getElementsByName('sns_trigger');
  snsTriggers.forEach(trigger => {
    trigger.onchange = () => {
      const vals = Array.from(snsTriggers).filter(i => i.checked).map(i => i.value);
      const targets = ['home', 'ec', 'ig', 'fb', 'x', 'line', 'tt'];
      targets.forEach(t => {
        const box = document.getElementById(`f-${t}`);
        if(box) box.style.display = vals.includes(t) ? 'block' : 'none';
      });
    };
  });

  // --- 🍎 7. サブカテゴリ「その他」連動 ---
  document.querySelectorAll('.lz-sub-trigger').forEach(trigger => {
    trigger.onchange = (e) => {
      const parent = e.target.closest('.lz-dynamic-sub-area');
      const otherInput = parent ? parent.querySelector('.lz-sub-other-field') : null;
      if(otherInput) otherInput.style.display = e.target.checked ? 'block' : 'none';
    };
  });

  // --- 🍎 8. 問い合わせ手段連動 ---
  document.getElementsByName('cm').forEach(c => c.onchange = () => {
    const vals = Array.from(document.getElementsByName('cm')).filter(i => i.checked).map(i => i.value);
    const cmT = (id, cond) => { const el = document.getElementById(id); if(el) el.style.display = cond ? 'flex' : 'none'; };
    cmT('cm-form-box', vals.includes('form')); cmT('cm-email-box', vals.includes('email'));
    cmT('cm-tel-box', vals.includes('tel')); cmT('cm-other-box', vals.includes('other'));
    const sync = document.getElementById('syncField');
    if(sync) sync.style.display = vals.includes('email') ? 'flex' : 'none';
  });

  // --- 🍎 9. メール同期 ---
  const admMail = document.getElementById('adminEmail'), pubMail = document.getElementById('pubEmail'), syncCheck = document.getElementById('syncCheck');
  if (admMail && pubMail && syncCheck) {
    admMail.oninput = () => { if(syncCheck.checked) pubMail.value = admMail.value; };
    syncCheck.onchange = () => { pubMail.readOnly = syncCheck.checked; if(syncCheck.checked) pubMail.value = admMail.value; };
  }
}