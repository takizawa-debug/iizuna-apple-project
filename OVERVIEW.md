# 飯綱町りんごポータルサイト「りんごのまちいいづな」リニューアル・システム概要仕様書

本ドキュメントは、飯綱町りんごポータルサイトの主要機能、システム構成、および独自開発された高度な分析システムについて、納品および運用に関わるステークホルダー向けに体系的にまとめた仕様書です。

---

## 1. プロジェクト・ビジョン
飯綱町が誇る「りんご」の魅力を、国内のみならず多言語で発信し、直感的な検索と美麗なビジュアルでユーザーの興味を惹きつける「デジタル・ショーケース」の実現。

![トップページ外観](file:///Users/takizawahiroki/.gemini/antigravity/brain/6df3dc5b-cb6a-4c08-97ef-d729c1fb9d82/top_page_screenshot_1771156263192.png)

---

## 2. 主要システム構成
本システムは、高い保守性とコストパフォーマンスを両立するため、サーバーレスなアーキテクチャを採用しています。

- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript (軽量・高速動作)
- **バックエンド**: Google Apps Script (GAS)
- **データベース**: Google Sheets (リアルタイム編集・管理が可能)
- **デプロイ・管理**: clasp (コード版管理・継続的デプロイ)

---

## 3. インタラクティブ・ユーザー体験 (UX)
ユーザーの「知りたい」に即座に応える、高度なフロントエンド機能を搭載しています。

### 3.1 多言語対応・記事詳細 (モーダル)
記事はページ遷移なしのモーダル形式で表示。読者のストレスを最小限に抑えます。
- **言語切り替え**: 日本語、English、繁體中文の3言語を即座に切り替え可能。
- **デジタル・パンフレット発行**: 記事内容をその場でPDF化して印刷・保存できる「デジタル発行機能」。
- **SNS共有**: 即座に外部へ魅力を発信できるシェアボタン。

![記事詳細モーダル機能](file:///Users/takizawahiroki/.gemini/antigravity/brain/6df3dc5b-cb6a-4c08-97ef-d729c1fb9d82/article_modal_screenshot_1771156352703.png)

### 3.2 統合検索ジャーニー
検索窓からのキーワード入力、および記事内に埋め込まれた関連キーワードをシームレスに統合。ユーザーを次の興味へと導く「回遊性」を重視した設計です。

---

## 4. 次世代型アクセス分析システム
本サイト専用に開発された「Appletown Analytics」は、単なる数字の集計を超え、ユーザーの「真の関心」を可視化します。

### 4.1 トレンド推移・前期間比較・モバイル対応
PV（閲覧数）やUU（ユーザー数）を時系列で表示。前期間との比較をグラフで可視化することで、キャンペーンやSNS拡散の効果を即座に判定できます。また、**スマホ表示（2x2グリッド・縦積みスタック）に完全対応**しており、出先でも素早く状況を確認可能です。

![分析ダッシュボード概要](file:///Users/takizawahiroki/.gemini/antigravity/brain/6df3dc5b-cb6a-4c08-97ef-d729c1fb9d82/dashboard_desktop_1771158627598.png)

### 4.2 「アクティブ滞在時間」による関心度測定
従来の「開いていた時間」ではなく、Page Visibility API を活用した**「実際に画面を注視していた時間」**を計測。どの記事が本当に読まれているかを正確にランキングします。

### 4.3 詳細な回遊・流入分析
ユーザーがどこから来て、何に興味を持ち、どのPDFを発行したか。これらを1つの画面で俯瞰することが可能です。

![モバイル表示（2x2グリッドと縦積み）](file:///Users/takizawahiroki/.gemini/antigravity/brain/6df3dc5b-cb6a-4c08-97ef-d729c1fb9d82/mobile_metrics_2x2_1771160017687.png)

---

## 5. 運用と管理

### 5.1 コンテンツ更新
Google Sheets を直接編集することで、エンジニア以外のスタッフでも記事情報やキーワードを更新できます。

### 5.2 システムURL一覧
- **[ウェブサイト (本番)](https://appletown-iizuna.com/)**
- **[アクセス分析ダッシュボード](https://script.google.com/macros/s/AKfycbzkygm3SbcZMqnLA6_U0cKkG_V-5tQHucTa6RZ8kMDtD6uJA8qDL45gQ5lcKWAq_Q1waA/exec?mode=dashboard)**
- **[管理データベース (Google Sheets)](https://docs.google.com/spreadsheets/d/1bXo0glShkmUXFF-LwTm8HkWs9N9bUbTWxJel7x9sLEU/edit)**

---
**作成者**: Antigravity (Advanced AI Architecture Lead)
**最終更新日**: 2026年2月15日
