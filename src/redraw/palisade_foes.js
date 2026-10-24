// palisade_foes.js - THE PALISADE WOOD's PEOPLE (claude/palisadeart; goblins are fine here: the Goblin Queen is act II, and the Wood is before her on the road).
//   THE STAKE-SETTER  the level's ONE new foe, drawn by hand (src/palisade-hands.js drives him: a sprig's AI, his own told plant): a goblin work-boss in a leather cap with a rust band, a tan apron over a rust
//                     tunic, a rope coil on his hip, a bundle of fresh stakes lashed on his back and a great iron-banded MALLET. 8 frames, the sprig's order: 0-3 walk, 4 look, 5 the RAISE (the mallet overhead, back
//                     arched, the shout - the plant's tell and the swing's), 6 the DRIVE (the mallet down on a stake in the ground), 7 hurt (and dead). Left and white-flash sets like every sheet.
//   LANTERN-HAND     (the rock-goblin's AI and frames: he keeps his distance and lobs a lit lantern that burns where it lands - the greybox called him a stake-thrower, but what he throws is the crew's lantern, so the art
//                    names what the code does) a leather cap with a rust band, a hooded lantern on a hook at his shoulder, an oil flask at the belt; MAUL CREW (the brute's) a leather hood, an apron, a honey-timber maul bound in iron.
// bakeStakeSetter() / bakeLanternHand(base) / bakeMaulCrew(base) -> { R, L, white, ax, ay, w, h }
import { canvas, flipX, whiten, rgb, outline, rect as RC } from '../px.js';
import { mix } from './palisade_pal.js';

const OUT = '#150a05';
const SK = ['#24481c', '#4a8236', '#7cbc52'], CAP = ['#2e1a0e', '#5e3c20', '#8e6234'], RUSTC = ['#6a2418', '#b0442c', '#d86a40'], AP = ['#7a5a30', '#c0a060', '#e6c88c'], WD = ['#7a4e28', '#b88444', '#ecc880'], FRSH = ['#a07030', '#e0b060', '#fadf9c'], IR = ['#3a3a48', '#7a7a8c', '#b0b0c0'], RP = ['#8a7448', '#b8a068', '#dcc890'], BELT = '#2a160a';
const pack = (frames, base) => ({ R: frames, L: frames.map(c => flipX(c)), white: { R: frames.map(c => whiten(c)), L: frames.map(c => flipX(whiten(c))) }, ax: base.ax, ay: base.ay, w: base.w, h: base.h });
const lineP = (g, x0, y0, x1, y1, col, th = 1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) RC(g, Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), th, th, col); };

/* ------------------------------------------------------------------ THE STAKE-SETTER ------------------------------------------------------------------ */
const W = 24, H = 20;
/* o: dx (torso lean), dy (bob), legs [[x, y, lift]...] two, hd [dx, dy] (head), face, mal: 'shoulder' | 'raise' | 'drive' | 'drop', tilt (stakes) */
function setterFrame(o) {
  const [c, g] = canvas(W, H), dx = o.dx || 0, dy = o.dy || 0, [hx, hy] = o.hd || [0, 0];
  /* THE BUNDLE of fresh stakes on his back, tips up, two rope bands */
  for (let k = 0; k < 4; k++) { const x = 3 + dx + k + (o.tilt ? Math.round(o.tilt * (1 - k * 0.2)) : 0), top = 2 + dy + (k % 2) * 2 + (o.tilt ? 1 : 0);
    RC(g, x, top, 1, 11 - (top - 2 - dy), k % 2 ? FRSH[1] : FRSH[2]); RC(g, x, top - 1, 1, 1, FRSH[2]); }
  RC(g, 2 + dx, 6 + dy, 6, 1, RP[1]); RC(g, 2 + dx, 10 + dy, 6, 1, RP[1]); RC(g, 3 + dx, 7 + dy, 1, 1, RP[0]);
  /* the legs: two stumps of leg in dark leather boots */
  for (const [lx, ly, lift] of o.legs) { RC(g, lx, ly - lift, 3, 3, SK[1]); RC(g, lx, ly - lift, 1, 3, SK[2]); RC(g, lx - 1, ly + 2 - lift, 5, 2, CAP[0]); RC(g, lx - 1, ly + 2 - lift, 5, 1, CAP[1]); }
  /* the tunic, the apron, the belt, the rope coil on his hip */
  RC(g, 7 + dx, 8 + dy, 8, 6, RUSTC[1]); RC(g, 7 + dx, 8 + dy, 1, 6, RUSTC[2]); RC(g, 14 + dx, 8 + dy, 1, 6, RUSTC[0]);
  RC(g, 8 + dx, 9 + dy, 6, 6, AP[1]); RC(g, 8 + dx, 9 + dy, 1, 6, AP[2]); RC(g, 13 + dx, 9 + dy, 1, 6, AP[0]); RC(g, 9 + dx, 13 + dy, 4, 1, AP[0]);
  RC(g, 7 + dx, 12 + dy, 8, 1, BELT); RC(g, 10 + dx, 12 + dy, 2, 1, IR[2]);
  RC(g, 14 + dx, 12 + dy, 2, 3, RP[1]); RC(g, 14 + dx, 13 + dy, 2, 1, RP[0]); RC(g, 15 + dx, 12 + dy, 1, 1, RP[2]);
  /* the head: green, big-eared, a leather cap with a rust band, one tusk */
  const X = 7 + dx + hx, Y = 3 + dy + hy;
  RC(g, X - 2, Y + 1, 2, 2, SK[1]); RC(g, X - 3, Y, 1, 2, SK[2]); RC(g, X + 8, Y + 1, 2, 2, SK[1]); RC(g, X + 9, Y, 1, 2, SK[2]);                              /* the ears, out past the head */
  RC(g, X, Y, 8, 5, SK[1]); RC(g, X, Y, 1, 5, SK[2]); RC(g, X + 7, Y, 1, 5, SK[0]); RC(g, X + 1, Y + 4, 6, 1, SK[0]);
  RC(g, X - 1, Y - 2, 10, 3, CAP[1]); RC(g, X, Y - 3, 8, 1, CAP[1]); RC(g, X, Y - 3, 8, 1, CAP[2]); RC(g, X - 1, Y - 2, 10, 1, CAP[2]); RC(g, X - 1, Y, 10, 1, RUSTC[1]); RC(g, X + 8, Y - 1, 2, 2, CAP[0]);   /* the cap, the rust band, the peak */
  if (o.face === 'hurt') { RC(g, X + 4, Y + 2, 1, 1, OUT); RC(g, X + 5, Y + 1, 1, 1, OUT); RC(g, X + 5, Y + 3, 1, 1, OUT); RC(g, X + 3, Y + 4, 4, 2, OUT); RC(g, X + 4, Y + 5, 2, 1, '#8a2a2a'); }
  else { RC(g, X + 4, Y + 1, 3, 2, '#f6f0d2'); RC(g, X + 6, Y + 1, 1, 2, OUT); RC(g, X + 4, Y, 3, 1, SK[0]);   /* the eye under a heavy brow */
    if (o.face === 'shout') { RC(g, X + 3, Y + 3, 4, 3, OUT); RC(g, X + 4, Y + 4, 2, 1, '#8a2a2a'); RC(g, X + 3, Y + 3, 1, 1, '#f0e8c8'); RC(g, X + 6, Y + 3, 1, 1, '#f0e8c8'); }
    else { RC(g, X + 4, Y + 3, 3, 1, OUT); RC(g, X + 6, Y + 3, 1, 2, '#f0e8c8'); } }
  /* THE MALLET and the hands on it */
  const hand = (x, y) => { RC(g, x, y, 3, 3, CAP[1]); RC(g, x, y, 3, 1, CAP[2]); RC(g, x + 1, y + 1, 1, 1, SK[1]); };
  const maul = (x, y, w, h, vertical) => { RC(g, x, y, w, h, WD[1]); RC(g, x, y, w, 1, FRSH[1]); RC(g, x, y + h - 1, w, 1, WD[0]);   /* a great wooden head... */
    if (vertical) { RC(g, x, y, 1, h, IR[1]); RC(g, x + w - 1, y, 1, h, IR[1]); RC(g, x + 1, y + 1, 1, 1, IR[2]); } else { RC(g, x, y, 1, h, IR[1]); RC(g, x + w - 1, y, 1, h, IR[1]); RC(g, x + 1, y + 1, w - 2, 1, FRSH[2]); RC(g, x, y, 1, 1, IR[2]); RC(g, x + w - 1, y, 1, 1, IR[2]); } };
  if (o.mal === 'shoulder') { lineP(g, 13 + dx, 9 + dy, 13 + dx, 10 + dy, SK[1]); hand(13 + dx, 9 + dy); lineP(g, 15 + dx, 10 + dy, 18 + dx, 3 + dy, WD[1], 2); maul(16 + dx, 0 + dy, 7, 4, true); }
  else if (o.mal === 'raise') { lineP(g, 12 + dx, 9 + dy, 15 + dx, 6 + dy, SK[1], 2); hand(14 + dx, 4 + dy); hand(14 + dx, 7 + dy); RC(g, 15 + dx, 3 + dy, 2, 9, WD[1]); RC(g, 15 + dx, 3 + dy, 1, 9, FRSH[1]); maul(11 + dx, -1 + dy, 10, 4, false); }
  else if (o.mal === 'drive') { lineP(g, 12 + dx, 9 + dy, 15 + dx, 11 + dy, SK[1], 2); hand(15 + dx, 10 + dy); lineP(g, 17 + dx, 11 + dy, 19 + dx, 15 + dy, WD[1], 2); maul(18 + dx, 14 + dy, 6, 4, true);
    RC(g, 20 + dx, 11 + dy, 2, 3, FRSH[1]); RC(g, 20 + dx, 11 + dy, 1, 3, FRSH[2]); RC(g, 21 + dx, 12 + dy, 1, 2, FRSH[0]); }                                                       /* the stake he is driving, under the maul's head */
  else { lineP(g, 12 + dx, 9 + dy, 15 + dx, 11 + dy, SK[1], 2); hand(15 + dx, 10 + dy); lineP(g, 17 + dx, 12 + dy, 19 + dx, 15 + dy, WD[1], 2); maul(18 + dx, 15 + dy, 6, 3, true); }   /* hurt: the maul sags */
  if (o.extra) o.extra(g);
  outline(c, OUT); return c;
}
export function bakeStakeSetter() {
  const L2 = (lx, ly, lift) => [lx, ly, lift];
  const walk = [
    { legs: [L2(8, 15, 0), L2(12, 15, 1)], mal: 'shoulder', face: 'norm' },
    { dy: -1, legs: [L2(9, 15, 0), L2(11, 15, 0)], mal: 'shoulder', face: 'norm' },
    { legs: [L2(8, 15, 1), L2(12, 15, 0)], mal: 'shoulder', face: 'norm' },
    { dy: -1, legs: [L2(9, 15, 0), L2(11, 15, 0)], mal: 'shoulder', face: 'norm' }];
  const frames = [
    ...walk.map(o => setterFrame(o)),
    setterFrame({ legs: [L2(8, 15, 0), L2(12, 15, 0)], mal: 'shoulder', face: 'norm', hd: [1, -1], tilt: 0 }),                                                     /* 4 look */
    setterFrame({ dx: -1, dy: 0, legs: [L2(7, 15, 0), L2(12, 15, 0)], mal: 'raise', face: 'shout', hd: [-1, -1], tilt: -1 }),                                       /* 5 the raise: back arched, mallet high, the shout */
    setterFrame({ dx: 1, dy: 1, legs: [L2(8, 14, 0), L2(13, 14, 0)], mal: 'drive', face: 'norm', hd: [2, 1], tilt: 1 }),                                          /* 6 the drive */
    setterFrame({ dx: -1, dy: 0, legs: [L2(8, 15, 0), L2(12, 15, 0)], mal: 'drop', face: 'hurt', hd: [-2, 0], tilt: -1 })];                                         /* 7 hurt */
  return pack(frames, { ax: 12, ay: 19, w: 10, h: 12 });
}

/* ------------------------------------------------------------------ recolours of the goblins' own sheets: the STAKE-THROWER and the MAUL CREW ------------------------------------------------------------------ */
const lerpC = (a, b, t) => { const A = rgb(a), B = rgb(b); return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; };
const rampAt = (st, l) => l < 0.5 ? lerpC(st[0], st[1], l * 2) : lerpC(st[1], st[2], (l - 0.5) * 2);
/* a class of a pixel of a goblin sheet: skin (green), red, cloth (blue-purple), wood, grey (metal), dark */
const kind = (r, g, b, l) => {
  if (l < 0.13) return 'dark';
  if (g > r + 10 && g > b + 10) return 'skin';
  if (r > g + 40 && r > b + 30) return 'red';
  if (b > g + 8 && b >= r - 10) return l > 0.55 ? 'metal' : 'cloth';
  if (Math.abs(r - g) < 26 && Math.abs(g - b) < 30) return 'metal';
  if (r > g && g > b) return 'wood';
  return 'other';
};
function recolor(c, map) {
  const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
  for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2], l = (r + gg + b) / 765, k = kind(r, gg, b, l), st = map[k]; if (!st) continue; const o = rampAt(st, Math.min(1, l * 1.2)); p[i] = o[0]; p[i + 1] = o[1]; p[i + 2] = o[2]; }
  g.putImageData(img, 0, 0); return d;
}
function topOf(c) { const g = c.getContext('2d'), p = g.getImageData(0, 0, c.width, c.height).data; let top = -1, x0 = 99, x1 = -1;
  for (let y = 0; y < c.height && top < 0; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (p[i + 3] && kind(p[i], p[i + 1], p[i + 2], (p[i] + p[i + 1] + p[i + 2]) / 765) === 'skin') { top = y; break; } }
  if (top >= 0) for (let y = top; y < top + 3; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (p[i + 3] && kind(p[i], p[i + 1], p[i + 2], (p[i] + p[i + 1] + p[i + 2]) / 765) === 'skin') { x0 = Math.min(x0, x); x1 = Math.max(x1, x); } }
  return { top, cx: x1 < 0 ? c.width >> 1 : (x0 + x1) >> 1, w: x1 < 0 ? 6 : x1 - x0 + 1 }; }
function overlay(c, draw) { const [o, g] = canvas(c.width, c.height); draw(g); outline(o, OUT); const [d, k] = canvas(c.width, c.height); k.drawImage(c, 0, 0); k.drawImage(o, 0, 0); return d; }
export function bakeLanternHand(base) {
  const frames = base.R.map(f => { const h = topOf(f); let c = recolor(f, { cloth: RUSTC, red: AP, wood: FRSH, metal: CAP, skin: ['#2a5222', '#5a9a40', '#90d060'] });   /* the helm is a leather cap now, the tunic rust, the belt tan */
    if (h.top >= 0) c = overlay(c, g => { RC(g, h.cx - 3, h.top, 7, 1, RUSTC[1]);   /* a rust band round the cap */
      RC(g, h.cx - 6, h.top + 2, 1, 3, IR[1]); RC(g, h.cx - 7, h.top + 4, 3, 4, '#2a160a'); RC(g, h.cx - 6, h.top + 5, 1, 2, '#ffd36b'); RC(g, h.cx - 7, h.top + 4, 3, 1, IR[2]); RC(g, h.cx - 5, h.top + 5, 1, 2, '#f0a030'); RC(g, h.cx + 4, h.top + 6, 2, 3, IR[1]); RC(g, h.cx + 4, h.top + 6, 2, 1, IR[2]); });   /* a hooded lantern on a hook at his shoulder, glowing; a flask of oil at his belt */
    return c; });
  return pack(frames, base);
}
export function bakeMaulCrew(base) {
  const frames = base.R.map(f => { const h = topOf(f); let c = recolor(f, { cloth: AP, red: RUSTC, wood: WD, metal: IR, skin: ['#2a5222', '#5a9a40', '#90d060'] });
    if (h.top >= 0) c = overlay(c, g => { RC(g, h.cx - 4, h.top - 2, 9, 3, CAP[1]); RC(g, h.cx - 4, h.top - 2, 9, 1, CAP[2]); RC(g, h.cx - 3, h.top - 3, 7, 1, CAP[1]); RC(g, h.cx - 4, h.top + 1, 9, 1, CAP[0]); RC(g, h.cx - 4, h.top, 2, 3, CAP[1]); RC(g, h.cx + 3, h.top, 2, 3, CAP[1]); });   /* a leather hood with ear-flaps */
    return c; });
  return pack(frames, base);
}
export const _mix = mix;
