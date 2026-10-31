# claude/ft4tune - FALLING TOWER 4 TUNE (sonnet tune lane)

Base: claude/ft4art 1ad37215. Branch claude/ft4tune (worktree bracken-lanes/bracken-ft4tune). NOT merged, NOT deployed. Level hash unchanged (fallingtower 1518896357e3): boss, bot and test numbers only, no tiles or ents.

## RATES (tools/boss-rates.mjs fallingtower, L39, practiced, profile human, flasks kit, jobs 1)
| config | knight | warden | pyro | all |
|---|---|---|---|---|
| ft4a (3dd808be), same setup, seeds 1-8 | 4/8 | 6/8 | 6/8 | 67% |
| ft4b (cb642e3a), seeds 1-8 | 1/8 | 8/8 | 8/8 | 71% |
| ft4art (start of this lane), openT 3.0, seeds 1-6 (lane C) | 5/6 | 6/6 | 6/6 | 94% |
| openT 2.0 only, seeds 1-8 | 6/8 | 8/8 | 8/8 | 92% |
| openT 2.0, ALL second returns off, seeds 1-8 | 4/8 | 8/8 | 8/8 | 83% |
| + realm casts faster (1.7/1.7/1.6 s), returns on, seeds 1-8 | 4/8 | 8/8 | 8/8 | 83% |
| + realm hazards up, 3 lances, brazier relight 10 s, seeds 1-8 | 4/8 | 8/8 | 7/8 | 79% |
| + hall spells x1.15, seeds 1-8 (too hard on the knight) | 2/8 | 8/8 | 8/8 | 75% |
| FINAL (hall spells x1.07), seeds 1-8 | 3/8 | 8/8 | 8/8 | 79% |
| FINAL seeds 9-16 | 0/8 | 8/8 | 7/8 | 63% |
| FINAL seeds 17-24 | 2/8 | 8/8 | 7/8 | 71% |
| **FINAL combined, n=24 per hero (72 fights)** | **5/24** | **24/24** | **22/24** | **71%** |

Band is 60-70, so FINAL is +1: in band within noise (about +-5 pts at n=72). Fights are deterministic per seed (same seed + same code = same fight), so the same seeds compare one config to the next with less noise than n suggests; different seed sets still swing about +-9 pts per 24.

## WHAT CHANGED (the Undead Mage, 94% -> 71%)
- **src/mage-realms.js**: REALM.openT 3.0 -> 2.0 (rec #1, applied; on its own it moved nothing: 94% -> 92%). Realm casts: fire.cast 2.4 -> 1.7, ice.cast 2.4 -> 1.7, poison.cast 2.2 -> 1.6. Hazards: fire.dmg 16 -> 20, wallDmg 18 -> 22, ice.dmg 14 -> 18, ice.every 1.7 -> 1.3, poison.bite 10 -> 13. Second returns slowed: ice2.cracks 2 -> 3 (THREE lances: the banner, the shatter line and cue2 say THREE), fire2.relight 6 -> 10 s. The spore return KEPT (judged: switching all returns off moved the rate only ~9 pts, and the spore ring is a 2-in-3 swing). New REALM.ret.on = { fire, ice, poison } switches (all true).
- **src/undead-mage.js** MAGE.dmg x1.07: fire 15, ice 13, storm 30, orb 9, hand 17, mark 36, bent 14, trap 14, skull 16, void 19, world 24, script 26 (sweep3's 'red +15%' that made the warden 0/4 then was 16/14/32/9/18/39/15/15/17/21/25/28; this is between).
- **Why the realms were the lever, not openT**: damage ledger by mode (BOSS_MODES, pyro, ft4a vs ft4c): the realms' own hits fell from about 98 (rhover) + 51 (spore) to 6 + 27. Lane C's perches, floes and vents keep his shots far or blocked and the bot's returns end a realm sooner, so a realm cost almost nothing (the ice realm about 0). Cutting openT only shortens the window after a realm is already beaten.
- **src/lab.js (bot, rec #3: knight via the carpet bot, not a boss number)**: (a) HIS ICE FAN: the carpet bot reads the five-lance fan's point of birth and flies into the nearest GAP instead of dodging each lance sideways into its neighbour (knight iceTell damage 96 -> 38 a fight); (b) in a realm the strike-back try rate 0.65 -> 0.9 and reach x1.0; (c) the BOSS_MODES ledger keys damage by realm kind ('fire:wallTell'): a measuring aid only.
- **Knight is still weak: 5/24 = 21%** (lane A: 9/24 at the old numbers; ft4b alone measured 1/8). A deliberate LURE (go round behind him so his returning fire wall breaks on him) made it WORSE (0/12) and was REVERTED. His remaining damage is the fire realm (the wall and bolts, 200-300 of about 580 effective hp) and the hall's scriptTell/stormTell, which every hero takes.
- **Warden 24/24 and pyro 22/24 at every number I tried.** The warden takes about 225 of about 580 effective hp (the carpet bot's guard/deflect tap makes it nearly immune); pyro about 470. Raising numbers moved the knight (3-6/12 down to 0-3/8) but not the warden. So the 71% is carried by two heroes near 100% and one near 21%: a bot-skill spread no boss number fixes (Q1).

## TOWER-CHASE STAIR (rec #2): GREEN 13 of 13 runs this lane (was flaky red)
- src/lab.js chaseClimb: the stair bot's strike-back try rate 0.65 -> 0.92, reach x0.95 (was 0.85), vertical window 22 -> 26, paladin lead 0.22 -> 0.34 (its swing comes round slowly). The paladin now returns 2-3 stair shots a run (was 0-1); every hero returns 2-5. The assert (every hero >= 1) is KEPT.
- A second flake the higher return rate exposed: 'he hardly casts on the way up' required a markTell, but a stunned flight answers with his mark OR the PAIR (lane A), so some runs cast no mark (2 of 3 failed on one port). tools/tower-chase.mjs line 492 now accepts markTell OR pairTell (still >= 6 casts and a fireTell).

## COLLAPSE FRONT PACE (rec #4): NOT CHANGED, the front is not the lever
level-quality fallingtower reads 'curve: act 4, 624% hp, 15 deaths in 3 runs (band 120-600%, 1-12 deaths), over the bare-knight ceiling, REPORT-ONLY in acts III-V' (an ok row, not a fail). Level-1 knight pilot, 3 runs each, same hash: stamped 15 deaths / 624%; Act II 14/17/20 + Act III 21/26/31 px/s (-12%): 19 deaths / 776% (curve) and 17 / 738% (pilot); fronts at 6-11 px/s (almost off): 22 deaths / 880%; front hit 21 -> 14: 21 deaths / 802%. No trend: the pilot swings 15-22 deaths run to run and the deaths are the tower's own foes and set pieces, not the front (it 'spares', leaving 1 hp). So pace and damage are back at 16/20/24 and 24/30/36 px/s, 21 a hit; docs/level1-pilot.json and level1-curve.json are ft4art's stamps (valid, the hash did not change). 4 shrines kept.
- Item 5: no level change, so no campaign row or boss-level --write-xp is stale because of this lane; curve-gate's fallingtower walker row stays 'stale' (known, brief risk 4: the walker cannot measure this tower).

## CHECKS
- Node, green: fallingtower4 (front pace unchanged), boss-read, tells, undead-moves, answer-tags, comments, architecture, mash-gate (52 levels), curve-gate (0 out of band; fallingtower, flotilla, hurricane stale as known), level-quality fallingtower (clears).
- Page, green (one browser at a time, RAM > 5 GB free each time, ports 6630-6641, only my own PIDs): tower-chase FULL x13 (after the two fixes), tower-ascent, tower-collapse, chase, undead-realms (updated), boss-openings, rule-openings, reach-heroes, stuck (runtime).
- Test edits: tools/undead-realms.mjs (THREE lances; `open > openT - 0.5` not `> 2`; the 30 s stand-still stops when the realm tears), tools/tower-chase.mjs (mark OR pair).
- Not run: the full suite; textfit (the cue2 and shatter lines say THREE not TWO, +3 characters: re-check in the integ gate); mobile-perf; pixels; fire-room (red on the base per lane C, its own flying bot, not in this lane's list); boss-fight-end (I started it beside a rates run and it timed out: no result).
- Process notes: one rates run stalled 14 min with no output on a loaded PC (my own PIDs 19588/3700/21344 killed, the re-run was fine). boss-fight-end ran beside a rates run for about 4 min (RAM fine).

## READY FOR BATCH131: YES
Boss in band (71%, +1, within noise), tower-chase green and stable, node and page checks green. Caveat: the rate is carried by the warden (24/24) and pyro (22/24); the knight is 5/24.

## QUESTIONS FOR DANIEL (rec first; each built as the rec)
1. **Hero spread**: knight 21%, warden 100%, pyro 92% (all 71%). Rec: ship (in band). Alt: a follow-up bot lane for the knight in the fire realm (it loses 200-300 hp to the wall and bolts) and for the warden's near-immunity (guard/deflect tap in the carpet hands), then re-cut the numbers.
2. **Realm damage and cast pace were raised** (lane C's realms had made them nearly harmless). Rec: keep. Alt: put the hazards back and take the same points from his hall spells (hits the knight harder).
3. **The ice shell now needs THREE lances** (was two). Rec: keep. Alt: back to two and cut the ice realm's lance count instead.
4. **Collapse front pace left alone** (it is not what over-fills the level-1 pilot). Rec: leave report-only. Alt: trim the tower's foes (apprentices 23, heavies 18) if 624% bothers you.
5. **Hall damage x1.07.** Rec: keep; it is below sweep3's 'red +15%' that made the warden 0/4.
