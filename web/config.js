/* --- config.js (多言語対応・最適化版) --- */
window.LZ_CONFIG = {
  // ① GASエンドポイント
  ENDPOINT: "https://script.google.com/macros/s/AKfycby1OYtOSLShDRw9Jlzv8HS09OehhUpuSKwjMOhV_dXELtp8wNdz_naZ72IyuBBjDGPwKg/exec",
  SEARCH_ENDPOINT: "https://script.google.com/macros/s/AKfycby1OYtOSLShDRw9Jlzv8HS09OehhUpuSKwjMOhV_dXELtp8wNdz_naZ72IyuBBjDGPwKg/exec",

  // ② アナリティクス
  ANALYTICS: {
    ENDPOINT: "https://script.google.com/macros/s/AKfycbyMsHN1c9KSk3DUfU94Z7Axr18-8TYAEOWuJSGh3_upEFNAAc4Z9PmrA3uXbbRoGACXSg/exec",
    VISITOR_COOKIE: "apz_vid_v1",
    VISITOR_LSKEY: "apz_vid_ls_v1",
    SESSION_TTL: 30 * 60 * 1000
  },

  // ③ 共通アセット
  ASSETS: {
    LOGO_WHITE: "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ca7ecd0-96ba-013e-3700-0a58a9feac02/%E3%82%8A%E3%82%93%E3%81%93%E3%82%99%E3%83%AD%E3%82%B3%E3%82%99_%E7%99%BD.png",
    LOGO_RED: "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ca4e300-96ba-013e-36ff-0a58a9feac02/%E3%82%8A%E3%82%93%E3%81%93%E3%82%99%E3%83%AD%E3%82%B3%E3%82%99_%E8%B5%A4.png"
  },

  // ④ ナビゲーション設定（内部キーとして日本語を維持）
  MENU_ORDER: ["知る","味わう","体験する","働く・住む","販売・発信する"],
  MENU_URL: {
    "知る":"https://appletown-iizuna.com/learn",
    "味わう":"https://appletown-iizuna.com/taste",
    "体験する":"https://appletown-iizuna.com/experience",
    "働く・住む":"https://appletown-iizuna.com/live-work",
    "販売・発信する":"https://appletown-iizuna.com/sell-promote"
  },

  // ⑤ フッター用設定
  FOOTER_LINKS: [
    { label: "お問い合わせ", url: "https://appletown-iizuna.com/contact" },
    { label: "サイトマップ", url: "#" },
    { label: "サイトポリシー", url: "https://appletown-iizuna.com/site-policy" },
    { label: "個人情報保護方針", url: "https://appletown-iizuna.com/privacy-policy" }
  ],
  COPYRIGHT: "© 2026 Iizuna Town All Rights Reserved.",

  // ⑥ 【追加】多言語設定
  LANG: {
    DEFAULT: "ja",
    SUPPORTED: ["ja", "en", "zh"],
    LABELS: {
      ja: "日本語",
      en: "English",
      zh: "繁體中文"
    },
    // 固定文言の辞書データ
    I18N: {
      ja: {
        "知る": "知る", "味わう": "味わう", "体験する": "体験する", "働く・住む": "働く・住む", "販売・発信する": "販売・発信する",
        "お問い合わせ": "お問い合わせ", "サイトマップ": "サイトマップ", "サイトポリシー": "サイトポリシー", "個人情報保護方針": "個人情報保護方針",
        "一覧へ戻る": "一覧へ戻る", "詳しく見る": "詳しく見る"
      },
      en: {
        "知る": "Discover", "味わう": "Savor", "体験する": "Experience", "働く・住む": "Live", "販売・発信する": "Promote",
        "お問い合わせ": "Contact Us", "サイトマップ": "Sitemap", "サイトポリシー": "Site Policy", "個人情報保護方針": "Privacy Policy",
        "一覧へ戻る": "Back to List", "詳しく見る": "Read More"
      },
      zh: {
        "知る": "探索", "味わう": "品味", "体験する": "體驗", "働く・住む": "定居", "販売・発信する": "推廣",
        "お問い合わせ": "聯絡我們", "サイトマップ": "網站地圖", "サイトポリシー": "網站政策", "個人情報保護方針": "隱私政策",
        "一覧へ戻る": "回到列表", "詳しく見る": "查看詳情"
      }
    }
  }
};