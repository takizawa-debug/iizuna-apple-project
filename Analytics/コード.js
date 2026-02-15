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
  } else {
    // 🍎 ヘッダーの同期チェック（追加・不足・順序を矯正）
    const lastCol = Math.max(sh.getLastColumn(), 1);
    const currentHeaders = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    const isMatched = HEADER.every((h, i) => currentHeaders[i] === h);
    if (!isMatched) {
      sh.getRange(1, 1, 1, HEADER.length).setValues([HEADER]).setBackground('#eeeeee');
    }
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
 * GETリクエスト処理
 * - ?mode=dashboard: アドミンダッシュボードを表示
 * - ?d={json}: 従来通りのPixelログ収集
 */
function doGet(e) {
  try {
    const p = e?.parameter || {};

    // 🍎 ダッシュボード表示モード
    if (p.mode === 'dashboard') {
      return HtmlService.createTemplateFromFile('dashboard')
        .evaluate()
        .setTitle('Appletown Analytics Dashboard')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    // 🍎 スプレッドシート側のセットアップ実行モード
    if (p.mode === 'setup') {
      setupSpreadsheetDashboard();
      return textOut_('Spreadsheet Dashboard has been setup/updated.');
    }

    const d = p.d;
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
 * ダッシュボード用の統計データを取得（HtmlTemplateから呼び出し）
 */
const PAGE_NAME_MAP = {
  '/': 'トップページ',
  '/savor': '味わう',
  '/discover': '知る',
  '/experience': '体験する',
  '/live': '暮らす',
  '/business': '営む',
  'index.html': 'トップページ'
};

/**
 * ダッシュボード表示用の統計データを集計
 * @param {Object} params - 期間指定 (startDate, endDate)
 */
function getDashboardStats(params = {}) {
  const sh = ensureLogsSheet_();
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return { error: "No data yet" };

  const headers = data[0];
  const rows = data.slice(1);
  const now = new Date();

  // 🍎 期間指定の解決
  let filterStart = null;
  let filterEnd = null;

  if (params.startDate && params.endDate) {
    filterStart = new Date(params.startDate + "T00:00:00+09:00");
    filterEnd = new Date(params.endDate + "T23:59:59+09:00");
  } else {
    // デフォルト: 直近7日間
    filterStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    filterEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // インデックス取得
  const idx = (name) => headers.indexOf(name);
  const colTs = idx('timestamp_jst');
  const colUrl = idx('page_url');
  const colLang = idx('language');
  const colEvent = idx('event_name');
  const colCardId = idx('card_id');
  const colSearchTerm = idx('search_term');
  const colKeyword = idx('keyword');
  const colReferrer = idx('referrer');
  const colHref = idx('href');
  const colLinkDomain = idx('link_domain');
  const colGeoRegion = idx('geo_region');
  const colGeoCity = idx('geo_city');
  const colDwellMs = idx('dwell_ms');
  const colModalTitle = idx('modal_name');
  const colUtmSource = idx('utm_source');

  const stats = {
    totalPv: 0,
    totalUu: 0,
    basePageRanking: {}, // /savor, /discover etc.
    itemRanking: {},     // { card_id: { count, title } }
    keywordRanking: {},  // search_term + keyword
    referrerRanking: {}, // 流入元（セッション1回カウント）
    exitRanking: {},     // 離脱先（外部リンク）
    langDistribution: { ja: 0, en: 0, zh: 0, other: 0 },
    regionRanking: {},   // 地域
    interactionRanking: { share: {}, pdf: {} }, // 共有・PDF
    engagement: {},      // { card_id: { sum_ms, count } }
    totalModalOpens: 0,
    totalKeywordClicks: 0
  };

  const colSessionId = idx('session_id');
  const colVisitorId = idx('visitor_id');
  const sessionSourceMap = {}; // sid -> { source }
  const sessionRegionMap = {}; // sid -> { region }
  const sessionKeywordMap = new Set(); // sid + keyword + ev
  const visitorSet = new Set(); // 🍎 ユニークユーザー集計用

  rows.forEach(row => {
    const tsStr = row[colTs];
    const ts = new Date(tsStr);

    // 🍎 指定期間外ならスキップ
    if (ts < filterStart || ts > filterEnd) return;

    const ev = row[colEvent];
    const sid = row[colSessionId];

    // 🍎 PV・UU集計
    if (ev === 'page_view') {
      stats.totalPv++;
    }
    const vid = row[colVisitorId];
    if (vid) visitorSet.add(vid);

    // 🍎 追加指標
    if (ev === 'modal_open' || ev === 'modal_navigate') stats.totalModalOpens++;
    if (ev === 'keyword_click') stats.totalKeywordClicks++;

    // URLの正規化
    let rawUrl = String(row[colUrl] || 'unknown');
    let cleanUrl = rawUrl.split('?')[0].split('#')[0].replace(/\/$/, "");
    if (!cleanUrl.includes('/') || cleanUrl.split('/').length <= 3) {
      if (cleanUrl.includes('appletown-iizuna.com')) cleanUrl = '/';
    }
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = '/' + cleanUrl.split('/').pop().replace("index.html", "");
      if (cleanUrl === '//') cleanUrl = '/';
    }

    // ベースページの集計
    const basePaths = ['savor', 'discover', 'experience', 'live', 'business'];
    const isBasePath = basePaths.some(p => cleanUrl.includes(p)) || cleanUrl === '/' || cleanUrl.endsWith('index.html');

    if (isBasePath && ev === 'page_view') {
      let key = cleanUrl;
      if (cleanUrl !== '/') {
        key = '/' + cleanUrl.split('/').pop().replace("index.html", "");
      }
      stats.basePageRanking[key] = (stats.basePageRanking[key] || 0) + 1;
    }

    // アイテム（モーダル）の集計
    let cardId = row[colCardId];
    let modalTitle = row[colModalTitle];
    if (!cardId && rawUrl.includes('?')) {
      const m = rawUrl.match(/[\?&]id=([^&#]+)/);
      if (m) cardId = decodeURIComponent(m[1]);
    }
    if (cardId && ev === 'modal_open') {
      if (!stats.itemRanking[cardId]) stats.itemRanking[cardId] = { count: 0, title: modalTitle || cardId };
      stats.itemRanking[cardId].count++;
    }

    // 地域 (セッションごとに1つ選出)
    if (sid) {
      const region = row[colGeoRegion];
      const city = row[colGeoCity];
      if (region && !sessionRegionMap[sid]) {
        sessionRegionMap[sid] = region + (city ? " " + city : "");
      }
    }

    // Share / PDF
    if (ev === 'modal_share' || ev === 'sns_link_click') {
      const key = modalTitle || cardId || '不明';
      stats.interactionRanking.share[key] = (stats.interactionRanking.share[key] || 0) + 1;
    }
    if (ev === 'modal_pdf_generate') {
      const key = modalTitle || cardId || '不明';
      stats.interactionRanking.pdf[key] = (stats.interactionRanking.pdf[key] || 0) + 1;
    }

    // 滞在時間
    if (ev === 'modal_close' && cardId) {
      const ms = Number(row[colDwellMs]) || 0;
      if (ms > 0 && ms < 3600000) { // 極端な値（1時間以上）は除外
        if (!stats.engagement[cardId]) stats.engagement[cardId] = { sum: 0, count: 0, title: modalTitle || cardId };
        stats.engagement[cardId].sum += ms;
        stats.engagement[cardId].count++;
      }
    }

    // 流入元（リファラ）の集計ロジック: セッションごとに1つ選出
    if (sid) {
      const ref = String(row[colReferrer] || "").trim();
      const utmSource = String(row[colUtmSource] || "").trim().toLowerCase();
      const internalDomain = 'appletown-iizuna.com';
      const isInternal = ref.includes(internalDomain);

      // 判定優先度: utm_source > 外部リンクリファラ > 直接アクセス
      let currentSrc = "";
      if (utmSource.includes('share') || utmSource.includes('shere')) currentSrc = "SNS共有経由";
      else if (utmSource.includes('qr') || utmSource.includes('pr') || utmSource.includes('pdf')) currentSrc = "印刷機能QR経由";
      else if (ref && !isInternal) {
        currentSrc = ref.split('/')[2] || "直接アクセス/不明";
      } else if (!ref) {
        currentSrc = "直接アクセス/不明";
      }

      // 有効なソース(UTM/外部)が見つかったら上書き、または未登録なら登録
      if (currentSrc && currentSrc !== "直接アクセス/不明") {
        sessionSourceMap[sid] = currentSrc;
      } else if (!sessionSourceMap[sid]) {
        sessionSourceMap[sid] = "直接アクセス/不明";
      }
    }

    // 離脱先（外部リンク）の集計
    if (ev === 'outbound_click' || ev === 'sns_link_click' || ev === 'related_article_click') {
      const exitUrl = row[colHref] || row[colLinkDomain] || "unknown";
      stats.exitRanking[exitUrl] = (stats.exitRanking[exitUrl] || 0) + 1;
    }

    // 言語
    const lang = (row[colLang] || '').toLowerCase();
    if (lang.includes('ja')) stats.langDistribution.ja++;
    else if (lang.includes('en')) stats.langDistribution.en++;
    else if (lang.includes('zh')) stats.langDistribution.zh++;
    else stats.langDistribution.other++;

    // キーワード合算 (重複排除: 1セッション内で同じイベントによる同じキーワードは1回のみ)
    const kw = (row[colSearchTerm] || row[colKeyword] || "").trim();
    if (kw) {
      // 🍎 search_result_click は「結果のクリック」であり「検索意図」ではないため、ランキング合算からは除外
      // 🍎 または、1セッション内に同じ単語での keyword_click / search_execute があっても1回として数える
      const kwKey = sid + "_" + kw;
      if (ev !== 'search_result_click' && !sessionKeywordMap.has(kwKey)) {
        stats.keywordRanking[kw] = (stats.keywordRanking[kw] || 0) + 1;
        sessionKeywordMap.add(kwKey);
      }
    }
  });

  stats.totalUu = visitorSet.size;

  // ランキングを配列化してソート
  const sortRank = (obj, mapping = null) => Object.entries(obj)
    .map(([name, count]) => ({
      name: (mapping && mapping[name]) ? mapping[name] : name,
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  stats.basePageRanking = sortRank(stats.basePageRanking, PAGE_NAME_MAP);

  stats.itemRanking = Object.entries(stats.itemRanking)
    .map(([id, d]) => ({ name: d.title, count: d.count }))
    .sort((a, b) => b.count - a.count).slice(0, 15);

  // 🍎 セッション別ランキングを確定（ここで初めてカウントする）
  const sourceRankingCount = {};
  Object.values(sessionSourceMap).forEach(s => {
    sourceRankingCount[s] = (sourceRankingCount[s] || 0) + 1;
  });
  const regionRankingCount = {};
  Object.values(sessionRegionMap).forEach(r => {
    regionRankingCount[r] = (regionRankingCount[r] || 0) + 1;
  });

  stats.keywordRanking = sortRank(stats.keywordRanking);
  stats.referrerRanking = sortRank(sourceRankingCount);
  stats.exitRanking = sortRank(stats.exitRanking);
  stats.regionRanking = sortRank(regionRankingCount);

  stats.interactionShare = sortRank(stats.interactionRanking.share);
  stats.interactionPdf = sortRank(stats.interactionRanking.pdf);

  stats.stayTimeRanking = Object.entries(stats.engagement)
    .map(([id, d]) => ({
      name: d.title,
      count: Math.round((d.sum / d.count) / 100) / 10 // 秒単位 (少数第1位)
    }))
    .sort((a, b) => b.count - a.count).slice(0, 15);

  return stats;
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

/**
 * スプレッドシート上に「📊 Dashboard」シートを作成し、集計用QUERY関数を埋め込む
 */
function setupSpreadsheetDashboard() {
  const ss = ss_();
  let sh = ss.getSheetByName('📊 Dashboard');
  if (!sh) {
    sh = ss.insertSheet('📊 Dashboard', 0); // 先頭に作成
  } else {
    sh.clear();
  }

  // デザイン調整
  sh.setTabColor('#FF3B30');

  // タイトルと説明
  sh.getRange('A1').setValue('Appletown Analytics - Live Dashboard').setFontSize(18).setFontWeight('bold').setFontColor('#FF3B30');
  sh.getRange('A2').setValue('※このシートは自動集計されています。直接編集しないでください。').setFontColor('#86868b');

  // セクション1: 主要な数字
  sh.getRange('A4').setValue('主要指標 (全体計)').setFontWeight('bold').setBackground('#f5f5f7');
  sh.getRange('A5').setValue('累計PV数').setFontWeight('bold');
  sh.getRange('B5').setFormula(`=COUNTA(Logs!A:A)-1`);

  sh.getRange('A6').setValue('ユニーク訪問者数').setFontWeight('bold');
  sh.getRange('B6').setFormula(`=COUNTUNIQUE(Logs!B:B)`);

  sh.getRange('D4').setValue('デバイス言語分布').setFontWeight('bold').setBackground('#f5f5f7');
  sh.getRange('D5').setFormula(`=QUERY(Logs!A:U, "SELECT U, COUNT(A) WHERE U IS NOT NULL GROUP BY U LABEL COUNT(A) 'PV数'", 1)`);

  // セクション2: 流入元と離脱先
  sh.getRange('G4').setValue('直近の流入元 (上位)').setFontWeight('bold').setBackground('#f5f5f7');
  sh.getRange('G5').setFormula(`=QUERY(Logs!A:H, "SELECT H, COUNT(A) WHERE H IS NOT NULL GROUP BY H ORDER BY COUNT(A) DESC LIMIT 10 LABEL COUNT(A) '訪問数', H '参照元ドメイン'", 1)`);

  // セクション3: ページビューランキング
  sh.getRange('A10').setValue('人気ページ (パス別合計)').setFontWeight('bold').setBackground('#f5f5f7');
  sh.getRange('A11').setFormula(`=QUERY(Logs!A:G, "SELECT F, COUNT(A) WHERE F IS NOT NULL GROUP BY F ORDER BY COUNT(A) DESC LIMIT 20 LABEL COUNT(A) 'PV', F 'ページパス'", 1)`);

  // セクション4: アイテム・詳細ランキング
  sh.getRange('D10').setValue('個別コンテンツ (詳細表示) 人気順').setFontWeight('bold').setBackground('#f5f5f7');
  sh.getRange('D11').setFormula(`=QUERY(Logs!A:BC, "SELECT Z, COUNT(A) WHERE Z IS NOT NULL GROUP BY Z ORDER BY COUNT(A) DESC LIMIT 20 LABEL COUNT(A) '表示数', Z '項目ID'", 1)`);

  // セクション5: 検索キーワード (最大範囲指定)
  sh.getRange('A35').setValue('注目ワード (検索・リンク) 合計ランキング').setFontWeight('bold').setBackground('#f5f5f7');
  // QUERYの範囲をLogsシートの最終列(BCくらい)まで確実に含める
  sh.getRange('A36').setFormula(`={QUERY(Logs!A:BC, "SELECT AF, COUNT(A) WHERE AF IS NOT NULL GROUP BY AF LABEL COUNT(A) 'ヒッツ'", 1); QUERY(Logs!A:BC, "SELECT AY, COUNT(A) WHERE AY IS NOT NULL GROUP BY AY LABEL COUNT(A) 'ヒッツ'", 0)}`);
  sh.getRange('A36').setValue('注目キーワード (合算)'); // ヘッダーを上書きしてラベルを日本語化
  sh.getRange('A36').setFontWeight('bold').setBackground('#f5f5f7');
  sh.getRange('C36').setValue('※正確な合算結果とグラフはWebダッシュボードをご利用ください。').setFontColor('#86868b');

  // フォーマット調整
  sh.autoResizeColumns(1, 10);
  sh.getRange('A4:D4').setBorder(true, true, true, true, false, false);
}

function textOut_(body) {
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.TEXT);
}
