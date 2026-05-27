# 1091510FinalWeb — PTT Gamesale 二手遊戲市場查詢

[![Run PTT Scraper](https://github.com/afk13e43/1091510FinalWeb/actions/workflows/main.yml/badge.svg)](https://github.com/afk13e43/1091510FinalWeb/actions/workflows/main.yml)

自動爬取 [PTT Gamesale 看板](https://www.ptt.cc/bbs/Gamesale/index.html) 的二手遊戲販售文章，
並以網頁呈現查詢、平台篩選、每日討論量圖表與個人關注清單。

🔗 **線上網站**：<https://afk13e43.github.io/1091510FinalWeb/>

---

## 功能

- **遊戲查詢** — 輸入關鍵字搜尋特定遊戲的近期販售文章。
- **平台篩選** — 全部 / PS / XBOX / NS 四種切換。
- **每日討論量折線圖** — 以 Chart.js 顯示各平台逐日的販售貼文數量。
- **關注清單** — 將有興趣的物件加入清單，使用 `localStorage` 保存於瀏覽器，重整不消失。
- **客家好手氣** — 隨機開啟一篇販售文章。
- **檢視爬蟲程式** — 頁面內直接展示 `scraper.py` 的程式碼。

## 技術堆疊

| 層 | 使用技術 |
| --- | --- |
| 前端 | HTML、[Bootstrap 5.3](https://getbootstrap.com/)、jQuery、[Chart.js 4](https://www.chartjs.org/) |
| 爬蟲 | Python 3.9、[requests](https://pypi.org/project/requests/)、[beautifulsoup4](https://pypi.org/project/beautifulsoup4/) |
| 自動化 | GitHub Actions（每日排程爬蟲 + 自動 commit） |
| 部署 | GitHub Pages（Deploy from branch / `master` / root） |

## 專案結構

```
.
├── .github/workflows/main.yml   # GitHub Actions：每日爬蟲、自動更新資料並 push
├── assets/
│   ├── brand/                   # 品牌 logo
│   └── dist/
│       ├── css/bootstrap.min.css
│       └── js/
│           ├── bootstrap.bundle.min.js
│           └── main.js          # 前端主程式：查詢、篩選、圖表、關注清單
├── index.html                   # 網站入口
├── ptt_game.json                # 爬蟲產出的資料（保留最新 1000 筆）
├── scraper.py                   # PTT Gamesale 爬蟲
├── requirements.txt             # Python 相依套件
└── jsconfig.json
```

## 運作原理

```
        ┌──────────────────────── GitHub Actions（每日 00:19 UTC / 08:19 台灣） ────────────────────────┐
        │                                                                                              │
  scraper.py  ──爬取列表+文章──►  解析（日期 / 品項 / 售價 / 網址）  ──合併去重、保留最新 1000 筆──►  ptt_game.json
        │                                                                                              │
        └──────────────────► github-actions[bot] 自動 commit & push 回 master ──────────────────────────┘
                                                    │
                                                    ▼
                              GitHub Pages 偵測 master 變動 → 重新部署
                                                    │
                                                    ▼
                       index.html + main.js 以 $.getJSON 讀取 ptt_game.json 並渲染
```

### 資料格式（`ptt_game.json`）

```json
{
  "game_list": [
    {
      "日期": 1779478969.0,
      "品項": "[PS5 ] 售 羊蹄山戰鬼 赤血沙漠",
      "售價": "【售 價】：1200",
      "商品網址": "https://www.ptt.cc/bbs/Gamesale/M.1779xxxxxx.A.xxx.html",
      "id": 1
    }
  ]
}
```

- `日期`：發文時間的 Unix timestamp（秒）；無法解析時為字串 `"未知"`。
- `id`：依「新到舊」排序後重新編號（1 為最新）。
- 去重以 `商品網址` 為唯一鍵，僅保留最新 1000 筆。

## 本機開發

### 前端

前端是純靜態頁面，但因為會用 `fetch`/`$.getJSON` 讀取 `ptt_game.json`，
直接以 `file://` 開啟會遇到 CORS 限制，請改用本機伺服器：

```bash
# 任選一種
python -m http.server 8000          # 然後開 http://localhost:8000
npx serve .                          # 或使用 serve
# VS Code 使用者可安裝 Live Server 擴充套件，對 index.html 按右鍵 Open with Live Server
```

### 爬蟲

```bash
pip install -r requirements.txt
python scraper.py
```

執行後會更新 `ptt_game.json`：讀入既有資料、合併本次抓取結果、依商品網址去重、
依日期由新到舊排序，最後保留最新 1000 筆。

## 自動化排程

爬蟲由 [`.github/workflows/main.yml`](.github/workflows/main.yml) 驅動，觸發條件：

- **排程**：每日 `00:19 UTC`（台灣時間 08:19）。
- **手動**：在 Actions 頁面點 **Run workflow**（`workflow_dispatch`）。
- **Push**：當 `scraper.py`、`requirements.txt` 或 workflow 檔本身變動並推上 `master` 時。

完成後由 `github-actions[bot]` 將更新後的 `ptt_game.json` 自動 commit 回 `master`，
GitHub Pages 隨即重新部署，網站即顯示最新資料。

## 注意事項

- 爬蟲在請求間加入 1.5–2 秒延遲並帶上 `over18=1` cookie 與瀏覽器 User-Agent，避免被 PTT 阻擋。
- PTT 版面結構或文章格式若變動，解析邏輯（`BeautifulSoup` selector、售價區塊判斷）可能需要調整。
