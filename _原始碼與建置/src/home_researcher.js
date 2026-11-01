'use strict';
/* 研究者首頁 */
function homeResearcher() {
  const ids = S.rs.crops, per = S.rs.per, sr = rsSeries(ids, per), n = sr.x.length;
  const r = pearson(sr.price, sr.vol), lags = lagCorrs(sr.price, sr.vol), best = lags.reduce((a, b) => Math.abs(b.r) > Math.abs(a.r) ? b : a);
  const pc = sr.price[n - 1] / sr.price[0] - 1, vc = sr.vol[n - 1] / sr.vol[0] - 1;
  const names = ids.map(i => CROP[i].name).join('、');
  const q = card('目前研究題目', `<span class="tag">草稿</span>${isPhone() ? '' : ` <button class="btn sm" data-a="export" data-v="rs">${ico('dl')}下載資料</button>`}`, `<label class="sel" style="margin-bottom:10px"><span>研究問題</span><input type="text" data-c="rs-q" value="${esc(S.rs.q)}" aria-label="研究問題" maxlength="80"></label>
<div class="sub" style="margin-bottom:8px">研究期間：${sr.x[0]}–${sr.x[n - 1]}（民國年/月）　範圍：全國批發市場</div>
<div class="filterbar" role="group" aria-label="研究作物" style="margin-bottom:10px">${CROPS.map(c => `<button class="filter" data-a="rs-crop" data-v="${c.id}" aria-pressed="${ids.includes(c.id)}">${c.name}</button>`).join('')}</div>
<div class="seg" role="group" aria-label="研究期間">${[[12, '近 1 年'], [24, '近 2 年'], [36, '近 3 年']].map(([v, t]) => `<button data-a="rs-per" data-v="${v}" aria-pressed="${per === v}">${t}</button>`).join('')}</div>`);
  const kp = `<section class="grid kpis k3">
<div class="card"><div class="kpi-label">價格指數變化</div><div class="kpi-value">${pc >= 0 ? '+' : '−'}${Math.abs(pc * 100).toFixed(1)}%</div><div class="kpi-foot">研究期間首尾月・${names}</div></div>
<div class="card"><div class="kpi-label">交易量指數變化</div><div class="kpi-value">${vc >= 0 ? '+' : '−'}${Math.abs(vc * 100).toFixed(1)}%</div><div class="kpi-foot">研究期間首尾月</div></div>
<div class="card"><div class="kpi-label">價格與交易量相關</div><div class="kpi-value">${isNaN(r) ? '—' : (r >= 0 ? '+' : '−') + Math.abs(r).toFixed(2)}</div><div class="kpi-foot">Pearson r・${isNaN(r) ? '' : rLabel(r)}</div></div></section>`;
  const ch = card('價格與交易量指數：時間序列比較', '月資料', chart({ series: [{ name: '價格指數', vals: sr.price }, { name: '交易量指數', vals: sr.vol }], x: sr.x, h: 250, unit: '指數（期間平均＝100）', label: `${names}的價格指數與交易量指數月資料`, note: '資料標準化後比較' }), { foot: ['calc', 'approx'] });
  const cc = concentration(ids), mg = marketGroups(ids);
  const conc = card('產區供應集中度', `HHI ${fi(cc.hhi)}・${roc(STAT_YEAR)} 年面積`, `<table class="table"><thead><tr><th>產區</th><th class="num">面積占比</th><th class="num">占比變化</th></tr></thead><tbody>${cc.top3.map(x => `<tr><td>${x.c}</td><td class="num">${(x.sh * 100).toFixed(1)}%</td><td class="num">${Math.abs(x.dsh) < .05 ? '<span class="flat">■ 持平</span>' : x.dsh > 0 ? `<span class="up">▲ ${x.dsh.toFixed(1)} 點</span>` : `<span class="down">▼ ${Math.abs(x.dsh).toFixed(1)} 點</span>`}</td></tr>`).join('')}<tr><td>其他</td><td class="num">${(cc.other * 100).toFixed(1)}%</td><td class="num">—</td></tr></tbody></table><div class="sub" style="margin-top:8px;font-size:.8rem">以種植面積代表「供應」的近似，並非實際出貨量。</div>`, { foot: ['off', 'calc'] });
  const grp = card('分組比較', '近 30 日均價', mg.out.map(o => `<div class="mobile-row"><span>${o.k}市場均價</span><b>${o.v.toFixed(1)}</b></div>`).join('') + `<div class="mobile-row"><span>區域價差</span><b>${mg.gap.toFixed(1)}</b></div><div class="sub" style="font-size:.8rem">元／公斤，所選作物的平均。</div>`, { foot: ['calc'] });
  const qual = card('研究紀錄與資料品質', '<span class="tag warn">2 項需確認</span>', `<div class="mobile-row"><span>休市日沒有交易資料，不補值</span><span class="tag">已處理</span></div><div class="mobile-row"><span>單位一致性：價格皆為元／公斤</span><span class="tag">已處理</span></div><div class="mobile-row"><span>異常值：警報有效期間需獨立標記</span><span class="tag warn">待檢查</span></div><div class="mobile-row"><span>「交易量」不等於「收成量」</span><span class="tag warn">待確認</span></div>`);
  const trendTxt = isNaN(r) ? '資料點不足，無法計算相關。' : `在這段期間，價格指數與交易量指數的相關係數為 ${(r >= 0 ? '+' : '−') + Math.abs(r).toFixed(2)}，屬於「${rLabel(r)}」。這只描述兩條線一起變動的程度，不代表其中一個造成另一個。`;
  const lagTxt = best.k === 0 ? '同月的關係最明顯。' : `若讓交易量領先價格 ${best.k} 個月，相關係數為 ${(best.r >= 0 ? '+' : '−') + Math.abs(best.r).toFixed(2)}，是四種時間差中最明顯的。`;
  const aside = `<aside class="card rs-aside" style="position:sticky;top:88px" aria-label="研究引導"><div class="card-title"><h3>研究引導</h3><span class="pill" style="min-height:0;padding:4px 10px">自動整理</span></div>
<div class="text-guide"><div class="label">觀察 01 / 初步訊號</div><h4>${isNaN(r) ? '資料不足' : Math.abs(r) < .3 ? '價格與交易量沒有明顯的同步關係' : r < 0 ? '價格與交易量可能呈反向變動' : '價格與交易量可能同向變動'}</h4><p>${trendTxt}</p></div>
<div class="section-title" style="font-size:.9rem;margin:16px 0 4px">下一步可以問</div>
<div class="prompt"><b>01　是否存在時間落差？</b><p>${lagTxt}（領先 0–3 個月：${lags.map(l => (l.r >= 0 ? '+' : '−') + Math.abs(l.r).toFixed(2)).join('、')}）</p></div>
<div class="prompt"><b>02　是否由少數產區主導？</b><p>前三大產區合計占 ${((1 - cc.other) * 100).toFixed(0)}%。可分產區比較價格波動幅度，檢查整體結果是否被少數產區拉動。</p></div>
<div class="prompt"><b>03　有沒有反例？</b><p>找出交易量增加但價格仍上漲的月份，檢視需求、品質或運輸因素。</p></div>
<div class="section-title" style="font-size:.9rem;margin:16px 0 4px">反向證據檢查</div><p class="sub" style="font-size:.84rem">目前畫面尚未納入需求量、天候衝擊與跨市場流通資料。完成因果解釋前，建議補齊這些變數。</p>
<button class="btn primary" style="width:100%;margin-top:14px" data-a="note-from">${ico('edit')}把這段觀察存成筆記</button><a class="btn" style="width:100%;margin-top:8px" href="#/stats">${ico('layers')}看面積與產量</a>
<div class="cardfoot"><span class="lbl lbl-calc">平台計算</span>${SIM}</div></aside>`;
  return `<div class="grid rs-grid"><div class="stack">${q}${kp}${ch}${lv(2) ? `<div class="grid eq2">${conc}${grp}</div>` : ''}${qual}</div>${aside}</div>
<p class="kpi-foot" style="margin-top:16px">研究提示為輔助探索，不構成結論。所有指數、相關係數與市場數值均為模擬資料；正式研究須保留原始來源、清理規則、統計方法與版本。</p>`;
}

