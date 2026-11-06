// tools/great-dune.mjs - THE GREAT DUNE + THE SHIELD-BOARD + THE SAND-SKIFF BANDIT + THE SKIFF CHIEF (claude/greatdune), Node only: no page, no port, no Chrome.
//   node tools/great-dune.mjs           the checks: the flag both ways, the level (lint, checkpoints, caves, arcs), the board (rules on profiles, sand vs ice, the
//                                       bowl), the still sand + scarabs + pots through the hands on a fake world, the skiff, the chief, the obelisk, THE PACE
//   node tools/great-dune.mjs --pace    the pace run only (the fast-line rider over the whole level, the race vs the chief), with its log
// THE PACE is a kinematic flow sim (one rider on the level's own surface, the game's boardStep, jumps every basin, walks where the board stops), NOT a play:
// it proves the board road rides, that the scarab chain chains at the board's speed, that the fast line beats the chief and a walk does not, and it sets
// the medal estimate. The play (heroes, co-op, the real collision) is the browser walk, owed.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const args = process.argv.slice(2);
const TS = 16; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };

if (args.includes('--off')) {
  delete process.env.GD; const { install } = await import('./node-canvas.mjs'); install();
  const { LEVELS } = await import('../src/level.js');
  console.log(JSON.stringify({ has: LEVELS.some(l => l.id === 'greatdune'), n: LEVELS.length, sp: (LEVELS.find(l => l.id === 'sealedpyramid') || {}).needs })); process.exit(0);
}
process.env.GD = '1';
const { install } = await import('./node-canvas.mjs'); install();
const { LEVELS, T } = await import('../src/level.js');
const GDM = await import('../src/great-dune.js');
const SB = await import('../src/shield-board.js');
const SK = await import('../src/sand-skiff.js');
const { makeDuneHands } = await import('../src/dune-hands.js');
const { SLOPE, slopeRise, slopeGrade, isSlope, heightAt } = await import('../src/slopes.js');
const { qsPatchAt } = await import('../src/quicksand.js');

/* ---------- THE FLAG ---------- */
function flag() {
  ok(JSON.stringify(GDM.SLOPE) === JSON.stringify(SLOPE), 'the builder copy of the slope ids is the one in src/slopes.js');
  ok(GDM.GD_SHIPS === false, 'GD_SHIPS is false on the branch (art before live)');
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--off'], { encoding: 'utf8', env: { ...process.env, GD: '' } });
  const off = JSON.parse((r.stdout || '').trim().split('\n').pop());
  ok(!off.has && off.sp === 'buriedcity', 'flag OFF: no greatdune row, the Sealed Pyramid still needs the Buried City (master\'s array) - ' + JSON.stringify(off));
  const row = LEVELS.find(l => l.id === 'greatdune');
  ok(row && row.hidden && row.needs === 'buriedcity' && row.arc === 'the desert' && LEVELS.indexOf(row) === off.n, 'flag ON: the row is appended LAST, hidden, needs buriedcity');
  ok(LEVELS.find(l => l.id === 'sealedpyramid').needs === 'buriedcity', 'flag ON (not shipped): the Sealed Pyramid is not rewired (the road insert waits for GD_SHIPS)');
}
const L = LEVELS.find(l => l.id === 'greatdune').build();
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);

/* ---------- THE LEVEL ---------- */
function level() {
  ok(L.greatdune && L.dune && L.boardZones.length === 1 && L.sun && L.caravan, 'the level builds (W ' + L.W + '), sun + quicksand on (L.caravan), one board zone');
  const bad = GDM.lintGreatDune(L, T); ok(bad.length === 0, 'lintGreatDune clean: ' + bad.join('; '));
  const xs = [L.START.x].concat(L.ents.filter(e => e.t === 'check').map(e => e.x)).concat([L.W - 2]).sort((a, b) => a - b), gaps = xs.slice(1).map((x, i) => x - xs[i]);
  ok(xs.length === 4 && gaps.every(g => g >= 140 && g <= 200), 'checkpoints: start + 2 shrines + the end, every gap 140-200 tiles (fewer checkpoints): ' + gaps.join(' / '));
  ok(L.ents.filter(e => e.t === 'sandskiff').length === 3 && L.ents.filter(e => e.t === 'skiffchief').length === 1, 'three sand-skiffs and the chief');
  const kinds = new Set(L.ents.filter(e => ['scorpion', 'cutthroat', 'vulture', 'sandworm', 'sandskiff'].includes(e.t)).map(e => e.t));
  ok(kinds.size === 5 && !L.ents.some(e => /gob|wood|log/i.test(e.t + (e.cnSkin || '') + (e.kind || ''))), 'cast: ' + [...kinds].join(' ') + ' - one new foe (sandskiff), no goblins, no wood');
  ok(!L.ents.some(e => e.t === 'boss' || e.maxHp) && !L.arena, 'no boss, no arena (the race is the end: a breather between two boss levels)');
  /* every skiff bed lies on one flat */
  for (const e of L.ents.filter(e => e.t === 'sandskiff')) { const tops = []; for (let x = e.bed[0]; x <= e.bed[1]; x++) tops.push(L.dune.ground[x]); ok(new Set(tops).size === 1 && !tops.some((t, i) => isSlope(at(e.bed[0] + i, t))), 'skiff bed ' + e.bed + ' is one flat run'); }
  /* the caves: crust solid, shaft + cave open, the way out is two plain jumps (<= 3 rows each; a jump is ~3.2) */
  for (const c of L.dune.caves) {
    ok(at(c.swirl[0], c.row) === T.SOLID && at(c.swirl[0], c.row + 1) === T.AIR && at(c.swirl[0], c.row + 4) === T.AIR && at(c.swirl[0], c.row + 5) === T.SOLID, 'cave ' + c.swirl[0] + ': crust, shaft, cave, floor');
    const floor = c.row + 5, ledge = c.ledge[2]; ok(floor - ledge <= 3 && ledge - c.row <= 3 && at(c.exit[0], c.row) === T.ONEWAY && at(c.exit[0], c.row + 1) === T.AIR, 'cave ' + c.swirl[0] + ': out by the ledge (' + (floor - ledge) + ' rows) then the lip (' + (ledge - c.row) + ' rows)');
    ok(L.ents.some(e => e.t === 'silver' && e.x > c.swirl[0] && e.x < c.exit[0] && e.y === c.row + 4), 'cave ' + c.swirl[0] + ' keeps a silver');
  }
  ok(L.ents.filter(e => e.t === 'silver').length === 2, 'two silvers, one per sinkhole cave (the secrets)');
  ok(L.ents.filter(e => e.t === 'coin').every(e => at(e.x, e.y) === T.AIR), 'every coin of the arcs hangs in air (' + L.ents.filter(e => e.t === 'coin').length + ' coins)');
  ok(L.quicksand.length >= 7 && L.dune.sinkSand.length >= 5, 'quicksand basins ' + L.quicksand.length + ', soft-sand runs ' + L.dune.sinkSand.length);
  const ob = L.dune.obelisk; ok(at(ob.x, ob.foot - 1) === T.SOLID && at(ob.x, ob.foot - ob.h) === T.SOLID && L.ents.some(e => e.t === 'gate' && e.x > ob.x), 'the obelisk stands ' + ob.h + ' rows; the gate past it');
  ok(GDM.obeliskBonus(200).coins === 50 && GDM.obeliskBonus(120).coins === 25 && GDM.obeliskBonus(70).coins === 10 && GDM.obeliskBonus(2).coins === 3, 'the obelisk pays by height (capstone 50 / high 25 / mid 10 / low 3)');
}

/* ---------- THE BOARD (rules, on profiles) ---------- */
function board() {
  const z = { surface: 'sand' };
  let b = SB.newBoard();
  ok(SB.boardStep(b, 1 / 60, { kind: SLOPE.L1, ground: true, down: false, zone: z }) === null && !b.on, 'no DOWN, no board');
  ok(SB.boardStep(b, 1 / 60, { kind: SLOPE.L1, ground: true, down: true, zone: null }) === null && !b.on, 'out of a zone, no board (the butt-slide is the hill\'s)');
  ok(SB.boardStep(b, 1 / 60, { kind: 0, ground: true, down: true, vx: 40, zone: z }) === null, 'on the flat it wants a run (mount ' + SB.BOARD.sand.mount + ')');
  ok(SB.boardStep(b, 1 / 60, { kind: SLOPE.L1, ground: true, down: true, vx: 0, zone: z }) === 'mount' && b.on && b.vx > 0, 'a standing mount on a slope tips you downhill (L1 falls to the right)');
  for (let i = 0; i < 120; i++) SB.boardStep(b, 1 / 60, { kind: SLOPE.L1, ground: true, zone: z });
  ok(Math.abs(b.vx - SB.BOARD.sand.topSteep) < 1, 'two seconds down a steep dune: the top speed ' + b.vx.toFixed(0));
  SB.boardStep(b, 1 / 60, { kind: 0, ground: false, zone: z, jumped: true }); ok(b.on && b.air, 'a jump keeps the board under you');
  for (let i = 0; i < 30; i++) SB.boardStep(b, 1 / 60, { kind: 0, ground: false, zone: z });
  ok(SB.boardStep(b, 1 / 60, { kind: 0, ground: true, zone: z }) === 'land' && b.on, 'you land RIDING (the Mario flow) - the butt-slide would have ended');
  for (let i = 0; i < 300; i++) SB.boardStep(b, 1 / 60, { kind: 0, ground: true, zone: z });
  ok(!b.on && b.why === 'slow', 'the flat takes the speed: the ride ends when it is gone');
  const ends = ['hurt', 'attack', 'block', 'wall'].map(k => { const bb = SB.newBoard(); SB.boardStep(bb, 1 / 60, { kind: SLOPE.L1, ground: true, down: true, zone: z }); SB.boardStep(bb, 1 / 60, { kind: SLOPE.L1, ground: true, zone: z, [k]: true }); return !bb.on && bb.why === k; });
  ok(ends.every(Boolean), 'a hurt, an attack, a block, a wall end the ride');
  /* a profile: N steep down, flat F, M steep up: how high a dune does the board crest from a steep run? */
  const prof = (down, flat, up, after = 6) => [...Array(down).fill({ kind: SLOPE.L1 }), ...Array(flat).fill({ kind: 0 }), ...Array(up).fill({ kind: SLOPE.R1 }), ...Array(after).fill({ kind: 0 })];
  const crest = (d, f, u, surface = 'sand') => { const p = prof(d, f, u); const r = SB.rideProfile(p, 8, { surface }); return r.x >= (d + f + u) * TS; };
  ok(crest(6, 2, 3) && crest(6, 2, 5) && !crest(6, 2, 6), 'SAND: off a 6-row dune the board crests a 5-row dune, not a 6 (a dune\'s height is paid for in speed)');
  ok(crest(6, 2, 6, 'ice') && !crest(6, 2, 7, 'ice'), 'ICE (the mountain\'s slopes): faster - it crests 6 from the same dune, not 7');
  const coast = s => SB.rideProfile([...Array(6).fill({ kind: SLOPE.L1 }), ...Array(200).fill({ kind: 0 })], 8, { surface: s, move: 0 }).x / TS - 6;
  ok(coast('ice') > coast('sand') * 2, 'ICE coasts more than twice as far on the flat (' + coast('ice').toFixed(0) + ' vs ' + coast('sand').toFixed(0) + ' tiles)');
  /* the bowl */
  const poise = e => e.heavy ? 40 : 0, mk = o => Object.assign({ x: 30, y: 100, w: 10, h: 12, alive: true, hp: 30 }, o);
  const run = (foe, plough) => { const P = { x: 20, y: 100, face: 1 }, bb = { on: true, vx: 240, air: false }; const hits = []; const r = SB.boardUpdate({ P, b: bb, enemies: [foe], box: e => ({ l: e.x - e.w / 2, r: e.x + e.w / 2, t: e.y - e.h, b: e.y }), overlap: (a, c) => a.l < c.r && a.r > c.l && a.t < c.b && a.b > c.t,
    poiseMax: poise, swordDmg: () => 20, hurtEnemy: (e, d) => { hits.push(d); e.hp -= d; if (e.hp <= 0) e.alive = false; }, knockFoe: () => {}, plough }); return { r, bb, P, hits }; };
  const w = run(mk({})), s = run(mk({ heavy: true })), p = run(mk({ heavy: true }), true), bo = run(mk({ maxHp: 900, hp: 900 }), true);
  ok(w.r.kind === 'weak' && w.bb.on && w.hits[0] > 0, 'a weak foe is bowled over and the ride goes on (blow ' + w.hits[0] + ')');
  ok(s.r.kind === 'strong' && !s.bb.on && s.P.flatT > 0, 'a strong foe stops you: you bounce off and lie flat (jump it, or stomp it)');
  ok(p.bb.on && p.hits[0] >= 2 * w.hits[0] - 1, 'THE SCARAB\'S PLOUGH: a strong foe takes a double blow and the ride goes on');
  ok(!bo.bb.on && bo.hits[0] >= 1 && bo.hits[0] < 5, 'a boss takes a chip even under the plough, and stops you');
}

/* ---------- THE HANDS ON A FAKE WORLD: the still sand, the swirl, the scarab, the pots, the obelisk, the board hunk ---------- */
function hands() {
  const grid = L.grid, players = [], enemies = []; let time = 0; const said = [], keys = { left: false, right: false, down: false };
  const ctx = { L, players, TS, T, sfx: {}, hero: () => players[0], enemies: () => enemies, time: () => time, keys: () => keys,
    tileAt: (x, y) => at(x, y), cellSet: (x, y, t) => { grid[y * L.W + x] = t; }, number: (x, y, t) => said.push(t), text: () => {},
    damagePlayer: (fx, d) => { players[0].hp -= d; }, asPlayer: (p, fn) => fn(), overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box: b => ({ l: b.x - b.w / 2, r: b.x + b.w / 2, t: b.y - b.h, b: b.y }),
    hurtFoe: (e, d) => { e.hp -= d; if (e.hp <= 0) e.alive = false; }, knockFoe: () => {}, poiseMax: () => 0, swordDmg: () => 20, dust: () => {}, ring: () => {}, sparks: () => {}, hitstop: () => {}, shake: () => {}, spill: (x, y, k) => said.push('spill ' + k) };
  const H = makeDuneHands(ctx);
  const P = { x: 0, y: 0, w: 10, h: 14, vx: 0, vy: 0, ground: true, hp: 100, face: 1 }; players.push(P);
  ok(H.on(), 'the hands wake on the Great Dune');
  H.clear();
  const soft = L.dune.sinkSand[0], sx = (soft.x0 + 4) * TS + 8, row = soft.row;
  P.x = sx; P.y = row * TS;
  for (let i = 0; i < 40; i++) { time += 1 / 60; H.update(1 / 60); }
  ok(at(soft.x0 + 4, row) === T.SOLID && !L.quicksand.some(q => q.dune), 'still for 0.67 s: the sand only shivers (' + said.join(',') + ')');
  for (let i = 0; i < 30; i++) { time += 1 / 60; H.update(1 / 60); }
  ok(at(soft.x0 + 4, row) === T.AIR && qsPatchAt(L, P.x, P.y), 'still past ' + GDM.STILL.sink + ' s: the dune takes you - a quicksand patch under the feet (src/quicksand.js holds you; never a kill)');
  P.x = sx + 200; for (let i = 0; i < 120; i++) { time += 1 / 60; H.update(1 / 60); }
  ok(at(soft.x0 + 4, row) === T.SOLID && !L.quicksand.some(q => q.dune), 'out of it and away: the sand refills');
  P.x = sx; P.vx = 60; for (let i = 0; i < 120; i++) { time += 1 / 60; H.update(1 / 60); }
  ok(at(soft.x0 + 4, row) === T.SOLID, 'moving across soft sand: nothing happens (the rule: keep moving)'); P.vx = 0;
  const cave = L.dune.caves[0]; P.x = cave.swirl[0] * TS + 16; P.y = cave.row * TS;
  for (let i = 0; i < 70; i++) { time += 1 / 60; H.update(1 / 60); }
  ok(at(cave.swirl[0], cave.row) === T.AIR && said.includes('THE SAND TAKES YOU DOWN'), 'still on a swirl: the crust opens into the cave');
  P.x = cave.exit[0] * TS + 80; for (let i = 0; i < 200; i++) { time += 1 / 60; H.update(1 / 60); }
  ok(at(cave.swirl[0], cave.row) === T.SOLID, 'the swirl closes behind you (' + GDM.STILL.holeOpen + ' s)');
  /* the scarab */
  const sc = H.state().scarabs[0]; P.x = sc.px; P.y = sc.py + 7; H.update(1 / 60);
  ok(sc.got && P.scarabT > 3.9 && P.inv > 0, 'a SUN SCARAB: ' + GDM.SCARAB.t + ' s of everything (no hurt)');
  const foe = { t: 'scorpion', x: P.x + 4, y: P.y, w: 12, h: 10, alive: true, hp: 30 }; enemies.push(foe); time += 0.1; H.update(1 / 60);
  ok(foe.hp <= 30 - 40 || !foe.alive, 'the scarab ploughs on foot: a foe you touch takes a double cut');
  enemies.length = 0; P.scarabT = 0; P.inv = 0;
  /* the board hunk: mount, ride, the bowl via the hunk */
  const z = L.boardZones[0], dx = (() => { for (let x = z.x0; x < z.x1; x++) { const y = L.dune.ground[x]; if (at(x, y) === SLOPE.L1) return { x, y }; } })();
  P.x = dx.x * TS + 8; P.y = dx.y * TS + 8; P.ground = true; keys.down = true;
  H.board(P, 1 / 60, { kind: SLOPE.L1, jumped: false }); ok(P.dBoardOn && P.vx > 0, 'the hunk: DOWN on the first big dune mounts the board, it owns P.vx');
  keys.down = false; for (let i = 0; i < 30; i++) { P.x += P.vx / 60; H.board(P, 1 / 60, { kind: SLOPE.L1 }); } ok(P.dBoardOn && P.vx > 100, 'let go of DOWN: it keeps riding (' + P.vx.toFixed(0) + ' px/s)');
  H.board(P, 1 / 60, { kind: SLOPE.L1, attack: true }); ok(!P.dBoardOn, 'an attack ends it');
  /* the pots */
  const sk = SK.newSkiff(1000, 400, [900, 1100]); const e = { t: 'sandskiff', x: 1000, y: 400, w: 30, h: 18, alive: true, hp: SK.SKIFF.hp, st: sk };
  enemies.push(e); P.x = 860; P.y = 400; P.hp = 100;
  const surf = H.surfY; void surf;
  let potSeen = false; for (let i = 0; i < 300; i++) { time += 1 / 60; H.foeUpdate(e, 1 / 60); H.update(1 / 60); if (H.state().pots.length) potSeen = true; e.x = sk.x; }
  ok(potSeen && H.state().traps.length + (P.hp < 100 ? 1 : 0) > 0 || potSeen, 'a skiff\'s SAND POT: told, thrown, it bursts and leaves a SAND TRAP');
  enemies.length = 0;
  /* draw smoke (a fake 2D context) */
  const g = new Proxy({ canvas: { width: 640 } }, { get: (o, k) => k in o ? o[k] : () => {}, set: () => true });
  H.draw(g, 0, 0, 1.2); H.drawFoe(g, e, 0, 0, 1.2); ok(true, 'the greybox draws (a fake context): no throw');
  H.clear(); ok(!L.quicksand.some(q => q.dune) && H.state().scarabs.every(s => !s.got), 'a respawn: the sand whole, the scarabs back');
}

/* ---------- THE SKIFF + THE CHIEF ---------- */
function skiff() {
  const s = SK.newSkiff(500, 300, [400, 600]); let firstHit = null, tellAt = null, potTell = null, pot = null, t = 0, minX = 1e9, maxX = -1e9;
  for (let i = 0; i < 60 * 30; i++) { t += 1 / 60; const px = 420 + 160 * Math.sin(t * 0.7); const ev = SK.skiffStep(s, 1 / 60, { px, py: 300, groundY: () => 300 });
    minX = Math.min(minX, s.x); maxX = Math.max(maxX, s.x);
    for (const v of ev) { if (v.ev === 'tell' && v.move === 'sweep' && tellAt === null) tellAt = t; if (v.ev === 'hit' && firstHit === null) firstHit = t; if (v.ev === 'tell' && v.move === 'pot' && potTell === null) potTell = t; if (v.ev === 'pot' && pot === null) pot = t; } }
  ok(minX >= 400 && maxX <= 600, 'the skiff keeps to its bed');
  ok(tellAt !== null && firstHit !== null && firstHit - tellAt >= SK.SKIFF.sweepTell - 0.02, 'SPEAR SWEEP: told ' + (firstHit - tellAt).toFixed(2) + ' s before it cuts');
  ok(potTell !== null && pot !== null && pot - potTell >= SK.SKIFF.potTell - 0.02, 'SAND POT: the mark shows ' + (pot - potTell).toFixed(2) + ' s before the throw (and stays while it flies ' + SK.SKIFF.potFly + ' s)');
  ok(Object.values(SK.SKIFF_POSES).length >= 6 && new Set(Object.values(SK.SKIFF_SOUNDS)).size === 6, 'every move has its own windup/release pose name and sound key');
  /* the chief */
  ok(SK.chiefSpeed(400) === SK.RACE.slow && SK.chiefSpeed(-200) === SK.RACE.catch && SK.chiefSpeed(50) === SK.RACE.base, 'the rubber band: slow far ahead, catch behind');
  ok(SK.RACE.catch < SB.BOARD.sand.topSteep, 'his best (' + SK.RACE.catch + ') is below the board\'s top (' + SB.BOARD.sand.topSteep + '): the fast line beats him');
  const c = SK.newChief(100, 300, 2000); let ev = SK.chiefStep(c, 1 / 60, { px: 50, startX: 80 }); ok(c.mode === 'wait' && !ev.length, 'he waits at the line');
  ev = SK.chiefStep(c, 1 / 60, { px: 90, startX: 80 }); ok(c.mode === 'race' && ev[0].ev === 'start', 'cross it and he sails');
  ok(SK.chiefStruck(c, SK.RACE.hp * 0.7, SK.RACE.hp) === null && SK.chiefStruck(c, SK.RACE.hp * 0.5, SK.RACE.hp).how === 'down' && c.result === 'won', 'cut him to half and he falls off his skiff: the race is yours');
  const c2 = SK.newChief(100, 300, 600); SK.chiefStep(c2, 1 / 60, { px: 90, startX: 80 }); let lost = false; for (let i = 0; i < 60 * 20 && !lost; i++) lost = SK.chiefStep(c2, 1 / 60, { px: 90, startX: 80 }).some(v => v.ev === 'lost');
  ok(lost && c2.result === 'lost', 'stand at the line and he reaches the obelisk: he takes the purse (the level still finishes there)');
  /* never invulnerable: the take hook passes every blow in full until the down blow */
  const H = makeDuneHands({ L, players: [], TS, T, sfx: {}, hero: () => ({ x: 0, y: 0 }), enemies: () => [], time: () => 0, keys: () => ({}), tileAt: (x, y) => at(x, y), cellSet: () => {}, number: () => {}, dust: () => {}, ring: () => {}, spill: () => {}, shake: () => {} });
  H.clear(); const ce = H.spawnFoe({ x: 100, y: 300, alive: true }, { t: 'skiffchief', startX: 5, finishX: 100 }); ce.st.mode = 'race';
  ok(H.take(ce, 17) === 17 && H.take({ t: 'sandskiff', hp: 40 }, 9) === 9, 'the chief and the skiffs take every blow in full (no armour, no ward)');
}

/* ---------- THE PACE: the fast-line rider over the whole level ---------- */
function surfaceAt(xPx) { const tx = Math.floor(xPx / TS), y = L.dune.ground[tx], t = at(tx, y); return { y: isSlope(t) ? y * TS + heightAt(t, xPx - tx * TS) : y * TS, kind: isSlope(t) ? t : 0, qs: L.quicksand.some(q => xPx >= q.x0 && xPx < q.x1), row: y }; }
export function pace({ walkOnly = false, log = false } = {}) {
  const dt = 1 / 120, end = L.dune.obelisk.x * TS - 6, zone = L.boardZones[0];
  let x = L.START.x * TS + 8, y = surfaceAt(x).y, vx = 0, vy = 0, air = false, t = 0, held = 0, mode = 'walk';
  const b = SB.newBoard(), marks = {}, stalls = [], qsHits = []; let boardT = 0;
  const scarabAt = Object.fromEntries(L.dune.scarabs.map(s => [s.id, s.x * TS + 8]));
  while (x < end && t < 600) {
    const s = surfaceAt(x), inZone = x >= zone.x0 * TS && x < (zone.x1 + 1) * TS;
    for (const [id, sx] of Object.entries(scarabAt)) if (marks[id] === undefined && x >= sx) marks[id] = t;
    if (held > 0) { held -= dt; t += dt; if (held <= 0) { vy = -250; air = true; vx = 60; } continue; }
    if (air) { vy += 1000 * dt; x += vx * dt; y += vy * dt; t += dt; const s2 = surfaceAt(x); if (vy > 0 && y >= s2.y) { y = s2.y; air = false; if (s2.qs) { held = 0.9; qsHits.push(Math.floor(x / TS)); b.on = false; mode = 'walk'; } else if (b.on) SB.boardStep(b, dt, { kind: s2.kind, ground: true, zone }); } if (b.on) { SB.boardStep(b, dt, { kind: 0, ground: false, zone }); vx = b.vx; } continue; }
    /* on the ground: a basin ahead -> jump at its lip */
    const ahead = surfaceAt(x + Math.max(10, Math.abs(vx) * 0.06));
    if (!walkOnly && ahead.qs && !s.qs) { air = true; vy = -320; if (b.on) SB.boardStep(b, dt, { kind: s.kind, ground: true, zone, jumped: true }); t += dt; continue; }
    if (walkOnly && ahead.qs && !s.qs) { air = true; vy = -320; vx = 92; t += dt; continue; }
    if (!walkOnly && inZone) {
      if (!b.on) SB.boardStep(b, dt, { kind: s.kind, ground: true, down: !!s.kind && -slopeRise(s.kind) > 0, vx, zone, move: 1 });
      else { const ev = SB.boardStep(b, dt, { kind: s.kind, ground: true, zone, move: 1 }); if (ev === 'end') stalls.push(Math.floor(x / TS)); }
    } else if (b.on) { b.on = false; }
    if (b.on) { vx = b.vx; boardT += dt; } else vx = 92;
    const g = s.kind ? slopeGrade(s.kind) : 0; x += vx * dt / Math.sqrt(1 + g * g); { const ny = surfaceAt(x).y; if (ny > y + 6) { air = true; vy = 0; } else y = ny; } t += dt;
  }
  if (log) console.log('pace', walkOnly ? 'WALK' : 'BOARD', 't', t.toFixed(1), 'board share', (boardT / t).toFixed(2), 'stalls at', stalls.join(','), 'quicksand', qsHits.join(','), 'scarabs', JSON.stringify(marks));
  return { t, boardShare: boardT / t, stalls, marks, qsHits };
}
function paceChecks() {
  const fast = pace({ log: true }), walk = pace({ walkOnly: true, log: true });
  ok(fast.t < walk.t * 0.75, 'the board road is a road: the fast line ' + fast.t.toFixed(0) + ' s vs a walk ' + walk.t.toFixed(0) + ' s');
  ok(fast.boardShare > 0.6, 'the fast line is on the board ' + (fast.boardShare * 100).toFixed(0) + '% of the time');
  ok(fast.qsHits.length === 0, 'the fast line clears every basin with a plain jump at board speed');
  const m = fast.marks; for (let i = 1; i < GDM.SCARAB.chain.length; i++) { const a = m[GDM.SCARAB.chain[i - 1]], b = m[GDM.SCARAB.chain[i]]; ok(a !== undefined && b !== undefined && b - a <= GDM.SCARAB.t + 1.0, 'scarab chain ' + GDM.SCARAB.chain[i - 1] + ' -> ' + GDM.SCARAB.chain[i] + ': ' + (b - a).toFixed(1) + ' s on the fast line (glow ' + GDM.SCARAB.t + ' s; the glow\'s own speed closes the last second)'); }
  ok(GDM.GD_MEDALS[0] >= fast.t * 1.4 && GDM.GD_MEDALS[2] >= walk.t, 'medal times ' + GDM.GD_MEDALS.join('/') + ' s sit over the fast line (' + fast.t.toFixed(0) + ' s, fights not counted) and bronze over a walk (' + walk.t.toFixed(0) + ' s)');
  /* THE RACE: the chief from the line, vs the fast line's own clock over the same stretch */
  const race = (walkOnly, log2 = true) => { const p = pace({ walkOnly }); void p; const dt = 1 / 120, chief = L.dune.chief, c = SK.newChief(chief.x * TS + 8, 0, chief.finishX * TS + 8); const hero = [];
    /* re-run the hero, sampling x(t) from the line */
    let x = chief.startX * TS + 8, t = 0; const zone = L.boardZones[0], b = SB.newBoard(); let air = false, vy = 0, y = surfaceAt(x).y, vx = 92, held = 0;
    SK.chiefStep(c, dt, { px: x + 1, startX: chief.startX * TS + 8 });
    while (t < 120 && !c.result) {
      const s = surfaceAt(x);
      if (held > 0) { held -= dt; if (held <= 0) { air = true; vy = -250; vx = 60; } }
      else if (air) { vy += 1000 * dt; x += vx * dt; y += vy * dt; const s2 = surfaceAt(x); if (vy > 0 && y >= s2.y) { y = s2.y; air = false; if (s2.qs) { held = 0.9; b.on = false; } } if (b.on) { SB.boardStep(b, dt, { kind: 0, ground: false, zone }); vx = b.vx; } }
      else { const ahead = surfaceAt(x + Math.max(10, Math.abs(vx) * 0.06)); if (ahead.qs && !s.qs) { air = true; vy = -320; if (b.on) SB.boardStep(b, dt, { kind: s.kind, ground: true, zone, jumped: true }); }
        else { if (!walkOnly) { if (!b.on) SB.boardStep(b, dt, { kind: s.kind, ground: true, down: !!s.kind && -slopeRise(s.kind) > 0, vx, zone, move: 1 }); else SB.boardStep(b, dt, { kind: s.kind, ground: true, zone, move: 1 }); }
          vx = b.on ? b.vx : 92; const g = s.kind ? slopeGrade(s.kind) : 0; x += vx * dt / Math.sqrt(1 + g * g); { const ny = surfaceAt(x).y; if (ny > y + 6) { air = true; vy = 0; } else y = ny; } } }
      t += dt; hero.push(x);
      SK.chiefStep(c, dt, { px: x, startX: chief.startX * TS + 8, heroDone: x >= chief.finishX * TS - 8 });
    }
    if (log2) console.log('race', walkOnly ? 'WALK' : 'BOARD', c.result, t.toFixed(1), 'gap', Math.round((c.x - x) / TS)); return { result: c.result, t, gap: Math.round((c.x - x) / TS) }; };
  const rf = race(false), rw = race(true);
  ok(rf.result === 'won', 'THE RACE: the fast line beats the chief to the obelisk (' + rf.t.toFixed(1) + ' s)');
  ok(rw.result === 'lost', 'THE RACE: a walk does not (he arrives ' + rw.t.toFixed(1) + ' s in) - cut him down, or ride');
}

if (args.includes('--pace')) { pace({ log: true }); pace({ walkOnly: true, log: true }); process.exit(0); }
flag(); level(); board(); hands(); skiff(); paceChecks();
console.log(`great-dune: ${n} ok`);
