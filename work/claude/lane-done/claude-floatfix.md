# FLOATFIX, demo levels (11-03, branch claude/floatfix from claude/batch142 c18cd710; art/data only, no tile moved, level hashes unchanged)

## 0. HEADLINE
- New gate `tools/demo-floats.mjs` (registered in tools/check.mjs after solid-islands, NOT run as a suite): over the 12 demo levels it found **47 floating board runs before, 6 after (all 6 allowed, with a written reason)**, and 0 decorations silently dropped (was 20). solid-islands is green again (arena_yard 4 -> 0).
- Props and decor first, as asked. What the engine did with them is now known (section 2) and fixed at the source.
- Every hash is unchanged: wood/hornetsnest/marsh/fenroad/stockade/spore/rootway/underleaf/palisadewood/kings/burning pilot, curve and mash stamps all still match (`tools/restamp.mjs --all --dry` lists none of the 12; level-quality, curve-gate, mash-gate green). NO RESTAMP OWED.
- Not run (told not to): tools/check.mjs and the suite. Ran: solid-islands, floaters, architecture, anchor-lint (report), visible-supports (report), headless floats (pixels, 11 levels, 554 sprites: nothing in the air), level-quality, curve-gate, mash-gate, floating-geometry, light-support, arena-yard build, arena-polish, demo-floats.

## 1. COUNTS FIXED PER LEVEL
"runs" = board runs the new rule failed (DECK wider than 8 with a cell >4 columns from a post/wall/rope, or a SLAB 2-8 wide with nothing within 4). "supports" = drawn supports added. "decor" = decorations that were silently dropped and now draw.
| level | runs before -> after | supports added | decor now drawn | what |
|---|---|---|---|---|
| arena_yard | 5 -> 0 | 4 trestles + 1 knee brace | - | the 4 stair steps (31-44,13-19) stand on braced timber trestles; the sky plank 62-67,8 on a knee brace off the wicker tower. solid-islands 4 -> 0 |
| fenroad | 2 -> 0 | 12 piles (+ X braces) | - | deck 53-70 and 317-351,18 (pile every 4 columns, per column), plank stack 243-248,8 and deck 372-377: held. Piles now braced X to the next pile and re-laid over the water so they read (see 2.4) |
| hornetsnest | 9 -> 0 | 8 paper pillars + 1 knee brace | - | 441-446,29/43/57 and 433-438,36/50 (tree shelves), 236-244,22, 247-258,20, 298-303,12; 339-347,10 gets a knee brace off the red wall (no ground under it in 30 rows) |
| underleaf | 3 -> 0 | 4 | 3 bone-chime posts | potion shelf 497-504,18, 169-171,18, 31-41,20 |
| spore | 5 -> 0 | 7 stalks | 7 root clumps | |
| kings | 5 -> 0 | 5 | 3 banners + 3 gibbets/cages | |
| marsh | 6 -> 0 | 6 stilts | - | 57-70,11; 378-388,14; 226-236 and 261-271,15 (over deep water, foot sunk into the pool); 429-449,15; 5-23,19 |
| stockade | 2 -> 0 | 4 lashed poles (stkpost) | 2 gibbets in the Chieftain's hall | the 485-499,14 gantry; 86-88,17 |
| rootway | 3 -> 0 | 3 roots | 2 (root clump, bone-chime post) | 134-144,27; 322-336,16; 80-90,32 |
| palisadewood | 1 -> 0 | 1 | - | scaffold roof beam 236-246,8 |
| wood | 0 | 0 | - | nothing to fix |
| burning | 6 allowed | 0 | - | see 4 |
Totals: 47 runs -> 0 left (6 allowed), 51 supports added, 20 dropped decorations restored.

## 2. WHAT THE GAME SILENTLY DID (the 51 "set down" and 35 "dropped", investigated)
In the 12 demo levels that is 30 entries: 20 DROPPED hung decorations and 10 SET DOWN props. None of them floats on screen (a set-down prop ends on a floor; a dropped one is simply not drawn), but 20 decorations the authors placed were never seen, which reads as a level that "lost something", exactly like Daniel's hovering racks. Causes, all fixed at the source:
1. **The engine hangs these kinds by name** (HUNG_DECO in src/main.js: rootDecor, boneChime, clothStrip, hangCage, banner...) and drops any hung deco with no ROCK within 5 rows above it. Several levels draw those kinds as STANDING things: Sporewood 2's rootDecor is a standing root tangle (sporewood2_world.js), the Rootway's too, Underleaf 3's boneChime is a bone pole 28 px tall, Kingswood's banners/cages were set `hang: true` under a plank gallery (ONEWAY is not rock). 7 + 2 + 3 + 6 + 2 = 20 of them never drew.
   Fix: a new ent key **`stand: true`** ("the art draws it standing"): src/main.js decoHangs honours it (and groundEnts clears a leftover `hang`), tools/floaters.mjs mirrors it. Set in sporewood.js / rootway.js (their deco helpers), the GOBLIN_CAMP landmark table ('stand' as the 5th element, underleaf's 3 chimes), dressLevel (the sprinkler's rootDecor in spore/rootway), kingswood.js (6 ents), level.js:495 (stockade hall's 2 cages). Nothing else about them moved.
2. **Why no hash change:** `levelHash` hashes `L.ents`, so editing ent coordinates or removing `hang` would have staled 21 pilot/curve/mash rows (7 levels, ~hours of bots). `stand` is art, not data, so tools/level-quality.mjs levelHash now ignores that one key (JSON.stringify replacer, same idea as the existing `stuck` / `dressExtra` exclusions). Verified: the 11 hashes still equal the docs stamps byte for byte.
3. **The 10 set-down props** (3 marsh signs, spore sign + spore pod, underleaf barrels + sign, palisade pennant + 2 signs) and the 4 newly standing items the rule moves a row or two (2 stockade gibbets, spore root clump 393, kings cage 232) are LEFT as placed: moving their coordinates is a hash change (restamp of 7 levels). They stand on a floor on screen. They are ratcheted in demo-floats `SET_DOWN` (14 now, may only go down) with the reason written. Rec (Q2): fix them in the data at the next restamp window.
4. **A full footprint scan of every STANDING sprite** in the 12 levels (BK.drawables(): 540 sprites, scratch\lane-reports\floatfix\propscan.mjs): none has less than 70% of its foot over floor or hovers more than 3 px, except 2 signs sunk 6 px in the Wood (a declared sink) and one rootway pennant at 64% foot. So props do not hover; what read as hovering props was the unsupported decks they stand on, now held.
5. **Fenroad's deck was a real code bug:** src/redraw/fen_road_art.js addSupports skipped a whole board run if ANY post lay anywhere in its column range, so the 35-board road at 317-351 had 2 posts and 22 bare boards. Now per column (a pile every 4). The piles sit at the water line under opaque water, so they are re-drawn over the water pass (`FRA.drawPilesFront`, 78% alpha) with an X brace to the next pile, as the tile trestles at 419-424 are braced.

## 3. THE NEW GATE (tools/demo-floats.mjs, src/demo-supports.js)
- src/demo-supports.js (new, hooked from island-posts.addIslandPosts; arena_yard is hidden so level.js wraps its build): reads every board run of the demo levels, finds cells >3 columns from an anchor (post, floor under it, wall/floor at its end, rope/hanger/bridge/structure/stilt deco) and sets posts in the level's own kit (marsh stilt, spore stalk, rootway root, wood crib, stockade stkpost, hornetsnest paper pillar, kings/underleaf/palisade the level's default post); over a pool the foot is sunk into it; with no ground within reach it adds a KNEE BRACE off the wall or trunk the board is keyed into (hornetsnest 339-347); an arena step gets a trestle. routeSupports only: no tile, no ent, no hash.
- src/demo-supports-art.js (new): trestle + brace drawing; route-art.js and hornets_nest_props.js (its own pillar drawer) call it for kind 'demo'.
- tools/demo-floats.mjs: rules DECK (>8 wide, a cell >4 from an anchor), SLAB (2-8 wide, nothing within 4), DROPPED (a decoration the engine would leave out; must be 0), SET DOWN (ratchet). Cave roofs are ignored by construction (only boards are read, never SOLID). ALLOW needs `why` >= 12 chars per run; stale entries fail (an entry cannot outlive what it excuses).
- Ratchet numbers now: found 6 (burning), allowed 6, LEFT 0, stale 0, dropped 0, set-down 14 (marsh 3, stockade 2, spore 3, kings 1, underleaf 2, palisadewood 3). Registered in tools/check.mjs list + header line.

## 4. INTENDED / OK (each with the reason a player can read)
- burning, 6 runs (340-341,16; 343-357,16; 359-375,16; 377-380,16; 327-357,20; 359-393,20): upper floors inside the burning barn, wall to wall, with its great timber frame, rafters and ladders drawn behind and round them: a building interior, not a deck over air. Allowed with that reason in demo-floats ALLOW.
- spore "ceiling slab 104-198,14" and its lit hollow: a cave roof reaching the top of the map; the shelf at 191-197,26 stands on stalks.
- hornetsnest wall-keyed ladders (82-89,34-50: 5-wide ledges keyed into the stone wall, 12 cantilevers), 298-303 etc.: read as ledges built into the wall; left (a knee brace on each would be clutter). Rec: leave.
- anchor-lint's remaining 233 lines are its 1.25-tile slack (kings 36 of 39 are a post 1.5-2 tiles from the tip). I eyeballed 112 of them chosen by size (sheets in img\sweepsheets\): every one stands on posts, stilts, roots, ropes or a wall. marsh's 3 "signs on air" stand on pads/boards.
- visible-supports (report-only): 69 -> 54 over the 12 levels; what is left is cave roofs (hornets 14, rootway 11, spore 8) and the burning barn (13).
- No "meant to float" things needed a hanger: the only hung floaters in the 12 levels are the wood's rope swing and the stockade's net-hung ledges, which already read as hung.

## 5. CHECKS (this branch)
solid-islands ok (arena 4 -> 0); floaters ok (hung-and-dropped 35 -> 15 game-wide, all in other levels); architecture ok; headless floats: 11 levels 554 sprites nothing in the air; demo-floats ok; level-quality / curve-gate / mash-gate ok; floating-geometry ok; light-support ok; arena-yard build + arena-polish ok.
RED but NOT mine: tools/palisadeart.mjs, sporewood2art.mjs, underleafart.mjs each assert a hard-coded levelHash that no longer equals the stamped one (palisade expects 691a500a873f, is 8c1d63865e73 and the docs stamps agree with it); they fail on the base too. Rec: update those 3 constants (one line each) in the integ.
Browser use: one at a time, free RAM 3.1-6.7 GB, no mass kill, nothing left running.

## 6. FILES
src/demo-supports.js, src/demo-supports-art.js (new); src/island-posts.js, src/level.js (arena wrapper + 2 ent tables + stockade cages), src/route-art.js, src/redraw/hornets_nest_props.js, src/redraw/fen_road_art.js, src/main.js (decoHangs + groundEnts + 1 draw line), src/sporewood.js, src/rootway.js, src/kingswood.js, tools/demo-floats.mjs (new), tools/floaters.mjs, tools/level-quality.mjs (levelHash ignores `stand`), tools/check.mjs.
Merge note: bogtroll2 owns fenroad; my fen_road_art.js edit is 3 lines in addSupports + drawPile + one new export, and main.js gets one extra line after drawWater: a rebase should be trivial.

## 7. SHEETS (scratch\lane-reports\floatfix\img\)
Per level before | after: arena_yard-, hornetsnest-, kings-, fenroad-, underleaf-, spore-, stockade-, marsh-, rootway-, palisadewood-, burning-BEFORE-AFTER.png (11 sheets, 65 spots; wood had nothing). Singles: img\before\ and img\after\. Unsampled-pass sheets: img\sweepsheets\<level>-SWEEPn.png (112 flagged spots) and img\extra\.
Best three: arena_yard-BEFORE-AFTER.png (stair planks in front of the crowd -> trestles), hornetsnest-BEFORE-AFTER.png (shelves hovering by the tree -> paper pillars, knee brace), kings-BEFORE-AFTER.png (decks on posts, the cage grove and the gallery's banners drawn).

## 8. QUESTIONS FOR DANIEL (recommended answer first; I built the rec)
1. Is a knee brace the right fix for a shelf keyed into a wall or tree with nothing under it (hornetsnest 339-347)? Rec: yes (built); alt: a hung chain from the canopy.
2. Fix the 14 set-down props' coordinates in the data (needs a restamp of marsh/stockade/spore/kings/underleaf/palisadewood)? Rec: not before the demo cut; do it in the first restamp window after, then SET_DOWN goes to 0.
3. The arena trestles read as scaffolding in front of the crowd, not a bleacher block (a first try with solid risers looked like a wooden wall and was dropped). Keep? Rec: keep; arenayardart can restyle `style: 'trestle'` in src/demo-supports-art.js.
4. Allow the burning barn floors (6 runs), or give the barn floors posts? Rec: allow (they are inside a building); posts would clutter the barn.
5. HN pillars under the tree shelves run 14 rows down to the next shelf (a scaffold ladder). Rec: leave; the art lane may thin them.
