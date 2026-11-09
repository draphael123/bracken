/* tools/ft5-on.mjs - turn FALLING TOWER 5 on for a node check that builds levels (claude/ft5a): node --import ./tools/ft5-on.mjs tools/<check>.mjs fallingtower
   (src/ft5-flag.js ft5On() reads globalThis.__FT5 at build time; FT5_SHIPS stays false) */
globalThis.__FT5 = true;
