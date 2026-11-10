/* tools/ac-on.mjs - turn THE MAGE ACADEMY on for a node check that builds levels (claude/academy): node --import ./tools/ac-on.mjs tools/<check>.mjs academy
   (src/ac-flag.js acOn() reads globalThis.__AC when src/level.js is imported; ACADEMY_SHIPS stays false) */
globalThis.__AC = true;
