/* src/mn-flag.js - THE HOLLOW MANOR (claude/hollowmanor, the OPUS GREYBOX; no own brief: scratch/lane-reports/hollowmanor-plan.md, from the 10-01 haunted-levels concept).
   THE SHIP SWITCH. While MANOR_SHIPS is false the live game is master's: no LEVELS row, no map node, THE WITCHLIGHT STAIR keeps its needs, and no save is
   touched (tools/manor.mjs proves it). Two ways to see the level with it off:
     ?mn=1 in the page's address           (a browser walk / the art lane: ?mn=1&dev=1, ?mn=1&dev=1&mnboss=1, ?mn=1&boss=castellan)
     globalThis.__MN = true                (a node tool, BEFORE it imports src/level.js: node --import ./tools/mn-on.mjs tools/<check>.mjs manor)
   mnOn() is read when src/level.js and src/main.js are imported. Pattern: src/sk-flag.js (claude/silk). */
export const MANOR_SHIPS = true;   /* THE ONE LINE TO FLIP (the shipping batch, after the art lane, the tune and the browser walk) */
export function mnOn() {
  if (MANOR_SHIPS) return true;
  const g = typeof globalThis !== 'undefined' ? globalThis : null; if (!g) return false;
  if (g.__MN === true) return true; if (g.__MN === false) return false;
  return !!g.location && /[?&]mn=1(&|#|$)/.test(String(g.location.search || ''));
}
