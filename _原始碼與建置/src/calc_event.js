'use strict';
/* =====================================================================
   政策者：事件焦點與答詢重點
   原則：只呈現「資料能直接確認的事實」；原因一律標為待查證，不把同期相關當成因果。
   門檻（EVT_RULE）是示意值，正式使用前要由業務單位決定。
   ===================================================================== */
const MK_COUNTY = { tp1: '臺北市', tp2: '臺北市', bq: '新北市', tc: '臺中市', xl: '雲林縣', xh: '彰化縣', ks: '高雄市' };
const mkWhere = m => m ? `${MK_COUNTY[m.id]}（${m.name}市場）` : '全國';
const pctS = (v, d = 1) => (v >= 0 ? '+' : '−') + Math.abs(v * 100).toFixed(d) + '%';
const ptsS = v => (v >= 0 ? '+' : '−') + Math.abs(v * 100).toFixed(1) + ' 點';
const EVT_RULE = { priceHi: .20, priceMid: .10, vol: .15, gap: .08, minGap: .06 };
const EVT_LVL = { alert: ['高度關注', 'alert'], warn: ['中度關注', 'warn'], ok: ['一般', 'mute'] };
const EVT_UNKNOWN = ['實際原因（需要產地、運銷與需求面的資料）', '產地實際出貨量（本系統只有批發市場成交量，不等於產量）', '政府已採取的措施（本系統尚未接入處置紀錄）', '未來走勢（第一版不做價格預測）'];
const pctR = v => Math.round(v * 100);

/* 一個「作物 × 範圍」的近 7 日指標。m 為 null 代表全國 */
function evtMetrics(c, m) {
  const dn = m ? tradeDn(m) : TODAY_DN;
  const P = d => m ? avgPrice(c, m, d) : natPrice(c, d);
  const V = d => m ? volDay(c, m, d) : totalVol(c, d);
  const now = P(dn), base = P(dn - 7);
  let v7 = 0, v7p = 0, down = 0;
  for (let i = 0; i < 7; i++) { v7 += V(dn - i); v7p += V(dn - 7 - i); if (P(dn - i) < P(dn - i - 1)) down++; }
  const ref3 = avgOver(P, dn - 7, 90), ly = avgOver(P, dn - 365, 7);
  return { c, m, dn, now, base, chg: now / base - 1, v7, v7p, vchg: v7 / v7p - 1, down, ref3, dev: now / ref3 - 1, ly, lyChg: now / ly - 1 };
}
/* 其他市場同期的價格變動（取中位數：只有一個市場異常時，比較基準不會被它拉走） */
const median = a => { const s = a.slice().sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
function othersChg(c, m) {
  return median(MARKETS.filter(o => o.id !== m.id).map(o => { const dn = tradeDn(o); return avgPrice(c, o, dn) / avgPrice(c, o, dn - 7) - 1; }));
}
function evtLevel(r) {
  const a = Math.abs(r.chg);
  if (a >= EVT_RULE.priceHi) return 'alert';
  if (a >= EVT_RULE.priceMid || (r.gap != null && Math.abs(r.gap) >= EVT_RULE.gap + .02)) return 'warn';
  return 'ok';
}
/* 全部「作物 × 全國／各市場」。同一天、同一組設定只算一次 */
function evtRows() {
  return memoize(`ev|${TODAY_DN}|${EVT.on}|${S.demo.closed || ''}`, () => {
    const rows = [];
    CROPS.forEach(c => {
      const n = evtMetrics(c, null); n.scope = 'nat'; n.oth = null; n.gap = null; rows.push(n);
      MARKETS.forEach(m => { const r = evtMetrics(c, m); r.scope = 'mk'; r.oth = othersChg(c, m); r.gap = r.chg - r.oth; rows.push(r); });
    });
    rows.forEach(r => { r.key = r.c.id + '|' + (r.m ? r.m.id : 'nat'); r.lvl = evtLevel(r); });
    return rows;
  });
}
/* 自動偵測：全國作物變動，加上「明顯偏離其他市場」的單一市場。休市的市場照樣納入（用前一交易日資料），畫面上會標示，避免休市把事件藏起來 */
function evtWatch(n) {
  return evtRows().filter(r => r.scope === 'nat' || Math.abs(r.gap) >= EVT_RULE.minGap)
    .slice().sort((a, b) => Math.abs(b.chg) - Math.abs(a.chg) || (a.scope === 'mk' ? -1 : 1)).slice(0, n);
}
function evtFocus() {
  if (S.evSel) { const r = evtRows().find(x => x.key === S.evSel); if (r) return { row: r, manual: true }; S.evSel = null; }
  return { row: evtWatch(1)[0], manual: false };
}
/* 比較對象：該作物主要產區所在的其他市場；全國則取規模最大的三個市場 */
function evtPeers(r) {
  if (!r.m) return MARKETS.slice().sort((a, b) => b.size - a.size).slice(0, 3);
  const seen = new Set([r.m.id]), out = [];
  COUNTIES.slice().sort((a, b) => areaHa(r.c.id, b, STAT_YEAR) - areaHa(r.c.id, a, STAT_YEAR)).forEach(co => { const mk = MK[MKT_OF[co]]; if (mk && !seen.has(mk.id) && out.length < 2) { seen.add(mk.id); out.push(mk); } });
  MARKETS.forEach(mk => { if (out.length < 2 && !seen.has(mk.id)) { seen.add(mk.id); out.push(mk); } });
  return out;
}
const mkChg = (c, o) => { const dn = tradeDn(o); return avgPrice(c, o, dn) / avgPrice(c, o, dn - 7) - 1; };
/* 近 8 日價格比較（7 日前＝100）。休市的市場最後一天留空，不補值 */
function evtSeries(r) {
  const d0 = TODAY_DN - 7, days = Array.from({ length: 8 }, (_, i) => d0 + i), x = days.map(d => fmtMD(dateOf(d)));
  const idx = (P, last) => { const b = P(d0); return days.map(d => d > last ? null : +(P(d) / b * 100).toFixed(1)); };
  const mP = o => d => avgPrice(r.c, o, d);
  const series = [{ name: r.m ? r.m.name : '全國', vals: idx(r.m ? mP(r.m) : d => natPrice(r.c, d), r.m ? tradeDn(r.m) : TODAY_DN), color: '#1d302b', w: 3.6, dash: '' }];
  evtPeers(r).forEach((p, i) => series.push({ name: p.name + (isClosed(p) ? '（休市）' : ''), vals: idx(mP(p), tradeDn(p)), color: ['#4f84a6', '#a87a2c', '#6b8a3e'][i] }));
  if (r.m) {
    const oth = MARKETS.filter(o => o.id !== r.m.id);
    series.push({ name: '其他市場（中位數）', color: '#2f7657', vals: days.map(d => { const v = oth.filter(o => d <= tradeDn(o)).map(o => avgPrice(r.c, o, d) / avgPrice(r.c, o, d0) * 100); return v.length ? +median(v).toFixed(1) : null; }) });
  }
  return { x, series };
}
/* 規則觸發（示意門檻） */
function evtTriggers(r) {
  const a = Math.abs(r.chg), R = EVT_RULE;
  return [
    { name: '價格變動', rule: `近 7 日 ≥ ±${pctR(R.priceHi)}%（高）、≥ ±${pctR(R.priceMid)}%（中）`, val: pctS(r.chg), hit: a >= R.priceMid },
    { name: '交易量變動', rule: `近 7 日 ≥ ±${pctR(R.vol)}%`, val: pctS(r.vchg), hit: Math.abs(r.vchg) >= R.vol },
    { name: '與其他市場的差距', rule: `價格變動差 ≥ ${pctR(R.gap)} 個百分點`, val: r.gap == null ? '全國不適用' : ptsS(r.gap), hit: r.gap != null && Math.abs(r.gap) >= R.gap },
  ];
}
const evtHeadline = r => {
  const nm = r.c.name, dw = r.chg < 0 ? '下跌' : '上漲', a = Math.abs(r.chg * 100).toFixed(1) + '%';
  if (r.scope === 'nat') return `全國${nm}批發價近 7 日${dw} ${a}`;
  return `${mkWhere(r.m)}${nm}價格近 7 日${dw} ${a}，${Math.abs(r.gap) >= EVT_RULE.minGap ? `幅度明顯${Math.abs(r.chg) > Math.abs(r.oth) ? '大於' : '小於'}其他市場` : '與其他市場走勢相近'}`;
};
const volWord = v => v >= .08 ? '增加' : v <= -.08 ? '減少' : '變動不大';
/* 該縣市（或全國前三大縣市）的面積與影響範圍 */
function evtExposure(r) {
  const nat = natHa(r.c.id), rk = countyRank(r.c.id);
  if (r.m) {
    const co = MK_COUNTY[r.m.id], ha = areaHa(r.c.id, co, STAT_YEAR), me = rk.find(x => x.c === co);
    return { text: `${co}${r.c.name}面積約 ${fi(ha)} 公頃，占全國 ${(ha / nat * 100).toFixed(1)}%（${roc(STAT_YEAR)} 年，全國第 ${me.rank}）`, share: ha / nat };
  }
  const top = rk.slice(0, 3);
  return { text: `全國${r.c.name}種植面積約 ${fi(nat)} 公頃（${roc(STAT_YEAR)} 年）；前三大為${top.map(t => `${t.c} ${(t.ha / nat * 100).toFixed(0)}%`).join('、')}`, share: top.reduce((s, t) => s + t.ha, 0) / nat };
}
/* 能直接回答的事實（短句，電腦版一行半內） */
function evtFacts(r) {
  const price = `價格：${f1(r.now)} 元／公斤，7 日前 ${f1(r.base)}（${pctS(r.chg)}），近 7 日有 ${r.down} 天走${r.chg < 0 ? '低' : '高'}；較近三個月均價 ${pctS(r.dev)}。`;
  const vol = `交易量：近 7 日 ${fi(r.v7 / 1000)} 公噸，較前 7 日 ${pctS(r.vchg)}。`;
  let cmp;
  if (r.m) cmp = `比較：其他市場同期 ${pctS(r.oth)}（中位數），本市場差 ${ptsS(r.gap)}。`;
  else {
    const same = evtRows().filter(x => x.scope === 'mk' && x.c === r.c && Math.sign(x.chg) === Math.sign(r.chg)).length;
    cmp = `比較：${MARKETS.length} 個示範市場中有 ${same} 個同向變動。`;
  }
  return { price, vol, cmp, exp: evtExposure(r).text };
}
/* 可能原因：每一條都標明「資料看得到什麼」，並提醒需要查證。short 是電腦版一行用的短句，n 是完整說明 */
function evtCauses(r) {
  const out = [], down = r.chg < 0;
  if (Math.abs(r.vchg) < .08) out.push({ t: '供給／到貨', s: '無明顯訊號', short: `交易量 ${pctS(r.vchg)}・無明顯訊號`, n: `交易量 ${pctS(r.vchg)}，變化不大，供給增減不是明顯訊號。` });
  else if ((down && r.vchg > 0) || (!down && r.vchg < 0)) out.push({ t: '供給變化', s: '方向相符', short: `交易量 ${pctS(r.vchg)}・與價格方向相符`, n: `交易量 ${pctS(r.vchg)}，與價格${down ? '下跌' : '上漲'}的方向相符；是否為主因待查證。` });
  else out.push({ t: '需求或收貨端', s: '價量同向', short: `交易量 ${pctS(r.vchg)}・價量同向`, n: `交易量 ${pctS(r.vchg)}，價量同向，較像需求或收貨端變化；待查證。` });
  if (r.m) out.push(Math.abs(r.gap) >= EVT_RULE.minGap
    ? { t: '區域性因素', s: '局部明顯', short: `與其他市場差 ${ptsS(r.gap)}・局部較明顯`, n: `其他市場同期 ${pctS(r.oth)}，本市場差 ${ptsS(r.gap)}，變動集中在這個市場。` }
    : { t: '區域或全國性', s: '走勢相近', short: `其他市場 ${pctS(r.oth)}・走勢相近`, n: `其他市場同期 ${pctS(r.oth)}，走勢相近，較像全國性走勢。` });
  else {
    const same = evtRows().filter(x => x.scope === 'mk' && x.c === r.c && Math.sign(x.chg) === Math.sign(r.chg)).length;
    out.push({ t: '區域或全國性', s: '全國同步', short: `${same}／${MARKETS.length} 個市場同向`, n: `以全國市場加權計算；${MARKETS.length} 個示範市場中有 ${same} 個同向變動。` });
  }
  const cos = r.m ? [MK_COUNTY[r.m.id]] : COUNTIES.slice().sort((a, b) => areaHa(r.c.id, b, STAT_YEAR) - areaHa(r.c.id, a, STAT_YEAR)).slice(0, 3);
  const als = []; cos.forEach(co => alertsFor(co).forEach(a => { if (a.status !== 'cancelled' && a.T.crops.includes(r.c.id)) als.push(co + a.T.name); }));
  out.push(als.length
    ? { t: '天氣與警報', s: '有生效警報', short: `${als[0]}${als.length > 1 ? `等 ${als.length} 則` : ''}生效中`, n: `${als.slice(0, 3).join('、')}生效中，可能影響採收與運輸；是否與這次價量有關待查證。` }
    : { t: '天氣與警報', s: '未見影響', short: '未見影響此作物的生效警報', n: `${r.m ? cos[0] : '主要產區'}目前沒有影響此作物的生效警報。` });
  if (VARIANTS[r.c.id]) {
    const a = variantMix(r.c, r.dn), b = variantMix(r.c, r.dn - 7), hi = a.reduce((k, x, i) => x.f > a[k].f ? i : k, 0), d = (a[hi].share - b[hi].share) * 100;
    out.push({ t: '品項組成', s: Math.abs(d) < 3 ? '變化不大' : '有變化', short: `高價品項占比 ${d >= 0 ? '+' : '−'}${Math.abs(d).toFixed(1)} 點・${Math.abs(d) < 3 ? '變化不大' : '有變化'}`, n: `高價品項「${a[hi].v.name}」占比 ${(b[hi].share * 100).toFixed(0)}% → ${(a[hi].share * 100).toFixed(0)}%（${d >= 0 ? '+' : '−'}${Math.abs(d).toFixed(1)} 點）${Math.abs(d) < 3 ? '，不足以單獨解釋均價變動。' : '，可能影響均價，需拆品項看。'}` });
  }
  return out;
}
/* 臨時質詢：三題常見問題與可直接唸的答案 */
function evtAnswers(r) {
  const nm = r.c.name, F = evtFacts(r), co = r.m ? MK_COUNTY[r.m.id] : null;
  const peers = evtPeers(r).map(p => `${p.name} ${pctS(mkChg(r.c, p))}`).join('、'), ex = evtExposure(r);
  const a1 = r.m
    ? `${r.m.name}市場近 7 日 ${f1(r.base)} → ${f1(r.now)} 元／公斤（${pctS(r.chg)}），其他市場同期 ${pctS(r.oth)}，交易量 ${pctS(r.vchg)}。目前只能確認價格與交易量同時變動，且${Math.abs(r.gap) >= EVT_RULE.minGap ? `幅度${Math.abs(r.chg) > Math.abs(r.oth) ? '大於' : '小於'}其他市場` : '與其他市場走勢相近'}；原因待查證，不能直接斷定。`
    : `全國${nm}批發均價近 7 日 ${pctS(r.chg)}（${f1(r.base)} → ${f1(r.now)} 元／公斤），${F.cmp.replace(/^比較：/, '')}交易量 ${pctS(r.vchg)}。這是全國性走勢；原因待查證，不能直接斷定。`;
  return [
    { q: `為什麼${co || ''}${nm}價格${r.chg < 0 ? '跌' : '漲'}得這麼多？`, a: a1 },
    { q: '政府目前採取了什麼措施？', a: '本系統尚未接入處置紀錄，不能宣稱已完成任何措施。請先向承辦單位取得查核進度，並核對批發交易、品級與跨區出貨。' },
    { q: '影響範圍有多大？', a: `${ex.text}。受影響農戶數與實際出貨量，本系統沒有資料。` },
  ];
}
/* 一鍵複製的摘要（純文字，可貼到簡報或訊息） */
function evtSummary(fc) {
  const r = fc.row, F = evtFacts(r), [lv0] = EVT_LVL[r.lvl];
  return [
    `【GRGR 決策總覽摘要】${fmtRoc(TODAY)} ${updText()}（${EVT.on ? '情境示範・虛構事件；' : ''}所有數字為模擬資料）`,
    `事件（${lv0}）：${evtHeadline(r)}`,
    `事實：${[F.price, F.vol, F.cmp].map(s => s.replace(/^[^：]+：/, '')).join('')}`,
    `影響範圍：${F.exp}`,
    `尚不能斷定：${EVT_UNKNOWN.map(s => s.replace(/（.*$/, '')).join('、')}`,
    '建議下一步：向承辦單位取得查核進度；核對批發市場交易、品級與跨區出貨。',
    '口徑：批發市場日均價（元／公斤）；「近 7 日」是最後交易日對 7 日前；交易量是市場成交量，不等於產量。',
  ].join('\n');
}
