# SPORECLEAR (claude/sporeclear, off master 95bc267a4) - lane report

Daniel 11-07 (Sporewood ?demo=1): unclear how to grow the mushrooms; mostly you can just jump over them.

## Changes
FEEDBACK (src/sporewood-hands.js, src/redraw/sporewood2_world.js drawGrowcap, src/main.js)
- A hero on a bud: it WIGGLES and PUFFS spores until it rises; the old faint blink is now a pulsing two-chevron UP-ARROW over every ready bud (brighter and faster while stood on) with spores lifting off it; rising CREAK on growth (SFX.creak, Sporewood only).
- Dark bud, unlit: dimmed cold cap, a dark lantern pip over it, and a DOTTED LINK to the nearest lantern cap (the dots march toward the bud once lit).
- Seed cap: pips for the blows it needs (m.need, default 1; a seed with need>1 now takes that many blows, a clank and sparks between), FLASHES white and SHAKES when struck.
FIRST-TIME LINE: 'STAND STILL ON A BUD: IT GROWS' (SPW_SAY.budFirst, hintSay mechanic tier, once per save); PROG.taught.bud is written the first time a bud grows under a hero (the line is never said after).
NEEDED (audit): new tools/sporeclear-locks.mjs cuts each bud / seed pair out and asks floodReach for EVERY hero (own legs). Result: 16 of 17 caps are needed by every hero (by column: 28, 77, 85 glade; 136, 168, 180, 188 dark; 208, 220, 250, 263 bog; 314, 332 larder; seed pair 363+366; 366). Two were skippable:
- col 369 (the knot's lean cap over the six-wide root break): the root planks along row 2 (plank 370-391) were a ceiling walkway across the gap. Planks now start at col 377 (the island): the lean cap is the way. FIXED.
- col 316 (the Root Span lean cap, larder tier): still passable without it by every hero by a long jump (gap 7, bog floor below, a fall only stings). NOT FIXED: widening to 8 and trimming the stair planks did not change it; the fill still lands them. Marked OPTIONAL SHORTCUT (coins already ride its arc). Rec: take the bog floor away like the cap ladder (a fall = back to shrine), or accept.
Mother Cap arena untouched.

## Checks run (Node, no browser)
node --check on the 3 changed src files; node tools/sporewood2.mjs all green (all 17 route locks); node tools/demo-cut.mjs all green; node tools/level-quality.mjs: spore FAILS pilot + mash ONLY because the level hash changed (planks) - re-run needed (both use a browser); tools/sporeclear-locks.mjs (exit 1 until 316 is resolved); a Proxy-canvas smoke of drawGrowcap in 8 states (bud, stood-on, dark, dark lit, seed need 2, seed flash, lean, up).

## OWED
- Browser walk of Sporewood ?demo=1 + stills (bud stood on, dark bud link, seed flash, first-line box) - not seen drawn.
- node tools/level1-pilot.mjs spore --write and node tools/mash-bot.mjs spore --level spore --write (RAM >= 2.5 GB, memguard) to clear the level-quality hash.
- Sound: SFX.creak is the plank creak; a dedicated rising creak is optional.

## Questions (rec first)
1. Col 316: remove the Root Span's bog floor so the lean cap is truly needed? Rec: yes (matches the cap ladder).
2. Do the glade's four-row walls (28, 77, 85) read as 'needs the bud'? Rec: yes, they are 4 rows (51 px max jump); the arrow + line were the missing part.
