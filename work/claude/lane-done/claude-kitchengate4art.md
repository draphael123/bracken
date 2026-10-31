# claude/kitchengate4 ART - KITCHEN GATE 4 art lane (sonnet, 10-31)
Branch claude/kitchengate4 on the greybox tip c373eba7; art commit 30234e88 (+ this report). NOT merged, NOT deployed. Gameplay unchanged: no hitbox, timing, tune or number touched.

## WHAT WAS DRAWN
- **Coal trench** (src/redraw/grubbag_art.js drawCoalBed / drawCoalStep / drawCoalFlames; src/grubbag-hands.js drawBack/drawOver call them): a fire-pit of black coal lumps with ember cracks breathing (BANKED: dim, slow sparks); the 0.6 s GLOW (every crack bright, the pit heaving red, heat band on the walls); the 6 s LIT flare (a sheet of flame, sparks, heat on the walls, dying down over its last 0.9 s so the end is readable); the chain-link steps = an iron cap over a three-chain curtain with cross-links, heating red from the bed up and red-hot with flames licking off the caps while lit (the climb out is visibly hot).
- **Meat-hook rails** (src/redraw/kitchen_art.js drawMeatRail, `z.arena` only, so no other level's rails change): the lower rail's red jump-off stretch now has a red-lit sleeve under the chalk ticks, a red lamp at each end and three hopping red chevrons above it. The chain runs at the rail's real pace (ORDER UP x1.6 visibly faster, phase kept so it never jumps), with order slips clipped to the chain and speed streaks behind the hooks.
- **Cauldron over the upper rail's end:** checked - it hangs ~57 px above the rail's end, no overlap with a rider (stills hook-end). Readability fix (art only): black iron on a dark wall - a faint warm halo and a rim of firelight (drawCauldron).
- **Platter drop:** he is now flung back in his chair, both hands up, stars wheeling (new POSE.drop - drawing only; before, the drop opening drew him sitting normally); landing splat (white flash, flat shock ring along the cloth, dust, gravy and china shards flying and falling); falling dishes/bombs spin with streaks. `KNOCKED OFF HIS FEET` label unchanged.
- **Belly swell + MORE!:** green rings out of his belly and green plus-signs rising; the +N is now beside a green plus badge; MORE! unchanged.
- **Second helping:** a ghost of the dish he will throw twice (ham / two plates) beside his hand, a ring of gold-red sparks, an `x2`, and the existing SECOND HELPING word and rim.
- **ORDER UP attendants:** a new `hang` attendant frame (gloved hands on a grip bar, no tray; kitchen_art bakeAttendant, attendantFrameOf returns it while `e.gbRide`), a pulley on the rope above the grip as the hero's own ride; an attendant caught on the coals burns (flaming figure crumples to a black husk, sparks, smoke ~0.9 s; visual list S.burnFx).

## CHECKS (one browser at a time, PORT 6600, RAM 7+ GB free; full suite NOT run)
GREEN: tools/kitchengate.mjs (all), kitchengate-probe, **mark-integrity MI_ONLY=grubbag MI_SECS=110** (fling 11/11, lob 7/7, belch 6/6 seen, landed and posed; the other marks were not reached in 110 s - sweep/grab/grease/bell are not covered), corpses, level-quality kitchengate (clears the bar; mash/pilot hash rows still fresh = level hash unchanged), zipline. No baselines restamped (nothing that feeds them changed).
Not run: textfit/tells (only new text is the 2-char `x2`), mobile-perf (the new draw is a few hundred rects per frame while the trench is on screen; the hook-rail change adds <20 rects), boss rates (no gameplay change).
No new ad-block-prone filename (tools/kitchengate4art-shots.mjs is a tool, not shipped).

## STILLS (scratch/lane-reports/ and work/claude/lane-done/; zoomed crops of the real page)
kitchengate4art-before-<tag>.png / kitchengate4art-after-<tag>.png for tag in: trench, trench-glow, trench-lit, trench-lit-end (after only for the end), hookA, hookB, hook-end, drop, second, second-fling, swell, bell-hooks, bell-coals. (before = the greybox tip c373eba7; before-trench-glow/lit-end exist too.) Tool: tools/kitchengate4art-shots.mjs <before|after> [tags].

## QUESTIONS (rec first; the rec is built)
1. The hanging attendant: his feet sit 12 px under the rope (hero's hang), so he is drawn as a hero rides - body upright, hands on a grip bar slung low under a pulley - rather than dangling from a bar above his head (that would need his draw position moved). REC keep.
2. Mid-fight readability on a phone (the lit flames are 25 px tall over the hero's feet): REC leave, check on the playtest; if the hero is hard to see in the flare, drop the flame height in drawCoalFlames (`13 *` term).
3. Stuck-spot glint for the steps: still none (Q6 of the greybox). REC none.
4. Gameplay needs found while drawing: none. (Note: the attendant's hit box is e.y-18..e.y while the hang frame stands 28 px tall - same as every attendant frame.)
