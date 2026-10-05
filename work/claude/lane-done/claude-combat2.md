# COMBAT PART 2 (claude/combat2)

Base: master 2423ff42 (batch68, WEIGHT-T live). Master had not moved at report time.

## What changed

### src/foe-react.js (new)
It is built on the part-1 hooks in src/attack-tokens.js. main.js only calls it, through 8 one-line hooks.

**Reactive foes**
- **Flank.** A waiting melee foe on the crowded side walks round to the ring behind the hero. It needs the hero's back to an empty side. It happens sometimes (50% chance, 2.5 s cooldown).
- **Cover kinds guard while waiting.** The tide guard, soldier, watch, merrow brute and others keep their front turned to the hero, at their own turning pace.
- **Back off a charging heavy.** A foe in front of a hero whose heavy is charging gives ground. 60% chance, 0.7 s, with a cooldown.
- **Punish a whiff.** A swing that meets nothing hands the nearest foe its turn at once. 60% chance, 0.9 s cooldown. The foe's own told windup still follows.
- **Mashed, it guards.** A common melee foe cut 3 times in 2 s (2 times in acts III-V) raises its guard.
  - The guard is told: a steel bar is drawn across its front, it clanks, and COVERED shows.
  - It turns light cuts off its front, including a combo's third cut. Then it drops the guard into a riposte, a token granted at once.
  - A held heavy breaks the guard. A sweep goes under it, and there is no guard behind it.
  - It never interrupts its windup or its recovery: a flurry that ends there raises the guard when the foe is next standing about.
  - It then has a 2.2 s cooldown.

**Varied swings and feints** (on the grant)
- The same windup comes HELD (+0.2-0.3 s, a glint at the weapon), QUICK (x0.8 with a 0.3 s floor, a white flash) or plain.
- 15 blade or haft families can FEINT: the first release is a stamp (dust plus SFX.feint), and the real blow follows 0.32 s later. The mark stays up throughout.
- A red !! is never varied.

**Squads with roles**
- level.js squad ids now reach the spawned foes (one line in loadLevel).
- Roles:
  - FRONT (a cover kind) presses in.
  - BACK (ranged) holds 112 px off.
  - FLANK goes round to the empty side.
- **Pincer:** squad members on both sides of the hero are both given tokens at once, when the purse is empty.
- A heavy still comes alone (cost 2).

**Ramp by act**
- `ACTS` is the act table: the purse (TOKENS.cap) and a damage tier on common foes' blows. It is applied in damagePlayer0 (RX.tier).
- No foe gains health.
- Bosses, minis, elites and every foe in a boss or mini fight are outside the tier.
- The table is also in docs/combat-tuning.md:

| act | purse | damage tier | mashed foe guards at cut |
|---|---|---|---|
| I | 2 | x1.0 | 3 |
| II | 2 | x1.1 | 3 |
| III | 2 | x1.2 | 2 |
| IV | 2 | x1.25 | 2 |
| V | 3 | x1.3 | 2 |

**ACT ROSTER.** `ROSTER` sits beside `ACTS` in src/foe-react.js. It gives each act's foe families by squad role (front, flank, back, heavy, support, plus water for act III), read off the levels as built. It is for the level difficulty sweep.

**Hooks left for ELITES2 and the sweep.** Exported: `REACT.eligible`, `roleOf`, `readyNow`, `ACTS`, `ROSTER`, `COVER`, `RANGED`, `FEINT`. Every rule in this module leaves elites out; BK.tokens().RX exposes the module at runtime.

### The mash bot (tools/mash-bot.mjs, mash-rows.mjs, level-quality.mjs, mash-audit.mjs)
Two measurement holes, both found while fixing the listed levels.

- **HELD is not a clear.**
  - The Stormhold pyro was shut in an ambush room she could not finish: a guarding pike captain never came to her.
  - Every lift put her straight back at the wall, for 117 lifts. She took no more blows and "cleared" the level at 41%.
  - A lift that does not land now counts as `held`. A run with 3 or more held lifts is not a clear (`clearsAt`, `MASH_HELD`).
- **An elite's gate is fought, not lifted over.** The bot used to be lifted straight past THE DROWNED CAPTAIN's gate in the Keep's exam. Now it walks or swims at the captain and mashes, for up to 60 s. If he still stands, the run counts as held.

Both changes only make the gate stricter.

### Level-side checks
- **(a) Fight during the rule.** `tools/rule-state.mjs` and the `ruleFight` row in level-quality. It counts designed encounters within 10 columns of the rule's state as the built level carries it.
  - It is REPORT-ONLY for every level, and it is a heuristic: most levels pass.
  - It misses wood (1) and undercrown (0).
- **(b) The measured curve.**
  - New runs: `level1-pilot.mjs <ids> --curve` writes docs/level1-curve.json for all 37 campaign levels, including health lost a run.
  - There are per-act bands (`CURVE_BANDS`).
  - New check: `tools/curve-gate.mjs` (in check.mjs). There is also a per-level `curve` row in level-quality.
  - `CURVE_REPORT_ONLY` is a per-level list that may only shrink, like MASH_REPORT_ONLY. A level out of band and not listed fails. A listed level that is back in band fails ("take it out").
  - The campaign report is `node tools/rule-fights.mjs`.

## Mashable levels: MASH_REPORT_ONLY 8 -> 5

The storm, keep and longwater LEVEL entries were deleted. Rows were re-stamped with the level run first, then the boss run.

| level | before (min hp knight / warden / pyro) | after |
|---|---|---|
| storm | 66% / dead / 26% (cached); 0 / 66 / 40 on a re-run | dead (held) / dead (held) / 51% but held 117 = holds |
| keep | 45 / 59 / 60 | 5 / 30 / 20 |
| longwater | 4 / 4 / 62 | 22 / 10 / 49 (all held 28: the ambush / elite tideguard the masher cannot finish) |

- **Bosses after the re-stamp:** storm, keep and longwater 0/6 each.
- **Re-measured without writing (still hold, every hero):**
  - spire: all three die.
  - theatre: 18 / 0 (dead) / 5.
  - hanging: all three die.
  - redgorge: all three die.
  - causeway: 6 / 42 held / 51 held.
- **MASH_REPORT_ONLY now holds:** spore boss, plus the fields, fallingtower, witchlight and unburied minis. These are not level parts, so they are not this lane's.
- **Honest note:** the keep's and storm's swing comes mostly from the bot fix, not from the new foe AI. The keep's mash damage is swimmers (eels, anglers), which the walking-foe rules do not touch. The act-III tier and the drowned captain duel did the rest. Storm's pyro holds only because she is held. Longwater's pyro is held too, and is noisy at 38-51% min hp.

## The difficulty curve (level-1 knight, 3 runs: health lost a run / deaths)

**Out of their act band** (all on CURVE_REPORT_ONLY):

| level | act | measured | why it misses |
|---|---|---|---|
| kings | I | 176% / 5d | over the death ceiling (3) |
| scree | II | 414% / 7d | over both ceilings |
| underleaf | II | 45% / 0d | easy: under the 70% floor |
| storm | II | 26% / 0d | easy: the pilot is lifted past most of it |
| crown | II | 506% / 7d | over both ceilings |
| undercrown | II | 345% / 9d | over the death ceiling (6) |
| longwater | III | 63% / 0d | easy: floor 100% and 1 death |
| reef | III | 97% / 0d | just under the floor |
| keep | III | 256% / 0d | no deaths |
| causeway | III | 71% / 0d | easy |
| theatre | IV | 61% / 0d | easy: floor 120% |
| fair | IV | 198% / 0d | no deaths |
| fallingtower | IV | 566% / 13d | over the death ceiling (12) |
| redgorge | V | 120% / 3d | under the 150% floor |

**Medians by act:** I 131%, II 136%, III 114%, IV 230%, V 198%. The curve does NOT rise: act III and act V dip.

**Every row** (lost% / deaths):
- Act I: wood 86/0, marsh 154/1, stockade 116/1, spore 70/1, kings 176/5, burning 131/0
- Act II: scree 414/7, hanging 112/3, spire 102/0, moor 271/4, storm 26/0, crown 506/7, underleaf 45/0, undercrown 345/9, oreroad 136/2
- Act III: longwater 63/0, reef 97/0, flotilla 111/1, hurricane 218/5, lamplit 114/3, deep 240/3, keep 256/0, causeway 71/0, harbor 273/4
- Act IV: waymeet 152/2, fields 230/6, burial 377/3, mage 161/3, fallingtower 566/13, witchlight 239/4, unburied 220/2, fair 198/0, theatre 61/0, canal 290/6
- Act V: caravan 198/3, welltown 240/6, redgorge 120/3

These rows were taken with the act tier on. There is no before-curve: the curve file is new. Undercrown is listed in act II by depth/table, although its depth is 12.

## Checks

**Green:**
- New: combat-part2, curve-gate.
- Combat: attack-tokens, foe-tactics, foe-tempo, bandits, untold-told, finishers, pogo-chain, tells, hint-shown, answer-tags, commitment, combat-feel, boss-greed, touch.
- Mash: mash-gate, mash-carry, level-quality.
- Required: architecture, checkpoints, skins, dangling-paths, npc-removal.
- Also: sprinkle-cap, elites, weapon-skins.

**Notes:**
- **foe-tempo:** now times TEMPO alone (REACT.on=false during its measurement). The varied held/quick/feint swings are timed by combat-part2 instead. This does not loosen the check: it still asserts every TIGHT windup at x0.8 with its floor.
- **attack-tokens:** green on this branch, including waymeet. On base it was red (two idle hedge knights). That may be incidental: foe-react draws extra random numbers and moves waiting foes, which shifts the pinned dice. Do not treat it as TOKENSFIX2's fix. That lane should keep its cause-fix.
- **combat-part2** was proved against the base: there is no RX on BK.tokens(), so every case errors.
- **Not run:** slopes-trace (it uses another port slot, and this lane changed no level data). Boss human-bot pilots were not run: boss fights are exempt from every rule here (TOKENS.exempt, bossActive and miniActive).

## UNVERIFIED
- Nothing was seen on screen: the guard bar, the held glint, the quick flash and the feint stamp.
- The human-speed level sample (1 forest, 1 sea, 1 desert, 1 late) is covered only by the level-1 curve pilot, which is the play bot, not the human bot.
- Fight-during-the-rule is a data heuristic.

## Questions for Daniel (rec first; the rec is what is built)
1. **The purse goes to 3 in act V only.** Rec: keep it so until TOKENSFIX2 lands, then consider act IV at 3 too. Act IV at 3 would change the attack-tokens waymeet case, which asserts 2.
2. **The mash bot fixes (held rooms, elite gates).** Rec: keep them. A masher shut in an ambush, or stopped at a captain's gate, has not beaten the level. Alternative: revert them and hold storm, keep and longwater by placing extra squads on the bot's route. That is level edits, and the Keep's exam is deliberately sparse.
3. **The curve bands** (tools/rule-state.mjs CURVE_BANDS). Rec: the sweep tunes levels into these bands; adjust a band only with your playtest. 14 levels miss today, and the act medians dip at III and V.
4. **The keep** is mash-safe only through its swim stretches and the captain duel. Rec: the act-III sweep lane adds a designed squad in THE INNER KEEP from the act-III roster.
