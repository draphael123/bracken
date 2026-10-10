// tools/ksar-locks.mjs - THE BANDIT KSAR WITH ITS LOCKS OPEN, for the fill-based tools (claude/batch82-integ).
// The Ksar's route is a chain of verbs the reach fill has none for: the gate winch's portcullis (column 257), the keg arches and
// powder-run walls (barricades), the reeds a torch burns, the raised rope bridge a torch brings down. As built they are solid cells, so
// src/reachcore.js's fill stops at column 256 - a gap in the MODEL, not the level: tools/ksar-route.mjs walks the whole road with every
// hero's real keys and the verbs (src/ksar-hands.js). This returns the level as a player who has done them sees it - the same cells
// src/ksar-hands.js opens (cellOpen over the barricade/reed rects and the rope's column, ONEWAY along the fallen bridge's span), nothing
// else: every OTHER wall, gap and gate is the fill's to answer, and a gate laid on top (an elite's) still has to hold.
// The grille (column 257, rows 24-28) stays bars: a called man gets out, nobody gets in.
import { T } from '../src/level.js';
export function ksarOpened(L) {
  if (!L.ksar) return L;
  const grid = L.grid.slice(), open = (x, y) => { if (grid[y * L.W + x] === T.SOLID) grid[y * L.W + x] = T.AIR; };
  for (const b of [...(L.barricades || []), ...(L.reeds || [])]) for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) open(x, y);
  const g = L.gate; if (g) for (let y = g.y0; y <= g.y1; y++) open(g.x, y);
  for (const r of L.ropeBridges || []) { for (let y = r.y0; y <= r.y1; y++) open(r.x, y); const [x0, x1, row] = r.span; for (let x = x0; x <= x1; x++) grid[row * L.W + x] = T.ONEWAY; }
  return { ...L, grid };
}
