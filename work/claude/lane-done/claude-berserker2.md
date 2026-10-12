# claude/berserker2 - BERSERKER 2: HIS OWN HERO (Opus kit rework, 2026-10-11)

Brief: scratch/brief-berserker2.md (Daniel's decisions, followed as written). Base: origin/claude/orderart 10557fa3 (batch86 + the Road Wardens).
Branch: claude/berserker2. Port 8849. ART IS PLACEHOLDER: every new pose key borrows an existing frame list (list below for the Sonnet barbarian lane).
NO TUNING was done (a Sonnet tune lane follows); the numbers below are first picks, chosen to keep his damage per second where it was.

## THE NEW KIT ("he never defends by stopping - he defends by hitting harder")
| Move | Input | What it does (numbers: src/berserker.js BZ, src/crouch-c.js COIL/POUNCE/WHET) |
|---|---|---|
| FLURRY | X | lead axe / off axe, L-R-L-R: quick (swing clock x1.3, x1.38 raging, x1.6 frenzy; recovery 0.06 s, was 0.084), SHORT (box 19 px out; was 21; the knight's sword is longer), each chop x0.85 of a full cut. The run goes on only while the chops land (kept). |
| CROSS-CHOP | the run's 5th blow (heavySwing at combo % 5) | both axes in together: the engine's finishing cut (x1.5, the shove, knock-into's finisher-on-break, +8 poise), box 23 px from just behind him, a beat slower (x0.82). SPIN CHOP talent: round behind him too. |
| DOUBLE CHOP | HOLD X | the overhead heavy, unchanged in numbers (poise +30, x1.4 on bosses/minis, x1.25 raging). Renamed from "cross-chop". |
| AIR SPIN | X in the air | both axes spin round him: a box 17 px both sides. DOWN+X air is still the plunge ('plunge' key, pose bzPlunge), UP+X the air up-slash ('rise'). |
| TAKE IT | HOLD C (a tap holds it 0.25 s) | crossed axes, front only. A yellow blow is ABSORBED: he takes a tenth (x the difficulty/tier/co-op scale) and 1.2 rage per hp absorbed (cap 30 a blow); stamina = commit.js blockCost (like a block); no stamina left = GUARD BREAK (half the blow, the knight's stagger/exhaust). ON THE BEAT (raised <= 0.2 s before, the shared tap beat; STOUT/WIDE BRACE widen it) it is his PARRY: nothing taken, +30 rage, RP.parried -> the foe reels, and his next cut is the CROSS-CHOP riposte. RED !! = TOO STRONG (lands whole; IRON BRACE: half). A bolt goes through. From behind: full. A swing or a roll drops it; he is rooted while it is up. |
| FRENZY | full rage + tap C | as before (8 s, faster, no flinch, war cry, x1.25 taken) but the kill-heal is replaced by HEAL ON HIT: 2.5% of every blow that lands (BLOOD PRICE 5%), and REND: each frenzied melee cut stacks on ONE foe (a new foe resets it, 2.5 s decay); the 4th CRACKS it - that blow is struck AS A HEAVY (P.heavy for the one call: the 'heavy' tag/B14 key, the beast/plate family key, ORE/guards that read P.heavy, cross-chop poise). Never a mash reward: it needs a frenzy (full bar + C). |
| AXE THROW | UP+C | unchanged throw/pickup. One-handed = the same moves (berserker2: the double chop is allowed one-handed at half poise), chops x0.8. |
| COIL | hold DOWN | crouched 0.12 s: coiled. Rage +4/s (SLOW BURN x2) to 75. A way held only TURNS him (he stays down). |
| POUNCE | coiled >= 0.3 s, hold a way, LET GO of down | low fast leap that way: vx 270..340 (longer coil, further), vy -150 (~6 tiles), 14 stamina, no hp. Axes-first box; blow = 'dash' x1.3 (the shooter/crew key: a gap-closer). SMALL foes (knock-into's small weight) are knocked along through main's kiWhy dash path (hazard rules included) and he goes on; a mid/brute/elite/boss stops him dead (bounces). Lands COMMITTED: 0.22 s, no swing/roll. Let go with no way held = he just stands up (no accidental pounce from a duck or a gust brace). The landing is checked before he goes (knockLandsSafe at 1/0.5/0.25 of the arc + half a body): shortened to 0.6/0.3, or refused - never into a drop/spikes/deadly pool. |
| WHETSTONE | stand still, calm (the fidget clock's calm) 1.5 s | idle: he whets one axe on the other, rage +4/s (SLOW BURN x2) up to 50; the out-of-fight drain is held while he whets under 50 (above 50 it drains down to it). Quiet (no growl, no wake). Was WORKING UP on the crouch. |
| SHOULDER ROLL | dodge | unchanged. |
| NEVER KILLS HIMSELF | - | selfFloor: the take-it chip leaves him at >= 1 (and never takes a last point). lethal(dmg, surcharge): a blow that would only kill him because of the frenzy's extra quarter leaves him on 1. Rage and the pounce cost stamina, never health. WHIRLWIND not used (kept for his subclass). |

## HOOKS (each commented `(claude/berserker2)`)
- src/berserker.js: rewritten kit module (takeTakes replaces braceTakes - braceTakes kept as an alias; rend, heal-on-hit in dealt, lethal surcharge, selfFloor, swingMul flurry/cross).
- src/crouch-c.js: COIL / POUNCE / WHETSTONE (coiled, leapPose, safeVx).
- src/main.js: import (smallFoe as bzSmall, knock-into weightOf); hero card / loop line / pick line / BZ_TEACH / TREE_WHO / HUD 'TAKE IT'; damagePlayer0 TAKE IT branch + frenzy surcharge into lethal; MOVE_WORDS +TOOK IT, CRACKED; rpAnswerUp -> BZK.onBeat; kiWhy dash for the pounce; heavy `can` (one-handed allowed, not during pounce); attackBox0 flurry/cross/air-spin boxes; the move/duck lines (coiled turn); P.vx = P.pounceVx after movement; swing + dodge gates (pounce); a swing comes out of TAKE IT (abuf gate); flourish on his heavySwing; P.calmFor in the fidget block; heroCut() (rend crack) in the swing pass; startSwing (run of 5, riposte = cross-chop, his third-cut hint line); swingDmg flurry x0.85; addPoise (one-handed half, his finisher +8); pose chain (leapPose, bzPlunge, bzTake); BZK/CRC apis; his yard's flash comes on his beat.
- src/attack-animation.js: his keys (bzFlurryL/R, bzCross, bzAirSpin) with fallbacks.
- src/chars.js: placeholder keys (Object.assign after ONEAXE).
- src/commit.js: berserker light recovery 0.084 -> 0.06.
- src/controls.js: rows 'take it' HOLD C, 'double chop', 'cross-chop' SWING x5, 'pounce'.
- src/crouch-hint.js: his line 'HOLD DOWN TO COIL. HOLD A WAY AND LET GO: POUNCE.', TOLD -> pounceTold.
- src/riposte.js: PARRY_LOOK.berserker = TAKE IT (raise the crossed axes, hold C; the riposte is the cross-chop).
- src/progression-catalog.js / progression.js: talent and perk words (BLOOD PRICE, SLOW BURN, WIDE CROSS, SPIN CHOP, SPLITTER, WIDE BRACE, BRACED BACK, IRON BRACE, STOUT BRACE) say what the code now does.
- src/level.js: his yard's text (flurry x5, double chop, TAKE IT on the beat, hold for !).
- src/lab.js: BUSY_C no longer counts a raised TAKE IT as busy (it is held).
- scratch/brief-moves.md: his moves-list rows appended.

SEE BELOW for checks, the spot, the art list and the questions.

## CHECKS (PORT 8849, run one at a time)
- **tools/berserker.mjs** (REWRITTEN for the new kit; each changed assertion says why in its header). It checks:
  - the flurry: 1..5 with the 5th the cross-chop; a whiff resets the run; reach 19 (shorter than the knight); the air spin hits 17 px both sides
  - the double chop's poise and the roll
  - TAKE IT: a beat parry (0 lost, riposte window, next cut = cross-chop); held, a 20 blow costs 2 hp, 14 st and +22 rage; a second blow is absorbed; from behind, full; let go, full; red = TOO STRONG; at 1 hp he stays on 1; out of stamina the guard breaks
  - rage drains down to the whetstone's 50
  - the frenzy: quicker, no flinch, x1.25 taken, and the surcharge leaves him on 1; heal-on-hit 2.5%
  - rend: no frenzy, no crack; in a frenzy 9 blows give 2 cracks, both HEAVY and both beast-keyed
  - the throw (one-handed, same moves)
  - the coil: to 75; turns; no way means no pounce; a hit while coiled means no pounce
  - the pounce: hits, knocks a sprig along 35 px, rec, 14 st, 0 hp; a brute stops it; a pit ahead refuses it, never into the pit
  - the whetstone: up to 50
  - all 9 skills, the art keys (new keys included, bare set too), the skin, and the yard (axe, meter, flash): **GREEN**.
- **Green, with the design change and its reason written into the test:**
  - riposte: berserker 36 vs 10 = 3.6. His riposte IS the cross-chop, so his bound is the knight's 3.8.
  - crouch-hint: he is told his coil/pounce line like everyone else. His old special case (WORKING UP) is gone.
  - duck: when coiled, a way only turns him (like the pyro's ward).
  - commitment: REC light 0.06, LIGHT_TOTAL 0.29.
  - lab-reach: LAB_REACH.berserker 20 -> 18, because the flurry lands 19 out.
- **Green, no edits:**
  - knock-into, crouch-a, crouch-b, crouch-feet, slide, ember-flare
  - blow-tags, boss-read
  - hero-trials, ability-poses (69/69)
  - reach-heroes --page (7 known, nothing new: he routes every level with base movement)
  - hint-shown, attack-buffer, finishers, knight-rework, attack-animation
  - talents, skill-passives, elites, order-knights, weapon-skins, dances, mash-gate
  - textfit hints,pick,trial,card,tree,menu,hud --strict: 401 screens, 0 issues
- **RED BEFORE THIS LANE TOO (base 10557fa3, checked in a detached base worktree, not mine):**
  - riposte-shots: "pyro: parried through its real input".
  - geomancer: "no new keys on her set" (parry, ripo from riposteart).
- **MASH (mash-bot, berserker x 2 seeds): 0/10.**
  - stockade: 2 timeouts, the bot never reaches the chief (as in the riposte/knockinto lanes).
  - towpath, ksar, marsh, church: dead.
- **OTHER HEROES' FINGERPRINTS** (hero-keys-strip timing JSON, base vs branch):
  - warden, pyro, pirate and paladin are byte-identical. Paladin is identical when run first in the page; run after three other heroes, his strip shifts by one frame order-dependently, on base too.
  - knight, reaper and geomancer differ base-vs-base run to run (noise, as earlier lanes found). Every shared line I touched is gated on isBz() or reads fields only he sets.

## 3-SEED BOSS SPOT (human profile, campaign level, kit flasks, practiced; NO TUNING)
| Boss | New berserker (LAB_REACH 18) | New berserker (20) | Knight | OLD berserker (base) |
|---|---|---|---|---|
| stockade L3 | 2/3 | 1/3 | 1/3 | 3/3 |
| towpath L25 | 3/3 | 3/3 | 3/3 | 3/3 |
| marsh L3 | 3/3 | 3/3 | 3/3 | 3/3 |
| ksar L39 | 2/3 | 2/3 | 2/3 | 3/3 |
| total | 10/12 | 9/12 | 9/12 | 12/12 |
- The old berserker beat everything. The new one is level with the knight.
- The bot rarely parries (0-1 a fight). Its tapped C now keeps TAKE IT up (it absorbs at 90%), so his bot numbers lean on the absorb, not the beat. The tune lane should watch that.

## ART LIST FOR THE SONNET BARBARIAN LANE (src/chars.js bakeBerserkerHero; every key below is a placeholder alias today, Object.assign after ONEAXE)
1. **bzFlurryL** (lead / bearded axe) and **bzFlurryR** (off / hatchet): 5 frames each, on the attack-animation beats (anticipation, strike + smear, extended, recover, settle). Today: atk / atkB.
2. **bzCross**: the two-axe cross-chop, 5 frames, the run's finisher. Today: atkC. **Also redraw `ripo`** (the riposte strike, 3 frames) as the cross-chop, because his riposte IS the cross-chop.
3. **bzAirSpin**: both axes spinning round him in the air, 5 frames. Today: air.
4. **bzPlunge**: the axes spun under him. Today: plunge.
5. **bzTake**: TAKE IT, 2 frames, crossed axes in front of his chest. Hold, then the absorb shudder; plus a beat flash. Today: block, plus a placeholder arc (berserker.js draw: gold on the beat, orange held).
6. **The pounce set:**
   - **bzCoil**: 2+ frames, low, axes forward, rage glow. Today: grind.
   - **bzPounce**: 2 frames (launch, axes-first extended). Today: dashAtk.
   - **bzPLand**: 1-2 frames, the committed landing. Today: land.
7. **bzWhet**: the whetstone idle dance, 2-4 frames standing, one axe drawn along the other, sparks. Today: grind.
8. **The ONE-HANDED set**: the bare bake (ONEAXE) needs each of the above with one axe.
9. **The RAGE STATE overlay** (rage >= 50 and frenzy): red eyes, steam breath, veins.
10. **REND notches** on the foe (today: red ticks over its head) and **CRACKED** FX.
11. **The new body** (brief 5): fur mantle, bare painted/tattooed arms, braids and beard, leather kilt, trophy/bone necklace, TWO DIFFERENT AXES (bearded axe + hatchet). Keep drink, dances and follow.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **TAKE IT is a HOLD with the shared 0.2 s beat; a tap keeps it up 0.25 s.**
   - At FULL rage a C press is the FRENZY, as before. So at full rage he cannot raise the guard.
   - Rec: keep (built). Alternative: frenzy on DOWN+C.
2. **The POUNCE needs a way held when DOWN is let go.**
   - Letting go with no way just stands him up, so a duck under an arrow or a gust brace never pounces.
   - Rec: keep (built).
3. **What the pounce knocks along.**
   - Only knock-into's SMALL weight; a mid (shield, soldier), a brute, an elite or a boss stops it dead.
   - Rec: keep (built). Alternative: mids slide.
4. **ONE-HANDED is "the same moves".**
   - The double chop is allowed one-handed, at half poise; it was barred.
   - Rec: keep (built).
5. **HEAL ON HIT replaced the frenzy's kill-heal.**
   - 2.5% of every blow; BLOOD PRICE 5% (was 8 a kill).
   - Rec: keep (built).
6. **REND needs a frenzy, and counts only his melee cuts.** The axe throw, the pounce and the roll do not rend.
   - Rec: keep (built), so a mash can never crack.
7. **The WHETSTONE is quiet.**
   - The old WORKING UP growl woke foes within 8 tiles; the whetstone has no growl and no noise. Its cap is 50 (WORKING UP's was 75); the coil keeps 75.
   - Rec: keep (built).
8. **His yard's sword flash now comes on his beat**, 0.2 s before the blow; it was 0.45 s.
   - So "raise the axes as it flashes" teaches the parry, not the absorb.
   - Rec: keep (built).
9. **The lab bot taps C as before (DEFLECTS).** With TAKE IT held, that keeps his guard up and absorbing.
   - Rec: the tune lane decides whether to move him to SHIELDED-style holds or a beat-timed tap.
