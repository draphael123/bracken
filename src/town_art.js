// ============================================================================================
// THE TOWN KIT.
// Waymeet was built out of the village's cobbles and the flotilla's furniture, in front of a wood.
// A town where three roads meet is none of those things: it is TIMBER AND PLASTER - black oak
// frames with the panels limewashed between them, upper floors jettied out over the street, clay
// tiles on every roof, leaded windows going gold as the day goes, and an inn with a real fire in it.
// Everything here is drawn for the hour the level is set in: DUSK, warm light low from the west,
// every window that is lit is lit because somebody is home.
// ============================================================================================
import { canvas, rect, px, fillPoly, line, mulberry, outline } from './px.js';
import { OUT } from './art.js';

const TS = 16;
const OAK = '#3a2618', OAK_L = '#5a3e28', OAK_D = '#24170e';
const LIME = '#b8a488', LIME_L = '#cbb99a', LIME_D = '#968268';
const GLASS = '#ffb45a', GLASS_L = '#ffe0a0', LEAD = '#9a5a2a';
const CLAY = '#8e4434', CLAY_L = '#b0604a', CLAY_D = '#5a2a22';

// ---------------------------------------------------------------------------- FRONTS
// A LEADED WINDOW: the frame, the diamond lead, and the light behind it. Dark ones are shuttered.
function leaded(g, x, y, w, h, lit, rnd) {
  rect(g, x - 1, y - 1, w + 2, h + 2, OAK_D);
  if (!lit) { rect(g, x, y, w, h, '#2a2230');
    rect(g, x, y, (w >> 1) - 0, h, '#4a3424'); rect(g, x + (w >> 1), y, w - (w >> 1), h, '#533a28');   /* the shutters, closed */
    for (let yy = y + 2; yy < y + h; yy += 3) rect(g, x, yy, w, 1, '#3a2818');
    return; }
  rect(g, x, y, w, h, GLASS);
  for (let k = -h; k < w + h; k += 3) for (let t = 0; t < h; t++) {           /* the lead: diamonds, both ways */
    const a = x + k + t, b = x + k + h - t;
    if (a >= x && a < x + w) px(g, a, y + t, LEAD);
    if (b >= x && b < x + w) px(g, b, y + t, LEAD);
  }
  rect(g, x + 1, y + 1, 2, 2, GLASS_L);                                         /* the lamp inside, where it catches */
  if (rnd() < 0.5) rect(g, x + w - 3, y + h - 3, 2, 2, GLASS_L);
  rect(g, x + (w >> 1), y, 1, h, OAK_D);                                        /* the mullion */
}
// A WINDOW BOX, because somebody in every town keeps geraniums
function windowBox(g, x, y, w, rnd) {
  rect(g, x - 1, y, w + 2, 3, '#5a3a24'); rect(g, x - 1, y, w + 2, 1, '#7a5634');
  for (let i = 0; i < w; i += 2) { px(g, x + i, y - 1, rnd() < 0.5 ? '#3f6e2c' : '#53894a');
    if (rnd() < 0.45) px(g, x + i + (rnd() < 0.5 ? 0 : 1), y - 2, rnd() < 0.6 ? '#d0443a' : '#e8c040'); }
}
// THE TIMBER FRONT. h = { x0, x1, y0, y1, door, door2, seed } in tiles, the same shape the village's
// houses use, so the renderer does not care which kind of house it is standing in front of.
export function bakeTownFront(h) {
  const w = (h.x1 - h.x0 + 1) * TS, ht = (h.y1 - h.y0 + 1) * TS, rnd = mulberry(h.seed * 13 + 5);
  const [c, g] = canvas(w, ht);
  const plinth = 7, jetty = Math.max(14, Math.round(ht * 0.42));                /* where the upper floor oversails the lower */
  const bay = 40 + ((rnd() * 3) | 0) * 4;
  // the limewash, and the weather on it: dirtier at the foot, streaked under every sill
  rect(g, 0, 0, w, ht, LIME);
  for (let i = 0; i < w * ht / 40; i++) px(g, (rnd() * w) | 0, (rnd() * ht) | 0, rnd() < 0.5 ? LIME_L : LIME_D);
  for (let y = ht - plinth - 8; y < ht - plinth; y++) for (let x = 0; x < w; x++) if (rnd() < (y - (ht - plinth - 8)) / 12) px(g, x, y, '#8a7660');
  // THE JETTY: the upper floor sits forward of the lower one, and the shadow under its bressumer is the
  // single line that makes a flat wall read as a timber-framed house
  rect(g, 0, jetty, w, 3, OAK); rect(g, 0, jetty, w, 1, OAK_L); rect(g, 0, jetty + 3, w, 4, 'rgba(20,12,8,0.45)');
  for (let x = 4; x < w; x += 16) { rect(g, x, jetty + 3, 2, 3, OAK_D); }       /* the joist ends showing under it */
  rect(g, 0, 0, w, 3, OAK); rect(g, 0, 3, w, 2, 'rgba(20,12,8,0.4)');            /* the wall plate under the eave */
  // posts, studs and braces, bay by bay
  for (let bx = 0; bx <= w; bx += bay) {
    rect(g, bx - 2, 0, 4, ht - plinth, OAK); rect(g, bx - 2, 0, 1, ht - plinth, OAK_L);
    const mid = bx + (bay >> 1);
    rect(g, mid - 1, 5, 2, jetty - 5, OAK); rect(g, mid - 1, jetty + 7, 2, ht - plinth - jetty - 7, OAK);
    if (rnd() < 0.7 && bx + bay <= w) {                                          /* a brace across the upper panel */
      const left = rnd() < 0.5;
      for (let t = 0; t < jetty - 6; t++) { const xx = left ? bx + 2 + Math.round(t * (bay / 2 - 3) / (jetty - 6)) : mid - 1 - Math.round(t * (bay / 2 - 3) / (jetty - 6)); rect(g, xx, 5 + t, 2, 1, OAK); }
    }
  }
  rect(g, 0, Math.round(jetty + (ht - plinth - jetty) * 0.55), w, 2, OAK);         /* the mid rail of the ground floor */
  // the stone plinth it all sits on
  rect(g, 0, ht - plinth, w, plinth, '#5e5866');
  for (let x = -((rnd() * 8) | 0); x < w; x += 9) { rect(g, x, ht - plinth + 1, 8, 2, '#716a7a'); rect(g, x + 4, ht - plinth + 4, 8, 2, '#6a6474'); }
  rect(g, 0, ht - plinth, w, 1, '#3a3440');
  const doorAt = [h.door, h.door2].filter(d => d != null).map(d => (d - h.x0) * TS + 8);
  const nearDoor = x => doorAt.some(d => Math.abs(x - d) < 20);
  // windows: upper floor in every bay, lower floor where there is not a door
  for (let bx = 0; bx + bay <= w; bx += bay) {
    for (const [cxw, yw, ww, hw, floorUp] of [[bx + (bay >> 2), 8, 9, Math.min(10, jetty - 12), true], [bx + (3 * bay >> 2), 8, 9, Math.min(10, jetty - 12), true],
      [bx + (bay >> 2), jetty + 11, 10, Math.min(12, ht - plinth - jetty - 18), false], [bx + (3 * bay >> 2), jetty + 11, 10, Math.min(12, ht - plinth - jetty - 18), false]]) {
      if (hw < 5) continue;
      const x = cxw - (ww >> 1);
      if (!floorUp && nearDoor(cxw)) continue;
      leaded(g, x, yw, ww, hw, rnd() < (floorUp ? 0.62 : 0.78), rnd);
      rect(g, x - 2, yw + hw + 1, ww + 4, 1, '#6a5a4a');
      if (floorUp && rnd() < 0.55) windowBox(g, x, yw + hw + 2, ww, rnd);
    }
  }
  // a door where the house has none of its own, so no front is a blank wall
  if (!doorAt.length) { const dx = (w >> 1) - 7, dh = Math.min(24, ht - plinth - jetty - 6), dy = ht - plinth - dh;
    rect(g, dx - 2, dy - 2, 18, dh + 2, OAK_D); rect(g, dx, dy, 14, dh, '#6a4428');
    for (let k = 3; k < 14; k += 4) rect(g, dx + k, dy, 1, dh, '#4a2e1c');
    rect(g, dx, dy + 5, 14, 1, '#3a3a44'); rect(g, dx, dy + dh - 7, 14, 1, '#3a3a44'); px(g, dx + 11, dy + (dh >> 1), '#e0b040');
    rect(g, dx - 3, ht - plinth, 20, 2, '#7a7484'); }
  return c;
}

// ---------------------------------------------------------------------------- ROOFS
// CLAY TILES. Courses of rounded tiles laid up the pitch, every one a slightly different fire, a few
// of them gone green, a row of ridge tiles along the top and a black eave board under it all. Same
// size as the village roof: the slab you walk on, and a little over each end.
export function bakeTileRoof(h) {
  const x0 = h.x0 - 1, x1 = h.x1 + 1, w = (x1 - x0 + 1) * TS + 4, ht = 3 * TS + 3, rnd = mulberry(h.seed * 17 + 9);
  const [c, g] = canvas(w, ht);
  rect(g, 0, 0, w, ht - 3, CLAY_D);
  for (let row = 0, y = 4; y < ht - 5; y += 4, row++) {
    for (let x = (row % 2) * 3 - 3; x < w; x += 6) {
      const t = rnd(), col = t < 0.08 ? '#6e6a3a' : t < 0.3 ? '#7e3c2e' : t < 0.75 ? CLAY : '#a0503c';
      rect(g, x, y, 5, 4, col);
      px(g, x + 1, y, t < 0.08 ? '#8a8a4a' : CLAY_L);                      /* where the dusk catches its shoulder */
      rect(g, x, y + 3, 5, 1, CLAY_D); px(g, x, y + 2, CLAY_D); px(g, x + 4, y + 2, CLAY_D);   /* the rounded foot */
    }
  }
  rect(g, 0, 0, w, 4, '#4a221c');                                                   /* the ridge, capped */
  for (let x = 0; x < w; x += 5) { rect(g, x, 0, 4, 3, '#7a3a2e'); px(g, x + 1, 0, CLAY_L); }
  // a dormer in a long roof, lit
  if (w > 180) for (let dx = 60 + ((rnd() * 40) | 0); dx < w - 60; dx += 120 + ((rnd() * 60) | 0)) {
    rect(g, dx - 8, 10, 16, 20, LIME_D); rect(g, dx - 8, 10, 16, 2, OAK);
    fillPoly(g, [[dx - 11, 11], [dx + 11, 11], [dx, 1]], CLAY_D); fillPoly(g, [[dx - 9, 10], [dx + 9, 10], [dx, 3]], CLAY);
    leaded(g, dx - 4, 15, 8, 9, rnd() < 0.7, rnd);
  }
  rect(g, 0, ht - 5, w, 2, OAK); rect(g, 0, ht - 3, w, 3, '#1b1210');               /* the eave board, and its shadow */
  return c;
}

// ---------------------------------------------------------------------------- THE COMMON ROOM
// the wall of an inn: limewash gone the colour of pipe smoke, the frame showing through it, and a rail
// at the height a man leans his back on. One tile, 64x64, repeated.
export function bakeHallWall() {
  const rnd = mulberry(4242); const [c, g] = canvas(64, 64);
  rect(g, 0, 0, 64, 64, '#8a7258');
  for (let i = 0; i < 260; i++) px(g, (rnd() * 64) | 0, (rnd() * 64) | 0, rnd() < 0.5 ? '#7e6850' : '#957c60');
  rect(g, 0, 0, 4, 64, OAK); rect(g, 0, 0, 1, 64, OAK_L);
  rect(g, 30, 0, 3, 64, '#4a3020');
  for (let t = 0; t < 26; t++) rect(g, 4 + t, 2 + t, 2, 1, '#4a3020');              /* a brace */
  rect(g, 0, 40, 64, 2, OAK); rect(g, 0, 40, 64, 1, OAK_L);
  for (let x = 6; x < 64; x += 11) if (rnd() < 0.5) { rect(g, x, 34, 1, 6, '#5a4a3a'); rect(g, x - 1, 33, 3, 1, '#6a5a4a'); }   /* pegs, and what hangs off them */
  return c;
}

// ---------------------------------------------------------------------------- FURNITURE
// THE LONG TABLE: a trestle, and what the men left on it when they stood up
export function bakeLongTable(seed = 1) {
  const rnd = mulberry(seed + 900); const [c, g] = canvas(44, 18);
  rect(g, 1, 7, 42, 3, '#7a4e2c'); rect(g, 1, 7, 42, 1, '#a0703e'); rect(g, 1, 10, 42, 1, '#4a2e18');
  for (const lx of [5, 36]) { rect(g, lx, 11, 3, 7, '#5a3a22'); rect(g, lx - 2, 16, 7, 2, '#4a2e18'); }
  rect(g, 8, 13, 28, 1, '#4a2e18');                                                 /* the stretcher */
  const things = [];
  for (let x = 4; x < 40; x += 5 + ((rnd() * 4) | 0)) things.push(x);
  for (const x of things) { const t = rnd();
    if (t < 0.5) { rect(g, x, 2, 4, 5, '#8a919c'); rect(g, x, 2, 4, 1, '#f0e6c8'); rect(g, x + 4, 3, 1, 3, '#6a707a'); }   /* a tankard, still with a head on it */
    else if (t < 0.7) { rect(g, x, 5, 6, 2, '#c9a060'); rect(g, x + 1, 4, 4, 1, '#e0bc7a'); }                            /* a loaf */
    else if (t < 0.85) { rect(g, x, 6, 6, 1, '#d8d0c0'); px(g, x + 2, 5, '#c9463d'); px(g, x + 3, 5, '#8a5a32'); }         /* a trencher */
    else { rect(g, x + 1, 3, 1, 4, '#e8dcc0'); px(g, x + 1, 2, '#ffd36b'); px(g, x + 1, 1, '#fff6c8'); }                  /* a candle */
  }
  return outline(c, OUT);
}
export function bakeBench() {
  const [c, g] = canvas(30, 8);
  rect(g, 0, 1, 30, 2, '#7a4e2c'); rect(g, 0, 1, 30, 1, '#9a6a3a');
  for (const lx of [3, 25]) rect(g, lx, 3, 2, 5, '#5a3a22');
  return outline(c, OUT);
}
// THE HEARTH: a stone breast as wide as a cart, a fire in it that is never let out, a pot on the crane
// and the good plates on the mantel. Frames: the fire moves.
export function bakeHearth() {
  const frames = [];
  for (let f = 0; f < 3; f++) {
    const rnd = mulberry(77); const [c, g] = canvas(44, 46);
    rect(g, 2, 0, 40, 46, '#6a6474');
    for (let y = 0; y < 46; y += 5) for (let x = (y / 5) % 2 ? -3 : 0; x < 44; x += 8) { rect(g, x + 2, y, 7, 4, rnd() < 0.3 ? '#5e5868' : '#77707f'); rect(g, x + 2, y, 7, 1, '#8a8494'); }
    rect(g, 0, 18, 44, 3, OAK); rect(g, 0, 18, 44, 1, OAK_L);                         /* the mantel beam */
    for (const [x, col] of [[6, '#d8d0c0'], [14, '#3a5a8a'], [28, '#d8d0c0'], [36, '#c9a060']]) { rect(g, x, 12, 5, 6, col); rect(g, x + 1, 13, 3, 4, '#8a8290'); }   /* plates, stood up */
    rect(g, 8, 22, 28, 24, '#1a1210');                                                  /* the opening */
    for (let k = 0; k < 14; k++) rect(g, 8 + k, 22, 28 - k * 2, 1, k < 2 ? '#1a1210' : 'rgba(0,0,0,0)');
    rect(g, 8, 22, 28, 2, '#5e5868');
    // the fire
    const fr = mulberry(100 + f);
    rect(g, 11, 42, 22, 3, '#3a2618'); rect(g, 13, 41, 18, 1, '#5a3e28');                /* the logs */
    for (let i = 0; i < 40; i++) { const x = 12 + ((fr() * 20) | 0), hgt = 4 + ((fr() * 12) | 0) * (1 - Math.abs(x - 22) / 12); const y = 41 - hgt * fr();
      px(g, x, Math.round(y), y < 32 ? '#ff9a5c' : y < 37 ? '#ffd36b' : '#fff6c8'); }
    rect(g, 16, 38, 12, 3, '#ffd36b'); rect(g, 19, 39, 6, 2, '#fff6c8');
    line(g, 12, 26, 26, 26, '#2a2a30', 1); rect(g, 23, 27, 1, 3, '#2a2a30');           /* the crane */
    rect(g, 20, 30, 8, 6, '#2a2a30'); rect(g, 21, 30, 6, 1, '#4a4a54');                /* and the pot on it */
    frames.push(outline(c, OUT));
  }
  return frames;
}
// A RACK OF CASKS, ends out, and the tap in the bottom one
export function bakeCaskRack() {
  const [c, g] = canvas(34, 30);
  rect(g, 1, 26, 32, 4, '#4a2e18'); rect(g, 1, 26, 32, 1, '#6a4a2a');
  const cask = (cx, cy) => { for (let y = -6; y <= 6; y++) { const hw = Math.round(Math.sqrt(40 - y * y)); rect(g, cx - hw, cy + y, hw * 2, 1, '#7a4e2c'); }
    for (let y = -6; y <= 6; y++) { const hw = Math.round(Math.sqrt(40 - y * y)); px(g, cx - hw, cy + y, '#8a919c'); px(g, cx + hw - 1, cy + y, '#5a6270'); }
    for (let y = -5; y <= 5; y += 2) rect(g, cx - 3, cy + y, 6, 1, '#6a4226');
    rect(g, cx - 1, cy - 1, 2, 2, '#2a1a10'); };
  cask(9, 19); cask(25, 19); cask(17, 7);
  rect(g, 8, 21, 2, 4, '#c9a040'); px(g, 8, 25, '#e0b040');                         /* the tap */
  return outline(c, OUT);
}
// a shelf of tankards and a jug, for over the counter
export function bakeMugShelf() {
  const [c, g] = canvas(32, 12);
  rect(g, 0, 9, 32, 2, '#6a4226'); rect(g, 0, 9, 32, 1, '#8a5a32');
  for (const x of [2, 20, 29]) rect(g, x, 11, 1, 1, '#4a2e18');
  for (let i = 0; i < 5; i++) { const x = 2 + i * 5; rect(g, x, 4, 4, 5, i === 2 ? '#8a5a32' : '#8a919c'); rect(g, x + 4, 5, 1, 2, '#6a707a'); }
  rect(g, 26, 1, 5, 8, '#c9a86a'); rect(g, 27, 0, 3, 1, '#c9a86a'); rect(g, 26, 3, 5, 1, '#8a6a3a');
  return outline(c, OUT);
}
// A HAY BALE, for the carrier's yard
export function bakeHayBale(seed = 1) {
  const rnd = mulberry(seed + 50); const [c, g] = canvas(20, 13);
  rect(g, 0, 1, 20, 12, '#b89a48');
  for (let i = 0; i < 70; i++) px(g, (rnd() * 20) | 0, 1 + ((rnd() * 12) | 0), rnd() < 0.5 ? '#d0b460' : '#9a7e38');
  rect(g, 5, 1, 1, 12, '#6a5a2a'); rect(g, 14, 1, 1, 12, '#6a5a2a');
  for (let x = 0; x < 20; x += 2) px(g, x, 0, '#d0b460');
  return outline(c, OUT);
}
// BUNTING across the square: a sagging string and the flags on it, left up from a fair
export function bakeBunting(w = 96) {
  const [c, g] = canvas(w, 14);
  const cols = ['#9a3a3a', '#e0b040', '#3a5a8a', '#e8dcc0', '#3f6e2c'];
  let prev = 1;
  for (let x = 0; x < w; x++) { const y = 1 + Math.round(Math.sin(Math.PI * x / (w - 1)) * 5); px(g, x, y, '#5a4a3a'); prev = y; }
  for (let i = 0, x = 3; x < w - 5; x += 8, i++) {
    const y = 2 + Math.round(Math.sin(Math.PI * (x + 2) / (w - 1)) * 5);
    fillPoly(g, [[x, y], [x + 6, y], [x + 3, y + 7]], cols[i % cols.length]);
    px(g, x + 1, y, '#fff6e0');
  }
  return c;
}
// A HANGING SHOP SIGN on its iron bracket. v: 0 the smith's anvil, 1 the baker's loaf, 2 the apothecary's
// bottle, 3 the tankard. A town is how you find a thing without reading.
export function bakeShopSign(v = 0) {
  const [c, g] = canvas(22, 22);
  rect(g, 0, 1, 20, 2, '#3a3a44'); rect(g, 0, 1, 20, 1, '#6a6a78');                /* the bracket */
  for (let t = 0; t < 7; t++) px(g, 1 + t, 3 + t, '#3a3a44');
  rect(g, 5, 3, 1, 4, '#3a3a44'); rect(g, 17, 3, 1, 4, '#3a3a44');                  /* the chains */
  rect(g, 3, 7, 17, 13, '#6a4428'); rect(g, 3, 7, 17, 1, '#8a5a32'); rect(g, 3, 19, 17, 1, '#4a2e1c');
  rect(g, 4, 8, 15, 11, ['#2a3a2a', '#5a2a22', '#2a2a44', '#3a2a18'][v % 4]);
  if (v % 4 === 0) { rect(g, 7, 11, 10, 3, '#8a919c'); rect(g, 7, 11, 10, 1, '#c9d1dc'); rect(g, 10, 14, 4, 3, '#6a707a'); rect(g, 8, 17, 8, 1, '#6a707a'); rect(g, 5, 11, 2, 2, '#8a919c'); }
  else if (v % 4 === 1) { rect(g, 7, 12, 10, 5, '#c9a060'); rect(g, 8, 11, 8, 1, '#e0bc7a'); for (const x of [9, 12, 15]) rect(g, x, 12, 1, 3, '#8a6a3a'); }
  else if (v % 4 === 2) { rect(g, 10, 9, 4, 2, '#c9d1dc'); rect(g, 8, 11, 8, 7, '#5aa878'); rect(g, 9, 12, 2, 3, '#a8f0c0'); }
  else { rect(g, 8, 10, 7, 8, '#8a919c'); rect(g, 8, 10, 7, 2, '#f0e6c8'); rect(g, 15, 12, 2, 4, '#6a707a'); }
  return outline(c, OUT);
}

// ---------------------------------------------------------------------------- THE BACKDROP
// FAR: the hill the town sits under, the castle on top of it with one window lit, the town wall
// running down to the gate, and the chapel spire - the four shapes a stranger sees from the road.
export function bakeFarTown(w, h, seed) {
  const rnd = mulberry(seed + 300); const [c, g] = canvas(w, h);
  const ph = rnd() * 6;
  const yAt = x => Math.round(40 + 8 * Math.sin(x / w * Math.PI * 2 + ph) + 3 * Math.sin(x / w * Math.PI * 10 + ph * 2));
  for (let x = 0; x < w; x++) { const y = yAt(x); rect(g, x, y, 1, h - y, '#574866'); rect(g, x, y, 1, 1, '#6e5c80'); }
  // THE HILL AND ITS CASTLE
  const hx = Math.round(w * 0.36);
  for (let x = hx - 70; x < hx + 70; x++) { const k = 1 - Math.abs(x - hx) / 70, y = Math.round(yAt(x) - 22 * Math.sin(k * Math.PI / 2)); rect(g, x, y, 1, h - y, '#4e4060'); if (k > 0.05) px(g, x, y, '#665478'); }
  const top = Math.round(yAt(hx) - 22);
  rect(g, hx - 22, top - 10, 44, 10, '#433656');                                         /* the curtain wall */
  for (let x = hx - 22; x < hx + 22; x += 4) rect(g, x, top - 12, 2, 2, '#433656');
  for (const [tx, th] of [[hx - 24, 18], [hx + 20, 16]]) { rect(g, tx, top - th, 6, th, '#3e3250'); for (let k = 0; k < 6; k += 2) rect(g, tx + k, top - th - 2, 1, 2, '#3e3250'); }
  rect(g, hx - 7, top - 30, 14, 30, '#3a2e4c');                                           /* the keep */
  for (let k = 0; k < 14; k += 3) rect(g, hx - 7 + k, top - 32, 2, 2, '#3a2e4c');
  rect(g, hx - 1, top - 22, 2, 3, '#ffb45a'); rect(g, hx + 3, top - 14, 1, 2, '#e89a4a');  /* somebody is up */
  rect(g, hx, top - 40, 1, 8, '#3a2e4c'); fillPoly(g, [[hx + 1, top - 40], [hx + 7, top - 38], [hx + 1, top - 36]], '#8a3a3a');   /* and the banner */
  // THE TOWN WALL, down the far slope to its gate
  for (let x = hx + 60; x < w * 0.8; x++) { const y = yAt(x) - 6; rect(g, x, y, 1, 6, '#4a3e5a'); if (x % 5 < 2) px(g, x, y - 1, '#4a3e5a'); }
  { const gx = Math.round(w * 0.8), y = yAt(gx); rect(g, gx - 5, y - 14, 10, 14, '#423652'); rect(g, gx - 2, y - 8, 4, 8, '#2a2236'); for (let k = 0; k < 10; k += 3) rect(g, gx - 5 + k, y - 16, 2, 2, '#423652'); }
  // THE SPIRE
  { const sx = Math.round(w * 0.6), y = yAt(sx); rect(g, sx - 3, y - 20, 7, 20, '#4a3e5a'); fillPoly(g, [[sx - 4, y - 20], [sx + 4, y - 20], [sx, y - 38]], '#403450'); rect(g, sx, y - 43, 1, 5, '#6e5c80'); rect(g, sx - 1, y - 14, 2, 3, '#e89a4a'); }
  return c;
}
// MID: the town's own roofline. Timber houses gable-end on, jettied, every roof clay; chimneys going;
// windows coming on; a tavern's lantern; the tower of the chapel over all of it.
export function bakeMidTown(w, h, seed) {
  const rnd = mulberry(seed + 400); const [c, g] = canvas(w, h);
  const base = 62;
  rect(g, 0, base, w, h - base, '#2a2030');
  let x = -12;
  while (x < w + 12) {
    const wd = 18 + ((rnd() * 18) | 0), ht = 20 + ((rnd() * 16) | 0), pitch = (wd >> 1) + 2;
    /* AGAINST A DUSK SKY A HOUSE IS A SILHOUETTE. Lit plaster the colour of the sky vanished into it and left
       only its windows hanging in the air, so the walls are the dark side of the street and the light is inside. */
    const wall = rnd() < 0.5 ? '#3e3044' : '#382c3e', frame = '#241a28';
    rect(g, x, base - ht, wd, ht, wall);
    rect(g, x - 1, base - Math.round(ht * 0.5), wd + 2, 2, frame);                        /* the jetty */
    rect(g, x, base - ht, 1, ht, frame); rect(g, x + wd - 1, base - ht, 1, ht, frame);
    for (let k = 0; k <= pitch; k++) { const rw = wd + 2 - Math.round(k * (wd + 2) / pitch); rect(g, x - 1 + Math.round((wd + 2 - rw) / 2), base - ht - k, rw, 1, k < 2 ? '#2e1c22' : k % 3 === 0 ? '#4a2830' : '#553038'); }
    for (let wy = base - ht + 4; wy < base - 6; wy += Math.round(ht * 0.5)) for (let wx = x + 3; wx < x + wd - 4; wx += 7) {
      const lit = rnd() < 0.55; rect(g, wx, wy, 3, 4, lit ? '#ffb45a' : '#2e2432'); if (lit) px(g, wx, wy, '#ffe0a0'); }
    if (rnd() < 0.6) { const cx2 = x + 3 + ((rnd() * (wd - 8)) | 0), cy = base - ht - pitch + Math.abs(cx2 - (x + wd / 2)) + 1;
      rect(g, cx2, cy - 7, 3, 7, '#4a3e44');
      for (let k = 0; k < 6; k++) px(g, cx2 + 1 + Math.round(Math.sin(k * 0.9) * 1.5) + (k >> 1), cy - 9 - k * 3, k < 3 ? '#6a5a68' : '#5a4e5c'); }
    x += wd + ((rnd() * 3) | 0);
  }
  // THE CHAPEL TOWER over the roofs, with its bell-louvres and a clock nobody has wound
  { const tx = Math.round(w * 0.7), top = base - 70;
    rect(g, tx - 9, top, 18, 70, '#3a2e3e'); rect(g, tx - 9, top, 2, 70, '#4e4050');
    for (let k = 0; k < 18; k += 4) rect(g, tx - 9 + k, top - 3, 2, 3, '#3a2e3e');
    rect(g, tx - 3, top + 8, 6, 8, '#241c28'); for (let k = 0; k < 8; k += 2) rect(g, tx - 3, top + 8 + k, 6, 1, '#3a2e3a');
    rect(g, tx - 4, top + 24, 8, 8, '#d8c8a8'); px(g, tx, top + 27, '#2a2230'); px(g, tx + 1, top + 26, '#2a2230'); px(g, tx, top + 26, '#2a2230'); }
  // THE INN'S LANTERN, hung out over the street so the road knows where to stop
  { const lx = Math.round(w * 0.22); rect(g, lx, base - 26, 8, 1, '#2a2230'); rect(g, lx + 6, base - 25, 3, 4, '#ffd36b'); px(g, lx + 7, base - 24, '#fff6c8'); }
  return c;
}
// THE YARDS behind the street, between the town and the road you are on: back walls, lean-tos, a line of
// washing that is actually ON a line, and water butts - all in the dark, because at dusk the backs of houses
// are a shape and nothing else. (The village's own layer hung its washing on nothing, and against a lit sky
// that is a row of grey squares floating over the roofs.) A band, 640x300, same place as every near layer.
export function bakeYardsTown(w, h, seed) {
  const rnd = mulberry(seed + 600); const [c, g] = canvas(w, h);
  const base = 150, ink = '#261c2a', ink2 = '#2e2334';
  for (let x = 0; x < w; x++) rect(g, x, base + Math.round(1.5 * Math.sin(x / 17)), 1, 30, ink);                     /* the back walls */
  for (let x = 0; x < w; x += 8) rect(g, x, base - 3 + Math.round(1.5 * Math.sin(x / 17)), 6, 3, ink2);            /* their coping */
  for (let i = 0; i < w / 70; i++) { const x = (rnd() * w) | 0, wd = 20 + ((rnd() * 16) | 0), ht = 14 + ((rnd() * 10) | 0);   /* lean-tos */
    rect(g, x, base - ht, wd, ht, ink);
    for (let k = 0; k < wd + 4; k++) rect(g, x - 2 + k, base - ht - Math.round(k * 0.3), 1, 2, ink2);
    if (rnd() < 0.4) { rect(g, x + 4, base - ht + 5, 3, 3, '#e89a4a'); px(g, x + 4, base - ht + 5, '#ffd08a'); } }            /* a lamp left on in one */
  for (let i = 0; i < w / 130; i++) { const x0 = (rnd() * (w - 90)) | 0, len = 50 + ((rnd() * 30) | 0), y0 = base - 26;       /* the washing line and its posts */
    rect(g, x0, y0, 2, 26, ink); rect(g, x0 + len, y0, 2, 26, ink);
    for (let k = 0; k <= len; k++) px(g, x0 + 1 + k, y0 + 1 + Math.round(Math.sin(Math.PI * k / len) * 4), ink);
    for (let k = 6; k < len - 6; k += 9 + ((rnd() * 4) | 0)) { const y = y0 + 1 + Math.round(Math.sin(Math.PI * k / len) * 4);
      rect(g, k + x0, y + 1, 6, 6 + ((rnd() * 4) | 0), rnd() < 0.5 ? ink2 : '#342838'); } }
  for (let i = 0; i < w / 90; i++) { const x = (rnd() * w) | 0; rect(g, x, base - 9, 7, 9, ink2); rect(g, x, base - 9, 7, 1, '#3e3044'); }   /* water butts */
  return c;
}

// NEAR: the eaves and signs of the houses on YOUR side of the street, passing between you and the
// light - a band across the top of the screen, never a slab.
export function bakeNearTown(w, h, seed) {
  const rnd = mulberry(seed + 500); const [c, g] = canvas(w, h);
  const eave = 18;
  for (let x = 0; x < w; x++) rect(g, x, 0, 1, eave + Math.round(1.5 * Math.sin(x / 11)), '#231a22');
  for (let x = 0; x < w; x += 6) rect(g, x, eave - 1 + Math.round(1.5 * Math.sin(x / 11)), 4, 3, '#2e2230');          /* tile ends */
  for (let i = 0; i < w / 90; i++) { const x = (rnd() * w) | 0;                                                       /* jetty brackets */
    for (let t = 0; t < 10; t++) rect(g, x + t, eave + t, 2, 1, '#231a22'); }
  for (let i = 0; i < w / 150; i++) { const x = (rnd() * w) | 0, y = eave + 4;                                       /* a sign on its iron */
    rect(g, x, y, 16, 1, '#1e1820'); rect(g, x + 3, y + 1, 1, 4, '#1e1820'); rect(g, x + 13, y + 1, 1, 4, '#1e1820');
    rect(g, x + 1, y + 5, 15, 11, '#2a2028'); rect(g, x + 2, y + 6, 13, 1, '#3a2e34'); }
  for (let i = 0; i < w / 200; i++) { const x0 = (rnd() * (w - 140)) | 0, len = 90 + ((rnd() * 50) | 0);                 /* bunting, in silhouette */
    for (let k = 0; k < len; k++) { const y = eave + 2 + Math.round(Math.sin(Math.PI * k / len) * 14); px(g, x0 + k, y, '#2a2028');
      if (k % 8 === 3) fillPoly(g, [[x0 + k, y], [x0 + k + 5, y], [x0 + k + 2, y + 6]], '#2a2028'); } }
  return c;
}
