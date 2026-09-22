// src/dune-yard.js — THE DUNE YARD (trial_slopes): the practice yard with every slope kind in it, for phase 2 to list next
// to THE OPEN YARD (level.js `openYard`, LEVELS id 'trial_open'). Standalone so it can be built and proved before the wiring:
// phase 2 imports buildDuneYard into level.js and adds
//   { id: 'trial_slopes', name: 'THE DUNE YARD', sub: 'slopes, slides and a gap only a slide clears', build: () => buildDuneYard(T), hidden: true }
// Built from columns: each column is flat rock or one slope tile, at a height, with rock under it (slopeLint: clean).
// tools/slopes.mjs walks the physics knight across it, checks the reach fill, and proves the slide gap.
import { SLOPE } from './slopes.js';

export const DUNE_YARD_W = 160, DUNE_YARD_H = 30, DUNE_YARD_FLOOR = 22;
/* the layout: pieces as in tools/slopes.mjs's yard(): F flat, R1/L1 steep up/down one row, R2/L2 gentle (two tiles), GAPn an
   n-tile pit, FACE a lone L1 met from its tall side, LONE a lone R1; '#name' marks where a section starts (L.sections) */
export const DUNE_YARD_PIECES = [
  ...Array(8).fill('F'),
  '#steep', 'R1', 'R1', 'R1', 'F', 'F', 'F', 'L1', 'L1', 'L1', ...Array(6).fill('F'),
  '#gentle', 'R2', 'R2', 'R2', 'F', 'F', 'F', 'L2', 'L2', 'L2', ...Array(6).fill('F'),
  '#peak', 'R1', 'R2', 'R1', 'L2', 'L1', 'L2', ...Array(6).fill('F'),
  '#valley', 'L1', 'L1', 'F', 'F', 'F', 'F', 'R2', 'R2', ...Array(6).fill('F'),
  '#slide', 'R1', 'R1', 'R1', 'R1', 'F', 'F', 'L1', 'L1', 'L1', 'L1', 'GAP6', ...Array(6).fill('F'),
  '#face', 'F', 'F', 'FACE', ...Array(5).fill('F'), 'LONE', ...Array(6).fill('F'),
];
export function buildDuneYard(T) {
  const W = DUNE_YARD_W, H = DUNE_YARD_H, base = DUNE_YARD_FLOOR, grid = new Uint8Array(W * H), ents = [];
  const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  const rockFrom = (x, y) => { for (let yy = y; yy < H; yy++) set(x, yy, T.SOLID); };
  const ent = (t, x, y, extra = {}) => ents.push({ t, x, y, ...extra });
  let x = 2, lvl = 0; const marks = {};
  const col = (kind, l) => { const top = base - l; if (kind === 'F') rockFrom(x, top); else { set(x, top, kind); rockFrom(x, top + 1); } x++; };
  for (const p of DUNE_YARD_PIECES) {
    if (p[0] === '#') marks[p.slice(1)] = x;
    else if (p === 'F') col('F', lvl);
    else if (p === 'R1') { lvl++; col(SLOPE.R1, lvl); }
    else if (p === 'L1') { col(SLOPE.L1, lvl); lvl--; }
    else if (p === 'R2') { lvl++; col(SLOPE.R2A, lvl); col(SLOPE.R2B, lvl); }
    else if (p === 'L2') { col(SLOPE.L2B, lvl); col(SLOPE.L2A, lvl); lvl--; }
    else if (p.startsWith('GAP')) { const n = +p.slice(3); marks.gap = [x, x + n - 1]; for (let i = 0; i < n; i++) { rockFrom(x, base + 3); x++; } }   // a pit three rows deep: a jump gets you back out
    else if (p === 'FACE') { marks.faceTile = x; set(x, base - 1, SLOPE.L1); rockFrom(x, base); x++; }                  // one L1 on the flat: its tall LEFT side is a wall
    else if (p === 'LONE') { marks.lone = x; set(x, base - 1, SLOPE.R1); rockFrom(x, base); x++; }                  // one R1 on the flat: walked up, stepped off the top
  }
  for (; x < W; x++) rockFrom(x, base - lvl);
  for (let y = 0; y < H; y++) { set(0, y, T.SOLID); set(1, y, T.SOLID); set(W - 2, y, T.SOLID); set(W - 1, y, T.SOLID); }   // walled
  // the lie of it, for the signs and the tools: the first column of each section
  const S = marks;
  ent('sign', 4, base - 1, { text: 'THE DUNE YARD. HOLD DOWN ON A SLOPE TO SLIDE. JUMP OUT OF A SLIDE AND YOU GO FURTHER.' });
  for (const dx of [5, 21, 40]) ent('dummy', dx, base - 1);
  ent('soldier', S.steep + 4, base - 4, { face: 1 });                     // on the steep hill's top: a walker goes over it
  ent('soldier', S.gentle + 7, base - 4, { face: -1 });                   // and one on the gentle hill
  ent('sign', S.slide - 2, base - 1, { text: 'THE SLIDE RUN. SLIDE DOWN THE FAR SIDE, KEEP DOWN HELD, JUMP AT THE PIT: A RUNNING JUMP WILL NOT CLEAR IT.' });
  ent('dummy', S.gap[1] + 3, base - 1);
  ent('sign', S.faceTile - 2, base - 1, { text: 'A SLOPE MET FROM ITS TALL SIDE IS A WALL.' });
  return {
    W, H, grid, ents, START: { x: 4, y: base - 1 }, pools: [], falls: [], moversExtra: [], interiors: [], trial: [], sections: S,
    openYard: true, duskStart: -1, duskLen: 1, music: 'select', reachExact: true, noCoin: true,
    palette: { set: 'desert', sky: 'desert', dress: 'desert' },   /* phase 2: the desert art (redraw/desert.js) behind it */
  };
}
