// tools/ghosttrain.mjs - THE GHOST TRAIN and THE CONDUCTOR (claude/ghosttrain, the opus greybox; Node only, no page).
//   node tools/ghosttrain.mjs          runs BOTH halves, one process after the other (the flag is read when src/level.js is imported):
//     FLAG OFF (this process)          GHOSTTRAIN_SHIPS false and no ?gt: LEVELS, THE HARVEST FAIR and THE HEXED FIELDS are master's (the same signature as master 85d152eb8),
//                                      the road and the old-save rule in src/main.js do nothing (lifted out and run over fake saves), every main.js hook is guarded
//     FLAG ON  (a child: --on)         the road (fair > train > fields, appended), the old saves grandfathered, the build (six sections, START + 2 shrines, no filler),
//                                      the fill reaches every shrine, silver, lamp, pin, lever, brake and the Conductor; THE HANDS in a fake world (lamps and ghosts,
//                                      a tunnel / a bridge / a gust, the points, the wind, a coupling cut, the tracks, an oil lamp, the sparks, the reset);
//                                      THE CONDUCTOR END TO END: a bot fights him with his real moves - the brake's openings (x2), both uncouplings, the firebox, the win
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const ON = process.argv.includes('--on');
if (ON) globalThis.__GT = true;
const { install } = await import('./node-canvas.mjs'); install();
const { LEVELS, T } = await import('../src/level.js');
const { gtOn, GHOSTTRAIN_SHIPS } = await import('../src/gt-flag.js');
const TS = 16;
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8').split('\r').join('');
const main = src('src/main.js');
const h = v => createHash('sha1').update(JSON.stringify(v)).digest('hex').slice(0, 16);
/* THE OLD-SAVE RULE AND THE GATE CLAUSE, lifted out of src/main.js and run over a fake PROG */
const mig = /if \(gtOn\(\) && !PROG\.gtRoadMig\) \{[^\n]*?PROG\.fieldsOpen = 1; \}/.exec(main), lock = /\(lv\.needs && !\(PROG\[lv\.needs\] && PROG\[lv\.needs\]\.cleared\)[^\n]*?&& !q\.get\('unlock'\)\)/.exec(main);
const gateRun = (PROG, on) => { if (mig) new Function('PROG', 'gtOn', mig[0])(PROG, () => on); const q = { get: () => null };
  const locked = id => new Function('lv', 'PROG', 'q', 'return !!' + lock[0])(LEVELS.find(l => l.id === id) || { id, needs: 'fair' }, PROG, q); return { fields: locked('fields'), train: locked('ghosttrain') }; };

if (!ON) {
  console.log('== THE GHOST TRAIN, FLAG OFF (GHOSTTRAIN_SHIPS = ' + GHOSTTRAIN_SHIPS + ')');
  ok(!GHOSTTRAIN_SHIPS && !gtOn(), 'the ship flag is off and nothing turns it on here');
  ok(!LEVELS.some(l => l.id === 'ghosttrain'), 'no LEVELS row');
  ok(LEVELS.find(l => l.id === 'fields').needs === 'fair', 'THE HEXED FIELDS still needs THE HARVEST FAIR');
  /* master 85d152eb8's signature (tools: the same hash over that checkout - see the lane report) */
  const MASTER = { n: 72, levels: 'e1d37b905059043c', fair: 'fde7ef1a81fab817', fields: '7440ffc483b42e4a' };
  const rows = LEVELS.map(l => [l.id, l.needs || null, l.leadsTo || null, !!l.hidden]);
  const b = id => { const L = LEVELS.find(l => l.id === id).build(); return h([L.W, L.H, Array.from(L.grid), L.ents]); };
  const now = { n: LEVELS.length, levels: h(rows), fair: b('fair'), fields: b('fields') };
  ok(JSON.stringify(now) === JSON.stringify(MASTER), 'LEVELS (ids, needs, order), THE HARVEST FAIR and THE HEXED FIELDS are master\'s exactly ' + JSON.stringify(now));
  ok(!!mig && !!lock && /lv\.id === 'fields' && PROG\.fieldsOpen/.test(lock[0]), 'the old-save rule and the gate clause are in src/main.js');
  if (mig && lock) for (const [name, P0] of [['a fresh save', {}], ['the fair cleared', { fair: { cleared: true } }], ['past the fields', { fair: { cleared: true }, fields: { cleared: true } }], ['the theatre only', { theatre: { cleared: true } }]]) {
    const P = JSON.parse(JSON.stringify(P0)), r = gateRun(P, false), want = !(P0.fair && P0.fair.cleared) && !(P0.fields && P0.fields.cleared);
    ok(r.fields === want && !P.gtRoadMig && !P.fieldsOpen, 'flag off, ' + name + ': the fields ' + (want ? 'locked' : 'open') + ' exactly as master, the save untouched ' + JSON.stringify(P)); }
  const tagged = main.split('\n').filter(l => l.includes('(claude/ghosttrain'));
  ok(tagged.length >= 15 && tagged.length <= 22, tagged.length + ' tagged hook lines in src/main.js (single lines)');
  const unguarded = tagged.filter(l => !/gtOn\(\)|GTH|CDH|fieldsOpen|case 'conductor'|LEVELS\.some\(l => l\.id === 'ghosttrain'\)/.test(l));
  ok(!unguarded.length, 'every hook is behind the flag: the road and the old-save rule ask gtOn(), the rest need the level (GTH.on() / its ents / its boss) ' + unguarded.map(l => l.slice(0, 60)).join(' | '));
  ok(/if \(LEVELS\.some\(l => l\.id === 'ghosttrain'\)\) \{ INLAND_NODES\.splice/.test(main), 'the map node and its road vertex go in only while the LEVELS row is there (gtOn() at import)');
  ok(/gtOn\(\) && isDev\(\)/.test(main), 'the dev entry needs ?gt=1 and ?dev=1');
  /* THE OTHER HALF, in its own process (the flag is read on import) */
  const child = spawnSync(process.execPath, ['--import', './tools/gt-on.mjs', fileURLToPath(import.meta.url), '--on'], { cwd: fileURLToPath(new URL('..', import.meta.url)), encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  process.stdout.write(child.stdout || ''); if (child.status !== 0) bad++;
  console.log(bad ? '\nTHE GHOST TRAIN: ' + bad + ' FAIL(S)' : '\nTHE GHOST TRAIN: all ok (flag off and flag on)');
  process.exit(bad ? 1 : 0);
}

// ======================================================================= FLAG ON =======================================================================
console.log('== THE GHOST TRAIN, FLAG ON (globalThis.__GT)');
const { GT, SECTIONS } = await import('../src/ghost-train.js');
const { GT_RULE, GT_SAY, CD_SAY } = await import('../src/gt-lines.js');
const { makeGhostTrainHands, GHOST, MOTION } = await import('../src/ghost-train-hands.js');
const CDM = await import('../src/conductor.js');
const { makeConductorHands, POSE } = await import('../src/conductor-hands.js');
const { floodReach } = await import('../src/reachcore.js');
const { THREAT } = await import('../src/threat.js');
const lv = LEVELS.find(l => l.id === 'ghosttrain');
ok(!!lv && gtOn(), 'the LEVELS row is there with the flag on');
if (!lv) process.exit(1);
// ---- THE ROAD ----
ok(LEVELS[LEVELS.length - 1] === lv, 'APPENDED (saves count levels by index): nothing before it moved');
ok(lv.needs === 'fair' && LEVELS.find(l => l.id === 'fields').needs === 'ghosttrain', 'THE HARVEST FAIR > THE GHOST TRAIN > THE HEXED FIELDS');
ok(lv.rule === GT_RULE && /THE TRAIN NEVER STOPS/.test(lv.rule), 'the rule line: ' + lv.rule);
ok(/GATE = \['ghosttrain'/.test(src('tools/level-quality.mjs')), 'gated by level-quality');
ok(THREAT.gtlamp === 0 && THREAT.gtcoupling === 0 && THREAT.gtpoints === 0 && THREAT.gtbrake === 0 && THREAT.gtghost > 0, 'the threat table knows its machines (0) and its ghosts');
if (mig && lock) {
  const past = gateRun({ fair: { cleared: true }, fields: { cleared: true } }, true), atFair = gateRun({ fair: { cleared: true } }, true), fresh = gateRun({ gtRoadMig: 1, fair: { cleared: true } }, true), done = gateRun({ gtRoadMig: 1, fair: { cleared: true }, ghosttrain: { cleared: true } }, true);
  ok(!past.fields && !past.train, 'an old save already PAST THE FIELDS: the fields stay open, the train is UNLOCKED as an extra ' + JSON.stringify(past));
  ok(!atFair.fields && !atFair.train, 'an old save at the fair (the fields were open): grandfathered once, the train open too ' + JSON.stringify(atFair));
  ok(fresh.fields && !fresh.train, 'a save made on the new road: the train is open and the fields wait for it ' + JSON.stringify(fresh));
  ok(!done.fields, 'the train cleared: the fields open'); }
// ---- THE BUILD ----
const L = lv.build(), W = L.W;
ok(L.ghostTrain && L.W === GT.W && L.H === GT.H, 'the level is src/ghost-train.js (' + L.W + 'x' + L.H + ')');
ok(SECTIONS.length === 6 && SECTIONS.every((s, i) => i === 0 || s[1] === SECTIONS[i - 1][2]) && SECTIONS[5][2] === W, 'six named sections tile it: ' + SECTIONS.map(s => s[0]).join(', '));
const checks = L.ents.filter(e => e.t === 'check').sort((a, b) => a.x - b.x);
ok(checks.length === 2 && checks[0].x === 115 && checks[1].x === 192 && L.checkRun === 200, 'FEWER CHECKPOINTS: START + the dining car (115) + the engine door (192); no filler (checkRun 200) ' + checks.map(c => c.x).join(','));
const full = floodReach(L, T), at = e => full.near(e.x, e.y) || full.jumpNear(e.x, e.y);
{ const want = ['check', 'silver', 'conductor', 'gtlamp', 'gtcoupling', 'gtpoints', 'gtbrake']; const miss = L.ents.filter(e => want.includes(e.t) && !at(e) && !(e.t === 'gtlamp')).map(e => e.t + '@' + e.x + ',' + e.y);
  ok(!miss.length, 'the fill reaches every shrine, silver, pin, lever, brake and the Conductor ' + miss.join(' '));
  const lampMiss = L.gt.lamps.filter(lp => { const tx = Math.floor(lp.x / TS); for (let dx = -1; dx <= 1; dx++) for (let y = Math.floor(lp.y / TS); y <= GT.FLOOR; y++) if (full.near(tx + dx, y) || full.jumpNear(tx + dx, y)) return false; return true; }).map(lp => lp.id);
  ok(!lampMiss.length, 'every lamp hangs over footing a hero reaches (a blow from below or beside it) ' + lampMiss.join(' ')); }
ok(L.gt.couplings.filter(c => !c.arena).length >= 9 && L.gt.points.length === 3 && L.gt.lamps.length >= 18, 'the verbs in number: ' + L.gt.couplings.length + ' couplings (' + L.gt.couplings.filter(c => c.arena).length + ' his), ' + L.gt.points.length + ' points, ' + L.gt.lamps.length + ' lamps, ' + L.gt.zones.length + ' bridge/tunnel zones');
{ const ghosts = L.ents.filter(e => e.t === 'gtghost'), lit = ghosts.filter(e => L.gt.lamps.some(lp => lp.car === e.car && lp.lit && Math.abs(lp.x - (e.x * TS + 8)) <= lp.r));
  ok(ghosts.length >= 20 && lit.length >= 8 && ghosts.length - lit.length >= 8, ghosts.length + ' ghost passengers: ' + lit.length + ' laid in a lamp\'s light (asleep), ' + (ghosts.length - lit.length) + ' in the dark'); }
ok(!L.ents.some(e => /gob|goblin|sprig|hound/.test(e.t)), 'no goblins (and no goblin hounds): ghosts, bone archers, the ride\'s armour, bats, the shy dead');
const roofRowSolid = x => L.grid[GT.ROOF * W + x] === T.SOLID;
ok(L.gt.cars.filter(c => c.closed).every(c => { for (let x = c.body[0]; x <= c.x1; x++) if (!roofRowSolid(x) && !L.gt.hatches.some(hh => x >= hh.x0 && x <= hh.x1) && c.kind !== 'dining') return false; return true; }), 'ROOF OR INSIDE: every closed car has a walkable roof (bar its hatches)');
ok(L.gt.couplings.filter(c => !c.arena).every(c => L.grid[GT.STEP * W + c.g0] === T.ONEWAY && L.grid[GT.FLOOR * W + c.g0] === T.ONEWAY), 'every gangway has its plate (inside) and its step up to the roofs');

// ---- THE HANDS IN A FAKE WORLD ----
const fakeWorld = (L0, heroes) => { let cur = null; const log = []; const fx = { L: L0, TS, T, players: () => heroes, enemies: () => fx.ens, ens: [], time: () => 0, number: (x, y, t) => log.push(t), hint: t => log.push('HINT ' + t),
  asPlayer: (p, fn) => { const o = cur; cur = p; try { fn(); } finally { cur = o; } }, damage: (x, d, o = {}) => { const p = cur; if (!p || p.dead) return null; p.hp -= d; p.hits = (p.hits || 0) + 1; p.took = (p.took || []).concat([[o.name || '?', d, !!o.spare]]); if (p.hp <= 0) { if (o.spare) p.hp = 1; else p.dead = true; } return 'hit'; },
  cellSet: (x, y, t) => { L0.grid[y * L0.W + x] = t; }, moveBody: (b, dx) => { b.x += dx; }, upright: p => !p.dead, hitOnce: () => true, shake: () => {}, ring: () => {}, log }; return fx; };
const hero = (x, y, o = {}) => ({ x, y, hp: 400, vx: 0, vy: 0, ground: true, ducking: false, ...o });
const grid0 = Array.from(L.grid);
{ const P = hero(5 * TS, GT.FLOOR * TS), heroes = [P], F = fakeWorld(L, heroes), G = makeGhostTrainHands(F); G.reset();
  const step = (s, dt = 1 / 60) => { for (let t = 0; t < s; t += dt) { G.update(dt); for (const e of F.ens) if (e.alive) G.ghost(e, dt); } };
  const spawnGhost = e => { const base = { x: e.x * TS + 8, y: (e.y + 1) * TS, vx: 0, vy: 0, face: 1, alive: true }; const g = G.spawn(e, base); F.ens.push(g); return g; };
  const [gSleep, gWake] = L.ents.filter(e => e.t === 'gtghost' && e.car === 0).map(spawnGhost);
  const [lp0, lp1] = L.gt.lamps.filter(lp => lp.car === 0);
  step(0.5);
  ok(G.asleep(gSleep) && gWake.mode !== 'sleep', 'THE LAMPS DECIDE: the guard\'s van ghost under the lit lamp sleeps, the one in the dark wakes (' + gSleep.mode + ' / ' + gWake.mode + ')');
  ok(G.takeGhost(gSleep, 30) === 0 && G.takeGhost(gWake, 30) === 30, 'a sleeping passenger cannot be struck; a woken one can');
  G.strike({ l: lp1.x - 4, r: lp1.x + 4, t: lp1.y - 4, b: lp1.y + 4 }, P); step(GHOST.settle + 0.2);
  ok(lp1.on && G.asleep(gWake), 'a blow on the dark lamp lights it: the woken ghost settles back to sleep');
  G.strike({ l: lp0.x - 4, r: lp0.x + 4, t: lp0.y - 4, b: lp0.y + 4 }, P); step(0.2); step(GHOST.darkFor + GHOST.wake + 0.1);
  ok(!lp0.on && !G.asleep(gSleep), 'a blow on a lit lamp puts it out: its ghost wakes (pick your fights)');
  gSleep.x = P.x + 30; gSleep.y = P.y; const hp0 = P.hp; step(3);
  ok(P.hp < hp0 && P.took.some(t => /GHOST/.test(t[0])), 'a woken ghost drifts to you, tells its grasp (!) and lands it: ' + (hp0 - P.hp));
  // the junction P0, straight on: a tunnel; the draughty lamps of THIRD CLASS go out; on the roof upright = hit, ducked = not, inside = not
  const c2 = L.gt.cars.find(c => c.name === 'THIRD CLASS'), c2l = L.gt.lamps.filter(lp => lp.car === c2.i);
  const roofA = hero(40 * TS, GT.ROOF * TS), roofD = hero(45 * TS, GT.ROOF * TS, { ducking: true }), inside = hero(48 * TS, GT.FLOOR * TS);
  heroes.length = 0; heroes.push(roofA, roofD, inside); F.ens.length = 0; G.reset();
  ok(G.exposed(roofA) && !G.exposed(inside), 'EXPOSED on a roof, not inside');
  const x0 = roofA.x; step(0.5); ok(roofA.x < x0 - 8 && roofD.x === 45 * TS && inside.x === 48 * TS, 'THE WIND pushes a hero standing on a roof toward the back (' + (x0 - roofA.x).toFixed(1) + ' px in 0.5 s); a ducked one braces; inside, none');
  roofA.x = 40 * TS; step(1.0); let r = G.read();
  ok(r.fired.includes('jP0') && r.tun && r.tun.kind === 'tunnel' && r.tun.told, 'P0 left STRAIGHT: crossing col 36 calls TUNNEL AHEAD (told ' + r.tun.tell + ' s: its mouth reaches the lead hero then)');
  step(2.5); r = G.read();
  ok(c2l.every(lp => !lp.on) && r.n.snuffed >= 2, 'the tunnel puts the draughty lamps out (third class: ' + c2l.map(lp => lp.on).join(',') + ')');
  step(6);
  ok(roofA.hits >= 1 && !roofD.hits && !inside.hits, 'the tunnel hits a hero standing on the roof (' + roofA.hits + ' blows), not a ducked one, not one inside');
  // the points: a blow throws them; the branch then calls a GUST, not a tunnel
  heroes.length = 0; const pp = hero(30 * TS, GT.FLOOR * TS); heroes.push(pp); G.reset(); const P0 = L.gt.points.find(p => p.id === 'P0');
  G.strike({ l: P0.x - 4, r: P0.x + 4, t: P0.y - 14, b: P0.y - 6 }, pp); ok(P0.set === 'branch', 'THE POINTS: a blow on the lever throws it to the branch');
  pp.x = 37 * TS; step(0.2); r = G.read(); ok(r.fired.includes('jP0') && !r.tun && r.lastJunction.set === 'branch', 'the branch: no tunnel at the junction');
  step(1.5); ok(G.read().gust, 'the branch\'s open line: a told GUST on the roofs');
  // bridges come round over the coaches while the lead is among them
  pp.x = 60 * TS; G.reset(); step(14); ok(G.read().n.bridges >= 1, 'LOW BRIDGES come round over the passenger cars (' + G.read().n.bridges + ' in 14 s)');
  // a coupling: struck from the car ahead; the car behind (and its dead) left on the line
  heroes.length = 0; const cutter = hero(56 * TS + 6, GT.FLOOR * TS), behind = hero(50 * TS, GT.FLOOR * TS); heroes.push(cutter, behind); G.reset();
  const cp = L.gt.couplings.find(c => c.g1 === 55); const box = { l: cp.pinX - 4, r: cp.pinX + 4, t: cp.pinY - 4, b: cp.pinY + 4 };
  G.strike(box, cutter); ok(!cp.cut && F.log.includes(GT_SAY.friend), 'a coupling with a friend still behind it: A FRIEND IS STILL BACK THERE (it holds)');
  heroes.length = 1; const ghostBehind = spawnGhost({ t: 'gtghost', x: 44, y: 17, car: 2, squad: 'x' });   G.strike(box, { x: 53 * TS }); ok(!cp.cut, 'struck from the car behind: it holds (FROM THE CAR AHEAD)');
  G.strike({ ...box }, cutter); step(MOTION.cutTell + 0.05);
  const c2c = L.gt.cars.find(c => c.name === 'THIRD CLASS'), clear = (c) => { for (let x = c.x0; x <= c.x1; x++) for (let y = 0; y < L.H; y++) if (L.grid[y * W + x] !== 0) return false; return true; };
  ok(cp.cut && clear(c2c) && clear(L.gt.cars[0]) && !ghostBehind.alive, 'struck from the car ahead: THE COUPLING PARTS - every car behind it is left on the line (tiles gone), and the ghost that woke on it with them');
  G.reset(); ok(Array.from(L.grid).every((v, i) => v === grid0[i]), 'a reset puts every car, gangway and board back (the grid is the built grid)');
  // THE TRACKS: never a death
  heroes.length = 0; const faller = hero(19 * TS, GT.catchY + 4, { hp: 10 }); heroes.push(faller); step(0.05);
  ok(!faller.dead && faller.y <= GT.FLOOR * TS && faller.took && faller.took[0][0] === 'THE TRACKS' && faller.took[0][2], 'a fall between the cars: THE TRACKS hurt (spare: never a death) and put you back on the train');
  // an oil lamp: lit, it burns its oil, gutters (told), goes out
  const lp3 = L.gt.lamps.find(lp => lp.oil === 8); G.toggleLamp(lp3); step(8 - MOTION.flicker + 0.1); const fl = lp3.flick; step(MOTION.flicker);
  ok(fl === 1 && !lp3.on, 'a dark coach\'s lamp, lit, burns eight seconds: it GUTTERS (told ' + MOTION.flicker + ' s) and goes out');
  // the stack's sparks over the coal trucks
  heroes.length = 0; const coal = hero(170 * TS, 6 * TS, { ducking: true }); heroes.push(coal); G.reset(); for (const j of ['jP0', 'jP1']) G.show().fired.add(j); const hp1 = coal.hp;   /* (the junctions behind it are long passed) */ step(6);
  ok(coal.hp < hp1 && coal.took.some(t => t[0] === 'SPARKS'), 'THE STACK\'S SPARKS: told red marks, then embers on the coal trucks (' + (hp1 - coal.hp) + ')');
  G.reset(); }

// ---- THE CONDUCTOR: THE NUMBERS ----
const { CD } = CDM;
{ const e = { hp: 1000, maxHp: 1000, mode: 'walk', modeT: 0 }, S = CDM.newFight(CDM.geom(L, TS));
  const [d0] = CDM.takeBlow(e, S, 40); e.mode = 'down'; e.modeT = 2; const [d1] = CDM.takeBlow(e, S, 40);
  ok(Math.abs(d0 - 40 * CD.resist) < 0.01 && CD.resist >= 0.4 && d1 === 80, 'B15: x' + CD.resist + ' outside an opening (>= 0.4: never untouchable), x2 THROWN (' + d0 + ' / ' + d1 + ')');
  for (let i = 0; i < 20; i++) CDM.takeBlow(e, S, 40); ok(S.openDealt <= CD.openCap * e.maxHp + 1e-6, 'one opening is capped at ' + CD.openCap * 100 + '% of him (' + S.openDealt.toFixed(0) + ')');
  e.mode = 'walk'; e.hp = 510; const [d2] = CDM.takeBlow(e, S, 40); ok(d2 <= 10.01, 'P1 cannot pass 50% (the floor holds until his move in hand is done)');
  ok(Object.keys(POSE).filter(k => /Tell$/.test(k)).every(k => POSE[k.replace(/Tell$/, '')] && JSON.stringify(POSE[k]) !== JSON.stringify(POSE[k.replace(/Tell$/, '')])), 'B16: every move has a windup pose and a different release pose: ' + Object.keys(POSE).filter(k => /Tell$/.test(k)).join(', ')); }

// ---- THE CONDUCTOR: END TO END (a bot with a sword; his real moves; the real tiles) ----
function fight({ seed = 1, swing = 40, every = 0.45, useBrake = true, roofTime = 0 } = {}) {
  const L0 = lv.build(), Lg0 = Array.from(L0.grid), A = L0.arena; let rnd = seed; const rand = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  const P = hero((A.x0 / TS + 3) * TS, GT.FLOOR * TS, { hp: 640 }), heroes = [P];   /* 640: the bot's health with its flasks drunk (it never drinks: one pool) */
  const F = fakeWorld(L0, heroes), G = makeGhostTrainHands(F); G.reset();
  let boss = null; const ctx = { ...F, get L() { return L0; }, get boss() { return boss; }, bossActive: true, EHP: { conductor: CD.hp }, gt: () => G, lockX0: x => { lock = x; } }; let lock = A.x0;
  const H = makeConductorHands(ctx); const sp = L0.ents.find(e => e.t === 'conductor'); boss = H.spawnBoss({ x: sp.x * TS + 8, y: (sp.y + 1) * TS, vx: 0, vy: 0, face: -1, alive: true }); boss.mode = 'wake'; boss.modeT = 1.6;
  const modes = []; let last = null, t = 0, swingT = 0, roofLeft = roofTime, openDmg = 0, coatDmg = 0, caught = 0, holesSeen = 0, mended = 0, onVanWhenGone = false;
  const dt = 1 / 60; const S = H.show();
  while (t < 400 && boss.alive && !P.dead) {
    t += dt; G.update(dt); H.update(boss, dt);
    if (boss.mode !== last) { modes.push(boss.mode); last = boss.mode; }
    if (S.holes.some(hh => hh.st === 'open')) holesSeen++;
    /* THE BOT: inside, on the floor of the westmost car still on; it walks to a charged brake, pulls it, and cuts at him while he lies thrown; otherwise it fights him where he is */
    const live = CDM.liveCars(S), floorY = GT.FLOOR * TS; if (P.y > GT.catchY) { /* G catches it next frame */ }
    if (roofLeft > 0) { roofLeft -= dt; P.y = GT.ROOF * TS; } else if (P.y < floorY - 2 || P.y > floorY + 2) { if (P.y <= GT.catchY) P.y = floorY; }
    const brake = S.press >= 1 && useBrake && !CDM.cdOpen(boss) && S.ph >= 1 ? S.G.brakes.filter(b => CDM.brakeLive(S, b)).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0] : null;
    const goal = brake ? brake.x : boss.x - 18;
    const tell = /Tell$/.test(boss.mode) && Math.abs(boss.x - P.x) < 50 && rand() < 0.5;   /* it steps back from half his tells */
    const dx = (tell ? P.x - boss.x : goal - P.x); P.x += Math.sign(dx) * Math.min(Math.abs(dx), 92 * dt); P.x = Math.max(lock + 10, P.x);
    if (brake && Math.abs(brake.x - P.x) < 6) H.strike({ l: brake.x - 4, r: brake.x + 4, t: brake.y - 4, b: brake.y + 4 });
    if (boss.mode === 'blastTell' && boss.modeT < 0.25 && !P.jumpT && rand() < 0.7) P.jumpT = 0.7; if (P.jumpT > 0) { P.jumpT -= dt; P.y = floorY - 40; if (P.jumpT <= 0) { P.jumpT = 0; P.y = floorY; } }   /* it jumps most firebox jets */
    swingT -= dt; if (swingT <= 0 && Math.abs(boss.x - P.x) < 30) { swingT = every; const o = CDM.cdOpen(boss), d = H.take(boss, swing); boss.hp -= d; if (o) openDmg += d; else coatDmg += d; if (boss.hp <= 0) { boss.alive = false; H.end(boss); } }
    if (S.gone.length && !onVanWhenGone) onVanWhenGone = S.gone.some(i => { const c = L0.gt.cars[i]; return P.x >= c.x0 * TS && P.x <= (c.x1 + 1) * TS; });
  }
  void Lg0; void caught; void mended;
  return { won: !boss.alive && !P.dead, t, hpLeft: P.hp, modes, S, H, G, L0, Lg0, openDmg, coatDmg, holesSeen, P };
}
{ const R = fight();
  const S = R.S, n = S.n;
  ok(R.won, 'THE CONDUCTOR, END TO END: the bot wins in ' + R.t.toFixed(0) + ' s with ' + Math.round(R.hpLeft) + ' of 640 health left (hurt by ' + JSON.stringify(Object.fromEntries(Object.entries(S.hurt).map(([k, v]) => [k, Math.round(v)]))) + ')');
  ok(n.brakes >= 2 && n.opens >= 2 && n.openHits > 0, 'THE EMERGENCY BRAKE is the key: ' + n.brakes + ' pulls, ' + n.opens + ' openings (THROWN), ' + n.openHits + ' blows landed x2');
  ok(R.openDmg > 0.3 * (R.openDmg + R.coatDmg), 'the openings carry the fight: ' + Math.round(R.openDmg) + ' dealt open vs ' + Math.round(R.coatDmg) + ' through his coat');
  ok(S.gone.length === 2 && n.uncouples === 2, 'UNCOUPLING: both vans left on the line (the arena shrinks to the tender and the engine)');
  { const L0 = R.L0, vA = L0.gt.cars[L0.arena.cars[0]], vB = L0.gt.cars[L0.arena.cars[1]]; let empty = true; for (const c of [vA, vB]) for (let x = c.x0; x <= c.x1; x++) for (let y = 0; y < L0.H; y++) if (L0.grid[y * L0.W + x] !== 0) empty = false;
    ok(empty, 'the vans\' tiles are gone with them'); }
  ok(S.ph === 2 && n.fused >= 1 && R.modes.includes('fuse') && R.modes.includes('glide'), 'P2: at 50% he rises, glides to the engine and FUSES WITH THE FIREBOX');
  ok(n.blasts >= 1 && n.sparks >= 1, 'P2 moves: the firebox jet (' + n.blasts + '), the stack\'s sparks (' + n.sparks + '), the fire reaching (' + n.grasps + ')');
  ok(n.punches >= 1 && n.holes >= 1 && R.holesSeen > 0 && n.tunnels >= 1, 'P1 moves: the ticket punch (' + n.punches + ', ' + n.holes + ' sets of holes - the boards went), TUNNEL AHEAD (' + n.tunnels + '), the lantern (' + n.swings + ')');
  const told = ['swing', 'punch', 'blast', 'sparks', 'grasp'].every(m => R.modes.every((md, i) => md !== m || R.modes[i - 1] === m + 'Tell'));
  ok(told, 'B16: every blow he lands came out of its own told windup (' + [...new Set(R.modes)].join(' ') + ')');
  ok(S.won && S.holes.length === 0 && !S.tunnel, 'THE WIN EXIT: his end clears his holes, tunnel and fire (S.won); main.js then credits the level (winLevel, the generic boss kill)');
  { const L0 = R.L0; R.G.reset(); ok(Array.from(L0.grid).every((v, i) => v === R.Lg0[i]), 'a retry (reset) puts the vans and every punched board back'); }
  ok(/case 'conductor': \{ shakeCam\(9\)[^\n]*CDH\.end\(e\)/.test(main), 'his death line in src/main.js (the fire goes out, CDH.end)'); }
{ const R = fight({ useBrake: false });
  ok(!R.won || R.t > fight().t + 20, 'without the brake he is a long slog through his coat (' + (R.won ? 'won in ' + R.t.toFixed(0) + ' s' : 'the bot lost / ran out of time') + '): the brake is the key'); }
{ const R = fight({ roofTime: 30 });
  ok(R.S.n.tunnelHits >= 1, 'a hero who stays on the roofs is caught by TUNNEL AHEAD (' + R.S.n.tunnelHits + ' blows)'); }
console.log(bad ? '  -- flag-on half: ' + bad + ' FAIL(S)' : '  -- flag-on half: all ok');
process.exit(bad ? 1 : 0);
