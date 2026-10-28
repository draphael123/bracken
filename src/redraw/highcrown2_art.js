// src/redraw/highcrown2_art.js - HIGHCROWN 2's ART (claude/highcrown2art, over the greybox claude/highcrown2).
// DRAWING ONLY: no tile, entity or prop changes (the level hash is the greybox's). Everything is castle stone - ashlar, pier, corbel, iron chain - with timber only
// where a castle really uses it (a door, a roof beam, a winch drum, a bunk). It hangs off L.hc2Kit (set by src/highcrown2.js) and L.hcDeco:
//   tile        hcTile       the one-way ledges of the castle: a stone slab with a lit lip, mortar courses, a shadowed soffit and corbel-stepped ends
//   rooms       paintRoom    'hchall' (THE TALL KEEP HALL: ashlar, pilasters, lancets, tapestries, a corbel table) and 'hcguard' (the barracks: ashlar, bunks, racks)
//   supports    drawSupport  routeSupports kinds 'hcpier' (a castle pier: battered plinth, ashlar courses, a stepped corbel capital) and 'hcchain' (heavy iron chain, bolted)
//   front       drawFront    L.hcDeco, over the tiles: arch rings with keystones, the portcullis grooves and hoist slot, the murder-hole slot, the kitchen-stair door and its
//                            shut port, corbels, the eave beam and its pulley, the bell rope, the crag gate's winch frame
//   props       drawWinch / drawGrate / drawBell / drawChandelierAnchor (main.js calls them for the winch, the grate bell, the hall bell and the chandeliers)
import { canvas, rect, mulberry } from '../px.js';

const R = rect;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export const STONE = { dk: '#14151d', a: '#23252f', b: '#2c2e3b', c: '#363949', d: '#43475a', e: '#575b70', f: '#74788e', g: '#9498ae', mor: '#101118' };
const S = STONE;

// ---------------- THE LEDGE (one-way): a stone slab ----------------
export function hcTile(t, x, y, at, T, L) {
  if (t === T.PORT && L && (L.hcDoors || []).some(d => d[0] === x && y >= d[1] && y <= d[2])) { const first = y === L.hcDoors.find(d => d[0] === x)[1], ring = y === L.hcDoors.find(d => d[0] === x)[2] - 1;   // the barracks door: oak planks, iron-strapped, a ring
    return once('door' + first + ring, () => { const [c, g] = canvas(16, 16); R(g, 0, 0, 16, 16, '#3a2814'); for (let k = 0; k < 4; k++) { R(g, k * 4, 0, 3, 16, k & 1 ? '#5a4228' : '#654a2c'); R(g, k * 4, 0, 1, 16, '#7a5a3a'); R(g, k * 4 + 3, 0, 1, 16, '#1e140c'); }
      for (const yy of [2, 11]) { R(g, 0, yy, 16, 3, '#2a2a34'); R(g, 0, yy, 16, 1, '#6a6a80'); for (const xx of [2, 7, 12]) R(g, xx, yy + 1, 2, 1, '#a0a0b8'); }
      if (first) { R(g, 0, 0, 16, 1, '#1e140c'); } if (ring) { R(g, 10, 6, 4, 4, '#16161e'); R(g, 11, 7, 2, 2, '#5a4228'); R(g, 11, 6, 2, 1, '#a0a0b8'); } return c; }); }
  if (t !== T.ONEWAY) return null;
  const same = k => at(x + k, y) === T.ONEWAY;
  const eL = !same(-1), eR = !same(1), wallL = at(x - 1, y) === T.SOLID, wallR = at(x + 1, y) === T.SOLID;
  const par = ((x * 5 + y * 3) % 2 + 2) % 2;
  return once('slab' + eL + eR + wallL + wallR + par, () => { const [c, g] = canvas(16, 16);
    R(g, 0, 0, 16, 1, S.g); R(g, 0, 1, 16, 1, S.e);                                  // the lit lip
    R(g, 0, 2, 16, 4, S.c); R(g, 0, 5, 16, 1, S.b); R(g, 0, 6, 16, 1, S.dk);        // the slab's face, its soffit line and the shadow under it
    R(g, par ? 5 : 11, 2, 1, 3, S.mor); R(g, par ? 5 : 11, 2, 1, 1, S.b);            // a joint
    R(g, 3 + par * 4, 3, 2, 1, S.d); R(g, 10 - par * 3, 4, 3, 1, S.d);              // a chip of light
    if (eL && !wallL) { R(g, 0, 1, 1, 5, S.b); R(g, 0, 0, 1, 1, S.e); }             // the cut end
    if (eR && !wallR) { R(g, 15, 1, 1, 5, S.a); R(g, 15, 0, 1, 1, S.d); }
    for (let i = 0; i < 3; i++) { const w = 12 - i * 4;                               // a stepped corbel under each free end: the slab is carried, not floated
      if (eL && !wallL) R(g, 0, 7 + i * 2, w, 2, i === 0 ? S.b : S.a), R(g, 0, 7 + i * 2, w, 1, S.c);
      if (eR && !wallR) R(g, 16 - w, 7 + i * 2, w, 2, i === 0 ? S.b : S.a), R(g, 16 - w, 7 + i * 2, w, 1, S.c); }
    return c; });
}

// ---------------- THE ROOMS ----------------
const arch = (g, x0, x1, ytop, r, col) => { for (let y = 0; y < r; y++) { const ins = Math.round(r - Math.sqrt(Math.max(0, r * r - (r - y) * (r - y)))); R(g, x0 + ins, ytop + y, x1 - x0 - ins * 2, 1, col); } };
const lancet = (g, x, y0, y1, w, glass, frame, lit) => {                           // a pointed window: frame, glass, mullion, sill
  const p = Math.round(w * 0.9);
  for (let y = y0 - p; y < y1; y++) { const dy = y - (y0 - p); let ins = 0; if (dy < p) ins = Math.round((p - dy) * (w / 2) / p);
    R(g, x - w / 2 - 3 + ins, y, w + 6 - ins * 2, 1, frame); }
  for (let y = y0 - p + 3; y < y1; y++) { const dy = y - (y0 - p + 3); let ins = 0; if (dy < p) ins = Math.round((p - dy) * (w / 2) / p);
    R(g, x - w / 2 + ins, y, w - ins * 2, 1, glass); }
  R(g, x - 1, y0 - p + 5, 2, y1 - y0 + p - 5, '#10141f'); R(g, x - w / 2, y0 + 20, w, 2, '#10141f'); R(g, x - w / 2, y0 + 70, w, 2, '#10141f');
  R(g, x - w / 2 - 4, y1, w + 8, 3, S.f); R(g, x - w / 2 - 4, y1 + 3, w + 8, 1, S.dk);
  if (lit) { R(g, x - w / 2 + 2, y0 - 6, 2, 20, lit); } };

function bakeHall(W, H) { const [c, g] = canvas(W, H), rnd = mulberry(404);
  R(g, 0, 0, W, H, S.mor);
  for (let y = 0, row = 0; y < H; y += 8, row++) for (let x = -(row & 1) * 14; x < W; x += 28) { const k = rnd();   // great ashlar, a joint a course
    R(g, x + 1, y + 1, 27, 7, k < 0.34 ? S.a : k < 0.67 ? S.b : '#292b38'); R(g, x + 1, y + 1, 27, 1, S.c); if (k > 0.9) R(g, x + 6, y + 4, 8, 1, S.c); }
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(4,4,10,0.55)'); gr.addColorStop(0.45, 'rgba(4,4,10,0.12)'); gr.addColorStop(1, 'rgba(4,4,10,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const fl = H;
  // the corbel table and the ceiling ribs under the chapel's floor
  R(g, 0, 0, W, 10, S.dk); R(g, 0, 10, W, 3, S.d); R(g, 0, 13, W, 1, S.mor);
  for (let x = 4; x < W; x += 12) { R(g, x, 14, 8, 3, S.c); R(g, x + 1, 17, 6, 3, S.b); R(g, x + 2, 20, 4, 3, S.a); R(g, x, 14, 8, 1, S.e); }
  for (let bx = 0; bx <= W; bx += 96) {
    const odd = ((bx / 96) & 1) === 1, mx = bx + 48;
    // the pilaster and its capital, the springing of a blind arch either side
    R(g, bx - 8, 24, 16, fl - 24, S.c); R(g, bx - 8, 24, 2, fl - 24, S.e); R(g, bx + 6, 24, 2, fl - 24, S.a); for (let y = 24; y < fl; y += 8) R(g, bx - 8, y + 7, 16, 1, S.b);
    R(g, bx - 11, 24, 22, 4, S.e); R(g, bx - 11, 28, 22, 2, S.a); R(g, bx - 10, 30, 20, 1, S.mor);
    R(g, bx - 10, fl - 22, 20, 8, S.d); R(g, bx - 10, fl - 22, 20, 2, S.f); R(g, bx - 12, fl - 14, 24, 14, S.c); R(g, bx - 12, fl - 14, 24, 2, S.f); R(g, bx - 12, fl - 2, 24, 2, S.dk);
    if (bx + 96 > W) continue;
    // the blind arch over the bay
    g.save(); g.beginPath(); g.rect(bx + 8, 30, 80, 60); g.clip();
    for (let y = 0; y < 52; y++) { const hw = Math.max(0, Math.min(40, Math.round(Math.sqrt(Math.max(0, 1600 - Math.pow(52 - y, 2) * 0.62)))));
      R(g, mx - hw, 38 + y, 2, 1, S.d); R(g, mx + hw - 2, 38 + y, 2, 1, S.d); }
    g.restore();
    R(g, bx + 8, 94, 80, 3, S.d); R(g, bx + 8, 97, 80, 1, S.mor);                  // a string course under the windows' crown
    if (!odd) {   // a lancet, with the moon in it, and its light thrown across the floor
      lancet(g, mx, 140, 330, 24, '#46628c', S.e, '#8eaed8');
      g.globalAlpha = 0.06; g.fillStyle = '#9ab6e6'; g.beginPath(); g.moveTo(mx - 12, 140); g.lineTo(mx + 12, 140); g.lineTo(mx + 70, fl); g.lineTo(mx + 22, fl); g.fill(); g.globalAlpha = 1;
    } else {      // a tapestry on an iron rod: the Queen's purple, her crown in gold
      R(g, mx - 24, 120, 48, 3, '#3a3a46'); R(g, mx - 26, 119, 3, 5, S.f); R(g, mx + 23, 119, 3, 5, S.f);
      for (let x = 0; x < 40; x++) { const dy = (x % 8 < 4) ? 0 : 2; R(g, mx - 20 + x, 123, 1, 150 + dy, (x % 5) < 2 ? '#4a2862' : '#3a1e50'); }
      R(g, mx - 20, 123, 40, 2, '#c9a040'); R(g, mx - 20, 270, 40, 3, '#c9a040'); for (let x = -20; x < 20; x += 4) R(g, mx + x, 273, 2, 4, '#c9a040');
      R(g, mx - 7, 180, 14, 4, '#e0b040'); for (let k = 0; k < 4; k++) R(g, mx - 7 + k * 4, 174, 2, 6, '#e0b040'); R(g, mx - 1, 188, 2, 18, '#7a5a1c'); }
  }
  // the dado: dark panelled stone to the floor, a moulded rail
  R(g, 0, fl - 28, W, 28, '#1b1c26'); for (let x = 0; x < W; x += 24) { R(g, x + 1, fl - 25, 22, 22, '#232531'); R(g, x + 1, fl - 25, 22, 1, S.c); R(g, x + 22, fl - 25, 1, 22, S.mor); }
  R(g, 0, fl - 30, W, 2, S.e); R(g, 0, fl - 28, W, 1, S.dk);
  return c; }

function bakeGuard(W, H) { const [c, g] = canvas(W, H), rnd = mulberry(909), fl = H;
  R(g, 0, 0, W, H, S.mor);
  for (let y = 0, row = 0; y < H; y += 9, row++) for (let x = -(row & 1) * 13; x < W; x += 26) { const k = rnd(); R(g, x + 1, y + 1, 25, 8, k < 0.5 ? '#2a2c38' : '#252733'); R(g, x + 1, y + 1, 25, 1, S.b); }
  R(g, 0, fl - 12, W, 12, '#15161c'); R(g, 0, fl - 13, W, 1, S.c);                                                       // the wainscot, black stone
  for (let x = 4; x < W; x += 32) { R(g, x, 0, 8, 6, '#3a2a1c'); }                                                          // (corbels for the roof beams below)
  for (const y of [8, 50]) { R(g, 0, y, W, 6, '#3a2a1c'); R(g, 0, y, W, 1, '#5a4228'); R(g, 0, y + 5, W, 1, '#1e140c'); for (let x = 12; x < W; x += 40) { R(g, x, y + 1, 3, 4, '#2a2a34'); } }   // the roof beams, iron-strapped: where a keep uses timber
  for (let x = 20; x < W; x += 64) { R(g, x + 20, fl - 58, 4, 18, '#0a0b10'); R(g, x + 19, fl - 60, 6, 3, S.d); R(g, x + 21, fl - 42, 2, 3, '#0a0b10'); g.globalAlpha = 0.1; R(g, x + 18, fl - 56, 8, 18, '#9aa8d8'); g.globalAlpha = 1; }   // arrow loops, night in them
  // the bunks: two tiers of a timber frame against the west wall, straw, a grey blanket, a cloak on a peg
  for (const bx of [10, 100]) { if (bx + 40 > W) continue;
    for (const ty of [fl - 28, fl - 58]) { R(g, bx, ty, 44, 3, '#5a4228'); R(g, bx, ty, 44, 1, '#7a5a3a'); R(g, bx + 1, ty - 5, 42, 5, '#6a6a56'); R(g, bx + 1, ty - 5, 42, 1, '#8a8a70'); R(g, bx + 2, ty - 8, 12, 3, '#8a7a52'); }
    for (const px of [bx, bx + 41]) R(g, px, fl - 62, 3, 62, '#4a3620');
    R(g, bx, fl - 62, 44, 3, '#5a4228'); }
  for (const sx of [150, 50]) { if (sx > W - 12) continue; R(g, sx, fl - 50, 11, 3, '#3a2a1c'); R(g, sx, fl - 48, 11, 9, sx > 100 ? '#5a2a32' : '#2a3a5a'); R(g, sx + 2, fl - 39, 7, 3, sx > 100 ? '#5a2a32' : '#2a3a5a'); R(g, sx + 5, fl - 46, 1, 6, '#8a7a4a'); }
  return c; }

export function paintRoom(g, st, sx, sy, w, h, tx0, ty0, time) {
  if (st === 'hchall') { const spr = once('hall' + w + 'x' + h, () => bakeHall(w, h)); g.drawImage(spr, sx, sy);
    const k = 0.5 + 0.5 * Math.sin(time * 1.9); g.globalAlpha = 0.07 + 0.025 * k; g.fillStyle = '#ffb45c'; g.fillRect(sx, sy + h - 60, w, 60); g.globalAlpha = 1; return true; }
  if (st === 'hcguard') { const spr = once('guard' + w + 'x' + h, () => bakeGuard(w, h)); g.drawImage(spr, sx, sy);
    const k = 0.5 + 0.5 * Math.sin(time * 3.1); g.globalAlpha = 0.08 + 0.04 * k; g.fillStyle = '#ff9a3c'; g.fillRect(sx, sy + h - 50, w, 50); g.globalAlpha = 1; return true; }
  return false;
}

// ---------------- SUPPORTS ----------------
export function drawSupport(g, p, cx, cy) {
  const top = Math.round(p.y * 16 + 7 - cy), X = Math.round(p.x * 16 - cx);
  if (p.kind === 'hcchain') {                                                                                        // a heavy iron chain, bolted into the stone over it and collared to the slab
    const y0 = Math.round(p.top * 16 - cy), y1 = Math.round(p.y * 16 + 3 - cy);
    R(g, X + 3, y0, 10, 4, S.dk); R(g, X + 3, y0, 10, 1, S.f); R(g, X + 7, y0 + 1, 2, 2, '#c9a040'); R(g, X + 4, y0 + 4, 8, 1, S.mor);   // the wall plate and its bolt
    for (let y = y0 + 5, i = 0; y < y1 - 4; y += 4, i++) { if (i & 1) { R(g, X + 7, y, 2, 4, '#4c4c5c'); R(g, X + 7, y, 1, 4, '#8a8aa0'); } else { R(g, X + 5, y, 6, 5, '#2e2e3a'); R(g, X + 6, y + 1, 4, 3, '#0e0e14'); R(g, X + 5, y, 6, 1, '#a0a0b8'); R(g, X + 5, y, 1, 5, '#7a7a90'); } }
    R(g, X + 3, y1 - 4, 10, 4, S.dk); R(g, X + 3, y1 - 4, 10, 1, S.f); R(g, X + 7, y1 - 3, 2, 2, '#c9a040'); return; }
  const bot = Math.round(p.bottom * 16 - cy), len = bot - top; if (len < 4) return;
  const cap = 10, X0 = X + 1;
  R(g, X0 + 2, top, 12, len, S.c);                                                                                    // the shaft: ashlar courses
  R(g, X0 + 2, top, 2, len, S.e); R(g, X0 + 12, top, 2, len, S.a);
  for (let y = top + cap; y < bot - 8; y += 8) { R(g, X0 + 2, y, 12, 1, S.b); R(g, X0 + (((y - top) >> 3) & 1 ? 6 : 9), y - 7, 1, 7, S.b); }
  for (let i = 0; i < 3; i++) { const w = 14 + (2 - i) * 2 - 0; R(g, X0 + 8 - w / 2, top + i * 3, w, 3, i === 0 ? S.d : S.c); R(g, X0 + 8 - w / 2, top + i * 3, w, 1, i === 0 ? S.f : S.d); }   // the corbel capital, stepped out to the slab
  R(g, X0 + 8 - 9, top - 1, 18, 1, S.mor);
  R(g, X0 + 1, bot - 12, 14, 12, S.d); R(g, X0 + 1, bot - 12, 14, 2, S.f); R(g, X0 + 1, bot - 12, 1, 12, S.e); R(g, X0 + 15, bot - 12, 1, 12, S.a);   // a battered plinth
  R(g, X0 - 1, bot - 5, 18, 5, S.c); R(g, X0 - 1, bot - 5, 18, 1, S.e); R(g, X0 - 1, bot - 1, 18, 1, S.dk);
}

// ---------------- THE FRONT PASS: L.hcDeco ----------------
const voussoirs = (g, x0, x1, ytop, r, thick) => {                                                                       // a ring of wedge stones around a gate (flat-headed round-cornered: the crown tower's arch)
  for (let x = x0 - thick; x < x1 + thick; x++) { const dx = x < x0 + r ? x0 + r - x : x > x1 - r ? x - (x1 - r) : 0, yt = ytop + (dx > 0 ? Math.round(r - Math.sqrt(Math.max(0, r * r - dx * dx))) : 0) - (x < x0 || x >= x1 ? thick - (x < x0 ? x0 - x : x - x1 + 1) : thick);
    const k = Math.floor((x - x0) / 5);
    for (let y = yt; y < yt + thick + 1; y++) { R(g, x, y, 1, 1, ((k + ((y - yt) >> 1)) & 1) ? S.e : S.d); }
    R(g, x, yt, 1, 1, S.g); }
  const kx = ((x0 + x1) >> 1) - 5; R(g, kx, ytop - thick - 5, 10, thick + 8, S.f); R(g, kx, ytop - thick - 5, 10, 1, S.g); R(g, kx, ytop + 2, 10, 1, S.a); R(g, kx + 3, ytop - thick - 2, 4, 2, '#e0b040'); R(g, kx + 2, ytop - thick - 4, 1, 2, '#e0b040'); R(g, kx + 5, ytop - thick - 4, 1, 2, '#e0b040'); R(g, kx + 7, ytop - thick - 4, 1, 2, '#e0b040');
};

function gateArch(g, d, cx, cy) {                                                                                         // d: { x0, x1, top, bot }: tile columns, the arch's first and last air rows
  const x0 = Math.round(d.x0 * 16 - cx + 8), x1 = Math.round((d.x1 + 1) * 16 - cx - 8), ytop = Math.round(d.top * 16 - cy), ybot = Math.round((d.bot + 1) * 16 - cy), r = 12;
  voussoirs(g, x0, x1, ytop, r, 5);
  for (let y = ytop + r; y < ybot; y++) { const k = Math.floor((y - ytop) / 5) & 1; R(g, x0 - 5, y, 5, 1, k ? S.e : S.d); R(g, x1, y, 5, 1, k ? S.e : S.d); R(g, x0 - 5, y, 1, 1, S.g); R(g, x1 + 4, y, 1, 1, S.a); }   // the jambs: alternate long and short stones
  // the portcullis groove: two slots in the passage either side of the gate's own column, up into the hoist chamber over it
  const pc = Math.round((d.gate ?? ((d.x0 + d.x1) >> 1)) * 16 - cx);
  for (const gx of [pc - 1, pc + 16]) { R(g, gx, ytop - 2, 1, ybot - ytop + 2, S.mor); R(g, gx + (gx < pc + 8 ? 1 : -1), ytop - 2, 1, ybot - ytop + 2, S.a); }
  R(g, pc + 2, ytop - 10, 12, 8, S.mor); R(g, pc + 1, ytop - 11, 14, 1, S.d); R(g, pc + 1, ytop - 3, 14, 1, S.d);          // the hoist chamber's slot, over the gate
  R(g, pc + 7, ytop - 10, 2, 7, '#5a5a6c'); R(g, pc + 7, ytop - 10, 1, 7, '#8a8aa0');                                       // its chain
  if (d.lamp) { R(g, x0 - 9, ytop + 10, 3, 3, '#e0b040'); }
}

function corbel(g, x, y, cx, cy, n = 1) { const X = Math.round(x * 16 - cx), Y = Math.round(y * 16 - cy);
  for (let k = 0; k < n; k++) { const bx = X + k * 16;
    R(g, bx + 3, Y, 10, 4, S.c); R(g, bx + 3, Y, 10, 1, S.e); R(g, bx + 4, Y + 4, 8, 4, S.b); R(g, bx + 4, Y + 4, 8, 1, S.d); R(g, bx + 5, Y + 8, 6, 4, S.a); R(g, bx + 5, Y + 8, 6, 1, S.c); R(g, bx + 6, Y + 12, 4, 2, S.dk); R(g, bx + 12, Y, 1, 12, S.a); } }

export function drawFront(g, L, cx, cy, time, VW, VH) {
  for (const d of L.hcDeco || []) {
    const lx = (d.x0 ?? d.x) * 16 - cx - 40, rx = ((d.x1 ?? d.x) + 1) * 16 - cx + 40; if (rx < 0 || lx > VW) continue;
    if (d.k === 'arch') gateArch(g, d, cx, cy);
    else if (d.k === 'corbel') corbel(g, d.x, d.y, cx, cy, d.n || 1);
    else if (d.k === 'murder') { const X = Math.round(d.x * 16 - cx), Y = Math.round(d.y * 16 - cy);                    // the murder hole: a slot in the wall-walk's soffit, corbels either side, a ring for the stone's chain
      R(g, X - 4, Y - 6, 24, 4, S.d); R(g, X - 4, Y - 6, 24, 1, S.f); R(g, X + 1, Y - 2, 14, 14, S.mor); R(g, X, Y - 2, 1, 14, S.e); R(g, X + 15, Y - 2, 1, 14, S.a); R(g, X + 1, Y - 2, 14, 1, S.d);
      R(g, X + 7, Y - 2, 2, 3, '#8a8aa0'); R(g, X - 3, Y + 1, 4, 10, S.c); R(g, X - 3, Y + 1, 1, 10, S.e); R(g, X + 15, Y + 1, 4, 10, S.b); R(g, X - 3, Y + 11, 4, 3, S.a); R(g, X + 15, Y + 11, 4, 3, S.a); }
    else if (d.k === 'stairdoor') { const X = Math.round(d.x0 * 16 - cx), Y = Math.round((d.y + 1) * 16 - cy), W = (d.x1 - d.x0 + 1) * 16 - 24;   // the kitchen stair's door, behind the shut port: iron-bound oak, ajar on its steps going down
      const x0 = X + 12, x1 = X + 12 + W; R(g, x0, Y - 52, W, 52, '#08090d'); voussoirs(g, x0, x1, Y - 52, 10, 4);
      for (let i = 0; i < 5; i++) { R(g, x0 + 2 + i * 4, Y - 6 - i * 3, W - 4 - i * 4, 3, i & 1 ? S.b : S.c); }
      g.globalAlpha = 0.18 + 0.05 * Math.sin(time * 5); R(g, x0 + 4, Y - 30, W - 8, 24, '#ff9a3c'); g.globalAlpha = 1;
      R(g, x0, Y - 52, 5, 50, '#4a3620'); R(g, x0, Y - 52, 1, 50, '#6a4a2a'); for (const yy of [Y - 44, Y - 24, Y - 8]) { R(g, x0, yy, 5, 2, '#2a2a34'); R(g, x0 + 3, yy, 1, 2, '#8a8aa0'); } }
    else if (d.k === 'eave') { const X = Math.round(d.x0 * 16 - cx), Y = Math.round(d.y * 16 - cy), W = (d.x1 - d.x0 + 1) * 16;                // the barracks' eave beam, an oak balk on stone corbels, and the pulley the counterweight runs over
      R(g, X, Y - 9, W, 7, '#4a3620'); R(g, X, Y - 9, W, 1, '#7a5a3a'); R(g, X, Y - 3, W, 1, '#1e140c'); for (let x = X + 6; x < X + W - 4; x += 20) { R(g, x, Y - 9, 2, 7, '#2a2a34'); R(g, x, Y - 9, 1, 1, '#8a8aa0'); }
      corbel(g, d.x0 + 0.0, d.y, cx, cy, 1); R(g, X + W - 22, Y - 15, 10, 10, S.dk); R(g, X + W - 20, Y - 13, 6, 6, '#4a4a5a'); R(g, X + W - 18, Y - 11, 2, 2, '#c9a040'); }
    else if (d.k === 'bellrope') { const X = Math.round(d.x * 16 + 8 - cx), Y = Math.round(d.y * 16 - cy);                  // the ward bell's pull-rope on an iron bracket in the wall
      R(g, X - 3, Y, 8, 2, S.dk); R(g, X - 3, Y, 8, 1, S.f); R(g, X, Y + 2, 1, 12, '#a0885a'); R(g, X - 1, Y + 14, 3, 4, '#7a5a30'); R(g, X - 1, Y + 14, 3, 1, '#c9a870'); }
    else if (d.k === 'winchframe') { const X = Math.round(d.x * 16 + 8 - cx), Y = Math.round(d.y * 16 - cy);               // the crag gate's hoist: a stone corbel and an iron beam over the tower arch
      corbel(g, d.x - 0.5, d.y, cx, cy, 1); R(g, X - 20, Y - 6, 44, 5, S.dk); R(g, X - 20, Y - 6, 44, 1, S.f); }
  }
}

// ---------------- THE PROPS ----------------
export function drawWinch(g, pr, cx, cy, TS, time) {                                                                      // the hoist: a stone bracket, an iron-bound oak drum with its crank, the chain run over a pulley to the gate
  const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy), gx = Math.round(pr.gate * TS + 8 - cx), gy = Math.round(pr.gy0 * TS - cy);
  R(g, x - 7, y - 2, 14, 2, S.d); R(g, x - 7, y - 2, 14, 1, S.f); R(g, x - 5, y - 18, 3, 16, S.c); R(g, x + 3, y - 18, 3, 16, S.c); R(g, x - 5, y - 18, 1, 16, S.e); R(g, x + 3, y - 18, 1, 16, S.e);   // the frame: two stone cheeks
  R(g, x - 6, y - 20, 13, 3, S.dk); R(g, x - 6, y - 20, 13, 1, S.f);
  R(g, x - 4, y - 16, 9, 10, '#4a3620'); R(g, x - 4, y - 16, 9, 1, '#7a5a3a'); R(g, x - 4, y - 7, 9, 1, '#1e140c'); for (const yy of [y - 14, y - 9]) R(g, x - 4, yy, 9, 1, '#2a2a34');   // the drum, banded in iron
  const a = pr.spin > 0 ? time * 18 : 0, hx = Math.round(Math.cos(a) * 6), hy = Math.round(Math.sin(a) * 6); g.strokeStyle = '#8a6a3a'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 0.5, y - 11.5); g.lineTo(x + hx + 0.5, y - 11.5 + hy); g.stroke(); R(g, x + hx - 1, y - 12 + hy, 3, 3, '#a0885a');
  g.strokeStyle = '#6a6a7c'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 0.5, y - 20); g.lineTo(gx + 0.5, gy - 12); g.stroke(); g.strokeStyle = '#b0b0c4'; g.setLineDash([2, 2]); g.stroke(); g.setLineDash([]);   // the chain
  R(g, gx - 3, gy - 14, 7, 7, S.dk); R(g, gx - 2, gy - 13, 5, 5, '#4a4a5a'); R(g, gx, gy - 11, 1, 1, '#c9a040');          // the pulley over the gate
  if (pr.open > 0) { R(g, x - 6, y - 26, Math.round(12 * pr.open / pr.hold), 2, '#ffd36b'); }
}
export function drawGrate(g, pr, cx, cy, TS, time, e) {                                                                  // the grate over an arch: square iron bars, strap bands, pointed tines at the foot
  const tk = pr.tellUntil > time ? Math.max(0, Math.min(1, pr.tellK || 0)) : 0;                                           // (claude/highcrown2bell) told: it SHUDDERS in its slot, rattling harder and sinking in jerks as the Queen hauls
  const x = Math.round(pr.gate * TS + 8 - cx) + (tk ? Math.round(Math.sin(time * 70) * (0.5 + tk * 1.1)) : 0), top = Math.round(pr.gy0 * TS - cy) + (tk ? Math.floor(tk * 4) + (Math.sin(time * 53) > 0.2 ? 1 : 0) : 0);
  const bars = (y0, y1) => { R(g, x - 9, y0, 18, 3, '#16161e'); R(g, x - 9, y0, 18, 1, '#6a6a80'); R(g, x - 9, y1 - 4, 18, 2, '#16161e'); R(g, x - 9, y0 + 12, 18, 2, '#16161e');
    for (let k = -8; k <= 8; k += 4) { R(g, x + k - 1, y0, 3, y1 - y0, '#34343f'); R(g, x + k - 1, y0, 1, y1 - y0, '#8a8aa0'); R(g, x + k + 1, y0, 1, y1 - y0, '#16161e'); }
    for (let k = -8; k <= 8; k += 4) { R(g, x + k - 1, y1, 3, 3, '#c9c9d6'); R(g, x + k, y1 + 3, 1, 2, '#c9c9d6'); } };
  if (e) { const hy = Math.round(e.y - (e.h || 30) - cy); bars(top - 6, Math.max(top, hy)); return; }
  if (pr.open > 0) return;
  bars(top - 12, top - 2);
  const k = 0.5 + 0.5 * Math.sin(time * 5); g.globalAlpha = 0.35 + 0.35 * k; R(g, x - 9, top - 1, 18, 1, tk ? '#ff8a5c' : '#ffd36b'); g.globalAlpha = 1;
}
export function drawBell(g, pr, cx, cy, time) {                                                                          // a cast-bronze bell on a yoke, hung from an iron bracket pinned to the stone: swings while its grate is down
  const bx = Math.round(pr.x - cx), by = Math.round(pr.y - cy), sw = pr.open > 0 ? Math.sin(time * 9) * 3 * Math.min(1, pr.open / 3) : pr.tellUntil > time ? Math.sin(time * 15) * 1.6 * Math.min(1, pr.tellK || 0) : 0, s = Math.round(sw);   // (claude/highcrown2bell) a bell tugged on its rope sways before it tolls
  R(g, bx - 9, by - 44, 20, 3, S.dk); R(g, bx - 9, by - 44, 20, 1, S.f); R(g, bx - 11, by - 43, 3, 8, S.c); R(g, bx + 9, by - 43, 3, 8, S.c);          // the bracket: a stone corbel pair and an iron beam
  R(g, bx, by - 41, 1, 26, '#5a5a6c'); R(g, bx - 1, by - 41, 1, 26, '#2a2a34');
  R(g, bx - 5 + s, by - 17, 11, 3, '#5a3a14'); R(g, bx - 4 + s, by - 15, 9, 7, '#8a6a2a'); R(g, bx - 3 + s, by - 15, 3, 8, '#c9a040'); R(g, bx - 6 + s, by - 8, 13, 3, '#a07828'); R(g, bx - 7 + s, by - 6, 15, 2, '#c9a040'); R(g, bx - 7 + s, by - 4, 15, 1, '#4a3010'); R(g, bx + 1 + s, by - 4, 2, 4, '#3a2a1a');
  if (!(pr.open > 0)) { const k = 0.5 + 0.5 * Math.sin(time * 5); g.globalAlpha = 0.3 + 0.4 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.ellipse(bx, by - 9, 9 + k, 10 + k, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
}
export function drawChandelierAnchor(g, x, top, by, time) {                                                              // a hall chandelier hangs from an iron ring in a stone boss: a chain of links, a crown-ring and its candles
  R(g, x - 5, top - 4, 11, 4, S.d); R(g, x - 5, top - 4, 11, 1, S.f); R(g, x - 3, top, 7, 2, S.dk); R(g, x - 1, top + 1, 3, 3, '#c9a040');
  for (let y = top + 3, i = 0; y < by - 16; y += 4, i++) { if (i & 1) { R(g, x, y, 1, 4, '#8a8aa0'); R(g, x - 1, y, 1, 4, '#3a3a48'); } else { R(g, x - 2, y, 4, 4, '#3a3a48'); R(g, x - 1, y + 1, 2, 2, '#0e0e14'); R(g, x - 2, y, 4, 1, '#a0a0b8'); } }
}

// ---------------- THE QUEEN RINGS HER BELL (claude/highcrown2bell): the warning on the grate's column, and the pull-rope run from the bell to her fists ----------------
// drawGrateFx: told for 0.9 s (k = 0 -> 1) the grate's whole column is lit - a faint warm wash, two lit edges, a hazard bar where the tines will land - and breathes faster as it goes.
export function drawGrateFx(g, pr, cx, cy, TS, time, k) {
  const x = Math.round(pr.gate * TS + 8 - cx), top = Math.round(pr.gy0 * TS - cy), bot = Math.round((pr.gy1 + 1) * TS - cy), pulse = 0.5 + 0.5 * Math.sin(time * (10 + k * 22));
  g.globalAlpha = 0.1 + 0.2 * k + 0.06 * pulse; R(g, x - 9, top, 18, bot - top, '#ff9a5c'); g.globalAlpha = 1;                    // the wash over the column
  g.globalAlpha = 0.25 + 0.4 * k; R(g, x - 10, top, 1, bot - top, '#ff8a5c'); R(g, x + 9, top, 1, bot - top, '#ff8a5c'); g.globalAlpha = 1;   // its edges
  for (let y = top + ((time * 40) | 0) % 8; y < bot - 4; y += 8) { g.globalAlpha = 0.1 + 0.25 * k; R(g, x - 1, y, 2, 3, '#ffd0a0'); }           // light running down it, toward the floor
  g.globalAlpha = 0.55 + 0.4 * pulse; for (let i = -9; i < 9; i += 4) { R(g, x + i, bot - 4, 2, 4, '#ffb04a'); R(g, x + i + 2, bot - 4, 2, 4, '#1a0f14'); } g.globalAlpha = 1;   // the tines' landing, striped
}
// drawQueenRope: a hemp rope from the bell's bracket to her fists; she hauls it taut across the tell (k 0 -> 1), it snaps taut at the toll (k = 1) and goes slack and swinging after (slack 0 -> 1).
export function drawQueenRope(g, bell, cx, cy, hx, hy, k, slack, time) {
  const ax = Math.round(bell.x - cx) + 11, ay = Math.round(bell.y - cy) - 42, bx = Math.round(hx - cx), by = Math.round(hy - cy), len = Math.hypot(bx - ax, by - ay);
  const sag = (1 - k) * 0.12 * len * (1 - slack) + slack * 0.14 * len * (0.5 + 0.5 * Math.cos(time * 9)) + 1.5, n = Math.min(200, Math.ceil(len / 1.5));
  for (let pass = 0; pass < 2; pass++) for (let i = 0; i <= n; i++) { const t = i / n, px = ax + (bx - ax) * t, py = ay + (by - ay) * t + sag * 4 * t * (1 - t) + 1 - pass;
    R(g, Math.round(px), Math.round(py), 2, 2 - (1 - pass), pass ? ((i >> 1) & 1 ? '#c9b27c' : '#a0885a') : '#2a1c0c'); }                                // twisted hemp, its shadow a pixel under
  R(g, ax - 1, ay - 1, 3, 3, '#3a3a48'); R(g, ax, ay, 1, 1, '#c9a040');                                                                       // the ring it runs through at the bracket
}
// grateTiles(n): the dropped grate, n tiles tall, for the portcullis slide and the tiles it lands as (main.js gqRing): square iron bars, strap bands top and middle, tines on the last tile
export function grateTiles(n) { return once('grate' + n, () => Array.from({ length: n }, (_, i) => { const [c, g] = canvas(16, 16), last = i === n - 1;
  for (const x of [1, 5, 9, 13]) { const y1 = last ? 12 : 16; R(g, x, 0, 3, y1, '#34343f'); R(g, x, 0, 1, y1, '#8a8aa0'); R(g, x + 2, 0, 1, y1, '#16161e');
    if (last) { R(g, x, y1, 3, 2, '#c9c9d6'); R(g, x + 1, y1 + 2, 1, 2, '#c9c9d6'); } }
  if (i === 0) { R(g, 0, 0, 16, 3, '#16161e'); R(g, 0, 0, 16, 1, '#6a6a80'); for (const x of [3, 11]) R(g, x, 1, 1, 1, '#c9a040'); }
  R(g, 0, 7, 16, 2, '#16161e'); R(g, 0, 7, 16, 1, '#55556a');
  return c; })); }
