/**
 * templates.js - 構造定義（Skeleton 完全準拠版）
 * 役割：純粋なHTML構造の定義。テキストはすべて i18n.js から取得する。
 */
import { i18n } from './i18n.js';

export const catLabels = {
  shop: i18n.types.shop.catLabel,
  event: i18n.types.event.catLabel,
  farmer: i18n.types.farmer.catLabel,
  other: i18n.types.other.catLabel
};

export const uiComponents = `
<div id="lz-confirm-overlay" class="lz-modal-overlay">
  <div class="lz-modal">
    <div class="lz-modal-h">入力内容の確認</div>
    <div id="lz-confirm-body" class="lz-modal-body"></div>
    <div class="lz-modal-btns">
      <button type="button" id="lz-btn-back" class="lz-zip-btn" style="background:#aaa;">修正する</button>
      <button type="button" id="lz-btn-go" class="lz-zip-btn">送信する</button>
    </div>
  </div>
</div>

<div id="lz-progress-overlay" class="lz-progress-overlay">
  <div class="lz-progress-card">
    <div id="lz-progress-text" class="lz-progress-text">準備中...</div>
    <div class="lz-progress-bar-bg"><div id="lz-progress-fill"></div></div>
  </div>
</div>
`;

export const getFormHTML = () => `
<form id="lz-article-form" class="lz-form-wrap">
  <div class="lz-form-tabs">
    <div class="lz-form-tab is-active" data-type="report">${i18n.tabs.report}</div>
    <div class="lz-form-tab" data-type="inquiry">${i18n.tabs.inquiry}</div>
    <div class="lz-form-tab" data-type="article">${i18n.tabs.article}</div>
  </div>

  <div id="pane-report" class="lz-form-body is-active">
     <div class="lz-field"><label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> ${i18n.labels.name}</label><input type="text" name="rep_name" class="lz-input" placeholder="${i18n.placeholders.rep_name}" required></div>
     <div class="lz-field"><label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> ${i18n.labels.content}</label><textarea name="rep_content" class="lz-textarea" rows="6" placeholder="${i18n.placeholders.rep_content}" required></textarea></div>
  </div>

  <div id="pane-inquiry" class="lz-form-body">
     <div class="lz-field"><label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> ${i18n.labels.name}</label><input type="text" name="inq_name" class="lz-input" required></div>
     <div class="lz-field"><label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> ${i18n.labels.email}</label><input type="email" name="inq_email" class="lz-input" required></div>
     <div class="lz-field"><label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> ${i18n.labels.content}</label><textarea name="inq_content" class="lz-textarea" rows="6" required></textarea></div>
  </div>

  <div id="pane-article" class="lz-form-body">
    <div class="lz-section-head">${i18n.sections.category}</div>
    <div class="lz-field">
      <select name="art_type" id="art_type_select" class="lz-select">
        <option value="" selected>${i18n.placeholders.art_type_unselected}</option>
        <option value="farmer">${i18n.types.farmer.label}</option>
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

      <div class="lz-field"><label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> <span id="lbl-lead"></span>${i18n.labels.limit_100}</label><textarea name="art_lead" class="lz-textarea" rows="2" maxlength="100" placeholder="${i18n.placeholders.art_lead}" required></textarea></div>
      <div class="lz-field"><label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> ${i18n.labels.art_body}</label><textarea name="art_body" class="lz-textarea" rows="8" placeholder="${i18n.placeholders.art_body}" required></textarea></div>
      
      <div id="box-writing-assist" class="lz-field" style="margin-top: -10px;">
        <label class="lz-checkbox-label">
          <input type="checkbox" id="chk-writing-assist" name="writing_assist" class="lz-checkbox-input">
          ${i18n.common.assistLabel}
        </label>
        <div id="msg-writing-assist" style="display: none; color: #cf3a3a; font-size: 0.95rem; font-weight: 800; padding: 12px; background: #fff5f5; border-radius: 8px; border: 1px solid #ffcccc; line-height: 1.5;">
          ${i18n.common.assistNote}
        </div>
      </div>

      <div class="lz-section-head">${i18n.sections.images}</div>
      <div class="lz-grid">
        <div class="lz-field"><label class="lz-label"><span class="lz-badge opt">${i18n.badges.optional}</span> ${i18n.labels.art_images}</label><div id="imgPreviewArea" class="lz-img-preview-grid"><div id="imgAddBtn" class="lz-img-add-btn">＋</div></div><input type="file" id="art_images_input" style="display:none;" accept="image/*" multiple></div>
        <div class="lz-field"><label class="lz-label"> ${i18n.labels.art_file}</label><input type="file" name="art_file" class="lz-input" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"></div>
      </div>

      <div class="lz-section-head">${i18n.sections.location}</div>
      <div id="ev-venue-box" class="lz-field" style="display:none;">
        <label class="lz-label"> ${i18n.labels.ev_venue_name}</label>
        <input type="text" name="ev_venue_name" class="lz-input" placeholder="${i18n.placeholders.ev_venue}">
      </div>

      <div class="lz-grid">
        <div class="lz-field">
          <label class="lz-label"><span id="zipBadge" class="lz-badge">${i18n.badges.required}</span> ${i18n.labels.zip}</label>
          <div style="display:flex; gap:10px;"><input type="text" id="zipCode" name="shop_zip" class="lz-input" placeholder="${i18n.placeholders.zip}" style="flex:1;"><button type="button" class="lz-zip-btn" id="zipBtnAction">${i18n.common.zipBtn}</button></div>
        </div>
        <div class="lz-field">
          <label class="lz-label"><span id="addrBadge" class="lz-badge">${i18n.badges.required}</span> ${i18n.labels.address}</label>
          <input type="text" id="addressField" name="shop_addr" class="lz-input" required>
        </div>
      </div>

      <div class="lz-field">
        <label class="lz-label">
          <span id="lbl-notes"></span> </label>
        <textarea name="shop_notes" class="lz-textarea" rows="3" placeholder="${i18n.placeholders.shop_notes}"></textarea>
      </div>

      <div id="pane-shop-detail" class="lz-dynamic-detail" style="display:none;">
        <div class="lz-section-head" style="margin-top:0;">${i18n.sections.shop_detail}</div>
        <div class="lz-choice-grid" style="grid-template-columns: 1fr 1fr;">
          <label class="lz-choice-item"><input type="radio" name="shop_mode" value="simple" checked><span class="lz-choice-inner">${i18n.options.mode_simple}</span></label>
          <label class="lz-choice-item"><input type="radio" name="shop_mode" value="custom"><span class="lz-choice-inner">${i18n.options.mode_custom}</span></label>
        </div>
        
        <div id="shop-simple">
          <div class="lz-field"><label class="lz-label">${i18n.labels.biz_days}</label><div id="box-simple-days" class="lz-day-selector"></div></div>
          <div class="lz-field">
            <label class="lz-label">${i18n.labels.std_biz_hours}</label>
            <div class="lz-time-row">
              <div class="lz-time-field"><span class="lz-time-label-sm">${i18n.labels.open_time}</span><div id="sel-simple-start" class="lz-time-box"></div></div>
              <div class="lz-time-field"><span class="lz-time-label-sm">${i18n.labels.close_time}</span><div id="sel-simple-end" class="lz-time-box"></div></div>
            </div>
          </div>
        </div>

        <div id="shop-custom" style="display:none;">
          <div class="lz-schedule-container">
            <table class="lz-schedule-table">
              <thead><tr><th>${i18n.labels.day}</th><th>${i18n.labels.closed}</th><th>${i18n.labels.open_time}</th><th>${i18n.labels.close_time}</th></tr></thead>
              <tbody id="customSchedBody"></tbody>
            </table>
          </div>
        </div>

        <div class="lz-field">
          <label class="lz-label">${i18n.labels.holiday_biz}</label>
          <select name="shop_holiday_type" class="lz-select">
            <option value="">${i18n.options.holiday_none}</option>
            <option value="follow_regular">${i18n.options.holiday_follow}</option>
            <option value="always_open">${i18n.options.holiday_open}</option>
            <option value="always_closed">${i18n.options.holiday_closed}</option>
            <option value="irregular">${i18n.options.holiday_irregular}</option>
          </select>
        </div>
        <div class="lz-field"><label class="lz-label">${i18n.labels.shop_biz_notes}</label><textarea name="shop_notes_biz" class="lz-textarea" rows="3" placeholder="${i18n.placeholders.shop_biz_notes}"></textarea></div>
      </div>

      <div id="pane-event-detail" class="lz-dynamic-detail" style="display:none;">
        <div class="lz-section-head" style="margin-top:0;">${i18n.sections.event_detail}</div>
        <div class="lz-field">
          <div class="lz-choice-grid" style="grid-template-columns: 1fr 1fr;">
            <label class="lz-choice-item"><input type="radio" name="ev_period_type" value="single" checked><span class="lz-choice-inner">${i18n.options.period_single}</span></label>
            <label class="lz-choice-item"><input type="radio" name="ev_period_type" value="period"><span class="lz-choice-inner">${i18n.options.period_range}</span></label>
          </div>
        </div>
        <div class="lz-grid">
          <div class="lz-field"><label class="lz-label">${i18n.labels.ev_sdate}</label><input type="date" name="ev_sdate" class="lz-input"></div>
          <div class="lz-field" id="ev-end-date-box" style="display:none;"><label class="lz-label">${i18n.labels.ev_edate}</label><input type="date" name="ev_edate" class="lz-input"></div>
        </div>
        <div class="lz-grid">
          <div class="lz-field"><label class="lz-label">${i18n.labels.ev_stime}</label><div class="lz-time-row"><div class="lz-time-box" id="sel-ev-s"></div></div></div>
          <div class="lz-field"><label class="lz-label">${i18n.labels.ev_etime}</label><div class="lz-time-row"><div class="lz-time-box" id="sel-ev-e"></div></div></div>
        </div>

        <div class="lz-section-head">${i18n.sections.event_more}</div>
        <div class="lz-field"><label class="lz-label">${i18n.labels.ev_fee}</label><input type="text" name="ev_fee" class="lz-input" placeholder="${i18n.placeholders.ev_fee}"></div>
        <div class="lz-field"><label class="lz-label">${i18n.labels.ev_items}</label><input type="text" name="ev_items" class="lz-input" placeholder="${i18n.placeholders.ev_items}"></div>
        <div class="lz-field"><label class="lz-label">${i18n.labels.ev_target}</label><input type="text" name="ev_target" class="lz-input" placeholder="${i18n.placeholders.ev_target}"></div>
      </div>

      <div id="pane-farmer-detail" class="lz-dynamic-detail" style="display:none;">
        <div class="lz-section-head">${i18n.sections.producer_head}</div>
        <div class="lz-field">
          <label class="lz-label">${i18n.labels.pr_varieties}</label>
          <div id="area-apple-varieties" class="lz-choice-flex"></div>
          <input type="text" id="pr-variety-other-input" name="pr_variety_other" class="lz-input" style="display:none; margin-top:8px;" placeholder="${i18n.placeholders.pr_variety}">
        </div>
        <div class="lz-field">
          <label class="lz-label">${i18n.labels.pr_products}</label>
          <div id="area-apple-products" class="lz-choice-flex"></div>
          <input type="text" id="pr-product-other-input" name="pr_product_other" class="lz-input" style="display:none; margin-top:8px;" placeholder="${i18n.placeholders.pr_product}">
        </div>

        <div class="lz-section-head" style="margin-top:0;">${i18n.sections.producer_biz}</div>
        <div class="lz-grid">
          <div class="lz-field"><label class="lz-label">${i18n.labels.pr_area}</label>
            <div style="display:flex; gap:8px;">
              <input type="number" name="pr_area" class="lz-input" style="flex:1;" placeholder="${i18n.placeholders.pr_area}">
              <select name="pr_area_unit" class="lz-select" style="width:100px;">
                <option value="a">${i18n.options.unit_a}</option>
                <option value="ha">${i18n.options.unit_ha}</option>
                <option value="反">${i18n.options.unit_tan}</option>
                <option value="町">${i18n.options.unit_cho}</option>
                <option value="㎡">${i18n.options.unit_m2}</option>
                <option value="坪">${i18n.options.unit_tsubo}</option>
              </select>
            </div>
          </div>
          <div class="lz-field"><label class="lz-label">${i18n.labels.pr_staff}</label><input type="number" name="pr_staff" class="lz-input" placeholder="${i18n.placeholders.pr_staff}"></div>
        </div>

        <div class="lz-field" style="margin-top:12px;">
          <label class="lz-label">${i18n.labels.pr_other_crops}</label>
          <div class="lz-choice-flex">
            <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="pr_other_crops" value="fruit" class="pr-crop-trigger"><span class="lz-choice-inner">${i18n.options.crop_fruit}</span></label>
            <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="pr_other_crops" value="rice"><span class="lz-choice-inner">${i18n.options.crop_rice}</span></label>
            <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="pr_other_crops" value="soba"><span class="lz-choice-inner">${i18n.options.crop_soba}</span></label>
            <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="pr_other_crops" value="vegetable" class="pr-crop-trigger"><span class="lz-choice-inner">${i18n.options.crop_veg}</span></label>
            <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="pr_other_crops" value="other" class="pr-crop-trigger"><span class="lz-choice-inner">${i18n.options.crop_other}</span></label>
          </div>
          <input type="text" id="pr-crop-fruit-input" name="pr_crop_fruit_val" class="lz-input" style="display:none; margin-top:8px;" placeholder="${i18n.placeholders.pr_fruit}">
          <input type="text" id="pr-crop-veg-input" name="pr_crop_veg_val" class="lz-input" style="display:none; margin-top:8px;" placeholder="${i18n.placeholders.pr_veg}">
          <input type="text" id="pr-crop-other-input" name="pr_crop_other_val" class="lz-input" style="display:none; margin-top:8px;" placeholder="${i18n.placeholders.pr_other}">
        </div>

        <div class="lz-grid" style="margin-top:12px;">
          <div class="lz-field">
            <label class="lz-label">${i18n.labels.pr_biz_type}</label>
            <div class="lz-choice-grid" style="grid-template-columns: 1fr 1fr;">
              <label class="lz-choice-item"><input type="radio" name="pr_ent_type" value="individual" checked><span class="lz-choice-inner">${i18n.options.pr_biz_indiv}</span></label>
              <label class="lz-choice-item"><input type="radio" name="pr_ent_type" value="corp"><span class="lz-choice-inner">${i18n.options.pr_biz_corp}</span></label>
            </div>
          </div>
          <div class="lz-field">
            <label class="lz-label">${i18n.labels.pr_rep_name}</label>
            <input type="text" name="pr_rep_name" class="lz-input" placeholder="${i18n.placeholders.pr_rep}">
          </div>
        </div>
        
        <div class="lz-grid" style="margin-top:12px;">
          <div class="lz-field">
            <label class="lz-label">${i18n.labels.pr_invoice}</label>
            <div class="lz-choice-grid" style="grid-template-columns: 1fr 1fr;">
              <label class="lz-choice-item"><input type="radio" name="pr_invoice" value="yes" class="pr-invoice-trigger"><span class="lz-choice-inner">${i18n.options.invoice_yes}</span></label>
              <label class="lz-choice-item"><input type="radio" name="pr_invoice" value="no" class="pr-invoice-trigger" checked><span class="lz-choice-inner">${i18n.options.invoice_no}</span></label>
            </div>
          </div>
          <div id="pr-invoice-num-box" class="lz-field" style="display:none;">
            <label class="lz-label">${i18n.labels.pr_invoice_num}</label>
            <input type="text" name="pr_invoice_num" class="lz-input" placeholder="${i18n.placeholders.pr_invoice}">
          </div>
        </div>
      </div>

      <div id="box-sns-links" class="lz-field">
        <div class="lz-section-head">${i18n.sections.links}</div>
        <div class="lz-choice-flex">
          <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="home"><span class="lz-choice-inner">${i18n.options.sns_home}</span></label>
          <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="ec"><span class="lz-choice-inner">${i18n.options.sns_ec}</span></label>
          <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="rel"><span class="lz-choice-inner">${i18n.options.sns_rel}</span></label>
          <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="ig"><span class="lz-choice-inner">${i18n.options.sns_ig}</span></label>
          <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="fb"><span class="lz-choice-inner">${i18n.options.sns_fb}</span></label>
          <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="x"><span class="lz-choice-inner">${i18n.options.sns_x}</span></label>
          <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="line"><span class="lz-choice-inner">${i18n.options.sns_line}</span></label>
          <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="sns_trigger" value="tt"><span class="lz-choice-inner">${i18n.options.sns_tt}</span></label>
        </div>

        <div id="sns-inputs" style="display:flex; flex-direction:column; gap:12px; margin-top:15px;">
          <div id="f-home" style="display:none;"><input type="url" name="url_home" class="lz-input" placeholder="${i18n.placeholders.url_prefix} ${i18n.placeholders.url_hint}"></div>
          <div id="f-ec" style="display:none;"><input type="url" name="url_ec" class="lz-input" placeholder="${i18n.placeholders.url_prefix_ec} ${i18n.placeholders.url_hint}"></div>
          <div id="f-rel" style="display:none; flex-direction:column; gap:12px;">
            <div class="lz-grid"><input type="url" id="rel_url1" name="rel_url1" class="lz-input" placeholder="${i18n.placeholders.rel_url} 1 ${i18n.placeholders.url_hint}"><input type="text" id="rel_title1" name="rel_title1" class="lz-input" placeholder="${i18n.placeholders.rel_title} 1"></div>
            <div id="rel-link2-row" class="lz-grid" style="display:none;"><input type="url" id="rel_url2" name="rel_url2" class="lz-input" placeholder="${i18n.placeholders.rel_url} 2 ${i18n.placeholders.url_hint}"><input type="text" id="rel_title2" name="rel_title2" class="lz-input" placeholder="${i18n.placeholders.rel_title} 2"></div>
          </div>
          <div id="f-ig" style="display:none;"><input type="text" name="sns_ig" class="lz-input" placeholder="${i18n.placeholders.sns_ig}"></div>
          <div id="f-fb" style="display:none;"><input type="text" name="sns_fb" class="lz-input" placeholder="${i18n.placeholders.sns_fb}"></div>
          <div id="f-x" style="display:none;"><input type="text" name="sns_x" class="lz-input" placeholder="${i18n.placeholders.sns_x}"></div>
          <div id="f-line" style="display:none;"><input type="text" name="sns_line" class="lz-input" placeholder="${i18n.placeholders.sns_line}"></div>
          <div id="f-tt" style="display:none;"><input type="text" name="sns_tt" class="lz-input" placeholder="${i18n.placeholders.sns_tt}"></div>
        </div>
      </div>

      <div class="lz-section-head" id="lbl-inquiry-head">${i18n.sections.inquiry_head}</div>
      <div id="ev-org-field" class="lz-field" style="display:none;"><label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> ${i18n.labels.ev_org_name}</label><input type="text" name="ev_org_name" class="lz-input" placeholder="${i18n.placeholders.ev_org}"></div>
      <div class="lz-field">
        <label class="lz-label">${i18n.labels.cm_method}</label>
        <div class="lz-choice-flex">
          <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cm" value="form"><span class="lz-choice-inner">${i18n.options.cm_form}</span></label>
          <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cm" value="email"><span class="lz-choice-inner">${i18n.options.cm_email}</span></label>
          <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cm" value="tel"><span class="lz-choice-inner">${i18n.options.cm_tel}</span></label>
          <label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cm" value="other"><span class="lz-choice-inner">${i18n.options.cm_other}</span></label>
        </div>
      </div>

      <div id="cm-form-box" class="lz-field" style="display:none;"><label class="lz-label">${i18n.labels.cm_url}</label><input type="url" name="cm_url" class="lz-input" placeholder="${i18n.placeholders.url_hint}"></div>
      <div id="cm-email-box" class="lz-field" style="display:none;"><label class="lz-label">${i18n.labels.cm_mail}</label><input type="email" id="pubEmail" name="cm_mail" class="lz-input" placeholder="${i18n.placeholders.cm_mail}"></div>
      <div id="cm-tel-box" class="lz-field" style="display:none;"><label class="lz-label">${i18n.labels.cm_tel}</label><input type="tel" name="cm_tel" class="lz-input" placeholder="${i18n.placeholders.cm_tel}"></div>
      <div id="cm-other-box" class="lz-field" style="display:none;"><label class="lz-label">${i18n.labels.cm_other}</label><input type="text" name="cm_other_val" class="lz-input" placeholder="${i18n.placeholders.cm_other}"></div>

      <div class="lz-field"><label class="lz-label"> ${i18n.labels.cm_notes}</label><textarea name="cm_notes" class="lz-textarea" rows="2" placeholder="${i18n.placeholders.cm_notes}"></textarea></div>

      <div class="lz-section-head">${i18n.sections.notes_head}</div>
      <div class="lz-field"><label class="lz-label"> ${i18n.labels.art_memo}</label><textarea name="art_memo" id="art_memo" class="lz-textarea" rows="3" placeholder="${i18n.placeholders.art_memo}"></textarea></div>

      <div class="lz-private-boundary"><span class="lz-private-label">${i18n.sections.private_boundary}</span></div>
      <div class="lz-section-head">${i18n.sections.private_admin}</div>
      <div class="lz-field"><label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> ${i18n.labels.cont_name}</label><input type="text" name="cont_name" class="lz-input" required></div>
      <div class="lz-field">
        <label class="lz-label"><span class="lz-badge">${i18n.badges.required}</span> ${i18n.labels.admin_email}</label>
        <div id="syncField" style="display:none; margin-bottom: 10px;"><label class="lz-choice-item" style="width:fit-content;"><input type="checkbox" id="syncCheck"><span class="lz-choice-inner" style="min-height:36px; padding:4px 16px; font-size:1rem; border-radius:20px;">${i18n.common.syncLabel}</span></label></div>
        <input type="email" id="adminEmail" name="admin_email" class="lz-input" required placeholder="${i18n.placeholders.admin_email}">
      </div>
      <div class="lz-field"><label class="lz-label"><span class="lz-badge opt">${i18n.badges.private}</span> ${i18n.labels.admin_msg}</label><textarea name="admin_msg" class="lz-textarea" rows="4"></textarea></div>

      <button type="submit" class="lz-send-btn" id="lzBtn">${i18n.common.sendBtn}</button>
    </div>
  </div>
</form>
\${uiComponents} 
`;

export const formCommonHTML = ``;

