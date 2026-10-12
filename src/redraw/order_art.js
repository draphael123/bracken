// order_art.js - THE ROAD WARDENS, PAINTED (claude/orderart, Daniel 2026-10-11). The four bodies of src/order-knights.js at the Crusader's quality
// (src/redraw/waymeet.js bakePaladinBoss): limbs are two-bone chains solved from hip to foot, plates and cloth are polygons, every frame takes the one dark
// outline, and a frame whose paint reaches its border throws at bake time. Pure art: no page, no main.js, nothing here reads the game's state.
//
// ONE PAINTER, FOUR BODIES, TEN CHAPTERS. paint(pose, B) draws any body in any chapter's palette (src/order-chapters.js CHAPTERS[k].pal), so a later chapter is a
// palette row plus an entry in PROPS below (what it wears: briars, mud, studs). Nothing else is drawn per chapter.
//
// THE SHEET (12 frames, all facing right, feet on the anchor's row; the entry in src/order-knights.js MODE_FRAME says which a move shows):
//   0 walk A  1 walk B  2 the body's first windup (cut / slam / thrust / cast)  3 the blow  4 the recovery (his opening)
//   5 the body's second windup (lunge / sweep / charge / blade)  6 the body's own pose (guard high / the catch / the upward thrust / the blade blow)
//   7 TEETER (arms wheeling, off balance - the lancer at a ledge, the brute's tipped stand)  8 INTERRUPTED (the mage's cast knocked out of him)
//   9 DEATH (going over backwards)  10 CORPSE (the heap he leaves)  11 HURT (the helm snapped back; main.js HAS_HURT reads the LAST frame)
//   canvas 92x72, anchor ax 38, ay 68 (the outline row under the feet; the feet are on 52). The figure is ~30 px feet to helm, as he was at x1.5.
// The portraits (bakeCard) are the same painter at x1.15 on a 64x64 canvas, eight frames: the body at rest, the windup, the blow.
import { canvas, fillPoly, ellipse, rect, line, px, circle, outline, flipX, whiten, shade } from '../px.js';
import { OUT } from '../art.js';

export const W = 92, H = 72, AX = 38, AY = 68;
export const FR = { walk0: 0, walk1: 1, tell: 2, blow: 3, rec: 4, own5: 5, own6: 6, teeter: 7, interrupted: 8, death: 9, corpse: 10, hurt: 11, count: 12 };

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c));
  return { R, L, white: { R: white, L: white.map(flipX) }, ax, ay, w, h };
}
/* EVERY SET IS CHECKED AT BAKE TIME: a frame whose paint reaches its own border throws here, not in a playtest */
export const LENIENT = { on: false, log: [] };   /* tools/order-art-sheet.mjs looks at an overflowing frame instead of throwing */
function assertFits(c, name, i) {
  if (LENIENT.on) { try { assertFits0(c, name, i); } catch (e) { LENIENT.log.push(e.message); } return; }
  assertFits0(c, name, i); }
function assertFits0(c, name, i) {
  const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data, w = c.width, h = c.height;
  for (let x = 0; x < w; x++) if (d[x * 4 + 3] || d[((h - 1) * w + x) * 4 + 3]) throw new Error(name + ' frame ' + i + ' touches its top or bottom edge');
  for (let y = 0; y < h; y++) if (d[(y * w) * 4 + 3] || d[(y * w + w - 1) * 4 + 3]) throw new Error(name + ' frame ' + i + ' touches its left or right edge');
}
const finish = (frames, name) => frames.map((c, i) => { outline(c, OUT); assertFits(c, name, i); return c; });
/* TWO BONES, SOLVED: the knee (or elbow) bends to the side `s` says, and a chain too short to reach just straightens */
function ik(ax, ay, bx, by, l1, l2, s) {
  const dx = bx - ax, dy = by - ay, d = Math.min(l1 + l2 - 0.01, Math.max(0.01, Math.hypot(dx, dy)));
  const base = Math.atan2(dy, dx), a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  return [ax + Math.cos(base - s * a) * l1, ay + Math.sin(base - s * a) * l1];
}

/* THE COLOURS of a chapter: its palette row, shaded into the plate's four steps and the cloth's three. The steel and the wood do not change. */
export function colours(pal) {
  return { S: pal.plate, s: shade(pal.plate, 0.3), d: shade(pal.plate, -0.2), D: pal.dark, c: pal.cloth, cl: shade(pal.cloth, 0.22), C: pal.clothDk, t: pal.trim, T: shade(pal.trim, -0.35), e: pal.eye, g: shade(pal.eye, 0.55),
    blade: '#e9eff7', edge: '#9aaac4', grip: '#5a3a22', wood: '#7a5532', woodDk: '#4e3520', stone: '#d3ccba', stoneDk: '#8d8576', black: '#11141a', iron: '#5a5f6a', ironDk: '#33363f', ironLt: '#8b92a0' };
}

/* WHAT A CHAPTER WEARS, beyond its palette. Each prop is a function of the painter's context (see paint); a chapter not listed wears the plain cloth plume and nothing else -
   a later chapter is a palette row plus an entry here. thorn / bog / ore are the three built. */
const sprig = (X, g, x, y, k) => { px(g, x | 0, y | 0, k); };
export const PROPS = {
  thorn: {   /* briar wraps on the leg and the sword arm, a crest of leaves */
    legs(c) { const { Z, K, Ln, Px, leg } = c; const [hx, hy, kx, ky] = leg;
            for (let i = 0; i <= 6; i++) { const t = i / 6, x = kx + (c.foot[0] - kx) * t + Math.sin(i * 1.9 + 1) * 1.4, y = ky + (c.foot[1] - 3 - ky) * t; Px(x, y, '#3f7a48'); if (i % 2 === 1) Px(x - 1, y, '#bdb597'); } },
    arm(c) { const { Px, elbow, hand } = c; for (let i = 0; i <= 6; i++) { const t = i / 6, x = elbow[0] + (hand[0] - elbow[0]) * t, y = elbow[1] + (hand[1] - elbow[1]) * t + Math.sin(i * 2.2) * 1.3; Px(x, y, '#4f9a52'); if (i % 3 === 1) Px(x, y - 1.2, '#bdb597'); } },
    pauldron(c) { const { Ln, Px, x, y } = c; Ln(x - 5, y + 3, x + 4, y - 2, '#3f7a48'); Px(x - 2, y - 0.5, '#bdb597'); Px(x + 2, y - 2.5, '#bdb597'); Px(x + 4, y - 1, '#6fc060'); },
    crest(c) { const { P, Px, x, y } = c;   /* a fan of leaves where the plume would be */
      for (const [dx, dy, a] of [[-4, -1, 2.6], [-2, -3, 2.1], [0, -4, 1.6], [2, -3, 1.1], [-5, 1, 3.0]]) { const ex = x + dx + Math.cos(a) * -3, ey = y + dy - Math.sin(a) * 2.6;
        P([[x + dx, y + dy], [x + dx + 1.6, y + dy - 1.5 - (ey - y) * 0], [ex, ey]], '#4f9a52'); Px(x + dx, y + dy, '#2d5a30'); } } },
  bog: {     /* mud caked on the greaves and the hem, a plume of reeds */
    legs(c) { const { Ci, Px, leg } = c; const [hx, hy, kx, ky] = leg;
      for (const [t, dx, r] of [[0.15, 0.5, 1.4], [0.55, -0.8, 1.2], [0.9, 0.6, 1.6]]) Ci(kx + (c.foot[0] - kx) * t + dx, ky + (c.foot[1] - 3 - ky) * t, r, '#5a4526');
      for (const [t, dx] of [[0.5, 1], [0.25, -1]]) Px(hx + (kx - hx) * t + dx, hy + (ky - hy) * t, '#5a4526'); Px(c.foot[0] + 1, c.foot[1] - 1, '#7a6238'); },
    hem(c) { const { Rc, Px, x0, x1, y } = c; for (let x = x0; x < x1; x += 2.2) { Rc(x, y - 1, 1.4, 2 + ((x * 7) % 3 > 1 ? 1 : 0), '#5a4526'); } Px(x0 + 2, y - 2, '#7a6238'); Px(x1 - 3, y - 3, '#7a6238'); },
    crest(c) { const { Ln, Px, x, y } = c; for (const [dx, a, l] of [[-4, 2.5, 9], [-2, 2.1, 10], [0, 1.7, 8], [-5, 2.9, 7]]) { const ex = x + dx + Math.cos(a) * l, ey = y - Math.sin(a) * l * 0.7; Ln(x + dx, y, ex, ey, '#b8aa62'); Px(ex, ey - 1, '#7a6a30'); } } },
  ore: {     /* sockets for the ore plates on both pauldrons (the studs are drawn live: src/order-knights.js), rust at the joints */
    sockets: true,
    legs(c) { const { Px, leg } = c; const [hx, hy, kx, ky] = leg; for (const [t, dx] of [[0.3, 0.5], [0.7, -0.5]]) Px(hx + (kx - hx) * t + dx, hy + (ky - hy) * t, '#8a4a28'); Px(kx, ky, '#b06a38'); },
    pauldron(c) { const { Ci, Px, x, y } = c; Ci(x, y, 1.9, '#2e2a34'); Px(x - 1, y - 1, '#4a4452'); Px(x + 3, y + 2, '#8a4a28'); Px(x - 4, y + 1, '#8a4a28'); },
    crest(c) { const { Rc, P, x, y } = c; Rc(x - 6, y - 1, 10, 2, '#2e2a34'); Rc(x - 6, y - 1, 10, 1, '#7a5a3a'); } },
};
const NOPROP = {};

/* ========================================================== THE PAINTER ==========================================================
   pose: { lean, dy, fl:[x,lift], bl:[x,lift], cape, tilt, bowed, kneel, hands, weapon... } (see POSES). B: { t, K, Z, W, H, AX, G, id (chapter), card }. */
export function paint(o, B) {
  const { t, K, Z } = B, G = B.G, CX = B.AX, props = PROPS[B.id] || NOPROP;
  const brute = t === 'oathmaul', mage = t === 'oathmage', lancer = t === 'oathlance', duel = t === 'oathblade';
  const u = brute ? 1.14 : 1, wd = brute ? 1.3 : mage ? 0.9 : 1;
  const [c, g] = canvas(B.W, B.H);
  g.beginPath(); g.rect(0, 0, B.W, Math.round(G * Z)); g.clip();   /* the ground is where the paint stops: a blade planted in the dirt just goes into it */
  const col = k => K[k] || k;
  const sc = pts => pts.map(([x, y]) => [x * Z, Math.max(0, y * Z)]);
  const P = (pts, k) => fillPoly(g, sc(pts), col(k));
  const Lm = (x0, y0, x1, y1, w0, w1, k) => { const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
    P([[x0 + nx * w0 / 2, y0 + ny * w0 / 2], [x1 + nx * w1 / 2, y1 + ny * w1 / 2], [x1 - nx * w1 / 2, y1 - ny * w1 / 2], [x0 - nx * w0 / 2, y0 - ny * w0 / 2]], k); };
  const Ci = (x, y, r, k) => circle(g, x * Z, Math.max(0, y * Z), r * Z, col(k));
  const El = (x, y, rx, ry, k) => ellipse(g, x * Z, Math.max(0, y * Z), rx * Z, ry * Z, col(k));
  const Ln = (x0, y0, x1, y1, k, th = 1) => line(g, x0 * Z, Math.max(0, y0 * Z), x1 * Z, Math.max(0, y1 * Z), col(k), Math.max(1, Math.round(th * Z)));
  const Rc = (x, y, w, h, k) => rect(g, x * Z, Math.max(0, y * Z), Math.max(1, w * Z), Math.max(1, h * Z), col(k));
  const Px = (x, y, k) => px(g, x * Z, Math.max(0, y * Z), col(k));
  const ctx = { g, Z, K, P, Lm, Ci, El, Ln, Rc, Px };
  const kneel = !!o.kneel, dy = o.dy || 0, lean = o.lean || 0;
  const hx = CX + lean * 0.35, hy = G - 14.8 * u + dy, sx = CX + lean, sy = hy - 10.4 * u;
  const meta = B.meta || {};

  /* ---- the cloak / the surcoat's back skirt, behind everything ---- */
  const cape = o.cape || 0;
  P([[sx - 6 * wd, sy + 1], [sx + 1, sy + 1], [hx - 2, G - 4], [hx - 11 - cape, G - 3], [sx - 9 * wd - cape * 0.5, sy + 14]], 'C');
  P([[sx - 6 * wd, sy + 2], [sx - 3, sy + 2], [hx - 8 - cape, G - 4], [hx - 11 - cape, G - 3]], 'c');
  if (mage) P([[sx - 7, sy - 1], [sx + 2, sy - 1], [sx - 1, sy + 12], [sx - 12 - cape * 0.5, sy + 14]], 'C');   /* the mage's mantle hangs further */

  /* ---- the legs: thigh (cuisse) and shin (greave), the far one dark ---- */
  const legs = (foot, near) => {
    const fx = CX + foot[0], fy = G - 1 - foot[1], hipX = hx + (near ? 2.4 : -2.4) * wd;
    const [kx, ky] = kneel ? (near ? [hipX + 6, hy + 7] : [hipX + 2, G - 3]) : ik(hipX, hy, fx, fy - 2, 8.2 * u, 7.6 * u, 1);
    const a = near ? 'S' : 'd', b = near ? 's' : 'D', th = (near ? 5.6 : 5) * (u > 1 ? 1.25 : 1);
    Lm(hipX, hy, kx, ky, th, th - 1.4, b); Lm(hipX, hy, kx, ky, th - 2, th - 3, a);
    Lm(kx, ky, fx, fy - 2, th - 1.2, th - 2, b); Lm(kx, ky, fx, fy - 2, th - 3, th - 3.6, a);
    if (kneel && !near) P([[kx - 2, G - 6], [kx + 3, G - 6], [fx - 5, G - 1], [kx - 3, G - 1]], b);
    else P([[fx - 3.4, fy - 3], [fx + 2, fy - 3], [fx + 5.4, fy + 0.8], [fx - 3.4, fy + 0.8]], near ? 's' : 'D');   /* the sabaton */
    Ci(kx, ky, near ? 2.2 : 1.9, near ? 't' : 'T');   /* the knee cop */
    return [hipX, hy, kx, ky];
  };
  const farLeg = legs(o.bl || [-6, 0], false);
  if (props.legs && !kneel) props.legs({ ...ctx, leg: farLeg, foot: [CX + (o.bl || [-6, 0])[0], G - 1 - (o.bl || [-6, 0])[1]] });

  /* ---- the far arm: the hand the weapon is in (a sword) or the lance's / maul's rear hand; drawn behind the body ---- */
  const arm = (shoulderDx, hand, near, wr = 5) => {
    const hX = sx + hand[0], hY = sy + hand[1], s0x = sx + shoulderDx, s0y = sy + 3;
    const [ex, ey] = ik(s0x, s0y, hX, hY, 7.6 * u, 7.4 * u, near ? 1 : -1);
    Lm(s0x, s0y, ex, ey, wr * (u > 1 ? 1.2 : 1), wr - 1, near ? 'S' : 'D'); Lm(ex, ey, hX, hY, wr - 0.6, wr - 1.4, near ? 's' : 'd'); Ci(hX, hY, 2.1 * (u > 1 ? 1.2 : 1), near ? 's' : 'd');
    Ci(ex, ey, 1.7, near ? 't' : 'T');
    return { elbow: [ex, ey], hand: [hX, hY] };
  };
  const farArm = o.farHand ? arm(-5 * wd, o.farHand, false) : null;
  if (farArm && props.arm) props.arm({ ...ctx, ...farArm });

  /* ---- the weapon that goes BEHIND the body (a sword drawn back over the shoulder, a maul on it) ---- */
  const weapon = (back) => {
    const W0 = o.weapon; if (!W0 || !!W0.back !== back) return;
    const hnd = farArm ? farArm.hand : [sx + 5, sy + 8];
    if (W0.type === 'sword') { sword(hnd[0], hnd[1], W0.a, W0.L || 17, !!W0.glint, W0.crack); }
    if (W0.type === 'maul') { const hn = o.nearHand ? [sx + o.nearHand[0], sy + o.nearHand[1]] : null; maul(hnd, hn, W0.a, W0.L || 22, !!W0.stuck); }
    if (W0.type === 'lance') { const hn = o.nearHand ? [sx + o.nearHand[0], sy + o.nearHand[1]] : null; lanceW(hnd, hn, W0.a, W0.L || 34); }
  };
  function sword(hX, hY, a, L, glint, crack) {
    const ca = Math.cos(a), sa = Math.sin(a), tx = hX + ca * L, ty = Math.min(G, hY + sa * L), nx = -sa, ny = ca, bw = mage ? 1.1 : 1.5;
    P([[hX + ca * 3 + nx * bw, hY + sa * 3 + ny * bw], [tx - ca * 2 + nx * bw * 0.8, ty - sa * 2 + ny * bw * 0.8], [tx, ty], [tx - ca * 2 - nx * bw * 0.8, ty - sa * 2 - ny * bw * 0.8], [hX + ca * 3 - nx * bw, hY + sa * 3 - ny * bw]], 'blade');
    Ln(hX + ca * 4, hY + sa * 4, tx - ca * 3, ty - sa * 3, 'edge');   /* the fuller */
    Lm(hX + ca * 2.5 + nx * 3.4, hY + sa * 2.5 + ny * 3.4, hX + ca * 2.5 - nx * 3.4, hY + sa * 2.5 - ny * 3.4, 1.8, 1.8, 't');   /* the cross */
    Lm(hX - ca * 2.5, hY - sa * 2.5, hX + ca * 1.5, hY + sa * 1.5, 1.8, 1.8, 'grip'); Ci(hX - ca * 3.4, hY - sa * 3.4, 1.2, 't');
    if (crack) for (const sg of [-1, 1]) { let x = tx, y = G; for (let k = 0; k < 3; k++) { Px(x, y, 'D'); x += sg; y += k % 2 ? -1 : 0; } }
    meta.tip = [tx, ty]; meta.glintAt = [tx - ca * 3, ty - sa * 3];
  }
  function maul(h1, h2, a, L, stuck) {
    const ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca, ex = h1[0] + ca * L, ey = Math.min(G - 1, h1[1] + sa * L);
    Lm(h1[0] - ca * 3, h1[1] - sa * 3, ex, ey, 2.3, 2.3, 'woodDk'); Lm(h1[0] - ca * 3, h1[1] - sa * 3, ex, ey, 1.2, 1.2, 'wood');
    const hw = 6.4, ht = 3.6, cxm = ex - ca * 0.5, cym = Math.min(G - 3, ey - sa * 0.5);   /* the head: a block across the haft's end, banded, with a face and a spike */
    P([[cxm - ca * ht + nx * hw, cym - sa * ht + ny * hw], [cxm + ca * ht + nx * hw, cym + sa * ht + ny * hw], [cxm + ca * ht - nx * hw, cym + sa * ht - ny * hw], [cxm - ca * ht - nx * hw, cym - sa * ht - ny * hw]], 'ironDk');
    P([[cxm - ca * ht * 0.5 + nx * hw, cym - sa * ht * 0.5 + ny * hw], [cxm + ca * ht + nx * hw, cym + sa * ht + ny * hw], [cxm + ca * ht - nx * hw, cym + sa * ht - ny * hw], [cxm - ca * ht * 0.5 - nx * hw, cym - sa * ht * 0.5 - ny * hw]], 'iron');
    Ln(cxm + ca * ht + nx * hw, cym + sa * ht + ny * hw, cxm + ca * ht - nx * hw, cym + sa * ht - ny * hw, 'ironLt');
    for (const sg of [-1, 1]) Lm(cxm - ca * ht + nx * hw * 0.55 * sg, cym - sa * ht + ny * hw * 0.55 * sg, cxm + ca * ht + nx * hw * 0.55 * sg, cym + sa * ht + ny * hw * 0.55 * sg, 1, 1, 't');
    Lm(cxm + ca * ht, cym + sa * ht, cxm + ca * (ht + 3), cym + sa * (ht + 3), 2, 0.8, 'ironLt');   /* the spike */
    meta.head = [cxm, cym];
  }
  function lanceW(h1, h2, a, L) {
    const ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca, bx = h1[0] - ca * 7, by = h1[1] - sa * 7, tx = h1[0] + ca * L, ty = Math.max(2, h1[1] + sa * L);
    Lm(bx, by, tx, ty, 2.1, 1.5, 'woodDk'); Lm(bx, by, tx, ty, 1.1, 0.8, 'wood');
    P([[tx - ca * 1, ty - sa * 1 + 1.6], [tx + ca * 5, ty + sa * 5], [tx - ca * 1, ty - sa * 1 - 1.6]], 'blade');   /* the point */
    Lm(tx - ca * 1, ty - sa * 1, tx + ca * 4, ty + sa * 4, 0.8, 0.5, 'edge');
    const vx = h1[0] + ca * 4, vy = h1[1] + sa * 4;   /* the vamplate: a cone of plate before the hand */
    P([[vx - ca * 3 + nx * 3.4, vy - sa * 3 + ny * 3.4], [vx + ca * 1.5 + nx * 1.4, vy + sa * 1.5 + ny * 1.4], [vx + ca * 1.5 - nx * 1.4, vy + sa * 1.5 - ny * 1.4], [vx - ca * 3 - nx * 3.4, vy - sa * 3 - ny * 3.4]], 'S');
    Ln(vx - ca * 3 + nx * 3.4, vy - sa * 3 + ny * 3.4, vx - ca * 3 - nx * 3.4, vy - sa * 3 - ny * 3.4, 't');
    const pn = [tx - ca * 7, ty - sa * 7]; P([[pn[0], pn[1]], [pn[0] - 8 * (Math.abs(ca) < 0.2 ? 0 : Math.sign(ca)) + (Math.abs(ca) < 0.2 ? 5 : 0), pn[1] + 2.4 + (Math.abs(ca) < 0.2 ? 3 : 0)], [pn[0] - 5 * Math.sign(ca || 1) + (Math.abs(ca) < 0.2 ? 5 : 0), pn[1] + 5.5], [pn[0], pn[1] + 4]], 'c');   /* the pennon in the chapter's cloth */
    meta.tip = [tx, ty];
  }
  weapon(true);

  /* ---- the body: breastplate, the surcoat over it with the broken milestone, the belt, the tassets ---- */
  const bw = 6.2 * wd, ww = 4.8 * wd;
  P([[sx - bw, sy - 0.5], [sx + bw, sy - 0.5], [hx + ww + 0.6, hy + 0.5], [hx - ww - 0.6, hy + 0.5]], 'd');
  P([[sx - bw + 2, sy], [sx + bw, sy], [hx + ww + 0.6, hy + 0.5], [hx - ww + 2, hy + 0.5]], 'S');
  P([[sx + bw - 3, sy], [sx + bw, sy], [hx + ww + 0.6, hy], [hx + ww - 2, hy]], 's');
  const tb = 4.4 * wd;   /* the surcoat */
  P([[sx - tb, sy + 2.5], [sx + tb, sy + 2.5], [hx + tb + 1.2, hy + 6.4], [hx - tb - 1.2, hy + 6.4]], 'c');
  P([[sx - tb, sy + 2.5], [sx - tb + 2, sy + 2.5], [hx - tb - 1.2 + 2.4, hy + 6.4], [hx - tb - 1.2, hy + 6.4]], 'C');
  P([[sx + tb - 1.6, sy + 2.5], [sx + tb, sy + 2.5], [hx + tb + 1.2, hy + 6.4], [hx + tb - 0.4, hy + 6.4]], 'cl');
  Ln(hx - tb - 1.2, hy + 6.4, hx + tb + 1.2, hy + 6.4, 't'); Ln(hx - tb - 1.2, hy + 5.6, hx + tb + 1.2, hy + 5.6, 'T');
  if (props.hem) props.hem({ ...ctx, x0: hx - tb - 1.2, x1: hx + tb + 1.2, y: hy + 6.4 });
  { const mx = (sx + hx) / 2 + 0.4, my = sy + 4.2; milestone(ctx, mx, my, 1.0); }
  Rc(hx - ww - 0.6, hy - 1.5, 2 * ww + 1.4, 2.4, 'T'); Rc(hx - ww - 0.6, hy - 1.5, 2 * ww + 1.4, 1, 't'); Rc(hx - 1, hy - 1.5, 2, 2.4, 'blade');   /* the belt, its buckle */
  P([[hx - ww - 1, hy + 0.8], [hx + ww + 1, hy + 0.8], [hx + ww + 2, hy + 4.4], [hx - ww - 2, hy + 4.4]], 'd');   /* the tassets */
  P([[hx + 1, hy + 0.8], [hx + ww + 1, hy + 0.8], [hx + ww + 2, hy + 4.4], [hx + 1, hy + 4.4]], 'S');
  Ln(hx - ww - 2, hy + 4.4, hx + ww + 2, hy + 4.4, 'T');
  const nearLeg = legs(o.fl || [7, 0], true);
  if (props.legs && !kneel) props.legs({ ...ctx, leg: nearLeg, foot: [CX + (o.fl || [7, 0])[0], G - 1 - (o.fl || [7, 0])[1]] });
  /* the tabard's lower skirt falls over the thighs, so it is drawn after the near leg's thigh would otherwise cut it */
  P([[hx - tb - 1.2, hy + 6.4], [hx + tb + 1.2, hy + 6.4], [hx + tb + 0.2, hy + 9], [hx, hy + 7.8], [hx - tb - 0.2, hy + 9]], 'C');

  /* ---- the pauldrons: the far one dark, the near one big and rimmed ---- */
  El(sx - 6.4 * wd, sy + 1.4, 3.8 * wd, 3, 'd'); El(sx - 6.4 * wd, sy + 0.8, 2.8 * wd, 1.9, 'S');
  const pn = { x: sx + 6.4 * wd, y: sy + 1.4 };
  El(pn.x, pn.y, 4.6 * wd, 3.6, 's'); El(pn.x + 0.6, pn.y - 0.6, 3.2 * wd, 2, 'S'); Ln(pn.x - 4.4 * wd, pn.y + 2.6, pn.x + 4.4 * wd, pn.y + 2.6, 't');
  for (let i = -3; i <= 3; i += 2) Px(pn.x + i * wd, pn.y - 3.2 + Math.abs(i) * 0.3, 't');
  if (props.pauldron) { props.pauldron({ ...ctx, x: pn.x, y: pn.y }); }
  if (props.sockets) { Ci(pn.x, pn.y - 0.5, 1.9, 'black'); Ci(sx - 6.4 * wd, sy + 0.8, 1.5, 'black'); }
  meta.pauld = { n: [pn.x, pn.y - 0.5], f: [sx - 6.4 * wd, sy + 0.8] };

  /* ---- the head ---- */
  const hcx = sx + 1 + (o.tilt || 0), hcy = sy - 6.6 * u + (o.bowed || 0);
  helm(ctx, o, { x: hcx, y: hcy, brute, mage, lancer, duel, props, u });
  meta.helm = [hcx, hcy];

  /* ---- the near arm and what it holds (the shield, the second hand on the haft, the focus) ---- */
  const nearArm = o.nearHand ? arm(5 * wd, o.nearHand, true, 5.4) : null;
  if (nearArm && props.arm && !farArm) props.arm({ ...ctx, ...nearArm });
  if (o.shield) { const S0 = o.shield; shieldW(ctx, sx + S0.x, sy + S0.y, S0.w || 1, S0.low); }
  if (o.focus && nearArm) focusW(ctx, nearArm.hand[0] + 1.6, nearArm.hand[1] - 3.4, o.focus);
  weapon(false);
  B.meta = meta;
  return c;
}

/* THE BROKEN MILESTONE: the order's sigil. A road-stone with a round top, cracked across, its upper half shifted. Scale s in tabard units. */
function milestone(ctx, x, y, s) {
  const { P, Ln, Px, Rc } = ctx;
  P([[x - 2 * s, y + 1.2 * s], [x - 1.4 * s, y - 0.3 * s], [x + 0.2 * s, y - 0.8 * s], [x + 1.6 * s, y - 0.3 * s], [x + 2 * s, y + 1.2 * s], [x + 2 * s, y + 5.4 * s], [x - 2 * s, y + 5.4 * s]], 'stone');
  P([[x + 0.6 * s, y - 0.4 * s], [x + 1.6 * s, y - 0.3 * s], [x + 2 * s, y + 1.2 * s], [x + 2 * s, y + 5.4 * s], [x + 0.6 * s, y + 5.4 * s]], 'stoneDk');
  Ln(x - 0.6 * s, y + 1.4 * s, x + 0.6 * s, y + 2.6 * s, 'black'); Ln(x + 0.6 * s, y + 2.6 * s, x - 0.6 * s, y + 3.6 * s, 'black'); Ln(x - 0.6 * s, y + 3.6 * s, x + 0.8 * s, y + 5 * s, 'black');
  Px(x - 1 * s, y + 4.6 * s, 'stoneDk');
}
function shieldW(ctx, cx, cy, w, low) {
  const { P, Ln, Rc, Px, K } = ctx, hw = 5.6 * w, top = low ? 5 : 8, bot = low ? 7 : 9;
  const pts = [[cx - hw, cy - top], [cx + hw, cy - top], [cx + hw, cy + 1], [cx, cy + bot], [cx - hw, cy + 1]];
  P(pts.map(([x, y]) => [x + Math.sign(x - cx) * 0.9, y + Math.sign(y - cy) * 0.9]), 'black'); P(pts, 'T');
  P([[cx - hw + 1.2, cy - top + 1.2], [cx + hw - 1.2, cy - top + 1.2], [cx + hw - 1.2, cy + 0.6], [cx, cy + bot - 1.8], [cx - hw + 1.2, cy + 0.6]], 'c');
  P([[cx + 0.4, cy - top + 1.2], [cx + hw - 1.2, cy - top + 1.2], [cx + hw - 1.2, cy + 0.6], [cx + 0.4, cy + bot - 2.2]], 'cl');
  Ln(cx - hw, cy - top, cx + hw, cy - top, 't'); Ln(cx - hw, cy - top, cx - hw, cy + 1, 't'); Ln(cx + hw, cy - top, cx + hw, cy + 1, 'S');
  milestone(ctx, cx, cy - 3.4, 0.95);
  Px(cx, cy - top + 0.4, 'blade');   /* the boss rivet */
}
function focusW(ctx, x, y, f) {
  const { Ci, Ln, Px, Rc, g, Z } = ctx;
  Ln(x - 1.6, y + 3.2, x, y + 0.6, 'iron');   /* the rod in his fist */
  if (f.glow) { g.globalAlpha = 0.45; Ci(x, y - 0.4, 4.8, 'e'); g.globalAlpha = 0.7; Ci(x, y - 0.4, 3.6, 'e'); g.globalAlpha = 1; }
  Ci(x, y - 0.4, 2.5, 'ironDk'); Ci(x, y - 0.4, 1.9, f.glow ? 'g' : 'e'); Px(x - 0.6, y - 1.2, 'blade');
}
function helm(ctx, o, h) {
  const { P, Ln, Rc, Px, Ci, El, K } = ctx, { x, y, brute, mage, lancer, duel, props, u } = h, back = o.hurtBack ? -1 : 0, ex = o.eyeDim ? 'D' : 'e';
  const crestAt = () => { if (props.crest) props.crest({ ...ctx, x: x - 3 + back, y: y - 6 * u }); else if (!mage) {
    P([[x - 1.5, y - 6.4 * u], [x + 2, y - 6.4 * u], [x - 1, y - 9.4 * u], [x - 8, y - 6 * u], [x - 10, y - 2], [x - 5, y - 3.6]], 'c');
    Ln(x - 1.4, y - 6.4 * u, x - 8.6, y - 3.4, 'cl'); Ln(x - 4, y - 5.6, x - 8, y - 3.2, 'C'); } };
  if (mage) {   /* a sallet under a peaked hood, the face in shadow and two lit eyes */
    P([[x - 6, y + 5.6], [x - 6.6, y - 1], [x - 3, y - 7], [x + 0.6, y - 9.4], [x + 4, y - 6], [x + 5.8, y + 0.4], [x + 5.4, y + 5.6]], 'C');
    P([[x - 6, y + 5.6], [x - 6.6, y - 1], [x - 3, y - 7], [x + 0.6, y - 9.4], [x - 1, y - 3], [x - 3, y + 5.6]], 'c');
    P([[x - 2, y - 4.8], [x + 4.6, y - 4.8], [x + 5.8, y + 0.4], [x + 5.4, y + 4], [x - 1.8, y + 4]], 'black');
    Rc(x + 0.6, y - 1.2, 2, 1.2, ex); Rc(x + 3.2, y - 1.2, 2, 1.2, ex); if (!o.eyeDim) { Px(x + 1, y - 1.2, 'g'); Px(x + 3.6, y - 1.2, 'g'); }
    P([[x - 6, y + 4], [x + 5.8, y + 4], [x + 6.4, y + 6.4], [x - 6.4, y + 6.4]], 'T'); Ln(x - 6, y + 4, x + 5.8, y + 4, 't');   /* the collar */
    Px(x - 2, y - 7.4, 'cl'); Ln(x - 5.4, y + 1, x - 3.2, y + 5, 'C');
    return; }
  if (brute) {   /* a bucket helm, brimmed, dented, a cross-slit */
    P([[x - 6.6, y - 5.4], [x + 6.2, y - 5.4], [x + 7.8, y - 2], [x + 7.8, y + 6.4], [x - 6.6, y + 6.4]], 'd');
    P([[x - 2, y - 5.4], [x + 6.2, y - 5.4], [x + 7.8, y - 2], [x + 7.8, y + 6.4], [x - 2, y + 6.4]], 'S');
    P([[x + 3.6, y - 5.4], [x + 6.2, y - 5.4], [x + 7.8, y - 2], [x + 7.8, y + 6.4], [x + 3.6, y + 6.4]], 's');
    Rc(x - 6.6, y - 6.2, 14.4, 1.6, 'T'); Rc(x - 6.6, y - 6.2, 14.4, 0.8, 't');   /* the brim band */
    Rc(x + 0.4, y - 0.8, 7.2, 1.6, 'black'); Rc(x + 4, y - 3.4, 1.4, 6.6, 'black'); Rc(x + 4.6, y - 0.4, 2.2, 0.9, ex);
    Px(x + 1.5, y + 3.4, 'black'); Px(x + 2.5, y + 4.4, 'black'); Px(x + 1.5, y + 5.4, 'black');   /* breath holes */
    Ln(x - 4, y - 3, x - 2, y + 0.4, 'D'); Px(x - 3, y + 1.6, 'D');   /* a dent */
    Rc(x - 6.6, y + 6.4, 14.4, 2, 'd'); crestAt(); return; }
  if (lancer) {   /* a frog-mouth helm: the slit slants and the face juts forward */
    P([[x - 5, y - 6], [x + 3, y - 6.4], [x + 6.6, y - 3], [x + 7.4, y + 1.4], [x + 6.6, y + 6.4], [x - 5, y + 6.4]], 'd');
    P([[x - 0.6, y - 6.4], [x + 3, y - 6.4], [x + 6.6, y - 3], [x + 7.4, y + 1.4], [x + 6.6, y + 6.4], [x - 0.6, y + 6.4]], 'S');
    P([[x + 4, y - 4], [x + 6.6, y - 3], [x + 7.4, y + 1.4], [x + 6.6, y + 6.4], [x + 4.4, y + 6.4]], 's');
    P([[x - 0.4, y - 1.4], [x + 7.6, y - 0.6], [x + 7.6, y + 0.6], [x - 0.4, y + 0.2]], 'black'); Rc(x + 4.4, y - 0.6, 2.6, 0.9, ex);
    Ln(x + 1.6, y + 2.6, x + 6.8, y + 3.2, 'D'); Ln(x + 1.6, y + 4.4, x + 6.6, y + 4.6, 'D');
    Rc(x - 5, y - 6.4, 8.4, 1.4, 't'); Rc(x - 5, y + 6.4, 12, 1.6, 'd'); crestAt(); return; }
  /* the duelist: a great helm, flat-topped, a vertical slit and the cross-band */
  P([[x - 5.6, y - 5.8], [x + 5, y - 5.8], [x + 6.6, y - 3], [x + 6.6, y + 6.2], [x - 5.6, y + 6.2]], 'd');
  P([[x - 1.2, y - 5.8], [x + 5, y - 5.8], [x + 6.6, y - 3], [x + 6.6, y + 6.2], [x - 1.2, y + 6.2]], 'S');
  P([[x + 3.4, y - 5.8], [x + 5, y - 5.8], [x + 6.6, y - 3], [x + 6.6, y + 6.2], [x + 3.4, y + 6.2]], 's');
  Rc(x - 5.6, y - 6.6, 12.2, 1.4, 'T'); Rc(x - 5.6, y - 6.6, 12.2, 0.7, 't');
  Rc(x + 0.2, y - 1, 7, 1.6, 'black'); Rc(x + 4.2, y - 3.6, 1.4, 7, 'black'); Rc(x + 4.8, y - 0.6, 2.2, 0.9, ex);
  for (let i = 0; i < 3; i++) Px(x + 1.2 + i, y + 3.6, 'black');
  Rc(x - 5.6, y + 6.2, 12.2, 1.8, 'd'); crestAt();
}

/* ============================================================== THE POSES ==============================================================
   hands are relative to the shoulder; weapon.a is the blade's angle (0 = forward, -pi/2 = up, +pi/2 = down). */
const SW = (a, L = 17, extra = {}) => ({ type: 'sword', a, L, ...extra });
export function posesOf(t) {
  const P = [];   /* 12 entries */
  const base = { fl: [7, 0], bl: [-6, 0] };
  if (t === 'oathblade') {
    const sh = (x, y, w = 1, low = false) => ({ x, y, w, low });
    P.push({ ...base, farHand: [6, 8], nearHand: [8, 4], weapon: SW(-1.15), shield: sh(11, 5) });
    P.push({ fl: [3, 1], bl: [-2, 0], dy: -0.6, farHand: [6, 9], nearHand: [8, 5], weapon: SW(-1.2), shield: sh(11, 6) });
    P.push({ lean: -3, fl: [8, 0], bl: [-8, 0], cape: 2, tilt: -1, farHand: [-1, -7], nearHand: [8, 4], weapon: SW(-2.35, 18, { back: true }), shield: sh(11, 5) });   /* 2 THE CUT, TOLD */
    P.push({ lean: 4, dy: 1, fl: [11, 0], bl: [-9, 0], cape: 3, farHand: [10, 3], nearHand: [5, 8], weapon: SW(0.35, 18), shield: sh(7, 9, 1, true) });   /* 3 the cut, through */
    P.push({ lean: 5, dy: 2.5, fl: [11, 0], bl: [-9, 0], bowed: 2, tilt: 1, farHand: [9, 11], nearHand: [3, 11], weapon: SW(1.35, 18), shield: sh(4, 11, 1, true) });   /* 4 recovery: point in the dirt */
    P.push({ lean: -2, dy: 2.5, fl: [9, 0], bl: [-10, 0], cape: 2, farHand: [-5, 9], nearHand: [8, 4], weapon: SW(0, 18), shield: sh(11, 5) });   /* 5 THE LUNGE, TOLD */
    P.push({ dy: 0, fl: [7, 0], bl: [-6, 0], farHand: [7, 8], nearHand: [3, -9], weapon: SW(-1.0, 17), shield: sh(5, -15, 1.3) });   /* 6 GUARDS HIGH: the shield over his helm */
    P.push({ lean: 5, dy: 1, fl: [12, 0], bl: [-3, 1.5], cape: 4, tilt: 2, bowed: 1, farHand: [-6, -8], nearHand: [13, -3], weapon: SW(-2.6, 18, { back: true }), shield: sh(15, -4, 0.9) });   /* 7 TEETER */
    P.push({ lean: -4, dy: 1.5, fl: [8, 0], bl: [-7, 0], cape: 3, tilt: -3, hurtBack: true, farHand: [4, 12], nearHand: [2, 9], weapon: SW(1.9, 17), shield: sh(0, 10, 1, true) });   /* 8 INTERRUPTED */
    P.push({ lean: -8, dy: 3, fl: [3, 2.5], bl: [-12, 0], cape: 6, tilt: -4, hurtBack: true, eyeDim: true, farHand: [-9, 2], nearHand: [-11, 8], weapon: SW(-2.5, 17, { back: true }), shield: sh(-14, 12, 1, true) });   /* 9 DEATH: over backwards */
    P.push({ lean: 4, dy: 11, kneel: true, fl: [12, 0], bl: [-6, 0], cape: 1, bowed: 5, tilt: 3, eyeDim: true, farHand: [11, 7], weapon: SW(1.5, 18, { crack: true }), shield: sh(-12, 12, 1, true) });   /* 10 CORPSE */
    P.push({ lean: -4, dy: 0.5, fl: [6, 0], bl: [-7, 0], cape: 2, tilt: -3, hurtBack: true, farHand: [5, 9], nearHand: [8, 5], weapon: SW(-0.8, 17), shield: sh(10, 6) });   /* 11 HURT */
  } else if (t === 'oathmaul') {
    const M = (a, L = 22, extra = {}) => ({ type: 'maul', a, L, ...extra });
    P.push({ fl: [7, 0], bl: [-6, 0], farHand: [5, 3], nearHand: [8, 6], weapon: M(-2.3, 24, { back: true }) });
    P.push({ fl: [3, 1], bl: [-2, 0], dy: -0.7, farHand: [5, 4], nearHand: [8, 7], weapon: M(-2.25, 24, { back: true }) });
    P.push({ lean: -3, fl: [8, 0], bl: [-8, 0], cape: 2, tilt: -1, farHand: [-1, -6], nearHand: [4, -4], weapon: M(-1.95, 22, { back: true }) });   /* 2 THE SLAM, TOLD: overhead */
    P.push({ lean: 5, dy: 3, fl: [12, 0], bl: [-9, 0], cape: 4, farHand: [11, 5], nearHand: [14, 9], weapon: M(0.85, 21) });   /* 3 the blow, down in front */
    P.push({ lean: 6, dy: 4.5, fl: [12, 0], bl: [-9, 0], bowed: 3, farHand: [11, 9], nearHand: [14, 12], weapon: M(1.0, 22, { stuck: true }) });   /* 4 STUCK: the head in the floor */
    P.push({ lean: -3, dy: 2, fl: [10, 0], bl: [-10, 0], cape: 3, farHand: [-2, 8], nearHand: [4, 9], weapon: M(2.95, 22, { back: true }) });   /* 5 THE SWEEP, TOLD: drawn back low */
    P.push({ dy: -0.5, fl: [8, 0], bl: [-7, 0], farHand: [14, -6], nearHand: [14, 4], weapon: M(2.2, 14, { back: true }) });   /* 6 THE CATCH: both hands up and open */
    P.push({ lean: 6, dy: 1.5, fl: [10, 0], bl: [-2, 1.5], cape: 4, tilt: 2, farHand: [-5, -9], nearHand: [13, -6], weapon: M(-2.7, 20, { back: true }) });   /* 7 TEETER (tipped) */
    P.push({ lean: -4, dy: 1.5, fl: [8, 0], bl: [-7, 0], tilt: -3, hurtBack: true, farHand: [6, 8], nearHand: [8, 10], weapon: M(1.5, 18) });   /* 8 INTERRUPTED (reeled) */
    P.push({ lean: -8, dy: 4, fl: [3, 2.5], bl: [-12, 0], cape: 6, tilt: -4, hurtBack: true, eyeDim: true, farHand: [-9, 3], nearHand: [-11, 9], weapon: M(-2.5, 15, { back: true }) });   /* 9 DEATH */
    P.push({ lean: 4, dy: 12, kneel: true, fl: [12, 0], bl: [-6, 0], cape: 1, bowed: 5, tilt: 3, eyeDim: true, farHand: [12, 9], nearHand: [13, 12], weapon: M(1.45, 24) });   /* 10 CORPSE */
    P.push({ lean: -4, dy: 0.5, fl: [6, 0], bl: [-7, 0], cape: 2, tilt: -3, hurtBack: true, farHand: [4, 3], nearHand: [8, 6], weapon: M(-2.1, 24, { back: true }) });   /* 11 HURT */
  } else if (t === 'oathlance') {
    const L = (a, len = 34, extra = {}) => ({ type: 'lance', a, L: len, ...extra });
    P.push({ fl: [7, 0], bl: [-6, 0], farHand: [8, 6], nearHand: [8, 10], weapon: L(-1.5, 30) });
    P.push({ fl: [3, 1], bl: [-2, 0], dy: -0.6, farHand: [8, 7], nearHand: [8, 11], weapon: L(-1.5, 30) });
    P.push({ lean: -3, fl: [8, 0], bl: [-8, 0], cape: 2, tilt: -1, farHand: [-2, 7], nearHand: [3, 9], weapon: L(-0.1, 32) });   /* 2 THE THRUST, TOLD: drawn right back */
    P.push({ lean: 5, dy: 1.5, fl: [12, 0], bl: [-9, 0], cape: 4, farHand: [12, 7], nearHand: [8, 9], weapon: L(0, 28) });   /* 3 the thrust */
    P.push({ lean: 6, dy: 3, fl: [12, 0], bl: [-9, 0], bowed: 2, farHand: [10, 11], nearHand: [6, 12], weapon: L(0.75, 30) });   /* 4 recovery / dazed: the point in the dirt */
    P.push({ lean: 6, dy: 3.5, fl: [13, 0], bl: [-10, 0], cape: 5, farHand: [12, 9], nearHand: [7, 11], weapon: L(0.04, 28) });   /* 5 THE CHARGE: couched, low */
    P.push({ lean: 0, fl: [7, 0], bl: [-6, 0], farHand: [8, 2], nearHand: [8, 6], weapon: L(-1.5, 32) });   /* 6 THE UPWARD THRUST */
    P.push({ lean: 6, dy: 1, fl: [12, 0], bl: [-3, 1.5], cape: 4, tilt: 2, farHand: [-4, -8], nearHand: [12, -7], weapon: L(-2.2, 24) });   /* 7 TEETER: the lance flung up behind, the other arm out */
    P.push({ lean: -4, dy: 1.5, fl: [8, 0], bl: [-7, 0], tilt: -3, hurtBack: true, farHand: [6, 10], nearHand: [4, 11], weapon: L(1.2, 26) });   /* 8 INTERRUPTED */
    P.push({ lean: -8, dy: 3, fl: [3, 2.5], bl: [-12, 0], cape: 6, tilt: -4, hurtBack: true, eyeDim: true, farHand: [-9, 2], nearHand: [-10, 8], weapon: L(-2.3, 26) });   /* 9 DEATH */
    P.push({ lean: 4, dy: 11, kneel: true, fl: [12, 0], bl: [-6, 0], cape: 1, bowed: 5, tilt: 3, eyeDim: true, farHand: [11, 8], nearHand: [10, 12], weapon: L(1.5, 28) });   /* 10 CORPSE */
    P.push({ lean: -4, dy: 0.5, fl: [6, 0], bl: [-7, 0], cape: 2, tilt: -3, hurtBack: true, farHand: [8, 6], nearHand: [8, 10], weapon: L(-1.3, 30) });   /* 11 HURT */
  } else {
    const S = (a, L = 15, extra = {}) => ({ type: 'sword', a, L, ...extra });
    const fx = (glow = false) => ({ glow });
    P.push({ fl: [7, 0], bl: [-6, 0], farHand: [3, 10], nearHand: [9, 5], focus: fx(), weapon: S(1.7, 15) });
    P.push({ fl: [3, 1], bl: [-2, 0], dy: -0.6, farHand: [3, 11], nearHand: [9, 6], focus: fx(), weapon: S(1.7, 15) });
    P.push({ lean: -3, fl: [8, 0], bl: [-8, 0], cape: 2, tilt: -1, farHand: [3, 10], nearHand: [8, -7], focus: fx(true), weapon: S(1.8, 15) });   /* 2 THE CAST, TOLD: the focus raised and burning */
    P.push({ lean: 4, dy: 1, fl: [11, 0], bl: [-8, 0], cape: 3, farHand: [3, 10], nearHand: [14, 2], focus: fx(true), weapon: S(1.8, 15) });   /* 3 cast: thrown out */
    P.push({ lean: 5, dy: 2, fl: [10, 0], bl: [-8, 0], bowed: 2, farHand: [4, 11], nearHand: [8, 9], focus: fx(), weapon: S(1.5, 15) });   /* 4 recovery */
    P.push({ lean: -3, dy: 1, fl: [9, 0], bl: [-9, 0], cape: 2, farHand: [-3, -4], nearHand: [6, 6], focus: fx(), weapon: S(-2.4, 16, { back: true }) });   /* 5 THE BLADE, TOLD */
    P.push({ lean: 5, dy: 1.5, fl: [12, 0], bl: [-8, 0], cape: 4, farHand: [11, 4], nearHand: [3, 5], focus: fx(), weapon: S(0.2, 17) });   /* 6 the blade */
    P.push({ lean: 5, dy: 1, fl: [11, 0], bl: [-3, 1.5], cape: 4, tilt: 2, farHand: [-5, -7], nearHand: [13, -4], focus: fx(true), weapon: S(-2.5, 15, { back: true }) });   /* 7 TEETER */
    P.push({ lean: -5, dy: 1.5, fl: [8, 0], bl: [-7, 0], cape: 3, tilt: -4, hurtBack: true, farHand: [2, 10], nearHand: [-1, -9], focus: { glow: true }, weapon: S(1.8, 15) });   /* 8 INTERRUPTED: the spell snaps back in his hand */
    P.push({ lean: -8, dy: 3, fl: [3, 2.5], bl: [-12, 0], cape: 6, tilt: -4, hurtBack: true, eyeDim: true, farHand: [-9, 2], nearHand: [-10, 8], focus: fx(), weapon: S(-2.5, 15, { back: true }) });   /* 9 DEATH */
    P.push({ lean: 4, dy: 11, kneel: true, fl: [12, 0], bl: [-6, 0], cape: 1, bowed: 5, tilt: 3, eyeDim: true, farHand: [11, 7], nearHand: [9, 10], focus: fx(), weapon: S(1.5, 16) });   /* 10 CORPSE */
    P.push({ lean: -4, dy: 0.5, fl: [6, 0], bl: [-7, 0], cape: 2, tilt: -3, hurtBack: true, farHand: [3, 10], nearHand: [9, 5], focus: fx(), weapon: S(1.7, 15) });   /* 11 HURT */
  }
  return P;
}

/* ============================================================== THE BAKES ============================================================== */
export const META = {};   /* META[t][frame] = { tip, glintAt, pauld, helm, head } in the painter's own pixels (anchor AX/AY), facing right: for what is drawn over the sprite */
function bakeFrames(t, id, pal, Z, dims, only) {
  const K = colours(pal), poses = posesOf(t), out = [], metas = [];
  for (let i = 0; i < poses.length; i++) {
    if (only && !only.includes(i)) continue;
    const B = { t, K, Z, id, W: dims.W, H: dims.H, AX: dims.AX, G: dims.G, meta: {} };
    out.push(paint(poses[i], B)); metas.push(B.meta);
  }
  return { out, metas };
}
/* one body in one chapter's cloth: { R, L, white, ax, ay, w, h } as every SPR set. The hit size w/h is the body's (src/order-chapters.js BODY). */
export function bakeKnight(t, chapter, chapterId, box) {
  const { out, metas } = bakeFrames(t, chapterId, chapter.pal, 1, { W, H, AX, G: AY });
  if (!META[t]) META[t] = metas;
  return pack(finish(out, t + '_' + chapterId), AX, AY, box.w, box.h);
}
/* THE PORTRAIT: eight frames, the body at rest -> the windup -> the blow -> rest, x1.3 (the bestiary shows 4 a second) */
const CW = 76, CH = 64, CAX = 32, CG = 61;
export function bakeCard(t, chapter, chapterId, box) {
  const order = t === 'oathmaul' ? [0, 1, 4, 4, 6, 6, 0, 1] : t === 'oathlance' ? [0, 1, 2, 2, 6, 6, 0, 1] : [0, 1, 2, 2, 3, 3, 0, 1], K = colours(chapter.pal), poses = posesOf(t), cache = {}, frames = order.map(i => cache[i] || (cache[i] = paint(poses[i], { t, K, Z: 1.15, id: chapterId, W: CW, H: CH, AX: CAX / 1.15, G: CG / 1.15, meta: {} })));
  const done = finish([...new Set(frames)], t + '_card'); const byIdx = new Map([...new Set(order)].map((k, j) => [k, done[j]]));
  return pack(order.map(i => byIdx.get(i)), CAX, CG + 1, box.w, box.h);
}

/* ================================================================ THE FX, BAKED ONCE ================================================================
   Nothing here is baked per frame: bakeFx() runs once (the first time a knight is put down), the trunk once per length, the banners once per chapter. */
const mk = (w, h) => canvas(w, h);
const done = (c, color = OUT) => outline(c, color);
/* the mage's bolt, one per chapter's element (14x14, flying right; drawn rotated to its heading) and the gold one a parry sends back */
const BOLT = {
  thorn(g, f) { for (const a of [0, 1, 2, 3, 4, 5]) { const an = a * 1.047 + f * 0.5; line(g, 7, 7, 7 + Math.cos(an) * 5, 7 + Math.sin(an) * 5, '#bdb597'); } circle(g, 7, 7, 3, '#3f7a48'); circle(g, 6.4, 6.4, 1.6, '#8fd160'); },
  bog(g, f) { ellipse(g, 7, 7, 4.4, 3.2 + f * 0.6, '#5a4526'); ellipse(g, 6.6, 6.2, 3, 2, '#8a7440'); px(g, 5, 5, '#c8b878'); px(g, 11, 9 + f, '#5a4526'); px(g, 2, 8 - f, '#5a4526'); },
  spore(g, f) { for (const [x, y] of [[4, 6], [8, 4], [9, 9], [5, 10], [11, 6]]) circle(g, x, y + f * 0.6, 2, '#a070d0'); circle(g, 7, 7, 3, '#e0c0ff'); },
  scree(g, f) { fillPoly(g, [[3, 8 + f * 0.6], [7, 3], [12, 6], [11, 10], [5, 11]], '#8a8478'); fillPoly(g, [[7, 3], [12, 6], [9, 7]], '#c9c0a8'); px(g, 5, 9, '#4e4a44'); },
  ore(g, f) { for (const a of [0, 1, 2, 3]) { const an = a * 0.785 + f * 0.4; line(g, 7 - Math.cos(an) * 6, 7 - Math.sin(an) * 6, 7 + Math.cos(an) * 6, 7 + Math.sin(an) * 6, '#ffb060'); } circle(g, 7, 7, 2.2, '#fff0c0'); },
  storm(g, f) { const p = f ? [[1, 5], [5, 8], [7, 4], [10, 9], [13, 6]] : [[1, 8], [5, 4], [7, 9], [10, 5], [13, 8]]; for (let i = 0; i < 4; i++) line(g, p[i][0], p[i][1], p[i + 1][0], p[i + 1][1], '#bfe6f5'); line(g, p[0][0], p[0][1] + 1, p[1][0], p[1][1] + 1, '#ffffff'); px(g, 7, f ? 4 : 9, '#ffffff'); },
  drowned(g, f) { for (let i = 0; i <= 10; i++) { const x = 1 + i, y = 7 + Math.round(Math.sin(i * 0.8 + f * 1.6) * 3); px(g, x, y, '#8ff0dc'); px(g, x, y + 1, '#27717a'); } circle(g, 12, 7, 1.6, '#e0fff8'); },
  lantern(g, f) { for (let i = 0; i < 8; i++) { const an = i * 0.785; line(g, 7, 7, 7 + Math.cos(an) * (5 + (i + f) % 2), 7 + Math.sin(an) * (5 + (i + f) % 2), '#ffd36b'); } circle(g, 7, 7, 3, '#fff0a0'); circle(g, 7, 7, 1.4, '#ffffff'); },
  grave(g, f) { ellipse(g, 7, 7, 5, 3, '#6a7a8a'); ellipse(g, 7, 7, 3.4, 2, '#c9d1dc'); ellipse(g, 7, 7, 1.6, 1, '#ffffff'); px(g, 2, 5 + f, '#a0f0ff'); px(g, 12, 9 - f, '#a0f0ff'); },
  sun(g, f) { fillPoly(g, [[0, 7], [9, 5.4], [13, 7], [9, 8.6]], '#ffe08a'); fillPoly(g, [[3, 7], [9, 6.2], [12, 7], [9, 7.8]], '#fff8d0'); if (f) { px(g, 1, 4, '#fff0b0'); px(g, 1, 10, '#fff0b0'); } },
  back(g, f) { for (const a of [0, 1, 2, 3]) { const an = a * 0.785 + f * 0.4; line(g, 7 - Math.cos(an) * 5, 7 - Math.sin(an) * 5, 7 + Math.cos(an) * 5, 7 + Math.sin(an) * 5, '#ffd36b'); } circle(g, 7, 7, 3, '#fff6e0'); },
};
function bakeBolts() { const out = {}; for (const k in BOLT) out[k] = [0, 1].map(f => { const [c, g] = mk(14, 14); BOLT[k](g, f); return done(c); }); return out; }
/* THE PARRY GLINT: a four-point star with a gold heart, two sizes (it pulses), drawn over the blade's point */
function bakeGlint() { return [0, 1].map(f => { const [c, g] = mk(19, 19); const r = f ? 8 : 6;
  for (let k = -r; k <= r; k++) { px(g, 9 + k, 9, '#ffffff'); px(g, 9, 9 + k, '#ffffff'); } for (let k = -2; k <= 2; k++) { px(g, 9 + k, 9 + k, '#fff6e0'); px(g, 9 + k, 9 - k, '#fff6e0'); }
  px(g, 8, 9, '#ffd36b'); px(g, 10, 9, '#ffd36b'); px(g, 9, 8, '#ffd36b'); px(g, 9, 10, '#ffd36b'); return c; }); }
/* the briar lash: a segment (two wave phases) and its barbed tip */
function bakeVine() {
  const seg = [0, 1].map(f => { const [c, g] = mk(12, 10); for (let x = 0; x < 12; x++) { const y = 5 + Math.round(Math.sin((x + f * 6) * 0.52) * 1.6); px(g, x, y, '#3f7a48'); px(g, x, y - 1, '#5aa04e'); px(g, x, y + 1, '#2d5a30'); }
    px(g, 3, 2 + f, '#bdb597'); px(g, 3, 3 + f, '#bdb597'); px(g, 9, 8 - f, '#bdb597'); px(g, 9, 7 - f, '#bdb597'); return done(c); });
  const [tc, tg] = mk(14, 14); fillPoly(tg, [[1, 7], [7, 4], [13, 7], [7, 10]], '#3f7a48'); fillPoly(tg, [[7, 4], [13, 7], [8, 6]], '#8fd160');
  for (const [x, y, x2, y2] of [[7, 4, 5, 1], [10, 5, 11, 2], [7, 10, 5, 13], [10, 9, 11, 12]]) line(tg, x, y, x2, y2, '#bdb597');
  return { seg, tip: done(tc) }; }
/* the snare: briars at your feet - sprouting, rising, sprung (a cage of thorns); each 30 wide, standing on the bottom row */
function bakeSnare() { return [0, 1, 2].map(st => { const [c, g] = mk(30, 20); const n = [4, 6, 8][st], hgt = [4, 9, 16][st];
  for (let i = 0; i < n; i++) { const x = 3 + Math.round(i * 24 / (n - 1)), top = 19 - hgt + (i % 2 ? 2 : 0), lean = (i - n / 2) * (st === 2 ? 0.4 : 0.15);
    line(g, x, 19, x + Math.round(lean * 3), top, '#3f7a48'); line(g, x + 1, 19, x + 1 + Math.round(lean * 3), top + 1, '#2d5a30'); px(g, x + Math.round(lean * 3), top - 1, '#bdb597'); px(g, x + 1, Math.round((19 + top) / 2), '#bdb597'); px(g, x - 1, Math.round((19 + top) / 2) + 2, '#bdb597'); }
  if (st === 2) for (let i = 0; i < 5; i++) { const x = 4 + i * 5; px(g, x, 4 + (i % 2) * 2, '#8fd160'); px(g, x + 1, 5 + (i % 2) * 2, '#5aa04e'); }
  return done(c); }); }
/* the mud patch (a cap, a body in two bubble phases, a cap) and the rust patch (plates, flakes) */
function bakeMud() {
  const mid = [0, 1].map(f => { const [c, g] = mk(12, 6); rect(g, 0, 2, 12, 4, '#4a3a22'); rect(g, 0, 1, 12, 1, '#6a5430'); rect(g, 0, 5, 12, 1, '#2e2414'); for (const x of [2, 7]) { circle(g, x + 1, 2 + f, 1.2, '#7a6238'); px(g, x, 1 + f, '#a89058'); } px(g, 10, 3, '#7a6238'); return c; });
  const cap = l => { const [c, g] = mk(6, 6); fillPoly(g, l ? [[6, 1], [3, 1.5], [0, 4], [1, 6], [6, 6]] : [[0, 1], [3, 1.5], [6, 4], [5, 6], [0, 6]], '#4a3a22'); rect(g, l ? 3 : 0, 1, 3, 1, '#6a5430'); px(g, l ? 2 : 3, 4, '#7a6238'); return c; };
  return { mid, l: cap(true), r: cap(false) }; }
function bakeRust() {
  const mid = [0, 1].map(f => { const [c, g] = mk(12, 5); rect(g, 0, 1, 12, 4, '#9a5230'); rect(g, 0, 1, 12, 1, '#c07048'); rect(g, 0, 4, 12, 1, '#5a2e18'); for (const x of [2, 8]) { px(g, x, 2 + f, '#e0a070'); line(g, x + 1, 2, x + 3, 4, '#3a1c0e'); } px(g, 5, 2, '#c07048'); return c; });
  const flake = [0, 1, 2].map(i => { const [c, g] = mk(4, 4); fillPoly(g, [[0, 1 + i % 2], [3, 0], [4, 3], [1, 4]], i ? '#c07048' : '#9a5230'); return c; });
  return { mid, flake }; }
/* the felled pine: baked at the length it lies (a bark body, rings at the cut end, a root flare at the stump, two branch stubs in needles), once per length */
const TRUNKS = new Map();
export function trunkFor(w) {
  w = Math.max(24, Math.round(w)); if (TRUNKS.has(w)) return TRUNKS.get(w);
  const [c, g] = mk(w + 10, 20), y0 = 6, h = 9;
  rect(g, 4, y0, w, h, '#6a4a2a'); rect(g, 4, y0, w, 2, '#8a6a3c'); rect(g, 4, y0 + h - 2, w, 2, '#4a301a');
  for (let x = 8; x < w; x += 7) { px(g, x, y0 + 3, '#4a301a'); px(g, x + 1, y0 + 4, '#4a301a'); px(g, x + 3, y0 + 6, '#8a6a3c'); }
  ellipse(g, w + 4, y0 + 4.5, 2.6, 4.6, '#c49a5c'); ellipse(g, w + 4, y0 + 4.5, 1.6, 3, '#e0c080'); px(g, w + 4, y0 + 4, '#8a6a3c');   /* the cut end, with its rings */
  fillPoly(g, [[4, y0 - 1], [0, y0 + 4], [1, y0 + h + 1], [5, y0 + h]], '#4a301a');   /* the stump's flare */
  for (const bx of [Math.round(w * 0.3), Math.round(w * 0.62)]) { line(g, bx, y0, bx + 3, y0 - 4, '#4a301a'); for (const [dx, dy] of [[0, -5], [2, -6], [4, -5], [5, -4], [-1, -4]]) px(g, bx + dx + 3, y0 + dy, '#3f7a48'); px(g, bx + 4, y0 - 3, '#2d5a30'); }
  const r = { c: done(c), w, ox: 4, oy: y0 + h }; TRUNKS.set(w, r); return r; }
function bakeChips() {
  const chips = [0, 1, 2].map(i => { const [c, g] = mk(5, 4); fillPoly(g, i === 0 ? [[0, 2], [3, 0], [5, 2], [2, 4]] : i === 1 ? [[0, 0], [4, 1], [3, 4]] : [[1, 0], [5, 2], [1, 3]], i === 1 ? '#8a6a3c' : '#c49a5c'); px(g, 2, 1, '#e0c080'); return c; });
  const [gc, gg] = mk(7, 9); fillPoly(gg, [[3, 0], [6, 4], [3, 8], [0, 4]], '#2a1a0c'); line(gg, 3, 1, 3, 7, '#8a6a3c'); px(gg, 2, 3, '#c49a5c'); px(gg, 4, 5, '#c49a5c');
  return { chips, gash: gc }; }
function bakeSnuff() { return [0, 1, 2, 3, 4].map(f => { const [c, g] = mk(18, 18); const r = 2 + f * 1.6;
  for (let i = 0; i < 8; i++) { const an = i * 0.785 + 0.2; px(g, 9 + Math.cos(an) * r, 9 + Math.sin(an) * r, f < 3 ? '#ffd36b' : '#b09a5a'); if (f < 3) px(g, 9 + Math.cos(an) * (r - 2), 9 + Math.sin(an) * (r - 2), '#fff6e0'); }
  if (f < 4) for (let i = 0; i < 3; i++) circle(g, 6 + i * 3, 9 - f * 1.5 - i, 1.4 + f * 0.25, '#78726a'); if (f < 2) circle(g, 9, 9, 3 - f, '#ffffff'); return c; }); }
/* THE ORE PLATE on a pauldron: whole, and cracked (the two halves apart, a dark seam) */
function bakeStuds() {
  const whole = (() => { const [c, g] = mk(9, 9); ellipse(g, 4.5, 4.5, 3.6, 3.2, '#2e2a34'); ellipse(g, 4.5, 4.3, 3, 2.6, '#b09a5a'); ellipse(g, 4, 3.6, 1.8, 1.4, '#e0c070'); px(g, 3, 3, '#ffe9a0'); px(g, 6, 6, '#8a6a3a'); px(g, 5, 5, '#8a4a28'); return done(c); })();
  const cracked = (() => { const [c, g] = mk(9, 9); fillPoly(g, [[1, 2], [4, 1], [4, 5], [3, 8], [1, 6]], '#8a7a4a'); fillPoly(g, [[5, 2], [8, 3], [8, 7], [6, 8], [5, 5]], '#8a7a4a'); px(g, 2, 3, '#b09a5a'); px(g, 6, 4, '#b09a5a'); px(g, 4, 6, '#2e2a34'); px(g, 5, 6, '#2e2a34'); px(g, 4, 8, '#2e2a34'); return done(c); })();
  return { whole, cracked }; }
let FXS = null;
export function bakeFx() { if (FXS) return FXS; return (FXS = { bolt: bakeBolts(), glint: bakeGlint(), vine: bakeVine(), snare: bakeSnare(), mud: bakeMud(), rust: bakeRust(), wood: bakeChips(), snuff: bakeSnuff(), stud: bakeStuds() }); }

/* THE GATE BANNER, one per chapter, five sway phases (the tail swings -2..2 px): an iron pole with knobs, a swallowtail of the chapter's cloth in its trim, the broken
   milestone big on it, tassels. 26x36; the pole's centre is x 13, y 3. */
export function bakeBanner(pal) {
  const K = colours(pal);
  return [-2, -1, 0, 1, 2].map(sw => { const [c, g] = mk(26, 36);
    const P = (pts, k) => fillPoly(g, pts, K[k] || k);
    rect(g, 1, 2, 24, 2, K.iron); rect(g, 1, 2, 24, 1, K.ironLt); circle(g, 1.5, 3, 1.8, K.t); circle(g, 24.5, 3, 1.8, K.t);
    const sh = y => Math.round(sw * (y - 4) / 30);
    const body = (x0, x1, k) => P([[x0 + sh(4), 4], [x1 + sh(4), 4], [x1 + sh(28), 28], [(x0 + x1) / 2 + sh(34), 33], [x0 + sh(28), 28]], k);
    body(4, 22, 'C'); body(5, 21, 'c'); P([[5 + sh(4), 5], [9 + sh(4), 5], [9 + sh(28), 28], [5 + sh(28), 28]], 'C'); P([[17 + sh(4), 5], [21 + sh(4), 5], [21 + sh(28), 28], [17 + sh(28), 28]], 'cl');
    for (let y = 5; y < 30; y++) { px(g, 4 + sh(y), y, K.t); px(g, 21 + sh(y), y, K.t); }
    for (let x = 4; x <= 21; x++) px(g, x + sh(4), 5, K.t);
    for (let k = 0; k < 8; k++) { px(g, 5 + k + sh(27), 27 - (k % 2), K.T); px(g, 21 - k + sh(27), 27 - (k % 2), K.T); }
    const mx = 13 + sh(15), my = 11;   /* THE BROKEN MILESTONE */
    P([[mx - 4, my + 3], [mx - 3, my + 0.4], [mx, my - 1], [mx + 3, my + 0.4], [mx + 4, my + 3], [mx + 4, my + 14], [mx - 4, my + 14]], 'stone'); P([[mx + 1, my - 0.6], [mx + 3, my + 0.4], [mx + 4, my + 3], [mx + 4, my + 14], [mx + 1, my + 14]], 'stoneDk');
    line(g, mx - 2, my + 4, mx + 1, my + 7, K.black); line(g, mx + 1, my + 7, mx - 2, my + 9, K.black); line(g, mx - 2, my + 9, mx + 2, my + 13, K.black); px(g, mx - 3, my + 12, K.stoneDk);
    for (const tx of [4, 13, 21]) { const x = tx + sh(33); px(g, x, 33, K.t); px(g, x, 34, K.T); }
    return done(c); }); }
