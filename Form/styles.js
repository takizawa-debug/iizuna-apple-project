export const formStyles = `
  /* 基盤デザイン */
  .lz-form-wrap { padding: 40px 20px 120px; background: #fff; max-width: 1000px; margin: 0 auto; font-family: sans-serif; color: #333; }
  .lz-form-tabs { display: flex; gap: 4px; margin-bottom: 30px; border-bottom: 2px solid #f0f0f0; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .lz-form-tab { padding: 14px 10px; cursor: pointer; font-weight: 800; font-size: 1rem; color: #aaa; flex: 1; text-align: center; border-bottom: 4px solid transparent; transition: 0.3s; white-space: nowrap; }
  .lz-form-tab.is-active { color: #cf3a3a; border-bottom-color: #cf3a3a; }
  
  .lz-form-body { display: none; flex-direction: column; gap: 28px; }
  .lz-form-body.is-active { display: flex; animation: lz-fade 0.4s ease; }
  @keyframes lz-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; } }

  .lz-section-head { font-size: 1.3rem; font-weight: 900; color: #5b3a1e; border-left: 6px solid #cf3a3a; padding-left: 14px; margin: 25px 0 10px; line-height: 1.4; }
  .lz-field { display: flex; flex-direction: column; gap: 10px; }
  .lz-label { font-size: 1.15rem; font-weight: 800; color: #5b3a1e; display: flex; align-items: center; gap: 8px; }
  .lz-badge { font-size: 0.75rem; background: #cf3a3a; color: #fff; padding: 2px 8px; border-radius: 4px; font-weight: 900; }
  
  .lz-input, .lz-textarea, .lz-select { padding: 14px; border: 2px solid #eee; border-radius: 12px; font-size: 1.05rem; background: #fafafa; width: 100%; box-sizing: border-box; -webkit-appearance: none; }
  .lz-input:focus, .lz-textarea:focus, .lz-select:focus { border-color: #cf3a3a; background: #fff; outline: none; box-shadow: 0 0 0 4px rgba(207, 58, 58, 0.1); }

  /* 選択UI：カード・チップ形式 */
  .lz-choice-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; width: 100%; }
  .lz-choice-item { position: relative; cursor: pointer; display: block; }
  .lz-choice-item input { position: absolute; opacity: 0; pointer-events: none; }
  .lz-choice-inner { 
    display: flex; align-items: center; justify-content: center; padding: 14px 8px;
    background: #fff; border: 2px solid #eee; border-radius: 12px;
    font-size: 1rem; font-weight: 800; color: #666; transition: all 0.2s ease;
    text-align: center; min-height: 54px; box-sizing: border-box;
  }
  .lz-choice-item input:checked + .lz-choice-inner { background: #cf3a3a; border-color: #cf3a3a; color: #fff; }

  /* 🍎 サブカテゴリー：上下余白とスマホ幅の改善 */
  .lz-dynamic-sub-area { display: none; flex-direction: column; gap: 15px; padding: 20px; background: #fdfaf8; border: 1px solid #eee; border-radius: 16px; margin: 10px 0; border-left: 8px solid #5b3a1e; animation: lz-fade 0.3s ease; }
  .lz-sub-choice-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .lz-sub-choice-item .lz-choice-inner { min-height: 44px; padding: 8px 18px; border-radius: 30px; font-size: 0.95rem; }
  .lz-sub-choice-item input:checked + .lz-choice-inner { background: #5b3a1e; border-color: #5b3a1e; }
  .lz-sub-other-field { display: none; margin-top: 5px; }

  /* 時間選択（スマホ縦並び） */
  .lz-time-row { display: flex; flex-direction: column; gap: 12px; width: 100%; }
  .lz-time-field { display: flex; align-items: center; gap: 10px; }
  .lz-time-label-sm { font-size: 0.9rem; font-weight: 800; color: #888; min-width: 70px; }
  .lz-time-box { display: flex; align-items: center; gap: 4px; flex: 1; }
  .lz-time-select { padding: 12px 2px; border-radius: 10px; border: 2px solid #eee; font-size: 1.1rem; cursor: pointer; background: #fff; flex: 1; text-align: center; }
  .lz-time-box.is-disabled { opacity: 0.2; pointer-events: none; }

  /* 曜日チップ */
  .lz-day-selector { display: flex; flex-wrap: wrap; gap: 8px; }
  .lz-day-chip { position: relative; cursor: pointer; }
  .lz-day-chip input { position: absolute; opacity: 0; }
  .lz-day-text { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: #fff; border: 2px solid #eee; border-radius: 50%; font-weight: 800; font-size: 1rem; color: #888; transition: 0.2s; }
  .lz-day-chip input:checked + .lz-day-text { background: #cf3a3a; border-color: #cf3a3a; color: #fff; }

  /* 🍎 スケジュール・テーブル：PCでの明示化とスマホでのフル幅追従 */
  .lz-schedule-container { width: 100%; box-sizing: border-box; }
  .lz-schedule-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; }
  .lz-schedule-table th, .lz-schedule-table td { padding: 12px 10px; border: 1px solid #eee; text-align: center; }
  .lz-schedule-table th { background: #fdfaf8; color: #5b3a1e; font-weight: 800; font-size: 0.9rem; }

  @media (max-width: 600px) {
    .lz-schedule-table, .lz-schedule-table tr, .lz-schedule-table td { display: block; width: 100%; border: none; box-sizing: border-box; }
    .lz-schedule-table thead { display: none; }
    .lz-schedule-table tr { border: 2px solid #f0e6e0; border-radius: 16px; padding: 15px; margin-bottom: 12px; background: #fff; }
    .lz-schedule-table td { position: relative; padding: 8px 0 8px 100px; text-align: left; min-height: 48px; display: flex; align-items: center; }
    .lz-schedule-table td::before { content: attr(data-label); position: absolute; left: 10px; font-weight: 900; color: #5b3a1e; font-size: 0.85rem; width: 80px; }
    .lz-schedule-table td:first-child { padding: 0; margin-bottom: 12px; font-size: 1.15rem; color: #cf3a3a; border-bottom: 2px solid #fdfaf8; padding-bottom: 8px; font-weight: 800; }
    .lz-schedule-table td:first-child::before { display: none; }
    .lz-dynamic-sub-area { padding: 15px; }
  }

  .lz-zip-btn { background: #5b3a1e; color: #fff; border: none; padding: 0 15px; border-radius: 12px; font-weight: 800; cursor: pointer; height: 54px; font-size: 1rem; }
  .lz-dynamic-detail { display: none; flex-direction: column; gap: 24px; padding: 25px; background: rgba(91, 58, 30, 0.05); border-radius: 20px; border: 1px dashed #ddd; }
  .lz-send-btn { background: #cf3a3a; color: #fff; padding: 22px; border: none; border-radius: 99px; font-weight: 900; font-size: 1.4rem; cursor: pointer; transition: 0.4s; margin-top: 50px; width: 100%; box-shadow: 0 10px 25px rgba(207, 58, 58, 0.2); }
`;