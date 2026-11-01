'use strict';
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

