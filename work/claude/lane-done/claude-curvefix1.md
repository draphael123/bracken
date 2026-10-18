# claude-curvefix1 (lane C1, CURVE DIALS STEP 1) - READY to merge

## Dials changed (old -> new)
- src/main.js:285 TIER: longwater 1.45->1.5; waymeet 1.9->2.35; towpath 1.9->2.4; church 2.0->2.45; canal absent->2.45; theatre absent->2.5; fair absent->2.55; fields 2.1->2.6; burial 2.25->2.65; witchlight 2.3->2.7; mage 2.35->2.75; unburied 2.1->2.75; fallingtower 2.35->2.8; caravan 2.4->2.85; welltown 2.45->2.9; underwell 2.47->2.95; redgorge 2.5->3.0; glasssea 2.55->3.05; ksar 2.6->3.1; buriedcity 2.65->3.15; sealedpyramid 2.7->3.25. Acts I-II, reef..harbor, off-road ids untouched.
- src/main.js:286 NEW TIER_BOSS = exact frozen copy of the old map (canal/theatre/fair absent = 0); bossTierOf and hitTierOf (after the tierOf line).
  - TIER_BOSS read by: boss/mini hp (the isBoss branch, `trB`, ~2841), xpTierOf (~4266), the boss pressure cap (bpCap fin) and BK.blowRec (~6751/6754).
  - hitTierOf(id, src): the frozen map when the blow's source is the boss or a mini, OR bossActive/miniActive (anonymous arena hazards); else the rising TIER. Used at the hero-blow line (~6885, src = who||updFoe), breathRate, wardStop blood price, takeScale (riposte), parry-break `lands`.
  - Still on the rising TIER: common/elite hp (x1+0.5T), eliteDmg, archApprentice hp, map pips (pips already saturated at 5 from tier 0.25, so no visible change).
- src/foe-react.js ACTS.dmg: III 1.2->1.25, IV 1.25->1.4, V 1.3->1.55 (step 1; cap/mashAt/hp unchanged, no ACTS.hp added - step 2).
- src/boss-pressure.js PRESSURE: act IV 1.45/1.7 mini 1.45/1.7 -> 1.6/1.9 mini 1.5/1.8; act V 1.3/1.5 mini 1.35/1.55 -> 1.6/1.9 mini 1.5/1.8. I-III untouched.
- src/death-cost.js: ACT_STAKE {1:1,2:1,3:1.25,4:1.5,5:1.75}, actStake(act), bankStake(bank, m=1) = min(round(300m), round(0.25m * (bank-500))). main.js deathCost passes actStake of the level's act (same bpActOf/depthsOf the pressure dial uses), x DFM.df('death') unchanged on top. Acts I-II byte-identical; carry rules, flasks untouched.
- tools/curve-shape.mjs (new, static): all campaign levels in TIER + TIER_BOSS; TIER non-decreasing along the needs chain (declared exception undercrown->crown 1.5->1.3, brief says leave); TIER_BOSS == frozen copy; ACTS.dmg, PRESSURE (gap/dmg/mini), ACT_STAKE non-decreasing; stake acts I-II unchanged and 375/450/525; every campaign level in an ACTS act; act TIER means rise (0.39/1.12/1.98/2.58/3.03).
- tools/newlevel.mjs: also warns when a level is missing from TIER_BOSS (canal/theatre/fair exempt, as in the frozen map).
- tools/combat-part2.mjs:90 act assertion: longwater x1.2->1.25, redgorge x1.3->1.55 (design change, step 1).

## Ambiguities resolved (acts I-II unchanged)
- miniActive also counts as a boss fight for the hazard tier (brief says bossActive only); keeps mini-arena hazards on the frozen tier so mini rows do not move.
- Adds/commons hitting the hero DURING a boss or mini fight stay on the frozen tier (old numbers): boss rows do not move; only open-road commons/hazards rise.
- Stake rounds: share 0.25*m (31.25/37.5/43.75%), max round(300m) = 375/450/525.
- Canal/theatre/fair XP unchanged: XP_TIER override still applies on top of TIER_BOSS.

## Checks
- node --check on all touched files: ok. tools/curve-shape.mjs: ok. tools/combat-part2.mjs (PORT 8735, one page, closed): all hold. tools/leveling.mjs: ok (stake asserts at m=1 unchanged). tools/newlevel.mjs: 82 problems = identical to master baseline (none about TIER/TIER_BOSS).
- NOT run (heavy, QUICK gate on the PC): BK.blowRec equal before/after in causeway Kraken / welltown Djinn / fallingtower; boss-rates spot check stockade/hanging/undercrown; tools/death-cost.mjs. Recommend the integ run blowRec + the 3-level n=6/hero spot check from the brief sec 3.

## Rows / tests that will move (for integ / C3; NOT restamped here)
- docs/level1-curve.json (L1 pilot) every act III-V row: re-pilot (TIER not in levelHash, rows will not show stale).
- Act III-V level mash rows and pilot rows (harder commons; canal/theatre/fair x4.7 from tier 0): re-stamp levels, then boss carryRows.
- Elite rows (tools/elites.mjs, ELITETUNE) acts IV-V; Master pilot caravan + fallingtower.
- Dialed act IV-V bosses/minis (PRESSURE): waymeet Crusader+Serjeant, unburied Death Knight+Barrow Rider, mage Archmage+Homunculus, fallingtower Undead Archmage+Sexton, caravan Dune Worm, welltown Djinn+Gang Leader (C3 measures).
- Static/other: tools/leveling.mjs and tools/death-cost.mjs stake rows could gain an act column (not done); tools/balance.mjs reads the rising TIER (informational).

## QUESTIONS FOR DANIEL (rec first; built the rec)
1. Canal/theatre/fair jump from tier 0 to 2.45-2.55 (x4.7 load). Built as briefed. If the walker (C2) shows a wall, fallback is 2.0-2.2 for step 1. REC: keep unless C2 says wall.
2. Should adds in a boss/mini arena also rise with the road (they stay frozen now to keep boss rows still)? REC: no for now, revisit in C4.
