// src/redraw/goblin_princess_art.js - THE GOBLIN PRINCESS's sprite set (claude/gpart: the 11-08 REDRAW to the Frog King's bar, over claude/hc3art's first pass). DRAWING ONLY.
// px.js primitives only (no paths), so tools/hc3art-sheet.mjs renders every frame in Node with no browser. The contract is the other bosses': every frame faces RIGHT
// (L is the flip), one canvas size, ax = the body's centre column, ay = the row under the feet, w/h = the hit box (src/goblin-princess.js GP).
// SIZE (gpart): she is 1.4x the first pass (one frame cell 92 x 72, tiara-to-slipper about 60 px, the hero is 26). Every pose number below is still in the OLD pixel
// units and draw() scales them by S, so the pose table (and the frame keys, the timings, gpFrame) are the first pass's.
// MATERIALS: green skin, a 5-tone ramp (shadow, dark, base, light, highlight) with a lit top-left edge; a magenta over-gown with fanned satin pleats, drape swags and a pink
// petticoat under a gold hem; puffed sleeves and cream gloves; a gold tiara with a ruby; a silver rapier with a gold cup guard; her mother's purple on the sash.
// Frames (GPF), the LAST one is her hurt pose (main.js HAS_HURT):
//   0,1 stand | 2-5 run | 6 lunge told (blade drawn back, glint) | 7 lunge | 8 flurry told (blade up) | 9,10 the pokes | 11 trinket told (hand in the purse) | 12 the toss
//   13 fan told | 14 fan gust | 15 hop told (crouch) | 16 hop (air) | 17 tiara told (it comes off her head) | 18 tiara thrown (no tiara) | 19 stomp told | 20 stomp
//   21,22 preen | 23 PINNED (cowering under the grate) | 24 STUNNED (conked, tiara over one eye) | 25 stagger | 26,27 bolt (flee) | 28 hide | 29 perch | 30 escape (MOTHER!)
//   31 defeat (sat down, crying) | 32 the chase's handbell | 33 hurt
import { canvas, px, rect, line, ellipse, circle, outline, flipX, whiten, fillPoly, shade } from '../px.js';
import { OUT } from '../art.js';

export const GPF = { stand: 0, stand2: 1, run: 2, lungeTell: 6, lunge: 7, flurryTell: 8, poke: 9, trinketTell: 11, trinket: 12, fanTell: 13, fan: 14, hopTell: 15, hop: 16, tiaraTell: 17, tiara: 18,
  stompTell: 19, stomp: 20, preen: 21, pinned: 23, stunned: 24, stagger: 25, bolt: 26, hide: 28, perch: 29, escape: 30, defeat: 31, bell: 32, hurt: 33 };
export const GP_FRAMES = 34;
export const GPC = { skin: '#6faa4a', skinL: '#92cf63', skinD: '#4f8236', gown: '#b02a78', gownL: '#d84a9c', gownD: '#7a1f5a', gold: '#e0c04a', goldL: '#fff6c8', goldD: '#a8841c',
  hair: '#241434', hairL: '#5a3a78', purple: '#7a3aa0', shoe: '#f6a8d0', steel: '#c9d1dc', steelL: '#ffffff', fan: '#f6d6e8', fanD: '#d890b8', gem: ['#ff4a6a', '#4ad0ff', '#7aff8a', '#ffd04a', '#c97aff'],
  eye: '#fff6e8', pupil: '#2a1020', blush: '#e86a8a', tear: '#9ad8ff' };
const C = GPC;
export const GP_SCALE = 1.4;                    // how much bigger than the first pass (see the hit box, GP_BOX)
export const GP_BOX = { w: 12, h: 20 };          // the hit box is UNCHANGED (12 x 20): src/goblin-princess.js ties e.y to h/2 (onLanding is e.y < floor - 8), so a taller box would flip that test; the sprite already stood ~1.8x its box in the first pass
const S = GP_SCALE, W = 92, H = 78, CX = 34, G = 74;
const q = v => Math.round((v || 0) * S);

/* ramps: [shadow, dark, base, light, highlight] */
const SK = ['#35602a', '#4f8236', '#6faa4a', '#92cf63', '#bfec90'];       // green skin (the Queen's family)
const GM = ['#42102f', '#751c58', '#b02a78', '#d84a9c', '#f88cc8'];       // magenta over-gown
const PK = ['#74285a', '#b04a86', '#e07ab0', '#f6a8d0', '#ffdcee'];       // pink petticoat, bodice, slippers
const GD = ['#5a3c0c', '#a8841c', '#e0c04a', '#f4de82', '#fff8d0'];       // gold
const HR = ['#160a26', '#2c1a4a', '#46286e', '#6c4a9c', '#a088cc'];       // hair
const GL = ['#a08098', '#cdb0c4', '#f1dfea', '#fff3f8', '#ffffff'];       // gloves
const PU = ['#2a0e44', '#4c2070', '#7a3aa0', '#a064c8', '#caa0ea'];       // the Queen's purple
const ST = ['#6a7488', '#9aa4b8', '#c9d1dc', '#eef2f8', '#ffffff'];       // steel
const RB = ['#6a0a28', '#b0143a', '#ff4a6a', '#ffa0b4'];                  // ruby
const DR = '#4a0f22', TONG = '#e0607e', EYEW = '#fff6e8', IRIS = '#f0b020', INK = '#1b1626', INK2 = '#2a1030';

/* a shaded ball: lit from the top left, a dark rim on the far side, a dark outline against what is behind it */
function blob(g, cx, cy, rx, ry, R, ol = INK2) {
  if (ol) ellipse(g, cx, cy, rx + 1, ry + 1, ol);
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
    const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d = dx * dx + dy * dy; if (d > 1) continue;
    const l = -(dx * 0.55 + dy * 0.8); let k = l > 0.62 ? 4 : l > 0.22 ? 3 : l > -0.28 ? 2 : l > -0.62 ? 1 : 0;
    if (d > 0.7 && l < 0.1 && k > 1) k--;
    px(g, x, y, R[Math.min(k, R.length - 1)]); }
}
/* a tube (limb, curl, rib): outlined, shaded dark -> base -> light across its width */
function tube(g, x0, y0, x1, y1, w, R, ol = INK2) {
  const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 1.5)), r = w / 2;
  const at = (fn) => { for (let i = 0; i <= n; i++) fn(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n); };
  if (ol) at((x, y) => circle(g, x, y, r + 1, ol));
  at((x, y) => circle(g, x, y, r, R[1]));
  at((x, y) => circle(g, x - 0.5, y - 0.5, r - 0.8, R[2]));
  if (w >= 4) at((x, y) => circle(g, x - 0.9, y - 0.9, r - 1.5, R[3]));
}
function poly(g, pts, c, ol) {
  if (ol) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [1, -1], [-1, 1]]) fillPoly(g, pts.map(([x, y]) => [x + dx, y + dy]), ol);
  fillPoly(g, pts, c);
}
/* two-bone arm: the elbow drops (or goes back) from the shoulder-hand line */
function arm(g, sx, sy, tx, ty, L1 = 9, L2 = 9.5) {
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy) || 1; const reach = L1 + L2 - 0.6; if (d > reach) { tx = sx + dx / d * reach; ty = sy + dy / d * reach; dx = tx - sx; dy = ty - sy; d = reach; }
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a)), ux = dx / d, uy = dy / d;
  const e1 = [sx + ux * a - uy * h, sy + uy * a + ux * h], e2 = [sx + ux * a + uy * h, sy + uy * a - ux * h];
  const e = (e1[1] - e1[0] * 0.5) > (e2[1] - e2[0] * 0.5) ? e1 : e2;
  return { sx, sy, ex: Math.round(e[0]), ey: Math.round(e[1]), hx: Math.round(tx), hy: Math.round(ty) };
}
function drawArm(g, A, dark, stage = 0) {                  // stage 1 = the puffed sleeve (drawn BEHIND the head), 2 = the glove and hand (in front of it), 0 = both
  const sl = dark ? GM2.map(c => shade(c, -0.16)) : GM, gl = dark ? GL.map(c => shade(c, -0.06)) : GL, pk = dark ? PK.map(c => shade(c, -0.1)) : PK;
  if (stage !== 2) {
    tube(g, A.sx, A.sy, A.ex, A.ey, 6, sl);                                                                                      // the puffed sleeve
    blob(g, A.sx, A.sy - 1, 4.4, 4, sl); px(g, A.sx - 2, A.sy - 3, pk[4]); px(g, A.sx - 1, A.sy - 3, pk[3]); rect(g, A.sx - 3, A.sy + 2, 7, 1, GD[1]); }
  if (stage !== 1) {
    tube(g, A.ex, A.ey, A.hx, A.hy, 4, gl);                                                                                     // the glove: forearm
    rect(g, A.ex - 2, A.ey - 1, 5, 2, GD[2]); px(g, A.ex - 1, A.ey - 1, GD[4]); rect(g, A.ex - 2, A.ey + 1, 5, 1, GD[1]);       // the gold cuff at the elbow
    blob(g, A.hx, A.hy, 3, 3, gl); px(g, A.hx + 2, A.hy - 1, gl[1]); }                                                            // the hand
}
/* a ruby */
function ruby(g, x, y, big) { if (big) { rect(g, x - 1, y - 1, 3, 3, RB[2]); px(g, x - 1, y - 1, RB[3]); rect(g, x, y + 1, 2, 1, RB[1]); px(g, x + 1, y, RB[1]); } else { px(g, x, y, RB[2]); px(g, x - 1, y - 1, RB[3]); } }
/* the gown: a big layered ball gown. A hot-pink upper over-skirt with a scalloped gold-piped edge, a magenta lower over-skirt in fanned satin pleats with deep drape swags, a pale pink petticoat of ruffles under a gold hem */
const GM2 = ['#7a1c5c', '#b02a78', '#dc50a4', '#f87cc4', '#ffb4dc'];
function skirt(g, o) {
  const { cx, waistY, hemY: hemY0, hw, sk, ph, tilt } = o, H0 = Math.max(4, hemY0 - waistY), span = hw * 2;
  const swag = (x, xa, segW, amp, p0) => { const f = ((((x - xa) / segW) + p0) % 1 + 1) % 1; return Math.round(amp * Math.sin(Math.PI * f)); };
  const yA = waistY + Math.round(H0 * 0.38), yB = hemY0 - 8, bump = (y) => (y >= yA && y < yA + 8 ? 2.8 * Math.sin(Math.PI * (y - yA + 0.5) / 8) : 0) + (y >= yB && y < yB + 9 ? 3 * Math.sin(Math.PI * (y - yB + 0.5) / 9) : 0);   // the tier edges puff out: a bell, not a triangle
  for (let y = waistY; y <= hemY0 + Math.abs(tilt || 0) + 2; y++) {
    const k = Math.min(1, (y - waistY) / H0), half = 5.5 + (hw - 5.5) * (0.55 * Math.pow(k, 0.5) + 0.45 * Math.pow(k, 2)) + bump(y), c = cx + sk * Math.pow(k, 1.6), xa = Math.round(c - half), xb = Math.round(c + half);
    for (let x = xa; x <= xb; x++) {
      const u = (x - c) / half, hemY = hemY0 - Math.round((tilt || 0) * Math.max(-1, Math.min(1, u))) + Math.round(1.1 * Math.sin((x - xa) * 0.5 + ph * 6)); if (y > hemY) continue;
      const yo1 = waistY + Math.round(H0 * 0.38) + swag(x, xa, Math.max(6, span / 4.2), 3, ph + 0.2), yo2 = hemY - 8 + swag(x, xa, Math.max(7, span / 3.3), 3, ph);
      let col;
      if (y >= hemY - 2) { col = y === hemY ? GD[1] : y === hemY - 1 ? GD[2] : GD[3]; if (y === hemY - 1 && ((x - xa) % 5 === 2)) col = GD[4]; if (y === hemY && x === xa) col = GD[0]; }
      else if (y > yo2) {                                                                  // the petticoat: pink ruffles
        const rf = (Math.floor((x - xa) / 3) + (y - yo2)) & 1; let t = rf ? 3 : 2; if (u < -0.45) t = Math.min(4, t + 1); if (u > 0.5) t -= 1; if (y - yo2 < 2) t = Math.max(0, t - 2);
        col = PK[Math.max(0, t)]; }
      else if (y > yo1) {                                                                  // the lower over-skirt: fanned satin pleats, light from the left
        const pf = (((u + 1) * 3.1 + 0.12) % 1 + 1) % 1; let t = pf < 0.1 ? 0 : pf < 0.32 ? 2 : pf < 0.52 ? 3 : pf < 0.86 ? 2 : 1;
        if (pf > 0.36 && pf < 0.48 && u < 0.3) t = 4;
        if (u < -0.55) t = Math.min(4, t + 1); else if (u > 0.55) t = Math.max(0, t - 1);
        if (y - yo1 < 3) t = Math.max(0, t - 2);                                           // shadow under the upper skirt's edge
        if (yo2 - y < 1) t = Math.max(0, t - 1);
        col = GM[t]; }
      else {                                                                               // the upper over-skirt: brighter, broader pleats
        const pf = (((u + 1) * 2.1 + 0.3) % 1 + 1) % 1; let t = pf < 0.12 ? 0 : pf < 0.36 ? 2 : pf < 0.55 ? 3 : pf < 0.88 ? 2 : 1;
        if (pf > 0.38 && pf < 0.5 && u < 0.3) t = 4;
        if (u < -0.5) t = Math.min(4, t + 1); else if (u > 0.5) t = Math.max(0, t - 1);
        if (k < 0.12) t = Math.max(0, t - 2);
        col = GM2[t]; }
      if (y === yo1) col = (x & 1) ? GD[3] : GD[2]; else if (y === yo2 && y < hemY - 2) col = (x & 1) ? PK[4] : PK[3];     // the gold piping on each drape edge
      if (y === yo1 - 1 && y > waistY + 3) col = shade(col, 0.15);
      if (x === xa && y < hemY - 2) col = PK[4]; if (x === xb && y < hemY - 2) col = GM[0];
      px(g, x, y, col); } }
}

/* the head: hair behind, long ears, a big green head with a lit top left, a pointed nose, readable eyes, fangs, a fringe, the tiara */
function eye(g, x, y, w, kind, brow, far) {
  const lash = (xx, yy) => { px(g, xx, yy, INK); px(g, xx - 1, yy - 1, INK); };
  if (kind === 'open' || kind === 'angry' || kind === 'wide' || kind === 'smug') {
    const tall = kind === 'wide' ? 3 : 2, iw = w >= 6 ? 3 : 2;
    rect(g, x + 1, y - tall, w - 2, 1, EYEW); rect(g, x, y - tall + 1, w, tall * 2 - 1, EYEW); rect(g, x + 1, y + tall, w - 2, 1, EYEW);
    const ix = x + w - iw - 1;
    if (kind === 'wide') { rect(g, x + 1, y - 1, w - 2, 3, IRIS); px(g, x + 2, y, INK); px(g, x + 2, y + 1, INK); px(g, x + 1, y - 1, '#fff'); px(g, x + w - 1, y - tall, EYEW); }
    else { rect(g, ix, y - 1, iw + 1, 3, IRIS); rect(g, ix + 1, y - 1, 1, 3, INK); px(g, ix, y - 1, '#fff'); px(g, ix, y + 1, '#c07a10'); }
    rect(g, x, y - tall - 1, w, 1, INK); if (!far) lash(x + w, y - tall - 1);
    if (kind === 'smug') { rect(g, x, y - tall, w, 2, SK[1]); rect(g, x, y - tall + 1, w, 1, INK); if (!far) px(g, x + w, y - tall, INK); }
    if (kind === 'angry') { rect(g, x, y - tall - 1, w, 2, SK[0]); for (let i = 0; i < w + 2; i++) { const yy = y - tall - 3 + Math.round((far ? i : (w + 1 - i)) * 0.8); px(g, x - 1 + i, yy, HR[0]); px(g, x - 1 + i, yy + 1, SK[0]); } }
  } else if (kind === 'shut') { px(g, x, y - 1, INK); rect(g, x + 1, y, w - 2, 1, INK); px(g, x + w - 1, y - 1, INK); if (!far) lash(x + w, y - 1); }
  else if (kind === 'happy') { px(g, x, y, INK); rect(g, x + 1, y - 1, w - 2, 1, INK); px(g, x + w - 1, y, INK); if (!far) lash(x + w, y - 1); }
  else if (kind === 'cry') { px(g, x, y - 1, INK); px(g, x + 1, y, INK); rect(g, x + 2, y, w - 3, 1, INK); px(g, x + w - 1, y - 1, INK); px(g, x + 1, y + 1, '#bfe8ff'); px(g, x + 1, y + 2, '#9ad8ff'); px(g, x + w - 2, y + 1, '#bfe8ff'); px(g, x + w - 2, y + 2, '#9ad8ff'); px(g, x + w - 2, y + 3, '#9ad8ff'); }
  else if (kind === 'spiral') { circle(g, x + w / 2, y, w / 2 + 0.4, EYEW); px(g, x + 1, y, INK); px(g, x + 1, y - 1, INK); px(g, x + 2, y - 1, INK); px(g, x + 2, y + 1, INK); px(g, x + 3, y, INK); px(g, x + 3, y + 1, INK); }
  if (brow === 'up') { rect(g, x, y - 5, w, 1, HR[1]); px(g, x + w, y - 6, HR[1]); } else if (brow === 'flat') rect(g, x, y - 5, w, 1, HR[1]);
}
function head(g, hx, hy, p) {
  const eu = p.ears === 1 ? -6 : p.ears === 2 ? 7 : 0, fly = q(p.fly);
  /* the hair behind: a big dark mass, a top bun with a pink bow and a gold pin, a long ringlet */
  ellipse(g, hx - 3, hy, 10.5, 10.5, HR[1]); ellipse(g, hx - 5, hy - 2, 7, 7, HR[2]); ellipse(g, hx - 7, hy - 4, 3, 3, HR[3]);
  const tx = hx - 12 - fly, ty = hy + 7 + (p.air ? -3 : 0);
  tube(g, hx - 7, hy - 2, hx - 12 - fly * 0.6, hy + 5, 6, HR); blob(g, tx, ty + 3, 3.8, 4.2, HR); px(g, tx - 2, ty + 1, HR[4]); px(g, tx - 1, ty, HR[3]); px(g, tx + 1, ty + 6, HR[0]); px(g, hx - 10 - fly * 0.5, hy + 2, HR[4]); px(g, hx - 11 - fly * 0.6, hy + 4, HR[3]); rect(g, hx - 14 - fly * 0.6, hy + 3, 5, 2, PK[2]); px(g, hx - 14 - fly * 0.6, hy + 3, PK[4]); px(g, hx - 10 - fly * 0.6, hy + 4, PK[1]);   // the ringlet, tied with a bow
  blob(g, hx - 6, hy - 12, 3.8, 3.6, HR); px(g, hx - 8, hy - 14, HR[4]); px(g, hx - 7, hy - 15, HR[3]); px(g, hx - 4, hy - 10, GD[3]);
  /* the ears: long leaf ears, the near one bigger; the inner ear pink, the edge lit */
  for (const [side, len, dy] of [[-1, 18, 0], [1, 20, 1]]) {
    const e = side * 1, bx = hx + e * 7, tipx = hx + e * (6 + len), tipy = hy - 10 + eu + dy, mx = hx + e * (6 + len * 0.55), my = hy - 8 + eu * 0.55 + dy;
    const P = [[bx, hy - 5 + dy], [mx - e * 2, my - 3], [tipx, tipy], [mx + e * 1, my + 5], [bx + e * 1, hy + 2 + dy]];
    poly(g, P, SK[2], INK2);
    fillPoly(g, [[bx + e * 3, hy - 3 + dy], [mx - e * 1, my - 0.5], [tipx - e * 4, tipy + 1.6], [mx + e * 0.5, my + 3], [bx + e * 3, hy + dy]], side > 0 ? '#c8688a' : '#a85878');
    fillPoly(g, [[bx + e * 4, hy - 2 + dy], [mx, my + 0.5], [tipx - e * 6, tipy + 3], [mx, my + 2.4]], side > 0 ? '#e898b0' : '#c47890');
    line(g, bx, hy - 5 + dy, mx - e * 2, my - 3, SK[4], 1); line(g, mx - e * 2, my - 3, tipx, tipy, SK[3], 1);                // the lit top edge
    line(g, bx + e * 1, hy + 2 + dy, mx + e * 1, my + 5, SK[0], 1);                                                                  // the shaded underside
    if (side > 0) { px(g, tipx - 4, tipy + 3, GD[3]); px(g, tipx - 3, tipy + 3, GD[2]); }                                           // a tiny gold stud
  }
  blob(g, hx, hy, 9.8, 9.4, SK);                                                                                                       // the head
  rect(g, hx - 1, hy + 8, 4, 3, SK[1]);                                                                                                // under the chin
  px(g, hx + 7, hy + 7, SK[1]); px(g, hx + 6, hy + 8, SK[1]);                                                                          // a jaw
  /* cheeks */
  const flush = p.flush ? 1 : 0, ck = flush ? '#e8402c' : '#d8607e', ck2 = flush ? '#ff7a58' : '#ee8aa0';
  ellipse(g, hx + 6, hy + 4.4, flush ? 3.2 : 1.6, flush ? 2.2 : 1, ck); px(g, hx + 5, hy + 3, ck2); if (flush) { ellipse(g, hx - 1, hy + 4.4, 2.2, 1.6, ck); px(g, hx - 2, hy + 4, ck2); }
  /* the nose: a goblin's, pointed, out past the face's edge */
  rect(g, hx + 9, hy + 2, 3, 2, SK[2]); px(g, hx + 12, hy + 3, SK[1]); px(g, hx + 9, hy + 2, SK[3]); px(g, hx + 10, hy + 2, SK[4]); rect(g, hx + 9, hy + 4, 3, 1, SK[1]);
  /* the eyes */
  const eyes = p.eyes || 'open', brow = (eyes === 'open' || eyes === 'wide') ? (p.browUp ? 'up' : 'flat') : null;
  eye(g, hx - 3, hy, 5, eyes, brow, true); eye(g, hx + 4, hy, 6, eyes, brow, false);
  /* the mouth */
  const mouth = p.mouth || 'smile', mx = hx + 5, my = hy + 6, W1 = '#fff';
  if (mouth === 'smile') { rect(g, mx - 3, my, 7, 1, DR); px(g, mx + 4, my - 1, DR); px(g, mx - 4, my - 1, DR); rect(g, mx - 3, my + 1, 6, 1, '#b84a68'); px(g, mx + 1, my + 1, W1); px(g, mx + 1, my + 2, W1); }
  else if (mouth === 'smirk') { rect(g, mx - 3, my + 1, 6, 1, DR); rect(g, mx + 3, my, 2, 1, DR); px(g, mx + 5, my - 1, DR); px(g, mx - 4, my + 1, DR); px(g, mx + 2, my + 2, W1); px(g, mx + 2, my + 3, W1); rect(g, mx - 3, my + 2, 5, 1, '#b84a68'); }
  else if (mouth === 'grin') { rect(g, mx - 4, my - 1, 9, 4, DR); rect(g, mx - 3, my - 1, 7, 1, W1); rect(g, mx - 3, my, 1, 2, W1); rect(g, mx + 3, my, 1, 2, W1); rect(g, mx - 2, my + 2, 5, 1, TONG); px(g, mx - 4, my - 2, DR); px(g, mx + 5, my - 2, DR); }
  else if (mouth === 'pout') { rect(g, mx - 2, my + 1, 5, 1, DR); rect(g, mx - 2, my + 2, 5, 1, '#b84a68'); px(g, mx - 3, my + 2, DR); px(g, mx + 3, my + 2, DR); px(g, mx - 1, my + 2, '#e888a0'); }
  else if (mouth === 'shout') { rect(g, mx - 3, my - 1, 7, 6, DR); px(g, mx - 3, my - 1, SK[2]); px(g, mx + 3, my - 1, SK[2]); rect(g, mx - 2, my + 3, 5, 2, TONG); rect(g, mx - 2, my - 1, 1, 2, W1); rect(g, mx + 2, my - 1, 1, 2, W1); rect(g, mx - 3, my + 5, 7, 1, DR); }
  else { rect(g, mx - 4, my - 2, 9, 7, DR); px(g, mx - 4, my - 2, SK[2]); px(g, mx + 4, my - 2, SK[2]); rect(g, mx - 3, my + 3, 7, 2, TONG); rect(g, mx - 3, my - 2, 1, 3, W1); rect(g, mx + 3, my - 2, 1, 3, W1); rect(g, mx - 4, my + 5, 9, 1, DR); }
  /* the fringe: swept across the brow, a lit streak */
  for (let x = hx - 10; x <= hx + 8; x++) { const bot = x < hx - 6 ? hy + 4 : Math.round(hy - 6 + 1.5 * Math.sin((x - hx) * 0.62) + (x > hx + 5 ? 1 : 0)); for (let y = hy - 10; y <= bot; y++) { const inHead = ((x - hx) / 9.8) ** 2 + ((y - hy) / 9.4) ** 2 <= 1.12; if (!inHead) continue; px(g, x, y, y === bot ? HR[0] : (y < hy - 7 && x < hx + 1) ? HR[3] : y < hy - 6 ? HR[2] : HR[1]); } }
  for (let x = hx - 4; x < hx + 3; x++) px(g, x, hy - 9, HR[4]);
  /* the tiara */
  const t = p.tiara || 'on';
  if (t === 'on' || t === 'crooked') { const cr = t === 'crooked', tx = hx - 6 + (cr ? 3 : 0), ty = hy - 12 + (cr ? 2 : 0); tiara(g, tx, ty, cr); }
}
function tiara(g, tx, ty, cr) {
  rect(g, tx - 1, ty + 4, 15, 3, GD[0]); rect(g, tx, ty + 4, 13, 2, GD[2]); rect(g, tx, ty + 4, 13, 1, GD[4]); rect(g, tx, ty + 6, 13, 1, GD[1]);
  for (const [k, h] of [[0, 2], [3, 4], [6, 6], [9, 4], [12, 2]]) { rect(g, tx + k, ty + 4 - h, 2, h, GD[2]); rect(g, tx + k, ty + 4 - h, 1, h, GD[4]); px(g, tx + k + 1, ty + 4 - h, GD[3]); px(g, tx + k, ty + 3 - h, '#fff'); px(g, tx + k + 1, ty + 3 - h, GD[3]); }
  rect(g, tx + 5, ty + 2, 4, 4, GD[1]); ruby(g, tx + 7, ty + 4, 1); px(g, tx + 3, ty + 5, '#4ad0ff'); px(g, tx + 11, ty + 5, '#7aff8a'); px(g, tx + 1, ty + 5, '#c97aff'); void cr;
}

/* pose: { by body bob (px, + is down), lean (px the head and shoulders go forward), crouch (px the hips drop), legs [a, b] foot offsets, skirt (px the hem flares: + back, - forward),
   fa [dx, dy] front hand, ba [dx, dy] back hand (from the shoulder), blade [dx0, dy0, dx1, dy1] from the front hand, fan 0|1|2 (closed / half / open) in the back hand, tiara 'on' | 'off' | 'crooked' | 'hand',
   eyes 'open' | 'shut' | 'angry' | 'wide' | 'spiral' | 'cry' | 'smug' | 'happy', mouth 'smile' | 'smirk' | 'open' | 'pout' | 'shout' | 'wail' | 'grin', ears 0|1|2 (flat / up / drooped), purse, glint, tilt (head x lean), flush (red cheeks), fx (g, ...) extra
   (ALL numbers are first-pass pixels; draw() scales them by 1.4) */
function draw(g, p) {
  const by = q(p.by), lean = q(p.lean), crouch = q(p.crouch), slump = q(p.slump), sk = q(p.skirt), air = q(p.air);
  const waistY = G - 29 + crouch + by, shY = waistY - 11 - slump, hemY = p.sit ? G - 3 : Math.min(G - 4, G - 6 + by + Math.min(2, Math.round(crouch * 0.25)));
  const bcx = y => Math.round(CX + lean * 0.8 * Math.max(0, Math.min(1, (waistY - y) / (waistY - shY))));
  const hx = CX + lean + q(p.tilt), hy = shY - 8 + (p.slump ? slump : 0) - air;
  const bsh = [bcx(shY) - 8, shY + 4], fsh = [bcx(shY) + 8, shY + 4];
  const ba = p.ba || [-5, 5], fa = p.fa || [5, 6];
  /* back arm and its fan, behind everything */
  const BA = arm(g, bsh[0], bsh[1], bsh[0] + q(ba[0]), bsh[1] + q(ba[1]));
  if (p.fan !== undefined && p.fan !== null) fanArt(g, BA.hx, BA.hy, p.fan, p.fanDir || 1, p.fanAng);
  drawArm(g, BA, true);
  if (p.fan === 0) fanClosedOver(g, BA.hx, BA.hy, p.fanDir || 1);
  /* the sash's tail, hair, the gown, the slippers, the bodice */
  const hw = 17 + q(p.flare) + (crouch > 6 ? 2 : 0);
  if (!p.sit) skirt(g, { cx: Math.round(CX + lean * 0.3), waistY: waistY - 1, hemY, hw, sk, ph: p.ph || 0, tilt: q(p.hemTilt) });
  else { sitMound(g, hemY, hw, waistY); }
  if (!p.sit) { const [la, lb] = p.legs || [0, 0]; for (const [off, front] of [[lb, 0], [la, 1]]) { const fx = CX + q(off) + (front ? 4 : -4), lift = front ? q(p.lift) : q(p.liftB), fy = G - 1 - lift, top = hemY - 1;
      if (lift > 1) tube(g, fx, top, fx + 1, fy - 3, 4, GL); else { rect(g, fx - 1, hemY + 1, 3, Math.max(0, G - 3 - hemY - 1), SK[1]); }
      slipper(g, fx, fy, front); } }
  for (let y = waistY - 3; y <= waistY + 2; y++) for (let x = bcx(waistY) - 6; x <= bcx(waistY) + 6; x++) { if (y >= waistY - 1 && y <= waistY) px(g, x, y, PU[x < bcx(waistY) - 2 ? 3 : x > bcx(waistY) + 2 ? 1 : 2]); }   // (sash is drawn with the bodice)
  const tailx = bcx(waistY) - 6;                                                                                                          // the purple sash's tail
  tube(g, tailx, waistY, tailx - 4 - Math.round(sk * 0.3), waistY + 9, 3, PU); px(g, tailx - 4 - Math.round(sk * 0.3), waistY + 10, PU[0]); px(g, tailx - 3 - Math.round(sk * 0.3), waistY + 10, PU[1]);
  bodice(g, bcx, waistY, shY, hy);
  if (p.purse) purse(g, bcx(waistY) - 11, waistY + 4, p.purse);
  /* the front sleeve, the head, then the glove, the blade, the bell, the tiara in hand */
  const FA = arm(g, fsh[0], fsh[1], fsh[0] + q(fa[0]), fsh[1] + q(fa[1]));
  drawArm(g, FA, false, 1);
  head(g, hx, hy, p);
  if (p.blade) rapier(g, FA, p.blade.map(q), p.glint);
  drawArm(g, FA, false, 2);
  if (p.blade) guardOver(g, FA, p.blade.map(q));
  if (p.tiara === 'hand') tiara(g, FA.hx - 6, FA.hy - 9, false);
  if (p.handbell) handbell(g, FA.hx, FA.hy);
  if (p.fx) p.fx(g, { hx, hy, fhx: FA.hx, fhy: FA.hy, waistY, hemY, shY });
}

function slipper(g, x, y, front) {
  rect(g, x - 4, y - 3, 9, 4, INK2); rect(g, x - 3, y - 3, 8, 3, PK[front ? 3 : 2]); rect(g, x - 3, y - 3, 8, 1, PK[4]); rect(g, x - 3, y - 1, 8, 1, PK[1]); rect(g, x - 3, y, 8, 1, GD[1]); px(g, x + 4, y - 2, GD[3]); px(g, x + 5, y - 2, GD[2]); px(g, x, y - 2, GD[3]);
}
function bodice(g, bcx, waistY, shY, hy) {
  for (let y = shY - 1; y <= waistY - 2; y++) { const c = bcx(y), k = (waistY - y) / (waistY - shY), half = Math.round(5.4 + k * 3);
    for (let x = c - half; x <= c + half; x++) { let col = x < c - 2 ? PK[3] : x < c + 2 ? PK[2] : x < c + half - 1 ? PK[1] : PK[0]; if (x === c - half) col = PK[4]; px(g, x, y, col); }
    if (((y - shY) & 1) === 0 && y > shY + 2) { px(g, c, y, GD[2]); px(g, c - 1, y + 1, GD[1]); px(g, c + 1, y + 1, GD[1]); } }
  { const c = bcx(shY + 1); rect(g, c - 4, shY - 1, 9, 3, SK[2]); rect(g, c - 4, shY - 1, 9, 1, SK[3]); rect(g, c - 3, shY + 2, 7, 1, SK[1]); rect(g, c - 5, shY + 2, 11, 1, GD[2]); rect(g, c - 5, shY + 2, 4, 1, GD[4]); ruby(g, c, shY + 5, 1); void hy; }   // the neckline's gold trim, the brooch
  const c = bcx(waistY), c0 = c - 6;
  rect(g, c0 - 1, waistY - 3, 14, 4, INK2); rect(g, c0, waistY - 2, 13, 3, PU[2]); rect(g, c0, waistY - 2, 13, 1, PU[4]); rect(g, c0, waistY, 13, 1, PU[1]); rect(g, c + 1, waistY - 2, 4, 3, GD[0]); rect(g, c + 2, waistY - 2, 2, 3, GD[3]); px(g, c + 2, waistY - 2, GD[4]);   // the Queen's purple sash and a gold clasp
}
function sitMound(g, hemY, hw, waistY) {
  for (let y = waistY + 2; y <= hemY; y++) { const k = (y - waistY - 2) / Math.max(1, hemY - waistY - 2), half = Math.round(7 + (hw - 7) * Math.pow(k, 0.55)), c = CX;
    for (let x = c - half; x <= c + half; x++) { const u = (x - c) / half, pf = (((u + 1) * 2.8) % 1 + 1) % 1; let t = pf < 0.1 ? 0 : pf < 0.4 ? 2 : pf < 0.55 ? 3 : 2; if (u < -0.5) t = Math.min(4, t + 1); if (u > 0.5) t = Math.max(0, t - 1);
      let col = GM[t]; if (y >= hemY - 2) col = y === hemY ? GD[1] : y === hemY - 1 ? GD[2] : GD[3]; if (y === hemY - 3 && (x - c) % 4 === 0) col = PK[3]; if (x === c - half) col = PK[3]; px(g, x, y, col); } }
}
function purse(g, x, y, n) {
  tube(g, x + 3, y - 3, x + 3, y, 2, GD); blob(g, x + 4, y + 4, 4.4, 4.4, PU); rect(g, x + 1, y + 1, 7, 1, GD[2]); px(g, x, y + 2, GD[3]); px(g, x + 8, y + 2, GD[3]); px(g, x + 3, y + 3, PU[4]);
  if (n > 1) for (let i = 0; i < 3; i++) px(g, x + 2 + i * 2, y - (i & 1), C.gem[i]);
}
/* the rapier: a long thin silver blade with a bright fuller, a glint; the gold cup is drawn after the glove */
function rapier(g, A, b, glint) {
  const [x0, y0, x1, y1] = b, ax = A.hx + x0, ay = A.hy + y0, bx = A.hx + x1, by = A.hy + y1, len = Math.max(1, Math.hypot(bx - ax, by - ay));
  line(g, ax, ay - 1, bx, by - 1, INK2, 1); line(g, ax, ay + 1, bx, by + 1, INK2, 1);
  line(g, ax, ay, bx, by, ST[2], 1); line(g, ax, ay - 1, bx, by - 1, ST[3], 1);
  for (let i = 2; i < len; i += 5) { const t = i / len; px(g, ax + (bx - ax) * t, ay + (by - ay) * t - 1, '#fff'); }
  px(g, bx, by, '#fff'); px(g, bx + 1, by, ST[3]);
  if (glint) { rect(g, bx - 4, by, 9, 1, '#fff'); rect(g, bx, by - 4, 1, 9, '#fff'); rect(g, bx - 1, by - 1, 3, 3, '#fff'); px(g, bx - 2, by - 2, ST[3]); px(g, bx + 2, by + 2, ST[3]); px(g, bx + 2, by - 2, ST[3]); px(g, bx - 2, by + 2, ST[3]); }
}
function guardOver(g, A, b) {
  const [x0, y0, x1, y1] = b, dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, gx = A.hx + ux * 5.5, gy = A.hy + uy * 5.5, nx = -uy, ny = ux;
  tube(g, gx - nx * 4, gy - ny * 4, gx + nx * 4, gy + ny * 4, 2, GD);                                                   // the cross-bar
  blob(g, A.hx + ux * 4.5, A.hy + uy * 4.5, 2.2, 2.2, GD); px(g, A.hx + ux * 4.5 - 1, A.hy + uy * 4.5 - 1, GD[4]);              // the cup guard
}
/* the fan: closed it is a pink feathered wand; open a half circle of pleated ribs with a white feather edge */
function fanClosedOver(g, x, y, dir) {
  tube(g, x, y - 1, x + 2 * dir, y - 12, 3, PK); rect(g, x + 2 * dir - 1, y - 14, 3, 3, '#fff'); px(g, x + 2 * dir - 2, y - 13, '#fff'); px(g, x + 2 * dir + 2, y - 13, PK[4]); rect(g, x - 1, y - 2, 3, 2, GD[2]);
}
function fanArt(g, hx, hy, o, dir, ang) {
  if (o === 0) return;
  const R = o === 2 ? 19 : 14, a0 = (ang !== undefined ? ang : 50) * dir * Math.PI / 180, spread = o === 2 ? 1.25 : 0.95, ox = hx, oy = hy - 1, N = o === 2 ? 8 : 6;
  const tipOf = (a) => [ox + Math.sin(a) * R, oy - Math.cos(a) * R];
  for (const ink of [1, 0]) for (let y = Math.floor(oy - R - 4); y <= oy + 4; y++) for (let x = Math.floor(ox - R - 4); x <= ox + R + 4; x++) {
    const dx = x + 0.5 - ox, dy = y + 0.5 - oy, r = Math.hypot(dx, dy); if (r > R + 3 || r < 0.5) continue;
    const a = Math.atan2(dx, -dy) - a0, bi = Math.min(N - 1, Math.max(0, Math.floor((a + spread) / (spread * 2) * N))), edge = R - ((bi & 1) ? 1.8 : 0);
    if (ink) { if (Math.abs(a) <= spread + 0.12 && r <= edge + 1.8 + (r < 3 ? 1 : 0)) px(g, x, y, INK2); continue; }
    if (Math.abs(a) > spread || r > edge + 0.6) continue;
    let col = r > edge - 1.6 ? '#ffffff' : (bi & 1) ? PK[2] : PK[4];
    if (r < 6) col = PK[2]; const rib = (((a + spread) / (spread * 2) * N) % 1) < 0.09; if (rib && r > 2 && r < edge - 1) col = PK[1];
    if (r > edge - 1.6 && ((x + y) & 1)) col = PK[4];
    px(g, x, y, (a < -spread * 0.45) ? shade(col, 0.1) : (a > spread * 0.5 ? shade(col, -0.14) : col)); }
  for (const a of [-spread, spread]) { const [tx, ty] = tipOf(a0 + a); tube(g, ox, oy, tx * 0.8 + ox * 0.2, ty * 0.8 + oy * 0.2, 2, GD, INK2); }
  rect(g, ox - 1, oy - 1, 3, 3, GD[2]); px(g, ox - 1, oy - 1, GD[4]);
}
function handbell(g, x, y) {
  const bx = x, by2 = y - 13;
  tube(g, bx, y - 2, bx, by2 + 10, 3, GD);
  blob(g, bx, by2 + 4, 6, 5.6, GD); rect(g, bx - 7, by2 + 8, 15, 2, GD[0]); rect(g, bx - 6, by2 + 8, 13, 1, GD[3]); px(g, bx - 2, by2 + 1, GD[4]); px(g, bx - 3, by2 + 2, GD[4]); rect(g, bx - 1, by2 - 2, 3, 2, GD[2]); blob(g, bx, by2 + 11, 1.6, 1.6, GD);
  for (const [dx, dy] of [[-10, 0], [-11, 5], [10, 0], [11, 5], [-9, -4], [9, -4]]) { rect(g, bx + dx, by2 + dy, 1, 2, '#fff6c8'); }
}

/* the pose of every frame */
function pose(f) {
  const rp = (i) => ({ by: i & 1 ? 2 : 0, legs: [[6, -6], [2, -2], [-6, 6], [-2, 2]][i], lean: 3 + (i & 1), skirt: [-3, -1, -3, -1][i], flare: 2 + (i & 1), fa: [[6, 3], [6, 4], [7, 5], [6, 4]][i], ba: [[-7, 2], [-6, 4], [-4, 5], [-6, 4]][i], blade: [8, -2, 17, -7], fan: 0, fly: 2 + (i & 1), lift: [0, 3, 5, 0][i], liftB: [5, 0, 0, 3][i], hemTilt: [2, 0, -2, 0][i], mouth: 'smirk', eyes: 'smug', ph: i * 0.25 });
  switch (f) {
    case 0: return { legs: [1, -1], fa: [6, 4], ba: [-5, 6], blade: [8, -2, 18, -8], fan: 0, ears: 0, eyes: 'smug', mouth: 'smirk', browUp: 1 };
    case 1: return { by: 1, legs: [1, -1], fa: [6, 5], ba: [-5, 6], blade: [8, -1, 18, -6], fan: 0, ears: 1, eyes: 'shut', mouth: 'smile', ph: 0.15 };
    case 2: case 3: case 4: case 5: return rp(f - 2);
    case 6: return { crouch: 3, lean: -2, legs: [-6, 5], fa: [-6, 3], ba: [-3, 3], blade: [-2, -4, 12, -4], glint: 1, skirt: 3, eyes: 'angry', mouth: 'grin', ears: 1 };
    case 7: return { crouch: 3, lean: 6, legs: [9, -7], fa: [12, 2], ba: [-7, 1], blade: [4, 0, 22, -3], skirt: 6, flare: 1, eyes: 'angry', mouth: 'shout', fan: 0, fly: 3, ph: 0.3,
      fx: (g, o) => { g.globalAlpha = 0.55; for (let i = 0; i < 4; i++) rect(g, o.hx - 26 - i * 3, o.hy + 6 + i * 8, 14 - i * 2, 1, '#fff'); g.globalAlpha = 1; } };
    case 8: return { lean: 0, legs: [3, -3], fa: [3, -9], ba: [-6, 4], blade: [1, -4, 6, -17], glint: 1, eyes: 'angry', mouth: 'grin', ears: 1 };
    case 9: return { lean: 3, crouch: 1, legs: [4, -4], fa: [10, 1], ba: [-6, 3], blade: [4, 0, 19, -2], eyes: 'angry', mouth: 'shout', skirt: 2 };
    case 10: return { lean: 4, crouch: 1, legs: [5, -4], fa: [9, -4], ba: [-6, 3], blade: [4, -1, 18, -9], eyes: 'angry', mouth: 'shout', skirt: 2 };
    case 11: return { lean: 1, legs: [1, -1], fa: [-3, 8], ba: [-5, 5], blade: null, purse: 2, eyes: 'open', mouth: 'grin', ears: 1, browUp: 1, fx: (g, o) => { rect(g, o.fhx - 2, o.fhy - 4, 3, 3, C.gem[0]); px(g, o.fhx - 2, o.fhy - 4, '#fff'); rect(g, o.fhx + 2, o.fhy - 6, 3, 3, C.gem[1]); px(g, o.fhx + 2, o.fhy - 6, '#fff'); } };
    case 12: return { lean: 3, legs: [3, -3], fa: [11, -4], ba: [-6, 4], blade: null, purse: 1, eyes: 'open', mouth: 'shout', fx: (g, o) => { for (let i = 0; i < 3; i++) { const x = o.fhx + 7 + i * 7, y = o.fhy - 8 + i * 3; rect(g, x, y, 4, 4, C.gem[i]); px(g, x, y, '#fff'); px(g, x + 3, y + 3, shade(C.gem[i], -0.4)); } } };
    case 13: return { lean: -1, legs: [2, -2], fa: [4, 2], ba: [-4, -3], blade: [6, -1, 13, -5], fan: 1, fanDir: -1, fanAng: 40, mouth: 'smirk', eyes: 'smug', ears: 1 };
    case 14: return { lean: -4, legs: [-3, 6], fa: [4, 2], ba: [6, -2], blade: null, fan: 2, fanDir: 1, fanAng: 60, skirt: 4, flare: 3, fly: 6, mouth: 'shout', eyes: 'shut', ph: 0.4,
      fx: (g, o) => { for (let i = 0; i < 4; i++) { rect(g, o.fhx + 14 + i * 4, o.hy - 6 + i * 6, 8, 1, C.fan); px(g, o.fhx + 23 + i * 4, o.hy - 5 + i * 6, C.goldL); } } };
    case 15: return { crouch: 7, lean: 0, legs: [-3, 3], fa: [3, 6], ba: [-4, 6], blade: null, fan: 0, skirt: 0, flare: 1, mouth: 'grin', eyes: 'open', ears: 1 };
    case 16: return { air: 1, by: -4, lean: 1, legs: [-5, 4], lift: 5, fa: [7, -8], ba: [-7, -7], blade: null, fan: 0, skirt: 5, flare: 3, fly: 4, eyes: 'wide', mouth: 'shout', ears: 1, ph: 0.5 };
    case 17: return { lean: 0, legs: [1, -1], fa: [3, -12], ba: [-5, 5], blade: null, tiara: 'hand', eyes: 'angry', mouth: 'grin', ears: 1, flush: 1 };
    case 18: return { lean: 3, legs: [3, -3], fa: [12, -3], ba: [-5, 5], blade: null, tiara: 'off', eyes: 'angry', mouth: 'shout', ears: 1, flush: 1 };
    case 19: return { lean: 0, crouch: 0, legs: [1, -1], lift: 5, fa: [5, 6], ba: [-5, 6], blade: null, eyes: 'angry', mouth: 'shout', ears: 1, flare: 1, flush: 1,
      fx: (g, o) => { for (const s of [-1, 1]) { const x = o.hx + s * 14, y = o.hy - 14; rect(g, x - 2, y, 5, 1, '#ff5a3c'); rect(g, x, y - 2, 1, 5, '#ff5a3c'); px(g, x - 1, y - 1, '#ffb060'); } } };
    case 20: return { crouch: 4, lean: 0, legs: [6, -6], fa: [8, 2], ba: [-8, 2], blade: null, eyes: 'angry', mouth: 'wail', ears: 2, skirt: 0, flare: 3, flush: 1,
      fx: (g) => { for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { circle(g, CX + s * (17 + i * 7), G - 3 - i, 3 - (i > 1 ? 1 : 0), i ? '#8a8aa0' : '#c9c9d6'); } g.globalAlpha = 0.6; for (let i = 0; i < 4; i++) rect(g, CX - 22 + i * 14, G - 1, 6, 1, '#fff'); g.globalAlpha = 1; } };
    case 21: return { lean: -1, legs: [1, -1], fa: [-2, -9], ba: [-5, 5], blade: [2, 0, 9, 3], eyes: 'happy', mouth: 'smirk', ears: 1, tilt: -1 };
    case 22: return { by: 0, lean: -1, legs: [1, -1], fa: [-6, -3], ba: [3, -8], blade: [2, 2, 4, 14], fan: 1, fanDir: 1, fanAng: 30, eyes: 'shut', mouth: 'pout', ears: 1, tilt: 1 };
    case 23: return { crouch: 9, slump: 3, lean: -2, legs: [-4, 4], fa: [-3, -9], ba: [-1, -8], blade: null, eyes: 'cry', mouth: 'wail', ears: 2, tiara: 'crooked', skirt: 0, flare: 4,
      fx: (g, o) => { const x0 = o.hx - 18, x1 = o.hx + 20; rect(g, x0, o.hy - 20, x1 - x0, 3, '#34343f'); rect(g, x0, o.hy - 20, x1 - x0, 1, '#9a9ab0'); for (let x = x0 + 2; x < x1; x += 9) { rect(g, x, o.hy - 20, 2, 44, '#3a3a48'); rect(g, x, o.hy - 20, 1, 44, '#b0b0c8'); rect(g, x + 1, o.hy - 20, 1, 44, '#1a1a22'); } rect(g, x0, o.hy + 22, x1 - x0, 2, '#34343f'); } };
    case 24: return { lean: -2, legs: [-3, 2], fa: [5, 5], ba: [-6, 5], blade: null, eyes: 'spiral', mouth: 'wail', ears: 2, tiara: 'crooked', tilt: -2, slump: 1,
      fx: (g, o) => { for (let i = 0; i < 3; i++) { const a = i * 2.1; const x = Math.round(o.hx + Math.cos(a) * 13), y = Math.round(o.hy - 17 + Math.sin(a) * 3); rect(g, x, y, 3, 1, C.gold); rect(g, x + 1, y - 1, 1, 3, C.goldL); } } };
    case 25: return { lean: -5, legs: [-4, 5], fa: [7, -5], ba: [-8, -4], blade: [4, -1, 12, -6], eyes: 'wide', mouth: 'shout', ears: 1, tilt: -2, skirt: 5, flare: 3, fan: null, ph: 0.2 };
    case 26: case 27: { const k = f - 26; return { by: k, lean: 4, legs: k ? [-6, 6] : [6, -6], lift: k ? 4 : 1, fa: [-3, 6], ba: [-8, -6], blade: null, eyes: 'wide', mouth: 'shout', ears: 1, skirt: -6, flare: 3, fly: 4, tilt: -2, ph: k * 0.5,
      fx: (g, o) => { rect(g, o.hx - 19, o.hy - 12, 2, 3, '#9ad8ff'); rect(g, o.hx - 22, o.hy - 6, 2, 3, '#bfe8ff'); } }; }
    case 28: return { crouch: 9, slump: 2, lean: 2, legs: [-3, 3], fa: [2, -9], ba: [-3, -9], blade: null, eyes: 'wide', mouth: 'pout', ears: 2, skirt: 0, flare: 4 };
    case 29: return { crouch: 8, lean: 1, legs: [-4, 4], fa: [5, 4], ba: [-3, 3], blade: null, fan: 1, fanDir: -1, fanAng: 35, eyes: 'smug', mouth: 'grin', ears: 1, skirt: -1, flare: 3 };
    case 30: return { lean: 3, legs: [6, -6], lift: 2, fa: [5, -12], ba: [-6, -12], blade: null, eyes: 'cry', mouth: 'wail', ears: 2, skirt: -5, flare: 3, fly: 4, by: -1, ph: 0.3 };
    case 31: return { sit: 1, crouch: 8, slump: 3, lean: 0, legs: [0, 0], fa: [-3, -5], ba: [3, -4], blade: null, eyes: 'cry', mouth: 'wail', ears: 2, tiara: 'off', skirt: 0, flare: 4,
      fx: (g) => { tiaraLying(g, CX + 24, G - 1); rect(g, CX - 18, G - 5, 8, 4, INK2); rect(g, CX - 17, G - 5, 7, 3, PK[2]); rect(g, CX - 17, G - 5, 7, 1, PK[4]); } };
    case 32: return { lean: 1, legs: [1, -1], fa: [5, -9], ba: [-6, 5], blade: null, handbell: 1, eyes: 'wide', mouth: 'shout', ears: 1 };
    default: return { by: 1, lean: -3, legs: [-2, 3], fa: [-4, -4], ba: [-6, -3], blade: [-2, 0, 4, 6], eyes: 'shut', mouth: 'wail', ears: 2, tilt: -3, skirt: 3, flare: 2, fan: null };
  }
}
function tiaraLying(g, x, y) { rect(g, x - 7, y - 4, 15, 4, GD[0]); rect(g, x - 6, y - 4, 13, 3, GD[2]); rect(g, x - 6, y - 4, 13, 1, GD[4]); for (const k of [-5, -2, 1, 4, 6]) { rect(g, x + k, y - 7, 2, 3, GD[2]); px(g, x + k, y - 7, GD[4]); } ruby(g, x, y - 2, 1); }

/* a lit top-left rim and a shaded bottom-right edge on the whole silhouette: the highlight edge and the mass */
function rim(c) {
  const g = c.getContext('2d'), w = c.width, h = c.height, d = g.getImageData(0, 0, w, h).data, a = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : d[(y * w + x) * 4 + 3];
  const out = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (!a(x, y)) continue; const i = (y * w + x) * 4, col = [d[i], d[i + 1], d[i + 2]];
    if (!a(x - 1, y) || !a(x, y - 1)) out.push([x, y, shade('#' + col.map(v => v.toString(16).padStart(2, '0')).join(''), 0.22)]);
    else if (!a(x + 1, y) || !a(x, y + 1)) out.push([x, y, shade('#' + col.map(v => v.toString(16).padStart(2, '0')).join(''), -0.22)]); }
  for (const [x, y, col] of out) px(g, x, y, col);
}

export function bakeGoblinPrincess() {
  const F = Array.from({ length: GP_FRAMES }, (_, f) => { const [c, g] = canvas(W, H); draw(g, pose(f)); rim(c); outline(c, OUT); return c; });
  return { R: F, L: F.map(c => flipX(c)), white: { R: F.map(c => whiten(c)), L: F.map(c => flipX(whiten(c))) }, ax: CX, ay: G, w: GP_BOX.w, h: GP_BOX.h };
}

/* which frame a mode wears (src/goblin-princess.js H.frame calls this). e.anim runs while she moves; e.vx her speed; e.mode her move. */
export function gpFrame(e) {
  const m = e.mode, a = e.anim || 0, moving = Math.abs(e.vx || 0) > 4, A = Math.floor(a * 9);
  switch (m) {
    case 'lungeTell': return GPF.lungeTell; case 'lunge': return GPF.lunge;
    case 'flurryTell': return GPF.flurryTell; case 'flurry': return GPF.poke + (Math.floor(a * 16) & 1);
    case 'trinketTell': return GPF.trinketTell; case 'trinket': return GPF.trinket;
    case 'fanTell': return GPF.fanTell; case 'fan': return GPF.fan;
    case 'hopTell': return GPF.hopTell; case 'hop': return GPF.hop;
    case 'tiaraTell': return GPF.tiaraTell; case 'tiara': case 'tiaraWait': return GPF.tiara;
    case 'stompTell': return GPF.stompTell; case 'stomp': return GPF.stomp;
    case 'preen': return GPF.preen + (Math.floor(a * 3) & 1);
    case 'pinned': return GPF.pinned; case 'stunned': return GPF.stunned; case 'stagger': return GPF.stagger;
    case 'bolt': return GPF.bolt + (A & 1); case 'escape': return GPF.escape; case 'hide': case 'ducked': return GPF.hide; case 'perch': return GPF.perch;
    case 'walk': case 'recover': return moving ? GPF.run + (A & 3) : (Math.floor(a * 2) & 1 ? 1 : 0);
    default: return moving ? GPF.run + (A & 3) : 0;
  }
}

// ---------------- PARTS: the gems she throws, the tiara in flight, the stomp's ripple, the fan's gust ----------------
export function drawGem(g, x, y, col, time, id = 0) {                                                    // a cut gem, five pixels across, with a glint that turns
  const X = Math.round(x), Y = Math.round(y), k = Math.floor(time * 14 + id) & 3, d = shade(col, -0.45), l = shade(col, 0.55);
  rect(g, X - 3, Y - 2, 7, 5, INK2); rect(g, X - 2, Y - 3, 5, 7, INK2);
  rect(g, X - 2, Y - 1, 5, 3, col); rect(g, X - 1, Y - 2, 3, 1, l); rect(g, X - 1, Y + 2, 3, 1, d); rect(g, X + 2, Y, 1, 2, d); px(g, X - 2, Y - 1, l); px(g, X + (k < 2 ? -1 : 1), Y, '#ffffff');
  px(g, X - 4 + k, Y - 4 + (k & 1) * 8, '#fff6c8'); }
export function drawTiaraFlying(g, x, y, time, home) {                                                   // the toy tiara: spins end over end; green-white when you have parried it home
  const X = Math.round(x), Y = Math.round(y), a = Math.floor(time * 16) & 3, gold = home ? '#8fd160' : C.gold, hi = home ? '#e8ffd0' : C.goldL, lo = home ? '#4f8236' : GD[1];
  if (a & 1) { rect(g, X - 3, Y - 7, 6, 15, INK2); rect(g, X - 2, Y - 6, 4, 13, gold); rect(g, X - 2, Y - 6, 1, 13, hi); rect(g, X + 1, Y - 6, 1, 13, lo); px(g, X, Y - 7, hi); px(g, X, Y + 7, hi); rect(g, X - 1, Y - 1, 2, 2, '#ff4a6a'); }
  else { rect(g, X - 9, Y - 2, 18, 6, INK2); rect(g, X - 8, Y - 1, 16, 4, gold); rect(g, X - 8, Y - 1, 16, 1, hi); rect(g, X - 8, Y + 2, 16, 1, lo);
    for (const k of [-8, -4, 0, 4, 7]) { rect(g, X + k, Y - 5 - (k === 0 ? 3 : 0), 2, 4 + (k === 0 ? 3 : 0), gold); rect(g, X + k, Y - 5 - (k === 0 ? 3 : 0), 1, 4 + (k === 0 ? 3 : 0), hi); } rect(g, X - 1, Y - 1, 3, 3, '#ff4a6a'); px(g, X - 1, Y - 1, '#ffa0b4'); px(g, X - 5, Y + 1, '#4ad0ff'); px(g, X + 5, Y + 1, '#7aff8a'); }
  g.globalAlpha = 0.35; rect(g, X - 13 + (a & 1) * 3, Y - 1, 4, 1, hi); g.globalAlpha = 1; }
export function drawRipple(g, x, fy, time, k = 0) {                                                      // the stomp's shock: a travelling wave of cracked flagstone you jump
  const X = Math.round(x), a = Math.floor(time * 18) & 1;
  rect(g, X - 6, fy - 5, 12, 5, '#7a7a8a'); rect(g, X - 6, fy - 5, 12, 1, '#c9c9d6'); rect(g, X - 4, fy - 7 - a, 8, 2, '#a0a0b0'); rect(g, X - 2, fy - 9 - a, 4, 2, '#c9c9d6');
  rect(g, X - 8, fy - 1, 3, 1, '#3a3a44'); rect(g, X + 5, fy - 1, 3, 1, '#3a3a44'); px(g, X - 7, fy - 2, '#c9c9d6'); px(g, X + 6, fy - 3, '#c9c9d6'); void k; }
export function drawFanGust(g, x, y, face, time, len = 60) {                                             // a gust of pink feather-light air: three streaks and fluttering down
  for (let i = 0; i < 3; i++) { const xx = Math.round(x + face * (8 + ((time * 120 + i * 17) % len))), yy = Math.round(y - 8 + i * 5 + Math.sin(time * 20 + i) * 1.5); rect(g, face > 0 ? xx : xx - 6, yy, 6, 1, i & 1 ? C.fan : '#ffffff'); px(g, xx + face * 6, yy + 1, C.fanD); } }

/* ONE sheet for the whole game: main.js SPR.gprincess and src/goblin-princess.js's chase actor share it */
let SHEET = null;
export function sheet() { return SHEET || (SHEET = bakeGoblinPrincess()); }
