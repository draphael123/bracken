// src/redraw/gq4_art.js - THE GQ4 ART PASS (claude/gq4art-d): DRAWING ONLY, over the greybox the three GQ4 lanes left (GQ4L level, GQ4P Princess, GQ4Q Queen). px.js primitives only (rect/px/line/fillPoly),
// so tools/gq4art-sheet.mjs renders every piece in Node with no browser. Castle stone + iron + goblin black-and-gold + the Queen's violet. No timber, no generic logs: the one board in the set is the
// tower's CHARRED HOARDING, which is the tower's own timber and is burning. Anything that looks like fire either hurts (told) or is a grated hearth: the file says which at each piece.
//   THE QUEEN'S KNIGHT   bakeGobKnight (7 frames on the hedge knight's frame table)
//   THE BELL ROOM        drawGate (shut / open / locked open + lantern), drawPin (idle / glow / struck), drawMasterChain, drawShimmer, drawSkid, drawGalleryTrim, drawKeyFx
//   THE BURNING TOWER    drawSlitFire, drawTapestry, drawBurnGlow, drawBreach, drawOuterFace, drawCorbel, drawHoardBoard, drawPanorama, drawBurningDebris, drawTowerBoulder
//   THE QUEEN'S HALL     drawGeodeThrone, drawRoseWindow (+ drawLightPatches), drawHearth (grated / live), drawHearthJet, drawHearthPortal, drawReachPortal, drawSceptreJab, drawGalleryLadder
//   THE ROOF (P2)        drawBoulder (3 rotations) + drawBoulderBurst, drawHangGlint, drawRock + drawRockShadow, drawGreatGeode, drawSkyPortal, drawWardShell, drawRageAura
import { canvas, rect, px, line, fillPoly, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';
import { STONE } from './highcrown2_art.js';

const R = rect, S = STONE, ri = Math.round;
const PUR = ['#1a0e2e', '#2e1a52', '#4a2a82', '#7a4ad0', '#b28cff', '#e8dcff'];     // the Queen's amethyst, dark to white
const FIRE = ['#5a1408', '#b02a10', '#ff5a1c', '#ff9a2c', '#ffd36b', '#fff6c8'];    // ember to white-hot
const IRON = ['#14121a', '#2a2630', '#4a4654', '#7a7688', '#a8a4b8', '#d8d4e4'];
const GOLD = ['#5a3c0c', '#a8841c', '#d8b040', '#f4de82', '#fff8d0'];
const wave = (t, f, ph = 0) => 0.5 + 0.5 * Math.sin(t * f + ph);

/* ================= THE QUEEN'S KNIGHT: a goblin in black-and-gold plate on the hedge knight's frames (24x22, ax 11, ay 21, box 12x16) =================
   the same 7-frame table (0 stand, 1 walk, 2 swingTell, 3 swing, 4 leap, 5 walk2, 6 hurt), so every AI pick and hit box is the hedge knight's own. What makes him a goblin and not a man: the green ears
   out through the helm, a green jaw with an underbite tusk below the visor, a yellow eye in the slit. What makes him HERS: black plate, gold edging, the crown on the breast, a gold crest. */
export function bakeGobKnight() {
  const W = 24, H = 22, x0 = 11, F = 21;
  const C = { plate: '#2a2632', plateL: '#4a4458', plateD: '#15121c', gold: '#d8b040', goldL: '#f4de82', goldD: '#8a6a1c', skin: '#6faa4a', skinD: '#4f8236', skinL: '#92cf63', eye: '#ffd04a', tusk: '#f0e8d0', blade: '#c8cee0', bladeD: '#7a82a0', cloth: '#5a1830' };
  const knight = (g, { step = 0, sword = 'rest', crouch = 0, lean = 0, shieldUp = false } = {}) => {
    const x = x0 + lean, top = 4 + crouch;
    for (const s of [-1, 1]) { const fx = x + s * 2 + (s === step ? 2 : 0); R(g, fx - 1, F - 6 + Math.min(crouch, 2), 2, 6 - Math.min(crouch, 2), C.plateD); R(g, fx - 1, F - 6 + Math.min(crouch, 2), 1, 5 - Math.min(crouch, 2), C.plateL); R(g, fx - 1, F - 1, 3, 1, C.gold); }   // greaves, gold-edged sabatons
    R(g, x - 4, top + 5, 8, 9 - Math.min(crouch, 2), C.plate); R(g, x - 4, top + 5, 8, 1, C.gold); R(g, x - 4, top + 13 - Math.min(crouch, 2), 8, 1, C.goldD);                // the cuirass, gold gorget and hem
    R(g, x - 3, top + 6, 6, 7, C.cloth); R(g, x - 3, top + 6, 1, 7, C.plateL);                                                                                                // a plum tabard under the plate
    R(g, x - 2, top + 8, 4, 1, C.gold); R(g, x - 2, top + 7, 1, 1, C.gold); R(g, x + 1, top + 7, 1, 1, C.gold); R(g, x - 1, top + 9, 2, 1, C.goldD);                              // THE CROWN on the breast (three points, a band)
    R(g, x - 3, top, 7, 6, C.plate); R(g, x - 3, top, 7, 1, C.plateL); R(g, x - 3, top + 5, 7, 1, C.gold);                                                                   // the helm and its gold rim
    R(g, x, top + 2, 4, 1, '#0c0a10'); px(g, x + 2, top + 2, C.eye); px(g, x + 3, top + 2, C.eye);                                                                         // the visor slit with a yellow eye in it
    R(g, x + 1, top + 3, 3, 2, C.skin); px(g, x + 1, top + 3, C.skinL); px(g, x + 3, top + 4, C.tusk); px(g, x + 2, top + 4, C.skinD);                                        // the green jaw below the visor, a tusk
    fillPoly(g, [[x - 3, top + 1], [x - 8, top - 2], [x - 4, top + 3]], C.skin); px(g, x - 6, top - 1, C.skinL); px(g, x - 4, top + 1, C.skinD);                               // the pointed ear out through the helm (rear)
    fillPoly(g, [[x + 3, top], [x + 6, top - 3], [x + 4, top + 2]], C.skin); px(g, x + 5, top - 2, C.skinL);                                                                 // the near ear, a stub over the brow
    for (let k = 0; k < 3; k++) px(g, x - 2 + k * 2, top - 1 - (k % 2), k % 2 ? C.goldL : C.gold);                                                                           // the gold crest, three spikes
    const sy = shieldUp ? top + 1 : top + 6; R(g, x - 8, sy, 5, 9, C.plate); R(g, x - 8, sy, 5, 1, C.gold); R(g, x - 8, sy + 8, 5, 1, C.goldD); R(g, x - 8, sy, 1, 9, C.plateL); R(g, x - 7, sy + 3, 3, 1, C.gold); px(g, x - 7, sy + 2, C.gold); px(g, x - 5, sy + 2, C.gold); px(g, x - 6, sy + 2, C.goldL); R(g, x - 7, sy + 4, 3, 1, C.goldD);   // the shield: black, a gold crown
    if (sword === 'rest') { line(g, x + 4, top + 7, x + 9, top + 12, C.blade); R(g, x + 3, top + 6, 2, 2, C.gold); }
    else if (sword === 'high') { line(g, x + 3, top + 5, x + 1, top - 6, C.blade); line(g, x + 4, top + 5, x + 2, top - 6, C.bladeD); R(g, x + 2, top + 4, 3, 2, C.gold); px(g, x + 1, top - 6, '#ffffff'); }
    else if (sword === 'cut') { line(g, x + 4, top + 7, x + 12, top + 9, C.blade); line(g, x + 4, top + 8, x + 12, top + 10, C.bladeD); R(g, x + 3, top + 6, 2, 2, C.gold); for (let k = 0; k < 4; k++) px(g, x + 6 + k * 2, top + 3 + k, '#ffffff'); }
    else if (sword === 'down') { line(g, x + 4, top + 7, x + 7, F - 1, C.blade); R(g, x + 3, top + 6, 2, 2, C.gold); } };
  const mk = list => list.map(fn => { const [c, g] = canvas(W, H); fn(g); outline(c, OUT); return c; });
  const Fr = mk([g => knight(g, {}), g => knight(g, { step: 1, lean: 1 }), g => knight(g, { sword: 'high', lean: -1 }), g => knight(g, { sword: 'cut', lean: 2 }), g => knight(g, { sword: 'down', crouch: 3 }),
    g => knight(g, { step: -1, lean: 1 }), g => knight(g, { shieldUp: true, lean: -3 })]);
  return { R: Fr, L: Fr.map(flipX), white: { R: Fr.map(c => whiten(c)), L: Fr.map(c => flipX(whiten(c))) }, ax: 11, ay: 21, w: 12, h: 16 };
}

/* ================= THE BELL ROOM: gates, pins, lanterns, the master chain =================
   G = the GQ4P gate record { x, top, bot (px), pinX, pinY, box, col, open, lock, lit }. The picture reads: a stone gateway (jambs, a lintel with an arch of voussoirs), a portcullis of iron bars with spiked feet
   (SHUT = down to the sill; OPEN = raised into the lintel, only the bar-ends peeking; LOCKED OPEN = raised and bolted, two red-hot lock plates + a chain taut to the master). The lantern over the lintel is
   hung in the gate's colour: cold until a call is live. Every gate has a CHAIN PIN hung beside it (see drawPin). */
const GATE_SHUT = 0, GATE_OPEN = 1, GATE_LOCK = 2;
export function drawLantern(g, x, y, col, lit, t) {   // a hooded iron lantern with a glass of the gate's colour; lit = 0..1
  R(g, x - 1, y - 6, 3, 2, IRON[2]); R(g, x - 4, y - 4, 9, 2, IRON[1]); R(g, x - 4, y - 4, 9, 1, IRON[3]);
  R(g, x - 3, y - 2, 7, 7, IRON[0]); R(g, x - 2, y - 1, 5, 5, lit > 0 ? col : '#4a4258'); if (lit > 0) { R(g, x - 1, y, 3, 3, '#ffffff'); }
  R(g, x - 4, y + 5, 9, 1, IRON[1]); R(g, x - 3, y + 6, 7, 1, IRON[2]); R(g, x, y + 7, 1, 2, IRON[2]);
  if (lit > 0) { const k = wave(t, 12); g.save(); g.globalAlpha = 0.22 + 0.2 * k; R(g, x - 8, y - 5, 17, 14, col); g.globalAlpha = 0.1; R(g, x - 13, y - 9, 27, 22, col); g.restore(); } }
export function drawGate(g, G, cx, cy, t, fy) {
  const x = ri(G.x - cx), top = ri(G.top - cy), bot = ri(G.bot - cy), st = G.lock ? GATE_LOCK : G.open ? GATE_OPEN : GATE_SHUT, hh = bot - top, live = G.lit > 0;
  if (x < -30 || x > 350) return;
  R(g, x - 8, top - 1, 17, hh + 1, '#0a0910');                                                                        // the doorway's mouth: dark behind the bars
  for (const sx of [-1, 1]) { const jx = sx < 0 ? x - 11 : x + 8; R(g, jx, top - 3, 4, hh + 3, S.c); R(g, jx, top - 3, 1, hh + 3, S.f); R(g, jx + 3, top - 3, 1, hh + 3, S.a); for (let yy = top; yy < bot; yy += 6) R(g, jx, yy, 4, 1, S.a); }   // coursed jambs
  R(g, x - 11, top - 6, 23, 4, S.d); R(g, x - 11, top - 6, 23, 1, S.g); R(g, x - 11, top - 3, 23, 1, S.a);          // the lintel
  for (let k = -3; k <= 3; k++) { R(g, x + k * 3 - 1, top - 5, 3, 3, (k & 1) ? S.e : S.d); R(g, x + k * 3 + 1, top - 5, 1, 3, S.a); }   // voussoirs
  R(g, x - 3, top - 8, 7, 2, S.e); R(g, x - 1, top - 9, 3, 1, S.g);                                                  // the keystone
  const drop = st === GATE_SHUT ? hh - 1 : 6;                                                                         // how much of the portcullis hangs below the lintel
  const bar = st === GATE_LOCK ? '#b07a7a' : '#b4b4cc', barD = st === GATE_LOCK ? '#5a2a2a' : '#6a6a80';
  for (let xx = x - 6; xx <= x + 6; xx += 3) { R(g, xx, top - 1, 2, drop, barD); R(g, xx, top - 1, 1, drop, bar); R(g, xx, top - 1 + drop, 2, 1, '#ffffff'); if (drop > 8) px(g, xx, top + drop, '#ffffff'); }   // bars with a spiked foot
  if (st === GATE_SHUT) { for (const f of [0.32, 0.64]) R(g, x - 7, top + ri(hh * f), 15, 2, barD), R(g, x - 7, top + ri(hh * f), 15, 1, bar); }
  else if (st === GATE_OPEN) { R(g, x - 7, top + 2, 15, 1, barD); }
  if (st === GATE_LOCK) { const k = wave(t, 10); for (const sx of [-1, 1]) { const lx = sx < 0 ? x - 9 : x + 6; R(g, lx, top + 1, 4, 6, '#2a1a1a'); R(g, lx + 1, top + 2, 2, 4, k > 0.5 ? '#ff6b6b' : '#b03a3a'); px(g, lx + 1, top + 2, '#ffd0d0'); }
    for (let yy = top - 22; yy < top - 8; yy += 3) { R(g, x - 1 + ((yy / 3) & 1), yy, 2, 2, IRON[3]); } }              // the chain rising to the master
  const lx = x, ly = top - 14; R(g, lx - 1, top - 12, 3, 4, IRON[2]); drawLantern(g, lx, ly, G.col, live ? 1 : 0, t);   // the lantern on its bracket
  R(g, x - 4, bot, 9, 2, S.d); R(g, x - 4, bot, 9, 1, S.g);                                                          // the sill
}
let PIN_T = new Map();   // per gate: the time its pin was last struck (read off the open -> shut change, drawing side only)
export function drawPin(g, G, cx, cy, t, fy) {   // the chain pin: a ring in the vault, a chain to a pull-weight; idle = dull iron, glow = ringed in the gate's colour (a call is live), struck = swung out with sparks
  const px0 = ri(G.pinX - cx), py = ri(G.pinY - cy), ty = ri(G.box.t - cy), live = G.lit > 0 && G.open && !G.lock, was = PIN_T.get(G);
  if (was === undefined) PIN_T.set(G, G.open ? -9 : t - 9); else if (G._po === true && !G.open) PIN_T.set(G, t); G._po = G.open;
  const age = t - (PIN_T.get(G) ?? -9), struck = age >= 0 && age < 0.45, sw = struck ? ri(Math.sin(age * 30) * 3 * (1 - age / 0.45)) : 0;
  if (px0 < -20 || px0 > 340) return;
  R(g, px0 - 3, ty - 2, 7, 2, IRON[2]); R(g, px0 - 3, ty - 2, 7, 1, IRON[4]);                                         // the ring-plate in the vault
  for (let yy = ty; yy < py - 2; yy += 3) { const dx = ri(sw * (yy - ty) / Math.max(8, py - ty)); R(g, px0 + dx, yy, 2, 2, IRON[3]); R(g, px0 + dx, yy, 1, 1, IRON[5]); R(g, px0 + dx + 1, yy + 1, 1, 1, IRON[1]); }   // chain links
  const bx = px0 + sw;
  R(g, bx - 3, py - 3, 7, 8, IRON[0]); R(g, bx - 2, py - 2, 5, 6, live ? G.col : struck ? '#e8e8f4' : IRON[2]); R(g, bx - 2, py - 2, 5, 1, IRON[5]); R(g, bx - 1, py + 3, 3, 1, IRON[1]); R(g, bx - 1, py + 5, 3, 2, IRON[3]);   // the pull-weight
  if (live) { const k = wave(t, 12); g.save(); g.globalAlpha = 0.45 * k; R(g, bx - 6, py - 7, 13, 16, G.col); g.restore(); const r = 5 + ((t * 20) & 3); for (const [dx, dy] of [[-r, 0], [r, 0], [0, -r - 2]]) px(g, bx + dx, py + dy, '#ffffff'); }
  if (struck) { for (let i = 0; i < 5; i++) { const a = i * 1.3 + age * 9, d = 4 + age * 22; px(g, ri(bx + Math.cos(a) * d), ri(py + Math.sin(a) * d * 0.7), i & 1 ? '#fff6c8' : '#ffd36b'); } }
}
export function drawMasterChain(g, o) {   // the master chain: from the winding drum over the landing out along the vault to each gate's lintel; k 0 slack (a drooping catenary) .. 1 taut, lit = it glows (ALL GATES)
  const { xs, drum, y, k, t, lit } = o; const pts = [...xs].sort((a, b) => a - b);
  const link = (x, yy, i) => { R(g, x, yy, 2, 2, lit ? '#ffd36b' : IRON[3]); R(g, x, yy, 1, 1, lit ? '#fff6c8' : IRON[5]); if (i & 1) R(g, x + 1, yy, 1, 2, lit ? '#a8841c' : IRON[1]); };
  R(g, drum - 6, y - 6, 13, 9, IRON[1]); R(g, drum - 6, y - 6, 13, 2, IRON[3]); for (let i = -4; i <= 4; i += 2) R(g, drum + i, y - 4, 1, 6, IRON[0]); R(g, drum - 1, y - 2, 3, 3, GOLD[2]);   // the drum
  for (const gx of pts) { const x0 = Math.min(gx, drum), x1 = Math.max(gx, drum), n = Math.max(2, (x1 - x0) / 3 | 0);
    for (let i = 0; i <= n; i++) { const u = i / n, x = ri(x0 + (x1 - x0) * u), sag = ri((1 - k) * 9 * Math.sin(u * Math.PI)); link(x, y + sag + ((gx > drum ? u : 1 - u) * 4 | 0), i); }
    for (let yy = y + 5; yy < y + 14; yy += 3) link(gx, yy, yy); }
  if (lit) { g.save(); g.globalAlpha = 0.25 * wave(t, 14); R(g, pts[0] - 6, y - 3, pts[pts.length - 1] - pts[0] + 12, 8, '#ffd36b'); g.restore(); }
}
export function drawShimmer(g, x, y, t) {   // her invincible shell: a faceted pale-crystal egg, glints sliding across it. (x, y) = her feet; she is ~ 28 px tall
  const cx = x, cy = y - 16, rx = 13, ry = 18, k = wave(t, 9);
  g.save(); g.globalAlpha = 0.2 + 0.1 * k; for (let yy = -ry; yy <= ry; yy++) { const w = ri(rx * Math.sqrt(1 - (yy / ry) ** 2)); R(g, cx - w, cy + yy, 2 * w + 1, 1, '#bfe8ff'); } g.restore();
  for (let a = 0; a < 40; a++) { const th = a / 40 * Math.PI * 2, X = ri(cx + Math.cos(th) * rx), Y = ri(cy + Math.sin(th) * ry); px(g, X, Y, a % 5 === 0 ? '#ffffff' : a & 1 ? '#8fd1ff' : '#bfe8ff'); }
  for (const f of [-0.5, 0.1, 0.6]) { const xx = ri(cx + f * rx), h = ri(ry * Math.sqrt(1 - f * f)); g.save(); g.globalAlpha = 0.45; R(g, xx, cy - h + 2, 1, 2 * h - 4, '#e8f8ff'); g.restore(); }   // facet lines
  const gl = ((t * 14) % 26) - 13; g.save(); g.globalAlpha = 0.7; for (let yy = -ry + 3; yy < ry - 3; yy++) { const w = rx * Math.sqrt(1 - (yy / ry) ** 2), xx = gl + yy * 0.4; if (Math.abs(xx) < w) R(g, ri(cx + xx), cy + yy, 2, 1, '#ffffff'); } g.restore();
  R(g, cx - 1, cy - ry - 2, 3, 2, '#e8f8ff'); px(g, cx, cy - ry - 3, '#ffffff'); px(g, cx - 1, cy + ry + 1, '#8fd1ff'); px(g, cx + 1, cy + ry + 1, '#8fd1ff'); }
export function drawSkid(g, x0, x1, fy, t, hot) {   // the pirouette's skid line: scuffed chevrons along her path and a heel-mark at the end; told = it flashes red
  const a = Math.min(x0, x1), b = Math.max(x0, x1), dir = x1 >= x0 ? 1 : -1;
  for (let xx = a; xx < b; xx += 8) { const j = ri(xx / 8) % 3; R(g, ri(xx), fy - 1, 5, 1, hot ? '#ff6b6b' : '#a04040'); if (j === 1) R(g, ri(xx) + 1, fy - 2, 2, 1, hot ? '#ffb0b0' : '#7a3030'); }
  for (let i = 0; i < 4; i++) { const xx = ri(x1 - dir * (6 + i * 7)); R(g, xx, fy - 5 + i, 1, 4 - i, hot ? '#ffd36b' : '#a8841c'); R(g, xx + dir, fy - 4 + i, 1, 2, hot ? '#ffd36b' : '#a8841c'); }
  R(g, ri(x1) - 1, fy - 9, 2, 9, hot ? '#fff6c8' : GOLD[2]); }
export function drawKeyFx(g, x, y, k, t) {   // her key turning in the gate's lock: a ring of tumbling gold motes and a rattle line; k 0..1 through the 1.2 s tell
  for (let i = 0; i < 4; i++) { const a = t * 9 + i * 1.57, r = 3 + k * 7; px(g, ri(x + Math.cos(a) * r), ri(y + Math.sin(a) * r * 0.6), i & 1 ? '#fff6c8' : '#e0c04a'); }
  if (((t * 16) & 1) === 0) { R(g, x - 8, y + 6, 3, 1, '#c9c9d6'); R(g, x + 6, y + 8, 3, 1, '#c9c9d6'); } }
export function drawGalleryTrim(g, x0, x1, y, cx, cy, VW) {   // the side galleries (one-way, row 14): a stone balustrade of little columns along the back edge, and a carved corbel under each end. x0..x1 in px (world)
  const a = ri(x0 - cx), b = ri(x1 - cx), yy = ri(y - cy); if (b < -10 || a > VW + 10) return;
  R(g, a, yy - 9, b - a, 2, S.d); R(g, a, yy - 9, b - a, 1, S.g);                                                    // the handrail
  for (let xx = a + 3; xx < b - 2; xx += 5) { R(g, xx, yy - 7, 3, 7, S.c); R(g, xx, yy - 7, 1, 7, S.f); R(g, xx - 1, yy - 7, 5, 1, S.e); R(g, xx - 1, yy - 1, 5, 1, S.e); }   // balusters
  R(g, a, yy + 1, b - a, 3, S.b); R(g, a, yy + 1, b - a, 1, S.e);                                                    // the slab's edge
  for (const e of [a + 2, b - 8]) { R(g, e, yy + 4, 7, 2, S.d); R(g, e + 1, yy + 6, 5, 2, S.c); R(g, e + 2, yy + 8, 3, 3, S.b); R(g, e, yy + 4, 7, 1, S.f); } }
export function drawGalleryLadder(g, x, topY, botY, cx, cy, VW) {   // an iron-railed ladder up the stone: two rails with rivets, round rungs (NOT timber), a gold-capped top post
  const X = ri(x - cx), a = ri(topY - cy), b = ri(botY - cy); if (X < -10 || X > VW + 10) return;
  R(g, X - 4, a - 4, 2, b - a + 4, IRON[2]); R(g, X + 3, a - 4, 2, b - a + 4, IRON[2]); R(g, X - 4, a - 4, 1, b - a + 4, IRON[4]); R(g, X + 3, a - 4, 1, b - a + 4, IRON[4]);
  for (let yy = a; yy < b; yy += 4) { R(g, X - 2, yy, 5, 1, IRON[3]); R(g, X - 2, yy + 1, 5, 1, IRON[0]); }
  R(g, X - 5, a - 7, 3, 3, GOLD[2]); R(g, X + 4, a - 7, 3, 3, GOLD[2]); px(g, X - 5, a - 7, GOLD[4]); px(g, X + 4, a - 7, GOLD[4]); R(g, X - 5, b - 2, 11, 2, S.d); }

/* ================= THE BURNING TOWER (storeys 5-7, the breach, the outside, the panorama) ================= */
export function drawSlitFire(g, x, y, t, seed = 0) {   // an arrow-slit in the wall with the burning castle showing through: a tall lancet of orange, a dark mullion, sparks drifting past. (x, y) = its centre
  R(g, x - 4, y - 14, 8, 28, S.dk); R(g, x - 3, y - 13, 6, 26, S.a);
  for (let yy = -12; yy <= 12; yy++) { const w = yy < -8 ? 1 + ((yy + 12) >> 1) : 2, k = wave(t, 4, yy * 0.4 + seed), c = yy < -2 ? FIRE[3] : yy < 6 ? FIRE[2] : FIRE[1]; R(g, x - w, y + yy, 2 * w, 1, k > 0.6 ? FIRE[4] : c); }
  R(g, x, y - 12, 1, 25, S.dk); R(g, x - 3, y - 2, 6, 1, S.dk);                                                      // the mullion and its bar
  g.save(); g.globalAlpha = 0.16 + 0.1 * wave(t, 3, seed); R(g, x - 12, y - 18, 24, 36, FIRE[2]); g.restore();      // the glow it throws on the wall
  const ph = (t * 1.4 + seed) % 1; px(g, x - 1 + ri(Math.sin(t * 3 + seed) * 2), y + 10 - ri(ph * 22), FIRE[5]); px(g, x + 1, y + 6 - ri(((t * 1.9 + seed * 2) % 1) * 18), FIRE[4]); }
export function drawTapestry(g, x, fy, h, state, t) {   // a hanging tapestry: state 'cold' | 'spark' (embers run up it: it will flare) | 'flare' (burning; it HURTS). x = its left px, fy = the floor line, h = its length
  const w = 14, ty = fy - h;
  R(g, x - 1, ty - 2, w + 2, 3, IRON[1]); R(g, x - 1, ty - 2, w + 2, 1, IRON[3]); R(g, x - 2, ty - 3, 2, 5, GOLD[1]); R(g, x + w, ty - 3, 2, 5, GOLD[1]);   // the iron rod with gold finials
  const body = state === 'flare' ? '#3a1410' : '#7a1c3a';
  R(g, x, ty + 1, w, h - 12, body); for (let yy = ty + 3; yy < ty + h - 14; yy += 6) { R(g, x + 2, yy, w - 4, 1, state === 'flare' ? '#5a2218' : GOLD[2]); }
  R(g, x + 5, ty + h * 0.3, 4, 4, state === 'flare' ? '#5a2218' : GOLD[3]); R(g, x + 4, ty + h * 0.3 + 4, 6, 2, state === 'flare' ? '#5a2218' : GOLD[2]);   // a gold crown device
  for (let i = 0; i < 4; i++) R(g, x + i * 4, ty + h - 12 + (i & 1) * 2, 3, 12 - (i & 1) * 2, body);                  // the tattered hem
  if (state === 'flare') { for (let i = 0; i < 7; i++) { const fh = 7 + 9 * wave(t, 11, i * 1.7), fx = x + i * 2; R(g, fx, fy - 12 - fh, 2, fh + 8, i & 1 ? FIRE[4] : FIRE[3]); R(g, fx, fy - 12 - fh * 0.4, 2, fh * 0.4 + 4, FIRE[2]); } for (let i = 0; i < 4; i++) { const ph = (t * 2 + i * 0.3) % 1; px(g, x + 2 + i * 3, fy - 24 - ri(ph * 22), FIRE[5]); } }
  else if (state === 'spark') for (let i = 0; i < 5; i++) { const ph = (t * 1.6 + i * 0.25) % 1; px(g, x + 1 + i * 3, ty + h - 14 - ri(ph * (h - 26)), i & 1 ? FIRE[4] : FIRE[2]); R(g, x + i * 3, ty + h - 13, 2, 1, FIRE[1]); } }
export function drawBurnGlow(g, x0, x1, ty, h, t, k = 0) {   // a storey's red ceiling: a smoulder band along the vault, hot cracks in the plaster, a few embers hanging
  g.save(); g.globalAlpha = 0.16 + 0.07 * wave(t, 3, k); R(g, x0, ty, x1 - x0, h, '#ff3a1c'); g.globalAlpha = 0.14; R(g, x0, ty, x1 - x0, h >> 1, '#ff9a2c'); g.restore();
  for (let x = x0 + 6; x < x1; x += 19) { const on = Math.sin(t * 5 + x * 0.3 + k) > 0.1; R(g, x, ty + 1, 7, 1, on ? FIRE[3] : FIRE[1]); R(g, x + 2, ty + 2, 1, 3, on ? FIRE[2] : FIRE[0]); R(g, x + 4, ty + 2, 1, 2, FIRE[1]); if (on) px(g, x + 3, ty + 5 + ri(wave(t, 4, x) * 3), FIRE[4]); } }
export function drawBreach(g, x, y0, y1, t) {   // storey 7's blown-out east wall: broken courses with a jagged lip, the hot ends of charred beams, fresh orange light spilling in. x = the breach's inside edge
  for (let yy = y0; yy < y1; yy += 5) { const j = (yy * 7 >> 2) % 4; R(g, x - 3 - j, yy, 3 + j, 5, S.c); R(g, x - 3 - j, yy, 3 + j, 1, S.f); R(g, x - 3 - j, yy + 4, 3 + j, 1, S.dk); if (!(yy & 8)) R(g, x - 5 - j, yy + 1, 2, 3, S.b); }
  for (const yy of [y0 + 10, y0 + 38, y0 + 64]) { R(g, x - 12, yy, 12, 3, '#2a1a12'); R(g, x - 12, yy, 3, 3, FIRE[wave(t, 6, yy) > 0.5 ? 3 : 2]); px(g, x - 11, yy + 1, FIRE[5]); }
  g.save(); g.globalAlpha = 0.14 + 0.08 * wave(t, 5); R(g, x - 40, y0, 40, y1 - y0, FIRE[2]); g.restore(); }
export function drawOuterFace(g, x0, x1, y0, y1, cx, cy, t) {   // the tower's OUTER WALL FACE: big ashlar courses with weathering, a scorched streak above every slit, arrow loops, no timber
  const a = ri(x0 - cx), b = ri(x1 - cx), ya = ri(y0 - cy), yb = ri(y1 - cy);
  R(g, a, ya, b - a, yb - ya, S.b);
  for (let yy = ya; yy < yb; yy += 12) { const off = ((yy - ya) / 12 | 0) % 2 ? 11 : 0; R(g, a, yy + 11, b - a, 1, S.a); for (let xx = a - off; xx < b; xx += 22) { R(g, xx, yy, 1, 12, S.a); R(g, xx + 1, yy, 20, 1, S.c); if (((xx + yy) & 7) === 0) R(g, xx + 4, yy + 3, 6, 4, S.c); } }
  for (let yy = ya + 20; yy < yb - 20; yy += 54) { const xx = a + 18 + ((yy * 3) % 40); R(g, xx, yy, 3, 14, S.dk); R(g, xx - 1, yy + 5, 5, 3, S.dk); R(g, xx - 2, yy - 18, 7, 18, '#1a1618'); R(g, xx - 1, yy - 12, 5, 12, '#241c1c'); }   // loops with soot above
  g.save(); g.globalAlpha = 0.1 + 0.06 * wave(t, 2); R(g, a, ya, b - a, yb - ya, FIRE[1]); g.restore(); }
export function drawCorbel(g, x, y, w = 28) {   // a stone corbel / ledge jutting from the face: three stepped courses over a carved bracket and a gargoyle-less boss
  R(g, x, y, w, 4, S.e); R(g, x, y, w, 1, S.g); R(g, x, y + 4, w, 1, S.a);
  R(g, x + 3, y + 5, w - 6, 3, S.d); R(g, x + 6, y + 8, w - 12, 3, S.c); R(g, x + (w >> 1) - 2, y + 11, 4, 3, S.b); px(g, x + (w >> 1), y + 12, S.f);
  for (let xx = x + 2; xx < x + w - 2; xx += 7) R(g, xx, y + 1, 1, 3, S.c); }
export function drawHoardBoard(g, bx, by, state, t) {   // the broken hoarding: a stone bracket under a CHARRED board. state 'ok' | 'creak' (it shakes, glows at the cracks: told) | 'gone' draws only the bracket. bx = left, by = top of the board, 32 px wide
  R(g, bx + 2, by + 4, 4, 9, S.d); R(g, bx + 2, by + 4, 4, 1, S.g); R(g, bx + 26, by + 4, 4, 9, S.d); R(g, bx + 26, by + 4, 4, 1, S.g); R(g, bx + 1, by + 12, 6, 2, S.c); R(g, bx + 25, by + 12, 6, 2, S.c);
  if (state === 'gone') return;
  const sh = state === 'creak' ? ri(Math.sin(t * 40) * 1.5) : 0, y = by + sh;
  R(g, bx, y, 32, 4, '#2a1c14'); R(g, bx, y, 32, 1, '#4a3424'); R(g, bx + 15, y, 1, 4, '#0c0806'); for (const n of [4, 11, 21, 28]) px(g, bx + n, y + 1, '#8a8a9a');   // charred planks, a split, four iron nails
  R(g, bx + 3, y + 3, 7, 1, '#120a06'); R(g, bx + 18, y + 3, 9, 1, '#120a06');
  if (state === 'creak') { const k = wave(t, 16); R(g, bx + 5, y - 1, 3, 1, k > 0.5 ? FIRE[4] : FIRE[2]); R(g, bx + 21, y - 1, 3, 1, k > 0.5 ? FIRE[2] : FIRE[4]); R(g, bx + 14, y + 4, 4, 1, FIRE[2]); px(g, bx + 15, y + 5 + ri(k * 3), FIRE[5]); } }
export function drawPanorama(g, cx, cy, VW, VH, t) {   // the BURNING CASTLE below the tower: far silhouettes of walls, keeps and spires, every window a fire, smoke columns lit from beneath, drifting. Parallax 0.25 (cx * 0.25 passed in the shift)
  const sx = ri(cx * 0.25);
  g.save(); R(g, 0, 0, VW, VH, '#1a0a14'); g.globalAlpha = 0.5; R(g, 0, ri(VH * 0.45), VW, ri(VH * 0.55), '#6a1c10'); g.globalAlpha = 0.35; R(g, 0, ri(VH * 0.7), VW, ri(VH * 0.3), '#ff5a1c'); g.restore();
  const base = ri(VH * 0.8);
  for (const [off, w, h, col, win] of [[0, 54, 80, '#26141c', 1], [58, 40, 120, '#2a1620', 1], [102, 70, 60, '#26141c', 1], [178, 34, 150, '#2e1822', 1], [216, 60, 70, '#26141c', 1], [282, 46, 110, '#2a1620', 1], [332, 62, 54, '#26141c', 1], [398, 38, 132, '#2e1822', 1]]) {
    const bx = ((off * 1.0 - sx) % 520 + 520) % 520 - 60, hh = h; if (bx > VW || bx + w < 0) continue;
    R(g, bx, base - hh, w, hh + 40, col); for (let xx = bx; xx < bx + w; xx += 8) R(g, xx, base - hh - 3, 4, 3, col);                                   // crenellations
    if (h > 100) { fillPoly(g, [[bx + 2, base - hh - 3], [bx + w - 2, base - hh - 3], [bx + (w >> 1), base - hh - 22]], '#3a1c26'); }                       // a spire
    if (win) for (let yy = base - hh + 10; yy < base - 6; yy += 20) for (let xx = bx + 6; xx < bx + w - 6; xx += 14) { const k = wave(t, 3, xx * 0.17 + yy * 0.1); R(g, xx, yy, 3, 6, k > 0.55 ? FIRE[4] : k > 0.25 ? FIRE[3] : FIRE[2]); } }
  for (let i = 0; i < 7; i++) { const x = ((i * 79 - sx * 1.3) % (VW + 80) + VW + 80) % (VW + 80) - 40; for (let j = 0; j < 8; j++) { const y = base - 40 - j * 18 - ri(((t * 8 + i * 13) % 18)); const w = 8 + j * 2; g.save(); g.globalAlpha = Math.max(0.05, 0.3 - j * 0.035); R(g, x + ri(Math.sin(t + j + i) * 5), y, w, 10, j < 2 ? '#7a2a14' : '#2a1a20'); g.restore(); } }   // smoke columns
  for (let i = 0; i < 16; i++) { const x = ((i * 53 + t * 18 - sx) % (VW + 20) + VW + 20) % (VW + 20) - 10, y = VH - ((t * 24 + i * 29) % VH); px(g, ri(x), ri(y), i & 1 ? FIRE[4] : FIRE[3]); } }
export function drawBurningDebris(g, x, y, t, spin = 0) {   // a falling roof beam, alight: 3x10 charred timber (the tower's own, burning) with a flame trail. (x, y) = its centre
  const k = (Math.floor(t * 14 + spin) & 3); R(g, x - 2, y - 7, 5, 15, '#241810'); R(g, x - 2, y - 7, 1, 15, '#4a3424'); R(g, x - 3, y - 2 + (k & 1), 7, 2, '#120a06');
  for (let i = 0; i < 4; i++) { const hh = 6 + i * 4 + ((k + i) & 3); g.save(); g.globalAlpha = 0.9 - i * 0.18; R(g, x - 2 + (i & 1), y - 8 - hh, 4, hh, i & 1 ? FIRE[3] : FIRE[2]); R(g, x - 1, y - 8 - hh * 0.5, 2, hh * 0.5, FIRE[4]); g.restore(); }
  px(g, x + 3, y - 12 - k, FIRE[5]); px(g, x - 4, y - 18 + k, FIRE[4]); }
export function drawDebrisShadow(g, x, fy, k, t) {   // the told landing ring: a flat dark ellipse that tightens and reddens as it nears (k 0..1)
  const w = ri(16 - 6 * k), hot = k > 0.6 && (Math.floor(t * 20) & 1);
  g.save(); g.globalAlpha = 0.3 + 0.5 * k; for (let i = -2; i <= 2; i++) { const ww = ri(w * Math.sqrt(1 - (i / 3) ** 2)); R(g, x - ww, fy - 2 + i, 2 * ww, 1, hot ? '#ff6b6b' : '#120a10'); } g.restore(); }
export function drawTowerBoulder(g, x, y, t, state) {   // the boulder the Queen drops from the parapet: grey-violet rock with a geode vein; 'back' (sent back up) = white-hot rim
  const r = (Math.floor(t * 12) & 3), hot = state === 'back';
  drawBoulder(g, x, y, r, hot);
  if (state === 'fall') { g.save(); g.globalAlpha = 0.55; for (let i = 1; i < 4; i++) R(g, x - 2, y - 14 - i * 8, 5, 6, FIRE[2]); g.restore(); } }

/* ================= THE QUEEN'S HALL (P1) ================= */
export function drawGeodeThrone(g, tx, fy, lit, t) {   // GEODE THRONE: a great amethyst cluster growing out of the back wall behind the dais, grinding rock (the geodes come out of it). tx = its centre px, fy = the floor line
  const k = wave(t, 4), glowA = (lit ? 0.35 : 0.14) + 0.08 * k;
  g.save(); g.globalAlpha = glowA; for (let r = 60; r > 10; r -= 10) { for (let yy = -r; yy <= r; yy++) { const w = ri(r * 1.15 * Math.sqrt(1 - (yy / r) ** 2)); R(g, tx - w, fy - 50 + yy, 2 * w, 1, '#b28cff'); } } g.restore();
  R(g, tx - 52, fy - 14, 104, 14, '#1e1626'); for (let xx = -50; xx < 50; xx += 9) R(g, tx + xx, fy - 18 - (xx * 7 & 5), 8, 8, '#2c2036');     // the matrix rock it grows from
  const cr = [[-44, 44, 6, 1], [-34, 66, 9, 0], [-20, 56, 7, 1], [-12, 90, 11, 0], [2, 108, 13, 1], [16, 84, 10, 0], [28, 62, 8, 1], [38, 72, 9, 0], [48, 40, 6, 1]];
  for (const [dx, h, w, sh] of cr) { const bx = tx + dx, by = fy - 12, hi = lit ? 5 : 4;
    fillPoly(g, [[bx - w, by], [bx - w + 2, by - h + 10], [bx, by - h], [bx + w - 2, by - h + 10], [bx + w, by]], PUR[1]);                                                       // the prism body
    fillPoly(g, [[bx - w, by], [bx - w + 2, by - h + 10], [bx, by - h], [bx - 1, by]], PUR[2]);                                                                              // its lit face
    fillPoly(g, [[bx - w + 3, by - 2], [bx - w + 4, by - h + 14], [bx - 1, by - h + 4], [bx - 3, by - 2]], lit ? PUR[hi] : PUR[3]);                                          // the bright facet
    R(g, bx - w + 3, by - h + 14 + (sh ? 6 : 0), 1, ri(h * 0.4), PUR[5]); px(g, bx, by - h, PUR[5]); }
  for (let i = 0; i < 6; i++) { const ph = (t * 0.8 + i * 0.37) % 1; if (lit || ph < 0.2) px(g, tx - 40 + i * 16, fy - 20 - ri(((t * 30 + i * 11) % 60)), '#e8dcff'); }   // grit and glints; more when it grinds
  if (lit) { g.save(); g.globalAlpha = 0.5 * k; R(g, tx - 10, fy - 118, 20, 3, '#fff6c8'); R(g, tx - 1, fy - 124, 3, 15, '#fff6c8'); g.restore(); } }
export function drawRoseWindow(g, x, y, t, r = 30) {   // THE ROSE WINDOW over the throne: a stone ring with twelve spokes of tracery, glass in violet and gold alternately, a gold boss at the hub. (x, y) = centre
  for (let yy = -r - 3; yy <= r + 3; yy++) { const w = ri(Math.sqrt(Math.max(0, (r + 3) ** 2 - yy * yy))); R(g, x - w, y + yy, 2 * w, 1, S.d); }
  for (let yy = -r; yy <= r; yy++) { const w = ri(Math.sqrt(Math.max(0, r * r - yy * yy))); R(g, x - w, y + yy, 2 * w, 1, '#1a1030'); }
  for (let i = 0; i < 12; i++) { const a0 = i / 12 * Math.PI * 2, col = i & 1 ? '#e0b040' : '#7a4ad0', hi = i & 1 ? '#fff0a0' : '#b28cff';
    for (let rr = 7; rr < r - 1; rr++) { for (const da of [-0.1, -0.05, 0, 0.05, 0.1]) { const a = a0 + da * (r / rr) * 0.8; px(g, ri(x + Math.cos(a) * rr), ri(y + Math.sin(a) * rr), rr > r * 0.6 && da === 0 ? hi : col); } } }
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + 0.26; for (let rr = 5; rr <= r; rr++) px(g, ri(x + Math.cos(a) * rr), ri(y + Math.sin(a) * rr), S.e); }   // the spokes of tracery
  for (let a = 0; a < 48; a++) { const th = a / 48 * Math.PI * 2; px(g, ri(x + Math.cos(th) * (r - 1)), ri(y + Math.sin(th) * (r - 1)), S.f); px(g, ri(x + Math.cos(th) * 9), ri(y + Math.sin(th) * 9), S.f); }
  R(g, x - 4, y - 4, 9, 9, GOLD[1]); R(g, x - 3, y - 3, 7, 7, GOLD[2]); R(g, x - 1, y - 1, 3, 3, GOLD[4]); px(g, x - 3, y - 3, GOLD[4]);
  g.save(); g.globalAlpha = 0.1 + 0.06 * wave(t, 1.3); R(g, x - r, y - r, 2 * r, 2 * r, '#b28cff'); g.restore(); }
export function drawLightPatches(g, lx, fy, t, i) {   // a patch of rose-window light on the floor: a slanted parallelogram, violet or gold, with the window's tracery cast as dark cross-bars. (lx = left px)
  const col = i & 1 ? '#ffd36b' : '#b28cff', dr = ri(Math.sin(t * 0.3 + i) * 2);
  g.save(); g.globalAlpha = 0.13; for (let yy = 0; yy < 14; yy++) R(g, lx + dr + yy, fy - 14 + yy, 24, 1, col); g.globalAlpha = 0.07; R(g, lx + dr + 6, fy - 8, 14, 2, '#12101a'); g.restore(); }
export function drawHearth(g, x, fy, live, t, tell) {   // a GRATED HEARTH: a stone surround with a carved lintel, an iron grille across a mouth that is a dull orange smoulder (CONTAINED: smoke only). live = she has called it: the grille glows, the mouth blazes (it will HURT: told)
  R(g, x - 17, fy - 32, 34, 32, S.c); R(g, x - 17, fy - 32, 34, 2, S.g); R(g, x - 17, fy - 32, 2, 32, S.d); R(g, x + 15, fy - 32, 2, 32, S.a); R(g, x - 19, fy - 36, 38, 4, S.e); R(g, x - 19, fy - 36, 38, 1, S.g);
  for (let xx = x - 14; xx < x + 14; xx += 7) R(g, xx, fy - 30, 5, 3, S.e);                                                                      // lintel studs
  R(g, x - 12, fy - 24, 24, 24, '#0a0810'); R(g, x - 12, fy - 24, 24, 2, S.dk);
  const k = wave(t, live ? 14 : 2.4);
  if (live) { for (let yy = 0; yy < 22; yy++) R(g, x - 11, fy - 22 + yy, 22, 1, yy < 8 ? FIRE[3] : FIRE[2]); R(g, x - 6, fy - 12, 12, 11, FIRE[4]); R(g, x - 3, fy - 8, 6, 7, FIRE[5]); for (let i = 0; i < 5; i++) { const fh = 6 + 8 * wave(t, 18, i * 1.9); R(g, x - 10 + i * 5, fy - 22 - fh * 0.2, 3, fh, i & 1 ? FIRE[4] : FIRE[3]); } }
  else { R(g, x - 10, fy - 6, 20, 6, FIRE[1]); R(g, x - 7, fy - 5, 14, 5, k > 0.5 ? FIRE[2] : FIRE[1]); R(g, x - 3, fy - 3, 6, 3, FIRE[3]); R(g, x - 8, fy - 9, 3, 3, '#3a2418'); R(g, x + 3, fy - 8, 4, 2, '#3a2418'); }   // logs? no: a bed of coals and ash
  for (let xx = -9; xx <= 9; xx += 4) { R(g, x + xx, fy - 24, 2, 24, live ? '#ffb08a' : IRON[3]); R(g, x + xx, fy - 24, 1, 24, live ? '#fff0d8' : IRON[5]); } for (const yy of [-17, -9]) R(g, x - 12, fy + yy, 24, 2, live ? '#ff9a5c' : IRON[2]);   // the grille: bars and two cross-straps
  R(g, x - 3, fy - 28, 7, 3, GOLD[1]); R(g, x - 2, fy - 29, 5, 1, GOLD[2]); px(g, x, fy - 28, GOLD[4]);                                           // a gold crown boss on the lintel
  if (!live) { g.save(); g.globalAlpha = 0.45; for (let s = 0; s < 3; s++) { const ph = (t * 0.7 + s * 0.33) % 1; R(g, x - 6 + s * 5 + ri(Math.sin(t * 2 + s) * 3), fy - 38 - ri(ph * 26), 4, 4, '#6a6a78'); } g.restore(); }
  if (tell) { g.save(); g.globalAlpha = 0.5; for (let s = 0; s < 6; s++) { const ph = (t * 1.3 + s * 0.17) % 1; R(g, x - 10 + s * 4 + ri(Math.sin(t * 3 + s) * 3), fy - 40 - ri(ph * 30), 5, 5, '#6a6a78'); } g.restore(); } }
export function drawHearthJet(g, x0, x1, fy, age, dur, t) {   // THE JET (hurts, told): a racing sheet of flame along the floor at knee height, a white-hot core, a licking crest, embers thrown up. x0 = the hearth's mouth, x1 = the front; age/dur 0..1
  const lo = Math.min(x0, x1), w = Math.abs(x1 - x0), fade = Math.max(0, 1 - age / dur);
  g.save(); g.globalAlpha = 0.9 * fade;
  for (let x = 0; x < w; x += 3) { const h0 = 9 + 9 * wave(t, 24, x * 0.35), hh = ri(h0 * (0.6 + 0.4 * Math.min(1, (w - x) / 20 + 0.3)));
    R(g, lo + x, fy - hh, 3, hh, FIRE[2]); R(g, lo + x, fy - ri(hh * 0.75), 3, ri(hh * 0.75), FIRE[3]); R(g, lo + x, fy - ri(hh * 0.45), 3, ri(hh * 0.45), FIRE[4]); R(g, lo + x, fy - 3, 3, 3, FIRE[5]); if (x % 9 === 0) R(g, lo + x, fy - hh - 3, 2, 3, FIRE[3]); }
  g.restore(); for (let i = 0; i < 8; i++) px(g, lo + ((i * 31 + t * 90) % Math.max(1, w)) | 0, fy - 14 - ((i * 7 + t * 40) % 20) | 0, i & 1 ? FIRE[5] : FIRE[4]);
  g.save(); g.globalAlpha = 0.18 * fade; R(g, lo, fy - 30, w, 30, FIRE[2]); g.restore(); }
export function drawHearthPortal(g, x, y, k, t, col = '#ff9a5c') {   // the portal she opens in a hearth's mouth and across the hall (k 0..1): a violet ring edged in ember, a dark mouth, heat shimmer
  drawRing(g, x, y, k, t, col, '#2a1020'); g.save(); g.globalAlpha = 0.3 * k; for (let i = 0; i < 4; i++) R(g, x - 3 + i * 2, y - 14 - i * 3 - ri(wave(t, 9, i) * 3), 2, 5, FIRE[3]); g.restore(); }
function drawRing(g, x, y, k, t, edge, mouth) {   // the shared portal: an ellipse ring of pixels, a dark mouth, a rotating bright arc
  const rx = ri(5 + 5 * k), ry = ri(10 + 6 * k);
  for (let yy = -ry; yy <= ry; yy++) { const w = ri(rx * Math.sqrt(1 - (yy / ry) ** 2)); R(g, x - w, y + yy, 2 * w + 1, 1, mouth); }
  for (let a = 0; a < 36; a++) { const th = a / 36 * Math.PI * 2; px(g, ri(x + Math.cos(th) * rx), ri(y + Math.sin(th) * ry), edge); }
  for (let a = 0; a < 9; a++) { const th = t * 3 + a * 0.18; px(g, ri(x + Math.cos(th) * (rx - 1)), ri(y + Math.sin(th) * (ry - 1)), '#ffffff'); } }
export function drawReachPortal(g, x, y, k, t) {   // THE REACH's rear portal (white rim + a chime star): the rim brightens through the 0.8 s tell
  drawRing(g, x, y, k, t, '#ffffff', '#1a1030'); const s = wave(t, 14); if (k > 0.5) { px(g, x, y - 18, '#ffffff'); R(g, x - 2, y - 18, 5, 1, '#e8dcff'); R(g, x, y - 20, 1, 5, '#e8dcff'); } g.save(); g.globalAlpha = 0.2 + 0.2 * k * s; R(g, x - 9, y - 16, 19, 33, '#e8dcff'); g.restore(); }
export function drawSceptreJab(g, x, y, dir, len, t) {   // THE SCEPTRE out of the portal: a gold shaft with a violet head, chest height; len px out from the ring. (x, y) = the ring centre
  const x1 = x + dir * len, a = Math.min(x, x1), w = Math.abs(len);
  R(g, a, y - 1, w, 3, GOLD[1]); R(g, a, y - 1, w, 1, GOLD[3]); for (let i = 6; i < w; i += 10) R(g, x + dir * i - 1, y - 2, 2, 5, GOLD[2]);
  const hx = x1 + dir * 1; R(g, hx - 4, y - 5, 9, 11, PUR[1]); R(g, hx - 3, y - 4, 7, 9, PUR[3]); R(g, hx - 1, y - 3, 3, 5, PUR[5]); px(g, hx - 2, y - 4, '#ffffff');
  for (const sx of [-1, 1]) R(g, hx + sx * 4 - 1, y - 7, 2, 3, GOLD[2]); g.save(); g.globalAlpha = 0.4 * wave(t, 18); R(g, hx - 8, y - 9, 17, 19, '#b28cff'); g.restore(); }

/* ================= THE ROOF (P2) ================= */
export function drawBoulder(g, x, y, rot, hot) {   // the portal boulder: ~19 px of grey-violet rock, three rotations (0-2; 3 mirrors 1), a geode vein, shadowed underside. (x, y) = centre
  const r = rot & 3, base = hot ? '#fff0d0' : '#5a5668', hi = hot ? '#ffffff' : '#8a869c', lo = hot ? '#ffd36b' : '#2e2a3a';
  for (let yy = -9; yy <= 9; yy++) { const w = ri(Math.sqrt(Math.max(0, 90 - yy * yy))); R(g, x - w, y + yy, 2 * w + 1, 1, yy > 4 ? lo : base); }
  const cr = [[[-6, -5, 5, 3], [1, 3, 6, 2], [-3, 5, 3, 2]], [[2, -6, 4, 3], [-7, 0, 5, 2], [0, 5, 6, 2]], [[-5, -2, 6, 3], [3, -5, 3, 4], [-1, 5, 5, 2]]][r === 3 ? 1 : r];
  for (const [dx, dy, w, h] of cr) { R(g, x + dx, y + dy, w, h, hi); R(g, x + dx, y + dy + h, w, 1, lo); }
  const v = [[-4, 0], [0, 1], [4, -1]][r === 3 ? 1 : r]; R(g, x + v[0] - 3, y + v[1] - 2, 6, 5, PUR[1]); R(g, x + v[0] - 2, y + v[1] - 1, 4, 3, PUR[3]); px(g, x + v[0] - 1, y + v[1] - 1, PUR[5]);   // the amethyst vein
  px(g, x - 7, y - 5, hi); px(g, x + (r - 1) * 2, y - 8, hi); }
export function drawBoulderBurst(g, x, fy, age, t) {   // the landing burst: a ring of dust and three stone shards hopping up knee-high (age 0..1.2 s: they hang to 1.0 then fall)
  const k = Math.min(1, age / 0.25);
  g.save(); g.globalAlpha = Math.max(0, 0.8 - age); for (let i = 0; i < 6; i++) { const d = ri(4 + k * 18); R(g, x - d - 2, fy - 3 - (i & 1) * 2, 4, 3, '#a8a4b8'); R(g, x + d - 2, fy - 3 - (i & 1) * 2, 4, 3, '#a8a4b8'); } g.restore();
  for (let i = -1; i <= 1; i++) { const hy = fy - 12 - ri(Math.min(1, age / 0.2) * 6) + (age > 1 ? ri((age - 1) * 60) : 0); drawShardRock(g, x + i * 14, hy, i + 1, t, age > 0.2); } }
function drawShardRock(g, x, y, v, t, glint) {   // a stone shard: a jagged wedge with a lit edge; glint = it is hanging, ready to be struck
  fillPoly(g, [[x - 4, y + 4], [x - 1, y - 6], [x + 4, y - 2], [x + 3, y + 4]], '#5a5668'); fillPoly(g, [[x - 4, y + 4], [x - 1, y - 6], [x, y + 3]], '#8a869c'); R(g, x + 1, y, 3, 4, '#2e2a3a'); px(g, x - 1, y - 6, '#fff6c8');
  if (glint) drawHangGlint(g, x + 1, y - 2, t + v); }
export function drawHangGlint(g, x, y, t) {   // the hanging-shard glint: a four-point star that pulses over a shard that can be struck NOW
  const k = wave(t, 16), a = 2 + ri(k * 3); g.save(); g.globalAlpha = 0.55 + 0.45 * k; R(g, x - a, y, 2 * a + 1, 1, '#fff6c8'); R(g, x, y - a, 1, 2 * a + 1, '#fff6c8'); px(g, x, y, '#ffffff'); g.globalAlpha = 0.25 * k; R(g, x - a - 1, y - 1, 2 * a + 3, 3, '#ffd36b'); g.restore(); }
export function drawRock(g, x, y, v, t) {   // a rockfall rock: ~10 px, chunky and square-ish with a tail of dust, falling
  R(g, x - 4, y - 5, 9, 10, '#5a5668'); R(g, x - 4, y - 5, 9, 2, '#8a869c'); R(g, x - 4, y - 5, 2, 10, '#7a768c'); R(g, x + 2, y, 3, 5, '#2e2a3a'); px(g, x - 2, y - 2, '#a8a4b8'); R(g, x - 5 + (v & 1), y + 1, 1, 3, '#2e2a3a');
  g.save(); g.globalAlpha = 0.4; R(g, x - 2, y - 12, 5, 6, '#a8a4b8'); R(g, x - 1, y - 20, 3, 7, '#a8a4b8'); g.restore(); }
export function drawRockShadow(g, x, fy, k, t) {   // the told shadow: a dark disc that grows as the rock nears (k 0..1) and flashes at the end
  const w = ri(4 + 8 * k), hot = k > 0.75 && (Math.floor(t * 20) & 1); g.save(); g.globalAlpha = 0.3 + 0.5 * k; for (let i = -1; i <= 1; i++) { const ww = ri(w * (i ? 0.8 : 1)); R(g, x - ww, fy - 1 + i, 2 * ww, 1, hot ? '#ff6b6b' : '#12101a'); } g.restore(); }
export function drawGreatGeode(g, x, y, t, burst) {   // THE GREAT GEODE: a dark rind boulder ~44 px with a cracked-open amethyst heart, falling; burst 0..1 = it has split and the heart blazes
  const r = 22; for (let yy = -r; yy <= r; yy++) { const w = ri(Math.sqrt(Math.max(0, r * r - yy * yy))); R(g, x - w, y + yy, 2 * w + 1, 1, yy > 10 ? '#2a2630' : '#4a4654'); }
  for (let yy = -15; yy <= 15; yy++) { const w = ri(Math.sqrt(Math.max(0, 225 - yy * yy)) * (0.75 + 0.25 * burst)); R(g, x - w, y + yy, 2 * w + 1, 1, yy > 5 ? PUR[1] : PUR[2]); }
  for (let i = -3; i <= 3; i++) { const h = 11 - Math.abs(i) * 2; fillPoly(g, [[x + i * 4 - 3, y + 8], [x + i * 4, y + 8 - h], [x + i * 4 + 3, y + 8]], i & 1 ? PUR[4] : PUR[3]); px(g, x + i * 4, y + 8 - h, PUR[5]); }
  R(g, x - 21, y - 3, 6, 3, '#6a6678'); R(g, x + 12, y - 12, 8, 3, '#6a6678'); R(g, x - 6, y - 21, 12, 2, '#6a6678');
  g.save(); g.globalAlpha = 0.25 + 0.3 * burst + 0.1 * wave(t, 10); R(g, x - 26, y - 26, 52, 52, '#b28cff'); g.restore(); }
export function drawSkyPortal(g, x0, x1, y, k, t) {   // THE MOUNTAIN FALLS' sky portal: a wide violet-and-white ring-slot across the top of the deck (k 0..1 as it opens), a rim of arcs, a dark mouth, light bleeding down
  const w = x1 - x0, h = ri(6 + 8 * k), cx0 = (x0 + x1) >> 1;
  for (let yy = -h; yy <= h; yy++) { const ww = ri((w / 2) * Math.sqrt(1 - (yy / h) ** 2)); R(g, cx0 - ww, y + yy, 2 * ww, 1, yy < 0 ? '#2a1a3a' : '#1a0e2e'); }
  for (let a = 0; a < 90; a++) { const th = a / 90 * Math.PI * 2; px(g, ri(cx0 + Math.cos(th) * w / 2), ri(y + Math.sin(th) * h), a % 6 === 0 ? '#ffffff' : '#b28cff'); }
  for (let a = 0; a < 20; a++) { const th = t * 2.4 + a * 0.15; px(g, ri(cx0 + Math.cos(th) * (w / 2 - 2)), ri(y + Math.sin(th) * (h - 1)), '#ffffff'); }
  g.save(); g.globalAlpha = 0.14 * k; for (let i = 0; i < 8; i++) R(g, x0 + i * (w / 8), y + h, w / 8 - 2, 40 + i % 3 * 10, '#b28cff'); g.restore(); }
export function drawWardShell(g, x, y, t, k = 1) {   // the ward after a daze (3 s): a pale-violet crystal shell around her; shards GLANCE off it. (x, y) = her feet; she is ~ 58 px tall and wide
  const cx = x, cy = y - 34, rx = 36, ry = 42, a = 0.28 + 0.12 * wave(t, 8);
  g.save(); g.globalAlpha = a * k; for (let yy = -ry; yy <= ry; yy++) { const w = ri(rx * Math.sqrt(1 - (yy / ry) ** 2)); R(g, cx - w, cy + yy, 2 * w + 1, 1, '#e8dcff'); } g.restore();
  for (let n = 0; n < 64; n++) { const th = n / 64 * Math.PI * 2; px(g, ri(cx + Math.cos(th) * rx), ri(cy + Math.sin(th) * ry), n % 4 === 0 ? '#ffffff' : '#b28cff'); }
  for (const f of [-0.6, -0.2, 0.25, 0.65]) { const xx = ri(cx + f * rx), h = ri(ry * Math.sqrt(1 - f * f)); g.save(); g.globalAlpha = 0.4 * k; R(g, xx, cy - h + 3, 1, 2 * h - 6, '#ffffff'); g.restore(); }
  const gl = ((t * 20) % 80) - 40; g.save(); g.globalAlpha = 0.7 * k; for (let yy = -ry + 5; yy < ry - 5; yy += 1) { const w = rx * Math.sqrt(1 - (yy / ry) ** 2), xx = gl + yy * 0.5; if (Math.abs(xx) < w) R(g, ri(cx + xx), cy + yy, 3, 1, '#ffffff'); } g.restore(); }
export function drawRageAura(g, x, y, t) {   // RAGE: a red-violet aura licking up off her, heat-haze streaks and falling red motes (x, y) = her feet; drawn BEHIND her
  const k = wave(t, 10); g.save();
  for (let i = -5; i <= 5; i++) { const hh = 34 + ri(18 * wave(t, 9, i * 1.3)) - Math.abs(i) * 3, xx = x + i * 7; g.globalAlpha = 0.5 - Math.abs(i) * 0.04; R(g, xx - 2, y - 8 - hh, 5, hh, '#a02a5a'); g.globalAlpha = 0.35; R(g, xx - 1, y - 8 - hh * 0.6, 3, hh * 0.6, '#ff5a8a'); }
  g.globalAlpha = 0.18 + 0.12 * k; R(g, x - 42, y - 62, 84, 62, '#ff3a5a'); g.restore();
  for (let i = 0; i < 10; i++) { const ph = (t * 1.1 + i * 0.1) % 1; px(g, ri(x - 36 + i * 8 + Math.sin(t * 3 + i) * 4), ri(y - 10 - ph * 70), i & 1 ? '#ff9ab8' : '#e8dcff'); } }
