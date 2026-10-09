# claude/stormtough - STORMHOLD weightier (v2), 2026-10-08

## Built (src/stormhold-town.js, src/level.js ELITES.storm, src/elite-kit.js AFFIX_AT)
- One weighty ELITE per section (ELITES.storm): the Road's shield captain (x33, holds a gate at 38, SWIFT), the Square's brute (162, THORNED),
  Smoke Row's brute (214, UNSTOPPABLE), the Close's far-bank shield captain where the Bell Watch rope sets you down (343, WARDING), the Halls'
  Pike Serjeant (373, unchanged), the gorge's shield captain (470, gate 475, SUMMONER). Gates only where the reach tool accepts them (roofs let a
  hero walk round the Square's and Smoke Row's); the others are exams on footing with a checkpoint after.
- Foes at the platforming moments: a shield on the Gate Watch's landing, a flyer through the first rope's arc (68,30), the Square's shield wall + dog +
  second roof bowman, the forge's shield + dog, two harpies through the chimney hops (238/249), a dog and a roof bowman on the Bell Close approach,
  a shield in the Halls and a shaman behind the pike wall, a flyer + bowman in the gorge, the wall-walk shield + hand, a bowman on the Wall Watch landing.
- tools/architecture.mjs was RED on the zipline branch (16 cells of housefront over the breach at 326-327): the Bell Close facade is split round the breach; green.
- The Gate Watch sign moved 39 -> 41 (the road elite's gate comes down on 38).

## Walker / bot: where the walker stalled (600 s = 10% of Stormhold) - THREE REAL BOT BUGS, none a level fault
1. src/playtest.js door-seek: a stalled bot outside walks to the nearest unused DOORWAY (it was written for levels whose keys are indoors). Storm's keys hang in
   towers, so every stall (a Scalder at a ladder top, a fight on the landing) sent the walker back to the hearth house, ~3000 frames a lap. Storm now sets
   L.noDoorKeys and the bot's door seek skips it.
2. src/playtest.js drop-through: `still > 70` on a one-way presses DOWN - on the Gate Watch's deck that dropped the hero through the deck to the road
   instead of onto the rope. Skipped within 5 tiles of a rope's high end.
3. src/playtest.js rope grab: with a goal beyond the rope (the walker aims one to three nodes on) the deck-end leap queued a jump the same frame the bot took
   hold (line 324 runs before the rope block), so UP grabbed and JUMP let go on the next frame. The grab frame now cancels the jump press (BK.unpress), and
   the ride frames too. With it the walker rides the Gate Watch's rope for the first time.
- Tool fix (stricter, not weaker): tools/level1-pilot.mjs now confirms a sign box / level-up card.
- STILL A HAND GAP (not fixed): (a) the Bell Watch's belfry: the hero idles at the ladder top beside the second Scalder (301,20) for the whole stuck window
  (STUCK 297-298,22-26, next tile 344,31); (b) the Wall's scaffold climb at 493-496,35-42 under the hoarding Scalder + harpy. Both are the walker's perception
  waiting on a pot cycle it never finds a gap in. They are 'ladder top + Scalder' stalls, and the Gate Watch (same pairing) passes, so they are walker timing,
  not geometry. Past them the walk resumes at the next shrine as the tool intends (so storm now MEASURES sections 0-1 and 3, not 0%).
- The level-1 PILOT cannot measure storm: it is held at the Market ambush (the pike leader is SHIELDED/UNSTOPPABLE, the L1 bot never breaks him), every later
  waypoint is a lift. The curve row (hits 1, deaths 0, lost 7%) is the Road and the Square's front only. NOT taken off CURVE_REPORT_ONLY (it does not land
  there; the walker is the honest instrument for this level).

## Numbers (knight, campaign L11, human+first walker, 2 seeds)
- before: 600 s, 10% walked, 0 measured, 0 deaths (loop of the fall-and-door lap).
- after: whole level in ~290 s; elite duels all WON (shield 9 s 100->91%, pike 3.7 s, brute 14-19 s 100->78%, gorge captain 21 s); sections lost 20% / 12-24% /
  34-60% (Bell Close, the hardest) / 34-37% (gorge + wall); 13 and 8 hits; arrival hp 88-91% on the two measured checkpoints; deaths 0.
  => still BELOW v2 (1-2 deaths, <50% hp at checkpoints): the walker's L11 knight reads a lone elite's tells perfectly (pike@114 3.7 s). The weight that is in
  now is crowd + ranged + flyers; more would be more crowd, not tougher elites (elite tuning is shared code in main.js - not touched).
- mash bot (tools/mash-bot.mjs --level storm, re-stamped level THEN boss): knight 3 deaths / 0% lowest hp, warden 1 / 0%, pyro 34 / 0%; boss rows 0/6 mash wins.

## Checks run (green): elites, level-quality (only the stale CANAL pilot row, not mine), stuck, checkpoints, checkpoint-gaps, zipline (7/7), watchtowers,
stormhold2, mash-gate, curve-gate (storm stays listed report-only), harvest-fair, spawns, sprinkle-cap, goblin-lint, dressing, town-live, deadends, map-spacing, floating-geometry, architecture, bells, signs.

## QUESTIONS FOR DANIEL
1. Storm's elites are cut down by the walker without a scratch; is that the elite kit (shared) or the walker's human profile? Rec: leave the kit, add crowd (built).
2. The two walker stalls above (ladder-top Scalders) - want the walker taught to rush the key between pots? Rec: yes, a small hand in tools/level-walk.mjs.
