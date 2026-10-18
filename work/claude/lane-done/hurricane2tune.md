# claude/hurricane2tune (sonnet, 10-17): HURRICANE DECK 2 tune lane
Base origin/claude/hurricane2art 218fe060. Only src/main.js, src/redraw/pirates.js, src/marks.js (re-flowed by tells --write), tools/blow-tags.mjs (one assertion), tools/hurricane2art-sheet.mjs (frame names) and the hurricane stamp rows in docs/ changed. No level.js edit.

## 1. THE FRONT-GUARD FINDING (B15: never below 0.4)
The wall (0.4 into his front) and the ward (0.4) were read from a TAGGED blow only, and three things walked round them:
1. **A poise BREAK or a parry's riposte window.** The wall line was skipped on `!GB.openOf(e)`, and openOf is true whenever `e.broken > 0` or `e.rpOpenT > 0`. So a heavy hero broke him and then everything landed whole, INSIDE HIS WARD too: the ward line only ran from behind, and the break then x2 + the finisher x1.5 (a 99 blow in his ward landed 333, x3.4). This is the warden's heavy and the paladin's maul. Fix: `wallOpen(e)` (captain: his OWN openings and his ward only); the ward now takes 0.4 from every side and a break pays x2 on top of the wall, not instead of it.
2. **Untagged hero skills** (the pyromancer's ALIGHT trail, flashover/firestorm, holy ground, ...) call hurtEnemy bare, so `blow` was null and the wall never ran: the pyro's untagged hits landed at ~2.5x. They now answer to the same angle, 0.4 into his front, 0.4 in his ward, whole round or over. The room's own blows still land whole (boss-greed's room-blow check holds): the rule only reads while a hero's own update runs (`HERO_HAND`).
3. **A burn tick** (wardedDamage, no blow) met neither: it now takes 0.4 (a tick of 2 is 1).
Fire, ranged ('shot' tags already went through the wall) and pierce are the same wall now. This gap is in every wall duelist (Lance, Waymeet Paladin, Quartermaster use the same `!GB.openOf(e)` skip): NOT changed here (their rates are tuned), see questions.

## 2. RATES (campaign L20, profile human, with flasks, 24 seeds a hero; the first 12 in brackets). Deterministic: the same seeds and code give the same fights.
| hero | before (hurricane2 / measured here) | after |
| knight | 6/12 | 17/24 71% (8/12) |
| warden | 12/12 | 17/24 71% (8/12) |
| pyro | 7/11 | 16/24 67% (7/12) |
| ranger | 7/12 (measured on 218fe060, not measured before) | 16/24 67% (9/12) |
| paladin | 8/12 (measured on 218fe060) | 16/24 67% (9/12) |
Overall 82/120 = 68% (first 12: 41/60 = 68%). Dry not re-measured. Mash boss 0/6 (boss left 85-97%); the level mash fails every hero.
Knight and warden sit a hair over 70% at 24 seeds (8/12 = 67% on 12); the walls of the band are ~+-12 points of noise at this n.

## WHY THE WARDEN COASTED
She was not being hit. In a fight she drew 3-6 sabre cuts to the knight's 17-20 (he only cut inside 52 px; her spear and javelin fight from 50-340 px), and the few cuts she drew she deflected: every deflect is an opening, and her run-through heavy in an opening pays 200+ a hit (plus the break bug above). Took 142 a win to the knight's 290. What I did:
- **The sabre now lunges** (it starts at 84 px and he steps in during the tell, CAP2.sabreFrom/step), so a kiter is not free.
- **One opening is a slice of him, not a kill** (CAP2.openCap, 9% of his health, then he GATHERS HIMSELF and the rest lands at 0.4): the burst heroes emptied a fifth of him in one flat. Same as the Coffin King's window / miniCap.
- A turned cut opens him 1.4 s (was 1.6).
- The rest is her kit, not a bug, so PER-HERO (the cause is unfixable: it is who she is): `CAP_HERO` scales his blows on the hero (knight 0.77, paladin 0.88, warden 1.45, pyro 1.05, global BOSS_HIT 1.2 -> 1.07) and `CAP_OPEN` scales what an OPENING pays (knight 1.5, paladin 1.1, warden 0.65). Both leave the wall exactly 0.4 (B15 floor, boss-greed's equality) for everybody.

## 3-7 THE REST
- **BEACHED reworded**: plate THE CAPTAIN  KNOCKED FLAT; WALL_HINT ...KNOCKED FLAT, HE IS OPEN.
- **Frame 12 deleted** (the old kneeling frame; nothing drew it). The Captain's sheet is 19 frames; main.js's frame map and the sheet's names were renumbered (held 12, brace 13, struck 14, keg 15/16, turned 17, flat 18); a sheet render checks them.
- **STAMPED**: level-quality hurricane pilot + curve + mash level, then mash boss (docs/level1-pilot.json, level1-curve.json, mash-bot.json); level-quality CLEARS THE BAR, no stale row. Tells: the Captain's call '!' (teal, a blockable-looking mark over no blow) is now the narration HIS WHISTLE in teal, so no mark lies; `tells --write` re-flowed the marks table (src/marks.js, reflow only; all 428 tells agree).
- **Q6 (the deck rail), NOT fixed**: it is `rail(53, 546, 19)` in level.js, a one-way T.RAIL row ON the deck (hull top is row 20). Standing on the hull you walk through it; after a jump you land on its top, one row (16 px) up. It is also the drawn bulwark rail strip, so deleting it loses that strip's look and moves the level hash. Rec: move it into the art (a deco row, no tile) in a level-art lane.

## CHECKS (targeted, one page at a time, --jobs=1)
Green: level-quality hurricane, tells, boss-read, blow-tags (one source assertion updated to the new `wallOpen(e)` form + a new one pinning it), boss-greed, boss-openings, storm-ship, storm-ship-runtime, solid-islands, floating-geometry, floaters, comments, corpses, node --check. textfit has no hurricane scope (0 screens, as before). Not mine and red: mash-gate says undercrown and church are stale (other lanes). Not run: the full suite, rule-openings (red on master), mark-integrity.

## QUESTIONS FOR DANIEL (rec first)
1. The wall duelists (Lance, Waymeet Paladin, Quartermaster) keep skipping their wall and ward while a poise break or riposte window is open (the same `!GB.openOf` skip). Rec: apply `wallOpen` to them in a boss-tune lane with a re-measure; I left them (tuned numbers).
2. Per-hero tuning (CAP_HERO / CAP_OPEN) is the honest lever for the warden (she is hit rarely by design). Rec: keep; it is two small tables. The alternative is a harder Captain for everyone.
3. Q6 deck rail, as above. Rec: art lane.
4. The knight and warden are at 71% on 24 seeds (67% on 12). Rec: leave; a coin more in either direction flips them.
