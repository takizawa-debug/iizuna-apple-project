/* --- config.js (最適化版) --- */
window.LZ_CONFIG = {
  // ① GASエンドポイント
  ENDPOINT: "https://script.google.com/macros/s/AKfycby1OYtOSLShDRw9Jlzv8HS09OehhUpuSKwjMOhV_dXELtp8wNdz_naZ72IyuBBjDGPwKg/exec",
  SEARCH_ENDPOINT: "https://script.google.com/macros/s/AKfycbzpisDW6hyUhU-bE8-lYbhAusRUtbiU2sw4d39te38CWS6Q4TsxHvslIdNDulMiZ03c/exec",

  // ② アナリティクス
  ANALYTICS: {
    ENDPOINT: "https://script.google.com/macros/s/AKfycbyMsHN1c9KSk3DUfU94Z7Axr18-8TYAEOWuJSGh3_upEFNAAc4Z9PmrA3uXbbRoGACXSg/exec",
    VISITOR_COOKIE: "apz_vid_v1",
    VISITOR_LSKEY: "apz_vid_ls_v1",
    SESSION_TTL: 30 * 60 * 1000
  },

  // ③ 共通アセット（画像など）
  ASSETS: {
    LOGO_WHITE: "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ca7ecd0-96ba-013e-3700-0a58a9feac02/%E3%82%8A%E3%82%93%E3%81%93%E3%82%99%E3%83%AD%E3%82%B3%E3%82%99_%E7%99%BD.png",
    LOGO_RED: "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ca4e300-96ba-013e-36ff-0a58a9feac02/%E3%82%8A%E3%82%93%E3%81%93%E3%82%99%E3%83%AD%E3%82%B3%E3%82%99_%E8%B5%A4.png"
  },

  // ④ ナビゲーション設定
  MENU_ORDER: ["知る","味わう","体験する","働く・住む","販売・発信する"],
  MENU_URL: {
    "知る":"https://appletown-iizuna.com/learn",
    "味わう":"https://appletown-iizuna.com/taste",
    "体験する":"https://appletown-iizuna.com/experience",
    "働く・住む":"https://appletown-iizuna.com/live-work",
    "販売・発信する":"https://appletown-iizuna.com/sell-promote"
  },

  // ⑤ フッター用リンク
  FOOTER_LINKS: [
    { label: "お問い合わせ", url: "https://appletown-iizuna.com/contact" },
    { label: "サイトマップ", url: "#" },
    { label: "サイトポリシー", url: "https://appletown-iizuna.com/site-policy" },
    { label: "個人情報保護方針", url: "https://appletown-iizuna.com/privacy-policy" }
  ],
  COPYRIGHT: "© 2025 Iizuna Town All Rights Reserved."
};