'use strict';
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
