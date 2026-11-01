'use strict';
/* 研究者專用計算：相關、領先落後、集中度、分組比較 */
function rsSeries(ids, months) {
  return memoize(`rs|${ids.join()}|${months}|${TODAY_DN}`, () => {
    const out = { x: [], price: [], vol: [] };
    for (let k = months - 1; k >= 0; k--) {
      const d0 = new Date(TODAY.getFullYear(), TODAY.getMonth() - k, 1), last = new Date(d0.getFullYear(), d0.getMonth() + 1, 0).getDate();
      let ps = 0, vs = 0, n = 0;
      for (let d = 1; d <= last; d += 2) {
        const dn = dnOf(new Date(d0.getFullYear(), d0.getMonth(), d)); if (dn > TODAY_DN) break;
        ps += ids.reduce((s, id) => s + idxC(CROP[id], dn), 0) / ids.length; vs += ids.reduce((s, id) => s + totalVol(CROP[id], dn), 0) / 1000; n++;
      }
      out.x.push(`${d0.getFullYear() - 1911}/${pad(d0.getMonth() + 1)}`); out.price.push(n ? ps / n : null); out.vol.push(n ? vs / n : null);
    }
    const norm = a => { const m = mean(a.filter(v => v != null)); return a.map(v => v == null ? null : +(v / m * 100).toFixed(1)); };
    return { x: out.x, price: norm(out.price), vol: norm(out.vol), rawVol: out.vol.map(v => v == null ? null : +v.toFixed(1)) };
  });
}
function pearson(a, b) {
  const n = Math.min(a.length, b.length); if (n < 3) return NaN;
  const ma = mean(a.slice(0, n)), mb = mean(b.slice(0, n)); let sab = 0, saa = 0, sbb = 0;
  for (let i = 0; i < n; i++) { sab += (a[i] - ma) * (b[i] - mb); saa += (a[i] - ma) ** 2; sbb += (b[i] - mb) ** 2; }
  return sab / Math.sqrt(saa * sbb);
}
function lagCorrs(price, vol) {
  return [0, 1, 2, 3].map(k => ({ k, r: pearson(price.slice(k), vol.slice(0, vol.length - k)) }));
}
function concentration(ids) {
  const rows = COUNTIES.map(c => ({ c, ha: ids.reduce((s, id) => s + areaHa(id, c, STAT_YEAR), 0), ha0: ids.reduce((s, id) => s + areaHa(id, c, STAT_YEAR - 1), 0) }));
  const tot = rows.reduce((s, r) => s + r.ha, 0), tot0 = rows.reduce((s, r) => s + r.ha0, 0);
  rows.forEach(r => { r.sh = r.ha / tot; r.dsh = (r.ha / tot - r.ha0 / tot0) * 100; });
  rows.sort((a, b) => b.sh - a.sh);
  const hhi = rows.reduce((s, r) => s + (r.sh * 100) ** 2, 0), top3 = rows.slice(0, 3), other = 1 - top3.reduce((s, r) => s + r.sh, 0);
  return { top3, other, hhi, tot };
}
const MK_REGION = { tp1: '北部', tp2: '北部', bq: '北部', tc: '中部', xl: '中部', xh: '中部', ks: '南部' };
function marketGroups(ids) {
  const g = { 北部: [], 中部: [], 南部: [] };
  MARKETS.forEach(m => g[MK_REGION[m.id]].push(mean(ids.map(id => avgOver(d => avgPrice(CROP[id], m, d), TODAY_DN, 30)))));
  const out = Object.keys(g).map(k => ({ k, v: mean(g[k]) }));
  return { out, gap: Math.max(...out.map(o => o.v)) - Math.min(...out.map(o => o.v)) };
}
const rLabel = r => { const a = Math.abs(r); const w = a < .3 ? '弱' : a < .6 ? '中度' : '強'; return a < .15 ? '幾乎沒有線性關係' : `${w}${r < 0 ? '負' : '正'}相關`; };

