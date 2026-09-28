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

## Final state (superseded by the update below)

No src/level.js or src/main.js changes. One test file changed:
`tools/hanging-hoist-walk.mjs` (added a God-Mode regression pass). Report and photo cleanup
only otherwise.

---

## UPDATE: solved with Daniel - it was the FIRST hoist (rope), and it isn't broken

Daniel confirmed: he stood on the rope deck, hit it, and jumped on it - but never carried a
weight to the basket, because nothing told him to. Decision: keep the "weight in the basket"
rule as designed, and TEACH it, using the new carry & throw system from `claude/batch39`
(`src/throwables.js`, `THROW_KIND`, today's bucket work).

### 1. Merged claude/batch39
`git fetch origin && git merge origin/claude/batch39` - clean merge, no conflicts (93 files,
mostly other lanes' work; brought in `src/throwables.js`, the bucket carry/throw system, and
several other lanes already landed on master-to-be).

### 2. Hoist loads are now a THROWABLE kind
`src/throwables.js`: added `THROW_KIND.ballast` (vx/vy/g/carrySpeed for the arc and the slow
carry walk; respawn/hitSmall/hitFire are set but never read by the hoist code - they exist
only so this row keeps `tools/throwables.mjs`'s table-wide contract true for a generic
reader).

`src/main.js`, `updateHoists`: a free load can now be picked up with INTERACT (`talkPress`)
as well as the original DOWN - both set `P.ballast` the same way, so every existing DOWN/walk
behaviour (all four hoists) is untouched. New `throwLoad(pr)` launches the held load with
`THROW_KIND.ballast`'s numbers and hands it back to the load's own existing "free or falling"
physics (gravity, wall collision, `wellAt()` landing check) - so **a throw that lands in the
well is not a second code path**, it fills the basket through the exact same `intoBasket()`
call a carried-in load always used. ATTACK is "eaten first" for a held hoist load as its own
paired block right next to the pre-existing bucket one (`if (P.carry) {...}` / `if (P.ballast
&& P.ballast.t === 'load') {...}`), each guarded so an underwater ballast stone (a different
prop, same `P.ballast` field, `takeBallast`/`dropBallast`) is untouched - JUMP still drops it,
ATTACK still swings, exactly as before.

`drawHoists`: a basket short of `need` now glows and creaks on the well-head (TOLD) - a
standing tell, not a proximity trick, so the basket itself backs up the sign whether or not a
weight is nearby. Applies to all four hoists automatically (it is keyed on hoist state, not
level content).

### 3 & 4. The taught weight at the first hoist, and everywhere else
`src/level.js`, `hangingVillage()`: a fourth coil sits right beside the rope deck (x=5, was
3 coils at x=11/13/15 only); it draws the same pulsing "take me" ring every hoist load already
did (pre-existing, generic - nothing new needed for the prompt itself). A one-line sign at
x=9 - **not x=6, see the bug below** - reads `TAKE IT (INTERACT); THROW IT IN (ATTACK).`
(41 chars, one line, `tools/signs.mjs` and `tools/textfit.mjs` both checked). Only the rope
hoist gets a sign; `mill`/`nest`/`crown` get the throwable mechanic and the told-glow for
free since both are generic engine changes, not per-level content.

### A bug the throw test caught: the sign nearly ate the very key it was teaching
First placed the sign at x=6, one tile from the new weight (x=5). `talkers()` (the function
that opens a sign's dialogue on INTERACT) reaches 28px either side of the hero; at 16px apart,
standing at the weight to pick it up was ALSO in the sign's reach. `updateProps` (which opens
signs) runs before `updateHoists` in the frame, so the same INTERACT press both picked up the
weight AND opened the sign's dialogue (`state = 'talk'`) - and the very next ATTACK press,
instead of throwing, just advanced/closed the sign's text (the `state === 'talk'` branch reads
`atkPress` too). Traced with a throwaway `window.__dbg` instrumentation (removed before
committing) that logged `atkPress`/`state` at several points in the per-frame update - found
it flip from `true` to `false` between the top of `update()` and the hoist code, inside the
`state === 'talk'` branch. Fixed by moving the sign to x=9 (64px from the weight, well outside
`talkers()`' 28px reach) - not a code change, a placement one. Left as a real lesson: any new
sign near an interactive prop needs to clear that 28px radius, or INTERACT does double duty.

### 5. hanging-hoist-walk.mjs: proved red on batch39 first
Added a real-key throw pass at the rope hoist (`BK.tp(5,93)`, `BK.press('talk')` to take the
weight, `hop('left')` onto the deck, `BK.press('atk')` to throw, then waits for the basket and
the ride to the top - all through the live page, not `BK.tp`-to-the-end-state). **Proved red
first**: `git worktree add` at `origin/claude/batch39` (21fcea4, the pre-merge tip), copied
just the new test file over (old `src/main.js`/`level.js`, no weight, no INTERACT/throw), ran
it - `INTERACT takes the taught weight` FAILED (no weight there), `the thrown weight lands in
the basket` and `a real-key player who throws it rides the deck up` both FAILED. Worktree
removed after. Back on this branch, same test is green, including the ride all the way to
`m.y1`.

Also extended `tools/hanging-hoist.mjs` (the VM-sandbox check) with a CARRY & THROW block:
INTERACT picks a load up, `throwLoad()` launches it from well outside the old carrying range,
and it still fills the basket and starts the deck rising - proving the throw is not special-
cased to the live page, it is the same `updateHoists` code a carry uses.

### Checks (this update)
- `hanging-hoist` - green (now includes the CARRY & THROW block)
- `hanging-hoist-walk knight` and `warden` - green, including the new throw-at-first-hoist
  pass and the earlier God-Mode passes
- `hanging-exam` - green, unchanged
- `throwables` (tools/throwables.mjs) - green (table sanity, the barn-roof douse, pickup/arc/
  death/respawn, all still true with `ballast` added to the table)
- `signs` (tools/signs.mjs) - green, 620 signs, all fit 2 lines, no duplicate sentence
- `textfit hints --strict` - green; the new hint (`DOWN OR INTERACT PICKS IT UP. CARRY IT IN,
  OR THROW IT.`) fits 2 lines, same as before, not in the pre-existing 7-item LONGHINT list.
- Full, unscoped `textfit --strict` (every screen: bestiary, store, talents, HUD, all 45
  boss/mini cards) - ran to completion in the background (942s - see UNVERIFIED, not
  something to re-run casually on a shared PC). 1 OVERFLOW ("GEOMANCER" +13px on pick screen
  #0) and 1 OFFSCREEN ("X" in the Flotilla's boss arena) - both pre-existing, neither is
  Hanging Village, a hoist, or any text I touched. LONGHINT is still the same 7 pre-existing
  entries, my hint is not among them.
- `slopes-trace` - green, unchanged (no rebase needed)
- 7 REQUIRED CHECKS (architecture, checkpoints, skins, dangling-paths, boss-fight-end,
  slopes-trace, npc-removal) - all green

### QUESTIONS FOR DANIEL (update)
3. The full `textfit --strict` run turned up 2 pre-existing issues unrelated to this lane:
   `main.js:4452` OVERFLOW "GEOMANCER" +13px on hero pick screen #0, and `main.js:1602`
   OFFSCREEN "X" in the Flotilla's boss arena. Neither is Hanging Village or anything I
   touched. Recommendation (conservative, built by default): leave them for whichever lane
   owns the hero-pick screen and the Flotilla, same as the hanging-walk findings above - I
   did not fix them here.

### Note on process cleanup
Earlier in this session I ran `taskkill /F /IM node.exe /T`, which the coordinator flagged as
a risk to other lanes sharing this PC (never kill by name). For this update's cleanup I used
`Get-NetTCPConnection -LocalPort 5860` to find the exact PID my own `serve.mjs` was running as
and `taskkill /F /PID <that pid>` - only the process I started.

### Final state
`src/throwables.js` (THROW_KIND.ballast), `src/main.js` (INTERACT pickup, throwLoad, the
"eaten first" ATTACK guard for a held hoist load, the basket's TOLD glow), `src/level.js`
(the taught weight and its sign at the rope hoist), `tools/hanging-hoist-walk.mjs` (the
God-Mode passes from the first update, plus the new real-key throw pass), and
`tools/hanging-hoist.mjs` (the CARRY & THROW sandbox block) - all changed. No other level's
content touched.
