// tools/manor-art-sheet.mjs (claude/manorart; pure node, no browser): THE HOLLOW MANOR's art on a contact sheet. The REAL level is built (flag on), and windows of it are drawn with the real tile
// maker (src/redraw/manor_art.js manorTile) and the real hands' drawBack / drawOver / drawFoe (a fake world, as tools/manor.mjs): the servants' hall and its cellar stair, the moving door in both
// states, the portrait gallery with the shifting stair gone and standing, the bookcase alcove, the long gallery lit and in the blackout (candles out, a shade), the nursery wing, the sealed
// nursery shut and open, the armoury door and the exit stair gated and open, and the great hall with the Castellan in each set's move. Then the tile kit, the props, the foes, and THE CASTELLAN
// in every pose of every set (+ the ghost crossing, leaving, swapping, dying).
//   node tools/manor-art-sheet.mjs [out.png] [scale]
globalThis.__MN = true;
const { install, savePNG, newCanvas } = await import('./node-canvas.mjs'); install();
const { LEVELS, T, TS } = await import('../src/level.js');
const ART = await import('../src/redraw/manor_art.js'), FOE = await import('../src/redraw/manor_foes.js'), CA = await import('../src/redraw/castellan_art.js');
const { makeManorHands, POLT } = await import('../src/manor-hands.js');
const { makeCastellanHands, POSE } = await import('../src/castellan-hands.js');
const { CS } = await import('../src/castellan.js');
const out = process.argv[2] || 'manor-art-sheet.png', SC = +(process.argv[3] || 1);
const lv = LEVELS.find(l => l.id === 'manor'); if (!lv) { console.error('no manor level (flag?)'); process.exit(1); }
let bad = 0; const fail = (m, e) => { bad++; console.error('FAILED', m, e && e.message); };
const L = lv.build(), W = L.W, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= L.H ? T.SOLID : L.grid[y * W + x]);
const P = { x: 0, y: 0, hp: 400, ground: true, face: 1, vx: 0, vy: 0, eye: { x: 0, y: 0 } };
const fx = { L, TS, T, players: () => [P], enemies: () => fx.ens, ens: [], time: () => 0, number() {}, hint() {}, asPlayer: (p, fn) => fn(), damage: () => 'hit', cellSet: (x, y, t) => { L.grid[y * W + x] = t; }, upright: () => true, hitOnce: () => true, shake() {}, ring() {}, addFoe: e => fx.ens.push(e), hero: () => P };
const G = makeManorHands(fx); G.reset();
const put = (col, row, face = 1) => { P.x = col * TS + 8; P.y = (row + 1) * TS; P.face = face; P.eye = { x: P.x, y: P.y - 12 }; };
const bg = (g, w, h) => { g.fillStyle = '#05080a'; g.fillRect(0, 0, w, h); };
const man = (g, x, y, face = 1) => { g.fillStyle = '#5a7ab4'; g.fillRect(x - 3, y - 14, 6, 10); g.fillStyle = '#d4b090'; g.fillRect(x - 2, y - 18, 5, 4); g.fillStyle = '#3a3a4c'; g.fillRect(x - 3, y - 4, 6, 4); g.fillStyle = '#c8c8d8'; g.fillRect(x + face * 4, y - 12, 2, 8); };
const mk = (t, col, row, o = {}) => ({ x: col * TS + 8, y: (row + 1) * TS, face: -1, alive: true, t, w: 12, h: 26, hp: 70, maxHp: 70, mode: 'walk', modeT: 0, anim: 0.3, flash: 0, ...o });
function scene(c0, r0, cols, rows, mutate, o = {}) {
  const VW = cols * TS, VH = rows * TS, c = newCanvas(VW, VH), g = c.getContext('2d'), cx = c0 * TS, cy = r0 * TS, time = 1.3;
  bg(g, VW, VH);
  try { G.drawBack(g, cx, cy, VW, VH, time); } catch (e) { fail('drawBack', e); }
  const dyn = G.show() ? G.show().cells : new Map();
  for (let y = r0; y < r0 + rows; y++) for (let x = c0; x < c0 + cols; x++) { const t = at(x, y); if (t === T.AIR || dyn.has(y * W + x)) continue; let ts = null; try { ts = ART.manorTile(t, x, y, at, T, L); } catch (e) { fail('tile ' + t, e); }
    if (ts) g.drawImage(ts, (x - c0) * TS, (y - r0) * TS); else { g.fillStyle = '#ff00ff'; g.fillRect((x - c0) * TS, (y - r0) * TS, TS, TS); } }
  for (const e of L.ents) { if (e.x < c0 - 2 || e.x > c0 + cols + 2) continue; const sx = e.x * TS + 8 - cx, sy = (e.y + 1) * TS - cy;
    if (e.t === 'check') { g.fillStyle = '#d8b040'; g.fillRect(sx - 2, sy - 26, 4, 26); g.fillStyle = '#ffe9a0'; g.fillRect(sx - 2, sy - 28, 8, 4); }
    if (e.t === 'silver') { g.fillStyle = '#dfe8ff'; g.fillRect(sx - 4, sy - 14, 8, 8); g.fillStyle = '#ffffff'; g.fillRect(sx - 2, sy - 12, 4, 4); }
    if (e.t === 'coin') { g.fillStyle = '#ffd34a'; g.fillRect(sx - 3, sy - 8, 6, 6); }
    if (e.t === 'sign') { g.fillStyle = '#6a6458'; g.fillRect(sx - 1, sy - 12, 2, 12); g.fillRect(sx - 6, sy - 18, 12, 7); g.fillStyle = '#d0c8b0'; g.fillRect(sx - 4, sy - 16, 8, 1); g.fillRect(sx - 4, sy - 14, 6, 1); }
    if (e.t === 'boo') { g.fillStyle = '#e8ecf0'; g.fillRect(sx - 6, sy - 18, 12, 12); g.fillStyle = '#1a1e24'; g.fillRect(sx - 3, sy - 14, 2, 3); g.fillRect(sx + 1, sy - 14, 2, 3); }
    if (o.foes && (e.t === 'armour' || e.t === 'haunt' || e.t === 'poltergeist')) { const f = mk(e.t, e.x, e.y, { cnSkin: e.cnSkin, mode: e.t === 'haunt' ? (o.shades || 'hide') : e.t === 'poltergeist' ? (o.polt || 'drift') : (o.suit || 'walk'), item: 'CHAIR', modeT: 0.4, hx: e.x * TS });
      if (e.t === 'poltergeist') f.y = (e.y + 1) * TS - 8; try { G.drawFoe(g, f, cx, cy, time); } catch (er) { fail('foe ' + e.t, er); } } }
  if (mutate) mutate(g, cx, cy);
  try { G.drawOver(g, cx, cy, VW, VH, time); } catch (e) { fail('drawOver', e); }
  return c;
}
const scenes = [];
/* 1-2: the servants' hall (cellar stair, the first suit and its rack), the moving door shut at the floor (state A) and standing open (state B) */
put(4, 33); scenes.push(scene(0, 20, 44, 19, (g, cx, cy) => man(g, P.x - cx, P.y - cy), { foes: true }));
put(20, 29); scenes.push(scene(14, 18, 44, 14, (g, cx, cy) => man(g, P.x - cx, P.y - cy), { foes: true }));
G.swap('ps0'); put(24, 29, -1); scenes.push(scene(14, 18, 44, 14, (g, cx, cy) => man(g, P.x - cx, P.y - cy, -1), { foes: true }));
/* 3-4: the portrait gallery, the stair gone then standing */
put(78, 29, 1); scenes.push(scene(60, 12, 44, 20, (g, cx, cy) => man(g, P.x - cx, P.y - cy), { foes: true, polt: 'liftTell' }));
G.swap('ps1'); put(82, 29, -1); scenes.push(scene(80, 10, 44, 22, (g, cx, cy) => man(g, P.x - cx, P.y - cy, -1), { foes: true }));
/* 5: the bookcase alcove and its silver (the case swung) */
G.swap('ps2'); put(118, 19, 1); scenes.push(scene(108, 6, 36, 18, (g, cx, cy) => man(g, P.x - cx, P.y - cy), {}));
/* 6-7: the long gallery lit, then the blackout (the candles out, shades awake, a carried flame) */
put(144, 29, 1); scenes.push(scene(140, 14, 44, 20, (g, cx, cy) => man(g, P.x - cx, P.y - cy), { foes: true }));
G.take(P); put(150, 29); for (let i = 0; i < 160; i++) G.update(1 / 30); G.snuffCarry(P); put(170, 29);
scenes.push(scene(154, 14, 44, 20, (g, cx, cy) => man(g, P.x - cx, P.y - cy), { foes: true, shades: 'chase' }));
{ const bo = G.show(); G.take(P); for (const id of Object.keys(bo.lit)) bo.lit[id] = true; bo.flick[bo.bo.list[0]] = 0.5; G.take(P); }
scenes.push(scene(184, 14, 44, 20, (g, cx, cy) => man(g, P.x - cx, P.y - cy), { foes: true, shades: 'lungeTell' }));
/* 8-9: the nursery wing, the sealed nursery shut (a key) then open */
put(230, 29); scenes.push(scene(210, 14, 44, 20, (g, cx, cy) => man(g, P.x - cx, P.y - cy), { foes: true, polt: 'spent' }));
G.takeKey('pt0'); put(250, 21); scenes.push(scene(246, 6, 36, 18, (g, cx, cy) => man(g, P.x - cx, P.y - cy), {}));
G.takeKey('pt1'); G.takeKey('pt2'); put(258, 21); scenes.push(scene(246, 6, 36, 18, (g, cx, cy) => man(g, P.x - cx, P.y - cy), {}));
/* 10-11: the armoury door and the exit stair gated, then open (the Castellan fallen) */
put(280, 29); scenes.push(scene(268, 18, 24, 14, (g, cx, cy) => man(g, P.x - cx, P.y - cy), {}));
G.show().exitOpen = true; put(284, 29); scenes.push(scene(268, 18, 24, 14, (g, cx, cy) => man(g, P.x - cx, P.y - cy), {}));
G.show().exitOpen = false;
/* the great hall: THE CASTELLAN in each set's move */
const A = L.arena; let boss = null; const ctx = { ...fx, get L() { return L; }, get boss() { return boss; }, bossActive: true, EHP: { castellan: CS.hp } }, CH = makeCastellanHands(ctx), sp = L.ents.find(e => e.t === 'castellan');
boss = CH.spawnBoss({ x: sp.x * TS + 8, y: (sp.y + 1) * TS, vx: 0, vy: 0, face: 1, alive: true }); const CSt = CH.show();
const hall = (set, mode, bx, face, mut, o = {}) => { boss.mode = mode; boss.modeT = o.modeT === undefined ? 0.6 : o.modeT; boss.x = bx * TS; boss.y = A.floor; boss.face = face; CSt.set = set; CSt.rack = ['knight', 'halberd', 'duelist', 'greatsword'].indexOf(set); CSt.sets = o.sets || []; CSt.final = !!o.final; CSt.chopAt = bx * TS + face * 44; CSt.wisp = o.wisp || null;
  return scene(288, 17, 52, 15, (g, cx, cy) => { if (mut) mut(g, cx, cy); try { CH.drawBoss(g, boss, cx, cy, 1.3); } catch (e) { fail('boss ' + mode, e); } man(g, o.hx * TS - cx, A.floor - cy, -face); try { CH.drawOver(g, cx, cy, 52 * TS, 15 * TS, 1.3); } catch (e) { fail('CH over', e); } }); };
scenes.push(hall('knight', 'sleep', 294, 1, null, { hx: 312 }));
scenes.push(hall('knight', 'bashTell', 301, 1, null, { hx: 312 }));
scenes.push(hall('halberd', 'chopTell', 313, 1, null, { hx: 322, sets: ['knight'] }));
scenes.push(hall('duelist', 'flurry', 322, -1, null, { hx: 313, sets: ['knight', 'halberd'] }));
scenes.push(hall('greatsword', 'whirl', 322, -1, null, { hx: 312, sets: ['knight', 'halberd', 'duelist'] }));
scenes.push(hall('greatsword', 'dizzy', 326, -1, null, { hx: 316, sets: ['knight', 'halberd', 'duelist'], modeT: 2 }));
scenes.push(hall('halberd', 'stuck', 310, 1, null, { hx: 321, sets: ['knight'], modeT: 2 }));
scenes.push(hall('duelist', 'swap', 312, 1, null, { hx: 330, sets: ['knight', 'halberd'], final: true, modeT: 0.3 }));
scenes.push(hall('greatsword', 'wisp', 320, 1, null, { hx: 305, sets: ['knight', 'halberd', 'duelist', 'greatsword'], final: true, wisp: { x0: 300 * TS, x1: 334 * TS, t: 0.5 } }));

/* ---- the props row ---- */
const cells = [];
const cell = (w, h, fn) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = '#10181a'; g.fillRect(0, 0, w, h); try { fn(g, h); } catch (e) { fail(fn.toString().slice(0, 60), e); } cells.push(c); return c; };
for (let i = 0; i < 3; i++) cell(34, 44, g => ART.drawPortrait(g, 17, 20, false, 1.1, i)); cell(34, 44, g => ART.drawPortrait(g, 17, 20, true, 1.1, 0));
cell(30, 40, g => ART.drawSconce(g, 15, 36, true, false, 0.3)); cell(30, 40, g => ART.drawSconce(g, 15, 36, true, true, 0.31)); cell(30, 40, g => ART.drawSconce(g, 15, 36, false, false, 0.3));
cell(34, 50, g => ART.drawStand(g, 17, 46, 0.3)); cell(34, 46, g => ART.drawCarried(g, 12, 40, 1, 'lit', 0.3)); cell(34, 46, g => ART.drawCarried(g, 12, 40, 1, 'out', 0.3));
cell(34, 44, g => ART.drawRack(g, 17, 40, 0.3)); cell(40, 24, g => ART.drawPile(g, 20, 22, 0.3)); cell(30, 24, g => ART.drawPedestal(g, 15, 22, 0.3));
for (const k of [0, 2, 3]) cell(30, 96, g => ART.drawNurseryDoor(g, 6, 6, 5, k, 3, false, 1)); cell(30, 96, g => ART.drawNurseryDoor(g, 6, 6, 5, 3, 3, true, 1));
cell(30, 16, g => ART.drawEye(g, 15, 8, true, 0.3)); cell(30, 16, g => ART.drawEye(g, 15, 8, false, 0.3)); cell(40, 30, g => ART.drawWisp(g, 24, 15, 1, 0.3)); cell(34, 48, g => ART.drawDoorway(g, [[0, 0], [0, 1], [0, 2]].map(([a, b]) => [a + 1, b]), -8, 0));
for (const it of ['CHAIR', 'PLATE', 'CANDLESTICK', 'BOOK']) for (const t of [0, 0.1]) cell(16, 16, g => ART.drawThrown(g, 8, 8, it, t));
cell(100, 80, g => ART.drawExit(g, 50, 76, false, 0.3)); cell(100, 80, g => ART.drawExit(g, 50, 76, true, 0.3));
/* the tile kit close-up */
const tiles = [];
for (const z of ['servant', 'gallery', 'long', 'nursery', 'door', 'hall']) { tiles.push(ART.stoneTile(z, 1, 1, { up: true, aL: true }), ART.stoneTile(z, 2, 1, { up: true }), ART.stoneTile(z, 3, 1, { up: true, aR: true }), ART.stoneTile(z, 2, 2, {}), ART.stoneTile(z, 2, 3, { dn: true }), ART.galleryTile(z, 2, true, false), ART.galleryTile(z, 3, false, true), ART.wallTile(z, 2, 'paper'), ART.wallTile(z, 3, 'paper'), ART.wallTile(z, 2, 'rail'), ART.wallTile(z, 2, 'wain')); }
for (let i = 0; i < 3; i++) tiles.push(ART.panelTile('door', i, 3, 'servant', {})); for (let i = 0; i < 4; i++) tiles.push(ART.panelTile('bookcase', i, 4, 'gallery', {})); tiles.push(ART.panelTile('stair', 0, 1, 'gallery', { up: true, aL: true }), ART.panelTile('stair', 0, 1, 'gallery', { up: true }));
/* the foes */
const foes = [];
const fcell = (w, h, fn) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = '#10181a'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a3230'; g.fillRect(0, h - 8, w, 8); try { fn(g, h); } catch (e) { fail('foe', e); } foes.push(c); };
for (const [mode, mt, was] of [['walk', 0], ['rise', 0.2], ['rise', 0.65], ['thrustTell', 0.5], ['recover', 0.3, 'thrust'], ['cleaveTell', 0.5], ['recover', 0.3, 'cleave'], ['stuck', 1]]) fcell(60, 56, (g, h) => FOE.drawSuitFoe(g, { mode, modeT: mt, face: 1, anim: 0.3, mnWas: was, flash: 0 }, 30, h - 8, 1.1, 1.0));
fcell(60, 56, (g, h) => FOE.drawSuitFoe(g, { mode: 'walk', modeT: 0, face: 1, anim: 0.3, flash: 0.1 }, 30, h - 8, 1.1, 1.0));
for (const mode of ['hide', 'chase', 'lungeTell', 'lunge', 'back']) fcell(70, 44, g => FOE.drawShade(g, { mode, face: 1, hx: 0 }, 34, 26, mode === 'hide' ? 0.05 : 0.4, 0.8));
for (const [mode, item] of [['drift'], ['liftTell', 'CHAIR'], ['liftTell', 'PLATE'], ['liftTell', 'CANDLESTICK'], ['liftTell', 'BOOK'], ['spent']]) fcell(60, 50, g => FOE.drawPoltergeist(g, { mode, modeT: 0.4, item, face: 1 }, 30, 28, 1.1, POLT.lift));
/* THE CASTELLAN, every pose of every set */
const cas = [];
const ccell = (fn) => { const c = newCanvas(100, 84), g = c.getContext('2d'); g.fillStyle = '#10181a'; g.fillRect(0, 0, 100, 84); g.fillStyle = '#2a3230'; g.fillRect(0, 70, 100, 14); try { fn(g); } catch (e) { fail('castellan', e); } cas.push(c); };
const OPENING = { knight: 'stumble', halberd: 'stuck', duelist: 'winded', greatsword: 'dizzy' }, MOVES = { knight: ['thrust', 'bash'], halberd: ['sweep', 'chop'], duelist: ['feint', 'lunge', 'flurry'], greatsword: ['breaker', 'whirl'] };
for (const set of ['knight', 'halberd', 'duelist', 'greatsword']) {
  for (const m of ['walk', 'recover']) ccell(g => CA.drawCastellan(g, 50, 70, m, POSE[m], 1, 0.4, { set }));
  for (const m of MOVES[set]) for (const ph of ['Tell', '']) if (POSE[m + ph]) ccell(g => CA.drawCastellan(g, 50, 70, m + ph, POSE[m + ph], 1, 0.4, { set }));
  ccell(g => CA.drawCastellan(g, 50, 70, OPENING[set], POSE[OPENING[set]], 1, 0.4, { set, open: true })); ccell(g => CA.drawCastellan(g, 50, 70, 'leave', POSE.leave, 1, 0.4, { set })); ccell(g => CA.drawCastellan(g, 50, 70, 'walk', POSE.walk, 1, 0.4, { set, flash: true }));
}
for (const m of ['sleep', 'wake', 'knocked', 'swap']) ccell(g => CA.drawCastellan(g, 50, 70, m, POSE[m], 1, 0.4, { set: 'knight', open: m === 'knocked' }));
ccell(g => CA.drawCastellan(g, 50, 52, 'wisp', POSE.wisp, 1, 0.4, { set: 'knight' })); ccell(g => CA.drawCastellan(g, 50, 52, 'wisp', POSE.wisp, -1, 0.9, { set: 'knight' }));
for (const t of [0.2, 1, 2.2, 3.6]) ccell(g => CA.drawCastellan(g, 50, 70, 'dead', {}, 1, 0.4, { set: 'knight', t }));
/* ---- lay it out ---- */
const strip = (items, pad, maxW = 1440) => { let x = pad, y = pad, rh = 0; const pos = []; for (const c of items) { if (x + c.width + pad > maxW && x > pad) { x = pad; y += rh + pad; rh = 0; } pos.push([x, y]); x += c.width + pad; rh = Math.max(rh, c.height); } return { items, pos, w: maxW, h: y + rh + pad }; };
const big = (c, k) => { const o = newCanvas(c.width * k, c.height * k); o.getContext('2d').drawImage(c, 0, 0, c.width * k, c.height * k); return o; };
const blocks = [strip(scenes, 6, 1440), strip(cells.map(c => big(c, 3)), 4), strip(tiles.map(c => big(c, 3)), 3), strip(foes.map(c => big(c, 3)), 4), strip(cas.map(c => big(c, 2)), 4)];
const H = blocks.reduce((a, b) => a + b.h + 8, 8), sheetC = newCanvas(1440, H), sg = sheetC.getContext('2d'); sg.fillStyle = '#3a4a52'; sg.fillRect(0, 0, 1440, H);
let oy = 8; for (const b of blocks) { b.items.forEach((c, i) => sg.drawImage(c, b.pos[i][0], oy + b.pos[i][1])); oy += b.h + 8; }
const final = SC === 1 ? sheetC : big(sheetC, SC); savePNG(final, out);
console.log((bad ? 'FAILED ' + bad : 'ok') + ': ' + scenes.length + ' scenes, ' + cells.length + ' props, ' + tiles.length + ' tiles, ' + foes.length + ' foe frames, ' + cas.length + ' Castellan poses -> ' + out + ' (' + final.width + ' x ' + final.height + ')');
process.exitCode = bad ? 1 : 0;
if (process.env.MNCROP !== undefined) { const i = +process.env.MNCROP; savePNG(big((process.env.MNBLOCK ? [null, cells, tiles, foes, cas][+process.env.MNBLOCK] : scenes)[i] || scenes[0], +(process.env.MNSCALE || 1)), out.replace(/\.png$/, '-crop' + i + '.png')); }
if (process.env.MNONLY !== undefined) { const b = blocks[+process.env.MNONLY], c = newCanvas(1440, b.h), g = c.getContext('2d'); g.fillStyle = '#3a4a52'; g.fillRect(0, 0, 1440, b.h); b.items.forEach((it, i) => g.drawImage(it, b.pos[i][0], b.pos[i][1])); savePNG(c, out.replace(/\.png$/, '-block' + process.env.MNONLY + '.png')); }
