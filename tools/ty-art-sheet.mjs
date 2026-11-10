// tools/ty-art-sheet.mjs (claude/tourneyart; pure node, no browser): THE TOURNEY's new art on a contact sheet - the barded chargers (stand / walk / gallop / rear), the mounted hero's seat
// and lance, THE CHAMPION in every pose of his hands file's POSE table, the squire, the horse archer, and the set dressing (pavilions, stall, loft, royal box, nest, banner, hurdle,
// ring, target, quintain, tilt rail, lists fence, the crowd). Everything is drawn by src/redraw/ty_art.js into a tools/node-canvas.mjs canvas.
//   node tools/ty-art-sheet.mjs [out.png] [scale]
import { install, savePNG } from './node-canvas.mjs';
install();
const { Canvas } = await import('./node-canvas.mjs').then(m => ({ Canvas: m.Canvas }));
const ART = await import('../src/redraw/ty_art.js');
const { POSE } = await import('../src/ty-champion-hands.js');
const SC = +(process.argv[3] || 3), out = process.argv[2] || 'ty-art-sheet.png';
const mk = (w, h, bg = '#6fa3cf') => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = '#5a7a4a'; g.fillRect(0, h - 6, w, 6); return [c, g]; };
const cells = [];
const cell = (w, h, fn, bg) => { const [c, g] = mk(w, h, bg); try { fn(g, h - 6); } catch (e) { console.error('FAILED', fn.toString().slice(0, 70), e.message); process.exitCode = 1; } cells.push(c); return c; };
/* 1 the horses */
for (const kind of ['hero', 'champ', 'archer']) {
  cell(160, 44, (g, gy) => { ART.drawHorse(g, kind, 20, gy, 1, 0, 0); ART.drawHorse(g, kind, 62, gy, 1, 100, 0.00); ART.drawHorse(g, kind, 104, gy, 1, 240, 0.0); ART.drawHorse(g, kind, 140, gy, -1, 0, 0, 'rear'); });
  cell(200, 44, (g, gy) => { for (let k = 0; k < 4; k++) ART.drawHorse(g, kind, 22 + k * 48, gy, 1, 240, k * 0.08); });
}
/* the mounted hero: a stand-in rider (a hero is main.js's own sprite, so a plain figure) on the hero's horse with the seat laid over him, the lance in each state */
const rider = (g, x, y) => { g.fillStyle = '#c8ccd4'; g.fillRect(x - 5, y - 24, 10, 14); g.fillStyle = '#e0b090'; g.fillRect(x - 3, y - 31, 7, 7); g.fillStyle = '#4a3a2a'; g.fillRect(x - 4, y - 12, 4, 10); g.fillRect(x + 1, y - 12, 4, 10); };
for (const st of ['rest', 'lowering', 'couched', 'tired']) cell(96, 70, (g, gy) => { const x = 40, y = gy; ART.drawHorse(g, 'hero', x, y, 1, st === 'couched' ? 240 : 100, 0.1); rider(g, x, y - 8); ART.drawRiderOver(g, 'hero', x, y, 1, 240, 0.1);
  if (st === 'rest') ART.drawLance(g, x + 6, y - 28, 1.3, 34, 1, { time: 0.2 }); else if (st === 'lowering') ART.drawLance(g, x + 8, y - 26, 0.6, 34, 1, { time: 0.2 }); else if (st === 'couched') ART.drawLance(g, x + 2, y - 24, 0.02, 44, 1, { hot: true, time: 0.1 }); else ART.drawLance(g, x + 4, y - 26, 1.0, 30, 1, { time: 0.3 }); });
/* 2 the Champion */
const fakeE = (mode, o = {}) => ({ x: 56, y: 62, face: 1, vx: 0, mode, lanceDown: false, ...o });
for (const [m, o] of [['sleep', {}], ['wheel', {}], ['pass', { vx: 240 }], ['pass', { vx: 240, lanceDown: true }], ['swipeTell', {}], ['swipe', {}], ['lanceless', { vx: 240 }], ['arm', {}], ['fetch', {}], ['unhorsed', {}], ['rise', {}], ['walk', { vx: 40 }], ['flailTell', {}], ['flail', {}], ['overTell', {}], ['over', {}], ['rushTell', {}], ['rush', {}], ['hornTell', {}]])
  cell(120, 80, (g) => { ART.drawChampion(g, fakeE(m, o), 0, 0, 0.3, POSE); g.fillStyle = '#fff'; });
cell(120, 80, (g, gy) => { ART.drawSquire(g, 24, gy, 1, 'run', 0.1); ART.drawSquire(g, 58, gy, -1, 'wait', 0.1); ART.drawSquire(g, 96, gy, 1, 'drop', 0.1); });
cell(150, 60, (g, gy) => { ART.drawArcher(g, { x: 36, y: gy, face: 1, aim: 1, mode: 'circle', mounted: true, vx: 80 }, 0, 0, 0.1); ART.drawArcher(g, { x: 92, y: gy, face: 1, aim: -1, mode: 'drawTell', mounted: true, vx: 80 }, 0, 0, 0.1);
  ART.drawArcher(g, { x: 124, y: gy, face: 1, aim: 1, mode: 'footTell', mounted: false }, 0, 0, 0.1); ART.drawArrow(g, 140, gy - 20, 200, 20); });
cell(60, 40, (g, gy) => { ART.drawArcher(g, { x: 22, y: gy, face: 1, aim: 1, mode: 'down', mounted: false }, 0, 0, 0.1); });
/* 3 the set dressing */
cell(180, 100, (g, gy) => ART.drawPavilion(g, 20, 40, 120, gy, '#c84a3a', 0.4, false), '#9ec8e8');
cell(130, 110, (g, gy) => ART.drawPavilion(g, 16, 30, 96, gy, '#3a6ac8', 0.4, true), '#9ec8e8');
cell(100, 90, (g, gy) => ART.drawPavilion(g, 14, 36, 72, gy, '#d8b030', 0.4, true), '#9ec8e8');
cell(130, 90, (g, gy) => ART.drawStall(g, 16, 34, 64, gy, 0.3), '#9ec8e8');
cell(180, 100, (g, gy) => ART.drawLoft(g, 6, 34, 160, gy, 0.3), '#9ec8e8');
cell(130, 100, (g, gy) => ART.drawRoyalBox(g, 14, 56, 90, gy, 0.5), '#9ec8e8');
cell(70, 70, (g, gy) => ART.drawNest(g, 14, 40, 40, gy, 0.5), '#9ec8e8');
cell(80, 70, (g, gy) => { ART.drawBanner(g, 20, 8, gy, '#2a4ab0', 0.5, 0); ART.drawBanner(g, 58, 8, gy, '#d84a4a', 0.5, 2); }, '#9ec8e8');
cell(130, 60, (g, gy) => { ART.drawListFence(g, 0, 130, gy, 0); ART.drawHurdle(g, 20, gy); ART.drawHurdle(g, 70, gy); }, '#9ec8e8');
cell(130, 70, (g, gy) => { ART.drawRing(g, 32, gy - 36, gy, false, 0.1); ART.drawRing(g, 70, gy - 36, gy, true, 0.1); ART.drawTarget(g, 100, gy - 22, gy, false); ART.drawTarget(g, 120, gy - 22, gy, true); }, '#9ec8e8');
cell(130, 70, (g, gy) => { ART.drawQuintain(g, 36, gy, -1, 'idle', 0); ART.drawQuintain(g, 96, gy, 1, 'sweep', 0.5); }, '#9ec8e8');
cell(180, 70, (g, gy) => ART.drawRailBarrier(g, 4, 176, 12, 0), '#9ec8e8');
cell(180, 70, (g, gy) => { for (let k = 0; k < 3; k++) { ART.drawStandFace(g, 8 + k * 6, 24 + k * 14, 164 - k * 6, 8); ART.drawCrowd(g, 8 + k * 6, 24 + k * 14, 164 - k * 6, k + 1, 0.1); } }, '#9ec8e8');
/* lay out */
const maxW = 760, pad = 5; let x = pad, y = pad, rowH = 0; const pos = [];
for (const c of cells) { if (x + c.width + pad > maxW && x > pad) { x = pad; y += rowH + pad; rowH = 0; } pos.push([x, y]); x += c.width + pad; rowH = Math.max(rowH, c.height); }
const H = y + rowH + pad, base = document.createElement('canvas'); base.width = maxW; base.height = H; const bg = base.getContext('2d'); bg.fillStyle = '#16121c'; bg.fillRect(0, 0, maxW, H);
cells.forEach((c, i) => bg.drawImage(c, pos[i][0], pos[i][1]));
const big = document.createElement('canvas'); big.width = maxW * SC; big.height = H * SC; big.getContext('2d').drawImage(base, 0, 0, maxW * SC, H * SC);
savePNG(big, out); console.log('sheet ->', out, maxW * SC + 'x' + H * SC, 'cells', cells.length);
