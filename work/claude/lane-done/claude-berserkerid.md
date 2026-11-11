# claude/berserkerid - THE BERSERKER'S IDENTITY PASS (Daniel 10-31 18:07 Q6/Q8/Q10/Q11/Q12 + 11-01 jab combo, slots)

Branch claude/berserkerid off master 0fe14c26, merged claude/skillslots (ff75cfdc, one slot / 2nd at L30) and claude/knightid's CARD v2 framework (92efc66c, merge 9e74d8cc: no conflicts).
Status: BUILT, gameplay checked in the real page (tools/berserker-identity.mjs). Boss rates: see the table (RATES_STATUS).

## BEFORE / AFTER KIT

| piece | before | after |
|---|---|---|
| hold X | 3-TIER LADDER: overhead chop -> whirl (cuts behind) -> ground-splitter (floor shockwave), 6/12 extra stamina | WIND-UP COMMIT: ONE overhead chop. Committed at 0.36 s of wind (x0.8 with rage, x0.65 in a frenzy): ARMOURED (no flinch), cannot TURN (facing held), cannot STOP (creeps on 46 px/s). Size 0..1 over the next 0.84 s: damage x1.0..1.5, reach 21..33 px, poise x1..1.7 (rage x1.25 as before), +10 stamina at full. OVERCOMMITS: 0.30..0.50 s of recovery. Goes by itself at full + 0.7 s. |
| run-ender (5th blow) | CROSS-CHOP: 23 out, 2 behind, recovery 0.12 s, swing x0.82 | WIDE SLOW CLEAVE (Daniel 11-01 jab combo): 36 out in front, 12 behind (SPIN CHOP: 36 behind too), 34 tall; swing x0.6 (told: ~2.3x the chop's real time), recovery 0.34 s. Same x1.5 blow, shove and poise. |
| dash strike | 1.7x, no rider | 1.3x (Q5), RIDER = SHOVE: every small foe it meets is put aside (shoved 0.6 s, staggered); never boss/mini/elite/big. Barge (dodge) untouched: still the one damaging dodge. |
| AoE cost | spin 22, cleave 28, storm 40 stamina | spin 25, cleave 30, storm 45; rage pays back: half a bar -20%, full bar or frenzy -40% (25/20/15, 30/24/18, 45/36/27). Rampage 30 unchanged (not AoE). |
| "do not die" | LAST STAND (active) + UNBOWED (passive, L24) + SCARRED (passive, L9) | LAST STAND only (4 s). UNBOWED and SCARRED DELETED from the catalog. |
| heal | frenzy 2.5%/blow (5% BLOOD PRICE) | unchanged = his ONLY heal. |
| marks | SPLITTER | unchanged (one mark). |
| handicaps | flotilla TUNE 1.3/0.8, CAP_HERO 0.7, CAP_OPEN 1.1, bzchief heroHp 0.69 / heroDmg 0.95 | all 1.0 (see below). |
| L25-L50 | none | 6 techniques + 8 ranked upgrades on CARD v2 (src/tech-berserker.js). |

### L25-L50 (src/tech-berserker.js; one import + two rows in src/progression.js)
25 AXE CATCH (UP+C as the recalled hatchet arrives: +20 rage, it flies again free, k 0.8) / 30 WARCRY CHARGE (hold C at full rage, tap X: poise off everything within 90 px, half the bar, no flinch 2 s, cd 14 s) / 35 RECKLESS BLOW (frenzy: the wind-up chop x1.25 for 4% max hp, floored at 1) / 40 CHAINED RAGE (a kill in a frenzy +0.5 s, 6 s per frenzy) / 45 BERSERK LEAP (let a committed wind go while holding UP: leap, lands in a 60 px split k 0.7, +12 stamina) / 50 UNBOWED RAMPAGE (tap C at full rage during LAST STAND: 4 s quicker, x1.25 on chops, then 6 s taking x1.25; LAST STAND's grace is held to 2 s by the capstone law; cd 40 s).
Upgrades I/II: STOKED+ (rage +10/20%), TAKE IT+ (+0.03/0.06 s beat), SPLITTER+ (+15/30%), COOL (skills -0.5/-1 s), THICK SKIN+ (frenzy cost -5/-10 pts), AXE STORM+ (5th, 6th hatchet +20%), WIND-UP+ (reach +20/40%; was GROUND-SPLITTER+), BLOOD PRICE+ (frenzy heal +25/50%).

## REMOVED HANDICAP ROWS (Q11, all of his)
src/flotilla-boss.js TUNE.berserker {1.3, 0.8} -> {1, 1}; src/main.js CAP_HERO.berserker 0.7 -> 1, CAP_OPEN.berserker 1.1 -> deleted; src/bzchief.js heroHp.berserker 0.69 -> 1, heroDmg.berserker 0.95 -> 1. Searched every `heroHp|heroDmg|heroTake|DUEL_HERO|LP_HERO|LANCE4|GDG` table: no other berserker row exists.

## RATES (human profile, WITH flasks, campaign level, practiced, berserker only, handicap rows at 1.0) - run 11-01 under heavy RAM load
Page crashes in the table are memguard kills (free RAM under its floor), not game crashes; they are excluded from n. I stopped browser runs at the coordinator's note (Berserker is not a demo hero; demo lanes first).
| boss | L | wins / n | band | read |
|---|---|---|---|---|
| Warcairn (Chieftain) | 21 | 5 / 10 (+3 timeouts at 240 s with 2-8% boss left, 1 death) | 60-70 | LOW (50%); the timeouts are a damage-rate shortfall, not deaths: ~+10% damage into his openings would land it. Old 0.69 hp row hid this. |
| Admiral (flotilla) | 24 | 8 / 8 (4 crashes) | 60-70 | HIGH (100%): the 1.3/0.8 row was the only thing holding him back; the flotilla boss's own dial (not a hero row) must come up, then the other 8 heroes' TUNE rows re-read. |
| Hurricane Captain | 25 | 4 / 11 (1 crash) | 60-70 | LOW (36%): CAP_HERO 0.7 was helping him; deaths at 1-18% boss left. Captain's global take dial -10% would fix berserker, but moves 8 other heroes. |
Not run (time/RAM): Frog King, Old Tusker, dry rows, n>=12 clean. NOT tuned: no table touched back (Q11 rule), no global dial moved (it would shift every other hero's calibrated row) - needs ONE tune lane that re-reads all 9 heroes per boss.

## CHECKS
Green: tools/progression.mjs (181 nodes, 36 legacy fixtures, so UNBOWED/SCARRED removal migrates: unknown ids are simply off), tools/tech-cards.mjs, tools/coop-progress.mjs, tools/mash-gate.mjs (53 levels), tools/curve-shape.mjs; tools/curve-gate.mjs ok (stale rows fallingtower/flotilla/hurricane/underwell predate this lane). In the real page, tools/berserker-identity.mjs: flurry run 1..5, wide cleave (36 front / 12 back, 49 vs 21 frames, 0.34 recovery), wind-up armoured + sizes grow (dmg 54/61/69, reach 29/35/41, recovery 0.30/0.41/0.50), AoE costs 25/20/15, 30/24/18, 45/36/27, dash 1.3 + shove, all six techniques fire (catch, warcry, reckless 4.1%, chained, leap, rampage+debt). Two asserts failed (cannot-turn; poise at full wind reads 0 because the bar BREAKS) - both fixed afterwards (faceLock + no-friction creep; test counts a broken bar) but NOT re-run (browser stopped for RAM). RE-RUN FIRST: node tools/berserker-identity.mjs, then tools/berserker.mjs (old tool, ladder block removed; its page crashed twice at the memory floor before it was split in two), hero-trials.mjs, textfit.mjs (3 new hint lines + trial lines + hero card), hero-keys-sheet, mark-integrity, one-dodge, co-op browser tools, pilots, mash 0/6.
Merge notes: CAP_HERO line (main.js), flotilla TUNE line and progression.js import/rows are single lines the Knight lane also edits: expect trivial conflicts.

## DEMO
Berserker is NOT in the demo (starters knight/warden/geomancer/ranger + pyro; he is bought via the Warcairn spur). Nothing here touches the demo sha; ships after the freeze.

## WHAT AN ART LANE MUST DRAW
Committed wind-up crouch with armour shimmer + an ALL IN (full wind) pose (today reuses the old ladder's bzWind2/bzWind3); the release chop at three sizes (today one pose); the WIDE CLEAVE (today wears the old WHIRL frames bzTier2: full turn, axes out level); overcommit recovery pose; stamina-cost flash on SPIN/CLEAVE/STORM icons; AXE CATCH ring; WARCRY shout pose; BERSERK LEAP (jump up + land crouch); UNBOWED RAMPAGE aura and the DEBT tint; icons for the 6 techniques.

## QUESTIONS FOR DANIEL (recommended answer first; built as recommended)
1. Jab "3rd hit": I kept his run at FIVE and made the 5th (run-ender) the wide slow cleave. Make it literally the 3rd (L,R,cleave)? REC: no - keeps the flurry rhythm.
2. Bosses off-band at 1.0 (Warcairn 50%, Admiral 100%, Hurricane 36%): REC one TUNE sonnet lane re-reading all nine heroes on those three bosses and moving the boss dials, not hero rows.
3. UNBOWED RAMPAGE holds LAST STAND to 2 s more (capstone law) rather than the brief's 4 s. REC keep.
4. Wind-up creep can walk him off a ledge while committed. REC keep (it is the commit); say if you want it to stop at edges.
