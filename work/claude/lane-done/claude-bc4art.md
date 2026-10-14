# claude/bc4art - BURIED CITY 4, THE ART PASS (SONNET, 2026-10-14) - base origin/claude/buriedcity4 b0ee2af4

Art only: no geometry, no numbers, no level data touched (so the level hash and the mash rows do not move; nothing re-stamped). PORT 8912, one page at a time.
New module: src/redraw/buried_city_bc4_art.js (everything below that is not a sprite). Probes (not in the suite): tools/bc4art-shots.mjs (the level in the real page, name:col:row:sim:flags), tools/bc4art-cast-sheet.mjs, tools/bc4art-king-shots.mjs, tools/bc4art-floors.mjs.

## DRAWN (both art lists)
LEVEL HALF
1. THE GLASS WORKS: kiln stubs/chimney piers (the deep isles, brick with an arched fire-mouth, iron bands, soot, a flickering glow on the sand: `A4.drawKilnStub`, via drawStructure + `z.x0` passed from main.js), great wall furnaces + shelves of blown glasses + racks on chains + verdigris brass pipes + kiln glow on the walls (drawn into the backdrop, behind the tiles), the indoor GLASS PIT (the sea's art re-skinned: darker/hotter sand, shards of glass in it, kiln light on its skin, no sky dust). Rising/sinking roofs keep the BC3 house kit (re-textured by the visual pass, below).
2. THE SAND LIFT/roof crack: kept the BC3 dune-fall/crack art (it already flows up with chevrons - checked struck in the page); the works' kilns/glass sit round it.
3. THE TILTING DUNE: a turn animation (grains sweeping across the slope for 0.7 s after the swap) and a warn shake + grains jumping in the glass's last 2 s (`A4.drawTilt`, clock t.turn in src/buried-city-flip.js).
4. THE SAND-BOUND: all 9 frames redrawn as its own sprite (carapace of strata sand + glass splinters grown through it + brass chain/tag + sand-capped skull, amber eyes; SLAM TELL = fists hauled up over the head with sand streaming up and a ring of grains at the feet; SLAM = bent over, fists driven down, a crust-wave thrown; BURIED TO THE CHEST = sand to the ribs, arms thrown up, a collar), the SHIELDED read (a rotating faceted dome of sand plates with glass glints, replacing the pulsing ring), the BURIED collar (a sand collar + a brass lock), its corpse (corpses.mjs green: own skin) and its bestiary card (walks and slams, not the mound: `sandboundCard`).
5. TIMED SAND SLABS: a cut slab in strata with a lit lip, ragged underside, studs; cracks open in 4 stages as its timer runs down, grains fall, it shakes and flashes red in the last 0.8 s; its TIMER is a little brass hourglass over it (sand running down, gold -> red) plus a bar. Same drawing for the antechamber's three and the King's two.
6. THE ANTECHAMBER: black-lapis ashlar over its air cells, gilt-banded pilasters, the glass's glow up the wall; its MURAL (840-843) is now THE KING RAISING A STAIR OF SAND SLABS toward himself (folk climbing the first) - the fight foretold.
7. THE OLD STREET: a vaulted tunnel (ribs, tile, dust), the SAND-GATE (a brass-banded sand slab with a glass seal; in the floor as a heap when open), its LEVER (plinth, iron arm, gold/green knob, a pulse while shut), the bones under the rooftops' seas.
8. THE CLOUDS: drawn in the sky (flat-bottomed, lit tops, violet bellies) over the shadows they throw (`L.cloudNow`), dunes + rooftops.
9. THE ROOFTOP AWNINGS: BC3 awnings kept (poles with brass finials, ties; checked at the dome glass).
10. THE GREAT HOURGLASS (backdrop): chevrons beside it run the way its sand runs (dim down at rest, bright UP when flipped), arcs sweep its neck during the turn (plus BC4's turn and the opaque smoked glass).
KING HALF
11. POSES 26-32 (WITHDRAW, SHARD TELL/THROW, POT TELL/THROW, HOLDING THE SAND, RAISE TELL), each its own branch in bakeHourglassKing (the tools/buried-city.mjs B16 assert reads `else if (f === N)` per pose): all three sand-level sets + the white hurt flash come with the bake.
12. HIS SAND PILLAR (carved courses under a drift, a capital, sand pouring off its shoulders), HIS TWO SLABS (as 5), the SHARDS in flight (jagged lit wedges with a wake), the SAND POT (painted clay, turning), its BURST (ring of sand, clay shards, a plume), the pot's LANDING MARK (a glyph ring, blinking, red when it is in the air, a marker bobbing over it).
13. PHASE THREE: the dark levers (a veil, a sealed crossed plate, a slack arm, dust, DRY) and the great hourglass READY glow (a pulsing gold halo, rising sparks, a gilded pointer bobbing onto it, STRIKE THE GLASS above; brighter when left unstruck).
BRIEF 11 (foreshadow + visual pass)
14. FORESHADOW MURALS of the King (painted, three variants: raising slabs on his pillar / withdrawing and throwing glass at the folk / turning the glass) at the halls' corridor (296), the works' end (404), the throne street (602, 646, 682); FROZEN HALF-BURIED CITIZENS (three poses, bleached, sand to the waist, arms up) at the works' door and along the throne street (8). All art-only, placed by column on the level's own floors.
15. VISUAL PASS: the buried houses were flat orange siding - now plaster over mud-brick courses, stained/cracked, a string course each storey; bedding planes (strata seams) through the big sand blocks; sand palettes shifted toward ochre/bone; the sky gets a dusk-violet tone from the top and cooler dune silhouettes (the pink-orange wash).

## CHECKS (PORT 8912) - see the final table at the bottom (filled from the last run)

## GRADE (scorecard, brief-polish / review-first2): **B**
Rule line/verb: unchanged (A) | identity: works/antechamber/old street now each have their own set + murals + frozen folk; landmark shows flip state (up from the greybox) | art state: current everywhere except the points below.
Why not A: the glass works' wall furnaces sit low behind the isles (mostly seen only by looking down), the rooftop house kit and the BC3 sinker/riser art are unchanged, the tilt is an overlay on the slope tiles rather than a true rotating sprite, the frozen citizens are 3 poses repeated, and the plaster/brick houses read slightly blotchy at zoom.

## STATED TEST/TOOL CHANGES (none weakened)
None to existing tests. New probes only (above). main.js: 1 call-site (`BCH.drawStructure(..., z.x0)`).

## QUESTIONS FOR DANIEL (rec first = built)
1. **Murals and frozen citizens are art-only, placed by column** (not level decor), so the level hash is untouched. Rec: keep. Alt: move them into the level (decor) so the reach/level tools see them.
2. **The sky tone** (violet from the top) and the less orange sand. Rec: keep; Alt: revert the sky tone only (one call in buried_city_backdrop.js).
3. **The great hourglass chevrons** are always visible on the skyline (dim at rest). Rec: keep (the flip state is the level's rule). Alt: show only while a glass near you runs.

## CHECKS - final run on the last commit (PORT 8912, one page at a time) - ALL GREEN
tools/buried-city.mjs **358 green** | buried-city-levers **30 pulls green** | buriedcity-exit green | corpses green (the sand-bound dies in its own skin) | hint-shown OK | mobile-perf (title + buriedcity, 4x CPU phone): inside budget (buriedcity 58.8 fps, 11.5 ms/frame busy) | hk-probe (knight/warden/pyro, 1 seed, human): all three win (143-169 s) | **textfit SCOPED** (TEXTFIT_LEVELS=buriedcity hints,talk,bestiary,boss --strict, 1 page): 591 screens, every count 0.
cast-poses: no such tool in this tree (the B16 pose assert lives in buried-city.mjs, green). Level hash unchanged (no level data touched): no mash re-stamp. Reds: none. (An earlier unscoped textfit run showed coophelp OFFSCREEN/COLLIDE - not this lane's screens, not in the scoped run.)
