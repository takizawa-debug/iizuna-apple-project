/**
 * Appletown Analytics - Web App endpoint (高性能・一括処理版)
 */

const SPREADSHEET_ID = '1bXo0glShkmUXFF-LwTm8HkWs9N9bUbTWxJel7x9sLEU';
const SHEET_NAME = 'Logs';
const ERROR_SHEET = 'Errors';

const HEADER = [
  'timestamp_jst', 'visitor_id', 'session_id', 'event_name', 'event_params_json',
  'page_url', 'page_title', 'referrer', 'utm_source', 'utm_medium', 'utm_campaign',
  'screen_w', 'screen_h', 'ua', 'geo_ip', 'geo_country', 'geo_region', 'geo_city',
  'geo_lat', 'geo_lon', 'language',
  'engaged_ms', 'element', 'label', 'href', 'modal_name', 'card_id', 'group',
  'platform', 'action', 'idx', 'search_term', 'link_domain', 'scroll_depth',
  'source', 'source_card_id', 'from_card_id', 'to_card_id', 'direction',
  'from_lang', 'to_lang', 'image_index', 'method',
  'result_position', 'result_count', 'result_card_id',
  'related_url', 'related_title', 'dwell_ms', 'link_type', 'display_text', 'keyword'
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

function pick_(obj, key) {
  if (obj === null || obj === undefined) return '';
  const v = obj[key];
  if (v === null || v === undefined) return '';
  return (typeof v === 'object') ? JSON.stringify(v) : String(v);
}

/**
 * データをスプレッドシート用の行配列に変換
 */
function formatRow_(data, timestampJST) {
  const params = data.event_params || {};
  const geo = data.geo || {};

  return [
    timestampJST,
    pick_(data, 'visitor_id'),
    pick_(data, 'session_id'),
    pick_(data, 'event_name') || 'page_view',
    data.event_params ? JSON.stringify(data.event_params) : '',
    pick_(data, 'page_url'),
    pick_(data, 'page_title'),
    pick_(data, 'referrer'),
    pick_(data, 'utm_source'),
    pick_(data, 'utm_medium'),
    pick_(data, 'utm_campaign'),
    pick_(data, 'screen_w'),
    pick_(data, 'screen_h'),
    pick_(data, 'ua'),
    pick_(geo, 'ip'),
    pick_(geo, 'country'),
    pick_(geo, 'region'),
    pick_(geo, 'city'),
    pick_(geo, 'lat'),
    pick_(geo, 'lon'),
    pick_(data, 'language'),
    pick_(params, 'engaged_ms'),
    pick_(params, 'element') || pick_(params, 'element_id'),
    pick_(params, 'label'),
    pick_(params, 'href'),
    pick_(params, 'modal_name') || pick_(params, 'modal_title'),
    pick_(params, 'card_id'),
    pick_(params, 'group'),
    pick_(params, 'platform'),
    pick_(params, 'action'),
    pick_(params, 'idx'),
    pick_(params, 'search_term'),
    pick_(params, 'link_domain'),
    pick_(params, 'scroll_depth'),
    pick_(params, 'source'),
    pick_(params, 'source_card_id'),
    pick_(params, 'from_card_id'),
    pick_(params, 'to_card_id'),
    pick_(params, 'direction'),
    pick_(params, 'from_lang'),
    pick_(params, 'to_lang'),
    pick_(params, 'image_index'),
    pick_(params, 'method'),
    pick_(params, 'result_position'),
    pick_(params, 'result_count'),
    pick_(params, 'result_card_id'),
    pick_(params, 'related_url'),
    pick_(params, 'related_title'),
    pick_(params, 'dwell_ms'),
    pick_(params, 'link_type'),
    pick_(params, 'display_text'),
    pick_(params, 'keyword')
  ];
}

/**
 * まとめてログを書き込む
 */
function appendLogRows_(dataList, timestampJST) {
  const rows = dataList.map(data => formatRow_(data, timestampJST));
  const sh = ensureLogsSheet_();
  const lock = LockService.getScriptLock();

  // 🍎 ロック取得リトライロジック
  // 1回目: 5秒待つ
  if (lock.tryLock(5000)) {
    try {
      _write(sh, rows);
    } finally {
      lock.releaseLock();
    }
  } else {
    // 失敗時: 一旦フラッシュして、少し待機してから再試行（10秒）
    SpreadsheetApp.flush();
    Utilities.sleep(1500);
    if (lock.tryLock(10000)) {
      try {
        _write(sh, rows);
      } finally {
        lock.releaseLock();
      }
    } else {
      // それでもダメならエラー（ただし、ここでメール通知等はしない方が良いかも）
      console.error('Lock timeout: Data lost for ' + dataList.length + ' rows');
      // throw new Error('Could not obtain lock.'); // クライアントにエラーを返すと再送の嵐になるので、サイレント失敗またはログのみにする手もある
    }
  }
}

function _write(sh, rows) {
  const lastRow = sh.getLastRow();
  sh.getRange(lastRow + 1, 1, rows.length, HEADER.length).setValues(rows);
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
  } catch (_) { }
}

function textOut_(body) {
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.TEXT);
}
