# 超级AI营 · HTML 课件

面向 10-12 岁孩子的 5 天 AI 通识营课件（重庆武陵山），HTML 形式的演示文稿，**完全离线运行**——无 CDN、无在线字体、无外链图片，营地断网也照常放映。

## 使用

无需构建，任选一种方式打开：

```bash
# 方式一：直接双击 index.html（file:// 协议即可运行）
# 方式二：本地起静态服务
python3 -m http.server 8642
# 然后访问 http://localhost:8642
```

- 方向键 / 空格：翻页；Home / End：跳首尾页
- 鼠标移到画面左右边缘出现翻页热区
- URL 带 `#页码` 可直接跳页（如 `day1.html#2`）

## 结构

```
index.html               入口页（五天目录）
day1.html                Day 1 · 自然智慧与人类智力起源探索（22 页完整版）
assets/css/deck.css      共享样式（1920x1080 固定舞台 + scale 适配、暗色渐变、毛玻璃）
assets/js/deck.js        翻页 / 进度条 / 页码 / slideenter 事件
assets/js/boids.js       P5b 集群涌现模拟（canvas boids）
assets/js/drag.js        P8 词卡拖拽拼句（结果存 localStorage，P19 回引）
assets/js/interactions.js P11 星点连线 / P13 学习循环点亮 / P14 P18 计时器 / P19 句子回引
assets/photos/           主视觉（AI 生成，可替换同名文件升级为实拍）
```

## 设计规范

- 纯摄影背景（深空/自然/微距），不用卡通插画，不用 emoji，图标只用 SVG
- 全屏暗色渐变 + 毛玻璃卡片；字号大，一页一个观点
- 固定 1920x1080 舞台，`transform: scale()` 等比适配任何屏幕
- 中文字体走系统栈：PingFang SC → Hiragino Sans GB → Microsoft YaHei

## 当前进度

Day 1 完整版已完成（30 页）。三幕各有全屏幕间页（森林晨光/岩画手印/神经网络），另有椋鸟群全屏页。交互页：P4 现场可编辑分享卡、boids 集群模拟、词卡拖拽拼句、星点连线、学习循环逐步点亮、十分钟倒计时、机器学习双栏对比、猫狗拖拽标注游戏、数据量滑块（越喂越聪明）、深度学习分层点亮、三轮 90 秒计时、结尾自动回引拼出的句子。下一步：复用组件推进 Day 2-5。
