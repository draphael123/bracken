// tools/silk.mjs - THE SILK UNDERCROFT and THE CRYPT MOTHER (claude/silk, the opus greybox; Node only, no page).
//   node tools/silk.mjs            runs BOTH halves, one process after the other (the flag is read when src/level.js is imported):
//     FLAG OFF (this process)      SILK_SHIPS false and no ?sk: LEVELS, THE BURIAL CAVERNS and THE WITCHLIGHT STAIR are master's (the same signature as master 067c6de7e,
//                                  hashed from a `git archive` export before this lane changed a line), the road and the old-save rule in src/main.js do nothing (lifted
//                                  out and run over fake saves), every main.js hook is guarded
//     FLAG ON  (a child: --on)     the road (caverns > undercroft > stair, appended), old saves grandfathered, the build (six sections, START + 2 shrines, no filler),
//                                  the fill reaches every shrine, silver, sconce, anchor, sac and knot; ONE REQUIRED USE OF EACH VERB (without it the far side is out of
//                                  reach, with it in reach: bounce, cut, burn); THE HANDS in a fake world (torches, walls, cocoons, the bridge, sacs, goo, the net, the
//                                  reset); THE FOES (spiderling bite, spitter glob + snare, the lurker's thread / drop / climb / cut); THE CRYPT MOTHER END TO END (a bot
//                                  fights her real moves: cuts = openings, P2's falling strands, the win)
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const ON = process.argv.includes('--on');
if (ON) globalThis.__SK = true;
const { install } = await import('./node-canvas.mjs'); install();
const { LEVELS, T } = await import('../src/level.js');
const { skOn, SILK_SHIPS } = await import('../src/sk-flag.js');
const TS = 16;
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8').split('\r').join('');
const main = src('src/main.js');
const h = v => createHash('sha1').update(JSON.stringify(v)).digest('hex').slice(0, 16);
/* THE OLD-SAVE RULE AND THE GATE CLAUSE, lifted out of src/main.js and run over a fake PROG */
const { roadKept } = await import('../src/route-insert.js');
const mig = /if \(skOn\(\) && !PROG\.skRoadMig\) \{[^\n]*?ro\.silk = 1; \}/.exec(main), lock = /\(lv\.needs && !\(PROG\[lv\.needs\] && PROG\[lv\.needs\]\.cleared\)[^\n]*?&& !q\.get\('unlock'\)\)/.exec(main);
const gateRun = (PROG, on) => { if (mig) new Function('PROG', 'skOn', mig[0])(PROG, () => on); const q = { get: () => null };
  const locked = id => new Function('lv', 'PROG', 'q', 'roadKept', 'return !!' + lock[0])(LEVELS.find(l => l.id === id) || { id, needs: 'burial' }, PROG, q, roadKept); return { stair: locked('witchlight'), silk: locked('silk'), of: locked }; };

/* SHIPPED STATE (11-10, claude/batch157): all four night areas are live together, so the "this area alone, flag off = master" half only runs while its constant is false;
   with it true the process asserts the shipped state instead and the child (--on) checks the area on the road */
const OFF = !SILK_SHIPS;
if (!ON) {
  console.log('== THE SILK UNDERCROFT, FLAG OFF (SILK_SHIPS = ' + SILK_SHIPS + ')');
  if (OFF) ok(!SILK_SHIPS && !skOn(), 'the ship flag is off and nothing turns it on here');
  else ok(SILK_SHIPS && skOn() && LEVELS.some(l => l.id === 'silk'), 'SHIPPED: the ship flag is true and the LEVELS row is there (all four night areas live together)');
  if (OFF) ok(!LEVELS.some(l => l.id === 'silk'), 'no LEVELS row');
  if (OFF) ok(LEVELS.find(l => l.id === 'witchlight').needs === 'burial', 'THE WITCHLIGHT STAIR still needs THE BURIAL CAVERNS');
  if (OFF) {
  const MASTER = { n: 72, levels: 'e1d37b905059043c', burial: '62a3ba78de07aae8', witchlight: 'b2904bf68aaa0cfc' };   /* master 067c6de7e (git archive export, before any edit) */
  const rows = LEVELS.map(l => [l.id, l.needs || null, l.leadsTo || null, !!l.hidden]);
  const b = id => { const L = LEVELS.find(l => l.id === id).build(); return h([L.W, L.H, Array.from(L.grid), L.ents]); };
  const now = { n: LEVELS.length, levels: h(rows), burial: b('burial'), witchlight: b('witchlight') };
  ok(JSON.stringify(now) === JSON.stringify(MASTER), 'LEVELS (ids, needs, order), THE BURIAL CAVERNS and THE WITCHLIGHT STAIR are master\'s exactly ' + JSON.stringify(now));
  }
  ok(!!mig && !!lock && /!roadKept\(PROG, lv\)/.test(lock[0]), 'the old-save rule is in src/main.js; what it keeps open goes through levelLocked\'s own roadKept clause (PROG.roadOpen, src/route-insert.js) - no clause of its own');
  if (OFF && mig && lock) for (const [name, P0] of [['a fresh save', {}], ['the caverns cleared', { burial: { cleared: true } }], ['past the stair', { burial: { cleared: true }, witchlight: { cleared: true } }], ['the fields only', { fields: { cleared: true } }]]) {
    const P = JSON.parse(JSON.stringify(P0)), r = gateRun(P, false), want = !(P0.burial && P0.burial.cleared) && !(P0.witchlight && P0.witchlight.cleared);
    ok(r.stair === want && !P.skRoadMig && !P.roadOpen, 'flag off, ' + name + ': the stair ' + (want ? 'locked' : 'open') + ' exactly as master, the save untouched ' + JSON.stringify(P)); }
  const tagged = main.split('\n').filter(l => l.includes('(claude/silk)'));
  ok(tagged.length >= 15 && tagged.length <= 22, tagged.length + ' tagged hook lines in src/main.js (single lines)');
  const unguarded = tagged.filter(l => !/skOn\(\)|SKH|CMH|silkOpen|case 'cryptmother'|SK_NODE|SK_LURK/.test(l));
  ok(!unguarded.length, 'every hook is behind the flag: the road and the old-save rule ask skOn(), the rest need the level (SKH.on() / its ents / its boss) ' + unguarded.map(l => l.slice(0, 60)).join(' | '));
  ok(/if \(LEVELS\.some\(l => l\.id === 'silk'\)\) \{ INLAND_NODES\.splice/.test(main), 'the map node and its road vertex go in only while the LEVELS row is there (skOn() at import)');
  ok(/skOn\(\) && isDev\(\)/.test(main), 'the dev entry needs ?sk=1 and ?dev=1');
  ok(/if \(SKH && SKH\.mine\(e\)\) \{ SKH\.foe\(e, dt\); continue; \}[^\n]*\n\s*if \(e\.t === 'spider'\) \{ updateSpider/.test(main), 'the skins go to the hands BEFORE updateSpider (SKH.mine: only cnSkin skling / skspitter and the lurker - every other spider is master\'s)');
  const child = spawnSync(process.execPath, ['--import', './tools/sk-on.mjs', fileURLToPath(import.meta.url), '--on'], { cwd: fileURLToPath(new URL('..', import.meta.url)), encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  process.stdout.write(child.stdout || ''); if (child.status !== 0) bad++;
  console.log(bad ? '\nTHE SILK UNDERCROFT: ' + bad + ' FAIL(S)' : '\nTHE SILK UNDERCROFT: all ok (flag off and flag on)');
  process.exit(bad ? 1 : 0);
}

// ======================================================================= FLAG ON =======================================================================
console.log('== THE SILK UNDERCROFT, FLAG ON (globalThis.__SK)');
const { SK, SECTIONS, REQUIRED } = await import('../src/silk-undercroft.js');
const { SK_RULE, SK_SAY, CM_SAY } = await import('../src/sk-lines.js');
const { makeSilkHands, TORCH, SAC, GOO, NET, FOE, LING, SPIT, LURK } = await import('../src/silk-hands.js');
const CMM = await import('../src/crypt-mother.js'); const { CM } = CMM;
const { makeCryptMotherHands, POSE, SOUND } = await import('../src/crypt-mother-hands.js');
const { floodReach } = await import('../src/reachcore.js');
const { THREAT } = await import('../src/threat.js');
const { MARK, ANSWER } = await import('../src/marks.js');
const lv = LEVELS.find(l => l.id === 'silk');
ok(!!lv && skOn(), 'the LEVELS row is there with the flag on');
if (!lv) process.exit(1);
// ---- THE ROAD ----
const need = id => LEVELS.find(l => l.id === id).needs;
ok(LEVELS.indexOf(lv) === 73 && LEVELS.length === 76 && LEVELS.slice(72).map(l => l.id).join() === 'wispwood,silk,manor,academy', 'APPENDED in ship order (saves count levels by index): the four night areas are rows 72-75 (this one is 73), nothing before them moved');
ok(need('wispwood') === 'burial' && need('silk') === 'wispwood' && need('manor') === 'silk' && need('witchlight') === 'manor' && need('academy') === 'witchlight' && need('mage') === 'academy', 'THE ROAD (shipped, all four live): BURIAL > WISPWOOD > SILK > MANOR > WITCHLIGHT STAIR > ACADEMY > THE MAGE FOLLY');
ok(lv.rule === SK_RULE && /SILK HOLDS WHAT TOUCHES IT/.test(lv.rule), 'the rule line: ' + lv.rule);
ok(/GATE = \[[^\]]*'silk'/.test(src('tools/level-quality.mjs')), 'gated by level-quality');
ok(['skweb', 'skanchor', 'sksconce', 'skwall', 'sksac', 'skgoo'].every(k => THREAT[k] === 0) && THREAT.silklurker > 0 && THREAT.cryptmother > 0, 'the threat table knows its machines (0), its lurker and its boss');
ok(MARK['silklurker|threadTell'] === '!!' && MARK['silklurker|biteTell'] === '!' && ANSWER['silklurker|threadTell'] === 'dodge', 'the lurker\'s thread wears a red !! (move off), its bite a yellow ! (src/marks.js)');
if (mig && lock) {
  const past = gateRun({ burial: { cleared: true }, witchlight: { cleared: true } }, true), atCav = gateRun({ burial: { cleared: true } }, true), fresh = gateRun({ skRoadMig: 1, burial: { cleared: true } }, true), done = gateRun({ skRoadMig: 1, burial: { cleared: true }, silk: { cleared: true } }, true);
  ok(!past.stair && !atCav.stair, 'an old save that cleared the caverns (or the stair) keeps the stair open (grandfathered once): ' + JSON.stringify([past, atCav]));
  ok(!past.silk, 'a save past the stair finds the undercroft UNLOCKED as an extra');
  ok(fresh.stair && fresh.silk && !gateRun({ skRoadMig: 1, burial: { cleared: true }, wispwood: { cleared: true } }, true).silk, 'a save made with the undercroft on the road: the wood opens it (it needs wispwood now), the stair waits');
  ok(done.stair && !done.of('manor'), 'clearing the undercroft opens the manor; the stair waits for the manor (shipped road)');
}
// ---- THE BUILD ----
const L = lv.build();
ok(L.W === SK.W && L.H === SK.H && L.silk && L.sk && L.arena && L.arena.boss === 'cryptmother', 'built: ' + L.W + ' x ' + L.H + ', the cathedral web');
ok(L.sections.length === 6 && SECTIONS.length === 6, 'six sections: ' + SECTIONS.map(s => s[0]).join(' / '));
const checks = L.ents.filter(e => e.t === 'check'), silvers = L.ents.filter(e => e.t === 'silver');
ok(checks.length === 2 && L.checkRun === 200, 'START + 2 shrines (cols ' + checks.map(c => c.x).join(', ') + '), checkRun 200: the filler adds none');
ok(silvers.length === 2, 'two silvers (cols ' + silvers.map(s => s.x).join(', ') + ')');
const G0 = L.sk;
ok(G0.webs.length >= 5 && G0.anchors.length >= 5 && G0.walls.length >= 3 && G0.sconces.length >= 5 && G0.sacs.length >= 4 && G0.goos.length >= 2, 'taut webs ' + G0.webs.length + ', anchors ' + G0.anchors.length + ' (knots ' + G0.anchors.filter(a => a.kind === 'knot').length + '), sticky walls ' + G0.walls.length + ', sconces ' + G0.sconces.length + ', sacs ' + G0.sacs.length + ', goo ' + G0.goos.length);
ok(L.calm && L.calm.length && !L.ents.some(e => e.t === 'gate'), 'placed by hand (calm), no exit gate: the Mother ends it');
const foes = L.ents.filter(e => e.t === 'spider' || e.t === 'silklurker');
ok(foes.filter(e => e.cnSkin === 'skling').length >= 10 && foes.filter(e => e.cnSkin === 'skspitter').length >= 4 && foes.filter(e => e.t === 'silklurker').length >= 3 && !L.ents.some(e => /gob/.test(e.t) || /gob/.test(e.cnSkin || '')), 'foes: ' + foes.filter(e => e.cnSkin === 'skling').length + ' spiderlings, ' + foes.filter(e => e.cnSkin === 'skspitter').length + ' spitters, ' + foes.filter(e => e.t === 'silklurker').length + ' lurkers - no goblins (act IV)');
{ const reach = floodReach(L, T, { rides: true }); const want = L.ents.filter(e => ['check', 'silver', 'sksconce', 'skanchor', 'sksac', 'cryptmother'].includes(e.t));
  const miss = want.filter(e => !reach.jumpNear(e.x, e.y));
  ok(!miss.length, 'the fill (the permissive state) reaches every shrine, silver, sconce, anchor, sac and knot, and the Mother\'s tier' + (miss.length ? ': MISSES ' + JSON.stringify(miss.map(e => [e.t, e.x, e.y])) : '')); }

// ---- THE HANDS, in a fake world ----
const fakeWorld = (L0, heroes, o = {}) => { let cur = null; const log = []; const fx = { L: L0, TS, T, players: () => heroes, enemies: () => fx.ens, ens: [], time: () => 0, number: (x, y, t) => log.push(t), hint: t => log.push('HINT ' + t),
  asPlayer: (p, fn) => { const o2 = cur; cur = p; try { fn(); } finally { cur = o2; } },
  damage: (x, d, op = {}) => { const p = cur; if (!p || p.dead) return null; if (o.block && o.block(p, op)) return 'blocked'; p.hp -= d; p.hits = (p.hits || 0) + 1; p.took = (p.took || []).concat([[op.name || '?', d, !!op.spare]]); if (p.hp <= 0) { if (op.spare) p.hp = 1; else p.dead = true; } return 'hit'; },
  cellSet: (x, y, t) => { L0.grid[y * L0.W + x] = t; }, upright: p => !p.dead, hitOnce: () => true, shake: () => {}, ring: () => {}, log, addFoe: e => fx.ens.push(e),
  hurt: (e, d) => { e.hp -= d; if (e.hp <= 0) e.alive = false; } }; return fx; };
const hero = (x, y, o = {}) => ({ x, y, hp: 400, vx: 0, vy: 0, ground: true, face: 1, ...o });
const at = (col, row) => [col * TS + 8, (row + 1) * TS];
const cell = (L0, x, y) => L0.grid[y * L0.W + x];
const hitAt = (x, y, r = 4) => ({ l: x - r, r: x + r, t: y - r, b: y + r });
{ const L0 = lv.build(), grid0 = Array.from(L0.grid); const P = hero(...at(3, 23)), F = fakeWorld(L0, [P]), G = makeSilkHands(F); G.reset();
  const step = (s, dt = 1 / 60) => { for (let t = 0; t < s; t += dt) G.update(dt); };
  const W = id => L0.sk.walls.find(w => w.id === id), A = id => L0.sk.anchors.find(a => a.id === id);
  ok(L0.sk.walls.every(w => { for (let y = w.y0; y <= w.y1; y++) if (cell(L0, w.x, y) !== T.SOLID) return false; return true; }), 'THE RESET: every sticky wall stands whole (SOLID)');
  ok(A('an1').ramp.every(([x, y]) => cell(L0, x, y) === T.AIR) && A('an1').hold.every(([x, y]) => cell(L0, x, y) === T.ONEWAY), 'and the high bridge hangs high: its ramp cells are AIR until the cut');
  /* ONE REQUIRED USE OF EACH VERB, in the order the road asks them */
  const reach = () => floodReach(L0, T, { rides: true });
  const far = k => { const [x, y] = REQUIRED[k].far; return reach().jumpNear(x, y); };
  { const w0 = L0.sk.webs.find(w => w.id === REQUIRED.bounce.web), keep = []; for (let x = w0.x0; x <= w0.x1; x++) { keep.push(cell(L0, x, w0.y)); L0.grid[w0.y * L0.W + x] = T.SOLID; }
    const without = far('bounce'); for (let x = w0.x0; x <= w0.x1; x++) L0.grid[w0.y * L0.W + x] = keep[x - w0.x0];
    ok(!without && far('bounce'), 'REQUIRED BOUNCE: the crypt door\'s shelf (col ' + REQUIRED.bounce.far[0] + ') is out of reach with the taut web as plain rock, in reach with it'); }
  ok(!reach().jumpNear(56, 28), 'the first sticky wall (col 52) seals the crypt door: nothing past it until it burns');
  const sc0 = L0.sk.sconces[0]; P.x = sc0.x - 6; P.y = sc0.y; G.strike({ l: sc0.x - 4, r: sc0.x + 4, t: sc0.y - 18, b: sc0.y - 10 }, P);
  ok(G.hasTorch(P), 'a SCONCE struck gives the hero a TORCH (' + TORCH.t + ' s)');
  const w0 = W('sw0'); P.hasT = G.hasTorch(P); G.strike({ l: w0.x * TS + 2, r: w0.x * TS + 10, t: 30 * TS, b: 32 * TS }, P); step(0.6);
  ok(cell(L0, w0.x, 20) === T.AIR && G.read().walls[0] === 'gone', 'BURN: a torch-bearer\'s blow burns the sticky wall away (0.5 s)');
  ok(!far('cut') && G.cutAnchor(REQUIRED.cut.anchor) && far('cut'), 'REQUIRED CUT: the gallery ledge (col ' + REQUIRED.cut.far[0] + ') is out of reach with the bridge high, in reach once its stake is cut (the bridge swings down into a ramp)');
  ok(A('an1').hold.every(([x, y]) => cell(L0, x, y) === T.AIR) && A('an1').ramp.every(([x, y]) => cell(L0, x, y) === T.ONEWAY), 'the bridge\'s high cells gone, the ramp\'s real');
  ok(!far('burn') && G.burnWall(REQUIRED.burn.wall) && (step(0.6), far('burn')), 'REQUIRED BURN: the egg gallery\'s sealed tunnel (col ' + REQUIRED.burn.far[0] + ') is out of reach with the wall whole, in reach burned');
  ok(!reach().jumpNear(282, 20), 'the strands\' sticky sheet (col 255) holds the cellar stair shut until it burns');
  G.burnWall('sw2'); step(0.6); ok(reach().jumpNear(282, 20) && reach().jumpNear(313, 19), 'burned, the road runs on to SHRINE TWO and the Mother\'s tier');
  /* walls without a torch */
  G.reset(); P.x = at(50, 32)[0]; P.y = at(50, 32)[1]; G.show().torch.clear(); G.strike({ l: w0.x * TS + 2, r: w0.x * TS + 10, t: 30 * TS, b: 32 * TS }, P); step(0.6);
  ok(cell(L0, w0.x, 20) === T.SOLID, 'struck WITHOUT a torch, sticky silk holds (STUCK, and the hint names the torch)');
  G.giveTorch(P); P.x = w0.x * TS - 4; step(0.7); ok(cell(L0, w0.x, 20) === T.AIR, 'and a torch-bearer who walks into it burns it too');
  G.show().torch.set(P, 0.05); step(0.1); ok(!G.hasTorch(P), 'the torch goes out (told) - relight at any sconce');
  /* the cocoon */
  const c0 = A('an0'); const l1 = { t: 'spider', cnSkin: 'skling', x: at(42, 32)[0], y: 33 * TS, hp: 8, alive: true }, l2 = { t: 'spider', cnSkin: 'skling', x: at(43, 32)[0], y: 33 * TS, hp: 8, alive: true }; F.ens.push(l1, l2);
  G.strike(hitAt(c0.x, c0.y), P); step(1.0);
  ok(!l1.alive && !l2.alive && G.show().n.cocoonHits === 2, 'CUT: the first anchor drops its cocoon on the spiderling pair under it (' + FOE.cocoon + ' each)');
  F.ens.length = 0;
  /* egg sacs */
  const s0 = L0.sk.sacs[0]; G.reset(); P.x = s0.x + 20; P.y = s0.y; step(SAC.linger * 0.6); ok(G.read().sacs[0] === 'whole', 'an EGG SAC pulses while you linger (told)');
  step(SAC.linger); ok(G.read().sacs[0] === 'burst' && F.ens.filter(e => e.cnSkin === 'skling').length === SAC.n, 'linger ' + SAC.linger + ' s and it bursts: ' + SAC.n + ' spiderlings');
  F.ens.length = 0; G.reset(); G.giveTorch(P); P.x = s0.x + 30; G.strike(hitAt(s0.x, s0.y - 6), P); ok(G.read().sacs[0] === 'burned' && !F.ens.length, 'struck with a torch, it BURNS: nothing hatches');
  G.reset(); G.show().torch.clear(); G.strike(hitAt(s0.x, s0.y - 6), P); ok(G.read().sacs[0] === 'burst' && F.ens.length === SAC.n, 'struck without one, it bursts at once'); F.ens.length = 0;
  /* goo */
  const gp = L0.sk.goos[1]; G.reset(); P.x = at(gp.x0 + 2, gp.y)[0]; P.y = at(gp.x0 + 2, gp.y)[1]; P.vx = 92; const foeG = { t: 'spider', cnSkin: 'skling', x: at(gp.x0 + 4, gp.y)[0], y: at(gp.x0 + 4, gp.y)[1], alive: true, hp: 8 }; F.ens.push(foeG);
  step(1 / 60); const fx0 = foeG.x; foeG.x += 20; step(1 / 60);
  ok(Math.abs(P.vx) <= GOO.cap && foeG.x === fx0 && foeG.pinned, 'STICKY GOO slows a hero to ' + GOO.cap + ' and PINS a foe where it stands'); F.ens.length = 0;
  /* the net */
  G.reset(); P.x = at(213, 23)[0]; P.y = at(213, 23)[1]; P.hp = 400; step(0.1); P.x = at(224, 40)[0]; P.y = SK.catchY + 10; step(0.05);
  ok(P.hp === 400 - NET.dmg && Math.abs(P.x - at(213, 23)[0]) < 2 && P.y < SK.catchY, 'THE SILK NET: a fall is caught and put back on the last firm footing for ' + NET.dmg + ' (spare, never a death)');
  /* the reset */
  G.cutAnchor('an1'); G.burnWall('sw1'); step(0.6); G.reset(); const same = L0.grid.every((v, i) => v === grid0[i] || (grid0[i] === T.AIR && v === T.SOLID) || (grid0[i] === T.ONEWAY && v === T.AIR));
  ok(same && A('an1').ramp.every(([x, y]) => cell(L0, x, y) === T.AIR), 'the reset puts the bridge back up and the walls back whole (only those cells ever differ from the built grid)'); }

// ---- THE FOES ----
{ const L0 = lv.build(); const mk = (col, row, o = {}) => { const P = hero(...at(col, row)), F = fakeWorld(L0, [P], o), G = makeSilkHands(F); G.reset(); return { P, F, G }; };
  /* spiderling */
  { const { P, F, G } = mk(100, 17); const e = { t: 'spider', cnSkin: 'skling', x: at(104, 17)[0], y: at(104, 17)[1], alive: true, hp: 15, face: -1 }; F.ens.push(e);
    let told = false; for (let t = 0; t < 2; t += 1 / 60) { G.foe(e, 1 / 60); if (e.mode === 'biteTell') told = true; }
    ok(e.hp === LING.hp && told && P.hp === 400 - LING.dmg * Math.round(P.hits || 0) && P.hits >= 1, 'SPIDERLING (the spider in its skin, ' + LING.hp + ' hp): it skitters in, a told bite (' + LING.tell + ' s, !), ' + LING.dmg + ' a bite (' + (P.hits || 0) + ' in 2 s)'); }
  /* web-spitter */
  { const { P, F, G } = mk(176, 23); const e = { t: 'spider', cnSkin: 'skspitter', x: at(180, 18)[0], y: at(180, 18)[1], alive: true, hp: 15, face: -1 }; F.ens.push(e);
    let told = false; for (let t = 0; t < 2; t += 1 / 60) { G.foe(e, 1 / 60); G.update(1 / 60); if (e.mode === 'spitTell') told = true; }
    ok(told && P.hits >= 1 && P.snare > 0, 'WEB-SPITTER: a told spit (' + SPIT.tell + ' s, !), a slow glob: ' + SPIT.dmg + ' and SNARED (' + (P.snare || 0).toFixed(2) + ' s - mash free: main.js snareTick)'); }
  { const { P, F, G } = mk(176, 23, { block: () => true }); const e = { t: 'spider', cnSkin: 'skspitter', x: at(180, 18)[0], y: at(180, 18)[1], alive: true, hp: 15, face: -1 }; F.ens.push(e);
    for (let t = 0; t < 2; t += 1 / 60) { G.foe(e, 1 / 60); G.update(1 / 60); } ok(!(P.snare > 0) && P.hp === 400, 'a BLOCKED glob: no snare, no hurt'); }
  /* the lurker */
  { const { P, F, G } = mk(69, 28); const sp = L0.ents.find(e => e.t === 'silklurker' && e.squad === 'hallLurker'); const e = G.spawn(sp, { x: sp.x * TS + 8, y: (sp.y + 1) * TS, vx: 0, vy: 0, face: -1, alive: true }); F.ens.push(e);
    const modes = new Set(); let hitAtDrop = 0; for (let t = 0; t < 2.0; t += 1 / 60) { G.foe(e, 1 / 60); modes.add(e.mode); if (e.mode === 'ground' && !hitAtDrop) hitAtDrop = 400 - P.hp; }
    ok(e.hp === LURK.hp && modes.has('threadTell') && modes.has('drop') && hitAtDrop === LURK.dmg, 'THE SILK LURKER (' + LURK.hp + ' hp, the one new foe): its THREAD drops first (' + LURK.tell + ' s, !!), then it drops on you: ' + LURK.dmg);
    P.x += 200; for (let t = 0; t < LURK.ground + 0.3; t += 1 / 60) G.foe(e, 1 / 60);
    ok(e.mode === 'climb', 'it climbs its thread home after ' + LURK.ground + ' s on the floor');
    G.strike({ l: e.x - 3, r: e.x + 3, t: e.y - 40, b: e.y - 20 }, P);
    ok(e.mode === 'fallen' && G.takeFoe(e, 10) === 20, 'CUT ITS THREAD while it climbs: it falls, STUNNED ' + LURK.stun + ' s and x2');
    for (let t = 0; t < LURK.stun + 0.1; t += 1 / 60) G.foe(e, 1 / 60); ok(e.mode === 'climb' && Math.abs(e.y - e.floorY) < 12, 'then it spins a new thread and climbs'); }
  { const { P, F, G } = mk(69, 28); const sp = L0.ents.find(e => e.t === 'silklurker' && e.squad === 'hallLurker'); const e = G.spawn(sp, { x: sp.x * TS + 8, y: (sp.y + 1) * TS, vx: 0, vy: 0, face: -1, alive: true }); F.ens.push(e);
    let t = 0; while (t < 1 && e.mode !== 'threadTell') { G.foe(e, 1 / 60); t += 1 / 60; } P.x += 40; for (let k = 0; k < 1.9; k += 1 / 60) G.foe(e, 1 / 60);
    ok(P.hp === 400 && e.mode === 'ground', 'a hero who steps off the thread when it drops is not hit (the answer is move)'); }
}

// ---- THE CRYPT MOTHER ----
{ const moves = ['spit', 'pounce', 'clutch', 'sweep'];
  ok(moves.every(m => POSE[m + 'Tell'] && POSE[m] && JSON.stringify(POSE[m + 'Tell']) !== JSON.stringify(POSE[m])) && POSE.fallen && POSE.lament && POSE.landed, 'every move has its own windup pose and release pose (B16), and the fall onto her back, the landing, the lament');
  ok(moves.every(m => SOUND[m + 'Tell'] && SOUND[m]) && SOUND.cut && SOUND.collapse && SOUND.flash, 'every move its own sound, and the cut, the flash and the fall of a strand');
  ok(CM.resist >= 0.4 && CM.openMul > 1 && CM.openCap > 0 && CM.aboveMul >= CM.resist, 'B15: x' + CM.resist + ' outside an opening (>= 0.4: never untouchable), x' + CM.openMul + ' in one, capped ' + CM.openCap * 100 + '%, x' + CM.aboveMul + ' from above'); }
function fight({ seed = 1, swing = 40, every = 0.45, cutOn = true, read = 0.7 } = {}) {
  const L0 = lv.build(), A = L0.arena; let rnd = seed; const rand = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  const floorY = A.floor; const P = hero(A.x0 + 3 * TS, floorY, { hp: 640 }), heroes = [P];   /* 640: the bot's health with its flasks drunk (it never drinks: one pool) */
  const F = fakeWorld(L0, heroes, { block: (p, op) => op.blockable && rand() < 0.5 }), G = makeSilkHands(F); G.reset();
  let boss = null; const ctx = { ...F, get L() { return L0; }, get boss() { return boss; }, bossActive: true, EHP: { cryptmother: CM.hp }, sk: () => G, hero: () => P };
  const H = makeCryptMotherHands(ctx);
  const sp = L0.ents.find(e => e.t === 'cryptmother'); boss = H.spawnBoss({ x: sp.x * TS + 8, y: (sp.y + 1) * TS, vx: 0, vy: 0, face: -1, alive: true }); boss.mode = 'wake'; boss.modeT = 1.6;
  const modes = new Set(), S = H.show(); let t = 0, swingT = 0, openDmg = 0, hideDmg = 0, minSecs = 4;
  const dt = 1 / 60;
  while (t < 400 && boss.alive && !P.dead) {
    t += dt; G.update(dt); H.update(boss, dt); modes.add(boss.mode); minSecs = Math.min(minSecs, 4 - S.fallen.size);
    /* THE BOT: it reads her tells (read = the share of tells it answers), climbs to her live knot (abstracted: it is there once under it) and cuts it, then fights her on her back */
    const k = CMM.knotOf(S), canCut = cutOn && CMM.hanging(boss), goal = canCut ? k.x : boss.x - 18;
    if (S.shadow && P.dodgeFor !== S.shadow) { P.dodgeFor = S.shadow; P.dodge = rand() < read ? (Math.sign(P.x - S.shadow.x) || 1) : 0; } if (!S.shadow) P.dodge = 0;   /* it reads the shadow once: step off, or not */
    const dodge = P.dodge && Math.abs(S.shadow.x - P.x) < CM.pounce.w + 8 ? P.dodge : 0;
    const dx = dodge ? dodge * 60 : goal - P.x; P.x += Math.sign(dx) * Math.min(Math.abs(dx), 92 * dt); P.x = Math.max(A.x0 + 10, Math.min(A.x1 - 10, P.x));
    P.ground = !(boss.mode === 'sweepTell' && boss.modeT < 0.15 && rand() < read);   /* it jumps the sweep it read */
    P.y = canCut && Math.abs(goal - P.x) < 20 ? k.y + 10 : floorY;
    { const sec = S.G.secs.find(s => P.x >= s.px0 && P.x < s.px1), gone = sec && S.fallen.has(S.G.secs.indexOf(sec)); if (gone && P.onSec !== sec && P.y === floorY && rand() > read) P.y = SK.catchY + 10; P.onSec = gone ? sec : null; }   /* a fallen strand: it crosses on the tiers, or (misread) drops into the net */
    swingT -= dt; if (swingT <= 0) { swingT = every;
      if (canCut && Math.abs(k.x - P.x) < 20 && Math.abs(boss.x - k.x) < 80) H.strike(hitAt(k.x, k.y), P);   /* it waits on the knot until she walks her line over it */
      for (let i = 0; i < S.sacs.length; i++) if (!S.sacs[i].dead && Math.abs(S.sacs[i].x - P.x) < 30) H.strike(hitAt(S.sacs[i].x, S.sacs[i].y - 6), P);
      if (Math.abs(boss.x - P.x) < 34 && Math.abs(boss.y - P.y) < 40) { const o = CMM.cmOpen(boss), d = H.take(boss, swing, null, P); boss.hp -= d; if (o) openDmg += d; else hideDmg += d; if (boss.hp <= 0) { boss.alive = false; H.end(boss); } } }
  }
  return { won: !boss.alive && !P.dead, t, hpLeft: P.hp, modes, S, H, G, P, openDmg, hideDmg, minSecs, lings: F.ens.length };
}
{ const R = fight(), n = R.S.n;
  ok(R.won, 'THE CRYPT MOTHER, END TO END: the bot wins in ' + R.t.toFixed(0) + ' s with ' + Math.round(R.hpLeft) + ' of 640 health left (hurt by ' + JSON.stringify(Object.fromEntries(Object.entries(R.S.hurt).map(([k, v]) => [k, Math.round(v)]))) + ', ' + R.lings + ' spiderlings hatched, ' + R.G.show().n.caught + ' falls into the net)');
  ok(n.cuts >= 3 && n.openHits > 0 && R.openDmg > R.hideDmg, 'CUT THE KNOT is the key: ' + n.cuts + ' cuts, ' + n.openHits + ' blows landed x2 on her back (' + Math.round(R.openDmg) + ' open vs ' + Math.round(R.hideDmg) + ' through the hide)');
  ok(R.S.ph === 2 && R.modes.has('lament') && n.collapses >= 1 && R.minSecs >= CM.p2.keep, 'P2: the lament at 50%, then SHE CUTS HER OWN STRANDS (' + n.collapses + ' fell, each told ' + CM.p2.flash + ' s; ' + R.minSecs + ' always stood)');
  ok(['spitTell', 'pounceTell', 'clutchTell', 'sweepTell', 'fallen', 'landed', 'climb'].every(m => R.modes.has(m)), 'every move came out of its own windup: ' + [...R.modes].join(' '));
  ok(R.H.read().won, 'the win ends her sacs and globs');
  ok(R.t >= 60 && R.t <= 220, 'the fight runs ' + R.t.toFixed(0) + ' s for a node bot (brief: 90-150 s for a player; the tune lane sets hp at n=6)'); }
{ const R = fight({ cutOn: false }), n = R.S.n;
  ok(n.cuts === 0 && (!R.won || R.t > fight().t), 'without the cut she is a wall of hide: ' + (R.won ? 'won in ' + R.t.toFixed(0) + ' s (slow road)' : 'LOST / out of time at ' + R.t.toFixed(0) + ' s')); }
{ const e = { hp: 3000, maxHp: 3000, mode: 'hang', modeT: 0, x: 500, y: 200 }, S = CMM.newFight(CMM.geom(lv.build()));
  const [d0] = CMM.takeBlow(e, S, 40, { x: 500, y: 400 }), [dA] = CMM.takeBlow(e, S, 40, { x: 500, y: 180 }); e.mode = 'fallen'; e.modeT = 1; const [d1] = CMM.takeBlow(e, S, 40); let sum = 0; for (let i = 0; i < 50; i++) sum += CMM.takeBlow(e, S, 40)[0];
  ok(d0 === 18 && dA === 40 && d1 === 80, 'a 40 blow: ' + d0 + ' through the hide, ' + dA + ' from above while she hangs, ' + d1 + ' on her back');
  ok(sum + d1 <= CM.openCap * 3000 + 50 * 40 * CM.resist + 1, 'an opening is capped at ' + CM.openCap * 100 + '% of her (then x' + CM.resist + ')');
  e.mode = 'hang'; e.hp = 1510; const [d2, w2] = CMM.takeBlow(e, S, 40, { x: 0, y: 999 }); ok(d2 === 10 && w2 === 'HOLDS', 'P1 holds at 50% until her move in hand ends'); }

console.log(bad ? 'FLAG ON: ' + bad + ' FAIL(S)' : 'FLAG ON: all ok');
process.exit(bad ? 1 : 0);
