// The press's engine: turns config + parameter values + a seed into SVG.
// Shared by the web press (press.js) and the batch renderer (render.mjs).
import { createPen, rng, noise2D } from "./pen.js";
import { draw } from "../src/system.js";

export function defaults(config) {
  var v = {};
  (config.params || []).forEach(function (p) { v[p.key] = p.value; });
  return v;
}

export function page(config) {
  var pp = config.paper || {};
  return { width: pp.width || 420, height: pp.height || 594, margin: pp.margin == null ? 15 : pp.margin };
}

export function render(config, values, seed) {
  var pg = page(config), pen = createPen(pg.width, pg.height);
  var r = rng(seed), nz = noise2D(seed);
  var chance = Object.assign({}, r, { noise: nz, seed: seed });
  draw(pen, Object.assign({}, values), chance, pg);
  var title = (config.identity ? config.identity + " · " : "") + (config.title || "") + " · seed " + seed;
  return {
    svg: pen.toSVG({ background: config.background, title: title }),
    plotSVG: pen.toSVG({ title: title }), // no background: what the plotter draws
    count: pen.count(),
    page: pg
  };
}

// 007_seed-41822_rows-48_scale-1.6
export function fileName(config, values, seed, index) {
  var keys = (config.params || []).filter(function (p) { return p.type === "range" || p.type === "number"; }).slice(0, 2);
  var parts = [String(index == null ? 1 : index).padStart(3, "0"), "seed-" + seed];
  keys.forEach(function (p) { parts.push(p.key + "-" + values[p.key]); });
  return parts.join("_").replace(/[^a-zA-Z0-9_.-]/g, "");
}
