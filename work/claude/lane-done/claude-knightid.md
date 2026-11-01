# claude/knightid - KNIGHT identity + 3rd jab + lane C + L25-L50 kit + shared framework (11-01)
Branch claude/knightid (off origin/master 0fe14c26 + claude/skillslots ff75cfdc merged). NOT merged, NOT deployed.
## DEMO-FIRST STATUS (priority change 12:10)
DONE in code and pushed: guard-chain identity, ONE fixed heavy cut, riposte riders + FINISHER, SHIELD BASH third jab (breaks guard), SHIELD RAM (lunge, no i-frames), dash strike 1.8->1.3 (rider = guard break, exists), shield-step dodge stays plain, all knight handicap rows to 1.0, card/trial/tutorial text.
NOT DONE: boss-rate tuning at 1.0 (see rates), textfit, mark-integrity, mash-gate, coop, curve/pilots, hero-trials full play, art. Demo readiness by 11-03 is NOT yet confirmed: the knight has to be re-measured on the demo bosses (Wood 5/5 n=5 too easy, Rootway 0/3 n=3 too hard; 2 fights lost to headless page crashes, which also crash on master for tools/riposte.mjs = environment, not this lane).
## Before / after kit
| | before | after |
|---|---|---|
| resource | RESOLVE bar (blocks, cuts, perfect guard fill it) | GUARD CHAIN 3 links: perfect guard +1, plain held block keeps 3 s, blow taken -1, 4 s idle -1, nothing from cuts (KC in main.js) |
| spender | tap C full = LAST CHARGE | tap C at 3 links = SHIELD CHARGE (same input) |
| hold X | 3-stage heavy (chop / guard-break / knockdown) | ONE heavy: 0.5 s, breaks a guard (CUT_AT/CUT_MUL) |
| big hit | VALIANT (full bar, on a heavy) | riposte FINISHER at 3 links: cut + 2nd heavy blow (lcStrike 1.4), long reach, through duelist walls, spends the chain. 1 link guard-open, 2 shove |
| 3rd jab | heavy shove, same as everyone | SHIELD BASH: kBash pose, goes through a guard, breaks it, boss only BRACED |
| lunge | i-frame dash skill | SHIELD RAM: shield up, no grace, shoves small, a link spent opens a guard |
| dash strike | 1.8x | 1.3x, guard-break rider |
| marks | RIPOSTE, SUNDER, VENGEANCE | RIPOSTE, SUNDER; VENGEANCE text-merged (ids kept for saves) |
## Framework commit
92efc66c (tech cards, save fields, respec, validation, tools/tech-cards.mjs); a hero adds src/tech-<hero>.js + 1 import + 2 rows in progression.js. Note in scratch\knightid-framework-sha.txt. Knight kit data: src/tech-knight.js.
## L25-L50 (built, unreachable in demo)
Techniques: COUNTER-THRUST 25, SHIELD ADVANCE 30, PUNISH 35, LONG GUARD 40, STANDING ORDERS 45 (HOLD C then TAP X; DOWN+C is the low guard), THE LONG CHARGE 50 (RESOLVE-based LAST CHARGE II rewritten for links). 8 upgrades I/II (RESOLVE+ -> IRON LINKS, KEEN GUARD renamed SHIELD TIMING: clashes with the own perk KEEN GUARD).
## Removed handicap rows (all knight -> 1.0)
flotilla TUNE, CAP_HERO, DUEL_HERO closedhelm/lance/gqueen, LP_HERO tollmaster/lampreeve, bzchief hp+dmg, paladin-boss hp+dmg, deacon hp, lance-support dmg, admirals-champion TUNE. Extra rows found: ARCH_TUNE knight (dmg .9, mul 1.22, reseal 1.25 -> neutral), great-drill heroTake 1.05, grubbag heroMul 1.1. Global boss dials NOT re-tuned (needs rates).
## Rates (knight, human+flasks, practiced, 1.0 rows): wood 5/5 (n=5, band 60-70), rootway 0/3 (n=3). No baseline run. Too small to tune from.
## Checks
PASS: tools/knight-chain.mjs (new, all groups), tools/tech-cards.mjs (new), leveling, progression, blow-tags, hero-pass (knight), one-dodge, keys. Updated for the new kit: hero-trials valiant station, hero-pass, audit-audio. RED/unrun: riposte.mjs (page crash, also on master), the rest above.
## Art needed
link notches on the shield rim (3 states + pulse; HUD is placeholder rects), FINISHER pose (reuses valiant), SHIELD RAM pose (shield forward; uses 'lunge'), COUNTER-THRUST thrust pose, SHIELD ADVANCE march, STANDING ORDERS horn/banner, second slam ring.
## QUESTIONS FOR DANIEL
1. Names COUNTER-THRUST/KEEN GUARD clash with Warden's move / Knight's own perk. Rec: rename (STEEL REPLY, SHIELD TIMING built).
2. STANDING ORDERS input: DOWN+C is the low guard, so built as hold C + tap X. Rec keep.
3. Finisher spends all 3 links (choose it or the SHIELD CHARGE). Rec keep.
4. Tech/upgrade levels no longer give a stat pick for the knight (stat cards 34 by L50). Rec keep.
