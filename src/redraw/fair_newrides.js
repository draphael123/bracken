// fair_newrides.js - THE HARVEST FAIR's two new rides and its prize floors, drawn (claude/fairfix3; Daniel 2026-10-01: "more rides", "bull's-eye rooms unclear").
// Pure drawing from canvas primitives in the village kit's palette (fair_rides.js K). src/redraw/fair_rides.js calls drawBack / drawFront / drawMover.
//   drawBack   THE SWINGBOATS' A-frame and the partner boat swinging the other way behind; THE CHAIR-O-PLANE's mast, its turning crown and the chairs round the back
//              of it (small, dim, up under the crown - and a mummer riding one, as a shape)
//   drawMover  the swingboat you ride (a painted boat on two iron rods) and a near chair of the chair-o-plane (on its chains from the crown)
//   drawNests  THE PRIZE FLOORS a bull's-eye opens: once open, each plank run is a boarded walk with a lip and a post under it, and a nest has its prize stall's awning;
//              shut, the place shows as a faint outline of boards and a pennant, so you can see there is somewhere to go
import { boatAt, chairAt, CHAIRO } from '../fair-rides.js';
const TS = 16;
const K = { wood: '#7a5230', woodL: '#a67a48', woodD: '#4e321a', woodDD: '#2e1e10', brass: '#e8c23a', brassD: '#a87a18', red: '#b8382c', redD: '#7a2418', cream: '#ece0c4', creamD: '#c8b890',
  blue: '#3a7ab8', blueD: '#24507a', green: '#4a8a4a', iron: '#5a626c', ironL: '#8a919c', ink: '#120e14' };
const r = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const ln = (g, x0, y0, x1, y1, col, w = 1) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(Math.round(x0) + 0.5, Math.round(y0) + 0.5); g.lineTo(Math.round(x1) + 0.5, Math.round(y1) + 0.5); g.stroke(); };
const vis = (x0, x1, cx, VW, pad = 80) => x1 >= cx - pad && x0 <= cx + VW + pad;
const ROAD = 28 * TS;

/* ---- a swingboat: a clinker-built boat, its ends swept up, a painted band and a name board, hung from the pivot on two iron rods ---- */
function boat(g, x, y, w, px, py, a, col, dim) {   /* x,y: the seat's left and top (screen); px,py: the pivot (screen); a: the paint pair */
  g.globalAlpha = dim ? 0.55 : 1;
  ln(g, px, py, x + 8, y - 2, K.iron, 2); ln(g, px, py, x + w - 8, y - 2, K.iron, 2); ln(g, px - 1, py, x + 7, y - 2, K.ironL, 1);
  r(g, x + 2, y + 2, w - 4, 7, a[0]); r(g, x + 4, y + 9, w - 8, 3, a[0]);                      // the hull
  g.fillStyle = a[0]; g.beginPath(); g.moveTo(x - 4, y - 6); g.lineTo(x + 4, y + 2); g.lineTo(x + 6, y + 10); g.lineTo(x - 1, y + 4); g.closePath(); g.fill();   // the swept-up bow
  g.beginPath(); g.moveTo(x + w + 4, y - 6); g.lineTo(x + w - 4, y + 2); g.lineTo(x + w - 6, y + 10); g.lineTo(x + w + 1, y + 4); g.closePath(); g.fill();   // and stern
  r(g, x + 2, y + 5, w - 4, 2, a[1]); r(g, x + w / 2 - 9, y + 3, 18, 5, K.cream); r(g, x + w / 2 - 7, y + 4, 14, 1, col); r(g, x + w / 2 - 5, y + 6, 10, 1, col);   // the band and the name board
  r(g, x, y, w, 2, K.woodL); r(g, x, y + 2, w, 1, K.woodD);                                   // the gunwale you stand on
  for (const sx of [x - 3, x + w + 2]) { r(g, sx, y - 7, 2, 3, K.brass); }                     // the brass finials
  g.globalAlpha = 1;
}
function drawSwingboats(g, cx, cy, VW, L, time) {
  for (const m of L.moversExtra || []) { if (m.fair !== 'boat' || !vis(m.px - m.arm - 40, m.px + m.arm + 40, cx, VW)) continue;
    const px = m.px - cx, py = m.py - cy, gy = ROAD - cy;
    /* THE A-FRAME: two legs each side splayed out of the picture plane (drawn as a tall narrow A), a crossbar at the top, braces, a striped canopy board */
    for (const dx of [-26, 26]) { ln(g, px + dx, gy + 30, px + dx * 0.2, py - 6, K.woodDD, 4); ln(g, px + dx, gy + 30, px + dx * 0.2, py - 6, K.wood, 2); }
    ln(g, px - 20, py + 60, px + 20, py + 60, K.woodD, 2); ln(g, px - 23, py + 100, px + 23, py + 100, K.woodD, 2);
    r(g, px - 30, py - 12, 60, 6, K.woodD); r(g, px - 30, py - 12, 60, 1, K.woodL);
    for (let i = 0; i < 6; i++) r(g, px - 30 + i * 10, py - 22, 10, 10, i % 2 ? K.cream : K.red); r(g, px - 31, py - 23, 62, 1, K.brass);
    r(g, px - 4, py - 4, 8, 8, K.brassD); r(g, px - 2, py - 2, 4, 4, K.brass);                    // the bearing
    /* THE PARTNER BOAT, swinging the other way, behind: drawn only (one boat is the ride) */
    const b = boatAt(m, time), th = -b.th, bx = m.px + Math.sin(th) * m.arm - cx, by = m.py + Math.cos(th) * m.arm - cy;
    boat(g, bx - m.w / 2, by - 4, m.w - 6, px, py, [K.blue, K.cream], K.blueD, true);
  }
}
/* ---- the chair-o-plane: the mast, the crown (a striped cone that turns), the chairs ---- */
function chairSprite(g, x, y, w, crownX, crownY, i, dim, rider) {
  g.globalAlpha = dim ? 0.5 : 1;
  const cx2 = x + w / 2, col = i % 2 ? K.red : K.blue;
  for (const [ax, sh] of [[x + 5, -1], [x + w - 5, 1]]) { ln(g, crownX + sh * 3, crownY, ax, y - 12, '#2a2e36', 2); ln(g, crownX + sh * 3, crownY, ax, y - 12, '#c9d1dc', 1); }   // its two chains up to the crown's rim (light on dark: they read on the night)
  r(g, x + 3, y - 13, w - 6, 2, K.brassD); r(g, x + 3, y - 13, w - 6, 1, K.brass);                                          // the hanger bar
  r(g, cx2 - 7, y - 11, 14, 11, K.woodDD); r(g, cx2 - 6, y - 10, 12, 9, col); r(g, cx2 - 6, y - 10, 12, 1, K.cream); r(g, cx2 - 2, y - 7, 4, 3, K.cream);   // the bucket seat's back, painted, a roundel on it
  r(g, x, y, w, 5, K.woodD); r(g, x, y, w, 1, K.brass); r(g, x + 1, y + 1, w - 2, 3, col); r(g, x + 2, y + 5, 3, 3, K.woodD); r(g, x + w - 5, y + 5, 3, 3, K.woodD);   // the seat you stand on, and its footrest brackets
  if (rider) { g.fillStyle = '#1c1428'; g.fillRect(Math.round(x + w / 2 - 3), Math.round(y - 14), 6, 13); g.fillRect(Math.round(x + w / 2 - 2), Math.round(y - 18), 4, 4); }   // a mummer riding it, a shape round the back
  g.globalAlpha = 1;
}
const crownAt = (c, a) => ({ x: c.cx + Math.cos(a) * 30, y: c.cy - 104 + Math.sin(a) * 4 });
function drawChairoBack(g, cx, cy, VW, L, time, o) {
  for (const c of L.chairos || []) { if (!vis(c.cx - c.R - 60, c.cx + c.R + 60, cx, VW)) continue;
    const mx = c.cx - cx, top = c.cy - 118 - cy, gy = ROAD - cy + 30;
    /* the chairs round the BACK first (behind the mast) */
    for (let i = 0; i < c.n; i++) { const h = chairAt(c, i, time); if (h.front) continue; const cr = crownAt(c, h.a);
      const rider = (o.foes || []).some(f => f.behind && f.ride && f.ride.idx === i);
      chairSprite(g, h.x - CHAIRO.w / 2 - cx + 4, h.y - cy, CHAIRO.w - 8, cr.x - cx, cr.y - cy, i, true, rider); }
    /* THE MAST: a turned pole, banded, from the pit floor to the crown */
    r(g, mx - 5, top + 20, 10, gy - top - 20, K.woodD); r(g, mx - 3, top + 20, 3, gy - top - 20, K.woodL);
    for (let y = top + 40; y < gy; y += 26) { r(g, mx - 6, y, 12, 3, K.brassD); r(g, mx - 6, y, 12, 1, K.brass); }
    /* THE CROWN: a striped cone over a rim of mirrors and bulbs; its stripes run round with the ride */
    const ph = (time * 2 * Math.PI / c.period) % (Math.PI * 2);
    g.save(); g.beginPath(); g.moveTo(mx - 34, top + 16); g.lineTo(mx, top - 14); g.lineTo(mx + 34, top + 16); g.closePath(); g.clip();
    for (let k = -8; k < 10; k++) { const sx = mx - 40 + ((k * 9 + ph * 14) % 90 + 90) % 90; r(g, sx, top - 16, 5, 34, k % 2 ? K.red : K.cream); }
    g.restore(); ln(g, mx - 34, top + 16, mx, top - 14, K.woodD); ln(g, mx, top - 14, mx + 34, top + 16, K.woodD);
    r(g, mx - 36, top + 16, 72, 5, K.woodD); for (let i = 0; i < 9; i++) r(g, mx - 33 + i * 8, top + 17, 3, 3, Math.floor(time * 4 + i) % 3 ? '#ffd36b' : '#5a4a32');
    ln(g, mx, top - 14, mx, top - 24, K.woodD, 2); g.fillStyle = K.red; g.beginPath(); g.moveTo(mx + 1, top - 24); g.lineTo(mx + 11, top - 21 + Math.sin(time * 4) * 1.5); g.lineTo(mx + 1, top - 18); g.fill();
  }
}
export function drawBack(g, cx, cy, VW, VH, L, F, time, o) { drawSwingboats(g, cx, cy, VW, L, time); drawChairoBack(g, cx, cy, VW, L, time, o || {}); }
/* the swingboat you ride, and a near chair; a chair round the back is drawn by drawBack, so it returns true and draws nothing here */
export function drawMover(g, m, cx, cy, time) {
  if (m.fair === 'boat') { boat(g, Math.round(m.x - cx), Math.round(m.y - cy), m.w, Math.round(m.px - cx), Math.round(m.py - cy), [K.red, K.brass], K.redD, false); return true; }
  if (m.fair === 'chairo') { if (m.broken) return true; const h = chairAt(m.ring, m.idx, time), cr = crownAt(m.ring, h.a);
    chairSprite(g, Math.round(m.x - cx), Math.round(m.y - cy), m.w, cr.x - cx, cr.y - cy, m.idx, false, false); return true; }
  return false;
}

/* ---- THE PRIZE FLOORS (review / Daniel: "bull's-eye rooms unclear - make it obvious you can walk there") ---- */
function boards(g, x, y, w, open, solidBelow) {
  if (!open) { g.globalAlpha = 0.35; g.setLineDash([3, 3]); g.strokeStyle = K.cream; g.lineWidth = 1; g.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w) - 1, 4); g.setLineDash([]); g.globalAlpha = 1; return; }
  r(g, x, y, w, 5, K.wood); r(g, x, y, w, 1, K.woodL); r(g, x, y + 4, w, 2, K.woodDD);              // the boards, a light edge on top, a dark lip under
  for (let i = 6; i < w; i += 8) { r(g, x + i, y + 1, 1, 3, K.woodD); r(g, x + i - 3, y + 2, 1, 1, K.ironL); }   // the joints and the nails
  const post = h => { r(g, x + 2, y + 6, 3, h, K.woodD); r(g, x + w - 5, y + 6, 3, h, K.woodD); };
  post(Math.max(6, Math.min(40, solidBelow)));                                                     // the posts it stands on
}
export function drawNests(g, cx, cy, VW, L, F, time) {
  const G = F && F.games; if (!G) return;
  const solidAt = (x, y) => { const t = L.grid[y * L.W + x]; return t !== 0 && t !== 3; };
  const below = (x, row) => { for (let y = row + 1; y < Math.min(L.H, row + 4); y++) if (solidAt(x, y)) return (y - row - 1) * TS; return 40; };
  for (const Y of G.galleries || []) {
    const spec = (L.galleries || []).find(q => (q.id || 0) === Y.id) || {}, open = !!Y.open;
    for (const [x0, x1, row] of Y.planks || []) { const sx = x0 * TS - cx, w = (x1 - x0 + 1) * TS; if (sx > VW + 20 || sx + w < -20) continue; if (solidAt(x0, row) && L.grid[row * L.W + x0] === 1) continue;
      boards(g, sx, row * TS - cy, w, open, below(x0, row)); }
    const N = spec.nest; if (!N) continue; const nx = N.x0 * TS - cx, nw = (N.x1 - N.x0 + 1) * TS, ny = N.row * TS - cy; if (nx > VW + 30 || nx + nw < -30) continue;
    /* THE PRIZE STALL over the nest: two posts, a striped awning, a pennant - shut, it is there in outline, so the eye knows there is a place up there */
    g.globalAlpha = open ? 1 : 0.4;
    r(g, nx - 2, ny - 30, 3, 30, K.woodD); r(g, nx + nw - 1, ny - 30, 3, 30, K.woodD);
    for (let i = 0; i < nw + 4; i += 8) { r(g, nx - 2 + i, ny - 34, 8, 5, (i / 8) % 2 ? K.cream : K.red); g.fillStyle = (i / 8) % 2 ? K.cream : K.red; g.beginPath(); g.arc(nx + 2 + i, ny - 29, 4, 0, Math.PI); g.fill(); }
    ln(g, nx + nw / 2, ny - 34, nx + nw / 2, ny - 44, K.woodD); g.fillStyle = open ? '#8fd160' : K.brass; g.beginPath(); g.moveTo(nx + nw / 2 + 1, ny - 44); g.lineTo(nx + nw / 2 + 9, ny - 41 + Math.sin(time * 4) * 1.2); g.lineTo(nx + nw / 2 + 1, ny - 38); g.fill();
    g.globalAlpha = 1;
    if (open && !solidAt(N.x0, N.row)) r(g, nx, ny + 4, nw, 2, K.woodDD);
  }
}
