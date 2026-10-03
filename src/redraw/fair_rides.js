// fair_rides.js - THE HARVEST FAIR's rides, games and dressing for the vertical rebuild (claude/fairlevel). Pure drawing: src/main.js calls these each frame with the 2d context and the camera.
// Every sprite is drawn from canvas primitives in the palette of the village kit (fair_world.js), so it sits with the carousel, the hay and the lamps.
//   drawBack   behind the tiles: the wicker effigy going up, the big wheel's frame, the swing ride's masts and beams, the hall of mirrors' back wall, its glass and what the glass shows
//   drawFront  over the tiles, under the foes: the corn, the helter-skelter tower and slide, the strikers, the gallery, the prize booth, the tickets, the scarecrows, the ghost-train arch
//   drawMover  a wheel's gondola, a swing ride's chair (and, claude/fairfix3, the swingboats and the chair-o-plane: src/redraw/fair_newrides.js)
//   drawNight  the dark that comes with height, the holes a lit lantern cuts, and the ticket plate (held, and left area by area)
import { nightK, hallsOf } from '../fair-games.js';
import { beamLive } from '../chase.js';
import * as FB from './fair_backdrop.js';
import * as NR from './fair_newrides.js';   /* (claude/fairfix3) the swingboats, the chair-o-plane, the prize floors */
const TS = 16;
const K = { wood: '#7a5230', woodL: '#a67a48', woodD: '#4e321a', woodDD: '#2e1e10', brass: '#e8c23a', brassD: '#a87a18', red: '#b8382c', redD: '#7a2418', cream: '#ece0c4', creamD: '#c8b890', gold: '#f0c840',
  wick: '#8a6a34', wickL: '#b89050', wickD: '#4e3a1a', straw: '#e6c95c', strawD: '#b8962e', blue: '#3a7ab8', ink: '#120e14', glass: '#9fb8c8', glassD: '#5a7286', steel: '#8a919c' };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const r = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const ln = (g, x0, y0, x1, y1, col, w = 1) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(Math.round(x0) + 0.5, Math.round(y0) + 0.5); g.lineTo(Math.round(x1) + 0.5, Math.round(y1) + 0.5); g.stroke(); };
const vis = (x0, x1, cx, VW, pad = 60) => x1 >= cx - pad && x0 <= cx + VW + pad;

/* THE WICKER EFFIGY (five stages, one that burns, the ash) moved to src/redraw/fair_backdrop.js with the rest of the fair's backdrop */
/* ================= THE BIG WHEEL: the rim, the spokes, the legs, the lamps; the cars are movers (drawMover) ================= */
function drawWheelFrame(g, cx, cy, VW, W, time) {
  if (!W || !vis(W.px - W.r - 40, W.px + W.r + 40, cx, VW)) return;
  const hx = W.px - cx, hy = W.py - 18 - cy, ang = time * 2 * Math.PI / W.period, gy = 28 * TS - cy;
  // the legs: an A-frame to the road, braced
  g.strokeStyle = K.woodD; g.lineWidth = 5; for (const dx of [-1, 1]) { g.beginPath(); g.moveTo(hx + 0.5, hy); g.lineTo(hx + dx * (W.r * 0.62), gy); g.stroke(); }
  g.strokeStyle = K.wood; g.lineWidth = 2; for (const dx of [-1, 1]) { g.beginPath(); g.moveTo(hx - 1.5, hy); g.lineTo(hx + dx * (W.r * 0.62) - 1.5, gy); g.stroke(); }
  g.strokeStyle = K.woodD; g.lineWidth = 2; g.beginPath(); g.moveTo(hx - W.r * 0.4, hy + W.r * 0.65); g.lineTo(hx + W.r * 0.4, hy + W.r * 0.65); g.stroke();
  // the spokes and the rims
  g.strokeStyle = 'rgba(70,52,34,0.9)'; g.lineWidth = 1; for (let i = 0; i < 12; i++) { const a = ang + i * Math.PI / 6; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + Math.cos(a) * W.r, hy + Math.sin(a) * W.r); g.stroke(); }
  for (const [rr, w, col] of [[W.r, 3, K.woodD], [W.r - 5, 1, K.wood], [W.r * 0.45, 1, K.woodD]]) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.arc(hx, hy, rr, 0, Math.PI * 2); g.stroke(); }
  for (let i = 0; i < 24; i++) { const a = ang * 0.5 + i * Math.PI / 12, on = (i * 7 + 3) % 5 !== 0 && Math.floor(time * 3 + i) % 6 !== 0; r(g, hx + Math.cos(a) * (W.r - 2) - 1, hy + Math.sin(a) * (W.r - 2) - 1, 2, 2, on ? '#ffd36b' : '#5a4a32'); }
  r(g, hx - 5, hy - 5, 10, 10, K.brassD); r(g, hx - 3, hy - 3, 6, 6, K.brass); r(g, hx - 1, hy - 1, 2, 2, K.red);
}

/* ================= THE SWING RIDE: the gantry (a mast at each island and a beam the chair hangs from) ================= */
function drawGantries(g, cx, cy, VW, L, time) {
  for (const m of L.moversExtra || []) { if (m.fair !== 'chair' || !m.mast) continue; const [x0, b0, x1, b1] = m.mast; if (!vis(x0, x1, cx, VW)) continue;
    const by = Math.round(m.py - cy), bx0 = Math.round(x0 - cx), bx1 = Math.round(x1 - cx);
    for (const [bx, bb] of [[bx0, Math.round(b0 - cy)], [bx1, Math.round(b1 - cy)]]) { r(g, bx - 2, by, 4, bb - by, K.woodD); r(g, bx - 2, by, 1, bb - by, K.wood); ln(g, bx, by + 16, bx + (bx === bx0 ? 10 : -10), by, K.woodD, 2); }
    r(g, bx0 - 2, by - 3, bx1 - bx0 + 4, 5, K.woodD); r(g, bx0 - 2, by - 3, bx1 - bx0 + 4, 1, K.woodL);
    for (let i = 0; i < Math.floor((bx1 - bx0) / 14); i++) r(g, bx0 + 6 + i * 14, by + 1, 2, 2, Math.floor(time * 4 + i) % 3 ? '#ffd36b' : '#5a4a32');   // the bulbs on the beam
    r(g, Math.round(m.px - cx) - 3, by - 5, 6, 6, K.brassD); r(g, Math.round(m.px - cx) - 2, by - 4, 4, 4, K.brass);   // the swivel
  }
}

/* ================= THE HALL OF MIRRORS: its back wall, its glass, and what the glass shows ================= */
const foeFig = (g, x, y, glow, dir) => { g.fillStyle = glow ? '#ff5a4a' : '#2a1c34'; g.fillRect(x - 2, y - 9, 4, 7); g.fillRect(x - 1, y - 12, 3, 3); g.fillRect(x - 2, y - 2, 1, 3); g.fillRect(x + 1, y - 2, 1, 3); g.fillStyle = '#e2c48a'; g.fillRect(x - 1 + (dir > 0 ? 1 : 0), y - 11, 1, 1); };
function drawHallBack(g, cx, cy, VW, L, o, time) { for (const H of hallsOf(L)) drawOneHall(g, cx, cy, VW, H, o, time); }
function drawOneHall(g, cx, cy, VW, H, o, time) {
  if (!H || !vis(H.x0 * TS, (H.x1 + 1) * TS, cx, VW)) return;
  const x0 = H.x0 * TS - cx, x1 = (H.x1 + 1) * TS - cx, yt = (H.roof + 2) * TS - cy, yb = H.floor * TS - cy;
  const gr = g.createLinearGradient(0, yt, 0, yb); gr.addColorStop(0, '#221630'); gr.addColorStop(1, '#3a2848'); g.fillStyle = gr; g.fillRect(Math.round(x0), Math.round(yt), Math.round(x1 - x0), Math.round(yb - yt));
  if (H.canopy) { for (let x = x0, i = 0; x < x1; x += 12, i++) { r(g, x, yt, 12, 10, i % 2 ? K.cream : K.red); r(g, x, yt + 10, 12, 2, i % 2 ? K.creamD : K.redD); }   // THE CANOPY (claude/fairfix): the small ride's striped roof, and its centre pole
    const mx = (x0 + x1) / 2; r(g, mx - 3, yt, 6, yb - yt, K.brassD); r(g, mx - 1, yt, 2, yb - yt, K.brass); }
  else for (let x = Math.ceil(x0 / 48) * 48; x < x1; x += 48) r(g, x, yt, 2, yb - yt, 'rgba(0,0,0,0.25)');   // the dark ribs of the wall
  for (const m of H.mirrors) { const mx0 = m.x0 * TS - cx, mx1 = (m.x1 + 1) * TS - cx, my0 = yb - 4.7 * TS, my1 = yb - 1.0 * TS, w = mx1 - mx0, h = my1 - my0;
    r(g, mx0 - 3, my0 - 3, w + 6, h + 6, K.woodD); r(g, mx0 - 3, my0 - 3, w + 6, 1, K.brass); r(g, mx0 - 3, my0 - 3, 1, h + 6, K.brassD);
    if (m.kind === 'true') { const gl = g.createLinearGradient(mx0, my0, mx1, my1); gl.addColorStop(0, '#b8ccd8'); gl.addColorStop(0.5, '#7e98aa'); gl.addColorStop(1, '#a4bccc'); g.fillStyle = gl; g.fillRect(Math.round(mx0), Math.round(my0), Math.round(w), Math.round(h));
      g.globalAlpha = 0.35; ln(g, mx0 + w * 0.2, my1, mx0 + w * 0.5, my0, '#ffffff', 3); ln(g, mx0 + w * 0.6, my1, mx0 + w * 0.8, my0, '#ffffff', 2); g.globalAlpha = 1;
      // WHAT THE GLASS SHOWS: a small copy of the hall as it stands round the one looking - him in the middle, every foe where it is from him, and a mummer creeping shows as it does (bells and glow)
      g.save(); g.beginPath(); g.rect(Math.round(mx0), Math.round(my0), Math.round(w), Math.round(h)); g.clip();
      for (const hero of o.heroes || []) { if (hero.x < H.x0 * TS - 40 || hero.x > (H.x1 + 1) * TS + 40) continue; const mid = (mx0 + mx1) / 2;
        foeFig(g, mid, my1 - 2, false, 1); g.fillStyle = '#e8e0c0'; g.fillRect(Math.round(mid) - 1, Math.round(my1 - 14), 3, 1);
        for (const e of o.foes || []) { if (e.x < H.x0 * TS || e.x > (H.x1 + 1) * TS) continue; const dx = Math.max(-w / 2 + 4, Math.min(w / 2 - 4, (e.x - hero.x) * 0.16)); foeFig(g, mid + dx, my1 - 2, e.mode === 'glow', 1); } }
      g.restore(); }
    else { g.fillStyle = '#3a4650'; g.fillRect(Math.round(mx0), Math.round(my0), Math.round(w), Math.round(h));   // the CRACKED glass: dull, and no reflection
      const seed = m.x0 * 7; g.strokeStyle = '#c8d8e0'; g.lineWidth = 1; for (let i = 0; i < 6; i++) { const a = mx0 + w * ((seed + i * 37) % 100) / 100, b = my0 + h * ((seed + i * 53) % 100) / 100; g.beginPath(); g.moveTo(Math.round(mx0 + w / 2) + 0.5, Math.round(my0 + h / 2) + 0.5); g.lineTo(Math.round(a) + 0.5, Math.round(b) + 0.5); g.lineTo(Math.round(a + 6 - i * 2) + 0.5, Math.round(b + 9) + 0.5); g.stroke(); }
      if (H.fake !== undefined && m.x0 <= H.fake && H.fake <= m.x1) { const fx = H.fake * TS - cx + TS, fl = 0.35 + 0.25 * Math.sin(time * 5);   // a door that is not there, lit in the crack (the hint to the floor)
        g.fillStyle = 'rgba(255,210,120,' + fl + ')'; g.fillRect(Math.round(fx) - 8, Math.round(my1 - 34), 16, 34); g.fillStyle = 'rgba(40,20,10,0.6)'; g.fillRect(Math.round(fx) - 8, Math.round(my1 - 34), 16, 3); } }
  }
  const gl2 = 0.35 + 0.05 * Math.sin(time * 2); r(g, x0, yb - 2, x1 - x0, 2, 'rgba(200,150,255,' + gl2 + ')');   // a strip of light along the floor
}

/* ================= THE CORN (walls of it, the corridors dark between) ================= */
const cornSpr = (v, dark) => once('corn' + v + dark, () => { const [c, g] = mk(TS, TS);
  const cols = dark ? ['#2a3418', '#3a4a22', '#4a5a2a'] : ['#c8a83a', '#e6c95c', '#8a7a24'];
  g.fillStyle = dark ? '#1c2410' : '#a88a2c'; g.fillRect(0, 0, TS, TS);
  for (let i = 0; i < 4; i++) { const x = (i * 4 + v * 3) % 14 + 1, lean = ((i + v) & 1) ? 1 : -1; g.fillStyle = cols[0]; g.fillRect(x, 0, 2, TS); g.fillStyle = cols[1]; g.fillRect(x, 0, 1, TS);
    g.fillStyle = cols[2]; for (let y = 3 + (i & 1) * 3; y < TS; y += 7) { g.fillRect(x + lean * 2, y, 3, 1); g.fillRect(x + lean, y + 1, 2, 1); } if (!dark) { g.fillStyle = '#f4d878'; g.fillRect(x - 1, 5 + i, 2, 3); } }
  return c; });
function drawCorn(g, cx, cy, VW, VH, L) {
  for (const [x0, x1, y0, y1] of L.corn || []) { if (!vis(x0 * TS, (x1 + 1) * TS, cx, VW, 20)) continue;
    const ax = Math.max(x0, Math.floor(cx / TS)), bx = Math.min(x1, Math.floor((cx + VW) / TS));
    for (let ty = y0; ty <= y1; ty++) { if ((ty + 1) * TS < cy || ty * TS > cy + VH) continue; for (let tx = ax; tx <= bx; tx++) { const t = L.grid[ty * L.W + tx], v = (tx * 7 + ty * 3) % 3;
      if (t === 1) { g.drawImage(cornSpr(v, false), Math.round(tx * TS - cx), Math.round(ty * TS - cy)); if (L.grid[(ty - 1) * L.W + tx] === 0) r(g, tx * TS - cx, ty * TS - cy, TS, 1, '#6a5a1c'); }
      else if (t === 0) g.drawImage(cornSpr(v, true), Math.round(tx * TS - cx), Math.round(ty * TS - cy)); } } }
}
export function drawScarecrows(g, cx, cy, VW, L, SPR, time) {
  const s = SPR && SPR.scarecrow; if (!s) return;
  for (const sc of L.scarecrows || []) { const x = sc.x * TS + 8; if (x < cx - 20 || x > cx + VW + 20) continue; const sw = Math.sin(time * 1.3 + sc.x) * 0.8;
    g.drawImage(s.R[0], Math.round(x - cx - s.ax + sw), Math.round((sc.row + 1) * TS - cy - s.ay - 1)); }
}

/* ================= THE HELTER-SKELTER: the tower and the slide, painted over the rock ================= */
function drawTower(g, cx, cy, VW, L, time) {
  const T = L.tower, S = L.slide; if (!T || !vis(T.x0 * TS, (S.x0 + S.n) * TS, cx, VW)) return;
  const x0 = T.x0 * TS - cx, x1 = (T.x1 + 1) * TS - cx, top = T.top * TS - cy, gy = 28 * TS - cy;
  // the tower's body: red and cream spiral stripes, a door at the foot, slits of window
  g.save(); g.beginPath(); g.rect(x0, top, x1 - x0, gy - top); g.clip();
  r(g, x0, top, x1 - x0, gy - top, K.cream); for (let i = -12; i < 40; i++) { g.fillStyle = K.red; g.beginPath(); const yy = top + i * 14 + (time * 6) % 14; g.moveTo(x0, yy); g.lineTo(x1, yy - 18); g.lineTo(x1, yy - 8); g.lineTo(x0, yy + 10); g.closePath(); g.fill(); }
  r(g, x0, top, 3, gy - top, 'rgba(0,0,0,0.25)'); r(g, x1 - 3, top, 3, gy - top, 'rgba(0,0,0,0.3)');
  for (const wy of [top + 30, top + 80, top + 130]) if (wy < gy - 30) { r(g, (x0 + x1) / 2 - 2, wy, 4, 12, K.ink); r(g, (x0 + x1) / 2 - 1, wy + 1, 2, 4, '#ffcf70'); }
  g.restore();
  r(g, x0 - 3, top - 4, x1 - x0 + 6, 5, K.woodD); r(g, x0 - 3, top - 4, x1 - x0 + 6, 1, K.gold);
  // the conical roof, and the flag
  g.fillStyle = K.red; g.beginPath(); g.moveTo(x0 - 6, top - 4); g.lineTo((x0 + x1) / 2, top - 44); g.lineTo(x1 + 6, top - 4); g.closePath(); g.fill();
  g.fillStyle = K.cream; g.beginPath(); g.moveTo((x0 + x1) / 2 - 8, top - 22); g.lineTo((x0 + x1) / 2, top - 44); g.lineTo((x0 + x1) / 2 + 2, top - 22); g.closePath(); g.fill();
  ln(g, (x0 + x1) / 2, top - 44, (x0 + x1) / 2, top - 58, K.woodD, 2); g.fillStyle = K.gold; g.beginPath(); g.moveTo((x0 + x1) / 2 + 1, top - 58); g.lineTo((x0 + x1) / 2 + 13, top - 54 + Math.sin(time * 4) * 1.5); g.lineTo((x0 + x1) / 2 + 1, top - 50); g.fill();
  // the slide: a painted chute over the wedge - the timber under it, and the striped run on the surface with a rail
  const sx0 = S.x0 * TS - cx, sy0 = S.y0 * TS - cy, n = S.n * TS;
  g.fillStyle = '#5a3a24'; g.beginPath(); g.moveTo(sx0, sy0); g.lineTo(sx0 + n, sy0 + n); g.lineTo(sx0, sy0 + n); g.closePath(); g.fill();
  g.strokeStyle = '#3a2416'; g.lineWidth = 1; for (let i = 1; i < S.n; i += 3) { g.beginPath(); g.moveTo(sx0 + i * TS, sy0 + i * TS); g.lineTo(sx0 + i * TS, sy0 + n); g.stroke(); g.beginPath(); g.moveTo(sx0 + i * TS, sy0 + n - 1); g.lineTo(sx0 + Math.min(n, i * TS + 3 * TS), sy0 + Math.min(n, i * TS + 3 * TS)); g.stroke(); }
  for (let i = 0; i < S.n * 2; i++) { g.fillStyle = i % 2 ? K.red : K.cream; const a = i * 8; g.beginPath(); g.moveTo(sx0 + a, sy0 + a - 1); g.lineTo(sx0 + a + 8, sy0 + a + 7); g.lineTo(sx0 + a + 8, sy0 + a + 10); g.lineTo(sx0 + a, sy0 + a + 2); g.closePath(); g.fill(); }
  for (let i = 0; i <= S.n; i += 3) { const a = i * TS; ln(g, sx0 + a, sy0 + a - 1, sx0 + a, sy0 + a - 9, K.woodD, 2); }
  ln(g, sx0, sy0 - 9, sx0 + n, sy0 + n - 9, K.brassD, 1);
  if (S.stall) { const a = S.stall.x0, b = S.stall.x1;   /* THE HORSE STALL under the slide's foot (claude/fairfix): dark inside, trestles holding the chute, a lantern-less mouth */
    for (let c = a; c <= b; c++) { const top = (S.y0 + (c - S.x0) + 1) * TS - cy, xx = c * TS - cx; r(g, xx, top, TS, gy - top, '#1c1218'); if ((c - a) % 2 === 0) { r(g, xx + 6, top, 3, gy - top, K.woodD); r(g, xx + 6, top, 1, gy - top, K.wood); } }
    const mx = (b + 1) * TS - cx; r(g, mx - 2, (S.y0 + (b - S.x0) + 1) * TS - cy, 3, gy - (S.y0 + (b - S.x0) + 1) * TS + cy, K.woodD); }
}

/* ================= THE GAMES: strikers, the gallery, the booth, the tickets ================= */
function drawStriker(g, cx, cy, VW, s) {
  const x = s.pad.x - cx, y = s.pad.y - cy; if (x < -40 || x > VW + 40) return;
  const top = y - (s.big ? 15 : 10.5) * TS;
  r(g, x - 2, top, 4, y - top, K.woodD); r(g, x - 2, top, 1, y - top, K.wood);                        // the post, with its scale
  for (let i = 1; i <= (s.big ? 15 : 10); i++) r(g, x + 2, y - i * TS, i % 5 === 0 ? 7 : 4, 1, i % 5 === 0 ? K.gold : K.creamD);
  const shake = s.ring > 0 ? Math.sin(s.ring * 60) * 2 : 0;
  r(g, x - 8 + shake, top - 9, 16, 9, K.brassD); r(g, x - 7 + shake, top - 9, 14, 3, K.brass); r(g, x - 2 + shake, top - 1, 4, 4, K.woodD);   // the bell
  if (s.ring > 0) { const k = 1 - s.ring, ry = y - 4 - k * (top - y + 8) * -1; g.fillStyle = K.red; g.beginPath(); g.arc(x, Math.max(top - 2, y - 6 + (top - y) * k), 4, 0, 6.3); g.fill(); g.globalAlpha = s.ring; ln(g, x - 12, top - 4, x - 18, top - 8, K.gold); ln(g, x + 12, top - 4, x + 18, top - 8, K.gold); g.globalAlpha = 1; }
  r(g, x - 15, y - 6, 30, 6, K.woodD); r(g, x - 15, y - 6, 30, 1, K.woodL); r(g, x - 13, y - 9, 26, 3, K.red); r(g, x - 13, y - 9, 26, 1, K.gold);   // the pad: a drum on a plinth
}
function drawGalleries(g, cx, cy, VW, L, G, time) { for (const Y of (G && G.galleries) || []) if (Y.targets.length > 1) drawGallery(g, cx, cy, VW, Y, time); }   /* (a lone BULL'S-EYE - on a ride or a post - is src/redraw/fair_keys.js's: claude/fairfix2) */
function drawGallery(g, cx, cy, VW, Y, time) {
  const xs = Y.targets.map(t => t.x * TS), x0 = Math.min(...xs) - 20 - cx, x1 = Math.max(...xs) + 36 - cx; if (x1 < -20 || x0 > VW + 20) return;
  const ty = Y.targets[0].row * TS - cy, top = ty - 34;
  r(g, x0, top - 4, x1 - x0, 6, K.red); for (let i = 0; i < (x1 - x0) / 8; i++) if (i % 2) r(g, x0 + i * 8, top - 4, 8, 6, K.cream);   // the awning
  for (let i = 0; i < (x1 - x0) / 8; i += 1) { g.fillStyle = i % 2 ? K.cream : K.red; g.beginPath(); g.arc(x0 + i * 8 + 4, top + 2, 4, 0, Math.PI); g.fill(); }
  r(g, x0, top + 8, 3, ty + 26 - top, K.woodD); r(g, x1 - 3, top + 8, 3, ty + 26 - top, K.woodD); r(g, x0 + 3, top + 6, x1 - x0 - 6, ty + 26 - top, '#2a1a22');   // the posts and the back board
  for (let i = 0; i < 5; i++) r(g, x0 + 6 + i * ((x1 - x0 - 12) / 5), top + 12, 1, 18, 'rgba(255,200,120,0.15)');
  for (const t of Y.targets) { const x = Math.round(t.x * TS + 8 - cx), y = Math.round(t.row * TS + 8 - cy), hit = t.hit;
    r(g, x - 1, y - 20, 2, 12, K.woodD);                                                                           // its hanger
    g.fillStyle = hit ? '#5a5060' : K.cream; g.beginPath(); g.arc(x, y, 7, 0, 6.3); g.fill(); g.fillStyle = hit ? '#3a3040' : K.red; g.beginPath(); g.arc(x, y, 5, 0, 6.3); g.fill();
    g.fillStyle = hit ? '#5a5060' : K.cream; g.beginPath(); g.arc(x, y, 3, 0, 6.3); g.fill(); g.fillStyle = hit ? '#3a3040' : K.gold; g.fillRect(x - 1, y - 1, 2, 2);
    if (t.flash > 0) { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,220,120,' + t.flash * 2 + ')'; g.beginPath(); g.arc(x, y, 12, 0, 6.3); g.fill(); g.globalCompositeOperation = 'source-over'; } }
  const left = Y.open ? 0 : Y.t > 0 ? Math.max(0, 1 - Y.t / Y.window) : 1;   // the bell's clock: a bar that runs down once the first target is hit
  r(g, x0 + 8, top + 4, x1 - x0 - 16, 3, '#1a1018'); r(g, x0 + 8, top + 4, (x1 - x0 - 16) * left, 3, Y.open ? '#5aa860' : Y.t > 0 ? K.gold : K.creamD);
}
function drawBooth(g, cx, cy, VW, G, SPR, time) {
  const B = G && G.booth; if (!B) return; const x = B.x * TS + 8 - cx, gy = (B.row + 1) * TS - cy; if (x < -60 || x > VW + 60) return;
  r(g, x - 26, gy - 46, 3, 46, K.woodD); r(g, x + 23, gy - 46, 3, 46, K.woodD); r(g, x - 24, gy - 40, 48, 40, '#3a2418'); r(g, x - 26, gy - 16, 52, 6, K.wood); r(g, x - 26, gy - 16, 52, 1, K.woodL);   // the stall and its counter
  for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? K.cream : K.gold; g.fillRect(Math.round(x - 28 + i * 8), Math.round(gy - 52), 8, 8); g.beginPath(); g.arc(x - 24 + i * 8, gy - 44, 4, 0, Math.PI); g.fill(); }   // the awning
  for (let i = 0; i < 3; i++) { const px0 = x - 16 + i * 14; r(g, px0, gy - 34, 8, 12, i === 1 ? '#c8d8f0' : K.red); r(g, px0 + 1, gy - 33, 6, 2, '#ffffff'); }   // the prizes on the shelf: the middle one is the silver
  if (!B.bought) { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(200,220,255,' + (0.18 + 0.1 * Math.sin(time * 4)) + ')'; g.beginPath(); g.arc(x, gy - 28, 10, 0, 6.3); g.fill(); g.globalCompositeOperation = 'source-over'; }
  r(g, x - 4, gy - 22, 8, 5, K.creamD); r(g, x - 3, gy - 21, 6, 1, K.red);
}
const ticketSpr = () => once('tk', () => { const [c, g] = mk(12, 8); g.fillStyle = '#ece0c4'; g.fillRect(0, 1, 12, 6); g.fillStyle = '#3ab8c8'; g.fillRect(0, 1, 3, 6); g.fillStyle = '#b8382c'; g.fillRect(5, 3, 4, 2); g.fillStyle = '#120e14'; g.fillRect(3, 1, 1, 6); g.clearRect(4, 0, 2, 1); g.clearRect(4, 7, 2, 1); return c; });
function drawTickets(g, cx, cy, VW, L, G, time) {
  (L.tickets || []).forEach((t, i) => { if (G && G.taken.has(i)) return; const x = t.x * TS + 8 - cx; if (x < -12 || x > VW + 12) return;
    const y = t.row * TS + 8 - cy + Math.sin(time * 3 + t.x) * 2; g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(80,220,230,0.16)'; g.beginPath(); g.arc(x, y, 9, 0, 6.3); g.fill(); g.globalCompositeOperation = 'source-over';
    g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(Math.sin(time * 2 + t.x) * 0.25); g.drawImage(ticketSpr(), -6, -4); g.restore(); });
}
/* THE GHOST TRAIN'S BEAMS (claude/fairfix): a painted timber across the cutting on two chains; DOWN it is at head height (duck under it or wait), UP it hangs out of reach. The same clock as the hurt (src/chase.js beamLive) */
function drawTrainBeams(g, cx, cy, VW, L, time) {
  for (const c of L.chases || []) for (const b of c.beams || []) { if (b.bunting || !vis(b.x0, b.x1, cx, VW)) continue;   /* (burning bunting: src/redraw/fair_keys.js) */ const live = beamLive(b, time), y = (live ? b.y : b.y - 44) - cy, x0 = b.x0 - cx, w = b.x1 - b.x0, th = b.th || 6;
    ln(g, x0 + 3, y - th, x0 + 3, y - th - 120, '#5a626c', 1); ln(g, x0 + w - 3, y - th, x0 + w - 3, y - th - 120, '#5a626c', 1);
    r(g, x0, y - th, w, th, K.woodD); r(g, x0, y - th, w, 1, K.woodL); for (let i = 0; i < w; i += 8) r(g, x0 + i, y - 3, 4, 2, i % 16 ? K.cream : K.red);
    if (live) { const k = 0.4 + 0.3 * Math.sin(time * 10); g.fillStyle = 'rgba(255,90,60,' + k.toFixed(2) + ')'; g.fillRect(Math.round(x0), Math.round(y), Math.round(w), 1); } }
}
function drawGhostArch(g, cx, cy, VW, L, time) {
  if (L.ghostTrain && !L.reserved) L.reserved = { ghostTrain: L.ghostTrain };   /* (the chase is built now: claude/fairfix) */
  const G = L.reserved && L.reserved.ghostTrain; if (!G) return; const x = G.arch * TS - cx, gy = (G.row + 1) * TS - cy; if (x < -80 || x > VW + 80) return;
  r(g, x - 6, gy - 76, 6, 76, K.woodD); r(g, x + 48, gy - 76, 6, 76, K.woodD); g.fillStyle = '#1a1220'; g.beginPath(); g.moveTo(x, gy); g.lineTo(x, gy - 52); g.quadraticCurveTo(x + 24, gy - 82, x + 48, gy - 52); g.lineTo(x + 48, gy); g.closePath(); g.fill();
  g.strokeStyle = K.woodD; g.lineWidth = 6; g.beginPath(); g.moveTo(x - 4, gy - 52); g.quadraticCurveTo(x + 24, gy - 90, x + 52, gy - 52); g.stroke();
  for (const [a, b, c2, d] of [[0, 8, 48, 34], [0, 34, 48, 8]]) { ln(g, x + a, gy - b - 4, x + c2, gy - d - 4, K.wood, 4); ln(g, x + a, gy - b - 5, x + c2, gy - d - 5, K.woodL, 1); }   // the boards nailed across it
  g.fillStyle = K.cream; g.beginPath(); g.arc(x + 24, gy - 62, 7, 0, 6.3); g.fill(); r(g, x + 21, gy - 63, 2, 3, K.ink); r(g, x + 26, gy - 63, 2, 3, K.ink); r(g, x + 22, gy - 57, 5, 1, K.ink);   // the skull on its board
  for (const dy of [0, 4]) ln(g, x - 40, gy - 1 - dy * 0, x - 2, gy - 1, '#3a2a20', 1); ln(g, x - 70, gy - 3, x, gy - 3, '#5a4a40', 1);   // the rails run in
}

/* ================= THE NIGHT SKY (claude/fairfix: the captures showed a pink sunset over the night lane): behind the world, over the backdrop, the sky goes to night
   with HEIGHT as the look does (fair-games.js nightK): deep blue, stars, a moon. The world is drawn over it and drawNight darkens the world, so what stands up there
   reads as a dark shape against a lighter night, not as a shape against sunset ================= */
const STARS = Array.from({ length: 90 }, (_, i) => [((i * 7919) % 997) / 997, ((i * 4507) % 613) / 613, (i * 13) % 3]);
function drawNightSky(g, cx, cy, VW, VH, L, time) {
  const N = L.fairNight; if (!N) return;
  const yStart = (N.start - 2) * TS - cy, yFull = N.full * TS - cy; if (yStart <= 0) return;
  const gr = g.createLinearGradient(0, Math.min(yFull, yStart - 1), 0, yStart); gr.addColorStop(0, 'rgba(22,26,58,0.97)'); gr.addColorStop(1, 'rgba(40,34,70,0)');
  if (yFull > 0) { g.fillStyle = 'rgba(22,26,58,0.97)'; g.fillRect(0, 0, VW, Math.min(VH, yFull)); }
  g.fillStyle = gr; g.fillRect(0, Math.max(0, yFull), VW, Math.min(VH, yStart) - Math.max(0, yFull));
  const lim = Math.min(VH, yStart - 24);
  for (const [u, v, k] of STARS) { const x = ((u * 1400 - cx * 0.05) % VW + VW) % VW, y = v * 900 - cy * 0.05 - 300; if (y < 0 || y > lim) continue;
    const a = Math.max(0, Math.min(1, (lim - y) / 80)) * (0.5 + 0.5 * Math.sin(time * (1 + k) + u * 40)); g.fillStyle = 'rgba(230,236,255,' + a.toFixed(2) + ')'; g.fillRect(Math.round(x), Math.round(y), k ? 1 : 2, k ? 1 : 2); }
  const mx = VW * 0.78 - ((cx * 0.03) % 60), my = Math.min(lim - 30, yFull - 60 + 40); if (my > 12) { g.fillStyle = 'rgba(236,232,210,0.9)'; g.beginPath(); g.arc(mx, my, 11, 0, 6.3); g.fill(); g.fillStyle = 'rgba(22,26,58,0.97)'; g.beginPath(); g.arc(mx + 5, my - 3, 10, 0, 6.3); g.fill(); }
}
export function drawBack(g, cx, cy, VW, VH, L, F, time, o) {
  drawNightSky(g, cx, cy, VW, VH, L, time);
  FB.drawEffigies(g, cx, cy, VW, L, time, o.dusk || 0, o.burnT || 0, o.burnDone);
  drawWheelFrame(g, cx, cy, VW, L.wheel, time);
  drawGantries(g, cx, cy, VW, L, time);
  drawHallBack(g, cx, cy, VW, L, o, time);
  NR.drawBack(g, cx, cy, VW, VH, L, F, time, o);
}
export function drawFront(g, cx, cy, VW, VH, L, F, time, o) {
  drawCorn(g, cx, cy, VW, VH, L);
  drawTower(g, cx, cy, VW, L, time);
  const G = F && F.games;
  drawGalleries(g, cx, cy, VW, L, G, time);
  NR.drawNests(g, cx, cy, VW, L, F, time);
  if (G) for (const s of G.strikers) drawStriker(g, cx, cy, VW, s);
  drawBooth(g, cx, cy, VW, G, o.SPR, time);
  drawGhostArch(g, cx, cy, VW, L, time);
  drawTrainBeams(g, cx, cy, VW, L, time);
  drawScarecrows(g, cx, cy, VW, L, o.SPR, time);
  drawTickets(g, cx, cy, VW, L, G, time);
}

/* ================= THE MOVERS: a gondola on the big wheel, a chair on the swing ride ================= */
const PAINT = [[K.red, K.cream], [K.blue, K.cream], [K.gold, K.red], [K.cream, K.blue], [K.red, K.gold], [K.blue, K.gold]];
export function drawMover(g, m, cx, cy, time) {
  if (NR.drawMover(g, m, cx, cy, time)) return true;   /* (claude/fairfix3) a swingboat, a chair-o-plane's chair */
  const x = Math.round(m.x - cx), y = Math.round(m.y - cy);
  if (m.fair === 'gondola') { const [a, b] = PAINT[m.idx % 6], mid = x + m.w / 2;
    ln(g, x + 2, y + 1, mid, y - 18, K.woodD, 1); ln(g, x + m.w - 2, y + 1, mid, y - 18, K.woodD, 1); r(g, mid - 2, y - 20, 4, 3, K.brassD);   // its hangers, up to the pivot on the rim
    r(g, x, y, m.w, 4, K.woodD); r(g, x, y, m.w, 1, K.woodL); r(g, x + 1, y + 1, m.w - 2, 2, a);
    r(g, x, y - 9, 2, 9, b); r(g, x + m.w - 2, y - 9, 2, 9, b); r(g, x, y - 9, m.w, 1, a); r(g, x, y - 5, 3, 1, a); r(g, x + m.w - 3, y - 5, 3, 1, a);
    r(g, x + 3, y - 3, m.w - 6, 3, K.woodD); r(g, x + 4, y - 4, m.w - 8, 1, b);   // the bench
    if (Math.floor(time * 3 + m.idx) % 2) r(g, mid - 1, y - 11, 2, 2, '#ffd36b'); return true; }
  if (m.fair === 'chair') { const px0 = Math.round(m.px - cx), py0 = Math.round(m.py - cy), sx = x, sy = y;
    ln(g, px0, py0, sx + 4, sy, '#8a919c', 1); ln(g, px0, py0, sx + m.w - 4, sy, '#8a919c', 1); ln(g, px0 + 1, py0, sx + 5, sy, '#5a626c', 1); ln(g, px0 + 1, py0, sx + m.w - 3, sy, '#5a626c', 1);   // the chains
    r(g, sx, sy, m.w, 5, K.woodD); r(g, sx, sy, m.w, 1, K.gold); r(g, sx + 1, sy + 1, m.w - 2, 3, K.red);
    r(g, sx + 2, sy - 8, 3, 8, K.woodD); r(g, sx + m.w - 5, sy - 8, 3, 8, K.woodD); r(g, sx + 2, sy - 8, m.w - 4, 2, K.gold);   // the arms and the back rail
    for (let i = 0; i < 4; i++) r(g, sx + 6 + i * 10, sy - 5, 4, 2, i % 2 ? K.cream : K.red);
    return true; }
  return false;
}

/* ================= THE NIGHT: the dark that comes with height, the light a lit lantern cuts, the ticket count ================= */
let NC = null;
export function drawNight(g, cx, cy, VW, VH, L, F, o) {
  const N = L.fairNight; if (!N) return;
  const G = F && F.games;
  /* THE TICKET COUNT: a HUD plate under the health (it is the fair's own purse, it stays while you hold tickets; claude/fairfix: it read as a label stuck in the world) */
  /* THE TICKET PLATE (claude/fairfix2: Daniel, 'tickets are unclear'): what you hold of all the fair has, and how many still lie in the stretch you stand in (claude/fairfix3:
     "the HUD shows tickets LEFT PER AREA"; the review's #6: the old second line lay across the play field on every screen). For a few seconds after a pickup or a gate's ask
     (o.tkShow) it opens out: every area's count, and what thirty of them open */
  if (G && o.text && !o.skip) { const w = 104, x0 = VW - 8 - w, rows = o.areas || [], here = rows[o.areaI] || null, open = (o.tkShow || 0) > 0, h = open ? 24 + rows.length * 8 + 9 : 22;
    g.fillStyle = 'rgba(10,8,20,0.72)'; g.fillRect(x0, 60, w, h); g.drawImage(ticketSpr(), x0 + 2, 62);
    o.text('TICKETS ' + G.tickets + '/' + (G.total || 0), VW - 12, 63, '#7fe8f0', 'right', 8, 'shadow');
    if (here) o.text('HERE: ' + here.left + ' LEFT', VW - 12, 73, here.left ? '#c8d8e0' : '#8fd160', 'right', 6, 'shadow');
    if (open) { rows.forEach((r, i) => o.text(r.name + '  ' + r.left, VW - 12, 83 + i * 8, i === o.areaI ? '#fff6e0' : r.left ? '#c8d8e0' : '#6a8a6a', 'right', 6, 'shadow'));
      o.text('30 OPEN THE BACK LOT', VW - 12, 84 + rows.length * 8, '#ffd36b', 'right', 6, 'shadow'); } }
  if (o.skip) return;
  const yFull = N.full * TS - cy, yStart = N.start * TS - cy, halls = hallsOf(L).map(H => [H.x0 * TS - cx, (H.x1 + 1) * TS - cx, (H.roof + 2) * TS - cy, H.floor * TS - cy]).filter(([a, b]) => b > 0 && a < VW);
  const unlit = (L.unlit || []).map(([a, b]) => [a * TS - cx, (b + 1) * TS - cx]).filter(([a, b]) => b > 0 && a < VW);
  const hall = halls.length > 0, sky = yFull > 0;
  if (!hall && !unlit.length && !sky && !(yStart > 0)) return;   // the whole screen is below the night line: nothing to draw
  if (!NC || NC.width !== VW || NC.height !== VH) { NC = document.createElement('canvas'); NC.width = VW; NC.height = VH; }
  const d = NC.getContext('2d'); d.globalCompositeOperation = 'source-over'; d.clearRect(0, 0, VW, VH);
  const base = '8,8,24', top = 0.8;   /* (claude/fairfix: 0.66 left the tops at dusk) */
  if (yFull > 0) { d.fillStyle = 'rgba(' + base + ',' + top + ')'; d.fillRect(0, 0, VW, Math.min(VH, yFull)); }
  if (yStart > 0 && yFull < VH) { const gr = d.createLinearGradient(0, yFull, 0, yStart); gr.addColorStop(0, 'rgba(' + base + ',' + top + ')'); gr.addColorStop(1, 'rgba(' + base + ',0)'); d.fillStyle = gr; d.fillRect(0, Math.max(0, yFull), VW, Math.min(VH, yStart) - Math.max(0, yFull)); }
  for (const [hx0, hx1, hyt, hyb] of halls) { d.fillStyle = 'rgba(' + base + ',0.72)'; d.fillRect(Math.max(0, hx0), hyt, Math.min(VW, hx1) - Math.max(0, hx0), hyb - hyt + 2); }
  for (const [ux0, ux1] of unlit) { const gy = 28 * TS - cy; d.fillStyle = 'rgba(' + base + ',0.72)'; d.fillRect(Math.max(0, ux0), Math.max(0, gy - 7 * TS), Math.min(VW, ux1) - Math.max(0, ux0), 7 * TS + 2); }   /* THE UNLIT STRETCH: the road itself is dark there */
  d.globalCompositeOperation = 'destination-out';
  const hole = (x, y, rad, a = 1) => { const gr = d.createRadialGradient(x, y, rad * 0.15, x, y, rad); gr.addColorStop(0, 'rgba(0,0,0,' + a + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)'); d.fillStyle = gr; d.fillRect(x - rad, y - rad, rad * 2, rad * 2); };
  for (const l of (F && F.lamps) || []) { if (!l.lit || !(l.life > 0)) continue; const x = l.x * TS + 8 - cx, y = (l.y + 1) * TS - 30 - cy; if (x < -90 || x > VW + 90) continue; hole(x, y, N.lampR * (l.life >= 1 ? 1.5 : 1.25) * (0.94 + 0.06 * Math.sin((o.time || 0) * 9)), 0.96); }
  for (const h of o.heroes || []) hole(h.x - cx, h.y - 10 - cy, 40, 0.85);                     // your own small light
  for (const e of o.glows || []) hole(e.x - cx, e.y - 12 - cy, 30, 1);
  for (const [fx, fy, fr, fa] of FB.fireHoles(cx, cy, VW, L)) hole(fx, fy, fr, fa);                   // the burning effigy's glow is not put out by the night                             // a red mask is never lost in the dark
  g.drawImage(NC, 0, 0);
  /* THE LANTERN POOLS: a warm light added under each lit lantern that stands in the dark, so a lit stretch reads as the place a mummer can be held */
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const l of (F && F.lamps) || []) { if (!l.lit || !(l.life > 0)) continue; const x = l.x * TS + 8 - cx, y = (l.y + 1) * TS - 24 - cy; if (x < -90 || x > VW + 90) continue;
    const dark = nightK(N, (l.y + 1) * TS) > 0.3 || halls.some(([a, b, t, bt]) => x >= a && x <= b && y >= t - 8 && y <= bt) || unlit.some(([a, b]) => x >= a && x <= b); if (!dark) continue;
    const rad = N.lampR * (l.life >= 1 ? 1.2 : 1), gr = g.createRadialGradient(x, y, 2, x, y, rad); gr.addColorStop(0, 'rgba(255,190,90,' + (0.28 * (l.b || 1)).toFixed(2) + ')'); gr.addColorStop(1, 'rgba(255,140,40,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  g.restore();
}
/* ================= THE NEW FOES' EXTRAS (claude/fairfix): the marionette's strings, up into the dark (slack when nobody looks, taut and twitching when it moves), and
   the barker's call: the trumpet's rings going out while it is told, a burst when it lands ================= */
export function drawFoeExtras(g, e, cx, cy, time) {
  const x = Math.round(e.x - cx), y = Math.round(e.y - cy);
  if (e.t === 'stringjack') { const f = e.face >= 0 ? 1 : -1, taut = e.mode !== 'hang', bar = y - 64 - (taut ? Math.sin(time * 14) * 2 : 0), tw = taut ? Math.sin(time * 18) * 1.5 : 0;
    const hands = e.mode === 'jerk' ? [[x - 9 * f, y - 36], [x + 10 * f, y - 36]] : e.mode === 'hang' ? [[x - 7 * f, y - 12], [x + 6 * f, y - 11]] : [[x - 7 * f, y - 20], [x + 8 * f, y - 20]];
    const head = [x + (e.mode === 'hang' ? 2 * f : 0), y - (e.mode === 'hang' ? 36 : 39)];
    g.globalAlpha = 0.9; g.lineWidth = 1;
    for (const [col, o] of [['#1a1210', 1], ['#e8e0d0', 0]]) { g.strokeStyle = col; for (const [hx, hy] of [...hands, head]) { g.beginPath(); g.moveTo(hx + 0.5 + o, hy + 0.5); if (taut) g.lineTo(x + (hx - x) * 0.4 + tw + 0.5 + o, bar + 0.5); else g.quadraticCurveTo(hx + 6 * f + o, (hy + bar) / 2 + 10, x + (hx - x) * 0.4 + 0.5 + o, bar + 0.5); g.stroke(); } }   /* a dark line under a pale one: it reads on the glass and in the dark */
    g.fillStyle = '#6a4a2a'; g.fillRect(x - 10 + Math.round(tw), bar - 1, 20, 2);   // the control bar
    const up = g.createLinearGradient(0, bar - 70, 0, bar); up.addColorStop(0, 'rgba(216,208,192,0)'); up.addColorStop(1, 'rgba(216,208,192,0.7)'); g.strokeStyle = up; g.beginPath(); g.moveTo(x + 0.5 + Math.round(tw), bar); g.lineTo(x + 0.5, bar - 70); g.stroke();   // and on up, into the dark
    g.globalAlpha = 1; return; }
  if (e.t === 'barker') { const f = e.face >= 0 ? 1 : -1, mx = x + 16 * f, my = y - 30;
    if (e.mode === 'callTell') { const k = (time * 3) % 1; g.strokeStyle = 'rgba(255,211,107,' + (0.8 - k * 0.6).toFixed(2) + ')'; g.lineWidth = 2; for (let i = 0; i < 2; i++) { const rr = 6 + ((k + i * 0.5) % 1) * 18; g.beginPath(); g.arc(mx, my, rr, f > 0 ? -0.8 : Math.PI - 0.8, f > 0 ? 0.8 : Math.PI + 0.8); g.stroke(); } }
    if (e.callFx > 0) { const k = 1 - e.callFx / 0.6; g.strokeStyle = 'rgba(255,230,160,' + (0.9 - k * 0.9).toFixed(2) + ')'; g.lineWidth = 3; for (let i = 0; i < 3; i++) { const rr = 20 + k * 200 + i * 26; g.beginPath(); g.arc(mx, my, rr, 0, 6.3); g.stroke(); } }
  }
}
