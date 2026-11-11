/* tools/road-on.mjs - turn ALL FOUR new road areas on for a node check that builds levels (claude/nightroad): node --import ./tools/road-on.mjs tools/<check>.mjs
   (WISPWOOD, THE SILK UNDERCROFT, THE HOLLOW MANOR and THE MAGE ACADEMY each read their globalThis flag when src/level.js is imported; every *_SHIPS stays false) */
globalThis.__WW = true; globalThis.__SK = true; globalThis.__MN = true; globalThis.__AC = true;
