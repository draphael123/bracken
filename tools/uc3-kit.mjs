// tools/uc3-kit.mjs - UNDERCROWN 3's TILE KIT overlay and ROOM ARCHITECTURE, run in Node (claude/uc3finish). No browser.
//   node tools/uc3-kit.mjs [out-prefix]  -> <prefix>-kit-tiles.png, <prefix>-kit-rooms.png
// Checks: every gassy cell gets a 16x16 overlay that differs from the UC2 kit cell and keeps its walked lip; cells outside every chamber and on the master build are untouched;
// every room that meets a chamber paints (no throw, pixels change) and rooms outside a chamber return false; the wind doors get portals.
process.env.BRACKEN_UC3 = '1';
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const { LEVELS, T, TS } = await import('../src/level.js');
const UCT = await import('../src/redraw/undercrown_tiles.js');
const U3 = await import('../src/redraw/uc3_tiles.js');
const L = LEVELS.find(l => l.id === 'undercrown').build(), W = L.W, H = L.H;
const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : L.grid[y * W + x];
const bad = []; let n = 0; const out = process.argv[2];
const px = c => c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
const diff = (a, b) => { const A = px(a), B = px(b); let d = 0; for (let i = 0; i < A.length; i += 4) if (A[i] !== B[i] || A[i + 1] !== B[i + 1] || A[i + 2] !== B[i + 2] || A[i + 3] !== B[i + 3]) d++; return d; };
/* 1. tiles */
const kinds = { ceil: [], top: [], face: [] }; let over = 0, plain = 0, outside = 0; const seen = new Set();
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const t = at(x, y), base = UCT.ucTile(t, x, y, at, T, L); if (!base) continue;
  const o = U3.uc3Tile(base, t, x, y, at, T, L), ch = U3.inChamber(L, x, y);
  if (!ch) { if (o) bad.push('tile ' + x + ',' + y + ' outside any chamber got an overlay'); outside++; continue; }
  if (!o) { plain++; continue; }
  n++; over++;
  if (o.width !== 16 || o.height !== 16) bad.push('tile ' + x + ',' + y + ' size');
  const d = diff(base, o); if (d < 8) bad.push('tile ' + x + ',' + y + ' barely changed (' + d + ' px)');
  if (!seen.has(o)) { seen.add(o); const up = at(x, y - 1) === T.AIR, dn = at(x, y + 1) === T.AIR; const k = dn ? 'ceil' : up ? 'top' : 'face'; if (kinds[k].length < 8) kinds[k].push(o); }
  /* the walked lip stays readable: a floor tile's top 2 rows keep >= 70% of the kit's pixels */
  if (at(x, y - 1) === T.AIR && at(x, y + 1) !== T.AIR) { const A = px(base), B = px(o); let same = 0; for (let i = 0; i < 32; i++) if (A[i * 4] === B[i * 4] && A[i * 4 + 1] === B[i * 4 + 1]) same++; if (same < 22) bad.push('floor lip lost at ' + x + ',' + y); }
}
n++; if (over < 200) bad.push('only ' + over + ' overlaid cells (the chambers have far more)');
/* master build: no uc3 flag on L -> main.js never calls it; the module itself returns null with no chambers */
n++; { const fake = { W, H, firedamp: null }; if (U3.uc3Tile(UCT.ucTile(T.SOLID, 0, 0, at, T, L), T.SOLID, 0, 0, at, T, fake)) bad.push('overlay without firedamp'); }
/* 2. rooms: every 'mine' interior that meets a chamber, drawn into a fresh canvas */
let rooms = 0, painted = 0; const shots = []; const ch = L.firedamp.chambers;
for (const [x0, x1, y0, y1, st] of (L.interiors || [])) {
  const w = (x1 - x0 + 1) * TS, h = (y1 - y0 + 1) * TS, c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = '#20202a'; g.fillRect(0, 0, w, h);
  const before = px(c).slice(); let r; try { r = U3.roomOver(g, st, 0, 0, w, h, x0, y0, 0, x0 * TS, y0 * TS, w, h, L); } catch (e) { bad.push('room ' + [x0, x1, y0, y1] + ' threw ' + e.message); continue; }
  const meets = ch.some(k => k.x1 >= x0 && k.x0 <= x1 && k.y1 >= y0 && k.y0 <= y1); rooms++; n++;
  if (meets !== !!r) bad.push('room ' + [x0, x1, y0, y1] + ' meets a chamber=' + meets + ' but returned ' + r);
  if (r) { painted++; const a = px(c); let d = 0; for (let i = 0; i < a.length; i += 4) if (a[i] !== before[i] || a[i + 1] !== before[i + 1]) d++; if (d < 200) bad.push('room ' + [x0, x1, y0, y1] + ' drew almost nothing (' + d + ' px)'); if (shots.length < 6 && w < 900) shots.push(c); }
}
n++; if (painted < 6) bad.push('only ' + painted + ' rooms painted');
/* 3. the doors */
for (const e of L.ents.filter(e => e.t === 'brattice')) { n++;
  const c = newCanvas(120, 80), g = c.getContext('2d'); g.fillStyle = '#20202a'; g.fillRect(0, 0, 120, 80); const cx = e.x, ok = U3.roomOver(g, 'mine', 0, 0, 120, 80, e.x - 3, e.y0, 0, (e.x - 3) * TS, e.y0 * TS, 120, 80, L);
  if (!ok) bad.push('brattice ' + e.door + ' got no room'); else if (px(c).some((v, i) => i % 4 === 0 && v > 90)) { /* brick lit pixels present */ } else bad.push('brattice ' + e.door + ': no portal pixels'); void cx; }
if (out) {
  const big = (list, o, s) => { const sh = sheet(list, o), c = newCanvas(sh.width * s, sh.height * s), g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(sh, 0, 0, sh.width, sh.height, 0, 0, sh.width * s, sh.height * s); return c; };
  savePNG(big([...kinds.ceil, ...kinds.top, ...kinds.face], { maxW: 8 * 18, bg: '#111', pad: 1 }, 4), out + '-kit-tiles.png');
  if (shots.length) savePNG(big(shots, { maxW: 900, bg: '#000', pad: 4 }, 1), out + '-kit-rooms.png');
}
console.log(n + ' checked (' + over + ' overlaid cells, ' + seen.size + ' variants, ' + painted + '/' + rooms + ' rooms painted), ' + bad.length + ' bad' + (bad.length ? '\n  ' + bad.slice(0, 30).join('\n  ') : '')); process.exit(bad.length ? 1 : 0);
