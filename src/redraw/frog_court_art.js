// frog_court_art.js - THE CROAKING COURT's art pass (claude/frogking2art). ART ONLY: the grid is read for how a cell is DRAWN, never changed (src/frog-court.js owns the
// geometry and every number; src/frog-king.js the fight).
//   THE ROYAL PADS  the three solid blocks (cols 705-711, 726-732, 747-758 from row 18) are GIANT ROYAL LILY PADS standing on thick stems out of the water: a deep green
//                   saucer with a bright lit rim, gold veins fanning from the stem, a notch cut in its lip, a pale underside curling at the ends and root tendrils hanging
//                   from it; the stems are knuckled bundles with root flares under the leaf and foam round the waterline. The third is his THRONE BANK: a lotus fan opens
//                   behind the throne, lantern poles flank it, reeds stand round all three.
//   THE LANES       drift of bound reed clumps behind the gaps, foam where the water laps the royal pad's feet; a swirl where a leaf is held under (RESHUFFLE: lilypad.js)
//   HIS POND STIRS  (phase 2) the whole court's water churns: ring after ring runs out of the deep, bubbles boil up, the surface goes dark and green
//   THE LEAP        a spray trails him through the air, a ring and a crown of drops at the pad he leaves and a big splash-down at the pad he lands on
//   THE FLOP        the belly-flop's wave over a lane is a standing water crest (rings, foam), not a heap of mud
//   THE TONGUE      a ribbed tongue with a sticky bulb for a tip and a drip; in phase 2 it runs angrier (red) and a longer lash trails spit
// Palette = the marsh's own (bog oak, reed cord, moss) from marsh2_art. Everything static is baked once and blitted.
import { canvas, fillPoly } from '../px.js';
import { OAK, CORD, CORD_D, MOSS, P, R } from './marsh2_art.js';
import { reshuffleRead } from './lilypad.js';

const hash = (a, b) => { let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return (h ^ (h >>> 16)) >>> 0; };
const rnd = (a, b, m) => hash(a, b) % m;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const SURF = 19 * 16;   /* the court's water top (src/frog-court.js: pools y 19*TS) */
const TOP = 18 * 16;    /* a royal pad's standing line */
const LEAF = { rim: '#d6f59a', rimHi: '#fff6b0', top: '#3e9a5c', topL: '#6fc682', topD: '#2c7a40', body: '#1f5530', bodyD: '#143a22', under: '#0e2a1a', pale: '#a9bd62', gold: '#e0b040', goldHi: '#ffe27a', goldD: '#9a7020' };
const STEM = { out: '#10281a', lit: '#5a9a52', mid: '#347a40', dim: '#245c34', dark: '#173f27', moss: '#8fd160', pore: '#143a22' };
/* the stems under each pad: [x in the pad's pixels, width] by pad width in tiles (7, 7, 12); they sway a pixel or so with the depth */
const STEMS = { 7: [[19, 7], [49, 14], [87, 7]], 12: [[20, 12], [90, 14], [160, 12]] };
const NOTCH = [0.3, 0.66, -1];   /* where the lip's notch is, by pad (none on the throne bank: the lotus is there) */
const sway = (wy, k) => Math.round(Math.sin(wy * 0.11 + k * 1.7) * 1.3);
const blank = () => once('blank', () => canvas(16, 16)[0]);
/* one stem pixel: r 0..1 across it, wy the world row, u the pad's pixel column; shaded lit-left, with pores (a lotus stalk is spongy, not jointed) */
const stemPx = (r, wy, u, pi, edge) => {
  if (edge) return STEM.out;
  if (rnd(u + pi * 9, wy, 29) === 0) return STEM.moss;
  if ((wy + (r > 0.5 ? 3 : 0)) % 6 === 0 && r > 0.22 && r < 0.78) return STEM.pore;
  if (rnd(u, wy + 5, 17) === 0) return STEM.dark;
  return r < 0.26 ? STEM.lit : r < 0.6 ? STEM.mid : r < 0.86 ? STEM.dim : STEM.dark;
};
const stemRange = (pi, n, k, wy) => { const [sx, sw] = (STEMS[n] || STEMS[7])[k]; const o = sway(wy, k + pi); return [sx + o, sx + o + sw]; };

/* ================= THE TILES ================= */
export function tile(t, x, y, at, T, L) {
  const C = L.frogCourt; if (!C || t !== T.SOLID || y < 18) return null;
  for (let i = 0; i < C.royal.length; i++) { const [a, b] = C.royal[i]; if (x >= a && x <= b) return y === 18 ? padTile(i, x - a, b - a + 1) : y <= 21 ? blank() : null; }   /* rows 19-21: the stems are drawn in the water (drawWater); the bed below stays the bed */
  return null;
}
function padTile(pi, ci, n) {
  return once('pad' + pi + ',' + ci, () => {
    const [c, g] = canvas(16, 16), N = n * 16, nst = (STEMS[n] || STEMS[7]).length;
    for (let py = 0; py < 16; py++) for (let px = 0; px < 16; px++) {
      const u = ci * 16 + px, wy = 18 * 16 + py, tt = (u + 0.5) / N * 2 - 1, at = Math.abs(tt);
      const top = at > 0.9 ? Math.round((at - 0.9) / 0.1 * 3) : 0, bot = 11 - Math.floor(tt * tt * 5), rel = py - top;
      if (rel >= 0 && py <= bot) {
        let col;
        const nu = NOTCH[pi] >= 0 ? Math.round(N * NOTCH[pi]) : -99;
        if (Math.abs(u - nu) < 3 - (rel >> 1) && rel <= 3) col = u === nu ? LEAF.under : LEAF.gold;   /* the notch: a V cut in the lip, its edges gilt */
        else if (rel === 0) col = rnd(u, 3, 9) === 0 ? LEAF.rimHi : LEAF.rim;                         /* the bright rim the hero stands on */
        else if (rel <= 3) {                                                                          /* the lit top, seen at a graze: gold veins fanning from the stem */
          col = tt < -0.15 ? (rnd(u, wy, 5) === 0 ? LEAF.topL : LEAF.top) : (rnd(u, wy, 6) === 0 ? LEAF.topD : LEAF.top);
          for (let v = 1; v <= 7; v++) { const vu = N * v / 8, sl = (vu - N / 2) / N * rel * 3.2; if (Math.abs(u - (vu + sl)) < 0.6) col = rel === 1 ? LEAF.goldHi : LEAF.gold; }
        } else if (rel === 4 && py < bot - 2) col = u % 4 < 2 ? '#b88a30' : LEAF.bodyD;                  /* a gilt trim along the lip, dashed */
        else if (py >= bot - 1) col = py === bot && at > 0.5 ? LEAF.pale : LEAF.under;             /* the underlip, the pale underside curling at the ends */
        else col = rnd(u, wy, 7) === 0 ? LEAF.topD : (py >= bot - 3 ? LEAF.bodyD : LEAF.body);
        P(g, col, px, py); continue;
      }
      if (py > bot) {
        let done = false;
        for (let k = 0; k < nst && !done; k++) { const [s0, s1] = stemRange(pi, n, k, wy), fl = py - bot <= 2 ? 1 : 0;   /* the stem rises into the leaf's underside, flaring */
          if (u >= s0 - fl && u < s1 + fl) { const r = (u - s0) / Math.max(1, s1 - s0 - 1); P(g, stemPx(Math.max(0, Math.min(1, r)), wy, u, pi, u === s0 - fl || u === s1 + fl - 1), px, py); done = true; } }
        if (!done && rnd(u, 41, 13) === 0 && py <= bot + 3 + rnd(u, 5, 3)) P(g, '#1f4f2c', px, py);   /* a hanging root tendril */
      }
    }
    return c;
  });
}
/* the stems in the water: rows 19-21 (48 px) of a whole pad, darkening with depth, a flare where they leave the surface, roots splaying into the bed */
const mixHex = (h, k) => { const q = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), t = [11, 34, 36]; return '#' + q.map((v, i) => Math.round(v + (t[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
function stemSheet(pi, n) {
  return once('sheet' + pi + ',' + n, () => {
    const N = n * 16, [c, g] = canvas(N, 48), sts = STEMS[n] || STEMS[7];
    const WROWS = ['#b7bbb8', '#9fb0a6', '#7d8d7e', '#6a7e72', '#566e62', '#2a4a44', '#0a1618', '#1f342d'];   /* the lane's own surface band, then its dark gradient down to the bed */
    for (let y = 0; y < 48; y++) { const k = Math.max(0, (y - 8) / 40); g.fillStyle = y < 8 ? WROWS[y] : mixHex('#2a4038', 0).replace(/.*/, '#' + [0x2a + (0x08 - 0x2a) * k, 0x40 + (0x10 - 0x40) * k, 0x38 + (0x17 - 0x38) * k].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')); g.fillRect(0, y, N, 1); }
    for (let y = 0; y < 48; y++) { const wy = 19 * 16 + y, dk = Math.min(0.62, y / 48 * 0.7);
      sts.forEach((st, k) => { const [s0, s1] = stemRange(pi, n, k, wy), fl = y < 5 ? 2 - (y >> 1) : 0;
        for (let u = s0 - fl; u < s1 + fl; u++) { const r = (u - s0) / Math.max(1, s1 - s0 - 1); P(g, mixHex(stemPx(Math.max(0, Math.min(1, r)), wy, u, pi, u === s0 - fl || u === s1 + fl - 1), dk), u, y); } }); }
    sts.forEach(([sx, sw], k) => { for (const d of [-1, 1]) for (let rt = 0; rt < 2; rt++) {   /* roots splaying out along the bed */
      let x = d < 0 ? sx + 1 : sx + sw - 2, y = 36 + rt * 3; const len = 9 + rt * 5 + rnd(pi, k * 5 + rt, 5);
      for (let i = 0; i < len; i++) { x += d * (i < 3 ? 0.5 : 1); y += i < 3 ? 1 : (i % 4 === 0 ? 1 : 0); if (y > 47 || x < 0 || x >= N) break; P(g, mixHex(i & 1 ? '#245c34' : '#173f27', 0.5), Math.round(x), Math.round(y)); P(g, mixHex('#173f27', 0.55), Math.round(x), Math.min(47, Math.round(y) + 1)); } } });
    g.fillStyle = '#eefaff'; for (const [sx, sw] of sts) { g.fillRect(sx - 4, 0, 3, 1); g.fillRect(sx + sw + 1, 0, 3, 1); g.fillRect(sx - 6, 1, 3, 1); g.fillRect(sx + sw + 3, 1, 3, 1); }
    g.fillStyle = '#bfe6f5'; g.fillRect(0, 0, 4, 1); g.fillRect(2, 1, 3, 1); g.fillRect(N - 4, 0, 4, 1); g.fillRect(N - 5, 1, 3, 1);   /* the water lapping at the stems and the pad's feet, baked */
    return c;
  });
}

/* ================= THE SPRITES (baked once) ================= */
/* a bound reed clump: stalks fanning from a root, blades curling, cattail heads */
function reedClump(seed, h) {
  return once('reed' + seed + ',' + h, () => {
    const w = 38, [c, g] = canvas(w, h + 8), base = h + 6, n = 6 + rnd(seed, 1, 3);
    const RD = ['#1d3320', '#2f4a26', '#3f6a30', '#4a7a3a', '#5a8a4a', '#7fb24e'];
    for (let i = 0; i < n; i++) {
      const sx = 6 + rnd(seed, i * 3 + 1, w - 12), hh = Math.round(h * (0.5 + rnd(seed, i * 3 + 2, 50) / 100)), lean = (rnd(seed, i * 3 + 3, 11) - 5) / 5 * 6, thick = hh > 28 ? 2 : 1;
      let tx = sx, ty = base;
      for (let y = 0; y <= hh; y++) { const x = Math.round(sx + lean * Math.pow(y / hh, 1.7)); tx = x; ty = base - y; P(g, y % 7 === 3 ? RD[0] : RD[2], x, ty); if (thick > 1) P(g, y % 7 === 3 ? RD[1] : RD[4], x + 1, ty); P(g, RD[5], x + (thick > 1 ? 1 : 0), ty - (y % 3 === 0 ? 0 : 0)); if (y % 7 === 3) P(g, CORD_D, x, ty); }
      if (rnd(seed, i + 80, 3) === 0) { for (let k = 0; k < 6; k++) { R(g, k === 0 || k === 5 ? '#4a2a14' : '#7a4a22', tx - 1, ty - k - 1, 3, 1); P(g, '#b87a3a', tx, ty - k - 1); } P(g, '#3a2a18', tx, ty - 8); P(g, '#5a8a4a', tx, ty - 9); P(g, '#5a8a4a', tx, ty - 10); }   /* a cattail head */
      else { const d = lean >= 0 ? 1 : -1; for (let k = 0; k < 9; k++) { const bx = tx + d * Math.round(k * 0.9), by = ty + Math.round(k * k * 0.07) - 1; P(g, RD[4], bx, by); P(g, RD[3], bx, by + 1); if (k < 6) P(g, RD[5], bx, by - 1); } }   /* a long blade curling over */
      if (hh > 20 && rnd(seed, i + 120, 2) === 0) { const d = -(lean >= 0 ? 1 : -1), by0 = base - Math.round(hh * 0.45); for (let k = 0; k < 10; k++) { const bx = Math.round(sx + lean * 0.3) + d * k, by = by0 - Math.round(k * 1.1) + Math.round(k * k * 0.06); P(g, RD[3], bx, by); P(g, RD[2], bx, by + 1); } }   /* a leaf blade off the stalk */
    }
    for (let x = 4; x < w - 4; x++) if (rnd(seed, x + 200, 4) !== 0) { P(g, '#1f3a22', x, base + 1); P(g, '#2f4a26', x, base); if (rnd(seed, x + 300, 3) === 0) P(g, '#3f6a30', x, base - 1); }
    R(g, CORD, 14, base - 7, 10, 1); R(g, CORD_D, 14, base - 6, 10, 1);   /* the cord binding it */
    return c;
  });
}
/* a lotus bloom: layered pink petals (each a polygon from the cup, shaded lit-left, a vein down it) round a gold heart, in a green cup; big = the throne's fan */
function lotus(big) {
  return once('lotus' + big, () => {
    const w = big ? 124 : 28, h = big ? 92 : 22, [c, g] = canvas(w, h), cx = w / 2, by = h - 4;
    const PET = ['#8a3a56', '#c0607c', '#e48ea4', '#f8c4d0', '#fff0f2'];
    const petal = (ang, len, wid, base, lite) => {
      const dx = Math.sin(ang), dy = -Math.cos(ang) * 0.92, nx = Math.cos(ang), ny = Math.sin(ang) * 0.92;
      const pt = (t, s) => [cx + dx * len * t + nx * wid * s, by + dy * len * t + ny * wid * s];
      fillPoly(g, [pt(0, 0.35), pt(0.35, 1), pt(0.75, 0.8), pt(1, 0), pt(0.75, -0.8), pt(0.35, -1), pt(0, -0.35)], PET[0]);
      fillPoly(g, [pt(0.05, 0.25), pt(0.38, 0.8), pt(0.74, 0.55), pt(0.95, 0), pt(0.74, -0.7), pt(0.38, -0.85), pt(0.05, -0.25)], base);
      fillPoly(g, [pt(0.1, -0.1), pt(0.38, -0.7), pt(0.7, -0.5), pt(0.9, -0.05)], lite);
      for (let t = 0.15; t < 0.85; t += 0.08) P(g, PET[0], Math.round(pt(t, 0.02)[0]), Math.round(pt(t, 0.02)[1]));
    };
    const L0 = big ? 58 : 13, W0 = big ? 14 : 4;
    for (const a of [-1.35, 1.35]) petal(a, L0 * 0.75, W0, PET[1], PET[2]);
    for (const a of [-0.95, 0.95]) petal(a, L0 * 0.9, W0, PET[2], PET[3]);
    for (const a of [-0.5, 0.5]) petal(a, L0 * 0.98, W0, PET[2], PET[3]);
    petal(0, L0, W0 + 1, PET[3], PET[4]);
    for (let i = -3; i <= 3; i++) { const sx = Math.round(cx + i * (big ? 3 : 1)), sh = (big ? 12 : 3) - Math.abs(i); R(g, '#e8b030', sx, by - sh, 1, sh); P(g, '#fff1a0', sx, by - sh); }
    R(g, '#2f6a3a', cx - (big ? 10 : 4), by + 1, big ? 21 : 9, 3); R(g, '#1f4a2a', cx - (big ? 10 : 4), by + 3, big ? 21 : 9, 1); P(g, '#5aa05a', cx - 2, by + 1);
    return c;
  });
}
/* a lantern on a crook of bog oak: pole, crook, rope, a paper lantern with a gilt cap; its glow is baked apart */
function lanternPole(h) {
  return once('lpole' + h, () => {
    const w = 22, [c, g] = canvas(w, h), x0 = 4;
    for (let y = 8; y < h; y++) { const bend = y < 18 ? Math.round((18 - y) * 0.35) : 0; R(g, OAK[2], x0 + bend, y, 3, 1); P(g, OAK[4], x0 + bend, y); P(g, OAK[0], x0 + bend + 2, y); if (y % 14 === 6) { R(g, CORD, x0 + bend - 1, y, 5, 1); P(g, CORD_D, x0 + bend - 1, y + 1); } }
    R(g, OAK[3], x0 + 2, 6, 11, 2); R(g, OAK[1], x0 + 2, 7, 11, 1); R(g, OAK[3], x0 + 11, 7, 2, 2);          /* the crook */
    P(g, CORD, x0 + 12, 9); P(g, CORD, x0 + 12, 10);
    R(g, '#6a4a14', x0 + 9, 11, 7, 1); R(g, '#e8b040', x0 + 9, 12, 7, 1);                                       /* the gilt cap */
    for (let y = 13; y < 21; y++) for (let x = x0 + 9; x < x0 + 16; x++) P(g, x === x0 + 9 || x === x0 + 15 ? '#c8681e' : (x === x0 + 12 ? '#fff0b0' : '#ffd36b'), x, y);   /* the lantern, a pale paper seam */
    R(g, '#e08a2a', x0 + 9, 21, 7, 1); P(g, '#fff6c8', x0 + 11, 16); P(g, '#fff6c8', x0 + 13, 15);
    return c;
  });
}
const GLOW = (() => { let c = null; return () => { if (c) return c; let g; [c, g] = canvas(36, 36); for (let r = 17; r > 0; r--) { g.globalAlpha = 0.02 + (17 - r) * 0.011; g.fillStyle = r > 8 ? '#ffc860' : '#fff0b0'; g.beginPath(); g.arc(18, 18, r, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1; return c; }; })();

/* ================= WHERE THINGS STAND ================= */
let VWD = 320;   /* the view's width (a boss fight zooms out: 629 wide in the court), set by each draw */
const courtWindow = (L, cx, g) => { if (g) VWD = g.canvas.width; return courtWindow0(L, cx); };
const courtWindow0 = (L, cx) => { const C = L.frogCourt; if (!C) return null; const x0 = C.lanes[0][0] * 16 - 40, x1 = (C.royal[2][1] + 3) * 16; return cx + VWD + 10 > x0 && cx < x1 ? C : null; };
/* the reed clumps, fixed by the court's columns: [world x of the clump's centre, height, seed, depth] */
function reedSpots(C) {
  return once('spots' + C.wl, () => {
    const out = [];
    C.royal.forEach(([a, b], i) => { const x0 = a * 16, x1 = (b + 1) * 16;
      out.push([x0 + 6, 52, i * 7 + 1], [x0 - 14, 34, i * 7 + 2], [x1 - 6, 56, i * 7 + 3], [x1 + 14, 30, i * 7 + 4], [(x0 + x1) / 2 - 16 + (i * 29) % 40, 50, i * 7 + 5]); });
    C.lanes.forEach(([a, b], li) => { for (let k = 0; k < 3; k++) out.push([a * 16 + 68 + k * 48, 22 + rnd(li, k, 10), li * 5 + k + 40]); });
    return out.sort((p, q) => p[0] - q[0]);
  });
}

/* ================= THE BACK (behind the tiles) ================= */
/* the whole dressing (reeds, lotus, lantern poles and their glow) is baked ONCE into one strip for the court and blitted - a phone pays one drawImage, not sixty */
const BACK_H = 76;
function backSheet(C) {
  return once('back' + C.wl, () => {
    const x0 = C.lanes[0][0] * 16 - 40, x1 = (C.royal[2][1] + 3) * 16, [c, g] = canvas(x1 - x0, BACK_H), wy = SURF - (SURF - BACK_H + 6);   /* world y of the strip's top: SURF - BACK_H + 6 */
    const ty = SURF - 70;
    for (const [x, h, seed] of reedSpots(C)) { const sp = reedClump(seed, h); g.drawImage(sp, Math.round(x - 19 - x0), SURF - ty - sp.height + 3); }
    C.royal.forEach(([a, b], i) => {
      const px0 = a * 16, px1 = (b + 1) * 16, top = TOP - ty;
      if (i < 2) { const lx = i === 0 ? px0 + 12 : px1 - 28, lt = lotus(false); g.drawImage(lt, Math.round(lx - x0), top - lt.height + 4); }
      const pole = lanternPole(46), lxp = i === 0 ? px0 + 4 : i === 1 ? px1 - 22 : px0 + 6, lanterns = i === 2 ? [lxp, px1 - 26] : [lxp];
      for (const lp of lanterns) { g.globalAlpha = 0.5; g.drawImage(GLOW(), Math.round(lp - x0) + 9 - 14, top - 44 + 16 - 18); g.globalAlpha = 1; g.drawImage(pole, Math.round(lp - x0), top - 44); }
    });
    return { c, x0, ty };
  });
}
export function drawBack(g, L, cx, cy, time) {
  const C = courtWindow(L, cx, g); if (!C) return;
  const B = backSheet(C), sx0 = Math.max(0, Math.floor(cx - B.x0)), sx1 = Math.min(B.c.width, Math.ceil(cx + VWD - B.x0)); if (sx1 <= sx0) return;
  { const lt = lotus(true), tx = (C.wl + 71) * 16 + 8 - lt.width / 2; if (tx + lt.width > cx && tx < cx + VWD) g.drawImage(lt, Math.round(tx - cx), TOP - cy - lt.height + 10); }   /* THE THRONE: a lotus fan opens behind it (src/frog-court.js THRONE_DX 71), drawn apart: it is the one tall thing */
  g.drawImage(B.c, sx0, 0, sx1 - sx0, BACK_H, Math.round(B.x0 + sx0 - cx), Math.round(B.ty - cy), sx1 - sx0, BACK_H);
}

/* ================= THE WATER (after the surface, before the pads afloat) ================= */
export function drawWater(g, L, cx, cy, time, boss, movers) {
  const C = courtWindow(L, cx, g); if (!C) return;
  const wy = SURF - cy, p2 = !!(boss && boss.t === 'frog' && boss.phase >= 2);
  /* the royal pads stand in the water: the water is laid under them (copied from the lane beside, the pools stop at the pad), the stems rise through it, the water laps their feet */
  C.royal.forEach(([a, b], i) => {
    const n = b - a + 1, x0 = a * 16 - cx, x1 = (b + 1) * 16 - cx; if (x1 < -30 || x0 > VWD + 30) return;
    g.drawImage(stemSheet(i, n), Math.round(x0), Math.round(wy));   /* the water under the pad and its stems, one baked sheet */
  });
  if (p2) churn(g, C, cx, wy, time);
  if (movers) for (const m of movers) if (m.kind === 'pad' && (m.slapT > 0 || m.shufTo) && m.x > cx - 40 && m.x < cx + VWD + 40) reshuffleRead(g, m, cx, cy, time, m.w, Math.round(m.y0) - cy + Math.round((m.big ? 9 : 7) / 2) + 1);   /* a leaf held under (the King's landing, the flop's wave) whirls; where it will come up the water boils in the colour of what it will be */
  if (boss) drawSplash(g, L, boss, cx, cy, time, null);
}
/* HIS POND STIRS: the water boils - rings run out of the deep across the whole court, bubbles rise, the surface goes dark and green */
function churn(g, C, cx, wy, time) {
  const x0 = C.lanes[0][0] * 16, x1 = (C.royal[2][0]) * 16;
  g.globalAlpha = 0.22; g.fillStyle = '#0c3a2a'; g.fillRect(Math.max(0, x0 - cx), wy, Math.min(VWD + 20, x1 - cx) - Math.max(0, x0 - cx), 9); g.globalAlpha = 1;
  for (let i = 0; i < 18; i++) {
    const ph = (time * 0.5 + i * 0.37) % 1, seed = Math.floor(time * 0.5 + i * 0.37) * 31 + i, x = x0 + 20 + rnd(seed, 1, Math.max(1, x1 - x0 - 40)), sx = Math.round(x - cx), y = wy + 3 + (i % 3) * 7;
    if (sx < -50 || sx > VWD + 40) continue;
    g.globalAlpha = 0.95 * (1 - ph); g.strokeStyle = i & 1 ? '#eefaff' : '#9ad8ee'; g.lineWidth = 1;
    g.beginPath(); g.ellipse(sx + 0.5, y + 0.5, 4 + ph * 26, 1.5 + ph * 4, 0, 0, Math.PI * 2); g.stroke();
    if (ph < 0.6) { g.beginPath(); g.ellipse(sx + 0.5, y + 0.5, 2 + ph * 14, 1 + ph * 2, 0, 0, Math.PI * 2); g.stroke(); }
    g.globalAlpha = 0.6 * (1 - ph); R(g, '#eefaff', sx - 4, wy + 1 + (i % 2), 8 + (i % 3) * 3, 1);   /* a patch of foam where it boils */
  }
  for (let i = 0; i < 12; i++) { const ph = (time * 0.9 + i * 0.29) % 1, x = x0 + 30 + ((i * 97 + Math.floor(time * 0.9 + i * 0.29) * 53) % Math.max(1, x1 - x0 - 60)), sx = Math.round(x - cx); if (sx < -4 || sx > VWD + 10) continue;
    g.globalAlpha = 0.8 * (1 - ph * ph); R(g, '#e4f8ec', sx, wy + 10 - Math.round(ph * 12), 1, 1); R(g, '#bfe6f5', sx + 1, wy + 11 - Math.round(ph * 12), 1, 1); }
  g.globalAlpha = 1;
}
/* the firefly lights drifting over the court (the marsh's cold green motes) - drawn over the water, before the pads afloat */
export function drawFlies(g, L, cx, cy, time) {
  const C = courtWindow(L, cx, g); if (!C) return;
  const x0 = C.lanes[0][0] * 16, x1 = (C.royal[2][1] + 1) * 16, wy = SURF - cy;
  for (let i = 0; i < 18; i++) {
    const bx = x0 + (i * 431) % (x1 - x0), x = bx + Math.sin(time * 0.6 + i * 1.3) * 22 - cx, y = wy - 22 - ((i * 37) % 56) + Math.sin(time * 0.9 + i * 2.1) * 7;
    if (x < -10 || x > VWD + 10 || y < 4) continue;
    const bl = Math.max(0, Math.sin(time * 1.5 + i * 2.7)); if (bl < 0.15) continue;
    g.globalAlpha = 0.28 * bl; R(g, '#b8ffd8', Math.round(x) - 2, Math.round(y) - 1, 5, 3); g.globalAlpha = 0.9 * bl; R(g, '#f4fff0', Math.round(x), Math.round(y), 1, 1); P(g, '#d8ff98', Math.round(x) + 1, Math.round(y));
  }
  g.globalAlpha = 1;
}

/* ================= THE BELLY-FLOP over a lane ================= */
export const laneAt = (L, x) => { const C = L.frogCourt; if (!C) return false; for (const [a, b] of C.lanes) if (x >= a * 16 - 4 && x <= (b + 1) * 16 + 4) return true; return false; };
/* a standing crest of water: a wall of dark water with a pale foamy lip, rings trailing behind, spray thrown over the top. Same footprint as flopCrest (16 wide, to 15 tall). */
export function waterCrest(g, x, y, dir, time) {
  y += 16;   /* the wave runs at the standing line; over a lane the water is a tile lower */
  const d = dir > 0 ? 1 : -1, wob = (time * 18) & 1;
  R(g, '#1c5a6a', x - 8, y - 3, 16, 3); R(g, '#2f7f94', x - 7 + d, y - 6, 14, 3); R(g, '#4aa0b8', x - 5 + d * 2, y - 9, 10, 3); R(g, '#7fc4e0', x - 3 + d * 3, y - 11, 6, 2);
  R(g, '#bfe6f5', x - 4 + d * 3, y - 13, 8, 2); R(g, '#eefaff', x - 3 + d * 4, y - 14, 5, 1); R(g, '#ffffff', x - 1 + d * 5, y - 15, 3, 1);   /* the lip curling over, foam white */
  for (let i = 0; i < 6; i++) { const sxp = x + d * (2 + i * 2) + ((i * 5 + wob * 3) % 5) - 2, syp = y - 14 - ((i * 7 + (time * 30 | 0)) % 8); R(g, i & 1 ? '#ffffff' : '#bfe6f5', sxp, syp, 1, 1); }
  for (let i = 1; i <= 4; i++) { R(g, i & 1 ? '#7fc4e0' : '#bfe6f5', x - d * (8 + i * 5) - 2, y - 1 - (i & 1), 7 - i, 1); }   /* rings behind, thinning */
}

/* ================= HIM: the leap's spray, the splash-down ================= */
/* `e` is the boss; e.landAt is the time he last came down (main.js sets it with the landing's shockwave) */
export function drawBossFx(g, L, e, cx, cy, time, FKT) {
  const C = L.frogCourt; if (!C || !e) return;
  const wy = SURF - cy;
  if (e.mode === 'spit') spitSpray(g, e, cx, cy);
  if (e.phase >= 2 && e.alive !== false && e.mode !== 'sleep') stirSteam(g, e, cx, cy, time);
  if (e.mode === 'leap' && e.vx !== undefined) {   /* the spray he trails through the air, and the ring where he left */
    const T = (FKT && FKT.air) || 1.2, age = Math.max(0, (T + 1) - e.modeT), sx0 = e.x - e.vx * age;
    for (let i = 0; i < 22; i++) { const k = i / 22, bx = e.x - e.vx * 0.032 * (i + 1) + Math.sin(i * 7.1 + time * 30) * 2, by = e.y - 12 - e.vy * 0.032 * (i + 1) + ((i * 5 + (time * 36 | 0)) % 7) - 3;   /* a streak of water flung off him along the arc, spread and thinning */
      g.globalAlpha = 0.9 * (1 - k); R(g, i % 3 === 0 ? '#ffffff' : i & 1 ? '#eefaff' : '#bfe6f5', Math.round(bx - cx), Math.round(by - cy), k < 0.4 ? 2 : 1, k < 0.4 ? 2 : 1); if (i % 4 === 0) R(g, '#7fc4e0', Math.round(bx - cx) + (e.vx > 0 ? -3 : 3), Math.round(by - cy) + 2, 1, 2); }
    g.globalAlpha = 1;
  }
}
/* THE SPIT: a venom glob, a 5 x 4 blob that tumbles, a lit top, a dark rind, a trail of drips behind it along where it has been */
export function drawSpit(g, s, cx, cy, time) {
  const x = Math.round(s.x - cx), y = Math.round(s.y - cy), vx = s.vx || 0, vy = s.vy || 0, sp = Math.hypot(vx, vy) || 1;
  for (let i = 4; i >= 1; i--) { g.globalAlpha = 0.75 - i * 0.14; R(g, i & 1 ? '#8fd160' : '#6fae44', Math.round(x - vx / sp * i * 3.2 + Math.sin(time * 20 + i) * 0.5), Math.round(y - vy / sp * i * 3.2), 3 - (i >> 1), 3 - (i >> 1)); }
  g.globalAlpha = 1;
  R(g, '#2a4a1a', x - 3, y - 1, 7, 3); R(g, '#2a4a1a', x - 2, y - 2, 5, 5);
  R(g, '#6fae44', x - 2, y - 1, 5, 3); R(g, '#8fd160', x - 1, y - 2, 3, 4); R(g, '#d6f5a0', x - 2, y - 1, 2, 1); P(g, '#ffffff', x - 2, y - 1);
  if (((time * 14) | 0) & 1) { P(g, '#4a7a2a', x + 1, y + 1); P(g, '#8fd160', x + 1, y + 3); } else { P(g, '#4a7a2a', x - 1, y + 1); P(g, '#8fd160', x, y + 3); }
}
/* the muzzle of a spat glob: a fan of droplets thrown from his mouth (e.mode 'spit', 0.25 s after each lob) */
function spitSpray(g, e, cx, cy) {
  const age = 0.45 - (e.shotT || 0); if (!(age >= 0 && age < 0.25) || !(e.shots >= 0)) return;
  const f = e.face >= 0 ? 1 : -1, x0 = e.x + f * 22, y0 = e.y - 15;
  for (let i = 0; i < 10; i++) { const a = 0.15 + i * 0.09, sp = 90 + (i * 37) % 70, t = age, dx = f * Math.cos(a) * sp * t, dy = -Math.sin(a) * sp * t + 320 * t * t * 0.5;
    g.globalAlpha = 1 - age / 0.25; R(g, i & 1 ? '#8fd160' : '#d6f5a0', Math.round(x0 + dx - cx), Math.round(y0 + dy - cy), i < 4 ? 2 : 1, i < 4 ? 2 : 1); }
  g.globalAlpha = 1;
}

/* HIS POND STIRS: he is restless - steam breathing off his nostrils */
function stirSteam(g, e, cx, cy, time) {
  const f = e.face >= 0 ? 1 : -1;
  for (let i = 0; i < 4; i++) { const k = (time * 1.6 + i * 0.25) % 1; g.globalAlpha = 0.7 * (1 - k); R(g, i & 1 ? '#f4e0d8' : '#ffb8a0', Math.round(e.x + f * 24 + f * k * 9 - cx), Math.round(e.y - 21 - k * 12 - cy), 2 - (k > 0.6 ? 1 : 0), 2 - (k > 0.6 ? 1 : 0)); }
  g.globalAlpha = 1;
}

/* the splash of the leap and of his landing: rings run out over the water from the pad he leaves and from the pad he comes down on, a crown of drops thrown up. (After the water's surface pass.) */
export function drawSplash(g, L, e, cx, cy, time, FKT) {
  const C = L.frogCourt; if (!C || !e || e.t !== 'frog') return;
  const wy = SURF - cy;
  if (e.mode === 'leap' && e.vx !== undefined) { const T = (FKT && FKT.air) || 1.2, age = Math.max(0, (T + 1) - e.modeT), sx0 = e.x - e.vx * age; if (age < 0.8) { ring(g, sx0 - cx, wy, age / 0.8, 40, '#eefaff', 0.85); ring(g, sx0 - cx, wy, Math.max(0, age / 0.8 - 0.2), 26, '#7fc4e0', 0.7); } }
  if (e.landAt !== undefined) {
    const a = time - e.landAt; if (a >= 0 && a < 1.2) {
      const k = a / 1.2, pad = C.royal.find(([p, q]) => e.x >= p * 16 && e.x <= (q + 1) * 16 + 4);
      if (pad) { const px0 = pad[0] * 16 - cx, px1 = (pad[1] + 1) * 16 - cx;
        for (const ex of [px0, px1]) {
          ring(g, ex, wy, k, 84, '#eefaff', 1); ring(g, ex, wy, Math.max(0, k - 0.15), 56, '#7fc4e0', 0.8); ring(g, ex, wy, Math.max(0, k - 0.3), 34, '#bfe6f5', 0.6);
          if (k < 0.4) { g.globalAlpha = 0.9; g.strokeStyle = '#eefaff'; g.beginPath(); g.ellipse(ex + 0.5, wy + 3.5, 6 + k * 90, 2 + k * 8, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }   /* the wall of the first ring, a second line thick */
        }
        /* the crown: a column of water thrown up at each foot of the pad, then drops thrown out on their arcs */
        for (const [ex, side] of [[px0, -1], [px1, 1]]) {
          if (a < 0.3) { const hh = Math.round(Math.sin(a / 0.3 * Math.PI) * 24); for (let r = 0; r < hh; r += 2) { const w2 = Math.max(1, 5 - (r >> 2)); R(g, r > hh - 5 ? '#ffffff' : '#bfe6f5', Math.round(ex + side * 3 - (w2 >> 1)), wy - r - 1, w2, 2); } }
          for (let i = 0; i < 16; i++) { const vx = 14 + (i * 23) % 56, vy = 100 + (i * 41) % 90, t = a - (i % 4) * 0.02, x = ex + side * (3 + vx * t), y = wy - (vy * t - 210 * t * t);
            if (t < 0 || y > wy + 2) continue; g.globalAlpha = Math.min(1, 1.4 - a); R(g, i % 3 === 0 ? '#ffffff' : i & 1 ? '#eefaff' : '#bfe6f5', Math.round(x), Math.round(y), i < 7 ? 2 : 1, i < 7 ? 2 : 1); }
        }
        g.globalAlpha = 1; }
    }
  }
}
/* an expanding ring on the water's surface: k 0..1 */
function ring(g, x, wy, k, rx, col, a) { if (k <= 0 || k >= 1) return; g.globalAlpha = a * (1 - k); g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); g.ellipse(Math.round(x) + 0.5, wy + 3.5, 4 + k * rx, 1.5 + k * rx * 0.1, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }

/* ================= THE TONGUE ================= */
/* same footprint as before: a 4-high bar of `len` from x0 (to the left when dir < 0) at y, a 6-high tip. Ribbed, with a sticky bulb, a drip; phase 2: angrier, with spit beads trailing */
export function drawTongue(g, t, cx, cy, time, phase) {
  const x0 = Math.round(t.x0 - cx), y = Math.round(t.y - cy), len = Math.round(t.len); if (len < 1) return;
  const d = t.dir > 0 ? 1 : -1, a = d > 0 ? x0 : x0 - len, p2 = phase >= 2;
  const body = p2 ? '#ff5a74' : '#ff7a9a', lite = p2 ? '#ff9ab0' : '#ffb0c0', dark = p2 ? '#a02040' : '#c9463d';
  g.fillStyle = body; g.fillRect(a, y - 2, len, 4); g.fillStyle = lite; g.fillRect(a, y - 2, len, 1); g.fillStyle = dark; g.fillRect(a, y + 1, len, 1);
  for (let i = 3; i < len - 5; i += 5) { g.fillStyle = dark; g.fillRect(a + i, y - 1, 1, 2); }                                   /* the ribs */
  for (let i = 5; i < len - 5; i += 11) { g.fillStyle = '#ffffff'; g.fillRect(a + i, y - 2, 1, 1); }                              /* wet glints */
  const tip = d > 0 ? a + len - 5 : a;                                                                                          /* the sticky bulb, a pad of it, glistening */
  g.fillStyle = dark; g.fillRect(tip, y - 3, 5, 6); g.fillStyle = body; g.fillRect(tip + (d > 0 ? 0 : 1), y - 2, 4, 4); g.fillStyle = lite; g.fillRect(tip + (d > 0 ? 1 : 2), y - 2, 2, 1); g.fillStyle = '#ffffff'; g.fillRect(tip + (d > 0 ? 3 : 1), y - 3, 1, 1);
  const dx = d > 0 ? tip + 1 : tip + 2, dr = (time * 9) % 4 | 0; g.fillStyle = lite; g.fillRect(dx, y + 3 + dr, 1, 1 + (dr < 2 ? 1 : 0));   /* a drip off the bulb */
  if (p2) for (let i = 0; i < 4; i++) { const k = ((time * 3 + i * 0.25) % 1), bx = a + (d > 0 ? 0 : len) + d * Math.round(k * len), by = y + 3 + Math.round(Math.sin(k * 6 + i) * 2); g.globalAlpha = 0.8 * (1 - k * 0.5); g.fillStyle = '#e8ffb8'; g.fillRect(bx, by, 1, 1); g.globalAlpha = 1; }
}

/* THE THRONE: a seat of lotus petals - a rosette of pink petals round a red cushion trimmed with gold, laid on the royal leaf. Footprint: the old throne pad's 64 wide, drawn so the king's toes
   (the court's floor) stand on the cushion. */
export function drawThrone(g, pr, cx, cy, floor) {
  const c = once('throne', () => {
    const [c, g2] = canvas(68, 16), PET = ['#8a3a56', '#c0607c', '#e48ea4', '#f8c4d0', '#fff0f2'];
    fillPoly(g2, [[2, 12], [6, 3], [12, 8], [18, 1], [24, 7], [34, 0], [44, 7], [50, 1], [56, 8], [62, 3], [66, 12], [60, 14], [8, 14]], PET[0]);     /* the back petals, tips standing up */
    fillPoly(g2, [[4, 12], [7, 5], [12, 9], [18, 3], [24, 8], [34, 2], [44, 8], [50, 3], [56, 9], [61, 5], [64, 12]], PET[1]);
    for (let k = 0; k < 7; k++) { const x = 4 + k * 8.6; fillPoly(g2, [[x, 14], [x + 1, 9], [x + 4.3, 7], [x + 7.6, 9], [x + 8.6, 14]], PET[0]); fillPoly(g2, [[x + 1, 14], [x + 1.8, 10], [x + 4.3, 8], [x + 6.8, 10], [x + 7.6, 14]], k & 1 ? PET[2] : PET[3]); R(g2, PET[4], Math.round(x + 2), 10, 2, 1); }
    R(g2, '#5a1c22', 16, 5, 36, 5); R(g2, '#7a2426', 16, 5, 36, 3); R(g2, '#a8323a', 18, 5, 14, 1);   /* the cushion */
    R(g2, '#9a7020', 14, 9, 40, 1); R(g2, '#e8b030', 14, 4, 40, 1); R(g2, '#fff1a0', 20, 4, 6, 1); for (let x = 16; x < 54; x += 8) { R(g2, '#e8b030', x, 5, 1, 4); P(g2, '#fff1a0', x, 5); }   /* its gilt trim and studs */
    return c;
  });
  g.drawImage(c, Math.round(pr.x) - 34 - cx, floor - 10 - cy + 0);
}

export const _sprites = { lotus, reedClump, lanternPole, stemSheet, padTile };   /* (tools: the sprite sheet) */
