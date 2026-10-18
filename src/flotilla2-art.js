// src/flotilla2-art.js - THE FLOTILLA 2's ART PASS (claude/flotilla2art; scratch/brief-flotilla2.md B + the ART LIST of work/claude/lane-done/flotilla2.md, items 6-10).
// DRAWING ONLY: no tile, entity, number or timing is touched (the level hash is unchanged). Everything is keyed to where the level put it (the coordinates below are the tile
// columns of theFlotilla() in src/level.js) and runs only while L.flot2 is on. THE RULE FOR EVERY SPAR: it is rigging - tarred spars with seizings and gammoning, hawsers laid up
// in three strands, yards with their lifts, footropes and a clewed-up sail under them - tied back to a mast or a stay. NOTHING HERE IS A LOG OR A PLANK ON THE AIR.
//   the galley hull: benches in their frames, oars, the pressed fisherfolk (a chained row cycle) and the FREED (standing, the chain broken), charred deck lips over the wells, the
//     stern castle's rib ladder and the mizzen's crow's nest
//   the rigging run: yards on their stays, the masts' wreck bones, the hawser, the catch-net
//   the powder ship: copper doors (shut, and blown), the crate hatch (shut, and blown), the mainmast partners, the 'tween-deck magazine, the fighting top, the deck guns
//   the lashings: see src/redraw/champion_art.js drawLashing
const R = Math.round, TS = 16;
const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const noise = (i, k = 7) => ((i * 2654435761 + k * 40503) >>> 0) % 1000 / 1000;
const WELLS = [[101, 109], [118, 138], [153, 170], [187, 204]];
const MASTS_BONES = [302, 322, 338, 357];   /* the rigging run's masts, each stepped on a sunken wreck's bones (a 4-wide block from row 30) */
/* tarred spar wood: lit on top, bleached by salt, dark under */
const SP = ['#b6a47e', '#8e7d5c', '#6a5a42', '#4a3d2c', '#2c2318'], SALT = '#ece6d2', TAR = '#1a1510', ROPE = ['#d8c48a', '#b59a62', '#8a7040', '#4a3a20'];
const CU = ['#6fc0a0', '#4e9a7f', '#3c7e68', '#27584a', '#b8784a'];   /* copper gone green, and the bare metal */

/* a spar from px x0 to x1 at row-top y: tapered toward the tip side (tip = -1 left / 1 right), lashed with seizings and gammoning at the inboard end */
function spar(g, x0, x1, y, tip, taper = 2) {
  const w = x1 - x0;
  for (let i = 0; i < w; i++) {
    const k = tip > 0 ? i / w : 1 - i / w, th = 8 - R(k * taper);   /* thickness narrows toward the tip */
    const yy = y + R(k * taper * 0.5), x = x0 + i;
    rc(g, x, yy, 1, 1, SP[0]); rc(g, x, yy + 1, 1, 1, SP[1]); rc(g, x, yy + 2, 1, Math.max(1, th - 5), SP[2]); rc(g, x, yy + th - 3, 1, 2, SP[3]); rc(g, x, yy + th - 1, 1, 1, SP[4]);
    if (noise(i, 3) > 0.93) rc(g, x, yy + 1, 2, 1, SALT);   /* salt dried on the grain */
  }
  rc(g, tip > 0 ? x1 - 2 : x0, y + 1, 2, 6, '#3a3a44'); rc(g, tip > 0 ? x1 - 2 : x0, y + 1, 1, 6, '#5a5a66');   /* the iron cap on the end of it */
  const inb = tip > 0 ? x0 : x1 - 1;
  for (let j = 0; j < 4; j++) { const sx = inb + (tip > 0 ? 3 + j * 3 : -4 - j * 3); rc(g, sx, y, 2, 8, j % 2 ? ROPE[2] : ROPE[1]); rc(g, sx, y, 1, 8, ROPE[0]); }   /* the gammoning: turns of rope round the inboard end, over a mast or a rail */
  for (const f of [0.35, 0.7]) { const sx = R(x0 + w * (tip > 0 ? f : 1 - f)); rc(g, sx, y, 1, 8, ROPE[3]); rc(g, sx + 1, y, 1, 8, ROPE[1]); }   /* seizings, tied off */
}
/* a rope line (a stay, a bobstay) between two screen points, with a sag */
function stay(g, x0, y0, x1, y1, sag = 0, col = ROPE[1]) {
  const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2));
  for (let i = 0; i <= n; i++) { const u = i / n; rc(g, x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * sag, 1, 1, col); }
}
/* a hawser laid up in three strands: the twist runs along it; h its thickness */
function hawser(g, x0, x1, y, h = 8) {
  for (let x = x0; x < x1; x++) {
    const ph = (x >> 1) % 3; for (let r = 0; r < h; r++) { const q = (r + ph * 2) % 6; rc(g, x, y + r, 1, 1, q < 2 ? ROPE[0] : q < 4 ? ROPE[1] : ROPE[2]); }
    rc(g, x, y + h - 1, 1, 1, ROPE[3]);
  }
}
function block(g, x, y) { rc(g, x - 2, y - 3, 5, 7, '#5a4630'); rc(g, x - 2, y - 3, 5, 1, '#8a7454'); rc(g, x - 1, y - 1, 3, 3, '#1a1510'); rc(g, x, y, 1, 1, '#c9a44c'); }   /* a tackle block */

export function makeFlotilla2Art(ctx) {
  const A = {};
  const F = () => (ctx.L && ctx.L.flot2) || null;
  const smokeAt = (g, x, y, t, n = 3) => { for (let i = 0; i < n; i++) { const k = (t * 0.5 + i / n) % 1; g.globalAlpha = 0.28 * (1 - k); rc(g, x + Math.sin(k * 7 + i) * 3, y - k * 22, 3 - R(k), 3 - R(k), '#8a9088'); } g.globalAlpha = 1; };

  /* ================= THE GALLEY HULL: a bench in its frame, its oar, and the man at it ================= */
  A.bench = (g, m, cx, cy, time, rower, freed) => {
    const x = R(m.x - cx), y = R(m.y - cy), w = m.w, lowY = R(m.y0 - cy), hiY = R(m.y0 - m.rise - cy);
    /* the frame it rides in: two tarred uprights with knee-braces and iron straps, chalk tallies at the top and bottom of its stroke */
    for (const ux of [x + 1, x + w - 5]) { rc(g, ux, hiY - 2, 4, lowY - hiY + 32, SP[3]); rc(g, ux, hiY - 2, 1, lowY - hiY + 32, SP[1]); rc(g, ux + 3, hiY - 2, 1, lowY - hiY + 32, TAR);
      for (let sY = hiY + 4; sY < lowY + 28; sY += 14) { rc(g, ux - 1, sY, 6, 2, '#3a3a44'); rc(g, ux - 1, sY, 6, 1, '#5a5a66'); } }
    for (const [bx, d] of [[x + 5, 1], [x + w - 6, -1]]) for (let i = 0; i < 6; i++) rc(g, bx + d * i, y + 8 + i, 1, 2, SP[2]);   /* the knee-braces under the thwart */
    rc(g, x + 5, lowY + 12, w - 10, 2, SP[3]); rc(g, x + 5, lowY + 12, w - 10, 1, SP[1]);   /* a cross-piece at the foot of the frame */
    for (const ty of [lowY + 3, hiY + 3]) { rc(g, x - 1, ty, 3, 1, '#d8d0b0'); rc(g, x + w - 2, ty, 3, 1, '#d8d0b0'); rc(g, x - 2, ty + 2, 2, 1, '#d8d0b0'); }   /* the stroke's tallies */
    /* the thwart: a worn pale plank, thole pins, iron-bound ends, a ring-bolt for the chain */
    rc(g, x, y, w, 2, '#c9b890'); rc(g, x, y + 2, w, 3, SP[1]); rc(g, x, y + 5, w, 2, SP[3]); rc(g, x, y + 7, w, 1, TAR);
    rc(g, x + 14, y, 14, 1, '#a89878'); for (let i = 0; i < 6; i++) rc(g, x + 3 + i * 8, y + 3, 1, 1, TAR);
    rc(g, x, y, 3, 8, '#3a3a44'); rc(g, x + w - 3, y, 3, 8, '#3a3a44'); rc(g, x, y, 1, 8, '#5a5a66');
    rc(g, x + w - 6, y - 4, 2, 4, SP[3]); rc(g, x + w - 6, y - 4, 1, 4, SP[1]);   /* the thole pin the oar works on */
    const ring = rower ? R(rower.x - cx) + 8 : x + 14; rc(g, ring - 1, y + 1, 3, 3, '#3a3a44'); rc(g, ring, y + 2, 1, 1, '#9aa0a8');
    /* the oar */
    const ph = time * 2.4 + (m.phase || 0) * 5, stroke = Math.sin(ph), px = x + w - 5, py = y - 3;
    if (rower && !freed) {
      const hx = R(rower.x - cx) + 3 + R(stroke * -3), hy = y - 11 + R(Math.abs(stroke) * 1);   /* the inboard end in his hands */
      const ex = px + 20, ey = py + 6 + R(stroke * 5);   /* the blade end, dipping with the stroke */
      for (let i = 0; i <= 28; i++) { const u = i / 28, ox = hx + (ex + 6 - hx) * u, oy = hy + (ey - hy) * u + (u < 0.45 ? 0 : (u - 0.45) * 8); rc(g, ox, oy, 2, 2, i < 14 ? SP[2] : SP[1]); }
      rc(g, ex + 4, ey + 6, 5, 9, SP[2]); rc(g, ex + 4, ey + 6, 1, 9, SP[0]); rc(g, ex + 8, ey + 6, 1, 9, SP[4]);   /* the blade */
      rc(g, px - 1, py - 1, 3, 3, '#6a4a2a'); rc(g, px - 1, py - 1, 3, 1, '#a07a4a');   /* the leather round the oar at the pin */
    } else if (rower && freed) {   /* shipped: the oar lies along the thwart, its blade over the end */
      rc(g, x + 6, y - 3, w + 8, 2, SP[2]); rc(g, x + 6, y - 3, w + 8, 1, SP[0]); rc(g, x + w + 8, y - 6, 4, 8, SP[2]);
    } else {   /* the empty bench's oar: shipped, never stopping - it still works its pin with nobody at it */
      const sw = Math.sin(time * 3.4 + (m.phase || 0) * 5) * 3; for (let i = 0; i <= 24; i++) { const u = i / 24; rc(g, x + 8 + (px + 22 - x - 8) * u, y - 8 + (py + 6 + sw - y + 8) * u, 2, 2, SP[2]); }
      rc(g, px + 18, py + 5 + sw, 5, 9, SP[2]);
    }
    if (rower) A.rower(g, R(rower.x - cx), y, freed, time + (m.phase || 0) * 3);
  };
  /* A PRESSED FISHERMAN: oilskin cap, a salt-stained jersey, bare forearms, iron on his ankle chained to the bench; rowing in a four-beat cycle. FREED: standing on the thwart, the iron off, a hand to his wrist */
  A.rower = (g, x, y, free, t) => {
    const skin = '#c8a07c', skinD = '#9a7456', jer = free ? '#6a8aa8' : '#4a5e74', jerD = free ? '#4e6a88' : '#34465a', cap = free ? '#c9a24a' : '#5a5030';
    if (!free) {
      const cyc = (t * 2.4) % (Math.PI * 2), s = Math.sin(cyc), lean = R(s * 3);   /* catch: forward; drive: back */
      rc(g, x - 5, y - 3, 8, 3, '#2a2a30'); rc(g, x + 2, y - 8, 3, 8, '#2a2a30'); rc(g, x - 1, y - 6, 6, 3, '#3a3a44');   /* sea boots, braced on the footboard */
      rc(g, x - 3 + lean, y - 15, 8, 9, jer); rc(g, x - 3 + lean, y - 15, 2, 9, jerD); for (let i = 0; i < 3; i++) rc(g, x - 3 + lean, y - 13 + i * 3, 8, 1, '#8aa0b4');   /* the jersey, striped */
      rc(g, x - 2 + lean, y - 20, 5, 5, skin); rc(g, x - 2 + lean, y - 18, 5, 1, skinD); rc(g, x - 3 + lean, y - 22, 7, 3, cap); rc(g, x - 3 + lean, y - 20, 7, 1, '#3a3420'); rc(g, x + 1 + lean, y - 19, 1, 1, '#1a1a1a');   /* bowed, cap pulled low */
      const hx = x + 7 + R(-s * 3), hy = y - 12; rc(g, x + 2 + lean, y - 13, hx - x - 2 - lean, 3, skin); rc(g, x + 2 + lean, y - 13, hx - x - 2 - lean, 1, skinD); rc(g, hx, hy - 1, 3, 3, skinD);   /* the arm to the oar */
      rc(g, x + 3, y - 2, 1, 1, '#9aa0a8'); rc(g, x + 5, y - 1, 1, 1, '#6a6e78'); rc(g, x + 7, y - 2, 1, 1, '#9aa0a8'); rc(g, x + 9, y - 1, 1, 1, '#6a6e78'); rc(g, x + 11, y - 2, 1, 1, '#9aa0a8');   /* the chain, ankle to the ring */
      rc(g, x - 4, y - 5, 2, 2, '#4a4e58');   /* the iron on the ankle */
    } else {
      rc(g, x - 4, y - 7, 4, 7, '#3a3a44'); rc(g, x + 1, y - 7, 4, 7, '#3a3a44'); rc(g, x - 4, y - 2, 4, 2, '#2a2a30'); rc(g, x + 1, y - 2, 4, 2, '#2a2a30');
      rc(g, x - 4, y - 16, 9, 10, jer); rc(g, x - 4, y - 16, 2, 10, jerD); for (let i = 0; i < 3; i++) rc(g, x - 4, y - 14 + i * 3, 9, 1, '#a8c0d4');
      rc(g, x - 2, y - 22, 5, 6, skin); rc(g, x - 3, y - 24, 7, 3, cap); rc(g, x - 1, y - 20, 1, 1, '#1a1a1a'); rc(g, x + 1, y - 20, 1, 1, '#1a1a1a'); rc(g, x - 1, y - 18, 3, 1, skinD);
      rc(g, x - 7, y - 15, 3, 7, skin); rc(g, x + 5, y - 14, 3, 5, skin); rc(g, x + 4, y - 9, 3, 3, skinD);   /* one arm down, one hand at the wrist he is rubbing */
      rc(g, x + 8, y - 1, 2, 1, '#9aa0a8'); rc(g, x + 12, y - 1, 1, 1, '#9aa0a8'); rc(g, x + 6, y, 2, 1, '#6a6e78');   /* the broken chain, lying on the thwart */
      const k = (t * 1.2) % 1; g.globalAlpha = 1 - k; rc(g, x - 1, y - 30 - k * 5, 3, 1, '#8fd160'); rc(g, x, y - 31 - k * 5, 1, 3, '#8fd160'); g.globalAlpha = 1;   /* free: a small green glint over him */
    }
  };

  /* ================= THE RIGGING RUN: a yard on its stays ================= */
  A.yard = (g, m, cx, cy, time) => {
    const x = R(m.x - cx), y = R(m.y - cy), w = m.w, ap = y - 64;
    /* the two lifts: lines from the yard's slings up to a block at the apex of the stay, and the stay running on up out of sight */
    stay(g, x + 5, y, x + w / 2, ap, 0, ROPE[1]); stay(g, x + w - 4, y, x + w / 2, ap, 0, ROPE[1]); stay(g, x + w / 2, ap, x + w / 2 - 14, ap - 22, 0, ROPE[2]); stay(g, x + w / 2, ap, x + w / 2 + 10, ap - 22, 0, ROPE[2]);
    block(g, x + w / 2, ap); rc(g, x + w / 2 - 1, ap + 4, 3, 2, ROPE[0]);
    /* the clewed-up sail hanging in folds under the spar: bleached canvas, patched, gaskets round it */
    for (let i = 0; i < w - 6; i++) { const fold = 5 + R(Math.sin(i * 0.9) * 1.5) + (noise(i, 2) > 0.8 ? 1 : 0), sx = x + 3 + i; rc(g, sx, y + 6, 1, fold, i % 5 === 0 ? '#bdb392' : '#e6dcbc'); rc(g, sx, y + 6, 1, 1, '#f4ecd0'); rc(g, sx, y + 5 + fold, 1, 1, '#8a8068'); }
    rc(g, x + 12, y + 8, 5, 4, '#a89668'); rc(g, x + 12, y + 8, 5, 1, '#c9b87c');   /* a patch */
    for (let gx = x + 6; gx < x + w - 4; gx += 8) { rc(g, gx, y + 5, 1, 6, ROPE[2]); }
    spar(g, x, x + w, y, 1, 2);
    rc(g, x - 3, y + 1, 3, 6, '#3a3a44'); rc(g, x + w, y + 1, 3, 6, '#3a3a44');   /* the yardarm caps */
    /* the footrope, slung under it on two stirrups */
    stay(g, x + 3, y + 8, x + 3, y + 14, 0, ROPE[2]); stay(g, x + w - 4, y + 8, x + w - 4, y + 14, 0, ROPE[2]); stay(g, x + 3, y + 14, x + w - 4, y + 14, 3, ROPE[1]);
  };

  /* ================= THE COPPER DOOR (props 'bulkhead'): two tiles of door, riveted copper gone green, the bright metal where a plate is proud ================= */
  A.door = (g, pr, cx, cy, time) => {
    const [sx0, sx1, sy0, sy1] = pr.span, x0 = sx0 * TS - cx, y0 = sy0 * TS - cy, w = (sx1 - sx0 + 1) * TS, h = (sy1 - sy0 + 1) * TS;
    if (x0 > 700 || x0 + w < -10) return;
    if (pr.open) {   /* BLOWN: the two leaves buckled back on their hinges, the frame scorched to the lintel, a smoulder in the gap */
      rc(g, x0, y0 - 4, 3, h + 4, CU[3]); rc(g, x0 + w - 3, y0 - 4, 3, h + 4, CU[3]); rc(g, x0, y0 - 4, 1, h + 4, CU[1]); rc(g, x0 + w - 1, y0 - 4, 1, h + 4, CU[2]);
      for (let i = 0; i < 6; i++) { rc(g, x0 + 3, y0 + i * 10 + 2, 2 + (i % 2), 2, '#2a2420'); rc(g, x0 + w - 5 - (i % 2), y0 + 8 + i * 9, 2, 3, '#2a2420'); }   /* buckled leaves */
      g.globalAlpha = 0.55; for (let i = 0; i < 10; i++) rc(g, x0 + 3 + noise(i, 4) * (w - 6), y0 + noise(i, 8) * h, 3, 5, '#14100c'); g.globalAlpha = 1;
      rc(g, x0, y0 - 5, w, 3, '#2a2420'); if (Math.floor(time * 5) % 2) rc(g, x0 + 8, y0 + h - 4, 3, 1, '#ff9a3c'); smokeAt(g, x0 + w / 2, y0 + 4, time, 2);
      return; }
    const jx = pr.shake > 0 ? R((Math.random() - 0.5) * 3) : 0, X = x0 + jx;
    rc(g, X, y0, w, h, CU[3]);
    for (let i = 0; i < 5; i++) { const px = X + i * (w / 5); rc(g, px, y0, w / 5, h, i % 2 ? CU[2] : CU[1]); rc(g, px, y0, 1, h, CU[3]); rc(g, px + w / 5 - 1, y0, 1, h, CU[0]); }   /* the vertical plates of the sheathing */
    for (let r = 0; r < h; r += 8) { rc(g, X, y0 + r, w, 1, CU[3]); for (let q = 0; q < w; q += 6) { rc(g, X + q + 2, y0 + r + 3, 1, 1, CU[0]); } }   /* the courses and their rivets */
    for (let i = 0; i < 7; i++) { rc(g, X + noise(i, 2) * (w - 4), y0 + noise(i, 9) * h, 3, 2, CU[4]); }   /* a plate lifted: bare metal */
    rc(g, X, y0, 3, h, '#2a2c30'); rc(g, X + w - 3, y0, 3, h, '#2a2c30'); rc(g, X, y0, w, 3, '#2a2c30'); rc(g, X, y0 + h - 3, w, 3, '#2a2c30');   /* the iron frame */
    for (const hy of [y0 + 10, y0 + h - 14]) { rc(g, X + 3, hy, w - 6, 4, '#3a3d44'); rc(g, X + 3, hy, w - 6, 1, '#6e767d'); for (let q = 0; q < w - 6; q += 8) rc(g, X + 5 + q, hy + 1, 2, 2, '#8c4c26'); }   /* the great hinge straps */
    rc(g, X + w / 2 - 1, y0 + 3, 2, h - 6, '#14161a'); rc(g, X + w / 2 - 5, y0 + h / 2 - 3, 4, 6, '#474e55'); rc(g, X + w / 2 + 1, y0 + h / 2 - 3, 4, 6, '#474e55');   /* the meeting of the leaves, and the lock */
    /* the powder-door mark: a keg with a fuse, stencilled in white on the upper leaf, so the player reads WHAT opens it */
    rc(g, X + w / 2 - 6, y0 + 14, 5, 6, '#e8dcc0'); rc(g, X + w / 2 - 6, y0 + 14, 5, 1, '#fff2d0'); rc(g, X + w / 2 + 2, y0 + 14, 5, 6, '#e8dcc0'); rc(g, X + w / 2 - 4, y0 + 11, 1, 3, '#e8dcc0'); rc(g, X + w / 2 + 4, y0 + 11, 1, 3, '#e8dcc0'); rc(g, X + w / 2 - 4, y0 + 10, 1, 1, '#ff9a3c'); rc(g, X + w / 2 + 4, y0 + 10, 1, 1, '#ff9a3c');
    if (pr.hit > 0) { g.globalAlpha = pr.hit; rc(g, X, y0 + h / 2 - 2, w, 4, '#e8dcc0'); g.globalAlpha = 1; }
  };

  /* ================= THE DECK GUN ================= */
  A.gun = (g, pr, cx, cy, time) => {
    const dir = pr.dir || pr.aim || 1, x = R(pr.x - cx), y = R(pr.y - cy), heat = Math.max(0, Math.min(1, (pr.cool || 0) / 7));
    if (x < -50 || x > 700) return;
    const X = (u, w) => dir > 0 ? x + u : x - u - w;   /* local u forward -> screen */
    const r = (u, v, w, h, c) => rc(g, X(u, w), y - v - h, w, h, c);
    /* the carriage: two cheeks on four trucks, an axle bed, a quoin under the breech, a rope breeching round the cascabel */
    r(-12, 3, 24, 7, '#4a3d2c'); r(-12, 3, 24, 1, '#6a5a42'); r(-12, 9, 24, 1, '#2c2318'); r(-13, 1, 6, 6, '#2c2318'); r(7, 1, 6, 6, '#2c2318'); r(-12, 2, 4, 4, '#6a5a42'); r(8, 2, 4, 4, '#6a5a42'); r(-11, 3, 2, 2, '#c9a44c'); r(9, 3, 2, 2, '#c9a44c');
    r(-10, 9, 6, 3, '#6a5a42');   /* the quoin */
    /* the piece: a tapering iron barrel laid forward, bands, a muzzle swell, the vent; it glows when it is hot */
    const bar = ['#2a2c30', '#474e55', '#6e767d'], hot = heat > 0 ? (n => `rgb(${R(60 + heat * 190)},${R(46 + heat * 50)},${R(40)})`) : null;
    for (let u = -10; u < 20; u++) { const hh = u < 4 ? 8 : u < 14 ? 7 : 6, v0 = 10 + (u < 4 ? 0 : 0); r(u, v0, 1, hh, bar[0]); r(u, v0 + hh - 2, 1, 1, bar[2]); r(u, v0 + 1, 1, 1, bar[1]); }
    r(-4, 10, 2, 8, bar[0]); r(6, 10, 2, 7, bar[0]); r(-4, 17, 2, 1, bar[2]); r(6, 16, 2, 1, bar[2]);   /* the reinforce rings */
    r(18, 9, 4, 9, bar[0]); r(18, 16, 4, 1, bar[2]); r(21, 11, 1, 5, '#0a0a0c');   /* the muzzle swell and bore */
    r(-12, 12, 3, 4, bar[0]); r(-14, 13, 2, 2, bar[1]);   /* the cascabel */
    r(-2, 18, 2, 2, '#c9a44c');   /* the vent, brass */
    if (heat > 0) { g.globalAlpha = 0.25 + heat * 0.55; for (let u = -8; u < 18; u++) r(u, 12, 1, 5, '#ff7a30'); g.globalAlpha = 0.6 * heat; r(-2, 18, 4, 1, '#ffd36b'); g.globalAlpha = 1; if (Math.floor(time * 7) % 2 && heat > 0.3) smokeAt(g, X(8, 1), y - 22, time, 2); }
    /* shot racked at its side, a sponge and a rammer on the carriage */
    for (const [u, v] of [[-18, 0], [-14, 0], [-16, 3]]) r(u, v, 4, 4, '#2a2c30'), r(u, v + 3, 2, 1, '#6e767d');
    r(-9, 14, 28, 1, '#8a7040'); r(19, 13, 3, 3, '#c9b890');   /* the rammer, the sponge's head */
    if (pr.smoke > 0) { smokeAt(g, X(24, 1), y - 14, time, 4); }
  };

  /* ================= THE BACK LAYER (behind the bodies): the static pieces ================= */
  A.back = (g, cx, cy, time) => {
    const f = F(); if (!f) return;
    const vis = (x0, x1) => x1 * TS - cx > -40 && x0 * TS - cx < 700, Y = r => r * TS - cy;
    /* ---- the spars: rigging, not planking ---- */
    if (vis(23, 31)) {   /* off the rock: a spar lashed to its lip, a line to the galley's bobstay */
      spar(g, 23 * TS - cx, 27 * TS - cx, Y(26), 1, 1); stay(g, 23 * TS - cx, Y(26) + 3, 22 * TS - cx - 2, Y(26) - 4, 0, ROPE[1]); rc(g, 22 * TS - cx - 4, Y(26) - 6, 3, 8, '#3a3a44'); rc(g, 22 * TS - cx - 4, Y(26) - 6, 1, 8, '#6e767d');
      spar(g, 27 * TS - cx, 31 * TS - cx, Y(24), -1, 3);   /* her BOWSPRIT: tapering to the tip, gammoned at the bow */
      stay(g, 27 * TS - cx, Y(24) + 2, 31 * TS - cx, Y(24) - 56, 3, ROPE[1]); stay(g, 27 * TS - cx + 2, Y(24) + 7, 31 * TS - cx + 6, Y(24) + 38, 2, ROPE[2]); block(g, 27 * TS - cx + 3, Y(24) + 10); }
    if (vis(209, 223)) {   /* the galley's stern boom (off her taffrail, stayed to her mizzen) and the hulk's bow boom */
      spar(g, 209 * TS - cx, 213 * TS - cx, Y(22), 1, 3); stay(g, 213 * TS - cx - 4, Y(22), 209 * TS - cx - 38, Y(22) - 52, 4, ROPE[1]); stay(g, 213 * TS - cx - 2, Y(22) + 6, 209 * TS - cx - 6, Y(22) + 30, 2, ROPE[2]);
      spar(g, 220 * TS - cx, 223 * TS - cx, Y(21), -1, 3); stay(g, 220 * TS - cx + 4, Y(21), 224 * TS - cx + 34, Y(21) - 56, 4, ROPE[1]); stay(g, 220 * TS - cx + 2, Y(21) + 6, 222 * TS - cx + 10, Y(21) + 34, 2, ROPE[2]); }
    if (vis(324, 338)) {   /* THE LASHING: a hawser from mast to mast, laid up in three strands, seized every few feet, backstayed to each mast's head */
      const x0 = 324 * TS - cx, x1 = 338 * TS - cx, y = Y(11); hawser(g, x0, x1, y, 8); rc(g, x0, y + 8, x1 - x0, 1, TAR);
      for (let x = x0 + 14; x < x1 - 8; x += 22) { rc(g, x, y - 1, 2, 10, ROPE[3]); rc(g, x + 2, y - 1, 1, 10, ROPE[0]); }
      for (const [ex, d] of [[x0, 1], [x1 - 6, -1]]) for (let j = 0; j < 3; j++) { rc(g, ex + j * 2, y - 2, 2, 12, j % 2 ? ROPE[2] : ROPE[1]); }   /* the turns round the mastheads */
      stay(g, x0 + 16, y + 8, x0 + 40, y + 24, 2, ROPE[2]); stay(g, x1 - 16, y + 8, x1 - 40, y + 24, 2, ROPE[2]); }
    /* ---- the masts of the rigging run: stepped on a wreck's bones ---- */
    for (const mx of MASTS_BONES) if (vis(mx - 3, mx + 3)) {
      const x0 = (mx - 1) * TS - cx, w = 4 * TS, y0 = Y(30), h = 8 * TS;
      rc(g, x0, y0, w, h, '#101c1a');
      for (let i = 0; i < 5; i++) { const rx = x0 + 4 + i * 12; for (let r = 0; r < h - 10; r += 2) { const bow = Math.sin(r / (h - 10) * Math.PI) * 6; rc(g, rx + (i % 2 ? bow : -bow) * 0.4, y0 + 4 + r, 4, 2, r % 6 < 4 ? '#3a3028' : '#2a2018'); } }   /* the ribs of a drowned hull */
      rc(g, x0, y0 + h - 6, w, 6, '#2a2018'); rc(g, x0, y0 + h - 6, w, 1, '#4a3d2c');   /* the keel */
      for (let i = 0; i < 12; i++) { rc(g, x0 + noise(i + mx, 3) * (w - 4), y0 + noise(i + mx, 6) * (h - 8), 3, 2, '#d4cdb8'); rc(g, x0 + noise(i + mx, 8) * (w - 4), y0 + noise(i + mx, 2) * (h - 8), 2, 6, '#2f5a3a'); }   /* barnacles, weed */
      rc(g, x0 + 20, y0 + 36, 22, 14, '#050808');   /* a hole in her side */
      rc(g, x0 + 2, y0 - 3, w - 4, 3, '#2a2018'); rc(g, x0 + 24, y0 - 10, 14, 10, '#4a3d2c'); rc(g, x0 + 24, y0 - 10, 2, 10, '#6a5a42'); rc(g, x0 + 22, y0 - 4, 18, 2, '#3a3a44');   /* the mast step and its iron collar */ }
    /* ---- the catch-net strung under the first yard ---- */
    if (vis(288, 302)) { const x0 = 288 * TS - cx, x1 = 302 * TS - cx, y = Y(20), n = R((x1 - x0) / 8);
      for (let i = 0; i <= n; i++) { const u = i / n, sag = Math.sin(u * Math.PI) * 3; rc(g, x0 + u * (x1 - x0), y + 1 + sag, 1, 14, ROPE[2]); }
      for (let r = 0; r < 4; r++) for (let i = 0; i < (x1 - x0); i++) { const u = i / (x1 - x0), sag = Math.sin(u * Math.PI) * 3; rc(g, x0 + i, y + 1 + sag + r * 4 + (i % 8 < 4 ? 0 : 1), 1, 1, ROPE[1]); }
      for (let i = 1; i < n; i++) { const u = i / n, sag = Math.sin(u * Math.PI) * 3; rc(g, x0 + u * (x1 - x0) - 1, y + sag, 3, 3, '#d8b070'); rc(g, x0 + u * (x1 - x0), y + sag, 1, 1, '#f4e0a8'); }   /* the cork floats on the head-rope */
      rc(g, x0, y, x1 - x0, 1, ROPE[0]); }
    /* ---- the galley hull ---- */
    if (vis(97, 208)) {
      for (const [a, b] of WELLS) for (const [lx, d] of [[(a - 1) * TS, 1], [(b + 1) * TS, -1]]) {   /* the charred lips: where her stern deck burned off, black down to the grain, burnt ends over the drop */
        const x = lx - cx, y = Y(24), e = d > 0 ? x + TS : x;   /* e: the edge over the well */
        for (let i = 0; i < 14; i++) { const o = d > 0 ? -1 - i : i; rc(g, e + o - (d > 0 ? 0 : 0), y - 1, 1, 2 + R(noise(i + a, 3) * 3), i % 4 === 0 ? '#3a1a10' : '#14100c'); }
        for (let i = 0; i < 4; i++) { const ox = d > 0 ? -2 - i * 4 : 1 + i * 4; rc(g, e + ox, y + 1, 3, 4 + R(noise(i + b, 5) * 6), '#14100c'); rc(g, e + ox, y + 1, 1, 3, '#3a2a1c'); }   /* burnt plank ends overhanging */
        for (let i = 0; i < 3; i++) if (Math.floor(time * 3 + i * 1.7 + a) % 3 === 0) rc(g, e + (d > 0 ? -3 - i * 4 : 2 + i * 4), y - 1, 1, 1, '#ff7a30');   /* embers */
        smokeAt(g, e + (d > 0 ? -6 : 6), y, time * 0.7 + a, 2); }
      /* the stern castle's rib ladder: two tarred ribs and the rungs between, rope-bound; and the crow's nest on the mizzen */
      if (vis(170, 171)) { const x = 170 * TS - cx, y0 = Y(16); for (const rx of [x + 1, x + 11]) { rc(g, rx, y0, 4, 9 * TS, SP[3]); rc(g, rx, y0, 1, 9 * TS, SP[1]); rc(g, rx + 3, y0, 1, 9 * TS, TAR); }
        for (let r = 0; r < 9 * TS; r += 8) { rc(g, x + 5, y0 + r + 2, 6, 3, SP[2]); rc(g, x + 5, y0 + r + 2, 6, 1, SP[0]); rc(g, x + 1, y0 + r + 2, 1, 3, ROPE[1]); rc(g, x + 12, y0 + r + 2, 1, 3, ROPE[1]); } }
      if (vis(177, 184)) { const x0 = 178 * TS - cx, y = Y(3), w = 5 * TS;   /* the crow's nest: a staved tub with a rope rail, a lantern hung off it */
        rc(g, x0 - 2, y + 1, w + 4, 3, SP[3]); for (let i = 0; i < w + 4; i += 4) { rc(g, x0 - 2 + i, y + 4, 3, 12, i % 8 ? SP[2] : SP[3]); rc(g, x0 - 2 + i, y + 4, 1, 12, SP[1]); } rc(g, x0 - 2, y + 8, w + 4, 1, '#3a3a44'); rc(g, x0 - 2, y + 14, w + 4, 1, '#3a3a44');
        for (const sx of [x0 - 2, x0 + w - 2]) { rc(g, sx, y - 12, 3, 13, SP[3]); rc(g, sx, y - 12, 1, 13, SP[1]); } stay(g, x0, y - 11, x0 + w, y - 11, 2, ROPE[1]); stay(g, x0, y - 6, x0 + w, y - 6, 2, ROPE[1]); } }
    /* ---- the powder ship ---- */
    if (vis(452, 479)) {   /* the 'tween deck: a magazine - copper-lined, no iron, its kegs in tiers, felt curtains, shaded lamps through glass */
      const x0 = 452 * TS - cx, x1 = 479 * TS - cx, y0 = Y(26), h = 4 * TS;
      rc(g, x0, y0, x1 - x0, h, '#14221e');
      for (let x = 0; x < x1 - x0; x += 24) { rc(g, x0 + x, y0, 22, h, (x / 24) % 2 ? '#1c3430' : '#183029'); rc(g, x0 + x + 22, y0, 2, h, '#0c1412'); for (let q = 0; q < h; q += 8) rc(g, x0 + x + 3, y0 + q + 3, 1, 1, '#4e9a7f'); }   /* copper-sheathed bulkhead */
      rc(g, x0, y0, x1 - x0, 3, '#2a2018'); rc(g, x0, y0 + h - 3, x1 - x0, 3, '#2a2018');   /* the beams over and under */
      for (let x = 20; x < x1 - x0 - 30; x += 90) { for (let r = 0; r < 2; r++) for (let q = 0; q < 3; q++) { const kx = x0 + x + q * 12, ky = y0 + h - 14 - r * 12; if (noise(x + q + r, 4) > 0.15) { rc(g, kx, ky, 11, 11, '#5a4630'); rc(g, kx, ky, 11, 2, '#8a7454'); rc(g, kx, ky + 3, 11, 1, '#3a3a44'); rc(g, kx, ky + 8, 11, 1, '#3a3a44'); } } }   /* kegs in tiers */
      for (const lx of [x0 + 50, x0 + 250, x0 + 380]) { rc(g, lx, y0 + 3, 1, 8, '#4a4e58'); rc(g, lx - 3, y0 + 11, 7, 8, '#ffd36b'); rc(g, lx - 3, y0 + 11, 7, 1, '#3a3a44'); rc(g, lx - 3, y0 + 18, 7, 1, '#3a3a44'); g.globalAlpha = 0.18; rc(g, lx - 14, y0 + 6, 29, 24, '#ffd36b'); g.globalAlpha = 1; }   /* lamps behind glass: no flame in a magazine */
      rc(g, x0 + 4, y0 + 8, 20, 12, '#d8d0b0'); rc(g, x0 + 6, y0 + 10, 16, 1, '#8a1a1a'); rc(g, x0 + 6, y0 + 13, 12, 1, '#8a1a1a'); }   /* a painted notice: NO SPARK, NO STEEL */
    if (vis(428, 437)) {   /* the fighting top: a floored round top with a barricade of rolled hammocks, knee-braced out from a mast standing dim behind it */
      const x0 = 428 * TS - cx, x1 = 437 * TS - cx, y = Y(17), mx = (x0 + x1) / 2;
      g.globalAlpha = 0.45; rc(g, mx - 5, y, 10, Y(25) - y, SP[3]); rc(g, mx - 5, y, 2, Y(25) - y, SP[2]); rc(g, mx + 3, y, 2, Y(25) - y, TAR); for (let r = y + 20; r < Y(25); r += 40) rc(g, mx - 6, r, 12, 2, '#3a3a44'); g.globalAlpha = 1;   /* the mast, behind */
      spar(g, x0, x1, y, 1, 0); for (let i = 0; i < 8; i++) { rc(g, x0 + 4 + i * 16, y + 8, 2, 12 - (i % 3) * 2, i % 2 ? ROPE[2] : ROPE[1]); }   /* the floor, over its crosstrees' lanyards */
      for (const [bx, d] of [[x0 + 10, 1], [x1 - 10, -1]]) for (let i = 0; i < 12; i++) rc(g, bx + d * i, y + 8 + i, 2, 2, SP[2]);   /* the knee-braces */
      for (let i = 0; i < 9; i++) { rc(g, x0 + 2 + i * 15, y - 7, 12, 6, i % 2 ? '#c9b890' : '#d8cca8'); rc(g, x0 + 2 + i * 15, y - 7, 12, 1, '#f0e8cc'); rc(g, x0 + 7 + i * 15, y - 7, 1, 6, ROPE[2]); }   /* the barricade of hammocks */ }
    if (vis(458, 461)) {   /* the mainmast stands in its partners: a wall across her, deck to top */
      const x0 = 458 * TS - cx, w = 3 * TS, y0 = Y(10), h = 15 * TS;
      rc(g, x0, y0, w, h, '#2c2318');
      rc(g, x0 + 4, y0, w - 8, h, SP[3]); rc(g, x0 + 4, y0, 3, h, SP[0]); rc(g, x0 + 7, y0, 6, h, SP[1]); rc(g, x0 + 13, y0, 14, h, SP[2]); rc(g, x0 + w - 11, y0, 7, h, SP[3]); rc(g, x0 + w - 6, y0, 2, h, TAR);   /* the round of the mast, lit from the left */
      for (let r = 0; r < h; r += 28) { rc(g, x0 + 3, y0 + r + 6, w - 6, 3, '#3a3a44'); rc(g, x0 + 3, y0 + r + 6, w - 6, 1, '#6e767d'); for (let q = 0; q < 4; q++) rc(g, x0 + 7 + q * 10, y0 + r + 7, 2, 1, '#8c4c26'); }   /* its iron hoops, rivetted */
      for (let r = 14; r < h; r += 56) { for (let j = 0; j < 4; j++) rc(g, x0 + 3, y0 + r + j * 2, w - 6, 1, j % 2 ? ROPE[1] : ROPE[2]); }   /* the woolding: a wrap of rope */
      const by = y0 + h - 44; rc(g, x0 - 2, by, w + 4, 10, '#4a3d2c'); rc(g, x0 - 2, by, w + 4, 2, SP[1]); rc(g, x0 - 2, by + 8, w + 4, 2, TAR);   /* the fife rail round it */
      for (let q = 0; q < 6; q++) { rc(g, x0 + 2 + q * 8, by - 8, 2, 8, '#c9b890'); rc(g, x0 + 2 + q * 8, by - 8, 2, 2, '#e8dcc0'); }   /* belaying pins */
      for (const sx of [x0 - 4, x0 + w]) for (let r = 0; r < 5; r++) { rc(g, sx, y0 + h - 30 + r * 7, 4, 3, SP[2]); rc(g, sx, y0 + h - 30 + r * 7, 4, 1, SP[0]); }   /* the partners' wedges, driven round the heel */ }
    /* ---- the crate hatch: shut, or blown ---- */
    if (vis(452, 457)) {
      const x0 = 452 * TS - cx, w = 5 * TS, y = Y(25), shut = ctx.tileAt(454, 25) === ctx.crate;
      if (shut) {
        rc(g, x0, y, w, TS, '#4a3d2c'); for (let i = 0; i < 5; i++) { rc(g, x0 + i * TS, y, TS - 1, TS, i % 2 ? '#6a5a42' : '#5a4a36'); rc(g, x0 + i * TS, y, TS - 1, 2, '#8a7454'); rc(g, x0 + i * TS + 3, y + 4, 2, 2, TAR); rc(g, x0 + i * TS + TS - 6, y + 4, 2, 2, TAR); }   /* powder crates laid flush */
        rc(g, x0, y + 5, w, 2, '#3a3a44'); rc(g, x0, y + 5, w, 1, '#6e767d');   /* an iron batten across them */
        for (let i = 0; i < 4; i++) { rc(g, x0 + 8 + i * 22, y + 2, 14, 8, '#d8d0b0'); rc(g, x0 + 10 + i * 22, y + 4, 10, 1, '#8a1a1a'); }   /* PRIVATE stencils */
        for (const hx of [x0 + 2, x0 + w - 6]) { rc(g, hx, y - 3, 4, 3, '#3a3a44'); } }
      else {   /* BLOWN: a ragged hole, charred joists, a scorch up the mainmast wall, embers */
        rc(g, x0, y, 3, 12, '#14100c'); rc(g, x0 + w - 3, y, 3, 12, '#14100c');
        for (let i = 0; i < 6; i++) { rc(g, x0 + 3 + i * 13, y, 3, 5 + R(noise(i, 4) * 6), '#14100c'); rc(g, x0 + 3 + i * 13, y, 1, 3, '#3a2a1c'); }   /* the joist stubs */
        g.globalAlpha = 0.5; rc(g, x0 - 10, y - 30, w + 20, 30, '#14100c'); g.globalAlpha = 1; if (Math.floor(time * 6) % 2) rc(g, x0 + 20, y + 2, 2, 1, '#ff9a3c'); smokeAt(g, x0 + w / 2, y, time, 3); } }
  };
  return A;
}
