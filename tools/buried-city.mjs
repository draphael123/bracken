// tools/buried-city.mjs - THE BURIED CITY's own check (claude/buriedcity). Node only: no page, no port, no Chrome. The built level, the pure modules, and the hands in
// a fake world (src/buried-city-hands.js takes a context; here it is a grid, a hero and a list of foes):
//   - the rule line is the code's (LEVELS row == src/buried-city.js header); the arcs teach -> test -> remix -> exam; the verb is REQUIRED (the reach model: the
//     throne room is reached only with the rooms' sand worked - THE GREAT SAND-GATE drained, THE UPPER BULB drained, THE TRAP HALL filled); signs at the point of use
//   - the sand rule in the hands: a lever opens/shuts a room's gate, an open gate drains it and a shut one fills it a row at a time, the rising sand CARRIES a hero
//     up, THE HOURGLASS's upper hall runs into the lower, THE TRAP HALL's floor-gate is its floor, the great wheel's three turns drain the quarter and its buried foes
//     stand up, a construct the moving sand carries is JAMMED (and takes a blow twice over), five gears open THE CLOCKWORK VAULT; a respawn keeps the great gate
//   - the cast: one new foe (the construct), reskins by cnSkin (no goblin: the road is past the Goblin Queen), a reskinned ranged foe, role mix, no type over 35%,
//     silver at most 3 (the vault's is one of them), five gears
//   - THE HOURGLASS KING (src/hourglass-king.js, a fake world): a lever while his glass is full does nothing (told), while it runs low he STALLS - open, dragged to the
//     lever, standing (B4/B12) - and a told ward follows (B3); outside openings his brass takes >= 0.4 (B15); one new told move a phase, and each phase changes the
//     arena (banks, pours); no adds; his marks are src/marks.js's
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { SECTIONS, ARCS, RULE, ROOMS, WHEEL } from '../src/buried-city.js';
import { makeBuriedCityHands, BCS } from '../src/buried-city-hands.js';
import * as HKM from '../src/hourglass-king.js';
import { newConstruct, constructStep, CONSTRUCT } from '../src/construct.js';
import { MARK, ANSWER } from '../src/marks.js';
import { OPEN_RULE, OWN_WARD } from '../src/boss-greed.js';
import { SYNTH_BOSS, SYNTH_VARIANT } from '../src/boss-music.js';
import { STUCK_HANDS } from '../src/stuck-spots.js';
import { isCallout } from '../src/hint-lines.js';
const TS = 16; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const lv = LEVELS.find(l => l.id === 'buriedcity'); ok(lv, 'buriedcity is in LEVELS'); ok(lv.needs === 'ksar', 'THE BURIED CITY needs THE BANDIT KSAR (the main road)');
const L = lv.build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
/* THE RULE LINE is the code's */
const src = readFileSync(new URL('../src/buried-city.js', import.meta.url), 'utf8');
ok(lv.rule === RULE && src.includes('// THE RULE: ' + lv.rule), 'the rule line in LEVELS is the one src/buried-city.js states');
ok(/PULL A SAND-GATE/.test(RULE) && /DRAINS/.test(RULE) && /SHUT IT/.test(RULE) && /CARRIES YOU/.test(RULE), 'the rule line names the verb and what it does (drain / rise / carry)');
/* THE ARCS: drain taught, tested, remixed, examined; fill taught, remixed, examined; ride taught, tested */
ok(ARCS.drain.teach[0] < ARCS.drain.test[0] && ARCS.drain.test[0] < ARCS.drain.remix[0] && ARCS.drain.remix[0] < ARCS.drain.exam[0], 'drain: teach -> test -> remix -> exam, in order');
ok(ARCS.fill.teach[0] < ARCS.fill.remix[0] && ARCS.fill.remix[0] < ARCS.fill.exam[0] && ARCS.ride.teach[0] < ARCS.ride.test[0], 'fill and ride in order');
ok(new Set(ROOMS.map(r => r.use)).size >= 3, 'the sand asks three things of you (drain, ride, fill) - a remix, not a repeat');
ok(SECTIONS.length === 6 && SECTIONS.every((s, i) => i === 0 || s[1] > SECTIONS[i - 1][1]), 'five sections and the throne room, in order');
/* THE TEACH ROOM IS SAFE: no foe in reach of its lever */
const foes = L.ents.filter(e => ['ambusher', 'slinger', 'scorpion', 'construct'].includes(e.t));
ok(!foes.some(e => Math.abs(e.x - 51) < 18 && !e.sandWait), 'THE FIRST SAND ROOM is taught bare (no foe within 18 tiles of its lever)');
/* SIGNS at the point of use, with the right verb */
const sign = (x0, x1, re) => L.ents.some(e => e.t === 'sign' && e.x >= x0 && e.x <= x1 && re.test(e.text));
ok(sign(44, 51, /E PULLS A SAND-GATE/), 'a sign at the first lever says E PULLS A SAND-GATE');
ok(sign(110, 121, /SHUT THE GATE/), 'a sign at the granary says SHUT THE GATE');
ok(sign(200, 208, /SHUT THE GATE/), 'a sign at the cellar says SHUT THE GATE');
ok(sign(300, 313, /TURNS THE WHEEL/), 'a sign at the great wheel says E TURNS THE WHEEL');
ok(sign(440, 451, /FALL HERE IS THE END/), 'the trap hall\'s deadly drop is told before it (its lip is 451: the sign stands on the lip side of the lever, fix pass M3)');
/* THE TRAP HALL'S DEATH IS TAUGHT FIRST (A10 amended: an exam death once taught, never untold - the BCREVIEW's M3): a small OPEN floor-gate before it, survivable,
   with a floor under it and its own lever and sign; and the exam hall is drawn lethal (its lamps) */
{ const yd = ROOMS.find(r => r.id === 'yard'), tr = ROOMS.find(r => r.id === 'trap');
  ok(yd && yd.trap && yd.teach && yd.init === 'empty' && yd.x1 < tr.x0, 'THE FOUNDRY\'S FLOOR-GATE (open on a fresh load) comes before the trap hall: the drop is taught');
  ok([...Array(yd.x1 - yd.x0 + 1).keys()].every(k => at(yd.x0 + k, yd.floor + 1) === T.SOLID), 'the foundry\'s floor-gate has a floor under it: survivable');
  ok(sign(yd.x0 - 8, yd.x0 - 1, /FLOOR-GATE IS A DROP/), 'a sign before the foundry\'s floor-gate says AN OPEN FLOOR-GATE IS A DROP');
  ok(L.ents.some(e => e.t === 'sandlever' && e.room === 'yard' && e.x < yd.x0), 'the foundry\'s floor-gate has its lever on the near lip');
  ok((tr.lamps || []).length === 2, 'the trap hall\'s lips are lamp-lit (red open, gold shut)'); }
/* THE SECTION EXAMS ARE ELITES (fix pass M4): the halls, the quarter and the throne street */
ok([295, 388, 486].every(x => L.ents.some(e => e.t === 'construct' && e.x === x && e.elite)), 'the three section exams are ELITE constructs (295, 388, 486)');
/* REQUIRED: the reach model */
const arenaCol = L.arena.x0 / TS + 4, arenaRow = L.arena.floor / TS - 1;
const reaches = Lx => { const R = floodReach(Lx, T); for (const k of R.seen) { const [x, y] = k.split(',').map(Number); if (x >= arenaCol - 2 && x <= arenaCol + 6 && Math.abs(y - arenaRow) <= 1) return true; } return false; };
ok(reaches(L), 'the throne room is reached with the sand worked (the reach model: fill rooms full, ride rooms a stair, the quarter drained)');
const withSand = (ids, o = {}) => { const g = L.grid.slice(); for (const r of ROOMS.filter(q => ids.includes(q.id))) for (let k = 0; k < r.full; k++) for (let x = r.x0; x <= r.x1; x++) g[(r.floor - 1 - k) * L.W + x] = T.SOFT; return { ...L, grid: g, ...o }; };
ok(!reaches(withSand(['great'])), 'REQUIRED: with THE DROWNED QUARTER full of sand nothing reaches the throne room (THE GREAT SAND-GATE)');
ok(!reaches(withSand(['upperbulb'])), 'REQUIRED: with THE UPPER BULB full nothing gets past THE HOURGLASS (drain it)');
ok(!reaches(withSand(['first'])), 'REQUIRED: with THE FIRST SAND ROOM full nothing gets past it (the teach is a use)');
ok(!reaches({ ...L, sandSolid: L.sandSolid.filter(b => b[0] !== ROOMS.find(r => r.id === 'trap').x0) }), 'REQUIRED: THE TRAP HALL unfilled is a drop nothing crosses (fill it)');
ok(!reaches({ ...L, sandRungs: [] }), 'REQUIRED: without riding the sand up (THE GRANARY, THE CLOCK SHAFT) the way on is out of reach');
/* THE CAST */
const types = foes.map(e => e.cnSkin || e.t), count = {}; for (const t of types) count[t] = (count[t] || 0) + 1;
ok(!foes.some(e => /gob/.test(e.cnSkin || e.t) || e.t === 'sandgob'), 'no goblin (the road is past the Goblin Queen)');
ok(foes.filter(e => e.t !== 'construct').every(e => e.cnSkin), 'every proven machine wears the city\'s skin (cnSkin)');
ok(foes.some(e => e.t === 'slinger' && e.cnSkin === 'sandslinger'), 'a reskinned ranged foe (THE SAND-FOLK SLINGER)');
ok(Object.keys(count).length >= 4, 'the role mix: ' + JSON.stringify(count));
for (const [t, c] of Object.entries(count)) ok(c / types.length <= 0.35, t + ' is ' + Math.round(c / types.length * 100) + '% of the cast (<= 35%)');
ok(L.ents.filter(e => e.t === 'silver').length <= 3, 'silver at most 3 (' + L.ents.filter(e => e.t === 'silver').length + ')');
ok(L.ents.filter(e => e.t === 'stray' && e.kind === 'gear').length === 5 && L.quest.n === 5, 'five gears, and the quest counts five');
ok(L.vaultDoors.length === 1 && L.vaultDoors[0].gears === 5, 'one clockwork vault, five gears');
ok(!L.ents.some(e => e.t === 'relic'), 'no relic (the vault pays silver)');
/* THE CONSTRUCT (pure) */
{ const s = newConstruct(100, 100); s.cd = 0; let evs = [], told = [], blows = [];
  for (let i = 0; i < 600; i++) { evs = constructStep(s, { px: 120, py: 100, time: i / 60, jam: 0 }, 1 / 60); for (const v of evs) { if (v.t === 'tell') told.push(v.what); if (v.t === 'hit') blows.push(v); } }
  ok(told.slice(0, 3).join() === 'poke,poke,sweep', 'the construct keeps its rhythm: POKE, POKE, SWEEP (' + told.slice(0, 3) + ')');
  ok(blows.find(b => b.what === 'poke').blockable && !blows.find(b => b.what === 'sweep').blockable && blows.find(b => b.what === 'sweep').low, 'a shield turns the poke; the sweep runs the floor (jump it)');
  const j = newConstruct(100, 100); constructStep(j, { px: 120, py: 100, time: 0, jam: 2 }, 1 / 60); ok(j.mode === 'jammed', 'moving sand JAMS a construct');
  for (let i = 0; i < 60; i++) { const e2 = constructStep(j, { px: 120, py: 100, time: i / 60, jam: 0 }, 1 / 60); ok(!e2.some(v => v.t === 'hit'), 'a jammed construct throws nothing'); }
  ok(MARK['construct|pokeTell'] === '!' && MARK['construct|sweepTell'] === '!!' && ANSWER['construct|sweepTell'] === 'jump', 'the construct\'s marks are the table\'s'); }
/* THE HANDS IN A FAKE WORLD */
const grid = L.grid.slice(), cell = (x, y) => grid[y * L.W + x];
const hero = { x: 0, y: 0, h: 14, vy: 0, dead: false }, enemies = [], said = [];
let quest = 0, spawned = [];
const ctx = { get L() { return L; }, players: [hero], TS, T, sfx: {}, hero: () => hero, movers: () => [], enemies: () => enemies, time: () => 0, VW: () => 480, VH: () => 270,
  number: (x, y, t) => said.push(t), text: () => {}, burst: () => {}, shake: () => {}, cellGet: (x, y) => cell(x, y), cellSet: (x, y, t) => { grid[y * L.W + x] = t; },
  questGot: () => quest, bossLever: () => 'busy', spawnEnt: (e) => { const m = { t: e.t, x: e.x * TS + 8, y: (e.y + 1) * TS, alive: true }; spawned.push(m); return m; } };
L.grid = grid;   /* (the hands write the sand into the level's grid: the fake world's grid is it) */
const H = makeBuriedCityHands(ctx); H.reset();
const K = H.state(), room = id => K.rooms.find(r => r.id === id), run = (s, dt = 1 / 30) => { for (let t = 0; t < s; t += dt) H.update(dt); };
const place = (c, row) => { hero.x = c * TS + 8; hero.y = (row + 1) * TS; hero.vy = 0; };
const pull = (c, row) => { place(c, row); for (let i = 0; i < 40; i++) H.update(1 / 30); return H.interact(hero); };
ok(cell(60, 33) === T.SOFT && cell(60, 29) === T.SOFT && cell(60, 28) !== T.SOFT, 'a fresh load: THE FIRST SAND ROOM is full to its doorway (sand rows 29-33)');
ok(H.waits(L.ents.find(e => e.sandWait)), 'the quarter\'s foes wait under its sand');
ok(pull(51, 33) && room('first').gate === 'open', 'E at the first lever opens its gate'); run(4);
ok(room('first').level === 0 && cell(60, 33) === T.AIR, 'the open gate DRAINS the room: its cells are as built again');
ok(said.includes('THE GATE IS OPEN: THE ROOM DRAINS'), 'the pull is told');
/* THE GRANARY: shut its gate from inside, the sand carries the hero up to the high door */
ok(pull(121, 33) && room('granary').gate === 'shut', 'the granary\'s lever shuts its gate'); place(127, 33); run(10);
ok(room('granary').level >= room('granary').full - 0.01 && Math.round(hero.y / TS) - 1 <= 25, 'THE SAND CARRIES YOU UP: the hero stands on the full granary (feet row ' + (Math.round(hero.y / TS) - 1) + ')');
ok(cell(133, 25) === T.AIR && cell(133, 26) === T.SOLID, 'the granary\'s high door opens at the sand\'s top');
/* THE SPIKE CELLAR: shut, fill, the stakes are covered */
ok(pull(208, 33) && room('cellar').gate === 'shut', 'the cellar\'s lever shuts its gate'); run(6);
ok(cell(215, 39) === T.SOFT && cell(215, 34) === T.SOFT, 'the cellar fills over its stakes to the lip');
/* THE HOURGLASS: open the upper bulb, the lower fills */
ok(pull(245, 29) && room('upperbulb').gate === 'open', 'the upper bulb\'s lever opens its gate'); run(7);
ok(room('upperbulb').level === 0 && room('lowerbulb').level >= room('lowerbulb').full - 0.01, 'THE HOURGLASS: the upper hall ran down into the lower (' + room('lowerbulb').level.toFixed(1) + ')');
/* a construct carried by moving sand is JAMMED */
{ const r = room('cellar'); r.gate = 'open'; run(4); const e = { t: 'construct', alive: true, x: 218 * TS, y: 40 * TS, h: 18, st: newConstruct(218 * TS, 40 * TS) }; enemies.push(e); r.gate = 'shut'; run(0.8);
  ok(e.bcJam > 0, 'a construct the filling sand carries is JAMMED'); const w = {}; H.world(e, e.st, w); ok(w.jam > 0, 'the hands tell its machine (w.jam)');
  e.st.mode = 'jammed'; ok(H.takeConstruct(e, 10) === 10 * BCS.jamMul, 'a jammed construct takes a blow x' + BCS.jamMul); enemies.length = 0; run(6); }
/* THE GREAT SAND-GATE: three turns, the quarter drains, its foes stand up */
const W = L.wheel; for (let i = 0; i < 3; i++) { place(W.x, W.row); H.interact(hero); run(1); }
ok(K.wheel.done, 'three turns open THE GREAT SAND-GATE'); run(12);
ok(room('great').level === 0 && cell(346, 30) === T.AIR, 'the quarter drains: its old street comes out');
ok(spawned.length === L.ents.filter(e => e.sandWait).length, 'the quarter\'s buried foes stand up when the sand has gone off them (' + spawned.length + ')');
/* THE TRAP HALL: its floor-gate IS its floor */
ok(cell(458, 44) === T.AIR, 'THE TRAP HALL\'s floor-gate is open as laid: a drop');
ok(pull(449, 29) && room('trap').gate === 'shut' && cell(458, 44) === T.SOLID, 'its lever shuts the floor-gate (the floor is there)'); run(8);
ok(cell(458, 30) === T.SOFT, 'the hall fills to the street: walk over');
/* THE CLOCKWORK VAULT */
const V = L.vaultDoors[0]; place(V.x + 1, V.y1); quest = 4; H.interact(hero); ok(cell(V.x, V.y0) === T.SOLID, 'four gears: the vault stays shut (told)');
quest = 5; H.interact(hero); ok(cell(V.x, V.y0) === T.AIR, 'five gears open THE CLOCKWORK VAULT');
/* A RESPAWN: the small rooms as built, the great gate kept */
H.reset(); ok(room('great').level === 0 && K.wheel.done, 'a respawn keeps THE GREAT SAND-GATE open'); ok(room('first').level === room('first').full && cell(60, 33) === T.SOFT, 'a respawn fills the first room again');
ok(room('trap').gate === 'open' && cell(458, 44) === T.AIR && cell(458, 30) === T.AIR, 'a respawn opens the trap hall\'s floor-gate again (and its sand is gone)');
/* THE GLINT: every route lock is a stuck spot */
ok((STUCK_HANDS.buriedcity || []).length >= 8, 'the route\'s locks glint (' + (STUCK_HANDS.buriedcity || []).length + ' stuck spots)');
for (const sp of STUCK_HANDS.buriedcity) for (const s of sp.steps) ok(isCallout(s.line), 'the nudge line is shown: ' + s.line);
/* THE HOURGLASS KING (pure) */
const G = HKM.geom(L.arena, TS); ok(G.levers.length === 2, 'two sand-gate levers in the throne room');
ok(HKM.HK.resist >= 0.4 && HKM.HK.wardMul >= 0.4, 'B15: outside his openings his brass takes >= 0.4 (resist ' + HKM.HK.resist + ', ward ' + HKM.HK.wardMul + ')');
ok(HKM.HK.openMul >= 1.5 && HKM.HK.openMul <= 2.0, 'his opening pays x' + HKM.HK.openMul + ' (1.5-2)');
ok(HKM.HK.wardT >= 2.5 && HKM.HK.wardT <= 3.5, 'B3: a ~3 s ward after each opening');
const c = { said: [], banks: null, hits: [], number(x, y, t) { this.said.push(t); }, mark() {}, sound() {}, fx() {}, shake() {}, music() {}, time: () => 0, hit(b, d, name) { this.hits.push(name); return false; }, banks(on) { this.banks = on; } };
c.banks = function (on) { c.bankOn = on; };
const e = { t: 'hourglassking', x: (G.x0 + G.x1) / 2, y: G.floorY, hp: 1000, maxHp: 1000, alive: true, mode: 'wake', modeT: 0.01, face: -1, open: 0 }, S = HKM.newFight(G);
const hero2 = [{ x: G.x0 + 60, y: G.floorY, ground: true, alive: true }];
for (let i = 0; i < 30; i++) HKM.stepHourglassKing(e, S, 1 / 60, hero2, c);
ok(HKM.leverPulled(e, S, c, G.levers[0].x) === 'full' && c.said.includes('HIS GLASS IS FULL: NOT YET'), 'a lever while his glass is full does nothing - and says so');
S.glass = S.glassMax * HKM.HK.lowAt - 0.1; e.mode = 'walk';
ok(HKM.leverPulled(e, S, c, G.levers[0].x) === 'stall' && HKM.hkOpen(e), 'a lever while his glass runs low STALLS him: OPEN');
const x0 = e.x; for (let i = 0; i < 60; i++) HKM.stepHourglassKing(e, S, 1 / 60, hero2, c);
ok(Math.abs(e.x - G.levers[0].x) <= HKM.HK.dragStop + 4 && Math.abs(e.x - G.levers[0].x) >= HKM.HK.dragStop - 4, 'B12: the sand drags him to the lever you pulled and stops him a step short (' + Math.round(x0) + ' -> ' + Math.round(e.x) + ')');
const xs = e.x; for (let i = 0; i < 60; i++) HKM.stepHourglassKing(e, S, 1 / 60, hero2, c); ok(e.x === xs && e.mode === 'stall', 'B4: stalled he stands still');
for (let i = 0; i < 60 * 4; i++) HKM.stepHourglassKing(e, S, 1 / 60, hero2, c);
ok(!HKM.hkOpen(e) && S.ward > 0 && S.n.wards === 1, 'B3: the opening ends in a told ward');
ok(HKM.leverPulled(e, S, c, G.levers[1].x) === 'ward', 'a lever in his ward finds nothing (told)');
/* one new told move a phase; each phase changes the arena */
const mv = ph => new Set(HKM.CYCLES[ph].flat());
ok([...mv(2)].filter(m => !mv(1).has(m)).join() === 'slip', 'phase two brings ONE new move: THE TIME SLIP');
ok([...mv(3)].filter(m => !mv(1).has(m) && !mv(2).has(m)).join() === 'hour', 'phase three brings ONE new move: THE HOUR STRIKES');
for (const m of ['pendTell', 'gearTell', 'streamTell', 'slipTell', 'hourTell']) ok(MARK['hourglassking|' + m] === HKM.MOVES[m].mark && ANSWER['hourglassking|' + m] === HKM.MOVES[m].answer, 'his ' + m + ' is told: ' + HKM.MOVES[m].mark + ' / ' + HKM.MOVES[m].answer);
{ const e3 = { ...e, mode: 'walk', modeT: 0.5, open: 0, hp: 590 }; const S3 = HKM.newFight(G); S3.ward = 0; c.bankOn = null; HKM.stepHourglassKing(e3, S3, 1 / 60, hero2, c);
  ok(S3.ph === 2 && c.bankOn === true, 'phase two changes the arena: the sand banks at the walls');
  e3.hp = 200; e3.mode = 'walk'; HKM.stepHourglassKing(e3, S3, 1 / 60, hero2, c); ok(S3.ph === 3 && S3.glassMax === HKM.HK.glass3, 'phase three: his glass cracks (it runs faster)');
  c.hits.length = 0; for (let i = 0; i < 40; i++) HKM.stepHourglassKing(e3, S3, 1 / 60, hero2, c); ok(c.hits.includes('THE POURING SAND'), 'phase three changes the arena: two steady pours from the broken roof'); }
const hkSrc = readFileSync(new URL('../src/hourglass-king.js', import.meta.url), 'utf8') + readFileSync(new URL('../src/hourglass-king-hands.js', import.meta.url), 'utf8');
ok(!/ctx.spawn(?!Boss)|enemies().push|enemies.push/.test(hkSrc), 'NO ADDS: the king summons nothing');
ok(OPEN_RULE.hourglassking && OWN_WARD.has('hourglassking'), 'the greed rule knows his opening; his brass is his own ward (no x0.05 chip)');
ok(SYNTH_BOSS.hourglassking && SYNTH_VARIANT['hourglassking:p2'] && SYNTH_VARIANT['hourglassking:p3'] && !SYNTH_BOSS.buriedcity, "his three-phase theme is composed in code; the city's greybox synth bed is gone (music pass: 'Loopable Dungeon Ambience' is the level track)");
console.log('buried-city: ' + n + ' checks green');
