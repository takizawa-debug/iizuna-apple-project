export const formStyles = `
  .lz-form-wrap { padding: 40px 24px 120px; background: #fff; max-width: 1000px; margin: 0 auto; font-family: sans-serif; color: #333; }
  .lz-form-tabs { display: flex; gap: 8px; margin-bottom: 30px; border-bottom: 2px solid #f0f0f0; }
  .lz-form-tab { padding: 14px; cursor: pointer; font-weight: 800; font-size: 1.1rem; color: #aaa; flex: 1; text-align: center; border-bottom: 4px solid transparent; transition: 0.3s; }
  .lz-form-tab.is-active { color: #cf3a3a; border-bottom-color: #cf3a3a; }
  
  .lz-form-body { display: none; flex-direction: column; gap: 28px; }
  .lz-form-body.is-active { display: flex; animation: lz-fade 0.4s ease; }
  @keyframes lz-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; } }

  .lz-section-head { font-size: 1.4rem; font-weight: 900; color: #5b3a1e; border-left: 6px solid #cf3a3a; padding-left: 14px; margin: 35px 0 15px; }
  .lz-field { display: flex; flex-direction: column; gap: 10px; }
  .lz-label { font-size: 1.25rem; font-weight: 800; color: #5b3a1e; display: flex; align-items: center; gap: 8px; }
  .lz-badge { font-size: 0.8rem; background: #cf3a3a; color: #fff; padding: 2px 10px; border-radius: 4px; font-weight: 900; }
  
  .lz-input, .lz-textarea, .lz-select { padding: 16px; border: 2px solid #eee; border-radius: 12px; font-size: 1.1rem; background: #fafafa; width: 100%; box-sizing: border-box; }
  .lz-input:focus, .lz-textarea:focus, .lz-select:focus { border-color: #cf3a3a; background: #fff; outline: none; }

  /* 曜日チップセレクター */
  .lz-day-selector { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 5px; }
  .lz-day-chip { position: relative; cursor: pointer; }
  .lz-day-chip input { position: absolute; opacity: 0; width: 0; height: 0; }
  .lz-day-text { 
    display: inline-flex; align-items: center; justify-content: center;
    width: 44px; height: 44px; background: #fff; border: 2px solid #eee; 
    border-radius: 50%; font-weight: 800; font-size: 1.1rem; color: #888;
    transition: all 0.2s;
  }
  .lz-day-chip input:checked + .lz-day-text { 
    background: #cf3a3a; border-color: #cf3a3a; color: #fff; transform: scale(1.05);
  }

  /* 🍎 営業時間：スマホでの折り返し対応 */
  .lz-time-box { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
  .lz-time-select { padding: 10px 4px; border-radius: 8px; border: 1px solid #ddd; font-size: 1.1rem; cursor: pointer; background: #fff; min-width: 60px; }

  /* 🍎 曜日別テーブル：スマホでのカード化 */
  .lz-schedule-container { width: 100%; }
  .lz-schedule-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; }
  .lz-schedule-table th, .lz-schedule-table td { padding: 12px 10px; border: 1px solid #eee; text-align: center; }
  .lz-schedule-table th { background: #fdfaf8; color: #5b3a1e; font-weight: 800; }

  @media (max-width: 600px) {
    .lz-schedule-table, .lz-schedule-table thead, .lz-schedule-table tbody, .lz-schedule-table th, .lz-schedule-table td, .lz-schedule-table tr {
      display: block; width: 100%;
    }
    .lz-schedule-table thead { display: none; }
    .lz-schedule-table tr { border-bottom: 3px solid #f0e6e0; padding: 15px 0; margin-bottom: 10px; background: #fff; border-radius: 12px; }
    .lz-schedule-table td { 
      border: none; position: relative; padding: 8px 10px 8px 100px; text-align: left; display: flex; align-items: center; min-height: 44px;
    }
    .lz-schedule-table td::before {
      content: attr(data-label); position: absolute; left: 10px; width: 80px; font-weight: 900; color: #5b3a1e; font-size: 0.9rem;
    }
    .lz-schedule-table td:first-child { background: #5b3a1e; color: #fff; padding-left: 15px; border-radius: 8px 8px 0 0; margin-bottom: 5px; }
    .lz-schedule-table td:first-child::before { display: none; }
    .lz-time-box { justify-content: flex-start; }
  }

  .lz-choice-group-main { display: flex; flex-wrap: wrap; gap: 12px; padding: 20px; background: #fff; border: 2px solid #eee; border-radius: 16px; }
  .lz-main-label { font-size: 1.2rem; font-weight: 800; display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 12px 18px; border-radius: 10px; background: #fdfaf8; border: 1px solid #f0e6e0; }
  .lz-main-label input { width: 24px; height: 24px; accent-color: #cf3a3a; cursor: pointer; }

  .lz-dynamic-sub-area { display: none; flex-direction: column; gap: 15px; padding: 25px; background: #fcfcfc; border: 1px solid #eee; border-radius: 16px; margin-top: -15px; margin-left: 20px; border-left: 5px solid #5b3a1e; animation: lz-fade 0.3s ease; }
  .lz-choice-group-sub { display: flex; flex-wrap: wrap; gap: 10px; }
  .lz-sub-label { font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 10px 16px; background: #fff; border: 1px solid #ddd; border-radius: 8px; color: #666; }
  .lz-sub-label input { width: 20px; height: 20px; accent-color: #5b3a1e; }
  .lz-sub-other-field { display: none; margin-top: 10px; }

  .lz-zip-btn { background: #5b3a1e; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 800; cursor: pointer; white-space: nowrap; }
  .lz-dynamic-detail { display: none; flex-direction: column; gap: 24px; padding: 25px; background: rgba(91, 58, 30, 0.03); border-radius: 16px; border: 1px dashed #ddd; }

  .lz-send-btn { background: #cf3a3a; color: #fff; padding: 22px; border: none; border-radius: 99px; font-weight: 900; font-size: 1.4rem; cursor: pointer; transition: 0.4s; margin-top: 50px; width: 100%; }
  .lz-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  @media (max-width: 600px) { .lz-grid { grid-template-columns: 1fr; } .lz-dynamic-sub-area { margin-left: 10px; } }
`;