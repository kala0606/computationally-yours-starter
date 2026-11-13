# Working on this project

## Who this is for

This is a student project in a generative art studio. The student writes as an
authored identity, [identity name], who [one line: position and condition].
Read identity.md and manifesto.md before suggesting anything creative.

## Authorship rules

- Propose; don't decide. Explain options and wait for the student to choose.
- Never write or rewrite manifesto.md, final-statement.md, log.md or the
  "I rejected, and why" lines in authorship.md. You may question them.
- Ask for a plan to be agreed before writing code. Then work one step at a time.
- Explain every change in plain language, as if to an artist new to code.
- Don't use AI image generation in the system.
- If you're unsure a library, dataset or reference exists, say so.

## How the code is built

- Language: JavaScript, in the press (see above). No build step.
- Outputs are saved to outputs/digital/ as NNN_seed-SEED_[key params].svg (the press names downloads the same way).
- Keep the code small enough for the student to read and explain.

## The press: how this project is built

This project is a "press": a web page (index.html) where the student and
visitors set parameters, choose a seed, preview and download. It is
published as the project's GitHub Pages site.

- The student's rules live ONLY in src/system.js, in
  `export function draw(pen, p, chance, page)`. Draw with the pen
  (millimetres): pen.line, pen.polyline, pen.circle, pen.rect, pen.path,
  pen.stroke(colour), pen.weight(mm), pen.layer(name).
- Every dial lives in config/params.json under "params", each with key,
  label, type (range, number, toggle, select, color, text), its range, a
  default "value" and the identity's "reason". The press builds its
  controls from this file. Keep "identity", "title" and "paper" up to date.
- All randomness comes from `chance` (chance.random, range, int, pick,
  gauss, noise). Never use Math.random() in src/: seeds must reproduce.
- Don't edit press/ unless the student asks to change how the press looks
  or works. Restyling press/press.css for the identity is welcome when asked.
- Plotter output is the SVG download (strokes only, one layer per pen).
  Archival output is the PNG download at 300 PPI. For resin, add an STL
  export only when the student's pathway needs it, and explain it.

When the student says:

- "preview": start a local web server in the project folder (for example
  `python3 -m http.server 8000`) and give them the link to open.
- "render twenty" (or another number): run `node press/render.mjs 1-20`,
  which writes SVGs named by seed into outputs/digital/, then tell them
  what was written.
- "make a dial for …": add a parameter to config/params.json with a sensible
  range, and use it in src/system.js. Ask the student for the reason.
- "publish": push, then make sure GitHub Pages is on for the main branch,
  root folder, and give them the site link: https://USERNAME.github.io/REPO/
  (it updates about a minute after each push).

## Git and GitHub: you do all of it

The student never types git or gh commands. You run them. Respond to these
plain words (and anything that clearly means the same):

- "push" / "save" / "upload": stage everything, commit with a short message
  that says what changed (log entries: "log: day NN"), push to origin, then
  reply in one or two lines: what was saved, the repository link and the
  press site link.
- "checkpoint": commit without pushing, before a risky change. Start the
  message with "checkpoint:".
- "go back" / "undo": say in plain language what has changed since the last
  commit. Only on the student's yes, restore the last commit.
- "status": say in plain words what has changed and whether everything is pushed.
- "is it online?": check the repository and the press site on GitHub Pages,
  and say what a visitor sees.

Rules:

- Never force-push, rewrite or delete history, or change branches unasked.
- Never commit .env files, keys, passwords or personal data.
- Before committing any file over 50 MB, stop and suggest adding it to
  .gitignore and keeping it on the studio drive.
- If a push is rejected, pull and merge. If there is a conflict, stop and
  explain it in plain words before touching anything.
- Show the student what you ran in one short line, but never ask them to
  type a git command.
- Near the end of a studio day (around 3:30), if there are unpushed
  changes, remind the student to say "push".

## Don't touch

- data/ (raw data is read, never modified)
- outputs/ (never delete outputs)
- docs/photos/

## Run

Preview: a local web server in this folder, then open index.html.
Batch: node press/render.mjs 1-20
