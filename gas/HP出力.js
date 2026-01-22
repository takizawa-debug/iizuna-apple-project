/***** 設定 *****/
const SPREADSHEET_ID = '1ODqTU1KspNWDZq7NYICyeAjUOHNdQIV9TfFs9fpPKkU';
const SHEET_NAME     = '公開用';

// 行位置（今回の要件）
const HEADER_ROW     = 2;  // 見出しは2行目
const DATA_START_ROW = 3;  // データは3行目～

/***** 列名マッピング（ヘッダー2行目の見出しと一致） *****/
const COL = {
  L1: 'L1',
  L2: 'L2',
  L3: 'L3_LABEL',
  TITLE: 'タイトル',
  LEAD: 'リード文',
  BODY: '本文',

  // 画像
  MAIN: '画像1',
  SUB1: '画像2',
  SUB2: '画像3',
  SUB3: '画像4',
  SUB4: '画像5',
  SUB5: '画像6', // ★追加

  // リンク
  LINK: 'ホームページ',
  EC:   'ECサイト',

  // 関連記事 ★追加
  REL1_URL:   '関連記事1_URL',
  REL1_TITLE: '関連記事1_タイトル',
  REL2_URL:   '関連記事2_URL',
  REL2_TITLE: '関連記事2_タイトル',

  // 住所・問い合わせ系
  ADDRESS: '住所',
  FORM:    '問い合わせフォームURL',
  EMAIL:   '問い合わせメール',
  TEL:     '問い合わせ電話',

  // SNS
  IG:     'SNS_Instagram',
  FB:     'SNS_Facebook',
  X:      'SNS_X',
  LINE:   'SNS_LINE',
  TIKTOK: 'SNS_TikTok',

  // 営業/イベント系
  BIZ_DAYS:   '営業曜日',
  BIZ_OPEN:   '営業開始時刻',
  BIZ_CLOSE:  '営業終了時刻',
  HOLIDAY:    '定休日',
  BIZ_NOTE:   '営業に関する注意事項',
  START_DATE: '開始日',
  END_DATE:   '終了日',
  START_TIME: '開始時刻',
  END_TIME:   '終了時刻',
  FEE:        '参加費',
  BRING:      'もちもの',
  TARGET:     '対象',
  ORG_APPLY:  '申し込み方法',
  ORG:        '主催者名',
  ORG_TEL:    '主催者連絡先',
  VENUE_NOTE: '会場に関する注意事項',
  NOTE:       '備考',

  // ダウンロードURL
  DL_URL:     'ダウンロードURL'
};

/***** ユーティリティ *****/
function _sheet() {
  if (!/^[\w-]{30,}$/.test(SPREADSHEET_ID)) {
    throw new Error('SPREADSHEET_ID が不正です（URLではなくIDのみを設定してください）');
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
}

function _indexHeader(header) {
  const map = {};
  header.forEach((h, i) => map[String(h).trim()] = i);
  return map;
}

function _pick(row, idx, key) {
  const i = idx[key];
  return i == null ? '' : (row[i] ?? '');
}

/***** フォーマッタ（時間・日付の正規化） *****/
function _fmtTimeHHMM(raw) {
  if (!raw && raw !== 0) return '';
  if (raw instanceof Date) {
    return Utilities.formatDate(raw, Session.getScriptTimeZone(), 'HH:mm');
  }
  const s0 = String(raw).trim();
  if (!s0) return '';
  let s = s0.replace(/[：]/g, ':').replace(/[．。]/g, '.');

  const m4 = s.match(/^(\d{3,4})$/);
  if (m4) {
    const num = m4[1].padStart(4,'0');
    const hh = num.slice(0,2);
    const mm = num.slice(2,4);
    return hh + ':' + mm;
  }
  const m = s.match(/^(\d{1,2})(?::?(\d{0,2}))?$/);
  if (m) {
    let hh = ('0' + (m[1] || '0')).slice(-2);
    let mm = ('0' + (m[2] || '0')).slice(-2);
    if (+hh > 23) hh = '23';
    if (+mm > 59) mm = '59';
    return hh + ':' + mm;
  }
  const mJ = s.match(/^(\d{1,2})\s*時(\s*(\d{1,2})\s*分)?$/);
  if (mJ) {
    let hh = ('0' + (mJ[1] || '0')).slice(-2);
    let mm = ('0' + (mJ[3] || '0')).slice(-2);
    if (+hh > 23) hh = '23';
    if (+mm > 59) mm = '59';
    return hh + ':' + mm;
  }
  return '';
}

function _fmtDateYMD(raw) {
  if (!raw && raw !== 0) return '';
  if (raw instanceof Date) {
    return Utilities.formatDate(raw, Session.getScriptTimeZone(), 'yyyy/MM/dd');
  }
  let s = String(raw).trim();
  if (!s) return '';

  s = s.replace(/[．。\.－–—-]/g, '/').replace(/\s+/g, '');
  let m = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!m) return '';
  const y = m[1];
  let mo = ('0' + m[2]).slice(-2);
  let d  = ('0' + m[3]).slice(-2);

  const mm = +mo, dd = +d;
  if (mm < 1 || mm > 12) return '';
  if (dd < 1 || dd > 31) return '';
  return y + '/' + mo + '/' + d;
}

/***** L1/L2 で絞り込み＆整形（ヘッダー2行目／データ3行目〜） *****/
function _getRowsByL1L2(l1, l2, limit) {
  const sh = _sheet();
  const values = sh.getDataRange().getValues();
  if (values.length < DATA_START_ROW) return [];

  const header = (values[HEADER_ROW - 1] || []).map(v => String(v).trim());
  const idx = _indexHeader(header);

  const out = [];
  for (let r = DATA_START_ROW - 1; r < values.length; r++) {
    const row = values[r];

    const vL1 = _pick(row, idx, COL.L1);
    const vL2 = _pick(row, idx, COL.L2);
    if (String(vL1) !== String(l1)) continue;
    if (String(vL2) !== String(l2)) continue;

    // サブ画像：画像2〜画像6
    const subs = [
      _pick(row, idx, COL.SUB1),
      _pick(row, idx, COL.SUB2),
      _pick(row, idx, COL.SUB3),
      _pick(row, idx, COL.SUB4),
      _pick(row, idx, COL.SUB5) // ★追加
    ].filter(u => u && String(u).trim() !== '');

    // 時刻・日付の正規化
    const bizOpen   = _fmtTimeHHMM(_pick(row, idx, COL.BIZ_OPEN));
    const bizClose  = _fmtTimeHHMM(_pick(row, idx, COL.BIZ_CLOSE));
    const startDate = _fmtDateYMD(_pick(row, idx, COL.START_DATE));
    const endDate   = _fmtDateYMD(_pick(row, idx, COL.END_DATE));
    const startTime = _fmtTimeHHMM(_pick(row, idx, COL.START_TIME));
    const endTime   = _fmtTimeHHMM(_pick(row, idx, COL.END_TIME));

    const hoursCombined = (bizOpen && bizClose) ? (bizOpen + '〜' + bizClose) : '';

    let eventDate = '';
    if (startDate && endDate) {
      eventDate = (startDate === endDate) ? startDate : (startDate + '〜' + endDate);
    }
    const eventTime = (startTime && endTime) ? (startTime + '〜' + endTime) : '';

    // 関連記事（存在すれば返す）
    const relatedArticles = [];
    const rel1u = _pick(row, idx, COL.REL1_URL);
    const rel1t = _pick(row, idx, COL.REL1_TITLE);
    const rel2u = _pick(row, idx, COL.REL2_URL);
    const rel2t = _pick(row, idx, COL.REL2_TITLE);
    if (rel1u || rel1t) relatedArticles.push({ url: rel1u || '', title: rel1t || '' });
    if (rel2u || rel2t) relatedArticles.push({ url: rel2u || '', title: rel2t || '' });

    const item = {
      l1: vL1,
      l2: vL2,
      l3: _pick(row, idx, COL.L3),

      // 基本
      title: _pick(row, idx, COL.TITLE),
      lead:  _pick(row, idx, COL.LEAD),
      body:  _pick(row, idx, COL.BODY),

      // 画像
      mainImage: _pick(row, idx, COL.MAIN),
      subImages: subs,

      // リンク
      home: _pick(row, idx, COL.LINK),
      ec:   _pick(row, idx, COL.EC),

      // 関連記事
      relatedArticles, // ★追加（[{url,title}, ...]）

      // 住所/問い合わせ
      address: _pick(row, idx, COL.ADDRESS),
      hours:   _pick(row, idx, COL.HOURS),
      form:    _pick(row, idx, COL.FORM),
      email:   _pick(row, idx, COL.EMAIL),
      tel:     _pick(row, idx, COL.TEL),

      // SNS
      sns: {
        instagram: _pick(row, idx, COL.IG),
        facebook:  _pick(row, idx, COL.FB),
        x:         _pick(row, idx, COL.X),
        line:      _pick(row, idx, COL.LINE),
        tiktok:    _pick(row, idx, COL.TIKTOK)
      },

      // 営業/イベント（生値）
      bizDays:   _pick(row, idx, COL.BIZ_DAYS),
      holiday:   _pick(row, idx, COL.HOLIDAY),
      bizNote:   _pick(row, idx, COL.BIZ_NOTE),
      fee:       _pick(row, idx, COL.FEE),
      bring:     _pick(row, idx, COL.BRING),
      target:       _pick(row, idx, COL.TARGET),
      apply:        _pick(row, idx, COL.ORG_APPLY),
      organizer:    _pick(row, idx, COL.ORG),
      organizerTel: _pick(row, idx, COL.ORG_TEL),
      venueNote: _pick(row, idx, COL.VENUE_NOTE),
      note:      _pick(row, idx, COL.NOTE),
      downloadUrl: _pick(row, idx, COL.DL_URL),

      // 正規化済み
      bizOpen, bizClose, startDate, endDate, startTime, endTime,

      // まとめ表記
      hoursCombined, eventDate, eventTime
    };

    out.push(item);
    if (limit && out.length >= limit) break;
  }
  return out;
}

/* L1/L2 の全一覧（重複排除・行順キープ） */
function _getAllL1L2() {
  const sh = _sheet();
  const values = sh.getDataRange().getValues();
  if (values.length < DATA_START_ROW) return [];

  const header = (values[HEADER_ROW - 1] || []).map(v => String(v).trim());
  const idx = _indexHeader(header);

  const seen = new Set(); // "L1|||L2"
  const list = [];
  for (let r = DATA_START_ROW - 1; r < values.length; r++) {
    const row = values[r];
    const l1 = String(_pick(row, idx, COL.L1) || '').trim();
    const l2 = String(_pick(row, idx, COL.L2) || '').trim();
    if (!l1 || !l2) continue;
    const key = `${l1}|||${l2}`;
    if (seen.has(key)) continue;
    seen.add(key);
    list.push({
      l1, l2,
      // シート上の物理行番号（1始まり）
      rowIndex: r + 1
    });
  }
  return list;
}

/***** Web API（JSON）*****/
function doGet(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};

    // ヘッダーメニュー用の一括取得（行順で返す）
    if (p.all == '1' || p.all === 'true') {
      const pairs = _getAllL1L2();
      return ContentService
        .createTextOutput(JSON.stringify({ ok:true, mode:'all', count:pairs.length, items:pairs }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 通常：L1/L2指定
    const l1 = p.l1 || '';
    const l2 = p.l2 || '';
    const limit = p.limit ? Math.max(1, Math.min(999, parseInt(p.limit, 10))) : 50;

    if (!l1 || !l2) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok:false, error:'Missing l1 or l2 parameter' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = _getRowsByL1L2(l1, l2, limit);
    return ContentService
      .createTextOutput(JSON.stringify({ ok:true, mode:'byL1L2', l1, l2, count:data.length, items:data }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok:false, error: String(err && err.message || err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}