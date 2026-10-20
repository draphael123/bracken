// tavern-art.js - THE CROSSROADS INN's STATIONS and the party's marks (claude/tavernart). Draw only: no number, timing or level data lives here.
// The room itself (wall, beams, fire, window, tables and drinkers, bar, map table, wardrobe, hay, the yard's arcade) is src/redraw/tavern_backdrop.js; the floor, cellar,
// ceiling and posts are src/redraw/tavern_tiles.js. This file draws the things a player WORKS, each with a state that changes how it looks:
//   THE DOOR         oak with iron straps under a stone arch and a lit lamp; open while somebody walks in, and then the night road shows through it: a lamp-post, the signpost
//   THE INVITE BOARD cork in timber with pinned bills and a wax seal; a chalk slate that is blank until a room is open, then carries the four-letter code
//   THE DRILLS TALLY the board's chalk tallies (the board is baked in the room)
//   THE SPARRING BELL a brass bell on a post with a pull rope: at rest, and swinging with a clapper and ringing arcs
//   THE PRACTICE GATE the light behind the stone arch, the oak leaves ajar, its lamp
//   THE HAY TARGET   the painted rings on the yard floor
//   THE ARENA PIT    a sanded pit set into the floor behind a rope on brass-capped posts, the COMING SOON board (a glint sweeps it) and the empty stage board for VERSUS
//   THE GLINT        a first-visit mark over an unused station: a bobbing gold plate and a four-frame sparkle
//   THE DUMMIES      the yard's two straw men: a sack head, and a dented pot helm (SPR-shaped sets)
//   THE RING + TAG   each hero's floor ring in his colour (pixels, two halves, a shimmer) and the name plate over his head
// Every function takes the game's 2D context and SCREEN coordinates (x: the station's centre, fy: the floor line); nothing here reads game state.
import { canvas, px, rect, line, fromGrid, outline, whiten, flipX } from './px.js';
import { OUT } from './art.js';
import { TP } from './redraw/tavern_pal.js';

const rd = Math.round;
const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(rd(x), rd(y), w, h); };
const P = (g, x, y, c) => { g.fillStyle = c; g.fillRect(rd(x), rd(y), 1, 1); };
const GLOW = (g, x, y, rx, ry, c, a = 0.05) => { g.globalAlpha = a; for (const k of [1, 0.72, 0.46]) ELL(g, x, y, Math.round(rx * k), Math.round(ry * k), c); g.globalAlpha = 1; };
const ELL = (g, cx, cy, rx, ry, c) => { for (let dy = -ry; dy <= ry; dy++) { const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) * (dy / ry)))); R(g, cx - hw, cy + dy, hw * 2 + 1, 1, c); } };

/* ---------------------------------------------------------------- THE DOOR ---------------------------------------------------------------- */
export function door(g, x, fy, open, time) {
  const L = x - 14, T = fy - 42;
  R(g, L, T + 4, 28, 42 - 4, TP.s2); R(g, L, T + 4, 28, 1, TP.s4);                                                                     /* the stone surround */
  for (let j = 0; j < 38; j += 5) { R(g, L, T + 6 + j, 5, 1, TP.s1); R(g, L + 23, T + 6 + j, 5, 1, TP.s1); R(g, L + (j % 10 ? 1 : 0), T + 8 + j, 4, 1, TP.s3); }
  R(g, L - 2, T, 32, 5, TP.o3); R(g, L - 2, T, 32, 1, TP.o6); R(g, L - 2, T + 4, 32, 1, TP.o1);                                               /* the oak lintel */
  P(g, L, T + 2, TP.fe3); P(g, L + 27, T + 2, TP.fe3);
  const ox = x - 10, oy = fy - 36, ow = 20, oh = 36;
  if (open) {
    /* THE NIGHT ROAD through the doorway: sky, a far lit window, a lamp-post, the crossroads signpost, the road itself */
    for (let b = 0; b < 4; b++) R(g, ox, oy + b * 6, ow, 6, ['#1c2a4c', '#26345a', '#3a3a6a', '#5a4a6a'][b]);
    for (const [sx, sy] of [[ox + 3, oy + 2], [ox + 14, oy + 4], [ox + 9, oy + 1], [ox + 17, oy + 8]]) P(g, sx, sy, '#fff6c8');
    R(g, ox, oy + 24, ow, 12, '#2a2218'); R(g, ox, oy + 24, ow, 1, '#4a3c28'); R(g, ox, oy + 30, ow, 1, '#1c160e');
    R(g, ox + 14, oy + 14, 2, 12, '#3a3a44'); R(g, ox + 12, oy + 12, 6, 3, '#3a3a44'); R(g, ox + 13, oy + 13, 4, 1, TP.f3); R(g, ox + 8, oy + 12, 14, 12, 'rgba(255,211,107,0.13)');
    R(g, ox + 4, oy + 14, 2, 11, '#4a3626'); R(g, ox + 1, oy + 15, 8, 2, '#6a4a2c'); R(g, ox + 5, oy + 19, 8, 2, '#6a4a2c');
    R(g, ox + 6, oy + 28, 4, 5, '#161220'); R(g, ox + 6, oy + 26, 4, 3, '#161220');                                                       /* a traveller's silhouette on the road */
    R(g, ox, oy, 3, oh, '#3a2618'); R(g, ox, oy, 1, oh, TP.o5); R(g, ox + 1, oy + 8, 2, 2, TP.fe3); R(g, ox + 1, oy + 26, 2, 2, TP.fe3);   /* the leaf, swung back against the wall */
  } else {
    R(g, ox, oy, ow, oh, TP.o4);
    for (let i = 0; i < ow; i += 5) { R(g, ox + i, oy, 1, oh, TP.o2); R(g, ox + i + 1, oy, 1, oh, TP.o5); }
    R(g, ox, oy, ow, 1, TP.o6); R(g, ox, oy + 6, ow, 3, TP.fe1); R(g, ox, oy + 6, ow, 1, TP.fe2); R(g, ox, oy + 26, ow, 3, TP.fe1); R(g, ox, oy + 26, ow, 1, TP.fe2);   /* the iron straps */
    for (const sx of [ox + 2, ox + 8, ox + 14, ox + 18]) { P(g, sx, oy + 7, TP.fe3); P(g, sx, oy + 27, TP.fe3); }
    R(g, ox + 14, oy + 17, 4, 4, TP.fe1); R(g, ox + 15, oy + 18, 2, 2, TP.fe3); R(g, ox + 15, oy + 21, 2, 3, TP.fe2);                          /* the latch and its ring */
    R(g, ox + 9, oy, 2, oh, TP.o1);                                                                                                           /* the meeting of the leaves */
  }
  /* THE LAMP over the door on an iron bracket: a flame that gutters, a pool of warm on the stone */
  const k = Math.floor(time * 7) & 1, lx = x - 3, ly = T - 14;
  R(g, x - 1, T - 7, 2, 7, TP.fe1); R(g, x - 8, T - 8, 9, 2, TP.fe2); R(g, lx - 1, ly, 8, 2, TP.fe1); R(g, lx, ly - 3, 6, 3, TP.fe2);
  R(g, lx + 1, ly + 2, 4, 8, '#3a2a14'); R(g, lx + 1, ly + 3, 4, 6, TP.f3); R(g, lx + 2, ly + 4 + k, 2, 4 - k, TP.f4); R(g, lx, ly + 10, 6, 2, TP.fe1);
  GLOW(g, x, T + 8, 40, 22, '#ffb860', 0.06);
}

/* ---------------------------------------------------------------- THE INVITE BOARD ---------------------------------------------------------------- */
export function board(g, x, fy, code, time, text) {
  const L = x - 16, T = fy - 44;
  R(g, L + 6, T + 24, 3, 20, TP.o2); R(g, L + 23, T + 24, 3, 20, TP.o2); R(g, L + 6, T + 24, 1, 20, TP.o4); R(g, L + 23, T + 24, 1, 20, TP.o4);   /* the posts */
  R(g, L - 2, T + 40, 8, 4, TP.o1); R(g, L + 26, T + 40, 8, 4, TP.o1);
  R(g, L, T, 32, 26, TP.o3); R(g, L, T, 32, 1, TP.o6); R(g, L, T + 25, 32, 1, TP.o1); R(g, L, T, 1, 26, TP.o5); R(g, L + 31, T, 1, 26, TP.o1);   /* the timber frame */
  R(g, L + 2, T + 2, 28, 22, '#a07a4a'); for (let i = 0; i < 40; i++) P(g, L + 2 + (i * 7) % 28, T + 2 + (i * 5) % 22, i & 1 ? '#8a6a3a' : '#b8905a');   /* the cork */
  R(g, L + 4, T + 4, 8, 9, '#e8dcc0'); R(g, L + 4, T + 4, 8, 1, '#fff6e0'); for (let i = 0; i < 4; i++) R(g, L + 5, T + 6 + i * 2, 5 - (i & 1), 1, '#6a5a4a'); P(g, L + 7, T + 4, TP.f1);   /* a bill */
  R(g, L + 14, T + 3, 10, 6, '#d8c8a0'); R(g, L + 15, T + 5, 7, 1, '#6a5a4a'); R(g, L + 15, T + 7, 5, 1, '#6a5a4a'); R(g, L + 22, T + 8, 3, 3, '#c9463d'); R(g, L + 23, T + 9, 1, 1, '#ff9a8a');   /* a bill with a wax seal */
  R(g, L + 25, T + 4, 4, 5, '#c9d8a8'); R(g, L + 4, T + 14, 5, 5, '#d8c0a0');
  for (const [px0, py0, c] of [[8, 4, TP.f1], [19, 3, '#3a5a8a'], [27, 4, TP.f3], [6, 14, '#4a7a3a']]) { P(g, L + px0, T + py0, c); P(g, L + px0, T + py0 + 1, '#fff'); }   /* pins */
  R(g, L + 11, T + 14, 18, 9, '#2a2418'); R(g, L + 11, T + 14, 18, 1, '#5a4a32'); R(g, L + 11, T + 22, 18, 1, '#5a4a32'); R(g, L + 11, T + 14, 1, 9, '#5a4a32'); R(g, L + 28, T + 14, 1, 9, '#5a4a32');   /* the chalk slate in its own frame */
  R(g, L + 12, T + 15, 16, 7, '#1e2a22');
  if (code) { text(code, x + 4, T + 15, '#e8f0e8', 'center', 6); const k = Math.floor(time * 3) & 1; if (k) { P(g, x + 14, T + 16, '#fff'); P(g, x - 6, T + 20, '#fff'); } }
  else { for (let i = 0; i < 4; i++) R(g, L + 14 + i * 4, T + 19, 3, 1, '#4a5a4a'); }
  R(g, L + 12, T + 24, 5, 1, '#e8f0e8'); R(g, L + 18, T + 24, 2, 1, '#c9d1c9');
}

/* ---------------------------------------------------------------- THE SAVES SIGN (claude/coopclarity) ---------------------------------------------------------------- */
export function saves(g, x, fy, time, text) {
  const L = x - 14, T = fy - 40;
  R(g, L + 12, T + 18, 4, 22, TP.o2); R(g, L + 12, T + 18, 1, 22, TP.o4); R(g, L + 9, T + 38, 10, 2, TP.o1);   /* the post */
  R(g, L, T, 28, 20, TP.o3); R(g, L, T, 28, 1, TP.o6); R(g, L, T + 19, 28, 1, TP.o1); R(g, L, T, 1, 20, TP.o5); R(g, L + 27, T, 1, 20, TP.o1);   /* the plank */
  R(g, L + 2, T + 2, 24, 16, '#2a2418'); R(g, L + 2, T + 2, 24, 1, '#5a4a32');
  text('SAVES', x, T + 5, '#e8f0e8', 'center', 6); R(g, L + 5, T + 13, 18, 1, '#8fd160'); if (Math.floor(time * 2) & 1) P(g, L + 24, T + 4, '#fff');
}

/* ---------------------------------------------------------------- THE DRILLS TALLY ---------------------------------------------------------------- */
export function tally(g, x, fy, counts) {
  const L = x - 14, T = fy - 40, cols = ['#ffd36b', '#8fd160', '#6bb8ff'];
  for (let i = 0; i < 3; i++) { const n = Math.min(10, counts[i] | 0); for (let j = 0; j < n; j++) { const gx = L + 12 + (j % 5) * 3 + ((j / 5) | 0) * 0, gy = T + 4 + i * 6 + ((j / 5) | 0) * 2; R(g, gx, gy, 1, 2, '#e8f0e8'); } if (n >= 5) R(g, L + 11, T + 5 + i * 6, 14, 1, 'rgba(232,240,232,0.55)'); P(g, L + 4, T + 4 + i * 6, cols[i]); }
}

/* ---------------------------------------------------------------- THE SPARRING BELL ---------------------------------------------------------------- */
export function bell(g, x, fy, swing, time) {
  const sw = swing > 0 ? Math.round(Math.sin(time * 30) * Math.min(3, swing * 5)) : 0;
  R(g, x - 2, fy - 38, 4, 38, TP.o3); R(g, x - 2, fy - 38, 1, 38, TP.o5); R(g, x + 1, fy - 38, 1, 38, TP.o1); R(g, x - 5, fy - 3, 10, 3, TP.o2); R(g, x - 5, fy - 3, 10, 1, TP.o4);
  R(g, x - 2, fy - 40, 20, 3, TP.o3); R(g, x - 2, fy - 40, 20, 1, TP.o5); R(g, x + 12, fy - 36, 2, 7, TP.o2); line(g, x + 1, fy - 22, x + 11, fy - 37, TP.o3, 2);   /* the post, its arm, its brace */
  const bx = x + 6 + sw, by = fy - 37;
  R(g, bx - 1, by, 2, 3, TP.fe2);                                                                                                                                       /* the hanger */
  R(g, bx - 4, by + 3, 9, 3, TP.br1); R(g, bx - 5, by + 6, 11, 5, TP.br1); R(g, bx - 6, by + 11, 13, 3, TP.br1); R(g, bx - 7, by + 14, 15, 2, TP.br0);                    /* the bell, in rings of brass */
  R(g, bx - 4, by + 3, 2, 12, TP.br2); R(g, bx - 3, by + 3, 1, 12, '#fff2b0'); R(g, bx + 3, by + 5, 2, 10, TP.br0); R(g, bx - 7, by + 15, 15, 1, '#ffe27a');
  R(g, bx - 1 - sw, by + 16, 3, 3, TP.o2); P(g, bx - sw, by + 17, TP.o5);                                                                                              /* the clapper */
  const rx = x - 8; R(g, rx, fy - 38 + 12, 1, 22, '#c9b27c'); R(g, rx, fy - 38 + 12, 1, 22, '#c9b27c'); R(g, rx - 1, fy - 5, 3, 3, '#a8905c'); P(g, rx, fy - 4, '#e0c890'); line(g, rx, fy - 28, x - 2, fy - 31, '#c9b27c', 1);   /* the pull rope and its knot */
  if (swing > 0) { const a = 0.4 + 0.5 * Math.sin(time * 30); g.globalAlpha = Math.max(0, Math.min(1, swing * 1.4)) * a;
    for (const d of [-1, 1]) for (let k = 1; k <= 2; k++) { R(g, bx + d * (9 + k * 3), by + 4 + k * 2, 1, 7 - k * 2, '#ffe27a'); R(g, bx + d * (9 + k * 3) + (d > 0 ? 1 : -1), by + 5 + k * 2, 1, 5 - k * 2, '#ffe27a'); } g.globalAlpha = 1; }
}

/* ---------------------------------------------------------------- THE PRACTICE GATE ---------------------------------------------------------------- */
export function gate(g, x, fy, time) {
  const L = x - 9, T = fy - 77, k = 0.5 + 0.5 * Math.sin(time * 2), f = Math.floor(time * 6) & 1;
  for (let j = 0; j < 77; j += 2) { g.globalAlpha = Math.max(0.2, 0.62 + 0.18 * k - j / 130); R(g, L, T + j, 18, 2, j < 30 ? '#ffe9a8' : '#e0b868'); }                                  /* the yards beyond: light, strongest high in the opening */
  g.globalAlpha = 1;
  for (let j = 0; j < 9; j++) { const hw = Math.round(9 - Math.sqrt(81 - (9 - j) * (9 - j))); R(g, L, T + j, hw, 1, TP.s3); R(g, L + 18 - hw, T + j, hw, 1, TP.s3); }                  /* (the arch's corners stay stone over the light) */
  R(g, L + 3, fy - 6, 12, 2, '#a8895a'); R(g, L + 5, fy - 10, 8, 4, '#8a6c44'); R(g, L + 8, fy - 36, 2, 26, '#5a4228'); R(g, L + 3, fy - 38, 12, 3, '#6a4a2c'); R(g, L + 5, fy - 44, 8, 6, '#9a7a4a'); R(g, L + 5, fy - 44, 8, 1, '#c4a674');   /* a straw man out in the yard, against the light */
  R(g, L - 6, fy - 62, 5, 58, TP.o3); R(g, L - 6, fy - 62, 1, 58, TP.o5); R(g, L - 6, fy - 54, 5, 2, TP.fe1); R(g, L - 6, fy - 20, 5, 2, TP.fe1);                                /* the oak leaves, ajar against the wall */
  R(g, L + 19, fy - 62, 5, 58, TP.o3); R(g, L + 23, fy - 62, 1, 58, TP.o1); R(g, L + 19, fy - 54, 5, 2, TP.fe1); R(g, L + 19, fy - 20, 5, 2, TP.fe1);
  const lx = x - 28, ly = fy - 66;                                                                                                                                              /* the lamp on its bracket */
  R(g, lx + 3, ly - 2, 8, 2, TP.fe2); R(g, lx + 9, ly, 1, 4, TP.fe1); R(g, lx + 8, ly + 3, 4, 2, TP.fe1); R(g, lx + 7, ly + 5, 6, 7, '#3a2a14'); R(g, lx + 8, ly + 6, 4, 5, TP.f3); R(g, lx + 9, ly + 7 + f, 2, 3 - f, TP.f4); R(g, lx + 7, ly + 12, 6, 1, TP.fe1);
  GLOW(g, lx + 10, ly + 8, 26, 18, '#ffd36b', 0.05);
}

/* ---------------------------------------------------------------- THE HAY TARGET ---------------------------------------------------------------- */
export function target(g, x, fy, time) {
  const cy = fy + 2, sh = (Math.floor(time * 3) & 1) ? '#fff6c8' : '#ffe9a8';
  ELL(g, x, cy, 23, 3, '#4a3418'); ELL(g, x, cy, 22, 2, '#c9a040'); ELL(g, x, cy, 15, 2, '#e8d49a'); ELL(g, x, cy, 8, 1, '#c9463d'); ELL(g, x, cy, 3, 1, sh);
  for (const dx of [-17, 17]) P(g, x + dx, cy, '#4a3418');
}

/* ---------------------------------------------------------------- THE ARENA PIT ---------------------------------------------------------------- */
export function arena(g, x, fy, time, text) {
  const cy = fy + 2;
  ELL(g, x, cy + 1, 25, 4, TP.o1); ELL(g, x, cy, 24, 3, TP.o4); ELL(g, x, cy, 22, 3, TP.o2);                                                                          /* the kerb of the pit, a ring of oak */
  ELL(g, x, cy + 1, 20, 2, '#a8895a'); ELL(g, x, cy + 1, 15, 1, '#c4a674'); R(g, x - 20, cy - 1, 41, 1, '#5a4228'); R(g, x - 18, cy, 37, 1, '#76593a');                /* the sand, and the pit's back wall in shade */
  for (const [dx, dy] of [[-12, 1], [-4, 2], [6, 1], [13, 2], [0, 1]]) P(g, x + dx, cy + dy, '#e0c890');                                                              /* raked furrows */
  P(g, x - 8, cy + 2, '#8a6c44'); P(g, x + 9, cy + 1, '#8a6c44');
  /* the rope on brass-capped posts, swagging */
  const posts = [-24, -8, 8, 24];
  for (const dx of posts) { R(g, x + dx - 1, fy - 14, 3, 15, TP.o3); R(g, x + dx - 1, fy - 14, 1, 15, TP.o5); R(g, x + dx - 2, fy - 16, 5, 3, TP.br1); R(g, x + dx - 2, fy - 16, 5, 1, TP.br2); R(g, x + dx - 2, fy - 1, 5, 2, TP.o1); }
  for (let i = 0; i < 3; i++) { const x0 = x + posts[i], x1 = x + posts[i + 1]; for (let xx = x0 + 2; xx < x1 - 1; xx++) { const t = (xx - x0) / (x1 - x0), yy = fy - 12 + Math.round(Math.sin(t * Math.PI) * 4); P(g, xx, yy, '#c9b27c'); P(g, xx, yy + 1, '#8a7a50'); } }
  /* THE COMING SOON BOARD on two posts, a glint sweeping across it */
  const bx = x - 19, by = fy - 50;
  R(g, bx + 4, by + 22, 3, 28, TP.o2); R(g, bx + 31, by + 22, 3, 28, TP.o2); R(g, bx + 4, by + 22, 1, 28, TP.o4);
  R(g, bx, by, 38, 24, TP.o3); R(g, bx, by, 38, 1, TP.o6); R(g, bx, by + 23, 38, 1, TP.o1); R(g, bx, by, 1, 24, TP.o5); R(g, bx + 37, by, 1, 24, TP.o1);
  R(g, bx + 2, by + 2, 34, 20, '#5a1e1a'); R(g, bx + 2, by + 2, 34, 1, '#7a2e26'); R(g, bx + 2, by + 21, 34, 1, '#3a1010');
  for (const px0 of [bx + 3, bx + 34]) for (const py0 of [by + 3, by + 19]) P(g, px0, py0, TP.fe3);
  text('COMING', x, by + 4, '#f0e6c8', 'center', 6); text('SOON', x, by + 12, '#ff9a5c', 'center', 6);
  const sw = ((time * 14) % 60) - 12; if (sw >= 0 && sw < 34) { g.globalAlpha = 0.32; for (let j = 0; j < 20; j++) { const xx = bx + 2 + sw + Math.round(j * 0.4); if (xx >= bx + 2 && xx < bx + 36) R(g, xx, by + 2 + j, 2, 1, '#fff'); } g.globalAlpha = 1; }
  /* THE STAGE BOARD for VERSUS, beside it: an empty slate in a chained frame, its two name lines unwritten */
  const sx = x + 30, sy = fy - 34;
  R(g, sx, sy - 6, 1, 7, TP.fe2); R(g, sx + 14, sy - 6, 1, 7, TP.fe2);
  R(g, sx - 2, sy, 19, 14, TP.o3); R(g, sx - 2, sy, 19, 1, TP.o5); R(g, sx - 2, sy + 13, 19, 1, TP.o1); R(g, sx, sy + 2, 15, 10, '#1e2a26');
  R(g, sx + 2, sy + 5, 4, 1, '#3a4a42'); R(g, sx + 9, sy + 5, 4, 1, '#3a4a42'); R(g, sx + 6, sy + 8, 3, 1, '#3a4a42'); P(g, sx + 7, sy + 6, '#3a4a42');
}

/* ---------------------------------------------------------------- THE GLINT ---------------------------------------------------------------- */
export function glint(g, x, y, time, seed) {
  const k = Math.floor(time * 8 + seed) & 3, by = rd(y + Math.sin(time * 4 + seed) * 2);
  R(g, x - 4, by - 10, 9, 10, OUT); R(g, x - 3, by - 9, 7, 8, TP.br1); R(g, x - 3, by - 9, 7, 1, TP.br2); R(g, x - 3, by - 2, 7, 1, TP.br0);                                /* a small gold plate */
  R(g, x - 1, by - 8, 3, 4, '#3a2418'); R(g, x - 1, by - 3, 3, 1, '#3a2418');                                                                                              /* the mark on it */
  R(g, x - 1, by + 0, 3, 2, OUT); P(g, x, by, TP.br1);
  const q = [[-6, -8], [6, -5], [-5, -3], [5, -10]][k];                                                                                                                      /* the sparkle goes round its corners */
  P(g, x + q[0], by + q[1], '#fff6c8'); P(g, x + q[0] - 1, by + q[1], '#ffd36b'); P(g, x + q[0] + 1, by + q[1], '#ffd36b'); P(g, x + q[0], by + q[1] - 1, '#ffd36b'); P(g, x + q[0], by + q[1] + 1, '#ffd36b');
}

/* ---------------------------------------------------------------- THE MIRROR'S SHINE ---------------------------------------------------------------- */
export function mirror(g, x, fy, time) {
  const t = (time % 4) / 4; if (t > 0.5) return; const j = Math.floor(t * 2 * 16); g.globalAlpha = 0.6 * (1 - Math.abs(t - 0.25) * 4);
  for (let d = 0; d < 5; d++) R(g, x + 22 + Math.min(8, d + (j >> 1)), fy - 32 + d * 4 + (j >> 2), 1, 3, '#fff'); g.globalAlpha = 1;
}

/* ---------------------------------------------------------------- THE STRAW MEN ---------------------------------------------------------------- */
let DUMMY = null;
export function dummySet(which) {
  if (!DUMMY) DUMMY = [0, 1].map(v => {
    const pal = { s: '#c4a870', S: '#8a7248', e: '#2a2230', t: '#8a5a32', y: '#9a6a42', Y: '#6a4630', p: '#6a7a5a', h: '#e0c070', H: '#b89a48', w: '#6a4a2c', W: '#4a3220', r: '#c9b27c', g: '#8a919c', G: '#5a6270', l: '#c2c9d4' };
    const head = v === 0
      ? ['....ssss....', '...ssssss...', '..sssssssS..', '..seSssseS..', '..sssSsssS..', '...sSsssS...']
      : ['....gggg....'.slice(0, 12), '...gllggg...', '..glgGggGg..', '..GGGGGGGG..', '..seSssseS..', '...sSsssS...'];
    const rows = [...head, '....tttt....', '.wwwwwwwwww.', 'hyyyyyyyyyyh', '.yYyyyppyYy.', '..yyyyppyy..', '..yYyyyyYy..', '..yyrrrryy..', '..yYyyyyYy..', '...yyyyyy...', '...hHhhHhh..'.slice(0, 12), '.....ww.....', '.....ww.....', '...WWWWWW...', '..WWWWWWWW..'];
    const tilt = rows.map((r, i) => i < 14 ? '.' + r.slice(0, -1) : r);
    const f = r => outline(fromGrid(r, pal, 1), OUT), Rr = [f(rows), f(tilt)], white = Rr.map(c => whiten(c));
    return { R: Rr, L: Rr.map(flipX), white: { R: white, L: white.map(flipX) }, ax: 7, ay: 21, w: 10, h: 18 };
  });
  return DUMMY[which ? 1 : 0];
}

/* ---------------------------------------------------------------- THE FLOOR RING + THE NAME TAG ---------------------------------------------------------------- */
/* half: 'back' (the far half, behind the hero) or 'front' (the near half, over the floor). c: his colour, d: its dark. Pixel by pixel: a 1 px ring (rx 9, ry 3), a shimmer
   that runs round it in two frames, a faint fill on the near side, a dark rim outside it so it reads on the pale sand too. */
export function ring(g, x, y, c, d, front, time, n) {
  const cy = y - 2, sh = (Math.floor(time * 6) + n) & 1;
  for (let dx = -9; dx <= 9; dx++) {
    const dy = Math.round(3 * Math.sqrt(1 - (dx / 9) * (dx / 9))), yy = front ? cy + dy : cy - dy;
    if (front) { P(g, x + dx, yy + 1, d); if (Math.abs(dx) < 8) { g.globalAlpha = 0.3; R(g, x + dx, cy + 1, 1, Math.max(0, dy - 1), c); g.globalAlpha = 1; } }
    P(g, x + dx, yy, ((dx + (front ? 3 : 0) + sh * 3 + 18) % 6 === 0) ? '#ffffff' : c);
  }
  if (!front) for (let dx = -9; dx <= 9; dx++) { const dy = Math.round(3 * Math.sqrt(1 - (dx / 9) * (dx / 9))); if (Math.abs(dx) < 8 && dx % 2) { g.globalAlpha = 0.4; P(g, x + dx, cy - dy - 1, d); g.globalAlpha = 1; } }
}
/* a name plate: a dark slate edged in his colour with a small point toward him; the letters are drawn by the game's own text (text(s, x, y, col, 'center', 6)) */
export function tag(g, x, y, c, d, text, label, ai) {
  const col = ai ? '#c9a0ff' : c, w = 15, h = 10, X0 = x - 7, Y0 = y - 2;
  R(g, X0, Y0, w, h, OUT); R(g, X0 + 1, Y0 + 1, w - 2, h - 2, '#241c30'); R(g, X0 + 1, Y0 + 1, w - 2, 1, col); R(g, X0 + 1, Y0 + h - 2, w - 2, 1, ai ? '#5a3a8a' : d);
  R(g, X0 + 6, Y0 + h, 3, 1, OUT); R(g, X0 + 7, Y0 + h + 1, 1, 1, OUT); P(g, X0 + 7, Y0 + h, col);
  text(label, x, y, col, 'center', 6);
}

