#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
建置腳本：從 src/ 的共用原始碼，產生六份各自獨立的版本到 dist/（或你指定的資料夾）。

  python build.py            -> 輸出到 ./dist
  python build.py 輸出資料夾  -> 輸出到指定資料夾
  python build.py 輸出資料夾 --no-hub -> 單獨上架用：不產生「切換版本」連結與入口.html

每一份都是完整獨立的：index.html + styles.css + app.js + 說明.md，
不引用其他資料夾，可單獨複製、單獨上架。
只用 Python 內建模組，不用安裝任何套件。
"""
import json, os, re, shutil, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
_args = [a for a in sys.argv[1:] if not a.startswith('--')]
NO_HUB = '--no-hub' in sys.argv      # 單獨上架用：不產生「切換版本」連結
OUT = os.path.abspath(_args[0]) if _args else os.path.join(ROOT, 'dist')

COMMON = ['data.js', 'icons.js', 'art.js', 'calc_common.js', 'core.js', 'shell.js', 'pages.js']
EXTRA = {
    'farmer': ['home_farmer.js'],
    'buyer': ['home_farmer.js'],
    'policy': ['calc_policy.js', 'calc_event.js', 'home_policy.js'],
    'researcher': ['calc_research.js', 'home_researcher.js', 'notes.js'],
}
# 資料夾名, 身分, 版面, 瀏覽器標題, 說明
APPS = [
    ('手機版_農友', 'farmer', 'phone', 'GRGR 綠綠｜農友（手機版）', '農友手機版：今天賣哪裡、關注作物行情、產地天氣與警報。'),
    ('手機版_消費者', 'buyer', 'phone', 'GRGR 綠綠｜消費者（手機版）', '消費者手機版：這週買什麼比較划算、各市場行情、天氣對菜價的影響。'),
    ('手機版_政策者', 'policy', 'phone', 'GRGR 綠綠｜政策者（手機版）', '政策者手機版：市場總覽、價格指數、訊號與區域供應。'),
    ('手機版_研究者', 'researcher', 'phone', 'GRGR 綠綠｜研究者（手機版）', '研究者手機版：研究題目、價格與交易量相關分析、研究筆記。'),
    ('電腦版_政策者', 'policy', 'desk', 'GRGR 綠綠｜政策者（電腦版）', '政策者電腦版：決策總覽（一頁看完）與市場脈動儀表板。'),
    ('電腦版_研究者', 'researcher', 'desk', 'GRGR 綠綠｜研究者（電腦版）', '研究者電腦版：研究工作台（含研究引導側欄）。'),
]

HTML = '''<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#164c39">
<title>{title}</title>
<link rel="icon" href="{icon}">
<link rel="stylesheet" href="styles.css">
</head>
<body class="{cls}">
<div id="app"></div>
<noscript><p style="padding:24px;font-size:18px">這個畫面需要開啟瀏覽器的 JavaScript 才能顯示。</p></noscript>
<script src="app.js"></script>
</body>
</html>
'''

README = '''# GRGR 綠綠｜{dir}

{desc}

**這個資料夾是完整獨立的**：只有 `index.html`、`styles.css`、`app.js` 三個檔案，不依賴其他資料夾，
可以單獨複製、單獨上架；別的版本壞了不會影響這一份。

## 怎麼開
- 在電腦上：雙擊 `index.html`（Chrome、Edge 都可以）。
- 上架：把整個資料夾放到任何靜態網站空間（GitHub Pages、Netlify、Cloudflare Pages、公司主機的資料夾都可以），
  網址指到 `index.html` 即可。不需要後端、不需要資料庫、不需要網路以外的服務。

## 內容
- 身分固定為「{who}」，版面固定為「{view}」。
- 四大功能都有：價格行情、種植面積與產量、氣象與災害預警、知識與新聞。
- 右上角「切換版本」（手機版是設定旁的小圖示）可跳到其他版本或回入口頁；這只是一個連結，不是依賴。
  **單獨上架時**請用 `python build.py 輸出資料夾 --no-hub` 重建，或把 `app.js` 最前面的 `"hub": {{…}}` 改成 `"hub": null`，連結就不會出現。
- 右上角「設定」可調：顯示等級（簡易／重點／專業）、字級、戶外模式、縣市、常看市場、關注作物、備份代碼、示範開關。
- 設定最上面有「示範用開關」：**「模擬突發事件」預設開**，示範資料裡放了一個虛構事件（雲林縣甘藍價格近 7 日大跌），讓你看到「重大事件發生時畫面怎麼幫忙」；關掉就回到平靜的資料，也不會被存起來（每次開啟預設為開）。
- 電腦版不再重複顯示每頁的大標題（左側導覽已標示目前在哪一頁），內容直接從頂端開始；需要的篩選或說明才會出現一條窄工具列。
- 設定與筆記只存在瀏覽器（儲存名稱 `{key}`），每一份各自獨立。
- **所有數字都是模擬資料**，每張卡片底部有標示。

## 出問題時
- 單一頁面出錯：只有那一頁顯示「暫時無法顯示」，其他頁照常；
- 整個畫面畫不出來：會出現「重新整理／清除設定後重試」的救援畫面。

版本：{ver}（由共用原始碼建置，建置日期 {date}）
'''

TOP_README = '''# GRGR 綠綠｜農業資訊平台　六份獨立版

**品牌**：GRGR（綠綠）＝ Green & Growth：新鮮青翠（Green），財富成長（Growth）。
入口標語「看見農業，洞察變化，創造成長。」；各版本標語「看見農業，讀懂市場。」

依「五畫面介面稿」的外觀做成的前端示範版，拆成六份，各自獨立：

| 資料夾 | 對象 | 版面 |
|---|---|---|
| `手機版_農友` | 農友 | 手機 |
| `手機版_消費者` | 消費者 | 手機 |
| `手機版_政策者` | 政策與決策者 | 手機 |
| `手機版_研究者` | 研究者 | 手機 |
| `電腦版_政策者` | 政策與決策者 | 電腦 |
| `電腦版_研究者` | 研究者 | 電腦 |

## 為什麼拆開
- **分散風險**：每份自己帶齊所有檔案（`index.html`、`styles.css`、`app.js`），不引用任何其他資料夾；
  一份壞了、改壞了或被下架，其他五份不受影響。
- **好上架**：任何一份都可以單獨複製、單獨放上網站空間。
- **各自存設定**：每份的瀏覽器儲存名稱不同（例如 `agri-farmer-phone`），設定與筆記不會互相覆蓋。
- 即使在一份內，單一頁面出錯也只會讓該頁顯示提示，其他頁照常使用。

## 怎麼開
- 雙擊 `入口.html`：右邊選一個版本進入；左邊白色區有三個分頁——「新聞」（自動捲動，有「暫停捲動」鍵；旁邊可選主題——行情、研究、技術、活動、政策、防災、消費——只看那一類）、「上中下價」（各品名、品種的上價／中價／下價，可選市場）、「整體統計」（交易量、平均價與今日摘要）。內容都是示範資料；入口只是方便你看，六份都不依賴它；
- 進入後想換版本：點右上角的「切換版本」（手機版是設定旁的小圖示），或打開「設定」最上面的「切換版本」選單；不用一直按瀏覽器的上一頁；
- 或直接進各資料夾，雙擊裡面的 `index.html`。

## 之後怎麼維護
- 只改某一份：直接改該資料夾的 `app.js`／`styles.css` 即可，不影響其他份。
- 想一次改六份（例如全部換配色）：改 `_原始碼與建置/src/` 裡的共用原始碼，執行
  `python build.py 輸出資料夾`，會重新產生六份。（可選；不用也完全沒關係）
  - 農友與消費者共用同一份首頁程式（`home_farmer.js`），政策者與研究者各有專屬程式。

## 注意
- 所有數字都是模擬資料；正式上線前要接上政府開放資料。
- 政策者的「決策總覽」（電腦版一頁看完）裡的事件、門檻（價格 ±10%／±20%、交易量 ±15%、與其他市場差 8 點）都是**示意值**，不代表任何機關的正式標準；
  畫面只陳述資料能確認的事實，原因一律標為「待查證」，也明講本系統沒有政府處置紀錄、產地實際出貨量與未來預測。
- 舊的合併版資料夾 `農業資訊平台_新版介面` 已被這六份取代，可以自行刪除（我這邊無法刪除您電腦上的檔案）。
'''

FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23164c39'/%3E%3Ctext x='32' y='28' text-anchor='middle' font-family='sans-serif' font-weight='800' font-size='22' fill='white'%3EGR%3C/text%3E%3Ctext x='32' y='51' text-anchor='middle' font-family='sans-serif' font-weight='800' font-size='22' fill='white'%3EGR%3C/text%3E%3C/svg%3E"

# 入口頁的版面放在 src/launcher.html（含新聞、上中下價、整體統計三個分頁）

WHO = {'farmer': '農友', 'buyer': '消費者', 'policy': '政策者', 'researcher': '研究者'}


def read(name):
    with open(os.path.join(SRC, name), encoding='utf-8') as f:
        return f.read()


def read_news():
    """從 src/data.js 的 KN（示意新聞）讀出標題、類型、來源與天數，入口頁的新聞區用同一份資料"""
    t = read('data.js'); i = t.index('const KN = ['); j = t.index('];', i)
    out = []
    for m in re.finditer(r"t: '([^']*)', u: '([^']*)', type: '([^']*)'.*?off: (\d+), s: '([^']*)'", t[i:j]):
        out.append({'t': m.group(1), 'u': m.group(2), 'type': m.group(3), 'off': int(m.group(4)), 's': m.group(5)})
    if not out:
        raise SystemExit('讀不到 KN 新聞資料，請檢查 src/data.js')
    return out


def launcher_html():
    """入口頁：把示範資料與計算（data.js、calc_common.js、calc_policy.js）直接放進頁面，不讀取任何外部檔案"""
    data = '\n'.join(strip_strict(read(f)) for f in ('data.js', 'calc_common.js', 'calc_policy.js'))
    if '</script' in data:
        raise SystemExit('資料檔裡不能出現 </script')
    html = read('launcher.html')
    return html.replace('__ICON__', FAVICON).replace('__DATA__', "'use strict';\n" + data).replace('__NEWS__', json.dumps(read_news(), ensure_ascii=False))


def strip_strict(t):
    return t.replace("'use strict';\n", '', 1) if t.lstrip().startswith("'use strict';") else t


def build():
    import datetime
    date = datetime.date.today().isoformat()
    if os.path.isdir(OUT):
        for d, *_ in APPS:
            shutil.rmtree(os.path.join(OUT, d), ignore_errors=True)
    os.makedirs(OUT, exist_ok=True)
    for d, id_, view, title, desc in APPS:
        hub = None if NO_HUB else {'home': '../入口.html', 'items': [{'dir': d2, 'name': WHO[i2], 'view': v2, 'href': '../%s/index.html' % d2} for d2, i2, v2, *_ in APPS]}
        cfg = {'id': id_, 'dir': d, 'view': view, 'title': title, 'ver': '1.0', 'built': date, 'hub': hub}
        files = COMMON + EXTRA[id_] + ['main.js']
        parts = ["'use strict';\n/* 農業資訊平台｜%s｜由共用原始碼建置，這份是完整獨立的 */\nconst APP = %s;\n" % (d, json.dumps(cfg, ensure_ascii=False))]
        for f in files:
            parts.append('\n/* ===================== %s ===================== */\n' % f + strip_strict(read(f)))
        out = os.path.join(OUT, d)
        os.makedirs(out, exist_ok=True)
        with open(os.path.join(out, 'app.js'), 'w', encoding='utf-8', newline='\n') as f:
            f.write(''.join(parts))
        shutil.copyfile(os.path.join(SRC, 'styles.css'), os.path.join(out, 'styles.css'))
        with open(os.path.join(out, 'index.html'), 'w', encoding='utf-8', newline='\n') as f:
            f.write(HTML.format(title=title, cls='vp' if view == 'phone' else 'vd', icon=FAVICON))
        with open(os.path.join(out, '說明.md'), 'w', encoding='utf-8', newline='\n') as f:
            f.write(README.format(dir=d, desc=desc, who=WHO[id_], view='手機' if view == 'phone' else '電腦', key='agri-%s-%s' % (id_, view), ver=cfg['ver'], date=date))
        print('built', d, '(%d KB)' % (os.path.getsize(os.path.join(out, 'app.js')) // 1024))
    if not NO_HUB:
        with open(os.path.join(OUT, '入口.html'), 'w', encoding='utf-8', newline='\n') as f:
            f.write(launcher_html())
    with open(os.path.join(OUT, '說明.md'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(TOP_README)


if __name__ == '__main__':
    build()
