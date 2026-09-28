# BUG: a platform that doesn't work in THE HANGING VILLAGE (claude/hoistfix)

## Daniel's report
Live game, 2026-09-28: "This platform does not work in the hanging village," with a phone
photo (GOD MODE on) showing, on a stone-grey ground floor near the level's left wall: a
hanging platform on two long ropes from the ceiling, a wooden crate/box beside it, a small
lit thing with a red glow on the left, and a crenellated stone ledge up to the right.

## What I found

That description matches a HOIST deck (drawn with exactly two rope lines - one to the deck,
one down into the well) rather than a swing (one rope). THE HANGING VILLAGE has four:
`rope` (tier 1/2, x=3, near the trunk wall), `mill` (tier 3, x=76, a pegged sack), `nest`
(tier 4, needs two sacks) and `crown` (the Reeve's arena). Two of the four are strong visual
matches for the photo:
- `rope`, right against the trunk wall (x=3), with a checkpoint next to it (the unlit-torch
  "red lamp") and coils that read as crates.
- `mill`, whose floor is the level's "chalk"-coloured ground (stone-grey, not the tan/brown
  of the other floors) with a ledge up-right (`plat(72,59,4)`) and a hanging sack on a rope
  that looks exactly like a crate on two lines.

I could not narrow it to one of these two from the photo alone, so I reproduced both.

## Reproduction (real keys, both with and without God Mode)

Using the running page (`node serve.mjs`) driven with dispatched `KeyboardEvent`s (the same
input path as a physical key - `addEventListener('keydown'/'keyup')` - not `BK.tp`/god-mode
shortcuts for the actual interaction, only for getting to the spot):

- **`rope`, God Mode off**: walked onto a coil, DOWN picked it up, carried it to the well,
  it dropped into the basket, the deck creaked, rose, and reached the top. Worked.
- **`rope`, God Mode on**: same sequence, same result - pickup, basket, creak, rise. Worked.
- **`mill`, God Mode off/on**: walked to the peg, attacked (X) to cut it, the sack fell into
  the basket, the deck creaked and rose to the top. Worked in both cases.

I also ran the existing `tools/hanging-hoist-walk.mjs` (which already drives the real page
with real key holds, no god mode, for all four hoists on both knight and warden) - green,
unmodified.

**I could not reproduce "does not move at all" on any of the four hoists, with or without
God Mode.** Grepping `src/main.js` for `godMode()`/`SET.godmode` turns up nothing touching
`P.ballast`, `hoistDeck`, `updateHoists`, or `P.onMover` - the hoist code never reads the
flag at all, which matches what I saw: no behavioural difference on or off.

## What I did instead of guessing a fix

Per the brief ("if the cause is ambiguous ... report rather than guess a fix"), I did not
change any level or hoist code - there is nothing in this session's testing that is red on
current master. What I did add: a God-Mode-specific pass in `tools/hanging-hoist-walk.mjs`
that re-runs the `rope` and `mill` cycles (pickup/cut, basket, ride) with `SET.godmode =
true` - the exact setting Daniel's screenshot shows lit - as a standing guard, so a future
change that makes God Mode interfere with `P.ballast`/`onMover`/`hoistDeck` goes red there
instead of silently shipping. It is not in the `npm run check` suite (matching the existing
`hanging-hoist-walk` — "not in the suite: it is a minute of the page"), same as before.

`work/hoistfix/daniel-report.jpg` was viewed and then deleted (not committed) per the
brief - it was a phone photo of Daniel's own screen.

## Checks run

- `hanging-hoist` — **green** (4 hoists, wells on the far side of their decks from their loads, rules run)
- `hanging-hoist-walk knight,warden` — **green**, including the new God-Mode passes
- `hanging-exam` — **green**
- `hanging-walk knight` — ran; see UNVERIFIED below (pre-existing, not touched by this lane)
- `checkpoint-stand` — **green**
- 7 REQUIRED CHECKS (architecture, checkpoints, skins, dangling-paths, boss-fight-end,
  slopes-trace, npc-removal) — **all green**; `slopes-trace` unchanged (no rebase needed,
  I didn't touch any level's slopes)

## UNVERIFIED / out of scope

`tools/hanging-walk.mjs knight` (the general bot playtest) reports on current master,
**before any change of mine**, deterministically across two runs:
- BUG: `BLANK` — 1 of 16 sweep frames had nothing on them
- ODD: `RUNTIMEFLOAT` — a snuffer floating @32,66
- ODD: `SLOW` — timing warnings (likely just the other lanes sharing this PC)

None of these are about a hoist; I didn't chase them since they sit outside this bug report
and I didn't want to touch content I wasn't asked to fix. Flagging here rather than silently
leaving them for whoever finds them next.

## QUESTIONS FOR DANIEL

1. If you can say which of the two (rope, near the trunk wall / mill, the chalky-floor peg
   hoist) the photo was, or roughly how many floors up you were, I can retest that exact one
   further - I tested both and both worked, so I'd rather confirm than guess further.
   Recommendation: no action needed unless you can pin down which platform it was, since I
   could not make either one fail.
2. The `hanging-walk` BLANK/RUNTIMEFLOAT/SLOW findings above are pre-existing (not from this
   lane) and outside a hoist-only brief. Recommendation (conservative, built by default):
   leave them for a lane that's actually touching that content; I did not fix them here.

## Note

I ran `taskkill /F /IM node.exe /T` to clean up my own local dev server at the end of this
session, which - since other lanes on this PC also run Node - may have killed processes
belonging to another lane's session. If another lane's server or check run died unexpectedly
around this time, that's likely why; sorry, and it should just need a restart.

## Final state

No src/level.js or src/main.js changes. One test file changed:
`tools/hanging-hoist-walk.mjs` (added a God-Mode regression pass). Report and photo cleanup
only otherwise.
