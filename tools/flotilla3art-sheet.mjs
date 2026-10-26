// tools/flotilla3art-sheet.mjs - THE ADMIRAL's pose sheet, the fight's pieces and the new foes in Node (claude/flotilla3art; not in the suite). No browser.
//   node tools/flotilla3art-sheet.mjs <outdir> [admiral|plates|dead|fx|foes|all]
import { install, newCanvas, savePNG } from './node-canvas.mjs';
import { mkdirSync } from 'fs';
import { join } from 'path';
install();
const out = process.argv[2] || 'work/claude/shots/flotilla3art/sheets', which = process.argv[3] || 'all'; mkdirSync(out, { recursive: true });
const A = await import('../src/redraw/admiral_art.js');
const S = 3;
function sheet(cells, cols, CW, CH, bg) { const rows = Math.ceil(cells.length / cols), cv = newCanvas(cols * CW * S, rows * CH * S), g = cv.getContext('2d');
  cells.forEach((fn, i) => { const c = newCanvas(CW, CH), q = c.getContext('2d'); q.fillStyle = bg || '#6a5a8a'; q.fillRect(0, 0, CW, CH); q.fillStyle = '#8a6a48'; q.fillRect(0, CH - 14, CW, 14); q.fillStyle = '#b09468'; q.fillRect(0, CH - 14, CW, 1); fn(q, CW, CH);
    g.drawImage(c, 0, 0, CW, CH, (i % cols) * CW * S, Math.floor(i / cols) * CH * S, CW * S, CH * S); }); return cv; }
const MODES = ['walk', 'recover', 'sleep', 'card', 'wake', 'cutTell', 'cut', 'cutRec', 'pistolTell', 'pistol2Tell', 'reload', 'kegTell', 'kegRec', 'whistleTell', 'whistleRec', 'grapTell', 'swing', 'fall', 'climb', 'landRec', 'stagger', 'soaked', 'listTell', 'flurryTell', 'flurry', 'axeTell', 'axe', 'axeStuck', 'axeRec', 'flat'];
const P = { cut: 0.6, wake: 0.7, cutTell: 0.9, kegTell: 1, kegRec: 0.3, whistleTell: 1, whistleRec: 0.5, landRec: 0.3, axeTell: 1, axe: 0.7, axeRec: 0.4, listTell: 1, pistolTell: 1, pistol2Tell: 1 };
if (which === 'admiral' || which === 'all') {
  for (const [name, off] of [['admiral_on', []], ['admiral_bare', [0, 1, 2]]]) {
    const ms = off.length ? MODES.filter(m => !['sleep', 'card', 'wake'].includes(m)) : MODES;
    const cells = ms.map(m => (q, W, H) => A.drawAdmiral(q, 60, H - 14, 1, { mode: m, p: P[m] ?? 0.5, off }, 1.3));
    savePNG(sheet(cells, 6, 120, 80), join(out, name + '.png')); }
  savePNG(sheet([(q, W, H) => A.drawAdmiral(q, 40, H - 14, 1, { mode: 'recover', p: 0, off: [] }, 1), (q, W, H) => A.drawAdmiral(q, 40, H - 14, 1, { mode: 'recover', p: 0, off: [], ward: 1 }, 1), (q, W, H) => A.drawAdmiral(q, 40, H - 14, 1, { mode: 'recover', p: 0, off: [], flash: 1 }, 1),
    (q, W, H) => A.drawAdmiral(q, 40, H - 14, 1, { mode: 'recover', p: 0, off: [0] }, 1), (q, W, H) => A.drawAdmiral(q, 40, H - 14, 1, { mode: 'recover', p: 0, off: [1] }, 1), (q, W, H) => A.drawAdmiral(q, 40, H - 14, 1, { mode: 'recover', p: 0, off: [2] }, 1)], 6, 80, 70), join(out, 'admiral_zoom.png')); }
if (which === 'dead' || which === 'all') savePNG(sheet([0.05, 0.25, 0.4, 0.55, 0.75, 1].map(k => (q, W, H) => A.drawDeadAdmiral(q, 90, H - 14, 1, k, 1)), 3, 180, 80), join(out, 'admiral_dead.png'));
if (which === 'fx' || which === 'all') savePNG(sheet([
  (q) => { A.drawYard(q, 100, 20, 1); A.drawLine(q, 100, 24, 150, 74); A.drawLandMark(q, 150, 106, 22, 0.8, 1); },
  (q) => { A.drawKeg(q, 40, 90, 2, 2.8, 1, false); A.drawKeg(q, 90, 90, 1, 2.8, 1.3, true); A.drawShot(q, 150, 60); A.drawAim(q, 10, 50, 120, true, 1); A.drawAim(q, 10, 70, 120, false, 1); },
  (q) => { A.drawCells(q, [[10, 90], [120, 190]], [true, true], 106, 0.6, false, 1, 0); A.drawCells(q, [[210, 290]], [true], 106, 0.6, true, 1, 0); },
  (q) => { for (let i = 0; i < 3; i++) A.drawPlateFall(q, 40 + i * 60, 80, 0.3, i); for (let i = 0; i < 3; i++) A.drawPlateFall(q, 40 + i * 60, 40, 0.8, i); A.drawList(q, 20, 190, 106, 1); },
  (q) => { A.drawEnsign(q, 30, 120, 0, 1); A.drawEnsign(q, 110, 120, 0.7, 1); A.drawLanterns(q, [30, 130, 190], 20, 1); }], 2, 240, 130), join(out, 'admiral_fx.png'));
console.log('wrote', out);
if (which === 'world' || which === 'all') {
  const W = await import('../src/redraw/flotilla3_world.js'); const { canvas } = await import('../src/px.js');
  const sp = (c) => (q) => q.drawImage(c, 0, 0);
  savePNG(sheet([q => { q.drawImage(W.bakeMantlet(), 10, 60); q.drawImage(W.bakeMantlet(), 40, 60); }, q => q.drawImage(W.bakeRotDeck(), 10, 40), q => q.drawImage(W.bakeFlagship(), 0, 0),
    q => { W.drawHoist(q, 30, 100, false, 1); W.drawHoist(q, 90, 100, true, 1); }, q => { W.drawSwivel(q, 20, 40, 0.5, false, 0); W.drawSwivel(q, 70, 40, 0.5, true, 0.8); W.drawTopGun(q, 120, 40, -0.5, false, 0); },
    q => { W.drawCockedYard(q, 10, 60, 100, 10, 'cocked', 0); W.drawCockedYard(q, 10, 110, 100, 60, 'level', 0); }], 3, 180, 130, '#c89a8a'), join(out, 'world_a.png'));
  const [c1] = [W.bakeSloopHull()]; const [p] = [W.bakePoop()]; const dh = W.bakeDeckhouse();
  const big = newCanvas(540, 330), g = big.getContext('2d'); g.fillStyle = '#c89a8a'; g.fillRect(0, 0, 540, 330); g.drawImage(c1, 0, 150); g.drawImage(p, 280, 20); g.drawImage(dh, 440, 0);
  savePNG(big, join(out, 'world_b.png')); }
