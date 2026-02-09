export const utils = {
  /** 10分刻みの時間セレクター生成 */
  createTimeSelectorHTML(prefix) {
    let h = `<select name="${prefix}_h" class="lz-time-select"><option value="">時</option>`;
    for (let i = 0; i < 24; i++) h += `<option value="${String(i).padStart(2, '0')}">${i}</option>`;
    h += `</select><span>:</span><select name="${prefix}_m" class="lz-time-select"><option value="">分</option>`;
    for (let i = 0; i < 60; i += 10) h += `<option value="${String(i).padStart(2, '0')}">${String(i).padStart(2, '0')}</option>`;
    return h + `</select>`;
  },

  /** 郵便番号API検索 */
  async fetchAddress(zip) {
    const cleanZip = zip.replace(/-/, '');
    if (cleanZip.length !== 7) throw new Error('郵便番号を7桁で入力してください');
    const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanZip}`);
    const data = await res.json();
    if (!data.results) throw new Error('住所が見つかりませんでした');
    return data.results[0].address1 + data.results[0].address2 + data.results[0].address3;
  }
};