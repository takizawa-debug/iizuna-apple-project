import { formStyles } from './styles.js';
import { formHTML, formCommonHTML } from './templates.js';
import { initFormLogic } from './logic.js';

(function() {
  // 1. CSS注入
  const styleTag = document.createElement('style');
  styleTag.innerHTML = formStyles;
  document.head.appendChild(styleTag);

  // 2. HTML注入 (ペライチ上の任意のID、またはbody末尾)
  const target = document.getElementById('lz-form-container') || document.body;
  target.insertAdjacentHTML('beforeend', formHTML);
  
  // 共通部分を特定のdivに注入
  document.getElementById('form-common-part').innerHTML = formCommonHTML;

  // 3. ロジック初期化
  initFormLogic();
  
  console.log("Iizuna Portal Form: Initialized successfully.");
})();