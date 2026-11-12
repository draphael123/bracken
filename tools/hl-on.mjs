/* tools/hl-on.mjs - turn THE HIGH LINES' road ON for a node check that builds levels (claude/hllive): node --import ./tools/hl-on.mjs tools/<check>.mjs
   (src/level.js reads globalThis.__HL when it is imported; ROAD_OPEN.highlines stays false in the file) */
globalThis.__HL = true;
