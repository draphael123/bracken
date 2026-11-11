/* src/ww-flag.js - WISPWOOD (claude/wispwood, the OPUS GREYBOX; scratch/brief-wispwood-1108.md, Daniel 11-08).
   THE SHIP SWITCH. While WISPWOOD_SHIPS is false the live game is master's: no LEVELS row, no map node, THE WITCHLIGHT STAIR still needs THE BURIAL CAVERNS,
   and no save is touched (tools/wispwood.mjs proves it). Two ways to see the level with it off:
     ?ww=1 in the page's address           (a browser walk / the art lane: ?ww=1&dev=1, ?ww=1&dev=1&wwboss=1, ?ww=1&boss=lanternwidow)
     globalThis.__WW = true                (a node tool, BEFORE it imports src/level.js: node --import ./tools/ww-on.mjs tools/<check>.mjs wispwood)
   wwOn() is read when src/level.js and src/main.js are imported (the LEVELS row and the road are built once), so a node check that wants both roads runs twice
   (tools/wispwood.mjs does: the flag-off half in its own process). Pattern: src/gt-flag.js (claude/ghosttrain). */
export const WISPWOOD_SHIPS = true;   /* THE ONE LINE TO FLIP (the shipping batch, after the art lane, the tune and the browser walk) */
export function wwOn() {
  if (WISPWOOD_SHIPS) return true;
  const g = typeof globalThis !== 'undefined' ? globalThis : null; if (!g) return false;
  if (g.__WW === true) return true; if (g.__WW === false) return false;
  return !!g.location && /[?&]ww=1(&|#|$)/.test(String(g.location.search || ''));
}
