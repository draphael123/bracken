// church_set.js - THE LIT CHURCH's SET (claude/churchart): the far wall, the windows, the rose windows, the pillars and vaults, the organ's pipes, the pews, the graveyard,
// the crypt's bones, the lamps and fires, the doors - everything the church is made of that is not a tile.
//   drawBackdrop(V)   behind the tiles: the night sky and the lit SPIRE over the graveyard; indoors the room's far wall (cut stone / cold crypt brick / marble), stained-glass LANCETS,
//                     the ROSE WINDOWS (the landmark: they brighten as the lamps you lit burn), the pillars and their vault ribs, banners, saints in niches, THE ORGAN'S FACADE over the
//                     transept, the tower's great bell and ropes, the crypt's niches and chains - and in a DARK room the cold shafts of moonlight
//   paintWorld(V, plan)  over the tiles, under the actors: pews, pulpit, tombs, headstones, crosses, yews, candle racks, fonts, confessionals, bones, coffins, the altar, the Archdeacon's
//                     cathedra, the sanctuary's choir stalls and gilt floor cross - candles burn only while their ROOM is lit
//   drawLamp / drawSource / drawBellows / drawDesk / drawGrate / drawDoor   the rule's own pieces
// V = { g, cx, cy, vw, vh, time, L, T, lit(roomId)->bool, glow (0..1: how many chapel lamps burn), noGlow }. Only fillRect / drawImage / globalAlpha, so tools/lit-church-aloft.mjs can run it in Node.
import * as P from './church_props.js';
import { CK, hash, matOf } from './church_tiles.js';
import { canvas, px, rect, line, fillPoly, circle, ellipse, outline } from '../px.js';

const R = Math.round, TS = 16;
const vis = (V, x0, x1, m = 60) => x1 > V.cx - m && x0 < V.cx + V.vw + m;
const put = (V, spr, wx, wy) => V.g.drawImage(spr, R(wx - V.cx), R(wy - V.cy));
const box = (V, x, y, w, h, c) => { V.g.fillStyle = c; V.g.fillRect(R(x - V.cx), R(y - V.cy), w, h); };
const alpha = (V, a, fn) => { const o = V.g.globalAlpha; V.g.globalAlpha = o * a; fn(); V.g.globalAlpha = o; };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const roomCache = new WeakMap();
export function roomIdAt(L, tx, ty) {
  let m = roomCache.get(L); if (!m) { m = new Map(); roomCache.set(L, m); } const k = tx * 4096 + ty; if (m.has(k)) return m.get(k);
  let best = null, area = 1e9; for (const r of L.rooms || []) if (tx >= r.x0 && tx <= r.x1 && ty >= r.y0 && ty <= r.y1) { const a = (r.x1 - r.x0 + 1) * (r.y1 - r.y0 + 1); if (a < area) { area = a; best = r.id; } }
  m.set(k, best); return best; }
const litAt = (V, tx, ty) => (V.lit ? !!V.lit(roomIdAt(V.L, tx, ty)) : true);
const flameAt = (V, size, wx, wy, seed) => { const f = Math.floor(V.time * 9 + seed * 3) & 3; put(V, P.bakeFlame(size, f), wx - (size === 2 ? 7 : size === 1 ? 4 : 2), wy - (size === 2 ? 20 : size === 1 ? 11 : 7)); };
const halo = (V, wx, wy, r, a, col) => { if (V.noGlow) return; P.glowDot(V.g, R(wx - V.cx), R(wy - V.cy), Math.round(r * 0.75), a, col); };

/* ================================================================ BAKED WALLS, WINDOWS, ROSES */
const WALLS = { nave: { a: '#6a6a80', b: '#727288', j: '#4a4a5e', h: '#8686a0' }, gallery: { a: '#74686c', b: '#7e7074', j: '#524648', h: '#948486' }, tower: { a: '#5a5a6a', b: '#626274', j: '#3e3e4e', h: '#74748a' },
  crypt: { a: '#3c4262', b: '#444a6c', j: '#242842', h: '#566090' }, sanct: { a: '#8a88a4', b: '#9492b0', j: '#6a6886', h: '#aaa8c8' } };
function wallCell(kind, x, y) {
  const W = WALLS[kind] || WALLS.nave, key = 'w' + kind + (x & 3) + (y & 3);
  return once(key, () => { const [c, g] = canvas(16, 16), wx0 = (x & 3) * 16, wy0 = (y & 3) * 16;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) { const wx = wx0 + xx, wy = wy0 + yy, r = wy >> 3, off = (r & 1) * 16, cc = Math.floor((wx + off) / 32), bx = (wx + off) % 32, by = wy % 8;
      let col = hash(cc, r + (y >> 2) * 7) % 3 ? W.a : W.b; if (by === 7 || bx === 31) col = W.j; else if (by === 0) col = W.h; else if (hash(wx, wy) % 23 === 0) col = W.j; px(g, xx, yy, col); }
    if (kind === 'crypt' && (y & 3) === 1 && (x & 3) === 2) { rect(g, 4, 2, 8, 12, '#0e0c16'); rect(g, 5, 1, 6, 1, '#0e0c16'); rect(g, 4, 2, 1, 12, '#1c1a28'); rect(g, 6, 5, 4, 3, '#cfc7ae'); rect(g, 7, 7, 2, 1, '#8a8068'); px(g, 7, 6, '#0e0c16'); px(g, 9, 6, '#0e0c16'); rect(g, 5, 10, 6, 1, '#b9af92'); rect(g, 6, 12, 5, 1, '#b9af92'); }
    return c; }); }
/* a pointed lancet: w x h tiles, stone surround, leaded jewel glass; glow 1 = lit through, 0 = a dull night blue */
export function bakeLancet(wt, ht, seed, glow) {
  return once('lan' + wt + ht + seed + glow, () => { const w = wt * 16, h = ht * 16, [c, g] = canvas(w, h), cx = w / 2;
    const inside = (x, y) => { const arch = Math.min(w / 2, 22); if (y >= arch) return x >= 3 && x < w - 3; const k = (arch - y) / arch, hw = Math.sqrt(Math.max(0, 1 - k * k)) * (w / 2 - 3); return Math.abs(x + 0.5 - cx) < hw; };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (!inside(x, y)) { const edge = inside(x - 1, y) || inside(x + 1, y) || inside(x, y - 1) || inside(x, y + 1) || inside(x - 2, y) || inside(x + 2, y); if (edge || y < 3) px(g, x, y, (x + y) & 1 ? CK.ashHi : CK.ash[0]); continue; }
      const px0 = Math.floor((x - 3) / 9), py0 = Math.floor(y / 11), tri = [[0, 2, 1], [2, 3, 1], [1, 4, 0], [3, 0, 2], [4, 1, 2]][seed % 5], band = (py0 % 3 === 1) ? 0 : (px0 + py0) % 2 ? 1 : 2, gc = tri[band], base = P.C.glass[gc];
      let col = base; if (((x - 3) % 9 === 8) || y % 11 === 10) col = '#1a1622'; else if (Math.abs(x + 0.5 - cx) < 1.2 && y > 6) col = '#1a1622';
      else if ((x + y * 2) % 11 === 0) col = '#fff6c8';
      if (!glow) { const m = hexMix(col, '#2a3460', 0.72); col = m; } else if (col !== '#1a1622') { col = hexMix(col, '#ffffff', ((x + y) % 9 === 0 ? 0.35 : 0.08)); }
      px(g, x, y, col); }
    return c; }); }
const hexMix = (a, b, k) => { const p = s => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)], A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
export function bakeRose(r, glow) {
  return once('rose' + r + glow, () => { const d = r * 2 + 4, [c, g] = canvas(d, d), m = d / 2, n = 12;
    for (let y = 0; y < d; y++) for (let x = 0; x < d; x++) { const dx = x + 0.5 - m, dy = y + 0.5 - m, dist = Math.hypot(dx, dy); if (dist > r + 2) continue;
      if (dist > r - 1) { px(g, x, y, '#14121c'); continue; } if (dist > r - 4) { px(g, x, y, (x + y) & 1 ? CK.ashHi : CK.ash[0]); continue; }
      const ang = Math.atan2(dy, dx) + Math.PI, sec = Math.floor(ang / (Math.PI * 2) * n), frac = ang / (Math.PI * 2) * n - sec, ring = dist < r * 0.2 ? 0 : dist < r * 0.55 ? 1 : 2;
      let col; if (ring === 0) col = dist < r * 0.1 ? '#fff0a8' : '#d8b040'; else col = P.C.glass[(sec * 3 + ring * 2 + (ring === 2 ? 1 : 0)) % 5];
      if (frac < 0.07 || frac > 0.93 || Math.abs(dist - r * 0.55) < 0.8 || Math.abs(dist - r * 0.2) < 0.8) col = '#1a1622';
      else if (ring === 1 && frac > 0.4 && frac < 0.6 && dist < r * 0.45) col = hexMix(col, '#ffffff', 0.25);
      if (!glow) col = hexMix(col, '#2a3460', 0.75); else if ((x * 3 + y) % 7 === 0) col = hexMix(col, '#ffffff', 0.25);
      px(g, x, y, col); }
    return c; }); }

/* ================================================================ WHICH WALL */
const wallKindAt = (tx, ty) => (tx >= 241 ? 'sanct' : ty >= 39 && tx >= 46 && tx <= 183 ? 'crypt' : ty >= 55 ? 'crypt' : tx >= 46 && tx <= 55 && ty < 41 ? 'tower' : ty <= 18 ? 'gallery' : 'nave');
const NAVE_BAYS = [68, 88, 108, 128, 148];

/* THE SKY over the graveyard and the lit spire on the horizon (world coordinates scaled by a far factor) */
function sky(V) {
  const g = V.g; const bands = [['#0a0c1c', 0], ['#101430', 0.25], ['#181c40', 0.5], ['#242850', 0.75], ['#34386a', 1]];
  for (let i = 0; i < 5; i++) { g.fillStyle = bands[i][0]; g.fillRect(0, R(i * V.vh / 5), V.vw, Math.ceil(V.vh / 5) + 1); }
  for (let i = 0; i < 46; i++) { const sx = (hash(i, 1) % 900) - R(V.cx * 0.03), sy = hash(i, 2) % 150; const x = ((sx % 900) + 900) % 900; if (x < V.vw) { g.fillStyle = hash(i, 3) % 3 ? '#8a90c0' : '#e8ecff'; g.fillRect(x, sy + 4, 1, 1); if (hash(i, 4) % 9 === 0 && ((V.time * 2 + i) % 3) < 1) g.fillRect(x - 1, sy + 4, 3, 1); } }
  put(V, P.bakeMoon(), 22 * TS + 6 + (V.cx * 0.1) - V.cx * 0.1 + 0, 24); }
function spire(V) {   /* THE LANDMARK from the graveyard: the church's west front and its tall lit spire on the hill, far back (parallax 0.3) */
  const g = V.g, f = 0.3, bx = R(44 * TS * f + 150 - V.cx * f), base = V.vh - 30 - R(V.cy * 0.1) * 0 + (V.dy || 0); if (bx < -160 || bx > V.vw + 160) return;
  const c1 = '#14183a', c2 = '#1e2450', lit = '#ffc860', col = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(bx + x, base + y, w, h); };
  col(-70, -34, 150, 34, c1);   /* the nave's long roof */
  for (let x = -70; x < 80; x += 12) col(x + 2, -42, 6, 8, c1);   /* buttress pinnacles */
  col(-8, -78, 36, 78, c2); col(-10, -80, 40, 3, c1); for (let x = -10; x < 30; x += 8) col(x, -86, 4, 7, c1);   /* the west tower */
  for (let i = 0; i < 24; i++) col(2 + (i >> 1), -158 + i * 3 + 0, 14 - i, 3, c2);   /* the spire */
  col(8, -158, 4, 88, c2); col(9, -170, 2, 14, c1); col(5, -166, 8, 2, c1);   /* its needle and cross */
  col(2, -66, 6, 18, lit); col(16, -66, 6, 18, lit); col(9, -108, 6, 14, lit); for (const x of [-60, -40, -20, 40, 60]) col(x, -26, 5, 14, lit);   /* the lit windows */
  alpha(V, 0.5 + 0.2 * Math.sin(V.time * 2), () => { col(5, -136, 10, 10, '#ffd36b'); }); col(8, -135, 4, 8, '#fff6c8');   /* the lantern at its crown */
  /* the rose in the tower: the landmark's eye */
  col(7, -96, 10, 10, '#c8503c'); col(9, -94, 6, 6, '#ffd36b'); col(11, -92, 2, 2, '#fff6c8'); }
function graveyardFar(V) {
  const g = V.g; for (const [wx, h] of [[60, 40], [140, 56], [230, 44], [330, 62], [420, 48], [520, 58]]) { const x = R(wx * 1.5 - V.cx * 0.55); if (x < -40 || x > V.vw + 40) continue; g.fillStyle = '#10142c'; g.fillRect(x - 10, V.vh - 30 - h, 20, h + 30); g.fillRect(x - 14, V.vh - 30 - h * 0.6, 28, h * 0.6 + 30); g.fillRect(x - 6, V.vh - 36 - h, 12, 8); }
  g.fillStyle = '#101426'; g.fillRect(0, V.vh - 30, V.vw, 30);
  const f = 0.5; for (let x = -((V.cx * f) % 16) - 16; x < V.vw; x += 16) { g.fillStyle = '#1c2038'; g.fillRect(x, V.vh - 40, 2, 12); g.fillRect(x + 6, V.vh - 40, 2, 12); g.fillRect(x - 2, V.vh - 36, 20, 2); }   /* a far iron fence */
  alpha(V, 0.18, () => { for (let k = 0; k < 4; k++) { const x = R(((V.time * 6 + k * 90) % (V.vw + 160)) - 80), y = V.vh - 34 - k * 3; g.fillStyle = '#9aa0d0'; g.fillRect(x, y, 90, 6 + k); } }); }   /* ground mist drifting */

/* ================================================================ THE BACKDROP */
export function drawBackdrop(V) {
  const L = V.L, g = V.g, tx0 = Math.floor(V.cx / TS) - 1, tx1 = Math.ceil((V.cx + V.vw) / TS) + 1, ty0 = Math.floor(V.cy / TS) - 1, ty1 = Math.ceil((V.cy + V.vh) / TS) + 1;
  const outdoors = tx0 < 44;
  if (outdoors) { sky(V); graveyardFar(V); spire(V); } else { g.fillStyle = '#14141e'; g.fillRect(0, 0, V.vw, V.vh); }
  /* the far wall, a tile at a time */
  for (let ty = Math.max(0, ty0); ty <= Math.min(L.H - 1, ty1); ty++) for (let tx = Math.max(0, tx0); tx <= Math.min(L.W - 1, tx1); tx++) {
    if (tx < 44 && ty < 37) continue; if (tx <= 43) { if (ty >= 37) { g.drawImage(wallCell('crypt', tx, ty), R(tx * TS - V.cx), R(ty * TS - V.cy)); } continue; }
    g.drawImage(wallCell(wallKindAt(tx, ty), tx, ty), R(tx * TS - V.cx), R(ty * TS - V.cy)); }
  const g1 = V.glow == null ? 0.5 : V.glow;
  /* THE WEST FRONT's wall from outside is the narthex's: the graveyard side shows the porch's arch */
  const wins = [];   /* [tx, ty, wt, ht, room-probe] */
  for (const x of [78, 98, 118, 138]) wins.push([x - 1, 22, 3, 9, 'nave']);
  for (let x = 72; x <= 168; x += 14) if (!(x > 128 && x < 175 && true) || x < 128) wins.push([x, 8, 2, 8, 'gal']);
  wins.push([169, 21, 3, 9, 'cross'], [190, 23, 3, 9, 'south'], [222, 23, 3, 9, 'south'], [48, 8, 2, 8, 'tower'], [52, 8, 2, 8, 'tower'], [186, 21, 2, 8, 'south'], [232, 22, 2, 8, 'south']);
  for (const [wx, wy, wt, ht, kind] of wins) { if (!vis(V, wx * TS, (wx + wt) * TS, 40)) continue; const ty = wy + ht - 1; const lit = litAt(V, wx + 1, Math.min(ty, 36));
    const sprW = bakeLancet(wt, ht, (wx * 7 + wy) % 11, lit ? 1 : 0); put(V, sprW, wx * TS, wy * TS);
    if (!lit && !V.noGlow) moonShaft(V, wx * TS + wt * 8, (wy + ht) * TS, wt * 16, Math.min(ty, 36) * TS + 16); }
  /* THE ROSE WINDOWS: the landmark. Each brightens with the chapel lamps that burn (V.glow). */
  const roses = [[168, 24, 20], [208, 27, 22], [261, 28, 40], [64, 11, 16], [150, 24, 0]].filter(r => r[2] > 0);
  for (const [wx, wy, r] of roses) { if (!vis(V, (wx - 4) * TS, (wx + 4) * TS, 60)) continue; const spr = bakeRose(r, 1), dim = bakeRose(r, 0), x = wx * TS - r - 2, y = wy * TS - r - 2;
    const arena = wx >= 241, k = arena ? (V.paladinLight == null ? 1 : V.paladinLight) : g1; put(V, dim, x, y); alpha(V, Math.min(1, 0.15 + k * 0.85), () => put(V, spr, x, y));
    if (k > 0.3 && !V.noGlow) alpha(V, 0.1 * k, () => { box(V, x - 8, y + r * 2, r * 2 + 20, 90, '#ffd890'); }); }
  /* PILLARS and their vault ribs (decor 'pillar': the nave's) */
  for (const d of L.decor || []) { if (d.kind !== 'pillar') continue; const x = d.x * TS; if (!vis(V, x - 6, x + 22, 40)) continue; pillar(V, d); }
  for (let i = 0; i + 1 < NAVE_BAYS.length; i++) ribs(V, NAVE_BAYS[i] * TS + 8, NAVE_BAYS[i + 1] * TS + 8, 21 * TS);
  /* banners between the pillars, saints in the niches */
  for (let i = 0; i + 1 < NAVE_BAYS.length; i++) { const mx = (NAVE_BAYS[i] + NAVE_BAYS[i + 1]) / 2 * TS; if (vis(V, mx - 60, mx + 60)) { put(V, P.bakeBanner(i % 4), mx - 118, 22 * TS + 4); put(V, P.bakeBanner((i + 2) % 4), mx + 100, 22 * TS + 4); } }
  for (const x of NAVE_BAYS) if (vis(V, x * TS, x * TS + 40)) put(V, P.bakeStatue(x % 2), x * TS + 22, 24 * TS - 4);
  /* THE ORGAN'S FACADE over the transept: ranks of gilt pipes standing on the gallery floor */
  organ(V);
  /* THE TOWER: the great bell, ropes, a ladder */
  tower(V);
  /* THE CRYPT: arches over the ossuary, chains, webs; the well's shaft is a darker wall */
  crypt(V);
  /* THE SANCTUARY: apse columns, banners, a gilt reredos */
  sanctuary(V);
  /* THE GRAVEYARD'S PORCH: the west wall's arch from outside */
}
function moonShaft(V, x, y0, w, y1) {   /* a cold shaft slanting down from a window to the floor (a DARK room's moon) */
  if (V.noGlow) return; const g = V.g, sx = R(x - V.cx), sy0 = R(y0 - V.cy), sy1 = R(y1 - V.cy), hw = R(w / 2 - 4), sh = 38;
  alpha(V, 0.1, () => { fillPoly(g, [[sx - hw, sy0], [sx + hw, sy0], [sx + hw + sh, sy1], [sx - hw + sh, sy1]], '#9ab8f0'); }); alpha(V, 0.07, () => { fillPoly(g, [[sx - hw / 2, sy0], [sx + hw / 2, sy0], [sx + hw / 2 + sh, sy1], [sx - hw / 2 + sh, sy1]], '#e0eaff'); }); }
function pillar(V, d) {
  const x = d.x * TS + 1, y0 = d.y0 * TS, y1 = (d.y1 + 1) * TS, h = y1 - y0;
  box(V, x, y0 + 6, 14, h - 6, '#58566a'); box(V, x, y0 + 6, 3, h - 6, '#7a788e'); box(V, x + 11, y0 + 6, 3, h - 6, '#34324a'); for (let y = y0 + 12; y < y1 - 10; y += 4) { box(V, x + 6, y, 1, 3, '#46445a'); }
  box(V, x - 3, y0, 20, 6, '#6a687e'); box(V, x - 3, y0, 20, 1, '#9a98ae'); box(V, x - 1, y0 + 6, 16, 2, '#46445a');   /* the capital */
  box(V, x - 3, y1 - 8, 20, 8, '#6a687e'); box(V, x - 3, y1 - 8, 20, 1, '#9a98ae'); box(V, x - 1, y1 - 10, 16, 2, '#46445a'); }
function ribs(V, xa, xb, yTop) {
  if (!vis(V, xa, xb, 20)) return; const half = (xb - xa) / 2, apex = yTop - 2, spring = yTop + 22; const g = V.g;
  for (let dx = 0; dx <= half; dx += 2) { const k = dx / half, y = R(spring - (spring - apex) * Math.sin(Math.min(1, k) * Math.PI / 2) * 1.0 - (1 - k) * 0); const yy = R(apex + (spring - apex) * Math.pow(1 - k, 1.7));
    for (const x of [xa + dx, xb - dx]) { box(V, x, yy, 3, 3, '#4a4860'); box(V, x, yy, 3, 1, '#7a788e'); } }
  box(V, (xa + xb) / 2 - 3, apex - 1, 7, 6, '#8a6a2a'); box(V, (xa + xb) / 2 - 2, apex, 5, 1, '#d8b050'); }
function organ(V) {
  const x0 = 140 * TS, x1 = 178 * TS; if (!vis(V, x0, x1, 40)) return; const base = 19 * TS;
  box(V, x0, 7 * TS, x1 - x0, 12 * TS, '#2e2a38');   /* the case's dark back */
  const heights = [], n = 34; for (let i = 0; i < n; i++) { const t = i / (n - 1), tri = 1 - Math.abs(t - 0.5) * 2; heights.push(R(52 + tri * 120 + (i % 3) * 8)); }
  for (let i = 0; i < n; i++) { const x = x0 + 4 + i * 17 | 0, h = heights[i]; if (!vis(V, x, x + 12, 20)) continue; put(V, P.bakePipe(h, i % 7 === 3 ? 1 : 0), x, base - h - 2); }
  for (let i = 0; i < 6; i++) { const x = x0 + 30 + i * 90, h = 70 + (i % 2) * 18; if (x < x1 - 20) put(V, P.bakePipe(h, 1), x + 6, base - h - 2); }
  box(V, x0 - 6, base - 22, x1 - x0 + 12, 6, '#5a381e'); box(V, x0 - 6, base - 22, x1 - x0 + 12, 1, '#a0703c'); box(V, x0 - 6, base - 16, x1 - x0 + 12, 16, '#3a2414');   /* the case's chest */
  for (let x = x0; x < x1; x += 20) { box(V, x + 3, base - 14, 14, 11, '#4a2e1a'); box(V, x + 5, base - 12, 10, 7, '#2e1c10'); box(V, x + 3, base - 14, 14, 1, '#a0703c'); }
  box(V, x0 - 8, 7 * TS - 6, x1 - x0 + 16, 6, '#5a381e'); box(V, x0 - 8, 7 * TS - 6, x1 - x0 + 16, 1, '#c9a040'); for (let x = x0; x < x1; x += 24) { box(V, x, 7 * TS - 12, 12, 6, '#8a6a2a'); }   /* the cornice, gilt crockets */ }
function tower(V) {
  const x0 = 46 * TS, x1 = 55 * TS; if (!vis(V, x0, x1, 40)) return;
  const bx = 50 * TS - 12; put(V, P.bakeBell(), bx, 7 * TS + 4); const sw = Math.round(Math.sin(V.time * 0.8) * 1);
  for (const x of [47 * TS + 6, 52 * TS + 4]) { box(V, x + sw, 11 * TS, 2, 7 * TS, '#8a6a4a'); for (let y = 11 * TS + 6; y < 18 * TS; y += 10) box(V, x + sw, y, 2, 2, '#c4a070'); box(V, x - 1 + sw, 17 * TS + 6, 4, 8, '#c84a3a'); }   /* bell ropes with their sallies */
  box(V, x0, 6 * TS, x1 - x0, 5, '#3a2414'); for (let x = x0 + 4; x < x1; x += 18) box(V, x, 6 * TS + 5, 8, 6, '#5a381e'); }
function crypt(V) {
  const x0 = 46 * TS, x1 = 183 * TS; if (!vis(V, x0, x1, 40)) return;
  for (let x = 52; x <= 176; x += 8) { const sx = x * TS; if (!vis(V, sx, sx + 40, 20)) continue; box(V, sx, 40 * TS, 10, 14 * TS, '#303450'); box(V, sx, 40 * TS, 2, 14 * TS, '#4a5070'); box(V, sx - 3, 40 * TS, 16, 6, '#3a3e5c'); box(V, sx - 3, 40 * TS, 16, 1, '#6a7090');   /* groin-vault piers */
    for (let dx = 0; dx <= 56; dx += 3) { const yy = 40 * TS + 8 + R(18 * Math.pow(1 - Math.abs(dx - 28) / 28, 1.4) * 0) + R(24 * Math.pow(Math.abs(dx - 28) / 28, 1.6)); box(V, sx + 6 + dx, 40 * TS + 24 - R(18 * Math.sin(dx / 56 * Math.PI)) , 3, 3, '#2a2e46'); } }
  for (let x = 64; x < 176; x += 17) { const sx = x * TS; if (!vis(V, sx, sx + 8, 20)) continue; put(V, P.bakeChain(), sx, 39 * TS + (hash(x, 1) % 8)); if (hash(x, 2) % 3 === 0) put(V, P.bakeWeb(), sx + 8, 39 * TS); }
  /* water seeping down the well's shaft */
  if (vis(V, 158 * TS, 168 * TS)) for (let k = 0; k < 6; k++) { const x = 159 * TS + 8 + (hash(k, 4) % 130), y = 40 * TS + R((V.time * 40 + k * 31) % (13 * TS)); box(V, x, y, 1, 3, '#6a82b8'); } }
function sanctuary(V) {
  const x0 = 241 * TS, x1 = 283 * TS; if (!vis(V, x0, x1, 40)) return; const fl = 41 * TS, ceil = 21 * TS;
  for (const px0 of [243, 252, 270, 280]) { const x = px0 * TS; box(V, x, ceil, 12, fl - ceil, '#7a788e'); box(V, x, ceil, 3, fl - ceil, '#a8a6bc'); box(V, x + 9, ceil, 3, fl - ceil, '#52506a'); box(V, x - 3, ceil, 18, 5, '#a8a6bc'); box(V, x - 3, ceil, 18, 1, '#e8e6f4'); box(V, x - 2, fl - 7, 16, 7, '#8a88a0'); box(V, x, ceil + 5, 12, 2, C_GOLD); }
  ribs(V, 243 * TS + 6, 252 * TS + 6, ceil + 4); ribs(V, 270 * TS + 6, 280 * TS + 6, ceil + 4); ribs(V, 252 * TS + 6, 270 * TS + 6, ceil + 4);
  const cx = 261.5 * TS; box(V, cx - 60, fl - 70, 120, 70, '#4a486a'); box(V, cx - 60, fl - 70, 120, 3, '#d8b040');   /* the reredos behind the altar: gilt panels */
  for (let i = 0; i < 6; i++) { const x = cx - 56 + i * 19; box(V, x, fl - 64, 15, 58, '#35334f'); box(V, x, fl - 64, 15, 1, '#d8b040'); box(V, x + 6, fl - 54, 3, 22, '#d8b040'); box(V, x + 3, fl - 46, 9, 3, '#d8b040'); }
  for (const [bx, v] of [[247, 0], [257, 1], [266, 1], [276, 0]]) put(V, P.bakeBanner(v), bx * TS + 2, ceil + 12); }
const C_GOLD = '#d8b040';

/* ================================================================ THE PLAN: dressing and lights from the level's own ents and tops */
export function plan(L, T) {
  const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
  const dress = [], lights = [], used = [];
  const solidTop = (x, y) => (at(x, y) === T.SOLID || at(x, y) === T.ONEWAY) && at(x, y - 1) === T.AIR && at(x, y - 2) === T.AIR && at(x, y - 3) === T.AIR;
  const free = (x, y) => !L.ents.some(e => Math.abs(e.x - x) <= 1 && Math.abs(e.y - y) <= 2 && e.t !== 'check') && !(L.decor || []).some(d => d.x0 !== undefined && x >= d.x0 - 1 && x <= d.x1 + 1 && Math.abs(d.y - y) < 4 && d.kind !== 'tomb') && !used.some(([ux, uy]) => uy === y && Math.abs(ux - x) < 4) && !(L.drops || []).some(([a, b]) => x >= a - 1 && x <= b + 1);
  const zone = x => (x < 44 ? 'yard' : x < 56 ? 'narthex' : x < 152 ? 'nave' : x < 180 ? 'cross' : x < 241 ? 'south' : 'sanct');
  const KINDS = { yard: ['headstone', 'headstone', 'cross', 'bones', 'headstone'], nave: ['rack', 'confessional', 'font', 'rack'], cross: ['rack', 'banner'], south: ['rack', 'bones', 'rack'], sanct: [] };
  const DENS = { yard: 0.34, nave: 0.07, cross: 0.1, south: 0.12 };
  for (let x = 6; x < 241; x++) { const z = zone(x); if (!KINDS[z] || !KINDS[z].length || hash(x, 71) % 100 >= DENS[z] * 100) continue;
    for (let y = 4; y < L.H - 4; y++) if (solidTop(x, y) && y <= 41 && !(y > 18 && y < 37 && false) && free(x, y - 1) && y !== 19 + 0 * 1) { const k = KINDS[z][hash(x, y) % KINDS[z].length]; if (y <= 19 && k !== 'bones' && k !== 'rack') break; dress.push({ k, x, y: y - 1, v: hash(y, x) % 3 }); used.push([x, y - 1]); break; } }
  /* the crypt's: bone piles, coffins, sarcophagi, candle-less */
  for (let x = 48; x < 180; x++) { if (hash(x, 33) % 100 >= 14) continue; const y = 53; if (at(x, y + 1) === T.SOLID && at(x, y) === T.AIR && at(x, y - 1) === T.AIR && free(x, y)) { const kk = ['bones', 'coffin', 'sarc', 'bones', 'coffin'][hash(x, 5) % 5]; dress.push({ k: kk, x, y, v: hash(x, 8) % 2 }); used.push([x, y]); } }
  /* the graveyard's yews, tombs and fence: the level's decor */
  /* LIGHTS: dress candles burn with their room (kind, tile x, floor row) */
  const add = (kind, x, row, r = 56, dx = 0) => lights.push({ kind, wx: x * TS + 8 + dx, wy: (row + 1) * TS, x, row, r });
  for (const d of dress) if (d.k === 'rack') add('rack', d.x, d.y, 52);
  for (const x of [66, 78, 86, 98, 110, 118, 134, 146]) lights.push({ kind: 'sconce', wx: x * TS + 8, wy: 27 * TS, x, row: 26, r: 40 });                                    /* the nave's wall sconces */
  for (const x of [84, 96, 120, 148, 168]) lights.push({ kind: 'chandelier', wx: x * TS + 8, wy: 9 * TS + 14, x, row: 9, r: 70 });                                       /* the gallery's chandeliers */
  for (const x of [60, 110, 150]) lights.push({ kind: 'chandelier', wx: x * TS + 8, wy: 22 * TS + 6, x, row: 22, r: 66 });                                               /* the nave's, under the loft */
  for (const x of [186, 200, 214, 232]) lights.push({ kind: 'sconce', wx: x * TS + 8, wy: 30 * TS, x, row: 29, r: 40 });                                                   /* the south transept's */
  for (const x of [245, 255, 268, 278]) lights.push({ kind: 'sconce', wx: x * TS + 8, wy: 30 * TS, x, row: 29, r: 44 });                                                   /* the sanctuary's */
  lights.push({ kind: 'altar', wx: 261.5 * TS, wy: 41 * TS - 28, x: 261, row: 38, r: 70 });
  for (const x of [8, 22, 34]) lights.push({ kind: 'grave', wx: x * TS + 8, wy: 37 * TS - 4, x, row: 36, r: 24, yard: true });                                           /* a candle on a grave */
  return { dress, lights }; }

/* ================================================================ PAINTING OVER THE TILES */
export function paintWorld(V, plan0) {
  const L = V.L;
  for (const d of L.decor || []) { const x0 = (d.x0 ?? d.x) * TS, x1 = ((d.x1 ?? d.x) + 1) * TS; if (x1 < V.cx - 80 || x0 > V.cx + V.vw + 80) continue;
    switch (d.kind) { case 'yew': put(V, P.bakeYew(d.x % 2), d.x * TS - 14, (d.y + 3) * TS - 64 + 2); break; case 'headstone': put(V, P.bakeHeadstone(d.x), d.x * TS + 1, (d.y + 1) * TS - 18); break;
      case 'tomb': put(V, P.bakeTomb(d.x1 - d.x0 + 1), d.x0 * TS, (d.y + 2) * TS - 24); break; case 'pew': pew(V, d); break; case 'pulpit': put(V, P.bakePulpit(), (d.x0 + 1) * TS - 14, (d.y + 4) * TS - 70 + 4); break;
      case 'altar': put(V, P.bakeAltar(), d.x * TS - 14, (d.y + 7) * TS - 40); break; case 'pipe': pipeStair(V, d); break; case 'vault': break; case 'moon': break; case 'triforium': trifArcade(V, d); break; case 'shelf': shelfDress(V, d); break; } }
  if (plan0) for (const d of plan0.dress) { if (!vis(V, d.x * TS, d.x * TS + 40, 40)) continue; dressItem(V, d); }
  /* the dais of the Archdeacon: a cathedra on his block (cols 222-228, rows 39-40) */
  if (vis(V, 220 * TS, 230 * TS)) cathedra(V);
  /* the reliquary's candle sockets (the five stubs) */
  const rq = (L.doors || []).find(d => d.id === 'reliquary'); if (rq && vis(V, 184 * TS, 190 * TS)) reliquary(V, rq);
  /* the sanctuary: the altar, a gilt floor cross and the choir stalls' fronts */
  sanctFloor(V);
  /* dress lights */
  if (plan0) for (const l of plan0.lights) { if (!vis(V, l.wx - 30, l.wx + 30, 50)) continue; const lit = l.yard ? true : litAt(V, l.x, l.row); if (l.kind === 'rack') put(V, P.bakeCandleRack(l.x), l.wx - 13, l.wy - 30);
    else if (l.kind === 'sconce') put(V, P.bakeSconce(0), l.wx - 6, l.wy - 18); else if (l.kind === 'chandelier') { put(V, P.bakeChandelier(), l.wx - 22, l.wy - 34); } else if (l.kind === 'grave') { box(V, l.wx - 1, l.wy - 6, 2, 6, '#e8e0c8'); }
    if (!lit) continue;
    if (l.kind === 'rack') { for (const [fx, fy] of P.rackWicks()) flameAt(V, 0, l.wx - 13 + fx + 1, l.wy - 30 + fy + 1, l.x + fx); halo(V, l.wx, l.wy - 18, l.r * 0.6, 0.5); }
    else if (l.kind === 'sconce') { flameAt(V, 1, l.wx, l.wy - 15, l.x); halo(V, l.wx, l.wy - 14, l.r * 0.55, 0.5); }
    else if (l.kind === 'chandelier') { for (const [fx, fy] of P.CHANDELIER_WICKS) flameAt(V, 0, l.wx - 22 + fx + 1, l.wy - 34 + fy + 1, l.x + fx); halo(V, l.wx, l.wy - 8, l.r * 0.55, 0.5); }
    else if (l.kind === 'grave') { flameAt(V, 0, l.wx, l.wy - 6, l.x); halo(V, l.wx, l.wy - 8, 12, 0.5); }
    else if (l.kind === 'altar') halo(V, l.wx, l.wy, l.r * 0.6, 0.4, '#ffe0a0'); }
}
function pew(V, d) { const w = d.x1 - d.x0 + 1; if (!vis(V, d.x0 * TS, (d.x1 + 1) * TS, 20)) return; put(V, P.bakePew(w), d.x0 * TS, d.y * TS - 16); }
function pipeStair(V, d) { for (let i = 0; i < 2; i++) { const x = d.x * TS + i * 16, h = d.h * TS; put(V, P.bakePipe(h - 2, d.x % 2), x + 3, (d.y - d.h) * TS + 0); } }
function trifArcade(V, d) { const x0 = d.x0 * TS, x1 = (d.x1 + 1) * TS; if (!vis(V, x0, x1)) return; for (let x = x0 + 2; x < x1 - 8; x += 16) { box(V, x, (d.y + 1) * TS + 8, 12, 12, '#2a2a38'); box(V, x + 1, (d.y + 1) * TS + 6, 10, 2, '#2a2a38'); box(V, x + 2, (d.y + 1) * TS + 4, 8, 2, '#2a2a38'); box(V, x + 5, (d.y + 1) * TS + 8, 2, 12, '#5a5870'); } }
function shelfDress(V, d) { const x0 = d.x0 * TS, x1 = (d.x1 + 1) * TS; if (!vis(V, x0, x1)) return; for (let x = x0 + 2; x < x1 - 18; x += 22) put(V, P.bakeBonePile(x >> 4 & 1), x, d.y * TS - 11); }
function cathedra(V) {
  const x = 222 * TS, y = 39 * TS; box(V, x, y - 38, 7 * TS, 38, '#4a2e1a'); box(V, x, y - 38, 7 * TS, 2, '#a0703c');   /* a carpeted dais is the block; the throne stands on it */
  const tx = 225 * TS - 2; box(V, tx, y - 62, 24, 44, '#5a381e'); box(V, tx, y - 62, 24, 2, '#a0703c'); box(V, tx - 2, y - 66, 28, 5, '#8a6a2a'); box(V, tx + 10, y - 76, 4, 12, '#d8b040'); box(V, tx + 6, y - 72, 12, 3, '#d8b040'); box(V, tx + 4, y - 44, 16, 6, '#8a1c1c'); }
function reliquary(V, rq) { const n = Math.min(5, V.stubs == null ? 0 : V.stubs); const x = 185 * TS + 1, y = 41 * TS; put(V, P.bakeReliquary(n), x, y - 26); for (let i = 0; i < n; i++) { const fx = x + 3 + i * 5 + 1, fy = y - 26 + 2; flameAt(V, 0, fx, fy + 1, i); } }
function sanctFloor(V) {
  if (!vis(V, 241 * TS, 283 * TS)) return; const fl = 41 * TS;
  box(V, 260 * TS, fl - 4, 3 * TS, 4, '#8a1c1c'); box(V, 260 * TS, fl - 4, 3 * TS, 1, '#c84a3a');   /* the altar step's carpet runner */
  put(V, P.bakeAltar(), 261.5 * TS - 22, fl - 40);
  for (const x of [247, 257, 266, 276]) { box(V, x * TS + 2, fl - 10, 12, 10, '#6a4426'); box(V, x * TS + 2, fl - 10, 12, 1, '#a0703c'); box(V, x * TS + 4, fl - 14, 8, 4, '#8a1c1c'); }   /* kneelers */
  /* the gilt cross inlaid in the floor before the altar: where the radiance lands */
  alpha(V, 0.55, () => { box(V, 258.5 * TS, fl - 2, 6 * TS, 1, '#d8b040'); }); }
function dressItem(V, d) {
  const wx = d.x * TS, wy = (d.y + 1) * TS;
  switch (d.k) { case 'headstone': put(V, P.bakeHeadstone(d.v + d.x), wx + 1, wy - 18); break; case 'cross': put(V, P.bakeCross(), wx, wy - 30); break; case 'bones': put(V, P.bakeBonePile(d.v), wx - 4, wy - 12); break;
    case 'coffin': put(V, P.bakeCoffin(d.v), wx - 8, wy - 16); break; case 'sarc': put(V, P.bakeSarcophagus(), wx - 16, wy - 26); break; case 'font': put(V, P.bakeFont(), wx - 2, wy - 26); break;
    case 'confessional': put(V, P.bakeConfessional(), wx - 8, wy - 48); break; case 'banner': put(V, P.bakeBanner(d.v), wx, wy - 54); break; case 'rack': break; } }

/* ================================================================ THE RULE'S PIECES */
export function drawLamp(V, l) {
  const wx = l.x * TS + 8, wy = (l.y + 1) * TS, f = Math.floor(V.time * 9 + l.x * 3);
  if (!vis(V, wx - 20, wx + 20, 40)) return;
  if (l.kind === 'sconce' || l.kind === 'rood') { const s = P.bakeSconce(l.kind === 'rood' ? 1 : 0); put(V, s, wx - 6, wy - 18); if (l.lit) { flameAt(V, 1, wx, wy - 15, l.x); halo(V, wx, wy - 14, 32, 0.55); } else { smoke(V, wx, wy - 17, l.x); } }
  else if (l.kind === 'chapel') { put(V, P.bakeCandelabrum(), wx - 14, wy - 34); if (l.lit) { for (const [fx, fy] of P.CANDELABRUM_WICKS) flameAt(V, 0, wx - 14 + fx + 1, wy - 34 + fy + 1, l.x + fx); flameAt(V, 1, wx, wy - 29, l.x); halo(V, wx, wy - 22, 54, 0.6, '#ffd890'); } else { smoke(V, wx, wy - 28, l.x); } }
  else if (l.kind === 'seal') { const top = (l.y + 1) * TS - 44; put(V, P.bakeSealLamp(), wx - 8, wy - 44); if (l.lit) { alpha(V, 0.8, () => { flameAt(V, 1, wx, wy - 12, l.x); }); halo(V, wx, wy - 14, 42, 0.5, '#a8c0ff'); } }
  else if (l.kind === 'arena') { put(V, P.bakeCandelabrum(), wx - 14, wy - 34); put(V, P.bakeLampstand(), wx - 8, wy - 80 + 42); if (l.lit) { for (const [fx, fy] of P.CANDELABRUM_WICKS) flameAt(V, 0, wx - 14 + fx + 1, wy - 34 + fy + 1, l.x + fx); halo(V, wx, wy - 26, 60, 0.6, '#ffd890'); } else smoke(V, wx, wy - 28, l.x); }
  else { put(V, P.bakeLampstand(), wx - 8, wy - 38); if (l.lit) { flameAt(V, 1, wx, wy - 29, l.x); halo(V, wx, wy - 26, 46, 0.55); } else { smoke(V, wx, wy - 31, l.x); } }
}
function smoke(V, x, y, seed) { for (let k = 0; k < 2; k++) { const t = (V.time * 0.6 + k * 0.5 + seed * 0.13) % 1; alpha(V, 0.4 * (1 - t), () => box(V, x + Math.round(Math.sin(t * 6 + seed) * 2), y - R(t * 12), 1, 1, '#9a9ab0')); } }
export function drawSource(V, s) {
  const wx = s.x * TS + 8, wy = (s.y + 1) * TS; if (!vis(V, wx - 20, wx + 20, 40)) return;
  if (s.kind === 'brazier') { put(V, P.bakeBrazier(), wx - 12, wy - 26); flameAt(V, 2, wx, wy - 16, s.x); halo(V, wx, wy - 18, 56, 0.6); }
  else if (s.kind === 'vigil') { put(V, P.bakeVigil(), wx - 7, wy - 30); flameAt(V, 1, wx, wy - 31, s.x); halo(V, wx, wy - 26, 44, 0.55); }
  else { put(V, P.bakeVotive(), wx - 11, wy - 22); for (const [fx, fy] of P.VOTIVE_WICKS) flameAt(V, 0, wx - 11 + fx + 1, wy - 22 + fy, s.x + fx); halo(V, wx, wy - 16, 40, 0.55); }
}
export function drawBellows(V, b) { const wx = b.x * TS + 8, wy = (b.y + 1) * TS, k = b.air > 0 ? Math.abs(Math.sin(V.time * 10)) : 0; if (!vis(V, wx - 20, wx + 20)) return;
  put(V, P.bakeBellows(), wx - 11, wy - 16 + R(k * 3)); if (b.air > 0) { box(V, wx - 3, wy - 20, 6, 3, '#e8dcc0'); } }
export function drawDesk(V, d) { const wx = d.x * TS + 8, wy = (d.y + 1) * TS; if (!vis(V, wx - 20, wx + 20)) return; put(V, P.bakeConsole(), wx - 13, wy - 26); if (d.tell > 0 || d.on > 0) for (let i = 0; i < 4; i++) box(V, wx - 9 + i * 6, wy - 28 - R((V.time * 20 + i * 5) % 8), 1, 2, '#e8dcc0'); }
export function drawGrate(V, q) { const wx = q.x * TS, wy = q.y * TS; if (!vis(V, wx, wx + 16)) return; put(V, P.bakeGrate(0), wx, wy - 2); if (q.glow > 0) { alpha(V, 0.45 + 0.4 * Math.sin(V.time * 14), () => { box(V, wx + 1, wy - 12, 14, 12, '#9ab0e0'); box(V, wx + 4, wy - 8, 8, 8, '#e0eaff'); }); } }
export function drawDoor(V, d) {
  const x0 = d.x0 * TS, y0 = d.y0 * TS, w = (d.x1 - d.x0 + 1) * TS, h = (d.y1 - d.y0 + 1) * TS; if (!vis(V, x0, x0 + w, 60)) return;
  if (d.id === 'hatch') { alpha(V, 0.5 + 0.3 * Math.sin(V.time * 3), () => { for (let x = x0 + 2; x < x0 + w; x += 5) box(V, x, y0, 2, h, '#d8e0ff'); }); box(V, x0, y0, w, 2, '#a8b8e0'); return; }
  if (d.id === 'rood') { put(V, P.bakeDoorBars(w, h, 'rood'), x0, y0); return; }
  if (d.id === 'cryptgrate') { put(V, P.bakeDoorBars(w, h, 'x'), x0, y0); return; }
  if (d.id === 'reliquary' || d.id === 'sacristy') { box(V, x0, y0, w, h, '#4a2e1a'); for (let x = x0 + 2; x < x0 + w; x += 5) box(V, x, y0, 1, h, '#3a2014'); box(V, x0, y0 + h / 2 | 0, w, 2, '#3a3846'); box(V, x0 + w - 5, y0 + (h / 2 | 0) - 1, 3, 3, '#d8b040'); return; }
  put(V, P.bakeDoorBars(w, h, 'west'), x0, y0); box(V, x0, y0, w, 3, '#6a6880'); /* the west door: iron-banded, a lit-lamp's seal */ for (let x = x0 + 4; x < x0 + w - 4; x += 12) { box(V, x, y0 + 14, 2, 2, '#d8b040'); }
}
