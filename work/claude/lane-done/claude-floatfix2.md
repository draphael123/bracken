# FLOATFIX 2 (11-03, branch claude/floatfix2 from claude/batch142 b595af13; art only, no tile / ent / hash change)

## 1. Daniel's photo = KINGSWOOD (THE ROYAL ROAD, `kings`): coin total 243, ~x 62-100, the high road + gatehouse approach
Photo views: scratch\lane-reports\floatfix2\daniel-photo.jpg. Before / after of the same view: DANIEL-VIEW-BEFORE.png / DANIEL-VIEW-AFTER.png (and kings-BEFORE-AFTER.png, 5 spots).
What floated (a) CONFIRMED: the stump `block(90, 91, 30, 32)` the log trap splits on is solid stone hanging over a 2-wide dip (90-91, rows 33-43) that is open to the bottom of the map, so the
backdrop's SKY (and the far falls) showed through the wall under it: a window through the terrain with a stone block bridging it. The same on 142: floatfix's demo-floats only read BOARDS, so it never saw it.
(b) the "wooden frame in the canopy": the court's PULLEYS (kingswood-hands, `EVERY PULLEY HANGS FROM A BOUGH`): an iron block + beam hung from a slanting limb whose end is a bare leaf clump in the sky, no tree under it (4 on the Royal Road alone: x 28, 58, 76, 102; 10 in the level). I could not match the frame to a single object in the photo (angle); this is the only hung-from-nothing kit the level has, plus the Great Oak's cages (below).
(c) upper-right ledge (plank 96-99,28, archer): HELD on 142 (a post at both ends, 96 and 99; the photo cuts the right one) - nothing to fix. (d) left walkway 60-68,30: posts at 60 and 68, plus 78-83 at 78/83: held. (e) background stone towers: parallax art, not a tile; left.

## 2. What I fixed
1. WINDOW (new class, src/demo-slots.js): a roofed slot (1-4 wide, 3+ tall, stone both sides, open to the map edge) is backed with the level's masonry in shadow (brick courses, roof shadow, dusk glow up from below) - a shaft, not a window. Drawn behind the tiles (one hook in main.js drawWorld beside drawRouteSupports). Found in the 12 demo levels: 1 (kings 90-91,33-43). Scan: no other demo level has one.
2. HOVER (same file): stone with only void under it to the map edge: 2 groups in the 12 levels - kings 90-91 (now over the backed slot) and fenroad 195-200,22 (the timber trestle road over the water: its braced piles are drawn in the water, ALLOWED with that reason).
3. Hung-from-nothing (kings): every pulley's bough now grows from a TRUNK that stands on the road (kingswood_props.drawBough/drawTrunk, in the wood's far-trunk colours; the caller reads the floor under the limb's end via ctx.solidAt, none if there is no ground within 22 rows). 10 pulleys, all in kings. And the Great Oak's cages hang their chain from a bough stub, not from the sky (kingswood_oak.js, 7 hang points).

## 3. Counts per level
kings: 1 window backed, 1 hover over it, 10 pulley boughs given trunks, 7 oak chains given stubs. fenroad: 1 hover, allowed (reason written). Every other demo level (wood, hornetsnest, marsh, stockade, spore, rootway, underleaf, palisadewood, burning, arena_yard): 0 windows, 0 hovers; their bough/rope kits already hang from a drawn thing (wood rope swing, stockade nets).

## 4. The rule (tools/demo-floats.mjs)
WINDOW (every roofed slot must have L.demoSlots masonry) and HOVER (stone over void must be over a backed slot or in HOVER_ALLOW with a >= 12 char reason; stale entries fail). Ratchet now: windows backed 1, hover groups 1 (allowed 1), LEFT 0, stale 0 (plus the old DECK / SLAB / DROPPED / SET DOWN numbers unchanged: found 6 allowed 6, set-down 14).

## 5. Checks
demo-floats ok; solid-islands ok; floaters ok (3619 standing things, 15 hung ones left out as before); floating-geometry ok; level-quality: all clear except flotilla "music: NO SUCH TRACK" (not mine, unrelated); curve-gate and mash-gate ok (no hash moved: NO RESTAMP). Not run: tools/check.mjs, headless pixel float sweep, art quick checks (primer lists none by name). Browser: one at a time, 3.3-6.8 GB free, nothing left running.

## 6. Questions (rec first)
1. The pulley trunks read as a post/gallows in the wood's brown standing in front of the far trees (they pass in front of the plank walkway at 60-68's left end). Keep? Rec: keep; alt: draw them in the far layer (behind the road props).
2. The photo's frame (b) I could not pin to one object. If it is still there after this lands, send the world x of the spot (or a screenshot with the tile coordinates) and I will take it out.
3. A wider gate would also read parallax backdrop pieces (towers, oak cages) - needs a bg-layer pass; Rec: next float pass if Daniel still sees them.
