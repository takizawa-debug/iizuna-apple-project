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
  const SUBTITLE = "システム概要・アクセス分析システム 納品仕様書";
  
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
      title: "1. プロジェクト・コンセプト",
      body: "・飯綱町のりんごの魅力を世界へ（多言語対応）\n・直感的な操作性と美麗なビジュアルの両立\n・エンジニア不要のGoogle Sheetsによるコンテンツ管理"
    },
    {
      title: "2. 統合検索ジャーニー",
      body: "・キーワード検索とタグ回遊をシームレスに統合\n・ユーザーの『興味の連鎖』を止めない回遊設計\n・即座に応答する高速なフロントエンド検索エンジン"
    },
    {
      title: "3. 進化したモーダル体験",
      body: "・ページ遷移なしの快適な記事閲覧\n・デジタル・パンフレット(PDF)発行機能\n・3言語(日・英・繁)の即時切り替えUI"
    },
    {
      title: "4. アクセス分析システム：Appletown Analytics",
      body: "・PV/UUだけでない『真の関心』の可視化\n・前期間（前週/前月）とのリアルタイム比較グラフ\n・サーバーレス構成による運用コストゼロの実現"
    },
    {
      title: "5. アクティブ滞在時間の計測ロジック",
      body: "・Page Visibility APIを活用した独自ロジック\n・『実際に画面を見ていた時間』のみを抽出計測\n・真の優良コンテンツを特定する為の独自指標"
    },
    {
      title: "6. データ整合性と地域分析",
      body: "・UU(ユニークユーザー)単位での地域集計\n・トータルユーザー数と地域ランキングの完全一致を実現\n・正確な流入元分析によるマーケティング効果の可視化"
    },
    {
      title: "7. 運用・管理メンテナンス",
      body: "・Google Sheetsによるリアルタイムなコンテンツ更新\n・claspによるバージョン管理と安定稼働\n・エラーログの自動収集体制"
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
