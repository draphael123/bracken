# claude/wardenkit - WARDEN KIT / HERO BALANCE (Opus), base origin/claude/redgorge2 88f6bc13 + origin/claude/sweep3 merged

Daniel 10-06: when the warden is the hero who can't win, fix HER KIT, not the boss. No boss number was touched.

## 0. Merge
origin/claude/sweep3 merged first (a4a28cdc). Conflicts were unions: EHP (the matriarch row + sweep3's gravewarden/homunculus/ploughman/golem hp),
src/marks.js (the matriarch tells + the greathound tells), tools/check.mjs (redgorge2-aloft, raptor-matriarch + boss-read). tells, answer-tags, boss-read,
raptor-matriarch, cistern-queen green after it.

## 1. Diagnosis (tools/hero-ledger.mjs, new: the standard fight with a ledger of every blow taken/landed, damage per opening, dodges and how far, turns)
- **Her step was not an evade.** 175 px/s bled off by a twentieth a second for 0.18 s: 28 px on open floor, 12-22 px in the boss lab, graced 0.15 s.
  Knight 68 px / pyro 87 px graced 0.26 s. Every red blow she had to leave (the Matriarch's pounce/dive, the greed reprisal's 60 px ring) still found her.
- **Damage per opening was ~0.8 of the knight's, not half** (Matriarch 43 vs 54, Queen 125 vs 165, harbor 112 vs 175). The Matriarch's openings are
  capped at 5-6% of her each, so per-opening damage cannot close her gap there.
- **Her deflect was eaten**: a C tap pressed during her own thrust/step was lost (no buffer, unlike every other press), and with a FULL Vigil bar the
  tap was the Phalanx and no sweep - the yellow blow landed (waymeet: every Paladin cut hit with the deflect clock at 0).
- **Yellow blows from above** (scree, sand, shards) were never turned: the deflect was front-only.
- Bot artifacts found on the way (all v2-only fixes, warden-only): the Undead Archmage's carpet hands thrust at his ward every free frame (9-11
  reprisals a fight = 190 of her 238 hp; knight/pyro 3-5); the Matriarch plan passed noRoll for her; a held C (not tapped) vs the Paladin; the
  "stuck" unsticker back-stepped her off the Owl's lamp 48 times a fight; the Queen's sand branch walked her away before the deflect line could run.

## 2. Kit changes (src/main.js, all isWarden-only; knight/pyro code untouched)
| change | before -> after | told |
|---|---|---|
| THE STEP CARRIES (STEP_PACE) | back-step 175 decaying -> 200 px/s held for its 0.18 s; 28 -> 44-49 px a step, still taken in pairs | comment block at STEP_INV |
| step grace STEP_INV | 0.15 -> 0.18 s (the whole step) | - |
| heel at an edge | a back-step that would carry her off open air (2 tiles down) stops at it; jump/forward step still go over | comment |
| THE POINT FINDS THE GAP (TIP_GAP) | tip x1.3 -> x1.5 on a boss/mini in his opening (GB.openOf, the chip's own window); never outside it | HEROES desc "(half again into a boss in his opening)" |
| the deflect from OVERHEAD | `front` -> `front || up` (as the Geomancer's rune-ward); never a red blow | HEROES desc "from in front or from overhead" |
| THE TAP IS KEPT (DEF_BUF) | a C pressed inside a thrust/step/plunge fires on her first free frame (0.15 s) | comment |
| a full Vigil bar | the tap raises the Phalanx AND sweeps (it used to be the Phalanx only) | HEROES desc "(and the tap still sweeps)" |

## 3. Bot changes (v2 profiles only; the legacy branches are byte-identical)
src/lab.js: carpet hands hold her blow one short of the greed count and fly out of a closing ring (undeadmage); matPlan noRoll only for legacy, and her
back-step is aimed (she faces away from where she goes); the spacing step only from a foe at her height; the unstick's dodge only when the boss is at her
height; vs the Paladin the deflect is TAPPED from 0.35 s left (it was held from 0.12, often already down). src/raptor-matriarch.js v2Hands: deflect the
scree. src/cistern-queen.js queenPlan (s.eyes = v2): deflect the sand as it falls.

## 4. Before -> after (tools/boss-rates.mjs, profile human, practiced, campaign level, normal health, 240 s)
Before: this branch at a4a28cdc (merge only), n=4 per hero. After: bb64b91c, warden n=8 (waymeet 7: one fight lost to the 17:00 restart), knight/pyro n=4.
Knight and pyro re-run after: **identical, seed for seed**, to before (their code is untouched).
| row (boss) | L | knight | pyro | warden BEFORE | warden AFTER |
|---|---|---|---|---|---|
| redgorge (Raptor Matriarch) | 32 | 2/4 | 4/4 | 0/4 (12-46% left) | **0/8** (5-19% left, mean 14%; fights 144-188 s) |
| fallingtower (Undead Archmage) | 29 | 2/4 | 4/4 | 0/4 (10-54% left) | **7/8** |
| harbor (Breakwater Warden, hp 1400 here) | 22 | 4/4 | 4/4 | 3/4 (taken 168-208) | 8/8 (taken 84-131) |
| waymeet (Paladin, hp 610 here) | 22 | 4/4 | 4/4 | 4/4 | 6/7 |
| underwell (Cistern Queen) | 32 | 3/4 | 4/4 | 1/4 | **4/8** |
| theatre (Puppeteer) - fine row | 24 | 0/4 | 3/4 | 4/4 (5/8, 9/16 at more seeds) | 7/8 (14/16) |
| canal (Greenteeth) - fine row | 23 | 3/4 | 3/4 | 4/4 (5/8, 11/16) | 5/8 (9/16: in noise) |
| hanging (Owl) - fine row | 7 | 1/4 | 2/4 | 4/4 (8/8) | 8/8 |

**Harbor and waymeet at sweep2's tuning** (sweep2 is not merged here; measured on a throwaway merge, before the heel/sand step):
harbor (hp 2350) warden 2/8 -> 8/16; waymeet (hp 2000) warden 4/16 -> 15/16 (knight 3/4, pyro 4/4 there).

## 5. Checks (green)
syntax, tells, answer-tags, boss-read, raptor-matriarch, cistern-queen, one-dodge, commitment (217 rows), verb-matrix, ability-poses (60/60),
skill-passives, skill-icons, hero-trials, starter-kits, normal-health, small-adds (22 -> 23 rows, worst row 25% < 33%; one empty-log run under load,
green on rerun). No test edited. NOT run: the full suite, mash re-stamps (no boss/level touched), skill-balance-probe, combat-feel, textfit (the HEROES
desc grew three short clauses - textfit should be run by the coordinator).

## REDS
- **THE MATRIARCH, warden 0/8.** She now survives 145-188 s (was 99-137) and leaves her at 5-19%, but loses the damage race: the opening cap gives
  every hero the same per-opening damage, and the knight's edge is blows outside the openings (263-305 vs her 105-216: from behind/above, under the
  talons). A low poke from the rock in the water phase (tried, reverted) made it worse on average.
- The warden is now ABOVE the knight on the Undead Archmage (7/8 vs 2/4) and the Puppeteer.
- Throwaway sweep2 measurements are pre-heel/sand; re-measure harbor/waymeet once sweep2 lands with this.

## QUESTIONS FOR DANIEL (recommendation first; the rec is what is built)
1. **The step at ~45 px held, in pairs** (built). Alt: 35 px (closer to the old "spacing, not escape" intent). Your playtest decides how it feels.
2. **The tip x1.5 in an opening** (built). Alt: keep x1.3 and rely on the step + deflect (the Archmage/Queen numbers were mostly the step and the deflect fixes).
3. **The Matriarch for the warden**: rec a small v2 bot pass on the warden's beats/flank blows there (her kit has the low poke; the plan barely uses it
   safely), then your playtest - NOT her hp. Alt: let TIP_GAP lift the per-opening cap for the warden (a boss-side rule, so not built).
4. **The carpet greed-stop is warden-only** (built so knight/pyro rows do not move). Rec: give it to every hero in a bot lane and retune the Undead
   Archmage after (knight/pyro would take 3-5 fewer reprisals).
5. **A full Vigil tap = phalanx + sweep** (built). Alt: keep them separate and make the phalanx a held C.

## Commands
`PORT=8675 node tools/boss-rates.mjs redgorge,fallingtower,harbor,waymeet,underwell,theatre,canal,hanging --ways=practiced --heroes=warden --seeds=8 --jobs=2`
(knight,pyro --seeds=4). Ledger: `PORT=8675 node tools/hero-ledger.mjs <rows> --heroes=knight,warden,pyro --seeds=2`.
