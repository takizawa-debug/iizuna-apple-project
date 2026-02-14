/**
 * GAS - AWS S3 統合保存エンジン（プロフェッショナル版：列構成・カテゴリ整形強化）
 */

const AWS_CONFIG = {
  bucket: "appletown-iizuna",
  accessKey: "AKIAVSTYY36722WM6Z7X",
  secretKey: "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",
  region: "ap-northeast-1"
};

const SHEET_NAME_FOR_APP = "投稿一覧"; 

function doPost(e) {
  const lock = LockService.getScriptLock();
  let lastRowIndex = 0;
  let sheet = null;
zq
  try {
    lock.waitLock(30000);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    sheet = ss.getSheetByName(SHEET_NAME_FOR_APP) || ss.insertSheet(SHEET_NAME_FOR_APP);

    // 🍎 修正：ヘッダー定義（関連リンクを4列に分離）
    const headers = [
      "投稿日時", "種別(Tab)", "登録タイプ", "名称/タイトル", "概要/リード", "詳細本文", 
      "カテゴリ大", "カテゴリ小(動的)", "カテゴリその他(記述)",
      "画像URL 1", "画像URL 2", "画像URL 3", "画像URL 4", "画像URL 5", "画像URL 6",
      "添付ファイル名", "会場名/場所名", "郵便番号", "住所", "場所の注意事項",
      "営業モード", "営業曜日", "標準開始", "標準終了", "祝日設定", "営業注意事項",
      "月曜(始/終)", "火曜(始/終)", "水曜(始/終)", "木曜(始/終)", "金曜(始/終)", "土曜(始/終)", "日曜(始/終)",
      "開催区分", "開始日", "終了日", "イベント開始", "イベント終了", "参加費", "持ち物", "対象", "主催者名",
      "栽培品種", "品種その他", "加工品", "加工品その他", "作付面積", "面積単位", "従業員数", 
      "他栽培品目", "果物詳細", "野菜詳細", "その他品目詳細", "経営区分", "代表者名", "インボイス", "登録番号",
      "HP", "EC", 
      "関連URL1", "関連URL1_タイトル", "関連URL2", "関連URL2_タイトル", // 🍎 ここを分離
      "Instagram", "Facebook", "X", "LINE", "TikTok",
      "問い合わせ方法", "掲載用メール", "掲載用電話", "掲載用URL", "掲載用その他", "問い合わせ備考",
      "補足情報(備考)", "事務局代行希望", "投稿者名", "連絡用メール", "事務局メッセージ"
    ];

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers])
           .setBackground("#202124").setFontColor("#fff").setFontWeight("bold").setFrozenRows(1);
    }

    const d = JSON.parse(e.postData.contents);
    const getVal = (v) => (v === undefined || v === null || v === "") ? "" : v;
    const toCsv = (v) => Array.isArray(v) ? v.join(", ") : getVal(v);
    
    // 🍎 修正：タブの種類に基づいたデータ振分けロジック
    const tabLabel = d.rep_name ? "情報提供" : (d.inq_name ? "お問い合わせ" : "記事投稿");
    
    // 変数の初期化（記事投稿ベース）
    let regType = getVal(d.art_type);
    let posterName = getVal(d.cont_name);
    let contactEmail = getVal(d.admin_email);
    let adminMessage = getVal(d.admin_msg);
    let mainTitle = getVal(d.art_title);
    let mainBody = getVal(d.art_body);

    // 🍎 修正：情報提供・お問い合わせの場合は振分け先を変更
    if (tabLabel === "情報提供") {
      regType = ""; // 登録タイプを空にする
      posterName = getVal(d.rep_name);   // 投稿者名へ
      adminMessage = getVal(d.rep_content); // 事務局メッセージへ
      mainTitle = ""; mainBody = "";      // 記事用エリアは空にする
    } else if (tabLabel === "お問い合わせ") {
      regType = ""; // 登録タイプを空にする
      posterName = getVal(d.inq_name);   // 投稿者名へ
      contactEmail = getVal(d.inq_email); // 連絡用メールへ
      adminMessage = getVal(d.inq_content); // 事務局メッセージへ
      mainTitle = ""; mainBody = "";      // 記事用エリアは空にする
    }

    // 🍎 【重要】カテゴリの親子紐付けを正確に行うロジック
    // 1. マスターリストを取得して大カテゴリの「本来の順番（インデックス）」を特定する
    const genreMaster = getFormGenresData(getVal(d.art_type)).items || {};
    const masterL1Names = Object.keys(genreMaster);

    let formattedCategory = "";
    if (d.cat_l1) {
      const selectedL1 = Array.isArray(d.cat_l1) ? d.cat_l1 : [d.cat_l1];
      
      formattedCategory = selectedL1.map(l1Name => {
        // マスター内でのインデックスを探す（これが logic.js の gen-X に対応）
        const mIdx = masterL1Names.indexOf(l1Name);
        // そのインデックスに対応する小カテゴリのデータを取得
        const subVals = d[`cat_gen-${mIdx}`];
        
        if (subVals) {
          const subStr = Array.isArray(subVals) ? subVals.join(", ") : subVals;
          return `${l1Name}（${subStr}）`;
        }
        return l1Name;
      }).join(" / ");
    }

    const getDayHours = (day) => {
      if (d[`c_closed_${day}`] === "on") return "休業";
      const startH = getVal(d[`c_s_${day}_h`]);
      const startM = getVal(d[`c_s_${day}_m`]);
      const endH = getVal(d[`c_e_${day}_h`]);
      const endM = getVal(d[`c_e_${day}_m`]);
      if (!startH && !endH) return "";
      return `${startH}:${startM} - ${endH}:${endM}`;
    };

    const timestamp = Utilities.formatDate(new Date(), "JST", "yyyyMMddHHmm");
    const titleBase = (d.art_title || d.rep_name || d.inq_name || "untitled").replace(/[\s\t\n\/\\?%*:|"<>]/g, "_");
    const folderPath = `${timestamp}_${titleBase}`;

    // Step 1: シートへの書き込み（全79項目、中略なし完全版）
    const isArticle = (tabLabel === "記事投稿");

    const row = [
      new Date(),                                         // 1. 投稿日時
      tabLabel,                                           // 2. 種別(Tab)
      regType,                                            // 3. 登録タイプ（Report/Inquiryなら空）
      mainTitle,                                          // 4. 名称/タイトル（Report/Inquiryなら空）
      isArticle ? getVal(d.art_lead) : "",                // 5. 概要/リード
      mainBody,                                           // 6. 詳細本文（Report/Inquiryなら空）
      isArticle ? toCsv(d.cat_l1) : "",                   // 7. カテゴリ大
      isArticle ? formattedCategory : "",                 // 8. カテゴリ小(整形済み)
      isArticle ? getVal(d.cat_root_other_val) : "",      // 9. カテゴリその他
      "", "", "", "", "", "",                             // 10-15. 画像URL (後ほど挿入するため空)
      getVal(d.art_file_name),                            // 16. 添付ファイル名
      isArticle ? getVal(d.ev_venue_name) : "",           // 17. 会場名/場所名
      isArticle ? getVal(d.shop_zip) : "",                // 18. 郵便番号
      isArticle ? getVal(d.shop_addr) : "",               // 19. 住所
      isArticle ? getVal(d.shop_notes) : "",              // 20. 場所の注意事項
      isArticle ? getVal(d.shop_mode) : "",               // 21. 営業モード
      isArticle ? toCsv(d.simple_days) : "",              // 22. 営業曜日
      isArticle ? (getVal(d.simple_s_h) ? `${d.simple_s_h}:${d.simple_s_m}` : "") : "", // 23. 標準開始
      isArticle ? (getVal(d.simple_e_h) ? `${d.simple_e_h}:${d.simple_e_m}` : "") : "", // 24. 標準終了
      isArticle ? getVal(d.shop_holiday_type) : "",       // 25. 祝日設定
      isArticle ? getVal(d.shop_notes_biz) : "",          // 26. 営業注意事項
      isArticle ? getDayHours("月") : "",                 // 27. 月曜
      isArticle ? getDayHours("火") : "",                 // 28. 火曜
      isArticle ? getDayHours("水") : "",                 // 29. 水曜
      isArticle ? getDayHours("木") : "",                 // 30. 木曜
      isArticle ? getDayHours("金") : "",                 // 31. 金曜
      isArticle ? getDayHours("土") : "",                 // 32. 土曜
      isArticle ? getDayHours("日") : "",                 // 33. 日曜
      isArticle ? getVal(d.ev_period_type) : "",          // 34. 開催区分 (single等の混入防止)
      isArticle ? getVal(d.ev_sdate) : "",                // 35. 開始日
      isArticle ? getVal(d.ev_edate) : "",                // 36. 終了日
      isArticle ? (getVal(d.ev_s_h) ? `${d.ev_s_h}:${d.ev_s_m}` : "") : "", // 37. イベント開始
      isArticle ? (getVal(d.ev_e_h) ? `${d.ev_e_h}:${d.ev_e_m}` : "") : "", // 38. イベント終了
      isArticle ? getVal(d.ev_fee) : "",                  // 39. 参加費
      isArticle ? getVal(d.ev_items) : "",                // 40. 持ち物
      isArticle ? getVal(d.ev_target) : "",               // 41. 対象
      isArticle ? getVal(d.ev_org_name) : "",             // 42. 主催者名
      isArticle ? toCsv(d.pr_variety) : "",               // 43. 栽培品種
      isArticle ? getVal(d.pr_variety_other) : "",        // 44. 品種その他
      isArticle ? toCsv(d.pr_product) : "",               // 45. 加工品
      isArticle ? getVal(d.pr_product_other) : "",        // 46. 加工品その他
      isArticle ? getVal(d.pr_area) : "",                 // 47. 作付面積
      isArticle ? getVal(d.pr_area_unit) : "",            // 48. 面積単位
      isArticle ? getVal(d.pr_staff) : "",                // 49. 従業員数
      isArticle ? toCsv(d.pr_other_crops) : "",           // 50. 他栽培品目
      isArticle ? getVal(d.pr_crop_fruit_val) : "",       // 51. 果物詳細
      isArticle ? getVal(d.pr_crop_veg_val) : "",         // 52. 野菜詳細
      isArticle ? getVal(d.pr_crop_other_val) : "",       // 53. その他品目詳細
      isArticle ? getVal(d.pr_ent_type) : "",             // 54. 経営区分
      isArticle ? getVal(d.pr_rep_name) : "",             // 55. 代表者名
      isArticle ? getVal(d.pr_invoice) : "",              // 56. インボイス
      isArticle ? getVal(d.pr_invoice_num) : "",          // 57. 登録番号
      isArticle ? getVal(d.url_home) : "",                // 58. HP
      isArticle ? getVal(d.url_ec) : "",                  // 59. EC
      isArticle ? getVal(d.rel_url1) : "",                // 60. 関連URL1
      isArticle ? getVal(d.rel_title1) : "",              // 61. 関連URL1_タイトル
      isArticle ? getVal(d.rel_url2) : "",                // 62. 関連URL2
      isArticle ? getVal(d.rel_title2) : "",              // 63. 関連URL2_タイトル
      isArticle ? getVal(d.sns_ig) : "",                  // 64. Instagram
      isArticle ? getVal(d.sns_fb) : "",                  // 65. Facebook
      isArticle ? getVal(d.sns_x) : "",                   // 66. X
      isArticle ? getVal(d.sns_line) : "",                // 67. LINE
      isArticle ? getVal(d.sns_tt) : "",                  // 68. TikTok
      isArticle ? toCsv(d.cm) : "",                       // 69. 問い合わせ方法
      isArticle ? getVal(d.cm_mail) : "",                 // 70. 掲載用メール
      isArticle ? getVal(d.cm_tel) : "",                  // 71. 掲載用電話
      isArticle ? getVal(d.cm_url) : "",                  // 72. 掲載用URL
      isArticle ? getVal(d.cm_other_val) : "",            // 73. 掲載用その他
      isArticle ? getVal(d.cm_notes) : "",                // 74. 問い合わせ備考
      getVal(d.art_memo),                                 // 75. 補足情報(備考)
      isArticle ? (d.writing_assist ? "希望する" : "しない") : "", // 76. 事務局代行希望
      posterName,                                         // 77. 投稿者名
      contactEmail,                                       // 78. 連絡用メール
      adminMessage                                        // 79. 事務局メッセージ
    ];

    sheet.appendRow(row);
    lastRowIndex = sheet.getLastRow();

    // --- AWS S3 保存処理（変更なし） ---
    if (d.images && d.images.length > 0) {
      d.images.forEach((b64, i) => {
        if (i >= 6) return;
        try {
          const content = b64.split(",");
          const contentType = content[0].split(":")[1].split(";")[0];
          const bytes = Utilities.base64Decode(content[1]);
          const fileName = `${String(i + 1).padStart(3, '0')}.jpg`;
          const s3Key = `${folderPath}/${fileName}`;
          const blob = Utilities.newBlob(bytes, contentType, s3Key);
          const s3Url = uploadToS3(blob);
          sheet.getRange(lastRowIndex, 10 + i).setValue(s3Url);
        } catch(err) { sheet.getRange(lastRowIndex, 10 + i).setValue(`Error: ${err.toString()}`); }
      });
    }

    if (d.art_file_data) {
      try {
        const fileContent = d.art_file_data.split(",");
        const fileBytes = Utilities.base64Decode(fileContent[1]);
        const s3Key = `${folderPath}/files/${d.art_file_name}`;
        const blob = Utilities.newBlob(fileBytes, fileContent[0].split(":")[1].split(";")[0], s3Key);
        const fileUrl = uploadToS3(blob);
        sheet.getRange(lastRowIndex, 16).setValue(fileUrl);
      } catch(err) { sheet.getRange(lastRowIndex, 16).setValue(`File Error: ${err.toString()}`); }
    }

    return ContentService.createTextOutput(JSON.stringify({"ok": true})).setMimeType(ContentService.MimeType.JSON);

  } catch (f) {
    return ContentService.createTextOutput(JSON.stringify({"ok": false, "error": f.toString()})).setMimeType(ContentService.MimeType.JSON);
  } finally { lock.releaseLock(); }
}

/**
 * AWS S3 署名付きアップロード（変更なし）
 */
function uploadToS3(blob) {
  const s3Key = blob.getName(); 
  const encodedKey = s3Key.split('/').map(p => encodeURIComponent(p)).join('/');
  const host = `${AWS_CONFIG.bucket}.s3.${AWS_CONFIG.region}.amazonaws.com`;
  const endpoint = `https://${host}/${encodedKey}`;
  const contentType = blob.getContentType();
  const bytes = blob.getBytes();
  const date = Utilities.formatDate(new Date(), "GMT", "yyyyMMdd'T'HHmmss'Z'");
  const datestamp = date.substr(0, 8);
  const hashedPayload = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, bytes).map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');
  const canonicalRequest = ["PUT", "/" + encodedKey, "", "host:" + host, "x-amz-content-sha256:" + hashedPayload, "x-amz-date:" + date, "", "host;x-amz-content-sha256;x-amz-date", hashedPayload].join("\n");
  const hashedCanonicalRequest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, canonicalRequest).map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');
  const stringToSign = `AWS4-HMAC-SHA256\n${date}\n${datestamp}/${AWS_CONFIG.region}/s3/aws4_request\n${hashedCanonicalRequest}`;
  const signingKey = getSignatureKey(AWS_CONFIG.secretKey, datestamp, AWS_CONFIG.region, "s3");
  const signature = Utilities.computeHmacSha256Signature(Utilities.newBlob(stringToSign).getBytes(), signingKey).map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');
  const authHeader = `AWS4-HMAC-SHA256 Credential=${AWS_CONFIG.accessKey}/${datestamp}/${AWS_CONFIG.region}/s3/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=${signature}`;
  const options = { method: "PUT", contentType: contentType, payload: bytes, headers: { "Authorization": authHeader, "x-amz-date": date, "x-amz-content-sha256": hashedPayload }, muteHttpExceptions: true };
  const response = UrlFetchApp.fetch(endpoint, options);
  if (response.getResponseCode() == 200) return endpoint;
  throw new Error(`S3 Error ${response.getResponseCode()}: ${response.getContentText()}`);
}

function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate = Utilities.computeHmacSha256Signature(dateStamp, "AWS4" + key);
  const kRegion = Utilities.computeHmacSha256Signature(Utilities.newBlob(regionName).getBytes(), kDate);
  const kService = Utilities.computeHmacSha256Signature(Utilities.newBlob(serviceName).getBytes(), kRegion);
  return Utilities.computeHmacSha256Signature(Utilities.newBlob("aws4_request").getBytes(), kService);
}