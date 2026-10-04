// src/redraw/mystic_art.js - THE BANDIT MYSTICS, drawn (claude/djinn2). The cult that chants at the Djinn's binding seals to free him: men of the Gang
// Leader's band in the dust-red robes of the old waterworks' keepers, hooded, their faces wrapped to the eyes, a sun-and-shackle sigil stitched on the
// chest. The goblin mage's frames (src/redraw/monastery.js bakeGoblinMage - the AI under them is the mage's: src/main.js updateGobMage) on a man's height.
// The contract is welltown_art's: every frame faces RIGHT (L is the flip), one canvas a set, ax = the body's centre column, ay = the row under the feet,
// w/h = the hit box. Frames (the mage's): 0 idle | 1,2 walk | 3 bolt tell | 4 bolt | 5 rune tell | 6 hurt (and the body he leaves).
//   bakeBanditMystic()   THE CASTER: a fist of sand held out (the bolt), both hands up for the rune - the sand glows gold in his hands
//   bakeLampBearer()     THE LAMP-BEARER: a taller hood, a brass chain-pole held out in front - its LAMP is drawn live (drawLamp): lit or doused
//   drawLamp(g, x, y, lit, time)     the lamp at its hanging point (lit: a flame behind brass fretwork; doused: dark, smoking a little)
//   drawWardLight(g, x, y, r, time)  THE WARDING LIGHT: a warm circle on the world, r px (src/bandit-mystic-hands.js draws it under the foes)
//   drawWardPip(g, x, y, time)       the ward PIP over a warded foe's head (a small warm lamp-shape: blows land half)
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

const pack = (frames, ax, ay, w, h) => { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; };
const C = { robe: '#8a3a2a', robeD: '#5a2218', robeL: '#b0583e', hood: '#6a2a1e', hoodD: '#40160e', wrap: '#2a1c18', skin: '#a06a46', eye: '#ffd36b', sash: '#d8b070', sigil: '#ffe08a',
  pants: '#3a2a22', boot: '#1e140e', sand: '#e8c98a', sandL: '#fff2c0', brass: '#c9a44a', brassD: '#7a5a20' };
function body(g, f, o) {
  const W = 30, cx = 13, G = 33, walk = f === 1 || f === 2, hurt = f === 6, k = f === 2 ? 1 : 0, lean = hurt ? -2 : 0, top = o.tall ? 11 : 12, hip = 23;
  /* the legs under the robe's hem, the boots */
  for (const [lx, st] of [[cx - 3, walk ? (k ? -2 : 2) : 0], [cx + 1, walk ? (k ? 2 : -2) : 0]]) { rect(g, lx + st, hip + 3, 3, G - 5 - hip, C.pants); rect(g, lx + st - 1, G - 2, 4, 2, C.boot); }
  /* THE ROBE: long, to the shins, flared at the hem, a sash and the sigil (a sun with a shackle through it) */
  fillPoly(g, [[cx - 4 + lean, top], [cx + 4 + lean, top], [cx + 6, hip + 5], [cx - 6, hip + 5]], C.robe);
  line(g, cx + 3 + lean, top + 1, cx + 5, hip + 4, C.robeD); line(g, cx - 3 + lean, top + 1, cx - 5, hip + 4, C.robeL);
  rect(g, cx - 4 + lean, top + 8, 9, 2, C.sash); px(g, cx + 4 + lean, top + 10, C.sash); px(g, cx + 4 + lean, top + 11, C.sash);
  circle(g, cx + lean, top + 4, 1.6, C.sigil); px(g, cx - 2 + lean, top + 4, C.sigil); px(g, cx + 2 + lean, top + 4, C.sigil); px(g, cx + lean, top + 2, C.sigil); px(g, cx + lean, top + 6, C.robeD);
  /* THE HOOD and the wrap: only the eyes show, and they catch the gold */
  const hx = cx + 1 + lean, hy = top - 5;
  ellipse(g, hx, hy, 4.4, 5, C.hood); fillPoly(g, [[hx - 4, hy - 2], [hx + (o.tall ? 1 : 2), hy - (o.tall ? 10 : 7)], [hx + 4, hy - 2]], C.hood); line(g, hx - 4, hy - 1, hx - 4, hy + 4, C.hoodD);
  rect(g, hx - 2, hy - 1, 6, 4, C.wrap); rect(g, hx - 1, hy - 1, 5, 1, C.skin);
  if (hurt) { px(g, hx + 1, hy - 1, C.wrap); px(g, hx + 3, hy - 1, C.wrap); } else { px(g, hx + 1, hy - 1, C.eye); px(g, hx + 3, hy - 1, C.eye); }
  return { cx, top, hip, lean, hx, hy, G };
}
/* THE CASTER: a fist of sand held out on the tell, flung on the bolt; both arms up for the rune, sand pouring between his hands */
export function bakeBanditMystic() {
  const W = 30, H = 34;
  const F = Array.from({ length: 7 }, (_, f) => { const [c, g] = canvas(W, H); const b = body(g, f, {}), { cx, top, lean } = b;
    if (f === 3 || f === 4) { const ax = cx + (f === 4 ? 10 : 8), ay = top + (f === 4 ? 3 : 4); line(g, cx + 3 + lean, top + 2, ax, ay, C.robe, 2); circle(g, ax + 1, ay, f === 4 ? 2.6 : 2, C.sand); px(g, ax + 1, ay - 1, C.sandL);
      if (f === 4) for (let i = 0; i < 3; i++) px(g, ax + 4 + i * 2, ay - 1 + (i % 2) * 2, C.sand); }
    else if (f === 5) { line(g, cx - 2 + lean, top + 2, cx - 1, top - 9, C.robe, 2); line(g, cx + 3 + lean, top + 2, cx + 5, top - 9, C.robe, 2);
      ellipse(g, cx + 2, top - 10, 4, 2, C.sand); px(g, cx + 2, top - 11, C.sandL); for (let i = 0; i < 4; i++) px(g, cx + 1 + (i % 2) * 2, top - 7 + i * 3, C.sand); }
    else if (f === 6) { line(g, cx + 3 + lean, top + 2, cx + 8, top - 1, C.robe, 2); line(g, cx - 3 + lean, top + 2, cx - 7, top + 6, C.robe, 2); }
    else { line(g, cx + 3 + lean, top + 2, cx + 4, top + 9, C.robe, 2); px(g, cx + 4, top + 10, C.skin); }   /* hands folded in the sleeves */
    outline(c, OUT); return c; });
  return pack(F, 13, 33, 10, 22);
}
/* THE LAMP-BEARER: a taller hood, a brass pole held out front - the lamp hangs off its end (drawLamp, live). Same frames: he does not bolt, he holds
   the light up (3,4), and lifts it high for the flare (5) */
export const LAMP_AT = { dx: 11, dy: -21, up: -29 };   /* the lamp's hanging point from his feet (facing right): held out, and lifted for the flare */
export function bakeLampBearer() {
  const W = 30, H = 34;
  const F = Array.from({ length: 7 }, (_, f) => { const [c, g] = canvas(W, H); const b = body(g, f, { tall: true }), { cx, top, lean, G } = b;
    const up = f === 5, hurt = f === 6, ex = cx + LAMP_AT.dx, ey = G + (up ? LAMP_AT.up : LAMP_AT.dy) - 4;
    if (!hurt) { line(g, cx + 3 + lean, top + 3, cx + 7, top + (up ? -2 : 5), C.robe, 2); line(g, cx + 6, top + (up ? 4 : 9), ex, ey, C.brassD, 1); px(g, ex, ey, C.brass); px(g, cx + 7, top + (up ? -2 : 5), C.skin); }
    else { line(g, cx + 3 + lean, top + 2, cx + 7, top - 2, C.robe, 2); }
    outline(c, OUT); return c; });
  return pack(F, 13, 33, 10, 23);
}
/* THE LAMP: brass fretwork round a flame (lit), or dark and smoking (doused). x, y = the bottom of the lamp on screen */
export function drawLamp(g, x, y, lit, time) {
  x = Math.round(x); y = Math.round(y);
  g.fillStyle = '#7a5a20'; g.fillRect(x - 3, y - 8, 7, 8); g.fillStyle = '#c9a44a'; g.fillRect(x - 3, y - 8, 7, 1); g.fillRect(x - 3, y - 1, 7, 1); g.fillRect(x - 3, y - 7, 1, 6); g.fillRect(x + 3, y - 7, 1, 6); g.fillRect(x, y - 7, 1, 6);
  g.fillRect(x - 1, y - 10, 3, 2);
  if (lit) { const f = Math.sin(time * 15 + x) > 0 ? 1 : 0; g.fillStyle = '#ff9a3c'; g.fillRect(x - 2, y - 6, 5, 4); g.fillStyle = '#ffd36b'; g.fillRect(x - 1, y - 6 - f, 3, 4); g.fillStyle = '#fff2c0'; g.fillRect(x, y - 5, 1, 2); }
  else { g.fillStyle = '#2a1c18'; g.fillRect(x - 2, y - 6, 5, 4); const a = (time * 0.7 + x * 0.01) % 1; g.globalAlpha = 0.5 * (1 - a); g.fillStyle = '#9aa39a'; g.fillRect(x, y - 12 - Math.round(a * 10), 2, 2); g.globalAlpha = 1; }
}
/* THE WARDING LIGHT: a warm disc on the world with a brighter rim - what stands in it takes half */
export function drawWardLight(g, x, y, r, time) {
  x = Math.round(x); y = Math.round(y); const p = 0.85 + 0.15 * Math.sin(time * 4 + x * 0.01);
  g.save(); g.globalAlpha = 0.10 * p; g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 0.08 * p; g.beginPath(); g.arc(x, y, r * 0.6, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 0.45 * p; g.strokeStyle = '#ffb84a'; g.lineWidth = 1; g.setLineDash([3, 3]); g.lineDashOffset = -time * 8; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); g.restore();
}
/* THE WARD PIP: a little lamp over a warded foe's head (its blows land half while it shows) */
export function drawWardPip(g, x, y, time) {
  x = Math.round(x); y = Math.round(y) + Math.round(Math.sin(time * 5 + x) * 1);
  g.fillStyle = '#1b1626'; g.fillRect(x - 3, y - 6, 7, 7); g.fillStyle = '#c9a44a'; g.fillRect(x - 2, y - 5, 5, 5); g.fillStyle = '#ffd36b'; g.fillRect(x - 1, y - 4, 3, 3); g.fillStyle = '#fff2c0'; g.fillRect(x, y - 3, 1, 1);
}
