// deeprails6_art.js - DEEP RAILS 6's GREYBOX art (claude/deeprails6, the Opus pass; a Sonnet art lane polishes it): the Great Drill's P3 ONE RAIL (the LOW line under rubble up to
// the MID rail, the red lamp strip that quickens as its bar falls), THE SLAG LADLE (the boom rising over the cab with its ladle, the marked line, the glob, the pool), THE POINTS
// LEVER's throw (the clunk and spark as the hand-lever comes down) and the ORE STREAM from the rig's chute into its gears. Plain rects and arcs; every piece keeps its read (B10/B16).
import { MP, glow } from './minecart_backdrop.js';
const R = Math.round;
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const add = (g, fn) => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; };

/* P3 ONE RAIL: the LOW line buried - a heap of broken rock from the floor up to the MID rail's bed, running past at the tunnel's pace; k 0..1 the rubble still coming down */
export function oneRailRubble(g, x0, x1, yMid, yLow, scroll, k, time) {
  const w = x1 - x0; if (w <= 0) return; const kk = Math.max(0, Math.min(1, k)), top = R(yLow - (yLow - yMid) * kk), off = R(scroll) % 14;
  rc(g, x0, top, w, yLow - top + 2, '#3a2c22');
  for (let x = x0 - 14 - off; x < x1 + 14; x += 14) { const s = ((x + R(scroll)) / 14) | 0, h = 3 + ((s * 7) & 3); rc(g, x, top - h + 2, 13, h, s & 1 ? '#5e4a38' : '#4a3a2c'); rc(g, x, top - h + 2, 13, 1, '#8a7660'); rc(g, x + 12, top - h + 2, 1, h, '#241a14'); }
  for (let x = x0 - 22 - (R(scroll) % 22); x < x1 + 22; x += 22) { const s = ((x + R(scroll)) / 22) | 0; rc(g, x + 3, top + 5 + (s % 3) * 3, 8, 4, '#6b5a48'); rc(g, x + 3, top + 5 + (s % 3) * 3, 8, 1, '#9a8670'); }
  if (kk < 1) for (let i = 0; i < 16; i++) { const t = (time * 1.4 + i * 0.29) % 1; rc(g, x0 + ((i * 53) % Math.max(1, w)), yMid - 60 + t * (top - yMid + 60), 3, 3, i % 2 ? '#8a7660' : '#5e4a38'); }   /* still coming down */
}
/* the RED LAMP STRIP along the roof: pulses faster (and redder) as its bar falls - t 0..1 */
export function tensionLamps(g, x0, x1, yCeil, t, time) {
  const tt = Math.max(0, Math.min(1, t)), rate = 2 + 10 * tt, on = 0.5 + 0.5 * Math.sin(time * rate * Math.PI);
  for (let x = x0 + 12; x < x1; x += 40) { rc(g, x - 3, yCeil + 2, 6, 3, '#2a1a18'); rc(g, x - 2, yCeil + 3, 4, 2, on > 0.5 ? '#ff4a3a' : '#7a1c16');
    add(g, () => { g.globalAlpha = (0.25 + 0.55 * tt) * on; g.drawImage(glow(18, '255,60,40'), x - 18, yCeil + 4 - 18); }); }
}
/* THE POINTS THROWN: the clunk as the hand-lever comes down - a spark burst at its head (k 0..1 over the 0.25 s pull) */
export function leverClunk(g, x, y, k, time) {
  const a = 1 - k; add(g, () => { g.globalAlpha = 0.7 * a; g.drawImage(glow(16, '255,210,120'), x - 16, y - 16); });
  for (let i = 0; i < 8; i++) { const an = i * 0.785 + time * 3, d = 4 + k * 14; rc(g, x + Math.cos(an) * d, y + Math.sin(an) * d + k * k * 6, 2, 1, i % 2 ? '#ffd36b' : '#ffffff'); }
}
/* THE ORE STREAM: from the rig's chute mouth (x0,y0) in an arc down into its gear housing (x1,y1), k 0..1 over the pour; smoke at the gears as they choke */
export function oreStream(g, x0, y0, x1, y1, k, time) {
  rc(g, x0 - 7, y0 - 3, 14, 3, MP.i3); rc(g, x0 - 7, y0 + R(4 * Math.min(1, k * 3)), 14, 2, MP.i5);   /* the hatch drops */
  for (let i = 0; i < 18; i++) { const t = (time * 3 + i / 18) % 1; if (t > Math.min(1, k * 2.5)) continue; const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * 14;
    rc(g, x - 1 + ((i * 5) % 3), y, 3, 2, i % 4 === 0 ? MP.go2 : i % 3 === 0 ? MP.cu2 : '#8a5a38'); }
  for (let i = 0; i < 6; i++) { const t = (time * 1.5 + i * 0.17) % 1; g.fillStyle = 'rgba(120,110,104,' + (0.5 * (1 - t) * Math.min(1, k * 2)).toFixed(2) + ')'; g.fillRect(R(x1 - 8 + i * 3 - t * 6), R(y1 - 6 - t * 22), 5 + R(t * 4), 4); }
}
/* B16 - THE SLAG LADLE's windup: from the cab's roof (cx, top) the boom rises, a ladle on its end glowing with slag; k 0..1 through the tell */
export function ladleArm(g, cx, top, k, time) {
  const a = -0.3 - 1.4 * k, len = 30, bx = cx, by = top - 2, ex = bx + Math.cos(a) * len * -1, ey = by + Math.sin(a) * len;
  g.strokeStyle = '#4a4e5a'; g.lineWidth = 3; g.beginPath(); g.moveTo(bx, by); g.lineTo(R(ex), R(ey)); g.stroke(); g.strokeStyle = '#8a8e9a'; g.lineWidth = 1; g.beginPath(); g.moveTo(bx, by - 1); g.lineTo(R(ex), R(ey) - 1); g.stroke();
  rc(g, bx - 3, by - 2, 6, 4, '#2a2830');
  rc(g, ex - 6, ey - 2, 12, 6, '#2a2228'); rc(g, ex - 5, ey - 3, 10, 3, k > 0.2 ? '#ff7a2a' : '#8a3a1a'); rc(g, ex - 3, ey - 3, 6, 1, '#ffd36b');   /* the ladle, brimming */
  add(g, () => { g.globalAlpha = 0.4 + 0.5 * k; g.drawImage(glow(16, '255,120,40'), R(ex) - 16, R(ey) - 16); });
  if (k > 0.5) for (let i = 0; i < 3; i++) { const t = (time * 4 + i / 3) % 1; rc(g, ex - 2 + i * 2, ey + 3 + t * 10, 1, 2, '#ff9a3c'); }   /* drips */
}
/* the line the ladle aims at: an orange marked stretch of rail (x0..x1 screen px) - brighter as the tell runs out */
export function ladleMark(g, x0, x1, y, k, time) {
  const on = Math.floor(time * 10) % 2; g.fillStyle = 'rgba(255,130,40,' + (0.2 + 0.4 * k).toFixed(2) + ')'; for (let x = x0; x < x1; x += 10) g.fillRect(x, y - 3, 6, 2);
  if (on && k > 0.4) { g.fillStyle = '#ffd36b'; for (let x = x0 + 5; x < x1; x += 20) g.fillRect(x, y - 4, 2, 1); }
}
/* the glob in the air */
export function slagGlob(g, x, y, time) { rc(g, x - 3, y - 3, 6, 6, '#ff7a2a'); rc(g, x - 2, y - 3, 4, 2, '#ffd36b'); add(g, () => { g.globalAlpha = 0.6; g.drawImage(glow(12, '255,120,40'), x - 12, y - 12); }); }
/* THE POOL on the line: a red-orange strip, crusting as it cools (life 1..0) */
export function slagPool(g, x, y, w, life, time) {
  const l = Math.max(0, Math.min(1, life)), x0 = R(x - w / 2); rc(g, x0, y - 3, w, 4, l > 0.3 ? '#c8401a' : '#5a2a1a');
  for (let i = 0; i < w; i += 5) { const f = 0.5 + 0.5 * Math.sin(time * 6 + i); rc(g, x0 + i, y - 3, 4, 1, f > 0.5 && l > 0.2 ? '#ffb040' : '#8a3a1a'); }
  add(g, () => { g.globalAlpha = 0.5 * l; g.drawImage(glow(R(w / 2 + 6), '255,110,40'), R(x) - R(w / 2 + 6), y - R(w / 2 + 6)); });
  for (let i = 0; i < 3; i++) { const t = (time * 1.2 + i / 3) % 1; g.fillStyle = 'rgba(200,180,160,' + (0.35 * (1 - t) * l).toFixed(2) + ')'; g.fillRect(x0 + 6 + i * 12, R(y - 6 - t * 14), 3, 3); }   /* steam */
}
