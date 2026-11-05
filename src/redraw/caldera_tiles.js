// caldera_tiles.js - THE CALDERA's own TILE KIT (claude/drakeroom): the Fire Drake's room wore the default grass-topped dirt, mossy earth pillars and wooden ledges.
//   FLOOR     black basalt: a chipped lit rim, a cooled-crust skin, strata that darken with depth, EMBER CRACKS that run through the top and down into the body
//   PILLARS   the side walls / lintel: columnar basalt - tall prisms, vertical joints, a few ember seams, a chipped cap (no grass, no moss, no timber)
//   LEDGES    (ONEWAY) a slab of basalt with a glowing underside (the sinking P3 ledges)
// px.js primitives, 16x16, baked once and memoised, laid by WORLD position so cracks and joints run on from tile to tile.   caldTile(t, x, y, at, T, L) -> canvas or null
import { canvas, px, rect } from '../px.js';
const K = { b0: '#0e0a0e', b1: '#181218', b2: '#241a20', b3: '#33262c', b4: '#4a3a3a', b5: '#6a5648', b6: '#8c7860', red: '#c8321a', fire: '#ff5a1a', em: '#ff9a3a', emH: '#ffe08a' };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const EMC = [null, K.red, K.fire, K.emH];
/* an ember crack: 40 px columns, each a seeded zig-zag running down from just under the surface. 0 none, 1 red, 2 fire, 3 white-hot */
function crack(wx, ry, seed) {
  const cx = Math.floor(wx / 40), s = hash(cx, seed); if (s % 3 === 0) return 0;
  const x0 = cx * 40 + 6 + (s >> 3) % 26, len = 7 + (s >> 6) % 7; if (ry < 2 || ry > 2 + len) return 0;
  const x = x0 + Math.round(2.2 * Math.sin(ry * 0.9 + cx * 1.7) + ((ry >> 1) & 1)), d = wx - x;
  if (d === 0) return ry > 3 && ry < 1 + len && hash(wx, ry) % 3 === 0 ? 3 : 2;
  if (d === 1 && hash(wx, ry + 9) % 3 === 0) return 1; if (d === -1 && hash(wx, ry + 4) % 4 === 0) return 1; return 0;
}
/* a horizontal ember seam in the body, 48 px bands, one band in four */
function seam(wx, wy, seed) {
  const cy = Math.floor(wy / 48), s = hash(cy, seed); if (s % 4) return 0;
  const y = cy * 48 + 6 + (s >> 4) % 34 + Math.round(1.6 * Math.sin(wx / 6 + cy));
  return wy === y && hash(wx >> 1, cy) % 3 ? 2 : wy === y + 1 && hash(wx, cy) % 5 === 0 ? 1 : 0;
}
function floorTop(x, aL, aR) {
  return once('ft' + (x % 5) + (aL ? 'L' : '') + (aR ? 'R' : ''), () => {
    const [c, g] = canvas(16, 16), wx0 = x * 16;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
      const wx = wx0 + xx, n = hash(wx >> 1, yy >> 1) % 11;
      let col = yy < 1 ? K.b6 : yy < 2 ? K.b5 : yy < 4 ? K.b4 : yy < 8 ? K.b3 : yy < 12 ? K.b2 : K.b1;
      if (yy >= 2 && n === 0) col = K.b5; else if (yy >= 3 && n === 1) col = K.b1; else if (yy >= 4 && n === 2) col = K.b4;
      const cr = crack(wx, yy, 7); if (cr) col = EMC[cr]; px(g, xx, yy, col);
    }
    for (let xx = 0; xx < 16; xx++) if (hash(wx0 + xx, 5) % 3 === 0) px(g, xx, 0, K.b5);   /* a chipped, uneven lit lip */
    if (aL) { rect(g, 0, 1, 2, 15, K.b5); g.clearRect(0, 0, 1, 1); } if (aR) rect(g, 15, 1, 1, 15, K.b0);
    return c;
  });
}
function fill(x, y, deep, aL, aR, aU, aD) {
  return once('fl' + (x % 6) + '_' + (y % 4) + '_' + Math.min(deep, 6) + (aL ? 'L' : '') + (aR ? 'R' : '') + (aU ? 'U' : '') + (aD ? 'D' : ''), () => {
    const [c, g] = canvas(16, 16), wx0 = x * 16, wy0 = y * 16;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
      const wx = wx0 + xx, wy = wy0 + yy, n = hash(wx >> 1, wy >> 1) % 13, dp = Math.max(0, deep) * 16 + yy;
      let col = dp < 24 ? K.b2 : dp < 56 ? K.b1 : K.b0;
      if (n === 0) col = dp < 40 ? K.b3 : K.b2; else if (n === 1) col = K.b0; else if (n === 2 && dp < 70) col = K.b3;
      if (((wy + (wx >> 3) * 3) % 16) === 0) col = K.b0;   /* faint strata */
      const sm = dp > 8 ? seam(wx, wy, 3) : 0; if (sm) col = EMC[sm]; px(g, xx, yy, col);
    }
    if (aL) { rect(g, 0, aU ? 2 : 0, 1, 16, K.b5); rect(g, 1, aU ? 2 : 0, 1, 16, K.b3); } if (aR) { rect(g, 15, 0, 1, 16, K.b0); rect(g, 14, 0, 1, 16, K.b1); }
    if (aD) { rect(g, 0, 14, 16, 2, K.b0); for (let k = 0; k < 3; k++) { const ix = 1 + hash(wx0, wy0 + k * 4) % 13; px(g, ix, 13, K.b3); px(g, ix, 14, K.b4); px(g, ix, 15, K.b2); } }
    return c;
  });
}
/* COLUMNAR BASALT: 6 px prisms, a lit west face and a dark east face, cross joints, the odd ember seam, a chipped cap */
function column(x, y, aU, aL, aR, aD) {
  return once('co' + (x % 4) + '_' + (y % 3) + (aU ? 'U' : '') + (aL ? 'L' : '') + (aR ? 'R' : '') + (aD ? 'D' : ''), () => {
    const [c, g] = canvas(16, 16), wx0 = x * 16, wy0 = y * 16;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
      const wx = wx0 + xx, wy = wy0 + yy, off = hash(Math.floor(wx / 6), 2) % 2, ci = Math.floor((wx + off) / 6), lx = wx + off - ci * 6;
      let col = lx === 0 ? K.b4 : lx === 1 ? K.b3 : lx < 4 ? K.b2 : lx === 4 ? K.b1 : K.b0;
      const n = hash(wx, wy >> 1) % 9; if (n === 0 && lx > 1) col = K.b1; else if (n === 1 && lx < 3) col = K.b3;
      if (((wy + (hash(ci, 6) % 24)) % 40) === 0 && lx > 0) col = K.b0;   /* a cross joint */
      const sm = seam(wx, wy, 5); if (sm && lx > 0) col = EMC[sm]; px(g, xx, yy, col);
    }
    if (aU) { rect(g, 0, 0, 16, 1, K.b5); rect(g, 0, 1, 16, 2, K.b4); for (let xx = 0; xx < 16; xx++) if (hash(wx0 + xx, 8) % 4 === 0) g.clearRect(xx, 0, 1, 1); }
    if (aL) rect(g, 0, aU ? 3 : 0, 1, 16, K.b5); if (aR) rect(g, 15, 0, 1, 16, K.b0);
    if (aD) rect(g, 0, 14, 16, 2, K.b0);
    return c;
  });
}
function ledge(x, l, r) {
  return once('le' + (x % 4) + (l ? 'L' : '') + (r ? 'R' : ''), () => {
    const [c, g] = canvas(16, 16), wx0 = x * 16;
    for (let yy = 0; yy < 7; yy++) for (let xx = 0; xx < 16; xx++) { const wx = wx0 + xx; let col = yy === 0 ? K.b6 : yy === 1 ? K.b5 : yy < 4 ? K.b4 : yy < 6 ? K.b3 : K.b1; if (yy >= 2 && hash(wx >> 1, yy) % 7 === 0) col = K.b2; px(g, xx, yy, col); }
    for (let xx = 0; xx < 16; xx++) if (!(l && xx < 2) && !(r && xx > 13)) { const h = hash(wx0 + xx, 31) % 4; px(g, xx, 7, h === 0 ? K.em : K.red); if (h === 1) px(g, xx, 8, K.fire); if (h === 0) px(g, xx, 8, K.red); }   /* the glowing underside */
    if (l) { g.clearRect(0, 0, 2, 1); g.clearRect(0, 6, 3, 1); } if (r) { g.clearRect(14, 0, 2, 1); g.clearRect(13, 6, 3, 1); }
    return c;
  });
}
/* THE HOOK: the cell's own tile, or null. The floor mass = the rows at/under the arena floor between the walls; every other solid (the lintel, the west edge, the far wall) is columnar basalt */
export function caldTile(t, x, y, at, T, L) {
  if (!L || !L.drakeLab) return null;
  const air = (dx, dy) => at(x + dx, y + dy) === T.AIR;
  if (t === T.ONEWAY) return ledge(x, at(x - 1, y) !== T.ONEWAY, at(x + 1, y) !== T.ONEWAY);
  if (t !== T.SOLID) return null;
  const aU = air(0, -1) || at(x, y - 1) === T.ONEWAY, aD = air(0, 1), aL = air(-1, 0), aR = air(1, 0), fr = L.arena ? Math.round(L.arena.floor / 16) : 18;
  const inFloor = y >= fr && x > 0;
  if (inFloor && aU && y === fr) return floorTop(x, aL, aR);
  if (inFloor && !aU) return fill(x, y, Math.max(0, y - fr - 1), aL, aR, false, aD);
  return column(x, y, aU, aL, aR, aD);
}
