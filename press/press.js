// The press: controls built from config/params.json, a live preview,
// seeds, a contact sheet, and downloads. You shouldn't need to edit this
// file; your rules live in src/system.js and your dials in config/params.json.
import { render, defaults, fileName } from "./core.js";

var $ = function (id) { return document.getElementById(id); };
var config, values, seed, sheetStart = 1, timer;

function readHash() {
  var h = new URLSearchParams(location.hash.slice(1)), v = {};
  h.forEach(function (val, key) { v[key] = val; });
  return v;
}
function coerce(p, raw) {
  if (p.type === "toggle") return raw === true || raw === "true" || raw === "1";
  if (p.type === "range" || p.type === "number") { var n = parseFloat(raw); return isNaN(n) ? p.value : n; }
  return raw;
}
function writeHash() {
  var h = new URLSearchParams();
  h.set("seed", seed);
  config.params.forEach(function (p) { if (String(values[p.key]) !== String(p.value)) h.set(p.key, values[p.key]); });
  history.replaceState(null, "", "#" + h.toString());
}

// ---------- controls ----------
function control(p) {
  var wrap = document.createElement("div"); wrap.className = "param";
  var id = "p-" + p.key, v = values[p.key], html = "";
  var lab = '<label for="' + id + '"><span>' + (p.label || p.key) + "</span>";
  if (p.type === "range") {
    html = lab + "</label><div class=\"row\"><input type=\"range\" id=\"" + id + "\" min=\"" + p.min + "\" max=\"" + p.max + "\" step=\"" + (p.step || 1) + "\" value=\"" + v + "\"><input type=\"number\" aria-label=\"" + (p.label || p.key) + " value\" min=\"" + p.min + "\" max=\"" + p.max + "\" step=\"" + (p.step || 1) + "\" value=\"" + v + "\"></div>";
  } else if (p.type === "number") {
    html = lab + "</label><div class=\"row\"><input type=\"number\" id=\"" + id + "\" value=\"" + v + "\"" + (p.min != null ? ' min="' + p.min + '"' : "") + (p.max != null ? ' max="' + p.max + '"' : "") + ' step="' + (p.step || 1) + '"></div>';
  } else if (p.type === "toggle") {
    html = lab + '<input type="checkbox" id="' + id + '"' + (v ? " checked" : "") + "></label>";
  } else if (p.type === "select") {
    html = lab + '</label><div class="row"><select id="' + id + '">' + (p.options || []).map(function (o) { return "<option" + (o === v ? " selected" : "") + ">" + o + "</option>"; }).join("") + "</select></div>";
  } else if (p.type === "color") {
    html = lab + '<input type="color" id="' + id + '" value="' + v + '"></label>';
  } else {
    html = lab + '</label><div class="row"><input type="text" id="' + id + '" value="' + String(v).replace(/"/g, "&quot;") + '"></div>';
  }
  if (p.reason) html += '<p class="reason">' + p.reason + "</p>";
  wrap.innerHTML = html;
  var inputs = wrap.querySelectorAll("input, select");
  inputs.forEach(function (inp) {
    inp.addEventListener("input", function () {
      var raw = inp.type === "checkbox" ? inp.checked : inp.value;
      values[p.key] = coerce(p, raw);
      inputs.forEach(function (o) { if (o !== inp && o.type !== "checkbox") o.value = values[p.key]; });
      schedule();
    });
  });
  return wrap;
}
function buildControls() {
  var box = $("params"); box.innerHTML = "";
  config.params.forEach(function (p) { box.appendChild(control(p)); });
}

// ---------- render ----------
function schedule() { clearTimeout(timer); timer = setTimeout(draw, 30); }
function draw() {
  var t0 = performance.now(), r;
  try { r = render(config, values, seed); }
  catch (e) { $("stage").innerHTML = '<p class="status">The system stopped with an error: ' + e.message + "</p>"; console.error(e); return; }
  $("stage").innerHTML = r.svg;
  var ms = Math.round(performance.now() - t0);
  $("status").textContent = "seed " + seed + " · " + r.count + " marks · " + r.page.width + " × " + r.page.height + " mm · " + ms + " ms";
  $("seed").value = seed;
  writeHash();
}
function setSeed(s) { seed = String(s); draw(); if (!$("tab-sheet").hidden) sheet(); }

// ---------- downloads ----------
function save(blob, name) {
  var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
}
function downloadSVG() {
  var r = render(config, values, seed);
  save(new Blob([r.plotSVG], { type: "image/svg+xml" }), fileName(config, values, seed, 1) + ".svg");
}
function downloadPNG() {
  var r = render(config, values, seed), ppi = +$("ppi").value;
  var w = Math.round(r.page.width / 25.4 * ppi), h = Math.round(r.page.height / 25.4 * ppi);
  if (w * h > 60e6 && !confirm("That's " + Math.round(w * h / 1e6) + " megapixels and may take a while. Continue?")) return;
  var btn = $("dl-png"), old = btn.textContent; btn.textContent = "Rendering…";
  var img = new Image(), url = URL.createObjectURL(new Blob([r.svg], { type: "image/svg+xml" }));
  img.onload = function () {
    var c = document.createElement("canvas"); c.width = w; c.height = h;
    var cx = c.getContext("2d"); cx.drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
    c.toBlob(function (b) { btn.textContent = old; if (b) save(b, fileName(config, values, seed, 1) + "_" + ppi + "ppi.png"); else alert("This browser couldn't make an image that large. Try a lower resolution."); }, "image/png");
  };
  img.onerror = function () { btn.textContent = old; alert("Couldn't render the PNG."); };
  img.src = url;
}

// ---------- sheet ----------
function sheet() {
  var grid = $("grid"); grid.innerHTML = "";
  for (var i = 0; i < 20; i++) {
    (function (s) {
      var b = document.createElement("button"); b.type = "button";
      try { b.innerHTML = render(config, values, s).svg + "<small>seed " + s + "</small>"; } catch (e) { b.textContent = "seed " + s + ": error"; }
      b.addEventListener("click", function () { tab("press"); setSeed(s); });
      grid.appendChild(b);
    })(sheetStart + i);
  }
}

// ---------- about ----------
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function md(text) {
  var out = [], list = false;
  esc(text).split(/\n/).forEach(function (line) {
    var l = line.trim();
    var inline = function (s) { return s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, "<i>$1</i>").replace(/`(.+?)`/g, "<code>$1</code>").replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>'); };
    if (/^- /.test(l)) { if (!list) { out.push("<ul>"); list = true; } out.push("<li>" + inline(l.slice(2)) + "</li>"); return; }
    if (list) { out.push("</ul>"); list = false; }
    if (/^#{1,6} /.test(l)) return; // headings in the file are replaced by the page's own
    if (/^<!--/.test(l) || !l) { out.push(""); return; }
    out.push("<p>" + inline(l) + "</p>");
  });
  if (list) out.push("</ul>");
  return out.join("\n").replace(/<\/p>\n<p>/g, "</p><p>");
}
function repoURL() {
  if (config.repository) return config.repository;
  var host = location.hostname, path = location.pathname.split("/").filter(Boolean);
  if (/\.github\.io$/.test(host)) return "https://github.com/" + host.split(".")[0] + "/" + (path[0] || host);
  return null;
}
function about() {
  var a = $("about");
  var rows = config.params.map(function (p) { return "<tr><td><code>" + esc(p.key) + "</code></td><td>" + esc(p.label || "") + "</td><td>" + (p.type === "range" ? esc(p.min + "–" + p.max) : esc(p.type)) + "</td><td>" + esc(p.reason || "") + "</td></tr>"; }).join("");
  a.innerHTML = "<h1>" + esc(config.identity || "") + "</h1><p>" + esc(config.title || "") + "</p><h2>Manifesto</h2><div class=\"manifesto\" id=\"manifesto\">…</div><h2>The dials</h2><table><thead><tr><th>Key</th><th>Dial</th><th>Range</th><th>The identity's reason</th></tr></thead><tbody>" + rows + "</tbody></table><h2>How it's made</h2><div id=\"process\">…</div>";
  fetch("manifesto.md", { cache: "no-store" }).then(function (r) { return r.ok ? r.text() : ""; }).then(function (t) { $("manifesto").innerHTML = md(t) || "<p>Not written yet.</p>"; });
  fetch("process.md", { cache: "no-store" }).then(function (r) { return r.ok ? r.text() : ""; }).then(function (t) { $("process").innerHTML = md(t) || "<p>Not written yet.</p>"; });
}

// ---------- tabs ----------
function tab(name) {
  document.querySelectorAll(".tabs button").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.tab === name ? "true" : "false"); });
  ["press", "sheet", "about"].forEach(function (t) { $("tab-" + t).hidden = t !== name; });
  if (name === "sheet") sheet();
  if (name === "about") about();
}

// ---------- start ----------
fetch("config/params.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (c) {
  config = c; config.params = config.params || [];
  values = defaults(config);
  var h = readHash();
  config.params.forEach(function (p) { if (h[p.key] != null) values[p.key] = coerce(p, h[p.key]); });
  seed = String(h.seed || config.seed || 1);
  $("identity").textContent = config.identity || "Untitled identity";
  $("title").textContent = (config.title || "") + (config.paper && config.paper.name ? " · " + config.paper.name : "");
  document.title = (config.identity || "Press") + " · " + (config.title || "Computationally Yours");
  var repo = repoURL(); if (repo) $("repo-link").href = repo; else $("repo-link").remove();
  buildControls(); draw();

  $("seed").addEventListener("change", function () { setSeed($("seed").value.trim() || "1"); });
  $("seed-prev").addEventListener("click", function () { var n = parseInt(seed, 10); setSeed(isNaN(n) ? 1 : Math.max(1, n - 1)); });
  $("seed-next").addEventListener("click", function () { var n = parseInt(seed, 10); setSeed(isNaN(n) ? 1 : n + 1); });
  $("seed-rand").addEventListener("click", function () { setSeed(1 + Math.floor(Math.random() * 99999)); });
  $("reset").addEventListener("click", function () { values = defaults(config); buildControls(); draw(); });
  $("dl-svg").addEventListener("click", downloadSVG);
  $("dl-png").addEventListener("click", downloadPNG);
  $("copy-link").addEventListener("click", function () {
    var b = this; navigator.clipboard && navigator.clipboard.writeText(location.href).then(function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy link"; }, 1500); });
  });
  $("sheet-prev").addEventListener("click", function () { sheetStart = Math.max(1, sheetStart - 20); sheet(); });
  $("sheet-next").addEventListener("click", function () { sheetStart += 20; sheet(); });
  document.querySelectorAll(".tabs button").forEach(function (b) { b.addEventListener("click", function () { tab(b.dataset.tab); }); });
  document.addEventListener("keydown", function (e) {
    if (e.target.matches("input, select, textarea")) return;
    if (e.key === "ArrowRight") $("seed-next").click();
    if (e.key === "ArrowLeft") $("seed-prev").click();
  });
}).catch(function (e) {
  $("stage").innerHTML = '<p class="status">Couldn\'t load config/params.json: ' + e.message + ". If you opened index.html as a file, ask Codex to \"preview the press\" instead.</p>";
});
