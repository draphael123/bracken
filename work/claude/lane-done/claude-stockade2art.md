# claude/stockade2art (sonnet) - THE STOCKADE 2 art pass

Base claude/stockade2 c84bfbcc. Art only: no gameplay, hitbox, number or tile change (supports are background poles). Camp look kept; only the new pieces drawn, in the camp's own timber, rope and iron.
New file src/redraw/stockade2_art.js; hooks in main.js (tile kit, archer/chief frames, mouth horn), route-art.js (support kinds), stockade-hands.js (drawing delegated), chars.js (archer frames 8-9), queenchief.js (chief frames 15-21), level.js (art data + footings), index.html (preload).

## Drawn
- Tower bodies (gate tower + towers 1-3): lashed-timber frame tiles (corner logs, board infill, lashed rails, X-braces, wale under the deck, stone-footed sill).
- Netted stake pit: heavy rope weave over sharpened, lashed stakes.
- Barred gate: lashed-stake leaves, rails, iron strap hinges, bar bracket; the bar lifts while the horn's delay runs, then the leaves swing back and the bar lies inside.
- 15 visible-support overhangs: visible-supports now 0 findings (was 15). Kinds: lashed pole, cross-braced trestle (under the rope bridge sag + both hanging walks), outrigger legs braced to the towers (decks' tails), tunnel shoring props (sappers' tunnel roof), tower-two mast + crow's nest rim; rope hand-lines + hangers on the rope bridge and hanging walks (read off the planks). The walk's posts are lashed poles too.
- Log piles: end-on lashed pyramid at a stake, gold glint, creak, fall (the stake stays, cut rope end), heap.
- Horn: ivory horn on the ground / belt / blower's mouth (Stockade only). Dozing blower: own sit pose + Zs; winding blower: own pose (archer frames 8, 9).
- War tower: legs, braces, rope ladder, deck, stake parapet (over his legs), pennant, slack/taut lashings, pegs (glint), cut stub, lurch (rocks toward the taut peg), fall, wreck. Chieftain: climb x2, hold-on (lurch), deck wait/aim/loose, fall poses (B16).
- Not done: the area banner (UI style guide's), per the greybox note.

## Checks (all green unless noted)
stockade2, stockade-horns, level-quality (gated, clears), solid-islands, visible-supports (0 of 45), signs, textfit hints strict (0 issues; the all-scope run hit the 480 s scope timeout on a loaded PC at 'levelcard', content untouched), readability, frame-cost, corpses, pose-frames (sheet wrote). mobile-perf (4x CPU phone, wood + stockade scenes): in budget; stockade 4.2 ms busy/frame, 51 fps, worst 133 ms (scene = level start; the Watchtowers not driven by the tool). Not run: full suite, cast-poses (no tool).
Pictures: work/claude/stockade2-art/*.png.

## Self-grade vs Rootway: B (B+ for the towers/war tower, B- for the small pieces)
Towers, rope bridge, war tower and the fall read well and fit the camp. Weak spots: log piles and the dozer are small at 320x180; the folded gate leaf is a thin strip; the pit stakes read as stakes only up close; mid-span trestles under a "sagging" rope bridge are a concession to the footing rule.

## QUESTIONS FOR DANIEL
1. Rope bridge/hanging walks stand on mid-span trestles in the pit (the visible-supports rule wants ground). Rec: keep. Alt: hanging-from-mast ropes + an allowance.
2. Archer frames 8-9 exist for every archer reskin (unused outside the Stockade). Rec: keep.
