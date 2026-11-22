// Computationally Yours · the pen
// A tiny drawing API in millimetres that produces SVG. It runs in the
// browser (the press) and in Node (press/render.mjs), so the same seed
// always gives the same drawing, on screen, in a download, or on a plotter.

// ---------- chance ----------
function hashSeed(seed) {
  var s = String(seed), h = 1779033703 ^ s.length;
  for (var i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return h >>> 0;
}

// rng(seed) -> a random-number generator. Every random choice in your system
// must come from this, never from Math.random(), or seeds stop working.
export function rng(seed) {
  var a = hashSeed(seed);
  function next() {
    a = (a + 0x6d2b79f5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return {
    random: next,                                            // 0 <= x < 1
    range: function (lo, hi) { return lo + (hi - lo) * next(); },
    int: function (lo, hi) { return Math.floor(lo + (hi - lo + 1) * next()); },
    pick: function (list) { return list[Math.floor(next() * list.length)]; },
    chance: function (p) { return next() < p; },
    gauss: function (mean, sd) {                             // bell curve
      var u = 1 - next(), v = next();
      return (mean || 0) + (sd || 1) * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
  };
}

// noise2D(seed) -> f(x, y) in 0..1, smooth: neighbouring points get similar values.
export function noise2D(seed) {
  var r = rng("noise:" + seed), N = 256, g = [];
  for (var i = 0; i < N * N; i++) g.push(r.random());
  function v(x, y) { return g[((y % N + N) % N) * N + ((x % N + N) % N)]; }
  function s(t) { return t * t * (3 - 2 * t); }
  return function (x, y) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = s(x - xi), yf = s(y - yi);
    var a = v(xi, yi), b = v(xi + 1, yi), c = v(xi, yi + 1), d = v(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
}

// ---------- drawing ----------
function n(x) { return Math.round(x * 1000) / 1000; }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

// createPen(width, height) in mm. Draw with it, then call toSVG().
export function createPen(width, height) {
  var items = [], state = { stroke: "#111110", weight: 0.35, fill: "none", layer: "ink" };
  function attrs() {
    return 'stroke="' + esc(state.stroke) + '" stroke-width="' + n(state.weight) + '" fill="' + esc(state.fill) + '"';
  }
  function add(svg) { items.push({ layer: state.layer, svg: svg }); }
  return {
    width: width, height: height,
    stroke: function (c) { state.stroke = c; return this; },     // line colour
    weight: function (mm) { state.weight = mm; return this; },   // line width in mm (pen size)
    fill: function (c) { state.fill = c || "none"; return this; },// plotters ignore fills
    layer: function (name) { state.layer = name; return this; }, // one layer per pen
    line: function (x1, y1, x2, y2) { add('<line x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(x2) + '" y2="' + n(y2) + '" ' + attrs() + "/>"); return this; },
    polyline: function (pts, closed) {
      if (!pts || pts.length < 2) return this;
      var d = pts.map(function (p) { return n(p[0]) + "," + n(p[1]); }).join(" ");
      add("<" + (closed ? "polygon" : "polyline") + ' points="' + d + '" ' + attrs() + "/>"); return this;
    },
    circle: function (x, y, r) { add('<circle cx="' + n(x) + '" cy="' + n(y) + '" r="' + n(r) + '" ' + attrs() + "/>"); return this; },
    rect: function (x, y, w, h) { add('<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" ' + attrs() + "/>"); return this; },
    path: function (d) { add('<path d="' + esc(d) + '" ' + attrs() + "/>"); return this; },
    count: function () { return items.length; },
    toSVG: function (opts) {
      opts = opts || {};
      var layers = [], by = {};
      items.forEach(function (it) { if (!by[it.layer]) { by[it.layer] = []; layers.push(it.layer); } by[it.layer].push(it.svg); });
      var body = layers.map(function (l) { return '<g id="' + esc(l) + '" inkscape:groupmode="layer" inkscape:label="' + esc(l) + '">' + by[l].join("") + "</g>"; }).join("\n");
      var bg = opts.background ? '<rect width="100%" height="100%" fill="' + esc(opts.background) + '"/>' : "";
      var meta = opts.title ? "<title>" + esc(opts.title) + "</title>" : "";
      return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="' + n(width) + 'mm" height="' + n(height) + 'mm" viewBox="0 0 ' + n(width) + " " + n(height) + '" stroke-linecap="round" stroke-linejoin="round">' + meta + bg + "\n" + body + "\n</svg>";
    }
  };
}
