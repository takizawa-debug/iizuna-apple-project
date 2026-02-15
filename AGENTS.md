# AGENTS.md

## プロジェクト概要
**飯綱町多言語アップルプロジェクト (Appletown Iizuna Multilingual Project)**
本プロジェクトは、飯綱町の観光・農業情報を多言語（日・英・中）で発信し、収集したデータを蓄積・活用するためのシステムです。

## 技術スタック
- **Frontend**: Vanilla JS / HTML / CSS (ディレクトリ: `web/`, `Form/`)
- **Backend**: Google Apps Script (GAS) (ディレクトリ: `Import/`, `Analytics/`)
- **Database**: Google Spreadsheet
  - **Content & CMS**: `Import` ⇔ [情報編集用スプレッドシート_りんごのまちいいづな](https://docs.google.com/spreadsheets/d/1ODqTU1KspNWDZq7NYICyeAjUOHNdQIV9TfFs9fpPKkU) (`1ODqTU1KspNWDZq7NYICyeAjUOHNdQIV9TfFs9fpPKkU`)
  - **Analytics**: `Analytics` ⇔ [Appletown Analytics](https://docs.google.com/spreadsheets/d/1bXo0glShkmUXFF-LwTm8HkWs9N9bUbTWxJel7x9sLEU) (`1bXo0glShkmUXFF-LwTm8HkWs9N9bUbTWxJel7x9sLEU`)
- **Storage**: AWS S3 (`appletown-iizuna` バケット)
- **AI**: Google Gemini API (`gemini-2.5-flash`)
- **DevOps**: Google Clasp

## 重要環境変数 (Script Properties)
以下の変数は `PropertiesService.getScriptProperties()` を通じて管理・取得します。**コードセット内にハードコードしてはいけません。**

| キー名 | 等価な役割 | 備考 |
| :--- | :--- | :--- |
| `TR_API_KEY` | Gemini API Key | 翻訳機能(`Import/翻訳.js`)で使用 |
| `AWS_ACCESS_KEY_ID` | AWS Access Key | S3アップロード(`Import/保存処理.js`)で使用 |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key | S3アップロード(`Import/保存処理.js`)で使用 |
| `ADMIN_EMAIL` | 管理者メールアドレス | 定数`ADMIN_EMAIL`の初期値として使用される場合あり |

## ディレクトリ構成と役割
### `Import/` (Content Management System)
メインのGASプロジェクト。飯綱町のコンテンツ管理機能の中核を担います。
- **紐付くSS**: `1ODqTU1KspNWDZq7NYICyeAjUOHNdQIV9TfFs9fpPKkU`
- **主要なシート**:
  - `公開用`: Webサイト出力用マスター（日・英・中3言語、画像、営業情報、地図）
  - `投稿一覧`: フォームからの投稿（記事、情報提供、お問い合わせ）蓄積
  - `フォーム項目`: フォームの動的カテゴリ、品種、加工品マスター
  - `カテゴリ`: メインセクション（知る、味わう等）の依存関係管理
  - `キーワード定義`: `翻訳.js` 用の用語集（Gemini API用グロッサリー）
  - `品種定義`: 詳細スペック管理

### `Analytics/` (Appletown Analytics)
ユーザー行動分析やエラー監視を行うGASプロジェクト。
- **紐付くSS**: `1bXo0glShkmUXFF-LwTm8HkWs9N9bUbTWxJel7x9sLEU`
- **主要なシート**:
  - `Logs`: ユーザー訪問、セッション、イベント、Geo情報を記録
  - `Errors`: GAS実行時エラーとスタックトレースを記録

### `web/`
フロントエンドの静的ファイル群。

### `Form/`
フォーム生成ロジックや `i18n.js`（多言語辞書）を含む共有または参照用コード。

## 本番環境（ペライチ）統合仕様

### 1. フロントエンド・ロード戦略
ペライチ環境では、以下の順序でスクリプトが読み込まれます。この順序は **厳守** してください。

- **Base URL**: `https://takizawa-debug.github.io/iizuna-apple-project/web/`
- **ロード順序**:
  1. `config.js` (設定定義)
  2. `common.js` (共通ユーティリティ)
  3. `slideshow.js`
  4. `header.js` / `section.js` / `sidenav.js` (UIコンポーネント)
  5. **`modal-search.js`** (重要: `window.lzSearchEngine` 定義)
  6. **`modal.js`** (重要: `lzSearchEngine` を利用してレンダリング)
  7. `search.js` / `footer.js`
  8. `analytics.js` (最後に読み込み)

**⚠️ 依存関係のリスク**:
`modal-search.js` は `modal.js` より **先に** 読み込まれる必要があります。
順序が逆転すると、URLパラメータ (`?id=...`) によるモーダル初期表示時に `lzSearchEngine` が未定義となり、**本文内の自動リンク生成やキーワード強調が無効な状態で表示**されてしまいます。

### 2. コンポーネント注入
- **フォーム**: `<div id="lz-form-container"></div>` に対して `Form/main.js` が ES Modules (`modulepreload`) として注入されます。

## データ構造とスキーマ定義 (Source of Truth)

### `Import/HP出力.js` ⇔ 「公開用」シート
このスクリプト内の `const COL` 定義が、スプレッドシートの期待する構造です。
- **必須カラム**: `Title`, `Lead`, `Body` (各言語), `L1`, `L2` (カテゴリ)
- **多言語対応**: `_en` (英語), `_中文` (中国語) の接尾辞を持つカラムが存在すること。
- **画像**: `画像1` (Main) 〜 `画像6` (Sub5) まで対応。

## コーディング規約 & エージェント運用ルール

### 1. 言語・コメント
- **ソースコード**: 原則として変数名などは英語（CamelCase）。
- **コメント**: **日本語**で記述すること。特に関数の役割、引数、戻り値についてはJSDoc形式で記述する。
  ```javascript
  /**
   * 指定された行の翻訳処理を実行する
   * @param {string} targetLang - 対象言語 ('English' or 'Chinese')
   */
  ```

### 2. 安全性・セキュリティ
- APIキー、Secretキーは必ず `PropertiesService` から取得する。
- 外部API呼び出し (`UrlFetchApp`) は必ず `try-catch` で囲み、エラーログを出力する。

### 3. 多言語対応 (i18n)
- ユーザー向けの表示文言はハードコードせず、`Form/i18n.js` の辞書定義を利用する（可能な場合）。
- Geminiプロンプト内での言語指定や用語統一指示（Glossary）を遵守する。

### 4. デプロイ運用 (Clasp)
- `package.json` に定義されたスクリプトを使用する。
  - `npm run gas-push-import`: Importプロジェクトのアップロード
  - `npm run gas-push-analytics`: Analyticsプロジェクトのアップロード
- `.clasp.json` の `scriptId` が正しい環境（本番/開発）を指しているか確認する。

## エージェント・タスク実行チェックリスト
- [ ] **変更の影響範囲確認**: `Import` を変更する場合、Spreadsheetの構造（列定義）に変更が必要か確認したか？
- [ ] **AWS署名**: S3アップロード処理を変更する場合、Signature V4の生成ロジックを壊していないか？
- [ ] **AIプロンプト**: `翻訳.js` のプロンプトを変更する場合、JSON出力形式の制約を守っているか？
- [ ] **テスト**: ローカルで実行できないGAS特有の機能（`SpreadsheetApp`, `PropertiesService` 等）を含む場合、モックを作成するか、最小限のテスト関数を作成して動作確認を行う案を提示したか？

---
*このファイルはエージェント（あなた）が常に参照すべき指針です。タスク開始時に必ず読み返してください。*

## リファクタリング計画 (Future Refactoring Plan)

### 1. フロントエンド：ビルドシステムの導入 (Vite/Rollup)
**現状の問題**: JSファイルごとの動的CSS注入によるレンダリングブロックと依存関係の複雑化。
**計画**: ローカル開発環境に **Vite** を導入し、デプロイ時に単一の `bundle.js` / `bundle.css` に統合する。

### 2. バックエンド：設定の一元管理 (`ConfigService`)
**現状の問題**: スプレッドシートID等のハードコード。
**計画**: `ScriptProperties` または単一の `Config.js` に集約し、環境切り替えを容易にする。

### 3. 共通ユーティリティのライブラリ化
**現状の問題**: 日付変換や画像パス処理の散在。
**計画**: GAS側に `Utils.js`、フロント側に強化版 `LZ_COMMON` を整備し、ロジックを統一する。

### 4. 分析基盤の強化 (BigQuery連携)
**現状の問題**: スプレッドシートの行数制限（500万セル）への到達リスク。
**計画**: データの保存先を **BigQuery** に切り替え、ストリーミング挿入でスケーラビリティを確保する。
