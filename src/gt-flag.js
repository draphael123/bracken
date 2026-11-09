/* src/gt-flag.js - THE GHOST TRAIN (claude/ghosttrain, the OPUS GREYBOX; scratch/brief-ghosttrain-tourney-1016.md section 1).
   THE SHIP SWITCH. While GHOSTTRAIN_SHIPS is false the live game is master's: no LEVELS row, no map node, THE HEXED FIELDS still needs THE HARVEST FAIR,
   and no save is touched (tools/ghosttrain.mjs proves it). Two ways to see the level with it off:
     ?gt=1 in the page's address           (a browser walk / the art lane: ?gt=1&dev=1, ?gt=1&dev=1&gtboss=1, ?gt=1&boss=conductor)
     globalThis.__GT = true                (a node tool, BEFORE it imports src/level.js: node --import ./tools/gt-on.mjs tools/<check>.mjs ghosttrain)
   gtOn() is read when src/level.js and src/main.js are imported (the LEVELS row and the road are built once), so a node check that wants both roads runs twice
   (tools/ghosttrain.mjs does: the flag-off half in its own process). Pattern: src/ft5-flag.js (claude/ft5a). */
export const GHOSTTRAIN_SHIPS = false;   /* THE ONE LINE TO FLIP (the shipping batch, after the art lane, the tune and the browser walk) */
export function gtOn() {
  if (GHOSTTRAIN_SHIPS) return true;
  const g = typeof globalThis !== 'undefined' ? globalThis : null; if (!g) return false;
  if (g.__GT === true) return true; if (g.__GT === false) return false;
  return !!g.location && /[?&]gt=1(&|#|$)/.test(String(g.location.search || ''));
}
