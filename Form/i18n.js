/**
 * i18n.js - 言語リソース（辞書）
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
    basic: "基本情報",
    category: "カテゴリーの選択",
    images: "画像・配布資料",
    location: "場所の情報",
    shop_detail: "営業に関する情報",
    event_detail: "開催日時",
    event_more: "開催詳細",
    producer_detail: "栽培品種・加工品",
    producer_biz: "栽培・経営について",
    links: "各種リンク",
    inquiry_head: "問い合わせ先",
    notes: "備考",
    private_boundary: "ここからは非公開情報です",
    private_admin: "事務局への連絡（非公開）"
  },
  types: {
    shop: {
      label: "お店の登録",
      titleLabel: "店名・施設名",
      leadLabel: "お店の概要",
      titlePlace: "正式な店舗名をご記入ください",
      leadPlace: "お店の特徴や魅力を100文字以内で",
      bodyPlace: "メニュー、こだわり、サービス内容などを詳しく教えてください",
      memoPlace: "例：予約優先、ベビーカー入店可、カード決済不可など",
      notesLabel: "店舗/施設に関する注意事項",
      catLabel: "この場所でできること（複数選択可）"
    },
    event: {
      label: "イベントの登録",
      titleLabel: "イベント名",
      leadLabel: "イベントの概要",
      titlePlace: "イベント名称をご記入ください",
      leadPlace: "どんなイベントか一言で！",
      bodyPlace: "当日の内容、タイムスケジュール、参加方法などの詳細を教えてください",
      memoPlace: "例：雨天決行、途中入退場自由、防寒着持参推奨など",
      notesLabel: "会場に関する注意事項",
      catLabel: "イベントジャンル（複数選択可）"
    },
    producer: {
      label: "生産者の登録",
      titleLabel: "農園・団体名",
      leadLabel: "生産者の概要",
      titlePlace: "正式な屋号や農園名をご記入ください",
      leadPlace: "栽培へのこだわりや農園の特徴を一言で",
      bodyPlace: "農園の歴史、栽培している品種の想い、購入方法などを教えてください",
      memoPlace: "例：収穫体験は要事前予約、地方発送対応可など",
      notesLabel: "農場訪問時の注意事項（防疫等）",
      catLabel: "生産・販売スタイル（複数選択可）"
    },
    other: {
      label: "記事の登録",
      titleLabel: "記事タイトル",
      leadLabel: "記事の概要",
      titlePlace: "読みたくなるタイトルをご記入ください",
      leadPlace: "この記事で伝えたいことを100文字以内で",
      bodyPlace: "町の発見、インタビュー、体験談など自由に詳しく書いてください",
      memoPlace: "その他、補足情報があれば自由にご記入ください",
      notesLabel: "場所に関する注意事項",
      catLabel: "記事のジャンル（複数選択可）"
    }
  },
  common: {
    zipBtn: "住所検索",
    sendBtn: "この内容で登録申請する",
    sending: "送信中...",
    syncLabel: "掲載用メールアドレスと同じにする",
    assistLabel: "【文章作成が苦手な方へ】紹介文（概要・本文）の作成を事務局に任せる",
    assistNote: "⚠️ 注意事項：文章作成を委任する場合、内容がわかるHP・SNSのURL入力、またはチラシ画像・資料の添付を必ずお願いします。"
  }
};