# claude/hornetsnestart - THE HORNET'S NEST + THE HORNET QUEEN 2: the art pass (sonnet)

Base claude/hornetsnest fe451658. Branch claude/hornetsnestart. Not merged, not deployed. ART ONLY: no grid, entity, timing or number changed, so the level hash is unchanged
(tools/hornets-nest.mjs, 134 checks, is green and reads the same level). No audio or music file touched.

## Self-grade: B (a B+ in the parts that matter most, a B- in the nest's interior)
- Level tiles, backdrop, props, the four foe skins, the queen and her poses: new, coherent, readable, all in the Act I wood palette. No goblins, no generic logs (the boughs
  and roots are pine bark; the old wooden posts are wax pillars).
- Held down by: the nest's inside is still a calm brown room (more of a "paper cave" than a hive with life in it), the falling nest's crumbling ledges use the shared crumble
  animation (a cracked comb tile, no new debris art), and the great pine's felled pines are still the Lumber Trail's old-boar pines (they read right, they are not new).

## What was drawn
**Tiles (src/redraw/hornets_nest_tiles.js, hooked in main.js resolveTiles under L.hornetsNest).**
- PAPER: the nest's walls/floors/ceilings in overlapping scalloped shells, parchment at THE PAPER GATE, ochre in THE COMB STAIR, red-brown at THE BROOD; honeycomb shows through torn
  patches; comb-gold floor lips; honey beads under ceilings; a darker rim on exposed faces.
- COMB footing: every shelf / perch / ledge is a gold hex-cell slab; the falling nest's crumbling ledges are the cracked variant; FRESH WAX (the sticky floors, L.wax) is a pale,
  glossy, beaded lip, so "sticky" reads before you step on it.
- BARK: the pine's buttress roots and the nest-pine trunk (plated bark, furrows, resin), bough shelves (a limb with needle clusters) for the one-ways outside the nest; BRAMBLE for
  the 6 spike tiles at the foot of the escape; needle-litter forest floor, a darker mulch under the nest.
**Backdrop (src/redraw/hornets_nest_backdrop.js).** Outside: a golden-green pine wood (far pines in haze, mid trunks, drifting pollen, canopy boughs in the corners) and THE ANCIENT
PINE standing behind the foot of the climb (a 436x1152 baked trunk with boughs and a root-flare) as the landmark; the nest's paper wall rises beside it. Inside (cols 80-332): the paper
back wall per area with a crossfade, great comb curtains hanging in it, honey-lit pools of light that breathe, motes, far hornets crossing; THE BROOD HALL has its own ribbed vault, comb
panels in the walls and the royal cell. The shared forest layers, sun shafts and fg strip are switched off for this level (main.js) so nothing generic shows through.
**Props (src/redraw/hornets_nest_props.js, called by src/hornets-nest-hands.js).** Hanging/falling comb (paper stalk + gold plumb line kept) and landed comb (dull, cracked, crumbled
underside); the smoke stand (tripod, clay pot with a pierced lid, ember slit, curling smoke); the carried / set-down / thrown pot; the SMOKE CLOUD (soft layered puffs + embers); BROOD
CELLS (capped wax pocket, swelling red pulse with cracks and a soft glow, torn rim once smashed/hatched); WAX PILLARS under every shelf (the island posts, L.routeSupports).
**Foes (src/redraw/hornets_nest_art.js, redrawn, same frame layouts as the machines under them).** Nest hornet (wasp machine, 4 frames), comb drone (sprig machine: walk x4, look, tell
with jaws wide, bite, hurt), NEST-GUARD (shield machine: a soldier hornet behind a hex-comb WAX PLATE; turn/tell/shove frames), venom spitter (toadstool machine: a worker whose cheeks
swell with green venom). They die in their own skins (tools/corpses.mjs ok). THE SWARM (src/hornet-swarm.js): the live cloud is now ~30 small banded hornets (a head, a thorax, a
banded abdomen, a wing flick), a dark smudge under it that goes hot-red on RISE with a closing ring (the tell), streaks when ANGRY, grey + smoke wisps when CALM.
**The Hornet Queen (src/redraw/hornet_queen_art.js, used by src/hornet-queen-hands.js).** Baked pixel frames (no antialiasing) for EVERY pose in POSE x its wing beats, pre-baked at the
level's load (warmQueen): a crowned hornet queen (chestnut thorax with an amber fringe, a four-banded abdomen to a pale sting, red eye, mandibles, antennae, gold crown, jointed legs, veined
wings). POSE's abdomen signs were re-signed (abd < 0 now hangs/curls the tail under) so each windup/release points the sting where its move says: AIM (sting down at you), DIVE (sting
leading), STUCK (hung from her sting in the perch), VOLLEY TELL (abdomen curled forward under) / VOLLEY (thrust forward), SWEEP, BUZZ (wings wide), TEAR, DAZED/WINDED (drooped), PINNED
(on her side). Live extras per move: venom bead + closing ring (aim, volley tell), speed streaks (dive/skim/sweep), chips from the perch (stuck), smoke + stars (dazed), breath (winded),
shock rings (buzz), grit (tear), her hornets gathering (cloak tell) and the CLOAK itself (a dark ring of orbiting hornets). Stinger darts are pale barbed spikes with a venom bead; the
falling comb chunk, the last comb and the hall's brood cells use the shared props. Bestiary card (SPR.hornetqueenCard) rebaked from the new frames (hover + aim).

## Before / after PNGs (work/claude/lane-done/)
- Level, same spots: hornetsnestart-before-<spot>.png / hornetsnestart-after-<spot>.png for foot, buttress, hollow, mouth, cells, wax, guard, stair, core, top, brood, hall, fall, pine, lastcomb.
- Props in play (after): stand, swarm-idle/rise/angry/calm, comb-hang/fall/landed, pot-carry/thrown, cloud, brood-pulse/hatched, foe-hollow, foe-guard.
- Queen in the hall (after): q-hover, q-aim, q-dive, q-stuck, q-dazed, q-winded, q-sweepTell, q-sweep, q-buzzTell, q-tearTell, q-volleyTell, q-volley, q-cloakTell, q-thrash.
- Sheets: hornetqueen-before-sheet.png (greybox shapes) / hornetqueen-after-sheet.png (every pose); hornetsnestart-after-props-sheet.png (comb, stand, pot, cloud, cells, the foe frames, the swarm card).
- Tools: tools/hornetsnestart-shots.mjs (TAG=before|after PORT=.. ONLY=a,b), tools/hornetqueen-sheet.mjs, tools/hornetsnestart-props-sheet.mjs.

## Checks
- tools/hornets-nest.mjs: 134 ok (every run). level-quality (hornetsnest in the GATE): CLEARS THE BAR, every row ok. solid-islands: ok (the wax pillars are the drawn supports).
- corpses ok (hornet, boar, venomspitter, combdrone, nestguard each die in their own skin). hint-shown ok. boss-select ok. stuck (static + runtime) ok. boss-jump BJ_ONLY=hornetqueen: loads, wakes at the door, no save change.
- textfit: the scopes before `levelcard` passed; `levelcard` (it loads every campaign level in one page) hit its 480 s timer on this loaded machine ("Runtime.evaluate did not answer"),
  not a text failure. A hornetsnest load takes 0.7-1.5 s here, so it is the sweep's length, not this level. Re-run it in integration with TEXTFIT_SCOPE_TIMEOUT raised.
- mobile-perf (4x CPU throttle, 915x412 DPR 2.6, threshold 40 fps), after the fixes below: foot 59.6, mouth 58.0, comb stair 58.6, great pine (P2 arena) 60.1, BROOD HALL (P1 arena, the heaviest) 47.3 fps.
  First measurement was 20 fps in the hall; the causes were (1) additive ('lighter') glows, (2) big baked pictures drawn from CPU-side canvases (re-uploaded every frame), (3) first-draw bakes in the
  fight. Fixed: source-over glows, the big sprites copied once to GPU canvases, everything (walls, pine, vault, curtains, glows, every queen frame) baked at the level's load.
- Boss sanity: see the section at the end (67%, in band).

## Reds / not done
- textfit levelcard timer (above). Everything else green.
- Not rebuilt: the felled-pine art (still old-boar pines), new crumble-debris art for the falling ledges, a visible music/ambience change (no audio touched by request).

## QUESTIONS FOR DANIEL (rec first; what I built)
1. The hall's comb perches stand on two wax pillars each (the island-post rule wants a drawn support), so they read a little like tables. Rec: keep (it satisfies solid-islands and says
   "built, not floating"); the alternative is to grow them out of the hall walls, which needs a level change (a different lane). Built: pillars.
2. The nest's inside is deliberately a dim warm room so the gold comb and the foes pop. Rec: ship, and if it plays too dark give it a polish-day pass on the honey lights (one number,
   the LIGHTS alpha in src/redraw/hornets_nest_backdrop.js). Built: dim.

## Boss sanity (after the art; `boss-rates hornetsnest --ways=practiced --seeds=2 --jobs=1 --secs=200 --profile=human`, flasks kit, L3)
knight 2/2, warden 1/2, pyro 1/2 = 4/6 = 67%, in band (the same figure as the greybox's 67%); no page errors. One pyro loss is a 200 s timeout from the shortened window.
Bestiary card: hornetsnestart-after-bestiary-card.png (hover + aim frames).
