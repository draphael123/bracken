# claude/bc4fixtune - HOURGLASS KING re-tune after the rising sand (SONNET, 2026-10-15, PORT 8941)
Base claude/bc4fix 1679bc2c. Only src/hourglass-king.js numbers changed (the rising sand is kept as built).

## Tune (blow damage + hp; withdraw timers and slab timers untouched)
hp 2500 -> 2250; every blow x1.2 of bc4tune: pend 50, gear 35, stream 44, surge 39, grasp 41, rain 28, slip 50, hour 52, pour 11, shard 28, pot 39.
Steps (boss-rates buriedcity --ways=practiced --seeds=12 --profile=human, flasks kit, L40):
- bc4fix as built (hp 2500, x1.08): 26/36 = 72% (k9 w7 p10), HIGH +2; fights 94-218 s (pyro 171-218 s)
- hp 2350, blows x1.12: 26/36 = 72% (k6 w9 p11)
- **hp 2250, blows x1.2: 23/36 = 64% (k6/12 w6/12 p11/12) IN BAND**, no hero at 0
## Fight lengths (final, flasks)
wins 85-178 s; 32 of 36 fights <= 155 s; longest 208 s (one warden loss), 178 s, 174 s. Median ~137 s. (Was up to 218 s.)
## Dry alongside (human+dry, 12 seeds): 7/36 = 19% (k3/12 w0/12 p4/12); warden 0/12 dry - informational (target is WITH flasks).
## Checks (all green): mash boss 0/6 (knight/warden die at 21 s with boss 100%; pyro 97%) - mash BOSS row re-stamped (docs/mash-bot.json) because the King moved; boss-openings ok; boss-read ok; boss-fight-end 63 ok; buried-city.mjs 398 green; level-quality buriedcity clears (curve 349% / 6 deaths unchanged).
## Not run: reach-heroes/corpses/textfit (no level data or art touched).
## Reds: none.
## QUESTIONS FOR DANIEL
1. Pyro is the outlier (11/12) and knight/warden 6/12; overall in band. Rec: keep. A per-hero fix would need a pyro-specific change (not done).
2. Warden 0/12 dry. Rec: fine under the 'with flasks' standard; say if dry matters for this boss.
