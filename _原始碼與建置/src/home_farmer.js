'use strict';
/* 農友／消費者首頁 */
function weatherCard() {
  const fc = forecast(S.region), t0 = fc[0], ob = obsNow(S.region, S.town), kind = wxKind(t0.pop);
  return `<a class="weather" href="#/weather" aria-label="${esc(regionName())}今日天氣：${t0.text}，${Math.round(ob.temp)}度，降雨機率${t0.pop}%。前往氣象頁"><div><small>${esc(regionName())}・今日天氣</small><div class="wt">${t0.text}</div><small>降雨機率 ${t0.pop}%・風速 ${ob.wind} 公尺/秒</small></div><strong>${wxPlate(kind, 60)}<span>${Math.round(ob.temp)}°</span></strong></a>`;
}
function alertStrip() {
  const als = alertsFor(S.region).filter(a => a.status !== 'cancelled');
  if (!als.length) return '';
  const top = als.some(a => a.T.lvl === 'serious') ? 'serious' : als.some(a => a.T.lvl === 'warn') ? 'warn' : 'info';
  return `<a class="banner warn" href="#/weather" style="margin:12px 0 0">${ico(top === 'serious' ? 'serious' : 'warn', '')}<div class="grow"><b>有效警報 ${als.length} 則</b>${als.map(a => a.T.name).join('、')}　<u>看詳情</u></div></a>`;
}
const quickTile = (href, ic, t, s, extra = '') => `<a class="quick" href="${href}" ${extra}><span class="qi">${ico(ic, '')}</span><b>${t}</b><small>${s}</small></a>`;
function watchedList() {
  const m = curMarket(), ids = S.watched.length ? S.watched : ['garlic', 'cabbage'];
  return ids.map(id => {
    const c = CROP[id], q = quote(c, m, tradeDn(m)), al = ALIAS[id];
    return `<a class="mobile-row" href="#/prices" data-a="crop-go" data-v="${id}"><div class="crop">${artBox(id, 42)}<div>${c.name}<small>${m.name}・每公斤${al ? '・' + al : ''}</small></div></div><div class="r"><b class="big-price" style="font-size:1.35rem">${q.avg.toFixed(1)}</b><div>${ud(q.chg)}</div></div></a>`;
  }).join('');
}
function sellCard() {
  const id = (S.watched[0] || 'garlic'), c = CROP[id], b = bestMarket(c), mine = curMarket(), qm = quote(c, mine, tradeDn(mine));
  if (!b) return '';
  const diff = b.q.avg - qm.avg, same = b.m.id === mine.id;
  return card('今天賣哪裡？', `${c.name}・元／公斤`, `<div class="mobile-row" style="border:0"><div class="crop">${artBox(id, 42)}<div>${same ? `${b.m.name}今天最高` : `${b.m.name}今天最高`}<small>${same ? '就是你常去的市場' : `比${mine.name}高 ${diff.toFixed(1)} 元`}</small></div></div><div class="r"><b class="big-price" style="font-size:1.35rem">${b.q.avg.toFixed(1)}</b></div></div><a class="btn" style="width:100%" href="#/prices" data-a="go" data-v="sec-where">看所有市場</a><div class="sub" style="margin-top:8px;font-size:.8rem">價格高不代表賺得多，還要算運費與損耗。</div>`, { foot: ['off', 'calc'] });
}
function homeFarmer() {
  const buyer = S.id === 'buyer', ids = S.watched.length ? S.watched : ['garlic', 'cabbage'], c0 = CROP[ids[0]], m = curMarket(), ps = priceSeries(c0, m, 30), tip = dailyTip();
  const quick = buyer
    ? quickTile('#/prices', 'basket', '這週買什麼？', '看看當季好選擇', 'data-a="go" data-v="sec-cheap"') + quickTile('#/prices', 'chart', '價格有變化嗎？', '近日行情一眼看') + quickTile('#/weather', 'rain', '天氣影響菜價？', '留意降雨與低溫') + quickTile('#/stats', 'map', '產地在哪裡？', '看看哪裡種得多')
    : quickTile('#/prices', 'store', '今天賣哪裡？', '比較各市場價格', 'data-a="go" data-v="sec-where"') + quickTile('#/prices', 'chart', '價格有變化嗎？', '近日行情一眼看') + quickTile('#/weather', 'sun', '產地天氣', '留意降雨與高溫') + quickTile('#/stats', 'sprout', '本縣種了什麼？', '看看特色作物');
  const left = `${weatherCard()}${alertStrip()}<div class="section-title" style="margin:16px 0 10px">今天快速看</div><div class="quick-grid">${quick}</div>
${lv(2) ? `<div class="mt">${buyer ? cheapCard() : sellCard()}</div>` : ''}`;
  const right = `${card('關注作物', `${esc(m.name)}・${priceLabel()}`, watchedList() + `<div class="sub" style="margin-top:8px;font-size:.8rem">想換關注的作物，點右上角的設定。</div>`, { foot: ['off', 'calc'] })}
${card(`${c0.name}價格走勢`, '近 30 日', chart({ series: [{ name: '批發均價', vals: ps.a }], x: ps.x, unit: '元／公斤', h: 160, label: `${c0.name}近三十日批發均價` }), { foot: ['off'] })}
<div class="text-guide"><div class="label">${tip.label}</div><h4>${esc(tip.h)}</h4><p>${esc(tip.p)}</p></div>
${lv(3) ? card('關注作物行情明細', fmtRoc(dateOf(tradeDn(m))), `<div class="scroll-x"><table class="table"><thead><tr><th>作物</th><th class="num">均價</th><th class="num">最高</th><th class="num">最低</th><th class="num">交易量(公斤)</th></tr></thead><tbody>${ids.map(id => { const q = quote(CROP[id], m, tradeDn(m)); return `<tr><td>${CROP[id].name}</td><td class="num">${q.avg.toFixed(1)}</td><td class="num">${q.hi.toFixed(1)}</td><td class="num">${q.lo.toFixed(1)}</td><td class="num">${fi(q.vol)}</td></tr>`; }).join('')}</tbody></table></div>`, { foot: ['off'] }) : ''}`;
  return `<div class="grid two-col"><div class="stack">${left}</div><div class="stack">${right}</div></div>`;
}

