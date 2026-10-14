// src/redraw/sealed_pyramid_cast.js - THE SEALED PYRAMID's CAST, drawn (claude/spart, the art pass). The greybox wore recoloured base sheets; now each is its own drawing on the SAME
// CONTRACT as the machine it replaces (every frame faces RIGHT, L is the flip; ax = the body's centre column; ay = the row under the lowest pixel, frames SETTLED to it; w/h = the hit box),
// so every tell, hurt frame, corpse and box is where its AI expects it (tools/corpses.mjs):
//   bakeMummy(v)        THE MUMMY (src/mummy.js, 8 frames: 0,1 walk | 2 LASH TELL | 3 LASH | 4 GRAB TELL | 5 GRAB | 6 hurt | 7 BURNING) - a tall corpse wound in stained linen, a gilded usekh collar
//                       with bead rows, a green scarab at the breast, one ember eye in a slit of the wrap, loose bandage ends trailing. LASH TELL: the arm cocked back, the bandage coiled round it
//                       and its tail looped behind; LASH: the arm flung out, the ribbon flying to the end of its reach; GRAB TELL: both arms high and wide, the jaw dropped; GRAB: lunged,
//                       arms closed, the jaw open; BURNING: the linen charred and ablaze, arms flung up. v = 'warden' draws THE TOMB-WARDEN (the elite): a gold death mask, a blue-gold nemes,
//                       a bronze pectoral, resin-black wraps
//   bakeDartBlower()    THE TOMB DART-BLOWER (the archer's 8: 0 idle | 1 DRAW | 2,3 walk | 4 look | 5 full draw | 6 loose | 7 hurt) - a thin tomb priest in a linen kilt and a wide beaded collar, a shaved
//                       head painted with kohl, a long reed blowpipe (raised to the lips for the draw: cheeks puffed; loosed: the pipe jerked out), a dart quiver on a hip cord
//   bakeJackal()        THE TOMB JACKAL (the hound's 3: 0,1 run | 2 leap) - a black, long-legged, long-eared jackal with a gold collar and a gold-ringed foreleg, ribs showing, ember eyes
//   bakeScarab()        THE SCARAB (the skitter's 5: 0,1 run | 2 BITE TELL | 3 BITE | 4 hurt) - a palm-sized green-black beetle: domed wing-case with a gold seam, horned head, hooked legs
//   bakeSealIcon()      the scarab seal (the vault's key): a gold disc, a green-glazed scarab
//   (the Mother's card and her poses: src/redraw/sealed_pyramid_mother.js)
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

export function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)), whiteL = white.map(c => flipX(c));
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
export function settleFrame(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
export const frames = (W, H, n, fn) => Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H); fn(g, f); outline(c, OUT); return settleFrame(c); });
const hsh = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const thick = (g, x0, y0, x1, y1, col, w = 2) => { const v = Math.abs(y1 - y0) > Math.abs(x1 - x0); for (let k = 0; k < w; k++) line(g, x0 + (v ? k : 0), y0 + (v ? 0 : k), x1 + (v ? k : 0), y1 + (v ? 0 : k), col); };

// ================= THE MUMMY =================
const MU = { lin: '#d6c8a0', linL: '#f0e6c4', linD: '#a08e66', linDD: '#6e5c3e', stain: '#7a5a34', dark: '#150e08', gold: '#d8aa40', goldL: '#f8e08a', goldD: '#8a6a20', teal: '#3aa8a0', red: '#c8442c',
  eye: '#ff8a3a', eyeL: '#ffe0a0', scar: '#2e9a5a', scarL: '#8ae8a8', fire: '#ff9a3a', fireL: '#ffe890', fireD: '#c8441a', char: '#4a3a28', charD: '#2a2018', ember: '#ff5a1a' };
const WD = { lin: '#a89870', linL: '#c8b88a', linD: '#6e5e40', linDD: '#463a26', stain: '#3a2a16', mask: '#e0b440', maskL: '#fbe896', maskD: '#8a6618', neme: '#2a6aa8', nemeL: '#5ea4e0', nemeD: '#173a68', brz: '#b0743a', brzL: '#e8a868', brzD: '#6a3e1c' };
export function bakeMummy(v) {
  const W = 46, H = 36, cx = 17, gy = 35, hip = gy - 9, W0 = v === 'warden' ? WD : null;
  const C = W0 ? { ...MU, lin: W0.lin, linL: W0.linL, linD: W0.linD, linDD: W0.linDD, stain: W0.stain } : MU;
  const bands = (g, x, y, w, h, off = 0) => { for (let k = 1 + (off % 3); k < h; k += 3) { line(g, x, y + k, x + w - 1, y + k + (k % 2 ? 1 : 0), C.linD); if (k % 6 === 1) px(g, x + (k * 5 % Math.max(1, w)), y + k - 1, C.stain); } rect(g, x, y, 1, h, C.linL); rect(g, x + w - 1, y, 1, h, C.linDD); };
  const wrap = (g, x, y, w, h, off) => { rect(g, x, y, w, h, C.lin); bands(g, x, y, w, h, off); };
  const legs = (g, x, ph) => {
    const st = [0, 3, -3, 4][ph]; const L1 = [x - 3 + st, hip, 3, gy - 1 - hip], L2 = [x + 1 - st, hip, 3, gy - 1 - hip];
    for (const [lx, ly, lw, lh] of [L2, L1]) { wrap(g, lx, ly, lw, lh, lx); rect(g, lx - 1, gy - 2, lw + 3, 2, C.linDD); rect(g, lx - 1, gy - 2, lw + 3, 1, C.linD); px(g, lx + lw + 1, gy - 1, C.dark); }
    for (const k of [0, 1]) line(g, x - 3 + k * 5, hip + 2, x - 4 + k * 5 + st, hip + 6, C.linL); };   /* loose turns at the thighs */
  const torso = (g, x, lean, hunch) => {
    const top = hip - 12 + (hunch || 0);
    fillPoly(g, [[x - 5 + lean, top], [x + 5 + lean, top], [x + 4, hip + 1], [x - 4, hip + 1]], C.lin);
    for (let k = 2; k < hip - top; k += 3) line(g, x - 5 + lean * (1 - k / 12), top + k, x + 5 + lean * (1 - k / 12), top + k + 1, C.linD);
    line(g, x - 4 + lean, top, x - 3, hip, C.linL); line(g, x + 5 + lean, top + 1, x + 4, hip, C.linDD);
    px(g, x - 1 + lean, top + 5, C.stain); px(g, x + 2, top + 8, C.stain); rect(g, x - 2, hip - 2, 5, 1, C.stain);
    /* the belt of gold and the dark rent where the linen split to show the ribs */
    rect(g, x - 4, hip - 1, 8, 2, W0 ? WD.brz : C.gold); rect(g, x - 4, hip - 1, 8, 1, W0 ? WD.brzL : C.goldL); px(g, x, hip, C.dark);
    if (!W0) { rect(g, x - 1 + lean, top + 6, 3, 3, C.dark); line(g, x - 1 + lean, top + 6, x + 1 + lean, top + 6, C.linD); px(g, x + lean, top + 8, C.linD); }
    /* the collar: a USEKH of gold in two rows, a bead row of teal and red under it, a green scarab on the breast */
    if (W0) { rect(g, x - 6 + lean, top, 12, 5, WD.brz); rect(g, x - 6 + lean, top, 12, 1, WD.brzL); for (let i = 0; i < 6; i++) { px(g, x - 5 + lean + i * 2, top + 2, i % 2 ? WD.nemeL : WD.maskL); px(g, x - 5 + lean + i * 2, top + 3, WD.brzD); } rect(g, x - 6 + lean, top + 4, 12, 1, WD.brzD); }
    else { rect(g, x - 5 + lean, top, 10, 3, C.gold); rect(g, x - 5 + lean, top, 10, 1, C.goldL); for (let i = 0; i < 5; i++) px(g, x - 4 + lean + i * 2, top + 3, i % 2 ? C.teal : C.red); px(g, x - 5 + lean, top + 2, C.goldD); px(g, x + 4 + lean, top + 2, C.goldD); }
    rect(g, x - 1 + lean, top + 4 + (W0 ? 2 : 0), 3, 3, C.scar); px(g, x + lean, top + 4 + (W0 ? 2 : 0), C.scarL); px(g, x - 1 + lean, top + 6 + (W0 ? 2 : 0), C.dark);
    return top; };
  const head = (g, hx, hy, o = {}) => {
    const burn = o.burn;
    ellipse(g, hx, hy, 3.6, 4.5, burn ? C.char : C.lin);
    if (!burn) { for (let k = -3; k <= 3; k += 3) line(g, hx - 4, hy + k - 1, hx + 4, hy + k + 1, C.linD); line(g, hx - 3, hy - 4, hx + 3, hy + 4, C.linD); px(g, hx - 2, hy - 3, C.linL); px(g, hx - 3, hy - 1, C.linL); }
    else { for (let k = -3; k <= 3; k += 3) line(g, hx - 4, hy + k - 1, hx + 4, hy + k + 1, C.charD); }
    if (W0 && !burn) {   /* the gold death mask and the blue-gold nemes */
      ellipse(g, hx + 1, hy + 1, 2.6, 3.2, WD.mask); px(g, hx, hy - 1, WD.maskL); px(g, hx, hy, WD.maskL); rect(g, hx + 1, hy - 1, 3, 1, WD.neme); px(g, hx + 3, hy - 1, WD.nemeL); px(g, hx + 2, hy - 1, C.eye);
      rect(g, hx - 4, hy - 4, 8, 2, WD.neme); for (let k = 0; k < 4; k++) px(g, hx - 4 + k * 2, hy - 4, WD.nemeL); rect(g, hx - 5, hy - 2, 2, 6, WD.neme); px(g, hx - 5, hy - 1, WD.mask); px(g, hx - 5, hy + 1, WD.mask); px(g, hx - 5, hy + 3, WD.mask);
      rect(g, hx + 1, hy + 3, 2, 3, WD.neme); px(g, hx + 1, hy + 4, WD.mask); if (o.jaw) rect(g, hx, hy + 3, 3, 3, C.dark); return; }
    const ey = hy - 1;   /* the slit in the wrap, and the ember in it */
    rect(g, hx - 1, ey, 5, 2, C.dark); px(g, hx + 2, ey, burn ? C.fireL : o.glare ? C.eyeL : C.eye); px(g, hx + 3, ey, o.glare ? C.eye : C.ember); if (o.glare) px(g, hx + 1, ey, C.eye);
    if (o.jaw) { rect(g, hx, hy + 2, 4, 3, C.dark); px(g, hx, hy + 2, C.linL); px(g, hx + 3, hy + 2, C.linL); }   /* the jaw hanging open */
    line(g, hx - 4, hy - 1, hx - 8, hy + 2 + (o.tail || 0), C.lin); px(g, hx - 9, hy + 3 + (o.tail || 0), C.linD); px(g, hx - 8, hy + 4 + (o.tail || 0), C.stain); };   /* the loose end of the head wrap */
  const arm = (g, x0, y0, x1, y1, o = {}) => {
    const mx = Math.round((x0 + x1) / 2) + (o.bend || 0), my = Math.round((y0 + y1) / 2) + (o.bendY ?? 1);
    thick(g, x0, y0, mx, my, C.lin, 2); thick(g, mx, my, x1, y1, C.lin, 2); px(g, mx, my, C.linD); px(g, (x0 + mx) >> 1, ((y0 + my) >> 1) + 1, C.linD); px(g, (mx + x1) >> 1, ((my + y1) >> 1) + 1, C.linD);
    px(g, x1, y1, C.linD); px(g, x1 + (x1 > x0 ? 1 : -1), y1, C.linL); if (o.claw) { px(g, x1 + 1, y1 - 1, C.linL); px(g, x1 + 2, y1, C.linL); px(g, x1 + 1, y1 + 1, C.linD); px(g, x1 + 2, y1 + 1, C.dark); }   /* knuckles */
    if (o.band) { line(g, x1, y1, x1 + o.band[0], y1 + o.band[1], C.linL); px(g, x1 + o.band[0], y1 + o.band[1] + 1, C.stain); } };
  const trail = (g, x0, y0, x1, y1, w) => { line(g, x0, y0, x1, y1, C.linL); if (w) line(g, x0, y0 + 1, x1, y1 + 1, C.linD); px(g, x1, y1 + 1, C.stain); };
  const flames = (g, x, y, n, h0) => { for (let k = 0; k < n; k++) { const fx = x - n + k * 2, fh = h0 + (k * 5) % 6, sw = k % 2 ? 1 : -1;
      line(g, fx, y, fx + sw, y - fh, k % 3 ? C.fire : C.fireL); line(g, fx + 1, y, fx + 1 + sw, y - fh + 2, C.fireD); px(g, fx + sw, y - fh - 1, C.fireL); px(g, fx + sw * 2, y - fh + 1, C.ember); } };
  const F = frames(W, H, 8, (g, f) => {
    const burn = f === 7, hurt = f === 6;
    const lean = [0, 0, -3, 4, -1, 6, -4, 0][f], hunch = f === 4 ? -1 : f === 5 ? 3 : 0, ph = [1, 2, 0, 3, 0, 3, 0, 0][f];
    legs(g, cx, ph);
    const top = torso(g, cx, lean, hunch), sh = [cx + 4 + lean, top + 3], shL = [cx - 4 + lean, top + 3], hx = cx + 1 + lean + (f === 5 ? 2 : 0) + (hurt ? -1 : 0), hy = top - 5 + (f === 5 ? 3 : 0) + (hurt ? -1 : 0);
    /* LOOSE LINEN trailing behind the shoulders and hip, pulled the way it moves */
    trail(g, cx - 5 + lean, top + 2, cx - 10 + lean - (f === 5 ? 2 : 0), top + 9, true); trail(g, cx - 4, hip, cx - 9 - (f === 3 || f === 5 ? 3 : 0), hip + 6); px(g, cx - 9, hip + 7, C.linD);
    if (burn) { /* BURNING: the linen charred, flames over the whole body, the arms flung up and flailing */
      rect(g, cx - 5, top, 10, hip - top, C.char); for (let k = 2; k < hip - top; k += 3) line(g, cx - 5, top + k, cx + 4, top + k + 1, C.charD); head(g, cx + 1, top - 5, { burn: true, jaw: true });
      line(g, cx - 4, top + 2, cx - 11, top - 8, C.char, 2); line(g, cx + 4, top + 2, cx + 12, top - 9, C.char, 2); px(g, cx - 11, top - 9, C.fireL); px(g, cx + 12, top - 10, C.fireL);
      flames(g, cx, hip - 2, 7, 6); flames(g, cx + 1, top + 4, 5, 5); flames(g, cx - 10, top - 5, 2, 4); flames(g, cx + 11, top - 6, 2, 4); flames(g, cx, top - 8, 3, 4);
      for (let i = 0; i < 5; i++) { px(g, cx - 8 + i * 4, top - 10 - (i % 2) * 3, C.ember); } return; }
    if (f === 2) {   /* LASH TELL: the arm cocked back over the shoulder, the bandage coiled round the forearm, its tail looped behind him */
      arm(g, sh[0], sh[1], cx - 7, top - 4, { bend: -2, bendY: -2 }); for (let k = 0; k < 4; k++) { const bx = cx - 6 - (k & 1) * 2, by = top - 7 + k * 2; line(g, bx - 1, by, bx + 2, by + 1, C.linL); px(g, bx + 2, by + 1, C.linD); }
      trail(g, cx - 9, top - 6, cx - 15, top - 2, true); trail(g, cx - 15, top - 2, cx - 17, top + 5); trail(g, cx - 17, top + 5, cx - 13, top + 9); px(g, cx - 12, top + 10, C.stain);
      arm(g, shL[0], shL[1], cx - 6, top + 10, { bendY: 2 }); head(g, hx, hy, { glare: true }); return; }
    if (f === 3) {   /* LASH: the arm straight out, the ribbon flung to the end of its reach, wavering, a knot of linen at the tip */
      arm(g, sh[0], sh[1], cx + 12, top + 3, { bend: 0, bendY: 0 });
      for (let k = 0; k < 14; k++) { const bx = cx + 13 + k * 2, by = top + 3 + Math.round(Math.sin(k * 0.9) * 2); line(g, bx, by, bx + 2, by + Math.round(Math.sin((k + 1) * 0.9) * 2), k % 3 ? C.linL : C.lin); px(g, bx, by + 1, C.linD); }
      rect(g, cx + 41, top + 2, 3, 3, C.lin); px(g, cx + 42, top + 3, C.linD); px(g, cx + 43, top + 2, C.stain);
      arm(g, shL[0], shL[1], cx - 7, top + 9, { bendY: 2 }); head(g, hx, hy, { glare: true, tail: 2 }); return; }
    if (f === 4) {   /* GRAB TELL: hunched, both arms raised high and wide, jaw dropped, a bandage hanging from each hand */
      arm(g, sh[0], sh[1] - 1, cx + 11, top - 9, { bend: 3, bendY: -1, claw: true, band: [1, 6] }); arm(g, shL[0], shL[1] - 1, cx - 10, top - 8, { bend: -3, bendY: -1, claw: true, band: [-1, 6] });
      head(g, hx, hy + 1, { jaw: true, glare: true, tail: 1 }); return; }
    if (f === 5) {   /* GRAB: lunged, arms closed ahead of the breast, claws out, jaw open */
      arm(g, sh[0], sh[1], cx + 17, top + 5, { bend: 0, bendY: 0, claw: true }); arm(g, shL[0] + 3, shL[1] + 2, cx + 16, top + 9, { bend: 0, bendY: 0, claw: true });
      head(g, hx, hy, { jaw: true, glare: true, tail: 3 }); return; }
    if (hurt) {   /* knocked back: the head thrown back, one arm flung up, linen flying off him */
      arm(g, sh[0], sh[1], cx + 3, top - 8, { bend: 2, bendY: -1 }); arm(g, shL[0], shL[1], cx - 8, top + 11, { bendY: 2 });
      head(g, hx, hy, { tail: 3 }); for (let k = 0; k < 4; k++) { trail(g, cx - 4 + k * 3, top - 1 + (k % 2) * 4, cx - 7 + k * 5, top - 5 - k); } for (let i = 0; i < 4; i++) px(g, cx + 6 + i * 2, top - 3 - (i % 2) * 3, C.linL); return; }
    /* WALK: a stiff shamble, both arms held out before it, the hands hanging, the head forward */
    const bob = f ? 1 : 0;
    arm(g, sh[0], sh[1], cx + 11, top + 6 + bob, { bendY: 0, claw: true }); arm(g, shL[0] + 2, shL[1] + 1, cx + 9, top + 9 - bob, { bendY: 0, claw: true });
    head(g, hx + 1, hy + 1, { tail: bob });
  });
  return pack(F, cx, H, 12, 20);
}

// ================= THE TOMB DART-BLOWER =================
const DB = { skin: '#b07a50', skinL: '#d8a070', skinD: '#7a4c2c', lin: '#e4d8b4', linL: '#f8f0d4', linD: '#a89870', kohl: '#14100c', gold: '#d8aa40', goldL: '#f6dc80', teal: '#3aa8a0', red: '#c8442c', reed: '#6a5430', reedL: '#a48a50', reedD: '#3a2c16', dart: '#c8c0b0', tip: '#4aa84a', quiver: '#5a3a1c', eye: '#f8f0d0' };
export function bakeDartBlower() {
  const W = 32, H = 30, cx = 12, G = 29;
  const F = frames(W, H, 8, (g, f) => {
    const walk = f === 2 || f === 3, k = f === 3 ? 1 : 0, hurt = f === 7, drawn = f === 1 || f === 5, loose = f === 6, look = f === 4, lean = hurt ? -2 : drawn ? 1 : 0, top = 11, hip = 21;
    /* legs: bare, bound at the ankle with linen */
    for (const [lx, st] of [[cx - 3, walk ? (k ? -2 : 2) : 0], [cx + 1, walk ? (k ? 2 : -2) : 0]]) { rect(g, lx + st, hip + 2, 3, G - 2 - hip - 2, DB.skin); rect(g, lx + st, hip + 2, 1, G - 2 - hip - 2, DB.skinL); rect(g, lx + st - 1, G - 2, 5, 2, DB.linD); px(g, lx + st, G - 2, DB.linL); px(g, lx + st + 1, G - 4, DB.linD); }
    /* the pleated linen kilt, a gold-hemmed apron in front */
    fillPoly(g, [[cx - 5 + lean, hip - 3], [cx + 5 + lean, hip - 3], [cx + 6, hip + 5], [cx - 6, hip + 5]], DB.lin);
    for (let i = -4; i <= 4; i += 2) line(g, cx + i + lean, hip - 3, cx + i * 1.2, hip + 5, DB.linD); rect(g, cx - 6, hip + 4, 12, 1, DB.gold); rect(g, cx - 1, hip - 3, 4, 8, DB.linL); px(g, cx + 1, hip + 3, DB.gold);
    /* the torso bare to the waist, the great beaded collar over the shoulders */
    rect(g, cx - 4 + lean, top, 8, hip - 3 - top, DB.skin); rect(g, cx - 4 + lean, top, 1, hip - 3 - top, DB.skinL); rect(g, cx + 3 + lean, top, 1, hip - 3 - top, DB.skinD); px(g, cx - 1 + lean, top + 6, DB.skinD); px(g, cx + 1 + lean, top + 6, DB.skinD);
    ellipse(g, cx + lean, top + 2, 6, 3.4, DB.gold); ellipse(g, cx + lean, top + 1.4, 5, 2, DB.skin); for (let i = 0; i < 6; i++) { const bx = cx - 5 + i * 2 + lean; px(g, bx, top + 3 + (i === 0 || i === 5 ? -1 : 0), i % 2 ? DB.teal : DB.red); px(g, bx, top + 4, DB.goldL); }
    /* the quiver of darts on a cord across the chest, reeds sprouting over the shoulder */
    line(g, cx - 4 + lean, top + 2, cx + 3, hip - 4, DB.quiver); px(g, cx - 6 + lean, top - 1, DB.dart); px(g, cx - 7 + lean, top - 2, DB.tip); px(g, cx - 5 + lean, top - 2, DB.dart); px(g, cx - 6 + lean, top - 3, DB.tip);
    /* the head: shaved, painted, kohl-rimmed eyes, a collared throat */
    const hx = cx + 1 + lean, hy = top - 4;
    circle(g, hx, hy, 3.4, DB.skin); px(g, hx - 2, hy - 2, DB.skinL); px(g, hx - 3, hy, DB.skinL); rect(g, hx - 3, hy - 3, 7, 1, DB.kohl); px(g, hx - 3, hy - 2, DB.kohl);   /* a dark wig's fringe, a shaved crown */
    rect(g, hx + 0, hy - 1, 4, 2, DB.kohl); px(g, hx + 1, hy - 1, DB.eye); px(g, hx + 3, hy - 1 + 1, DB.kohl); line(g, hx + 3, hy, hx + 5, hy - 1, DB.kohl);   /* the painted eye with its long kohl wing */
    if (look) { px(g, hx + 1, hy - 1, DB.kohl); px(g, hx + 2, hy, DB.eye); }
    const pipe = (x0, y0, x1, y1) => { line(g, x0, y0, x1, y1, DB.reed); line(g, x0, y0 - 1, x1, y1 - 1, DB.reedL); px(g, x1, y1, DB.reedD); px(g, x0 + 3, y0, DB.reedD); px(g, x0 + 7, y0 - ((y1 - y0) >> 1), DB.reedD); };
    if (drawn) {   /* DRAW: the long blowpipe lifted to the lips, both hands round it, the cheeks puffed (full draw: puffed wide, the pipe levelled) */
      const full = f === 5; rect(g, hx + 2, hy + 1, 3 + (full ? 1 : 0), 3, DB.skinL); px(g, hx + 5, hy + 2, DB.skinL);   /* cheeks */
      pipe(hx + 2, hy + 2, hx + 17, hy + (full ? 1 : 3)); line(g, cx + 3 + lean, top + 4, hx + 8, hy + 3, DB.skin, 2); line(g, cx - 1 + lean, top + 5, hx + 4, hy + 3, DB.skinD);
      if (full) { px(g, hx + 17, hy + 1, DB.dart); px(g, hx + 18, hy + 1, DB.tip); }
    } else if (loose) {   /* LOOSE: the breath out, the pipe thrust forward and level, a dart streaking off its end */
      rect(g, hx + 2, hy + 1, 2, 2, DB.skinL); pipe(hx + 3, hy + 2, hx + 19, hy + 2); line(g, cx + 3, top + 4, hx + 10, hy + 3, DB.skin, 2); line(g, hx + 21, hy + 2, hx + 27, hy + 2, DB.dart); px(g, hx + 28, hy + 2, DB.tip); px(g, hx + 21, hy + 3, DB.linD);
    } else if (hurt) { pipe(cx - 4, hip, cx + 8, hip - 11); line(g, cx + 3, top + 4, cx - 2, hip - 3, DB.skin, 2); }
    else { pipe(cx + 6, hip + 4, cx + 7, top - 3 + (walk ? 1 - k * 2 : 0)); line(g, cx + 3 + lean, top + 4, cx + 6, hip - 2, DB.skin, 2); px(g, cx + 6, hip - 2, DB.skinD); }   /* held upright at his side, a hand on it */
    if (!drawn && !loose && !hurt) line(g, cx - 4 + lean, top + 4, cx - 5, hip - 4, DB.skin, 2);
    if (hurt) { rect(g, hx - 1, hy, 3, 1, DB.red); }
  });
  return pack(F, cx, H, 8, 10);
}

// ================= THE TOMB JACKAL =================
const JK = { fur: '#2c2632', furL: '#5c526a', furD: '#100c14', belly: '#403848', gold: '#d8aa40', goldL: '#f6dc80', goldD: '#8a6a20', eye: '#ff7a2a', eyeL: '#ffd890', tooth: '#f0ead8', tongue: '#c84a4a', rib: '#4a4252', bone: '#e8dfc4' };
export function bakeJackal() {
  const W = 30, H = 18, gy = 17, cx = 12;
  const F = frames(W, H, 3, (g, f) => {
    const leap = f === 2, a = f === 0 ? 1 : -1;
    const body = (bx, by, tilt) => {   /* a lean barrel body, a tucked loin, ribs showing */
      ellipse(g, bx, by, 8, 3.8, JK.fur); ellipse(g, bx - 1, by - 1, 6, 1.8, JK.furL); ellipse(g, bx + 1, by + 2.2, 6, 1.4, JK.belly); for (let k = -3; k <= 3; k += 2) px(g, bx + k, by + 1 + (tilt ? 0 : 0), JK.rib); line(g, bx - 8, by - 1, bx - 12, by - (leap ? 4 : 1) + 2, JK.fur, 2); px(g, bx - 12, by - (leap ? 4 : 1) + 2, JK.furD); };   /* (the tail streaming) */
    const bx = cx + (leap ? 2 : 0), by = leap ? gy - 11 : gy - 7;
    body(bx, by, leap);
    /* the neck, the long narrow head, tall upright ears, a gold collar */
    const hx = bx + 8, hy = by - (leap ? 1 : 2);
    thick(g, bx + 5, by - 2, hx - 1, hy - 1, JK.fur, 3); ellipse(g, hx + 1, hy, 3.2, 2.4, JK.fur); rect(g, hx + 3, hy, 4, 2, JK.fur); px(g, hx + 6, hy - 1, JK.furD); px(g, hx + 7, hy, JK.furD); px(g, hx + 7, hy + 1, JK.furD);   /* the muzzle and its nose */
    fillPoly(g, [[hx - 2, hy - 2], [hx - 1, hy - 8], [hx + 1, hy - 2]], JK.fur); fillPoly(g, [[hx, hy - 2], [hx + 2, hy - 9], [hx + 3, hy - 2]], JK.furL); px(g, hx + 2, hy - 6, JK.gold); px(g, hx - 1, hy - 5, JK.rib);
    px(g, hx + 2, hy - 1, JK.eye); px(g, hx + 3, hy - 1, JK.eyeL);
    if (leap) { rect(g, hx + 3, hy + 1, 4, 2, JK.tongue); px(g, hx + 4, hy + 1, JK.tooth); px(g, hx + 6, hy + 1, JK.tooth); px(g, hx + 5, hy + 3, JK.tooth); }
    rect(g, bx + 5, by - 1, 4, 3, JK.gold); rect(g, bx + 5, by - 1, 4, 1, JK.goldL); px(g, bx + 6, by + 1, JK.goldD); px(g, bx + 8, by, JK.goldD);   /* the gold collar */
    /* the legs: long, with the near foreleg ringed in gold; running = a gather and a stretch, leaping = all four stretched */
    const leg = (x0, y0, x1, y1, x2, y2, c) => { thick(g, x0, y0, x1, y1, c, 2); thick(g, x1, y1, x2, y2, c, 1); px(g, x2, y2, JK.furD); };
    if (leap) { leg(bx + 4, by + 2, bx + 9, by + 5, bx + 13, by + 4, JK.fur); leg(bx + 6, by + 2, bx + 11, by + 6, bx + 14, by + 6, JK.furL); leg(bx - 5, by + 2, bx - 9, by + 5, bx - 12, by + 7, JK.fur); leg(bx - 3, by + 2, bx - 7, by + 6, bx - 10, by + 8, JK.furL); rect(g, bx + 10, by + 4, 2, 1, JK.gold); }
    else { const s = a * 3;
      leg(bx + 5, by + 2, bx + 6 + s, by + 6, bx + 5 + s * 1.6, gy - 1, JK.furL); leg(bx + 3, by + 2, bx + 3 - s, by + 6, bx + 2 - s * 1.6, gy - 1, JK.fur); leg(bx - 5, by + 2, bx - 6 - s, by + 6, bx - 7 - s * 1.6, gy - 1, JK.furL); leg(bx - 3, by + 2, bx - 3 + s, by + 6, bx - 2 + s * 1.6, gy - 1, JK.fur);
      rect(g, bx + 5 + s * 1.3 - 1, gy - 4, 3, 1, JK.gold); }   /* a gold ring on the near foreleg */
  });
  return pack(F, 11, H, 12, 7);
}

// ================= THE SCARAB =================
const SC = { sh: '#0e1a14', shM: '#1e4a3a', shL: '#3a8a5a', shH: '#a8e8a0', gold: '#d8aa40', goldL: '#f6dc80', leg: '#0a120e', eye: '#ff5a3a', mand: '#2a2016', horn: '#2a5a3e' };
export function bakeScarab() {
  const W = 26, H = 18, gy = 17, cx = 11;
  const F = frames(W, H, 5, (g, f) => {
    const run = f < 2, tell = f === 2, bite = f === 3, hurt = f === 4, a = f === 0 ? 1 : -1;
    const lift = tell ? 3 : 0, by = gy - 6 - (hurt ? -1 : 0);
    /* six hooked legs */
    for (let i = 0; i < 3; i++) { const lx = cx - 5 + i * 4, sw = run ? (i % 2 ? a : -a) * 2 : hurt ? (i - 1) * 2 : 0;
      line(g, lx, by + 2, lx - 2 + sw, by + 5, SC.leg); line(g, lx - 2 + sw, by + 5, lx - 3 + sw * 1.5, gy - 1, SC.leg); px(g, lx - 3 + sw * 1.5 - 1, gy - 1, SC.leg);
      line(g, lx + 1, by + 2, lx + 3 - sw, by + 5, SC.leg); line(g, lx + 3 - sw, by + 5, lx + 4 - sw * 1.5, gy - 1, SC.leg); px(g, lx + 4 - sw * 1.5 + 1, gy - 1, SC.leg); }
    /* the domed wing-case: green-black, a gold seam down its back, a gleam */
    ellipse(g, cx, by - lift * 0.3, 8, 5, SC.sh); ellipse(g, cx - 1, by - 1 - lift * 0.3, 7, 3.4, SC.shM); ellipse(g, cx - 2, by - 2.4 - lift * 0.3, 4, 1.4, SC.shL); px(g, cx - 4, by - 3 - lift * 0.3, SC.shH); px(g, cx - 3, by - 3 - lift * 0.3, SC.shH);
    rect(g, cx - 1, by - 5 - lift * 0.3, 1, 9, SC.gold); px(g, cx - 1, by - 5 - lift * 0.3, SC.goldL); rect(g, cx - 7, by + 2, 15, 1, SC.sh);
    /* the head: a pronged clypeus, a horn, mandibles open for the bite */
    const hx = cx + 8, hy = by - 1 - lift;
    ellipse(g, hx, hy + 1, 3, 2.6, SC.sh); px(g, hx + 1, hy, SC.eye); px(g, hx + 2, hy, '#ffc8a0'); fillPoly(g, [[hx - 1, hy - 1], [hx + 1, hy - 5 - (tell ? 2 : 0)], [hx + 3, hy - 1]], SC.horn); px(g, hx + 1, hy - 4 - (tell ? 2 : 0), SC.shH);
    const mo = tell ? 4 : bite ? 0 : 1; rect(g, hx + 2, hy + 1 - mo, 4, 1, SC.mand); rect(g, hx + 2, hy + 3 + mo, 4, 1, SC.mand); px(g, hx + 5, hy + 1 - mo + 1, SC.mand); px(g, hx + 5, hy + 3 + mo - 1, SC.mand);
    if (bite) { px(g, hx + 6, hy + 2, '#ffe8c0'); px(g, hx + 7, hy + 2, '#ffe8c0'); }
    if (hurt) { px(g, cx + 3, by - 5, '#fff'); px(g, cx - 3, by - 5, '#fff'); }
  });
  return pack(F, 10, H, 13, 9);
}

// ================= THE SCARAB SEAL: a gold disc, a green-glazed scarab =================
export function bakeSealIcon() {
  const [c, g] = canvas(16, 16);
  circle(g, 8, 8, 7, '#8a6a20'); circle(g, 8, 8, 6, '#d8aa40'); circle(g, 8, 8, 5, '#f0cf68'); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; px(g, 8 + Math.cos(a) * 6, 8 + Math.sin(a) * 6, '#fff0b0'); }
  ellipse(g, 8, 9, 3, 4, '#1e6a44'); ellipse(g, 7.4, 8, 2, 2.6, '#3aa86a'); px(g, 7, 6, '#b8f8c8'); rect(g, 8, 6, 1, 7, '#0e3a24'); ellipse(g, 8, 4.4, 1.8, 1.2, '#1e6a44'); px(g, 5, 8, '#1e6a44'); px(g, 11, 8, '#1e6a44'); px(g, 5, 10, '#1e6a44'); px(g, 11, 10, '#1e6a44');
  outline(c, OUT); return c;
}

// ================= THE TOMB GUARD (claude/pyramidart: drawn) =================
// The mummy's 8-frame contract (src/mummy.js SKEL: 0,1 walk | 2 CUT TELL (blade cocked over the shoulder) | 3 CUT (blade swept down and out) | 4 LEAP TELL (crouched,
// blade back, shield tucked) | 5 LEAP (flung forward, blade high) | 6 hurt (bones knocked askew, a rib gone dark) | 7 = 6). THE KING'S OWN: a bone body in a lapis-and-gold striped nemes, a bronze
// usekh collar, a linen kilt hemmed in lapis under a bronze belt, bronze greaves, a round bronze shield on the far arm and a rusted khopesh (the hooked blade) - the ember in the sockets.
export function bakeSkeleton() {
  const W = 46, H = 36, cx = 17, gy = 35, B = '#e8e2cc', BL = '#f8f4e4', M = '#b9b2a0', D = '#7a7466', K = '#06080a', RU = '#8a5a32', RL = '#c8884a', RD = '#5a3418', EY = '#ff8a3a',
    GD = '#d8aa40', GL = '#f8e08a', GK = '#8a6a20', LP = '#2e4a8a', LL = '#6a8ad8', BR = '#b0743a', BRL = '#e8a868', BRD = '#6a4420', LN = '#d6c8a0', LND = '#a08e66';
  const F = frames(W, H, 8, (g, f) => {
    const crouch = f === 4 ? 4 : 0, lean = f === 5 ? 3 : f === 3 ? 1 : 0, hip = gy - 10 + crouch, x = cx + lean, hurt = f === 6;
    const st = f === 1 ? 2 : f === 0 ? -1 : f === 5 ? 3 : 0;
    /* the legs: thigh, knee, a bronze greave on the shin, a flat foot */
    for (const [lx, c1, c2] of [[x - 3 - st, M, D], [x + 1 + st, D, M]]) { rect(g, lx, hip, 2, gy - hip, c1); px(g, lx, hip + 3, BL); rect(g, lx - (c1 === M ? 1 : 0), gy - 5, 3, 3, BR); px(g, lx - (c1 === M ? 1 : 0), gy - 5, BRL); rect(g, lx - 1, gy - 1, 4, 1, c2); }
    /* the pelvis, the belt, the kilt hemmed in lapis */
    rect(g, x - 4, hip - 1, 9, 2, M); rect(g, x - 4, hip - 1, 9, 1, BR); px(g, x, hip - 1, BRL); rect(g, x - 4, hip + 1, 9, 3, LN); rect(g, x - 4, hip + 3, 9, 1, LP); rect(g, x + 2, hip + 1, 2, 2, LND);
    /* the spine and ribs: alternating bone and shadow, the right side shaded */
    rect(g, x - 1, hip - 10, 2, 10, M); for (let i = 0; i < 4; i++) { const ry = hip - 10 + i * 2 + 1; rect(g, x - 4, ry, 3, 1, B); rect(g, x + 1, ry, 3, 1, D); rect(g, x - 4, ry + 1, 3, 1, K); rect(g, x + 1, ry + 1, 3, 1, K); }
    if (hurt) { rect(g, x + 1, hip - 8, 3, 1, K); px(g, x + 3, hip - 6, B); }
    /* the usekh: a broad bronze collar, lapis beads along the edge */
    rect(g, x - 6, hip - 12, 13, 3, BR); rect(g, x - 6, hip - 12, 13, 1, BRL); for (let k = -5; k <= 5; k += 2) px(g, x + k, hip - 10, LP); px(g, x - 5, hip - 10, LL);
    /* the skull under the nemes: gold with lapis stripes, lappets either side, the face, the jaw's teeth */
    const hy = hip - 19 + (hurt ? 1 : 0), hx = x + (hurt ? -2 : 0);
    rect(g, hx - 4, hy - 1, 9, 3, GD); for (let k = 0; k < 3; k++) rect(g, hx - 4, hy - 1 + k, 9, 1, k === 1 ? LP : GD); px(g, hx - 3, hy - 1, GL);
    rect(g, hx - 3, hy + 2, 7, 5, B); rect(g, hx - 3, hy + 2, 1, 5, BL); rect(g, hx + 3, hy + 2, 1, 5, M);
    rect(g, hx - 5, hy + 1, 2, 7, GD); rect(g, hx + 4, hy + 1, 2, 7, GK); for (let k = 0; k < 3; k++) { px(g, hx - 5, hy + 2 + k * 2, LP); px(g, hx + 4, hy + 2 + k * 2, LP); }
    rect(g, hx - 2, hy + 3, 2, 2, K); rect(g, hx + 1, hy + 3, 2, 2, K); px(g, hx - 1, hy + 3, EY); px(g, hx + 2, hy + 3, EY); px(g, hx, hy + 5, K);
    rect(g, hx - 2, hy + 6, 5, 1, D); for (let k = 0; k < 5; k += 2) px(g, hx - 2 + k, hy + 6, K);
    /* the shield arm (far): a round bronze shield with a boss, forward in the tells */
    const shx = f === 4 ? x + 5 : f === 2 ? x + 2 : x - 6, shy = f === 4 ? hip - 8 : hip - 8; rect(g, shx - (f === 4 ? 0 : 0), hip - 11, 2, 5, M);
    circle(g, shx + 1, shy, 4, BRD); circle(g, shx + 1, shy, 3, BR); circle(g, shx + 1, shy, 1.4, BRL); px(g, shx, shy - 2, BRL);
    /* the khopesh arm (near), by frame: grip, straight blade, then the hooked tip */
    const sh = [x + 4, hip - 10], blade = (ax, ay, bx, by, hook) => { line(g, sh[0], sh[1], ax, ay, B); line(g, ax, ay, bx, by, RU); line(g, ax, ay - 1, bx, by - 1, RL); line(g, bx, by, bx + hook[0], by + hook[1], RU); px(g, bx + hook[0], by + hook[1] - 1, RL); px(g, ax, ay, RD); rect(g, ax - 1, ay - 1, 2, 2, GK); };
    if (f === 2) blade(x - 2, hip - 16, x - 8, hip - 22, [3, 1]);                 /* CUT TELL: cocked over the shoulder */
    else if (f === 3) blade(x + 9, hip - 6, x + 18, hip - 2, [-1, 3]);              /* CUT: swept down and out */
    else if (f === 4) blade(x - 4, hip - 8, x - 12, hip - 10, [-1, 3]);             /* LEAP TELL: crouched, the blade back */
    else if (f === 5) blade(x + 6, hip - 18, x + 14, hip - 24, [3, 2]);            /* LEAP: flung forward, the blade high */
    else blade(x + 6, hip - 4, x + 12, hip, [1, 3]);                               /* walk / hurt: the blade low */
  });
  F[7] = F[6];
  return pack(F, cx, H, 10, 20);
}
