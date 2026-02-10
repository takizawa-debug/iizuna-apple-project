export const formStyles = `
  /* 基盤デザイン */
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
  
  .lz-input, .lz-textarea, .lz-select { padding: 16px; border: 2px solid #eee; border-radius: 12px; font-size: 1.1rem; background: #fafafa; width: 100%; box-sizing: border-box; -webkit-appearance: none; }
  .lz-input:focus, .lz-textarea:focus, .lz-select:focus { border-color: #cf3a3a; background: #fff; outline: none; }

  /* 🍎 一流の「チョイスカード」スタイル (ラジオ・チェック共通) */
  .lz-choice-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
  .lz-choice-card { position: relative; cursor: pointer; }
  .lz-choice-card input { position: absolute; opacity: 0; width: 0; height: 0; }
  .lz-choice-content { 
    display: flex; align-items: center; justify-content: center; text-align: center;
    padding: 15px 10px; background: #fff; border: 2px solid #eee; border-radius: 12px;
    font-weight: 800; font-size: 1.05rem; color: #666; transition: all 0.2s; min-height: 54px;
  }
  .lz-choice-card input:checked + .lz-choice-content { 
    background: #fdf2f2; border-color: #cf3a3a; color: #cf3a3a; box-shadow: 0 4px 12px rgba(207, 58, 58, 0.1);
  }

  /* 🍎 時間入力のスタック対応 */
  .lz-time-group { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .lz-time-box { display: flex; align-items: center; gap: 4px; background: #fdfaf8; padding: 4px 8px; border-radius: 10px; border: 1px solid #eee; }
  .lz-time-select { padding: 8px 4px; border: none; background: transparent; font-size: 1.1rem; font-weight: 700; color: #5b3a1e; cursor: pointer; min-width: 55px; }

  /* 🍎 曜日別テーブル：スマホでのカード化ロジック */
  .lz-schedule-container { width: 100%; }
  .lz-schedule-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; }
  .lz-schedule-table th, .lz-schedule-table td { padding: 12px 10px; border: 1px solid #eee; text-align: center; }
  .lz-schedule-table th { background: #fdfaf8; color: #5b3a1e; font-weight: 800; }

  @media (max-width: 600px) {
    .lz-choice-grid { grid-template-columns: repeat(2, 1fr); } /* スマホは2列 */
    .lz-schedule-table, .lz-schedule-table thead, .lz-schedule-table tbody, .lz-schedule-table th, .lz-schedule-table td, .lz-schedule-table tr {
      display: block; width: 100%;
    }
    .lz-schedule-table thead { display: none; }
    .lz-schedule-table tr { border: 2px solid #eee; padding: 15px 10px; margin-bottom: 12px; background: #fff; border-radius: 16px; }
    .lz-schedule-table td { 
      border: none; position: relative; padding: 6px 0 6px 90px; text-align: left; display: flex; align-items: center; min-height: 40px;
    }
    .lz-schedule-table td::before {
      content: attr(data-label); position: absolute; left: 0; width: 80px; font-weight: 800; color: #5b3a1e; font-size: 0.9rem; opacity: 0.7;
    }
    .lz-schedule-table td:first-child { 
      background: #5b3a1e; color: #fff; padding: 8px 15px; border-radius: 10px; margin: -15px -10px 10px; width: calc(100% + 20px); font-size: 1.1rem;
    }
    .lz-schedule-table td:first-child::before { display: none; }
  }

  /* 共通装飾 */
  .lz-dynamic-sub-area { display: none; flex-direction: column; gap: 15px; padding: 25px; background: #fcfcfc; border: 1px solid #eee; border-radius: 16px; margin-top: -15px; margin-left: 10px; border-left: 5px solid #5b3a1e; animation: lz-fade 0.3s ease; }
  .lz-zip-btn { background: #5b3a1e; color: #fff; border: none; padding: 14px 20px; border-radius: 12px; font-weight: 800; cursor: pointer; white-space: nowrap; }
  .lz-dynamic-detail { display: none; flex-direction: column; gap: 24px; padding: 20px; background: rgba(91, 58, 30, 0.03); border-radius: 16px; border: 1px dashed #ddd; }
  .lz-send-btn { background: #cf3a3a; color: #fff; padding: 22px; border: none; border-radius: 99px; font-weight: 900; font-size: 1.4rem; cursor: pointer; transition: 0.4s; margin-top: 50px; width: 100%; }
`;