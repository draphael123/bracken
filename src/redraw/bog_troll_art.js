// bog_troll_art.js - THE BOG TROLL and THE GOBLIN STILT-WALKER, drawn (claude/fenroadart, the SONNET art pass over the greybox claude/fenroad). ART ONLY: nothing here reads
// or changes a hitbox, a timer or a number - src/bog-troll-hands.js owns POSE (the contract) and src/stilt-walker.js owns the frame list; they call these.
//   trollSprite(name, pose, time, ph, flash, sink)   one baked + outlined + alpha-snapped sprite per (pose, 1/8 of its animation, phase, flash, sink px)
//   bakeTrollCard()                                  the bestiary card, from the same drawing
//   bakeStiltSheet(canvas, flipX, whiten, STILT)     the stilt-walker's 13 frames (0 idle 1-2 stride 3 jab windup 4 jab 5 horn 6 topple 7 down 8-9 stiltless 10 stab windup 11 stab 12 hurt)
// SCALE: the game is 320x180 and the troll ~40x56 - every shape here is read at 1x: big masses, 1 px edges, no detail that a 3x zoom is needed to see.
import { canvas, outline } from '../px.js';

const R = Math.round;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const OUTC = '#10160e';
/* THE TROLL'S PALETTE: bog-green hide going grey-brown where the peat has caked, lit from the top left; weed, amber eyes, yellowed tusks */
const C = {
  h0: '#262a1a', h1: '#3c3e28', h2: '#5a5c3a', h3: '#7a7e4a', h4: '#9ca662', h5: '#c4cc86',   /* hide, dark -> lit */
  p0: '#2a1c12', p1: '#42301e', p2: '#5f4630', p3: '#80603e',                                    /* peat, dark -> pale */
  w0: '#1b3320', w1: '#2c5030', w2: '#4a7a40', w3: '#7aa65a',                                    /* weed */
  belly: '#8a8e5c', bellyD: '#686c44', mouth: '#2a1210', gum: '#6a2c28', tusk: '#a89a72', tuskL: '#e6dcb4',
  eye: '#ffcf6a', red: '#ff4a2a', wet: '#cfe0d0', board: '#6a5038', boardD: '#3a2818', boardL: '#9a7a52',
};
const ell = (g, x, y, rx, ry, col, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, Math.max(0.6, rx), Math.max(0.6, ry), rot, 0, 7); g.fill(); };
const poly = (g, pts, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); g.fill(); };
const box = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), Math.max(1, R(w)), Math.max(1, R(h))); };
/* a tapered limb segment from (x0,y0) w0 wide to (x1,y1) w1 wide */
function seg(g, x0, y0, x1, y1, w0, w1, col) {
  const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  poly(g, [[x0 + nx * w0 / 2, y0 + ny * w0 / 2], [x1 + nx * w1 / 2, y1 + ny * w1 / 2], [x1 - nx * w1 / 2, y1 - ny * w1 / 2], [x0 - nx * w0 / 2, y0 - ny * w0 / 2]], col);
}
/* THE POSE A MODE WEARS (src/bog-troll-hands.js POSE, the contract): torso [dy, lean], armF/armB [x, y] hands, head [dx, dy, tilt], mouth, splinter, weed, clod, wreck, flail, planks, grip */
const WATER = 16;   /* the fen's surface under the road's top */

/* one arm: shoulder -> elbow -> hand; the elbow bows OUT and down (a long heavy arm), a knuckled fist with three claws */
function arm(g, sx, sy, hx, hy, far, o = {}) {
  const dk = far ? C.h1 : C.h2, mid = far ? C.h2 : C.h3, lit = far ? C.h3 : C.h4, out = sx >= 0 ? 1 : -1;
  const dx = hx - sx, dy = hy - sy, l = Math.hypot(dx, dy) || 1, k = Math.min(9, l * 0.3);
  const ex = (sx + hx) / 2 + out * k * (Math.abs(dx) < Math.abs(dy) ? 1 : 0.25), ey = (sy + hy) / 2 + k * (Math.abs(dx) < Math.abs(dy) ? 0.35 : 0.9);
  seg(g, sx, sy, ex, ey, 11, 8, dk); seg(g, ex, ey, hx, hy, 8, 7, dk);
  seg(g, sx - 0.8, sy - 2, ex - 0.8, ey - 2, 6, 4, mid); seg(g, ex - 0.4, ey - 2, hx - 0.4, hy - 2, 4, 3.4, mid); seg(g, sx - 1.4, sy - 3, ex - 1.2, ey - 3, 2, 1.6, lit);
  ell(g, sx, sy, 6, 5.4, dk); ell(g, sx - 1, sy - 1.4, 3.6, 3, mid);   /* the shoulder ball */
  ell(g, ex, ey, 4, 3.6, dk); ell(g, ex - 0.8, ey - 1, 2, 1.6, lit);   /* the elbow knob */
  const mx = (ex + hx) / 2, my = (ey + hy) / 2;
  box(g, mx - 1.5, my - 2, 4, 2, far ? C.p1 : C.p2); box(g, mx + 1, my, 2, 1, C.p0); box(g, mx - 3, my + 1, 1, 1, C.p3);   /* peat caked on the forearm */
  if (!far) { box(g, mx - 3, my - 1, 1, 4, C.w2); box(g, mx - 3, my + 3, 1, 2, C.w1); box(g, mx - 4, my + 1, 1, 3, C.w1); }   /* weed wrapped round it */
  ell(g, hx, hy, 5.6, 5, dk); ell(g, hx - 0.8, hy - 1.4, 3.8, 3, mid); ell(g, hx - 1.8, hy - 2.2, 1.8, 1.1, lit);   /* the fist: a knobby back of the hand */
  const dir = hx >= sx ? 1 : -1;
  for (let i = 0; i < 3; i++) { const fx = hx + dir * (3.6 + (i === 1 ? 0.6 : 0)), fy = hy - 2.6 + i * 2.4; box(g, dir > 0 ? fx : fx - 2.4, fy, 2.6, 1.8, dk); box(g, dir > 0 ? fx + 2.4 : fx - 3.6, fy + 0.2, 1.4, 1.2, '#cfc8a8'); }   /* three claws */
}

/* the head: a heavy brow, small deep eyes, a flat wide snout, an underbite with two tusks, a wet drooping lip; mouth = roaring open */
function head(g, p, flash, time, name) {
  const col = c => (flash ? '#ffffff' : c);
  ell(g, 0, 0, 9, 7.6, col(C.h2)); ell(g, -1.6, -2, 7, 4.8, col(C.h3)); ell(g, -2.4, -3.6, 4, 1.8, col(C.h4));   /* skull, lit crown */
  ell(g, 5.4, 2.4, 6.6, 5, col(C.h2)); ell(g, 4.8, 1.2, 5, 3, col(C.h3));                                         /* the heavy muzzle */
  ell(g, -7, -2, 2.4, 3.4, col(C.h1)); ell(g, -7.6, -2, 1.2, 2, col(C.p1));                                       /* an ear, a torn dark scrap */
  box(g, -1.5, -4.4, 8.4, 2.2, col(C.h0)); box(g, 0, -4.8, 3, 1, col(C.h1));                                       /* the brow ridge */
  const ec = p.mouth || p.flail ? C.red : C.eye;
  box(g, 0.2, -2.6, 2.6, 2, flash ? '#fff' : ec); box(g, 4.2, -2.4, 2.2, 1.8, flash ? '#fff' : ec); box(g, 1.2, -2.2, 1, 1, C.h0);                         /* two small deep eyes */
  if (p.mouth || p.flail) { g.globalAlpha = 0.45; ell(g, 1.6, -1.6, 3, 2.4, C.red); ell(g, 5.4, -1.4, 2.6, 2, C.red); g.globalAlpha = 1; }
  box(g, 7.6, 0.6, 1.4, 1.2, col(C.p1)); box(g, 9.4, 1, 1, 1, col(C.p1));                                          /* nostrils */
  if (p.mouth) {   /* open: a dark maw, red gum, the tusks long, a tongue */
    poly(g, [[0, 4], [11, 3.4], [10, 10.5], [1, 10]], C.mouth); box(g, 1, 4, 9, 1, C.gum); box(g, 3, 8, 5, 2, '#a04040');
    box(g, 1, 2.4, 2, 3, C.tuskL); box(g, 9, 2.4, 2, 3.4, C.tuskL); box(g, 4, 4.4, 1, 1.4, C.tusk); box(g, 7, 4.4, 1, 1.4, C.tusk);
    box(g, 0.4, 9.4, 11, 1.4, col(C.h1));
  } else {   /* shut: the underbite, a lip, two tusks up past it */
    box(g, 0.6, 5, 10.4, 2.4, col(C.h1)); box(g, 0.6, 5, 10.4, 1, C.mouth); box(g, 1.4, 1.4, 1.8, 4.4, C.tusk); box(g, 8.2, 1.4, 1.8, 4.6, C.tusk); box(g, 1.4, 1.4, 1, 3, C.tuskL); box(g, 8.2, 1.4, 1, 3, C.tuskL);
    box(g, 3, 7, 1, 2, C.wet); if (Math.floor(time * 3) % 2) box(g, 3, 9, 1, 1, C.wet);   /* a string of spit */
  }
  /* warts, a moss tuft on the crown, a scar */
  box(g, -4, 1, 1, 1, col(C.p2)); box(g, 6, -1, 1, 1, col(C.h4)); box(g, 2, 3, 1, 1, col(C.h1)); for (let i = 0; i < 3; i++) box(g, -5 + i * 2, -7.6 - (i & 1), 1, 2 + (i & 1), C.w2);
  box(g, 3, -1.4, 3, 0.8, col(C.h4));
}

/* the torso: a hunched bog-green bulk - a great shoulder hump, a pot belly, peat caked down one flank, wet and mottled, weed hanging off the hump and the hip */
function torso(g, p, flash, time, ph, top, base, name) {
  const col = c => (flash ? '#ffffff' : c);
  const cy = (top + base) / 2, ry = (base - top) / 2;
  ell(g, 0, cy + 3, 20, ry + 3, col(C.h1));                       /* the dark mass (the far flank) */
  ell(g, 1, cy + 3, 18, ry + 1, col(C.h2));
  ell(g, -8, top + 8, 11.5, 9, col(C.h2)); ell(g, -9, top + 6.5, 9, 6.5, col(C.h3)); ell(g, -10, top + 4.6, 5.4, 3.2, col(C.h4)); ell(g, -11, top + 3.6, 2.6, 1.4, col(C.h5));   /* the shoulder hump, lit */
  ell(g, 4, cy + 8, 13, ry - 5, col(C.belly)); ell(g, 3, cy + 7, 10, ry - 8, flash ? '#fff' : '#a0a26c'); ell(g, 5, cy + 14, 11, 5, col(C.bellyD));   /* the pot belly: paler, a fold under it */
  /* ribs / muscle folds */
  for (let i = 0; i < 3; i++) { box(g, 0 + i * 2, cy + 3 + i * 4, 9 - i, 1, col(C.h2)); box(g, 1 + i * 2, cy + 4 + i * 4, 7 - i, 1, col(C.bellyD)); }
  /* peat caked down the near flank and on the shoulder; mud streaks */
  poly(g, [[-18, cy - 2], [-12, cy - 4], [-10, cy + 10], [-14, cy + 16], [-19, cy + 12]], col(C.p2)); poly(g, [[-18, cy], [-14, cy - 2], [-13, cy + 9], [-17, cy + 12]], col(C.p1));
  box(g, -17, cy + 1, 2, 1, C.p3); box(g, -15, cy + 6, 1, 1, C.p3);
  ell(g, 11, top + 14, 3.4, 2.4, col(C.p1)); box(g, 10, top + 13, 2, 1, C.p2); box(g, 6, cy + 11, 4, 2, col(C.p1)); box(g, 3, cy + 20, 3, 2, col(C.p2));
  /* mottle: darker and lighter warts scattered across the hide */
  for (let k = 0; k < 26; k++) { const mx = -16 + (hash(k, 3) % 34), my = top + 3 + (hash(k, 5) % Math.max(8, R(base - top - 6))); if (Math.hypot((mx + 1) / 19, (my - cy - 3) / (ry + 3)) < 0.9) box(g, mx, my, 1 + (k % 3 === 0), 1, col(k % 2 ? C.h1 : C.h4)); }
  /* the spine's ridge of moss and bristle over the hump; P2: weed standing up off his back */
  const up = ph > 1 ? 4 : 0;
  for (let i = 0; i < 6; i++) { const wx = -17 + i * 3.4, wy = top + 4 + Math.abs(i - 2) * 1.5; box(g, wx, wy - 2 - (i % 2) - up, 1, 3 + (i % 2) + up, col(i % 2 ? C.w2 : C.w1)); if (up) box(g, wx + 1, wy - 3 - up, 1, 2, C.w3); }
  /* weed hanging off the hump and the hip, dripping at the tips */
  const sway = Math.round(Math.sin(time * 2.2) * 1);
  for (let i = 0; i < 4; i++) { const wx = -13 + i * 3, wy = top + 11 + (i % 2) * 2; box(g, wx, wy, 1, 5 + (i % 3) * 2, col(i % 2 ? C.w1 : C.w2)); box(g, wx + sway, wy + 5 + (i % 3) * 2, 1, 2, col(C.w1)); }
  box(g, 14, cy + 12, 1, 6, col(C.w1)); box(g, 15, cy + 12, 1, 4, col(C.w2));
}

/* the whole body, in its pose; origin = the road's top under his middle, facing right; nothing under the water line */
function drawTroll(g, name, p, flash, time, ph, sinkK) {
  const ty = (p.torso ? p.torso[0] : 0) + sinkK, lean = p.torso ? p.torso[1] : 0, top = -30 + ty, base = WATER;
  g.save(); g.beginPath(); g.rect(-200, -200, 400, 200 + base); g.clip();
  if (p.wreck) {   /* the broken boards round a stuck: splintered ends, one tilted either way, a plank across his belly */
    for (let i = -3; i <= 3; i++) { const a = i * 0.34 + Math.sin(time * 9 + i) * (p.flail ? 0.05 : 0); g.save(); g.translate(i * 7.4, 3 + Math.abs(i) * 0.4); g.rotate(a); box(g, -6, -2, 12, 4, C.board); box(g, -6, -2, 12, 1, C.boardL); box(g, -6, 1, 12, 1, C.boardD); box(g, -6, -2, 2, 4, C.boardD); box(g, 4, -3, 2, 1, C.boardL); g.restore(); } }
  g.save(); g.translate(0, base); g.rotate(lean); g.translate(0, -base);
  torso(g, p, flash, time, ph, top, base, name);
  const hx = (p.head ? p.head[0] : 6) + 8, hy = top + (p.head ? p.head[1] : 0) + 4;
  g.save(); g.translate(hx, hy); g.rotate(p.head ? p.head[2] : 0); head(g, p, flash, time, name); g.restore();
  g.restore();
  const sh = [9, top + 10], shB = [-9, top + 10], fl = p.flail ? Math.sin(time * 18) * 8 : 0;
  const aF = p.armF || [20, 0], aB = p.armB || [-20, 0];
  arm(g, shB[0], shB[1], aB[0] - fl, aB[1] + ty * 0.3, true, { up: aB[1] < -20 });
  arm(g, sh[0], sh[1], aF[0] + fl, aF[1] + (p.flail ? -fl : 0), false, { up: aF[1] < -20 });
  if (p.weed) { const q = aF[0], w = aF[1]; for (let i = 0; i < 4; i++) { box(g, q - 5 + i * 3, w + 5, 1, 6 + ((time * 10 + i) % 5 | 0), i % 2 ? C.w1 : C.w2); } if (Math.floor(time * 8) % 2) box(g, q, w + 14, 1, 2, C.wet); if (Math.floor(time * 6) % 2) box(g, q - 3, w + 16, 1, 1, C.wet); }
  if (p.clod) { ell(g, aF[0] + 3, aF[1] - 3, 6, 5, C.p1); ell(g, aF[0] + 2, aF[1] - 4, 4, 3, C.p2); box(g, aF[0] + 1, aF[1] - 6, 2, 1, C.p3); box(g, aF[0] + 4, aF[1] - 1, 2, 2, C.p0); box(g, aF[0] + 6, aF[1] + 3, 1, 3, C.wet); }
  if (p.planks) { g.save(); g.translate(1, -54); g.rotate(-0.15);
    box(g, -27, -3, 54, 6, C.board); box(g, -27, -3, 54, 1, C.boardL); box(g, -27, 2, 54, 2, C.boardD); for (let i = -25; i < 26; i += 14) { box(g, i, -3, 1, 6, C.boardD); box(g, i + 3, -1, 1, 1, C.boardD); }
    box(g, -27, 3, 6, 3, C.boardD); box(g, 20, 3, 5, 5, C.boardD); box(g, -22, 4, 1, 5, C.p1); box(g, 12, 4, 1, 6, C.w1);   /* torn ends, a stump of post, weed + peat dripping */
    g.restore(); }
  if (p.grip) { for (const a of [aF, aB]) { box(g, a[0] - 5, a[1] - 3, 12, 3, C.board); box(g, a[0] - 5, a[1] - 3, 12, 1, C.boardL); box(g, a[0] - 3, a[1] - 5, 2, 2, C.boardD); } }
  if (p.splinter) for (let i = 0; i < 8; i++) { const a = i * 0.78 + time * 4; box(g, Math.cos(a) * 24, -8 - Math.abs(Math.sin(a)) * 22, 4, 2, i % 3 ? C.board : C.boardL); }
  /* the water he stands in: a broken foam ring at the surface, drips off his belly */
  g.globalAlpha = 0.9;
  for (let i = -3; i <= 3; i++) { const wy = base - 2 - ((i + time * 1.5) % 2 > 1 ? 1 : 0); box(g, i * 6 - 3, wy, 5, 1, C.wet); }
  g.globalAlpha = 0.55; for (let i = -2; i <= 2; i++) box(g, i * 8 - 2, base - 4 - (i & 1), 3, 1, '#e6efe6'); g.globalAlpha = 1;
  g.restore();
}

/* the animation index a pose's own motion uses: flail / weed / splinter / spit / the foam ring all move on 8 steps a second, so the cache stays small */
const animated = p => p.flail || p.weed || p.splinter || p.mouth || p.wreck;
export const TROLL_ANCHOR = { ax: 100, ay: 92, w: 200, h: 112 };
export function trollSprite(name, pose, time, ph, flash, sinkK = 0) {
  const k = animated(pose) || true ? Math.floor(time * 6) % 8 : 0, sk = Math.max(0, Math.min(40, Math.round(sinkK / 2) * 2)), key = `${name}|${k}|${ph > 1 ? 2 : 1}|${flash ? 1 : 0}|${sk}`;
  return once(key, () => {
    const [c, g] = canvas(TROLL_ANCHOR.w, TROLL_ANCHOR.h); g.translate(TROLL_ANCHOR.ax, TROLL_ANCHOR.ay); drawTroll(g, name, pose, flash, k / 6 + 0.02, ph, sk);
    const img = g.getImageData(0, 0, c.width, c.height), d = img.data; for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0; g.setTransform(1, 0, 0, 1, 0, 0); g.putImageData(img, 0, 0);   /* snap the soft edges: pixel art */
    const o = outline(c, OUTC), og = o.getContext('2d'); og.clearRect(0, TROLL_ANCHOR.ay + WATER + 1, o.width, o.height);   /* no outline on the water line: the fen takes him there */
    return o; });
}
/* HIS BESTIARY CARD: two of his poses (up, the drag's windup), from the same drawing - main.js SPR.bogtrollCard reads SPR[t + 'Card'].R */
export function bakeTrollCard(POSE, BT, whiten, flipX) {
  const fr = ['up', 'dragTell'].map((n, i) => { const [c, g] = canvas(64, 52); g.imageSmoothingEnabled = false; g.save(); g.translate(30, 36); g.scale(0.78, 0.78); drawTroll(g, n, POSE[n], false, i * 0.4 + 0.02, 1, 0); g.restore();
    const img = g.getImageData(0, 0, c.width, c.height), d = img.data; for (let q = 3; q < d.length; q += 4) d[q] = d[q] > 110 ? 255 : 0; g.putImageData(img, 0, 0); return outline(c, OUTC); });
  const white = fr.map(c => whiten(c)); return { R: fr, L: fr.map(flipX), white: { R: white, L: white.map(flipX) }, ax: 30, ay: 42, w: BT.w, h: BT.h };
}
