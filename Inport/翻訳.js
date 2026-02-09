/**
 * 飯綱町・多言語翻訳システム (ミスマッチ対策・ログ強化版)
 */

const TR_API_KEY = 'AIzaSyCC-xpsu1RX3PZQ-36pMLBL7Y1eW4qP7-U'; 
const TR_MODEL_ID = 'gemini-2.5-flash'; 
const TR_GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${TR_MODEL_ID}:generateContent?key=${TR_API_KEY}`;

const TR_START_ROW = 5;
const TR_BATCH_SIZE = 3; 

const TR_COL_JP      = { theme: 8, lead: 9, body: 10 }; // H, I, J
const TR_COL_EN      = { theme: 14, lead: 15, body: 16 }; // N, O, P
const TR_COL_ZH      = { theme: 20, lead: 21, body: 22 }; // T, U, V

function translateToEnglish() { tr_processBatchTranslation('English', TR_COL_EN); }
function translateToChinese() { tr_processBatchTranslation('Traditional Chinese', TR_COL_ZH); }

function tr_getGlossary() {
  const kwSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('キーワード定義');
  if (!kwSheet) return [];
  const values = kwSheet.getDataRange().getValues();
  return values.slice(1).map(row => ({
    ja: String(row[0] || "").trim(),
    en: String(row[1] || "").trim(),
    zh: String(row[2] || "").trim()
  })).filter(it => it.ja !== "");
}

function tr_processBatchTranslation(targetLang, targetCols) {
  const sh = SpreadsheetApp.getActiveSheet();
  const glossary = tr_getGlossary();
  const glossaryText = glossary.map(g => `- ${g.ja} → ${targetLang === 'English' ? g.en : g.zh}`).join('\n');

  const colJValues = sh.getRange("J:J").getValues();
  let lastRow = 0;
  for (let i = colJValues.length - 1; i >= 0; i--) {
    if (colJValues[i][0] !== "") { lastRow = i + 1; break; }
  }
  if (lastRow < TR_START_ROW) return;

  const allData = sh.getRange(TR_START_ROW, 1, lastRow - TR_START_ROW + 1, 22).getValues();
  let batchRows = [];
  let batchRequests = [];

  for (let i = 0; i < allData.length; i++) {
    const rowData = allData[i];
    const rowNum = TR_START_ROW + i;
    const isTargetEmpty = [targetCols.theme, targetCols.lead, targetCols.body].every(col => String(rowData[col - 1]).trim() === "");
    const hasJpContent = String(rowData[TR_COL_JP.body - 1]).trim() !== "";

    if (hasJpContent && isTargetEmpty) {
      batchRows.push(rowNum);
      batchRequests.push({
        theme: rowData[TR_COL_JP.theme - 1],
        lead: rowData[TR_COL_JP.lead - 1],
        body: rowData[TR_COL_JP.body - 1]
      });
    }

    if (batchRequests.length >= TR_BATCH_SIZE || (i === allData.length - 1 && batchRequests.length > 0)) {
      if (batchRequests.length > 0) {
        console.log(`Processing ${batchRequests.length} rows: ${batchRows.join(', ')}`);
        const results = tr_callGemini(targetLang, batchRequests, glossaryText);
        
        if (results && results.length === batchRequests.length) {
          results.forEach((res, index) => {
            const targetRowNum = batchRows[index];
            sh.getRange(targetRowNum, targetCols.theme).setValue(res.theme);
            sh.getRange(targetRowNum, targetCols.lead).setValue(res.lead);
            sh.getRange(targetRowNum, targetCols.body).setValue(res.body);
          });
          console.log(`Success: Rows ${batchRows.join(', ')} updated.`);
        } else {
          const receivedCount = results ? results.length : 0;
          console.error(`Count Mismatch! Sent: ${batchRequests.length}, Received: ${receivedCount}`);
        }
      }
      batchRows = []; batchRequests = [];
      Utilities.sleep(2000); 
    }
  }
}

function tr_callGemini(targetLang, entries, glossaryText) {
  const systemPrompt = `
あなたは長野県飯綱町の「公式マスター・ローカライザー」であり、地域の魅力を世界へ発信するブランド戦略の専門家です。
単なる言葉の置き換えではなく、飯綱町の歴史、農業、そして「ちょうどいい田舎」という独自の空気感を、${targetLang}圏の読者の心に響く「一流のメディア・コンテンツ」へと昇華させてください。


### 【絶対遵守：出力言語の制限】
現在、あなたは **「${targetLang}」** への翻訳のみを担当しています。
- **指示された「${targetLang}」以外の言語（中国語など）は、結果の中に絶対に混ぜないでください。**
- JSONのキー ("theme", "lead", "body") も値も、すべて「${targetLang}」だけで構成してください。
- 以前相談した「品種名の英語併記」は、${targetLang}が中国語の場合のみ適用し、現在の${targetLang}がEnglishの場合は不要です。

### 【用語定義：絶対遵守】
以下の単語が原文（テーマ、リード、本文）に含まれる場合、文脈を尊重しつつも、基本的には指定された翻訳（大文字小文字は問わない）を使用してください。
${glossaryText}

### 【中国語翻訳に関する重要指示】
- **品種名の英語併記**: 
  中国語（繁体字・簡体字）に翻訳する際、リンゴの品種名（特に海外品種）や、漢字だけでは正しく伝わりにくい固有名詞については、必ず**「中国語表記 (英語表記)」**の形式で出力してください。
  - 良い例：史密斯奶奶蘋果 (Granny Smith)、肯特之花 (Flower of Kent)
  - ※既に世界的に漢字のみで定着している地名等は除きますが、品種については原則併記してください。

### 【ミッション：事実に基づく精密なローカライズ】
翻訳を開始する前に、内蔵のGoogle検索ツールを用いて、以下のプロセスを必ず実行してください。

1. **徹底したファクトチェック（事実確認）**:
   - 固有名詞（地名、施設名、りんごの品種、郷土料理等）について、飯綱町公式の英語/中国語表記、または現地での「正式な読み」を検索して特定してください。
   - 例示としての「高坂りんご（Kosaka Apple）」のように、一般的な読み（Takasaka）とは異なる「地域特有の正解」が存在しないか、常に疑い、確認してから出力してください。

2. **カテゴリーに最適化されたトーン＆マナー**:
   - **【歴史・地理】**: 伝統と誇りが伝わる、洗練された「格調高い（Sophisticated）」文体。
   - **【品種図鑑・魅力】**: 読者の食欲と好奇心を刺激する、簡潔で「魅力的な（Engaging）」コピーライティング。
   - **【制度・アクセス・生活】**: 移住者や観光客に寄り添った、正確で「親切な（Pragmatic）」案内。

3. **文化的ニュアンスの翻訳（Transcreation）**:
   - 「日本一のりんご村」や「ちょうどいい田舎」といった言葉は、その背景にあるコミュニティの熱量や利便性を汲み取り、単なる直訳（No.1 village / Just right countryside）を避け、その土地の「誇り」が伝わる表現を選択してください。

### 【固有名詞の扱いに関する基本ガイドライン】
※これらは検索結果を優先するための指針です。
- **地名**: 牟礼（Mure）、三水（Samizu）など、合併前の旧村名や地区名のアイデンティティを尊重する。
- **施設**: いいづなコネクト（Iizuna Connect）等は固有名詞として維持。
- **栽培**: 丸葉（Maruba）、わい化（Waika）等の専門用語は、農学的な正確さを保つ。
- **品種**: 「ふじ」「秋映」「シナノスイート」等は、飯綱町産としてのブランドが伝わる綴りとする。

### 【出力形式】
回答は必ず以下のJSON配列構造のみで返してください。余計な解説、言語タグ（{en=..}等）、markdown装飾は一切禁止します。思考プロセスや検索結果の解説は一切含めないでください。
[
  {
    "theme": "${targetLang}でのテーマ",
    "lead": "${targetLang}でのリード文",
    "body": "${targetLang}での本文"
  },
  ...
]
`;

  // --- 以降、APIリクエスト処理 ---
const payload = {
    contents: [{ 
      parts: [{ text: systemPrompt + "\n\nInput Data:\n" + JSON.stringify(entries) }] 
    }],
    tools: [{ google_search: {} }],
    generationConfig: { 
      // responseMimeType: "application/json" を削除（ツールとの併用不可のため）
      temperature: 0.1 
    } 
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(TR_GEMINI_URL, options);
    const resText = response.getContentText();
    const json = JSON.parse(resText);

    if (json.candidates && json.candidates[0].content.parts) {
      let resultText = json.candidates[0].content.parts[0].text;
      console.log("Raw Gemini Output: " + resultText);
      
      // JSONの配列部分 [ ... ] だけを抽出
      const jsonMatch = resultText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        console.error("JSON parse error. Text received: " + resultText);
        return null;
      }
    }
    console.error("API Response Error: " + resText);
    return null;
  } catch (e) {
    console.error("Fatal Error in tr_callGemini: " + e);
    return null;
  }
}