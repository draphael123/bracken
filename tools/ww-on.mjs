/* tools/ww-on.mjs - turn WISPWOOD on for a node check that builds levels (claude/wispwood): node --import ./tools/ww-on.mjs tools/<check>.mjs wispwood
   (src/ww-flag.js wwOn() reads globalThis.__WW when src/level.js is imported; WISPWOOD_SHIPS stays false) */
globalThis.__WW = true;
