// src/gargoyle-whelp.js — THE GARGOYLE WHELP (docs/briefs/witchlight-whelps.md). Daniel, 2026-09-26: "a section with small
// gargoyle enemies before the boss... he should summon those minis rather than the demons."
// The Gate Gargoyle's brood: stone the size of an imp, set on the tower's merlons, spouts and cornices. It is SAFE UNTIL IT
// MOVES - perched it is stone, and a blade glances off it - and its danger is the SHOVE, not the damage: it drops on you off
// a ledge you are standing on, and the ledge is over a fall.
//   ents  { t: 'whelp', x, y }   perched on the tile under it (a merlon, a spout, a ledge). Its perch is where it was put.
//   PERCHED    stone: WH.stoneTake of a blow (a spark, "STONE"), no stagger, no shove. Its eyes brighten when it has seen you.
//   THE SWOOP  crouchTell: it crouches, spreads its wings and SCREECHES (a yellow !: a shield turns it) - then dives in a line
//              at where you are. A hit shoves you hard. Guarded, it clangs off and lies dazed on the floor.
//   LANDED     at the end of the dive, on a floor or a slab: stone gone soft, every blow counts. Then it flaps home, and hardens.
//   CRUMBLES   when broken: chips, dust and a screech cut short.
// This file holds its NUMBERS, its FRAMES and its ART. What it does is updateWhelp in src/main.js, because the mark audit
// (tools/tells.mjs) reads creature update functions there and nowhere else.
import { fromGrid, outline, flipX, whiten } from './px.js';
import { OUT } from './art.js';

/* speeds px/s, times s, reach px. A hero runs 92 and jumps about 3.2 tiles: the swoop is quicker than you and shorter than a room */
export const WH = {
  hp: 28, w: 12, h: 14,
  sight: 118, sightUp: 40, sightDown: 150,   /* it looks DOWN off its perch: 7 tiles along, 2.5 up, 9 down */
  tell: 0.65, speed: 235, swoopT: 0.85, landT: 1.3, dazedT: 2.1, flyV: 105, cd: [2.2, 3.0], wake: [0.4, 1.1],
  stoneTake: 1, dmg: { swoop: 9 }, shove: [175, -150],
  gargSight: 900, gargSwoopT: 2.2,           /* one the Gate Gargoyle calls sees his whole room from the tower's face */
};
/* THE SWOOP'S LINE, a function so the tool can ask it: a unit vector from the whelp at the hero's middle */
export function whelpAim(e, tx, ty) { const dx = tx - e.x, dy = ty - (e.y - 6), n = Math.hypot(dx, dy) || 1; return [dx / n, dy / n]; }
/* stone while it sits, stone while it crouches on its perch: only a whelp OFF its perch can be cut */
export const whelpStone = e => !!e && (e.mode === 'perch' || e.mode === 'crouchTell');
export const whelpOpen = e => !!e && (e.mode === 'landed' || e.mode === 'dazed');
/* does it see you from its perch: along, and below more than above (it is a thing that drops) */
export function whelpSees(e, P, far) {
  if (!P || P.dead) return false; const dx = Math.abs(P.x - e.x), dy = P.y - e.y;
  return far ? dx < WH.gargSight && dy > -WH.sightUp - 40 : dx < WH.sight && dy > -WH.sightUp && dy < WH.sightDown;
}

/* WHICH FRAME: 0 perched, 1 perched watching (eyes lit), 2 crouch (the tell), 3 swoop, 4-5 fly, 6 landed, 7 crumble, 8 hurt */
export const WHELP_F = { perch: 0, watch: 1, crouch: 2, swoop: 3, flyA: 4, flyB: 5, landed: 6, crumble: 7, hurt: 8 };
export function whelpFrame(e) {
  switch (e.mode) {
    case 'perch': return e.seen ? WHELP_F.watch : WHELP_F.perch;
    case 'crouchTell': return WHELP_F.crouch;
    case 'swoop': return WHELP_F.swoop;
    case 'landed': case 'dazed': return (e.flash || 0) > 0.02 ? WHELP_F.hurt : WHELP_F.landed;
    case 'home': return Math.floor((e.anim || 0) * 9) % 2 ? WHELP_F.flyB : WHELP_F.flyA;
  }
  return WHELP_F.perch;
}

// ---------------- THE ART ----------------
/* A STONE WHELP: a hunched grey-violet body in the Gate Gargoyle's own stone, two horns, bat wings of stone folded up behind it
   like a cloak, a tail round its feet, claws hooked over the edge it sits on, and two witchlight eyes - the only living colour on
   it, dim while it sits and bright once it has seen you. Drawn on a 22 x 20 design grid (feet on row 19), set one cell in from the
   top and the left of a 24 x 21 grid so no wing tip's outline reaches the canvas's edge (E6). */
const W = 24, H = 21, OX = 1, OY = 1;
const PAL = { S: '#6a6280', s: '#8e86a4', h: '#b4acc8', D: '#3a3450', w: '#4e4666', b: '#2a2438', e: '#3f8f7d', E: '#9affd8',
  m: '#c84a6a', c: '#20182a', k: '#1b1626', d: '#5a5270', o: OUT };
const blank = () => Array.from({ length: H }, () => Array(W).fill('.'));
/* E6, AT BAKE TIME: a pixel put off the grid is COUNTED, not dropped in silence - tools/whelps.mjs fails on any */
export const WHELP_CLIPPED = [];
const put = (r, x, y, ch) => { x = Math.round(x) + OX; y = Math.round(y) + OY; if (y < 0 || y >= H || x < 0 || x >= W) { WHELP_CLIPPED.push(x + ',' + y); return; } r[y][x] = ch; };
const ell = (r, cx, cy, rx, ry, ch, lit) => { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
  const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; if (dx * dx + dy * dy <= 1) put(r, x, y, lit && dy < -0.35 && dx > -0.5 ? lit : ch); } };
const ln = (r, x0, y0, x1, y1, ch) => { const n = Math.max(1, Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) put(r, x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, ch); };
const tri = (r, a, b, c, ch) => { const xs = [a[0], b[0], c[0]], ys = [a[1], b[1], c[1]];
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
    const px = x + 0.5, py = y + 0.5, s = (p, q) => (q[0] - p[0]) * (py - p[1]) - (q[1] - p[1]) * (px - p[0]), d1 = s(a, b), d2 = s(b, c), d3 = s(c, a);
    if (!((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))) put(r, x, y, ch); } };
/* A STONE WING: a membrane between the arm and the three finger bones, the bones drawn over it */
function wing(r, sx, sy, tips, mem = 'w') { for (let i = 0; i + 1 < tips.length; i++) tri(r, [sx, sy], tips[i], tips[i + 1], mem); for (const t of tips) ln(r, sx, sy, t[0], t[1], 'b'); }
function head(r, hx, hy, eye, open = false, tilt = 0) {
  ell(r, hx, hy, 3.2, 2.6, 'S', 's'); ln(r, hx + 2, hy + 0.5 + tilt, hx + 4, hy + 1 + tilt, 'S'); put(r, hx + 4, hy + tilt, 's');   /* the snout */
  ln(r, hx - 1.5, hy - 2, hx - 2.5, hy - 4.5, 'D'); put(r, hx - 3, hy - 5, 'h'); ln(r, hx + 1, hy - 2, hx + 1.5, hy - 4.5, 'D'); put(r, hx + 2, hy - 5, 'h');   /* two horns */
  put(r, hx + 1.5, hy - 0.5, eye); put(r, hx + 2.5, hy - 0.5, eye);                                                                    /* the eyes */
  if (open) { put(r, hx + 3, hy + 1.6, 'm'); put(r, hx + 2, hy + 1.8, 'm'); put(r, hx + 4, hy + 2, 'c'); } else put(r, hx + 3, hy + 1.3, 'D'); }
function claws(r, xs, y) { for (const x of xs) { put(r, x, y, 'c'); put(r, x + 1, y, 'c'); put(r, x + 2, y - 1, 'D'); } }
function sitter(r, eye, lean = 0) {   /* PERCHED: upright on its haunches, the wings folded up behind like a cloak, the tail round the feet */
  wing(r, 8, 8, [[3, 1], [2, 6], [3, 13]], 'w'); ln(r, 8, 8, 5, 15, 'b');
  ln(r, 6, 17, 2, 18, 'D'); ln(r, 2, 18, 1, 16, 'D'); put(r, 1, 15, 's');                         /* the tail */
  ell(r, 10 + lean * 0.5, 13, 4.2, 4.6, 'S', 's'); ell(r, 11, 16, 3.5, 2.2, 'd');                  /* the body, its haunches */
  ln(r, 13, 13, 14, 17, 'D'); ln(r, 12, 12, 14, 12, 'd');                                         /* a foreleg, straight down */
  head(r, 13 + lean, 7, eye); claws(r, [8, 13], 19); }
function frames() {
  const f = r => outline(fromGrid(r.map(q => q.join('')), PAL, 1), OUT), out = [];
  { const r = blank(); sitter(r, 'e'); out.push(f(r)); }                                             /* 0 PERCHED: stone, eyes dim */
  { const r = blank(); sitter(r, 'E', 1); put(r, 16, 6, 'E'); out.push(f(r)); }                     /* 1 WATCHING: leaning out, eyes lit */
  { const r = blank();                                                                               /* 2 THE CROUCH AND THE SCREECH (the tell) */
    wing(r, 9, 11, [[1, 2], [0, 8], [4, 12]]); wing(r, 11, 10, [[9, 0], [14, 1], [15, 6]]);          /* both wings flung up and open */
    ln(r, 5, 18, 1, 18, 'D'); put(r, 0, 17, 's');
    ell(r, 10, 15, 4.6, 3.4, 'S', 's'); ell(r, 11, 17, 4, 1.8, 'd'); ln(r, 14, 15, 15, 18, 'D');
    head(r, 15, 12, 'E', true, 1); claws(r, [7, 13], 19); out.push(f(r)); }
  { const r = blank();                                                                               /* 3 THE SWOOP: head down and forward, wings swept back, claws out */
    wing(r, 8, 8, [[0, 1], [1, 5], [4, 10]]); ell(r, 11, 11, 5, 3, 'S', 's'); ell(r, 9, 12, 3, 2, 'd');
    ln(r, 6, 12, 1, 15, 'D'); put(r, 0, 16, 's');                                                    /* the tail streaming behind */
    head(r, 16, 13, 'E', true, 1); ln(r, 12, 13, 14, 17, 'D'); ln(r, 10, 13, 11, 17, 'D'); claws(r, [13, 10], 18); out.push(f(r)); }
  for (const up of [true, false]) { const r = blank();                                               /* 4-5 FLYING HOME: wings up, wings down */
    if (up) wing(r, 9, 9, [[2, 0], [6, 1], [11, 3]]); else wing(r, 9, 10, [[2, 16], [5, 17], [10, 14]]);
    ln(r, 6, 11, 2, 13, 'D'); put(r, 1, 13, 's'); ell(r, 11, 10, 4.5, 3, 'S', 's'); head(r, 15, 8, 'E');
    ln(r, 11, 12, 11, 15, 'D'); ln(r, 13, 12, 14, 15, 'D'); claws(r, [10, 13], 16); out.push(f(r)); }
  { const r = blank();                                                                               /* 6 LANDED: down on all fours, wings drooped open, head low: open */
    wing(r, 8, 12, [[1, 7], [0, 12], [3, 17]]); wing(r, 12, 12, [[14, 8], [17, 11], [16, 15]], 'd');
    ln(r, 5, 17, 1, 19, 'D'); ell(r, 10, 15, 5, 3, 'S', 's'); ln(r, 7, 16, 6, 19, 'D'); ln(r, 13, 16, 14, 19, 'D');
    head(r, 16, 15, 'E', true, 1); claws(r, [5, 13], 19); out.push(f(r)); }
  { const r = blank();                                                                               /* 7 CRUMBLE: the stone gone to pieces, falling apart along its cracks */
    ell(r, 9, 15, 3.4, 2.4, 'S', 's'); ell(r, 15, 13, 2.4, 2, 'S', 's'); ell(r, 5, 11, 2, 1.8, 'd'); ell(r, 12, 18, 2.2, 1.2, 'd');
    tri(r, [2, 16], [6, 14], [5, 19], 'w'); tri(r, [16, 16], [20, 15], [19, 19], 'w');
    ln(r, 7, 13, 11, 17, 'k'); ln(r, 14, 12, 16, 14, 'k'); put(r, 16, 12, 'e'); put(r, 3, 8, 's'); put(r, 18, 9, 's'); put(r, 11, 10, 'D'); put(r, 20, 12, 'd');
    out.push(f(r)); }
  { const r = blank();                                                                               /* 8 HURT: head snapped back, chips off it */
    wing(r, 8, 11, [[1, 5], [0, 10], [3, 15]]); ln(r, 5, 17, 1, 18, 'D'); ell(r, 10, 15, 4.6, 3.2, 'S', 's'); ell(r, 11, 17, 3.6, 1.6, 'd');
    ln(r, 7, 16, 6, 19, 'D'); ln(r, 13, 16, 14, 19, 'D'); head(r, 13, 10, 'E', true, -1); put(r, 18, 7, 's'); put(r, 17, 4, 'd'); claws(r, [5, 13], 19); out.push(f(r)); }
  return out;
}
function pack(fr, ax, ay, w, h) { const R = fr, L = fr.map(flipX), white = fr.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(flipX) }, ax, ay, w, h }; }
/* the anchor is its feet: the body's centre column (x 10 on the design grid, 12 with the offset and the margin) and the bottom edge */
export const bakeWhelp = () => pack(frames(), 12, H + 1, WH.w, WH.h);
