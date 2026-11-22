// Batch renderer: writes SVGs into outputs/digital without a browser.
//   node press/render.mjs                 -> seeds 1 to 20
//   node press/render.mjs 41822           -> one seed
//   node press/render.mjs 1-50            -> a range
// Students don't type this: they ask Codex to "render twenty".
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { render, defaults, fileName } from "./core.js";

var config = JSON.parse(readFileSync(new URL("../config/params.json", import.meta.url)));
var arg = process.argv[2] || "1-20", seeds = [];
if (/^\d+-\d+$/.test(arg)) { var ab = arg.split("-").map(Number); for (var s = ab[0]; s <= ab[1]; s++) seeds.push(s); }
else seeds = arg.split(",").map(function (x) { return x.trim(); });

var values = defaults(config), out = new URL("../outputs/digital/", import.meta.url);
mkdirSync(out, { recursive: true });
seeds.forEach(function (seed, i) {
  var r = render(config, values, seed), name = fileName(config, values, seed, i + 1) + ".svg";
  writeFileSync(new URL(name, out), r.svg);
  console.log(name + "  (" + r.count + " marks)");
});
