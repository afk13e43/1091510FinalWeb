# -*- coding: utf-8 -*-
"""
PTT Gamesale 爬蟲 - 追加模式版
功能：抓取資料、防錯處理、合併舊檔、自動去重
"""
import requests 
import bs4
import json
import time
import os

# --- 設定區 ---
URL = "https://www.ptt.cc/bbs/Gamesale/index.html"
# 建議增加 User-Agent 偽裝成瀏覽器，減少被 PTT 斷線的機率
my_headers = {
    'cookie': 'over18=1;',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}
jsonfile = "ptt_game.json"

# --- 第一階段：抓取列表頁連結 ---
print("正在讀取列表頁...")
try:
    response = requests.get(URL, headers=my_headers, timeout=10)
    soup = bs4.BeautifulSoup(response.text, "html.parser")
    header = soup.find_all(attrs={"class": "title"})
    newest = soup.find_all(attrs={"class": "btn wide"})
    
    # 取得上一頁連結
    temp = newest[1]
    yeet = str(temp).split('"')
    prev_page = "https://www.ptt.cc" + yeet[3]

    data_page_list = []
    for ele in header:
        temp_str = str(ele)
        if "[公告]" not in temp_str and "售" in temp_str and "徵" not in temp_str:
            data_page_list.append(ele)

    # 往回抓取 10 頁
    for i in range(0, 10):
        response = requests.get(prev_page, headers=my_headers, timeout=10)
        soup = bs4.BeautifulSoup(response.text, "html.parser")
        header = soup.find_all(attrs={"class": "title"})
        for ele in header:
            temp_str = str(ele)
            if "[公告]" not in temp_str and "售" in temp_str and "徵" not in temp_str:
                data_page_list.append(ele)
        
        newest = soup.find_all(attrs={"class": "btn wide"})
        yeet = str(newest[1]).split('"')
        prev_page = "https://www.ptt.cc" + yeet[3]
        print(f"已讀取分頁: {prev_page}")
        time.sleep(1.5) # 稍微加快一點，但仍保持間隔

except Exception as e:
    print(f"抓取列表時發生錯誤: {e}")
    data_page_list = []

# --- 第二階段：解析文章內容 ---
arrayofdict = []
print(f"開始解析文章內容，共計 {len(data_page_list)} 篇...")

for index, ele in enumerate(data_page_list):
    try:
        finaldict = {}
        page_str = str(ele)
        page_split = page_str.split('"')
        if len(page_split) < 4:
            continue
            
        data_page = "https://www.ptt.cc" + page_split[3]
        
        # 進入文章頁面
        response = requests.get(data_page, headers=my_headers, timeout=10)
        soup = bs4.BeautifulSoup(response.text, "html.parser")
        
        # 解析日期
        meta_values = soup.find_all('span', 'article-meta-value')
        if len(meta_values) > 3:
            date_raw = meta_values[3].text
            try:
                finaldict['日期'] = time.mktime(time.strptime(date_raw, "%a %b %d %H:%M:%S %Y"))
            except:
                finaldict['日期'] = "未知"
        else:
            finaldict['日期'] = "未知"

        # 解析主體 (防錯處理)
        main_container = soup.find(id='main-container')
        if main_container is None:
            print(f"跳過：文章內容不存在或被封鎖 ({data_page})")
            continue
            
        all_text = main_container.text
        pre_text = all_text.split('--')[0]
        texts = pre_text.split('\n')
        contents = texts[2:]
        
        # 標題處理
        sale_title = page_split[4].strip('>').split("</a")[0]
        
        # 售價解析邏輯
        money = ""
        open_price_flag = 0
        for line in contents:
            if open_price_flag == 1:
                if "【" in line or "交易方式" in line:
                    open_price_flag = 0
                    break
                money += line
            if '【售' in line:
                open_price_flag = 1
                money += line
        
        money = money.replace("    ", " ").replace("\u3000", "").replace("★", "").strip()
        
        finaldict['品項'] = sale_title
        finaldict["售價"] = money
        finaldict['商品網址'] = data_page
        finaldict['id'] = 0 # 暫時給 0，最後統一編排
        
        arrayofdict.append(finaldict)
        print(f"[{len(arrayofdict)}] 成功抓取: {sale_title[:20]}...")
        
        time.sleep(1.5) # 每篇文章間隔

    except Exception as e:
        print(f"解析文章 {index} 出錯: {e}")
        continue

# --- 第三階段：合併與存檔 (追加模式) ---
print("\n正在執行資料合併與去重...")
all_data_list = []

# 1. 讀取舊有 JSON 檔案
if os.path.exists(jsonfile):
    with open(jsonfile, 'r', encoding="utf8") as fp:
        try:
            old_json = json.load(fp)
            all_data_list = old_json.get("game_list", [])
            print(f"讀取到舊資料: {len(all_data_list)} 筆")
        except:
            print("舊檔案損壞，將重新建立")

# 2. 合併新舊資料
all_data_list.extend(arrayofdict)

# 3. 根據「商品網址」進行去重
unique_list = []
seen_urls = set()
for item in all_data_list:
    if item['商品網址'] not in seen_urls:
        unique_list.append(item)
        seen_urls.add(item['商品網址'])

# 4. 重新編排 ID (從 1 開始)
for i, item in enumerate(unique_list):
    item['id'] = i + 1
if len(unique_list) > 1000:
    unique_list = unique_list[-1000:]
    # 切完後建議再次重新編排 ID，確保網頁顯示的編號是從 1 到 1000
    for i, item in enumerate(unique_list):
        item['id'] = i + 1
# 5. 寫入 JSON
dict_to_save = {"game_list": unique_list}
with open(jsonfile, 'w', encoding="utf8") as fp:
    json.dump(dict_to_save, fp, ensure_ascii=False, indent=4)

print(f"--- 任務完成 ---")
print(f"目前資料庫總計: {len(unique_list)} 筆資料")

