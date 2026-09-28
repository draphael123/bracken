# Lane claude/gargoyle4: THE GATE GARGOYLE after Daniel's playtest (2026-09-28), done

Branch `claude/gargoyle4`, off master cd35d24 (master had not moved at the end). Nothing merged or deployed.
The last rework (spikes, stomp-only damage, wind wells, glyph flare, dive, regrowing slabs) is unchanged except for the four points below.

## What changed (all in `src/gate-gargoyle.js` unless said)

### 1. The fire breath is slower
| | before | after |
|---|---|---|
| yellow tell | 0.95 s (0.78 s in phase two) | **1.5 s in both phases** (`GARG.tellP2Not`) |
| line set (solid) before the fire | 0.25 s | **0.5 s** |
| the jet | the whole 210 px line at once | **its front runs out from his mouth at 260 px/s** (`GARG.breath.travel`, `jetSoFar`) |
| jet lasts | 0.85 s | 1.4 s (so it still reaches its full length and burns) |
| phase-two sweep | 0.75 rad/s | **0.4 rad/s** |

Measured in Node, with a hero standing on the line about 120 px from his mouth:
- From the tell starting to the fire touching the hero: **0.97 s -> 1.97 s** (phase two: 0.80 s -> 1.97 s).
- From the line going solid to the fire touching the hero: **0.27 s -> 0.95 s.**
- Damage is unchanged (12). A slab still stops the jet, and a shield still takes it.

### 2. The wing gust is gone; a fireball replaces it
- **Removed:** the `gustTell`/`gust` modes, the shove, and the gust's wind lines. The `push` and `wind` hooks in `main.js` are gone too. The spike-floor wind wells are untouched.
- **The tell (`fireballTell`, yellow `!`, 1.1 s; 0.9 s in phase two):**
  - He moves off to one side of you, level with your tier.
  - He rears back, using the old gust windup pose (frames 5 and 6).
  - A fire glow grows and brightens in his jaws until the throw.
- **The throw (`fireball`):**
  - He throws ONE ball at 90 px/s, aimed at where you are as it leaves him. It doesn't home in. (The hero runs at 92 px/s.)
  - It deals 10 damage, can be blocked, and has a radius of 6 px.
  - It breaks on any standing slab or on stone.
  - Only one ball is in the air at a time.
  - While the wind is carrying you, it can't hit you. A dodge roll's invulnerability lets it pass through you.
- **Where it slots in:** it takes the gust's weight in his choice (1.6), and in phase two a flare is now followed by a fireball and then a dive (it was a gust and a dive).
- **Mark:** `'gargoyle|fireballTell':'!'` in `src/marks.js` BY_HAND replaces `gustTell`, and `node tools/tells.mjs --write` has been rerun.
- **SFX:** the tell uses the breath's inhale (`SFX.ember`). The throw uses the Pyromancer's own `SFX.pyre`. The burst uses `SFX.ember` with sparks, plus "IT BREAKS ON THE SLAB" when a slab stops it. No new sound was made.
- **Bestiary:** "His wings throw you toward the spikes and his throat throws fire…" is now "His fire runs out along a line you can see set, and he spits one slow fireball at you; a shield takes both." `textfit bestiary --strict` finds nothing.

### 3. He moves more slowly
- **Before:** he eased toward his target at a rate that grew with the distance, so every side-swap or slab hop of yours sent him streaking.
- **After:** the ease is gentler (`GARG.ease` 2.4 -> 1.6) and speed is now **capped**:
  - `GARG.fly` = 90 px/s for hover, recover, wake and the reposition.
  - `GARG.flyTell` = 120 px/s while he sets up the breath, the fireball or the flare.
  - `GARG.flyUp` = 150 px/s when he climbs back up after a land, a stun or the reset, and on his way back to the gate.
- **Measured** (Node, 40 s round a hero hopping between two slabs every 1.2 s): **peak 460 -> 90 px/s, 90th percentile 251 -> 90, median 89 -> 90.**
- **The dive is untouched:** 430 px/s, 0.95 s tell, and the climb out of sight before it is uncapped. It still lands where the shadow found you (asserted).
- **The stomp opening is untouched:** the smash, the crash, the 3.5 s stun, the stomp, the wind ride and the reset all pass `gargoyle-stomp` and `gargoyle-smash` unchanged.

### 4. One summoned whelp at a time
- `GARG.whelps` went from 3 to 1, and a shriek now calls exactly one (it called two or three).
- **Chosen and built:** while one of his whelps is alive, **he skips the shriek and does another attack.** The shriek's weight in his choice is 0, so the roll falls to the dive, breath, fireball or flare.
  - Measured: 0 shrieks in 3000 rolls with one up, 248 in 3000 with none.
- A shriek already under way when a whelp is up calls none.
- The battlement whelps don't count; only the ones he summoned do.

### The bot (`src/lab.js`)
- Its gust handling is replaced by fireball handling:
  - A shielded hero faces the ball and blocks.
  - The others jump it when it's about 34 px away. They don't roll, because a roll can carry them off the slab.
- The pilot ledger now names damage from the ball `FIREBALL`. Before, it was filed under whatever mode he was in when the ball landed.

## Checks (each run by name, NOT the full suite)
- **New: `gargoyle-playtest`** (in `tools/check.mjs`'s list, before `]) if (take(t))`). 23 assertions covering points 1-4, in Node plus the page: the real hero is hit by the fireball, and the knight's shield takes it. **On master cd35d24 it fails 20 of them.** The 3 that pass on master are guards that must not change: the dive's numbers, the dive's landing, and "no errors on the page".
- **Updated to the new design:**
  - `whelps`: ONE whelp per shriek, none while his is up; `whelps: 1,`.
  - `witchlight`: the `fireballTell` mark in the gust's place.
  - `gargoyle-stomp`: the breath test loop is 400 frames, because a sim frame is about 1/100 s and the slower breath outlasted the old 150.
- **Green:** gargoyle-playtest, gargoyle-stomp, gargoyle-smash, whelps, witchlight, boss-openings, tells, boss-fight-end (45 fights end), architecture, checkpoints, skins, dangling-paths, slopes-trace (every frame of every level identical; no rebase), npc-removal, comments, audit, content-audit, homepaths, plus `node tools/textfit.mjs bestiary --strict` (0 findings).

## Pilot: `tools/gargoyle-pilot.mjs 1 --heroes knight,warden,pyro`, normal health, same seed
| hero | BEFORE (cd35d24) | AFTER |
|---|---|---|
| knight | won, 111.4 s, took 76 | won, **94.1 s, took 12** |
| warden | won, 78.5 s, took 76 | won, **70.0 s, took 28** |
| pyro | died at 65.8 s, took 88 (he had 29% left) | died at 69.4 s, took 88 (**he had 1% left**) |
| summary | 2/3 wins, median taken 76, 58/min | 2/3 wins, **median taken 28, 24/min** |

**Where the damage came from** (the bot's ledger: his mode when it landed; "hover", "recover" and "stunned" rows are mostly whelp swoops):
- **Before:**
  - knight: spikes after a gust 20, spikes after the breath 20, breath 12, and 24 during hover/recover.
  - warden: breath 32, spikes 20, and 24 during stunned/recover.
  - pyro: breath 49, spikes after a gust 36, spikes 3.
- **After:**
  - knight: 12 during stunned (a whelp).
  - warden: breath 16, and 12 during the dive tell (a whelp).
  - pyro: breath 44, FIREBALL 26 (two thrown, both hit), and spikes after a breath tell 18.
- **What the rows show:**
  - "Spikes after a gust" is gone, since the gust was the biggest source of spike falls.
  - Whelp damage is down with one whelp.
  - The bot's pyro, with no shield, still eats most of the breath and did not jump either fireball in the fight. A direct probe shows a jump at about 34 px does clear the ball, so this is the bot's timing while it is busy moving, not the ball.
- Files: `work/gargoyle4/pilot-before.*` and `work/gargoyle4/pilot-after.*`.

## UNVERIFIED
- Not played by hand. The glow, the ball, its trail and the running jet were not screen-captured, and the sounds were not listened to.
- The fireball tell reuses the gust's art (frames 5 and 6, wings drawn back). It reads as a windup, but it wasn't drawn for a fireball.
- One seed per hero: the pyro loss (boss at 1%) is a coin flip, not a trend.

## Commits
df15006 (the change), plus the report commit. Both are pushed to `origin claude/gargoyle4`.

## QUESTIONS FOR DANIEL
1. **The shriek with a whelp up:** built as "he does another attack" (the shriek can't come up in his choice). The alternative is that he goes to the gate and screams and nothing comes, which gives you a free breather. *Recommendation: keep what's built.* A scream that does nothing reads as a bug.
2. **The fireball's numbers:** 90 px/s, 10 damage, 1.1 s glow, and he rarely throws it (it has the gust's weight). *Recommendation: play it as is.* If it's too easy, go to 110 px/s rather than adding homing.
3. **No-shield heroes still take most of their damage from the breath.** In the pilot, pyro took 44 from it even slowed. *Recommendation: play the new breath first.* If it still feels unfair, make the lock 0.6 s or cut the damage to 10, rather than slowing the jet more.
4. **His median speed now sits at the cap (90 px/s):** he is always drifting after his next hover spot, just slowly. If he still feels busy, *recommendation:* make him change sides less often (`hoverT`, 1.2-2.6 s now) rather than lowering the cap.
5. **A proper fireball pose:** a jaws-lit frame for `bakeGateGargoyle` (`src/redraw/queue_bosses.js`) in place of the reused gust windup. *Recommendation: yes, in an art lane (Sonnet).*
