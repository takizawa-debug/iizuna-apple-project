/* --- header.js --- */
(async function headerNavBoot(){
  // 共通設定から取得
  const LZ_ENDPOINT = window.LZ_CONFIG.ENDPOINT;
  const MENU_ORDER = window.LZ_CONFIG.MENU_ORDER;
  const MENU_URL = window.LZ_CONFIG.MENU_URL;

  function getActiveL1(){
    const href = location.href.replace(/#.*$/, '');
    for(const [key, url] of Object.entries(MENU_URL)){
      if(href.startsWith(url)) return key;
    }
    return null;
  }

  /* --- デスクトップ用スケルトン --- */
  function renderDesktopSkeleton(){
    const ul = document.getElementById('lzNavList');
    if(!ul) return;
    const activeL1 = getActiveL1();
    ul.innerHTML = MENU_ORDER.map((l1, i) => {
      const base = MENU_URL[l1] || "#";
      const isCurrent = (l1 === activeL1);
      return `
        <li class="lz-hnav__item">
          <a href="${base}" class="lz-hnav__l1${isCurrent ? ' is-current' : ''}"
             data-idx="${i}" data-url="${base}" ${isCurrent ? 'aria-current="page"' : ''}>${l1}</a>
          <div class="lz-hnav__panel" role="menu" aria-hidden="true"></div>
        </li>`;
    }).join('');

    const items = [...ul.querySelectorAll('.lz-hnav__item')];
    let openIdx = -1, openTO = null, closeTO = null;
    const ENTER_DELAY = 100, LEAVE_DELAY = 220;

    function getPanel(i){ return items[i]?.querySelector('.lz-hnav__panel'); }
    function getTrigger(i){ return items[i]?.querySelector('.lz-hnav__l1'); }
    function openPanel(i){
      if (openIdx === i) return;
      if (openIdx >= 0) getPanel(openIdx)?.classList.remove('is-open');
      const p = getPanel(i);
      if (p && p.childElementCount > 0) {
        p.classList.add('is-open');
        openIdx = i;
      }
    }
    function closePanel(i){
      if (i < 0) return;
      getPanel(i)?.classList.remove('is-open');
      if (openIdx === i) openIdx = -1;
    }

    items.forEach((item, i) => {
      item.addEventListener('pointerenter', () => {
        clearTimeout(openTO); clearTimeout(closeTO);
        openTO = setTimeout(() => openPanel(i), ENTER_DELAY);
      }, { passive: true });
      item.addEventListener('pointerleave', () => {
        clearTimeout(openTO); clearTimeout(closeTO);
        closeTO = setTimeout(() => closePanel(i), LEAVE_DELAY);
      }, { passive: true });
    });
  }

  /* --- ドロワー用スケルトン --- */
  function renderDrawerSkeleton(){
    const holder = document.getElementById('lzDwNav'); if(!holder) return;
    holder.innerHTML = MENU_ORDER.map((l1, i) => {
      const base = MENU_URL[l1] || "#";
      return `
        <div class="lz-dw-group" data-has-l2="false">
          <a class="lz-dw-l1a" href="${base}" data-idx="${i}">${l1}</a>
          <div class="lz-dw-l2" id="lzL2_${i}"></div>
        </div>`;
    }).join('');
  }

  /* --- データ反映 (Hydrate) --- */
  function hydrateDesktop(map){
    const ul = document.getElementById('lzNavList'); if(!ul) return;
    const items = [...ul.querySelectorAll('.lz-hnav__item')];
    items.forEach((li, i) => {
      const l1 = MENU_ORDER[i];
      const list = map.get(l1) || [];
      const panel = li.querySelector('.lz-hnav__panel');
      panel.innerHTML = list.map(l2 => `<a role="menuitem" href="${(MENU_URL[l1]||"#")}#${encodeURIComponent(l2)}">${l2}</a>`).join('');
    });
  }

  function hydrateDrawer(map){
    const holder = document.getElementById('lzDwNav'); if(!holder) return;
    const groups = [...holder.querySelectorAll('.lz-dw-group')];
    groups.forEach((grp, i) => {
      const l1 = MENU_ORDER[i];
      const list = map.get(l1) || [];
      const l2div = grp.querySelector('.lz-dw-l2');
      l2div.innerHTML = list.map(l2 => `<a href="${(MENU_URL[l1]||"#")}#${encodeURIComponent(l2)}">${l2}</a>`).join('');
      grp.setAttribute('data-has-l2', list.length > 0 ? 'true' : 'false');
    });
  }

  // 初期描画
  renderDesktopSkeleton();
  renderDrawerSkeleton();

  // データ取得
  try {
    const res = await fetch(`${LZ_ENDPOINT}?all=1`, { mode: "cors", cache: "no-store" });
    const json = await res.json();
    if(json.ok) {
      const items = json.items || [];
      const tempMap = new Map();
      items.forEach(it => {
        const l1 = (it.l1||"").trim(), l2 = (it.l2||"").trim();
        if(!tempMap.has(l1)) tempMap.set(l1, []);
        if(!tempMap.get(l1).includes(l2)) tempMap.get(l1).push(l2);
      });
      hydrateDesktop(tempMap);
      hydrateDrawer(tempMap);
    }
  } catch(e) { console.error("Menu fetch error", e); }

  // ドロワー開閉ロジック
  const dwBackdrop = document.getElementById('lzDwBackdrop');
  const dw = document.getElementById('lzDrawer');
  const hamb = document.getElementById('lzHamb');
  const dwClose = document.getElementById('lzDwClose');
  hamb.addEventListener('click', () => { dwBackdrop.classList.add('is-open'); dw.classList.add('is-open'); });
  [dwClose, dwBackdrop].forEach(el => el.addEventListener('click', () => { dwBackdrop.classList.remove('is-open'); dw.classList.remove('is-open'); }));

})();