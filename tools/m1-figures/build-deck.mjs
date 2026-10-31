// 把 anatomy 生成的机柜图、模型立体图和 img/ 里的配图塞进 M1 第一节课件模板，输出单文件 HTML。
// 用法：node tools/m1-figures/build-deck.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { rackFigures } from "./rack.mjs";
import { modelFigure } from "./model.mjs";
import { hmBenchFigure } from "./hm-bench.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "../../literacy/course/17-m1-online-hour1.html");

const { css, svgIn, svgOut } = rackFigures();
const model = modelFigure();
const hm = hmBenchFigure();
const html = readFileSync(join(HERE, "deck.template.html"), "utf8")
  .replace("/*@ISO_CSS@*/", () => css)
  .replace("<!--@RACK_IN@-->", () => svgIn)
  .replace("<!--@RACK_OUT@-->", () => svgOut)
  .replaceAll("<!--@MODEL@-->", () => model)
  .replace("<!--@HM_BENCH@-->", () => hm.svg)
  .replace(/@IMG:([\w-]+)@/g, (_, name) =>
    "data:image/webp;base64," + readFileSync(join(HERE, "img", `${name}.webp`)).toString("base64"));

if (/@ISO_CSS@|@RACK_|@MODEL@|@HM_BENCH@|@IMG:/.test(html)) throw new Error("template marker left unreplaced");
writeFileSync(OUT, html);
console.log(`${OUT} ${(html.length / 1024).toFixed(0)} KB`);
