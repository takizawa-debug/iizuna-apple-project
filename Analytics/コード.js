/**
 * Appletown Analytics - Web App endpoint (高性能・一括処理版)
 */

const SPREADSHEET_ID = '1bXo0glShkmUXFF-LwTm8HkWs9N9bUbTWxJel7x9sLEU';
const SHEET_NAME  = 'Logs';
const ERROR_SHEET = 'Errors';

const HEADER = [
  'timestamp_jst', 'visitor_id', 'session_id', 'event_name', 'event_params_json',
  'page_url', 'page_title', 'referrer', 'utm_source', 'utm_medium', 'utm_campaign',
  'screen_w', 'screen_h', 'ua', 'geo_ip', 'geo_country', 'geo_region', 'geo_city',
  'geo_postal', 'geo_lat', 'geo_lon', 'engaged_ms', 'element', 'label', 'href',
  'modal_name', 'card_id', 'group', 'platform', 'action', 'idx'
];

const ss_ = () => SpreadsheetApp.openById(SPREADSHEET_ID);

/**
 * シートの存在確認とヘッダーの準備
 */
function ensureLogsSheet_() {
  const ss = ss_();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, HEADER.length).setValues([HEADER]).setBackground('#eeeeee').setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function ensureErrorSheet_() {
  const ss = ss_();
  const es = ss.getSheetByName(ERROR_SHEET) || ss.insertSheet(ERROR_SHEET);
  if (es.getLastRow() === 0) es.appendRow(['timestamp_jst', 'error', 'raw']);
  return es;
}

function toJSTString(date) {
  return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss');
}

function pick_(params, key) {
  if (!params) return '';
  const v = params[key];
  if (v === null || v === undefined) return '';
  return (typeof v === 'object') ? JSON.stringify(v) : String(v);
}

/**
 * データをスプレッドシート用の行配列に変換
 */
function formatRow_(data, timestampJST) {
  const params = data.event_params || {};
  return [
    timestampJST,
    String(data.visitor_id || ''),
    String(data.session_id || ''),
    String(data.event_name || 'page_view'),
    data.event_params ? JSON.stringify(data.event_params) : '',
    String(data.page_url || ''),
    String(data.page_title || ''),
    String(data.referrer || ''),
    String(data.utm_source || ''),
    String(data.utm_medium || ''),
    String(data.utm_campaign || ''),
    (typeof data.screen_w === 'number') ? data.screen_w : '',
    (typeof data.screen_h === 'number') ? data.screen_h : '',
    String(data.ua || ''),
    String(data.geo_ip || ''),
    String(data.geo_country || ''),
    String(data.geo_region || ''),
    String(data.geo_city || ''),
    String(data.geo_postal || ''),
    (data.geo_lat != null) ? data.geo_lat : '',
    (data.geo_lon != null) ? data.geo_lon : '',
    pick_(params, 'engaged_ms'),
    pick_(params, 'element') || pick_(params, 'element_id'),
    pick_(params, 'label'),
    pick_(params, 'href'),
    pick_(params, 'modal_name'),
    pick_(params, 'card_id'),
    pick_(params, 'group'),
    pick_(params, 'platform'),
    pick_(params, 'action'),
    pick_(params, 'idx'),
  ];
}

/**
 * まとめてログを書き込む
 */
function appendLogRows_(dataList, timestampJST) {
  const rows = dataList.map(data => formatRow_(data, timestampJST));
  const sh = ensureLogsSheet_();
  const lock = LockService.getScriptLock();
  
  // 10秒間ロックを待機
  if (lock.tryLock(10000)) {
    try {
      const lastRow = sh.getLastRow();
      sh.getRange(lastRow + 1, 1, rows.length, HEADER.length).setValues(rows);
    } finally {
      lock.releaseLock();
    }
  } else {
    throw new Error('Could not obtain lock after 10 seconds.');
  }
}

/**
 * GETリクエスト処理 (Pixel fallback用)
 */
function doGet(e) {
  try {
    const d = e?.parameter?.d;
    if (d) {
      const data = JSON.parse(d);
      appendLogRows_([data], toJSTString(new Date()));
      return textOut_('');
    }
  } catch (err) {
    logError_(err, e?.parameter);
    return textOut_('NG');
  }
  return textOut_('Appletown Analytics is running.');
}

/**
 * POSTリクエスト処理 (メイン)
 */
function doPost(e) {
  const nowJST = toJSTString(new Date());
  try {
    const raw = e?.postData?.contents || '{}';
    const parsed = JSON.parse(raw);
    
    // 配列でも単体オブジェクトでも受け入れ可能にする
    const dataList = Array.isArray(parsed) ? parsed : [parsed];
    
    appendLogRows_(dataList, nowJST);
    return textOut_('OK');
  } catch (err) {
    logError_(err, e?.postData?.contents);
    return textOut_('NG');
  }
}

function logError_(err, raw) {
  try {
    const es = ensureErrorSheet_();
    es.appendRow([toJSTString(new Date()), String(err && err.stack || err), String(raw || '')]);
  } catch (_) {}
}

function textOut_(body) {
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.TEXT);
}