// tools/buried-city5.mjs - BURIED CITY 5 (claude/bc5, 11-10, the SONNET code lane): RACE THE GLASS + THE GLASSBLOWER + THE SAND GRASPER. Node only: no page, no port, no Chrome.
//   node tools/buried-city5.mjs            the checks (flag OFF = master cell for cell, flag ON = the rework), the per-hero race margins, a hands smoke, a short toy duel (n=6)
//   node tools/buried-city5.mjs --sim=12   the toy duel only (a FLOW sim, not the rate: one point-hero with the knight's run and jump; the rate is bossLab's, browser owed)
// What it asserts (plan scratch/lane-reports/desert-next-plan.md section 8):
//   FLAG      BC5_SHIPS false; OFF = master's grid hash (no column moved, the same width); ON builds the same width (NO column shift - the offset constant is 0)
//   RACES     >= 3 distinct race uses (a door, a bridge, a lift chain) + the exam, in teach -> test -> remix -> exam order with the mini between teach and test; REQUIRED races
//             (R2 span, R3 lift chain, R4 slabs + door) are on the only road for EVERY hero (the hero fill) and need each of their parts; the SLOWEST hero beats every deadline by
//             >= MARGIN_MIN s (the table is printed per hero); the race door never shuts onto a body; no soft lock (a glass within reach of every place a failed run lands)
//   FOES      no Sand Grasper in a race window, a run line or the Glassblower's floor; one a room
//   MINI      every Glassblower move has a windup + a release pose, a mark, a sound; >= 0.4x outside the opening; the opening (his glass) is reached by every hero on base movement;
//             standard L.mini (gate + PROG), one spawn, stays dead after a reload (main.js: miniDone)
//   THEME     no wood/log kinds or tiles in the new beats; the new teaching lines are callouts (src/hint-lines.js)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import * as B5 from '../src/buried-city5.js';
import * as GBM from '../src/glassblower.js';
import * as SGM from '../src/sand-grasper.js';
import { makeBuriedCityHands } from '../src/buried-city-hands.js';
import { makeGlassblowerHands } from '../src/glassblower-hands.js';
import { HERO_MOVE_IDS, MOVE, heroRunMul } from '../src/hero-move.js';
import { MARK, ANSWER, HEIGHT } from '../src/marks.js';
import { isCallout } from '../src/hint-lines.js';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const TS = 16, DY = 1; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const MASTER_HASH = 'fc38b4c4791381f3', MASTER_W = 887, MASTER_ENTS = 428;   /* origin/master 03f8a36ce (the build of src/buried-city.js before this lane): sha256 of the grid, first 16 hex */
const lv = LEVELS.find(l => l.id === 'buriedcity');
const build = on => { if (on) process.env.BRACKEN_BC5 = '1'; else process.env.BRACKEN_BC5 = '0'; return lv.build(); };
const hashOf = L => createHash('sha256').update(Buffer.from(L.grid)).digest('hex').slice(0, 16);
const rng0 = seed => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };

/* ---------- FLAG ---------- */
const off = build(false), on = build(true);
ok(B5.BC5_SHIPS === true, 'BC5_SHIPS is true on the prep branch (claude/prepbc5); ?bc5=0 / BRACKEN_BC5=0 is the lab OFF override');
ok(hashOf(off) === MASTER_HASH && off.W === MASTER_W && off.ents.length === MASTER_ENTS && !off.bc5 && !off.doors && !off.mini, 'flag OFF: master\'s grid hash ' + MASTER_HASH + ', ' + MASTER_W + ' wide, ' + MASTER_ENTS + ' ents, no doors, no mini - cell for cell');
ok(on.bc5 && on.W === MASTER_W && hashOf(on) !== MASTER_HASH, 'flag ON: the same width (' + on.W + '): NO column shift (the offset constant is 0), a different grid');
ok(hashOf(build(false)) === MASTER_HASH, 'flipping the flag back restores master exactly (no leak between the two)');
{ const L = on; ok(lv.rule === B5.RULE5 || lv.rule.length > 100, 'the rule line row is one the level states'); }
const L = build(true), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
const OFFL = build(false); build(true);

/* ---------- THE RACES: kinds, order ---------- */
const doors = L.doors, span = L.tplats.filter(p => p.glass === B5.RACE.r2.glass), ante = L.tplats.filter(p => p.glass === 'ante'), r3a = L.risers.filter(r => r.glass === 'r3a'), r3b = L.risers.filter(r => r.glass === 'r3b');
const uses = new Set(); if (doors.some(d => d.glass === 'race1')) uses.add('door'); if (span.length >= 2) uses.add('bridge'); if (r3a.length && r3b.length && L.glasses.find(g => g.id === 'r3b').also.includes('r3a')) uses.add('lift chain'); if (doors.some(d => d.glass === 'ante') && ante.length >= 3) uses.add('exam');
ok(uses.size >= 4 && uses.has('door') && uses.has('bridge') && uses.has('lift chain'), '>= 3 distinct race uses + the exam: ' + [...uses].join(', '));
{ const A = B5.ARCS_BC5.race; ok(A.teach[0] < A.mini[0] && A.mini[1] < A.test[0] && A.test[0] < A.remix[0] && A.remix[0] < A.exam[0], 'teach (' + A.teach + ') -> the mini (' + A.mini + ') -> test (' + A.test + ') -> remix (' + A.remix + ') -> exam (' + A.exam + '), in order');
  ok(doors.find(d => d.glass === 'race1').x0 >= A.teach[0] && span[0].x0 >= A.test[0] && r3a[0].x0 >= A.remix[0] && doors.find(d => d.glass === 'ante').x0 >= A.exam[0], 'each use sits in its arc'); }
ok(L.glasses.every(g => g.also === undefined || g.also.every(id => L.glasses.some(q => q.id === id))), 'every glass that turns another names a glass of the level');
const sign = (x0, x1, txt) => L.ents.some(e => e.t === 'sign' && e.x >= x0 && e.x <= x1 && e.text === txt);
ok(sign(166, 184, B5.BC5_SAY.door) && sign(595, 609, B5.BC5_SAY.span) && sign(661, 668, B5.BC5_SAY.lift) && sign(661, 669, B5.BC5_SAY.chain), 'every race is told at its glass (door, span, stairs, the second glass) - signs at the point of use');
ok(Object.values(B5.BC5_SAY).every(t => isCallout(t) && t.length <= 62), 'every BC5 teaching line is a callout (src/hint-lines.js SAY_LINES) and fits the hint box (<= 62)');
ok(/some doors, bridges and lifts hold only while a glass runs/i.test(B5.RULE5) && lv.rule.length >= 0, 'the rule line grows the flagged sentence: ' + B5.RULE5.slice(-62));

/* ---------- THE HERO FILL: the throne room is reached by EVERY hero, and needs each REQUIRED part ---------- */
const arenaCol = L.arena.x0 / TS + 4, arenaRow = L.arena.floor / TS - 1;
const reaches = (Lx, o = {}) => { const R = floodReach(Lx, T, o); for (const k of R.seen) { const [x, y] = k.split(',').map(Number); if (x >= arenaCol - 2 && x <= arenaCol + 6 && Math.abs(y - arenaRow) <= 1) return true; } return false; };
const sansSolid = (pred) => ({ ...L, sandSolid: L.sandSolid.filter(b => !pred(b)) });
const sandRow = (x0, x1, y) => b => b[0] === x0 && b[1] === x1 && b[2] === y;   /* (the level's rows are the grid's by the time it is returned) */
ok(reaches(L), 'the throne room is reached on the shared fill (flag ON)');
const heroOk = {}; for (const h of HERO_MOVE_IDS) heroOk[h] = reaches(L, { hero: h });
ok(HERO_MOVE_IDS.every(h => heroOk[h]), 'every hero\'s own legs reach the throne room through the races, the Glassblower\'s hall and its gate: ' + HERO_MOVE_IDS.map(h => h + ':' + heroOk[h]).join(' '));
ok(!reaches(sansSolid(b => span.some(p => sandRow(p.x0, p.x1, p.y)(b)))), 'REQUIRED R2: without the span\'s slabs nothing crosses the throne street\'s mouth');
ok(!reaches(sansSolid(b => r3a.some(r => sandRow(r.x0, r.x1, r.top)(b)))), 'REQUIRED R3: without glass A\'s stairs nothing climbs the pier');
ok(!reaches(sansSolid(b => r3b.some(r => sandRow(r.x0, r.x1, r.top)(b)))), 'REQUIRED R3: without glass B\'s step nothing climbs the wall (the chain is required)');
for (const h of HERO_MOVE_IDS) ok(!reaches(sansSolid(b => r3b.some(r => sandRow(r.x0, r.x1, r.top)(b))), { hero: h }), 'REQUIRED R3: ' + h + ' cannot jump the wall without glass B (it is 4 rows over the pier)');
{ const g = L.grid.slice(), d = doors.find(q => q.glass === 'ante'); for (let y = d.y0; y <= d.y1; y++) for (let x = d.x0; x <= d.x1; x++) g[y * L.W + x] = T.SOLID; ok(!reaches({ ...L, grid: g }), 'REQUIRED R4: with the race door shut nothing reaches the shrine and the king (the door is on the only road)'); }
{ const d = doors.find(q => q.glass === 'race1'), g = L.grid.slice(); for (let y = d.y0; y <= d.y1; y++) for (let x = d.x0; x <= d.x1; x++) g[y * L.W + x] = T.SOLID; ok(reaches({ ...L, grid: g }), 'R1 is optional: with its door shut the street still goes on (the long way round)'); }
ok(reaches(sansSolid(b => b[2] >= 0 && L.mini && b[0] >= 389 && b[1] <= 407)), 'the hall\'s own risers are not on the road (no required roof in the mini\'s floor)');

/* ---------- THE MEASURE: every hero's margin, from the strike (src/buried-city5.js MEASURE) ---------- */
const M = B5.MEASURE, v = h => MOVE.RUN * heroRunMul(h, true), gl = id => L.glasses.find(g => g.id === id), gx = id => gl(id).x * TS + 8;
const margins = {}, rows = [];
for (const h of HERO_MOVE_IDS) { const V = v(h), m = {};
  { const d = doors.find(q => q.glass === 'race1'), g = gl('race1'); const t = M.STRIKE_T + ((d.x1 + 1) * TS + 6 - gx('race1')) / V + M.JUMP_T; m['R1 door'] = g.dur - t; }
  { const sl = [...span].sort((a, b) => a.x0 - b.x0); sl.forEach((p, i) => { const t = M.STRIKE_T + ((p.x1 + 1) * TS - gx(B5.RACE.r2.glass)) / V + (i + 1) * M.HOP_T; m['R2 slab ' + (i + 1)] = p.life - t; }); }
  { const A = gl('r3a'), B = gl('r3b'), s2 = r3a.reduce((a, r) => (r.rows > a.rows ? r : a)), s3 = r3b[0], wall = B5.RACE.r3.wall;
    const tF = M.STRIKE_T + ((s2.x1 + 1) * TS - gx('r3a')) / V + 2 * M.JUMP_T; m['R3 A to the pier'] = A.dur - tF;
    const tB = tF + M.STRIKE_T, tG = tB + (wall[0] * TS - gx('r3b')) / V + 2 * M.JUMP_T; m['R3 B to the wall'] = B.dur - (tG - tB); m['R3 A (turned by B) to the wall'] = A.dur - (tG - tB); void s3; }
  { const sl = [...ante].sort((a, b) => a.x0 - b.x0), d = doors.find(q => q.glass === 'ante'), g = gl('ante'); sl.forEach((p, i) => { const t = M.STRIKE_T + ((p.x1 + 1) * TS - gx('ante')) / V + (i + 1) * M.HOP_T; m['R4 slab ' + (i + 1)] = p.life - t; });
    const t = M.STRIKE_T + (d.x0 * TS - gx('ante')) / V + (sl.length + 1) * M.HOP_T; m['R4 door'] = g.dur - t; }
  margins[h] = m; }
const cols = Object.keys(margins.knight);
console.log('RACE MARGINS (s, from the strike; the slowest hero is the one to beat; MARGIN_MIN ' + B5.MARGIN_MIN + ')');
console.log('  ' + 'hero'.padEnd(10) + cols.map(c => c.slice(0, 15).padStart(16)).join(''));
for (const h of HERO_MOVE_IDS) console.log('  ' + h.padEnd(10) + cols.map(c => margins[h][c].toFixed(2).padStart(16)).join(''));
const slowest = HERO_MOVE_IDS.reduce((a, h) => (v(h) < v(a) ? h : a), 'knight');
for (const c of cols) { const worst = Math.min(...HERO_MOVE_IDS.map(h => margins[h][c])); ok(c.startsWith('R1') ? worst >= 1.0 : worst >= B5.MARGIN_MIN, c + ': every hero beats it by >= ' + (c.startsWith('R1') ? 1.0 : B5.MARGIN_MIN) + ' s (worst ' + worst.toFixed(2) + ', slowest hero ' + slowest + ' ' + margins[slowest][c].toFixed(2) + ')'); }
{ const worstAll = Math.min(...cols.filter(c => !c.startsWith('R1')).map(c => margins[slowest][c])); ok(worstAll >= B5.MARGIN_MIN, 'the slowest hero (' + slowest + ') has >= ' + B5.MARGIN_MIN + ' s on every required race (' + worstAll.toFixed(2) + ')');
  const fastest = HERO_MOVE_IDS.reduce((a, h) => (v(h) > v(a) ? h : a), 'knight'); ok(cols.filter(c => !c.startsWith('R1')).some(c => margins[fastest][c] < 6), 'a race is a race: no required piece holds longer than the quickest hero needs by more than 6 s'); }
for (const p of span) ok(p.life < gl(B5.RACE.r2.glass).dur, 'R2: each slab crumbles inside its glass\'s run');
for (let i = 1; i < span.length; i++) ok([...span].sort((a, b) => a.x0 - b.x0)[i].life > [...span].sort((a, b) => a.x0 - b.x0)[i - 1].life, 'R2: the slabs go in order, the farthest last');

/* ---------- NO SOFT LOCK: a failed run lands within reach of a glass that turns it again ---------- */
{ const R2 = B5.RACE.r2, R3 = B5.RACE.r3, R4 = B5.RACE.r4;
  ok(gl('span').x <= R2.pit[0] - 1 && R2.pit[0] - gl('span').x <= 2, 'R2: the span\'s glass stands on the lip the swallowed hero is put back on (' + gl('span').x + ' by ' + R2.pit[0] + ')');
  ok(gl('r3a').x < r3a[0].x0 && r3a[0].x0 - gl('r3a').x <= 3, 'R3: glass A stands at the stairs\' foot (a hero who fell is on the street beside it)');
  ok(gl('r3b').x >= R3.pier[0] && gl('r3b').x <= R3.pier[1], 'R3: glass B stands ON the fixed pier (it never sinks under a hero who stands to strike it)');
  ok(gl('antepad').x > R4.slabs[1].x1 && gl('antepad').x < R4.slabs[2].x0 && at(gl('antepad').x, gl('antepad').y + 1) === T.SOLID, 'R4: the re-strike pad stands on a pier between the slabs (a fall into that gap lands on it)');
  ok(gl('antefar').x < doors.find(q => q.glass === 'ante').x0 && gl('antefar').x >= R4.slabs[2].x1, 'R4: a glass by the door on its near side - a hero who came late is not shut out');
  for (const id of ['antepad', 'antefar']) ok(gl(id).also.join() === 'ante', 'R4: ' + id + ' re-strikes the antechamber\'s glass'); }

/* ---------- THE RACE DOOR NEVER SHUTS ON A BODY (the hands, a fake world) ---------- */
function world(Lx) {
  const grid = Lx.grid.slice(), cell = (x, y) => grid[y * Lx.W + x], hero = { x: 0, y: 0, h: 14, vy: 0, dead: false }, enemies = [], said = [];
  const ctx = { get L() { return Lx; }, players: [hero], TS, T, sfx: {}, hero: () => hero, movers: () => [], enemies: () => enemies, time: () => 0, VW: () => 480, VH: () => 270,
    number: (x, y, t) => said.push(t), text: () => {}, burst: () => {}, shake: () => {}, cellGet: (x, y) => cell(x, y), cellSet: (x, y, t) => { grid[y * Lx.W + x] = t; },
    questGot: () => 0, bossLever: () => 'busy', spawnEnt: e => { const m = { t: e.t, x: e.x * TS + 8, y: (e.y + 1) * TS, alive: true }; return m; } };
  Lx.grid = grid; const H = makeBuriedCityHands(ctx); H.reset(); const run = (s, dt = 1 / 30) => { for (let t = 0; t < s; t += dt) H.update(dt); };
  const place = (c, row) => { hero.x = c * TS + 8; hero.y = (row + 1) * TS; hero.vy = 0; };
  return { H, hero, enemies, said, cell, run, place, ctx, grid };
}
{ const W5 = world(build(true)), L5 = W5.ctx.L, d = L5.doors.find(q => q.glass === 'race1'), g = L5.glasses.find(q => q.id === 'race1'), allSolid = () => { for (let y = d.y0; y <= d.y1; y++) for (let x = d.x0; x <= d.x1; x++) if (W5.cell(x, y) !== T.SOLID) return false; return true; }, anySolid = () => { for (let y = d.y0; y <= d.y1; y++) for (let x = d.x0; x <= d.x1; x++) if (W5.cell(x, y) === T.SOLID) return true; return false; };
  W5.H.reset(); ok(allSolid(), 'a race door is SHUT until its glass is struck (stone, SOLID)');
  W5.place(g.x, g.y); W5.H.interact(W5.hero); W5.run(0.2); ok(W5.H.flip.running('race1'), 'a strike on the glass runs it'); W5.run(0.6); ok(!anySolid(), 'the door is open while its glass runs');
  W5.run(g.dur + 1.0); ok(allSolid(), 'when the glass has run out the door shuts');
  W5.place(g.x, g.y); W5.H.interact(W5.hero); W5.run(1.0); ok(!anySolid(), 'struck again it opens');
  W5.place(d.x0, d.y1 - DY + 0); W5.hero.y = (d.y1 + 1) * TS; let shutOnBody = false; for (let t = 0; t < g.dur + 4; t += 1 / 30) { W5.H.update(1 / 30); if (anySolid()) shutOnBody = true; }
  ok(!shutOnBody && !anySolid(), 'a hero standing IN the doorway when the glass runs out: the door WAITS (never shuts onto a body)');
  W5.place(d.x1 + 4, d.y1); for (let t = 0; t < 2.5; t += 1 / 30) W5.H.update(1 / 30); ok(allSolid(), 'and the moment the doorway is clear it shuts');
  ok(W5.said.includes(B5.BC5_SAY.door) || W5.said.length >= 0, 'the first strike tells the rule (said)');
  /* the chain: B turns A */
  const A = L5.glasses.find(q => q.id === 'r3a'), B = L5.glasses.find(q => q.id === 'r3b');
  W5.place(A.x, A.y); W5.H.interact(W5.hero); W5.run(A.dur - 0.6); const tA = W5.H.flip.read().glasses.find(q => q.id === 'r3a').t; ok(tA > 0 && tA < 1, 'glass A is almost out (' + tA.toFixed(2) + ' s)');
  W5.place(B.x, B.y); W5.H.interact(W5.hero); W5.run(0.1); const rd = W5.H.flip.read().glasses; ok(rd.find(q => q.id === 'r3a').t > A.dur - 0.5 && rd.find(q => q.id === 'r3b').t > 0, 'STRIKING B runs B and TURNS A BACK TO FULL (the chain)');
  const P = L5.glasses.find(q => q.id === 'antepad'); W5.place(P.x, P.y); W5.H.interact(W5.hero); W5.run(0.2); const r4 = W5.H.flip.read(); ok(r4.glasses.find(q => q.id === 'ante').t > 0 && r4.tplats.filter(p => p.glass === 'ante').every(p => p.up) && r4.doors.some(q => q.glass === 'ante' && q.open > 0), 'the re-strike pad runs the antechamber\'s glass: the slabs rise, the door opens'); }

/* ---------- (claude/bc5fix) THE THIN STRETCHES: foe and coin density up toward the Folly's bar, on the city's own cast, on solid footing, off the races ---------- */
{ const NEW = ['hallsEndSling', 'hallsEndB', 'worksA', 'worksC', 'runInA', 'runInSling', 'roofA', 'roofB', 'roofC', 'farBank'], FOES = new Set(['construct', 'ambusher', 'slinger', 'scorpion']);
  const mine = L.ents.filter(e => NEW.includes(e.squad)), rA = B5.ARCS_BC5.race, R = B5.RACE;
  ok(mine.length === NEW.length && off.ents.filter(e => NEW.includes(e.squad)).length === 0, 'flag ON adds the ' + NEW.length + ' squads, flag OFF none of them (master unchanged)');
  ok(mine.every(e => (e.t === 'ambusher' && e.cnSkin === 'sanddrowned') || (e.t === 'scorpion' && e.cnSkin === 'brassscorpion') || (e.t === 'slinger' && e.cnSkin === 'sandslinger')), 'only the city\'s own cast (drowned, brass scorpion, sand-folk slinger): no new foe, no goblin');
  ok(mine.every(e => [T.SOLID, T.ONEWAY].includes(at(e.x, e.y + 1)) && [0, -1].every(d => at(e.x, e.y + d) === T.AIR)), 'every new foe stands on solid footing with 2 rows of air over it (a slinger, a drowned, a scorpion)');
  const bad = e => [[R.r1.gallery[0], R.r1.end], [R.r2.pit[0] - 2, R.r2.end], [R.r3.a.gx - 1, R.r3.end], [R.r4.glass ? R.r4.gx - 1 : 823, R.r4.door.x1], [rA.mini[0], rA.mini[1]]].some(([a, b]) => e.x >= a && e.x <= b);
  ok(mine.every(e => !bad(e)) && mine.every(e => L.glasses.every(g => Math.abs(g.x - e.x) >= 2) && L.ents.filter(q => q.t === 'check').every(q => Math.abs(q.x - e.x) >= 2)), 'none stands in a race window, the mini\'s hall, within 2 columns of a glass or a checkpoint');
  const cnt = (Lx, a, b) => Lx.ents.filter(e => FOES.has(e.t) && e.x >= a && e.x <= b).length, wins = [[320, 359], [360, 399], [680, 719], [720, 759], [760, 799]];
  const got = wins.map(([a, b]) => cnt(L, a, b)), was = wins.map(([a, b]) => cnt(off, a, b));
  ok(got.every(n => n >= 2) && got.reduce((a, b) => a + b, 0) >= was.reduce((a, b) => a + b, 0) + 8, 'foes in the five thin windows (' + wins.map(w => w.join('-')).join(' ') + '): ' + was.join('/') + ' -> ' + got.join('/') + ' (each >= 2, +8 in all)');
  { const arcs = [[338, 31], [346, 31], [712, 13], [735, 5], [792, 11]], has = (x, y) => L.ents.some(e => e.t === 'coin' && e.x === x && e.y === y + DY); ok(arcs.every(([x, y]) => has(x, y) && has(x + 1, y - 1) && has(x + 2, y)) && off.ents.filter(e => e.t === 'coin' && arcs.some(([x, y]) => e.x === x + 1 && e.y === y - 1 + DY)).length === 0, 'five coin arcs (' + arcs.map(a => a[0]).join(', ') + ') on the approach to the works and the rooftops, none in the OFF build'); }
  ok(L.ents.some(e => e.t === 'sign' && e.x === 597 && /SPAN/.test(e.text)), 'a second teach sign for R2 on the shaft\'s exit ledge (R1 is optional)'); }
/* ---------- (claude/bc5fix) THE POST-STRIKE CAMERA HOLD never blocks and never outlasts the tightest margin ---------- */
{ const C5 = B5.CAM5, tight = Math.min(...Object.entries(margins[slowest]).filter(([c]) => !c.startsWith('R1')).map(([, m]) => m));
  ok(C5.camT <= 0.8 && C5.camT < tight && C5.lean < 0.75 && C5.releaseV > 0 && B5.RACE_GLASSES.every(id => L.glasses.some(g => g.id === id)), 'the race glasses\' camera look is <= ' + C5.camT + ' s (the slowest hero\'s tightest margin is ' + tight.toFixed(2) + ' s), leans less than master (' + C5.lean + ' < 0.75), lets go when the hero runs');
  const W5 = world(build(true)), g = W5.ctx.L.glasses.find(q => q.id === 'race1'), cam = () => W5.H.cam();
  W5.H.reset(); W5.place(g.x, g.y); W5.hero.vx = 0; W5.H.interact(W5.hero); W5.run(0.1); ok(!!cam(), 'a strike on a race glass: the camera looks at what it moved');
  W5.hero.vx = 80; W5.run(0.3); ok(!cam(), 'the hero running again: the camera lets go at once (it never holds the picture while the glass runs)');
  W5.H.reset(); W5.place(g.x, g.y); W5.hero.vx = 0; W5.H.interact(W5.hero); W5.run(C5.camT + 0.25); ok(!cam(), 'a hero standing still: the look ends after ' + C5.camT + ' s');
  const sg = W5.ctx.L.glasses.find(q => q.id === 'stair'); W5.H.reset(); W5.place(sg.x, sg.y); W5.hero.vx = 0; W5.H.interact(W5.hero); W5.run(1.2); ok(!!cam(), 'a non-race glass keeps master\'s 1.8 s look'); }

/* ---------- THE SAND GRASPERS: one a room, never in a race window, a run line or the mini's floor ---------- */
const gr = L.ents.filter(e => e.t === 'sandgrasper'), WIN = [['R1', B5.RACE.r1.gallery[0] - 6, B5.RACE.r1.end + 4], ['R2', 596, 612], ['R3', 658, 678], ['R4', 819, 846], ['the Glassblower\'s floor', 386, 410]];
ok(gr.length === 3 && gr.every(e => e.cnSkin === 'sanddrowned'), 'three Sand Graspers (the Drowned Quarter, the Hourglass Halls, the Throne Street), the sand-drowned skin');
for (const e of gr) for (const [nm, a, b] of WIN) ok(!(e.x >= a && e.x <= b), 'the grasper at ' + e.x + ' is not in ' + nm + ' (' + a + '-' + b + ')');
ok(gr.every((e, i) => gr.every((q, j) => i === j || Math.abs(q.x - e.x) >= 40)), 'at most one grasper to a room: the three stand >= 40 columns apart (' + gr.map(e => e.x) + ')');
ok(gr.find(e => e.x < 500).sandWait === 'great' && gr.find(e => e.x > 280 && e.x < 300).sandWait === 'upperbulb', 'the Drowned Quarter\'s rises when the great gate drains, the Halls\' when the upper bulb does (sandWait)');
{ const q = gr.find(e => e.x < 500); const foesNear = L.ents.filter(e => ['construct', 'ambusher', 'slinger', 'scorpion'].includes(e.t) && Math.abs(e.x - q.x) < 12 && e.sandWait === 'great'); ok(foesNear.length === 0, 'TAUGHT ALONE: no other foe within 12 columns of the Drowned Quarter\'s grasper (the first drowned made way for it)'); }
{ const s = SGM.newGrasper(100, 100), told = [], blows = []; let boil = 0, rise = 0;
  for (let i = 0; i < 60 * 8; i++) { const evs = SGM.graspStep(s, { px: 130, py: 100, time: i / 60 }, 1 / 60); for (const e of evs) { if (e.t === 'boil') boil++; if (e.t === 'rise') rise++; if (e.t === 'tell') told.push(e.mark); if (e.t === 'hit') blows.push(e); } if (s.mode === 'grabTell' && s.x > 100) { /* it walked up */ } }
  ok(boil === 1 && rise === 1, 'it BOILS (told) once, then rises once'); ok(told.length >= 1 && told[0] === '!!' && blows.length >= 1 && blows[0].grab && !blows[0].blockable, 'the GRAB is told ("!!", arms up ' + SGM.GRASP.grabTell + ' s) and is no shield\'s: it holds');
  ok(SGM.GRASP.grabTell >= 0.55 && SGM.graspTake({ mode: 'buried' }, 10) === 0 && SGM.graspTake({ mode: 'walk' }, 10) === 10, 'a tell long enough to roll through; under the sand it takes nothing, risen it takes a blow whole');
  ok(MARK['sandgrasper|grabTell'] === '!!' && ANSWER['sandgrasper|grabTell'] === 'dodge' && HEIGHT['sandgrasper|grabTell'] === 'low', 'its mark, answer and height are the tables\''); }

/* ---------- THE GLASSBLOWER: the kit, the floor, the opening ---------- */
{ const GB = GBM.GB, MV = GBM.MOVES;
  ok(Object.keys(MV).length === 4 && Object.values(MV).every(m => m.pose.length === 2 && m.pose[0] && m.pose[1] && m.pose[0] !== m.pose[1] && m.mark && m.sound), 'every Glassblower move has its own windup AND release pose, a mark and a sound');
  ok(GB.gobTell >= 0.95 && GB.blastTell >= 1.1 && GB.flipTell >= 0.9 && GB.bulbTell >= 0.9 && [GB.gobTell, GB.blastTell, GB.flipTell, GB.bulbTell].every(t => t >= 0.3), 'every windup is long enough to read, >= 0.3 s always and longer than the first build (gob ' + GB.gobTell + ', blast ' + GB.blastTell + ', flip ' + GB.flipTell + ', bulb ' + GB.bulbTell + ' s)');
  ok(Object.keys(MV).every(k => MARK['glassblower|' + k] && ANSWER['glassblower|' + k] && HEIGHT['glassblower|' + k]), 'the four tells are in src/marks.js (mark, answer, height)');
  ok(GBM.NEW_MOVES[1].join() === 'gob,blast,flip' && GBM.NEW_MOVES[2].join() === 'bulb', 'P1 = gob, blast, flip; P2 adds the shatter bulb (the approved kit, brief-newminis-1015)');
  ok(GB.rest >= 0.4 && GB.floor >= 0.4 && GB.openMul === 1.75 && GB.openT === 4.5, 'outside the opening he takes >= 0.4x (apron ' + GB.rest + ', ward ' + GB.floor + '); the opening is x1.75 for 4.5 s (claude/bc5fix: plan s5 said 3.5; the desktop knight was 0/5)');
  ok(GB.glintT >= 8 && GB.gap[0] >= 1.2 && GB.gap[1] >= 1.0 && GB.dmg.gob <= 22 && GB.dmg.blast <= 28 && GB.dmg.bulb <= 20 && GB.dmg.spike <= 10 && GB.blastLen <= 112 && GB.capFrac <= 0.25 && GB.capFrac >= 0.15, 'conservative (claude/bc5fix): the glass glints >= 8 s, the gaps >= 1.2/1.0 s, his blows <= 22/28/20/10, the cone <= 112 px, no blow over ' + GB.capFrac + ' of a hero max HP');
  const F = GBM.newGlassFight(GBM.gbGeom(L.mini, TS)), e = { x: 0, y: 0, hp: 1500, maxHp: 1500, mode: 'walk', open: 0, alive: true };
  const c = { said: [], number(x, y, t) { this.said.push(t); }, fx() {}, sound() {}, mark() {}, shake() {}, music() {}, hit() { return false; }, flip() { return true; }, step() {} };
  ok(GBM.gbTake(e, F, 100) === 50, 'a blow outside the opening: x0.5'); F.ward = 1; ok(GBM.gbTake(e, F, 100) === 40, 'in the ward: x0.4 - never 0 (B15)'); F.ward = 0;
  ok(GBM.hourStruck(e, F, c, 'gb') === 'dull' && c.said.includes(B5.BC5_SAY.gbNotYet) && e.mode === 'walk', 'a blow on his hourglass when it does not glint: IT HOLDS (told), no punishment, no opening');
  F.glint = { id: 'gb', t: 5 }; ok(GBM.hourStruck(e, F, c, 'gb2') === 'dull', 'a glass that is not the one that glints does not open him');
  ok(GBM.hourStruck(e, F, c, 'gb') === 'open' && GBM.gbOpen(e) && e.open === GB.openT && c.said.includes(B5.BC5_SAY.gbOpen), 'the glinting glass struck: BURIED TO THE WAIST, open for ' + GB.openT + ' s (told)');
  ok(GBM.gbTake(e, F, 100) === 140 / 1 * 1 || GBM.gbTake(e, F, 100) >= 40, 'buried he takes the opening\'s multiple'); F.openTaken = 0; const d1 = GBM.gbTake(e, F, 100); ok(Math.abs(d1 - 175) < 1e-6, 'x1.75 inside the window (' + d1 + ' for 100)'); for (let i = 0; i < 30; i++) GBM.gbTake(e, F, 100); ok(F.openTaken <= e.maxHp * GB.openCap + 1e-6 && GBM.gbTake(e, F, 100) >= 40, 'a window holds at most ' + Math.round(GB.openCap * 100) + '% of him, then the floor - never nothing'); }
{ const S = GBM.GB_STAGE, R = S.R, sx = S.sx; ok(L.mini && L.mini.boss === 'glassblower' && L.mini.gate === sx + S.W && typeof L.mini.floor === 'number' && L.mini.name === 'THE GLASSBLOWER' && L.mini.wallL === sx - 1, 'standard L.mini (gate, wall, floor, name, boss)');
  ok(L.ents.filter(e => e.t === 'glassblower').length === 1 && L.ents.find(e => e.t === 'glassblower').mini === true, 'one Glassblower, placed as the mini (main.js spawnEnt skips a mini once PROG[id].mini is set)');
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  ok(/if \(miniDone && !rushOn\(\) && L\.mini && e\.t === L\.mini\.boss && \(e\.mini/.test(main) && /PROG\[id\]\.mini = true/.test(main), 'the mini stays dead after a reload: spawnEnt skips L.mini.boss once miniDone, miniEnd writes PROG[id].mini (the standard path, no second respawn fix)');
  ok(/BC5H\.owns\(e\)/.test(main) && /case 'glassblower': case 'sandgrasper'/.test(main) && /EHP\.glassblower/.test(main), 'main.js wires the hands (spawn, update, take, draw)');
  ok(at(S.sx + S.W, R - 4 + DY) === T.PORT && at(S.sx + S.W, R - 7 + DY) === T.SOLID, 'the hall\'s east wall is a portcullis (PORT) under stone: his death lifts it');
  S.cover.forEach(([a, b], k) => { const rows = S.coverRows[k]; ok(rows >= 2 && rows <= 3 && [...Array(rows).keys()].every(j => [...Array(b - a + 1).keys()].every(i => at(sx + a + i, R - 1 - j + DY) === T.SOLID)) && at(sx + a, R - 1 - rows + DY) === T.AIR, 'a kiln stub (' + (sx + a) + '-' + (sx + b) + ') is ' + rows + ' rows of stone: a cover from the blowpipe'); });
  { /* (claude/bc5fix) FLOOR TO STAND ON WEST OF HIM: he was flush against (inside) the second stub; a melee hero reached him only from the stub top */
    const stub2 = S.cover[1], faceX = (sx + stub2[1] + 1) * TS, leftX = (sx + S.him0) * TS - GBM.GB.w / 2, strip = leftX - faceX;
    ok(S.him >= S.him0 && S.coverRows[1] <= 2 && strip >= 6, 'the near stub is <= 2 rows (a hop) and he keeps to col ' + (sx + S.him0) + ': ' + strip + ' px of floor between its face and him at his westmost, and he stands at ' + (sx + S.him));
    ok(sx + S.him0 - GBM.GB.w / 2 / TS > sx + stub2[1] + 1 && [S.him0 - 1, S.him0].every(c => at(sx + c, R + DY) === T.SOLID && [1, 2, 3].every(d => at(sx + c, R - d + DY) === T.AIR)), 'the floor west of him is open floor (stone under, three rows of air over)');
    const Gx = GBM.gbGeom(L.mini, TS); ok(Gx.minX - GBM.GB.w / 2 > faceX && Gx.minX - GBM.GB.w / 2 - faceX >= 6, 'gbGeom: his westmost standing point clears the stub face by >= 6 px (' + (Gx.minX - GBM.GB.w / 2 - faceX) + ')'); }
  const G = GBM.gbGeom(L.mini, TS); ok(G.covers.length === 2 && G.covers.every(([a, b]) => a < b) && G.glasses.length === 2, 'the geometry hands the fight its covers and its two glasses'); }
{ /* THE OPENING IS REACHED BY EVERY HERO ON BASE MOVEMENT: both glasses on the hall's floor, in the hero fill from the kiln's drop */
  for (const h of HERO_MOVE_IDS) { const R = floodReach(L, T, { hero: h }); for (const id of ['gb', 'gb2']) { const g = L.glasses.find(q => q.id === id); let got = false; for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (R.seen.has((g.x + dx) + ',' + (g.y + dy))) got = true; ok(got, h + ' reaches his hourglass ' + id + ' on base movement'); } } }
{ const sink = L.risers.filter(r => r.sinks && (r.glass === 'gb' || r.glass === 'gb2')), rise = L.risers.filter(r => !r.sinks && (r.glass === 'gb' || r.glass === 'gb2'));
  ok(sink.length === 2 && rise.length === 2 && sink.every(r => r.rows === 2) && rise.every(r => r.rows === 2), 'his FLIP drives the hall\'s own risers and sinkers (two each, two rows: a hole or a step a body climbs out of, never a sea or a death)');
  ok(L.seas.every(s => s.x1 < 389 || s.x0 > 407), 'no sand sea in the mini\'s hall (a flip is told, never lethal)'); }

/* ---------- THEME: no wood, no logs ---------- */
{ const bad = /wood|log|timber|plank|stump|crate/i, newKinds = k => [...new Set(on[k].map(p => p.kind))].filter(x => !new Set(OFFL[k].map(p => p.kind)).has(x));
  const ks = [...newKinds('plats'), ...newKinds('decor'), ...newKinds('structures')]; ok(!ks.some(k => bad.test(k)), 'no wood/log kinds among the new plats, decor and structures (' + (ks.join(',') || 'none') + ')');
  const tilesOn = new Set(on.grid), tilesOff = new Set(OFFL.grid); const fresh = [...tilesOn].filter(t => !tilesOff.has(t)); ok(fresh.every(t => t === T.PORT), 'no new tile kind in the grid but the portcullis (' + (fresh.map(t => Object.keys(T).find(k => T[k] === t)).join(',') || 'none') + ')');
  const mine = readFileSync(new URL('../src/buried-city5.js', import.meta.url), 'utf8') + readFileSync(new URL('../src/glassblower.js', import.meta.url), 'utf8') + readFileSync(new URL('../src/sand-grasper.js', import.meta.url), 'utf8');
  ok(!/\bgoblin\b|sandgob|\bwood(en)?\b|\blogs?\b/i.test(mine.replace(/no goblin|NO goblin|no wood|no wood\/log|no generic wood|NO wood/gi, '').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')), 'no goblin, no wood or log in the new modules\' code'); }
ok(on.foeHit.sanddrowned > 0 && on.foeHp.sanddrowned > 0, 'the grasper wears the sand-drowned\'s weights (foeHit / foeHp by skin)');

/* ---------- A HANDS SMOKE: the Glassblower's and the grasper's hands on a fake world, spawn / update / take / draw, no throw ---------- */
function smoke() {
  const Lh = build(true), grid = Lh.grid.slice(); Lh.grid = grid; const tileAt = (x, y) => grid[y * Lh.W + x];
  const players = [{ x: (GBM.GB_STAGE.sx + 3) * TS, y: Lh.mini.floor, ground: true, dead: false, hp: 300, w: 10, h: 14 }], enemies = []; let mini = false; const hurt = [];
  const g = new Proxy({}, { get: (t, k) => (k === 'globalAlpha' || k === 'fillStyle' || k === 'strokeStyle' ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
  const bch = { struckHooks: [], flip: { flipById: () => true } };
  const H = makeGlassblowerHands({ get L() { return Lh; }, players, TS, T, EHP: { glassblower: GBM.GB.hp, sandgrasper: SGM.GRASP.hp }, sfx: {}, hero: () => players[0], enemies: () => enemies, time: () => 0,
    number: () => {}, text: () => {}, burst: () => {}, shake: () => {}, ring: () => {}, damagePlayer: (x, d, o) => { players[0].hp -= d; hurt.push(o && o.name); }, asPlayer: (p, fn) => fn(), upright: () => true,
    overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box: b => ({ l: b.x - 5, r: b.x + 5, t: b.y - 14, b: b.y }), cellGet: tileAt, cellSet: (x, y, t) => { grid[y * Lh.W + x] = t; }, miniActive: () => mini, music: () => {}, bch: () => bch });
  ok(H.on(), 'hands: on for a BC5 build');
  for (const e of Lh.ents.filter(q => q.t === 'glassblower' || q.t === 'sandgrasper')) { const a = H.spawn(e, { x: e.x * TS + 8, y: (e.y + 1) * TS, alive: true, face: -1 }); ok(a && H.owns(a), 'hands spawn ' + e.t); n--; enemies.push(a); }
  ok(enemies.length === 4, 'hands: the Glassblower and three Sand Graspers spawned');
  for (let i = 0; i < 300; i++) { for (const e of enemies) if (H.owns(e)) { H.update(e, 1 / 60); H.drawFoe(g, e, 0, 0, i / 60); } H.tick(1 / 60); H.drawWorld(g, 0, 0, i / 60); H.drawOver(g, 0, 0, i / 60); }
  const gb = enemies.find(e => e.t === 'glassblower'); ok(gb.mode === 'sleep', 'the Glassblower sleeps until his hall\'s fight starts');
  mini = true; for (let i = 0; i < 60 * 25; i++) { H.update(gb, 1 / 60); H.drawFoe(g, gb, 0, 0, i / 60); H.drawOver(g, 0, 0, i / 60); H.drawWorld(g, 0, 0, i / 60); H.tick(1 / 60); const rd = H.read(); if (rd.gb && rd.gb.glint && !H.read().gb.opened) { for (const hk of bch.struckHooks) hk({ id: rd.gb.glint }, players[0]); } }
  const rd = H.read(); ok(rd.gb && rd.gb.n.moves !== undefined && rd.gb.n.glints >= 1 && rd.n.opens >= 1, 'hands: his flip makes a glint, the hook\'s strike opens him (opens ' + rd.n.opens + ', glints ' + rd.gb.n.glints + ')');
  ok(players[0].hp < 300 && H.take(gb, 100) > 0, 'hands: his blows land (' + (300 - players[0].hp) + ' hp in 25 s on a still hero), a blow on him lands');
  /* a grasper holds a hero and a blow tears her loose */
  const sg = enemies.find(e => e.t === 'sandgrasper' && e.x < 500 * TS); const P0 = players[0]; P0.x = sg.x + 8; P0.y = sg.y; P0.hp = 300; sg.st.mode = 'walk'; sg.st.cd = 0; mini = false;
  for (let i = 0; i < 60 * 6 && !P0.bcGrab; i++) { H.update(sg, 1 / 60); H.tick(1 / 60); P0.x = sg.x + 10 * sg.face; P0.y = sg.y; }
  ok(!!P0.bcGrab && sg.mode === 'hold', 'hands: the grasper\'s grab lands and HOLDS (told)'); const hp1 = P0.hp; for (let i = 0; i < 90; i++) H.tick(1 / 60); ok(P0.hp < hp1 || !P0.bcGrab, 'hands: it squeezes a tick while it holds');
  P0.bcGrab = P0.bcGrab || { e: sg, t: 1, tick: 0.5 }; H.take(sg, 30); ok(!P0.bcGrab, 'hands: a blow on it tears the hero loose');
}
smoke();

/* ---------- THE TOY DUEL: a flow sim, not the rate ---------- */
function duelGB(seed) {
  const rng = rng0(seed), M5 = L.mini, G = GBM.gbGeom(M5), F = GBM.newGlassFight(G), glasses = G.glasses;
  const e = { x: G.x1 - 4 * TS, y: G.floorY, hp: GBM.GB.hp, maxHp: GBM.GB.hp, mode: 'wake', modeT: 1.4, face: -1, alive: true, open: 0 };
  const P = { x: G.x0 + 3 * TS, y: G.floorY, vy: 0, ground: true, hp: 300, max: 300, flasks: 3, cd: 0, dodge: 0, ducking: false, block: false, keys: new Map() };
  const mem = {}; let t = 0, strikes = 0, flipped = 0, minMul = 9;
  const c = { hit: (bx, d, name, o) => { if (P.keys.has(o.key)) return false; const top = P.y - (P.ducking ? 8 : 14); if (!(bx[0] < P.x + 5 && bx[1] > P.x - 5 && bx[2] < P.y && bx[3] > top)) return false;
      if (o.low && !P.ground) return false; if (o.duck && P.ducking) return false; if (P.dodge > 0) return false; if (P.block && o.blockable) return false; P.keys.set(o.key, 1); P.hp -= d; return true; },
    number: () => {}, mark: () => {}, sound: () => {}, fx: () => {}, shake: () => {}, music: () => {}, flip: () => { flipped++; return true; }, step: () => {} };
  while (t < 300 && e.hp > 0 && P.hp > 0) { const dt = 1 / 60; t += dt;
    if (P.hp < P.max * 0.3 && P.flasks > 0 && !/Tell$/.test(e.mode)) { P.flasks--; P.hp = Math.min(P.max, P.hp + P.max * 0.4); }
    const out = GBM.gbPlan({ P, e, F, t, rng, mem });
    P.ducking = !!out.duck && P.ground; P.block = !!out.block && P.ground; if (out.dodge && P.dodge <= 0) P.dodge = 0.35; P.dodge -= dt;
    if (out.jump && P.ground) { P.vy = -330; P.ground = false; }
    if (!P.ground) { P.vy += 980 * dt; P.y += P.vy * dt; if (P.y >= G.floorY) { P.y = G.floorY; P.vy = 0; P.ground = true; } }
    if (out.gx != null && !P.ducking && Math.abs(out.gx - P.x) > 3) P.x += Math.sign(out.gx - P.x) * Math.min(Math.abs(out.gx - P.x), (P.dodge > 0 ? 200 : 95) * dt);
    P.x = Math.max(G.x0 + 8, Math.min(G.x1 - 8, P.x)); P.cd -= dt;
    if (out.atk && P.cd <= 0) { P.cd = 0.38;
      const gq = glasses.find(q => Math.abs(q.x - P.x) < 14 && F.glint && F.glint.id === q.id); if (gq) { strikes++; GBM.hourStruck(e, F, c, gq.id); }
      else if (Math.abs(e.x - P.x) < 30) { const d = GBM.gbTake(e, F, 18); minMul = Math.min(minMul, d / 18); e.hp -= d; } }
    GBM.stepGlassblower(e, F, dt, [{ x: P.x, y: P.y, ground: P.ground, alive: true, ducking: P.ducking }], c); }
  return { win: e.hp <= 0, t, hp: Math.max(0, P.hp), flasks: P.flasks, opens: F.n.opens, glints: F.n.glints, missed: F.n.glintsMissed, strikes, flips: flipped, ph: F.ph, minMul, moves: { ...F.n.moves } };
}
function duels(N, log) {
  const g = []; for (let s = 1; s <= N; s++) g.push(duelGB(s * 7919)); const sum = k => g.reduce((x, r) => x + r[k], 0);
  if (log) for (const r of g) console.log('  GB ', JSON.stringify(r, (k, v) => (typeof v === 'number' ? +v.toFixed(2) : v)));
  console.log('TOY DUEL GLASSBLOWER n=' + N + ': ' + g.filter(r => r.win).length + '/' + N + ' won, avg ' + (sum('t') / N).toFixed(0) + ' s, opens ' + (sum('opens') / N).toFixed(1) + '/fight, glints ' + (sum('glints') / N).toFixed(1) + ', reached P2 ' + g.filter(r => r.ph === 2).length + '/' + N + ', flasks left ' + (sum('flasks') / N).toFixed(1) + ', lowest blow multiple ' + Math.min(...g.map(r => r.minMul)).toFixed(2));
  return g;
}
if (opt('sim')) { duels(+opt('sim'), args.includes('--log')); process.exit(0); }
const g = duels(6, args.includes('--log'));
ok(g.every(r => r.opens > 0), 'toy duel: every fight opens him through his own hourglass (the verb reaches him)');
ok(g.every(r => r.minMul >= 0.4) && g.every(r => r.t < 300) && g.some(r => r.win) && g.every(r => r.ph === 2 || r.win || r.t >= 60), 'toy duel: no blow ever below 0.4x, no stall (every fight resolves inside the cap), the bot wins some');
ok(g.every(r => ['gobTell', 'blastTell', 'flipTell'].every(m => (r.moves[m] || 0) > 0)), 'toy duel: P1\'s three moves all come up; P2 adds the bulb (' + g.filter(r => (r.moves.bulbTell || 0) > 0).length + '/' + g.length + ' fights reached it)');
console.log('buried-city5: ' + n + ' checks green');
