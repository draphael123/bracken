// marsh3_art.js - MARSH WOOD 3's art pass (claude/marsh3art). ART ONLY: the grid is read for how a cell is DRAWN, never changed (src/marsh3.js owns the geometry).
//   REED STANDS    the solid columns of the reed run (cols 460-510) are dense BOUND REED CLUMPS standing out of the channel: cut pale ends on top, stems, cord bands,
//                  bulrush blades and cattail heads fanning behind the head, a foam collar where the current splits round the foot
//   CURRENT RAFTS  the two rafts on the current (m.current) are a ROUGHER raft: bog-oak logs lashed with reed cord, a pole lashed flat along her side, a reed-bundle
//                  prow and stern, a bow wave ahead and a wake behind while the water has her; the whole channel streaks with current
//   THE LOG BOOM   col 552 rows 18-21: round logs chained and ring-bolted, moss at the waterline; two stout piles either side with a chain to the boom's winch; open =
//                  the logs swung aside and bobbing on the water, the winch chain slack
//   THE LEVER DECK the winch deck on two piles (stilt walk 569-572), the lever a marsh WINCH (drum, cord, a pole arm) and the stilt walks over every bank + the bowman's
//                  lookout in the marsh2 deck art (marsh2_art WALKS) with their own dressing (mooring posts, lantern gallows, hide, rope rail, pennant)
//   THE NIGHT      a moon behind the dark (a hole in the dark keeps it lit), a bluer dark, its road on the water; the MARSH LIGHT is a small cold flame with a halo,
//                  motes and a line on the water (lilypad.js drawPadLight)
// Palette = the Marsh's own (bog oak, reed cord, moss) from marsh2_art. Everything static is baked once and blitted.
import { canvas, outline } from '../px.js';
import { OAK, BOARD, CORD, CORD_D, MOSS, P, R, lash, brace, thatch } from './marsh2_art.js';

const OUT = '#1b1626';
const hash = (a, b) => { let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return (h ^ (h >>> 16)) >>> 0; };
const rnd = (a, b, m) => hash(a, b) % m;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const tileOf = fn => { const [c, g] = canvas(16, 16); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const col = fn(x, y); if (col) P(g, col, x, y); } return c; };
const clamp01 = v => Math.max(0, Math.min(1, v));

/* ---- where things are (src/marsh3.js: AT_COL 444, dx from there) ---- */
const REED_STANDS = { 16: 18, 26: 17, 36: 18, 37: 18, 47: 18, 57: 18, 66: 17 };   /* dx -> top row */
const BOOM_DX = 108, BOOM_ROWS = [18, 21], DECK_DX = [125, 128], CHANNELS = [[6, 75], [86, 145]];
const SURF = 19 * 16;   /* the water's top */
const RDS = ['#1d3320', '#2f4a26', '#3f6a30', '#4a7a3a', '#5a8a4a', '#7fb24e', '#8fd160'];   /* reed: dark -> lit */
const CUT = ['#8a8440', '#b6aa5c', '#d8cc84', '#ece4ac'];                                         /* a cut stem's pale end */

/* ================= TILES ================= */
export function tile(t, x, y, at, T, L) {
  const o = L.marsh3 && L.marsh3.at; if (o === undefined) return null;
  const dx = x - o;
  if (t === T.SOLID && REED_STANDS[dx] !== undefined && y >= REED_STANDS[dx] && y <= 21) return standTile(x, y, y === REED_STANDS[dx]);
  if (t === T.PORT && dx === BOOM_DX && y >= BOOM_ROWS[0] && y <= BOOM_ROWS[1]) return boomTile(y);
  return null;
}
/* a bound reed clump: stems two wide in four greens, the odd dark gap, a ragged fringe, cord bands every 14 px, and a flat cut head with pale ends */
function standTile(x, y, head) {
  return once('stand' + x + ',' + y, () => tileOf((px, py) => {
    const u = x * 16 + px, wy = y * 16 + py;
    if (head) {
      if (py === 0) { if (px === 0 || px === 15) return null; return CUT[(rnd(u, 1, 4) + (px >> 1)) % 4 > 2 ? 3 : (px & 1) ? 2 : 1]; }                       /* the cut ends, pale */
      if (py === 1) { if (px === 0 || px === 15) return OAK[1]; return (px % 3 === 0) ? CUT[0] : RDS[5]; }
    }
    if (px === 0 || px === 15) return rnd(u, wy, 3) === 0 ? RDS[2] : (rnd(u, wy, 3) === 1 ? RDS[1] : null);                                                    /* the ragged fringe */
    if ((px === 1 && rnd(u, wy >> 1, 4) === 0) || (px === 14 && rnd(u, wy >> 1, 4) === 1)) return null;
    if (wy % 14 === 6) return px === 1 || px === 14 ? OAK[1] : CORD;                                                                                          /* a reed-cord band */
    if (wy % 14 === 7) return px === 1 || px === 14 ? OAK[1] : CORD_D;
    const sh = rnd(x * 8 + (px >> 1), wy >> 3, 5);
    if (px % 2 === 0 && sh === 0) return RDS[0];                                                                                                              /* a dark gap between stems */
    let c = [RDS[3], RDS[4], RDS[2], RDS[5], RDS[3]][sh];
    if (px % 2 === 1 && rnd(u, wy, 6) === 0) c = RDS[6];                                                                                                      /* a lit stalk */
    if (rnd(u, wy >> 2, 9) === 0 && px % 2 === 0) c = RDS[1];                                                                                                 /* a bent stem's shadow */
    return c;
  }));
}
/* a log of the boom: two round logs a tile, a chain down the middle with a ring bolt; the top tile is weathered, the one at the waterline mossed */
function boomTile(y) {
  return once('boom' + y, () => tileOf((px, py) => {
    const k = py >> 3, ly = py & 7, wet = y >= 19, endL = ((y + k) & 1) === 0;
    if (px >= 7 && px <= 8) {                                                    /* the chain: links one over one */
      if (ly === 3 || ly === 4) return (px === 7) ? '#c8ccd4' : '#6a7078';        /* the ring bolt through the log */
      return ((py + px) & 3) < 2 ? '#9aa0a8' : '#4a4f58';
    }
    if (ly === 0) return wet ? '#10201a' : OAK[0];                                /* the seam between logs */
    let c = ly === 1 ? (wet ? '#5a6a42' : OAK[4]) : ly <= 3 ? (wet ? '#3e4e30' : OAK[3]) : ly <= 6 ? (wet ? '#2c3a26' : OAK[2]) : (wet ? '#1c2a1c' : OAK[1]);
    if ((endL && px <= 2) || (!endL && px >= 13)) c = (endL ? px : 15 - px) === 0 ? '#c8b080' : ly === 3 || ly === 4 ? '#7a6648' : '#9a8660';   /* the pale cut end with its ring */
    else if (rnd(px + y * 16, py + k * 7, 7) === 0) c = wet ? '#6a8a44' : OAK[2];                                                                 /* bark flecks / moss */
    if (y === 19 && ly < 3 && rnd(px, k, 3) === 0) c = MOSS[3];                                                                                   /* weed at the waterline */
    return c;
  }));
}

/* ================= BACKGROUND DRESSING (behind the tiles) ================= */
const baked = new Map();
function blit(g, key, x0, y0, w, h, cx, cy, fn) {
  if (x0 - cx > 340 || x0 + w - cx < -20 || y0 - cy > 200 || y0 + h - cy < -20) return;
  let c = baked.get(key); if (!c) { const [cv, cg] = canvas(w, h); fn(cg, x0, y0); c = cv; baked.set(key, c); }
  g.drawImage(c, Math.round(x0 - cx), Math.round(y0 - cy));
}
/* the blades and cattails that fan out behind a stand's cut head (the hero stands on the head; they stand behind him) */
function drawBlades(g, ox, oy, col, top, seed) {
  const L0 = col * 16 - ox, T0 = top * 16 - oy;
  for (let i = 0; i < 7; i++) {
    const bx = L0 + 2 + rnd(seed, i, 12), lean = (i - 3) * 0.55 + (rnd(seed, i + 9, 5) - 2) * 0.25, len = 12 + rnd(seed, i + 3, 12), cat = i % 3 === 1, cu = lean > 0 ? 0.012 : -0.012;
    for (let t = 0; t < len; t++) {
      const x = Math.round(bx + lean * t * 0.9 + t * t * cu), y = T0 + 1 - t;
      P(g, (t & 3) === 0 ? RDS[6] : t < 4 ? RDS[3] : RDS[4], x, y); if (!cat && t > 2 && t < len - 3 && (t & 1)) P(g, RDS[2], x + (lean > 0 ? -1 : 1), y);
    }
    const ex = Math.round(bx + lean * (len - 1) * 0.9 + (len - 1) * (len - 1) * cu), ey = T0 + 1 - (len - 1);
    if (cat) { R(g, '#3a2414', ex - 1, ey - 5, 3, 6); R(g, '#7a5232', ex - 1, ey - 5, 1, 6); P(g, '#a8784a', ex, ey - 5); R(g, RDS[4], ex, ey - 8, 1, 3); }   /* a cattail head */
    else { P(g, RDS[6], ex, ey - 1); P(g, RDS[4], ex + (lean > 0 ? 1 : -1), ey - 2); }                                                                            /* a blade tip */
  }
}
/* mooring posts at the ends of a deck, a rope coil, a lantern on a gallows - the dock the rafts leave from / put in at */
function dockDressing(g, ox, oy, c0, c1, row, lantern) {
  const deck = row * 16 - oy, X = x => x - ox;
  for (const bx of [c0 * 16 + 4, c1 * 16 + 9]) { R(g, OAK[2], X(bx), deck - 11, 6, 11); R(g, OAK[4], X(bx), deck - 11, 1, 11); R(g, OAK[1], X(bx + 5), deck - 11, 1, 11); R(g, OAK[4], X(bx - 1), deck - 12, 8, 2); lash(g, X(bx), deck - 7, 6); }
  const mid = Math.floor((c0 + c1) / 2) * 16;
  R(g, CORD_D, X(mid + 4), deck - 3, 8, 3); R(g, CORD, X(mid + 5), deck - 3, 6, 1); R(g, CORD, X(mid + 4), deck - 2, 1, 1);
  if (lantern) { const gx = (c0 + 1) * 16 + 2; R(g, OAK[2], X(gx), deck - 34, 3, 34); R(g, OAK[2], X(gx), deck - 34, 17, 3); brace(g, X(gx + 1), deck - 20, X(gx + 10), deck - 32); R(g, CORD, X(gx + 15), deck - 31, 1, 5);
    R(g, '#e8c060', X(gx + 13), deck - 26, 4, 5); R(g, '#fff1a0', X(gx + 14), deck - 25, 2, 2); }
}
/* the lookout (the bowman's stilt deck): a rope rail on posts along the open side, a reed pennant, a lean-to of thatch on the back posts */
function lookoutDressing(g, ox, oy, c0, c1, row) {
  const deck = row * 16 - oy, X = x => x - ox;
  for (let c = c0; c <= c1; c += 2) { R(g, OAK[2], X(c * 16 + 6), deck - 12, 3, 12); R(g, OAK[4], X(c * 16 + 6), deck - 12, 1, 12); }
  for (let x = c0 * 16 + 7; x < c1 * 16 + 8; x++) P(g, CORD, X(x), deck - 11 + Math.round(Math.sin(((x - c0 * 16) % 32) / 32 * Math.PI) * 2));
  R(g, OAK[2], X(c0 * 16 + 1), deck - 38, 3, 38); R(g, OAK[2], X((c1 + 1) * 16 - 4), deck - 38, 3, 38);
  thatch(g, X(c0 * 16 - 3), X((c1 + 1) * 16 + 1), deck - 36, 9, false);   /* a roof well over a hero's head */
  R(g, '#5a8a4a', X((c1 + 1) * 16 - 1), deck - 46, 9, 5); R(g, '#8fd160', X((c1 + 1) * 16 - 1), deck - 46, 9, 1); R(g, '#5a8a4a', X((c1 + 1) * 16 + 2), deck - 41, 5, 2); R(g, OAK[2], X((c1 + 1) * 16 - 4), deck - 46, 3, 8);
}
/* a heron hide on a bank: a woven reed screen along the back, a peep slit, a low thatched roof */
function hideDressing(g, ox, oy, c0, c1, row) {
  const deck = row * 16 - oy, X = x => x - ox, x0 = c0 * 16 - 2, x1 = (c1 + 1) * 16 + 2;
  R(g, OAK[2], X(x0), deck - 54, 3, 54); R(g, OAK[2], X(x1 - 3), deck - 54, 3, 54); lash(g, X(x0), deck - 24, 3); lash(g, X(x1 - 3), deck - 24, 3);
  for (let x = x0 + 3; x < x1 - 3; x++) R(g, (x & 1) ? '#7a7a3a' : '#9a8a50', X(x), deck - 40, 1, 40);
  R(g, OAK[1], X(x0 + 3), deck - 24, x1 - x0 - 6, 1); R(g, OAK[1], X(x0 + 3), deck - 12, x1 - x0 - 6, 1);
  R(g, OAK[0], X(x0 + 20), deck - 34, 12, 2); R(g, '#0c0a08', X(x0 + 21), deck - 33, 10, 1);
  thatch(g, X(x0 - 6), X(x1 + 6), deck - 40, 11, false);
}
/* the lever deck (569-572, row 17): a cross-braced pair of piles under it, a barrel on the boards, a rope rail on the pool side */
function winchDeckDressing(g, ox, oy, c0, c1, row) {
  const deck = row * 16 - oy, X = x => x - ox;
  brace(g, X(c0 * 16 + 5), deck + 8, X(c1 * 16 + 10), deck + 36); brace(g, X(c1 * 16 + 10), deck + 8, X(c0 * 16 + 5), deck + 36);
  for (const bx of [c0 * 16 + 1, (c1 + 1) * 16 - 6]) { R(g, OAK[2], X(bx), deck - 14, 3, 14); R(g, OAK[4], X(bx), deck - 14, 1, 14); }
  for (let x = c0 * 16 + 2; x < (c1 + 1) * 16 - 4; x++) P(g, CORD, X(x), deck - 13 + Math.round(Math.sin((x - c0 * 16) / 64 * Math.PI) * 2));
  const bx = c0 * 16 + 12;   /* a barrel of grease for the drum */
  R(g, OAK[2], X(bx), deck - 9, 8, 9); R(g, OAK[4], X(bx), deck - 9, 1, 9); R(g, OAK[0], X(bx + 7), deck - 9, 1, 9); R(g, '#6a6a62', X(bx), deck - 7, 8, 1); R(g, '#6a6a62', X(bx), deck - 3, 8, 1); R(g, OAK[1], X(bx), deck - 10, 8, 1);
}
/* the two piles either side of the boom, iron rings on them, moss at the waterline */
function boomPosts(g, ox, oy, col) {
  const X = x => x - ox, Y = y => y - oy;
  for (const bx of [col * 16 - 7, (col + 1) * 16 + 2]) {
    R(g, OAK[2], X(bx), Y(15 * 16 + 4), 5, 6 * 16 + 4); R(g, OAK[4], X(bx), Y(15 * 16 + 4), 1, 6 * 16 + 4); R(g, OAK[0], X(bx + 4), Y(15 * 16 + 4), 1, 6 * 16 + 4);
    R(g, OAK[4], X(bx - 1), Y(15 * 16 + 3), 7, 2);
    for (const ry of [16 * 16 + 4, 18 * 16 + 2]) { lash(g, X(bx), Y(ry), 5); R(g, '#9aa0a8', X(bx + 1), Y(ry + 3), 3, 3); R(g, '#3a3f48', X(bx + 2), Y(ry + 4), 1, 1); }
    R(g, MOSS[1], X(bx - 1), Y(19 * 16 - 2), 7, 3);
  }
}
/* a chain on its sag: taut (the boom shut) or slack and dropping to the water (the boom open). Canvas row 2 = the chain's first link. */
function chainSprite(x0, y0, x1, y1, sag) {
  const w = Math.ceil(x1 - x0) + 4, [c, g] = canvas(w, 52);
  for (let x = 0; x <= x1 - x0; x++) { const f = x / (x1 - x0), y = Math.round((y1 - y0) * f + Math.sin(f * Math.PI) * sag) + 2; P(g, (x & 3) < 2 ? '#aab0b8' : '#4a4f58', x + 1, y); if ((x & 3) === 1) P(g, '#6a7078', x + 1, y + 1); }
  return c;
}
/* the moon: a pale disc with maria, a halo, baked once */
const MOON = { x: 254, y: 36 };
const moonSprite = () => once('moon', () => { const [c, g] = canvas(64, 64);
  for (let r = 30; r > 11; r--) { g.globalAlpha = 0.012 + (30 - r) * 0.0016; g.fillStyle = '#bcd8ff'; g.beginPath(); g.arc(32, 32, r, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1;
  g.fillStyle = '#e8f0ff'; g.beginPath(); g.arc(32, 32, 9, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#c4d2ee'; g.beginPath(); g.arc(35, 34, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = '#e8f0ff'; g.beginPath(); g.arc(33, 32, 6.5, 0, Math.PI * 2); g.fill();   /* the shaded limb */
  g.fillStyle = '#b4c4e4'; for (const [x, y, r] of [[30, 29, 2.6], [35, 33, 2.1], [29, 35, 1.4]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }   /* maria, as blotches - not a face */
  g.fillStyle = '#f4f8ff'; g.fillRect(34, 27, 2, 1); g.fillRect(28, 31, 1, 2); return c; });
const nightZone = L => L.darkZones && L.darkZones.find(z => z.marsh3);
export function nightK(L, cx, darkNow) { const z = nightZone(L); if (!z) return 0; const mid = cx + 160; return mid > z.x0 - 240 && mid < z.x1 + 240 ? clamp01(darkNow / (z.dark || 0.74)) : 0; }
export const darkCol = '3,11,22';
export function moonHole(L, cx, darkNow) { const k = nightK(L, cx, darkNow); return k > 0.05 ? { x: MOON.x, y: MOON.y, r: 52, a: 0.6 * k } : null; }

export function drawBack(g, L, cx, cy, time, T, darkNow) {
  const o = L.marsh3 && L.marsh3.at; if (o === undefined) return;
  if (cx + 340 < o * 16 - 16 || cx > (o + L.marsh3.n) * 16 + 16) return;
  const k = nightK(L, cx, darkNow);
  if (k > 0.04) { g.globalAlpha = k; g.drawImage(moonSprite(), Math.round(MOON.x - 32), Math.round(MOON.y - 32)); g.globalAlpha = 1; }
  for (const dx in REED_STANDS) { const col = o + (+dx), top = REED_STANDS[dx]; blit(g, 'bl' + col, col * 16 - 14, top * 16 - 34, 44, 36, cx, cy, (cg, x0, y0) => drawBlades(cg, x0, y0, col, top, col)); }
  /* the stilt walks' own dressing: docks at the first bank and at the night's door, a hide on the second and the last, the bowman's lookout, the winch deck */
  blit(g, 'dock1', o * 16 - 4, 15 * 16 - 58, 6 * 16 + 24, 60, cx, cy, (cg, x0, y0) => dockDressing(cg, x0, y0, o, o + 5, 15, true));
  blit(g, 'lookout3', (o + 70) * 16 - 8, 12 * 16 - 54, 5 * 16 + 24, 58, cx, cy, (cg, x0, y0) => lookoutDressing(cg, x0, y0, o + 70, o + 74, 12));
  blit(g, 'hide3', (o + 77) * 16 - 12, 15 * 16 - 64, 9 * 16 + 28, 66, cx, cy, (cg, x0, y0) => hideDressing(cg, x0, y0, o + 77, o + 85, 15));
  blit(g, 'dock3', (o + 148) * 16 - 4, 15 * 16 - 58, 8 * 16 + 24, 60, cx, cy, (cg, x0, y0) => dockDressing(cg, x0, y0, o + 148, o + 155, 15, true));
  blit(g, 'hide4', (o + 220) * 16 - 12, 15 * 16 - 64, 6 * 16 + 28, 66, cx, cy, (cg, x0, y0) => hideDressing(cg, x0, y0, o + 220, o + 225, 15));
  blit(g, 'winch3', (o + DECK_DX[0]) * 16 - 4, 17 * 16 - 20, 4 * 16 + 12, 66, cx, cy, (cg, x0, y0) => winchDeckDressing(cg, x0, y0, o + DECK_DX[0], o + DECK_DX[1], 17));
  /* THE BOOM: its two piles, and the chain to its winch (taut while it is shut, slack once it is open) */
  const bc = o + BOOM_DX, open = L.grid[19 * L.W + bc] !== T.PORT;
  blit(g, 'boomposts', bc * 16 - 12, 15 * 16, 44, 7 * 16 + 4, cx, cy, (cg, x0, y0) => boomPosts(cg, x0, y0, bc));
  const cxs = (bc + 1) * 16 + 4, cxe = (o + DECK_DX[0]) * 16 + 2;
  if (cxs - cx < 340 && cxe - cx > -20) { const key = 'chain' + (open ? 'o' : 'c'); let sp = baked.get(key); if (!sp) { sp = chainSprite(cxs, 16 * 16 + 4, cxe, 17 * 16 + 2, open ? 28 : 4); baked.set(key, sp); } g.drawImage(sp, Math.round(cxs - cx), Math.round(16 * 16 + 4 - 2 - cy)); }
}

/* ================= THE CURRENT RAFT (in the movers' pass) ================= */
const raftSprite = w => once('craft' + w, () => {
  const [c, g] = canvas(w, 22), Y0 = 7;   /* the deck's top row is y = 7 (m.y) */
  for (let x = 2; x < w - 2; x++) {   /* the deck: planks of bog oak, seams staggered, nails */
    P(g, rnd(x, 1, 7) === 0 ? BOARD[4] : BOARD[3], x, Y0); P(g, rnd(x, 2, 6) === 0 ? BOARD[3] : BOARD[2], x, Y0 + 1); P(g, BOARD[2], x, Y0 + 2); P(g, BOARD[1], x, Y0 + 3);
    if (x % 11 === 7) { P(g, BOARD[0], x, Y0 + 1); P(g, BOARD[0], x, Y0 + 2); } else if (x % 11 === 3 && (x >> 3) % 2) P(g, OAK[1], x, Y0 + 1);
  }
  R(g, OAK[1], 2, Y0 + 4, w - 4, 1);
  /* two bog-oak logs under the deck, round pale ends sticking out each side */
  for (let x = 0; x < w; x++) { const end = x < 3 || x > w - 4; for (let r = 0; r < 4; r++) P(g, end ? (r === 0 || r === 3 ? '#9a8660' : '#c8b080') : (r === 0 ? OAK[4] : r < 3 ? OAK[3] : OAK[1]), x, Y0 + 5 + r); }
  for (let x = 6; x < w - 6; x += 7) if (rnd(x, 5, 3) === 0) P(g, OAK[2], x, Y0 + 7);
  /* the pole, lashed flat along her side, forked at the stern, its tip past the bow */
  R(g, OAK[4], 3, Y0 + 10, w - 8, 1); R(g, OAK[2], 3, Y0 + 11, w - 8, 1); P(g, OAK[4], 0, Y0 + 9); P(g, OAK[2], 1, Y0 + 10); P(g, OAK[4], 2, Y0 + 9); P(g, OAK[2], 0, Y0 + 11); R(g, '#9a8660', w - 6, Y0 + 10, 5, 1);
  /* the reed cord: lashings over the deck and round the logs, a binding every few tiles */
  for (const bx of [10, Math.round(w * 0.32), Math.round(w * 0.58), w - 16]) {
    for (let r = 0; r < 12; r++) { P(g, r & 1 ? CORD_D : CORD, bx, Y0 + r); P(g, r & 1 ? CORD : CORD_D, bx + 1, Y0 + r); }
    P(g, CORD, bx + 2, Y0 + 5); P(g, CORD_D, bx - 1, Y0 + 6);
  }
  /* the reed-bundle prow and stern, bound and bent up: three stems a side */
  for (const [x0, dir] of [[w - 5, 1], [2, -1]]) {
    for (let s = 0; s < 3; s++) for (let r = 0; r < 5 - s; r++) P(g, s === 1 ? RDS[5] : s === 0 ? RDS[3] : RDS[2], x0 + s + dir * Math.floor(r / 3), Y0 + 3 - r);
    R(g, CORD, x0, Y0 + 1, 3, 1); P(g, RDS[6], x0 + 1 + dir, Y0 - 2);
  }
  /* weed trailing under the logs */
  for (const x of [14, 33, 52, 71, 86]) if (x < w - 4) { P(g, MOSS[1], x, Y0 + 9); P(g, MOSS[2], x, Y0 + 10); P(g, MOSS[3], x + 1, Y0 + 11); }
  return outline(c, OUT);
});
export function drawCurrentRaft(g, m, cx, cy, time) {
  const x = Math.round(m.x) - cx, y = Math.round(m.y) - cy;
  g.drawImage(raftSprite(m.w), x, y - 7);
  /* the current: a bow wave ahead and a wake behind while the water has her */
  const wy = y + 8;
  if (m.moving) {
    for (let i = 0; i < 4; i++) { const f = (time * 1.6 + i * 0.25) % 1; g.globalAlpha = 0.9 * (1 - f); R(g, '#eefaff', x + m.w + 1 + Math.round(f * 7), wy - 1 - ((i + 1) >> 1) + (i & 1) * 2, 3 - (f > 0.6 ? 1 : 0), 1); }
    for (let i = 0; i < 5; i++) { const f = (time * 1.3 + i * 0.2) % 1; g.globalAlpha = 0.7 * (1 - f); R(g, i & 1 ? '#bfe6f5' : '#eefaff', x - 3 - Math.round(f * 26), wy - 1 + (i % 3), 4 - Math.round(f * 2), 1); }
    g.globalAlpha = 1;
  } else { g.globalAlpha = 0.45; R(g, '#bfe6f5', x - 2, wy, 3, 1); R(g, '#bfe6f5', x + m.w - 1, wy, 3, 1); g.globalAlpha = 1; }
}

/* ================= THE LEVER: a marsh winch (a drum on two posts, a cord, a pole arm) ================= */
const winch = on => once('winch' + on, () => {
  const [c, g] = canvas(20, 18);
  R(g, OAK[2], 2, 15, 16, 3); R(g, OAK[4], 2, 15, 16, 1);                                    /* the footing plank */
  R(g, OAK[3], 3, 5, 3, 10); R(g, OAK[4], 3, 5, 1, 10); R(g, OAK[3], 14, 5, 3, 10); R(g, OAK[4], 14, 5, 1, 10); R(g, OAK[1], 5, 5, 1, 10); R(g, OAK[1], 16, 5, 1, 10);   /* the two posts */
  R(g, OAK[1], 2, 7, 16, 2); R(g, '#7a7e86', 2, 7, 16, 1);                                    /* the iron axle */
  R(g, CORD_D, 7, 5, 6, 6); R(g, CORD, 7, 5, 6, 1); R(g, CORD, 7, 7, 6, 1); R(g, CORD, 7, 9, 6, 1); R(g, OAK[1], 7, 5, 1, 6); R(g, OAK[1], 12, 5, 1, 6);   /* the drum, corded */
  if (!on) {   /* off: the arm cocked back to the left, its grip bound, the cord taut away to the boom */
    brace(g, 9, 8, 4, 1); R(g, OAK[4], 3, 0, 2, 3); R(g, CORD, 3, 1, 2, 1); R(g, '#e8c060', 2, 0, 2, 2);
    for (let i = 0; i < 6; i++) P(g, '#aab0b8', i, 10 + (i & 1)); P(g, CORD, 6, 10); P(g, CORD, 6, 11);
  } else {     /* on: the arm thrown over to the right, the cord slack, the knob lit */
    brace(g, 10, 8, 15, 1); R(g, OAK[4], 15, 0, 2, 3); R(g, CORD, 15, 1, 2, 1); R(g, '#8fd160', 16, 0, 2, 2);
    for (let i = 0; i < 4; i++) P(g, '#aab0b8', 1 + i, 11 + (i >> 1) + (i & 1)); P(g, '#4a4f58', 5, 13); P(g, '#4a4f58', 4, 14);
  }
  return outline(c, OUT);
});
export function isBoomLever(L, pr) { return !!(L && L.marsh3 && pr.openColumn && pr.openColumn[0] === L.marsh3.at + BOOM_DX); }
export function drawLever(g, pr, cx, cy, time) {
  const x = Math.round(pr.x) - 10 - cx, y = Math.round(pr.y) - 18 - cy;
  g.drawImage(winch(!!pr.on), x, y);
  if (!pr.on && Math.floor(time * 2.5) % 3 === 0) { P(g, '#fff1a0', x + 2, y); P(g, '#ffffff', x + 3, y + 1); }   /* the knob glints: pull me */
}

/* ================= THE WATER (after its surface band): the current, the stands' collars, the boom's foam and its logs adrift ================= */
const driftLog = () => once('dlog', () => { const [c, g] = canvas(22, 7);
  R(g, OAK[3], 1, 1, 20, 5); R(g, OAK[4], 1, 1, 20, 1); R(g, OAK[1], 1, 5, 20, 1); R(g, '#9a8660', 0, 2, 2, 3); R(g, '#9a8660', 20, 2, 2, 3); P(g, OAK[1], 1, 3); P(g, OAK[1], 21, 3);
  for (const x of [5, 12]) { R(g, CORD, x, 1, 2, 5); R(g, CORD_D, x + 1, 1, 1, 5); } for (const x of [8, 15]) P(g, MOSS[2], x, 2); return outline(c, OUT); });
export function drawWater(g, L, cx, cy, time, T) {
  const o = L.marsh3 && L.marsh3.at; if (o === undefined) return;
  if (cx + 340 < o * 16 || cx > (o + L.marsh3.n) * 16) return;
  const wy = SURF - cy;
  /* the current: streaks running the way she goes, in both channels */
  for (const [a, b] of CHANNELS) {
    const x0 = (o + a) * 16, span = (b - a + 1) * 16; if (x0 + span < cx || x0 > cx + 320) continue;
    for (let n = 0, cnt = Math.floor(span / 30); n < cnt; n++) {
      const x = x0 + ((n * 30 + time * 30) % span); if (x < cx - 8 || x > cx + 328) continue;
      const j = rnd(n, a, 4); g.globalAlpha = 0.35 + 0.2 * Math.sin(time * 2 + n); R(g, '#d8f0f0', Math.round(x - cx), wy + 3 + j * 3, 3 + (j & 1) * 2, 1); R(g, '#7fc4e0', Math.round(x - cx) + 1, wy + 4 + j * 3, 2, 1);
    }
  }
  g.globalAlpha = 1;
  /* the reed stands: the water breaks round their feet */
  for (const dx in REED_STANDS) { const x = (o + (+dx)) * 16 - cx; if (x < -20 || x > 340) continue; const f = 0.5 + 0.5 * Math.sin(time * 3 + +dx);
    g.globalAlpha = 0.5 + 0.35 * f; R(g, '#eefaff', x - 3, wy - 1, 3, 1); R(g, '#eefaff', x + 16, wy - 1, 3, 1); R(g, '#bfe6f5', x - 5 - Math.round(f), wy, 3, 1); R(g, '#bfe6f5', x + 18 + Math.round(f), wy, 3, 1); g.globalAlpha = 1; }
  /* the boom: foam piling on its upstream face, drift caught on it; open, its logs swung aside and bobbing */
  const bc = o + BOOM_DX, bx = bc * 16 - cx; if (bx > -60 && bx < 380) {
    const open = L.grid[19 * L.W + bc] !== T.PORT;
    if (!open) { for (let i = 0; i < 5; i++) { const f = 0.5 + 0.5 * Math.sin(time * 4 + i * 1.7); g.globalAlpha = 0.55 + 0.3 * f; R(g, i & 1 ? '#eefaff' : '#bfe6f5', bx - 7 + i - (i & 2), wy - 1 + (i % 3 === 0 ? 1 : 0), 3, 1); } g.globalAlpha = 1;
      R(g, MOSS[1], bx - 4, wy - 1, 4, 2); R(g, OAK[2], bx - 8, wy, 5, 1); P(g, MOSS[3], bx - 6, wy - 1); }
    else for (const [off, ph] of [[-30, 0], [26, 2]]) { const b = Math.sin(time * 1.6 + ph) * 1.2; g.drawImage(driftLog(), Math.round(bx + 8 + off), Math.round(wy - 4 + b)); g.globalAlpha = 0.5; R(g, '#eefaff', Math.round(bx + 6 + off), wy + 2, 4, 1); R(g, '#eefaff', Math.round(bx + 28 + off), wy + 2, 4, 1); g.globalAlpha = 1; }
  }
}
/* the moon's road on the water, drawn after the dark so it shines */
export function drawNight(g, L, cx, cy, time, darkNow) {
  const k = nightK(L, cx, darkNow); if (k < 0.05) return;
  const wy = SURF - cy;
  if (wy < 0 || wy > 180) return;
  for (let i = 0; i < 9; i++) { const w = 12 - i, x = MOON.x + Math.round(Math.sin(time * 1.4 + i * 1.3) * (2 + i * 0.5)) - (w >> 1); g.globalAlpha = k * (0.55 - i * 0.045) * (0.75 + 0.25 * Math.sin(time * 3 + i)); R(g, i & 1 ? '#e8f0ff' : '#bcd8ff', x, wy + 2 + i * 2, w, 1); }
  g.globalAlpha = 1;
}
