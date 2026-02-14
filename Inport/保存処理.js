/**
 * GAS - AWS S3 統合保存エンジン ＋ Gmailエイリアスからのメール通知機能（最終決定版）
 */

// 🍎【要設定】管理者用の通知先メールアドレス
const ADMIN_EMAIL = "takizawa@mimizuya.co.jp"; 
// 🍎【要設定】送信元として表示するGmailアドレス（Gmailでエイリアス設定済みのもの）
const FROM_EMAIL_ALIAS = "ringoiizuna@gmail.com";
// 🍎【要設定】送信者名
const SENDER_NAME = "飯綱町ウェブサイト";

/**
 * AWS設定
 */
const scriptProperties = PropertiesService.getScriptProperties();
const AWS_CONFIG = {
  bucket: "appletown-iizuna",
  accessKey: scriptProperties.getProperty('AWS_ACCESS_KEY_ID'),
  secretKey: scriptProperties.getProperty('AWS_SECRET_ACCESS_KEY'),
  region: "ap-northeast-1"
};

if (!AWS_CONFIG.accessKey || !AWS_CONFIG.secretKey) {
  throw new Error('AWSの認証情報がスクリプトプロパティに設定されていません。');
}

const SHEET_NAME_FOR_APP = "投稿一覧";

function doPost(e) {
  const lock = LockService.getScriptLock();
  let lastRowIndex = 0;
  let sheet = null;

  try {
    lock.waitLock(30000);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    sheet = ss.getSheetByName(SHEET_NAME_FOR_APP) || ss.insertSheet(SHEET_NAME_FOR_APP);

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
      "関連URL1", "関連URL1_タイトル", "関連URL2", "関連URL2_タイトル",
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

    const tabLabel = d.rep_name ? "情報提供" : (d.inq_name ? "お問い合わせ" : "記事投稿");

    let regType = getVal(d.art_type);
    let posterName = getVal(d.cont_name);
    let contactEmail = getVal(d.admin_email);
    let adminMessage = getVal(d.admin_msg);
    let mainTitle = getVal(d.art_title);
    let mainBody = getVal(d.art_body);

    if (tabLabel === "情報提供") {
      regType = "";
      posterName = getVal(d.rep_name);
      contactEmail = ""; 
      adminMessage = getVal(d.rep_content);
      mainTitle = ""; mainBody = "";
    } else if (tabLabel === "お問い合わせ") {
      regType = "";
      posterName = getVal(d.inq_name);
      contactEmail = getVal(d.inq_email);
      adminMessage = getVal(d.inq_content);
      mainTitle = ""; mainBody = "";
    }

    const genreMaster = getFormGenresData(getVal(d.art_type)).items || {};
    const masterL1Names = Object.keys(genreMaster);

    let formattedCategory = "";
    if (d.cat_l1) {
      const selectedL1 = Array.isArray(d.cat_l1) ? d.cat_l1 : [d.cat_l1];
      formattedCategory = selectedL1.map(l1Name => {
        const mIdx = masterL1Names.indexOf(l1Name);
        if (mIdx === -1) return l1Name; // マスターにない場合はそのまま
        const subVals = d[`cat_gen-${mIdx}`];
        if (subVals) {
          const subStr = Array.isArray(subVals) ? subVals.join(", ") : subVals;
          return `${l1Name}（${subStr}）`;
        }
        return l1Name;
      }).join(" / ");
    }

    const getDayHours = (dayIndex) => {
      if (d[`c_closed_${dayIndex}`] === "on") return "休業";
      const startH = getVal(d[`c_s_${dayIndex}_h`]);
      const startM = getVal(d[`c_s_${dayIndex}_m`]);
      const endH = getVal(d[`c_e_${dayIndex}_h`]);
      const endM = getVal(d[`c_e_${dayIndex}_m`]);
      if (!startH && !endH) return "";
      return `${startH}:${startM} - ${endH}:${endM}`;
    };

    const timestamp = Utilities.formatDate(new Date(), "JST", "yyyyMMddHHmm");
    const titleBase = (d.art_title || d.rep_name || d.inq_name || "untitled").replace(/[\s\t\n\/\\?%*:|"<>]/g, "_");
    const folderPath = `${timestamp}_${titleBase}`;

    const isArticle = (tabLabel === "記事投稿");
    const rowData = [
      new Date(), tabLabel, regType, mainTitle, isArticle ? getVal(d.art_lead) : "", mainBody,
      isArticle ? toCsv(d.cat_l1) : "", isArticle ? formattedCategory : "", isArticle ? getVal(d.cat_root_other_val) : "",
      "", "", "", "", "", "",
      getVal(d.art_file_name), isArticle ? getVal(d.ev_venue_name) : "", isArticle ? getVal(d.shop_zip) : "",
      isArticle ? getVal(d.shop_addr) : "", isArticle ? getVal(d.shop_notes) : "", isArticle ? getVal(d.shop_mode) : "",
      isArticle ? toCsv(d.simple_days) : "", isArticle ? (getVal(d.simple_s_h) ? `${d.simple_s_h}:${d.simple_s_m}` : "") : "",
      isArticle ? (getVal(d.simple_e_h) ? `${d.simple_e_h}:${d.simple_e_m}` : "") : "", isArticle ? getVal(d.shop_holiday_type) : "",
      isArticle ? getVal(d.shop_notes_biz) : "",
      ...Array.from({length: 7}, (_, i) => isArticle ? getDayHours(i) : ""),
      isArticle ? getVal(d.ev_period_type) : "", isArticle ? getVal(d.ev_sdate) : "", isArticle ? getVal(d.ev_edate) : "",
      isArticle ? (getVal(d.ev_s_h) ? `${d.ev_s_h}:${d.ev_s_m}` : "") : "", isArticle ? (getVal(d.ev_e_h) ? `${d.ev_e_h}:${d.ev_e_m}` : "") : "",
      isArticle ? getVal(d.ev_fee) : "", isArticle ? getVal(d.ev_items) : "", isArticle ? getVal(d.ev_target) : "", isArticle ? getVal(d.ev_org_name) : "",
      isArticle ? toCsv(d.pr_variety) : "", isArticle ? getVal(d.pr_variety_other) : "", isArticle ? toCsv(d.pr_product) : "",
      isArticle ? getVal(d.pr_product_other) : "", isArticle ? getVal(d.pr_area) : "", isArticle ? getVal(d.pr_area_unit) : "",
      isArticle ? getVal(d.pr_staff) : "", isArticle ? toCsv(d.pr_other_crops) : "", isArticle ? getVal(d.pr_crop_fruit_val) : "",
      isArticle ? getVal(d.pr_crop_veg_val) : "", isArticle ? getVal(d.pr_crop_other_val) : "", isArticle ? getVal(d.pr_ent_type) : "",
      isArticle ? getVal(d.pr_rep_name) : "", isArticle ? getVal(d.pr_invoice) : "", isArticle ? getVal(d.pr_invoice_num) : "",
      isArticle ? getVal(d.url_home) : "", isArticle ? getVal(d.url_ec) : "",
      isArticle ? getVal(d.rel_url1) : "", isArticle ? getVal(d.rel_title1) : "", isArticle ? getVal(d.rel_url2) : "", isArticle ? getVal(d.rel_title2) : "",
      isArticle ? getVal(d.sns_ig) : "", isArticle ? getVal(d.sns_fb) : "", isArticle ? getVal(d.sns_x) : "", isArticle ? getVal(d.sns_line) : "", isArticle ? getVal(d.sns_tt) : "",
      isArticle ? toCsv(d.cm) : "", isArticle ? getVal(d.cm_mail) : "", isArticle ? getVal(d.cm_tel) : "", isArticle ? getVal(d.cm_url) : "",
      isArticle ? getVal(d.cm_other_val) : "", isArticle ? getVal(d.cm_notes) : "",
      getVal(d.art_memo), isArticle ? (d.writing_assist ? "希望する" : "しない") : "",
      posterName, contactEmail, adminMessage
    ];

    sheet.appendRow(rowData);
    lastRowIndex = sheet.getLastRow();

    if (d.images && d.images.length > 0) {
      d.images.forEach((b64, i) => {
        if (i >= 6) return;
        try {
          const [metadata, data] = b64.split(",");
          const contentType = metadata.split(":")[1].split(";")[0];
          const bytes = Utilities.base64Decode(data);
          const fileName = `${String(i + 1).padStart(3, '0')}.jpg`;
          const s3Key = `${folderPath}/${fileName}`;
          const blob = Utilities.newBlob(bytes, contentType, s3Key);
          const s3Url = uploadToS3(blob);
          sheet.getRange(lastRowIndex, 10 + i).setValue(s3Url);
          rowData[9 + i] = s3Url;
        } catch(err) { sheet.getRange(lastRowIndex, 10 + i).setValue(`Error: ${err.toString()}`); }
      });
    }

    if (d.art_file_data) {
      try {
        const [metadata, data] = d.art_file_data.split(",");
        const bytes = Utilities.base64Decode(data);
        const s3Key = `${folderPath}/files/${d.art_file_name}`;
        const blob = Utilities.newBlob(bytes, metadata.split(":")[1].split(";")[0], s3Key);
        const fileUrl = uploadToS3(blob);
        sheet.getRange(lastRowIndex, 16).setValue(fileUrl);
        rowData[15] = fileUrl;
      } catch(err) { sheet.getRange(lastRowIndex, 16).setValue(`File Error: ${err.toString()}`); }
    }

    try {
      sendNotificationEmails(rowData, headers, tabLabel, contactEmail, posterName);
    } catch (emailErr) {
      console.error("メール送信に失敗しました: " + emailErr.toString());
    }

    return ContentService.createTextOutput(JSON.stringify({"ok": true})).setMimeType(ContentService.MimeType.JSON);

  } catch (f) {
    return ContentService.createTextOutput(JSON.stringify({"ok": false, "error": f.toString()})).setMimeType(ContentService.MimeType.JSON);
  } finally { lock.releaseLock(); }
}

function sendNotificationEmails(rowData, headers, tabLabel, submitterEmail, submitterName) {
  if (!ADMIN_EMAIL || !ADMIN_EMAIL.includes('@')) {
      console.error('管理者のメールアドレスが正しく設定されていません。');
      return;
  }

  let contentDetails = "";
  headers.forEach((header, index) => {
    const value = rowData[index];
    if (value && value.toString().trim() !== "") {
      const formattedValue = (value instanceof Date)
        ? Utilities.formatDate(value, "JST", "yyyy/MM/dd HH:mm:ss")
        : value.toString();
      contentDetails += `■ ${header}\n${formattedValue}\n\n`;
    }
  });

  const adminSubject = `[${SENDER_NAME}] 新しい投稿 (${tabLabel})`;
  let adminBody = `ウェブサイト投稿フォームから新しい投稿がありました。\n\n` + contentDetails;
  GmailApp.sendEmail(ADMIN_EMAIL, adminSubject, adminBody, { name: SENDER_NAME });

  if (submitterEmail && submitterEmail.includes('@')) {
    const submitterSubject = `【${SENDER_NAME}】ご投稿ありがとうございます`;
    let submitterBody = `${submitterName || '投稿者'}様\n\n`;
    submitterBody += `この度は、飯綱町のウェブサイト投稿フォームをご利用いただき、誠にありがとうございます。\n`;
    submitterBody += `以下の内容でご投稿を受け付けました。\n\n`;
    submitterBody += `----------------------------------------\n`;
    submitterBody += contentDetails;
    submitterBody += `----------------------------------------\n\n`;
    submitterBody += `内容を確認の上、担当者よりご連絡またはサイトへの反映をさせていただきます。\n\n`;
    submitterBody += `※このメールは送信専用です。ご返信いただくことはできません。\n`;
    submitterBody += `${SENDER_NAME}\n`;

    try {
      GmailApp.sendEmail(submitterEmail, submitterSubject, submitterBody, {
        from: FROM_EMAIL_ALIAS,
        name: SENDER_NAME
      });
    } catch(e) {
      console.error(`投稿者への控えメール送信に失敗: ${submitterEmail}, エラー: ${e.toString()}`);
    }
  }
}

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
