/* tools/mn-on.mjs - turn THE HOLLOW MANOR on for a node check that builds levels (claude/hollowmanor): node --import ./tools/mn-on.mjs tools/<check>.mjs manor
   (src/mn-flag.js mnOn() reads globalThis.__MN when src/level.js is imported; MANOR_SHIPS stays false) */
globalThis.__MN = true;
