'use strict';
/* 政策者專用計算：價格指數、市場訊號、區域供應 */
const GROUPS = [
  { id: 'leaf', name: '葉菜類', crops: ['cabbage', 'napa', 'lettuce'] },
  { id: 'root', name: '辛香根莖', crops: ['garlic'] },
  { id: 'misc', name: '雜糧與筍', crops: ['peanut', 'bamboo'] },
];
const VOLW = CROPS.reduce((s, c) => s + c.vol, 0);
const idxAllDay = dn => memoize('ia' + dn, () => CROPS.reduce((s, c) => s + idxC(c, dn) * c.vol, 0) / VOLW);
const idxGroup = (g, dn) => g.crops.reduce((s, id) => s + idxC(CROP[id], dn), 0) / g.crops.length;
const volAll = dn => memoize('va' + dn, () => CROPS.reduce((s, c) => s + totalVol(c, dn), 0) / 1000);   // 公噸／日
function policyKpis() {
  return memoize('pk' + TODAY_DN, () => {
    const i7 = avgOver(idxAllDay, TODAY_DN, 7), i7p = avgOver(idxAllDay, TODAY_DN - 7, 7);
    const v7 = avgOver(volAll, TODAY_DN, 7), v7p = avgOver(volAll, TODAY_DN - 7, 7);
    const a1 = CROPS.reduce((s, c) => s + natHa(c.id), 0), a0 = CROPS.reduce((s, c) => s + natHa(c.id, STAT_YEAR - 1), 0);
    const chg = (from) => Array.from({ length: 30 }, (_, i) => Math.log(idxAllDay(from - i) / idxAllDay(from - i - 1)));
    const s1 = sd(chg(TODAY_DN)), s0 = sd(chg(TODAY_DN - 30));
    const lvl = s => s < .007 ? '低' : s < .012 ? '中低' : s < .02 ? '中' : '高';
    return { idx: i7, idxChg: i7 / i7p - 1, vol: v7, volChg: v7 / v7p - 1, area: a1, areaChg: a1 / a0 - 1, vlt: lvl(s1), vltChg: s1 / s0 - 1, s1 };
  });
}
function rankRows() {
  return memoize('rk' + TODAY_DN, () => CROPS.map(c => {
    const n7 = avgOver(d => natPrice(c, d), TODAY_DN, 7), p7 = avgOver(d => natPrice(c, d), TODAY_DN - 7, 7);
    return { c, now: n7, chg: n7 / p7 - 1 };
  }).sort((a, b) => b.chg - a.chg));
}
const REGION_G = {
  '臺北市': '北部', '新北市': '北部', '基隆市': '北部', '桃園市': '北部', '新竹市': '北部', '新竹縣': '北部', '宜蘭縣': '北部',
  '苗栗縣': '中部', '臺中市': '中部', '彰化縣': '中部', '南投縣': '中部', '雲林縣': '中部',
  '嘉義市': '南部', '嘉義縣': '南部', '臺南市': '南部', '高雄市': '南部', '屏東縣': '南部',
  '花蓮縣': '東部及離島', '臺東縣': '東部及離島', '澎湖縣': '東部及離島', '金門縣': '東部及離島', '連江縣': '東部及離島',
};
const REGION_ORDER = ['中部', '南部', '北部', '東部及離島'];
function regionShares(ids) {
  const sum = {}; let tot = 0;
  COUNTIES.forEach(co => { const ha = ids.reduce((s, id) => s + areaHa(id, co, STAT_YEAR), 0); sum[REGION_G[co]] = (sum[REGION_G[co]] || 0) + ha; tot += ha; });
  return REGION_ORDER.map(g => ({ g, share: sum[g] / tot })).sort((a, b) => b.share - a.share);
}
function indexSeries(range, kind) {   // kind: 'all' 或 GROUPS
  const step = range <= 30 ? 1 : range <= 180 ? 6 : 12, pts = Math.floor(range / step), x = [];
  const arr = GROUPS.map(() => []);
  for (let j = pts - 1; j >= 0; j--) {
    const end = TODAY_DN - j * step; x.push(fmtMD(dateOf(end)));
    GROUPS.forEach((g, gi) => arr[gi].push(+avgOver(d => idxGroup(g, d), end, step).toFixed(1)));
  }
  return { x, arr };
}

