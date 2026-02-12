/**
 * i18n.js - 多言語対応（日・英・中）完全網羅辞書
 * templates.js および logic.js の変数キーと完全に同期しています。
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
    labels: {
      name: "お名前", email: "メールアドレス", content: "内容", limit_100: "（100文字以内）",
      art_body: "詳細本文", art_images: "画像（最大6枚）", art_file: "資料（PDF,Word,Excel,PowerPoint等）",
      ev_venue_name: "会場名", zip: "郵便番号", address: "住所", biz_days: "営業曜日",
      std_biz_hours: "標準営業時間", open_time: "営業開始", close_time: "営業終了",
      day: "曜日", closed: "休業", holiday_biz: "祝日の営業", shop_biz_notes: "営業に関する注意事項",
      ev_sdate: "開催日（開始日）", ev_edate: "終了日", ev_stime: "開始時刻", ev_etime: "終了時刻",
      ev_org_name: "主催者名",ev_fee: "参加費", ev_items: "参加者のもちもの", ev_target: "対象",
      pr_varieties: "栽培している品種", pr_products: "扱っている加工品",
      pr_area: "作付面積（りんご）", pr_staff: "従業員数", pr_other_crops: "りんご以外の栽培品目（複数選択可）",
      pr_biz_type: "経営区分", pr_rep_name: "代表者名", pr_invoice: "インボイス登録",
      pr_invoice_num: "登録番号", cm_method: "問い合わせ方法（複数選択可）",
      cm_url: "フォームURL", cm_mail: "掲載用メールアドレス", cm_tel: "掲載用電話番号",
      cm_other: "その他の受付方法", cm_notes: "問い合わせに関する注意事項",
      art_memo: "補足情報", cont_name: "投稿者・団体名", admin_email: "連絡用メールアドレス",
      admin_msg: "事務局への連絡事項",
      genre_suffix: "のジャンル",
      genre_free: "カテゴリーの詳細（自由記述）",
      other_venue_name: "関連する場所の名称",
      day_suffix: "曜日",

      rep_name: "お名前（情報提供）",
      rep_content: "提供内容",
      inq_name: "お名前（お問い合わせ）",
      inq_email: "返信用メールアドレス",
      inq_content: "お問い合わせ内容",
      art_title: "タイトル",
      art_lead: "概要・リード",
      cat_l1: "カテゴリー（大）",
      cat_root_other_val: "カテゴリー詳細（自由記述）",
      writing_assist: "事務局代行希望",
      simple_days: "営業曜日",
      shop_mode: "営業モード"
    },
    status: {
      loading_cat: "カテゴリーを取得中...",
      error_cat: "カテゴリーの取得に失敗しました。"
    },
    alerts: {
      zip_empty: "郵便番号を入力してください",
      send_error: "送信に失敗しました"
    },
    placeholders: {
      rep_name: "ニックネーム可", rep_content: "町の発見を教えてください",
      art_type_unselected: "▼ 登録する内容を選択してください（未選択）",
      art_body: "詳しい内容を教えてください",
      ev_venue: "例：飯綱ふれあいパーク", zip: "389-1211", shop_notes: "注意事項があればご記入ください",
      shop_biz_notes: "（例）毎月最終月曜日は定休日です。ランチは売切次第終了。最新情報は公式Instagramをご確認ください。",
      ev_fee: "無料、500円 など", ev_items: "筆記用具、室内履き など", ev_target: "町内在住の方、小学生以上 など",
      pr_variety: "その他の品種を具体的に記入", pr_product: "その他の加工品を具体的に記入",
      pr_area: "数値", pr_staff: "人数（専従・パート含む）", pr_fruit: "具体的な果物名をご記入ください",
      pr_veg: "具体的な野菜名をご記入ください", pr_other: "具体的な内容をご記入ください",
      pr_rep: "氏名をご記入ください", pr_invoice: "T1234567890123",
      url_hint: "https://...", url_prefix: "HPのURL", url_prefix_ec: "通販サイトのURL",
      rel_url: "関連URL", rel_title: "リンクのタイトル", ev_org: "個人名、または団体名",
      cm_mail: "info@example.com", cm_tel: "026-...", cm_other: "窓口へ直接、など",
      cm_notes: "（例）対応時間は平日10:00〜17:00です。土日は電話が繋がりません。",
      art_memo: "その他、補足情報があれば自由にご記入ください", admin_email: "example@mail.com",
      // --- 🍎 logic.js 同期用の追加項目 ---
      genre_detail: "具体的な内容をご記入ください",
      genre_free: "具体的にご記入ください"
    },
    // i18n.js の ja.types を以下のように更新
    types: {
      shop: { 
        label: "お店の登録", title: "店名・施設名", 
        lead: "お店の概要", 
        leadPlaceholder: "お店を一言で表すと？", // 🍎 追加
        notes: "店舗/施設に関する注意事項", catLabel: "この場所でできること（複数選択可）" 
      },
      event: { 
        label: "イベントの登録", title: "イベント名", 
        lead: "イベントの概要", 
        leadPlaceholder: "イベントを一言で表すと？", // 🍎 追加
        notes: "会場に関する注意事項", catLabel: "イベントジャンル（複数選択可）" 
      },
      farmer: { 
        label: "生産者の登録", title: "農園・団体名", 
        lead: "生産者の概要", 
        leadPlaceholder: "農園や活動を一言で表すと？", // 🍎 追加
        notes: "農場訪問時の注意事項（防疫等）", catLabel: "生産・販売スタイル（複数選択可）" 
      },
      other: { 
        label: "記事の登録", title: "記事タイトル", 
        lead: "記事の概要", 
        leadPlaceholder: "内容を一言で表すと？", // 🍎 追加
        notes: "場所に関する注意事項", catLabel: "記事のジャンル（複数選択可）" 
      }
    },
    options: {
      mode_simple: "標準設定", mode_custom: "曜日別設定",
      holiday_none: "設定しない（未回答）", holiday_follow: "曜日どおり営業 / 定休",
      holiday_open: "祝日は営業", holiday_closed: "祝日は休業", holiday_irregular: "不定休・特別ダイヤ",
      period_single: "1日のみ", period_range: "期間あり",
      unit_a: "a（アール）", unit_ha: "ha（ヘクタール）", unit_tan: "反", unit_cho: "町", unit_m2: "㎡", unit_tsubo: "坪",
      crop_fruit: "りんご以外の果物", crop_rice: "米", crop_soba: "そば", crop_veg: "野菜類", crop_other: "その他",
      pr_biz_indiv: "個人事業", pr_biz_corp: "法人", invoice_yes: "登録あり", invoice_no: "登録なし",
      sns_home: "HP", sns_ec: "ECサイト", sns_rel: "関連リンク", sns_ig: "Instagram", sns_fb: "Facebook", sns_x: "X", sns_line: "LINE", sns_tt: "TikTok",
      cm_form: "WEBフォーム", cm_email: "メール", cm_tel: "電話番号", cm_other: "その他"
    },
    common: {
      zipBtn: "住所検索", syncLabel: "掲載用メールアドレスと同じにする", sendBtn: "この内容で送信する", sending: "送信中...",
      assistLabel: "【文章作成が苦手な方へ】紹介文（概要・本文）の作成を事務局に任せる",
      assistNote: "⚠️ 注意事項：文章作成を委任する場合、内容がわかるHP・SNSのURL入力、またはチラシ画像・資料の添付を必ずお願いします。",
      // --- 🍎 logic.js 同期用の追加項目 ---
      dayList: ["月", "火", "水", "木", "金", "土", "日"],
      other_label: "その他",
      cat_other_label: "大カテゴリその他"
    }
  },
  en: {
    tabs: { report: "Report", inquiry: "Inquiry", article: "Post Article" },
    badges: { required: "Required", optional: "Optional", private: "Private" },
    sections: {
      category: "Select Type", basic: "Basic Info", images: "Images & Docs",
      location: "Location", shop_detail: "Business Info", event_detail: "Event Dates",
      event_more: "Event Details", producer_head: "Crops & Products", producer_biz: "Farm Management",
      links: "Links", inquiry_head: "Contact", notes_head: "Notes",
      private_boundary: "Below is Private Information", private_admin: "Admin Message (Private)"
    },
    labels: {
      name: "Name", email: "Email", content: "Content", limit_100: " (Within 100 chars)",
      art_body: "Detailed Description", art_images: "Images (Max 6)", art_file: "Files (PDF,Word,Excel,PowerPoint etc.)",
      ev_venue_name: "Venue Name", zip: "Zip Code", address: "Address", biz_days: "Business Days",
      std_biz_hours: "Standard Hours", open_time: "Open", close_time: "Close",
      day: "Day", closed: "Closed", holiday_biz: "Holiday Hours", shop_biz_notes: "Business Notes",
      ev_sdate: "Start Date", ev_edate: "End Date", ev_stime: "Start Time", ev_etime: "End Time",
      ev_fee: "Fee", ev_items: "Items to Bring", ev_target: "Target Audience",
      pr_varieties: "Apple Varieties", pr_products: "Processed Products",
      pr_area: "Planting Area (Apple)", pr_staff: "Employees", pr_other_crops: "Other Crops (Multiple)",
      pr_biz_type: "Business Category", pr_rep_name: "Farmer Name", pr_invoice: "Invoice Registration",
      pr_invoice_num: "Reg. Number", cm_method: "Contact Method (Multiple)",
      cm_url: "Form URL", cm_mail: "Public Email", cm_tel: "Public Phone",
      cm_other: "Other Contact", cm_notes: "Contact Notes",
      art_memo: "Supplementary Info", cont_name: "Poster/Org Name", admin_email: "Contact Email",
      admin_msg: "Message to Admin",
      genre_suffix: " Genres", genre_free: "Category Details (Free Text)",
      other_venue_name: "Name of Related Location", day_suffix: "",
      rep_name: "Name (Report)",
      rep_content: "Report Content",
      inq_name: "Name (Inquiry)",
      inq_email: "Reply-to Email",
      inq_content: "Inquiry Content",
      art_title: "Title",
      art_lead: "Summary / Lead",
      cat_l1: "Main Category",
      cat_root_other_val: "Category Details (Free text)",
      writing_assist: "Writing Assistance",
      simple_days: "Business Days",
      shop_mode: "Business Mode"
    },
    status: { loading_cat: "Loading categories...", error_cat: "Failed to load categories." },
    alerts: { zip_empty: "Please enter a zip code", send_error: "Failed to send" },
    placeholders: {
      rep_name: "Nickname OK", rep_content: "Tell us what you found",
      art_type_unselected: "▼ Please select an option",
      art_lead: "Summarize in one sentence", art_body: "Provide details",
      ev_venue: "e.g., Iizuna Fureai Park", zip: "389-1211", shop_notes: "Any notes for the location",
      shop_biz_notes: "e.g., Closed last Mondays. Lunch ends when sold out.",
      ev_org_name: "Organizer Name",ev_fee: "Free, 500 yen, etc.", ev_items: "Stationery, shoes, etc.", ev_target: "Residents, students, etc.",
      pr_variety: "Specify other varieties", pr_product: "Specify other products",
      pr_area: "Value", pr_staff: "Number of staff", pr_fruit: "Specify fruit types",
      pr_veg: "Specify vegetable types", pr_other: "Provide details",
      pr_rep: "Full Name", pr_invoice: "T1234567890123",
      url_hint: "https://...", url_prefix: "HP URL", url_prefix_ec: "EC URL",
      rel_url: "Related URL", rel_title: "Link Title", ev_org: "Individual or Org Name",
      cm_mail: "info@example.com", cm_tel: "026-...", cm_other: "Counter, etc.",
      cm_notes: "e.g., Weekdays 10:00-17:00 only.",
      art_memo: "Any other info for readers", admin_email: "example@mail.com",
      genre_detail: "Please enter specific details", genre_free: "Please enter specifically"
    },
    types: {
      shop: { label: "Shop", title: "Shop/Facility Name", lead: "Shop Summary", notes: "Notes for Shop/Facility", catLabel: "What you can do here (Multiple)" },
      event: { label: "Event", title: "Event Name", lead: "Event Summary", notes: "Notes for Venue", catLabel: "Event Genre (Multiple)" },
      farmer: { label: "Farmer", title: "Farm/Group Name", lead: "Farm Summary", notes: "Notes for Farm Visit", catLabel: "Farming Style (Multiple)" },
      other: { label: "Article", title: "Article Title", lead: "Article Summary", notes: "Notes for Location", catLabel: "Article Genre (Multiple)" }
    },
    options: {
      mode_simple: "Standard", mode_custom: "By Day",
      holiday_none: "Not set", holiday_follow: "Follow Calendar",
      holiday_open: "Open on Holidays", holiday_closed: "Closed on Holidays", holiday_irregular: "Irregular/Special",
      period_single: "1 Day Only", period_range: "Period",
      unit_a: "a", unit_ha: "ha", unit_tan: "Tan", unit_cho: "Cho", unit_m2: "㎡", unit_tsubo: "Tsubo",
      crop_fruit: "Other Fruit", crop_rice: "Rice", crop_soba: "Soba", crop_veg: "Vegetables", crop_other: "Other",
      pr_biz_indiv: "Individual", pr_biz_corp: "Corporation", invoice_yes: "Registered", invoice_no: "Not registered",
      sns_home: "HP", sns_ec: "EC Site", sns_rel: "Links", sns_ig: "Instagram", sns_fb: "Facebook", sns_x: "X", sns_line: "LINE", sns_tt: "TikTok",
      cm_form: "Web Form", cm_email: "Email", cm_tel: "Phone", cm_other: "Other"
    },
    common: {
      zipBtn: "Search", syncLabel: "Same as public email", sendBtn: "Submit", sending: "Sending...",
      assistLabel: "[Writing Help] Let admin write the description",
      assistNote: "⚠️ Note: If delegating, please provide a URL or materials.",
      dayList: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      other_label: "Other", cat_other_label: "Other Main Category"
    }
  },
  zh: {
    tabs: { report: "提供信息", inquiry: "咨询", article: "投稿文章" },
    badges: { required: "必填", optional: "选填", private: "不公开" },
    sections: {
      category: "选择类型", basic: "基本信息", images: "图片及資料",
      location: "地点信息", shop_detail: "营业信息", event_detail: "举办时间",
      event_more: "活动详情", producer_head: "品种与加工品", producer_biz: "经营信息",
      links: "各种链接", inquiry_head: "联系方式", notes_head: "备注",
      private_boundary: "以下为不公开信息", private_admin: "联系事务局（不公开）"
    },
    labels: {
      name: "姓名", email: "电子邮箱", content: "内容", limit_100: "（100字以内）",
      art_body: "详细内容", art_images: "图片（最多6张）", art_file: "资料（PDF,Word,Excel,PowerPoint等）",
      ev_venue_name: "会场名称", zip: "邮政编码", address: "详细地址", biz_days: "营业日",
      std_biz_hours: "营业时间", open_time: "开始营业", close_time: "结束营业",
      day: "星期", closed: "休息", holiday_biz: "节假日营业", shop_biz_notes: "营业注意事项",
      ev_sdate: "举办日期", ev_edate: "结束日期", ev_stime: "开始时间", ev_etime: "结束时间",
      ev_org_name: "主办方名称",ev_fee: "费用", ev_items: "随身物品", ev_target: "对象范围",
      pr_varieties: "栽培品种", pr_products: "加工产品",
      pr_area: "种植面积", pr_staff: "员工人数", pr_other_crops: "其他品种（可多选）",
      pr_biz_type: "经营类别", pr_rep_name: "代表人姓名", pr_invoice: "发票注册",
      pr_invoice_num: "注册编号", cm_method: "联系方式（可多选）",
      cm_url: "表单链接", cm_mail: "公开邮箱", cm_tel: "公开电话",
      cm_other: "其他方式", cm_notes: "咨询注意事项",
      art_memo: "补充信息", cont_name: "投稿者姓名", admin_email: "联系邮箱",
      admin_msg: "给事务局的留言",
      genre_suffix: " 类型", genre_free: "类别详情（自由填写）",
      other_venue_name: "相关地点名称", day_suffix: "星期",
      rep_name: "姓名 (提供信息)",
      rep_content: "提供内容",
      inq_name: "姓名 (咨询)",
      inq_email: "回复邮箱",
      inq_content: "咨询内容",
      art_title: "标题",
      art_lead: "摘要 / 导语",
      cat_l1: "主类别",
      cat_root_other_val: "类别详情 (自由填写)",
      writing_assist: "委托代写",
      simple_days: "营业日",
      shop_mode: "营业模式"
    },
    status: { loading_cat: "正在获取类别...", error_cat: "获取类别失败。" },
    alerts: { zip_empty: "请输入邮政编码", send_error: "发送失败" },
    placeholders: {
      rep_name: "可填昵称", rep_content: "请告诉我们您的发现",
      art_type_unselected: "▼ 请选择注册内容",
      art_lead: "用一句话概括内容", art_body: "请填写详细内容",
      ev_venue: "例如：饭纲亲睦公园", zip: "389-1211", shop_notes: "有关地点的注意事项",
      shop_biz_notes: "例如：每月最后周一休。售完即止。",
      ev_fee: "免费、500日元等", ev_items: "文具、室内鞋等", ev_target: "居民、小学生等",
      pr_variety: "具体填写其他品种", pr_product: "具体填写其他加工品",
      pr_area: "数值", pr_staff: "员工人数", pr_fruit: "具体填写水果名称",
      pr_veg: "具体填写蔬菜名称", pr_other: "具体填写详细内容",
      pr_rep: "代表人姓名", pr_invoice: "T1234567890123",
      url_hint: "https://...", url_prefix: "主页链接", url_prefix_ec: "网店链接",
      rel_url: "相关链接", rel_title: "链接标题", ev_org: "个人或团体名",
      cm_mail: "info@example.com", cm_tel: "026-...", cm_other: "直接窗口办理等",
      cm_notes: "例如：仅限平日10:00-17:00。",
      art_memo: "其他需要告知读者の补充信息", admin_email: "example@mail.com",
      genre_detail: "请输入具体内容", genre_free: "请填写具体内容"
    },
    types: {
      shop: { label: "店铺", title: "店名/设施名", lead: "店铺概要", notes: "店铺/设施相关注意事项", catLabel: "在此可进行的操作（多选）" },
      event: { label: "活动", title: "活动名称", lead: "活动概要", notes: "会场相关注意事项", catLabel: "活动类型（多选）" },
      farmer: { label: "生产者注册", title: "农园/团体名", lead: "生产者概要", notes: "农场访问注意事项", catLabel: "生产/销售风格（多选）" },
      other: { label: "文章", title: "文章标题", lead: "文章概要", notes: "地点相关注意事项", catLabel: "文章类型（多选）" }
    },
    options: {
      mode_simple: "标准设置", mode_custom: "按星期设置",
      holiday_none: "未设置", holiday_follow: "按日历营业/休息",
      holiday_open: "节假日营业", holiday_closed: "节假日休息", holiday_irregular: "不定休/特别时段",
      period_single: "仅限1日", period_range: "期间内",
      unit_a: "a", unit_ha: "ha", unit_tan: "反", unit_cho: "町", unit_m2: "㎡", unit_tsubo: "坪",
      crop_fruit: "其他水果", crop_rice: "大米", crop_soba: "荞麦", crop_veg: "蔬菜", crop_other: "其他",
      pr_biz_indiv: "个人事业", pr_biz_corp: "法人", invoice_yes: "已注册", invoice_no: "未注册",
      sns_home: "主页", sns_ec: "网店", sns_rel: "相关链接", sns_ig: "Instagram", sns_fb: "Facebook", sns_x: "X", sns_line: "LINE", sns_tt: "TikTok",
      cm_form: "表单", cm_email: "邮箱", cm_tel: "电话", cm_other: "其他"
    },
    common: {
      zipBtn: "搜索", syncLabel: "与公开邮箱相同", sendBtn: "提交内容", sending: "正在发送...",
      assistLabel: "【不擅长写作】委托事务局代写文章",
      assistNote: "⚠️ 注意事项：委托代写时，请提供相关网址或资料。",
      dayList: ["一", "二", "三", "四", "五", "六", "日"],
      other_label: "其他", cat_other_label: "其他大类"
    }
  }
};

const getLang = () => {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang');
  if (resources[lang]) return lang;
  const browserLang = navigator.language.split('-')[0];
  return resources[browserLang] ? browserLang : 'ja';
};

export const i18n = resources[getLang()];