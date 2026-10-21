# claude/tuskerdaze - OLD TUSKER dazed time doubled (sonnet), off master 5586a595 (BATCH110)

Daniel 10-21: double his ram stun (felled trunk / wall). PORT 8783, one headless Chrome at a time.

## CHANGE (src/old-tusker.js, 2 numbers)
- daze.t [1.45, 1.2] -> **[2.9, 2.4]** (P1 / P2); mul x1.25 kept; PINNED untouched (3.4 s, x2, cap 14%).
- **hp 775 -> 1175** (re-tune; blows kept: charge 10, sweep 12, clods 10).
- No art edit needed: the dazed stars loop runs off `time` for the whole stun, the gold ring + timer bar read `modeT/openT0` (scales with the stun), the bot's daze logic keys off modeT.
- Pinned (3.4 s) is now only ~0.5 s longer than the P1 daze; pin keeps its x2 and the long cap, daze its x1.25 and no cap.

## RATES (campaign L3, profile human = flasks, practiced)
| hp | k/w/p n=12 | total |
|---|---|---|
| 775 (daze x2) | 12/12, 10/12, 12/12 | 94% HIGH |
| 1100 | 12/12, 10/12, 5/12 | 75% |
| 1150 | 12/12, 8/12, 6/12 | 72% |
| 1200 | 12/12, 4/12, 3/12 | 53% |
| 1250 | 12/12, 5/11 (1 err), 6/12 | 66% |
| **1175 (FINAL)** | **11/12, 7/12, 5/12** | **64% in band** |
Run-to-run noise is +-10 (1150/1200/1250 do not order); 1175 is the middle of the 64-72/53-66 cluster.
- The other six at 1175 (n=4, pirate 3): geomancer 1/4, ranger 3/4, berserker 2/4, paladin 2/4, pirate 2/3, reaper 3/4 = 57%; **none at 0, all 9 route**. (Geomancer, the 0/5 red in tuskerfix, now 1/4 + 2/3 at 1250: routes. Berserker alone n=8: 1/8 at 1250, 4/8 at 1150.)
- Dry (human+dry, n=4 k/w/p): 2/4, 2/4, 2/4 = 50%, reported only.
- Knight fights run 100-210 s at 1250 (long; the knight bot jumps charges) - over B6's 90-150 s. Same cause as tuskerfix Q3; not changed here.

## CHECKS
- node tools/old-tusker.mjs 34/34; tools/tells.mjs ok (no mark moved, no --write needed).
- page: firsthour green (ram -> rammed + trunk spent; wall ram; hide 4 / pinned 20 / dazed 13); boss-greed green; level-quality wood CLEARS (curve 147%, 2 deaths in 3).
- mash-bot wood: boss **0/6** (all timeouts, boss left 61-82%); `docs/mash-bot.json` re-stamped (--write).
- tools/old-tusker.mjs / firsthour / boss-greed pin no daze duration (they read OT.daze), nothing to edit.
- NOT run: full suite / QUICK gate (integ), mobile-perf, boss-openings (no tell/pose change).

## REDS / NOTES
- Practiced total over all 9 sits at 57-64%, berserker is the weak hero (50% at 1150, 13-50% across runs); geomancer 25-50%. No hero at 0.
- Knight win length is the one drift (100-210 s).
