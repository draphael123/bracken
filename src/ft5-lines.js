/* src/ft5-lines.js - FALLING TOWER 5's words and two of its numbers (claude/ft5a). No imports, so src/hint-lines.js can route the lines without pulling the builder in. */
export const SLAB = { tell: 0.8, ride: 3.4, back: 6, acc: 70, fall: 46 };
/* THE LINES (all routed through src/hint-lines.js SAY_LINES, so a number() of one shows in the hint box) */
export const FT5_LINES = {
  act1: 'ACT I - THE TIP', act2: 'ACT II - IT GOES OVER', act3: 'ACT III - FREEFALL', run: 'THE FALL',
  teaser: 'HIS POISON RISES - FAR BELOW', shelves: 'THE SHELVES GO', dome: 'THE DOME COMES IN', shear: 'THE GALLERY SHEARS: HOLD ON',
  bell: 'THE GREAT BELL TEARS LOOSE', bellAfter: 'THE BELL PLUGS THE WELL: BREATHE', peel: 'THE OUTER FACE PEELS', over: 'IT GOES OVER',
  breathe: 'A BRACED LEDGE: THE POISON HOLDS', slab: 'THE FLOOR TEARS LOOSE: RIDE IT',
  rise2: 'HIS POISON RISES: CLIMB!', surge2a: 'THE POISON SURGES', surge2b: 'IT SURGES AGAIN',
  rise3: 'THE POISON IS UP THROUGH THE BELL: CLIMB!', surge3a: 'IT SURGES: THE TOWER IS HOLLOW', surge3b: 'IT SURGES: OUT AND UP',
  riseRun: 'THE TOWER IS FALLING: RUN!', surgeRun: 'THE WALL GOES UNDER: RUN',
};
export const FOLLY_LINES = ['HIS SPELL HELD THE TOWER UP.', 'IT BREAKS.'];   /* the Folly's end (plan sec 4, Q11 rec) */
/* EVERY LINE FT5 SAYS (src/hint-lines.js SAY_LINES: a number() of one is drawn in the hint box) */
export const FT5_SAY = [...new Set([...Object.values(FT5_LINES), ...FOLLY_LINES])];
