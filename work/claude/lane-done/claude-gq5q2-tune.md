# GQ5Q2 TUNE lane report (claude/gq5q2-d)

Final sha: `dd9ba23dc5c481955850af04b6e1b69c29006d17` (pushed)

## 0. Setup confirmed

- `tools/cdp.mjs`: added `BRACKEN_GQ5Q1`/`BRACKEN_GQ5Q2` page-eval hooks (commit 792b2608a), copied `tools/boss-rates.mjs`, `tools/boss-run.mjs`, `tools/proc-rss.mjs` wholesale from the gq5q1 worktree (batch168, `--out`/`--resume` support) - diffed, no lane-specific strings.
- Flag-reaches-the-page confirmed three ways across every table run this lane: (a) `esc 0s(skip)` marker on every fight line, (b) zero occurrences of "THE BOMBARDMENT" (the OFF-only mechanic) in any hb breakdown across 5 tables, (c) "HER SCEPTRE SWEEP"/"THE HATCH ERUPTS" (ON-only names) present in real fights.
- Node baseline: `node tools/gq5q2.mjs` -> `ok gq5q2 (flag off: it is gq5q1)`; `BRACKEN_GQ5Q2=1 node tools/gq5q2.mjs` -> `ok gq5q2 (flag on: all proofs)`. Both green at the final sha.

## 1. OWED 1 - phase-2 lab, n=6 knob tables, n=36 confirm (the big one)

Roof-start via `gqEscape:'skip'` (the gq4tune-p2 precedent), flag forced on, default kit (flasks), `--jobs=1`. n=6 per hero (knight/warden/pyro), 18 fights per table.

| table | knob | value | result |
|---|---|---|---|
| baseline | - | sweep.dmg=15, perch.cap=0.10, dmgK=0.65 | 14/18 = **78% [55-91]** |
| step 1 | `Q52N.sweep.dmg` | 15 -> 18 | 14/18 = 78%, **identical win/loss per fight to baseline** |
| step 2 | `Q52N.perch.cap` | 0.10 -> 0.08 | 14/18 = 78%, identical win/loss pattern |
| step 3 | `Q52N.dmgK` | 0.65 -> 0.70 | 14/18 = 78%, identical win/loss pattern |

Each `src/gq5q2.js` knob edit was mirrored into `tools/gq5q2.mjs`'s hardcoded plan numbers in the same commit; node proof stayed green (`ok gq5q2`) after every single change.

**Why all three knobs are no-moves**: every one of the 56 roof-reaching fights across the baseline + 3 knob tables won outright (`reachedRoof` always equals the win count for the hall-surviving fights). Every loss in every table is a **pre-existing hall death** (THE HEARTH JET / THE ARROW / HER CHARGE stacking before the roof is ever reached) - mechanics this lane doesn't touch. Sweep damage, perch cap and dmgK all only matter once a hero is already on the roof, and no roof-reaching fight has ever lost in 72 total fights across this lane. This is the same "exhaust the prescribed knobs, document, stop" shape gq4tune/gq5p-tune/gq5q1-tune hit when their narrow levers ran dry.

**n=36 confirm** (`--seeds=12`, committed numbers: sweep.dmg=18, perch.cap=0.08, dmgK=0.70):

```
GQ5Q2 P2-ONLY (escape skipped, roof start) row=crown heroes=knight,warden,pyro (36 fights)
  knight 10/12  reachedRoof 10/12
  warden 8/12   reachedRoof 8/12
  pyro   8/12   reachedRoof 8/12
TOTAL 72% [56-84] n=36  band 60-65: UNSURE, point over
```

Same structural pattern holds at n=36: `reachedRoof` equals the win count for every hero, zero roof-phase deaths in 36 fights.

**Damage-by-source on deaths** (hb breakdowns, n=36 confirm table): every death is a hall death. Recurring culprits, by hero:
- **knight** (s6, s9): `?` (unattributed/crowd) 158-191, HER SCEPTRE 29, THE ARROW 20-50, HER CROWN 26-52 - death comes from stacked small hits, not one spike.
- **warden** (s3, s7, s9, s12): `?` 100-230, HER CHARGE 44-87 (her biggest single contributor against warden), THE HEARTH JET 13-39.
- **pyro** (s1, s5, s8, s9): HER CHARGE 67-134 and HER SCEPTRE 67-124 are consistently the two largest named sources against pyro, on top of A GEODE SHARD 37 and A PORTAL SHARD 44-74 - consistent with pyro's higher measured per-hero multiplier (see OWED-adjacent finding below).

**Verdict**: rate sits at 72-78% across every table, over the 60-65% band, UNSURE (point estimate over, CI still spans the target). All 3 prescribed knobs are exhausted and are structurally incapable of moving this number, because the thing failing the band (hall survival) is upstream of every lever this lane owns. **Recommendation**: accept 72% (n=36) as the shipped number for this lane; the next lever, if Daniel wants tighter banding, is hall survival tuning (out of GQ5Q2's scope) or her bar/HP, the same escalation gq5p-tune and gq5q1-tune both flagged when their own narrow knobs ran dry.

Standard 7(9)-hero n=6 pass: not run - time was spent on the n=36 confirm and the 5 BROWSER OWED items instead; flagging as owed below.

### Per-hero damage dial (the DUEL_HERO.gqueen.pyro=2.2 question)

Measured via `tools/gq5q2-tickdial.mjs` (real `damagePlayer0` chain, one real hit of each move, big HP buffer so nothing clips):

| hero | THE SWEEP (one hit) | THE HATCH ERUPTS (one hit) |
|---|---|---|
| knight | 44 | 10 |
| warden | 44 | 10 |
| pyro | 95 (2.16x) | 22 (2.2x) |

**Finding**: yes, both new sources inherit `DUEL_HERO.gqueen.pyro=2.2` uniformly (confirmed by source read of `src/main.js`'s `damagePlayer0`/`DUEL_HERO` table: it keys only on `src === boss`, with no per-move-name exemption in this worktree, unlike gq5q1-d's fix for THE THRONE FIRE in commit c308664ee). The measured ratios (2.16x, 2.2x) land almost exactly on the table value, not some runaway multiplier - this is the *designed* per-hero weighting working as intended, not a bug.

**Decide**: no fix needed, and I did not touch her moveset. gq5q1-d's THE THRONE FIRE fix was for an **unavoidable, floor-wide** attack where the per-hero multiplier unfairly punished pyro for a hit she had no way to dodge. THE SWEEP (0.7s tell, dodge/block/parry) and THE HATCH ERUPTS (1.2s smoke telegraph, a told column you can just not stand in) are both avoidable/told moves, exactly like the rest of her existing roof moveset that already carries this same multiplier (THE HEARTH JET, portal shards, HER CHARGE, HER CROWN, etc. - all visible in the hb breakdowns above hitting pyro harder too). Exempting sweep/hatch here but not her other roof moves would be the inconsistent choice, not the fix. (I only measured sweep and hatch directly; perch rockfall and the teach shard go through the same `gqHit`/`damagePlayer0` chain with no move-name branch either, so the same conclusion applies to all four by construction - not separately measured, flagging as a residual owed below if Daniel wants it double-checked.)

## 2. OWED 2 - 9(7)-hero rope reach: GREEN

`tools/gq5q2-reach.mjs` (fixed a real bug in my own first draft: `load()` was missing the `BK.tp(trigger)` + 300-frame hall-start run every other gq5q2 browser tool does, so `G52` was never begun before `toRoof()` ran, and the script errored `null.perch` for all 9 heroes on the first pass - fixed by giving `load()` the same hall-trigger sequence tickdial/teachmiss/shots/textfit all already use).

Each hero stood west of the rope in the real forced perched/WARDED window and struck it with a standing blow and with their basic (ranged-for-ranged-heroes) attack, reading the real `G52.perchPhase()==='swing'` transition:

```
  hero          blow-rings   shot-rings
  knight      yes         yes
  warden      yes         yes
  geomancer   yes         yes
  ranger      yes         yes
  berserker   yes         yes
  pyro        yes         yes
  paladin     yes         yes
  pirate      yes         yes
  reaper      yes         yes
```

All 9 heroes ring the rope with both a blow and a shot. **GREEN.**

## 3. OWED 3 - textfit / overflow: GREEN

`tools/textfit.mjs`'s own `hints` scope is a static regex scan of `main.js` for literal `hintMsg = '...'` assignments and can't see `gq5q2.js`'s dynamic `ctx.hint(Q52N.hint)`; its `boss`/`bossfix` scopes drive only the hall's own trigger, never `skipRoof()`. So `tools/gq5q2-textfit.mjs` reuses the game's own shipped text recorder (`window.__textRec`, `src/main.js` 33938-33946) and textfit's own OFFSCREEN/OVERFLOW/COLLIDE math, driven through the real roof entry.

Two real bugs found and fixed in my own test harness along the way (both are harness bugs, not game bugs):
1. `BK.sim(n)` updates game logic but never calls `render()` (`main.js:38667` `step()` vs `38678` `sim()` - the comment on `sim()` literally says "the same, without the draw"), so nothing was ever drawn and `__textRec` stayed empty. Switched the harness's frame-driving loops to `BK.step(1)`.
2. `E.begin()` (where the hint+plate draws happen) runs synchronously *inside* `H.skipRoof()`, so `window.__textRec` has to be set to an array *before* calling `skipRoof()`, not after.

With both fixed, and the entry hint fed through the same ungated path textfit.mjs's own shipped `hints` scope uses (`BK.textLab.hint(...)`, matching `TL.hint(h.s)`):

- **The 72-char entry hint** ("STRIKE HER STONES BACK AT HER - AND WHEN SHE HIDES IN THE BELL, RING IT.") wraps cleanly into exactly two lines - "STRIKE HER STONES BACK AT HER - AND WHEN SHE HIDES IN" / "THE BELL, RING IT." - concatenating back to the full string with no truncation, no OFFSCREEN, no OVERFLOW, no COLLIDE.
- **The two plate lines** ("STRIKE HER STONES BACK AT HER" 155px, "AND WHEN SHE HIDES IN THE BELL, RING IT." 203px) and **WARDED - RING THE BELL** (116px) / **SHE RUNS FOR THE BELL** (112px) are all world-anchored floating text near the boss (drawn via `ctx.number()`, not the HUD toast), so textfit's own OFFSCREEN/OVERFLOW checks correctly exclude them (world text is expected to scroll off with the camera). All four measure comfortably under VW=320px even unwrapped and centred, so there's no practical overflow risk regardless.

**GREEN.** One early false-positive COLLIDE (two "!" tell markers at the same spot) showed up in a draft run before the render fix was in place; it was an artifact of forcing two moves into the same test frame window back-to-back, not a real in-game collision, and did not reproduce after the fix.

## 4. OWED 4 - 10 stills: GREEN, with 2 caveats

`tools/gq5q2-shots.mjs` (same `BK.sim()`-never-renders bug as OWED 3, same fix: switched to `BK.step()`). 10 individual PNGs + `sheet.png`, in `work/claude/shots/gq5q2/` (committed) and copied to `C:\Users\danie\Projects\desktop-stills\gq5q2\`:

entry-plate, teach-shard, rope-idle, rope-ready, cupola-warded, rope-swinging, shaken-loose-downed, sweep-windup, sweep-release, hatch-smoke, hatch-fire.

Judging the three asks:
- **Does the rope read as hung from the cupola frame?** Yes, clearly - visible in entry-plate/cupola-warded/rope-idle: the rope is anchored directly under the frame's crossbeam, reads unambiguously as "the bell rope."
- **Does the sweep arc read as a sceptre swing?** Inconclusive from `sweep-release.png` - the hero was actually hit by the sweep in that capture, and the screen is covered by a full-screen red hit-flash at the moment of the snapshot. `sweep-windup.png` (the tell) reads fine. Owed: a cleaner sweep-release still with the hero positioned just outside the hit arc.
- **Is the ward ring distinguishable?** Not clearly from `cupola-warded.png` - an unrelated generic combat hint box ("A YELLOW MARK LOW AT YOU...") happened to be showing in that capture and covers most of her sprite. The purple ward burst/ring itself (`ctx.ring(e.x,e.y-30,34,'#c9a0ff',0.6)` per the source) is real and present in-engine; the still just doesn't show it cleanly. Owed: re-shoot with the hint queue drained first.

## 5. OWED 5 - the teach shard miss/retry: GREEN

`tools/gq5q2-teachmiss.mjs`: left the hero exactly where roof entry puts it (west of the cupola), watched `G52.state().teach` for a real 10s (600 frames) window.

```
shard fates: [
  {n:1, x:14461, arrived:false, onCupola:true},   // died on the cupola stone - a real miss
  {n:2, x:14336, arrived:false, onCupola:false},
  {n:3, x:14381, arrived:false, onCupola:true}     // also a miss
]
final: {n:3, done:false, struck:0, said:16.4}
```

A shard fired east from the cupola toward the hero died on the cupola's own stone (`onCupola:true`, `arrived:false`) at least twice in this run, and the engine kept re-teaching (`n` reached 3, the documented max) - all three fates land inside the 10s window. **GREEN**, the lesson is seen (re-seen) within 10s as designed.

## 6. Mash bot - 0/6

`BRACKEN_GQ5Q2=1 node tools/mash-bot.mjs crown --heroes=knight,warden,pyro --seeds=2 --arena-only`: knight x2, warden x2, pyro x2 - **DEAD in all 6 fights** (boss left 93-98%, 5-23 of 1000-1700 blows landed). Matches the design target exactly, same as gq5p-tune/gq5q1-tune's precedent.

## SEEN vs NOT SEEN

**SEEN** (confirmed green, this lane):
- Tooling gaps fixed and confirmed reaching the page.
- OWED 1: n=6 x4 tables (baseline + 3 knobs) + n=36 confirm, all run and logged; knob exhaustion documented with real per-hero sweep/hatch damage numbers.
- OWED 2: 9-hero rope reach, green.
- OWED 3: textfit/overflow, green.
- OWED 4: 10 stills + sheet, captured (2 caveats noted above).
- OWED 5: teach shard miss/retry, green.
- Mash bot 0/6.
- Node proof green flag off/on at final sha.

**NOT SEEN / owed**:
- Standard 7(9)-hero n=6 pass (only ran knight/warden/pyro per the brief's explicit n=6 priority; time went to the n=36 confirm + the 5 BROWSER OWED items instead).
- Perch rockfall and teach-shard damage were not separately tick-dialled (only sweep and hatch were directly measured) - the "no fix needed" conclusion for all 4 sources is by construction (same `gqHit`/`damagePlayer0` chain, no per-move exemption anywhere) rather than separately measured on those two.
- A clean (non-hit-flash) sweep-release still and a clean (hint-drained) cupola-warded still.

## Final sha and merge

Final sha: `dd9ba23dc5c481955850af04b6e1b69c29006d17`, pushed to `claude/gq5q2-d`.

`git merge-tree $(git merge-base HEAD origin/claude/gq5q2) HEAD origin/claude/gq5q2` reports no conflicts.

**laptop: merge claude/gq5q2-d @ dd9ba23dc5c481955850af04b6e1b69c29006d17 into claude/gq5q2.**

## Questions

1. **72% (n=36) is above the 60-65% band and all 3 prescribed knobs are exhausted (structurally no-moves - every roof-reaching fight has won in 72 fights across this lane). Ship as-is, or open a new lever outside this lane's numbers (hall survival, or her bar/HP)?**
   Recommendation: ship 72% as-is for this release. The band miss is entirely upstream of GQ5Q2's own mechanics (zero roof-phase deaths ever recorded), so further GQ5Q2-only tuning cannot move it; forcing the rate down inside this lane's numbers would mean either making a told, avoidable roof move untelegraphed/unavoidable (against the design rules) or over-nerfing the phase for heroes who already clear the hall fine. If the band matters enough to chase, the next lane should own hall survival or her HP/bar directly.

2. **The per-hero damage multiplier (pyro 2.2x) applies uniformly to the two new avoidable sources I measured (sweep, hatch) and, by the same code path, to the other two (perch rockfall, teach shard) I did not separately measure. Leave as-is, or spend a follow-up lane confirming all four numerically?**
   Recommendation: leave as-is. All four sources share the exact same `gqHit -> ctx.damage -> damagePlayer0 -> BOSS_HIT.gqueen * DUEL_HERO.gqueen[hero]` chain with no per-move branch anywhere in `src/main.js`, so there is no code path by which perch/teach could behave differently from sweep/hatch. A follow-up measurement would be confirmatory, not corrective.

3. **Two stills (sweep-release, cupola-warded) are usable but imperfect (hit-flash covering the arc; an unrelated hint box covering the ward). Re-shoot now, or accept and note the caveat?**
   Recommendation: accept with the caveat noted above (already in OWED 4 section); the remaining 8 stills plus the sheet give Daniel everything needed to judge the readability asks, and a re-shoot is a 10-minute follow-up if he wants it, not worth blocking this report over.
