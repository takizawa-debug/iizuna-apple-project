/**
 * フォームカテゴリ定義の動的取得プログラム (新規ファイル: フォーム設定.gs)
 * 役割: スプレッドシート「フォーム項目」から大ジャンル・小ジャンルの階層構造を取得する。
 */

const FORM_SETTING_SS_ID = '1ODqTU1KspNWDZq7NYICyeAjUOHNdQIV9TfFs9fpPKkU'; //
const GENRE_SHEET_NAME   = 'フォーム項目'; //

/**
 * スプレッドシートからカテゴリー情報を取得するメイン関数
 * @param {string} type - 'shop' または 'event'
 */
function getFormGenresData(type) {
  try {
    const ss = SpreadsheetApp.openById(FORM_SETTING_SS_ID);
    const sheet = ss.getSheetByName(GENRE_SHEET_NAME);
    
    if (!sheet) {
      return { ok: false, error: "シート「" + GENRE_SHEET_NAME + "」が見つかりません" };
    }

    const values = sheet.getDataRange().getValues();
    const dataRows = values.slice(1); // ヘッダー除外

    // 🍎 1. 参照する列のインデックスを決定 (0始まり)
    let l1Index, l2Index;
    if (type === 'event') {
      l1Index = 2; l2Index = 3; // C列, D列
    } else if (type === 'farmer') {
      l1Index = 4; l2Index = 5; // E列, F列
    } else if (type === 'other') {
      l1Index = 8; l2Index = 9; // I列, J列（記事・大ジャンル / 小ジャンル）
    } else {
      l1Index = 0; l2Index = 1; // A列, B列（shop: デフォルト）
    }

    // 🍎 2. 先にメインカテゴリー（genres）を組み立てる
    const genres = {};
    dataRows.forEach(row => {
      const l1 = String(row[l1Index] || "").trim(); // 大カテゴリ
      const l2 = String(row[l2Index] || "").trim(); // 小カテゴリ
      
      if (!l1) return;
      if (!genres[l1]) genres[l1] = [];
      if (l2 && !genres[l1].includes(l2)) genres[l1].push(l2);
    });

    // 🍎 3. その後に、品種(G列)・加工品(H列)を抽出して重複を削除
    const appleVarieties = dataRows.map(r => String(r[6] || "").trim()).filter(v => v);
    const appleProducts = dataRows.map(r => String(r[7] || "").trim()).filter(v => v);

    // 🍎 4. 最後にすべてのデータをまとめて返却する
    return { 
      ok: true, 
      items: genres, 
      appleVarieties: [...new Set(appleVarieties)], 
      appleProducts: [...new Set(appleProducts)] 
    };
  } catch (e) {
    return { ok: false, error: e.toString() };
  }
}

/**
 * 外部APIとしてデータを返すためのラッパー関数
 * @param {Object} e - doGet(e) から渡されるイベントオブジェクト
 */
function serveFormGenres(e) {
  // 🍎 URLパラメータ ?type=... を取得。指定がなければ 'shop' をデフォルトに
  const type = (e && e.parameter && e.parameter.type) ? e.parameter.type : 'shop';
  
  const result = getFormGenresData(type);
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}