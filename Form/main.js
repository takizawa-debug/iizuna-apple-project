import { formStyles } from './styles.js';
import { formHTML, formCommonHTML } from './templates.js';
import { initFormLogic } from './logic.js';

(function() {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = formStyles;
  document.head.appendChild(styleTag);

  const target = document.getElementById('lz-form-container') || document.body;
  target.insertAdjacentHTML('beforeend', formHTML);
  
  // 共通パーツ用の受け皿があれば注入（templates.jsで統合済みなら何もしない）
  const commonPart = document.getElementById('form-common-part');
  if(commonPart && formCommonHTML) {
    commonPart.innerHTML = formCommonHTML;
  }

  initFormLogic();
  console.log("Iizuna Portal Form: Strategic logic initialized.");
})();