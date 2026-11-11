/* tools/sk-on.mjs - turn THE SILK UNDERCROFT on for a node check that builds levels (claude/silk): node --import ./tools/sk-on.mjs tools/<check>.mjs silk
   (src/sk-flag.js skOn() reads globalThis.__SK when src/level.js is imported; SILK_SHIPS stays false) */
globalThis.__SK = true;
