// tools/buried-city.mjs - THE BURIED CITY's own check (claude/buriedcity; BURIED CITY 2, claude/buriedcity2). Node only: no page, no port, no Chrome. The built
// level, the pure modules, and the hands in a fake world (src/buried-city-hands.js takes a context; here it is a grid, a hero and a list of foes):
//   - the rule line is the code's (LEVELS row == src/buried-city.js header); the arcs teach -> test -> remix -> exam; the verb is REQUIRED (the reach model: the
//     throne room is reached only with the rooms' sand worked - THE FIRST ROOM drained, THE SINKING STREET sunk, THE UPPER BULB drained, THE SAND-FALL's heap
//     piled, THE GREAT SAND-GATE drained, THE TRAP HALL filled); signs at the point of use
//   - THE CITY IS BURIED (brief 1): no sky past the sinkhole except the shafts where the roof has fallen in, and THE SUN only there (A13); the landmark and the
//     king's approach (B8) are laid; platform variety (brief 4: not one plank)
//   - the sand rule in the hands: a lever opens/shuts a room's gate, an open gate drains it and a shut one fills it a row at a time, the rising sand CARRIES a hero
//     up, THE SINKING STREET goes down with its sand (the deck and its roofs written on the sand's top) and carries a hero down to the arch and back up, THE
//     HOURGLASS's upper hall runs into the lower, THE SAND-FALL's chute piles a heap where it lands (a body on it is lifted, a hero in the fall is beaten down, a
//     construct in it JAMMED), THE TRAP HALL fills only with its floor-gate shut AND the fall swung in, the great wheel's three turns drain the quarter and its
//     buried foes stand up, five gears open THE CLOCKWORK VAULT; a respawn keeps the great gate and flattens the heaps
//   - the cast: one new foe (the construct), reskins by cnSkin (no goblin: the road is past the Goblin Queen), a reskinned ranged foe, role mix, no type over 35%,
//     the three section exams are ELITES, silver at most 3, five gears
//   - THE HOURGLASS KING (src/hourglass-king.js, a fake world): a lever while his glass is full does nothing (told), while it runs low he STALLS - open, dragged to the
//     lever, standing (B4/B12) - and a told ward follows (B3); outside openings his brass takes >= 0.4 (B15); one new told move a phase, and each phase changes the
//     arena (banks, pours); B12: his low window is long enough to reach a lever in every phase; no adds; his marks are src/marks.js's
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { SECTIONS, ARCS, RULE, ROOMS, CHUTES, WHEEL, SUN, DY } from '../src/buried-city.js';
import { makeBuriedCityHands, BCS } from '../src/buried-city-hands.js';
import * as HKM from '../src/hourglass-king.js';
import { newConstruct, constructStep } from '../src/construct.js';
import { MARK, ANSWER } from '../src/marks.js';
import { OPEN_RULE, OWN_WARD } from '../src/boss-greed.js';
import { SYNTH_BOSS, SYNTH_VARIANT } from '../src/boss-music.js';
import { STUCK_HANDS } from '../src/stuck-spots.js';
import { isCallout } from '../src/hint-lines.js';
const TS = 16; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const lv = LEVELS.find(l => l.id === 'buriedcity'); ok(lv, 'buriedcity is in LEVELS'); ok(lv.needs === 'ksar', 'THE BURIED CITY needs THE BANDIT KSAR (the main road)');
const L = lv.build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
const room0 = id => ROOMS.find(r => r.id === id), chute0 = id => CHUTES.find(c => c.id === id);
/* THE RULE LINE is the code's */
const src = readFileSync(new URL('../src/buried-city.js', import.meta.url), 'utf8');
ok(lv.rule === RULE && src.includes('// THE RULE: ' + lv.rule), 'the rule line in LEVELS is the one src/buried-city.js states');
ok(/PULL A SAND-GATE/.test(RULE) && /DRAINS/.test(RULE) && /SHUT IT/.test(RULE) && /CARRIES YOU/.test(RULE), 'the rule line names the verb and what it does (drain / rise / carry)');
/* THE ARCS: drain taught, tested, remixed, examined; fill taught, remixed, examined; ride taught, remixed (the street), tested; the fall taught and examined */
ok(ARCS.drain.teach[0] < ARCS.drain.test[0] && ARCS.drain.test[0] < ARCS.drain.remix[0] && ARCS.drain.remix[0] < ARCS.drain.exam[0], 'drain: teach -> test -> remix -> exam, in order');
ok(ARCS.fill.teach[0] < ARCS.fill.remix[0] && ARCS.fill.remix[0] < ARCS.fill.exam[0] && ARCS.ride.teach[0] < ARCS.ride.remix[0] && ARCS.ride.remix[0] < ARCS.ride.test[0], 'fill and ride in order');
ok(ARCS.fall.teach[0] < ARCS.fall.exam[0] && ARCS.sun.teach[0] < ARCS.sun.test[0] && ARCS.sun.test[0] < ARCS.sun.remix[0] && ARCS.sun.remix[0] < ARCS.sun.exam[0], 'the fall taught then examined; the sun under the roof taught, tested, remixed, examined');
ok(new Set(ROOMS.map(r => r.use)).size >= 4 && CHUTES.some(c => Object.values(c.to).some(t => t.kind === 'mound')) && CHUTES.some(c => Object.values(c.to).some(t => t.kind === 'room')),
  'A4: the sand asks seven things of you (drain, ride, sink, fill, run down, pile up, feed) - a remix, not a repeat');
ok(SECTIONS.length === 10 && SECTIONS.every((s, i) => i === 0 || s[1] > SECTIONS[i - 1][1]), 'the dunes, eight sections (claude/buriedcity3: THE ROOFTOPS, outside) and the throne room, in order');
/* THE FLIP (claude/buriedcity3, Daniel 10-12: "the hourglass is unclear in function" - now it is the level's second verb): taught -> tested -> remixed -> examined, then the king */
ok(ARCS.flip.teach[0] < ARCS.flip.test[0] && ARCS.flip.test[0] < ARCS.flip.remix[0] && ARCS.flip.remix[0] < ARCS.flip.exam[0] && ARCS.flip.exam[0] < ARCS.flip.boss[0], 'the flip: teach -> test -> remix -> exam -> the king, in order');
{ const uses = new Set(); for (const r of L.risers) uses.add(r.sinks ? 'sink' : 'rise'); if (L.banks.length) uses.add('bank'); if (L.dfalls.length) uses.add('fallup'); if (L.glasses.filter(g => L.risers.some(r => r.glass === g.id)).length >= 3) uses.add('chain');
  ok(uses.size >= 4, 'A4: the flip asks ' + uses.size + ' things of you (' + [...uses] + ') - a remix, not a repeat'); }
ok(/STRIKE AN HOURGLASS/.test(RULE) && /BACKWARD/.test(RULE), 'the rule line names the second verb (STRIKE AN HOURGLASS: THE SAND RUNS BACKWARD)');
/* THE TEACH ROOM IS SAFE: no foe in reach of its lever */
const foes = L.ents.filter(e => ['ambusher', 'slinger', 'scorpion', 'construct'].includes(e.t));
ok(!foes.some(e => Math.abs(e.x - 58) < 18 && !e.sandWait), 'THE FIRST SAND ROOM is taught bare (no foe within 18 tiles of its lever)');
{ const g0 = L.glasses.find(g => g.id === 'stair'); ok(g0 && !foes.some(e => Math.abs(e.x - g0.x) < 10 && Math.abs(e.y - g0.y) < 6), 'THE FIRST HOURGLASS is taught bare (no foe within 10 tiles of it)'); }
/* SIGNS at the point of use, with the right verb */
const sign = (x0, x1, re) => L.ents.some(e => e.t === 'sign' && e.x >= x0 && e.x <= x1 && re.test(e.text));
ok(sign(52, 60, /E PULLS A SAND-GATE/), 'a sign at the first lever says E PULLS A SAND-GATE');
ok(sign(46, 52, /SUN STILL BURNS/), 'a sign at the first shaft of sun says the sun still burns where the roof has fallen in');
ok(sign(130, 144, /SHUT THE GATE/), 'a sign at the granary says SHUT THE GATE');
ok(sign(190, 197, /OPEN ITS GATE AND IT SINKS/), 'a sign at the sinking street says OPEN ITS GATE AND IT SINKS');
ok(sign(234, 242, /SHUT THE GATE/), 'a sign at the cellar says SHUT THE GATE');
ok(sign(338, 345, /CHUTE LEVER SWINGS THE SAND-FALL/), 'a sign at the sand-fall says THE CHUTE LEVER SWINGS THE SAND-FALL');
ok(sign(395, 405, /TURNS THE WHEEL/), 'a sign at the great wheel says E TURNS THE WHEEL');
ok(sign(96, 102, /STRIKE THE HOURGLASS/) && sign(306, 311, /STRIKE THE HOURGLASS/) && sign(646, 656, /SAND-FALL FLOWS UP/) && sign(710, 719, /SINKS THE ROOF/), 'the flip is told at every new use: the first glass, the bank, the fall that flows up, the exam sinking roof');
ok(sign(530, 539, /CHUTE LEVER SWINGS THE SAND-FALL INTO THE HALL/) && sign(540, 545, /FALL HERE IS THE END/), 'the trap hall\'s two verbs are told at their levers, and its deadly drop before its lip');
/* THE TRAP HALL'S DEATH IS TAUGHT FIRST (A10 amended: an exam death once taught, never untold - the BCREVIEW's M3): a small OPEN floor-gate before it, survivable,
   with a floor under it and its own lever and sign; and the exam hall is drawn lethal (its lamps) */
{ const yd = room0('yard'), tr = room0('trap');
  ok(yd && yd.trap && yd.teach && yd.init === 'empty' && yd.x1 < tr.x0, 'THE FOUNDRY\'S FLOOR-GATE (open on a fresh load) comes before the trap hall: the drop is taught');
  ok([...Array(yd.x1 - yd.x0 + 1).keys()].every(k => at(yd.x0 + k, yd.floor + 1) === T.SOLID), 'the foundry\'s floor-gate has a floor under it: survivable');
  ok([...Array(tr.x1 - tr.x0 + 1).keys()].every(k => { for (let y = tr.floor; y < L.H; y++) if (at(tr.x0 + k, y) !== T.AIR) return false; return true; }), 'THE TRAP HALL open is a drop out of the world (no floor under its floor-gate)');
  ok(sign(yd.x0 - 8, yd.x0 - 1, /FLOOR-GATE IS A DROP/), 'a sign before the foundry\'s floor-gate says AN OPEN FLOOR-GATE IS A DROP');
  ok(L.ents.some(e => e.t === 'sandlever' && e.room === 'yard' && e.x < yd.x0), 'the foundry\'s floor-gate has its lever on the near lip');
  ok((tr.lamps || []).length === 2 && tr.fedBy === 'trapfall' && !tr.pour, 'the trap hall\'s lips are lamp-lit (red open, gold shut), and only the sand-fall feeds it'); }
/* THE SECTION EXAMS ARE ELITES on footing with a hazard by them: the halls (a shaft of sun on him, stakes behind him), the quarter (a drift at his back), the throne street (a drift at yours, his gate) */
{ const el = L.ents.filter(e => e.t === 'construct' && e.elite).map(e => e.x).sort((a, b) => a - b);
  ok(el.join() === '318,484,582,743', 'the four section exams are ELITE constructs (' + el + ') - claude/buriedcity3: THE ROOFTOPS courtyard is the fourth');
  const sunAt = x => SUN.some(z => x >= z.x0 && x <= z.x1), spikeNear = (x, y) => { for (let dx = -8; dx <= 8; dx++) for (let dy = -1; dy <= 3; dy++) if (at(x + dx, y + dy) === T.SPIKE) return true; return false; };
  const qs = x => L.quicksand.some(q => Math.abs(q.x0 / TS - x) <= 9);
  const e1 = L.ents.find(e => e.elite && e.x === 318), e2 = L.ents.find(e => e.elite && e.x === 484), e3 = L.ents.find(e => e.elite && e.x === 582);
  ok(sunAt(e1.x) && spikeNear(e1.x, e1.y), 'the halls\' elite stands in a shaft of sun with stakes behind him (a heavy blow throws a foe onto them)');
  ok(qs(e2.x) && qs(e3.x) && e3.gate, 'the quarter\'s and the throne street\'s elites stand by a drift; the throne\'s warden holds a gate'); }
/* REQUIRED: the reach model */
const arenaCol = L.arena.x0 / TS + 4, arenaRow = L.arena.floor / TS - 1;
const reaches = Lx => { const R = floodReach(Lx, T); for (const k of R.seen) { const [x, y] = k.split(',').map(Number); if (x >= arenaCol - 2 && x <= arenaCol + 6 && Math.abs(y - arenaRow) <= 1) return true; } return false; };
ok(reaches(L), 'the throne room is reached with the sand worked (the reach model: fill rooms full, ride rooms a stair, the street a stair, the heap piled, the quarter drained)');
const withSand = (ids, o = {}) => { const g = L.grid.slice(); for (const r of ROOMS.filter(q => ids.includes(q.id))) for (let k = 0; k < r.full; k++) for (let x = r.x0; x <= r.x1; x++) g[(r.floor - 1 - k) * L.W + x] = T.SOFT; return { ...L, grid: g, ...o }; };
ok(!reaches(withSand(['great'])), 'REQUIRED: with THE DROWNED QUARTER full of sand nothing reaches the throne room (THE GREAT SAND-GATE)');
ok(!reaches(withSand(['upperbulb'])), 'REQUIRED: with THE UPPER BULB full nothing gets past THE HOURGLASS (drain it)');
ok(!reaches(withSand(['first'])), 'REQUIRED: with THE FIRST SAND ROOM full nothing gets past it (the teach is a use)');
{ const st = room0('street'), g = L.grid.slice(); for (let k = 0; k <= st.full; k++) for (let x = st.x0; x <= st.x1; x++) g[(st.floor - 1 - k) * L.W + x] = k === st.full ? T.SOLID : T.SOFT;
  ok(!reaches({ ...L, grid: g, sandRungs: L.sandRungs.filter(b => b[0] !== st.x0) }), 'REQUIRED: with THE SINKING STREET up (its sand full, the street on it) nothing gets down to the arch (sink it)'); }
ok(!reaches({ ...L, sandSolid: L.sandSolid.filter(b => b[0] !== room0('trap').x0) }), 'REQUIRED: THE TRAP HALL unfilled is a drop nothing crosses (fill it)');
{ const heap = chute0('sluice').to.wall; ok(!reaches({ ...L, sandSolid: L.sandSolid.filter(b => !(b[0] >= Math.min(...heap.rungs.map(q => q[1])) && b[1] <= heap.x1)) }), 'REQUIRED: without THE SAND-FALL\'s heap the high arch is out of reach (pile it up)'); }
ok(!reaches({ ...L, sandRungs: L.sandRungs.filter(b => b[0] !== room0('granary').x0 && b[0] !== room0('shaft').x0) }), 'REQUIRED: without riding the sand up (THE GRANARY, THE CLOCK SHAFT) the way on is out of reach');
/* THE FLIP IS REQUIRED (A4: one required use before the boss - here four): without the first glass's roof, the fall that flows up, the chain's roofs or the exam's roofs, nothing reaches the king */
const noRisers = gid => ({ ...L, sandSolid: L.sandSolid.filter(b => !L.risers.some(r => r.glass === gid && !r.sinks && b[0] === r.x0 && b[1] === r.x1)) });
ok(!reaches(noRisers('stair')), 'REQUIRED: without THE FIRST HOURGLASS roof nothing climbs the fallen house (the teach is a use)');
ok(!reaches({ ...L, sandRungs: L.sandRungs.filter(b => !L.dfalls.some(f => b[0] === f.x0)) }), 'REQUIRED: without the sand-fall flowing up the high dune is out of reach');
ok(!reaches(noRisers('chain1')) && !reaches(noRisers('chain2')), 'REQUIRED: without either glass of THE CHAIN nothing crosses the sand sea');
ok(!reaches(noRisers('exam')), 'REQUIRED: THE EXAM roof that stands is a jump too short - only its glass crosses');
/* THE CITY IS BURIED (brief 1, the review's M2): past the sinkhole no column is open to the sky but the shafts; the sun is the dunes' and the shafts' only */
{ const open = x => { for (let y = 0; y < L.H; y++) { const t = at(x, y); if (t !== T.AIR) return y > 3; } return true; };
  const skyCols = []; for (let x = 38; x < L.W; x++) if (open(x)) skyCols.push(x);
  const inSun = x => SUN.some(z => x >= z.x0 && x <= z.x1);
  ok(skyCols.length && skyCols.every(inSun), 'past the sinkhole only the shafts in L.sun are open to the sky (' + skyCols.length + ' columns)');
  ok(SUN.filter(z => z.x0 >= 38).every(z => { for (let x = z.x0; x <= z.x1; x++) if (at(x, 0) !== T.AIR) return false; return true; }), 'every shaft of sun is open up to the sky (the sun burns in it)');
  ok(SUN.length >= 5 && L.sun.length === SUN.length && L.noSkyRays, 'the sun under the roof: four shafts and the dunes; the sky\'s rays are the shafts\' only');
  ok(L.shade.some(s => s[0] >= 114 * TS && s[1] <= 134 * TS), 'the market\'s awnings are drawn shade in its sun lane'); }
/* THE LANDMARK AND THE APPROACH (brief 2, B8): the tower is drawn from the backdrop module; the king's head, statues, mural, court; the next road's relief */
{ const bd = readFileSync(new URL('../src/redraw/buried_city_backdrop.js', import.meta.url), 'utf8');
  ok(/function drawTower/.test(bd) && /parallax 0\.035/.test(bd), 'THE HOURGLASS TOWER is drawn in the backdrop, always in view');
  const kinds = L.decor.map(d => d.kind);
  ok(['kinghead', 'kingstatue', 'mural', 'courtiers'].every(k => kinds.includes(k)) && kinds.filter(k => k === 'kingstatue').length >= 3, 'B8: the approach sets him up - his head in the dune, his statues, his mural, his kneeling court');
  ok(kinds.includes('relief'), 'the next road (THE SEALED PYRAMID) is carved over the throne door'); }
/* PLATFORM VARIETY (brief 4): not one plank */
{ const kc = {}; for (const p of L.plats) kc[p.kind] = (kc[p.kind] || 0) + 1; const total = L.plats.length;
  ok(Object.keys(kc).length >= 8, 'the city\'s footing comes in ' + Object.keys(kc).length + ' kinds: ' + JSON.stringify(kc));
  ok(Object.values(kc).every(c => c / total <= 0.45), 'no one kind of footing is most of the city (' + Math.round(Math.max(...Object.values(kc)) / total * 100) + '% at most)');
  ok(L.structures.filter(z => /^bc|chains/.test(z.kind)).length >= L.plats.filter(p => p.y1 === undefined).length, 'every built ledge declares what holds it up (corbels, poles, brackets, chains)'); }
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
{ const s = newConstruct(100, 100); s.cd = 0; let told = [], blows = [];
  for (let i = 0; i < 600; i++) { const evs = constructStep(s, { px: 120, py: 100, time: i / 60, jam: 0 }, 1 / 60); for (const v of evs) { if (v.t === 'tell') told.push(v.what); if (v.t === 'hit') blows.push(v); } }
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
const K = H.state(), room = id => K.rooms.find(r => r.id === id), chute = id => K.chutes.find(c => c.id === id), run = (s, dt = 1 / 30) => { for (let t = 0; t < s; t += dt) H.update(dt); };
const place = (c, row) => { hero.x = c * TS + 8; hero.y = (row + 1) * TS; hero.vy = 0; };
const pull = (c, row) => { place(c, row); for (let i = 0; i < 40; i++) H.update(1 / 30); return H.interact(hero); };
const feetRow = () => Math.round(hero.y / TS) - 1;
{ const r = room0('first'); ok(cell(66, r.floor - 1) === T.SOFT && cell(66, r.floor - r.full) === T.SOFT && cell(66, r.floor - r.full - 1) !== T.SOFT, 'a fresh load: THE FIRST SAND ROOM is full to its doorway'); }
ok(H.waits(L.ents.find(e => e.sandWait)), 'the quarter\'s foes wait under its sand');
ok(pull(58, room0('first').levers[0][1]) && room('first').gate === 'open', 'E at the first lever opens its gate'); run(4);
ok(room('first').level === 0 && cell(66, room0('first').floor - 1) === T.AIR, 'the open gate DRAINS the room: its cells are as built again');
ok(said.includes('THE GATE IS OPEN: THE ROOM DRAINS'), 'the pull is told');
/* THE GRANARY: shut its gate from inside, the sand carries the hero up to the high door */
{ const r = room0('granary'); ok(pull(144, r.levers[0][1]) && room('granary').gate === 'shut', 'the granary\'s lever shuts its gate'); place(150, r.floor - 1); run(10);
  ok(room('granary').level >= r.full - 0.01 && feetRow() <= r.door[2], 'THE SAND CARRIES YOU UP: the hero stands on the full granary at its high door (feet row ' + feetRow() + ')');
  ok(cell(156, r.door[2]) === T.AIR && cell(156, r.door[2] + 1) === T.SOLID, 'the granary\'s high door opens at the sand\'s top'); }
/* THE SINKING STREET: on a fresh load the street stands on full sand, level with the upper street; open its gate and it goes down with a hero on it to the arch;
   shut it and it rises back with him */
{ const r = room0('street'), top = r.floor - r.full - 1, low = r.floor - 1;
  ok(cell(215, top) === T.SOLID && cell(215, top + 1) === T.SOFT && cell(204, top - 3) === T.ONEWAY && cell(212, top - 1) === T.SOLID, 'a fresh load: THE SINKING STREET (its paving, a roof, the minaret stub) stands on full sand level with the upper street');
  ok(cell(156, 28) === T.AIR && at(199, top) === T.SOLID, 'its paving is the upper street\'s row');
  ok(cell(r.door[0], r.door[1]) === T.AIR && cell(r.x1, r.door[2]) === T.SOFT, 'the arch under it is a storey down, and the sand is in front of it');
  place(225, top - 1); const lever = r.levers[1]; place(lever[0], top - 1);
  ok(H.interact(hero) && room('street').gate === 'open', 'the chain by the arch, pulled from the street, opens its gate');
  const e = { t: 'construct', alive: true, x: 209 * TS + 8, y: top * TS, h: 18, st: newConstruct(209 * TS + 8, top * TS) }; enemies.push(e);
  for (let i = 0; i < 30 * 9; i++) { H.update(1 / 30); const fy = Math.floor((hero.y) / TS); if (cell(Math.floor(hero.x / TS), fy) === T.AIR && hero.y < (low + 1) * TS) hero.y += 4; const ey = Math.floor(e.y / TS); if (cell(209, ey) === T.AIR && e.y < (low + 1) * TS) e.y += 4; }
  ok(room('street').level === 0 && cell(215, low) === T.SOLID && cell(215, top) === T.AIR, 'THE STREET SINKS: drained, the street lies on the pit\'s floor (row ' + low + ')');
  ok(feetRow() === low - 1 && feetRow() >= r.door[1] && feetRow() <= r.door[2], 'and the hero on it is down at the arch (feet row ' + feetRow() + ')');
  ok(e.bcJam > 0 || K.n.jams > 0, 'a construct on the street while it moves is JAMMED');
  enemies.length = 0;
  ok(H.interact(hero) && room('street').gate === 'shut', 'the same chain shuts it again'); run(13);
  ok(room('street').level >= r.full - 0.01 && cell(215, top) === T.SOLID && feetRow() === top - 1, 'the pour fills it and THE STREET RISES with the hero on it (feet row ' + feetRow() + ')'); }
/* THE SPIKE CELLAR: shut, fill, the stakes are covered */
{ const r = room0('cellar'); ok(pull(242, r.levers[0][1]) && room('cellar').gate === 'shut', 'the cellar\'s lever shuts its gate'); run(6);
  ok(cell(250, r.spikes) === T.SOFT && cell(250, r.floor - r.full) === T.SOFT, 'the cellar fills over its stakes to the lip'); }
/* THE HOURGLASS: open the upper bulb, the lower fills */
ok(pull(278, room0('upperbulb').levers[0][1]) && room('upperbulb').gate === 'open', 'the upper bulb\'s lever opens its gate'); run(7);
ok(room('upperbulb').level === 0 && room('lowerbulb').level >= room('lowerbulb').full - 0.01, 'THE HOURGLASS: the upper hall ran down into the lower (' + room('lowerbulb').level.toFixed(1) + ')');
/* a construct carried by moving sand is JAMMED */
{ const r = room('cellar'); r.gate = 'open'; run(4); const e = { t: 'construct', alive: true, x: 252 * TS, y: r.floor * TS, h: 18, st: newConstruct(252 * TS, r.floor * TS) }; enemies.push(e); r.gate = 'shut'; run(0.8);
  ok(e.bcJam > 0, 'a construct the filling sand carries is JAMMED'); const w = {}; H.world(e, e.st, w); ok(w.jam > 0, 'the hands tell its machine (w.jam)');
  e.st.mode = 'jammed'; ok(H.takeConstruct(e, 10) === 10 * BCS.jamMul, 'a jammed construct takes a blow x' + BCS.jamMul); enemies.length = 0; run(6); }
/* THE SAND-FALL: the chute lands it on the grate (nothing piles); swung onto the wall the heap piles up under the arch, lifting what stands there; in the fall a hero
   is beaten down; swung back, the heap stays and is a stair to the arch */
{ const c0 = chute0('sluice'), wall = c0.to.wall, max = Math.max(...wall.rungs.map(q => q[0])), sill = wall.floor - max;
  ok(chute('sluice').at === 'grate' && cell(378, sill) === T.AIR, 'a fresh load: the fall runs away through the grate; no heap');
  const e = { t: 'construct', alive: true, x: 375 * TS + 8, y: wall.floor * TS, h: 18, st: newConstruct(375 * TS + 8, wall.floor * TS) }; enemies.push(e);
  place(c0.levers[0][0], c0.levers[0][1]); ok(H.interact(hero) && chute('sluice').at === 'wall', 'E at the chute lever swings the fall onto the wall');
  run(1.5); ok(chute('sluice').heap.wall.rows >= 2 && cell(370, wall.floor - 1) === T.SOFT, 'where it lands THE SAND PILES UP (' + chute('sluice').heap.wall.rows + ' rows)');
  ok(e.y < wall.floor * TS && e.bcJam > 0, 'a construct where the heap rises is lifted and JAMMED');
  run(4); ok(chute('sluice').heap.wall.rows === max && cell(378, sill) === T.SOFT, 'the heap is up to the arch\'s sill (row ' + sill + ')');
  place(378, sill - 1); hero.vy = -320; H.update(1 / 30); ok(hero.vy >= BCS.fallBeat, 'in the fall a hero is BEATEN DOWN (he cannot rise in it)');
  ok(said.includes('THE SAND-FALL BEATS YOU DOWN: SWING IT AWAY'), 'and it is told');
  place(c0.levers[1][0], c0.levers[1][1]); H.update(1); ok(H.interact(hero) && chute('sluice').at === 'grate', 'the second chute lever swings it back off the heap');
  place(378, sill - 1); hero.vy = -320; H.update(1 / 30); ok(hero.vy < 0 && chute('sluice').heap.wall.rows === max, 'off the fall the heap stays: a stair to the arch'); enemies.length = 0; }
/* THE GREAT SAND-GATE: three turns, the quarter drains, its foes stand up */
const W = L.wheel; for (let i = 0; i < 3; i++) { place(W.x, W.row); H.interact(hero); run(1); }
ok(K.wheel.done, 'three turns open THE GREAT SAND-GATE'); run(12);
ok(room('great').level === 0 && cell(440, room0('great').floor - 12) === T.AIR, 'the quarter drains: its old street comes out');
ok(spawned.length === L.ents.filter(e => e.sandWait).length, 'the quarter\'s buried foes stand up when the sand has gone off them (' + spawned.length + ')');
/* THE TRAP HALL (THE EXAM): its floor-gate is its floor; it fills only with the gate shut AND the fall swung into it; the fall on the lip holds a construct */
{ const r = room0('trap'), tc = chute0('trapfall'), mid = 552, gl = r.levers[0], cl = tc.levers[0];
  ok(cell(mid, r.floor) === T.AIR && chute('trapfall').at === 'lip', 'THE TRAP HALL\'s floor-gate is open as laid (a drop) and its fall lands on the lip');
  const e = { t: 'construct', alive: true, x: 541 * TS + 8, y: (gl[1] + 1) * TS, h: 18, st: newConstruct(541 * TS + 8, (gl[1] + 1) * TS) }; enemies.push(e); run(0.5);
  ok(e.bcJam > 0, 'the construct on the lip is held in the fall: JAMMED');
  place(cl[0], cl[1]); H.interact(hero); run(3); ok(chute('trapfall').at === 'hall' && room('trap').level === 0 && said.includes('THE SAND FALLS THROUGH THE OPEN FLOOR-GATE INTO THE DARK'), 'swung in with the floor-gate open, the sand falls through into the dark (told) - no fill');
  run(3); ok(!(e.bcJam > 0), 'and the construct it held is free');
  place(cl[0], cl[1]); H.update(1); H.interact(hero); place(gl[0], gl[1]); H.update(1); ok(H.interact(hero) && room('trap').gate === 'shut' && cell(mid, r.floor) === T.SOLID, 'its lever shuts the floor-gate (the floor is there)');
  run(4); ok(room('trap').level === 0 && chute('trapfall').at === 'lip', 'gate shut, the fall on the lip: still no fill');
  place(cl[0], cl[1]); H.update(1); H.interact(hero); run(8); ok(room('trap').level >= r.full - 0.01 && cell(mid, r.floor - r.full) === T.SOFT, 'gate shut AND the fall swung in: the hall fills to the street - walk over'); enemies.length = 0; }
/* THE FLIP (claude/buriedcity3) in the fake world: E (or a blow) turns a glass; its roofs rise - a body in them is lifted onto them - and sink when it runs out;
   the bank runs out and drifts back only when it is clear; the dune's fall carries you up while it runs and beats you down when it does not; THE SAND SEA bites
   and puts you back on your last footing (the exam's sea is the end) */
{ const FL = H.flip, gl = id => L.glasses.find(g => g.id === id), rs = id => L.risers.filter(r => r.glass === id);
  const g0 = gl('stair'), r0 = rs('stair')[0];
  ok(cell(r0.x0, r0.top) === T.AIR && FL.state('stair') === 'idle', 'a fresh load: THE FIRST HOURGLASS has run out and its roof is under the sand');
  place(g0.x, g0.y); ok(H.interact(hero) && FL.state('stair') === 'running', 'E at the hourglass turns it: its sand runs backward');
  ok(said.includes('THE SAND RUNS BACK UP: A BURIED ROOF RISES'), 'the first turn is told');
  place(r0.x0 + 1, r0.top + 1); run(0.6); ok(cell(r0.x0, r0.top) === T.SOLID && cell(r0.x1, r0.top + r0.rows - 1) === T.SOLID, 'THE ROOF RISES out of the sand (' + r0.rows + ' rows)');
  ok(feetRow() === r0.top - 1, 'a hero standing where it rose is lifted onto it (feet row ' + feetRow() + ')');
  run(g0.dur - 0.6 - 2.0 + 0.2); ok(said.includes('THE GLASS RUNS OUT') && cell(r0.x0, r0.top) === T.SOLID, 'its last two seconds are told (THE GLASS RUNS OUT) - the roof still stands');
  run(2.5); ok(FL.state('stair') === 'idle' && cell(r0.x0, r0.top) === T.AIR, 'run out, the roof sinks back under the sand');
  /* THE BANK */
  const gb = gl('bank'), b = L.banks[0]; ok(cell(b.x0, b.y1) === T.SOFT && cell(b.x1, b.y0) === T.SOFT, 'a fresh load: the bank of sand shuts the hall wall to wall');
  place(gb.x, gb.y); H.interact(hero); run(1); ok(cell(b.x0, b.y1) === T.AIR && cell(b.x1, b.y0) === T.AIR, 'struck, its glass runs the sand out of the bank');
  place(b.x0, b.y1); run(gb.dur + 1); ok(cell(b.x0, b.y1) === T.AIR, 'run out, the bank waits while a body stands in it (never buried)');
  place(b.x1 + 4, b.y1); run(1.5); ok(cell(b.x0, b.y1) === T.SOFT, 'clear of it, the sand drifts back in');
  /* THE DUNE FALL THAT FLOWS UP */
  const f = L.dfalls[0], gf = gl(f.glass); place(f.x0, f.bottom - 2); hero.vy = 0; H.update(1 / 30); ok(hero.vy >= 130, 'idle, the dune fall beats you down');
  place(gf.x, gf.y); H.interact(hero); place(f.x0, f.bottom - 2); hero.vy = 0; H.update(1 / 30); ok(hero.vy < -100, 'turned, it FLOWS UP: it carries you up');
  hero.y = f.top * TS - 2; H.update(1 / 30); ok(hero.y <= f.top * TS && hero.vy <= 0, 'at the lip it holds you level with the high dune');
  /* THE SAND SEA */
  const s = L.seas[0]; hero.hp = 100; hero.maxHp = 100; hero.ground = true; place(s.x0 - 2, s.row - 3); hero.ground = true; H.update(1 / 30); hero.ground = false;
  place(Math.round((s.x0 + s.x1) / 2), s.row + 1); H.update(1 / 30); ok(hero.hp < 100 && Math.abs(hero.x - ((s.x0 - 2) * TS + 8)) < 2, 'THE SAND SEA swallows: a bite of you and back to your last footing (hp ' + hero.hp + ')');
  let killed = 0; ctx.killHero = () => { killed++; return true; }; const se = L.seas.find(q => q.lethal); place(Math.round((se.x0 + se.x1) / 2), se.row + 1); H.update(1 / 30); ok(killed === 1, 'the exam sea is THE END (A10 amended: taught twice before)'); delete ctx.killHero;
  /* THE EXAM: the glass sinks the roof that stands and raises the rest */
  const ge = gl('exam'), sk = L.risers.find(r => r.sinks); ok(cell(sk.x0, sk.top) === T.SOLID, 'as built the exam one roof stands');
  place(ge.x, ge.y); H.interact(hero); run(1); ok(cell(sk.x0, sk.top) === T.AIR && rs('exam').filter(r => !r.sinks).every(r => cell(r.x0, r.top) === T.SOLID), 'turned, it SINKS the roof that stood and raises the rest');
  run(ge.dur + 1); ok(cell(sk.x0, sk.top) === T.SOLID, 'run out, the standing roof comes back up'); }
/* THE CLOCKWORK VAULT */
const V = L.vaultDoors[0]; place(V.x + 1, V.y1); quest = 4; H.interact(hero); ok(cell(V.x, V.y0) === T.SOLID, 'four gears: the vault stays shut (told)');
quest = 5; H.interact(hero); ok(cell(V.x, V.y0) === T.AIR, 'five gears open THE CLOCKWORK VAULT');
/* A RESPAWN: the small rooms as built, the great gate kept, the falls back where they were laid and the heaps flat */
H.reset(); ok(room('great').level === 0 && K.wheel.done, 'a respawn keeps THE GREAT SAND-GATE open'); ok(room('first').level === room('first').full && cell(66, room0('first').floor - 1) === T.SOFT, 'a respawn fills the first room again');
ok(room('trap').gate === 'open' && cell(552, room0('trap').floor) === T.AIR && cell(552, room0('trap').floor - 3) === T.AIR, 'a respawn opens the trap hall\'s floor-gate again (and its sand is gone)');
ok(chute('sluice').at === 'grate' && chute('sluice').heap.wall.rows === 0 && cell(370, chute0('sluice').to.wall.floor - 1) === T.AIR, 'a respawn swings the falls back and flattens the heap');
ok(room('street').level === room0('street').full && cell(215, room0('street').floor - room0('street').full - 1) === T.SOLID, 'a respawn stands the street back up on its sand');
/* THE GLINT: every route lock is a stuck spot */
ok((STUCK_HANDS.buriedcity || []).length >= 12, 'the route\'s locks glint (' + (STUCK_HANDS.buriedcity || []).length + ' stuck spots)');
for (const sp of STUCK_HANDS.buriedcity) for (const s of sp.steps) ok(isCallout(s.line), 'the nudge line is shown: ' + s.line);
for (const [id, want] of [['street', /street/], ['sluice', /sluice/], ['trap', /trap/]]) ok(STUCK_HANDS.buriedcity.some(sp => want.test(sp.id) && sp.steps.length >= 2), 'the ' + id + '\'s steps are each glinted in turn');
/* THE HOURGLASS KING (pure) */
const G = HKM.geom(L.arena, TS); ok(G.levers.length === 2, 'two sand-gate levers in the throne room');
ok(HKM.HK.resist >= 0.4 && HKM.HK.wardMul >= 0.4, 'B15: outside his openings his brass takes >= 0.4 (resist ' + HKM.HK.resist + ', ward ' + HKM.HK.wardMul + ')');
ok(HKM.HK.openMul >= 1.5 && HKM.HK.openMul <= 2.0, 'his opening pays x' + HKM.HK.openMul + ' (1.5-2)');
ok(HKM.HK.wardT >= 2.5 && HKM.HK.wardT <= 3.5, 'B3: a ~3 s ward after each opening');
{ const room = (G.x1 - G.x0) / 2 - (G.levers[0].x - G.x0), run = 60;   /* B12 (the review's 2a): a melee hero at run speed (~60 px/s) from the room's centre to a lever, inside the low window, in EVERY phase */
  for (const ph of [1, 2, 3]) { const glass = ph === 3 ? HKM.HK.glass3 : HKM.HK.glass, win = glass * HKM.lowOf(ph); ok(win >= room / run + 0.3, 'B12: phase ' + ph + '\'s low window is ' + win.toFixed(1) + ' s - a lever is ' + (room / run).toFixed(1) + ' s from the room\'s centre'); } }
const c = { said: [], banks: null, hits: [], number(x, y, t) { this.said.push(t); }, mark() {}, sound() {}, fx() {}, shake() {}, music() {}, time: () => 0, hit(b, d, name) { this.hits.push(name); return false; }, banks(on) { this.banks = on; } };
c.banks = function (on) { c.bankOn = on; };
const e = { t: 'hourglassking', x: (G.x0 + G.x1) / 2, y: G.floorY, hp: 1000, maxHp: 1000, alive: true, mode: 'wake', modeT: 0.01, face: -1, open: 0 }, S = HKM.newFight(G);
const hero2 = [{ x: G.x0 + 60, y: G.floorY, ground: true, alive: true }];
for (let i = 0; i < 30; i++) HKM.stepHourglassKing(e, S, 1 / 60, hero2, c);
ok(HKM.leverPulled(e, S, c, G.levers[0].x) === 'full' && c.said.includes('HIS GLASS IS FULL: NOT YET'), 'a lever while his glass is full does nothing - and says so');
S.glass = S.glassMax * HKM.lowOf(S.ph) - 0.1; e.mode = 'walk';
ok(HKM.leverPulled(e, S, c, G.levers[0].x) === 'stall' && HKM.hkOpen(e), 'a lever while his glass runs low STALLS him: OPEN');
const x0 = e.x; for (let i = 0; i < 60; i++) HKM.stepHourglassKing(e, S, 1 / 60, hero2, c);
ok(Math.abs(e.x - G.levers[0].x) <= HKM.HK.dragStop + 4 && Math.abs(e.x - G.levers[0].x) >= HKM.HK.dragStop - 4, 'B12: the sand drags him to the lever you pulled and stops him a step short (' + Math.round(x0) + ' -> ' + Math.round(e.x) + ')');
const xs = e.x; for (let i = 0; i < 60; i++) HKM.stepHourglassKing(e, S, 1 / 60, hero2, c); ok(e.x === xs && e.mode === 'stall', 'B4: stalled he stands still');
for (let i = 0; i < 60 * 4; i++) HKM.stepHourglassKing(e, S, 1 / 60, hero2, c);
ok(!HKM.hkOpen(e) && S.ward > 0 && S.n.wards === 1, 'B3: the opening ends in a told ward');
ok(HKM.leverPulled(e, S, c, G.levers[1].x) === 'ward', 'a lever in his ward finds nothing (told)');
/* one new told move a phase; each phase changes the arena */
const mv = ph => new Set(HKM.CYCLES[ph].flat());
/* (claude/buriedcity3, DESIGN CHANGE - stated: Daniel 10-12 "boring + too easy", the brief asks 2-3+ more attacks + phase differences: B5's one-new-move-a-phase
   becomes FOUR new told moves across the three phases, each its own pose and word; phases two and three each bring two) */
ok([...mv(1)].sort().join() === 'gear,pend,stream,surge', 'phase one: the pendulum, the gear, the stream and THE SAND SURGE (new)');
ok([...mv(2)].filter(m => !mv(1).has(m)).sort().join() === 'grasp,rain', 'phase two brings BURIAL GRASP and GLASS RAIN');
ok([...mv(3)].filter(m => !mv(1).has(m) && !mv(2).has(m)).sort().join() === 'hour,slip', 'phase three brings THE TIME SLIP and THE HOUR');
for (const m of ['surgeTell', 'graspTell', 'rainTell', 'slipTell']) ok(HKM.MOVES[m].word && HKM.MOVES[m].col, 'his new ' + m + ' is told with its own word and colour (' + HKM.MOVES[m].word + ')');
{ const cast = readFileSync(new URL('../src/redraw/buried_city_cast.js', import.meta.url), 'utf8'), hands = readFileSync(new URL('../src/hourglass-king-hands.js', import.meta.url), 'utf8');
  ok(cast.includes("frames(W, H, 26,") && /surgeTell: 14, graspTell: 16, rainTell: 17, slipTell: 18, slipStrike: 19/.test(hands) && /surge: 15, grasp: 20, rain: 21, hour: 23/.test(hands) && /hourTell: 22/.test(hands), 'B16 (claude/bc3art, finished): each new move has its OWN windup AND release pose (14/15 surge, 16/20 grasp, 17/21 rain, 18/19 slip, 22/23 the hour), 24 the tide, 25 dragged into the flow'); }
for (const m of ['pendTell', 'gearTell', 'streamTell', 'surgeTell', 'graspTell', 'rainTell', 'slipTell', 'hourTell']) ok(MARK['hourglassking|' + m] === HKM.MOVES[m].mark && ANSWER['hourglassking|' + m] === HKM.MOVES[m].answer, 'his ' + m + ' is told: ' + HKM.MOVES[m].mark + ' / ' + HKM.MOVES[m].answer);
{ const e3 = { ...e, mode: 'walk', modeT: 0.5, open: 0, hp: 590 }; const S3 = HKM.newFight(G); S3.ward = 0; c.bankOn = null; HKM.stepHourglassKing(e3, S3, 1 / 60, hero2, c);
  ok(S3.ph === 2 && c.bankOn === true, 'phase two changes the arena: the sand banks at the walls');
  e3.hp = 200; e3.mode = 'walk'; HKM.stepHourglassKing(e3, S3, 1 / 60, hero2, c); ok(S3.ph === 3 && S3.glassMax === HKM.HK.glass3, 'phase three: his glass cracks (it runs faster)');
  c.hits.length = 0; for (let i = 0; i < 40; i++) HKM.stepHourglassKing(e3, S3, 1 / 60, hero2, c); ok(c.hits.includes('THE POURING SAND'), 'phase three changes the arena: two steady pours from the broken roof'); }
/* (claude/buriedcity3) THE NEW ARENA AND HIS NEW MOVES in the pure model: phase two's DRIFT (off while he stands open), THE GREAT HOURGLASS (phase three's big opening),
   the dry gates in phase three, THE TIME SLIP's echo, THE BURIAL GRASP's hold */
{ const mk = (hp, ph) => { const S0 = HKM.newFight(G), e0 = { t: 'hourglassking', x: (G.x0 + G.x1) / 2, y: G.floorY, hp, maxHp: 1000, alive: true, mode: 'walk', modeT: 0.5, face: -1, open: 0 }; S0.ward = 0; if (ph) { S0.ph = ph; if (ph === 3) S0.glassMax = HKM.HK.glass3; } return [e0, S0]; };
  const c2 = { ...c, said: [], held: [], number(x, y, t) { this.said.push(t); }, hold(pp, s) { this.held.push(s); }, blocks() {}, banks() {} };
  { const [e0, S0] = mk(1000); ok(HKM.greatStruck(e0, S0, c2) === 'early' && !HKM.hkOpen(e0), 'THE GREAT HOURGLASS will not turn before phase three (told)'); }
  { const [e0, S0] = mk(500, 2); ok(!HKM.driftOn(e0, S0), 'phase two: the floor is firm between tides'); for (let i = 0; i < 60 * 8; i++) { HKM.stepHourglassKing(e0, S0, 1 / 60, hero2, c2); if (S0.tide.on) break; } e0.mode = 'walk'; ok(S0.tide.on && HKM.driftOn(e0, S0) && c2.said.includes('THE SAND RISES: UP ON A LEDGE'), 'phase two: THE SAND TIDE is told, then the floor is DRIFT');
    S0.glass = S0.glassMax * HKM.lowOf(2) - 0.1; HKM.leverPulled(e0, S0, c2, G.levers[0].x); ok(HKM.hkOpen(e0) && !HKM.driftOn(e0, S0), 'a stall drains the drift while he stands open (B12: you can stand by him)'); }
  { const [e0, S0] = mk(200, 3); ok(HKM.leverPulled(e0, S0, c2, G.levers[0].x) === 'dry' && c2.said.includes('THE GATES ARE DRY: TURN THE GREAT HOURGLASS'), 'phase three: the gates are dry - a pull says what to do instead');
    e0.x = G.x0 + 60; ok(HKM.greatReady(S0) && HKM.greatStruck(e0, S0, c2) === 'flip' && HKM.hkOpen(e0) && S0.capNow === HKM.HK.great.openCap, 'phase three: STRIKE THE GREAT HOURGLASS - the sand pours up and takes him: his big opening (a ' + HKM.HK.great.openCap + ' share)');
    for (let i = 0; i < 90; i++) HKM.stepHourglassKing(e0, S0, 1 / 60, hero2, c2); ok(Math.abs(e0.x - G.great) <= 26 && e0.mode === 'stall', 'B12: the flow drags him to the great hourglass you struck (' + Math.round(e0.x - G.great) + ' px from it)');
    ok(!HKM.driftOn(e0, S0), 'while it pours up the floor is firm');
    ok(HKM.greatStruck(e0, S0, c2) === 'busy' || HKM.greatStruck(e0, S0, c2) === 'running', 'it cannot be turned again while it runs');
    for (let i = 0; i < 60 * 6; i++) HKM.stepHourglassKing(e0, S0, 1 / 60, hero2, c2); ok(!HKM.hkOpen(e0) && S0.ward > 0 && !HKM.greatReady(S0), 'B3: a told ward after it, and the great glass runs back down before it is ready again');
    for (let i = 0; i < 60 * 12; i++) HKM.stepHourglassKing(e0, S0, 1 / 60, hero2, c2); ok(HKM.greatReady(S0) || S0.ph === 3 && S0.great.cd === 0, 'and then it is ready again'); }
  { const [e0, S0] = mk(200, 3); c2.hits = []; S0.script = ['slip']; S0.step = 0; e0.mode = 'walk'; e0.modeT = 0; const x0 = e0.x;
    for (let i = 0; i < 150; i++) { HKM.stepHourglassKing(e0, S0, 1 / 60, [{ ...hero2[0], x: x0 + 120 }], c2); if (e0.mode === 'slipTell') break; }
    e0.x = x0 + 80; const echo = S0.echo && S0.echo.x; ok(e0.mode === 'slipTell' && Math.abs(echo - x0) < 60, 'THE TIME SLIP: his echo stands where he was ~2 s ago (' + Math.round(echo - x0) + ' px)');
    for (let i = 0; i < 70; i++) { HKM.stepHourglassKing(e0, S0, 1 / 60, [{ ...hero2[0], x: echo }], c2); if (e0.mode === 'slipRec') break; }
    ok(Math.abs(e0.x - echo) < 2 && c2.hits.includes('THE TIME SLIP') && e0.mode === 'slipRec', 'he snaps back to the echo swinging - and stands a beat there (punish him)'); }
  { const [e0, S0] = mk(500, 2); c2.hits = []; c2.hit = function (b, d, name) { this.hits.push(name); return true; }; S0.script = ['grasp']; S0.step = 0; e0.mode = 'walk'; e0.modeT = 0;
    const me = [{ x: G.x0 + 100, y: G.floorY, ground: true, alive: true, air: false, pp: {} }];
    for (let i = 0; i < 120; i++) HKM.stepHourglassKing(e0, S0, 1 / 60, me, c2);
    ok(c2.hits.includes('THE BURIAL GRASP') && c2.held.length > 0, 'THE BURIAL GRASP: caught on the sand, you are struck and HELD (jump or roll out)'); } }
const hkSrc = readFileSync(new URL('../src/hourglass-king.js', import.meta.url), 'utf8') + readFileSync(new URL('../src/hourglass-king-hands.js', import.meta.url), 'utf8');
ok(!/ctx.spawn(?!Boss)|enemies().push|enemies.push/.test(hkSrc), 'NO ADDS: the king summons nothing');
ok(OPEN_RULE.hourglassking && OWN_WARD.has('hourglassking'), 'the greed rule knows his opening; his brass is his own ward (no x0.05 chip)');
ok(SYNTH_BOSS.hourglassking && SYNTH_VARIANT['hourglassking:p2'] && SYNTH_VARIANT['hourglassking:p3'] && !SYNTH_BOSS.buriedcity, "his three-phase theme is composed in code; the city's greybox synth bed is gone (music pass: 'Loopable Dungeon Ambience' is the level track)");
ok(DY === 1 && L.H === 49, '(the city is laid one row lower than its logical rows: DY ' + DY + ')');
console.log('buried-city: ' + n + ' checks green');
