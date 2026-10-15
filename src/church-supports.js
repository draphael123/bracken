// src/church-supports.js - LIT CHURCH 2: NOTHING IN THE CHURCH FLOATS (claude/church2; Daniel's brief 10-10: "floating pews out - pews stand ON the nave floor with
// legs; any raised footing in the nave is a BUILT thing with a drawn support: triforium balcony on its pillars, choir stalls, pulpit stair, chandeliers on
// chains, organ pipes, scaffolding"). Every one-way run with air under it gets routeSupports entries with a church `kind` (src/route-art.js draws them here,
// tools/solid-islands.mjs counts them as drawn supports). NO tile changes: the route, the walker and the mash rows are untouched.
//   pew    two turned oak legs and the bench's end board to the floor (the nave's pews: low benches you hop)
//   pier   a slender ashlar column with a moulded cap and base down to the floor (the triforium on its pillars, the crossing piers, the transept ledges)
//   stall  a carved oak choir-stall front down to the floor (the sanctuary's stalls)
//   chain  an iron chain up to the stone over it (the crypt well's landings hang from the crossing's floor; the sacristy stair)
//   bone   a column of stacked skulls and long bones to the crypt floor (the ossuary and vault shelves)
//   pipe   an organ pipe standing on the gallery floor under the organ case's top
export const CHURCH_SUPPORT = new Set(['pew', 'pier', 'stall', 'chain', 'bone', 'pipe']);
export function addChurchSupports(L, T, rows) {
  const { W, H, grid } = L, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? T.SOLID : grid[y * W + x]);
  const solidish = k => k === T.SOLID || k === T.PORT || k === T.ONEWAY || k === T.SPIKE;
  if (!L.routeSupports) L.routeSupports = [];
  const { nave: NF, gallery: GF, crypt: CF } = rows;
  const kindAt = (x0, x1, y) => {
    if (x0 >= 275) return 'stall';   /* (church2art: the sanctuary stands 34 columns on) */
    if (x0 >= 180 && x1 <= 213 && y <= NF) return 'stall';   /* the chantry's boards are CHOIR STALLS over the fire */
    if (y > NF) { if ((x0 >= 158 && x1 <= 168) || (x0 >= 170 && x1 <= 178)) return 'chain'; return x0 >= 46 && x1 <= 56 ? 'pier' : 'bone'; }
    if (y < GF) return 'pipe';
    if (y === NF - 2 && x0 >= 56 && x1 <= 151) return 'pew';
    return 'pier'; };
  for (let y = 1; y < H - 1; y++) for (let x = 0; x < W; x++) {
    if (at(x, y) !== T.ONEWAY || at(x - 1, y) === T.ONEWAY) continue;
    let x1 = x; while (at(x1 + 1, y) === T.ONEWAY) x1++;
    const under = []; for (let c = x; c <= x1; c++) if (at(c, y + 1) === T.AIR) under.push(c); if (!under.length) continue;
    const kind = kindAt(x, x1, y), ends = x1 > x ? [x, x1] : [x];
    for (const c of ends) { if (at(c, y + 1) !== T.AIR) continue;
      if (kind === 'chain') { let top = y - 1; while (top > 0 && !solidish(at(c, top))) top--; L.routeSupports.push({ x: c, y, bottom: y + 2, top: top + 1, kind }); continue; }
      let b = y + 1; while (b < H && !solidish(at(c, b))) b++; if (b - y < 2) continue; L.routeSupports.push({ x: c, y, bottom: b, kind }); } }
  return L;
}
/* THE ART (church2art: painted in the church kit - turned oak, fluted ashlar, panelled stalls, linked chain, skull-and-femur columns, gilt pipes). p: { x, y, bottom, top?, kind } in tiles */
const C = { pew: ['#4a3020', '#7a5232', '#2a1a10'], pier: ['#8c8478', '#b4ac9e', '#5a544c'], stall: ['#4e3422', '#7e5634', '#2c1c12'], chain: ['#3a3a44', '#6a6a78', '#1e1e26'], bone: ['#cfc6a8', '#efe6c8', '#7a7058'], pipe: ['#a08a50', '#d8c070', '#5a4a28'] };
const R = (g, col, x, y, w, h) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
export function drawChurchSupport(g, p, cx, cy) {
  const k = p.kind, c = C[k] || C.pier, top = Math.round((p.y + 1) * 16 - cy), bot = Math.round(p.bottom * 16 - cy), X = Math.round(p.x * 16 - cx);
  if (k === 'chain') { const y0 = Math.round(p.top * 16 - cy), y1 = Math.round(p.y * 16 + 2 - cy); R(g, '#1e1e26', X + 5, y0, 6, 2); R(g, '#8a8aa0', X + 5, y0, 6, 1); R(g, '#c9a040', X + 7, y0 + 2, 2, 2);   /* the ring in the stone */
    for (let y = y0 + 3, i = 0; y < y1 - 2; y += 3, i++) { if (i & 1) { R(g, '#3a3a48', X + 7, y, 1, 3); R(g, '#8a8aa0', X + 7, y, 1, 1); } else { R(g, '#6a6a7c', X + 6, y, 3, 3); R(g, '#14121c', X + 7, y + 1, 1, 1); R(g, '#a0a0b8', X + 6, y, 1, 1); R(g, '#2a2a38', X + 8, y + 2, 1, 1); } }
    R(g, c[2], X + 4, y1 - 2, 8, 3); R(g, c[1], X + 4, y1 - 2, 8, 1); R(g, '#c9a040', X + 7, y1 - 1, 2, 1); return; }
  const len = bot - top; if (len < 2) return;
  if (k === 'pew') { for (const dx of [2, 11]) { R(g, c[2], X + dx - 1, top, 4, 2); R(g, c[0], X + dx, top, 2, len); R(g, c[1], X + dx, top, 1, len);   /* turned legs: a bulb and a ring every few rows */
      for (let y = top + 3; y < bot - 3; y += 6) { R(g, c[0], X + dx - 1, y, 4, 2); R(g, c[1], X + dx - 1, y, 1, 1); } R(g, c[2], X + dx - 1, bot - 2, 4, 2); }
    R(g, c[2], X + 3, bot - 4, 10, 1); R(g, c[0], X + 3, bot - 5, 10, 1); R(g, c[0], X + 1, top, 14, 2); R(g, c[1], X + 1, top, 14, 1); return; }
  if (k === 'stall') { R(g, c[0], X + 1, top, 14, len); R(g, c[1], X + 1, top, 14, 1); R(g, c[2], X + 1, top, 1, len); R(g, c[2], X + 14, top, 1, len);
    for (let y = top + 3; y < bot - 6; y += 12) { for (const x of [3, 9]) { R(g, c[2], X + x, y + 2, 4, 7); R(g, c[0], X + x + 1, y + 3, 2, 6); R(g, c[1], X + x, y + 2, 4, 1); R(g, c[2], X + x + 1, y + 1, 2, 1); R(g, c[1], X + x + 1, y, 2, 1); } }   /* trefoil-headed panels */
    R(g, c[2], X, bot - 2, 16, 2); return; }
  if (k === 'bone') { R(g, '#34322a', X + 3, top, 10, len); R(g, '#1e1c16', X + 3, top, 1, len); for (let y = top, i = 0; y < bot; y += 5, i++) { if (i & 1) { R(g, c[0], X + 3, y + 1, 10, 2); R(g, c[1], X + 3, y + 1, 10, 1); R(g, c[0], X + 2, y, 2, 4); R(g, c[0], X + 12, y, 2, 4); R(g, c[2], X + 8, y + 2, 1, 1); }
      else { R(g, c[0], X + 5, y, 6, 4); R(g, c[1], X + 5, y, 6, 1); R(g, '#1e1c16', X + 6, y + 1, 1, 2); R(g, '#1e1c16', X + 9, y + 1, 1, 2); R(g, c[2], X + 8, y + 3, 1, 1); } } return; }
  if (k === 'pipe') { R(g, c[2], X + 3, top, 10, len); R(g, c[0], X + 4, top, 8, len); R(g, c[1], X + 5, top, 2, len); R(g, c[2], X + 10, top, 2, len); R(g, '#f0dc90', X + 5, top, 1, len);
    for (const y of [top + 2, bot - 8]) { if (y < bot - 2) { R(g, c[2], X + 3, y, 10, 1); R(g, c[1], X + 3, y + 1, 10, 1); } } R(g, '#1e1810', X + 6, top + 6, 4, 3); R(g, c[1], X + 6, top + 5, 4, 1);
    R(g, c[2], X + 5, bot - 3, 6, 3); R(g, c[0], X + 6, bot - 3, 4, 1); return; }
  /* pier: a fluted ashlar column, a moulded capital under the ledge, a plinth and a torus on the floor */
  R(g, c[0], X + 5, top, 6, len); for (let x = 5; x < 11; x += 2) R(g, c[1], X + x, top, 1, len); R(g, c[2], X + 10, top, 1, len); R(g, c[2], X + 4, top, 1, len);
  R(g, c[1], X + 2, top, 12, 2); R(g, c[0], X + 3, top + 2, 10, 2); R(g, c[2], X + 3, top + 4, 10, 1); R(g, c[1], X + 4, top + 1, 8, 1);
  R(g, c[2], X + 4, bot - 5, 8, 1); R(g, c[0], X + 3, bot - 4, 10, 2); R(g, c[1], X + 3, bot - 4, 10, 1); R(g, c[2], X + 2, bot - 2, 12, 2); R(g, c[0], X + 2, bot - 2, 12, 1);
}
