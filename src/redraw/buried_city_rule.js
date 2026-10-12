// src/redraw/buried_city_rule.js - THE RULE'S PIECES (claude/bc2art, the art pass): what the sand rule is made of in the world. Part two of the set (src/redraw/buried_city_set.js: sand, light,
// decor, the arch). Every function takes a view V = { g, cx, cy, vw, vh, time, L, T } and world pixels; static pieces are baked once and memoised, only what moves is live.
//   THE LEVERS        a gate lever on an iron plate (a brass handle, a lamp: green OPEN / amber SHUT, a glass gauge of the room's sand, graduated); a CHAIN lever (links, a ring); a CHUTE lever
//                     (a brass crank on a ratchet, an ARROW to where its fall lands - not a gate lever); the king's levers
//   THE GATES         floor-gate housings: a brass-framed slot with louvres that runs while it drains; THE TRAP HALL's floor-gate (riveted plates, shut; a hinged void, open); the great grille
//   THE FALLS         a crack in the roof (ragged sand lips, dust), a brass chute on a pivot between two stops, the fall as a curtain of streaks, a splash; THE GRATE; the HEAP
//   THE STREET        THE SINKING STREET as one baked set riding the sand: a cobbled slab, house fronts, a minaret stub, a squat dome; sand cascading off its ends while it moves
//   THE WHEEL, THE VAULT   a spoked brass wheel with its three turns pegged; the clockwork vault's brass door and five gear sockets
import { SAND, sandBody, glow, hash } from './buried_city_set.js';

const R = Math.round, TS = 16;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const dot = (g, x, y, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), 1, 1); };
const put = (V, spr, wx, wy) => V.g.drawImage(spr, R(wx - V.cx), R(wy - V.cy));
const vis = (V, x0, x1, m = 80) => x1 > V.cx - m && x0 < V.cx + V.vw + m;
const BR = ['#4a3410', '#8a6a20', '#c49a38', '#e8c45c', '#fff0a0'];

/* ---------------------------------------------------------------- THE LEVERS */
function leverPlate(gold) {
  return once('plate' + gold, () => { const [c, g] = mk(18, 26), hi = gold ? BR[3] : '#7a748a', mid = gold ? '#4a3a18' : '#2e2a38';
    rc(g, 2, 2, 14, 22, mid); rc(g, 2, 2, 14, 1, hi); rc(g, 2, 2, 1, 22, gold ? BR[2] : '#5a546a'); rc(g, 15, 2, 1, 22, '#16141c'); rc(g, 2, 23, 14, 1, '#16141c');
    for (const [x, y] of [[4, 4], [13, 4], [4, 21], [13, 21]]) { dot(g, x, y, gold ? BR[4] : '#b0aabf'); dot(g, x + 1, y + 1, '#16141c'); }
    rc(g, 8, 6, 2, 14, '#0e0c14'); rc(g, 8, 6, 1, 14, '#1e1a28');   /* the slot the lever runs in */
    rc(g, 6, 20, 6, 3, '#3a3446'); rc(g, 6, 20, 6, 1, '#8a849a');
    return c; });
}
const gaugeSpr = () => once('gauge', () => { const [c, g] = mk(8, 22);
  rc(g, 0, 0, 8, 22, '#6a4a14'); rc(g, 0, 0, 8, 1, BR[3]); rc(g, 0, 0, 1, 22, BR[3]); rc(g, 7, 0, 1, 22, BR[0]); rc(g, 0, 21, 8, 1, BR[0]);
  rc(g, 2, 2, 4, 18, '#14101c'); rc(g, 2, 2, 1, 18, '#3a4a60'); for (let y = 4; y < 20; y += 4) rc(g, 6, y, 1, 1, BR[3]);
  return c; });
const crankSpr = () => once('crank', () => { const [c, g] = mk(22, 20);
  rc(g, 2, 12, 18, 8, '#6a4a14'); rc(g, 2, 12, 18, 1, BR[3]); rc(g, 2, 19, 18, 1, BR[0]); for (const x of [4, 17]) dot(g, x, 16, BR[4]);
  g.fillStyle = BR[2]; g.beginPath(); g.arc(11, 12, 5, 0, 7); g.fill(); g.fillStyle = BR[0]; g.beginPath(); g.arc(11, 12, 2, 0, 7); g.fill();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; rc(g, 11 + Math.cos(a) * 6.4, 12 + Math.sin(a) * 6.4, 1, 1, BR[3]); }   /* the ratchet's teeth */
  return c; });
/* o: { x, y (the lever's feet, world px), kind 'gate' | 'chute' | 'arena', open, chain, k (room fill 0..1), dir (-1/+1: where a chute's fall lands), lit/near (the king's lever), pull (0..0.5 s) } */
export function drawLever(V, o) {
  const g = V.g, X = o.x - V.cx, Y = o.y - V.cy, t = V.time;
  if (o.chain) {   /* a chain up the wall, pulled anywhere on its length: links, a ring where the hand takes it */
    for (let yy = Y - (o.chain + 1) * TS; yy < Y - 13; yy += 4) { const k = ((yy - Y) / 4) & 1; rc(g, X - (k ? 1 : 0), yy, k ? 3 : 1, 3, k ? '#aaaab6' : '#6a6a76'); dot(g, X, yy + 1, '#2a2a34'); }
    rc(g, X - 2, Y - 13, 5, 1, '#c0c0cc'); rc(g, X - 2, Y - 12, 1, 3, '#c0c0cc'); rc(g, X + 2, Y - 12, 1, 3, '#7a7a86'); rc(g, X - 2, Y - 9, 5, 1, '#7a7a86');
    rc(g, X - 1, Y - 8, 3, 6, '#7a5a20'); rc(g, X - 1, Y - 8, 1, 6, BR[3]); rc(g, X + 1, Y - 8, 1, 6, BR[0]); return; }
  if (o.kind === 'chute') {
    put(V, crankSpr(), o.x - 11, o.y - 20);
    const a = o.open ? 0.9 : -0.9, tx = X + Math.sin(a) * 12, ty = Y - 8 - Math.cos(a) * 12;
    g.strokeStyle = BR[0]; g.lineWidth = 3; g.beginPath(); g.moveTo(R(X), R(Y - 8)); g.lineTo(R(tx), R(ty)); g.stroke(); g.strokeStyle = BR[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(R(X), R(Y - 9)); g.lineTo(R(tx), R(ty - 1)); g.stroke();
    g.fillStyle = BR[2]; g.beginPath(); g.arc(R(tx), R(ty), 3, 0, 7); g.fill(); dot(g, R(tx) - 1, R(ty) - 1, BR[4]);
    /* the pointer: a brass arrow over it, toward where the fall lands (a chute lever is no gate lever) */
    const d = o.dir || 1, ay = Y - 31 + Math.round(Math.sin(t * 5));
    g.fillStyle = BR[2]; g.beginPath(); g.moveTo(R(X + d * 9), ay + 3); g.lineTo(R(X + d * 2), ay - 1); g.lineTo(R(X + d * 2), ay + 7); g.closePath(); g.fill(); g.fillStyle = BR[4]; g.fillRect(R(X + d * 2) - (d < 0 ? 0 : 0), ay, 1, 1); rc(g, d > 0 ? X - 5 : X + 1, ay + 2, 5, 3, BR[2]); rc(g, d > 0 ? X - 5 : X + 1, ay + 2, 5, 1, BR[4]);
    return; }
  /* a gate lever / the king's: the iron plate, the handle on its pivot, the lamp, the gauge */
  put(V, leverPlate(o.kind === 'arena'), o.x - 9, o.y - 26);
  if (o.kind === 'arena' && o.near != null) { /* (M5) the king's lever glows while his glass is low: drawn by the hands */ }
  const a = o.open ? 0.9 : -0.9, tx = X + Math.sin(a) * 12, ty = Y - 9 - Math.cos(a) * 12;
  g.strokeStyle = '#7a5a20'; g.lineWidth = 3; g.beginPath(); g.moveTo(R(X), R(Y - 9)); g.lineTo(R(tx), R(ty)); g.stroke(); g.strokeStyle = BR[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(R(X), R(Y - 10)); g.lineTo(R(tx), R(ty - 1)); g.stroke();
  g.fillStyle = o.kind === 'arena' ? BR[3] : '#e8c070'; g.beginPath(); g.arc(R(tx), R(ty), 3, 0, 7); g.fill(); dot(g, R(tx) - 1, R(ty) - 1, '#fff4c8'); g.fillStyle = '#6a4a14'; g.fillRect(R(X) - 2, R(Y - 11), 4, 4);   /* the pivot */
  if (o.kind === 'gate') { const k = Math.max(0, Math.min(1, o.k || 0)), lc = o.open ? '#6cd060' : '#ffa040';   /* the lamp: green OPEN, amber SHUT; the gauge: the room's sand in a graduated glass */
    g.fillStyle = '#1a1620'; g.fillRect(R(X) - 3, R(Y - 33), 6, 5); g.fillStyle = lc; g.fillRect(R(X) - 2, R(Y - 32), 4, 3); dot(g, R(X) - 2, R(Y - 32), '#ffffff'); glow(V, o.x, o.y - 31, 14, 0.28, o.open ? '108,208,96' : '255,160,64');
    put(V, gaugeSpr(), o.x + 9, o.y - 24); if (k > 0) { rc(g, X + 11, Y - 5 - 16 * k, 4, 16 * k, SAND.ramp[3]); rc(g, X + 11, Y - 5 - 16 * k, 4, 1, SAND.crest); } }
}

/* ---------------------------------------------------------------- THE GATES (floor-gates) */
/* a floor-gate housing at the foot of a room: a brass-framed slot with louvres; open it runs (sand streams through it), shut it is a closed plate */
export function drawGateSlot(V, wx, wbot, open, running) {
  const g = V.g, x = R(wx - V.cx - 14), y = R(wbot - V.cy);
  rc(g, x - 1, y - 4, 30, 5, '#3a2a14'); rc(g, x - 1, y - 4, 30, 1, BR[3]); rc(g, x - 1, y, 30, 1, BR[0]);
  if (open) { rc(g, x + 2, y - 3, 24, 3, '#0a0806'); if (running) { g.fillStyle = SAND.stream; for (let i = 0; i < 6; i++) g.fillRect(x + 4 + i * 4, y - 3 + ((V.time * 70 + i * 5) % 5), 2, 3); g.fillStyle = SAND.streamHi; for (let i = 0; i < 3; i++) g.fillRect(x + 5 + i * 8, y - 3 + ((V.time * 90 + i * 7) % 5), 1, 2); } for (let i = 0; i < 4; i++) rc(g, x + 2 + i * 7, y - 3, 1, 3, '#4a3410'); }
  else { for (let i = 0; i < 6; i++) { rc(g, x + 2 + i * 4, y - 3, 3, 3, BR[1]); rc(g, x + 2 + i * 4, y - 3, 3, 1, BR[2]); } }
  for (const bx of [x + 1, x + 26]) dot(g, bx, y - 2, BR[4]);
}
/* THE TRAP HALL's floor-gate: shut it is a floor of riveted iron plates under a brass lip; open it is a void between two hinged leaves */
export function drawTrapFloor(V, l, w, bot, shut) {
  const g = V.g, x0 = R(l - V.cx), y = R(bot - V.cy);
  if (shut) { rc(g, x0, y, w, TS, '#4a4a58'); rc(g, x0, y, w, 1, '#a0a0b0'); rc(g, x0, y + 1, w, 1, '#6a6a78'); rc(g, x0, y + TS - 2, w, 2, '#22222c');
    for (let x = 0; x < w; x += 16) { rc(g, x0 + x + 15, y, 1, TS, '#22222c'); for (const yy of [3, 11]) { dot(g, x0 + x + 3, y + yy, '#c8c8d8'); dot(g, x0 + x + 12, y + yy, '#c8c8d8'); dot(g, x0 + x + 4, y + yy + 1, '#22222c'); } }
    rc(g, x0, y - 2, w, 2, BR[2]); rc(g, x0, y - 2, w, 1, BR[3]); }
  else { rc(g, x0, y, 14, 4, '#4a4a58'); rc(g, x0, y, 14, 1, '#a0a0b0'); rc(g, x0 + w - 14, y, 14, 4, '#4a4a58'); rc(g, x0 + w - 14, y, 14, 1, '#a0a0b0'); for (const hx of [x0 + 12, x0 + w - 13]) { rc(g, hx, y - 1, 3, 6, BR[1]); dot(g, hx + 1, y, BR[4]); } }
}
/* the sand roof's holes: a ragged lip where a stream starts */
export function drawRoofHole(V, wx, wy) { const g = V.g, x = R(wx - V.cx), y = R(wy - V.cy); rc(g, x - 4, y - 3, 11, 3, '#1c130a'); rc(g, x - 3, y - 4, 9, 1, '#4a361e'); for (let k = 0; k < 5; k++) rc(g, x - 4 + k * 2 + (hash(k, wx) % 2), y - 1, 1, 2 + (k & 1), '#6a4e2c'); }
/* a stream of sand: braided, with grains - from world (x, y0) down to ye */
export function drawStream(V, wx, y0, ye, time, w = 3) {
  if (ye <= y0) return; const g = V.g, x = R(wx - V.cx), a = R(y0 - V.cy), h = R(ye - y0);
  g.fillStyle = SAND.stream; g.fillRect(x, a, w, h); g.fillStyle = 'rgba(255,240,190,0.7)'; g.fillRect(x, a, 1, h); g.fillStyle = 'rgba(168,120,60,0.8)'; g.fillRect(x + w - 1, a, 1, h);
  g.fillStyle = SAND.streamHi; for (let i = 0; i < 3; i++) g.fillRect(x + (i % w), a + ((time * 130 + i * 31 + wx * 7) % Math.max(6, h)), 1, 4);
  g.fillStyle = 'rgba(232,196,128,0.6)'; g.fillRect(x - 1, a, 1, Math.min(h, 12)); g.fillRect(x + w, a + 3, 1, Math.min(h - 3, 10));
}

/* ---------------------------------------------------------------- THE FALLS */
export function drawCrack(V, wx, wy) {   /* a crack in the roof where the fall pours from: jagged, a lip of sand, dust */
  const g = V.g, x = R(wx - V.cx), y = R(wy - V.cy);
  rc(g, x - 10, y - 6, 20, 6, '#1c130a'); rc(g, x - 9, y - 7, 18, 1, '#3a2a18');
  for (let k = 0; k < 9; k++) { const h = 2 + hash(k, wx) % 5; rc(g, x - 9 + k * 2, y - 1, 2, h, k & 1 ? '#6a4e2c' : '#4a361e'); }
  g.strokeStyle = '#0e0a06'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 12, y - 8); g.lineTo(x - 7, y - 4); g.lineTo(x - 11, y + 1); g.moveTo(x + 12, y - 9); g.lineTo(x + 8, y - 4); g.lineTo(x + 12, y + 2); g.stroke();
  g.fillStyle = 'rgba(232,196,128,0.5)'; for (let i = 0; i < 4; i++) g.fillRect(x - 8 + ((V.time * 12 + i * 5) % 16), y + 2 + ((V.time * 18 + i * 7) % 10), 1, 1);
}
/* THE CHUTE: a brass trough on a pivot between two stops, swung to point at where the fall lands (px dx, dy from the crack); long ones are hung in ribs; while the fall runs, sand flows down it */
export function drawChute(V, wx, wy, dx, dy, flowing) {
  const g = V.g, x = R(wx - V.cx), y = R(wy - V.cy), tx = x + R(dx), ty = y + R(dy), len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
  g.strokeStyle = '#3a2a0a'; g.lineWidth = 7; g.beginPath(); g.moveTo(x, y + 2); g.lineTo(tx, ty + 2); g.stroke();
  g.strokeStyle = BR[1]; g.lineWidth = 6; g.beginPath(); g.moveTo(x, y + 1); g.lineTo(tx, ty + 1); g.stroke();
  g.strokeStyle = BR[2]; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(tx, ty); g.stroke(); g.strokeStyle = BR[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y - 1); g.lineTo(tx, ty - 1); g.stroke();
  for (let s = 22; s < len - 6; s += 22) { const rx = R(x + ux * s), ry = R(y + uy * s); rc(g, rx - 1, ry - 4, 3, 9, BR[0]); rc(g, rx - 1, ry - 4, 1, 9, BR[3]); }   /* the ribs of the trough */
  if (flowing) { g.fillStyle = SAND.streamHi; for (let i = 0; i < Math.max(3, len / 12); i++) { const p = ((V.time * 60 + i * 12) % len), qx = R(x + ux * p), qy = R(y + uy * p); g.fillRect(qx, qy - 1, 2, 2); } }
  g.fillStyle = BR[2]; g.beginPath(); g.arc(tx, ty + 1, 4, 0, 7); g.fill(); g.fillStyle = '#3a2a0a'; g.beginPath(); g.arc(tx, ty + 2, 2, 0, 7); g.fill();   /* the spout, flared */
  g.fillStyle = BR[2]; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); g.fillStyle = BR[0]; g.beginPath(); g.arc(x, y, 2, 0, 7); g.fill(); dot(g, x - 2, y - 3, BR[4]);   /* the pivot's bearing */
  for (const s of [-1, 1]) { rc(g, x + s * 15 - 1, y - 2, 3, 9, '#3a3446'); rc(g, x + s * 15 - 1, y - 2, 3, 1, '#9a94aa'); dot(g, x + s * 15, y + 1, '#b0aabf'); }   /* the two stops */
}
/* the fall: a curtain of streaks from (wx, y0) to ye, fw wide, with a splash where it lands */
export function drawFall(V, mx, y0, ye, fw, time) {
  if (ye <= y0) return; const g = V.g, x = R(mx - fw / 2 - V.cx), a = R(y0 - V.cy), h = R(ye - y0);
  g.globalAlpha = 0.82; g.fillStyle = SAND.stream; g.fillRect(x, a, R(fw), h);
  g.fillStyle = 'rgba(255,244,200,0.45)'; for (let s = 2; s < fw - 2; s += 5) g.fillRect(x + s, a, 1, h); g.fillStyle = 'rgba(160,112,52,0.55)'; for (let s = 4; s < fw - 2; s += 5) g.fillRect(x + s, a, 1, h);
  g.globalAlpha = 1; g.fillStyle = SAND.streamHi; for (let i = 0; i < 9; i++) g.fillRect(x + 2 + ((i * 7) % Math.max(4, R(fw) - 4)), a + ((time * 210 + i * 41) % Math.max(10, h)), 1, 6);
  g.fillStyle = 'rgba(232,204,138,0.75)'; g.fillRect(x - 3, a, 3, h * 0.6); g.fillRect(x + R(fw), a + 4, 3, h * 0.5);   /* ragged edges */
  const sy = R(ye - V.cy); g.fillStyle = 'rgba(232,204,138,0.7)'; g.fillRect(x - 5, sy - 3, R(fw) + 10, 3); g.fillStyle = SAND.crest; for (let i = 0; i < 8; i++) { const ph = (time * 3 + i * 0.17) % 1, sx = x + R(fw) / 2 + (i - 3.5) * 5 * (0.4 + ph); g.fillRect(R(sx), R(sy - 3 - Math.sin(ph * 3.14) * 9), 1, 1); }
}
/* THE GRATE (and the great grille): an iron grating in a stone frame over a dark void; open = the bars slid aside by `open` (0..1) */
export function drawGrate(V, l, w, wy, open = 0, running = false) {
  if (!vis(V, l, l + w)) return; const g = V.g, x = R(l - V.cx), y = R(wy - V.cy), gap = R(w * open);
  rc(g, x - 2, y - 1, w + 4, TS + 1, '#2a2430'); rc(g, x - 2, y - 1, w + 4, 2, '#7a7488'); rc(g, x, y + 2, w, 11, '#08060a');
  if (gap > 0) { rc(g, x + w - gap, y + 2, gap, 11, '#000'); }
  for (let bx = 2; bx < w - gap; bx += 4) { rc(g, x + bx, y + 1, 2, 13, '#5a566a'); rc(g, x + bx, y + 1, 1, 13, '#a8a4bc'); dot(g, x + bx, y + 1, '#d8d4ec'); }
  rc(g, x, y + 4, w - gap, 1, '#3a3648'); rc(g, x, y + 9, w - gap, 1, '#3a3648');
  rc(g, x - 2, y + TS - 3, w + 4, 3, '#16121a');
  if (running) { g.fillStyle = SAND.stream; for (let i = 0; i < Math.floor(w / 5); i++) g.fillRect(x + 3 + i * 5, y + 2 + ((V.time * 90 + i * 5) % 11), 2, 4); }
}

/* ---------------------------------------------------------------- THE HEAP: a sand body, a crest on every step, a trickle down it */
export function drawHeapRung(V, a, b, wy, firstOfCol) {
  const wx = a * TS, w = (b - a + 1) * TS; sandBody(V, wx, wy, w, wy + TS);
  V.g.fillStyle = 'rgba(255,240,190,0.35)'; V.g.fillRect(R(wx - V.cx), R(wy + 1 - V.cy), 2, TS - 1); void firstOfCol;
}

/* ---------------------------------------------------------------- THE SINKING STREET (a deck on the sand's top) */
function slab(w) {   /* the street: a cobbled slab, lit lip, dark underside */
  return once('slab' + w, () => { const [c, g] = mk(w, TS);
    for (let y = 0; y < TS; y++) for (let x = 0; x < w; x++) { const r = y >> 2, off = (r & 1) * 5, cc = Math.floor((x + off) / 10), bx = (x + off) % 10, by = y & 3; let col = ['#9a7a54', '#8c6e4a', '#a88860', '#846848'][hash(cc, r) % 4];
      if (by === 3 || bx === 9) col = '#4a3824'; else if (by === 0 && y < 8) col = '#b8986a'; else if (hash(x, y) % 11 === 0) col = '#6e5438'; dot(g, x, y, col); }
    rc(g, 0, 0, w, 1, '#d8b878'); rc(g, 0, 1, w, 1, '#c4a46c'); rc(g, 0, 12, w, 4, '#3a2a18'); rc(g, 0, 12, w, 1, '#6a5030'); rc(g, 0, 15, w, 1, '#1e140a');   /* the slab's own thickness, shadowed */
    for (let i = 0; i < w / 6; i++) dot(g, hash(i, w) % w, 0, SAND.ramp[3]);   /* sand blown into the joints */
    return c; });
}
function deckHouse(w, rows, k) {   /* a house front standing on the street: a flat roof you can stand on (a stone slab with a dentil frieze), plaster, a door, a lattice window, an awning on one */
  return once('dh' + w + '.' + rows + '.' + k, () => { const H = rows * TS, [c, g] = mk(w + 4, H);
    for (let y = 6; y < H; y++) for (let x = 2; x < w + 2; x++) { let col = ['#8e7656', '#846c4e', '#98805e'][hash(x >> 3, y >> 3) % 3]; if ((y & 7) === 7) col = '#5e4a34'; else if (hash(x, y) % 13 === 0) col = '#74603f'; dot(g, x, y, col); }
    rc(g, 0, 0, w + 4, 5, '#c4a672'); rc(g, 0, 0, w + 4, 1, '#f0d8a0'); rc(g, 0, 4, w + 4, 1, '#6a5030'); rc(g, 0, 5, w + 4, 1, '#2a1e10'); for (let x = 3; x < w + 1; x += 4) { rc(g, x, 5, 2, 2, '#a48a58'); rc(g, x, 6, 2, 1, '#3e2c1a'); }   /* the roof slab and its dentils */
    const dx = 8 + (k % 2) * (w - 30); rc(g, dx, H - 26, 14, 26, '#0e0a08'); rc(g, dx - 1, H - 27, 16, 1, '#c4a672'); rc(g, dx, H - 26, 1, 26, '#4a3824'); for (let y = H - 24; y < H; y += 4) rc(g, dx + 2, y, 10, 1, '#1e1810'); rc(g, dx + 11, H - 14, 2, 2, BR[3]);   /* a door, studded */
    const wx = k % 2 ? 8 : dx + 22; if (wx + 12 < w) { rc(g, wx, 14, 11, 14, '#0e0a10'); rc(g, wx - 1, 13, 13, 1, '#c4a672'); rc(g, wx - 1, 28, 13, 1, '#8a7452'); for (let y = 15; y < 28; y += 3) rc(g, wx + 1, y, 9, 1, '#322a1c'); for (let x = wx + 2; x < wx + 10; x += 3) rc(g, x, 15, 1, 13, '#322a1c'); if (k % 2 === 0) rc(g, wx + 2, 17, 2, 2, '#ffb050'); }   /* a lattice window: a lamp lit behind it in some */
    if (k % 2 === 1) { for (let x = 2; x < w + 2; x++) { const s = (x >> 2) & 1; rc(g, x, 6, 1, 4, s ? '#e8d4a4' : '#c4442c'); rc(g, x, 10, 1, 1 + ((x & 3) === 1 ? 2 : 0), s ? '#b49e68' : '#7e2616'); } rc(g, 2, 6, w, 1, 'rgba(255,255,255,0.35)'); }   /* a stall cloth over the door */
    rc(g, 2, 6, 1, H - 6, '#c4a672'); rc(g, w + 1, 6, 1, H - 6, '#4a3824');
    return c; });
}
function minaretStub(w, rows) {   /* a broken minaret stub: glazed bands, a gold ring, a ragged top with brick showing */
  return once('ms' + w + '.' + rows, () => { const H = rows * TS, [c, g] = mk(w, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) { const band = (y >> 3) & 1; let col = band ? ((Math.abs(((x + y) % 8) - 4) < 2) ? '#e8d4a4' : '#1c6672') : ((x % 4 < 2) ? '#2a8a98' : '#1c6672'); if ((y & 7) === 0) col = '#d8aa40'; else if ((y & 7) === 7) col = '#3a2a10'; dot(g, x, y, col); }
    for (let x = 0; x < w; x++) { const cut = hash(x, 4) % 6; rc(g, x, 0, 1, cut, '#00000000'); g.clearRect(x, 0, 1, cut); if (cut > 0) dot(g, x, cut, '#8e5a40'); if (cut > 1) dot(g, x, cut + 1, '#5a382c'); }
    rc(g, 0, 0, 1, H, '#0e2a30'); rc(g, w - 1, 0, 1, H, '#9ae4e4'); return c; });
}
function squatDome(w) {   /* a squat dome, its crown gone: glazed scales, a gold rim round the broken top (a flat to stand on) */
  return once('sd' + w, () => { const [c, g] = mk(w, TS), r = w / 2; const gl = ['#12444e', '#1c6672', '#2a8a98', '#4cb4bc', '#9ae4e4'];
    for (let y = 0; y < TS; y++) { const hw = Math.round(r * (0.78 + 0.22 * Math.sqrt(Math.max(0, 1 - Math.pow((TS - 1 - y) / (TS * 1.5), 2))))); const cut = y === 0 ? hw - 2 : hw; for (let x = -cut; x < cut; x++) { const U = (x + hw) / (2 * hw); let k = U < 0.15 ? 4 : U < 0.4 ? 3 : U < 0.7 ? 2 : U < 0.9 ? 1 : 0; if (((y & 3) === 3) || ((x + r + (y >> 2) * 3) % 6) === 0) k = Math.max(0, k - 1); dot(g, R(r + x), y, gl[k]); } }
    rc(g, 2, 0, w - 4, 2, '#d8aa40'); rc(g, 2, 0, w - 4, 1, '#f8e08a'); for (let x = 5; x < w - 4; x += 6) dot(g, x, 1, '#8a6a20');
    return c; });
}
/* the deck as one set: pieces = r.deck rows [tile, x0, x1, dy0, dy1]; d = the deck's row (grid); l, w = the street's px */
export function drawDeck(V, deck, d, l, w, moving, time) {
  if (!vis(V, l, l + w)) return; const dy = d * TS;
  put(V, slab(R(w)), l, dy);
  let k = 0; for (const [t, a, b, dy0, dy1] of deck) { const xl = a * TS, xw = (b - a + 1) * TS, yt = (d + dy0) * TS; k++;
    if (t === 'ONEWAY') put(V, deckHouse(xw, -dy0, k), xl - 2, yt);
    else if (dy1 - dy0 >= 1) put(V, minaretStub(xw, dy1 - dy0 + 1), xl, yt);
    else put(V, squatDome(xw), xl, yt); }
  if (moving > 0) { const g = V.g; for (const sx of [l + 1, l + w - 5]) { const X = R(sx - V.cx); for (let i = 0; i < 9; i++) { const ph = ((time * (60 + i * 6) + i * 13) % 34), x = X + (i % 4) - (sx > l + 4 ? 0 : 0); g.fillStyle = i % 3 ? SAND.stream : SAND.streamHi; g.fillRect(x, R(dy + 10 - V.cy + ph), 2, 4); }
      g.fillStyle = 'rgba(232,196,128,0.6)'; g.fillRect(X - 2, R(dy + 10 - V.cy), 8, 6); } }
}

/* ---------------------------------------------------------------- THE WHEEL, THE VAULT */
export function drawWheel(V, wx, wy, turns, total, spin, done) {   /* a spoked brass wheel on a bracket; its turns pegged on the post; spin = radians */
  if (!vis(V, wx, wx, 40)) return; const g = V.g, X = R(wx - V.cx), Y = R(wy - V.cy);
  rc(g, X - 3, Y + 8, 6, 14, '#3a3446'); rc(g, X - 3, Y + 8, 1, 14, '#8a849a'); rc(g, X - 6, Y + 20, 12, 3, '#2a2634'); rc(g, X - 6, Y + 20, 12, 1, '#7a748a');   /* the post */
  g.strokeStyle = BR[1]; g.lineWidth = 4; g.beginPath(); g.arc(X, Y, 11, 0, 7); g.stroke(); g.strokeStyle = BR[3]; g.lineWidth = 1; g.beginPath(); g.arc(X, Y - 1, 12, 3.6, 5.4); g.stroke();
  for (let i = 0; i < 8; i++) { const a = spin + i * Math.PI / 4, ex = X + Math.cos(a) * 11, ey = Y + Math.sin(a) * 11; g.strokeStyle = BR[2]; g.lineWidth = 2; g.beginPath(); g.moveTo(X, Y); g.lineTo(R(ex), R(ey)); g.stroke(); g.fillStyle = BR[3]; g.fillRect(R(X + Math.cos(a) * 14) - 1, R(Y + Math.sin(a) * 14) - 1, 3, 3); }
  g.fillStyle = BR[2]; g.beginPath(); g.arc(X, Y, 4, 0, 7); g.fill(); g.fillStyle = BR[0]; g.beginPath(); g.arc(X, Y, 2, 0, 7); g.fill(); dot(g, X - 2, Y - 2, BR[4]);
  for (let i = 0; i < total; i++) { const on = i < turns || done; rc(g, X - 1, Y + 10 + i * 4 - 0, 2, 2, on ? '#8fd160' : '#1a1620'); if (on) glow(V, wx, wy + 11 + i * 4, 8, 0.25, '143,209,96'); }
}
const vaultSpr = rows => once('vault' + rows, () => { const H = rows * TS, [c, g] = mk(TS, H);
  rc(g, 0, 0, TS, H, '#5a4220'); rc(g, 0, 0, 2, H, BR[3]); rc(g, 14, 0, 2, H, BR[0]); rc(g, 0, 0, TS, 2, BR[4]); rc(g, 0, H - 2, TS, 2, BR[0]);
  for (let y = 4; y < H - 3; y += 8) { dot(g, 3, y, BR[4]); dot(g, 12, y, BR[4]); }
  for (let y = 0; y < H; y++) if (y % 8 === 3) rc(g, 2, y, 12, 1, '#3a2a10');
  return c; });
const GEARBLK = (() => { const pts = []; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; pts.push([Math.cos(a) * 4.2, Math.sin(a) * 4.2]); } return pts; })();
export function drawVault(V, x, y0, rows, gears, got, time) {
  if (!vis(V, x * TS, x * TS + TS, 40)) return; put(V, vaultSpr(rows), x * TS, y0 * TS); const g = V.g;
  for (let i = 0; i < gears; i++) { const cx = R(x * TS + 8 - V.cx), cy = R(y0 * TS + 7 + i * 13 - V.cy), on = i < got;
    g.fillStyle = on ? BR[3] : '#14101a'; for (const [dx, dy] of GEARBLK) g.fillRect(R(cx + dx) - 1, R(cy + dy) - 1, 2, 2); g.beginPath(); g.arc(cx, cy, 3, 0, 7); g.fill();
    g.fillStyle = on ? BR[0] : '#2a2230'; g.beginPath(); g.arc(cx, cy, 1, 0, 7); g.fill(); if (on) { dot(g, cx - 2, cy - 2, BR[4]); glow(V, x * TS + 8, y0 * TS + 7 + i * 13, 12, 0.3, '255,210,100'); } else { rc(g, cx - 4, cy - 4, 8, 1, '#5a4220'); rc(g, cx - 4, cy + 4, 8, 1, '#5a4220'); } }
}
