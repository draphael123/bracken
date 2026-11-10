/* src/ac-flag.js - THE MAGE ACADEMY (claude/academy, the OPUS GREYBOX; scratch/brief-academy-1016.md, Daniel 10-16).
   THE SHIP SWITCH. While ACADEMY_SHIPS is false the live game is master's: no LEVELS row, no map node, THE MAGE'S FOLLY still needs THE WITCHLIGHT STAIR,
   and no save is touched (tools/academy.mjs proves it). Two ways to see the level with it off:
     ?ac=1 in the page's address           (a browser walk / the art lane: ?ac=1&dev=1, ?ac=1&dev=1&acboss=1, ?ac=1&boss=headmistress)
     globalThis.__AC = true                (a node tool, BEFORE it imports src/level.js: node --import ./tools/ac-on.mjs tools/<check>.mjs academy)
   acOn() is read when src/level.js and src/main.js are imported (the LEVELS row and the road are built once), so tools/academy.mjs runs its flag-on half
   in a child process. Pattern: src/ww-flag.js (claude/wispwood). */
export const ACADEMY_SHIPS = false;   /* THE ONE LINE TO FLIP (the shipping batch, after the art lane, the tune and the browser walk) */
export function acOn() {
  if (ACADEMY_SHIPS) return true;
  const g = typeof globalThis !== 'undefined' ? globalThis : null; if (!g) return false;
  if (g.__AC === true) return true; if (g.__AC === false) return false;
  return !!g.location && /[?&]ac=1(&|#|$)/.test(String(g.location.search || ''));
}
/* THE ROAD INSERT (src/route-insert.js's one rule, with the Academy's own row so the desert table is untouched): the Academy needs the Stair, the Folly needs
   the Academy; a save that had the Folly open when the Academy arrived keeps it (PROG.roadOpen.mage), once. Read only while acOn(). */
export const AC_INSERT = [{ id: 'academy', after: 'witchlight', before: 'mage', live: true }];
