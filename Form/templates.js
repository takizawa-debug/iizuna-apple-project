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
      <div class="lz-field"><div class="lz-choice-grid"><label class="lz-choice-item"><input type="radio" name="art_type" value="shop"><span class="lz-choice-inner">お店の登録</span></label><label class="lz-choice-item"><input type="radio" name="art_type" value="event"><span class="lz-choice-inner">イベントの登録</span></label><label class="lz-choice-item"><input type="radio" name="art_type" value="other"><span class="lz-choice-inner">記事の登録</span></label></div></div>

      <div id="article-fields-container" style="display:none; flex-direction:column; gap:32px;">
        <div class="lz-section-head">基本情報</div>
        <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> <span id="lbl-title">店名・施設名</span></label><input type="text" name="art_title" id="inp-title" class="lz-input" required></div>
        <div id="lz-dynamic-category-area"></div>
        <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> <span id="lbl-lead">概要</span>（100文字以内）</label><textarea name="art_lead" class="lz-textarea" rows="2" maxlength="100" placeholder="お店やイベントを一言で表すと？" required></textarea></div>
        <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> 詳細本文</label><textarea name="art_body" class="lz-textarea" rows="8" placeholder="詳しい内容を教えてください" required></textarea></div>

        <div class="lz-section-head">画像・配布資料</div>
        <div class="lz-field">
          <label class="lz-label"><span class="lz-badge opt" style="background:#999;">任意</span> 画像（最大6枚）</label>
          <input type="file" id="imgInput" class="lz-input" accept="image/*" multiple style="display:none;">
          <div id="imgPreviewGrid" class="lz-img-preview-grid">
             <div class="lz-img-add-btn" id="imgAddTrigger"><span>＋ 追加</span><small>最大6枚</small></div>
          </div>
        </div>

        <div class="lz-section-head">場所の情報</div>
        <div class="lz-grid">
          <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> 郵便番号</label><div style="display:flex; gap:10px;"><input type="text" id="zipCode" name="shop_zip" class="lz-input" placeholder="389-1211" style="flex:1;"><button type="button" class="lz-zip-btn" id="zipBtnAction">住所検索</button></div></div>
          <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> 住所</label><input type="text" id="addressField" name="shop_addr" class="lz-input" required></div>
        </div>

        <div id="pane-shop-detail" class="lz-dynamic-detail" style="display:none;">
          <div class="lz-section-head" style="margin-top:0;">営業時間・定休日</div>
          <div class="lz-choice-grid" style="grid-template-columns: 1fr 1fr;"><label class="lz-choice-item"><input type="radio" name="shop_mode" value="simple" checked><span class="lz-choice-inner">標準設定</span></label><label class="lz-choice-item"><input type="radio" name="shop_mode" value="custom"><span class="lz-choice-inner">曜日別設定</span></label></div>
          <div id="shop-simple">
            <div class="lz-field"><label class="lz-label">営業曜日</label><div id="box-simple-days" class="lz-day-selector"></div></div>
            <div class="lz-field">
              <label class="lz-label" id="lz-standard-hours-label">標準営業時間</label>
              <div class="lz-time-row">
                <div class="lz-time-field"><span class="lz-time-label-sm">営業開始</span><div id="sel-simple-start" class="lz-time-box"></div></div>
                <div class="lz-time-field"><span class="lz-time-label-sm">営業終了</span><div id="sel-simple-end" class="lz-time-box"></div></div>
              </div>
            </div>
          </div>
          <div id="shop-custom" style="display:none;"><div class="lz-schedule-container"><table class="lz-schedule-table"><thead><tr><th>曜日</th><th>休業</th><th>営業開始</th><th>営業終了</th></tr></thead><tbody id="customSchedBody"></tbody></table></div></div>
          <div class="lz-field"><label class="lz-label">祝日の営業</label><select name="shop_holiday_type" class="lz-select"><option value="">設定しない</option><option value="follow_regular">曜日どおり</option><option value="always_open">祝日は営業</option><option value="always_closed">祝日は休業</option></select></div>
        </div>

        <div class="lz-section-head">問い合わせ・公開設定</div>
        <div class="lz-field"><div class="lz-choice-flex"><label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cm" value="email"><span class="lz-choice-inner">メール</span></label><label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cm" value="tel"><span class="lz-choice-inner">電話番号</span></label></div></div>
        <div id="cm-email-box" class="lz-field" style="display:none;"><label class="lz-label">掲載用メール</label><input type="email" id="pubEmail" name="cm_mail" class="lz-input"></div>

        <div class="lz-section-head">事務局への連絡</div>
        <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> 投稿者・団体名</label><input type="text" name="cont_name" class="lz-input" required></div>
        
        <div id="syncField" style="display:none; margin-bottom: 12px;">
          <label class="lz-choice-item"><input type="checkbox" id="syncCheck" checked><span class="lz-choice-inner" style="border-radius:30px; min-height:44px; padding:8px 16px;">掲載用メールと同じにする</span></label>
        </div>
        <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> 連絡用メールアドレス</label><input type="email" id="adminEmail" name="admin_email" class="lz-input" required></div>
        
        <button type="submit" class="lz-send-btn" id="lzBtn">この内容で送信する</button>
      </div>
    </div>
  </form>
</div>
`;
export const formCommonHTML = ``;