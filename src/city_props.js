// city_props.js — THE LAMPLIT STREET: the things standing in a stone city a hundred feet under the sea.
// Every baker returns a canvas drawn with its BOTTOM-CENTRE on the ground (x - w/2, groundY - h) unless its
// comment says otherwise. Baked once, no anti-aliasing.
//
// THE STREETLAMP is the important one and everything else is dressing for it. It is an iron standard with a
// hooded lantern on a scrolled bracket, and it is three things at once: a light, a lungful of air (the hood
// holds a bubble — that pale dome under it is the air you breathe), and a thing that can be put out. So it
// bakes in three states and they must be told apart at a glance from across the room:
//   LIT      gold flame, hot glass, a white-green dome of trapped air under the hood, light spilling on the post
//   GUTTERING the same lamp with the flame small and blue-white, the dome shrunk and breaking into bubbles —
//             the one-second warning that it is about to die (rule C3)
//   OUT      black glass, no dome, and the weed that only grows in the dark already on the post
import { canvas, px, rect, line, ellipse, circle, fillPoly, outline, mulberry } from './px.js';
import { OUT } from './art.js';

// THE DROWNED CITY PALETTE. Cold stone and iron, one warm gold, and the pale green of held air.
const C = {
  st: '#7e9490', stM: '#58706f', stD: '#3a4a4e', stDD: '#243036',
  ir: '#454e55', irM: '#2b3136', irD: '#16191c', irL: '#6a757d', rust: '#7a4526',
  br: '#c8a24a', brL: '#f2d88e', brD: '#7f6320',
  glass: '#9fd6d2', glassD: '#5a8c8e',
  flame: '#ffe9a8', flameM: '#f0c05a', flameD: '#c07a22', cold: '#bfe6f5',
  air: '#dff6ee', airM: '#a8d8c8',
  wood: '#5a4a3c', woodL: '#7d6850', woodD: '#342a22',
  weed: '#2f5a46', weedD: '#1e3d30', weedL: '#3f7a54',
  crust: '#d6ddd2', crustM: '#a8b2a8',
  cloth: '#5e6a62', clothL: '#82908a', clothD: '#3a443e',
  paper: '#cfc6a8', paperD: '#9a9078',
  seal: '#9a2a2a', sealD: '#61181c',
  fish: '#b7c2c0', fishD: '#7b8a8c',
};

// a scattering of weed and crust on anything that has stood in the water for a century
function fur(g, rnd, x0, x1, y0, y1, n) {
  for (let i = 0; i < n; i++) {
    const x = x0 + ((rnd() * (x1 - x0)) | 0), y = y0 + ((rnd() * (y1 - y0)) | 0);
    px(g, x, y, rnd() < 0.5 ? C.weed : C.weedD);
    if (rnd() < 0.4) px(g, x, y - 1, C.weedL);
    if (rnd() < 0.2) px(g, x + 1, y, C.crustM);
  }
}

// ---------- THE STREETLAMP ----------
// 18 x 54. The post stands on the paving, the lantern head is about three tiles up, and the air under the
// hood sits at the head. state: 0 out, 1 lit, 2 guttering.
export function bakeStreetlamp(state) {
  const W = 18, H = 54, rnd = mulberry(7100 + state); const [c, g] = canvas(W, H);
  const cx = 8;
  // the stone plinth it is stepped into (rule B9: nothing stands on nothing)
  rect(g, cx - 4, H - 4, 9, 4, C.stM); rect(g, cx - 4, H - 4, 9, 1, C.st); rect(g, cx - 5, H - 2, 11, 2, C.stD);
  px(g, cx - 4, H - 1, C.stDD); px(g, cx + 4, H - 1, C.stDD);
  // the fluted post
  for (let y = 14; y < H - 4; y++) {
    px(g, cx - 2, y, C.irD); px(g, cx - 1, y, C.irL); px(g, cx, y, C.ir); px(g, cx + 1, y, C.irM); px(g, cx + 2, y, C.irD);
    if ((y & 7) === 0) { px(g, cx - 1, y, C.ir); px(g, cx + 1, y, C.irD); } // the collars up the standard
  }
  rect(g, cx - 3, 28, 7, 2, C.irM); px(g, cx - 1, 28, C.irL); // the mid collar
  // the scrolled bracket out of the post's head, and the crossbar the lantern hangs from
  line(g, cx + 2, 16, cx + 5, 13, C.ir); px(g, cx + 5, 12, C.irL); px(g, cx + 4, 14, C.irM);
  line(g, cx - 2, 16, cx - 5, 13, C.ir); px(g, cx - 5, 12, C.irL); px(g, cx - 4, 14, C.irM);
  // THE HOOD: a conical iron cap. It is the hood that holds the air, so it is drawn heavy and solid.
  fillPoly(g, [[cx, 0], [cx + 7, 7], [cx - 7, 7]], C.irM);
  for (let x = cx - 6; x <= cx + 6; x++) px(g, x, 7, C.irD);
  for (let x = cx - 3; x <= cx + 1; x++) px(g, x, 4, C.ir);
  px(g, cx - 1, 2, C.irL); px(g, cx, 1, C.irL);
  px(g, cx - 7, 7, C.irD); px(g, cx + 7, 7, C.irD);
  // the lantern: four iron uprights with glass between them
  const gy0 = 8, gy1 = 17;
  for (let y = gy0; y <= gy1; y++) { px(g, cx - 5, y, C.ir); px(g, cx + 5, y, C.irD); px(g, cx - 1, y, C.irM); }
  for (let x = cx - 4; x <= cx + 4; x++) px(g, x, gy1 + 1, C.irM);
  // the glass, and what is behind it
  const lit = state === 1, gut = state === 2;
  for (let y = gy0; y <= gy1; y++) for (let x = cx - 4; x <= cx + 4; x++) {
    if (x === cx - 1) continue;
    const edge = x === cx - 4 || x === cx + 4;
    px(g, x, y, lit ? (edge ? C.glassD : C.glass) : gut ? (edge ? '#44666a' : '#6f9a9c') : (edge ? '#16222a' : '#1e2e34'));
  }
  if (lit || gut) { // THE FLAME, in the bowl of it
    const fy = gy1 - 1;
    const hot = lit ? C.flame : C.cold, mid = lit ? C.flameM : '#8fc8e0';
    px(g, cx, fy, mid); px(g, cx + 1, fy, mid);
    px(g, cx, fy - 1, hot); px(g, cx + 1, fy - 1, lit ? C.flameM : mid);
    if (lit) { px(g, cx, fy - 2, C.flame); px(g, cx + 1, fy - 2, C.flameM); px(g, cx, fy - 3, C.flameM); px(g, cx - 1, fy - 1, C.flameD); }
    // the light on its own ironwork
    if (lit) { px(g, cx - 5, gy1, C.flameD); px(g, cx + 5, gy1, C.flameD); px(g, cx - 4, 7, C.flameD); px(g, cx + 3, 7, C.flameD); for (let y = 18; y < 26; y++) if ((y & 1) === 0) px(g, cx - 1, y, C.flameD); }
  }
  if (lit) { // THE AIR UNDER THE HOOD: the bubble you breathe, held up against the iron
    for (let x = cx - 6; x <= cx + 6; x++) { const d = Math.abs(x - cx); const h = 3 - ((d * d) / 14) | 0; for (let j = 0; j <= h; j++) px(g, x, 8 + j, j === 0 ? C.air : C.airM); }
    px(g, cx - 7, 9, C.airM); px(g, cx + 7, 9, C.airM);
    px(g, cx - 8, 11, C.air); px(g, cx + 8, 12, C.air); // and two bubbles escaping the rim
  } else if (gut) { // the air going with the flame: the dome broken into beads
    for (const [x, y] of [[cx - 4, 9], [cx - 1, 8], [cx + 3, 9], [cx + 6, 11], [cx - 6, 12]]) px(g, x, y, C.airM);
  } else { // OUT: the weed that only grows in the dark is already up the post
    for (let i = 0; i < 7; i++) { const y = 20 + ((rnd() * 28) | 0); px(g, cx + (rnd() < 0.5 ? -3 : 3), y, C.weed); px(g, cx + (rnd() < 0.5 ? -3 : 3), y - 1, C.weedD); }
  }
  fur(g, rnd, cx - 3, cx + 3, 30, H - 5, 6);
  outline(c, OUT);
  return c;
}

// A lamp that has been knocked off its standard and lies on the paving, dark. Ground deco: it says the level's
// rule a second way, because a dead lamp on the floor is a route that used to be there.
export function bakeLampWreck(v) {
  const W = 20, H = 12, rnd = mulberry(7200 + v); const [c, g] = canvas(W, H);
  fillPoly(g, [[3, H - 1], [6, 3], [13, 3], [16, H - 1]], C.irM);
  for (let x = 5; x < 15; x++) px(g, x, H - 2, C.irD);
  for (let y = 4; y < H - 2; y++) for (let x = 7; x < 13; x++) px(g, x, y, ((x + y) & 1) ? '#1e2e34' : '#16222a');
  px(g, 9, 2, C.irL); px(g, 10, 2, C.ir); // the broken hook
  for (let i = 0; i < 4; i++) { const x = 1 + ((rnd() * 18) | 0); px(g, x, H - 1, C.glassD); } // glass on the stones
  fur(g, rnd, 3, 16, 5, H - 1, 5);
  outline(c, OUT); return c;
}

// THE FISH MARKET stall: a stone trestle with a slate awning over it, the baskets still under it and a string
// of fish still hanging, a hundred years after market day.
export function bakeStall(v) {
  const W = 40, H = 34, rnd = mulberry(7300 + v); const [c, g] = canvas(W, H);
  // the two stone piers and the slab across them
  for (const px0 of [4, 30]) { rect(g, px0, 18, 6, H - 19, C.stM); rect(g, px0, 18, 6, 1, C.st); rect(g, px0, H - 2, 6, 2, C.stD); px(g, px0, 19, C.stDD); }
  rect(g, 2, 15, 36, 3, C.stM); rect(g, 2, 15, 36, 1, C.st); rect(g, 2, 18, 36, 1, C.stDD);
  // the awning: slates on a timber frame, sagging
  for (let i = 0; i < 34; i++) { const y = 6 + Math.round(Math.sin(i / 34 * Math.PI) * -1.6); rect(g, 3 + i, y, 1, 3, ((i >> 2) & 1) ? '#3c4a50' : '#46565c'); px(g, 3 + i, y, '#5c6e74'); }
  line(g, 3, 9, 5, 15, C.woodD); line(g, 36, 9, 34, 15, C.woodD);
  // the baskets under the slab, and the fish on the string
  for (const bx of [11, 20, 27]) { ellipse(g, bx, 13, 3.4, 2.4, C.wood); ellipse(g, bx, 12, 3, 1.6, C.woodL); for (let x = bx - 3; x <= bx + 3; x++) if ((x & 1) === 0) px(g, x, 13, C.woodD); }
  for (let i = 0; i < 3; i++) { const fx = 8 + i * 11, fy = 20 + ((rnd() * 3) | 0);
    px(g, fx, fy - 1, C.irM); fillPoly(g, [[fx - 3, fy + 2], [fx, fy], [fx + 3, fy + 2], [fx, fy + 4]], C.fish); px(g, fx - 3, fy + 2, C.fishD); px(g, fx + 4, fy + 1, C.fishD); px(g, fx + 4, fy + 3, C.fishD); px(g, fx - 1, fy + 1, '#2a3438'); }
  fur(g, rnd, 2, 38, 14, H - 1, 14);
  outline(c, OUT); return c;
}

// A fluted column with its capital: the colonnade along the market, as a standing prop rather than a wall.
export function bakeColumn(v) {
  const W = 16, H = 64, rnd = mulberry(7400 + v); const [c, g] = canvas(W, H);
  rect(g, 1, H - 5, 14, 5, C.stM); rect(g, 1, H - 5, 14, 1, C.st); rect(g, 0, H - 2, 16, 2, C.stD);
  for (let y = 8; y < H - 5; y++) for (let x = 3; x < 13; x++) px(g, x, y, x === 3 ? C.stDD : x === 4 ? C.st : ((x & 1) ? C.stM : C.stD));
  rect(g, 2, 5, 12, 3, C.stM); rect(g, 1, 2, 14, 3, C.st); rect(g, 1, 5, 14, 1, C.stDD); // the capital
  rect(g, 0, 0, 16, 2, C.stM);
  if (v % 2) { for (let y = 20 + ((rnd() * 10) | 0); y < H - 8; y += 5) { px(g, 3, y, C.stDD); px(g, 4, y + 1, C.stD); } } // a crack down it
  fur(g, rnd, 3, 13, 12, H - 6, 18);
  outline(c, OUT); return c;
}

// THE COUNTING HOUSE desk: a stone counter with a ledger chained to it, an inkwell and a scale. This is where
// the tribute was written down, so it is the one prop in the level with paper on it.
export function bakeClerkDesk() {
  const W = 34, H = 24, rnd = mulberry(7500); const [c, g] = canvas(W, H);
  rect(g, 2, 8, 30, 3, C.stM); rect(g, 2, 8, 30, 1, C.st); rect(g, 2, 11, 30, 1, C.stDD);
  rect(g, 4, 12, 5, H - 13, C.stM); rect(g, 25, 12, 5, H - 13, C.stM); rect(g, 4, H - 2, 26, 2, C.stD);
  // the ledger, open, its pages gone to pulp
  fillPoly(g, [[8, 7], [16, 5], [24, 7], [16, 8]], C.paper);
  for (let x = 9; x < 23; x++) px(g, x, 6, ((x & 1) ? C.paperD : C.paper));
  px(g, 16, 5, C.paperD); rect(g, 8, 7, 16, 1, '#6e6a58');
  // its chain, down to a ring in the stone
  for (let i = 0; i < 8; i++) px(g, 24 + (i & 1), 8 + i, (i & 1) ? C.irM : C.ir);
  circle(g, 25.5, 16.5, 1.6, C.irD);
  // the scale: a beam on a post with two pans
  line(g, 29, 7, 29, 3, C.ir); line(g, 26, 3, 32, 3, C.irL);
  for (const sx of [26, 32]) { line(g, sx, 3, sx, 5, C.irM); for (let x = sx - 2; x <= sx + 2; x++) px(g, x, 6, C.br); px(g, sx, 7, C.brD); }
  px(g, 27, 5, C.br); px(g, 31, 5, C.br);
  fur(g, rnd, 3, 31, 9, H - 1, 10);
  outline(c, OUT); return c;
}

// A pile of the seals the tribute came under — thirty years of them, wax and lead, in a drift against a wall.
export function bakeSealDrift(v) {
  const W = 26, H = 14, rnd = mulberry(7600 + v); const [c, g] = canvas(W, H);
  for (let i = 0; i < 22; i++) {
    const x = 3 + ((rnd() * 20) | 0), y = H - 2 - ((rnd() * 9) | 0), r = rnd() < 0.3 ? 2 : 1.6;
    circle(g, x, y, r, rnd() < 0.45 ? C.seal : rnd() < 0.6 ? C.br : '#8d97a0');
    px(g, x - 1, y - 1, rnd() < 0.5 ? C.brL : '#b9c2ca');
    if (rnd() < 0.4) px(g, x, y + 1, C.sealD);
  }
  for (let x = 2; x < W - 2; x++) if (rnd() < 0.5) px(g, x, H - 1, C.sealD);
  fur(g, rnd, 3, 23, 5, H - 1, 5);
  outline(c, OUT); return c;
}

// THE LAMP WORKS: the bellows house's machine. A great leather bellows under a timber beam, with the iron
// main that feeds the street's lamps running out of its head. Work it and the pipe breathes.
export function bakeBellows() {
  const W = 46, H = 40, rnd = mulberry(7700); const [c, g] = canvas(W, H);
  // the frame
  rect(g, 2, 10, 4, H - 11, C.woodD); rect(g, 2, 10, 2, H - 11, C.wood);
  rect(g, 38, 10, 4, H - 11, C.woodD); rect(g, 38, 10, 2, H - 11, C.wood);
  rect(g, 1, 7, 42, 4, C.wood); rect(g, 1, 7, 42, 1, C.woodL); rect(g, 1, 11, 42, 1, C.woodD);
  // the bellows: two boards with the leather folded between them
  fillPoly(g, [[8, 18], [36, 22], [36, 26], [8, 24]], '#6d4f33');
  for (let i = 0; i < 7; i++) { const x = 9 + i * 4; line(g, x, 18 + i, x, 25, '#4a3422'); px(g, x + 1, 20 + i, '#81603f'); }
  rect(g, 7, 15, 30, 4, C.wood); rect(g, 7, 15, 30, 1, C.woodL); // the top board
  rect(g, 7, 24, 30, 4, C.woodD); rect(g, 7, 27, 30, 1, '#241c16'); // the bottom board
  // the nozzle and the iron main out of it, up the wall
  rect(g, 36, 19, 7, 3, C.irM); px(g, 42, 19, C.irL); rect(g, 40, 2, 4, 18, C.irM); rect(g, 40, 2, 1, 18, C.irL);
  for (let y = 4; y < 20; y += 5) { rect(g, 39, y, 6, 2, C.ir); px(g, 39, y, C.irL); }
  // the handle: a long timber lever off the top board, where you put your hands
  line(g, 20, 15, 10, 4, C.woodL); line(g, 21, 15, 11, 4, C.wood); circle(g, 10, 4, 2, C.irM); px(g, 9, 3, C.irL);
  // the counterweight on a chain
  for (let y = 12; y < 22; y++) px(g, 4, y, (y & 1) ? C.ir : C.irM);
  rect(g, 2, 22, 5, 5, '#585f66'); rect(g, 2, 22, 5, 1, '#7d858c'); px(g, 3, 24, C.irD);
  fur(g, rnd, 3, 42, 12, H - 1, 16);
  outline(c, OUT); return c;
}

// THE TOLL POST: a stone post with an iron board chained to it and the city's scale cut into the stone. It
// stands at the gate, and it is the sign that someone has been collecting for a hundred years.
export function bakeTollPost() {
  const W = 22, H = 48, rnd = mulberry(7800); const [c, g] = canvas(W, H);
  rect(g, 5, 8, 12, H - 9, C.stM); rect(g, 6, 8, 3, H - 9, C.st); rect(g, 15, 8, 2, H - 9, C.stD);
  rect(g, 3, 4, 16, 4, C.stM); rect(g, 3, 4, 16, 1, C.st); rect(g, 3, 8, 16, 1, C.stDD);
  rect(g, 2, H - 4, 18, 4, C.stM); rect(g, 2, H - 4, 18, 1, C.st); rect(g, 1, H - 2, 20, 2, C.stD);
  // the board: iron, with the dues beaten into it in lines
  rect(g, 1, 14, 20, 14, C.irM); rect(g, 1, 14, 20, 1, C.irL); rect(g, 1, 27, 20, 1, C.irD);
  for (let y = 16; y < 27; y += 3) for (let x = 3; x < 18; x++) if (((x + y) & 3) !== 0) px(g, x, y, (y % 6) ? '#3b4349' : '#515a61');
  for (let i = 0; i < 10; i++) { const x = 2 + ((rnd() * 18) | 0), y = 15 + ((rnd() * 12) | 0); px(g, x, y, C.rust); }
  for (const bx of [2, 19]) { px(g, bx, 15, C.irL); px(g, bx, 26, C.irL); }
  // the scale cut into the post under it: a balance, both pans empty
  line(g, 8, 32, 14, 32, C.stDD); px(g, 11, 31, C.stDD); px(g, 11, 33, C.stDD);
  px(g, 8, 33, C.stDD); px(g, 14, 33, C.stDD);
  fur(g, rnd, 4, 18, 30, H - 5, 12);
  outline(c, OUT); return c;
}

// The magistrate, in stone, before he drowned: a robed figure with a rod, his face gone to the water. The
// landmark of the last square, and the best warning the level gives about who is at the end of it.
export function bakeMagistrate() {
  const W = 26, H = 58, rnd = mulberry(7900); const [c, g] = canvas(W, H);
  rect(g, 2, H - 7, 22, 7, C.stM); rect(g, 2, H - 7, 22, 1, C.st); rect(g, 1, H - 3, 24, 3, C.stD);
  rect(g, 4, H - 10, 18, 3, C.stM); rect(g, 4, H - 10, 18, 1, C.st);
  // the robe: a bell of stone with deep folds
  fillPoly(g, [[10, 16], [16, 16], [21, H - 11], [5, H - 11]], C.stM);
  for (const fx of [8, 11, 14, 17]) for (let y = 20; y < H - 11; y++) px(g, fx + Math.round((y - 20) * 0.08 * (fx < 13 ? -1 : 1)), y, (fx & 1) ? C.stD : C.stDD);
  for (let y = 17; y < H - 11; y++) px(g, 6 + Math.round((y - 17) * 0.12), y, C.st);
  // shoulders, and the head with nothing left of the face
  fillPoly(g, [[9, 13], [17, 13], [18, 17], [8, 17]], C.stM); px(g, 9, 14, C.st); px(g, 17, 16, C.stD);
  circle(g, 13, 9, 4, C.stM); circle(g, 12, 8, 2.6, C.st);
  for (let i = 0; i < 9; i++) { const x = 10 + ((rnd() * 6) | 0), y = 6 + ((rnd() * 7) | 0); px(g, x, y, rnd() < 0.5 ? C.stDD : C.weedD); }
  // the rod of office, held out: the shape the Tollmaster still uses
  line(g, 18, 18, 22, 34, C.stD); line(g, 19, 18, 23, 34, C.stM); circle(g, 18, 17, 2, C.stM); px(g, 17, 16, C.st);
  fur(g, rnd, 4, 22, 14, H - 9, 26);
  outline(c, OUT); return c;
}

// A drowned handcart, on its side where the tide left it. The street furniture that says people lived here.
export function bakeDrownedCart() {
  const W = 32, H = 20, rnd = mulberry(8000); const [c, g] = canvas(W, H);
  fillPoly(g, [[4, 10], [28, 8], [29, 17], [3, 18]], C.wood);
  for (let x = 5; x < 28; x++) if (((x >> 1) & 1) === 0) for (let y = 10; y < 17; y++) px(g, x, y + Math.round((28 - x) * -0.04), C.woodD);
  rect(g, 3, 17, 26, 2, C.woodD);
  circle(g, 9, 16, 4.2, C.woodD); circle(g, 9, 16, 2.8, C.wood); circle(g, 9, 16, 1.2, C.irM);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; line(g, 9, 16, 9 + Math.cos(a) * 3.4, 16 + Math.sin(a) * 3.4, C.woodL); }
  line(g, 28, 9, 31, 5, C.woodL); line(g, 28, 10, 31, 6, C.woodD); // the shaft, up in the water
  fur(g, rnd, 3, 29, 9, H - 1, 16);
  outline(c, OUT); return c;
}

// THE PORTCULLIS that is already up: the iron grid of the counting house's strongroom, hauled into its slot.
// (The one you have to open with a key is the engine's PORT tile; this is its twin, for dressing.)
export function bakeGrating() {
  const W = 34, H = 18, rnd = mulberry(8100); const [c, g] = canvas(W, H);
  for (let x = 2; x < W - 2; x += 4) for (let y = 0; y < H - 2; y++) { px(g, x, y, C.ir); px(g, x + 1, y, C.irL); }
  for (let y = 2; y < H - 2; y += 6) for (let x = 1; x < W - 1; x++) { px(g, x, y, C.irM); px(g, x, y + 1, C.irD); }
  for (let x = 1; x < W - 1; x++) { px(g, x, H - 2, C.irM); px(g, x, H - 1, C.irD); }
  for (let i = 0; i < 14; i++) { const x = 2 + ((rnd() * 30) | 0), y = (rnd() * (H - 2)) | 0; px(g, x, y, C.rust); }
  fur(g, rnd, 2, 32, 1, H - 1, 10);
  outline(c, OUT); return c;
}

// Weed standing off the paving, two heights: the ground cover of the whole level.
export function bakeCityWeed(v) {
  const W = 14, H = 8 + v * 6, rnd = mulberry(8200 + v); const [c, g] = canvas(W, H);
  for (let k = 0; k < 4 + v * 2; k++) {
    const x0 = 2 + ((rnd() * 10) | 0), ht = 4 + ((rnd() * (H - 5)) | 0), lean = (rnd() - 0.5) * 0.5;
    for (let j = 0; j < ht; j++) { const x = x0 + Math.round(j * lean), y = H - 1 - j; px(g, x, y, j > ht - 3 ? C.weedL : (j & 1) ? C.weed : C.weedD); }
  }
  return c;
}

// A drift of shell and crust on the street: the level's pale note, and it marks where the tide runs fastest.
export function bakeShellDrift(v) {
  const W = 18, H = 7, rnd = mulberry(8300 + v); const [c, g] = canvas(W, H);
  for (let i = 0; i < 16; i++) { const x = 1 + ((rnd() * 16) | 0), y = H - 1 - ((rnd() * 4) | 0); px(g, x, y, rnd() < 0.5 ? C.crust : C.crustM); if (rnd() < 0.4) px(g, x + 1, y, '#76807a'); }
  return c;
}

// The brazier at the edge of the Tollmaster's square: the fire you relight the lamps from. Iron, on three
// legs, with coal in it that the sea never managed to put out.
export function bakeCityBrazier(lit) {
  const W = 24, H = 28, rnd = mulberry(8400 + (lit ? 1 : 0)); const [c, g] = canvas(W, H);
  for (const [x0, x1] of [[4, 8], [12, 12], [19, 16]]) { line(g, x0, 16, x1, H - 1, C.ir); line(g, x0 + 1, 16, x1 + 1, H - 1, C.irM); }
  rect(g, 2, 12, 20, 2, C.irL); rect(g, 2, 14, 20, 3, C.irM);
  fillPoly(g, [[3, 14], [21, 14], [18, 20], [6, 20]], C.ir);
  for (let x = 4; x < 20; x++) for (let y = 10; y < 13; y++) px(g, x, y, ((x + y) & 1) ? '#3a1d12' : '#2a1510'); // the coal
  if (lit) {
    for (let i = 0; i < 18; i++) { const x = 5 + ((rnd() * 14) | 0), y = 6 + ((rnd() * 6) | 0); px(g, x, y, rnd() < 0.4 ? C.flame : rnd() < 0.7 ? C.flameM : C.flameD); }
    px(g, 11, 3, C.flame); px(g, 12, 2, C.flameM); px(g, 10, 4, C.flameM);
    for (let x = 3; x < 21; x++) px(g, x, 13, C.flameD);
  } else { for (let i = 0; i < 8; i++) { const x = 5 + ((rnd() * 14) | 0); px(g, x, 10, '#4a4a46'); } }
  fur(g, rnd, 4, 20, 16, H - 2, 8);
  outline(c, OUT); return c;
}

// The iron main the lamps are fed from, run along a wall: a background piece, so it is drawn flat and dark.
// It is what makes the LAMP WORKS read as a machine with the street on the end of it.
export function bakeLampMain(v) {
  const W = 48, H = 14, rnd = mulberry(8500 + v); const [c, g] = canvas(W, H);
  rect(g, 0, 5, W, 4, C.irM); rect(g, 0, 5, W, 1, C.irL); rect(g, 0, 9, W, 1, C.irD);
  for (let x = 6; x < W; x += 14) { rect(g, x, 3, 4, 8, C.ir); px(g, x, 3, C.irL); px(g, x + 3, 10, C.irD); } // the flanges
  for (const x of [12, 34]) { rect(g, x, 0, 3, 5, C.irM); px(g, x, 0, C.irL); } // the risers up to a lamp
  for (let i = 0; i < 10; i++) { const x = (rnd() * W) | 0; px(g, x, 6 + ((rnd() * 3) | 0), C.rust); }
  fur(g, rnd, 1, W - 1, 4, 11, 10);
  return c;
}
