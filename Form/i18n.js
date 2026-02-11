/**
 * i18n.js - 旧版の全文言を完全網羅した辞書
 */
export const i18n = {
  tabs: {
    report: "情報提供",
    inquiry: "お問い合わせ",
    article: "記事投稿"
  },
  badges: {
    required: "必須",
    optional: "任意",
    private: "非公開"
  },
  sections: {
    category: "登録内容の選択",
    basic: "基本情報",
    images: "画像・配布資料",
    location: "場所の情報",
    shop_detail: "営業に関する情報",
    event_detail: "開催日時",
    event_more: "開催詳細",
    producer_head: "栽培品種・加工品",
    producer_biz: "栽培・経営について",
    links: "各種リンク",
    inquiry_head: "問い合わせ先",
    notes_head: "備考",
    private_boundary: "ここからは非公開情報です",
    private_admin: "事務局への連絡（非公開）"
  },
  placeholders: {
    rep_name: "ニックネーム可",
    rep_content: "町の発見を教えてください",
    art_lead: "お店やイベントを一言で表すと？",
    art_body: "詳しい内容を教えてください",
    ev_venue: "例：飯綱ふれあいパーク",
    zip: "389-1211",
    shop_notes: "注意事項があればご記入ください",
    shop_biz_notes: "（例）毎月最終月曜日は定休日です。ランチは売切次第終了。最新情報は公式Instagramをご確認ください。",
    ev_fee: "無料、500円 など",
    ev_items: "筆記用具、室内履き など",
    ev_target: "町内在住の方、小学生以上 など",
    pr_variety: "その他の品種を具体的に記入",
    pr_product: "その他の加工品を具体的に記入",
    pr_area: "数値",
    pr_staff: "人数（専従・パート含む）",
    pr_fruit: "具体的な果物名をご記入ください",
    pr_veg: "具体的な野菜名をご記入ください",
    pr_other: "具体的な内容をご記入ください",
    pr_rep: "氏名をご記入ください",
    pr_invoice: "T1234567890123",
    url: "https://...",
    sns_ig: "Instagram アカウント名",
    sns_fb: "Facebook ページURL",
    sns_x: "X (Twitter) アカウント名",
    sns_line: "LINE 公式アカウントURL",
    sns_tt: "TikTokアカウントURL",
    rel_title: "リンクのタイトル",
    ev_org: "個人名、または団体名",
    cm_mail: "info@example.com",
    cm_tel: "026-...",
    cm_other: "窓口へ直接、など",
    cm_notes: "（例）対応時間は平日10:00〜17:00です。土日は電話が繋がりません。",
    art_memo: "その他、補足情報があれば自由にご記入ください",
    admin_email: "example@mail.com"
  },
  types: {
    shop: { label: "お店の登録", title: "店名・施設名", lead: "お店の概要", notes: "店舗/施設に関する注意事項" },
    event: { label: "イベントの登録", title: "イベント名", lead: "イベントの概要", notes: "会場に関する注意事項" },
    producer: { label: "生産者の登録", title: "農園・団体名", lead: "生産者の概要", notes: "農場訪問時の注意事項（防疫等）" },
    other: { label: "記事の登録", title: "記事タイトル", lead: "記事の概要", notes: "場所に関する注意事項" }
  },
  common: {
    zipBtn: "住所検索",
    assistLabel: "【文章作成が苦手な方へ】紹介文（概要・本文）の作成を事務局に任せる",
    assistNote: "⚠️ 注意事項：文章作成を委任する場合、内容がわかるHP・SNSのURL入力、またはチラシ画像・資料の添付を必ずお願いします。",
    syncLabel: "掲載用メールアドレスと同じにする",
    sendBtn: "この内容で送信する"
  }
};