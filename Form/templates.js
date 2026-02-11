/**
 * templates.js - フォーム構造定義
 */

// 🍎 登録タイプごとのカテゴリーラベル定義
export const catLabels = {
  shop: "この場所でできること（複数選択可）",
  event: "イベントジャンル（複数選択可）",
  producer: "生産・販売スタイル（複数選択可）",
  other: "記事のジャンル（複数選択可）"
};

export const formHTML = `
<div class="lz-form-wrap">
  <div class="lz-form-tabs">
    <div class="lz-form-tab is-active" data-type="report">情報提供</div>
    <div class="lz-form-tab" data-type="inquiry">お問い合わせ</div>
    <div class="lz-form-tab" data-type="article">記事投稿</div>
  </div>

  <form id="lzMasterForm">
    <div id="pane-report" class="lz-form-body is-active">
       <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> お名前</label><input type="text" name="rep_name" class="lz-input" placeholder="ニックネーム可" required></div>
       <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> 内容</label><textarea name="rep_content" class="lz-textarea" rows="6" placeholder="町の発見を教えてください" required></textarea></div>
    </div>
    <div id="pane-inquiry" class="lz-form-body">
       <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> お名前</label><input type="text" name="inq_name" class="lz-input" required></div>
       <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> メールアドレス</label><input type="email" name="inq_email" class="lz-input" required></div>
       <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> 内容</label><textarea name="inq_content" class="lz-textarea" rows="6" required></textarea></div>
    </div>

    <div id="pane-article" class="lz-form-body">
      <div class="lz-section-head">登録内容の選択</div>
      <div class="lz-field">
        <div class="lz-choice-grid">
          <label class="lz-choice-item"><input type="radio" name="art_type" value="producer"><span class="lz-choice-inner">生産者の登録</span></label>
          <label class="lz-choice-item"><input type="radio" name="art_type" value="shop"><span class="lz-choice-inner">お店の登録</span></label>
          <label class="lz-choice-item"><input type="radio" name="art_type" value="event"><span class="lz-choice-inner">イベントの登録</span></label>
          <label class="lz-choice-item"><input type="radio" name="art_type" value="other"><span class="lz-choice-inner">記事の登録</span></label>
        </div>
      </div>

      <div id="article-fields-container" style="display:none; flex-direction:column; gap:32px;">
        <div class="lz-section-head">基本情報</div>
        <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> <span id="lbl-title">店名・施設名</span></label><input type="text" name="art_title" id="inp-title" class="lz-input" required></div>

        <div class="lz-field">
          <label class="lz-label"><span class="lz-badge">必須</span> <span id="lbl-dynamic-cat"></span></label>
          <div id="lz-dynamic-category-area"></div>
        </div>

        <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> <span id="lbl-lead">概要</span>（100文字以内）</label><textarea name="art_lead" class="lz-textarea" rows="2" maxlength="100" placeholder="お店やイベントを一言で表すと？" required></textarea></div>
        /* 基本情報〜紹介文作成代行 */
        <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> 詳細本文</label><textarea name="art_body" class="lz-textarea" rows="8" placeholder="詳しい内容を教えてください" required></textarea></div>
        
        <div id="box-writing-assist" class="lz-field" style="margin-top: -10px;">
          <label class="lz-checkbox-label">
            <input type="checkbox" id="chk-writing-assist" name="writing_assist" class="lz-checkbox-input">
            【文章作成が苦手な方へ】紹介文（概要・本文）の作成を事務局に任せる
          </label>
          <div id="msg-writing-assist" style="display: none; color: #cf3a3a; font-size: 0.95rem; font-weight: 800; padding: 12px; background: #fff5f5; border-radius: 8px; border: 1px solid #ffcccc; line-height: 1.5;">
            ⚠️ 注意事項：文章作成を委任する場合、内容がわかるHP・SNSのURL入力、またはチラシ画像・資料の添付を必ずお願いします。
          </div>
        </div>

/* 生産者専用パネル：構造を最適化 */
<div id="pane-producer-detail" class="lz-dynamic-detail" style="display:none;">
  <div class="lz-section-head">栽培品種・加工品</div>
  <div class="lz-field">
    <label class="lz-label">栽培している品種</label>
    <div id="area-apple-varieties" class="lz-choice-flex"></div>
    <input type="text" id="pr-variety-other-input" name="pr_variety_other" class="lz-input" style="display:none; margin-top:8px;" placeholder="その他の品種を具体的に記入">
  </div>
  <div class="lz-field">
    <label class="lz-label">扱っている加工品</label>
    <div id="area-apple-products" class="lz-choice-flex"></div>
    <input type="text" id="pr-product-other-input" name="pr_product_other" class="lz-input" style="display:none; margin-top:8px;" placeholder="その他の加工品を具体的に記入">
  </div>

  <div class="lz-section-head" style="margin-top:0;">栽培・経営について</div>
  <div class="lz-grid">
    <div class="lz-field"><label class="lz-label">作付面積（りんご）</label>
      <div style="display:flex; gap:8px;">
        <input type="number" name="pr_area" class="lz-input" style="flex:1;" placeholder="数値">
        <select name="pr_area_unit" class="lz-select" style="width:100px;"><option value="a">a</option><option value="ha">ha</option><option value="反">反</option><option value="町">町</option></select>
      </div>
    </div>
    <div class="lz-field"><label class="lz-label">従業員数</label><input type="number" name="pr_staff" class="lz-input" placeholder="人数（専従・パート含む）"></div>
  </div>

  <div class="lz-field" style="margin-top:12px;">
    <label class="lz-label">りんご以外の栽培品目（複数選択可）</label>
    <div class="lz-choice-flex">
      <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="pr_other_crops" value="fruit" class="pr-crop-trigger"><span class="lz-choice-inner">りんご以外の果物</span></label>
      <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="pr_other_crops" value="rice"><span class="lz-choice-inner">米</span></label>
      <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="pr_other_crops" value="soba"><span class="lz-choice-inner">そば</span></label>
      <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="pr_other_crops" value="vegetable" class="pr-crop-trigger"><span class="lz-choice-inner">野菜類</span></label>
      <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="pr_other_crops" value="other" class="pr-crop-trigger"><span class="lz-choice-inner">その他</span></label>
    </div>
    <input type="text" id="pr-crop-fruit-input" name="pr_crop_fruit_val" class="lz-input" style="display:none; margin-top:8px;" placeholder="具体的な果物名">
    <input type="text" id="pr-crop-veg-input" name="pr_crop_veg_val" class="lz-input" style="display:none; margin-top:8px;" placeholder="具体的な野菜名">
    <input type="text" id="pr-crop-other-input" name="pr_crop_other_val" class="lz-input" style="display:none; margin-top:8px;" placeholder="具体的な内容">
  </div>

  <div class="lz-grid" style="margin-top:12px;">
    <div class="lz-field">
      <label class="lz-label">経営区分</label>
      <div class="lz-choice-grid" style="grid-template-columns: 1fr 1fr;">
        <label class="lz-choice-item"><input type="radio" name="pr_ent_type" value="individual" checked><span class="lz-choice-inner">個人事業</span></label>
        <label class="lz-choice-item"><input type="radio" name="pr_ent_type" value="corp"><span class="lz-choice-inner">法人</span></label>
      </div>
    </div>
    <div class="lz-field">
      <label class="lz-label">代表者名</label>
      <input type="text" name="pr_rep_name" class="lz-input" placeholder="氏名をご記入ください">
    </div>
  </div>
  
  <div class="lz-field" style="margin-top:12px;">
    <label class="lz-label">インボイス登録</label>
    <div class="lz-choice-grid" style="grid-template-columns: 1fr 1fr;">
      <label class="lz-choice-item"><input type="radio" name="pr_invoice" value="yes" class="pr-invoice-trigger"><span class="lz-choice-inner">登録あり</span></label>
      <label class="lz-choice-item"><input type="radio" name="pr_invoice" value="no" class="pr-invoice-trigger" checked><span class="lz-choice-inner">登録なし</span></label>
    </div>
    <div id="pr-invoice-num-box" style="display:none; margin-top:10px;">
      <input type="text" name="pr_invoice_num" class="lz-input" placeholder="登録番号 T1234567890123">
    </div>
  </div>
</div> /* 各種リンク：共通エリアとして配置 */
<div id="box-sns-links" class="lz-field">
  <div class="lz-section-head">各種リンク</div>
  <div class="lz-choice-flex">
    <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="home"><span class="lz-choice-inner">HP</span></label>
    <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="ec"><span class="lz-choice-inner">ECサイト</span></label>
    <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="rel"><span class="lz-choice-inner">関連リンク</span></label>
    <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="ig"><span class="lz-choice-inner">Instagram</span></label>
    <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="fb"><span class="lz-choice-inner">Facebook</span></label>
    <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="x"><span class="lz-choice-inner">X</span></label>
    <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="line"><span class="lz-choice-inner">LINE</span></label>
    <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="tt"><span class="lz-choice-inner">TikTok</span></label>
  </div>

  <div id="sns-inputs" style="display:flex; flex-direction:column; gap:12px; margin-top:15px;">
    <div id="f-home" style="display:none;"><input type="url" name="url_home" class="lz-input" placeholder="HPのURL"></div>
    <div id="f-ec" style="display:none;"><input type="url" name="url_ec" class="lz-input" placeholder="通販サイトのURL"></div>
    <div id="f-rel" style="display:none; flex-direction:column; gap:12px;">
      <div class="lz-grid">
        <input type="url" id="rel_url1" name="rel_url1" class="lz-input" placeholder="関連URL 1">
        <input type="text" id="rel_title1" name="rel_title1" class="lz-input" placeholder="タイトルの入力 1">
      </div>
      <div id="rel-link2-row" class="lz-grid" style="display:none;">
        <input type="url" id="rel_url2" name="rel_url2" class="lz-input" placeholder="関連URL 2">
        <input type="text" id="rel_title2" name="rel_title2" class="lz-input" placeholder="タイトルの入力 2">
      </div>
    </div>
    <div id="f-ig" style="display:none;"><input type="text" name="sns_ig" class="lz-input" placeholder="Instagram ID"></div>
    <div id="f-fb" style="display:none;"><input type="text" name="sns_fb" class="lz-input" placeholder="Facebook URL"></div>
    <div id="f-x" style="display:none;"><input type="text" name="sns_x" class="lz-input" placeholder="X (Twitter) ID"></div>
    <div id="f-line" style="display:none;"><input type="text" name="sns_line" class="lz-input" placeholder="LINE URL"></div>
    <div id="f-tt" style="display:none;"><input type="text" name="sns_tt" class="lz-input" placeholder="TikTok URL"></div>
  </div>
</div>


<div class="lz-section-head" id="lbl-inquiry-head">問い合わせ先（公開）</div>

<div id="ev-org-field" class="lz-field" style="display:none;">
  <label class="lz-label"><span class="lz-badge">必須</span> 主催者名</label>
  <input type="text" name="ev_org_name" class="lz-input" placeholder="個人名、または団体名">
</div>

<div class="lz-field">
  <label class="lz-label">問い合わせ方法（複数選択可）</label>
  <div class="lz-choice-flex">
    <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cm" value="form"><span class="lz-choice-inner">WEBフォーム</span></label>
    <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cm" value="email"><span class="lz-choice-inner">メール</span></label>
    <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cm" value="tel"><span class="lz-choice-inner">電話番号</span></label>
    <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cm" value="other"><span class="lz-choice-inner">その他</span></label>
  </div>
</div>

<div id="cm-form-box" class="lz-field" style="display:none;"><label class="lz-label">フォームURL</label><input type="url" name="cm_url" class="lz-input" placeholder="https://..."></div>
<div id="cm-email-box" class="lz-field" style="display:none;"><label class="lz-label">掲載用メールアドレス</label><input type="email" id="pubEmail" name="cm_mail" class="lz-input" placeholder="info@example.com"></div>
<div id="cm-tel-box" class="lz-field" style="display:none;"><label class="lz-label">掲載用電話番号</label><input type="tel" name="cm_tel" class="lz-input" placeholder="026-..."></div>
<div id="cm-other-box" class="lz-field" style="display:none;"><label class="lz-label">その他の受付方法</label><input type="text" name="cm_other_val" class="lz-input" placeholder="窓口へ直接、など"></div>

<div class="lz-field">
  <label class="lz-label"><span class="lz-badge opt" style="background:#999;">任意</span> 問い合わせに関する注意事項</label>
  <textarea name="cm_notes" class="lz-textarea" rows="2" placeholder="（例）対応時間は平日10:00〜17:00です。土日は電話が繋がりません。"></textarea>
</div>

        <div class="lz-section-head">事務局への連絡（非公開）</div>
        <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> 投稿者・団体名</label><input type="text" name="cont_name" class="lz-input" required></div>
        <div class="lz-field">
  <label class="lz-label"><span class="lz-badge">必須</span> 連絡用メールアドレス</label>
  
  <div id="syncField" style="display:none; margin-bottom: 10px;">
    <label class="lz-choice-item" style="width:fit-content;">
      <input type="checkbox" id="syncCheck">
      <span class="lz-choice-inner" style="min-height:36px; padding:4px 16px; font-size:1rem; border-radius:20px;">
        掲載用メールアドレスと同じにする
      </span>
    </label>
  </div>

  <input type="email" id="adminEmail" name="admin_email" class="lz-input" required placeholder="example@mail.com">
</div>
        
        <div class="lz-field"><label class="lz-label"><span class="lz-badge opt" style="background:#999;">非公開</span> 事務局へのメッセージ</label><textarea name="admin_msg" class="lz-textarea" rows="4"></textarea></div>

        <button type="submit" class="lz-send-btn" id="lzBtn">この内容で送信する</button>
      </div>
    </div>
  </form>
</div>
`;

export const formCommonHTML = ``;