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

## Don't touch

- data/ (raw data is read, never modified)
- outputs/ (never delete outputs)
- docs/photos/

## Run

[the command to run the system]
[the command to render a batch of seeds]
