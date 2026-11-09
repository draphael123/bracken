// tools/tourney.mjs - THE TOURNEY and THE CHAMPION (claude/tourney, the opus greybox; Node only, no page).
//   node tools/tourney.mjs             runs BOTH halves, one process after the other (the flag is read when src/level.js is imported):
//     FLAG OFF (this process)          TOURNEY_SHIPS false and no ?ty: LEVELS, WAYMEET and THE TOWPATH are master's (the same signature as master 85d152eb8),
//                                      the road and the old-save rule in src/main.js do nothing (lifted out and run over fake saves), every main.js hook is guarded
//     FLAG ON  (a child: --on)         the road (waymeet > tourney > towpath, appended), the old saves grandfathered, the build (six sections, START + 2 shrines,
//                                      no filler, about half of it mounted), the fill reaches every shrine, silver, ring, target, quintain and the Champion;
//                                      THE HANDS in a fake world (the horse on the cart's pace model, a hurdle, the couch and the tired arm, rings, targets,
//                                      the quintain's sweep / carry / duck, a lancer and a horse archer unhorsed, the archer's arrows, the arena's two-way ride);
//                                      THE CHAMPION END TO END: a bot rides the joust (couch timing), stops a squire, fights him on foot, wins
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const ON = process.argv.includes('--on');
if (ON) globalThis.__TY = true;
const { install } = await import('./node-canvas.mjs'); install();
const { LEVELS, T } = await import('../src/level.js');
const { tyOn, TOURNEY_SHIPS } = await import('../src/ty-flag.js');
const TS = 16;
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8').split('\r').join('');
const main = src('src/main.js');
const h = v => createHash('sha1').update(JSON.stringify(v)).digest('hex').slice(0, 16);
/* THE OLD-SAVE RULE AND THE GATE CLAUSE, lifted out of src/main.js and run over a fake PROG */
const mig = /if \(tyOn\(\) && !PROG\.tyRoadMig\) \{[^\n]*?PROG\.towpathOpen = 1; \}/.exec(main), lock = /\(lv\.needs && !\(PROG\[lv\.needs\] && PROG\[lv\.needs\]\.cleared\)[^\n]*?&& !q\.get\('unlock'\)\)/.exec(main);
const gateRun = (PROG, on) => { if (mig) new Function('PROG', 'tyOn', mig[0])(PROG, () => on); const q = { get: () => null };
  const locked = id => new Function('lv', 'PROG', 'q', 'return !!' + lock[0])(LEVELS.find(l => l.id === id) || { id, needs: 'waymeet' }, PROG, q); return { towpath: locked('towpath'), tourney: locked('tourney') }; };

if (!ON) {
  console.log('== THE TOURNEY, FLAG OFF (TOURNEY_SHIPS = ' + TOURNEY_SHIPS + ')');
  ok(!TOURNEY_SHIPS && !tyOn(), 'the ship flag is off and nothing turns it on here');
  ok(!LEVELS.some(l => l.id === 'tourney'), 'no LEVELS row');
  ok(LEVELS.find(l => l.id === 'towpath').needs === 'waymeet', 'THE TOWPATH still needs WAYMEET');
  /* master 85d152eb8's signature: the same hash taken over a `git archive 85d152eb8` export (see the lane report) */
  const MASTER = { n: 72, levels: 'e1d37b905059043c', waymeet: 'cb7f31f5b9bf6ca7', towpath: 'bcb6be181c10176c' };
  const rows = LEVELS.map(l => [l.id, l.needs || null, l.leadsTo || null, !!l.hidden]);
  const b = id => { const L = LEVELS.find(l => l.id === id).build(); return h([L.W, L.H, Array.from(L.grid), L.ents]); };
  const now = { n: LEVELS.length, levels: h(rows), waymeet: b('waymeet'), towpath: b('towpath') };
  ok(JSON.stringify(now) === JSON.stringify(MASTER), 'LEVELS (ids, needs, order), WAYMEET and THE TOWPATH are master\'s exactly ' + JSON.stringify(now));
  ok(!!mig && !!lock && /lv\.id === 'towpath' && PROG\.towpathOpen/.test(lock[0]), 'the old-save rule and the gate clause are in src/main.js');
  if (mig && lock) for (const [name, P0] of [['a fresh save', {}], ['Waymeet cleared', { waymeet: { cleared: true } }], ['past the towpath', { waymeet: { cleared: true }, towpath: { cleared: true } }], ['the canal only', { canal: { cleared: true } }]]) {
    const P = JSON.parse(JSON.stringify(P0)), r = gateRun(P, false), want = !(P0.waymeet && P0.waymeet.cleared) && !(P0.towpath && P0.towpath.cleared);
    ok(r.towpath === want && !P.tyRoadMig && !P.towpathOpen, 'flag off, ' + name + ': the towpath ' + (want ? 'locked' : 'open') + ' exactly as master, the save untouched ' + JSON.stringify(P)); }
  const tagged = main.split('\n').filter(l => l.includes('(claude/tourney'));
  ok(tagged.length >= 18 && tagged.length <= 26, tagged.length + ' tagged hook lines in src/main.js (single lines)');
  const unguarded = tagged.filter(l => !/tyOn\(\)|TYH|CPH|towpathOpen|TY_NODE|case 'tyarcher'|case 'tychampion'|LEVELS\.some\(l => l\.id === 'tourney'\)/.test(l));
  ok(!unguarded.length, 'every hook is behind the flag: the road and the old-save rule ask tyOn(), the rest need the level (TYH.on() / its ents / its boss) ' + unguarded.map(l => l.slice(0, 60)).join(' | '));
  ok(/if \(LEVELS\.some\(l => l\.id === 'tourney'\)\) \{ INLAND_NODES\.splice/.test(main), 'the map node and its road vertex go in only while the LEVELS row is there (tyOn() at import)');
  ok(/tyOn\(\) && isDev\(\)/.test(main), 'the dev entry needs ?ty=1 and ?dev=1');
  ok(/const mt = TYH\.mounted\(P\); TYH\.couch\(P, mt && !!keys\.atk\)/.test(main) && /if \(TYH && TYH\.on\(\) && TYH\.mounted\(P\)\) \{ P\.atkHeld = 0; P\.charge = 0; return; \}/.test(main), 'THE COUCH: the held attack is read while mounted, and never winds a heavy in the saddle');
  /* THE OTHER HALF, in its own process (the flag is read on import) */
  const child = spawnSync(process.execPath, ['--import', './tools/ty-on.mjs', fileURLToPath(import.meta.url), '--on'], { cwd: fileURLToPath(new URL('..', import.meta.url)), encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  process.stdout.write(child.stdout || ''); if (child.status !== 0) bad++;
  console.log(bad ? '\nTHE TOURNEY: ' + bad + ' FAIL(S)' : '\nTHE TOURNEY: all ok (flag off and flag on)');
  process.exit(bad ? 1 : 0);
}

// ======================================================================= FLAG ON =======================================================================
console.log('== THE TOURNEY, FLAG ON (globalThis.__TY)');
const { TY, SECTIONS, RIDES } = await import('../src/tourney.js');
const { TY_RULE, TY_SAY, CH_SAY } = await import('../src/ty-lines.js');
const { makeTourneyHands, HORSE, LANCE, QUINT, ARCHER } = await import('../src/tourney-hands.js');
const TCM = await import('../src/ty-champion.js');
const { makeChampionHands, POSE } = await import('../src/ty-champion-hands.js');
const { MC } = await import('../src/minecart.js');
const { floodReach } = await import('../src/reachcore.js');
const { THREAT } = await import('../src/threat.js');
const { MARK, ANSWER, HEIGHT } = await import('../src/marks.js');
const lv = LEVELS.find(l => l.id === 'tourney');
ok(!!lv && tyOn(), 'the LEVELS row is there with the flag on');
if (!lv) process.exit(1);
// ---- THE ROAD ----
ok(LEVELS[LEVELS.length - 1] === lv, 'APPENDED (saves count levels by index): nothing before it moved');
ok(lv.needs === 'waymeet' && LEVELS.find(l => l.id === 'towpath').needs === 'tourney', 'WAYMEET > THE TOURNEY > THE TOWPATH');
ok(lv.rule === TY_RULE && /MEET THE LANCE, OR LEAVE THE LANE/.test(lv.rule), 'the rule line: ' + lv.rule);
ok(/GATE = \['tourney'/.test(src('tools/level-quality.mjs')), 'gated by level-quality');
ok(['tyquint', 'tyring', 'tytarget', 'tyhorse', 'tygroom', 'tyhurdle'].every(k => THREAT[k] === 0) && THREAT.tyarcher > 0 && THREAT.tychampion > 0, 'the threat table knows its machines (0), the horse archer and the Champion');
ok(MARK['tyarcher|drawTell'] === '!' && ANSWER['tyarcher|drawTell'] === 'block' && HEIGHT['tyarcher|drawTell'] === 'low', 'the horse archer\'s draw wears a yellow ! (block it; a duck does not slip an aimed arrow)');
if (mig && lock) {
  const past = gateRun({ waymeet: { cleared: true }, towpath: { cleared: true } }, true), atW = gateRun({ waymeet: { cleared: true } }, true), fresh = gateRun({ tyRoadMig: 1, waymeet: { cleared: true } }, true), done = gateRun({ tyRoadMig: 1, waymeet: { cleared: true }, tourney: { cleared: true } }, true);
  ok(!past.towpath && !past.tourney, 'an old save already PAST THE TOWPATH: the towpath stays open, the tourney is UNLOCKED as an extra ' + JSON.stringify(past));
  ok(!atW.towpath && !atW.tourney, 'an old save at Waymeet (the towpath was open): grandfathered once, the tourney open too ' + JSON.stringify(atW));
  ok(fresh.towpath && !fresh.tourney, 'a save made on the new road: the tourney is open and the towpath waits for it ' + JSON.stringify(fresh));
  ok(!done.towpath, 'the tourney cleared: the towpath opens'); }
// ---- THE BUILD ----
const L = lv.build(), W = L.W;
ok(L.tourney && L.W === TY.W && L.H === TY.H, 'the level is src/tourney.js (' + L.W + 'x' + L.H + ')');
ok(SECTIONS.length === 6 && SECTIONS.every((s, i) => i === 0 || s[1] === SECTIONS[i - 1][2]) && SECTIONS[5][2] === W, 'six named sections tile it: ' + SECTIONS.map(s => s[0]).join(', '));
const checks = L.ents.filter(e => e.t === 'check').sort((a, b) => a.x - b.x);
ok(checks.length === 2 && checks[0].x === 172 && checks[1].x === 296 && L.checkRun === 200, 'FEWER CHECKPOINTS: START + the grandstand (172) + the pavilions (296); no filler (checkRun 200) ' + checks.map(c => c.x).join(','));
const runEnd = TY.arena.x0, mountedCols = RIDES.filter(r => !r.arena).reduce((n, r) => n + (r.x1 - r.x0), 0);
ok(mountedCols / runEnd > 0.45 && mountedCols / runEnd < 0.65, 'ABOUT HALF THE LEVEL ON HORSEBACK (Q5 = C): ' + mountedCols + ' of ' + runEnd + ' run columns mounted (' + Math.round(mountedCols / runEnd * 100) + '%), on-foot stretches between, and the joust');
const full = floodReach(L, T), at = e => full.near(e.x, e.y) || full.jumpNear(e.x, e.y);
{ const want = ['check', 'silver', 'tychampion', 'tyquint', 'tyring', 'tytarget', 'tyhorse', 'coin']; const miss = L.ents.filter(e => want.includes(e.t) && !at(e)).map(e => e.t + '@' + e.x + ',' + e.y);
  ok(!miss.length, 'the fill reaches every shrine, silver, coin, ring, target, quintain, horse and the Champion ' + miss.join(' ')); }
{ const loft = L.ents.find(e => e.t === 'silver' && e.x === 41), nest = L.ents.find(e => e.t === 'silver' && e.x === 284), plain = floodReach({ ...L, strikers: [] }, T);
  ok(loft && nest && !(plain.near(loft.x, loft.y) || plain.jumpNear(loft.x, loft.y)) && !(plain.near(nest.x, nest.y) || plain.jumpNear(nest.x, nest.y)), 'THE CARRY IS LOAD-BEARING: both silvers (the stable loft, the crow\'s nest) are reached only on a quintain\'s arm'); }
ok(L.ty.quints.length >= 4 && L.ty.rings.length >= 5 && L.ty.targets.length >= 4 && L.ty.hurdles.length >= 4 && L.ty.lanes.length >= 4 && L.zipLines.length >= 3, 'the verbs in number: ' + L.ty.lanes.length + ' tilt lanes, ' + L.ty.quints.length + ' quintains, ' + L.ty.rings.length + ' rings, ' + L.ty.targets.length + ' targets, ' + L.ty.hurdles.length + ' hurdles, ' + L.zipLines.length + ' rigging lines');
ok(L.ty.rails.every(r => { for (let x = r.x0; x <= r.x1; x++) { const inGap = r.gap && x >= r.gap[0] && x <= r.gap[1]; if ((L.grid[r.row * W + x] === T.ONEWAY) === inGap) return false; } return true; }) && L.ty.rails.every(r => r.row === TY.G - 2), 'LEAVE THE LANE: every tilt rail is a one-way rail two rows up (over a lance) with the herald\'s gate in it');
ok(!L.ents.some(e => /gob|goblin|sprig|hound|soldier|javelin|archer$/.test(e.t) && e.t !== 'tyarcher'), 'no goblins (and no goblin soldiers): a lancer, sworn swords, hedge knights, crossbowmen, horse archers');
ok(new Set(L.ents.filter(e => e.t === 'tyarcher' || e.t === 'tychampion').map(e => e.t)).size === 2 && !L.ents.some(e => /^ty/.test(e.t) && !['tyquint', 'tyring', 'tytarget', 'tyhorse', 'tygroom', 'tyhurdle', 'tyarcher', 'tychampion'].includes(e.t)), 'ONE NEW FOE (Q4 = A): the horse archer; everything else of the tourney\'s own is a machine');

// ---- THE HANDS IN A FAKE WORLD ----
const fakeWorld = (L0, heroes, o = {}) => { let cur = null; const log = []; const fx = { L: L0, TS, T, players: () => heroes, enemies: () => fx.ens, ens: [], time: () => 0, number: (x, y, t) => log.push(t), hint: t => log.push('HINT ' + t),
  asPlayer: (p, fn) => { const o0 = cur; cur = p; try { fn(); } finally { cur = o0; } },
  damage: (x, d, op = {}) => { const p = cur; if (!p || p.dead) return null; if (p.block && !op.unblockable) { p.blocked = (p.blocked || 0) + 1; return 'blocked'; } p.hp -= d; p.hits = (p.hits || 0) + 1; p.took = (p.took || []).concat([[op.name || '?', d]]); if (p.hp <= 0) p.dead = true; return 'hit'; },
  moveBody: (b, dx, dy) => { b.x += dx; const fy = groundY(L0, b.x, b.y); if (b.y + dy >= fy) { b.y = fy; return { ground: true }; } b.y += dy; return {}; },
  solidAt: (x, y) => { const tx = Math.floor(x / TS), ty = Math.floor(y / TS); return tx < 0 || ty < 0 || tx >= L0.W || ty >= L0.H ? true : L0.grid[ty * L0.W + tx] === T.SOLID; },
  upright: p => !p.dead, hitOnce: () => true, shake: () => {}, swordDmg: () => 30, hurt: (e, d, fx0) => { fx.hurts = (fx.hurts || 0) + 1; e.hp -= d; if (e.hp <= 0) e.alive = false; },
  unhorse: e => { e.mounted = false; e.mode = 'unhorsed'; fx.unhorsed = (fx.unhorsed || 0) + 1; }, loose: () => {}, coins: (x, y, n) => { fx.coinsGiven = (fx.coinsGiven || 0) + n; }, arenaMounted: () => (o.arenaMounted ? o.arenaMounted() : true), log, ...o }; return fx; };
const groundY = (L0, x, y) => { const tx = Math.floor(x / TS); for (let ty = Math.max(0, Math.floor((y - 2) / TS)); ty < L0.H; ty++) { const t = L0.grid[ty * L0.W + tx]; if (t === T.SOLID || t === T.ONEWAY) return ty * TS; } return L0.H * TS; };
const hero = (x, y, o = {}) => ({ x, y, hp: 400, maxHp: 400, vx: 0, vy: 0, face: 1, ground: true, ducking: false, ...o });
const NOKEY = {}, RIGHT = { right: true }, LEFT = { left: true };
{ const P = hero(50 * TS, TY.G * TS), heroes = [P], F = fakeWorld(L, heroes), G = makeTourneyHands(F); G.reset();
  const ride = (s, keys = NOKEY, atk = false, dt = 1 / 60) => { for (let t = 0; t < s; t += dt) { G.couch(P, atk && G.mounted(P)); G.drive(P, dt, keys); P.x += P.vx * dt; P.y = groundY(L, P.x, P.y); G.update(dt); for (const e of F.ens) if (e.alive && e.t === 'tyarcher') G.archer(e, dt); } };
  // THE HORSE: the minecart's pace model
  ride(1.2); ok(G.mounted(P) && Math.abs(G.pace(P) - MC.cruise) < 1 && P.face === 1, 'THE HORSE: in THE PRACTICE LISTS he is mounted; nothing held = a TROT at the cart\'s cruise (' + G.pace(P).toFixed(0) + ' px/s), facing down the lists');
  P.x = 50 * TS; ride(1.0, RIGHT); const gal = G.pace(P); P.x = 50 * TS; ride(2.0, LEFT); const walk = G.pace(P);
  ok(Math.abs(gal - MC.boost) < 1 && Math.abs(walk - MC.crawl) < 1, 'RIGHT = a GALLOP (' + gal.toFixed(0) + '), LEFT = rein to a WALK (' + walk.toFixed(0) + ') - never a stop, never back (src/minecart.js cartSpeed: the shared vehicle code)');
  // a hurdle ridden into
  P.x = 62 * TS; P.y = TY.G * TS; P.hp = 400; ride(1.2); ok(P.took && P.took.some(t => t[0] === 'THE HURDLE') && P.x < 64 * TS, 'A HURDLE not jumped: the horse BALKS (told), a bump (' + HORSE.bumpDmg + ') and a bounce back');
  // THE COUCH
  P.x = 50 * TS; P.took = []; ride(0.1, RIGHT, true); const early = G.couched(P); ride(0.2, RIGHT, true); const down = G.couched(P); ride(LANCE.hold + 0.1, RIGHT, true); const tired = !G.couched(P) && P.tyLance.tired > 0; ride(0.3, RIGHT, true); const still = !G.couched(P);
  ok(!early && down && tired && still, 'THE COUCH: hold attack - it lowers after ' + LANCE.lower + ' s, holds ' + LANCE.hold + ' s, then THE ARM TIRES (' + LANCE.tired + ' s up, held or not): the couch is timed');
  ride(0.1); ride(LANCE.tired + 0.1);
  // a RING and a TARGET at a gallop, couched
  const r0 = L.ty.rings[0]; P.x = r0.x - 120; P.tyHorse.v = MC.boost; ride(0.3, RIGHT, true); ride(0.5, RIGHT, true);
  ok(G.read().rings.includes(r0.id) && F.coinsGiven > 0, 'A RING taken on the couched lance at the gallop (coins)');
  ride(0.1); ride(LANCE.tired); const r1 = L.ty.rings[1]; P.x = r1.x - 120; P.tyHorse.v = MC.crawl; ride(0.3, LEFT, true); ride(0.6, LEFT, true);
  ok(!G.read().rings.includes(r1.id), 'at a walk the lance takes nothing (' + MC.crawl + ' < ' + LANCE.pace + ' px/s): you have to be moving');
  // THE QUINTAIN: on foot (the gate meadow): upright = hit and flung; ducked = it passes over; braced = carried, no hurt
  const q0 = L.ty.quints[0];
  for (const [name, o] of [['upright', {}], ['ducked', { ducking: true }], ['braced', { block: true }]]) { const p = hero(q0.x - 14, q0.y, o); heroes.length = 0; heroes.push(p); G.reset();
    G.strike({ l: q0.x - 12, r: q0.x - 2, t: q0.y - 26, b: q0.y - 14 }, p); for (let t = 0; t < QUINT.tell + QUINT.sweep + 0.05; t += 1 / 60) G.update(1 / 60);
    const flung = p.vy < -300, hurt = (p.took || []).some(t => t[0] === 'THE QUINTAIN');
    ok(name === 'upright' ? hurt && flung : name === 'ducked' ? !hurt && !flung : !hurt && flung, 'THE QUINTAIN, struck: its arm comes round told (' + QUINT.tell + ' s) - ' + name + ': ' + (hurt ? 'hit ' : 'not hit ') + (flung ? '+ CARRIED up (vy ' + p.vy + ')' : '(it passes over)')); }
  { const q1 = L.ty.quints.find(q => q.mounted), p = hero(q1.x - 80, q1.y); heroes.length = 0; heroes.push(p); G.reset(); P.tyHorse = null;
    const step = (s, atk) => { for (let t = 0; t < s; t += 1 / 60) { G.couch(p, atk); G.drive(p, 1 / 60, RIGHT); p.x += p.vx / 60; G.update(1 / 60); } };
    step(0.4, false); p.tyHorse.v = MC.boost; step(0.25, true); step(0.9, true);
    ok(G.read().n.spins >= 1 && !(p.took || []).some(t => t[0] === 'THE QUINTAIN'), 'a quintain at the GALLOP, couched: it spins and you are past before the arm comes round'); }
  // a LANCER and a HORSE ARCHER unhorsed by the couched lance
  { const p = hero(105 * TS, TY.G * TS); heroes.length = 0; heroes.push(p); G.reset(); F.ens.length = 0; F.unhorsed = 0;
    const lancer = { t: 'lancer', x: 110 * TS, y: TY.G * TS, w: 22, h: 30, hp: 120, alive: true, mounted: true, face: -1 }; F.ens.push(lancer);
    for (let t = 0; t < 2; t += 1 / 60) { G.couch(p, t > 0.3); G.drive(p, 1 / 60, RIGHT); p.x += p.vx / 60; G.update(1 / 60); if (!lancer.mounted) break; }
    ok(F.unhorsed === 1 && lancer.hp < 120, 'A LANCER in the list, couched at: UNHORSED (main.js\'s own unhorse) and hurt (' + (120 - lancer.hp) + ' = sword x ' + LANCE.k + ')'); }
  { const p = hero(160 * TS, TY.G * TS, { hp: 400 }); heroes.length = 0; heroes.push(p); G.reset(); F.ens.length = 0;
    const ae = L.ents.find(e => e.t === 'tyarcher' && e.squad === 'firstArcher'), a = G.spawn(ae, { x: ae.x * TS + 8, y: (ae.y + 1) * TS, vx: 0, vy: 0, face: -1, alive: true }); F.ens.push(a);
    const xs = []; for (let t = 0; t < 6; t += 1 / 60) { G.archer(a, 1 / 60); G.update(1 / 60); xs.push(a.x); }
    ok(Math.max(...xs) - Math.min(...xs) > 6 * TS && G.read().n.arrows >= 2 && (p.took || []).some(t => t[0] === 'A HORSE ARCHER'), 'THE HORSE ARCHER circles his beat (' + ((Math.max(...xs) - Math.min(...xs)) / TS).toFixed(0) + ' cols), draws told (!) and looses aimed arrows: ' + G.read().n.arrows + ' loosed, ' + G.read().n.arrowHits + ' hit');
    p.block = true; const h0 = p.hp, b0 = p.blocked || 0; for (let t = 0; t < 5; t += 1 / 60) { G.archer(a, 1 / 60); G.update(1 / 60); } ok(p.hp === h0 && (p.blocked || 0) > b0, 'his arrow is turned by the shield');
    ok(G.takeArcher(a, 30) === 18, 'in the saddle his barding takes x' + ARCHER.barding);
    G.unhorseArcher(a); ok(!a.mounted && G.takeArcher(a, 30) === 30 && a.h === ARCHER.footH, 'the couched lance UNHORSES him: on foot, a full blow lands');
    p.block = false; const n0 = G.read().n.arrows; for (let t = 0; t < 6; t += 1 / 60) { G.archer(a, 1 / 60); G.update(1 / 60); } ok(G.read().n.arrows > n0, 'and he shoots on from his feet'); }
  // OUT OF THE RIDE: on foot (the groom), and THE CHAMPION'S LISTS two-way
  { const p = hero(118.5 * TS, TY.G * TS); heroes.length = 0; heroes.push(p); G.reset(); for (let t = 0; t < 1; t += 1 / 60) { G.drive(p, 1 / 60, NOKEY); p.x += p.vx / 60; } ok(!G.mounted(p) && p.x > 119 * TS, 'past the groom (col 119): ON FOOT again'); }
  { let on = true; const p = hero(330 * TS, TY.G * TS), F2 = fakeWorld(L, [p], { arenaMounted: () => on }), G2 = makeTourneyHands(F2); G2.reset();
    const go = (s, k) => { for (let t = 0; t < s; t += 1 / 60) { G2.drive(p, 1 / 60, k); p.x += p.vx / 60; } };
    go(1, LEFT); const l = G2.pace(p); go(1.2, NOKEY); const stop = G2.pace(p); go(1, RIGHT); const r = G2.pace(p); on = false; go(0.1, NOKEY);
    ok(l < -200 && Math.abs(stop) < 1 && r > 200 && !G2.mounted(p), 'THE CHAMPION\'S LISTS: two-way (LEFT ' + l.toFixed(0) + ', nothing pulls up to ' + stop.toFixed(0) + ', RIGHT ' + r.toFixed(0) + '); when he is unhorsed your horse is led off'); }
}

// ---- THE CHAMPION: THE NUMBERS ----
const { TC } = TCM;
{ const e = { hp: 1000, maxHp: 1000, mode: 'pass', modeT: 1, face: -1, x: 100 }, S = TCM.newFight(TCM.geom(L, TS));
  const [d0] = TCM.takeBlow(e, S, 40, 50); e.mode = 'lanceless'; e.modeT = 2; const [d1] = TCM.takeBlow(e, S, 40, 50);
  ok(Math.abs(d0 - 40 * TC.resist) < 0.01 && TC.resist >= 0.4 && d1 === 80, 'B15: x' + TC.resist + ' outside an opening (>= 0.4: never untouchable), x2 LANCELESS (' + d0 + ' / ' + d1 + ')');
  for (let i = 0; i < 20; i++) TCM.takeBlow(e, S, 40, 50); ok(S.openDealt <= TC.openCap * e.maxHp + 1e-6, 'one opening is capped at ' + TC.openCap * 100 + '% of him (' + S.openDealt.toFixed(0) + ')');
  e.mode = 'wheel'; e.hp = 510; const [d2] = TCM.takeBlow(e, S, 40, 50); ok(d2 <= 10.01, 'P1 cannot pass 50% (the floor holds; the next clean pass unhorses him)');
  S.ph = 2; e.mode = 'walk'; e.hp = 900; e.face = 1; const [dF] = TCM.takeBlow(e, S, 40, e.x + 30), [dB] = TCM.takeBlow(e, S, 40, e.x - 30);
  ok(Math.abs(dF - 40 * TC.resist) < 0.01 && dB === 40 * TC.behind, 'ON FOOT: his shield takes a blow from the front (x' + TC.resist + '); from behind him, x' + TC.behind);
  const tells = Object.keys(POSE).filter(k => /Tell$/.test(k)); ok(tells.length >= 5 && tells.every(k => POSE[k.replace(/Tell$/, '')] && JSON.stringify(POSE[k]) !== JSON.stringify(POSE[k.replace(/Tell$/, '')])) && POSE.passDown && JSON.stringify(POSE.pass) !== JSON.stringify(POSE.passDown), 'B16: every move has a windup pose and a different release pose (the lance\'s drop too): ' + tells.join(', ')); }

// ---- THE CHAMPION: END TO END (a bot on a horse with a 30 sword; his real moves; the real horse) ----
function fight({ seed = 1, couch = true, stopSquire = true, every = 0.42, hp = 640 } = {}) {
  const L0 = lv.build(), A = L0.arena; let rnd = seed; const rand = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  const P = hero((A.x0 / TS + 4) * TS, A.floor, { hp, maxHp: hp }), heroes = [P];   /* 640: the bot's health with its flasks drunk (it never drinks: one pool) */
  let boss = null, CPH = null; const ens = [];
  const F = fakeWorld(L0, heroes, { arenaMounted: () => !CPH || CPH.mountedPhase(), lanceSquire: pp => !!(CPH && CPH.lanceSquire(pp)) });
  F.ens = ens; F.hurt = (e, d, fx) => { if (e.t === 'tychampion') d = CPH.take(e, d); e.hp -= d; F.dealt = (F.dealt || 0) + d; if (e.hp <= 0) e.alive = false; };
  const G = makeTourneyHands(F); G.reset();
  const ctx = { ...F, get L() { return L0; }, get boss() { return boss; }, bossActive: true, EHP: { tychampion: TC.hp }, ty: () => G, hero: () => P,
    spawn: (t, x, y) => { const r = { t, x: x * TS + 8, y: (y + 1) * TS, hp: 90, alive: true, rivalT: 0 }; ens.push(r); return r; } };
  CPH = makeChampionHands(ctx); const sp = L0.ents.find(e => e.t === 'tychampion'); boss = CPH.spawnBoss({ x: sp.x * TS + 8, y: (sp.y + 1) * TS, vx: 0, vy: 0, face: -1, alive: true });
  const S = CPH.show(), modes = []; let last = null, t = 0, swingT = 0, phase2At = null, squireHits = 0;
  const dt = 1 / 60, swing = 30;
  while (t < 400 && boss.alive && !P.dead) {
    t += dt; CPH.update(boss, dt); G.update(dt);
    if (boss.mode !== last) { modes.push(boss.mode); last = boss.mode; }
    if (S.ph === 2 && phase2At === null) phase2At = t;
    /* THE BOT */
    const dx = boss.x - P.x, ad = Math.abs(dx); let keys = NOKEY, atk = false; P.block = false; P.ducking = false;
    const mounted = G.mounted(P);
    if (mounted) {
      if (boss.mode === 'pass' || boss.mode === 'wheel') { keys = dx > 0 ? RIGHT : LEFT; const closing = Math.abs(G.pace(P)) + TC.joust.speed; atk = couch && ad < closing * (0.42 + rand() * 0.2) && ad > 4; }   /* ride at him; couch when he is ~0.4-0.6 s off */
      else if (boss.mode === 'lanceless' || boss.mode === 'arm') { if (stopSquire && S.squire && S.squire.st === 'run' && Math.abs(S.squire.x - P.x) < 140) { const sx = S.squire.x - P.x; keys = Math.abs(sx) > 20 ? (sx > 0 ? RIGHT : LEFT) : NOKEY; if (Math.abs(sx) < 24) { P.face = Math.sign(sx) || 1; swingT -= dt; if (swingT <= 0) { swingT = every; CPH.strike({ l: P.x - 30, r: P.x + 30, t: S.G.floorY - 30, b: S.G.floorY }); squireHits++; } } }
        else { keys = ad > 26 ? (dx > 0 ? RIGHT : LEFT) : NOKEY; if (ad < 34) { swingT -= dt; if (swingT <= 0) { swingT = every; F.asPlayer(P, () => F.hurt(boss, swing, P.x)); } } } }
      else keys = dx > 0 ? LEFT : RIGHT;   /* (he fetches a lance himself: keep your distance) */
    } else {   /* ON FOOT: close, swing, guard his flail, step out of the overhead, get behind him when he is mired */
      const ens0 = ens.filter(r => r.alive);
      if (ens0.length) { const r = ens0[0]; r.rivalT += dt; if (r.rivalT > 5) r.alive = false; }   /* a rival knight: the bot is busy with him ~5 s */
      if (boss.mode === 'flailTell' || boss.mode === 'rushTell') P.block = true;
      else if (boss.mode === 'overTell') { P.x += -Math.sign(dx || 1) * 140 * dt; }
      else if (ad > 26) P.x += Math.sign(dx) * 100 * dt;
      if (!P.block && boss.mode !== 'overTell' && ad < 36) { swingT -= dt; if (swingT <= 0) { swingT = every; const fromX = boss.mode === 'mired' ? boss.x - (boss.face || 1) * 20 : P.x; F.asPlayer(P, () => F.hurt(boss, swing, fromX)); } }
    }
    if (mounted) { G.couch(P, atk); G.drive(P, dt, keys); P.x += P.vx * dt; } else { P.vx = 0; }
    P.x = Math.max(A.x0 + 8, Math.min(A.x1 - 8, P.x));
  }
  return { won: !boss.alive, t: +t.toFixed(1), hp: Math.max(0, Math.round(P.hp)), n: { ...S.n }, ph: S.ph, phase2At: phase2At && +phase2At.toFixed(1), modes, hurt: S.hurt, squireHits, rivals: ens.length };
}
{ const f1 = fight();
  ok(f1.won, 'THE CHAMPION falls to a bot that couches on its passes: ' + f1.t + ' s, ' + f1.hp + '/640 left; P2 from ' + f1.phase2At + ' s');
  ok(f1.n.clean >= 1 && f1.n.passes >= 3 && f1.n.opens >= 1, 'P1 THE JOUST: ' + f1.n.passes + ' passes, ' + f1.n.clean + ' clean (lances shattered), ' + f1.n.hits + ' of his hits, ' + f1.n.glances + ' glances, ' + f1.n.feints + ' feints');
  ok(f1.n.squires >= 1, 'THE SQUIRE runs a new lance out (' + f1.n.squires + ' runs, ' + f1.n.squireStops + ' stopped by the bot)');
  ok(f1.ph === 2 && f1.modes.includes('unhorsed') && f1.n.flails >= 1 && (f1.n.overs >= 1 || f1.n.rushes >= 1) && f1.n.horns >= 1 && f1.rivals >= 1, 'P2 UNHORSED, ON FOOT: ' + f1.n.flails + ' flails, ' + f1.n.overs + ' overheads (' + f1.n.mired + ' mired), ' + f1.n.rushes + ' rushes, ' + f1.n.horns + ' horns (' + f1.rivals + ' rival knights)');
  ok(f1.n.openHits > 0 && f1.n.coatHits > 0, 'his openings carry the fight (' + f1.n.openHits + ' blows at x2) and his shield never shuts it (' + f1.n.coatHits + ' at x' + TC.resist + ')');
  const f2 = fight({ couch: false });
  ok(!f2.won || f2.t > f1.t * 1.5, 'WITHOUT THE COUCH there is no joust to win: ' + (f2.won ? 'won in ' + f2.t + ' s' : 'lost (' + f2.n.hits + ' of his hits, ' + f2.n.clean + ' clean)') + ' - timing on horseback is the key, not a parry');
  const f3 = fight({ stopSquire: false });
  ok(f3.won && f3.n.squireStops === 0, 'leaving the squire alone still wins (' + f3.t + ' s), only slower than stopping him (' + f1.t + ' s) - his openings are shorter');
  console.log('  info THE CHAMPION by seed (a bot, NOT the 60-70% tune): ' + [1, 2, 3, 4, 5, 6].map(s => { const r = fight({ seed: s }); return (r.won ? 'W' : 'L') + ' ' + r.t + 's ' + r.hp + 'hp'; }).join(' | ')); }

console.log(bad ? '\nTHE TOURNEY (flag on): ' + bad + ' FAIL(S)' : '\nTHE TOURNEY (flag on): all ok');
process.exit(bad ? 1 : 0);
