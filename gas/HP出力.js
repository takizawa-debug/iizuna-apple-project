/***** 設定 *****/
const SPREADSHEET_ID = '1ODqTU1KspNWDZq7NYICyeAjUOHNdQIV9TfFs9fpPKkU';
const SHEET_NAME     = '公開用';

const HEADER_ROW     = 2;
const DATA_START_ROW = 3;

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

/***** ユーティリティ・フォーマッタ（変更なし） *****/
function _sheet() { return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME); }
function _indexHeader(header) { const map = {}; header.forEach((h, i) => map[String(h).trim()] = i); return map; }
function _pick(row, idx, key) { const i = idx[key]; return i == null ? '' : (row[i] ?? ''); }

function _finalizeImageUrl(url) {
  if (!url) return "";
  var s = String(url).trim();
  var s3Pattern = /^https?:\/\/s3-ap-northeast-1\.amazonaws\.com\/s3\.peraichi\.com\//i;
  s = s.replace(s3Pattern, "https://cdn.peraichi.com/");
  if (s.indexOf("drive.google.com") !== -1) {
    var match = s.match(/\/d\/([^/]+)/) || s.match(/id=([^&]+)/);
    if (match) s = "https://drive.google.com/uc?export=download&id=" + match[1];
  }
  return s;
}

function _fmtTimeHHMM(raw) {
  if (!raw && raw !== 0) return '';
  if (raw instanceof Date) return Utilities.formatDate(raw, Session.getScriptTimeZone(), 'HH:mm');
  const s = String(raw).trim();
  const m = s.match(/^(\d{1,2})[:：]?(\d{0,2})$/);
  if (m) return ('0' + m[1]).slice(-2) + ':' + (m[2] ? ('0' + m[2]).slice(-2) : '00');
  return '';
}

function _fmtDateYMD(raw) {
  if (!raw && raw !== 0) return '';
  if (raw instanceof Date) return Utilities.formatDate(raw, Session.getScriptTimeZone(), 'yyyy/MM/dd');
  return String(raw).trim().replace(/[．。\.－–—-]/g, '/');
}

/***** ★データ変換ロジック（関連記事2まで対応） *****/
function _mapRowToObject(row, idx) {
  const mainImage = _finalizeImageUrl(_pick(row, idx, COL.MAIN));
  const subs = [COL.SUB1, COL.SUB2, COL.SUB3, COL.SUB4, COL.SUB5]
    .map(key => _finalizeImageUrl(_pick(row, idx, key)))
    .filter(u => u !== "");

  // 関連記事1と2を両方取得
  const relatedArticles = [];
  [ [COL.REL1_URL, COL.REL1_TITLE], [COL.REL2_URL, COL.REL2_TITLE] ].forEach(pair => {
    const u = _pick(row, idx, pair[0]), t = _pick(row, idx, pair[1]);
    if (u || t) relatedArticles.push({ url: u, title: t });
  });

  const bizOpen = _fmtTimeHHMM(_pick(row, idx, COL.BIZ_OPEN));
  const bizClose = _fmtTimeHHMM(_pick(row, idx, COL.BIZ_CLOSE));
  const startDate = _fmtDateYMD(_pick(row, idx, COL.START_DATE));
  const endDate = _fmtDateYMD(_pick(row, idx, COL.END_DATE));

  return {
    l1: _pick(row, idx, COL.L1), l2: _pick(row, idx, COL.L2), l3: _pick(row, idx, COL.L3),
    title: _pick(row, idx, COL.TITLE), lead: _pick(row, idx, COL.LEAD), body: _pick(row, idx, COL.BODY),
    mainImage, subImages: subs, home: _pick(row, idx, COL.LINK), ec: _pick(row, idx, COL.EC),
    relatedArticles, address: _pick(row, idx, COL.ADDRESS), form: _pick(row, idx, COL.FORM),
    email: _pick(row, idx, COL.EMAIL), tel: _pick(row, idx, COL.TEL),
    sns: {
      instagram: _pick(row, idx, COL.IG), facebook: _pick(row, idx, COL.FB),
      x: _pick(row, idx, COL.X), line: _pick(row, idx, COL.LINE), tiktok: _pick(row, idx, COL.TIKTOK)
    },
    bizDays: _pick(row, idx, COL.BIZ_DAYS), holiday: _pick(row, idx, COL.HOLIDAY),
    fee: _pick(row, idx, COL.FEE), target: _pick(row, idx, COL.TARGET),
    organizer: _pick(row, idx, COL.ORG), downloadUrl: _pick(row, idx, COL.DL_URL),
    hoursCombined: (bizOpen && bizClose) ? bizOpen + '〜' + bizClose : bizOpen || bizClose || '',
    eventDate: (startDate && endDate) ? (startDate === endDate ? startDate : startDate + '〜' + endDate) : startDate || endDate || ''
  };
}

/***** ★検索・取得メインロジック *****/
function doGet(e) {
  try {
    const p = e.parameter || {};
    const sh = _sheet();
    const values = sh.getDataRange().getValues();
    const header = values[HEADER_ROW - 1].map(v => String(v).trim());
    const idx = _indexHeader(header);
    const dataRows = values.slice(DATA_START_ROW - 1);

    // 1. メニュー生成用（全L1, L2ペア）
    if (p.all === '1') {
      const seen = new Set();
      const list = dataRows.map((row, i) => {
        const l1 = String(_pick(row, idx, COL.L1)).trim();
        const l2 = String(_pick(row, idx, COL.L2)).trim();
        if (!l1 || !l2) return null;
        const key = l1 + "|||" + l2;
        if (seen.has(key)) return null;
        seen.add(key);
        return { l1, l2, l3: _pick(row, idx, COL.L3) };
      }).filter(Boolean);
      return _json({ ok:true, items:list });
    }

    // 2. キーワード検索（search.js用）
    if (p.q) {
      const q = p.q.toLowerCase();
      const results = dataRows.filter(row => {
        const text = [COL.TITLE, COL.LEAD, COL.BODY, COL.L3].map(k => String(_pick(row, idx, k)).toLowerCase()).join(' ');
        return text.includes(q);
      }).map(row => _mapRowToObject(row, idx));
      return _json({ ok:true, items: results.slice(0, p.limit || 50) });
    }

    // 3. 通常のセクション取得
    const filtered = dataRows.filter(row => 
      String(_pick(row, idx, COL.L1)) === p.l1 && String(_pick(row, idx, COL.L2)) === p.l2
    ).map(row => _mapRowToObject(row, idx));

    return _json({ ok:true, items: filtered });

  } catch (err) {
    return _json({ ok:false, error: String(err) });
  }
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}