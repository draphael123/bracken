# claude/underwater (sonnet, 2026-10-16)
Branch claude/underwater off claude/batch97 (a0bd2c1a). Commits: 90e954c8 (breath + swimflask), 838d89bf (Reefmaw).

## Changed
- OUT OF BREATH = quiet drain (src/main.js BRD on shared src/drain.js, A13): no stagger/knock/hurt flash/mercy window/hitstop; ~old 4 hp/1.3 s (3.1 hp/s x difficulty/tier chain); whole hp every ~0.3 s; bubbles stop; soft SFX.gaspTick + small -n each second; stops on air/surfacing; kills as DROWNED; cleared on respawn/level load.
- SWIMFLASK: tryDrink allowed while P.swim at 1.5x drink/swallow time; a blow spills; the breath drain moves P.drinkHp so it never spills; air/jump still refused; touch FLASK button shows when swimming.
- tools/underwater.mjs (+ check.mjs 'underwater'): 9 water levels no hurt/inv/knock, ~rate, surfacing stops, DROWNED kill, swim drink 1.5x, spill, drain-no-spill, air refused.
- REEFMAW (coordinator-directed): bite direction committed at its first frame (it re-aimed through the whole swing, so ~every bite landed and the bot got ~1 opening a fight); hp 830->700; his blows x0.85 (BOSS_HIT). src/lab.js: bot presses dodge in the bite tell.

## Rates (human, practiced, flasks kit, 12 seeds k/w/p)
| boss | before | after |
| reef Reefmaw | 25% (0/8/1) | 64% (8/7/8) in band after retune |
| deep Diving Bell | 58% | 67% |
| keep Drowned King | 42% | 61% |
| causeway Kraken | 47% | 47% (not retuned: KRAKEN 3) |
| lamplit Tollmaster | 72% | 72% (left, lamplit2 69%) |
Cistern Queen not measured (dry, benched). Reef x0.55/700hp alone gave 39%; x0.3 never shipped.

## Checks (green)
underwater, flasks2, normal-health, swim-chain, swim-shrines, deep-rework, deep-descent, boss-openings, mash-gate, mobile-perf, syntax, comments; tools/breath.mjs deep.
## Red
textfit 'plates' scope hangs (Runtime.evaluate timeout) - pre-existing on clean batch97 on this PC (storyremove lane confirmed); every other textfit scope passed. Probe of all water-level boss plates ran fine.
## Questions
Keep Reefmaw's committed bite (rec: yes), REEF 2 may rework later.
