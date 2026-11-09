/* src/ft5-flag.js - FALLING TOWER 5: A TOWER THAT FALLS (claude/ft5a; scratch/brief-fallingtower5-1108.md, scratch/lane-reports/ft5-plan.md sec 5).
   THE SHIP SWITCH. While FT5_SHIPS is false the live game builds THE FALLING TOWER as master does (src/tower-ascent.js buildTowerAscent, same hash) and
   THE MAGE'S FOLLY ends as it does; nothing of FT5 runs. Three ways to see FT5 with it off:
     ?ft5=1 in the page's address          (a browser walk / the art lane)
     globalThis.__FT5 = true               (a node tool, before it builds: tools/fallingtower5.mjs; or `node --import ./tools/ft5-on.mjs tools/<check>.mjs`)
   ft5On() is asked at BUILD time (level.js's row, transitions.js's row, the Folly's end), never cached at import, so a node test can build both towers
   in one process. Pattern: src/pvp-duel.js PVP_SHIPS (globalThis-safe: no `location` under node). */
export const FT5_SHIPS = false;   /* THE ONE LINE TO FLIP (the shipping batch, after art + tune + the browser walk: plan sec 5) */
export function ft5On() {
  if (FT5_SHIPS) return true;
  const g = typeof globalThis !== 'undefined' ? globalThis : null; if (!g) return false;
  if (g.__FT5 === true) return true; if (g.__FT5 === false) return false;
  return !!g.location && /[?&]ft5=1(&|#|$)/.test(String(g.location.search || ''));
}
