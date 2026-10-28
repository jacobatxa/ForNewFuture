# Anatomy — 等距立体机械插图（第三方技能）

## 一句话
把一个技术概念变成一台**能动的等距立体机械图**：它的运转本身就是那个概念。输出单文件 HTML（SVG + 可选 WebGL）。

## 来源与许可
- 仓库：`https://github.com/wheresryan22/anatomy`
- 作者：Ryan（@wheresryan22）
- 许可：**MIT**（可用于商业项目，保留版权声明即可）
- 本机安装位置：`~/tools/anatomy/`（40 MB，已 clone，已跑通构建）
- 环境要求：Node ≥ 20.10（本机 v25 ✓）、Chrome（本机 ✓，用于截图与审计）

## 为什么选它
我们课程的核心难点是"**看不见的东西怎么讲**"——手机分层、消息路径、token 计费、反馈回路。静态图讲不动，方框箭头图孩子不看。Anatomy 的路子是：**发明一台真机器**，让机制变成可见的零件运动。这正是我们 skill `interactive-courseware-visuals` 里"物体即解释"这条铁律的来源。

## 怎么用

```bash
cd ~/tools/anatomy/examples/dial-indicator   # 最小示例，约 300 行
node build.mjs                                # 出独立 HTML
node build.mjs --light                        # 浅色主题
node build.mjs --audit                        # 审计穿模/支撑/深度顺序（管线与回转件必跑）
node scripts/lines.mjs page.html              # 线头检查：每条线必须终止在边/点/轮廓上
node scripts/capture.mjs                       # 多尺寸截图（桌面 / 390 手机 / 悬停 / 运动帧）
```

**先读**：`SKILL.md`（方法全文）、`references/craft.md`（零件配方）、`references/motion.md`（动效）、`references/verify.md`（验收）。

**照着抄结构，不照着抄对象**：示例里有桌面电脑（可敲字、关机画面坍缩）、投币街机（投币机构与线束）、火箭发动机试验台（密集管路）、波纹水槽（WebGL 光影）。选最接近你概念机制的那个看。

## 尺寸分档（做之前先定）
| 档 | 零件数 | 耗时 | 适用 |
|---|---|---|---|
| Figure | 40–80 | 约 1 小时 | 单节课里的一个原理图（默认选这档） |
| Hero | 80–150 | 2–4 小时 | 模块主图、可带多层 WebGL |
| Epic | 更多 | 6 小时以上 | **不擅自开工**，先报价并给 Hero 降级方案 |

## 我们的额外约束（Anatomy 本身没管，我们要管）
- **单文件 HTML、零 CDN、零外部依赖**，双击即开（要能直接发到飞书群里）
- **手机 390 宽不横向溢出**，触控能拖
- **体积 ≤ 5MB**，大图一律用矢量
- **`prefers-reduced-motion` 下静止**，键盘可操作
- 图里**不放长文字**；中文标注只保留一个极小的入题标签，说明放到卡片外
- 装框沿用它的规范：`Fig n` 左上、短标题右上、操作提示左下、实时读数右下

## 已知坑
- `/tmp` 下跑 tesseract/leptonica 会读不到文件——**所有中间产物放工作目录，不要放 `/tmp`**（我们踩过）
- 本机 Chrome 的 `--remote-debugging-port` 在 **默认配置目录**上会被拒绝（Chrome 136+ 的安全限制），必须用独立 `--user-data-dir`
- 审计报错要**改几何**，不许用 key 偏移糊过去（它自己的规矩，值得遵守）

## 和其它技能的关系
- `interactive-courseware-visuals`：我们的取舍与验收标准（Anatomy 是工具，那份是纪律）
- `instructional-design-courseware`：先确定"这张图要证明哪个目标"，再决定画什么
