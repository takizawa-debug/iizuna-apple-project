/**
 * カテゴリ連動プルダウン最適化版
 * 
 * 下記のロジックで動作します：
 * 1. ユーザーが対象シートの「大カテゴリ(E列)」または「中カテゴリ(F列)」を変更する。
 * 2. プログラムが「カテゴリ」シート（マスタ）を読み取る。
 * 3. 選択された親カテゴリに基づいて、子カテゴリの候補リストを生成する。
 * 4. 子カテゴリのセル（F列またはG列）に、「入力規則（プルダウン）」を直接セットする。
 * 
 * これにより、計算用シート（Helper Sheet）やFILTER関数が不要になり、動作が高速化します。
 */

const CATEGORIES_SHEET_NAME = 'カテゴリ';
const TARGET_SHEETS = ['知る', '知る（品種）', '味わう', '体験する', '働く・住む', '販売・発信する'];

const START_ROW = 4; // データ開始行
const COL_E = 5;     // 大カテゴリ (L1)
const COL_F = 6;     // 中カテゴリ (L2)
const COL_G = 7;     // 小カテゴリ (L3)


/**
 * 編集時トリガー
 */
function onEdit(e) {
  // トリガーオブジェクトの基本的なチェック
  if (!e || !e.range) return;

  const sheet = e.range.getSheet();
  const sheetName = sheet.getName();

  // 対象シート以外は無視
  if (!TARGET_SHEETS.includes(sheetName)) return;

  const range = e.range;
  const rowStart = range.getRow();
  const rowEnd = range.getLastRow();
  const colStart = range.getColumn();
  const colEnd = range.getLastColumn();

  // ヘッダー行以前の編集は無視
  if (rowEnd < START_ROW) return;

  // E列(5), F列(6), H列(8) が編集範囲に含まれているかチェック
  // - H列: Formulaのドライバ（これが変わるとEが変わる）
  const COL_H = 8;
  const isL1Edited = (colStart <= COL_E && colEnd >= COL_E);
  const isL2Edited = (colStart <= COL_F && colEnd >= COL_F);
  const isDriverEdited = (colStart <= COL_H && colEnd >= COL_H);

  if (!isL1Edited && !isL2Edited && !isDriverEdited) return;

  // マスタデータの取得
  const ss = e.source || sheet.getParent(); // e.sourceが稀に無い場合への保険
  const masterSheet = ss.getSheetByName(CATEGORIES_SHEET_NAME);
  if (!masterSheet) return;

  const masterLastRow = masterSheet.getLastRow();
  if (masterLastRow < 2) return;

  // 全データ取得はコストが高いので、必要な時だけ取る
  const masterValues = masterSheet.getRange(2, 1, masterLastRow - 1, 3).getValues();

  // 編集された行を1行ずつ処理
  for (let r = rowStart; r <= rowEnd; r++) {
    if (r < START_ROW) continue;

    // L1更新トリガー: E列直接編集 OR H列(ドライバ)編集
    if (isL1Edited || isDriverEdited) {
      updateL2Validation_(sheet, r, masterValues);
    }

    // L2更新トリガー: F列直接編集
    if (isL2Edited) {
      updateL3Validation_(sheet, r, masterValues);
    }
  }
}

/**
 * L1(E列)の値に基づいて、L2(F列)のプルダウンを更新し、L3(G列)をクリアする
 */
function updateL2Validation_(sheet, row, masterValues) {
  const l1Val = String(sheet.getRange(row, COL_E).getValue()).trim();
  const cellL2 = sheet.getRange(row, COL_F);
  const cellL3 = sheet.getRange(row, COL_G);

  // L1が空なら、L2, L3も入力規則削除
  if (!l1Val) {
    cellL2.clearDataValidations().clearContent(); // 値もクリア
    cellL3.clearDataValidations().clearContent();
    return;
  }

  // マスタから L1 に一致する L2 のリストを作成 (B列)
  const l2Options = new Set();
  masterValues.forEach(rowVal => {
    // rowVal = [L1, L2, L3]
    const mL1 = String(rowVal[0]).trim();
    const mL2 = String(rowVal[1]).trim();
    if (mL1 === l1Val && mL2 !== "") {
      l2Options.add(mL2);
    }
  });

  const optionsArr = Array.from(l2Options);

  // 候補がある場合のみプルダウン設定
  if (optionsArr.length > 0) {
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(optionsArr, true)
      .setAllowInvalid(false) // 厳密にチェック
      .build();
    cellL2.setDataValidation(rule);
  } else {
    // 候補がない＝マスタ不整合などの可能性
    // 既存の入力規則を消す
    cellL2.clearDataValidations();
  }

  // 既存の値がリストになければクリア (コピペ対策も兼ねる)
  const currentL2 = String(cellL2.getValue()).trim();
  if (currentL2 && !l2Options.has(currentL2)) {
    cellL2.setValue(null);
  }

  // L3はL1変更に伴い文脈が変わるため無条件クリア＆規則削除
  cellL3.clearDataValidations().clearContent();
}

/**
 * L1(E列) と L2(F列) の値に基づいて、L3(G列)のプルダウンを更新する
 */
function updateL3Validation_(sheet, row, masterValues) {
  const l1Val = String(sheet.getRange(row, COL_E).getValue()).trim();
  const l2Val = String(sheet.getRange(row, COL_F).getValue()).trim();
  const cellL3 = sheet.getRange(row, COL_G);

  // 親が指定されていなければクリア
  if (!l1Val || !l2Val) {
    cellL3.clearDataValidations().clearContent();
    return;
  }

  // マスタから L1 かつ L2 に一致する L3 のリストを作成 (C列)
  const l3Options = new Set();
  masterValues.forEach(rowVal => {
    const mL1 = String(rowVal[0]).trim();
    const mL2 = String(rowVal[1]).trim();
    const mL3 = String(rowVal[2]).trim(); // 小カテゴリ
    if (mL1 === l1Val && mL2 === l2Val && mL3 !== "") {
      l3Options.add(mL3);
    }
  });

  const optionsArr = Array.from(l3Options);

  if (optionsArr.length > 0) {
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(optionsArr, true)
      .setAllowInvalid(false)
      .build();
    cellL3.setDataValidation(rule);
  } else {
    cellL3.clearDataValidations();
  }

  // 値の整合性チェック
  const currentL3 = String(cellL3.getValue()).trim();
  if (currentL3 && !l3Options.has(currentL3)) {
    cellL3.setValue(null);
  }
}
