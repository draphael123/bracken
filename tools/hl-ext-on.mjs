/* tools/hl-ext-on.mjs - turn THE HIGH LINES' road AND its extension (HL_EXT: the ore line + the cave apron + the Drum Hall; it implies the switch rule) ON for a node check that builds levels (claude/hlext1):
   node --import ./tools/hl-ext-on.mjs tools/<check>.mjs   (src/highlines.js reads globalThis.__HLEXT when it is imported; src/level.js reads __HL) */
globalThis.__HL = true;
globalThis.__HLEXT = true;
