# claude/dr5tune - DEEP RAILS 5 TUNE (Sonnet lane, off claude/dr5art 0a0dc738)
Numbers only (src/great-drill.js, src/foreman.js). PORT 8935, one page at a time, jobs=1. Logs: ..\dr5tune-logs.

## RESULT (12 seeds a hero, practiced, profile human = drinks, campaign L13, kit flasks)
| row | knight | warden | pyro | all | band | fights |
|---|---|---|---|---|---|---|
| GREAT DRILL (was 1/12 8/12 4/12 = 36%) | 8/12 | 9/12 | 7/12 | **67%** in band | 60-70 | 48-140 s (pyro 99-140, was 120-164; knight 97-139) |
| THE FOREMAN mini (was 12/12 10/12 12/12 = 94%) | 10/12 | 10/12 | 9/12 | **81%** in band | 75-85 | 33-66 s |
DRY (human+dry, report only): drill 1/12 2/12 5/12 = 22%; Foreman (final numbers) 6/12 4/11 5/12 = 43% (one fight errored). The with-flasks fights are won on the flasks.
The knight is no longer at 0/N.

## WHAT CHANGED
GREAT DRILL: hp 2400 -> 2200; gap [0.3,0.22,0.15] -> [0.45,0.35,0.25] (more air between attacks); hit damage down: contact 64->42, rock 64->42, reverse 62->41, dynamite 56->36,
lunge 60->39, collapse 62->41, cutter 36->23, claw 44->28; gearHp 120 -> 100 (shortens the pyro's gear work). The new attacks' (cutter/claw) pressure was kept, only their
hit weight came down with the rest. Gear-bank gating (gearsNeed), chain order, tells untouched. Still DIAL_EXEMPT. Finding: a hero has ~166 hp (+~100 in flasks), so the drill
was killing in 5-6 hits; the swing 40 -> 44 dmg is the whole difference between 78% and 58% (steep), 42 lands 67%.
FOREMAN: gap [0.9,0.7,0.55] -> [0.75,0.6,0.45], pickDmg 26->31, boomDmg 22->27, ramDmg 38->46. bumpDmg stays 18 (minecart.mjs asserts the spikes' full bump = 18; not weakened).

## CHECKS (final tree)
GREEN: mash-bot minecart 0/6 boss + 0/6 mini | mash-gate (47 levels) | boss-openings (exit 0) | boss-read ok | boss-fight-end (63 fights) | minecart.mjs 524 ok |
level-quality minecart CLEARS (pilot 38 blows/4 deaths, curve 207%/5 deaths, mash 0/6). No stamp moved: nothing re-stamped (docs/mash-bot.json, level1-*.json unchanged and gate-green).
Not run: full suite (BATCH94 running), minecart-route / reach-heroes / stuck (no level or geometry change).
REDS: none from this lane.

## QUESTIONS FOR DANIEL (rec first = what is built)
1. Drill + Foreman damage came down rather than hp (a hero has ~166 hp; the tune is mostly "fewer 6-hit deaths"). Rec: keep. Alt: leave damage and lift flask value for the Deep Rails.
2. Dry rates are low (drill 22%, Foreman 43%) - flasks carry both fights, as the 10-08 target intends. Rec: keep.
3. 12-seed noise is about +-14 points; the drill sits at 67%, the top of the band. Rec: keep; if live play reads easier, take dmg back 2.
