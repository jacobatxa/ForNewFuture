// M1「AI 住在哪里」立体图：机房里的一个机柜，可以拉出一台 8 卡 GPU 服务器。
// 用 wheresryan22/anatomy（MIT）的 iso-kit 生成 SVG，本机路径 ~/tools/anatomy。
// 尺寸按真实设备取整（单位：厘米）：标准机柜约 60×105×200，1U = 4.445，
// 一台 8 卡 GPU 服务器约 8U；一个机柜按供电通常放 4 台。
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const KIT = pathToFileURL(join(homedir(), "tools/anatomy/kit/iso-kit.mjs")).href;
const k = await import(KIT);

const WIDTH = 640;
const HEIGHT = 470;
const U = 4.445;

const FLOOR = { x: -64, y: -66, w: 128, d: 236, r: 2 };
const FLOOR_H = 4;
const RACK = { x: -32, y: -52, w: 64, d: 104, r: 1 };
const PLINTH_H = 6;
const TOP_Z = 200;
const CAP_H = 6;
const IN = { x: -28, y: -50, w: 56, d: 100, r: 0.8 };
const PULL = 100;
const PULLED = 1;

const TRAYS = [
  { kind: "psu", z: PLINTH_H + 1, h: 2 * U },
  { kind: "gpu", z: PLINTH_H + 11, h: 8 * U - 0.6 },
  { kind: "gpu", z: PLINTH_H + 11 + 8 * U, h: 8 * U - 0.6 },
  { kind: "gpu", z: PLINTH_H + 11 + 16 * U, h: 8 * U - 0.6 },
  { kind: "gpu", z: PLINTH_H + 11 + 24 * U, h: 8 * U - 0.6 },
  { kind: "switch", z: PLINTH_H + 13 + 32 * U, h: U - 0.4 },
  { kind: "switch", z: PLINTH_H + 13 + 33 * U, h: U - 0.4 },
];

const P = k.fitProjection(
  [...k.boxCorners(FLOOR, -FLOOR_H, 0), ...k.boxCorners(RACK, 0, TOP_Z + CAP_H)],
  WIDTH,
  HEIGHT,
  { pad: 26, azimuth: 40 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const seg = (a, b) => k.segment(a, b, P);

function floor() {
  const out = [`<path class="iso-halo" d="${k.haloOf(FLOOR, -FLOOR_H, FLOOR_H, P)}"/>`];
  out.push(S(k.slabOf(FLOOR, -FLOOR_H, FLOOR_H, P, 3, 0.6), { tone: "lo" }));
  for (let x = FLOOR.x + 32; x < FLOOR.x + FLOOR.w; x += 32) out.push(L(k.lineOnTop([x, FLOOR.y], [x, FLOOR.y + FLOOR.d], 0, P), { tone: "faint" }));
  for (let y = FLOOR.y + 59; y < FLOOR.y + FLOOR.d; y += 59) out.push(L(k.lineOnTop([FLOOR.x, y], [FLOOR.x + FLOOR.w, y], 0, P), { tone: "faint" }));
  // 前方一块通风地板：冷风从这里吹上来
  out.push(D(k.dotGrid(FLOOR.x + 38, FLOOR.y + 182, 10, 6, 4.2, 0, P), { size: 0.4, tone: "lo" }));
  return out.join("");
}

function plinth() {
  const out = [];
  for (const [x, y] of k.corners(RACK, 5)) out.push(S(k.cylinder(x, y, 2.6, 0, 1.5, P, 16), { tone: "lo" }));
  out.push(S(k.slabOf(RACK, 1.5, PLINTH_H - 1.5, P, 3, 0.5), { tone: "mid" }));
  return out.join("");
}

const POSTS = {
  backLeft: { x: -32, y: -52, w: 4, d: 4, r: 0.5 },
  backRight: { x: 28, y: -52, w: 4, d: 4, r: 0.5 },
  frontLeft: { x: -32, y: 48, w: 4, d: 4, r: 0.5 },
  frontRight: { x: 28, y: 48, w: 4, d: 4, r: 0.5 },
};

function post(plan, front) {
  const out = [S(k.slabOf(plan, PLINTH_H, TOP_Z - PLINTH_H, P, 2, 0.3), { tone: "mid" })];
  if (front) {
    const holes = [];
    for (let z = PLINTH_H + 3; z < TOP_Z - 2; z += U) holes.push(at([plan.x + 2, plan.y + plan.d, z]));
    out.push(D(holes, { size: 0.35, tone: "lo" }));
  }
  return out.join("");
}

function cap() {
  const out = [S(k.slabOf(RACK, TOP_Z, CAP_H, P, 3, 0.6), { tone: "mid" })];
  out.push(L(k.planOutline(k.insetPlan(RACK, 5), TOP_Z + CAP_H, P, 3), { tone: "faint" }));
  out.push(D(k.dotGrid(-20, -30, 8, 10, 6, TOP_Z + CAP_H, P), { size: 0.35, tone: "lo" }));
  return out.join("");
}

// 一台设备的前脸：横向格栅线从左边线画到右边线，两侧把手和指示灯
function frontFace(tray, y, lit) {
  const out = [];
  const { z, h } = tray;
  const x0 = IN.x, x1 = IN.x + IN.w;
  const rows = tray.kind === "gpu" ? [0.22, 0.4, 0.58, 0.76] : [0.5];
  out.push(L(rows.map((f) => seg([x0, y, z + h * f], [x1, y, z + h * f])).join(""), { tone: "lo" }));
  if (tray.kind === "gpu") {
    const bays = [];
    for (let x = x0 + 7; x < x1 - 6; x += 7) bays.push(seg([x, y, z + h * 0.22], [x, y, z + h * 0.4]));
    out.push(L(bays.join(""), { tone: "faint" }));
  }
  const leds = tray.kind === "switch"
    ? Array.from({ length: 12 }, (_, i) => at([x0 + 8 + i * 3.6, y, z + h * 0.5]))
    : [at([x0 + 4, y, z + h * 0.88]), at([x0 + 7, y, z + h * 0.88])];
  out.push(D(leds, { size: 0.45, tone: lit ? "hi" : "mid" }));
  return out.join("");
}

function handles(tray, y) {
  if (tray.kind !== "gpu") return "";
  const zc = tray.z + tray.h * 0.6;
  const out = [];
  for (const x of [IN.x + 1, IN.x + IN.w - 4]) {
    out.push(S(k.slabOf({ x, y, w: 3, d: 3, r: 0.6 }, zc - 6, 12, P, 2, 0.3), { tone: "mid" }));
  }
  return out.join("");
}

function trayInRack(tray) {
  const out = [];
  const seams = tray.kind === "gpu" ? [tray.z + tray.h * 0.5] : [];
  const inner = seams.map((z) => L(k.sideSeam(IN, z, P, 2), { tone: "faint" })).join("");
  out.push(S(k.slabOf(IN, tray.z, tray.h, P, 2, 0.4), { tone: tray.kind === "gpu" ? "hi" : "mid", crease: "lo", inner }));
  out.push(frontFace(tray, IN.y + IN.d, false));
  out.push(handles(tray, IN.y + IN.d));
  return out.join("");
}

// 拉出来的服务器：没有盖子，看得见里面的 8 块 GPU、风扇墙和硬盘仓
function pulledServer(tray) {
  const z = tray.z;
  const h = tray.h;
  const base = { ...IN, y: IN.y + PULL };
  const yb = base.y;
  const out = [];
  out.push(S(k.slabOf(base, z, 2, P, 2, 0.3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: base.x, y: yb, w: 1.2, d: base.d, r: 0.3 }, z + 2, h - 6, P, 2), { tone: "mid" }));
  // 主板与 8 块 GPU（每块带散热片），按远近排序
  const board = { x: base.x + 2, y: yb + 6, w: base.w - 4, d: 56, r: 0.5 };
  out.push(S(k.slabOf(board, z + 2, 1.2, P, 2), { tone: "lo" }));
  const gpus = [];
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      gpus.push({ x: board.x + 1.5 + col * 13, y: board.y + 2 + row * 27, w: 11, d: 24, r: 0.6 });
    }
  }
  gpus.sort((a, b) => k.depthOf([a.x + a.w / 2, a.y + a.d / 2, 0], P) - k.depthOf([b.x + b.w / 2, b.y + b.d / 2, 0], P));
  const zb = z + 3.2;
  for (const g of gpus) {
    out.push(S(k.slabOf(g, zb, 2, P, 2), { tone: "mid" }));
    const sink = k.insetPlan(g, 0.8);
    const top = zb + 2 + 12;
    const fins = [];
    for (let x = sink.x + 1.6; x < sink.x + sink.w - 1; x += 1.6) fins.push(k.lineOnTop([x, sink.y], [x, sink.y + sink.d], top, P));
    out.push(S(k.slabOf(sink, zb + 2, 12, P, 2, 0.4), { tone: "hi", crease: "lo", lit: true }));
    out.push(L(fins.join(""), { tone: "lo" }));
  }
  // 风扇墙：6 个风扇，正面朝前
  const fanY = yb + 66;
  for (let i = 0; i < 6; i++) {
    const x = base.x + 2 + i * 8.9;
    out.push(S(k.slabOf({ x, y: fanY, w: 8.4, d: 6, r: 0.5 }, z + 2, 9, P, 2, 0.3), { tone: "mid" }));
    out.push(L(k.sideRing([x + 4.2, fanY + 6, z + 6.5], 3.4, "y", P, 20), { tone: "lo" }));
    out.push(D([at([x + 4.2, fanY + 6, z + 6.5])], { size: 0.4, tone: "mid" }));
  }
  // 硬盘仓
  const cage = { x: base.x + 2, y: yb + 76, w: base.w - 4, d: 20, r: 0.6 };
  out.push(S(k.slabOf(cage, z + 2, 12, P, 2, 0.4), { tone: "mid" }));
  const slots = [];
  for (let x = cage.x + 6.5; x < cage.x + cage.w - 1; x += 6.5) slots.push(k.lineOnTop([x, cage.y], [x, cage.y + cage.d], z + 14, P));
  out.push(L(slots.join(""), { tone: "faint" }));
  // 前面板（满高），带格栅、把手、指示灯
  const bezel = { x: base.x, y: yb + base.d - 4, w: base.w, d: 4, r: 0.4 };
  out.push(S(k.slabOf(bezel, z, h, P, 2, 0.4), { tone: "hi", crease: "lo" }));
  out.push(frontFace(tray, yb + base.d, true));
  out.push(handles(tray, yb + base.d));
  return out.join("");
}

function rails(tray) {
  const zc = tray.z + tray.h * 0.35;
  return S(k.slabOf({ x: IN.x + IN.w, y: IN.y + IN.d - 8, w: 1.2, d: PULL + 6, r: 0.3 }, zc, 3, P, 2), { tone: "lo" });
}

function rack(pulled) {
  const body = [floor(), plinth(), post(POSTS.backLeft, false)];
  TRAYS.forEach((tray, i) => {
    if (pulled && i === PULLED) return;
    body.push(trayInRack(tray));
  });
  body.push(post(POSTS.backRight, false), post(POSTS.frontLeft, true), post(POSTS.frontRight, true), cap());
  if (pulled) body.push(rails(TRAYS[PULLED]), pulledServer(TRAYS[PULLED]));
  return body;
}

const GPU_SERVERS = TRAYS.filter((t) => t.kind === "gpu").length;

export function rackFigures() {
  const svgIn = k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label: `机房地板上的一个机柜。从下到上：电源、${GPU_SERVERS} 台 GPU 服务器、两台网络交换机。`,
    body: rack(false),
  });
  const svgOut = k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label: "同一个机柜，其中一台 GPU 服务器沿导轨拉了出来，盖子打开，能看到 8 块带散热片的 GPU、一排风扇和硬盘仓。",
    body: rack(true),
  });
  return { css: k.ISO_CSS, svgIn, svgOut, gpuServers: GPU_SERVERS, gpusPerServer: 8 };
}
