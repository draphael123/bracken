# claude/burial3: lane report (2026-09-27)

This is Burial Caverns round 3, built from Daniel's decisions. Everything is on `claude/burial3` (branched from master `abcd773`) and pushed. I did not touch master, did not deploy, and did not run the full suite.

## Commits

| sha | what |
|---|---|
| `ae2b179` | the five changes, the two checks, the before pilot, and the captures |
| `d254d99` | a local path scrubbed from the check log |
| (final) | the after pilot and this report |

## What changed

**1. The Buried Dead: two new told attacks** (`src/buried-dead.js`, frames in `src/buried-dead-art.js`, marks in `src/marks.js`)

- **GRAVE HANDS** (`handsTell`, 1.1 s, `!!`, in both phases):
  - Over the wind-up, the earth cracks in a line running from him toward where you stood. He has his own pose for it: a fist driven into the floor.
  - Then a line of arms comes up along that crack, one every 22 px, travelling outward.
  - Each arm does 18 damage and cannot be blocked. You answer it with your feet: a jump clears it, and so does a ledge.
  - Or you answer it with the level's rule. **No arm rises inside a burning vent's light (96 px)**, and the crack is not drawn there. Each arm checks for light at the moment it would rise, so lighting a vent during the tell still works.
  - It opens nothing. If a vent scorches him mid-tell, the line is cancelled.
- **GRAVE BREATH** (`breathTell`, 1.3 s, `!`, **phase two only**):
  - He draws the cold in (own pose: head back, jaw wide), then a cold wave goes out both ways across the lair.
  - It **snuffs every burning vent it passes** and **the FIRE IN YOUR HAND**. Snuffed vents can be lit again.
  - Close in (110 px), it does 10 damage, and a shield turns it.
  - You relight from the candles at the lair's walls. The message says so, and the bestiary and the lair sign were updated to match.
- **Phases (A10):**
  - Phase 1 is now slam, throw, **hands**, nova, claw, cleave, sink, call.
  - Phase 2 is slam, **breath**, throw, body, **hands**, nova, claw, sink, cleave, call.
  - What changes when he enrages, in one sentence: *the vents you light stop staying lit*.
  - Sink stays three turns before the slam, so the arm-in-the-ground punish keeps its timing.
- **His kit and SCORCHED are unchanged**, and the new attacks open nothing.

**2. No crown.** I removed it from his sprite: the head is now a bare, cracked skull with a few strands of hair, and the buried mound shows the dome of the skull. The procession backdrop's effigy wears a stone hood now instead of a crown.

**3. The Drowned Ossuary has things going on** (`src/burial-caverns.js`, `src/burial-expansion.js`)

- **16 FLOATING BIERS** on the black water, laid out as a hop path between the coffin lifts:
  - Land on one and it holds for 0.55 s, creaking and shuddering (that is the tell).
  - Then it sinks 40 px and takes you into the water.
  - Left empty on the bottom, it waits 1.6 s and floats back up.
- **7 DROWNED HANDS** under the water:
  - Swim near one, or stand on a bier at the surface near it, and it is told: the water boils, a pale hand shows, and the `!!` mark appears.
  - After 0.9 s it grabs: 10 damage, you are pulled under and briefly snared.
  - A hero standing on a pier cannot be reached.

**4. No timber in the ossuary.**
- The three wooden ledges are gone. The walkway is dressed stone ledges (a new `cryptStone` tile set, chosen through a new `L.ledgeZones`), standing on the arcade's square piers with arch shoulders, in the crypt backdrop's own stone colours.
- The vault ledge in the west wall is stone as well.
- The swinging chains carry stone slabs, and the coffin lifts are drawn as stone coffins. Both were drawn as logs before.

**5. THE ARCADE WALK, the upper walkway, is crossable end to end and optional** (`WALK` in `burial-caverns.js`)

- You get up by a chain off the west pier. Then there are nine stone ledges at rows 56 and 57, with gaps of 2 and 3 tiles and steps of at most one.
  - Hero head room stays under the lowest point of the swinging slabs.
  - No ledge sits at the height where a rising coffin would reach it.
- It ends over the east pier at a hoard of 10 coins and a coffer, and you drop down to the pier. The hoard was placed because S7 says the hard road pays.
- The archers and the bone goblin now stand on the walk and shoot down at the water.

**Moved into modules:** the bier, the drowned hands, the mover and ledge drawing, and the pier drawing all live in `burial-expansion.js` and `burial-looks.js`. `main.js` only gained one-line hooks. `updateBuriedDead`'s wrapper in `main.js` stays there, because it reaches too many globals to move cheaply.

## New checks (both registered inside `tools/check.mjs`'s list, before `]) if (take(t))`; confirmed with grep)

- **`burial3`** (Node, 0.5 s). It checks:
  - hands stay down in a vent's light, come up past it, are told, cannot be blocked, and are cleared by a jump;
  - breath snuffs every vent and the hand, happens in phase two only, and the lair has a candle at each wall;
  - **no crown** anywhere: 0 crown-gold pixels on all 20 frames and on the procession. It fails on the old code (1,509 and 240 pixels);
  - the walk: its tiles, gaps ≤ 3, the chain, the reach model standing on every tile, the hoard ≥ 8, **the east pier still reachable with the walk removed** (so it is optional), and no timber ledge left in the ossuary;
  - biers hold, sink, and come back up;
  - drowned hands are told, grab someone who stays, miss someone who leaves, and never reach a pier.
- **`burial3-keys`** (page, about 35 s, real keys, no god mode). It checks:
  - **knight, pyro and pirate each cross THE ARCADE WALK end to end with real keys** (20 to 22 s, 21 to 24 coins). Health is held at 50% or more, as in `burial2-keys`: blows still land, but a death does not end the traversal test;
  - a bier holds 0.62 s, sinks 35 px, and the hero ends up in the water;
  - a drowned hand tells, then grabs (13 hp);
  - GRAVE HANDS do 0 damage in a lit vent's light and 23 out of it;
  - GRAVE BREATH leaves no vent lit and no fire in hand, and the wall candle gives the fire back.

## Checks run (named only; log in `work/burial3/checks.log`)

**All green:** buried-dead, buried-attacks, boss-openings, burial2, burial-vents, burial-route, burial-geometry, burial-rework, burial-variety, buried-dead-art, tells (554 rows, regenerated), burial3, burial3-keys, deadends, checkpoint-gaps, signs, textfit, footing-art, additional-areas, additional-areas-runtime, arena-supplies, collectables, boss-fight-end, syntax, dangling-paths, comments.

`signs` was red at first: the walk's sign ran to 3 lines. I shortened it and re-ran `signs` alone, and it passed.

## Pilot: the Buried Dead, bot, refill health, 150 s, seed 1 (`tools/burial2-pilot.mjs`, which now takes a hero list)

| | BEFORE | AFTER |
|---|---|---|
| kills | 3/3 | 3/3 |
| knight | 83.4 s, 201 hp/min | 90.5 s, 197 hp/min |
| pyro | 114.7 s, 196 hp/min | 101.3 s, 134 hp/min |
| pirate | 96.2 s, 184 hp/min | 110.4 s, 169 hp/min |
| median kill | 96.2 s | 101.3 s |
| openings | scorched 10, stuck 3 | scorched 13, stuck 3 |

The rows are in `work/burial3/pilot-{before,after}.txt`. I did not tune anything toward a number.

- The "hitBy" table records his mode at the moment a hit lands. The hands land after he has gone to his rest, so their damage is counted under `rest` (341 before, 365 after). Breath shows as `breathTell` (5).
- With one seed, per-hero swings are noise. The pyro's lower damage taken is most likely the seed, not a trend.

**Captures:** `work/burial3/look-*.png` show the walk, biers, a hand's tell and its grab, the hoard, GRAVE HANDS' crack and rise, GRAVE BREATH, and his face with no crown. The sprite sheet is `docs/burial/buried-dead-sheet.png`.

## UNVERIFIED

- Nobody has played any of it. Unfelt so far:
  - the bier's 0.55 s hold;
  - the hand's 0.9 s tell;
  - how readable the arms are (28 px tall);
  - whether breath in phase two feels like a real change or like a chore.
- The walk's real-keys proof covered three heroes. Warden, paladin, reaper and geomancer were not walked. Their real jumps are within the measured 3.2 to 4.5 range, and the widest gap on the walk is 3 tiles.
- The lab bot has no advice for the new attacks. It won all 3 fights anyway.
- `burial2-keys` (the whole-road walk, about 15 minutes) was not re-run. The biers are optional platforms and the main swim is unchanged. `burial-route`, `deadends` and `collectables` are green.

## QUESTIONS FOR DANIEL

1. **Should the biers carry a drowned hand right under some of them**, so standing still on one is always punished, rather than only near one? *Recommendation:* keep what is there (hands between the biers) until you have played it. The sink already punishes standing still.
2. **Should GRAVE BREATH do damage at all?** Right now it does 10, a shield turns it, and only within 110 px. Its real cost is losing your fire. *Recommendation:* keep the small chip, so it reads as an attack and not a weather event.
3. **The lair's own ledges and the Candle Path's are still the mine's wooden staging.** I changed only the ossuary, as asked. *Recommendation:* give the processional hall dressed-stone ledges too, as a small follow-up, reusing the new `L.ledgeZones`.
4. **The walk's hoard is 10 coins and a coffer.** The level already holds its 3 silvers, and every relic is spoken for. *Recommendation:* keep coins for now. If you want the high road to feel special, give the Burial Caverns a relic of their own later (a grave-candle charm?), which needs a new relic kind.
5. **GRAVE HANDS appear in phase one too**, as the fight's first reason to light a vent for your own safety. *Recommendation:* keep them in both phases. The phase-two change is the breath. If phase one feels crowded, move the hands to phase two only.
