// caravan_ruins.js — THE SUNKEN CARAVAN's RUINS (Daniel, 2026-09-25: "there should be taller buildings and more of them. Things like
// towers would be great that are in ruin"; docs/briefs/caravan-ruins-bandits.md). A town stood under the dunes before the caravan
// road, and its bones come up through the sand: tall towers you climb, half-buried houses, walls with their lintels still on, and a
// skyline of more of it in the haze. px.js primitives only, so a Node tool can render it. Colours from DESERT (desert.js): sunlit
// things pale and warm, and the inside of a ruin is the one violet of shade, the same as every other shade in the level (C4).
//   bakeRuinTiles()      { block: [3] 16x16 coursed ashlar, top: [3] the same with its sun-bleached top course and a broken lip,
//                          crack: [2] a block with a crack run through it } - laid stone, NOT the rock's sandstone skin: the
//                          masons' courses are level and jointed, the rock's are strata
//   paintRuinRoom(...)   the inside of a tower or a house (L.interiors kind 'ruin'): coursed stone in the violet of the shade,
//                          a slit window with the sun through it, the rubble along its foot
//   bakeRuinFace(tw, th, seed)  a wall face drawn BEHIND the play (L.facades kind 'ruin'): the piers a lintel stands on
//   paintSkyline(g, w, h) the far town on the horizon (towers, domes, a broken arch, a colonnade), painted into the far layer
import { canvas, px, rect, fillPoly, line, ellipse, mulberry } from '../px.js';
import { DESERT as D } from './desert.js';

export const RUIN = { l: '#f0d8b0', b: '#dcb88c', m: '#c49a70', d: '#a07a56', s: '#7a5a40', mortar: '#9a7454', crack: '#5e4230',
  inner: '#5a4458', innerL: '#6e566a', innerD: '#42323e', sun: '#ffe6b0', sky: '#bfe0f0' };
/* one 16x16 of coursed ashlar: two courses of 8, the blocks jittered in tone, a lit top edge and a shaded bottom edge on each */
function ashlar(g, rnd, x0, y0, off) {
  rect(g, x0, y0, 16, 16, RUIN.mortar);
  for (let c = 0; c < 2; c++) { const cy = y0 + c * 8, o = (c + off) % 2 ? 6 : 0;
    for (let bx = -o; bx < 16; bx += 12) { const a = Math.max(0, bx), b = Math.min(16, bx + 11); if (b <= a) continue; const tone = rnd() < 0.3 ? RUIN.m : rnd() < 0.5 ? RUIN.b : RUIN.l;
      rect(g, x0 + a, cy, b - a, 7, tone); rect(g, x0 + a, cy, b - a, 1, RUIN.l); rect(g, x0 + a, cy + 6, b - a, 1, RUIN.d);
      for (let k = 0; k < 3; k++) px(g, x0 + a + Math.floor(rnd() * (b - a)), cy + 1 + Math.floor(rnd() * 5), rnd() < 0.5 ? RUIN.m : RUIN.d); } } }
export function bakeRuinTiles() {
  const mk = (seed, fn) => { const [c, g] = canvas(16, 16), rnd = mulberry(seed); fn(g, rnd); return c; };
  const block = [0, 1, 2].map(v => mk(9101 + v, (g, rnd) => ashlar(g, rnd, 0, 0, v)));
  const top = [0, 1, 2].map(v => mk(9201 + v, (g, rnd) => { ashlar(g, rnd, 0, 0, v); rect(g, 0, 0, 16, 2, RUIN.l); px(g, 0, 0, RUIN.b);
    for (let x = 0; x < 16; x++) if (rnd() < 0.25) px(g, x, 0, 'rgba(0,0,0,0)');                                      // the weather has had the top course
    const nick = 3 + Math.floor(rnd() * 9); g.clearRect(nick, 0, 2 + (v % 2), 1 + (v === 2 ? 1 : 0)); }));          // and a bite out of its lip
  const crack = [0, 1].map(v => mk(9301 + v, (g, rnd) => { ashlar(g, rnd, 0, 0, v); let x = 4 + v * 6, y = 0;
    while (y < 16) { px(g, x, y, RUIN.crack); if (rnd() < 0.4) px(g, x + 1, y, RUIN.s); y++; if (rnd() < 0.35) x += rnd() < 0.5 ? -1 : 1; } }));
  return { block, top, crack };
}
/* THE INSIDE OF A RUIN: the back wall in shade. Courses of stone in the violet, the joints darker, a slit window high up with the
   sky and a shaft of sun through it, and fallen blocks along the floor */
export function paintRuinRoom(g, st, sx, sy, w, h, tx0 = 0, ty0 = 0) {
  if (st !== 'ruin') return false;
  const rnd = mulberry(tx0 * 131 + ty0 * 17 + 5);
  g.fillStyle = RUIN.inner; g.fillRect(sx, sy, w, h);
  for (let y = sy, row = 0; y < sy + h; y += 8, row++) { g.fillStyle = RUIN.innerD; g.fillRect(sx, y + 7, w, 1);
    for (let x = sx - (row % 2 ? 6 : 0); x < sx + w; x += 12) { g.fillStyle = RUIN.innerD; g.fillRect(x, y, 1, 7); if (rnd() < 0.35) { g.fillStyle = RUIN.innerL; g.fillRect(x + 1, y, 10, 1); } } }
  for (let wy = sy + 12; wy < sy + h - 40; wy += 56) { const wx = sx + Math.floor(w / 2) - 2 + (((wy - sy) / 56) % 2 ? 6 : -6);   // a slit window every three and a half rows
    rect(g, wx, wy, 4, 12, RUIN.sky); rect(g, wx, wy + 11, 4, 1, RUIN.sun);
    g.globalAlpha = 0.14; fillPoly(g, [[wx, wy + 12], [wx + 4, wy + 12], [wx + 16, wy + 40], [wx + 8, wy + 40]], RUIN.sun); g.globalAlpha = 1; }   /* the shaft of sun through it */
  for (let x = sx + 2; x < sx + w - 6; x += 7 + Math.floor(rnd() * 9)) { const bw = 4 + Math.floor(rnd() * 4), bh = 2 + Math.floor(rnd() * 3);   // the rubble at its foot
    g.fillStyle = RUIN.innerL; g.fillRect(x, sy + h - bh, bw, bh); g.fillStyle = RUIN.innerD; g.fillRect(x, sy + h - 1, bw, 1); }
  return true;
}
/* A WALL FACE BEHIND THE PLAY: the pier of a broken colonnade, in sun. Coursed like the tiles, its edges worn */
export function bakeRuinFace(tw, th, seed = 1) {
  const W = tw * 16, H = th * 16, [c, g] = canvas(W, H), rnd = mulberry(seed * 7 + 91);
  for (let y = 0; y < H; y += 16) for (let x = 0; x < W; x += 16) ashlar(g, rnd, x, y, (y / 16) % 2);
  g.globalAlpha = 0.18; rect(g, 0, 0, W, H, D.shade); g.globalAlpha = 1;                         /* behind the play: a step darker than what you stand on */
  for (let y = 0; y < H; y += 3) { if (rnd() < 0.4) g.clearRect(0, y, 1, 2); if (rnd() < 0.4) g.clearRect(W - 1, y, 1, 2); }   // worn edges
  rect(g, 0, H - 3, W, 3, RUIN.d);                                                                 // its footing course
  return c;
}
/* A BROKEN COURSE, STILL A SHELF: the ledges inside a tower or a house (the climb up to its hatch) and the caravanserai's
   floors are ruin masonry (L.masonry), so they draw as a shelf of the same laid ashlar the walls are - not the game's
   default felled log (Daniel, 2026-09-26: the caravan "uses wood platforms at a point... should use sand platforms or
   more appropriate terrain"). Same 16x16 shape as ART.bakeLedge/desert.js's bakeSandstoneLip, so a run of them tiles the
   same way; main.js picks this one over the open-ground lip wherever the tile sits inside L.masonry. */
export function bakeRuinLedge(seed, end) {
  const rnd = mulberry(seed); const [c, g] = canvas(16, 16);
  const x0 = end === 'L' ? 2 : 0, x1 = end === 'R' ? 14 : 16, w = x1 - x0;
  rect(g, x0, 3, w, 6, RUIN.b); rect(g, x0, 3, w, 1, RUIN.l); rect(g, x0, 8, w, 1, RUIN.d);
  rect(g, x0 + 1, 9, Math.max(0, w - 2), 2, RUIN.s);
  for (let k = 0; k < 3; k++) { const jx = x0 + 2 + k * 4; if (jx < x1) px(g, jx, 3, RUIN.m); }   // the joints of the course it was cut from
  if (rnd() < 0.4) { const cx = x0 + 1 + ((rnd() * Math.max(1, w - 2)) | 0); px(g, cx, 5, RUIN.crack); px(g, cx, 6, RUIN.crack); }
  if (end === 'L') rect(g, x0 - 1 >= 0 ? x0 - 1 : 0, 4, 1, 5, RUIN.l);
  if (end === 'R') rect(g, x1, 5, 1, 4, RUIN.d);
  return c;
}
/* A DOORWAY, seen edge on: the wall's two jambs of dressed stone either side of the dark way through, a round head on it and a worn
   threshold. Drawn BEHIND the play (L.facades 'ruindoor') at the foot of a tower's or a house's wall, so the wall is seen to come down
   to the ground on either side of the door and the building stands on its own feet (B9) - without it the wall ended three rows over
   the sand and the tower read as standing on nothing */
export function bakeRuinDoor(th = 3) {
  const W = 16, H = th * 16, [c, g] = canvas(W, H), rnd = mulberry(th * 31 + 7);
  for (let y = 0; y < H; y += 16) ashlar(g, rnd, 0, y, (y / 16) % 2);
  const ox = 3, ow = 10, top = 6;
  rect(g, ox, top + 5, ow, H - top - 5, RUIN.innerD); ellipse(g, ox + ow / 2 - 0.5, top + 5, ow / 2, 5, RUIN.innerD);   // the way through, round-headed
  rect(g, ox, top + 5, 1, H - top - 5, RUIN.inner); line(g, ox + 1, top + 1, ox + ow - 2, top + 1, RUIN.d);            // its lit reveal and the head's voussoir line
  rect(g, 0, H - 2, W, 2, RUIN.d); rect(g, ox, H - 2, ow, 1, RUIN.m);                                                     // the threshold, worn
  return c;
}
/* THE FAR TOWN: the ruins you are walking into, on the horizon behind the mesas' haze. Pale, flat, one step from the sky (no detail
   at this distance), so it reads as far: towers of different heights with broken tops, two domes, a broken arch and a colonnade */
export function paintSkyline(g, w, h, seed = 7) {
  const rnd = mulberry(seed * 977 + 3), base = h - 10, far = '#d6b28c', near = '#c89c76', lit = '#f0d6b0', slot = '#a88a90';   /* one step off the haze: far things are pale and flat */
  let x = 6;
  while (x < w - 20) { const kind = rnd();
    if (kind < 0.4) { const tw = 7 + Math.floor(rnd() * 6), th = 18 + Math.floor(rnd() * 22);                       // a tower, its top broken
      rect(g, x, base - th, tw, th, far); rect(g, x, base - th, 1, th, lit);
      for (let k = 0; k < tw; k += 2) if (rnd() < 0.6) rect(g, x + k, base - th - 2 - Math.floor(rnd() * 3), 2, 3, far);
      rect(g, x + Math.floor(tw / 2) - 1, base - th + 5, 2, 4, slot); x += tw + 4 + Math.floor(rnd() * 10); }
    else if (kind < 0.6) { const r = 7 + Math.floor(rnd() * 5);                                                     // a dome on its drum
      ellipse(g, x + r, base - 8, r, r * 0.9, near); rect(g, x, base - 8, r * 2, 8, near); rect(g, x + 2, base - 8 - Math.floor(r * 0.6), 2, 3, lit);
      x += r * 2 + 5 + Math.floor(rnd() * 8); }
    else if (kind < 0.8) { const aw = 18 + Math.floor(rnd() * 8), ah = 14 + Math.floor(rnd() * 8), top = base - ah;   // a broken arch: one pier whole, the other fallen short
      rect(g, x, top, 4, ah, far); rect(g, x + aw - 4, top + 5, 4, ah - 5, far);
      fillPoly(g, [[x, top], [x + aw * 0.25, top - 6], [x + aw * 0.5, top - 8], [x + aw * 0.7, top - 5], [x + aw * 0.7, top - 1], [x + aw * 0.5, top - 4], [x + aw * 0.25, top - 2], [x + 4, top + 2]], far);
      x += aw + 6 + Math.floor(rnd() * 8); }
    else { const n = 3 + Math.floor(rnd() * 3);                                                                     // a colonnade, some of its columns down
      for (let k = 0; k < n; k++) { const ch = rnd() < 0.3 ? 5 + Math.floor(rnd() * 5) : 14; rect(g, x + k * 5, base - ch, 3, ch, near); }
      rect(g, x, base - 16, 5 * Math.min(2, n) + 3, 2, near); x += n * 5 + 6 + Math.floor(rnd() * 8); } }
  g.globalAlpha = 0.6; rect(g, 0, base, w, h - base, far); g.globalAlpha = 1;                                       // the sand they stand in, going into the haze
}
