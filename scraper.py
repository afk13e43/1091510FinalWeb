# -*- coding: utf-8 -*-
"""
Created on Thu Jun  1 13:19:28 2023

@author: afk13
"""
import requests 
import bs4
import re
import json
import time
import string
import datetime
URL = "https://www.ptt.cc/bbs/Gamesale/index.html"
my_headers = {
    'cookie': 'over18=1;',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
}
response = requests.get(URL, headers = my_headers)
soup = bs4.BeautifulSoup(response.text,"html.parser")
header = soup.find_all(attrs={"class": "title"})
newest= soup.find_all(attrs={"class": "btn wide"})
temp = newest[1]
temp = str(temp)
yeet = temp.split('"')
prev_page= "https://www.ptt.cc"+yeet[3]
data_page_list=[]
for ele in header:
    temp= str(ele)
    if not "[公告]" in temp:
        if "售" in temp:
            if not '徵' in temp:
                data_page_list.append(ele)
for i in range(0,10):
    #print(prev_page)
    response = requests.get(prev_page, headers = my_headers)
    soup = bs4.BeautifulSoup(response.text,"html.parser")
    header=soup.find_all(attrs={"class": "title"})
    for ele in header:
        temp= str(ele)
        if not "[公告]" in temp:
            if "售" in temp:
                if not '徵' in temp:
                    data_page_list.append(ele)
    newest= soup.find_all(attrs={"class": "btn wide"})
    temp = newest[1]
    temp = str(temp)
    yeet = temp.split('"')
    time2 = soup.find(attrs={"class": "date"})
    prev_page= "https://www.ptt.cc"+yeet[3]
    print(prev_page)
    time.sleep(2)
#print(header)
#print(time2)
arrayofdict=[]
print(data_page_list)
count =1
dict1={}
for ele in data_page_list:
    date="未知"
    finaldict={}
    print('----------------------')
    print(ele)
    print(count)
    print('----------------------')
    page = ele
    page=str(page)
    page = page.split('"')
    if len(page) == 3:
        continue
    temp= page[3]
    data_page= "https://www.ptt.cc"+temp
    response = requests.get(data_page, headers = my_headers)
    soup = bs4.BeautifulSoup(response.text,"html.parser")
    header = soup.find_all('span','article-meta-value')
    if len(header)>2:
        date=header[3].text
        print(time.mktime(time.strptime(date,"%a %b %d %H:%M:%S %Y")))
        finaldict['日期']=time.mktime(time.strptime(date,"%a %b %d %H:%M:%S %Y"))
    else :
        finaldict['日期']=date
    main_container = soup.find(id='main-container')
    if main_container is None:
        print(f"警告：無法讀取此網址內容，可能被刪除或封鎖：{data_page}")
        continue  # 跳過這篇文章，繼續執行下一個
    all_text = main_container.text
    pre_text = all_text.split('--')[0]
    texts = pre_text.split('\n')
    contents = texts[2:]
    content = '\n'.join(contents)
    sale = page[4].strip('>')
    sale=sale.split("</a")
    sale2 =sale[0] 
    print("===============================")
    print(sale2)
    sale2 = str(sale2)
    print("===============================")
    money=""
    open5 =0
    for ele2 in contents:
        if open5 ==1:
            if "【" in ele2:
                open5 =0
                break
            if "交易方式" in ele2:
                open5 =0
                break
            money= money+ele2
        if '【售' in ele2:
            open5=1
            money = money+ele2
    money = money.replace("     "," ")
    money = money.replace("\u3000","")
    money=money.replace("★","")
    money = str(money)
    print("$$$$$$$$$$$$$$$$$$$$$$$$$$")
    print(money)
    print("$$$$$$$$$$$$$$$$$$$$$$$$$$")
    finaldict['品項']=sale2
    finaldict["售價"]=money
    finaldict['商品網址']=data_page
    temp = count
    finaldict['id']=int(temp)
    count = count+1
    arrayofdict.append(finaldict)
    time.sleep(2)
print(arrayofdict)
dict1["game_list"]=arrayofdict
jsonfile = "ptt_game.json"
with open(jsonfile, 'w',encoding="utf8") as fp:

    json.dump(dict1, fp,ensure_ascii=False)
