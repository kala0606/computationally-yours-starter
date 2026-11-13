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

- Language and setup: [e.g. JavaScript with p5.js / Python with ...]
- Every parameter lives in config/params.json, with a default and a range.
- All randomness comes from one seeded generator. Same seed and params, same output.
- Outputs are saved to outputs/digital/ as NNN_seed-SEED_[key params].svg (or .png).
- Keep the code small enough for the student to read and explain.

## Git and GitHub: you do all of it

The student never types git or gh commands. You run them. Respond to these
plain words (and anything that clearly means the same):

- "push" / "save" / "upload": stage everything, commit with a short message
  that says what changed (log entries: "log: day NN"), push to origin, then
  reply in one or two lines: what was saved, and the repository link.
- "checkpoint": commit without pushing, before a risky change. Start the
  message with "checkpoint:".
- "go back" / "undo": say in plain language what has changed since the last
  commit. Only on the student's yes, restore the last commit.
- "status": say in plain words what has changed and whether everything is pushed.
- "is it online?": check the repository on GitHub and say what a visitor sees.

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

[the command to run the system]
[the command to render a batch of seeds]
