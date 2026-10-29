// tools/rookery.mjs - THE ROOKERY and THE SHRIEK SISTERS (claude/rookery, the opus greybox; Node, no page - tools/rookery-probe.mjs is the page smoke).
//   THE ROAD: Gale Moor > THE ROOKERY > the Sky Road (THE ROC) (append-only LEVELS: the level is pushed after the array); a map node on the road; the old-save rule in
//   src/main.js (a save with the Sky Road open keeps it - PROG.skyOpen once, rookeryRoadMig - and the rookery itself needs only Gale Moor, so a save already past it finds
//   it UNLOCKED as an extra, never as a new requirement: proven here on the gate function over a fake PROG); gated by level-quality; the rule line; five named areas.
//   THE ROUTE: the fill reaches every shrine, silver and the boss; every REQUIRED cracked rock is a LOCK; the optional one is not; what each breaks lands in open air
//   (or, a floor, opens onto the way below); every mark stands on footing with its roost's harpy placed; the rule is taught, tested, remixed and examined (>= 3 kinds).
//   THE HANDS IN A FAKE WORLD: a hero on a mark -> her scream, her aim, her dive at the MARK -> the rock breaks (cells laid / opened), she lies stunned; a harpy cut down
//   in her dive still breaks it; a dead roost sends another; THE SHRIEKER screams, marks the hero's spot and every harpy near dives at the mark.
//     node tools/rookery.mjs
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { ROOKERY, SECTIONS, RK_RULE, ARCS } from '../src/rookery.js';
import { makeRookeryHands, RK_SAY, K, crackCells, markX, markY } from '../src/rookery-hands.js';
import { SAY_LINES } from '../src/hint-lines.js';
import * as SSM from '../src/shriek-sisters.js';
import { POSE as POSE_SS, makeShriekSistersHands } from '../src/shriek-sisters-hands.js';
const TS = 16;
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const lv = LEVELS.find(l => l.id === 'rookery'), L = lv.build();
const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8').split('\r').join('');
const main = src('src/main.js');

// ---- THE ROAD ----
ok(lv.needs === 'moor' && LEVELS.find(l => l.id === 'skyroad').needs === 'rookery', 'Gale Moor > THE ROOKERY > the Sky Road (the Roc)');
ok(LEVELS.indexOf(lv) === LEVELS.length - 1 || LEVELS.slice(LEVELS.indexOf(lv) + 1).every(l => l.id !== 'skyroad'), 'APPENDED (saves count levels by index): nothing before it moved');
ok(/\{ id: 'rookery', kind: 'level', level: LEVELS\.findIndex/.test(main) && /\[191,90\], \[229,115\], \[268,140\]/.test(main), 'a map node on the road between Gale Moor and the Sky Road');
ok(lv.rule === RK_RULE && /DIVE BREAKS WHAT IT HITS/.test(lv.rule), 'the rule line: ' + lv.rule);
ok(/GATE = \[[^\]]*'rookery'/.test(src('tools/level-quality.mjs')), 'gated by level-quality');
ok(L.rookery === true && L.W === ROOKERY.W, 'the level is src/rookery.js (L.rookery)');
ok(SECTIONS.every((s, i) => i === 0 || s[1] === SECTIONS[i - 1][2]) && SECTIONS[SECTIONS.length - 1][2] === L.W && SECTIONS.length === 5, 'five named areas tile the level: ' + SECTIONS.map(s => s[0]).join(', '));
ok(/RKH\.drawSky/.test(main), 'THE MONASTERY ROOF and THE ROC\'S PEAK are drawn on the sky (RKH.drawSky)');
/* THE OLD SAVES: the gate rule over a fake PROG (the levelLocked clause and the migration, lifted out of main.js) */
{ const mig = /if \(!PROG\.rookeryRoadMig\) \{[^\n]*\}/.exec(main), lock = /\(lv\.needs && !\(PROG\[lv\.needs\] && PROG\[lv\.needs\]\.cleared\)[^\n]*?&& !q\.get\('unlock'\)\)/.exec(main);
  ok(mig && lock && /lv\.id === 'skyroad' && PROG\.skyOpen/.test(lock[0]), 'the migration and the gate clause are in src/main.js');
  if (mig && lock) { const run = PROG => { new Function('PROG', mig[0])(PROG); const q = { get: () => null }; const locked = lv2 => new Function('lv', 'PROG', 'q', 'return !!' + lock[0])(lv2, PROG, q);
      return { sky: locked(LEVELS.find(l => l.id === 'skyroad')), rk: locked(lv) }; };
    const pastRoc = run({ moor: { cleared: true }, skyroad: { cleared: true } }), atMoor = run({ moor: { cleared: true } }), fresh = run({ rookeryRoadMig: 1, moor: { cleared: true } }), done = run({ rookeryRoadMig: 1, moor: { cleared: true }, rookery: { cleared: true } });
    ok(!pastRoc.sky && !pastRoc.rk, 'an old save already PAST THE ROC: the Sky Road stays open and THE ROOKERY is UNLOCKED as an extra (not a requirement) ' + JSON.stringify(pastRoc));
    ok(!atMoor.sky && !atMoor.rk, 'an old save with Gale Moor cleared (the Sky Road was open): it stays open (grandfathered once), the rookery open ' + JSON.stringify(atMoor));
    ok(fresh.sky && !fresh.rk, 'a save made on the new road: the rookery is open and the Sky Road waits for it ' + JSON.stringify(fresh));
    ok(!done.sky, 'the rookery cleared: the Sky Road opens'); } }

// ---- THE ROUTE ----
const at = (e, r) => r.near(e.x, e.y) || r.jumpNear(e.x, e.y);
const full = floodReach(L, T);
{ const miss = L.ents.filter(e => ['check', 'silver', 'shrieksisters'].includes(e.t) && !at(e, full)).map(e => e.t + '@' + e.x + ',' + e.y); ok(!miss.length, 'the fill reaches every shrine, silver and the sisters ' + miss.join(' ')); }
const checks = L.ents.filter(e => e.t === 'check').sort((a, b) => a.x - b.x), boss = L.ents.find(e => e.t === 'shrieksisters');
ok(checks.length === 4 && SECTIONS.slice(0, 4).every(s => checks.some(c => c.x > s[2] - 10 && c.x <= s[2])), 'a shrine closes each area (A10c): ' + checks.map(c => c.x).join(' '));
const noCrack = id => floodReach({ ...L, hoists: L.hoists.filter(h => h.id !== id) }, T);
const nextAfter = h => checks.find(c => c.x > h.cleat[0]) || boss;
const REQUIRED = ['firstFloor', 'roostSlab', 'firstNest', 'firstPillar', 'eggNest', 'ledgeSlab', 'spanPillar', 'hungNest', 'lastNest'];   /* (claude/rookery2: the top slab is THE LAST RIDE now; the hung nest is broken by a ride) */
for (const id of REQUIRED) { const h = L.hoists.find(q => q.id === id); const n = nextAfter(h); ok(h && !at(n, noCrack(id)), 'REQUIRED: ' + id + ' (' + h.load + ') is a LOCK - without it ' + n.t + '@' + n.x + ' is out of reach'); }
for (const h of L.hoists.filter(q => !REQUIRED.includes(q.id))) ok(at(boss, noCrack(h.id)), 'the ' + h.load + ' crack ' + h.id + ' is optional (a pocket), not a lock');
{ const kinds = new Set(L.hoists.map(h => h.load)); ok(kinds.size === 4 && L.hoists.length >= 9, 'A HARPY\'S DIVE BREAKS WHAT IT HITS, four ways (' + [...kinds].join(', ') + '), ' + L.hoists.length + ' cracked rocks'); }
for (const h of L.hoists) { const foot = L.grid[(h.cleat[1] + 1) * L.W + h.cleat[0]];
  ok(L.grid[h.cleat[1] * L.W + h.cleat[0]] === T.AIR && [T.SOLID, T.ONEWAY].includes(foot), h.id + ': its mark stands on footing at ' + h.cleat + (h.roost ? ', its roost at ' + h.roost : ', no roost (a shrieker\'s call or a stray dive)'));
  const cells = crackCells(h, (x, y) => L.grid[y * L.W + x] === T.SOLID);
  if (h.load === 'drop') ok(cells.length && cells.every(([x, y]) => L.grid[y * L.W + x] === T.SOLID) && L.grid[(h.clear[3] + 1) * L.W + h.cleat[0]] === T.AIR, h.id + ': the floor it breaks is rock over the way below (' + cells.length + ' cells)');
  else ok(cells.length && cells.every(([x, y]) => L.grid[y * L.W + x] === T.AIR), h.id + ': what it lays lands in open air (' + cells.length + ' cells)');
  if (h.roost) ok(L.ents.some(e => e.t === 'harpy' && e.rk && e.rk.rkRoost === h.id), h.id + ': its roost\'s harpy is placed (bound to it)'); }
{ const sh = L.ents.filter(e => e.t === 'shrieker'); ok(sh.length >= 3 && sh.every(e => e.x > ARCS.shrieker.teach[0] - 10), 'THE HARPY SHRIEKER (the one new foe): ' + sh.length + ' placed, taught at ' + ARCS.shrieker.teach[0] + ' then developed, remixed, examined'); }
/* (claude/rookery2) CATCH A RIDE: the way to reach places - taught safe (the gully floor under it), tested (a chasm), remixed (through a hung nest's arm, a gale on the rider),
   examined (the last face, a shrieker calling and a gale beating); every one a LOCK; every mount and land on footing; her harpy placed, bound to her ride */
const RIDES = { firstRide: 'teach', gapRide: 'test', nestRide: 'remix', lastRide: 'exam', relayRide: 'the relay, across', doorRide: 'the relay, up' };   /* (claude/rookery3: THE RELAY, two rides back to back) */
ok((L.rkRides || []).length >= 4 && Object.keys(RIDES).every(id => L.rkRides.some(d => d.id === id)), 'CATCH A RIDE: ' + (L.rkRides || []).map(d => d.id + ' (' + RIDES[d.id] + ')').join(', '));
const noRide = id => floodReach({ ...L, rkRides: L.rkRides.filter(d => d.id !== id) }, T);
for (const d of L.rkRides || []) { const n = checks.find(c => c.x > d.mount[0]) || boss; ok(!at(n, noRide(d.id)), 'REQUIRED RIDE: ' + d.id + ' is a LOCK - without it ' + n.t + '@' + n.x + ' is out of reach');
  const foot = (x, y) => [T.SOLID, T.ONEWAY].includes(L.grid[(y + 1) * L.W + x]) && L.grid[y * L.W + x] === T.AIR;
  ok(foot(d.mount[0], d.mount[1]), d.id + ': its mount stands on footing at ' + d.mount);
  const sp = (L.hoists || []).find(h => h.id === d.breaks), landFoot = foot(d.land[0], d.land[1]) || (sp && sp.span && d.land[1] === sp.span[2] - 1 && d.land[0] >= sp.span[0] && d.land[0] <= sp.span[1]);
  ok(landFoot, d.id + ': she shakes you off over footing at ' + d.land + (sp ? ' (the nest her flight breaks drops under it)' : ''));
  ok(L.ents.some(e => e.t === 'harpy' && e.rk && e.rk.rkRide === d.id), d.id + ': her harpy is placed at her roost, bound to her ride'); }
ok(!at(boss, floodReach(L, T, { noAssist: true })), 'legs alone (the plain fill) do not reach the summit: the rides are the way');
{ const g = L.ents.filter(e => e.t === 'galeharpy'); ok(g.length >= 3, 'THE GALE HARPY (the level\'s one new foe, src/gale-harpy.js): ' + g.length + ' placed (taught on the narrow ledge, at the hung nest, at the last ride)'); }
/* (claude/rookery3) THE BONE STAIR GOES ON (Daniel 10-29: "a little bit longer ... a little bit more platforming"): THE GALE SPIRES (a descent spire to spire, a gale harpy beating you back), THE NEST
   FACE (two stepped faces on lashed shelves, a gale on the top), THE RELAY (two rides). The spires are the only way down to the face; a fall to the gorge floor is a climb back */
{ const SP = [[367, 368], [370, 371], [374, 375], [377, 378], [381, 382], [384, 385], [388, 389], [391, 392]], rr = y => y + 6, basin = [395, rr(22)], door = [432, rr(4)];
  ok(SP.every(([a, b]) => [a, b].every(x => L.grid[rr(5) * L.W + x] === T.AIR) && L.grid[(L.H - 1) * L.W + a] === T.SOLID), 'THE GALE SPIRES: eight spires two wide, each standing on the gorge floor (nothing floats)');
  const g = Uint8Array.from(L.grid); for (const [a, b] of SP) for (let x = a; x <= b; x++) for (let y = 0; y < rr(28); y++) g[y * L.W + x] = T.AIR;
  ok(!at({ x: basin[0], y: basin[1] }, floodReach({ ...L, grid: g }, T)), 'the spires are the way down to THE NEST FACE (without them its basin is out of reach)');
  const fl = floodReach(L, T, { seeds: [[400, rr(29)]] }); ok(at({ x: 360, y: rr(4) }, fl) && at({ x: door[0], y: door[1] }, fl), 'A FALL IS A CLIMB: from the gorge floor the boards up the face of the lip lead back to the spires (no pit, no softlock)');
  ok(['galeSpires', 'nestFace'].every(q => L.ents.some(e => e.t === 'galeharpy' && e.squad === q)), 'a gale harpy holds the spires and another the nest face (her gust beats you back toward the drop)');
  const W0 = 416; ok(L.W - W0 === 72 && L.arena.x0 === (370 + 72) * TS, 'the stair is 72 columns longer (' + W0 + ' -> ' + L.W + '); the summit door, its shrine and the arena moved with it'); }
ok(L.ents.filter(e => e.t === 'vent' && e.wind).length >= 2, 'A14: the updraft chimneys (' + L.ents.filter(e => e.t === 'vent').length + ' timed updrafts) and the wind gap');
ok(Object.values(RK_SAY).every(s => SAY_LINES.has(s)), 'every capital line the rule says is in src/hint-lines.js');

// ---- THE HANDS IN A FAKE WORLD ----
{ const grid = Uint8Array.from(L.grid), solid = (x, y) => grid[y * L.W + x] === T.SOLID, said = [], foes = [];
  const P = { x: 0, y: 0, ground: true, dead: false, hp: 100 };
  const dmg = []; let spawned = 0;
  const W = { TS, T, L, sfx: {}, players: () => [P], enemies: () => foes, time: () => 0, number: (x, y, t) => said.push(t), burst() {}, dust() {}, shake() {}, seen() {},
    asPlayer: (p, fn) => fn(), damage: (x, d) => { dmg.push(d); return 'hit'; }, cellSet: (x, y, t) => { grid[y * L.W + x] = t; }, solidAt: solid, tileAt: (x, y) => grid[y * L.W + x], text() {},
    spawn: (t, x, y) => { spawned++; const e = { t, x: x * TS + 8, y: (y + 1) * TS, hx: x * TS + 8, hy: (y + 1) * TS, alive: true, mode: 'hover', anim: 0, stagger: 0 }; foes.push(e); return e; } };
  W.L = L; const H = makeRookeryHands(W);
  for (const e of L.ents) if (e.t === 'harpy' || e.t === 'shrieker') foes.push({ t: e.t, x: e.x * TS + 8, y: (e.y + 1) * TS, hx: e.x * TS + 8, hy: (e.y + 1) * TS, alive: true, mode: 'hover', anim: 0, stagger: 0, ...(e.rk || {}), ...(e.t === 'shrieker' ? { rkShriek: true } : {}) });
  H.reset();
  const step = (s, f) => { for (let i = 0; i < Math.round(s * 60); i++) { H.update(1 / 60); for (const e of foes) if (e.alive) { if (!H.harpy(e, 1 / 60) && e.mode === 'downed') { e.modeT -= 1 / 60; if (e.modeT <= 0) { e.mode = e.rkRide ? 'rise' : 'hover'; e.stagger = 0; e.x = e.hx; e.y = e.hy; } } if (e.stagger > 0) e.stagger -= 1 / 60; } if (f) f(i); } };
  const stand = d => { P.x = markX(d, TS); P.y = markY(d, TS); P.ground = true; };
  /* 1. THE FIRST CRACK (a floor): stand on the mark, scream + aim, step off, her dive breaks the floor and she lies stunned */
  const d1 = L.hoists.find(h => h.id === 'firstFloor'); stand(d1); step(0.1);
  const her = foes.find(e => e.rkRoost === 'firstFloor'); ok(her && her.rkAim && said.includes(RK_SAY.scream), 'a hero on the mark: her harpy SCREAMS and aims at the mark (a red line)');
  P.x -= 40; step(K.aim + 0.8);
  ok(H.read().cracks.find(c => c.id === 'firstFloor').state === 'broken' && crackCells(d1).every(([x, y]) => grid[y * L.W + x] === T.AIR), 'off the mark: her dive BREAKS THE FLOOR - the hole opens onto the way below');
  ok(her.mode === 'downed' && said.includes(RK_SAY.stunned), 'she lies STUNNED IN THE RUBBLE (plunge her there)');
  ok(!dmg.length, 'stepped off the mark in her aim: her dive missed the hero');
  /* 2. a slab: stand and TAKE it - the slab still slides down as steps, and the dive hurt */
  const d2 = L.hoists.find(h => h.id === 'roostSlab'); stand(d2); step(K.aim + 1.4);
  ok(H.read().cracks.find(c => c.id === 'roostSlab').state === 'broken' && crackCells(d2).every(([x, y]) => grid[y * L.W + x] === T.SOLID), 'the slab slides down the cliff as steps (laid solid)');
  ok(dmg.length >= 1, 'stood on the mark through it: the dive hits (' + dmg.join(',') + ')');
  /* 3. a nest whose harpy is cut down IN her dive: she still comes down on it */
  const d3 = L.hoists.find(h => h.id === 'firstNest'), h3 = foes.find(e => e.rkRoost === 'firstNest'); stand(d3); step(K.aim + 0.05); P.x -= 40; step(0.08); h3.alive = false; step(1.2);
  ok(H.read().cracks.find(c => c.id === 'firstNest').state === 'broken' && crackCells(d3).every(([x, y]) => grid[y * L.W + x] === T.ONEWAY), 'a harpy cut down in her dive still breaks it: the nest drops as a platform');
  /* 4. a dead roost sends another */
  const d4 = L.hoists.find(h => h.id === 'firstPillar'), h4 = foes.find(e => e.rkRoost === 'firstPillar'); h4.alive = false; const s0 = spawned; stand(d4); P.x -= 60; step(K.respawn + 0.3);
  ok(spawned > s0 && said.includes(RK_SAY.roost), 'its harpy dead: THE ROOST SENDS ANOTHER (' + K.respawn + ' s)');
  stand(d4); step(K.aim + 0.1); P.x -= 40; step(1.4);
  ok(H.read().cracks.find(c => c.id === 'firstPillar').state === 'broken' && crackCells(d4).every(([x, y]) => grid[y * L.W + x] === T.ONEWAY), 'the new harpy\'s dive: the pillar falls across (a bridge)');
  /* 5. THE SHRIEKER: she screams, marks the hero's spot, every harpy near dives at the mark */
  const sh = foes.find(e => e.t === 'shrieker'); for (const e of foes) if (e !== sh && Math.abs(e.x - sh.x) > 30 * TS) e.alive = false;
  sh.rkCd = 0; P.x = sh.x + 30; P.y = L.H * TS; { for (let y = Math.floor(sh.y / TS) + 1; y < L.H; y++) if (solid(Math.floor(P.x / TS), y)) { P.y = y * TS; break; } } P.ground = true;
  const n0 = H.read().n.called; step(K.shriek.tell + 0.1);
  ok(H.read().n.screams >= 1 && said.includes(RK_SAY.marked) && H.read().marks >= 1, 'THE SHRIEKER screams and MARKS the hero\'s spot (a red ring)');
  ok(H.read().n.called > n0 && foes.some(e => e.alive && e.rkAim && e.t === 'harpy'), 'every harpy near dives AT THE MARK (' + (H.read().n.called - n0) + ' called)');
  ok(foes.filter(e => e.rkAim).every(e => Math.abs(e.rkAim.tx - P.x) < 1), 'they aim at the MARK, not at the hero (off it, they hit the rock)');
  /* 6. (claude/rookery2) CATCH A RIDE: on her mount she dives; stepped off, she hits the rock and lies a beat; she LIFTS - grab her - she carries the hero along her path and shakes
     him off over the land; JUMP lets go mid-ride */
  for (const e of foes) if (!e.rkRide) e.alive = false; for (const e of foes) if (e.rkAim) e.rkAim = null;
  const rd = L.rkRides.find(d => d.id === 'firstRide'), rh = foes.find(e => e.rkRide === 'firstRide'); Object.assign(rh, { alive: true, mode: 'hover', x: rh.hx, y: rh.hy, rkAim: null, rkDive: null }); H.reset(); rh.rdCd = 0;
  P.x = rd.mount[0] * TS + 8; P.y = (rd.mount[1] + 1) * TS; P.ground = true; P.dead = false; P.hp = 100; step(0.1);
  ok(rh.rkAim && said.includes(RK_SAY.ride), 'a hero on her MOUNT: she aims her dive at him (BLOCK HER DIVE, THEN GRAB HER TALONS)');
  P.x -= 30; let lifted = false; step(3, () => { if (rh.mode === 'lift') lifted = true; return false; }); ok(lifted || rh.mode === 'lift', 'stepped off: she hits the rock, lies a beat, then LIFTS (UP: GRAB)');
  rh.mode = 'lift'; rh.modeT = 1; rh.x = P.x + 8; rh.y = P.y - 30; const got = H.tryGrab(P);
  ok(got && P.rkRide === rh && rh.mode === 'ride', 'UP near her as she lifts: he has her talons (she carries him)');
  let ticks = 0; step(4, () => { ticks++; if (P.rkRide) H.ride(P, false); return false; });
  ok(!P.rkRide && Math.abs(P.x - (rd.land[0] * TS + 8)) < 10 && P.y < (rd.land[1] + 1) * TS, 'she flies her path and SHAKES HIM OFF over the land (' + Math.round(P.x / TS) + ',' + Math.round(P.y / TS) + ')');
  rh.mode = 'lift'; rh.modeT = 1; rh.x = P.x; rh.y = P.y - 30; H.tryGrab(P); step(0.3, () => { if (P.rkRide) H.ride(P, false); }); const ok1 = H.ride(P, true);
  ok(!ok1 && !P.rkRide && P.vy < 0, 'JUMP lets go mid-ride (normal air control: a hop)');
  ok(H.read().n.rides >= 2 && H.read().n.shook >= 1 && H.read().n.letGo >= 1, 'the ride counters: ' + JSON.stringify({ rides: H.read().n.rides, shook: H.read().n.shook, letGo: H.read().n.letGo }));
}

// ---- THE SHRIEK SISTERS (pure) ----
{ const A = L.arena; ok(A && A.boss === 'shrieksisters' && (A.slabs || []).length === 3, 'THE SISTERS\' CRAG: the arena, three cracked slabs in its floor');
  const said = [], hits = []; let shook = 0;
  const w = { number: (x, y, t) => said.push(t), sound() {}, shake: () => shook++, music() {}, mark() {}, dust() {}, fx() {}, rubble() {},
    hit: (s, bx, d, name) => { if (hero.x > bx[0] && hero.x < bx[1] && hero.y > bx[2] && hero.y - 20 < bx[3]) { hits.push(name); return hero.block ? 'blocked' : 'hit'; } return null; },
    hitArea: (bx, d, name) => { if (hero.x > bx[0] && hero.x < bx[1]) hits.push(name); }, hitHero: (h, d, name) => hits.push(name) };
  const hero = { x: 0, y: A.floor, ground: true, alive: true, block: false };
  const S = SSM.newFight(SSM.geom(A, TS)); for (const r of SSM.ROLES) { S.sis[r].mode = 'hover'; S.sis[r].cd = 99; }
  const step = (s, f) => { for (let i = 0; i < Math.round(s * 60); i++) { SSM.stepSisters(S, 1 / 60, [hero], w); if (f && f(i)) return true; } return false; };
  /* THE OPENING: on a slab, the diver aims (the line follows, then LOCKS), step off, she breaks the slab and lies STUNNED */
  const sl = S.G.slabs[1]; hero.x = sl.x; const dv = S.sis.diver; dv.cd = 0; S.sis.shrieker.cd = 99; S.sis.snatcher.mode = 'fly';
  step(0.05); ok(dv.mode === 'diveTell' && !dv.aim.lock, 'the diver aims: her red line follows the hero');
  step(SSM.SS.dive.tell[0] - SSM.SS.dive.lock + 0.02); ok(dv.aim.lock && Math.abs(dv.aim.x - sl.x) < 2, 'the line LOCKS (' + SSM.SS.dive.lock + ' s before she drops) on the spot');
  hero.x = sl.x + 60; step(1.2, () => dv.mode === 'stuck');
  ok(dv.mode === 'stuck' && sl.st === 'rubble' && said.includes(SSM.SS_SAY.stunned), 'stepped off: her dive breaks the slab and she lies STUNNED IN THE RUBBLE');
  ok(!hits.includes('dive'), 'the dive missed the hero who stepped off');
  { const [d1] = SSM.takeBlow(dv, 20, false); ok(d1 === 40, 'stunned: a cut lands x2 (20 -> ' + d1 + ')'); }
  { let total = 40, n = 0; while (dv.purse > 0 && n < 99) { total += SSM.takeBlow(dv, 20, false)[0]; n++; } ok(dv.mode === 'stuck' && dv.modeT <= 0.02 && total <= Math.ceil(dv.maxHp * SSM.SS.stun.cap) + 1, 'the stun pays at most ' + SSM.SS.stun.cap + ' of her (' + total + ' of ' + dv.maxHp + '), then she tears free'); }
  step(0.6); ok(dv.ward > 0 && SSM.takeBlow(dv, 20, false)[1] === 'WARDED' && SSM.takeBlow(dv, 20, false)[0] === 8, 'she tears free behind a told WARD (B3): 0.4x, WARDED');
  /* off a crack her dive skids; on the shield she is knocked down */
  dv.ward = 0; dv.mode = 'hover'; dv.cd = 0; S.tLast = -99; hero.x = S.G.x0 + 40; step(SSM.SS.dive.tell[0] + 0.05); hero.x += 70; step(1.0, () => dv.mode === 'land');
  ok(dv.mode === 'land' && S.n.skids >= 1, 'off any crack her dive SKIDS (no opening) - she lands low: whole (' + SSM.takeBlow(dv, 20, false)[0] + ')');
  dv.mode = 'hover'; dv.cd = 0; dv.ward = 0; dv.nAtk = 0; S.tLast = -99; hero.x = S.G.x0 + 40; hero.block = true; step(SSM.SS.dive.tell[0] + 0.6 + SSM.SS.tempo.hold + SSM.SS.rock.spent, () => dv.mode === 'downed');   /* (claude/rookery3: she may wait out the snatcher's drop - the stagger) */ hero.block = false;
  ok(dv.mode === 'downed' && SSM.takeBlow(dv, 20, false)[0] === 30, 'her dive taken on the shield: KNOCKED DOWN, x' + SSM.SS.downK);
  /* B15: NEVER INVULNERABLE - every mode of every sister takes at least 0.4x */
  { const low = []; for (const r of SSM.ROLES) for (const m of Object.keys(POSE_SS)) { const s = { ...S.sis[r], mode: m, ward: 0 }; const [d] = SSM.takeBlow(s, 20, false); if (d < 8) low.push(r + ':' + m + '=' + d); }
    ok(!low.length, 'B15: no sister is ever invulnerable - every mode takes >= 0.4x ' + low.join(' ')); }
  ok(SSM.takeBlow({ ...S.sis.shrieker, mode: 'hover', ward: 0 }, 20, false).join() === '8,ON THE WING' && SSM.takeBlow({ ...S.sis.shrieker, mode: 'swoop', ward: 0 }, 20, false)[0] === 20 && SSM.takeBlow({ ...S.sis.snatcher, mode: 'pick', ward: 0 }, 20, false)[0] === 20, 'ON THE WING 0.4x (told); low - the swoop, the pick on the shelf - whole');
  /* THE SCREAM: the mark, and the diver strikes it */
  for (const r of SSM.ROLES) { const s = S.sis[r]; s.mode = 'hover'; s.ward = 0; s.cd = 99; } S.tLast = -99; hero.x = S.G.slabs[0].x; const sh = S.sis.shrieker; sh.cd = 0; step(SSM.SS.scream.tell + 0.05);
  ok(S.marks.length >= 1 && dv.mode === 'diveTell' && dv.aim.mark && Math.abs(dv.aim.x - hero.x) < 2 && sh.mode === 'swoop', 'THE SHRIEKER screams: the MARK snaps onto the hero\'s spot, the diver aims AT THE MARK, the shrieker swoops low');
  hero.x += 70; step(1.2, () => dv.mode === 'stuck'); ok(dv.mode === 'stuck' && S.n.marksStruck >= 1, 'off the mark on a crack: the marked dive breaks it - stunned');
  /* THE SNATCHER: pick, carry, the red ring, the rock lies as a CRACKED STONE */
  for (const r of SSM.ROLES) { const s = S.sis[r]; s.mode = 'hover'; s.cd = 99; } const sn = S.sis.snatcher; sn.mode = 'fly'; sn.perchI = 0; hero.x = S.G.mid + 100; const st0 = S.stones.length;
  const d0 = S.n.drops; step(14, () => S.n.drops > d0 && !S.rocks.length);   /* (claude/rookery3: she may hold it a beat for the stagger) */ ok(S.n.drops >= 1 && (S.stones.length > st0 || !!SSM.crackAt(S, hero.x)), 'THE SNATCHER picks a rock on her shelf, carries it over the hero, tells the red ring and drops it: it lies CRACKED (a new bait spot)');
  /* TAKE ONE OUT AND THE OTHERS CHANGE */
  const S2 = SSM.newFight(SSM.geom(A, TS)); for (const r of SSM.ROLES) { S2.sis[r].mode = 'hover'; S2.sis[r].cd = 99; }
  S2.sis.diver.alive = false; SSM.fell(S2, 'diver', w); ok(said.includes(SSM.SS_SAY.diverFell) && S2.ph === 2, 'the DIVER falls: her sisters dive in her place (phase two)');
  { const s = S2.sis.shrieker; s.cd = 0; hero.x = S2.G.slabs[2].x; let dived = false; for (let i = 0; i < 120 && !dived; i++) { SSM.stepSisters(S2, 1 / 60, [hero], w); dived = s.mode === 'diveTell'; } ok(dived && s.aim.mark, 'the diver gone: the shrieker dives at her own mark (the opening never goes)'); }
  { let snatched = false; for (let i = 0; i < 600 && !snatched; i++) { SSM.stepSisters(S2, 1 / 60, [hero], w); snatched = S2.sis.snatcher.mode === 'snatchTell'; } ok(snatched, 'after the first fall the snatcher gains THE SNATCH (a low red !! sweep)'); }
  const S3 = SSM.newFight(SSM.geom(A, TS)); S3.sis.shrieker.alive = false; SSM.fell(S3, 'shrieker', w); ok(said.includes(SSM.SS_SAY.shriekerFell), 'the SHRIEKER falls: the diver\'s dives come in pairs, two rocks a carry');
  S3.sis.diver.alive = false; SSM.fell(S3, 'diver', w); ok(said.includes(SSM.SS_SAY.last) && S3.ph === 3, 'the LAST SISTER: frantic (cooldowns x' + SSM.SS.last + ')');
  /* ---- (claude/sisters2) EACH SISTER HER OWN SIGNATURE MOVES (Daniel 10-25 ~17:00): two each, each its own tell; the survivors use theirs more ---- */
  { const log = [], fresh = () => { const Z = SSM.newFight(SSM.geom(A, TS)); for (const r of SSM.ROLES) { Z.sis[r].mode = r === 'snatcher' ? 'fly' : 'hover'; Z.sis[r].cd = 99; } Z.grabCd = 99; Z.snatchCd = 99; return Z; };
    const me = { x: 0, y: A.floor, ground: true, alive: true, face: 1, block: false, roll: false, pp: {} };
    const W = { ...w, number: (x, y, t) => { said.push(t); log.push(t); },
      hit: (s, bx, d, name) => { if (me.x > bx[0] - 5 && me.x < bx[1] + 5 && me.y > bx[2] && me.y - 14 < bx[3]) { hits.push(name); return me.block ? 'blocked' : 'hit'; } return null; },
      hitArea: (bx, d, name) => { if (me.x > bx[0] && me.x < bx[1] && me.y > bx[2]) hits.push(name); },
      shove: (s, h, dir) => { log.push('shove' + dir); return me.roll ? false : me.block ? 'blocked' : 'hit'; },
      grab: (s, bx) => (!me.roll && me.x > bx[0] - 5 && me.x < bx[1] + 5 && me.y > bx[2] && me.y - 14 < bx[3]) ? me.pp : null, letGo: (s, pp, d) => log.push('letGo' + d) };
    const run = (Z, sec, f) => { for (let i = 0; i < Math.round(sec * 60); i++) { SSM.stepSisters(Z, 1 / 60, [me], W); if (f && f(i)) return true; } return false; };
    /* THE DIVER - CHAIN STOOP: she climbs (!!), then SS.chain.n dives back to back, each aimed + numbered; every one baited into cracked rock -> EXHAUSTED, the big opening */
    { const Z = fresh(), d = Z.sis.diver, sl = Z.G.slabs[0]; d.nAtk = SSM.SS.chain.every[0] - 1; d.cd = 0; me.x = sl.x; Z.stones.push({ x: sl.x + 70, t: 99 });
      const plan = [sl.x + 70, sl.x + 120]; let lk = 0, nums = []; run(Z, 0.05); ok(d.mode === 'chainTell' && d.chain && d.chain.n === SSM.SS.chain.n[0], 'CHAIN STOOP: the diver climbs and screams (a told !! windup) - ' + SSM.SS.chain.n[0] + ' dives to come');
      run(Z, 6, () => { if (d.mode === 'diveTell' && d.aim.lock && d.act !== lk) { lk = d.act; nums.push(d.aim.n + '/' + d.aim.of); me.x = plan.shift() ?? me.x; } return d.mode === 'stuck'; });
      ok(nums.join() === '1/2,2/2' && Z.n.chainDives === 2 && Z.n.bursts === 1, 'each dive of the chain is aimed, LOCKED and numbered on the floor (' + nums.join(' ') + '); the first into rock: she bursts out for the next');
      ok(d.mode === 'stuck' && d.big && Z.n.exhausted === 1 && Math.abs(d.modeT - SSM.SS.chain.stun) < 0.05 && log.includes(SSM.SS_SAY.exhausted), 'every dive baited into cracked rock: EXHAUSTED IN THE RUBBLE - the big opening (' + SSM.SS.chain.stun + ' s)');
      { let total = 0, n = 0; while (d.purse > 0 && n < 99) { total += SSM.takeBlow(d, 20, false)[0]; n++; } ok(total <= Math.ceil(d.maxHp * SSM.SS.chain.cap) + 1 && total > d.maxHp * SSM.SS.stun.cap, 'the big opening pays more than a stun (up to ' + SSM.SS.chain.cap + ' of her: ' + total + ') - still capped, then she tears free'); } }
    { const Z = fresh(), d = Z.sis.diver, sl = Z.G.slabs[1]; d.nAtk = SSM.SS.chain.every[0] - 1; d.cd = 0; me.x = sl.x; let lk = 0; Z.rnd = () => 0;
      run(Z, 6, () => { if (d.mode === 'diveTell' && d.aim.lock && d.act !== lk) { lk = d.act; me.x += 60; } return d.mode === 'land' && !d.chain; });
      ok(Z.n.bursts === 1 && Z.n.exhausted === 0 && d.mode === 'land' && !d.rakeNext && Math.abs(d.modeT - SSM.SS.chain.spent) < 0.05 && SSM.takeBlow({ ...d }, 20, false)[0] === 20, 'a chain with one dive into open floor: no opening - the last skids and she is SPENT on the floor (' + SSM.SS.chain.spent + ' s, whole: the heavy move\'s punish; no rake after a chain)'); }
    /* THE DIVER - TALON RAKE: jump it (it runs along the floor) or block it (she is knocked down, open) */
    { const Z = fresh(), d = Z.sis.diver; Z.rnd = () => 0; d.cd = 0; me.x = Z.G.mid - 100; me.block = false; hits.length = 0; let lk = 0;
      run(Z, 3, () => { if (d.mode === 'diveTell' && d.aim.lock && d.act !== lk) { lk = d.act; me.x += 70; } return d.mode === 'rake'; });
      ok(d.mode === 'rake' && Math.sign(me.x - d.x) === d.rDir, 'a missed dive: she skids, plants and RAKES along the floor at the hero (' + (d.rDir > 0 ? 'east' : 'west') + ')');
      me.y = A.floor - 40; run(Z, 0.7); me.y = A.floor; ok(!hits.includes('rake') && Z.n.rakes === 1, 'jumped: the rake runs under the hero');
      const Z2 = fresh(), d2 = Z2.sis.diver; Z2.rnd = () => 0; d2.cd = 0; me.x = Z2.G.mid - 100; lk = 0; run(Z2, 3, () => { if (d2.mode === 'diveTell' && d2.aim.lock && d2.act !== lk) { lk = d2.act; me.x += 70; } return d2.mode === 'rake'; });
      me.block = true; run(Z2, 0.7, () => d2.mode === 'downed'); me.block = false; ok(d2.mode === 'downed' && Z2.n.rakeDowns === 1 && SSM.sisOpen(d2), 'blocked on a shield: she is KNOCKED DOWN (open, x' + SSM.SS.downK + ')');
      const Z3 = fresh(); Z3.rnd = () => 0.99; Z3.sis.diver.cd = 0; me.x = Z3.G.mid; lk = 0; run(Z3, 3, () => { const q = Z3.sis.diver; if (q.mode === 'diveTell' && q.aim.lock && q.act !== lk) { lk = q.act; me.x += 70; } return q.mode === 'rise'; });
      ok(Z3.n.rakes === 0 && SSM.SS.rake.chance[0] < 1 && SSM.SS.rake.chance[1] === 1, 'with all three up she rakes on ' + SSM.SS.rake.chance[0] * 100 + '% of misses; once a sister falls, on every one'); }
    /* THE SHRIEKER - SHOCK SHRIEK: low on the middle side of you, the cone, the shove TOWARD THE NEAREST EDGE; braced on a shield, rolled through */
    { const Z = fresh(), s = Z.sis.shrieker; s.rot = SSM.ROT[0].indexOf('shock'); s.cd = 0; me.x = Z.G.x0 + 150; log.length = 0;
      run(Z, 0.1); ok(s.mode === 'shockTell' && s.shSide === 1, 'SHOCK SHRIEK: she comes down low on the middle side of the hero (a yellow !, her chest swelling)');
      run(Z, SSM.SS.shock.tell + 0.05); ok(log.includes('shove-1') && Z.n.shoved === 1 && Math.abs(s.x - me.x) <= SSM.SS.shock.gap + 8, 'the shriek SHOVES the hero west - toward the nearest edge of the summit');
      ok(SSM.takeBlow({ ...s, mode: 'shockTell', ward: 0 }, 20, false)[0] === 20, 'swelling low, she takes a blow whole (cut her as she swells)');
      const Z2 = fresh(); Z2.sis.shrieker.rot = SSM.ROT[0].indexOf('shock'); Z2.sis.shrieker.cd = 0; me.x = Z2.G.x1 - 150; me.block = true; log.length = 0; run(Z2, SSM.SS.shock.tell + 0.2); me.block = false;
      ok(log.includes('shove1') && Z2.n.braced === 1 && Z2.n.shoved === 0, 'east of the middle she shoves east; braced on a shield the shove does nothing'); }
    /* THE SHRIEKER - CRACKING ECHO: the tile AHEAD of the hero shivers (red !!), cracks (shards off it) and lies as cracked rock - a new bait spot */
    { const Z = fresh(), s = Z.sis.shrieker; s.rot = SSM.ROT[0].indexOf('echo'); s.cd = 0; me.x = Z.G.mid; me.face = 1; hits.length = 0;
      run(Z, 0.05); ok(s.mode === 'echoTell' && s.echoX > me.x && !SSM.crackAt(Z, s.echoX), 'CRACKING ECHO: she screams at the floor AHEAD of the hero (' + Math.round(s.echoX - me.x) + ' px on, never on a crack)');
      const ex = s.echoX; me.x = ex; run(Z, SSM.SS.echo.tell + 0.05); ok(hits.includes('echo') && Z.echoes.length === 1 && SSM.crackAt(Z, ex).kind === 'echo', 'the tile cracks: shards burst off it (the hero on it is hit) and it lies as CRACKED ROCK');
      const d = Z.sis.diver; d.cd = 0; d.mode = 'hover'; d.nAtk = 0; run(Z, 1.5, () => { if (d.mode === 'diveTell' && d.aim.lock && Math.abs(me.x - ex) < 4) me.x += 60; return d.mode === 'stuck'; });
      ok(d.mode === 'stuck' && Z.n.echoStruck === 1 && Z.echoes.every(q => q.t <= 0), 'a new bait spot: a dive baited onto the echo\'s crack breaks it and she lies STUNNED');
      const Z2 = fresh(); Z2.echoes.push({ x: Z2.G.mid, t: 0.1 }); run(Z2, 0.2); ok(!Z2.echoes.length, 'an echo\'s crack crumbles after ' + SSM.SS.echo.life + ' s'); }
    /* THE SNATCHER - BOULDER DROP: carried high, the shadow fixes (red !!), it falls from high and lies cracked */
    { const Z = fresh(), n = Z.sis.snatcher; n.perchI = 0; me.x = Z.G.mid; let hiY = 1e9, fixed = null; run(Z, 9, () => { if (n.mode === 'carry') hiY = Math.min(hiY, n.y); if (n.mode === 'dropTell' && fixed === null) fixed = n.dropX; return Z.rocks.length > 0; });
      ok(Z.G.floorY - hiY > SSM.SS.rock.high - 20 && fixed !== null && Math.abs(fixed - me.x) < 12 && Z.rocks[0].y0 < Z.G.floorY - 100, 'BOULDER DROP: she carries it HIGH (' + Math.round(Z.G.floorY - hiY) + ' px), its shadow follows the hero then FIXES, and it falls from up there'); }
    /* THE SNATCHER - THE GRAB: a told lunge at the hero's height; rolled through, nothing; caught, lifted over the floor; struck loose -> KNOCKED DOWN; too slow -> let fall */
    { const Z = fresh(), n = Z.sis.snatcher; Z.grabCd = 0; me.x = Z.G.mid; me.y = A.floor; me.roll = false; me.block = false;
      run(Z, 0.05); ok(n.mode === 'grabTell' && Z.n.grabs === 1, 'THE GRAB: she comes in from the side at the hero\'s height (a red !!, the talon line)');
      run(Z, 2, () => !!Z.held); ok(Z.held && n.mode === 'lift' && Z.n.grabbed === 1, 'not rolled or jumped: CAUGHT - she lifts the hero');
      const d = Z.sis.diver; d.cd = 0; run(Z, 0.4); ok(d.mode === 'hover', 'while she holds the hero her sisters hold their blows (one blow at a time)');
      run(Z, 0.5); const lip = SSM.SS.shock.edge + 30; ok(n.x >= Z.G.x0 + lip - 1 && n.x <= Z.G.x1 - lip + 1 && Z.G.floorY - n.y < 120, 'held over the summit floor, never over the lip (a drop is always onto the floor)');
      let r = null; for (let k = 0; k < 6 && r !== 'free'; k++) { r = SSM.strikeHeld(Z, W) || r; Z.clock += SSM.SS.grab.gap + 0.01; }
      ok(r === 'free' && !Z.held && n.mode === 'downed' && SSM.sisOpen(n) && Z.n.freed === 1, SSM.SS.grab.strikes + ' strikes: BROKE FREE - she falls KNOCKED DOWN (open, x' + SSM.SS.downK + ')');
      const Z2 = fresh(), n2 = Z2.sis.snatcher; Z2.grabCd = 0; me.x = Z2.G.mid; log.length = 0; run(Z2, 1.2, () => !!Z2.held); run(Z2, SSM.SS.grab.hold + 0.2);
      ok(!Z2.held && log.includes('letGo' + SSM.SS.grab.drop) && Z2.n.letGo === 1 && n2.mode === 'rise', 'not struck loose in ' + SSM.SS.grab.hold + ' s (the told bar): she lets the hero fall onto the floor (' + SSM.SS.grab.drop + ')');
      const Z3 = fresh(); Z3.grabCd = 0; me.x = Z3.G.mid; me.roll = true; run(Z3, 2); me.roll = false; ok(!Z3.held && Z3.n.grabbed === 0, 'rolled through: her talons close on nothing'); }
    /* THE SURVIVORS USE THEIR OWN MORE */
    { const cnt = (row, ks) => row.filter(m => ks.includes(m)).length / row.length;
      ok(SSM.SS.chain.n[1] > SSM.SS.chain.n[0] && SSM.SS.chain.every[1] < SSM.SS.chain.every[0] && SSM.SS.rake.chance[1] > SSM.SS.rake.chance[0] && SSM.SS.grab.cd[1] < SSM.SS.grab.cd[0] && cnt(SSM.ROT[1], ['shock', 'echo']) > cnt(SSM.ROT[0], ['shock', 'echo']) && SSM.SS.sig[1] < 1,
        'a sister falls: the survivors use their own more - chain ' + SSM.SS.chain.n.join('/') + ' dives every ' + SSM.SS.chain.every.join('/') + ', rake ' + SSM.SS.rake.chance.join('/') + ', grab cd ' + SSM.SS.grab.cd.join('/') + ', shock+echo ' + SSM.ROT.map(q => Math.round(cnt(q, ['shock', 'echo']) * 100) + '%').join('/')); }
    /* THE HANDS IN A FAKE WORLD: the shove's TEETER on the lip; the grab's hold (the hero hangs from her), a swing a strike, the let-go */
    { const pp = { x: 0, y: A.floor, ground: true, face: 1, hp: 200, dead: false, vx: 0, vy: 0, hurt: 0 }, bodies = [], dm = [];
      const ctx = { L, players: [pp], get boss() { return null; }, bossActive: true, TS, sfx: new Proxy({}, { get: () => () => {} }), hero: () => pp, time: () => 0, number: () => {}, text() {}, burst() {}, sparks() {}, shake() {}, ring() {}, dust() {}, hint() {}, hitstop() {},
        damagePlayer: (x, d, o) => { if (pp.rolling) return false; dm.push(o.name); pp.hp -= d; return 'hit'; }, asPlayer: (p, fn) => fn(), upright: () => true, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t,
        box: P => ({ l: P.x - 5, r: P.x + 5, t: P.y - 14, b: P.y }), addEnemy: b => bodies.push(b), killBoss() {}, strike: b => H.hit(b, 20, pp.x, false) };
      const H = makeShriekSistersHands(ctx), e = H.spawnBoss({ x: 0, y: 0, alive: true }); e.mode = 'wake'; H.update(e, 1 / 60); const Z = H.show();
      for (const r of SSM.ROLES) { Z.sis[r].mode = r === 'snatcher' ? 'fly' : 'hover'; Z.sis[r].cd = 99; } Z.grabCd = 99; Z.snatchCd = 99;
      const tick = (sec, f) => { for (let i = 0; i < Math.round(sec * 60); i++) { H.update(e, 1 / 60); if (pp.ssHeld) H.held(pp, f ? f(i) : false); else { pp.x += pp.vx / 60; if (pp.x < Z.G.x0 + 5) pp.x = Z.G.x0 + 5; pp.vx *= 0.97; } pp.hurt = Math.max(0, pp.hurt - 1 / 60); } };
      const sh = Z.sis.shrieker; sh.rot = SSM.ROT[0].indexOf('shock'); sh.cd = 0; pp.x = Z.G.x0 + 110; tick(SSM.SS.shock.tell + 0.8);
      ok(dm.includes('shock') && Z.n.teeters === 1 && pp.x < Z.G.x0 + SSM.SS.shock.edge, 'shoved onto the summit\'s crumbling lip: the hero TEETERS (a told stagger: ' + SSM.SS.shock.teeter + ' s)');
      sh.cd = 99; sh.mode = 'hover'; pp.x = Z.G.mid; pp.vx = 0; pp.ground = true; Z.grabCd = 0; const sn = Z.sis.snatcher; sn.mode = 'fly'; let swings = 0;
      tick(1.5, () => false); ok(pp.ssHeld && Z.held && Math.abs(pp.x - sn.x) < 1 && Math.abs(pp.y - sn.y - SSM.SS.grab.hang) < 1, 'caught: the hero HANGS from her talons (main.js hands him to H.held)');
      const hp0 = sn.hp; tick(1.0, i => { if (i % 15 === 0) { swings++; return true; } return false; });
      ok(!pp.ssHeld && !Z.held && sn.mode === 'downed' && sn.hp < hp0, 'his swings STRIKE her (' + (hp0 - sn.hp) + ' taken) and break her grip: he drops, she is KNOCKED DOWN'); }
  }
  /* every move told (a mark) with its own windup and release pose (B16) */
  const TELLS = ['diveTell', 'screamTell', 'dropTell', 'snatchTell', 'waveTell', 'chainTell', 'rakeTell', 'shockTell', 'echoTell', 'grabTell'], REL = { diveTell: 'dive', screamTell: 'scream', dropTell: 'drop', snatchTell: 'snatch', waveTell: 'wave', chainTell: 'dive', rakeTell: 'rake', shockTell: 'shock', echoTell: 'echo', grabTell: 'grab' };
  const marks = src('src/marks.js'); ok(TELLS.every(t => marks.includes("'shrieksister|" + t + "'")), TELLS.length + ' told moves, each a mark in src/marks.js (!! / !)');
  ok(TELLS.every(t => POSE_SS[t] && POSE_SS[REL[t]] && JSON.stringify(POSE_SS[t]) !== JSON.stringify(POSE_SS[REL[t]])), 'B16: each its own windup and release pose (' + TELLS.map(t => t + '/' + REL[t]).join(', ') + ')');
  ok(Object.values(SSM.SS_SAY).every(s => SAY_LINES.has(s)), 'every capital line the sisters say is in src/hint-lines.js');
  /* the bot's plan answers every tell (a sample frame each) */
  const why = m => SSM.ssPlan({ P: { x: hero.x, y: A.floor, vy: 0, face: 1, ground: true, atk: -1 }, S: m, reach: 22, t: 5, v2: true, mem: {}, rng: () => 0.9, shield: false, dodge: true }).why;
  { const S4 = SSM.newFight(SSM.geom(A, TS)); for (const r of SSM.ROLES) { S4.sis[r].mode = 'hover'; S4.sis[r].cd = 99; } hero.x = S4.G.slabs[0].x; S4.sis.diver.mode = 'diveTell'; S4.sis.diver.act = 7; S4.sis.diver.aim = { x: hero.x, lock: true }; const a = why(S4);
    S4.sis.diver.mode = 'stuck'; S4.sis.diver.x = hero.x + 30; const b = why(S4); ok(/step off/.test(a) && /strike her/.test(b), 'the bot reads the LOCK and steps off (' + a + '), then strikes her stunned (' + b + ')'); } }

// ---- (claude/rookery2) THE SISTERS: THE RIDE TO THE PERCH (P1), PHASE 2 (two dead: the survivor grows and takes their gifts - any order), THE SNATCH (pure) ----
{ const A = L.arena, said = [], pp = { id: 'hero' }, hero = { x: 0, y: A.floor, ground: true, alive: true, block: false, face: 1, pp };
  const w = { number: (x, y, t) => said.push(t), sound() {}, shake() {}, music() {}, mark() {}, dust() {}, fx() {}, rubble() {}, tip: () => { hero.tipped = 1; }, unride() {}, letGo() {},
    hit: (s, bx, d, name, o) => (hero.x > bx[0] && hero.x < bx[1] && hero.y > bx[2] && hero.y - 20 < bx[3]) ? (hero.block && o && o.blockable ? 'blocked' : 'hit') : null,
    hitArea() {}, hitHero() {}, shove: () => null, grab: (s, bx) => (hero.x > bx[0] && hero.x < bx[1]) ? pp : null };
  const mk = () => { const S = SSM.newFight(SSM.geom(A, TS)); for (const r of SSM.ROLES) { S.sis[r].mode = r === 'snatcher' ? 'fly' : 'hover'; S.sis[r].cd = 99; } S.grabCd = 99; S.snatchCd = 99; return S; };
  const step = (S, s, f) => { for (let i = 0; i < Math.round(s * 60); i++) { SSM.stepSisters(S, 1 / 60, [hero], w); if (f && f(i)) return true; } return false; };
  const S = mk(), P0 = S.G.perchS, shelfTop = (A.floor / TS) - 3;
  ok(P0 && (A.floor - P0.y) / TS >= 6 && shelfTop - P0.y / TS >= 4, 'THE SHRIEKER\'S PERCH: a nest ' + (A.floor - P0.y) / TS + ' rows over the summit, ' + (shelfTop - P0.y / TS) + ' over the shelves - out of any jump (a ride gets you there)');
  const sh = S.sis.shrieker; step(S, 1.5); ok(sh.mode === 'perched' && Math.abs(sh.y - (P0.y - 2)) < 4, 'between her moves the shrieker SITS ON HER PERCH (P1)');
  const dv = S.sis.diver; dv.x = S.G.mid - 40; dv.y = A.floor - 112; dv.cd = 0; dv.nAtk = 0; hero.x = S.G.slabs[0].x + 200 > S.G.x1 ? S.G.mid - 40 : S.G.mid - 40; hero.block = true;
  step(S, 2.5, () => dv.mode === 'downed'); hero.block = false; ok(dv.mode === 'downed', 'her dive taken on the shield: KNOCKED DOWN');
  step(S, 2.0, () => dv.mode === 'ferryWait'); ok(dv.mode === 'ferryWait' && said.includes(SSM.SS_SAY.ride), 'then she CLIMBS OFF THE ROCK slowly: UP: GRAB HER TALONS (' + SSM.SS.ride.window + ' s)');
  hero.x = dv.x; hero.y = dv.y + 20; const got = SSM.tryRide(S, hero); ok(got && dv.mode === 'ferry' && S.ride && S.ride.by === 'diver', 'grabbed: she FERRIES the hero up toward the shrieker\'s perch');
  step(S, 3, () => { if (S.ride) { hero.x = dv.x; hero.y = dv.y + SSM.SS.ride.hang; } return !!(S.ride && S.ride.done); });
  ok(S.ride && S.ride.done && Math.abs(hero.x - P0.x) < P0.w / 2 + 4 && Math.abs(hero.y - P0.y) < 12, 'the ride ends over her nest (' + Math.round(hero.x) + ',' + Math.round(hero.y) + ' vs ' + P0.x + ',' + P0.y + ')');
  S.ride = null; hero.y = P0.y; hero.ground = true; sh.mode = 'perched'; sh.ward = 0; step(S, 0.1);
  ok(sh.mode === 'startled' && SSM.sisOpen(sh) && SSM.takeBlow(sh, 20, false)[0] === 30 && said.includes(SSM.SS_SAY.cornered), 'landed beside her: the shrieker is CORNERED ON HER PERCH - OPEN, x' + SSM.SS.ride.mul + ' up to ' + SSM.SS.ride.cap + ' of her');
  step(S, SSM.SS.ride.tip); ok(hero.tipped && S.n.tips >= 1, 'stay on the nest and it TIPS you off (' + SSM.SS.ride.tip + ' s: no camping on the perch)');
  /* PHASE 2, every order of deaths: the survivor grows (no HP), uses her own moves and the dead sisters' (one at a time), and THE SNATCH drops you both when struck */
  for (const surv of SSM.ROLES) { const Z = mk(), q = Z.sis[surv], hp0 = q.maxHp; hero.x = Z.G.mid; hero.y = A.floor; hero.ground = true; hero.tipped = 0;
    for (const r of SSM.ROLES) if (r !== surv) { Z.sis[r].alive = false; Z.sis[r].hp = 0; SSM.fell(Z, r, w); }
    ok(Z.p2 === surv && q.mode === 'grow' && q.maxHp === hp0 && said.includes(SSM.SS_SAY.grow), surv + ' survives: PHASE 2 - she GROWS (' + SSM.SS.p2.scale + 'x, no HP added) and takes their gifts');
    q.cd = 0; const modes = new Set(); let two = 0; Z.grabCd = 99;
    step(Z, 40, () => { modes.add(q.mode); const tells = SSM.ROLES.filter(r => Z.sis[r].alive && /Tell$/.test(Z.sis[r].mode)).length; if (tells > 1) two++; if (!q.alive || hero.x < 0) return true; q.hp = hp0; return false; });
    const borrowed = { diver: ['shockTell', 'dropTell'], shrieker: ['diveTell', 'dropTell'], snatcher: ['diveTell', 'shockTell'] }[surv], own = { diver: ['diveTell'], shrieker: ['screamTell'], snatcher: ['dropTell'] }[surv];
    ok(borrowed.every(m => modes.has(m)) && own.every(m => modes.has(m)) && !two, surv + ' (P2): her own (' + own + ') and the dead sisters\' moves (' + borrowed.join(', ') + '), never two tells at once: ' + [...modes].filter(m => /Tell$/.test(m)).join(','));
    /* THE SNATCH: grabbed, two strikes in the air - you fall together, she lands STUNNED */
    for (const r of SSM.ROLES) Z.sis[r].ward = 0; q.mode = 'hover'; q.cd = 0; q.p2i = SSM.P2KIT[surv].indexOf('grab'); Z.grabCd = 0; Z.held = null; hero.x = Z.G.mid; hero.y = A.floor; hero.ground = true;
    step(Z, 4, () => !!Z.held); ok(Z.held && Z.held.p2 && Z.held.by === surv, surv + ' (P2): THE SNATCH seizes the hero (her red !! talon line first)');
    if (Z.held) { Z.clock += 1; SSM.strikeHeld(Z, w); Z.clock += 1; const r2 = SSM.strikeHeld(Z, w);
      ok(r2 === 'fall' && q.mode === 'stuck' && SSM.sisOpen(q) && q.purse > 0, surv + ' (P2): ' + SSM.SS.p2.strikes + ' strikes mid-carry - YOU FALL TOGETHER, she lands STUNNED (the big opening, ' + SSM.SS.p2.stun + ' s, up to ' + SSM.SS.p2.cap + ' of her)'); } }
}

// ---- (claude/rookery3) THE TEMPO: HEAVY / MEDIUM / LIGHT (Daniel 10-29 live: "they attack way too quickly and at the same speed"), and THE STAGGER ----
{ const A = L.arena, pp = { id: 'hero' }, hero = { x: 0, y: A.floor, ground: true, alive: true, block: false, face: 1, pp };
  const w = { number() {}, sound() {}, shake() {}, music() {}, mark() {}, dust() {}, fx() {}, rubble() {}, tip() {}, unride() {}, letGo() {}, tempo: (s, c) => { (w.seen[c] = w.seen[c] || []).push(s.role + ':' + s.mode); }, seen: {},
    hit: () => null, hitArea() {}, hitHero() {}, shove: () => null, grab: () => null };
  const T0 = SSM.TEMPO, ph0 = m => m === 'diveTell' ? SSM.SS.dive.tell[0] : m === 'chainTell' ? SSM.SS.chain.tell : m === 'screamTell' ? SSM.SS.scream.tell : m === 'dropTell' ? SSM.SS.rock.tell : m === 'shockTell' ? SSM.SS.shock.tell : m === 'grabTell' ? SSM.SS.grab.tell : m === 'waveTell' ? SSM.SS.wave.tell : m === 'rakeTell' ? SSM.SS.rake.tell : m === 'echoTell' ? SSM.SS.echo.tell : SSM.SS.snatch.tell;
  const BAND = { heavy: [1.0, 1.25], medium: [0.6, 0.76], light: [0.35, 0.45] }, off = Object.keys(T0).filter(m => { const t = ph0(m), [a, b] = BAND[T0[m]]; return t < a || t > b; });
  ok(!off.length && SSM.SS.dive.tell.every(t => t >= 0.6 && t <= 0.76) && SSM.SS.dive.second >= 0.35 && SSM.SS.dive.second <= 0.45, 'every told move has a TEMPO CLASS, its windup in band (heavy 1.0-1.25 / medium 0.6-0.76 / light 0.35-0.45 s): ' + Object.keys(T0).map(m => m.replace('Tell', '') + ' ' + T0[m][0].toUpperCase() + ' ' + ph0(m)).join(', ') + (off.length ? ' OFF: ' + off : ''));
  const own = { diver: ['chainTell', 'diveTell', 'rakeTell'], shrieker: ['screamTell', 'shockTell', 'echoTell'], snatcher: ['dropTell', 'grabTell', 'snatchTell'] };
  ok(Object.values(own).every(ms => new Set(ms.map(m => T0[m])).size === 3), 'each sister has one of each (heavy / medium / light): ' + Object.entries(own).map(([r, ms]) => r + ' ' + ms.map(m => m.replace('Tell', '') + '=' + T0[m][0].toUpperCase()).join('/')).join('; '));
  ok(SSM.SS.rock.dmg > SSM.SS.dive.dmg && SSM.SS.chain.dmg > SSM.SS.dive.dmg && SSM.SS.dive.dmg > SSM.SS.rake.dmg && SSM.SS.dive.dmg > SSM.SS.echo.dmg && SSM.SS.dive.dmg > SSM.SS.snatch.dmg && SSM.SS.dive.pairDmg < SSM.SS.dive.dmg, 'heavy hits hardest, light least (boulder ' + SSM.SS.rock.dmg + ', chain dive ' + SSM.SS.chain.dmg + ' > dive ' + SSM.SS.dive.dmg + ' > rake ' + SSM.SS.rake.dmg + ', snatch ' + SSM.SS.snatch.dmg + ', echo ' + SSM.SS.echo.dmg + ', pair ' + SSM.SS.dive.pairDmg + ')');
  ok(SSM.SS.rock.spent >= 0.8 && SSM.SS.chain.spent >= 0.8 && SSM.SS.scream.swoop >= 1.5 && SSM.takeBlow({ mode: 'spent', ward: 0 }, 20, false)[0] === 20, 'a heavy move leaves a long recovery, whole (the punish): the boulder SPENT ' + SSM.SS.rock.spent + ' s, the chain spent ' + SSM.SS.chain.spent + ' s, the scream\'s swoop ' + SSM.SS.scream.swoop + ' s');
  /* THE STAGGER over a long P1 fight with all three up: two windups may overlap but their blows land >= sep apart (a heavy move's own strikes aside), never two starts closer than the gap */
  const S = SSM.newFight(SSM.geom(A, TS)); for (const r of SSM.ROLES) { S.sis[r].mode = r === 'snatcher' ? 'fly' : 'hover'; S.sis[r].cd = 0.3 * (1 + SSM.ROLES.indexOf(r)); } S.grabCd = 4; S.snatchCd = 99; S.G.perchS = null;
  let rng = 7; S.rnd = () => { rng = (rng * 16807) % 2147483647; return rng / 2147483647; };
  let two = 0, gx = A.x0 + 60, minRel = 99; const pairs = new Set(), prev = {}, rel = [];
  for (let i = 0; i < 90 * 60; i++) { if (i % 90 === 0) gx = A.x0 + 30 + S.rnd() * (A.x1 - A.x0 - 60); hero.x += Math.sign(gx - hero.x) * Math.min(Math.abs(gx - hero.x), 1.5); SSM.stepSisters(S, 1 / 60, [hero], w);
    for (const r of SSM.ROLES) { const q = S.sis[r], was = prev[r]; if (was && was.tell && !SSM.sisTelling(q) && !was.combo) { for (const e of rel) if (e.r !== r && S.clock - e.t < SSM.SS.tempo.sep - 0.02) { two++; pairs.add(e.m + '@' + e.t.toFixed(2) + '+' + r + ':' + was.m + '@' + S.clock.toFixed(2) + ' ' + was.dbg); } minRel = Math.min(minRel, ...rel.filter(e => e.r !== r).map(e => S.clock - e.t)); rel.push({ r, t: S.clock, m: r + ':' + was.m }); }
      prev[r] = { dbg: q.mode + (q.tempoT||0).toFixed(2), tell: SSM.sisTelling(q), m: q.mode, combo: !!((q.aim && q.aim.mark) || q.chain || q.pair) }; } }
  const n = S.n.tempo; ok(n.heavy > 0 && n.medium > 0 && n.light > 0, 'in a 90 s fight all three tempos come (' + n.heavy + ' heavy, ' + n.medium + ' medium, ' + n.light + ' light)');
  ok(!two, 'THE STAGGER: two sisters\' blows never land within ' + SSM.SS.tempo.sep + ' s of each other (a heavy move\'s own strikes aside) - ' + (two ? two + ': ' + [...pairs].slice(0, 4).join(' ') : 'the closest ' + minRel.toFixed(2) + ' s apart over 90 s'));
  ok(S.n.minGap >= SSM.SS.tempo.gap.light - 0.02, 'two independent starts are never closer than ' + SSM.SS.tempo.gap.light + ' s (the closest: ' + S.n.minGap.toFixed(2) + ' s); after a heavy start ' + SSM.SS.tempo.gap.heavy + ' s, a medium ' + SSM.SS.tempo.gap.medium + ' s (' + S.n.held + ' moves held a beat)'); }

console.log(bad ? '\nrookery: ' + bad + ' FAILED' : '\nok  rookery: the road, the old-save rule, the locks, the hands, the sisters');
process.exit(bad ? 1 : 0);
