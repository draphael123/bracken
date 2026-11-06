// pirate_fleet_art.js - THE PIRATE FLEET's PIECES (claude/pfart, 2026-11-05): everything src/pirate-fleet-hands.js drew in greybox. Pure drawing on a 2d context g, screen coordinates.
//   drawSwellHull   a SWELL BOAT / PRIZE seen side-on: sheer, deck lip, painted wale, tarred strakes with butt joints, copper at her waterline, gunports (shut; open + a muzzle on a prize), a stern
//                   lantern, a rudder post. o = { seed, depth, zone, prize, boss, longboat }
//   drawRig         her masts, yards, SET sail (dusk-lit canvas, patched), shrouds, a pennant; k = how far alongside she is (a far ship is small and hazy)
//   drawFarPrize    the prize out at sea: the same ship, small, high on the horizon, in haze, with the winch's gold glint
//   drawLongboat    the winch's bobbing boat: a clinker hull, upturned stem and stern, thwarts, oars shipped, a lantern
//   drawWinch       THE GRAPPLE WINCH: iron base, a capstan drum wound with rope, two handspikes that spin while she hauls, a pawl, a brass cap; st = { hauling, ready }
//   drawLine        the grapple's rope with its sag and the GRAPNEL at the tip (4 iron flukes)
//   drawStump       a PULL POST: kind 'stump' = a broken mast stump (splinters, an iron band and a hold-ring) / kind 'chain' = an iron bollard with an anchor chain hanging down it
//   drawWreck       the whirl's wreck: the prize that went down - her ribs and a stump of mast, canvas in the eye, drawn in the BACK over the ring
//   drawFoam        the swell's FOAM LINE: dithered white crests along the sea's surface, brighter on the warn, a spray fleck on the turn
//   drawCrest       a swell's crest under a float riding the OTHER swell
//   drawGauge       THE A3 GAUGE DIAL (one drawing for every sea level, art owed by waterkit): a brass-ringed glass with the water's height, the three tolls, the coming arrow
//   drawStreaks     FLOW STREAKS for a pull field (skin 'sea' = long pale streaks, 'whirl' = curved bright arcs, 'rip' = fast white dashes), a tell vs a bite look
// Palette discipline: the timber ramp of src/redraw/pirate_fleet_tiles.js (the same five liveries), the copper ramp, brass, tarred rope, dusk canvas, the foam's three whites.
import { ZONE, zoneOf } from './pirate_fleet_tiles.js';
const R = Math.round;
export const PAL = {
  tar: ['#0b0907', '#171210', '#241c16', '#34291f', '#4a3b2c'],
  copper: ['#10241e', '#1d4a3c', '#2f7a62', '#58b08c', '#9ad8b8'],
  rope: ['#0f0c08', '#241c12', '#3e3220', '#6a5a3a', '#9a8856', '#d8c8a0'],
  iron: ['#14161a', '#2c3038', '#4a505c', '#80889a', '#b8c0d0'],
  brass: ['#4a3410', '#8a6a1c', '#c9a340', '#f0d070', '#fff0b0'],
  canvas: ['#22222e', '#3e3c4e', '#66647a', '#9a96a8', '#c8c0bc', '#e8dcd0'],
  foam: ['#f6fbfc', '#c4e4ee', '#86bccf', '#4f8aa0'],
  sea: ['#04121a', '#08222e', '#0e3a48', '#1a5868'],
  gold: '#ffd36b', red: '#8a1e22', redL: '#c43a34',
};
const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const rline = (g, x0, y0, x1, y1, c) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))); g.fillStyle = c; for (let i = 0; i <= n; i++) g.fillRect(R(x0 + (x1 - x0) * i / n), R(y0 + (y1 - y0) * i / n), 1, 1); };

/* ---------- HULLS ---------- */
export function drawSwellHull(g, x, y, w, o = {}) {
  const Z = ZONE[o.zone != null ? o.zone : zoneOf(R(x / 16) || 0, 30)], d = Math.max(8, R(o.depth || 20)), sd = o.seed || 0, P = PAL, a = o.alpha == null ? 1 : o.alpha, sc = o.scale || 1;
  g.globalAlpha = a; x = R(x); y = R(y); w = R(w);
  const sheer = i => (i < 5 * sc ? 5 * sc - i : w - 1 - i < 5 * sc ? 5 * sc - (w - 1 - i) : 0);       /* the hull tucks in at stem and stern */
  /* the strakes, column by column (a hull is wider at the deck than at her waterline) */
  for (let i = 0; i < w; i++) { const tuck = R(sheer(i) * 0.9) + (i < 3 || w - 1 - i < 3 ? 1 : 0), h = d - tuck;
    for (let j = 3; j < h; j++) { const course = (j / 4) | 0, cy = j % 4, off = (course * 7 + sd) % 22, sx = (i + off) % 22;
      let c = cy === 3 ? Z.joint : sx === 0 ? Z.s[1] : Z.s[Math.max(0, Math.min(6, 2 + ((hash(((i + off) / 22) | 0, course + sd) % 3) - 1) + (cy === 0 ? 1 : 0) - (j > d * 0.6 ? 1 : 0)))];
      if (sx === 11 && cy === 1 && (hash(course, sd) & 3) === 0) c = Z.nail;
      g.fillStyle = c; g.fillRect(x + i, y + j + tuck * 0, 1, 1); } }
  /* the wale: her painted band with a thin trim line, a stripe of iron nails */
  rect(g, x + 2, y + 4, w - 4, 1, Z.paint); rect(g, x + 2, y + 5, w - 4, 1, Z.trim); rect(g, x + 2, y + 6, w - 4, 2, Z.paint);
  for (let i = 4; i < w - 4; i += 6) rect(g, x + i, y + 4, 1, 1, Z.nail);
  /* copper at the waterline: the bottom rows of what we show */
  const cy0 = Math.max(10, d - 7); for (let i = 3; i < w - 3; i++) { const tuck = R(sheer(i) * 0.9); for (let j = cy0; j < d - tuck; j++) { const q = (i + ((j >> 3) & 1) * 4) % 8, e = q === 0 || (j - cy0) % 8 === 0;
    g.fillStyle = e ? P.copper[0] : (hash(i >> 3, j >> 3) & 1 ? P.copper[2] : P.copper[1]); g.fillRect(x + i, y + j, 1, 1); } }
  rect(g, x + 4, y + d - 2, w - 8, 2, P.tar[0]);                                                    /* the keel's shadow */
  /* the deck lip over it: the walked surface (the player's feet are on y) */
  rect(g, x, y, w, 3, Z.deck[2]); rect(g, x, y, w, 1, Z.deck[3]); rect(g, x, y + 2, w, 1, Z.deck[0]);
  for (let i = 3; i < w - 2; i += 11) rect(g, x + i + (hash(i, sd) % 5), y + 1, 1, 2, Z.deck[0]);   /* caulked butts */
  rect(g, x, y + 3, w, 1, Z.joint);
  /* gunports: lids shut on a boat; a prize shows them open, black, a muzzle in the first and last */
  for (let i = 12, n = 0; i < w - 12; i += 20, n++) { const px = x + i, py = y + 10;
    rect(g, px - 1, py - 1, 8, 6, Z.joint); if (o.prize || o.boss) { rect(g, px, py, 6, 4, P.tar[0]); if (n % 2 === 0) { rect(g, px + 2, py + 1, 6, 2, P.iron[2]); rect(g, px + 7, py, 1, 4, P.iron[1]); } }
    else { rect(g, px, py, 6, 4, Z.s[3]); rect(g, px, py, 6, 1, Z.s[5]); rect(g, px + 5, py + 1, 1, 1, P.iron[3]); } }                /* the lid, a ring */
  /* the stern: a lantern on a davit, a rudder post, a taffrail */
  if (!o.longboat) { const sx = x + w - 5; rect(g, sx, y - 10, 1, 10, P.iron[1]); rect(g, sx - 4, y - 10, 5, 1, P.iron[1]); rect(g, sx - 4, y - 9, 3, 4, P.brass[1]); rect(g, sx - 3, y - 8, 1, 2, P.brass[4]);
    rect(g, x + w - 1, y + 4, 2, Math.min(d - 6, 14), Z.s[1]); }
  if (o.boss) { rect(g, x + 6, y + 8, 14, 1, P.gold); rect(g, x + w - 24, y + 8, 14, 1, P.gold); }   /* his sloop's gold along the wale */
  g.globalAlpha = 1;
}
/* A FAR PRIZE: small, hazy, a stack of sail over a short hull; glint = the winch's mark */
export function drawFarPrize(g, x, y, w, sc, alpha, t, o = {}) {
  const P = PAL, h = R(26 * sc); g.globalAlpha = alpha;
  drawSwellHull(g, x, y, w, { depth: 26, seed: o.seed || 3, zone: o.zone != null ? o.zone : 1, prize: true, boss: o.boss, scale: sc, alpha });
  drawRig(g, x, y, w, { sc, alpha, seed: o.seed || 3, boss: o.boss, t });
  g.globalAlpha = Math.min(1, alpha * 0.5); rect(g, x + 2, y + h - 2, w - 4, 2, P.foam[2]);                                  /* the wash at her bow */
  if (o.glint && Math.sin(t * 3) > 0.5) { g.globalAlpha = 1; rect(g, x + R(w / 2) - 1, y - R(56 * sc), 3, 3, P.gold); rect(g, x + R(w / 2), y - R(58 * sc), 1, 7, P.brass[4]); }
  g.globalAlpha = 1;
}
/* MASTS, YARDS, SAIL, SHROUDS: the sail is dusk canvas with a lit left edge and one patch; the boss's sloop flies the Freebooter's red */
export function drawRig(g, x, y, w, o = {}) {
  const P = PAL, sc = o.sc || 1, a = o.alpha == null ? 1 : o.alpha, t = o.t || 0, sd = o.seed || 0; g.globalAlpha = a;
  const masts = w > 150 ? [0.28, 0.7] : [0.5];
  masts.forEach((mf, mi) => { const mx = x + R(w * mf), mh = R((w > 150 ? 72 : 58) * sc * (mi ? 0.9 : 1)), sw = R((w > 150 ? 34 : 26) * sc), sh = R(mh * 0.55), top = y - mh;
    rect(g, mx - 1, top, 3, mh, P.tar[3]); rect(g, mx - 1, top, 1, mh, P.tar[4]);                                           /* the mast, lit on its left */
    rect(g, mx - sw / 2 - 2, top + 3, sw + 4, 2, P.tar[3]); rect(g, mx - sw / 2 - 2, top + 3, sw + 4, 1, P.tar[4]);         /* the yard */
    const sy = top + 5, billow = Math.sin(t * 1.4 + mi) > 0 ? 1 : 0;
    for (let j = 0; j < sh; j++) { const bow = R(Math.sin(j / sh * Math.PI) * 3 * sc) + billow; const x0 = mx - R(sw / 2) + 1, w0 = sw - 2;
      rect(g, x0, sy + j, w0 + bow, 1, j % 4 === 3 ? P.canvas[2] : P.canvas[j % 8 < 4 ? 3 : 4]); rect(g, x0, sy + j, 1, 1, P.canvas[5]); rect(g, x0 + w0 + bow - 1, sy + j, 1, 1, P.canvas[1]); }   /* cloths, lit left */
    rect(g, mx - R(sw / 4), sy + R(sh * 0.3), R(sw / 4), R(sh * 0.22), P.canvas[hash(sd, mi) & 1 ? 1 : 2]);                  /* a patch */
    if (o.boss && mi === 0) { rect(g, mx - 5, sy + 6, 10, 9, P.red); rect(g, mx - 3, sy + 8, 6, 5, P.canvas[5]); rect(g, mx - 1, sy + 9, 2, 2, P.red); }   /* the Freebooter's mark on her sail */
    rline(g, mx, top, x + 1, y, P.rope[2]); rline(g, mx, top, x + w - 2, y, P.rope[2]);                                       /* the stays */
    for (let k = 1; k < 4; k++) { const f = k / 4; rline(g, mx - R(sw * 0.35), top + R(mh * f * 0.7) + 4, mx + R(sw * 0.35), top + R(mh * f * 0.7) + 4, P.rope[1]); }    /* ratlines in the shrouds */
    rect(g, mx, top - 4, 1, 4, P.tar[2]); rect(g, mx + 1, top - 4, R(8 * sc) + (billow ? 1 : 0), R(4 * sc) + 1, o.boss ? P.red : P.tar[0]);   /* the pennant */
  });
  g.globalAlpha = 1;
}
export function drawLongboat(g, x, y, w, o = {}) {
  const P = PAL, t = o.t || 0, z = ZONE[1]; x = R(x); y = R(y); w = R(w); const d = 12; g.globalAlpha = o.alpha == null ? 1 : o.alpha;
  for (let i = 0; i < w; i++) { const tuck = i < 4 ? 4 - i : w - 1 - i < 4 ? 4 - (w - 1 - i) : 0; for (let j = 2; j < d - tuck; j++) rect(g, x + i, y + j, 1, 1, j % 3 === 2 ? z.joint : z.s[j < 4 ? 4 : j > 8 ? 2 : 3]); }   /* clinker laps */
  rect(g, x, y, w, 2, z.deck[2]); rect(g, x, y, w, 1, z.deck[3]);                                                          /* the gunwale, walked */
  rect(g, x - 2, y - 7, 3, 9, z.s[4]); rect(g, x + w - 1, y - 6, 3, 8, z.s[4]); rect(g, x - 3, y - 8, 2, 2, z.s[6]); rect(g, x + w + 1, y - 7, 2, 2, z.s[6]);   /* upturned stem and stern */
  for (let i = 8; i < w - 8; i += 12) rect(g, x + i, y + 2, 3, 2, z.s[2]);                                                  /* thwarts */
  rline(g, x + 6, y - 1, x + w - 8, y - 5, P.tar[4]); rline(g, x + 8, y - 1, x + w - 6, y - 5, P.tar[3]);                    /* oars shipped */
  rect(g, x + w - 10, y - 12, 1, 6, P.iron[1]); rect(g, x + w - 12, y - 12, 4, 1, P.iron[1]); rect(g, x + w - 12, y - 11, 3, 3, P.brass[1]); if (Math.sin(t * 7) > -0.6) rect(g, x + w - 11, y - 10, 1, 1, P.brass[4]);   /* her lantern */
  rect(g, x + 3, y + d - 3, w - 6, 2, P.copper[1]); g.globalAlpha = 1;
}

/* ---------- THE WINCH AND ITS LINE ---------- */
export function drawWinch(g, x, y, t, st = {}) {
  const P = PAL, spin = st.hauling ? t * 14 : 0; x = R(x); y = R(y);
  rect(g, x - 8, y - 3, 16, 3, P.iron[1]); rect(g, x - 8, y - 3, 16, 1, P.iron[3]); for (const bx of [-6, 5]) rect(g, x + bx, y - 2, 1, 1, P.iron[4]);   /* the bedplate, bolts */
  rect(g, x - 3, y - 14, 6, 11, P.iron[2]); rect(g, x - 3, y - 14, 1, 11, P.iron[4]); rect(g, x + 2, y - 14, 1, 11, P.iron[0]);           /* the barrel */
  rect(g, x - 5, y - 11, 10, 6, P.rope[3]); for (let k = 0; k < 6; k += 2) rect(g, x - 5, y - 11 + k, 10, 1, P.rope[1]); rect(g, x - 5, y - 11, 10, 1, P.rope[4]);   /* the drum, wound */
  rect(g, x - 6, y - 12, 12, 2, P.iron[3]); rect(g, x - 6, y - 6, 12, 1, P.iron[3]);                                                 /* its flanges */
  /* two handspikes through the drum head: they turn (foreshortened) while it hauls */
  const a = Math.sin(spin) * 7, b = Math.cos(spin); rect(g, x + a - 1, y - 16, 3, 1, P.brass[3]); rect(g, x - a - 1, y - 16 + (b > 0 ? 0 : 1), 3, 1, P.brass[1]);
  rect(g, x - 1, y - 17, 3, 2, P.brass[2]); rect(g, x, y - 18, 1, 1, P.brass[4]);                                                    /* the brass cap */
  rect(g, x + 6, y - 6, 3, 2, P.iron[0]); rect(g, x + 6, y - 6, 2, 1, P.iron[4]);                                                    /* the pawl */
  rect(g, x - 9, y - 7, 4, 1, P.rope[4]); rect(g, x - 11, y - 6, 3, 1, P.rope[3]);                                                   /* the line's tail coiled to hand */
  if (st.ready && Math.sin(t * 4) > 0) { rect(g, x - 1, y - 25, 3, 3, P.gold); rect(g, x, y - 27, 1, 7, P.brass[4]); }                    /* strike me: a brass glint above the cap */
  if (st.ready) { g.globalAlpha = 0.5; rect(g, x - 9, y - 20, 18, 1, P.gold); g.globalAlpha = 1; }
}
export function drawLine(g, x0, y0, x1, y1, f, t, o = {}) {
  const P = PAL, n = Math.max(6, R(Math.hypot(x1 - x0, y1 - y0) / 3)), sag = o.taut ? 2 : 10 * (1 - f * 0.6);
  let lx = x0, ly = y0;
  for (let i = 1; i <= n; i++) { const u = (i / n) * f, px = x0 + (x1 - x0) * u, py = y0 + (y1 - y0) * u + Math.sin((i / n) * Math.PI) * sag * (1 - (o.taut ? 0.7 : 0)) + Math.sin(t * 6 + i) * (o.taut ? 0 : 0.6);
    rline(g, lx, ly, px, py, i % 3 ? P.rope[5] : P.rope[3]); lx = px; ly = py; }
  /* the grapnel at the tip: a shank and four flukes */
  const hx = R(lx), hy = R(ly); rect(g, hx - 1, hy - 3, 2, 6, P.iron[2]); rect(g, hx - 1, hy - 3, 1, 6, P.iron[4]); rect(g, hx - 4, hy + 2, 3, 1, P.iron[3]); rect(g, hx + 1, hy + 2, 3, 1, P.iron[3]); rect(g, hx - 5, hy + 1, 1, 2, P.iron[3]); rect(g, hx + 4, hy + 1, 1, 2, P.iron[3]); rect(g, hx - 1, hy - 4, 2, 1, P.iron[4]);
}

/* ---------- PULL POSTS AND THE WRECK ---------- */
export function drawStump(g, x, y, kind, t, held) {
  const P = PAL; x = R(x); y = R(y);
  if (kind === 'chain') {                                                                                               /* an iron bollard, its anchor chain hanging in the rip */
    rect(g, x - 4, y + 4, 8, 6, P.iron[1]); rect(g, x - 4, y + 4, 8, 1, P.iron[3]); rect(g, x - 2, y - 8, 4, 13, P.iron[2]); rect(g, x - 2, y - 8, 1, 13, P.iron[4]); rect(g, x - 3, y - 9, 6, 2, P.iron[3]);
    for (let k = 0; k < 6; k++) { const sw = R(Math.sin(t * 3 + k * 0.7) * (1 + k * 0.4)); rect(g, x + 3 + sw, y - 4 + k * 4, 3, 2, P.iron[k & 1 ? 3 : 2]); rect(g, x + 4 + sw, y - 2 + k * 4, 1, 2, P.iron[1]); }
  } else {                                                                                                              /* a mast stump: splintered top, an iron band, a hold-ring */
    rect(g, x - 4, y - 10, 8, 20, P.tar[3]); rect(g, x - 4, y - 10, 2, 20, P.tar[4]); rect(g, x + 2, y - 10, 2, 20, P.tar[1]);
    for (const [sx, sh] of [[-4, 3], [-2, 5], [0, 2], [2, 4]]) rect(g, x + sx, y - 10 - sh, 2, sh, P.tar[4]);              /* splinters */
    rect(g, x - 5, y - 2, 10, 3, P.iron[2]); rect(g, x - 5, y - 2, 10, 1, P.iron[4]);
    rect(g, x + 4, y + 1, 4, 4, P.iron[3]); rect(g, x + 5, y + 2, 2, 2, P.tar[0]);                                           /* the hold-ring */
    rect(g, x - 6, y + 8, 12, 2, P.copper[1]); rect(g, x - 5, y + 7, 3, 1, P.copper[3]);                                    /* weed and copper at its foot */
  }
  if (held) { g.globalAlpha = 0.7; rect(g, x - 1, y - 18, 3, 3, P.gold); g.globalAlpha = 1; }
}
export function drawWreck(g, x, y, t) {
  const P = PAL; x = R(x); y = R(y);
  const bob = R(Math.sin(t * 1.2) * 1.5); y += bob;
  for (let k = 0; k < 5; k++) { const rx = x - 20 + k * 10, rh = 10 + ((k * 7) % 5) * 3; rect(g, rx, y - rh, 2, rh + 6, P.tar[2]); rect(g, rx, y - rh, 1, rh + 6, P.tar[4]); if (k % 2) rect(g, rx - 1, y - rh - 2, 4, 2, P.tar[3]); }   /* her ribs */
  rect(g, x - 24, y + 1, 50, 2, P.tar[3]); rect(g, x - 24, y + 1, 50, 1, P.tar[4]);                                         /* a keelson running under them */
  rect(g, x - 2, y - 30, 4, 32, P.tar[3]); rect(g, x - 2, y - 30, 1, 32, P.tar[4]); rect(g, x - 3, y - 32, 2, 3, P.tar[4]); rect(g, x + 1, y - 33, 2, 4, P.tar[4]);   /* the mast, broken short */
  rect(g, x - 14, y - 22, 12, 2, P.tar[3]); rline(g, x - 14, y - 21, x - 4, y - 10, P.canvas[2]); rline(g, x - 13, y - 20, x - 6, y - 8, P.canvas[1]);              /* a yard, torn canvas hanging */
  for (let k = 0; k < 7; k++) rect(g, x - 28 + k * 9 + R(Math.sin(t * 2 + k) * 2), y + 4 + (k % 2), 4, 1, P.foam[k % 3]);
  g.globalAlpha = 0.9; rect(g, x - 1, y - 18, 3, 3, P.gold); g.globalAlpha = 1;                                                /* the silver's gleam in her eye is the level's (an ent): this is her lantern, drowned */
}

/* ---------- THE SWELL, THE GAUGE, THE STREAKS ---------- */
export function drawFoam(g, x0, x1, y, t, ph, k = 1) {
  const P = PAL, hot = ph === 'warn';
  for (let x = x0 - (x0 % 5); x < x1; x += 5) { const w = 2 + ((hash(x >> 2, 3) % 3)), dx = R(Math.sin(t * 1.5 + x * 0.1) * 2);
    g.fillStyle = hot ? P.foam[0] : P.foam[1]; g.fillRect(x + dx, y - 1, w, 1); g.fillStyle = hot ? P.foam[1] : P.foam[2]; g.fillRect(x + dx - 1, y, w + 2, 1);
    if (hot && ((x >> 1) + R(t * 8)) % 7 === 0) { g.fillStyle = P.foam[0]; g.fillRect(x + 1, y - 3 - (hash(x, R(t * 8)) % 3), 1, 1); } }   /* spray flecks as she gathers */
  if (ph === 'turn') for (let x = x0 + 3; x < x1; x += 17) { g.fillStyle = P.foam[0]; g.fillRect(x + R(t * 12) % 5, y - 2, 1, 1); }
}
export function drawCrest(g, cx, y, hw, t) {
  const P = PAL; for (let i = -hw; i <= hw; i += 2) { const u = i / hw, h = R((1 - u * u) * 5 + Math.sin(t * 2 + i * 0.3)); rect(g, cx + i, y - h, 2, h + 1, i & 2 ? P.foam[1] : P.foam[2]); if (h > 3) rect(g, cx + i, y - h, 2, 1, P.foam[0]); }
}
export function drawGauge(g, x, y, gg, t) {
  const P = PAL, h = 26, k = Math.max(0, Math.min(1, gg.k)); x = R(x); y = R(y);
  rect(g, x - 1, y - 1, 14, h + 8, P.brass[0]); rect(g, x, y, 12, h + 6, P.brass[2]); rect(g, x, y, 12, 1, P.brass[4]); rect(g, x, y + h + 5, 12, 1, P.brass[0]);       /* the brass case */
  rect(g, x + 2, y + 2, 8, h + 2, '#06121a'); rect(g, x + 2, y + 2, 1, h + 2, '#1a2e3a');                                                                                /* the glass */
  const fh = Math.max(1, R(h * k)); rect(g, x + 3, y + 3 + h - fh, 6, fh, gg.tell && Math.sin(t * 16) > 0 ? P.foam[0] : P.sea[3]); rect(g, x + 3, y + 3 + h - fh, 6, 1, P.foam[1]);   /* the water */
  for (let i = 1; i < 4; i++) rect(g, x + 2, y + 2 + R((h + 2) * i / 4), 3, 1, P.brass[3]);                                                                              /* the scale */
  const tolls = gg.ph === 'warn' ? Math.min(3, 1 + R(((gg.t || 0) * 2)) % 3) : 0; for (let i = 0; i < 3; i++) rect(g, x + 2 + i * 3, y + h + 4, 2, 1, i < tolls || (gg.tell && Math.sin(t * 16) > 0) ? P.gold : P.brass[0]);   /* three tolls */
  if (gg.coming === 'in') { rect(g, x + 14, y + 2, 3, 1, P.gold); rect(g, x + 15, y + 1, 1, 3, P.gold); } else if (gg.coming === 'out') { rect(g, x + 14, y + h, 3, 1, P.brass[3]); rect(g, x + 15, y + h - 1, 1, 3, P.brass[3]); }   /* in / out */
}
/* FLOW STREAKS over a field's box (or ring). f = the field state { f, s (0..1 strength now), ph, dirK }. skin picks the look; a TELL is faint and short, a BITE long and bright */
export function drawStreaks(g, fs, cx, cy, t, VW) {
  const F = fs.f, TS = 16, P = PAL, s = fs.s, tell = fs.ph === 'tell'; if (s <= 0.02 && !tell) return;
  const skin = F.kind === 'whirl' ? 'whirl' : (F.strength || 0) > 82 ? 'rip' : 'sea';
  let x0, y0, x1, y1; if (F.ring) { const [ex, ey, rr] = F.ring; x0 = (ex - rr) * TS; x1 = (ex + rr + 1) * TS; y0 = (ey - rr) * TS; y1 = (ey + rr + 1) * TS; } else { [x0, y0, x1, y1] = F.box; x0 *= TS; y0 = (y0 + 1) * TS; x1 = (x1 + 1) * TS; y1 = (y1 + 1) * TS; }
  if (x1 - cx < 0 || x0 - cx > VW) return;
  const dir = F.dir ? Math.sign(F.dir[0]) * (fs.dirK || 1) : 1, n = Math.max(6, R((x1 - x0) * (y1 - y0) / 1800)), a = tell ? 0.3 : 0.35 + 0.55 * s;
  for (let i = 0; i < n; i++) {
    const hx = hash(i, 91), hy = hash(i, 17), per = 1.6 + (hx % 5) * 0.2, u = ((t / per) + (hx % 100) / 100) % 1;
    if (skin === 'whirl') { const [ex, ey, rr] = F.ring, ang = (hy % 628) / 100 + t * (0.5 + 1.6 * s) * (1 + (hx % 3) * 0.2), rad = (0.25 + ((hx >> 3) % 70) / 100) * rr * TS * (1 - u * 0.3);
      const px = ex * TS + 8 + Math.cos(ang) * rad - cx, py = ey * TS + 8 + Math.sin(ang) * rad * 0.55 - cy;
      for (let k = 0; k < 4; k++) { const a2 = ang - k * 0.18, qx = ex * TS + 8 + Math.cos(a2) * rad - cx, qy = ey * TS + 8 + Math.sin(a2) * rad * 0.55 - cy; g.globalAlpha = a * (1 - k * 0.22); g.fillStyle = k < 2 ? P.foam[tell ? 2 : 0] : P.foam[2]; g.fillRect(R(qx), R(qy), 1, 1); }
      continue; }
    const len = skin === 'rip' ? 12 + (hx % 10) : 7 + (hx % 9), span = x1 - x0, px = x0 + ((u * (span + len * 2) * (dir < 0 ? -1 : 1) + (dir < 0 ? span + len : -len) + span * 2) % (span + len * 2)) - cx - (dir < 0 ? 0 : 0), py = y0 + 6 + (hy % Math.max(1, R(y1 - y0 - 10))) - cy;
    const l = tell ? R(len * 0.4) : len; g.globalAlpha = a * Math.sin(u * Math.PI);
    g.fillStyle = skin === 'rip' ? P.foam[0] : P.foam[tell ? 2 : 1]; g.fillRect(R(px), R(py), l, 1);
    if (!tell) { g.fillStyle = P.foam[2]; g.fillRect(R(px + (dir < 0 ? l : -3)), R(py), 3, 1); if (skin === 'rip' && (hx & 1)) g.fillRect(R(px + 3), R(py + 1), l - 5, 1); }
  }
  g.globalAlpha = 1;
}
