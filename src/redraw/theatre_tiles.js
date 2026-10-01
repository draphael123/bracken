// theatre_tiles.js - THE MASKWRIGHT'S THEATRE's TILE KIT (claude/theatreart). Every floor, wall-mass, gallery, rope, spring and spike the level is built of,
// drawn as a playhouse and not as the village's dirt. Made from px.js primitives; each tile 16x16, baked once and memoised.
//   theatreTile(t, x, y, at, ctx)  -> the canvas for one cell (or null: the game's own kit draws it), where at(x, y) is the tile id at a cell and
//                                     ctx = { T, traps: [{ x0, x1, row }] } (the level's stage traps: their boards are drawn as hatches)
//   the RULES: every floor top carries a LIT LIP (the readability pass: the one edge you can stand on must be found from across the room);
//   a wall mass is darker than the floor on it; iron for the fly galleries and the grid, gilt-edged timber for the boxes and the dress circle,
//   dark boards for the stage; the house is plum and oxblood, backstage is timber, the under-stage is near-black.
import { canvas, px, rect, line, fillPoly, circle, outline, mulberry } from '../px.js';

export const TH = { plum0: '#120a18', plum1: '#1c1224', plum2: '#2a1a34', plum3: '#3a2444', plum4: '#4a3050',
  ox0: '#4a1018', ox1: '#7a1a24', ox2: '#9a2a30', ox3: '#c04048', ox4: '#e0707a',
  brass0: '#5a4212', brass1: '#8a6a1c', brass2: '#c8a040', brass3: '#f0d070', brass4: '#fff0b0', lime: '#fff2b0', limeW: '#fffbe0',
  wood0: '#1e140f', wood1: '#2e2018', wood2: '#46301f', wood3: '#684a2c', wood4: '#8a6a3e', wood5: '#b08c58',
  iron0: '#16161c', iron1: '#2a2a34', iron2: '#44444f', iron3: '#6a6a78', iron4: '#9a9aa8',
  brick0: '#241a1c', brick1: '#382624', brick2: '#4c3430', brick3: '#664a42', void0: '#08060c', void1: '#12101a', void2: '#1c1826', void3: '#2a2436',
  cream: '#e8d8b0', creamD: '#b8a480', rope: '#c8b078', ropeD: '#8a7444', ropeL: '#e8d8a0' };

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const H = (x, y, s = 0) => { let v = Math.imul((x * 73856093) ^ (y * 19349663) ^ (s * 83492791), 2654435761) >>> 0; v ^= v >>> 15; return (v % 1000) / 1000; };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };

// ---- the wall masses: brick in three moods ----
const BRICK = { house: [TH.plum1, TH.plum2, TH.plum0, TH.plum3], back: [TH.brick1, TH.brick2, TH.brick0, TH.brick3], under: [TH.void1, TH.void2, TH.void0, TH.void3] };
function brickFill(kind, v, deepK) {
  return once('brick' + kind + v + deepK, () => { const [c, g] = canvas(16, 16), [b, hi, mort, lite] = BRICK[kind], r = mulberry(v * 131 + kind.length * 17);
    rect(g, 0, 0, 16, 16, mort);
    for (let row = 0; row < 4; row++) { const off = (row & 1) ? 4 : 0; for (let bx = -8; bx < 16; bx += 8) { const x = bx + off, tone = r();
      rect(g, x + 1, row * 4 + 1, 7, 3, tone < 0.22 ? hi : b); if (tone < 0.12) rect(g, x + 1, row * 4 + 1, 7, 1, lite); else if (tone > 0.9) px2(g, x + 4, row * 4 + 2, mort); } }
    if (kind === 'house') for (let x = 0; x < 16; x += 8) { px2(g, x + 3, 5, TH.brass0); px2(g, x + 3, 6, TH.brass0); }
    if (deepK) { g.globalAlpha = 0.28 * deepK; rect(g, 0, 0, 16, 16, '#000'); g.globalAlpha = 1; }
    return c; });
}
// under-stage: joists and posts (timber going down into the dark)
function joistFill(v) {
  return once('joist' + v, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 71 + 3);
    rect(g, 0, 0, 16, 16, '#0e0a0c');
    for (let x = 0; x < 16; x += 4) { rect(g, x, 0, 3, 16, r() < 0.5 ? '#241812' : '#2a1c14'); rect(g, x, 0, 1, 16, '#3a281c'); for (let y = 2 + ((r() * 5) | 0); y < 16; y += 5 + ((r() * 3) | 0)) px2(g, x + 1 + (r() < 0.5 ? 1 : 0), y, '#120c0a'); }
    rect(g, 0, 7, 16, 1, '#0a0608'); px2(g, 3, 7, '#5a4a3a'); px2(g, 11, 7, '#5a4a3a');
    return c; });
}

// ---- a floor's top: a 4px cap over the mass, edges lit ----
function capBoards(v, l, r, mass) {   // dark stage boards, seen edge-on: a lit lip, the plank joints, the nails
  return once('capB' + v + l + r + mass, () => { const [c, g] = canvas(16, 16), rr = mulberry(v * 53 + 11); c.getContext('2d').drawImage(massTile(mass, v, true), 0, 0);
    rect(g, 0, 0, 16, 4, TH.wood3); rect(g, 0, 0, 16, 1, TH.wood5); rect(g, 0, 1, 16, 1, TH.wood4); rect(g, 0, 3, 16, 1, TH.wood1);
    for (let x = ((rr() * 5) | 0) + 3; x < 16; x += 5 + ((rr() * 4) | 0)) { px2(g, x, 1, TH.wood2); px2(g, x, 2, TH.wood1); }
    px2(g, 2 + v, 2, TH.brass1); px2(g, 12 - v, 2, TH.brass1);
    if (l) rect(g, 0, 0, 1, 16, TH.wood0); if (r) rect(g, 15, 0, 1, 16, TH.wood0);
    return c; });
}
function capCarpet(v, l, r, mass) {   // the house: an oxblood runner with a gold thread, a lit pile
  return once('capC' + v + l + r + mass, () => { const [c, g] = canvas(16, 16); c.getContext('2d').drawImage(massTile(mass, v, true), 0, 0);
    rect(g, 0, 0, 16, 4, TH.ox1); rect(g, 0, 0, 16, 1, TH.ox3); rect(g, 0, 1, 16, 1, TH.ox2); rect(g, 0, 3, 16, 1, TH.ox0);
    for (let x = 1 + v; x < 16; x += 4) px2(g, x, 2, TH.brass2); px2(g, 0, 0, TH.ox4);
    if (l) rect(g, 0, 0, 1, 16, TH.plum0); if (r) rect(g, 15, 0, 1, 16, TH.plum0);
    return c; });
}
function capSeat(v, l, r, mass) {   // a raked row of stalls: the velvet seat, its brass number plate, a gap between each
  return once('capS' + v + l + r + mass, () => { const [c, g] = canvas(16, 16); c.getContext('2d').drawImage(massTile(mass, v, true), 0, 0);
    rect(g, 0, 0, 16, 4, TH.ox1); rect(g, 1, 0, 14, 2, TH.ox3); rect(g, 1, 0, 14, 1, TH.ox4); rect(g, 0, 2, 16, 2, TH.ox0); rect(g, 7, 3, 2, 1, TH.brass2);
    rect(g, 0, 0, 1, 4, TH.plum0); rect(g, 15, 0, 1, 4, TH.plum0);
    return c; });
}
function capStone(v, l, r, mass) {   // the under-stage's own floor: wet flags, a cold lit lip
  return once('capT' + v + l + r + mass, () => { const [c, g] = canvas(16, 16); c.getContext('2d').drawImage(massTile(mass, v, true), 0, 0);
    rect(g, 0, 0, 16, 3, TH.void3); rect(g, 0, 0, 16, 1, '#6a7088'); rect(g, 0, 2, 16, 1, TH.void1); px2(g, 4 + v * 3, 1, '#9aa4c0'); px2(g, 11, 1, '#4a5068');
    return c; });
}
function massTile(mass, v, plain) {
  if (mass === 'joist') return joistFill(v % 3);
  return brickFill(mass, v % 3, 0);
}

// ---- edges that show where a solid mass meets air on its side or under it ----
function trim(c, house, l, r, below) {
  const g = c.getContext('2d');
  if (l) { rect(g, 0, 4, 1, 12, house ? TH.brass1 : TH.iron3); }
  if (r) { rect(g, 15, 4, 1, 12, house ? TH.brass0 : TH.iron0); rect(g, 14, 4, 1, 12, house ? TH.brass2 : TH.iron2); }
  if (below) { rect(g, 0, 13, 16, 3, house ? TH.brass0 : '#0a0608'); rect(g, 0, 13, 16, 1, house ? TH.brass2 : TH.iron1); if (house) for (let x = 2; x < 16; x += 4) px2(g, x, 14, TH.brass3); }
  return c;
}
/* A TRIMMED COPY, MADE ONCE (claude/perf51). A flat that lands re-resolves every tile of the level, and each side-lit block used to be copied
   onto a fresh canvas again: ~270 new canvases a second in the theatre, each one more texture for the GPU. One copy per tile and edge set. */
const TRIMS = new WeakMap();
function trimmed(c, house, l, r, below) {
  let m = TRIMS.get(c); if (!m) TRIMS.set(c, m = new Map());
  const k = (house ? 1 : 0) + (l ? 2 : 0) + (r ? 4 : 0) + (below ? 8 : 0);
  if (!m.has(k)) { const [n, g] = canvas(16, 16); g.drawImage(c, 0, 0); m.set(k, trim(n, house, l, r, below)); }
  return m.get(k);
}

// ---- the galleries: iron grating (the fly floor, the grid, the lighting bridge), and gilt-edged timber (the boxes, the dress circle, the dressing rooms) ----
function ironGrate(l, r, v) {
  return once('grate' + l + r + v, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 2, TH.iron4); rect(g, 0, 0, 16, 1, '#c8c8d8');                       // the lit rail
    rect(g, 0, 2, 16, 4, TH.iron1);                                                        // the grating: a mesh of dark and steel
    for (let x = 0; x < 16; x += 2) { px2(g, x + (v & 1), 3, TH.iron3); px2(g, x + 1 - (v & 1), 4, TH.iron3); }
    rect(g, 0, 5, 16, 1, TH.iron0); rect(g, 0, 6, 16, 1, TH.iron2);                        // the stringer under it
    if (l) { rect(g, 0, 0, 2, 8, TH.iron3); rect(g, 0, 7, 2, 1, TH.iron0); }
    if (r) { rect(g, 14, 0, 2, 8, TH.iron3); rect(g, 14, 7, 2, 1, TH.iron0); }
    for (const bx of [3, 12]) { px2(g, bx, 3, '#c8c8d8'); px2(g, bx, 6, TH.iron4); }        // rivets
    fillPoly(g, [[6, 7], [10, 7], [8, 12]], TH.iron1); px2(g, 8, 8, TH.iron3);              // the bracket the gallery hangs from
    return c; });
}
function gildedTimber(l, r, v, dressing) {
  return once('gilt' + l + r + v + dressing, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 6, dressing ? TH.wood3 : TH.wood2); rect(g, 0, 0, 16, 1, TH.wood5); rect(g, 0, 1, 16, 1, TH.wood4);
    for (let x = 3 + v; x < 16; x += 6) px2(g, x, 3, TH.wood1);
    rect(g, 0, 5, 16, 1, TH.wood0); rect(g, 0, 6, 16, 1, dressing ? TH.wood1 : TH.brass1);
    if (!dressing) { rect(g, 0, 6, 16, 1, TH.brass2); for (let x = 1; x < 16; x += 4) px2(g, x, 7, TH.brass1); }   // the gilt fringe under a box front
    if (l) rect(g, 0, 0, 1, 7, TH.wood0); if (r) rect(g, 15, 0, 1, 7, TH.wood0);
    return c; });
}
// a STAGE TRAP: the boards of a hatch. Seams all round, a brass ring, hinges at the ends - it is a door in the floor, and it reads as one
function trapBoard(end, v) {   // end: 'l' | 'r' | 'm' | 'lr'
  return once('trap' + end + v, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 5, '#58402a'); rect(g, 0, 0, 16, 1, TH.brass3); rect(g, 0, 1, 16, 1, TH.wood5); rect(g, 0, 4, 16, 1, TH.wood0);
    rect(g, 0, 2, 16, 1, TH.wood4); for (let x = 2; x < 16; x += 5) px2(g, x, 3, TH.wood1);
    if (end.includes('l')) { rect(g, 0, 0, 2, 5, TH.wood0); rect(g, 2, 1, 1, 3, TH.brass2); px2(g, 3, 2, TH.brass4); }
    if (end.includes('r')) { rect(g, 14, 0, 2, 5, TH.wood0); rect(g, 13, 1, 1, 3, TH.brass2); px2(g, 12, 2, TH.brass4); }
    if (end === 'm') { rect(g, 6, 1, 4, 3, TH.brass1); rect(g, 7, 2, 2, 1, TH.wood0); px2(g, 6, 1, TH.brass4); }   // the ring you would lift it by
    // the hazard chevrons on the lip: yellow over black, the unmistakable "not a floor"
    for (let x = 0; x < 16; x += 4) { rect(g, x, 5, 2, 1, TH.brass3); rect(g, x + 2, 5, 2, 1, TH.wood0); }
    return c; });
}

// ---- the springs: a kettle drum's head, and the star trap ----
function drumHead(v, drumSet) {
  return once('drum' + v + drumSet, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 6, 16, 10, '#7a4a20'); rect(g, 0, 6, 16, 1, TH.brass3); rect(g, 0, 15, 16, 1, TH.wood0);   // the copper bowl
    for (let x = 1; x < 16; x += 5) { rect(g, x, 8, 1, 6, '#a8683a'); }
    rect(g, 0, 2, 16, 4, '#efe6cc'); rect(g, 0, 2, 16, 1, '#ffffff'); rect(g, 0, 5, 16, 1, '#b8a888');      // the skin, taut and pale: the one bright thing in the pit
    for (let x = 1; x < 16; x += 5) { rect(g, x, 1, 2, 6, TH.brass2); px2(g, x, 1, TH.brass4); }            // the tension lugs
    rect(g, 0, 1, 16, 1, TH.brass2); px2(g, 4, 3, '#cfc2a0'); px2(g, 10, 3, '#cfc2a0');
    if (v) { px2(g, 7, 0, TH.brass4); px2(g, 8, 0, TH.brass4); }
    return c; });
}
function starTrap(v) {
  return once('star' + v, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 6, 16, 10, TH.wood1); rect(g, 0, 6, 16, 1, TH.brass2);
    rect(g, 0, 3, 16, 4, '#3a1414'); rect(g, 0, 3, 16, 1, TH.ox3);                                          // the spring leaves: red, and clearly loaded
    const cx = 8, cy = 4.5; for (const [dx, dy] of [[0, -2], [2, -1], [1, 1], [-1, 1], [-2, -1]]) px2(g, cx + dx * 1.5 | 0, (cy + dy * 0.8) | 0, TH.brass3);
    px2(g, 8, 4, TH.brass4); px2(g, 7, 4, TH.brass3); px2(g, 9, 4, TH.brass3); px2(g, 8, 3, TH.brass3);
    for (let x = 0; x < 16; x += 4) { rect(g, x, 2, 2, 1, TH.brass3); rect(g, x + 2, 2, 2, 1, TH.wood0); }   // chevrons: a spring
    return c; });
}

// ---- a hemp rope for climbing, with a knot every eight pixels and the twist of the lay ----
function ropeTile(v, top) {
  return once('rope' + v + top, () => { const [c, g] = canvas(16, 16);
    for (let y = 0; y < 16; y++) { const k = ((y + v * 3) >> 1) & 1; rect(g, 7, y, 3, 1, k ? TH.rope : TH.ropeD); px2(g, 7 + (k ? 0 : 2), y, TH.ropeL); }
    rect(g, 6, 5, 5, 2, TH.rope); rect(g, 6, 5, 5, 1, TH.ropeL); rect(g, 6, 7, 5, 1, TH.ropeD);           // the knot: a hand-hold
    rect(g, 6, 13, 5, 2, TH.rope); rect(g, 6, 13, 5, 1, TH.ropeL); rect(g, 6, 15, 5, 1, TH.ropeD);
    if (top) { rect(g, 4, 0, 9, 2, TH.iron2); rect(g, 4, 0, 9, 1, TH.iron4); rect(g, 6, 2, 5, 1, TH.iron0); }  // a cleat or pulley block at its head
    outline(c, '#1a0e0a'); return c; });
}

// ---- the spikes: broken stands and stage nails - steel points on a plank, a warm tip so they read as NOT HERE ----
function stageSpikes(v) {
  return once('spike' + v, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 13, 16, 3, TH.wood1); rect(g, 0, 13, 16, 1, TH.wood4);
    for (let i = 0; i < 4; i++) { const x = 1 + i * 4 + ((v + i) % 2), top = 2 + ((v * 3 + i * 5) % 4);
      fillPoly(g, [[x, 13], [x + 1, top], [x + 2, 13]], TH.iron3); px2(g, x + 1, top, '#ff9a6a'); px2(g, x + 1, top + 1, TH.iron4); px2(g, x, 12, TH.iron2); }
    return outline(c, '#0c0810'); });
}

// ================================ THE HOOK ================================
export function theatreTile(t, x, y, at, ctx) {
  const T = ctx.T, W = ctx.W || 416, S = k => at(x + k[0], y + k[1]);
  const air = (dx, dy) => at(x + dx, y + dy) === T.AIR, sameRow = k => at(x + k, y) === t;
  const house = x < 72, under = y >= 36 && x >= 218, deepUnder = y >= 44, mass = house ? 'house' : under ? 'under' : 'back', v = ((x * 7 + y * 13) % 3 + 3) % 3;
  if (t === T.SOLID) {
    const top = air(0, -1), l = air(-1, 0), r = air(1, 0), below = air(0, 1);
    let c;
    if (top) {
      const stalls = house && x >= 19 && x <= 46 && y >= 30, dressCircle = house && x >= 18 && x <= 38 && y <= 25;
      c = house ? (stalls ? capSeat(v, l, r, mass) : capCarpet(v, l, r, mass)) : under ? capStone(v, l, r, mass) : capBoards(v, l, r, mass);
      void dressCircle;
    } else if (!house && !under && y >= 34 && y <= 35 && x >= 72) c = joistFill(v);   // the stage's understructure: the timber under the boards
    else if (under && !deepUnder) c = brickFill('under', v, 0); else c = brickFill(mass, v, deepUnder ? 1 : 0);
    if (!top && (l || r || below)) c = trimmed(c, house, l, r, below);
    return c;
  }
  if (t === T.ONEWAY) {
    const l = !sameRow(-1), r = !sameRow(1), tr = (ctx.traps || []).find(p => p.row === y && x >= p.x0 && x <= p.x1);
    if (tr) return trapBoard((x === tr.x0 ? 'l' : '') + (x === tr.x1 ? 'r' : '') || (((x - tr.x0) & 1) ? 'x' : 'm'), 0);
    if (y <= 17 || (y >= 12 && y <= 16)) return ironGrate(l, r, v);            // the grid, the fly floor, the lighting bridge: iron
    return gildedTimber(l, r, v, x >= 72 && (y >= 18 && y <= 27));               // the boxes and the dress circle are gilt; the dressing rooms' boards plain
  }
  if (t === T.NET) return ropeTile(v % 2, at(x, y - 1) !== T.NET);
  if (t === T.BOUNCER) return x < 72 ? drumHead(v % 2, 1) : starTrap(v % 2);
  if (t === T.SPIKE) return stageSpikes(v);
  return null;
}
