// tools/ksar-art-sheet.mjs - THE BANDIT KSAR's baked art in Node (claude/ksar art pass; not in the suite): the tile kit laid over a stretch of the real level, and the props/cast sheets.
//   usage: node tools/ksar-art-sheet.mjs <out.png> tiles x0 x1 y0 y1 [scale] | props | foes
import { install, sheet, savePNG, newCanvas } from './node-canvas.mjs';
install();
const out = process.argv[2] || 'ksar-art-sheet.png', which = process.argv[3] || 'tiles';
if (which === 'tiles') {
  const { LEVELS, T } = await import('../src/level.js'); const KT = await import('../src/redraw/ksar_tiles.js');
  const [x0, x1, y0, y1] = process.argv.slice(4, 8).map(Number), sc = +(process.argv[8] || 2);
  const L = LEVELS.find(l => l.id === 'ksar').build(); const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
  const c = newCanvas((x1 - x0 + 1) * 16, (y1 - y0 + 1) * 16), g = c.getContext('2d'); g.fillStyle = '#e8a878'; g.fillRect(0, 0, c.width, c.height);
  let nulls = 0; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const t = at(x, y); if (t === T.AIR) continue; const s = KT.ksarTile(t, x, y, at, T, L); if (s) g.drawImage(s, (x - x0) * 16, (y - y0) * 16); else { nulls++; g.fillStyle = '#f0f'; g.fillRect((x - x0) * 16, (y - y0) * 16, 16, 16); } }
  if (!process.env.NOPROPS) { const SET = await import('../src/redraw/ksar_set.js'); const time = +(process.env.TIME || 0);
    const V = { g, cx: x0 * 16, cy: y0 * 16, vw: c.width, vh: c.height, time, L, T, noGlow: true }; const pl = SET.plan(L, T); SET.paintWorld(V, pl);
    for (const b of L.barricades) SET.drawArch(V, b); if (L.gate) SET.drawGate(V, { ...L.gate, notch: +(process.env.NOTCH || 0), pinned: false }, true);
    for (const v of L.vaultDoors) SET.drawVault(V, v, +(process.env.SEALS || 2)); for (const q of L.stacks) SET.drawStack(V, { ...q, left: q.n });
    for (const q of L.gongs) { const gg = { ...q, cut: process.env.CUT ? q.id === process.env.CUT : false, ring: 0 }; SET.drawGong(V, gg); if (q.bridge) SET.drawBridge(V, gg); }
    for (const k of L.setKegs) SET.drawKeg(V, k.x * 16 + 8, (k.y + 1) * 16, false, 0); }
  const big = newCanvas(c.width * sc, c.height * sc), bg = big.getContext('2d'); bg.drawImage(c, 0, 0, c.width, c.height, 0, 0, big.width, big.height); savePNG(big, out); console.log('wrote ' + out + ' (' + nulls + ' null cells)');
}
if (which === 'props') { const P = await import('../src/redraw/ksar_props.js'); const items = P.sheetItems(); savePNG(sheet(items, { maxW: 900, bg: '#a87a68', pad: 6, scale: 3 }), out); console.log('wrote ' + out + ' (' + items.length + ' items)'); }
if (which === 'foes') { const F = await import('../src/redraw/ksar_art.js'); const items = await F.sheetItems(); savePNG(sheet(items, { maxW: 1100, bg: '#a87a68', pad: 5, scale: 3 }), out); console.log('wrote ' + out + ' (' + items.length + ' items)'); }
if (which === 'props2') {   /* (claude/ksar2 part B) the longer Ksar's pieces in every state on a plain sand ground: node tools/ksar-art-sheet.mjs out.png props2 [scale] [time] */
  const P2 = await import('../src/redraw/ksar_props2.js'); const { LEVELS, T } = await import('../src/level.js'); const L = LEVELS.find(l => l.id === 'ksar').build();
  const sc = +(process.argv[4] || 3), time = +(process.argv[5] || 0.4), c = newCanvas(66 * 16, 14 * 16), g = c.getContext('2d'); g.fillStyle = '#e8a878'; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#b89060'; g.fillRect(0, 9 * 16, c.width, 5 * 16); g.fillStyle = '#7a5a3a'; g.fillRect(0, 9 * 16, c.width, 2);
  const V = { g, cx: 0, cy: 0, vw: c.width, vh: c.height, time, L, T, noGlow: true }; P2.sheetScene(V, time);
  const big = newCanvas(c.width * sc, c.height * sc); big.getContext('2d').drawImage(c, 0, 0, c.width, c.height, 0, 0, big.width, big.height); savePNG(big, out); console.log('wrote ' + out);
}
if (which === 'mistress') { const F = await import('../src/redraw/ksar_art.js'); const items = [...F.MISTRESS_POSES.map(n => F.bakeMistress(n)), ...[0, 2, 3, 5, 7].map(i => F.bakeHerHawk(i).c)]; savePNG(sheet(items, { maxW: 820, bg: '#a87a68', pad: 4, scale: 3 }), out); console.log('wrote ' + out + ' (' + F.MISTRESS_POSES.join(' ') + ')'); }
if (which === 'keep') { const P2 = await import('../src/redraw/ksar_props2.js'); const sc = 3, c = newCanvas(320, 180), g = c.getContext('2d'); g.fillStyle = '#e8a878'; g.fillRect(0, 0, 320, 180); P2.drawKeep(g, 4648, 0, 320, 180, 0.3, 0);
  const big = newCanvas(320 * sc, 180 * sc); big.getContext('2d').drawImage(c, 0, 0, 320, 180, 0, 0, big.width, big.height); savePNG(big, out); console.log('wrote ' + out); }
