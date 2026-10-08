# THE MINECART (side road off THE ORE ROAD) - CONCEPT (approved by Daniel in interview, 2026-10-01)
Booked 2026-09-28 (HANDOFF: boss THE GREAT DRILL, goblin cart riders, cave-in chase); prerequisites DUCK + CHASE engine
(src/chase.js) shipped in batch46. Id/name TBD by the build lane (e.g. 'minecart', THE DEEP RAILS); `needs: 'oreroad'`.

FORMAT: ALL CART, start to finish (Donkey-Kong-Country style). Basics: JUMP gaps, DUCK beams (duckClears pinned to ride).
Must not be a passenger ride: every stretch asks a choice or an input (nothing resolves itself).

THREE MECHANICS (each REQUIRED somewhere; the exam combines all three)
1. SWITCH TRACKS - forks with risk/reward: fast dangerous line vs slow safe one, hidden branches; switches thrown by the
   player (input or bull's-eye/strike), told ahead.
2. SPEED - BRAKE for crushers, timed gates, falling rock; BOOST for long gaps. Speed is the player's, not scripted.
3. CART COMBAT - goblin ARCHERS and CASTERS (EXISTING types, riding carts = a mount/rider, NO new enemy types) on
   parallel tracks shoot at you; knock them off, or JUMP INTO their cart. Their carts are hazards and platforms.
Also: tipplers above (reuse Ore Road kit), ore walls, mine art/ores, slopes.

COLLECTIBLES: ORE NUGGETS on the risky lines and high jumps; HUD counts them; enough ore opens THE SMELTER branch near
the end = a RELIC + a silver. 3 silvers total. Declare in L.unlocks.

SET PIECE (midway): THE CAVE-IN - a tunnel collapse chases you (chase.js, kill on contact); choose lines under falling rock.
BOSS (finale): THE GREAT DRILL - a goblin boring machine boring after you down a multi-track tunnel; switch tracks to
dodge it; route LOADED ORE CARTS into its gears to JAM it = the opening (must read differently from the Winchmaster's
drum). Hurt ~45 on contact (chase lane rec). Boss lessons apply (readability, it always fights, cycles change, openings
>= 3 s, x0.05 chip, human bot).

DEATH/RESTART: back to the last STATION (checkpoint) with a fresh cart; stations ~1 per 200 route tiles.
MUSIC: LEVEL TRACK = 'mineworks' = "At Work (Loop)" by HorrorPen, CC-BY 3.0 (already in audio/ via claude/musicswap,
credited) - Daniel 10-01. Boss (the Great Drill) = a synth theme.
BACKDROP: deep mine - lantern strings, glittering ore veins, goblin works, timber props, rail trestles over chasms.
PROCESS: Opus greybox -> reviewer vs Mage's Folly -> fixes -> Sonnet art/music; level-quality gated; level-1 no-ability
pilot takes real damage (a cart pilot may be needed - tools/level1-pilot.mjs walks, it does not ride).
SCHEDULE: "sooner" - after online co-op + the Lit Church start (next week), as credit allows.

## DANIEL INTERVIEW 2026-10-07 ~09:20 - UPDATES (override the text above)
- GOBLINS STAY: the Ore Road is BEFORE the Goblin Queen (moor -> skyroad -> oreroad -> storm -> ... Highcrown), so living goblin cart riders + the goblin GREAT DRILL are on-theme.
- THE SMELTER pays SILVER ONLY - no relic (3 silvers total).
- THE GREAT DRILL is ALWAYS HITTABLE (cab/driver from your cart, real damage) + jamming its gears with a routed loaded ore cart is the big told opening. B14 construct: its key = the THROWN/ROUTED ore cart. No x0.05 chip waiting room (B13).
- TIMING: greybox launches right after the batch76 suite, alongside THE ROOTWAY (Ksar already in greybox).
