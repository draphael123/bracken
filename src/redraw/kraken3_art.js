// src/redraw/kraken3_art.js - THE KRAKEN 3: THE RAFT's own pieces (claude/kraken3, 2026-11-07). The Kraken himself is src/redraw/kraken.js (his head,
// its frames, and the arm discs the draw lays as a chain); this is what the raft half adds, drawn in code like the rest:
//   bakeRaft()       the wreck's deck boards lashed into a raft (TIMBER = A SHIP's: tarred, barnacled, rope-lashed - plan s4): plank frames
//                    { whole[2], cracked[2], loose } 16x10, the deck top pale (the sea maps colours dark - the deck-board rule of kraken.js)
//   bakeKrakling()   a hand-sized young of his, the head's skin: 18x14, anchor (9, 13): 0 climb (only the arm tips and the eyes over the edge),
//                    1 pry (hunched over the plank, arms under it), 2 bite tell (mantle up, beak wide), 3 hurt/dead (curled, pale)
//   bakeBarnacle()   6x6: 0 stuck, 1 swelling (the beat before it bursts)
//   bakeWreck()      the WRECKAGE that comes across the deck: a broken spar with its rope and a torn sail, 44x12 (ankle-high: jump it)
//   bakeRock()       the overhang the raft drifts under: a sea-stack lip, 72x64, its underside the bottom row (head-high: duck it)
import { canvas, px, rect, outline, flipX, whiten, mulberry } from '../px.js';
import { OUT } from '../art.js';

const KP = { d0: '#170b16', d1: '#2a1224', m0: '#421c36', m1: '#5e2a44', l0: '#7c3c50', l1: '#9c5a60', hi: '#bf8272', suck: '#e6c2a6', suckD: '#a86e66',
  eyeY: '#e8b83a', pupil: '#120810', bio: '#5fe6cc', bioD: '#2a8f86', beak: '#2a2226' };
const WD = { tar: '#1e1814', d: '#3a2e24', m: '#5a4836', l: '#7a654c', top: '#e8e2cc', top2: '#d4ccb2', barn: '#c9c2a8', barnD: '#8a8472', rope: '#b89a62', ropeD: '#7a6038', weed: '#3e6a4a', nail: '#5a5458' };

function plank(v, cracked) {
  const [c, g] = canvas(16, 10);
  rect(g, 0, 0, 16, 2, WD.top); rect(g, 0, 2, 16, 1, WD.top2);
  for (let x = 0; x < 16; x++) { px(g, x, 3, x % 5 === v ? WD.l : WD.m); px(g, x, 4, WD.m); px(g, x, 5, (x + v) % 7 === 0 ? WD.l : WD.d); px(g, x, 6, WD.d); px(g, x, 7, WD.tar); }
  /* the lashing: a rope round the board at its middle, and the old nails */
  for (let y = 0; y < 9; y++) px(g, 7 + (y % 2), y, y % 3 ? WD.rope : WD.ropeD);
  px(g, 3 + v, 4, WD.nail); px(g, 12 - v, 4, WD.nail);
  /* barnacles and weed on the waterline under it */
  for (let x = 1; x < 15; x += 3 + v) { px(g, x, 8, WD.barn); px(g, x + 1, 8, WD.barnD); }
  px(g, 2 + v * 6, 9, WD.weed); px(g, 3 + v * 6, 9, WD.weed);
  if (cracked) { const k = [[4, 0], [5, 1], [5, 2], [6, 3], [5, 4], [6, 5], [7, 6], [6, 7]]; for (const [x, y] of k) { px(g, x + v * 3, y, WD.tar); px(g, x + v * 3 + 1, y, WD.d); } px(g, 11, 2, WD.tar); px(g, 12, 3, WD.tar); }
  return outline(c, OUT);
}
export function bakeRaft() {
  const loose = (() => { const [c, g] = canvas(16, 6); rect(g, 0, 0, 16, 1, WD.top); rect(g, 0, 1, 16, 2, WD.m); rect(g, 0, 3, 16, 2, WD.d); px(g, 6, 1, WD.rope); px(g, 7, 2, WD.rope); px(g, 3, 4, WD.barn); px(g, 11, 4, WD.barn); return outline(c, OUT); })();
  const whole = [plank(0, false), plank(1, false)], cracked = [plank(0, true), plank(1, true)];
  return { whole, cracked, loose, white: whiten(whole[0]) };
}

/* a small lit body in the head's skin */
function body(g, cx, cy, rx, ry, rnd) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
    const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry, q = u * u + v * v; if (q > 1) continue;
    const k = 0.45 - u * 0.35 - v * 0.4 + (rnd() - 0.5) * 0.12, col = k > 0.7 ? KP.hi : k > 0.55 ? KP.l1 : k > 0.4 ? KP.l0 : k > 0.25 ? KP.m1 : k > 0.1 ? KP.m0 : KP.d1;
    px(g, x, y, col); }
}
export function bakeKrakling() {
  const f = st => { const [c, g] = canvas(18, 14), rnd = mulberry(7 + st);
    const dy = st === 0 ? 7 : st === 3 ? 3 : 0, tall = st === 2 ? 1 : 0;
    /* its arms: four curling tips, gripping the plank's edge */
    const tips = st === 0 ? [[3, 12], [6, 13], [11, 13], [14, 12]] : [[1, 13], [5, 13], [12, 13], [16, 13]];
    for (const [tx, ty] of tips) { for (let k = 0; k < 4; k++) px(g, tx + (tx < 9 ? k * 0.6 : -k * 0.6), ty - k, k < 2 ? KP.m1 : KP.m0); px(g, tx, ty, KP.suck); }
    if (st !== 0 || true) body(g, 9, 7 + dy - tall, 5, 4 + tall, rnd);
    /* the eyes and the beak */
    if (st === 3) { px(g, 7, 7 + dy, KP.d0); px(g, 11, 7 + dy, KP.d0); }
    else { px(g, 7, 6 + dy - tall, KP.eyeY); px(g, 11, 6 + dy - tall, KP.eyeY); px(g, 7, 7 + dy - tall, KP.pupil); px(g, 11, 7 + dy - tall, KP.pupil); }
    if (st === 2) { rect(g, 8, 9 - tall, 3, 2, KP.beak); px(g, 9, 10 - tall, '#9a3a4a'); }
    /* a cold lamp on its crown, as his arms carry */
    px(g, 9, 3 + dy - tall, st === 3 ? KP.bioD : KP.bio);
    return outline(c, OUT); };
  const R = [0, 1, 2, 3].map(f);
  return { R, L: R.map(flipX), white: R.map(c => whiten(c)), ax: 9, ay: 13 };
}
export function bakeBarnacle() {
  const f = k => { const [c, g] = canvas(6, 6); rect(g, 1, 2, 4, 4, WD.barnD); rect(g, 1, 2, 3, 3, WD.barn); px(g, 2, 1, WD.barn); px(g, 3, 1, k ? '#ff9a6b' : WD.barnD); px(g, 2, 3, KP.d1); if (k) { px(g, 0, 4, '#ff9a6b'); px(g, 5, 4, '#ff9a6b'); } return outline(c, OUT); };
  return [f(0), f(1)];
}
export function bakeWreck() {
  const [c, g] = canvas(44, 12), rnd = mulberry(3);
  /* the spar, splintered at both ends, lying in the water at deck height */
  for (let x = 2; x < 40; x++) { px(g, x, 6, WD.l); px(g, x, 7, WD.m); px(g, x, 8, WD.d); px(g, x, 9, WD.tar); }
  for (const x of [1, 2, 40, 41, 42]) px(g, x, 6 + (x % 2), WD.l);
  /* its rope and a torn rag of sail */
  for (let x = 6; x < 30; x += 1) px(g, x, 5 - Math.round(Math.sin(x * 0.4) * 1.5), x % 3 ? WD.rope : WD.ropeD);
  for (let y = 1; y < 6; y++) for (let x = 14; x < 22 - y; x++) if (rnd() > 0.2) px(g, x, y, y % 2 ? '#c8bfa4' : '#a89e84');
  for (let x = 4; x < 38; x += 5) px(g, x, 9, WD.barn);
  return outline(c, OUT);
}
export function bakeRock() {
  const [c, g] = canvas(72, 64), rnd = mulberry(11), ST = ['#1c2226', '#2a3238', '#3a454c', '#4e5a60', '#66737a'];
  /* a sea-stack's lip: wide at the top, undercut, its lowest row the head-high edge you duck under */
  for (let y = 0; y < 64; y++) { const w = y < 40 ? 34 - y * 0.15 : 28 - (y - 40) * 0.9; for (let x = Math.round(36 - w); x < Math.round(36 + w); x++) {
    const k = 0.55 - (x - 36) / 70 - y / 140 + (rnd() - 0.5) * 0.25; px(g, x, y, ST[Math.max(0, Math.min(4, Math.round(k * 5)))]); } }
  /* weed and white crust along the underside */
  for (let x = 14; x < 58; x += 2) { const y = 63 - Math.round(Math.abs(x - 36) / 4); px(g, x, Math.min(63, y), rnd() > 0.5 ? WD.weed : WD.barn); }
  return outline(c, OUT);
}
