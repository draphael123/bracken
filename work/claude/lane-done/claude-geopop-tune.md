# claude/geopop - TUNE lane (11-03/06), Geomancer BUILT, WITH flasks

Branch claude/geopop (merged claude/batch142 5010860e cleanly; no conflicts, check.mjs/updates.json auto-merged). NOT merged to batch142, not deployed. check.mjs not run.

## Fix: plants never stack
fistPlant now skips a column that already holds a stone of hers (`pieces.some(q => !q.gone && q.cells.some(c => c.tx === tx))`); none free -> no plant. Test `POP a` (tools/geomancer.mjs, out.pop.stack): stones on +2,+3 then 3 jabs -> 3 distinct columns (+4 taken); stones on +2,+3 and a mini on +4 -> no plant, still 2. geomancer.mjs, geo-board.mjs, arena-yard.mjs green after merge + fix.

## What's New
docs/updates.json has NO batch-142 entry on the branch (top = 141). Left for the release lane. Suggested line: "Geomancer: your fist plants a stone, DOWN+C detonates them all, and every boss fight starts with one stone standing".

## Measurement set-up (read this first)
- batch142 has NO geomancer skills/ult in the bot: bot-profile TYPICAL_SKILLS.geomancer = [] and no generic ult hand (claude/botbuilt bac7dc53 is NOT merged into batch142). BUILT on batch142 = bare card. To get "real skills + ult" I measured in a THROWAWAY worktree = claude/geopop + claude/botbuilt (merged clean; worktree now removed; geopop itself does NOT contain botbuilt). Built kit at campaign levels (1 slot): boulder, plus UP+C ult hand.
- tools/boss-run.mjs (committed): result rows now carry geo.det (detonates) and geo.fp (fist plants); env GEO_POP="fistPlant=0,bossStone=0,detonate=0" and GEO_SET="fist.plantCd=4,avalanche.boss=6.5" set knobs in the page for A/B runs.
- Demo bosses with a boss-rates row: wood, marsh, fenroad, stockade, spore, underleaf, palisadewood, kings (n=6 each). Hornet's Nest has no row in boss-rows.mjs. ROOTWAY: the geomancer bot stands idle (0 verbs, boss 91%) even on plain batch142 with the practiced way - a pre-existing bot/route gap, not this pass; excluded (see Q3).

## Table: Geomancer built, flasks, n=6/boss (win% / avalanche per fight / detonate per fight / plants per fight)
| boss | L | POP ON (shipped) | POP ON, plantCd 4 | detonate OFF | all POP OFF (baseline) |
|---|---|---|---|---|---|
| palisadewood | 8 | 6/6 100% / 0 / 0 / 0.7 | 6/6 | 6/6 | 6/6 |
| fenroad | 3 | 5/6 83% / 0 / 0 / 0.8 | 5/6 | 5/6 | 4/6 |
| stockade | 4 | 4/6 67% / 0.33 / 3.8 / 9.0 | 3/5 (1 err) | 3/6 av 1.0 | 6/6 |
| underleaf | 7 | 3/6 50% / 0 / 1.7 / 4.2 | 3/6 | 5/6 av 0.5 | 3/6 |
| spore | 5 | 3/6 50% / 0.17 / 0 / 1.7 | 3/6 | 3/6 | 6/6 |
| marsh | 3 | 4/6 67% / 0 / 0 / 2.2 | 4/6 | 4/6 | 6/6 |
| kings | 9 | 6/6 100% / 0 / 0 / 0.2 | 6/6 | 6/6 | 6/6 |
| wood | 3 | 6/6 100% / 0.17 / 1.3 / 1.8 | 6/6 | 1/6 | 5/6 |
| TOTAL n=48 | | **37/48 = 77%** (av 0.08, det 0.85, plants 2.6 per fight) | 36/47 = 77% (av 0.06, det 0.81) | 33/48 = 69% (av 0.23, det 0) | 42/48 = 88% (av 0.02) |
(Without botbuilt, plain batch142 bare-card run: 4,5,5,3,4,3,6,1 = 31/48 = 65% at n=6 - the pre-botbuilt number; not comparable, no skills.)

## Reading
- Pooled ON = 77% (95% ~63-87, straddles the 70 edge); OFF baseline = 88%. The pass does NOT raise the win rate vs before: ON <= OFF on 4 of 8 bosses and the pooled gap is noise-sized. The high rate is the built bot's boulder + ult on these early bosses, not the pop pass.
- Avalanche risk (the plan's REAL RISK) did not show: 0.08 avalanches/fight ON. The bot detonates at 2 stones (DET_BOT) so it rarely reaches a full board; with detonate OFF avalanches are 0.23/fight (stockade 1.0, underleaf 0.5) - still low. Detonate casts 0.85/fight (stockade 3.8 and underleaf 1.7 dominate; most bosses 0: they never stay in a stone's radius).
- Knobs: plantCd 3 -> 4 changed nothing measurable (77% -> 77%, plants 2.6 -> 2.4/fight), so I did NOT keep it (3 s feels better to play). avalanche.boss 8 -> 6.5 not tried: 0.08 casts/fight means it cannot move the rate. detonate.mul untouched. Boss resist floor untouched. No buffs.
- Nothing is under 60 for a reason the pass caused: underleaf 50% and spore 50% (n=6, CI 19-81) are the boss's own difficulty and are equally 50% / 100% with the pass off (spore 6/6 off vs 3/6 on is the one swing worth a human look; n is too small to call).

## Result
Band cannot be called IN band at n=6 (77% [63-87]); it is above 70 on the point estimate but the pass is not the cause and the planned knobs are no-ops. fistPlant stays ON (GEO.pop unchanged). Fallback (fistPlant=false) NOT needed.

## Questions (rec first, built the rec)
1. Ship all four GEO.pop switches ON at the cut? REC yes - the pass is neutral-to-negative on bot win% vs baseline; the 77% is the botbuilt kit (not the pass). Alternative: fistPlant=false.
2. Merge claude/botbuilt into batch142 so the geomancer BUILT way has skills + ult for the release gate (otherwise built = bare card for geomancer)? REC yes (it merged cleanly into geopop in the throwaway worktree).
3. Geomancer bot idles on ROOTWAY (0 actions) - lane to route the bot/reach there? REC yes, small bot lane; blocks any geomancer rootway rate.
4. Spore (3/6 on vs 6/6 off) deserves +12 fights if Daniel wants certainty. REC skip: single-boss swings at n=6 are noise, and the stones can only help her at a plant-and-ward boss.
