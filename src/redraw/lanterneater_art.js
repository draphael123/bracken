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
/* small pixel helpers */
const ell = (g, cx, cy, rx, ry, col) => { g.fillStyle = col; for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry + 0.01)))); g.fillRect(cx - w, cy + y, w * 2 + 1, 1); } };
/* THE RAFT'S LANTERN on its pole (x the lantern's centre, y the deck): hip height. Lit: a full flame, a flickering halo, the light the whole fight turns on;
   shuttered (dimmed): an iron shutter down over a pulsing ember and a thread of smoke. hot = phase three, where it is the only light */
export function drawRaftLantern(g, x, y, lit, time, hot) {
  const X = R(x), Y = R(y) + 10;
  g.fillStyle = '#2a2420'; g.fillRect(X - 5, Y - 34, 2, 24); g.fillRect(X - 5, Y - 35, 9, 1); g.fillStyle = '#4a4036'; g.fillRect(X - 5, Y - 34, 1, 24); g.fillStyle = '#1a1612'; g.fillRect(X - 6, Y - 12, 4, 2);   /* the post, its arm, its foot-iron */
  g.fillStyle = '#6a7078'; g.fillRect(X, Y - 34, 1, 2); g.fillRect(X - 1, Y - 33, 3, 1);                                                                                                     /* the hook and the ring */
  g.fillStyle = LC.cage; g.fillRect(X - 3, Y - 32, 7, 1); g.fillRect(X - 2, Y - 33, 5, 1); g.fillRect(X - 3, Y - 21, 7, 2); g.fillRect(X - 3, Y - 31, 1, 10); g.fillRect(X + 3, Y - 31, 1, 10);   /* the cap, the base, the bars */
  g.fillStyle = '#4a4e56'; g.fillRect(X - 2, Y - 32, 1, 1); g.fillRect(X - 3, Y - 31, 1, 1);
  if (lit) { const fl = 0.85 + 0.15 * Math.sin(time * 9) * Math.cos(time * 5.3), tall = fl > 0.95 ? 8 : 7;
    const gr = g.createRadialGradient(X, Y - 26, 1, X, Y - 26, hot ? 28 : 16); gr.addColorStop(0, 'rgba(' + LC.glow + ',' + ((hot ? 0.6 : 0.3) * fl).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + LC.glow + ',0)'); g.fillStyle = gr; g.fillRect(X - 30, Y - 56, 60, 60);
    g.fillStyle = 'rgba(255,214,128,0.35)'; g.fillRect(X - 2, Y - 30, 5, 9);   /* the glass, warm */
    g.fillStyle = LC.flame; g.fillRect(X - 1, Y - 29 + (8 - tall), 3, tall - 1); g.fillRect(X - 2, Y - 26, 5, 4); g.fillStyle = LC.flameHot; g.fillRect(X, Y - 26, 1, 4); g.fillRect(X - 1, Y - 24, 3, 2); g.fillStyle = '#e8903a'; g.fillRect(X - 2, Y - 22, 5, 1); }
  else { g.fillStyle = '#34302c'; g.fillRect(X - 2, Y - 30, 5, 9); g.fillStyle = '#4a4640'; g.fillRect(X - 2, Y - 30, 5, 1); g.fillRect(X - 2, Y - 26, 5, 1); g.fillRect(X - 2, Y - 22, 5, 1); g.fillStyle = '#6a625a'; g.fillRect(X - 2, Y - 30, 1, 9);   /* the shutter plates, rivetted */
    const em = 0.55 + 0.45 * Math.sin(time * 3); g.globalAlpha = em; g.fillStyle = '#c8501a'; g.fillRect(X, Y - 25, 1, 1); g.fillStyle = '#ff8a3a'; g.fillRect(X, Y - 24, 1, 1); g.globalAlpha = 0.3 * em; g.fillStyle = '#ff6a2a'; g.fillRect(X - 1, Y - 25, 3, 3); g.globalAlpha = 1;   /* the ember through the slit */
    g.globalAlpha = 0.35; g.fillStyle = '#8a8a8a'; for (let k = 0; k < 4; k++) g.fillRect(X + R(Math.sin(time * 2 + k) * 1.5), Y - 35 - ((time * 8 + k * 4) % 14), 1, 1); g.globalAlpha = 1; }   /* a thread of smoke */
}
/* ------------------------------ the two lights: the SAME caged lantern, told apart only by how they MOVE (the read) ------------------------------ */
/* the caged lantern both lights wear: cap and ring, iron posts, a warm glass (a = its brightness 0..1), the inside left to the caller. Y = the base of the cage */
function cageShell(g, X, Y, bars, a) {
  g.fillStyle = bars; g.fillRect(X - 1, Y - 25, 3, 1); g.fillRect(X - 2, Y - 24, 5, 1); g.fillRect(X - 4, Y - 23, 9, 1); g.fillRect(X - 5, Y - 22, 11, 2);   /* ring, cap */
  g.fillRect(X - 5, Y - 3, 11, 3); g.fillRect(X - 5, Y - 20, 1, 17); g.fillRect(X + 5, Y - 20, 1, 17);                                                     /* base, the two posts */
  g.globalAlpha = 0.18 + 0.3 * a; g.fillStyle = '#ffd890'; g.fillRect(X - 4, Y - 20, 9, 17); g.globalAlpha = 1;                                           /* the glass */
}
function cageBars(g, X, Y, bars) { g.fillStyle = bars; g.fillRect(X, Y - 20, 1, 17); g.fillRect(X - 5, Y - 12, 11, 1); g.globalAlpha = 0.5; g.fillStyle = '#8a8e96'; g.fillRect(X - 5, Y - 20, 1, 17); g.globalAlpha = 1; }   /* the centre bar, the waist band, a glint of iron */
const glowAt = (g, X, Y, r, a, col) => { const gr = g.createRadialGradient(X, Y - 11, 1, X, Y - 11, r); gr.addColorStop(0, 'rgba(' + col + ',' + a.toFixed(3) + ')'); gr.addColorStop(0.5, 'rgba(' + col + ',' + (a * 0.4).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.fillRect(X - r - 2, Y - r - 13, r * 2 + 4, r * 2 + 4); };
/* THE REAL LAMP: hung DEAD STILL on a plain iron chain up into the fog; its flame FLICKERS - a ragged tongue that gutters low and leaps, the glow jumping with it,
   a thread of smoke leaving the cage (flick 0..1). Its light dips right down now and then: that is the tell, and the lure never does it. */
export function drawLamp(g, x, y, flick, time) {
  const X = R(x), Y = R(y);
  for (let yy = Y - 74, k = 0; yy < Y - 26; yy += 3, k++) { g.globalAlpha = 0.18 + 0.4 * Math.max(0, 1 - (Y - 26 - yy) / 48); g.fillStyle = LC.chain; if (k & 1) g.fillRect(X - 1, yy, 3, 1); else g.fillRect(X, yy, 1, 2); }   /* the chain, link by link, fading up into the fog */
  g.globalAlpha = 1;
  glowAt(g, X, Y, 14 + 14 * flick, 0.15 + 0.5 * flick, LC.glow);
  cageShell(g, X, Y, LC.cage, flick);
  const th = flick < 0.35 ? 2 : flick < 0.6 ? 4 : flick < 0.85 ? 7 : 10, lean = R(Math.sin(time * 31 + flick * 9) * (flick < 0.6 ? 0 : 1)), by = Y - 5;
  g.fillStyle = '#e8903a'; g.fillRect(X - 2 + lean, by - 3, 5, 3); g.fillStyle = LC.flame; g.fillRect(X - 1 + lean, by - th, 3, th); if (th > 5) g.fillRect(X + lean, by - th - 1, 1, 2); g.fillStyle = LC.flameHot; g.fillRect(X + lean, by - R(th * 0.65), 1, R(th * 0.5) + 1);   /* the tongue */
  g.fillStyle = '#4a3a24'; g.fillRect(X - 1, by, 3, 1);                                                                                                                       /* the wick cup */
  cageBars(g, X, Y, LC.cage);
  g.globalAlpha = 0.28 * Math.max(0.3, flick); g.fillStyle = '#9a9a9a'; for (let k = 0; k < 5; k++) g.fillRect(X + R(Math.sin(time * 3.1 + k * 1.3) * (1 + k * 0.5)), Y - 27 - ((time * 9 + k * 4.6) % 20), 1, 1); g.globalAlpha = 1;   /* the smoke leaving the cap */
}
/* a point on the stalk's curve (b the base, c the control, d the end), t 0..1 */
const quad = (b, c, d, t) => (1 - t) * (1 - t) * b + 2 * (1 - t) * t * c + t * t * d;
/* THE LURE: the SAME caged light - but a fleshy BULB inside the cage, and it SWAYS (sx: slow and smooth, side to side) and its light NEVER flickers - it only
   breathes (a slow pulse). Its stalk is a faint thread in the fog (reveal = struck or snagged: the stalk shows pale, veined, all the way down to the water, and the cage
   is flesh; limp = open: it jerks on its stalk) */
export function drawLure(g, x, y, sx, stalkFromX, waterY, time, limp, reveal) {
  const jx = limp ? R(Math.sin(time * 38) * 1.6 + Math.sin(time * 23)) : 0, jy = limp ? R(Math.sin(time * 31)) : 0;
  const X = R(x + sx) + jx, Y = R(y) + jy, bx = R(stalkFromX), wy = R(waterY), cxp = limp ? (bx + X) / 2 : (bx + X) / 2 + sx * 2, cyp = limp ? (wy + Y) / 2 : Y - 70;
  const pt = (t) => [R(quad(bx, cxp, X, t)), R(quad(wy, cyp, Y - 25, t))], pulse = 0.5 + 0.5 * Math.sin(time * 2.1);
  /* the stalk: from the water to the cage's ring */
  for (let i = 0; i <= 40; i++) { const [px, py] = pt(i / 40);
    if (reveal) { g.globalAlpha = 1; g.fillStyle = LC.stalkD; g.fillRect(px - 1, py, 3, 1); g.fillStyle = LC.stalk; g.fillRect(px, py, 1, 1); if (i % 7 === 3) { g.fillStyle = '#a05058'; g.fillRect(px + 1, py, 1, 1); } }   /* pale, veined */
    else { g.globalAlpha = 0.14 + 0.05 * Math.sin(i * 0.8 - time * 2); g.fillStyle = LC.stalk; g.fillRect(px, py, 1, 1); } }
  if (reveal) { const t = (time * 0.9) % 1, [px, py] = pt(1 - t); g.globalAlpha = 0.9; g.fillStyle = '#ffe6a0'; g.fillRect(px, py, 1, 2); g.fillRect(px - 1, py + 1, 3, 1); }   /* the pulse running up the stalk to the bulb */
  g.globalAlpha = 1;
  glowAt(g, X, Y, 24 + 3 * pulse, 0.42 + 0.14 * pulse, LC.lureGlow);
  cageShell(g, X, Y, reveal ? LC.seam : '#2a1c1a', 1);
  /* the bulb: round, fleshy, breathing - where the lamp has a tongue of flame */
  const rr = 4 + (pulse > 0.6 ? 1 : 0), cy0 = Y - 11; ell(g, X, cy0 + 1, rr, rr + 2, '#b8782a'); ell(g, X, cy0, rr - 1, rr + 1, LC.bulb); ell(g, X, cy0 - 1, Math.max(1, rr - 3), Math.max(2, rr - 1), LC.flame); g.fillStyle = LC.flameHot; g.fillRect(X - 1, cy0 - 3, 2, 2);
  g.fillStyle = LC.bulbD; g.fillRect(X + rr - 2, cy0 - 1, 1, 4); g.fillRect(X - rr + 1, cy0 + 2, 1, 2);           /* the shaded side, a dark seam */
  if (reveal) { g.fillStyle = '#a05058'; g.fillRect(X - 3, cy0 - 4, 1, 3); g.fillRect(X + 2, cy0 - 3, 1, 4); g.fillRect(X - 2, cy0 + 3, 3, 1); g.fillStyle = LC.seam; g.fillRect(X - 5, Y - 21, 11, 1); g.fillRect(X - 5, Y - 3, 11, 1); }   /* veins; the flesh the cage was */
  cageBars(g, X, Y, reveal ? LC.seam : '#2a1c1a');
  if (limp) { g.fillStyle = LC.seam; g.fillRect(X - 3, Y, 7, 1); g.globalAlpha = 0.7; g.fillStyle = '#fff2b0'; g.fillRect(X + 6, Y - 18, 1, 1); g.fillRect(X - 7, Y - 8, 1, 1); g.fillRect(X + 7, Y - 5, 1, 1); g.globalAlpha = 1; }   /* it struggles: sparks off it */
}
/* a GLIMPSE of the lure in the fog (the foreshadowing in the level): the same swaying caged bulb, small, on its thread; a = fade 0..1, sx the sway */
export function drawGlimpse(g, x, y, sx, baseX, baseY, a, time) {
  const X = R(x + sx), Y = R(y), pulse = 0.5 + 0.5 * Math.sin(time * 2.1);
  for (let i = 0; i <= 24; i++) { const t = i / 24; g.globalAlpha = (0.12 + 0.2 * (1 - t)) * a; g.fillStyle = LC.stalk; g.fillRect(R(quad(baseX, (baseX + X) / 2 + sx * 2, X, t)), R(quad(baseY, Y - 20, Y - 9, t)), 1, 1); }
  glowAt(g, X, Y + 8, 16 + 2 * pulse, (0.4 + 0.1 * pulse) * a, LC.lureGlow); g.globalAlpha = 0.85 * a;
  g.fillStyle = '#2a1c1a'; g.fillRect(X - 3, Y - 9, 7, 1); g.fillRect(X - 3, Y - 1, 7, 1); g.fillRect(X - 3, Y - 8, 1, 7); g.fillRect(X + 3, Y - 8, 1, 7);
  g.fillStyle = LC.bulb; g.fillRect(X - 2, Y - 7, 5, 5); g.fillStyle = LC.flame; g.fillRect(X - 1, Y - 6, 3, 3); g.fillStyle = LC.flameHot; g.fillRect(X, Y - 5, 1, 1); g.globalAlpha = 1;
}
/* THE KEY (B14): chevrons beside what it keys. dir -1 = up (HIT HIGH: under a dangling light), +1 = down (HIT LOW: over its gums) */
export function drawKey(g, x, y, dir, time) {
  const p = 0.5 + 0.5 * Math.sin(time * 6); g.globalAlpha = 0.55 + 0.4 * p; g.fillStyle = LC.key;
  for (let k = 0; k < 2; k++) { const yy = R(y) + dir * k * 4; for (let i = -3; i <= 3; i++) g.fillRect(R(x) + i, yy + dir * (3 - Math.abs(i)), 1, 1); }
  g.globalAlpha = 1;
}
/* ------------------------------ the beast ------------------------------ */
/* ITS BULK under the water: an anglerfish seen through black-green water - a deep head, a ragged dorsal fin, a swept tail, a pectoral fin, a row of cold bioluminescent
   spots along its flank, a pale eye (a = how near the surface it is, 0..1; face = the way its head points) */
export function drawBulk(g, x, surf, a, face, time) {
  const X = R(x), S = R(surf), f = face >= 0 ? 1 : -1, br = Math.sin(time * 1.3), by = S + 17 + R(br), A = 0.3 + 0.5 * a, hx = X + f * 34, tx = X - f * 52;
  g.globalAlpha = A * 0.9;
  ell(g, X + f * 6, by, 50, 11, '#07100f'); ell(g, hx, by + 1, 22, 14, '#07100f');                           /* the body, the deep head */
  for (let i = 0; i < 6; i++) { const w = 14 - i * 2; g.fillStyle = '#07100f'; g.fillRect(f > 0 ? tx - w + 2 : tx - 2, by - 1 - i, w, 3 + i * 1.5); }   /* the tail swept to a fork */
  g.fillStyle = '#07100f'; for (let i = -3; i < 6; i++) { const h = 5 + ((i * 7) & 3) * 2 - (i > 3 ? i : 0); g.fillRect(X + f * i * 6 - 1, by - 12 - h, 2, h + 2); }   /* the ragged dorsal spines */
  ell(g, X + f * 4, by + 12, 8, 2, '#07100f');                                                                  /* the pectoral fin, lazy */
  g.globalAlpha = A * 0.55; g.fillStyle = '#2a4a44'; g.fillRect(X - 40, by - 11, 76, 1); g.fillRect(hx - 12, by - 14, 24, 1);   /* the cold light on its back */
  g.fillStyle = '#16282a'; g.fillRect(X - 36, by + 6, 70, 2);                                                   /* the pale belly */
  /* the bioluminescent spots along its flank, pulsing one after another */
  for (let i = 0; i < 7; i++) { const p = 0.5 + 0.5 * Math.sin(time * 2.2 - i * 0.7); g.globalAlpha = A * (0.35 + 0.65 * p); g.fillStyle = '#7fe8c8'; g.fillRect(X - f * 38 + f * i * 11, by - 1 + ((i * 5) % 4), 1, 1); if (p > 0.8) { g.globalAlpha = A * 0.4; g.fillRect(X - f * 38 + f * i * 11 - 1, by - 1 + ((i * 5) % 4), 3, 1); } }
  /* the maw's line and the eye */
  g.globalAlpha = A * 0.8; g.fillStyle = '#c8c4ac'; for (let i = 0; i < 9; i++) g.fillRect(hx + f * 12 + (f > 0 ? i * 1 : -i * 1), by + 6 - (i >> 1), 1, 1 + (i & 1));   /* teeth along the jaw line */
  g.globalAlpha = A; g.fillStyle = '#3a5a30'; g.fillRect(hx + f * 4 - 2, by - 5, 5, 5); g.fillStyle = LC.eye; g.fillRect(hx + f * 4 - 1, by - 4, 3, 3); g.fillStyle = '#04080a'; g.fillRect(hx + f * 4, by - 4, 1, 3);   /* the eye, a slit */
  g.globalAlpha = A * 0.5; g.fillStyle = '#6a7a6a'; g.fillRect(hx - f * 4, by - 24, 1, 12); g.fillRect(hx - f * 4 + f, by - 24, 1, 3);   /* the rod it bears the lure on, folded back */
  g.globalAlpha = 1;
}
/* THE JAWS out of the water at the raft's end (x the gums' middle, deck the deck's y, side -1 west end / +1 east end, gape 0..1, key: draw the LOW chevrons,
   rise 0..1: how far out of the water it is - the surfacing, and the sinking) */
export function drawJaws(g, x, deck, side, gape, time, key, rise) {
  rise = rise === undefined ? 1 : rise; if (rise <= 0) return;
  const X = R(x), D0 = R(deck), D = D0 + R((1 - rise) * 26), up = R(14 + 12 * gape), f = -side;   /* f: the way its mouth faces (in toward the raft) */
  g.save(); if (rise < 1) { g.beginPath(); g.rect(X - 40, D0 - 80, 80, 80 + 11); g.clip(); }   /* it comes up out of the water: nothing shows below it */
  /* the head behind: a warty brow, a mottled hide */
  g.fillStyle = '#0c1618'; g.fillRect(X - 22, D - up - 20, 44, 14); g.fillStyle = '#1e2a30'; g.fillRect(X - 20, D - up - 22, 40, 4); g.fillStyle = '#3a4a50'; g.fillRect(X - 20, D - up - 22, 40, 1);
  g.fillStyle = '#4a6a58'; for (const dx of [-15, -8, 3, 12]) g.fillRect(X + dx, D - up - 19, 2, 1); g.fillStyle = '#2c3c3a'; for (const dx of [-17, -4, 8, 16]) g.fillRect(X + dx, D - up - 16, 3, 1);
  g.fillStyle = LC.maw; g.fillRect(X - 17, D - up - 6, 34, up + 20); g.fillStyle = '#05080a'; g.fillRect(X - 12, D - up - 4, 24, up + 4);   /* the throat, black */
  g.fillStyle = '#3a1820'; g.fillRect(X - 9, D - 8, 18, 3); g.fillStyle = '#6a3038'; g.fillRect(X - 7, D - 8, 14, 1);                           /* the gullet's glimmer */
  g.fillStyle = LC.jaw; g.fillRect(X - 19, D - up - 10, 38, 7); g.fillStyle = LC.jawL; g.fillRect(X - 19, D - up - 10, 38, 1); g.fillStyle = '#10181c'; g.fillRect(X - 19, D - up - 4, 38, 1);   /* the upper jaw */
  /* upper teeth: needles of every length, shaded on one side */
  for (let i = -17, k = 0; i <= 17; i += 3, k++) { const l = 4 + ((k * 5) % 4) + (k % 3 === 0 ? 3 : 0); g.fillStyle = LC.tooth; g.fillRect(X + i, D - up - 3, 1, l); g.fillStyle = '#a8a48c'; g.fillRect(X + i + 1, D - up - 3, 1, l - 2); g.fillStyle = '#fffbe8'; g.fillRect(X + i, D - up - 3, 1, 1); }
  g.fillStyle = LC.jaw; g.fillRect(X - 19, D + 3, 38, 9); g.fillStyle = LC.jawL; g.fillRect(X - 19, D + 3, 38, 1); g.fillStyle = '#10181c'; g.fillRect(X - 19, D + 9, 38, 3);   /* the lower jaw, at the water */
  /* THE GUMS: a wet pink band at the rail (HIT LOW) - the keyed part, so the brightest thing on it */
  g.fillStyle = '#8a3a4a'; g.fillRect(X - 16, D - 3, 32, 7); g.fillStyle = LC.gum; g.fillRect(X - 15, D - 2, 30, 5); g.fillStyle = LC.gumL; g.fillRect(X - 15, D - 2, 30, 1); g.fillStyle = '#e8788a'; for (let i = -12; i <= 12; i += 6) g.fillRect(X + i, D, 2, 1); g.fillStyle = '#ffd0d8'; for (let i = -13; i <= 13; i += 9) g.fillRect(X + i + ((Math.floor(time * 2) + i) & 1), D - 2, 1, 1);
  for (let i = -14, k = 0; i <= 14; i += 4, k++) { const l = 3 + (k % 3); g.fillStyle = LC.tooth; g.fillRect(X + i, D - 3 - l, 1, l); g.fillStyle = '#a8a48c'; g.fillRect(X + i + 1, D - 3 - l + 2, 1, l - 2); }   /* teeth up from the gums */
  /* the eye: a big pale green eye with a slit, a brow over it */
  const ex = X + f * 13, ey = D - up - 15; g.fillStyle = '#04080a'; g.fillRect(ex - 3, ey - 2, 6, 6); g.fillStyle = '#6a9a50'; g.fillRect(ex - 2, ey - 1, 4, 4); g.fillStyle = LC.eye; g.fillRect(ex - 1, ey, 2, 2); g.fillStyle = '#04080a'; g.fillRect(ex, ey - 1, 1, 4); g.fillStyle = '#fff'; g.fillRect(ex - 1, ey, 1, 1);
  g.fillStyle = '#0c1618'; g.fillRect(ex - 4, ey - 3, 8, 2);
  g.restore();
  /* the water sheeting off it: streaks down the hide and drips off the teeth, foam where it meets the rail */
  g.fillStyle = '#bfe6f5'; for (let i = 0; i < 6; i++) { const px = X - 17 + i * 7 + ((i * 3) & 3), len = 5 + ((i * 5) % 6), ph = (time * 14 + i * 5) % (len + 8); g.globalAlpha = 0.55 * rise; g.fillRect(px, D - up - 20 + R(ph), 1, 2); g.globalAlpha = 0.25 * rise; g.fillRect(px, D - up - 20, 1, len); }
  g.globalAlpha = 0.8 * rise; g.fillStyle = '#e8f4f0'; for (let i = -3; i <= 3; i++) g.fillRect(X - 19 + (i + 3) * 6 + ((i * 3) & 1), D0 + 10 + (rise < 1 ? 0 : 1), 3, 1); g.globalAlpha = 1;
  if (key) drawKey(g, X, D - up - 26, 1, time);
}
/* THE JAWS SHUT ON THE RAFT'S TIMBER (stuck: OPEN): teeth through the deck at x, and it STRUGGLES - the head shaking, the eye rolling, splinters flying, drool */
export function drawClamped(g, x, deck, time) {
  const sh = R(Math.sin(time * 30) * 1.4), sv = R(Math.sin(time * 23)), X = R(x) + sh, D = R(deck) + sv;
  g.fillStyle = '#0c1618'; g.fillRect(X - 19, D - 21, 38, 8); g.fillStyle = LC.jaw; g.fillRect(X - 19, D - 16, 38, 10); g.fillStyle = LC.jawL; g.fillRect(X - 19, D - 16, 38, 1); g.fillStyle = '#4a6a58'; for (const dx of [-14, -5, 6, 14]) g.fillRect(X + dx, D - 19, 2, 1);
  g.fillStyle = '#6a3038'; g.fillRect(X - 16, D - 7, 32, 4); g.fillStyle = LC.gum; g.fillRect(X - 15, D - 6, 30, 3); g.fillStyle = LC.gumL; g.fillRect(X - 15, D - 6, 30, 1);   /* the gums, pulled back, tight */
  for (let i = -15, k = 0; i <= 15; i += 3, k++) { const l = 6 + (k % 3); g.fillStyle = LC.tooth; g.fillRect(X + i, D - 4, 1, l); g.fillStyle = '#a8a48c'; g.fillRect(X + i + 1, D - 3, 1, l - 2); }   /* the teeth driven into the timber */
  g.fillStyle = '#0c0a08'; g.fillRect(X - 10, D - 1, 21, 2); g.fillStyle = '#7a6440'; for (const [dx, dy] of [[-12, -2], [-9, -4], [-6, -3], [6, -3], [9, -4], [12, -2]]) g.fillRect(X + dx, D + dy, 1, 2); g.fillStyle = '#c8a860'; g.fillRect(X - 9, D - 3, 1, 1); g.fillRect(X + 8, D - 4, 1, 1);   /* the deck split, bright splinters */
  for (let i = 0; i < 5; i++) { const t = (time * 2.2 + i * 0.37) % 1; g.globalAlpha = 1 - t; g.fillStyle = i & 1 ? '#c8a860' : '#7a6440'; g.fillRect(X - 14 + i * 7 + R(Math.sin(i * 2.1) * 4), D - 4 - R(t * 14 - t * t * 8), 2, 1); } g.globalAlpha = 1;   /* splinters */
  g.fillStyle = '#bfe6f5'; g.globalAlpha = 0.7; for (const dx of [-8, 3, 11]) g.fillRect(X + dx, D + 2 + R((time * 10 + dx) % 6), 1, 2); g.globalAlpha = 1;   /* drool */
  const ey = D - 18, ex = X + 12; g.fillStyle = '#04080a'; g.fillRect(ex - 3, ey - 2, 6, 6); g.fillStyle = '#d8f0c8'; g.fillRect(ex - 2, ey - 1, 4, 4); g.fillStyle = '#04080a'; g.fillRect(ex - 1 + (Math.sin(time * 14) > 0 ? 1 : 0), ey, 1, 2);   /* the eye rolling, white all round */
}
/* THE GULP / THE HUNT coming: rings of water boiling up where the jaws will close, bubbles breaking, a shadow growing under (k 0..1 how near) */
export function drawBoil(g, x, surf, r, k, time) {
  const X = R(x), S = R(surf), f = Math.floor(time * 12) % 2; g.globalAlpha = 0.25 + 0.4 * k; ell(g, X, S + 5, R(r * (0.5 + 0.4 * k)), 3, '#04080a'); g.globalAlpha = 1;
  g.strokeStyle = f ? LC.warn : '#c8ffe0'; g.lineWidth = 1;
  for (let q = 0; q < 3; q++) { g.beginPath(); g.ellipse(X, S, r * (0.4 + 0.25 * q) + k * 6, 1.5 + q, 0, 0, 6.3); g.stroke(); }
  g.fillStyle = '#e8f4f0'; for (let i = 0; i < 7; i++) { const t = (time * 1.6 + i * 0.29) % 1; g.globalAlpha = 0.9 * (1 - t); g.fillRect(X + R((i - 3) * r * 0.28 + Math.sin(time * 3 + i) * 2), S - R(t * (4 + 8 * k)), 1 + (i & 1), 1); } g.globalAlpha = 1;
}
/* a told zone on the deck (red, the ends ticked): the gulp's, the hunt's, the snap's mark */
export function drawZone(g, x0, x1, y, k, time, col) {
  const p = 0.5 + 0.5 * Math.sin(time * 18); g.globalAlpha = 0.3 + 0.45 * k + 0.2 * p; g.fillStyle = col || LC.warn;
  g.fillRect(R(x0), R(y), R(x1 - x0) + 1, 1); g.fillRect(R(x0), R(y) - 4, 1, 4); g.fillRect(R(x1), R(y) - 4, 1, 4); g.globalAlpha = 1;
}
/* THE JAWS SNAPPING UP (the gulp, the hunt): out of the water at x with the lower jaw dropped, then closing, teeth meeting, spray flung from both sides.
   shut: the SNAP - the maw already closed (teeth interlocked); drop: how far it has sunk (0 none .. 1 gone) */
export function drawGulp(g, x, deck, k, time, shut, drop) {
  const X = R(x), D = R(deck) + R((drop || 0) * 34), kk = Math.min(1, k), h = R(34 * Math.sin(kk * Math.PI)), gap = shut ? 0 : R(13 * Math.max(0, Math.sin(Math.min(1, kk * 1.6) * Math.PI)) * (kk < 0.62 ? 1 : Math.max(0, 1 - (kk - 0.62) / 0.3)));
  g.save(); g.beginPath(); g.rect(X - 50, R(deck) - 90, 100, 90 + 8); g.clip();
  g.fillStyle = '#0c1618'; g.fillRect(X - 22, D - h - gap, 44, h + 10 + gap);                                                                        /* the head */
  g.fillStyle = LC.jaw; g.fillRect(X - 21, D - h - gap, 42, 6); g.fillStyle = LC.jawL; g.fillRect(X - 21, D - h - gap, 42, 1);                          /* the upper jaw */
  if (gap > 1) { g.fillStyle = '#05080a'; g.fillRect(X - 19, D - h - gap + 6, 38, gap); g.fillStyle = '#6a3038'; g.fillRect(X - 6, D - h - gap + 6 + gap - 3, 12, 2); }   /* the open throat, the tongue's pink */
  g.fillStyle = LC.jaw; g.fillRect(X - 21, D - h + 6, 42, 5); g.fillStyle = LC.gum; g.fillRect(X - 19, D - h + 6, 38, 2);                              /* the lower jaw, the gums */
  for (let i = -19, q = 0; i <= 19; i += 3, q++) { const l = 5 + (q % 3); g.fillStyle = LC.tooth; g.fillRect(X + i, D - h - gap + 6, 1, l); g.fillRect(X + i + 1, D - h + 6 - l + 2, 1, l - 1); }   /* the teeth meeting */
  g.fillStyle = LC.eye; g.fillRect(X - 16, D - h - gap - 3, 3, 3); g.fillRect(X + 13, D - h - gap - 3, 3, 3); g.fillStyle = '#04080a'; g.fillRect(X - 15, D - h - gap - 3, 1, 3); g.fillRect(X + 14, D - h - gap - 3, 1, 3);   /* its eyes, on top */
  g.restore();
  g.fillStyle = '#e8f4f0'; for (let i = 0; i < 12; i++) { const side = i & 1 ? 1 : -1, t = (kk * 1.2 + i * 0.07) % 1, a = 6 + (i >> 1) * 4; g.globalAlpha = 0.9 * (1 - t); g.fillRect(X + side * (a + R(t * 14)), D - R(Math.sin(t * Math.PI) * (16 + (i % 3) * 6)), 1 + (i % 3 === 0 ? 1 : 0), 1); } g.globalAlpha = 1;   /* the spray */
  g.fillStyle = '#bfe6f5'; g.fillRect(X - 26, D + 6, 52, 1); g.fillStyle = '#e8f4f0'; for (let i = -24; i < 24; i += 6) g.fillRect(X + i + ((i * 3) & 3), D + 5, 3, 1); void time;
}
/* a COPY of the light out in the fog (phase three, dimmed): a small caged lure-light, then the splash of the jaws taking it - a ring, a plume, spray (t 1 -> 0) */
export function drawDecoy(g, x, surf, t, time) { const X = R(x), S = R(surf), a = Math.min(1, t * 2), pulse = 0.5 + 0.5 * Math.sin(time * 2.1);
  if (a > 0.02) { glowAt(g, X, S - 19, 15, 0.8 * a, LC.lureGlow); g.globalAlpha = 0.9 * a; g.fillStyle = '#2a1c1a'; g.fillRect(X - 3, S - 36, 7, 1); g.fillRect(X - 3, S - 28, 7, 1); g.fillRect(X - 3, S - 35, 1, 7); g.fillRect(X + 3, S - 35, 1, 7);
    g.fillStyle = LC.bulb; g.fillRect(X - 2, S - 34, 5, 6); g.fillStyle = LC.flame; g.fillRect(X - 1, S - 33 + (pulse > 0.6 ? 0 : 1), 3, 3); g.fillStyle = LC.flameHot; g.fillRect(X, S - 32, 1, 1); g.globalAlpha = 0.3 * a; g.fillStyle = LC.stalk; g.fillRect(X, S - 27, 1, 27); g.globalAlpha = 1; }
  if (a < 1) { const u = 1 - a;
    g.strokeStyle = '#c8ffe0'; g.lineWidth = 1; g.globalAlpha = 0.8 * a + 0.2; g.beginPath(); g.ellipse(X, S, 4 + 14 * u, 1 + 2 * u, 0, 0, 6.3); g.stroke(); g.globalAlpha = 1;
    g.fillStyle = '#e8f4f0'; for (let i = 0; i < 8; i++) { const sd = i & 1 ? 1 : -1; g.globalAlpha = 0.5 + 0.5 * a; g.fillRect(X + sd * (2 + (i >> 1) * 3 + R(u * 6)), S - R(Math.sin(Math.min(1, u * 1.4) * Math.PI) * (6 + (i % 4) * 4)), 1, 2); } g.globalAlpha = 1;
    g.fillStyle = '#04080a'; g.globalAlpha = 0.5 * a; g.fillRect(X - 8, S + 1, 17, 2); g.globalAlpha = 1; }
}
/* THE SWELL (its body passing under the raft): a hump of water along the deck, foam on its back, its dark shape moving under the surface, spray thrown off it */
export function drawSwell(g, x, dy, sf, dir, time) {
  g.globalAlpha = 0.45; ell(g, x - dir * 8, sf + 7, 34, 4, '#04080a'); g.globalAlpha = 1;
  for (let i = -24; i <= 24; i++) { const c = Math.cos(i / 24 * Math.PI / 2), h = R(15 * c * c * (i * dir > 0 ? 1 : 0.8)); if (h < 1) continue; const ty = dy + 4 - h;
    g.fillStyle = '#4a8a8e'; g.fillRect(x + i, ty, 1, h); g.fillStyle = '#7cc8c8'; g.fillRect(x + i, ty, 1, Math.min(3, h)); g.fillStyle = '#bfe6f5'; g.fillRect(x + i, ty, 1, Math.min(1 + (h > 7), h)); if (h > 11) { g.fillStyle = '#ffffff'; g.fillRect(x + i, ty, 1, 1); } }
  g.fillStyle = '#e8f4f0'; for (let i = 0; i < 9; i++) { const t = (time * 2.4 + i * 0.23) % 1; g.globalAlpha = 1 - t; g.fillRect(x + R(Math.sin(i * 2.7) * 18), dy - 12 - R(Math.sin(t * Math.PI) * (6 + (i % 3) * 3)), 1, 1 + (i & 1)); } g.globalAlpha = 1;
}
/* THE RAFT LANTERN'S LIGHT over the dark (phase three): lit, a warm wide pool that breathes; dimmed, an ember and a small red glow (dark: how far the dark has come, 0..1) */
export function drawLanternLight(g, x, y, lit, time, dark) {
  const fl = 0.9 + 0.1 * Math.sin(time * 9) * Math.cos(time * 5.3), r = lit ? 70 * fl : 14, gr = g.createRadialGradient(x, y, 1, x, y, r);
  gr.addColorStop(0, lit ? 'rgba(255,200,110,' + (0.3 * Math.min(1, dark * 2)).toFixed(3) + ')' : 'rgba(255,90,40,0.35)'); gr.addColorStop(1, 'rgba(255,160,80,0)');
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
}
/* ITS DEATH: the lure, last, guttering out above the water - it flickers at last, the bulb dimming, smoke, then dropping into the water in a ring (u 0..1) */
export function drawGutter(g, x, y, u, time, sf) {
  const X = R(x), fl = Math.max(0, (1 - u * 1.3)) * (Math.sin(time * 37 * (1 + u)) > -0.4 ? 1 : 0.15), Y = R(y + Math.max(0, u - 0.55) * 90);
  if (Y < sf - 2) { glowAt(g, X, Y, 22, 0.5 * fl, LC.lureGlow); g.globalAlpha = Math.max(0.2, 1 - u); cageShell(g, X, Y, '#2a1c1a', fl); ell(g, X, Y - 11, 3, 4, '#b8782a'); g.globalAlpha = fl; ell(g, X, Y - 11, 2, 3, LC.flame); g.globalAlpha = 1; cageBars(g, X, Y, '#2a1c1a');
    g.globalAlpha = 0.5; g.fillStyle = '#8a8a8a'; for (let i = 0; i < 6; i++) g.fillRect(X + R(Math.sin(time * 3 + i) * (2 + i)), Y - 27 - ((u * 40 + i * 5) % 26), 1, 1 + (i & 1)); g.globalAlpha = 1; }
  else { g.strokeStyle = '#c8ffe0'; g.lineWidth = 1; g.globalAlpha = Math.max(0, 1 - (u - 0.8) * 4); g.beginPath(); g.ellipse(X, sf, 4 + (u - 0.75) * 50, 1 + (u - 0.75) * 7, 0, 0, 6.3); g.stroke(); g.globalAlpha = 1; }
}
/* THE BASIN'S OWN LAMPS on their posts along the back wall. out: false lit, true snuffed, or 0..1 = being snuffed (the flame guttering, a puff of smoke) */
export function drawBasinLamp(g, x, y, out, time) {
  const X = R(x), Y = R(y), k = out === true ? 1 : out === false ? 0 : out;
  g.fillStyle = '#26282c'; g.fillRect(X, Y - 40, 2, 40); g.fillStyle = '#3a3e44'; g.fillRect(X, Y - 40, 1, 40); g.fillStyle = '#1a1c20'; g.fillRect(X - 1, Y - 3, 4, 3); g.fillRect(X - 3, Y - 42, 8, 2);   /* the post, its foot, its arm */
  g.fillStyle = LC.cage; g.fillRect(X - 3, Y - 40, 7, 1); g.fillRect(X - 3, Y - 32, 7, 2); g.fillRect(X - 3, Y - 39, 1, 7); g.fillRect(X + 3, Y - 39, 1, 7); g.fillRect(X - 2, Y - 41, 5, 1); g.fillStyle = '#5a5e66'; g.fillRect(X - 3, Y - 39, 1, 1);
  if (k >= 1) { g.fillStyle = '#1e2020'; g.fillRect(X - 2, Y - 39, 5, 7); g.fillStyle = '#2e3030'; g.fillRect(X - 2, Y - 39, 1, 7);   /* snuffed: black glass, a last red wick, a thread of smoke rising and wavering */
    const em = 0.4 + 0.6 * Math.max(0, Math.sin(time * 2 + x)); g.globalAlpha = 0.6 * em; g.fillStyle = '#c8401a'; g.fillRect(X, Y - 33, 1, 1); g.globalAlpha = 1;
    g.globalAlpha = 0.4; g.fillStyle = '#8a8a8a'; for (let i = 0; i < 9; i++) { const u = (time * 0.5 + i * 0.11 + x * 0.013) % 1; g.fillRect(X + R(Math.sin(u * 9 + x) * (1 + u * 3)), Y - 42 - R(u * 26), 1, 1); } g.globalAlpha = 1; return; }
  if (k > 0) { g.fillStyle = '#2e2a26'; g.fillRect(X - 2, Y - 39, 5, 7); const th = R(5 * (1 - k)); g.fillStyle = LC.flame; g.fillRect(X - 1, Y - 33 - th, 3, th + 1); g.fillStyle = '#c8501a'; g.fillRect(X, Y - 33, 1, 1);   /* guttering out */
    g.globalAlpha = 0.7 * (1 - k * 0.5); g.fillStyle = '#b8b8b8'; for (let i = 0; i < 10; i++) { const u = (k * 1.4 + i * 0.07); g.fillRect(X + R(Math.sin(i * 2.3 + time * 4) * (2 + u * 7)), Y - 38 - R(u * 22), 2, 2); } g.globalAlpha = 1; return; }   /* the puff */
  const fl = 0.8 + 0.2 * Math.sin(time * 7 + x) * Math.cos(time * 4.3 + x), th = fl > 0.9 ? 6 : 5;
  g.fillStyle = 'rgba(255,214,128,0.3)'; g.fillRect(X - 2, Y - 39, 5, 7); g.fillStyle = '#e8903a'; g.fillRect(X - 2, Y - 34, 5, 2); g.fillStyle = LC.flame; g.fillRect(X - 1, Y - 33 - th, 3, th + 1); g.fillStyle = LC.flameHot; g.fillRect(X, Y - 35, 1, 3);
  const gr = g.createRadialGradient(X, Y - 36, 1, X, Y - 36, 20); gr.addColorStop(0, 'rgba(' + LC.glow + ',' + (0.4 * fl).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + LC.glow + ',0)'); g.fillStyle = gr; g.fillRect(X - 20, Y - 56, 40, 40);
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
/* ITS CARD (the bestiary, the boss's title): the jaws out of the dark water, the swaying lure hung over them on its thread, the eye and the cold spots in the black */
export function bakeCard() {
  const W = 52, Hh = 48, [c, g] = canvas(W, Hh);
  const bg = g.createLinearGradient(0, 0, 0, Hh); bg.addColorStop(0, '#142024'); bg.addColorStop(1, '#060c0e'); g.fillStyle = bg; g.fillRect(0, 0, W, Hh);   /* fog above, black water below */
  g.fillStyle = '#2a4a50'; g.fillRect(0, 40, W, 1); g.fillStyle = '#04080a'; g.fillRect(0, 41, W, 7);
  g.fillStyle = '#7fe8c8'; for (const [px, py] of [[4, 42], [9, 45], [14, 41], [46, 44], [41, 40]]) { g.globalAlpha = 0.6; g.fillRect(px, py, 1, 1); } g.globalAlpha = 1;   /* the cold spots of its flank */
  drawJaws(g, 19, 40, 1, 0.3, 0, false, 1);
  drawLure(g, 43, 33, 0, 50, 40, 0.3, false, true);
  return { R: [c], L: [c], w: 40, h: 40 };
}
