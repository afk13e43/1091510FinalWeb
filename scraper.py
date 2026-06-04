# -*- coding: utf-8 -*-
"""
PTT Gamesale 爬蟲
- 抓取列表頁與文章內容，解析日期 / 品項 / 售價 / 商品網址
- 與既有 JSON 合併、依商品網址去重、依日期排序、保留最新 1000 筆
"""
import calendar
import json
import os
import re
import time

import bs4
import requests

URL = "https://www.ptt.cc/bbs/Gamesale/index.html"
MY_HEADERS = {
    'cookie': 'over18=1;',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}
JSON_FILE = "ptt_game.json"

# 列表頁要往回翻幾頁
LOOKBACK_PAGES = 20

# 跳過的標題關鍵字（不是販售文 / 已售出 / 公告 / 徵求）
SKIP_KEYWORDS = ("[公告]", "已售", "售完", "結標", "徵 ")

# 售價數字 fallback：抓「售價」「價格」「$」後面的第一個數字
PRICE_FALLBACK_RE = re.compile(
    r'(?:售\s*[價价]|價\s*格|價錢|\$|NT\$?)\s*[:：]?\s*(\d{2,6})'
)


def fetch(url, retries=3, timeout=15):
    """帶重試的 GET，失敗時回傳 None。"""
    for attempt in range(retries):
        try:
            resp = requests.get(url, headers=MY_HEADERS, timeout=timeout)
            if resp.status_code == 200:
                return resp
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
            print(f"  連線失敗 ({attempt + 1}/{retries}): {e}")
        time.sleep(3)
    return None


def is_sale_post(title_text):
    """判斷標題是否為「還在販售中」的文章。"""
    if "售" not in title_text:
        return False
    return not any(kw in title_text for kw in SKIP_KEYWORDS)


def collect_links(start_url):
    """從 start_url 開始往回翻頁，收集所有販售文連結與標題。"""
    items = []  # list of (title, url)
    next_url = start_url
    pages_walked = 0

    while next_url and pages_walked <= LOOKBACK_PAGES:
        resp = fetch(next_url)
        if resp is None:
            print(f"  無法取得列表頁，停止往回翻：{next_url}")
            break

        soup = bs4.BeautifulSoup(resp.text, "html.parser")
        for ele in soup.find_all(attrs={"class": "title"}):
            a = ele.find("a")
            if a is None:
                continue
            title = a.get_text(strip=True)
            href = a.get("href", "")
            if not href or not is_sale_post(title):
                continue
            items.append((title, "https://www.ptt.cc" + href))

        # 找「上一頁」按鈕
        btns = soup.find_all(attrs={"class": "btn wide"})
        prev_a = None
        for btn in btns:
            if "上頁" in btn.get_text() or "‹" in btn.get_text():
                prev_a = btn
                break
        if prev_a is None and len(btns) > 1:
            prev_a = btns[1]  # 第一個通常是「最舊」，第二個是「上一頁」

        if prev_a and prev_a.get("href"):
            next_url = "https://www.ptt.cc" + prev_a["href"]
            pages_walked += 1
            print(f"  已讀第 {pages_walked} 頁列表，下一頁：{next_url}")
            time.sleep(1.5)
        else:
            next_url = None

    return items


def parse_date(meta_values):
    """從 article-meta-value 解析發文時間，回傳 UTC unix timestamp。失敗回 '未知'。"""
    if len(meta_values) <= 3:
        return "未知"
    date_raw = meta_values[3].get_text(strip=True)
    try:
        # 用 calendar.timegm 把 struct_time 當成 UTC，避免本機 / CI 時區差。
        return float(calendar.timegm(time.strptime(date_raw, "%a %b %d %H:%M:%S %Y")))
    except ValueError:
        return "未知"


def parse_price(main_container):
    """擷取售價字串。優先以「【售」標記區塊抓，找不到時退回 regex。"""
    text = main_container.get_text()
    pre_text = text.split('--')[0]  # 去掉簽名檔
    lines = pre_text.split('\n')[2:]

    # 主要策略：「【售」開頭直到「【」或「交易方式」結束
    money_parts = []
    capturing = False
    for line in lines:
        if capturing:
            if "【" in line or "交易方式" in line:
                break
            money_parts.append(line)
        if '【售' in line:
            capturing = True
            money_parts.append(line)

    money = "".join(money_parts).replace("    ", " ").replace("　", "").replace("★", "").strip()
    if money:
        return money

    # Fallback：regex 抓「售價：1234」這類 pattern 的第一個數字
    match = PRICE_FALLBACK_RE.search(pre_text)
    if match:
        return f"$ {match.group(1)}"
    return ""


def parse_article(title, article_url):
    """抓單一文章並解析；失敗回 None。"""
    resp = fetch(article_url, retries=2, timeout=10)
    if resp is None:
        return None

    soup = bs4.BeautifulSoup(resp.text, "html.parser")
    main_container = soup.find(id='main-container')
    if main_container is None:
        return None

    meta_values = soup.find_all('span', 'article-meta-value')
    date = parse_date(meta_values)
    price = parse_price(main_container)

    return {
        '日期': date,
        '品項': title,
        '售價': price,
        '商品網址': article_url,
        'id': 0,  # 之後統一編號
    }


def merge_and_save(new_items, existing_path):
    """把新爬到的資料和既有 JSON 合併、去重、排序、截斷成最新 1000 筆並寫回。"""
    all_data = []
    if os.path.exists(existing_path):
        try:
            with open(existing_path, 'r', encoding='utf8') as fp:
                all_data = json.load(fp).get("game_list", [])
            print(f"讀取舊資料：{len(all_data)} 筆")
        except (OSError, json.JSONDecodeError) as e:
            print(f"舊檔案讀取失敗，重新建立：{e}")

    all_data.extend(new_items)

    # 以商品網址去重，保留先出現的（即最新爬到的 metadata）
    seen = set()
    unique = []
    for item in all_data:
        url = item.get('商品網址')
        if not url or url in seen:
            continue
        seen.add(url)
        unique.append(item)

    # 新到舊排序；日期非數值的視為 0（會被擠到尾巴）
    unique.sort(
        key=lambda x: x['日期'] if isinstance(x['日期'], (int, float)) else 0,
        reverse=True,
    )

    # 截斷到最新 1000 筆（reverse=True 後新的在 index 0，所以切前 1000）
    if len(unique) > 1000:
        unique = unique[:1000]

    # 重新編號（從 1 開始）
    for i, item in enumerate(unique):
        item['id'] = i + 1

    with open(existing_path, 'w', encoding='utf8') as fp:
        json.dump({"game_list": unique}, fp, ensure_ascii=False, indent=4)

    print(f"--- 任務完成 --- 總計 {len(unique)} 筆")


def main():
    print("正在讀取列表頁...")
    links = collect_links(URL)
    if not links:
        print("--- 任務終止 --- 未抓到任何列表，保留原檔案")
        return

    print(f"開始解析文章內容，共計 {len(links)} 篇...")
    parsed = []
    for index, (title, url) in enumerate(links, 1):
        try:
            entry = parse_article(title, url)
            if entry is not None:
                parsed.append(entry)
            if index % 10 == 0:
                print(f"  進度：{index}/{len(links)} (成功 {len(parsed)})")
            time.sleep(2)  # 對 PTT 友善的間隔
        except Exception as e:
            print(f"  解析第 {index} 篇出錯，跳過：{e}")
            continue

    if not parsed:
        print("--- 任務終止 --- 本次無新資料，保留原檔案")
        return

    merge_and_save(parsed, JSON_FILE)


if __name__ == "__main__":
    main()
