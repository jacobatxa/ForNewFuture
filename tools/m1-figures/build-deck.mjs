// 把 anatomy 生成的机柜图和 img/ 里的配图塞进 M1 第一节课件模板，输出单文件 HTML。
// 用法：node tools/m1-figures/build-deck.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { rackFigures } from "./rack.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "../../literacy/course/17-m1-online-hour1.html");

const { css, svgIn, svgOut } = rackFigures();
const html = readFileSync(join(HERE, "deck.template.html"), "utf8")
  .replace("/*@ISO_CSS@*/", () => css)
  .replace("<!--@RACK_IN@-->", () => svgIn)
  .replace("<!--@RACK_OUT@-->", () => svgOut)
  .replace(/@IMG:([\w-]+)@/g, (_, name) =>
    "data:image/webp;base64," + readFileSync(join(HERE, "img", `${name}.webp`)).toString("base64"));

if (/@ISO_CSS@|@RACK_|@IMG:/.test(html)) throw new Error("template marker left unreplaced");
writeFileSync(OUT, html);
console.log(`${OUT} ${(html.length / 1024).toFixed(0)} KB`);
