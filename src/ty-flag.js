/* src/ty-flag.js - THE TOURNEY (claude/tourney, the OPUS GREYBOX; scratch/brief-ghosttrain-tourney-1016.md section 2).
   THE SHIP SWITCH. While TOURNEY_SHIPS is false the live game is master's: no LEVELS row, no map node, THE TOWPATH still needs WAYMEET, and no save is
   touched (tools/tourney.mjs proves it). Two ways to see the level with it off:
     ?ty=1 in the page's address           (a browser walk / the art lane: ?ty=1&dev=1, ?ty=1&dev=1&tyboss=1, ?ty=1&boss=tychampion)
     globalThis.__TY = true                (a node tool, BEFORE it imports src/level.js: node --import ./tools/ty-on.mjs tools/<check>.mjs tourney)
   tyOn() is read when src/level.js and src/main.js are imported (the LEVELS row and the road are built once), so a node check that wants both roads runs twice
   (tools/tourney.mjs does: the flag-off half in its own process). Pattern: src/gt-flag.js (claude/ghosttrain), src/ft5-flag.js. */
export const TOURNEY_SHIPS = false;   /* THE ONE LINE TO FLIP (the shipping batch, after the art lane, the tune and the browser walk) */
export function tyOn() {
  if (TOURNEY_SHIPS) return true;
  const g = typeof globalThis !== 'undefined' ? globalThis : null; if (!g) return false;
  if (g.__TY === true) return true; if (g.__TY === false) return false;
  return !!g.location && /[?&]ty=1(&|#|$)/.test(String(g.location.search || ''));
}
