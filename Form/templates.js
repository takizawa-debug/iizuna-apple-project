/**
 * templates.js - フォーム構造定義（物理順序・逐次展開版）
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
        <div class="lz-choice-group-main">
          <label class="lz-choice-label"><input type="radio" name="art_type" value="shop"> お店の登録</label>
          <label class="lz-choice-label"><input type="radio" name="art_type" value="event"> イベントの登録</label>
          <label class="lz-choice-label"><input type="radio" name="art_type" value="other"> 記事（その他）の登録</label>
        </div>
      </div>

      <div id="article-fields-container" style="display:none; flex-direction:column; gap:28px;">
        
        <div class="lz-section-head">基本情報</div>
        <div class="lz-field">
          <label class="lz-label"><span class="lz-badge">必須</span> <span id="lbl-title">店名・施設名</span></label>
          <input type="text" name="art_title" id="inp-title" class="lz-input" required>
        </div>

        <div id="box-shop-cat" class="lz-field">
          <label class="lz-label"><span class="lz-badge">必須</span> この場所でできること（複数選択可）</label>
          <div class="lz-choice-group-main">
            <label class="lz-main-label"><input type="checkbox" name="cat_l1" value="飲食"> 飲食</label>
            <label class="lz-main-label"><input type="checkbox" name="cat_l1" value="買い物"> 直売・お土産・買い物</label>
            <label class="lz-main-label"><input type="checkbox" name="cat_l1" value="宿泊"> 宿泊・入浴</label>
            <label class="lz-main-label"><input type="checkbox" name="cat_l1" value="観光"> 遊ぶ・体験・観光</label>
            <label class="lz-main-label"><input type="checkbox" name="cat_l1" value="相談"> 相談・窓口・士業</label>
            <label class="lz-main-label"><input type="checkbox" name="cat_l1" value="産業"> 農業支援・建築・産業</label>
            <label class="lz-main-label"><input type="checkbox" name="cat_l1" value="暮らし"> 暮らし・公共・交通</label>
            <label class="lz-main-label"><input type="checkbox" name="cat_l1" value="大カテゴリその他" id="catRootOtherCheck"> その他</label>
          </div>
        </div>

        <div id="sub-eat" class="lz-dynamic-sub-area">
          <label class="lz-label">飲食のジャンル</label>
          <div class="lz-choice-group-sub">
            <label class="lz-sub-label"><input type="checkbox" name="cat_eat" value="カフェ"> カフェ</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_eat" value="ランチ"> ランチ</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_eat" value="そば"> そば</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_eat" value="ラーメン"> ラーメン</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_eat" value="イタリアン"> 洋食</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_eat" value="居酒屋"> 居酒屋</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_eat" value="パン"> スイーツ</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_eat" value="その他" class="lz-sub-trigger"> その他</label>
          </div>
          <input type="text" name="cat_eat_val" class="lz-input lz-sub-other-field" style="display:none;" placeholder="具体的な飲食ジャンルをご記入ください">
        </div>

        <div id="sub-buy" class="lz-dynamic-sub-area">
          <label class="lz-label">買い物・直売のジャンル</label>
          <div class="lz-choice-group-sub">
            <label class="lz-sub-label"><input type="checkbox" name="cat_buy" value="果物直売"> 果物直売</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_buy" value="野菜直売"> 野菜直売</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_buy" value="酒醸造"> 醸造所</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_buy" value="収穫体験"> 収穫体験</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_buy" value="和洋菓子"> 和洋菓子</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_buy" value="雑貨"> 雑貨・衣料</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_buy" value="生活"> 日用品</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_buy" value="その他" class="lz-sub-trigger"> その他</label>
          </div>
          <input type="text" name="cat_buy_val" class="lz-input lz-sub-other-field" style="display:none;" placeholder="具体的な販売内容をご記入ください">
        </div>

        <div id="sub-stay" class="lz-dynamic-sub-area">
          <label class="lz-label">宿泊・入浴のジャンル</label>
          <div class="lz-choice-group-sub">
            <label class="lz-sub-label"><input type="checkbox" name="cat_stay" value="温泉"> 温泉</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_stay" value="キャンプ"> キャンプ</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_stay" value="ホテル"> ホテル</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_stay" value="民泊"> 民泊</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_stay" value="サウナ"> サウナ</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_stay" value="その他" class="lz-sub-trigger"> その他</label>
          </div>
          <input type="text" name="cat_stay_val" class="lz-input lz-sub-other-field" style="display:none;" placeholder="具体的な宿泊形態をご記入ください">
        </div>

        <div id="sub-tour" class="lz-dynamic-sub-area">
          <label class="lz-label">観光・体験のジャンル</label>
          <div class="lz-choice-group-sub">
            <label class="lz-sub-label"><input type="checkbox" name="cat_tour" value="スキー"> スキー</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_tour" value="歴史"> 歴史施設</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_tour" value="案内"> 観光案内</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_tour" value="絶景"> 公園</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_tour" value="娯楽"> 娯楽</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_tour" value="体験"> ワークショップ</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_tour" value="その他" class="lz-sub-trigger"> その他</label>
          </div>
          <input type="text" name="cat_tour_val" class="lz-input lz-sub-other-field" style="display:none;" placeholder="具体的な体験内容をご記入ください">
        </div>

        <div id="sub-consult" class="lz-dynamic-sub-area">
          <label class="lz-label">相談・窓口のジャンル</label>
          <div class="lz-choice-group-sub">
            <label class="lz-sub-label"><input type="checkbox" name="cat_consult" value="移住"> 移住相談</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_consult" value="空き家"> 空き家相談</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_consult" value="農地"> 農地相談</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_consult" value="旅行"> 旅行相談</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_consult" value="士業"> 士業</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_consult" value="健康"> 健康相談</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_consult" value="経営"> 経営相談</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_consult" value="その他" class="lz-sub-trigger"> その他</label>
          </div>
          <input type="text" name="cat_consult_val" class="lz-input lz-sub-other-field" style="display:none;" placeholder="具体的な相談内容をご記入ください">
        </div>

        <div id="sub-industry" class="lz-dynamic-sub-area">
          <label class="lz-label">農業・産業のジャンル</label>
          <div class="lz-choice-group-sub">
            <label class="lz-sub-label"><input type="checkbox" name="cat_industry" value="農機具"> 農機具</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_industry" value="資材"> 資材・肥料</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_industry" value="設備"> 農業設備</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_industry" value="スマート"> スマート農業</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_industry" value="建築"> 建築工事</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_industry" value="製造"> 製造・加工</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_industry" value="その他" class="lz-sub-trigger"> その他</label>
          </div>
          <input type="text" name="cat_industry_val" class="lz-input lz-sub-other-field" style="display:none;" placeholder="具体的な業種をご記入ください">
        </div>

        <div id="sub-life" class="lz-dynamic-sub-area">
          <label class="lz-label">暮らし・公共のジャンル</label>
          <div class="lz-choice-group-sub">
            <label class="lz-sub-label"><input type="checkbox" name="cat_life" value="行政"> 公共施設</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_life" value="金融"> 金融機関</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_life" value="交通"> 交通機関</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_life" value="会議"> 会議室</label>
            <label class="lz-sub-label"><input type="checkbox" name="cat_life" value="その他" class="lz-sub-trigger"> その他</label>
          </div>
          <input type="text" name="cat_life_val" class="lz-input lz-sub-other-field" style="display:none;" placeholder="具体的な内容をご記入ください">
        </div>

        <div class="lz-field">
          <label class="lz-label"><span class="lz-badge">必須</span> <span id="lbl-lead">概要</span></label>
          <textarea name="art_lead" class="lz-textarea" rows="2" maxlength="100" required></textarea>
        </div>

        <div class="lz-field">
          <label class="lz-label"><span class="lz-badge">必須</span> 詳細本文</label>
          <textarea name="art_body" class="lz-textarea" rows="8" required></textarea>
        </div>

        <div class="lz-section-head">画像・配布資料</div>
        <div class="lz-grid">
          <div class="lz-field"><label class="lz-label"><span class="lz-badge opt" style="background:#999;">任意</span> 画像（最大6枚）</label><input type="file" name="art_images" class="lz-input" accept="image/*" multiple></div>
          <div class="lz-field"><label class="lz-label"><span class="lz-badge opt" style="background:#999;">任意</span> 配布資料（PDF等）</label><input type="file" name="art_file" class="lz-input" accept=".pdf,.doc,.docx,.zip"></div>
        </div>

        <div class="lz-section-head">場所の情報</div>
        <div class="lz-grid">
          <div class="lz-field">
            <label class="lz-label"><span class="lz-badge">必須</span> 郵便番号</label>
            <div style="display:flex; gap:10px;"><input type="text" id="zipCode" name="shop_zip" class="lz-input" placeholder="389-1211" style="flex:1;"><button type="button" class="lz-zip-btn" id="zipBtnAction">住所を検索</button></div>
          </div>
          <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> 住所</label><input type="text" id="addressField" name="shop_addr" class="lz-input" required></div>
        </div>

        <div id="pane-shop-detail" class="lz-dynamic-detail" style="display:none;">
          <div class="lz-section-head" style="margin-top:0;">営業時間・定休日</div>
          <div class="lz-choice-group-main">
            <label class="lz-choice-label"><input type="radio" name="shop_mode" value="simple" checked> 標準設定</label>
            <label class="lz-choice-label"><input type="radio" name="shop_mode" value="custom"> 曜日別に詳細設定</label>
          </div>
          <div id="shop-simple">
            <div class="lz-field"><label class="lz-label">営業曜日</label><div class="lz-choice-group-main" id="box-simple-days"></div></div>
            <div class="lz-field"><label class="lz-label">標準営業時間</label><div style="display:flex; align-items:center; gap:10px;" id="sel-simple-time"></div></div>
          </div>
          <div id="shop-custom" style="display:none;"><table class="lz-schedule-table"><thead><tr><th>曜日</th><th>休業</th><th>開店</th><th>閉店</th></tr></thead><tbody id="customSchedBody"></tbody></table></div>
          <div class="lz-field"><label class="lz-label">最新情報の案内（SNS等）</label><textarea name="shop_notes" class="lz-textarea" rows="2" placeholder="公式Instagramをご覧ください、等"></textarea></div>
        </div>

        <div id="pane-event-detail" class="lz-dynamic-detail" style="display:none;">
          <div class="lz-section-head" style="margin-top:0;">開催詳細</div>
          <div class="lz-grid">
            <div class="lz-field"><label class="lz-label">開始日</label><input type="date" name="ev_sdate" class="lz-input"></div>
            <div class="lz-field"><label class="lz-label">終了日</label><input type="date" name="ev_edate" class="lz-input"></div>
          </div>
          <div class="lz-grid">
            <div class="lz-field"><label class="lz-label">開始時刻</label><div class="lz-time-box" id="sel-ev-s"></div></div>
            <div class="lz-field"><label class="lz-label">終了時刻</label><div class="lz-time-box" id="sel-ev-e"></div></div>
          </div>
        </div>

        <div class="lz-section-head">問い合わせ・公開設定</div>
        <div class="lz-field">
          <div class="lz-choice-group-main">
            <label class="lz-choice-label"><input type="checkbox" name="cm" value="form"> 専用フォーム</label>
            <label class="lz-choice-label"><input type="checkbox" name="cm" value="email"> メール</label>
            <label class="lz-choice-label"><input type="checkbox" name="cm" value="tel"> 電話番号</label>
            <label class="lz-choice-label"><input type="checkbox" name="cm" value="other"> その他</label>
          </div>
        </div>
        <div id="cm-form-box" class="lz-field" style="display:none;"><label class="lz-label">フォームURL</label><input type="url" name="cm_url" class="lz-input"></div>
        <div id="cm-email-box" class="lz-field" style="display:none;"><label class="lz-label">掲載用メール</label><input type="email" id="pubEmail" name="cm_mail" class="lz-input"></div>
        <div id="cm-tel-box" class="lz-field" style="display:none;"><label class="lz-label">掲載用電話</label><input type="tel" name="cm_tel" class="lz-input" placeholder="026-..."></div>
        <div id="cm-other-box" class="lz-field" style="display:none;"><label class="lz-label">その他詳細</label><input type="text" name="cm_other_val" class="lz-input"></div>

        <div class="lz-section-head">事務局への連絡</div>
        <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> 投稿者・団体名</label><input type="text" name="cont_name" class="lz-input" required></div>
        <div class="lz-field"><label class="lz-label"><span class="lz-badge">必須</span> 連絡用メールアドレス</label><input type="email" id="adminEmail" name="admin_email" class="lz-input" required></div>
        <div class="lz-field" id="syncField" style="display:none;"><label class="lz-choice-label"><input type="checkbox" id="syncCheck" checked> 掲載用メールも同じにする</label></div>
        <div class="lz-field"><label class="lz-badge opt" style="background:#999;">非公開</label><textarea name="admin_msg" class="lz-textarea" rows="4" placeholder="事務局へのメッセージ"></textarea></div>

        <button type="submit" class="lz-send-btn" id="lzBtn">この内容で送信する</button>
      </div>
    </div>
  </form>
</div>
`;

// commonパーツは統合されたため空で維持（main.jsのエラー防止）
export const formCommonHTML = ``;