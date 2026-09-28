# Lane claude/gargoyle5: THE GATE GARGOYLE, round five (Daniel's playtest, 2026-09-28), done

Branch `claude/gargoyle5`, off claude/batch38 062f11c, with origin/master 05deabe merged in at the end (the merge only touched `src/level.js`, one line). Nothing is merged into master and nothing is deployed.
Everything from round four (`work/claude/lane-done/claude-gargoyle4.md`) is unchanged except the three points below.

## What changed

### 1. His fireball is now TWO, thrown one at a time (`src/gate-gargoyle.js`)
- **How a throw goes:**
  1. The first throw is told the same as before: a yellow `!`, a 1.1 s glow (0.9 s in phase two), then a ball.
  2. The recoil lasts 0.45 s.
  3. The fire gathers again. This is a second told throw: the same `fireballTell` mode, a `!` again, the inhale sound again, and a 0.7 s glow.
  4. The second ball is thrown, **aimed again at where you are at that moment**.
- **The gap between the two throws is 1.15 s** in both phases (`GARG.ball.throwT` 0.45 + `GARG.ball.again` 0.7). At 90 px/s that puts the balls about 100 px apart in the air. Measured at 101 px.
  - A hero can jump the first, land, and jump the second.
  - A hero who steps down a tier after the first ball dodges that one, but the second follows him.
- **Unchanged for each ball:** 90 px/s, 10 damage, radius 6, a shield blocks it, it breaks on a standing slab or on stone, and a dodge roll passes through it.
  - The balls now live in `e.balls`, an array.
  - A new volley is only chosen once both balls from the last one are gone.
  - The phase-two "flare, then fireball, then dive" sequence now throws two.
- **Bestiary** (`src/main.js`): "he spits two slow fireballs, one after the other; a shield takes all of it." `textfit bestiary --strict`: 0 findings.
- **Bot** (`src/lab.js`): it answers the nearest ball that is closing on it. The ledger files damage as FIREBALL whenever a ball disappears and the hero loses health.

### 2. The fire breath is drawn as flickering flame (visual only)
- The new `drawFlame` in `src/gate-gargoyle.js` replaces the old wavy row of squares.
- It draws along exactly the same `e.jet` the hitbox uses:
  - four layers of flame puffs, from outside in: red, orange, yellow, and a white-hot core that only appears near his mouth (the first 35% of the jet);
  - the flame widens away from the mouth and tapers at the front;
  - tongues of flame lick upward off the jet;
  - embers rise from it;
  - grey smoke rolls off the front.
- The flicker steps at 18 per second, so it reads as pixel fire, not a blur.
- **Timing, hitbox and tell are exactly as round four set them:**
  - 1.5 s tell, line set for the last 0.5 s, 1.4 s jet, running out at 260 px/s;
  - 210 px reach, 10 px either side of the line, 12 damage.
  - All of these are asserted, and the measured tell-to-hit time is still 1.97 s.

### 3. The fireball has its own pose (`src/redraw/queue_bosses.js`, frames 5 and 6)
- These were the wing gust's frames, and nothing else used them, so they were redrawn in place. There are still 12 frames, and the anchor is unchanged (`queue-bosses`: ok).
- **Frame 5, the windup:** head raised, jaw dropped, a ball of fire held in his jaws (red, orange, yellow, white core), sparks, and fire in his eye. The wings are raised.
- **Frame 6, the throw:** head thrust forward, jaws wide, the flame leaving them, and smoke curling off his snout. The wings swing down.
- The gust's white blast lines are gone (asserted: 0 px of them).
- The world glow at his mouth during the tell is kept, on top of the new pose.
- `docs/queue-bosses.png` has been regenerated.

## Capture
- `work/gargoyle5/before-fire.png` and `work/gargoyle5/after-fire.png` come from the real page, made by the new `tools/gargoyle-fire-shots.mjs`, which is not in the suite.
- Each is four panels: the breath half-way out, the windup, the first throw, and a beat later.
- **After:** the breath reads as a fire jet, the jaws are lit in both poses, and the last panel shows two balls in the air.

## Checks (each run by name)
- **`gargoyle-playtest`** is extended, and the round-four assertions are kept.
  - I ran the new file against 062f11c in a throwaway `git worktree`, not a stash. **14 of its assertions fail there**, covering:
    - two balls, two tells, the gap, the 100 px spacing;
    - both balls hitting, being re-aimed, both blocked by a shield, both broken on a slab;
    - the flame's layers, smoke and tongues;
    - the pose;
    - the bestiary text;
    - and on the page: two thrown and two hits on the pyro, and the knight's shield taking both.
  - What still passes on 062f11c are guards: the breath's numbers, the "white near his mouth / red at the front" order (the old jet had that too), and the frame count.
- **Green:** gargoyle-playtest, gargoyle-stomp, gargoyle-smash, whelps, witchlight, boss-openings, boss-fight-end (45 fights end), tells, queue-bosses (`node tools/queue-bosses.mjs`), architecture, checkpoints, skins, dangling-paths, slopes-trace (every frame of every level identical, no rebase), npc-removal, comments, homepaths, content-audit, and `node tools/textfit.mjs bestiary --strict` (0 findings).
- **After the master merge**, gargoyle-playtest, witchlight and dangling-paths were run again: green.
- The printed line `[marks] a windup with no row: gargoyle|gustTell` comes from the playtest itself. It deliberately asks for the old gust mark to prove it is gone. It is not a failure.

## Pilot: `tools/gargoyle-pilot.mjs 1 --heroes knight,warden,pyro`, normal health, same seed
| hero | BEFORE (062f11c) | AFTER |
|---|---|---|
| knight | won, 104.3 s, took 24 (breath 24) | won, 92.3 s, **took 0** |
| warden | won, 90.9 s, took 88 (FIREBALL 52, spikes after the breath tell 20, breath 16) | **died at 73.4 s, boss had 15% left**, took 100 (FIREBALL 39, spikes 32, breath 16, a whelp during the dive tell 12) |
| pyro | died at 61.5 s, boss had 44% left, took 88 (breath 44, FIREBALL 26, spikes 18) | died at 52.8 s, boss had 44% left, took 88 (breath 48, FIREBALL 13, spikes 26) |
| summary | 2/3 wins, median taken 88, 58/min | 1/3 wins, median taken 88, 82/min |

- Files: `work/gargoyle5/pilot-before.*` and `work/gargoyle5/pilot-after.*`.
- **Fireball damage did not go up, even though he now throws twice as many balls:** warden 52 -> 39, pyro 26 -> 13.
- **The warden's loss** came from spike falls and a whelp on top of the fireballs. With one seed, it is a coin flip, not a trend.
- **The breath still hits the unshielded pyro hardest**, as it did in round four.
- In the mode counts, `fireballTell` now counts twice per volley. So 8 in the AFTER rows means 4 volleys.

## UNVERIFIED
- Nobody has played it by hand. The flame was checked in the one still capture and by the Node recorder, not watched moving at full speed. The sounds weren't listened to.
- One seed per hero.

## QUESTIONS FOR DANIEL
1. **The gap between the two throws: built at 1.15 s** (0.45 s recoil + 0.7 s second glow), the same in both phases, which puts the balls about 100 px apart. *Recommendation: play it as is.* If it's too easy, shorten the second glow (`GARG.ball.again`) to 0.5 s rather than making the balls faster.
2. **The second throw is told again** (a `!` and the inhale sound, with a shorter glow) rather than following straight on. *Recommendation: keep it.* The brief asked for two told throws, and it keeps his rule that every blow is told.
3. **The world glow at his mouth during the tell** still draws on top of the new jaws-lit pose. *Recommendation: keep both.* The glow shows the timing (it grows until the throw), and the pose shows the shape. If it reads as doubled up in play, drop the world glow's outer halo.
4. **The breath on heroes without a shield** (pyro took 48 in the AFTER pilot) is round four's question 3, still open. *Recommendation, unchanged:* play the slowed breath before touching its numbers.
