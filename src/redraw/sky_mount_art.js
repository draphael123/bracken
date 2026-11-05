// sky_mount_art.js - THE DRAKE AS A MOUNT, SEEN FROM THE SIDE (claude/skyart, lane S4). The same Fire Drake as src/redraw/fire_drake_art.js (hide ramp, bone horns, belly, iron collar
// with its ring and a BROKEN chain trailing from it: the chains it tore are why it flies), drawn as a flying mount: the BACK is the strip the hero walks (src/sky-mount.js).
// Baked parts, composed per frame by src/sky-mount-draw.js (the back tilts and bobs, so the body is cut in 2 px slices and sheared):
//   backTile()    192 x 46   the back + flank: scale plates, ember cracks, the volcano's under-glow on the belly (top row y 0 = the walking line)
//   neckHead(v)   104 x 74   v 'calm' | 'tell' (head lowered toward the bank, gold eye, jaws ajar) | 'roar' ; neck base at NECK_AT
//   tailSprite(k) 104 x 34   5 sway frames, tail root at TAIL_AT
//   wingSprite(flap, near)   112 x 90
//   spineWall()   12 x 34    the neck wall (dorsal spikes);  finWall()  10 x 30  the tail wall (a bone-ribbed fin)
// px.js primitives only, so tools/sky-art.mjs renders it in Node.
import { canvas, px, rect, fillPoly, line, circle, ellipse, outline, shade, mulberry } from '../px.js';
import { OUT } from '../art.js';

const K = {
  hide: ['#2a0e0a', '#4a1810', '#7a2a1c', '#a8402a', '#c8603a'],
  belly: ['#6a4220', '#a8742c', '#d8a04a', '#f0c870'],
  horn: ['#6a5a40', '#b89c70', '#e8d8b0', '#fff4d8'],
  iron: ['#2a2622', '#5a5248', '#8a8070', '#b8ac98'],
  wing: ['#3a100c', '#5a1c14', '#8a3020', '#b04a2a'],
  eye: '#ffd36b', eyeH: '#fff6c0', ember: '#ff9a3a', emberH: '#ffe08a', fire: '#ff5a1a', mouth: '#2a0a06', mouthL: '#6a1a10', tooth: '#f4ecd0', smoke: '#9a9090',
};
export const MOUNT_PAL = K;
export const BACK = { w: 192, h: 46 };
export const NECK_AT = { x: 6, y: 62 };            /* the neck's root in neckHead(): sits on the back line at the ridge */
export const TAIL_AT = { x: 100, y: 6 };           /* the tail's root in tailSprite(): sits on the back line at the tail end */
export const WING_ROOT = { x: 98, y: 40 };         /* the shoulder in wingSprite() */

const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const bez = (a, b, c, t) => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * b[0] + t * t * c[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * b[1] + t * t * c[1]];
const lerp = (a, b, t) => a + (b - a) * t;
function seg(g, x0, y0, x1, y1, w0, w1, col, dith) {
  const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  fillPoly(g, [[x0 + nx * w0 / 2, y0 + ny * w0 / 2], [x1 + nx * w1 / 2, y1 + ny * w1 / 2], [x1 - nx * w1 / 2, y1 - ny * w1 / 2], [x0 - nx * w0 / 2, y0 - ny * w0 / 2]], col, dith); circle(g, x1, y1, w1 / 2, col);
}
function tube(g, pts, ws) {
  pts.forEach(([x, y], i) => circle(g, x, y, ws[i] / 2 + 0.5, K.hide[1]));
  pts.forEach(([x, y], i) => circle(g, x, y - ws[i] * 0.08, ws[i] / 2 - 0.5, K.hide[2], K.hide[1]));
  pts.forEach(([x, y], i) => { if (ws[i] > 3) circle(g, x, y - ws[i] * 0.22, ws[i] * 0.26, K.hide[3]); });
  pts.forEach(([x, y], i) => { if (ws[i] > 3) circle(g, x + 0.5, y + ws[i] * 0.3, Math.max(1, ws[i] * 0.18), K.belly[2], K.belly[1]); });
}
const clean = c => { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0; g.putImageData(img, 0, 0); return c; };
const finish = c => outline(clean(c), OUT);
const cache = new Map();
const memo = (key, fn) => { let v = cache.get(key); if (!v) { v = fn(); cache.set(key, v); } return v; };
export function clearMountArt() { cache.clear(); }

/* THE BACK + FLANK, 192 x 46. Row 0 is the walking line. The belly curve is 10 + sin(u*PI)*18 deep (the greybox's), so the hull reads as the same shape. */
export function backTile() {
  return memo('back', () => {
    const [c, g] = canvas(BACK.w, BACK.h), rnd = mulberry(77);
    const depth = u => 11 + Math.sin(u * Math.PI) * 20;
    for (let x = 0; x < BACK.w; x++) {
      const u = x / BACK.w, d = depth(u) + 3;
      for (let y = 0; y < d; y++) {
        const t = y / d;                                   /* 0 = back, 1 = belly line */
        const row = Math.floor(y / 4), lx = (x + (row & 1) * 3) % 6, ly = y % 4;
        const edge = (ly === 3 && lx >= 1 && lx <= 4) || (ly === 2 && (lx === 0 || lx === 5)), hl = ly === 0 && lx >= 1 && lx <= 3;   /* overlapping scalloped scales */
        let col = t < 0.12 ? K.hide[4] : t < 0.3 ? K.hide[3] : t < 0.62 ? K.hide[2] : t < 0.84 ? K.hide[1] : K.hide[0];
        if (edge && t > 0.1) col = t < 0.6 ? K.hide[1] : K.hide[0];
        else if (hl && t > 0.1 && t < 0.75) col = K.hide[3];
        if (t > 0.86) col = ((x + y) & 1) ? K.belly[0] : K.hide[0];      /* belly line: pale scutes catching the glow from below */
        if (t > 0.92) col = ((x >> 1) & 1) ? K.belly[1] : K.belly[0];
        g.fillStyle = col; g.fillRect(x, y, 1, 1);
      }
    }
    /* dorsal plates: a low ridge of bone-pale scutes ON the back line (3 px - the hero stands on them, so they never rise above the walking line) */
    for (let x = 4; x < BACK.w - 4; x += 8) { rect(g, x, 0, 5, 1, K.horn[1]); rect(g, x + 1, 0, 3, 1, K.horn[2]); rect(g, x, 1, 5, 1, K.hide[3]); px(g, x + 2, 0, K.horn[3]); }
    for (let x = 0; x < BACK.w; x++) if (x % 8 > 4) rect(g, x, 0, 1, 2, K.hide[4]);
    /* ember cracks (the mountain through the hide), thicker toward the belly where the volcano lights it */
    for (let i = 0; i < 22; i++) {
      let x = 6 + rnd() * (BACK.w - 12), y = 6 + rnd() * 20; const n = 3 + (rnd() * 4 | 0), hot = y > 14;
      for (let k = 0; k < n; k++) { const d = depth(x / BACK.w); if (y > d - 3) break; px(g, x, y, hot ? K.fire : K.hide[0]); if (hot) px(g, x, y - 1, K.ember); x += rnd() < 0.5 ? 1 : 0; y += 1; if (rnd() < 0.4) x += rnd() < 0.5 ? -1 : 1; }
      if (hot) px(g, x, y, K.emberH);
    }
    /* a few old chain scars across the flank (the drake's manacle burns) */
    for (let i = 0; i < 3; i++) { const sx = 30 + i * 52, sy = 8 + i % 2 * 4; for (let k = 0; k < 9; k++) px(g, sx + k, sy + (k >> 1), K.hide[0]); for (let k = 0; k < 7; k++) px(g, sx + 1 + k, sy + 2 + (k >> 1), K.hide[1]); }
    /* the rump: a haunch bulge at the tail end and the wing-root mound at the neck end, drawn as shading */
    for (let y = 2; y < 16; y++) for (let x = 6; x < 30; x++) { const dx = (x - 16) / 12, dy = (y - 9) / 7; if (dx * dx + dy * dy < 1 && dx * dx + dy * dy > 0.7) px(g, x, y, K.hide[1]); else if (dx * dx + dy * dy <= 0.35 && ((x + y) & 1)) px(g, x, y, K.hide[3]); }
    for (let y = 2; y < 18; y++) for (let x = 150; x < 186; x++) { const dx = (x - 168) / 17, dy = (y - 10) / 8; if (dx * dx + dy * dy < 1 && dx * dx + dy * dy > 0.72) px(g, x, y, K.hide[1]); }
    return finish(c);
  });
}

/* THE NECK + HEAD (facing right). 104 x 74; the root is NECK_AT. The collar's iron ring sits low on the neck with a broken chain dangling from it. */
export function neckHead(v = 'calm') {
  return memo('nh' + v, () => {
    const [c, g] = canvas(104, 74), tell = v === 'tell', roar = v === 'roar';
    const A = [NECK_AT.x + 2, NECK_AT.y], B = tell ? [20, 40] : [14, 34], E = tell ? [80, 38] : [82, 22];
    const pts = [], ws = []; for (let i = 0; i <= 18; i++) { const t = i / 18; pts.push(bez(A, B, E, t)); ws.push(lerp(13, 8, t)); }
    /* far horn first (behind the skull) */
    const hx = E[0], hy = E[1], a = tell ? 0.42 : roar ? -0.25 : 0.02;       /* heading: + = nose down */
    const P = (x, y) => { const [rx, ry] = rot(x, y, a); return [hx + rx, hy + ry]; };
    const poly = (list, col, d) => fillPoly(g, list.map(p => P(p[0], p[1])), col, d);
    poly([[-4, -6], [-18, -16], [-28, -12], [-12, -3]], K.horn[0]);
    tube(g, pts, ws);
    /* the iron collar: a band round the neck low down, a ring under it, and two links of a snapped chain */
    { const cp = bez(A, B, E, 0.2), cp2 = bez(A, B, E, 0.26); seg(g, cp[0] - 1, cp[1] + 4, cp2[0] + 1, cp2[1] - 5, 3, 3, K.iron[1]);
      line(g, cp[0] - 1, cp[1] + 4, cp2[0] + 1, cp2[1] - 5, K.iron[3]); const rx = cp[0] + 1, ry = cp[1] + 8;
      circle(g, rx, ry, 3, K.iron[2]); circle(g, rx, ry, 1.5, K.hide[0]);
      for (let i = 0; i < 3; i++) { const lx = rx + (i % 2 ? 1 : -1), ly = ry + 4 + i * 3; rect(g, lx, ly, 2, 3, K.iron[i % 2 ? 1 : 3]); px(g, lx, ly + 1, K.iron[0]); }
      px(g, rx + 2, ry + 12, K.fire); px(g, rx + 1, ry + 13, K.ember); }              /* the last link is still hot where it parted */
    /* head: skull wedge, upper jaw, lower jaw (open by v), brow, nostril, eye */
    const open = roar ? 11 : tell ? 5 : 0;
    poly([[-6, -7], [16, -6], [28, -2], [29, 3], [14, 5], [-6, 7]], K.hide[2], K.hide[1]);                                   /* upper skull + snout */
    poly([[-6, -7], [16, -6], [28, -2], [26, -3], [14, -7], [-6, -9]], K.hide[3]);                                           /* lit top edge */
    poly([[-4, -9], [8, -11], [16, -6], [-4, -6]], K.hide[3]);                                                                /* brow */
    poly([[14, 5], [29, 3], [29, 6], [14, 8 + open * 0.2]], K.hide[0]);                                                      /* lip line */
    if (open) { poly([[-2, 6], [27, 5 + open * 0.2], [26, 8 + open], [-2, 10 + open * 0.5]], roar ? K.mouthL : K.mouth);          /* the mouth */
      poly([[0, 7], [24, 7 + open * 0.3], [24, 8 + open * 0.8], [0, 9 + open * 0.4]], roar ? K.fire : K.mouthL);
      for (let i = 0; i < 4; i++) { const tx = 6 + i * 5; poly([[tx, 6], [tx + 2, 6], [tx + 1, 9 + open * 0.3]], K.tooth); } }
    poly([[-2, 7 + open], [26, 8 + open], [24, 11 + open], [4, 12 + open], [-4, 9 + open]], K.hide[1]);                       /* lower jaw */
    poly([[0, 10 + open], [22, 10 + open], [20, 11 + open]], K.belly[2]);
    { const n = P(25, -1); px(g, n[0], n[1], K.hide[0]); px(g, n[0] - 1, n[1], K.hide[0]); if (tell || roar) { px(g, n[0] + 1, n[1] - 2, K.smoke); px(g, n[0] + 2, n[1] - 4, K.smoke); } }
    { const e = P(10, -4); rect(g, e[0] - 1, e[1] - 1, 4, 3, tell || roar ? K.eyeH : K.eye); px(g, e[0] + 1, e[1], K.hide[0]); px(g, e[0] - 2, e[1] - 1, K.hide[0]); if (tell || roar) { px(g, e[0] + 4, e[1], K.eye); px(g, e[0] - 3, e[1], K.ember); } }
    /* near horn, swept back over the neck + a short brow horn */
    poly([[-3, -8], [-16, -18], [-30, -14], [-34, -8], [-18, -10], [-6, -1]], K.horn[1]);
    poly([[-3, -8], [-16, -18], [-30, -14], [-14, -13], [-4, -6]], K.horn[2]);
    poly([[-30, -14], [-36, -8], [-33, -13]], K.horn[3]);
    poly([[4, -10], [8, -16], [10, -9]], K.horn[2]);
    /* a frill of spines down the back of the neck */
    for (let i = 3; i < 16; i += 3) { const p = pts[i], q = bez(A, B, E, i / 18 - 0.02); px(g, p[0] - ws[i] / 2 - 1, p[1] - ws[i] / 2 + 2, K.horn[2]); px(g, p[0] - ws[i] / 2 - 2, p[1] - ws[i] / 2 + 1, K.horn[1]); void q; }
    if (roar) { const m = P(30, 7 + open * 0.5); for (let i = 0; i < 6; i++) { px(g, m[0] + i * 2, m[1] + (i % 2) - 1, i < 3 ? K.emberH : K.fire); } circle(g, m[0] + 1, m[1], 2, K.ember); }
    return finish(c);
  });
}

/* THE TAIL: a long barbed tail trailing behind (to the left), 5 sway frames. TAIL_AT is the root (its right end). */
export function tailSprite(k = 2) {
  return memo('tail' + k, () => {
    const [c, g] = canvas(104, 34), sway = (k - 2) * 3.2;
    const A = [TAIL_AT.x, TAIL_AT.y + 6], B = [64, 16 + sway * 0.4], E = [8, 18 + sway];
    const pts = [], ws = []; for (let i = 0; i <= 22; i++) { const t = i / 22; pts.push(bez(A, B, E, t)); ws.push(lerp(13, 2.5, Math.pow(t, 0.8))); }
    tube(g, pts, ws);
    for (let i = 3; i < 20; i += 3) px(g, pts[i][0], pts[i][1] - ws[i] / 2 - 1, K.horn[2]);
    /* the spade: a barbed arrowhead of bone-and-hide at the end */
    const t0 = pts[20], t1 = pts[22], dx = t1[0] - t0[0], dy = t1[1] - t0[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
    fillPoly(g, [[t1[0] + ux * 2, t1[1] + uy * 2], [t0[0] + nx * 8 - ux * 3, t0[1] + ny * 8 - uy * 3], [t0[0] - ux * 2, t0[1] - uy * 2], [t0[0] - nx * 8 - ux * 3, t0[1] - ny * 8 - uy * 3]], K.hide[2], K.hide[1]);
    fillPoly(g, [[t1[0] + ux * 2, t1[1] + uy * 2], [t0[0] + nx * 8 - ux * 3, t0[1] + ny * 8 - uy * 3], [t0[0] - ux * 2, t0[1] - uy * 2]], K.horn[1]);
    px(g, t1[0] + ux, t1[1] + uy, K.horn[3]);
    return finish(c);
  });
}

/* THE WINGS: 112 x 90; flap in [-1, 1] (-1 = up-stroke, +1 = down-stroke). near = the wing nearer the camera (lighter, ember-lit membrane) */
export function wingSprite(flap = 0, near = true) {
  const q = Math.round(Math.max(-1, Math.min(1, flap)) * 3) / 3;
  return memo('wing' + q + near, () => {
    const [c, g] = canvas(112, 90), t = (q + 1) / 2, R = [WING_ROOT.x, WING_ROOT.y];
    const up = { w: [78, 12], tips: [[28, 4], [14, 22], [32, 44]] }, md = { w: [78, 36], tips: [[22, 24], [10, 44], [30, 64]] }, dn = { w: [74, 72], tips: [[24, 86], [10, 64], [34, 42]] };
    const a = t < 0.5 ? up : md, b = t < 0.5 ? md : dn, u = t < 0.5 ? t * 2 : (t - 0.5) * 2;
    const W = [lerp(a.w[0], b.w[0], u), lerp(a.w[1], b.w[1], u)], tips = a.tips.map((p, i) => [lerp(p[0], b.tips[i][0], u), lerp(p[1], b.tips[i][1], u)]);
    const M = K.wing, dk = near ? 0 : 1;
    /* the membrane: arm -> tips, scalloped trailing edge between the finger tips */
    const edge = []; for (let i = 0; i < tips.length - 1; i++) { const a = tips[i], b = tips[i + 1], mid = [(a[0] + b[0]) / 2 + 3, (a[1] + b[1]) / 2 + 2]; edge.push(a, mid); } edge.push(tips[tips.length - 1]);
    const poly = [[R[0] + 4, R[1] + 2], W, ...edge, [R[0] - 8, R[1] + 6]];
    fillPoly(g, poly, M[dk ? 0 : 1]);
    fillPoly(g, [[R[0] + 3, R[1] + 1], W, ...edge.slice(0, 3), [R[0] - 6, R[1] + 4]], M[dk ? 1 : 2], M[dk ? 0 : 1]);
    if (near) fillPoly(g, [W, tips[0], edge[1], [W[0] - 6, W[1] + (q > 0 ? -8 : 8)]], M[3], M[2]);
    /* ember under-glow along the trailing edge: the volcano lights the membrane from below */
    for (let i = 0; i < edge.length - 1; i++) { const a = edge[i], b = edge[i + 1]; for (let s = 0; s <= 6; s++) { const x = lerp(a[0], b[0], s / 6), y = lerp(a[1], b[1], s / 6); if (((s + i) & 1) === 0) px(g, x + 1, y + (q > 0 ? -1 : 1), near ? K.ember : K.fire); } }
    for (const tp of tips) line(g, W[0], W[1], tp[0], tp[1], K.horn[dk ? 0 : 1]);
    seg(g, R[0] + 4, R[1] + 2, W[0], W[1], 4, 2.5, K.hide[dk ? 1 : 2]); line(g, R[0] + 4, R[1], W[0], W[1] - 1, K.hide[3]);
    px(g, W[0], W[1] - 2, K.horn[2]); px(g, W[0] - 1, W[1] - 3, K.horn[3]); px(g, W[0] + 1, W[1] - 3, K.horn[2]);       /* the thumb claw */
    circle(g, R[0] + 2, R[1] + 3, 3.5, K.hide[dk ? 1 : 2], K.hide[0]);                                                      /* the shoulder muscle */
    return finish(c);
  });
}

/* THE NECK WALL: three dorsal spikes, bone over hide (12 x 34, base at the bottom centre) */
export function spineWall() {
  return memo('spines', () => {
    const [c, g] = canvas(14, 36);
    for (let i = 0; i < 3; i++) { const x = 1 + i * 4, h = 34 - i * 7; fillPoly(g, [[x, 34], [x + 5, 34], [x + 2, 34 - h]], K.horn[1]); fillPoly(g, [[x, 34], [x + 2, 34], [x + 2, 34 - h]], K.horn[0]); fillPoly(g, [[x + 3, 34], [x + 5, 34], [x + 2.5, 34 - h + 2]], K.horn[2]); px(g, x + 2, 34 - h + 1, K.horn[3]); }
    rect(g, 0, 33, 14, 3, K.hide[3]); rect(g, 0, 34, 14, 2, K.hide[2]);
    return finish(c);
  });
}
/* THE TAIL WALL: a fin of membrane on bone ribs (10 x 30, base at the bottom) */
export function finWall() {
  return memo('fin', () => {
    const [c, g] = canvas(12, 32);
    fillPoly(g, [[1, 30], [10, 30], [8, 4], [3, 10]], K.wing[2], K.wing[1]);
    for (let i = 0; i < 3; i++) line(g, 2 + i * 3, 30, 3 + i * 2.5, 6 + i * 3, K.horn[1]);
    px(g, 8, 3, K.horn[3]); px(g, 3, 9, K.horn[2]); line(g, 9, 29, 9, 8, K.fire);
    rect(g, 0, 29, 12, 3, K.hide[3]);
    return finish(c);
  });
}

/* the mount's lit sparks: embers shed off the hide + wing-tips on a bank (drawn by the compose step) */
export const EMBER_COLS = [K.emberH, K.ember, K.fire];
export { K as MOUNT_K, shade, ellipse };
