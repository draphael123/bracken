// tools/wisp-art-sheet.mjs (claude/wispart; pure node, no browser): WISPWOOD's art on a contact sheet. The REAL level is built (flag on) and windows of it are drawn with the real tile maker
// (src/redraw/wispwood_art.js wispTile) and the real hands' drawBack / drawOver / drawThief (a fake world, as tools/wispwood.mjs): the barrow mouth and the first pale branch (lit, then in the
// glint), the candle and the pool with a hand told and rising, the oaks and the first bridge, the oaks with the lantern stolen (every span a glint), the root walk in the dark, the candle bridge
// with a thief told and then fleeing with the flame (its tether), the drowned glade and its grotto, THE WIDOW'S GLADE with her in the light and in the stolen dark, and the root-hole exit webbed
// shut then open. Then the props, the tile kit, the thief in every mode, and THE LANTERN WIDOW in every pose (+ hurt, the opening, the death) and every attack she throws.
//   node tools/wisp-art-sheet.mjs [out.png] [scale]
globalThis.__WW = true;
const { install, savePNG, newCanvas } = await import('./node-canvas.mjs'); install();
const { LEVELS, T, TS } = await import('../src/level.js');
const ART = await import('../src/redraw/wispwood_art.js'), LWA = await import('../src/redraw/lantern_widow_art.js');
const { makeWispwoodHands, LIGHT, HAND } = await import('../src/wispwood-hands.js');
const { POSE } = await import('../src/lantern-widow-hands.js'); const WDM = await import('../src/lantern-widow.js'); const { WD } = WDM;
const out = process.argv[2] || 'wisp-art-sheet.png', SC = +(process.argv[3] || 1);
const lv = LEVELS.find(l => l.id === 'wispwood'); if (!lv) { console.error('no wispwood level (flag?)'); process.exit(1); }
let bad = 0; const fail = (m, e) => { bad++; console.error('FAILED', m, e && e.message); };
const L = lv.build(), W = L.W, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= L.H ? T.SOLID : L.grid[y * W + x]);
const P = { x: 0, y: 0, hp: 400, ground: true, face: 1, vx: 0, vy: 0 };
const fx = { L, TS, T, players: () => [P], enemies: () => fx.ens, ens: [], time: () => 0, number() {}, hint() {}, asPlayer: (p, fn) => fn(), damage: () => 'hit', cellSet: (x, y, t) => { L.grid[y * W + x] = t; }, upright: () => true, hitOnce: () => true, shake() {}, ring() {}, extraLights: () => [], exitOpen: () => fx.open };
const G = makeWispwoodHands(fx); G.reset();
const put = (col, row, face = 1) => { P.x = col * TS + 8; P.y = (row + 1) * TS; P.face = face; };
const man = (g, x, y, face = 1) => { g.fillStyle = '#5a7ab4'; g.fillRect(x - 3, y - 14, 6, 10); g.fillStyle = '#d4b090'; g.fillRect(x - 2, y - 18, 5, 4); g.fillStyle = '#3a3a4c'; g.fillRect(x - 3, y - 4, 6, 4); g.fillStyle = '#c8c8d8'; g.fillRect(x + face * 4, y - 12, 2, 8); };
const mkThief = (col, row, o = {}) => ({ x: col * TS + 8, y: (row + 1) * TS, face: -1, alive: true, t: 'wwthief', mode: 'drift', modeT: 0.3, flame: null, flash: 0, ...o });
const skyFor = (g, w, h) => { for (let r = 0; r < h; r += 4) { const k = r / h; g.fillStyle = 'rgb(' + Math.round(10 + 30 * k) + ',' + Math.round(14 + 38 * k) + ',' + Math.round(26 + 44 * k) + ')'; g.fillRect(0, r, w, 4); } };
function scene(c0, r0, cols, rows, mutate, o = {}) {
  const VW = cols * TS, VH = rows * TS, c = newCanvas(VW, VH), g = c.getContext('2d'), cx = c0 * TS, cy = r0 * TS, time = 1.3;
  skyFor(g, VW, VH);
  try { G.drawBack(g, cx, cy, VW, VH, time); } catch (e) { fail('drawBack', e); }
  for (let y = r0; y < r0 + rows; y++) for (let x = c0; x < c0 + cols; x++) { const t = at(x, y); if (t === T.AIR) continue; let ts = null; try { ts = ART.wispTile(t, x, y, at, T, L); } catch (e) { fail('tile ' + t, e); }
    if (ts) g.drawImage(ts, (x - c0) * TS, (y - r0) * TS); else if (t === T.SOLID || t === T.ONEWAY) { g.fillStyle = '#ff00ff'; g.fillRect((x - c0) * TS, (y - r0) * TS, TS, TS); } }
  for (const e of L.ents) { if (e.x < c0 - 2 || e.x > c0 + cols + 2) continue; const sx = e.x * TS + 8 - cx, sy = (e.y + 1) * TS - cy;
    if (e.t === 'check') { g.fillStyle = '#d8b040'; g.fillRect(sx - 2, sy - 26, 4, 26); g.fillStyle = '#ffe9a0'; g.fillRect(sx - 2, sy - 28, 8, 4); }
    if (e.t === 'silver') { g.fillStyle = '#dfe8ff'; g.fillRect(sx - 4, sy - 14, 8, 8); g.fillStyle = '#ffffff'; g.fillRect(sx - 2, sy - 12, 4, 4); }
    if (e.t === 'coin') { g.fillStyle = '#ffd34a'; g.fillRect(sx - 3, sy - 8, 6, 6); }
    if (e.t === 'sign') { g.fillStyle = '#6a6458'; g.fillRect(sx - 1, sy - 12, 2, 12); g.fillRect(sx - 6, sy - 18, 12, 7); g.fillStyle = '#d0c8b0'; g.fillRect(sx - 4, sy - 16, 8, 1); g.fillRect(sx - 4, sy - 14, 6, 1); }
    if (o.foes && e.t === 'wwthief') { try { ART.drawThief(g, mkThief(e.x, e.y), sx, sy - 8, time); } catch (er) { fail('thief', er); } } }
  if (mutate) mutate(g, cx, cy);
  try { G.drawOver(g, cx, cy, VW, VH, time); } catch (e) { fail('drawOver', e); }
  return c;
}
const scenes = [];
const light = () => { for (let i = 0; i < 4; i++) G.update(1 / 30); };
/* 1-2: the barrow mouth, the first pale branch (lit, then with the flame gone: the glint) */
put(14, 31); light(); scenes.push(scene(0, 22, 46, 15, (g, cx, cy) => man(g, P.x - cx, P.y - cy)));
G.steal(P, 'x'); light(); put(14, 31); scenes.push(scene(0, 22, 46, 15, (g, cx, cy) => man(g, P.x - cx, P.y - cy))); G.giveBack(P); light();
/* 3-4: the candle lit and the first pool, a hand told then another rising */
put(24, 29); G.light('cd0'); G.update(1 / 30); light();
{ const sh = G.show(); sh.hands.push({ p: P, x: 31 * TS + 8, x0: 31 * TS + 8, tx: P.x, y: 30 * TS, st: 'tell', t: 0.35 }); sh.hands.push({ p: P, x: 38 * TS + 8, x0: 38 * TS + 8, tx: 36 * TS, y: 30 * TS, st: 'lunge', t: 0.3 }); sh.hands.push({ p: P, x: 34 * TS, x0: 34 * TS, tx: 34 * TS, y: 30 * TS, st: 'sink', t: 0.15 }); }
scenes.push(scene(16, 20, 46, 13, (g, cx, cy) => man(g, P.x - cx, P.y - cy), { foes: true })); G.show().hands = [];
/* 5-6: the hollow oaks, the first bridge over the mere (lit around the hero on oak one), then the same with the flame gone */
put(57, 13); G.light('lp0'); light(); scenes.push(scene(48, 4, 46, 22, (g, cx, cy) => man(g, P.x - cx, P.y - cy), { foes: true }));
G.steal(P, 'x'); light(); scenes.push(scene(48, 4, 46, 22, (g, cx, cy) => man(g, P.x - cx, P.y - cy), { foes: true })); G.giveBack(P); light();
/* 7: the root walk, in the dark, the lantern drowned, a hand told */
put(66, 29); G.drown(P); light();
{ const sh = G.show(); sh.hands.push({ p: P, x: 62 * TS + 8, x0: 62 * TS + 8, tx: P.x, y: 30 * TS, st: 'tell', t: 0.5 }); }
scenes.push(scene(56, 24, 40, 20, (g, cx, cy) => man(g, P.x - cx, P.y - cy))); G.show().hands = []; G.giveBack(P, 'relit'); light();
/* 8-9: the candle bridge with a thief told (a ! over it) and the thief fleeing with the flame, its tether to the hero's dark lantern */
put(140, 23); G.light('cd3'); light();
scenes.push(scene(128, 14, 40, 15, (g, cx, cy) => { man(g, P.x - cx, P.y - cy); const th = mkThief(148, 19, { mode: 'swoopTell', face: -1 }); ART.drawThief(g, th, th.x - cx, th.y - cy, 1.3); const t2 = mkThief(135, 20, { mode: 'swoop', face: 1 }); ART.drawThief(g, t2, t2.x - cx, t2.y - cy, 1.3); }));
G.steal(P, 'x'); light();
{ const th = mkThief(155, 17, { mode: 'flee', face: 1, flame: P }); fx.ens.push(th); scenes.push(scene(128, 14, 40, 15, (g, cx, cy) => { man(g, P.x - cx, P.y - cy); ART.drawThief(g, th, th.x - cx, th.y - cy, 1.3); })); fx.ens.length = 0; } G.giveBack(P); light();
/* 10: the drowned glade and the grotto */
put(222, 21); G.light('lp5'); light(); scenes.push(scene(200, 14, 46, 27, (g, cx, cy) => man(g, P.x - cx, P.y - cy), { foes: true }));
/* 11-14: the widow's gate and glade: lit, then stolen (dark), the exit shut, the exit open */
const A = L.arena, FL = A.floor;
const widowScene = (mode, wx, wy, o2 = {}) => { put(278, FL - 1); if (o2.stolen) { G.steal(P, 'widow'); } else G.giveBack(P); light();
  return scene(274, 10, 56, 28, (g, cx, cy) => { man(g, P.x - cx, P.y - cy); const e = { x: wx * TS, y: wy * TS }; LWA.drawWidow(g, e.x - cx, e.y - cy, mode, POSE[mode], o2.face || -1, 1.3, { stolen: !!o2.stolen }); if (o2.extra) o2.extra(g, cx, cy); }); };
scenes.push(widowScene('drift', 300, 29)); scenes.push(widowScene('perch', 309, 26, { stolen: true }));
scenes.push(widowScene('marchTell', 300, 29, { extra: (g, cx, cy) => { LWA.drawMarchGate(g, 328 * TS - cx, FL * TS - cy, 1.3); } }));
scenes.push(widowScene('wail', 296, 29, { extra: (g, cx, cy) => { LWA.drawWailRing(g, 296 * TS - cx, 29 * TS - cy, 70, 0.5, 1.3); LWA.drawHandSpot(g, 288 * TS - cx, FL * TS - cy, 1.4, 1.3); LWA.drawHandSpot(g, 310 * TS - cx, FL * TS - cy, 0.08, 1.3); LWA.drawMourners(g, 318 * TS - cx, FL * TS - cy, -1, WD.march.h, 1.3); LWA.drawFalseLight(g, 304 * TS - cx, 25 * TS - cy, 1.3, 0); LWA.drawFalseLight(g, 292 * TS - cx, 27 * TS - cy, 1.3, 1); } }));
fx.open = false; scenes.push(scene(286, 26, 28, 14, (g, cx, cy) => {})); fx.open = true; scenes.push(scene(286, 26, 28, 14, (g, cx, cy) => {})); fx.open = false;
G.giveBack(P);

/* ---- the props row ---- */
const cells = [];
const cell = (w, h, fn) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = '#10161e'; g.fillRect(0, 0, w, h); try { fn(g, h); } catch (e) { fail(String(fn).slice(0, 70), e); } cells.push(c); return c; };
for (const st of ['cold', 'lit', 'gutter']) cell(30, 36, g => ART.drawCandle(g, 15, 32, st, 0.3 + (st === 'gutter' ? 0.06 : 0)));
for (const on of [false, true]) cell(36, 52, g => ART.drawLamp(g, 12, 48, on, 0.3));
cell(36, 40, g => ART.drawStone(g, 18, 36, 0.3));
for (const st of ['lit', 'out', 'stolen']) cell(24, 24, g => ART.drawHeroLantern(g, 12, 10, 1, st, 0.3));
cell(40, 24, g => ART.drawWisp(g, 20, 12, 0.3)); cell(60, 14, g => ART.drawPool(g, 4, 56, 10, 0.5, 2));
for (const k of [0.1, 0.6, 1]) cell(40, 24, g => ART.drawHandTell(g, 20, 18, 34, k, 0.05));
for (const [up, dir] of [[0.3, 0], [1, 0], [1, 1], [0.4, 1]]) cell(30, 42, g => ART.drawHand(g, 15, 38, up, dir, 0.3));
cell(100, 64, g => ART.drawExitHole(g, 50, 24, false, 0.3)); cell(100, 64, g => ART.drawExitHole(g, 50, 24, true, 0.3));
cell(60, 22, g => ART.drawTether(g, 6, 16, 52, 4));
for (const w of [0, 1, 2]) cell(36, 30, g => ART.drawSpectral(g, { real: true, kind: ['bridge', 'branch', 'rung'][w], i: 1, n: 3, x: 5 + w, y: 5 }, 10, 8, 0.4));
cell(60, 24, g => { for (let i = 0; i < 3; i++) ART.drawSpectral(g, { real: true, kind: 'bridge', i, n: 3, x: 5 + i, y: 5 }, 6 + i * 16, 6, 0.4); });
cell(60, 24, g => { for (let i = 0; i < 3; i++) ART.drawSpectral(g, { real: false, kind: 'bridge', i, n: 3, x: 5 + i, y: 5 }, 6 + i * 16, 6, 0.4); });
const tiles = [];
{ const f = (o, x = 3, y = 3) => ART.groundTile(x, y, o); tiles.push(f({ up: true, aL: true }), f({ up: true }, 4), f({ up: true }, 5), f({ up: true, aR: true }), f({}), f({ deep: true }), f({ dn: true }), f({ up: true, wet: true }), f({ wet: true, aL: true }));
  for (const o of [{ up: true }, { up: true, aR: true }, {}]) tiles.push(ART.barrowTile(2, 24, o));
  for (const o of [{ up: true, aL: true }, { aL: true }, { aR: true }, { dn: true, aL: true, aR: true }, { up: true, aL: true, aR: true, dn: true }, { aL: true, aR: true, deep: true }]) tiles.push(ART.trunkTile(56, 20, o));
  for (const [a, b] of [[true, false], [false, false], [false, true], [true, true]]) tiles.push(ART.boughTile(60, 14, a, b));
  for (const [a, b] of [[true, false], [false, false], [false, true]]) tiles.push(ART.rootTile(60, 30, a, b));
  for (const k of ['bridge', 'branch', 'rung']) for (const [a, b] of [[true, false], [false, false], [false, true]]) tiles.push(ART.spectralSprite(k, a, b, 1)); for (const [a, b] of [[true, false], [false, false], [false, true]]) tiles.push(ART.glintSprite(a, b, 1)); }
const foes = [];
const fcell = (w, h, fn) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = '#10161e'; g.fillRect(0, 0, w, h); try { fn(g, h); } catch (e) { fail('foe', e); } foes.push(c); };
for (const [mode, o] of [['drift', {}], ['swoopTell', {}], ['swoop', {}], ['flee', { flame: {} }], ['scorched', {}], ['drift', { flash: 0.1 }], ['drift', { flame: {} }]]) fcell(56, 48, g => ART.drawThief(g, { mode, face: 1, x: 40, ...o }, 28, 24, 1.1));
/* THE LANTERN WIDOW */
const widow = [];
const wcell = (fn, w = 150, h = 104) => { const c = newCanvas(w, h), g = c.getContext('2d'); skyFor(g, w, h); g.fillStyle = '#242a34'; g.fillRect(0, h - 12, w, 12); try { fn(g, w, h); } catch (e) { fail('widow', e); } widow.push(c); };
for (const m of Object.keys(POSE)) { wcell((g, w, h) => LWA.drawWidow(g, 62, h - 14, m, POSE[m], 1, 0.9, { stolen: false })); }
for (const m of ['perch', 'glide', 'drift', 'wail', 'theftTell']) wcell((g, w, h) => LWA.drawWidow(g, 62, h - 14, m, POSE[m], 1, 0.9, { stolen: true }));
wcell((g, w, h) => LWA.drawWidow(g, 62, h - 14, 'drift', POSE.drift, 1, 0.9, { flash: true })); wcell((g, w, h) => LWA.drawWidow(g, 90, h - 14, 'veil', POSE.veil, -1, 1.2, {}));
for (const t of [0.2, 0.9, 1.6, 2.4, 3.2, 4.0]) wcell((g, w, h) => { LWA.drawWidow(g, 62, h - 14 + Math.min(t, 0.9) * 14, 'dead', POSE.reel, 1, 0.9, { t }); LWA.drawDeathLantern(g, 62, h - 8, 74, h - 30, t, 0.9); });
wcell((g, w, h) => { LWA.drawGreatLantern(g, 30, 40, 0.3, {}); LWA.drawGreatLantern(g, 70, 40, 0.3, { stolen: true }); LWA.drawGreatLantern(g, 110, 40, 0.3, { dim: true }); });
wcell((g, w, h) => { LWA.drawWailRing(g, 75, 60, 20, 0.2, 0.3); LWA.drawWailRing(g, 75, 60, 55, 0.7, 0.3); }); wcell((g, w, h) => { LWA.drawHandSpot(g, 30, 90, 1.5, 0.3); LWA.drawHandSpot(g, 70, 90, 0.5, 0.3); LWA.drawHandSpot(g, 110, 90, 0.05, 0.3); });
wcell((g, w, h) => LWA.drawMourners(g, 100, h - 12, 1, WD.march.h, 0.5)); wcell((g, w, h) => LWA.drawMarchGate(g, 75, h - 12, 0.3)); wcell((g, w, h) => { LWA.drawFalseLight(g, 40, 40, 0.3, 0); LWA.drawFalseLight(g, 100, 60, 0.6, 1); });
/* ---- lay it out ---- */
const strip = (items, pad, maxW = 1440) => { let x = pad, y = pad, rh = 0; const pos = []; for (const c of items) { if (x + c.width + pad > maxW && x > pad) { x = pad; y += rh + pad; rh = 0; } pos.push([x, y]); x += c.width + pad; rh = Math.max(rh, c.height); } return { items, pos, w: maxW, h: y + rh + pad }; };
const big = (c, k) => { const o = newCanvas(c.width * k, c.height * k); o.getContext('2d').drawImage(c, 0, 0, c.width * k, c.height * k); return o; };
const blocks = [strip(scenes, 6, 1440), strip(cells.map(c => big(c, 3)), 4), strip(tiles.map(c => big(c, 3)), 3), strip(foes.map(c => big(c, 3)), 4), strip(widow.map(c => big(c, 2)), 4)];
const H = blocks.reduce((a, b) => a + b.h + 8, 8), sheetC = newCanvas(1440, H), sg = sheetC.getContext('2d'); sg.fillStyle = '#3a4650'; sg.fillRect(0, 0, 1440, H);
let oy = 8; for (const b of blocks) { b.items.forEach((c, i) => sg.drawImage(c, b.pos[i][0], oy + b.pos[i][1])); oy += b.h + 8; }
const final = SC === 1 ? sheetC : big(sheetC, SC); savePNG(final, out);
console.log((bad ? 'FAILED ' + bad : 'ok') + ': ' + scenes.length + ' scenes, ' + cells.length + ' props, ' + tiles.length + ' tiles, ' + foes.length + ' thief frames, ' + widow.length + ' Widow frames -> ' + out + ' (' + final.width + ' x ' + final.height + ')');
process.exitCode = bad ? 1 : 0;
if (process.env.WACROP !== undefined) { const i = +process.env.WACROP; const src = [scenes, cells, tiles, foes, widow][+(process.env.WABLOCK || 0)]; savePNG(big(src[i] || src[0], +(process.env.WASCALE || 1)), out.replace(/\.png$/, '-crop' + i + '.png')); }
if (process.env.WAONLY !== undefined) { const b = blocks[+process.env.WAONLY], c = newCanvas(1440, b.h), g = c.getContext('2d'); g.fillStyle = '#3a4650'; g.fillRect(0, 0, 1440, b.h); b.items.forEach((it, i) => g.drawImage(it, b.pos[i][0], b.pos[i][1])); savePNG(c, out.replace(/\.png$/, '-block' + process.env.WAONLY + '.png')); }
