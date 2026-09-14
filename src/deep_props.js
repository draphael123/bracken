// deep_props.js — THE DEEP: the trench's gardens and wrecks, the leviathan on its floor, and the drowned castle at
// the bottom of it. Every baker returns a canvas drawn with its BOTTOM-CENTRE on the ground, unless its comment says
// it HANGS (top-centre on the thing it hangs from). Baked once, no anti-aliasing: the reef's rules, a colder palette.
import { canvas, px, rect, line, ellipse, circle, fillPoly, outline, flipX } from './px.js';
import { OUT } from './art.js';

export const DP = {
  st0: '#1c2a2e', st1: '#2a3a3e', st2: '#3e5256', st3: '#56706e', st4: '#7a948e', mor: '#141e20',
  weed: '#355e44', weedL: '#5a8a58', weedD: '#22402e', barn: '#b8c0b0', barnD: '#848c80',
  verd: '#4fa08c', verdL: '#84cfb6', verdD: '#2d6a5e',
  gold: '#c9a83a', goldL: '#f2d88e', goldD: '#8a7020',
  bone: '#d8cfb8', boneM: '#aea288', boneD: '#7b7160', boneDD: '#4e4638',
  iron: '#5a6270', ironL: '#8a919c', ironD: '#3a3e48', ironDD: '#24272e',
  red: '#7a2a30', redL: '#a8444a', redD: '#4a1a20',
  glow: '#7ff0e0', glowL: '#dffffa', pearl: '#f4f0e0',
  shell: '#8a7a9a', shellL: '#c8b8d8', shellD: '#5e4e6e', flesh: '#e0a0a8', fleshD: '#a86870',
  lamp: '#ffd36b', lampL: '#fff3bc', ember: '#ff7a2c', emberL: '#ffb84a', sulph: '#e8c24c',
  ice: '#dff4fa', iceM: '#a8d8ea', iceD: '#6aa8c8', hole: '#0c1214',
};
const D = DP;
const hsh = (x, y, s) => { const v = Math.sin(x * 12.9898 + y * 78.233 + s * 37.719) * 43758.5453; return v - Math.floor(v); };
/* paint every opaque pixel again by a rule: the cheap way to shade a filled silhouette */
function recolor(g, W, H, fn) {
  const img = g.getImageData(0, 0, W, H), d = img.data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (!d[i + 3]) continue; const col = fn(x, y); if (!col) continue;
    const n = parseInt(col.slice(1), 16); d[i] = n >> 16; d[i + 1] = (n >> 8) & 255; d[i + 2] = n & 255; }
  g.putImageData(img, 0, 0);
}

// ---------- AIR ----------
// A GIANT CLAM, 30x18. Shut, the only sign of what it is keeping is the seam, and the seam glows: that is the whole
// signpost. Struck, it throws its lid back and lets its air go. state 0 shut, 1 open with the pearl, 2 spent.
export function bakeClam(state) {
  const W = 30, H = 18; const [c, g] = canvas(W, H);
  fillPoly(g, [[2, 17], [3, 12], [8, 9.5], [15, 9], [22, 9.5], [27, 12], [28, 17]], D.shell);
  for (let x = 4; x < 27; x += 3) line(g, x, 16, 15 + (x - 15) * 0.55, 10, D.shellD);
  rect(g, 3, 16, 25, 1, D.shellD);
  for (let x = 4; x < 27; x++) px(g, x, 10 + Math.round(Math.abs(x - 15) / 6), D.shellL);
  if (state === 0) {
    fillPoly(g, [[3, 11], [6, 5], [11, 2.5], [15, 2], [19, 2.5], [24, 5], [27, 11]], D.shell);
    for (let x = 5; x < 26; x += 3) line(g, x, 10, 15 + (x - 15) * 0.4, 3, D.shellD);
    for (let x = 6; x < 25; x++) px(g, x, 3 + Math.round(Math.abs(x - 15) / 4), D.shellL);
    for (let x = 4; x < 27; x++) px(g, x, 11, (x % 3) ? D.glow : D.glowL);
  } else {
    fillPoly(g, [[5, 9], [4, 3], [8, 0.5], [22, 0.5], [26, 3], [25, 9]], D.shellD);
    for (let x = 6; x < 25; x += 3) line(g, x, 1, x + (x - 15) * 0.1, 8, D.shell);
    fillPoly(g, [[5, 12], [9, 9], [21, 9], [25, 12], [15, 14]], state === 2 ? D.fleshD : D.flesh);
    for (let x = 8; x < 23; x += 2) px(g, x, 11, D.fleshD);
    if (state === 1) { circle(g, 15, 10.5, 2.6, D.pearl); px(g, 14, 9, '#ffffff'); px(g, 16, 12, D.glow); }
  }
  return outline(c, OUT);
}
// A KELP BLADDER, 12x16, at the top of its own stalk. Full it is lit from inside; struck it is a rag.
export function bakeBulb(popped) {
  const W = 12, H = 16; const [c, g] = canvas(W, H);
  line(g, 6, 15, 6, 9, D.weed); px(g, 7, 12, D.weedD); px(g, 5, 14, D.weedD);
  if (!popped) { ellipse(g, 6, 5.5, 4, 4.8, '#9ab04e'); ellipse(g, 6, 5, 3, 3.6, '#c8e060'); ellipse(g, 5.2, 4, 1.4, 1.6, '#f0ffb0'); px(g, 4, 3, '#ffffff'); px(g, 8, 8, '#6a8a3a'); px(g, 2, 6, '#6a8a3a'); }
  else { fillPoly(g, [[3, 10], [4, 5], [6, 7], [8, 4], [9, 10]], '#6a7a3a'); px(g, 6, 9, '#4a5a2a'); }
  return outline(c, OUT);
}
// A DIVING BELL ON HER SIDE, 46x30. She went over with her mouth down the slope, so the air is still in her crown
// end: the pale band inside her rim is what she has kept, and her port still has its lamp.
export function bakeBellWreck() {
  const W = 46, H = 30; const [c, g] = canvas(W, H);
  fillPoly(g, [[5, 2], [11, 2], [27, 6], [38, 8.5], [42, 12], [42, 19], [38, 23], [27, 25], [11, 28], [5, 28]], D.gold);
  recolor(g, W, H, (x, y) => { const k = (y - 2) / 26; return k < 0.14 ? D.goldL : k > 0.8 ? D.verdD : k > 0.62 ? D.verd : hsh(x, y, 3) < 0.12 ? D.goldD : null; });
  for (const hx of [15, 25, 34]) for (let y = 3; y < 28; y++) { const d = g.getImageData(hx, y, 1, 1).data; if (d[3]) { px(g, hx, y, D.goldD); px(g, hx + 1, y, y > 20 ? D.verdD : D.gold); } }
  /* the mouth: a dark ring, and the kept air shining inside it */
  rect(g, 3, 1, 3, 29, D.goldD); rect(g, 3, 1, 1, 29, D.goldL);
  for (let y = 4; y < 26; y++) { px(g, 6, y, y % 3 ? D.glowL : D.pearl); px(g, 7, y, D.glow); if (y > 8 && y < 22) px(g, 8, y, '#3a8a8a'); }
  circle(g, 24, 14.5, 4.6, D.goldD); circle(g, 24, 14.5, 3.6, D.lamp); circle(g, 23.6, 14, 2.2, D.lampL); px(g, 22, 12, '#ffffff');
  line(g, 30, 7, 35, 15, D.ironDD); line(g, 35, 15, 33, 21, D.ironDD);   /* the crack she took going over */
  fillPoly(g, [[0, 30], [4, 24], [16, 25], [30, 22], [44, 24], [46, 30]], '#34423e');   /* and the silt banked up her flank */
  for (let x = 1; x < 45; x++) if (hsh(x, 1, 9) < 0.4) px(g, x, 28 - Math.round(hsh(x, 2, 4) * 2), '#4a5a54');
  px(g, 40, 21, D.weedL); px(g, 41, 20, D.weed); px(g, 12, 25, D.weedL);
  return outline(c, OUT);
}
// A VENT, 18x14. Hot: a chimney of black rock crusted yellow, the mouth of it orange. Cold: a ring of pale stones
// round a dark hole. The game draws the column over it; both columns are bubbles, and bubbles are air.
export function bakeVent(hot) {
  const W = 18, H = 14; const [c, g] = canvas(W, H);
  if (hot) {
    fillPoly(g, [[1, 14], [4, 8], [6, 3], [12, 3], [14, 8], [17, 14]], '#2a2428');
    recolor(g, W, H, (x, y) => hsh(x, y, 7) < 0.18 ? '#3e343a' : x > 12 ? '#1c181c' : null);
    rect(g, 6, 2, 6, 2, '#4a3a2e'); rect(g, 7, 2, 4, 2, D.ember); rect(g, 8, 2, 2, 1, D.emberL); px(g, 8, 1, D.lampL);
    for (const [x, y] of [[4, 7], [5, 5], [13, 6], [3, 10], [14, 10], [12, 4]]) px(g, x, y, D.sulph);
    px(g, 6, 5, D.ember); px(g, 11, 6, '#b0561c');
  } else {
    for (const [x, y, r] of [[3, 11, 2.6], [7, 12, 2], [11, 12, 2.2], [15, 11, 2.6], [5, 9, 1.6], [13, 9, 1.8]]) circle(g, x, y, r, '#8a9a94', '#6a7a74');
    ellipse(g, 9, 9.5, 3.4, 1.8, D.hole); px(g, 8, 8, '#1e3a40'); px(g, 9, 7, D.glowL); px(g, 10, 5, D.iceM); px(g, 8, 3, D.ice);
  }
  return outline(c, OUT);
}

// ---------- THE LEVIATHAN ----------
// ITS SKULL, 112x62, snout to the right. The cranium stands up off the bed like a hull turned over, and there is
// still air in the dome of it: the eye socket is a black window into that.
export function bakeSkull() {
  const W = 112, H = 62; const [c, g] = canvas(W, H);
  fillPoly(g, [[2, 61], [4, 40], [12, 24], [30, 12], [48, 10], [62, 18], [72, 30], [76, 44], [70, 61]], D.bone);
  fillPoly(g, [[56, 26], [80, 31], [100, 39], [110, 45], [107, 50], [82, 49], [60, 51]], D.bone);
  fillPoly(g, [[38, 61], [50, 55], [80, 54], [106, 55], [110, 59], [104, 61]], D.boneM);
  recolor(g, W, H, (x, y) => { const lit = (y < 24 && x < 50) || (y < 36 && x < 26); const sh = y > 46 || x > 90 && y > 44;
    if (hsh(x, y, 11) < 0.05) return D.boneD; return sh ? D.boneD : lit ? (hsh(x, y, 2) < 0.3 ? '#f0e8d4' : D.bone) : hsh(x, y, 5) < 0.25 ? D.boneM : null; });
  ellipse(g, 52, 31, 7.5, 6.5, D.boneDD); ellipse(g, 52, 31.5, 6, 5, D.hole); ellipse(g, 51, 30, 2.4, 2, '#1e3a40');
  ellipse(g, 30, 18, 5, 2.6, D.boneDD); ellipse(g, 30, 18.3, 3.6, 1.6, D.hole);
  for (let x = 64; x < 104; x += 4) { rect(g, x, 50, 2, 3, D.boneM); px(g, x, 53, D.boneD); }   /* the teeth it strained the sea with */
  for (let x = 40; x < 106; x++) px(g, x, 54 + (x > 80 ? 1 : 0), D.boneDD);
  line(g, 20, 30, 34, 44, D.boneDD); line(g, 34, 44, 30, 56, D.boneDD); line(g, 60, 14, 66, 24, D.boneDD);
  for (const [x, y] of [[18, 26], [22, 24], [40, 14], [44, 13], [70, 36], [8, 44], [12, 50]]) { px(g, x, y, D.barn); px(g, x + 1, y, D.barnD); }
  for (const [x, y, n] of [[24, 16, 5], [36, 11, 4], [10, 34, 6], [66, 40, 4]]) for (let k = 0; k < n; k++) px(g, x + (k % 2), y + k, k % 2 ? D.weedD : D.weedL);
  for (const [x, y, col] of [[44, 9, '#ff6fa8'], [46, 8, '#ffb0d0'], [45, 7, '#ff6fa8'], [32, 11, '#ff9a3c'], [33, 10, '#ffd08a']]) px(g, x, y, col);
  return outline(c, OUT);
}
// A RIB, 26x70, standing up off the spine and bowed over the way it went. v 1 is the other side.
export function bakeRib(v) {
  const W = 26, H = 70; const [c, g] = canvas(W, H);
  for (let i = 0; i <= 80; i++) { const t = i / 80, x = 4 + 17 * Math.sin(t * Math.PI * 0.55), y = 68 - 63 * t, th = t < 0.7 ? 3 : 2;
    rect(g, Math.round(x) - 1, Math.round(y), th, 2, D.bone); px(g, Math.round(x) + th - 1, Math.round(y), D.boneD); if (i % 9 === 0) px(g, Math.round(x) - 1, Math.round(y), '#f0e8d4'); }
  rect(g, 1, 66, 7, 4, D.boneM); px(g, 3, 64, D.barn); px(g, 20, 14, D.weedL); px(g, 21, 15, D.weed); px(g, 21, 16, D.weedD);
  const o = outline(c, OUT); return v ? flipX(o) : o;
}
// A VERTEBRA, 20x16: the spine lies along the bed in a row of these.
export function bakeVertebra() {
  const W = 20, H = 16; const [c, g] = canvas(W, H);
  fillPoly(g, [[3, 15], [4, 9], [16, 9], [17, 15]], D.boneM); rect(g, 8, 2, 4, 8, D.bone); rect(g, 1, 10, 18, 2, D.bone);
  px(g, 9, 1, D.bone); rect(g, 4, 13, 12, 1, D.boneD); px(g, 11, 4, D.boneD); px(g, 6, 11, D.boneD); px(g, 14, 12, D.barn);
  return outline(c, OUT);
}

// ---------- THE GARDENS ----------
// CORAL IN COLOUR, 22x26. Nothing at the bottom of the trench is lit by the sun, so what grows there makes its own:
// v 0 pink, 1 orange, 2 violet.
export function bakeCoralBright(v) {
  const W = 22, H = 26; const [c, g] = canvas(W, H);
  const P = [['#ff6fa8', '#ffb0d0', '#a8406a'], ['#ff9a3c', '#ffd08a', '#b0561c'], ['#b87aff', '#e0c8ff', '#6a3aa8']][((v % 3) + 3) % 3];
  const branch = (x, y, a, len, depth) => { const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len; line(g, x, y, x2, y2, depth > 1 ? P[2] : P[0], depth > 1 ? 2 : 1);
    if (depth <= 0) { px(g, Math.round(x2), Math.round(y2), P[1]); return; }
    branch(x2, y2, a - 0.45 - hsh(x, y, v) * 0.3, len * 0.72, depth - 1); branch(x2, y2, a + 0.4 + hsh(y, x, v) * 0.3, len * 0.7, depth - 1); };
  branch(11, 25, -Math.PI / 2, 8, 3);
  rect(g, 8, 23, 7, 3, P[2]); px(g, 7, 25, P[2]); px(g, 15, 25, P[2]);
  return outline(c, OUT);
}
// A JELLYFISH, 16x22, frame 0-2, hue 0 sea-green or 1 rose. No outline: it is the light, not a thing in the light.
export function bakeJelly(frame, hue) {
  const W = 16, H = 22; const [c, g] = canvas(W, H);
  const P = hue ? ['rgba(255,154,208,0.55)', '#ffd0ea', '#ff7ab8'] : ['rgba(106,216,216,0.55)', '#d8ffff', '#7ff0e0'];
  const rx = 6.4 - frame * 0.6, ry = 6 + frame * 0.5;
  for (let y = 1; y <= 8; y++) { const k = (8.5 - y) / ry, hw = k >= 1 ? 0 : Math.round(rx * Math.sqrt(1 - k * k)); if (hw) { g.fillStyle = P[0]; g.fillRect(8 - hw, y, hw * 2, 1); } }
  g.fillStyle = P[1]; g.fillRect(8 - Math.round(rx), 8, Math.round(rx) * 2, 1);
  circle(g, 8, 5, 1.8, P[2]); px(g, 7, 4, '#ffffff');
  for (let k = 0; k < 4; k++) for (let y = 9; y < 21 - (k % 2) * 3; y++) { const x = 4 + k * 2.7 + Math.sin(y * 0.55 + frame * 2.1 + k) * 1.3; g.fillStyle = y % 2 ? P[2] : P[1]; g.globalAlpha = 0.9 - (y - 9) * 0.05; g.fillRect(Math.round(x), y, 1, 1); }
  g.globalAlpha = 1;
  return c;
}
// A FISH, 8x5, two frames of tail. The game colours the school.
export function bakeFish(frame, col) {
  const W = 8, H = 5; const [c, g] = canvas(W, H);
  ellipse(g, 4.5, 2.5, 2.8, 1.4, col); px(g, 6, 2, '#101418'); px(g, 3, 1, '#ffffff');
  if (frame) { px(g, 1, 1, col); px(g, 0, 0, col); px(g, 1, 3, col); } else { px(g, 1, 2, col); px(g, 0, 1, col); px(g, 0, 3, col); }
  return c;
}
// FROST, grounded (16x6), and ICICLES, hung (16x14), for the cold road.
export function bakeRime(v) {
  const W = 16, H = 6; const [c, g] = canvas(W, H);
  for (let x = 0; x < W; x++) { const h = 1 + Math.round(hsh(x, v, 3) * (x % 3 ? 3 : 5)); for (let y = H - h; y < H; y++) px(g, x, y, y === H - h ? D.ice : D.iceM); }
  return c;
}
export function bakeIcicles(v) {
  const W = 16, H = 14; const [c, g] = canvas(W, H);
  rect(g, 0, 0, W, 2, D.iceM);
  for (let k = 0; k < 4; k++) { const x0 = 1 + k * 4 + Math.round(hsh(k, v, 1) * 2), len = 4 + Math.round(hsh(v, k, 2) * 9);
    for (let y = 2; y < 2 + len; y++) { const w = Math.max(1, Math.round(2.5 * (1 - (y - 2) / len))); rect(g, x0, y, w, 1, y < 4 ? D.ice : D.iceM); if (w > 1) px(g, x0 + w - 1, y, D.iceD); } }
  return c;
}

// ---------- THE DROWNED CASTLE ----------
// THE KING, IN STONE, 32x64, on his plinth. His own people put him up in every yard of his castle, and the sea has
// had thirty years at every one of them. v 1 has lost his head, and it is lying at his feet.
export function bakeKingStatue(v) {
  const W = 32, H = 64; const [c, g] = canvas(W, H);
  rect(g, 3, 52, 26, 12, D.st2); rect(g, 1, 50, 30, 3, D.st3); rect(g, 1, 50, 30, 1, D.st4); rect(g, 2, 61, 28, 3, D.st1);
  rect(g, 8, 55, 16, 5, D.st1); rect(g, 9, 56, 14, 3, D.st2); for (const x of [12, 15, 18]) px(g, x, 56, D.goldD); rect(g, 12, 57, 7, 1, D.goldD);
  fillPoly(g, [[7, 50], [9, 31], [12, 22], [20, 22], [23, 31], [25, 50]], D.st2);
  rect(g, 11, 44, 4, 6, D.st1); rect(g, 17, 44, 4, 6, D.st1);
  line(g, 26, 16, 26, 49, D.st3); circle(g, 26, 15, 2.2, D.st4); line(g, 22, 30, 26, 32, D.st3);
  if (!v) {
    ellipse(g, 16, 15, 4, 5, D.st3); fillPoly(g, [[12, 18], [20, 18], [18, 27], [16, 29], [14, 27]], D.st2);
    rect(g, 11, 8, 11, 3, D.st4); for (const x of [11, 14, 17, 20]) rect(g, x, 6, 2, 2, D.st4);
    px(g, 14, 15, D.st0); px(g, 18, 15, D.st0);
  } else {
    fillPoly(g, [[12, 23], [13, 20], [15, 22], [17, 19], [19, 22], [20, 23]], D.st3);
    ellipse(g, 6, 46, 4, 3.6, D.st3); rect(g, 2, 42, 8, 2, D.st4); px(g, 5, 46, D.st0); px(g, 7, 46, D.st0);
    line(g, 18, 24, 14, 36, D.st0); line(g, 14, 36, 17, 46, D.st0);
  }
  recolor(g, W, H, (x, y) => x < 12 && y < 50 && hsh(x, y, 4) < 0.35 ? D.st3 : x > 21 && y < 50 && hsh(x, y, 6) < 0.4 ? D.st1 : null);
  for (const [x, y, n] of [[9, 32, 7], [23, 34, 9], [4, 53, 5], [27, 53, 6], [15, 24, 3]]) for (let k = 0; k < n; k++) px(g, x + (k % 3 === 2 ? 1 : 0), y + k, k % 2 ? D.weedD : D.weedL);
  for (const [x, y] of [[6, 58], [24, 57], [12, 40], [20, 36]]) { px(g, x, y, D.barn); px(g, x + 1, y, D.barnD); }
  return outline(c, OUT);
}
// HIS THRONE, 46x52. Stone with its gilt gone green, a crown for a back, a gem in it that still has a light, and
// the red of the cushion the only warm thing in the room.
export function bakeThrone() {
  const W = 46, H = 52; const [c, g] = canvas(W, H);
  fillPoly(g, [[9, 34], [9, 11], [13, 4], [17, 9], [23, 1], [29, 9], [33, 4], [37, 11], [37, 34]], D.st2);
  recolor(g, W, H, (x, y) => x < 14 ? D.st3 : x > 32 ? D.st1 : hsh(x, y, 8) < 0.15 ? D.st1 : null);
  for (let y = 12; y < 33; y++) { px(g, 11, y, D.goldD); px(g, 35, y, D.verd); }
  line(g, 13, 5, 17, 10, D.gold); line(g, 17, 10, 23, 2, D.gold); line(g, 23, 2, 29, 10, D.verd); line(g, 29, 10, 33, 5, D.verd);
  circle(g, 23, 15, 3.4, D.goldD); circle(g, 23, 15, 2.4, D.glow); px(g, 22, 14, D.glowL);
  rect(g, 3, 24, 7, 10, D.st3); rect(g, 37, 24, 7, 10, D.st1); rect(g, 2, 23, 9, 2, D.st4); rect(g, 36, 23, 9, 2, D.st2);
  circle(g, 4, 23, 2, D.goldD); circle(g, 42, 23, 2, D.verdD);
  rect(g, 7, 34, 32, 4, D.st3); rect(g, 7, 34, 32, 1, D.st4);
  rect(g, 10, 30, 26, 4, D.red); rect(g, 10, 30, 26, 1, D.redL); rect(g, 10, 33, 26, 1, D.redD); px(g, 30, 31, D.redD); px(g, 31, 32, D.st2);
  rect(g, 9, 38, 28, 14, D.st2); rect(g, 9, 38, 3, 14, D.st3); rect(g, 34, 38, 3, 14, D.st1);
  rect(g, 14, 41, 18, 8, D.st1); rect(g, 15, 42, 16, 6, D.st2); for (const x of [17, 22, 27]) rect(g, x, 43, 2, 4, D.goldD);
  for (let k = 0; k < 8; k++) { const x = 4 + (k % 2), y = 25 + k * 2; rect(g, x, y, 2, 1, D.ironL); px(g, x, y + 1, D.ironD); }
  for (const [x, y, n] of [[38, 33, 6], [5, 33, 4], [20, 1, 3], [36, 12, 5]]) for (let k = 0; k < n; k++) px(g, x, y + k, k % 2 ? D.weedD : D.weedL);
  for (const [x, y] of [[12, 46], [33, 40], [16, 20], [30, 26], [42, 30]]) { px(g, x, y, D.barn); px(g, x + 1, y, D.barnD); }
  return outline(c, OUT);
}
// HIS CHANDELIER, 50x20, where it came down: a crown of iron on its side, its cups and its glass round it, and its
// chain in a heap.
export function bakeChandelier() {
  const W = 50, H = 20; const [c, g] = canvas(W, H);
  for (let a = 0; a < 64; a++) { const t = a / 64 * Math.PI * 2, x = 22 + Math.cos(t) * 19, y = 13 + Math.sin(t) * 4.6; rect(g, Math.round(x), Math.round(y), 2, 2, Math.sin(t) > 0 ? D.ironD : D.iron); }
  for (let k = 0; k < 6; k++) { const t = k / 6 * Math.PI * 2 + 0.3, x = Math.round(22 + Math.cos(t) * 19), y = Math.round(13 + Math.sin(t) * 4.6); rect(g, x - 1, y - 3, 4, 3, D.goldD); px(g, x, y - 4, D.gold); }
  line(g, 22, 4, 6, 12, D.iron); line(g, 22, 4, 36, 11, D.iron); line(g, 22, 4, 26, 9, D.ironD); circle(g, 22, 4, 2.4, D.goldD); px(g, 21, 3, D.gold);
  for (let k = 0; k < 5; k++) ellipse(g, 41 + k * 1.8, 17 - (k % 2), 1.6, 1.2, k % 2 ? D.ironL : D.iron);
  for (const [x, y] of [[4, 18], [12, 19], [30, 19], [16, 17], [34, 16]]) { px(g, x, y, D.glowL); px(g, x + 1, y, D.iceM); }
  return outline(c, OUT);
}
// A TORN BANNER, HANGS, 18x46, frame 0-2 of its drift. His colours: red, and a gold crown gone brown.
export function bakeBanner(frame) {
  const W = 18, H = 46; const [c, g] = canvas(W, H);
  rect(g, 1, 0, 16, 2, D.ironD); px(g, 0, 0, D.ironL); px(g, 17, 0, D.ironL);
  const ox = y => Math.round(Math.sin(frame * 2.1 + y * 0.09) * (y / H) * 2.6);
  for (let y = 2; y < H; y++) { const o = ox(y), bottom = 34 + Math.round(hsh(Math.floor(y / 1), 0, 1) * 0);
    for (let x = 3; x <= 14; x++) { const end = 32 + Math.round(hsh(x, 7, 3) * 12); if (y > end) continue;
      px(g, x + o, y, x === 3 ? D.redD : x === 14 ? D.redD : (y < 5 ? D.redL : D.red)); } void bottom; }
  for (let y = 10; y < 20; y++) { const o = ox(y), w = y < 13 ? 7 : 5; for (let x = 0; x < w; x++) if (y !== 12 || x % 2 === 0) px(g, 9 - (w >> 1) + x + o, y, D.goldD); }
  for (const [x, y] of [[6, 24], [11, 28], [8, 31], [12, 20]]) g.clearRect(x + ox(y), y, 2, 2);
  return outline(c, OUT);
}
// THE WATER-GATE WHEEL, 28x30: it winds the portcullis beside it. frame 0-1 is the wheel turning.
export function bakeGateWheel(frame) {
  const W = 28, H = 30; const [c, g] = canvas(W, H);
  rect(g, 12, 14, 4, 13, D.ironD); rect(g, 12, 14, 1, 13, D.ironL); rect(g, 7, 26, 14, 4, D.st2); rect(g, 7, 26, 14, 1, D.st3);
  for (let a = 0; a < 48; a++) { const t = a / 48 * Math.PI * 2; rect(g, Math.round(14 + Math.cos(t) * 10), Math.round(12 + Math.sin(t) * 10), 2, 2, D.iron); }
  for (let k = 0; k < 6; k++) { const t = k / 6 * Math.PI * 2 + frame * Math.PI / 6; line(g, 14, 12, 14 + Math.cos(t) * 10, 12 + Math.sin(t) * 10, D.ironL);
    circle(g, 14 + Math.cos(t) * 12, 12 + Math.sin(t) * 12, 1.4, D.goldD); }
  circle(g, 14.5, 12.5, 2.4, D.gold); px(g, 14, 12, D.goldL);
  return outline(c, OUT);
}
// A GHOST BRAZIER, 16x24: an iron bowl on a stand with a sea-green flame in it that has no business burning.
export function bakeGhostBrazier() {
  const W = 16, H = 24; const [c, g] = canvas(W, H);
  rect(g, 7, 12, 2, 10, D.ironD); rect(g, 4, 22, 8, 2, D.iron); rect(g, 3, 9, 10, 3, D.iron); rect(g, 2, 8, 12, 2, D.ironL); rect(g, 4, 11, 8, 1, D.ironDD);
  fillPoly(g, [[4, 8], [5, 3], [7, 5], [8, 0], [10, 4], [11, 3], [12, 8]], D.verd); fillPoly(g, [[6, 8], [7, 4], [8, 6], [9, 3], [10, 8]], D.glowL);
  return outline(c, OUT);
}
// SEA ASHLAR, 16x16 tiles, three of each: the laid stone of the drowned castle. A coursed block face with weed on
// its coping, drawn OVER the level's rock wherever the builder says the masons were (L.deep.masonry).
export function bakeSeaAshlar() {
  const tile = (v, top) => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 16, D.st2);
    for (let course = 0; course < 2; course++) { const y0 = course * 8, jx = (v * 5 + course * 8) % 16;
      rect(g, 0, y0 + 7, 16, 1, D.mor); rect(g, 0, y0, 16, 1, D.st3); rect(g, 0, y0 + 6, 16, 1, D.st1);
      rect(g, jx, y0, 1, 7, D.mor); if (jx + 1 < 16) rect(g, jx + 1, y0 + 1, 1, 5, D.st3); }
    for (let i = 0; i < 10; i++) { const x = (hsh(v, i, top ? 3 : 1) * 16) | 0, y = (hsh(i, v, 5) * 16) | 0; px(g, x, y, hsh(x, y, 2) < 0.5 ? D.st1 : D.st3); }
    if (top) { rect(g, 0, 0, 16, 3, D.st4); rect(g, 0, 3, 16, 1, D.st1); rect(g, 0, 0, 16, 1, '#9ab0a8');
      for (let x = 0; x < 16; x++) if (hsh(x, v, 9) < 0.35) { px(g, x, 0, D.weedL); if (hsh(x, v, 8) < 0.5) px(g, x, 1, D.weed); }
      px(g, (v * 7) % 16, 4, D.barn); }
    else if (hsh(v, 3, 3) < 0.6) px(g, (v * 11) % 16, 10, D.barnD);
    return c; };
  return { fill: [0, 1, 2].map(v => tile(v, false)), top: [0, 1, 2].map(v => tile(v, true)) };
}
