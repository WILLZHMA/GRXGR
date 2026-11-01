'use strict';
/* 研究筆記（研究者專用） */
function pageNotes() {
  const list = S.notes.length ? S.notes.map((n, i) => `<div class="note"><div class="nh"><span>${esc(n.at)}${n.q ? '・' + esc(n.q) : ''}</span><button class="btn sm" data-a="note-del" data-v="${i}" aria-label="刪除這則筆記">${ico('trash')}刪除</button></div><p>${esc(n.text)}</p></div>`).join('') : '<div class="callout">還沒有筆記。可以從「研究總覽」按「把這段觀察存成筆記」，或直接在上面輸入。</div>';
  return `<div class="grid two-col"><div class="stack">${card('新增筆記', '', `<label class="sel"><span>內容</span><textarea id="note-in" aria-label="筆記內容" placeholder="寫下觀察、假設或待辦…">${esc(S.noteDraft || '')}</textarea></label><div class="actions" style="margin-top:10px"><button class="btn primary" data-a="note-add">儲存筆記</button></div>`)}</div>
<div class="stack">${card('我的筆記', `${S.notes.length} 則`, list + (S.notes.length ? `<div class="actions"><button class="btn" data-a="note-export">${ico('dl')}匯出 CSV</button></div>` : ''))}<div class="callout">筆記只存在這台裝置的瀏覽器裡；清除瀏覽資料或換裝置就看不到，重要內容請先匯出。</div></div></div>`;
}

