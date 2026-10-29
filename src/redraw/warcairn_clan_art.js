// src/redraw/warcairn_clan_art.js - THE WAR CAIRN's clan, DRAWN (claude/warcairnart). Daniel's theme rule: no goblins after the Goblin Queen - the greybox clan were
// recoloured goblin sheets (src/redraw/warcairn_skins.js) and still had goblin heads and tusks. These are MEN AND WOMEN OF THE CLAN: weathered skin, war paint,
// hide and fur, antlers and bone, hatchets. Each one keeps the frame order, canvas size, anchor and hit box of the sheet it stands in for (the BASE sheet is read at bake
// time and only its geometry is used), so every machine that drives the frames (soldier, javelin, shield, heavy, berserker, acolyte) keeps working:
//   clanaxe     (soldier's frames)   0-3 walk | 4 GUARD (hatchet up before the face) | 5 CHOP TELL (hatchet wound back over the shoulder) | 6 CHOP (swept down ahead, smear)
//   clanthrower (javelin's frames)   0-3 walk, a hatchet carried up | 4 AIM (cocked behind the head) | 5 THROW (arm out, hand EMPTY, smear) | 6 idle
//   clanguard   (shield's frames)    0-3 walk | 4 TAKE IT (the two axes crossed square across him) | 5 TUCK | 6 SHOVE | 7 hurt   - TWO CROSSED AXES, not a shield
//   clanchamp   (heavy's frames)     0-3 walk, the great axe dragged | 4 RAISE (overhead, long tell) | 5 SLAM | 6 guard (haft upright)
//   clanrunner  (berserker's)        0 asleep | 1 waking | 2,3 run | 4 windup | 5 swing | 6 stumble
//   drummer     (acolyte's runner)   a hooded drummer in a grey hide cloak, an antler band (src/war-cairn-hands.js hangs the drum on his back)
// Every frame faces RIGHT (L is the flip). px.js primitives only.
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

const C = { skin: '#c98e62', skinD: '#9a6540', skinL: '#e2ae80', hair: '#2e1c12', hairG: '#a8481e', hairW: '#c8c2b4', paint: '#c0281c', paintD: '#7e140f', bone: '#e8dcc0', boneD: '#b0a488',
  fur: '#8e8a80', furD: '#5e5a52', furL: '#bab6aa', hide: '#7a5a3c', hideD: '#4e3822', hideL: '#9a7650', pant: '#4e4238', boot: '#33261c', steel: '#c8ccd4', steelD: '#8a93a3', steelL: '#f0f4fa',
  haft: '#6a4428', haftD: '#4a2e18', bear: '#4a3a2e', bearL: '#6e5a48', bearD: '#2e2218', rope: '#b89a6a', clay: '#e8e0d0' };

function pack(frames, ax, ay, w, h) { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)), whiteL = white.map(c => flipX(c)); return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h }; }
/* draw the frame, outline it, then settle it so the outline row under the feet is exactly row ay (the bases' own anchor rule) */
function settleTo(c, ay) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = ay - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
const frames = (W, H, ay, n, fn) => Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H); fn(g, f); outline(c, OUT); return settleTo(c, ay); });

/* a stroke t px thick (parallel lines) */
function tl(g, x0, y0, x1, y1, col, t = 1) { for (let i = 0; i < t; i++) { const o = i - (t - 1) / 2; if (Math.abs(x1 - x0) >= Math.abs(y1 - y0)) line(g, x0, y0 + o, x1, y1 + o, col); else line(g, x0 + o, y0, x1 + o, y1, col); } }
const rad = a => a * Math.PI / 180;
/* an axe: the haft from the hand (hx, hy) at ang degrees (0 = right, -90 = up) len px long, the head at the far end, bit facing `side` (+1 = to the clockwise side of the haft) */
function axe(g, hx, hy, ang, len, hs = 3, side = 1, o = {}) {
  const dx = Math.cos(rad(ang)), dy = Math.sin(rad(ang)), nx = -dy * side, ny = dx * side, ex = hx + dx * len, ey = hy + dy * len, th = o.thick || 1;
  tl(g, hx - dx * (o.tail || 1), hy - dy * (o.tail || 1), ex, ey, C.haft, th); if (th === 1) px(g, hx + dx * 2, hy + dy * 2, C.haftD);
  /* the bit: a wedge, narrow at the haft, flaring to the cutting edge */
  const e0 = [ex - dx * 1.5, ey - dy * 1.5], e1 = [ex + dx * 1.2, ey + dy * 1.2];
  fillPoly(g, [[e0[0] + nx * 0.3, e0[1] + ny * 0.3], [e0[0] + nx * hs - dx * 0.8, e0[1] + ny * hs - dy * 0.8], [e1[0] + nx * (hs + 0.8) + dx * 0.8, e1[1] + ny * (hs + 0.8) + dy * 0.8], [e1[0] + nx * 0.3, e1[1] + ny * 0.3]], C.steel);
  line(g, e0[0] + nx * hs, e0[1] + ny * hs, e1[0] + nx * (hs + 0.8), e1[1] + ny * (hs + 0.8), C.steelL);                       // the edge
  px(g, ex + nx * 0.6, ey + ny * 0.6, C.steelD); }
/* the swing's smear: a pale arc round (cx, cy), radius r, from a0 to a1 degrees */
function smear(g, cx, cy, r, a0, a1, col = '#f2ecdc') { for (let a = a0; a <= a1; a += 3) px(g, cx + Math.cos(rad(a)) * r, cy + Math.sin(rad(a)) * r, col); }

/* THE MAN. o: x (centre), gy (lowest foot row), legH, torsoH, hr (head radius), sw (half shoulder width), lean, crouch, feet [[dx, lift] x2] (back, front),
   jerkin colours, bare (skin chest), paint (chest stripe), hair style, headgear fn, pre/post callbacks that draw behind / in front of the trunk. */
function man(g, o) {
  const x = o.x, gy = o.gy, legH = o.legH ?? 5, torsoH = o.torsoH ?? 6, hr = o.hr ?? 2.5, sw = o.sw ?? 3, lean = o.lean ?? 0, crouch = o.crouch ?? 0, feet = o.feet || [[-1, 0], [1, 0]];
  const hipY = gy - legH + crouch + 1, shY = hipY - torsoH, shX = x + lean, hX = shX + (o.headDx ?? 1), hY = shY - hr + 0.5 + (o.headDy ?? 0);
  const K = { x, gy, hipY, shY, shX, hX, hY, hr, sw };
  /* back leg, back arm / back items */
  const legs = i => { const [dx, lift] = feet[i], hx = x + (i ? 1 : -1), fx = x + (i ? 1 : -1) + dx, fy = gy - lift;
    tl(g, hx, hipY, fx, fy - 1, o.pants || C.pant, 2); rect(g, fx - 1, fy - 1, 4, 2, o.boots || C.boot); if (o.wrap) px(g, fx, fy - 2, o.wrap); };
  legs(0); if (o.pre) o.pre(g, K);
  /* the trunk */
  const tc = o.bare ? C.skin : (o.jerkin || C.hide);
  fillPoly(g, [[shX - sw, shY], [shX + sw, shY], [x + sw - 1, hipY + 1], [x - sw + 1, hipY + 1]], tc);
  if (o.bare) { for (let k = 0; k < torsoH; k += 2) px(g, shX - 1 + (k >> 1), shY + k, C.skinD); }
  else { line(g, shX - sw, shY + 1, x - sw + 1, hipY, o.jerkinL || C.hideL); line(g, shX + sw - 1, shY + 1, x + sw - 2, hipY, o.jerkinD || C.hideD); }
  rect(g, x - sw + 1, hipY - 1, sw * 2 - 1, 1, o.belt || C.haftD);                                                           // the belt
  if (o.paintChest) { line(g, shX - 1, shY + 1, x + 1, hipY - 2, C.paint); line(g, shX + 1, shY + 1, x + 3, hipY - 2, C.paint); }
  if (o.trunk) o.trunk(g, K);
  legs(1);
  /* the head */
  const skin = o.skin || C.skin;
  ellipse(g, hX, hY, hr, hr, skin); px(g, hX - Math.floor(hr), hY + 1, C.skinD);
  if (o.head) o.head(g, K, hX, hY);
  /* the eyes, with the war paint across them */
  px(g, hX + 1, hY - 0.5, '#1a0e0a'); if (hr >= 2.4) px(g, hX + 2, hY - 0.5, '#1a0e0a');
  if (o.post) o.post(g, K);
  return K;
}
/* an arm from the shoulder to a hand */
function arm(g, K, hx, hy, col, t = 1, front = true) { tl(g, K.shX + (front ? K.sw - 1 : -K.sw + 1), K.shY + 1, K.shX + hx, K.shY + hy, col, t); }

/* ---------- ARTISANS OF EACH HEAD ---------- */
const topknot = (g, K, hX, hY) => { rect(g, hX - 2, hY - 3, 5, 1, C.hair); rect(g, hX - 2, hY - 2, 2, 3, C.hair); rect(g, hX - 1, hY - 5, 2, 2, C.hair); px(g, hX - 4, hY, C.hair);       // a topknot and a tail
  line(g, hX - 3, hY - 1, hX - 5, hY + 2, C.hair); rect(g, hX - 2, hY - 0.5, 5, 1, C.paint); rect(g, hX, hY + 1, 3, 1, C.hair); };                                                       // red band across the eyes, a beard
const longHair = (col) => (g, K, hX, hY) => { rect(g, hX - 3, hY - 3, 6, 2, col); line(g, hX - 3, hY - 2, hX - 5, hY + 5, col); line(g, hX - 2, hY - 2, hX - 4, hY + 5, col); rect(g, hX - 2, hY - 0.5, 5, 1, C.paint); rect(g, hX, hY + 1.5, 3, 1, col); };

/* ================= THE AXEMAN ================= */
export function bakeClanAxe(base) {
  const W = base.R[0].width, H = base.R[0].height, ay = base.ay, gy = ay - 1, cx = base.ax, n = base.R.length;
  const walkFeet = [[[-2, 0], [2, 0]], [[0, 0], [0, 2]], [[2, 0], [-2, 0]], [[0, 2], [0, 0]]];
  const F = frames(W, H, ay, n, (g, f) => {
    const o = { x: cx, gy, legH: 5, torsoH: 6, hr: 2.5, sw: 3, head: topknot, jerkin: C.hide, wrap: C.rope,
      trunk: (g2, K) => { rect(g2, K.shX - K.sw, K.shY, K.sw * 2 + 1, 2, C.fur); px(g2, K.shX - K.sw, K.shY + 2, C.furD); px(g2, K.shX + K.sw, K.shY + 2, C.furD); rect(g2, K.shX - 1, K.shY + 3, 2, 3, C.paint); } };   // a wolf-fur collar, a red stripe down the jerkin
    if (f < 4) { o.feet = walkFeet[f]; o.crouch = f % 2 ? 0 : 0;
      o.pre = (g2, K) => arm(g2, K, -2, 6, C.skinD, 1, false);
      o.post = (g2, K) => { arm(g2, K, 5, 3, C.skin, 1); rect(g2, K.shX + 5, K.shY + 2, 2, 2, C.skin); axe(g2, K.shX + 5, K.shY + 3, -62, 8, 3.2, 1); }; }
    else if (f === 4) { o.crouch = 1; o.lean = -1; o.feet = [[-2, 0], [2, 0]];                                                              // GUARD: the hatchet up before his face, the off hand forward
      o.pre = (g2, K) => arm(g2, K, 5, 1, C.skinD, 1, false);
      o.post = (g2, K) => { rect(g2, K.shX + 5, K.shY, 2, 2, C.skin); arm(g2, K, 4, -2, C.skin, 1); axe(g2, K.shX + 4, K.shY - 2, -88, 8, 3.2, 1); }; }
    else if (f === 5) { o.lean = -2; o.crouch = 1; o.feet = [[-3, 0], [2, 0]]; o.headDx = 0;                                              // CHOP TELL: wound back, the hatchet over his shoulder
      o.pre = (g2, K) => arm(g2, K, 3, 3, C.skinD, 1, false);
      o.post = (g2, K) => { arm(g2, K, -2, -6, C.skin, 1); axe(g2, K.shX - 2, K.shY - 6, -128, 9, 3.4, -1); px(g2, K.shX - 2, K.shY - 6, C.skin); }; }
    else if (f === 7) { o.lean = -2; o.headDx = 0; o.headDy = 1; o.feet = [[-2, 0], [2, 0]];                                                    // hurt: rocked back, the hatchet dropping
      o.pre = (g2, K) => arm(g2, K, -3, 3, C.skinD, 1, false);
      o.post = (g2, K) => { arm(g2, K, 3, 6, C.skin, 1); axe(g2, K.shX + 3, K.shY + 6, 70, 6, 2.2, -1); }; }
    else { o.lean = 2; o.crouch = 1; o.feet = [[-3, 0], [4, 0]]; o.headDx = 2;                                                              // CHOP: swept down and out ahead
      o.pre = (g2, K) => arm(g2, K, -3, 3, C.skinD, 1, false);
      o.post = (g2, K) => { arm(g2, K, 8, 2, C.skin, 1); axe(g2, K.shX + 8, K.shY + 2, 25, 8, 3.4, -1); smear(g2, K.shX + 3, K.shY - 3, 12, -80, 30); }; }
    man(g, o);
  });
  return pack(F, base.ax, ay, base.w, base.h);
}

/* ================= THE HATCHET-THROWER ================= */
export function bakeClanThrower(base) {
  const W = base.R[0].width, H = base.R[0].height, ay = base.ay, gy = ay - 1, cx = base.ax, n = base.R.length;
  const walkFeet = [[[-2, 0], [2, 0]], [[0, 0], [0, 2]], [[2, 0], [-2, 0]], [[0, 2], [0, 0]]];
  const hatchets = (g2, K) => { for (let i = 0; i < 3; i++) { const bx = K.shX - 2 + i * 2, by = K.shY + 1 + i; px(g2, bx, by, C.steel); px(g2, bx + 1, by, C.steelD); } line(g2, K.shX - K.sw, K.shY, K.x + 2, K.hipY, C.rope); };   // the bandolier, three small heads
  const F = frames(W, H, ay, n, (g, f) => {
    const o = { x: cx, gy, legH: 5, torsoH: 5, hr: 2.3, sw: 2.5, head: longHair(C.hairG), bare: true, paintChest: false, pants: C.hideD, wrap: C.rope, trunk: hatchets };
    if (f < 4) { o.feet = walkFeet[f];
      o.pre = (g2, K) => arm(g2, K, -2, 5, C.skinD, 1, false);
      o.post = (g2, K) => { arm(g2, K, 4, 2, C.skin, 1); axe(g2, K.shX + 4, K.shY + 3, -72, 6, 2.2, 1); }; }
    else if (f === 4) { o.lean = -2; o.feet = [[-3, 0], [3, 0]]; o.headDx = 0;                                                                // AIM: the hatchet cocked back by the head, the off arm pointing at you
      o.pre = (g2, K) => { arm(g2, K, 6, -1, C.skinD, 1, false); rect(g2, K.shX + 6, K.shY - 2, 2, 2, C.skinD); };
      o.post = (g2, K) => { arm(g2, K, -3, -5, C.skin, 1); axe(g2, K.shX - 3, K.shY - 5, -100, 7, 3, 1); }; }
    else if (f === 5) { o.lean = 2; o.feet = [[-3, 0], [3, 0]]; o.headDx = 2;                                                                  // THROW: the arm whipped out, the hand empty
      o.pre = (g2, K) => arm(g2, K, -3, 3, C.skinD, 1, false);
      o.post = (g2, K) => { arm(g2, K, 8, -2, C.skin, 1); rect(g2, K.shX + 8, K.shY - 3, 2, 2, C.skin); smear(g2, K.shX + 1, K.shY - 2, 9, -75, 15); }; }
    else { o.feet = [[-1, 0], [1, 0]];                                                                                                         // idle, the hatchet grounded at his side
      o.pre = (g2, K) => arm(g2, K, -2, 5, C.skinD, 1, false);
      o.post = (g2, K) => { arm(g2, K, 3, 4, C.skin, 1); axe(g2, K.shX + 3, K.shY + 4, -84, 6, 2.2, 1); }; }
    man(g, o);
  });
  return pack(F, base.ax, ay, base.w, base.h);
}

/* ================= THE CROSSED-AXE GUARD ================= */
export function bakeClanGuard(base) {
  /* (10-29) the guard's canvas is 8 px wider and 4 taller than the base shield goblin's (anchor moved with it; the hit box and the logical w/h are the base's): his crossed axes were cramped in 16x16 */
  const PADX = 8, PADY = 4, W = base.R[0].width + PADX, H = base.R[0].height + PADY, ax2 = base.ax + PADX / 2, ay = base.ay + PADY, gy = ay - 1, cx = ax2 - 1, n = base.R.length;
  const walkFeet = [[[-2, 0], [2, 0]], [[0, 0], [0, 2]], [[2, 0], [-2, 0]], [[0, 2], [0, 0]]];
  /* the cloak: a bear's hide round the shoulders, falling behind, its head-hole a snarl of fur on the shoulder */
  const cloak = (g2, K) => { fillPoly(g2, [[K.shX - K.sw - 1, K.shY - 1], [K.shX + K.sw - 1, K.shY - 1], [K.x + K.sw - 3, K.hipY], [K.x - K.sw - 3, K.hipY + 1]], C.bear);
    rect(g2, K.shX - K.sw - 1, K.shY - 1, K.sw * 2 + 1, 2, C.bearL); line(g2, K.shX - K.sw, K.shY + 2, K.x - K.sw - 2, K.hipY, C.bearD); };
  const cross = (g2, K, spread, up, hs) => { hs = 2.2; const bx = K.shX + 3, by = K.shY + 4 - up;                                                             // TWO CROSSED AXES: two hafts in an X, a bit at the top of each
    axe(g2, bx - 1, by, -90 + spread, 9, hs, 1); axe(g2, bx + 1, by, -90 - spread, 9, hs, -1); rect(g2, bx - 1, by - 1, 3, 2, C.skin); };
  const F = frames(W, H, ay, n, (g, f) => {
    const o = { x: cx, gy, legH: 3, torsoH: 4, hr: 2.2, sw: 2.8, head: (g2, K, hX, hY) => { rect(g2, hX - 3, hY - 3, 7, 2, C.hairW); rect(g2, hX - 3, hY - 2, 2, 5, C.hairW); rect(g2, hX - 2, hY - 0.5, 5, 1, C.paint); rect(g2, hX, hY + 1, 3, 3, C.hairW); },   // white hair, a white beard, a red band
      jerkin: C.hideD, wrap: C.rope, pre: cloak, trunk: (g2, K) => { rect(g2, K.shX - 1, K.shY + 2, 3, 1, C.bone); px(g2, K.shX, K.shY + 3, C.bone); } };
    if (f < 4) { o.feet = walkFeet[f]; o.post = (g2, K) => cross(g2, K, 32, 0, 3); }
    else if (f === 4) { o.crouch = 1; o.feet = [[-2, 0], [3, 0]]; o.post = (g2, K) => { cross(g2, K, 52, 1, 4); }; }                                      // TAKE IT: the axes square across his front, wide and high
    else if (f === 5) { o.crouch = 1; o.lean = -1; o.feet = [[-3, 0], [1, 0]]; o.post = (g2, K) => { axe(g2, K.shX + 1, K.shY + 4, 0, 6, 2.2, 1); axe(g2, K.shX + 1, K.shY + 2, -8, 5, 2.2, -1); }; }   // TUCK: the axes pulled in against him
    else if (f === 6) { o.crouch = 1; o.lean = 2; o.feet = [[-3, 0], [4, 0]]; o.post = (g2, K) => { axe(g2, K.shX + 3, K.shY + 4, 4, 6, 2.2, 1); axe(g2, K.shX + 3, K.shY + 2, -4, 6, 2.2, -1); smear(g2, K.shX + 10, K.shY + 1, 4, -60, 60); }; }   // SHOVE: hafts driven out flat
    else { o.lean = -2; o.headDx = 0; o.feet = [[-2, 0], [2, 0]]; o.post = (g2, K) => { axe(g2, K.shX + 1, K.shY - 2, -112, 8, 3, 1); axe(g2, K.shX + 5, K.shY - 1, -70, 8, 3, -1); }; }   // hurt: knocked up and back
    man(g, o);
  });
  return pack(F, ax2, ay, base.w, base.h);
}

/* ================= THE CLAN CHAMPION ================= */
export function bakeClanChamp(base) {
  const W = base.R[0].width, H = base.R[0].height, ay = base.ay, gy = ay - 1, cx = base.ax, n = base.R.length;
  const walkFeet = [[[-4, 0], [4, 0]], [[0, 0], [0, 4]], [[4, 0], [-4, 0]], [[0, 4], [0, 0]]];
  /* an antlered skull-cap, a long black braid, a red war-mask across the eyes */
  const head = (g2, K, hX, hY) => { rect(g2, hX - 4, hY - 4, 8, 2, C.bone); rect(g2, hX - 4, hY - 3, 2, 3, C.bone);
    line(g2, hX - 3, hY - 5, hX - 6, hY - 11, C.bone); line(g2, hX - 6, hY - 11, hX - 9, hY - 12, C.bone); line(g2, hX - 5, hY - 8, hX - 3, hY - 11, C.bone);
    line(g2, hX + 2, hY - 5, hX + 5, hY - 11, C.bone); line(g2, hX + 5, hY - 11, hX + 8, hY - 12, C.bone); line(g2, hX + 4, hY - 8, hX + 2, hY - 11, C.bone);          // the antlers
    line(g2, hX - 4, hY, hX - 6, hY + 8, C.hair, 2); rect(g2, hX - 3, hY - 1, 8, 2, C.paint); rect(g2, hX, hY + 2, 4, 3, C.hair); };
  const trunk = (g2, K) => { fillPoly(g2, [[K.shX - K.sw - 2, K.shY - 1], [K.shX + K.sw + 2, K.shY - 1], [K.shX + K.sw, K.shY + 4], [K.shX - K.sw, K.shY + 4]], C.bear);           // THE BEARSKIN MANTLE, broad over both shoulders
    rect(g2, K.shX - K.sw - 2, K.shY - 1, K.sw * 2 + 5, 2, C.bearL); for (let i = -K.sw; i <= K.sw; i += 2) px(g2, K.shX + i, K.shY + 4, C.bearD);
    line(g2, K.shX - 1, K.shY + 5, K.x + 1, K.hipY - 2, C.paint, 1); line(g2, K.shX + 2, K.shY + 5, K.x + 4, K.hipY - 2, C.paint, 1); };                                     // war paint down the bare chest
  const bigAxe = (g2, hx, hy, ang, side = 1) => axe(g2, hx, hy, ang, 20, 7, side, { thick: 2, tail: 4 });
  const F = frames(W, H, ay, n, (g, f) => {
    const o = { x: cx, gy, legH: 8, torsoH: 9, hr: 4, sw: 6, head, bare: true, pants: C.hideD, boots: C.bearD, wrap: C.fur, trunk, belt: C.bone };
    if (f < 4) { o.feet = walkFeet[f];                                                                                                          // the great axe DRAGGED, its head trailing behind
      o.pre = (g2, K) => { tl(g2, K.shX - 5, K.shY + 2, K.shX - 4, K.shY + 9, C.skinD, 3); bigAxe(g2, K.shX - 4, K.shY + 9, 160, -1); };
      o.post = (g2, K) => { tl(g2, K.shX + 5, K.shY + 2, K.shX + 7, K.shY + 8, C.skin, 3); rect(g2, K.shX + 6, K.shY + 7, 3, 3, C.skin); }; }
    else if (f === 4) { o.lean = -3; o.crouch = 0; o.headDx = 0; o.feet = [[-4, 0], [4, 0]];                                                  // RAISE: the great axe overhead in both hands, leaning back
      o.pre = (g2, K) => { tl(g2, K.shX - 4, K.shY + 2, K.shX - 4, K.shY - 7, C.skinD, 3); };
      o.post = (g2, K) => { bigAxe(g2, K.shX - 3, K.shY - 9, -75, 1); tl(g2, K.shX + 5, K.shY + 1, K.shX + 3, K.shY - 8, C.skin, 3); rect(g2, K.shX + 2, K.shY - 10, 3, 3, C.skin); }; }
    else if (f === 5) { o.lean = 5; o.crouch = 2; o.headDx = 3; o.feet = [[-6, 0], [6, 0]];                                                   // SLAM: crouched and lunging, the axe driven down ahead
      o.pre = (g2, K) => { tl(g2, K.shX - 3, K.shY + 2, K.shX + 6, K.shY + 7, C.skinD, 3); };
      o.post = (g2, K) => { bigAxe(g2, K.shX + 7, K.shY + 6, 52, 1); tl(g2, K.shX + 6, K.shY + 2, K.shX + 10, K.shY + 7, C.skin, 3); smear(g2, K.shX + 2, K.shY - 4, 18, -70, 30); }; }
    else if (f === 7) { o.lean = -3; o.headDx = -1; o.headDy = 1; o.feet = [[-4, 0], [4, 0]];                                                    // hurt: reeling, the axe sagging
      o.pre = (g2, K) => tl(g2, K.shX - 4, K.shY + 3, K.shX - 4, K.shY - 4, C.skinD, 3);
      o.post = (g2, K) => { bigAxe(g2, K.shX - 3, K.shY - 6, -118, 1); tl(g2, K.shX + 5, K.shY + 3, K.shX + 6, K.shY + 9, C.skin, 3); }; }
    else { o.feet = [[-3, 0], [3, 0]]; o.crouch = 1;                                                                                          // GUARD: the haft upright before him
      o.pre = (g2, K) => tl(g2, K.shX - 3, K.shY + 3, K.shX + 6, K.shY + 3, C.skinD, 3);
      o.post = (g2, K) => { bigAxe(g2, K.shX + 8, K.shY + 7, -90, 1); tl(g2, K.shX + 6, K.shY + 3, K.shX + 8, K.shY + 4, C.skin, 3); rect(g2, K.shX + 7, K.shY + 3, 3, 3, C.skin); }; }
    man(g, o);
  });
  return pack(F, base.ax, ay, base.w, base.h);
}

/* ================= THE CLAN RUNNER (the clan's berserkers) ================= */
export function bakeClanRunner(base) {
  const W = base.R[0].width, H = base.R[0].height, ay = base.ay, gy = ay - 1, cx = base.ax;
  const head = (g2, K, hX, hY) => { rect(g2, hX - 3, hY - 3, 7, 2, C.hair); line(g2, hX - 3, hY - 3, hX - 7, hY + 1, C.hair); line(g2, hX - 3, hY - 2, hX - 6, hY + 4, C.hair); line(g2, hX - 2, hY - 3, hX - 3, hY - 5, C.hair); line(g2, hX + 1, hY - 3, hX + 2, hY - 5, C.hair);   // wild hair
    rect(g2, hX - 2, hY - 1, 6, 2, C.paint); rect(g2, hX, hY + 2, 3, 2, C.hair); };                                                                                                                   // the red band over the eyes, a black beard
  const trunk = (g2, K) => { line(g2, K.shX - 2, K.shY + 1, K.shX + 1, K.shY + 4, C.paint); line(g2, K.shX + 1, K.shY + 1, K.shX + 3, K.shY + 4, C.paint); rect(g2, K.shX - 2, K.shY + 5, 5, 1, C.paintD);   // paint, slashed across
    px(g2, K.shX - K.sw, K.shY, C.fur); px(g2, K.shX + K.sw, K.shY, C.fur); };
  const club = (g2, hx, hy, ang, len) => { const dx = Math.cos(rad(ang)), dy = Math.sin(rad(ang)); tl(g2, hx, hy, hx + dx * len, hy + dy * len, C.haft, 1);                                                   // a bone-studded club
    const ex = hx + dx * len, ey = hy + dy * len; circle(g2, ex, ey, 2.3, C.haftD); px(g2, ex - 1, ey - 1, C.bone); px(g2, ex + 1, ey, C.bone); px(g2, ex, ey + 1, C.bone); };
  const F = frames(W, H, ay, 7, (g, f) => {
    const o = { x: cx, gy, legH: 5, torsoH: 6, hr: 2.6, sw: 3.6, head, bare: true, pants: C.furD, boots: C.fur, wrap: C.fur, trunk, belt: C.rope };
    if (f === 0) {                                                                                                                                   // ASLEEP: slumped, sitting, the club across his knees
      const x = cx, fy = gy;
      rect(g, x - 5, fy - 3, 11, 3, C.furD); rect(g, x - 5, fy - 2, 3, 2, C.fur); fillPoly(g, [[x - 3, fy - 10], [x + 3, fy - 10], [x + 4, fy - 3], [x - 4, fy - 3]], C.skin);
      line(g, x - 1, fy - 9, x + 1, fy - 5, C.paint); line(g, x + 1, fy - 9, x + 3, fy - 5, C.paint);
      ellipse(g, x + 1, fy - 11, 2.6, 2.4, C.skin); rect(g, x - 3, fy - 14, 7, 2, C.hair); line(g, x - 3, fy - 13, x - 5, fy - 9, C.hair); rect(g, x - 1, fy - 11, 5, 1, C.paint); rect(g, x, fy - 9, 3, 2, C.hair);
      tl(g, x - 6, fy - 5, x + 7, fy - 5, C.haft, 1); circle(g, x + 8, fy - 5, 2, C.haftD); px(g, x + 7, fy - 6, C.bone); return; }
    if (f === 1) { o.crouch = 1; o.feet = [[-2, 0], [2, 0]]; o.lean = 1; o.pre = (g2, K) => arm(g2, K, -2, 6, C.skinD, 1, false); o.post = (g2, K) => { arm(g2, K, 4, 5, C.skin, 1); club(g2, K.shX + 4, K.shY + 5, 60, 6); }; }
    else if (f === 2) { o.lean = 2; o.feet = [[-4, 0], [4, 0]]; o.headDx = 2; o.pre = (g2, K) => arm(g2, K, -4, 3, C.skinD, 1, false); o.post = (g2, K) => { arm(g2, K, 5, 4, C.skin, 1); club(g2, K.shX + 5, K.shY + 4, 40, 7); }; }
    else if (f === 3) { o.lean = 2; o.feet = [[3, 2], [-3, 0]]; o.headDx = 2; o.pre = (g2, K) => arm(g2, K, -4, 4, C.skinD, 1, false); o.post = (g2, K) => { arm(g2, K, 5, 3, C.skin, 1); club(g2, K.shX + 5, K.shY + 3, 35, 7); }; }
    else if (f === 4) { o.lean = -2; o.feet = [[-3, 0], [3, 0]]; o.headDx = 0; o.pre = (g2, K) => { arm(g2, K, -2, -6, C.skinD, 1, false); }; o.post = (g2, K) => { arm(g2, K, 1, -7, C.skin, 1); club(g2, K.shX + 1, K.shY - 7, -112, 9); }; }     // WINDUP: both arms back and up
    else if (f === 5) { o.lean = 3; o.crouch = 1; o.feet = [[-4, 0], [5, 0]]; o.headDx = 3; o.pre = (g2, K) => arm(g2, K, -3, 4, C.skinD, 1, false); o.post = (g2, K) => { arm(g2, K, 9, 4, C.skin, 1); club(g2, K.shX + 9, K.shY + 4, 30, 8); smear(g2, K.shX + 2, K.shY - 4, 13, -70, 40); }; }
    else { o.lean = -2; o.headDx = 0; o.headDy = 1; o.feet = [[-2, 0], [2, 0]]; o.pre = (g2, K) => arm(g2, K, -4, 2, C.skinD, 1, false); o.post = (g2, K) => { arm(g2, K, 4, 6, C.skin, 1); club(g2, K.shX + 4, K.shY + 6, 80, 6); }; }   // STUMBLE
    man(g, o);
  });
  return pack(F, base.ax, ay, base.w, base.h);
}

/* ================= THE DRUMMER ================= */
export function bakeDrummer(base) {
  const W = base.R[0].width, H = base.R[0].height, ay = base.ay, gy = ay - 1, cx = base.ax, n = Math.max(2, base.R.length);
  const head = (g2, K, hX, hY) => { rect(g2, hX - 3, hY - 3, 6, 2, C.furD); rect(g2, hX - 3, hY - 2, 2, 4, C.furD);                                                               // a grey hide hood
    line(g2, hX - 1, hY - 4, hX - 3, hY - 8, C.bone); line(g2, hX + 1, hY - 4, hX + 3, hY - 8, C.bone); px(g2, hX - 4, hY - 7, C.bone); px(g2, hX + 4, hY - 7, C.bone);        // antler spikes on a band
    rect(g2, hX - 2, hY - 0.5, 5, 1, C.clay); rect(g2, hX + 1, hY + 1, 1, 2, C.clay); };                                                                                       // a face painted white
  const F = frames(W, H, ay, n, (g, f) => {
    const cloak = (g2, K) => { fillPoly(g2, [[K.shX - 3, K.shY - 1], [K.shX + 3, K.shY - 1], [K.x + 4, K.hipY + 3], [K.x - 5, K.hipY + 3]], C.fur); line(g2, K.shX - 2, K.shY, K.x - 4, K.hipY + 2, C.furL); for (let i = -4; i <= 3; i += 2) px(g2, K.x + i, K.hipY + 3, C.furD); };
    const o = { x: cx, gy, legH: 3, torsoH: 4, hr: 2, sw: 2.2, head, jerkin: C.fur, pants: C.hideD, wrap: C.bone, feet: f % 2 ? [[1, 0], [-1, 1]] : [[-1, 1], [1, 0]], pre: cloak,
      trunk: (g2, K) => { for (let i = 0; i < 4; i++) px(g2, K.shX - 1 + (i >> 1), K.shY + 1 + i, C.bone); rect(g2, K.shX - 2, K.shY + 5, 4, 1, C.paint); } };
    if (f === 2) { o.pre = (g2, K, ) => { arm(g2, K, -2, -4, C.skinD, 1, false); cloak(g2, K); }; o.post = (g2, K) => arm(g2, K, 3, -5, C.skin, 1); }
    else if (f === 3) { o.lean = -1; o.headDx = 0; o.post = (g2, K) => arm(g2, K, 2, 3, C.skin, 1); }
    else o.post = (g2, K) => arm(g2, K, 3, 3, C.skin, 1);
    man(g, o);
  });
  return pack(F, base.ax, ay, base.w, base.h);
}

/* THE HATCHET IN FLIGHT: one 9x9 frame (the thrower's missile; main.js spins it) */
export function bakeClanHatchet() { const [c, g] = canvas(10, 10); tl(g, 2, 7, 7, 2, C.haft, 1); fillPoly(g, [[6, 1], [9, 1], [9, 4], [7, 4]], C.steel); line(g, 9, 1, 9, 4, C.steelL); px(g, 6, 2, C.steelD); px(g, 3, 6, C.rope); outline(c, OUT); return c; }

export const CLAN_BASES = [['clanaxe', 'soldier', bakeClanAxe], ['clanthrower', 'javelin', bakeClanThrower], ['clanguard', 'shield', bakeClanGuard], ['clanchamp', 'heavy', bakeClanChamp], ['clanrunner', 'berserker', bakeClanRunner]];
export function bakeClanSheets(SPR) {
  const out = {};
  for (const [k, b, fn] of CLAN_BASES) { const base = SPR[b]; if (base && base.R) out[k] = fn(base); }
  const dbase = SPR.acolyte || SPR.runner; if (dbase && dbase.R) out.drummer = bakeDrummer(dbase);
  out.clanhatchet = bakeClanHatchet();
  return out;
}
