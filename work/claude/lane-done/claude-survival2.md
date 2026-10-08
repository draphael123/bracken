# claude/survival2 - ONE FLASK, A SHRINE GIVES ONE BACK, BREAK THE SHRINE, STAMINA +40%, THE A10b SPACING REPORT

Daniel's decisions 2026-10-07 after playing the pilot Marsh (design-standard A10b), built as given. Base: claude/survival f95c83c5, then
origin/claude/levelpilot merged first (d62b2c05: the walker, the campaign jump, the pilot marsh + causeway). Port 8717 only.
Every test change below is Daniel's approved design change, at the same strictness; each commit says so.

## What changed
Numbers live in `src/survival.js`; main.js keeps small local hooks.

1. **ONE FLASK TO START.** `FLASK.base` 3 -> 1; the store's EXTRA FLASK (id `tonic`, 150 gold) still sells 2 -> **max 3**. Store text:
   "you start with one; the smith can make it three. a shrine gives one back, a death all."
   **Old saves:** `PROG.flaskUp` is kept one for one (0..2, clamped as before), so a save that bought extras keeps every one it paid for
   (max 1 + bought, cap 3). **No refund**: each purchase is still +1 flask. (The survival branch never reached master, so only playtest saves
   have bought any.) The old red-tonic refund (40 gold each, `PROG.tonicRefund`) is unchanged.
2. **A SHRINE REACHED GIVES BACK ONE** (`SV.shrineRefill`: +1, never over the max, never taking a broken shrine's extra away), **once a shrine
   a life**: each shrine remembers the life it last gave in (`lifeN`, which a death/respawn bumps; **R - back to the shrine - is not a new life**,
   so R + touch cannot farm flasks). Shrines still light/save/bank and refill stamina on that same once-a-life touch; still no heal.
3. **A DEATH RESTORES ALL** (`SV.deathRefill` = max(held, max): to the max, and an undrunk broken-shrine extra stays) + full hp as before.
   The start of a wood sets the flasks to the max (an extra does not carry into the next wood).
4. **BREAK THE SHRINE** (Shovel Knight). At a lit shrine a prompt stands over it: **"HOLD E: BREAK THE SHRINE / +1 FLASK, NO CHECKPOINT"**
   (the key name follows the device: E / UP on a pad). **Hold interact 0.6 game-s = 1 s at the default speed**, on his feet, not swinging,
   drinking or hurt; a bar fills under the prompt; a tap does nothing. Then: crack + heavy sound, a shake, rubble, "SHRINE BROKEN +1 FLASK",
   the told line "SHRINE BROKEN: +1 FLASK. NO CHECKPOINT HERE NOW." The shrine is drawn dark, split down the middle, rubble at its foot.
   - **+1 flask, over the max if need be** (e.g. 4/3); the HUD draws the extra flask with a gold mark over it.
   - **The checkpoint goes**: if it was this shrine, a death wakes at the shrine lit before it (lighting order), else the wood's start. A broken
     shrine never lights again, never banks, never gives a flask, cannot be used for the loadout ("safe shrine") - **until the wood is left or
     restarted** (startGame mends them; a death does not).
   - **Never**: in a boss arena, while a boss fight runs, at **the pre-boss shrine** (the nearest one outside the arena's near wall - the boss's
     retry point stays; `SV.preBossShrine`), at the chase's start shrine, in a trial or the shop. (My rec, built - Q1.)
   - **No soft-lock**: a shrine is a picture, never a tile; the test walks the hero on past a broken one.
   - **Bots never break**: the hold reads `keys.talk`, which only a person's key (keydown/keyup) or player one's pad sets; bots press, they
     never hold talk. tools/survival.mjs pins that `keys.talk = true` is set in exactly one place.
5. **STAMINA REGEN ~40% FASTER**: `src/commit.js STAM.regen` 75 -> **105**/s (`SV.STAM_REGEN_MUL` 1.4). The delay (0.3 s), the exhausted beat,
   the winded rate and the no-regen-while-committed rule are unchanged; every upgrade (level growth, LUNGS, STEADY BREATH) multiplies on top.
   tools/commitment.mjs (no regen through a swing/roll, the 4 s mash still stamina-negative, the exhausted rules) stays green as it was.
6. **FEWER SHRINES - REPORT-ONLY**: `tools/checkpoint-rule.mjs` gains `A10B = { min: 140, max: 260 }` and `judgeA10b` / `judgeLevelA10b`
   (SPARSE over 260, DENSE under 140 unless a door/pinned one - the first shrine counts from the start - and NO DOOR before a boss/mini/ambush
   room), with made-up-level self-checks. `tools/checkpoint-gaps.mjs` prints the list and fails none for it; the old >= 80 / <= 200 rule still
   gates. **35 of 40 campaign levels miss** today (almost all DENSE: today's shrines are ~80-150 apart). Sweep lanes: run
   `node tools/checkpoint-gaps.mjs` and read the "A10b REPORT-ONLY" block; no shrine was moved here.
7. **The campaign kit** (`src/campaign-kit.js`, shared by the walker and `?level=<id>&campaign=1`): `flaskUpAt(id, depth)` by act
   (src/foe-react.js actOf) - **act I 1 flask, act II 2, act III+ 3** - set before the reset so the game fills them. tools/level-jump.mjs now
   asserts the count (marsh 1, causeway 3).
8. Text: the shrine hint ("A SHRINE SAVES AND GIVES BACK ONE FLASK. IT DOES NOT HEAL: DRINK ONE (U)."), the loading tip, a new tip ("HOLD INTERACT
   AT A SHRINE TO BREAK IT: +1 FLASK, BUT NO CHECKPOINT THERE."), the store line. The prompt hides while a hint is up (they shared the band).
   Bots: the v2/human drink hook and the walker's drink hook are unchanged.

## Tests (Daniel's approved design change, same strictness)
- **tools/survival.mjs**: start 3 -> 1 flask, smith max 5 -> 3; the shrine check 1 -> 3 becomes 1 -> 2 of 3. New: no second flask from a shrine
  in the same life; R is not a new life; break - a tap does not break, the hold breaks in breakHold (60 f), +1 over the max (4/3), checkpoint back
  to the shrine before, told, no relight, walks on past it, a death wakes at the shrine before with 4/3 and it stays broken, the pre-boss shrine
  and a boss fight refuse, a restarted wood is mended; stamina measured 105.0/s on a fresh knight; node checks of shrineRefill/deathRefill,
  STAM.regen = 75 x 1.4, the single keys.talk setter.
- **tools/level-jump.mjs**: flasks == flasksAt(id, depth) (was > 0).  **tools/leveling.mjs**: the sinks message (max 2 is unchanged).
- Green (port 8717): survival, store, leveling, leveling2-runtime, commitment, level-jump, level-walk-selftest, loading-screen, checkpoints,
  checkpoint-stand, checkpoint-gaps (+ the A10b report), textfit hud + hints + store + card + settings (0 issues).

## THE WALKER (tools/level-walk.mjs, 3 seeds x knight/warden/pyro, campaign level, human+first)
deaths (hazard/elite) / arrive% at shrines mean/min / share of the route measured. LEVELPILOT FINAL = 3 flasks, shrines fill all, stamina 75.
| level | hero | LEVELPILOT FINAL | SURVIVAL2 |
|---|---|---|---|
| marsh L3 (1 flask) | knight | 4.7 (0/2.0) 65/47 45% | **7.3 (0/3.7) 67/5 23%** - wall, wall, boss |
| | warden | 7.7 (6.0/1.0) 53/43 16% | **8.0 (3.7/1.3) 54/45 8%** - wall x3 |
| | pyro | 6.3 (0/4.0) 62/36 37% | **6.0 (0/2.3) 43/40 14%** - wall, wall, boss |
| causeway L20 (3 flasks) | knight | 0 72/49 52% | 0 71/49 52% |
| | warden | 0 60/43 37% | 0 68/50 43% |
| | pyro | 0.3 (0/0.3) 58/38 90% | 0.3 (0/0.3) 72/45 92% |
(marsh knight seed 1 of the first pass died to a page fetch error under load; the knight row is its own 3-seed re-run. Raw logs/JSON:
scratch\survival2\walk*.log/json.) Walker noise at 3 seeds is +-15 arrival points.
- **MARSH: the walker now walls (8 deaths) in 6 of 9 runs**, almost all in its first section (start -> the shrine at route 103): the goblin
  bows and wasps at 76,17 and the THORNCASTER elite at ~88-104. With one flask and the first shrine 100 tiles in, every death replays the
  same opening. The warden still dies to the trap/wasp at 168,19 (the ferry; a known walker limit). Deaths per first run were already over the
  1-2 target; with one flask it is further over. RED for the pilot - see Q2.
- **CAUSEWAY** (3 flasks at act III, same as before): unchanged within noise (deaths ~0, arrivals 68-72%: still OVER 50%, under the death
  target). The faster stamina does not show as a clear swing at 3 seeds.

## Mash rows (tools/mash-bot.mjs, LEVEL then BOSS, --write)
The masher never drinks, so the flask rules do not touch it; only the stamina regen can move it (its winded waits are shorter). Re-stamped the
two pilot levels (marsh, causeway). Only those two rows changed in docs/mash-bot.json.
- LEVEL: every hero drops to 0% on both - marsh 29 deaths each (was 29-32), causeway 2-3 deaths (was 3).
- BOSS: **0/6 on both** (frog: boss left 87/87, 95/72, 99/98% - was 99/99, 78/65, 99/88; kraken 90/90, 92/92, 98/98 - unchanged but for the
  warden's 32.1 -> 35.1 s). The numbers moved a little (the stamina), the verdicts did not. tools/mash-gate.mjs: 40 levels hold (fallingtower
  mini report-only, as before).

## Red
- **The marsh walls the walker under one flask** (above). Pre-existing for marsh's ferry/warden STUCKs (levelpilot's report).
- **The level-1 curve rows (docs/level1-curve.json) and every other mash row were measured with 3 flasks / stamina 75.** They are hash-keyed on
  level data, so curve-gate and mash-gate stay green, but their numbers are pre-A10b. Not re-run here (40 levels; other lanes share the PC).
- A10b: 35/40 levels miss the new spacing (report-only, by design: tomorrow's sweep).

## QUESTIONS FOR DANIEL
1. **Where a shrine may NOT be broken** (built): in a boss arena, during a boss fight, the **pre-boss shrine** (the boss's retry point), the
   chase's start shrine, trials and the shop. Rec: keep the pre-boss one unbreakable - breaking it would turn every boss retry into a section
   replay. Alternative: allow it (a true high-roller choice).
2. **The marsh at one flask.** The walker walls 6 of 9 runs in the first section. Rec: the sweep's A10b spacing (the marsh's first shrine at
   ~140-260 is FURTHER, which makes this worse), so pair it with an act-I mercy: either the marsh's first goblin bow/wasp beat thins, or act I
   keeps the first shrine closer (exempt the first section from DENSE in act I). Your playtest decides; nothing tuned here.
3. **A broken shrine's extra on death** (built: KEPT until drunk - a death refills to max(held, max), so 4/3 stays 4/3; one drunk -> 3/3 and the
   death refills to 3). Alternative: a death resets to the max (the extra is lost with the life).
4. **Old saves** (built: bought extras kept one for one, no refund - each is still +1; max 1 + bought). Alternative: keep their old TOTAL
   (a save that had 4 gets flaskUp 2 = 3, the cap).
5. **Hold time** 1 s at default speed (0.6 game-s), interact key (E, pad d-pad up). **Phone**: not built - the phone's contextual button is a
   tap; rec: a long-press on the ctx button showing BREAK when standing at a breakable shrine (a small touch-interact lane job).
6. **The prompt** shows whenever you stand at a breakable lit shrine (hidden while a hint is up). Rec: keep; alternative: show it only after
   standing still ~1 s, or only after the first time it is told.
7. **Campaign kit flasks by act** (built: act I 1, act II 2, act III+ 3 - the walker and ?level=&campaign=1). Rec: as built; the store's
   150-gold price makes the 2nd affordable by the Crags.
8. **Re-measure everything at 1 flask?** The level-1 curve, all mash rows and the boss human-bot rates were read at 3 flasks / stamina 75.
   Rec: the coordinator runs mash-bot --all and level1-pilot --curve overnight; the boss bands (human bot drinks) will read lower at 1-2 flasks
   in acts I-II.
