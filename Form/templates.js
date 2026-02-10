/**
 * templates.js - フォーム構造定義
 */

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
          <label class="lz-choice-item"><input type="radio" name="art_type" value="shop"><span class="lz-choice-inner">お店の登録</span></label>
          <label class="lz-choice-item"><input type="radio" name="art_type" value="event"><span class="lz-choice-inner">イベントの登録</span></label>
          <label class="lz-choice-item"><input type="radio" name="art_type" value="other"><span class="lz-choice-inner">記事の登録</span></label>
        </div>
      </div>

      <div id="article-fields-container" style="display:none; flex-direction:column; gap:32px;">
        <div class="lz-section-head">基本情報</div>
        <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> <span id="lbl-title">店名・施設名</span></label><input type="text" name="art_title" id="inp-title" class="lz-input" required></div>

        <div id="lz-dynamic-category-area"></div>

        <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> <span id="lbl-lead">概要</span>（100文字以内）</label><textarea name="art_lead" class="lz-textarea" rows="2" maxlength="100" placeholder="お店やイベントを一言で表すと？" required></textarea></div>
        <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> 詳細本文</label><textarea name="art_body" class="lz-textarea" rows="8" placeholder="詳しい内容を教えてください" required></textarea></div>
        <div class="lz-section-head">画像・配布資料</div><div class="lz-grid"><div class="lz-field"><label class="lz-label"><span class="lz-badge opt" style="background:#999;">任意</span> 画像（最大6枚）</label><div id="imgPreviewArea" class="lz-img-preview-grid"><div id="imgAddBtn" class="lz-img-add-btn">＋</div></div><input type="file" id="art_images_input" style="display:none;" accept="image/*" multiple></div>
        <div class="lz-field"><label class="lz-label"><span class="lz-badge opt" style="background:#999;">任意</span> 資料（PDF等）</label><input type="file" name="art_file" class="lz-input" accept=".pdf,.doc,.docx,.zip"></div></div>

        <div class="lz-section-head">場所の情報</div>
        <div class="lz-grid">
          <div class="lz-field">
            <label class="lz-label"><span class="lz-badge">必須</span> 郵便番号</label>
            <div style="display:flex; gap:10px;"><input type="text" id="zipCode" name="shop_zip" class="lz-input" placeholder="389-1211" style="flex:1;"><button type="button" class="lz-zip-btn" id="zipBtnAction">住所検索</button></div>
          </div>
          <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> 住所</label><input type="text" id="addressField" name="shop_addr" class="lz-input" required></div>
        </div>

        <div id="pane-shop-detail" class="lz-dynamic-detail" style="display:none;">
          <div class="lz-section-head" style="margin-top:0;">営業時間・定休日</div>
          <div class="lz-choice-grid" style="grid-template-columns: 1fr 1fr;">
            <label class="lz-choice-item"><input type="radio" name="shop_mode" value="simple" checked><span class="lz-choice-inner">標準設定</span></label>
            <label class="lz-choice-item"><input type="radio" name="shop_mode" value="custom"><span class="lz-choice-inner">曜日別設定</span></label>
          </div>
          
          <div id="shop-simple">
            <div class="lz-field"><label class="lz-label">営業曜日</label><div id="box-simple-days" class="lz-day-selector"></div></div>
            <div class="lz-field">
              <label class="lz-label">標準営業時間</label>
              <div class="lz-time-row">
                <div class="lz-time-field"><span class="lz-time-label-sm">営業開始</span><div id="sel-simple-start" class="lz-time-box"></div></div>
                <div class="lz-time-field"><span class="lz-time-label-sm">営業終了</span><div id="sel-simple-end" class="lz-time-box"></div></div>
              </div>
            </div>
          </div>

          <div id="shop-custom" style="display:none;">
            <div class="lz-schedule-container">
              <table class="lz-schedule-table">
                <thead><tr><th>曜日</th><th>休業</th><th>営業開始</th><th>営業終了</th></tr></thead>
                <tbody id="customSchedBody"></tbody>
              </table>
            </div>
          </div>


<div class="lz-field">
  <label class="lz-label">祝日の営業</label>
  <select name="shop_holiday_type" class="lz-select">
    <option value="">設定しない（未回答）</option>
    <option value="follow_regular">曜日どおり営業 / 定休（カレンダーに従う）</option>
    <option value="always_open">祝日は営業（定休日であっても営業する）</option>
    <option value="always_closed">祝日は休業（営業日であっても休業する）</option>
    <option value="irregular">不定休・特別ダイヤ（詳細は注意事項に記載）</option>
  </select>
</div>
          <div class="lz-field"><label class="lz-label">営業に関する注意事項</label><textarea name="shop_notes" class="lz-textarea" rows="3" placeholder="（例）毎月最終月曜日は定休日です。ランチは売切次第終了。最新情報は公式Instagramをご確認ください。"></textarea></div>
        </div>

        <div id="box-sns-links" class="lz-field">
        <div class="lz-choice-flex">
        <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="home"><span class="lz-choice-inner">HP</span></label>
        <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="ec"><span class="lz-choice-inner">ECサイト</span></label>
        <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="rel"><span class="lz-choice-inner">関連リンク</span></label>
        <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="ig"><span class="lz-choice-inner">Instagram</span></label>
        <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="fb"><span class="lz-choice-inner">Facebook</span></label>
        <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="x"><span class="lz-choice-inner">X</span></label>
        <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="line"><span class="lz-choice-inner">LINE</span></label>
        <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="line"><span class="lz-choice-inner">TikTok</span></label>
        </div>
<div id="sns-inputs" style="display:flex; flex-direction:column; gap:12px; margin-top:15px;">
  <div id="f-home" style="display:none;"><input type="url" name="url_home" class="lz-input" placeholder="HPのURL (https://...)"></div>
  <div id="f-ec" style="display:none;"><input type="url" name="url_ec" class="lz-input" placeholder="通販サイトのURL (https://...)"></div>
  <div id="f-ig" style="display:none;"><input type="text" name="sns_ig" class="lz-input" placeholder="Instagram アカウント名"></div>
  <div id="f-fb" style="display:none;"><input type="text" name="sns_fb" class="lz-input" placeholder="Facebook ページURL"></div>
  <div id="f-x" style="display:none;"><input type="text" name="sns_x" class="lz-input" placeholder="X (Twitter) アカウント名"></div>
  <div id="f-line" style="display:none;"><input type="text" name="sns_line" class="lz-input" placeholder="LINE 公式アカウントURL"></div>
  <div id="f-tt" style="display:none;"><input type="text" name="sns_tt" class="lz-input" placeholder="TikTokアカウントURL"></div>
  
  <div id="f-rel" style="display:none; flex-direction:column; gap:12px;">
    <div class="lz-grid">
      <input type="url" id="rel_url1" name="rel_url1" class="lz-input" placeholder="関連URL 1 (https://...)">
      <input type="text" id="rel_title1" name="rel_title1" class="lz-input" placeholder="リンクのタイトル 1">
    </div>
    <div id="rel-link2-row" class="lz-grid" style="display:none;">
      <input type="url" id="rel_url2" name="rel_url2" class="lz-input" placeholder="関連URL 2 (https://...)">
      <input type="text" id="rel_title2" name="rel_title2" class="lz-input" placeholder="リンクのタイトル 2">
    </div>
  </div>
</div>
        </div>

        <div id="pane-event-detail" class="lz-dynamic-detail" style="display:none;">
          <div class="lz-section-head" style="margin-top:0;">開催詳細</div>
          <div class="lz-grid"><div class="lz-field"><label class="lz-label">開始日</label><input type="date" name="ev_sdate" class="lz-input"></div><div class="lz-field"><label class="lz-label">終了日</label><input type="date" name="ev_edate" class="lz-input"></div></div>
          <div class="lz-grid">
            <div class="lz-field"><label class="lz-label">開始時刻</label><div id="sel-ev-start" class="lz-time-row"><div class="lz-time-box" id="sel-ev-s"></div></div></div>
            <div class="lz-field"><label class="lz-label">終了時刻</label><div id="sel-ev-end" class="lz-time-row"><div class="lz-time-box" id="sel-ev-e"></div></div></div>
          </div>
        </div>

        <div class="lz-section-head">問い合わせ・公開設定</div>
        <div class="lz-field">
          <div class="lz-choice-flex">
            <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cm" value="form"><span class="lz-choice-inner">専用フォーム</span></label>
            <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cm" value="email"><span class="lz-choice-inner">メール</span></label>
            <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cm" value="tel"><span class="lz-choice-inner">電話番号</span></label>
            <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cm" value="other"><span class="lz-choice-inner">その他</span></label>
          </div>
        </div>
        <div id="cm-form-box" class="lz-field" style="display:none;"><label class="lz-label">フォームURL</label><input type="url" name="cm_url" class="lz-input"></div>
        <div id="cm-email-box" class="lz-field" style="display:none;"><label class="lz-label">掲載用メールアドレス</label><input type="email" id="pubEmail" name="cm_mail" class="lz-input"></div>
        <div id="cm-tel-box" class="lz-field" style="display:none;"><label class="lz-label">掲載用電話番号</label><input type="tel" name="cm_tel" class="lz-input" placeholder="026-..."></div>
        <div id="cm-other-box" class="lz-field" style="display:none;"><label class="lz-label">その他の受付方法</label><input type="text" name="cm_other_val" class="lz-input"></div>

        <div class="lz-section-head">事務局への連絡</div>
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
        <div id="syncField" style="display:none; margin-top:-10px;">
          <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" id="syncCheck" checked><span class="lz-choice-inner">掲載用メールも同じにする</span></label>
        </div>
        <div class="lz-field"><label class="lz-label"><span class="lz-badge opt" style="background:#999;">非公開</span> 事務局へのメッセージ</label><textarea name="admin_msg" class="lz-textarea" rows="4"></textarea></div>

        <button type="submit" class="lz-send-btn" id="lzBtn">この内容で送信する</button>
      </div>
    </div>
  </form>
</div>
`;

export const formCommonHTML = ``;