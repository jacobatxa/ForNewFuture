# 课程制作技能库（给任何 agent 用）

这里的每个文件夹就是一个 **skill**：一份写给人也写给 AI 的操作规范。
你（人或 agent）在做这门课的任何一个产出物之前，先领对应的 skill，再动手。

> 上层规范是 [`../00-课程设计大纲.md`](../00-课程设计大纲.md)（H/S/X、术语表、合规红线）。
> 本目录是**下手的操作手册**：具体怎么做、怎么验收。

---

## 一、四个技能，按需领

| 技能 | 什么时候用 | 一句话 |
|---|---|---|
| [`instructional-design-courseware`](instructional-design-courseware/SKILL.md) | 写课程、教案、任务单、评价量规 | 逆向设计：先定"学完能做什么"，再定"怎么证明"，最后排活动 |
| [`interactive-courseware-visuals`](interactive-courseware-visuals/SKILL.md) | 要讲原理、要做交互图 | 别画方块箭头，**为一台机器发明原理**——物体即解释 |
| [`chinese-edu-copy`](chinese-edu-copy/SKILL.md) | 写或改中文文案（海报、大纲、家长信） | 去英文直译腔 + 三套口径 + 交付前替换检查 |
| [`ai-literacy-standards`](ai-literacy-standards/SKILL.md) | 目标对齐、向学校/家长解释依据 | 教育部 2025 指南四位一体 × 三学段；AI4K12；UNESCO 2024 |

**典型组合**：
- 写一节课 → `instructional-design` + `chinese-edu-copy`（+ 需要讲原理时加 `interactive-visuals`）
- 写一张海报 → `chinese-edu-copy`（+ `interactive-visuals` 只管图的部分）
- 跟学校/家长讲依据 → `ai-literacy-standards` + `chinese-edu-copy`

---

## 二、怎么装到你用的 agent 里

各家的目录约定不同，但**内容都是同一份 `SKILL.md`**。

### Claude Code
```bash
# 方式一：作为项目技能（推荐，跟着仓库走）
mkdir -p .claude/skills
cp -r framework/skills/instructional-design-courseware .claude/skills/
cp -r framework/skills/interactive-courseware-visuals .claude/skills/
cp -r framework/skills/chinese-edu-copy            .claude/skills/
cp -r framework/skills/ai-literacy-standards       .claude/skills/

# 方式二：社区分发（若该 skill 已发布到 skills 生态）
npx skills add <owner>/<repo>
```

### Cursor
```bash
mkdir -p .cursor/rules
# Cursor 用 .mdc；把 SKILL.md 正文原样搬进去，frontmatter 换成 description/globs/alwaysApply
```
仓库里已有 `.cursor/rules/agent-tasks.mdc` 可作格式参考（在 `kb-workspace` 项目里）。
课程类规则建议 `alwaysApply: false`，只在做课件时手动引用，避免占满上下文。

### Codex / OpenCode / Antigravity
同样是把 `SKILL.md` 放到各自 skills 目录；这三个都遵循 Anthropic 的 skill 格式（`name` + `description` + 正文）。

### 豆包工作（DoubaoWork）
```bash
cp -r framework/skills/<skill-name> \
  "$HOME/Library/Application Support/DoubaoWork/Default/.doubaowork/agent_mode/workspace/.user_skills/"
```
目录机制与凭据说明见本机技能 `doubao-work-skill-integration`。

### Hermes（本机 agent）
```bash
cp -r framework/skills/<skill-name> ~/.hermes/skills/courseware/
```

---

## 三、写新技能时的格式要求（硬）

```markdown
---
name: 小写连字符-不超过64字符
description: Use when <触发场景>。<一句话说明做什么>。   ← 必须 ≤60 字符，触发词放最前
---

# 标题

## 何时用
## 铁律 / 步骤
## 验收清单
## 不要做
```

- `description` 超过 60 字符会被截断，等于失去触发信号。
- 正文写**可执行的动作与判断标准**，不写背景故事。
- 一个技能只解决一类问题；跨领域的拆成两个。

---

## 四、第三方技能

我们不复制别人的代码，只记录**用了什么、为什么、怎么装、怎么约束**。见 [`vendors/`](vendors/)：

- [`vendors/anatomy.md`](vendors/anatomy.md) — 等距立体机械插图（MIT，已验证可用）
- [`vendors/visual-3d.md`](vendors/visual-3d.md) — 3D / 动画类候选技能选型记录（待验证）

---

## 五、更新规则

- 技能内容与 `00-课程设计大纲.md` 冲突时，**以大纲为准**，回头改技能。
- 在大纲里新增术语或红线，同步检查四个技能是否需要更新。
- 技能改了要写清"为什么改"，否则下一个 agent 会再改回去。
