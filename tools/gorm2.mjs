// tools/gorm2.mjs - KING GORM 2: THE COURT, THE BURNING WOOD, THE KING'S GLADE (claude/gorm2; Node, no page). The shape of the fight, checked on the
// level's data and on his hands and AI run in a fake world:
//   THE HALL: five cages on ropes (no plates), each tied off at two pegs on the hall floor three tiles either side; each cage's deck under its
//     archers' marks; two heaps of cobbles on the floor; THE LOCK: a rope is held while its archers live and free once they are down, and only
//     the live rope's peg drops a cage; a rock thrown up from the floor reaches a deck (the told arc lands on it).
//   THE FLEE: his P1 bar emptying spares him (stage 'flee'), heals the hero to full, lights the fire behind him, keeps P1 beaten through a death
//     (persist) and puts the King in his glade; the fire hurries when the hero is far ahead and never passes the glade's shrine.
//   THE BURNING WOOD: its burning floors lie on ground under boughs a jump reaches; its branches hang over a floor or a bough; torch goblins on
//     it; one shrine at its end; no squad in the glade.
//   THE GLADE: the arena; what hangs in the oak (two cages, a log trap, a beehive) over the floor and over his head, a peg each on the floor;
//     a dropped cage HOLDS him, the log KNOCKS him down, the hive STINGS him - and inside his ward they glance off (B3).
//   HIS AI: every P1 and P2 move is entered through its own told windup (B16) and lands its own release; the hunts come at their thresholds.
//   B15: outside an opening a blade lands at GORM.chip (0.4), never nothing; the openings pay 1.25-2.
//   THE ROYAL BOAR: in the Hunting Stands' meadow (the level's one new foe), told (its lane), jumped (it runs on under you), penned by a cage.
import './gorm2-dom.mjs';   /* (claude/kingsfix) a canvas for gorm_frames.js, which bakes at import */
import { LEVELS, T } from '../src/level.js';
import { GORM, GORM_SAY, gormOpen, gormTake, fireStep } from '../src/gorm.js';
import { makeGormHands } from '../src/gorm-hands.js';
import { updateGorm } from '../src/gorm-king.js';
import { RB, newRoyalBoar, boarStep } from '../src/royal-boar.js';
import { readFileSync } from 'fs';
const TS = 16; let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const lv = LEVELS.find(l => l.id === 'kings'), L = lv.build(), G = L.gorm, W = L.W;
const cell = (x, y) => L.grid[y * W + x], solid = (x, y) => cell(x, y) === T.SOLID, oneway = (x, y) => cell(x, y) === T.ONEWAY || cell(x, y) === T.PLANK, stand = (x, y) => solid(x, y) || oneway(x, y);
console.log('THE HALL');
ok(G && G.hall && G.hall.ropes.length === 5, 'five cages on royal ropes');
ok(!L.ents.some(e => e.t === 'plate' && e.x >= 420 && e.x <= 474), 'no plates in his hall (Daniel 10-22: the cages move from plates to ropes)');
const cages = L.ents.filter(e => e.t === 'dropcage' && e.boss);
ok(cages.length === 5 && G.hall.ropes.every(r => cages.some(c => Math.abs(c.x * TS + 8 - r.x) < 2)), 'each rope holds one of his five cages');
ok(G.hall.ropes.every(r => r.pegs.length === 2 && r.pegs.every(p => solid(Math.floor(p / TS), 14) && !stand(Math.floor(p / TS), 13)) && Math.abs(r.pegs[0] - r.x) === 48 && Math.abs(r.pegs[1] - r.x) === 48), 'each rope is tied off at two pegs on the hall floor, three tiles either side of its cage');
ok(G.hall.ropes.every(r => r.archers.every(a => oneway(Math.floor(a / TS), 5) && a > r.deck[0] && a < r.deck[1])), "each rope's two archers stand its deck (row 5, over the cage)");
ok(G.hall.heaps.length >= 2 && G.hall.heaps.every(h => solid(Math.floor(h / TS), 14)), 'heaps of cobbles on the hall floor: ' + G.hall.heaps.map(h => Math.floor(h / TS)).join(' '));
{ const Rk = GORM.rock, apex = Rk.vy * Rk.vy / (2 * Rk.g), rise = (14 * TS - 18) - 5 * TS; ok(apex > rise + 12, 'a rock lobbed UP from the floor clears the decks (apex ' + Math.round(apex) + ' px, the decks ' + rise + ' px over the hand)'); }
ok(/sign\(6, 39, "THE ROYAL ROAD/.test(readFileSync(new URL('../src/kingswood.js', import.meta.url), 'utf8')), "the ROYAL ROAD sign stands two tiles right of the control prompt (Daniel 10-22: col 6, was 4)");

console.log('THE BURNING WOOD');
const sec = L.sections.map(s => s.name); ok(sec.includes('THE BURNING WOOD') && sec.includes("THE KING'S GLADE"), 'the escape and the glade are named areas');
ok(G.run.burn.every(([x0, x1, y]) => { for (let x = x0; x <= x1; x++) if (!solid(x, y)) return false; return true; }), 'its burning floors are ground (a floor, not air)');
ok(G.run.burn.every(([x0, x1, y]) => { let n = 0; for (let x = x0; x <= x1; x++) for (let r = y - 7; r < y; r++) if (oneway(x, r)) { n++; break; } return n >= (x1 - x0 + 1) * 0.5; }), 'boughs over every burning floor (a way over it, in the canopy)');
ok(G.run.branches.length >= 4 && G.run.branches.every(b => stand(Math.floor(b.x / TS), b.y / TS)), 'burning branches hang over a floor or a bough: ' + G.run.branches.length);
ok(L.ents.filter(e => e.kw && e.kw.torch).length >= 3, 'torch goblins on the road: ' + L.ents.filter(e => e.kw && e.kw.torch).length);
{ const sh = L.ents.filter(e => e.t === 'check' && e.x >= 490 && e.x < 600); ok(sh.length === 1 && sh[0].x * TS >= G.run.cpX && G.run.fireMax < G.run.cpX, 'one shrine at its end (col ' + (sh[0] || {}).x + '), past where the fire dies'); }
ok(L.squadBands.some(b => b.lo === 600 && b.spots === 0), 'no squad stands in his glade');
ok(L.lastArena === L.glade, "the route runs to his glade (L.lastArena: tools/pacing's goal)");

console.log('THE GLADE');
const gl = L.glade; ok(gl && gl.boss === 'king' && gl.music === 'gorm' && solid(gl.wallL + 1, 14) && solid(gl.wallR - 1, 14), 'his glade is an arena with a floor (his music stays gorm)');
const kinds = G.glade.hangs.map(h => h.kind).sort().join(','); ok(kinds === 'cage,cage,hive,log', 'in the oak hang two cages, a log trap and a beehive: ' + kinds);
ok(G.glade.hangs.every(h => h.x > gl.x0 && h.x < gl.x1 && h.y0 <= gl.floor - 64 && h.pegs.every(p => p > gl.x0 && p < gl.x1 && solid(Math.floor(p / TS), 14))), 'each hangs over the floor, over his head, with its pegs on the floor');
ok(G.glade.trunkX > gl.x0 && G.glade.trunkX < gl.x1, 'THE GREAT OAK stands in his glade');

/* a fake world for the hands and his AI */
function world() {
  const lvl = { ...L, arena: L.arena, glade: L.glade, gorm: G }; const props = cages.map(c => ({ t: 'dropcage', x: c.x * TS + 8, y: (c.y + 1) * TS, y0: (c.y + 1) * TS, dropped: false, landed: 0, hit: new Set(), boss: true, resetT: 0, big: true }));
  const P = { x: 430 * TS, y: 14 * TS, vx: 0, vy: 0, hp: 50, maxHp: 140, h: 18, face: 1, ground: true, dead: 0 };
  const king = { t: 'king', stage: 'court', x: 448 * TS, y: 14 * TS, w: 68, h: 45, hp: 900, maxHp: 900, alive: true, mode: 'carried', modeT: 1, phase: 1, face: -1, anim: 0 };
  const W0 = { L: lvl, P, props, enemies: [king], king, bossActive: true, drains: {}, healed: 0, numbers: [], t: 0 };
  const ctx = { get L() { return W0.L; }, TS, T, sfx: {}, P: () => P, enemies: () => W0.enemies, boss: () => king, bossActive: () => W0.bossActive, props: () => props, keys: () => ({}), time: () => W0.t, VW: () => 640, VH: () => 360,
    number: (x, y, t) => W0.numbers.push(t), burst: () => {}, dust: () => {}, part: () => {}, shake: () => {}, zoom: () => {}, ring: () => {}, damage: () => 'hit', hurt: (e, d) => { e.hp -= d; if (e.hp <= 0) e.alive = false; },
    drain: (id, r) => { W0.drains[id] = r; }, drainStop: id => { delete W0.drains[id]; }, endFight: () => { W0.bossActive = false; }, solid: (tx, ty) => solid(tx, ty), solidPx: (x, y, f) => solid(Math.floor(x / TS), Math.floor(y / TS)) || (!!f && oneway(Math.floor(x / TS), Math.floor(y / TS)) && (y % TS) < 6),
    moveBody: (e, dx, dy) => { e.x += dx; e.y = Math.min(e.y + dy, (e.stage === 'glade' ? gl.floor : 14 * TS)); return { ground: true }; }, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, text: () => {}, hint: () => {}, spawn: e => { W0.enemies.push(e); return e; }, ehp: () => 10 };
  const H = makeGormHands(ctx); H.reset(); return { W0, H, ctx, P, king, props };
}
console.log('THE FREE ROPES, THE FLEE, THE OPENINGS (his hands in a fake world)');
{ const { W0, H, P, king } = world();
  for (let i = 0; i < 400; i++) { W0.t += 0.01; H.update(0.01); }
  let r = H.read(); const live = r.ropes.find(q => q.i === r.act);
  ok(r.act >= 0 && r.bows.length === 2 && r.bows.every(b => b.rope === r.act), 'the court files two archers onto the live rope\'s deck');
  const pegHb = x => ({ l: x - 4, r: x + 4, t: 14 * TS - 20, b: 14 * TS - 2 });
  /* (claude/kingsfix2) NO LOCK: every rope is free at any moment, its archers alive or not; a blow anywhere along the rope parts it, not only on the peg */
  ok(r.ropes.every(q => q.free), 'every rope is FREE from the first moment (the archers are pressure, not a lock): ' + r.ropes.map(q => q.free).join(','));
  const c0 = W0.props.find(p => Math.abs(p.x - live.x) < 2); H.strike(pegHb(live.pegs[0])); ok(c0.dropped, 'a peg drops the live cage while its archers live');
  const other = r.ropes.find(q => q.i !== r.act), c1 = W0.props.find(p => Math.abs(p.x - other.x) < 2), dk = L.gorm.hall.ropes[other.i].deck[2];
  const mid = { x: (other.x + other.pegs[1]) / 2, y: (dk + 21 + (14 * TS - 13)) / 2 }; H.strike({ l: mid.x - 3, r: mid.x + 3, t: mid.y - 3, b: mid.y + 3 }); ok(c1.dropped, 'a blow MID-ROPE (between its pulley and its peg) on a rope that is not the live one drops that cage');
  ok(c0.big && c1.big, 'the hall cages are BIG (pr.big: the catch is wider, the sprite is the glade cages)');
  H.update(0.01); r = H.read();
  /* the flee */
  ok(H.spare(king) && king.stage === 'flee' && king.hp === king.maxHp && king.maxHp === Math.round(900 * GORM.hp2 / GORM.hp1), 'his P1 bar emptied: SPARED - the flee, a fresh P2 bar (hp2/hp1 of his)');
  ok(P.hp === P.maxHp && !W0.bossActive && W0.L.arena === W0.L.glade, 'the hero FULLY HEALED, the hall\'s fight over, his glade the arena now');
  const f0 = H.read().run.fireX; for (let i = 0; i < 300; i++) { W0.t += 0.01; H.update(0.01); H.kingStep(king, 0.01); }
  ok(H.read().run.on && H.read().run.fireX > f0 && king.stage === 'glade', 'the fire comes after you; the bearers have him in his glade');
  P.x = H.read().run.fireX - 10; H.update(0.01); ok(W0.drains.gormfire > 0, 'caught by the fire: a DRAIN (A13: no stagger)');
  ok(H.persist() && H.persist().stage === 'flee', 'P1 stays beaten (persist)');
  H.reset(); ok(king.stage === 'glade' && king.mode === 'sleep' && W0.L.arena === W0.L.glade && H.read().run.armed, 'a death: he waits in his glade, the wood burns again when you leave the hall');
  P.x = G.run.cpX + 4; for (let i = 0; i < 5; i++) H.update(0.01); ok(H.read().run.done && H.persist().runDone, 'the shrine at the wood\'s end: the run is done'); }
{ let fx = 0; for (let i = 0; i < 100; i++) fx = fireStep(fx, 2000, 0.1); const slow = fireStep(0, 100, 1); ok(fx >= 1490 && slow === GORM.run.v, 'the fire hurries when you are far ahead (' + Math.round(fx) + ' px in 10 s), creeps at ' + GORM.run.v + ' px/s when close'); }
{ const { W0, H, P, king } = world(); H.skipTo('glade'); W0.bossActive = true; king.mode = 'walk'; king.ward = 0; king.open = 0;
  const hang = kind => { const h = G.glade.hangs.find(q => q.kind === kind); return h; };
  const drop = (kind, kx) => { king.x = kx; king.mode = 'walk'; king.ward = 0; const h = hang(kind); H.strike({ l: h.pegs[0] - 4, r: h.pegs[0] + 4, t: 14 * TS - 20, b: 14 * TS - 2 }); for (let i = 0; i < 300 && !['held', 'downed', 'stung'].includes(king.mode); i++) H.update(0.01); return king.mode; };
  ok(drop('cage', hang('cage').x) === 'held', 'a cage from the oak on him: HELD');
  ok(drop('log', hang('log').x + 200) === 'downed', 'the log trap rolls into him: KNOCKED DOWN');
  ok(drop('hive', hang('hive').x + 10) === 'stung', 'the beehive on him: STUNG');
  king.mode = 'walk'; king.ward = 3; const cB = G.glade.hangs.filter(q => q.kind === 'cage')[1]; king.x = cB.x; H.strike({ l: cB.pegs[0] - 4, r: cB.pegs[0] + 4, t: 14 * TS - 20, b: 14 * TS - 2 }); for (let i = 0; i < 300; i++) H.update(0.01);
  ok(king.mode === 'walk' && H.read().n.glance >= 1, 'inside his WARD (B3) it glances off him'); }

console.log('HIS AI (every move told, then released)');
{ const { W0, H, P, king } = world(); const c = { arena: () => W0.L.arena, P: () => P, hands: H, enemies: () => W0.enemies, gormData: () => G, number: () => {}, sfx: {}, shake: () => {}, zoom: () => {}, dust: () => {}, burst: () => {}, part: () => {}, ring: () => {}, damage: () => 'hit', moveBody: (e, dx, dy) => { e.x += dx; return { ground: true }; }, dmg: { grab: 22, litter: 24, sweep: 20, club: 18 } };
  const seen = new Set(), order = []; let last = '';
  const run = (n, fn) => { for (let i = 0; i < n; i++) { W0.t += 0.01; if (fn) fn(i); updateGorm(king, 0.01, c); H.update(0.01); if (king.mode !== last) { order.push(king.mode); seen.add(king.mode); last = king.mode; } } };
  king.mode = 'wake'; king.modeT = 0.5;
  run(9000, i => { P.x = king.x + (i % 1200 < 600 ? 50 : 140); P.y = 14 * TS; if (i === 4000) king.hp = king.maxHp * 0.5; for (const q of W0.enemies) if (q.t === 'royalboar') q.alive = false; });
  const p1 = ['chargeTell', 'charge', 'grabTell', 'grab', 'hornTell', 'horn', 'sweepTell', 'sweep'];
  ok(p1.every(m => seen.has(m)), 'P1 - litter: THE CHARGE, THE HAND, THE HORN; afoot: THE SWEEP: ' + p1.filter(m => seen.has(m)).join(' ') + (p1.some(m => !seen.has(m)) ? ' [seen ' + [...seen].join(' ') + ' phase ' + king.phase + ' hp ' + Math.round(king.hp) + ']' : ''));
  const pre = m => { const out = []; for (let i = 1; i < order.length; i++) if (order[i] === m) out.push(order[i - 1]); return out; };
  ok(['charge', 'grab', 'horn', 'sweep'].every(m => pre(m).every(q => q === m + 'Tell')), 'every P1 release comes straight out of its own windup');
  ok(!seen.has('shoutTell') && !seen.has('liftTell') && !seen.has('cageTell'), 'the old spam is gone: no shout (the court\'s throws), no throne throw, no cage called down on you');
  H.spare(king); king.stage = 'glade'; H.skipTo('glade'); W0.bossActive = true; king.mode = 'wake'; king.modeT = 0.4; seen.clear(); order.length = 0; last = '';
  run(12000, i => { P.x = king.x + ([40, 120, 60, 200][Math.floor(i / 700) % 4]); P.y = 14 * TS; if (i === 3000) king.hp = king.maxHp * 0.65; if (i === 8000) king.hp = king.maxHp * 0.3; for (const q of W0.enemies) if (q.t === 'royalboar' || q.royalHunt) q.alive = false; });
  const p2 = ['limbTell', 'clubHiTell', 'clubHi', 'clubLoTell', 'clubLo', 'hornTell', 'horn', 'shakeTell', 'shake', 'logTell', 'log', 'quakeTell', 'quakeAir', 'quake'];
  ok(p2.every(m => seen.has(m)), 'P2 - THE BURNING BRANCH high and low, THE ROYAL HUNT, THE CANOPY SHAKE, THE LOG ROLL, THE BELLY QUAKE: ' + p2.filter(m => seen.has(m)).join(' ') + (p2.some(m => !seen.has(m)) ? ' (missing ' + p2.filter(m => !seen.has(m)).join(' ') + ')' : ''));
  ok(['clubHi', 'clubLo', 'horn', 'shake', 'log'].every(m => pre(m).every(q => q === m + 'Tell')) && pre('quakeAir').every(q => q === 'quakeTell'), 'every P2 release comes straight out of its own windup');
  ok(king.huntN === 2 && H.read().n.boars >= 2, 'THE ROYAL HUNT at both its thresholds (' + GORM.huntAt.join(', ') + '): ' + king.huntN); }

console.log('B15 AND THE ROYAL BOAR');
ok(GORM.chip >= 0.4 && gormTake({ mode: 'walk' }) === null && gormTake({ mode: 'held' }) === 2 && gormTake({ mode: 'walk', open: 1 }) === GORM.take.open, 'outside an opening a blade lands at ' + GORM.chip + ' (never nothing); held x2, open x' + GORM.take.open);
ok(gormOpen({ mode: 'downed' }) && gormOpen({ mode: 'stung' }) && !gormOpen({ mode: 'walk' }), 'his openings: held, knocked down, stung, open');
{ const b = L.ents.find(e => e.t === 'royalboar'); ok(b && b.x > 131 && b.x < 174 && b.y === 38, 'THE ROYAL BOAR roots in the Hunting Stands\' meadow (col ' + (b && b.x) + ')');
  const m = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'); ok(/t: 'royalboar', name: 'THE ROYAL BOAR'/.test(m) && /royalboar: RBM\.RB\.hp/.test(m), 'it is in the bestiary and EHP');
  const e = newRoyalBoar(100, 100, { face: 1 }); let hit = 0; const P = { x: 220, y: 100, dead: 0 }; const c = { P: () => P, TS, solid: (x, y) => y >= 7, oneWay: () => false, moveBody: (q, dx) => { q.x += dx; return { ground: true }; }, damage: () => { hit++; return 'hit'; }, number: () => {}, dust: () => {}, part: () => {}, sfx: {} };
  e.y = 112; P.y = 112; for (let i = 0; i < 200 && e.mode !== 'charge'; i++) boarStep(e, 0.01, c); ok(e.lane && e.mode === 'charge' && hit === 0, 'it paws first (its told windup), its lane drawn, then it charges');
  P.y = 112 - 40; for (let i = 0; i < 300; i++) boarStep(e, 0.01, c); ok(hit === 0 && e.x > 220, 'jumped (the hero over it): it runs on under him'); }
console.log(bad ? '\ngorm2: ' + bad + ' FAILED' : '\nok  gorm2');
process.exit(bad ? 1 : 0);
