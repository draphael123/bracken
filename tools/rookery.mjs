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
const REQUIRED = ['firstFloor', 'roostSlab', 'firstNest', 'firstPillar', 'eggNest', 'ledgeSlab', 'spanPillar', 'lastNest', 'topSlab'];
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
  const step = (s, f) => { for (let i = 0; i < Math.round(s * 60); i++) { H.update(1 / 60); for (const e of foes) if (e.alive) { if (!H.harpy(e, 1 / 60) && e.mode === 'downed') { e.modeT -= 1 / 60; if (e.modeT <= 0) { e.mode = 'hover'; e.stagger = 0; e.x = e.hx; e.y = e.hy; } } if (e.stagger > 0) e.stagger -= 1 / 60; } if (f) f(i); } };
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
}

console.log(bad ? '\nrookery: ' + bad + ' FAILED' : '\nok  rookery: the road, the old-save rule, the locks, the hands');
process.exit(bad ? 1 : 0);
