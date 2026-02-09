import { utils } from './utils.js';

export function initFormLogic() {
  const days = ["月", "火", "水", "木", "金", "土", "日", "祝"];

  // 1. 動的要素の生成
  const simpleBox = document.getElementById('box-simple-days');
  const customBody = document.getElementById('customSchedBody');
  
  days.forEach(d => {
    // スケジュール：標準設定の曜日
    const l = document.createElement('label'); 
    l.className = 'lz-main-label'; l.style.fontSize = "1.1rem";
    l.innerHTML = `<input type="checkbox" name="simple_days" value="${d}"> ${d}`;
    simpleBox.appendChild(l);

    // スケジュール：詳細設定のテーブル
    const tr = document.createElement('tr'); tr.id = `row-${d}`;
    tr.innerHTML = `<td>${d}</td><td><input type="checkbox" name="c_closed_${d}"></td>
      <td><div class="lz-time-box">${utils.createTimeSelectorHTML('c_s_'+d)}</div></td>
      <td><div class="lz-time-box">${utils.createTimeSelectorHTML('c_e_'+d)}</div></td>`;
    customBody.appendChild(tr);
    tr.querySelector('input[type="checkbox"]').onchange = (e) => tr.style.opacity = e.target.checked ? "0.4" : "1";
  });

  document.getElementById('sel-simple-time').innerHTML = utils.createTimeSelectorHTML('simple_s') + '<span>〜</span>' + utils.createTimeSelectorHTML('simple_e');
  document.getElementById('sel-ev-s').innerHTML = utils.createTimeSelectorHTML('ev_s');
  document.getElementById('sel-ev-e').innerHTML = utils.createTimeSelectorHTML('ev_e');

  // 2. タブ切り替え
  const tabs = document.querySelectorAll('.lz-form-tab');
  tabs.forEach(t => t.onclick = () => {
    tabs.forEach(x => x.classList.toggle('is-active', x === t));
    document.querySelectorAll('.lz-form-body').forEach(b => b.classList.remove('is-active'));
    document.getElementById(`pane-${t.dataset.type}`).classList.add('is-active');
  });

  // 3. 住所検索
  document.getElementById('zipBtnAction').onclick = async () => {
    const zip = document.getElementById('zipCode').value;
    try {
      const addr = await utils.fetchAddress(zip);
      document.getElementById('addressField').value = addr;
    } catch(e) { alert(e.message); }
  };

  // 4. カテゴリー連動
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

  // 5. サブカテゴリ「その他」連動 🍎 修正点
  document.querySelectorAll('.lz-sub-trigger').forEach(trigger => {
    trigger.onchange = (e) => {
      const parent = e.target.closest('.lz-dynamic-sub-area');
      const otherInput = parent.querySelector('.lz-sub-other-field');
      if(otherInput) otherInput.style.display = e.target.checked ? 'block' : 'none';
    };
  });

  // 6. 各種UIトグル
  const typeRadios = document.getElementsByName('art_type');
  function updateLabels() {
    const type = Array.from(typeRadios).find(r => r.checked).value;
    document.getElementById('pane-shop-detail').style.display = (type === 'shop' ? 'flex' : 'none');
    document.getElementById('pane-event-detail').style.display = (type === 'event' ? 'flex' : 'none');
    document.getElementById('box-shop-cat').style.display = (type === 'shop' ? 'flex' : 'none');
    document.getElementById('lbl-title').textContent = (type === 'shop' ? "店名・施設名" : type === 'event' ? "イベント名" : "記事タイトル");
    document.getElementById('lbl-lead').textContent = (type === 'shop' ? "お店の概要" : type === 'event' ? "イベントの概要" : "記事の概要");
  }
  typeRadios.forEach(r => r.onchange = updateLabels);
  updateLabels();

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

  const admMail = document.getElementById('adminEmail');
  const pubMail = document.getElementById('pubEmail');
  const syncCheck = document.getElementById('syncCheck');
  admMail.oninput = () => { if(syncCheck.checked) pubMail.value = admMail.value; };
  syncCheck.onchange = () => { pubMail.readOnly = syncCheck.checked; if(syncCheck.checked) pubMail.value = admMail.value; };
}