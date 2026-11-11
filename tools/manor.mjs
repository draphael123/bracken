// tools/manor.mjs - THE HOLLOW MANOR and THE CASTELLAN'S GHOST (claude/hollowmanor, the opus greybox; Node only, no page).
//   node tools/manor.mjs           runs BOTH halves, one process after the other (the flag is read when src/level.js is imported):
//     FLAG OFF (this process)      MANOR_SHIPS false and no ?mn: LEVELS, THE BURIAL CAVERNS and THE WITCHLIGHT STAIR are master's (the same signature as master 9f29067e9,
//                                  hashed from a `git archive` export before this lane changed a line), the road and the old-save rule in src/main.js do nothing (lifted
//                                  out and run over fake saves), every main.js hook is guarded
//     FLAG ON  (a child: --on)     the road (caverns > manor > stair, appended), old saves grandfathered, the build (six sections, START + 2 shrines, no filler), the fill
//                                  reaches every shrine, silver, stand, candle, portrait, rack and the boss; THE REQUIRED TURNS (in state A the far side is out of reach,
//                                  swapped in reach) and the nursery (three keys); THE HANDS in a fake world (the watch rule, light and the blackout, the suits and their
//                                  wisps, portraits, the reset); THE FOES (suit, shade, poltergeist); THE CASTELLAN END TO END (a bot answers his real moves: each set's
//                                  opening, the final's wisp, the win)
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const ON = process.argv.includes('--on');
if (ON) globalThis.__MN = true;
const { install } = await import('./node-canvas.mjs'); install();
const { LEVELS, T } = await import('../src/level.js');
const { mnOn, MANOR_SHIPS } = await import('../src/mn-flag.js');
const TS = 16;
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8').split('\r').join('');
const main = src('src/main.js');
const h = v => createHash('sha1').update(JSON.stringify(v)).digest('hex').slice(0, 16);
/* THE OLD-SAVE RULE AND THE GATE CLAUSE, lifted out of src/main.js and run over a fake PROG */
const { roadKept } = await import('../src/route-insert.js');
const mig = /if \(mnOn\(\) && !PROG\.mnRoadMig\) \{[^\n]*?ro\.manor = 1; \}/.exec(main), lock = /\(lv\.needs && !\(PROG\[lv\.needs\] && PROG\[lv\.needs\]\.cleared\)[^\n]*?&& !q\.get\('unlock'\)\)/.exec(main);
const gateRun = (PROG, on) => { if (mig) new Function('PROG', 'mnOn', 'LEVELS', mig[0])(PROG, () => on, LEVELS); const q = { get: () => null };
  const locked = id => new Function('lv', 'PROG', 'q', 'roadKept', 'return !!' + lock[0])(LEVELS.find(l => l.id === id) || { id, needs: 'burial' }, PROG, q, roadKept); return { stair: locked('witchlight'), manor: locked('manor'), of: locked }; };

/* SHIPPED STATE (11-10, claude/batch157): all four night areas are live together, so the "this area alone, flag off = master" half only runs while its constant is false;
   with it true the process asserts the shipped state instead and the child (--on) checks the area on the road */
const OFF = !MANOR_SHIPS;
if (!ON) {
  console.log('== THE HOLLOW MANOR, FLAG OFF (MANOR_SHIPS = ' + MANOR_SHIPS + ')');
  if (OFF) ok(!MANOR_SHIPS && !mnOn(), 'the ship flag is off and nothing turns it on here');
  else ok(MANOR_SHIPS && mnOn() && LEVELS.some(l => l.id === 'manor'), 'SHIPPED: the ship flag is true and the LEVELS row is there (all four night areas live together)');
  if (OFF) ok(!LEVELS.some(l => l.id === 'manor'), 'no LEVELS row');
  if (OFF) ok(LEVELS.find(l => l.id === 'witchlight').needs === 'burial', 'THE WITCHLIGHT STAIR still needs THE BURIAL CAVERNS');
  if (OFF) {
  const MASTER = { n: 72, levels: 'e1d37b905059043c', burial: '62a3ba78de07aae8', witchlight: 'b2904bf68aaa0cfc' };   /* master 9f29067e9 (git archive export, before any edit) */
  const rows = LEVELS.map(l => [l.id, l.needs || null, l.leadsTo || null, !!l.hidden]);
  const b = id => { const L = LEVELS.find(l => l.id === id).build(); return h([L.W, L.H, Array.from(L.grid), L.ents]); };
  const now = { n: LEVELS.length, levels: h(rows), burial: b('burial'), witchlight: b('witchlight') };
  ok(JSON.stringify(now) === JSON.stringify(MASTER), 'LEVELS (ids, needs, order), THE BURIAL CAVERNS and THE WITCHLIGHT STAIR are master\'s exactly ' + JSON.stringify(now));
  }
  ok(!!mig && !!lock && /!roadKept\(PROG, lv\)/.test(lock[0]), 'the old-save rule is in src/main.js; what it keeps open goes through levelLocked\'s own roadKept clause (PROG.roadOpen, src/route-insert.js) - no clause of its own');
  if (OFF && mig && lock) for (const [name, P0] of [['a fresh save', {}], ['the caverns cleared', { burial: { cleared: true } }], ['past the stair', { burial: { cleared: true }, witchlight: { cleared: true } }], ['the fields only', { fields: { cleared: true } }]]) {
    const P = JSON.parse(JSON.stringify(P0)), r = gateRun(P, false), want = !(P0.burial && P0.burial.cleared) && !(P0.witchlight && P0.witchlight.cleared);
    ok(r.stair === want && !P.mnRoadMig && !P.roadOpen, 'flag off, ' + name + ': the stair ' + (want ? 'locked' : 'open') + ' exactly as master, the save untouched ' + JSON.stringify(P)); }
  const tagged = main.split('\n').filter(l => l.includes('(claude/hollowmanor)'));
  ok(tagged.length >= 15 && tagged.length <= 22, tagged.length + ' tagged hook lines in src/main.js (single lines)');
  const unguarded = tagged.filter(l => !/mnOn\(\)|MNH|CSH|case 'poltergeist'|MN_NODE|MN_POLT/.test(l));
  ok(!unguarded.length, 'every hook is behind the flag: the road and the old-save rule ask mnOn(), the rest need the level (MNH.on() / its ents / its boss) ' + unguarded.map(l => l.slice(0, 60)).join(' | '));
  ok(/if \(LEVELS\.some\(l => l\.id === 'manor'\)\) \{ INLAND_NODES\.splice/.test(main), 'the map node and its road vertex go in only while the LEVELS row is there (mnOn() at import)');
  ok(/mnOn\(\) && isDev\(\)/.test(main), 'the dev entry needs ?mn=1 and ?dev=1');
  ok(/if \(MNH && MNH\.mine\(e\)\) \{ MNH\.foe\(e, dt\); continue; \}/.test(main) && /H\.mine = e => \(e\.t === 'armour' && e\.cnSkin === 'mnsuit'\) \|\| \(e\.t === 'haunt' && e\.cnSkin === 'mnshade'\) \|\| e\.t === 'poltergeist'/.test(src('src/manor-hands.js')),
    'the hands take only their own skins (armour mnsuit, haunt mnshade) and the poltergeist - every other armour and haunt is master\'s');
  const child = spawnSync(process.execPath, ['--import', './tools/mn-on.mjs', fileURLToPath(import.meta.url), '--on'], { cwd: fileURLToPath(new URL('..', import.meta.url)), encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  process.stdout.write(child.stdout || ''); if (child.status !== 0) bad++;
  console.log(bad ? '\nTHE HOLLOW MANOR: ' + bad + ' FAIL(S)' : '\nTHE HOLLOW MANOR: all ok (flag off and flag on)');
  process.exit(bad ? 1 : 0);
}

// ======================================================================= FLAG ON =======================================================================
console.log('== THE HOLLOW MANOR, FLAG ON (globalThis.__MN)');
const { MN, SECTIONS, REQUIRED } = await import('../src/hollow-manor.js');
const { MN_RULE } = await import('../src/mn-lines.js');
const { makeManorHands, MOVE, LIGHT, SUIT, WISP, SHADE, POLT } = await import('../src/manor-hands.js');
const CSM = await import('../src/castellan.js'); const { CS } = CSM;
const { makeCastellanHands, POSE, SOUND } = await import('../src/castellan-hands.js');
const { floodReach } = await import('../src/reachcore.js');
const { THREAT } = await import('../src/threat.js');
const { MARK, ANSWER } = await import('../src/marks.js');
const lv = LEVELS.find(l => l.id === 'manor');
ok(!!lv && mnOn(), 'the LEVELS row is there with the flag on');
if (!lv) process.exit(1);
// ---- THE ROAD ----
const need = id => LEVELS.find(l => l.id === id).needs;
ok(LEVELS.indexOf(lv) === 74 && LEVELS.length === 76 && LEVELS.slice(72).map(l => l.id).join() === 'wispwood,silk,manor,academy', 'APPENDED in ship order (saves count levels by index): the four night areas are rows 72-75 (this one is 74), nothing before them moved');
ok(need('wispwood') === 'burial' && need('silk') === 'wispwood' && need('manor') === 'silk' && need('witchlight') === 'manor' && need('academy') === 'witchlight' && need('mage') === 'academy', 'THE ROAD (shipped, all four live): BURIAL > WISPWOOD > SILK > MANOR > WITCHLIGHT STAIR > ACADEMY > THE MAGE FOLLY');
ok(lv.rule === MN_RULE && /LOOK AWAY/.test(lv.rule), 'the rule line: ' + lv.rule);
ok(/GATE = \[[^\]]*'manor'/.test(src('tools/level-quality.mjs')), 'gated by level-quality');
ok(['mnshift', 'mncandle', 'mncandelabra', 'mnrack', 'mnportrait', 'mndoor'].every(k => THREAT[k] === 0) && THREAT.poltergeist > 0 && THREAT.castellan > 0, 'the threat table knows its machines (0), its poltergeist and its boss');
ok(MARK['armour|cleaveTell'] === '!!' && MARK['armour|thrustTell'] === '!' && MARK['haunt|lungeTell'] === '!!' && MARK['poltergeist|liftTell'] === '!' && ANSWER['poltergeist|liftTell'] === 'block', 'the suit\'s thrust (!) and cleave (!!), the shade\'s lunge (!!), the poltergeist\'s lift (!) have rows (src/marks.js)');
if (mig && lock) {
  const past = gateRun({ burial: { cleared: true }, witchlight: { cleared: true } }, true), atCav = gateRun({ burial: { cleared: true } }, true), fresh = gateRun({ mnRoadMig: 1, burial: { cleared: true } }, true), done = gateRun({ mnRoadMig: 1, burial: { cleared: true }, manor: { cleared: true } }, true);
  ok(!past.stair && !atCav.stair, 'an old save that cleared the caverns (or the stair) keeps the stair open (grandfathered once): ' + JSON.stringify([past, atCav]));
  ok(!past.manor, 'a save past the stair finds the manor UNLOCKED as an extra');
  ok(fresh.stair && fresh.manor && !gateRun({ mnRoadMig: 1, burial: { cleared: true }, silk: { cleared: true } }, true).manor, 'a save made with the manor on the road: the undercroft opens it (it needs silk now), the stair waits');
  ok(!done.stair, 'clearing the manor opens the stair');
}
// ---- THE BUILD ----
const L = lv.build();
ok(L.W === MN.W && L.H === MN.H && L.manor && L.mn && L.arena && L.arena.boss === 'castellan', 'built: ' + L.W + ' x ' + L.H + ', the great hall');
ok(L.sections.length === 6 && SECTIONS.length === 6, 'six sections: ' + SECTIONS.map(s => s[0]).join(' / '));
const checks = L.ents.filter(e => e.t === 'check'), silvers = L.ents.filter(e => e.t === 'silver');
ok(checks.length === 2 && L.checkRun === 200, 'START + 2 shrines (cols ' + checks.map(c => c.x).join(', ') + '), checkRun 200: the filler adds none');
ok(silvers.length === 2, 'two silvers (cols ' + silvers.map(s => s.x).join(', ') + ')');
const G0 = L.mn;
ok(G0.panels.length >= 4 && G0.candles.length >= 8 && G0.stands.length >= 2 && G0.racks.length >= 5 && G0.portraits.length === 3 && G0.doors.length === 1 && L.arena.racks.length === 4,
  'panels ' + G0.panels.length + ' (' + G0.panels.map(p => p.kind).join(', ') + '), candles ' + G0.candles.length + ', candelabra stands ' + G0.stands.length + ', racks ' + G0.racks.length + ' (+4 in the hall), portraits ' + G0.portraits.length + ', the nursery door');
ok(L.calm && L.calm.length && !L.ents.some(e => e.t === 'gate'), 'placed by hand (calm), no exit gate: the Castellan ends it');
{ const suits = L.ents.filter(e => e.t === 'armour' && e.cnSkin === 'mnsuit').length, shades = L.ents.filter(e => e.t === 'haunt' && e.cnSkin === 'mnshade').length, polts = L.ents.filter(e => e.t === 'poltergeist').length, boos = L.ents.filter(e => e.t === 'boo').length;
  ok(suits >= 6 && shades >= 4 && polts >= 4 && boos >= 4 && !L.ents.some(e => /gob/.test(e.t) || /gob/.test(e.cnSkin || '')), 'foes: ' + suits + ' possessed suits, ' + shades + ' shades, ' + polts + ' poltergeists, ' + boos + ' boos - no goblins (act IV)'); }
{ const reach = floodReach(L, T, { rides: true }); const want = L.ents.filter(e => ['check', 'silver', 'mncandelabra', 'mnportrait', 'mnrack', 'castellan'].includes(e.t));
  const miss = want.filter(e => !reach.jumpNear(e.x, e.y));
  ok(!miss.length, 'the fill (the permissive state) reaches every shrine, silver, stand, portrait, rack and the Castellan' + (miss.length ? ': MISSES ' + JSON.stringify(miss.map(e => [e.t, e.x, e.y])) : '')); }

// ---- THE HANDS, in a fake world ----
const fakeWorld = (L0, heroes, o = {}) => { let cur = null; const log = []; const fx = { L: L0, TS, T, players: () => heroes, enemies: () => fx.ens, ens: [], time: () => 0, number: (x, y, t) => log.push(t), hint: t => log.push('HINT ' + t),
  asPlayer: (p, fn) => { const o2 = cur; cur = p; try { fn(); } finally { cur = o2; } },
  damage: (x, d, op = {}) => { const p = cur; if (!p || p.dead) return null; if ((p.inv || 0) > 0) return null; if (!op.unblockable && (p.blocking || (o.block && o.block(p, op)))) return 'blocked'; p.hp -= d; p.hits = (p.hits || 0) + 1; p.took = (p.took || []).concat([[op.name || '?', d]]); if (p.hp <= 0) p.dead = true; return 'hit'; },
  cellSet: (x, y, t) => { L0.grid[y * L0.W + x] = t; }, upright: p => !p.dead, hitOnce: () => true, shake: () => {}, ring: () => {}, log, addFoe: e => fx.ens.push(e) }; return fx; };
const hero = (x, y, o = {}) => ({ x, y, hp: 400, vx: 0, vy: 0, ground: true, face: 1, ...o });
const at = (col, row) => [col * TS + 8, (row + 1) * TS];
const cell = (L0, x, y) => L0.grid[y * L0.W + x];
const hitAt = (x, y, r = 4) => ({ l: x - r, r: x + r, t: y - r, b: y + r });
{ const L0 = lv.build(), grid0 = Array.from(L0.grid); const P = hero(...at(3, 33)), F = fakeWorld(L0, [P]), G = makeManorHands(F); G.reset();
  const step = (s, dt = 1 / 60) => { for (let t = 0; t < s; t += dt) G.update(dt); };
  const pan = id => L0.mn.panels.find(p => p.id === id);
  const reach = () => floodReach(L0, T, { rides: true });
  const far = k => { const [x, y] = REQUIRED[k].far; return reach().jumpNear(x, y); };
  ok(L0.mn.panels.every(p => p.a.every(([x, y]) => cell(L0, x, y) === T.SOLID) && p.b.every(([x, y]) => cell(L0, x, y) === T.AIR)) && L0.mn.doors[0].cells.every(([x, y]) => cell(L0, x, y) === T.SOLID), 'THE RESET: every panel in state A (its a-cells SOLID, its b-cells AIR), the nursery door shut');
  /* THE WATCH RULE, on THE MOVING DOOR (col 28) */
  const d0 = pan(REQUIRED.door.panel); P.x = at(24, 29)[0]; P.y = at(24, 29)[1]; P.face = 1; step(2);
  ok(G.read().panels[d0.id] === 'A', 'a hero by THE MOVING DOOR who FACES it: nothing moves (2 s)');
  ok(!far('door'), 'REQUIRED TURN (the servants\' hall): in state A the hall beyond (col ' + REQUIRED.door.far[0] + ') is out of reach - its doorway is high');
  P.face = -1; step(MOVE.unwatched * 0.5); ok(G.read().panels[d0.id] === 'A', 'back turned for ' + (MOVE.unwatched * 0.5).toFixed(1) + ' s: not yet');
  step(MOVE.unwatched * 0.6); ok(G.read().panels[d0.id] === 'B' && far('door'), 'back turned ' + MOVE.unwatched + ' s: IT MOVED - the doorway is on the floor, the hall beyond in reach');
  step(2); ok(G.read().panels[d0.id] === 'B', 'it swaps ONCE: still turned away, it does not swap back');
  P.face = 1; step(0.3); P.face = -1; step(MOVE.unwatched + 0.1); ok(G.read().panels[d0.id] === 'A', 'watched again, then turned from: it swaps back (never a soft-lock: any hero can work it either way)');
  P.x = at(28, 29)[0]; P.face = -1; step(2); ok(G.read().panels[d0.id] === 'A', 'a hero standing IN the doorway: it never swaps (never onto anyone)');
  P.x = at(3, 33)[0]; P.y = at(3, 33)[1]; P.face = -1; step(2); ok(G.read().panels[d0.id] === 'A', 'a hero far off: it never swaps (it moves when you are near and look away)');
  const setSt = (id, st) => { if (G.read().panels[id] !== st) G.swap(id); };   /* (the reach fill walks from START: the panels behind are put where the road needs them) */
  /* the stair and the wing */
  setSt(d0.id, 'B');
  const s1 = pan(REQUIRED.stair.panel); ok(!far('stair'), 'REQUIRED TURN (the portrait gallery): with no stair the balcony and the gallery beyond (col ' + REQUIRED.stair.far[0] + ') are out of reach');
  P.x = at(80, 29)[0]; P.y = at(80, 29)[1]; P.face = 1; step(0.5); P.face = -1; step(MOVE.unwatched + 0.1); ok(G.read().panels[s1.id] === 'B' && s1.b.every(([x, y]) => cell(L0, x, y) === T.SOLID) && far('stair'), 'turn your back on it and THE SHIFTING STAIR is there: the balcony in reach');
  P.x = at(90, 23)[0]; P.y = at(90, 23)[1]; step(0.2); P.x = at(98, 19)[0]; P.y = at(98, 19)[1]; P.face = 1; step(MOVE.unwatched + 0.2);   /* up the stair (in its box: watched), onto the balcony, the stair behind */ ok(G.read().panels[s1.id] === 'A', 'and up on the balcony, the stair behind you goes again (the house moves: a drop back down is the way back)');
  setSt(s1.id, 'B'); const w3 = pan(REQUIRED.wing.panel); ok(!far('wing'), 'REQUIRED TURN (the nursery wing): its moving door holds the wing (col ' + REQUIRED.wing.far[0] + ')');
  P.x = at(222, 29)[0]; P.y = at(222, 29)[1]; P.face = 1; step(0.3); P.face = -1; step(MOVE.unwatched + 0.1); ok(G.read().panels[w3.id] === 'B' && far('wing'), 'turned from, it opens');
  /* the bookcase silver */
  const c1 = pan(L0.mn.case1); P.x = at(121, 13)[0]; P.y = at(121, 13)[1]; P.face = 1; step(0.3); ok(!reach().jumpNear(127, 13), 'THE BOOKCASE seals SECRET ONE');
  P.face = -1; step(MOVE.unwatched + 0.1); ok(G.read().panels[c1.id] === 'B' && reach().jumpNear(127, 13), 'turned from, the bookcase swings: SECRET ONE in reach');
  /* the nursery */
  ok(!far('nursery'), 'THE SEALED NURSERY (SECRET TWO, col ' + REQUIRED.nursery.far[0] + ') is shut');
  for (const p of L0.mn.portraits.slice(0, 2)) G.strike(hitAt(p.x, p.y), P); ok(G.read().keys === 2 && !G.read().door && !far('nursery'), 'two portraits struck: two keys, still shut');
  G.strike(hitAt(L0.mn.portraits[2].x, L0.mn.portraits[2].y), P); ok(G.read().keys === 3 && G.read().door && far('nursery'), 'the third: IT OPENS - the nursery and its silver in reach');
  /* the reset */
  G.reset(); const same = L0.grid.every((v, i) => v === grid0[i] || L0.mn.panels.some(p => p.a.concat(p.b).some(([x, y]) => y * L0.W + x === i)) || L0.mn.doors.some(d => d.cells.some(([x, y]) => y * L0.W + x === i)));
  ok(same && G.read().keys === 0 && Object.values(G.read().panels).every(s => s === 'A'), 'the reset puts every panel back in state A and shuts the nursery (only those cells ever differ from the built grid)'); }

// ---- LIGHT AND THE BLACKOUT ----
{ const L0 = lv.build(); const P = hero(...at(141, 29)), F = fakeWorld(L0, [P]), G = makeManorHands(F); G.reset();
  const step = (s, dt = 1 / 60) => { for (let t = 0; t < s; t += dt) { G.update(dt); for (const e of F.ens) if (e.alive) G.foe(e, dt); } };
  const sh = L0.ents.filter(e => e.t === 'haunt' && e.cnSkin === 'mnshade').map(e => ({ t: 'haunt', cnSkin: 'mnshade', x: e.x * TS + 8, y: (e.y + 1) * TS, alive: true, hp: 1, face: -1 })); F.ens.push(...sh);
  step(0.5); ok(sh.every(e => e.mode === 'hide') && G.read().lit === L0.mn.candles.length, 'before the blackout: every candle lit, the shades asleep in the walls');
  const s0 = L0.mn.stands[0]; P.x = s0.x + 4; step(0.1); ok(G.carrying(P) === 'lit', 'touch the CANDELABRA\'s stand: carried, lit');
  P.x = 152 * TS + 8; step(0.1); ok(G.show().bo.on && sh.every(e => e.mode !== 'hide'), 'across the long gallery\'s door: THE LIGHTS GO OUT - the shades wake');
  const first = G.show().bo.list[0]; step(LIGHT.flick * 0.5); ok(!!G.show().flick[first] && G.show().lit[first], 'each candle FLICKERS first (told, ' + LIGHT.flick + ' s)');
  step(LIGHT.every * G.show().bo.list.length + 2); ok(G.show().bo.list.every(id => !G.show().lit[id]), 'then goes out, one by one (' + G.show().bo.list.length + ' candles, every ' + LIGHT.every + ' s)');
  const c = L0.mn.candles.find(q => q.id === first); G.take(P); P.x = c.x; P.y = c.y; step(0.05);   /* (the shades snuffed it on the way: a stand gives it back) */ ok(G.show().lit[first] && G.show().n.relit === 1, 'touch a dead candle with the lit candelabra: LIT');
  /* a hero in the light vs in the dark */
  for (const e of sh) { e.x = c.x + 160; e.y = c.y - 20; e.mode = 'chase'; e.cd = 0; } P.hp = 400; P.dead = false; P.x = c.x;   /* (the blackout walk above may have worn the hero down: a fresh one) */ P.y = c.y; step(4);
  const inSafe = 400 - P.hp, closest = Math.min(...sh.map(e => Math.hypot(e.x - c.x, e.y - (c.y - 10))));
  ok(inSafe === 0 && closest >= LIGHT.ward - 1, 'a hero in a lit candle\'s light: no shade enters it (closest ' + closest.toFixed(0) + ' px, the ward ' + LIGHT.ward + '), none lunges - 0 hurt in 4 s');
  const dark = L0.mn.candles.find(q => G.show().bo.list.includes(q.id) && !G.show().lit[q.id] && Math.abs(q.x - c.x) > 200);
  P.y = at(0, 29)[1]; P.x = [...Array(60).keys()].map(k => (146 + k) * TS + 8).find(x => L0.mn.candles.every(q => !G.show().lit[q.id] || Math.hypot(q.x - x, q.y - 10 - (P.y - 14)) > LIGHT.ward + 40));   /* a spot on the floor no lit candle reaches */ for (const e of sh) { e.x = P.x + 120; e.y = P.y - 30; e.mode = 'chase'; e.cd = 0; } step(4);
  ok(400 - P.hp >= SHADE.dmg && G.show().n.lungeHits >= 1 && G.carrying(P) === 'out', 'in the dark they come through the walls: ' + (400 - P.hp) + ' hurt in 4 s, a told lunge (!!) - and it SNUFFS the candelabra');
  P.x = c.x; P.y = c.y; step(0.1); ok(G.carrying(P) === 'lit', 'relight it at any lit candle'); }

// ---- THE FOES ----
{ const L0 = lv.build(); const mk = (col, row, o = {}) => { const P = hero(...at(col, row)), F = fakeWorld(L0, [P], o), G = makeManorHands(F); G.reset(); return { P, F, G }; };
  const run = (G, F, s) => { for (let t = 0; t < s; t += 1 / 60) { G.update(1 / 60); for (const e of F.ens) if (e.alive) G.foe(e, 1 / 60); } };
  /* a possessed suit: told thrust; the cleave that misses bites the floor */
  { const { P, F, G } = mk(18, 29); const e = { t: 'armour', cnSkin: 'mnsuit', x: at(21, 29)[0], y: at(21, 29)[1], alive: true, hp: 1, face: -1 }; F.ens.push(e);
    const modes = new Set(); for (let t = 0; t < 3; t += 1 / 60) { G.foe(e, 1 / 60); modes.add(e.mode); }
    ok(e.maxHp === SUIT.hp && modes.has('thrustTell') && P.hits >= 1, 'A POSSESSED SUIT (' + SUIT.hp + ' hp, heavy): a told THRUST (' + SUIT.thrust.tell + ' s, !), ' + SUIT.thrust.dmg + ' (' + P.hits + ' landed in 3 s)');
    P.x -= 60; e.mnHits = SUIT.cleave.every - 1; e.cd = 0; e.mode = 'walk'; P.x = e.x - 20; G.foe(e, 1 / 60); const told = e.mode === 'cleaveTell'; P.x = e.x - 120; for (let t = 0; t < SUIT.cleave.tell + 0.05; t += 1 / 60) G.foe(e, 1 / 60);
    ok(told && e.mode === 'stuck' && G.takeFoe(e, 10) === 10 * SUIT.cleave.mul, 'every ' + SUIT.cleave.every + 'rd blow a told CLEAVE (!!); step out and it BITES THE FLOOR: STUCK ' + SUIT.cleave.stuck + ' s, x' + SUIT.cleave.mul); }
  /* knock it out, the wisp, the rise, lay to rest */
  { const { P, F, G } = mk(18, 29); const e = { t: 'armour', cnSkin: 'mnsuit', x: at(21, 29)[0], y: at(21, 29)[1], alive: true, hp: 1, face: -1 }; F.ens.push(e); G.foe(e, 1 / 60);
    e.alive = false; run(G, F, 0.1); const w = G.show().wisps[0], rack = L0.mn.racks.find(r => Math.abs(r.x - w.tx) < 1);
    ok(!!w && !!rack && rack.col === 16, 'KNOCK IT OUT: the suit falls and its GHOST flies to the nearest EMPTY SUIT (the rack at col ' + (rack && rack.col) + ')');
    run(G, F, WISP.t); const risen = F.ens.filter(q => q.alive && q.cnSkin === 'mnsuit'); ok(risen.length === 1 && risen[0].mode === 'rise' && Math.abs(risen[0].x - rack.x) < 1 && risen[0].mnLives === WISP.lives - 1, 'unless stopped, in ' + WISP.t + ' s it stands that suit up (told: IT RISES, ' + WISP.rise + ' s)');
    risen[0].alive = false; run(G, F, 0.1); const w2 = G.show().wisps.find(q => !q.done); ok(!!w2, 'knocked out again: the ghost flies on (to the pile it left, the rack is spent)');
    G.strike(hitAt(w2.x, w2.y), P); run(G, F, WISP.t + 0.2); ok(G.show().n.rested === 1 && F.ens.filter(q => q.alive && q.cnSkin === 'mnsuit').length === 0, 'STRIKE THE WISP in flight: LAID TO REST - nothing rises');
    const e3 = G.suitAt(e.x, e.y, 0, 'walk'); e3.alive = false; run(G, F, 0.1); ok(G.show().n.faded === 1, 'a ghost that has stood up ' + WISP.lives + ' suits FADES when knocked out again (no endless farm)'); }
  /* the shade asleep */
  { const { G } = mk(150, 29); const e = { t: 'haunt', cnSkin: 'mnshade', x: 100, y: 100, alive: true, hp: 1, mode: 'hide' }; G.foe(e, 1 / 60); ok(G.takeFoe(e, 10) === 0 && e.mode === 'hide', 'a shade asleep in its wall is not there to hit (it wakes with the blackout)'); }
  /* the poltergeist */
  { const { P, F, G } = mk(66, 29); const sp = L0.ents.find(e => e.t === 'poltergeist' && e.squad === 'galleryPolter'); const e = G.spawn(sp, { x: sp.x * TS + 8, y: (sp.y + 1) * TS, vx: 0, vy: 0, face: -1, alive: true }); F.ens.push(e);
    ok(G.takeFoe(e, 10) === 10 * POLT.phased, 'THE POLTERGEIST (the one new foe, ' + POLT.hp + ' hp, ranged): faint between throws - phased, x' + POLT.phased);
    let told = false; for (let t = 0; t < 3; t += 1 / 60) { G.foe(e, 1 / 60); G.update(1 / 60); if (e.mode === 'liftTell') told = true; }
    ok(told && P.hits >= 1 && G.show().n.throwHits >= 1, 'it LIFTS a piece of furniture (told ' + POLT.lift + ' s, !) and throws it: ' + POLT.dmg + ' (' + P.took.map(t => t[0]).join(', ') + ')');
    ok(G.takeFoe(Object.assign({}, e, { mode: 'spent' }), 10) === 10, 'SPENT after a throw: solid a beat (x1)'); }
  { const { P, F, G } = mk(66, 29, { block: () => true }); const sp = L0.ents.find(e => e.t === 'poltergeist' && e.squad === 'galleryPolter'); const e = G.spawn(sp, { x: sp.x * TS + 8, y: (sp.y + 1) * TS, vx: 0, vy: 0, face: -1, alive: true }); F.ens.push(e);
    for (let t = 0; t < 3; t += 1 / 60) { G.foe(e, 1 / 60); G.update(1 / 60); } ok(P.hp === 400 && G.show().n.blockedThrows >= 1, 'a BLOCKED throw: CLATTER, no hurt'); }
}

// ---- THE CASTELLAN'S GHOST ----
{ const moves = ['thrust', 'bash', 'sweep', 'chop', 'feint', 'lunge', 'flurry', 'breaker', 'whirl'];
  ok(moves.every(m => POSE[m + 'Tell'] && POSE[m] && JSON.stringify(POSE[m + 'Tell']) !== JSON.stringify(POSE[m])) && ['stumble', 'stuck', 'winded', 'dizzy', 'knocked', 'leave', 'swap', 'wisp'].every(m => POSE[m]), 'every move has its own windup pose and release pose (B16), and each opening, the leaving, the swap, the wisp');
  ok(moves.every(m => SOUND[m + 'Tell'] && SOUND[m]) && SOUND.open && SOUND.leave && SOUND.swap && SOUND.wisp, 'every move its own sound, and the opening, the leaving, the swap and the wisp');
  ok(CS.resist >= 0.4 && CS.shield >= 0.4 && CS.openMul > 1 && CS.openCap > 0 && CS.floors.length === 4, 'B15: x' + CS.resist + ' in the armour, x' + CS.shield + ' on the knight\'s shield (>= 0.4: never untouchable), x' + CS.openMul + ' knocked half out, capped ' + CS.openCap * 100 + '%; sets break at ' + CS.floors.map(f => f * 100 + '%').join(' / ')); }
function fight({ seed = 1, swing = 40, every = 0.45, read = 0.75 } = {}) {
  const L0 = lv.build(), A = L0.arena; let rnd = seed; const rand = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  const floorY = A.floor; const P = hero(A.x0 + 10 * TS, floorY, { hp: 640, inv: 0 }), heroes = [P];   /* 640: the bot's health with its flasks drunk (it never drinks: one pool) */
  const F = fakeWorld(L0, heroes), G = makeManorHands(F); G.reset();
  let boss = null; const ctx = { ...F, get L() { return L0; }, get boss() { return boss; }, bossActive: true, EHP: { castellan: CS.hp }, hero: () => P };
  const H = makeCastellanHands(ctx);
  const sp = L0.ents.find(e => e.t === 'castellan'); boss = H.spawnBoss({ x: sp.x * TS + 8, y: (sp.y + 1) * TS, vx: 0, vy: 0, face: 1, alive: true }); boss.mode = 'wake'; boss.modeT = 1.4;
  const modes = new Set(), S = H.show(); let t = 0, swingT = 0, openDmg = 0, armDmg = 0, lastMode = '', ans = false, setT = {}, setStart = 0, lastSet = 'knight';
  const dt = 1 / 60;
  while (t < 500 && boss.alive && !P.dead) {
    t += dt; H.update(boss, dt); modes.add(boss.mode); P.inv = Math.max(0, P.inv - dt);
    const set = CSM.setName(S); if (set !== lastSet) { setT[lastSet] = +(t - setStart).toFixed(1); setStart = t; lastSet = set; }
    const m = boss.mode, tell = m.endsWith('Tell') ? m.slice(0, -4) : null; if (m !== lastMode) { if (tell) ans = rand() < read; lastMode = m; }
    const f = boss.face || 1, d = P.x - boss.x; let goal = boss.x + f * 22, block = false;   /* it stands IN FRONT of him and swings (a mash bot that never answers stands there too) */ P.ground = true;
    /* THE BOT reads a tell (read = the share it answers) and answers it the way the set asks: block, dodge through, jump, step in or out */
    if (ans && (tell === 'thrust' || tell === 'lunge' || tell === 'flurry' || m === 'flurry' || m === 'lunge' || m === 'thrust')) { block = true; goal = P.x; }
    if (ans && tell === 'bash' && boss.modeT < 0.12) P.inv = 0.6;   /* a roll through the bash */
    if (ans && (tell === 'sweep' || m === 'sweep') && boss.modeT < 0.25) P.ground = false;
    if (ans && tell === 'chop') goal = S.chopAt + f * 40;   /* out past where it lands */
    if (ans && (tell === 'breaker' || m === 'breaker')) goal = boss.x - Math.sign(d || 1) * -1 * 0 + (Math.sign(d) || -f) * 90;
    if (ans && (tell === 'whirl' || m === 'whirl')) goal = boss.x + (Math.sign(d) || -f) * 110;
    if (m === 'wisp') goal = boss.x;
    P.blocking = block; const dx = goal - P.x; P.x += Math.sign(dx) * Math.min(Math.abs(dx), 92 * dt); P.x = Math.max(A.x0 + 10, Math.min(A.x1 - 10, P.x)); P.face = Math.sign(boss.x - P.x) || 1;
    swingT -= dt; if (swingT <= 0 && !block) { swingT = every;
      if (Math.abs(boss.x - P.x) < 34 && Math.abs(boss.y - P.y) < (m === 'wisp' ? 90 : 40)) { const o = CSM.csOpen(boss) || m === 'wisp', dd = H.take(boss, swing, null, P); boss.hp -= dd; if (o) openDmg += dd; else armDmg += dd; if (boss.hp <= 0) { boss.alive = false; H.end(boss); } } }
  }
  setT[lastSet] = +(t - setStart).toFixed(1);
  return { won: !boss.alive && !P.dead, t, hpLeft: P.hp, modes, S, H, P, openDmg, armDmg, setT };
}
{ const R = fight(), n = R.S.n; for (const sd of [7, 13, 21]) for (const m of fight({ seed: sd }).modes) R.modes.add(m);
  ok(R.won, 'THE CASTELLAN\'S GHOST, END TO END: the bot wins in ' + R.t.toFixed(0) + ' s with ' + Math.round(R.hpLeft) + ' of 640 health left (hurt by ' + JSON.stringify(Object.fromEntries(Object.entries(R.S.hurt).map(([k, v]) => [k, Math.round(v)]))) + ')');
  ok(R.S.sets.join() === 'knight,halberd,duelist,greatsword' && R.S.final, 'ONE SET AT A TIME, each broken in turn (' + R.S.sets.join(' > ') + '), then the final; seconds per set ' + JSON.stringify(R.setT));
  ok(n.bashMiss >= 1 && n.chopMiss >= 1 && n.flurryBlocked >= 1 && n.whirlMiss >= 1 && n.wispHits >= 1, 'EACH SET\'S OPENING EARNED BY AN ACTION: a dodged bash ' + n.bashMiss + ', a chop that bit the floor ' + n.chopMiss + ', a flurry blocked whole ' + n.flurryBlocked + ', a whirl that hit no one ' + n.whirlMiss + ', the final\'s wisp struck ' + n.wispHits);
  ok(R.openDmg > R.armDmg, 'THE GHOST KNOCKED HALF OUT is the key: ' + n.opens + ' openings, ' + Math.round(R.openDmg) + ' dealt open vs ' + Math.round(R.armDmg) + ' through the armour');
  ok(['thrustTell', 'bashTell', 'sweepTell', 'chopTell', 'lungeTell', 'flurryTell', 'breakerTell', 'whirlTell', 'feint', 'leave', 'swap', 'wisp', 'knocked'].every(m => R.modes.has(m)), 'every move came out of its own windup (four bots): ' + [...R.modes].join(' '));
  ok(R.S.n.swaps >= 3 && R.S.n.wisps >= 1, 'FINAL: he swapped bodies ' + R.S.n.swaps + ' times mid-combo, his wisp crossed ' + R.S.n.wisps + ' times');
  ok(R.t >= 60 && R.t <= 240, 'the fight runs ' + R.t.toFixed(0) + ' s for a node bot (a player: 90-150 s; the tune lane sets hp at n=6)'); }
{ const R = fight({ read: 0 }), n = R.S.n, R1 = fight();
  ok(!R.won && n.flurryBlocked === 0 && n.opens * 2 <= R1.S.n.opens, 'a bot that never answers a tell earns few openings (' + n.opens + ' vs ' + R1.S.n.opens + ', by luck: a bash or a chop that happened to miss) and ' + (R.P.dead ? 'DIES at ' + R.t.toFixed(0) + ' s' : 'runs out of time') + ' (' + (n.wispHits) + ' wisps struck, ' + Math.round(R.openDmg) + ' dealt open)'); }
{ const e = { hp: 3200, maxHp: 3200, mode: 'walk', modeT: 0, x: 500, y: 480, face: 1 }, S = CSM.newFight(CSM.geom(lv.build()));
  const [dS] = CSM.takeBlow(e, S, 40, { x: 520, y: 480 }), [dB] = CSM.takeBlow(e, S, 40, { x: 480, y: 480 }); e.mode = 'stumble'; e.modeT = 1; const [dO] = CSM.takeBlow(e, S, 40); let sum = dO; for (let i = 0; i < 50; i++) sum += CSM.takeBlow(e, S, 40)[0];
  ok(dS === 16 && dB === 18 && dO === 80, 'a 40 blow on THE KNIGHT: ' + dS + ' on his shield, ' + dB + ' from behind, ' + dO + ' knocked half out');
  ok(sum <= CS.openCap * 3200 + 50 * 40 * CS.resist + 1, 'an opening is capped at ' + CS.openCap * 100 + '% of him (then x' + CS.resist + ')');
  e.mode = 'walk'; e.hp = CS.floors[0] * 3200 + 5; const [d2, w2] = CSM.takeBlow(e, S, 40, { x: 0, y: 0 }); ok(d2 === 5 && w2 === 'HOLDS', 'a set holds at its floor (' + CS.floors[0] * 100 + '%) until the move in hand ends'); }

console.log(bad ? 'FLAG ON: ' + bad + ' FAIL(S)' : 'FLAG ON: all ok');
process.exit(bad ? 1 : 0);
