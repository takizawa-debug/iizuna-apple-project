export const formStyles = `
  /* 基盤デザイン */
  .lz-form-wrap { padding: 40px 20px 120px; background: #fff; max-width: 1000px; margin: 0 auto; font-family: sans-serif; color: #333; }
  .lz-form-tabs { display: flex; gap: 4px; margin-bottom: 30px; border-bottom: 2px solid #f0f0f0; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .lz-form-tab { padding: 16px 12px; cursor: pointer; font-weight: 800; font-size: 1.15rem; color: #aaa; flex: 1; text-align: center; border-bottom: 4px solid transparent; transition: 0.3s; white-space: nowrap; }
  .lz-form-tab.is-active { color: #cf3a3a; border-bottom-color: #cf3a3a; }
  
  .lz-form-body { display: none; flex-direction: column; gap: 32px; }
  .lz-form-body.is-active { display: flex; animation: lz-fade 0.4s ease; }
  @keyframes lz-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; } }

  .lz-section-head { font-size: 1.45rem; font-weight: 900; color: #5b3a1e; border-left: 6px solid #cf3a3a; padding-left: 14px; margin: 30px 0 12px; line-height: 1.4; }
  .lz-field { display: flex; flex-direction: column; gap: 12px; }
  .lz-label { font-size: 1.25rem; font-weight: 800; color: #5b3a1e; display: flex; align-items: center; gap: 10px; }
  .lz-badge { font-size: 0.85rem; background: #cf3a3a; color: #fff; padding: 4px 10px; border-radius: 4px; font-weight: 900; }
  
  /* 入力欄の高さ統一設定 */
  .lz-input, .lz-textarea, .lz-select { padding: 16px; border: 2px solid #eee; border-radius: 12px; font-size: 1.15rem; background: #fafafa; width: 100%; box-sizing: border-box; -webkit-appearance: none; height: auto; }
  .lz-input:focus, .lz-textarea:focus, .lz-select:focus { border-color: #cf3a3a; background: #fff; outline: none; box-shadow: 0 0 0 4px rgba(207, 58, 58, 0.1); }

  /* チップ選択 */
  .lz-choice-flex { display: flex !important; flex-wrap: wrap !important; justify-content: flex-start !important; align-items: flex-start !important; gap: 6px !important; width: 100% !important; margin-bottom: 10px !important; }
  .lz-choice-item { position: relative !important; cursor: pointer !important; display: block !important; width: auto !important; flex: 0 0 auto !important; margin: 0 !important; }
  .lz-choice-inner { display: flex; align-items: center; justify-content: center; padding: 10px 18px; background: #fff; border: 1px solid #eee; border-radius: 12px; font-size: 1.1rem; font-weight: 800; color: #666; transition: 0.2s; min-height: 50px; box-sizing: border-box; }
  .lz-choice-item input { position: absolute; opacity: 0; pointer-events: none; }
  .lz-choice-item input:checked + .lz-choice-inner { background: #cf3a3a; border-color: #cf3a3a; color: #fff; }

  /* 🍎 画像アップロード・プレビュー */
  .lz-image-upload-container { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 10px; }
  .lz-image-preview { position: relative; width: 100px; height: 100px; border-radius: 12px; overflow: hidden; border: 2px solid #eee; background: #f9f9f9; }
  .lz-image-preview img { width: 100%; height: 100%; object-fit: cover; }
  .lz-image-delete { position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; background: rgba(0,0,0,0.6); color: #fff; border: none; border-radius: 50%; font-size: 14px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .lz-image-add-btn { width: 100px; height: 100px; border: 2px dashed #ccc; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; color: #999; transition: 0.3s; background: #fafafa; }
  .lz-image-add-btn:hover { border-color: #cf3a3a; color: #cf3a3a; background: #fff; }
  .lz-image-add-btn span { font-size: 24px; font-weight: bold; }
  .lz-image-add-btn small { font-size: 10px; font-weight: 800; }

  /* 曜日チップ下の余白調整 */
  .lz-day-selector { display: flex !important; flex-wrap: wrap !important; gap: 6px !important; margin-bottom: 24px !important; margin-top: 8px !important; }
  .lz-day-text { display: inline-flex; align-items: center; justify-content: center; width: 50px; height: 50px; background: #fff; border: 2px solid #eee; border-radius: 50%; font-weight: 800; font-size: 1.1rem; color: #888; }
  .lz-day-chip input:checked + .lz-day-text { background: #cf3a3a; border-color: #cf3a3a; color: #fff; }

  /* 営業時間・定休日（安定版ベース） */
  .lz-time-row { display: flex; flex-direction: column; gap: 14px; width: 100%; }
  .lz-time-field { display: flex; align-items: center; gap: 12px; }
  .lz-time-label-sm { font-size: 1rem; font-weight: 800; color: #888; min-width: 85px; }
  .lz-time-box { display: flex; align-items: center; gap: 6px; width: fit-content !important; }
  .lz-time-select { padding: 14px 6px; border-radius: 10px; border: 2px solid #eee; font-size: 1.2rem; cursor: pointer; background: #fff; width: 110px !important; text-align: center; }
  .lz-time-box.is-disabled { opacity: 0.2; pointer-events: none; }

  .lz-schedule-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; }
  .lz-schedule-table th, .lz-schedule-table td { padding: 14px 18px; border: 1px solid #eee; text-align: center; font-size: 1.1rem; }
  
  @media (max-width: 600px) {
    .lz-schedule-table td { position: relative; padding: 10px 0 10px 110px; text-align: left; min-height: 52px; display: flex; align-items: center; }
    .lz-schedule-table td::before { content: attr(data-label); position: absolute; left: 10px; font-weight: 900; color: #5b3a1e; font-size: 1rem; width: 95px; }
  }

  /* 住所検索ボタンと高さの同期 */
  .lz-zip-btn { background: #5b3a1e; color: #fff; border: none; padding: 0 20px; border-radius: 12px; font-weight: 800; cursor: pointer; height: 60px; font-size: 1.15rem; box-sizing: border-box; display: flex; align-items: center; justify-content: center; }
  .lz-input#zipCode, .lz-input#addressField { height: 60px; }

  .lz-send-btn { background: #cf3a3a; color: #fff; padding: 24px; border: none; border-radius: 99px; font-weight: 900; font-size: 1.5rem; cursor: pointer; margin-top: 60px; width: 100%; box-shadow: 0 10px 25px rgba(207, 58, 58, 0.2); }
  
  .lz-choice-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, auto)); gap: 8px; width: 100%; }
  .lz-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  @media (max-width: 600px) { .lz-grid { grid-template-columns: 1fr; } }
`;