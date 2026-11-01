'use strict';
/* 農業資訊平台｜手機版_政策者｜由共用原始碼建置，這份是完整獨立的 */
const APP = {"id": "policy", "dir": "手機版_政策者", "view": "phone", "title": "GRGR 綠綠｜政策者（手機版）", "ver": "1.0", "built": "2026-11-01", "hub": {"home": "../入口.html", "items": [{"dir": "手機版_農友", "name": "農友", "view": "phone", "href": "../手機版_農友/index.html"}, {"dir": "手機版_消費者", "name": "消費者", "view": "phone", "href": "../手機版_消費者/index.html"}, {"dir": "手機版_政策者", "name": "政策者", "view": "phone", "href": "../手機版_政策者/index.html"}, {"dir": "手機版_研究者", "name": "研究者", "view": "phone", "href": "../手機版_研究者/index.html"}, {"dir": "電腦版_政策者", "name": "政策者", "view": "desk", "href": "../電腦版_政策者/index.html"}, {"dir": "電腦版_研究者", "name": "研究者", "view": "desk", "href": "../電腦版_研究者/index.html"}]}};

/* ===================== data.js ===================== */
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

/* ===================== icons.js ===================== */
/* 圖示（描邊式向量圖） */
const ICON = {
  prices: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
  weather: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
  stats: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  know: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  me: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  chart: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  offline: '<line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  warn: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  serious: '<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  refresh: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  mega: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
  truck: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  sprout: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  swap: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  map: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
  table: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/>',
  rain: '<line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>',
  cold: '<line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/>',
  wind: '<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>',
  thermo: '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>',
  storm: '<path d="M21 4H3"/><path d="M18 8H6"/><path d="M19 12H9"/><path d="M16 16h-6"/><path d="M11 20H9"/>',
  basket: '<path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="m5 11 4-7"/><path d="m9 11 1 9"/>',
  bank: '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
  flask: '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  drop: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  news: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>',
  store: '<path d="m2 7 2-4h16l2 4"/><path d="M4 7v13h16V7"/><path d="M2 7a3 3 0 0 0 5.5 1.5A3 3 0 0 0 12 9a3 3 0 0 0 4.5-.5A3 3 0 0 0 22 7"/><path d="M10 20v-6h4v6"/>',
};
const ico = (n, cls = 'ico') => `<svg viewBox="0 0 24 24" class="${cls}" aria-hidden="true">${ICON[n]}</svg>`;
Object.assign(ICON, {
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  dl: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  chev: '<polyline points="6 9 12 15 18 9"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
});

/* ===================== art.js ===================== */
/* =====================================================================
   插圖：作物、天氣、頁首田野（全部是自己畫的向量圖，不依賴外部圖片）
   作物與天氣圖用固定的自然色，放在淺色圓角底上，白底、黑底都看得清楚
   ===================================================================== */
const CROP_ART = {
  garlic: `<path d="M32 14C31 20 22 22 18 32C14 42 20 54 32 54C44 54 50 42 46 32C42 22 33 20 32 14Z" fill="#F6F1E7" stroke="#CDBFA6" stroke-width="1.6" stroke-linejoin="round"/><path d="M32 22C26 30 25 44 31 53M32 22C38 30 39 44 33 53" fill="none" stroke="#D6CAB3" stroke-width="1.6" stroke-linecap="round"/><path d="M27 26C22 32 21 40 24 47M37 26C42 32 43 40 40 47" fill="none" stroke="#B98FCB" stroke-width="1.3" stroke-linecap="round" opacity=".75"/><path d="M30.4 15L31.4 6.5C31.6 5 33.4 5 33.6 6.5L33.8 15Z" fill="#EADFC6" stroke="#CDBFA6" stroke-width="1.3" stroke-linejoin="round"/><path d="M28 54L26 59M32 54V60M36 54L38 59" stroke="#A8946F" stroke-width="1.8" stroke-linecap="round"/>`,
  cabbage: `<circle cx="32" cy="34" r="22" fill="#74B552"/><path d="M32 12C16 14 8 30 14 44C18 52 28 56 32 56C32 40 32 24 32 12Z" fill="#9BD175"/><path d="M32 12C48 14 56 30 50 44C46 52 36 56 32 56C32 40 32 24 32 12Z" fill="#62A845"/><path d="M32 14C25 24 23 42 32 55M32 14C39 24 41 42 32 55" fill="none" stroke="#D5EDBD" stroke-width="2.2" stroke-linecap="round"/><path d="M18 28C24 30 28 34 30 40M46 28C40 30 36 34 34 40M20 42C24 42 28 44 30 48M44 42C40 42 36 44 34 48" stroke="#3F7D2B" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".6"/>`,
  napa: `<path d="M32 6C20 12 15 34 19 52C20 56 25 58 32 58C39 58 44 56 45 52C49 34 44 12 32 6Z" fill="#F0F4CE" stroke="#C8D59A" stroke-width="1.5"/><path d="M32 6C21 10 16 22 17 32C25 29 30 20 32 6Z" fill="#86BF5E"/><path d="M32 6C43 10 48 22 47 32C39 29 34 20 32 6Z" fill="#6DAD49"/><path d="M32 10V56M25 24C26 35 27 45 28 54M39 24C38 35 37 45 36 54" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M32 36C26 34 22 36 20 42M32 36C38 34 42 36 44 42" stroke="#BFCF86" stroke-width="1.4" fill="none" stroke-linecap="round"/>`,
  peanut: `<g transform="rotate(-28 32 32)"><path d="M9 32C9 21 17 17 25 19.5C30 21 31 24 32 24C33 24 34 21 39 19.5C47 17 55 21 55 32C55 43 47 47 39 44.5C34 43 33 40 32 40C31 40 30 43 25 44.5C17 47 9 43 9 32Z" fill="#E9CB93" stroke="#C4954F" stroke-width="1.7" stroke-linejoin="round"/><g fill="#C4954F" opacity=".6"><circle cx="18" cy="27" r="1.3"/><circle cx="23" cy="35" r="1.3"/><circle cx="16" cy="34" r="1.3"/><circle cx="21" cy="28" r="1.3"/><circle cx="44" cy="28" r="1.3"/><circle cx="47" cy="35" r="1.3"/><circle cx="41" cy="36" r="1.3"/><circle cx="46" cy="28" r="1.3"/></g></g>`,
  lettuce: `<circle cx="20" cy="38" r="13" fill="#A6D96F"/><circle cx="44" cy="38" r="13" fill="#98CE5C"/><circle cx="32" cy="26" r="14" fill="#BBE882"/><circle cx="32" cy="42" r="15" fill="#8AC754"/><path d="M32 18C28 28 28 40 32 56M32 56C24 48 18 40 16 32M32 56C40 48 46 40 48 32" stroke="#EAF8CF" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".9"/><path d="M12 36C16 34 18 32 18 28M52 36C48 34 46 32 46 28M24 20C28 22 30 22 32 18C34 22 36 22 40 20" stroke="#63A038" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".75"/>`,
  bamboo: `<ellipse cx="32" cy="55" rx="17" ry="4" fill="#8E6B3E"/><path d="M32 6C27 20 17 36 15 54H49C47 36 37 20 32 6Z" fill="#EBD6A5" stroke="#C4A262" stroke-width="1.5" stroke-linejoin="round"/><path d="M32 6C29.5 13 27.5 18 26 24H38C36.5 18 34.5 13 32 6Z" fill="#7BB458"/><path d="M22 36C28 39 36 39 42 36M19 46C27 50 37 50 45 46M25 26C29 28 35 28 39 26" stroke="#B0854A" stroke-width="1.7" fill="none" stroke-linecap="round"/><path d="M32 26V54" stroke="#D3B97F" stroke-width="1.3" opacity=".8"/>`,
  leaf: `<path d="M12 50C12 28 26 12 52 10C52 36 40 52 18 54" fill="#7DBB5A" stroke="#4F8F37" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 52C24 40 34 30 46 18" stroke="#D5EDBD" stroke-width="2" fill="none" stroke-linecap="round"/>`,
};
function cropArt(id, s = 48) {
  return `<svg class="art" width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${CROP_ART[id] || CROP_ART.leaf}</svg>`;
}
const CROP_BG = { garlic: '#EADFF3', cabbage: '#DDEFCF', napa: '#E9F2CC', peanut: '#F7E4C3', lettuce: '#D9F0C4', bamboo: '#F4E6C6' };
const artBox = (id, s = 40, cls = '') => `<span class="artbox ${cls}" style="--as:${s}px;--ab:${CROP_BG[id] || '#E6F0DE'}">${cropArt(id, Math.round(s * .86))}</span>`;

/* 天氣：依降雨機率決定畫哪一種 */
const SUN_RAYS = Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4, c = Math.cos(a), s = Math.sin(a); return `M${(32 + c * 17).toFixed(1)} ${(32 + s * 17).toFixed(1)}L${(32 + c * 23).toFixed(1)} ${(32 + s * 23).toFixed(1)}`; }).join('');
const CLOUD = 'M18 46h27a9 9 0 0 0 1-17.9A13 13 0 0 0 21 31a8 8 0 0 0-3 15z';
function wxKind(pop) { return pop >= 70 ? 'rain' : pop >= 40 ? 'shower' : pop >= 20 ? 'cloud' : 'partly'; }
const WX_NAME = { rain: '雨', shower: '短暫陣雨', cloud: '多雲', partly: '晴時多雲' };
function wxArt(kind, s = 72) {
  const sun = (cx, cy, k) => `<g transform="translate(${cx - 32 * k} ${cy - 32 * k}) scale(${k})"><circle cx="32" cy="32" r="12" fill="#FFC93C"/><path d="${SUN_RAYS}" stroke="#FFC93C" stroke-width="3.2" stroke-linecap="round"/></g>`;
  const cloud = (dx, dy, k = 1) => `<path transform="translate(${dx} ${dy}) scale(${k})" d="${CLOUD}" fill="#FFFFFF" stroke="#7F9BBE" stroke-width="1.8" stroke-linejoin="round"/>`;
  const drops = n => Array.from({ length: n }, (_, i) => { const x = 24 + i * 10 - (n === 2 ? -4 : 0); return `<path d="M${x} 50L${x - 3} 57" stroke="#3F86F2" stroke-width="3.2" stroke-linecap="round"/>`; }).join('');
  let g;
  if (kind === 'rain') g = cloud(0, -6) + drops(3);
  else if (kind === 'shower') g = sun(22, 22, .62) + cloud(2, -2, .94) + drops(2);
  else if (kind === 'cloud') g = sun(40, 20, .46) + cloud(-2, 2, 1.02);
  else g = sun(26, 26, .72) + cloud(8, 6, .8);
  return `<svg class="art wx-svg" width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${g}</svg>`;
}

const wxPlate = (kind, s = 80) => `<span class="wxplate" style="--ps:${s}px">${wxArt(kind, Math.round(s * .84))}</span>`;

/* ===================== calc_common.js ===================== */
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


/* ===================== core.js ===================== */
/* =====================================================================
   狀態、設定記憶、共用元件、圖表
   ===================================================================== */
const KEY = 'agri-' + APP.id + '-' + APP.view;   // 每份各自存設定，不會互相覆蓋
let memStore = null;
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
function loadSaved() { try { const t = localStorage.getItem(KEY); if (t) { const v = JSON.parse(t); if (isObj(v)) return v; } } catch (e) { } return memStore || {}; }   // 存壞了就當作沒有，改用預設值
const sv0 = loadSaved();
const S = Object.assign({
  id: 'farmer', density: null, font: null, outdoor: false, region: '雲林縣', town: null, watched: ['garlic', 'cabbage'], market: null,
  stars: [], notes: [], rs: { crops: ['cabbage', 'napa', 'lettuce'], per: 24, q: '葉菜類價格波動是否與主要產區供應集中有關？' },
  crop: 'cabbage', range: 30, kType: 'all', scrop: 'garlic',
}, sv0, { tab: 'home', sheet: false, open: {}, kQ: '', demo: { closed: 'tc', offline: false, extra: 0 }, net: true, restoreMsg: '', sec: null, confirmReset: false });
S.id = APP.id;   // 身分固定，由這一份決定
S.watched = (Array.isArray(S.watched) ? S.watched : []).filter(i => CROP[i]);
S.stars = Array.isArray(S.stars) ? S.stars.filter(Number.isInteger) : [];
S.notes = (Array.isArray(S.notes) ? S.notes : []).filter(n => isObj(n) && typeof n.text === 'string').slice(0, 200).map(n => ({ at: String(n.at || ''), q: String(n.q || ''), text: n.text }));
if (!COUNTIES.includes(S.region)) S.region = '雲林縣';
if (S.town && !(isPilot(S.region) && TOWNS_YL.includes(S.town))) S.town = null;
if (!['simple', 'focus', 'pro'].includes(S.density)) S.density = null;
if (!['m', 'l', 'xl'].includes(S.font)) S.font = null;
if (S.market && !MK[S.market]) S.market = null;
if (!CROP[S.crop]) S.crop = 'cabbage';
if (!EXT_NAME[S.scrop]) S.scrop = 'garlic';
if (!['all', 'rec', 'star', '技術', '行情', '消費', '政策', '研究', '防災', '活動'].includes(S.kType)) S.kType = 'all';
if (![7, 30, 90, 365].includes(S.range)) S.range = 30;
if (!S.rs || !Array.isArray(S.rs.crops)) S.rs = { crops: ['cabbage', 'napa', 'lettuce'], per: 24, q: '' };
S.rs.crops = S.rs.crops.filter(i => CROP[i]); if (!S.rs.crops.length) S.rs.crops = ['cabbage'];
if (![12, 24, 36].includes(S.rs.per)) S.rs.per = 24;
if (typeof S.rs.q !== 'string') S.rs.q = '';
function persist() {
  const p = { id: S.id, density: S.density, font: S.font, outdoor: S.outdoor, region: S.region, town: S.town, watched: S.watched, market: S.market, stars: S.stars, notes: S.notes, rs: S.rs, crop: S.crop, range: S.range, kType: S.kType, scrop: S.scrop };
  memStore = p; try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { }
}

/* ---------- 顯示設定 ---------- */
const DENS_N = { simple: 1, focus: 2, pro: 3 };
const effDensity = () => S.density || DENS_OF_ID[S.id] || 'simple';
const D = () => DENS_N[effDensity()];
const lv = n => D() >= n;
const effFont = () => S.font || ((S.id === 'farmer' || S.id === 'buyer') ? 'l' : 'm');
const buyerOnly = () => S.id === 'buyer';
const priceLabel = () => buyerOnly() ? '批發參考價' : '批發行情';
const isPhone = () => APP.view === 'phone';   // 手機版／電腦版固定，不隨視窗寬度切換
function applyView() {
  const b = document.body, h = document.documentElement;
  b.classList.toggle('vp', isPhone()); b.classList.toggle('vd', !isPhone()); b.classList.toggle('outdoor', !!S.outdoor);
  h.setAttribute('data-f', effFont());
}

/* ---------- 市場、休市、更新時間 ---------- */
const curMarket = () => MK[S.market || MKT_OF[S.region] || 'xl'];
const isClosed = m => S.demo.closed === m.id;
const tradeDn = m => isClosed(m) ? TODAY_DN - 1 : TODAY_DN;
const UPD = (() => { const d = new Date(TODAY.getTime() + 5.5 * 3600e3); return d > NOW ? new Date(d.getTime() - DAY) : d; })();
const updText = () => `${UPD.getDate() === TODAY.getDate() ? '今天' : '昨天'} ${fmtHM(UPD)}`;
const ALIAS = { cabbage: '高麗菜', napa: '大白菜', lettuce: 'A菜', bamboo: '', garlic: '', peanut: '落花生' };
const cname = c => c.name;
const regionName = () => S.region + (S.town ? ' ' + S.town : '');

/* ---------- 標示與小元件 ---------- */
const LBL = { off: '官方統計', calc: '平台計算', approx: '近似指標', model: '模型預測' };
const lbl = k => `<span class="lbl lbl-${k}">${LBL[k]}</span>`;
const SIM = '<span class="lbl lbl-sim">模擬資料</span>';
const foot = (...ks) => `<div class="cardfoot">${ks.map(lbl).join('')}${SIM}</div>`;
const cropArtBox = (id, s = 40) => artBox(id, s);
function ud(chg) {
  const a = Math.abs(chg * 100).toFixed(1);
  if (Math.abs(chg) < .0005) return '<span class="flat">■ 持平</span>';
  return chg > 0 ? `<span class="up">▲ ${a}%</span>` : `<span class="down">▼ ${a}%</span>`;
}
const tfoot = (...ks) => `<span class="cardfoot tf">${ks.map(lbl).join('')}${SIM}</span>`;   // 資料性質標示放在標題列右側（版面緊的卡片用）
const card = (title, right, body, o = {}) => `<section class="card ${o.cls || ''}"${o.id ? ` id="${o.id}"` : ''}>${title ? `<div class="card-title"><h3>${title}</h3>${(right || o.tfoot) ? `<span>${right || ''}${o.tfoot ? tfoot(...o.tfoot) : ''}</span>` : ''}</div>` : ''}${body}${o.foot ? foot(...o.foot) : ''}</section>`;
const callout = t => `<div class="callout">${t}</div>`;
function offlineBanner() {
  if (!(S.demo.offline || !S.net)) return '';
  return `<div class="banner off" role="status">${ico('offline', '')}<div class="grow"><b>目前連不上資料來源</b>先顯示上次成功更新（${updText()}）的資料，數字可能不是最新的。<div style="margin-top:8px"><button class="btn sm" data-a="retry">重新整理</button></div></div></div>`;
}
function closedBanner(m) {
  return `<div class="banner closed" role="status">${ico('moon', '')}<div class="grow"><b>今日市場休市</b>${esc(m.name)}今天沒有交易，下方顯示最後交易日（${fmtRoc(dateOf(TODAY_DN - 1))}）的行情。</div></div>`;
}
const mkOpts = (sel, withAll) => `${withAll ? `<option value="" ${!sel ? 'selected' : ''}>${withAll}</option>` : ''}${MARKETS.map(m => `<option value="${m.id}" ${m.id === sel ? 'selected' : ''}>${m.name}${isClosed(m) ? '（今日休市）' : ''}</option>`).join('')}`;
const cropOpts = sel => CROPS.map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${c.name}</option>`).join('');

function exportCSV(name, rows) {
  const cell = v => { const s = v == null ? '' : String(v); return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const csv = '﻿' + rows.map(r => r.map(cell).join(',')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 500);
}

/* ---------- 備份代碼（7 碼，含檢查碼） ---------- */
const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function encodeState() {
  const idx = Math.max(0, IDS.findIndex(x => x.id === S.id));
  const dens = S.density ? DENS.findIndex(d => d.id === S.density) + 1 : 0, font = S.font === 'm' ? 1 : S.font === 'l' ? 2 : S.font === 'xl' ? 3 : 0;
  const reg = COUNTIES.indexOf(S.region), town = S.town ? TOWNS_YL.indexOf(S.town) + 1 : 0;
  const wmask = CROPS.reduce((m, c, i) => S.watched.includes(c.id) ? m | (1 << i) : m, 0), mk = S.market ? MARKETS.findIndex(m => m.id === S.market) + 1 : 0;
  let v = 0n; const push = (x, b) => { v = (v << BigInt(b)) | BigInt(x); };
  push(idx, 2); push(dens, 2); push(font, 2); push(S.outdoor ? 1 : 0, 1); push(reg, 5); push(town, 5); push(wmask, 6); push(mk, 3);
  v = (v << 5n) | (v % 31n);
  let s = ''; for (let i = 0; i < 7; i++) { s = B32[Number(v & 31n)] + s; v >>= 5n; }
  return 'AG-' + s.slice(0, 4) + '-' + s.slice(4);
}
function decodeState(txt) {
  let t = String(txt || '').toUpperCase().replace(/^AG/, '').replace(/[^0-9A-Z]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1').replace(/U/g, 'V');
  if (t.length !== 7) return null;
  let v = 0n; for (const ch of t) { const k = B32.indexOf(ch); if (k < 0) return null; v = (v << 5n) | BigInt(k); }
  const chk = v & 31n; v >>= 5n; if (v % 31n !== chk) return null;
  const pop = b => { const x = Number(v & ((1n << BigInt(b)) - 1n)); v >>= BigInt(b); return x; };
  const mk = pop(3), wmask = pop(6), town = pop(5), reg = pop(5), out = pop(1), font = pop(2), dens = pop(2), idx = pop(2);
  if (reg >= COUNTIES.length || town > TOWNS_YL.length || mk > MARKETS.length || dens > 3) return null;
  const region = COUNTIES[reg];
  return { id: IDS[idx].id, density: dens ? DENS[dens - 1].id : null, font: [null, 'm', 'l', 'xl'][font], outdoor: !!out, region, town: (town && isPilot(region)) ? TOWNS_YL[town - 1] : null,
    watched: CROPS.filter((_, i) => wmask & (1 << i)).map(c => c.id), market: mk ? MARKETS[mk - 1].id : null };
}

/* =====================================================================
   圖表（SVG）：折線／長條，滑過或鍵盤方向鍵可看數值，下方可展開數字表
   ===================================================================== */
const CH = {}; let chN = 0;
const COL = ['#2f7657', '#4f84a6', '#a87a2c', '#6b8a3e'];
const DASH = ['', '7 4', '2 4', '10 3 2 3'];
function niceTicks(min, max, n = 4) {
  if (min === max) { min -= 1; max += 1; }
  const raw = (max - min) / n, mag = Math.pow(10, Math.floor(Math.log10(raw))), norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const lo = Math.floor(min / step + 1e-9) * step, hi = Math.ceil(max / step - 1e-9) * step, t = [];
  for (let v = lo; v <= hi + step / 2; v += step) t.push(+v.toFixed(6));
  return t;
}
const fmtN = (v, d) => v == null ? '—' : (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString('en-US') : (d != null ? v.toFixed(d) : (Math.abs(v) >= 100 ? v.toFixed(0) : (Math.round(v * 10) / 10).toString())));
function chart(cfg) {
  const id = 'ch' + (chN++);
  cfg.series.forEach((s, i) => { s.color = s.color || COL[i % COL.length]; s.dash = cfg.type === 'bar' ? '' : (s.dash != null ? s.dash : DASH[i % DASH.length]); });
  cfg.fmt = cfg.fmt || (v => fmtN(v));
  CH[id] = cfg;
  const s0 = cfg.series[0].vals.filter(v => v != null);
  const sum = s0.length ? `${cfg.series[0].name}：從 ${cfg.x[cfg.series[0].vals.findIndex(v => v != null)]} 的 ${cfg.fmt(s0[0])} 到 ${cfg.x[cfg.x.length - 1]} 的 ${cfg.fmt(s0[s0.length - 1])}，最高 ${cfg.fmt(Math.max(...s0))}，最低 ${cfg.fmt(Math.min(...s0))}` : '沒有資料';
  const legend = `<div class="legend">${cfg.series.map(s => `<span>${cfg.type === 'bar' ? `<i class="dot" style="background:${s.color};border-radius:2px"></i>` : `<svg width="24" height="8" aria-hidden="true"><line x1="1" y1="4" x2="23" y2="4" stroke="${s.color}" stroke-width="${Math.min(s.w || 2.6, 3.4)}" stroke-linecap="round" stroke-dasharray="${s.dash}"/></svg>`}${esc(s.name)}</span>`).join('')}${cfg.unit ? `<span>單位：${esc(cfg.unit)}</span>` : ''}${cfg.note ? `<span>${cfg.note}</span>` : ''}</div>`;
  const wrap = cfg.fill ? 'class="chart-wrap fill"' : `class="chart-wrap" style="height:${cfg.h || 200}px"`;   // fill＝高度由所在卡片決定（總覽一頁看完用）
  return `<div ${wrap}><div class="chart" id="${id}" data-cid="${id}" tabindex="0" role="img" aria-label="${esc(cfg.label || '圖表')}。${esc(sum)}。可用左右方向鍵逐點查看。"></div></div>${legend}${cfg.table === false ? '' : cfg.table === 'sr' ? srTable(cfg) : tableView(cfg)}`;
}
/* 版面太緊時不顯示「看數字表」，但螢幕閱讀器仍讀得到完整數字 */
function srTable(cfg) {
  return `<div class="sr"><table><caption>${esc(cfg.label || '圖表')}的數字</caption><thead><tr><th></th>${cfg.series.map(s => `<th>${esc(s.name)}</th>`).join('')}</tr></thead><tbody>${cfg.x.map((x, i) => `<tr><th scope="row">${esc(x)}</th>${cfg.series.map(s => `<td>${s.vals[i] == null ? '無資料' : cfg.fmt(s.vals[i])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function tableView(cfg) {
  const n = cfg.x.length, step = n > 40 ? Math.ceil(n / 40) : 1, rows = [];
  for (let i = n - 1; i >= 0; i -= step) rows.push(`<tr><th scope="row" style="font-weight:600">${esc(cfg.x[i])}</th>${cfg.series.map(s => `<td class="num">${s.vals[i] == null ? '—' : cfg.fmt(s.vals[i])}</td>`).join('')}</tr>`);
  return `<details class="tv"><summary>看數字表${step > 1 ? `（每 ${step} 點取 1 點）` : ''}</summary><div class="scroll"><table class="table"><thead><tr><th></th>${cfg.series.map(s => `<th class="num">${esc(s.name)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div></details>`;
}
const SVGNS = 'http://www.w3.org/2000/svg';
function drawChart(el) {
  const cfg = CH[el.dataset.cid]; if (!cfg) return;
  const W = Math.max(220, el.clientWidth), H = Math.max(120, el.clientHeight);
  const bar = cfg.type === 'bar', pl = 42, pr = cfg.endLabels ? 46 : 12, pt = 12, pb = 26, n = cfg.x.length, k = cfg.series.length;
  const all = cfg.series.flatMap(s => s.vals).filter(v => v != null);
  if (!all.length) { el.innerHTML = '<div class="sub" style="padding:20px">沒有資料</div>'; return; }
  let mn = cfg.ymin != null ? cfg.ymin : Math.min(...all), mx = cfg.ymax != null ? cfg.ymax : Math.max(...all);
  if (bar) mn = Math.min(0, mn);
  const pad = (mx - mn) * .08 || 1; if (cfg.ymin == null && !bar) mn -= pad; if (cfg.ymax == null) mx += bar ? 0 : pad;
  const tk = niceTicks(mn, mx, 4); mn = tk[0]; mx = tk[tk.length - 1];
  const band = (W - pl - pr) / n;
  const X = i => bar ? pl + band * (i + .5) : pl + (W - pl - pr) * (n === 1 ? .5 : i / (n - 1));
  const Y = v => pt + (H - pt - pb) * (1 - (v - mn) / (mx - mn));
  let g = '';
  tk.forEach(t => { const y = Y(t); g += `<line class="gl" x1="${pl}" x2="${W - pr}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"/><text class="ax" x="${pl - 6}" y="${(y + 4).toFixed(1)}" text-anchor="end">${fmtN(t)}</text>`; });
  const lw = Math.max(...cfg.x.map(s => [...String(s)].reduce((a, ch) => a + (ch.charCodeAt(0) > 127 ? 12 : 6.5), 0))) + 16;
  const want = bar && band >= lw ? n : Math.max(2, Math.min(n, Math.floor((W - pl - pr) / lw), 7)), idxs = new Set();
  if (!bar && n <= 12 && n > 2) {   // 點很少的折線：從最後一天往回等距取標籤，最新的一天一定有標
    const gap = (W - pl - pr) / (n - 1), stp = Math.max(1, Math.ceil(lw / gap));
    for (let i = n - 1; i >= 0; i -= stp) idxs.add(i);
    if (idxs.has(0) === false && (Math.min(...idxs) * gap) >= lw) idxs.add(0);
  } else for (let j = 0; j < want; j++) idxs.add(want === 1 ? 0 : Math.round(j * (n - 1) / (want - 1)));
  [...idxs].forEach(i => { const a = bar ? 'middle' : (i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'); g += `<text class="ax" x="${X(i).toFixed(1)}" y="${H - 7}" text-anchor="${a}">${esc(cfg.x[i])}</text>`; });
  if (bar) {
    const bw = Math.min(40, band * .72 / k), gw = bw * k;
    cfg.series.forEach((s, si) => s.vals.forEach((v, i) => {
      if (v == null) return; const x = X(i) - gw / 2 + si * bw, y0 = Y(0), y1 = Y(v), h = Math.max(1, Math.abs(y0 - y1));
      g += `<rect x="${(x + 1).toFixed(1)}" y="${Math.min(y0, y1).toFixed(1)}" width="${Math.max(2, bw - 2).toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${s.color}"${cfg.hl === i ? ' stroke="#1d302b" stroke-width="2"' : ''}/>`;
      if (cfg.vlabel && n <= 12) g += `<text class="ax" x="${(x + bw / 2).toFixed(1)}" y="${(Math.min(y0, y1) - 4).toFixed(1)}" text-anchor="middle" style="fill:#1d302b;font-weight:700">${cfg.fmt(v)}</text>`;
    }));
  } else {
    cfg.series.forEach(s => {
      let d = '', pen = false, last = -1;
      s.vals.forEach((v, i) => { if (v == null) { pen = false; return; } d += `${pen ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`; pen = true; last = i; });
      g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.w || 2.4}" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="${s.dash}"/>`;
      if (last >= 0) g += `<circle cx="${X(last).toFixed(1)}" cy="${Y(s.vals[last]).toFixed(1)}" r="${s.w ? 5 : 4.2}" fill="${s.color}" stroke="#fff" stroke-width="2"/>`;
    });
    if (cfg.endLabels) {   // 線尾直接標數字（文字用一般墨色，靠位置與圖例辨識；太近的往下推開避免重疊）
      const ends = cfg.series.map(s => { let li = -1; s.vals.forEach((v, i) => { if (v != null) li = i; }); return li < 0 ? null : { x: X(li), y: Y(s.vals[li]), v: s.vals[li] }; }).filter(Boolean).sort((a, b) => a.y - b.y);
      for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 14) ends[i].y = ends[i - 1].y + 14;
      ends.forEach(e => { g += `<text class="ax" x="${(e.x + 9).toFixed(1)}" y="${(e.y + 4).toFixed(1)}" style="font-weight:800;font-size:12px">${cfg.fmt(e.v)}</text>`; });
    }
  }
  g += `<line class="xh" id="${el.id}-xh" x1="0" x2="0" y1="${pt}" y2="${H - pb}" visibility="hidden"/><g id="${el.id}-pts"></g><rect x="${pl}" y="0" width="${W - pl - pr}" height="${H - pb}" fill="transparent" class="hit"/>`;
  el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${g}</svg><div class="tip" hidden></div>`;
  const svg = el.firstChild, tip = el.lastChild, xh = svg.querySelector('.xh'), pts = svg.querySelector(`[id="${el.id}-pts"]`);
  let cur = n - 1;
  function show(i) {
    cur = Math.max(0, Math.min(n - 1, i)); const x = X(cur);
    xh.setAttribute('x1', x); xh.setAttribute('x2', x); xh.setAttribute('visibility', bar ? 'hidden' : 'visible');
    pts.innerHTML = bar ? '' : cfg.series.map(s => s.vals[cur] == null ? '' : `<circle cx="${x.toFixed(1)}" cy="${Y(s.vals[cur]).toFixed(1)}" r="5" fill="${s.color}" stroke="#fff" stroke-width="2"/>`).join('');
    tip.innerHTML = `<b>${esc(cfg.x[cur])}</b>${cfg.series.map(s => `<div><i style="background:${s.color}"></i>${esc(s.name)}　${s.vals[cur] == null ? '無資料' : cfg.fmt(s.vals[cur]) + (cfg.unit && cfg.series.length === 1 ? ' ' + esc(cfg.unit) : '')}</div>`).join('')}`;
    tip.hidden = false; const tw = tip.offsetWidth; let left = x + 14; if (left + tw > W - 2) left = x - tw - 14; tip.style.left = Math.max(2, left) + 'px'; tip.style.top = pt + 'px';
  }
  const pos = e => { const r = svg.getBoundingClientRect(), x = e.clientX - r.left; return bar ? Math.floor((x - pl) / band) : Math.round((x - pl) / (W - pl - pr) * (n - 1)); };
  svg.addEventListener('pointermove', e => show(pos(e)));
  svg.addEventListener('pointerdown', e => show(pos(e)));
  svg.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { tip.hidden = true; xh.setAttribute('visibility', 'hidden'); pts.innerHTML = ''; } });
  el.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { show(tip.hidden ? n - 1 : cur - 1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { show(tip.hidden ? 0 : cur + 1); e.preventDefault(); }
    else if (e.key === 'Home') { show(0); e.preventDefault(); } else if (e.key === 'End') { show(n - 1); e.preventDefault(); }
    else if (e.key === 'Escape') { tip.hidden = true; xh.setAttribute('visibility', 'hidden'); pts.innerHTML = ''; }
  });
}
function drawCharts() { $$('.chart').forEach(el => { try { drawChart(el); } catch (e) { console.error(e); el.innerHTML = '<div class="sub" style="padding:16px">這張圖暫時無法顯示。</div>'; } }); }
function spark(vals, color = '#2f7657') {
  const mn = Math.min(...vals), mx = Math.max(...vals), w = 88, h = 34, n = vals.length;
  const d = vals.map((v, i) => `${i ? 'L' : 'M'}${(2 + (w - 4) * i / (n - 1)).toFixed(1)} ${(3 + (h - 6) * (1 - (v - mn) / ((mx - mn) || 1))).toFixed(1)}`).join('');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

/* ===================== shell.js ===================== */
/* 外殼：頂欄、側欄、底部分頁、設定面板 */
const NAV = {
  farmer: [
    { t: 'home', m: '首頁', d: '今日農情', i: 'home' }, { t: 'prices', m: '行情', d: '價格行情', i: 'prices' }, { t: 'stats', m: '種植', d: '種植面積與產量', i: 'stats' },
    { t: 'weather', m: '農情', d: '氣象與災害預警', i: 'weather' }, { t: 'know', m: '知識', d: '知識與新聞', i: 'know' }],
  buyer: [
    { t: 'home', m: '首頁', d: '今日買菜', i: 'home' }, { t: 'prices', m: '行情', d: '價格行情', i: 'prices' }, { t: 'stats', m: '產地', d: '產地與產量', i: 'stats' },
    { t: 'weather', m: '天氣', d: '天氣與警報', i: 'weather' }, { t: 'know', m: '知識', d: '知識與新聞', i: 'know' }],
  policy: [
    { t: 'home', m: '總覽', d: '市場總覽', i: 'grid' }, { t: 'prices', m: '價格', d: '價格行情', i: 'chart' }, { t: 'stats', m: '區域', d: '區域供需', i: 'map' },
    { t: 'weather', m: '災害', d: '災害風險', i: 'shield' }, { t: 'know', m: '政策', d: '政策與知識', i: 'bank' }],
  researcher: [
    { t: 'home', m: '研究', d: '研究總覽', i: 'home' }, { t: 'prices', m: '資料', d: '價格資料', i: 'table' }, { t: 'stats', m: '面積', d: '面積與產量', i: 'layers' },
    { t: 'weather', m: '氣象', d: '氣象資料', i: 'weather' }, { t: 'know', m: '文獻', d: '文獻與新聞', i: 'know' }, { t: 'notes', m: '筆記', d: '研究筆記', i: 'edit' }],
};
const navFor = () => NAV[S.id];
const greet = () => { const h = NOW.getHours(); return h < 11 ? '早安' : h < 17 ? '午安' : '晚安'; };
const dateStr = () => `${TODAY.getFullYear()} 年 ${TODAY.getMonth() + 1} 月 ${TODAY.getDate()} 日`;
/* 品牌：GRGR 綠綠（Green & Growth）。六份共用同一個標誌，身分由頁面標題與設定鈕上的文字區分 */
const BRAND = { mark: ['GR', 'GR'], name: 'GRGR', sub: '綠綠 · Green & Growth', tag: '看見農業，讀懂市場。' };
const dLabel = () => ({ simple: '簡易', focus: '重點', pro: '專業' }[effDensity()]);

function pageMeta() {
  const upd = `資料更新 ${updText()}`, t = S.tab, id = S.id;
  if (t === 'home') {
    if (id === 'farmer') return { e: 'AGRI DAILY', h: `${greet()}，今天農情如何？`, s: '掌握行情、天氣與產地消息，做出更安心的選擇。' };
    if (id === 'buyer') return { e: 'AGRI DAILY', h: `${greet()}，今天買什麼？`, s: '看看這週的行情與當季好選擇，買得更安心。' };
    if (id === 'policy') return { e: 'National agriculture monitor / 01', h: '市場總覽', s: `${dateStr()}・${upd}。從價格、交易量與區域供應掌握近期市場狀態。` };
    return { e: 'Research workspace', h: '研究總覽', s: '建立假設、檢視證據，再形成研究觀察。' };
  }
  if (t === 'prices') return { e: 'Market prices', h: '價格行情', s: `${priceLabel()}・單位：元／公斤・${upd}` };
  if (t === 'stats') return { e: 'Area & production', h: id === 'policy' ? '區域供需' : id === 'buyer' ? '產地與產量' : id === 'researcher' ? '面積與產量' : '種植面積與產量', s: `官方統計落後約一年（目前最新為 ${roc(STAT_YEAR)} 年）。` };
  if (t === 'weather') return { e: 'Weather & alerts', h: id === 'policy' ? '災害風險' : '氣象與災害預警', s: `${regionName()}・${upd}` };
  if (t === 'know') return { e: 'Knowledge & news', h: id === 'policy' ? '政策與知識' : '知識與新聞', s: '技術、行情、消費與政策的整理（示意內容）。' };
  return { e: 'Research notes', h: '研究筆記', s: '記錄觀察與待辦，存在這台裝置的瀏覽器中。' };
}
/* 手機版的頁首按鈕（電腦版沒有頁首，操作列見 pageBar） */
function pageActions() {
  const t = S.tab, id = S.id;
  if (t === 'home' && id === 'researcher') return `<button class="btn" data-a="export" data-v="rs">${ico('dl')}下載資料</button>`;
  if (t === 'prices') return `<label class="sel only-d"><span class="sr">市場</span><select data-c="market" aria-label="選擇市場">${mkOpts(curMarket().id)}</select></label>${lv(2) ? `<button class="btn" data-a="export" data-v="prices">${ico('dl')}匯出資料</button>` : ''}`;
  if (t === 'stats' && lv(2)) return `<button class="btn" data-a="export" data-v="stats">${ico('dl')}匯出資料</button>`;
  return '';
}
/* 電腦版：左邊側欄已標示目前頁面，所以不再放大標題；只留這一頁真正需要的控制項與口徑說明，沒有就整列不出現 */
function pageBar() {
  const t = S.tab; let ctrl = '', note = '', act = '';
  if (t === 'prices') {
    note = `${priceLabel()}・單位：元／公斤`;
    ctrl = `<label class="sel"><span>市場</span><select data-c="market" aria-label="選擇市場">${mkOpts(curMarket().id)}</select></label>`;
    if (lv(2)) act = `<button class="btn" data-a="export" data-v="prices">${ico('dl')}匯出資料</button>`;
  } else if (t === 'stats') {
    note = `官方統計落後約一年（目前最新為 ${roc(STAT_YEAR)} 年）`; ctrl = statsSel();
    if (lv(2)) act = `<button class="btn" data-a="export" data-v="stats">${ico('dl')}匯出資料</button>`;
  } else if (t === 'weather') ctrl = regionPicker();
  return (ctrl || note || act) ? `<div class="page-bar">${ctrl}${note ? `<span class="pb-note">${note}</span>` : ''}${act ? `<div class="actions">${act}</div>` : ''}</div>` : '';
}

/* 切換版本：只是連結，不是依賴。沒有 APP.hub（單獨上架時）就完全不顯示，也不會影響這一份的運作 */
const hubPill = (icon) => !APP.hub ? '' : icon
  ? `<a class="pill ic" href="${esc(APP.hub.home)}" aria-label="切換其他版本（回入口頁）" title="切換其他版本">${ico('swap', 'ico')}</a>`
  : `<a class="pill" href="${esc(APP.hub.home)}" aria-label="切換其他版本（回入口頁）">${ico('swap', 'ico')}切換版本</a>`;
function hubGroup() {
  if (!APP.hub) return '';
  const row = (view, label) => `<div class="sub" style="margin:10px 0 6px"><b>${label}</b></div><div class="filterbar">${APP.hub.items.filter(i => i.view === view).map(i => `<a class="btn${i.dir === APP.dir ? ' selected' : ''}" href="${esc(i.href)}"${i.dir === APP.dir ? ' aria-current="page"' : ''}>${esc(i.name)}</a>`).join('')}</div>`;
  return `<div class="grp"><b>切換版本</b><div class="sub">每一份都是獨立的版本，設定與筆記各自分開；切過去再切回來，這一份的設定還在。</div>${row('phone', '手機版')}${row('desk', '電腦版')}<div class="filterbar" style="margin-top:10px"><a class="btn" href="${esc(APP.hub.home)}">回入口頁</a></div></div>`;
}

function shell() {
  const nav = navFor(), meta = pageMeta();
  const brand = `<div class="brand"><div class="brand-mark" aria-hidden="true"><span>${BRAND.mark[0]}</span><span>${BRAND.mark[1]}</span></div><div class="bw"><b class="bn">${BRAND.name}</b><span class="bs">${BRAND.sub}</span><span class="bt">${BRAND.tag}</span></div></div>`;
  const side = nav.map(n => `<a class="nav-item ${n.t === S.tab ? 'active' : ''}" href="#/${n.t}"${n.t === S.tab ? ' aria-current="page"' : ''}>${ico(n.i, 'nav-ico')}${n.d}</a>`).join('');
  const bott = nav.map(n => `<a href="#/${n.t}" class="${n.t === S.tab ? 'active' : ''}"${n.t === S.tab ? ' aria-current="page"' : ''}>${ico(n.i)}<span>${n.m}</span></a>`).join('');
  const pillTxt = `${ID_BY[S.id].short}・${dLabel()}`;
  const sideNote = S.id === 'researcher'
    ? `<b>目前研究問題</b><br>${esc(S.rs.q || '（尚未輸入）')}<br><br><span class="tag">假設 H1</span>`
    : S.id === 'policy' ? '<b>監測口徑</b><br>價格指數以各作物近一年平均為 100 計算。此頁數值為模擬資料，非正式統計。'
    : '<b>資料說明</b><br>行情為批發市場成交價，不等於田間收購價或零售價。此頁數值為模擬資料。';
  const body = renderBody();
  return `<a class="skip" href="#main" data-a="skip">跳到主要內容</a>
<div class="app">
 <header class="topbar"><div>${brand}</div><div class="top-meta"><span>資料更新　${updText()}</span>${hubPill(false)}<button class="pill" data-a="sheet" aria-haspopup="dialog">${ico('pin', 'ico')}${esc(regionName())}</button><button class="pill" data-a="sheet" aria-haspopup="dialog">${ico('gear', 'ico')}${esc(pillTxt)}</button></div></header>
 <div class="layout">
  <aside class="sidebar" aria-label="功能選單"><div class="side-label">${S.id === 'researcher' ? '研究空間' : S.id === 'policy' ? '市場監測' : '功能'}</div>${side}<div class="sidebar-note">${sideNote}</div></aside>
  <main class="main" id="main" tabindex="-1">
   ${isPhone() ? `<div class="head-wrap">
    <div class="mobile-top only-m">${brand}<div class="mt-r">${hubPill(true)}<button class="pill" data-a="sheet" aria-haspopup="dialog" aria-label="設定：${esc(pillTxt)}">${ico('gear', 'ico')}<span class="pt"><span class="pp">${esc(ID_BY[S.id].short)}・</span>${esc(dLabel())}</span></button></div></div>
    <div class="page-head"><div><div class="eyebrow">${meta.e}</div><h1>${meta.h}</h1><p class="sub">${meta.s}</p></div><div class="actions">${pageActions()}</div></div>
   </div>` : `<h1 class="sr">${meta.h}</h1>${pageBar()}`}
   <div class="page-body">${offlineBanner()}${body}</div>
  </main>
 </div>
 <nav class="mobile-nav only-m" aria-label="主要功能">${bott}</nav>
</div>${S.sheet ? sheetHtml() : ''}`;
}
/* 電腦版兩欄頁面（.two-col.mas）：依序把每張卡片放進目前較矮的那一欄，兩欄高度才會接近，頁面下方不會留一大塊空白。
   視窗太窄變成單欄時，維持原本的閱讀順序。要在畫圖表之前執行（圖表容器高度是固定的，量得準） */
function balanceCols() {
  if (isPhone()) return;
  $$('.two-col.mas', app).forEach(g => {
    const stacks = [...g.children].filter(e => e.classList.contains('stack'));
    if (stacks.length !== 2) return;
    stacks.forEach(st => st.querySelectorAll('.chart-wrap:not(.fill)').forEach(w => { if (!w.dataset.h0) w.dataset.h0 = w.style.height; w.style.height = w.dataset.h0; }));
    stacks.forEach(st => [...st.children].forEach(c => { c.style.minHeight = ''; c.classList.remove('grow'); }));
    const cards = stacks.flatMap(s => [...s.children]);
    cards.forEach((c, i) => { if (c.dataset.o == null) c.dataset.o = i; });
    cards.sort((a, b) => a.dataset.o - b.dataset.o);
    const [A, B] = stacks;
    cards.forEach(c => A.appendChild(c));   // 先全部放在第一欄，量出各卡高度
    if (getComputedStyle(g).gridTemplateColumns.trim().split(/\s+/).length < 2) return;   // 單欄
    const h = cards.map(c => c.getBoundingClientRect().height + 16);
    // 卡片不多（最多十來張）：把所有分法都試一遍，取兩欄高度差最小的；第一張固定留在左欄，每欄內仍維持原順序
    const n = Math.min(cards.length, 14), total = h.reduce((a, b) => a + b, 0);
    let best = 0, bestD = Infinity;
    for (let m = 0; m < (1 << (n - 1)); m++) {
      let hb = 0; for (let i = 1; i < n; i++) if (m & (1 << (i - 1))) hb += h[i];
      for (let i = n; i < cards.length; i++) hb += (i % 2) ? h[i] : 0;
      const d = Math.abs(total - 2 * hb);
      if (d < bestD - 1) { bestD = d; best = m; }
    }
    cards.forEach((c, i) => { if (i > 0 && (i < n ? (best & (1 << (i - 1))) : (i % 2))) B.appendChild(c); });
    // 卡片太少、分不平時：較短那欄的最後一張卡拉長到和另一欄一樣底（圖表多給一點高度，其餘留白放在卡片底部），整頁收得整齊
    [A, B].forEach(st => { const last = st.lastElementChild; if (last) { last.style.minHeight = ''; last.classList.remove('grow'); last.querySelectorAll('.chart-wrap[data-h0]').forEach(w => { w.style.height = w.dataset.h0; }); } });
    const bottom = st => st.lastElementChild ? st.lastElementChild.getBoundingClientRect().bottom : 0;
    const gap0 = Math.abs(bottom(A) - bottom(B));
    if (gap0 > 8 && B.children.length) {
      const short = bottom(A) < bottom(B) ? A : B, card = short.lastElementChild;
      const w = card.querySelector('.chart-wrap:not(.fill)');
      if (w) { w.dataset.h0 = w.dataset.h0 || w.style.height; w.style.height = (parseFloat(w.dataset.h0) + Math.min(gap0 * .7, 240)) + 'px'; }
      const gap = Math.abs(bottom(A) - bottom(B));
      if (gap > 8) { card.classList.add('grow'); card.style.minHeight = (card.getBoundingClientRect().height + gap) + 'px'; }
    }
  });
}
function renderBody() {
  try {
    switch (S.tab) {
      case 'prices': return pagePrices();
      case 'stats': return pageStats();
      case 'weather': return pageWeather();
      case 'know': return pageKnow();
      case 'notes': return S.id === 'researcher' ? pageNotes() : homeFor();
      default: return homeFor();
    }
  } catch (e) {   // 單一頁面出錯時，只在這一頁顯示提示，導覽列與其他頁面照常可用
    console.error(e);
    return `<div class="banner warn" role="alert">${ico('warn', '')}<div class="grow"><b>這個頁面暫時無法顯示</b>其他頁面不受影響，可以從導覽列切換到別頁，或重新整理再試。<div class="sub" style="margin-top:6px;font-size:.78rem">技術訊息：${esc(String((e && e.message) || e))}</div></div></div>`;
  }
}
const HOME = { farmer: () => homeFarmer(), buyer: () => homeFarmer(), policy: () => homePolicy(), researcher: () => homeResearcher() };
const homeFor = () => HOME[S.id]();

const sw = (act, on, label, desc) => `<button class="sw" role="switch" aria-checked="${on}" data-a="${act}"><span><b style="font-size:.95rem">${label}</b>${desc ? `<span class="sub" style="display:block;font-size:.8rem">${desc}</span>` : ''}</span><span style="display:flex;align-items:center"><span class="st">${on ? '開' : '關'}</span><span class="tg"></span></span></button>`;
const segBtns = (act, items, sel) => `<div class="seg" role="group">${items.map(([v, t]) => `<button data-a="${act}" data-v="${v}" aria-pressed="${v === sel}">${t}</button>`).join('')}</div>`;
function sheetHtml() {
  if (S.sheet === 'scope' && typeof scopeHtml === 'function') return scopeHtml();
  if (S.sheet === 'copy' && typeof copyHtml === 'function') return copyHtml();
  const code = encodeState();
  const f = S.font || '';
  return `<div class="scrim" data-a="sheet-bg"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t" tabindex="-1">
<h2 id="sh-t">設定<button class="btn sm" data-a="sheet-close">完成</button></h2>
<p class="sub">設定只存在這個瀏覽器，不需要註冊或登入。</p>
${hubGroup()}
<div class="grp"><b>顯示等級</b><div class="sub">目前：${DENS_NAME[effDensity()]}${S.density ? '' : '（依身分自動）'}。簡易只看重點；專業會多出細項、比較與資料表。</div>${segBtns('dens', [['', '自動'], ['simple', '簡易'], ['focus', '重點'], ['pro', '專業']], S.density || '')}</div>
<div class="grp"><b>字級</b><div class="sub">目前：${{ m: '標準', l: '大', xl: '特大' }[effFont()]}${S.font ? '' : '（依身分自動）'}。</div>${segBtns('font', [['', '自動'], ['m', '標準'], ['l', '大'], ['xl', '特大']], f)}</div>
<div class="grp">${sw('outdoor', S.outdoor, '戶外模式', '純白底、純黑字、框線加粗，太陽下比較看得清楚。')}</div>
<div class="grp"><b>地區與市場</b><div class="selrow" style="margin-top:8px"><label class="sel"><span>縣市</span><select data-c="region" aria-label="縣市">${COUNTIES.map(c => `<option ${c === S.region ? 'selected' : ''}>${c}</option>`).join('')}</select></label>${isPilot(S.region) ? `<label class="sel"><span>鄉鎮（雲林試辦）</span><select data-c="town" aria-label="鄉鎮"><option value="">全縣</option>${TOWNS_YL.map(t => `<option ${t === S.town ? 'selected' : ''}>${t}</option>`).join('')}</select></label>` : ''}<label class="sel"><span>常看的批發市場</span><select data-c="market" aria-label="常看的批發市場">${mkOpts(S.market, '依縣市自動：' + MK[MKT_OF[S.region] || 'xl'].name)}</select></label></div></div>
<div class="grp"><b>關注作物</b><div class="sub">首頁會優先顯示。</div><div class="filterbar">${CROPS.map(c => `<button class="filter" data-a="watch" data-v="${c.id}" aria-pressed="${S.watched.includes(c.id)}">${c.name}</button>`).join('')}</div></div>
<div class="grp"><b>備份代碼</b><div class="sub">換手機或清除瀏覽資料時，輸入代碼就能還原以上設定（不含筆記）。</div><span class="code" aria-label="備份代碼">${code}</span>
<div class="selrow" style="margin-top:10px"><label class="sel"><span>輸入代碼還原</span><input type="text" id="restore-in" placeholder="AG-XXXX-XXX" autocomplete="off" autocapitalize="characters" aria-label="備份代碼"></label><button class="btn" data-a="restore" style="align-self:flex-end">還原</button></div>${S.restoreMsg ? `<div class="sub" role="status" style="color:${S.restoreMsg.startsWith('已') ? '#25664a' : '#9c3f35'};font-weight:700">${esc(S.restoreMsg)}</div>` : ''}</div>
<div class="grp"><b>示範用開關</b><div class="sub">這些只用來展示畫面在特殊情況下的樣子。</div>
${sw('demo-evt', EVT.on, '模擬突發事件', '西螺鎮（雲林縣）的甘藍近 7 日價格走低、交易量增加（虛構），用來展示政策者總覽怎麼協助答詢')}
${sw('demo-offline', S.demo.offline, '模擬離線', '顯示連不上資料來源時的提示')}
${sw('demo-typh', S.demo.extra > 0, '模擬颱風警報', '在氣象頁出現嚴重等級警報')}
<label class="sel" style="margin-top:8px"><span>模擬今日休市的市場</span><select data-c="closed" aria-label="模擬休市市場"><option value="" ${!S.demo.closed ? 'selected' : ''}>無</option>${MARKETS.map(m => `<option value="${m.id}" ${S.demo.closed === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}</select></label></div>
<div class="grp"><b>資料標示</b><div class="sub" style="margin-bottom:6px">每張卡片底部會標出資料性質：</div><div class="cardfoot" style="margin:0">${['off', 'calc', 'approx', 'model'].map(lbl).join('')}${SIM}</div><div class="sub" style="margin-top:8px;font-size:.8rem">官方統計＝政府公開資料；平台計算＝由公開資料計算；近似指標＝以替代資料推估；模型預測＝統計模型。目前全部為模擬資料。</div></div>
<div class="grp">${S.confirmReset ? `<div class="banner warn" style="margin:0 0 10px">${ico('warn', '')}<div class="grow"><b>要清除所有設定與筆記嗎？</b>清除後無法復原。</div></div><div class="actions"><button class="btn danger" data-a="reset-yes">確定清除</button><button class="btn" data-a="reset-no">先不要</button></div>` : `<button class="btn danger" data-a="reset">清除所有設定與筆記</button>`}</div>
</div></div>`;
}


/* ===================== pages.js ===================== */
/* 四大功能頁：價格行情、種植面積與產量、氣象與災害預警、知識與新聞（所有版本共用） */
function cheapCard() {
  const rows = cheapRows().slice(0, 3);
  return card('這週買什麼比較划算', '和近三個月均價比', `<div>${rows.map(r => `<a class="mobile-row" href="#/prices" data-a="crop-go" data-v="${r.c.id}"><div class="crop">${artBox(r.c.id, 38)}<div>${r.c.name}<small>${r.dev < -.03 ? '比近三個月便宜' : r.dev > .03 ? '比近三個月貴' : '和近三個月差不多'}</small></div></div><div class="r">${ud(r.dev)}</div></a>`).join('')}</div><div class="sub" style="margin-top:6px;font-size:.8rem">這是行情的相對高低，不代表品質。挑選時仍要看外觀與新鮮度。</div>`, { foot: ['calc'] });
}
const cropPicker = (sel, act, list = CROPS) => `<div class="cpick" role="group" aria-label="選擇作物">${list.map(c => `<button class="ctile" aria-pressed="${c.id === sel}" data-a="${act}" data-v="${c.id}">${CROP[c.id] ? artBox(c.id, 48) : ''}<span>${c.name}</span></button>`).join('')}</div>`;
const regionPicker = (withTown = true) => `<div class="selrow"><label class="sel"><span>縣市</span><select data-c="region" aria-label="縣市">${COUNTIES.map(c => `<option ${c === S.region ? 'selected' : ''}>${c}</option>`).join('')}</select></label>${withTown ? (isPilot(S.region) ? `<label class="sel"><span>鄉鎮（雲林試辦）</span><select data-c="town" aria-label="鄉鎮"><option value="">全縣</option>${TOWNS_YL.map(t => `<option ${t === S.town ? 'selected' : ''}>${t}</option>`).join('')}</select></label>` : `<div class="sel"><span>鄉鎮</span><div class="sub" style="max-width:16em;font-size:.8rem">目前${esc(S.region)}只提供縣市層級，鄉鎮資料之後再擴充。</div></div>`) : ''}</div>`;

function pagePrices() {
  const c = CROP[S.crop], m = curMarket(), closed = isClosed(m), dn = tradeDn(m), q = quote(c, m, dn), ps = priceSeries(c, m, S.range);
  const al = ALIAS[c.id], buyer = buyerOnly();
  const hero = card('', '', `<div class="hero">${artBox(c.id, 64)}<div><div style="font-size:1.25rem;font-weight:850">${c.name}${al ? `<small style="font-weight:600;color:var(--muted);font-size:.7em">（${al}）</small>` : ''}</div><div class="sub">${esc(m.name)}・${fmtRoc(dateOf(dn))}${closed ? '（最後交易日）' : ''}</div></div>
<div class="hp"><span class="big-price">${q.avg.toFixed(1)}</span><span class="u">元／公斤　${priceLabel()}</span>${ud(q.chg)}<span class="sub" style="font-size:.8rem">較${closed ? '前一天' : '昨天'}</span></div></div>
<div class="statgrid"><div class="stat"><span>最高價</span><b>${q.hi.toFixed(1)}</b></div><div class="stat"><span>中價</span><b>${q.mid.toFixed(1)}</b></div><div class="stat"><span>最低價</span><b>${q.lo.toFixed(1)}</b></div>${lv(2) ? `<div class="stat"><span>交易量</span><b>${fi(q.vol)}<small>公斤</small></b></div>` : ''}</div>
<div class="insight"><strong>近 ${S.range} 天：${trendText(ps.a)}</strong><p>${buyer ? '批發參考價是市場上的批發成交價，到了零售攤位通常會再加上運費與利潤。' : '批發行情是市場上的成交價，不等於田間收購價，也不等於零售價。'}</p></div>`, { foot: ['off', 'calc'] });
  const series = [{ name: `${m.name}（均價）`, vals: ps.a }];
  if (lv(2)) series.push({ name: '全市場平均', vals: ps.all });
  if (lv(3)) series.push({ name: '去年同期', vals: ps.ly });
  const trend = card('價格走勢', `<span class="filterbar" role="group" aria-label="時間範圍">${[[7, '7 日'], [30, '30 日'], [90, '90 日'], [365, '1 年']].map(([v, t]) => `<button class="filter" data-a="range" data-v="${v}" aria-pressed="${S.range === v}">${t}</button>`).join('')}</span>`,
    chart({ series, x: ps.x, h: 230, unit: '元／公斤', label: `${c.name}近${S.range}天批發均價` }), { foot: ['off', 'calc'] });
  /* 市場比較 */
  let mr = marketRows(c); mr.sort((a, b) => a.closed - b.closed || (buyer ? a.q.avg - b.q.avg : b.q.avg - a.q.avg));
  const open = mr.filter(r => !r.closed), bestId = open.length ? open[0].m.id : null;
  const show = lv(2) ? mr : mr.slice(0, 4);
  const mkt = card(buyer ? '各市場行情比較' : '今天賣哪裡？', buyer ? '由低到高' : '由高到低', `<div class="scroll-x"><table class="table"><thead><tr><th>市場</th><th class="num">均價</th><th class="num">較昨日</th>${lv(2) ? '<th class="num">交易量(公斤)</th>' : ''}</tr></thead><tbody>${show.map(r => `<tr class="${r.m.id === m.id ? 'hi' : ''}"><td><b>${r.m.name}</b>${r.m.id === bestId ? ` <span class="best">${buyer ? '最低' : '最高'}</span>` : ''}${r.closed ? ' <span class="tag info">今日休市</span>' : ''}${r.m.id === m.id ? ' <span class="tag mute">目前選擇</span>' : ''}</td><td class="num"><b>${r.q.avg.toFixed(1)}</b>${r.closed ? '<div class="kpi-foot">前一交易日</div>' : ''}</td><td class="num">${ud(r.q.chg)}</td>${lv(2) ? `<td class="num">${fi(r.q.vol)}</td>` : ''}</tr>`).join('')}</tbody></table></div>
<div class="sub" style="margin-top:8px;font-size:.8rem">價格高低只是行情，賣出前還要算運費、損耗與市場收貨規定。休市的市場沒有今日成交，顯示前一交易日。</div>`, { id: 'sec-where', foot: ['off', 'calc'] });
  const cheap = buyer ? `<div id="sec-cheap">${cheapCard()}</div>` : '';
  /* 品項細分 */
  let variants = '';
  if (lv(2) && VARIANTS[c.id]) {
    const vq = variantQuotes(c, m, dn), im = importQuote(c, m, dn);
    variants = card('品項細分', '依交易量加權後是總均價', `<div class="scroll-x"><table class="table"><thead><tr><th>品項</th><th class="num">均價</th><th class="num">交易量占比</th><th class="num">較昨日</th></tr></thead><tbody>${vq.map(v => `<tr><td>${v.v.name}<div class="kpi-foot">${v.v.area}</div></td><td class="num"><b>${v.avg.toFixed(1)}</b></td><td class="num">${(v.share * 100).toFixed(0)}%</td><td class="num">${ud(v.chg)}</td></tr>`).join('')}${im ? `<tr><td>${im.name}<div class="kpi-foot">不併入國產總價</div></td><td class="num"><b>${im.avg.toFixed(1)}</b></td><td class="num">—</td><td class="num">${ud(im.chg)}</td></tr>` : ''}</tbody></table></div><div class="sub" style="margin-top:8px;font-size:.8rem">同一個作物名稱底下，產地與品種不同價格會差很多，看行情時要分開看。</div>`, { foot: ['off', 'calc'] });
  }
  /* 產地 vs 批發 */
  let gate = '';
  if (lv(2)) {
    const fg = farmGate(c, TODAY_DN), wh = avgPrice(c, MK.xl, TODAY_DN), ratio = fg / wh;
    gate = card('產地查報價與批發行情', '每週更新', `<div class="statgrid" style="margin-top:0"><div class="stat"><span>產地查報價（週）</span><b>${fg.toFixed(1)}</b></div><div class="stat"><span>西螺鎮批發均價</span><b>${wh.toFixed(1)}</b></div><div class="stat"><span>約為批發價的</span><b>${(ratio * 10).toFixed(1)}<small>成</small></b></div></div><div class="sub" style="margin-top:10px;font-size:.84rem">產地價是農友出貨時的參考價，批發價是進到市場後的價格，兩者差距包含運費、包裝、損耗與通路費用。實際收購價會因品質與議價而不同。</div>`, { foot: ['approx'] });
  }
  /* 旬對照 */
  let dekad = '';
  if (lv(3)) {
    const y = TODAY.getFullYear(), a = dekadAgg(c, m, y), b = dekadAgg(c, m, y - 1), xs = Array.from({ length: 36 }, (_, i) => dekadLabel(i));
    dekad = card('旬行情：今年與去年', `${esc(m.name)}・每旬平均`, chart({ series: [{ name: `${roc(y)} 年`, vals: a.price }, { name: `${roc(y - 1)} 年`, vals: b.price }], x: xs, h: 220, unit: '元／公斤', label: `${c.name}今年與去年各旬平均價格` }), { foot: ['calc'] });
  }
  /* 資料表 */
  let tbl = '';
  if (lv(3)) {
    const rows = Array.from({ length: 14 }, (_, i) => { const d = dn - i; return { d, q: quote(c, m, d) }; });
    tbl = card('近 14 日行情表', `<button class="btn sm" data-a="export" data-v="prices">${ico('dl')}匯出 CSV</button>`, `<div class="scroll-x"><table class="table"><thead><tr><th>日期</th><th class="num">均價</th><th class="num">最高</th><th class="num">中價</th><th class="num">最低</th><th class="num">交易量(公斤)</th></tr></thead><tbody>${rows.map(r => `<tr><td>${fmtRoc(dateOf(r.d))}</td><td class="num"><b>${r.q.avg.toFixed(1)}</b></td><td class="num">${r.q.hi.toFixed(1)}</td><td class="num">${r.q.mid.toFixed(1)}</td><td class="num">${r.q.lo.toFixed(1)}</td><td class="num">${fi(r.q.vol)}</td></tr>`).join('')}</tbody></table></div>`, { foot: ['off'] });
  }
  return `${closed ? closedBanner(m) : ''}
<label class="sel only-m" style="margin-bottom:12px"><span>市場</span><select data-c="market" aria-label="選擇市場">${mkOpts(m.id)}</select></label>
${cropPicker(S.crop, 'crop')}
<div class="grid two-col mas"><div class="stack">${hero}${trend}</div><div class="stack">${cheap}${mkt}${variants}${gate}</div></div>
${dekad ? `<div class="mt">${dekad}</div>` : ''}${tbl ? `<div class="mt">${tbl}</div>` : ''}`;
}

const statsSel = () => `<div class="selrow"><label class="sel"><span>縣市</span><select data-c="region" aria-label="縣市">${COUNTIES.map(c => `<option ${c === S.region ? 'selected' : ''}>${c}</option>`).join('')}</select></label><label class="sel"><span>作物</span><select data-c="scrop" aria-label="作物">${EXT.map(c => `<option value="${c.id}" ${c.id === (EXT_NAME[S.scrop] ? S.scrop : 'garlic') ? 'selected' : ''}>${c.name}</option>`).join('')}</select></label></div>`;
function pageStats() {
  const sc = EXT_NAME[S.scrop] ? S.scrop : 'garlic', name = EXT_NAME[sc], county = S.region;
  const ha = areaHa(sc, county, STAT_YEAR), nat = natHa(sc), nat0 = natHa(sc, STAT_YEAR - 1), share = ha / nat, rk = countyRank(sc), me = rk.find(r => r.c === county);
  const prod = prodT(sc, county, STAT_YEAR), natP = natProd(sc);
  const kp = `<div class="grid kpis">
<div class="card"><div class="kpi-label">全國${name}種植面積</div><div class="kpi-value">${fi(nat)}<small>公頃</small></div><div class="kpi-foot">${ud(nat / nat0 - 1)} 年增率・${roc(STAT_YEAR)} 年</div></div>
<div class="card"><div class="kpi-label">${esc(county)}種植面積</div><div class="kpi-value">${fi(ha)}<small>公頃</small></div><div class="kpi-foot">全國排名第 ${me.rank}／${COUNTIES.length}</div></div>
<div class="card"><div class="kpi-label">占全國比例</div><div class="kpi-value">${(share * 100).toFixed(1)}<small>%</small></div><div class="kpi-foot">${esc(county)}／全國</div></div>
<div class="card"><div class="kpi-label">估計年產量</div><div class="kpi-value">${fi(prod)}<small>公噸</small></div><div class="kpi-foot">全國約 ${fi(natP)} 公噸・近似指標</div></div></div>`;
  const top = rk.slice(0, 8), inTop = top.some(r => r.c === county), mx = top[0].ha;
  const barRow = (r, extra = '') => `<div class="bar ${r.c === county ? 'me' : ''}"><span class="bn">${r.rank}. ${r.c}</span><div class="progress" role="img" aria-label="${r.c} ${fi(r.ha)} 公頃"><i style="width:${(r.ha / mx * 100).toFixed(0)}%"></i></div><b class="bv">${fi(r.ha)}</b></div>`;
  const ranking = card('各縣市種植面積排名', '單位：公頃', `<div class="bars" style="--w:1">${top.map(r => barRow(r)).join('')}${inTop ? '' : `<div class="sub" style="text-align:center">⋯</div>${barRow(me)}`}</div>`, { foot: ['off', 'calc'] });
  const years = Array.from({ length: 5 }, (_, i) => STAT_YEAR - 4 + i);
  const trend = card(`${esc(county)}${name}面積變化`, '近 5 年', chart({ type: 'bar', series: [{ name: `${county}面積`, vals: years.map(y => areaHa(sc, county, y)) }], x: years.map(y => `${roc(y)} 年`), h: 190, unit: '公頃', vlabel: true, hl: 4, label: `${county}${name}近五年種植面積` }), { foot: ['off'] });
  const sp = specialCrops(county), tagFor = (g) => g === 'pro' ? '<span class="tag">全國重點產區</span>' : g === 'key' ? '<span class="tag info">縣內主力</span>' : '<span class="tag mute">地方特色</span>';
  const spRows = [...sp.pro.map(r => [r, 'pro']), ...sp.key.map(r => [r, 'key']), ...sp.loc.map(r => [r, 'loc'])].slice(0, lv(2) ? 8 : 4);
  const spec = card(`${esc(county)}的特色作物`, `${roc(STAT_YEAR)} 年面積`, spRows.length ? `<div>${spRows.map(([r, g]) => `<button class="mobile-row" data-a="scrop" data-v="${r.id}" aria-label="查看${r.name}"><div class="crop">${CROP[r.id] ? artBox(r.id, 36) : `<span class="artbox" style="--as:36px;--ab:#e6f0de">${cropArt('leaf', 30)}</span>`}<div>${r.name}<small>占全國 ${(r.ns * 100).toFixed(0)}%・占縣內農地 ${(r.cs * 100).toFixed(0)}%</small></div></div><div class="r">${tagFor(g)}<div class="kpi-foot">${fi(r.ha)} 公頃</div></div></button>`).join('')}</div>${lv(2) ? `<div class="sub" style="margin-top:8px;font-size:.8rem">分類門檻（示意）：占全國 ≥${T.nat * 100}% 為「全國重點產區」；占縣內農地 ≥${T.cty * 100}% 為「縣內主力」；占全國 ≥${T.loc * 100}% 為「地方特色」。</div>` : ''}` : '<div class="sub">這個縣市在示範作物中沒有特別突出的項目。</div>', { foot: ['off', 'calc'] });
  let towns = '';
  if (lv(2)) {
    if (isPilot(county)) {
      const rows = TOWNS_YL.map((t, i) => ({ t, ha: townHa(sc, i) })).sort((a, b) => b.ha - a.ha).slice(0, 8), tm = rows[0].ha || 1;
      towns = card('雲林縣鄉鎮面積', '試辦・前 8 名', `<div class="bars">${rows.map((r, i) => `<div class="bar ${r.t === S.town ? 'me' : ''}"><span class="bn">${i + 1}. ${r.t}</span><div class="progress"><i style="width:${(r.ha / tm * 100).toFixed(0)}%"></i></div><b class="bv">${fi(r.ha)}</b></div>`).join('')}</div><div class="sub" style="margin-top:8px;font-size:.8rem">鄉鎮級資料目前只做雲林縣示範，數值為模擬，且各鄉鎮加總不一定等於縣的合計。</div>`, { foot: ['off'] });
    } else towns = card('鄉鎮資料', '', `<div class="sub">鄉鎮級面積與產量目前只做雲林縣示範。切換到「雲林縣」可以看到鄉鎮排名。</div>`);
  }
  let cost = '', vol = '';
  if (lv(2) && CROP[sc]) {
    const ci = costOf(sc), cm = Math.max(...ci.map(x => x.v));
    cost = card(`${name}的生產成本`, '元／公頃', `<div class="bars">${ci.map(x => `<div class="bar" style="grid-template-columns:6.4rem 1fr auto"><span class="bn">${x.name}</span><div class="progress"><i style="width:${(x.v / cm * 100).toFixed(0)}%"></i></div><b class="bv">${fi(x.v)}</b></div>`).join('')}</div><div class="sub" style="margin-top:8px;font-size:.8rem">名目金額，各項目分別估算，不相加成總成本。</div>`, { foot: ['approx'] });
    const y = TODAY.getFullYear(), a = monthVol(CROP[sc], y), b = monthVol(CROP[sc], y - 1), xs = Array.from({ length: 12 }, (_, i) => `${i + 1}月`);
    vol = card(`${name}批發市場成交量`, '平均每日・公噸', chart({ type: 'bar', series: [{ name: `${roc(y)} 年`, vals: a }, { name: `${roc(y - 1)} 年`, vals: b }], x: xs, h: 210, unit: '公噸／日', label: `${name}每月平均每日批發成交量，今年與去年` }) + `<div class="callout" style="margin-top:10px"><b>成交量不等於收成量。</b>批發市場只反映經過市場交易的那一部分，直接運到加工廠或賣給盤商的不會出現在這裡。</div>`, { foot: ['off', 'calc'] });
  }
  let tbl = '';
  if (lv(3)) tbl = card('各縣市資料表', `<button class="btn sm" data-a="export" data-v="stats">${ico('dl')}匯出 CSV</button>`, `<div class="scroll-x" style="max-height:340px;overflow:auto"><table class="table"><thead><tr><th>排名</th><th>縣市</th><th class="num">面積(公頃)</th><th class="num">占全國</th><th class="num">估計產量(公噸)</th></tr></thead><tbody>${rk.map(r => `<tr class="${r.c === county ? 'hi' : ''}"><td>${r.rank}</td><td>${r.c}</td><td class="num">${fi(r.ha)}</td><td class="num">${(r.ha / nat * 100).toFixed(1)}%</td><td class="num">${fi(r.t)}</td></tr>`).join('')}</tbody></table></div>`, { foot: ['off', 'approx'] });
  return `${isPhone() ? statsSel() : ''}${kp}<div class="grid two-col mas"><div class="stack">${ranking}${vol}</div><div class="stack">${spec}${trend}${towns}${cost}</div></div>${tbl ? `<div class="mt">${tbl}</div>` : ''}
<p class="kpi-foot" style="margin-top:16px">面積為官方統計（落後約一年），估計產量＝面積×單位面積產量（模擬值），僅供趨勢參考。</p>`;
}

const AL_ICON = { info: 'info', warn: 'warn', serious: 'serious' };
const AL_ART = { rain: 'rain', cold: 'cold', wind: 'wind', heat: 'thermo', typh: 'storm' };
function alertCard(a) {
  const T = a.T, can = a.status === 'cancelled', lvl = can ? 'info' : T.lvl;
  const mine = a.T.crops.filter(id => S.watched.includes(id));
  return `<article class="al ${lvl} ${can ? 'cancelled' : ''}" aria-label="${T.name}，${T.lvlName}，${STATUS_NAME[a.status]}"><span class="ai">${ico(AL_ART[a.k] || AL_ICON[lvl], '')}</span><div>
<h4>${T.name}<span class="tag ${can ? 'mute' : lvl === 'serious' ? 'alert' : lvl === 'warn' ? 'warn' : 'info'}">${ico(AL_ICON[lvl], '').replace('<svg', '<svg width="13" height="13" style="fill:none;stroke:currentColor;stroke-width:2.2"')}${T.lvlName}</span><span class="tag ${can ? 'mute' : ''}">${STATUS_NAME[a.status]}</span></h4>
<p>${T.desc}</p><div class="meta">發布 ${fmtDT(a.issued)}　生效 ${fmtDT(a.eff)}　預計 ${fmtDT(a.end)} 解除</div>
${can ? '' : `<div class="tipbox"><b>建議：</b>${T.tip}</div><div class="chips" aria-label="可能受影響的作物">${T.crops.map(id => `<span class="chip">${artBox(id, 24)}${CROP[id].name}${mine.includes(id) ? '（你關注）' : ''}</span>`).join('')}</div>`}</div></article>`;
}
function pageWeather() {
  const reg = S.region, st = stationFor(reg, S.town), ob = obsNow(reg, S.town), fc = forecast(reg), als = alertsFor(reg);
  const act = als.filter(a => a.status !== 'cancelled'), kind = wxKind(fc[0].pop);
  const alertsHtml = card('目前警報', act.length ? `<span class="tag alert">${act.length} 則生效中</span>` : '', act.length || als.length ? als.map(alertCard).join('') : `<div class="banner ok" style="margin:0">${ico('check', '')}<div class="grow"><b>目前沒有生效中的警報</b>${esc(regionName())}目前沒有氣象警報，仍請留意天氣變化。</div></div>`, { foot: ['off'] });
  const now = `<div class="weather"><div><small>${esc(regionName())}・目前</small><div class="wt">${fc[0].text}</div><small>${st.name}測站・距離約 ${st.km} 公里・${fmtHM(ob.time)} 觀測</small></div><strong>${wxPlate(kind, 60)}<span>${Math.round(ob.temp)}°</span></strong></div>
<div class="wx-stats"><div class="stat"><span>1 小時雨量</span><b>${ob.r1}<small>毫米</small></b></div><div class="stat"><span>24 小時雨量</span><b>${ob.r24}<small>毫米</small></b></div><div class="stat"><span>相對濕度</span><b>${ob.rh}<small>%</small></b></div><div class="stat"><span>風速</span><b>${ob.wind}<small>公尺/秒</small></b></div></div>`;
  const strip = card('未來 7 天', '最高／最低溫', `<div class="fcs" role="list">${fc.map((f, i) => `<div class="fcd ${i === 0 ? 'today' : ''}" role="listitem" aria-label="${i === 0 ? '今天' : '週' + WD[f.date.getDay()]}，${f.text}，${Math.round(f.hi)}度到${Math.round(f.lo)}度，降雨機率${f.pop}%"><b>${i === 0 ? '今天' : '週' + WD[f.date.getDay()]}</b><div class="kpi-foot">${fmtMD(f.date)}</div>${wxPlate(wxKind(f.pop), 48)}<div class="tmp">${Math.round(f.hi)}° <span style="color:var(--muted);font-weight:600">${Math.round(f.lo)}°</span></div><div class="pop">${ico('drop', '').replace('<svg', '<svg width="11" height="11" style="fill:none;stroke:currentColor;stroke-width:2.4;vertical-align:-1px"')} ${f.pop}%</div></div>`).join('')}</div>`, { foot: ['off', 'model'] });
  const watchedHit = act.filter(a => a.T.crops.some(id => S.watched.includes(id)));
  const adv = watchedHit.length
    ? `<div class="text-guide"><div class="label">對你關注作物的提醒</div><h4>${watchedHit.map(a => a.T.name).join('、')}可能影響${[...new Set(watchedHit.flatMap(a => a.T.crops.filter(id => S.watched.includes(id))))].map(id => CROP[id].name).join('、')}</h4><p>${watchedHit[0].T.tip}天氣資訊僅供參考，請以中央氣象署與主管機關公告為準。</p></div>`
    : `<div class="text-guide"><div class="label">對你關注作物的提醒</div><h4>目前沒有直接影響關注作物的警報</h4><p>${dailyTip().h}。天氣資訊僅供參考，請以中央氣象署與主管機關公告為準。</p></div>`;
  let pest = '';
  if (lv(2)) {
    const pc = PEST[S.pcrop] ? S.pcrop : 'cabbage', ps = pestSeries(pc, reg), xs = ps.map((_, i) => fmtMD(dateOf(TODAY_DN - (11 - i) * 7)));
    pest = card('病蟲害誘蟲器指數', `${esc(PEST[pc][0])}・近 12 週`, `<div class="filterbar" role="group" aria-label="選擇作物" style="margin-bottom:10px">${Object.keys(PEST).map(id => `<button class="filter" data-a="pcrop" data-v="${id}" aria-pressed="${pc === id}">${CROP[id].name}</button>`).join('')}</div>` + chart({ series: [{ name: `${PEST[pc][0]}（${PEST[pc][1]}）`, vals: ps }], x: xs, h: 170, unit: '隻', label: `${CROP[pc].name}${PEST[pc][0]}近十二週誘蟲數` }), { foot: ['approx'] });
  }
  let tbl = '';
  if (lv(3)) tbl = card('預報資料表', '', `<div class="scroll-x"><table class="table"><thead><tr><th>日期</th><th>天氣</th><th class="num">最高</th><th class="num">最低</th><th class="num">降雨機率</th></tr></thead><tbody>${fc.map(f => `<tr><td>${fmtMD(f.date)}（${WD[f.date.getDay()]}）</td><td>${f.text}</td><td class="num">${f.hi.toFixed(1)}°</td><td class="num">${f.lo.toFixed(1)}°</td><td class="num">${f.pop}%</td></tr>`).join('')}</tbody></table></div><div class="sub" style="margin-top:8px;font-size:.8rem">觀測來自 ${st.name} 測站；若所在鄉鎮沒有測站，則以最近的測站代表。</div>`, { foot: ['off', 'model'] });
  return `${isPhone() ? regionPicker() : ''}<div class="grid two-col mas"><div class="stack">${alertsHtml}${adv}</div><div class="stack">${card('目前天氣', '', now, { foot: ['off'] })}${strip}${pest}</div></div>${tbl ? `<div class="mt">${tbl}</div>` : ''}`;
}

const KT = {
  技術: ['sprout', '#e6f2e3', '#2b6035'], 行情: ['chart', '#e6eff5', '#2a5675'], 消費: ['basket', '#fbf0dc', '#80520f'], 政策: ['bank', '#ece8f5', '#4b3f7a'],
  研究: ['flask', '#e0f0f0', '#1b5859'], 防災: ['shield', '#f8e8e4', '#9c3f35'], 活動: ['cal', '#eef3dc', '#4a601f'],
};
const KTYPES = ['技術', '行情', '消費', '政策', '研究', '防災', '活動'];
function knFiltered() {
  const q = S.kQ.trim().toLowerCase(), t = S.kType;
  let rows = KN.filter(k => {
    if (t === 'rec' && !k.aud.includes(S.id)) return false;
    if (t === 'star' && !S.stars.includes(k.id)) return false;
    if (KTYPES.includes(t) && k.type !== t) return false;
    if (q && !(k.t + k.s + k.type + k.u).toLowerCase().includes(q)) return false;
    return true;
  });
  rows.sort((a, b) => (b.aud.includes(S.id) - a.aud.includes(S.id)) || a.off - b.off);
  return rows;
}
function knItem(k) {
  const [ic, bg, fg] = KT[k.type] || KT.技術, open = !!S.open[k.id], star = S.stars.includes(k.id), rec = k.aud.includes(S.id);
  return `<article class="kn"><div class="khrow"><button class="kh" data-a="kn" data-v="${k.id}" aria-expanded="${open}" aria-controls="kb${k.id}" style="grid-template-columns:auto 1fr auto"><span class="kt" style="--ta:${bg};--tc:${fg}">${ico(ic, '')}</span><span><h4>${esc(k.t)}</h4><span class="km" style="display:flex"><span class="tag" style="background:${bg};color:${fg}">${k.type}</span><span>${esc(k.u)}</span><span>${fmtRoc(dateOf(TODAY_DN - k.off))}</span>${rec ? '<span class="tag">適合你</span>' : ''}</span></span><span class="chev">${ico('chev', '').replace('<svg', '<svg width="20" height="20" style="fill:none;stroke:currentColor;stroke-width:2"')}</span></button>
<button class="star" data-a="star" data-v="${k.id}" aria-pressed="${star}" aria-label="${star ? '取消收藏' : '收藏'}：${esc(k.t)}">${ico('star', '')}</button></div>
<div class="kb" id="kb${k.id}" ${open ? '' : 'hidden'}>${esc(k.s)}<div class="cardfoot"><span class="lbl lbl-sim">示意內容</span></div></div></article>`;
}
function knList() {
  const rows = knFiltered();
  return rows.length ? rows.map(knItem).join('') : `<div class="callout">沒有符合的文章。可以換個關鍵字，或把分類改回「全部」。</div>`;
}
function pageKnow() {
  const chips = [['all', '全部'], ['rec', '適合我'], ['star', `收藏（${S.stars.length}）`], ...KTYPES.map(t => [t, t])];
  const filt = `<div class="filterbar" role="group" aria-label="文章分類" style="margin-bottom:12px">${chips.map(([v, t]) => `<button class="filter" data-a="ktype" data-v="${v}" aria-pressed="${S.kType === v}">${t}</button>`).join('')}</div>`;
  const search = `<label class="sel" style="margin-bottom:12px"><span class="sr">搜尋文章</span><input type="search" id="kq" value="${esc(S.kQ)}" placeholder="搜尋標題或內容，例如：蒜頭、豪雨" aria-label="搜尋文章" autocomplete="off"></label>`;
  const src = card('資料來源與口徑', '', `<div class="mobile-row"><span>農產品批發市場交易行情</span><span class="tag">農業主管機關</span></div><div class="mobile-row"><span>農作物種植面積、產量統計</span><span class="tag">農業主管機關</span></div><div class="mobile-row"><span>天氣觀測、預報與警特報</span><span class="tag">中央氣象署</span></div><div class="mobile-row"><span>病蟲害監測</span><span class="tag">改良場／防檢單位</span></div><div class="sub" style="margin-top:8px;font-size:.8rem">本版畫面使用模擬資料，上線時才會接上以上政府公開資料。每個數字都會標出更新時間與口徑。</div>`);
  const glossary = card('資料標示說明', '', `<div class="mobile-row" style="align-items:flex-start"><span>${lbl('off')}</span><span class="sub" style="flex:1;text-align:left">政府公開統計原始數字。</span></div><div class="mobile-row" style="align-items:flex-start"><span>${lbl('calc')}</span><span class="sub" style="flex:1;text-align:left">由公開資料加總、平均或比較而得。</span></div><div class="mobile-row" style="align-items:flex-start"><span>${lbl('approx')}</span><span class="sub" style="flex:1;text-align:left">以相關資料推估，並非直接統計。</span></div><div class="mobile-row" style="align-items:flex-start"><span>${lbl('model')}</span><span class="sub" style="flex:1;text-align:left">依統計模型預測，會有誤差。</span></div><div class="mobile-row" style="align-items:flex-start"><span>${SIM}</span><span class="sub" style="flex:1;text-align:left">目前畫面的數字為模擬，不是真實行情。</span></div>`);
  return `<div class="grid two-col stick"><div class="stack"><div>${search}${filt}<div id="kn-list" aria-live="polite">${knList()}</div></div></div><div class="stack">${lv(2) ? src : ''}${glossary}</div></div>`;
}
function updateKnList() { const el = $('#kn-list'); if (el) el.innerHTML = knList(); }


/* ===================== calc_policy.js ===================== */
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


/* ===================== calc_event.js ===================== */
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

/* ===================== home_policy.js ===================== */
/* =====================================================================
   政策者首頁：決策總覽
   電腦版：一頁看完（事件橫幅、四個指標、價格趨勢、事件比較、優先追蹤、為何關注、答詢重點）
   手機版：由上而下排列
   重點：突然出事、被問「為什麼」時，要能在 30 秒內看到事實、比較對象與「還不能斷定的事」
   ===================================================================== */
const lab = s => s.replace(/^([^：]+：)/, '<b>$1</b>');
const evtScope = r => r.m ? `${MK_COUNTY[r.m.id]}・${r.m.name}` : '全國';

function kpiCards(k, compact) {
  if (compact) return `<div class="card kpi"><div class="kpi-label">農產品價格指數（較前 7 日）</div><div class="kpi-value">${k.idx.toFixed(1)} <span class="kv-sub">${ud(k.idxChg)}</span></div></div>
<div class="card kpi"><div class="kpi-label">批發交易量（較前 7 日）</div><div class="kpi-value">${fi(k.vol)}<small>公噸／日</small> <span class="kv-sub">${ud(k.volChg)}</span></div></div>
<div class="card kpi"><div class="kpi-label">示範作物種植面積（${roc(STAT_YEAR)} 年）</div><div class="kpi-value">${fi(k.area)}<small>公頃</small> <span class="kv-sub">${ud(k.areaChg)}</span></div></div>
<div class="card kpi"><div class="kpi-label">市場波動程度（較前期）</div><div class="kpi-value">${k.vlt} <span class="kv-sub">${ud(k.vltChg)}</span></div></div>`;
  return `<div class="card kpi"><div class="kpi-label">農產品價格指數</div><div class="kpi-value">${k.idx.toFixed(1)} <span class="kv-sub">${ud(k.idxChg)}</span></div><div class="kpi-foot">較前 7 日・各作物近一年平均＝100</div></div>
<div class="card kpi"><div class="kpi-label">批發交易量</div><div class="kpi-value">${fi(k.vol)}<small>公噸／日</small></div><div class="kpi-foot">${ud(k.volChg)} 較前 7 日・6 項示範作物</div></div>
<div class="card kpi"><div class="kpi-label">示範作物種植面積</div><div class="kpi-value">${fi(k.area)}<small>公頃</small></div><div class="kpi-foot">${ud(k.areaChg)} 年增率・${roc(STAT_YEAR)} 年</div></div>
<div class="card kpi"><div class="kpi-label">市場波動程度</div><div class="kpi-value">${k.vlt}</div><div class="kpi-foot">${ud(k.vltChg)} 波動指標較前期</div></div>`;
}

/* 事件橫幅：一句話講完發生什麼事、多嚴重 */
function evtBanner(fc) {
  const r = fc.row, [lvName, lvCls] = EVT_LVL[r.lvl], hits = evtTriggers(r).filter(t => t.hit);
  const icon = r.lvl === 'alert' ? 'serious' : r.lvl === 'warn' ? 'warn' : 'check';
  const sub = r.lvl === 'ok'
    ? `目前沒有達到關注門檻的重大事件；這是你選擇查看的項目。價格${r.chg < 0 ? '下降' : '上升'}、交易量${volWord(r.vchg)}。`
    : `先看事實：價格${r.chg < 0 ? '下降' : '上升'}、交易量${volWord(r.vchg)}；供需因果與處置進度仍待核實。`;
  return `<section class="card evt ${r.lvl}" aria-labelledby="evt-h">
<div class="evt-main"><div class="evt-tags"><span class="tag ${lvCls}">${ico(icon, 'ico')}${lvName}${r.lvl === 'ok' ? '' : '・待查核'}</span><span>觀測 ${fmtMD(dateOf(r.dn - 7))}–${fmtMD(dateOf(r.dn))}・${esc(r.c.name)}</span>${r.m && isClosed(r.m) ? `<span class="tag info">今日休市・用 ${fmtMD(dateOf(r.dn))} 資料</span>` : ''}${EVT.on ? '<span class="tag mute">情境示範・虛構事件</span>' : ''}${fc.manual ? `<span class="tag info">手動查詢</span><button class="btn sm" data-a="ev-auto">回到自動偵測</button>` : ''}</div>
<h2 id="evt-h">${esc(evtHeadline(r))}</h2><p class="evt-sub">${sub}</p></div>
<div class="evt-stats"><div class="evt-stat"><span>${esc(r.m ? r.m.name : '全國')}${esc(r.c.name)}均價</span><b>${f1(r.now)}<small> 元／公斤</small></b><small>${ud(r.chg)}・7 日前 ${f1(r.base)}</small></div>
<div class="evt-stat"><span>近 7 日交易量</span><b>${fi(r.v7 / 1000)}<small> 公噸</small></b><small>${ud(r.vchg)}・較前 7 日</small></div>
<div class="evt-stat"><span>觸發規則</span><b>${hits.length}<small> 項</small></b><small>${hits.length ? hits.map(h => h.name.replace('與其他市場的差距', '區域價差')).join('・') : '未達門檻'}</small></div></div></section>`;
}

function trendCard(fill) {
  const pr = S.pr || 30, ix = indexSeries(pr);
  const right = `<span class="filterbar" role="group" aria-label="時間範圍">${[[30, '近 30 日'], [180, '近半年'], [365, '近一年']].map(([v, t]) => `<button class="filter" data-a="pr" data-v="${v}" aria-pressed="${pr === v}">${t}</button>`).join('')}<button class="btn sm" data-a="export" data-v="policy">${ico('dl')}匯出</button></span>`;
  return card('全國農產品價格趨勢', right, chart({ series: GROUPS.map((g, i) => ({ name: g.name, vals: ix.arr[i] })), x: ix.x, h: 235, unit: '指數', label: '三類作物價格指數趨勢', note: fill ? '' : '目前顯示：' + ({ 30: '近 30 日', 180: '近半年', 365: '近一年' }[pr] || '近 30 日'), fill, endLabels: fill, table: fill ? 'sr' : undefined }), { foot: ['calc', 'approx'], cls: fill ? 'fillcard' : '' });
}

function cmpCard(fc, fill) {
  const r = fc.row, sr = evtSeries(r);
  return card('近 8 日價格比較', '7 日前＝100', chart({ series: sr.series, x: sr.x, h: 230, label: `${mkWhere(r.m)}${r.c.name}與比較對象的近 8 日價格指數`, fill, endLabels: true, table: fill ? 'sr' : undefined }), { foot: ['calc'], cls: fill ? 'fillcard' : '' });
}

/* 優先追蹤：全國與明顯偏離的市場，點一下就換成它；也可以直接指定作物與範圍 */
function watchCard(fc) {
  const rows = evtWatch(4), sel = fc.row.key;
  if (!rows.some(r => r.key === sel)) rows.splice(3, 1, fc.row);
  const crops = CROPS.map(c => `<option value="${c.id}" ${c.id === fc.row.c.id ? 'selected' : ''}>${c.name}</option>`).join('');
  const mks = `<option value="nat" ${!fc.row.m ? 'selected' : ''}>全國</option>${MARKETS.map(m => `<option value="${m.id}" ${fc.row.m && fc.row.m.id === m.id ? 'selected' : ''}>${m.name}（${MK_COUNTY[m.id]}）${isClosed(m) ? '・休市' : ''}</option>`).join('')}`;
  return card('優先追蹤', '', `<div class="watch" role="group" aria-label="近 7 日變動最大的項目，點選可查看">${rows.map(r => `<button class="wrow" data-a="ev-pick" data-v="${r.key}" aria-pressed="${r.key === sel}">${artBox(r.c.id, 30)}<span class="wt"><b>${esc(r.c.name)}</b><small>${esc(evtScope(r))}${r.m && isClosed(r.m) ? '・休市' : ''}</small></span><span class="wc">${ud(r.chg)}<span class="tag ${EVT_LVL[r.lvl][1]}">${EVT_LVL[r.lvl][0]}</span></span></button>`).join('')}</div>
<div class="wpick"><label class="sel"><span class="sr">作物</span><select data-c="ev-crop" aria-label="指定查詢：作物">${crops}</select></label><label class="sel"><span class="sr">範圍</span><select data-c="ev-mk" aria-label="指定查詢：範圍">${mks}</select></label></div>`, { foot: isPhone() ? ['calc'] : null, tfoot: isPhone() ? null : ['calc'], cls: 'watchcard' });
}

/* 為何關注：能直接回答的事實＋可能原因（全部待查證）＋不能斷定的事 */
function whyCard(fc, wide) {
  const r = fc.row, F = evtFacts(r), cs = evtCauses(r);
  const title = `為何${r.lvl === 'ok' ? '看' : '關注'}${r.m ? MK_COUNTY[r.m.id] : '全國'}的${r.c.name}？`;
  const body = `<ol class="facts"><li>${lab(F.price)}</li><li>${lab(F.vol)}</li><li>${lab(F.cmp)}</li><li><b>影響範圍：</b>${F.exp}。</li></ol>
<div class="hyp"><b>可能原因（都待查證，不是結論）</b><ul>${cs.map(c => wide ? `<li><b>${c.t}</b>　${esc(c.n)}</li>` : `<li title="${esc(c.n)}"><b>${c.t}</b>・${esc(c.s)}</li>`).join('')}</ul></div>
<p class="caveat">${ico('warn', 'ico')}<span>不能斷定：${EVT_UNKNOWN.map(s => s.replace(/（.*$/, '')).join('、')}。同期出現不等於因果。</span></p>`;
  return card(title, '', body, { foot: isPhone() ? ['calc'] : null, tfoot: isPhone() ? null : ['calc'], cls: 'whycard' });
}

/* 答詢重點：三題常見質詢、可直接唸的答案、一鍵複製與口徑 */
function qaCard(fc) {
  const qa = evtAnswers(fc.row);
  return card('臨時質詢：30 秒答詢重點', '', `${qa.map(x => `<div class="qa"><b>議員：「${esc(x.q)}」</b><p>答：${esc(x.a)}</p></div>`).join('')}
<div class="qa-act"><button class="btn sm primary" data-a="copy-sum">${ico('doc')}複製摘要</button><button class="btn sm" data-a="scope">${ico('info')}資料口徑</button><span id="copy-st" class="sub" role="status" aria-live="polite"></span></div>`, { foot: isPhone() ? ['calc'] : null, tfoot: isPhone() ? null : ['calc'], cls: 'qacard' });
}

/* 專業等級：全部作物與市場的近 7 日明細 */
function evtMatrix() {
  const rows = evtRows().slice().sort((a, b) => Math.abs(b.chg) - Math.abs(a.chg));
  return card('全部作物 × 市場：近 7 日明細', `<button class="btn sm" data-a="export" data-v="evt">${ico('dl')}匯出 CSV</button>`, `<div class="scroll-x" style="max-height:340px;overflow:auto"><table class="table"><thead><tr><th>作物</th><th>範圍</th><th class="num">現價</th><th class="num">7 日前</th><th class="num">價格變動</th><th class="num">與其他市場差</th><th class="num">交易量變動</th><th>等級</th></tr></thead><tbody>${rows.map(r => `<tr class="${r.key === (S.evSel || '') ? 'hi' : ''}"><td>${esc(r.c.name)}</td><td>${esc(evtScope(r))}${r.m && isClosed(r.m) ? ' <span class="tag info">休市</span>' : ''}</td><td class="num">${f1(r.now)}</td><td class="num">${f1(r.base)}</td><td class="num">${ud(r.chg)}</td><td class="num">${r.gap == null ? '—' : ptsS(r.gap)}</td><td class="num">${ud(r.vchg)}</td><td><span class="tag ${EVT_LVL[r.lvl][1]}">${EVT_LVL[r.lvl][0]}</span></td></tr>`).join('')}</tbody></table></div><div class="sub" style="margin-top:8px;font-size:.8rem">休市的市場以前一交易日計算，並標示「休市」。</div>`, { foot: ['calc'] });
}

/* 原本首頁的三張卡：區域供應結構、價格變動排行、政策觀察題目（專業等級與手機版保留） */
function legacyPolicy() {
  const rg = regionShares(CROPS.map(c => c.id)), rk = rankRows();
  const region = card('區域供應結構', `主要產區占比・${roc(STAT_YEAR)} 年`, `<div class="bars">${rg.map(r => `<div class="bar" style="grid-template-columns:6.4rem 1fr auto"><span class="bn">${r.g}</span><div class="progress" role="img" aria-label="${r.g} ${(r.share * 100).toFixed(1)}%"><i style="width:${(r.share * 100).toFixed(0)}%"></i></div><b class="bv">${(r.share * 100).toFixed(1)}%</b></div>`).join('')}</div>`, { foot: ['off', 'calc'] });
  const rank = card('作物價格變動排行', '近 7 日', `<table class="table"><thead><tr><th>作物</th><th class="num">均價</th><th class="num">變化</th></tr></thead><tbody>${rk.map(r => `<tr><td><span class="crop">${artBox(r.c.id, 28)}${r.c.name}</span></td><td class="num">${r.now.toFixed(1)}</td><td class="num">${ud(r.chg)}</td></tr>`).join('')}</tbody></table>`, { foot: ['calc'] });
  const pol = card('政策觀察摘要', '示意題目', `<div class="prompt"><b>產地冷鏈補助</b><p>受補助產區出貨損耗率是否下降？建議與未受補助產區進行同期比較。</p></div><div class="prompt"><b>產銷調節措施</b><p>檢查措施啟動前後的價格與交易量變化，並注意季節因素。</p></div><div class="prompt"><b>災害救助</b><p>警報發布後，受影響作物的價格與到貨量是否出現落差？</p></div>`);
  return `<div class="grid three-col mt">${region}${rank}${pol}</div>`;
}
const POLICY_FOOT = '<p class="kpi-foot" style="margin-top:16px">資料來源示意：農產品批發市場交易資料、農作物種植面積統計、氣象資料。正式上線需標示資料更新時間、統計口徑與修訂紀錄。</p>';

function homePolicy() {
  const fc = evtFocus(), k = policyKpis();
  if (isPhone()) {
    return `${evtBanner(fc)}<div class="grid kpis">${kpiCards(k)}</div><div class="stack mt">${whyCard(fc, true)}${qaCard(fc)}${trendCard(false)}${lv(2) ? cmpCard(fc, false) + watchCard(fc) : ''}</div>${lv(2) ? legacyPolicy() : ''}${POLICY_FOOT}`;
  }
  return `<div class="dash d${D()}">${evtBanner(fc)}
<div class="dash-r2"><div class="kpi-stack">${kpiCards(k, true)}</div>${trendCard(true)}${lv(2) ? cmpCard(fc, true) : ''}</div>
<div class="dash-r3">${lv(2) ? watchCard(fc) : ''}${whyCard(fc)}${qaCard(fc)}</div></div>${lv(3) ? `<div class="mt">${evtMatrix()}</div>${legacyPolicy()}${POLICY_FOOT}` : ''}`;
}

/* ---------- 對話框：資料口徑、複製失敗時的手動複製 ---------- */
const dlg = (id, title, body) => `<div class="scrim" data-a="sheet-bg"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="${id}" tabindex="-1"><h2 id="${id}">${title}<button class="btn sm" data-a="sheet-close">完成</button></h2>${body}</div></div>`;
function scopeHtml() {
  const r = evtFocus().row, tr = evtTriggers(r);
  return dlg('sc-t', '資料口徑與門檻', `<div class="grp"><b>這頁怎麼算</b>
<ul class="plain"><li><b>價格</b>：批發市場日均價（元／公斤）。是市場成交價，不等於產地收購價或零售價。</li>
<li><b>近 7 日</b>：最後交易日對 7 日前的同一市場。休市的市場用前一交易日的資料，畫面會標示「休市」。</li>
<li><b>其他市場</b>：其餘示範市場同期變動的中位數（只有一個市場異常時，比較基準不會被它拉走）。</li>
<li><b>交易量</b>：市場成交量，不等於產量，也不等於產地出貨量。</li>
<li><b>種植面積</b>：官方統計，落後約一年（目前最新為 ${roc(STAT_YEAR)} 年）。</li></ul></div>
<div class="grp"><b>觸發規則（示意門檻）</b><div class="sub">目前查看：${esc(evtHeadline(r))}</div><table class="table"><thead><tr><th>規則</th><th>門檻</th><th class="num">目前</th></tr></thead><tbody>${tr.map(t => `<tr><td>${t.name}${t.hit ? ' <span class="tag warn">已觸發</span>' : ''}</td><td>${t.rule}</td><td class="num">${t.val}</td></tr>`).join('')}</tbody></table><div class="sub" style="margin-top:8px;font-size:.8rem">門檻只是示意，正式使用前要由業務單位決定。</div></div>
<div class="grp"><b>這頁沒有的資料</b><ul class="plain">${EVT_UNKNOWN.map(s => `<li>${s}</li>`).join('')}</ul></div>
<div class="grp"><b>資料性質</b><div class="sub">${EVT.on ? '目前開啟「情境示範」：西螺鎮（雲林縣）甘藍的價格走低與交易量增加是虛構事件，用來展示畫面；可在設定的「示範用開關」關閉。' : '目前關閉情境示範，畫面上的變動來自模擬資料本身的起伏。'}所有數字都是模擬資料，不是真實行情。</div></div>`);
}
function copyHtml() {
  const txt = evtSummary(evtFocus());
  return dlg('cp-t', '複製摘要', `<p class="sub">這個瀏覽器不允許自動複製。請在下面的文字框按 Ctrl＋C（Mac 按 ⌘＋C）複製。</p><textarea id="cp-ta" readonly rows="10" aria-label="摘要文字">${esc(txt)}</textarea>`);
}

/* ===================== main.js ===================== */
/* =====================================================================
   啟動、路由（#/頁面）、事件
   ===================================================================== */
const app = document.getElementById('app');
let lastKey = null, sheetOpener = null, sheetFocus = false;

function parseHash() {
  const t = (location.hash.replace(/^#\/?/, '') || 'home').split('/')[0];
  return navFor().some(n => n.t === t) ? t : 'home';
}
function renderNow() {
  chN = 0; Object.keys(CH).forEach(k => delete CH[k]);
  S.tab = parseHash(); applyView();
  const sy = window.scrollY;
  app.innerHTML = shell();
  $$('[data-a]', app).forEach(e => { e.dataset.k = e.dataset.a + ':' + (e.dataset.v == null ? '' : e.dataset.v); });
  $$('[data-c]', app).forEach(e => { e.dataset.k = 'c:' + e.dataset.c; });
  balanceCols();
  drawCharts();
  document.title = `${pageMeta().h}｜GRGR 綠綠・${ID_BY[S.id].short}`;
  document.body.style.overflow = S.sheet ? 'hidden' : '';
  if (S.sheet && sheetFocus) { const d = $('.sheet', app); if (d) d.focus({ preventScroll: true }); sheetFocus = false; }
  else if (lastKey) { const el = $$('[data-k]', app).find(e => e.dataset.k === lastKey); if (el) el.focus({ preventScroll: true }); }
  lastKey = null;
  window.scrollTo(0, sy);
  if (S.sec) { const el = document.getElementById(S.sec); if (el) el.scrollIntoView({ block: 'start', behavior: 'auto' }); S.sec = null; }
}

/* 外層保護：畫面整個畫不出來時，顯示救援畫面（重新整理／清除設定），不留一片空白 */
function fatal(e) {
  console.error(e);
  app.innerHTML = `<div style="max-width:520px;margin:48px auto;padding:22px;font:16px/1.7 system-ui,'Noto Sans TC','Microsoft JhengHei',sans-serif;background:#fff;border:1px solid #e0e7e2;border-radius:18px">
<h2 style="margin:0 0 8px">這個畫面暫時無法顯示</h2><p style="margin:0 0 14px;color:#566760">可能是瀏覽器裡存的設定壞掉了。可以先重新整理；還是不行，再按「清除設定後重試」（只會清掉這一份的設定與筆記）。</p>
<p style="margin:0 0 16px;font-size:13px;color:#566760">技術訊息：${esc(String((e && e.message) || e))}</p>
<button id="fx-reload" style="min-height:44px;padding:0 16px;border-radius:11px;border:1px solid #cdd8d1;background:#fff;font:inherit;cursor:pointer">重新整理</button>
<button id="fx-reset" style="min-height:44px;padding:0 16px;margin-left:8px;border-radius:11px;border:0;background:#2f7657;color:#fff;font:inherit;cursor:pointer">清除設定後重試</button></div>`;
  $('#fx-reload').onclick = () => location.reload();
  $('#fx-reset').onclick = () => { try { localStorage.removeItem(KEY); } catch (x) { } location.reload(); };
}
function render() { try { renderNow(); } catch (e) { fatal(e); } }
const closeSheet = () => {
  S.sheet = false; S.restoreMsg = ''; S.confirmReset = false; persist(); render();
  const o = (sheetOpener && $$('[data-k]', app).find(e => e.dataset.k === sheetOpener && e.offsetParent !== null)) || $$('[data-a="sheet"]', app).find(e => e.offsetParent !== null);
  sheetOpener = null; if (o) o.focus();
};
/* 複製文字：先用剪貼簿 API，不行再用舊方法；都不行才回傳 false（由畫面改成手動複製） */
async function copyText(txt) {
  try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(txt); return true; } } catch (e) { }
  try {
    const ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok;
  } catch (e) { return false; }
}

app.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if (!el || el.disabled) return;
  const a = el.dataset.a, v = el.dataset.v; lastKey = el.dataset.k;
  const tog = (arr, x, min = 0) => { const i = arr.indexOf(x); if (i >= 0) { if (arr.length > min) arr.splice(i, 1); } else arr.push(x); };
  switch (a) {
    case 'skip': e.preventDefault(); $('#main').focus(); return;
    case 'sheet': S.sheet = true; sheetFocus = true; sheetOpener = el.dataset.k; break;
    case 'scope': S.sheet = 'scope'; sheetFocus = true; sheetOpener = el.dataset.k; break;
    case 'ev-pick': S.evSel = v; break;
    case 'ev-auto': S.evSel = null; break;
    case 'copy-sum': {
      const opener = el.dataset.k;
      copyText(evtSummary(evtFocus())).then(ok => {
        if (ok) { const st = $('#copy-st', app); if (st) { st.textContent = '已複製，可直接貼上。'; setTimeout(() => { const s2 = $('#copy-st', app); if (s2) s2.textContent = ''; }, 3500); } }
        else { S.sheet = 'copy'; sheetFocus = true; sheetOpener = opener; render(); const ta = $('#cp-ta', app); if (ta) ta.select(); }
      });
      return;
    }
    case 'sheet-bg': if (e.target !== el) return; closeSheet(); return;
    case 'sheet-close': closeSheet(); return;
    case 'dens': S.density = v || null; break;
    case 'font': S.font = v || null; break;
    case 'outdoor': S.outdoor = !S.outdoor; break;
    case 'watch': tog(S.watched, v, 1); S.watched = CROPS.map(c => c.id).filter(i => S.watched.includes(i)); break;
    case 'crop': S.crop = v; break;
    case 'crop-go': S.crop = v; persist(); if (location.hash === el.getAttribute('href')) render(); return;
    case 'go': S.sec = v; if (location.hash === el.getAttribute('href')) render(); return;
    case 'range': S.range = +v; break;
    case 'pr': S.pr = +v; break;
    case 'pcrop': S.pcrop = v; break;
    case 'scrop': S.scrop = v; break;
    case 'rs-crop': tog(S.rs.crops, v, 1); S.rs.crops = CROPS.map(c => c.id).filter(i => S.rs.crops.includes(i)); break;
    case 'rs-per': S.rs.per = +v; break;
    case 'kn': S.open[v] = !S.open[v]; break;
    case 'star': tog(S.stars, +v); break;
    case 'ktype': S.kType = v; break;
    case 'retry': S.demo.offline = false; S.net = true; break;
    case 'demo-offline': S.demo.offline = !S.demo.offline; break;
    case 'demo-typh': S.demo.extra = S.demo.extra ? 0 : 1; break;
    case 'demo-evt': EVT.on = !EVT.on; memo.clear(); _alertCache = {}; S.evSel = null; break;   // 事件寫在最底層的價格裡，要清掉算好的快取
    case 'restore': {
      const r = decodeState($('#restore-in', app).value);
      if (!r) S.restoreMsg = '代碼不正確，請再檢查一次（共 7 碼，不分大小寫）。';
      else { delete r.id; Object.assign(S, r); S.restoreMsg = '已還原設定。'; }
      break;
    }
    case 'reset': S.confirmReset = true; break;
    case 'reset-no': S.confirmReset = false; break;
    case 'reset-yes':
      try { localStorage.removeItem(KEY); } catch (err) { }
      memStore = null; location.hash = '#/home'; location.reload(); return;
    case 'note-add': {
      const text = ($('#note-in', app).value || '').trim(); if (!text) { $('#note-in', app).focus(); return; }
      S.notes.unshift({ at: `${fmtRoc(TODAY)} ${fmtHM(new Date())}`, q: S.rs.q.slice(0, 24), text }); S.noteDraft = ''; break;
    }
    case 'note-del': S.notes.splice(+v, 1); break;
    case 'note-export': exportCSV('研究筆記.csv', [['時間', '研究問題', '內容'], ...S.notes.map(n => [n.at, n.q, n.text])]); return;
    case 'note-from': {
      const sr = rsSeries(S.rs.crops, S.rs.per), r = pearson(sr.price, sr.vol), nm = S.rs.crops.map(i => CROP[i].name).join('、');
      S.noteDraft = `【${fmtRoc(TODAY)} 觀察】${nm}，${sr.x[0]}–${sr.x[sr.x.length - 1]}：價格指數與交易量指數的相關係數 ${isNaN(r) ? '—' : r.toFixed(2)}（${isNaN(r) ? '' : rLabel(r)}）。待驗證：時間落差、少數產區影響、反例月份。（模擬資料）`;
      location.hash = '#/notes'; return;
    }
    case 'export': doExport(v); return;
    default: return;
  }
  persist(); render();
});

function doExport(kind) {
  const note = ['※ 本檔數字為模擬資料，非正式統計'];
  if (kind === 'prices') {
    const c = CROP[S.crop], m = curMarket(), dn = tradeDn(m);
    exportCSV(`價格行情_${c.name}_${m.name}.csv`, [['日期', '市場', '作物', '均價(元/公斤)', '最高', '中價', '最低', '交易量(公斤)'], ...Array.from({ length: 30 }, (_, i) => { const d = dn - 29 + i, q = quote(c, m, d); return [fmtRoc(dateOf(d)), m.name, c.name, q.avg, q.hi, q.mid, q.lo, q.vol]; }), note]);
  } else if (kind === 'stats') {
    const sc = EXT_NAME[S.scrop] ? S.scrop : 'garlic', nat = natHa(sc);
    exportCSV(`面積與產量_${EXT_NAME[sc]}.csv`, [['排名', '縣市', '面積(公頃)', '占全國(%)', '估計產量(公噸)'], ...countyRank(sc).map(r => [r.rank, r.c, r.ha, (r.ha / nat * 100).toFixed(1), r.t]), note]);
  } else if (kind === 'rs') {
    const sr = rsSeries(S.rs.crops, S.rs.per);
    exportCSV('研究資料_價格與交易量指數.csv', [['月份(民國)', '價格指數', '交易量指數', '平均每日交易量(公噸)'], ...sr.x.map((x, i) => [x, sr.price[i], sr.vol[i], sr.rawVol[i]]), note]);
  } else if (kind === 'evt') {
    exportCSV('近7日價格變動明細.csv', [['作物', '範圍', '現價(元/公斤)', '7日前(元/公斤)', '價格變動(%)', '其他市場同期(%)', '與其他市場差(百分點)', '近7日交易量(公噸)', '交易量變動(%)', '等級'],
      ...evtRows().map(r => [r.c.name, r.m ? mkWhere(r.m) : '全國', f1(r.now), f1(r.base), (r.chg * 100).toFixed(1), r.oth == null ? '' : (r.oth * 100).toFixed(1), r.gap == null ? '' : (r.gap * 100).toFixed(1), Math.round(r.v7 / 1000), (r.vchg * 100).toFixed(1), EVT_LVL[r.lvl][0]]), note]);
  } else {
    const ix = indexSeries(30);
    exportCSV('市場總覽_價格指數.csv', [['日期', ...GROUPS.map(g => g.name + '指數')], ...ix.x.map((x, i) => [x, ...ix.arr.map(a => a[i])]), note]);
  }
}

app.addEventListener('change', e => {
  const el = e.target.closest('[data-c]'); if (!el) return;
  const c = el.dataset.c, v = el.value; lastKey = el.dataset.k;
  switch (c) {
    case 'region': S.region = v; S.town = null; break;
    case 'town': S.town = v || null; break;
    case 'market': S.market = v || null; break;
    case 'scrop': S.scrop = v; break;
    case 'closed': S.demo.closed = v || null; break;
    case 'ev-crop': case 'ev-mk': {
      const cs = $('[data-c="ev-crop"]', app), ms = $('[data-c="ev-mk"]', app);
      S.evSel = (cs ? cs.value : CROPS[0].id) + '|' + (ms ? ms.value : 'nat'); break;
    }
    case 'rs-q': S.rs.q = v.slice(0, 80); break;
    default: return;
  }
  persist(); render();
});
app.addEventListener('input', e => {
  if (e.target.id === 'kq') { S.kQ = e.target.value; updateKnList(); }
  if (e.target.id === 'note-in') S.noteDraft = e.target.value;
});

document.addEventListener('keydown', e => {
  if (!S.sheet) return;
  if (e.key === 'Escape') { closeSheet(); return; }
  if (e.key !== 'Tab') return;
  const d = $('.sheet', app); if (!d) return;
  const f = $$('button,select,input,[tabindex]:not([tabindex="-1"])', d).filter(x => !x.disabled && x.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && (document.activeElement === first || document.activeElement === d)) { last.focus(); e.preventDefault(); }
  else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
});
window.addEventListener('hashchange', () => { const keep = S.sec; render(); if (!keep) window.scrollTo(0, 0); });
let rz = null;
window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { balanceCols(); drawCharts(); }); });
window.addEventListener('online', () => { S.net = true; render(); });
window.addEventListener('offline', () => { S.net = false; render(); });

/* ---------- 啟動：網址參數 ?id=policy&view=phone|desk ---------- */
(function boot() {
  try {
    const q = new URLSearchParams(location.search);
    if (q.get('density') && DENS_N[q.get('density')]) S.density = q.get('density');
    if (q.get('font') && ['m', 'l', 'xl'].includes(q.get('font'))) S.font = q.get('font');
    if (q.get('outdoor') === '1') S.outdoor = true;
  } catch (e) { }
  if (!S.net) S.net = navigator.onLine !== false;
  render();
})();
