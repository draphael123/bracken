// deeprails6_art.js - DEEP RAILS 6's art (claude/deeprails6 greybox -> claude/deeprails6art polish): the Great Drill's GOBLIN DRIVER (a hand-set sprite in the cab glass), P3's ONE RAIL (the LOW line
// buried under a heap of broken rock and snapped props, the caged red lamp strip and its sweeping beacons that quicken as its bar falls), THE SLAG LADLE (a jointed boom with a ram and a pouring
// ladle, the marked line, a tumbling glob, a crusting pool), THE POINTS LEVER's throw (the yank, the clunk and spark burst) and the ORE STREAM from the rig's hatch into its gears (the hatch door,
// chunks, the dust at the gears, the smoke as they choke), and THE LEADING BORE's dressing (the torn high line, the drill's cutting scars, the glow ahead). Plain rects; every piece keeps its
// read (B10/B16). Art only: nothing here reads a hit box, a timing or a tune.
import { MP, glow, hash } from './minecart_backdrop.js';
const R = Math.round;
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const add = (g, fn) => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; };
const mod = (a, n) => ((a % n) + n) % n;
const HAZY = '#e8b830';
/* a hard pixel line (Bresenham, no antialiasing), w px thick */
function pline(g, x0, y0, x1, y1, w, col) { x0 = R(x0); y0 = R(y0); x1 = R(x1); y1 = R(y1); g.fillStyle = col; const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
  for (let n = 0; n < 400; n++) { g.fillRect(x0, y0, w, w); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } }
/* one boulder: a dark outline, a lit top-left face, a shaded lower-right, a crack. (x, y) = its bottom-left; w x h */
function stone(g, x, y, w, h, seed, pal) {
  const c = pal || [MP.r2, MP.r3, MP.r4, MP.r5, MP.r6], v = seed & 3;
  rc(g, x + 1, y - h, w - 2, 1, '#07050a'); rc(g, x, y - h + 1, w, h - 1, '#07050a');   /* outline */
  rc(g, x + 1, y - h + 1, w - 2, h - 2, c[1 + (v & 1)]); rc(g, x + 1, y - h + 1, w - 3, 1, c[4]); rc(g, x + 1, y - h + 1, 1, h - 3, c[3]);   /* the lit top and left edges */
  rc(g, x + w - 3, y - h + 3, 2, h - 4, c[0]); rc(g, x + 2, y - 2, w - 4, 1, c[0]);   /* the shaded right and foot */
  if (w > 9) { const cx = x + 3 + (seed % Math.max(1, w - 7)); rc(g, cx, y - h + 3, 1, 3, '#07050a'); rc(g, cx + 1, y - h + 6, 1, 2, '#07050a'); }
}

/* P3 ONE RAIL: the LOW line buried - a heap of broken rock from the floor up to the MID rail's bed, running past at the tunnel's pace; k 0..1 the rubble still coming down.
   Two layers of boulders (a dark back row, a lit front row) on long-period profiles (two slow swells + a per-boulder jitter), snapped props and twisted iron poking out, dust off the crest:
   no two stretches of it alike (Daniel's art note: long-period blotch + jittered frames break the repetition) */
export function oneRailRubble(g, x0, x1, yMid, yLow, scroll, k, time) {
  const w = x1 - x0; if (w <= 0) return; const kk = Math.max(0, Math.min(1, k)), sc = R(scroll), span = yLow - yMid, top = R(yLow - span * kk) + 2;
  const prof = sx => R(4 * Math.sin(sx / 41) + 3 * Math.sin(sx / 97 + 1.3) + 2 * Math.sin(sx / 23 + 0.4));
  rc(g, x0, top + 3, w, yLow - top + 1, '#120d12');   /* the packed core */
  /* the back row: dark, big, heaped to the crest */
  for (let cell = Math.floor((x0 + sc) / 22) - 1; cell * 22 - sc < x1 + 22; cell++) { const h0 = hash(cell, 11), bw = 14 + (h0 % 12), bh = 8 + ((h0 >> 4) % 10) + Math.max(0, prof(cell * 22)), x = cell * 22 - sc + ((h0 >> 8) % 8);
    if (x + bw < x0 || x > x1) continue; stone(g, x, top + 12 + ((h0 >> 12) % 4), bw, bh + 6, h0 >> 3, [MP.r1, MP.r2, MP.r3, MP.r4, MP.r5]); }
  /* the crest: lit boulders along the profile, jittered in size and height, and the odd snapped prop or twisted rail end */
  for (let cell = Math.floor((x0 + sc) / 13) - 1; cell * 13 - sc < x1 + 13; cell++) { const h0 = hash(cell, 7), bw = 10 + (h0 % 8), x = cell * 13 - sc - (h0 >> 5) % 4, hgt = 7 + ((h0 >> 9) % 9) + prof(cell * 13) * 0.5;
    if (x + bw < x0 || x > x1) continue; stone(g, x, top + 9 + ((h0 >> 14) % 5), bw, Math.max(6, R(hgt)), h0 >> 2); }
  for (let cell = Math.floor((x0 + sc) / 61) - 1; cell * 61 - sc < x1 + 61; cell++) { const h0 = hash(cell, 3), x = cell * 61 - sc + (h0 % 30), by = top + 6;
    if (h0 % 3 === 0) { rc(g, x, by - 14, 3, 18, MP.t2); rc(g, x, by - 14, 1, 18, MP.t4); rc(g, x - 1, by - 15, 2, 2, MP.t3); rc(g, x + 1, by - 17, 1, 3, MP.t1); rc(g, x + 2, by - 13, 1, 2, MP.t5); }   /* a snapped prop */
    else if (h0 % 3 === 1) { pline(g, x, by + 2, x + 10, by - 9, 1, MP.i3); pline(g, x, by + 1, x + 10, by - 10, 1, MP.i5); rc(g, x + 10, by - 10, 3, 1, MP.i4); rc(g, x + 5, by - 4, 4, 1, MP.t2); }   /* a twisted rail end and a splintered sleeper */
  }
  rc(g, x0, yLow - 1, w, 4, '#07050a');   /* the heap's foot, in the dark */
  /* dust off the crest, drifting back with the tunnel */
  for (let i = 0; i < 10; i++) { const t = (time * 0.5 + i * 0.137) % 1, x = x0 + mod(i * 53 - sc * 0.9 - t * 18, Math.max(1, w)); g.fillStyle = 'rgba(150,132,118,' + (0.35 * (1 - t)).toFixed(2) + ')'; g.fillRect(R(x), R(top - 4 - t * 14), 4 + R(t * 6), 3 + R(t * 3)); }
  if (kk < 1) for (let i = 0; i < 22; i++) { const t = (time * 1.4 + i * 0.29) % 1, x = x0 + ((i * 53) % Math.max(1, w)), y = yMid - 70 + t * (top - yMid + 70); rc(g, x, y, 3 + (i & 1), 3, i % 2 ? MP.r5 : MP.r4); rc(g, x + 1, y - 5, 1, 4, 'rgba(150,132,118,0.5)'); }   /* still coming down, each with its dust */
}
/* the RED LAMP STRIP along the roof (t 0..1: how far its bar has fallen): a cable run on staples, a caged lamp every 40 px that pulses faster and redder as the bar falls, a sweeping beacon every
   third lamp once it is past half, a red wash down the tunnel on the beat. scroll (optional) runs it past with the tunnel. */
export function tensionLamps(g, x0, x1, yCeil, t, time, scroll) {
  const tt = Math.max(0, Math.min(1, t)), rate = 2 + 10 * tt, ph = Math.sin(time * rate * Math.PI), on = 0.5 + 0.5 * ph, sc = scroll || 0, step = 40, w = x1 - x0;
  g.fillStyle = 'rgba(255,40,30,' + (0.02 + 0.07 * tt * on).toFixed(3) + ')'; g.fillRect(x0, yCeil, w, 60);   /* the wash */
  rc(g, x0, yCeil + 3, w, 1, '#1a1014'); rc(g, x0, yCeil + 4, w, 1, '#3a2228');   /* the cable */
  for (let i = Math.floor((x0 + sc) / step) - 1; i * step - sc < x1 + step; i++) { const x = i * step - sc + 14; if (x < x0 - 12 || x > x1 + 12) continue; const beacon = i % 3 === 0 && tt > 0.5;
    rc(g, x - 1, yCeil, 2, 4, '#3a3a46'); rc(g, x - 4, yCeil + 4, 8, 2, '#2a2830'); rc(g, x - 4, yCeil + 4, 8, 1, '#585866');   /* the staple and the lamp's cap */
    rc(g, x - 3, yCeil + 6, 6, 4, on > 0.5 ? '#ff5a44' : '#7a1c18'); rc(g, x - 2, yCeil + 6, 3, 1, on > 0.5 ? '#ffc0a8' : '#a02a24'); rc(g, x - 4, yCeil + 6, 1, 4, '#14101a'); rc(g, x + 3, yCeil + 6, 1, 4, '#14101a'); rc(g, x - 3, yCeil + 8, 6, 1, '#14101a');   /* the bulb in its wire cage */
    add(g, () => { g.globalAlpha = (0.2 + 0.55 * tt) * on; g.drawImage(glow(20, '255,60,40'), x - 20, yCeil + 8 - 20); });
    if (beacon) { const a = time * (2.2 + 5 * tt) + i, lx = Math.cos(a) * 26; g.save(); g.globalAlpha = 0.16 * (0.5 + 0.5 * Math.abs(Math.sin(a))); g.fillStyle = '#ff5040'; g.beginPath(); g.moveTo(x, yCeil + 9); g.lineTo(x + lx - 10, yCeil + 56); g.lineTo(x + lx + 10, yCeil + 56); g.closePath(); g.fill(); g.restore(); } }
}
/* THE POINTS THROWN: the yank - the hand-lever comes down (k 0..1 over the 0.25 s pull): a smear of its swing, a ring and a burst of sparks at its head, a flash on the gate-head */
export function leverClunk(g, x, y, k, time) {
  const a = 1 - k, kk = k * k;
  for (let i = 1; i <= 4; i++) { const kp = Math.max(0, kk - i * 0.09), ang = 0.55 + (2.2 - 0.55) * kp, hx = x + Math.sin(ang) * 15, hy = y + 2 - Math.cos(ang) * 15; g.globalAlpha = 0.32 / i; rc(g, hx - 3, hy - 3, 6, 6, '#ff8a6a'); } g.globalAlpha = 1;   /* the smear */
  add(g, () => { g.globalAlpha = 0.7 * a; g.drawImage(glow(18, '255,210,120'), x - 18, y - 18); });
  if (k > 0.55) { const r = 4 + (k - 0.55) * 28; g.strokeStyle = 'rgba(255,230,160,' + (0.8 * a).toFixed(2) + ')'; g.lineWidth = 1; g.beginPath(); g.arc(R(x + 14), R(y + 11), r, 0, Math.PI * 2); g.stroke(); }   /* the clunk's ring, at the stop */
  for (let i = 0; i < 10; i++) { const an = i * 0.628 + time * 2, d = 4 + k * 16; rc(g, x + 12 + Math.cos(an) * d, y + 10 + Math.sin(an) * d + k * k * 8, 2, 1, i % 3 === 0 ? '#ffffff' : i % 2 ? '#ffd36b' : '#ff9a3c'); }
}
/* THE ORE STREAM: the rig's chute hatch (x0, y0) drops on its hinge and the ore pours in an arc into its gear housing (x1, y1), k 0..1 over the pour; the dust and the smoke as the gears choke */
export function oreStream(g, x0, y0, x1, y1, k, time) {
  const open = Math.min(1, k * 4);
  rc(g, x0 - 9, y0 - 5, 18, 3, MP.i2); rc(g, x0 - 9, y0 - 5, 18, 1, MP.i4);   /* the chute's lip */
  g.save(); g.translate(x0 - 8, y0 - 2); g.rotate(open * 1.35); rc(g, 0, 0, 16, 2, MP.i3); rc(g, 0, 0, 16, 1, MP.i5); rc(g, 13, -1, 3, 1, HAZY); g.restore();   /* the hatch door swinging down on its hinge */
  for (let i = 0; i < 26; i++) { const t = (time * 3.2 + i / 26) % 1; if (t > Math.min(1, k * 2.6)) continue; const u = Math.min(1, t / 0.5), sp = ((i * 7) % 5) - 2, x = x0 + (x1 - x0) * u * (2 - u) + sp * t, y = y0 + (y1 - y0) * t * t - Math.sin(u * Math.PI) * 14, sz = 2 + (i % 3);   /* up and out clear of the cab's glass first, then straight down the rig's rear face into the gears */
    rc(g, x - 1, y, sz + 1, sz, '#241410'); rc(g, x - 1, y, sz, sz - 1, i % 5 === 0 ? MP.go2 : i % 3 === 0 ? MP.cu2 : i % 2 ? '#a06a3e' : '#8a5a38'); rc(g, x - 1, y, 1, 1, '#d8b088'); }
  const imp = Math.min(1, k * 3);
  for (let i = 0; i < 7; i++) { const t = (time * 4 + i * 0.14) % 1, a = -0.4 - i * 0.45; rc(g, x1 + Math.cos(a) * t * 12, y1 + Math.sin(a) * t * 12 + t * t * 14, 2, 1, i % 2 ? '#ffd36b' : '#ff9a3c'); }   /* grit and sparks off the cogs */
  add(g, () => { g.globalAlpha = 0.45 * imp; g.drawImage(glow(16, '255,120,60'), x1 - 16, y1 - 16); });
  for (let i = 0; i < 9; i++) { const t = (time * 1.4 + i * 0.113) % 1; const dark = i % 3 === 0; g.fillStyle = dark ? 'rgba(30,26,28,' + (0.7 * (1 - t) * imp).toFixed(2) + ')' : 'rgba(120,110,104,' + (0.55 * (1 - t) * imp).toFixed(2) + ')'; g.fillRect(R(x1 - 10 + i * 3 + Math.sin(time * 3 + i) * 2 - t * 8), R(y1 - 6 - t * 28), 5 + R(t * 6), 4 + R(t * 5)); }   /* the smoke, black as the gears choke */
}
/* B16 - THE SLAG LADLE's windup: from the cab's roof (cx, top) a jointed boom with a ram rises and bends out over the player's lines, a ladle on its end brimming with slag, tipping to pour as the
   tell runs out (k 0..1); the lamp is the old roof lamp's, so the boom stands clear of it */
export function ladleArm(g, cx, top, k, time) {
  const bx = cx + 6, by = top - 4, t1 = 0.45 + 0.95 * k, t2 = t1 - 1.0, L1 = 15, L2 = 13;
  const ex = bx - Math.cos(t1) * L1, ey = by - Math.sin(t1) * L1, tx = ex - Math.cos(t2) * L2, ty = ey - Math.sin(t2) * L2;
  rc(g, bx - 5, by - 1, 10, 4, '#2a2830'); rc(g, bx - 5, by - 1, 10, 1, MP.i4); rc(g, bx - 3, by - 4, 6, 3, '#3a3a46'); rc(g, bx - 3, by - 4, 6, 1, MP.i5);   /* the turret */
  pline(g, bx + 3, by - 2, ex + 3, ey + 4, 1, MP.i3); pline(g, bx + 3, by - 3, ex + 3, ey + 3, 1, MP.i5);   /* the ram */
  pline(g, bx, by - 3, ex, ey, 3, '#3a3d48'); pline(g, bx, by - 4, ex, ey - 1, 1, '#9aa0ae');   /* the lower arm */
  rc(g, ex - 2, ey - 2, 4, 4, '#14121a'); rc(g, ex - 1, ey - 1, 2, 2, MP.i5);   /* the elbow pin */
  pline(g, ex, ey, tx, ty, 3, '#4a4e5a'); pline(g, ex, ey - 1, tx, ty - 1, 1, '#b0b6c4');   /* the upper arm */
  const tilt = Math.max(0, (k - 0.7) / 0.3), lx = R(tx), ly = R(ty);   /* the ladle's chain, then the bowl, tipping to pour toward you at the end of the tell */
  rc(g, lx, ly + 1, 1, 3, MP.i5); rc(g, lx - 5 - R(tilt * 2), ly + 3, 12, 1, '#14121a');   /* hanger */
  for (let r = 0; r < 5; r++) { const wd = [13, 13, 11, 9, 7][r], off = R(tilt * (r + 1) * -0.9), x = lx - R(wd / 2) + off + R(tilt * 2); rc(g, x - 1, ly + 4 + r, wd + 2, 1, '#14121a'); rc(g, x, ly + 4 + r, wd, 1, r === 0 ? '#6a6a76' : r < 3 ? '#3a3640' : '#2a262c'); }
  rc(g, lx - 5 + R(tilt * -2), ly + 3, 11, 2, k > 0.2 ? '#ff7a2a' : '#8a3a1a'); rc(g, lx - 3 + R(tilt * -2), ly + 3, 6, 1, k > 0.2 ? '#ffe08a' : '#c85a2a');   /* the slag in it */
  add(g, () => { g.globalAlpha = 0.35 + 0.5 * k; g.drawImage(glow(18, '255,120,40'), lx - 18, ly + 5 - 18); });
  const dripN = k > 0.5 ? 4 : 1; for (let i = 0; i < dripN; i++) { const t = (time * 3.2 + i / dripN) % 1; rc(g, lx - 6 - R(tilt * 3) + (i & 1), ly + 8 + t * 14, 1, 2 + R(tilt * 2), i % 2 ? '#ff9a3c' : '#ffd36b'); }   /* drips off the lip */
  if (tilt > 0) rc(g, lx - 8 - R(tilt * 3), ly + 6, 2, R(6 + tilt * 12), '#ff8a30');   /* the first of the pour */
  for (let i = 0; i < 3; i++) { const t = (time * 0.9 + i * 0.33) % 1; g.fillStyle = 'rgba(210,200,190,' + (0.32 * (1 - t) * (0.3 + k)).toFixed(2) + ')'; g.fillRect(R(lx + 2 + Math.sin(time * 2 + i) * 3), R(ly - 2 - t * 14), 3 + R(t * 3), 3); }   /* heat haze / steam */
}
/* the line the ladle aims at: hazard stripes on the rail run, orange and dark, brighter and quicker as the tell runs out; chevrons point down the line */
export function ladleMark(g, x0, x1, y, k, time) {
  const a = 0.25 + 0.45 * k, sh = R(time * 18 * (0.5 + k)) % 12;
  for (let x = x0 - sh; x < x1; x += 12) { const xx = Math.max(x0, x); g.fillStyle = 'rgba(255,128,36,' + a.toFixed(2) + ')'; g.fillRect(xx, y - 4, Math.min(6, x + 6 - xx), 3); g.fillStyle = 'rgba(30,14,8,' + (a * 0.8).toFixed(2) + ')'; g.fillRect(Math.max(x0, x + 6), y - 4, Math.min(6, x + 12 - Math.max(x0, x + 6)), 3); }
  if (k > 0.35 && Math.floor(time * 10) % 2) { g.fillStyle = '#ffd36b'; for (let x = x0 + 14; x < x1; x += 44) { g.fillRect(x, y - 9, 1, 2); g.fillRect(x + 1, y - 8, 1, 2); g.fillRect(x + 2, y - 7, 1, 2); g.fillRect(x - 1, y - 8, 1, 2); g.fillRect(x - 2, y - 9, 1, 2); } }
}
/* the glob in the air: a wobbling blob of slag with a hot core, ragged flaming edge, a drip tail and sparks falling behind it */
export function slagGlob(g, x, y, time) {
  const wob = Math.sin(time * 30) > 0 ? 1 : 0, wd = 8 + wob, ht = 7 - wob;
  rc(g, x - wd / 2 - 1, y - ht / 2, wd + 2, ht, '#5a1a0c'); rc(g, x - wd / 2, y - ht / 2 - 1, wd, ht + 2, '#5a1a0c');
  rc(g, x - wd / 2 + 1, y - ht / 2, wd - 2, ht, '#ff6a1c'); rc(g, x - 2, y - 2, 4, 3, '#ffd36b'); rc(g, x - 1, y - 2, 2, 1, '#fff6c0');
  for (let i = 0; i < 6; i++) { const t = (time * 5 + i / 6) % 1; rc(g, x - 3 + ((i * 5) % 7), y + 3 + t * 10, 1, 1 + (i & 1), i % 2 ? '#ffb040' : '#ff6a1c'); }
  add(g, () => { g.globalAlpha = 0.65; g.drawImage(glow(14, '255,120,40'), x - 14, y - 14); });
}
/* THE POOL on the line: a rounded bead of slag, bright and runny at first (life 1), then crusting over - dark plates with orange cracks, bubbles popping, steam - until it is a cold scab */
export function slagPool(g, x, y, w, life, time) {
  const l = Math.max(0, Math.min(1, life)), x0 = R(x - w / 2), hot = l > 0.45, crust = 1 - l;
  for (let i = 0; i < w; i++) { const e = Math.min(i, w - 1 - i), h = Math.min(5, 2 + (e >> 1)) + (i % 7 === 3 ? 1 : 0); rc(g, x0 + i, y + 1 - h, 1, h, e < 1 ? '#3a1208' : hot ? (e < 3 ? '#c8401a' : '#ff6a1c') : '#4a2218'); }   /* the bead, rounded at the ends */
  for (let i = 3; i < w - 3; i++) { const f = 0.5 + 0.5 * Math.sin(time * 5 + i * 0.9 + (i % 5)), top = y - 3 - (i % 3 === 0 ? 1 : 0); if (hot) rc(g, x0 + i, top + 1, 1, 1, f > 0.5 ? '#ffe08a' : '#ffa030');
    else if (f > 0.7 && l > 0.1) rc(g, x0 + i, top + 2, 1, 1, '#ff8a2a'); }   /* the runny sheen, or the cracks still glowing */
  if (crust > 0.2) for (let i = 4; i < w - 5; i += 6) { rc(g, x0 + i, y - 4, 5, 2, '#26100a'); rc(g, x0 + i, y - 4, 5, 1, '#5a3022'); rc(g, x0 + i + 5, y - 4, 1, 3, l > 0.15 ? '#ff7a2a' : '#6a3a28'); }   /* the plates */
  if (hot) for (let i = 0; i < 3; i++) { const t = (time * 1.6 + i * 0.37) % 1, bx = x0 + 6 + ((i * 17) % Math.max(1, w - 12)); if (t < 0.5) { rc(g, bx, y - 5 - R(t * 4), 3, 1, '#ffd36b'); rc(g, bx, y - 5 - R(t * 4), 1, 2, '#ff9a3c'); } }   /* a bubble rising and bursting */
  add(g, () => { g.globalAlpha = 0.5 * l; g.drawImage(glow(R(w / 2 + 8), '255,110,40'), R(x) - R(w / 2 + 8), y - R(w / 2 + 8) - 2); });
  for (let i = 0; i < 4; i++) { const t = (time * 1.1 + i / 4) % 1; g.fillStyle = 'rgba(200,180,160,' + (0.35 * (1 - t) * (0.3 + l)).toFixed(2) + ')'; g.fillRect(x0 + 5 + i * R(w / 5), R(y - 7 - t * 16), 3 + R(t * 2), 3); }   /* steam */
}

/* ================= DEEP RAILS 6 ART (claude/deeprails6art, Sonnet): the polish pass over the greybox above. Art only: no hit box, timing or tune is read or changed here. ================= */
/* THE GOBLIN DRIVER (Daniel 10-29: 'the goblin in the cart looks low-poly / off'): a hand-set 22 x 15 sprite in the cab window - a mining helm with a lit lamp and a rust streak, a 3/4 face
   looking back at you (brows, slit-pupil red eyes, a flat nose, tusks and a snarl), big ears, a knotted red rag at the collar, a leather jerkin with a strap, a hand on the lever. The game's
   screen is the pixel (640 x 360), so 'finer' is more pixels spent on the face: this head is 13 x 12 against the old 10 x 9, with a dark outline so it reads against the amber glass. */
const GD_PAL = { h: '#a08a70', H: '#5e4a3a', r: '#a8622a', V: '#fff0b0', l: '#d0b898', g: '#2c5524', G: '#4a7a30', L: '#6aa048', B: '#10260f', N: '#1f3a18', I: '#b0645a', E: '#ff4a30', P: '#1a0606', M: '#1a0808', T: '#f0e8cc', J: '#3a281a', j: '#5e4630', S: '#a0702c', R: '#a02a22', q: '#e0603e', y: '#9acc66' };
const GD_ROWS = [
  '......................',
  '........lhhhhhh.......',
  '.......hhHHHHHHh......',
  '.....VHhHHrHHHHHHh....',
  '....hhhhhhhhhhhhhhh.gg',
  '.....ggBBggggBBggg.ggg',
  '..gg.gLPEEggPEEgLggg..',
  '.gIIgGGGGNNGGGGGGgIg..',
  '..g..gGGGNNNGGGGGggg..',
  '.....gMTMMMMMMMTMg....',
  '.....gGgMTMTMTMgGg....',
  '......gGGGGGGGGGg.....',
  '....RRqRRRRRRRRqRR....',
  '..JjJJJJJJSJJJJJJJjJ..',
  '.JJJJjJJJJSJJJJJJJjJJJ',
];
for (let i = 0; i < GD_ROWS.length; i++) if (GD_ROWS[i].length !== 22) throw new Error('goblin driver row ' + i + ' is ' + GD_ROWS[i].length);
/* (wx, wy) = the window's top-left (inside the frame), w x h = 22 x 15; o: { jam, slump, look, time } */
export function goblinDriver(g, wx, wy, o) {
  const time = o.time || 0, jam = !!o.jam, slump = o.slump > 0.5;
  /* the glass: a warm gradient, a light streak, grime (dim when the lamp is out: slumped = bright gold alarm glass) */
  const bands = jam ? ['#ffe27a', '#ffd36b', '#f0b840', '#d8982c'] : ['#f6cf74', '#eab050', '#d89238', '#b87428'];
  for (let i = 0; i < 4; i++) rc(g, wx, wy + R(i * 3.75), 22, i === 3 ? 15 - 11 : 4, bands[i]);
  rc(g, wx + 2, wy + 1, 1, 6, 'rgba(255,248,210,0.55)'); rc(g, wx + 19, wy + 8, 1, 5, 'rgba(90,50,10,0.35)');
  const bob = !slump && Math.floor(time * 9) % 4 === 0 ? 1 : 0, dy = slump ? 3 : 0, dx = slump ? 1 : 0;   /* the engine shakes his head a pixel on a beat; slumped, his head is down */
  const blink = (time % 3.7) < 0.12, glance = o.look || (time % 5.3) > 4.9;
  g.save(); g.beginPath(); g.rect(wx, wy, 22, 15); g.clip();
  const rows = GD_ROWS.map((s, i) => { if (i === 6) { if (slump || blink) return '..gg.gLBBBggBBBgLggg..'; if (glance) return '..gg.gLEEPggEEPgLggg..'; } if (slump && (i === 9 || i === 10)) return i === 9 ? '.....gMMMMMMMMMMg.....' : '.....gGgMMTTMMgGg.....'; return s; });
  const grid = rows.map((s, i) => { const yo = i < 12 ? bob + dy : 0, xo = i < 12 ? dx : 0; return { s, yo, xo }; });
  /* the outline first (every empty cell touching a sprite cell), then the sprite */
  const solid = (r, c) => r >= 0 && r < 15 && c >= 0 && c < 22 && rows[r][c] !== '.';
  g.fillStyle = 'rgba(22,12,6,0.85)';
  for (let r = 0; r < 15; r++) { const { yo, xo } = grid[r]; for (let c = 0; c < 22; c++) { if (rows[r][c] !== '.') continue; if (solid(r - 1, c) || solid(r + 1, c) || solid(r, c - 1) || solid(r, c + 1)) g.fillRect(wx + c + xo, wy + r + yo, 1, 1); } }
  for (let r = 0; r < 15; r++) { const { s, yo, xo } = grid[r]; for (let c = 0; c < 22; c++) { const ch = s[c]; if (ch === '.') continue; g.fillStyle = GD_PAL[ch]; g.fillRect(wx + c + xo, wy + r + yo, 1, 1); } }
  /* light from the lamp on the near cheek, a cheek-bone highlight, rust flecks on the helm */
  if (!slump) { rc(g, wx + 6, wy + 7 + bob, 1, 1, GD_PAL.y); rc(g, wx + 16, wy + 7 + bob, 1, 1, GD_PAL.L); rc(g, wx + 9, wy + 3 + bob, 1, 1, '#c8803a'); }
  /* his lamp: lit (flickers); out when slumped */
  if (!slump) add(g, () => { g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 11) * Math.sin(time * 3.1); g.drawImage(glow(8, '255,240,170'), wx + 5 - 8, wy + 3 + bob - 8); });
  /* the rag's tails flutter in the engine's draught */
  rc(g, wx + 4 + (Math.floor(time * 6) % 2), wy + 13, 2, 1, GD_PAL.R); rc(g, wx + 18 - (Math.floor(time * 6 + 1) % 2), wy + 13, 2, 1, GD_PAL.q);
  /* a hand on the lever: the lever rocks with the cab (slumped: the hand slides off) */
  const lv = slump ? 0 : Math.floor(time * 5) % 3 === 0 ? 1 : 0;
  rc(g, wx + 19 + lv, wy + 7, 1, 7, MP.i4); rc(g, wx + 19 + lv, wy + 7, 1, 1, MP.i5); rc(g, wx + 18 + lv, wy + 5, 3, 3, '#d8261c'); rc(g, wx + 18 + lv, wy + 5, 3, 1, '#ff7a6a');
  rc(g, wx + (slump ? 17 : 17 + lv), wy + (slump ? 13 : 11), 4, 2, GD_PAL.G); rc(g, wx + (slump ? 17 : 17 + lv), wy + (slump ? 13 : 11), 4, 1, GD_PAL.L);   /* his hand (green, three knuckles) */
  g.restore();
}

/* THE GEAR TAGS (Daniel: 'the gear labels are crowded'): a dark plate under a bank's word, right edge at x, centre y, w wide - a small up-arrow on its left when the bank is struck from a jump,
   a gold rim while the bank's attack winds up - and a dotted leader to the bank (by the mast at mx, on to tx when the bank stands off the mast; yb = the bank's own height) */
export function gearTag(g, x, y, w, jump, hot, yb, mx, tx) {
  const rim = hot ? '#ffd36b' : '#4a3438', x0 = R(x - w), y0 = R(y - 5);
  g.fillStyle = 'rgba(10,8,14,0.78)'; g.fillRect(x0, y0, w, 10); rc(g, x0, y0, w, 1, rim); rc(g, x0, y0 + 9, w, 1, rim); rc(g, x0, y0, 1, 10, rim); rc(g, x0 + w - 1, y0, 1, 10, rim);
  if (jump) { const ax = x0 + 4, c = '#c8d8e8'; rc(g, ax, y0 + 2, 1, 1, c); rc(g, ax - 1, y0 + 3, 3, 1, c); rc(g, ax - 2, y0 + 4, 5, 1, c); rc(g, ax, y0 + 5, 1, 3, c); }   /* JUMP: an arrow, up */
  g.fillStyle = hot ? '#ffd36b' : '#7a5a5a'; for (let lx = R(x) + 2; lx < mx; lx += 3) g.fillRect(lx, R(y), 1, 1);
  if (R(yb) !== R(y)) for (let ly = Math.min(R(y), R(yb)); ly < Math.max(R(y), R(yb)); ly += 3) g.fillRect(mx, ly, 1, 1);
  if (tx && tx > mx) for (let lx = mx; lx < tx; lx += 3) g.fillRect(lx, R(yb), 1, 1);
}

/* ================= THE LEADING BORE's dressing ================= */
/* THE TORN HIGH LINE (decor 'torn', x0..x1 screen px, y = the rail's surface): the smelter's rail run on, then the roof came down on it. The rail dips and snaps - a bent end hanging, a
   split sleeper, a spiked rail end - then a heap of broken rock climbs from the bed to the fallen slab (no jump clears it), a snapped prop and a hanging beam, dust still coming down.
   Everything is on the right-hand 80 px; the heap tops out at y - 32 (the rock's own underside) so 'FALLEN IN' still reads above it. */
const WARM0 = ['#1a100e', '#2e1c16', '#46281c', '#6a4430', '#8a6046'], WARM1 = ['#24150f', '#3e271c', '#5e3c2a', '#8a5e42', '#b48560'];   /* the smelter's rock: char brown with a slag-warm lit edge */
export function tornHigh(g, x0, x1, y, time, seed) {
  const hx = x1 - 84;   /* where the line goes wrong */
  for (let i = 0; i < 4; i++) { const sx = hx - 6 + i * 11, sag = i * i + i; rc(g, sx, y + 2 + sag, 8, 3, i === 2 ? MP.t1 : MP.t2); rc(g, sx, y + 2 + sag, 8, 1, MP.t4); if (i === 3) { rc(g, sx + 3, y + 2 + sag, 1, 4, '#07050a'); rc(g, sx + 5, y + 1 + sag, 3, 2, MP.t3); } }   /* sleepers dropping away, the last one split */
  for (let i = 0; i < 28; i++) { const t = i / 27, xx = hx - 8 + i * 1.6, yy = y - 1 + t * t * 15; rc(g, xx, yy, 2, 2, MP.i3); rc(g, xx, yy - 1, 2, 1, MP.i5); }   /* the rail, bending down off its sleepers */
  pline(g, hx + 30, y + 14, hx + 36, y + 18, 1, MP.i4); rc(g, hx + 36, y + 17, 3, 2, '#2a2830');   /* its bent end hanging */
  rc(g, hx + 8, y - 2, 1, 2, '#2a2830');
  /* the heap: three tiers of boulders up the slope to the fallen slab */
  const tiers = [[14, 0, 10], [28, 5, 16], [40, 12, 22]];   /* [x from heap start, rise, width] */
  rc(g, hx + 36, y - 34, x1 - hx - 36, 38, '#0e0a10');
  for (let ti = 0; ti < 3; ti++) { const [ox, , wd] = tiers[ti]; for (let i = 0; i < 6; i++) { const h0 = hash(seed + ti * 7, i + 3), bx = hx + 30 + ti * 11 + i * 9 + (h0 % 5), bh = 9 + (h0 >> 3) % 9, by = y + 3 - Math.max(0, ti * 4) - (i * 2 > 6 ? 6 : 0) - (ti === 2 ? 6 : ti === 1 ? 2 : 0);
      if (bx + wd > x1 + 2 || by - bh < y - 34) continue; stone(g, bx, by, wd, bh, h0 >> 2, ti === 0 ? WARM1 : WARM0); } }
  for (let i = 0; i < 5; i++) { const h0 = hash(seed, i + 40), bx = hx + 50 + i * 7 + (h0 % 4), bh = 8 + (h0 >> 4) % 8, wd = 11 + (h0 >> 8) % 6; if (bx + wd <= x1 + 2) stone(g, bx, y - 18 + (h0 >> 12) % 6, wd, bh, h0 >> 2, WARM0); }
  for (let i = 0; i < 6; i++) { const h0 = hash(seed, i + 70); rc(g, hx + 36 + (h0 % 44), y - 24 + (h0 >> 6) % 24, 2, 1, i % 2 ? '#ff7a2a' : '#c8501a'); }   /* slag still glowing in the cracks */
  add(g, () => { g.globalAlpha = 0.18; g.drawImage(glow(26, '255,120,50'), hx + 62 - 26, y - 6 - 26); });
  rc(g, x1 - 40, y - 34, 40, 5, '#07050a'); rc(g, x1 - 40, y - 34, 40, 1, MP.r4);   /* the rock's own underside, the slab jammed in */
  rc(g, hx + 50, y - 30, 3, 34, MP.t2); rc(g, hx + 50, y - 30, 1, 34, MP.t4); rc(g, hx + 49, y - 31, 5, 2, MP.t3); rc(g, hx + 52, y - 33, 1, 4, MP.t1);   /* a snapped prop in the heap */
  pline(g, hx + 58, y - 28, hx + 74, y - 6, 2, MP.t2); pline(g, hx + 58, y - 29, hx + 74, y - 7, 1, MP.t4);   /* a split beam slanting down into it */
  pline(g, hx + 62, y - 10, hx + 72, y - 20, 1, MP.i3);   /* a twisted rail end */
  for (let i = 0; i < 7; i++) { const t = (time * 0.7 + i * 0.211) % 1, dx = hx + 52 + ((i * 11) % 26); g.fillStyle = 'rgba(150,132,118,' + (0.45 * (1 - t)).toFixed(2) + ')'; g.fillRect(R(dx + Math.sin(time * 2 + i) * 2), R(y - 34 + t * 30), 2 + (i & 1), 2 + R(t * 3)); }   /* dust still coming down the gap */
  for (let i = 0; i < 3; i++) { const h0 = hash(seed, i + 90), t = (time * 0.9 + i * 0.37) % 1; rc(g, hx + 56 + (h0 % 20), y - 34 + t * 36, 1, 2, MP.r5); }   /* a pebble or two */
}
/* THE DRILL'S CUTTING SCARS (decor 'scar'): the round cut where the bit bored through, seen in the wall - a jagged fractured rim (lit on its upper left), the bit's flute tracks as broken
   rings, chisel marks, steel flecks, a little spoil at its foot. seed = the column, so each is its own. Past column 1322 the heat of the bore ahead warms the rim. */
export function scar(g, x, y, r, seed) {
  const cy = y - r, warm = seed >= 1322 ? 1 : 0, steps = Math.max(24, R(r * 7));
  g.fillStyle = '#080506'; g.beginPath(); g.arc(R(x), R(cy), r, 0, Math.PI * 2); g.fill();
  const px = (a, rr, col) => { g.fillStyle = col; g.fillRect(R(x + Math.cos(a) * rr), R(cy + Math.sin(a) * rr), 1, 1); };
  for (let i = 0; i < steps; i++) { const a = i / steps * Math.PI * 2, lit = Math.cos(a - 3.9) , j = hash(seed, i) % 3, rr = r + j;   /* the fractured rim: a ragged 2-3 px band */
    for (let d = 0; d < 3; d++) px(a, rr - d + 1, d === 0 ? (lit > 0.3 ? MP.r6 : lit > -0.3 ? MP.r5 : MP.r3) : d === 1 ? (lit > 0 ? MP.r4 : MP.r3) : MP.r2); if (warm && lit > 0.2 && i % 4 === 0) px(a, rr, '#a85a2a'); }
  for (const fr of [0.66, 0.38]) for (let i = 0; i < steps * fr; i++) { const a = i / (steps * fr) * Math.PI * 2, h = hash(seed + 3, i + R(fr * 10)); if (h % 5 < 2) continue; px(a + fr * 3, r * fr, h % 3 ? '#1a1220' : '#2a1e30'); }   /* the flute tracks, broken */
  for (let i = 0; i < 7; i++) { const a = hash(seed, i + 20) % 628 / 100, r0 = r * 0.3, r1 = r * (0.55 + (hash(seed, i + 30) % 30) / 100); for (let q = r0; q < r1; q += 1) px(a, q, '#160f1c'); }   /* chisel marks, radial */
  for (let i = 0; i < 4; i++) { const a = 3.1 + (hash(seed, i + 50) % 160) / 100; px(a, r + 1, i === 0 ? '#ff9a3c' : MP.i5); }   /* a steel fleck or a hot one on the lit rim */
  for (let i = 0; i < 6; i++) { const h0 = hash(seed, i + 60); rc(g, x - r * 0.6 + (h0 % Math.max(1, R(r * 1.2))), y - 1 - (h0 >> 4) % 2, 2 + (h0 >> 8) % 2, 1 + (h0 >> 6) % 2, (h0 >> 3) & 1 ? MP.r4 : MP.r3); }   /* spoil at its foot */
}
/* THE BORE'S GLOW AHEAD (decor 'rumble', x0..x1 screen px, y = the rail row): the drill's lamps lighting the dust in the bore from the right - a haze that thickens toward the mouth, lit motes
   adrift in it, a warm wash up the walls */
export function boreGlow(g, x0, x1, y, vh, time) {
  if (x1 < 0 || x0 > 700) return; const w = x1 - x0; if (w <= 0) return; const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, 'rgba(255,170,80,0)'); gr.addColorStop(1, 'rgba(255,190,100,0.30)');
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(x0, y - 150, w, 190); g.restore();
  for (let i = 0; i < 18; i++) { const t = (time * 0.12 + i * 0.0617) % 1, xx = x0 + w * (0.25 + 0.75 * ((i * 37) % 100) / 100), yy = y - 110 + ((i * 53) % 100) * 1.0 + Math.sin(time * 0.9 + i) * 4, a = 0.5 * (xx - x0) / w;
    if ((i * 7 + R(time * 2)) % 5 === 0) continue; add(g, () => { g.globalAlpha = a; g.fillStyle = '#ffd890'; g.fillRect(R(xx - t * 6), R(yy - t * 3), 1 + (i & 1), 1); }); }
}
