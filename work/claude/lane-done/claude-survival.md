# claude/survival - THE FLASK, DRY SHRINES, % HAZARDS, DEADLY EXAM SPIKES

Daniel's approved design (2026-10-07, after scratch/audit-healing.md: healing OPTION A + design-standard A10 amended). Every test
change below is that approved design change, at the same strictness, and each commit says so.

## What changed
Numbers live in `src/survival.js` (new); main.js keeps small local hooks.

**Healing (option A)**
- **THE FLASK**: the red tonic is no longer auto-drunk. 3 flasks a shrine interval, each **+35% of max hp**; drunk on **U / 1**
  (rebindable row DRINK FLASK), **LT** on a pad (talk keeps the d-pad up; LT was talk's second button), the phone's ctx button shows
  **FLASK n** when no lane hook answers. A **committed drink**: 0.45 game-s (= **0.75 s at the default 0.6 game speed**), rooted, no
  swing/jump/roll; the swallow lands at 0.3 game-s (0.5 s); **a blow before the swallow SPILLS it** (spent at the lift, S&S). Flask
  in hand drawn up to his mouth (drawFlaskDrink). HUD: flask icons, full bright / drunk faint. Hero card: flasks n/max.
- **Shrines are dry**: light, save/bank, refill flasks + stamina, **no hp**. Death respawn and level-up stay full heals (respawn also
  fills the flasks). **R / Back to shrine** now carries hp and flasks (it was a free full heal).
- **Hearts** +12% of max hp (was flat +20). **Kill heals** halved and capped: HEART CHARM 3, BLOOD DRAWN 1, BLOODLETTER 2, max 5 a kill.
- **Store**: the `tonic` line (id kept for saves/golden stock) is **EXTRA FLASK**, 150 gold, max 2 (3 -> 5 flasks), PROG.flaskUp.
  Old saves' carried tonics are **paid back at 40 gold each** (PROG.tonicRefund). RICH TONIC perk -> RICH FLASK (45% instead of 35%).
- Text: charm/perk texts, two loading tips (shrine fills flasks, does not heal; U drinks), told hints twice a save (first shrine,
  first time under 50% hp with a flask, first hazard hit).

**Falls (A10 amended)**
- **Spikes and deep water in L.waterHurts woods cost 27% of max hp** via a new `pct` option in damagePlayer0 that skips the
  difficulty/tier/co-op/armour chain, and **hand the hero back to P.safe** (spikes gain the return; P.safe is never footing beside
  spikes; no return when the bite was dodged/i-framed). Hazard damage can still kill a hero already under 27% (as water could before).
  Bottomless pits unchanged (already a death).
- **Exam spans**: `L.examSpans = [[x0, x1], ...]` (tile columns) and `L.fallRule = 'death'` (level-wide, none set). In a span, spikes are
  a **real death** ("THE SPIKES"); walking in says "THE EXAM: HERE THE SPIKES KILL." (again after each death). Lint in tools/survival.mjs:
  every span with spikes needs hurt spikes earlier in its wood (never untold). **Marked: the Harvest Fair's LAST ROUND [525, 618]** (its
  existing exam arc; spike yard 560-594). Wind-zone spikes (spike-winds.js) stay the zone's.

**Bots** (for the WALKER lane - exact names it calls): `BK.drinkFlask()` (drinks one if held, returns true/false), `BK.flasks()` (count
held), `BK.flaskKey` (the key name, 'U'), also `P.flasks`, `BK.flaskMax()`, `BK.press('flask')`. The **human** profile drinks under
35% (`drinkAt: 0.35`; `human+dry` = no drink, the old rows' hands). `makeBot` (playtest level walker) drinks under 35%. The **legacy**
boss bot never drinks (its rows stay byte-identical; the Quartermaster walker inside bossLab is kept dry for legacy). The mash bot never drinks.

## Tests touched (Daniel's approved design change, same strictness)
- tools/survival.mjs (new): % hazard bare and armoured, hand-back, water, exam death + told line, untold-exam lint over every wood, flask
  heal/commit/spill/key/LT/phone/no-auto-drink, dry shrine, R carries, death full, heart 12%, charm 3, walker API names.
- tools/store.mjs: the batch50 save's 2 tonics are refunded (80 gold) instead of carried; buying the `tonic` line is an EXTRA FLASK (150, flaskUp 1).
- tools/store-stock.json: tonic price 40 -> 150 (rewritten with STORE_WRITE=1, only that row changed).
- tools/leveling.mjs: sinks `max: 5` -> `max: 2` (3 + 2 flasks); VIGOR 10 source check reads `bloodDrawn: !!thr('v', 0)`.
- tools/leveling2-runtime.mjs: VIGOR 10 heals exactly 1 (was >= 2).
- tools/settings-tabs.mjs: the reset row is ACTION_IDS.length (a new DRINK FLASK row moved it from 15 to 16).
- tools/rule-state.mjs: CURVE_REPORT_ONLY shrinks (kings, scree, crown, fair back in band).
Not changed, re-run green: canal-water, redgorge, moor-rocks, death-cost (they assert the waterHurts flag, kept), touch, loading-screen,
textfit (hud, hints, card, settings, store), curve-gate, level-quality. (textfit's full talk scope timed out on the loaded PC - 480 s scope
limit, not a failure of a string; the scopes this lane touches are green.)

## Re-measures
**Boss spot check** (tools/harnesscard-rates.mjs --mode=new --seeds=2, knight/warden/pyro, campaign level, human vs human+dry):
| boss (L) | human (drinks) | human+dry (old hands) |
|---|---|---|
| kings L4 | 5/6 | 4/6 |
| crown L12 | 6/6 | 5/6 |
| fields L25 | 5/6 | 2/6 |
| total | 15/18 (83%) | 11/18 (61%) |
Three flasks (+105% of a bar) move a boss a lot when the bot drinks - NOT "little change": the old rows were measured with no heal at all.
See question 1.

**Level-1 curve** (tools/level1-pilot.mjs --curve, 3 runs, makeBot drinks): deaths / lost% before -> after
wood 0/86 -> 0/69, marsh 1/154 -> 1/129, kings 5/176 -> 2/185, scree 7/414 -> 5/376, moor 3/332 -> 3/393, crown 7/506 -> 4/307,
fields 6/230 -> 2/213, fair 0/198 -> 3/370 (the exam yard now kills), witchlight 4/239 -> 2/217 (written).
canal 12/436 -> 9-10/724 and redgorge 6/269 -> 0-1/228-ish (two passes each, NOT written - see "red").

**Mash rows**: see the end of this file (LEVEL then BOSS re-stamp for fair, marsh, moor, canal, redgorge).

## Red
- **canal**: with the % water (27% at L1 vs ~16-20%) the level-1 pilot loses 724% a run = A WALL over act 4's 600% ceiling (deaths 9-10,
  in band). **redgorge**: with flasks the pilot dies 0-1 times, under act 5's floor of 2. Both rows were left as they were (redgorge's
  row was already stale on master) rather than writing a red gate; the live numbers are above. Rec: re-band these two under the flask
  economy once the WALKER lane's campaign-level measure lands, or make canal's water 25% (the low end of Daniel's 25-30%).
- curve-gate lists storm, unburied, redgorge, skyroad as stale rows: pre-existing on master (level data changed since their rows).

## QUESTIONS FOR DANIEL
1. **Boss measures and the flask.** A real player meets every boss with 3 flasks (a shrine before the arena refills them). With the human
   bot drinking, the spot check went 61% -> 83%. Rec (built): the human standard drinks (`drinkAt: 0.35`), so boss bands are read with the
   flask the player has; bosses near the top of 50-60% will read high and need a retune pass. `--profile`/`BOT_PROFILE=human+dry`
   reproduces the old rows. Alternative: standard stays dry and bands are re-read later.
2. **Store**: the 40-gold tonic was a never-filling gold sink; it is now EXTRA FLASK 150 gold x2 (permanent). Rec: keep; add a later sink
   (e.g. a flask potency upgrade) if gold piles up. Old saves' tonics paid back at 40 each.
3. **Drink time**: 0.45 game-s = 0.75 s on the clock at the default speed, swallow at 0.5 s; a blow before it spills. Rec: as built.
4. **Pad**: the flask took LT (talk keeps d-pad up). Rec: as built.
5. **Witchlight's exam** [519, 564] is not marked: its moat spikes are wind zones (your one-bite + wind rule, 20% bite). Rec: leave; should
   the wind bite become 27% to match the new hazard rule?
6. **Exam candidates** (spike pits inside or at the end of a section; mark after a told cue is checked in play): fields [548, 593],
   waymeet [669, 697], oreroad [281, 324], mage [612, 726], theatre [248, 273], unburied [436, 438], scree [459, 460]. Existing exam arcs
   with no spikes (marking changes nothing until spikes are added): canal [346, 389], glasssea [574, 603], burial [367, 466], keep's King's door.
7. A hazard can still kill a hero already under 27% (rec: yes, as water could before; the alternative is a min-1-hp floor).
8. R (back to the shrine) no longer heals (it was a free full heal with dry shrines). Rec: as built.

## Mash rows (tools/mash-bot.mjs, LEVEL then BOSS, --write)
Re-stamped fair, marsh, moor, canal, redgorge (the levels the exam span and the % water touch). The masher never drinks.
LEVEL: every hero dies (lowest hp 0%) on all five - fair 4-5 deaths, marsh 32, moor 4-48, canal 10-11, redgorge 2-3.
BOSS: 0/6 mash wins on all five (bosses, minis included). tools/mash-gate.mjs: 40 campaign levels hold (fallingtower mini report-only, as before).
