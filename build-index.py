#!/usr/bin/env python3
"""构建课程库入口：courses.json -> index.html
用法: python3 build-index.py
"""
import json, html, os, sys

BASE = os.path.dirname(os.path.abspath(__file__))
data = json.load(open(os.path.join(BASE, "courses.json"), encoding="utf-8"))

TEMPLATE = r"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>AI 课程库 · 教材管理入口</title>
<style>
  :root{
    --bg:#0A0A0A; --surface:#111111; --surface-2:#161616;
    --ink:#FAFAFA; --muted:#9A9A9A; --faint:#5E5E5E;
    --line:rgba(255,255,255,.09); --line-strong:rgba(255,255,255,.16);
    --amber:#F4C03A; --amber-dim:rgba(244,192,58,.14);
    --green:#5FA97A; --blue:#6E93C9; --red:#C96F5C;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html{color-scheme:dark}
  body{background:var(--bg);color:var(--ink);
    font-family:"Geist","PingFang SC","Hiragino Sans GB","Noto Sans SC","Microsoft YaHei",sans-serif;
    line-height:1.55;-webkit-font-smoothing:antialiased;min-height:100vh;}
  a{color:inherit;text-decoration:none}
  .mono{font-family:"Geist Mono","SF Mono","Menlo",monospace}

  .top{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;
    padding:14px 28px;border-bottom:1px solid var(--line);
    background:rgba(10,10,10,.86);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);}
  .logo{font-size:15px;font-weight:600;letter-spacing:-.02em}
  .logo span{color:var(--muted);font-weight:500;margin-left:8px}
  .top-meta{font-size:12.5px;color:var(--muted)}

  .shell{max-width:1020px;margin:0 auto;padding:48px 28px 100px}
  .hero{margin-bottom:30px}
  .eyebrow{font-size:12.5px;font-weight:500;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-bottom:14px}
  h1{font-size:clamp(36px,5.2vw,52px);font-weight:600;letter-spacing:-.03em;line-height:1.08}
  .hero-sub{margin-top:12px;font-size:15.5px;color:var(--muted);max-width:44em}

  .stats{display:flex;flex-wrap:wrap;gap:10px;margin:24px 0 8px}
  .stat{border:1px solid var(--line);border-radius:12px;padding:11px 16px;min-width:112px}
  .stat b{display:block;font-size:25px;font-weight:600;letter-spacing:-.02em;line-height:1.2}
  .stat span{font-size:12px;color:var(--muted);letter-spacing:.04em}
  .stat.warn b{color:#E9BD6E}

  .toolbar{position:sticky;top:57px;z-index:20;background:rgba(10,10,10,.92);
    backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
    padding:14px 0 12px;margin:18px 0 6px;border-bottom:1px solid var(--line)}
  .search{display:flex;align-items:center;gap:10px;margin-bottom:10px}
  .search input{flex:1;background:var(--surface-2);border:1px solid var(--line);border-radius:10px;
    color:var(--ink);font-size:15px;padding:11px 14px;outline:none;font-family:inherit}
  .search input:focus{border-color:var(--line-strong)}
  .search input::placeholder{color:var(--faint)}
  .chips{display:flex;flex-wrap:wrap;gap:7px}
  .chip{border:1px solid var(--line);border-radius:999px;padding:5px 12px;font-size:12.5px;font-weight:500;
    color:var(--muted);background:transparent;cursor:pointer;font-family:inherit}
  .chip:hover{color:var(--ink);border-color:var(--line-strong)}
  .chip.on{color:var(--ink);border-color:var(--line-strong);background:rgba(255,255,255,.08)}

  .label{font-size:12px;font-weight:500;color:var(--faint);letter-spacing:.08em;text-transform:uppercase;margin:32px 0 10px}
  .group{border:1px solid var(--line);border-radius:18px;overflow:hidden;background:var(--surface);margin-bottom:22px}
  .group-head{padding:22px 24px 16px}
  .group-title{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:5px}
  .group-title h2{font-size:21.5px;font-weight:600;letter-spacing:-.02em}
  .group-title .en{font-size:12px;color:var(--faint);letter-spacing:.06em}
  .group-desc{font-size:14px;color:var(--muted);max-width:46em;margin-bottom:9px}
  .tags{display:flex;flex-wrap:wrap;gap:6px}
  .tag{font-size:11.5px;font-weight:500;color:var(--muted);border:1px solid var(--line);padding:3px 9px;border-radius:999px}
  .tag.on{color:var(--ink);border-color:var(--line-strong);background:rgba(255,255,255,.04)}
  .tag.warn{color:#E9BD6E;border-color:rgba(244,192,58,.35);background:rgba(244,192,58,.08)}
  .tag.ok{color:#8CC9A1;border-color:rgba(95,169,122,.4);background:rgba(95,169,122,.1)}

  .rows{border-top:1px solid var(--line)}
  .row{display:grid;grid-template-columns:66px minmax(0,1fr) auto auto;gap:14px;align-items:center;
    padding:13px 16px;border-bottom:1px solid var(--line);background:rgba(255,255,255,.015)}
  .row:last-child{border-bottom:0}
  .row:not(.todo):hover{background:rgba(255,255,255,.05)}
  .row.todo{opacity:.9}
  .kind{font-size:11px;font-weight:600;letter-spacing:.04em;text-align:center;padding:4px 0;border-radius:7px;
    color:var(--muted);border:1px solid var(--line)}
  .kind.deck{color:#F7D77E;border-color:rgba(244,192,58,.4);background:var(--amber-dim)}
  .kind.interaction{color:#9DBBE8;border-color:rgba(110,147,201,.4);background:rgba(110,147,201,.12)}
  .kind.syllabus{color:#8CC9A1;border-color:rgba(95,169,122,.35);background:rgba(95,169,122,.1)}
  .kind.todo{color:#E9BD6E;border-color:rgba(244,192,58,.4);border-style:dashed;background:transparent}
  .row-name{display:flex;flex-direction:column;gap:2px;min-width:0}
  .nm{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .nm b{font-size:16px;font-weight:600;letter-spacing:-.01em}
  .pill{font-size:10.5px;font-weight:600;padding:2px 7px;border-radius:999px;letter-spacing:.03em}
  .pill.ready{color:#8CC9A1;background:rgba(95,169,122,.12)}
  .pill.pilot{color:#E9BD6E;background:rgba(244,192,58,.12)}
  .pill.todo{color:#E9BD6E;background:rgba(244,192,58,.16)}
  .pill.archived{color:var(--faint);background:rgba(255,255,255,.05)}
  .row-name span{font-size:13px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .row-meta{font-size:12.5px;color:var(--faint);text-align:right;white-space:nowrap;line-height:1.5}
  .row-go{display:flex;gap:8px}
  .btn{display:inline-flex;align-items:center;justify-content:center;padding:7px 14px;border-radius:9px;
    font-size:13px;font-weight:600;border:1px solid var(--line-strong);background:rgba(255,255,255,.05);white-space:nowrap}
  .btn:hover{background:rgba(255,255,255,.12)}
  .btn.primary{background:var(--amber);color:#181206;border-color:var(--amber)}
  .btn.primary:hover{background:#F9CE5C}
  .btn.ghost{border-color:var(--line);background:transparent;color:var(--muted);font-weight:500}
  .btn.ghost:hover{color:var(--ink)}

  .empty{display:none;padding:40px 20px;text-align:center;color:var(--faint);font-size:14px}
  .empty.on{display:block}
  .foot{margin-top:40px;padding-top:18px;border-top:1px solid var(--line);
    display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-size:13px;color:var(--faint)}
  .foot a{color:var(--muted);border-bottom:1px solid var(--line)}
  .foot a:hover{color:var(--ink)}

  @media (max-width:720px){
    .shell{padding:34px 16px 80px}
    .top{padding:12px 16px}
    .logo span{display:none}
    .top-meta{display:none}
    .toolbar{top:49px}
    .row{grid-template-columns:54px minmax(0,1fr);grid-auto-rows:auto;gap:8px 12px}
    .row-meta{display:none}
    .row-go{grid-column:1/-1;justify-content:flex-start}
    .kind{font-size:10px}
    .nm b{font-size:15px}
  }
</style>
</head>
<body>

<header class="top">
  <div class="logo">AI 课程库<span>教材管理入口</span></div>
  <div class="top-meta mono">数据更新 __UPDATED__</div>
</header>

<main class="shell">
  <header class="hero">
    <p class="eyebrow mono">Course Library · 数据驱动</p>
    <h1>全部课程，一处管理。</h1>
    <p class="hero-sub">清单来自仓库内 courses.json——加课件只加一行数据。下面的搜索和筛选直接可用。</p>
  </header>

  <div class="stats" id="stats"></div>

  <div class="toolbar">
    <div class="search">
      <input id="q" type="search" placeholder="搜课件、互动、课纲…（如：猛禽、M1、海报）" aria-label="搜索">
    </div>
    <div class="chips" id="kindChips"></div>
    <div class="chips" id="statusChips" style="margin-top:7px"></div>
  </div>

  <div id="content"></div>
  <div class="empty" id="empty">没有匹配的条目，换个关键词或清除筛选。</div>

  <div class="foot">
    <span>BILDEN EDU · 课程库 · __UPDATED__</span>
    <span><a href="https://github.com/jacobatxa/ForNewFuture">GitHub 仓库</a> · 数据源 courses.json</span>
  </div>
</main>

<script>
const DATA = __DATA__;

const KIND_LABEL = {deck:'课件', interaction:'互动', syllabus:'课纲', material:'物料', doc:'文档', tool:'工具'};
const STATUS_LABEL = {ready:'可用', pilot:'试点', todo:'待做', archived:'归档'};
const KIND_FILTERS = [['all','全部类型'],['deck','只看课件'],['interaction','只看互动'],['syllabus','只看课纲'],['material','只看物料'],['doc','文档与工具']];
const STATUS_FILTERS = [['all','全部状态'],['ready','可用'],['pilot','试点'],['todo','待做'],['archived','归档']];
const KIND_ORDER = {deck:0, interaction:1, syllabus:2, material:3, doc:4, tool:5};

const state = {q:'', kind:'all', status:'all'};

function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function renderStats(){
  const courses = DATA.programs.filter(p=>p.id!=='framework').length;
  const decks = DATA.items.filter(i=>i.kind==='deck'&&i.status!=='todo'&&i.status!=='archived').length;
  const inter = DATA.items.filter(i=>i.kind==='interaction').length;
  const todo = DATA.items.filter(i=>i.status==='todo').length;
  document.getElementById('stats').innerHTML =
    `<div class="stat"><b>${courses}</b><span>套课程</span></div>`
   +`<div class="stat"><b>${decks}</b><span>份可用课件</span></div>`
   +`<div class="stat"><b>${inter}</b><span>个互动</span></div>`
   +`<div class="stat warn"><b>${todo}</b><span>项待做</span></div>`;
}

function chips(list, cur, sel){
  return list.map(([k,label])=>`<button class="chip${k===cur?' on':''}" data-sel="${sel}" data-val="${k}">${label}</button>`).join('');
}
function renderChips(){
  document.getElementById('kindChips').innerHTML = chips(KIND_FILTERS, state.kind, 'kind');
  document.getElementById('statusChips').innerHTML = chips(STATUS_FILTERS, state.status, 'status');
  document.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{
    state[c.dataset.sel]=c.dataset.val; renderChips(); render();
  });
}

function match(it, prog){
  if(state.kind!=='all'){
    if(state.kind==='doc'){ if(!(it.kind==='doc'||it.kind==='tool')) return false; }
    else if(it.kind!==state.kind) return false;
  }
  if(state.status!=='all'&&it.status!==state.status) return false;
  if(state.q){
    const hay = (it.title+' '+(it.notes||'')+' '+(prog?prog.name:'')).toLowerCase();
    if(!hay.includes(state.q.toLowerCase())) return false;
  }
  return true;
}

function row(it){
  const kind = it.status==='todo' ? 'todo' : it.kind;
  const klabel = it.status==='todo' ? '待做' : (KIND_LABEL[it.kind]||it.kind);
  const status = STATUS_LABEL[it.status] ? `<span class="pill ${it.status}">${STATUS_LABEL[it.status]}</span>` : '';
  const meta = [
    it.pages ? it.pages+' 页' : '',
    it.size || '',
    it.updated || ''
  ].filter(Boolean).join(' · ');
  let go='';
  if(it.path){
    const isExt = it.path.startsWith('http');
    go = `<a class="btn primary" href="${esc(it.path)}"${isExt?' target="_blank" rel="noopener"':''}>打开</a>`;
    if(it.source){
      go += `<a class="btn ghost" href="https://github.com/jacobatxa/ForNewFuture/blob/main/${esc(it.source)}" target="_blank" rel="noopener">源文件</a>`;
    }
  }
  return `<div class="row${it.status==='todo'?' todo':''}">
    <span class="kind ${kind}">${klabel}</span>
    <span class="row-name">
      <span class="nm"><b>${esc(it.title)}</b>${status}</span>
      <span>${esc(it.notes||'')}</span>
    </span>
    <span class="row-meta">${esc(meta)}</span>
    <span class="row-go">${go}</span>
  </div>`;
}

function render(){
  const wrap = [];
  let any = false;
  const progs = [...DATA.programs].sort((a,b)=>(a.order||0)-(b.order||0));
  for(const p of progs){
    const items = DATA.items.filter(it=>it.program===p.id&&match(it,p))
      .sort((a,b)=>{
        const pa=(a.primary?0:1), pb=(b.primary?0:1);
        if(pa!==pb) return pa-pb;
        const ka=KIND_ORDER[a.kind]??9, kb=KIND_ORDER[b.kind]??9;
        if(a.status==='todo'&&b.status!=='todo') return 1;
        if(b.status==='todo'&&a.status!=='todo') return -1;
        return ka-kb;
      });
    if(!items.length) continue;
    any = true;
    const tags = (p.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('');
    wrap.push(`<section class="group">
      <div class="group-head">
        <div class="group-title"><h2>${esc(p.name)}</h2><span class="en">${esc(p.en||'')}</span></div>
        <p class="group-desc">${esc(p.desc||'')}</p>
        <div class="tags">${tags}</div>
      </div>
      <div class="rows">${items.map(row).join('')}</div>
    </section>`);
  }
  document.getElementById('content').innerHTML = wrap.join('');
  document.getElementById('empty').className = 'empty'+(any?'':' on');
}

document.getElementById('q').addEventListener('input',e=>{state.q=e.target.value.trim();render();});
renderStats(); renderChips(); render();
</script>
</body>
</html>
"""

body = TEMPLATE.replace("__DATA__", json.dumps(data, ensure_ascii=False, indent=None))
body = body.replace("__UPDATED__", data.get("updated", ""))

out = os.path.join(BASE, "index.html")
open(out, "w", encoding="utf-8").write(body)

# 自检
items = data["items"]
assert all(set(i) >= {"id","program","title","kind","status"} for i in items)
print(f"生成 {out}  {len(body)} bytes")
print(f"程序 {len(data['programs'])} 组 / 条目 {len(items)} 条 / 待做 {sum(1 for i in items if i['status']=='todo')}")
