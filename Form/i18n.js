/**
 * i18n.js - 多言語対応（日・英・中）完全網羅辞書
 */

const resources = {
  ja: {
    tabs: { report: "情報提供", inquiry: "お問い合わせ", article: "記事投稿" },
    badges: { required: "必須", optional: "任意", private: "非公開" },
    sections: {
      category: "登録内容の選択", basic: "基本情報", images: "画像・配布資料",
      location: "場所の情報", shop_detail: "営業に関する情報", event_detail: "開催日時",
      event_more: "開催詳細", producer_head: "栽培品種・加工品", producer_biz: "栽培・経営について",
      links: "各種リンク", inquiry_head: "問い合わせ先", notes_head: "備考",
      private_boundary: "ここからは非公開情報です", private_admin: "事務局への連絡（非公開）"
    },
    placeholders: {
      rep_name: "ニックネーム可", rep_content: "町の発見を教えてください",
      art_lead: "お店やイベントを一言で表すと？", art_body: "詳しい内容を教えてください",
      ev_venue: "例：飯綱ふれあいパーク", zip: "389-1211", shop_notes: "注意事項があればご記入ください",
      shop_biz_notes: "（例）毎月最終月曜日は定休日です。ランチは売切次第終了。最新情報は公式Instagramをご確認ください。",
      ev_fee: "無料、500円 など", ev_items: "筆記用具、室内履き など", ev_target: "町内在住の方、小学生以上 など",
      pr_variety: "その他の品種を具体的に記入", pr_product: "その他の加工品を具体的に記入",
      pr_area: "数値", pr_staff: "人数（専従・パート含む）", pr_fruit: "具体的な果物名をご記入ください",
      pr_veg: "具体的な野菜名をご記入ください", pr_other: "具体的な内容をご記入ください",
      pr_rep: "氏名をご記入ください", pr_invoice: "T1234567890123", url: "https://...",
      sns_ig: "Instagram アカウント名", sns_fb: "Facebook ページURL", sns_x: "X (Twitter) アカウント名",
      sns_line: "LINE 公式アカウントURL", sns_tt: "TikTokアカウントURL", rel_title: "リンクのタイトル",
      ev_org: "個人名、または団体名", cm_mail: "info@example.com", cm_tel: "026-...",
      cm_other: "窓口へ直接、など", cm_notes: "（例）対応時間は平日10:00〜17:00です。土日は電話が繋がりません。",
      art_memo: "その他、補足情報があれば自由にご記入ください", admin_email: "example@mail.com"
    },
    types: {
      shop: { label: "お店の登録", title: "店名・施設名", lead: "お店の概要", notes: "店舗/施設に関する注意事項", catLabel: "この場所でできること（複数選択可）" },
      event: { label: "イベントの登録", title: "イベント名", lead: "イベントの概要", notes: "会場に関する注意事項", catLabel: "イベントジャンル（複数選択可）" },
      producer: { label: "生産者の登録", title: "農園・団体名", lead: "生産者の概要", notes: "農場訪問時の注意事項（防疫等）", catLabel: "生産・販売スタイル（複数選択可）" },
      other: { label: "記事の登録", title: "記事タイトル", lead: "記事の概要", notes: "場所に関する注意事項", catLabel: "記事のジャンル（複数選択可）" }
    },
    common: {
      zipBtn: "住所検索", syncLabel: "掲載用メールアドレスと同じにする", sendBtn: "この内容で送信する", sending: "送信中...",
      assistLabel: "【文章作成が苦手な方へ】紹介文（概要・本文）の作成を事務局に任せる",
      assistNote: "⚠️ 注意事項：文章作成を委任する場合、内容がわかるHP・SNSのURL入力、またはチラシ画像・資料の添付を必ずお願いします。"
    }
  },
  en: {
    tabs: { report: "Report", inquiry: "Inquiry", article: "Post Article" },
    badges: { required: "Required", optional: "Optional", private: "Private" },
    sections: {
      category: "Select Content Type", basic: "Basic Info", images: "Images & Documents",
      location: "Location", shop_detail: "Business Info", event_detail: "Event Schedule",
      event_more: "Event Details", producer_head: "Varieties & Products", producer_biz: "Cultivation & Management",
      links: "Links", inquiry_head: "Contact Info", notes_head: "Notes",
      private_boundary: "Below is Private Information", private_admin: "Contact Office (Private)"
    },
    placeholders: {
      rep_name: "Nickname OK", rep_content: "Tell us about your discovery",
      art_lead: "Summarize in one sentence", art_body: "Provide more details",
      ev_venue: "e.g., Iizuna Fureai Park", zip: "389-1211", shop_notes: "Any notes regarding the location",
      shop_biz_notes: "e.g., Closed on the last Monday. Lunch ends when sold out.",
      ev_fee: "Free, 500 yen, etc.", ev_items: "Stationery, indoor shoes, etc.", ev_target: "Town residents, primary students, etc.",
      pr_variety: "Specify other varieties", pr_product: "Specify other products",
      pr_area: "Value", pr_staff: "Number of staff", pr_fruit: "Specify fruit types",
      pr_veg: "Specify vegetable types", pr_other: "Provide specific details",
      pr_rep: "Representative name", pr_invoice: "T1234567890123", url: "https://...",
      sns_ig: "Instagram Account", sns_fb: "Facebook URL", sns_x: "X (Twitter) Account",
      sns_line: "LINE Official URL", sns_tt: "TikTok URL", rel_title: "Link Title",
      ev_org: "Individual or Organization", cm_mail: "info@example.com", cm_tel: "026-...",
      cm_other: "Counter service, etc.", cm_notes: "e.g., Available weekdays 10:00-17:00.",
      art_memo: "Any other supplementary info", admin_email: "example@mail.com"
    },
    types: {
      shop: { label: "Register Shop", title: "Shop Name", lead: "Shop Summary", notes: "Notes for Shop/Facility", catLabel: "What you can do here (Multiple)" },
      event: { label: "Register Event", title: "Event Name", lead: "Event Summary", notes: "Notes for Venue", catLabel: "Event Genre (Multiple)" },
      producer: { label: "Register Producer", title: "Farm/Group Name", lead: "Producer Summary", notes: "Notes for Farm Visit", catLabel: "Production Style (Multiple)" },
      other: { label: "Register Article", title: "Article Title", lead: "Article Summary", notes: "Notes for Location", catLabel: "Article Genre (Multiple)" }
    },
    common: {
      zipBtn: "Search Address", syncLabel: "Same as public email", sendBtn: "Submit with this content", sending: "Sending...",
      assistLabel: "[For those needing writing help] Let the office create the description",
      assistNote: "⚠️ Note: If delegating, please provide a URL or attach materials showing the content."
    }
  },
  zh: {
    tabs: { report: "提供信息", inquiry: "咨询", article: "投稿文章" },
    badges: { required: "必填", optional: "选填", private: "不公开" },
    sections: {
      category: "选择注册内容", basic: "基本信息", images: "图片及资料",
      location: "地点信息", shop_detail: "营业信息", event_detail: "举办时间",
      event_more: "活动详情", producer_head: "品种与加工品", producer_biz: "栽培与经营",
      links: "各种链接", inquiry_head: "联系方式", notes_head: "备注",
      private_boundary: "以下为不公开信息", private_admin: "联系事务局（不公开）"
    },
    placeholders: {
      rep_name: "可填昵称", rep_content: "请告诉我们您的发现",
      art_lead: "用一句话概括", art_body: "请填写详细内容",
      ev_venue: "例如：饭纲亲睦公园", zip: "389-1211", shop_notes: "地点相关注意事项",
      shop_biz_notes: "例如：每月最后一个周一休息。午餐售完即止。",
      ev_fee: "免费、500日元等", ev_items: "文具、室内鞋等", ev_target: "镇内居民、小学生等",
      pr_variety: "具体填写其他品种", pr_product: "具体填写其他加工品",
      pr_area: "数值", pr_staff: "员工人数", pr_fruit: "具体填写水果名称",
      pr_veg: "具体填写蔬菜名称", pr_other: "具体填写其他内容",
      pr_rep: "代表人姓名", pr_invoice: "T1234567890123", url: "https://...",
      sns_ig: "Instagram 账号", sns_fb: "Facebook 链接", sns_x: "X (Twitter) 账号",
      sns_line: "LINE 官方账号链接", sns_tt: "TikTok 链接", rel_title: "链接标题",
      ev_org: "个人或团体名称", cm_mail: "info@example.com", cm_tel: "026-...",
      cm_other: "直接到窗口等", cm_notes: "例如：接待时间为平日10:00-17:00。",
      art_memo: "其他需要告知读者的补充信息", admin_email: "example@mail.com"
    },
    types: {
      shop: { label: "店铺注册", title: "店名/设施名", lead: "店铺概要", notes: "店铺/设施相关注意事项", catLabel: "在此可进行的操作（多选）" },
      event: { label: "活动注册", title: "活动名称", lead: "活动概要", notes: "会场相关注意事项", catLabel: "活动类型（多選）" },
      producer: { label: "生产者注册", title: "农园/团体名", lead: "生产者概要", notes: "农场访问注意事项", catLabel: "生产/销售风格（多选）" },
      other: { label: "文章注册", title: "文章标题", lead: "文章概要", notes: "地点相关注意事项", catLabel: "文章类型（多选）" }
    },
    common: {
      zipBtn: "搜索地址", syncLabel: "与公开邮箱相同", sendBtn: "以此内容提交申请", sending: "正在发送...",
      assistLabel: "【不擅长写作的人】委托事务局代写介绍文",
      assistNote: "⚠️ 注意事项：如委托代写，请务必提供可了解内容的URL或上传宣传单图片/资料。"
    }
  }
};

// 🍎 言語判定ロジック：URLパラメータ (?lang=en) または ブラウザ言語 または デフォルト(ja)
const getLang = () => {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang');
  if (resources[lang]) return lang;
  const browserLang = navigator.language.split('-')[0];
  return resources[browserLang] ? browserLang : 'ja';
};

export const i18n = resources[getLang()];