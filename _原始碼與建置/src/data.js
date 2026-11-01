'use strict';
/* =====================================================================
   農業資訊平台 示範版 —— 全部數字皆為「可重現的模擬資料」（以作物/市場/日期做種子）
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DAY = 86400000;
const NOW = new Date();
const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
const dnOf = d => Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY);
const dateOf = dn => { const d = new Date(dn * DAY); return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); };
const TODAY_DN = dnOf(TODAY);
const WD = ['日', '一', '二', '三', '四', '五', '六'];
const pad = n => String(n).padStart(2, '0');
const roc = y => y - 1911;
const fmtRoc = d => `${roc(d.getFullYear())}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
const fmtMD = d => `${d.getMonth() + 1}/${d.getDate()}`;
const fmtHM = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const fmtDT = d => `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${fmtHM(d)}`;
const f1 = v => (Math.round(v * 10) / 10).toFixed(1);
const fi = v => Math.round(v).toLocaleString('en-US');
const pct = (v, d = 1) => (v * 100).toFixed(d) + '%';
const memo = new Map();
const memoize = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };

function hash() {
  let h = 2166136261 >>> 0;
  for (let k = 0; k < arguments.length; k++) {
    const s = String(arguments[k]);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= 0x9e; h = Math.imul(h, 16777619);
  }
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const vnoise = (key, x) => { const i = Math.floor(x), f = x - i, t = f * f * (3 - 2 * f); const a = hash(key, i), b = hash(key, i + 1); return a + (b - a) * t; };

/* ---------- 身分 ---------- */
const IDS = [
  { id: 'farmer', label: '我是農友', short: '農友' },
  { id: 'buyer', label: '我來買菜', short: '消費者' },
  { id: 'policy', label: '我做政策', short: '政策' },
  { id: 'researcher', label: '我做研究', short: '研究者' },
];
const ID_BY = Object.fromEntries(IDS.map(i => [i.id, i]));
const DENS = [{ id: 'simple', label: '簡易' }, { id: 'focus', label: '重點' }, { id: 'pro', label: '專業' }];
const DENS_NAME = { simple: '簡易', focus: '重點加細節', pro: '專業' };
const DENS_OF_ID = { farmer: 'simple', buyer: 'simple', policy: 'focus', researcher: 'pro' };

/* ---------- 作物、市場 ---------- */
const CROPS = [
  { id: 'garlic', name: '蒜頭', code: 'SA1', base: 62, amp: .26, ph: .9, vol: 36000 },
  { id: 'cabbage', name: '甘藍', code: 'LA1', base: 15, amp: .42, ph: 2.1, vol: 160000 },
  { id: 'napa', name: '結球白菜', code: 'LB1', base: 12, amp: .40, ph: 3.0, vol: 140000 },
  { id: 'peanut', name: '花生', code: 'SB1', base: 56, amp: .14, ph: 1.6, vol: 30000 },
  { id: 'lettuce', name: '萵苣', code: 'LC1', base: 22, amp: .38, ph: 4.0, vol: 70000 },
  { id: 'bamboo', name: '竹筍', code: 'XB1', base: 44, amp: .30, ph: 5.2, vol: 52000 },
];
const CROP = Object.fromEntries(CROPS.map(c => [c.id, c]));
const MARKETS = [
  { id: 'tp1', name: '台北一', size: 1.0 },
  { id: 'tp2', name: '台北二', size: .9 },
  { id: 'bq', name: '板橋區', size: .7 },
  { id: 'tc', name: '台中市', size: .8 },
  { id: 'xl', name: '西螺鎮', size: 1.2 },
  { id: 'xh', name: '溪湖鎮', size: .6 },
  { id: 'ks', name: '高雄市', size: .9 },
];
const MK = Object.fromEntries(MARKETS.map(m => [m.id, m]));
const MKT_OF = { '臺北市': 'tp1', '新北市': 'bq', '基隆市': 'tp2', '桃園市': 'tp2', '新竹市': 'tp2', '新竹縣': 'tp2', '宜蘭縣': 'tp2', '花蓮縣': 'tp2', '連江縣': 'tp2',
  '苗栗縣': 'tc', '臺中市': 'tc', '南投縣': 'tc', '彰化縣': 'xh', '雲林縣': 'xl', '嘉義市': 'xl', '嘉義縣': 'xl',
  '臺南市': 'ks', '高雄市': 'ks', '屏東縣': 'ks', '臺東縣': 'ks', '澎湖縣': 'ks', '金門縣': 'ks' };

/* ---------- 示範突發事件（虛構情境） ----------
   用來示範「突然出事、要被質詢時，畫面怎麼幫忙」：西螺鎮（雲林縣）的甘藍，近 7 日價格逐日走低、交易量增加。
   事件永遠以「今天」為終點，所以不論哪天開啟都看得到；可在設定的「示範用開關」關閉。
   因為是寫在最底層的價格與交易量，所以所有頁面、入口頁看到的數字都一致。 */
const EVT = { on: true, crop: 'cabbage', market: 'xl', ramp: 7, drop: .30, volUp: .40 };
function evtRamp(c, m, dn) {   // 0＝事件開始前，1＝今天；不是事件對象就一律 0
  if (!EVT.on || c.id !== EVT.crop || m.id !== EVT.market) return 0;
  return Math.max(0, Math.min(1, (dn - (TODAY_DN - EVT.ramp)) / EVT.ramp));
}
function seasonal(c, dn) { const doy = ((dn % 365) + 365) % 365; return 1 + c.amp * Math.sin(2 * Math.PI * doy / 365 + c.ph); }
function avgPrice(c, m, dn) {
  const trend = (vnoise(c.id + 't', dn / 9) - .5) * .34;
  const mk = 1 + (hash(c.id, m.id) - .5) * .14;
  const d = (hash(c.id, m.id, dn) - .5) * .05;
  return Math.max(3, c.base * seasonal(c, dn) * (1 + trend) * mk * (1 + d) * (1 - EVT.drop * evtRamp(c, m, dn)));
}
function volDay(c, m, dn) {
  const n = (vnoise(c.id + 'v', dn / 5) - .5) * .5;
  return Math.round(c.vol * m.size * (1 + n) * (1 + (hash(c.id, m.id, dn, 'v') - .5) * .2) * (1 + EVT.volUp * evtRamp(c, m, dn)) / 10) * 10;
}
function quote(c, m, dn) {
  const a = avgPrice(c, m, dn), p = avgPrice(c, m, dn - 1);
  const sp = .09 + hash(c.id, m.id, dn, 's') * .06;
  return { avg: +f1(a), hi: +f1(a * (1 + sp)), lo: +f1(a * (1 - sp)), mid: +f1(a * (1 + (hash(c.id, m.id, dn, 'm') - .5) * .03)),
    vol: volDay(c, m, dn), prev: +f1(p), chg: (a - p) / p, dn };
}
const totalVol = (c, dn) => MARKETS.reduce((s, m) => s + volDay(c, m, dn), 0);
function series(c, m, days, endDn) { const o = []; for (let i = days - 1; i >= 0; i--) o.push(+f1(avgPrice(c, m, endDn - i))); return o; }
function farmGate(c, dn) { // 產地查報價（每週）
  const wk = Math.floor(dn / 7) * 7; const m = MK.xl;
  return +f1(avgPrice(c, m, wk) * (0.66 + hash(c.id, wk, 'fg') * .1));
}
function trendText(vals) {
  const n = vals.length, a = vals.slice(0, n >> 1), b = vals.slice(n >> 1);
  const avg = x => x.reduce((s, v) => s + v, 0) / x.length;
  const mid = Math.floor(n / 2);
  const d1 = (vals[mid] - vals[0]) / vals[0], d2 = (vals[n - 1] - vals[mid]) / vals[mid];
  const T = .02;
  if (Math.abs(d1) < T && Math.abs(d2) < T) return '大致持平';
  if (d1 >= T && d2 >= T) return '持續上漲';
  if (d1 <= -T && d2 <= -T) return '持續下跌';
  if (d1 >= T && d2 < T) return d2 <= -T ? '先漲後跌' : '先漲後持平';
  if (d1 <= -T && d2 > -T) return d2 >= T ? '先跌後漲' : '先跌後持平';
  return d2 >= T ? '前段持平、後段上漲' : '前段持平、後段下跌';
}

/* ---------- 旬（上旬1–10、中旬11–20、下旬21–月底） ---------- */
const dekadLabel = i => `${Math.floor(i / 3) + 1}月${['上', '中', '下'][i % 3]}旬`;
const curDekad = () => TODAY.getMonth() * 3 + (TODAY.getDate() <= 10 ? 0 : TODAY.getDate() <= 20 ? 1 : 2);
function dekadAgg(c, m, year) {
  return memoize(`dk|${c.id}|${m.id}|${year}`, () => {
    const price = [], vol = [];
    for (let k = 0; k < 36; k++) {
      const mo = Math.floor(k / 3), part = k % 3;
      const d0 = part === 0 ? 1 : part === 1 ? 11 : 21;
      const d1 = part === 2 ? new Date(year, mo + 1, 0).getDate() : d0 + 9;
      let sp = 0, sv = 0, n = 0;
      for (let d = d0; d <= d1; d++) {
        const dn = dnOf(new Date(year, mo, d)); if (dn > TODAY_DN) break;
        sp += avgPrice(c, m, dn); sv += volDay(c, m, dn); n++;
      }
      price.push(n ? +f1(sp / n) : null); vol.push(n ? Math.round(sv / n / 10) * 10 : null);
    }
    return { price, vol };
  });
}
function monthVol(c, year) { // 全市場 平均每日交易量（公噸）
  return memoize(`mv|${c.id}|${year}`, () => {
    const o = [];
    for (let mo = 0; mo < 12; mo++) {
      let s = 0, n = 0; const last = new Date(year, mo + 1, 0).getDate();
      for (let d = 1; d <= last; d++) { const dn = dnOf(new Date(year, mo, d)); if (dn > TODAY_DN) break; s += totalVol(c, dn); n++; }
      o.push(n ? +(s / n / 1000).toFixed(1) : null);
    }
    return o;
  });
}

/* ---------- 地區、面積、特色作物 ---------- */
const COUNTIES = ['臺北市', '新北市', '桃園市', '臺中市', '臺南市', '高雄市', '基隆市', '新竹市', '嘉義市', '新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣', '臺東縣', '澎湖縣', '金門縣', '連江縣'];
const TOWNS_YL = ['斗六市', '斗南鎮', '虎尾鎮', '西螺鎮', '土庫鎮', '北港鎮', '古坑鄉', '大埤鄉', '莿桐鄉', '林內鄉', '二崙鄉', '崙背鄉', '麥寮鄉', '東勢鄉', '褒忠鄉', '臺西鄉', '元長鄉', '四湖鄉', '口湖鄉', '水林鄉'];
const isPilot = r => r === '雲林縣';
const EXT = [...CROPS.map(c => ({ id: c.id, name: c.name })), { id: 'rice', name: '稻米' }, { id: 'corn', name: '玉米' }, { id: 'onion', name: '洋蔥' },
  { id: 'tea', name: '茶' }, { id: 'citrus', name: '柑橘' }, { id: 'melon', name: '西瓜' }, { id: 'banana', name: '香蕉' }, { id: 'mango', name: '芒果' }];
const EXT_NAME = Object.fromEntries(EXT.map(c => [c.id, c.name]));
const NAT_HA = { garlic: 2900, cabbage: 7400, napa: 5600, peanut: 19500, lettuce: 3300, bamboo: 12500, rice: 262000, corn: 11800, onion: 1900, tea: 11500, citrus: 14500, melon: 9800, banana: 9300, mango: 16000 };
const AW = {
  garlic: { '雲林縣': .55, '彰化縣': .12, '嘉義縣': .09, '臺南市': .08 },
  cabbage: { '雲林縣': .22, '彰化縣': .15, '嘉義縣': .08, '臺中市': .08, '屏東縣': .07 },
  napa: { '雲林縣': .33, '彰化縣': .18, '嘉義縣': .10, '臺南市': .08 },
  peanut: { '雲林縣': .38, '彰化縣': .12, '嘉義縣': .12, '臺南市': .10, '屏東縣': .08 },
  lettuce: { '彰化縣': .32, '雲林縣': .20, '嘉義縣': .08, '臺中市': .06, '屏東縣': .06 },
  bamboo: { '南投縣': .22, '嘉義縣': .15, '新北市': .12, '屏東縣': .08, '雲林縣': .06, '彰化縣': .04 },
  rice: { '雲林縣': .14, '臺南市': .12, '花蓮縣': .11, '嘉義縣': .10, '彰化縣': .09, '臺東縣': .07, '屏東縣': .06 },
  corn: { '雲林縣': .25, '臺南市': .14, '嘉義縣': .10, '彰化縣': .08, '屏東縣': .08 },
  onion: { '屏東縣': .86 },
  tea: { '南投縣': .35, '嘉義縣': .20, '新北市': .10, '桃園市': .08, '新竹縣': .06 },
  citrus: { '苗栗縣': .14, '南投縣': .13, '臺中市': .10, '嘉義縣': .10, '花蓮縣': .06, '新北市': .05 },
  melon: { '雲林縣': .22, '彰化縣': .12, '臺南市': .12, '屏東縣': .10, '嘉義縣': .10 },
  banana: { '屏東縣': .38, '高雄市': .26, '臺中市': .08, '南投縣': .06 },
  mango: { '臺南市': .30, '屏東縣': .24, '高雄市': .20, '嘉義縣': .06, '臺東縣': .05 },
};
const STAT_YEAR = TODAY.getFullYear() - 1;
const CROPLAND = { '雲林縣': 150000, '彰化縣': 105000, '臺南市': 120000, '嘉義縣': 90000, '屏東縣': 100000, '臺中市': 70000, '南投縣': 60000, '花蓮縣': 45000, '臺東縣': 48000, '高雄市': 60000, '苗栗縣': 42000, '桃園市': 35000, '宜蘭縣': 32000, '新北市': 20000, '新竹縣': 20000 };
const cropland = c => CROPLAND[c] || Math.round(3000 + hash(c, 'cl') * 14000);
function areaW(crop) {
  return memoize('aw' + crop, () => {
    const spec = AW[crop]; const out = {}; let sum = 0;
    for (const k in spec) { out[k] = spec[k]; sum += spec[k]; }
    const rest = COUNTIES.filter(c => !(c in spec)); const hs = rest.map(c => .2 + hash(crop, c, 'w')); const hsum = hs.reduce((a, b) => a + b, 0);
    rest.forEach((c, i) => { out[c] = (1 - sum) * hs[i] / hsum; });
    return out;
  });
}
function areaHa(crop, county, year) {
  const w = areaW(crop)[county]; const dir = (hash(crop, 'dir') - .42) * .12;
  return Math.round(NAT_HA[crop] * w * (1 + dir * (year - STAT_YEAR) + (hash(crop, county, year) - .5) * .05));
}
const natHa = (crop, year = STAT_YEAR) => memoize(`nh|${crop}|${year}`, () => COUNTIES.reduce((s, c) => s + areaHa(crop, c, year), 0));
const T = { nat: .30, cty: .10, loc: .08 }; // 門檻僅為示意
function specialCrops(county) {
  return memoize('sp' + county, () => {
    const rows = EXT.map(c => { const ha = areaHa(c.id, county, STAT_YEAR); return { id: c.id, name: c.name, ha, ns: ha / natHa(c.id), cs: ha / cropland(county) }; });
    const pro = [], key = [], loc = [];
    rows.slice().sort((a, b) => b.ns - a.ns).forEach(r => { if (r.ns >= T.nat) pro.push(r); else if (r.cs >= T.cty) key.push(r); else if (r.ns >= T.loc) loc.push(r); });
    return { pro, key, loc, rows };
  });
}
function recommendCrops(county) {
  const sp = specialCrops(county);
  const order = [...sp.pro, ...sp.key, ...sp.loc].map(r => r.id).filter(id => CROP[id]);
  if (order.length) return order.slice(0, 4);
  return CROPS.map(c => ({ id: c.id, ha: areaHa(c.id, county, STAT_YEAR) })).sort((a, b) => b.ha - a.ha).slice(0, 2).map(r => r.id);
}
const townW = memoize('tw', () => { const hs = TOWNS_YL.map(t => .3 + hash(t, 'tw')); const s = hs.reduce((a, b) => a + b, 0); return hs.map(h => h / s); });
const townHa = (crop, i) => Math.round(areaHa(crop, '雲林縣', STAT_YEAR) * townW[i] * (.6 + hash(crop, i, 'tj') * .8));

/* ---------- 生產成本（元/公頃，名目金額，各項不加總） ---------- */
const COST_ITEMS = ['種苗（種子）', '肥料', '農藥', '人工', '機具', '其他'];
const COST_SCALE = { garlic: 1.6, cabbage: .9, napa: .85, peanut: .7, lettuce: 1.0, bamboo: 1.1 };
const costOf = crop => COST_ITEMS.map((n, i) => ({ name: n, v: Math.round([60000, 45000, 22000, 140000, 38000, 25000][i] * COST_SCALE[crop] * (.85 + hash(crop, n, 'c') * .3) / 100) * 100 }));

/* ---------- 天氣、警報 ---------- */
const MT = [16.5, 17, 19.5, 23, 26, 28, 29.5, 29.2, 28, 25, 22, 18];
const SEAT = { '雲林縣': '斗六', '臺北市': '臺北', '新北市': '板橋', '桃園市': '桃園', '臺中市': '臺中', '臺南市': '臺南', '高雄市': '高雄', '基隆市': '基隆', '新竹市': '新竹', '嘉義市': '嘉義', '新竹縣': '竹北', '苗栗縣': '苗栗', '彰化縣': '彰化', '南投縣': '南投', '嘉義縣': '太保', '屏東縣': '屏東', '宜蘭縣': '宜蘭', '花蓮縣': '花蓮', '臺東縣': '臺東', '澎湖縣': '馬公', '金門縣': '金門', '連江縣': '馬祖' };
const YL_STATIONS = ['斗六市', '斗南鎮', '虎尾鎮', '西螺鎮', '北港鎮', '古坑鄉', '麥寮鄉', '口湖鄉', '崙背鄉'];
function stationFor(region, town) {
  if (isPilot(region) && town) {
    if (YL_STATIONS.includes(town)) return { name: town.replace(/[市鎮鄉]$/, ''), km: +(1 + hash(town, 'km') * 7).toFixed(1) };
    return { name: '斗六', km: +(8 + hash(town, 'km') * 14).toFixed(1) };
  }
  return { name: SEAT[region] || region, km: +(2 + hash(region, 'km') * 10).toFixed(1) };
}
const ALERT_T = {
  rain: { name: '豪雨特報', lvl: 'warn', lvlName: '警戒', desc: '受鋒面影響，未來24小時局部地區有大雨或豪雨，請注意雷擊、強陣風及低窪地區積水。', crops: ['garlic', 'cabbage', 'napa', 'lettuce'], tip: '先檢查田邊排水溝是否暢通；已成熟的蔬菜可考慮提早採收。' },
  cold: { name: '低溫特報', lvl: 'info', lvlName: '注意', desc: '夜間至清晨平地最低溫可能降至12度以下，請注意農作物防寒。', crops: ['lettuce', 'bamboo', 'peanut'], tip: '幼苗可用不織布覆蓋；寒流來前避免施肥。' },
  wind: { name: '強風特報', lvl: 'info', lvlName: '注意', desc: '沿海空曠地區有強風，平均風力6級以上。', crops: ['bamboo', 'cabbage'], tip: '固定網室與設施棚架。' },
  heat: { name: '高溫資訊', lvl: 'info', lvlName: '注意', desc: '午後氣溫偏高，戶外作業請留意中暑。', crops: ['lettuce', 'cabbage'], tip: '調整到清晨與傍晚作業，並補充水分。' },
  typh: { name: '颱風海上警報', lvl: 'serious', lvlName: '嚴重', desc: '（示範用模擬警報）颱風外圍環流影響，未來24小時風雨明顯增強。', crops: ['garlic', 'cabbage', 'napa', 'peanut', 'lettuce', 'bamboo'], tip: '收穫可收的作物，加固設施，清理排水。' },
};
const STATUS_NAME = { active: '有效', updated: '已更新', cancelled: '已取消' };
let _alertCache = {};
function alertsFor(region) {
  const key = region + '|' + S.demo.extra;
  if (_alertCache[key]) return _alertCache[key];
  let specs;
  if (region === '雲林縣') specs = [['rain', 'updated'], ['cold', 'active'], ['wind', 'cancelled']];
  else { specs = []; for (const k of ['rain', 'cold', 'wind', 'heat']) if (hash(region, k, TODAY_DN) < .35) specs.push([k, hash(region, k, 'st') < .2 ? 'updated' : 'active']); }
  for (let i = 0; i < S.demo.extra; i++) specs.unshift(['typh', 'active', i]);
  const base = Math.floor(NOW.getTime() / 600000) * 600000;
  return _alertCache[key] = specs.map(([k, st, n]) => {
    const issued = new Date(base - (1.5 + hash(region, k, 'i') * 4) * 3600e3);
    const eff = new Date(issued.getTime() + (.5 + hash(region, k, 'e')) * 3600e3);
    const end = new Date(eff.getTime() + (8 + hash(region, k, 'n') * 20) * 3600e3);
    return { id: `${region}-${k}${n != null ? '-d' + n : ''}-${TODAY_DN}`, k, T: ALERT_T[k], status: st, issued, eff, end, n: n || 0 };
  });
}
const hasAlert = (region, k) => alertsFor(region).some(a => a.k === k && a.status !== 'cancelled');
function obsNow(region, town) {
  const k = region + (town || ''); const hr = NOW.getHours(); const wet = hasAlert(region, 'rain');
  const temp = MT[NOW.getMonth()] + Math.sin((hr - 9) / 24 * 2 * Math.PI) * 3.5 + (hash(k, TODAY_DN, 't') - .5) * 3;
  const r1 = wet ? +(hash(k, TODAY_DN, hr, 'r') * 14).toFixed(1) : (hash(k, TODAY_DN, hr, 'r') < .12 ? +(hash(k, hr, 'rr') * 2).toFixed(1) : 0);
  const r24 = wet ? Math.round(35 + hash(k, TODAY_DN, 'r24') * 70) : Math.round(hash(k, TODAY_DN, 'r24') * 4);
  return { temp, r1, r24, rh: Math.round(62 + hash(k, TODAY_DN, hr, 'h') * 28), wind: +(1.5 + hash(k, TODAY_DN, hr, 'w') * 5).toFixed(1), time: new Date(Math.floor(NOW.getTime() / 600000) * 600000) };
}
function forecast(region) {
  const wet = hasAlert(region, 'rain');
  return Array.from({ length: 7 }, (_, i) => {
    const dn = TODAY_DN + i; const base = MT[dateOf(dn).getMonth()];
    const hi = base + 3 + (hash(region, dn, 'hi') - .5) * 4 - (i < 2 && wet ? 2 : 0);
    const lo = hi - 5 - hash(region, dn, 'lo') * 3;
    let pop = Math.round(hash(region, dn, 'pop') * 6) * 10; if (wet && i < 2) pop = Math.max(pop, i ? 70 : 90);
    return { dn, date: dateOf(dn), hi, lo, pop, text: pop >= 70 ? '雨' : pop >= 40 ? '短暫陣雨' : pop >= 20 ? '多雲' : '晴時多雲' };
  });
}
const PEST = { garlic: ['薊馬', '誘蟲器平均隻數'], cabbage: ['小菜蛾', '誘蟲器平均隻數'], napa: ['小菜蛾', '誘蟲器平均隻數'], lettuce: ['斜紋夜蛾', '誘蟲器平均隻數'], peanut: ['斜紋夜蛾', '誘蟲器平均隻數'] };
const pestSeries = (crop, region) => Array.from({ length: 12 }, (_, i) => Math.round(2 + vnoise(crop + region, (i + TODAY_DN / 7) / 2.2) * 26));

/* ---------- 知識與新聞（示意） ---------- */
const KN = [
  { id: 1, t: '秋冬蔬菜育苗期間的水分管理重點', u: '改良場（示意）', type: '技術', aud: ['farmer', 'researcher'], off: 2, s: '說明育苗期間灌溉量與時間的調整原則，以及低溫來臨前的管理提醒。' },
  { id: 2, t: '本週蔬菜行情偏穩，葉菜類供應增加', u: '市場觀察（示意）', type: '行情', aud: ['farmer', 'buyer'], off: 1, s: '多數葉菜類批發價與上週相近，部分品項因產地供應增加而略為回落。' },
  { id: 3, t: '冬季進補怎麼買蒜頭？挑選與保存小撇步', u: '消費教育（示意）', type: '消費', aud: ['buyer'], off: 4, s: '挑選外皮乾燥、蒜瓣飽滿的蒜頭，通風陰涼處保存可延長存放時間。' },
  { id: 4, t: '農業天然災害救助作業說明', u: '農業主管機關（示意）', type: '政策', aud: ['farmer', 'policy'], off: 5, s: '整理受災後通報、勘查與申請的基本流程與時程，提醒保留田間受損照片。' },
  { id: 5, t: '各縣市特色作物盤點方法說明', u: '研究單位（示意）', type: '研究', aud: ['policy', 'researcher'], off: 6, s: '以全國占比與縣內占比分類，說明門檻設定的考量與限制。' },
  { id: 6, t: '近五年蒜頭種植面積變動分析', u: '研究單位（示意）', type: '研究', aud: ['policy', 'researcher'], off: 8, s: '比較主要產區近五年面積變動，並說明資料落後一年的限制。' },
  { id: 7, t: '豪雨前後田間管理與病害預防', u: '改良場（示意）', type: '防災', aud: ['farmer'], off: 3, s: '豪雨前先清排水，雨後儘快排除積水，並留意葉部病害發生。' },
  { id: 8, t: '寒流來襲 蔬果保鮮與儲存建議', u: '消費教育（示意）', type: '消費', aud: ['buyer'], off: 7, s: '葉菜類以濕紙巾包覆、冷藏直立存放，可延長新鮮度。' },
  { id: 9, t: '農產品產銷履歷標章怎麼看', u: '消費教育（示意）', type: '消費', aud: ['buyer', 'farmer'], off: 9, s: '認識標章樣式與查詢方式，購買時可掃碼了解生產資訊。' },
  { id: 10, t: '使用農業統計資料的注意事項：成交量不等於收成量', u: '研究單位（示意）', type: '研究', aud: ['policy', 'researcher'], off: 10, s: '市場成交量只反映經過批發市場的部分，不能直接當作產量。' },
  { id: 11, t: '友善耕作補助申請時程提醒', u: '縣政府農業處（示意）', type: '政策', aud: ['farmer', 'policy'], off: 12, s: '提醒申請期間、應備文件與常見退件原因。' },
  { id: 13, t: '同樣叫甘藍，為什麼價錢差很多？看懂品項與產地', u: '市場觀察（示意）', type: '技術', aud: ['farmer', 'buyer', 'researcher'], off: 0, s: '高山、丘陵、平地種出來的甘藍，市場上都叫甘藍，但產期與價格不同；看行情時要分開看。' },
  { id: 12, t: '雲林縣特色作物產銷班交流活動', u: '縣政府農業處（示意）', type: '活動', aud: ['farmer', 'policy'], off: 14, s: '邀請產銷班員交流蒜頭、花生等作物的經驗，並介紹最新補助。' },
];

/* =====================================================================
   品項細分（示意）：同一個「作物名」底下，其實有不同產地、品種，另外進口要獨立
   總價＝各細項依交易量加權平均；進口不併入國產總價
   ===================================================================== */
const VARIANTS = {
  cabbage: [
    { k: '1', name: '平地甘藍', short: '平地', area: '平地', f: .80, w: .50, a: .18, pk: 15 },
    { k: '2', name: '丘陵甘藍', short: '丘陵', area: '丘陵', f: 1.00, w: .22, a: .25, pk: 330 },
    { k: '3', name: '高山甘藍', short: '高山', area: '高山（高冷地）', f: 1.50, w: .28, a: .60, pk: 200 },
  ],
  napa: [
    { k: '1', name: '平地結球白菜', short: '平地', area: '平地', f: .86, w: .62, a: .12, pk: 20 },
    { k: '2', name: '高山結球白菜', short: '高山', area: '高山（高冷地）', f: 1.38, w: .38, a: .55, pk: 200 },
  ],
  garlic: [
    { k: '1', name: '蒜球（帶皮）', short: '蒜球', area: '國產', f: .94, w: .70, a: .10, pk: 150 },
    { k: '2', name: '蒜仁（去皮）', short: '蒜仁', area: '國產', f: 1.20, w: .30, a: .15, pk: 60 },
  ],
  bamboo: [
    { k: '1', name: '綠竹筍', short: '綠竹筍', area: '國產', f: 1.05, w: .45, a: .70, pk: 190 },
    { k: '2', name: '桂竹筍', short: '桂竹筍', area: '國產', f: .80, w: .25, a: .80, pk: 110 },
    { k: '3', name: '麻竹筍', short: '麻竹筍', area: '國產', f: 1.12, w: .30, a: .70, pk: 230 },
  ],
};
const IMPORTS = { garlic: { f: .70, w: .22 }, peanut: { f: .86, w: .16 } };
function variantMix(c, dn) {
  return memoize(`vm|${c.id}|${dn}`, () => {
    const vs = VARIANTS[c.id], doy = ((dn % 365) + 365) % 365;
    const ws = vs.map(v => v.w * (1 + v.a * Math.cos(2 * Math.PI * (doy - v.pk) / 365))), sw = ws.reduce((a, b) => a + b, 0), sh = ws.map(w => w / sw);
    const fs = vs.map(v => v.f * (1 + (vnoise(c.id + v.k + 'f', dn / 8) - .5) * .14) * (1 + (hash(c.id, v.k, dn, 'd') - .5) * .06)), norm = sh.reduce((s, x, i) => s + x * fs[i], 0);
    return vs.map((v, i) => ({ v, share: sh[i], f: fs[i] / norm }));
  });
}
function variantQuotes(c, m, dn) {
  if (!VARIANTS[c.id]) return [];
  const mix = variantMix(c, dn), prev = variantMix(c, dn - 1), a0 = avgPrice(c, m, dn), p0 = avgPrice(c, m, dn - 1), vol0 = volDay(c, m, dn);
  return mix.map((x, i) => {
    const price = a0 * x.f, pp = p0 * prev[i].f, sp = .08 + hash(c.id, m.id, dn, x.v.k) * .06;
    return { v: x.v, code: c.code + x.v.k, avg: +f1(price), hi: +f1(price * (1 + sp)), lo: +f1(price * (1 - sp)), mid: +f1(price * (1 + (hash(c.id, m.id, dn, x.v.k, 'm') - .5) * .03)),
      share: x.share, vol: Math.round(vol0 * x.share / 10) * 10, chg: (price - pp) / pp, rel: x.f - 1, slot: i };
  });
}
function importQuote(c, m, dn) {
  const im = IMPORTS[c.id]; if (!im) return null;
  const nz = d => 1 + (vnoise(c.id + 'imp', d / 7) - .5) * .12;
  const a = avgPrice(c, m, dn) * im.f * nz(dn), p = avgPrice(c, m, dn - 1) * im.f * nz(dn - 1), sp = .07 + hash(c.id, m.id, dn, 'imp') * .05;
  return { name: c.name + '（進口）', code: c.code + '9', avg: +f1(a), hi: +f1(a * (1 + sp)), lo: +f1(a * (1 - sp)), mid: +f1(a), vol: Math.round(volDay(c, m, dn) * im.w / 10) * 10, chg: (a - p) / p };
}
