/* src/spire-supports.js - THE MONASTERY (id 'spire') STANDS ITS BOARDS AND ITS FLOORS ON THEIR OWN DRAWN SUPPORTS (claude/screefix, Daniel 2026-10-15 ~21:00: "floating architecture
   in the monastery"). tools/visible-supports.mjs found 126 overhangs of the Spire with nothing drawn beneath them: ninety iron-banded boards hung in the tower shafts and the
   nave, and thirty-odd masonry floors with a hall of open air under them.
   The monks' own answer, and the only one the building has: BOARDS get a SCAFFOLD POST (a timber post with iron straps, a knee brace under the board, a stone bearing block
   at its foot) that runs down to the first thing under it - a floor, a wall top or the board below, so a stair of boards is one lashed scaffold tower; FLOORS get stone PIERS
   (a banded shaft, a moulded capital under the floor, a plinth) down to the floor below, one every PIER_GAP tiles along the span.
   DRAWING ONLY: routeSupports entries (src/route-art.js -> src/spire-supports-art.js), no tile changes, so the route, the walker and the mash rows are untouched.
   The overhang scan is the same one tools/visible-supports-page.js runs (a run of non-air, non-rope tiles with open air under it, three rows or more). */
const BOARDS = new Set(['ONEWAY', 'PLANK', 'CLIMB', 'SHELF', 'REED', 'RAIL', 'BOUNCER']);
export const PIER_GAP = 12, MAX_DROP = 44;

export function spireSpans(L, T) {
  const { W, H, grid: g } = L, out = [], name = t => Object.keys(T).find(n => T[n] === t) || String(t);
  for (let y = 0; y < H - 1; y++) for (let x = 0; x < W;) {
    const t = g[y * W + x];
    if (t === T.AIR || t === T.NET || g[(y + 1) * W + x] !== T.AIR) { x++; continue; }
    let x1 = x;
    while (x1 + 1 < W && g[y * W + x1 + 1] !== T.AIR && g[y * W + x1 + 1] !== T.NET && g[(y + 1) * W + x1 + 1] === T.AIR) x1++;
    let air = 0; while (y + 1 + air < H && g[(y + 1 + air) * W + x] === T.AIR) air++;
    if (air >= 1) out.push({ x0: x, x1, row: y, air, tile: name(t) });   /* (the visible-supports scan asks for 3; a board hovering one or two rows over a floor is an island too - tools/solid-islands) */
    x = x1 + 1;
  }
  return out;
}

export function addSpireSupports(L, T) {
  if (!L || !L.grid) return L;
  const { W, H, grid: g } = L; if (!L.routeSupports) L.routeSupports = [];
  const have = new Set(L.routeSupports.map(p => p.x + ',' + p.y));
  const dropAt = (x, y) => { let b = y + 1; while (b < H - 1 && g[b * W + x] === T.AIR) b++; return g[b * W + x] !== T.AIR && b - y <= MAX_DROP ? b : -1; };
  for (const s of spireSpans(L, T)) {
    const w = s.x1 - s.x0 + 1, boards = BOARDS.has(s.tile), picks = [];
    if (!boards && s.air < 3) continue;   /* masonry that hovers one or two rows is joined to its wall: no pier */
    if (boards) {
      if (w <= 3) picks.push([(s.x0 + s.x1) >> 1, 6]);
      else { picks.push([s.x0 + 1, 6], [s.x1 - 1, 6]); for (let k = s.x0 + 9; k < s.x1 - 4; k += 9) picks.push([k, 6]); }
    } else {
      if (w <= 4) picks.push([(s.x0 + s.x1) >> 1, 10]);
      else { picks.push([s.x0 + 1, 10], [s.x1 - 1, 10]); for (let k = s.x0 + PIER_GAP; k < s.x1 - 5; k += PIER_GAP) picks.push([k, 12]); }
    }
    for (const [x0, pw] of picks) {
      /* the pier stands where there is something under it: the nearest column (within two) with a floor in reach */
      let x = -1, b = -1; for (const dx of [0, -1, 1, -2, 2]) { const q = x0 + dx; if (q < s.x0 || q > s.x1) continue; const d = dropAt(q, s.row); if (d > 0) { x = q; b = d; break; } }
      if (x < 0 || have.has(x + ',' + s.row)) continue;
      L.routeSupports.push({ x, y: s.row, bottom: b, kind: boards ? 'beam' : 'pier', w: pw }); have.add(x + ',' + s.row);
    }
  }
  return L;
}
