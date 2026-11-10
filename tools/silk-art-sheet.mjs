// tools/silk-art-sheet.mjs (claude/silkart; pure node, no browser): THE SILK UNDERCROFT's art on a contact sheet. The REAL level is built (flag on), and windows of it are drawn with the real
// tile maker (src/redraw/silk_art.js silkTile) and the real hands' drawBack / drawOver (a fake world, as tools/silk.mjs): the crypt door, the hanging hall + the high bridge (whole and cut),
// the egg gallery (a sticky wall burning, a torch, a sac pulsing), the Mother's strands, the cathedral web. Then the props, the foes (spiderling, spitter, the lurker in every mode), and
// THE CRYPT MOTHER in every pose of the POSE table (+ left-facing, hit-flash, her knots and anchor line).
//   node tools/silk-art-sheet.mjs [out.png] [scale]
globalThis.__SK = true;
const { install, savePNG, newCanvas } = await import('./node-canvas.mjs'); install();
const { LEVELS, T, TS } = await import('../src/level.js');
const ART = await import('../src/redraw/silk_art.js');
const CMA = await import('../src/redraw/crypt_mother_art.js');
const { makeSilkHands, SAC } = await import('../src/silk-hands.js');
const CMM = await import('../src/crypt-mother.js');
const { makeCryptMotherHands, POSE } = await import('../src/crypt-mother-hands.js');
const out = process.argv[2] || 'silk-art-sheet.png', SC = +(process.argv[3] || 1);
const lv = LEVELS.find(l => l.id === 'silk'); if (!lv) { console.error('no silk level (flag?)'); process.exit(1); }
let bad = 0; const fail = (m, e) => { bad++; console.error('FAILED', m, e && e.message); };

const L = lv.build(), G0 = L.sk, W = L.W;
const fx = { L, TS, T, players: () => fx.heroes, enemies: () => fx.ens, ens: [], heroes: [], time: () => 0, number() {}, hint() {}, asPlayer: (p, fn) => fn(), damage: () => 'hit', cellSet: (x, y, t) => { L.grid[y * W + x] = t; }, upright: () => true, hitOnce: () => true, shake() {}, ring() {}, addFoe() {}, hurt() {} };
const hands = makeSilkHands(fx); hands.reset();
const S = hands.show();
const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= L.H ? T.SOLID : L.grid[y * W + x]);
const skins = ART.bakeSilkSkins();
const bg = (g, w, h) => { g.fillStyle = '#0a0a10'; g.fillRect(0, 0, w, h); g.fillStyle = '#12121a'; g.fillRect(0, h * 0.45, w, h * 0.55); };
const man = (g, x, y) => { g.fillStyle = '#5a7ab4'; g.fillRect(x - 3, y - 14, 6, 10); g.fillStyle = '#d4b090'; g.fillRect(x - 2, y - 18, 5, 4); g.fillStyle = '#3a3a4c'; g.fillRect(x - 3, y - 4, 6, 4); };
function scene(c0, r0, cols, rows, mutate) {
  const VW = cols * TS, VH = rows * TS, c = newCanvas(VW, VH), g = c.getContext('2d'), cx = c0 * TS, cy = r0 * TS, time = 1.3;
  bg(g, VW, VH);
  try { hands.drawBack(g, cx, cy, VW, VH, time); } catch (e) { fail('drawBack', e); }
  for (let y = r0; y < r0 + rows; y++) for (let x = c0; x < c0 + cols; x++) { const t = at(x, y); if (t === T.AIR) continue; let ts = null; try { ts = ART.silkTile(t, x, y, at, T, L); } catch (e) { fail('tile ' + t, e); }
    if (ts) g.drawImage(ts, (x - c0) * TS, (y - r0) * TS); else { g.fillStyle = '#ff00ff'; g.fillRect((x - c0) * TS, (y - r0) * TS, TS, TS); } }
  for (const e of L.ents) { if (e.x < c0 - 2 || e.x > c0 + cols + 2) continue; const px = e.x * TS + 8, py = (e.y + 1) * TS - cy;
    if (e.t === 'spider' && skins[e.cnSkin]) { const s = skins[e.cnSkin], fr = s[(e.face || 1) < 0 ? 'L' : 'R'][e.cnSkin === 'skspitter' ? 0 : 2]; g.drawImage(fr, px - cx - s.ax, py - s.ay); }
    if (e.t === 'silklurker') { const modes = ['hide', 'threadTell', 'ground', 'climb']; const m = modes[(e.x >> 3) % 4], hy = e.y * TS - cy; fx.ens.push({ t: 'silklurker', alive: true, x: px, y: m === 'hide' ? hy : m === 'threadTell' ? hy : py - 2, homeY: e.y * TS, floorY: (e.y + 1) * TS + 120, mode: m, face: 1 });
      const o = fx.ens[fx.ens.length - 1]; if (m !== 'ground' && m !== 'climb') o.y = e.y * TS + 2; else if (m === 'climb') o.y = e.y * TS + 50; else o.y = (e.y + 1) * TS + 120;
      try { hands.drawFoe(g, o, cx, cy, time); } catch (er) { fail('lurker', er); } }
    if (e.t === 'check') { g.fillStyle = '#d8b040'; g.fillRect(px - cx - 2, py - 26, 4, 26); } }
  if (mutate) mutate(g, cx, cy);
  try { hands.drawOver(g, cx, cy, VW, VH, time); } catch (e) { fail('drawOver', e); }
  fx.ens.length = 0; return c;
}
const scenes = [];
scenes.push(scene(0, 14, 40, 20, (g, cx, cy) => { const p = { x: 3 * TS, y: 27 * TS }; man(g, 3 * TS - cx + 8, 27 * TS + 16 - cy); }));
scenes.push(scene(76, 12, 40, 20, null));                          /* the high bridge, whole */
{ const a = G0.anchors.find(q => q.kind === 'bridge'); hands.cutAnchor(a.id); }
scenes.push(scene(76, 12, 40, 20, null));                          /* ... and cut: the ramp */
const wall = G0.walls[0], sac0 = G0.sacs[0];
{ const p = { x: 150 * TS, y: 26 * TS }; fx.heroes.push(p); hands.giveTorch(p); const w = G0.walls[1]; S.wall[w.id].st = 'burning'; S.wall[w.id].t = 0.22; const sacs = G0.sacs.filter(s => s.x > 140 * TS && s.x < 210 * TS); if (sacs[0]) S.sac[sacs[0].id].t = 0.85; if (sacs[1]) S.sac[sacs[1].id].t = 0.3; fx.p = p; }
scenes.push(scene(140, 12, 40, 20, (g, cx, cy) => man(g, fx.p.x - cx + 8, fx.p.y + 16 - cy)));
scenes.push(scene(212, 12, 40, 20, null));
scenes.push(scene(280, 14, 40, 20, null));
/* ---- the props row ---- */
const cells = [];
const cell = (w, h, fn) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = '#16161e'; g.fillRect(0, 0, w, h); try { fn(g, h); } catch (e) { fail(fn.toString().slice(0, 60), e); } cells.push(c); return c; };
const label = [];
for (const f of [0, 1, 2]) cell(20, 20, g => g.drawImage(skins.skling.R[f], 4, 4));
for (const f of [3, 4, 5]) cell(20, 20, g => g.drawImage(skins.skling.R[f], 4, 4));
for (const f of [0, 1, 2, 3, 4, 5]) cell(20, 20, g => g.drawImage(skins.skspitter.R[f], 4, 4));
cell(30, 30, g => ART.drawKnot(g, 15, 15, false, 0.2)); cell(30, 30, g => ART.drawKnot(g, 15, 15, true, 0.2));
cell(24, 34, g => ART.drawCocoon(g, 12, 4)); cell(40, 20, g => ART.drawCocoonSplat(g, 20, 19));
for (const f of [0.1, 0.5, 0.7, 0.9]) cell(24, 26, g => ART.drawSac(g, 12, 24, 'whole', f, 0.1)); cell(24, 20, g => ART.drawSac(g, 12, 19, 'burst', 1, 0)); cell(24, 20, g => ART.drawSac(g, 12, 19, 'burned', 1, 0));
for (const t of [0, 0.3, 0.6]) cell(24, 36, g => ART.drawSconce(g, 12, 33, t, true)); cell(24, 36, g => ART.drawSconce(g, 12, 33, 0, false));
cell(20, 34, g => ART.drawTorch(g, 10, 14, 0.2, false)); cell(20, 34, g => ART.drawTorch(g, 10, 14, 0.05, true));
cell(64, 14, g => ART.drawGoo(g, 2, 13, 60, 0.4)); cell(28, 14, g => ART.drawGlob(g, 20, 7, 150, 0));
cell(50, 30, g => ART.drawThread(g, 8, 0, 30, false, 0)); cell(24, 30, g => ART.drawThread(g, 8, 0, 30, true, 0));
for (const n of [0.2, 0.55, 0.9]) cell(16, 48, g => { g.fillStyle = '#c2c2d2'; g.fillRect(0, 0, 16, 48); ART.drawWallBurn(g, 0, 0, 48, n, 0.3); });
/* the tile kit close-up */
const tiles = [];
{ const open = v => v === T.AIR; const mk = (o) => ART.stoneTile(o.x, o.y, o);
  for (const o of [{ x: 1, y: 1, up: true }, { x: 2, y: 1, up: true, aL: true }, { x: 3, y: 1, up: true, aR: true }, { x: 2, y: 2 }, { x: 2, y: 3, aD: true }, { x: 4, y: 2, niche: true }, { x: 5, y: 5, aL: true }]) tiles.push(mk(o));
  tiles.push(ART.strandTile(0, true, false), ART.strandTile(1, false, false), ART.strandTile(2, false, true), ART.bridgeTile(0, true, false, false), ART.bridgeTile(1, false, false, false), ART.bridgeTile(2, false, true, true), ART.tautTile(0, true, false), ART.tautTile(1, false, false), ART.tautTile(0, false, true), ART.wallTile(1, 1, true, false), ART.wallTile(1, 2, false, false), ART.wallTile(1, 3, false, true)); }
/* the foes: the lurker in every mode */
const lurk = [];
for (const m of ['hide', 'threadTell', 'drop', 'ground', 'biteTell', 'climb', 'fallen']) { const c = newCanvas(44, 44), g = c.getContext('2d'); g.fillStyle = '#16161e'; g.fillRect(0, 0, 44, 44); try { ART.drawLurker(g, 22, 34, m, 1, 0.3, m === 'biteTell' || m === 'threadTell'); } catch (e) { fail('lurker ' + m, e); } lurk.push(c); }
/* the Mother: every pose */
const mom = [];
const fakeP = { ...POSE };
for (const k of Object.keys(POSE)) { const c = newCanvas(110, 80), g = c.getContext('2d'); g.fillStyle = '#16161e'; g.fillRect(0, 0, 110, 80); g.fillStyle = '#2a2a38'; g.fillRect(0, 66, 110, 14);
  try { if (['hang', 'spitTell', 'spit', 'pounceTell', 'clutchTell', 'clutch', 'sweepTell', 'sweep', 'climb', 'wake', 'sleep'].includes(k)) CMA.drawAnchorLine(g, 55, 0, 55, 30); CMA.drawMother(g, 55, k === 'landed' || k === 'sweep' || k === 'sweepTell' || k === 'pounceTell' ? 52 : 36, POSE[k], k === 'sweep' ? 1 : -1, 0.3); } catch (e) { fail('mother ' + k, e); } mom.push(c); }
{ const c = newCanvas(110, 80), g = c.getContext('2d'); g.fillStyle = '#16161e'; g.fillRect(0, 0, 110, 80); CMA.drawMother(g, 55, 52, POSE.landed, 1, 0.3, { flash: true }); mom.push(c); }
/* ---- lay it out ---- */
const rows = [];
const strip = (items, pad, gapY = 6, maxW = 1290) => { let x = pad, y = pad, rh = 0; const pos = []; for (const c of items) { if (x + c.width + pad > maxW && x > pad) { x = pad; y += rh + pad; rh = 0; } pos.push([x, y]); x += c.width + pad; rh = Math.max(rh, c.height); } return { items, pos, w: maxW, h: y + rh + pad }; };
const big = (c, k) => { const o = newCanvas(c.width * k, c.height * k); o.getContext('2d').drawImage(c, 0, 0, c.width * k, c.height * k); return o; };
const blocks = [strip(scenes, 6), strip(cells.map(c => big(c, 3)), 4), strip(tiles.map(c => big(c, 4)), 4), strip(lurk.map(c => big(c, 3)), 4), strip(mom.map(c => big(c, 2)), 4)];
const H = blocks.reduce((a, b) => a + b.h + 8, 8), sheetC = newCanvas(1290, H), sg = sheetC.getContext('2d'); sg.fillStyle = '#3a4a6a'; sg.fillRect(0, 0, 1290, H);
let oy = 8; for (const b of blocks) { b.items.forEach((c, i) => sg.drawImage(c, b.pos[i][0], oy + b.pos[i][1])); oy += b.h + 8; }
const final = SC === 1 ? sheetC : big(sheetC, SC); savePNG(final, out);
console.log((bad ? 'FAILED ' + bad : 'ok') + ': ' + scenes.length + ' scenes, ' + cells.length + ' props, ' + tiles.length + ' tiles, ' + lurk.length + ' lurker modes, ' + mom.length + ' mother poses -> ' + out + ' (' + final.width + ' x ' + final.height + ')');
process.exitCode = bad ? 1 : 0;
if (process.env.SKCROP !== undefined) { const i = +process.env.SKCROP, c = scenes[i]; savePNG(big(c, 2), out.replace(/\.png$/, '-scene' + i + '.png')); }
