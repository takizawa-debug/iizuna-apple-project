/********** 対象シート **********/
const TARGET_SHEETS = ['知る', '味わう', '体験する', '働く・住む', '販売・発信する'];

/********** 設定 **********/
const START_ROW = 4;                               // データ開始行
const COL_E = 5;                                   // E列=大カテゴリ
const COL_F = 6;                                   // F列=中カテゴリ
const COL_G = 7;                                   // G列=小カテゴリ

const CATEGORIES_SHEET_NAME = 'カテゴリ';            // 大/中/小カテゴリのマスタ
const HELPER_MID_BASE   = '_dv_中カテゴリ__';         // 例）_dv_中カテゴリ__知る
const HELPER_SMALL_BASE = '_dv_小カテゴリ__';         // 例）_dv_小カテゴリ__知る

const MAX_OPTIONS_MID   = 200;                     // 中カテゴリ候補の最大想定数
const MAX_OPTIONS_SMALL = 200;                     // 小カテゴリ候補の最大想定数

/********** 自動同期（メニュー無し） **********/
function onOpen() { /* 何もしない */ }

/**
 * どんな編集でも呼ばれる。
 * - E/F の差分を検知して必要行だけ F/G のデータ検証を張り直し
 */
function onEdit(e) {
  try {
    if (!e || !e.range) return;
    const sheet = e.range.getSheet();
    const sheetName = String(sheet.getName()).trim();

    // 対象シートのみ実行 / マスタや補助は無視
    if (!TARGET_SHEETS.includes(sheetName)) return;
    if (sheetName === CATEGORIES_SHEET_NAME) return;
    if (sheetName.startsWith(HELPER_MID_BASE) || sheetName.startsWith(HELPER_SMALL_BASE)) return;

    const HELPER_MID_NAME   = HELPER_MID_BASE   + sheetName;
    const HELPER_SMALL_NAME = HELPER_SMALL_BASE + sheetName;

    syncDueToEFChanges_(sheet, HELPER_MID_NAME, HELPER_SMALL_NAME);
  } catch (err) {
    console.error(err);
  }
}

/********** 中核：E/Fの差分検知→F/Gの検証を必要行だけ更新（シート別補助シート） **********/
function syncDueToEFChanges_(sheet, HELPER_MID_NAME, HELPER_SMALL_NAME) {
  const ss = sheet.getParent();

  ensureHelperSheet_(ss, HELPER_MID_NAME);
  ensureHelperSheet_(ss, HELPER_SMALL_NAME);

  const lastRow = Math.max(sheet.getLastRow(), START_ROW);
  const rows = lastRow - START_ROW + 1;
  if (rows < 1) return;

  // 現在のE/Fを取得
  const eVals = sheet.getRange(START_ROW, COL_E, rows, 1).getValues().map(r => valueOrNull_(r[0]));
  const fVals = sheet.getRange(START_ROW, COL_F, rows, 1).getValues().map(r => valueOrNull_(r[0]));

  // 直前スナップショット（シートごとにキーを分離）
  const props = PropertiesService.getDocumentProperties();
  const keyE = `E_CACHE_JSON__${sheet.getSheetId()}`;
  const keyF = `F_CACHE_JSON__${sheet.getSheetId()}`;
  const prevE = jsonOrEmpty_(props.getProperty(keyE));
  const prevF = jsonOrEmpty_(props.getProperty(keyF));

  // 変化行を抽出
  const eChangedRows = [];
  const fChangedRows = [];
  for (let i = 0; i < rows; i++) {
    const rowIndex = START_ROW + i;
    if ((prevE[i] ?? null) !== (eVals[i] ?? null)) eChangedRows.push(rowIndex);
    if ((prevF[i] ?? null) !== (fVals[i] ?? null)) fChangedRows.push(rowIndex);
  }

  // Eが変わった行：Fの候補を再構築し、整合性処理
  eChangedRows.forEach(r => {
    applyMiddleValidationRow_(sheet, r, HELPER_MID_NAME);

    const eVal = valueOrNull_(sheet.getRange(r, COL_E).getValue());
    if (!eVal) {
      sheet.getRange(r, COL_F).clearContent().clearDataValidations();
      sheet.getRange(r, COL_G).clearContent().clearDataValidations();
    } else {
      applySmallValidationRow_(sheet, r, HELPER_SMALL_NAME);
      const fVal = valueOrNull_(sheet.getRange(r, COL_F).getValue());
      if (!fVal) sheet.getRange(r, COL_G).clearContent().clearDataValidations();
    }
  });

  // Fが変わった行：Gの候補を再構築
  fChangedRows.forEach(r => {
    applySmallValidationRow_(sheet, r, HELPER_SMALL_NAME);
    const fVal = valueOrNull_(sheet.getRange(r, COL_F).getValue());
    if (!fVal) sheet.getRange(r, COL_G).clearContent().clearDataValidations();
  });

  // スナップショットを更新（シート別）
  props.setProperty(keyE, JSON.stringify(eVals));
  props.setProperty(keyF, JSON.stringify(fVals));
}

/********** 行単位：F（中カテゴリ）のプルダン設定 **********/
function applyMiddleValidationRow_(dataSheet, row, HELPER_MID_NAME) {
  const ss = dataSheet.getParent();
  const helper = ensureHelperSheet_(ss, HELPER_MID_NAME);

  const colInHelper = row - START_ROW + 1; // 行→補助シートの列に割当
  ensureHelperCapacity_(helper, colInHelper, MAX_OPTIONS_MID);

  const eA1 = `${dataSheet.getName()}!E${row}`;
  // =IF(Erow="","",UNIQUE(FILTER(カテゴリ!B2:B, カテゴリ!A2:A=Erow)))
  const formula = `=IF(${eA1}="","",UNIQUE(FILTER('${CATEGORIES_SHEET_NAME}'!$B$2:$B, '${CATEGORIES_SHEET_NAME}'!$A$2:$A=${eA1})))`;
  helper.getRange(1, colInHelper).setFormula(formula);
  if (MAX_OPTIONS_MID > 1) helper.getRange(2, colInHelper, MAX_OPTIONS_MID - 1, 1).clearContent();

  const candidatesRange = helper.getRange(1, colInHelper, MAX_OPTIONS_MID, 1);
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(candidatesRange, true)  // プルダン表示
    .setAllowInvalid(false)                      // 候補外の入力は不可
    .build();
  dataSheet.getRange(row, COL_F).setDataValidation(rule);
}

/********** 行単位：G（小カテゴリ）のプルダン設定 **********/
function applySmallValidationRow_(dataSheet, row, HELPER_SMALL_NAME) {
  const ss = dataSheet.getParent();
  const helper = ensureHelperSheet_(ss, HELPER_SMALL_NAME);

  const colInHelper = row - START_ROW + 1; // 行→補助シートの列に割当
  ensureHelperCapacity_(helper, colInHelper, MAX_OPTIONS_SMALL);

  const fA1 = `${dataSheet.getName()}!F${row}`;
  // =IF(Frow="","",UNIQUE(FILTER(カテゴリ!C2:C, カテゴリ!B2:B=Frow)))
  const formula = `=IF(${fA1}="","",UNIQUE(FILTER('${CATEGORIES_SHEET_NAME}'!$C$2:$C, '${CATEGORIES_SHEET_NAME}'!$B$2:$B=${fA1})))`;
  helper.getRange(1, colInHelper).setFormula(formula);
  if (MAX_OPTIONS_SMALL > 1) helper.getRange(2, colInHelper, MAX_OPTIONS_SMALL - 1, 1).clearContent();

  const candidatesRange = helper.getRange(1, colInHelper, MAX_OPTIONS_SMALL, 1);
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(candidatesRange, true)
    .setAllowInvalid(false)
    .build();
  dataSheet.getRange(row, COL_G).setDataValidation(rule);
}

/********** 補助：補助シートの存在保証＆非表示化 **********/
function ensureHelperSheet_(ss, name) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  sh.hideSheet();
  return sh;
}

/********** 補助：補助シートのサイズ自動拡張 **********/
function ensureHelperCapacity_(sh, needCols, needRows){
  const curCols = sh.getMaxColumns();
  const curRows = sh.getMaxRows();
  if (curCols < needCols) sh.insertColumnsAfter(curCols, needCols - curCols);
  if (curRows < needRows) sh.insertRowsAfter(curRows, needRows - curRows);
}

/********** 補助：値正規化・JSONパース **********/
function valueOrNull_(v) {
  if (v === '' || v === null || typeof v === 'undefined') return null;
  if (typeof v === 'string' && v.trim() === '') return null;
  return v;
}
function jsonOrEmpty_(txt) {
  try { return txt ? JSON.parse(txt) : []; }
  catch (e) { return []; }
}
