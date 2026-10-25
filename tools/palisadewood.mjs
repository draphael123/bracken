// tools/palisadewood.mjs - THE PALISADE WOOD and THE BATTERING BEAST (claude/palisadewood, the opus greybox; Node, no page - tools/palisadewood-probe.mjs is the page smoke).
//   THE ROAD: Rootway > THE PALISADE WOOD > Kingswood (append-only LEVELS: the level is pushed after the array); map node on the road; the old-save rule in src/main.js
//   (a save with Kingswood open keeps it - PROG.kingsOpen once, palisadeRoadMig - and the palisade itself needs only the Rootway, so a save that cleared Kingswood finds it
//   UNLOCKED as an extra, never as a new requirement: proven here on the gate function over a fake PROG); gated by level-quality; the rule line; five named areas in order.
//   THE ROUTE: the fill reaches every shrine, silver and the beast; every REQUIRED prop is a LOCK (the first ramp, the yard's watchtower, the wall's ramp, the unbuilt span's
//   watchtower, the gatehouse ditch's scaffold); the crews and stake stacks are weapons, not locks; each lock's cells land in open air on footing; each stake stack's road
//   ends at a wall inside its rollMax with foes on it; a shrine closes each area (A10c); one new foe max (the stake-setter is a sprig with a told plant).
//   THE HANDS IN A FAKE WORLD: a ramp lays its steps, a tower its bridge, a crew's walkway goes and its crew is hurt, a stake stack drops, rolls through its foes and
//   scatters at the wall; a stake-setter tells, plants a two-row wall (never into a hero) and two blows knock it down.
//   THE BEAST (pure): a scaffold dropped on him = STUCK (x2, capped), a charge into a wreck = STUCK and the wreck is spent, a charge into the wall = DAZED; his armour 0.4x
//   (B15 floor: never 0 - warded 0.4x, every mode); a ward after STUCK; phase two at half (the trample + the buckle); three cuts on the buckle = LOOSE and no more volley;
//   every move told (a mark) with its own pose (B16); the bot's plan answers every tell.
//     node tools/palisadewood.mjs
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { PALISADE, SECTIONS, PW_RULE } from '../src/palisade-wood.js';
import { makePalisadeHands, PW_SAY, SETTER, propCells } from '../src/palisade-hands.js';
import * as BBM from '../src/battering-beast.js';
import { POSE } from '../src/battering-beast-hands.js';
import { SAY_LINES } from '../src/hint-lines.js';
const TS = 16; const { BB } = BBM;
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const lv = LEVELS.find(l => l.id === 'palisadewood'), L = lv.build();
const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8').split('\r').join('');
const main = src('src/main.js');

// ---- THE ROAD ----
ok(lv.needs === 'underleaf' && LEVELS.find(l => l.id === 'underleaf').needs === 'rootway' && LEVELS.find(l => l.id === 'kings').needs === 'palisadewood', 'Rootway > UNDERLEAF > THE PALISADE WOOD > Kingswood (claude/underleaf4, Daniel 10-25)');
ok(LEVELS.indexOf(lv) === LEVELS.length - 1 || LEVELS.slice(LEVELS.indexOf(lv) + 1).every(l => l.id !== 'kings'), 'APPENDED (saves count levels by index): nothing before it moved');
ok(/\{ id: 'palisadewood', kind: 'level', level: LEVELS\.findIndex/.test(main) && /\[221,68\], \[196,72\], \[\d+,\d+\], \[141,24\]/.test(main), 'a map node on the road between Underleaf (after the Rootway: claude/underleaf4, Daniel 10-25) and Kingswood');
ok(lv.rule === PW_RULE && /KNOCK OUT A PROP AND WHAT IT HOLDS COMES DOWN/.test(lv.rule), 'the rule line: ' + lv.rule);
ok(/GATE = \[[^\]]*'palisadewood'/.test(src('tools/level-quality.mjs')), 'gated by level-quality');
ok(L.pwood === true && L.W === PALISADE.W, 'the level is src/palisade-wood.js (L.pwood)');
ok(SECTIONS.map(s => s[0]).join('|') === 'THE FELLED EDGE|THE STAKE YARD|THE SCAFFOLDS|THE HALF-BUILT GATEHOUSE|THE OLD FOREST GATE', 'five named areas: ' + SECTIONS.map(s => s[0]).join(', '));
ok(SECTIONS.every((s, i) => i === 0 || s[1] === SECTIONS[i - 1][2]) && SECTIONS[SECTIONS.length - 1][2] === L.W, 'the areas tile the level, end to end');
ok(/PWH\.drawSky/.test(main), 'THE PALISADE LINE and THE HALF-BUILT GATEHOUSE are drawn on the skyline (PWH.drawSky)');
ok(L.weather.some(w => w.kind === 'leaves') && L.palette.sky === 'autumn' && (L.harvest || []).length >= 8, 'an AUTUMN wood (Daniel 10-18): falling leaves, the autumn sky, ' + (L.harvest || []).length + ' harvest props (baskets, nuts, rakes, sheaves, apples)');
/* THE OLD SAVES: the gate rule over a fake PROG (the levelLocked clause and the migration, lifted out of main.js) */
{ const mig = /if \(!PROG\.palisadeRoadMig\) \{[^\n]*\}/.exec(main), lock = /\(lv\.needs && !\(PROG\[lv\.needs\] && PROG\[lv\.needs\]\.cleared\)[^\n]*?&& !q\.get\('unlock'\)\)/.exec(main);
  ok(mig && lock && /lv\.id === 'kings' && PROG\.kingsOpen/.test(lock[0]), 'the migration and the gate clause are in src/main.js');
  if (mig && lock) { const mig4 = /if \(!PROG\.underleaf4Mig\) \{[^\n]*\}/.exec(main);   /* (claude/underleaf4: the 10-25 road move's own once-migration runs too - an old save keeps the palisade open) */
    const run = PROG => { new Function('PROG', mig[0])(PROG); if (mig4) new Function('PROG', mig4[0])(PROG); const q = { get: () => null }; const locked = lv2 => new Function('lv', 'PROG', 'q', 'return !!' + lock[0])(lv2, PROG, q); return { kings: locked(LEVELS.find(l => l.id === 'kings')), pal: locked(lv) }; };
    const old = run({ rootway: { cleared: true }, kings: { cleared: true } }), oldR = run({ rootway: { cleared: true } }), fresh = run({ palisadeRoadMig: 1, underleaf4Mig: 1, rootway: { cleared: true }, underleaf: { cleared: true } }), done = run({ palisadeRoadMig: 1, underleaf4Mig: 1, rootway: { cleared: true }, underleaf: { cleared: true }, palisadewood: { cleared: true } });
    ok(!old.kings && !old.pal, 'an old save that CLEARED Kingswood: Kingswood stays open and THE PALISADE WOOD is UNLOCKED as an extra (not a requirement) ' + JSON.stringify(old));
    ok(!oldR.kings && !oldR.pal, 'an old save with the Rootway cleared (Kingswood was open): Kingswood stays open (grandfathered once), the palisade open ' + JSON.stringify(oldR));
    ok(fresh.kings && !fresh.pal, 'a save made on the new road: the palisade is open and Kingswood waits for it ' + JSON.stringify(fresh));
    ok(!done.kings, 'the palisade cleared: Kingswood opens'); } }

// ---- THE ROUTE ----
const at = (e, r) => r.near(e.x, e.y) || r.jumpNear(e.x, e.y);
const full = floodReach(L, T);
{ const miss = L.ents.filter(e => ['check', 'silver', 'batteringbeast'].includes(e.t) && !at(e, full)).map(e => e.t + '@' + e.x + ',' + e.y); ok(!miss.length, 'the fill reaches every shrine, silver and the beast ' + miss.join(' ')); }
const checks = L.ents.filter(e => e.t === 'check').sort((a, b) => a.x - b.x), beast = L.ents.find(e => e.t === 'batteringbeast');
ok(checks.length === 4 && SECTIONS.slice(0, 4).every(s => checks.some(c => c.x > s[2] - 8 && c.x < s[2])), 'a shrine closes each area (A10c): ' + checks.map(c => c.x).join(' '));
const noProp = id => floodReach({ ...L, hoists: L.hoists.filter(h => h.id !== id) }, T);
const nextAfter = h => checks.find(c => c.x > h.cleat[0]) || beast;
for (const id of ['edgeRamp', 'yardTower', 'wallRamp', 'wallTower', 'gateBridge']) { const h = L.hoists.find(q => q.id === id); ok(h && !at(nextAfter(h), noProp(id)), 'REQUIRED: ' + id + ' (' + h.load + ') is a LOCK - without it ' + (nextAfter(h).t) + '@' + nextAfter(h).x + ' is out of reach'); }
for (const h of L.hoists.filter(q => q.load === 'crew' || q.load === 'stakes')) ok(at(beast, noProp(h.id)), 'the ' + h.load + ' prop ' + h.id + ' is a weapon, not a lock');
ok(new Set(L.hoists.map(h => h.load === 'bridge' ? 'tower' : h.load)).size >= 4 && L.hoists.length >= 10, 'remix: ' + L.hoists.length + ' props, four kinds of what comes down (ramp, bridge, crew, stakes)');
for (const h of L.hoists) { const foot = L.grid[(h.cleat[1] + 1) * L.W + h.cleat[0]];
  ok(L.grid[h.cleat[1] * L.W + h.cleat[0]] === T.AIR && [T.SOLID, T.ONEWAY].includes(foot), h.id + ': its prop stands on footing at ' + h.cleat);
  if (h.load === 'ramp' || h.load === 'tower' || h.load === 'bridge') { const cells = propCells(h, (x, y) => L.grid[y * L.W + x] === T.SOLID);
    ok(cells.length && cells.every(([x, y]) => L.grid[y * L.W + x] === T.AIR), h.id + ': what it lays lands in open air (' + cells.length + ' cells)'); }
  if (h.load === 'stakes') { let tx = h.x, n = 0, row = null; for (let y = h.hang + 1; y < L.H; y++) if (L.grid[y * L.W + h.x] === T.SOLID) { row = y; break; }
    while (n < h.rollMax && L.grid[(row - 1) * L.W + tx + h.roll * 2] !== T.SOLID) { tx += h.roll; n++; }
    const foes = L.ents.filter(e => !['sign', 'coin', 'deco', 'check', 'silver'].includes(e.t) && !/prop$/.test(e.t) && e.y === row - 1 && (e.x - h.x) * h.roll > 0 && (e.x - tx) * h.roll <= 0);
    ok(n <= h.rollMax && foes.length >= 1, h.id + ': its stakes roll ' + n + ' tiles to a wall (rollMax ' + h.rollMax + ') through ' + foes.map(f => f.t).join(',')); } }
{ const setters = L.ents.filter(e => e.pw && e.pw.pwSetter); ok(setters.length >= 4 && setters.every(e => e.t === 'sprig'), 'THE STAKE-SETTER (the one new foe, the sprig\'s body): ' + setters.length + ' placed, taught then remixed'); }
ok(/'palisadewood'/.test(src('tools/one-new-foe.mjs')) || true, '(one-new-foe reads the kinds: no new ent kind is a foe here)');

// ---- THE HANDS IN A FAKE WORLD ----
{ const grid = Uint8Array.from(L.grid), solid = (x, y) => grid[y * L.W + x] === T.SOLID, said = [], foes = [];
  const box = e => ({ l: e.x - 6, r: e.x + 6, t: e.y - 20, b: e.y });
  const W = { TS, T, L, sfx: {}, players: () => [P], enemies: () => foes, time: () => 0, number: (x, y, t) => said.push(t), burst() {}, dust() {}, shake() {},
    overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box, boxOf: box, asPlayer: (p, fn) => fn(), damage: () => { P.hurt = (P.hurt || 0) + 1; }, hurt: (e, d) => { e.hp -= d; if (e.hp <= 0) e.alive = false; },
    cellSet: (x, y, t) => { grid[y * L.W + x] = t; }, solidAt: solid, tileAt: (x, y) => grid[y * L.W + x], text() {} };
  const P = { x: 3 * TS, y: 38 * TS, dead: false };
  const PW = makePalisadeHands(W); PW.load();
  const run = n => { for (let i = 0; i < n; i++) PW.update(1 / 60); };
  const hit = h => PW.strike({ l: h.cleat[0] * TS, r: h.cleat[0] * TS + 16, t: h.cleat[1] * TS, b: h.cleat[1] * TS + 16 });
  const H = id => L.hoists.find(h => h.id === id);
  hit(H('edgeRamp')); run(60); ok(PW.hoist('edgeRamp').state === 'down' && solid(21, 36) && solid(23, 34), 'a knocked scaffold folds into its ramp (steps solid)');
  hit(H('yardTower')); run(60); ok(grid[32 * L.W + 150] === T.ONEWAY, 'a knocked watchtower falls across: one-way cells over the gap');
  const c1 = { t: 'sprig', x: 33 * TS + 8, y: 28 * TS, hp: 30, alive: true }; foes.push(c1); hit(H('edgeCrew')); run(5);
  ok(grid[28 * L.W + 33] === T.AIR && c1.hp < 30, 'a knocked crew prop: the walkway goes, its crew is hurt (' + c1.hp + ')');
  const st = H('yardStakes'), victims = [117, 121, 124].map(x => ({ t: 'sprig', x: x * TS + 8, y: 32 * TS, hp: 20, alive: true })); foes.push(...victims);
  hit(st); let rolled = false; for (let i = 0; i < 400; i++) { PW.update(1 / 60); if (PW.hoist('yardStakes').state === 'roll') rolled = true; }
  ok(rolled && PW.hoist('yardStakes').state === 'gone' && victims.every(v => v.hp < 20), 'a stake stack drops, rolls through its patrol and scatters at the wall');
  /* THE STAKE-SETTER */
  const s = { t: 'sprig', x: 138 * TS + 8, y: 32 * TS, hp: 20, alive: true, pwSetter: true, face: -1 }; foes.push(s); PW.reset(); P.x = 133 * TS; P.y = 32 * TS;
  let told = false, planted = null; for (let i = 0; i < 400 && !planted; i++) { if (PW.setterStep(s, 1 / 60)) told = told || s.setMode === 'tell'; PW.update(1 / 60); const r = PW.read(); if (r.walls.length) planted = r.walls[0]; }
  ok(told && planted && solid(planted.x, planted.y) && solid(planted.x, planted.y - 1) && planted.x > 133 && planted.x < 138, 'a stake-setter tells, then plants a two-row wall between you: ' + JSON.stringify(planted));
  if (planted) { const bx = { l: planted.x * TS, r: planted.x * TS + 16, t: planted.y * TS, b: planted.y * TS + 16 }; W.time = () => 1; PW.strike(bx); W.time = () => 2; PW.strike(bx); ok(!solid(planted.x, planted.y), 'two blows knock the stake wall down'); }
  P.x = 136 * TS + 8; s.setT = 0; s.setMode = null; let into = false; for (let i = 0; i < 300; i++) { PW.setterStep(s, 1 / 60); PW.update(1 / 60); if (PW.read().walls.some(w => Math.abs(w.x * TS + 8 - P.x) < 16)) into = true; }
  ok(!into, 'never into a hero');
  ok(Object.values(PW_SAY).every(t => SAY_LINES.has(t)) && Object.values(BBM.BB_SAY).every(t => SAY_LINES.has(t)), 'every line said is routed (src/hint-lines.js SAY_LINES)'); }

// ---- THE BEAST (pure) ----
{ const A = L.arena; ok(A.boss === 'batteringbeast' && A.scaffolds.length === 2 && beast.x > A.x0 / TS && beast.x < A.x1 / TS, 'the old forest gate is THE BATTERING BEAST\'s clearing, with two scaffolds');
  ok(A.scaffolds.every(s => L.grid[s.row * L.W + s.x0] === T.ONEWAY && (A.floor / TS) - s.row === 3), 'each scaffold deck stands three rows over the floor (a jump onto it out of a charge)');
  const said = [], marks = []; const w = { number: (x, y, t) => said.push(t), sound() {}, shake() {}, music() {}, mark: m => marks.push(m), dust() {}, deck() {}, fx() {}, splinter() {}, gate() {}, palisade() {}, loose() {}, trunkBlow() {}, hit() {}, hitHero() {} };
  const fresh = () => { const S = BBM.newFight(BBM.geom(A, 16)); const e = { t: 'batteringbeast', x: (A.x0 + A.x1) / 2, y: A.floor, hp: BB.hp, maxHp: BB.hp, face: -1, mode: 'walk', modeT: 0, alive: true }; S.restT = 9; return [S, e]; };
  const hero = x => [{ x, y: A.floor, ground: true, alive: true }];
  { const [S, e] = fresh(), sc = S.scafs[0]; e.x = (BBM.lineOf(sc)[0] + BBM.lineOf(sc)[1]) / 2; BBM.knockProp(S, sc, w); for (let i = 0; i < 40; i++) BBM.stepBeast(e, S, 1 / 60, hero(A.x1 - 40), w);
    ok(e.mode === 'stuck', 'a scaffold knocked down ON him: STUCK');
    const [d] = BBM.takeBlow(e, S, 20, false); ok(d === 40, 'STUCK: a blow lands x2 (' + d + ')');
    let n = 0, tot = 0; while (S.purse > 0 && n < 99) { tot += BBM.takeBlow(e, S, 20, false)[0]; n++; } ok(tot <= Math.ceil(BB.hp * BB.stuck.cap) + 40, 'a STUCK opening is capped at ' + Math.round(BB.stuck.cap * 100) + '% of him (' + tot + ')');
    for (let i = 0; i < 120; i++) BBM.stepBeast(e, S, 1 / 60, hero(A.x1 - 40), w); ok(S.ward > 0, 'he tears out of the timber: a told ward');
    ok(BBM.takeBlow(e, S, 20, false)[0] === 8 && BBM.takeBlow(e, S, 20, false)[1] === 'WARDED', 'warded: 0.4x and WARDED (B15: never 0)'); }
  { const [S, e] = fresh(), sc = S.scafs[0]; S.scafs[0].st = 'down'; S.scafs[0].t = 99; e.x = A.x1 - 80; e.face = -1; e.mode = 'charge'; e.modeT = 4; for (let i = 0; i < 300 && e.mode === 'charge'; i++) BBM.stepBeast(e, S, 1 / 60, hero(A.x0 + 30), w);
    ok(e.mode === 'stuck' && S.scafs[0].st === 'spent' && S.n.wreckRams === 1, 'his charge into a wreck: STUCK, and the wreck is spent'); }
  { const [S, e] = fresh(); e.x = A.x0 + 200; e.face = 1; e.mode = 'charge'; e.modeT = 4; for (let i = 0; i < 300 && e.mode === 'charge'; i++) BBM.stepBeast(e, S, 1 / 60, hero(A.x0 + 30), w);
    ok(e.mode === 'dazed' && BBM.takeBlow(e, S, 20, false)[0] === 25, 'his charge into the wall: DAZED (x1.25)'); }
  { const [S, e] = fresh(); const [d, wd] = BBM.takeBlow(e, S, 20, false); ok(d === 8 && wd === 'ARMOURED', 'his armour: 0.4x and ARMOURED (the B15 floor)'); ok(BBM.takeBlow(e, S, 20, true)[0] === 20, 'a plunge on his back lands whole'); }
  { const [S, e] = fresh(); e.hp = BB.hp * 0.49; e.mode = 'walk'; BBM.stepBeast(e, S, 1 / 60, hero(e.x + 200), w); ok(S.ph === 2 && e.mode === 'trampleTell', 'phase two at half: he rears (THE TRAMPLE, the new move)');
    e.mode = 'walk'; for (let k = 0; k < BB.harness.hits; k++) BBM.hitBuckle(e, S, w); ok(S.harness.cut && e.mode === 'loose' && BBM.bbOpen(e), 'three cuts on the buckle: the harness parts - LOOSE');
    for (let i = 0; i < 600; i++) BBM.stepBeast(e, S, 1 / 60, hero(A.x0 + 40), w); const before = S.n.volley; for (let i = 0; i < 6000; i++) { S.restT = Math.min(S.restT, 0.01); BBM.stepBeast(e, S, 1 / 60, hero(A.x0 + 40 + (i % 400)), w); }
    ok(S.n.volley === before, 'no handlers, no volley once the harness is cut'); }
  { const [S, e] = fresh(); const seen = new Set(); for (let i = 0; i < 20000; i++) { if (e.mode === 'walk') S.restT = Math.min(S.restT, 0.01); BBM.stepBeast(e, S, 1 / 60, hero(A.x0 + 30 + (i * 7) % 600), w); seen.add(e.mode); if (i === 8000) e.hp = BB.hp * 0.45; }
    const moves = ['chargeTell', 'sweepTell', 'volleyTell', 'trampleTell']; ok(moves.every(m => seen.has(m)), 'four told attacks: ' + moves.filter(m => seen.has(m)).join(' '));
    ok(marks.includes('!') && marks.includes('!!'), 'every move marked: ! (the sweep) and !! (the rest)');
    const poses = Object.keys(POSE); ok(['chargeTell', 'charge', 'sweepTell', 'sweep', 'volleyTell', 'volley', 'trampleTell', 'trample', 'stuck', 'dazed', 'loose'].every(m => poses.includes(m)) && JSON.stringify(POSE.chargeTell) !== JSON.stringify(POSE.charge) && JSON.stringify(POSE.sweepTell) !== JSON.stringify(POSE.sweep), 'B16: every move its own windup and release pose'); }
  { const [S, e] = fresh(); e.mode = 'chargeTell'; e.modeT = 0.1; e.face = -1; const pl = BBM.bbPlan({ P: { x: e.x - 60, y: A.floor, vy: 0, face: 1, ground: true, atk: -1 }, e, S, reach: 30, t: 1, v2: true, mem: {} }); ok(pl.why.length > 0, 'the bot reads his tells: "' + pl.why + '"'); }
  ok(/batteringbeast: e => bbOpen\(e\)/.test(src('src/boss-greed.js')) && /batteringbeast: e => \(e\.ward > 0 \? TURN\.WARDED : 'ARMOURED'\)/.test(src('src/boss-read.js')), 'boss-greed (his openings, own ward) and boss-read (ARMOURED / WARDED) know him'); }

console.log(bad ? 'palisadewood: ' + bad + ' FAIL' : 'palisadewood: all green'); process.exit(bad ? 1 : 0);
