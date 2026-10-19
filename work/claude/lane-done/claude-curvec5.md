# claude/curvec5 - CURVE FIX STEP 2a (sonnet)

Base: claude/batch105 3ea9ee2e (BATCH104 foe pass + Lumber Trail + Waymeet Paladin + C0 docs + C2 walker tools). Daniel approved 10-19 16:01: 2a now, 2b (2.4 / 3.0 / 3.0) only if the re-walk still reads soft.

## WHAT LANDED (code)
- src/foe-react.js ACTS: `dmg` III 1.25 -> 1.75, IV 1.4 -> 2.1, V 1.55 -> 2.1 (I 1.0 / II 1.1 unchanged); NEW `hp` per act 1.0 / 1.0 / 1.0 / 1.05 / 1.1; act IV purse `cap` 2 -> 3.
- src/main.js (the one line that scales spawned foes, ~2989): commons and elites x `ACTS[act].hp` on top of (1 + 0.5 x TIER); the boss/mini branch (1 + 0.25 x TIER_BOSS) is untouched. ACTS.dmg is common-foe only (verified in RX.tier: skips maxHp, mini, xpRole, elite, token-exempt), so bosses/minis and their blows do not move.
- C2's rebases, exactly as written (hold today's absolute blows): LEVEL_DMG church 1.5 -> 1.0, causeway 1.5 -> 1.1; L.foeHit x(old/new ACTS.dmg): towpath x0.667 (bargeman/riverrat 2.3, watchman 1.9, deckforeman 2.4, hedgechampion 1.1, bargechampion/ratchampion 2.4), ksar x0.738 (2.7/1.9/2.7/2.2/1.6/1.9/3.0), buriedcity (4.0/1.7/3.5/4.0), sealedpyramid (1.6/3.2/2.2/2.4/2.4/4.0). foeHp tables untouched (ACTS.hp stacks on them: V x1.1).
- tools: combat-part2 asserts longwater x1.75 / redgorge x2.1; curve-shape also checks ACTS.hp non-decreasing; walk-curve `--after2a=` (adds the re-walk to docs/walk-curve.json; the printed table and curve-gate read it); see "Q8 applied" below for rule-state / curve-gate.

## THE ACT TABLE (campaign hero L4..L42, human+first; deaths a first run, mean of level means (median) / mean shrine arrival)
| act | target | BEFORE e0436ee8 (n=1) | C2 AFTER f95390f0 (n=2) | AFTER 2a (n=2) |
|---|---|---|---|---|
| III | 1.5-2.5 / 55 | 0.1 (0) / 84 | 0.1 (0) / 77 | 0.1 (0) / 76 |
| IV | 2-3 / 50 | 2.4 (1) / 80 | 2.0 (0.7) / 79 | 2.1 (0.7) / 78 |
| V | 2.5-3.5 / 45 | 0.5 (0.3) / 69 | 0.5 (0.5) / 73 | 0.7 (0.8) / 68 |

Levels in the death band: 0/9, 0/11, 0/7 (canal / fair / witchlight stay the walls at 4.6-8 deaths; theatre 0.2 / 97%). 2a is n=2 seeds x knight/warden/pyro, 160 runs. Not walked (known walker hangs / no progress): towpath, glasssea, sealedpyramid warden; welltown / redgorge / deep have <3% of the route between shrines, so no arrival number.

What moved (walker hit records): a common foe's biggest single hit (median, % of max hp) III 8 -> 11, V 7 -> 10 (IV reads 11 vs 24 before, but the old 24 was the 26-28% spike plateau - hazards, not blows); damage taken per run (median, % of a bar) III 78 -> 106, V 77 -> 89; hits a run 8.5 -> 9.4 (III), 4.6 -> 6.4 (V). The dial IS live and blows are 40-50% bigger, but the walker is only hit 6-10 times a run and drinks at 35%: the extra damage becomes flasks, not deaths. Per-level movers (n=2): burial 0.7 -> 1.3 deaths, caravan 0.8 -> 1.5, ksar 83 -> 70% arrival, sealedpyramid 73 -> 61%, unburied 80 -> 72%, fields 74 -> 66%; the rest within noise.

## 2b: RECOMMEND APPLY, BUT SET EXPECTATIONS
Every act is still far under its target (III 0.1 vs 1.5-2.5 deaths; IV 2.1 is carried by three wall levels, median 0.7; V 0.7 vs 2.5-3.5), so by Daniel's rule ("2b if the re-walk still reads soft") 2b is due: ACTS.dmg 2.4 / 3.0 / 3.0 with the same rebase tables x0.467 (IV towpath), x0.517 (V), x0.52 (III), LEVEL_DMG church 0.7, causeway 0.8. A typical common hit would go 11% -> ~15% of max hp, still under the 25% cap. HOWEVER 2a showed the lever is weak on its own: a x1.4 blow raised damage taken ~+35% and deaths barely moved, so 2b's further x1.37-1.43 likely lands III near 0.5 deaths, not 1.5-2.5. The missing axis is HOW OFTEN the hero is hit (encounter density, placement, route-blocking share) - that belongs to the per-level sweeps/reworks, not the generic dial. Rec: apply 2b (cheap, monotone, inside the cap) AND steer the act III-V sweep lanes at hit frequency.

## CHECKS
- curve-shape ok (ACTS.dmg 1/1.1/1.75/2.1/2.1; ACTS.hp 1/1/1/1.05/1.1), mash-gate ok (47 levels), foe-pass (node part) ok, level-walk-selftest ok, combat-part2 ok (purse + damage tier by act incl. longwater 1.75 / redgorge 2.1), level-quality ok, blow-census --walk (report-only, exit 0), curve-gate exit 0 after the Q8 change below. Boss pilots redgorge (0/3), welltown (1/3), unburied (12/24) ran clean (errors []; tiny n, not a band measurement).
- COMMON_BLOW_CAP (25%) report on the 2a walk, real overs (n>=3, not the 27% hazard plateau): causeway sailor 32% (n5), church swornsword 41% (n20), gobmage 35% (n7), haunt 27% (n16), hurricane cutlass 30% (n6), fair mummer 95% (n19 - a chain/hazard, verify with BK.hitLog), ksar cutthroat 27% (n17), redgorge raptor 27% (n18). Same set as C2 (the rebases hold the absolute blows). Elites over (not counted): causeway / hurricane tideguard* 30%, deep watch* 34%, sealedpyramid mummy* / scorpion* 50%.

## Q8 APPLIED (declared change: tools/rule-state.mjs curveVerdict + tools/curve-gate.mjs)
I re-piloted the level-1 curve rows (docs/level1-curve.json) for acts III-V (27 levels re-stamped; towpath and glasssea not - known hangs). They moved UP as expected: the bare knight dies more (theatre 1 -> 8 deaths, witchlight 2 -> 10, burial 3 -> 10, underwell 3 -> 9, fallingtower 11 -> 19). Four levels crossed their act ceiling and curve-gate went RED: hurricane 11 deaths (ceiling 9), fallingtower 19 d / 785% (12 / 600), fair 13 d / 602% (12 / 600), sealedpyramid 15 d (12; was 12). Per brief 2c/5 and Q8 (Daniel 10-18, all recs) the answer is not to grow CURVE_REPORT_ONLY but to move acts III-V to the walker gate. Narrow version built: in acts III-V a CEILING miss of the bare knight is REPORTED (curve-gate WARN line; level-quality passes), the FLOOR (a walk) still gates in every act, acts I-II are byte-identical. ksar 13 / church 16 were already listed. If Daniel prefers the other reading (keep the L1 pilot gating and list the four on CURVE_REPORT_ONLY), it is a small revert of the rule-state hunk.
Mash rows (docs/mash-bot.json): not re-stamped - mash-gate passes on the stamped rows (its hash does not see ACTS) and harder commons only make the mash bot fail more (safe direction). Boss rows: not re-stamped (see risk).

## RISKS / NOTES
- Add-foes inside boss arenas are COMMON foes (no xpRole): they now hit x1.4 / x1.5 / x1.35 harder and (IV/V) stand 5-10% more hp. Boss rows were NOT re-measured; a boss that summons commons (welltown Djinn, Dune Worm, causeway) may drift a few points down. C3/C4 measure those rows after this lands.
- canal / fair / witchlight are mini + hazard walls, not common blows (unchanged in kind).
- One walker run (fields warden) hung with no CPU (renderer died): I killed only my own tree and added a per-run wall timeout in my supervisor (work/tmp-curvec5/sup.mjs, uncommitted). burial warden s1 timed out once and was re-run clean.
- Process slip: two chains ran for a few minutes (killing the first node let its bash wrapper start the next group); both killed by exact PID, rows de-duplicated by level x hero x seed.

## QUESTIONS FOR DANIEL
1. Apply 2b now (2.4 / 3.0 / 3.0 + the rebases above)? REC yes, expecting a modest move: the dial is a weak lever on a walker hit 6-10 times a run.
2. Q8 reading: bare-knight CEILING misses in acts III-V reported (built) vs listed on CURVE_REPORT_ONLY? REC as built.
3. Fold the hit-frequency lever (encounter density / route-blocking share, acts III-V) into the act sweeps? REC yes; that is where the deaths target lives.
