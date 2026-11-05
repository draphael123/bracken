// src/redraw/uc3_art.js - UNDERCROWN 3's ART PASS (claude/uc3art, over the greybox claude/undercrown3). DRAWING ONLY, behind L.uc3 (UC3_SHIPS): no tile, entity, number or timer changes.
// src/undercrown3.js drawBand / drawFireman call these (each in try/catch; the greybox rects stay as the fallback), main.js calls drawFallenRubble after the slabs.
// Plain fillRect pixels (no paths), so tools/uc3-art.mjs renders everything in Node.
//   THE GAS      a sick yellow-green miasma under the roof: layered billows, a rolling lower edge, drifting wisps; READY = it heaves and a first blue lick runs along the roof; a FUSE = blue-white
//                lambent flame racing under the ceiling (firedamp burns blue first, then it all goes orange-white)
//   THE BLAST    the roll of fire along the roof for half a second, then SOOT: black streaks hung under the roof where the gas burned, staying for the level
//   WIND DOORS   a brattice: tarred sailcloth over a rough pit-prop frame, strap hinges, a pull-chain - SHUT it hangs across the gallery, OPEN it is swung back flat against the wall, edge-on
//   THE CANARY   a brass bell-cage on a hook: a yellow bird that sings (beak open, a note), flutters as the gas thickens, and at READY sits fluffed and still on the cage floor, eyes shut
//   THE FIREMAN  a pitman in a wet-sacking hood and cape (the navvy's sheet, no cap, no pick: frames in the same order) + the pole: a long pit-prop with a caged candle-lantern on its end
//   RUBBLE       the chocks under a fallen slab's ends: a shelf stands on broken masonry with a black crawl gap between; a slab that lies where it fell has a heap at each end.
import { canvas, rect, px, mulberry, outline, flipX, whiten } from '../px.js';

const R = rect;
const ri = Math.round;
const wave = (t, f, p = 0) => 0.5 + 0.5 * Math.sin(t * f + p);
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };

// ---------------- THE GAS ----------------
// l, t = the chamber's left / the roof's top (screen); w = width; d = how deep the band is; o = { hot (a fuse), rdy (READY), fill (0..1) }
export function drawGas(g, l, t, w, d, time, o = {}) {
  l = ri(l); t = ri(t); w = ri(w); d = ri(d); if (w < 2 || d < 1) return;
  const { hot = false, rdy = false, fill = 0.5 } = o, rnd = mulberry(5);
  const body = hot ? ['#fff6c8', '#dfffa0', '#a8e8ff'] : ['#a2b866', '#8aa458', '#6c8a48'];
  // three layered billows, each a slower drift of columns of different depth: the miasma is never one flat slab
  for (let layer = 0; layer < 3; layer++) {
    g.globalAlpha = hot ? 0.3 : (0.1 + 0.07 * fill) * (rdy ? 1.35 : 1);
    for (let x = 0; x < w; x += 3) { const ph = x * 0.09 + layer * 2.1, bump = Math.sin(ph + time * (0.35 + layer * 0.2)) * 0.5 + 0.5, dd = ri(d * (0.55 + 0.25 * layer) * (0.78 + 0.22 * bump)); R(g, l + x, t, 3, dd, body[layer]); }
  }
  // the heavy bottom edge: rolls, with a pale rim you can read from across the room (the line the canary stands for)
  for (let x = 0; x < w; x += 2) { const e = d + ri(Math.sin(time * 1.6 + x * 0.14) * 1.5 + Math.sin(time * 0.9 + x * 0.05) * 1.2);
    g.globalAlpha = rdy ? 0.75 : 0.45; R(g, l + x, t + e, 2, 1, hot ? '#fff6c8' : '#d6ecb0'); g.globalAlpha = rdy ? 0.4 : 0.22; R(g, l + x, t + e - 1, 2, 1, hot ? '#dfffa0' : '#b8d488'); g.globalAlpha = rdy ? 0.28 : 0.14; R(g, l + x, t + e + 1, 2, 1, '#9ab86a'); }
  // wisps let down from it, drifting
  g.globalAlpha = 0.3; for (let i = 0; i < Math.min(14, 2 + ri(w / 40)); i++) { const ph = (time * 0.12 + i * 0.37) % 1, wx = l + ((i * 53 + ri(rnd() * 20)) % Math.max(1, w - 4)) + ri(Math.sin(time + i) * 3); R(g, wx, t + d - 1 + ri(ph * 10), 1, 3, '#c8dca0'); } g.globalAlpha = 1;
  if (rdy && !hot) for (let i = 0; i < Math.max(2, ri(w / 70)); i++) { const x = l + ((time * 18 + i * 61) % w); if (Math.sin(time * 9 + i * 4) > 0.5) { g.globalAlpha = 0.8; R(g, ri(x), t + d - 2, 3, 1, '#9ad8ff'); g.globalAlpha = 1; } }   // READY: the first blue licks flicker in it
  if (hot) { // a fuse: the lambent flame racing under the ceiling, blue at the front, white-gold behind
    for (let x = 0; x < w; x += 2) { const f = (x / w + time * 3.4) % 1, a = f < 0.18 ? 0.9 * (1 - f / 0.18) : 0; if (a > 0.05) { g.globalAlpha = a; R(g, l + x, t + ri(d * 0.35), 2, ri(d * 0.45) + 1, f < 0.06 ? '#ffffff' : '#9ad8ff'); } } g.globalAlpha = 1; }
  g.globalAlpha = 1;
}
// the burst along the roof: age 0 -> 0.6 s. box = { l, r, t, b } in screen px
export function drawBlast(g, box, age) {
  if (age > 0.6) return; const k = age / 0.6, w = ri(box.r - box.l), h = ri(box.b - box.t), l = ri(box.l), t = ri(box.t);
  g.globalAlpha = 1 - k * k; R(g, l, t, w, h, '#ffd36b'); g.globalAlpha = (1 - k) * 0.8; R(g, l, t, w, ri(h * 0.6), '#fff6c8');
  for (let x = 0; x < w; x += 4) { const fh = ri((0.4 + 0.6 * Math.abs(Math.sin(x * 0.7 + age * 20))) * h * (1 - k * 0.4)); g.globalAlpha = 1 - k; R(g, l + x, t + h - fh, 4, fh, x % 8 ? '#ff8a2c' : '#ff6b2c'); R(g, l + x + 1, t + h - fh, 2, ri(fh * 0.5), '#ffd36b'); }
  g.globalAlpha = (1 - k) * 0.7; R(g, l, t + h, w, 3, '#c9462a'); g.globalAlpha = 1;
}
// what a burn leaves: black streaks down the roof's face and a smoked line. seed = a number per burn so each is its own.
export function drawSoot(g, l, w, t, d, seed = 1) {
  l = ri(l); w = ri(w); t = ri(t); d = Math.max(4, ri(d)); const rnd = mulberry(seed * 31 + 7);
  g.globalAlpha = 0.5; R(g, l, t, w, 2, '#08060a'); g.globalAlpha = 0.3; R(g, l, t + 2, w, 2, '#08060a');
  for (let x = 0; x < w; x += 3 + ri(rnd() * 4)) { const h = 3 + ri(rnd() * Math.min(d, 18)); g.globalAlpha = 0.28 + rnd() * 0.22; R(g, l + x, t + 2, 1 + (rnd() < 0.3 ? 1 : 0), h, '#08060a'); }
  g.globalAlpha = 1;
}

// ---------------- THE WIND DOOR (brattice) ----------------
// x = the post's centre; y0..y1 the doorway. open = swung back flat against the wall; flash = a 0..1 clank pulse after a blow.
export function drawBrattice(g, x, y0, y1, open, time, flash = 0) {
  x = ri(x); y0 = ri(y0); y1 = ri(y1); const h = y1 - y0; if (h < 8) return;
  const wood = '#4a3a2a', woodL = '#6a5640', iron = '#2a2a34', ironL = '#6a6a7a', cloth = '#2e2a22', clothL = '#4a4234';
  R(g, x - 5, y0 - 2, 10, 2, wood); R(g, x - 5, y0 - 2, 10, 1, woodL);   // the lintel prop
  if (!open) {
    R(g, x - 4, y0, 8, h, cloth); for (let y = y0 + 1; y < y1; y += 4) { R(g, x - 4, y, 8, 1, clothL); R(g, x - 4 + ((y - y0) % 8 ? 1 : 5), y + 1, 2, 1, '#14120e'); }   // tarred sailcloth, seams and patches
    R(g, x - 4, y0, 1, h, wood); R(g, x + 3, y0, 1, h, wood); R(g, x - 4, y0, 1, h, woodL); R(g, x - 4, y0 + ri(h / 2), 8, 1, wood);   // the frame
    for (const yy of [y0 + 4, y1 - 6]) { R(g, x - 5, yy, 10, 2, iron); R(g, x - 5, yy, 10, 1, ironL); px(g, x - 4, yy, '#8a8a9a'); px(g, x + 3, yy, '#8a8a9a'); }   // strap hinges
    R(g, x + 1, y0 + ri(h * 0.55), 1, 5, '#8a8a9a'); R(g, x, y0 + ri(h * 0.55) + 5, 3, 2, ironL);   // the pull-chain and its ring
    if (flash > 0) { g.globalAlpha = flash * 0.6; R(g, x - 4, y0, 8, h, '#c9b27c'); g.globalAlpha = 1; }
  } else {
    R(g, x - 7, y0, 2, h, cloth); R(g, x - 7, y0, 1, h, clothL); R(g, x - 8, y0, 1, h, wood); R(g, x - 6, y0 + 4, 3, 2, iron); R(g, x - 6, y1 - 6, 3, 2, iron);   // edge-on, back against the wall
    R(g, x - 1, y0, 2, h, '#0a0810'); g.globalAlpha = 0.3 + 0.1 * wave(time, 2); R(g, x - 3, y0, 6, h, '#9ab86a'); g.globalAlpha = 1;   // the draught: the gas leaning through
  }
}

// ---------------- THE CANARY CAGE ----------------
// x, y = the cage's foot (the floor it hangs near); silent = READY (the bird has stopped); singT = 0..1 over the last song (1 = just sang)
export function drawCage(g, x, y, time, silent, singT = 0, fill = 0) {
  x = ri(x); y = ri(y); const top = y - 19;
  R(g, x, top - 4, 1, 4, '#5a5a6a'); R(g, x - 1, top - 5, 3, 1, '#8a8a9a');   // the hook
  R(g, x - 5, top, 11, 2, '#8a6a22'); R(g, x - 5, top, 11, 1, '#d8a83a'); R(g, x - 4, top - 1, 9, 1, '#b88a2a'); R(g, x - 2, top - 2, 5, 1, '#d8a83a');   // the dome
  for (let i = -5; i <= 5; i += 2) { R(g, x + i, top + 2, 1, 9, '#a47a28'); } R(g, x - 5, top + 2, 1, 9, '#d8a83a');   // brass bars
  R(g, x - 5, top + 11, 11, 2, '#8a6a22'); R(g, x - 5, top + 11, 11, 1, '#d8a83a'); R(g, x - 3, top + 13, 7, 1, '#5a4818');   // the base
  R(g, x - 4, top + 7, 9, 1, '#5a4818');   // the perch
  const bx = x, by = silent ? top + 10 : top + 6;
  if (silent) { // fluffed into a ball on the cage floor, grey-yellow, eyes shut, still
    R(g, bx - 3, by - 3, 7, 4, '#b8a84a'); R(g, bx - 2, by - 4, 5, 1, '#c8b858'); R(g, bx - 3, by - 1, 7, 1, '#8a7a30'); R(g, bx + 1, by - 3, 2, 1, '#2a2418'); R(g, bx + 3, by - 2, 1, 1, '#d08a2a'); }
  else { const flutter = fill > 0.35 ? ri(Math.sin(time * (20 + fill * 20)) * 1) : 0, sing = singT > 0.4 || Math.sin(time * 5) > 0.7;   // restless as it thickens
    R(g, bx - 3, by - 3 + flutter, 7, 4, '#ffd34a'); R(g, bx - 2, by - 4 + flutter, 5, 1, '#ffe680'); R(g, bx - 3, by - 1 + flutter, 7, 1, '#d8a82a'); R(g, bx - 5, by - 2 + flutter, 2, 2, '#d8a82a');   // body, crown, belly, tail
    R(g, bx + 1, by - 3 + flutter, 1, 1, '#2a2418'); R(g, bx + 3, by - 2 + flutter, sing ? 2 : 1, 1, '#d06a2a'); R(g, bx - 1, by + 1, 1, 2, '#8a6a22'); R(g, bx + 1, by + 1, 1, 2, '#8a6a22');
    if (singT > 0.2) { g.globalAlpha = Math.min(1, singT * 1.5); R(g, bx + 5, by - 8 - ri((1 - singT) * 5), 2, 1, '#ffe6a0'); R(g, bx + 6, by - 9 - ri((1 - singT) * 5), 1, 3, '#ffe6a0'); R(g, bx + 8, by - 11 - ri((1 - singT) * 5), 2, 1, '#ffe6a0'); g.globalAlpha = 1; } }
}

// ---------------- THE FIREMAN'S POLE ----------------
// (x, yb) = his hand; (x, top) the pole's top; face = +1 / -1; raised = the tell (the pole thrust up to the roof). The lantern is the thing he lights the gas with.
export function drawPole(g, x, yb, top, face, time, raised) {
  x = ri(x); yb = ri(yb); top = ri(top);
  R(g, x, top, 2, yb - top + 6, '#5a4630'); R(g, x, top, 1, yb - top + 6, '#7a6244'); for (let y = top + 4; y < yb + 4; y += 9) R(g, x, y, 2, 1, '#3a2c1c');   // a pit-prop shaved to a pole, ringed with rope-marks
  R(g, x - 3, top - 7, 8, 7, '#2a2a34'); R(g, x - 3, top - 7, 8, 1, '#6a6a7a'); R(g, x - 3, top - 1, 8, 1, '#6a6a7a'); R(g, x - 4, top - 9, 10, 2, '#3a3a46'); R(g, x - 1, top - 11, 4, 2, '#6a6a7a');   // the cage lantern: iron frame, a cap, a ring
  R(g, x - 2, top - 6, 1, 5, '#6a6a7a'); R(g, x + 3, top - 6, 1, 5, '#6a6a7a');
  const f = 0.5 + 0.5 * Math.sin(time * 18); R(g, x - 1, top - 6, 4, 5, '#ffd36b'); R(g, x, top - 6 - ri(f * 2), 2, 6 + ri(f * 2), f > 0.5 ? '#fff6c8' : '#ffe08a'); px(g, x + 1, top - 7 - ri(f * 3), '#ff9a5c');   // the candle's flame
  g.globalAlpha = raised ? 0.34 : 0.16; R(g, x - 10, top - 14, 22, 20, '#ffd36b'); g.globalAlpha = raised ? 0.2 : 0.08; R(g, x - 16, top - 20, 34, 32, '#ffd36b'); g.globalAlpha = 1;
  if (raised) { for (let i = 0; i < 3; i++) { const ph = (time * 2 + i * 0.33) % 1; g.globalAlpha = 1 - ph; px(g, x + ri(Math.sin(time * 9 + i * 2) * 4) + 1, top - 12 - ri(ph * 8), '#ffd36b'); } g.globalAlpha = 1; }
  R(g, x - 1 * face, yb, 3, 3, '#d09a74'); R(g, x - 1 * face, yb + 3, 3, 1, '#8a6040');   // his fist on it
}

// ---------------- THE FIREMAN (a sprite set: the navvy's frame order, no pick) ----------------
const FP = { o: '#1b1626', s: '#7a7462', S: '#4e4a3c', w: '#9a9a88', W: '#5a6a6a', g: '#d09a74', G: '#9a6a48', e: '#14120e', T: '#3e3458', t: '#26203a', d: '#2a3a3a', y: '#ffd36b' };
const grid = (rows) => rows.map(r => r.padEnd(14, '.').slice(0, 14));
const BODY = grid([
  '......oooo....', '.....osssso...', '....osswsSso..', '....osSsssso..', '....oSggggSo..', '....oggeggeo..', '.....oggGgo...', '...ooossSoo...',
  '..osswsssSsso.', '..osSssswSsso.', '..osssSsssSsgo', '..osSssswsSsgo', '...osssdssSso.', '...osSssssSso.']);
const LEGS = {
  stand: grid(['...oTTTooTTo..', '...oTTTooTTo..', '...ooooo.ooo..']),
  stepA: grid(['..oTTTooTTTo..', '..oTTo..oTTo..', '..ooo....ooo..']),
  stepB: grid(['...oTTTTTTo...', '...oTTooTTo...', '...ooo.ooo....']),
  crouch: grid(['..oTTTTTTTTo..', '..ooooooooooo.', '..............']),
};
export function bakeFireman() {
  const frame = (legs, arms) => { const [c, g] = canvas(14, 16), rows = BODY.map(r => r.split('')).concat(LEGS[legs].map(r => r.split('')));
    if (arms === 'up') { // the pole raised: the near fist up by the hood, the sleeve behind it
      rows[10][12] = 's'; rows[11][12] = 's'; rows[10][13] = '.'; rows[11][13] = '.'; rows[6][12] = 'g'; rows[6][13] = 'o'; rows[7][12] = 's'; rows[8][12] = 's'; rows[8][11] = 's'; rows[9][11] = 's'; rows[5][12] = 'o'; }
    if (arms === 'help') { rows[10][12] = 's'; rows[10][13] = '.'; rows[11][12] = 's'; rows[11][13] = '.'; rows[5][12] = 'g'; rows[5][13] = 'o'; rows[6][12] = 's'; rows[7][12] = 's'; rows[4][12] = 'o'; rows[5][2] = 'g'; rows[5][1] = 'o'; rows[6][2] = 's'; rows[7][2] = 's'; rows[4][2] = 'o'; }
    for (let y = 0; y < 16; y++) for (let x = 0; x < 14; x++) { const ch = rows[y] && rows[y][x]; if (ch && ch !== '.' && FP[ch]) px(g, x, y, FP[ch]); }
    return c; };
  const F = [frame('stand', 'hold'), frame('stepA', 'hold'), frame('crouch', 'hold'), frame('stand', 'up'), frame('stepA', 'hold'), frame('stepB', 'hold'), frame('stand', 'up'), frame('stand', 'help')];
  return { R: F, L: F.map(c => flipX(c)), white: { R: F.map(c => whiten(c)), L: F.map(c => flipX(whiten(c))) }, ax: 7, ay: 15, w: 10, h: 11 };
}

// ---------------- THE FALLEN SLABS' RUBBLE ----------------
// rt: a src/undercrown-slabs.js slab in state 'flat' (rt.flat = { row, land, deep, kind: 'shelf' | 'bridge' }); drawn after the slab, before the creatures
export function drawFallenRubble(g, rt, cx, cy, TS, time) {
  const f = rt && rt.flat; if (!f || rt.state !== 'flat') return;
  const x0 = rt.x0 * TS - cx, x1 = (rt.x1 + 1) * TS - cx, seed = rt.x0 * 7 + rt.row;
  if (f.kind === 'shelf') {   // it stands a gap off the floor on broken masonry: chocks at each end, black under the middle
    const top = (f.row + f.deep) * TS - cy, floor = f.land * TS - cy;
    g.globalAlpha = 0.85; R(g, ri(x0) + 10, ri(top), ri(x1 - x0) - 20, ri(floor - top), '#0a080e'); g.globalAlpha = 1;
    for (const [ex, dir] of [[x0, 1], [x1, -1]]) chock(g, ex, top, floor, dir, seed + (dir > 0 ? 0 : 5));
  } else {   // lies where it fell: a heap tumbled at each end, and settled dust along its foot
    const floor = (f.row + f.deep) * TS - cy;
    for (const [ex, dir] of [[x0, -1], [x1, 1]]) heap(g, ex, floor, dir, seed + (dir > 0 ? 3 : 9));
  }
}
function chock(g, ex, top, floor, dir, seed) {   // stacked broken blocks wedged under the slab's end, a split course, a lean
  const rnd = mulberry(seed), w = 12, x = dir > 0 ? ri(ex) : ri(ex) - w; let y = ri(floor);
  while (y > top + 2) { const h = 4 + ri(rnd() * 4), off = ri(rnd() * 3) - 1, ww = w - 2 - ri(rnd() * 3); y -= h;
    R(g, x + off + (dir > 0 ? 0 : 2), Math.max(ri(top), y), ww, Math.min(h, y - ri(top) + h), rnd() < 0.5 ? '#6a6478' : '#7a7488'); R(g, x + off + (dir > 0 ? 0 : 2), Math.max(ri(top), y), ww, 1, '#a49cb4'); R(g, x + off + (dir > 0 ? 0 : 2), Math.max(ri(top), y) + Math.min(h, y - ri(top) + h) - 1, ww, 1, '#2a2630'); }
  g.globalAlpha = 0.5; R(g, x - 2, ri(floor) - 1, w + 4, 2, '#c8b898'); g.globalAlpha = 1;
}
function heap(g, ex, floor, dir, seed) {
  const rnd = mulberry(seed); for (let i = 0; i < 9; i++) { const ox = dir * (2 + ri(rnd() * 14)), oy = ri(rnd() * (7 - Math.abs(ox) * 0.3)), s = 2 + ri(rnd() * 4);
    R(g, ri(ex + ox) - 1, ri(floor - oy - s), s, s, i % 3 ? '#6a6478' : '#8a8298'); R(g, ri(ex + ox) - 1, ri(floor - oy - s), s, 1, '#a49cb4'); }
  g.globalAlpha = 0.4; R(g, ri(ex) - 6 + (dir > 0 ? 0 : -4), ri(floor) - 1, 22, 2, '#c8b898'); g.globalAlpha = 1;
}
