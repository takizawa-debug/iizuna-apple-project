/**
 * templates.js - フォーム構造定義（スマホ最適化 UI）
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
        <label class="lz-label">何を登録しますか？</label>
        <div class="lz-choice-grid">
          <label class="lz-choice-card"><input type="radio" name="art_type" value="shop"><div class="lz-choice-content">お店の登録</div></label>
          <label class="lz-choice-card"><input type="radio" name="art_type" value="event"><div class="lz-choice-content">イベント登録</div></label>
          <label class="lz-choice-card"><input type="radio" name="art_type" value="other"><div class="lz-choice-content">記事の投稿</div></label>
        </div>
      </div>

      <div id="article-fields-container" style="display:none; flex-direction:column; gap:28px;">
        <div class="lz-section-head">基本情報</div>
        <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> <span id="lbl-title">店名・施設名</span></label><input type="text" name="art_title" id="inp-title" class="lz-input" required></div>

        <div id="lz-dynamic-category-area"></div>

        <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> <span id="lbl-lead">概要</span>（100文字以内）</label><textarea name="art_lead" class="lz-textarea" rows="2" maxlength="100" required></textarea></div>
        <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> 詳細本文</label><textarea name="art_body" class="lz-textarea" rows="8" required></textarea></div>

        <div class="lz-section-head">画像・配布資料</div>
        <div class="lz-grid">
          <div class="lz-field"><label class="lz-label"><span class="lz-badge opt" style="background:#999;">任意</span> 画像</label><input type="file" name="art_images" class="lz-input" accept="image/*" multiple></div>
          <div class="lz-field"><label class="lz-label"><span class="lz-badge opt" style="background:#999;">任意</span> 配布資料</label><input type="file" name="art_file" class="lz-input" accept=".pdf,.doc,.docx,.zip"></div>
        </div>

        <div class="lz-section-head">場所の情報</div>
        <div class="lz-grid">
          <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> 郵便番号</label><div style="display:flex; gap:10px;"><input type="text" id="zipCode" name="shop_zip" class="lz-input" placeholder="389-1211" style="flex:1;"><button type="button" class="lz-zip-btn" id="zipBtnAction">検索</button></div></div>
          <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> 住所</label><input type="text" id="addressField" name="shop_addr" class="lz-input" required></div>
        </div>

        <div id="pane-shop-detail" class="lz-dynamic-detail" style="display:none;">
          <div class="lz-section-head" style="margin-top:0;">営業時間・定休日</div>
          <div class="lz-choice-grid">
            <label class="lz-choice-card"><input type="radio" name="shop_mode" value="simple" checked><div class="lz-choice-content">標準設定</div></label>
            <label class="lz-choice-card"><input type="radio" name="shop_mode" value="custom"><div class="lz-choice-content">曜日別設定</div></label>
          </div>
          
          <div id="shop-simple">
            <div class="lz-field"><label class="lz-label">営業曜日</label><div id="box-simple-days" class="lz-choice-grid"></div></div>
            <div class="lz-field"><label class="lz-label">標準営業時間</label><div id="sel-simple-time" class="lz-time-group"></div></div>
          </div>

          <div id="shop-custom" style="display:none;"><div class="lz-schedule-container"><table class="lz-schedule-table"><thead><tr><th>曜日</th><th>休業</th><th>開店</th><th>閉店</th></tr></thead><tbody id="customSchedBody"></tbody></table></div></div>

          <div class="lz-field"><label class="lz-label">祝日の営業</label><select name="shop_holiday_type" class="lz-select"><option value="">未回答（設定しない）</option><option value="follow">曜日通りに営業</option><option value="closed">祝日は休業</option><option value="irregular">不定休・特別ダイヤ</option></select></div>
          <div class="lz-field"><label class="lz-label">営業に関する注意事項</label><textarea name="shop_notes" class="lz-textarea" rows="3" placeholder="（例）毎月最終月曜日は休み。ランチは売切次第終了等"></textarea></div>
        </div>

        <div id="box-sns-links" class="lz-field">
          <div class="lz-section-head" style="margin-top:0;">公式・SNSリンク</div>
          <div class="lz-choice-grid">
            <label class="lz-choice-card"><input type="checkbox" name="sns_trigger" value="home"><div class="lz-choice-content">HP</div></label>
            <label class="lz-choice-card"><input type="checkbox" name="sns_trigger" value="ec"><div class="lz-choice-content">EC</div></label>
            <label class="lz-choice-card"><input type="checkbox" name="sns_trigger" value="ig"><div class="lz-choice-content">Insta</div></label>
            <label class="lz-choice-card"><input type="checkbox" name="sns_trigger" value="fb"><div class="lz-choice-content">FB</div></label>
            <label class="lz-choice-card"><input type="checkbox" name="sns_trigger" value="x"><div class="lz-choice-content">X</div></label>
            <label class="lz-choice-card"><input type="checkbox" name="sns_trigger" value="line"><div class="lz-choice-content">LINE</div></label>
          </div>
          <div id="sns-inputs" style="display:flex; flex-direction:column; gap:12px; margin-top:10px;">
            <div id="f-home" style="display:none;"><input type="url" name="url_home" class="lz-input" placeholder="公式サイトURL"></div>
            <div id="f-ec" style="display:none;"><input type="url" name="url_ec" class="lz-input" placeholder="EC・通販サイトURL"></div>
            <div id="f-ig" style="display:none;"><input type="text" name="sns_ig" class="lz-input" placeholder="Instagram ID/URL"></div>
            <div id="f-fb" style="display:none;"><input type="text" name="sns_fb" class="lz-input" placeholder="Facebook URL"></div>
            <div id="f-x" style="display:none;"><input type="text" name="sns_x" class="lz-input" placeholder="X (Twitter) ID"></div>
            <div id="f-line" style="display:none;"><input type="text" name="sns_line" class="lz-input" placeholder="LINE 公式アカウントURL"></div>
          </div>
        </div>

        <div class="lz-section-head">問い合わせ・公開設定</div>
        <div class="lz-choice-grid">
          <label class="lz-choice-card"><input type="checkbox" name="cm" value="form"><div class="lz-choice-content">フォーム</div></label>
          <label class="lz-choice-card"><input type="checkbox" name="cm" value="email"><div class="lz-choice-content">メール</div></label>
          <label class="lz-choice-card"><input type="checkbox" name="cm" value="tel"><div class="lz-choice-content">電話</div></label>
          <label class="lz-choice-card"><input type="checkbox" name="cm" value="other"><div class="lz-choice-content">その他</div></label>
        </div>
        <div id="cm-form-box" class="lz-field" style="display:none;"><input type="url" name="cm_url" class="lz-input" placeholder="フォームURL"></div>
        <div id="cm-email-box" class="lz-field" style="display:none;"><input type="email" id="pubEmail" name="cm_mail" class="lz-input" placeholder="掲載用メール"></div>
        <div id="cm-tel-box" class="lz-field" style="display:none;"><input type="tel" name="cm_tel" class="lz-input" placeholder="掲載用電話番号"></div>
        <div id="cm-other-box" class="lz-field" style="display:none;"><input type="text" name="cm_other_val" class="lz-input" placeholder="その他の受付方法"></div>

        <div class="lz-section-head">事務局への連絡</div>
        <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> 投稿者・団体名</label><input type="text" name="cont_name" class="lz-input" required></div>
        <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> 連絡用アドレス</label><input type="email" id="adminEmail" name="admin_email" class="lz-input" required></div>
        <div id="syncField" style="display:none;"><label class="lz-choice-card"><input type="checkbox" id="syncCheck" checked><div class="lz-choice-content">掲載用メールも同じにする</div></label></div>

        <button type="submit" class="lz-send-btn" id="lzBtn">この内容で送信する</button>
      </div>
    </div>
  </form>
</div>
`;

export const formCommonHTML = ``;