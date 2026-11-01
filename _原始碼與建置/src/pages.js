'use strict';
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

