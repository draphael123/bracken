// church_props.js - THE LIT CHURCH's baked props (claude/churchart): the lamps (a lampstand, the chapel's candelabrum, wall sconces, the seal lamp), the fires (brazier, votive
// stand, vigil candle), candle racks, the organ's pipes, bellows and key desk, pews and pulpit, headstones/crosses/tombs/yews, the altar and reliquary, banners, statues,
// the tower's bell, bones and coffins. Every one is baked once (px.js) and memoised; flames are separate small frames so a lamp can burn or be out.
import { canvas, px, rect, line, ellipse, circle, fillPoly, outline } from '../px.js';
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
export const C = {
  iron: '#3a3846', ironHi: '#7a7890', ironLo: '#1e1c28', brass: '#c9a040', brassHi: '#f4dc80', brassLo: '#7a5c1c', wax: '#ece4cc', waxLo: '#b8ae90', wick: '#2a2020',
  oak: '#6a4426', oakHi: '#a0703c', oakLo: '#2e1c10', oakMid: '#5a381e', stone: '#9a9684', stoneHi: '#c4bea8', stoneLo: '#5e5a4e', stoneDeep: '#34322a',
  bone: '#ddd5bc', boneMid: '#b9af92', boneLo: '#7e7660', red: '#9a2a2a', redHi: '#c84a3a', redLo: '#5e1818', gold: '#d8b040', goldHi: '#fff0a8', goldLo: '#8a6a1c',
  glass: ['#c8503c', '#d8a028', '#3a6ac8', '#3a9a6a', '#8a4ab8'], moss: '#3a5a44', yew: ['#1e3a2c', '#264834', '#16301f'], flame: ['#ff6b2c', '#ff9a3c', '#ffd36b', '#fff6c8'],
  blue: '#9ab8f0', blueHi: '#e0eaff', blueLo: '#4a5a9a',
};
const O = '#14121c';
/* ---- FLAMES: 4 frames, small (a candle's), medium (a lamp's), big (a brazier's) */
export function bakeFlame(size, frame) {
  return once('fl' + size + frame, () => { const w = size === 2 ? 14 : size === 1 ? 8 : 5, h = size === 2 ? 20 : size === 1 ? 11 : 7, [c, g] = canvas(w, h), m = w >> 1, f = frame % 4;
    const lean = [0, 1, 0, -1][f], hh = h - 1 - (f === 1 ? 1 : 0);
    for (let y = 0; y < hh; y++) { const k = y / hh, ww = Math.max(1, Math.round((size === 2 ? 6 : size === 1 ? 3 : 1.5) * Math.sin(Math.min(1, (1 - k) * 1.1 + 0.15) * Math.PI * 0.5 + (k > 0.7 ? -0.5 : 0))));
      const cx = m + Math.round(lean * k * (size + 1) * 0.5); rect(g, cx - ww + 1, hh - 1 - y + (h - hh), ww * 2 - 1 > 0 ? ww * 2 - 1 : 1, 1, k < 0.25 ? C.flame[3] : k < 0.5 ? C.flame[2] : k < 0.75 ? C.flame[1] : C.flame[0]); }
    return c; }); }
/* a baked soft glow (a radial falloff in real alpha), laid with 'lighter' in the game */
export function bakeGlow(r, col) { return once('glow' + r + col, () => { const d = r * 2, [c, g] = canvas(d, d), img = g.getImageData(0, 0, d, d), p = img.data, rr = parseInt(col.slice(1, 3), 16), gg = parseInt(col.slice(3, 5), 16), bb = parseInt(col.slice(5, 7), 16);
  for (let y = 0; y < d; y++) for (let x = 0; x < d; x++) { const k = Math.hypot(x + 0.5 - r, (y + 0.5 - r) * 1.15) / r; if (k >= 1) continue; const a = Math.pow(1 - k, 1.8), i = (y * d + x) * 4; p[i] = rr; p[i + 1] = gg; p[i + 2] = bb; p[i + 3] = Math.round(255 * a); }
  g.putImageData(img, 0, 0); return c; }); }
export const glowDot = (g, x, y, r, a, col) => { const spr = bakeGlow(Math.max(6, Math.round(r)), col || '#ffb050'), o = g.globalAlpha, op = g.globalCompositeOperation; g.globalAlpha = o * Math.min(1, a * 0.45); g.globalCompositeOperation = 'lighter'; g.drawImage(spr, x - spr.width / 2, y - spr.height / 2); g.globalCompositeOperation = op; g.globalAlpha = o; };

/* ---- LAMPS (all stand with their foot at the bottom of the sprite; the flame is laid at wick() on top) */
export function bakeLampstand() { return once('lampstand', () => { const [c, g] = canvas(16, 38);
  rect(g, 6, 34, 4, 2, C.iron); rect(g, 4, 36, 8, 2, C.iron); rect(g, 5, 36, 6, 1, C.ironHi); rect(g, 7, 12, 2, 22, C.iron); rect(g, 7, 12, 1, 22, C.ironHi);
  for (const y of [18, 26]) { rect(g, 6, y, 4, 2, C.brass); px(g, 6, y, C.brassHi); }
  rect(g, 3, 9, 10, 3, C.brass); rect(g, 3, 9, 10, 1, C.brassHi); rect(g, 4, 12, 8, 1, C.brassLo);   /* the dish */
  rect(g, 5, 3, 6, 6, '#c8d8e0'); rect(g, 5, 3, 6, 1, '#fff'); rect(g, 6, 4, 4, 4, '#e8f0f4'); rect(g, 5, 3, 1, 6, '#fff'); rect(g, 11, 3, 1, 6, '#8a98a8');   /* a glass oil lamp */
  rect(g, 7, 8, 2, 1, C.wick); outline(c, O); return c; }); }
export const LAMPSTAND_WICK = [8, 6];
export function bakeCandelabrum() { return once('candelabrum', () => { const [c, g] = canvas(28, 34);   /* the chapel's: a stone altar block with a brass candelabrum and a sanctuary bowl */
  rect(g, 3, 24, 22, 10, C.stone); rect(g, 3, 24, 22, 2, C.stoneHi); rect(g, 3, 32, 22, 2, C.stoneLo); for (let x = 5; x < 24; x += 6) rect(g, x, 27, 1, 5, C.stoneLo);
  rect(g, 2, 22, 24, 2, C.gold); rect(g, 2, 22, 24, 1, C.goldHi);   /* the altar cloth's gilt hem */
  rect(g, 13, 10, 2, 12, C.brass); rect(g, 13, 10, 1, 12, C.brassHi); rect(g, 9, 21, 10, 1, C.brassLo);
  for (const [x, y] of [[4, 9], [8, 6], [19, 6], [23, 9]]) { rect(g, x, y + 4, 1, 7, C.brass); rect(g, x - 1, y + 3, 3, 2, C.brass); rect(g, x, y, 1, 3, C.wax); }
  rect(g, 4, 17, 20, 1, C.brass); rect(g, 6, 14, 16, 1, C.brass); rect(g, 9, 6, 10, 4, C.brass); rect(g, 9, 6, 10, 1, C.brassHi); rect(g, 12, 5, 4, 1, C.brassLo);   /* the bowl */
  outline(c, O); return c; }); }
export const CANDELABRUM_WICKS = [[5, 7], [9, 4], [20, 4], [24, 7], [14, 3]];
export function bakeSconce(rood) { return once('sconce' + rood, () => { const [c, g] = canvas(12, 18);
  rect(g, 5, 8, 2, 8, C.iron); rect(g, 3, 15, 6, 3, C.iron); rect(g, 3, 15, 6, 1, C.ironHi); rect(g, 2, 7, 8, 2, rood ? C.brass : C.iron); if (rood) rect(g, 2, 7, 8, 1, C.brassHi); rect(g, 3, 6, 6, 1, C.ironLo);
  rect(g, 4, 2, 4, 5, C.wax); rect(g, 4, 2, 1, 5, '#fff'); rect(g, 7, 2, 1, 5, C.waxLo); rect(g, 5, 1, 2, 1, C.wick); outline(c, O); return c; }); }
export function bakeSealLamp() { return once('seal', () => { const [c, g] = canvas(16, 44);   /* hung on a chain: a silver-blue bell lamp */
  for (let y = 0; y < 22; y += 2) { px(g, 8, y, '#8a98b8'); px(g, 7, y + 1, '#5a6888'); }
  rect(g, 4, 22, 8, 3, '#b8c8e0'); rect(g, 4, 22, 8, 1, '#fff'); rect(g, 3, 25, 10, 8, '#8aa0d0'); rect(g, 3, 25, 2, 8, '#d0e0ff'); rect(g, 11, 25, 2, 8, '#4a5a90'); rect(g, 5, 27, 6, 4, '#e0eaff'); rect(g, 4, 33, 8, 2, '#b8c8e0'); rect(g, 7, 35, 2, 4, '#8a98b8');
  outline(c, O); return c; }); }
export const SEAL_WICK = [8, 28];
export function bakeBrazier() { return once('brazier', () => { const [c, g] = canvas(24, 26);
  for (const [a, b] of [[7, 25], [12, 25], [17, 25]]) line(g, 12, 14, a < 12 ? a - 1 : a > 12 ? a + 1 : a, b, C.iron);
  rect(g, 4, 10, 16, 5, C.iron); rect(g, 4, 10, 16, 1, C.ironHi); rect(g, 6, 15, 12, 2, C.ironLo); rect(g, 5, 8, 14, 2, '#6a2a1a'); for (let x = 6; x < 18; x += 3) px(g, x, 8, '#ff9a3c');
  rect(g, 11, 17, 2, 8, C.iron); outline(c, O); return c; }); }
export function bakeVotive() { return once('votive', () => { const [c, g] = canvas(22, 22);   /* an iron stand: a rack of candles in a sand tray */
  rect(g, 2, 14, 18, 6, C.iron); rect(g, 2, 14, 18, 1, C.ironHi); rect(g, 3, 20, 16, 2, C.ironLo); rect(g, 4, 15, 14, 3, '#7a6a4a');
  for (let i = 0; i < 5; i++) { const x = 3 + i * 3.4 | 0, h = 5 + (hash(i, 3) % 3); rect(g, x, 14 - h, 2, h, C.wax); rect(g, x, 14 - h, 1, h, '#fff'); rect(g, x + 1, 14 - h + 2, 1, h - 2, C.waxLo); px(g, x, 13 - h, C.wick); }
  rect(g, 0, 6, 1, 14, C.iron); rect(g, 21, 6, 1, 14, C.iron); outline(c, O); return c; }); }
export const VOTIVE_WICKS = [[3, 8], [6, 7], [10, 6], [13, 7], [17, 8]];
export function bakeVigil() { return once('vigil', () => { const [c, g] = canvas(14, 30);   /* a great candle on a stone drum */
  rect(g, 1, 26, 12, 4, C.stone); rect(g, 1, 26, 12, 1, C.stoneHi); rect(g, 3, 8, 8, 18, C.wax); rect(g, 3, 8, 2, 18, '#fff'); rect(g, 9, 8, 2, 18, C.waxLo); for (const y of [12, 17, 21]) { rect(g, 4, y, 1, 3, '#fff8e0'); rect(g, 10, y + 1, 1, 4, C.waxLo); }
  rect(g, 6, 7, 2, 1, C.wick); outline(c, O); return c; }); }
export const VIGIL_WICK = [7, 6];
export function bakeCandleRack(n) { return once('rack' + n, () => { const [c, g] = canvas(26, 30);   /* a tall iron candle rack: three tiers of candles */
  rect(g, 12, 6, 2, 22, C.iron); rect(g, 12, 6, 1, 22, C.ironHi); rect(g, 7, 28, 12, 2, C.iron); rect(g, 8, 27, 10, 1, C.ironHi);
  for (let t = 0; t < 3; t++) { const y = 8 + t * 7, w = 8 + t * 4; rect(g, 13 - w / 2 | 0, y + 3, w, 2, C.iron); rect(g, 13 - w / 2 | 0, y + 3, w, 1, C.ironHi);
    for (let i = 0; i < (t + 2); i++) { const x = (13 - w / 2 | 0) + 1 + Math.round(i * (w - 3) / (t + 1)); const lit = (hash(n + t, i) % 5) < 4; rect(g, x, y - 1, 2, 4, C.wax); px(g, x, y - 1, '#fff'); px(g, x, y - 2, C.wick); } }
  outline(c, O); return c; }); }
export const rackWicks = () => { const r = []; for (let t = 0; t < 3; t++) { const y = 8 + t * 7, w = 8 + t * 4; for (let i = 0; i < t + 2; i++) r.push([(13 - w / 2 | 0) + 1 + Math.round(i * (w - 3) / (t + 1)), y - 2]); } return r; };

/* ---- THE ORGAN */
export function bakePipe(h, v = 0) { return once('pipe' + h + v, () => { const w = 10, [c, g] = canvas(w, h);
  const pal = v ? ['#a8a8b8', '#e0e0f0', '#5a5a70'] : ['#b89848', '#f0dc88', '#6a5220'];
  rect(g, 1, 4, w - 2, h - 4, pal[0]); rect(g, 1, 4, 2, h - 4, pal[1]); rect(g, w - 3, 4, 2, h - 4, pal[2]); rect(g, 2, 0, w - 4, 5, pal[0]); rect(g, 2, 0, w - 4, 1, pal[1]);
  rect(g, 3, 6, w - 6, 3, '#14121c'); rect(g, 3, 6, w - 6, 1, '#3a3040'); for (const y of [h - 12, h - 24]) if (y > 12) rect(g, 1, y, w - 2, 1, pal[2]);   /* the mouth, the bands */
  rect(g, 3, h - 3, w - 6, 3, pal[2]); outline(c, O); return c; }); }
export function bakeBellows() { return once('bellows', () => { const [c, g] = canvas(22, 16);
  rect(g, 0, 14, 22, 2, C.iron); rect(g, 1, 12, 20, 2, C.oakMid); rect(g, 2, 4, 18, 8, '#6a3a22'); for (let x = 4; x < 20; x += 3) rect(g, x, 4, 1, 8, '#3e2010'); rect(g, 2, 4, 18, 1, '#a06a3c');   /* leather folds */
  rect(g, 1, 1, 20, 3, C.oak); rect(g, 1, 1, 20, 1, C.oakHi); rect(g, 9, 0, 4, 2, C.iron); rect(g, 19, 6, 3, 3, C.brass); outline(c, O); return c; }); }
export function bakeConsole() { return once('console', () => { const [c, g] = canvas(26, 26);   /* the organ's key desk: oak case, two manuals, stops, a bench */
  rect(g, 2, 14, 22, 12, C.oakMid); rect(g, 2, 14, 22, 1, C.oakHi); rect(g, 4, 22, 18, 3, C.oakLo); rect(g, 0, 12, 26, 3, C.oak); rect(g, 0, 12, 26, 1, C.oakHi);
  rect(g, 3, 8, 20, 4, C.wax); for (let x = 4; x < 23; x += 2) rect(g, x, 8, 1, 4, O); for (let x = 5; x < 23; x += 4) rect(g, x, 8, 2, 2, O);   /* the keys */
  rect(g, 2, 3, 22, 4, C.oakMid); for (let x = 4; x < 22; x += 4) { circle(g, x + 1, 5, 1.2, C.brassHi); }   /* the stops */
  rect(g, 6, 22, 14, 1, C.oakHi); outline(c, O); return c; }); }

/* ---- THE GRAVEYARD and its stones */
export function bakeHeadstone(v) { return once('hs' + v, () => { const [c, g] = canvas(14, 18);
  const sh = ['#8a8a96', '#7a7a88', '#9a9aa6'][v % 3]; rect(g, 2, 6, 10, 12, sh); rect(g, 3, 4, 8, 2, sh); rect(g, 4, 3, 6, 1, sh); rect(g, 2, 6, 2, 12, '#b4b4c0'); rect(g, 10, 6, 2, 12, '#5a5a68'); rect(g, 3, 4, 3, 1, '#b4b4c0');
  if (v % 3 === 0) { rect(g, 6, 7, 2, 7, '#4a4a58'); rect(g, 4, 9, 6, 2, '#4a4a58'); } else if (v % 3 === 1) { rect(g, 4, 9, 6, 1, '#4a4a58'); rect(g, 4, 11, 6, 1, '#4a4a58'); rect(g, 5, 13, 4, 1, '#4a4a58'); } else { circle(g, 7, 10, 2, '#4a4a58'); }
  rect(g, 0, 16, 14, 2, C.moss); rect(g, 1, 15, 3, 1, C.moss); outline(c, O); return c; }); }
export function bakeCross() { return once('cross', () => { const [c, g] = canvas(16, 30);
  rect(g, 7, 2, 3, 26, '#8a8a96'); rect(g, 2, 8, 13, 3, '#8a8a96'); rect(g, 7, 2, 1, 26, '#b4b4c0'); rect(g, 2, 8, 13, 1, '#b4b4c0'); rect(g, 8, 11, 2, 17, '#5a5a68'); rect(g, 4, 26, 9, 4, '#7a7a88'); rect(g, 4, 26, 9, 1, '#b4b4c0'); rect(g, 3, 28, 11, 2, '#5a5a68');
  px(g, 8, 4, '#5a8264'); px(g, 3, 9, '#5a8264'); outline(c, O); return c; }); }
export function bakeTomb(w) { return once('tomb' + w, () => { const [c, g] = canvas(w * 16, 24);   /* a chest tomb: a lid with a carved knight, a panelled side */
  rect(g, 0, 10, w * 16, 14, '#7a7a88'); rect(g, 0, 10, w * 16, 2, '#b4b4c0'); rect(g, 0, 22, w * 16, 2, '#5a5a68');
  for (let x = 4; x < w * 16 - 8; x += 14) { rect(g, x, 14, 10, 7, '#6a6a78'); rect(g, x, 14, 10, 1, '#5a5a68'); rect(g, x + 4, 15, 2, 5, '#8a8a98'); rect(g, x + 2, 17, 6, 1, '#8a8a98'); }
  rect(g, 3, 5, w * 16 - 6, 5, '#8a8a98'); rect(g, 3, 5, w * 16 - 6, 1, '#c4c4d0'); rect(g, 6, 2, 7, 3, '#8a8a98'); rect(g, w * 2 + 6, 2, w * 16 - w * 2 - 14, 3, '#8a8a98');   /* the effigy: head, arms, sword */
  rect(g, 4, 3, 2, 2, '#c4c4d0'); rect(g, 8, 3, 6, 1, '#c4c4d0'); outline(c, O); return c; }); }
export function bakeYew(v) { return once('yew' + v, () => { const [c, g] = canvas(44, 64);
  rect(g, 20, 40, 5, 24, '#3a2a22'); rect(g, 20, 40, 1, 24, '#5a4234'); rect(g, 17, 60, 11, 4, '#3a2a22');
  const blob = [[22, 18, 14, 17], [12, 30, 11, 12], [32, 30, 11, 12], [22, 38, 16, 10], [16, 14, 9, 9], [29, 12, 9, 9]];
  for (const [x, y, rx, ry] of blob) ellipse(g, x, y, rx, ry, C.yew[0]); for (const [x, y, rx, ry] of blob) ellipse(g, x - 2, y - 2, rx * 0.7, ry * 0.7, C.yew[1]);
  for (let i = 0; i < 40; i++) px(g, 8 + (hash(i, v) % 28), 8 + (hash(i, v + 5) % 36), C.yew[hash(i, 9) % 3]); for (let i = 0; i < 9; i++) px(g, 10 + (hash(i, v + 2) % 24), 10 + (hash(i, v + 7) % 30), '#4a7a58');
  outline(c, O); return c; }); }
export function bakeMoon() { return once('moon', () => { const [c, g] = canvas(30, 30);
  circle(g, 15, 15, 12, '#f4f0d8'); circle(g, 12, 12, 11, '#fffaea'); circle(g, 19, 18, 3, '#e0dcc0'); circle(g, 10, 20, 2, '#e0dcc0'); circle(g, 20, 9, 2, '#e0dcc0'); return c; }); }
export function bakeFence() { return once('fence', () => { const [c, g] = canvas(16, 16);
  rect(g, 0, 3, 16, 2, C.iron); rect(g, 0, 11, 16, 2, C.iron); for (const x of [2, 8, 14]) { rect(g, x, 1, 2, 15, C.iron); px(g, x, 0, C.ironHi); rect(g, x - 1, 1, 4, 1, C.ironHi); } return c; }); }

/* ---- THE NAVE */
export function bakePew(w, face) { return once('pew' + w, () => { const W = w * 16, [c, g] = canvas(W, 32);   /* a pew: the seat is the ledge tile (row 35); this lays the backrest above it and the panelled body under it down to the floor */
  rect(g, 2, 0, 3, 16, C.oakMid); rect(g, W - 5, 0, 3, 16, C.oakMid); rect(g, 2, 0, 3, 1, C.oakHi); rect(g, W - 5, 0, 3, 1, C.oakHi);   /* the carved ends (poppyheads) */
  circle(g, 3, 1, 2, C.oakHi); circle(g, W - 4, 1, 2, C.oakHi);
  rect(g, 4, 5, W - 8, 9, C.oak); rect(g, 4, 5, W - 8, 1, C.oakHi); rect(g, 4, 9, W - 8, 1, C.oakMid); rect(g, 4, 13, W - 8, 1, C.oakLo);   /* the backrest */
  rect(g, 2, 16, W - 4, 16, C.oakMid); rect(g, 2, 16, W - 4, 1, C.oakLo); for (let x = 5; x < W - 6; x += 9) { rect(g, x, 18, 7, 12, C.oak); rect(g, x, 18, 7, 1, C.oakHi); rect(g, x + 2, 20, 3, 8, C.oakLo); }   /* the front panel's tracery */
  rect(g, 0, 30, W, 2, C.oakLo); outline(c, O); return c; }); }
export function bakePulpit() { return once('pulpit', () => { const [c, g] = canvas(60, 70);   /* a drum on a stem with a sounding-board canopy above */
  rect(g, 4, 0, 52, 4, '#7a5230'); rect(g, 4, 0, 52, 1, C.oakHi); for (let x = 6; x < 56; x += 6) { rect(g, x, 4, 2, 4, C.oakMid); }   /* the sounding board */
  rect(g, 28, 8, 4, 8, C.brass); rect(g, 16, 16, 28, 2, C.brassLo);
  rect(g, 12, 38, 36, 20, C.oak); rect(g, 12, 38, 36, 3, C.oakHi); for (let x = 15; x < 46; x += 9) { rect(g, x, 43, 7, 12, C.oakMid); rect(g, x + 2, 45, 3, 8, C.oakLo); }
  rect(g, 10, 36, 40, 3, C.oakHi); rect(g, 18, 22, 24, 14, C.red); rect(g, 18, 22, 24, 1, C.redHi); rect(g, 28, 24, 4, 10, C.gold);   /* the fall, a gilt cross */
  rect(g, 24, 28, 12, 3, C.gold); rect(g, 22, 58, 16, 12, C.stone); rect(g, 18, 66, 24, 4, C.stoneLo); outline(c, O); return c; }); }
export function bakeBanner(v) { return once('ban' + v, () => { const [c, g] = canvas(18, 54); const cols = [['#8a1c1c', '#c84a3a'], ['#e4dccc', '#fff'], ['#1c2a5a', '#3a5ab8'], ['#4a1a5a', '#8a4ab8']][v % 4];
  rect(g, 0, 0, 18, 2, C.brass); rect(g, 8, 0, 2, 2, C.brassHi); for (let y = 2; y < 48; y++) { const w = y > 40 ? 18 - (y - 40) * 2 : 18; const x0 = (18 - w) / 2 | 0; rect(g, 1 + x0, y, w - 2, 1, y % 9 === 0 ? cols[1] : cols[0]); }
  rect(g, 1, 2, 1, 40, cols[1]); rect(g, 16, 2, 1, 40, '#00000040');
  const gold = v % 4 === 1 ? C.red : C.gold; rect(g, 8, 10, 2, 18, gold); rect(g, 4, 15, 10, 2, gold); for (let i = 0; i < 3; i++) rect(g, 4 + i * 5, 46 + (i & 1), 2, 6, C.brass);
  outline(c, O); return c; }); }
export function bakeStatue(v) { return once('statue' + v, () => { const [c, g] = canvas(20, 44);   /* a saint in a niche: pale stone robe, a book or a lamp */
  rect(g, 2, 0, 16, 44, '#14121c'); rect(g, 4, 0, 12, 2, '#14121c'); rect(g, 0, 8, 2, 36, '#5e5a4e'); rect(g, 18, 8, 2, 36, '#5e5a4e'); rect(g, 2, 2, 16, 1, '#5e5a4e');
  rect(g, 5, 38, 10, 6, '#7a7a88'); rect(g, 6, 14, 8, 24, '#c4c0b0'); rect(g, 6, 14, 2, 24, '#e4e0d0'); rect(g, 12, 14, 2, 24, '#8a8678'); circle(g, 10, 10, 4, '#d8d4c4'); rect(g, 8, 8, 2, 4, '#e8e4d4');
  if (v % 2) { rect(g, 12, 22, 4, 5, '#8a6a2a'); rect(g, 13, 23, 2, 3, C.gold); } else { rect(g, 3, 24, 3, 2, '#c4c0b0'); rect(g, 2, 22, 3, 3, '#e4e0d0'); }
  rect(g, 6, 12, 8, 1, C.gold); return c; }); }
export function bakeChandelier() { return once('chandelier', () => { const [c, g] = canvas(44, 34);   /* a hoop of iron with candles, hung on a chain */
  for (let y = 0; y < 12; y += 2) { px(g, 22, y, '#8a8aa0'); px(g, 21, y + 1, '#4a4a5a'); }
  rect(g, 20, 12, 5, 3, C.iron); line(g, 22, 14, 3, 26, C.iron); line(g, 22, 14, 41, 26, C.iron); ellipse(g, 22, 27, 20, 3, C.iron); ellipse(g, 22, 26, 20, 2, C.ironHi);
  for (const x of [5, 12, 19, 26, 33, 40]) { rect(g, x, 20, 2, 6, C.wax); px(g, x, 20, '#fff'); px(g, x, 19, C.wick); } rect(g, 21, 29, 3, 5, C.brass); outline(c, O); return c; }); }
export const CHANDELIER_WICKS = [[5, 19], [12, 19], [19, 19], [26, 19], [33, 19], [40, 19]];
export function bakeBell() { return once('bell', () => { const [c, g] = canvas(40, 46);   /* the tower's great bell: cast bronze hung from a yoke */
  rect(g, 2, 0, 36, 5, C.oak); rect(g, 2, 0, 36, 1, C.oakHi); rect(g, 17, 5, 6, 5, C.iron);
  fillPoly(g, [[12, 10], [28, 10], [31, 24], [36, 38], [4, 38], [9, 24]], '#a07a28'); fillPoly(g, [[12, 10], [18, 10], [17, 24], [12, 38], [4, 38], [9, 24]], '#d8b050');
  rect(g, 4, 38, 32, 3, '#6a4a14'); rect(g, 4, 38, 32, 1, '#e8c860'); rect(g, 10, 20, 20, 1, '#6a4a14'); rect(g, 8, 28, 24, 1, '#6a4a14'); rect(g, 19, 40, 3, 6, C.iron); circle(g, 20, 45, 2, C.iron);
  outline(c, O); return c; }); }
export function bakeAltar() { return once('altar', () => { const [c, g] = canvas(44, 40);   /* a stone altar with a white cloth, a gilt cross and two candles */
  rect(g, 2, 14, 40, 26, '#8a8678'); rect(g, 2, 14, 40, 2, '#c4bea8'); rect(g, 2, 38, 40, 2, '#5e5a4e'); for (let x = 6; x < 40; x += 9) { rect(g, x, 20, 7, 14, '#6e6a5c'); rect(g, x + 2, 22, 3, 10, '#4a4638'); }
  rect(g, 0, 12, 44, 3, '#e4dccc'); rect(g, 0, 12, 44, 1, '#fff'); rect(g, 0, 18, 44, 2, C.gold); for (let x = 1; x < 44; x += 4) rect(g, x, 20, 2, 3, C.gold);
  rect(g, 20, 0, 4, 12, C.gold); rect(g, 16, 3, 12, 3, C.gold); rect(g, 20, 0, 1, 12, C.goldHi); rect(g, 7, 6, 3, 6, C.wax); rect(g, 34, 6, 3, 6, C.wax); px(g, 8, 5, C.wick); px(g, 35, 5, C.wick); outline(c, O); return c; }); }
export const ALTAR_WICKS = [[8, 5], [35, 5]];
export function bakeReliquary(n) { return once('relq' + n, () => { const [c, g] = canvas(30, 26);   /* a glass-topped reliquary box on a stone plinth with five candle sockets: n of them lit */
  rect(g, 0, 20, 30, 6, '#7a7a88'); rect(g, 0, 20, 30, 1, '#b4b4c0'); rect(g, 2, 8, 26, 12, '#6a4a2a'); rect(g, 2, 8, 26, 1, C.oakHi); rect(g, 4, 10, 22, 8, '#14121c'); rect(g, 4, 10, 22, 1, '#8aa0c8'); rect(g, 10, 13, 10, 3, '#e8e0c0'); rect(g, 14, 12, 2, 5, C.gold); rect(g, 12, 13, 6, 2, C.gold);
  for (let i = 0; i < 5; i++) { const x = 3 + i * 5; rect(g, x, 3, 3, 5, i < n ? C.wax : '#3a3036'); if (i < n) px(g, x + 1, 2, '#ffb040'); } outline(c, O); return c; }); }
export function bakeFont() { return once('font', () => { const [c, g] = canvas(20, 26);   /* a holy-water stoup */
  rect(g, 7, 12, 6, 14, '#9a9684'); rect(g, 7, 12, 1, 14, '#c4bea8'); rect(g, 4, 24, 12, 2, '#7a766a'); rect(g, 1, 6, 18, 6, '#9a9684'); rect(g, 1, 6, 18, 1, '#c4bea8'); rect(g, 3, 7, 14, 2, '#3a6a9a'); rect(g, 4, 7, 5, 1, '#8ac0e8'); outline(c, O); return c; }); }
export function bakeConfessional() { return once('conf', () => { const [c, g] = canvas(34, 48);
  rect(g, 0, 8, 34, 40, C.oakMid); rect(g, 0, 8, 34, 2, C.oakHi); fillPoly(g, [[0, 8], [17, 0], [34, 8]], C.oak); rect(g, 6, 14, 9, 30, C.oakLo); rect(g, 19, 14, 9, 30, C.oakLo); rect(g, 7, 15, 7, 28, '#3a2a30'); rect(g, 20, 15, 7, 28, '#3a2a30'); rect(g, 15, 12, 4, 36, C.oakHi); rect(g, 15, 22, 4, 6, '#14121c');
  rect(g, 6, 14, 9, 1, C.oakHi); outline(c, O); return c; }); }

/* ---- THE CRYPT */
export function bakeBonePile(v) { return once('bp' + v, () => { const [c, g] = canvas(24, 12);
  for (let i = 0; i < 9; i++) { const x = 1 + (hash(i, v) % 19), y = 6 + (hash(i, v + 3) % 5); rect(g, x, y, 5, 2, C.bone); px(g, x, y, C.boneMid); px(g, x + 4, y + 1, C.boneLo); }
  for (const x of [5, 12, 17]) { circle(g, x, 4 + (x % 3), 2.2, C.bone); px(g, x - 1, 4 + (x % 3), '#14121c'); px(g, x + 1, 4 + (x % 3), '#14121c'); } outline(c, O); return c; }); }
export function bakeCoffin(open) { return once('coffin' + open, () => { const [c, g] = canvas(34, 16);
  fillPoly(g, [[2, 4], [32, 4], [34, 10], [32, 16], [2, 16], [0, 10]], '#4a3020'); rect(g, 2, 4, 30, 1, '#7a5230'); rect(g, 4, 8, 26, 1, '#2e1c10'); rect(g, 8, 6, 2, 8, C.brass); rect(g, 24, 6, 2, 8, C.brass);
  if (open) { rect(g, 6, 6, 22, 5, '#14121c'); rect(g, 8, 8, 8, 2, C.bone); circle(g, 22, 8, 2.2, C.bone); } outline(c, O); return c; }); }
export function bakeSarcophagus() { return once('sarc', () => { const [c, g] = canvas(48, 26);
  rect(g, 0, 10, 48, 16, '#5a6078'); rect(g, 0, 10, 48, 2, '#8a92b0'); rect(g, 0, 24, 48, 2, '#32364a'); for (let x = 5; x < 44; x += 12) { rect(g, x, 15, 8, 8, '#454a5e'); rect(g, x + 3, 16, 2, 6, '#7a82a0'); }
  rect(g, 4, 4, 40, 6, '#6a7090'); rect(g, 4, 4, 40, 1, '#a0a8c8'); rect(g, 6, 1, 8, 4, '#8a92b0'); rect(g, 15, 2, 26, 2, '#8a92b0'); rect(g, 30, 0, 2, 5, '#a0a8c8'); outline(c, O); return c; }); }
export function bakeChain() { return once('chain', () => { const [c, g] = canvas(6, 48); for (let y = 0; y < 48; y += 3) { rect(g, 2, y, 2, 3, y % 6 ? '#5a5a70' : '#8a8aa0'); rect(g, y % 6 ? 1 : 3, y + 1, 2, 1, '#3a3a4a'); } return c; }); }
export function bakeWeb() { return once('web', () => { const [c, g] = canvas(20, 20); for (let i = 0; i < 20; i++) { px(g, 0, i, '#c8c8d8'); px(g, i, 0, '#c8c8d8'); } for (let r = 6; r <= 18; r += 6) for (let a = 0; a <= r; a++) { const x = Math.round(Math.cos(a / r * Math.PI / 2) * r), y = Math.round(Math.sin(a / r * Math.PI / 2) * r); px(g, x, y, '#a0a0b8'); } line(g, 0, 0, 14, 14, '#a0a0b8'); g.globalAlpha = 1; return c; }); }
export function bakeGrate(on) { return once('grate' + on, () => { const [c, g] = canvas(16, 6); rect(g, 0, 0, 16, 6, '#14121c'); for (let x = 1; x < 16; x += 4) rect(g, x, 0, 2, 6, C.iron); rect(g, 0, 0, 16, 1, C.ironHi); rect(g, 0, 5, 16, 1, C.ironLo); rect(g, 0, 2, 16, 1, C.iron); if (on) { rect(g, 2, 1, 12, 4, '#2a3a6a'); } return c; }); }
export function bakeDoorBars(w, h, lit) { return once('bars' + w + h + lit, () => { const [c, g] = canvas(w, h);
  if (lit === 'rood') { rect(g, 0, 0, w, h, '#3a3a4a'); for (let x = 2; x < w; x += 5) rect(g, x, 0, 2, h, C.ironHi); for (let y = 4; y < h; y += 14) rect(g, 0, y, w, 2, C.iron); for (let y = 5; y < h; y += 14) for (let x = 3; x < w; x += 10) circle(g, x, y, 1.2, C.brassHi); return c; }
  rect(g, 0, 0, w, h, '#2a2230'); for (let x = 1; x < w; x += 4) { rect(g, x, 0, 2, h, C.iron); px(g, x, 0, C.ironHi); fillPoly(g, [[x - 1, h], [x + 3, h], [x + 1, h + 0]], C.iron); } for (let y = 6; y < h; y += 16) rect(g, 0, y, w, 2, C.ironLo); return c; }); }

/* THE CANDLE STUB (the quest's find: five of them open the reliquary): a guttered stub of wax on a little brass dish, a thread of smoke, a glint */
export function bakeStubIcon() { return once('stub', () => { const [c, g] = canvas(12, 14);
  rect(g, 1, 11, 10, 2, C.brass); rect(g, 1, 11, 10, 1, C.brassHi); rect(g, 3, 6, 6, 5, C.wax); rect(g, 3, 6, 2, 5, '#ffffff'); rect(g, 7, 7, 2, 4, C.waxLo); rect(g, 8, 8, 1, 3, '#d8c898'); rect(g, 3, 5, 6, 1, '#d8d0b4'); px(g, 5, 4, C.wick); px(g, 5, 3, '#ffd36b'); px(g, 6, 3, '#ff9a3c'); px(g, 5, 2, '#fff6c8'); px(g, 10, 9, '#fff0a8');
  outline(c, O); return c; }); }
/* a contact sheet list for tools/lit-church-art-sheet.mjs */
export function sheetItems() { const out = [];
  for (const f of [0, 1, 2, 3]) out.push(bakeFlame(0, f), bakeFlame(1, f), bakeFlame(2, f));
  out.push(bakeLampstand(), bakeCandelabrum(), bakeSconce(0), bakeSconce(1), bakeSealLamp(), bakeBrazier(), bakeVotive(), bakeVigil(), bakeCandleRack(1), bakeCandleRack(4), bakePipe(60), bakePipe(40, 1), bakeBellows(), bakeConsole());
  out.push(bakeHeadstone(0), bakeHeadstone(1), bakeHeadstone(2), bakeCross(), bakeTomb(4), bakeYew(0), bakeMoon(), bakeFence(), bakePew(4), bakePulpit(), bakeBanner(0), bakeBanner(1), bakeBanner(2), bakeBanner(3), bakeStatue(0), bakeStatue(1), bakeChandelier(), bakeBell(), bakeAltar(), bakeReliquary(3), bakeFont(), bakeConfessional());
  out.push(bakeStubIcon(), bakeBonePile(0), bakeBonePile(1), bakeCoffin(0), bakeCoffin(1), bakeSarcophagus(), bakeChain(), bakeWeb(), bakeGrate(0), bakeGrate(1), bakeDoorBars(32, 80, 'west'), bakeDoorBars(16, 80, 'rood'));
  return out; }
