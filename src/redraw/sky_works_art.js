// sky_works_art.js - THE HEAD STATION'S WORKS, hand-drawn (claude/sky2art, 2026-11-14): everything SKYHOOK 2 (src/skyhook2-hands.js, flag SKY2) adds to the arena, in the High Lines' own iron-and-rope style
// of src/redraw/line_crew_art.js (same CP palette: tarred rope, riveted iron, rime, goblin line-crew gold). THEME = iron, rope, pulleys, hooks: no wood, no logs.
//   THE THREE LEVERS  each its OWN SILHOUETTE so they read apart by shape, not by colour: POINTS = a tall switch-stand with a DIAMOND signal head (a fork icon on its plinth, a throw-arm that
//                     swings left/right); WEIGHT = a squat A-FRAME with a pulley and a hanging iron BLOCK that drops (a down-arrow icon); CRANE = a big round spoked WINDLASS WHEEL on a post (a hook icon).
//                     The lamp is a glyph, not only a colour: RING (open / out of reach), SOLID (ready / set), CROSS (off / locked / spent), BARS (busy / told).
//   THE LINES         SKY rope = pennant flags (blue); LOW rope = square tags (green); a cut LOW line = grey, dashed, slack, with frayed tufts; a snapped SKY line = both halves drooping with tufts.
//   THE WORKS         two iron crown cabs bolted into the roof, the roof jib with its pulley block, the ORE SKIP (an iron tub with a hazard band on a four-chain bridle), its brake clamp when held.
//   THE TELLS         follow the game's colour language (src/marks.js: yellow = a shield turns it, red = it does not): the counterweight and the skip are RED, the rivets are YELLOW; every tell has a
//                     different SHAPE from its release (streak + foot circle vs the block and its shock ring; dashed arc + ghost skip vs the swept tub with its motion trail; flat dots vs hot falling rivets).
// Pure drawing on a 2d context, fillRect only (the node sheet's software raster has no paths). Palette discipline: tools/hl-art-lint.mjs counts every colour.
import { CP } from './line_crew_art.js';
const R = Math.round, TAU = Math.PI * 2, I = CP.iron, RP = CP.rope;
export const SW = { gold: '#ffd36b', amber: '#ffb347', hot: '#ff9a3c', red: '#ff4a2a', redS: '#ff6b6b', white: '#ffffff', cream: '#fff6e0', pale: '#c8d8e8', blue: '#8ab8ff', green: '#7ad07a', dim: '#5a5a62', off: '#4a4a52', dark: '#1b1626', brown: '#7a6a5a', rimC: '#8ea6bc', haze: '#ff8a3c', rope: RP[3] };
const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), Math.max(1, R(w)), Math.max(1, R(h))); };
const dot = (g, x, y, c) => rc(g, x, y, 1, 1, c);
function ln(g, x0, y0, x1, y1, c, th = 1) { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))); for (let i = 0; i <= n; i++) rc(g, x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, th, th, c); }
function ring(g, cx, cy, r, c, dash = 0, ph = 0) { const n = Math.max(8, Math.ceil(TAU * r * 1.1)); for (let i = 0; i < n; i++) { if (dash && ((i + ph) % (dash * 2)) >= dash) continue; const a = i / n * TAU; dot(g, cx + Math.cos(a) * r, cy + Math.sin(a) * r, c); } }
function eRing(g, cx, cy, rx, ry, c, dash = 0, ph = 0) { const n = Math.max(12, Math.ceil(TAU * rx * 0.9)); for (let i = 0; i < n; i++) { if (dash && ((i + ph) % (dash * 2)) >= dash) continue; const a = i / n * TAU; dot(g, cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, c); } }
const blinkOn = (time, hz = 6) => Math.floor(time * hz) % 2 === 0;
const alpha = (g, a, fn) => { g.globalAlpha = a; fn(); g.globalAlpha = 1; };

/* ====================================================== THE LAMP GLYPHS (shape says the state; the colour agrees) ====================================================== */
export const LAMP_LOOK = { SKY: ['ring', SW.blue], LOW: ['solid', SW.green], LOCKED: ['cross', SW.dim], HOOKING: ['bars', SW.red], HELD: ['solid', SW.gold],
  READY: ['solid', SW.gold], SPENT: ['cross', SW.dim], DARK: ['cross', SW.off], SWINGING: ['bars', SW.red], COOLING: ['ring', SW.brown], PAUSE: ['solid', SW.amber], HOLDS: ['bars', SW.gold] };
export const LAMP_WORD = { HOOKING: 'HOLD IT!' };   /* the word the lamp's state prints (the rest print their own name): while he hooks the points, a blow HOLDS them */
/* a 7x7 lamp window at (cx, cy) */
export function lampGlyph(g, cx, cy, st, lit, time) {
  const [kind, col0] = LAMP_LOOK[st] || ['cross', SW.dim], col = lit ? SW.white : col0, x = R(cx) - 3, y = R(cy) - 3;
  rc(g, x - 1, y - 1, 9, 9, I[0]); rc(g, x, y, 7, 7, I[1]);
  if (kind === 'solid') { rc(g, x + 1, y + 1, 5, 5, col); rc(g, x + 1, y + 1, 5, 1, SW.cream); dot(g, x + 1, y + 2, SW.cream); }
  else if (kind === 'ring') { rc(g, x + 1, y + 1, 5, 1, col); rc(g, x + 1, y + 5, 5, 1, col); rc(g, x + 1, y + 1, 1, 5, col); rc(g, x + 5, y + 1, 1, 5, col); }
  else if (kind === 'bars') { const k = Math.floor((time || 0) * 5) & 1; for (let r = 0; r < 3; r++) rc(g, x + 1 + (r + k) % 2, y + 1 + r * 2, 4, 1, col); }
  else { for (let i = 0; i < 5; i++) { dot(g, x + 1 + i, y + 1 + i, col); dot(g, x + 5 - i, y + 1 + i, col); } }
}
/* 7x7 icons on each plinth: a FORK (the points), a block on a DOWN-ARROW (the weight), a HOOK (the crane) */
const ICONS = {
  POINTS: ['#.....#', '.#...#.', '..#.#..', '...#...', '...#...', '...#...', '...#...'],
  WEIGHT: ['...#...', '...#...', '.#.#.#.', '..###..', '...#...', '.#####.', '.#####.'],
  CRANE: ['.#####.', '...#...', '...#...', '...#...', '#..#...', '.#.#...', '..##...'],
};
function plinth(g, x, y, id) {
  rc(g, x - 10, y - 11, 20, 11, I[1]); rc(g, x - 10, y - 11, 20, 1, I[4]); rc(g, x - 10, y - 11, 1, 11, I[3]); rc(g, x + 9, y - 11, 1, 11, I[0]); rc(g, x - 10, y - 1, 20, 1, I[0]);
  for (const [bx, by] of [[-8, -9], [7, -9], [-8, -3], [7, -3]]) { dot(g, x + bx, y + by, I[5]); dot(g, x + bx + 1, y + by + 1, I[0]); }
  rc(g, x - 4, y - 10, 9, 9, I[0]); rc(g, x - 4, y - 10, 9, 1, I[2]);
  const ic = ICONS[id]; for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) if (ic[r][c] === '#') dot(g, x - 3 + c, y - 9 + r, CP.rime[1]);
}
/* the four corner brackets round a lever that can be struck NOW (shape, so it reads without colour) */
function brackets(g, x0, y0, x1, y1, col, len = 4) {
  for (const [bx, by, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { rc(g, sx > 0 ? bx : bx - len + 1, by, len, 1, col); rc(g, bx, sy > 0 ? by : by - len + 1, 1, len, col); }
}
const GRIP = (g, x, y, hot) => { rc(g, x - 2, y - 2, 5, 5, hot ? SW.gold : I[4]); rc(g, x - 2, y - 2, 5, 1, I[5]); dot(g, x, y, I[0]); };

/* ====================================================== THE THREE LEVERS ====================================================== */
/* id POINTS | WEIGHT | CRANE, (x, y) = the lever's centre on the rock, o = { swing (0.35 -> 0 after a blow), st (the lamp state), blink (lit this beat), hot (can be struck now), time, tell (shake) }.
   Hit box is the prop's (12 x 22): the art only dresses it. */
export function drawLeverPost(g, id, x, y, o) {
  const { swing = 0, st = 'DARK', time = 0 } = o, hot = !!o.hot, lit = !!(o.blink && blinkOn(time)), jx = o.tell ? (Math.floor(time * 30) & 1 ? 1 : -1) : 0;
  x = R(x) + jx; y = R(y);
  plinth(g, x, y, id);
  if (id === 'POINTS') {
    const low = st === 'LOW' || st === 'HELD' || st === 'LOCKED';
    rc(g, x - 2, y - 30, 4, 19, I[2]); rc(g, x - 2, y - 30, 1, 19, I[4]); rc(g, x + 1, y - 30, 1, 19, I[0]);                                      /* the stand */
    for (let r = -8; r <= 8; r++) { const w = (8 - Math.abs(r)) * 2 + 1; rc(g, x - (w >> 1), y - 38 + r, w, 1, I[2]); dot(g, x - (w >> 1), y - 38 + r, I[4]); dot(g, x + (w >> 1), y - 38 + r, I[0]); }   /* the DIAMOND head */
    dot(g, x, y - 46, I[5]); dot(g, x, y - 30, I[0]);
    lampGlyph(g, x, y - 38, st, lit, time);
    if (st === 'HELD') { for (const yy of [-24, -19]) { rc(g, x - 6, y + yy, 12, 2, SW.gold); rc(g, x - 6, y + yy, 12, 1, SW.cream); } rc(g, x - 7, y - 25, 2, 8, SW.amber); rc(g, x + 5, y - 25, 2, 8, SW.amber); }   /* the gold CLAMP: HELD */
    const sgn = low || swing > 0 ? 1 : -1, ex = x + sgn * 11, ey = y - 26;                                                                          /* the THROW-ARM: left = SKY, right = LOW */
    ln(g, x, y - 16, ex, ey, I[2], 2); ln(g, x, y - 17, ex, ey - 1, I[4], 1); rc(g, x - 2, y - 18, 5, 4, I[3]); dot(g, x, y - 17, I[0]);
    for (let k = 1; k < 4; k++) rc(g, x + sgn * (3 + k * 2), y - 16 - k * 2 - 1, 2, 2, RP[1 + (k & 1)]);                                              /* a rope-wrapped grip */
    GRIP(g, ex, ey, hot);
    if (st === 'LOCKED') { for (let k = 0; k < 3; k++) rc(g, x - 5 + k * 4, y - 14, 2, 3, I[0]); rc(g, x - 6, y - 14, 12, 1, SW.dim); }               /* the line is down: a grey bar across the stand */
    if (swing > 0) for (let k = 0; k < 6; k++) { const a = time * 17 + k * 1.05; dot(g, ex + Math.cos(a) * 6, ey + Math.sin(a) * 6, k & 1 ? SW.white : SW.gold); }
    if (st === 'HOOKING') { alpha(g, 0.55 + 0.35 * Math.sin(time * 20), () => ring(g, x, y - 38, 12, SW.red, 2, Math.floor(time * 12))); }
  } else if (id === 'WEIGHT') {
    const spent = st === 'SPENT', fall = spent && swing > 0 ? 1 - swing / 0.35 : spent ? 1 : 0, top = R(y - 30 + fall * 18);                          /* the block: up (READY) -> on the plinth (SPENT) */
    ln(g, x - 9, y - 11, x - 1, y - 36, I[2], 2); ln(g, x + 9, y - 11, x + 1, y - 36, I[2], 2); ln(g, x - 8, y - 12, x - 1, y - 36, I[4], 1);      /* the A-frame legs */
    rc(g, x - 6, y - 21, 12, 2, I[3]); rc(g, x - 6, y - 21, 12, 1, I[4]);
    ring(g, x, y - 36, 3, I[4]); dot(g, x, y - 36, I[5]);                                                                                           /* the pulley */
    rc(g, x - 5, y - 52, 11, 11, I[0]); rc(g, x - 4, y - 51, 9, 1, I[3]); rc(g, x - 1, y - 41, 3, 3, I[2]);                                          /* the lantern over the apex */
    lampGlyph(g, x, y - 46, st, lit, time);
    if (!spent || swing > 0) { ln(g, x - 1, y - 33, x - 1, top - 1, RP[2], 1); ln(g, x + 1, y - 33, x + 1, top - 1, RP[1], 1); }                     /* the rope over the pulley to the block */
    rc(g, x - 4, top, 9, 9, I[1]); rc(g, x - 4, top, 9, 1, I[4]); rc(g, x - 4, top, 1, 9, I[3]); rc(g, x + 4, top, 1, 9, I[0]); rc(g, x - 4, top + 8, 9, 1, I[0]);   /* THE WEIGHT: a cast-iron block */
    rc(g, x - 2, top + 2, 5, 1, I[0]); rc(g, x - 2, top + 5, 5, 1, I[0]); dot(g, x - 3, top + 1, I[5]); dot(g, x + 3, top + 7, I[5]); rc(g, x - 1, top - 2, 3, 2, I[4]);   /* its ribs, rivets, ring-eye */
    if (spent && swing <= 0) { for (let k = 0; k < 3; k++) dot(g, x - 6 + k * 6, y - 12 - (k & 1), RP[2]); }                                           /* slack rope on the plinth */
    if (swing > 0) for (let k = 0; k < 5; k++) dot(g, x - 8 + ((k * 7 + Math.floor(time * 30)) % 17), top + 9 + (k & 1), SW.gold);                      /* chips on the drop */
  } else {
    const spin = o.tell ? time * 9 : st === 'SWINGING' ? time * 2.2 : swing > 0 ? swing * 28 : st === 'HOLDS' ? 0.5 : 0.3, hx = x, hy = y - 39;
    rc(g, x - 2, y - 30, 4, 19, I[2]); rc(g, x - 2, y - 30, 1, 19, I[4]); rc(g, x + 1, y - 30, 1, 19, I[0]);
    rc(g, x - 6, y - 24, 12, 2, I[3]); rc(g, x - 6, y - 24, 12, 1, I[4]);                                                                           /* the stand and its cross-brace */
    ring(g, hx, hy, 10, I[3]); ring(g, hx, hy, 9, I[2]); ring(g, hx, hy, 10.6, I[4], 3);                                                            /* THE WINDLASS WHEEL */
    for (let k = 0; k < 4; k++) { const a = spin + k * Math.PI / 2; ln(g, hx, hy, hx + Math.cos(a) * 9, hy + Math.sin(a) * 9, I[3], 2); ln(g, hx, hy - 0.5, hx + Math.cos(a) * 9, hy - 0.5 + Math.sin(a) * 9, I[4], 1); }
    { const a = spin + 0.7; ln(g, hx + Math.cos(a) * 9, hy + Math.sin(a) * 9, hx + Math.cos(a) * 14, hy + Math.sin(a) * 14, I[4], 2); GRIP(g, hx + Math.cos(a) * 14, hy + Math.sin(a) * 14, hot); }   /* the crank */
    lampGlyph(g, hx, hy, st, lit, time);
    if (st === 'HOLDS') { rc(g, x - 11, y - 20, 4, 8, SW.gold); rc(g, x + 8, y - 20, 4, 8, SW.gold); rc(g, x - 11, y - 20, 4, 1, SW.cream); rc(g, x + 8, y - 20, 4, 1, SW.cream); }   /* a gold brake shoe either side: the skip is held */
    if (swing > 0) for (let k = 0; k < 6; k++) { const a = time * 15 + k * 1.05; dot(g, hx + Math.cos(a) * 15, hy + Math.sin(a) * 15, k & 1 ? SW.white : SW.gold); }
  }
  if (hot && lit) brackets(g, x - 13, y - 53, x + 13, y, SW.cream, 4);
  else if (hot) brackets(g, x - 13, y - 53, x + 13, y, SW.gold, 3);
}

/* ====================================================== THE LINES ====================================================== */
/* a rope from screen x0 to x1 along fy(x): kind 'sky' (pennant flags, blue) | 'low' (square tags, green); state 'taut' | 'cut' (grey, dashed, slack) */
export function drawRope(g, x0, x1, fy, kind, state, time) {
  const cut = state === 'cut';
  for (let x = R(x0); x <= x1; x++) {
    if (cut && ((x - R(x0)) % 11) > 6) continue;
    const sag = cut ? R(Math.sin((x - x0) / Math.max(1, x1 - x0) * Math.PI) * 4) : 0, y = R(fy(x)) + sag, tw = (x >> 1) & 1;
    rc(g, x, y + 2, 1, 1, I[0]);                                                                                                                  /* a thin shadow so it parts from the cave rock */
    rc(g, x, y, 1, 1, cut ? CP.wool[2] : tw ? RP[3] : RP[2]); rc(g, x, y + 1, 1, 1, cut ? CP.wool[1] : tw ? RP[2] : RP[1]);
  }
  if (cut) return;
  for (let x = R(x0) + 24; x < x1 - 8; x += 34) { const y = R(fy(x));
    if (kind === 'sky') { rc(g, x, y + 2, 1, 5, I[2]); rc(g, x + 1, y + 3, 4, 3, SW.blue); rc(g, x + 1, y + 3, 4, 1, SW.pale); const w = Math.round(Math.sin(time * 4 + x) * 0.6); dot(g, x + 5 + w, y + 4, SW.blue); }   /* a pennant */
    else { rc(g, x, y + 2, 1, 2, I[2]); rc(g, x - 1, y + 4, 5, 5, I[0]); rc(g, x, y + 5, 3, 3, SW.green); dot(g, x, y + 5, CP.rime[2]); } }                                                  /* a square tag */
}
/* the ragged ends of a cut / snapped line: a dangling rope with a tuft of strands (dir -1 hangs to the left of x) */
export function drawFrayedEnd(g, x, y, dir, len, time) {
  for (let i = 0; i < len; i++) { const sw = Math.round(Math.sin(time * 3 + i * 0.25) * Math.min(2, i / 9)), yy = y + i; rc(g, x + dir * (i * 0.35) + sw, yy, 1, 1, (i >> 1) & 1 ? RP[2] : RP[1]); rc(g, x + dir * (i * 0.35) + sw + 1, yy, 1, 1, RP[0]); }
  const ex = x + dir * len * 0.35, ey = y + len; for (let k = 0; k < 5; k++) dot(g, ex + (k - 2) * 1 + dir * (k & 1), ey + (k % 3), k & 1 ? CP.rime[0] : RP[3]);
}
/* the sparks and the opened strands at the place he is cutting (x, y on the line); k 0..1 */
export function drawFrayAt(g, x, y, k, time) {
  for (let i = -3; i <= 3; i++) { const o = Math.abs(i), sp = Math.round(k * (2 + o)), fl = Math.floor(time * 20 + i) & 1; dot(g, x + i * 3, y - sp * (i & 1 ? 1 : -1) + (fl ? 0 : 1), i & 1 ? RP[3] : RP[2]); dot(g, x + i * 3 + 1, y - sp * (i & 1 ? 1 : -1) + 1, RP[1]); }
  for (let i = 0; i < 4; i++) { const a = time * 22 + i * 1.6; dot(g, x + Math.cos(a) * (4 + k * 6), y + Math.sin(a) * 4 - 2, i & 1 ? SW.gold : SW.white); }
}

/* ====================================================== THE CROWNS, THE JIB, THE SKIP ====================================================== */
/* a crown: an iron CAB bolted into the roof by two straps, a deck he perches on at (x, y), the sheave on its outer side (side W or E) */
export function drawCrown(g, x, y, roofY, side, skyY, time) {
  x = R(x); y = R(y); roofY = R(roofY); const o = side === 'W' ? -1 : 1, wx = x + o * 15;
  rc(g, x - 19, roofY, 38, 5, I[1]); rc(g, x - 19, roofY, 38, 1, I[4]); rc(g, x - 19, roofY + 4, 38, 1, I[0]);                                       /* the roof plate */
  for (let k = -16; k <= 16; k += 8) { dot(g, x + k, roofY + 2, I[5]); dot(g, x + k + 1, roofY + 3, I[0]); }                                           /* its rivets */
  for (const sx of [-12, 8]) { rc(g, x + sx, roofY + 5, 4, y - roofY - 5, I[2]); rc(g, x + sx, roofY + 5, 1, y - roofY - 5, I[4]); rc(g, x + sx + 3, roofY + 5, 1, y - roofY - 5, I[0]);
    for (let yy = roofY + 10; yy < y - 4; yy += 12) rc(g, x + sx - 1, yy, 6, 2, I[3]); }                                                            /* the straps, with their clamp bands */
  ln(g, x - 12, y - 14, x - 4, y - 2, I[2], 1); ln(g, x + 12, y - 14, x + 4, y - 2, I[2], 1);                                                        /* the cross-braces */
  rc(g, x - 15, y, 30, 5, I[2]); rc(g, x - 15, y, 30, 1, I[5]); rc(g, x - 15, y + 4, 30, 1, I[0]);                                                  /* the DECK */
  for (let k = -12; k <= 12; k += 6) { dot(g, x + k, y + 2, I[5]); dot(g, x + k, y + 3, I[0]); }
  ln(g, x - 14, y + 5, x - 6, y + 11, I[2], 2); ln(g, x + 14, y + 5, x + 6, y + 11, I[2], 2); rc(g, x - 3, y + 5, 6, 4, I[1]);                         /* the cradle under it */
  ring(g, wx, y - 16 + 0, 6, I[4]); ring(g, wx, y - 16, 4, I[3]); const a = time * 1.2; ln(g, wx, y - 16, wx + Math.cos(a) * 5, y - 16 + Math.sin(a) * 5, I[5]); dot(g, wx, y - 16, I[5]);   /* THE SHEAVE the rope runs over */
  void skyY;
}
/* the roof jib: a riveted beam with a swivel block the chain hangs from (screen px) */
export function drawJib(g, px, py, roofY) {
  px = R(px); py = R(py); roofY = R(roofY);
  rc(g, px - 42, roofY, 84, 6, I[1]); rc(g, px - 42, roofY, 84, 1, I[4]); rc(g, px - 42, roofY + 5, 84, 1, I[0]);
  for (let k = -38; k <= 38; k += 6) { dot(g, px + k, roofY + 2, I[3]); dot(g, px + k, roofY + 3, I[0]); }
  ln(g, px - 40, roofY + 6, px - 8, py - 1, I[2], 1); ln(g, px + 40, roofY + 6, px + 8, py - 1, I[2], 1);                                            /* the gusset braces */
  rc(g, px - 6, roofY + 4, 12, py - roofY - 2, I[2]); rc(g, px - 6, roofY + 4, 1, py - roofY - 2, I[4]); rc(g, px + 5, roofY + 4, 1, py - roofY - 2, I[0]);
  rc(g, px - 5, py - 3, 10, 6, I[3]); rc(g, px - 5, py - 3, 10, 1, I[5]); ring(g, px, py + 1, 2, I[0]);                                                 /* the swivel block */
}
/* the ORE SKIP: an iron tub on a four-chain bridle (x, y = the top of the tub's rim; tilt: how far the pendulum has swung, px of shear across its height).
   o = { dim (the crane is unlit), held (the brake clamp is on), time } */
export function drawSkip(g, x, y, tilt, o = {}) {
  x = R(x); y = R(y); const T = tilt || 0, time = o.time || 0;
  for (const s of [-1, 1]) ln(g, x + s * 10 + T * 0.1, y - 1, x + T * 0.1, y - 14, CP.chain[1 + (s > 0 ? 1 : 0)], 1);                                  /* the four-chain bridle (two shown front-on) */
  rc(g, x - 2 + T * 0.1, y - 17, 5, 4, I[4]); rc(g, x - 1 + T * 0.1, y - 16, 3, 2, I[0]);                                                          /* the shackle ring */
  for (let i = 0; i < 18; i++) { const inset = i < 3 ? 0 : (i - 2) * 0.28, sh = T * (i - 9) * 0.005, x0 = x - 12 + inset + sh, w = 24 - inset * 2, band = i >= 9 && i < 13;
    rc(g, x0, y + i, w, 1, band ? (((R(x0 + w) + i + (R(x0))) >> 1) & 1 ? SW.amber : I[0]) : i < 3 ? I[3] : I[2]);
    if (!band) { dot(g, x0, y + i, I[4]); dot(g, x0 + w - 1, y + i, I[0]); for (let s = 5; s < w - 2; s += 6) if (i > 3) dot(g, x0 + s, y + i, I[1]); } }                       /* the staves */
  rc(g, x - 12 + T * -0.108, y, 24, 1, I[5]); for (let k = -10; k <= 10; k += 4) dot(g, x + k + T * -0.05, y + 1, I[4]);                              /* the rim and its rivets */
  rc(g, x - 9, y + 17, 18, 1, I[0]);
  for (let k = 0; k < 5; k++) rc(g, x - 9 + k * 4 + (k & 1), y - 2 - (k % 2), 3 + (k & 1), 2 + (k % 2), k & 1 ? I[1] : I[0]);                              /* ore heaped over the rim */
  dot(g, x - 5, y - 3, CP.rime[1]); dot(g, x + 3, y - 3, CP.rime[0]);
  if (o.dim) alpha(g, 0.4, () => rc(g, x - 13, y - 17, 26, 36, I[0]));
  if (o.held) { for (const s of [-1, 1]) { rc(g, x + s * 9 - 2, y - 14, 4, 8, SW.gold); rc(g, x + s * 9 - 2, y - 14, 4, 1, SW.cream); } rc(g, x - 8, y - 11, 16, 2, SW.amber); const k = Math.floor(time * 4) & 1; rc(g, x - 5, y - 8 + k, 2, 3, SW.gold); rc(g, x + 3, y - 8 + k, 2, 3, SW.gold); }   /* THE BRAKE CLAMP on the chain: gold shoes, a hold bar */
}
/* the SKIP'S TELL: a red dashed arc (chain-link dashes with an arrowhead each way's end) and a ghost tub at the far end. pts: [[x, y] ...] along the arc (screen px, the tub's centre) */
export function drawSkipArc(g, pts, time, dirSign) {
  const ph = Math.floor(time * 14);
  alpha(g, 0.5 + 0.3 * Math.sin(time * 16), () => { for (let i = 0; i < pts.length; i++) { if (((i + ph) % 4) >= 2) continue; rc(g, pts[i][0] - 1, pts[i][1] - 1, 3, 3, SW.red); rc(g, pts[i][0], pts[i][1], 1, 1, SW.cream); } });
  const [ex, ey] = pts[pts.length - 1];
  alpha(g, 0.45, () => { rc(g, ex - 12, ey - 8, 24, 18, SW.red); rc(g, ex - 12, ey - 8, 24, 2, SW.redS); });                                           /* the ghost tub where it will stop */
  for (let k = 0; k < 4; k++) rc(g, ex - 6 * dirSign - k * dirSign, ey - 14 + k, 2, 1, SW.cream);
  for (let k = 0; k < 4; k++) { rc(g, ex + dirSign * (6 + k * 1), ey - 16 - k, 1, 1, SW.red); rc(g, ex + dirSign * (6 + k), ey - 16 + k, 1, 1, SW.red); }   /* an arrowhead: the way it goes */
}
/* the SKIP in motion: a trail of fading ghosts behind it along the path (pts: the last few positions, newest last) */
export function drawSkipTrail(g, pts) { pts.forEach(([px, py], i) => alpha(g, 0.1 + 0.12 * i, () => { rc(g, px - 11, py - 8, 22, 17, I[3]); })); }

/* ====================================================== A1: THE COUNTERWEIGHT RUN ====================================================== */
/* the iron weight: 16 x 16, a ring-eye shackled to the line's sheave, ribs, rivets and a hazard band (x, y = its centre) */
export function drawWeightBlock(g, x, y, time, hot) {
  x = R(x); y = R(y);
  rc(g, x - 8, y - 8, 16, 16, I[1]); rc(g, x - 8, y - 8, 16, 2, I[4]); rc(g, x - 8, y - 8, 2, 16, I[3]); rc(g, x + 6, y - 8, 2, 16, I[0]); rc(g, x - 8, y + 6, 16, 2, I[0]);
  for (let k = -5; k <= 3; k += 2) { rc(g, x + k, y + 1, 1, 3, k & 2 ? SW.amber : I[0]); }
  rc(g, x - 6, y - 5, 12, 1, I[0]); for (const [bx, by] of [[-6, -6], [5, -6], [-6, 5], [5, 5]]) dot(g, x + bx, y + by, I[5]);
  rc(g, x - 2, y - 12, 5, 4, I[4]); rc(g, x - 1, y - 11, 3, 2, I[0]); rc(g, x - 1, y - 14, 3, 2, I[3]);                                             /* the ring-eye and shackle */
  if (hot) alpha(g, 0.35 + 0.25 * Math.sin(time * 18), () => rc(g, x - 9, y - 9, 18, 18, SW.red));
}
/* the TELL: the line's streak in red - chevrons running DOWN the line to its foot - the latch lamp at the crown, the danger circle at the foot with a down-arrow */
export function drawWeightTell(g, tx, ty, fx, fy, floorY, rad, time, on) {
  const L = Math.hypot(fx - tx, fy - ty), ux = (fx - tx) / L, uy = (fy - ty) / L, ph = (time * 70) % 24;
  alpha(g, 0.35 + 0.35 * Math.sin(time * 18), () => ln(g, tx, ty, fx, fy, SW.red, 3));
  for (let d = ph; d < L - 4; d += 24) { const cx = tx + ux * d, cy = ty + uy * d; for (let k = 0; k < 3; k++) { rc(g, cx - 3 + k, cy - 3 + k * 0, 1, 1, SW.cream); } rc(g, cx - 3, cy - 1, 7, 2, SW.cream); rc(g, cx - 2, cy + 1, 5, 1, SW.redS); rc(g, cx - 1, cy + 2, 3, 1, SW.red); }   /* down chevrons */
  const lampc = on ? SW.cream : SW.red; rc(g, tx - 4, ty - 4, 9, 9, I[0]); rc(g, tx - 3, ty - 3, 7, 7, lampc); rc(g, tx - 3, ty - 3, 7, 1, SW.white);                                  /* the latch lamp at the crown */
  eRing(g, fx, floorY - 1, rad, 5, on ? SW.cream : SW.red, 3, Math.floor(time * 10));                                                              /* the foot circle (r 28, dashed) */
  alpha(g, 0.2 + 0.15 * Math.sin(time * 18), () => { for (let r = 0; r < 5; r++) rc(g, fx - rad + r, floorY - 6 + r, rad * 2 - r * 2, 1, SW.red); });
  const bob = Math.floor(time * 6) % 3; for (let k = 0; k < 5; k++) rc(g, fx - 4 + k, floorY - 30 - bob + k, 9 - k * 2, 1, SW.red); rc(g, fx - 1, floorY - 40 - bob, 3, 8, SW.red);   /* a down-arrow over the foot */
}
/* the FALL: the block with a motion streak up the line (k 0..1 along) */
export function drawWeightFall(g, tx, ty, wx, wy) { const L = Math.hypot(wx - tx, wy - ty) || 1; for (let i = 1; i <= 4; i++) alpha(g, 0.4 - i * 0.08, () => rc(g, wx - (wx - tx) / L * i * 8 - 8, wy - (wy - ty) / L * i * 8 - 8, 16, 16, I[3])); drawWeightBlock(g, wx, wy, 0, true); }
/* the SLAM: a shock ring + dust puffs, k 0..1 over its first 0.4 s */
export function drawSlam(g, x, y, k) {
  alpha(g, 1 - k, () => { eRing(g, x, y - 2, 6 + k * 34, 2 + k * 6, SW.cream, 0); eRing(g, x, y - 2, 4 + k * 26, 1 + k * 4, SW.redS, 0); });
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI, dx = Math.cos(a) * (8 + k * 30) * (i & 1 ? 1 : -1) * 0.9, dy = -Math.sin(a) * (4 + k * 22); alpha(g, 1 - k, () => rc(g, x + dx - 1, y + dy - 1, 3, 3, i & 1 ? I[3] : CP.rime[0])); }
}
/* the IRON STEP the block leaves: 16 x 16 (x, y = its top-left): a pale top lip (you stand on it), hazard chevrons on the face, glowing hot from the slam and cooling; blinks in its last second */
export function drawIronStep(g, x, y, left, total, time) {
  x = R(x); y = R(y); const heat = Math.max(0, 1 - (total - left) / 1.6), last = left < 1 && Math.floor(time * 10) % 2 === 0;
  if (last) return;
  rc(g, x, y, 16, 16, I[1]); rc(g, x, y, 16, 2, I[5]); rc(g, x, y + 2, 16, 1, I[3]); rc(g, x, y, 1, 16, I[3]); rc(g, x + 15, y, 1, 16, I[0]); rc(g, x, y + 15, 16, 1, I[0]);
  for (let k = 0; k < 4; k++) { rc(g, x + 2 + k * 3, y + 6 + (k & 1) * 0, 2, 5, k & 1 ? SW.amber : I[0]); }
  for (const [bx, by] of [[1, 4], [13, 4], [1, 13], [13, 13]]) dot(g, x + bx, y + by, I[5]);
  rc(g, x + 1, y + 12, 14, 1, I[0]);
  if (heat > 0) alpha(g, 0.5 * heat, () => rc(g, x, y, 16, 16, SW.red));
}

/* ====================================================== A2: RIVET RAIN ====================================================== */
/* a told dot on the floor (YELLOW: a shield turns a rivet): a flat ring with a rivet-head cross; every dot draws the same */
export function drawRivetDot(g, x, floorY, r, time) {
  const p = 0.6 + 0.3 * Math.sin(time * 14);
  alpha(g, p * 0.6, () => { for (let k = 0; k < 3; k++) rc(g, x - r + k * 2, floorY - 3 + k, (r - k) * 2 - k * 2 + 2, 1, SW.gold); });
  eRing(g, x, floorY - 1, r + 1, 3, SW.gold, 0); alpha(g, p, () => { rc(g, x - 3, floorY - 1, 7, 1, SW.cream); rc(g, x, floorY - 3, 1, 5, SW.cream); });
}
/* a hot rivet falling: a domed head, a shank, a yellow-white glow and a streak above (k 0..1 down the fall; y = its bottom) */
export function drawRivetFall(g, x, y, time) {
  for (let i = 1; i <= 5; i++) alpha(g, 0.5 - i * 0.09, () => rc(g, x, y - 6 - i * 4, 1, 3, SW.gold));
  rc(g, x - 3, y - 7, 7, 3, SW.hot); rc(g, x - 2, y - 8, 5, 1, SW.gold); rc(g, x - 1, y - 4, 3, 5, SW.hot); rc(g, x - 1, y - 7, 2, 1, SW.cream); dot(g, x, y + 1, SW.white);
  if (Math.floor(time * 24) & 1) dot(g, x + 3, y - 3, SW.gold);
}
/* the hit: sparks spraying off the rock (k 0..1 over 0.35 s) */
export function drawRivetHit(g, x, floorY, k) {
  for (let i = 0; i < 7; i++) { const a = -0.3 - i / 6 * (Math.PI - 0.6), v = 10 + (i % 3) * 7; alpha(g, 1 - k, () => rc(g, x + Math.cos(a) * v * k * 2, floorY - 2 + Math.sin(a) * v * k * 2 + k * k * 12, 2, 2, i & 1 ? SW.gold : SW.hot)); }
  alpha(g, 1 - k, () => eRing(g, x, floorY - 1, 4 + k * 12, 1 + k * 2, SW.cream));
}

/* ====================================================== THE READS ON HIM ====================================================== */
/* OUT OF REACH (his sky line, a crown): a ring of chain links, turning, a padlock over his head; nothing gold */
export function drawOutOfReach(g, x, y, time) {
  const n = 12; for (let i = 0; i < n; i++) { const a = i / n * TAU + time * 0.6, cx = x + Math.cos(a) * 24, cy = y + Math.sin(a) * 24, ax = Math.cos(a + Math.PI / 2), ay = Math.sin(a + Math.PI / 2), L2 = i & 1 ? 3 : 2;
    for (let k = -L2; k <= L2; k++) rc(g, cx + ax * k, cy + ay * k, 1, 1, i & 1 ? CP.chain[2] : CP.chain[1]); if (!(i & 1)) { dot(g, cx, cy, I[0]); } }
  const lx = x, ly = y - 38; rc(g, lx - 4, ly, 9, 7, I[3]); rc(g, lx - 4, ly, 9, 1, I[5]); rc(g, lx - 3, ly + 1, 1, 6, I[4]); dot(g, lx, ly + 3, I[0]); dot(g, lx, ly + 4, I[0]);   /* the PADLOCK */
  rc(g, lx - 3, ly - 4, 1, 4, I[4]); rc(g, lx + 3, ly - 4, 1, 4, I[4]); rc(g, lx - 3, ly - 5, 7, 1, I[4]);
}
/* HIT HIM NOW: four gold corner brackets round his body and down-chevrons bouncing over him (DOWN: two chevrons; JARRED: one, paler; SMASHED: three, orange, with iron chips round him) */
export function drawTarget(g, x, y, time, kind) {
  const col = kind === 'smashed' ? SW.hot : kind === 'jarred' ? SW.pale : SW.gold, w = kind === 'smashed' ? 20 : 17, hgt = 20, bob = Math.floor(time * 5) % 3, pulse = Math.floor(time * 8) & 1;
  brackets(g, x - w, y - hgt, x + w, y + 10, pulse ? SW.cream : col, 6); brackets(g, x - w + 1, y - hgt + 1, x + w - 1, y + 9, col, 4);
  const n = kind === 'jarred' ? 1 : kind === 'smashed' ? 3 : 2;
  for (let c = 0; c < n; c++) { const cy = y - 34 - c * 7 - bob; for (let k = 0; k < 5; k++) { rc(g, x - 5 + k, cy + k, 2, 1, col); rc(g, x + 4 - k, cy + k, 2, 1, col); } }
  if (kind === 'smashed') for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 0.3; rc(g, x + Math.cos(a) * 28, y + Math.sin(a) * 12 - 4, 2 + (i & 1), 2, i & 1 ? I[4] : I[3]); }
}
/* WARDED (the frost shrugs it off): a ring of pale shards turning round him */
export function drawWard(g, x, y, time) {
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU - time * 1.6, cx = x + Math.cos(a) * 29, cy = y + Math.sin(a) * 29; alpha(g, 0.55 + 0.3 * Math.sin(time * 6 + i), () => { rc(g, cx - 1, cy - 3, 3, 6, CP.rime[1]); rc(g, cx, cy - 4, 1, 8, CP.rime[2]); }); }
}
/* ENRAGED (a clear, sustained look): red embers rising off him and a hot-red glow at his feet, steam off the cap */
export function drawEnrage(g, x, y, time) {
  for (let i = 0; i < 9; i++) { const t = (time * 0.9 + i * 0.37) % 1, ex = x - 14 + ((i * 11) % 29) + Math.sin(t * 7 + i) * 3, ey = y + 8 - t * 54; alpha(g, 1 - t, () => rc(g, ex, ey, 2, 2, i & 1 ? SW.hot : SW.redS)); }
  alpha(g, 0.28 + 0.14 * Math.sin(time * 9), () => { rc(g, x - 18, y + 6, 36, 3, SW.red); rc(g, x - 12, y + 3, 24, 3, SW.red); });
  for (let i = 0; i < 3; i++) { const t = (time * 1.4 + i * 0.33) % 1; alpha(g, 0.5 * (1 - t), () => rc(g, x - 4 + i * 4 + Math.round(Math.sin(t * 9)) , y - 30 - t * 14, 3, 2, SW.white)); }
}
/* the lamp on his trolley: a blue RING = he rides the SKY line (out of reach); a green SOLID = he rides the LOW line (drawn at the trolley's top) */
export function drawTrolleyLamp(g, x, y, kind) {
  rc(g, x - 3, y - 2, 7, 7, I[0]); rc(g, x - 2, y - 1, 5, 5, I[1]);
  if (kind === 'sky') { rc(g, x - 2, y - 1, 5, 1, SW.blue); rc(g, x - 2, y + 3, 5, 1, SW.blue); rc(g, x - 2, y - 1, 1, 5, SW.blue); rc(g, x + 2, y - 1, 1, 5, SW.blue); }
  else { rc(g, x - 2, y - 1, 5, 5, SW.green); rc(g, x - 2, y - 1, 5, 1, SW.cream); }
}
/* a gold chain of links: his hook flung down at the POINTS (the re-hook), the links alternating flat / edge-on (x0, y0 -> x1, y1) */
export function drawGoldChain(g, x0, y0, x1, y1, time) {
  const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 4));
  for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * 3; if (i & 1) { rc(g, x - 1, y - 1, 3, 3, SW.gold); dot(g, x, y, I[0]); } else { rc(g, x, y - 1, 1, 3, SW.amber); rc(g, x - 1, y, 3, 1, SW.amber); } }
  dot(g, x1 + (Math.floor(time * 20) & 1), y1, SW.white);
}
/* a progress bar (the tells' fray / cut / re-hook bars) */
export function drawTellBar(g, x, y, w, k, col) { rc(g, x - 1, y - 1, w + 2, 5, I[0]); rc(g, x, y, w, 3, SW.dark); rc(g, x, y, w * Math.max(0, Math.min(1, k)), 3, col); rc(g, x, y, w * Math.max(0, Math.min(1, k)), 1, SW.cream); }
/* a dashed straight line of 2x2 pips (the hook's aim, the drop ring's leader); on/off in px, ph scrolls */
export function dashLine(g, x0, y0, x1, y1, col, on = 3, off = 3, ph = 0) { const L = Math.hypot(x1 - x0, y1 - y0) || 1; for (let d = 0; d < L; d += 1) { if (((d + ph) % (on + off)) >= on) continue; rc(g, x0 + (x1 - x0) * d / L, y0 + (y1 - y0) * d / L, 2, 2, col); } }
/* a dashed path of pips along points (the low swing's told arc) */
export function drawPathDash(g, pts, time, col) { const ph = Math.floor(time * 14); alpha(g, 0.5 + 0.3 * Math.sin(time * 16), () => { for (let i = 0; i < pts.length; i++) { if (((i + ph) % 4) >= 2) continue; rc(g, pts[i][0] - 1, pts[i][1] - 1, 3, 3, col); } }); }
/* the floor band the cut rope will whip (RED: a shield does not turn it): a hatched strip with up-chevrons - jump it (k 0..1 over the tell) */
export function drawWhipBand(g, x0, x1, top, floor, k, time) {
  alpha(g, 0.18 + 0.3 * k, () => rc(g, x0, top, x1 - x0, floor - top, SW.red));
  alpha(g, 0.7, () => { rc(g, x0, top, x1 - x0, 1, SW.redS); for (let x = x0 + 12; x < x1 - 8; x += 26) for (let j = 0; j < 4; j++) { rc(g, x - 4 + j, top + 9 - j, 2, 1, SW.cream); rc(g, x + 4 - j, top + 9 - j, 2, 1, SW.cream); } });
}
export { rc, ring, eRing };
