import os
import re
from bs4 import BeautifulSoup
from datetime import datetime

POSTS_DIR = "posts"

def parse_date(d: str):
    if not d:
        return datetime.min
    d = d.replace(".", "-").replace("/", "-")
    try:
        return datetime.strptime(d.strip(), "%Y-%m-%d")
    except:
        return datetime.min

def extract_title_and_date(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()
    soup = BeautifulSoup(html, "html.parser")

    # 標題
    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True) if title_tag else os.path.basename(path)

    # 日期
    date = ""
    t = soup.find("time")
    if t:
        date = t.get_text(strip=True)

    if not date:
        full = soup.get_text(" ", strip=True)
        m = re.search(r"(\d{4}[./-]\d{1,2}[./-]\d{1,2})", full)
        if m:
            date = m.group(1)

    return title, date

def main():
    posts = []
    for filename in os.listdir(POSTS_DIR):
        if filename.lower().endswith(".html"):
            post_id = filename.replace(".html", "")
            path = os.path.join(POSTS_DIR, filename)
            title, date = extract_title_and_date(path)
            posts.append({
                "id": post_id,
                "title": title,
                "date": date,
                "filename": filename
            })

    # 依日期排序（新 → 舊）
    posts_sorted = sorted(posts, key=lambda x: parse_date(x["date"]), reverse=True)

    # 依年份分組
    grouped = {}
    for p in posts_sorted:
        dt = parse_date(p["date"])
        year = dt.year if dt != datetime.min else "不明"
        grouped.setdefault(year, []).append(p)

    # 生成 index.html
    html = []
    html.append("<!DOCTYPE html><html lang='ja'><head>")
    html.append("<meta charset='utf-8'/>")
    html.append("<title>久保史緒里 公式ブログ（保存版）</title>")
    html.append("""
    <style>
    body{font-family:'Noto Sans JP',sans-serif;background:#f3f4f6;margin:0;padding:24px;}
    .box{max-width:950px;margin:0 auto;background:white;padding:24px 28px 40px;
         border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.05);}
    h1{margin-top:0;}
    .year{font-size:1.3rem;margin-top:1.6rem;padding-left:8px;border-left:4px solid #60a5fa;}
    table{width:100%;border-collapse:collapse;font-size:.9rem;}
    th,td{padding:6px 4px;}
    th{text-align:left;color:#6b7280;border-bottom:1px solid #ddd;}
    tr:nth-child(even){background:#fafafa;}
    a{color:#2563eb;text-decoration:none;}
    a:hover{text-decoration:underline;}
    </style>
    """)
    html.append("</head><body><div class='box'>")
    html.append("<h1>久保史緒里 公式ブログ（保存版）</h1>")
    html.append("<p>最新 → 最舊 的順序。</p>")

    for year in sorted(grouped.keys(), reverse=True):
        html.append(f"<div class='year'>{year}</div>")
        html.append("<table><thead><tr><th>ID</th><th>日付</th><th>タイトル</th></tr></thead><tbody>")
        for p in grouped[year]:
            html.append(f"<tr><td>{p['id']}</td><td>{p['date']}</td>"
                        f"<td><a href='posts/{p['filename']}'>{p['title']}</a></td></tr>")
        html.append("</tbody></table>")

    html.append("</div></body></html>")

    with open("index.html", "w", encoding="utf-8") as f:
        f.write("\n".join(html))

    print("✔ index.html 已成功重建（不重抓、不刪文章）")

if __name__ == "__main__":
    main()
