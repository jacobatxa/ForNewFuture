// M1「AI 长什么样」立体图：一个大语言模型，字从下往上穿过一层层 Transformer，最上面猜出下一个字。
// 用 wheresryan22/anatomy（MIT）的 iso-kit 生成 SVG，本机路径 ~/tools/anatomy。
// 层数按 DeepSeek-V3 技术报告（2024）：61 层；图里画 5 层，中间省略。
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const KIT = pathToFileURL(join(homedir(), "tools/anatomy/kit/iso-kit.mjs")).href;
const k = await import(KIT);

const WIDTH = 560;
const HEIGHT = 500;
const TOKENS = ["床", "前", "明", "月"];
const NEXT = "光";
const LAYERS = [1, 2, 3, 60, 61];

const CELL = 16;
const GAP = 6;
const SPAN = TOKENS.length * CELL + (TOKENS.length - 1) * GAP;
const X0 = -SPAN / 2;
const Y0 = -CELL / 2;
const SLAB = { x: X0 - 8, y: Y0 - 6, w: SPAN + 16, d: CELL + 12, r: 2 };
const SLAB_H = 3;
const BLOCK_H = 4;
const STEP = 30;
const BREAK = 16;

const zOfLayer = (i) => 40 + i * STEP + (i >= 3 ? BREAK : 0);
const Z_OUT = zOfLayer(LAYERS.length) + 6;
const xOf = (t) => X0 + t * (CELL + GAP);

const OUT_PLAN = { x: X0 + (TOKENS.length - 1) * (CELL + GAP), y: Y0, w: CELL, d: CELL };
const P = k.fitProjection(
  [...k.boxCorners(SLAB, 0, zOfLayer(LAYERS.length - 1) + SLAB_H + BLOCK_H), ...k.boxCorners(OUT_PLAN, Z_OUT, Z_OUT + BLOCK_H + 8)],
  WIDTH,
  HEIGHT,
  { pad: 24, azimuth: 45 },
);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const tenth = (n) => Math.round(n * 10) / 10;

function tile(t, z, text, style = {}) {
  const plan = { x: xOf(t), y: Y0, w: CELL, d: CELL, r: 1.2 };
  const top = z + BLOCK_H;
  const c = at([xOf(t) + CELL / 2, 0, top]);
  const label = text ? `<text class="m-word" x="${tenth(c[0])}" y="${tenth(c[1] + 5)}" text-anchor="middle">${text}</text>` : "";
  return S(k.slabOf(plan, z, BLOCK_H, P, 3, 0.4), { tone: "mid", ...style, inner: label });
}

function riser(t, from, to) {
  const c = [xOf(t) + CELL / 2, 0];
  return L(k.segment([...c, from], [...c, to], P), { tone: "faint", className: "m-rise" });
}

// 最后一个字回头"看"前面每个字：在层顶面上方画弧
function attention(z) {
  const top = z + SLAB_H + BLOCK_H;
  const last = TOKENS.length - 1;
  const from = xOf(last) + CELL / 2;
  return TOKENS.slice(0, last).map((_, t) => {
    const to = xOf(t) + CELL / 2;
    const lift = 6 + (last - t) * 3;
    const pts = Array.from({ length: 17 }, (_, i) => {
      const u = i / 16;
      return at([from + (to - from) * u, 0, top + Math.sin(Math.PI * u) * lift]);
    });
    return L(k.pathOf(pts), { tone: "hi", className: "m-att" });
  }).join("");
}

function layer(i) {
  const z = zOfLayer(i);
  const blocks = TOKENS.map((_, t) => tile(t, z + SLAB_H, ""));
  const tag = at([SLAB.x - 2, SLAB.y + SLAB.d, z + SLAB_H / 2]);
  return k.groupSvg([
    S(k.slabOf(SLAB, z, SLAB_H, P, 3, 0.4), { tone: "mid" }),
    ...blocks,
    attention(z),
    `<text class="m-tag" x="${tenth(tag[0] - 8)}" y="${tenth(tag[1] + 4)}" text-anchor="end">第 ${LAYERS[i]} 层</text>`,
  ], { class: "m-layer", "data-l": i });
}

function body() {
  const out = [];
  out.push(k.groupSvg(TOKENS.map((w, t) => tile(t, 0, w, { tone: "hi" })), { class: "m-in" }));
  let below = BLOCK_H;
  LAYERS.forEach((_, i) => {
    const z = zOfLayer(i);
    TOKENS.forEach((_, t) => out.push(riser(t, below, z)));
    if (i === 3) {
      const a = at([SLAB.x - 2, SLAB.y + SLAB.d, zOfLayer(2)]), b = at([SLAB.x - 2, SLAB.y + SLAB.d, z]);
      out.push(`<text class="m-tag m-gap" x="${tenth((a[0] + b[0]) / 2 - 8)}" y="${tenth((a[1] + b[1]) / 2 + 4)}" text-anchor="end">⋮ 中间还有 56 层</text>`);
    }
    out.push(layer(i));
    below = z + SLAB_H + BLOCK_H;
  });
  const last = TOKENS.length - 1;
  out.push(riser(last, below, Z_OUT));
  out.push(k.groupSvg(tile(last, Z_OUT, NEXT, { tone: "hi", lit: true }), { class: "m-out" }));
  const lab = at([xOf(last) + CELL + 6, Y0, Z_OUT + BLOCK_H]);
  out.push(`<text class="m-tag m-out" x="${tenth(lab[0] + 6)}" y="${tenth(lab[1])}">猜出下一个字</text>`);
  const inLab = at([xOf(last) + CELL + 6, Y0 + CELL, BLOCK_H / 2]);
  out.push(`<text class="m-tag" x="${tenth(inLab[0] + 6)}" y="${tenth(inLab[1] + 6)}">你给它的字</text>`);
  return out;
}

export function modelFigure() {
  return k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label: `一个大语言模型的立体示意：底下是"${TOKENS.join("")}"四个字，往上穿过第 1、2、3 层，中间省略 56 层，再穿过第 60、61 层，最上面猜出下一个字"${NEXT}"。`,
    body: body(),
  });
}

export const MODEL_LAYERS = LAYERS.length;
