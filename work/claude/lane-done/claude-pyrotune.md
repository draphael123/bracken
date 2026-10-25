# claude/pyrotune - THE PYROMANCER duel tune (sonnet, 10-24)
Base master 10d032ea. Edits: src/main.js (EHP.pyromancer, updatePyromancer's rest after a move, PYRO_DUEL.cutTell) + tools/pyro-duel.mjs (expected hp).
## Change
- hp 1225 -> 1500 (+22%)
- his rest between moves (after()): 1.15 s -> 1.0 s phase one, 0.8 -> 0.75 phase two (a little more pressure, same told attacks)
- cut tells 0.42/0.30/0.34 -> 0.40/0.28/0.32
- Damage numbers unchanged (9/12/14/7/12). Water stun (x2, 3 s) and steam ward untouched; never invulnerable; no new attacks (B10 told-only holds).
## Rates (BOT_PROFILE=human, campaign L5, flasks kit)
- BEFORE (master): 97% (k 11/12, w 12/12, p 12/12), fights ~65-88 s avg (knight 81, warden 65, pyro 88)
- AFTER (hp 1500): n=36 69% (k 7/12 w 9/12 p 9/12) + extra n=24 75% => 72% over 60; fights ~81-86 s avg, wins 76-88 s
- DRY (human+dry) n=8: k 2/8 w 4/8 p 1/8 = 29%
- bare single flask n=8 (at hp 1600): 50%
- MASH 0/6 per hero (knight, warden, pyro all dead, boss left 67-87%)
- Sweeps that failed on the way: damage x1.2-1.45 + hp 1500-1750 = 15-50% (too punishing, knight/pyro hero die); hp alone is the cleaner lever.
- Sampling noise is large (hp 1350: 75% then 69%; 1400: 47%; 1600: 58%; 1650: 62%) - the knight is the weak hero in every run.
## Checks (all green)
pyro-duel, village-water, boss-fight-end (66/66), tells, told-sweep12. textfit not run: no text changed.
## QUESTIONS FOR DANIEL
1. Fights land ~80-90 s, a touch under the 90-150 s brief. Longer needs more hp, which pulls the rate under 65% (knight 3-5/12); rec: ship as is, or lengthen with a phase-two move rather than hp.
2. Built (rec) hp + rest only. Not built: new duellist moves (whiff-punish lunge, heat-bar combo) - they need art/animation and a tell mark; offer as a follow-up lane.
