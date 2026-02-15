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
const TARGET_SHEETS = ['知る', '味わう', '体験する', '働く・住む', '販売・発信する'];

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

  // E列(5) または F列(6) が編集範囲に含まれているかチェック
  // 含まれていなければ何もしない
  const isL1Edited = (colStart <= COL_E && colEnd >= COL_E);
  const isL2Edited = (colStart <= COL_F && colEnd >= COL_F);

  if (!isL1Edited && !isL2Edited) return;

  // マスタデータの取得 (キャッシュ推奨だが、onEdit内で都度取得でも通常は十分高速)
  // [A列(大), B列(中), C列(小)]
  const masterSheet = e.source.getSheetByName(CATEGORIES_SHEET_NAME);
  if (!masterSheet) return;

  // マスタデータ全取得 (A2:C)
  const masterLastRow = masterSheet.getLastRow();
  if (masterLastRow < 2) return;
  const masterValues = masterSheet.getRange(2, 1, masterLastRow - 1, 3).getValues();

  // 編集された行を1行ずつ処理 (コピペで複数行変更された場合に対応)
  for (let r = rowStart; r <= rowEnd; r++) {
    if (r < START_ROW) continue;

    // --- Case 1: E列 (大カテゴリ) が変更された場合 ---
    if (isL1Edited) {
      updateL2Validation_(sheet, r, masterValues);
    }

    // --- Case 2: F列 (中カテゴリ) が変更された場合 ---
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

  // L1が空なら、L2, L3もクリアして入力規則削除
  if (!l1Val) {
    cellL2.clearContent().clearDataValidations();
    cellL3.clearContent().clearDataValidations();
    return;
  }

  // マスタから L1 に一致する L2 のリストを作成 (B列)
  // 重複排除 (Set使用)
  const l2Options = new Set();
  masterValues.forEach(rowVal => {
    // rowVal = [L1, L2, L3]
    const mL1 = String(rowVal[0]).trim();
    const mL2 = String(rowVal[1]).trim();
    if (mL1 === l1Val && mL2) {
      l2Options.add(mL2);
    }
  });

  const optionsArr = Array.from(l2Options);

  // 候補がある場合のみプルダウン設定
  if (optionsArr.length > 0) {
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(optionsArr, true)
      .setAllowInvalid(false) // 違反値は拒否（または警告のみにするなら setAllowInvalid(true)）
      .build();
    cellL2.setDataValidation(rule);
  } else {
    // 候補がない場合は入力規則削除（自由入力にするか、クリアするかは要件次第だが一旦クリア）
    cellL2.clearDataValidations();
  }

  // L1が変わったら、既存のL2値は不整合になる可能性が高いのでクリアするのが一般的だが、
  // ユーザーの誤操作防止のため「値がリストになければクリア」等の親切設計も可能。
  // ここではシンプルに「常に中身はクリア」とする（新しい親を選んだのだから子はリセット）
  // ただし、すでに正しい値が入っている場合（コピペ時など）を考慮し、
  // 「現在の値が新リストに含まれていなければクリア」とするのがベスト。
  const currentL2 = String(cellL2.getValue()).trim();
  if (currentL2 && !l2Options.has(currentL2)) {
    cellL2.setValue(null);
  }

  // L3はL1変更に伴い文脈が変わるため無条件クリア＆規則削除
  cellL3.clearContent().clearDataValidations();
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
    cellL3.clearContent().clearDataValidations();
    return;
  }

  // マスタから L1 かつ L2 に一致する L3 のリストを作成 (C列)
  const l3Options = new Set();
  masterValues.forEach(rowVal => {
    const mL1 = String(rowVal[0]).trim();
    const mL2 = String(rowVal[1]).trim();
    const mL3 = String(rowVal[2]).trim(); // 小カテゴリ
    if (mL1 === l1Val && mL2 === l2Val && mL3) {
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

