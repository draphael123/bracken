// tools/lit-church-art-sheet.mjs - THE LIT CHURCH's baked art in Node (claude/churchart; not in the suite): the tile kit laid over a stretch of the real level, the props, the cast, THE PALADIN's poses.
//   usage: node tools/lit-church-art-sheet.mjs <out.png> tiles x0 x1 y0 y1 [scale] | props | foes | bases | paladin
import { install, sheet, savePNG, newCanvas } from './node-canvas.mjs';
install();
const out = process.argv[2] || 'lit-church-art-sheet.png', which = process.argv[3] || 'tiles';
if (which === 'tiles') {
  const { LEVELS, T } = await import('../src/level.js'); const KT = await import('../src/redraw/church_tiles.js');
  const [x0, x1, y0, y1] = process.argv.slice(4, 8).map(Number), sc = +(process.argv[8] || 2);
  const L = LEVELS.find(l => l.id === 'church').build(); const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
  const c = newCanvas((x1 - x0 + 1) * 16, (y1 - y0 + 1) * 16), g = c.getContext('2d'); g.fillStyle = '#2a2838'; g.fillRect(0, 0, c.width, c.height);
  const SET = await import('../src/redraw/church_set.js'); const time = +(process.env.TIME || 0);
  const V = { g, cx: x0 * 16, cy: y0 * 16, vw: c.width, vh: c.height, time, L, T, noGlow: true, lit: () => process.env.DARK ? false : true };
  if (!process.env.NOBACK) SET.drawBackdrop(V);
  let nulls = 0; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const t = at(x, y); if (t === T.AIR) continue; const s = KT.churchTile(t, x, y, at, T, L); if (s) g.drawImage(s, (x - x0) * 16, (y - y0) * 16); else { nulls++; g.fillStyle = '#f0f'; g.fillRect((x - x0) * 16, (y - y0) * 16, 16, 16); } }
  if (!process.env.NOPROPS) { const pl = SET.plan(L, T); SET.paintWorld(V, pl); }
  const big = newCanvas(c.width * sc, c.height * sc), bg = big.getContext('2d'); bg.drawImage(c, 0, 0, c.width, c.height, 0, 0, big.width, big.height); savePNG(big, out); console.log('wrote ' + out + ' (' + nulls + ' null cells)');
}
if (which === 'props') { const P = await import('../src/redraw/church_props.js'); const items = P.sheetItems(); savePNG(sheet(items, { maxW: 900, bg: '#5a5870', pad: 6, scale: 3 }), out); console.log('wrote ' + out + ' (' + items.length + ' items)'); }
if (which === 'bases') { const C = await import('../src/chars.js'); const items = []; for (const b of [C.bakeSwornSword(), C.bakeHedgeKnight(), C.bakeRunner(), C.bakeCrossbowman()]) items.push(...b.R); const M = await import('../src/redraw/mystic_art.js'); items.push(...M.bakeBanditMystic().R); savePNG(sheet(items, { maxW: 1300, bg: '#5a5870', pad: 5, scale: 4 }), out); console.log('wrote ' + out + ' (' + items.length + ' items)'); }
if (which === 'foes') { const F = await import('../src/redraw/church_art.js'); const items = await F.sheetItems(); savePNG(sheet(items, { maxW: 1100, bg: '#5a5870', pad: 5, scale: 3 }), out); console.log('wrote ' + out + ' (' + items.length + ' items)'); }
if (which === 'paladin') { const F = await import('../src/redraw/paladin_art.js'); const items = F.sheetItems(); savePNG(sheet(items, { maxW: 1200, bg: '#5a5870', pad: 6, scale: 3 }), out); console.log('wrote ' + out + ' (' + items.length + ' items)'); }
