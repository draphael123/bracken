// sealed_pyramid_tiles.js - THE SEALED PYRAMID's own TILE KIT (claude/spart, the art pass). The greybox borrowed the monks' limestone through L.masonryKit; this is the
// tomb's own SANDSTONE: big dressed ashlar in ochre, laid in 12 px courses, a carved glyph band running along every lit wall, the floors worn pale where the robbers walked.
//   THE FACE        sun-bleached sandstone, wind-scoured, sand blown into every joint and piled on the lips
//   THE GALLERIES   warm dressed sandstone under a cavetto cornice, glyph friezes at head height
//   THE SHAFTS      cooler, greyer stone; THE FALSE TOMB gilt-inlaid (a gold line in every frieze); THE PITS green-black, damp-stained
//   THE DEEP WAY    near-black ashlar, THE ANTECHAMBER dark with the Mother's scarab cut in a frieze
//   FOOTINGS (ONEWAY, by L.plats kind)  shelf: a dressed slab on a chamfer | cornice: a broken cavetto cornice, gilt lip | walk: a bronze-banded stone beam | ledge: a worn step
//   PITS (SPIKE)    the scarab pits' floor: black stone, bone-white teeth, green carapace glints (the swarm itself runs in the set: sealed_pyramid_set.js)
//   LIGHT           every tile is tinted by the light on it: warm near a brazier, the face in sun, cold and dim where only the tomb's dark reaches
// Made from px.js primitives, 16x16, baked once and memoised.   spTile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it)
import { canvas, px, rect } from '../px.js';
import { hash } from './buried_city_tiles.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };

export const SEC = {
  face:  { r: ['#7a5a38', '#9a7848', '#bc9a60', '#dcb878', '#f4dc9c'], joint: '#5a4026', inlay: null,      base: 1 },
  gal:   { r: ['#4a3624', '#654a30', '#826440', '#a08050', '#c4a468'], joint: '#32241a', inlay: null,      base: -1 },
  shaft: { r: ['#3a3026', '#52443a', '#6c5a48', '#887258', '#a8906c'], joint: '#241c16', inlay: null,      base: -1 },
  tomb:  { r: ['#4a3420', '#6a4c2a', '#8c6a38', '#b08a46', '#d8b45c'], joint: '#2e2012', inlay: '#e0b44a', base: -1 },
  pits:  { r: ['#1c241c', '#2c382a', '#3e4c38', '#566248', '#74805c'], joint: '#10160f', inlay: '#4a8a58', base: -2 },
  deep:  { r: ['#241e1a', '#352c24', '#483c30', '#605040', '#7c6850'], joint: '#14100c', inlay: null,      base: -2 },
  ante:  { r: ['#2a2622', '#3c352c', '#52483a', '#6c5e4a', '#8a7860'], joint: '#16120e', inlay: '#3aa068', base: -2 },
};
export const secOf = x => x < 64 ? 'face' : x < 172 ? 'gal' : x < 250 ? 'shaft' : x < 328 ? 'tomb' : x < 393 ? 'pits' : x < 452 ? 'deep' : 'ante';

const INFO = new WeakMap();
function info(L) {
  if (INFO.has(L)) return INFO.get(L);
  const plat = new Map(); for (const p of L.plats || []) for (let x = p.x0; x <= p.x1; x++) plat.set(p.y * L.W + x, { kind: p.kind, i: x - p.x0, n: p.x1 - p.x0 + 1 });
  const I = { plat, lamps: L.lamps || [] }; INFO.set(L, I); return I;
}
function lightAt(I, x, y, base) {
  let v = base;
  for (const lp of I.lamps) { const d = Math.hypot(lp.x - x, (lp.y - y) * 1.2); v = Math.max(v, 3.4 - d * 0.4); }
  return Math.max(-3, Math.min(4, Math.round(v)));
}
const TINTED = new Map();
function tint(c, lit) {
  if (lit === 0) return c;
  if (!TINTED.has(lit)) TINTED.set(lit, new WeakMap()); const tm = TINTED.get(lit); if (tm.has(c)) return tm.get(c);
  const [d, g] = canvas(16, 16); g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-atop';
  g.fillStyle = lit < 0 ? 'rgba(20,16,40,' + (-lit * 0.07).toFixed(3) + ')' : lit > 2 ? 'rgba(255,214,120,' + (lit * 0.04).toFixed(3) + ')' : 'rgba(255,176,80,' + (lit * 0.045).toFixed(3) + ')'; g.fillRect(0, 0, 16, 16); tm.set(c, d); return d;
}

/* ---- a tiny carved glyph: the frieze's alphabet (eye, wave, ankh-ish loop, bird, seated figure, scarab, reed, sun) ---- */
const GLYPHS = [
  ['01110', '10101', '01110', '00100', '00000'],   // eye
  ['00000', '01010', '10101', '00000', '00000'],   // wave
  ['01110', '01010', '01110', '00100', '01110'],   // ankh
  ['00110', '01111', '00110', '00100', '01010'],   // bird
  ['00100', '01110', '00100', '01110', '01010'],   // figure
  ['01110', '11111', '10101', '11111', '01110'],   // scarab
  ['00100', '00100', '01100', '00100', '00100'],   // reed
  ['01110', '11111', '11111', '11111', '01110'],   // sun
];
function glyph(g, x, y, n, col, hi) { const G = GLYPHS[n & 7]; for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if (G[r][c] === '1') { px(g, x + c, y + r, col); } if (hi) px(g, x + 1, y, hi); }

/* ---- the dressed ashlar: courses of 12 px, blocks 20-34 px, a chamfered edge, per-block tone, cracks and wear ---- */
function ashlar(g, S, wx0, wy0, deep) {
  const R = S.r, ch = 12;
  for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
    const wx = wx0 + xx, wy = wy0 + yy, r = Math.floor(wy / ch), bw = 20 + (hash(r, 3) % 4) * 4, off = hash(r, 11) % bw, cc = Math.floor((wx + off) / bw), bx = (wx + off) - cc * bw, by = wy - r * ch;
    let k = 2 + (hash(cc, r) % 3) - 1; if (hash(cc, r + 9) % 6 === 0) k = 1; if (deep) k = Math.max(0, k - 1);
    let col = R[Math.max(0, Math.min(4, k))];
    if (by === ch - 1 || bx === bw - 1) col = S.joint; else if (by === 0 || bx === 0) col = R[Math.min(4, k + 1)]; else if (by === ch - 2 || bx === bw - 2) col = R[Math.max(0, k - 1)];
    else if (hash(wx, wy) % 15 === 0) col = R[Math.max(0, k - 1)]; else if (hash(wx + 7, wy) % 21 === 0) col = R[Math.min(4, k + 1)];
    px(g, xx, yy, col);
  }
  /* a hairline crack in some blocks */
  if (hash(wx0 >> 4, wy0 >> 4) % 5 === 0) { let cx = 3 + hash(wx0, wy0) % 10; for (let yy = 1; yy < 15; yy += 1) { if ((wy0 + yy) % 12 === 11) continue; px(g, cx, yy, S.joint); if (hash(yy, wx0) % 3 === 0) cx += hash(yy, 5) % 2 ? 1 : -1; cx = Math.max(1, Math.min(14, cx)); } }
}
function massTile(sk, x, y, o) {
  const S = SEC[sk];
  const key = ['m', sk, x % 5, y % 4, o.up ? 'U' : '', o.aL ? 'L' : '', o.aR ? 'R' : '', o.aD ? 'D' : '', o.deep ? 'X' : '', o.frieze ? 'F' + (x & 7) : ''].join('');
  return once(key, () => {
    const [c, g] = canvas(16, 16), wx0 = x * 16, wy0 = y * 16;
    ashlar(g, S, wx0, wy0, o.deep);
    if (o.frieze && !o.deep) {   /* THE GLYPH BAND: a recessed strip, glyphs cut into it, a gold line (the false tomb) or green (the pits, the antechamber) */
      rect(g, 0, 3, 16, 9, S.r[0]); rect(g, 0, 3, 16, 1, S.joint); rect(g, 0, 11, 16, 1, S.r[3]);
      const gx = (x * 16) % 24; void gx; const n0 = (hash(x >> 1, 4) + (x & 1)) & 7;
      glyph(g, 5 + 0, 4, n0 + (x & 1) * 3, S.joint, null);
      if (S.inlay) { rect(g, 0, 2, 16, 1, S.inlay); if (hash(x, y) % 3 === 0) px(g, 7, 2, '#fff0b0'); }
    }
    if (o.up) {   /* THE FLOOR'S LIP: worn flags, the middle of each paler where feet fell, grit in the joint */
      for (let xx = 0; xx < 16; xx++) { px(g, xx, 0, S.r[4]); px(g, xx, 1, hash(wx0 + xx, 1) % 4 ? S.r[3] : S.r[4]); px(g, xx, 2, S.r[2]); px(g, xx, 3, S.r[1]); if (hash(wx0 + xx, wy0) % 5 === 0) px(g, xx, 4, S.joint); }
      const jx = ((wx0 >> 4) & 1) ? 6 : 13; for (let yy = 0; yy < 5; yy++) px(g, jx, yy, S.joint);
      if (sk === 'face') for (let k = 0; k < 6; k++) { const sx = hash(wx0, k + 11) % 16; px(g, sx, 0, '#f4e0a8'); if (k < 3) px(g, sx, 1, '#e8cc88'); }   /* (blown sand) */
      else for (let k = 0; k < 3; k++) px(g, hash(wx0, k + 11) % 16, 0, '#d8c8a0');   /* (dust) */
    }
    if (o.aL) for (let yy = 0; yy < 16; yy++) { px(g, 0, yy, S.joint); px(g, 1, yy, S.r[0]); }
    if (o.aR) for (let yy = 0; yy < 16; yy++) { px(g, 15, yy, S.r[4]); px(g, 14, yy, S.r[3]); }
    if (o.aD) {   /* THE CEILING'S CAVETTO: a dark overhang cut in steps, a thin pale bead at its lip */
      for (let xx = 0; xx < 16; xx++) { px(g, xx, 15, '#0a0806'); px(g, xx, 14, S.joint); px(g, xx, 13, S.r[0]); px(g, xx, 12, S.r[1]); if (hash(wx0 + xx, 2) % 6 === 0) px(g, xx, 11, S.r[0]); }
      for (let xx = 2; xx < 16; xx += 4) px(g, xx, 13, S.r[2]);
    }
    if (o.deep) for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) if ((xx + yy) % 2 === 0 && hash(wx0 + xx, wy0 + yy) % 4 === 0) px(g, xx, yy, S.joint);
    return c;
  });
}

/* ---- footings ---- */
function slabTile(sk, kind, i, n, x) {
  const S = SEC[sk];
  return once(['sl', sk, kind, i === 0 ? 'L' : i === n - 1 ? 'R' : 'M', x & 3].join(''), () => {
    const [c, g] = canvas(16, 16), wx0 = x * 16;
    const col = [S.r[4], S.r[3], S.r[3], S.r[2], S.r[1], S.joint];
    if (kind === 'cornice') {   /* a broken cavetto: a concave throat under a pale lip, a gilt bead */
      rect(g, 0, 0, 16, 1, S.r[4]); rect(g, 0, 1, 16, 1, S.r[3]);
      for (let xx = 0; xx < 16; xx++) { const t = (xx + 8) / 16; void t; px(g, xx, 2, S.r[2]); px(g, xx, 3, S.r[1]); px(g, xx, 4, S.r[0]); px(g, xx, 5, S.joint); if (hash(wx0 + xx, 9) % 4 === 0) px(g, xx, 3, S.r[2]); }
      for (let xx = 0; xx < 16; xx++) if ((wx0 + xx) % 4 === 0) { px(g, xx, 4, S.r[1]); px(g, xx, 3, S.r[0]); }   /* (the reeding) */
      if (S.inlay) rect(g, 0, 1, 16, 1, S.inlay); else rect(g, 0, 1, 16, 1, '#d8b45c');
      if (i === 0) { g.clearRect(0, 0, 2, 3); px(g, 2, 2, S.joint); } if (i === n - 1) { g.clearRect(14, 0, 2, 2); g.clearRect(15, 2, 1, 3); }
    } else if (kind === 'walk') {   /* the robbers' walk: a stone beam banded in bronze where it crosses a post */
      for (let yy = 0; yy < 6; yy++) for (let xx = 0; xx < 16; xx++) px(g, xx, yy, col[yy]);
      for (let xx = 0; xx < 16; xx++) { if (hash(wx0 + xx, 6) % 7 === 0) px(g, xx, 2, S.r[2]); }
      if ((x & 3) === 1) { rect(g, 5, 0, 4, 7, '#7a5a1c'); rect(g, 5, 0, 1, 7, '#e0b858'); rect(g, 8, 0, 1, 7, '#3a2a0c'); px(g, 6, 2, '#f8e08a'); px(g, 7, 4, '#3a2a0c'); }
      for (let xx = 0; xx < 16; xx += 4) px(g, xx, 6, S.joint);
      if (i === 0) { rect(g, 0, 0, 1, 6, S.joint); } if (i === n - 1) { rect(g, 15, 0, 1, 6, S.joint); }
    } else {   /* shelf / ledge: a dressed slab, chamfered, worn pale on top; a dentil row under it */
      for (let yy = 0; yy < 6; yy++) for (let xx = 0; xx < 16; xx++) px(g, xx, yy, col[yy]);
      for (let xx = 0; xx < 16; xx++) { if ((wx0 + xx) % 16 === 15) for (let yy = 1; yy < 5; yy++) px(g, xx, yy, S.joint); if (hash(wx0 + xx, 4) % 5 === 0) px(g, xx, 1, S.r[4]); }
      for (let xx = 1; xx < 16; xx += 4) { rect(g, xx, 6, 2, 2, S.r[1]); px(g, xx, 6, S.r[3]); px(g, xx, 7, S.joint); px(g, xx + 1, 7, S.joint); }
      if (i === 0) { g.clearRect(0, 0, 1, 2); px(g, 0, 2, S.joint); } if (i === n - 1) { g.clearRect(15, 0, 1, 2); px(g, 15, 2, S.joint); }
    }
    return c;
  });
}
/* the scarab pits' floor: black stone, bone teeth, a green carapace glint */
function pitTile(x) {
  return once('pit' + (x & 3), () => {
    const [c, g] = canvas(16, 16), wx0 = x * 16;
    rect(g, 0, 0, 16, 16, '#0a0e0a');
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) { const h = hash(wx0 + xx, yy + 77) % 23; if (h === 0) px(g, xx, yy, '#1e3a2c'); else if (h === 1) px(g, xx, yy, '#14201a'); }
    /* two broad bone-grey fangs of stone and a small one between: a wide root, a hard point */
    for (const [sx, hh, ww] of [[4, 11, 5], [12, 9, 5], [8, 5, 3]]) { const top = 13 - hh; for (let k = 0; k < hh; k++) { const w = Math.max(1, Math.round(ww * (k + 1) / hh)); rect(g, sx - (w >> 1), top + k, w, 1, k < hh * 0.35 ? '#fffbe8' : k < hh * 0.7 ? '#c8bea0' : '#8a806a'); rect(g, sx + (w >> 1), top + k, 1, 1, '#4a4234'); } px(g, sx - 1, top + 3, '#ffffff'); }
    for (let k = 0; k < 3; k++) { const bx = hash(wx0, k + 5) % 13; rect(g, bx, 13, 3, 2, '#2e6a48'); px(g, bx + 1, 13, '#7ad08a'); px(g, bx, 15, '#06100a'); }
    return c;
  });
}

export function spTile(t, x, y, at, T, L) {
  const I = info(L), sk = secOf(x), S = SEC[sk], lit = lightAt(I, x, y, S.base), pl = I.plat.get(y * L.W + x);
  if (t === T.SPIKE) return tint(pitTile(x), lit);
  if (t === T.ONEWAY) { const kind = pl ? pl.kind : 'shelf'; return tint(slabTile(sk, kind === 'ledge' ? 'ledge' : kind, pl ? pl.i : 0, pl ? pl.n : 1, x), lit); }
  if (t !== T.SOLID) return null;
  const open = v => v === T.AIR || v === T.ONEWAY || v === T.SPIKE || v === T.SOFT;
  const up = at(x, y - 1), dn = at(x, y + 1), lf = at(x - 1, y), rt = at(x + 1, y);
  const o = { up: up !== T.SOLID, aL: open(lf), aR: open(rt), aD: open(dn) };
  /* is any air within 2 cells? then this is a lit wall face, else it is the mass's heart (dark, rough) */
  let near = o.up || o.aL || o.aR || o.aD; if (!near) for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-1, -1], [1, -1], [-1, 1], [1, 1]]) if (open(at(x + dx, y + dy))) { near = true; break; }
  const deep = !near;
  /* the glyph band: a recessed strip on lit wall faces in the tomb's rooms, every 4th row */
  return tint(massTile(sk, x, y, { up: o.up, aL: o.aL, aR: o.aR, aD: o.aD, deep, frieze: sk !== 'face' && !deep && (o.aL || o.aR) && (y % 4) === 1 }), lit);
}
export const SP_TILES = { spTile, SEC, secOf };
