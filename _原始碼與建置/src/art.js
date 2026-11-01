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
