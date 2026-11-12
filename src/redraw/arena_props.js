// arena_props.js - THE ARENA SET's PROPS (claude/arenayardart). What stands on the sand: an oak barrier rail (two variants), a weapon rack of practice swords and a
// round shield, a pennon pole whose cloth rides the wind, an iron brazier with a living flame, THE MOVE BOARD (an oak board with a chalk plate), THE TRIALS DOOR (a stone
// arch, an iron-strapped oak door with lamplight at its edge) and THE GATE OUT (an open arch onto daylight under a raised portcullis). Pure drawing, baked once; only the
// flame and the pennon cloth are drawn live.
//   ARENA_KINDS                          the deco kinds this file draws (a level places them as { t: 'deco', kind })
//   drawArenaProps(g, ents, cx, cy, VW, VH, time, o)   o.near = a Set of 'board' | 'door' | 'leave': a prop a hero stands at brightens; o.cheer 0..1 snaps the pennons
import { canvas, px, rect, mulberry } from '../px.js';
import { AP } from './arena_pal.js';
import { pennon } from './arena_backdrop.js';

const A = AP, TS = 16;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export const ARENA_KINDS = ['arenaBarrier', 'weaponRack', 'pennonPole', 'brazier', 'moveBoard', 'trialsDoor', 'leaveGate'];
const post = (g, x, y, w, h) => { rect(g, x, y, w, h, A.o3); rect(g, x, y, 1, h, A.o5); rect(g, x + w - 1, y, 1, h, A.o1); rect(g, x, y, w, 1, A.o6); };
const rail = (g, x, y, w, c0, c1) => { rect(g, x, y, w, 3, c0); rect(g, x, y, w, 1, c1); rect(g, x, y + 2, w, 1, A.o1); };

/* THE BARRIER: two posts and two rails; v 1 is braced with an X and has a crimson-and-linen painted top rail */
function barrier(v) {
  return once('bar' + v, () => { const [c, g] = canvas(30, 18);
    rail(g, 2, 5, 26, v ? A.c2 : A.o5, v ? A.c3 : A.o6); if (v) for (let x = 4; x < 28; x += 6) rect(g, x, 5, 3, 3, A.w1);
    rail(g, 2, 11, 26, A.o4, A.o5);
    if (v) for (let i = 0; i < 8; i++) { px(g, 5 + i * 2, 8 + i, A.o2); px(g, 6 + i * 2, 8 + i, A.o3); px(g, 23 - i * 2, 8 + i, A.o2); px(g, 22 - i * 2, 8 + i, A.o3); }
    for (const x of [1, 25]) { post(g, x, 2, 4, 16); rect(g, x - 1, 1, 6, 2, A.o6); rect(g, x, 0, 4, 1, A.o7); px(g, x + 1, 6, A.i3); px(g, x + 1, 12, A.i3); }
    rect(g, 0, 17, 30, 1, A.o0);
    return c; });
}
function rack() {
  return once('rack', () => { const [c, g] = canvas(26, 24);
    post(g, 2, 6, 3, 18); post(g, 21, 6, 3, 18); rect(g, 1, 5, 24, 3, A.o4); rect(g, 1, 5, 24, 1, A.o6); rect(g, 1, 7, 24, 1, A.o1); rect(g, 2, 15, 22, 2, A.o3); rect(g, 2, 15, 22, 1, A.o4);
    for (const [x, k] of [[7, 0], [11, 1], [15, 0]]) {                                                                              /* three practice swords, point up */
      rect(g, x, 2, 2, 17, k ? A.o6 : A.o5); rect(g, x, 2, 1, 17, A.o7); rect(g, x + 1, 2, 1, 17, A.o4); rect(g, x - 1, 15, 4, 1, A.g1); rect(g, x, 17, 2, 3, A.o2); px(g, x, 19, A.g2); px(g, x, 1, A.o7); }
    for (let y = 0; y < 8; y++) { const hw = Math.round(Math.sqrt(16 - (y - 4) * (y - 4))); rect(g, 19 - hw + 2, 8 + y, hw * 2 - 4, 1, y < 4 ? A.b2 : A.b1); }   /* the round shield, hung at the end */
    rect(g, 18, 11, 3, 2, A.g2); rect(g, 22, 10, 1, 4, A.i2); rect(g, 0, 23, 26, 1, A.o0);
    return c; });
}
function brazierBase() {
  return once('brz', () => { const [c, g] = canvas(16, 22);
    for (const [x, d] of [[3, -1], [11, 1], [7, 0]]) rect(g, x, 12, 2, 10, A.i1), px(g, x, 12, A.i3);                                  /* tripod legs */
    for (let y = 0; y < 5; y++) { const hw = 7 - Math.round(y * 0.8); rect(g, 8 - hw, 9 + y, hw * 2, 1, y === 0 ? A.i3 : y < 3 ? A.i2 : A.i1); }   /* the bowl */
    rect(g, 1, 9, 14, 1, A.g1); rect(g, 6, 14, 4, 2, A.i1); rect(g, 0, 21, 16, 1, A.o0);
    return c; });
}
function board(near) {
  return once('brd' + near, () => { const [c, g] = canvas(34, 34), r = mulberry(5);
    post(g, 3, 16, 3, 18); post(g, 28, 16, 3, 18); rect(g, 2, 2, 30, 24, A.o1); rect(g, 3, 3, 28, 22, A.o4); rect(g, 3, 3, 28, 1, A.o6); rect(g, 3, 24, 28, 1, A.o2);   /* the oak board and its frame */
    for (let x = 8; x < 30; x += 7) rect(g, x, 4, 1, 20, A.o3);
    rect(g, 6, 7, 22, 15, A.k0); rect(g, 7, 8, 20, 13, '#2a3a34'); rect(g, 7, 8, 20, 1, '#3a4e46');                                         /* the slate (a chalk plate) */
    rect(g, 9, 11, 13, 1, A.w0); rect(g, 9, 14, 16, 1, A.w1); rect(g, 9, 17, 10, 1, A.w0); rect(g, 22, 17, 3, 1, A.w1); px(g, 9, 19, A.w0); px(g, 11, 19, A.w0);   /* the chalked lines */
    rect(g, 24, 9, 2, 2, A.g2);                                                                                                       /* a gold mark: the hero's own page */
    for (const [x, y] of [[4, 4], [29, 4], [4, 22], [29, 22]]) { px(g, x, y, A.i3); }
    rect(g, 13, 0, 8, 3, A.g1); rect(g, 14, 0, 6, 1, A.g3); rect(g, 15, 1, 4, 1, A.g0);                                              /* a gold crest on its head */
    if (near) { g.globalAlpha = 0.5; for (const [x, y, w, h] of [[2, 2, 30, 1], [2, 25, 30, 1], [2, 2, 1, 24], [31, 2, 1, 24]]) rect(g, x, y, w, h, A.g3); g.globalAlpha = 1; rect(g, 7, 8, 20, 1, '#6a8a74'); }
    rect(g, 0, 33, 34, 1, A.o0);
    return c; });
}
function door(near) {
  return once('dor' + near, () => { const [c, g] = canvas(30, 38), r = mulberry(9);
    rect(g, 0, 4, 30, 34, A.k2); rect(g, 0, 4, 30, 1, A.k4); rect(g, 0, 4, 2, 34, A.k4); rect(g, 28, 4, 2, 34, A.k1);                          /* the stone surround */
    for (let y = 8; y < 38; y += 6) rect(g, 0, y, 30, 1, A.k1);
    rect(g, 4, 10, 22, 28, A.k0);
    for (let y = 0; y < 14; y++) { const hw = Math.round(11 * Math.sqrt(1 - Math.pow((14 - y) / 14, 2))); rect(g, 15 - hw, 10 + y - 0, hw * 2, 1, A.k0); }
    rect(g, 6, 14, 18, 24, A.o3); for (let y = 0; y < 10; y++) { const hw = Math.round(9 * Math.sqrt(1 - Math.pow((10 - y) / 10, 2))); rect(g, 15 - hw, 12 + y, hw * 2, 1, A.o3); }   /* the arched door, planked */
    for (let x = 8; x < 24; x += 4) { rect(g, x, 14, 1, 24, A.o2); rect(g, x + 1, 14, 1, 24, A.o4); }
    rect(g, 6, 22, 18, 2, A.i1); rect(g, 6, 22, 18, 1, A.i2); rect(g, 6, 31, 18, 2, A.i1); rect(g, 6, 31, 18, 1, A.i2); for (const x of [8, 14, 20]) { px(g, x, 22, A.i3); px(g, x, 31, A.i3); }   /* the iron straps */
    rect(g, 20, 27, 2, 2, A.g2); px(g, 20, 27, A.g3);                                                                                   /* the ring */
    rect(g, 13, 0, 4, 5, A.g1); rect(g, 14, 0, 2, 4, A.g3); rect(g, 12, 4, 6, 1, A.g0);                                                 /* the keystone */
    rect(g, 14, 14, 2, 24, near ? A.g3 : A.g2); g.globalAlpha = near ? 0.8 : 0.45; rect(g, 14, 14, 2, 24, A.g3); g.globalAlpha = 1;      /* lamplight through the gap between the leaves */
    if (near) { g.globalAlpha = 0.28; rect(g, 4, 10, 22, 28, A.g2); g.globalAlpha = 1; }
    rect(g, 0, 37, 30, 1, A.k0);
    return c; });
}
function gate(near) {
  return once('gat' + near, () => { const [c, g] = canvas(30, 38);
    rect(g, 0, 4, 30, 34, A.k2); rect(g, 0, 4, 30, 1, A.k4); rect(g, 0, 4, 2, 34, A.k4); rect(g, 28, 4, 2, 34, A.k1); for (let y = 8; y < 38; y += 6) rect(g, 0, y, 30, 1, A.k1);
    rect(g, 4, 10, 22, 28, A.sky2);                                                                                                       /* daylight beyond */
    for (let y = 0; y < 8; y++) rect(g, 4, 10 + y, 22, 1, y < 3 ? A.sky2 : A.sky3);
    rect(g, 4, 26, 22, 12, '#7aa24a'); for (let x = 4; x < 26; x += 3) rect(g, x, 26, 2, 1, '#9ac05a'); rect(g, 4, 31, 22, 7, '#5e8a3a');   /* the green road past the wall */
    for (let y = 0; y < 14; y++) { const hw = Math.round(11 * Math.sqrt(1 - Math.pow((14 - y) / 14, 2))); rect(g, 4, 10 + y, 11 - hw, 1, A.k2); rect(g, 15 + hw, 10 + y, 11 - hw, 1, A.k2); }   /* the arch's shoulders */
    for (let x = 7; x < 24; x += 4) { rect(g, x, 10, 2, 9, A.i1); px(g, x, 10, A.i3); rect(g, x, 19, 2, 2, A.i2); }                         /* the portcullis, raised: its teeth hang */
    rect(g, 5, 9, 20, 2, A.i1); rect(g, 5, 9, 20, 1, A.i2);
    rect(g, 13, 0, 4, 5, A.g1); rect(g, 14, 0, 2, 4, A.g3); rect(g, 12, 4, 6, 1, A.g0);
    rect(g, 4, 36, 22, 2, A.s2); rect(g, 4, 36, 22, 1, A.s4);
    rect(g, 1, 14, 2, 8, A.b1); rect(g, 27, 14, 2, 8, A.b1); rect(g, 1, 14, 2, 1, A.b3); rect(g, 27, 14, 2, 1, A.b3); rect(g, 1, 22, 1, 2, A.b0); rect(g, 28, 22, 1, 2, A.b0);   /* blue pennants on the jambs */
    if (near) { g.globalAlpha = 0.25; rect(g, 4, 10, 22, 28, '#ffffff'); g.globalAlpha = 1; }
    rect(g, 0, 37, 30, 1, A.k0);
    return c; });
}

/* a glow of firelight: stacked rects round (x, y) */
function glow(g, x, y, r, a, col) { g.fillStyle = col; for (let i = r; i > 0; i -= 4) { g.globalAlpha = a * (1 - i / r) * 0.5 + 0.015; g.fillRect(Math.round(x - i), Math.round(y - i * 0.7), i * 2, Math.round(i * 1.4)); } g.globalAlpha = 1; }

/* THE PLANK STANDS (duelarenas-b, draw only): an oak post under a plank end, from the deck down to the sand, with a cap bracket under the board and a footing. stands: [[col, deck row, bottom row]], drawn behind the tiles. */
export function drawPlankStands(g, stands, cx, cy) {
  for (const [col, row, bottom] of stands) {
    const x = col * TS + 6 - cx, y0 = row * TS + 5 - cy, h = bottom * TS - (row * TS + 5);
    post(g, x, y0, 4, h); rect(g, x - 2, y0, 8, 2, A.o6); rect(g, x - 2, y0 + 2, 8, 1, A.o1);   /* the post, the bracket cap under the board */
    rect(g, x - 2, y0 + h - 3, 8, 3, A.o2); rect(g, x - 2, y0 + h - 3, 8, 1, A.o4);                   /* the footing in the sand */
  }
}
export function drawArenaProps(g, ents, cx, cy, VW, VH, time, o = {}) {
  const near = o.near || new Set(), cheer = o.cheer || 0;
  for (const e of ents) {
    if (e.t !== 'deco' || !ARENA_KINDS.includes(e.kind)) continue;
    const fx = e.x * TS + 8 - cx, fy = (e.y + 1) * TS - cy;                       /* the foot of the prop: the middle of its tile, the floor line */
    if (fx < -40 || fx > VW + 40 || fy < -10 || fy > VH + 60) continue;
    let s;
    switch (e.kind) {
      case 'arenaBarrier': s = barrier(e.v ? 1 : 0); break;
      case 'weaponRack': s = rack(); break;
      case 'moveBoard': s = board(near.has('board') ? 1 : 0); break;
      case 'trialsDoor': s = door(near.has('door') ? 1 : 0); break;
      case 'leaveGate': s = gate(near.has('leave') ? 1 : 0); break;
      case 'pennonPole': { const x = Math.round(fx), y = Math.round(fy), p = (e.v | 0) & 1; rect(g, x - 3, y - 2, 7, 2, A.o2); rect(g, x - 2, y - 3, 5, 1, A.o4); pennon(g, x - 1, y - 38, 14, time + (e.x % 5), 1.2 + cheer * 2.2, 3.4 + cheer * 6, p ? A.b2 : A.c2, p ? A.b1 : A.c1); rect(g, x - 1, y - 38 + 6, 2, 30, A.o3); rect(g, x - 1, y - 38 + 6, 1, 30, A.o5); continue; }
      case 'brazier': { const x = Math.round(fx), y = Math.round(fy); glow(g, x, y - 18, 34, 0.5, '#ff9a3c'); g.drawImage(brazierBase(), x - 8, y - 22);
        const f = Math.floor(time * 9 + e.x) % 3, h = 6 + (f === 1 ? 2 : 0) + ((time * 13 + e.x) % 2 < 1 ? 1 : 0);
        rect(g, x - 4, y - 22 - h + 4, 8, h, '#c4421c'); rect(g, x - 3, y - 22 - h + 3, 6, h, '#ff8a3c'); rect(g, x - 1, y - 22 - h + 2 - f, 3, h - 1, '#ffd36b'); px(g, x, y - 22 - h + 1 - f, '#fff6c8'); continue; }
      default: continue;
    }
    g.drawImage(s, Math.round(fx - s.width / 2), Math.round(fy - s.height));
  }
}
