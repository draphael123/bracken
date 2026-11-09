// tools/gtart-sheet.mjs - THE GHOST TRAIN's art (claude/gtart) rendered in NODE, no browser: tiles, the sections as the game draws them (tiles + backdrop + cars + lamps + ghosts), the tells (tunnel,
// bridge, gust, points, a car left on the line), the Conductor's poses, the firebox, the brake, the holes and his death - to PNG, and CHECKS: every tile bakes, one 16x16 canvas, none blank.
//   node tools/gtart-sheet.mjs [outDir] [zoom]      (default outDir scratch/gtart-node next to the repo; zoom 2)
globalThis.__GT = true;
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
import { mkdirSync } from 'node:fs';
install();
const out = process.argv[2] || new URL('../../scratch/gtart-node/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1').replace(/%20/g, ' '), Z = +(process.argv[3] || 2);
mkdirSync(out, { recursive: true });
const { LEVELS, T } = await import('../src/level.js');
const { GT, SECTIONS } = await import('../src/ghost-train.js');
const { makeGhostTrainHands } = await import('../src/ghost-train-hands.js');
const { makeConductorHands, POSE } = await import('../src/conductor-hands.js');
const GTT = await import('../src/redraw/gt_tiles.js'), GA = await import('../src/redraw/gt_art.js'), CA = await import('../src/redraw/conductor_art.js');
const CDM = await import('../src/conductor.js');
const TS = 16; let bad = 0; const ok = (c, m) => { if (!c) { console.log('FAIL: ' + m); bad++; } };
const big = (c, z = Z) => { const o = newCanvas(c.width * z, c.height * z); o.getContext('2d').drawImage(c, 0, 0, c.width, c.height, 0, 0, c.width * z, c.height * z); return o; };
const small = c => { const o = newCanvas(240, 135); o.getContext('2d').drawImage(c, 0, 0, c.width, c.height, 0, 0, 240, 135); return o; };
const lv = LEVELS.find(l => l.id === 'ghosttrain'); const L = lv.build();
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.AIR : L.grid[y * L.W + x];

/* 1. the tile kit: every cell of the real level bakes to one 16x16, and none is blank */
{ const seen = new Map(); let n = 0;
  for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) { const t = L.grid[y * L.W + x]; if (t === T.AIR) continue; const c = GTT.gtTile(t, x, y, at, T, L); n++;
    ok(c && c.width === 16 && c.height === 16, 'tile ' + x + ',' + y + ' is not 16x16 (' + t + ')'); if (c && !seen.has(c)) seen.set(c, [x, y]); }
  const blank = [...seen.keys()].filter(c => { const d = c.getContext('2d').getImageData(0, 0, 16, 16).data; let k = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) k++; return k < 40; });
  ok(!blank.length, blank.length + ' blank tiles'); console.log('tiles: ' + n + ' cells, ' + seen.size + ' distinct canvases');
  savePNG(big(sheet([...seen.keys()], { maxW: 640, bg: '#40485c', pad: 3 }), 3), out + '/gtart-tiles.png'); }

/* 2. the world as the game draws it */
const fake = heroes => ({ L, TS, T, players: () => heroes, enemies: () => [], time: () => 0, number: () => {}, hint: () => {}, asPlayer: (p, f) => f(), damage: () => null, cellSet: (x, y, t) => { L.grid[y * L.W + x] = t; }, moveBody: (b, dx) => { b.x += dx; }, upright: () => true, hitOnce: () => true, shake: () => {}, ring: () => {}, sfx: null });
const hero = (x, y) => ({ x, y, hp: 400, vx: 0, vy: 0, ground: true, ducking: false });
const VW = 480, VH = 270, grid0 = Array.from(L.grid);
const tilesInto = (g, cxp, cyp) => { for (let ty = Math.floor(cyp / TS); ty <= Math.ceil((cyp + VH) / TS); ty++) for (let tx = Math.floor(cxp / TS); tx <= Math.ceil((cxp + VW) / TS); tx++) { const t = at(tx, ty); if (t === T.AIR) continue; const s = GTT.gtTile(t, tx, ty, at, T, L); if (s) g.drawImage(s, tx * TS - cxp, ty * TS - cyp); } };
const heroStub = (g, hx, hy) => { g.fillStyle = '#e8c070'; g.fillRect(hx - 4, hy - 14, 8, 14); g.fillStyle = '#5a7ac0'; g.fillRect(hx - 4, hy - 8, 8, 8); g.fillStyle = '#d8d0c0'; g.fillRect(hx - 3, hy - 14, 6, 5); };
function stage(cxp, cyp, o = {}) {
  L.grid.set(grid0); const F = fake(o.hero ? [hero(o.hero[0], o.hero[1])] : []), G = makeGhostTrainHands(F); G.reset(); let S = G.show(); if (!S) { G.update(0.01); S = G.show(); }
  if (o.lamps) for (const lp of L.gt.lamps) lp.on = o.lamps(lp);
  if (o.tun) { const t = 2.5; S.tun = { kind: o.tun, t, tell: 1.8, m0: cxp + (o.mouth ?? 300) + GT.speed * t, len: o.tun === 'bridge' ? 44 : 360 }; }
  if (o.tell) S.tun = { kind: o.tell, t: 0.9, tell: 1.8, m0: 0, len: 100 };
  if (o.gust) S.gust = 3;
  if (o.points) for (const p of L.gt.points) p.set = o.points;
  if (o.ember) S.embers = [{ x: cxp + 120, y: 14 * TS, t: 1.2, tell: 1.0 }, { x: cxp + 200, y: 14 * TS, t: 0.1, tell: 1.0, hot: true }];
  if (o.recede) S.recede = [{ x0: cxp - 60, x1: cxp + 200, kind: 'coach', t: 0.4 }];
  const c = newCanvas(VW, VH), g = c.getContext('2d'), time = o.time ?? 1.3;
  G.drawBack(g, cxp, cyp, VW, VH, time); tilesInto(g, cxp, cyp);
  for (const e of L.ents) if (e.t === 'gtghost' && e.x * TS >= cxp - 20 && e.x * TS <= cxp + VW + 20) { const ent = { x: e.x * TS + 8, y: (e.y + 1) * TS, hx: e.x * TS, face: -1, stoker: !!e.stoker, seat: !!e.seat, mode: 'sleep', modeT: 0, anim: 0, t: 'gtghost' };
    const lit = G.litAt(ent.x, ent.y - 4); ent.mode = o.awake ? (o.awake === 'grasp' ? 'grasp' : o.awake === 'tell' ? 'graspTell' : 'drift') : lit ? 'sleep' : 'drift'; G.drawGhost(g, ent, cxp, cyp, time); }
  if (o.hero) heroStub(g, o.hero[0] - cxp, o.hero[1] - cyp);
  G.drawOver(g, cxp, cyp, VW, VH, time); return c;
}
const roofCy = 12 * TS - 96, shots = [];
const add = (name, c) => { shots.push(c); savePNG(big(c), out + '/gtart-' + name + '.png'); };
add('1-siding-van', stage(0, roofCy, { hero: [10 * TS, 18 * TS], lamps: lp => lp.lit }));
add('1b-siding-well-facade', stage(18 * TS, roofCy - 30, { hero: [21 * TS, 18 * TS] }));
add('2-passenger-lit-dark', stage(38 * TS, roofCy, { hero: [45 * TS, 18 * TS], lamps: lp => lp.lit }));
add('2b-dark-coach-oil', stage(54 * TS, roofCy, { hero: [60 * TS, 18 * TS], lamps: lp => lp.lit || lp.car === 3 && lp.x < 64 * TS }));
add('2c-first-class', stage(74 * TS, roofCy, { hero: [80 * TS, 18 * TS] }));
add('3-dining-lit', stage(94 * TS, roofCy - 20, { hero: [104 * TS, 18 * TS] }));
add('3b-dining-dark-wake', stage(94 * TS, roofCy - 20, { hero: [104 * TS, 18 * TS], lamps: () => false, awake: 'drift' }));
add('4-sleeper-dark-grasp', stage(120 * TS, roofCy, { hero: [126 * TS, 18 * TS], lamps: () => false, awake: 'tell' }));
add('4b-sleeper-cutting', stage(142 * TS, roofCy, { hero: [150 * TS, 18 * TS], lamps: lp => lp.id.length % 2 === 0 }));
add('5-coal-trucks-sparks', stage(164 * TS, roofCy - 40, { hero: [170 * TS, 13 * TS], ember: true }));
add('5b-coal-two', stage(180 * TS, roofCy - 40, { hero: [183 * TS, 18 * TS], awake: 'drift' }));
add('6-tender-engine', stage(228 * TS, roofCy - 40, { hero: [236 * TS, 15 * TS] }));
add('6b-engine-cab', stage(238 * TS, roofCy - 40, { hero: [244 * TS, 18 * TS] }));
add('t1-tunnel-mouth', stage(76 * TS, roofCy, { hero: [84 * TS, 11 * TS], tun: 'tunnel', mouth: 250 }));
add('t2-low-bridge', stage(76 * TS, roofCy, { hero: [84 * TS, 11 * TS], tun: 'bridge', mouth: 180 }));
add('t3-tunnel-told', stage(76 * TS, roofCy, { hero: [84 * TS, 11 * TS], tell: 'tunnel' }));
add('t4-gust', stage(40 * TS, roofCy, { hero: [46 * TS, 11 * TS], gust: true }));
add('t5-car-left-on-the-line', stage(40 * TS, roofCy, { hero: [78 * TS, 18 * TS], recede: true }));
add('t6-points-branch', stage(80 * TS, roofCy, { hero: [90 * TS, 11 * TS], points: 'branch' }));
savePNG(big(sheet(shots.map(small), { maxW: 1000, bg: '#101018', pad: 4 })), out + '/gtart-contact-sheet.png');

/* 3. THE CONDUCTOR: every pose of the table on a deck, both facings; the firebox, the brake, the holes, the corpse */
const deck = (w, h, fn) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = '#10142c'; g.fillRect(0, 0, w, h); g.fillStyle = '#242c3a'; g.fillRect(0, h - 14, w, 14); g.fillStyle = '#464660'; g.fillRect(0, h - 14, w, 2); fn(g, w, h); return c; };
const poses = Object.keys(POSE).filter(k => !POSE[k].fused).map(k => deck(80, 80, (g, w, h) => CA.drawConductor(g, 40, h - 14, POSE[k], { face: 1, time: 1.1, mode: k, flash: 0 })));
const posesL = ['swingTell', 'swing', 'punchTell', 'punch'].map(k => deck(80, 80, (g, w, h) => CA.drawConductor(g, 40, h - 14, POSE[k], { face: -1, time: 1.1, mode: k })));
savePNG(big(sheet([...poses, ...posesL], { maxW: 660, bg: '#08080e', pad: 4 }), 3), out + '/gtart-conductor-poses.png');
const fused = Object.keys(POSE).filter(k => POSE[k].fused).map(k => deck(100, 80, (g, w, h) => CA.drawFirebox(g, 70, h - 14, { glow: POSE[k].glow || 0, hand: POSE[k].hand || 0, time: 1.1, mouth: POSE[k].mouth })));
const brakes = [0, 0.5, 1].map(p => deck(60, 80, (g, w, h) => CA.drawBrake(g, 30, h - 22, p, 1.1, true)));
const bits = [deck(60, 50, g => { CA.drawHoleTell(g, 20, 20, 16, 1.0); }), deck(60, 50, g => { g.fillStyle = '#34344a'; g.fillRect(0, 20, 60, 14); CA.drawHoleOpen(g, 20, 20, 16); }), deck(60, 60, (g, w, h) => CA.drawUncouple(g, 30, h - 16, true, 1.0)),
  deck(80, 60, (g, w, h) => CA.drawJet(g, 6, 70, h - 14, 22, 1.1, true)), ...[0.1, 0.6, 1.4, 2.2].map(t => deck(80, 60, (g, w, h) => CA.drawCorpse(g, 36, h - 14, t)))];
savePNG(big(sheet([...fused, ...brakes, ...bits], { maxW: 660, bg: '#08080e', pad: 4 }), 3), out + '/gtart-conductor-fx.png');

/* 4. the ghosts and firemen alone, every state */
const gh = []; for (const stoker of [false, true]) for (const st of [0, 1, 2, 3]) for (const [m, asleep] of [['sleep', true], ['drift', false], ['graspTell', false], ['grasp', false]]) { if (stoker && st > 1) continue; gh.push(deck(56, 54, (g, w, h) => GA.drawGhostArt(g, 24, h - 14, { asleep, mode: m, face: 1, stoker, seat: false, time: 1.2, hx: st * 16 }))); }
gh.push(deck(56, 54, (g, w, h) => GA.drawGhostArt(g, 28, h - 14, { asleep: true, mode: 'sleep', face: 1, seat: true, time: 1.2, hx: 3 })));
savePNG(big(sheet(gh, { maxW: 660, bg: '#08080e', pad: 4 }), 3), out + '/gtart-ghosts.png');

/* 5. the arena through the real hands: the Conductor, the jet, his firebox, a brake, holes, an uncoupling, the call */
{ L.grid.set(grid0); const Fk = fake([hero(236 * TS, 18 * TS)]), G = makeGhostTrainHands(Fk); G.reset(); const ctx = { ...Fk, get L() { return L; }, boss: null, bossActive: true, EHP: { conductor: CDM.CD.hp }, gt: () => G, lockX0: () => {} };
  const H = makeConductorHands(ctx); const sp = L.ents.find(e => e.t === 'conductor'); const boss = H.spawnBoss({ x: sp.x * TS + 8, y: (sp.y + 1) * TS, vx: 0, vy: 0, face: -1, alive: true }); ctx.boss = boss; const S = H.show();
  const scene = (cxp, cyp, mode, o = {}) => { const c = newCanvas(VW, VH), g = c.getContext('2d'); G.drawBack(g, cxp, cyp, VW, VH, 1.3); tilesInto(g, cxp, cyp);
    boss.mode = mode; boss.face = o.face ?? -1; if (o.x != null) { boss.x = o.x; boss.y = o.y ?? 18 * TS; } H.drawBoss(g, boss, cxp, cyp, 1.3);
    if (o.blast) S.blasts = [{ x0: boss.x - 90, x1: boss.x - 6, y: 18 * TS, t: 1 }]; if (o.press != null) S.press = o.press; if (o.holes) S.holes = [{ st: o.holes, cells: [{ x: 199, y: 18 }, { x: 200, y: 18 }, { x: 205, y: 12 }] }];
    if (o.unc) S.unc = { c: { x: 211 * TS, y: 18 * TS }, st: 'tell', t: 1 };
    G.drawOver(g, cxp, cyp, VW, VH, 1.3); H.drawOver(g, cxp, cyp, VW, VH, 1.3); S.blasts = []; S.holes = []; S.unc = null; return c; };
  const arena = [], A = (name, c) => { arena.push(c); savePNG(big(c), out + '/gtart-boss-' + name + '.png'); }, cy0 = 12 * TS - 100;
  A('1-wake-van', scene(196 * TS - 20, cy0, 'wake', { x: 204 * TS, press: 1 }));
  A('2-lantern-swing', scene(196 * TS - 20, cy0, 'swing', { x: 204 * TS, press: 0.5 }));
  A('3-punch-holes', scene(196 * TS - 20, cy0, 'punch', { x: 204 * TS, holes: 'tell', press: 0.2 }));
  A('4-holes-open-thrown', scene(196 * TS - 20, cy0, 'thrown', { x: 203 * TS, holes: 'open', press: 0.0 }));
  A('5-brake-open-down', scene(196 * TS - 20, cy0, 'down', { x: 204 * TS, press: 1 }));
  A('6-uncouple-tell', scene(205 * TS, cy0, 'callTell', { x: 209 * TS, unc: true, press: 0.6 }));
  A('7-tunnel-call', scene(204 * TS, cy0, 'call', { x: 210 * TS, press: 0.9 }));
  A('8-tender-engine-fuse', scene(236 * TS, cy0, 'fuse', { x: 247 * TS, y: 18 * TS, press: 0.4 }));
  A('9-firebox-jet', scene(232 * TS, cy0, 'blast', { x: 249 * TS - 2, y: 18 * TS, blast: true, press: 0.6 }));
  A('10-firebox-hand', scene(232 * TS, cy0, 'grasp', { x: 249 * TS - 2, y: 18 * TS, press: 0.6 }));
  savePNG(big(sheet(arena.map(small), { maxW: 1000, bg: '#101018', pad: 4 })), out + '/gtart-boss-contact-sheet.png'); }
console.log(bad ? bad + ' FAIL' : 'gtart-sheet ok: ' + out);
process.exit(bad ? 1 : 0);
