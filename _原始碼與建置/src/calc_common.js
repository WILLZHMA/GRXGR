'use strict';
/* 共用計算：價格、面積／產量、今日提醒（所有版本都會用到） */
const SIZE_SUM = MARKETS.reduce((s, m) => s + m.size, 0);
const natPrice = (c, dn) => MARKETS.reduce((s, m) => s + avgPrice(c, m, dn) * m.size, 0) / SIZE_SUM;
const refPrice = c => memoize('ref' + c.id, () => { let s = 0, n = 0; for (let i = 0; i < 364; i += 7) { s += natPrice(c, TODAY_DN - i); n++; } return s / n; });
const idxC = (c, dn) => natPrice(c, dn) / refPrice(c) * 100;
const avgOver = (f, end, n) => { let s = 0; for (let i = 0; i < n; i++) s += f(end - i); return s / n; };
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const sd = a => { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) ** 2))); };

function signalRows() {
  return memoize('sg' + TODAY_DN, () => CROPS.map(c => {
    const now = avgOver(d => natPrice(c, d), TODAY_DN, 7), base = avgOver(d => natPrice(c, d), TODAY_DN - 7, 90);
    const v7 = avgOver(d => totalVol(c, d), TODAY_DN, 7), v28 = avgOver(d => totalVol(c, d), TODAY_DN - 7, 28);
    const dev = now / base - 1, dv = v7 / v28 - 1;
    const lvl = Math.abs(dev) >= .18 ? 'alert' : Math.abs(dev) >= .08 ? 'warn' : 'ok';
    const title = Math.abs(dev) < .03 ? `${c.name}價格接近近三個月均值` : dev > 0 ? `${c.name}價格高於近三個月均值` : `${c.name}價格低於近三個月均值`;
    const vtxt = dv >= .12 ? '，交易量回升' : dv <= -.12 ? '，交易量減少' : '';
    return { c, dev, dv, lvl, title, sub: `偏離 ${dev >= 0 ? '+' : '−'}${Math.abs(dev * 100).toFixed(1)}%${vtxt}` };
  }).sort((a, b) => Math.abs(b.dev) - Math.abs(a.dev)));
}
function marketRows(c) {
  return MARKETS.map(m => { const dn = tradeDn(m), q = quote(c, m, dn); return { m, q, closed: isClosed(m), dn }; });
}
function bestMarket(c) {
  const rows = marketRows(c).filter(r => !r.closed).sort((a, b) => b.q.avg - a.q.avg); return rows[0];
}
function cheapRows() {
  return memoize('ch' + TODAY_DN, () => signalRows().slice().sort((a, b) => a.dev - b.dev));
}
function priceSeries(c, m, range) {
  const end = tradeDn(m), step = range <= 30 ? 1 : range <= 90 ? 1 : 3, pts = Math.floor(range / step), x = [], a = [], all = [], ly = [];
  for (let j = pts - 1; j >= 0; j--) {
    const dn = end - j * step; x.push(fmtMD(dateOf(dn)));
    a.push(+f1(avgOver(d => avgPrice(c, m, d), dn, step)));
    all.push(+f1(avgOver(d => natPrice(c, d), dn, step)));
    ly.push(+f1(avgOver(d => avgPrice(c, m, d), dn - 365, step)));
  }
  return { x, a, all, ly };
}

const YPH = { garlic: 10500, cabbage: 31000, napa: 36000, peanut: 2600, lettuce: 21000, bamboo: 9000, rice: 6200, corn: 7500, onion: 38000, tea: 1500, citrus: 20000, melon: 28000, banana: 22000, mango: 9000 };
const prodT = (crop, county, year) => Math.round(areaHa(crop, county, year) * YPH[crop] * (.92 + hash(crop, county, year, 'y') * .16) / 1000);
const natProd = (crop, year = STAT_YEAR) => memoize(`np|${crop}|${year}`, () => COUNTIES.reduce((s, c) => s + prodT(crop, c, year), 0));
function countyRank(crop) {
  return memoize('cr' + crop, () => COUNTIES.map(c => ({ c, ha: areaHa(crop, c, STAT_YEAR), t: prodT(crop, c, STAT_YEAR) })).sort((a, b) => b.ha - a.ha).map((r, i) => (r.rank = i + 1, r)));
}
const STATS_CROPS = EXT;   // 面積頁可選全部 14 種

function dailyTip() {
  const al = alertsFor(S.region).filter(a => a.status !== 'cancelled');
  const fc = forecast(S.region)[0];
  if (al.length) { const a = al[0]; return { label: '今日小提醒', h: `${a.T.name}：${a.T.tip}`, p: `${a.T.desc} 天氣資訊僅供參考，請以所在地即時預報與主管機關公告為準。` }; }
  if (fc.pop >= 60) return { label: '今日小提醒', h: '午後降雨可能影響採收與運輸', p: '若預計今天採收，建議先確認田區排水與出貨安排。天氣資訊僅供參考，請以所在地即時預報為準。' };
  return { label: '今日小提醒', h: '天氣大致穩定，適合戶外作業', p: '中午前後氣溫較高時，請調整作業時間並補充水分。天氣資訊僅供參考，請以所在地即時預報為準。' };
}

