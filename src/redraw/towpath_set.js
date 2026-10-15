// towpath_set.js - THE TOWPATH's SET PIECES, painted (claude/towpath2art): the rooms (the lock-keeper's hut, the cottage, the mill's loft and sack floor with the hoist's shaft, the
// lock-keeper's tower, the culvert), the back walls of every lock, race and cut, the aqueduct's trough plate and gorge, the basin's far quay, and - after the tiles - the facades and
// frames that hang on the solid blocks: the warehouses, the tower's roof and its BEACON, the six ruined piers' arch stubs, the break's torn iron, the mill's hoist beam, the net rack,
// the last lock's floor of old gate timbers, the arena's bollards. Every coordinate is a DESIGN column / row (src/towpath.js, rows laid O lower). Pure drawing on a 2d context.
//   paintRoom(g, st, sx, sy, w, h, tx0, ty0, time) -> true if it painted (main.js drawRoomPaint, room-local coordinates)
//   drawBack(g, cx, cy, VW, VH, L, time)    behind the tiles, world-anchored: lock/pound back walls, the gorge, the basin's far quay
//   drawFront(g, cx, cy, VW, VH, L, time, X) over the tiles: facades, frames, the beacon; X = { light(x, y) }
import { TC } from './towpath_tiles.js';
import { mulberry } from '../px.js';
import { drawHull } from './towpath_gear.js';
import { drawMastTop } from './towpath_gear2.js';
const R = Math.round, TS = 16;
const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const px1 = (g, x, y, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), 1, 1); };
const glow = (g, x, y, r, a, col = '255,211,107') => { if (a <= 0.01) return; const gr = g.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, 'rgba(' + col + ',' + a.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.fillRect(R(x - r), R(y - r), R(r * 2), R(r * 2)); };
const line = (g, x0, y0, x1, y1, col, w = 1) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(R(x0) + 0.5, R(y0) + 0.5); g.lineTo(R(x1) + 0.5, R(y1) + 0.5); g.stroke(); g.lineWidth = 1; };
const O = 9;
const AMBER = '#ffd36b';
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
/* a beam of moonlight: a pale slanted shaft, faint */
function shaft(g, x, y, w, h, slant, a = 0.1) { g.fillStyle = 'rgba(170,205,215,' + a + ')'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.lineTo(x + w + slant, y + h); g.lineTo(x + slant, y + h); g.closePath(); g.fill(); }
/* motes drifting in a light (flour, dust) */
function motes(g, x, y, w, h, time, n = 8, col = '210,222,226') { for (let i = 0; i < n; i++) { const u = (time * 0.07 + i / n) % 1; g.fillStyle = 'rgba(' + col + ',' + (0.35 * Math.sin(u * Math.PI)).toFixed(2) + ')'; g.fillRect(R(x + ((i * 37) % w) + Math.sin(time + i) * 3), R(y + u * h), 1, 1); } }

/* a plank wall (vertical boards, tarred battens), a tone */
function planks(g, x, y, w, h, base, hi, lo) { rc(g, x, y, w, h, base); for (let i = 0; i < w; i += 6) { rc(g, x + i, y, 1, h, lo); rc(g, x + i + 1, y, 1, h, hi); } for (let j = 5; j < h; j += 23) rc(g, x, y + j, w, 1, lo); }
/* a stone back wall: dark coursed ashlar */
function ashlarWall(g, x, y, w, h, seed, dark = 0) { const r = mulberry(seed); rc(g, x, y, w, h, '#0c1214'); for (let row = 0; row * 8 < h; row++) { let cx0 = -((row & 1) * 6) - (seed % 5); while (cx0 < w) { const bw = 10 + ((r() * 8) | 0), t = r(); if (cx0 + bw > 0) { rc(g, x + Math.max(0, cx0 + 1), y + row * 8 + 1, Math.min(bw - 1, w - Math.max(0, cx0 + 1), cx0 + bw - 1), 6, t < 0.2 ? '#1e2c30' : t < 0.55 ? '#18242a' : '#142026'); } cx0 += bw; } } if (dark) { g.fillStyle = 'rgba(0,0,0,' + dark + ')'; g.fillRect(x, y, w, h); } }
/* a king-post truss under a roof: the tie beam, the post, two struts */
function truss(g, x, y, w, h) { rc(g, x, y + h - 3, w, 3, '#2a2c24'); rc(g, x, y + h - 3, w, 1, '#4a4c3c'); rc(g, x + w / 2 - 2, y, 4, h - 3, '#262820'); line(g, x + 2, y + h - 4, x + w / 2, y + 2, '#262820', 2); line(g, x + w - 2, y + h - 4, x + w / 2, y + 2, '#262820', 2); }
function sack(g, x, y, w = 9, h = 8, tone = 0) { const c = ['#4a4638', '#5a5440', '#3e3c30'][tone % 3]; rc(g, x, y - h, w, h, c); rc(g, x + 1, y - h - 1, w - 2, 1, c); rc(g, x + 2, y - h - 2, w - 4, 1, c); rc(g, x, y - h, w, 1, '#7a7660'); rc(g, x, y - 1, w, 1, '#1a1a14'); rc(g, x + w - 2, y - h, 1, h, '#2a281e'); rc(g, x + 2, y - h + 3, w - 4, 1, '#2a281e'); }
function barrel(g, x, y, h = 11) { rc(g, x, y - h, 9, h, '#3a3028'); rc(g, x - 1, y - h + 2, 11, h - 4, '#3a3028'); rc(g, x - 1, y - h + 3, 11, 1, '#6a6a56'); rc(g, x - 1, y - 4, 11, 1, '#6a6a56'); rc(g, x, y - h, 9, 1, '#6a5a44'); rc(g, x + 1, y - h + 2, 1, h - 4, '#5a4838'); }
function window(g, x, y, w, h, glass = '#1a3040') { rc(g, x - 1, y - 1, w + 2, h + 2, '#0a0e10'); rc(g, x, y, w, h, glass); rc(g, x, y, w, 1, '#4a6a7a'); rc(g, x + w / 2, y, 1, h, '#0a0e10'); rc(g, x, y + h / 2, w, 1, '#0a0e10'); px1(g, x + 1, y + 1, '#8ab4c4'); }

export function paintRoom(g, st, sx, sy, w, h, tx0, ty0, time) {
  if (!String(st).startsWith('tp')) return false;
  const Lx = c => (c - tx0) * TS, Ly = r => (r + O - ty0) * TS;   /* a design column / row -> room-local px (its top-left) */
  const bx = c => Lx(c) + TS / 2;
  if (st === 'tpHut') {
    planks(g, 0, 0, w, h, '#1c1e1a', '#2c2e26', '#101210');
    rc(g, 0, 0, w, 4, '#0c0e0c'); rc(g, 0, h - 5, w, 5, '#161410'); rc(g, 0, h - 5, w, 1, '#3a3a2c');   /* the lintel, the floor */
    window(g, Lx(42) + 3, Ly(35) + 6, 11, 12, '#1c3848'); shaft(g, Lx(42), Ly(35) + 18, 16, 28, -10, 0.07);
    rc(g, Lx(40) + 3, Ly(36) + 4, 18, 11, '#2a261c'); rc(g, Lx(40) + 3, Ly(36) + 4, 18, 1, '#5a5440'); for (let i = 0; i < 5; i++) rc(g, Lx(40) + 5 + i * 3, Ly(36) + 6, 1, 7, '#3a3626'); rc(g, Lx(40) + 8, Ly(36) + 8, 8, 2, '#8a2a24');   /* a chart on the wall: rolled pins, the river drawn in red */
    rc(g, Lx(41) + 10, Ly(35) + 8, 3, 7, '#241e16'); rc(g, Lx(41) + 10, Ly(35) + 8, 1, 7, '#5a4a34'); rc(g, Lx(41) + 4, Ly(35) + 4, 2, 6, '#2a2a22');   /* the lantern's hook bracket and a shelf post */
    rc(g, Lx(41) + 14, Ly(37) + 4, 16, 3, '#2a2218'); rc(g, Lx(41) + 14, Ly(37) + 4, 16, 1, '#5a4a34'); rc(g, Lx(41) + 16, Ly(37) + 7, 2, 6, '#1a1610'); rc(g, Lx(41) + 28, Ly(37) + 7, 2, 6, '#1a1610');   /* a table */
    rc(g, Lx(41) + 20, Ly(37) + 1, 3, 3, '#c8c0a0'); px1(g, Lx(41) + 21, Ly(37), AMBER); glow(g, Lx(41) + 21, Ly(37), 12, 0.2);   /* the stub of a candle */
    for (let i = 0; i < 6; i++) rc(g, Lx(40) + 1 + i, Ly(37) + 6 + (i & 1), 2, 2, '#4a4a34');   /* coiled line on the floor */
    return true; }
  if (st === 'tpCottage') {
    rc(g, 0, 0, w, h, '#2a2e2c'); for (let j = 0; j < h; j += 8) rc(g, 0, j, w, 1, '#222624'); for (let i = 0; i < w; i += 16) rc(g, i + ((i / 16) & 1) * 8, 0, 1, h, '#222624');   /* limewash, coursed */
    rc(g, 0, h - 5, w, 5, '#1a1612'); rc(g, 0, h - 5, w, 1, '#4a3a2c'); rc(g, 0, 0, w, 3, '#0c0e0c');
    rc(g, 6, h - 36, 22, 31, '#0e0c0a'); rc(g, 8, h - 34, 18, 29, '#05060a'); rc(g, 4, h - 38, 26, 3, '#3a3a34'); const fl = 0.7 + 0.3 * Math.sin(time * 9) * Math.sin(time * 5.3);   /* the hearth */
    glow(g, 17, h - 14, 32, 0.34 * fl, '255,150,60'); rc(g, 12, h - 10, 10, 4, '#b84a1a'); rc(g, 14, h - 13, 6, 3, '#e8802a'); rc(g, 16, h - 15, 2, 3, '#ffd36b');
    window(g, w - 28, 14, 12, 12, '#1c3040'); shaft(g, w - 28, 28, 12, 30, -8, 0.06);
    rc(g, w - 12, h - 28, 3, 23, '#241e16'); rc(g, w - 10, h - 20, 12, 2, '#2a2218');   /* a settle */
    for (let i = 0; i < 4; i++) rc(g, 34 + i * 6, 6 + (i & 1) * 2, 1, 8 + (i & 1) * 3, '#3a4a34');   /* hung herbs */
    return true; }
  if (st === 'tpMill') {
    /* the back wall: soot-dark timber and brick, posts at the shaft and the walls, the roof's trusses over the sack floor, joists under it */
    const topR = Ly(12), sackR = Ly(19), loftR = Ly(27);
    rc(g, 0, 0, w, h, '#141210'); for (let j = 0; j < h; j += 8) { for (let i = -((j / 8 & 1) * 8); i < w; i += 16) rc(g, i + 1, j + 1, 14, 6, (i * 7 + j) % 5 === 0 ? '#241e1c' : '#1c1816'); }
    for (const c of [110, 115, 120, 124]) { rc(g, Lx(c) + 6, 0, 5, h, '#201e18'); rc(g, Lx(c) + 6, 0, 1, h, '#3a382c'); }   /* the posts */
    for (let c = 110; c < 124; c += 4) truss(g, Lx(c), topR, TS * 4, TS * 2);   /* the roof's trusses */
    rc(g, 0, topR - 2, w, 3, '#2a2820');
    /* the sack floor's joists, seen from under (the planks are the one-way tiles); and the loft's beams */
    rc(g, 0, sackR + 2, w, 4, '#1a1812'); rc(g, 0, sackR + 2, w, 1, '#3a382c'); for (let i = 0; i < w; i += 12) rc(g, i, sackR + 6, 3, 5, '#1a1812');
    /* THE HOIST'S SHAFT (cols 115-116): two guide posts from the roof to the loft floor, a cross-brace, the sheave housing at the top */
    const sx0 = Lx(115), sx1 = Lx(117);
    rc(g, sx0 - 1, topR, 4, loftR - topR, '#242218'); rc(g, sx1 - 3, topR, 4, loftR - topR, '#242218'); rc(g, sx0 - 1, topR, 1, loftR - topR, '#4a4636'); rc(g, sx1 - 3, topR, 1, loftR - topR, '#4a4636');
    rc(g, sx0 + 3, topR, sx1 - sx0 - 6, loftR - topR, '#0a0806');
    for (let y = topR + 20; y < loftR; y += 44) { line(g, sx0 + 2, y, sx1 - 2, y + 22, '#2a281e'); }
    rc(g, sx0 - 4, topR + 4, sx1 - sx0 + 8, 8, '#1c1a14'); rc(g, sx0 - 4, topR + 4, sx1 - sx0 + 8, 1, '#4a4636'); for (const sxx of [sx0 + 8, sx1 - 8]) { g.strokeStyle = '#6a6a56'; g.beginPath(); g.arc(sxx + 0.5, topR + 14.5, 5, 0, Math.PI * 2); g.stroke(); rc(g, sxx - 1, topR + 13, 3, 3, '#8a8a70'); }
    /* THE SACK FLOOR: sacks stacked either side, a hanging oil lamp, the sack door in the east wall with the night in it */
    for (const [c, n] of [[111, 3], [112, 2], [118, 4], [119, 3], [121, 3], [122, 2]]) for (let k = 0; k < n; k++) sack(g, Lx(c) + 2 + (k & 1) * 3, sackR - k * 8, 10, 8, c + k);
    barrel(g, Lx(123), sackR, 12); barrel(g, Lx(123) + 3, sackR - 12, 10);
    const lx = Lx(120) + 8, ly = topR + 26; line(g, lx, topR, lx, ly, '#4a4636'); rc(g, lx - 3, ly, 7, 8, '#10100c'); rc(g, lx - 2, ly + 1, 5, 6, AMBER); rc(g, lx - 1, ly + 2, 3, 4, '#fff4c8'); glow(g, lx, ly + 4, 58, 0.26 + 0.04 * Math.sin(time * 6)); glow(g, lx, ly + 4, 14, 0.3);
    const dx = Lx(124), dy = Ly(17);   /* the sack door: a bright opening onto the night */
    rc(g, dx, dy, TS, 2 * TS, '#1e3a48'); rc(g, dx, dy, TS, 2 * TS, '#2a4e5e'); rc(g, dx, dy, TS, 4, '#4a7a8a'); shaft(g, dx - 40, dy + 4, 24, 70, -30, 0.08);
    /* THE LOFT: the millstones (a runner on its bed, a hopper and a horse over it), the great cog on the wheel's shaft, a dust in the moon from the loft door */
    const mx = Lx(111) + 10, my = loftR;
    rc(g, mx - 16, my - 14, 32, 14, '#241e18'); rc(g, mx - 16, my - 14, 32, 2, '#4a4030'); rc(g, mx - 14, my - 22, 28, 8, '#3a3a34'); rc(g, mx - 14, my - 22, 28, 2, '#6a6a60'); for (let i = 0; i < 6; i++) line(g, mx, my - 18, mx + Math.cos(i * 1.05) * 12, my - 18 + Math.sin(i * 1.05) * 2, '#1a1a16');   /* the stone's furrows */
    g.fillStyle = '#2a2a22'; g.beginPath(); g.moveTo(mx - 10, my - 44); g.lineTo(mx + 10, my - 44); g.lineTo(mx + 4, my - 24); g.lineTo(mx - 4, my - 24); g.closePath(); g.fill(); rc(g, mx - 10, my - 44, 20, 1, '#5a5a48');   /* the hopper */
    const cg = Lx(110) + 4, cgy = Ly(23); g.fillStyle = '#2a2420'; g.beginPath(); g.arc(cg + 0.5, cgy + 0.5, 15, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#4a4030'; g.beginPath(); g.arc(cg + 0.5, cgy + 0.5, 15, 0, Math.PI * 2); g.stroke();
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6 + time * 0.05; rc(g, cg + Math.cos(a) * 15 - 1, cgy + Math.sin(a) * 15 - 2, 3, 4, '#5a4a34'); } rc(g, cg - 3, cgy - 3, 6, 6, '#16120e'); rc(g, cg - 1, cgy - 1, 2, 2, '#6a6a56');
    rc(g, Lx(110), cgy - 2, TS, 4, '#2a2218'); rc(g, Lx(113), loftR - 36, 3, 36, '#201c14'); rc(g, Lx(113) - 4, loftR - 40, 11, 4, '#201c14');   /* the line shaft and its bearing */
    for (const [c, n] of [[121, 3], [122, 2]]) for (let k = 0; k < n; k++) sack(g, Lx(c) + 2 + (k & 1) * 2, loftR - k * 8, 10, 8, c + k + 1);
    const ldx = Lx(124), ldy = Ly(24); rc(g, ldx, ldy, TS, 3 * TS, '#1e3a48'); rc(g, ldx, ldy, TS, 3 * TS, '#2a4e5e'); rc(g, ldx, ldy, TS, 4, '#4a7a8a'); shaft(g, ldx - 60, ldy + 4, 30, 50, -40, 0.08); motes(g, Lx(118), ldy, 90, 56, time, 14);
    motes(g, Lx(112), topR + 10, 60, 60, time, 6);
    return true; }
  if (st === 'tpTower') {
    ashlarWall(g, 0, 0, w, h, 77, 0.2);
    for (let r2 = 0; r2 < h; r2 += 32) rc(g, 0, r2 + 30, w, 2, '#0a1012');   /* the floors' string courses */
    for (const [c, r] of [[221, -5], [224, -5], [221, 2], [224, 2]]) { const x = Lx(c) + 6, y = Ly(r); rc(g, x, y, 4, 20, '#060a0c'); rc(g, x - 1, y, 6, 1, '#3a4e50'); rc(g, x + 1, y + 2, 2, 16, '#2a4a58'); shaft(g, x - 1, y + 20, 6, 36, -14, 0.08); }   /* the arrow slits and their moonlight */
    rc(g, Lx(220) + 2, Ly(-6), 2, 6, '#262820'); rc(g, Lx(220), Ly(-6), 5, 3, '#6a5a3a'); /* a hung bucket */
    for (const [c, r] of [[220, -3], [225, -1]]) { rc(g, Lx(c) + 6, Ly(r), 3, 8, '#1a1612'); rc(g, Lx(c) + 5, Ly(r) - 2, 5, 3, '#4a4a40'); }   /* torch brackets, unlit */
    barrel(g, Lx(224) + 2, Ly(-2), 12); barrel(g, Lx(225), Ly(-2), 11); rc(g, Lx(224) + 14, Ly(-2) - 7, 7, 7, '#2a2218');   /* the beacon's oil casks on the upper floor */
    rc(g, Lx(220) + 6, Ly(3) - 14, 16, 3, '#2a2218'); rc(g, Lx(220) + 8, Ly(3) - 11, 2, 11, '#1a1612'); rc(g, Lx(220) + 20, Ly(3) - 11, 2, 11, '#1a1612');   /* a keeper's bench by the door */
    rc(g, Lx(222) + 6, Ly(-7) + 2, 4, 2, '#8a8a70');
    return true; }
  if (st === 'tpWarehouse') return true;
  if (st === 'tpCulvert') {
    rc(g, 0, 0, w, h, '#0c1214'); const r = mulberry(31);
    for (let y = 0; y < h; y += 4) for (let x = ((y / 4) & 1) * 4; x < w; x += 8) rc(g, x, y, 7, 3, r() < 0.22 ? '#2a1e20' : '#1c1618');   /* soot brick */
    for (let i = 0; i < w; i += 32) { for (let k = 0; k < 8; k++) { rc(g, i + k * 2, 0, 2, 4 + Math.round(Math.sin(k / 7 * Math.PI) * 6), '#0a0c0e'); } rc(g, i, 0, 1, h, '#241c1c'); }   /* the vault's ribs */
    for (let i = 0; i < 4; i++) { const x = 8 + ((i * 37) % (w - 16)); const u = (time * 1.2 + i * 0.37) % 1; rc(g, x, 4, 1, 12, '#1a3a3a'); rc(g, x, 8 + u * (h - 12), 1, 2, 'rgba(160,210,230,0.7)'); }   /* drips */
    rc(g, 0, h - 5, w, 5, '#101a1c'); rc(g, 0, h - 3, w, 2, TC.moss0);
    rc(g, w - 14, 6, 14, h - 10, '#06090a'); for (let x = w - 14; x < w; x += 3) rc(g, x, 6, 1, h - 10, '#4a545c');   /* the grate at the far end */
    return true; }
  return false;
}

/* ============================ BEHIND THE TILES: back walls of the chambers, races and cuts; the gorge; the basin's far quay ============================ */
const wallPatC = () => once('wallpat', () => { const [c, g] = mk(48, 48); ashlarWall(g, 0, 0, 48, 48, 9, 0); return c; });
export function drawBack(g, cx, cy, VW, VH, L, time) {
  const D = L.towpath; if (!D) return;
  const vx0 = cx, vx1 = cx + VW;
  const fillWall = (x0, x1, y0, y1, dark) => { x0 = Math.max(x0, vx0 - 16); x1 = Math.min(x1, vx1 + 16); if (x1 <= x0 || y1 <= y0 - 1) return; const oy = R(y0 - cy); g.save(); g.beginPath(); g.rect(R(x0 - cx), oy, R(x1 - x0), R(y1 - y0)); g.clip();
    for (let yy = 0; yy < y1 - y0; yy += 48) for (let xx = ((x0 % 48) + 48) % 48 * -1; xx < x1 - x0; xx += 48) g.drawImage(wallPatC(), R(x0 - cx + xx), oy + yy); g.restore(); if (dark) { g.fillStyle = 'rgba(0,0,0,' + dark + ')'; g.fillRect(R(x0 - cx), oy, R(x1 - x0), R(y1 - y0)); } };
  /* every lock chamber, race pit and cut: a dark coursed wall behind the water, from over the high water down to the bed */
  for (const p of (L.pools || [])) { if (!p.tp || p.x1 < vx0 || p.x0 > vx1) continue; const lk = (D.locks || []).find(q => q.id === p.tp); const top = lk ? (Math.min(lk.lo, lk.hi) - 3) * TS : p.y - 20; fillWall(p.x0, p.x1, top, p.bottom, 0.18); }
  /* the gorge under the aqueduct: dark rock walls, strata, ivy and a pale seep - from the trough's piers down to the river */
  const gx0 = 236 * TS, gx1 = 297 * TS, gy0 = (9 + O) * TS;
  if (gx1 > vx0 && gx0 < vx1) { const x0 = Math.max(gx0, vx0 - 8), x1 = Math.min(gx1, vx1 + 8), oy = R(gy0 - cy); rc(g, x0 - cx, oy, x1 - x0, VH * 2, '#0a1012');
    const r = mulberry(1234); for (let x = R(x0 / 8) * 8; x < x1; x += 8) { const t = r(), hh = 2 + ((x / 8) % 7), cl = t < 0.3 ? '#14222a' : t < 0.7 ? '#10181e' : '#18262c'; rc(g, x - cx, oy, 8, VH * 2, cl); if (t > 0.8) rc(g, x - cx + 2, oy + 6, 2, 30 + ((x / 8) % 5) * 12, '#1e3a3c'); }
    for (let y = oy + 20; y < oy + VH * 2; y += 22) { rc(g, x0 - cx, y, x1 - x0, 1, '#060a0c'); }
    for (let i = 0; i < 6; i++) { const ex = gx1 + i * 12; if (ex < vx0 - 16 || ex > vx1) continue; g.globalAlpha = 1 - (i + 1) / 7; rc(g, ex - cx, oy + (i % 2) * 8, 12, VH * 2, '#0a1012'); rc(g, ex - cx + 3, oy + 10 + i * 3, 2, 40, '#1e3a3c'); } g.globalAlpha = 1; for (let i = 0; i < 16; i++) { const wx = x0 + ((i * 53) % (x1 - x0)); rc(g, wx - cx, oy + (i * 11) % 60, 2, 16 + (i * 7) % 30, '#2c5a3c'); } }
  /* THE BASIN's far quay: dark brick under arches with iron mooring rings, behind the water (cols 305-371, from row 18 down) */
  const bx0 = 305 * TS, bx1 = 372 * TS, by0 = (16 + O) * TS;
  if (bx1 > vx0 && bx0 < vx1) { const x0 = Math.max(bx0, vx0 - 8), x1 = Math.min(bx1, vx1 + 8); fillWall(x0, x1, by0, (30 + O) * TS, 0.1);
    for (let ax = R(x0 / 80) * 80; ax < x1; ax += 80) { const sxs = ax - cx, syy = by0 - cy + 22; g.fillStyle = '#05090a'; g.beginPath(); g.moveTo(sxs, syy + 70); g.lineTo(sxs, syy + 20); g.quadraticCurveTo(sxs + 24, syy - 14, sxs + 48, syy + 20); g.lineTo(sxs + 48, syy + 70); g.closePath(); g.fill(); g.strokeStyle = '#2a3c42'; g.beginPath(); g.moveTo(sxs, syy + 20); g.quadraticCurveTo(sxs + 24, syy - 14, sxs + 48, syy + 20); g.stroke();
      rc(g, sxs + 60, syy + 28, 4, 4, '#4a545c'); rc(g, sxs + 61, syy + 29, 2, 2, '#0a1012'); } }
  /* THE ARENA's far wall: the lock-house and warehouse backs of the towpath's end, windows lit low, lamps strung (x from the arena's west door to its east wall) */
  const A = L.arena; if (A && A.fk) { const ax0 = A.x0, ax1 = A.x1; if (ax1 > vx0 && ax0 < vx1) { const top = A.y0, bot = A.y1; fillWall(Math.max(ax0, vx0 - 8), Math.min(ax1, vx1 + 8), top, bot + 120, 0.3);
    const r = mulberry(99); for (let c = 0; c < 52; c += 6) { const wx = ax0 + c * TS + 12, wy = top + 40 + (c % 12) * 3; if (wx < vx0 - 30 || wx > vx1 + 30) continue; window(g, R(wx - cx), R(wy - cy), 10, 14, c % 12 === 0 ? '#5a4a22' : '#0a1418'); if (c % 12 === 0) glow(g, wx - cx + 5, wy - cy + 8, 22, 0.14); }
    rc(g, ax0 - cx + 100, top - cy + 4, 4, 70, '#10181c'); } }
}
/* ============================ OVER THE TILES ============================ */
export function drawFront(g, cx, cy, VW, VH, L, time, X) {
  const D = L.towpath; if (!D) return; const light = (X && X.light) || (() => 0);
  const S = (c, r) => [R(c * TS - cx), R((r + O) * TS - cy)];   /* a design column / row -> screen px (top-left) */
  const vis = (c0, c1) => c1 * TS > cx - 40 && c0 * TS < cx + VW + 40;
  /* ----- THE HUT's exterior: a stovepipe and its smoke, a sign hung under the eave, the lantern hook ----- */
  if (vis(39, 45)) { const [x, y] = S(41, 34); rc(g, x + 28, y - 10, 5, 10, '#10161a'); rc(g, x + 27, y - 12, 7, 2, '#2a3036'); for (let i = 0; i < 4; i++) { const u = (time * 0.2 + i / 4) % 1; g.fillStyle = 'rgba(120,150,150,' + (0.3 * (1 - u)).toFixed(2) + ')'; g.fillRect(x + 28 + Math.sin(u * 6 + i) * 3, y - 14 - u * 22, 5, 3); }
    rc(g, x - 14, y + 2, 14, 7, '#241e16'); rc(g, x - 14, y + 2, 14, 1, '#5a4a34'); px1(g, x - 12, y + 5, '#b8b4a0'); px1(g, x - 8, y + 5, '#b8b4a0'); px1(g, x - 4, y + 5, '#b8b4a0'); }   /* LOCK-KEEPER sign */
  /* ----- THE COTTAGE's chimney and its smoke ----- */
  if (vis(66, 76)) { const [x, y] = S(72, 29); rc(g, x + 4, y - 14, 8, 14, '#18222a'); rc(g, x + 3, y - 16, 10, 3, '#2a3a42'); for (let i = 0; i < 5; i++) { const u = (time * 0.18 + i / 5) % 1; g.fillStyle = 'rgba(130,160,160,' + (0.34 * (1 - u)).toFixed(2) + ')'; g.fillRect(x + 7 + Math.sin(u * 5 + i) * 4, y - 20 - u * 30, 6, 4); } }
  /* ----- THE MILL: its roof's ridge and vane, the wheel-pit's lintel and sluice, the hoist's jib over the sack door, the gantry's rail and posts ----- */
  if (vis(96, 135)) { const [x, y] = S(116, 11); rc(g, x - 2, y - 12, 4, 12, '#10161a'); rc(g, x - 8, y - 14, 16, 2, '#10161a'); rc(g, x + 6, y - 18, 6, 4, '#10161a'); px1(g, x + 12, y - 16, '#5a6a68');   /* the vane */
    const [wx, wy] = S(108, 26); rc(g, wx - 2, wy - 4, 6, 6, '#2a3036');
    const [jx, jy] = S(125, 16); rc(g, jx + 8, jy + 10, 28, 3, '#1a1812'); rc(g, jx + 8, jy + 10, 28, 1, '#4a4636'); line(g, jx + 14, jy + 12, jx + 30, jy + 12, '#262218', 2); line(g, jx + 18, jy + 12, jx + 14, jy + 22, '#262218', 1); line(g, jx + 34, jy + 13, jx + 34, jy + 30, '#5a5a44');   /* the sack-door beam and its rope */
    rc(g, jx + 30, jy + 30, 8, 7, '#3e3c30'); rc(g, jx + 30, jy + 29, 8, 1, '#6a6650'); rc(g, jx + 32, jy + 27, 4, 3, '#3e3c30');   /* a sack on the rope */
    const [gx, gy] = S(126, 19); for (const c of [0, 2, 4, 5]) { rc(g, gx + c * TS + 6, gy - 13, 2, 13, '#10161a'); } rc(g, gx + 2, gy - 13, 6 * TS - 4, 2, '#10161a'); rc(g, gx + 2, gy - 13, 6 * TS - 4, 1, '#3a4448'); rc(g, gx + 2, gy - 7, 6 * TS - 4, 1, '#10161a'); }   /* the gantry's rail */
  /* ----- THE LOCK-KEEPER'S TOWER: its roof's cap and eaves, the BEACON (landmark) ----- */
  if (vis(214, 232)) { const [tx, ty] = S(222, -8);
    rc(g, tx - 52, ty + 2, 112, 3, '#1c2a30'); rc(g, tx - 52, ty + 2, 112, 1, '#5a7a78');   /* the eaves */
    for (let i = 0; i < 8; i++) { rc(g, tx - 44 + i * 13, ty - 4, 7, 6, '#142026'); rc(g, tx - 44 + i * 13, ty - 4, 7, 1, '#4a6a68'); }   /* crenellations */
    /* the beacon: an iron lantern-house on the roof - a glazed lamp, a cone cap, a weathervane; a slow sweep of light over the whole flight */
    const bx = tx + 8, by = ty - 6; rc(g, bx - 11, by - 4, 22, 5, '#161e22'); rc(g, bx - 11, by - 4, 22, 1, '#5a6a72'); rc(g, bx - 9, by - 24, 3, 20, '#161e22'); rc(g, bx + 6, by - 24, 3, 20, '#161e22'); rc(g, bx - 9, by - 24, 18, 3, '#161e22');
    g.fillStyle = '#161e22'; g.beginPath(); g.moveTo(bx - 12, by - 24); g.lineTo(bx, by - 36); g.lineTo(bx + 12, by - 24); g.closePath(); g.fill(); rc(g, bx - 12, by - 25, 24, 1, '#7a8a92'); rc(g, bx, by - 42, 1, 8, '#161e22'); rc(g, bx - 3, by - 40, 7, 1, '#161e22');
    const fl = 0.8 + 0.2 * Math.sin(time * 7) * Math.sin(time * 3.1); rc(g, bx - 6, by - 21, 12, 17, '#3a2a10'); rc(g, bx - 5, by - 20, 10, 15, AMBER); rc(g, bx - 3, by - 18, 6, 11, '#fff4c8'); rc(g, bx - 1, by - 15, 2, 6, '#ffffff');
    g.save(); g.globalCompositeOperation = 'lighter'; glow(g, bx, by - 13, 90, 0.34 * fl); glow(g, bx, by - 13, 34, 0.4 * fl); const sw = Math.sin(time * 0.6); g.fillStyle = 'rgba(255,214,130,' + (0.07 * fl).toFixed(3) + ')';
    g.beginPath(); g.moveTo(bx, by - 13); g.lineTo(bx + 340 * (0.5 + 0.5 * sw), by - 13 - 44); g.lineTo(bx + 340 * (0.5 + 0.5 * sw), by - 13 + 44); g.closePath(); g.fill(); g.beginPath(); g.moveTo(bx, by - 13); g.lineTo(bx - 340 * (0.5 - 0.5 * sw), by - 13 - 44); g.lineTo(bx - 340 * (0.5 - 0.5 * sw), by - 13 + 44); g.closePath(); g.fill(); g.restore(); }
  /* ----- THE AQUEDUCT: the trough's back plate, hand rails on the spans, the torn edges of the break ----- */
  if (vis(236, 290)) { const [a0] = S(241, 0), [a1] = S(274, 0), [, wy] = S(0, 7);
    /* (the channel's far wall: drawn behind the barge by hands; here only the walkway's rail and the sluice gantries' rails) */
    for (const [c0, c1, r] of [[236, 240, 6], [274, 289, 6]]) { const [x0, y0] = S(c0, r); rc(g, x0, y0 - 9, (c1 - c0 + 1) * TS, 1, '#6a7882'); for (let c = 0; c <= c1 - c0; c += 2) rc(g, x0 + c * TS + 6, y0 - 9, 2, 9, '#1c242a'); }
    for (const [c0, c1] of [[236, 240], [283, 289]]) { const [x0, y0] = S(c0, 3); rc(g, x0, y0 - 9, (c1 - c0 + 1) * TS, 1, '#6a7882'); for (let c = 0; c <= c1 - c0; c++) rc(g, x0 + c * TS + 6, y0 - 9, 2, 9, '#1c242a'); }
    const [bx0, by0] = S(252, 6), [bx1] = S(273, 6); const iron = (x, y, w, h, a) => { rc(g, x, y, w, h, '#0a0e10'); rc(g, x + 1, y + 1, w - 2, h - 2, a); };
    iron(bx0 - 14, by0 + 16, 14, 5, '#2c323a'); iron(bx0 - 10, by0 + 22, 10, 4, '#3a2a22'); iron(bx1 + 16, by0 + 16, 14, 5, '#2c323a'); iron(bx1 + 20, by0 + 22, 10, 4, '#3a2a22'); }
  /* ----- THE SIX RUINED PIERS: broken tops, arch springers reaching out, a pillar cap lit by the moon ----- */
  for (const [c, top] of [[292, 8], [297, 11], [302, 14], [307, 17], [312, 19], [317, 19]]) { if (!vis(c - 2, c + 6)) continue; const [x, y] = S(c, top);
    const r = mulberry(c); rc(g, x - 3, y - 4, 54, 4, '#2c4a50'); rc(g, x - 3, y - 4, 54, 1, '#8fb0ae'); for (let i = 0; i < 6; i++) rc(g, x - 3 + i * 9, y - 4 - (r() < 0.5 ? 2 : 0), 7, 2, '#3a5a5e');   /* the capital, its lit lip, a ragged top */
    for (let i = 0; i < 7; i++) { const a = i / 7, sx = x + 48 + i * 4, sy2 = y + 8 + Math.round(a * a * 14); rc(g, sx, sy2, 4, 6 - Math.floor(i / 3), i < 5 ? '#1e3236' : '#16262a'); rc(g, sx, sy2, 4, 1, '#3a5a5e'); }   /* the springer of the arch that once crossed to the next pier */
    for (let i = 0; i < 4; i++) { const sx = x - 8 - i * 4, sy2 = y + 8 + Math.round((i / 4) * (i / 4) * 12); rc(g, sx, sy2, 4, 5 - Math.floor(i / 2), '#1a2c30'); rc(g, sx, sy2, 4, 1, '#3a5a5e'); }
    px1(g, x + 20, y + 12, '#6a4a30'); rc(g, x + 19, y + 14, 3, 3, '#3a2a22'); }   /* an iron ring bolt */
  /* ----- THE BASIN: the net rack on the quay, mooring chains and a lamp ring ----- */
  if (vis(344, 350)) { const [x, y] = S(345, 16); for (const c of [0, 4]) rc(g, x + c * TS + 2, y - 26, 3, 26, '#10161a'); rc(g, x, y - 26, 4 * TS + 6, 2, '#10161a');
    for (let i = 0; i < 8; i++) { const nx = x + 6 + i * 7; rc(g, nx, y - 24, 1, 14 + (i & 1) * 4, '#2a3a38'); rc(g, nx + 3, y - 20, 1, 12 + (i % 3) * 3, '#2a3a38'); } for (let i = 0; i < 4; i++) rc(g, x + 8 + i * 16, y - 22, 4, 3, '#6a5a3a'); }   /* nets hung over the rail, floats */
  /* ----- THE SUNKEN BARGES: two hulls awash under their decks, their masts (the ratline tiles are the climb) topped with a crosstree, a tatter of sail and, on the tall one, a pennant ----- */
  if (vis(349, 362)) { const [x1, y1] = S(352, 20), [x2, y2] = S(357, 20); drawHull(g, x1 - 6, y1 - 1, 3 * TS + 12, 0.0, time); drawHull(g, x2 - 4, y2 - 1, 3 * TS + 10, 0.02, time);
    const [mx1, my1] = S(353, 12), [mx2, my2] = S(358, 9); drawMastTop(g, mx1 + 8, my1 - 1, false, time); drawMastTop(g, mx2 + 8, my2 - 1, true, time); }
  /* ----- THE WAREHOUSES: two tall brick fronts over the quay - lit windows high, cargo doors, hoist beams with rope and hook, name boards, shutters, sacks ----- */
  for (const [c0, c1, name] of [[372, 379, 'NORTH WHARF'], [383, 390, 'THE SALT STORE']]) { if (!vis(c0, c1)) continue; const [x, y] = S(c0, 3);
    const w = (c1 - c0 + 1) * TS;
    rc(g, x, y + 4 * TS - 2, w, 2, '#0a0e10');   /* a string course */
    for (let r2 = 0; r2 < 4; r2++) for (let k = 0; k < 3; k++) { const wx = x + 12 + k * 40, wy = y + 24 + r2 * 56; const on = ((c0 + k + r2) % 3) === 0; window(g, wx, wy, 14, 20, on ? '#4a3a18' : '#0e1c24'); if (on) { glow(g, wx + 7, wy + 12, 28, 0.2); rc(g, wx + 2, wy + 3, 10, 14, 'rgba(255,200,100,0.35)'); } else { rc(g, wx + 2, wy + 3, 4, 6, 'rgba(120,170,190,0.18)'); }
      rc(g, wx - 3, wy, 3, 20, '#161a16'); rc(g, wx + 14, wy, 3, 20, '#161a16'); }   /* shutters */
    rc(g, x + w - 38, y + 8 * TS + 6, 30, 5 * TS, '#0a0c0c'); rc(g, x + w - 36, y + 8 * TS + 8, 26, 5 * TS - 2, '#1a1612'); for (let i = 0; i < 4; i++) rc(g, x + w - 34 + i * 6, y + 8 * TS + 8, 1, 5 * TS - 2, '#0c0a08'); rc(g, x + w - 36, y + 8 * TS + 30, 26, 2, '#3a3c40');   /* a cargo door, banded */
    rc(g, x + 6, y + 6 * TS, w - 12, 18, '#0e1214'); rc(g, x + 6, y + 6 * TS, w - 12, 1, '#4a5a60'); const tx = x + w / 2 - name.length * 2.5; g.fillStyle = '#b8b4a0'; for (let i = 0; i < name.length; i++) if (name[i] !== ' ') g.fillRect(R(tx + i * 5), y + 6 * TS + 6, 3, 5);   /* the painted name board */
    rc(g, x + 4, y + 2, 30, 3, '#0a0e10'); rc(g, x + 4, y + 2, 30, 1, '#3a4a50'); line(g, x + 30, y + 4, x + 30, y + 40 + Math.round(Math.sin(time * 1.1 + c0) * 2), '#3a3a2c'); rc(g, x + 27, y + 40, 7, 3, '#5a5a44'); rc(g, x + 30, y + 43, 1, 5, '#5a5a44'); }   /* the hoist beam, rope and hook */
  /* ----- THE LAST LOCK's FLOOR: old gate timbers with iron bands, chain links, a stove-in rudder - found only in a light ----- */
  { const [x0, y0] = S(394, 27); if (vis(394, 406)) { const r = mulberry(77);
    for (let i = 0; i < 5; i++) { const px = x0 + 6 + i * 36 + ((i * 17) % 9), a = light(px + cx, (27 + O) * TS - 8); const al = Math.min(1, 0.18 + a * 1.6);
      g.globalAlpha = al; rc(g, px, y0 - 4, 24, 4, '#241a14'); rc(g, px, y0 - 4, 24, 1, '#6a4a30'); rc(g, px + 4, y0 - 4, 2, 4, '#5c3420'); rc(g, px + 14, y0 - 4, 2, 4, '#5c3420'); for (let k = 0; k < 5; k++) rc(g, px + 24 + k * 2, y0 - 2 + (k & 1), 2, 1, '#6a6a60'); g.globalAlpha = 1; } } }
  /* ----- THE ARENA's bollards: cast-iron mooring heads with a rope turn; the lamps' posts are the lamps' own ----- */
  { const A = L.arena; if (A && A.fk) { const sx0 = A.fk.sx, R0 = A.fk.R; for (const c of [8, 27, 34]) { const [x, y] = [R((sx0 + c) * TS - cx), R((R0 - 2) * TS - cy)]; if (x < -20 || x > VW + 20) continue;
      rc(g, x - 1, y - 7, TS + 2, 7, '#10161a'); rc(g, x - 1, y - 7, TS + 2, 1, '#8a949c'); rc(g, x + 4, y - 11, 8, 5, '#1c2428'); rc(g, x + 4, y - 11, 8, 1, '#b0bcc4'); rc(g, x + 3, y - 8, 10, 3, '#2a3036');
      for (let i = 0; i < 3; i++) rc(g, x + 3, y - 6 + i, 10, 1, '#5a5a44'); rc(g, x + 6, y - 6, 5, 6, '#4a4a38'); } } }
}
