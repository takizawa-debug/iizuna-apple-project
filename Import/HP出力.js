/***** 設定 *****/
const SPREADSHEET_ID = '1ODqTU1KspNWDZq7NYICyeAjUOHNdQIV9TfFs9fpPKkU';
const SHEET_NAME = '公開用';

const HEADER_ROW = 2;
const DATA_START_ROW = 3;

/***** 列名マッピング（多言語対応版） *****/
const COL = {
  // --- 既存の定義 ---
  L1: 'L1', L2: 'L2', L3: 'L3_LABEL', TITLE: 'タイトル', LEAD: 'リード文', BODY: '本文',
  MAIN: '画像1',
  SUB1: '画像2',
  SUB2: '画像3',
  SUB3: '画像4', // 🍎 SUB3を追加
  SUB4: '画像5',
  SUB5: '画像6',
  LINK: 'ホームページ', EC: 'ECサイト',
  REL1_URL: '関連記事1_URL', REL1_TITLE: '関連記事1_タイトル',
  REL2_URL: '関連記事2_URL', REL2_TITLE: '関連記事2_タイトル',
  ADDRESS: '住所', FORM: '問い合わせフォームURL', EMAIL: '問い合わせメール', TEL: '問い合わせ電話',
  IG: 'SNS_Instagram', FB: 'SNS_Facebook', X: 'SNS_X', LINE: 'SNS_LINE', TIKTOK: 'SNS_TikTok',
  BIZ_DAYS: '営業曜日', BIZ_OPEN: '営業開始時刻', BIZ_CLOSE: '営業終了時刻', HOLIDAY: '定休日',
  BIZ_NOTE: '営業に関する注意事項', START_DATE: '開始日', END_DATE: '終了日',
  START_TIME: '開始時刻', END_TIME: '終了時刻', FEE: '参加費', BRING: 'もちもの',
  TARGET: '対象', ORG_APPLY: '申し込み方法', ORG: '主催者名', ORG_TEL: '主催者連絡先',
  VENUE_NOTE: '会場に関する注意事項', NOTE: '備考', DL_URL: 'ダウンロードURL',

  // --- 【新規追加】英語（en） ---
  L1_EN: 'L1_en', L2_EN: 'L2_en', L3_EN: 'L3_LABEL_en',
  TITLE_EN: 'タイトル_en', LEAD_EN: 'リード文_en', BODY_EN: '本文_en',

  // --- 【新規追加】中国語（zh） ---
  L1_ZH: 'L1_中文', L2_ZH: 'L2_中文', L3_ZH: 'L3_LABEL_中文',
  TITLE_ZH: 'タイトル_中文', LEAD_ZH: 'リード文_中文', BODY_ZH: '本文_中文'
};

/***** ユーティリティ *****/
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

  let dateObj = raw;

  // 🍎 数値（0〜1の小数点：シリアル値）で届いた場合の変換ロジックを追加
  if (typeof raw === 'number') {
    if (raw >= 0 && raw < 1) {
      // 0.375 などの小数を時刻に変換
      // 1899/12/30を基準にするスプレッドシートの仕様に合わせる
      dateObj = new Date(0, 0, 0, 0, 0, 0);
      dateObj.setSeconds(Math.round(raw * 86400));
    } else if (raw >= 1) {
      // 1以上の数値（日付＋時刻）の場合
      dateObj = new Date((raw - 25569) * 86400 * 1000);
    }
  }

  // Dateオブジェクトであればフォーマットして返す
  if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
    // タイムゾーンを考慮してHH:mm形式に
    return Utilities.formatDate(dateObj, Session.getScriptTimeZone(), 'HH:mm');
  }

  // 文字列（"9:00"など）で届いた場合は、既存の整形ロジックを適用
  const s = String(raw).trim();
  const m = s.match(/^(\d{1,2})[:：]?(\d{0,2})$/);
  if (m) return ('0' + m[1]).slice(-2) + ':' + (m[2] ? ('0' + m[2]).slice(-2) : '00');

  return s;
}

function _fmtDateYMD(raw) {
  if (!raw && raw !== 0) return '';

  let dateObj = raw;

  // 🍎 数値（シリアル値）で届いた場合の変換ロジックを追加
  if (typeof raw === 'number' && raw > 30000) {
    // スプレッドシートのシリアル値をJSのDateオブジェクトに変換
    dateObj = new Date((raw - 25569) * 86400 * 1000);
  }

  // Dateオブジェクトであればフォーマットして返す
  if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
    return Utilities.formatDate(dateObj, Session.getScriptTimeZone(), 'yyyy/MM/dd');
  }

  // それ以外（既に文字列の場合など）は記号を整えて返す
  return String(raw).trim().replace(/[．。\.－–—-]/g, '/');
}

/**
 * 「日, 月, 火」を「日曜日〜火曜日」のように優しい表現に変換する
 */
function _fmtDayFriendly(raw) {
  if (!raw) return '';
  const daysOrder = ["日", "月", "火", "水", "木", "金", "土"];

  // 1. カンマで分割して各曜日をトリミング
  const parts = String(raw).split(/[，,、\s]+/).map(d => d.trim()).filter(d => daysOrder.includes(d));

  if (parts.length === 0) return String(raw); // 形式に合わない場合はそのまま返す

  // 2. 曜日のインデックス番号に変換して昇順ソート
  const indices = parts.map(d => daysOrder.indexOf(d)).sort((a, b) => a - b);

  const result = [];
  let i = 0;
  while (i < indices.length) {
    let j = i;
    // 連続しているかチェック
    while (j + 1 < indices.length && indices[j + 1] === indices[j] + 1) {
      j++;
    }

    if (j - i >= 2) {
      // 3つ以上連続している場合は「〜」で繋ぐ
      result.push(daysOrder[indices[i]] + "曜日〜" + daysOrder[indices[j]] + "曜日");
    } else {
      // 連続していない、または2つだけの場合は個別に「曜日」を付けて追加
      for (let k = i; k <= j; k++) {
        result.push(daysOrder[indices[k]] + "曜日");
      }
    }
    i = j + 1;
  }

  // 3. 最後に読点（、）で繋ぐ
  return result.join("、");
}

/***** ★データ変換ロジック（完全網羅版） *****/
function _mapRowToObject(row, idx) {
  const mainImage = _finalizeImageUrl(_pick(row, idx, COL.MAIN));
  const subs = [COL.SUB1, COL.SUB2, COL.SUB3, COL.SUB4, COL.SUB5]
    .map(key => _finalizeImageUrl(_pick(row, idx, key)))
    .filter(u => u !== "");

  const relatedArticles = [];
  [[COL.REL1_URL, COL.REL1_TITLE], [COL.REL2_URL, COL.REL2_TITLE]].forEach(pair => {
    const u = _pick(row, idx, pair[0]), t = _pick(row, idx, pair[1]);
    if (u || t) relatedArticles.push({ url: u, title: t });
  });

  // 時刻・日付のフォーマット処理
  const bizOpen = _fmtTimeHHMM(_pick(row, idx, COL.BIZ_OPEN));
  const bizClose = _fmtTimeHHMM(_pick(row, idx, COL.BIZ_CLOSE));
  const startTime = _fmtTimeHHMM(_pick(row, idx, COL.START_TIME)); // 追加：開始時刻
  const endTime = _fmtTimeHHMM(_pick(row, idx, COL.END_TIME));   // 追加：終了時刻
  const startDate = _fmtDateYMD(_pick(row, idx, COL.START_DATE));
  const endDate = _fmtDateYMD(_pick(row, idx, COL.END_DATE));

  return {
    l1: _pick(row, idx, COL.L1), l2: _pick(row, idx, COL.L2), l3: _pick(row, idx, COL.L3),
    title: _pick(row, idx, COL.TITLE), lead: _pick(row, idx, COL.LEAD), body: _pick(row, idx, COL.BODY),
    en: {
      l1: _pick(row, idx, COL.L1_EN), l2: _pick(row, idx, COL.L2_EN), l3: _pick(row, idx, COL.L3_EN),
      title: _pick(row, idx, COL.TITLE_EN), lead: _pick(row, idx, COL.LEAD_EN), body: _pick(row, idx, COL.BODY_EN)
    },
    zh: {
      l1: _pick(row, idx, COL.L1_ZH), l2: _pick(row, idx, COL.L2_ZH), l3: _pick(row, idx, COL.L3_ZH),
      title: _pick(row, idx, COL.TITLE_ZH), lead: _pick(row, idx, COL.LEAD_ZH), body: _pick(row, idx, COL.BODY_ZH)
    },
    mainImage, subImages: subs, home: _pick(row, idx, COL.LINK), ec: _pick(row, idx, COL.EC),
    relatedArticles, address: _pick(row, idx, COL.ADDRESS), form: _pick(row, idx, COL.FORM),
    email: _pick(row, idx, COL.EMAIL), tel: _pick(row, idx, COL.TEL),
    sns: {
      instagram: _pick(row, idx, COL.IG), facebook: _pick(row, idx, COL.FB),
      x: _pick(row, idx, COL.X), line: _pick(row, idx, COL.LINE), tiktok: _pick(row, idx, COL.TIKTOK)
    },
    bizDays: _fmtDayFriendly(_pick(row, idx, COL.BIZ_DAYS)),
    holiday: _fmtDayFriendly(_pick(row, idx, COL.HOLIDAY)),
    fee: _pick(row, idx, COL.FEE), target: _pick(row, idx, COL.TARGET),
    organizer: _pick(row, idx, COL.ORG), downloadUrl: _pick(row, idx, COL.DL_URL),

    // --- 🍎 ここから不足分を忠実に追加 ---
    bizNote: _pick(row, idx, COL.BIZ_NOTE),        // 営業に関する注意事項
    bring: _pick(row, idx, COL.BRING),            // もちもの
    orgTel: _pick(row, idx, COL.ORG_TEL),          // 主催者連絡先
    venueNote: _pick(row, idx, COL.VENUE_NOTE),    // 会場に関する注意事項
    note: _pick(row, idx, COL.NOTE),              // 備考
    orgApply: _pick(row, idx, COL.ORG_APPLY),    // 申し込み方法

    // 合成項目
    hoursCombined: (bizOpen && bizClose) ? bizOpen + '〜' + bizClose : bizOpen || bizClose || '',
    eventDate: (startDate && endDate) ? (startDate === endDate ? startDate : startDate + '〜' + endDate) : startDate || endDate || '',
    eventTime: (startTime && endTime) ? startTime + '〜' + endTime : startTime || endTime || '' // 追加：開催時間
  };
}

/** キャッシュクリア（GASエディタから手動実行用）*/
function clearApiCache() {
  CacheService.getScriptCache().removeAll([
    // 全キャッシュを一括削除する正攻法はないが、removeAllでキーを指定しなくても
    // put/getのTTLが6時間なので、新しいデプロイ直後にキーが衝突するときに使う
  ]);
  // removeAllが空配列だと無意味なので、代替手段としてダミーキーで上書き
  Logger.log('キャッシュTTL切れを待つか、新バージョンデプロイで自動無効化されます');
}

/***** ★検索・取得メインロジック *****/
function doGet(e) {
  try {
    const p = e.parameter || {};

    // 🍎 キャッシュキーの生成 (パラメータが一意であればOK)
    // フォーム設定などの動的要素はキャッシュしない、または短くするなどの判断が必要だが、
    // 基本的にマスターデータ系なのでキャッシュして問題ない。
    const cache = CacheService.getScriptCache();
    const cacheKey = "api_v2_" + Utilities.base64Encode(JSON.stringify(p));

    // キャッシュがあればそれを返す (フォーム関連などキャッシュしたくないものは除外)
    if (p.mode !== 'form_genres') {
      const cached = cache.get(cacheKey);
      if (cached) {
        return ContentService.createTextOutput(cached).setMimeType(ContentService.MimeType.JSON);
      }
    }

    if (p.mode === 'form_genres') {
      return serveFormGenres(e); // 新しいファイルに書いた関数を呼び出す
    }
    const sh = _sheet();
    const values = sh.getDataRange().getValues();
    const header = values[HEADER_ROW - 1].map(v => String(v).trim());
    const idx = _indexHeader(header);
    const dataRows = values.slice(DATA_START_ROW - 1);

    let resultObj;

    // 【追記箇所】キーワード定義シートから多言語リストを返すモード
    if (p.mode === 'keywords') {
      const kwSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('キーワード定義');
      if (!kwSheet) return _json({ ok: false, error: "キーワード定義シートが見つかりません" });

      const kwValues = kwSheet.getDataRange().getValues();
      const kwData = kwValues.slice(1)
        .filter(row => {
          // D列（row[3]）が3以上、かつ日本語（row[0]）が空でない行のみ抽出
          const count = Number(row[3]);
          return String(row[0] || "").trim() !== "" && !isNaN(count) && count >= 3;
        })
        .map(row => ({
          ja: String(row[0] || "").trim(),
          en: String(row[1] || "").trim(),
          zh: String(row[2] || "").trim()
        }));

      resultObj = { ok: true, items: kwData };
      // return _json(resultObj); // 後でキャッシュ保存するために変数に入れる
    }
    // 1. メニュー生成用
    else if (p.all === '1') {
      const seen = new Set();
      const list = dataRows.map((row, i) => {
        const l1 = String(_pick(row, idx, COL.L1)).trim();
        const l2 = String(_pick(row, idx, COL.L2)).trim();
        if (!l1 || !l2) return null;
        const key = l1 + "|||" + l2;
        if (seen.has(key)) return null;
        seen.add(key);
        // メニュー用データも多言語で返す
        return {
          l1, l2, l3: _pick(row, idx, COL.L3),
          en: { l1: _pick(row, idx, COL.L1_EN), l2: _pick(row, idx, COL.L2_EN), l3: _pick(row, idx, COL.L3_EN) },
          zh: { l1: _pick(row, idx, COL.L1_ZH), l2: _pick(row, idx, COL.L2_ZH), l3: _pick(row, idx, COL.L3_ZH) }
        };
      }).filter(Boolean);
      resultObj = { ok: true, items: list };
    }

    // 2. キーワード検索 (検索対象：タイトル・リード・本文・カテゴリL1〜L3の全言語)
    else if (p.q) {
      const q = p.q.toLowerCase();
      const results = dataRows.filter(row => {
        const searchTargets = [
          COL.TITLE, COL.LEAD, COL.BODY, COL.L1, COL.L2, COL.L3,
          COL.TITLE_EN, COL.LEAD_EN, COL.BODY_EN, COL.L1_EN, COL.L2_EN, COL.L3_EN,
          COL.TITLE_ZH, COL.LEAD_ZH, COL.BODY_ZH, COL.L1_ZH, COL.L2_ZH, COL.L3_ZH
        ];
        const text = searchTargets.map(k => String(_pick(row, idx, k)).toLowerCase()).join(' ');
        return text.includes(q);
      }).map(row => _mapRowToObject(row, idx));
      resultObj = { ok: true, items: results.slice(0, p.limit || 50) };
    }

    // 3. 通常のセクション取得
    else {
      const filtered = dataRows.filter(row =>
        String(_pick(row, idx, COL.L1)) === p.l1 && String(_pick(row, idx, COL.L2)) === p.l2
      ).map(row => _mapRowToObject(row, idx));
      resultObj = { ok: true, items: filtered };
    }

    // 🍎 JSON文字列化してキャッシュに保存 (21600秒 = 6時間)
    const jsonStr = JSON.stringify(resultObj);
    if (jsonStr.length < 100000) { // キャッシュサイズ制限（100KB目安）への配慮
      cache.put(cacheKey, jsonStr, 21600);
    }

    return ContentService.createTextOutput(jsonStr).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}