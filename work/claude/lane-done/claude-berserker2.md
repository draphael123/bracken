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
