// arena_backdrop.js - THE ARENA SET's BACKDROP (claude/arenayardart). Behind the sand: a banded sky with slow clouds, far towers, and the CROWD STAND - a long curved
// stand of four tiers of pixel crowd under a striped awning, a crimson-and-blue painted podium with gold trim, stair aisles, and pennons on poles that sway. The crowd
// idles (a two-frame bob out of step along the stand) and CHEERS when o.cheer rises (0..1): arms go up, little flags come out, the pennons snap faster, and confetti
// falls. An optional gatehouse (o.gate) stands over a stretch of the stand where the level's gate, board and door are. Reusable: a boss arena passes its own options.
//   drawArenaBack(g, cx, cy, VW, VH, time, o)
//     o.floor   world px of the arena floor's top (the yard: 22 * 16)            o.rest  the screen y that floor has when the hero stands on it (default 98)
//     o.crowd   false = an empty stand (a duel at dawn)                          o.density  0..1 how full the seats are (default 0.9)
//     o.cheer   0..1 the crowd's roar (the game decays it over a second)         o.tint  { col, a }: a wash over the whole backdrop (a night arena, a blood sky)
//     o.gate    [x0, x1] world px: a stone gatehouse over that stretch           o.sky  false = leave the sky to the caller
// Pure drawing: nothing here reads game state. Every sheet is baked once and memoised.
import { canvas, px, rect, mulberry } from '../px.js';
import { AP } from './arena_pal.js';

const A = AP, SW = 128, SH = 84, FLOORS = [68, 56, 44, 32], SEG = 32;   /* the stand strip: width, height, each tier's seat line (front tier first), the cheer's slice width */
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const dith = (g, x, y, w, h, a, b) => { rect(g, x, y, w, h, a); for (let j = 0; j < h; j++) for (let i = (j + x) & 1; i < w; i += 2) px(g, x + i, y + j, b); };

/* ONE FIGURE in a slot: seated bust. ch 0 idle, 1 / 2 arms up (the two beats of a cheer), flag = a little pennon in the raised hand. dy: the bob. */
function figure(g, sx, yb, r, ch, flag, dy) {
  const skin = A.skin[(r() * A.skin.length) | 0], hair = A.hair[(r() * A.hair.length) | 0], cl = A.cloth[(r() * A.cloth.length) | 0], hat = r() < 0.14, hh = 10;
  const x = sx + 1, up = ch ? -1 : dy, y = yb + up;
  rect(g, x, y - 6, 6, 6 + (-up), cl); rect(g, x, y - 6, 6, 1, A.w1); g.globalAlpha = 0.28; rect(g, x, y - 6, 6, 1, '#fff'); rect(g, x + 4, y - 5, 2, 5, '#000'); g.globalAlpha = 1;   /* shoulders lit, a shade side */
  rect(g, x + 1, y - hh, 4, 4, skin); rect(g, x + 1, y - hh, 4, 1, hat ? cl : hair); if (!hat) { px(g, x + 1, y - hh + 1, hair); px(g, x + 4, y - hh + 1, r() < 0.5 ? hair : skin); } else rect(g, x, y - hh + 1, 6, 1, A.w0);
  px(g, x + 2, y - hh + 2, '#2a1a10'); px(g, x + 4, y - hh + 2, '#2a1a10');
  if (ch) { const l = ch === 1 ? 9 : 7, rr = ch === 1 ? 7 : 9;                                                            /* arms up, the two beats alternate hands */
    rect(g, x - 1, y - 2 - l, 1, l, skin); rect(g, x + 6, y - 2 - rr, 1, rr, skin); rect(g, x - 1, y - 4, 1, 2, cl); rect(g, x + 6, y - 4, 1, 2, cl);
    px(g, x - 1, y - 3 - l, skin); px(g, x + 6, y - 3 - rr, skin);
    if (flag) { rect(g, x + 6, y - 4 - rr - 2, 1, 3, A.o3); rect(g, x + 7, y - 4 - rr - 2, 3, 2, flag === 1 ? A.c2 : A.b2); px(g, x + 10, y - 4 - rr - 1, flag === 1 ? A.c1 : A.b1); } }
}

/* THE STAND, one 128-wide strip, per frame: 0 / 1 idle (the bob), 2 / 3 cheer. dens: seat fill, 0 = empty. */
function strip(frame, dens) {
  return once('strip' + frame + dens, () => { const [c, g] = canvas(SW, SH), r0 = mulberry(77);
    /* the awning: crimson and linen stripes with a scalloped valance, over a dark wall */
    for (let x = 0; x < SW; x += 16) { rect(g, x, 0, 8, 9, A.c2); rect(g, x + 8, 0, 8, 9, A.w1); rect(g, x, 8, 8, 1, A.c1); rect(g, x + 8, 8, 8, 1, A.w0); rect(g, x, 0, 16, 1, A.c3); }
    for (let x = 0; x < SW; x += 8) { const col = (x >> 3) & 1 ? A.w1 : A.c2; rect(g, x, 9, 8, 2, col); rect(g, x + 1, 11, 6, 1, col); rect(g, x + 2, 12, 4, 1, col); rect(g, x + 3, 12, 2, 1, (x >> 3) & 1 ? A.w0 : A.c1); }
    dith(g, 0, 13, SW, 20, A.k0, A.k1);
    for (const x of [28, 92]) { rect(g, x, 13, 10, 16, A.c1); rect(g, x, 13, 10, 1, A.g2); rect(g, x + 1, 14, 1, 15, A.c2); rect(g, x + 8, 14, 1, 15, A.c0); rect(g, x + 4, 17, 2, 6, A.g1);   /* heraldic drapes */
      for (let i = 0; i < 5; i++) px(g, x + i * 2, 29, A.g1); rect(g, x + 4, 13, 2, 1, A.g3); }
    for (const x of [62]) { rect(g, x, 13, 4, 30, A.o3); rect(g, x, 13, 1, 30, A.o5); rect(g, x + 3, 13, 1, 30, A.o1); rect(g, x - 1, 12, 6, 2, A.g1); rect(g, x, 12, 4, 1, A.g3); }   /* the aisle's post, gold-capped */
    /* the tiers, back to front: a stone riser, the crowd along it, a lit lip */
    for (let t = 3; t >= 0; t--) { const yb = FLOORS[t], r = mulberry(t * 131 + 17);
      rect(g, 0, yb - 12, SW, 12, A.k1); for (let x = 0; x < SW; x += 2) px(g, x + (t & 1), yb - 8 + (x & 3), A.k0);
      if (dens > 0) for (let s = 0; s < SW / 8; s++) { const aisle = s === 7 || s === 8, here = r() < dens, rr = mulberry(t * 977 + s * 31 + 5), ph = (s + t) & 1, bob = frame < 2 ? ((frame ^ ph) ? -1 : 0) : 0;
        if (aisle || !here) { r(); continue; }
        const ch = frame >= 2 ? frame - 1 : 0, flag = ch && rr() < 0.3 ? (s & 1) + 1 : 0; figure(g, s * 8, yb, rr, ch, flag, bob); }
      rect(g, 0, yb, SW, 1, A.k5); rect(g, 0, yb + 1, SW, 2, A.k3); rect(g, 0, yb + 3, SW, 1, A.k0);
      g.globalAlpha = 0.07 * t; rect(g, 0, yb - 20, SW, 24, '#102040'); g.globalAlpha = 1; }                          /* the back tiers sit in a little shade */
    /* the aisle stairs, between the tiers, over the crowd's gap */
    for (let t = 0; t < 4; t++) { const yb = FLOORS[t]; for (let k = 0; k < 4; k++) { rect(g, 56, yb - 12 + k * 3, 16, 3, k & 1 ? A.k2 : A.k3); rect(g, 56, yb - 12 + k * 3, 16, 1, A.k4); } }
    /* the podium: ashlar under painted panels, crimson and blue with gold trim */
    rect(g, 0, 68, SW, 16, A.k1); rect(g, 0, 68, SW, 2, A.k4); rect(g, 0, 70, SW, 1, A.k2); rect(g, 0, 82, SW, 2, A.k0);
    for (let x = 0; x < SW; x += 16) { const red = (x >> 4) & 1; rect(g, x + 1, 72, 14, 9, red ? A.c1 : A.b1); rect(g, x + 1, 72, 14, 1, red ? A.c3 : A.b3); rect(g, x + 1, 80, 14, 1, red ? A.c0 : A.b0);
      rect(g, x + 1, 73, 1, 7, A.g1); rect(g, x + 14, 73, 1, 7, A.g1); rect(g, x + 6, 75, 4, 3, A.g2); rect(g, x + 7, 76, 2, 1, red ? A.c1 : A.b1); px(g, x + 7, 74, A.g3); rect(g, x, 70, 1, 12, A.k0); }
    return c; });
}
/* a cloud: a few ellipses of linen, a shaded belly */
function cloudSpr(v) {
  return once('cl' + v, () => { const w = 46 + v * 10, [c, g] = canvas(w, 16), r = mulberry(v * 5 + 2);
    for (let i = 0; i < 7; i++) { const cx = 6 + ((r() * (w - 12)) | 0), rw = 6 + ((r() * 8) | 0), rh = 3 + ((r() * 3) | 0), cy = 7 + ((r() * 3) | 0);
      for (let y = -rh; y <= rh; y++) { const hw = Math.round(rw * Math.sqrt(1 - (y * y) / (rh * rh + 0.01))); rect(g, cx - hw, cy + y, hw * 2, 1, y > 1 ? A.sky4 : A.w1); } }
    return c; });
}
/* far towers: a pale silhouette of the arena rim, a tower with a pennon, a pair of low walls */
function towers() {
  return once('tw', () => { const [c, g] = canvas(256, 70), K = '#8aa2c2', L = '#a2b8d4', S = '#7790b0';
    const tower = (x, w, h) => { rect(g, x, 70 - h, w, h, K); rect(g, x, 70 - h, 2, h, L); rect(g, x + w - 2, 70 - h, 2, h, S); for (let i = 0; i < w; i += 4) rect(g, x + i, 70 - h - 3, 3, 3, K); rect(g, x + (w >> 1) - 1, 70 - h + 6, 2, 5, S); };
    tower(24, 18, 38); tower(70, 12, 26); tower(150, 22, 46); tower(206, 14, 30);
    rect(g, 42, 52, 28, 18, K); rect(g, 82, 58, 68, 12, K); rect(g, 172, 54, 34, 16, K); for (let x = 84; x < 148; x += 8) rect(g, x, 55, 5, 3, K);
    rect(g, 33, 24, 1, 8, '#5a6a88'); rect(g, 34, 24, 6, 3, '#c26a74'); rect(g, 160, 18, 1, 10, '#5a6a88'); rect(g, 161, 18, 7, 3, '#6a8ccc');
    return c; });
}
/* the gatehouse: coursed stone with crenels, arrow slits, hanging cloth, a gold crest over the middle */
function gatehouse(w, h) {
  return once('gh' + w + 'x' + h, () => { const [c, g] = canvas(w, h), r = mulberry(w * 7 + 3), top = 8;
    rect(g, 0, top, w, h - top, A.k1);
    for (let row = 0; row * 8 < h - top; row++) { let x = (row & 1) * -6; while (x < w) { const bw = 12 + ((r() * 6) | 0), t = r(), x1 = Math.max(0, x + 1), x2 = Math.min(w, x + bw), y = top + row * 8;
      if (x2 > x1) { rect(g, x1, y + 1, x2 - x1, 6, t < 0.2 ? A.k3 : A.k2); rect(g, x1, y + 1, x2 - x1, 1, t < 0.3 ? A.k5 : A.k4); rect(g, x1, y + 6, x2 - x1, 1, A.k1); } x += bw; } }
    for (let x = 0; x < w; x += 12) { rect(g, x, 0, 8, top, A.k3); rect(g, x, 0, 8, 1, A.k5); rect(g, x, 1, 1, top - 1, A.k4); rect(g, x + 7, 1, 1, top - 1, A.k1); }
    rect(g, 0, top, w, 3, A.k4); rect(g, 0, top + 2, w, 1, A.k1);
    for (const x of [18, w - 20]) { rect(g, x, 20, 3, 12, A.k0); rect(g, x - 1, 19, 5, 1, A.k4); }                                       /* arrow slits */
    for (const x of [w * 0.36, w * 0.66]) { const xx = Math.round(x); rect(g, xx, top + 4, 10, 22, A.c1); rect(g, xx, top + 4, 10, 1, A.g2); rect(g, xx + 1, top + 5, 1, 21, A.c2); rect(g, xx + 8, top + 5, 1, 21, A.c0); rect(g, xx + 4, top + 9, 2, 10, A.g1); for (let i = 0; i < 5; i++) px(g, xx + i * 2, top + 26, A.g1); }
    const mx = (w >> 1) - 7; rect(g, mx, top + 4, 14, 14, A.k0); rect(g, mx + 1, top + 5, 12, 12, A.b1); rect(g, mx + 1, top + 5, 12, 1, A.b3); rect(g, mx + 4, top + 8, 6, 6, A.g2); rect(g, mx + 5, top + 9, 4, 4, A.b1); rect(g, mx + 6, top + 10, 2, 2, A.g3);   /* the crest: a gold ring on blue */
    rect(g, 0, h - 3, w, 3, A.k0); rect(g, 0, h - 4, w, 1, A.k3);
    return c; });
}

/* one pennon on its pole: the cloth is cut in columns and each rides the wave */
export function pennon(g, x, yTop, len, time, amp, spd, c0, c1) {
  rect(g, x, yTop - 2, 2, 34, A.o3); rect(g, x, yTop - 2, 1, 34, A.o5); px(g, x, yTop - 4, A.g3); rect(g, x - 1, yTop - 3, 4, 2, A.g1);
  for (let i = 0; i < len; i++) { const f = i / len, h = Math.max(1, Math.round(9 * (1 - f * 0.75))), w = Math.sin(time * spd - i * 0.55) * amp * (0.3 + f), y = Math.round(yTop + w + f * 1.5);
    rect(g, x + 2 + i, y, 1, h, i < len * 0.2 || i > len * 0.8 ? c1 : c0); if (i > len * 0.4 && i < len * 0.55) rect(g, x + 2 + i, y + 1, 1, Math.max(1, h - 2), A.g2); px(g, x + 2 + i, y, c0 === A.c2 ? A.c3 : A.b3); }
}

export function drawArenaBack(g, cx, cy, VW, VH, time, o = {}) {
  const floorW = o.floor != null ? o.floor : 352, rest = o.rest != null ? o.rest : 98, par = 0.6;
  const fy = Math.round(rest + (floorW - cy - rest) * par);                         /* the stand's foot on screen: it sinks and rises at 0.6 of the camera, so it does not fly off when the hero climbs */
  const cheer = Math.max(0, Math.min(1, o.cheer || 0)), dens = o.crowd === false ? 0 : Math.round(Math.max(0, Math.min(1, o.density != null ? o.density : 0.9)) * 4) / 4;
  if (o.sky !== false) {
    const cols = [A.sky0, A.sky1, A.sky2, A.sky3, A.sky4, A.sky5], top = fy - SH, bandH = Math.max(14, Math.ceil((fy - 6) / cols.length));
    for (let i = 0; i < cols.length; i++) { const y0 = i * bandH; rect(g, 0, y0, VW, bandH + 1, cols[i]); if (i + 1 < cols.length) for (let x = (i & 1); x < VW; x += 2) px(g, x, y0 + bandH - 1, cols[i + 1]); }
    rect(g, 0, fy - 6, VW, VH, A.k1);
    for (let i = 0; i < 5; i++) { const spr = cloudSpr(i % 3), x = Math.round((((i * 97 + time * (1.6 + i * 0.3) - cx * 0.05) % (VW + 100)) + VW + 100) % (VW + 100) - 60), y = 4 + ((i * 13) % 22) + Math.round(Math.max(0, top - 40) * 0.1); if (y < fy - SH) g.drawImage(spr, x, y); }
    const tw = towers(), tx = -(((cx * 0.2) % 256) + 256) % 256; for (let x = tx; x < VW; x += 256) g.drawImage(tw, Math.round(x), fy - SH - 50);
  }
  const x0 = Math.round(cx * 0.5), sy = fy - SH;
  /* the stand: 32-wide slices, each on its own beat; the cheer rolls along the stand */
  for (let sx = -((x0 % SEG) + SEG) % SEG; sx < VW; sx += SEG) {
    const wi = Math.floor((sx + x0) / SEG), n = ((wi % 4) + 4) % 4, nz = (((wi * 37) % 10) + 10) % 10 / 10 * 0.55;
    let f; if (cheer > 0.04 && cheer > nz) f = 2 + ((Math.floor(time * 7 + wi) & 1)); else f = (Math.floor(time * 1.7 + wi * 0.45) & 1);
    g.drawImage(strip(f, dens), n * SEG, 0, SEG, SH, sx, sy, SEG, SH);
  }
  /* the pennons on the aisle poles: slow and low when the crowd is calm, snapping when it roars */
  for (let p = Math.floor(x0 / SW) - 1; p * SW - x0 < VW + SW; p++) { const px0 = p * SW + 63 - x0, cl = (p & 1) ? [A.b2, A.b1] : [A.c2, A.c1]; if (px0 < -24 || px0 > VW + 4) continue; pennon(g, px0, sy + 18, 15, time, 1.3 + cheer * 2.2, 4 + cheer * 6, cl[0], cl[1]); }
  g.globalAlpha = 0.14; g.fillStyle = '#0a1226'; g.fillRect(0, sy, VW, SH - 16); g.globalAlpha = 1;                    /* the stand sits back a step: the sand and the heroes stay the brightest things */
  if (o.gate) { const gx0 = Math.round(o.gate[0] - cx), gw = Math.round(o.gate[1] - o.gate[0]), gh = 64; if (gx0 < VW && gx0 + gw > 0) g.drawImage(gatehouse(gw, gh), gx0, fy - gh); }
  if (cheer > 0.02 && dens > 0) for (let i = 0; i < 26; i++) { const t = time * 24 + i * 29, y = sy + 20 + ((t * (1.2 + (i % 3) * 0.3)) % 60), x = ((i * 53 + Math.sin(t * 0.07 + i) * 8) % VW + VW) % VW; if (cheer * 26 > i) rect(g, x | 0, y | 0, 2, 1, [A.g2, A.c3, A.b3, A.w1][i & 3]); }   /* confetti */
  if (o.tint) { g.globalAlpha = o.tint.a; g.fillStyle = o.tint.col; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
}
export const ARENA_STAND = { SW, SH, FLOORS };
