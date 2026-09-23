# THE HURRICANE DECK - PLACES AND A STORM WITH A SHAPE; THE CAPTAIN'S PLATFORMS (Daniel, 2026-09-22)

## What Daniel asked for
"Hurricane deck needs something. Very repetitive. ... The boss also needs platforms that you can use to dodge his gun shots.
Boss is fine, no changes needed other than maybe one new attack when he gets berserk." Agreed to the plan below.

## Today (measured 2026-09-22)
`theHurricane()` in src/level.js: 760 x 44, ONE hull the length of the level, the sea under it (swimmable, lightning runs
along it), the WASH building to windward and breaking over the deck (hold a line or go over the side), the rigging as
handholds, the hold below with iron bulkheads only a round shot moves. THE CAPTAIN ('captain', `function updateCaptain(`
in main.js) on the quarterdeck: arena x 702-744, deck row 16; sabre (sabreTell 0.42, 0.32 in p3), the pistol (shootTell,
red, aimed at your row - `e.aimY`), the hook (`!`), the keg (red); three phases. Why it repeats: one hull, one beat (the
wash), the same deck -> rigging -> hold rhythm the whole way. Three of its ropes pass through one-way decks (x 100, 614,
700 - x 700 on the way to him; docs/route-breaks-0922.md on claude/prep).

## The level: PLACES, and a STORM WITH A SHAPE
The storm builds, THE EYE passes over at the halfway point (calm, stars - L.eye / drawEyeSky already exist), then the BACK
WALL comes through, worse than the front. Each place gets its own verb:
1. THE WAIST (open deck, shortened): the wash taught - hold a line or go over.
2. THE FOREMAST: a real vertical climb up the rigging to the FIGHTING TOP; ST ELMO'S FIRE crackles along the yardarms (a
   told red-cross strike on the yard you stand on - move along or down). Landmark: the fighting top against the storm.
3. THE HEEL (NEW VERB): the ship ROLLS - on a clock and a warning (the deck creaks, the horizon tilts), she heels over and
   everything loose slides to leeward: crates, a LOOSE CANNON (it crushes what it hits, you too), and you unless you hold on.
   A deck where the danger is the ship itself.
4. THE EYE: calm and stars for a screen or two - a breather with a landmark (the ship's bell, the crew's shanty under the
   music), a silver, a checkpoint.
5. THE BACK WALL: the storm returns worse; the MAINMAST SNAPS and comes down across the deck - its length is the new road
   over the wreckage (and the landmark of the second half).
6. THE FLOODING HOLD (short): below, rising water and the breath system the level already has (src/deepair.js pockets).
7. THE QUARTERDECK: THE CAPTAIN.
Enemies as ENCOUNTERS of 3-5 round each place's verb (boarders on the fallen mast, marines in the fighting top, sailers in
the eye's calm), quiet between - no even sprinkle. Fix the rope-through-deck clunk (the one-line climb change in the flotilla
brief) with it.

## THE CAPTAIN: platforms to dodge from, and ONE berserk attack
- PLATFORMS in his arena so height dodges his shot (it is aimed at your row when he raises the pistol): a raised STERN
  DECK at one end, the LASHED LONGBOAT on its chocks (a platform two rows up), and the MIZZEN SHROUDS to climb (rope). Keep
  the floor readable; nothing that walls the arena.
- THE LAST SWIVEL GUNS (phase three only, red cross): he fires the rail's swivel guns ACROSS THE UPPER PLATFORMS - a told
  sweep (1.0 s tell, the guns traverse, smoke) that clears the high places, so they are a dodge and not a camp; drop to the
  deck to be safe. Its own cooldown (~9 s), never while another tell runs.
- Nothing else changes (Daniel: "boss is fine").
- Pilot before and after (24 fights, normal health, jitter); stay in 60-75%; the new attack gets its marks row and the lab
  bot learns to drop off the platforms on its tell.

## Size
The level ~1-1.5 sessions (the heel + the eye + the fallen mast are the new work); the Captain ~half a session. One
`npm run check`, no deploy without Daniel.
