#!/usr/bin/env python3
"""学员专属水印生成器
用法:
  python3 watermark.py <源课件.html> <学员姓名> [-o 输出.html] [--note 班级或备注]

生成一份带专属水印的副本：全页斜向平铺"姓名 · 日期 · 仅限本人使用，禁止转发"，
并写入版权 meta。课件内容与交互完全不变，源文件不动。
"""
import argparse, datetime, hashlib, html as htmllib, os, re, sys


def build_svg(name, date, note, code):
    # 水印文字
    t1 = f"{name} · {date} · 仅限本人使用，禁止转发 · #{code}"
    t2 = f"BILDEN EDU · {note}" if note else "BILDEN EDU"
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="420" height="240">
<defs><pattern id="p" width="420" height="240" patternTransform="rotate(-24)" patternUnits="userSpaceOnUse">
<text x="16" y="84" font-family="PingFang SC,Noto Sans SC,sans-serif" font-size="17" fill="rgba(20,20,20,0.10)">{htmllib.escape(t1)}</text>
<text x="150" y="168" font-family="PingFang SC,Noto Sans SC,sans-serif" font-size="17" fill="rgba(255,255,255,0.072)">{htmllib.escape(t1)}</text>
<text x="60" y="228" font-family="PingFang SC,Noto Sans SC,sans-serif" font-size="13" fill="rgba(20,20,20,0.055)">{htmllib.escape(t2)}</text>
</pattern></defs>
<rect width="100%" height="100%" fill="url(#p)"/></svg>"""
    from urllib.parse import quote
    return "data:image/svg+xml;charset=utf-8," + quote(svg, safe="")

WM_CSS = """
/* ── 学员专属水印（BILDEN EDU） ── */
.wm-guard{position:fixed;inset:0;z-index:2147483000;pointer-events:none;
  background-image:url("__WM_URI__");background-repeat:repeat;}
@media print{.wm-guard{position:fixed;background-repeat:repeat}}
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("name")
    ap.add_argument("-o", "--out", default="")
    ap.add_argument("--note", default="")
    args = ap.parse_args()

    if not os.path.isfile(args.src):
        sys.exit(f"找不到源文件: {args.src}")

    date = datetime.date.today().isoformat()
    code = hashlib.sha256((args.name + date + args.src).encode()).hexdigest()[:6].upper()

    src = open(args.src, encoding="utf-8").read()
    uri = build_svg(args.name, date, args.note, code)
    css = (WM_CSS.replace("__WM_URI__", uri)
                  .replace("__NAME__", htmllib.escape(args.name))
                  .replace("__CODE__", code))

    # 版权 meta（插在第一个 </head> 前，避开内嵌 srcdoc）
    meta = ('<meta name="copyright" content="© 2026 BILDEN EDU. 本文件为学员专属副本，'
            '仅限本人学习使用，禁止转发、复制、二次销售。">\n')
    i = src.find("</head>")
    if i == -1:
        sys.exit("源文件缺少 </head>，无法注入")
    src = src[:i] + meta + "<style>" + css + "</style>\n" + src[i:]

    # 水印层（插在第一个 <body...> 标签后；避开内嵌 srcdoc）
    m = re.search(r"<body[^>]*>", src)
    if not m:
        sys.exit("源文件缺少 <body>，无法注入")
    guard = (f'<div class="wm-guard" aria-hidden="true"></div>'
             f'<!-- 学员专属副本：{htmllib.escape(args.name)} / {date} / #{code} -->')
    src = src[:m.end()] + "\n" + guard + src[m.end():]

    out = args.out or os.path.splitext(args.src)[0] + f"-{args.name}.html"
    open(out, "w", encoding="utf-8").write(src)
    print(f"已生成: {out}")
    print(f"水印: {args.name} · {date} · #{code}" + (f" · {args.note}" if args.note else ""))


if __name__ == "__main__":
    main()
