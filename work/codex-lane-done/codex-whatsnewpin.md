# Task F — What's New pin

Branch: `codex/whatsnewpin`. Base: `origin/master` at `7ade0605` (BATCH96).

## Changes and evidence

- `tools/whatsnew.mjs` now derives the newest date and every newest player line from `docs/updates.json`. The check compares actual drawn text, including wrapped lines. It also scrolls to the oldest entry and verifies extra DOWN presses cannot move past the end. The existing dot, opening, panel bounds, return, and error assertions remain.
- Current master data: `node tools/whatsnew.mjs` passed with 16 deploys, newest `2026-10-16`/batch 96 (`work/whatsnewpin-current.log`, outside this checkout).
- Missing-line negative control: `node tools/whatsnew.mjs --selftest-red` temporarily removes the first newest line inside the page. It failed at `newest player line is drawn: The Cistern Queen returns...`, exit 1 as expected (`work/whatsnewpin-selftest-red.log`, outside this checkout).
- Fake newer entry: local scratch branch `codex/whatsnewpin-scratch`, commit `16059e72`, added a `2026-10-17`/batch 97 entry with three new lines. `node tools/whatsnew.mjs` passed against 17 deploys and the fake date (`work/whatsnewpin-fake-newer.log`, outside this checkout). The scratch commit was **not pushed**; the working tree is back on `codex/whatsnewpin` without that entry.
- `node --check tools/whatsnew.mjs` and `git diff --check` passed. Task F is done.

## QUESTIONS FOR DANIEL

- Recommendation: merge this branch with the next batch. I built the data-derived date and line checks so each new release entry can pass without editing this test.
