/**
 * Appletown Iizuna - System Delivery Presentation Exporter
 * 
 * This script generates a professional Google Slides presentation based on the
 * system specification. 
 * 
 * Usage:
 * 1. Create a new Google Apps Script project (script.new).
 * 2. Paste this code and Run 'createDeliveryPresentation'.
 * 3. A new Google Slide will be created in your Drive.
 */

function createDeliveryPresentation() {
  const TITLE = "飯綱町りんごポータルサイト「りんごのまちいいづな」";
  const SUBTITLE = "情報プラットフォーム・システム概要仕様書";
  
  // 1. Create the Presentation
  const deck = SlidesApp.create(TITLE + " 納品資料");
  console.log("Created Presentation: " + deck.getUrl());

  // 2. Title Slide
  const titleSlide = deck.getSlides()[0];
  titleSlide.insertShape(SlidesApp.ShapeType.RECTANGLE, 0, 0, 720, 405).getFill().setSolidFill("#D71920"); // Brand Red
  const titleText = titleSlide.insertShape(SlidesApp.ShapeType.TEXT_BOX, 50, 100, 620, 100);
  titleText.getText().setText(TITLE).getTextStyle().setForegroundColor("#FFFFFF").setFontSize(36).setBold(true);
  const subText = titleSlide.insertShape(SlidesApp.ShapeType.TEXT_BOX, 50, 200, 620, 50);
  subText.getText().setText(SUBTITLE).getTextStyle().setForegroundColor("#FFFFFF").setFontSize(18);

  // 3. Slide Contents Definition
  const slides = [
    {
      title: "01. ビジョン：まちづくりの基盤となる「入り口」",
      body: "・分散している飯綱町のりんごの魅力を一つに繋ぐ『デジタル・ゲートウェイ』\n・町内外の誰もがアクセスできる開かれた情報プラットフォーム\n・個別農家・事業者の発信を補完し、町全体の認知を最大化"
    },
    {
      title: "02. 価値の3本柱：ユーザーを導き、情報を育てる",
      body: "・体系的に知る：品種、販売店、加工品を迷わず発見できる辞書的構成\n・町を楽しむ：『味わう・体験する・訪れる』をシームレスに繋ぐUX\n・みんなで育てる：生産者、地域住民と共に情報を育てる共創型インフラ"
    },
    {
      title: "03. UX戦略：情報を「小さな記事」で整理する",
      body: "・マイクロ記事構成：読みやすさとシェア性を両立した記事単位の設計\n・独立URL：各記事に固有URLを付与し、SNSでの拡散精度を向上\n・アクション誘導：記事から予約・公式サイトへ即座にリーチ可能"
    },
    {
      title: "04. O2O連携：オンラインからオフラインの現場へ",
      body: "・A4プリント機能：WEB記事をそのまま店頭POPや配布資料として活用\n・QRコード自動挿入：印刷物から最新のデジタル情報へユーザーを連れ戻す\n・現場の負担軽減：情報の更新＝店頭配布物の更新となる効率的な運用"
    },
    {
      title: "05. 持続性：みんなで育てる「Google Sheets CMS」",
      body: "・使い慣れたスプレッドシートをDB化：高度なIT知識不要の更新環境\n・リアルタイム反映：役場や地域の方が直接愛情を持って情報をメンテナンス\n・デジタル資産の集積：日々の更新がそのまま町の歴史・物語として蓄積"
    },
    {
      title: "06. 解析機能：数字の裏にある「熱量」を測る",
      body: "・アクティブ滞在時間の計測：Page Visibility APIを活用した独自ロジック\n・『本当に精読されているか』の可視化：従来型PVを超えた関心度の把握\n・コンテンツ改善の羅針盤：成果が見えることで情報更新のモチベーションへ"
    },
    {
      title: "07. データの透明性：UU単位での地域分析",
      body: "・高精度な地域分析：セッションベースではなくユーザー単位での地域集計\n・データ整合性：地域別ランキングの合計とトータルUUを完全に一致\n・確かなマーケティング判断：正確なデータに基づいた次の一手の策定"
    },
    {
      title: "08. 拡張性：グローバル基準とサーバーレス構成",
      body: "・多言語基盤：日・英・繁へのネイティブ対応（SEO構造も完全最適化）\n・サーバーレス設計：Google Apps Scriptによる運用コストゼロの実現\n・高速な閲覧体験：SPA的なモーダル制御によるストレスフリーな回遊"
    },
    {
      title: "09. 情報の未来：寄せられる声で豊かになる",
      body: "・はじまりのプラットフォーム：寄せられる情報で立体的に進化し続ける\n・関係人口の創出：りんごをきっかけに飯綱町に深く関わる人々の増加へ\n・生きたアーカイブ：町内外をつなぐ大きな力としての情報基盤"
    },
    {
      title: "10. 保守・運用：信頼性のための自動監視",
      body: "・clasp：バージョン管理による安全な開発・デプロイ体制\n・エラー自動トラッキング：システム異常を即座に検知・記録する体制\n・CDNアセット管理：高速な表示とモダンなビジュアルの両立"
    }
  ];

  // 4. Generate Body Slides
  slides.forEach(s => {
    const slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
    slide.getShapes()[0].getText().setText(s.title);
    slide.getShapes()[1].getText().setText(s.body);
  });

  // 5. Final Slide
  const finalSlide = deck.appendSlide(SlidesApp.PredefinedLayout.CENTERED_TITLE);
  finalSlide.getShapes()[0].getText().setText("Thank You\nAppletown Iizuna Project");

  console.log("Presentation Generation Complete!");
  return deck.getUrl();
}
