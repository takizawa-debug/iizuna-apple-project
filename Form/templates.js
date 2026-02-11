/**
 * templates.js - 構造定義（Skeleton）
 */
import { i18n } from './i18n.js';
import { utils } from './utils.js';

export const getFormHTML = () => `
<form id="lz-article-form" class="lz-form-wrap">
  <div class="lz-form-tabs">
    <div class="lz-form-tab is-active" data-type="report">${i18n.tabs.report}</div>
    <div class="lz-form-tab" data-type="inquiry">${i18n.tabs.inquiry}</div>
    <div class="lz-form-tab" data-type="article">${i18n.tabs.article}</div>
  </div>

  <div id="pane-report" class="lz-form-body is-active">
     <div class="lz-field"><label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> お名前</label><input type="text" name="rep_name" class="lz-input" placeholder="ニックネーム可" required></div>
     <div class="lz-field"><label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> 内容</label><textarea name="rep_content" class="lz-textarea" rows="6" placeholder="町の発見を教えてください" required></textarea></div>
  </div>

  <div id="pane-inquiry" class="lz-form-body">
     <div class="lz-field"><label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> お名前</label><input type="text" name="inq_name" class="lz-input" required></div>
     <div class="lz-field"><label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> メールアドレス</label><input type="email" name="inq_email" class="lz-input" required></div>
     <div class="lz-field"><label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> 内容</label><textarea name="inq_content" class="lz-textarea" rows="6" required></textarea></div>
  </div>

  <div id="pane-article" class="lz-form-body">
    <div class="lz-section-head">${i18n.sections.category}</div>
    <div class="lz-field">
      <select name="art_type" id="art_type_select" class="lz-select">
        <option value="" selected>▼ 登録する内容を選択してください（未選択）</option>
        <option value="producer">${i18n.types.producer.label}</option>
        <option value="shop">${i18n.types.shop.label}</option>
        <option value="event">${i18n.types.event.label}</option>
        <option value="other">${i18n.types.other.label}</option>
      </select>
    </div>

    <div id="article-fields-container" style="display:none; flex-direction:column; gap:32px;">
      <div class="lz-section-head">${i18n.sections.basic}</div>
      <div class="lz-field"><label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> <span id="lbl-title"></span></label><input type="text" name="art_title" id="inp-title" class="lz-input" required></div>

      <div class="lz-field">
        <label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> <span id="lbl-dynamic-cat"></span></label>
        <div id="lz-dynamic-category-area"></div>
      </div>

      <div class="lz-field"><label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> <span id="lbl-lead"></span>（100文字以内）</label><textarea name="art_lead" class="lz-textarea" rows="2" maxlength="100" required></textarea></div>
      <div class="lz-field"><label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> 詳細本文</label><textarea name="art_body" class="lz-textarea" rows="8" required></textarea></div>
      
      <div id="box-writing-assist" class="lz-field" style="margin-top: -10px;">
        <label class="lz-checkbox-label"><input type="checkbox" id="chk-writing-assist" name="writing_assist" class="lz-checkbox-input">${i18n.common.assistLabel}</label>
        <div id="msg-writing-assist" style="display: none; color: #cf3a3a; font-size: 0.95rem; font-weight: 800; padding: 12px; background: #fff5f5; border-radius: 8px; border: 1px solid #ffcccc; line-height: 1.5;">${i18n.common.assistNote}</div>
      </div>

      <div class="lz-section-head">${i18n.sections.images}</div>
      <div class="lz-grid">
        <div class="lz-field"><label class="lz-label">画像（最大6枚）</label><div id="imgPreviewArea" class="lz-img-preview-grid"><div id="imgAddBtn" class="lz-img-add-btn">＋</div></div><input type="file" id="art_images_input" style="display:none;" accept="image/*" multiple></div>
        <div class="lz-field"><label class="lz-label"> 資料（PDF等）</label><input type="file" name="art_file" class="lz-input" accept=".pdf,.doc,.docx,.zip"></div>
      </div>

      <div class="lz-section-head">${i18n.sections.location}</div>
      <div id="ev-venue-box" class="lz-field" style="display:none;"><label class="lz-label"> 会場名</label><input type="text" name="ev_venue_name" class="lz-input"></div>
      <div class="lz-grid">
        <div class="lz-field"><label class="lz-label"><span id="zipBadge" class="lz-badge">${i18n.badges.required}</span> 郵便番号</label><div style="display:flex; gap:10px;"><input type="text" id="zipCode" name="shop_zip" class="lz-input" placeholder="389-1211" style="flex:1;"><button type="button" class="lz-zip-btn" id="zipBtnAction">${i18n.common.zipBtn}</button></div></div>
        <div class="lz-field"><label class="lz-label"><span id="addrBadge" class="lz-badge">${i18n.badges.required}</span> 住所</label><input type="text" id="addressField" name="shop_addr" class="lz-input" required></div>
      </div>
      <div class="lz-field"><label class="lz-label"><span id="lbl-notes"></span></label><textarea name="shop_notes" class="lz-textarea" rows="3" placeholder="注意事項があればご記入ください"></textarea></div>

      <div id="pane-shop-detail" class="lz-dynamic-detail" style="display:none;">
        <div class="lz-section-head" style="margin-top:0;">${i18n.sections.shop_detail}</div>
        <div class="lz-choice-grid" style="grid-template-columns: 1fr 1fr;">
          <label class="lz-choice-item"><input type="radio" name="shop_mode" value="simple" checked><span class="lz-choice-inner">標準設定</span></label>
          <label class="lz-choice-item"><input type="radio" name="shop_mode" value="custom"><span class="lz-choice-inner">曜日別設定</span></label>
        </div>
        <div id="shop-simple">
          <div class="lz-field"><label class="lz-label">営業曜日</label><div id="box-simple-days" class="lz-day-selector"></div></div>
          <div class="lz-field"><label class="lz-label">標準営業時間</label><div class="lz-time-row">
            <div class="lz-time-field"><span class="lz-time-label-sm">営業開始</span><div id="sel-simple-start" class="lz-time-box"></div></div>
            <div class="lz-time-field"><span class="lz-time-label-sm">営業終了</span><div id="sel-simple-end" class="lz-time-box"></div></div>
          </div></div>
        </div>
        <div id="shop-custom" style="display:none;"><div class="lz-schedule-container"><table class="lz-schedule-table"><thead><tr><th>曜日</th><th>休業</th><th>営業開始</th><th>営業終了</th></tr></thead><tbody id="customSchedBody"></tbody></table></div></div>
        <div class="lz-field"><label class="lz-label">祝日の営業</label><select name="shop_holiday_type" class="lz-select"><option value="">設定しない（未回答）</option><option value="follow_regular">曜日どおり営業 / 定休</option><option value="always_open">祝日は営業</option><option value="always_closed">祝日は休業</option><option value="irregular">不定休・特別ダイヤ</option></select></div>
      </div>

      <div id="pane-event-detail" class="lz-dynamic-detail" style="display:none;">
        <div class="lz-section-head" style="margin-top:0;">${i18n.sections.event_detail}</div>
        <div class="lz-field"><div class="lz-choice-grid" style="grid-template-columns: 1fr 1fr;">
          <label class="lz-choice-item"><input type="radio" name="ev_period_type" value="single" checked><span class="lz-choice-inner">1日のみ</span></label>
          <label class="lz-choice-item"><input type="radio" name="ev_period_type" value="period"><span class="lz-choice-inner">期間あり</span></label>
        </div></div>
        <div class="lz-grid">
          <div class="lz-field"><label class="lz-label">開催日（開始日）</label><input type="date" name="ev_sdate" class="lz-input"></div>
          <div class="lz-field" id="ev-end-date-box" style="display:none;"><label class="lz-label">終了日</label><input type="date" name="ev_edate" class="lz-input"></div>
        </div>
        <div class="lz-grid">
          <div class="lz-field"><label class="lz-label">開始時刻</label><div class="lz-time-row"><div class="lz-time-box" id="sel-ev-s"></div></div></div>
          <div class="lz-field"><label class="lz-label">終了時刻</label><div class="lz-time-row"><div class="lz-time-box" id="sel-ev-e"></div></div></div>
        </div>
        <div class="lz-section-head">${i18n.sections.event_more}</div>
        <div class="lz-field"><label class="lz-label">参加費</label><input type="text" name="ev_fee" class="lz-input" placeholder="無料、500円 など"></div>
        <div class="lz-field"><label class="lz-label">参加者のもちもの</label><input type="text" name="ev_items" class="lz-input" placeholder="筆記用具、室内履き など"></div>
        <div class="lz-field"><label class="lz-label">対象</label><input type="text" name="ev_target" class="lz-input" placeholder="町内在住の方、小学生以上 など"></div>
      </div>

      <div id="pane-producer-detail" class="lz-dynamic-detail" style="display:none;">
        <div class="lz-section-head">${i18n.sections.producer_detail}</div>
        <div class="lz-field"><label class="lz-label">栽培している品種</label><div id="area-apple-varieties" class="lz-choice-flex"></div><input type="text" id="pr-variety-other-input" name="pr_variety_other" class="lz-input" style="display:none; margin-top:8px;" placeholder="その他の品種を具体的に記入"></div>
        <div class="lz-field"><label class="lz-label">扱っている加工品</label><div id="area-apple-products" class="lz-choice-flex"></div><input type="text" id="pr-product-other-input" name="pr_product_other" class="lz-input" style="display:none; margin-top:8px;" placeholder="その他の加工品を具体的に記入"></div>
        <div class="lz-section-head" style="margin-top:0;">${i18n.sections.producer_biz}</div>
        <div class="lz-grid">
          <div class="lz-field"><label class="lz-label">作付面積（りんご）</label><div style="display:flex; gap:8px;"><input type="number" name="pr_area" class="lz-input" style="flex:1;"><select name="pr_area_unit" class="lz-select" style="width:100px;"><option value="a">a</option><option value="ha">ha</option><option value="反">反</option></select></div></div>
          <div class="lz-field"><label class="lz-label">従業員数</label><input type="number" name="pr_staff" class="lz-input"></div>
        </div>
        <div class="lz-field" style="margin-top:12px;"><label class="lz-label">りんご以外の栽培品目</label><div class="lz-choice-flex">
          <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="pr_other_crops" value="fruit" class="pr-crop-trigger"><span class="lz-choice-inner">りんご以外の果物</span></label>
          <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="pr_other_crops" value="vegetable" class="pr-crop-trigger"><span class="lz-choice-inner">野菜類</span></label>
          <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="pr_other_crops" value="other" class="pr-crop-trigger"><span class="lz-choice-inner">その他</span></label>
        </div>
        <input type="text" id="pr-crop-fruit-input" name="pr_crop_fruit_val" class="lz-input" style="display:none; margin-top:8px;" placeholder="具体的な果物名をご記入ください">
        <input type="text" id="pr-crop-veg-input" name="pr_crop_veg_val" class="lz-input" style="display:none; margin-top:8px;" placeholder="具体的な野菜名をご記入ください">
        </div>
        <div class="lz-grid" style="margin-top:12px;">
          <div class="lz-field"><label class="lz-label">代表者名</label><input type="text" name="pr_rep_name" class="lz-input"></div>
          <div class="lz-field"><label class="lz-label">インボイス登録</label><div class="lz-choice-grid" style="grid-template-columns: 1fr 1fr;">
            <label class="lz-choice-item"><input type="radio" name="pr_invoice" value="yes" class="pr-invoice-trigger"><span class="lz-choice-inner">登録あり</span></label>
            <label class="lz-choice-item"><input type="radio" name="pr_invoice" value="no" class="pr-invoice-trigger" checked><span class="lz-choice-inner">登録なし</span></label>
          </div></div>
        </div>
        <div id="pr-invoice-num-box" class="lz-field" style="display:none;"><label class="lz-label">登録番号</label><input type="text" name="pr_invoice_num" class="lz-input" placeholder="T1234567890123"></div>
      </div>

      <div id="box-sns-links" class="lz-field">
        <div class="lz-section-head">${i18n.sections.links}</div>
        <div class="lz-choice-flex">
          <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="home"><span class="lz-choice-inner">HP</span></label>
          <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="ig"><span class="lz-choice-inner">Instagram</span></label>
          <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="fb"><span class="lz-choice-inner">Facebook</span></label>
        </div>
        <div id="sns-inputs" style="display:flex; flex-direction:column; gap:12px; margin-top:15px;">
          <div id="f-home" style="display:none;"><input type="url" name="url_home" class="lz-input" placeholder="https://..."></div>
          <div id="f-ig" style="display:none;"><input type="text" name="sns_ig" class="lz-input" placeholder="@account"></div>
        </div>
      </div>

      <div class="lz-section-head" id="lbl-inquiry-head">${i18n.sections.inquiry_head}</div>
      <div id="ev-org-field" class="lz-field" style="display:none;"><label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> 主催者名</label><input type="text" name="ev_org_name" class="lz-input"></div>
      <div class="lz-field"><label class="lz-label">問い合わせ方法</label><div class="lz-choice-flex">
        <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cm" value="email"><span class="lz-choice-inner">メール</span></label>
        <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cm" value="tel"><span class="lz-choice-inner">電話番号</span></label>
      </div></div>
      <div id="cm-email-box" class="lz-field" style="display:none;"><label class="lz-label">掲載用メール</label><input type="email" id="pubEmail" name="cm_mail" class="lz-input"></div>
      
      <div class="lz-section-head">${i18n.sections.notes}</div>
      <div class="lz-field"><textarea name="art_memo" id="art_memo" class="lz-textarea" rows="3"></textarea></div>

      <div class="lz-private-boundary"><span class="lz-private-label">${i18n.sections.private_boundary}</span></div>
      <div class="lz-section-head">${i18n.sections.private_admin}</div>
      <div class="lz-field"><label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> 投稿者・団体名</label><input type="text" name="cont_name" class="lz-input" required></div>
      <div class="lz-field">
        <label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> 連絡用メール</label>
        <div id="syncField" style="display:none; margin-bottom:10px;"><label class="lz-choice-item"><input type="checkbox" id="syncCheck"><span class="lz-choice-inner">${i18n.common.syncLabel}</span></label></div>
        <input type="email" id="adminEmail" name="admin_email" class="lz-input" required>
      </div>
      <div class="lz-field"><label class="lz-label">事務局への連絡事項</label><textarea name="admin_msg" class="lz-textarea" rows="4"></textarea></div>

      <button type="submit" class="lz-send-btn">${i18n.common.sendBtn}</button>
    </div>
  </div>
</form>
`;