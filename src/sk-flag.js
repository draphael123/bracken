/* src/sk-flag.js - THE SILK UNDERCROFT (claude/silk, the OPUS GREYBOX; scratch/brief-silkundercroft-1015.md, Daniel 10-15).
   THE SHIP SWITCH. While SILK_SHIPS is false the live game is master's: no LEVELS row, no map node, THE WITCHLIGHT STAIR keeps its needs, and no save is
   touched (tools/silk.mjs proves it). Two ways to see the level with it off:
     ?sk=1 in the page's address           (a browser walk / the art lane: ?sk=1&dev=1, ?sk=1&dev=1&skboss=1, ?sk=1&boss=cryptmother)
     globalThis.__SK = true                (a node tool, BEFORE it imports src/level.js: node --import ./tools/sk-on.mjs tools/<check>.mjs silk)
   skOn() is read when src/level.js and src/main.js are imported. Pattern: src/ww-flag.js (claude/wispwood). */
export const SILK_SHIPS = true;   /* THE ONE LINE TO FLIP (the shipping batch, after the art lane, the tune and the browser walk) */
export function skOn() {
  if (SILK_SHIPS) return true;
  const g = typeof globalThis !== 'undefined' ? globalThis : null; if (!g) return false;
  if (g.__SK === true) return true; if (g.__SK === false) return false;
  return !!g.location && /[?&]sk=1(&|#|$)/.test(String(g.location.search || ''));
}
