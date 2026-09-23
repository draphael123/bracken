# THE DIVING BELL BOSS -> A GIANT CRAB — rework brief (Daniel, 2026-09-21, from playtest)

## What Daniel said
"Diving bell boss needs work. He has barely any attacks, and I'd like him to just be a giant crab. Let's give him
three-four new attacks:
1. He throws rocks at the player.
2. He scuttle charges on the ground periodically.
3. He can swim himself and charge the player.
4. His claws are long and stretch, which he uses.
The level is generally good, although I'd like some fish to swim around, and for the level to be a bit more atmospheric."

## Where things are
- Boss `bellcrab` in `src/bellcrab.js` (bakeBellcrab, bakeBellguard) + its update in main.js (grep `bellcrab`), level
  hosting it (grep `boss: 'bellcrab'` / `deep-split.js` crabTrench). Existing tells in src/marks.js
  (`bellcrab|clawTell`, `ballastTell`, `pressureTell`, `scuttleTell`). The deep-air system (`src/deepair.js`) and the
  bot's bellcrab branch in `src/lab.js` (air vents).

## The changes
1. **A GIANT CRAB, no bell.** New baker: a big armoured crab (two long jointed claws that visibly extend, eye stalks,
   barnacled shell, legs). Keep his name/intro updated (BOSS_FELL, bestiary, BEAST_SHORT).
2. **ROCK THROW** `!` - scoops a rock and lobs it at you (an arc; blockable; the rock breaks where it lands).
3. **SCUTTLE CHARGE** red ✕ - a told sideways dash along the floor, wall to wall; jump him or be off the floor.
4. **SWIM CHARGE** red ✕ - he pushes off and swims at you through open water on a line he shows first; out-swim or dodge.
5. **CLAW STRETCH** `!` - a claw extends a long way (twice his body) and snaps shut: a reach attack; the arm stays out a
   beat after = the player-made opening (cut the arm when it overreaches into a wall/grate -> it jams, he is open ~3 s;
   a stretch that hits nothing solid opens nothing - prove it in tools/boss-openings.mjs).
6. **Atmosphere:** fish shoals (existing `sea_wildlife.js` fish) swimming the level's water, drifting particulate,
   light shafts from above, kelp sway, a darker palette toward the arena.

## Done means
- Touch rule kept (touching him never hurts unless a charge is under way); marks rows for every new tell.
- Pilot at NORMAL health >= 21 runs; target ~60-75% bot wins.
- One cropped screenshot of the crab.
- ONE `npm run check`, commit, push, deploy, verify.

## THE NUMBERS TODAY (read from updateBellcrab, main.js - find it by `function updateBellcrab(`; 2026-09-22)
750 hp. A fixed FOUR-TURN cycle, one attack each: claw (clawTell 0.8, `!`, reach 92 px), ballast slam (ballastTell 1.0,
red, 110 px ring), pressure bubble (pressureTell 0.95, `!`, at where you stood), scuttle (scuttleTell 0.85, red, 230/270
px/s for 1.5 s). After EVERY attack he VENTS: 1.8 s open (2 s when a scuttle hits a wall). Walks 34/48 px/s. That fixed
cycle plus an opening after every attack is why he reads as "barely any attacks": the fight is one loop with a free window.
PROPOSED: the scuttle charge already exists (keep it, red cross); ROCK THROW replaces the ballast slam (tell 0.8, `!`, an
arc); SWIM CHARGE (new, tell 0.9, red, a line shown first); CLAW STRETCH (tell 0.9, `!`, reach ~180 px - twice his body -
and the arm stays out 0.6 s). Choose by timers with jitter, not a fixed cycle. The vent stays but SHORT and not open
(0.6 s, no `open`): the real window becomes the jammed claw (~3 s, a stretch into a wall/grate) - prove it caused in
boss-openings.mjs. Pilot before and after; 60-75%.
