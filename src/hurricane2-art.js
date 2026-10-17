// src/hurricane2-art.js - THE HURRICANE DECK 2's ART PASS (claude/hurricane2art; the ART LIST of work/claude/lane-done/hurricane2.md, items 1-9).
// DRAWING ONLY: no tile, entity, number or timing is touched (src/level.js is unchanged, so the level hash is unchanged). Everything is keyed to where the level
// put it (the tile columns of theHurricane() in src/level.js) and runs only on the Hurricane (ctx.on()). THE RULE FOR EVERY TIMBER ABOARD: it is rigging. Masts
// are round and hooped, yards are tarred spars with seizings, lifts and a footrope, hatch covers are lashed gratings, a lone line is a stay or a lift - NOTHING
// IS A LOG, A PLANK ON THE AIR, OR A PLAIN LADDER.
//   tile(t, x, y)       the tile pass: the shrouds and lifts (T.NET), the yards (T.ONEWAY), the mizzen top, the poop break's and the galley's deckhouse walls, the bar's sand
//   drawBack(g, cx, cy, time)    behind the bodies: masts, yards' footropes + sails + lifts, stays, the swing derricks, the breaches (frames, planking, weed), the houses' roofs,
//                       the dark powder store's seams
//   hatch / swing / felled / breakCrack / cargo / loosegun / cargoWall   the movers, props and set pieces the level asks for
//   capRead(...)        the Captain's WARD shell and the LINE HE WANTS
import { canvas, px } from './px.js';

const R = Math.round, TS = 16;
const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const hash = (a, b = 0, c = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453; return v - Math.floor(v); };
/* tarred spar wood: lit on top, bleached by salt, dark under; rope; iron; canvas */
const SP = ['#b6a47e', '#8e7d5c', '#6a5a42', '#4a3d2c', '#2c2318'], SALT = '#ece6d2', TAR = '#1a1510';
const ROPE = ['#e0cc9c', '#b59a62', '#8a7040', '#4a3a20'], IRON = ['#5a5a66', '#3a3a44', '#22222a'], CAN = ['#d8d0b8', '#b8ae98', '#8a8068', '#5e5642'];
/* where the level put things (tile columns/rows) */
const YARDS = [   /* [x0, x1, row, kind] every walkable spar */
  [117, 133, 10, 'fore'], [242, 296, 12, 'main'], [434, 440, 12, 'cross'], [486, 503, 7, 'top'], [576, 592, 9, 'gaff']];
const TOPS = [[448, 451, 9]];   /* the mizzen's fighting top */
const POOP = [452, 474, 15, 19], GALLEY = [173, 196, 17, 19];
const BREACHES = [[138, 170, 20], [252, 290, 20], [386, 410, 24], [475, 500, 20]];   /* [x0, x1, near]: the air cut through her side, deck to bar */
const SEA_Y = 28 * TS;   /* the sea's surface */
const MASTS = [   /* x: the boundary between the shroud pair (the pole's centre), top/base in px; `fell`: the index in L.felled that takes it down */
  { id: 'fore', x: 125 * TS, top: 4 * TS + 6, base: 20 * TS, w: 11, fell: 0, truck: true },
  { id: 'main', x: 241 * TS, top: 3 * TS + 10, base: 20 * TS, w: 12, truck: false },
  { id: 'cross', x: 449 * TS, top: 6 * TS, base: 20 * TS, w: 11, truck: true },
  { id: 'mizzen', x: 485 * TS, top: 2 * TS + 6, base: 42 * TS, w: 11, truck: true, sunk: true },
  { id: 'spanker', x: 585 * TS, top: 5 * TS, base: 16 * TS, w: 11, truck: true }];

export function makeHurricane2Art(ctx) {
  const A = {}; const cache = new Map();
  const on = () => ctx.on();
  const bake = (key, w, h, fn) => { let c = cache.get(key); if (!c) { const [cv, g] = canvas(w, h); fn(g, cv); c = cv; cache.set(key, c); } return c; };

  /* ============ ROPE PRIMITIVES (on a given context, in its own pixel space) ============ */
  /* a rope line between two points with a sag, laid up in three strands (a light, a mid and a dark twist along it); w its thickness (1 or 2) */
  const line = (g, x0, y0, x1, y1, sag = 0, w = 1, col = ROPE) => {
    const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let i = 0; i <= n; i++) { const u = i / n, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * sag, tw = (i >> 1) % 3;
      rc(g, x, y, 1, w, tw === 0 ? col[0] : tw === 1 ? col[1] : col[2]); if (w > 1) rc(g, x, y + w - 1, 1, 1, col[3]); } };
  const block = (g, x, y) => { rc(g, x - 2, y - 3, 5, 7, '#5a4630'); rc(g, x - 2, y - 3, 5, 1, '#8a7454'); rc(g, x - 1, y - 1, 3, 3, TAR); rc(g, x, y, 1, 1, '#c9a44c'); };   /* a tackle block */
  const knot = (g, x, y) => { rc(g, x - 1, y - 1, 3, 3, ROPE[2]); rc(g, x - 1, y - 1, 2, 1, ROPE[0]); rc(g, x, y + 1, 2, 1, ROPE[3]); };

  /* ============ THE TILE PASS ============ */
  /* a shroud pair, one half of it: the shroud line on the outer edge, tarred ratlines running across to the mast (the pole is drawn over the middle).
     side 'L' = the left column of a pair (line at px 1-2), 'R' = the right (line at 12-14); top: the lanyard eye; bot: 1 frayed (over the side), 2 belayed to the rail */
  const shroud = (side, topK, bot) => bake('sh' + side + topK + bot, TS, TS, g => {
    const lx = side === 'L' ? 1 : 12;
    rc(g, lx, 0, 3, TS, ROPE[2]); rc(g, lx, 0, 1, TS, ROPE[1]); rc(g, lx + 2, 0, 1, TS, ROPE[3]);
    for (let y = 0; y < TS; y += 3) rc(g, lx + 1, y, 1, 1, ROPE[0]);   /* the laid twist */
    for (let y = 2; y < TS; y += 4) { const x0 = side === 'L' ? lx + 3 : 0, w = side === 'L' ? TS - lx - 3 : lx;   /* the ratlines: a cord with a hitch at the shroud */
      rc(g, x0, y, w, 1, y % 8 === 2 ? ROPE[0] : ROPE[1]); rc(g, x0, y + 1, w, 1, ROPE[3]); rc(g, side === 'L' ? lx + 3 : lx - 1, y - 1, 1, 3, ROPE[2]); }
    if (topK === 1) { rc(g, lx - 1, 0, 5, 3, '#3a2e22'); rc(g, lx, 0, 3, 1, '#7a6a4a'); rc(g, lx, 1, 3, 1, TAR); }   /* the lanyard turns round a deadeye at the head */
    if (bot === 1) { for (const dx of [-1, 1, 3]) rc(g, lx + dx, TS - 4 - (dx & 1), 1, 4 + (dx & 1), ROPE[2]); rc(g, lx - 1, TS - 2, 1, 2, ROPE[1]); rc(g, lx + 3, TS - 1, 1, 1, ROPE[0]); }   /* frayed: the line's end over the side, unlaid */
    if (bot === 2) { rc(g, lx - 1, TS - 5, 5, 2, '#2a2218'); rc(g, lx - 1, TS - 5, 5, 1, '#5a4a34'); rc(g, lx - 1, TS - 2, 5, 2, '#2a2218'); }   /* belayed: turns round the rail */
  });
  /* a lone line: a lift or a stay's hanging end: a laid rope with hand-knots and a block at its head */
  const lift = (topK, bot) => bake('lf' + topK + bot, TS, TS, g => {
    for (let y = 0; y < TS; y++) { const ph = ((y >> 1) % 3); rc(g, 6, y, 4, 1, ph === 0 ? ROPE[0] : ph === 1 ? ROPE[1] : ROPE[2]); rc(g, 9, y, 1, 1, ROPE[3]); rc(g, 6, y, 1, 1, ROPE[0]); }
    knot(g, 7, 5); knot(g, 8, 13);
    if (topK === 1) { rc(g, 5, 0, 6, 5, '#5a4630'); rc(g, 5, 0, 6, 1, '#8a7454'); rc(g, 7, 2, 2, 2, TAR); rc(g, 7, 4, 2, 1, '#c9a44c'); }   /* up in a block */
    if (bot === 1) { for (const dx of [-1, 0, 2, 3]) rc(g, 7 + dx, TS - 3, 1, 3, ROPE[2]); }
  });
  /* the spar tile: 9 thick, lit along the top, with an iron cap at an end and seizings between; i = place in its run, n = the run's length */
  const spar = (i, n, kind) => bake('sp' + kind + (i === 0 ? 'a' : '') + (i === n - 1 ? 'z' : '') + (i % 3), TS, TS, g => {
    for (let x = 0; x < TS; x++) { const nz = hash(x + i * 16, 3);
      rc(g, x, 0, 1, 1, SP[0]); rc(g, x, 1, 1, 1, SP[1]); rc(g, x, 2, 1, 3, SP[2]); rc(g, x, 5, 1, 2, SP[3]); rc(g, x, 7, 1, 1, SP[4]); rc(g, x, 8, 1, 1, 'rgba(10,10,14,0.35)');
      if (nz > 0.9) rc(g, x, 1, 2, 1, SALT);   /* salt dried on the grain */
      if (nz < 0.07) rc(g, x, 3, 1, 1, SP[3]); }
    if (i === 0) { rc(g, 0, 0, 3, 8, IRON[1]); rc(g, 0, 0, 1, 8, IRON[0]); rc(g, 2, 0, 1, 8, IRON[2]); rc(g, 3, 0, 1, 8, ROPE[3]); }   /* the iron cap on the yardarm */
    if (i === n - 1) { rc(g, TS - 3, 0, 3, 8, IRON[1]); rc(g, TS - 3, 0, 1, 8, IRON[0]); rc(g, TS - 1, 0, 1, 8, IRON[2]); rc(g, TS - 4, 0, 1, 8, ROPE[3]); }
    const sx = 6 + (i % 3) * 2;   /* seizings: turns of tarred cord, tied off */
    for (let k = 0; k < 3; k++) { rc(g, sx + k * 2 - 4, 0, 1, 8, k % 2 ? ROPE[3] : ROPE[1]); rc(g, sx + k * 2 - 3, 1, 1, 6, ROPE[2]); }
    if (kind === 'top') { rc(g, 0, 3, 16, 1, SP[3]); for (const x of [2, 7, 12]) rc(g, x, 0, 1, 8, ROPE[3]); }   /* her topmast: woolded with turns of cord where it cracked */
  });
  /* the mizzen's top: a grating of boards on cross-trees (i = place in its run) */
  const topT = (i, n) => bake('tp' + (i === 0 ? 'a' : '') + (i === n - 1 ? 'z' : ''), TS, TS, g => {
    rc(g, 0, 0, TS, 2, SP[0]); rc(g, 0, 2, TS, 1, SP[2]);
    for (let x = 1; x < TS; x += 4) rc(g, x, 0, 1, 3, SP[4]);   /* the gaps between the boards */
    rc(g, 0, 3, TS, 2, SP[3]); rc(g, 0, 3, TS, 1, SP[1]); for (let x = 0; x < TS; x += 5) rc(g, x + 1, 5, 2, 5, SP[3]);   /* cross-trees under the grating, with knees */
    rc(g, 0, 5, TS, 1, TAR); for (const x of [2, 12]) { rc(g, x, 0, 1, 1, IRON[0]); rc(g, x, 3, 1, 1, IRON[0]); }
    if (i === 0) { rc(g, 0, 0, 2, 5, IRON[1]); rc(g, 0, 0, 1, 5, IRON[0]); } if (i === n - 1) { rc(g, TS - 2, 0, 2, 5, IRON[1]); rc(g, TS - 1, 0, 1, 5, IRON[2]); }
  });
  /* a deckhouse wall tile: vertical tongue-and-groove boarding in tarred oak, a sill at the foot, a brass-ringed port where asked, an iron-strapped door where asked */
  const wall = (kind, k) => bake('wl' + kind + k, TS, TS, g => {
    for (let x = 0; x < TS; x++) { const b = (x >> 2) & 1, edge = (x & 3) === 3;
      rc(g, x, 0, 1, TS, edge ? '#2a2218' : b ? SP[2] : '#76664a'); if (!edge && (x & 3) === 0) rc(g, x, 0, 1, TS, b ? '#7c6a4e' : '#8e7d5c'); }
    for (let y = 0; y < TS; y++) if (hash(y * 3, k, 5) > 0.82) rc(g, 1 + ((y * 5 + k) % 12), y, 3, 1, SP[3]);   /* the grain */
    if (kind === 'port') { rc(g, 2, 2, 12, 12, '#8a6a2a'); rc(g, 3, 3, 10, 10, '#c9a44c'); rc(g, 4, 4, 8, 8, '#14212a'); rc(g, 5, 5, 6, 6, '#243845'); rc(g, 6, 5, 2, 2, '#6a8aa0'); rc(g, 3, 3, 10, 1, '#f0d890'); for (const [x, y] of [[3, 3], [12, 3], [3, 12], [12, 12]]) rc(g, x, y, 1, 1, '#5a4a1a'); }
    if (kind === 'door') { rc(g, 0, 0, TS, TS, '#4a3a28'); for (let x = 2; x < TS; x += 4) rc(g, x, 0, 1, TS, '#2a2218'); rc(g, 0, 3, TS, 2, IRON[1]); rc(g, 0, 3, TS, 1, IRON[0]); rc(g, 0, 11, TS, 2, IRON[1]); rc(g, 0, 11, TS, 1, IRON[0]); rc(g, 11, 7, 3, 3, '#c9a44c'); rc(g, 12, 8, 1, 1, '#5a4a1a'); }
    if (kind === 'sill') { rc(g, 0, 11, TS, 5, '#2a2218'); rc(g, 0, 11, TS, 1, SP[1]); rc(g, 0, 12, TS, 1, SP[3]); }   /* the sill, where she meets the deck */
    rc(g, 0, 0, TS, 1, 'rgba(0,0,0,0.25)');
  });
  /* a deckhouse roof: caulked boarding laid fore and aft, a raised coaming at the lip, and the wet shine */
  const roof = (i, n, k) => bake('rf' + (i === 0 ? 'a' : '') + (i === n - 1 ? 'z' : '') + (k % 4), TS, TS, g => {
    rc(g, 0, 0, TS, 3, '#a89870'); rc(g, 0, 3, TS, 1, '#7a6a4a'); rc(g, 0, 4, TS, 4, '#6a5a42'); rc(g, 0, 8, TS, 8, '#4a3d2c');
    rc(g, 0, 1, TS, 1, '#c9b890'); for (let x = (k % 4) * 3; x < TS; x += 13) rc(g, x, 0, 1, 4, '#2a2218');   /* the butt joints, staggered */
    rc(g, 0, 4, TS, 1, '#2a2218'); rc(g, 0, 8, TS, 1, '#2a2218'); rc(g, 0, 11, TS, 2, '#34291d'); rc(g, 0, 11, TS, 1, SP[1]);
    if (i === 0) { rc(g, 0, 0, 2, TS, '#34291d'); rc(g, 0, 0, 1, 3, SP[0]); } if (i === n - 1) { rc(g, TS - 2, 0, 2, TS, '#34291d'); rc(g, TS - 1, 0, 1, 3, SP[1]); }
  });
  /* the bar: wet sand, ripples and shell grit on its face, packed dark below */
  const sand = (x, y) => bake('sd' + y + (x & 3), TS, TS, g => {
    const topRow = y === 42;
    for (let yy = 0; yy < TS; yy++) for (let xx = 0; xx < TS; xx++) { const nz = hash(xx + (x & 3) * 16, yy, y), d = (topRow ? yy : TS + yy) + nz * 3;
      g.fillStyle = d < 3 ? '#cdb987' : d < 8 ? '#b6a370' : d < 16 ? '#8e7f56' : d < 24 ? '#6e6246' : '#4e4636'; g.fillRect(xx, yy, 1, 1); }
    if (topRow) { for (let xx = 0; xx < TS; xx++) { const r = Math.round(Math.sin((xx + (x & 3) * 16) * 0.6) * 1); rc(g, xx, 3 + r, 1, 1, '#9a8860'); rc(g, xx, 4 + r, 1, 1, '#d8c898'); }   /* the ripples the swell leaves */
      for (let k = 0; k < 2; k++) { const sx = 1 + ((hash(x, k, 9) * 13) | 0); rc(g, sx, 1, 2, 1, '#f0e8d0'); rc(g, sx, 2, 1, 1, '#c8b890'); } }   /* a shell or two */
  });

  /* the cells at her stove-in sides: [side, inner column?, where the net starts] */
  const breachCell = (x, y) => { if (y < 20 || y > 41) return null; for (const [x0, x1, near] of BREACHES) { if (x === x0 - 1) return ['L', true, near]; if (x === x0 - 2) return ['L', false, near]; if (x === x1 + 1) return ['R', true, near]; if (x === x1 + 2) return ['R', false, near]; } return null; };

  /* what the tile pass asks: a sprite for this cell, or null (the stock tile stands) */
  A.tile = (t, x, y, tileAt, T) => {
    if (t === T.NET) {
      const n = (dx, dy) => tileAt(x + dx, y + dy) === T.NET, l = n(-1, 0), r = n(1, 0), up = !n(0, -1), dn = !n(0, 1);
      const bt = dn ? (tileAt(x, y + 1) === T.RAIL || tileAt(x, y + 1) === T.SOLID ? 2 : 1) : 0;
      { const bc = breachCell(x, y); if (bc && y >= bc[2] && y <= 33) return bake('bn' + bc[0] + (bc[1] ? 1 : 0) + (y % 4) + (y >= 28 ? 1 : 0) + up + bt + (r ? 'L' : 'R'), TS, TS, g => { g.drawImage(hullBack(bc[0], y, bc[1]), 0, 0); g.drawImage(shroud(r ? 'L' : 'R', up ? 1 : 0, bt), 0, 0); }); }   /* the net slung over her broken side: ropes over stove-in planking */
      if (!l && !r) return lift(up ? 1 : 0, dn ? 1 : 0);
      return shroud(r ? 'L' : 'R', up ? 1 : 0, bt);
    }
    if (t === T.ONEWAY) {
      for (const [x0, x1, row, kind] of YARDS) if (y === row && x >= x0 && x <= x1) return spar(x - x0, x1 - x0 + 1, kind);
      for (const [x0, x1, row] of TOPS) if (y === row && x >= x0 && x <= x1) return topT(x - x0, x1 - x0 + 1);
      return null;
    }
    if (t === T.SOLID) {
      if (y >= 42) return sand(x, y);
      { const bc = breachCell(x, y); if (bc && bc[1] && y >= 21) return hullBack(bc[0], y, true); }   /* her planking, stove in: strake-ends, end grain, the teal below the waterline */
      { const [x0, x1, y0, y1] = POOP; if (x >= x0 && x <= x1 && y >= y0 && y <= y1) {
          if (y === y0) return roof(x - x0, x1 - x0 + 1, x);
          const w = x - x0; return y === y1 ? wall('sill', x & 1) : (y === 17 && (w === 3 || w === 8 || w === 14 || w === 19)) ? wall('port', x & 1) : (w === 11 && y >= 17) ? wall('door', 0) : wall('plain', (x * 7 + y) & 3); } }
      { const [x0, x1, y0, y1] = GALLEY; if (x >= x0 && x <= x1 && y >= y0 && y <= y1) {
          if (y === y0) return roof(x - x0, x1 - x0 + 1, x);
          return y === y1 ? wall('sill', x & 1) : (y === 18 && x === 195 ? wall('port', 0) : wall('plain', (x * 7 + y) & 3)); } }
    }
    return null;
  };

  /* ============ THE MASTS: round poles, hooped, with crosstrees and a cap; the mizzen stands on the bar ============ */
  const underwater = (g, w, h, seaLine, seed) => {   /* below the sea's surface: the sea's own teal over it, weed and barnacles on it */
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(22,62,78,0.18)'; g.fillRect(0, seaLine, w, h - seaLine);   /* (the water pass tints everything under the surface again: a light touch here) */
    for (let y = seaLine; y < h; y += 3) { g.fillStyle = 'rgba(40,84,96,' + (0.03 + 0.05 * ((y - seaLine) / Math.max(1, h - seaLine))).toFixed(2) + ')'; g.fillRect(0, y, w, 1); }
    g.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 40; i++) { const x = hash(i, seed, 2) * w, y = seaLine + hash(i, seed, 3) * (h - seaLine); rc(g, x, y, 1, 1, i % 3 ? '#8aa8a0' : '#b8ccc0'); }   /* barnacles */
  };
  const pole = m => bake('mast' + m.id, m.w + 26, (m.base - m.top) + 22, (g, cv) => {
    const H = m.base - m.top, mid = cv.width >> 1, y0 = 12, wAt = y => m.w - 3 + Math.round(3 * (y / H));
    for (let y = 0; y < H; y++) { const w = wAt(y), x0 = mid - (w >> 1);
      for (let x = 0; x < w; x++) { const u = x / w; let c = u < 0.1 ? SP[4] : u < 0.3 ? SP[0] : u < 0.52 ? SP[1] : u < 0.76 ? SP[2] : u < 0.9 ? SP[3] : SP[4];
        if (u > 0.1 && u < 0.9 && hash(x + 3, y >> 2, m.x) > 0.94) c = SP[3]; if (u > 0.1 && u < 0.5 && hash(x, y, m.x + 4) > 0.985) c = SALT;   /* the grain, and salt in it */
        rc(g, x0 + x, y0 + y, 1, 1, c); } }
    for (let y = 22; y < H - 14; y += 28) { const w = wAt(y) + 2, x0 = mid - (w >> 1);   /* hoops: iron bands, a rope woolding between */
      rc(g, x0, y0 + y, w, 2, IRON[1]); rc(g, x0, y0 + y, w, 1, IRON[0]); rc(g, x0, y0 + y + 2, w, 1, 'rgba(0,0,0,0.35)'); rc(g, x0 + w - 1, y0 + y, 1, 2, IRON[2]);
      for (let t = 0; t < 4; t++) rc(g, x0 + 1, y0 + y + 6 + t * 2, w - 2, 1, t % 2 ? ROPE[2] : ROPE[1]); }
    rc(g, mid - 14, y0 + 7, 28, 3, SP[2]); rc(g, mid - 14, y0 + 7, 28, 1, SP[0]); rc(g, mid - 14, y0 + 9, 28, 1, SP[4]);   /* the crosstrees */
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) rc(g, mid + s * (5 + i) - (s < 0 ? 1 : 0), y0 + 10 + i, 1, 1, SP[3]);   /* their knees */
    rc(g, mid - 14, y0 + 6, 2, 3, IRON[1]); rc(g, mid + 12, y0 + 6, 2, 3, IRON[1]);
    rc(g, mid - 5, y0 - 1, 10, 5, IRON[1]); rc(g, mid - 5, y0 - 1, 10, 1, IRON[0]); rc(g, mid - 5, y0 + 3, 10, 1, IRON[2]);   /* the iron cap */
    if (m.truck) { rc(g, mid - 2, y0 - 5, 4, 4, SP[1]); rc(g, mid - 1, y0 - 6, 2, 1, SP[0]); rc(g, mid - 1, y0 - 4, 1, 1, SALT); }   /* the truck at the head */
    { const w = wAt(H - 1) + 6, x0 = mid - (w >> 1); rc(g, x0, y0 + H - 10, w, 3, IRON[1]); rc(g, x0, y0 + H - 10, w, 1, IRON[0]);   /* the partners, where she steps through the deck */
      for (let i = 0; i < 4; i++) { rc(g, x0 - 2 + i * (w / 3), y0 + H - 7, 2, 7, SP[2]); } }
    if (m.sunk) { const sea = SEA_Y - (m.top - 12); underwater(g, cv.width, cv.height, sea, 7);
      for (let i = 0; i < 7; i++) { const sx = mid - 4 + hash(i, 5) * 8, sy = cv.height - 6 - hash(i, 6) * 120; rc(g, sx, sy, 1, 5, '#3f6e4a'); rc(g, sx + 1, sy - 3, 1, 4, '#2c4e38'); } }   /* weed on the foot of her */
  });
  const masts = (g, cx, cy, vw, felled) => {
    for (const m of MASTS) {
      if (m.x < cx - 40 || m.x > cx + vw + 40) continue;
      if (m.fell !== undefined && felled(m.fell)) continue;   /* the sky has had it down: only the stump stands */
      const s = pole(m); g.drawImage(s, R(m.x - (s.width >> 1) - cx), R(m.top - 12 - cy));
    }
  };

  /* ============ THE YARDS: footrope on stirrups, a sail clewed up under the spar in torn folds ============ */
  const rigOf = (kind, n) => bake('rig' + kind, n * TS + 8, 34, (g, cv) => {
    const W = n * TS; const sail = kind === 'fore' || kind === 'main' || kind === 'cross';
    if (sail) { const x0 = 16, x1 = W - 14;
      for (let x = x0; x < x1; x++) { const u = (x - x0) / (x1 - x0), d = 8 + Math.round(4 * (0.5 + 0.5 * Math.sin(x * 0.33 + hash(x >> 4, 2) * 6)) + 3 * Math.sin(u * Math.PI)), fold = ((x >> 3) + (hash(x >> 3, 7) > 0.5 ? 1 : 0)) % 3;
        for (let y = 9; y < 9 + d; y++) { const k = (y - 9) / d; rc(g, x, y, 1, 1, fold === 0 ? (k < 0.3 ? CAN[0] : CAN[1]) : fold === 1 ? (k < 0.3 ? CAN[1] : CAN[2]) : (k < 0.3 ? CAN[2] : CAN[3])); }
        if (hash(x, 4, 9) > 0.93) for (let t = 0; t < 3 + (hash(x, 5) * 5 | 0); t++) rc(g, x, 9 + d + t, 1, 1, CAN[3]);   /* tatters hanging off the foot of her */ }
      for (let x = x0 + 14; x < x1 - 8; x += 26) { line(g, x, 9, x + 7, 9 + 11, 0, 1, ROPE); line(g, x + 7, 9, x, 9 + 11, 0, 1, ROPE); knot(g, x + 3, 9); }   /* gaskets, wrapped over the bundle */
      for (let i = 0; i < 5; i++) { const gx = x0 + 6 + hash(i, kind.length, 3) * (x1 - x0 - 12); rc(g, gx, 12 + (hash(i, 8) * 6 | 0), 4, 1, CAN[3]); }   /* a patch, a tear */
    }
    for (let x = 6; x < W - 4; x += 38) { rc(g, x, 9, 1, 15, ROPE[2]); rc(g, x - 1, 22, 3, 2, ROPE[1]); }   /* stirrups */
    for (let x = 6; x < W - 4; x++) { const seg = (x - 6) % 38, sag = Math.round(Math.sin(seg / 38 * Math.PI) * 2); rc(g, x, 24 + sag, 1, 2, ((x >> 1) % 3) ? ROPE[1] : ROPE[2]); rc(g, x, 24 + sag, 1, 1, ((x >> 1) % 3) ? ROPE[0] : ROPE[1]); }   /* the footrope */
  });
  /* a top yard above the main yard (not walkable: the main yard's lifts hang from it) */
  const topYard = n => bake('topyard' + n, n * TS, 12, g => { for (let i = 0; i < n; i++) g.drawImage(spar(i, n, 'yard'), i * TS, 0); for (let x = 20; x < n * TS - 30; x += 52) { rc(g, x, 8, 1, 4, ROPE[2]); } });
  /* a boom or gaff: a tapered round spar */
  const boom = (len, th) => bake('boom' + len + '_' + th, len, th + 2, g => {
    for (let x = 0; x < len; x++) { const k = x / len, t = Math.max(3, Math.round(th - (th - 3) * k));
      rc(g, x, 0, 1, 1, SP[0]); rc(g, x, 1, 1, Math.max(1, t - 3), SP[1]); rc(g, x, t - 2, 1, 2, SP[3]); rc(g, x, t, 1, 1, SP[4]); if (hash(x, 3) > 0.93) rc(g, x, 1, 1, 1, SALT); }
    for (let x = 6; x < len - 4; x += 22) { rc(g, x, 0, 1, th, ROPE[3]); rc(g, x + 1, 0, 1, th, ROPE[1]); rc(g, x + 2, 0, 1, th, ROPE[2]); }
    rc(g, 0, 0, 2, th + 1, IRON[1]); rc(g, 0, 0, 1, th + 1, IRON[0]);
  });
  /* clip a rope to the screen and draw it (a stay can be a thousand pixels long) */
  const ln = (g, cx, cy, vw, ax, ay, bx, by, sag = 0, w = 1, col = ROPE) => {
    const dx = bx - ax; let u0 = 0, u1 = 1;
    if (Math.abs(dx) > 0.5) { const a = (cx - 6 - ax) / dx, b = (cx + vw + 6 - ax) / dx; u0 = Math.max(0, Math.min(a, b)); u1 = Math.min(1, Math.max(a, b)); if (u0 >= u1) return; }
    else if (ax < cx - 6 || ax > cx + vw + 6) return;
    const L = Math.hypot(dx, by - ay), n = Math.max(2, Math.ceil(L * (u1 - u0)));
    for (let i = 0; i <= n; i++) { const u = u0 + (u1 - u0) * i / n, x = ax + dx * u, y = ay + (by - ay) * u + Math.sin(u * Math.PI) * sag, tw = ((i + (u0 * L | 0)) >> 1) % 3;
      rc(g, x - cx, y - cy, 1, w, tw === 0 ? col[0] : tw === 1 ? col[1] : col[2]); if (w > 1) rc(g, x - cx, y - cy + w - 1, 1, 1, col[3]); }
  };

  /* every stay and lift: [x0, y0, x1, y1, sag, w] in world px */
  const STAYS = [
    [1882, 162, 2000, 76, 3, 1], [2134, 162, 2000, 76, 3, 1], [2000, 72, 1744, 314, 2, 1], [2000, 72, 2190, 314, 2, 1],   /* the fore yard's two lifts, the forestay and the backstay */
    [4700, 66, 3856, 50, 5, 1], [3856, 60, 4768, 190, 6, 2], [3856, 60, 3560, 314, 2, 1],   /* the main top yard's topping lift, the main stay to the yard's end, the main forestay */
    [4072, 72, 4072, 80, 0, 1], [4296, 72, 4296, 80, 0, 1], [4520, 72, 4520, 80, 0, 1],   /* the lifts' strops up to the top yard */
    [7184, 118, 6944, 190, 4, 1], [7184, 118, 7360, 316, 2, 1],   /* the crossjack mast's stay down to its yard's shroud, and its backstay */
    [7760, 44, 7860, 112, 2, 1], [7760, 44, 8000, 112, 3, 1],   /* the mizzen's topmast, held up by its backstays */
    [9360, 82, 9072, 158, 2, 1], [9360, 82, 9648, 158, 2, 1], [9360, 82, 9488, 144, 2, 1]];   /* the spanker's stays to the arena's lines, and the gaff's topping lift */

  /* ============ THE HATCH COVERS: a lashed grating slung on a hawser, riding up and down ============ */
  const coverSpr = n => bake('hatch' + n, n * TS, 14, g => {
    const W = n * TS;
    rc(g, 0, 3, W, 8, SP[3]); rc(g, 0, 3, W, 1, SP[2]); rc(g, 0, 10, W, 1, TAR);   /* the coaming it sits in */
    for (let x = 2; x < W - 2; x += 6) { rc(g, x, 0, 5, 3, SP[0]); rc(g, x, 0, 5, 1, '#d4c49a'); rc(g, x + 5, 0, 1, 4, TAR); if (hash(x, n) > 0.8) rc(g, x + 1, 1, 2, 1, SALT); }   /* the grating's slats, gapped */
    rc(g, 2, 3, W - 4, 2, SP[2]); rc(g, 2, 3, W - 4, 1, SP[1]);                       /* the cross-batten under it */
    for (const bx of [0, W - 7]) { rc(g, bx, 0, 7, 11, IRON[1]); rc(g, bx, 0, 7, 1, IRON[0]); rc(g, bx, 10, 7, 1, IRON[2]); rc(g, bx + 2, 3, 1, 1, IRON[0]); rc(g, bx + 4, 6, 1, 1, IRON[0]); }   /* iron-bound ends */
    for (const lx of [W * 0.3, W * 0.7]) { const x = R(lx); for (let t = 0; t < 3; t++) { rc(g, x + t * 2, 0, 1, 11, t % 2 ? ROPE[3] : ROPE[1]); rc(g, x + t * 2 + 1, 0, 1, 11, ROPE[2]); } }   /* the lashing turns over it */
    rc(g, W / 2 - 2, 0, 4, 3, IRON[1]); rc(g, W / 2 - 1, 0, 2, 1, IRON[0]);   /* the ring-bolt the bridle shackles to */
  });
  /* (the movers loop) one cover. The mover is the walking surface: m.x/m.y is its top-left, m.w its length */
  A.hatch = (g, m, cx, cy, time) => {
    const n = Math.max(2, Math.round(m.w / TS)), x = R(m.x - cx), y = R(m.y - cy), s = coverSpr(n);
    /* the sling: two bridle legs up from the ends to a shackle, and one hawser from the shackle out of sight, up to the yard/gantry that is working her */
    const bx = x + m.w / 2, by = y - 16;
    line(g, x + 4, y + 1, bx, by, 0, 1, ROPE); line(g, x + m.w - 4, y + 1, bx, by, 0, 1, ROPE);
    for (let yy = by - 200; yy < by; yy++) { const ph = (yy >> 1) % 3; rc(g, bx - 1, yy - 0, 3, 1, ph === 0 ? ROPE[0] : ph === 1 ? ROPE[1] : ROPE[2]); rc(g, bx + 1, yy, 1, 1, ROPE[3]); }
    rc(g, bx - 2, by - 2, 5, 5, IRON[1]); rc(g, bx - 2, by - 2, 5, 1, IRON[0]); rc(g, bx - 1, by - 1, 3, 3, '#14141a');   /* the shackle */
    g.drawImage(s, x, y);
    /* wet: rain runs off the slats, and what she ships comes off her edges as she comes up */
    const dy = m.dy || 0, up = dy < -0.12;
    if (up || Math.abs(dy) > 0.04) for (let i = 0; i < 6; i++) { const dx = ((i * 37 + R(time * 40)) % (m.w - 4)) + 2; rc(g, x + dx, y + 11 + ((i * 5 + R(time * 30)) % 9), 1, 3 + (i & 1), 'rgba(190,225,235,0.55)'); }
    if (up) for (let i = 0; i < 3; i++) rc(g, x + 6 + ((i * 23 + R(time * 17)) % (m.w - 12)), y - 2 - (R(time * 25 + i * 4) % 5), 1, 1, '#dff0f5');
  };

  /* ============ THE ROPE SWINGS: a boom or gaff overhead, the rope, and a slung grating seat ============ */
  const seatSpr = bake('seat', 36, 12, g => {
    rc(g, 0, 3, 36, 6, SP[3]); rc(g, 0, 3, 36, 1, SP[1]); rc(g, 0, 8, 36, 1, TAR);
    for (let x = 2; x < 34; x += 5) { rc(g, x, 2, 4, 1, SP[0]); rc(g, x + 4, 2, 1, 2, TAR); }   /* slats */
    for (const bx of [0, 31]) { rc(g, bx, 1, 5, 9, IRON[1]); rc(g, bx, 1, 5, 1, IRON[0]); rc(g, bx + 2, 4, 1, 1, IRON[0]); }   /* iron-bound ends */
  });
  A.swing = (g, m, cx, cy, time) => {
    const px0 = R(m.px - cx), py0 = R(m.py - cy), x = R(m.x - cx), y = R(m.y - cy), mx = x + (m.w >> 1);
    const hy = y - 12;
    line(g, px0, py0 + 2, mx, hy, 0, 2, ROPE);   /* the fall: a laid rope from its block */
    line(g, mx, hy, x + 3, y + 2, 0, 1, ROPE); line(g, mx, hy, x + m.w - 3, y + 2, 0, 1, ROPE);   /* the bridle to the seat's ends */
    for (let k = 1; k < 4; k++) knot(g, px0 + (mx - px0) * k / 4, py0 + 2 + (hy - py0 - 2) * k / 4);   /* hand-knots to hold */
    g.drawImage(seatSpr, x - 2, y - 2);
    block(g, px0, py0 + 2);
  };
  /* the overhead each swing hangs from (drawn with the rest of the rigging) */
  const derrick = (g, cx, cy) => {   /* off the forecastle head: a stepped derrick and its boom */
    const x = 902, top = 112, base = 256; if (x < cx - 60 || x > cx + 400) return;
    for (let y = top; y < base; y++) { const w = 5; rc(g, x - 2 - cx, y - cy, w, 1, SP[2]); rc(g, x - 2 - cx, y - cy, 1, 1, SP[0]); rc(g, x - 2 - cx, y - cy, 2, 1, SP[1]); rc(g, x + 2 - cx, y - cy, 1, 1, SP[4]); }
    for (let y = top + 14; y < base - 6; y += 22) { rc(g, x - 3 - cx, y - cy, 7, 2, IRON[1]); rc(g, x - 3 - cx, y - cy, 7, 1, IRON[0]); }
    g.drawImage(boom(40, 6), x - 4 - cx, 119 - cy);
    ln(g, cx, cy, 400, x, top + 2, 940, 123, 1, 1); ln(g, cx, cy, 400, x, top + 2, 846, 252, 2, 1);
    rc(g, x - 3 - cx, top - 4 - cy, 7, 5, IRON[1]); rc(g, x - 3 - cx, top - 4 - cy, 7, 1, IRON[0]); block(g, x - cx, top - 7 - cy);
  };

  /* ============ THE BREACHES: her side stove in to the sea, down to the bar ============ */
  /* a broken frame standing on the sand: a rib of oak, curved, its top split; submerged in the teal */
  const ribSpr = (v, h) => bake('rib' + v + '_' + h, 14, h + 6, (g, cv) => {
    for (let y = 0; y < h; y++) { const k = y / h, w = 6 - Math.round(k * 2), off = Math.round(Math.sin(k * 1.6 + v) * 3 * (v % 2 ? 1 : -1)), x0 = 4 + off;
      for (let x = 0; x < w; x++) { const u = x / w; rc(g, x0 + x, cv.height - 1 - y, 1, 1, u < 0.2 ? SP[2] : u < 0.55 ? SP[1] : u < 0.8 ? SP[2] : SP[3]); }
      if (y % 17 === 3) { rc(g, x0 - 1, cv.height - 1 - y, w + 2, 1, IRON[1]); } }
    for (let i = 0; i < 5; i++) { const t = h - i * 2; rc(g, 4 + Math.round(Math.sin(1.6 + v) * 3 * (v % 2 ? 1 : -1)) + (i & 1) * 3, cv.height - 1 - h - 2 + i % 3, 2, 3 + (i % 2), SP[0]); }   /* the split top: splinters */
    rc(g, 4, cv.height - 3, 8, 3, '#8e7f56');   /* sand banked at its foot */
    underwater(g, cv.width, cv.height, Math.max(0, SEA_Y - (42 * TS - cv.height)), v + 11);
  });
  const keelSpr = bake('keel', 150, 16, (g, cv) => {
    for (let x = 0; x < 150; x++) { const k = x / 150, t = 11 - Math.round(k * 3); for (let y = 0; y < t; y++) rc(g, x, 15 - y, 1, 1, y < 2 ? SP[3] : y < t - 3 ? SP[2] : SP[1]); if (hash(x, 3) > 0.9) rc(g, x, 15 - t + 2, 1, 1, SP[4]); }
    for (let x = 8; x < 144; x += 21) rc(g, x, 5, 3, 11, SP[4]);   /* futtocks' stubs */
    underwater(g, 150, 16, 0, 3);
  });
  const moundSpr = w => bake('mound' + w, w, 12, g => { for (let x = 0; x < w; x++) { const k = x / (w - 1), h = Math.round(10 * Math.sin(k * Math.PI) ** 0.8); for (let y = 0; y < h; y++) rc(g, x, 11 - y, 1, 1, y > h - 3 ? '#d8c898' : y > h - 6 ? '#b6a370' : '#8e7f56'); } });
  const breaches = (g, cx, cy, vw, time) => {
    for (const [x0, x1] of BREACHES) {
      const a = x0 * TS, b = (x1 + 1) * TS; if (b < cx - 50 || a > cx + vw + 50) continue;
      const bar = 42 * TS, span = b - a;
      /* the bar's drifts and what the sea has laid on it */
      for (const f of [0.1, 0.38, 0.66, 0.88]) { const w = 40 + R(hash(x0, f * 9) * 22), mx = a + span * f - w / 2; g.drawImage(moundSpr(w), R(mx - cx), R(bar - 11 - cy)); }
      g.drawImage(keelSpr, R(a + span * 0.3 - cx), R(bar - 16 - cy));
      /* her frames: broken ribs standing up out of the sand, some taller than the sea */
      [[0.18, 150], [0.46, 250], [0.74, 190], [0.9, 120]].forEach(([f, h], i) => { const s = ribSpr(i + x0 % 3, h + ((x0 * 7 + i * 13) % 5) * 12); g.drawImage(s, R(a + span * f - cx), R(bar - s.height - cy));
        const topY = bar - s.height + 4, sx = a + span * f + 6, sway = Math.sin(time * 1.3 + i + x0) * 2;   /* weed streaming off the broken top */
        if (topY > SEA_Y - 40) for (let k = 0; k < 3; k++) { const wy = topY - k * 7; rc(g, R(sx + sway * (k + 1) * 0.5 - cx + (k - 1) * 2), R(wy - cy), 2, 7, k % 2 ? '#3f6e4a' : '#2c4e38'); } });
      /* a few planks adrift on the swell where she opens to the sea */
      for (let i = 0; i < 4; i++) { const f = (0.15 + i * 0.22 + 0.04 * Math.sin(time * 0.4 + i)) , fx = a + span * f, fy = SEA_Y + 2 + Math.sin(time * 1.6 + i * 2 + x0) * 2, w = 14 + (i * 5 % 9);
        rc(g, fx - cx, fy - 3 - cy, w, 3, SP[2]); rc(g, fx - cx, fy - 3 - cy, w, 1, SP[0]); rc(g, fx - cx + w, fy - 3 - cy, 2, 2, SP[3]); }
    }
  };
  /* her stove-in planking, as the tile pass sees it: a hull cell, the gap to its right (side 'L') or left ('R'); ragged: the inner edge cut into strake-ends, the end grain pale */
  const hullBack = (side, y, ragged) => bake('hb' + side + (ragged ? 'r' : 'f') + (y % 4) + (y >= 28 ? 'w' : 'a'), TS, TS, g => {
    for (let r = 0; r < TS; r++) { const strake = (r / 5) | 0, cut = ragged ? 1 + ((hash(strake, y % 4, side === 'L' ? 1 : 2) * 8) | 0) : 0, w = TS - cut;
      for (let x = 0; x < TS; x++) { const ex = side === 'L' ? x : TS - 1 - x; if (ex >= w) continue;
        const pl = r % 5, c = pl === 0 ? SP[4] : pl === 1 ? SP[1] : pl < 4 ? SP[2] : SP[3];
        rc(g, x, r, 1, 1, ragged && ex >= w - 2 ? SP[0] : (hash(x, r, y) > 0.9 ? SP[4] : c)); } }
    for (let r = 4; r < TS; r += 5) rc(g, 0, r, TS, 1, 'rgba(10,8,6,0.45)');   /* the seams of the planking */
    for (let x = 3; x < TS; x += 7) rc(g, x, 0, 1, 1, IRON[0]);   /* a trenail head, here and there */
    if (y >= 28) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(22,62,78,0.2)'; g.fillRect(0, 0, TS, TS); g.globalCompositeOperation = 'source-over'; for (let i = 0; i < 4; i++) rc(g, hash(i, y, 6) * 14, hash(i, y, 8) * 14, 1, 1, '#9ab8b0'); }   /* her side below the waterline: the teal, barnacles */
  });

  /* ============ THE DECKHOUSES' FURNITURE, and the dark powder store's seams ============ */
  const smoke = (g, x, y, t, n = 4) => { for (let i = 0; i < n; i++) { const k = (t * 0.45 + i / n) % 1; g.globalAlpha = 0.5 * (1 - k); rc(g, x + Math.sin(k * 6 + i * 2) * 4 + k * 10, y - k * 34, 3 - R(k * 2), 3 - R(k * 2), '#9aa098'); } g.globalAlpha = 1; };
  const roofKit = (g, cx, cy, vw, time) => {
    /* the galley's stove-pipe, a skylight over her, a lantern-box; smoke flattened by the gale */
    if (GALLEY[1] * TS > cx - 60 && GALLEY[0] * TS < cx + vw + 60) {
      const ry = GALLEY[2] * TS - cy;
      { const x = 181 * TS - cx; rc(g, x - 1, ry - 30, 10, 31, IRON[2]); rc(g, x, ry - 30, 3, 31, IRON[1]); rc(g, x + 1, ry - 30, 1, 31, IRON[0]); rc(g, x - 3, ry - 33, 14, 4, IRON[1]); rc(g, x - 3, ry - 33, 14, 1, IRON[0]); rc(g, x - 2, ry - 9, 12, 3, IRON[1]);   /* the stove-pipe, a cowl on it, a collar through the roof */
        smoke(g, x + 5, ry - 34, time); }
      { const x = 176 * TS - cx; rc(g, x, ry - 9, 54, 9, '#34291d'); rc(g, x, ry - 9, 54, 1, SP[1]); rc(g, x + 4, ry - 7, 46, 6, '#16222a'); for (const sx of [14, 28, 42]) rc(g, x + sx, ry - 7, 2, 6, '#34291d'); rc(g, x + 6, ry - 6, 8, 1, '#4a6a7a'); rc(g, x + 20, ry - 5, 5, 1, '#4a6a7a');   /* the skylight: panes in a coaming, a glint in the glass */
        for (let i = 0; i < 6; i++) rc(g, x + 4 + ((i * 17 + R(time * 20)) % 46), ry - 7, 1, 1, 'rgba(210,235,245,0.6)'); }
    }
    /* the poop break: a companion hatch, two ventilator cowls and a binnacle's hood */
    if (POOP[1] * TS > cx - 60 && POOP[0] * TS < cx + vw + 60) {
      const ry = POOP[2] * TS - cy;
      { const x = 455 * TS - cx; rc(g, x, ry - 14, 40, 14, '#3a2e22'); rc(g, x, ry - 14, 40, 2, SP[1]); rc(g, x + 2, ry - 12, 36, 10, '#2c2318'); for (let k = 0; k < 6; k++) rc(g, x + 4 + k * 6, ry - 11, 4, 8, k % 2 ? '#4a3a28' : '#5a4630'); rc(g, x + 17, ry - 16, 6, 3, IRON[1]); rc(g, x + 18, ry - 16, 4, 1, IRON[0]); }   /* the companion: slatted doors, an iron hasp */
      for (const vx of [467, 472]) { const x = vx * TS - cx; rc(g, x, ry - 18, 6, 18, IRON[1]); rc(g, x, ry - 18, 2, 18, IRON[0]); rc(g, x + 5, ry - 18, 1, 18, IRON[2]); for (let i = 0; i < 6; i++) rc(g, x - 2 - i, ry - 24 + i, 8 + i, 1, i % 2 ? IRON[1] : IRON[0]); rc(g, x - 8, ry - 18, 10, 2, IRON[2]); rc(g, x - 8, ry - 17, 3, 1, '#14141a'); }   /* a cowl: a bell mouth turned from the wind */
    }
  };
  /* THE DARK POWDER STORE: the deck's seams over it, and the sky coming down them when it goes off */
  const storeSeams = (g, cx, cy, vw, time, glow) => {
    const x0 = 440 * TS, x1 = 475 * TS; if (x1 < cx - 20 || x0 > cx + vw + 20) return;
    const y = 21 * TS - cy;
    for (let sx = x0 + 10; sx < x1 - 8; sx += 22 + (((sx >> 4) * 7) % 9)) { const x = sx - cx, len = 8 + (((sx >> 3) * 5) % 8);
      rc(g, x, y - 5, 2, 5 + (len >> 3), glow > 0 ? '#eaf4ff' : '#1a2228');   /* the gap between two planks of her deck */
      if (glow > 0) { g.globalAlpha = Math.min(0.4, 0.1 + glow * 0.3); g.fillStyle = '#dfe8ff'; g.beginPath(); g.moveTo(x - 0.5, y); g.lineTo(x + 2.5, y); g.lineTo(x + 7 + len * 0.9, y + 70 + len); g.lineTo(x - 5 - len * 0.9, y + 70 + len); g.closePath(); g.fill(); g.globalAlpha = 1; } }
    for (let sx = x0 + 22; sx < x1 - 12; sx += 66) { const x = sx - cx; rc(g, x, y - 1, 1, 14 + ((sx >> 4) % 6), '#2a2218'); for (let k = 0; k < 3; k++) rc(g, x - 1, y + 13 + ((sx >> 4) % 6) + k * 3, 3, 2, IRON[1]); }   /* a hanging-knee's chain, never lit */
  };

  /* ============ CARGO: crates and casks lashed on her deck, the wall across her waist, the aft gun on its breechings ============ */
  const crateSpr = bake('crate', 14, 14, g => {
    rc(g, 0, 0, 14, 14, '#2a2218'); rc(g, 1, 1, 12, 12, '#7a5a34'); rc(g, 1, 1, 12, 2, '#a07a4a'); for (let y = 4; y < 13; y += 4) rc(g, 1, y, 12, 1, '#4a3a22');
    rc(g, 1, 1, 12, 1, '#c09a64'); line(g, 1, 12, 12, 2, 0, 1, ROPE); line(g, 1, 2, 12, 12, 0, 1, ROPE); rc(g, 5, 5, 4, 4, IRON[1]); rc(g, 6, 6, 2, 2, IRON[0]);   /* a lashing crossed over it, a ring-bolt at the crossing */
    rc(g, 3, 5, 1, 1, '#d8d0b8'); rc(g, 4, 6, 1, 1, '#d8d0b8'); rc(g, 3, 7, 1, 1, '#d8d0b8');   /* a stencilled mark */
  });
  const caskSpr = bake('cask', 14, 16, g => {
    for (let y = 0; y < 16; y++) { const k = (y - 7.5) / 8, w = Math.round(14 * Math.sqrt(1 - k * k * 0.34)), x0 = (14 - w) >> 1;
      for (let x = 0; x < w; x++) { const u = x / w; rc(g, x0 + x, y, 1, 1, u < 0.15 ? SP[4] : u < 0.4 ? '#7a5a34' : u < 0.7 ? '#5e4426' : '#3a2a16'); if (x % 3 === 2) rc(g, x0 + x, y, 1, 1, '#2a1c0e'); } }
    for (const hy of [2, 6, 9, 13]) { rc(g, 1, hy, 12, 1, IRON[1]); rc(g, 1, hy, 12, 1, hy % 2 ? IRON[1] : IRON[0]); }   /* the iron hoops */
    rc(g, 5, 0, 4, 1, '#2a2218'); rc(g, 5, 15, 4, 1, '#2a2218'); rc(g, 6, 7, 2, 2, '#14100a');   /* the heads, a bung */
  });
  A.cargo = (g, pr, cx, cy, heel, time) => {
    const x = R(pr.x - cx), y = R(pr.y - cy);
    if (pr.kind === 'crate') g.drawImage(crateSpr, x - 7, y - 14); else { g.save(); g.translate(x, y - 8); g.rotate(pr.rot || 0); g.drawImage(caskSpr, -7, -8); g.restore(); }
    if (heel && R(time * 8) % 2) { rc(g, x + (ctx.heelDir() || 0) * 8, y - 10, 2, 2, '#ffd36b'); }   /* it is going */
  };
  const wallSpr = bake('cargowall', 32, 64, g => {
    const tiers = [[0, 'cask', 'crate'], [1, 'crate', 'cask'], [2, 'cask', 'cask'], [3, 'crate', 'crate']];
    for (const [t, a, b] of tiers) { const y = 64 - (t + 1) * 16; [a, b].forEach((k, i) => { const x = i * 16; if (k === 'crate') { rc(g, x, y, 16, 16, '#2a2218'); rc(g, x + 1, y + 1, 14, 14, t % 2 ? '#7a5a34' : '#8a6a3e'); rc(g, x + 1, y + 1, 14, 2, '#b08a54'); for (let yy = 5; yy < 15; yy += 4) rc(g, x + 1, y + yy, 14, 1, '#4a3a22'); rc(g, x + 6, y + 6, 4, 4, IRON[1]); rc(g, x + 7, y + 7, 2, 2, IRON[0]); rc(g, x + 3, y + 5, 1, 1, '#d8d0b8'); rc(g, x + 4, y + 6, 1, 1, '#d8d0b8'); }
        else { g.drawImage(caskSpr, x + 1, y); rc(g, x, y + 14, 16, 2, '#2a2218'); } }); }
    rc(g, 0, 0, 32, 2, '#34291d');   /* the top tier's dunnage */
    for (let i = -64; i < 64; i += 16) { line(g, i, 0, i + 64, 64, 0, 1, [ROPE[1], ROPE[2], ROPE[2], ROPE[3]]); line(g, i + 64, 0, i, 64, 0, 1, [ROPE[1], ROPE[2], ROPE[2], ROPE[3]]); }   /* the cargo net lashed over the whole stack */
    for (const yy of [12, 36, 56]) { rc(g, 0, yy, 32, 2, ROPE[2]); rc(g, 0, yy, 32, 1, ROPE[0]); }   /* three hawsers passed round it */
    for (const [x, y] of [[0, 8], [29, 8], [0, 32], [29, 32], [0, 54], [29, 54]]) { rc(g, x, y, 3, 4, IRON[1]); rc(g, x, y, 3, 1, IRON[0]); rc(g, x + 1, y + 1, 1, 2, '#14141a'); }   /* ring-bolts */
  });
  const wreckSpr = bake('cargowreck', 64, 16, g => {
    for (let i = 0; i < 9; i++) { const x = 4 + ((i * 11) % 52), w = 6 + ((i * 7) % 9), y = 12 - (i % 3) * 2; rc(g, x, y, w, 2, i % 2 ? '#7a5a34' : '#5e4426'); rc(g, x, y, w, 1, '#a07a4a'); rc(g, x + w, y - 1, 1, 3, '#d8c898'); }   /* splintered staves and planks */
    for (let i = 0; i < 3; i++) { rc(g, 10 + i * 20, 8 + (i % 2) * 3, 8, 6, '#3a2a16'); rc(g, 10 + i * 20, 8 + (i % 2) * 3, 8, 1, IRON[1]); rc(g, 12 + i * 20, 10 + (i % 2) * 3, 4, 2, '#14100a'); }   /* a stove cask */
    line(g, 2, 14, 30, 11, 1, 1, ROPE); line(g, 30, 11, 60, 14, 1, 1, ROPE); for (let x = 6; x < 58; x += 12) rc(g, x, 12, 1, 3, ROPE[2]);   /* the net, torn, lying over it */
  });
  A.cargoWall = (g, pr, cx, cy, time) => { const [x0, x1, y0, y1] = pr.span; g.drawImage(wallSpr, R(x0 * TS - cx), R(y0 * TS - cy)); };
  A.cargoWreck = (g, pr, cx, cy) => { const [x0, x1, , y1] = pr.span; g.drawImage(wreckSpr, R(x0 * TS - cx - 8), R((y1 + 1) * TS - 14 - cy)); };
  const gunSpr = lashed => bake('gun' + lashed, 56, 32, g => {
    /* the carriage: two cheeks of tarred oak stepped to the trunnions, a quoin under the breech, four trucks */
    for (let x = 6; x < 46; x++) { const k = (x - 6) / 40, top = 15 + Math.round(6 * (1 - Math.min(1, k * 1.2))); rc(g, x, top, 1, 24 - top, SP[3]); rc(g, x, top, 1, 1, SP[1]); rc(g, x, 22, 1, 2, SP[4]); }
    rc(g, 6, 15, 40, 1, '#5a4630'); rc(g, 8, 16, 1, 7, IRON[1]); rc(g, 40, 16, 1, 7, IRON[1]); rc(g, 20, 17, 1, 1, IRON[0]); rc(g, 30, 17, 1, 1, IRON[0]);
    rc(g, 6, 20, 14, 3, SP[2]); rc(g, 6, 20, 14, 1, SP[1]);   /* the quoin */
    for (const wx of [12, 38]) { rc(g, wx - 5, 23, 10, 8, SP[4]); rc(g, wx - 4, 24, 8, 6, SP[2]); rc(g, wx - 4, 24, 8, 1, SP[0]); rc(g, wx - 1, 26, 2, 2, IRON[1]); }   /* the trucks (spokes drawn live) */
    /* the piece: a long iron barrel, reinforcing rings, a swelled muzzle, a touch-hole, a cascabel */
    for (let x = 4; x < 52; x++) { const k = x / 52, r = 5 - Math.round(k * 1.4); rc(g, x, 12 - r, 1, r * 2, IRON[1]); rc(g, x, 12 - r, 1, 2, IRON[0]); rc(g, x, 12 + r - 2, 1, 2, IRON[2]); }
    for (const rx of [10, 26, 44]) { rc(g, rx, 5, 2, 15, IRON[1]); rc(g, rx, 5, 1, 15, IRON[0]); }
    rc(g, 48, 6, 6, 12, IRON[1]); rc(g, 48, 6, 6, 1, IRON[0]); rc(g, 52, 9, 2, 6, '#08080c');   /* the swelled muzzle, its bore */
    rc(g, 14, 5, 2, 1, '#08080c'); rc(g, 1, 9, 4, 6, IRON[1]); rc(g, 0, 10, 2, 4, IRON[0]);   /* the touch-hole, the cascabel */
    if (lashed) { line(g, 2, 14, 2, 30, 0, 2, ROPE); rc(g, 0, 29, 5, 3, IRON[1]); rc(g, 1, 30, 3, 1, '#14141a'); line(g, 52, 18, 55, 30, 0, 2, ROPE); rc(g, 52, 29, 4, 3, IRON[1]); }   /* breechings and a tackle to her ring-bolts */
  });
  A.loosegun = (g, pr, cx, cy, time, text) => {
    const lashed = pr.lashed, jig = pr.strain > 0 && lashed ? R(Math.sin(time * 50) * 1.5) : 0, s = gunSpr(lashed), gy = lashed ? ctx.floorAt(pr.x, pr.y) : pr.y, x = R(pr.x - 26 - cx) + jig, y = R(gy - 31 - cy);   /* (while it is lashed it is drawn on her deck: the prop itself waits a row up until it parts) */
    g.drawImage(s, x, y);
    /* the trucks' spokes turn with her */
    if (!lashed) for (const wx of [12, 38]) { const a = (pr.rot || 0) * 3, cxw = x + wx, cyw = y + 27; for (let k = 0; k < 2; k++) { const ax = Math.cos(a + k * Math.PI / 2) * 3, ay = Math.sin(a + k * Math.PI / 2) * 3; rc(g, cxw + ax, cyw + ay, 1, 1, SP[0]); rc(g, cxw - ax, cyw - ay, 1, 1, SP[0]); } }
    if (!lashed) { for (const q of [0, 1]) { line(g, x + 2, y + 13 + q, x - 12 - (q * 4), y + 28 + (q ? 2 : 0), 3 + q, 1, ROPE); } rc(g, x - 14, y + 27, 2, 2, ROPE[2]); }   /* the breeching parted: its end trailing frayed behind her */
    if (!lashed && Math.abs(pr.vx) > 40 && R(time * 10) % 2) text('!!', x + 28, y - 6, '#ff6b6b', 'center', 6);
    if (lashed && pr.strain > 0 && R(time * 14) % 2) rc(g, x + 2 + ((time * 40) % 3), y + 20, 1, 1, '#e8dcc0');   /* a strand parts */
  };

  /* ============ THE FELLED FOREMAST: a hooped pole from the stump to the galley roof, the yard still lashed at the head, shrouds trailing ============ */
  const fellPole = len => bake('fell' + len, len + 80, 60, (g, cv) => {
    const x0 = 14, top = 20;
    for (let x = 0; x < len; x++) { const k = x / len, t = 13 - Math.round(k * 4);
      for (let y = 0; y < t; y++) { const u = y / t; rc(g, x0 + x, top + y, 1, 1, u < 0.12 ? SP[0] : u < 0.35 ? SP[1] : u < 0.65 ? SP[2] : u < 0.88 ? SP[3] : SP[4]); }
      if (hash(x, 2) > 0.95) rc(g, x0 + x, top + 1, 2, 1, SALT); }
    for (let x = 26; x < len - 18; x += 34) { const t = 13 - Math.round(x / len * 4) + 2; rc(g, x0 + x, top - 1, 3, t, IRON[1]); rc(g, x0 + x, top - 1, 1, t, IRON[0]); rc(g, x0 + x + 2, top - 1, 1, t, IRON[2]);   /* hoops */
      for (let q = 0; q < 3; q++) rc(g, x0 + x + 5 + q * 2, top, 1, t - 2, q % 2 ? ROPE[3] : ROPE[1]); }
    for (let i = 0; i < 9; i++) { const sx = i * 2, sh = 4 + ((i * 5) % 9); rc(g, x0 - 6 + sx * 0.5, top + 2 + (i * 3) % 8, 6, 2, SP[0]); rc(g, x0 - 8 + (i % 3), top + 1 + i, 4, 1, i % 2 ? SP[0] : SALT); }   /* the break: splintered grain at her foot */
    const hx = x0 + len;   /* the head: a cap, the trestle-trees, and the fore yard's broken length still lashed across */
    rc(g, hx - 6, top - 4, 12, 4, IRON[1]); rc(g, hx - 6, top - 4, 12, 1, IRON[0]);
    rc(g, hx + 2, top - 18, 5, 40, SP[2]); rc(g, hx + 2, top - 18, 2, 40, SP[0]); rc(g, hx + 6, top - 18, 1, 40, SP[4]); for (const yy of [-12, 6, 20]) { rc(g, hx + 1, top + yy, 7, 3, ROPE[1]); rc(g, hx + 1, top + yy, 7, 1, ROPE[0]); }   /* the yard, cracked */
    rc(g, hx + 1, top - 22, 3, 4, SP[0]); rc(g, hx + 5, top - 20, 2, 3, SP[1]); rc(g, hx + 2, top + 21, 4, 3, SP[0]);   /* its splintered ends */
    for (const [fx, fy, w] of [[0.3, 8, 40], [0.55, 10, 52], [0.78, 9, 34]]) line(g, x0 + len * fx, top + 12, x0 + len * fx + w, top + 12 + fy + 18, 6, 1, ROPE);   /* shrouds that parted at her deck, trailing slack */
    const sx = x0 + len * 0.62; for (let x = 0; x < 26; x++) { const d = 12 + Math.round(Math.sin(x * 0.5) * 3) + (x > 18 ? x - 18 : 0); for (let y = 0; y < d; y++) rc(g, sx + x, top + 12 + y, 1, 1, y < 3 ? CAN[0] : y < 8 ? CAN[1] : CAN[2]); }   /* a torn length of canvas draped over her */
  });
  A.felled = (g, F, xa, ya, xb, yb, cx, cy, time) => {
    const ang = Math.atan2(yb - ya, xb - xa), len = Math.round(Math.hypot(xb - xa, yb - ya) + 30);
    g.save(); g.translate(R(xa - cx), R(ya - cy)); g.rotate(ang); g.drawImage(fellPole(len), -14, -20); g.restore();
    /* the stump she stands on: split, with the shrouds' dead ends hanging from it */
    const sx = R((F.x + 1) * TS - cx), sy = R(20 * TS - cy);
    g.drawImage(stumpSpr, sx - 15, sy - 32);
  };
  const stumpSpr = bake('stump', 30, 34, g => {
    for (let y = 0; y < 26; y++) { const jag = y < 6 ? ((hash(y, 3) * 5) | 0) : 0; for (let x = 0; x < 12; x++) { const u = x / 12; if (y < 6 && ((x + y * 3) % 7) < jag) continue; rc(g, 9 + x, 8 + y, 1, 1, u < 0.15 ? SP[4] : u < 0.4 ? SP[1] : u < 0.7 ? SP[2] : u < 0.9 ? SP[3] : SP[4]); } }
    for (const [x, y, w, h] of [[9, 4, 3, 6], [13, 2, 3, 8], [17, 5, 3, 5]]) { rc(g, x, y, w, h, SP[0]); rc(g, x, y, 1, h, SALT); }   /* the split grain */
    rc(g, 8, 18, 14, 2, IRON[1]); rc(g, 8, 18, 14, 1, IRON[0]); rc(g, 8, 28, 14, 2, IRON[1]); rc(g, 8, 28, 14, 1, IRON[0]);
    for (const [x, d] of [[5, 6], [8, 9], [22, 7], [24, 10]]) { for (let y = 0; y < d; y++) rc(g, x, 12 + y, 1, 1, y % 3 === 0 ? ROPE[0] : ROPE[1]); rc(g, x - 1, 12 + d, 3, 2, '#3a2e22'); }   /* the shrouds' dead ends hanging off their deadeyes */
  });
  /* THE TOPMAST BREAKS, span by span: the crack runs across the spar, splinters lift, the lashings part - a told warning (it was a flashing bar) */
  A.breakCrack = (g, z, cx, cy, time) => {
    if (z.down || z.t < 0) return;
    const k = 1 - Math.max(0, z.t) / (z.fuse || 0.8), x0 = z.x0 * TS - cx, w = (z.x1 - z.x0 + 1) * TS, y = z.row * TS - cy;
    const flash = R(time * 12) % 2;
    rc(g, x0, y - 1, w, 1, flash ? '#fff1b0' : '#ffb23c');   /* the grain lights along the whole span */
    for (const f of [0.3, 0.66]) { const cxk = x0 + w * f; let px0 = cxk;   /* the cracks, zig-zag through her thickness, longer as it goes */
      for (let yy = 0; yy < 9; yy++) { if (yy / 9 > k + 0.15) break; const jx = (yy % 2 ? 1 : -1) * (1 + ((yy * 3 + R(f * 9)) % 2)); px0 += jx; rc(g, px0, y + yy, 1, 1, '#0a0806'); rc(g, px0 + 1, y + yy, 1, 1, flash ? '#fff1b0' : '#ffb23c'); } }
    for (let i = 0; i < 3 + R(k * 6); i++) { const sx = x0 + 6 + ((i * 29 + R(time * 40)) % (w - 12)); rc(g, sx, y - 3 - (R(time * 30 + i * 5) % 6), 1, 2, SP[0]); }   /* splinters off it */
    for (let i = 0; i < 2; i++) { const sx = x0 + 4 + ((i * 41) % (w - 8)); rc(g, sx, y + 9, 1, 2 + R(k * 5), ROPE[1]); }   /* a lashing parting */
  };

  /* ============ THE CAPTAIN'S READ: his WARD (a faceted pale shell) and the LINE HE WANTS (the line lit, the way to it marked) ============ */
  A.ward = (g, x, y, time) => {   /* x, y: screen centre of his body */
    const rx = 21, ry = 25, a = 0.7 + 0.25 * Math.sin(time * 8);
    g.globalAlpha = 0.17; g.fillStyle = '#cfe6f6'; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 0.09; g.beginPath(); g.ellipse(x, y, rx - 5, ry - 6, 0, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 56; i++) { if (((i + R(time * 6)) % 4) === 3) continue; const t = i / 56 * Math.PI * 2, c = i % 2 ? '#f2f8ff' : '#9ab8d0'; g.globalAlpha = a; rc(g, x + Math.cos(t) * rx, y + Math.sin(t) * ry, 1, 1, c); rc(g, x + Math.cos(t) * (rx - 1), y + Math.sin(t) * (ry - 1), 1, 1, '#bcd4e8'); }   /* a double rim, in dashes that turn */
    g.globalAlpha = a * 0.85;
    for (let i = 0; i < 30; i++) { const t = i / 30 * Math.PI * 2; rc(g, x + Math.cos(t) * rx * 0.45, y + Math.sin(t) * ry, 1, 1, '#dcecf8'); rc(g, x + Math.cos(t) * rx, y + Math.sin(t) * ry * 0.45, 1, 1, '#dcecf8'); rc(g, x + Math.cos(t) * rx * 0.8, y + Math.sin(t) * ry * 0.8, 1, 1, '#b8d0e4'); }   /* the facets: a meridian, a parallel and a lattice */
    g.globalAlpha = 1;
    const gl = (R(time * 14) % 22) - 11; rc(g, x + gl, y - 14 + Math.abs(gl) * 0.7, 3, 3, '#ffffff'); rc(g, x + gl + 1, y - 15 + Math.abs(gl) * 0.7, 1, 5, '#ffffff');   /* a glint running across the shell */
  };
  A.lineWant = (g, lx, floorY, bx, time, text) => {   /* lx, floorY: the line's foot on screen; bx: the Captain's screen x */
    const a = 0.5 + 0.4 * Math.sin(time * 12), dir = Math.sign(lx - bx) || 1;
    g.globalAlpha = a * 0.35; g.fillStyle = '#a8cfc6'; g.fillRect(lx - 7, floorY - 92, 14, 92); g.globalAlpha = 1;   /* the line lit in a pale sea-green */
    for (let i = 0; i < 9; i++) rc(g, lx - 1, floorY - 90 + i * 10 + (R(time * 20) % 4), 2, 4, '#dff5ee');
    rc(g, lx - 9, floorY - 3, 18, 3, '#a8cfc6'); rc(g, lx - 9, floorY - 3, 18, 1, '#ffffff');   /* its foot, bracketed */
    for (const s of [-1, 1]) { rc(g, lx + s * 9, floorY - 11, 1, 11, '#a8cfc6'); rc(g, lx + s * 9 - (s > 0 ? 2 : 0), floorY - 11, 3, 1, '#a8cfc6'); }
    const gap = Math.abs(lx - bx); for (let d = 14; d < gap - 12; d += 14) { const x = bx + dir * (d + (R(time * 24) % 14)), vis = ((d / 14) | 0) % 2 === 0 ? 1 : 0.6; if (Math.abs(x - bx) > gap - 12) continue; g.globalAlpha = a * vis;   /* chevrons run along the deck from him to it */
      for (let k = 0; k < 4; k++) { rc(g, x - dir * k, floorY - 6 - 3 + k, 1, 1, '#a8cfc6'); rc(g, x - dir * k, floorY - 6 + 3 - k, 1, 1, '#a8cfc6'); } g.globalAlpha = 1; }
    if (text) text('HIS LINE', lx, floorY - 98, '#a8cfc6', 'center', 6);
  };
  /* knocked flat: the sea running off him and a skirt of foam on the planking round him */
  A.flatSea = (g, x, y, time) => {
    for (let i = 0; i < 9; i++) { const t = (i / 9), fx = x - 24 + t * 48, fy = y - 1 - ((R(time * 9) + i * 3) % 4); g.globalAlpha = 0.8 - Math.abs(t - 0.5); rc(g, fx, fy, 2 + (i % 3), 1, i % 2 ? '#dff5ee' : '#a8cfc6'); } g.globalAlpha = 1;
    for (let i = 0; i < 4; i++) rc(g, x - 14 + i * 9, y - 22 - ((R(time * 14) + i * 5) % 8), 1, 2, '#dff0f5');   /* the water coming off his coat */
  };

  /* ============ THE WHOLE OF IT, behind the bodies ============ */
  A.drawBack = (g, cx, cy, time) => {
    const vw = ctx.VW(), fd = ctx.felled, glow = ctx.glow();
    masts(g, cx, cy, vw, fd);
    /* the yards: a sail clewed up and a footrope under each, and the parrel where it meets its mast */
    for (const [x0, x1, row, kind] of YARDS) {
      if (x1 * TS < cx - 40 || x0 * TS > cx + vw + 40) continue;
      if (kind === 'fore' && fd(0)) continue;
      if (kind === 'fore' || kind === 'main' || kind === 'cross') g.drawImage(rigOf(kind, x1 - x0 + 1), R(x0 * TS - cx), R(row * TS - cy));
      for (const m of MASTS) if (Math.abs(m.x - (x0 * TS + 8)) < 20 && (kind === 'fore' || kind === 'main' || kind === 'gaff')) { const y = row * TS - cy; for (let q = 0; q < 4; q++) { rc(g, m.x - cx - 8, y - 1 + q * 2, 16, 1, q % 2 ? ROPE[3] : ROPE[1]); } knot(g, m.x - cx - 8, y + 3); knot(g, m.x - cx + 8, y + 3); }
    }
    if (4064 > cx - 800 && 3880 < cx + vw + 100) g.drawImage(topYard(52), R(3888 - cx), R(64 - cy));   /* the main course's lifts hang from a top yard */
    if (cx + vw > 7600 && cx < 7800) g.drawImage(boom(120, 5), R(7648 - cx), R(46 - cy));   /* the mizzen's gaff the second swing hangs from */
    derrick(g, cx, cy);
    for (let i = 0; i < STAYS.length; i++) { const s = STAYS[i]; if (i < 4 && fd(0)) continue; ln(g, cx, cy, vw, s[0], s[1], s[2], s[3], s[4], s[5]); }
    breaches(g, cx, cy, vw, time);
    roofKit(g, cx, cy, vw, time);
    storeSeams(g, cx, cy, vw, time, glow);
  };
  A.hullBack = hullBack; A.shroudTile = shroud;

  A.on = on;
  return A;
}
