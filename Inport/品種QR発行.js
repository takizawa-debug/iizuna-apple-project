function generateAndSaveQRCodes() {
  const spreadsheetId = '1ODqTU1KspNWDZq7NYICyeAjUOHNdQIV9TfFs9fpPKkU';
  const sheetName = '品種QR';
  const parentFolderId = '1drhXA8yZD9eMM_dkUidVdJzJyUwbTiF-'; 
  
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName(sheetName);
  const parentFolder = DriveApp.getFolderById(parentFolderId);
  
  // データ範囲を取得 (2行目から最終行まで)
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return;
  
  // B列(No.), C列(品種名), D列(URL)を取得 (2行目から、3列分)
  const data = sheet.getRange(2, 2, lastRow - 1, 3).getValues();

  data.forEach((row, index) => {
    const rawNo = row[0];   // B列: No.
    const variety = row[1]; // C列: 品種名
    const url = row[2];     // D列: URL
    
    if (variety && url) {
      try {
        // No.を2桁の文字列に変換（1 -> "01"）
        const formattedNo = ("0" + rawNo).slice(-2);
        // フォルダ・ファイル名を作成 (例: 01_シナノゴールド)
        const fullName = `${formattedNo}_${variety}`;
        
        // 1. 指定した名前で新規フォルダを作成
        const subFolder = parentFolder.createFolder(fullName);
        
        // 2. PNGの生成と保存
        const pngUrl = `https://quickchart.io/qr?size=300&text=${encodeURIComponent(url)}`;
        const pngResponse = UrlFetchApp.fetch(pngUrl);
        const pngBlob = pngResponse.getBlob().setName(`${fullName}.png`);
        subFolder.createFile(pngBlob);
        
        // 3. SVGの生成と保存
        const svgUrl = `https://quickchart.io/qr?format=svg&size=300&text=${encodeURIComponent(url)}`;
        const svgResponse = UrlFetchApp.fetch(svgUrl);
        const svgBlob = svgResponse.getBlob().setName(`${fullName}.svg`);
        subFolder.createFile(svgBlob);
        
        console.log(`保存完了: ${fullName}`);
        
        // 大量処理時の負荷軽減（少し待機）
        Utilities.sleep(500); 
        
      } catch (e) {
        console.error(`エラー発生 (${variety}): ${e.message}`);
      }
    }
  });
  
  Browser.msgBox("すべてのQRコードを番号付きフォルダに保存しました！");
}