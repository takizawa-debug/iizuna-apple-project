/***** 設定 *****/
const SPREADSHEET_ID = '1ODqTU1KspNWDZq7NYICyeAjUOHNdQIV9TfFs9fpPKkU';
const SHEET_NAME     = '公開用';

// 行位置
const HEADER_ROW     = 2;  // 見出しは2行目
const DATA_START_ROW = 3;  // データは3行目～

/***** 列名マッピング *****/
const COL = {
  L1: 'L1', L2: 'L2', L3: 'L3_LABEL', TITLE: 'タイトル', LEAD: 'リード文', BODY: '本文',
  MAIN: '画像1', SUB1: '画像2', SUB2: '画像3', SUB3: '画像4', SUB4: '画像5', SUB5: '画像6',
  LINK: 'ホームページ', EC: 'ECサイト',
  REL1_URL: '関連記事1_URL', REL1_TITLE: '関連記事1_タイトル',
  REL2_URL: '関連記事2_URL', REL2_TITLE: '関連記事2_タイトル',
  ADDRESS: '住所', FORM: '問い合わせフォームURL', EMAIL: '問い合わせメール', TEL: '問い合わせ電話',
  IG: 'SNS_Instagram', FB: 'SNS_Facebook', X: 'SNS_X', LINE: 'SNS_LINE', TIKTOK: 'SNS_TikTok',
  BIZ_DAYS: '営業曜日', BIZ_OPEN: '営業開始時刻', BIZ_CLOSE: '営業終了時刻', HOLIDAY: '定休日',
  BIZ_NOTE: '営業に関する注意事項', START_DATE: '開始日', END_DATE: '終了日',
  START_TIME: '開始時刻', END_TIME: '終了時刻', FEE: '参加費', BRING: 'もちもの',
  TARGET: '対象', ORG_APPLY: '申し込み方法', ORG: '主催者名', ORG_TEL: '主催者連絡先',
  VENUE_NOTE: '会場に関する注意事項', NOTE: '備考', DL_URL: 'ダウンロードURL'
};

/***** ユーティリティ *****/
function _sheet() {
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

/**
 * ★追加：画像URLを配信に最適な形に変換する
 */
function _finalizeImageUrl(url) {
  if (!url) return "";
  let s = String(url).trim();
  if (!s) return "";

  // 1. ペライチS3ドメインを高速なCDNドメインに置換
  s = s.replace("https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/", "https://cdn.peraichi.com/");

  // 2. Googleドライブの共有リンクがあれば直リンク形式に変換
  if (s.indexOf("drive.google.com") !== -1) {
    const match = s.match(/\/d\/([^/]+)/) || s.match(/id=([^&]+)/);
    if (match) {
      s = "https://drive.google.com/uc?export=download&id=" + match[1];
    }
  }
  return s;
}

/***** フォーマッタ *****/
function _fmtTimeHHMM(raw) {
  if (!raw && raw !== 0) return '';
  if (raw instanceof Date) return Utilities.formatDate(raw, Session.getScriptTimeZone(), 'HH:mm');
  const s0 = String(raw).trim();
  if (!s0) return '';
  let s = s0.replace(/[：]/g, ':').replace(/[．。]/g, '.');
  const m4 = s.match(/^(\d{3,4})$/);
  if (m4) {
    const num = m4[1].padStart(4,'0');
    return num.slice(0,2) + ':' + num.slice(2,4);
  }
  const m = s.match(/^(\d{1,2})(?::?(\d{0,2}))?$/);
  if (m) {
    let hh = ('0' + (m[1] || '0')).slice(-2);
    let mm = ('0' + (m[2] || '0')).slice(-2);
    return hh + ':' + mm;
  }
  return '';
}

function _fmtDateYMD(raw) {
  if (!raw && raw !== 0) return '';
  if (raw instanceof Date) return Utilities.formatDate(raw, Session.getScriptTimeZone(), 'yyyy/MM/dd');
  let s = String(raw).trim();
  if (!s) return '';
  s = s.replace(/[．。\.－–—-]/g, '/').replace(/\s+/g, '');
  let m = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!m) return '';
  return m[1] + '/' + ('0' + m[2]).slice(-2) + '/' + ('0' + m[3]).slice(-2);
}

/***** データ取得ロジック *****/
function _getRowsByL1L2(l1, l2, limit) {
  const sh = _sheet();
  const values = sh.getDataRange().getValues();
  if (values.length < DATA_START_ROW) return [];

  const header = (values[HEADER_ROW - 1] || []).map(v => String(v).trim());
  const idx = _indexHeader(header);

  const out = [];
  for (let r = DATA_START_ROW - 1; r < values.length; r++) {
    const row = values[r];
    if (String(_pick(row, idx, COL.L1)) !== String(l1)) continue;
    if (String(_pick(row, idx, COL.L2)) !== String(l2)) continue;

    // サブ画像の一括変換
    const subs = [
      _pick(row, idx, COL.SUB1), _pick(row, idx, COL.SUB2),
      _pick(row, idx, COL.SUB3), _pick(row, idx, COL.SUB4), _pick(row, idx, COL.SUB5)
    ].filter(u => u && String(u).trim() !== '')
     .map(u => _finalizeImageUrl(u)); // ここで一括変換！

    const bizOpen = _fmtTimeHHMM(_pick(row, idx, COL.BIZ_OPEN));
    const bizClose = _fmtTimeHHMM(_pick(row, idx, COL.BIZ_CLOSE));
    const startDate = _fmtDateYMD(_pick(row, idx, COL.START_DATE));
    const endDate = _fmtDateYMD(_pick(row, idx, COL.END_DATE));
    const startTime = _fmtTimeHHMM(_pick(row, idx, COL.START_TIME));
    const endTime = _fmtTimeHHMM(_pick(row, idx, COL.END_TIME));

    const relatedArticles = [];
    const rel1u = _pick(row, idx, COL.REL1_URL);
    const rel1t = _pick(row, idx, COL.REL1_TITLE);
    if (rel1u || rel1t) relatedArticles.push({ url: rel1u || '', title: rel1t || '' });

    out.push({
      l1: l1, l2: l2, l3: _pick(row, idx, COL.L3),
      title: _pick(row, idx, COL.TITLE),
      lead:  _pick(row, idx, COL.LEAD),
      body:  _pick(row, idx, COL.BODY),

      // 画像：ここで変換！
      mainImage: _finalizeImageUrl(_pick(row, idx, COL.MAIN)),
      subImages: subs,

      home: _pick(row, idx, COL.LINK),
      ec:   _pick(row, idx, COL.EC),
      relatedArticles,
      address: _pick(row, idx, COL.ADDRESS),
      form:    _pick(row, idx, COL.FORM),
      email:   _pick(row, idx, COL.EMAIL),
      tel:     _pick(row, idx, COL.TEL),
      sns: {
        instagram: _pick(row, idx, COL.IG),
        facebook:  _pick(row, idx, COL.FB),
        x:         _pick(row, idx, COL.X),
        line:      _pick(row, idx, COL.LINE),
        tiktok:    _pick(row, idx, COL.TIKTOK)
      },
      bizDays: _pick(row, idx, COL.BIZ_DAYS),
      holiday: _pick(row, idx, COL.HOLIDAY),
      bizNote: _pick(row, idx, COL.BIZ_NOTE),
      fee:     _pick(row, idx, COL.FEE),
      bring:   _pick(row, idx, COL.BRING),
      target:  _pick(row, idx, COL.TARGET),
      apply:   _pick(row, idx, COL.ORG_APPLY),
      organizer: _pick(row, idx, COL.ORG),
      organizerTel: _pick(row, idx, COL.ORG_TEL),
      venueNote: _pick(row, idx, COL.VENUE_NOTE),
      note:      _pick(row, idx, COL.NOTE),
      downloadUrl: _pick(row, idx, COL.DL_URL),
      bizOpen, bizClose, startDate, endDate, startTime, endTime,
      hoursCombined: (bizOpen && bizClose) ? (bizOpen + '〜' + bizClose) : '',
      eventDate: (startDate && endDate) ? (startDate === endDate ? startDate : startDate + '〜' + endDate) : '',
      eventTime: (startTime && endTime) ? (startTime + '〜' + endTime) : ''
    });
    if (limit && out.length >= limit) break;
  }
  return out;
}

function _getAllL1L2() {
  const sh = _sheet();
  const values = sh.getDataRange().getValues();
  if (values.length < DATA_START_ROW) return [];
  const header = (values[HEADER_ROW - 1] || []).map(v => String(v).trim());
  const idx = _indexHeader(header);
  const seen = new Set();
  const list = [];
  for (let r = DATA_START_ROW - 1; r < values.length; r++) {
    const l1 = String(_pick(values[r], idx, COL.L1) || '').trim();
    const l2 = String(_pick(values[r], idx, COL.L2) || '').trim();
    if (!l1 || !l2) continue;
    const key = l1 + "|||" + l2;
    if (seen.has(key)) continue;
    seen.add(key);
    list.push({ l1, l2, rowIndex: r + 1 });
  }
  return list;
}

function doGet(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};
    if (p.all == '1' || p.all === 'true') {
      const pairs = _getAllL1L2();
      return ContentService.createTextOutput(JSON.stringify({ ok:true, items:pairs })).setMimeType(ContentService.MimeType.JSON);
    }
    const data = _getRowsByL1L2(p.l1 || '', p.l2 || '', p.limit ? parseInt(p.limit, 10) : 50);
    return ContentService.createTextOutput(JSON.stringify({ ok:true, items:data })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok:false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}