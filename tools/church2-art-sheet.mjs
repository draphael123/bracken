// tools/church2-art-sheet.mjs - LIT CHURCH 2's baked props in Node (claude/church2art; not in the suite): the crossing, holy fire, the chantry.
//   usage: node tools/church2-art-sheet.mjs <out.png> [scale]
import { install, sheet, savePNG, newCanvas } from './node-canvas.mjs';
install();
const out = process.argv[2] || 'church2-art-sheet.png', sc = +(process.argv[3] || 3);
const A = await import('../src/redraw/church2_art.js'); const P = await import('../src/redraw/church_props.js');
const items = []; const bg = (w, h) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = '#2a2838'; g.fillRect(0, 0, w, h); return [c, g]; };
const flames = (g, list, ox, oy, t = 0.3) => { for (const [x, y] of list) { const f = P.bakeFlame(0, Math.floor(t * 9) & 3); g.drawImage(f, x + ox - 2, y + oy - 5); } };
{ const [c, g] = bg(20, 44); g.drawImage(A.bakeFloorSconce(), 3, 2); const f = P.bakeFlame(1, 1); g.drawImage(f, 3 + A.SCONCE_WICK[0] - 4, 2 + A.SCONCE_WICK[1] - 9); items.push(c); }
{ const [c, g] = bg(20, 44); g.drawImage(A.bakeFloorSconce(), 3, 2); items.push(c); }
{ const [c, g] = bg(64, 60); A.drawChainLinks(g, 32, 0, 12); g.drawImage(A.bakeChandelier2(), 8, 12); flames(g, A.CH_WICKS, 8, 12 + 4); items.push(c); }
{ const [c, g] = bg(64, 60); A.drawChainLinks(g, 32, 0, 12); g.drawImage(A.bakeChandelier2(), 8, 12); items.push(c); }
{ const [c, g] = bg(64, 60); g.drawImage(A.bakeChandelierFalling(1), 0, 0); items.push(c); }
{ const [c, g] = bg(64, 40); g.drawImage(A.bakeChandelierLying(), 6, 14); flames(g, A.CH_LY_WICKS, 6, 14 + 4); items.push(c); }
{ const [c, g] = bg(20, 112); g.drawImage(A.bakeParclose(112, false), 2, 0); items.push(c); }
{ const [c, g] = bg(20, 112); g.drawImage(A.bakeParclose(112, true), 2, 0); items.push(c); }
{ const [c, g] = bg(72, 40); g.drawImage(A.bakeCryptGrate(64, false), 4, 10); items.push(c); }
{ const [c, g] = bg(72, 40); g.drawImage(A.bakeCryptGrate(64, true), 4, 10); A.drawGrateChains(g, 4, 68, 10, 0); items.push(c); }
for (const on of [true, false]) { const [c, g] = bg(112, 48); g.fillStyle = '#4a4660'; g.fillRect(0, 40, 112, 8); A.drawTroughFire(g, 8, 104, 40, on, 0.4); A.drawFeed(g, 8, 40, 44, true, on, 0.4); items.push(c); }
for (const lit of [false, true]) { const [c, g] = bg(30, 40); g.drawImage(A.bakeRelayBrazier(lit), 2, 4); if (lit) g.drawImage(P.bakeFlame(2, 1), 2 + A.RB_WICK[0] - 7, 4 + A.RB_WICK[1] - 20); items.push(c); }
{ const [c, g] = bg(20, 84); g.drawImage(A.bakeChantryDoor(80), 2, 2); items.push(c); }
{ const [c, g] = bg(64, 40); g.drawImage(A.bakeStall(3), 6, 4); items.push(c); }
{ const [c, g] = bg(10, 58); g.drawImage(A.bakeBellRope(), 2, 2); items.push(c); }
savePNG(sheet(items, { maxW: +(process.env.MAXW || 1500), bg: '#5a5870', pad: 4, scale: sc }), out); console.log('wrote ' + out + ' (' + items.length + ')');
