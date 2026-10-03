// src/redraw/desert_foes2.js - THE DESERT'S SECOND CAST (claude/desertfoes; src/desert-foes2.js is how they behave). px.js primitives only, so a Node
// check can bake every frame. The contract is desert_foes.js's: every frame faces RIGHT (L is the flip), one canvas size per set, ax = the body's
// centre column, ay = the row under the feet, w/h = the hit box; a set ends in its hurt pose where the game asks for one.
//   bakeFireScorpion(base)  THE FIRE SCORPION: the scorpion's seven frames recoloured ember - a cinder-black shell banded red-orange, the barb white-hot
//   bakeVenomScorpion(base) THE VENOM SCORPION: the same in bile green, the barb and the claws' tips a sick yellow-green
//   bakeSandworm()          THE SANDWORM (its own creature, no goblin in it): 0 THE RIPPLE (a hump of sand running) | 1 LUNGE TELL (the dome rising and
//                           cracking, grit spitting off it) | 2 LUNGE (up out of the sand, the ringed maw wide) | 3,4 EXPOSED (up and swaying, the maw
//                           working) | 5 BURROWING (head down into its own spray) | 6 hurt (recoiled, the maw shut)
//   bakeShieldGuard()       THE SHIELD GUARD: a gorge bandit in an oxblood coat and an iron cap behind a round hide-and-iron shield (the shieldgob's frames:
//                           0-3 walk | 4 the slow turn / skid (shield swung wide) | 5 SHOVE TELL (tucked behind it, braced) | 6 SHOVE (off the back foot))
//   bakeDynamiter()         THE DYNAMITE BANDIT: a lean man in a dust-red vest, a bandolier of red sticks (the sapper's frames: 0-3 walk | 4,5 running off,
//                           looking back | 6 LIGHT TELL: a lit stick held high over his head, the fuse spitting)
//   bakeCharge()            a stick of dynamite on the ground (one frame; the fuse spark is drawn live)
//   drawPatch(g, x, y, k, time)  a BURNING PATCH on the floor at (x, y), k = its life left 0..1 (it gutters low as it burns out)
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten, rgb } from '../px.js';
import { OUT } from '../art.js';

const pack = (frames, ax, ay, w, h) => { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; };
function settleFrame(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
const frames = (W, H, n, fn) => Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H); fn(g, f); outline(c, OUT); return settleFrame(c); });
const lerpC = (a, b, t) => { const A = rgb(a), B = rgb(b); return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; };
const rampAt = (st, l) => l < 0.5 ? lerpC(st[0], st[1], l * 2) : lerpC(st[1], st[2], (l - 0.5) * 2);
/* RECOLOUR a frame: pick(r, g, b, l) -> a three-stop ramp or null (leave it); the outline (very dark) always stays */
function recolor(c, pick) { const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
  for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2], l = (r + gg + b) / 765; if (l < 0.13) continue;
    const st = pick(r, gg, b, l); if (!st) continue; const o = rampAt(st, Math.min(1, l * 1.15)); p[i] = o[0]; p[i + 1] = o[1]; p[i + 2] = o[2]; }
  g.putImageData(img, 0, 0); return d; }
const reskin = (set, pick) => { const R = set.R.map(c => recolor(c, pick)); return pack(R, set.ax, set.ay, set.w, set.h); };
const barbRed = (r, g, b) => r > 200 && g < 110;   /* the lit barb (SC.red / SC.redL) */

/* ---------- THE SCORPION VARIANTS ---------- */
export function bakeFireScorpion(base) { return reskin(base, (r, g, b, l) => barbRed(r, g, b) ? ['#ff8a2a', '#ffd36b', '#fff6d0'] : (r > g && l > 0.16) ? (l > 0.42 ? ['#5a1408', '#c8401c', '#ff9a3a'] : ['#160806', '#4a1610', '#a8301a']) : null); }
export function bakeVenomScorpion(base) { return reskin(base, (r, g, b, l) => barbRed(r, g, b) ? ['#7aa01a', '#c8f040', '#f0ffb0'] : (r > g && l > 0.16) ? (l > 0.42 ? ['#1e3a10', '#4e8a24', '#a8d860'] : ['#0c1a08', '#24461a', '#4e7a2c']) : null); }

/* ---------- THE SANDWORM ---------- */
const SW = { sand: '#d8b070', sandL: '#f0d498', sandD: '#a8804a', grit: '#c09058', skin: '#c89a6a', skinL: '#e8c498', skinD: '#8a6040', band: '#6e4a30', maw: '#3a1418', mawL: '#7a2a2a', tooth: '#f4ead0', eye: '#1a0e0a' };
export function bakeSandworm() {
  const W = 30, H = 40, cx = 15, gy = 38;
  const pile = (g, w = 9, h = 3) => { ellipse(g, cx, gy - 1, w, h, SW.sandD); ellipse(g, cx - 1, gy - 2, w - 2, h - 1, SW.sand); for (let i = 0; i < 4; i++) px(g, cx - w + 3 + i * 4, gy - 2 - (i % 2), SW.sandL); };
  /* the body: ring segments from the sand up to the head at (hx, hy), a lean `sway` px at the top */
  const body = (g, top, sway) => { const n = Math.max(2, Math.round((gy - 2 - top) / 4)); for (let i = 0; i <= n; i++) { const k = i / n, y = gy - 2 - (gy - 2 - top) * k, x = cx + sway * k * k, r = 4.4 - k * 0.8;
      ellipse(g, x, y, r, 2.6, i % 2 ? SW.skin : SW.skinD); rect(g, x - r + 1, y - 1, 2, 1, SW.skinL); if (i % 2 === 0) rect(g, x - r + 1, y + 1, r * 2 - 1, 1, SW.band); } };
  /* the head: a blunt ringed snout, the maw `open` 0..1 (a ring of teeth), two pin eyes */
  const head = (g, x, y, open) => { ellipse(g, x, y, 5, 4, SW.skin); ellipse(g, x - 1, y - 2, 3, 1.5, SW.skinL);
    if (open > 0) { ellipse(g, x + 2, y - 1, 3.2 * open + 0.8, 3 * open + 0.6, SW.maw); ellipse(g, x + 2, y - 1, 2 * open, 1.8 * open, SW.mawL); for (let a = 0; a < 6; a++) { const t = a / 6 * Math.PI * 2; px(g, x + 2 + Math.cos(t) * (3 * open + 0.6), y - 1 + Math.sin(t) * (2.8 * open + 0.4), SW.tooth); } }
    else { line(g, x + 1, y, x + 5, y, SW.band); px(g, x + 5, y - 1, SW.tooth); }
    px(g, x - 2, y - 3, SW.eye); px(g, x + 1, y - 3, SW.eye); };
  const spray = (g, n, h) => { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI, d = 6 + (i * 5) % 7; px(g, cx + Math.cos(a) * d, gy - 4 - Math.sin(a) * (h + (i % 3) * 2), i % 2 ? SW.sandL : SW.grit); } };
  const F = frames(W, H, 7, (g, f) => {
    if (f === 0) { ellipse(g, cx, gy - 2, 8, 3, SW.sandD); ellipse(g, cx - 1, gy - 3, 6, 2.4, SW.sand); ellipse(g, cx - 2, gy - 4, 3, 1, SW.sandL); for (let i = 0; i < 3; i++) px(g, cx + 6 + i * 2, gy - 1, SW.grit); return; }   // THE RIPPLE: a hump of sand running
    if (f === 1) { ellipse(g, cx, gy - 3, 9, 5, SW.sandD); ellipse(g, cx - 1, gy - 4, 7, 4, SW.sand); line(g, cx - 3, gy - 7, cx, gy - 4, SW.band); line(g, cx + 1, gy - 8, cx + 3, gy - 4, SW.band); line(g, cx, gy - 4, cx + 5, gy - 6, SW.band);
      head(g, cx, gy - 6, 0); spray(g, 7, 8); return; }   // THE LUNGE TELL: the dome up and cracking, the snout showing, grit spitting
    if (f === 2) { pile(g, 10, 3); body(g, gy - 30, 2); head(g, cx + 2, gy - 32, 1); spray(g, 10, 14); return; }   // THE LUNGE: up out of the sand, the maw wide
    if (f === 3 || f === 4 || f === 6) { const sw = f === 3 ? -2 : f === 4 ? 2 : -3; pile(g); body(g, gy - 22, sw); head(g, cx + sw, gy - 24, f === 6 ? 0 : f === 3 ? 0.5 : 0.25);
      if (f === 6) for (let i = 0; i < 4; i++) px(g, cx - 4 + i * 3, gy - 28 - (i % 2), '#ffffff'); return; }   // EXPOSED: up and swaying (OPEN); 6 hurt
    pile(g, 10, 3); body(g, gy - 12, 3); ellipse(g, cx + 5, gy - 11, 4, 3, SW.skinD); spray(g, 9, 9);   // BURROWING: the head going down into its spray
  });
  return pack(F, cx, H, 12, 14);
}

/* ---------- THE GORGE'S MEN (the shieldgob's and the sapper's AI under men's skins: no goblins past the Goblin Queen) ---------- */
const MN = { skin: '#b07a52', skinD: '#83573a', coat: '#6a2a1c', coatL: '#a8583a', coatD: '#3e140e', cap: '#7a828e', capL: '#b8c0ca', veil: '#2a1410', pants: '#4e3e30', boot: '#2a1c12',
  shield: '#8a5a32', shieldL: '#b88450', shieldD: '#5a3a1e', iron: '#8a929e', ironL: '#d0d8e2', boss: '#c9962a', vest: '#9a3a22', vestD: '#6a2214', scarf: '#c8902a', stick: '#c8281e', stickL: '#ff6a4a', fuse: '#e8dcc0', spark: '#fff2a0', eye: '#f0dca0' };
const manHead = (g, x, y, capped) => { ellipse(g, x, y, 3.3, 3.3, MN.skin); rect(g, x - 3, y + 1, 7, 3, MN.veil); px(g, x + 1, y - 1, MN.eye); px(g, x + 2, y - 1, MN.eye);
  if (capped) { ellipse(g, x, y - 2, 4, 2.4, MN.cap); rect(g, x - 2, y - 4, 3, 1, MN.capL); } else { ellipse(g, x - 0.5, y - 2, 4.2, 2.3, MN.scarf); line(g, x - 4, y - 1, x - 7, y + 2, MN.scarf); } };
const manBody = (g, x, y, legs, lean, col, colL, colD) => { const [a, b] = legs;
  rect(g, x - 3 + a, y + 9, 2, 3, MN.pants); rect(g, x + 1 + b, y + 9, 2, 3, MN.pants); rect(g, x - 3 + a, y + 11, 3, 1, MN.boot); rect(g, x + 1 + b, y + 11, 3, 1, MN.boot);
  fillPoly(g, [[x - 3 + lean, y], [x + 3 + lean, y], [x + 4, y + 9], [x - 4, y + 9]], col); line(g, x - 2 + lean, y, x - 3, y + 8, colL); line(g, x + 3 + lean, y + 1, x + 3, y + 8, colD); };
export function bakeShieldGuard() {
  const W = 30, H = 30, cx = 13, gy = 28;
  /* the shield: a round hide board on an iron rim with a brass boss, held at (x, y), `wide` swung out to the side */
  const shield = (g, x, y, wide) => { const rx = wide ? 3 : 5, ry = 7; ellipse(g, x, y, rx + 1, ry + 1, MN.iron); ellipse(g, x, y, rx, ry, MN.shield); ellipse(g, x - 1, y - 2, Math.max(1, rx - 2), ry - 3, MN.shieldL);
    line(g, x - rx + 1, y + 3, x + rx - 1, y + 3, MN.shieldD); circle(g, x, y, 1.5, MN.boss); px(g, x - rx, y - 4, MN.ironL); };
  const F = frames(W, H, 7, (g, f) => {
    const by = gy - 12, walk = f <= 3, legs = walk ? [[0, 1], [1, 0], [0, -1], [-1, 0]][f] : f === 6 ? [2, -1] : f === 5 ? [-1, 1] : [0, 0];
    const lean = f === 6 ? 2 : f === 5 ? -1 : 0, dip = f === 5 ? 1 : 0;
    manBody(g, cx, by + dip, legs, lean, MN.coat, MN.coatL, MN.coatD); manHead(g, cx + 1 + lean, by - 4 + dip, true);
    if (f === 4) { line(g, cx + 2, by + 3, cx + 8, by + 1, MN.skin); shield(g, cx + 9, by + 3, true); }             // THE TURN: the shield swung wide (behind him is open)
    else if (f === 5) shield(g, cx + 5, by + 4, false);                                                            // SHOVE TELL: tucked in behind it, braced
    else if (f === 6) { shield(g, cx + 10, by + 3, false); for (let i = 0; i < 4; i++) px(g, cx + 17, by - 1 + i * 3, MN.ironL); }   // THE SHOVE: off the back foot, shield out
    else shield(g, cx + 6, by + 4 + (f % 2), false);
  });
  return pack(F, cx, H, 10, 18);
}
export function bakeDynamiter() {
  const W = 30, H = 34, cx = 13, gy = 32;
  const stick = (g, x, y, a = 0) => { const dx = Math.round(Math.cos(a) * 4), dy = Math.round(Math.sin(a) * 4); line(g, x, y, x + dx, y + dy, MN.stick, 2); px(g, x, y, MN.stickL); line(g, x + dx, y + dy, x + dx + 1, y + dy - 2, MN.fuse); };
  const F = frames(W, H, 7, (g, f) => {
    const by = gy - 12, flee = f === 4 || f === 5, legs = f <= 3 ? [[0, 1], [1, 0], [0, -1], [-1, 0]][f] : flee ? (f === 4 ? [2, -2] : [-2, 2]) : [0, 0];
    const lean = flee ? -2 : 0;
    manBody(g, cx, by, legs, lean, MN.vest, MN.coatL, MN.vestD);
    for (let i = 0; i < 3; i++) rect(g, cx - 2 + i * 2 + lean, by + 2 + i, 1, 3, MN.stick);   // the bandolier of sticks across his chest
    manHead(g, cx + (flee ? -2 : 1), by - 4, false);
    if (f === 6) { line(g, cx + 2, by + 1, cx + 3, by - 9, MN.skin); stick(g, cx + 2, by - 11, -0.3); for (let i = 0; i < 4; i++) px(g, cx + 7 + (i % 2), by - 15 - i, i % 2 ? MN.spark : '#ff9a3a'); }   // THE LIGHT TELL: lit, held high, spitting
    else if (flee) { line(g, cx - 1, by + 2, cx - 5, by + 4, MN.skin); line(g, cx + 2, by + 2, cx + 5, by + 6, MN.skin); }
    else { line(g, cx + 2, by + 2, cx + 5, by + 6, MN.skin); stick(g, cx + 5, by + 6, 0.6); }
  });
  return pack(F, cx, H, 10, 18);
}
export function bakeCharge() { const [c, g] = canvas(10, 6); rect(g, 1, 2, 7, 3, MN.stick); rect(g, 2, 2, 5, 1, MN.stickL); line(g, 8, 3, 9, 1, MN.fuse); outline(c, OUT); return c; }

/* ---------- THE BURNING PATCH ---------- */
export function drawPatch(g, x, y, k, time, w = 22) {
  const X = Math.round(x), Y = Math.round(y), h = 3 + Math.round(8 * Math.min(1, k * 1.6));
  g.globalAlpha = 0.28; g.fillStyle = '#ff7a30'; g.fillRect(X - w / 2 - 4, Y - h - 6, w + 8, h + 7); g.globalAlpha = 1;   /* the glow */
  g.fillStyle = '#2a1410'; g.fillRect(X - w / 2, Y - 1, w, 2);   /* the scorch */
  for (let i = 0; i < 5; i++) { const fx = X - w / 2 + 2 + i * (w - 4) / 4, ph = time * 9 + i * 1.7, fh = Math.max(2, h - (i % 2) * 2 + Math.round(Math.sin(ph) * 2));
    g.fillStyle = '#c8281e'; g.fillRect(Math.round(fx) - 2, Y - fh, 4, fh); g.fillStyle = '#ff8a2a'; g.fillRect(Math.round(fx) - 1, Y - fh + 1, 2, fh - 1); g.fillStyle = '#ffe27a'; g.fillRect(Math.round(fx), Y - Math.max(1, fh - 3), 1, Math.max(1, fh - 3)); }
  for (let i = 0; i < 3; i++) { const a = (time * 1.3 + i * 0.33) % 1; g.globalAlpha = 1 - a; g.fillStyle = i % 2 ? '#ffd36b' : '#ff8a2a'; g.fillRect(Math.round(X - 6 + i * 6 + Math.sin(time * 5 + i) * 2), Math.round(Y - h - 2 - a * 14), 1, 1); g.globalAlpha = 1; }
}
