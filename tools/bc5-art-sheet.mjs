// tools/bc5-art-sheet.mjs - BURIED CITY 5's ART as contact sheets, NODE ONLY (no browser, no page): the Glassblower's poses and tells, the Sand Grasper's tell, the Glass Works kit, a composed boss hall.
//   node tools/bc5-art-sheet.mjs [outdir] [gb|tells|grasper|kit|hall|all]      default outdir = ../scratch/lane-reports/bc5art (LANES), default all
//   The canvas is tools/node-canvas.mjs (rect, alpha, drawImage only): src/redraw/buried_city_bc5_art.js is rect-only on purpose, so what is on the sheet is what the page draws.
//   NOT on the sheet (they need the browser's paths/gradients): the real hourglass and the real tiles - the hall sheet stands a plain placeholder where they go (labelled in the report).
import { install, newCanvas, savePNG } from './node-canvas.mjs';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as A from '../src/redraw/buried_city_bc5_art.js';
import { GB, GB_STAGE } from '../src/glassblower.js';
import { GRASP } from '../src/sand-grasper.js';
install();
const OUT = process.argv[2] && !['gb', 'tells', 'grasper', 'kit', 'hall', 'all'].includes(process.argv[2]) ? process.argv[2] : fileURLToPath(new URL('../../scratch/lane-reports/bc5art/', import.meta.url));
const WHICH = process.argv.slice(2).filter(a => ['gb', 'tells', 'grasper', 'kit', 'hall', 'all'].includes(a))[0] || 'all';
mkdirSync(OUT, { recursive: true });
const BG = '#6a5a48', FLOOR = '#c4a672', FLOORHI = '#e8d09a';
const cell = (w, h, fn, bg = BG, floorY = h - 10) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = FLOOR; g.fillRect(0, floorY, w, h - floorY); g.fillStyle = FLOORHI; g.fillRect(0, floorY, w, 1); fn(g, floorY); return c; };
/* lay cells in a grid, scaled (nearest) */
function grid(cells, cols, k, pad = 2, bg = '#2a2018') { const cw = Math.max(...cells.map(c => c.width)), ch = Math.max(...cells.map(c => c.height)), rows = Math.ceil(cells.length / cols);
  const out = newCanvas((cw + pad) * cols * k + pad * k, (ch + pad) * rows * k + pad * k), g = out.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, out.width, out.height);
  cells.forEach((c, i) => { g.drawImage(c, pad * k + (i % cols) * (cw + pad) * k, pad * k + Math.floor(i / cols) * (ch + pad) * k, c.width * k, c.height * k); }); return out; }
const save = (c, name) => { savePNG(c, join(OUT, name)); console.log('wrote', join(OUT, name), c.width + 'x' + c.height); };
const V = (g, t) => ({ g, time: t, cx: 0, cy: 0 });
const W = 84, H = 92;
const gbCell = (o, f = 1) => cell(W, H, (g, fy) => A.drawGlassblower(g, { x: W / 2, y: fy, f, t: 0.4, ph: 1, p: 0.6, ...o }));

if (WHICH === 'gb' || WHICH === 'all') {
  const poses = ['gbSleep', 'gbWake', 'gbIdle', 'gbWalk', 'gbGobWind', 'gbGobRel', 'gbBlastWind', 'gbBlastRel', 'gbFlipWind', 'gbFlipRel', 'gbBulbWind', 'gbBulbRel', 'gbStagger'];
  const cells = poses.map(p => gbCell({ pose: p, p: p === 'gbWake' ? 0.6 : 0.85 }));
  cells.push(gbCell({ pose: 'gbBuried', open: 1, openK: 0.7 }), gbCell({ pose: 'gbIdle', ward: 1 }), gbCell({ pose: 'gbIdle', flash: true }), gbCell({ pose: 'gbBlastWind', ph: 2, p: 0.9 }), gbCell({ pose: 'gbGobWind', ph: 2, p: 0.9 }), gbCell({ pose: 'gbIdle', f: -1 }, -1));
  save(grid(cells, 7, 3), 'gb-poses.png');
  const death = [0.05, 0.4, 0.8, 1.0, 1.4, 1.9, 2.2].map(t => cell(110, H, (g, fy) => A.drawGlassblowerDeath(g, { x: 55, y: fy, f: 1, t, time: 0.5 })));
  save(grid(death, 7, 3), 'gb-death.png');
}
if (WHICH === 'tells' || WHICH === 'all') {   /* each told move: the windup at 0 / .35 / .7 / 1, then the release - one row a move, P1 */
  const rows = [['gbGobWind', 'gbGobRel'], ['gbBlastWind', 'gbBlastRel'], ['gbFlipWind', 'gbFlipRel'], ['gbBulbWind', 'gbBulbRel']], cells = [];
  for (const [w, r] of rows) { for (const p of [0, 0.35, 0.7, 1]) cells.push(gbCell({ pose: w, p })); cells.push(gbCell({ pose: r })); }
  save(grid(cells, 5, 3), 'gb-tells.png');
  /* at the size the page shows him (1x), next to a 1.2 m-tall hero stand-in: 14 x 26 */
  const small = [['gbIdle'], ['gbGobWind'], ['gbBlastWind'], ['gbFlipWind'], ['gbBulbWind']].map(([p]) => cell(70, 70, (g, fy) => { A.drawGlassblower(g, { x: 38, y: fy, f: 1, pose: p, p: 0.9, t: 0.4, ph: 1 }); g.fillStyle = '#4a6a9a'; g.fillRect(6, fy - 26, 14, 26); g.fillStyle = '#d8c8a0'; g.fillRect(9, fy - 24, 6, 5); }));
  save(grid(small, 5, 2), 'gb-1x-vs-hero.png');
}
if (WHICH === 'grasper' || WHICH === 'all') {
  const gc = (o) => cell(70, 62, (g, fy) => A.drawGrasper(g, { x: 35, y: fy, f: 1, t: 0.5, ...o }));
  const cells = [gc({ mode: 'buried', pose: 'grBoil' })];
  for (const p of [0.05, 0.25, 0.45, 0.65, 0.85, 1]) cells.push(gc({ mode: 'boil', pose: 'grBoil', p, t: 0.5 + p }));
  for (const p of [0.2, 0.6, 0.95]) cells.push(gc({ mode: 'rise', pose: 'grRise', p }));
  for (const pose of ['grWalk', 'grWalk2', 'grWind', 'grGrab', 'grHold', 'grRecover']) cells.push(gc({ mode: pose === 'grWind' ? 'grabTell' : 'walk', pose }));
  cells.push(gc({ mode: 'walk', pose: 'grWalk', flash: true }));
  save(grid(cells, 8, 3), 'grasper-tell.png');
  const wake = [0, 0.15, 0.3, 0.5, 0.7, 0.9].map(p => gc({ mode: 'boil', pose: 'grBoil', p, t: 1 + p }));
  save(grid(wake, 6, 3), 'grasper-boil-strip.png');
}
if (WHICH === 'kit' || WHICH === 'all') {
  const cells = [];
  const door = (open, run, warn, moving) => cell(60, 90, (g, fy) => A.drawRaceDoor(V(g, 0.5), { l: 14, top: 22, w: 32, hh: 64, open, run, warn, moving }), '#3a2c20', 86);
  cells.push(door(0, false, false, false), door(0.5, true, false, true), door(1, true, false, false), door(1, true, true, false), door(0.3, true, true, true));
  for (const [run, warn] of [[false, false], [true, false], [true, true]]) cells.push(cell(70, 60, (g, fy) => A.drawRaceMarker(V(g, 0.7), 35, fy, { run, warn })));
  cells.push(cell(60, 70, (g, fy) => A.drawHallKiln(V(g, 0.5), 14, fy - 48, 32, 48)), cell(60, 70, (g, fy) => A.drawHallKiln(V(g, 0.9), 14, fy - 32, 32, 32)));
  cells.push(cell(120, 30, (g, fy) => A.drawHallFloor(V(g, 0.5), 0, fy, 120)));
  cells.push(cell(90, 70, (g, fy) => A.drawGob(V(g, 0.3), { fly: true, x: 44, y: fy - 30, x0: 20, tx: 70, t: 0.35 }, fy, 16, 0.3, 0, 0)));
  cells.push(cell(60, 50, (g, fy) => A.drawGob(V(g, 0.3), { hot: 2, x: 30 }, fy, 16, 0.3, 0, 0)), cell(60, 50, (g, fy) => A.drawGob(V(g, 0.3), { cooled: true, cool: 2.5, x: 30 }, fy, 16, 0.3, 0, 0)), cell(60, 50, (g, fy) => A.drawGob(V(g, 0.3), { cooled: true, cool: 0.5, x: 30 }, fy, 16, 0.3, 0, 0)));
  cells.push(cell(130, 50, (g, fy) => A.drawBlast(V(g, 0.2), { x: 10, far: 122, dir: 1 }, fy, GB.blastH, 0.2, 0, 0)));
  cells.push(cell(60, 40, (g, fy) => { A.drawShard(V(g, 0.2), { x: 20, y: fy - 4, dir: 1, ht: 'low' }, 0, 0, 0.2); A.drawShard(V(g, 0.2), { x: 40, y: fy - 14, dir: -1, ht: 'high' }, 0, 0, 0.2); }));
  cells.push(cell(60, 70, (g, fy) => A.drawGlint(V(g, 0.4), 30, fy - 22, 0.6, 0.4)));
  save(grid(cells, 6, 3), 'kit.png');
}
if (WHICH === 'hall' || WHICH === 'all') {   /* THE GLASSBLOWER'S HALL composed: floor, two kiln stubs, two placeholder hourglasses, him in P1 mid-blast tell and P2 */
  const S = GB_STAGE, ts = 16, hallW = S.W * ts + 24, build = (pose, p, ph, extra) => cell(hallW, 150, (g, fy) => {
    g.fillStyle = '#2a1c14'; g.fillRect(0, 0, hallW, fy); g.fillStyle = '#3a2820'; for (let y = 0; y < fy; y += 12) g.fillRect(0, y, hallW, 1);   /* the wall behind (flat stand-in for the tiles' hall wall) */
    g.fillStyle = FLOOR; g.fillRect(0, fy, hallW, 40); const l0 = 12;
    A.drawHallFloor(V(g, 0.5), l0, fy, S.W * ts, 0.5);
    S.cover.forEach(([a, b], i) => { const rows = S.coverRows[i], x = l0 + a * ts; A.drawHallKiln(V(g, 0.5 + i), x, fy - rows * ts, (b - a + 1) * ts, rows * ts); });
    for (const q of S.glass) { const x = l0 + q.c * ts + 8; g.fillStyle = '#b08a30'; g.fillRect(x - 6, fy - 30, 12, 30); g.fillStyle = '#9ac8e0'; g.fillRect(x - 4, fy - 26, 8, 20); }   /* placeholder hourglass: the real one is the flip's art (paths) */
    const hx = l0 + S.him * ts; A.drawGlassblower(g, { x: hx, y: fy, f: -1, pose, p, t: 0.4, ph, ...extra });
    if (extra && extra.cone) A.drawBlast(V(g, 0.2), { x: hx - 8, far: hx - 8 - GB.blastLen, dir: -1 }, fy, GB.blastH, 0.2, 0, 0);
    g.fillStyle = '#4a6a9a'; g.fillRect(l0 + 3 * ts, fy - 26, 14, 26); g.fillStyle = '#d8c8a0'; g.fillRect(l0 + 3 * ts + 3, fy - 24, 6, 5);   /* hero stand-in */
  }, '#1a1210', 120);
  save(grid([build('gbIdle', 0, 1), build('gbBlastWind', 0.9, 1), build('gbBlastRel', 1, 1, { cone: true }), build('gbGobWind', 0.9, 2), build('gbBuried', 1, 1, { openK: 0.6, open: 1 }), build('gbIdle', 0, 1, { ward: 1 })], 2, 2), 'hall-composed.png');
}
