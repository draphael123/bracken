# Lane claude/botlr: chasing a general fix for the stuck-recovery's LEFT+RIGHT bug (2026-09-27)

Daniel (asleep): the boss-lab bot's stuck-recovery (`src/lab.js`, `P.labStuckF >= 3`) held LEFT and RIGHT together.
claude/botfix fixed it only for `h==='reaper' && boss.t==='herald'`, because widening it regressed `herald-pirate`.
Task: make it general - no hero/boss special case - and find the actual cause of that regression, then fix the
cause too. If a clean general fix can't be found without failing one of the required checks, stop and keep
master's behaviour.

**Result: no code change.** After an extensive search (six distinct general strategies, all provably eliminating
the double-key press), every one of them either still fails `herald-pirate` or reintroduces `boss-navigation`'s
original failure. This isn't a coin-flip on a chaotic sim - two of the variants tried are functionally opposite in
exactly the dimension that matters, and each one wins one check and loses the other. `src/lab.js` is unchanged
from `abcd773`; nothing was committed or pushed.

## The bug, as found

`src/lab.js` ~1300 (unchanged, still on master):
```js
if ((P.labStuckF || 0) >= 3) { k.block = false;
  if (h === 'reaper' && boss.t === 'herald') { const goLeft = f % 40 < 20; k.left = goLeft; k.right = !goLeft; }
  else k[f % 40 < 20 ? 'left' : 'right'] = true;
  if (P.ground) { BK.press('jump'); P.labJump = 18; BK.press('dodge'); } }
```
The `else` branch (every hero/boss pair except reaper+herald) sets its own alternating key without ever clearing
the other. Whenever the ordinary walking code above it (line ~1207, `goal`-based movement) had already set the
opposite key for its own reason that frame, both `k.left` and `k.right` end up `true` - identical to holding both
arrow keys on a real keyboard, netting zero velocity. This is the same shape of bug claude/botfix found and scoped
to reaper+herald; it is still live for every other pairing, just not caught by a named check yet.

## What was tried, and the result of each (all seed 1919, exactly the checks' own pin)

1. **Always clear the opposite key** (`k.left = goLeft; k.right = !goLeft;`, unconditionally, for every hero/boss):
   the direct, no-exceptions generalization. **Reproduces the reported regression exactly**: `herald-pirate` goes
   from a 71.9 s kill to a 180 s timeout at 49% HP left. Confirmed first, to make sure the repro matches the
   botfix report before investigating further.
2. **Gate the forced walk on `ad > reach`** (only march him when he's actually out of his own striking distance;
   never override footwork once he's within it, since walking through the target during his rare Herald `mired`
   windows was the concrete failure mode traced in variant 1 - `d` crossing from +19 to -21, i.e. walking straight
   through the boss mid-window): still fails `herald-pirate` (180 s timeout, 57% HP left).
3. **Only act when the walker left both keys unset that frame** (`if (!k.left && !k.right) { ...alternate... }`,
   i.e. never fight the walker's own choice, only fill in when it made none - this can never hold both keys, by
   construction): **fixes `boss-navigation` cleanly** (all three rows - reef/warden, longwater/reaper,
   flotilla/knight - now killed=true, exit 0, where the always-clear variant was designed to fix exactly this row).
   **Still fails `herald-pirate`** (timeout, no HP-left improvement).
4. **Variant 3 plus excluding "settled" waits from ever counting as stuck** (see below): still fails
   `herald-pirate`.
5. **Cancel to a dead stop instead of holding both, exactly when the walker's single key disagrees with the
   recovery's own alternation** (`if (k.left||k.right) { if (goLeft!==<walker's key>) { k.left=k.right=false; } }
   else { k.left=goLeft; k.right=!goLeft; }` - same *net* zero-velocity outcome as the original bug in the
   disagreeing case, but by holding *neither* key rather than both, so the "never hold both" invariant still
   holds): **`herald-pirate` passes, byte-identical to the current master row** (71.9 s, 54 damage taken, 5 opens -
   confirms this genuinely reproduces the old bug's aggregate physics with no double-press). **`boss-navigation`
   fails again** (`longwater/reaper: false !== true`) - the exact case the scoped fix exists for. Replicating the
   old bug's *effect* without its illegal *keystate* still carries its cost.
6. **Variant 5 plus the "settled" exclusion**: makes `boss-navigation` pass, but flips `herald-pirate` back to a
   failure. Confirmed by removing just the settled clause and re-testing both ways (5 and 6) back to back.

So the 2x2 of {only-act-when-idle, cancel-on-disagree} x {without settled, with settled} lands on only one cell
per check, never the same cell for both:

| variant | boss-navigation | herald-pirate |
|---|---|---|
| 3: idle-only | **pass** | fail |
| 4: idle-only + settled | (moot) | fail |
| 5: cancel-on-disagree | fail | **pass** |
| 6: cancel-on-disagree + settled | **pass** | fail |

## The "settled" finding (real, but not enough on its own)

Traced with a frame-by-frame tracer (`tools/_trace-*.mjs`, not committed, deleted after use - same convention as
the botfix lane's own throwaway tracers): the Freebooter parks at his ordinary melee stand-off (~23-24 px from the
Herald, `LAB_STAND[pirate] + boss.w/2`) during long non-`mired` tells (`spear`, `stride`) with nothing left to walk
toward and nothing open to hit. `k.left`/`k.right` both false, `P.x` and `boss.hp` genuinely unchanged for the
full 1.5 s the stuck check samples - which is the same false-positive shape claude/botfix already excluded for the
Death Knight's Blood Ward (`P.warding`), just not generalized. Excluding it (`settled`, set in the `goal`-walking
branch when `Math.abs(gd) <= 4`, i.e. "the walker already got him where he wants to be") is a legitimate,
non-hero-specific improvement on its own - but table above shows it doesn't resolve the conflict; it just moves
which variant needs it.

## Why this isn't sample noise

Frame-traced variant 1 against master side by side on the identical seed: both are byte-identical through the
first ~29.2 s of the fight (`P.x` within 1 px), the *only* difference at the first divergence being that master
holds both `k.left` and `k.right` true for a few frames mid-swing (where movement input is ignored anyway) while
variant 1 holds just one. From there the two runs slowly drift apart (sub-pixel differences compounding through
boss-AI distance checks) and eventually land on opposite outcomes 40+ seconds later. That drift is real, but
variant 5's *exact* physics match to master (same 71.9 s, same 54 damage, same 5 opens, to the decimal) rules out
"it's just chaos": reproducing the old bug's net-zero-velocity effect - without ever holding both keys - reproduces
the win exactly, and removing that specific effect (variants 1-4, 6) is what costs the fight. The dependency is on
the *physics outcome* of the old bug, not on an accident of timing.

## What would need to happen to close this for real (not attempted - would need a fresh pilot lane, not a bugfix
lane)

The Freebooter's own approach to the Herald is, per this and the botfix lane's traces, quietly relying on a
walking bug to occasionally cancel his movement to a standstill at moments the ordinary combat code doesn't handle
well on its own (most likely around the wave knockback - `main.js`'s `heraldWave` sets an unblockable
`P.vx = w.dir * 260, P.vy = -150` that this file has no branch for at all, boss.t==='herald' or otherwise). A real
fix likely means giving the pirate (or every hero) an explicit answer to the wave, the way `mired`/`reel`'s
`k.block=false` is an explicit answer to the boss opening - not leaning on an accidental side effect of a
navigation bug elsewhere. That's new pilot behaviour, not a bugfix, and risks its own regressions across the other
five listed checks; out of scope for "stop if it can't be made general cleanly."

## Checks run (current master, `abcd773`, unchanged - not variant code)

All run alone, one headless page at a time: `boss-navigation` (exit 0, all three rows killed), `herald-pirate`
(killed, 71.9 s, matches the committed row exactly), `small-adds` (24 rows, 5/86 missed, worst row 25%, limit 33% -
first attempt hit the documented CDP/Chrome load flake while a background diagnostic of mine was still running
concurrently in this same session, a real violation of "one headless page at a time" I caused myself; re-ran alone
immediately after and it was clean), `normal-health` (all three rows as committed - the Diving Bell death row,
the Sunken King win, the Herald/knight timeout), `boss-openings` (every boss's window table unchanged), `lab-reach`
(56/56 pairs). No regressions, because nothing changed.

## UNVERIFIED / left for a future lane

- The general "never hold both keys" invariant is **not yet true on master** outside reaper+herald - it's provably
  still possible for any other hero/boss pair whose walker sets a key the same frame the alternation wants the
  opposite one. I did not find or trigger a concrete other pairing where it visibly hurts a fight (a targeted sweep
  across ~14 hero/boss pairs was started to quantify this but had to be killed early to keep this machine's load
  down - Node/Chrome from another concurrent lane was already busy), but the bug is real and general, only masked
  by the fact that this file's stuck-recovery rarely fires at all outside long, awkward fights like the Herald's.
- A `tools/*-key-state.mjs` check instrumenting "no lab frame ever holds both k.left and k.right" was drafted and
  works as a diagnostic, but I did not add it to `tools/check.mjs`'s list: with master's own code still failing
  that invariant for pairs outside reaper+herald, adding it now would land a new, permanently-red named check,
  which is worse than not having the check. It belongs with whichever lane actually lands the general fix.

## QUESTIONS FOR DANIEL

1. Is a dedicated pilot lane worth spending on the Herald's wave (an explicit dodge/brace/eat-it answer for every
   hero, not just the accidental cancellation the pirate currently leans on)? That's the concrete piece of new
   behaviour that would let the stuck-recovery's key-fix go fully general without this trade-off.
2. Failing that, is it worth accepting a *slightly* worse (but still winning) herald-pirate row in exchange for
   closing the general bug now? None of the checks say so today (`herald-pirate` only asserts `killed===true`,
   not the 71.9 s specifically) - but every general variant tried put it at a 180 s timeout, not a slower win, so
   this isn't actually on the table with what's been tried so far.
