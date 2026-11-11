// tools/manor-art-draw.mjs (claude/manorart; node only, no browser): THE HOLLOW MANOR's art draws. Every SOLID / ONEWAY cell of the built level gets a tile (no magenta fallback), the six sections
// wear their own ground, the shifting panels (door leaf, stair, bookcase) their own tiles, a non-manor level takes none; every prop draws in every state (portraits with and without their key,
// wall candles lit / flickering / out, the candelabra and a carried one, racks, heaps, the nursery door with 0-3 keys and ajar, the eye watching / shut, the open doorway, wisps, the four thrown
// things, the silver's cushion, the exit gated and open); the backdrop and its windows (the landmark tower) draw in every section; THE POSSESSED SUIT, THE SHADE and THE POLTERGEIST draw in
// every mode; THE CASTELLAN draws every POSE mode for all four armour sets (the sets are different silhouettes, every move's windup differs from its release), the ghost crossing, hurt
// (flash), the openings, and his death; and the hands' drawBack / drawOver / drawFoe / drawBoss run in a fake world.
//   node tools/manor-art-draw.mjs
globalThis.__MN = true;
import { readFileSync } from 'node:fs';
const { install, newCanvas } = await import('./node-canvas.mjs'); install();
const { LEVELS, T } = await import('../src/level.js');
const ART = await import('../src/redraw/manor_art.js'), FOE = await import('../src/redraw/manor_foes.js'), CA = await import('../src/redraw/castellan_art.js');
const { makeManorHands, POLT, WISP, SUIT } = await import('../src/manor-hands.js');
const { makeCastellanHands, POSE } = await import('../src/castellan-hands.js');
const CSM = await import('../src/castellan.js'); const { CS } = CSM;
const TS = 16;
let bad = 0; const ok = (c, m) => { if (!c) bad++; console.log((c ? 'ok   ' : 'FAIL ') + m); };
const lit = c => { const d = c._d; let k = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) k++; return k; };
const sig = c => Buffer.from(c._d).toString('base64');
const L = LEVELS.find(l => l.id === 'manor').build(), W = L.W, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= L.H ? T.SOLID : L.grid[y * W + x]);
const draw = (w, h, fn) => { const c = newCanvas(w, h), g = c.getContext('2d'); fn(g); return c; };

/* ---- the tiles ---- */
let n = 0, miss = 0, panelCells = 0; const seen = new Set(), byZone = {};
for (let y = 0; y < L.H; y++) for (let x = 0; x < W; x++) { const t = at(x, y); if (t !== T.SOLID && t !== T.ONEWAY) continue; n++;
  const c = ART.manorTile(t, x, y, at, T, L); if (!c) { miss++; continue; } seen.add(c); const z = ART.zoneOf(x, L); byZone[z] = (byZone[z] || 0) + 1; }
ok(n > 6000 && !miss, 'every solid / one-way cell of the level has a tile: ' + n + ' cells, ' + miss + ' missing, ' + seen.size + ' distinct tiles baked');
ok(['servant', 'gallery', 'long', 'nursery', 'door', 'hall'].every(z => byZone[z] > 80), 'all six sections wear their own ground: ' + JSON.stringify(byZone));
{ const f = (z, x, y) => ART.stoneTile(z, x, y, { up: true, aL: false, aR: false }), zs = ['servant', 'gallery', 'long', 'nursery', 'door', 'hall'], sigs = new Set(zs.map(z => sig(f(z, 3, 3))));
  ok(sigs.size === 6 && zs.every(z => lit(f(z, 3, 3)) === 256), 'six sections, six different floors (opaque 16x16)'); }
{ const up = ART.stoneTile('gallery', 3, 3, { up: true }), mid = ART.stoneTile('gallery', 3, 3, {}), dn = ART.stoneTile('gallery', 3, 3, { dn: true }); ok(new Set([sig(up), sig(mid), sig(dn)]).size === 3, 'a floor has its lip, a ceiling its cove and frieze, the interior is plain stone'); }
for (const p of L.mn.panels) for (const [x, y] of p.a.concat(p.b)) { panelCells++; const pn = ART.panelOf(L, x, y); if (!pn || pn.p !== p) { ok(false, 'panel cell ' + x + ',' + y + ' not found'); break; } }
{ const kinds = new Set(L.mn.panels.map(p => p.kind)), sigs = {};
  for (const p of L.mn.panels) { const cells = p.a.concat(p.b), [x, y] = cells[0]; sigs[p.kind] = sig(ART.manorTile(T.SOLID, x, y, (a, b) => T.SOLID, T, L)); }
  ok(['door', 'stair', 'bookcase'].every(k => kinds.has(k)) && new Set(Object.values(sigs)).size === kinds.size, 'the shifting panels have their own tiles (' + [...kinds].join(', ') + ': ' + panelCells + ' cells), none the same as another'); }
{ const door = L.mn.panels.find(p => p.kind === 'door'), [x, y] = door.a[0]; const wall = ART.stoneTile(ART.zoneOf(x, L), x, y, { aL: true, aR: true }), leaf = ART.manorTile(T.SOLID, x, y, at, T, L); ok(sig(wall) !== sig(leaf), 'a moving door is a gilt-moulded painted leaf, not plain stone: the wall that moves reads'); }
ok(ART.manorTile(T.SOLID, 5, 5, at, T, { ...L, manor: false }) === null && ART.manorTile(T.SOLID, 5, 5, at, T, {}) === null, 'not a manor level: no tile');
ok(ART.manorTile(T.SPIKE, 5, 5, at, T, L) === null && ART.manorTile(T.AIR, 5, 5, at, T, L) === null, 'only solids and one-ways are kitted');
{ const row = ART.galleryTile('gallery', 3, true, true), mid = ART.galleryTile('gallery', 4, false, false); ok(lit(row) > 80 && sig(row) !== sig(mid), 'the one-way galleries are corbelled slabs (an end has its corbel)'); }
for (const b of ['paper', 'rail', 'wain']) for (const z of ['servant', 'gallery', 'long', 'nursery', 'door', 'hall']) if (lit(ART.wallTile(z, 3, b)) !== 256) { ok(false, 'wall ' + z + ' ' + b); }
ok(new Set(['servant', 'gallery', 'long', 'nursery', 'door', 'hall'].map(z => sig(ART.wallTile(z, 3, 'paper')))).size === 6, 'six back walls (paper), opaque; each also has a chair rail and panelling');

/* ---- the backdrop ---- */
{ const out = new Set(); for (const col of [20, 90, 170, 240, 280, 315]) { const cx = (col - 14) * TS, cy = 21 * TS; const c = draw(480, 280, g => ART.drawBackdrop(g, cx, cy, 480, 280, 0.4, L, at, T)); out.add(sig(c)); ok(lit(c) > 40000, 'the back wall, windows and decor draw at col ' + col + ': ' + lit(c) + ' px'); }
  ok(out.size === 6, 'six sections, six different backdrops'); }
{ const on = draw(200, 140, g => ART.drawBackdrop(g, 70 * TS, 21 * TS, 200, 140, 0.4, L, at, T)); ok(lit(on) > 20000, 'a window of the gallery draws'); }
{ const a = draw(60, 80, g => { g.fillStyle = '#000'; g.fillRect(0, 0, 60, 80); }), b = draw(60, 80, g => { g.fillStyle = '#000'; g.fillRect(0, 0, 60, 80); });
  /* the landmark: a window with the tower in it is not the same window without */
  const w1 = draw(120, 140, g => ART.drawBackdrop(g, 70 * TS, 21 * TS, 120, 140, 0.4, L, (x, y) => (y < 26 && x > 0 ? T.AIR : T.SOLID), T)); void a; void b; ok(lit(w1) > 5000, 'the tower window path draws'); }

/* ---- the props ---- */
{ const s = [0, 1, 2].map(i => sig(draw(40, 50, g => ART.drawPortrait(g, 20, 25, false, 0.4, i)))), took = sig(draw(40, 50, g => ART.drawPortrait(g, 20, 25, true, 0.4, 0)));
  ok(new Set(s).size === 3 && !s.includes(took), 'three portraits (three faces) and the one whose key is taken: the figure has stepped out of the frame'); }
{ const l = draw(30, 40, g => ART.drawSconce(g, 15, 36, true, false, 0.3)), f = draw(30, 40, g => ART.drawSconce(g, 15, 36, true, true, 0.31)), o = draw(30, 40, g => ART.drawSconce(g, 15, 36, false, false, 0.3));
  ok(lit(l) > 100 && new Set([sig(l), sig(f), sig(o)]).size === 3, 'a wall candle has three states: lit, flickering (told), out (a thread of smoke)'); }
{ const s = draw(40, 60, g => ART.drawStand(g, 20, 56, 0.3)), c1 = draw(40, 50, g => ART.drawCarried(g, 20, 44, 1, 'lit', 0.3)), c2 = draw(40, 50, g => ART.drawCarried(g, 20, 44, 1, 'out', 0.3)), c3 = draw(40, 50, g => ART.drawCarried(g, 20, 44, -1, 'lit', 0.3));
  ok(lit(s) > 200 && sig(c1) !== sig(c2) && sig(c1) !== sig(c3), 'the candelabra stand draws; a carried one is lit or out (and faces the hero)'); }
{ const r = draw(40, 50, g => ART.drawRack(g, 20, 46, 0.3)), p = draw(40, 20, g => ART.drawPile(g, 20, 18, 0.3)); ok(lit(r) > 250 && lit(p) > 100, 'an empty suit on its rack and the heap it leaves draw'); }
{ const d = [0, 1, 2, 3].map(k => sig(draw(40, 100, g => ART.drawNurseryDoor(g, 10, 10, 5, k, 3, false, 0.3)))), o = sig(draw(40, 100, g => ART.drawNurseryDoor(g, 10, 10, 5, 3, 3, true, 0.3)));
  ok(new Set(d).size === 4 && !d.includes(o), 'the sealed nursery door: a keyhole per portrait lights (0-3 keys), and it stands ajar when opened'); }
{ const a = draw(60, 30, g => ART.drawPedestal(g, 30, 26, 0.3)), e1 = draw(40, 20, g => ART.drawEye(g, 20, 10, true, 0.3)), e2 = draw(40, 20, g => ART.drawEye(g, 20, 10, false, 0.3));
  ok(lit(a) > 100 && sig(e1) !== sig(e2), "the silver's cushion draws; a panel's eye is open while watched, shut when not"); }
{ const al = draw(64, 64, g => ART.drawAlt(g, [[1, 1], [1, 2]], 0, 0, 0.3)), dw = draw(40, 80, g => ART.drawDoorway(g, [[1, 1], [1, 2], [1, 3]], 0, 0)); ok(lit(al) > 20 && lit(dw) > 120, "where a panel could be (ticks) and the open door's architrave draw"); }
{ const w1 = draw(80, 40, g => ART.drawWisp(g, 40, 20, 1, 0.3)), w2 = draw(80, 40, g => ART.drawWisp(g, 40, 20, -1, 0.3)); ok(lit(w1) > 100 && sig(w1) !== sig(w2), 'a wisp draws, its tail streaming behind it'); }
{ const out = new Set(); for (const it of ['CHAIR', 'PLATE', 'CANDLESTICK', 'BOOK']) for (const t of [0, 0.1]) out.add(sig(draw(20, 20, g => ART.drawThrown(g, 10, 10, it, t)))); ok(out.size === 8, 'the four thrown things, each tumbling in two positions: 8 different frames'); }
{ const c = draw(120, 100, g => ART.drawExit(g, 60, 90, false, 0.3)), o = draw(120, 100, g => ART.drawExit(g, 60, 90, true, 0.3)); ok(lit(c) > 3000 && sig(c) !== sig(o), 'the stair to the Witchlight road: gated and dark, raised and lit once the Castellan falls'); }

/* ---- the foes ---- */
{ const modes = [['walk', 0], ['rise', 0.2], ['rise', 0.7], ['thrustTell', 0.5], ['recover', 0.3, 'thrust'], ['cleaveTell', 0.5], ['recover', 0.3, 'cleave'], ['stuck', 1]], px = new Set();
  for (const [mode, mt, was] of modes) { const e = { mode, modeT: mt, face: 1, anim: 0.3, mnWas: was, flash: 0 }; const c = draw(80, 80, g => FOE.drawSuitFoe(g, e, 40, 70, 0.4, 1.0)); px.add(sig(c)); ok(lit(c) > 150, 'possessed suit ' + mode + (was ? ' (after a ' + was + ')' : '') + (mode === 'rise' ? ' ' + mt : '') + ' draws'); }
  ok(px.size === modes.length, 'every suit mode has its own read: ' + px.size);
  const a = draw(80, 80, g => FOE.drawSuitFoe(g, { mode: 'walk', modeT: 0, face: 1, anim: 0.3, flash: 0 }, 40, 70, 0.4)), b = draw(80, 80, g => FOE.drawSuitFoe(g, { mode: 'walk', modeT: 0, face: 1, anim: 0.3, flash: 0.1 }, 40, 70, 0.4)), l = draw(80, 80, g => FOE.drawSuitFoe(g, { mode: 'walk', modeT: 0, face: -1, anim: 0.3, flash: 0 }, 40, 70, 0.4));
  ok(sig(a) !== sig(b) && sig(a) !== sig(l) && lit(a) === lit(b), 'a hit flashes the suit white (same silhouette); it faces left and right'); }
{ const out = new Set(); for (const mode of ['hide', 'chase', 'lungeTell', 'lunge', 'back']) { const c = draw(100, 50, g => FOE.drawShade(g, { mode, face: 1, hx: 0 }, 50, 28, mode === 'hide' ? 0.05 : 0.4, 0.75)); out.add(sig(c)); if (mode !== 'hide') ok(lit(c) > 100, 'shade ' + mode + ' draws'); else ok(lit(c) > 0, 'a sleeping shade is a green glint in the wall'); }
  ok(out.size === 5, 'every shade mode has its own read: 5'); }
{ const out = new Set(); for (const [mode, item] of [['drift'], ['liftTell', 'CHAIR'], ['liftTell', 'PLATE'], ['liftTell', 'CANDLESTICK'], ['liftTell', 'BOOK'], ['spent']]) { const c = draw(80, 70, g => FOE.drawPoltergeist(g, { mode, modeT: 0.4, item, face: 1 }, 40, 40, 0.4, POLT.lift)); out.add(sig(c)); ok(lit(c) > 150, 'poltergeist ' + mode + (item ? ' lifting a ' + item.toLowerCase() : '') + ' draws'); }
  ok(out.size === 6, 'drift (faint), a lift of each of the four things, spent: six different reads'); }

/* ---- THE CASTELLAN ---- */
const SETS = ['knight', 'halberd', 'duelist', 'greatsword'], MODES = Object.keys(POSE).filter(k => !POSE[k].wisp);
{ const bySet = {}; for (const set of SETS) { const px = {}; for (const k of MODES) { const c = draw(240, 150, g => CA.drawCastellan(g, 120, 118, k, POSE[k], 1, 0.5, { set })); px[k] = sig(c); if (lit(c) < 200) ok(false, set + ' ' + k + ' is too thin'); }
    bySet[set] = px; const distinct = new Set(Object.values(px)).size; ok(distinct >= MODES.length - 3, set.toUpperCase() + ': ' + distinct + ' different drawings over ' + MODES.length + ' poses (a few openings share a slump)');
    const moves = ['thrust', 'bash', 'sweep', 'chop', 'feint', 'lunge', 'flurry', 'breaker', 'whirl'].filter(m => CSM.SET_OF_MOVE[m] === set || (m === 'feint' && set === 'duelist'));
    ok(moves.every(m => px[m + 'Tell'] !== px[m] || m === 'feint'), '  ' + set + ': every move (' + moves.join(', ') + ') has a windup drawn differently from its release'); }
  ok(SETS.every(a => SETS.every(b => a === b || bySet[a].walk !== bySet[b].walk)) && SETS.every(a => SETS.every(b => a === b || bySet[a].sleep !== bySet[b].sleep)), 'the four sets are four different silhouettes (walk, sleep)');
  const w = draw(240, 150, g => CA.drawCastellan(g, 120, 118, 'wisp', POSE.wisp, 1, 0.5, { set: 'knight' })), w2 = draw(240, 150, g => CA.drawCastellan(g, 120, 118, 'wisp', POSE.wisp, -1, 0.5, { set: 'knight' }));
  ok(lit(w) > 300 && sig(w) !== sig(w2), 'THE GHOST CROSSING (the wisp: a steward with a ring of keys, mist trailing) draws, facing its flight'); }
{ const lv = draw(240, 150, g => CA.drawCastellan(g, 120, 118, 'leave', POSE.leave, 1, 0.5, { set: 'duelist' })), sw = draw(240, 150, g => CA.drawCastellan(g, 120, 118, 'swap', POSE.swap, 1, 0.5, { set: 'duelist' })), kn = draw(240, 150, g => CA.drawCastellan(g, 120, 118, 'knocked', POSE.knocked, 1, 0.5, { set: 'duelist', open: true })), wk = draw(240, 150, g => CA.drawCastellan(g, 120, 118, 'walk', POSE.walk, 1, 0.5, { set: 'duelist' }));
  ok(sig(lv) !== sig(wk) && sig(kn) !== sig(wk) && lit(lv) > lit(wk), 'the ghost climbs out of a slumped suit on LEAVE, and is half out of the helm knocked / in the openings'); void sw; }
{ const a = draw(240, 150, g => CA.drawCastellan(g, 120, 118, 'walk', POSE.walk, 1, 0.5, { set: 'knight' })), b = draw(240, 150, g => CA.drawCastellan(g, 120, 118, 'walk', POSE.walk, 1, 0.5, { set: 'knight', flash: true })), c = draw(240, 150, g => CA.drawCastellan(g, 120, 118, 'walk', POSE.walk, -1, 0.5, { set: 'knight' }));
  ok(sig(a) !== sig(b) && lit(a) === lit(b) && sig(a) !== sig(c), 'a hit flashes him white (same silhouette); he faces left and right'); }
{ const t = [0, 1, 2.5, 4].map(tt => sig(draw(240, 150, g => CA.drawCastellan(g, 120, 118, 'dead', {}, 1, 0.5, { set: 'greatsword', t: tt })))), gone = lit(draw(240, 150, g => CA.drawCastellan(g, 120, 118, 'dead', {}, 1, 0.5, { set: 'greatsword', t: 6 })));
  ok(new Set(t).size === 4 && gone === 0, 'DEATH: the armour falls in a heap, the ghost rises out of it (4 frames) and is gone by 6 s'); }
{ const a = draw(60, 60, g => CA.drawArenaRack(g, 30, 54, 1, 'halberd', false, false, 0.3)), b = draw(60, 60, g => CA.drawArenaRack(g, 30, 54, 1, 'halberd', true, false, 0.3)), c = draw(60, 60, g => CA.drawArenaRack(g, 30, 54, 1, 'halberd', false, true, 0.3));
  ok(sig(a) !== sig(b) && sig(a) !== sig(c) && lit(a) > 250, 'a hall rack: standing, spent (slumped, cracked), its visor lit as he swaps in'); }

/* ---- the hands run through the art, in a fake world ---- */
const hero = (x, y, o = {}) => ({ x, y, hp: 400, vx: 0, vy: 0, ground: true, face: 1, eye: { x, y: y - 12 }, ...o });
const fakeWorld = (L0, heroes) => { const fx = { L: L0, TS, T, players: () => heroes, enemies: () => fx.ens, ens: [], time: () => 0, number() {}, hint() {}, asPlayer: (p, fn) => fn(), damage: () => 'hit', cellSet: (x, y, t) => { L0.grid[y * L0.W + x] = t; }, upright: () => true, hitOnce: () => true, shake() {}, ring() {}, addFoe: e => fx.ens.push(e) }; return fx; };
{ const L0 = LEVELS.find(l => l.id === 'manor').build(), P = hero(150 * TS, 29 * TS), F = fakeWorld(L0, [P]), G = makeManorHands(F); G.reset(); let threw = null;
  const scenes = [[3, 20], [70, 60], [145, 150], [220, 240], [270, 270]];
  const run = (cx, cy) => { const c = newCanvas(480, 280), g = c.getContext('2d'); try { G.drawBack(g, cx * TS, cy * TS, 480, 280, 1.3); for (const e of F.ens) if (G.draws(e)) G.drawFoe(g, e, cx * TS, cy * TS, 1.3); G.drawOver(g, cx * TS, cy * TS, 480, 280, 1.3); } catch (e) { threw = e; } return c; };
  const out = scenes.map(([c0]) => lit(run(c0, 20)));
  ok(!threw && out.every(v => v > 50000), 'drawBack / drawOver run through the art in all five sections: ' + out.join(', ') + (threw ? ' THREW ' + threw.stack : ''));
  G.takeKey('pt0'); G.takeKey('pt1'); G.takeKey('pt2'); G.swap('ps0'); G.swap('ps1'); G.take(P); G.snuffCarry(P); const sA = run(70, 20); G.update(1.5); ok(!threw && lit(sA) > 50000, 'with keys taken, panels swapped, a candelabra carried and snuffed: still draws');
  for (const sp of L0.ents.filter(q => ['armour', 'haunt', 'poltergeist'].includes(q.t))) { const e = { x: sp.x * TS + 8, y: (sp.y + 1) * TS, face: 1, alive: true, t: sp.t, cnSkin: sp.cnSkin, mode: 'walk', modeT: 0, anim: 0, w: 12, h: 26, hp: 70, maxHp: 70 };
    if (sp.t === 'poltergeist') { e.mode = 'liftTell'; e.item = 'BOOK'; e.modeT = 0.4; } if (!G.mine(e)) continue; try { const c = newCanvas(120, 100); G.drawFoe(c.getContext('2d'), e, e.x - 60, e.y - 70, 1); if (lit(c) < 50) threw = new Error('thin ' + sp.t); } catch (er) { threw = er; } }
  ok(!threw, 'every manor foe in the level draws through drawFoe (suit, shade, poltergeist)'); }
{ const L0 = LEVELS.find(l => l.id === 'manor').build(), A = L0.arena, P = hero(A.x0 + 10 * TS, A.floor), F = fakeWorld(L0, [P]); let boss = null;
  const ctx = { ...F, get L() { return L0; }, get boss() { return boss; }, bossActive: true, EHP: { castellan: CS.hp }, hero: () => P }, H = makeCastellanHands(ctx), sp = L0.ents.find(e => e.t === 'castellan');
  boss = H.spawnBoss({ x: sp.x * TS + 8, y: (sp.y + 1) * TS, vx: 0, vy: 0, face: 1, alive: true }); boss.mode = 'wake'; boss.modeT = 1.4; let threw = null, drew = 0, modes = new Set();
  const frame = t => { const c = newCanvas(820, 280), g = c.getContext("2d"); try { H.drawBack && H.drawBack(g); H.drawBoss(g, boss, A.x0, A.floor - 200, t); H.drawOver(g, A.x0, A.floor - 200, 820, 280, t); } catch (e) { threw = e; } return lit(c); };
  let t = 0; const dt = 1 / 30; while (t < 40 && boss.alive) { t += dt; H.update(boss, dt); modes.add(boss.mode); if ((t * 30 | 0) % 6 === 0) { drew += frame(t) > 100 ? 1 : 0; } if (t > 6 && t < 9) boss.hp = Math.min(boss.hp, boss.maxHp * 0.58); if (t > 12) boss.hp = Math.min(boss.hp, boss.maxHp * 0.38); if (t > 18) boss.hp = Math.min(boss.hp, boss.maxHp * 0.18); }
  ok(!threw && drew > 40, 'THE CASTELLAN draws every frame of a fight in the fake world (modes seen: ' + [...modes].join(' ') + ')' + (threw ? ' THREW ' + threw.stack : ''));
  boss.hp = 0; boss.alive = false; H.end(boss); const d1 = frame(41), d2 = frame(43), d3 = frame(47); ok(!threw && d1 > 100 && d2 > 100 && d3 > 0, 'and after his death: the heap and the rising ghost, then the racks only (' + d1 + ' / ' + d2 + ' / ' + d3 + ' px)'); }
const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8').split('\r').join('');
{ const m = src('src/main.js'); ok(/\(claude\/manorart\)/.test(m) && /if \(L\.manor && \(t === T\.SOLID \|\| t === T\.ONEWAY\)\) \{ const ts = MNA\.manorTile/.test(m), 'main.js: the tile hook is tagged and guarded by L.manor'); }
console.log(bad ? '\n' + bad + ' FAILED' : '\nall ok');
process.exit(bad ? 1 : 0);
