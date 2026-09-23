# THE WITCHLIGHT STAIR - REDESIGN + THE GATE GARGOYLE (agreed with Daniel 2026-09-22; build AFTER the slopes integration)

## Why (Daniel's playtest of 1cfd6c7)
"It needs a lot of work. There's no boss (there is a mini-boss), and it's mostly just climb and go right with a massive enemy
gauntlet. Visually it looks like a repeat, and there's nothing cool or unique about it." Plus: "it needs its own music track."
What went wrong in the first build (src/witchlight.js):
- ONE IDEA, TEN TIMES: ten terraces the same width and the same grey stone; each bend used one trick (a slab, a column or a
  glyph) and the rest was flat walking.
- THE GAUNTLET: 3.79 foes a screen met by an even GARRISON sprinkle over every terrace - a corridor of enemies, not encounters.
- NO LANDMARKS: nothing on the way up is a place you would remember, bar the tower in the backdrop.
- NO BOSS: the Gargoyle was left for a second session that never came before the playtest.
KEEP: the idea (a run up the tower's hill at dusk, loose magic), the three verbs (drifting slabs, rune columns, brief gravity
glyphs - the engine hooks are live: mover `slab`, vent `rune`, glyph `brief`, reachcore L.glyphBridges), THE HEDGE WARDEN
(src/hedge-warden.js, pilot 18/24 - keep him and his fight, move him into the new garden), the growing tower backdrop, the
level's slot in LEVELS/the map (needs 'burial'; the Folly needs 'witchlight'), tools/witchlight.mjs (rewrite its layout
asserts; keep its page checks: glyph crossing, rune lift, touch rule, his gate).

## The new level: FIVE PLACES, each built round ONE piece of the loose magic, then all three at the top
Roughly 360-420 columns of route in all; about a third of it vertical (not half - the vertical was the repetitive part).
1. THE BRAMBLE FOOT (short, ~50 cols). Out of the cavern mouth into dusk. Keep what is there: the slab over the brambles, the
   first rune column and its silver. The tutorial for the verbs, three signs at most.
2. THE DRIFTING AQUEDUCT (~90 cols). The aqueduct that fed the tower garden broke, and its arches hang in the air as slabs.
   A real slab-hopping crossing over a gorge: 6-8 slabs at different speeds and axes, some that SINK slowly while stood on
   (a new slab flag), rest points on the surviving piers. BROOMS sweep you off a slab (a told `!` sweep, blockable, that
   pushes). A fall lands on the gorge floor with a way back up (never a death). Landmark: the standing arches of the aqueduct
   against the sky.
3. THE UPSIDE-DOWN CLOISTER (~80 cols). A covered walk whose floor is brambles (SPIKE) for long stretches, so you spend most
   of it walking the CEILING: glyph up, ceiling, glyph down, floor, glyph up. The glyph as the puzzle, not a gap-crosser.
   Armour walks the ceiling too (a foe that follows gravity with you); a silver hangs under the arches. Landmark: the colonnade.
   NOTE: magePlayer turns the hero back if no TILE ceiling is within 14 rows - the cloister's roof is tiles, so this holds.
4. THE RUNE STAIR (~30-40 rows, short and tense). The one real vertical: a shaft climbed on rune columns with STAGGERED
   timing (ride one, step into the next as it lights), imps riding the columns with you. A chunk of the tower's library
   floats in the shaft (landmark; books drift off it). Then out onto the garden terrace.
5. THE TOPIARY MAZE AND THE GARDEN GATE (~80 cols). A garden worth the name: hedges to go under and over (the Folly's hedge
   skins), clipped statues, then THE HEDGE WARDEN at the gate between his two braziers (move his fight as-is).
THE STAIR'S TOP: THE GATE GARGOYLE on the floating slabs, where all three verbs meet; the tower fills the sky.

## Enemies: ENCOUNTERS, not a sprinkle
Authored groups of 3-5, each built round its place's verb (brooms on the slabs, armour on the ceiling, imps on the columns,
topiary in the maze, the dead that followed you up in the gaps between), with quiet stretches between them. Daniel agreed
to this over the flat 3.5-4.5-a-screen rule for this level: measure it PER ENCOUNTER (each group is a fight you read) and
keep the level's total in the same range as its neighbours, but DO NOT top it up with an even GARRISON sprinkle (a small
GARRISON row may fill the quiet between, if tools require one - no blanket calm, but calm the encounters' approaches).
ELITES: one per place at most, as the captain of an encounter.

## Its own look
- THE LIGHT CHANGES AS YOU CLIMB: dusk at the foot, twilight at the cloister, witchlight night at the gate (like the Fields'
  dusk that fades, but by height/place, not by column). The engine's dusk() multiply grade must stay under ~0.45 or greens
  go grey (found in the first build).
- ITS OWN TILES: runed tower stone with glowing seams (a tile set, not the generic slab) - an art baker in src/redraw.
- ONE LANDMARK PER PLACE: the aqueduct arches, the cloister colonnade, the floating library chunk, a wrecked ORRERY RING
  hanging over the garden gate.
- LOOSE-MAGIC FX: rune motes drifting up, witchlight ribbons in the sky that grow stronger with height.
- Keep the tower backdrop that grows with height (drawWitchTower).

## Its own music
DONE on branch claude/prep (commit after a4f0d9e): Daniel chose a CC0 track - audio/witchlight.ogg, 'Iremos Forest Theme
Loop' by beardalaxy (OpenGameArt, CC0), in TRACKS/TRACK_GAIN/MUSIC_NAMES, credited, the level's music 'witchlight'. Merge
claude/prep to get it. It is a 25.6 s loop: if it grates on a long climb, ask Daniel about a second track for the top.

## THE GATE GARGOYLE (unchanged from witchlight-stair.md, on the new top)
Sprite: bakeGateGargoyle() in src/redraw/queue_bosses.js (0 perched | 1,2 fly | 3 dive tell | 4 dive | 5 gust tell | 6 gust |
7 spit tell | 8 spit | 9 shriek | 10 HANGING). Arena of FLOATING SLABS that drift slowly, some solid, some CRACKED.
STONE DIVE (red cross, his shadow marks the slab) · WING GUST (!, blocking braces you) · RUBBLE SPIT (!, three chunks in a
spread) · GLYPH FLARE (red cross, no damage: 3 s falling UP onto a slab's underside; he dives while you are upside down -
movers are not tile ceilings, so this needs its own handling or a tile under each slab) · PERCH SHRIEK (2-3 imps, capped).
THE OPENING: stand on a CRACKED slab and dodge late - he smashes through and hangs by his claws from the broken edge, ~3 s,
double; the same dive onto a solid slab opens nothing (boss-openings.mjs). Phase 2 (<50%): faster slabs, paired dives,
every flare with a gust, broken cracked slabs never come back. Falling off lands on a lower ledge with a climb back. Touch
rule; pilot >= 21 runs at normal health, 60-75%, WITH randomness in his fight (the Hedge Warden's first pilot had none and
its four passes were identical). The level ends on his kill (remove the 'gate' exit).

## Lessons carried from the first build
Default game SPEED is 0.6 (timers in game seconds). L.mage (empty) is what makes glyphs work. Lay ropes last. Name boss
functions apart. Module-file bosses need their marks.js rows by hand + `node tools/tells.mjs --write`. The wiring checklist
is every place 'hedgewarden' appears in main.js/lab.js/audio.js/marks.js. Render 60+ frames with BK.step before any capture.
tools/route-breaks.mjs (branch claude/prep) finds cut ropes and ledges a jump short - run it on the new level.
A GREYBOX of the five places is being drafted Node-only on claude/prep (src/draft/witchlight-v2.js + a measuring tool):
start from it if it is there.

## Size
Two sessions: (1) the five places, encounters, look, music, the Hedge Warden moved; (2) the Gargoyle + his arena + pilot.
One `npm run check` each, alone. No deploy without Daniel's go.
