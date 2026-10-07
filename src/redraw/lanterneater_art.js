// lanterneater_art.js - THE LANTERN-EATER, drawn (claude/lanterneater; GREYBOX - plain shapes until the art pass, but THE READ IS FINISHED: the fight is the read
// between the basin's real lamp and its lure). Pure drawing: src/lantern-eater-hands.js calls these with the live state; nothing here moves a thing.
//   THE REAL LAMP   a square caged lantern hung on an iron CHAIN from the fog: it hangs DEAD STILL and its flame FLICKERS (gutters, the glow jumps and dips)
//   THE LURE        the same warm light in a rounder, fleshy bulb on a pale STALK that curves down out of the water: it SWAYS side to side, smooth and steady
//                   (it never flickers); close up its bulb has a dark seam and a faint pulse
//   THE KEY         chevrons under what it keys: gold UP-chevrons under a light that dangles (HIT HIGH), gold DOWN-chevrons over its gums at the rail (HIT LOW)
//   THE JAWS        a vast dark maw out of the water at the raft's end: an upper jaw of needle teeth, a lower jaw, and the GUMS between them - a pale pink band
//   ITS BULK        a long dark shape under the surface, two pale eyes that slide past
//   THE DARK        phase three: every basin lamp snuffed, the raft's lantern the only light (a soft hole in the dark round it; dimmed, an ember)
//   THE RAFT        claude/canal4art's raft (lashed timbers, iron straps, barrel floats, ring-bolts, hemp lashings, rope fenders) - its lantern pole is phase three's verb
import { canvas } from '../px.js';
const R = Math.round;
export const LC = { flame: '#ffcf6a', flameHot: '#fff2b0', glow: '255,207,106', lureGlow: '255,214,128', cage: '#1b1b20', chain: '#4a4e56', stalk: '#c8b8a0', stalkD: '#7a6a58',
  bulb: '#e8b860', bulbD: '#9a6a30', seam: '#5a3a1a', maw: '#0e1418', jaw: '#1e2a30', jawL: '#3a4a50', tooth: '#e8e4d0', gum: '#c86a78', gumL: '#f0a0a8', eye: '#d8f0c8',
  key: '#ffd36b', warn: '#ff6b6b', ward: '#9aa39a' };

/* ------------------------------ the raft (claude/canal4art's, as it was under Jenny) ------------------------------ */
export function drawRaft(g, x, y, w) {
  for (const side of [0, 1]) for (let k = 0; k < 3; k++) { const bx = side ? x + w - 12 - k * 11 : x + 2 + k * 11, by = y + 7;
    g.fillStyle = '#10161a'; g.fillRect(bx, by, 10, 9); g.fillStyle = '#1e2a30'; g.fillRect(bx + 1, by + 1, 8, 7); g.fillStyle = '#34444c'; g.fillRect(bx + 2, by + 1, 1, 7);
    g.fillStyle = '#4a525a'; g.fillRect(bx, by + 2, 10, 1); g.fillRect(bx, by + 6, 10, 1); g.fillStyle = '#8a929a'; g.fillRect(bx + 4, by + 2, 1, 1); }
  for (let i = 0; i < w; i += 16) { const k = (i / 16) | 0, ww = Math.min(16, w - i);
    g.fillStyle = k % 2 ? '#4a3a26' : '#54422c'; g.fillRect(x + i, y, ww, 6); g.fillStyle = '#8a7448'; g.fillRect(x + i, y, ww, 1); g.fillStyle = '#6a5636'; g.fillRect(x + i, y + 1, ww, 1);
    g.fillStyle = '#1c150e'; g.fillRect(x + i, y + 6, ww, 2); g.fillRect(x + i + 15, y + 1, 1, 5); g.fillStyle = '#2c2216'; g.fillRect(x + i + 5 + (k % 3) * 2, y + 3, 3, 1);
    g.fillStyle = '#9aa2aa'; g.fillRect(x + i + 2, y + 2, 1, 1); g.fillRect(x + i + 12, y + 2, 1, 1); }
  for (let i = 10; i < w - 8; i += 48) { g.fillStyle = '#2a3036'; g.fillRect(x + i, y - 1, 5, 9); g.fillStyle = '#6a747c'; g.fillRect(x + i, y - 1, 5, 1); g.fillRect(x + i, y - 1, 1, 9); g.fillStyle = '#c8d0d8'; g.fillRect(x + i + 2, y + 1, 1, 1); g.fillRect(x + i + 2, y + 5, 1, 1); }
  for (const rx of [x + 3, x + w - 8]) { g.fillStyle = '#2a3036'; g.fillRect(rx, y - 2, 5, 3); g.strokeStyle = '#8a929a'; g.lineWidth = 1; g.beginPath(); g.arc(rx + 2.5, y - 4, 2.5, 0, 6.3); g.stroke(); }
  for (const lx of [x + 8, x + w - 20]) { g.fillStyle = '#b8a070'; for (let k = 0; k < 4; k++) g.fillRect(lx + k * 3, y + 1 + (k & 1), 2, 5); g.fillStyle = '#6a5a3c'; for (let k = 0; k < 4; k++) g.fillRect(lx + k * 3 + 2, y + 1, 1, 6); g.fillStyle = '#d8c898'; g.fillRect(lx + 12, y + 3, 3, 1); g.fillRect(lx + 14, y + 4, 2, 1); }
  for (const fx of [x - 3, x + w]) { g.fillStyle = '#7a6a48'; g.fillRect(fx, y + 1, 3, 7); g.fillStyle = '#a89868'; g.fillRect(fx, y + 1, 1, 7); g.fillStyle = '#4a3c28'; for (let k = 0; k < 7; k += 2) g.fillRect(fx + 1, y + 1 + k, 2, 1); }
}
/* THE RAFT'S LANTERN on its pole (x the lantern's centre, y the deck): lit, a full flame; dimmed, a shuttered ember. hot = phase three, where it is the only light */
export function drawRaftLantern(g, x, y, lit, time, hot) {
  const X = R(x), Y = R(y) + 10; g.fillStyle = '#2a2420'; g.fillRect(X - 5, Y - 34, 2, 24); g.fillRect(X - 5, Y - 35, 8, 1);   /* the short post and its arm (the lantern hangs at hip height: a standing swing reaches it) */
  g.fillStyle = LC.cage; g.fillRect(X - 3, Y - 31, 7, 1); g.fillRect(X - 3, Y - 21, 7, 1); g.fillRect(X - 3, Y - 30, 1, 9); g.fillRect(X + 3, Y - 30, 1, 9);
  if (lit) { const fl = 0.85 + 0.15 * Math.sin(time * 9); g.globalAlpha = fl; g.fillStyle = LC.flame; g.fillRect(X - 2, Y - 29, 5, 7); g.fillStyle = LC.flameHot; g.fillRect(X - 1, Y - 27, 3, 3); g.globalAlpha = 1;
    if (hot) { const gr = g.createRadialGradient(X, Y - 26, 1, X, Y - 26, 22); gr.addColorStop(0, 'rgba(' + LC.glow + ',0.45)'); gr.addColorStop(1, 'rgba(' + LC.glow + ',0)'); g.fillStyle = gr; g.fillRect(X - 22, Y - 48, 44, 44); } }
  else { g.fillStyle = '#3a2e22'; g.fillRect(X - 2, Y - 29, 5, 7); g.fillStyle = '#7a3a1a'; g.fillRect(X, Y - 24, 1, 1); g.fillStyle = '#5a5048'; for (let k = 0; k < 3; k++) g.fillRect(X - 2, Y - 29 + k * 2, 5, 1); }   /* the shutter down over an ember */
}
/* ------------------------------ the two lights: the SAME caged lantern, told apart only by how they MOVE (the read) ------------------------------ */
/* the caged lantern both lights wear: a square cage (bars col), the flame (a = its brightness 0..1) */
function cageLamp(g, X, Y, bars, a) {
  g.fillStyle = bars; g.fillRect(X - 5, Y - 22, 11, 2); g.fillRect(X - 5, Y - 2, 11, 2); g.fillRect(X - 5, Y - 20, 1, 18); g.fillRect(X + 5, Y - 20, 1, 18); g.fillRect(X, Y - 20, 1, 18);
  g.globalAlpha = a; g.fillStyle = LC.flame; g.fillRect(X - 3, Y - 16, 7, 11); g.fillStyle = LC.flameHot; g.fillRect(X - 1, Y - 13, 3, 5); g.globalAlpha = 1;
}
const glowAt = (g, X, Y, r, a, col) => { const gr = g.createRadialGradient(X, Y - 11, 1, X, Y - 11, r); gr.addColorStop(0, 'rgba(' + col + ',' + a.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.fillRect(X - r - 2, Y - r - 13, r * 2 + 4, r * 2 + 4); };
/* THE REAL LAMP: hung DEAD STILL on a faint chain up into the fog; its flame FLICKERS (flick 0..1: it gutters, the glow jumps and dips) */
export function drawLamp(g, x, y, flick, time) {
  const X = R(x), Y = R(y); g.globalAlpha = 0.28; g.fillStyle = LC.chain; for (let yy = Y - 70; yy < Y - 22; yy += 3) g.fillRect(X, yy, 1, 2); g.globalAlpha = 1;   /* the chain, faint in the fog */
  glowAt(g, X, Y, 18 + 8 * flick, 0.5 * flick, LC.glow); cageLamp(g, X, Y, LC.cage, 0.3 + 0.7 * flick); void time;
}
/* THE LURE: the SAME caged light - but it SWAYS (sx, px: slow and smooth, side to side) and its flame NEVER flickers. Its stalk is a faint thread in the fog
   (reveal = struck or snagged: the stalk shows pale, all the way down to the water, and the cage is flesh) */
export function drawLure(g, x, y, sx, stalkFromX, waterY, time, limp, reveal) {
  const X = R(x + sx), Y = R(y), bx = R(stalkFromX);
  g.globalAlpha = reveal ? 1 : 0.16; g.strokeStyle = LC.stalkD; g.lineWidth = reveal ? 3 : 1; g.beginPath(); g.moveTo(bx, R(waterY)); g.quadraticCurveTo(R((bx + X) / 2 + sx * 2), Y - 70, X, Y - 22); g.stroke();
  if (reveal) { g.strokeStyle = LC.stalk; g.lineWidth = 1; g.beginPath(); g.moveTo(bx, R(waterY) - 1); g.quadraticCurveTo(R((bx + X) / 2 + sx * 2), Y - 71, X, Y - 23); g.stroke(); }
  g.globalAlpha = 1;
  glowAt(g, X, Y, 24, 0.5, LC.lureGlow); cageLamp(g, X, Y, reveal ? LC.seam : '#2a1c1a', 1);
  if (reveal) { g.fillStyle = LC.bulbD; g.fillRect(X - 4, Y - 20, 9, 1); g.fillRect(X - 4, Y - 3, 9, 1); }   /* the flesh the cage was */
  if (limp) { g.fillStyle = LC.seam; g.fillRect(X - 3, Y, 7, 1); }
}
/* THE KEY (B14): chevrons beside what it keys. dir -1 = up (HIT HIGH: under a dangling light), +1 = down (HIT LOW: over its gums) */
export function drawKey(g, x, y, dir, time) {
  const p = 0.5 + 0.5 * Math.sin(time * 6); g.globalAlpha = 0.55 + 0.4 * p; g.fillStyle = LC.key;
  for (let k = 0; k < 2; k++) { const yy = R(y) + dir * k * 4; for (let i = -3; i <= 3; i++) g.fillRect(R(x) + i, yy + dir * (3 - Math.abs(i)), 1, 1); }
  g.globalAlpha = 1;
}
/* ------------------------------ the beast ------------------------------ */
/* ITS BULK under the water: a long dark shape, two pale eyes sliding past (a = how near the surface it is, 0..1) */
export function drawBulk(g, x, surf, a, face, time) {
  const X = R(x), S = R(surf); g.globalAlpha = 0.25 + 0.35 * a; g.fillStyle = '#04080a'; g.beginPath(); g.ellipse(X, S + 14, 64, 9, 0, 0, 6.3); g.fill();
  g.globalAlpha = (0.25 + 0.6 * a) * (0.7 + 0.3 * Math.sin(time * 2)); g.fillStyle = LC.eye; g.fillRect(X + face * 30, S + 9, 2, 1); g.fillRect(X + face * 22, S + 10, 2, 1); g.globalAlpha = 1;
}
/* THE JAWS out of the water at the raft's end (x the gums' middle, deck the deck's y, side -1 west end / +1 east end, gape 0..1, key: draw the LOW chevrons) */
export function drawJaws(g, x, deck, side, gape, time, key) {
  const X = R(x), D = R(deck), up = R(14 + 12 * gape), f = -side;   /* f: the way its mouth faces (in toward the raft) */
  g.fillStyle = LC.maw; g.fillRect(X - 16, D - up - 6, 32, up + 18);   /* the throat behind */
  g.fillStyle = LC.jaw; g.fillRect(X - 18, D - up - 10, 36, 7); g.fillStyle = LC.jawL; g.fillRect(X - 18, D - up - 10, 36, 1);   /* the upper jaw */
  g.fillStyle = LC.tooth; for (let i = -16; i <= 15; i += 4) { const l = 4 + ((i + 16) % 8 === 0 ? 3 : 0); g.fillRect(X + i, D - up - 3, 1, l); }   /* needle teeth down */
  g.fillStyle = LC.jaw; g.fillRect(X - 18, D + 3, 36, 8); g.fillStyle = LC.jawL; g.fillRect(X - 18, D + 3, 36, 1);   /* the lower jaw, at the water */
  g.fillStyle = LC.gum; g.fillRect(X - 15, D - 2, 30, 5); g.fillStyle = LC.gumL; g.fillRect(X - 15, D - 2, 30, 1);   /* THE GUMS: the pale pink band at the rail (HIT LOW) */
  g.fillStyle = LC.tooth; for (let i = -14; i <= 14; i += 5) g.fillRect(X + i, D - 6, 1, 4);   /* teeth up from the gums */
  g.fillStyle = LC.eye; g.fillRect(X + f * 12, D - up - 14, 2, 2); g.fillStyle = '#04080a'; g.fillRect(X + f * 12 + (f > 0 ? 1 : 0), D - up - 13, 1, 1);   /* an eye over it */
  if (key) drawKey(g, X, D - up - 18, 1, time);
}
/* THE JAWS SHUT ON THE RAFT'S TIMBER (stuck: OPEN): teeth through the deck at x */
export function drawClamped(g, x, deck, time) {
  const X = R(x), D = R(deck); g.fillStyle = LC.jaw; g.fillRect(X - 17, D - 14, 34, 9); g.fillStyle = LC.jawL; g.fillRect(X - 17, D - 14, 34, 1);
  g.fillStyle = LC.gum; g.fillRect(X - 14, D - 6, 28, 3); g.fillStyle = LC.tooth; for (let i = -14; i <= 14; i += 4) g.fillRect(X + i, D - 5, 1, 7);
  g.fillStyle = '#0c0a08'; g.fillRect(X - 8, D - 1, 17, 2); g.fillStyle = '#7a6440'; for (const [dx, dy] of [[-10, -2], [-7, -3], [7, -3], [10, -1]]) g.fillRect(X + dx, D + dy, 1, 2);   /* the deck split */
  void time;
}
/* THE GULP / THE HUNT coming: a ring of water boiling up where the jaws will close (k 0..1 how near) */
export function drawBoil(g, x, surf, r, k, time) {
  const X = R(x), S = R(surf), f = Math.floor(time * 12) % 2; g.strokeStyle = f ? LC.warn : '#c8ffe0'; g.lineWidth = 1;
  for (let q = 0; q < 3; q++) { g.beginPath(); g.ellipse(X, S, r * (0.4 + 0.25 * q) + k * 6, 1.5 + q, 0, 0, 6.3); g.stroke(); }
}
/* a told zone on the deck (red, the ends ticked): the gulp's, the hunt's, the snap's mark */
export function drawZone(g, x0, x1, y, k, time, col) {
  const p = 0.5 + 0.5 * Math.sin(time * 18); g.globalAlpha = 0.3 + 0.45 * k + 0.2 * p; g.fillStyle = col || LC.warn;
  g.fillRect(R(x0), R(y), R(x1 - x0) + 1, 1); g.fillRect(R(x0), R(y) - 4, 1, 4); g.fillRect(R(x1), R(y) - 4, 1, 4); g.globalAlpha = 1;
}
/* THE JAWS SNAPPING UP (the gulp, the hunt): out of the water at x for a moment */
export function drawGulp(g, x, deck, k, time) { const X = R(x), D = R(deck), h = R(30 * Math.sin(Math.min(1, k) * Math.PI));
  g.fillStyle = LC.maw; g.fillRect(X - 20, D - h, 40, h + 10); g.fillStyle = LC.tooth; for (let i = -18; i <= 18; i += 4) { g.fillRect(X + i, D - h, 1, 5); g.fillRect(X + i + 2, D + 4, 1, 5); }
  g.fillStyle = LC.eye; g.fillRect(X - 14, D - h - 4, 2, 2); g.fillRect(X + 12, D - h - 4, 2, 2); void time; }
/* a COPY of the light out in the fog (phase three, dimmed): a lure-shaped glow, and the splash of the jaws taking it */
export function drawDecoy(g, x, surf, t, time) { const X = R(x), S = R(surf), a = Math.min(1, t * 2);
  g.globalAlpha = 0.5 * a; const gr = g.createRadialGradient(X, S - 30, 1, X, S - 30, 14); gr.addColorStop(0, 'rgba(' + LC.lureGlow + ',0.8)'); gr.addColorStop(1, 'rgba(' + LC.lureGlow + ',0)'); g.fillStyle = gr; g.fillRect(X - 14, S - 44, 28, 28);
  g.globalAlpha = 1 - a; g.fillStyle = '#c8ffe0'; for (let i = 0; i < 6; i++) g.fillRect(X - 10 + i * 4, S - 4 - ((i * 7) % 9), 1, 3); g.globalAlpha = 1; void time; }
/* THE BASIN'S OWN LAMPS on their posts along the back wall (out = snuffed in phase three) */
export function drawBasinLamp(g, x, y, out, time) {
  const X = R(x), Y = R(y); g.fillStyle = '#26282c'; g.fillRect(X, Y - 40, 2, 40); g.fillRect(X - 3, Y - 41, 8, 1);
  g.fillStyle = LC.cage; g.fillRect(X - 3, Y - 40, 7, 1); g.fillRect(X - 3, Y - 33, 7, 1);
  if (out) { g.fillStyle = '#2a2a2a'; g.fillRect(X - 2, Y - 39, 5, 6); g.globalAlpha = 0.4; g.fillStyle = '#8a8a8a'; g.fillRect(X, Y - 44 - (time * 6 % 6), 1, 2); g.globalAlpha = 1; return; }   /* snuffed: a thread of smoke */
  const fl = 0.8 + 0.2 * Math.sin(time * 7 + x); g.globalAlpha = 0.8 * fl; g.fillStyle = LC.flame; g.fillRect(X - 2, Y - 39, 5, 6); g.globalAlpha = 1;
  const gr = g.createRadialGradient(X, Y - 36, 1, X, Y - 36, 18); gr.addColorStop(0, 'rgba(' + LC.glow + ',' + (0.35 * fl).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + LC.glow + ',0)'); g.fillStyle = gr; g.fillRect(X - 18, Y - 54, 36, 36);
}
/* ------------------------------ the basin's own stone (claude/canal4art's lock skins, the parts the raft chamber wears) ------------------------------ */
export function bakeBasinSkins() {
  const tile = draw => { const [c, g] = canvas(16, 16); draw(g); return c; };
  const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); }, px = (g, x, y, c) => rect(g, x, y, 1, 1, c);
  const gate = [0, 1, 2].map(v => tile(g => { rect(g, 0, 0, 16, 16, '#2e2418');
    for (let x = 0; x < 16; x += 4) { rect(g, x, 0, 1, 16, '#1c150e'); rect(g, x + 1, 0, 1, 16, '#3e3122'); }
    if (v === 1) { rect(g, 0, 6, 16, 3, '#3a3e44'); rect(g, 0, 6, 16, 1, '#5a6068'); for (let x = 2; x < 16; x += 5) px(g, x, 7, '#8a929c'); }
    if (v === 2) for (let y = 10; y < 16; y++) for (let x = (y * 3) % 4; x < 16; x += 4) px(g, x, y, '#3a5a2a'); }));
  const walk = tile(g => { rect(g, 0, 0, 16, 4, '#5a4630'); rect(g, 0, 0, 16, 1, '#ffd890'); for (let x = 0; x < 16; x += 5) rect(g, x, 1, 1, 3, '#3a2c1c');
    rect(g, 0, 4, 16, 3, '#3a3e44'); rect(g, 0, 4, 16, 1, '#5a6068'); px(g, 4, 5, '#8a929c'); px(g, 12, 5, '#8a929c'); });
  const bed = [0, 1, 2].map(v => tile(g => { rect(g, 0, 0, 16, 16, '#4a4a44');
    for (let y = 4; y < 16; y += 6) { rect(g, 0, y, 16, 1, '#2e2e2a'); for (let x = (y + v * 3) % 8; x < 16; x += 8) rect(g, x, y - 5, 1, 5, '#2e2e2a'); }
    rect(g, 0, 0, 16, 3, '#3e3424'); rect(g, 0, 0, 16, 1, '#5e5034'); px(g, 3 + v * 4, 1, '#6a7a3a'); px(g, 11 - v, 2, '#2a3a1a'); }));
  const bed2 = tile(g => { rect(g, 0, 0, 16, 16, '#3e3e3a'); for (let y = 3; y < 16; y += 6) { rect(g, 0, y, 16, 1, '#26261f'); for (let x = y % 8; x < 16; x += 8) rect(g, x, y - 5, 1, 5, '#26261f'); } });
  const quoin = [0, 1].map(v => tile(g => { rect(g, 0, 0, 16, 16, '#5a5850'); rect(g, 0, 7, 16, 1, '#34332e'); rect(g, 0, 15, 16, 1, '#34332e');
    rect(g, v ? 5 : 11, 0, 1, 7, '#34332e'); rect(g, v ? 12 : 3, 8, 1, 7, '#34332e'); rect(g, 0, 0, 16, 1, '#76746a'); rect(g, 0, 8, 16, 1, '#6a685e'); }));
  return { gate, walk, bed, bed2, quoin };
}
/* ITS CARD (the bestiary, the boss's title): the jaws out of the dark water, the lure hung over them on its stalk */
export function bakeCard() {
  const W = 52, Hh = 48, [c, g] = canvas(W, Hh); g.fillStyle = '#0a1418'; g.fillRect(0, 38, W, 10); g.fillStyle = '#2a4a50'; g.fillRect(0, 38, W, 1);
  drawJaws(g, 22, 36, 1, 0.8, 0, false); drawLure(g, 38, 24, 2, 46, 38, 0, false, true);
  return { R: [c], L: [c], w: 40, h: 40 };
}
