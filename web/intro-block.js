/**
 * intro-block.js - トップページ紹介ブロック（多言語対応）
 * スライドショー直下：ウェルカムメッセージ ＋ 5カテゴリ左右交互レイアウト
 */
(function () {
    "use strict";

    var C = window.LZ_COMMON;
    if (!C) return;

    /* ==========================================
       1. 画像パス（プレビュー用はローカル、本番はS3等に差し替え）
       ========================================== */
    var IMAGES = {
        shiru: "https://cdn.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ae3ad00-8d6a-013e-bcd3-0a58a9feac02/IMG_2898.jpg",
        ajiwau: "https://cdn.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/6e2a2080-8d6a-013e-bcbf-0a58a9feac02/applejuice-8.jpg",
        taiken: "https://cdn.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/f2837410-8f03-013e-e63d-0a58a9feac02/photo-intermediate.jpg",
        kurasu: "https://cdn.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/a681db10-8ee6-013e-065b-0a58a9feac02/slide-01.jpg",
        itonamu: "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/b41733e0-8d6a-013e-bcf2-0a58a9feac02/sunfuji_kodama_1207-25.jpg"
    };

    /* ==========================================
       2. 多言語コンテンツ定義
       ========================================== */
    var CONTENT = {
        ja: {
            welcomeTitle: "ようこそ、りんごのまちへ。",
            welcomeBody: "北信濃の五岳が肩を並べ、\n空からの風が、そっと頬をなでる。\n冷たい空気と、温かな土をぎゅっと抱きしめて、\n色あざやかに輝くりんごと\n人々の心が、しずかに、響きあう。\nここは、実りの鼓動と、私の呼吸が交わる\nちょうど “いい” 場所。",
            buttonLabel: "詳しく見る",
            infog: {
                tokyo: "東京",
                iizuna: "飯綱町",
                rows: [
                    {
                        label: "人口密度",
                        t: { pre: "約", num: "6,488", unit: "人/㎢", diff: "世界有数の人口密度", sub: "面積：2,199km²｜人口：14,270,000人" },
                        i: { pre: "約", num: "143", unit: "人/km²", diff: "ゆとりある空間", sub: "面積：75km²｜人口：10,755人", blueVal: true, blueDiff: true }
                    },
                    {
                        label: "標高",
                        t: { pre: "", num: "634", unit: "m", diff: "東京スカイツリーの高さ", sub: "-" },
                        i: { pre: "約", num: "500〜900", unit: "m", diff: "標高が高く空気が澄む", sub: "-" }
                    },
                    {
                        label: "年平均気温",
                        t: { pre: "約", num: "17.0", unit: "℃", diff: "温暖な気候", sub: "気象庁発表 (2021〜2024平均)" },
                        i: { pre: "約", num: "12.7", unit: "℃", diff: "りんご栽培に最適", sub: "飯綱町役場屋上にて測定<br>(2021/4~2025/3平均)", blueVal: true, blueDiff: true }
                    }
                ]
            },
            features: [
                {
                    key: "shiru", title: "知る",
                    catch: "飯綱町とりんごの歴史・品種・文化",
                    desc: "町の地理・歴史から、栽培に適した気候条件、多様な品種の紹介、高坂りんごや英国品種などの希少種、アップルミュージアムやPRキャラクター「みつどん」まで。飯綱町とりんごの全体像を体系的にまとめています。",
                    url: "https://appletown-iizuna.com/discover"
                },
                {
                    key: "ajiwau", title: "味わう",
                    catch: "買えるお店・加工品・イベント情報",
                    desc: "町内直売所（むーちゃん・さんちゃん・四季彩）やオンラインショップ「みつどんマルシェ」の情報、ジュース・ジャム・シードルなどの加工品紹介、英国りんごフェアやスイーツコンクールなどのイベント情報を掲載しています。",
                    url: "https://appletown-iizuna.com/savor"
                },
                {
                    key: "taiken", title: "体験する",
                    catch: "農業体験・アクセス・滞在ガイド",
                    desc: "りんごの木オーナー制度、りんご学校、ワーキングホリデーなどの農業体験プログラムと、車・電車・Eバイク・iバスなどのアクセス手段、宿泊・飲食・温泉・フォトスポットの情報をまとめています。",
                    url: "https://appletown-iizuna.com/experience"
                },
                {
                    key: "kurasu", title: "暮らす",
                    catch: "移住・就労・就農の支援制度",
                    desc: "移住体験住宅や住宅購入補助などの移住支援、いいコネワークスや地域おこし協力隊などの就労情報、里親制度による新規就農支援と相談窓口をご案内しています。",
                    url: "https://appletown-iizuna.com/lifestyle"
                },
                {
                    key: "itonamu", title: "営む",
                    catch: "栽培支援・補助金・出荷加工施設",
                    desc: "りんご栽培の通年講習会、苗木導入・機械整備・共同利用機械などの各種補助金制度、直売所の販売登録や加工所などの出荷・加工施設情報を掲載しています。",
                    url: "https://appletown-iizuna.com/business"
                }
            ]
        },
        en: {
            welcomeTitle: "Welcome to Apple Town.",
            welcomeBody: "Five peaks stand shoulder to shoulder,\na highland breeze grazes your cheek.\nCrisp air, warm earth — and orchards\nthat glow in every shade of red and gold.\nHere, the rhythm of the harvest\nand your own heartbeat align.\nA place that simply feels right.",
            buttonLabel: "Learn More",
            infog: {
                tokyo: "Tokyo",
                iizuna: "Iizuna",
                rows: [
                    {
                        label: "Density",
                        t: { pre: "Approx.", num: "6,488", unit: "/㎢", diff: "World-class density", sub: "Area: 2,199km² | Pop: 14.27M" },
                        i: { pre: "Approx.", num: "143", unit: "/km²", diff: "Spacious & relaxing", sub: "Area: 75km² | Pop: 10,755", blueVal: true, blueDiff: true }
                    },
                    {
                        label: "Elevation",
                        t: { pre: "", num: "634", unit: "m", diff: "Tokyo Skytree height", sub: "-" },
                        i: { pre: "Approx.", num: "500-900", unit: "m", diff: "High elevation, crisp air", sub: "-" }
                    },
                    {
                        label: "Avg Temp.",
                        t: { pre: "Approx.", num: "17.0", unit: "℃", diff: "Mild climate", sub: "JMA Data (2021-2024)" },
                        i: { pre: "Approx.", num: "12.7", unit: "℃", diff: "Optimal for apples", sub: "Town Hall Data<br>(2021/4-2025/3)", blueVal: true, blueDiff: true }
                    }
                ]
            },
            features: [
                {
                    key: "shiru", title: "Discover",
                    catch: "History, varieties & culture of Iizuna apples",
                    desc: "Town geography and history, ideal climate conditions, a catalog of diverse varieties including rare heritage and British cultivars, the Apple Museum, and Mitsudon the mascot. A comprehensive guide to understanding Iizuna and its apples.",
                    url: "https://appletown-iizuna.com/discover"
                },
                {
                    key: "ajiwau", title: "Savor",
                    catch: "Shops, products & seasonal events",
                    desc: "Local farm stands (Muchan, Sanchan, Shikisai), the online shop Mitsudon Marche, processed goods like juice, jam and cider, plus events such as the British Apple Fair and the Sweets Contest.",
                    url: "https://appletown-iizuna.com/savor"
                },
                {
                    key: "taiken", title: "Experience",
                    catch: "Farm programs, access & travel guide",
                    desc: "Tree-owner programs, Apple School, working holidays, and other farm experiences. Plus detailed access info by car, train, e-bike, and local buses, along with lodging, dining, hot springs, and photo spots.",
                    url: "https://appletown-iizuna.com/experience"
                },
                {
                    key: "kurasu", title: "Lifestyle",
                    catch: "Relocation, employment & farming support",
                    desc: "Trial housing and housing subsidies, employment through Iikone Works cooperative and regional revitalization crews, plus new-farmer mentorship programs and consultation services.",
                    url: "https://appletown-iizuna.com/lifestyle"
                },
                {
                    key: "itonamu", title: "Business",
                    catch: "Training, subsidies & processing facilities",
                    desc: "Year-round cultivation workshops, subsidies for seedlings, machinery, and shared equipment, plus information on direct-sales registration and processing facilities.",
                    url: "https://appletown-iizuna.com/business"
                }
            ]
        },
        zh: {
            welcomeTitle: "歡迎來到苹果小镇。",
            welcomeBody: "北信濃五嶽比肩而立，\n高原的微風輕拂臉龐。\n清冽空氣與溫潤土壤緊緊相擁，\n漫山遍野的蘋果閃耀紅金光芒。\n收穫的律動與心跳的節拍，\n在這裡悄然合一。\n恰到好處的美好所在。",
            buttonLabel: "查看詳情",
            infog: {
                tokyo: "東京",
                iizuna: "飯綱町",
                rows: [
                    {
                        label: "人口密度",
                        t: { pre: "約", num: "6,488", unit: "/㎢", diff: "世界前列", sub: "面積：2,199km²｜人口：14,270,000" },
                        i: { pre: "約", num: "143", unit: "/km²", diff: "寬鬆的生活空間", sub: "面積：75km²｜人口：10,755", blueVal: true, blueDiff: true }
                    },
                    {
                        label: "海拔",
                        t: { pre: "", num: "634", unit: "m", diff: "晴空塔高度", sub: "-" },
                        i: { pre: "約", num: "500〜900", unit: "m", diff: "海拔高、空氣清新", sub: "-" }
                    },
                    {
                        label: "平均氣溫",
                        t: { pre: "約", num: "17.0", unit: "℃", diff: "氣候溫暖", sub: "氣象廳數據 (2021〜2024)" },
                        i: { pre: "約", num: "12.7", unit: "℃", diff: "最適蘋果栽培", sub: "町役場測量<br>(2021/4~2025/3)", blueVal: true, blueDiff: true }
                    }
                ]
            },
            features: [
                {
                    key: "shiru", title: "探索",
                    catch: "飯綱町與蘋果的歷史・品種・文化",
                    desc: "從地理與歷史、適宜栽培的氣候條件，到豐富多樣的品種介紹、高坂蘋果和英國品種等珍稀種類，再到蘋果博物館與吉祥物「蜜蘋」。系統性整理飯綱町與蘋果的全貌。",
                    url: "https://appletown-iizuna.com/discover"
                },
                {
                    key: "ajiwau", title: "品味",
                    catch: "購買地點・加工品・活動資訊",
                    desc: "町內直售所（Muchan、Sanchan、四季彩）及線上商店「蜜蘋市集」的資訊，果汁、果醬、蘋果酒等加工品介紹，以及英國蘋果展和甜點大賽等活動情報。",
                    url: "https://appletown-iizuna.com/savor"
                },
                {
                    key: "taiken", title: "體驗",
                    catch: "農業體驗・交通方式・住宿指南",
                    desc: "蘋果樹認養制度、蘋果學校、打工度假等農業體驗，以及自駕、電車、電動單車、在地巴士等交通方式，住宿、餐飲、溫泉及攝影景點資訊。",
                    url: "https://appletown-iizuna.com/experience"
                },
                {
                    key: "kurasu", title: "生活",
                    catch: "移居・就業・務農支援制度",
                    desc: "體驗住宅與購屋補助等移居支援、協同組合就業機會與地方振興協力隊，以及師徒制新農支援與諮詢窗口。",
                    url: "https://appletown-iizuna.com/lifestyle"
                },
                {
                    key: "itonamu", title: "經營",
                    catch: "栽培支援・補助金・出貨加工設施",
                    desc: "蘋果栽培的全年講習會、苗木引進・機械設備・共用設備等各項補助金制度，以及直售登記和加工設施等資訊。",
                    url: "https://appletown-iizuna.com/business"
                }
            ]
        }
    };

    /* ==========================================
       3. CSS
       ========================================== */
    var injectStyles = function () {
        if (document.getElementById('lz-intro-styles')) return;
        var style = document.createElement('style');
        style.id = 'lz-intro-styles';
        style.textContent = [
            '.lz-intro { max-width: 1100px; margin: 0 auto; padding: 80px 24px 60px; font-family: var(--font-base); }',

            /* ── ウェルカムセクション ── */
            '.lz-intro__welcome { text-align: center; margin-bottom: 80px; }',
            '.lz-intro__welcome-title {',
            '  font-family: var(--font-accent);',
            '  font-weight: 700; font-size: clamp(2.2rem, 5vw, 3.6rem);',
            '  color: var(--apple-brown, #5b3a1e);',
            '  margin: 0 0 36px; letter-spacing: .06em; line-height: 1.3;',
            '}',
            '.lz-intro__welcome-body {',
            '  font-size: clamp(1.05rem, 1.8vw, 1.3rem);',
            '  color: #555; line-height: 2.2; margin: 0;',
            '  white-space: pre-line; letter-spacing: .04em;',
            '}',

            /* ── 区切り線 ── */
            '.lz-intro__divider {',
            '  width: 60px; height: 4px; border-radius: 2px;',
            '  background: linear-gradient(90deg, var(--apple-red, #cf3a3a), var(--apple-green, #2aa85c));',
            '  margin: 0 auto 70px; border: none;',
            '}',

            /* ── TOKYO vs IIZUNA インフォグラフィック ── */
            '.lz-intro__infog {',
            '  position: relative; margin-bottom: 80px; border-radius: 20px;',
            '  overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);',
            '  background: #f9f6f2;',
            '  max-width: 580px; margin-left: auto; margin-right: auto;',
            '}',
            '.lz-intro__infog-bg {',
            '  width: 100%; display: block;',
            '  opacity: 0.45;',
            '}',
            '.lz-intro__infog-overlay {',
            '  position: absolute; inset: 0;',
            '  display: flex; flex-direction: column;',
            '  padding: 6% 4%; justify-content: space-between;',
            '}',
            '.infog-head {',
            '  display: flex; justify-content: space-between; align-items: center;',
            '  text-align: center; margin-bottom: 3%; padding: 0 5%;',
            '}',
            '.infog-head-city {',
            '  flex: 1;',
            '  font-family: var(--font-accent); font-weight: 900;',
            '  font-size: clamp(1.4rem, 4vw, 2.2rem); letter-spacing: 0.1em;',
            '  text-shadow: 0 2px 8px rgba(255,255,255,0.9);',
            '}',
            '.infog-head-city--tokyo { color: #555; text-align: center; }',
            '.infog-head-city--iizuna { color: var(--apple-red, #cf3a3a); text-align: center; }',
            '.infog-head-spacer { width: clamp(80px, 14vw, 100px); }',
            '.infog-rows {',
            '  display: flex; flex-direction: column; gap: 8%; flex: 1; justify-content: space-around;',
            '}',
            '.infog-row {',
            '  display: grid; grid-template-columns: 1fr clamp(80px, 14vw, 100px) 1fr; align-items: center;',
            '}',
            '.infog-col { display: flex; flex-direction: column; align-items: center; text-align: center; }',
            '.infog-col--center { align-items: center; justify-content: center; }',
            '.infog-label {',
            '  background: rgba(255,255,255,0.85); box-shadow: 0 2px 8px rgba(0,0,0,0.05);',
            '  padding: 6px 14px; border-radius: 20px; font-weight: 700;',
            '  font-size: clamp(0.7rem, 2vw, 0.9rem); color: #555; letter-spacing: 0.05em;',
            '  white-space: nowrap;',
            '}',
            '.infog-val {',
            '  font-family: var(--font-accent); font-weight: 800; line-height: 1.1;',
            '  font-size: clamp(0.8rem, 2vw, 1rem); text-shadow: 0 2px 6px rgba(255,255,255,0.9);',
            '}',
            '.infog-col--tokyo .infog-val { color: #444; }',
            '.infog-col--iizuna .infog-val { color: var(--apple-red, #cf3a3a); }',
            '.infog-val-pre {',
            '  font-size: clamp(0.6rem, 1.5vw, 0.75rem); margin-right: 2px; font-weight: 700;',
            '}',
            '.infog-val-num {',
            '  font-size: clamp(1.4rem, 4vw, 2.5rem); font-weight: 900; margin: 0 2px;',
            '}',
            '.infog-diff {',
            '  display: inline-block; padding: 3px 8px; border-radius: 12px;',
            '  font-size: clamp(0.6rem, 1.5vw, 0.75rem); font-weight: 700; margin-top: 6px;',
            '  color: #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.1); letter-spacing: 0.02em;',
            '  background: rgba(207, 58, 58, 0.85);',
            '}',
            '.infog-diff--tokyo { background: rgba(102, 102, 102, 0.85); }',
            '.infog-diff--blue { background: rgba(58, 140, 207, 0.85); }',
            '.infog-val--blue { color: #3a8ccf !important; }',
            '.infog-sub {',
            '  font-size: clamp(0.55rem, 1.2vw, 0.7rem); color: rgba(136,136,136,0.6); margin-top: 4px;',
            '  line-height: 1.3; font-weight: 500; letter-spacing: 0.02em;',
            '}',

            /* ── カテゴリブロック (左右交互) ── */
            '.lz-intro__categories { display: flex; flex-direction: column; gap: 80px; }',

            '.lz-intro__cat {',
            '  display: grid; grid-template-columns: 1fr 1fr;',
            '  gap: 50px; align-items: center;',
            '}',
            /* 奇数(1,3,5)=画像左・テキスト右、偶数(2,4)=テキスト左・画像右 */
            '.lz-intro__cat:nth-child(even) { direction: rtl; }',
            '.lz-intro__cat:nth-child(even) > * { direction: ltr; }',

            /* 丸画像 */
            '.lz-intro__cat-img-wrap {',
            '  display: flex; justify-content: center; align-items: center;',
            '}',
            '.lz-intro__cat-img {',
            '  width: clamp(220px, 28vw, 360px); height: clamp(220px, 28vw, 360px);',
            '  border-radius: 50%; object-fit: cover;',
            '  box-shadow: 0 20px 60px rgba(0,0,0,0.10);',
            '  filter: contrast(1.06) saturate(1.1) brightness(0.97) sepia(0.03);',
            '  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease;',
            '}',
            '.lz-intro__cat:hover .lz-intro__cat-img { transform: scale(1.04); filter: contrast(1.1) saturate(1.2) brightness(1.0); }',

            /* テキスト部分 */
            '.lz-intro__cat-body { display: flex; flex-direction: column; gap: 14px; }',
            '.lz-intro__cat-title {',
            '  font-family: var(--font-accent);',
            '  font-weight: 700; font-size: clamp(1.8rem, 3vw, 2.4rem);',
            '  color: var(--apple-brown, #5b3a1e);',
            '  margin: 0; letter-spacing: .05em;',
            '}',
            '.lz-intro__cat-catch {',
            '  font-family: var(--font-accent);',
            '  font-weight: 500; font-size: clamp(1.15rem, 2vw, 1.45rem);',
            '  color: var(--apple-red, #cf3a3a);',
            '  margin: 0; line-height: 1.6;',
            '}',
            '.lz-intro__cat-desc {',
            '  font-size: clamp(0.95rem, 1.4vw, 1.1rem);',
            '  color: #666; line-height: 1.9; margin: 0;',
            '}',
            '.lz-intro__cat-btn {',
            '  display: inline-flex; align-items: center; gap: 8px;',
            '  width: fit-content;',
            '  padding: 12px 28px; border-radius: 999px;',
            '  border: 2px solid var(--apple-red, #cf3a3a);',
            '  background: #fff; color: var(--apple-red, #cf3a3a);',
            '  font-family: var(--font-accent);',
            '  font-weight: 700; font-size: 1.05rem;',
            '  text-decoration: none; cursor: pointer;',
            '  transition: all 0.3s ease;',
            '  margin-top: 4px;',
            '}',
            '.lz-intro__cat-btn:hover {',
            '  background: var(--apple-red, #cf3a3a); color: #fff;',
            '  transform: translateY(-2px);',
            '  box-shadow: 0 8px 24px rgba(207, 58, 58, 0.2);',
            '}',
            '.lz-intro__cat-btn::after { content: "→"; transition: transform 0.3s; }',
            '.lz-intro__cat-btn:hover::after { transform: translateX(4px); }',

            /* ── レスポンシブ ── */
            '@media (max-width: 768px) {',
            '  .lz-intro { padding: 50px 18px 40px; }',
            '  .lz-intro__welcome { margin-bottom: 50px; }',
            '  .lz-intro__divider { margin-bottom: 50px; }',
            '  .lz-intro__categories { gap: 60px; }',
            '  .lz-intro__cat { grid-template-columns: 1fr; gap: 24px; text-align: center; }',
            '  .lz-intro__cat:nth-child(even) { direction: ltr; }',
            '  .lz-intro__cat-img { width: clamp(180px, 55vw, 280px); height: clamp(180px, 55vw, 280px); }',
            '  .lz-intro__cat-btn { margin: 4px auto 0; }',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    };

    /* ==========================================
       4. 描画
       ========================================== */
    var initCount = 0;
    var init = function () {
        var root = document.getElementById('lz-intro-block');
        if (!root) {
            if (++initCount < 30) setTimeout(init, 100);
            return;
        }
        if (root.getAttribute('data-loaded')) return;
        root.setAttribute('data-loaded', 'true');

        injectStyles();

        var lang = window.LZ_CURRENT_LANG || "ja";
        var data = CONTENT[lang] || CONTENT.ja;

        var catsHtml = data.features.map(function (f) {
            var imgSrc = IMAGES[f.key] || "";
            return [
                '<div class="lz-intro__cat">',
                '  <div class="lz-intro__cat-img-wrap">',
                '    <img class="lz-intro__cat-img" src="' + C.esc(imgSrc) + '" alt="' + C.esc(f.title) + '" loading="lazy">',
                '  </div>',
                '  <div class="lz-intro__cat-body">',
                '    <h3 class="lz-intro__cat-title">' + C.esc(f.title) + '</h3>',
                '    <p class="lz-intro__cat-catch">' + C.esc(f.catch) + '</p>',
                '    <p class="lz-intro__cat-desc">' + C.esc(f.desc) + '</p>',
                '    <a class="lz-intro__cat-btn" href="' + C.esc(f.url) + '?lang=' + lang + '">' + C.esc(data.buttonLabel) + '</a>',
                '  </div>',
                '</div>'
            ].join('');
        }).join('');

        var ig = data.infog || CONTENT.ja.infog;
        var statsHtml = [
            '<div class="lz-intro__infog">',
            '<img class="lz-intro__infog-bg" src="https://takizawa-debug.github.io/iizuna-apple-project/web/assets/infographic/bg.png" alt="" loading="lazy">',
            '<div class="lz-intro__infog-overlay">',

            /* Header */
            '<div class="infog-head">',
            '<div class="infog-head-city infog-head-city--tokyo">' + C.esc(ig.tokyo) + '</div>',
            '<div class="infog-head-spacer"></div>',
            '<div class="infog-head-city infog-head-city--iizuna">' + C.esc(ig.iizuna) + '</div>',
            '</div>',

            /* Rows */
            '<div class="infog-rows">',
            ig.rows.map(function (r) {
                var thidden = r.t.sub === '-' ? ' style="visibility:hidden;"' : '';
                var ihidden = r.i.sub === '-' ? ' style="visibility:hidden;"' : '';
                var tpre = r.t.pre ? '<span class="infog-val-pre">' + C.esc(r.t.pre) + '</span>' : '';
                var ipre = r.i.pre ? '<span class="infog-val-pre">' + C.esc(r.i.pre) + '</span>' : '';

                var ivalClass = r.i.blueVal ? "infog-val infog-val--blue" : "infog-val";
                var idiffClass = r.i.blueDiff ? "infog-diff infog-diff--blue" : "infog-diff infog-diff--iizuna";

                return [
                    '<div class="infog-row">',
                    '<div class="infog-col infog-col--tokyo">',
                    '<div class="infog-val">' + tpre + '<span class="infog-val-num">' + C.esc(r.t.num) + '</span>' + C.esc(r.t.unit) + '</div>',
                    '<div class="infog-diff infog-diff--tokyo">' + C.esc(r.t.diff) + '</div>',
                    '<div class="infog-sub"' + thidden + '>' + r.t.sub + '</div>',
                    '</div>',
                    '<div class="infog-col infog-col--center">',
                    '<div class="infog-label">' + C.esc(r.label) + '</div>',
                    '</div>',
                    '<div class="infog-col infog-col--iizuna">',
                    '<div class="' + ivalClass + '">' + ipre + '<span class="infog-val-num">' + C.esc(r.i.num) + '</span>' + C.esc(r.i.unit) + '</div>',
                    '<div class="' + idiffClass + '">' + C.esc(r.i.diff) + '</div>',
                    '<div class="infog-sub"' + ihidden + '>' + r.i.sub + '</div>',
                    '</div>',
                    '</div>'
                ].join('');
            }).join(''),
            '</div>',
            '</div>',
            '</div>'
        ].join('');

        root.innerHTML = [
            '<div class="lz-intro">',
            '<div class="lz-intro__welcome">',
            '<h2 class="lz-intro__welcome-title">' + C.esc(data.welcomeTitle) + '</h2>',
            '<p class="lz-intro__welcome-body">' + C.esc(data.welcomeBody) + '</p>',
            '</div>',
            statsHtml,
            '<hr class="lz-intro__divider">',
            '<div class="lz-intro__categories">' + catsHtml + '</div>',
            '</div>'
        ].join('');
    };

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
