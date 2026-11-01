// M1「AI 跟人的关系」：本事转接台 —— 左侧简化真人胸前五个本事牌，接到右侧 AI 机箱五个抽屉舱。
// Anatomy iso-kit（MIT）。热区 .hot[data-f][data-side]；接通后 .hm-cable.on。
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const KIT = pathToFileURL(join(homedir(), "tools/anatomy/kit/iso-kit.mjs")).href;
const k = await import(KIT);

const WIDTH = 900;
const HEIGHT = 430;

const PLATE = { x: -158, y: -64, w: 318, d: 136, r: 7 };
const PLATE_H = 11;
const FOOT_H = 5;

const MAN = [-92, -6]; // 人偶立柱中心
const CASE = { x: 42, y: -42, w: 78, d: 72, r: 2 };
const CASE_Z = 3;
const CASE_H = 102;

/** 五个本事：人侧胸前纵向排列，机侧抽屉纵向排列 */
const FAC = [
  { id: "in",    z: 86, label: "看·听" },
  { id: "think", z: 68, label: "想" },
  { id: "mem",   z: 50, label: "记" },
  { id: "out",   z: 32, label: "说·做" },
  { id: "learn", z: 14, label: "技能" },
];

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [MAN[0], MAN[1], 128],
    ...k.boxCorners(CASE, 0, CASE_Z + CASE_H + 8),
    [CASE.x + CASE.w + 28, CASE.y + CASE.d + 18, 40],
  ],
  WIDTH,
  HEIGHT,
  { pad: 20, azimuth: 36 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const tenth = (n) => Math.round(n * 10) / 10;
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 16))) {
    out.push(S(k.cylinder(x, y, 6.2, -PLATE_H - FOOT_H, 1.4, P, 22), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 4.8, -PLATE_H - FOOT_H + 1.4, FOOT_H - 1.4, P, 22), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.5), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 9);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 1.9, 0, P, 12)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.42 }));

  const strip = { x: -140, y: PLATE.y + PLATE.d - 13, w: 280, d: 6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.55, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.7, 0.55, [1.6, 3], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));

  const tag = { x: -22, y: PLATE.y + 7, w: 48, d: 16, r: 1.2 };
  out.push(S(k.slabOf(tag, 0, 0.75, P, 4), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(tag, 1.3), 0.75, P), { tone: "faint" }));
  out.push(L([3.5, 7, 10.5].map((dy, i) => k.lineOnTop([tag.x + 3.5, tag.y + dy], [tag.x + 16 + i * 8, tag.y + dy], 0.75, P)).join(""), { tone: "lo", free: true }));
  out.push(D([at([tag.x + 3.5, tag.y + 3.5, 0.75]), at([tag.x + tag.w - 3.5, tag.y + 3.5, 0.75])], { size: 0.38 }));
  return out.join("");
}

function trough() {
  const rail = { x: -22, y: -34, w: 48, d: 68, r: 2 };
  const out = [];
  out.push(S(k.slabOf(rail, 0, 3.5, P, 4, 0.45), { tone: "lo" }));
  out.push(S(k.slabOf(k.insetPlan(rail, 2.5), 3.5, 2.4, P, 3, 0.25), { tone: "mid" }));
  for (let i = 0; i < 5; i++) {
    const y = rail.y + 8 + i * 11.5;
    out.push(S(k.slabOf({ x: rail.x + 4, y: y - 1.2, w: rail.w - 8, d: 2.4, r: 0.6 }, 5.9, 1.2, P, 2), { tone: "lo" }));
    out.push(D([at([rail.x + 6, y, 7.1]), at([rail.x + rail.w - 6, y, 7.1])], { size: 0.32, tone: "lo" }));
  }
  // 护盖半开
  out.push(S(k.slabOf({ x: rail.x - 1, y: rail.y - 10, w: rail.w + 2, d: 10, r: 1.5 }, 8, 1.2, P, 3, 0.3), { tone: "hi" }));
  out.push(D([at([rail.x + 4, rail.y - 5, 9.2]), at([rail.x + rail.w - 4, rail.y - 5, 9.2])], { size: 0.4 }));
  return out.join("");
}

function mannequin() {
  // 简化真人轮廓：圆头、软肩、毛衣躯干；胸前仍留五个本事模组位（交互点不变）
  const out = [];
  const mx = MAN[0];
  const my = MAN[1];

  // 软脚垫（不是机座螺丝盘）
  out.push(S(k.cylinder(mx, my, 18, 0, 2.2, P, 36, 0.5), { tone: "lo" }));
  out.push(L(k.ring(mx, my, 12, 2.2, P, 24), { tone: "faint" }));

  // 双腿
  out.push(S(k.cylinder(mx - 7.5, my + 1, 5.2, 2.2, 28, P, 22, 0.35), { tone: "mid" }));
  out.push(S(k.cylinder(mx + 7.5, my + 1, 5.2, 2.2, 28, P, 22, 0.35), { tone: "mid" }));
  // 鞋尖一点点
  out.push(S(k.cylinder(mx - 7.5, my + 4, 5.6, 2.2, 2.4, P, 18, 0.4), { tone: "lo" }));
  out.push(S(k.cylinder(mx + 7.5, my + 4, 5.6, 2.2, 2.4, P, 18, 0.4), { tone: "lo" }));

  // 髋 / 下摆
  const hips = { x: mx - 15, y: my - 11, w: 30, d: 22, r: 7 };
  out.push(S(k.slabOf(hips, 28, 16, P, 7, 0.8), { tone: "mid" }));

  // 毛衣躯干（圆角更大）
  const torso = { x: mx - 18, y: my - 13, w: 36, d: 26, r: 8 };
  out.push(S(k.slabOf(torso, 42, 48, P, 8, 1.1), { tone: "hi", crease: "lo" }));
  // 领口
  out.push(S(k.cylinder(mx, my - 1, 8.5, 88, 3.5, P, 24, 0.4), { tone: "mid" }));

  // 胸前本事牌底板（软布条感，不是金属导轨）
  const rail = { x: mx - 11, y: my + 2, w: 22, d: 10, r: 3 };
  out.push(S(k.slabOf(rail, 48, 2.2, P, 3, 0.35), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan({ x: mx - 12, y: my + 1, w: 24, d: 12, r: 3 }, 0), 90, P), { tone: "faint" }));

  // 圆肩
  out.push(S(k.cylinder(mx - 22, my - 1, 8, 84, 8, P, 22, 0.45), { tone: "mid" }));
  out.push(S(k.cylinder(mx + 22, my - 1, 8, 84, 8, P, 22, 0.45), { tone: "mid" }));
  // 手臂自然下垂
  out.push(S(k.cylinder(mx - 24, my + 1, 4.6, 52, 34, P, 18, 0.3), { tone: "mid" }));
  out.push(S(k.cylinder(mx + 24, my + 1, 4.6, 52, 34, P, 18, 0.3), { tone: "mid" }));
  // 手
  out.push(S(k.cylinder(mx - 24, my + 2, 5.2, 48, 5, P, 16, 0.4), { tone: "hi" }));
  out.push(S(k.cylinder(mx + 24, my + 2, 5.2, 48, 5, P, 16, 0.4), { tone: "hi" }));

  // 颈
  out.push(S(k.cylinder(mx, my, 5.5, 90, 8, P, 22, 0.35), { tone: "hi" }));
  // 圆头（无人脸面罩 / 传感器）
  out.push(S(k.cylinder(mx, my, 12.5, 98, 22, P, 36, 0.75), { tone: "hi" }));
  // 浅发顶暗示
  out.push(S(k.cylinder(mx, my - 1.5, 12.8, 116, 6, P, 32, 0.5), { tone: "mid" }));
  out.push(L(k.ring(mx, my, 10, 118, P, 22), { tone: "faint" }));

  return out.join("");
}

function humanPod(fac) {
  const pod = { x: MAN[0] - 9, y: MAN[1] + 3, w: 18, d: 11, r: 1.8 };
  const z = fac.z;
  const parts = [];
  parts.push(S(k.slabOf(pod, z, 9, P, 4, 0.45), { tone: "mid", lit: true }));
  parts.push(L(k.planOutline(k.insetPlan(pod, 1.4), z + 9, P), { tone: "hi" }));
  // 左侧端子
  parts.push(S(k.cylinder(pod.x - 1.5, pod.y + 5.5, 1.6, z + 2.5, 4, P, 12), { tone: "lo" }));
  parts.push(D([at([pod.x + 3, pod.y + 3, z + 9]), at([pod.x + pod.w - 3, pod.y + 3, z + 9])], { size: 0.32 }));
  parts.push(D([at([pod.x + pod.w / 2, pod.y + pod.d / 2, z + 9])], { size: 0.65, tone: "hi" }));
  // 把手小条
  parts.push(L(k.lineOnTop([pod.x + 4, pod.y + pod.d - 2], [pod.x + pod.w - 4, pod.y + pod.d - 2], z + 9, P), { tone: "lo" }));

  const hit = at([pod.x + pod.w / 2, pod.y + pod.d / 2, z + 9]);
  parts.push(`<circle class="hm-hit" cx="${tenth(hit[0])}" cy="${tenth(hit[1])}" r="16" fill="transparent"/>`);

  return k.groupSvg(parts, {
    class: "hot h",
    "data-f": fac.id,
    "data-side": "h",
    tabindex: "0",
    role: "button",
    "aria-label": fac.label,
  });
}

function chassis() {
  const out = [];
  // 垫脚
  out.push(S(k.slabOf({ x: CASE.x - 5, y: CASE.y - 5, w: CASE.w + 10, d: CASE.d + 14, r: 2 }, 0, CASE_Z, P, 4, 0.4), { tone: "lo" }));
  // 后板 + 左侧板（封闭面）
  out.push(S(k.slabOf({ x: CASE.x, y: CASE.y, w: CASE.w, d: 6, r: 1 }, CASE_Z, CASE_H, P, 3, 0.35), { tone: "mid" })); // 后
  out.push(S(k.slabOf({ x: CASE.x, y: CASE.y, w: 5, d: CASE.d, r: 1 }, CASE_Z, CASE_H, P, 3, 0.35), { tone: "mid" })); // 左
  // 底板 / 顶板
  out.push(S(k.slabOf(CASE, CASE_Z, 4, P, 4, 0.4), { tone: "lo" }));
  out.push(S(k.slabOf(CASE, CASE_Z + CASE_H - 4, 5, P, 4, 0.45), { tone: "hi" }));
  // 顶面散热槽
  for (let i = 0; i < 7; i++) {
    const x = CASE.x + 8 + i * 9;
    out.push(L(k.lineOnTop([x, CASE.y + 8], [x, CASE.y + CASE.d - 8], CASE_Z + CASE_H + 1, P), { tone: "faint" }));
  }
  // 右侧板翻开（躺在台面上）
  const door = { x: CASE.x + CASE.w + 4, y: CASE.y + 6, w: 4, d: CASE.d - 4, r: 1 };
  out.push(S(k.slabOf({ x: CASE.x + CASE.w + 2, y: CASE.y + 2, w: CASE.d - 6, d: 5, r: 1.2 }, 0, 2.2, P, 4, 0.3), { tone: "hi" }));
  out.push(L(k.planOutline(k.insetPlan({ x: CASE.x + CASE.w + 5, y: CASE.y + 5, w: CASE.d - 12, d: 3.2, r: 0.6 }, 0), 2.2, P), { tone: "faint" }));
  // 内腔背板
  out.push(S(k.slabOf({ x: CASE.x + 5, y: CASE.y + 6, w: CASE.w - 8, d: 4, r: 0.5 }, CASE_Z + 5, CASE_H - 12, P, 3), { tone: "lo" }));
  // 竖直导轨
  out.push(S(k.slabOf({ x: CASE.x + 8, y: CASE.y + 10, w: 2, d: CASE.d - 18, r: 0.4 }, CASE_Z + 8, CASE_H - 18, P, 2), { tone: "lo" }));
  out.push(S(k.slabOf({ x: CASE.x + CASE.w - 12, y: CASE.y + 10, w: 2, d: CASE.d - 18, r: 0.4 }, CASE_Z + 8, CASE_H - 18, P, 2), { tone: "lo" }));
  // 前面框
  out.push(S(k.slabOf({ x: CASE.x, y: CASE.y + CASE.d - 5, w: CASE.w, d: 5, r: 1 }, CASE_Z, CASE_H, P, 3, 0.3), { tone: "hi", crease: "lo" }));
  // 电源钮 + LED
  out.push(S(k.cylinder(CASE.x + 10, CASE.y + CASE.d - 2.5, 2.2, CASE_Z + CASE_H - 14, 2.5, P, 14), { tone: "hi", lit: true }));
  out.push(D([at([CASE.x + 18, CASE.y + CASE.d - 2.5, CASE_Z + CASE_H - 12])], { size: 0.55, tone: "hi" }));
  out.push(D(k.corners(CASE, 4).map(([x, y]) => at([x, y, CASE_Z + CASE_H + 1])), { size: 0.38 }));
  void door;
  return out.join("");
}

function machineBay(fac, i) {
  // 抽屉从机箱前面向外探出一截
  const pull = 10 + (i % 3) * 3;
  const bay = {
    x: CASE.x + 12,
    y: CASE.y + 14,
    w: CASE.w - 22,
    d: CASE.d - 22 + pull,
    r: 1.4,
  };
  const z = CASE_Z + fac.z;
  const parts = [];
  parts.push(S(k.slabOf(bay, z, 11, P, 4, 0.4), { tone: i === 1 ? "hi" : "mid", lit: i === 1 }));
  parts.push(L(k.planOutline(k.insetPlan(bay, 1.6), z + 11, P), { tone: "hi" }));
  // 前把手
  const fy = bay.y + bay.d - 3;
  parts.push(S(k.slabOf({ x: bay.x + 10, y: fy, w: bay.w - 20, d: 2.2, r: 0.8 }, z + 3, 5, P, 3), { tone: "lo" }));
  parts.push(D([at([bay.x + 5, fy + 1, z + 11])], { size: 0.5, tone: "hi" }));
  // 端口
  for (let p = 0; p < 3; p++) {
    parts.push(L(k.ring(bay.x + 12 + p * 12, bay.y + 6, 1.8, z + 11, P, 10), { tone: "lo" }));
  }

  const hit = at([bay.x + bay.w / 2, bay.y + bay.d - 6, z + 11]);
  parts.push(`<circle class="hm-hit" cx="${tenth(hit[0])}" cy="${tenth(hit[1])}" r="17" fill="transparent"/>`);

  return k.groupSvg(parts, {
    class: "hot m",
    "data-f": fac.id,
    "data-side": "m",
    tabindex: "0",
    role: "button",
    "aria-label": fac.label + "舱",
  });
}

function cables() {
  return FAC.map((fac, i) => {
    const hx = MAN[0] - 10.5;
    const hy = MAN[1] + 8.5;
    const hz = fac.z + 4.5;
    const mx = CASE.x + 10;
    const my = CASE.y + 20 + i * 8;
    const mz = CASE_Z + fac.z + 5;
    const ySlot = -28 + i * 11.5;
    const pts = [
      at([hx, hy, hz]),
      at([-40, hy * 0.4 + ySlot * 0.6, hz * 0.35 + 8]),
      at([-4, ySlot, 7.2]),
      at([28, ySlot * 0.5 + my * 0.5, 7.2]),
      at([mx, my, mz]),
    ];
    return k.groupSvg(L(k.pathOf(pts), { tone: "faint", className: "hm-cable-stroke", flow: true }), {
      class: "hm-cable",
      "data-f": fac.id,
    });
  }).join("");
}

function terminals() {
  const dots = [];
  FAC.forEach((fac, i) => {
    dots.push(at([MAN[0] - 10.5, MAN[1] + 8.5, fac.z + 4.5]));
    dots.push(at([CASE.x + 10, CASE.y + 20 + i * 8, CASE_Z + fac.z + 5]));
  });
  return D(dots, { size: 0.48, tone: "mid" });
}

export function hmBenchFigure() {
  const body = [
    plate(),
    trough(),
    mannequin(),
    // 人模组从下到上
    ...[...FAC].reverse().map((f) => humanPod(f)),
    chassis(),
    ...[...FAC].reverse().map((f, idx) => machineBay(f, FAC.length - 1 - idx)),
    cables(),
    terminals(),
  ];

  return {
    svg: k.figureSvg({
      width: WIDTH,
      height: HEIGHT,
      label: "本事转接台：左边人胸前五个本事牌，右边 AI 机箱五个抽屉舱，中间线槽接线。",
      body,
      className: "hm-svg",
    }),
  };
}
