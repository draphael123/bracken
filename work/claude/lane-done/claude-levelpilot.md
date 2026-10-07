# claude/levelpilot - THE LEVEL DIFFICULTY PILOT (marsh + causeway, the v2 recipe)

Brief: scratch/brief-levelsweep.md v2 (Daniel 10-07: "levels are still incredibly easy" - a middle ground between SHOVEL KNIGHT and
SALT & SANCTUARY). Base: origin/master 3fa2e11d + claude/walker, then origin/claude/survival merged (f95c83c5, its lane report was done).
Measured with tools/level-walk.mjs (campaign level, typical build, human+first eyes, knight/warden/pyro x 3 seeds), port 8712 only.
Raw logs/JSON: scratch\levelpilot\ (before.*, C-orig-survival.*, E-final.*, F-marsh.*, marsh-v1.*, causeway-v2.*).

## WHAT CHANGED
**THE MARSH (level 2, act I, L3)** - src/level.js marshWood (a pilot block in FINAL columns) + ELITES.marsh
- THE ELITE THORN leaves the stilts (x56-72, where both stilt archers were locked in with him: the marsh's whole threat in one room) for the far
  bank of the archer island (x98, gate 105): section one's EXAM, one on one with the water at your back, checkpoint 109 after it.
  (An elite FROG was tried there first: the elite lab's human bot killed it in 1.8 s - no exam; thorn kept, affix THORNED unchanged.)
- The long river's first half is section two's EXAM (checkpoint on the reed bed at 259 after it): a stinging wasp in the arc of the bud pad's
  throw (238,12), an archer at the far end of the first stage (247,13) - the high road's coins are a fight on a board over water, and its arrows
  reach the low road's pads.
- A spitter on the second reed bed (275,15): the rest is not a rest until it is cut down.
- Tried and taken out: a wasp in the reed climb's hops (53,13) - the fresh level-1 knight lost 280% a run with it, over act I's 250% ceiling.
- Rule, identity, route unchanged; no new AI, no health change. The reed island ambush, the ferry, the grove raft and the mud-flats exam untouched.

**THE DROWNED CAUSEWAY (act III, L20)** - src/level.js theDrownedCauseway (pilot block) + ELITES.causeway + src/foe-react.js LEVEL_DMG
- THE STONES: a petrel over the hops (131,23), a scout on the far road covering them (148).
- THE ARCADE: a scout past the broken span (229, top road).
- THE BROKEN SPANS: petrels over the first two breaks (436, 454), a tide guard holding the first landing (440, the sea at your back), a scout at
  the end of the second span covering the next break (449).
- THE WAYSTATION: a netter on the holm over the climb up from the boom (494,18).
- THE LAST MILE is the road's EXAM: its tide guard (530) is a SECOND ELITE (UNSTOPPABLE - the breakers don't move him, gate 538), a scout on a
  parapet stone behind him (533). Checkpoint 561 after it. Two elites of one kind key by column, so each names its own affix (the first keeps
  SUMMONER via the ent).
- **LEVEL_DMG** (src/foe-react.js, new export): a per-level weight on the act's damage tier for COMMON foes' blows only (elites/bosses/minis
  untouched, health never). causeway x1.5 (act III 1.2 -> 1.8). 1.4 / 1.5 / 1.7 were walked; see the recipe. **A deliberate design knob - Q1.**

**tools/level-walk.mjs (the smallest fixes that unblocked measuring my two levels; noted per the brief)**
- --from=X debug start (not a first run). Pad to pad is a held full hop steered onto the next pad's middle; the hands wait out a river eel's told
  leap; they never fight or hunt a river eel from a sinking pad (marsh STUCK 229,17 in every run: knight and warden now cross the river; pyro
  still sticks there on some seeds - see "red").
- THE FLASK (survival merge): the walker drinks BEFORE the hands swing (a bot mid-swing could never drink: committed), drinks counted against
  the count at the top of the frame, the delayed swallow's heal booked as the drink's (it was booked as a small heal, so every pre-fix log
  under survival shows 0 drinks - the play was the same, makeBot drank). The run line says "3 flasks" under the flask game.
- The death log tags ELITE killers; the table's deaths column is deaths(hazard/elite). A per-run "hit by" tally (nearest foe at each blow,
  hits/%hp; "other" = nothing within ~5 tiles: range, water, breath).

**Tests / stamps** (no test weakened): tools/rule-state.mjs CURVE_REPORT_ONLY SHRINKS - causeway is back in act III's band (level-1 knight 276%
lost, 6 deaths in 3 runs) and gated again. docs/level1-curve.json rows marsh + causeway re-measured (--curve --write). docs/mash-bot.json rows
marsh + causeway re-stamped via tools/mash-bot.mjs LEVEL then BOSS (only those two rows changed).

## BEFORE / AFTER (walker; deaths per first run (hazard/elite), arrive% at shrines mean/min, share of route measured)
A = original level, old healing (full shrines, auto tonics), walker as merged from claude/walker. B = reworked, old healing, my hands.
C = original level, SURVIVAL healing (3 flasks, dry shrines, 27% water), my hands. D/F = reworked + survival (final).

| level | hero | A orig, old heal | B rework, old heal | C orig, survival | FINAL rework, survival |
|---|---|---|---|---|---|
| marsh L3 | knight | 6.7 (0) 62/51 17% | 6.7 56/4 32% | 3.7 (0.3/0.7) 62/29 43% | 4.7 (0/2.0) 65/47 45% |
| | warden | 8.0 (3.7) -/- 0% | 8.0 29/4 17% | 6.3 (4.7/0.3) 90/68 24% | 7.7 (6.0/1.0) 53/43 16% |
| | pyro | 8.0 (0) -/- 0% | 7.3 39/17 17% | 4.7 (0/2.0) 76/49 36% | 6.3 (0/4.0) 62/36 37% |
| causeway L20 | knight | 0 84/35 64% | 0 95/79 47% (x1.4) | 0 92/80 71% | 0 72/49 52% |
| | warden | 0 76/43 49% | 0.3 86/63 36% | 0 71/38 30% | 0 60/43 37% |
| | pyro | 0 80/32 86% | 0 66/39 72% | 0 69/39 86% | 0.3 (0/0.3) 58/38 90% |
(marsh FINAL = F-marsh, after the reed-climb wasp came out; with it (E-final) the arrivals were 40/43/63. Walker noise between near-identical
builds is +-15 arrival points at 3 seeds.)

Reading it:
- MARSH: FOE deaths that are neither elite nor hazard: 2.7 / 0.7 / 2.3 a run (C: 2.7 / 1.3 / 2.7) - inside or at the 1-2 target. The rest is the
  bot: the THORN ELITE (2-4 a run, now on the bank, fought by every hero - before, the warden got STUCK at the stilts room and never fought him)
  and warden's "A TRAP@168" (drowning at the ferry it cannot board, 5-6 a run, pre-existing) and 27% water falls from its hops. Arrivals
  53-65% (C 62-90%): close to, not under, 50.
- CAUSEWAY: arrivals 92/71/69 -> 72/60/58 under the flask game (C -> FINAL); min arrivals 38-49. Deaths 0-0.3: UNDER the 1-2 target. The
  hero's elite fights are mostly not measured (the bot cannot beat a guard-by-angle tide guard: STUCK 81,27 at the first, 545,23 at the new
  exam - every run), so the two places most likely to kill him are skipped.
- Level-1 pilot (the floor, fresh knight, 3 runs): marsh 129% / 1 death (survival's row) -> 195% / 1 death, walked 100% (act I band 40-250);
  causeway 71% / 0 -> 276% / 6 deaths, walked 100% (act III band 100-500%, 1-9: back in band).
- Mash bot: LEVEL - every hero drops to 0% on both (marsh 29 deaths, causeway 3); BOSS - 0/6 on both. mash-gate holds.

## THE RECIPE AS LEARNED (for the per-act lanes)
1. HEALING DECIDES WHETHER PLACEMENT SHOWS. Under the old healing (full-heal shrines, 5 auto tonics, kill heals) adding foes and x1.4 damage left the
   causeway's arrivals where they were (84 -> 95 knight). Under the flask economy the same placements moved them 15-30 points (C -> FINAL): every
   blow now carries to the next shrine. Measure after the survival merge, never before.
2. AT CAMPAIGN LEVEL, WHAT LANDS IS RANGE AND ELITES. The hit tally: on the causeway the top sources are "other" (nothing within 5 tiles: bows,
   nets, breath) and tide guard ELITES; a common melee foe lands about ONE blow a run - three skills kill it before it swings. So: a bow or a net
   covering a jump, a climb or a landing works; melee filler on flat road does not. Fewer, but placed where you cannot fight back.
3. FOES AT THE JUMP MULTIPLY THE HAZARD. In the marsh most of the cost is water (27% under survival) - a wasp or an arrow on a pad IS a fall.
   That is the Shovel Knight threat for free; tune the count of jump-moment foes, not their damage.
4. DAMAGE WEIGHT ALONE BARELY MOVES THE BOT (1.4/1.5/1.7 within noise): it is hit too rarely. Set it for a person (who is hit far more often than
   the walker) - x1.5 puts a causeway common blow near a fifth of a L20 bar. Keep it a per-act number in the end (Q1).
5. EXAMS: one weighty fight (an elite) on footing with the hazard at your back, the checkpoint right after. Every level wants one per section;
   ELITES.<id> with gate + own affix is the tool. An elite's kind must survive the lab's human for 15 s+ (the frog died in 1.8 s).
6. THE LEVEL-1 FLOOR BITES IN ACT I. One wasp in the marsh's second teaching beat took the fresh knight from ~200% to 280% (ceiling 250). Early
   levels: new threat in the exams and the second half of a crossing, never the teach screens.
7. WALKER LIMITS: it cannot duel guard-by-angle or thorn elites, board the marsh ferry with the warden, or pass the causeway's first elite gate.
   Read elite deaths and STUCK sections as bot limits; use 3+ seeds and compare means; coverage is still 16-90%.

## CHECKS RUN (targeted; shared PC, no full suite)
elites, spawns, marsh-exam, checkpoint-gaps, checkpoint-rule, killzones, floaters, deadends, sprinkle-cap, curve-gate, mash-gate, level-quality,
level-walk-selftest, combat-part2, reed-island, raft-call, survival (merged lane's) - all green. traps (20) and audit (286 lines) report the same counts
with and without this lane's edits: pre-existing (the marsh's lines are the archers' roof ledges and a sign at 389, all untouched).

## RED / OPEN
- Neither level is ON the walker target: causeway deaths 0-0.3 (wants 1-2), arrivals 58-72 mean; marsh total deaths 4.7-7.7 (elite + hazard +
  ferry drowning, bot hands) with foe deaths ~on target, arrivals 53-65. Daniel's play is the real read (the brief's playtest step).
- Walker STUCK still on these levels: marsh 229,17 for pyro on some seeds (after a river fall he is handed back to the bank at ~220 and the hop
  off the bank stalls), 112/124 (warden in the shallows), 168 ferry (warden drowns); causeway 81,27 + 545,23 (elite gates), 300,19 / 339,24 /
  353,31 / 401,27 (warden/pyro: chapel and wreck holds).
- canal/redgorge curve rows (survival's red) and the stale storm/unburied/redgorge/skyroad rows are untouched here.

## QUESTIONS FOR DANIEL
1. **LEVEL_DMG** (built: causeway x1.5 on common foes' blows, health untouched) - rec: keep it for the pilot; once you have played it, the per-act
   lanes fold it into ACTS[].dmg (act III 1.2 -> ~1.8) so every act-III level shares one number, and LEVEL_DMG goes. Alternative: drop it and
   rely on placement + the flask.
2. **The marsh's elite** moved from the stilts room (with both archers locked in) to the far bank of the archer island, gate 105, checkpoint 109
   after (rec + built: yes - a 1v1 exam at the end of section one).
3. **A second causeway elite** (THE LAST MILE's tide guard, UNSTOPPABLE, gate 538) as the road's exam before the Kraken's checkpoint (rec + built: yes).
4. **Causeway is still under target on the walker** (0 deaths). Next lever, in order (rec): (a) your play; (b) LEVEL_DMG / act III to ~1.8;
   (c) an ambush squad at the waystation holm (needs the thinned 499 checkpoint back before it, rule S4). Built: (a) only.
5. **The marsh river's safe return**: a fall anywhere in the long river hands you back to the bank at ~222 (P.safe skips any footing over a deep
   pool, reed beds included) - up to 85 tiles back, plus 27% under survival. Harsh, maybe unintended. Rec: let a reed bed count as safe footing
   (a survival/hazard-code change, not built here - that code is the survival lane's).
6. **Walker HANDS lane** (repeats the walker's Q7): elite duels (guard by angle, thorn), the marsh ferry, the causeway hamlet gate - rec: yes,
   Opus, before the per-act lanes lean on the walker's death counts.
7. **Act-I floor**: the level-1 band ceiling (250%) vetoed a wasp in the marsh's reed climb - rec: keep the band; new threat belongs in exams.
