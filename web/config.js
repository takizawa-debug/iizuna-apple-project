/* --- config.js --- */
window.LZ_CONFIG = {
  // メインコンテンツ用GAS
  ENDPOINT: "https://script.google.com/macros/s/AKfycbzcKvhSQDYFRWPg53d-SmnSLKztiYK7JwH64VAlvF6l_7q5394Lb04BHBRi5dKk6HWBsA/exec",

  // アナリティクス用設定
  ANALYTICS: {
    ENDPOINT: "https://script.google.com/macros/s/AKfycbyMsHN1c9KSk3DUfU94Z7Axr18-8TYAEOWuJSGh3_upEFNAAc4Z9PmrA3uXbbRoGACXSg/exec",
    VISITOR_COOKIE: "apz_vid_v1",
    VISITOR_LSKEY: "apz_vid_ls_v1",
    SESSION_TTL: 30 * 60 * 1000 // 30分
  },

  // メニュー設定
  MENU_ORDER: ["知る","味わう","体験する","働く・住む","販売・発信する"],
  MENU_URL: {
    "知る":"https://appletown-iizuna.com/learn",
    "味わう":"https://appletown-iizuna.com/taste",
    "体験する":"https://appletown-iizuna.com/experience",
    "働く・住む":"https://appletown-iizuna.com/live-work",
    "販売・発信する":"https://appletown-iizuna.com/sell-promote"
  }
};