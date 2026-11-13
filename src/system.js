// YOUR SYSTEM · the rules your identity's work obeys.
//
// This is an EXAMPLE to replace. Ask Codex to rewrite it from your
// system.md, one rule at a time. Keep the shape of this file:
//
//   export function draw(pen, p, chance, page) { ... }
//
//   pen    draws in millimetres: pen.line, pen.polyline, pen.circle, pen.rect, pen.path
//   p      your parameters from config/params.json, e.g. p.rows
//   chance seeded randomness: chance.random(), chance.range(a, b), chance.gauss(), chance.noise(x, y)
//   page   { width, height, margin } in millimetres
//
// Rules of the press: every random choice comes from `chance`, never Math.random();
// every value you might want to change lives in config/params.json.

export function draw(pen, p, chance, page) {
  var left = page.margin, right = page.width - page.margin;
  var top = page.margin, bottom = page.height - page.margin;
  var gap = (bottom - top) / p.rows;

  pen.stroke(p.ink).weight(p.pen);

  // Example rule: rows of lines that drift with a smooth field,
  // drawn heavier where the field is low.
  for (var i = 0; i < p.rows; i++) {
    var y0 = top + gap * (i + 0.5), points = [];
    for (var x = left; x <= right; x += 2) {
      var f = chance.noise(x * p.scale / 100, y0 * p.scale / 100);
      points.push([x, y0 + (f - 0.5) * gap * p.drift + chance.gauss(0, p.jitter)]);
    }
    pen.polyline(points);
    if (p.emphasis && chance.noise(left, y0 * p.scale / 100) < 0.35) pen.polyline(points); // a second pass: heavier
  }
}
