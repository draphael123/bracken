// tavern_backdrop.js - THE CROSSROADS INN's ROOM (claude/tavernart). The back wall, the beams and posts, the fireplace with its living fire, the window onto the road
// (a parallax view that goes from dusk to night to dawn), the long tables and Waymeet's drinkers (three-frame idle loops: rest, sip, laugh), the bar with its barkeep, the
// campaign map table, the painted wardrobe, the drills board, the hay, the yard's open arcade with its night sky. All in Waymeet's own oak, limewash and hearth stone
// (src/redraw/tavern_tiles.js TP). The room's static furniture is baked once into two layers (BACK: wall and what stands behind the drinkers; FRONT: the table fronts, the counter,
// the kegs) and the living things are drawn between them every frame. Pure drawing: nothing here reads game state; the room's measures are src/tavern.js ROOM.
//   drawRoom(g, sx, sy, cx, VW, time)  - sx, sy: the screen position of the room's top-left corner (tile 2, row 13); cx: the camera x (for the window's parallax)
//   roomLights(...)                   - none: the game's own lights (hearth, torches, counter) light the room; the glow here is the flicker on the walls
import { canvas, px, rect, line, mulberry, outline } from '../px.js';
import { OUT } from '../art.js';
import { TP } from './tavern_pal.js';

const TS = 16, X0 = 2, Y0 = 13, FY = 112, RW = 64 * TS;   /* the room's top-left tile and its floor line / width, in px from that corner */
export const lx = t => (t - X0) * TS;                      /* a tile column's left edge, in room px */
const wx = t => lx(t) + 8;                                 /* ... its centre */
const YARD = lx(43);                                       /* where the yard's open arcade begins */
const rd = Math.round;
const dith = (g, x, y, w, h, a, b) => { rect(g, x, y, w, h, a); for (let j = 0; j < h; j++) for (let i = (j + x) & 1; i < w; i += 2) px(g, x + i, y + j, b); };
const wob = (t, s, a) => Math.sin(t * s) * a;

/* ===================================================== STATIC BAKES ===================================================== */
let BACK = null, FRONT = null;
function post(g, x, y0, y1, w = 6) { rect(g, x, y0, w, y1 - y0, TP.o2); rect(g, x, y0, 1, y1 - y0, TP.o4); rect(g, x + w - 1, y0, 1, y1 - y0, TP.o1); rect(g, x + 2, y0, 1, y1 - y0, TP.o3); }
function stoneBlock(g, x, y, w, h, r, lit = 0) {
  rect(g, x, y, w, h, TP.s1);
  for (let row = 0; row * 6 < h; row++) { let xx = x + (row & 1) * -4; while (xx < x + w) { const bw = 8 + ((r() * 5) | 0), t = r(), x1 = Math.max(xx + 1, x), x2 = Math.min(xx + bw, x + w), yy = y + row * 6, hh = Math.min(5, y + h - yy - 0);
      if (x2 > x1 && hh > 0) { rect(g, x1, yy + 1, x2 - x1, hh - 1, t < 0.22 ? TP.s3 : t < 0.6 ? TP.s2 : TP.s2); rect(g, x1, yy + 1, x2 - x1, 1, t < 0.3 ? TP.s4 : TP.s3); } xx += bw; } }
  if (lit) { g.globalAlpha = lit; rect(g, x, y, w, h, '#ffb060'); g.globalAlpha = 1; }
}
function plate(g, x, y, col) { rect(g, x, y + 1, 6, 5, col); rect(g, x + 1, y, 4, 7, col); rect(g, x + 1, y + 1, 4, 5, TP.p4); rect(g, x + 2, y + 2, 2, 3, col); px(g, x + 1, y + 1, '#fff'); }

function bakeBack() {
  const [c, g] = canvas(RW, FY), r = mulberry(1717);
  /* ---- THE INN'S LIMEWASH WALL, dark under the ceiling and warm at the height of a candle ---- */
  rect(g, 0, 0, YARD, FY, TP.p2);
  rect(g, 0, 0, YARD, 10, TP.p0); dith(g, 0, 10, YARD, 5, TP.p0, TP.p1); rect(g, 0, 15, YARD, 14, TP.p1); dith(g, 0, 29, YARD, 5, TP.p1, TP.p2);
  dith(g, 0, 58, YARD, 6, TP.p2, TP.p3);
  for (let i = 0; i < 380; i++) px(g, (r() * YARD) | 0, 6 + ((r() * 58) | 0), r() < 0.5 ? TP.p1 : TP.p3);                    /* the limewash's grain */
  for (let i = 0; i < 9; i++) { let x = (r() * YARD) | 0, y = 12 + ((r() * 40) | 0); for (let k = 0; k < 6 + ((r() * 5) | 0); k++) { px(g, x, y, TP.p0); x += r() < 0.5 ? 1 : 0; y += 1; } }   /* hairline cracks */
  /* ---- THE TIMBER FRAME: wall plate, posts, the rail at the wainscot's top, braces ---- */
  rect(g, 0, 0, RW, 9, TP.o2); rect(g, 0, 0, RW, 1, TP.o4); rect(g, 0, 8, RW, 1, TP.o1); rect(g, 0, 9, RW, 2, TP.o0);        /* the wall plate, and its shadow */
  for (let x = 6; x < RW; x += 17) px(g, x, 4, TP.fe3);                                                                       /* its pegs */
  const posts = [lx(5), lx(9) + 6, lx(18) + 4, lx(26) + 8, lx(34), lx(37) + 4, lx(42) + 6];
  for (const x of posts) { post(g, x, 9, 66, 7); rect(g, x - 2, 9, 11, 3, TP.o3); }
  line(g, posts[0] + 7, 12, posts[1], 60, TP.o3, 3); line(g, posts[4] + 7, 12, posts[5], 60, TP.o3, 3);                      /* braces, up under the plate */
  rect(g, 0, 62, YARD, 4, TP.o3); rect(g, 0, 62, YARD, 1, TP.o5); rect(g, 0, 65, YARD, 1, TP.o1);
  /* ---- THE WAINSCOT: oak panels from the floor to the rail, dark so a hero stands out against it ---- */
  rect(g, 0, 66, YARD, FY - 66, TP.o1);
  for (let x = 0; x < YARD; x += 24) { rect(g, x + 1, 69, 22, FY - 72, TP.o2); rect(g, x + 1, 69, 22, 1, TP.o3); rect(g, x + 3, 72, 18, FY - 78, TP.o3); rect(g, x + 3, 72, 18, 1, TP.o4); rect(g, x + 3, FY - 7, 18, 1, TP.o2); for (let k = 0; k < 4; k++) px(g, x + 5 + ((r() * 14) | 0), 74 + ((r() * 28) | 0), TP.o2); }
  rect(g, 0, FY - 4, YARD, 4, TP.o0); rect(g, 0, FY - 4, YARD, 1, TP.o2);                                                      /* the skirting board */
  /* ---- WALL DRESSING: a framed bill, a hung pewter plate rack, a hat peg row by the door ---- */
  { const x = lx(9) + 12; rect(g, x, 26, 20, 16, TP.o1); rect(g, x + 1, 27, 18, 14, TP.p4); for (let i = 0; i < 4; i++) rect(g, x + 3, 30 + i * 3, 11 - (i & 1) * 3, 1, TP.o3); px(g, x + 15, 31, TP.f1); px(g, x + 16, 31, TP.f1); }
  /* ---- THE FIREPLACE: a chimney breast of hearth stone, the mantel, the firebox with its iron back, the logs ---- */
  { const cx0 = lx(11), W = 96, mx = cx0 - 8;
    stoneBlock(g, cx0, 9, W, FY - 9, r); rect(g, cx0, 9, 1, FY - 9, TP.s0); rect(g, cx0 + W - 1, 9, 1, FY - 9, TP.s0);
    g.globalAlpha = 0.28; rect(g, cx0, 9, W, 26, '#000'); g.globalAlpha = 1;                                                    /* the breast goes up into the dark */
    rect(g, mx, 42, W + 16, 7, TP.o3); rect(g, mx, 42, W + 16, 1, TP.o6); rect(g, mx, 48, W + 16, 1, TP.o1); rect(g, mx + 2, 49, W + 12, 2, TP.o0);   /* the mantel beam */
    for (const k of [mx, mx + W + 10]) { rect(g, k, 42, 6, 9, TP.o2); rect(g, k + 1, 44, 4, 1, TP.o5); px(g, k + 2, 47, TP.o1); }
    const bx = cx0 + 22, bw = 52;                                                                                                 /* the firebox */
    rect(g, bx - 3, 62, bw + 6, FY - 62, TP.s3); for (let k = 0; k < 7; k++) { const w2 = 3 + (k & 1); rect(g, bx - 3 + k * 8, 55 + Math.abs(k - 3) * 2, 8, 3, k & 1 ? TP.s4 : TP.s3); }
    rect(g, bx, 62, bw, FY - 62, '#150e0c'); for (let j = 0; j < 8; j++) rect(g, bx, 62 + j * 6, bw, 1, '#1e1412');
    for (let y = 63; y < FY; y += 6) for (let x2 = bx + ((y / 6) & 1) * 4; x2 < bx + bw; x2 += 8) rect(g, x2, y + 1, 1, 5, '#1e1412');
    for (let k = 0; k < 9; k++) { const t = k / 8, yy = 62 - Math.round(Math.sin(t * Math.PI) * 9); rect(g, bx + k * 6, yy, 6, 62 - yy + 1, k & 1 ? TP.s4 : TP.s3); rect(g, bx + k * 6, yy, 6, 1, TP.s5); }   /* the arch above the opening */
    rect(g, bx, 62, bw, 6, '#150e0c');
    rect(g, bx + 12, 78, 28, 30, TP.fe0); rect(g, bx + 12, 78, 28, 1, TP.fe2); rect(g, bx + 13, 80, 26, 1, TP.fe1); rect(g, bx + 18, 84, 16, 20, '#2a2a30'); rect(g, bx + 19, 85, 14, 1, TP.fe2);   /* the iron fire-back, a cast crest on it */
    for (const dx of [bx + 4, bx + bw - 10]) { rect(g, dx, 100, 4, 10, TP.fe1); rect(g, dx, 98, 4, 3, TP.fe2); px(g, dx + 1, 97, TP.fe3); }   /* the andirons */
    rect(g, bx + 5, 102, 42, 5, '#2a1a10'); rect(g, bx + 5, 102, 42, 1, TP.o3); rect(g, bx + 8, 99, 36, 4, '#3a2418'); rect(g, bx + 8, 99, 36, 1, TP.o4);   /* the logs */
    px(g, bx + 5, 104, '#c9a060'); px(g, bx + 46, 104, '#c9a060');
    rect(g, bx + 2, 70, 1, 36, TP.fe1); rect(g, bx + 2, 71, 30, 2, TP.fe1); rect(g, bx + 2, 71, 30, 1, TP.fe2); rect(g, bx + 31, 73, 1, 8, TP.fe2);   /* the crane's post and arm; its pot is the fire's (dynamic) */
    for (let i = 0; i < 3; i++) plate(g, mx + 14 + i * 20, 34, [TP.p5, '#3a5a8a', TP.br1][i]);                                   /* the good plates, stood up on the mantel */
    rect(g, mx + 80, 32, 3, 10, TP.br1); rect(g, mx + 79, 41, 5, 1, TP.br0); rect(g, mx + 81, 29, 1, 4, TP.p5);
    { const ax = cx0 + 48, ay = 16;                                                                                              /* a stag's antlers over the mantel */
      rect(g, ax - 4, ay + 12, 8, 6, TP.o4); rect(g, ax - 4, ay + 12, 8, 1, TP.o6); rect(g, ax - 2, ay + 18, 4, 2, TP.o2);
      for (const d of [-1, 1]) { line(g, ax + d * 3, ay + 12, ax + d * 8, ay + 4, TP.p4, 2); line(g, ax + d * 8, ay + 4, ax + d * 11, ay - 3, TP.p4, 2); line(g, ax + d * 6, ay + 8, ax + d * 3, ay + 1, TP.p4, 1); line(g, ax + d * 9, ay + 2, ax + d * 14, ay + 3, TP.p4, 1); px(g, ax + d * 11, ay - 4, TP.p5); } }
    rect(g, cx0 - 12, FY - 22, 10, 22, TP.o1);                                                                                    /* a log stack beside it */
    for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) { rect(g, cx0 - 12 + i * 5, FY - 21 + j * 7, 5, 6, TP.o3); rect(g, cx0 - 11 + i * 5, FY - 20 + j * 7, 3, 4, TP.o5); px(g, cx0 - 10 + i * 5, FY - 19 + j * 7, TP.o6); }
    rect(g, cx0 + W + 4, 70, 1, 12, TP.fe1); rect(g, cx0 + W + 4, 82, 3, 6, TP.fe2); rect(g, cx0 + W + 8, 70, 1, 18, TP.fe1); rect(g, cx0 + W + 7, 87, 3, 3, TP.fe2);   /* the poker and the tongs, on their hooks */
  }
  /* ---- THE WINDOW'S FRAME (its glass is cleared: the view is drawn under this layer), the curtains, the sill and what stands on it ---- */
  { const wx0 = lx(19), ww = 96, wy = 14, wh = 48;
    rect(g, wx0 - 4, wy - 4, ww + 8, wh + 8, TP.o2); rect(g, wx0 - 4, wy - 4, ww + 8, 1, TP.o4); rect(g, wx0 - 4, wy + wh + 3, ww + 8, 1, TP.o1);
    rect(g, wx0 - 2, wy - 2, ww + 4, wh + 4, TP.p4); rect(g, wx0 + ww, wy - 2, 2, wh + 4, TP.p1); rect(g, wx0 - 2, wy + wh, ww + 4, 2, TP.p1);   /* the reveal: the wall's lit and shaded return */
    g.clearRect(wx0 + 2, wy + 2, ww - 4, wh - 4);
    for (const x of [wx0 + 31, wx0 + 62]) { rect(g, x, wy + 2, 3, wh - 4, TP.o2); rect(g, x, wy + 2, 1, wh - 4, TP.o4); rect(g, x + 2, wy + 2, 1, wh - 4, TP.o1); }
    rect(g, wx0 + 2, wy + 22, ww - 4, 2, TP.o2); rect(g, wx0 + 2, wy + 22, ww - 4, 1, TP.o4);
    rect(g, wx0 - 8, wy + wh + 4, ww + 16, 4, TP.o4); rect(g, wx0 - 8, wy + wh + 4, ww + 16, 1, TP.o6); rect(g, wx0 - 8, wy + wh + 7, ww + 16, 1, TP.o1); rect(g, wx0 - 6, wy + wh + 8, ww + 12, 2, TP.o0);   /* the sill */
    rect(g, wx0 - 12, wy - 7, ww + 24, 2, TP.fe1); rect(g, wx0 - 12, wy - 7, ww + 24, 1, TP.fe2);                              /* the curtain rod */
    for (const [x, d] of [[wx0 - 14, 1], [wx0 + ww + 2, -1]]) { for (let j = 0; j < 40; j++) { const w = 12 - (j > 28 ? Math.round((j - 28) * 0.5) : 0); for (let i = 0; i < w; i++) { const fx = d > 0 ? x + i : x + 12 - 1 - i + (12 - w) * 0; px(g, fx, wy - 5 + j, (i % 4 === 0) ? '#c9463d' : (i % 4 === 3 ? '#5a1a1a' : '#8a2e2a')); } } rect(g, x + (d > 0 ? 0 : 6), wy - 5, 6, 2, '#c9463d'); rect(g, d > 0 ? x + 8 : x + 1, wy + 22, 3, 3, TP.br1); }
    const sy = wy + wh + 4;
    rect(g, wx0 + 6, sy - 5, 4, 5, TP.p5); rect(g, wx0 + 5, sy - 6, 6, 1, TP.br1);                                                /* a candle stub in its dish (flame: dynamic) */
    rect(g, wx0 + ww - 16, sy - 7, 8, 7, '#8a6a44'); rect(g, wx0 + ww - 17, sy - 8, 10, 2, '#a8825a'); for (const [dx, dy] of [[-17, -11], [-14, -13], [-11, -10], [-8, -12], [-5, -9]]) px(g, wx0 + ww + dx, sy + dy, '#53894a');   /* a pot of herbs */
    px(g, wx0 + ww - 15, sy - 14, '#8fd160'); px(g, wx0 + ww - 11, sy - 13, '#3f6e2c');
  }
  /* ---- THE BAR'S BACK: shelving with bottles and mugs, a rack of casks, the torch's wall ---- */
  { const bx = lx(29) + 8, bw = 70;
    rect(g, bx, 18, bw, 74, TP.o1); rect(g, bx + 1, 19, bw - 2, 72, '#1c1410');
    for (const sy of [32, 52, 72]) { rect(g, bx, sy, bw, 3, TP.o3); rect(g, bx, sy, bw, 1, TP.o5); rect(g, bx, sy + 3, bw, 1, TP.o0); }
    for (let row = 0; row < 3; row++) { const yb = [32, 52, 72][row];
      for (let i = 0; i < 7; i++) { const x = bx + 4 + i * 9; const k = (i * 5 + row * 3) % 6;
        if (row === 1) { rect(g, x, yb - 8, 4, 8, TP.fe3); rect(g, x, yb - 8, 4, 1, TP.p5); rect(g, x + 4, yb - 6, 2, 3, TP.fe2); }                      /* tankards */
        else { const col = ['#3a6a4a', '#7a2a2a', '#9a7a2a', '#3a4a7a', '#5a3a6a', '#8a5a2a'][k]; rect(g, x, yb - 10, 5, 10, col); rect(g, x + 1, yb - 14, 3, 5, col); rect(g, x + 1, yb - 15, 3, 1, TP.o4); px(g, x + 1, yb - 8, '#fff'); } } }
    for (const [x, y, w] of [[bx + 4, 20, 22]]) { rect(g, x, y, w, 10, TP.p4); rect(g, x, y, w, 1, TP.p5); rect(g, x + 2, y + 3, w - 8, 1, TP.o3); rect(g, x + 2, y + 6, w - 12, 1, TP.o3); }   /* the chalked price board */
    rect(g, bx + 34, 22, 1, 6, TP.fe2); rect(g, bx + 33, 28, 3, 3, TP.br1);
    rect(g, bx - 6, 14, bw + 12, 4, TP.o3); rect(g, bx - 6, 14, bw + 12, 1, TP.o5);                                               /* the cornice */
  }
  /* ---- THE CAMPAIGN TABLE (wx 584): a tilted map board on trestles ---- */
  { const x = lx(36) - 10, y = FY;
    rect(g, x + 3, y - 14, 3, 14, TP.o2); rect(g, x + 29, y - 14, 3, 14, TP.o2); rect(g, x + 3, y - 14, 1, 14, TP.o4); rect(g, x + 29, y - 14, 1, 14, TP.o4); rect(g, x + 5, y - 6, 26, 2, TP.o3); rect(g, x, y - 2, 8, 2, TP.o1); rect(g, x + 27, y - 2, 8, 2, TP.o1);
    for (let j = 0; j < 9; j++) { const sl = Math.round(j * 0.55); rect(g, x + 1 + sl, y - 25 + j, 33 - sl * 1, 1, j === 0 ? TP.o5 : TP.o3); }
    for (let j = 1; j < 9; j++) { const sl = Math.round(j * 0.55); rect(g, x + 3 + sl, y - 25 + j, 29 - sl * 2, 1, j & 1 ? '#d8c490' : '#e4d2a0'); }       /* the parchment, a little foreshortened */
    rect(g, x + 1, y - 17, 35, 2, TP.o2); rect(g, x + 1, y - 17, 35, 1, TP.o4);                                                   /* the board's front edge */
    px(g, x + 6, y - 22, '#3a6a2a'); rect(g, x + 7, y - 22, 5, 1, '#3a6a2a'); rect(g, x + 10, y - 21, 4, 1, '#3a6a2a'); rect(g, x + 8, y - 20, 3, 1, '#2a5a8a'); rect(g, x + 14, y - 22, 8, 1, '#2a5a8a'); rect(g, x + 16, y - 21, 6, 1, '#2a5a8a'); rect(g, x + 22, y - 21, 4, 1, '#3a6a2a');   /* land and water */
    rect(g, x + 12, y - 24, 1, 5, '#8a6a3a'); rect(g, x + 8, y - 21, 9, 1, '#8a6a3a'); px(g, x + 20, y - 23, '#c9463d'); px(g, x + 21, y - 23, '#c9463d'); px(g, x + 25, y - 19, '#ffd36b'); px(g, x + 6, y - 19, '#3a5a8a');   /* the crossroads and the pins */
    rect(g, x - 4, y - 8, 7, 3, '#d8c490'); rect(g, x - 4, y - 8, 7, 1, '#fff6c8'); px(g, x - 2, y - 7, TP.o3);               /* a rolled chart leaned on the trestle */
    rect(g, x + 29, y - 33, 3, 8, TP.p5); rect(g, x + 28, y - 26, 5, 2, TP.br1); rect(g, x + 29, y - 24, 3, 1, TP.br0);          /* the candle in its dish */
  }
  /* ---- THE WARDROBE (wx 648): a painted cupboard, doors open on cloaks and a weapon rack; the mirror beside it ---- */
  { const x = lx(40) - 6, y = FY, W2 = 28, H2 = 48, PAINT = '#3f6a62', PL = '#5a8a7e', PD = '#27453f';
    rect(g, x - 2, y - H2 - 3, W2 + 4, 4, TP.p5); rect(g, x - 2, y - H2 - 3, W2 + 4, 1, '#fff6e0'); rect(g, x - 2, y - H2, W2 + 4, 1, TP.p1);   /* the cornice */
    rect(g, x, y - H2, W2, H2, PAINT); rect(g, x + 2, y - H2 + 3, W2 - 4, H2 - 6, '#150e0c');                                       /* carcass, and the dark inside */
    rect(g, x, y - H2, 2, H2, PL); rect(g, x + W2 - 2, y - H2, 2, H2, PD); rect(g, x, y - 2, W2, 2, PD);
    rect(g, x + 3, y - H2 + 5, W2 - 6, 1, TP.o3);                                                                                    /* the hanging rail */
    [['#c9463d', '#ff7a6a'], ['#3a5a8a', '#6bb8ff'], ['#4a7a3a', '#8fd160'], ['#7a5a9a', '#c9a0ff']].forEach(([c1, c2], i) => { const cxp = x + 5 + i * 4; rect(g, cxp, y - H2 + 6, 3, 20 + (i & 1) * 2, c1); rect(g, cxp, y - H2 + 6, 1, 20 + (i & 1) * 2, c2); px(g, cxp + 1, y - H2 + 5, TP.fe3); });   /* the four cloaks, in the party's colours */
    rect(g, x + 4, y - 18, 1, 14, TP.p4); rect(g, x + 3, y - 18, 3, 2, TP.fe3); rect(g, x + 4, y - 6, 1, 2, TP.br1);              /* a sword (point down) */
    rect(g, x + 9, y - 20, 1, 16, TP.o4); rect(g, x + 8, y - 20, 4, 4, TP.fe3); rect(g, x + 8, y - 20, 4, 1, '#fff');             /* an axe */
    rect(g, x + 15, y - 22, 1, 20, TP.o5); px(g, x + 15, y - 23, '#6bb8ff');                                                         /* a staff */
    rect(g, x - 9, y - H2 + 3, 9, H2 - 6, PAINT); rect(g, x - 9, y - H2 + 3, 1, H2 - 6, PL); rect(g, x - 5, y - H2 + 8, 3, 28, PD); rect(g, x - 4, y - 30, 2, 2, TP.br1);   /* the left door, swung open (its inside and handle) */
    rect(g, x + W2, y - H2 + 3, 8, H2 - 6, PAINT); rect(g, x + W2 + 7, y - H2 + 3, 1, H2 - 6, PD); rect(g, x + W2 + 3, y - H2 + 8, 3, 28, PL); rect(g, x + W2 + 3, y - 30, 2, 2, TP.br1);
    for (const fx of [x + 1, x + W2 - 5]) { rect(g, fx, y, 4, 2, TP.o1); }                                                         /* its feet */
    const mx = x + W2 + 14;                                                                                                          /* the cheval mirror */
    rect(g, mx, y - 36, 14, 36, TP.o2); rect(g, mx, y - 36, 14, 1, TP.o5); rect(g, mx + 2, y - 34, 10, 28, '#7aa0b0'); rect(g, mx + 2, y - 34, 10, 2, '#a8c8d8'); rect(g, mx + 2, y - 34, 1, 28, '#a8c8d8');
    for (let k = 0; k < 4; k++) { rect(g, mx + 4 + k, y - 32 + k * 2, 1, 5, '#e8f4ff'); }
    rect(g, mx - 3, y - 4, 20, 2, TP.o1); rect(g, mx - 3, y - 4, 20, 1, TP.o3); rect(g, mx + 6, y - 6, 2, 3, TP.o2);
  }
  /* ================= THE YARD: an open arcade of stone piers, a low wall, the night over the roofs of Waymeet ================= */
  { const y0 = YARD;
    for (let y = 9; y < 80; y++) { const k = (y - 9) / 70, a = [14 + k * 20, 16 + k * 22, 40 + k * 34], b = [10 + k * 14, 12 + k * 16, 30 + k * 26]; rect(g, y0, y, RW - y0, 1, `rgb(${Math.round(a[0])},${Math.round(a[1])},${Math.round(a[2])})`); }   /* the night, lighter toward the horizon */
    for (let i = 0; i < 40; i++) { const sx = y0 + ((r() * (RW - y0)) | 0), sy = 12 + ((r() * 40) | 0); px(g, sx, sy, r() < 0.2 ? '#fff6c8' : '#9aa8d0'); }
    { const mx = y0 + 250, my = 22; for (let j = -5; j <= 5; j++) { const hw = Math.round(Math.sqrt(30 - j * j)); rect(g, mx - hw, my + j, hw * 2, 1, '#f0ead0'); } rect(g, mx + 1, my - 3, 3, 3, '#d8d0b0'); px(g, mx - 3, my + 1, '#d8d0b0'); }   /* the moon */
    let rx = y0 + 6; const hz = 66;                                                                                                 /* the roofs of Waymeet, black against the lit horizon */
    while (rx < RW - 4) { const w = 22 + ((r() * 24) | 0), h = 10 + ((r() * 12) | 0); const top = hz - h;
      for (let j = 0; j < h; j++) { const pitch = Math.min(j, 7); rect(g, rx + (7 - pitch >= 0 ? Math.max(0, 7 - pitch) : 0), top + j, w - 2 * Math.max(0, 7 - pitch), 1, j < h - 4 ? '#1a1620' : '#14101a'); }
      rect(g, rx, top + 8, w, hz - top - 8, '#161220');
      if (r() < 0.8) { const wxp = rx + 4 + ((r() * (w - 12)) | 0); rect(g, wxp, top + 10, 4, 4, TP.f3); rect(g, wxp, top + 10, 4, 1, TP.f4); }
      if (r() < 0.4) rect(g, rx + w - 8, top - 5, 3, 7, '#1a1620');
      rx += w + 2 + ((r() * 6) | 0); }
    rect(g, y0, hz, RW - y0, 6, '#14101a');
    /* the lean-to roof: dark rafters and boards over the top */
    rect(g, y0, 0, RW - y0, 12, TP.o1); for (let x = y0; x < RW; x += 16) { rect(g, x, 0, 3, 14, TP.o2); rect(g, x, 0, 1, 14, TP.o3); } rect(g, y0, 9, RW - y0, 3, TP.o2); rect(g, y0, 9, RW - y0, 1, TP.o4); rect(g, y0, 12, RW - y0, 1, TP.o0);
    /* the piers */
    for (const x of [y0, y0 + 112, y0 + 236, y0 + 346, RW - 12]) { stoneBlock(g, x, 12, 12, 100, r); rect(g, x - 2, 12, 16, 3, TP.s4); rect(g, x - 2, 12, 16, 1, TP.s5); rect(g, x - 2, 14, 16, 1, TP.s1); }
    /* the low wall with its coping, and a post line of hanging dried herbs */
    stoneBlock(g, y0, 72, RW - y0, 40, r); rect(g, y0, 70, RW - y0, 4, TP.s4); rect(g, y0, 70, RW - y0, 1, TP.s5); rect(g, y0, 73, RW - y0, 1, TP.s1);
    rect(g, y0, FY - 4, RW - y0, 4, TP.s0);
    /* the practice gate (wx 936): a stone arch with the oak leaves ajar (the light behind: dynamic) */
    { const gx = lx(58) - 10, gw = 36, op = '#0e0a10';
      stoneBlock(g, gx, 22, gw, 90, r); rect(g, gx - 2, 20, gw + 4, 3, TP.s4); rect(g, gx - 2, 20, gw + 4, 1, TP.s5);
      for (let j = 0; j < 9; j++) { const hw = Math.round(9 - Math.sqrt(81 - (9 - j) * (9 - j))); rect(g, gx + 9 + hw, 35 + j, 18 - 2 * hw, 1, op); }
      rect(g, gx + 9, 44, 18, 68, op); rect(g, gx + 16, 31, 4, 4, TP.s5); rect(g, gx + 16, 31, 4, 1, '#fff6e0'); rect(g, gx + 7, 44, 2, 68, TP.s4); rect(g, gx + 27, 44, 2, 68, TP.s1);
    }
    /* hung over the yard: a rack of practice weapons by the arena end, a trough of water, sacks of sand */
    { const x = lx(52) + 6, y = FY; rect(g, x, y - 22, 3, 22, TP.o3); rect(g, x + 22, y - 22, 3, 22, TP.o3); rect(g, x, y - 22, 25, 3, TP.o4); rect(g, x, y - 12, 25, 2, TP.o3);
      for (let i = 0; i < 4; i++) { rect(g, x + 4 + i * 5, y - 26 + (i & 1) * 2, 2, 20, i === 1 ? TP.o6 : TP.p3); rect(g, x + 3 + i * 5, y - 20 + (i & 1) * 2, 4, 2, TP.o2); } }
    { const x = lx(50) - 4, y = FY; rect(g, x, y - 9, 14, 9, '#a8895a'); rect(g, x, y - 9, 14, 2, '#c4a674'); rect(g, x + 2, y - 7, 10, 1, '#8a6c44'); rect(g, x + 4, y - 12, 6, 3, '#a8895a'); rect(g, x + 3, y - 12, 8, 1, '#8a6c44'); }   /* a sack of sand */
  }
  /* ---- THE DRILLS BOARD (wx 728): a chalkboard on two posts, three drills chalked on it (tallies: dynamic) ---- */
  { const x = lx(45) - 6, y = FY - 40;
    rect(g, x + 4, y + 22, 3, 18, TP.o2); rect(g, x + 24, y + 22, 3, 18, TP.o2); rect(g, x + 4, y + 22, 1, 18, TP.o4);
    rect(g, x, y, 32, 24, TP.o3); rect(g, x, y, 32, 1, TP.o5); rect(g, x, y + 23, 32, 1, TP.o1); rect(g, x + 2, y + 2, 28, 20, '#1e2a26'); rect(g, x + 2, y + 2, 28, 1, '#0e1612');
    for (let i = 0; i < 3; i++) rect(g, x + 4, y + 3 + i * 6, 24, 1, '#2c3a34');
    rect(g, x + 5, y + 5, 2, 2, '#ffd36b'); line(g, x + 5, y + 4, x + 9, y + 2, '#ffd36b', 1);                                       /* THROW: a bundle in an arc */
    rect(g, x + 5, y + 12, 3, 1, '#8fd160'); px(g, x + 6, y + 11, '#8fd160'); px(g, x + 6, y + 13, '#8fd160');                         /* REVIVE: a cross */
    px(g, x + 5, y + 17, '#6bb8ff'); px(g, x + 7, y + 17, '#6bb8ff'); px(g, x + 6, y + 18, '#6bb8ff'); px(g, x + 6, y + 19, '#6bb8ff'); px(g, x + 5, y + 19, '#6bb8ff'); px(g, x + 7, y + 19, '#6bb8ff');   /* TEAM HIT: two arms on one trunk */
    rect(g, x + 26, y + 23, 4, 1, '#e8f0e8'); rect(g, x + 22, y + 23, 3, 1, '#c9d1c9'); px(g, x + 4, y + 21, '#e8f0e8');            /* the chalk dust on the tray */
  }
  /* ---- THE HAY: two bales either side of the target's ring, and a third on the right ---- */
  for (const [x, y, w] of [[lx(56) - 30, FY, 20], [lx(56) + 20, FY, 20]]) { rect(g, x, y - 12, w, 12, TP.hay1); rect(g, x, y - 12, w, 2, TP.hay2); for (let i = 0; i < 30; i++) px(g, x + ((r() * w) | 0), y - 11 + ((r() * 10) | 0), r() < 0.5 ? TP.hay2 : TP.hay0); rect(g, x + 4, y - 12, 1, 12, '#6a5a2a'); rect(g, x + w - 5, y - 12, 1, 12, '#6a5a2a'); rect(g, x, y - 1, w, 1, TP.hay0); }
  rect(g, lx(56) + 24, FY - 22, 16, 10, TP.hay1); rect(g, lx(56) + 24, FY - 22, 16, 2, TP.hay2); for (let i = 0; i < 14; i++) px(g, lx(56) + 24 + ((r() * 16) | 0), FY - 21 + ((r() * 8) | 0), r() < 0.5 ? TP.hay2 : TP.hay0); rect(g, lx(56) + 29, FY - 22, 1, 10, '#6a5a2a');
  return outlineSoft(c);
}
/* the static layers keep the wall's own values: only the furniture reads against it by its dark base lines (no 4-neighbour black outline over a whole wall) */
const outlineSoft = c => c;

function bakeFront() {
  const [c, g] = canvas(RW, FY), r = mulberry(909);
  /* ---- THE LONG TABLES: two, each a heavy slab on trestles, with tankards, trenchers and a candle; benches in front ---- */
  const table = (cxm, seed) => { const rr = mulberry(seed), x = cxm - 24, y = FY - 22;
    rect(g, x, y, 48, 5, TP.o4); rect(g, x, y, 48, 1, TP.o6); rect(g, x, y + 4, 48, 1, TP.o2); rect(g, x + 1, y + 5, 46, 2, TP.o1);                       /* the top, its lit edge, its apron shadow */
    for (let i = 0; i < 6; i++) px(g, x + 3 + ((rr() * 42) | 0), y + 1 + ((rr() * 3) | 0), TP.o5);
    for (const lxp of [x + 5, x + 38]) { rect(g, lxp, y + 7, 4, 15, TP.o3); rect(g, lxp, y + 7, 1, 15, TP.o5); rect(g, lxp - 2, FY - 3, 8, 3, TP.o2); }
    rect(g, x + 8, FY - 9, 32, 2, TP.o2); rect(g, x + 8, FY - 9, 32, 1, TP.o4);                                                                              /* the stretcher */
    const things = []; for (let t = x + 4; t < x + 44; t += 6 + ((rr() * 4) | 0)) things.push(t);
    for (const t of things) { const k = rr(); const ty = y;
      if (k < 0.5) { rect(g, t, ty - 6, 4, 6, TP.fe3); rect(g, t, ty - 6, 4, 1, TP.p5); rect(g, t + 4, ty - 5, 1, 3, TP.fe2); rect(g, t, ty - 6, 1, 6, '#c2c9d4'); }
      else if (k < 0.7) { rect(g, t, ty - 3, 7, 3, '#c9a060'); rect(g, t + 1, ty - 4, 5, 1, '#e0bc7a'); }
      else if (k < 0.85) { rect(g, t, ty - 1, 7, 1, '#d8d0c0'); px(g, t + 2, ty - 2, '#c9463d'); px(g, t + 3, ty - 2, '#8a5a32'); }
      else { rect(g, t + 1, ty - 5, 2, 5, TP.p5); px(g, t + 1, ty - 6, TP.f3); px(g, t + 1, ty - 7, TP.f4); } } };
  table(wx(19), 11); table(wx(25), 12);
  const bench = cxm => { const x = cxm - 15, y = FY - 9; rect(g, x, y, 30, 3, TP.o4); rect(g, x, y, 30, 1, TP.o6); rect(g, x, y + 3, 30, 1, TP.o1); for (const lxp of [x + 3, x + 24]) { rect(g, lxp, y + 4, 3, 5, TP.o2); rect(g, lxp, y + 4, 1, 5, TP.o4); } };
  /* ---- THE BAR: the counter, its brass rail and taps, the kegs beside it ---- */
  { const x = lx(29) + 8, w = 70, y = FY - 24;
    rect(g, x - 3, y, w + 6, 4, TP.o5); rect(g, x - 3, y, w + 6, 1, TP.o7); rect(g, x - 3, y + 3, w + 6, 1, TP.o2);                                           /* the top, overhanging */
    rect(g, x, y + 4, w, 20, TP.o3); rect(g, x, y + 4, w, 1, TP.o1);
    for (let k = 0; k < w; k += 15) { rect(g, x + k + 1, y + 6, 13, 16, TP.o2); rect(g, x + k + 1, y + 6, 13, 1, TP.o4); rect(g, x + k + 3, y + 8, 9, 12, TP.o3); rect(g, x + k + 3, y + 8, 9, 1, TP.o5); }    /* panelling */
    rect(g, x, FY - 7, w, 2, TP.br1); rect(g, x, FY - 7, w, 1, TP.br2); for (const k of [x + 2, x + w - 4]) rect(g, k, FY - 7, 2, 7, TP.br0);          /* the brass foot rail */
    for (const tx of [x + 40, x + 48, x + 56]) { rect(g, tx, y - 5, 2, 5, TP.br1); rect(g, tx - 1, y - 6, 4, 1, TP.br2); rect(g, tx + 1, y - 3, 3, 1, TP.br1); }       /* the three taps, and the drip tray */
    rect(g, x + 36, y - 1, 26, 1, TP.fe2);
    rect(g, x + 4, y - 6, 4, 6, TP.fe3); rect(g, x + 4, y - 6, 4, 1, TP.p5); rect(g, x + 12, y - 4, 5, 3, '#d8d0c0');                                      /* a mug and a cloth on the counter */
    const kx = x + w + 4; for (const [dx, dy] of [[0, 0], [11, 0], [5, -11]]) { const kk = kx + dx, ky = FY + dy;
      rect(g, kk, ky - 12, 11, 12, TP.o4); rect(g, kk + 1, ky - 13, 9, 1, TP.o3); rect(g, kk + 1, ky - 1, 9, 1, TP.o2); rect(g, kk, ky - 12, 1, 12, TP.o5); rect(g, kk, ky - 9, 11, 1, TP.fe2); rect(g, kk, ky - 4, 11, 1, TP.fe2); rect(g, kk + 4, ky - 7, 3, 3, TP.o1); px(g, kk + 5, ky - 6, TP.br1); }
  }
  bench(wx(17)); bench(wx(22)); bench(wx(28));
  return c;
}
function ensure() { if (!BACK) { BACK = bakeBack(); FRONT = bakeFront(); } }

/* ===================================================== THE DRINKERS (seated, three-frame idle loops) ===================================================== */
/* Waymeet's folk: a straw-hatted farmer, a carter in a cap, an old woman in a shawl, a merchant in a red hood, a young man bareheaded, a hooded traveller. */
const FOLK = [
  { skin: '#e0b088', hair: '#6a4a2a', hat: 'straw', cloth: '#6a7a3a', clothD: '#4a5a2a', beard: 1 },
  { skin: '#d0a078', hair: '#2a1a12', hat: 'cap', cloth: '#7a4a2a', clothD: '#5a3a22', beard: 0 },
  { skin: '#e8c0a0', hair: '#d8d0c8', hat: 'shawl', cloth: '#7a3a5a', clothD: '#5a2a44', beard: 0 },
  { skin: '#c89070', hair: '#3a2a1a', hat: 'hood', cloth: '#9a3a2a', clothD: '#6a2a1e', beard: 1 },
  { skin: '#e8b890', hair: '#c98a3a', hat: 'none', cloth: '#3a5a8a', clothD: '#2a4268', beard: 0 },
  { skin: '#d8a880', hair: '#4a4a52', hat: 'hood', cloth: '#4a5a4a', clothD: '#323e32', beard: 1 },
];
/* a front-facing bust behind a table: head, shoulders, a mug; frame 0 rest, 1 sip (mug up, head back), 2 laugh (head up, mouth open, eyes shut) */
function bust(f, frame) {
  const [c, g] = canvas(14, 20), SK = f.skin, off = frame === 2 ? -1 : 0;
  rect(g, 1, 12, 12, 8, f.cloth); rect(g, 1, 12, 12, 1, f.clothD); rect(g, 0, 14, 2, 6, f.cloth); rect(g, 12, 14, 2, 6, f.cloth); rect(g, 1, 19, 12, 1, f.clothD);   /* shoulders and sleeves */
  rect(g, 5, 11, 4, 2, SK);                                                                                                                                  /* neck */
  const hy = 3 + off + (frame === 1 ? -1 : 0);
  rect(g, 3, hy, 8, 8, SK); rect(g, 3, hy + 6, 8, 2, f.beard ? f.hair : SK);                                                                                 /* head (and a beard) */
  px(g, 3, hy + 3, '#c89070'); px(g, 10, hy + 3, '#c89070');
  if (frame === 2) { rect(g, 4, hy + 3, 2, 1, '#2a1a12'); rect(g, 8, hy + 3, 2, 1, '#2a1a12'); rect(g, 6, hy + 5, 3, 2, '#3a1010'); px(g, 7, hy + 6, '#c9463d'); }   /* eyes shut in a laugh, mouth open */
  else { px(g, 5, hy + 3, '#1b1626'); px(g, 9, hy + 3, '#1b1626'); rect(g, 6, hy + 5, 3, 1, f.beard ? f.clothD : '#a8685a'); if (f.beard) rect(g, 5, hy + 4, 5, 1, f.hair); }
  if (f.hat === 'straw') { rect(g, 0, hy - 1, 14, 2, '#d8b860'); rect(g, 3, hy - 4, 8, 4, '#c9a040'); rect(g, 3, hy - 2, 8, 1, '#8a5a32'); rect(g, 3, hy - 4, 8, 1, '#e8cc80'); }
  else if (f.hat === 'cap') { rect(g, 3, hy - 2, 8, 3, f.cloth); rect(g, 2, hy, 10, 1, f.clothD); rect(g, 3, hy - 2, 8, 1, '#a8683a'); }
  else if (f.hat === 'shawl') { rect(g, 2, hy - 2, 10, 4, f.cloth); rect(g, 2, hy - 2, 1, 11, f.cloth); rect(g, 11, hy - 2, 1, 11, f.cloth); rect(g, 3, hy - 3, 8, 1, f.cloth); rect(g, 3, hy + 1, 8, 1, f.hair); }
  else if (f.hat === 'hood') { rect(g, 2, hy - 2, 10, 4, f.cloth); rect(g, 2, hy - 2, 2, 10, f.cloth); rect(g, 10, hy - 2, 2, 10, f.cloth); rect(g, 3, hy - 3, 8, 1, f.clothD); rect(g, 4, hy - 2, 6, 1, f.cloth); }
  else { rect(g, 3, hy - 1, 8, 3, f.hair); rect(g, 2, hy, 1, 4, f.hair); rect(g, 11, hy, 1, 4, f.hair); rect(g, 4, hy - 2, 6, 1, f.hair); }
  /* the mug: rests in the left hand, or comes up to the mouth */
  if (frame === 1) { rect(g, 8, hy + 4, 4, 5, '#8a919c'); rect(g, 8, hy + 4, 4, 1, '#f0e6c8'); rect(g, 12, hy + 5, 1, 3, '#6a707a'); rect(g, 10, hy + 9, 3, 3, SK); }
  else { rect(g, 9, 13 + off, 4, 5, '#8a919c'); rect(g, 9, 13 + off, 4, 1, '#f0e6c8'); rect(g, 13, 14 + off, 1, 3, '#6a707a'); }
  return outline(c, OUT);
}
/* a side-on drinker on the end of a bench, facing right: head, torso, an arm out with the mug, the thigh, the shin and the boot */
function sitter(f, frame) {
  const [c, g] = canvas(20, 32), SK = f.skin, hy = 2 + (frame === 2 ? -1 : 0), tilt = frame === 1 ? 1 : 0;
  rect(g, 4, 11, 8, 11, f.cloth); rect(g, 4, 11, 8, 1, f.clothD); rect(g, 4, 11, 1, 11, f.clothD); rect(g, 7, 12, 4, 2, f.clothD);                                  /* the back and chest */
  rect(g, 5, 21, 11, 3, f.clothD); rect(g, 13, 24, 4, 7, '#3a2a1a'); rect(g, 13, 22, 3, 2, f.clothD); rect(g, 14, 30, 5, 2, '#24170e');                          /* thigh over the bench, shin, boot */
  rect(g, 6, 10, 4, 2, SK); rect(g, 5 + tilt, hy, 8, 9, SK); rect(g, 13 + tilt, hy + 4, 1, 2, SK); rect(g, 5 + tilt, hy + 7, 3, 2, f.beard ? f.hair : SK);        /* head, nose, beard */
  px(g, 10 + tilt, hy + 3, '#1b1626'); rect(g, 10 + tilt, hy + 6, 3, 1, f.beard ? f.hair : '#a8685a');
  if (frame === 2) { px(g, 10 + tilt, hy + 3, SK); rect(g, 10 + tilt, hy + 3, 2, 1, '#2a1a12'); rect(g, 11 + tilt, hy + 6, 2, 2, '#3a1010'); }
  if (f.hat === 'straw') { rect(g, 3 + tilt, hy - 1, 14, 2, '#d8b860'); rect(g, 6 + tilt, hy - 4, 7, 4, '#c9a040'); rect(g, 6 + tilt, hy - 2, 7, 1, '#8a5a32'); }
  else if (f.hat === 'cap') { rect(g, 5 + tilt, hy - 2, 8, 3, f.cloth); rect(g, 11 + tilt, hy, 4, 1, f.clothD); }
  else if (f.hat === 'shawl') { rect(g, 4 + tilt, hy - 2, 9, 4, f.cloth); rect(g, 4 + tilt, hy - 2, 2, 11, f.cloth); }
  else if (f.hat === 'hood') { rect(g, 4 + tilt, hy - 2, 9, 4, f.cloth); rect(g, 3 + tilt, hy - 2, 3, 12, f.cloth); rect(g, 5 + tilt, hy - 3, 7, 1, f.clothD); }
  else { rect(g, 5 + tilt, hy - 1, 8, 3, f.hair); rect(g, 4 + tilt, hy, 2, 6, f.hair); }
  const ay = frame === 1 ? 5 : 14;                                                                                                                         /* the arm and mug */
  rect(g, 11, 12, 3, 2, f.cloth); rect(g, 13, ay + 3, 2, 10 - (ay - 5) / 3 | 0, f.cloth); rect(g, 13, ay + 2 + (frame === 1 ? 0 : 0), 4, 3, SK);
  rect(g, 15, ay - (frame === 1 ? 2 : 1), 4, 6, '#8a919c'); rect(g, 15, ay - (frame === 1 ? 2 : 1), 4, 1, '#f0e6c8'); rect(g, 19, ay + 1, 1, 3, '#6a707a');
  return outline(c, OUT);
}
let FRAMES = null;
function frames() {
  if (FRAMES) return FRAMES;
  FRAMES = { bust: FOLK.map(f => [0, 1, 2].map(k => bust(f, k))), sit: FOLK.map(f => [0, 1, 2].map(k => sitter(f, k))), keep: [0, 1, 2].map(k => barkeep(k)) };
  FRAMES.sitL = FRAMES.sit.map(a => a.map(flip));
  return FRAMES;
}
function flip(src) { const [c, g] = canvas(src.width, src.height); g.translate(src.width, 0); g.scale(-1, 1); g.drawImage(src, 0, 0); return c; }
/* THE BARKEEP, behind the counter: a broad bald man with a moustache, a cream apron strap, polishing a tankard; frames: cloth left, cloth right, a nod */
function barkeep(frame) {
  const [c, g] = canvas(20, 26), SK = '#d8a078';
  rect(g, 1, 12, 18, 14, '#d8d0b8'); rect(g, 1, 12, 18, 1, '#a8a090'); rect(g, 8, 12, 4, 14, '#b8b0a0'); rect(g, 0, 15, 3, 11, '#b8a888'); rect(g, 17, 15, 3, 11, '#b8a888');       /* the shirt, rolled sleeves */
  rect(g, 4, 12, 2, 14, '#8a5a32'); rect(g, 14, 12, 2, 14, '#8a5a32');                                                                                                          /* the apron's straps */
  rect(g, 8, 10, 4, 3, SK); rect(g, 5, 1 + (frame === 2 ? 1 : 0), 10, 10, SK); rect(g, 5, 1 + (frame === 2 ? 1 : 0), 10, 1, '#e8b890');
  rect(g, 4, 5, 1, 3, SK); rect(g, 15, 5, 1, 3, SK);                                                                                                                              /* ears */
  const hy = 1 + (frame === 2 ? 1 : 0);
  px(g, 7, hy + 4, '#1b1626'); px(g, 12, hy + 4, '#1b1626'); rect(g, 6, hy + 3, 3, 1, '#5a3a22'); rect(g, 11, hy + 3, 3, 1, '#5a3a22');                                           /* eyes and brows */
  rect(g, 6, hy + 6, 8, 2, '#6a4a2a'); rect(g, 5, hy + 7, 3, 1, '#6a4a2a'); rect(g, 12, hy + 7, 3, 1, '#6a4a2a'); rect(g, 8, hy + 8, 4, 1, '#8a3a2a');                              /* the moustache and a smile */
  rect(g, 7, hy - 0, 6, 1, '#c89070');                                                                                                                                              /* the shine on his scalp */
  const mx = frame === 0 ? 3 : frame === 1 ? 5 : 4;                                                                                                                                /* the tankard and the cloth */
  rect(g, 8, 18, 6, 6, '#8a919c'); rect(g, 8, 18, 6, 1, '#f0e6c8'); rect(g, 14, 19, 2, 3, '#6a707a');
  rect(g, mx + 4 - (frame === 1 ? 0 : 2), 17, 5, 4, '#f0ead8'); rect(g, mx + 4 - (frame === 1 ? 0 : 2), 17, 5, 1, '#fff');
  return outline(c, OUT);
}

/* ===================================================== THE LIVING PARTS ===================================================== */
/* a tongue of flame: stacked rects narrowing up, in the fire's four colours */
function flame(g, x, y, w, h, k) {
  rect(g, x, y - h * 0.45, w, h * 0.45, TP.f1); rect(g, x + 1, y - h * 0.8, Math.max(1, w - 2), h * 0.36, TP.f2);
  rect(g, x + w / 2 - 1, y - h, Math.max(1, w / 2 - 0), h * 0.28, k ? TP.f3 : TP.f2);
  rect(g, x + 1, y - h * 0.35, Math.max(1, w - 2), h * 0.35, TP.f3); rect(g, x + 2, y - h * 0.18, Math.max(1, w - 4), h * 0.18, TP.f4);
}
function drawFire(g, sx, sy, time) {
  const bx = sx + lx(11) + 22, fy = sy + 104;
  for (let i = 0; i < 7; i++) { const t = time * (7 + i * 1.3) + i * 2.1, h = 12 + i % 3 * 5 + Math.round(Math.sin(t) * 4 + Math.sin(t * 2.3) * 2), x = bx + 8 + i * 5 + Math.round(Math.sin(t * 0.7) * 1.4);
    const fw = 6 - Math.abs(i - 3) * 0.6 | 0; flame(g, rd(x), fy, Math.max(4, fw + 2), Math.max(8, h), (i + Math.floor(time * 9)) & 1); }
  rect(g, bx + 14, fy - 4, 24, 5, TP.f3); rect(g, bx + 18, fy - 2, 16, 3, TP.f4);                                                                                                   /* the bed of the fire */
  for (let k = 0; k < 6; k++) { const t = (time * 0.6 + k * 0.37) % 1, ex = bx + 10 + k * 7 + Math.round(Math.sin(time * 3 + k * 2) * 3), ey = fy - 8 - t * 36; g.globalAlpha = 1 - t; px(g, rd(ex), rd(ey), t < 0.5 ? TP.f3 : TP.f2); } g.globalAlpha = 1;   /* sparks, rising */
  /* the cauldron on its crane: it hangs over the flames, and steams */
  const cxp = bx + 28, cyp = sy + 76, sw = Math.round(Math.sin(time * 1.6) * 0.5);
  rect(g, cxp + sw, cyp - 3, 1, 8, TP.fe2); rect(g, cxp - 6 + sw, cyp + 5, 14, 11, TP.fe0); rect(g, cxp - 7 + sw, cyp + 5, 16, 2, TP.fe2); rect(g, cxp - 5 + sw, cyp + 7, 1, 8, TP.fe2); rect(g, cxp - 6 + sw, cyp + 14, 14, 2, '#150e0c');
  rect(g, cxp - 4 + sw, cyp + 6, 10, 1, '#5a4a2a');                                                                                                                                  /* the stew's skin */
  for (let k = 0; k < 4; k++) { const t = (time * 0.5 + k * 0.25) % 1; g.globalAlpha = 0.55 * (1 - t); px(g, rd(cxp - 3 + k * 2 + Math.sin(time * 2 + k) * 2), rd(cyp + 3 - t * 16), '#e8e4e0'); rect(g, rd(cxp - 3 + k * 2 + Math.sin(time * 2 + k) * 2), rd(cyp + 2 - t * 16), 2, 1, '#e8e4e0'); } g.globalAlpha = 1;
}
/* hanging lanterns: iron frames on chains, a flame that gutters */
function drawLantern(g, x, y, time, seed) {
  const sw = Math.round(Math.sin(time * 0.9 + seed) * 1), len = 14, k = Math.floor(time * 7 + seed * 3) & 1;
  rect(g, x, y, 1, len, TP.fe2); for (let j = 0; j < len; j += 2) px(g, x - 1 + (j & 2 ? 1 : 0), y + j, TP.fe1);
  const lx0 = x - 4 + sw, ly = y + len;
  rect(g, lx0 - 1, ly, 10, 2, TP.fe1); rect(g, lx0, ly - 3, 8, 3, TP.fe2); rect(g, lx0 + 2, ly - 5, 4, 2, TP.fe2);
  rect(g, lx0 + 1, ly + 2, 6, 8, '#3a2a14'); rect(g, lx0 + 2, ly + 3, 4, 6, TP.f3); rect(g, lx0 + 3, ly + 4 + k, 2, 4 - k, TP.f4); rect(g, lx0 + 1, ly + 2, 1, 8, TP.fe1); rect(g, lx0 + 6, ly + 2, 1, 8, TP.fe1); rect(g, lx0, ly + 10, 8, 2, TP.fe1);
  g.fillStyle = '#ffb860'; g.globalAlpha = 0.04 + 0.01 * k; for (const [rw, rh] of [[44, 30], [30, 20], [18, 12]]) for (let y = -rh; y < rh; y += 2) { const hw = Math.round(rw / 2 * Math.sqrt(1 - (y / rh) * (y / rh))); g.fillRect(lx0 + 4 - hw, ly + 6 + y, hw * 2, 2); } g.globalAlpha = 1;
}

/* THE WINDOW'S VIEW: a night-road in three parallax layers under a sky that goes dusk -> night -> dawn on a long cycle; a lamp-post, a signpost, a far inn light; a carter's lantern passes */
let WIN = null;
const SKY = [[['#d9885a', '#9a5a6a', '#5a3a6a', '#2a2048'], 0], [['#101830', '#141e3a', '#1c2a4c', '#26345a'], 1], [['#e8a070', '#b0708a', '#5a5a8a', '#3a4a7a'], 2]];
const mix = (a, b, k) => { const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
function drawWindowView(g, sx, sy, cx, VW, time) {
  const wx0 = lx(19) + 2, wy = 14 + 2, W = 92, H = 44, view = cx + VW / 2 - (X0 * TS + lx(19) + 48);
  if (!WIN) { [WIN] = canvas(W, H); }
  const wg = WIN.getContext('2d');
  const cyc = (time / 40) % 3, i0 = Math.floor(cyc) % 3, i1 = (i0 + 1) % 3, kk = Math.max(0, Math.min(1, (cyc % 1 - 0.55) / 0.45)), A = SKY[i0][0], B = SKY[i1][0];
  for (let b = 0; b < 4; b++) rect(wg, 0, b * 8, W, 8, mix(A[b], B[b], kk));
  const night = i0 === 1 ? 1 - kk * 0.7 : i0 === 0 ? kk : 0.3 * (1 - kk) + 0; const sc = Math.max(0, night);
  const r = mulberry(33); for (let i = 0; i < 26; i++) { const x = (r() * W) | 0, y = (r() * 22) | 0, tw = Math.sin(time * 2 + i) > 0.6; wg.globalAlpha = Math.min(1, sc * (tw ? 0.5 : 1)); px(wg, x, y, '#fff6c8'); } wg.globalAlpha = 1;
  { const mx = rd(66 - view * 0.03), my = 9; wg.globalAlpha = Math.min(1, sc + 0.1); for (let j = -3; j <= 3; j++) { const hw = Math.round(Math.sqrt(10 - j * j)); rect(wg, mx - hw, my + j, hw * 2, 1, '#f0ead0'); } wg.globalAlpha = 1; }
  const far = (x) => 28 + Math.round(Math.sin(x * 0.09) * 4 + Math.sin(x * 0.23) * 2);                                                                                                /* far hills */
  for (let x = 0; x < W; x++) { const h = far(x + view * 0.1); rect(wg, x, h, 1, H - h, mix('#1c2040', '#2a1e3a', 0.4)); }
  for (let x = 0; x < W; x++) { const h = 33 + Math.round(Math.sin((x + view * 0.25) * 0.15) * 2); rect(wg, x, h, 1, H - h, '#14121e'); }                                              /* the treeline and the town's roofs */
  for (const bx of [14, 47, 79]) { const px0 = rd(bx - view * 0.25); const x = ((px0 % 130) + 130) % 130 - 20; rect(wg, x, 28, 8, 8, '#161220'); for (let j = 0; j < 4; j++) rect(wg, x + j, 25 + j, 8 - j * 2, 1, '#161220'); rect(wg, x + 2, 31, 3, 3, TP.f3); }   /* a far cottage with its window lit */
  { const x = ((rd(30 - view * 0.4) % 150) + 150) % 150 - 25; for (let j = 0; j < 6; j++) rect(wg, x - 3 + j, 27 - j * 2, 6 - j, 1, '#10101a'); rect(wg, x, 24, 2, 12, '#10101a'); }
  rect(wg, 0, 37, W, H - 37, '#2a2218'); rect(wg, 0, 37, W, 1, '#4a3c28'); for (let x = 0; x < W; x += 6) px(wg, (x + rd(view * 0.6)) % W, 40 + (x % 3), '#3a3020');                           /* the road */
  rect(wg, 0, 41, W, 3, '#1c160e');
  const sg = ((rd(24 - view * 0.55) % 120) + 120) % 120 - 14;                                                                                                                          /* the crossroads signpost */
  rect(wg, sg, 24, 2, 17, '#4a3626'); rect(wg, sg - 7, 25, 10, 3, '#6a4a2c'); rect(wg, sg - 7, 25, 3, 3, '#8a6a44'); rect(wg, sg + 1, 29, 9, 3, '#6a4a2c'); rect(wg, sg + 7, 29, 3, 3, '#8a6a44');
  const lp = ((rd(72 - view * 0.6) % 130) + 130) % 130 - 18, fk = Math.floor(time * 6) & 1;                                                                                             /* a lamp-post, lit */
  rect(wg, lp, 21, 2, 20, '#3a3a44'); rect(wg, lp - 2, 18, 6, 4, '#3a3a44'); rect(wg, lp - 1, 19, 4, 2, TP.f3); if (fk) px(wg, lp + 1, 19, TP.f4); wg.globalAlpha = 0.18; rect(wg, lp - 8, 14, 18, 14, '#ffd36b'); wg.globalAlpha = 0.14; rect(wg, lp - 12, 38, 26, 4, '#ffd36b'); wg.globalAlpha = 1;
  { const t = (time % 36) / 36, cartX = rd(-30 + t * 200 * 1.0) - rd(view * 0.7);                                                                                                        /* a carter, with a lantern, crossing the road now and then */
    if (t < 0.8) { const x = cartX; rect(wg, x, 33, 18, 5, '#3a2618'); rect(wg, x, 33, 18, 1, '#5a3e28'); rect(wg, x + 1, 38, 4, 4, '#24170e'); rect(wg, x + 12, 38, 4, 4, '#24170e'); rect(wg, x + 20, 32, 7, 6, '#3a2a22'); rect(wg, x + 24, 30, 2, 3, '#3a2a22'); rect(wg, x + 17, 28, 2, 5, '#5a3e28'); rect(wg, x + 16, 27, 4, 2, TP.f3); px(wg, x + 17, 27, TP.f4); } }
  /* the glass: leaded diamonds, a pale streak, and the room's warm cast over it */
  wg.globalAlpha = 0.3; for (let k = -H; k < W + H; k += 8) for (let t = 0; t < H; t++) { const a = k + t, b = k + H - t; if (a >= 0 && a < W) px(wg, a, t, '#150e0c'); if (b >= 0 && b < W) px(wg, b, t, '#150e0c'); } wg.globalAlpha = 1;
  wg.globalAlpha = 0.12; for (let t = 0; t < 14; t++) rect(wg, 8 + t * 2, 2 + t, 3, 1, '#fff'); wg.globalAlpha = 0.1; rect(wg, 0, 0, W, H, '#ff9a4a'); wg.globalAlpha = 1;
  g.drawImage(WIN, sx + wx0, sy + wy);
}

/* ===================================================== THE ENTRY ===================================================== */
const SEATS = [   /* x (room px, the figure's centre); k: bust (behind a table) or sit (on a bench end, d: +1 faces right, -1 left); f: which of Waymeet's folk */
  { x: wx(19) - 12, k: 'bust', f: 0 }, { x: wx(19) + 12, k: 'bust', f: 3 }, { x: wx(25) - 12, k: 'bust', f: 2 }, { x: wx(25) + 12, k: 'bust', f: 4 },
  { x: wx(17) + 4, k: 'sit', d: 1, f: 1 }, { x: wx(22) - 10, k: 'sit', d: -1, f: 5 }, { x: wx(22) + 6, k: 'sit', d: 1, f: 4 }, { x: wx(28) - 8, k: 'sit', d: -1, f: 2 },
];
export function drawRoom(g, sx, sy, cx, VW, time) {
  ensure(); const F = frames();
  drawWindowView(g, sx, sy, cx, VW, time);
  /* THE BACK LAYER, only the slice on screen */
  const a = Math.max(0, -sx), w = Math.min(RW - a, VW - Math.max(0, sx) + 0);
  if (w > 0) g.drawImage(BACK, a, 0, w, FY, sx + a, sy, w, FY);
  /* the candle on the sill, the candle on the map, the lit lanterns */
  { const fk = Math.floor(time * 8) & 1; const wx0 = sx + lx(19) + 6, wy1 = sy + 14 + 48 + 4 - 8;
    rect(g, wx0 + 1, wy1 - 2, 2, 2, fk ? TP.f3 : TP.f2); px(g, wx0 + 2, wy1 - 3, TP.f4); g.globalAlpha = 0.14; rect(g, wx0 - 8, wy1 - 8, 20, 14, '#ffb860'); g.globalAlpha = 1; }
  { const fk = Math.floor(time * 7 + 3) & 1; const x = sx + lx(36) - 10 + 29, y = sy + FY - 33; rect(g, x + 1, y - 2, 2, 2, fk ? TP.f3 : TP.f2); px(g, x + 2, y - 3, TP.f4); g.globalAlpha = 0.14; rect(g, x - 10, y - 8, 22, 16, '#ffb860'); g.globalAlpha = 1; }
  drawFire(g, sx, sy, time);
  /* THE DRINKERS between the two layers: each on its own clock, a sip, a laugh, a settle */
  for (let i = 0; i < SEATS.length; i++) { const s = SEATS[i], ph = (time * 0.9 + i * 1.7) % 8, fr = ph > 5.0 && ph < 5.9 ? 1 : ph > 6.6 && ph < 7.6 ? 2 : 0, sway = s.k === 'bust' && i % 2 ? Math.round(Math.sin(time * 1.3 + i)) : 0;
    if (s.k === 'bust') { const im = F.bust[s.f][fr]; g.drawImage(im, sx + rd(s.x) - 7 + sway, sy + FY - 38); }
    else { const im = (s.d > 0 ? F.sit : F.sitL)[s.f][fr]; g.drawImage(im, sx + rd(s.x) - 10, sy + FY - 32); } }
  /* THE BARKEEP behind the counter: he polishes, now and then a nod */
  { const bx = sx + lx(29) + 8 + 14, k = Math.floor(time * 1.4) % 8, fr = k === 6 ? 2 : (Math.floor(time * 2.2) & 1); g.drawImage(F.keep[fr], bx, sy + FY - 24 - 21); }
  g.drawImage(FRONT, a, 0, w, FY, sx + a, sy, w, FY);
  /* THE LANTERNS hung from the beam (over the room) */
  for (const [t, s] of [[8, 1], [17, 2], [27, 3], [34, 4], [46, 5], [53, 6], [61, 7]]) drawLantern(g, sx + wx(t), sy + 9, time, s);
  /* THE FIRE'S WARM ON THE WALL: stacked strips make an ellipse (never a gradient), breathing with the flames */
  { const k = 0.03 + 0.008 * Math.sin(time * 9) + 0.006 * Math.sin(time * 13.1), fx = sx + lx(14) + 8, fy2 = sy + FY - 40; g.fillStyle = '#ff8a3c'; g.globalAlpha = k;
    for (const [rw, rh] of [[230, 78], [180, 62], [130, 46], [84, 30]]) for (let y = -rh; y < rh; y += 3) { const hw = Math.round(rw / 2 * Math.sqrt(1 - (y / rh) * (y / rh))); g.fillRect(fx - hw, fy2 + y, hw * 2, 3); } g.globalAlpha = 1; }
  /* THE YARD'S STARS twinkle */
  { const r = mulberry(77); for (let i = 0; i < 14; i++) { const x = YARD + 20 + ((r() * (RW - YARD - 40)) | 0), y = 14 + ((r() * 40) | 0); if (Math.sin(time * 2.2 + i * 1.9) > 0.3) { g.globalAlpha = 0.9; px(g, sx + x, sy + y, '#fff'); px(g, sx + x + 1, sy + y, '#aab8e0'); px(g, sx + x - 1, sy + y, '#aab8e0'); px(g, sx + x, sy + y - 1, '#aab8e0'); px(g, sx + x, sy + y + 1, '#aab8e0'); g.globalAlpha = 1; } } }
}
export const ROOM_PX = { W: RW, H: FY, X0, Y0, FY };
