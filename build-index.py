#!/usr/bin/env python3
"""构建课程教材目录：courses.json -> index.html（树状目录视图）
状态只有两种：active=可使用 / wip=制作中
用法: python3 build-index.py
"""
import json, os

BASE = os.path.dirname(os.path.abspath(__file__))
data = json.load(open(os.path.join(BASE, "courses.json"), encoding="utf-8"))

TEMPLATE = r"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>AI 课程库 · 教材目录</title>
<style>
  :root{
    --bg:#0B0B0A; --surface:#121211; --surface-2:#171715;
    --ink:#FAF9F6; --muted:#95928C; --faint:#615E58;
    --line:rgba(255,255,255,.085); --line-strong:rgba(255,255,255,.15);
    --amber:#E9A93B; --green:#6FAF86;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html{color-scheme:dark}
  body{background:var(--bg);color:var(--ink);
    font-family:"Geist","PingFang SC","Hiragino Sans GB","Noto Sans SC","Microsoft YaHei",sans-serif;
    line-height:1.6;-webkit-font-smoothing:antialiased;}
  a{color:inherit;text-decoration:none}
  .mono{font-family:"Geist Mono","SF Mono","Menlo",monospace}

  .top{display:flex;align-items:center;justify-content:space-between;
    padding:15px 30px;border-bottom:1px solid var(--line);}
  .logo{font-size:15.5px;font-weight:600;letter-spacing:-.01em}
  .logo span{color:var(--muted);font-weight:500;margin-left:8px}
  .top-meta{font-size:12.5px;color:var(--faint)}

  .layout{max-width:1120px;margin:0 auto;padding:44px 30px 100px;
    display:grid;grid-template-columns:196px minmax(0,1fr);gap:52px;align-items:start}

  .side{position:sticky;top:28px}
  .side-title{font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-bottom:12px}
  .side a{display:flex;align-items:center;gap:9px;padding:8px 0;font-size:14.5px;color:var(--muted)}
  .side a:hover{color:var(--ink)}
  .side .dot{width:7px;height:7px;border-radius:50%;background:var(--green);flex:0 0 auto}
  .side .dot.mix{background:var(--amber)}
  .side .cnt{margin-left:auto;font-size:11.5px;color:var(--faint)}

  .hero{margin-bottom:38px}
  .eyebrow{font-size:12px;font-weight:500;color:var(--muted);letter-spacing:.09em;text-transform:uppercase;margin-bottom:14px}
  h1{font-size:clamp(34px,4.6vw,48px);font-weight:600;letter-spacing:-.03em;line-height:1.1}
  .hero-sub{margin-top:12px;font-size:15.5px;color:var(--muted);max-width:min(42em,100%)}

  .prog{margin-bottom:44px;scroll-margin-top:24px}
  .prog-head{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:4px}
  .prog-head h2{font-size:23px;font-weight:600;letter-spacing:-.015em}
  .prog-head .en{font-size:12px;color:var(--faint);letter-spacing:.05em}
  .prog-desc{font-size:14.5px;color:var(--muted);margin:2px 0 16px;max-width:46em}

  .tree{border-left:1px solid var(--line-strong);margin-left:5px;padding-left:22px}
  .node{position:relative}
  .node::before{content:"";position:absolute;left:-22px;top:50%;width:14px;height:1px;background:var(--line-strong)}

  .grp{margin:16px 0 6px;display:flex;align-items:center;gap:8px;font-size:11.5px;letter-spacing:.08em;
    text-transform:uppercase;color:var(--faint)}
  .grp::after{content:"";flex:1;height:1px;background:var(--line)}

  .item{display:flex;align-items:center;gap:11px;padding:8px 10px;border-radius:9px;min-height:40px}
  .item:hover{background:rgba(255,255,255,.045)}
  .st{width:9px;height:9px;border-radius:50%;flex:0 0 auto}
  .st.active{background:var(--green)}
  .st.wip{background:transparent;border:1.5px solid var(--amber);box-sizing:border-box}
  .nm{font-size:15.5px;font-weight:550;letter-spacing:-.005em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
  .wip .nm{color:var(--muted);font-weight:500}
  .note{font-size:13px;color:var(--faint);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1 1 0;min-width:0;padding-left:2px}
  .meta{font-size:12px;color:var(--faint);white-space:nowrap;flex:0 0 auto}
  .go{font-size:12.5px;color:var(--muted);white-space:nowrap;flex:0 0 auto;padding-left:6px}
  .go:hover{color:var(--ink)}
  .wip-tag{font-size:11px;color:var(--amber);border:1px dashed rgba(233,169,59,.45);border-radius:999px;
    padding:1px 8px;flex:0 0 auto}

  .foot{margin-top:56px;padding-top:18px;border-top:1px solid var(--line);
    display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;font-size:13px;color:var(--faint)}
  .foot a{color:var(--muted);border-bottom:1px solid var(--line)}
  .foot a:hover{color:var(--ink)}

  @media (max-width:860px){
    .layout{grid-template-columns:1fr;gap:30px;padding:34px 18px 80px}
    .side{position:static;display:none}
    .tree{padding-left:18px}
    .node::before{left:-18px;width:10px}
    .item{flex-wrap:wrap;gap:6px 10px;padding:10px 8px}
    .note{display:none}
    .meta{order:2;margin-left:19px}
    .top{padding:13px 18px}
    .logo span{display:none}
  }
</style>
</head>
<body>

<header class="top">
  <div class="logo">AI 课程库<span>教材目录</span></div>
  <div class="top-meta mono">__UPDATED__</div>
</header>

<div class="layout">
  <aside class="side">
    <div class="side-title mono">目录</div>
    __SIDE__
  </aside>

  <main>
    <header class="hero">
      <p class="eyebrow mono">Course Library</p>
      <h1>教材目录</h1>
      <p class="hero-sub">每套课的课件、互动、课纲与物料，按体系排成一棵树。绿点＝可使用，空圈＝制作中。</p>
    </header>
    __BODY__
    <div class="foot">
      <span>BILDEN EDU · __UPDATED__</span>
      <span><a href="https://github.com/jacobatxa/ForNewFuture">GitHub 仓库</a> · 数据源 courses.json</span>
    </div>
  </main>
</div>

</body>
</html>
"""

KIND_LABEL = {"deck": "课件", "interaction": "互动", "syllabus": "课纲",
              "material": "物料", "doc": "文档", "tool": "工具"}
KIND_ORDER = {"deck": 0, "interaction": 1, "syllabus": 2, "material": 3, "doc": 4, "tool": 5}


def esc(s):
    return (str(s or "").replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def item_html(it):
    wip = it["status"] == "wip"
    cls = "item" + (" wip" if wip else "")
    dot = f'<span class="st {it["status"]}"></span>'
    meta = " · ".join(x for x in [it.get("pages") and f'{it["pages"]} 页', it.get("updated")] if x)
    kind = KIND_LABEL.get(it["kind"], it["kind"])
    if wip or not it.get("path"):
        right = '<span class="wip-tag">制作中</span>'
    else:
        right = f'<span class="go">打开 ↗</span>'
    inner = (f'{dot}<span class="nm">{esc(it["title"])}</span>'
             f'<span class="note">{esc(it.get("notes", ""))}</span>'
             f'<span class="meta">{esc(meta)}</span>{right}')
    if it.get("path") and not wip:
        ext = ' target="_blank" rel="noopener"' if it["path"].startswith("http") else ""
        return f'<a class="node {cls}" href="{esc(it["path"])}"{ext}>{inner}</a>'
    return f'<div class="node {cls}">{inner}</div>'


progs = sorted(data["programs"], key=lambda p: p.get("order", 0))
side_parts, body_parts = [], []
for p in progs:
    items = [i for i in data["items"] if i["program"] == p["id"]]
    if not items:
        continue
    wip_n = sum(1 for i in items if i["status"] == "wip")
    dot_cls = "dot mix" if 0 < wip_n else "dot"
    side_parts.append(
        f'<a href="#{p["id"]}"><span class="{dot_cls}"></span>{esc(p["name"])}'
        f'<span class="cnt">{len(items)}</span></a>')

    groups = {}
    for it in items:
        groups.setdefault(it["kind"], []).append(it)
    rows = []
    for kind in sorted(groups, key=lambda k: KIND_ORDER.get(k, 9)):
        rows.append(f'<div class="grp mono">{KIND_LABEL.get(kind, kind)}</div>')
        for it in groups[kind]:
            rows.append(item_html(it))

    body_parts.append(f'''<section class="prog" id="{p["id"]}">
      <div class="prog-head"><h2>{esc(p["name"])}</h2><span class="en">{esc(p.get("en", ""))}</span></div>
      <p class="prog-desc">{esc(p.get("desc", ""))}</p>
      <div class="tree">{"".join(rows)}</div>
    </section>''')

html_out = (TEMPLATE
            .replace("__SIDE__", "\n".join(side_parts))
            .replace("__BODY__", "\n".join(body_parts))
            .replace("__UPDATED__", data.get("updated", "")))

out = os.path.join(BASE, "index.html")
open(out, "w", encoding="utf-8").write(html_out)

n_active = sum(1 for i in data["items"] if i["status"] == "active")
n_wip = sum(1 for i in data["items"] if i["status"] == "wip")
print(f"生成 {out}  {len(html_out)} bytes")
print(f"体系 {len(progs)} 组 / 教材 {len(data['items'])} 条（可使用 {n_active} · 制作中 {n_wip}）")
