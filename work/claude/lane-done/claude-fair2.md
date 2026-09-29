# claude/fair2 - THE HARVEST FAIR, L2: art, dressing, furniture, audio

Branch `claude/fair2`, on top of `claude/fair1` 3a19389 (the L1 greybox Daniel approved 2026-09-29 with every recommendation). Layout and the facing rule's numbers are unchanged. NO boss (the green is still the greybox room; L3 waits).

## What changed

- **DIFFICULTY**: the mummer is weighed 5 and the hobby-horse 6 in `src/threat.js` (were 3 and 4). No extra bodies (still 9 mummers, 4 horses). INDEX 34 -> 43 (`node tools/curve.mjs`; the target was about 45; the curve tool still calls the fair 70 easier than Waymeet, by design: tuning is by play).
- **FOE ART** (`src/redraw/fair_art.js`, the L1 greybox file renamed and redrawn):
  - THE MUMMER: patched sackcloth, rope belt, straw at the collar and hem, a painted wooden mask with white-ringed eyes, red cheeks and a pegged grin, a floppy three-bell cap. Frames: 0 frozen mid-step, 1-2 creep with the bells swinging, 3 GLOW (arms up, mask burning red, white-hot eyes), 4 strike with a club, 5 hurt. (The L1 mummer's cap tip was clipped by its canvas; fixed.)
  - THE HOBBY-HORSE: a red and cream skirt over a masked player, a carved head on a pole with pegged teeth, a straw mane, brass bridle bells. Frames: 0 stand, 1 rear (head flung up, red glass eye), 2-3 charge (skirt streaming), 4 skid, 5 hurt.
  - **The red glow reads in dusk**: it is the only saturated red on the screen, and it also lays an additive halo behind the mask (`drawGlow`). The mark above a windup sat on the head of the taller art, so a foe can now set `e.markH` (mummer 34, horse 36); every other foe is unchanged (`e.markH || e.h`).
- **WORLD ART** (`src/redraw/fair_world.js`, called from `drawFair` in `src/main.js`; baked once from px.js primitives in the village palette):
  - round haystacks with twine and a pitchfork (they squash and rustle when they throw you; the spring's red burst is straw here);
  - the carousel: a painted deck skirt over the tile course, painted horses going round on brass poles front and back, a scalloped striped canopy with pennants and a flag; it spins 3x faster and the bulbs beat red on the warning;
  - **the lamps gutter out**: the fair's own lamps (`L.lamps`, replacing the plain lantern posts) are real engine lights (`lights` with `lantern`), each with a life of 1, 0.5 or 0: all steady in the gate, more out the further along, the last ones before the door guttering (a stuttering on and off, with a tiny flutter sound). Deterministic (no dice). 39 lamps;
  - the maypole green: a ribboned pole with a wreath, a ring of trampled flowers, a wicker and marigold arch over the door, an animated bonfire and its bloom (still NO boss);
  - THE CROWD: dark figures at the edge of the light on a parallax layer, none at the gate and thicker the later it gets. Scenery only: not foes, not NPCs;
  - more bunting hung over the lane in every section, hay bales, barrels and stalls from Waymeet's kit. Sunset to dusk is L1's per-section tints and `duskStart/duskLen`.
- **FURNITURE** (what Waymeet and the Fields carry): 3 silvers (was 1: the hayrick ledge, a roof over the stall lane, a hop before the last pit), 1 relic (the FELTED SOLES, `soles`, already used twice, on a three-roof stair over the gate's flat lane so a fall costs nothing), 3 hearts (`mend`: after the pincer's terrace, after the horses, before the door guard), and the 6 checkpoints as the level's shrines. No NPCs. No quest strays (see QUESTIONS).
- **AUDIO** (all synth, nothing downloaded):
  - the cap bells are a shaken cluster of three (the creep cue, only while it moves); `horseRear` (bridle bells as the head flies up); `hayRustle`; `lampGutter`;
  - THE MUSIC BOX (`musicBox` in `src/audio.js`): a 24-note tune over the level track, a note every 0.3 s at the gate that WINDS DOWN column by column (`windAt` in fair_world.js: 0 at the gate, 0.1 / 0.3 / 0.5 / 0.72 at the section starts, 0.9 at the door, 1.0 on the green). Each note comes later, flatter and quieter with more missing teeth, until the green drops one note into the quiet now and then. It plays into the music bus (the music volume and mute cover it) and only under `marketday`, so leaving the level ends it;
  - **the base track is still `marketday`** (Waymeet's neighbour). The level has no track of its own; that is a stand-in.
- `tools/fair-shots.mjs` now writes `work/claude/fair2/` (one per section plus `5b-the-glow-in-dusk.png`); `docs/briefs/harvest-fair.md` updated; the L1 report's one citation of the renamed art file corrected (dangling-paths).

## The check, `tools/harvest-fair.mjs` (extended)

New assertions: the weights (5 / 6), INDEX in 38-60, still 13 foes (no bodies), 3 silvers, one relic = soles, 3 hearts, no NPC or stray, 6 shrines, the lamps (16 or more, none out or guttering in the gate, far more out late, some guttering), the music box winds monotonically down and the section steps rise, the audio has the box, bells, rear and rustle, the base track is marketday, the art files are fair_art.js and fair_world.js with the greybox file gone, drawFair calls all five world draws, and IN THE PAGE: all seven sections draw without a throw and the lamps are engine lights that follow their life. The weight, silver, relic, lamp, art-file and wind assertions cannot pass on 3a19389 by construction (it had 3 / 4, one silver, no relic, no `L.lamps`, no `windAt`, and the art file named for the greybox); I did not re-run the old commit.

## Checks (all green)

harvest-fair, skins, pixels (33 levels, 2515 sprites), textfit (0 pictures; 246 s), readability, render-layers, audio-assets, collectables, signs, map-grammar, sprinkle-cap, checkpoint-gaps, comments, tells, answer-tags, content-audit, threat-holes, one-new-foe, floaters, spawns, killzones, dressing, keys, deadends, audit, elites, traps, and the 7 REQUIRED: architecture, checkpoints, skins, dangling-paths, boss-fight-end (45 fights, 241 s), slopes-trace (unchanged for every level), npc-removal. NOT run: the full suite; a bot pilot (no boss changed).

## UNVERIFIED

- Nobody has PLAYED it (as L1). The captures are god-mode stills. I have not heard the audio: the music box's tempo, its volume against `marketday`, and how the bell cluster sits under the track are by ear for Daniel. It runs only with audio on.
- The lamp and bonfire light amounts (engine lights r 46 / 58) and the crowd's alpha were tuned off stills only.
- The art is taller than the L1 boxes (about 35 and 42 px on 22 and 22): it reads well in stills, but how the hit boxes feel against it is untested (the boxes are L1's, unchanged).
- The glow halo is drawn in the scenery pass, behind the actors; not tested with two heroes.
- The ground is still the village cobble (the fair palette has grass and dirt colours but the `village` tile kit paints stone). A grass green would suit a fair better; that is a tile-kit choice, not built.
- A mummer standing in front of a cream carousel horse is the one spot the mask could read less clearly; the 5b capture (the glow, beside the small ride's neighbour) still reads.
- The crowd uses parallax 0.6, so it slides against the stalls in front of it, as any far layer does.

## QUESTIONS FOR DANIEL (recommendation first; the recommended option is built)

1. **Quest strays.** Waymeet and the Fields (the comparable levels) carry none; only Burial and the Caravan do. Built: no strays, 3 silvers + relic + 3 hearts. Alternative: a 3-item quest ("the lost cups"). Recommend leaving it out: a quest wants a reason to be there, and the fair asks one question only.
2. **The relic.** Built: the felted soles ("your feet make no sound, and you land like a cat"). It has no effect on mummers (their bells are theirs, not yours). Alternative: a new fair relic (a bell or music box that does something to the facing rule) needs a design and an effect. Recommend soles for now; decide again at L3 when the boss's reward is chosen.
3. **Music.** Built: `marketday` under a synth music box that winds down. A track of the fair's own (a calliope, a real music-box loop) must be added by hand: I downloaded nothing. Recommend keeping this; the winding-down box is the idea.
4. **Ground.** The fair sits on Waymeet's cobble. A trodden dirt-and-grass green needs the village tile kit to grow a dirt skin (a shared change). Recommend a later art pass, not this lane.
5. **The crowd** is background scenery only. If a silhouette in the dusk reads as a foe in play (dark, no bell, no glow, parallax 0.6), thin them or drop the layer: `drawCrowd` in fair_world.js, one call in `src/main.js`.
