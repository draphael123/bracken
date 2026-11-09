/* tools/gt-on.mjs - turn THE GHOST TRAIN on for a node check that builds levels (claude/ghosttrain): node --import ./tools/gt-on.mjs tools/<check>.mjs ghosttrain
   (src/gt-flag.js gtOn() reads globalThis.__GT when src/level.js is imported; GHOSTTRAIN_SHIPS stays false) */
globalThis.__GT = true;
