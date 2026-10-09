// minecart_art.js - THE DEEP RAILS' drawn things (claude/minecartart): the rail and its sleepers, the trestle bents, lamps (the lantern strings, the lip lamps, the lever lamps, the crusher's
// beacon), the crushers, gates, duck beams, rock falls, the carts (the hero's, the goblins', the ore cart), the fall-in, the bore scars, the spoil, the headlight, the smelter and the bore's
// mouth - and THE GREAT DRILL (its machine, bit, gears, cab, bore lining, chute, points mast). src/minecart-hands.js and src/great-drill-hands.js keep every hit box, timing, tell and cell;
// they hand this file the numbers and it draws. Everything is plain fillRect pixel art on the screen (no per-frame allocation beyond a few gradients).
import { MP, glow, lampSprite, hash } from './minecart_backdrop.js';
import { canvas } from '../px.js';
const R = Math.round;
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const add = (g, fn) => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; };
const HAZ = ['#e8b830', '#1a1612'];
export const IRON = MP.i3, DARK = '#14100e';

/* ---------------- THE RAIL ---------------- */
export function rail(g, sx, sy, x) {
  rc(g, sx + 1, sy - 1, 5, 3, MP.t1); rc(g, sx + 9, sy - 1, 5, 3, MP.t1); rc(g, sx + 1, sy - 1, 5, 1, MP.t3); rc(g, sx + 9, sy - 1, 5, 1, MP.t3);   /* the sleepers, their tops lit */
  rc(g, sx, sy - 3, 16, 1, (x % 7 === 0) ? '#a06a3c' : MP.i5); rc(g, sx, sy - 2, 16, 1, MP.i3); rc(g, sx + 2, sy - 2, 3, 2, MP.i2); rc(g, sx + 10, sy - 2, 3, 2, MP.i2);   /* the head, the web, the chairs */
  rc(g, sx + 3, sy - 2, 1, 1, MP.i5); rc(g, sx + 11, sy - 2, 1, 1, MP.i5);   /* spike heads */
}
/* a trestle BENT: a timber leg (lit on the left, dark on the right), a corbel under the deck, X-braces to the next leg when `next` */
export function bent(g, sx, yTop, yBot, next, seed) {
  const h = yBot - yTop; if (h <= 0) return;
  rc(g, sx, yTop, 4, h, MP.t2); rc(g, sx, yTop, 1, h, MP.t4); rc(g, sx + 3, yTop, 1, h, MP.t0); for (let y = yTop + 5; y < yBot; y += 13) { rc(g, sx + 1, y, 2, 1, MP.t1); rc(g, sx + 1 + (y & 1), y + 3, 1, 3, MP.t3); }
  rc(g, sx - 2, yTop, 8, 2, MP.t3); rc(g, sx - 2, yTop, 8, 1, MP.t4); rc(g, sx - 1, yTop + 2, 1, 3, MP.t1); rc(g, sx + 4, yTop + 2, 1, 3, MP.t1);   /* the cap and its corbels */
  rc(g, sx - 3, yBot - 2, 10, 2, MP.t1); rc(g, sx - 2, yBot - 3, 8, 1, MP.t3);   /* the sill on the ground */
  if (next) for (let y0 = yTop + 6; y0 + 26 <= yBot; y0 += 28) { const x1 = sx + 48; for (let i = 0; i <= 44; i++) { const t = i / 44, yy = y0 + t * 26; rc(g, sx + 4 + i, yy, 1, 2, MP.t2); rc(g, sx + 4 + i, y0 + 26 - t * 26, 1, 2, MP.t1); } rc(g, sx + 4, y0 + 26, 44, 2, MP.t2); rc(g, sx + 4, y0 + 26, 44, 1, MP.t3); }
}

/* ---------------- LAMPS ---------------- */
/* a lantern hung at (x, y) = its hook: a cage, a flame, a glow that breathes */
export function lantern(g, x, y, time, seed, col = '255,160,64') {
  const lit = true; g.drawImage(lampSprite(lit), R(x) - 3, R(y)); add(g, () => { g.globalAlpha = 0.85 + 0.12 * Math.sin(time * 6.3 + seed); g.drawImage(glow(30, col), R(x) - 30, R(y) - 24); });
}
/* the LIP LAMP at a gap's edge (the amber vs red DEEP read): a stout post, an iron lamp housing with a coloured lens, a glow in the lens colour, flashing when the cart is near */
export function lipLamp(g, x, y, deadly, on, time) {
  const col = deadly ? '255,90,80' : '255,170,60', lens = deadly ? '#ff5a4a' : '#ffb84c', lensL = deadly ? '#ffc0b0' : '#fff0b0';
  rc(g, x - 1, y - 22, 3, 22, MP.t2); rc(g, x - 1, y - 22, 1, 22, MP.t4); rc(g, x - 4, y - 3, 9, 3, MP.t1); rc(g, x - 4, y - 3, 9, 1, MP.t3);   /* the post and its foot */
  rc(g, x - 4, y - 31, 9, 2, MP.i2); rc(g, x - 4, y - 31, 9, 1, MP.i4); rc(g, x - 3, y - 29, 7, 7, MP.i1); rc(g, x - 3, y - 29, 1, 7, MP.i3); rc(g, x + 3, y - 29, 1, 7, MP.i0);   /* the cap and the housing */
  rc(g, x - 2, y - 28, 5, 5, on ? lens : '#4a3a32'); if (on) { rc(g, x - 1, y - 27, 2, 2, lensL); } rc(g, x - 2, y - 22, 5, 1, MP.i2);
  if (on) add(g, () => { g.globalAlpha = 0.8; g.drawImage(glow(28, col), x - 28, y - 53); });
}
/* the chevrons painted on the last sleepers, the same colour as the lamp */
export function chevrons(g, x, y, on, deadly) { const c = on ? (deadly ? '#ff6b6b' : '#ffb050') : '#5a4a3a'; for (let i = 1; i <= 3; i++) { const cx_ = x - i * 9; rc(g, cx_, y - 5, 2, 1, c); rc(g, cx_ + 1, y - 4, 2, 1, c); rc(g, cx_, y - 3, 2, 1, c); } }

/* THE LEVER (the points): a mast, a signal lamp (blue = the chute, gold = set, grey = locked), a housing, an arrow on the lens */
export function lever(g, x, y, hang, set, locked, flash, time) {
  const top = hang ? y + 10 : y - 28;
  if (hang) { rc(g, x - 1, y - 4, 2, 10, MP.i3); rc(g, x - 3, y - 6, 6, 3, MP.i2); } else { rc(g, x - 1, y - 24, 3, 24, MP.i1); rc(g, x - 1, y - 24, 1, 24, MP.i3); rc(g, x - 4, y - 3, 9, 3, MP.t1); rc(g, x - 4, y - 3, 9, 1, MP.t3); rc(g, x - 3, y - 12, 7, 2, MP.i2); }   /* the mast, its base and a throw-handle */
  const lens = flash ? '#ffffff' : locked ? '#6a6a6a' : set ? '#ffd36b' : '#7fc4e0', glw = locked ? null : set ? '255,200,80' : '120,190,255';
  rc(g, x - 7, top - 7, 14, 14, MP.i1); rc(g, x - 7, top - 7, 14, 1, MP.i4); rc(g, x - 7, top - 7, 1, 14, MP.i3); rc(g, x + 6, top - 7, 1, 14, MP.i0); rc(g, x - 7, top + 6, 14, 1, MP.i0);   /* the housing */
  g.fillStyle = lens; g.beginPath(); g.arc(x, top, 5.5, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x - 3, top - 4, 3, 2);
  g.fillStyle = DARK; if (set) { rc(g, x - 1, top - 3, 2, 6, DARK); rc(g, x - 3, top - 2, 6, 1, DARK); rc(g, x - 2, top - 3, 4, 1, DARK); } else { rc(g, x - 1, top - 3, 2, 6, DARK); rc(g, x - 3, top + 1, 6, 1, DARK); rc(g, x - 2, top + 2, 4, 1, DARK); }   /* the arrow: UP = high line, DOWN = low line */
  if (glw) add(g, () => { g.globalAlpha = 0.55 + 0.1 * Math.sin(time * 5); g.drawImage(glow(26, glw), x - 26, top - 26); });
  return top;
}

/* ---------------- THE HAZARDS ---------------- */
/* THE CRUSHER: a press head in a frame - a guide on each side, a hydraulic ram on top with a BEACON (red and flashing when it is about to fall, green when it is up and safe), a riveted iron block with hazard stripes and a toothed face */
export function crusher(g, x, w, topY, bot, state, time) {
  const gx0 = x + 1, gx1 = x + w - 3;
  for (const cxm of [x + 2, x + w - 3]) for (let y = -20; y < topY - 46; y += 4) { rc(g, cxm - (y & 4 ? 0 : 1), y, 2, 3, MP.i3); rc(g, cxm, y, 1, 3, MP.i4); }   /* chains up to the roof: the press hangs from it */
  rc(g, gx0, topY - 40, 2, bot - topY + 40 - 14, MP.i2); rc(g, gx1, topY - 40, 2, bot - topY + 40 - 14, MP.i2); rc(g, gx0, topY - 40, 1, bot - topY + 40 - 14, MP.i4);   /* the guides */
  rc(g, x - 2, topY - 46, w + 4, 8, MP.i1); rc(g, x - 2, topY - 46, w + 4, 1, MP.i4); rc(g, x - 2, topY - 39, w + 4, 1, MP.i0); for (let i = x; i < x + w; i += 6) rc(g, i, topY - 44, 1, 1, MP.i5);   /* the head frame */
  rc(g, x + w / 2 - 2, topY - 38, 4, bot - topY + 38 - 18, MP.i3); rc(g, x + w / 2 - 2, topY - 38, 1, bot - topY + 38 - 18, MP.i5);   /* the ram */
  const warn = state === 'warn', up = state === 'up', bc = warn ? (Math.floor(time * 14) % 2 ? '#ff4030' : '#802010') : up ? '#6ad060' : '#ff4030';
  rc(g, x + w / 2 - 3, topY - 55, 7, 8, MP.i1); rc(g, x + w / 2 - 2, topY - 54, 5, 5, bc); rc(g, x + w / 2 - 1, topY - 53, 2, 2, '#ffffff'); rc(g, x + w / 2 - 4, topY - 47, 9, 1, MP.i4);   /* THE BEACON */
  if (warn || !up) add(g, () => { g.globalAlpha = warn ? 0.9 : 0.5; g.drawImage(glow(24, '255,70,50'), R(x + w / 2) - 24, R(topY - 51) - 24); });
  else add(g, () => { g.globalAlpha = 0.35; g.drawImage(glow(18, '110,230,100'), R(x + w / 2) - 18, R(topY - 51) - 18); });
  /* the block */
  rc(g, x, bot - 20, w, 20, MP.i2); rc(g, x, bot - 20, w, 1, MP.i4); rc(g, x, bot - 20, 1, 20, MP.i3); rc(g, x + w - 1, bot - 20, 1, 20, MP.i0);
  for (let i = 0; i < w; i += 8) { for (let k = 0; k < 6; k++) { rc(g, x + i + k, bot - 17 + (k >> 1), 1, 5 - (k >> 1), (i / 8) & 1 ? HAZ[0] : HAZ[1]); } }   /* the hazard band */
  rc(g, x, bot - 18, w, 1, MP.i0); rc(g, x, bot - 11, w, 1, MP.i0); for (let i = 2; i < w; i += 7) { rc(g, i + x, bot - 9, 1, 1, MP.i5); rc(g, i + x, bot - 19, 1, 1, MP.i5); }
  for (let i = 0; i < w; i += 4) { rc(g, x + i, bot - 7, 3, 4, MP.i1); rc(g, x + i + 1, bot - 3, 1, 3, MP.i5); }   /* the teeth */
}
/* THE GATE: a timber frame with a counterweight, an iron portcullis with spear points that lifts; its gauge */
export function gate(g, x, yb, open, k, time) {
  const lift = open ? 40 : 0;
  rc(g, x - 5, yb - 56, 4, 56, MP.t2); rc(g, x - 5, yb - 56, 1, 56, MP.t4); rc(g, x + 11, yb - 56, 4, 56, MP.t2); rc(g, x + 11, yb - 56, 1, 56, MP.t4); rc(g, x - 6, yb - 58, 22, 5, MP.t3); rc(g, x - 6, yb - 58, 22, 1, MP.t5); rc(g, x - 6, yb - 54, 22, 1, MP.t0);   /* posts and lintel */
  rc(g, x + 12, yb - 52, 3, 7, MP.i2); rc(g, x + 12, yb - 45, 3, 8 + (open ? 22 : 0) * 0, MP.i1);   /* the counterweight on its chain */
  g.save(); g.beginPath(); g.rect(x - 4, yb - 54, 16, 54); g.clip();
  for (let i = 0; i < 4; i++) { const bx = x - 2 + i * 4; rc(g, bx, yb - 50 - lift, 2, 50, MP.i3); rc(g, bx, yb - 50 - lift, 1, 50, MP.i5); rc(g, bx, yb - 54 - lift, 2, 4, MP.i4); rc(g, bx, yb - 55 - lift, 1, 1, MP.i5); }
  rc(g, x - 3, yb - 34 - lift, 14, 2, MP.i2); rc(g, x - 3, yb - 16 - lift, 14, 2, MP.i2); g.restore();
  const gy = yb - 66; rc(g, x - 1, gy - 7, 14, 14, MP.i1); rc(g, x - 1, gy - 7, 14, 1, MP.i4); g.fillStyle = open ? '#2a5a2a' : '#5a2a1a'; g.beginPath(); g.arc(x + 6, gy, 5.5, 0, Math.PI * 2); g.fill();
  g.strokeStyle = open ? '#8fd160' : '#ff9a5c'; g.beginPath(); g.moveTo(x + 6, gy); g.lineTo(x + 6 + Math.cos(-Math.PI / 2 + k * Math.PI * 2) * 5, gy + Math.sin(-Math.PI / 2 + k * Math.PI * 2) * 5); g.stroke();
  add(g, () => { g.globalAlpha = 0.5; g.drawImage(glow(14, open ? '120,230,100' : '255,140,60'), x + 6 - 14, gy - 14); });
  return gy;
}
/* THE DUCK BEAM: a lintel across the line between two posts, hazard-striped on its underside, a chain hanging */
export function beam(g, x, w, y, flash) {
  rc(g, x - 3, -20, 5, y + 20, MP.t2); rc(g, x - 3, -20, 1, y + 20, MP.t4); rc(g, x + w - 2, -20, 5, y + 20, MP.t2); rc(g, x + w - 2, -20, 1, y + 20, MP.t4);   /* the posts: props set to the roof, up out of the picture */
  rc(g, x - 5, y - 8, w + 10, 8, MP.t3); rc(g, x - 5, y - 8, w + 10, 1, MP.t5); rc(g, x - 5, y - 1, w + 10, 1, MP.t0);
  for (let i = x - 4; i < x + w + 4; i += 8) for (let k = 0; k < 6; k++) rc(g, i + k, y - 6 + (k >> 1), 1, 4 - (k >> 1), ((i - x) / 8) & 1 ? HAZ[0] : HAZ[1]);   /* the hazard stripes */
  for (const px_ of [x - 3, x + w]) { rc(g, px_ - 1, y - 8, 7, 2, MP.i2); rc(g, px_ - 1, y - 8, 7, 1, MP.i4); }
  rc(g, x + w / 2, y - 62, 1, 54, MP.i2); for (let k = 0; k < 13; k++) rc(g, x + w / 2 - 1 + (k & 1), y - 60 + k * 4, 2, 2, MP.i3);   /* a chain */
}
/* THE ROCKFALL: the shadow on the line, dust, and the boulder - angular, lit on top */
export function boulder(g, x0, w, y, k, time) {
  const ry = R(y - 80 + 80 * k * k);
  rc(g, x0 + 3, ry - 15, w - 6, 15, MP.r4); rc(g, x0 + 3, ry - 15, w - 6, 2, MP.r6); rc(g, x0 + 1, ry - 11, 3, 8, MP.r3); rc(g, x0 + w - 4, ry - 11, 3, 8, MP.r2); rc(g, x0 + 6, ry - 8, w - 12, 8, MP.r3);
  for (let i = 0; i < 5; i++) rc(g, x0 + 5 + ((i * 11) % Math.max(1, w - 10)), ry - 13 + (i * 3) % 10, 2, 1, MP.r0);
  rc(g, x0 + 7, ry - 12, 3, 1, MP.go2);   /* a fleck of ore in it */
}
/* THE FALLEN-IN heap that closes a dead line */
export function fallin(g, x, y, time) {
  for (let i = 0; i < 12; i++) { const bx = x + ((i * 7) % 28), by = y + 32 - 4 - ((i * 5) % 20) - (i % 3) * 3, bw = 7 + (i % 4) * 2, bh = 5 + (i % 3) * 2; rc(g, bx, by, bw, bh, i % 3 ? MP.r4 : MP.r3); rc(g, bx, by, bw, 1, MP.r6); rc(g, bx + bw - 1, by, 1, bh, MP.r1); }
  rc(g, x + 2, y + 24, 28, 8, MP.r2); for (let i = 0; i < 4; i++) rc(g, x + 3 + i * 7, y + 29 + (i & 1), 4, 2, MP.r1);
  rc(g, x + 4, y + 8, 3, 18, MP.t2); rc(g, x + 20, y + 14, 3, 16, MP.t1);   /* a snapped prop and a split plank in it */
  add(g, () => { g.globalAlpha = 0.18 + 0.08 * Math.sin(time * 3); g.drawImage(glow(26, '200,120,60'), x + 16 - 26, y + 10 - 26); });
}

/* THE LOW LINE GOING (the cave-in's crumbling rail, x0..x1 on screen at rail height y): sleepers snapped, the rail cracked and sagging in gaps, rubble heaped between the
   sleepers and more coming down out of the roof with a dust streak behind each rock, a rim of grit over the whole run. 'seed' = the decor's first column, so the heaps keep their
   places as the camera scrolls. */
export function crumble(g, x0, x1, y, time, seed) {
  const w = x1 - x0, n = Math.max(1, Math.floor(w / 15));
  for (let i = 0; i < n; i++) { const h = hash(seed, i), bx = x0 + 4 + i * 15 + (h % 5), sag = 1 + (h >> 3) % 3;
    rc(g, bx, y - 1, 7, 3, DARK); rc(g, bx + 1, y, 5, 1, MP.t0);          /* a sleeper broken through, its splinters */
    rc(g, bx - 3, y - 3 + sag, 5, 1, MP.i1); rc(g, bx - 3, y - 4 + sag, 5, 1, MP.i3);  /* the rail slumped into the gap, its cracked end bright */
    if (h % 3 === 0) rc(g, bx + 2, y - 4, 1, 3, MP.t3);                   /* a prop-stump standing in it */
    const hw = 6 + h % 7, hh = 3 + (h >> 4) % 4, hx = bx + 7 + (h >> 6) % 3;   /* the heap */
    rc(g, hx, y - hh, hw, hh, MP.r3); rc(g, hx + 1, y - hh - 1, hw - 2, 1, MP.r5); rc(g, hx + 2, y - hh - 2, Math.max(1, hw - 5), 1, MP.r6); rc(g, hx, y - 1, hw, 1, MP.r1); rc(g, hx + hw - 2, y - hh + 1, 2, hh - 1, MP.r2);
    if (h % 4 === 1) rc(g, hx + 2, y - hh + 1, 2, 1, MP.go2);               /* a fleck of ore in it */ }
  /* the roof letting go: each rock a lit corner and a dark side, a streak of dust above it, drifting down the run on its own beat */
  for (let i = 0; i < 6; i++) { const ph = (time * (0.7 + (i % 3) * 0.25) + i * 0.37) % 1, rx = x0 + ((i * 53 + 11) % Math.max(1, w - 6)), ry = y - 92 + ph * 86, s = 2 + (i % 3);
    rc(g, rx, ry - 8, 1, 7, 'rgba(110,98,120,0.35)'); rc(g, rx + 1, ry - 14, 1, 6, 'rgba(110,98,120,0.2)');
    rc(g, rx, ry, s, s, MP.r4); rc(g, rx, ry, s, 1, MP.r6); rc(g, rx + s - 1, ry + 1, 1, s - 1, MP.r2); }
  /* grit hanging over the run, and a cold amber gleam where the lamps catch it */
  add(g, () => { g.globalAlpha = 0.07 + 0.03 * Math.sin(time * 5); g.fillStyle = '#c8641c'; g.fillRect(R(x0), R(y - 40), R(w), 40); });
  for (let i = 0; i < 9; i++) { const gx = x0 + ((i * 41 + R(time * 23) * 3) % Math.max(1, w)), gy = y - 4 - ((i * 17 + R(time * 40)) % 36); rc(g, gx, gy, 1, 1, MP.r6); }
}
/* THE CART'S SPEEDOMETER: an iron half-dial on a bracket, a brass-ringed face with its ticks (the CRUISE tick pale, the BOOST tick gold), a copper needle on a rivet, a lamp
   in the housing that burns amber on a boost and blue when the cart is slowed. k 0..1 the speed up the dial, kc where cruise sits, mode 'boost' | 'cruise' | 'brake' | 'stopped'. */
export function speedo(g, x, y, k, kc, mode, time, kr) {
  const rim = 14;
  rc(g, x - 17, y + 1, 35, 4, MP.i1); rc(g, x - 17, y + 1, 35, 1, MP.i3); rc(g, x - 17, y + 4, 35, 1, MP.i0); for (const bx of [x - 15, x + 14]) rc(g, bx, y + 2, 2, 2, MP.i5);   /* the bracket and its bolts */
  for (let dy = -rim; dy <= 0; dy++) { const hw = Math.floor(Math.sqrt(rim * rim - dy * dy + 0.5)); rc(g, x - hw, y + dy, hw * 2 + 1, 1, dy < -rim + 2 ? MP.i4 : MP.i2); }       /* the housing's iron */
  for (let dy = -(rim - 2); dy <= 0; dy++) { const hw = Math.floor(Math.sqrt((rim - 2) * (rim - 2) - dy * dy + 0.5)); rc(g, x - hw, y + dy, hw * 2 + 1, 1, MP.i0); }       /* the face */
  for (let a = 0; a <= 20; a++) { const aa = Math.PI + a / 20 * Math.PI; rc(g, x + Math.cos(aa) * (rim - 1), y + Math.sin(aa) * (rim - 1), 1, 1, MP.go1); }                  /* the brass ring */
  for (let a = 0; a <= 8; a++) { const aa = Math.PI + a / 8 * Math.PI, c = a === 8 ? MP.go3 : Math.abs(a / 8 - kc) < 0.07 ? MP.i5 : MP.i3, r0 = a % 4 === 0 || a === 8 ? 8 : 9;
    for (let r = r0; r <= 11; r++) rc(g, x + Math.cos(aa) * r, y + Math.sin(aa) * r, 1, 1, c); }                                                                         /* the ticks */
  if (kr !== undefined) { const aa = Math.PI + kr * Math.PI; for (let r = 7; r <= 12; r++) rc(g, x + Math.cos(aa) * r, y + Math.sin(aa) * r, 1, 1, '#ff6b6b'); }   /* (deeprails2) THE RAM tick: at or past it the cart rams */
  const na = Math.PI + Math.max(0, Math.min(1, k)) * Math.PI, nc = mode === 'boost' ? MP.go3 : mode === 'brake' ? '#7fc4e0' : MP.l3;
  for (let r = 1; r <= 10; r++) { rc(g, x + Math.cos(na) * r, y + Math.sin(na) * r + 1, 1, 1, MP.i0); } for (let r = 1; r <= 10; r++) rc(g, x + Math.cos(na) * r, y + Math.sin(na) * r, 1, 1, r > 6 ? nc : MP.l1);   /* the needle, its shadow under it */
  rc(g, x - 1, y - 2, 3, 3, MP.i4); rc(g, x, y - 1, 1, 1, MP.i5);                                                                                                           /* the rivet it turns on */
  const lit = mode === 'boost' || mode === 'brake'; rc(g, x - 1, y - 6, 3, 2, lit ? (mode === 'boost' ? MP.l2 : '#7fc4e0') : MP.i1);
  if (lit) add(g, () => { g.globalAlpha = 0.5 + 0.2 * Math.sin(time * 12); g.drawImage(glow(12, mode === 'boost' ? '255,168,60' : '127,196,224'), R(x) - 12, R(y - 5) - 12); });
}

/* ---------------- THE CARTS ---------------- */
/* kind: 'hero' (timber tub, iron-banded), 'gob' (rust iron, a bone bumper and a rag), 'ore' (loaded), 'caster' (a goblin's rune cart: a dark hull with a violet lamp) */
export function tub(g, x, y, kind, time, v) {
  x = R(x); y = R(y);
  const hull = kind === 'gob' ? '#5a3224' : kind === 'caster' ? '#3a2a44' : kind === 'ore' ? '#3e2e26' : '#6b5034', hullL = kind === 'gob' ? '#8a5030' : kind === 'caster' ? '#6a4a80' : kind === 'ore' ? '#6a4a38' : '#8e6c44';
  rc(g, x - 11, y - 11, 22, 9, DARK); rc(g, x - 10, y - 10, 20, 7, hull); rc(g, x - 10, y - 10, 20, 1, hullL);   /* the body */
  for (let i = -8; i <= 6; i += 5) { rc(g, x + i, y - 9, 1, 6, DARK); }   /* slats / rib lines */
  rc(g, x - 11, y - 11, 22, 1, MP.i4); rc(g, x - 11, y - 5, 22, 1, MP.i3); rc(g, x - 11, y - 11, 1, 8, MP.i3); rc(g, x + 10, y - 11, 1, 8, MP.i2);   /* the iron bands and rim */
  for (const rx of [x - 9, x - 3, x + 3, x + 9]) rc(g, rx, y - 8, 1, 1, MP.i5);   /* rivets */
  rc(g, x - 13, y - 6, 3, 2, MP.i2); rc(g, x + 10, y - 6, 3, 2, MP.i2);   /* couplings */
  if (kind === 'gob') { rc(g, x + 8, y - 17, 1, 7, MP.t2); rc(g, x + 9, y - 17, 5, 3, MP.rag); rc(g, x + 9, y - 17, 5, 1, MP.rag2); rc(g, x - 10, y - 8, 2, 3, '#cfc3a4'); rc(g, x - 12, y - 7, 2, 1, '#cfc3a4'); rc(g, x - 12, y - 6, 1, 2, '#cfc3a4'); }   /* a rag banner and a bone bumper */
  if (kind === 'caster') add(g, () => { g.globalAlpha = 0.5 + 0.2 * Math.sin(time * 4); g.drawImage(glow(14, '180,120,255'), x - 14, y - 22); }), rc(g, x - 1, y - 13, 3, 3, '#b48aff');
  if (kind === 'ore') { for (let i = 0; i < 6; i++) { rc(g, x - 9 + i * 3 + (i & 1), y - 15 + (i % 3), 3, 4, i % 2 ? MP.cu1 : '#8a5a38'); } rc(g, x - 6, y - 15, 2, 1, MP.go3); rc(g, x + 2, y - 14, 2, 1, MP.cu3); rc(g, x + 6, y - 16, 2, 1, MP.go2); }
  const a = time * (v || 0) / 6; for (const wx of [x - 6, x + 6]) { rc(g, wx - 3, y - 3, 6, 3, '#0c0a0a'); rc(g, wx - 3, y - 3, 6, 1, MP.i2); rc(g, wx - 1 + R(Math.cos(a) * 1.5), y - 2, 2, 1, MP.i4); rc(g, wx, y - 2 + (Math.sin(a) > 0.7 ? 1 : 0), 1, 1, MP.i5); }   /* the wheels, their hubs turning */
}
/* the hero's cart has a headlamp: a lantern on the prow, with a soft beam ahead */
export function prowLamp(g, x, y, face, time) { const lx = x + face * 12; rc(g, lx - 1, y - 12, 3, 2, MP.i2); rc(g, lx - 1, y - 14, 3, 3, MP.l2); rc(g, lx, y - 14, 1, 1, MP.l3); add(g, () => { g.globalAlpha = 0.5; g.drawImage(glow(26, '255,190,90'), lx - 26, y - 38); }); }

/* ---------------- THE LANDMARKS UP CLOSE ---------------- */
export function scar(g, x, y, r, seed) {
  g.strokeStyle = '#0c0807'; g.lineWidth = 3; g.beginPath(); g.arc(x, y - r, r + 1, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = MP.r5; g.lineWidth = 1; g.beginPath(); g.arc(x, y - r, r, Math.PI * 1.05, Math.PI * 1.95); g.stroke();   /* the lit rim of a fresh cut */
  g.strokeStyle = '#2a1a10'; g.lineWidth = 1; g.beginPath(); g.arc(x, y - r, r * 0.6, 0, Math.PI * 2); g.stroke();   /* a second, inner ring */
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + seed; rc(g, x + Math.cos(a) * (r + 2), y - r + Math.sin(a) * (r + 2), 2, 2, '#050303'); }   /* the teeth's bites */
  g.fillStyle = '#0b0807'; g.beginPath(); g.arc(x, y - r, r * 0.4, 0, Math.PI * 2); g.fill();
}
export function spoil(g, x0, y, w) { for (let x = 0; x < w; x += 6) { const h = 2 + ((x * 7) % 5) + ((x * 3) % 3); rc(g, x0 + x, y - h, 6, h, (x / 6) & 1 ? MP.r4 : MP.r3); rc(g, x0 + x, y - h, 6, 1, MP.r6); if (((x * 5) % 11) === 0) rc(g, x0 + x + 2, y - h + 1, 2, 1, MP.cu2); } }
export function headlight(g, x, y, time) { const k = 0.5 + 0.5 * Math.sin(time * 9) * Math.sin(time * 2.3);
  add(g, () => { g.globalAlpha = 0.35 + 0.35 * k; g.drawImage(glow(60, '255,220,150'), R(x) - 60, R(y) - 60); g.globalAlpha = 0.5 + 0.4 * k; g.drawImage(glow(24, '255,245,210'), R(x) - 24, R(y) - 24); });
  rc(g, x - 3, y - 3, 6, 6, 'rgba(255,245,210,0.7)'); }
export function smelterHouse(g, x, y, time) {
  const k = 0.5 + 0.5 * Math.sin(time * 3);
  rc(g, x - 44, y - 40, 88, 40, '#241a18'); rc(g, x - 44, y - 40, 88, 2, MP.r6); rc(g, x - 44, y - 40, 2, 40, MP.r4); rc(g, x + 42, y - 40, 2, 40, MP.r1);   /* the walls */
  for (let yy = y - 36; yy < y; yy += 6) rc(g, x - 44, yy, 88, 1, MP.r1);
  rc(g, x - 26, y - 30, 52, 30, '#0a0605'); rc(g, x - 28, y - 32, 56, 3, MP.i2); rc(g, x - 28, y - 32, 56, 1, MP.i4);   /* the furnace mouth */
  rc(g, x - 22, y - 18, 44, 18, '#a8381c'); rc(g, x - 18, y - 14, 36, 14, MP.l1); rc(g, x - 12, y - 9, 24, 9, MP.l2); rc(g, x - 6, y - 5, 12, 5, MP.l3);
  add(g, () => { g.globalAlpha = 0.5 + 0.2 * k; g.drawImage(glow(70, '255,130,40'), x - 70, y - 20 - 70); });
  rc(g, x - 38, y - 48, 12, 8, MP.i1); rc(g, x - 38, y - 48, 12, 1, MP.i4);   /* a flue */
  rc(g, x - 44, y - 2, 88, 2, MP.i2);
  for (let i = 0; i < 5; i++) { const t = (time * 0.6 + i * 0.2) % 1; add(g, () => { g.globalAlpha = (1 - t) * 0.9; g.fillStyle = i % 2 ? MP.l2 : MP.l3; g.fillRect(R(x - 12 + i * 6 + Math.sin(time * 3 + i) * 3), R(y - 30 - t * 40), 1, 2); }); }
}
/* the bore's tunnel mouth up close: timber arch ribs over a black throat, the line running in */
export function boreArch(g, x, w, y) {
  rc(g, x, y - 130, w, 130, '#06040a');
  for (let i = 0; i < w; i += 22) { const cx_ = x + i + 11; g.strokeStyle = MP.t2; g.lineWidth = 3; g.beginPath(); g.arc(cx_, y - 60, 58, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); g.strokeStyle = MP.t4; g.lineWidth = 1; g.beginPath(); g.arc(cx_, y - 62, 58, Math.PI * 1.12, Math.PI * 1.5); g.stroke(); }
  rc(g, x, y - 128, w, 2, MP.r4);
}

/* ================================ THE GREAT DRILL ================================ */
/* THE BORE BEHIND THE FIGHT: the tunnel's lining - timber ribs and lagging running past at the cart's cruise, lamps in brackets on them, the floor's sleepers */
export function boreBack(g, x0, w, yCeil, yFloor, off, laneYs, highDown, time) {
  g.save(); g.beginPath(); g.rect(x0, yCeil, w, yFloor - yCeil); g.clip();
  rc(g, x0, yCeil, w, yFloor - yCeil, '#0e0a0c');
  for (let y = yCeil; y < yFloor; y += 9) { rc(g, x0, y, w, 1, '#1c1418'); }   /* the lagging planks, a dark course each */
  for (let x = -32; x < w + 32; x += 32) { const rx = x0 + x - off;
    rc(g, rx, yCeil, 7, yFloor - yCeil, MP.t2); rc(g, rx, yCeil, 1, yFloor - yCeil, MP.t4); rc(g, rx + 6, yCeil, 1, yFloor - yCeil, MP.t0); for (let y = yCeil + 8; y < yFloor; y += 17) rc(g, rx + 2, y, 3, 1, MP.t1);   /* the rib */
    rc(g, rx - 4, yCeil, 15, 3, MP.t3); rc(g, rx - 4, yCeil, 15, 1, MP.t5); rc(g, rx - 3, yCeil + 3, 3, 7, MP.t1); rc(g, rx + 7, yCeil + 3, 3, 7, MP.t1);   /* the cap and its braces */
    if (((x / 32) | 0) % 2 === 0) { const ly = yCeil + 30; rc(g, rx + 7, ly - 2, 5, 1, MP.i3); g.drawImage(lampSprite(true), rx + 11, ly - 1); add(g, () => { g.globalAlpha = 0.9; g.drawImage(glow(34, '255,160,64'), rx + 14 - 34, ly + 4 - 34); }); } }   /* a bracketed lamp on every other rib */
  for (let i = 0; i < 3; i++) { const y = laneYs[i]; if (i === 2 && highDown) { fallenHigh(g, x0, w, yCeil, yFloor, time); continue; }
    for (let x = -16; x < w + 16; x += 16) { rc(g, x0 + x - (off % 16) + 1, y - 1, 6, 3, MP.t1); rc(g, x0 + x - (off % 16) + 1, y - 1, 6, 1, MP.t3); }   /* the sleepers, running */
    rc(g, x0, y - 3, w, 1, MP.i4); rc(g, x0, y - 2, w, 1, MP.i2); }
  g.restore();
}
/* the toothed GEAR: a red cog with a dark bore, n teeth, turning (a stopped one is jammed grey-brown) */
function cog(g, x, y, r, a, col, colL, jam) {
  const n = 9; g.fillStyle = col; g.beginPath(); for (let i = 0; i < n * 2; i++) { const aa = a + i * Math.PI / n, rr = i % 2 ? r - 2 : r + 2; g.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); } g.closePath(); g.fill();
  g.fillStyle = colL; g.beginPath(); g.arc(x, y, r - 3, Math.PI * 1.05, Math.PI * 1.75); g.lineTo(x, y); g.fill();
  g.fillStyle = '#1c0a08'; g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill(); g.fillStyle = jam ? '#8a8a96' : '#d86a4a'; g.fillRect(R(x) - 1, R(y) - 1, 1, 1);
}
/* THE MACHINE: a riveted iron hull behind its cutting face (D = its front), the drivetrain gears on the LOW line (bare, red), the bit, the cab. jam = open (jammed), warded, hurt = flash */
export function drill(g, D, top, bot, gy, bitY, bitLen, cab, jam, warded, hurt, time, bitLane) {
  const flash = hurt ? '#ffffff' : null;
  /* the hull: riveted plates, a boiler's ribs, a smokestack venting through the roof */
  rc(g, D - 140, top, 140, bot - top, '#2e2c34'); rc(g, D - 140, top, 140, 3, MP.i4);
  for (let y = top + 8; y < bot; y += 16) { rc(g, D - 140, y, 140, 2, '#1c1a22'); rc(g, D - 140, y + 2, 140, 1, '#46444e'); for (let x = D - 136; x < D - 4; x += 12) { rc(g, x, y + 4, 2, 2, MP.i5); rc(g, x, y + 6, 2, 1, '#14121a'); } }
  for (let x = D - 140; x < D; x += 35) { rc(g, x, top, 3, bot - top, '#1a1820'); rc(g, x + 1, top, 1, bot - top, '#4a4854'); }
  rc(g, D - 120, top - 8, 22, 12, '#26242c'); rc(g, D - 120, top - 8, 22, 1, MP.i4); rc(g, D - 114, top - 22, 10, 16, '#1e1c24'); rc(g, D - 114, top - 22, 10, 1, MP.i4);   /* the stack */
  for (let i = 0; i < 4; i++) { const t = (time * 0.7 + i * 0.25) % 1; g.fillStyle = 'rgba(70,64,74,' + (0.5 * (1 - t)).toFixed(2) + ')'; g.fillRect(R(D - 114 + Math.sin(time * 2 + i) * 3 - t * 10), R(top - 22 - t * 30), 8 + R(t * 8), 8 + R(t * 6)); }
  rc(g, D - 100, bot - 28, 90, 28, '#1c1a22'); for (let x = D - 100; x < D - 10; x += 10) { rc(g, x, bot - 26, 4, 24, '#3a3844'); rc(g, x, bot - 26, 4, 1, MP.i5); }   /* the tread skirt at its foot */
  /* hazard flank on the hull, a warning stripe */
  for (let x = D - 138; x < D - 10; x += 8) for (let k = 0; k < 6; k++) rc(g, x + k, bot - 34 + (k >> 1), 1, 5 - (k >> 1), ((x - D) / 8 & 1) ? HAZ[0] : HAZ[1]);
  /* the cutting face: a plated front, a cutter wheel's hub behind the bit */
  rc(g, D - 10, top, 10, bot - top, flash || '#4a4856'); rc(g, D - 10, top, 2, bot - top, MP.i5); rc(g, D - 2, top, 2, bot - top, '#1a1820');
  /* the GEARS: a cutaway on the LOW line - an open panel and three bare red cogs */
  rc(g, D - 50, gy - 16, 48, 32, '#0e0a0c'); rc(g, D - 51, gy - 17, 50, 2, MP.i3); rc(g, D - 51, gy + 15, 50, 2, MP.i3); rc(g, D - 51, gy - 17, 2, 34, MP.i3); rc(g, D - 3, gy - 17, 2, 34, MP.i3);
  for (let i = 0; i < 3; i++) { const gx = D - 12 - i * 15, a = jam ? 0.2 * i : time * (3 - i * 0.4) * (i & 1 ? -1 : 1); cog(g, gx, gy, 8, a, jam ? '#6a4a3a' : '#c0302a', jam ? '#8a6a5a' : '#e8604a', jam); }
  if (jam) { add(g, () => { g.globalAlpha = 0.5; g.drawImage(glow(30, '255,200,80'), D - 27 - 30, gy - 30); }); for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(200,200,200,0.45)'; g.fillRect(D - 40 + ((i * 11 + R(time * 30)) % 36), gy - 18 - ((i * 7 + R(time * 40)) % 34), 4, 4); } }
  else add(g, () => { g.globalAlpha = 0.25 + 0.1 * Math.sin(time * 5); g.drawImage(glow(26, '255,70,50'), D - 27 - 26, gy - 26); });
  /* the BIT: a fluted cone, its spiral turning, carbide teeth along the flutes */
  const lenB = Math.max(6, bitLen), bh = 9;
  g.fillStyle = flash || '#9aa4b4'; g.beginPath(); g.moveTo(D, bitY - bh); g.lineTo(D + lenB, bitY); g.lineTo(D, bitY + bh); g.closePath(); g.fill();
  g.save(); g.beginPath(); g.moveTo(D, bitY - bh); g.lineTo(D + lenB, bitY); g.lineTo(D, bitY + bh); g.closePath(); g.clip();
  for (let i = -2; i < lenB / 7 + 2; i++) { const sx = D + i * 7 + ((time * 40) % 7); g.fillStyle = '#4a5260'; g.fillRect(R(sx), bitY - bh, 3, bh * 2); g.fillStyle = '#d8e0ec'; g.fillRect(R(sx) + 3, bitY - bh, 1, bh * 2); }
  g.fillStyle = '#c8d0dc'; g.fillRect(D, bitY - bh, lenB, 1); g.fillStyle = '#2a303a'; g.fillRect(D, bitY + bh - 1, lenB, 1); g.restore();
  rc(g, D - 4, bitY - bh - 2, 6, bh * 2 + 4, '#2a2830'); rc(g, D - 4, bitY - bh - 2, 6, 1, MP.i5);   /* the collar */
  if (lenB > 30) add(g, () => { g.globalAlpha = 0.5; g.fillStyle = '#ffd890'; for (let i = 0; i < 4; i++) g.fillRect(R(D + lenB - 3 + ((i * 5 + time * 90) % 12)), R(bitY - 6 + ((i * 7) % 12)), 2, 1); });   /* sparks off the point */
  /* THE CAB: an armoured box on the front over the MID and HIGH lines - the always-hittable part; an amber window with the goblin driver, a roof lamp, a hatch plate that blows when jammed */
  const cx0 = cab.x, ct = cab.t, cw = cab.w, ch = cab.h;
  rc(g, cx0, ct, cw, ch, flash || '#5a4a3c'); rc(g, cx0, ct, cw, 2, '#8a7660'); rc(g, cx0, ct, 2, ch, '#7a6650'); rc(g, cx0 + cw - 2, ct, 2, ch, '#2a2018');
  for (let y = ct + 8; y < ct + ch - 4; y += 12) { rc(g, cx0 + 2, y, cw - 4, 1, '#2a2018'); rc(g, cx0 + 3, y + 2, 1, 1, MP.i5); rc(g, cx0 + cw - 5, y + 2, 1, 1, MP.i5); }
  rc(g, cx0 + 3, ct + 6, cw - 6, 17, '#0e0a10'); rc(g, cx0 + 4, ct + 7, cw - 8, 15, jam ? '#ffd36b' : '#3a2410'); if (!jam) { rc(g, cx0 + 4, ct + 7, cw - 8, 15, '#e0a040'); rc(g, cx0 + 4, ct + 7, cw - 8, 2, '#f8d890'); }
  const gxm = cx0 + cw / 2;   /* the goblin: green head, a rusty helm, red eyes, a snarl */
  rc(g, gxm - 5, ct + 12, 10, 9, '#4a7a30'); rc(g, gxm - 5, ct + 12, 10, 1, '#6aa048'); rc(g, gxm - 6, ct + 10, 12, 3, '#6a3a1a'); rc(g, gxm - 6, ct + 10, 12, 1, '#a0602a'); rc(g, gxm - 3, ct + 15, 2, 2, '#ff4030'); rc(g, gxm + 1, ct + 15, 2, 2, '#ff4030'); rc(g, gxm - 3, ct + 19, 6, 1, '#101010'); rc(g, gxm - 2, ct + 18, 1, 1, '#e8e0c0'); rc(g, gxm + 1, ct + 18, 1, 1, '#e8e0c0');
  rc(g, gxm - 5, ct + 7, 10, 15, 'rgba(255,255,255,0.0)'); rc(g, cx0 + 3, ct + 6, 2, 17, '#14101a'); rc(g, cx0 + cw - 5, ct + 6, 2, 17, '#14101a');   /* window bars */
  rc(g, cx0 + 4, ct + 28, cw - 8, 10, jam ? '#c89a30' : '#3e342c'); rc(g, cx0 + 4, ct + 28, cw - 8, 1, jam ? '#fff0a0' : '#6a5a4a'); for (let i = 0; i < 3; i++) rc(g, cx0 + 6 + i * 6, ct + 31, 3, 4, jam ? '#8a6a20' : '#1c1612');   /* the hatch (blown gold when jammed) */
  rc(g, cx0 + 4, ct - 5, cw - 8, 5, '#2a2018'); rc(g, cx0 + 4, ct - 5, cw - 8, 1, '#8a7660'); rc(g, gxm - 3, ct - 9, 6, 5, MP.i2); rc(g, gxm - 2, ct - 8, 4, 3, '#fff0b0');   /* the roof lamp */
  add(g, () => { g.globalAlpha = 0.7; g.drawImage(glow(34, '255,220,140'), R(gxm) - 34, ct - 7 - 34); });
  if (warded) { g.fillStyle = 'rgba(200,216,232,0.55)'; g.fillRect(cx0 - 2, ct - 2, cw + 4, ch + 4); for (let i = 0; i < 4; i++) { rc(g, cx0 - 2, ct + i * (ch / 4), cw + 4, 2, 'rgba(240,248,255,0.8)'); } }
}
/* the TIPPLER CHUTE over the far end */
export function chute(g, x, y, active, lineY, time) {
  rc(g, x - 14, y, 28, 8, MP.i2); rc(g, x - 14, y, 28, 1, MP.i4); rc(g, x - 10, y + 8, 20, 20, MP.t2); rc(g, x - 10, y + 8, 1, 20, MP.t4); rc(g, x + 9, y + 8, 1, 20, MP.t0);
  for (let k = 0; k < 4; k++) rc(g, x - 9, y + 11 + k * 5, 18, 1, MP.t1);
  rc(g, x - 13, y + 26, 26, 4, MP.i3); rc(g, x - 13, y + 26, 26, 1, MP.i5);
  for (let i = -8; i <= 8; i += 8) for (let k = 0; k < 4; k++) rc(g, x + i + k - 2, y + 2, 1, 4 - (k >> 1), (((i + 8) / 8) & 1) ? HAZ[0] : HAZ[1]);
  if (active) add(g, () => { g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 20); g.drawImage(glow(26, '255,200,80'), x - 26, y + 28 - 26); g.fillStyle = 'rgba(255,211,107,0.55)'; g.fillRect(x - 14, lineY - 2, 28, 2); });
}
/* THE POINTS MAST: a signal mast with a lamp (gold = to the gears, blue = clear) and a lever */
export function mast(g, px_, topY, botY, set, time) {
  rc(g, px_ - 2, topY, 4, botY - topY, MP.i1); rc(g, px_ - 2, topY, 1, botY - topY, MP.i3); rc(g, px_ + 1, topY, 1, botY - topY, MP.i0);
  const c = set ? '#ffd36b' : '#7fc4e0'; rc(g, px_ - 8, topY - 12, 16, 16, MP.i1); rc(g, px_ - 8, topY - 12, 16, 1, MP.i4); rc(g, px_ - 8, topY - 12, 1, 16, MP.i3);
  g.fillStyle = c; g.beginPath(); g.arc(px_, topY - 4, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(px_ - 3, topY - 8, 3, 2);
  g.fillStyle = DARK; if (set) { g.fillRect(px_ - 1, topY - 8, 2, 8); g.fillRect(px_ - 3, topY - 6, 6, 1); } else { g.fillRect(px_ - 1, topY - 8, 2, 8); g.fillRect(px_ - 3, topY - 1, 6, 1); }
  add(g, () => { g.globalAlpha = 0.5 + 0.1 * Math.sin(time * 5); g.drawImage(glow(26, set ? '255,200,80' : '120,190,255'), px_ - 26, topY - 4 - 26); });
  rc(g, px_ - 7, botY - 6, 14, 6, MP.t1); rc(g, px_ - 7, botY - 6, 14, 1, MP.t3);
}

/* ---------------- A SLOPE'S RAIL: the line laid up a ramp, its sleepers and iron following the surface ---------------- */
export function slopeRail(g, sx, sy, t, heightAt) {
  for (let xx = 0; xx < 16; xx++) { const h = R(heightAt(t, xx + 0.5)); if ((xx & 7) >= 1 && (xx & 7) <= 4) rc(g, sx + xx, sy + h - 1, 1, 3, MP.t1); rc(g, sx + xx, sy + h - 3, 1, 1, MP.i5); rc(g, sx + xx, sy + h - 2, 1, 1, MP.i3); }
}
/* ---------------- THE LANTERN STRING: a lamp post with an arm and a hung lantern; a wire sagging to the next post (`next` = true) with a bulb every 24 px ---------------- */
export function lampPost(g, x, y, time, seed, next) {
  rc(g, x, y - 40, 2, 38, MP.t1); rc(g, x, y - 40, 1, 38, MP.t3); rc(g, x - 2, y - 3, 6, 3, MP.t1); rc(g, x - 2, y - 40, 8, 2, MP.t2); rc(g, x + 5, y - 40, 1, 4, MP.i3);   /* the pole, its foot, its arm and hook */
  lantern(g, x + 5.5, y - 36, time, seed);
  if (next) { const x1 = x + 96; let px0 = x + 6, py0 = y - 38;
    for (let i = 1; i <= 24; i++) { const t = i / 24, lx = x + 6 + 90 * t, ly = y - 38 + Math.sin(t * Math.PI) * 7 + Math.sin(time * 1.2 + seed) * 0.5; rc(g, lx, ly, 1, 1, MP.i2); if (i % 6 === 0 && i < 24) { rc(g, lx, ly + 1, 1, 2, MP.i2); rc(g, lx - 1, ly + 3, 3, 2, MP.l2); rc(g, lx, ly + 3, 1, 1, MP.l3); add(g, () => { g.globalAlpha = 0.75; g.drawImage(glow(18, '255,160,64'), R(lx) - 18, R(ly) - 13); }); } } }
}

/* P3: THE ROOF TAKES THE HIGH LINE - a ragged gap torn in the roof where its rail hung, snapped sleepers and rail ends dangling off the tunnel's ribs, the heap of it on the floor, dust still coming down */
function fallenHigh(g, x0, w, yCeil, yFloor, time) {
  for (let x = 0; x < w; x += 5) { const h = 8 + ((x * 13) % 17) + ((x * 7) % 5); rc(g, x0 + x, yCeil, 5, h, '#06040a'); rc(g, x0 + x, yCeil + h, 5, 2, MP.r5); if ((x / 5) % 4 === 1) { rc(g, x0 + x + 1, yCeil + h + 2, 2, 12 + (x % 9), MP.t2); rc(g, x0 + x + 1, yCeil + h + 2, 1, 12 + (x % 9), MP.t4); } }
  for (let x = 0; x < w; x += 7) { const h = 5 + ((x * 11) % 13); rc(g, x0 + x, yFloor - h, 8, h, ((x / 7) | 0) & 1 ? '#5e4a38' : '#4a3a2c'); rc(g, x0 + x, yFloor - h, 8, 1, '#8a7660'); rc(g, x0 + x + 7, yFloor - h, 1, h, MP.r1); }
  for (let x = 20; x < w; x += 61) { rc(g, x0 + x, yFloor - 16, 22, 3, MP.t2); rc(g, x0 + x, yFloor - 16, 22, 1, MP.t4); rc(g, x0 + x + 20, yFloor - 20, 3, 5, MP.t1); rc(g, x0 + x + 3, yFloor - 14, 18, 1, MP.i4); }   /* a snapped tie and a bent rail in the heap */
  for (let i = 0; i < 14; i++) { const t = (time * 0.9 + i * 0.37) % 1; g.fillStyle = 'rgba(140,120,100,' + (0.55 * (1 - t)).toFixed(2) + ')'; g.fillRect(R(x0 + ((i * 37) % w)), R(yCeil + 20 + t * (yFloor - yCeil - 30)), 2, 2); }
}

/* THE LANTERN STRINGS' PLAN: where the lamp posts stand (pure: the level's own lists and a cell reader), used by the hands to draw and by tools/minecart-aloft.mjs to assert every post stands on a rail bed with clear air over it. [[x, row, nextPostSixTilesOn]] */
export function lampPlan(L, cellGet, T, x0c, x1c) {
  const gx = []; for (const k of L.mcCrushers) gx.push([k.x - 2, k.x + k.w + 2]); for (const gt of L.mcGates) gx.push([gt.x - 3, gt.x + 3]); for (const b of L.mcBeams) gx.push([b.x0 - 3, b.x1 + 3]); for (const r of L.mcRocks) gx.push([r.x - 2, r.x + r.w + 2]); for (const p of L.mcPoints) gx.push([p.x - 2, p.x + 2]); for (const bg of L.mcBoost || []) gx.push([bg.x0 - 5, bg.x1 + 3]);
  const posts = new Map(); for (const [a, b, row] of L.mcTrack) for (let x = Math.max(a + 1, x0c - 8); x <= Math.min(b - 1, x1c + 8); x++) { if (x % 6 !== 0) continue; const t0 = cellGet(x, row); if (!(t0 === T.SOLID || t0 === T.RAIL)) continue;
    let clear = true; for (let k = 1; k <= 4 && clear; k++) if (cellGet(x, row - k) !== T.AIR) clear = false; if (!clear || gx.some(([p0, p1]) => x >= p0 && x <= p1)) continue; posts.set(x + ',' + row, [x, row]); }
  return [...posts.values()].map(([x, row]) => [x, row, posts.has((x + 6) + ',' + row)]);
}

/* THE BESTIARY CARD (batch80 integ-2): the machine drawn once, whole, and shrunk to a card - the Great Drill draws itself live (src/great-drill-hands.js), so the bestiary had no sprite for it
   (textfit: "Cannot read properties of null (reading 'R')" on the BOSSES tab). Same shape as the Lantern-Eater's card. */
export function bakeDrillCard() {
  const [big, bg] = canvas(200, 130);
  drill(bg, 140, 30, 120, 72, 64, 44, { x: 34, t: 44, w: 52, h: 26 }, false, false, false, 0, 1);
  const [c, g] = canvas(80, 52); g.imageSmoothingEnabled = false; g.drawImage(big, 0, 0, 200, 130, 0, 0, 80, 52);
  return { R: [c], L: [c], w: 76, h: 48 };
}

/* ================= DEEP RAILS 2 (claude/deeprails2): the hero's cart redrawn, the new set pieces ================= */
/* THE HERO'S CART: a real mine cart - a riveted iron tub, flared, with a thick rolled rim; two spoked wheels that turn with the pace; brake shoes that throw sparks.
   part 'back': the back wall and the dark inside (drawn BEFORE the hero, so he sits IN it); 'front': the front wall over his legs, the rim, the wheels; 'whole' / 'empty'
   both (a parked cart, a wreck). x, y: the rail under its middle. duck: 1 when he is down in the tub (the front rim comes up a pixel) */
export function heroCart(g, x, y, face, v, braking, duck, time, part) {
  x = R(x); y = R(y);
  const W = 12, top = y - 11, rimY = top + (duck ? -1 : 0);
  const back = part === 'back' || part === 'whole' || part === 'empty', front = part === 'front' || part === 'whole' || part === 'empty';
  if (back) { rc(g, x - W + 1, top - 3, W * 2 - 2, 4, MP.i1); rc(g, x - W + 1, top - 3, W * 2 - 2, 1, MP.i3);   /* the far rim, behind him */
    rc(g, x - W + 2, top, W * 2 - 4, 6, '#0c0a0e'); rc(g, x - W + 2, top, W * 2 - 4, 1, MP.i0); }                /* the dark inside of the tub */
  if (!front) return;
  /* the tub: flared sides (wider at the rim), riveted iron plates, a rust bloom */
  for (let i = 0; i < 7; i++) { const hw = W - (i > 4 ? i - 4 : 0); rc(g, x - hw, rimY + 2 + i, hw * 2, 1, i < 1 ? MP.i4 : i < 4 ? MP.i3 : MP.i2); }
  rc(g, x - W - 1, rimY, W * 2 + 2, 3, MP.i1); rc(g, x - W - 1, rimY, W * 2 + 2, 1, MP.i5); rc(g, x - W - 1, rimY + 2, W * 2 + 2, 1, MP.i0);   /* the rolled rim */
  for (const px of [x - 9, x - 3, x + 3, x + 9]) { rc(g, px, rimY + 4, 1, 1, MP.i5); rc(g, px, rimY + 7, 1, 1, MP.i4); }                        /* rivets */
  rc(g, x - 1, rimY + 3, 1, 5, MP.i1);                                                                                                    /* the plate seam */
  rc(g, x + 5 * face, rimY + 6, 3, 2, MP.t3); rc(g, x - 8 * face, rimY + 5, 2, 1, MP.t3);                                                  /* rust */
  rc(g, x - W - 3, y - 6, 3, 2, MP.i2); rc(g, x + W, y - 6, 3, 2, MP.i2);                                                                 /* the couplings */
  /* the wheels: spoked, turning with the pace; the brake shoe on the rear one */
  const a = time * (v || 0) / 4.5;
  for (const wx of [x - 7, x + 7]) { rc(g, wx - 4, y - 5, 8, 6, '#0c0a0a'); rc(g, wx - 3, y - 6, 6, 8, '#0c0a0a'); rc(g, wx - 3, y - 5, 6, 1, MP.i3);
    for (let s = 0; s < 2; s++) { const sa = a + s * Math.PI / 2; rc(g, wx + R(Math.cos(sa) * 2.4), y - 2 + R(Math.sin(sa) * 2.4), 1, 1, MP.i4); rc(g, wx - R(Math.cos(sa) * 2.4), y - 2 - R(Math.sin(sa) * 2.4), 1, 1, MP.i4); }
    rc(g, wx, y - 2, 1, 1, MP.i5); }
  if (braking) { const bx = x - 7 * face; rc(g, bx - face * 5, y - 4, 2, 4, MP.l2); add(g, () => { g.globalAlpha = 0.7; g.drawImage(glow(8, '255,190,90'), bx - face * 5 - 8, y - 10); });   /* the shoe biting, glowing */
    for (let i = 0; i < 3; i++) { const t = (time * 9 + i * 0.33) % 1; rc(g, bx - face * (6 + t * 14), y - 1 - t * 6 + (i - 1) * 2, 1, 1, i === 1 ? MP.l3 : MP.go2); } }
  if (part === 'empty') { rc(g, x - 8, rimY - 1, 3, 2, MP.cu1); rc(g, x + 2, rimY - 2, 4, 3, '#3e2e26'); }
}
/* THE FOREMAN'S ARMOURED CART: a squat iron wagon, plated, a ram's beak at the back (facing you), a lamp on a pole - a plate dented a ram (rams 0..3); stunned: it rocks */
export function armourCart(g, x, y, time, v, rams, stun) {
  x = R(x + (stun ? (Math.floor(time * 30) % 2 ? 1 : -1) : 0)); y = R(y);
  rc(g, x - 16, y - 16, 32, 13, MP.i0); rc(g, x - 15, y - 15, 30, 11, MP.i2); rc(g, x - 15, y - 15, 30, 1, MP.i4);
  for (let i = 0; i < 3; i++) { const px = x - 15 + i * 10, dent = i < (rams || 0); rc(g, px + 1, y - 13, 8, 7, dent ? MP.i1 : MP.i3); rc(g, px + 1, y - 13, 8, 1, dent ? MP.i2 : MP.i5); if (dent) { rc(g, px + 3, y - 10, 3, 2, MP.i0); rc(g, px + 6, y - 12, 1, 3, MP.i0); } }
  for (let i = -13; i <= 13; i += 4) rc(g, x + i, y - 5, 1, 1, MP.i5);
  rc(g, x - 21, y - 11, 5, 5, MP.i3); rc(g, x - 23, y - 10, 2, 3, MP.i4); rc(g, x - 21, y - 11, 5, 1, MP.i5);   /* the ram's beak, at the back */
  rc(g, x + 12, y - 30, 1, 15, MP.t2); rc(g, x + 10, y - 33, 5, 4, MP.l1); rc(g, x + 11, y - 32, 3, 2, MP.l3); add(g, () => { g.globalAlpha = 0.5 + 0.2 * Math.sin(time * 6); g.drawImage(glow(14, '255,120,40'), x - 2, y - 45); });
  rc(g, x - 16, y - 19, 32, 3, HAZ[0]); for (let i = 0; i < 32; i += 6) rc(g, x - 16 + i, y - 19, 3, 3, HAZ[1]);   /* its hazard rail */
  const a = time * (v || 0) / 5; for (const wx of [x - 10, x, x + 10]) { rc(g, wx - 3, y - 4, 6, 5, '#0c0a0a'); rc(g, wx + R(Math.cos(a) * 1.5), y - 2, 1, 1, MP.i4); }
}
/* A RAIL THAT BREAKS: rotten sleepers, a sagging rail; `shaking` when the break is close behind it */
export function rottenRail(g, sx, sy, seed, shaking) { const j = shaking ? (hash(seed, 3) & 1 ? 1 : 0) : 0;
  rc(g, sx, sy - 2 + j, 16, 2, MP.t1); rc(g, sx + 2 + (seed % 3), sy + j, 4, 3, MP.t0); rc(g, sx + 10, sy + j, 3, 2, MP.t2);
  rc(g, sx, sy - 3 + j, 16, 1, MP.i2); rc(g, sx + (hash(seed, 9) % 12), sy - 3 + j, 2, 1, MP.t3);   /* the rail, rust-bitten */
  if (hash(seed, 5) % 3 === 0) { rc(g, sx + 7, sy - 2, 1, 4, MP.r0); rc(g, sx + 8, sy + 1, 1, 2, MP.r0); } }
export function railDebris(g, x, y, t, seed) { const a = Math.max(0, 1 - t / 1.2); g.globalAlpha = a; rc(g, x - 5 + (seed % 5), y - 2, 7, 2, MP.t2); rc(g, x - 3, y + 2, 4, 2, MP.t1); rc(g, x + 2, y - 4, 5, 1, MP.i2); g.globalAlpha = 1; }
export function breakFront(g, x, y, time) { add(g, () => { g.globalAlpha = 0.35; g.drawImage(glow(14, '255,190,120'), x - 14, y - 16); }); for (let i = 0; i < 5; i++) { const t = (time * 3 + i * 0.2) % 1; rc(g, x + (i - 2) * 3, y + t * 30, 2, 2, i & 1 ? MP.t2 : MP.r4); } }
/* A THROWER'S LEDGE: a shelf of rock with a lip, a timber prop under it */
export function ledge(g, x, w, y, seed) { rc(g, x, y, w, 16, MP.r2); rc(g, x, y, w, 2, MP.r5); rc(g, x, y + 15, w, 1, MP.r0); for (let i = 3; i < w; i += 9) rc(g, x + i, y + 4 + (hash(seed, i) % 7), 3, 2, MP.r3);
  rc(g, x + R(w / 2) - 1, y + 16, 3, 18, MP.t2); rc(g, x + R(w / 2) - 1, y + 16, 1, 18, MP.t3); }
/* A BUFFER STOP: a timber block on iron, with a hazard face (soft: the line's end at the lift - a plain stop) */
export function buffer(g, x, y, soft, time) { rc(g, x + 2, y - 14, 12, 14, MP.t1); rc(g, x + 2, y - 14, 12, 2, MP.t3); rc(g, x, y - 12, 4, 8, MP.i3); rc(g, x, y - 12, 4, 1, MP.i5);
  if (!soft) for (let i = 0; i < 12; i += 4) rc(g, x + 2 + i, y - 10, 2, 6, HAZ[0]);
  const on = Math.floor(time * 3) % 2; rc(g, x + 6, y - 19, 4, 4, on ? '#ff6b6b' : '#5a1a14'); if (on) add(g, () => { g.globalAlpha = 0.6; g.drawImage(glow(10, '255,80,60'), x - 2, y - 27); }); }
/* THE LIFT: its shaft (two iron guides and a counterweight chain), the cage where the mover is */
export function liftShaft(g, x, w, yTop, yBot, cageY, time) { for (const gx of [x - 3, x + w + 1]) { rc(g, gx, yTop - 30, 2, yBot - yTop + 30, MP.i2); rc(g, gx, yTop - 30, 1, yBot - yTop + 30, MP.i4); }
  rc(g, x - 6, yTop - 34, w + 12, 5, MP.t2); rc(g, x - 6, yTop - 34, w + 12, 1, MP.t4); rc(g, x + R(w / 2) - 5, yTop - 40, 10, 6, MP.i3);   /* the head frame and its wheel */
  if (cageY !== null) { rc(g, x + R(w / 2), yTop - 34, 1, Math.max(0, cageY - yTop + 6), MP.i3);
    rc(g, x, cageY - 22, w, 1, MP.i4); for (let i = 0; i <= w; i += 6) rc(g, x + i, cageY - 22, 1, 22, MP.i3); rc(g, x, cageY - 1, w, 2, MP.i4); } }
/* A LAUNCH RAMP's kicker on the lip: iron plates up on blocks, chevrons that flash as you near */
export function kicker(g, x, y, flash, time) { for (let i = 0; i < 12; i++) rc(g, x - 24 + i * 2, y - 1 - R(i * 0.6), 2, 2 + R(i * 0.6), i > 9 ? MP.i4 : MP.i3);
  rc(g, x - 2, y - 9, 3, 9, MP.t2); for (let i = 0; i < 3; i++) rc(g, x - 20 + i * 6, y - 4 - i * 2, 3, 1, flash ? MP.go3 : MP.go1); }
/* THE FLOOD: black water under the trestles, a cold sheen and slow rings */
export function flood(g, x0, x1, y, vh, time) { if (y > vh) return; const a = Math.max(-16, x0), b = Math.max(a, x1); rc(g, a, y, b - a, vh - y + 4, '#05080c');
  for (let i = a - (((a % 12) + 12) % 12); i < b; i += 12) { const w = 6 + R(3 * Math.sin(time * 1.3 + i * 0.07)); rc(g, i, y, w, 1, '#1e3446'); if ((Math.floor(i / 12) + Math.floor(time * 2)) % 7 === 0) rc(g, i + 3, y + 3, 4, 1, '#14283a'); } }
/* THE LAVA in the glow cavern's pit: a bright crust, a pulse, and its light up the walls */
export function lava(g, x0, x1, y, vh, time) { const a = Math.max(-20, x0), b = x1; if (b < -20 || y > vh) return; rc(g, a, y, b - a, vh - y + 4, '#5a1206');
  for (let i = a; i < b; i += 6) { const k = 0.5 + 0.5 * Math.sin(time * 2.4 + i * 0.13); rc(g, i, y + R(2 * Math.sin(time + i)), 6, 2, k > 0.6 ? MP.l3 : MP.l2); rc(g, i + 2, y + 4, 3, 2, MP.l1); }
  add(g, () => { g.globalAlpha = 0.45 + 0.1 * Math.sin(time * 3); const gl = glow(40, '255,110,40'); for (let i = a; i < b; i += 48) g.drawImage(gl, i - 16, y - 50); }); }
/* A LOB: the thrown pick (a turning head and haft) or the foreman's bomb (a lit fuse); its MARK where it will land (a ring that closes, red at the end) */
export function lobbed(g, x, y, bomb, time) { if (bomb) { rc(g, x - 3, y - 3, 6, 6, '#1a1612'); rc(g, x - 2, y - 3, 3, 1, '#5a5a5a'); rc(g, x + 2, y - 5, 1, 2, MP.t3); if (Math.floor(time * 20) % 2) rc(g, x + 2, y - 6, 1, 1, MP.l3); return; }
  const a = time * 14; rc(g, x - 1, y - 1, 2, 2, MP.t3); rc(g, x + R(Math.cos(a) * 4), y + R(Math.sin(a) * 4), 2, 2, MP.i4); rc(g, x - R(Math.cos(a) * 3), y - R(Math.sin(a) * 3), 1, 1, MP.t2); }
export function lobMark(g, x, y, r, k, time) { const rr = R(r * (1.6 - 0.6 * k)), col = k > 0.75 ? (Math.floor(time * 16) % 2 ? '#ff6b6b' : '#ffd36b') : '#ffd36b'; g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 1, rr, 3, 0, 0, Math.PI * 2); g.stroke();
  rc(g, x - 1, y - 8, 2, 4, col); rc(g, x - 1, y - 3, 2, 1, col); }

/* ================= GREAT DRILL 2 (claude/deeprails2): THE ENDLESS TUNNEL and THE RIG ================= */
/* THE TUNNEL: one seamless loop (Daniel 10-09: "no half-moving scenery") - the rock over the roof, the far wall at half pace, the timber ribs and their lamps, the floor, and
   the three lines (the LOW on the floor, the MID and HIGH on iron brackets off the ribs), every near thing running past at the same `scroll`. Drawn edge to edge, x0..x1 */
export function tunnel(g, x0, x1, yCeil, yFloor, vh, scroll, laneYs, highDown, time) {
  const w = x1 - x0; if (w <= 0) return; g.save(); g.beginPath(); g.rect(x0, 0, w, vh); g.clip();
  rc(g, x0, 0, w, vh, MP.r0);
  /* the rock over the roof and under the floor: courses of broken block, near pace */
  const off = scroll % 48, far = (scroll * 0.5) % 64;
  for (const [ya, yb] of [[0, yCeil], [yFloor, vh + 4]]) { for (let y = ya; y < yb; y += 8) { const row = Math.floor((y - ya) / 8); for (let x = x0 - 48 - ((off + row * 13) % 24); x < x1 + 24; x += 24) { rc(g, x, y, 23, 7, row & 1 ? MP.r2 : MP.r1); rc(g, x, y, 23, 1, MP.r3); } } }
  /* the far wall inside the tunnel: dark rock with ore flecks, at half pace */
  rc(g, x0, yCeil, w, yFloor - yCeil, '#0e0a0c');
  for (let x = x0 - 64 - far; x < x1 + 64; x += 64) { for (let k = 0; k < 5; k++) { const hx = x + ((k * 37) % 60), hy = yCeil + 10 + ((k * 23) % Math.max(10, yFloor - yCeil - 20)); rc(g, hx, hy, 9, 5, '#171217'); rc(g, hx + 2, hy + 1, 2, 1, k % 2 ? MP.cu1 : MP.go1); } }
  for (let y = yCeil + 6; y < yFloor; y += 11) rc(g, x0, y, w, 1, '#16101a');
  /* the ribs: a timber set every 48 px, cap and braces, a lamp on every other one - near pace */
  for (let x = x0 - 48 - off, i = 0; x < x1 + 48; x += 48, i++) { const k = Math.floor((x + scroll) / 48);
    rc(g, x, yCeil, 7, yFloor - yCeil, MP.t2); rc(g, x, yCeil, 1, yFloor - yCeil, MP.t4); rc(g, x + 6, yCeil, 1, yFloor - yCeil, MP.t0); for (let y = yCeil + 8; y < yFloor; y += 17) rc(g, x + 2, y, 3, 1, MP.t1);
    rc(g, x - 5, yCeil, 17, 4, MP.t3); rc(g, x - 5, yCeil, 17, 1, MP.t5); rc(g, x - 4, yCeil + 4, 3, 8, MP.t1); rc(g, x + 8, yCeil + 4, 3, 8, MP.t1);
    for (let l = 1; l < 3; l++) { if (l === 2 && highDown) continue; const ly = laneYs[l]; rc(g, x + 6, ly + 1, 9, 2, MP.i2); rc(g, x + 6, ly + 1, 9, 1, MP.i4); rc(g, x + 13, ly + 3, 2, 5, MP.i2); }   /* the brackets the high lines hang on */
    if ((((k % 2) + 2) % 2) === 0) { const ly = yCeil + 22; rc(g, x + 7, ly - 2, 5, 1, MP.i3); g.drawImage(lampSprite(true), x + 11, ly - 1); add(g, () => { g.globalAlpha = 0.85; g.drawImage(glow(34, '255,160,64'), x + 14 - 34, ly + 4 - 34); }); } }
  /* the floor's lip and the three lines: sleepers running at the near pace, the iron along them */
  rc(g, x0, yFloor, w, 2, MP.r4); rc(g, x0, yFloor, w, 1, MP.r6);
  for (let i = 0; i < 3; i++) { const y = laneYs[i]; if (i === 2 && highDown) { fallenHigh(g, x0, w, yCeil, yFloor, time); continue; }
    for (let x = x0 - 16 - (scroll % 16); x < x1 + 16; x += 16) { rc(g, x + 1, y - 1, 7, 3, MP.t1); rc(g, x + 1, y - 1, 7, 1, MP.t3); }
    rc(g, x0, y - 3, w, 1, MP.i4); rc(g, x0, y - 2, w, 1, MP.i2); }
  g.restore();
}
/* THE RIG (Daniel 10-09: "a goblin driving a conventional drill rig"): its REAR faces you at rx (screen x) and its body runs on to the right - the gear housing low on the
   LOW line (an open panel, three bare red cogs, a striped ram plate), a deck at the MID line, the CAB on the deck (an amber window, the goblin driver looking back at you,
   a roof lamp), the engine block and its smokestack (smoke), the tracks and road wheels under all of it, and the conical BIT on the front drilling the rock face ahead.
   o: { jam, ward, hurt, rev, spray: { lane, on, k } | null, moving, scroll, plateW, plateH, cabIn, cabW, ph } */
export function rig(g, rx, lanes, ceilY, o, time) {
  const L0 = lanes[0], L1 = lanes[1], L2 = lanes[2], flash = o.hurt ? '#ffffff' : null, pw = o.plateW, ph = o.plateH, ci = o.cabIn, cw = o.cabW, bodyR = rx + 170, top = L1 - (o.cabH || 40);   /* (its roof under the HIGH line: that line runs on over it to the stack) */
  /* the rock face it is boring into, and its spoil flying back */
  rc(g, bodyR + 66, ceilY - 40, 400, L0 - ceilY + 80, MP.r1); for (let y = ceilY; y < L0 + 30; y += 9) rc(g, bodyR + 66 + ((y * 7) % 8), y, 400, 1, MP.r2);
  for (let i = 0; i < 8; i++) { const t = (time * 2.2 + i * 0.125) % 1; rc(g, bodyR + 60 - t * 40 + ((i * 13) % 20), (L1 + L0) / 2 - 20 + ((i * 29) % 40) - t * 10 + t * t * 30, 3, 2, i % 3 ? MP.r5 : MP.go1); }
  /* the tracks under the whole rig: a run of links that turns while it drives, road wheels in it */
  const tOff = o.moving ? (o.scroll * 1.0) % 8 : 0;
  rc(g, rx + 8, L0 - 14, bodyR - rx + 20, 14, '#14121a'); for (let x = rx + 8 - tOff; x < bodyR + 28; x += 8) rc(g, Math.max(rx + 8, x), L0 - 14, 3, 14, '#2c2a34');
  rc(g, rx + 8, L0 - 14, bodyR - rx + 20, 1, MP.i4); for (let x = rx + 22; x < bodyR + 20; x += 26) { rc(g, x - 6, L0 - 11, 12, 10, MP.i2); rc(g, x - 1, L0 - 7, 2, 2, MP.i5); const a = o.moving ? time * 8 : 0; rc(g, x + R(Math.cos(a) * 3), L0 - 6 + R(Math.sin(a) * 3), 1, 1, MP.i4); }
  /* the engine block and boiler (the body), riveted, a hazard flank */
  const bx = rx + ci + cw;
  rc(g, bx, top, bodyR - bx, L0 - 14 - top, flash || '#2e2c34'); rc(g, bx, top, bodyR - bx, 3, MP.i4);
  for (let y = top + 9; y < L0 - 16; y += 15) { rc(g, bx, y, bodyR - bx, 2, '#1c1a22'); rc(g, bx, y + 2, bodyR - bx, 1, '#46444e'); for (let x = bx + 4; x < bodyR - 4; x += 12) rc(g, x, y + 4, 2, 2, MP.i5); }
  for (let x = bx + 6; x < bodyR - 8; x += 8) for (let k = 0; k < 6; k++) rc(g, x + k, L0 - 22 + (k >> 1), 1, 5 - (k >> 1), ((x - bx) / 8 & 1) ? HAZ[0] : HAZ[1]);
  /* the smokestack up through the roof, and its smoke (it puffs harder in P3) */
  const sx = rx + (o.stackX || 150) - 2; rc(g, sx, ceilY - 6, 14, top - ceilY + 6, '#1e1c24'); rc(g, sx, ceilY - 6, 2, top - ceilY + 6, MP.i4); rc(g, sx - 3, top - 4, 20, 5, '#26242c'); rc(g, sx - 3, top - 4, 20, 1, MP.i4);
  for (let i = 0; i < (o.ph === 3 ? 6 : 4); i++) { const t = (time * 0.9 + i * 0.22) % 1; g.fillStyle = 'rgba(70,64,74,' + (0.55 * (1 - t)).toFixed(2) + ')'; g.fillRect(R(sx + 3 + Math.sin(time * 2 + i) * 4 - t * 30), R(ceilY + 4 + t * 20), 9 + R(t * 10), 7 + R(t * 6)); }
  /* the BIT on the front: a big fluted cone, its spiral turning, its teeth biting the face */
  const by = (L1 + L0) / 2 - 6, bh = 26, bl = 66, bf = bodyR;
  rc(g, bf - 6, by - bh - 4, 10, bh * 2 + 8, '#2a2830'); rc(g, bf - 6, by - bh - 4, 10, 1, MP.i5);
  g.fillStyle = flash || '#9aa4b4'; g.beginPath(); g.moveTo(bf + 4, by - bh); g.lineTo(bf + 4 + bl, by); g.lineTo(bf + 4, by + bh); g.closePath(); g.fill();
  g.save(); g.beginPath(); g.moveTo(bf + 4, by - bh); g.lineTo(bf + 4 + bl, by); g.lineTo(bf + 4, by + bh); g.closePath(); g.clip();
  const spin = o.jam ? 0 : (time * 60) % 10; for (let i = -2; i < bl / 10 + 2; i++) { const xx = bf + 4 + i * 10 + spin; g.fillStyle = '#4a5260'; g.fillRect(R(xx), by - bh, 4, bh * 2); g.fillStyle = '#d8e0ec'; g.fillRect(R(xx) + 4, by - bh, 1, bh * 2); }
  g.restore(); if (!o.jam) add(g, () => { g.globalAlpha = 0.6; g.fillStyle = '#ffd890'; for (let i = 0; i < 6; i++) g.fillRect(R(bf + bl - 2 + ((i * 5 + time * 90) % 14)), R(by - 8 + ((i * 7) % 16)), 2, 1); });
  /* the GEAR HOUSING on the LOW line: an iron box, an open panel with three bare red cogs (jammed: grey-brown, smoking), the striped RAM PLATE on its rear face */
  rc(g, rx, L0 - ph, pw, ph - 12, flash || '#3a3844'); rc(g, rx, L0 - ph, pw, 2, MP.i4);
  rc(g, rx + 3, L0 - ph + 4, 40, ph - 18, '#0e0a0c'); rc(g, rx + 2, L0 - ph + 3, 42, 1, MP.i3);
  for (let i = 0; i < 3; i++) { const gx = rx + 10 + i * 13, gy = L0 - ph / 2 - 5 + (i & 1 ? 3 : -2), a = o.jam ? 0.25 * i : time * (3 - i * 0.4) * (i & 1 ? -1 : 1); cog(g, gx, gy, 6, a, o.jam ? '#6a4a3a' : '#c0302a', o.jam ? '#8a6a5a' : '#e8604a', o.jam); }
  if (o.jam) { add(g, () => { g.globalAlpha = 0.5; g.drawImage(glow(26, '255,200,80'), rx + 23 - 26, L0 - ph / 2 - 5 - 26); }); for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(200,200,200,0.45)'; g.fillRect(rx + 4 + ((i * 11 + R(time * 30)) % 36), L0 - ph - ((i * 7 + R(time * 40)) % 30), 4, 4); } }
  else add(g, () => { g.globalAlpha = 0.22 + 0.1 * Math.sin(time * 5); g.drawImage(glow(22, '255,70,50'), rx + 23 - 22, L0 - ph / 2 - 5 - 22); });
  rc(g, rx - 4, L0 - ph + 4, 4, ph - 16, MP.i3); for (let y = L0 - ph + 4; y < L0 - 12; y += 6) rc(g, rx - 4, y, 4, 3, HAZ[0]);   /* the ram plate */
  /* its reverse lamps (white, flashing on the tell) and the exhaust the sparks come out of */
  const rv = o.rev && Math.floor(time * 10) % 2; for (const ly of [L0 - ph + 2, L1 + 2]) { rc(g, rx - 2, ly, 3, 3, rv ? '#ffffff' : '#5a5a66'); if (rv) add(g, () => { g.globalAlpha = 0.8; g.drawImage(glow(16, '255,255,255'), rx - 17, ly - 15); }); }
  rc(g, rx + 4, L1 - 2, 8, 6, MP.i1); rc(g, rx + 2, L1 - 1, 3, 4, MP.i3);
  /* the DECK at the MID line, and the CAB on it (over the MID and HIGH lines): armoured plate, an amber window, the goblin driver looking back over his shoulder at you */
  rc(g, rx, L1, pw, L0 - ph - L1 + 1, '#2a2830'); rc(g, rx, L1, pw, 1, MP.i4);
  const cx0 = rx + ci, ct = L1 - (o.cabH || 40), ch = L1 - ct;
  rc(g, cx0, ct, cw, ch, flash || '#5a4a3c'); rc(g, cx0, ct, cw, 2, '#8a7660'); rc(g, cx0, ct, 2, ch, '#7a6650'); rc(g, cx0 + cw - 2, ct, 2, ch, '#2a2018');
  for (let y = ct + 27; y < ct + ch - 3; y += 6) { rc(g, cx0 + 2, y, cw - 4, 1, '#2a2018'); rc(g, cx0 + 3, y + 2, 1, 1, MP.i5); rc(g, cx0 + cw - 5, y + 2, 1, 1, MP.i5); }
  rc(g, cx0 + 3, ct + 5, cw - 6, 17, '#0e0a10'); rc(g, cx0 + 4, ct + 6, cw - 8, 15, o.jam ? '#ffd36b' : '#e0a040'); rc(g, cx0 + 4, ct + 6, cw - 8, 2, '#f8d890');
  const gm = cx0 + R(cw / 2) - 2, look = Math.sin(time * 1.3) > 0.6 ? 1 : 0;   /* the goblin: green head, a rusty helm, red eyes looking back (left) at you, a snarl; his hands on the levers */
  rc(g, gm - 5, ct + 11, 10, 9, '#4a7a30'); rc(g, gm - 5, ct + 11, 10, 1, '#6aa048'); rc(g, gm - 8, ct + 13, 3, 2, '#4a7a30'); rc(g, gm - 6, ct + 9, 12, 3, '#6a3a1a'); rc(g, gm - 6, ct + 9, 12, 1, '#a0602a');
  rc(g, gm - 4 - look, ct + 14, 2, 2, '#ff4030'); rc(g, gm - look, ct + 14, 2, 2, '#ff4030'); rc(g, gm - 4, ct + 18, 6, 1, '#101010'); rc(g, gm - 3, ct + 17, 1, 1, '#e8e0c0'); rc(g, gm, ct + 17, 1, 1, '#e8e0c0');
  rc(g, gm + 5, ct + 18, 4, 2, '#4a7a30'); rc(g, gm + 8, ct + 15, 1, 6, MP.i4);   /* a hand on the lever */
  rc(g, cx0 + 3, ct + 5, 2, 17, '#14101a'); rc(g, cx0 + cw - 5, ct + 5, 2, 17, '#14101a');
  rc(g, cx0 + 4, ct - 5, cw - 8, 5, '#2a2018'); rc(g, cx0 + 4, ct - 5, cw - 8, 1, '#8a7660'); rc(g, gm - 3, ct - 9, 6, 5, MP.i2); rc(g, gm - 2, ct - 8, 4, 3, '#fff0b0');
  add(g, () => { g.globalAlpha = 0.6; g.drawImage(glow(30, '255,220,140'), gm - 30, ct - 7 - 30); });
  if (o.ward) { g.fillStyle = 'rgba(200,216,232,0.5)'; g.fillRect(cx0 - 2, ct - 2, cw + 4, ch + 4); for (let i = 0; i < 4; i++) rc(g, cx0 - 2, ct + i * R(ch / 4), cw + 4, 2, 'rgba(240,248,255,0.8)'); }
  /* THE SPARK SPRAY: a jet out of the exhaust down its line */
  if (o.spray && o.spray.on) { const y = lanes[o.spray.lane] - 12; add(g, () => { g.globalAlpha = 0.5; g.drawImage(glow(28, '255,170,60'), rx - 40, y - 28); });
    for (let i = 0; i < 26; i++) { const t = (time * 3 + i / 26) % 1, xx = rx - t * 150, yy = y + Math.sin(i * 7.3 + time * 20) * (4 + t * 10); rc(g, xx, yy, 2, 1, i % 3 ? MP.l3 : MP.go2); } }
}
