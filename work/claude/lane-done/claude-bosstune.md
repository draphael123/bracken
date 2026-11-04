# BOSSTUNE (11-04) - PARTIAL, stopped on the coordinator's order (gate143 needs the RAM). Branch claude/bosstune off claude/geofix 1f6422ae. Not merged, not deployed.
Worktree bracken-bosstune. Commits: bosscheck bot tools cherry-picked (ec971530, 47f9d837); "bot fix 1" (warden/Gorm + tools/bosstune-probe.mjs); one WIP commit holding the UNFINISHED boss HP numbers below (they are experiments, NOT verified - a fresh lane should re-measure before keeping any). No check.mjs, no demo-cut/demo-floats run (owed). All raw logs: scratch/bosstune-logs/ (base-geo.log, t1.log, t2.log, t3.log (partial), sum.mjs = hero x row table from a log).

## 1. BOT FIX 1 - warden skill hand vs King Gorm (DONE)
Cause: the javelin hand, not Gorm. Probes (warden, kings, built, n=6, kit flasks): as found 0/6 (javelin 37 casts a fight); hand yields while gormHands has a goal 0/6; hand casts only into openings 1/6 (more casts, MORE damage taken); NO casts (BK_KIT=none) 4/6; bare practiced 6/6. A javelin cast costs the stamina and the opening Gorm's plan needs. Fix in src/lab-perceive.js makeSkillHands: `if (boss.t==='king' && h==='warden') return;` after the ult hand (knight slam 5/6 and pyro meteor 6/6 are fine, so hero-specific). Residual: built warden 4/6 vs bare 6/6 = the built card (typicalCard) costs ~2 wins; not a game problem. Real finding for balance: warden Javelin is a net loss vs Gorm.

## 2. BOT FIX 2 - geomancer never engages Rootway (NOT REPRODUCED on geofix)
Per-second trace (tools/bosstune-probe.mjs rootway geomancer N practiced|built) shows her engaging (taken 37-120, boss HP falling); built n=6 = 5/6 wins (boulder 161 casts). The bosscheck "STUCK" was batch143's knee stone blocking her (geofix made stones hero-passable). No bot change needed.

## 3. Geomancer re-measured on geofix (built, n=6, kit flasks, base HP numbers)
wood 6/6, hornetsnest 6/6, marsh 5/6, fenroad 6/6, stockade 6/6, spore 6/6, rootway 5/6, underleaf 2/6 (33% - under floor), palisadewood 6/6, kings 5/6, burning 6/6. Stone Skin removal did not weaken her: she is 100% on most bosses and pushes pooled rates up; underleaf is her only floor failure.

## 4. Baseline table (before; non-geo = bosscheck on batch143, geo = this lane; kings warden = after bot fix 1). knight/warden/geo/ranger/pyro
wood 5/6/6/6/5 =28/30 93% | hornetsnest 4/6/6/5/6 =27... (geo 6) 28/30 93% | marsh 5/4/5/5/5 = 24/30 80% | fenroad 3/4/6/5/5 = 23/30 77% | stockade 4/2/6/5/2 = 19/30 63% | spore 6/6/6/5/4 = 27/30 90% | rootway 6/5/5/3/6 = 25/30 83% | underleaf 2/1/2/5/6 = 16/30 53% | palisadewood 6/6/6/6/6 = 30/30 100% | kings 5/4/6/5/6 = 26/30 87% (bosscheck had warden 0) | burning 6/6/6/3/2 = 23/30 77% (geo 6 = same)

## 5. Tune experiments so far (HP numbers; n=6 each, built, 5 heroes; kn/wa/ge/ra/py)
| boss | base HP | try | result |
|---|---|---|---|
| Frog (marsh) frog-king.js:30 | 650 | 800 -> 77% (5/5/5/2/6); 900 -> 67% (3/5/4/4/4) | IN BAND at 900; floors ok (kn 3/6) |
| Bog Troll (fenroad) bog-troll.js:29 | 680 | 800 -> 70% (4/2/6/5/4) | IN BAND pooled; warden 2/6 under floor (n=6 noise?): re-measure n=12, if still low ease warden or 760 |
| Spore Mother mother-cap2.js:22 | 1150 | 1400 -> 83%; 1550 -> 80% (4/5/6/4/5); 1800 -> run cut (kn 2/5 so far) | weak slope until ~1800; target 75: 1700-1800 |
| Rootway huntmaster.js:26 | 1080 | 1200 -> 50%; 1130 -> 57% (3/2/4/2/6) | CLIFF: 1080 = 83%, 1130 = 57%. Planned 1095 (untested); heroes die 10-30% left, melee/ranger swing hard, pyro 6/6 always |
| Palisade battering-beast.js:45 | 960 | 1300 -> 90%; 1800 + rest [0.35,0.2] (was [0.5,0.3]) -> 67% (2/5/5/2/6: kn+ra under floor; pyro wins slow at 230 s); 1700 + rest same + py.hurt 0.85->1.0 -> partial 20/30 67% (3/3/6/3/5) | in band pooled, floors OK at 3/6 (n=6 noise). Keep 1700 + these, confirm n=12 |
| Gorm gorm.js hp1/hp2 | 1000/1400 | 1250/1750 -> 67% (5/4/5/2/4; ranger 2/6 under floor) | pooled in band; ranger floor to re-check n=12 (was 5/6 at base) |
Working tree holds: frog 900, troll 800, spore 1800, rootway 1095, palisade 1700 + rest + py.hurt, gorm 1250/1750.
Lesson: a boss' margin is thin and cliff-like (heroes die at 5-30% left); +4% HP moved Rootway 83 -> 57. Use n=12 near the end, small steps.

## 6. NOT STARTED (exact next steps)
- Chieftain (stockade, 'chief' EHP 530, stockade-hands.js CAP{blow .12,window .25}, HORN, CRUSH open 2.8, TOWER take .5): warden 2/6 and pyro 2/6 (<40%), geo 6/6, pooled 63%. Plan: probe warden/pyro deaths (node tools/bosstune-probe.mjs stockade warden 1), then lengthen CRUSH.open / HORN.open a little (+20%) and trim geo/ranger (a hero-agnostic HP nudge) to keep pooled <=70; target every hero >=3/6.
- Underleaf (Potion Master, potion-hands.js GM: hp 1600, open1/open2 3.2, purse .11, dmg table): knight 2/6, warden 1/6, geo 2/6 under floor; ranger 5, pyro 6. Probe knight/warden deaths; levers: GM.open1/open2 +25%, GM.dmg -15%, GM.hp -10%, purse .11 -> .14; goal pooled 60-70 with every hero >=3/6.
- Pyromancer (burning; main.js EHP pyromancer:1700, pyro-boss.js WARD/OPEN_MUL/STOKE/WIND): pyro 2/6, ranger 3/6, pooled 77-80%. Fire hero vs her fire ward: check WARD.scorch on a pyro striker and Fire Wall vs takeMul (floor 0.4); lower hp 1700 -> ~1900 only after pyro floor fixed; ease scorch/ward for pyro.
- Lumber, Hornet Queen: leave (93%, 93%; every hero >=4/6).
- bare/practiced beside built ONLY on Gorm, Underleaf, Chieftain, Pyromancer (not run; Gorm warden bare 6/6 only).
- Commit each boss separately with before/after, then run demo-cut + demo-floats + per-boss node checks (not run yet), n=12 on borderline cells.
- Check no tool/doc asserts the old HP numbers (grep docs/*.json, tools/*boss*).

## Questions for Daniel (rec first)
1. Gorm warden: accept 4/6 built (card cost) vs 6/6 bare? REC: yes; do not retune Gorm for it.
2. Rootway band 75 is a cliff (83 at 1080, 57 at 1130): accept 70-83? REC: yes, ship 1095 only if n=12 reads 65-80.
3. Geomancer is ~100% on every boss but Underleaf: tune bosses on the pooled mean (floors will hold) or nerf her? REC: tune bosses; leave her.
