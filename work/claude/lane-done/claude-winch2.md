# claude/winch2: lane report (2026-09-28)

THE WINCHMASTER, round four: the Ore Road's boss (`src/winchmaster.js`, arena `OR.ARENA` in `src/ore-road.js`). The branch is
`claude/winch2`, based on `claude/oreroad2` (cd70591). Master (cd35d24) is already in it. I didn't touch master or deploy, and I
didn't run the full suite.

## What changed (Daniel's decisions of 2026-09-28)

1. **Chip damage is halved unless his drum is jammed.** `winchTake` now returns `WINCH.chipMul` (0.5) while his drum runs. It
   returns 1 while the drum is jammed and he is being thrown off the housing, and it still returns 2 (`downMul`) while he is
   downed. Burn goes through `wardedDamage` too, so it is halved as well. The rule is told on screen: a halved blow says
   **THE IRON TAKES HALF: JAM HIS DRUM** over him, at most once every `WINCH.chipSay` (6) seconds.
2. **Phase 2 rusts his buckets.** From half health, every third skip on his two lines (`winchRust`: skip i with i % 3 === 1)
   comes out of its station house rusted. It uses the level's own rust rule (`OR.CRACK`): the skip holds you for 0.9 s, then
   gives. A skip only turns to rust inside the return, out of sight, so any rusted skip you can board was already shown
   rusted. That keeps each ride in a gamble you choose, never an untold fall. Rusted skips per loop: low line 2 of 7, high
   line 2 of 5, so a sound skip is always coming. Both lines run over the drum pit: a fall costs a fifth of your health and a
   climb, never your life. Phase 2 also says **HIS SKIPS RUST: THE RED ONES GIVE WAY** 1.6 s after the leap line. A fresh
   attempt clears the rust (in the wake reset).
3. **The arena is brighter, and only the arena.** `OR.ARENA.dark` is 0.18, against 0.34 for the cavern. It is a dark zone
   (`L.darkZones`, an existing engine feature) over the arena's columns only. There is also a lit miner lamp on top of every
   housing (`OR.ARENA.lamps`), at the end away from its drum's mouth.
4. **Zoom:** I didn't edit `src/boss-view.js`. With `SET.zoom='wide'` (a 629x311 view) the camera stays inside the arena lock
   and every housing top and ledge is on screen. The measurements and one catch are under UNVERIFIED.

Files touched: `src/winchmaster.js`, `src/ore-road.js` (the ARENA object, the arena block and the builder's return; nothing in
the level columns), and `tools/ore-road.mjs`. Outside the arena and his module I touched:
- `src/main.js`, 4 spots: the import, the damage line in `wardedDamage` (plus its told line), the return branch of
  `updateBucket`, and `updateWinchBoss`'s wake reset.
- `src/lab.js`: one condition. The bot never boards a rusted skip, reading the told rust the way a player does.

The Winchmaster is still FIRST in POISE_SKIP.

## Pilot (bossLab, normal health, knight / warden / pyro, seed 3100, 1 pass)

| hero | BEFORE (cd70591) | AFTER |
|---|---|---|
| knight | win 58.7 s, took 21 (while he was downed), 3 jams | win 41.3 s, took 0, 2 jams |
| warden | win 230 s, took 82 (stalk 21, pit after stalk 20, letgo 21, pit after letgo 20), 4 jams | win 249.9 s, took 21 (while he was downed), 6 jams |
| pyro | win 179.7 s, took 0, 3 jams | win 145 s, took 36 (pit after a misstep: rust giving way), 3 jams |

Still 3/3 wins. The warden needed 6 jams instead of 4, because halving pushes the fight toward jams. One seed is noisy (the
knight got faster), so this is a smoke test, not a balance band.

## Checks (all run by name)

Green:
- **Levels:** ore-road, ore-exam, ore-work, ore-ride, slopes, dune-worm, floaters, raft-call, shop-gates, one-new-foe
- **Bosses:** boss-openings, boss-fight-end, tells
- **Required checks:** architecture, checkpoints, skins, dangling-paths, npc-removal, slopes-trace

slopes-trace died once under load ("Runtime.enable did not answer") and passed when re-run alone. The trace is identical, so
there was no rebase.

**elites FAILS, and it fails the same way on the base (cd70591), so it is not this lane.** The failure is
`heavy@455,12 stands 1 tile(s) from the checkpoint @454,12`: the drum yard encounter from claude/oreroad2, outside the arena.

New assertions in `tools/ore-road.mjs` (ROUND FOUR): 10 of them fail on cd70591 and pass here. They cover:
- half damage while the drum runs, and that it is told
- whole damage while jammed
- the phase-2 rust rule
- rusting only in the station house (the source is checked: `winchRust` is called exactly once, inside the return branch)
- a sound skip always coming
- the drum pit under both lines, never fatal
- the phase-2 line that is said over him
- the dark zone covering only the arena
- a lamp on every housing

I also ran a scratch page probe (not committed). A 20-point blow on him in stalk did 10 damage. In 25 s of phase 2, 4
drum-line skips rusted, and not one turned to rust while it was on screen.

## UNVERIFIED
- No real-keys playtest of the rust gamble. The bot never boards rust, so "a gamble a player takes" is untested by hand.
- The brightness was checked in one before/after frame capture (on the low line). The housings, lamps and lines read
  clearly better, but that is my eye, not a metric.
- The zoom lane's actual zoom factor for him isn't known yet. I measured with `SET.zoom='wide'`.
- **Zoom catch:** the arena (688 px) is about 59 px wider than the wide view. With the camera at the east end (on the Great
  Drum's ledge or top, the Tail Wheel's ledge or top, or the low line's middle), the Head Frame is just off the left edge. By
  the existing "he begins nothing off screen" rule, he waits there instead of throwing untold attacks.

## QUESTIONS FOR DANIEL
1. **Rust rate:** every third skip (built), or every second, which would make phase 2 much harsher? *Recommend every third.*
   There is always a sound skip coming, and the pyro's pilot fell once to it.
2. **Arena brightness:** 0.18 (built, about half the cavern's dark) or brighter still, 0.10? *Recommend 0.18 until you've seen
   it.* The lamps already light the housings.
3. **Zoomed-out framing:** once he is zoomed, the Head Frame is ~40 px off screen when you are at the east end. Should the zoom
   lane trim his camera lock to the walkable room (cols 476-518), or should it stay as it is? *Recommend: ask claude/bosszoom
   to check it.* This lane was told not to touch the zoom.
4. **The told line for half damage:** "THE IRON TAKES HALF: JAM HIS DRUM" at most every 6 s. Keep it, or show it only the
   first few times? *Recommend keeping it.* It is the one sentence that teaches the fight.
