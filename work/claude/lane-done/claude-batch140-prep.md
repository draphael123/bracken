# batch140 PREP finish (11-03)
Branch claude/batch140 (pushed, NOT merged, NOT deployed). Worktree bracken-batch140. Tip: `git rev-parse origin/claude/batch140` (after the rookery restamp commit).

## What the dead chain left (scratch\b140\*.log)
No process from it was still running (only mine; other node PIDs belong to a suite / levelling-runtime / two serve.mjs - untouched). Results: restamp rookery+moor exit1 (moor curve-gate fail, see below), textfit card/tree/store/pick 0 findings, textfit talk CRASHED (page crash, infra), heroblocks-b ranger+shots OK, geo-board OK, hero-trials OK (all 9 yards, warden+geomancer to the last gate), boss-openings OK, kite-openings L16-30 FAIL, L31-50 OK, L51-72 CRASHED (page crash).

## Changes (all on claude/batch140)
1. Hornet Queen ONE trim: BOSS_TRIM hornetqueen = { gap 1.3, dmg 2.4 } (herofeel had 1.2/2.0). I also merged geotune 9146aced (not yet in 139) into 140 so the later 139->140 merge cannot conflict on that line: resolved boss-pressure.js to ours (1.3/2.4 + the existing `king: dmg 0.95` entry, which geotune's base lacks); docs/geomancer/pilots.json = geotune's. Everything else auto-merged (geomancer.js: avalanche.boss 8.0, fault mul 0.8/0.35).
2. REAL RED fixed (cause, not test): kite-openings grandmother opened/floated 2.87 s vs 3.2 designed. The Potion Master's told openings (modes opened / floated, underleaf4) were not in boss-pressure FROZEN, so the act gap dial (x~1.1) ran her clock faster inside her own opening. Added opened|floated to FROZEN (src/boss-pressure.js line 20; also exempts them from the kite clock). Now 3.22 s. Slightly longer Potion Master openings; her rate is not re-measured (see owed).
3. Rookery restamp (pilot/curve/mash) committed; level-quality rookery + curve-gate green. WARN jumps (curve kills 25->40, lostPct 288->234) are the noisy known row - repeated runs vary run to run.

## Checks on the final tip (one browser at a time, 4-7 GB free, gate flag present)
GREEN: kite-openings L16-30 (after fix), 51-60, 60-66, 66-72 (L51-72 in one go crashes the page at ~4 GB; split runs are green), textfit talk (exit 0, all 9 scopes), textfit card/tree/store/pick (0), heroblocks-b ranger, geo-board, hero-trials, boss-openings, level-quality rookery, curve-gate, rookery mash.
PRE-EXISTING RED, not ours: level-quality moor `bands` (11% second height, needs 40%) fails identically on master bracken/ (ca825000) and on 139; level.js has no moor change in 140. After the moor restamp the curve-gate also fails (curve 4->7 deaths, band 0-6) and mash-gate moor is stale. I did NOT commit a moor restamp (it would turn curve-gate red); the stale moor stamp is the only mash-gate red left.

## Rates (WITH flasks, human profile, practiced, n=6, normal)
herofeel r1 (read, not re-run): warden wood 4/6, hornet 4/6, marsh 4/6, kings 4/6 = 16/24 = 67% (in band). ranger 6/6, 6/6, 2/6, 5/6 = 19/24 = 79% (+9). herofeel already trimmed the ranger twice with no change (refill 12 s, recall 0.5, steady shot 1.7): the bot kites wood/hornet at L3 for 100%, marsh is 33%, so no dial moves the pooled number. Warden needs no trim. Ranger NOT trimmed further (a hero-wide cut only hurts marsh).
Geomancer on the merged tip: wood (Tusker) 4/6 = 67%, palisadewood (Beast 3) 4/6 = 67%, hornetsnest 5/6 = 83%.
Hornet Queen pooled at 1.3/2.4, this tip: knight 2/6, warden 2/6, ranger 5/6, pyro 3/6, geomancer 5/6 = 17/30 = 57%. Geotune's own pooled at the same trim: 18/29 = 62%. Both together 35/59 = 59% - at the low edge of 60-70, noise-sized; left alone (a notch easier is within one fight). Logs: scratch\b140\geo-rates.log, queen-rates.log.

## Still owed
- Potion Master (grandmother) rate after the longer openings: not measured (rec: boss lane / gate n=6).
- Moor: restamp + a decision on its level-quality `bands` fail (pre-existing on master) and the act-2 curve (7 deaths).
- Ranger vs a REAL windlass (not the bot): needs DOWN+X while she has arrows; rec small game change (ranger.js pointBlank counts a strikable gadget in knife reach) - not done.
- Non-warden variants of the "HOLD C AND BRACE" signs (smallfix10 item), 17 old 3-line signs (not ours).
- Geomancer fight/boss pilots (tools/geomancer-pilots.mjs crash the headless page on this PC; a report, not a gate).
- Full suite, art/bosses: not run.

## Ready for the gate?
Yes, after 139 deploys: merge origin/claude/batch139 (+ geotune if 139 takes it) into 140 first (expect only the generated docs/*.json stamps to conflict - re-stamp, do not hand-merge), then the QUICK gate. Expected reds at the gate: moor stale stamp/level-quality bands (also on master). The page-crash on kite 51-72 / textfit under low RAM is infra, not code.

## Questions for Daniel (rec built / noted, nothing blocks)
1. Ranger sits 79% pooled (marsh 2/6 vs 6/6 elsewhere). Rec: leave it; the next tune lane reads marsh specifically.
2. Hornet Queen pooled 57-62% at 1.3/2.4. Rec: keep (in band within noise).
3. Plain X to knife a windlass for a ranger with arrows. Rec: yes, small ranger.js change in the next smallfix.
4. Moor: Rec: next level lane adds second-height ledges (bands 11% -> 40%) and then restamps; until then it is a known red.
