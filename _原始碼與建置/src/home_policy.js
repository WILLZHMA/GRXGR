'use strict';
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
