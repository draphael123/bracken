# HEROPACKS lane report (11-05, code only, unattended) - three branches, nothing merged or deployed, NO browser opened
Disk: C: was 100% full on arrival (1.8 GB free); I removed three clean MERGED worktrees (bracken-geoid, -knightid, -beast3: only untracked tmp dirs) per the disk-cleanup rule to fit two new ones. ~2.9 GB free now - clean more before a suite.
Base note: claude/bkrework and claude/stonewall do NOT contain the fork framework (it lives on claude/ltfork, unmerged), so claude/bkpack and claude/geopack each = their base + a merge of claude/ltfork (framework only, no Knight fork pack). When kfork lands, tools/tech-cards.mjs may conflict trivially (kfork replaced the synthetic test pair).

## 1. claude/bkpack  (= claude/bkrework c54d8309 + claude/ltfork + the kit)
BLOOD KNIGHT (hero id 'reaper') L25-L50: 3 fixed techniques, 3 pick-1-of-2 forks, 8 ranked upgrades. Files: src/tech-bloodknight.js (data), src/bk-tech.js (numbers + pure rules), main.js hooks beside the bkrework blood code, blood-kit.js (optional params), progression.js (1 import + 2 rows), tools/bk-tech.mjs.
Brief premises changed by bkrework (I followed the build): CRIMSON FRENZY is gone (RED REQUIEM + 8 s HEMORRHAGE is the ultimate) so BLOOD ECHO rides HEMORRHAGE and the capstones reshape/replace the Requiem; the third cut is DEBT DRAIN (the lash); debt caps at 40% (not 60%).

| L | technique | input | k / cd | what |
|---|---|---|---|---|
| 25 | REAP THE BLEED | REND (T1) on a bleeding foe | 1.2 x share of bleed left (min 0.34) | pops the bleed as one heavy blow before the REND re-bleeds; boss: damage only |
| 30 A | CRIMSON REACH (control) | the third cut | no extra k; far end of the whip x0.5 | lash 24 -> 120 px, hooks up to 3 small foes (never boss/mini/heavy) into a heap 12-26 px before him |
| 30 B | WARD LANCE (defence) | let go of the blood ward | 0.6 + 6 x chip/maxHp, cap 1.6 | pierce lance (T3-crescent wave sprite, 0.8 scale, 430 px/s) with the blood the guard drank; empty guard = no lance |
| 35 | PLANT THE BLADE | HOLD DOWN+C 0.6 s | cd 25 | 6 s rite r120: foes bleed; him inside: debt drains 2x, health back capped 3% max hp per plant. TAP DOWN+C is still BLOOD PRICE (with the technique owned the tap resolves on release) |
| 40 A | PAY IT FORWARD (offence) | UP+C, debt >= 30%, VITAE not full | 0.8 + 2.4 x debt/maxHp (1.76 at the 40% cap), cd 14 | spends ALL debt as a 200 px piercing red wave (scale 1.7); burned, no heal |
| 40 B | MORTGAGE (risk) | DOWN+C twice within 0.8 s | cd 8 | 2nd BLOOD PRICE of 17% max hp as more debt; next 3 swings x1.4; no heal (brief said hold DOWN+X: that key is the low sweep, so I used the double-tap, Q2) |
| 45 | BLOOD ECHO | every rhythm cut in HEMORRHAGE | 0.4, 0.25 s later | red afterimage hit (light blow), reclaims nothing |
| 50 A | REQUIEM UNBOUND (capstone) | UP+C at full VITAE (the Requiem) | nova k 0.9 r92, cd 40 | HEMORRHAGE +0.4 s per blow on a branded foe (cap 12 s), ends in a nova; he takes x1.25 damage throughout |
| 50 B | THE RECKONING (capstone) | UP+C at full VITAE (replaces the Requiem cast) | cd 40 | 8 s: every blow he takes (incl. blocked) bleeds its attacker for 0.8x over 2 s (4 light ticks, cap 6 sword-hits per foe per cast); debt does not drain; the end repays HALF the debt as health, burns the rest, feeds no vitae |

Upgrades (8, all wired): BLADE DRINKS+ (2 notches / notch lasts 20 s), DEEP LASH (+1 s bleed / marks), GUARD BLOOD (ward drinks -20% / -33%), LONG DEBT (+1/+2 s hold), WIDE CRESCENT (T3 wave +20/+40%), WELL OF BLOOD (RED GROUND +20/+40% life), THIN BLOOD (BLOOD MAIL cd -15/-30%), LAST DRINK (killing a bleeding foe +10/+20 vitae). Dropped from the brief: KEEN HEAVY (a guard rule for the foe pass), CRIMSON PARRY+ (the parry window is the shared one in the rework).
Both capstones carry capstone:true and a 40 s clock (P.bkCapCd). A fork cannot be deferred (framework).
Law kept: every blow swordDmg x k (bkDmg, skill multiplier only), bosses take damage + resist floor (no stagger/pin added; the lash hook and the nova stagger skip bosses), no heal added (Plant <= 3% per plant; the Reckoning repay is the debt's own reclaim), one hit-stop per cast, FX dice are Math.random on particles only.

Node results: node --check main.js / progression.js / blood-kit.js / bk-tech.js OK. tools/bk-tech.mjs PASS (data shape, pair roles + shared trade + capstone pair, every rule with real numbers, upgrade + technique ids wired in main.js, blood-kit hooks). tools/tech-cards.mjs PASS, tools/progression.mjs PASS, tools/coop-progress.mjs PASS, tools/keys.mjs ok. tools/ability-law.mjs does not exist on this branch (the pair asserts live in bk-tech.mjs). Not run (open a browser): tools/blood-kit.mjs, hero-keys-sheet.

Browser owed: tools/blood-kit.mjs and the BK suites (blood guard/lash/tiers unchanged with every tech() false), textfit (new names/what/teach/trade lines, HUD labels 'UP+C  PAY FORWARD' / 'UP+C  RECKONING'), hint-shown (new MOVE_WORDS), hero-keys-sheet, a LOOK at every tell (hook line, lance, rite on the floor, forward wave, echo, nova, Reckoning), a real-key check that the deferred DOWN+C (tap = price on release, hold = plant, 2nd tap = mortgage) feels right and never swallows a price, and that UP+C picks Requiem > Pay It Forward correctly. Co-op: tech ids are not in the partner hero snapshot yet (the partner will not draw the rite/hook line); AI companions never read tech().
Art owed: all placeholder: rite = flat red ellipse + spokes + a stuck sword rect, hook = a red line, forward/lance reuse the CRESCENT sprite scaled, echo = blood bursts only (no true afterimage pose), no capstone preview clip, no yard TRY station, no controls-card rows, no new SFX (reuses bkLash / bkRequiem / bkToll / dkNova / squelch).
Boss-rate impact (for the tune lanes; no win-rate run): 25-45 techniques are small (REAP/ECHO/MORTGAGE damage-with-conditions; LANCE/PLANT/REACH control). The capstones are the large ones: UNBOUND can hold HEMORRHAGE (x1.25 blows, all of them drink back, unflinching) up to 12 s instead of 8 and ends in a 0.9 nova, for +25% damage taken - roughly +15-25% burst in that window on bosses, once per 40 s; RECKONING is the safety capstone: up to 50% of 8 s of taken damage (<= 20% max hp) repaid. BK is the sustain outlier: re-run hurricane (12/12), the mirror duels and the Barrow Rider (1/4) before anyone calls these tuned. PAY IT FORWARD burns debt that would have been reclaimed: sustain traded for burst by design.

Questions (rec first, none block):
- Q1 RECKONING repay: rec 50% (built); alt 100% as the brief says ('repaying all debt at once') = up to a 40% max-hp heal, too much for the 60-70% band.
- Q2 MORTGAGE input: rec double-tap DOWN+C within 0.8 s (built, no new key); alt hold DOWN+X per the brief (collides with the low sweep).
- Q3 PLANT THE BLADE shares DOWN+C with BLOOD PRICE: rec tap = price (on release when PLANT is owned), hold 0.6 s = plant (built); alt put PLANT elsewhere.
- Q4 CRIMSON REACH far-end damage: rec x0.5 beyond the steel (built; brief: position control only); alt full damage.
- Q5 40 s clock on UNBOUND too (HEMORRHAGE stretching would otherwise let the vitae refill alone gate it): rec keep.
- Q6 AI companions: rec take no BK techniques (they never read tech()).

## 2. claude/geopack  (tip 8d208ee05; = claude/stonewall 43a4fbff + claude/ltfork + the kit, built by a Sonnet sub-agent of this lane; its full report is scratch\lane-reports\geopack.md)
GEOMANCER L25-L50: SLINGSTONE, TOPPLE / STONE STEP, SEISMIC WELL, SHATTER RECALL (the L40 'bigger recall that shatters stones on arrival', NOT the retired Stone Skin) / CAIRN, GEODE, THE GREAT FAULT / THE STONE HOST (both capstones spend her board on UP+C at a full board, 40 s clock, and replace MOUNTAIN COLLAPSE once picked). 9 upgrades (TREMOR FLOW + WIDE QUAKE dropped: no TREMOR bar since geoid / breaks the avalanche parity). New files src/tech-geomancer.js, src/geo-tech.js, tools/geo-tech.mjs.
Node: geo-tech.mjs PASS (14 fake-world checks), tech-cards PASS (new geomancer kit check), progression PASS, coop-progress PASS, node --check clean. Browser owed: geo-board, geomancer, textfit, hint-shown, popclutter on the fault/host, a look at every tell, a real-key check that UP+C / DOWN+C do not collide, co-op tech-id snapshot. Art owed: sling, slab, well, crystal, fault fronts, host golems (flat-colour primitives).
Boss-rate note: a capstone pick CUTS her boss burst ~90% vs MOUNTAIN COLLAPSE (about 2.4 swords vs about 24): the tune lanes must settle it (her Q1 rec: pull the collapse's boss k toward the law).

## 3. claude/palsmite3  - ALREADY BUILT on claude/palsmite (62ef43ba, master 42a1d4cd merged in, browser-proofed 'MERGE-READY = YES' in palsmiteproof.md). palsmite3 = palsmite + gap fills only, made as a branch inside the idle bracken-palsmite worktree (saves 1.3 GB of disk):
- Gap 1: the HEROES paladin blurb did not mention the smite -> one clause added ('the third cut is a told holy SMITE: it staggers and builds Conviction').
- Gap 2: no node-only guard on the numbers/rules -> tools/pal-smite.mjs (PASS): HG.smite3 within Daniel's wording (stagger <= 1 s vs the old 1.2, boss stagger <= 0.4, chip <= 0.5, Conviction <= 1 pip) and main.js read as text (plain third ground cut only; Conviction once per swing; a GUARDED boss gets none; chip is a light blow so the resist floor applies; FX dice via fxRand; no invulnerability).
Owed (palsmite's, unchanged): boss win-rate re-check with the Paladin (the chip is small), Conviction pacing, flash size at phone width, textfit for the longer blurb.
Questions: Conviction +0.5 pip (rec keep); AFTERSHOCK stays on the same swing (rec yes); flash size (rec leave).
Merge note for after the SAT 11-07 cut: merge claude/palsmite3 (it contains palsmite), not both.
