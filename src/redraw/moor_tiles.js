// moor_tiles.js - GALE MOOR's TOR COUNTRY TILE KIT (claude/moor2art): THE WIND ROCKS and THE GOBLIN SCAFFOLDS (L.moorRocks.x0..x1).
// Wind-scoured GRANITE (cool grey, blocky joints, lichen, quartz grain) instead of the moor's brown peat, with a turf-and-heather cap on some tops and a bare
// lit slab on the rest; rounded boulders where a stone stands alone in the air; the TARN's own black wet rock and the slime line at the waterline; and the
// goblins' scavenged scaffold boards (bleached, mismatched, lashed with hide cord, a red tusk-paint mark) in place of the generic plank.
// Made from px.js primitives, 16x16, baked once and memoised.   moorTile(t, x, y, at, T, L) -> a canvas for one cell, or null (the game's own kit draws it).
// The rules (design-standard A8): a top is lit; a face is darker than its top; the tarn's rock is the darkest thing on the screen; timber is the warm thing on
// a cold stone moor, so the eye finds the scaffold across the water.
import { canvas, px, rect, mulberry } from '../px.js';

export const GR = { g0: '#1a1d26', g1: '#2e333f', g2: '#555c6b', g3: '#6e7686', g4: '#8d96a7', g5: '#a3abb9', q: '#d4dae4',
  lichen: '#9aa44a', lichenD: '#6e7a34', ochre: '#b49a58', moss: '#4a6a3a', mossL: '#7a9a46',
  grass: '#7a8a3a', grassL: '#a8b84a', grassD: '#3e4c26', peat: '#4a3e30', peatD: '#2e261e', heather: '#8a5a96', heatherL: '#b684c0',
  bed0: '#0a1218', bed1: '#122029', bed2: '#1c3038', slime: '#3e6a46', slimeL: '#6a9a58', wet: '#16303a',
  w0: '#2a2420', w1: '#4a4036', w2: '#6e6252', w3: '#8e8068', w4: '#b0a284', cord: '#c0a878', cordD: '#7a6438', paint: '#a3322a', paintD: '#6a1e1a', iron: '#3a3a42', bone: '#d8d2bc' };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };
const tone = [GR.g2, GR.g3, GR.g2, GR.g1, GR.g3, GR.g2];

/* a GRANITE BLOCK face: two courses of irregular blocks (joints offset per row), each block lit top-left and shaded bottom-right, quartz grain, a hairline crack, a patch of lichen.
   e: 1 air west, 2 air east, 4 air below; wet: the tarn's black waterline rock */
function face(tx, ty, e, wet, lichen) {
  return once('f' + (tx & 3) + '_' + (ty & 3) + '_' + e + wet + lichen, () => { const [c, g] = canvas(16, 16), r = mulberry(hash(tx & 3, ty & 3) + 17);
    rect(g, 0, 0, 16, 16, wet ? GR.bed2 : GR.g1);
    const cut = r() < 0.45 ? [0, 16] : [0, 6 + ((r() * 5) | 0), 16];   /* a tall slab, or two courses: the joints never line up across a wall, so it reads as outcrop rock, not a brick wall */   /* course boundaries */
    for (let k = 0; k < cut.length - 1; k++) { const y0 = cut[k], y1 = cut[k + 1] - 1; let x = -((r() * 6) | 0);
      while (x < 16) { const w = 9 + ((r() * 8) | 0), x0 = Math.max(0, x + 1), x1 = Math.min(15, x + w - 1), base = wet ? [GR.bed1, GR.wet, GR.bed2][(r() * 3) | 0] : tone[(r() * tone.length) | 0];
        if (x1 > x0) { rect(g, x0, y0 + 1, x1 - x0 + 1, y1 - y0, base);
          if (!wet) { rect(g, x0, y0 + 1, x1 - x0 + 1, 1, GR.g4); rect(g, x0, y0 + 1, 1, y1 - y0, GR.g3); rect(g, x1, y0 + 2, 1, y1 - y0 - 1, GR.g1); rect(g, x0 + 1, y1, x1 - x0, 1, GR.g1); }
          else { rect(g, x0, y1, x1 - x0 + 1, 1, GR.bed0); rect(g, x0, y0 + 1, x1 - x0 + 1, 1, GR.wet); } }
        x += w; } }
    if (!wet) for (let i = 0; i < 3; i++) px2(g, (r() * 16) | 0, (r() * 16) | 0, i % 2 ? GR.q : GR.g5);                  /* quartz grain */
    for (let i = 0; i < 2; i++) px2(g, (r() * 16) | 0, (r() * 16) | 0, wet ? GR.bed0 : GR.g0);                           /* pits */
    if (r() < 0.4) { let x = 3 + ((r() * 10) | 0); for (let y = 1 + ((r() * 4) | 0); y < 14; y++) { px2(g, x, y, wet ? GR.bed0 : GR.g0); if (r() < 0.4) x += r() < 0.5 ? -1 : 1; } }   /* a hairline crack */
    if (lichen && !wet) { const cx = 2 + ((r() * 11) | 0), cy = 2 + ((r() * 10) | 0), col = r() < 0.5 ? GR.lichen : GR.ochre;
      for (let i = 0; i < 7; i++) px2(g, cx + (((r() - 0.5) * 6) | 0), cy + (((r() - 0.5) * 4) | 0), i % 3 ? col : GR.lichenD); }
    if (wet) { for (let i = 0; i < 4; i++) px2(g, (r() * 16) | 0, (r() * 16) | 0, GR.slime); }
    if (e & 1) { rect(g, 0, 0, 1, 16, wet ? GR.bed0 : GR.g0); g.globalAlpha = 0.3; rect(g, 1, 0, 2, 16, '#000'); g.globalAlpha = 1; }   /* air to the west: a shadowed edge */
    if (e & 2) { rect(g, 15, 0, 1, 16, wet ? GR.wet : GR.g5); g.globalAlpha = 0.16; rect(g, 13, 0, 2, 16, '#cfe0ff'); g.globalAlpha = 1; }   /* air to the east: the sky's light on the rock */
    if (e & 4) { for (let x = 0; x < 16; x++) { const d = 3 + (hash(x + (tx & 3) * 16, ty) % 3); for (let y = 16 - d; y < 16; y++) px2(g, x, y, y > 16 - d + 1 ? GR.g0 : GR.g1); }   /* air below: a ragged overhang, dark */
      g.globalAlpha = 0.3; rect(g, 0, 8, 16, 5, '#000'); g.globalAlpha = 1; if (!wet && r() < 0.5) { const dx = 2 + ((r() * 12) | 0); rect(g, dx, 13, 1, 3, GR.g4); } }   /* (and a drip hanging from it) */
    return c; });
}
/* a TOP tile: a TURF CAP (grass lip, peat under it, a sprig of heather) or a BARE SLAB (lit lip, a seam, lichen in it); a stone standing alone in the air rounds its corners */
function top(tx, ty, e, kind, round) {
  return once('t' + (tx & 3) + '_' + (ty & 3) + '_' + e + kind + round, () => { const base = face(tx, ty + 1, e & 3, 0, 0), [c, g] = canvas(16, 16), r = mulberry(hash(tx & 3, ty & 3) + 91); g.drawImage(base, 0, 0);
    if (kind === 'turf') {
      rect(g, 0, 0, 16, 4, GR.peat); rect(g, 0, 0, 16, 1, GR.grassL); rect(g, 0, 1, 16, 2, GR.grass); rect(g, 0, 3, 16, 1, GR.grassD); rect(g, 0, 4, 16, 1, GR.peatD);
      for (let x = 0; x < 16; x++) { const d = hash(x + (tx & 3) * 16, ty) % 4; if (d === 0) px2(g, x, 3, GR.peatD); if (d === 1) px2(g, x, 0, GR.grass); if (d === 2) px2(g, x, 4, GR.grassD); }   /* a ragged root fringe */
      for (let i = 0; i < 3; i++) { const x = (r() * 15) | 0; px2(g, x, 0, GR.grassL); px2(g, x + 1, 1, GR.grassL); }
      if (r() < 0.5) { const x = 2 + ((r() * 11) | 0); px2(g, x, 0, GR.heather); px2(g, x + 1, 1, GR.heatherL); px2(g, x - 1, 1, GR.heather); }   /* a sprig of heather */
    } else {
      rect(g, 0, 0, 16, 1, GR.g5); rect(g, 0, 1, 16, 1, GR.g4); rect(g, 0, 2, 16, 2, GR.g3); rect(g, 0, 4, 16, 1, GR.g0);
      for (let i = 0; i < 4; i++) px2(g, (r() * 16) | 0, 1 + ((r() * 3) | 0), i % 2 ? GR.q : GR.g5);
      if (r() < 0.6) { const x = 1 + ((r() * 12) | 0); rect(g, x, 2, 3, 1, GR.moss); px2(g, x + 1, 1, GR.mossL); px2(g, x + 2, 3, GR.lichenD); }   /* moss in the seam */
      if (r() < 0.5) { const x = 2 + ((r() * 10) | 0); px2(g, x, 0, GR.heatherL); px2(g, x + 1, 0, GR.heather); }
    }
    g.globalAlpha = 0.25; rect(g, 0, 5, 16, 2, '#000'); g.globalAlpha = 1;   /* the cap's own shadow on the face under it */
    if (round & 1) { px2(g, 0, 0, 0); g.clearRect(0, 0, 2, 1); g.clearRect(0, 1, 1, 1); px2(g, 1, 1, GR.g4); px2(g, 0, 2, GR.g1); }
    if (round & 2) { g.clearRect(14, 0, 2, 1); g.clearRect(15, 1, 1, 1); px2(g, 14, 1, GR.g4); px2(g, 15, 2, GR.g1); }
    return c; });
}
/* the INTERIOR of a mass (nothing near the open air): mottled rock with a few strata lines and cracks, no block joints - a tor is one outcrop, not a wall of bricks */
function fill(tx, ty) {
  return once('m' + (tx & 3) + '_' + (ty & 3), () => { const [c, g] = canvas(16, 16), r = mulberry(hash(tx & 3, ty & 3) + 41); rect(g, 0, 0, 16, 16, '#323845');
    for (let i = 0; i < 9; i++) { const x = (r() * 16) | 0, y = (r() * 16) | 0, w = 3 + ((r() * 7) | 0), h = 2 + ((r() * 4) | 0); rect(g, x, y, w, h, r() < 0.5 ? GR.g2 : '#3a404d'); }
    for (let i = 0; i < 2; i++) { const y = (r() * 15) | 0; rect(g, 0, y, 16, 1, '#262a35'); rect(g, 0, y + 1, 16, 1, '#3c4250'); }   /* strata */
    for (let i = 0; i < 5; i++) px2(g, (r() * 16) | 0, (r() * 16) | 0, i % 2 ? GR.g3 : GR.g0);
    if (r() < 0.35) { let x = 3 + ((r() * 10) | 0); for (let y = 0; y < 16; y++) { px2(g, x, y, GR.g0); if (r() < 0.35) x += r() < 0.5 ? -1 : 1; } }
    return c; });
}
/* a BOULDER piece: smooth rounded rock, lit from the upper left across the whole stone (lx, ly: this tile's place in it, 0..1), outlined dark where it meets air, corners rounded 4 px, lichen */
function boulder(tx, ty, e, lx, ly, w, h) {
  return once('o' + (tx & 3) + '_' + (ty & 3) + '_' + e + '_' + w + h + '_' + lx + ly, () => { const [c, g] = canvas(16, 16), r = mulberry(hash(tx & 3, ty & 3) + 63);
    const shade = (x, y) => { const u = (lx * 16 + x) / (w * 16), v = (ly * 16 + y) / (h * 16), k = u * 0.55 + v * 0.7; return k < 0.28 ? GR.g5 : k < 0.5 ? GR.g4 : k < 0.75 ? GR.g3 : k < 1.0 ? GR.g2 : GR.g1; };
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px(g, x, y, shade(x, y));
    for (let i = 0; i < 6; i++) { const x = (r() * 16) | 0, y = (r() * 16) | 0; px2(g, x, y, r() < 0.5 ? GR.g1 : GR.g4); }
    if (r() < 0.5) { const x = 2 + ((r() * 11) | 0), y = 2 + ((r() * 11) | 0); for (let i = 0; i < 6; i++) px2(g, x + (((r() - 0.5) * 6) | 0), y + (((r() - 0.5) * 4) | 0), i % 3 ? GR.lichen : GR.ochre); }
    if (r() < 0.4) { let x = 4 + ((r() * 8) | 0); for (let y = 2; y < 12; y++) { px2(g, x, y, GR.g0); if (r() < 0.4) x += r() < 0.5 ? -1 : 1; } }
    const top = e & 8, west = e & 1, east = e & 2, under = e & 4;
    if (top) { rect(g, 0, 0, 16, 1, GR.g0); rect(g, 0, 1, 16, 1, GR.g5); }
    if (west) { rect(g, 0, 0, 1, 16, GR.g0); rect(g, 1, 0, 1, 16, GR.g4); } if (east) { rect(g, 15, 0, 1, 16, GR.g0); rect(g, 14, 0, 1, 16, GR.g1); } if (under) rect(g, 0, 15, 16, 1, GR.g0);
    const R = 7, corner = (ox, oy, fx, fy) => { for (let yy = 0; yy < R; yy++) for (let xx = 0; xx < R; xx++) { const X = fx ? 15 - xx : xx, Y = fy ? 15 - yy : yy, d = Math.hypot(R - xx - 0.5, R - yy - 0.5); if (d > R) g.clearRect(X, Y, 1, 1); else if (d > R - 1.2) px2(g, X, Y, GR.g0); } };
    if (top && west) corner(0, 0, 0, 0); if (top && east) corner(15, 0, 1, 0); if (under && west) corner(0, 15, 0, 1); if (under && east) corner(15, 15, 1, 1);
    if (top && r() < 0.6) { const x = 3 + ((r() * 9) | 0); px2(g, x, 1, GR.mossL); px2(g, x + 1, 1, GR.moss); px2(g, x + 1, 2, GR.moss); }
    return c; });
}
/* the tarn's BED: black wet rock with a slimed lip, nothing lit */
function bed(tx, ty, e) {
  return once('b' + (tx & 3) + '_' + e, () => { const base = face(tx, ty + 2, e & 3, 1, 0), [c, g] = canvas(16, 16), r = mulberry(hash(tx & 3, 5) + 3); g.drawImage(base, 0, 0);
    rect(g, 0, 0, 16, 3, GR.bed0); rect(g, 0, 3, 16, 1, GR.slime); for (let x = 0; x < 16; x++) { if (hash(x + (tx & 3) * 16, 9) % 3 === 0) px2(g, x, 2, GR.slime); if (hash(x, 4) % 5 === 0) px2(g, x, 3, GR.slimeL); }
    return c; });
}
/* the GOBLINS' SCAFFOLD BOARDS: bleached scavenged planks of every length, some a hair proud, joints bound in hide cord, a red tusk-paint mark on one in six, the beam under them lashed; chewed ends where the run stops */
function deck(l, r2, x) {
  return once('d' + l + r2 + (x % 6), () => { const [c, g] = canvas(16, 16), rr = mulberry(hash(x % 6, 31) + 7);
    rect(g, 0, 1, 16, 5, GR.w2); rect(g, 0, 1, 16, 1, GR.w4); rect(g, 0, 5, 16, 1, GR.w0);
    let bx = -((x * 5) % 7); while (bx < 16) { const w = 5 + ((rr() * 6) | 0), col = [GR.w2, GR.w3, GR.w1, GR.w2][(rr() * 4) | 0], up = rr() < 0.25 ? 1 : 0;   /* each board: a length, a tone, maybe proud */
      const x0 = Math.max(0, bx), x1 = Math.min(15, bx + w - 1); if (x1 >= x0) { rect(g, x0, 1 - up, x1 - x0 + 1, 5 + up, col); rect(g, x0, 1 - up, x1 - x0 + 1, 1, up ? GR.w4 : GR.w3); rect(g, x0, 5, x1 - x0 + 1, 1, GR.w0);
        for (let k = 0; k < 2; k++) rect(g, x0 + ((rr() * (x1 - x0 + 1)) | 0), 2 + k * 2, 2 + ((rr() * 3) | 0), 1, GR.w1); }   /* grain */
      if (bx + w - 1 <= 15 && bx + w - 1 >= 0) rect(g, bx + w - 1, 1 - up, 1, 5 + up, GR.w0);   /* the joint */
      bx += w; }
    if ((x % 6) === 2) { rect(g, 3, 2, 5, 1, GR.paint); rect(g, 4, 3, 1, 2, GR.paint); rect(g, 6, 3, 1, 2, GR.paint); rect(g, 3, 2, 1, 1, GR.paintD); }   /* the tusk, painted */
    const bind = bx0 => { rect(g, bx0, 0, 3, 8, GR.cord); rect(g, bx0, 0, 1, 8, '#e0c898'); rect(g, bx0 + 2, 0, 1, 8, GR.cordD); for (let y = 1; y < 8; y += 2) px2(g, bx0 + 1, y, GR.cordD); };
    if ((x & 1) === 0) bind(10 - (x % 4));
    rect(g, 0, 6, 16, 3, GR.w1); rect(g, 0, 6, 16, 1, GR.w0); rect(g, 0, 8, 16, 1, GR.w0); rect(g, 0, 7, 16, 1, GR.w2);   /* the beam under the boards */
    if ((x & 1) === 1) { bind(5 + (x % 3)); }
    if ((x % 3) === 0) { px2(g, 12, 9, GR.cord); px2(g, 12, 10, GR.cordD); px2(g, 12, 11, GR.cordD); }   /* an end of cord hanging down */
    rect(g, 0, 9, 16, 1, '#0a0806'); g.globalAlpha = 0.4; rect(g, 0, 9, 16, 4, '#000'); g.globalAlpha = 1;
    if (l) { rect(g, 0, 0, 2, 9, GR.w0); px2(g, 2, 2, GR.w1); px2(g, 2, 4, GR.w1); px2(g, 0, 0, 0); g.clearRect(0, 0, 1, 2); px2(g, 1, 3, GR.w3); }   /* a chewed, splintered end */
    if (r2) { rect(g, 14, 0, 2, 9, GR.w0); px2(g, 13, 3, GR.w1); px2(g, 13, 5, GR.w1); g.clearRect(15, 0, 1, 2); px2(g, 14, 2, GR.w3); }
    return c; });
}

export function moorTile(t, x, y, at, T, L) {
  const M = L && L.moorRocks; if (!M || x < M.x0 || x > M.x1) return null;
  const air = (dx, dy) => at(x + dx, y + dy) === T.AIR;
  if (t === T.PLANK) return deck(at(x - 1, y) !== T.PLANK, at(x + 1, y) !== T.PLANK, x);
  if (t !== T.SOLID) return null;
  /* is it in the tarn: under a deep pool's surface, in its columns (the bed) or beside them (a wet wall) */
  const px0 = x * 16, tarn = (L.pools || []).find(p => !p.shallow && !p.swim && p.bottom !== undefined && px0 + 16 > p.x0 - 16 && px0 < p.x1 + 16 && y * 16 >= p.y - 4);
  const e = (air(-1, 0) ? 1 : 0) | (air(1, 0) ? 2 : 0) | (air(0, 1) ? 4 : 0), tp = air(0, -1);
  if (tarn) { const inside = px0 >= tarn.x0 && px0 + 16 <= tarn.x1; if (tp && inside) return bed(x, y, e); return face(x, y, e, 1, 0); }
  /* A BOULDER: a stone standing in the open - its row of rock is four tiles wide at most and open air stands over it - is drawn as one rounded stone, not as wall */
  const narrow = yy => { let a = 0, b = 0; while (a < 4 && at(x - a - 1, yy) === T.SOLID) a++; while (b < 4 && at(x + b + 1, yy) === T.SOLID) b++; return at(x, yy) === T.SOLID && a + b + 1 <= 4 && at(x - a - 1, yy) === T.AIR && at(x + b + 1, yy) === T.AIR ? { a, w: a + b + 1 } : null; };
  { const rn = narrow(y); if (rn) { let u = 0, d = 0; while (u < 3 && narrow(y - u - 1)) u++; while (d < 3 && narrow(y + d + 1)) d++;
    if (at(x, y - u - 1) === T.AIR) return boulder(x, y, (air(-1, 0) ? 1 : 0) | (air(1, 0) ? 2 : 0) | (air(0, 1) ? 4 : 0) | (tp ? 8 : 0), rn.a / rn.w, u / (u + d + 1), rn.w, u + d + 1); } }   /* A BOULDER: a stone standing in the open - its row of rock four tiles wide at most, air at both ends and over it - is one rounded stone, not wall */
  if (tp) { const h = hash(x, y), solitary = air(-1, 0) && air(1, 0), round = (air(-1, 0) ? 1 : 0) | (air(1, 0) ? 2 : 0); return top(x, y, e, h % 100 < 52 ? 'turf' : 'slab', solitary || round ? round : 0); }
  let depth = 0; for (let k = 1; k <= 4; k++) { if (at(x, y - k) === T.AIR) break; depth++; }
  let near = 9; for (let k = 1; k <= 3; k++) { if (at(x, y - k) === T.AIR || at(x - k, y) === T.AIR || at(x + k, y) === T.AIR || at(x - k, y - 1) === T.AIR || at(x + k, y - 1) === T.AIR) { near = k; break; } }
  if (!e && near > 2 && !(L.pools || []).some(p => px0 + 16 > p.x0 - 48 && px0 < p.x1 + 48 && y * 16 >= p.y - 4)) return fill(x, y);   /* deep in the mass: mottled rock */
  return face(x, y, e, 0, hash(x, y) % 5 === 0 ? 1 : 0);
}
