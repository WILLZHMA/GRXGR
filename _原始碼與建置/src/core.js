'use strict';
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
