// src/redraw/hurricane3_art.js - THE HURRICANE DECK 3's ART PASS (claude/hurricane3art; the ART LIST of work/claude/lane-done/claude-hurricane3.md).
// DRAWING ONLY: no tile, entity, number, hitbox or timing is touched (src/level.js is unchanged, so the level hash is unchanged). It replaces the greybox of src/hurricane3.js
// (masts, yards, stays, sails, rods, the tarred net, the casks, the gauge, the sea) with the SHIP KIT of the Hurricane 2 and the Flotilla 3 (src/hurricane2-art.js exports its
// palette and primitives as A.kit), so the three ships read as one. THE RULE FOR EVERY TIMBER ABOARD: it is rigging - round tarred spars, hooped masts, laid rope - never a log.
//   tile(t, x, y)            the tile pass (called by src/hurricane2-art.js on L.h3): yards (T.ONEWAY) as tarred spars, the mizzen's top, the boat's gunwale
//   drawBack(g, cx, cy, time, S)   behind the bodies: masts + tops, yards' footropes and furled sails, stays and lifts, the boat in her davits, the gust sails, the rain in a gust
//   drawOver(g, cx, cy, time, S)   over them: the rods (spike, conductor chain, charge, bolt), the tarred net and its burning, the waist's foam
//   cask(g, m, x, y, time)    a cask: staves, hoops, bung; the lashing that parts; the heel's roll
//   sea(g, p, ...)            the outside sea: a dark storm sea with whitecaps, spindrift, the undertow, and a tide-mark of wet on her hull
//   hud(g, ...)               the waterline gauge: her hull and rigging, the sea climbing her
//   column(g, ...)            the masthead rod's blue column on every yard (the Captain's fight)
import { rc, hash, SP, SALT, TAR, ROPE, IRON, CAN } from '../hurricane2-art.js';

const R = Math.round, TS = 16;

/* every walkable spar of the ship, [x0, x1, row, kind] (tile columns of theHurricane() in src/level.js; kinds are the Hurricane 2's spar kinds) */
const YARDS = [
  [286, 293, 19, 'gaff'], [296, 299, 19, 'gaff'], [302, 315, 19, 'gaff'],      /* T1 the topsail yard (the lowest of his three) */
  [290, 299, 14, 'gaff'], [302, 311, 14, 'gaff'],                                /* T2 the topgallant */
  [293, 299, 9, 'gaff'], [302, 308, 9, 'gaff'],                                  /* T3 the royal, under the masthead rod */
  [280, 335, 29, 'main'],                                                        /* THE MAIN YARD (a sail clewed up under it) */
  [338, 393, 23, 'top'],                                                         /* the topmast run: a cracked topmast, woolded */
  [396, 407, 22, 'gaff'], [416, 425, 24, 'gaff'], [432, 439, 24, 'gaff'],        /* the stays' spars */
  [294, 307, 24, 'gaff'],                                                        /* the main top's cross-trees run */
  [118, 124, 33, 'top']];                                                        /* her boat's gunwale on its davits */
const TOPS = [[456, 463, 30], [466, 470, 30]];
/* her houses (SOLID blocks above her main deck, row 35 = the deck's last row): [x0, x1, y0, y1, kind] */
const HOUSES = [[79, 88, 32, 35, 'fore'], [151, 168, 33, 35, 'galley'], [304, 327, 30, 35, 'main'], [384, 398, 31, 35, 'cabin']];
const BOATS = [199, 204, 34, 35];   /* her boats on their chocks, past the breach */                                   /* the mizzen's top: a grating on cross-trees */
const MASTS = [
  { id: 'h3main', x: 301 * TS, top: 3 * TS, base: 36 * TS, w: 12, truck: true },
  { id: 'h3fore', x: 173 * TS, top: 13 * TS, base: 36 * TS, w: 11, truck: true, fell: 0 },
  { id: 'h3miz14', x: 467 * TS, top: 14 * TS, base: 36 * TS, w: 11, truck: true, rodTop: true },
  { id: 'h3miz30', x: 467 * TS, top: 30 * TS, base: 36 * TS, w: 11, truck: false, rodTop: true }];
const TIERS = [19, 14, 9];   /* the mainmast's tops: crosstrees where each of his yards crosses it */

export function makeHurricane3Art(ctx, K) {
  const A = {};
  const { bake, ln, block, knot, spar, topT, rigOf, pole, caskSpr, roof, wall } = K;
  const clear = bake('h3clear', TS, TS, () => {});
  const inY = (x, y) => { for (const [x0, x1, row, kind] of YARDS) if (y === row && x >= x0 && x <= x1) return [x0, x1, row, kind]; return null; };

  /* ============ THE TILE PASS ============ */
  A.tile = (t, x, y) => {
    if (t === ctx.T.ONEWAY) {
      const Y = inY(x, y); if (Y) return spar(x - Y[0], Y[1] - Y[0] + 1, Y[3]);
      for (const [x0, x1, row] of TOPS) if (y === row && x >= x0 && x <= x1) return topT(x - x0, x1 - x0 + 1);
    }
    if (t === ctx.T.SOLID) {
      if (x >= BOATS[0] && x <= BOATS[1] && y >= BOATS[2] && y <= BOATS[3]) return clear;   /* her boats are drawn whole (drawBack) */
      for (const [x0, x1, y0, y1, kind] of HOUSES) if (x >= x0 && x <= x1 && y >= y0 && y <= y1) {
        if (y === y0) return roof(x - x0, x1 - x0 + 1, x);
        if (y === y1) return wall('sill', x & 1);
        if (y === y0 + 1 && (x - x0) % 4 === 2 && x > x0 && x < x1) return wall('port', x & 1);
        return wall('plain', (x * 7 + y) & 3); }
    }
    return null;
  };

  /* ============ the rope that hangs: a laid line, sagging, with a seizing every so often (a stay or a lift) ============ */
  const stay = (g, cx, cy, vw, ax, ay, bx, by, sag = 4, w = 1) => {
    ln(g, cx, cy, vw, ax, ay, bx, by, sag, w, ROPE);
    const L = Math.hypot(bx - ax, by - ay); if (L < 40) return;
    for (let u = 0.12; u < 0.95; u += 0.19) { const x = ax + (bx - ax) * u, y = ay + (by - ay) * u + Math.sin(u * Math.PI) * sag; if (x < cx - 6 || x > cx + vw + 6) continue; rc(g, x - cx - 1, y - cy - 1, 3, 3, ROPE[3]); rc(g, x - cx - 1, y - cy - 1, 2, 1, ROPE[1]); }   /* the seizing */
  };
  const deadeye = (g, x, y) => { rc(g, x - 2, y - 2, 5, 5, '#3a2e22'); rc(g, x - 1, y - 1, 3, 3, TAR); rc(g, x - 2, y - 2, 4, 1, '#7a6a4a'); rc(g, x, y, 1, 1, '#c9a44c'); };

  /* ============ THE MAST: tops and crosstrees where his yards cross it, the sky's wet on it ============ */
  const mastTop = (g, sx, ty) => {   /* a top (a small fighting platform's cross-trees and hounds) */
    rc(g, sx - 15, ty, 30, 3, SP[2]); rc(g, sx - 15, ty, 30, 1, SP[0]); rc(g, sx - 15, ty + 3, 30, 1, TAR);
    for (let k = -14; k < 14; k += 5) rc(g, sx + k, ty, 1, 3, SP[4]);
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) rc(g, sx + s * (5 + i) - (s < 0 ? 1 : 0), ty + 4 + i, 1, 1, SP[3]);   /* the knees */
    rc(g, sx - 15, ty - 1, 2, 5, IRON[1]); rc(g, sx + 13, ty - 1, 2, 5, IRON[1]); rc(g, sx - 15, ty - 1, 1, 5, IRON[0]);
    rc(g, sx - 7, ty + 4, 14, 2, IRON[1]); rc(g, sx - 7, ty + 4, 14, 1, IRON[0]);   /* the hounds' band */
  };
  const masts = (g, cx, cy, vw, time, S) => {
    const r2 = S && S.rods.find(r => r.id === 'r2'), felled0 = ctx.felledDown(0);
    for (const m of MASTS) {
      if (m.fell !== undefined && ctx.felledDown(m.fell)) continue;
      if (m.id === 'h3miz14' && r2 && r2.done) continue; if (m.id === 'h3miz30' && !(r2 && r2.done)) continue;
      if (m.x < cx - 40 || m.x > cx + vw + 40) continue;
      const s = pole(m); g.drawImage(s, R(m.x - (s.width >> 1) - cx), R(m.top - 12 - cy));
      if (m.id === 'h3main') for (const row of TIERS) mastTop(g, R(m.x - cx), R(row * TS - cy) - 6);
      /* the storm on it: a wet gloss that runs, and the sky's St Elmo's fire at the truck */
      const sx = R(m.x - cx), top = R(m.top - cy);
      for (let i = 0; i < 4; i++) { const yy = top + ((i * 97 + R(time * 40)) % Math.max(20, R(m.base - m.top))); rc(g, sx - 3 + (i % 3) * 3, yy, 1, 4, 'rgba(190,225,235,0.35)'); }
      if (m.truck) { const k = 0.5 + 0.5 * Math.sin(time * 9 + m.x); g.globalAlpha = 0.25 + 0.4 * k; rc(g, sx - 1, top - 9, 3, 3, '#9ab8ff'); rc(g, sx - 2, top - 8, 5, 1, '#dfe8ff'); g.globalAlpha = 1; }
      /* the pennant at her truck, flying hard to leeward */
      if (m.truck && m.id !== 'h3fore') { const fl = Math.sin(time * 14) * 1.5; for (let i = 0; i < 14; i++) rc(g, sx + 2 + i, top - 11 + R(fl * (i / 6)) + (i > 8 ? 1 : 0), 1, Math.max(1, 3 - (i >> 2)), i % 5 < 2 ? '#c0392b' : '#8a1f1f'); }
    }
    return felled0;
  };

  /* ============ THE YARDS' RIGGING: a footrope on stirrups under every spar, a sail clewed up under the main yard, the parrels at the mast ============ */
  const yards = (g, cx, cy, vw, time) => {
    const fd = ctx.felledDown;
    for (const [x0, x1, row, kind] of YARDS) {
      if (x1 * TS < cx - 40 || x0 * TS > cx + vw + 40) continue;
      if (row === 33) continue;   /* the boat's gunwale has its own */
      if (x1 - x0 < 2) continue;
      g.drawImage(rigOf(kind, x1 - x0 + 1), R(x0 * TS - cx), R(row * TS - cy));
    }
    /* the parrel where a tier meets the mast: turns of tarred cord and a knot */
    for (const row of TIERS) { const y = row * TS - cy, mx = 301 * TS - cx; if (mx < -20 || mx > vw + 20) continue; for (let q = 0; q < 4; q++) rc(g, mx - 8, y - 1 + q * 2, 16, 1, q % 2 ? ROPE[3] : ROPE[1]); knot(g, mx - 8, y + 3); knot(g, mx + 8, y + 3); }
    return fd;
  };

  /* ============ HER BOAT IN HER DAVITS: a clinker-built ship's boat on chocks, a canvas cover lashed over her, oars shipped ============ */
  const boatSpr = bake('h3boat', 132, 44, (g) => {
    for (let x = 0; x < 132; x++) { const k = (x - 66) / 66, drop = Math.round(14 * (1 - Math.sqrt(Math.max(0, 1 - k * k * 0.9))) * 0 + 12 * k * k), top = 8 + Math.round(2 * k * k * (k < 0 ? 1 : 1.3));
      for (let y = top; y < 30 + drop; y++) { const st = ((y - top) / 5) | 0, c = y === top ? SP[0] : y === top + 1 ? SP[1] : (y - top) % 5 === 0 ? SP[4] : st % 2 ? SP[2] : SP[3]; rc(g, x, y, 1, 1, c); if (hash(x, y, 3) > 0.96) rc(g, x, y, 1, 1, SALT); } }
    rc(g, 0, 8, 132, 2, '#c9a44c'); rc(g, 0, 8, 132, 1, '#f0d890'); rc(g, 0, 10, 132, 1, '#5a4630');   /* the gunwale's gilt rubbing strake */
    for (let x = 4; x < 128; x += 9) rc(g, x, 12, 1, 1, IRON[0]);   /* rivets in her clinker laps */
    rc(g, 6, 12, 120, 3, 'rgba(10,8,6,0.55)');   /* the shadow of the cover's edge */
    for (let x = 8; x < 124; x++) { const k = (x - 66) / 58, lift = Math.round(5 * (1 - k * k)); for (let y = 0; y < 8 + lift; y++) { const yy = 9 - lift + y; if (yy < 0 || yy > 11) continue; rc(g, x, yy, 1, 1, y < 2 ? CAN[0] : y < 5 ? CAN[1] : CAN[2]); } }   /* the cover over her thwarts */
    for (let x = 22; x < 118; x += 22) { rc(g, x, 2, 1, 11, ROPE[2]); rc(g, x + 1, 3, 1, 10, ROPE[3]); }   /* its lashings */
    rc(g, 10, 0, 112, 1, SP[3]); for (const ox of [-6, 130]) rc(g, Math.max(0, ox), 5, 6, 2, SP[1]);   /* oars shipped, their blades over her ends */
    rc(g, 0, 15, 4, 8, SP[2]); rc(g, 128, 15, 4, 8, SP[2]); rc(g, 0, 15, 1, 8, SP[0]);   /* stem and stern posts */
  });
  const boat = (g, cx, cy, time) => {
    const x0 = 118 * TS, x1 = 125 * TS; if (x1 < cx - 40 || x0 > cx + 360) return;
    const y = 33 * TS - cy - 6, x = R(x0 - 10 - cx), sw = R(Math.sin(time * 2.2) * 0.6);
    g.drawImage(boatSpr, x, y + sw);
    for (const dx of [-56, 56]) { const px = R(x0 + (x1 - x0) / 2 + dx - cx);   /* the davits: a tarred post and a curved head, a block and a fall to each end of her */
      rc(g, px - 2, y - 12, 4, 12 + 3 * TS, IRON[1]); rc(g, px - 2, y - 12, 1, 12 + 3 * TS, IRON[0]); rc(g, px + 1, y - 12, 1, 12 + 3 * TS, IRON[2]);
      rc(g, px - (dx > 0 ? 12 : -2), y - 14, 14, 3, IRON[1]); rc(g, px - (dx > 0 ? 12 : -2), y - 14, 14, 1, IRON[0]); block(g, px + (dx > 0 ? -10 : 10), y - 12);
      for (let k = 0; k < 2; k++) rc(g, px + (dx > 0 ? -10 : 10) - 1 + k, y - 9, 1, 12, k ? ROPE[2] : ROPE[1]);   /* the fall */ }
    for (const px of [x + 22, x + 112]) { rc(g, px, y + 36 + sw, 14, 3, SP[3]); rc(g, px, y + 36 + sw, 14, 1, SP[1]); rc(g, px + 2, y + 39, 3, 5, SP[4]); rc(g, px + 9, y + 39, 3, 5, SP[4]); }   /* her chocks */
  };

  /* HER BOATS ON THEIR CHOCKS past the breach: two ship's boats keel up, lashed down with a gripe, a chock under each end */
  const chocks = bake('h3chocks', 100, 34, (g) => {
    rc(g, 0, 8, 100, 26, '#14100a');
    for (let b = 0; b < 2; b++) { const x0 = 4 + b * 48, w = 44;
      for (let x = 0; x < w; x++) { const k = (x - w / 2) / (w / 2), top = 4 + Math.round(8 * k * k * k * k + 5 * k * k);
        for (let y = top; y < 26; y++) { const st = (((y - top) / 4) | 0), c = y === top ? SP[0] : y === top + 1 ? SP[1] : (y - top) % 4 === 0 ? SP[4] : st % 2 ? SP[2] : SP[3]; rc(g, x0 + x, y, 1, 1, c); if (hash(x, y, b) > 0.95) rc(g, x0 + x, y, 1, 1, SALT); } }
      rc(g, x0 + 4, 20, w - 8, 2, '#c9a44c'); rc(g, x0 + 4, 20, w - 8, 1, '#f0d890');
      for (const gx of [x0 + 12, x0 + w - 14]) { for (let k = 0; k < 2; k++) rc(g, gx + k, 3, 1, 25, k ? ROPE[2] : ROPE[1]); rc(g, gx - 1, 26, 4, 3, IRON[1]); }
      rc(g, x0 + 2, 26, 8, 6, SP[3]); rc(g, x0 + 2, 26, 8, 1, SP[1]); rc(g, x0 + w - 10, 26, 8, 6, SP[3]); rc(g, x0 + w - 10, 26, 8, 1, SP[1]); }
  });
  const boats = (g, cx, cy) => { const x0 = BOATS[0] * TS - cx; if (x0 < -110 || x0 > ctx.VW() + 10) return; g.drawImage(chocks, R(x0 - 2), R(BOATS[2] * TS - cy - 2)); };

  /* ============ THE GUST SAILS: tarred canvas on a gaff, filling, flogging at the tell, with reef points and a patch ============ */
  const sails = (g, cx, cy, vw, time, S) => {
    for (const s of (ctx.L.h3.sails || [])) { const z = (ctx.L.gusts || [])[s.gust]; const G = z ? ctx.gustNow(z) : { on: false, tell: -1, dir: 1 };
      const dir = G.dir || 1, fill = G.on ? 1 : G.tell >= 0 ? G.tell : 0.08, flog = G.tell >= 0 ? (Math.floor(time * 16) % 2 ? 2 : -1) : 0, x = R(s.x * TS + 8 - cx), y0 = R(s.y0 * TS - cy), h = (s.y1 - s.y0) * TS;
      if (x < -70 || x > vw + 70) continue;
      const bulge = (4 + 17 * fill) * dir + flog * dir;
      for (let k = 0; k < h; k++) {   /* the cloth: rows of it, belly curved by the wind, the weather leech frayed */
        const u = k / h, bx = Math.sin(u * Math.PI) * bulge, w = Math.abs(bx) + 1, xa = bx >= 0 ? x : x + bx;
        const seam = k % 7 === 6, c = seam ? CAN[3] : u < 0.18 ? CAN[0] : u < 0.7 ? CAN[1] : CAN[2];
        rc(g, xa, y0 + k, w, 1, c);
        if (bx !== 0) { rc(g, bx >= 0 ? xa + w - 1 : xa, y0 + k, 1, 1, ROPE[2]); }   /* the leech's bolt rope */
        if (!seam && fill > 0.5 && (k * 13 + R(time * 20)) % 11 === 0) rc(g, xa + ((k * 7) % Math.max(1, w)), y0 + k, 1, 1, CAN[0]);   /* wind-lit canvas */
        if (G.tell >= 0 && (k * 5) % 13 === 0) rc(g, bx >= 0 ? xa + w : xa - 2, y0 + k, 2, 1, CAN[2]);   /* it frays and flogs */
      }
      for (let k = 6; k < h - 4; k += 14) for (let q = 0; q < Math.abs(bulge); q += 4) rc(g, (bulge >= 0 ? x + q : x + bulge + q) + 1, y0 + k + 2, 1, 3, ROPE[2]);   /* reef points hanging from a reefband */
      rc(g, x - 1, y0 - 3, 3, h + 6, SP[2]); rc(g, x - 1, y0 - 3, 1, h + 6, SP[0]); rc(g, x + 1, y0 - 3, 1, h + 6, SP[4]);   /* its gaff / mast hoops */
      for (let k = 0; k < h; k += 12) { rc(g, x - 2, y0 + k + 2, 5, 2, IRON[1]); rc(g, x - 2, y0 + k + 2, 5, 1, IRON[0]); }   /* the hoops */
      rc(g, x + dir * 3, y0 + h * 0.4, Math.max(2, 4), 5, CAN[3]);   /* a patch */
      if (G.tell >= 0 && Math.floor(time * 8) % 2) ctx.text('SNAP', x + dir * 16, y0 - 7, '#ffd36b', 'center', 5);
    }
  };
  /* THE RAIN where a gust blows: long streaks slanting to leeward, harder than the sky's */
  const gustRain = (g, cx, cy, vw, time) => {
    for (const z of (ctx.L.gusts || [])) { if (z.arena && !ctx.bossActive()) continue; if (z.x1 < cx || z.x0 > cx + vw) continue; const G = ctx.gustNow(z); if (!G.on && !(G.tell >= 0)) continue;
      const on = G.on ? 1 : 0.35; g.globalAlpha = 0.55 * on;
      for (let k = 0; k < 44; k++) { const x = z.x0 + ((k * 61 + time * (G.on ? 380 : 120)) % Math.max(1, z.x1 - z.x0)), y = z.y0 + ((k * 37 + time * 440) % Math.max(1, z.y1 - z.y0)), d = G.dir || 1;
        for (let i = 0; i < 4; i++) rc(g, x - cx + d * i * 2, y - cy + i, 1, 1, i < 2 ? '#e8f4fc' : '#8fa8c0'); }
      g.globalAlpha = 1;
      /* a gust is also a line of wind: pale streaks racing along it */
      g.globalAlpha = 0.28 * on; for (let k = 0; k < 8; k++) { const d = G.dir || 1, y = z.y0 + ((k * 53) % Math.max(1, z.y1 - z.y0)), x = z.x0 + ((k * 83 + time * 520 * d + 100000) % Math.max(1, z.x1 - z.x0)); rc(g, x - cx, y - cy, 14, 1, '#cfe2f2'); } g.globalAlpha = 1; }
  };

  /* ============ THE WAIST'S FOAM LINE: where the sea will stand, while the bell tolls ============ */
  const foam = (g, cx, cy, time, S) => {
    for (const f of S.floods) { const p = (ctx.L.pools || []).find(q => q.h3flood === f.id); if (!p) continue;
      if (f.ph === 'warn') { const a = 0.55 + 0.4 * Math.sin(time * 12); g.globalAlpha = a;
        for (let x = p.x0; x < p.x1; x += 5) { const sx = x - cx; if (sx < -8 || sx > ctx.VW() + 8) continue; const w = 3 + ((x * 7) % 3), up = (Math.sin(time * 9 + x * 0.4) > 0.3) ? 1 : 0; rc(g, sx, p.hiY - cy - 2 - up, w, 2 + up, '#eefaff'); rc(g, sx + 1, p.hiY - cy - 4 - up, 1, 1, '#bfe6f5'); } g.globalAlpha = 1; }
      if (f.k > 0.03 && f.k < 1) { for (let x = p.x0 + 3; x < p.x1; x += 11) { const sx = x - cx; if (sx < -4 || sx > ctx.VW() + 4) continue; const y = p.y - cy; rc(g, sx, y - 3 - R(Math.sin(time * 7 + x) * 1.5), 2, 1, '#eefaff'); } }   /* sloshing crests */
    }
  };

  /* ============ THE DRAW BACK ============ */
  A.drawBack = (g, cx, cy, time, S) => {
    const vw = ctx.VW();
    masts(g, cx, cy, vw, time, S);
    yards(g, cx, cy, vw, time);
    boat(g, cx, cy, time); boats(g, cx, cy);
    /* HER STAYS: the mizzen-main stay from her mizzen masthead to the main top, and the lifts every stays platform hangs on */
    const r2 = S && S.rods.find(r => r.id === 'r2');
    const sx0 = 467 * TS, sy0 = (r2 && r2.done ? 26 : 14) * TS, sx1 = 302 * TS, sy1 = 24 * TS, stayY = x => sy0 + (sy1 - sy0) * (x - sx0) / (sx1 - sx0);
    if (Math.max(sx0, sx1) > cx - 40 && Math.min(sx0, sx1) < cx + vw + 40) { stay(g, cx, cy, vw, sx0, sy0, sx1, sy1, 6, 2); deadeye(g, sx0 - cx, sy0 - cy); deadeye(g, sx1 - cx, sy1 - cy); }
    for (const m of (ctx.L.ents || [])) { if (m.t !== 'mast' || !m.h3) continue; const x = m.x * TS + 8; if (x < cx - 80 || x > cx + vw + 80) continue;
      if (m.h3 === 'stay') { const y = (m.y + 1) * TS; for (const dx of [-40, 40]) { stay(g, cx, cy, vw, x + dx, stayY(x + dx), x + dx, y, 0, 1); block(g, R(x + dx - cx), R(stayY(x + dx) - cy)); } } }
    sails(g, cx, cy, vw, time, S);
    gustRain(g, cx, cy, vw, time);
  };

  /* ============ THE RODS: a pointed iron spike on a bronze collar, a conductor chain of real links with copper clamps, the charge crawling down it ============ */
  const jag = (g, x0, y0, x1, y1, seed, col) => {   /* a jagged bolt between two points, laid in three passes */
    const n = Math.max(4, R(Math.hypot(x1 - x0, y1 - y0) / 5)); let px = x0, py = y0;
    for (let i = 1; i <= n; i++) { const u = i / n, x = x0 + (x1 - x0) * u + (i < n ? (hash(i, seed) - 0.5) * 12 : 0), y = y0 + (y1 - y0) * u, k = Math.max(Math.abs(x - px), Math.abs(y - py), 1);
      for (let q = 0; q <= k; q++) { const bx = R(px + (x - px) * q / k), by = R(py + (y - py) * q / k); rc(g, bx - 1, by, 3, 1, col[0]); rc(g, bx, by, 1, 1, col[1]); } px = x; py = y; }
  };
  const rod = (g, r, cx, cy, time, k, told, glow, bolt) => {
    const tx = r.top[0] * TS + 8 - cx, ty = r.top[1] * TS - cy;
    /* the spike: a tapered iron point on a bronze collar and a stout stem */
    rc(g, tx - 2, ty - 4, 5, 4, '#8a6a2a'); rc(g, tx - 2, ty - 4, 5, 1, '#e0b84c'); rc(g, tx - 2, ty - 1, 5, 1, '#4a3418');
    for (let i = 0; i < 14; i++) { const w = i < 3 ? 1 : i < 8 ? 1 : 2; rc(g, tx - (w >> 1) - (i > 9 ? 0 : 0), ty - 5 - i, w + (i > 9 ? 1 : 0), 1, i % 4 === 0 ? IRON[0] : IRON[1]); }
    rc(g, tx - 1, ty - 19, 1, 3, told ? '#dfe8ff' : IRON[0]);
    for (const s of [-1, 1]) { rc(g, tx + s * 2 - (s < 0 ? 1 : 0), ty - 10, 2, 1, IRON[1]); rc(g, tx + s * 3 - (s < 0 ? 1 : 0), ty - 11, 1, 1, IRON[0]); }   /* the side points */
    /* St Elmo's fire at the point as it charges */
    if (k > 0.05 && !r.done) { const a = Math.min(1, k) * (told ? 0.7 + 0.3 * Math.sin(time * 30) : 0.35); g.globalAlpha = a;
      rc(g, tx - 3, ty - 24, 7, 7, '#9ab8ff'); rc(g, tx - 2, ty - 23, 5, 5, '#dfe8ff'); rc(g, tx - 1, ty - 22, 3, 3, '#ffffff');
      for (let i = 0; i < 6; i++) { const a2 = time * 11 + i * 1.05, rr = 6 + (i % 3) * 3; rc(g, tx + Math.cos(a2) * rr, ty - 21 + Math.sin(a2) * rr, 1, 1, i % 2 ? '#dfe8ff' : '#9ab8ff'); } g.globalAlpha = 1; }
    if (glow > 0) { g.globalAlpha = Math.min(1, glow * 1.6); rc(g, tx - 9, ty - 31, 19, 19, '#9ab8ff'); rc(g, tx - 6, ty - 28, 13, 13, '#dfe8ff'); rc(g, tx - 3, ty - 25, 7, 7, '#ffffff'); g.globalAlpha = 1; }
    if (r.boss) return;
    /* the conductor: copper strap links hung from the point to the iron, laid down the mast; copper clamps; it crawls blue when charged */
    const ex = r.x * TS + 8 - cx, ey = (r.y + 1) * TS - 4 - cy, n = Math.max(4, R(Math.hypot(ex - tx, ey - ty) / 4));
    for (let i = 0; i <= n; i++) { const u = i / n, x = tx + (ex - tx) * u + Math.sin(u * 9 + time * 2) * (r.connected ? 0 : 2), y = ty + (ey - ty) * u, lit = told && (i + Math.floor(time * 24)) % 4 === 0;
      if (i % 2) { rc(g, x - 1, y, 3, 2, lit ? '#dfe8ff' : r.connected ? '#9a9aa6' : '#6a6a76'); rc(g, x - 1, y, 3, 1, lit ? '#ffffff' : r.connected ? '#c0c0cc' : '#8a8a96'); } else { rc(g, x, y - 1, 1, 4, lit ? '#9ab8ff' : IRON[1]); rc(g, x + 1, y, 1, 2, IRON[2]); }
      if (i % 9 === 4) { rc(g, x - 2, y, 5, 3, '#8a6a2a'); rc(g, x - 2, y, 5, 1, '#e0b84c'); } }
    if (told && n > 3) for (let j = 0; j < 2; j++) { const u = ((time * 3 + j * 0.5) % 1), x = tx + (ex - tx) * u, y = ty + (ey - ty) * u; rc(g, x - 2, y - 2, 5, 5, '#9ab8ff'); rc(g, x - 1, y - 1, 3, 3, '#ffffff'); }   /* a charge running down the chain */
    /* the chain's end: an iron shoe on a bolted plate, the eye the chain is STRUCK onto */
    rc(g, ex - 6, ey - 1, 12, 5, '#22222a'); rc(g, ex - 6, ey - 1, 12, 1, IRON[0]); for (const bx of [-5, 4]) rc(g, ex + bx, ey + 1, 2, 2, IRON[0]);
    rc(g, ex - 3, ey - 5, 6, 5, r.connected ? '#9ab8ff' : IRON[1]); rc(g, ex - 2, ey - 4, 4, 3, r.connected ? '#dfe8ff' : '#14141a'); rc(g, ex - 3, ey - 5, 6, 1, r.connected ? '#ffffff' : IRON[0]);
    if (r.connected && !r.done) { g.globalAlpha = 0.4 + 0.3 * Math.sin(time * 14); rc(g, ex - 8, ey - 8, 16, 14, '#9ab8ff'); g.globalAlpha = 1; }
    if (bolt > 0) { g.globalAlpha = Math.min(1, bolt * 3); jag(g, tx, ty - 20, ex, ey, Math.floor(time * 30) % 7, ['#9ab8ff', '#ffffff']); g.globalAlpha = 1; }
  };
  /* THE TARRED NET over the main hatch: tarred cargo net, knotted at every crossing, over a hatch coaming and its battens; burning when rod 1 has had it */
  const net = (g, r, cx, cy, time) => {
    const [x0, x1, y0, y1] = r.burn, vw = ctx.VW(); const ax = x0 * TS - cx, ay = y0 * TS - cy, w = (x1 - x0 + 1) * TS, h = (y1 - y0 + 1) * TS;
    if (ax + w < 0 || ax > vw) return;
    if (!r.done) {
      rc(g, ax, ay, w, h, '#120e0a');
      for (let i = -h; i < w; i += 6) { for (let q = 0; q < h; q++) { const x = ax + i + q; if (x >= ax && x < ax + w) { rc(g, x, ay + q, 1, 1, '#3a2c1a'); } const x2 = ax + i + h - q; if (x2 >= ax && x2 < ax + w) rc(g, x2, ay + q, 1, 1, '#2e2314'); } }   /* the mesh */
      for (let i = 0; i < w; i += 6) for (let q = 0; q < h; q += 6) { rc(g, ax + i + 2, ay + q + 2, 3, 3, '#6a5230'); rc(g, ax + i + 2, ay + q + 2, 2, 1, '#9a7a48'); }   /* the knots */
      rc(g, ax, ay, w, 2, '#4a3a22'); rc(g, ax, ay, w, 1, SP[1]); rc(g, ax, ay + h - 2, w, 2, '#1a1510'); rc(g, ax - 2, ay, 2, h, IRON[1]); rc(g, ax + w, ay, 2, h, IRON[1]);   /* the coaming and the iron it is lashed to */
      if (R(time * 3) % 7 === 0) rc(g, ax + ((R(time * 11) * 7) % w), ay + 1, 1, 1, '#9ab8ff');   /* the iron prickles in the storm */
    } else if (r.burnT > 0) {   /* the burning: embers and a low flame along what was the net, smoke leaning away */
      const k = Math.min(1, r.burnT / 3);
      for (let i = 0; i < 28; i++) { const x = ax + ((i * 37 + R(time * 20)) % w), up = (R(time * 18 + i * 5) % 12), c = i % 3 === 0 ? '#ffd36b' : i % 3 === 1 ? '#ff9a5c' : '#e0502c'; g.globalAlpha = k * (1 - up / 14); rc(g, x, ay + h - 2 - up, 2, 2 + (i & 1), c); }
      g.globalAlpha = k * 0.5; for (let i = 0; i < 5; i++) { const sm = ((time * 0.5 + i * 0.2) % 1); rc(g, ax + 8 + i * (w / 5) + sm * 14, ay - 4 - sm * 30, 4 - R(sm * 3), 4 - R(sm * 3), '#7a8088'); } g.globalAlpha = 1;
      for (let x = 0; x < w; x += 5) rc(g, ax + x, ay + h - 3, 3, 3, '#1a1510');   /* the charred ends of it */ }
  };
  A.drawOver = (g, cx, cy, time, S) => {
    const vw = ctx.VW();
    for (const r of S.rods) { const tx = r.top[0] * TS + 8, ex = r.x * TS + 8; if (Math.max(tx, ex) < cx - 40 || Math.min(tx, ex) > cx + vw + 40) continue;
      const k = r.boss ? S.boss.charge : r.charge, told = r.boss ? ctx.rodTold(k) : k > 1 - ctx.H3.rodTell / ctx.H3.rodCharge, glow = r.boss ? S.boss.glow : r.glow, bolt = r.boss ? S.boss.bolt : r.bolt;
      rod(g, r, cx, cy, time, k, told, glow, bolt);
      if (!r.boss && !r.done && !r.connected && Math.abs(ctx.hero().x - (ex)) < 90) ctx.text('STRIKE THE CHAIN', ex - cx, (r.y + 1) * TS - 4 - 30 - cy, '#9ab8ff', 'center', 5); }
    const r1 = S.rods.find(r => r.burn); if (r1) net(g, r1, cx, cy, time);
    foam(g, cx, cy, time, S);
  };

  /* ============ A CASK: oak staves in a barrel's swell, iron hoops, a bung; lashed with a rope that parts, rolling with a motion smear ============ */
  A.cask = (g, m, x, y, time, hurt) => {
    const rolling = Math.abs(m.vx) > 4, ph = rolling ? (Math.floor(time * 10 * Math.sign(m.vx)) & 1) : 0;
    if (rolling) { g.globalAlpha = 0.25; rc(g, x - Math.sign(m.vx) * 6, y + 3, 14, 9, '#14100a'); g.globalAlpha = 1; }
    g.drawImage(caskSpr, x + 1, y);
    if (ph) { rc(g, x + 3, y + 3, 1, 10, 'rgba(0,0,0,0.3)'); rc(g, x + 9, y + 3, 1, 10, 'rgba(255,255,255,0.12)'); } else { rc(g, x + 6, y + 3, 1, 10, 'rgba(255,255,255,0.12)'); }
    if (m.lashed) {   /* the lashing: three turns over the head to two ring-bolts, the end tied off - STRIKE it */
      for (let i = 0; i < 3; i++) { rc(g, x - 1, y + 4 + i * 3, 18, 1, i === 1 ? ROPE[0] : ROPE[1]); rc(g, x - 1, y + 5 + i * 3, 18, 1, ROPE[3]); }
      rc(g, x - 3, y + 11, 4, 4, IRON[1]); rc(g, x - 3, y + 11, 4, 1, IRON[0]); rc(g, x + 15, y + 11, 4, 4, IRON[1]); rc(g, x + 15, y + 11, 4, 1, IRON[0]);
      knot(g, x + 8, y + 7); if (Math.floor(time * 2) % 2) rc(g, x + 12, y + 3, 1, 1, '#ffffff');
    } else if (!rolling) {   /* the parted end of it, hanging off the ring-bolt, and her chocks */
      rc(g, x - 3, y + 11, 4, 4, IRON[1]); rc(g, x - 3, y + 11, 4, 1, IRON[0]); for (let i = 0; i < 4; i++) rc(g, x - 2 + (i & 1), y + 15 - 4 + i, 1, 1, i % 2 ? ROPE[1] : ROPE[0]);
      rc(g, x - 1, y + 14, 3, 2, SP[3]); rc(g, x + 14, y + 14, 3, 2, SP[3]); }
    if (hurt) rc(g, x + (m.vx > 0 ? 14 : 0), y - 3, 2, 2, '#ff6b6b');
  };

  /* ============ THE SEA: a dark storm sea. Whitecaps run on it, spindrift flies off it, the undertow draws dark lines down; a tide-mark of wet on her hull ============ */
  A.sea = (g, p, x0, x1, y, h, cx, cy, time, flood) => {
    const vw = ctx.VW();
    g.globalAlpha = 0.5; g.fillStyle = '#071820'; g.fillRect(x0, y + 3, x1 - x0, Math.max(0, h - 3)); g.globalAlpha = 1;
    const gr = g.createLinearGradient(0, y, 0, y + 90); gr.addColorStop(0, 'rgba(40,110,124,0.55)'); gr.addColorStop(0.2, 'rgba(14,50,64,0.35)'); gr.addColorStop(1, 'rgba(3,10,16,0)'); g.fillStyle = gr; g.fillRect(x0, y, x1 - x0, 90);
    /* the swell: two crests sliding across, a dark trough under each */
    for (let layer = 0; layer < 2; layer++) { const sp = layer ? 1.7 : 1.1, wl = layer ? 31 : 53;
      for (let x = Math.floor(p.x0 / 2) * 2; x < p.x1; x += 2) { const sx = x - cx; if (sx < x0 - 2 || sx > x1) continue; const ph = Math.sin(time * sp + x / wl * 6.28 + layer * 2), yy = y + 5 + layer * 9 + R(ph * 2);
        g.globalAlpha = layer ? 0.32 : 0.5; rc(g, sx, yy, 2, 1, layer ? '#2e7a88' : '#4a98a4'); if (ph > 0.7) rc(g, sx, yy - 1, 2, 1, '#9ad0d8'); g.globalAlpha = 1; } }
    /* the surface: a thick dark line, the crest, with foam where it breaks */
    for (let x = Math.floor(p.x0 / 2) * 2; x < p.x1; x += 2) { const sx = x - cx; if (sx < x0 - 2 || sx > x1) continue; const w1 = Math.sin(time * 2.1 + x * 0.09), w2 = Math.sin(time * 3.7 + x * 0.21), top = y + R(w1 * 1.6 + w2 * 0.8);
      rc(g, sx, top, 2, 2, '#1a5260'); rc(g, sx, top, 2, 1, w1 + w2 > 1.1 ? '#eefaff' : '#7ab8c4');
      if (w1 + w2 > 1.5) { rc(g, sx, top - 1, 2, 1, '#eefaff'); if (hash(x, Math.floor(time * 6)) > 0.55) rc(g, sx + 1, top - 3 - R(hash(x, 2) * 2), 1, 1, '#dff0f5'); } }   /* a whitecap, and its spindrift */
    /* spindrift: spray torn off the crests and flung to leeward */
    g.globalAlpha = 0.6; for (let k = 0; k < 18; k++) { const bx = p.x0 + ((k * 211 + time * 140) % Math.max(1, p.x1 - p.x0)), sx = bx - cx; if (sx < x0 || sx > x1) continue; const up = (time * 30 + k * 7) % 22; rc(g, sx, y - 2 - up * 0.6, 2, 1, '#cfe6ec'); rc(g, sx + 3, y - 1 - up * 0.6, 1, 1, '#9ec4cc'); } g.globalAlpha = 1;
    if (flood) { for (let k = 0; k < 5; k++) { const bx = p.x0 + 40 + ((k * 197 + R(time * 14)) % Math.max(1, p.x1 - p.x0 - 80)) , sx = bx - cx; if (sx < x0 || sx > x1) continue; const by = y + 1 + R(Math.sin(time * 2 + k * 3) * 1.5); rc(g, sx, by - 3, 11 + (k % 3) * 4, 3, SP[3]); rc(g, sx, by - 3, 11 + (k % 3) * 4, 1, SP[0]); rc(g, sx + 11, by - 4, 2, 3, SP[1]); } return; }   /* the waist's flood: a stave, a plank, a coil of rope adrift on it - and no undertow */
    /* the undertow: dark streaks drawn down and in, where it drains you */
    g.globalAlpha = 0.5; for (let k = 0; k < 14; k++) { const bx = p.x0 + ((k * 173 + 40) % Math.max(1, p.x1 - p.x0)), sx = bx - cx; if (sx < x0 || sx > x1) continue; const len = 10 + (k * 5) % 16, off = (time * 12 + k * 9) % 18; rc(g, sx + R(Math.sin(time + k) * 3), y + 10 + off, 1, len, '#03080c'); rc(g, sx + 1 + R(Math.sin(time + k) * 3), y + 10 + off, 1, len >> 1, '#1a4a58'); } g.globalAlpha = 1;
    /* the wet she wears: her planking darkened above the sea where it has been, weed and drips (only on tiles that are hull: left to the tile colour) */
    g.globalAlpha = 0.18; g.fillStyle = '#02080c'; g.fillRect(x0, y - 7, x1 - x0, 7); g.globalAlpha = 1;
    for (let x = Math.floor(p.x0 / 7) * 7; x < p.x1; x += 7) { const sx = x - cx; if (sx < x0 || sx > x1) continue; if (hash(x, 4) > 0.55) rc(g, sx, y - 4 - R(hash(x, 5) * 3), 1, 3, 'rgba(120,170,176,0.35)'); }
  };

  /* ============ THE GAUGE: her hull in section with her three masts and their rigging, the sea climbing her ============ */
  A.hud = (g, S, time, vw) => {
    const x = vw - 62, y = 22, w = 44, h = 22;
    g.globalAlpha = 0.9; rc(g, x - 3, y - 3, w + 6, h + 6, '#0c1218'); g.globalAlpha = 1; rc(g, x - 3, y - 3, w + 6, 1, '#6a5a3a'); rc(g, x - 3, y + h + 2, w + 6, 1, '#3a2e1c'); rc(g, x - 3, y - 3, 1, h + 6, '#6a5a3a'); rc(g, x + w + 2, y - 3, 1, h + 6, '#3a2e1c');
    for (const mx of [10, 22, 34]) { rc(g, x + mx, y + 1, 1, 10, '#8a7454'); rc(g, x + mx - 3, y + 3, 7, 1, '#6a5a42'); rc(g, x + mx - 2, y + 6, 5, 1, '#6a5a42'); rc(g, x + mx, y, 1, 1, '#e0cc9c'); }   /* her masts, with yards */
    for (const [a, b] of [[10, 22], [22, 34]]) for (let i = 0; i <= 6; i++) rc(g, x + a + ((b - a) * i) / 6, y + 2 + Math.sin(i / 6 * Math.PI) * 1.5, 1, 1, '#b59a62');   /* stays between */
    rc(g, x + 3, y + 10, w - 6, 7, '#5a4630'); rc(g, x + 3, y + 10, w - 6, 1, '#a07a4a'); rc(g, x + 1, y + 10, 3, 3, '#5a4630'); rc(g, x + w - 3, y + 11, 3, 5, '#4a3a28'); rc(g, x + 5, y + 14, w - 10, 1, '#c9a44c');   /* her hull, bow and poop, a gold wale */
    for (const px of [12, 20, 28, 36]) rc(g, x + px, y + 12, 2, 1, '#14212a');   /* gunports */
    const lvl = Math.min(1, S.gauge / 4.5), wy = R(y + h - 2 - lvl * (h - 4)), hot = S.groan > 0 && Math.floor(time * 8) % 2;
    g.globalAlpha = 0.78; rc(g, x, wy, w, y + h - wy, hot ? '#ff6b6b' : '#1e5a68'); g.globalAlpha = 1;
    for (let i = 0; i < w; i += 3) rc(g, x + i, wy - (Math.sin(time * 4 + i) > 0.4 ? 1 : 0), 2, 1, '#eefaff');   /* the waves along the water's top */
    for (let i = 0; i < 5; i++) rc(g, x + 2 + i * 9, y + h - 1, 1, 1, '#0c1218');
  };

  /* ============ THE MASTHEAD ROD's COLUMN in his fight: a jagged blue column on every yard, bright and marked in its last two seconds ============ */
  A.column = (g, rx, tiers, k, told, time, cy, cam) => {
    for (const t of tiers) { const ty = R(t.row * TS - cy), halfW = 28; const a = told ? 0.35 + 0.35 * Math.sin(time * 24) : 0.08 + 0.12 * k;
      g.globalAlpha = a; g.fillStyle = '#9ab8ff'; g.fillRect(rx - halfW, ty - 30, halfW * 2, 30); g.globalAlpha = 1;
      for (let i = 0; i < 6; i++) { const x = rx - halfW + 4 + ((i * 9 + R(time * 6)) % (halfW * 2 - 8)); g.globalAlpha = told ? 0.9 : 0.3 + 0.4 * k; rc(g, x, ty - 3 - ((R(time * 20) + i * 7) % 26), 1, 3 + (i % 3), '#dfe8ff'); } g.globalAlpha = 1;
      if (told) { rc(g, rx - halfW, ty - 1, halfW * 2, 2, '#dfe8ff'); for (const s of [-1, 1]) for (let q = 0; q < 4; q++) rc(g, rx + s * (halfW - 1) - (s > 0 ? 1 : 0), ty - 2 - q * 7, 1, 4, '#ffffff'); jag(g, rx + R(Math.sin(time * 30) * 6), ty - 28, rx, ty, Math.floor(time * 20) % 9, ['#9ab8ff', '#ffffff']); } }
  };
  /* BRACE!'s sweep: a breaking crest of green water and foam racing along a yard */
  A.crest = (g, sx, ty, dir, time) => {
    for (let q = 0; q < 30; q++) { const y = ty - 3 - q, k = q / 30, w = R(7 - k * 4), bx = sx - dir * R(q * 0.5) * (q > 14 ? -1 : 1); g.globalAlpha = 0.85 - k * 0.35; rc(g, bx - w, y, w * 2, 1, q < 8 ? '#2e7a88' : q < 20 ? '#7ab8c4' : '#eefaff'); }
    g.globalAlpha = 0.9; for (let i = 0; i < 10; i++) rc(g, sx + dir * (i * 2 + R(time * 40) % 5) - 6 * dir, ty - 4 - ((i * 7 + R(time * 33)) % 30), 2, 1, '#ffffff'); g.globalAlpha = 1;
  };
  return A;
}
