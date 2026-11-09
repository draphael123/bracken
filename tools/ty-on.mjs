/* tools/ty-on.mjs - turn THE TOURNEY on for a node check that builds levels (claude/tourney): node --import ./tools/ty-on.mjs tools/<check>.mjs tourney
   (src/ty-flag.js tyOn() reads globalThis.__TY when src/level.js is imported; TOURNEY_SHIPS stays false) */
globalThis.__TY = true;
