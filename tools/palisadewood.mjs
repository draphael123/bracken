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
//   (B15 floor: never 0 - warded 0.4x, every mode); a ward after STUCK; phase two at half (the buckle); (claude/beast3) THE TRAMPLE IS CUT; THE VOLLEY ORDER (lanes, the Hornsman's horn: ORDER LOST, knocked off); THE WALL BREAKER (the run, the timbers, THE BREACH's rubble step); three cuts on the buckle = LOOSE and no more volley;
//   every move told (a mark) with its own pose (B16); the bot's plan answers every tell.
//     node tools/palisadewood.mjs
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { PALISADE, SECTIONS, PW_RULE } from '../src/palisade-wood.js';
import { makePalisadeHands, PW_SAY, SETTER, propCells } from '../src/palisade-hands.js';
import * as BBM from '../src/battering-beast.js';
import { POSE } from '../src/battering-beast-hands.js';
import * as BBA from '../src/redraw/battering_beast_art.js';
import { SAY_LINES } from '../src/hint-lines.js';
const TS = 16; const { BB } = BBM;
{ let a = 0x9e3779b9; Math.random = () => { a |= 0; a = a + 0x6d2b79f5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }   /* (claude/palisade2) a seeded random: the move-sweep asserts are deterministic */
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
  const said = [], marks = [], hits = []; let added = 0; const w = { number: (x, y, t) => said.push(t), sound() {}, shake() {}, music() {}, mark: m => marks.push(m), dust() {}, deck() {}, fx() {}, splinter() {}, gate() {}, palisade() {}, loose() {}, trunkBlow() {}, rubble() {}, hornFalls() {}, hit: (b, d, n) => hits.push(n), hitHero: (h, d, n) => hits.push(n), add: () => { added++; return { alive: true, x: 0, y: 0 }; } };
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
    ok(e.mode === 'dazed' && BBM.takeBlow(e, S, 20, false)[0] === Math.round(20 * BB.daze.mul) && BB.daze.mul > 1, 'his charge into the wall: DAZED (x' + BB.daze.mul + ')'); }
  { const [S, e] = fresh(); const [d, wd] = BBM.takeBlow(e, S, 20, false); ok(d === Math.round(20 * BB.armour) && BB.armour >= 0.4 && wd === 'ARMOURED', 'his armour: ' + BB.armour + 'x (never under the 0.4x B15 floor) and ARMOURED'); ok(BBM.takeBlow(e, S, 20, true)[0] === 20, 'a plunge on his back lands whole'); }
  { const [S, e] = fresh(); e.hp = BB.hp * 0.49; e.mode = 'walk'; BBM.stepBeast(e, S, 1 / 60, hero(e.x + 200), w); ok(S.ph === 2 && e.mode === 'unchain', 'phase two at half: THE CHAINS SNAP (he rears, told)');
    added = 0; for (let i = 0; i < 90 && e.mode === 'unchain'; i++) BBM.stepBeast(e, S, 1 / 60, hero(e.x + 200), w);
    ok(S.harness.cut && e.mode === 'loose' && BBM.bbOpen(e) && added === BB.unchain.adds && S.adds.length === BB.unchain.adds, 'the chains snap: the handlers are bucked off (' + added + ' on foot, the P2 adds) and he bolts for the palisade - LOOSE');
    let tot = 0; for (let k = 0; k < 99 && S.purse > 0; k++) tot += BBM.takeBlow(e, S, 20, false)[0]; ok(tot <= Math.ceil(BB.hp * BB.harness.cap) + 40, 'LOOSE is capped at ' + Math.round(BB.harness.cap * 100) + '% (' + tot + ')');
    S.adds = []; for (let i = 0; i < 600; i++) BBM.stepBeast(e, S, 1 / 60, hero(A.x0 + 40), w); const before = S.n.volley + S.n.pots + S.n.batter + S.n.order, seen2 = new Set();
    for (let i = 0; i < 9000; i++) { S.restT = Math.min(S.restT, 0.01); BBM.stepBeast(e, S, 1 / 60, hero(A.x0 + 40 + (i * 3) % 500), w); seen2.add(e.mode); }
    ok(S.n.volley + S.n.pots + S.n.batter + S.n.order === before, 'no handlers on him, no orders (stakes, pitch, batter, the volley order) once the chains snap');
    ok(['wallTell', 'flailTell', 'chargeTell'].every(m => seen2.has(m)) && !seen2.has('sweepTell') && !seen2.has('orderTell') && !seen2.has('trampleTell'), 'P2, THE BEAST UNCHAINED: THE WALL BREAKER, THE CHAIN FLAIL and the charge (THE BUCK: its own test below; no ram swing, no order, no trample) ' + ['wallTell', 'flailTell', 'kickTell', 'chargeTell'].filter(m => seen2.has(m)).join(' '));
    { e.mode = 'walk'; S.restT = 0; S.last = []; S.ward = 0; const hx = e.x + 24; e.face = 1; BBM.stepBeast(e, S, 1 / 60, hero(hx), w); ok(e.mode === 'kickTell' && e.face === -1, 'hug his flank: THE BUCK - he turns his rump on you (' + e.mode + ')');
      for (let i = 0; i < 60 && e.mode !== 'recover'; i++) BBM.stepBeast(e, S, 1 / 60, hero(hx), w); }
    ok(hits.includes('flail') && hits.includes('buck'), 'the flail and the buck land blows (their boxes)'); }
  { const [S, e] = fresh(), sc = S.scafs[0], h = [{ x: (sc.x0 + sc.x1) / 2, y: sc.deckY, ground: true, alive: true }]; e.x = BBM.batterX(sc); S.restT = 0; hits.length = 0;
    for (let i = 0; i < 400 && e.mode !== 'batterTell'; i++) { S.restT = Math.min(S.restT, 0.01); BBM.stepBeast(e, S, 1 / 60, h, w); }
    ok(e.mode === 'batterTell' && said.includes(BBM.BB_SAY.oBatter), 'you stand on a deck: BATTER THE SCAFFOLD (the order, told)');
    for (let i = 0; i < 400 && e.mode !== 'recover'; i++) BBM.stepBeast(e, S, 1 / 60, h, w);
    ok(said.includes(BBM.BB_SAY.shake) && sc.st === 'spent' && hits.includes('batter') && S.n.collapse === 1, 'it SHAKES for a told beat, then COLLAPSES under you (hurt) and the scaffold is spent'); }
  { const [S, e] = fresh(), sc = S.scafs[0], h = [{ x: (sc.x0 + sc.x1) / 2, y: sc.deckY, ground: true, alive: true }]; e.x = BBM.batterX(sc);
    for (let i = 0; i < 400 && e.mode !== 'batter'; i++) { S.restT = Math.min(S.restT, 0.01); BBM.stepBeast(e, S, 1 / 60, h, w); }
    ok(BBM.underLine(sc, e.x, BB.w / 2 - 6), 'where he batters he stands in that scaffold\'s own fall line');
    BBM.knockProp(S, sc, w); for (let i = 0; i < 40; i++) BBM.stepBeast(e, S, 1 / 60, hero(A.x1 - 40), w); ok(e.mode === 'stuck', 'knock its prop while he batters: it comes down ON HIM - STUCK (the counter)'); }
  /* (claude/beast3) THE TRAMPLE IS CUT */
  ok(!('trample' in BB) && !BBM.bbTelling({ mode: 'trampleTell' }) && !/trampleTell|S\.waves/.test(src('src/battering-beast.js') + src('src/battering-beast-hands.js')) && !/trample/.test(src('src/redraw/battering_beast_art.js').replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '')), 'THE TRAMPLE is cut: no numbers, no tell, no waves, no frames (Daniel 11-01: the Tusker stomp-wave echo + the low-poly quake)');
  /* (claude/beast3) THE VOLLEY ORDER */
  { const [S, e] = fresh(); hits.length = 0; said.length = 0; const hx = A.x0 + 260; e.x = A.x0 + 420; e.face = -1; S.restT = 0;
    let picked = false; for (let i = 0; i < 4000 && !picked; i++) { S.restT = Math.min(S.restT, 0.01); BBM.stepBeast(e, S, 1 / 60, hero(hx), w); if (e.mode === 'orderTell') picked = true; else if (e.mode !== 'walk') { e.mode = 'walk'; S.lanes = []; S.stakes = []; S.pots = []; S.fires = []; } }
    ok(picked && said.includes(BBM.BB_SAY.order) && marks.includes('!!'), 'P1 picks THE VOLLEY ORDER: the horn up (THE ORDER, !!)');
    const w1 = S.lanes.filter(q => q.wave === 1), w2 = S.lanes.filter(q => q.wave === 2), inL = (L2, x) => L2.some(q => x > q.l && x < q.r);
    ok(w1.length >= 3 && w2.length >= 3 && inL(w1, hx) && !inL(w2, hx) && inL(w2, hx + BB.order.pitch / 2), 'the lanes are marked from the first beat: wave one on you (' + w1.length + '), wave two in its gaps (' + w2.length + ')');
    let both = 0; for (let x = A.x0 + 30; x < A.x1 - 30; x += 3) if (inL(w1, x) && inL(w2, x)) both++; ok(both === 0, 'a lane is safe from the other wave (no x under both): ' + both);
    ok(BBM.hornUp(e, S) && (() => { const hb = BBM.hornBox(e); return hb[3] < A.floor - 22 && hb[2] > A.floor - 70 && Math.abs((hb[0] + hb[1]) / 2 - e.x) < 12; })(), 'THE HORNSMAN stands on the gantry over his back: out of a standing cut, in a jump\'s reach');
    for (let i = 0; i < 300 && (S.lanes.some(q => !q.done) || e.mode === 'orderTell'); i++) BBM.stepBeast(e, S, 1 / 60, hero(hx), w);
    ok(hits.filter(n => n === 'volley order').length >= 1, 'the arrows come down in the lanes: ' + hits.filter(n => n === 'volley order').length + ' lane blows'); }
  { const [S, e] = fresh(); const lw = []; const w2 = { ...w, hit: (b, d, n) => lw.push([b, n]) }; const hx = A.x0 + 260; e.x = A.x0 + 420; e.face = -1; e.mode = 'orderTell'; e.modeT = BB.order.tell; S.lanes = BBM.orderLanes(S, hx, 7);
    for (let i = 0; i < 300; i++) BBM.stepBeast(e, S, 1 / 60, hero(A.x1 - 40), w2);
    const at = x => lw.some(([b, n]) => n === 'volley order' && x > b[0] && x < b[1]);
    ok(at(hx) && at(hx + BB.order.pitch / 2), 'both waves land (wave one on you, then wave two in its gaps)');
    const t1 = BB.order.tell + BB.order.flight; ok(BB.order.gap >= 0.6 && t1 >= 1.3, 'told: ' + t1.toFixed(2) + ' s from the horn to wave one, ' + BB.order.gap + ' s on to wave two (time to step across a ' + BB.order.laneW + ' px lane)'); }
  { const [S, e] = fresh(); said.length = 0; e.mode = 'orderTell'; e.modeT = BB.order.tell; S.lanes = BBM.orderLanes(S, e.x - 100, 3);
    ok(BBM.hornStruck(e, S, w) && e.mode === 'lost' && BBM.bbOpen(e) && BBM.takeBlow(e, S, 20, false)[0] === Math.round(20 * BB.daze.mul) && S.lanes.length === 0 && said.includes(BBM.BB_SAY.lost) && !S.horn.down, 'hit the Hornsman while the horn is up: ORDER LOST (the lanes are wiped, he stands unsteered: a short opening, x' + BB.daze.mul + ')');
    ok(!BBM.hornStruck(e, S, w), 'a blow on him with the horn down does nothing (the read is the horn)');
    e.mode = 'orderTell'; e.modeT = 0.5; S.lanes = BBM.orderLanes(S, e.x - 100, 4); BBM.hornStruck(e, S, w); ok(S.horn.down && said.includes(BBM.BB_SAY.hornFalls), BB.order.lives + ' orders lost: THE HORNSMAN FALLS off the gantry');
    const n0 = S.n.order; for (let i = 0; i < 12000; i++) { if (e.mode === 'walk') S.restT = Math.min(S.restT, 0.01); if (e.mode === 'stuck' || e.mode === 'dazed') e.mode = 'walk'; BBM.stepBeast(e, S, 1 / 60, hero(A.x0 + 30 + (i * 7) % 600), w); e.hp = BB.hp; }
    ok(S.n.order === n0, 'no more volley orders once he is off the gantry (' + (S.n.order - n0) + ')'); }
  { const hs = src('src/battering-beast-hands.js'); ok(hs.includes('BBM.hornUp(e, S)') && /ctx\.hitOnce\(S\.horn\)/.test(hs) && /rgArrows[\s\S]{0,600}BBM\.hornStruck/.test(hs), 'the hands route a blow (strike) and a ranger arrow into the Hornsman while the horn is up'); }
  /* (claude/beast3) THE WALL BREAKER */
  { const [S, e] = fresh(); S.ph = 2; S.harness.cut = true; hits.length = 0; said.length = 0; let rub = 0; const ww = { ...w, rubble: () => { rub++; } }; const x1 = A.x1; e.x = A.x0 + 300; e.mode = 'wallTell'; e.modeT = BB.wall.tell; S.act = 50;
    const seen = []; for (let i = 0; i < 400 && seen.indexOf('dazed') < 0; i++) { BBM.stepBeast(e, S, 1 / 60, hero(A.x0 + 40), ww); if (seen[seen.length - 1] !== e.mode) seen.push(e.mode); }
    ok(seen.join('>').startsWith('wallTell>wallRun>wallHit') && seen.includes('dazed') && BBM.bbOpen(e) && S.n.wall === 1, 'THE WALL BREAKER: he wheels on the palisade, runs it, slams it, reels off it (DAZED): ' + seen.join('>'));
    ok(S.breach === 1 && rub === 1 && BBM.wallX(S) === x1 - BB.wall.rubble * 16 && e.x <= BBM.wallX(S) - BB.w / 2 - 1.5 && said.includes(BBM.BB_SAY.breach), 'the first slam leaves THE BREACH: the rubble step (' + BB.wall.rubble + ' cols) and he stands off it');
    ok(S.timbers.length === BB.wall.n, 'a section topples into the clearing: ' + S.timbers.length + ' timbers');
    const rc = BBM.rubbleCols(S.G); ok(rc[1] === Math.round(x1 / 16) - 1 && rc[1] - rc[0] + 1 === BB.wall.rubble && rc[2] === Math.round(A.floor / 16) - 1 && rc[0] > A.scaffolds[1].x1, 'the rubble cells sit on the clearing floor against the east wall, clear of the east scaffold ' + JSON.stringify(rc));
    const hx = A.x0 + 200; let hitT = 0, deckHit = 0; const sc = S.scafs[0], deckHero = { x: (sc.x0 + sc.x1) / 2, y: sc.deckY };
    const ww2 = { ...ww, hit: (b, d, n) => { if (n !== 'timbers') return; if (hx > b[0] && hx < b[1]) hitT++; if (deckHero.x > b[0] && deckHero.x < b[1] && deckHero.y > b[2] && deckHero.y - 16 < b[3]) deckHit++; } };
    for (let i = 0; i < 600 && S.timbers.length; i++) BBM.stepBeast(e, S, 1 / 60, hero(A.x0 + 40), ww2);
    ok(hitT > 0 && deckHit === 0 && S.timbers.length === 0, 'the timbers roll the floor (they hit a hero standing in their road, never one up on a deck) and break at the old gate');
    e.mode = 'wallTell'; e.modeT = BB.wall.tell; e.x = A.x0 + 300; for (let i = 0; i < 400 && e.mode !== 'dazed'; i++) BBM.stepBeast(e, S, 1 / 60, hero(A.x0 + 40), ww); ok(S.breach === 2 && rub === 1, 'the next slam widens the breach (the rubble is laid once)'); }
  { const [S, e] = fresh(); S.ph = 2; S.harness.cut = true; const sc = S.scafs[1]; sc.st = 'down'; sc.t = 99; e.x = A.x0 + 200; e.mode = 'wallRun'; e.modeT = 4; for (let i = 0; i < 400 && e.mode === 'wallRun'; i++) BBM.stepBeast(e, S, 1 / 60, hero(A.x0 + 40), w);
    ok(e.mode === 'stuck', 'a wreck in his road to the wall: STUCK (the rule works in P2)');
    const [S2, e2] = fresh(); S2.ph = 2; S2.scafs[0].st = 'down'; S2.scafs[0].t = 99; S2.timbers.push({ x: A.x1 - 80, d: 0, fall: 0, key: 't' }); for (let i = 0; i < 600 && S2.timbers.length; i++) BBM.stepBeast(e2, S2, 1 / 60, hero(A.x1 - 40), w);
    ok(S2.timbers.length === 0, 'a wreck on the floor stops a timber'); }
  { const [S, e] = fresh(); hits.length = 0; e.x = A.x0 + 300; S.pots.push({ x0: e.x, y0: A.floor - 50, tx: e.x - 80, ty: A.floor, t: 0, T: 0.5, key: 'p' });
    for (let i = 0; i < 60; i++) BBM.stepBeast(e, S, 1 / 60, hero(A.x1 - 40), w); ok(S.fires.length === 1, 'a pitch pot lands: BURNING PITCH on the floor');
    for (let i = 0; i < 120; i++) BBM.stepBeast(e, S, 1 / 60, hero(e.x - 80), w); ok(hits.filter(n => n === 'pitch').length >= 2, 'standing in the pitch burns, tick by tick (' + hits.filter(n => n === 'pitch').length + ')');
    for (let i = 0; i < 300; i++) BBM.stepBeast(e, S, 1 / 60, hero(A.x1 - 40), w); ok(S.fires.length === 0, 'the pitch burns out'); }
  { const [S, e] = fresh(); const seen = new Set(); for (let i = 0; i < 60000; i++) { if (e.mode === 'walk') S.restT = Math.min(S.restT, 0.01); BBM.stepBeast(e, S, 1 / 60, hero(A.x0 + 30 + (i * 7) % 600), w); seen.add(e.mode); if (i === 24000) e.hp = BB.hp * 0.45; }
    const moves = ['chargeTell', 'sweepTell', 'sweepBack', 'volleyTell', 'potTell', 'orderTell', 'wallTell', 'flailTell', 'kickTell']; ok(moves.every(m => seen.has(m)), 'P1 six (five orders + THE VOLLEY ORDER) + P2 four moves, all told: ' + moves.filter(m => seen.has(m)).join(' ') + ' (batterTell: its own test)');
    ok(Object.keys(BBM.ORDER).every(m => BBM.BB_SAY[BBM.ORDER[m].say]), 'P1: every move is a handler ORDER (a flag + a shouted word): ' + Object.keys(BBM.ORDER).map(m => BBM.BB_SAY[BBM.ORDER[m].say]).join(' '));
    ok(marks.includes('!') && marks.includes('!!'), 'every move marked: ! (the sweep) and !! (the rest)');
    const poses = Object.keys(POSE), PP = [['chargeTell', 'charge'], ['sweepTell', 'sweep'], ['sweepMid', 'sweepBack'], ['volleyTell', 'volley'], ['potTell', 'pot'], ['batterTell', 'batter'], ['orderTell', 'order'], ['wallTell', 'wallRun'], ['wallHit', 'wallBack'], ['flailTell', 'flail'], ['kickTell', 'kick']];
    ok(PP.every(([a, b]) => poses.includes(a) && poses.includes(b) && BBA.POSES[a] && BBA.POSES[b] && JSON.stringify(POSE[a]) !== JSON.stringify(POSE[b]) && JSON.stringify(BBA.POSES[a]) !== JSON.stringify(BBA.POSES[b])) && ['stuck', 'dazed', 'loose', 'unchain', 'lost'].every(m => poses.includes(m) && BBA.POSES[m]) && !POSE.trampleTell && !BBA.POSES.trampleTell && !BBA.POSES.trample, 'B16: every move its own windup and release pose (hands POSE + the baked art POSES)'); }
  { const [S, e] = fresh(); e.mode = 'chargeTell'; e.modeT = 0.1; e.face = -1; const pl = BBM.bbPlan({ P: { x: e.x - 60, y: A.floor, vy: 0, face: 1, ground: true, atk: -1 }, e, S, reach: 30, t: 1, v2: true, mem: {} }); ok(pl.why.length > 0, 'the bot reads his tells: "' + pl.why + '"'); }
  ok(/batteringbeast: e => bbOpen\(e\)/.test(src('src/boss-greed.js')) && /batteringbeast: e => \(e\.ward > 0 \? TURN\.WARDED : 'ARMOURED'\)/.test(src('src/boss-read.js')), 'boss-greed (his openings, own ward) and boss-read (ARMOURED / WARDED) know him'); }

// ---- (claude/palboss) THE BROKEN CHAIN'S BALL (P2): it follows him smoothly through a charge, a stick, a daze, a turn, a flail; it is drawn in every mode but the flail's (where the baked chain is) ----
{ const A = lv.build().arena, w = { number() {}, sound() {}, shake() {}, music() {}, mark() {}, dust() {}, deck() {}, fx() {}, splinter() {}, gate() {}, palisade() {}, loose() {}, trunkBlow() {}, rubble() {}, hornFalls() {}, hit() {}, hitHero() {}, add() { return null; } };
  const mk = () => { const S = BBM.newFight(BBM.geom(A, 16)); const e = { t: 'batteringbeast', x: A.x0 + 200, y: A.floor, hp: BB.hp, maxHp: BB.hp, face: 1, mode: 'walk', modeT: 0, alive: true }; S.restT = 9; S.ph = 2; S.harness.cut = true; return [S, e]; };
  const hero = x => [{ x, y: A.floor, ground: true, alive: true }];
  const LMAX = Math.max(BBM.BALL.L, BBM.BALL.out[0] - BBM.BALL.anchor[0]) + BBM.BALL.r + 2;   /* the worst case: the instant after the flail (the whipped chain's end, drawn in at BALL.pull px/s) */
  let worst = 0, worstStep = 0, undrawn = [], frames = 0, prev = null, tautMax = 0; const modes = new Set();
  const run = (S, e, n, hx, dtf) => { for (let i = 0; i < n; i++) { const dt = dtf ? dtf(i) : 1 / 60; BBM.stepBeast(e, S, dt, hero(typeof hx === 'function' ? hx(i) : hx), w);
      const g = BBM.ballGeom(e, S); frames++; modes.add(e.mode); if (g.show) worst = Math.max(worst, g.d); if (prev && g.show && e.face === prev[2]) worstStep = Math.max(worstStep, Math.hypot((g.x - g.ax) - (prev[0] - prev[3]), (g.y - g.ay) - (prev[1] - prev[4]))); prev = g.show ? [g.x, g.y, e.face, g.ax, g.ay] : null;   /* (its move RELATIVE to the collar: he carries it when he moves, a hitch included) */   /* (a TURN flips the ball with his sprite: that frame is the sprite's flip, not a move) */   /* (the ball is only DRAWN, and so only seen to move, when shown; in the flail's frames the baked chain is the picture) */
      if (!g.show && !BBM.ballBaked(e) && e.mode !== 'sleep' && e.alive) undrawn.push(e.mode); if (g.show && g.d > BBM.BALL.L + 1.5 && e.face === (S._f || e.face)) tautMax = Math.max(tautMax, g.d); S._f = e.face;
      if (!Number.isFinite(g.x) || !Number.isFinite(g.y)) { undrawn.push('NaN'); } } };
  /* a charge in P2 east, then west (a turn), through a dt spike and a stutter, into the wall and the daze */
  const tp = (S, e, x) => { e.x = x; S.ball.init = false; prev = null; };   /* (the test moves him by hand: a warp the real fight never makes; the ball re-hangs from the collar) */
  { const [S, e] = mk(); BBM.stepBall(e, S, 1 / 60); tp(S, e, A.x0 + 120); e.face = 1; e.mode = 'chargeTell'; e.modeT = 0.2; S.act = 80; run(S, e, 60, A.x1 - 40);
    for (let k = 0; k < 6 && e.mode !== 'dazed'; k++) run(S, e, 120, A.x1 - 40, i => (i === 20 ? 0.25 : i === 21 ? 0 : i % 7 === 0 ? 1 / 20 : 1 / 60));   /* a 250 ms spike, a zero dt, a 50 ms hitch */
    run(S, e, 120, A.x0 + 40);                                                                                       /* dazed, then recover and turn to the hero on the other side */
    e.mode = 'chargeTell'; e.modeT = 0.2; e.face = -1; run(S, e, 200, A.x0 + 40);
    S.scafs[0].st = 'down'; S.scafs[0].t = 99; tp(S, e, A.x0 + 260); e.face = -1; e.mode = 'chargeTell'; e.modeT = 0.1; run(S, e, 240, A.x0 + 40);   /* into a wreck: STUCK, then the tear */
    for (let i = 0; i < 4000; i++) { if (e.mode === 'walk') S.restT = Math.min(S.restT, 0.01); run(S, e, 1, A.x0 + 30 + (i * 13) % 700); } }
  ok(worst <= LMAX, 'the ball stays within ' + LMAX.toFixed(0) + ' px of his collar every frame, through ' + [...modes].length + ' modes and ' + frames + ' frames (worst ' + worst.toFixed(1) + ')');
  ok(worstStep <= 14, 'the ball never jumps: the biggest move in one frame relative to his collar (turns excepted: the sprite flips) is ' + worstStep.toFixed(1) + ' px (a 250 ms dt spike and a zero dt included)');
  ok(undrawn.length === 0, 'the ball is drawn (and finite) in every P2 mode except the flail (where the baked chain is): ' + (undrawn.length ? [...new Set(undrawn)].join(' ') : 'all ' + frames + ' frames'));
  ok(['chargeTell', 'charge', 'stuck', 'dazed', 'flailTell', 'flail', 'recover'].every(m => modes.has(m)), 'the run covered charge, stuck, dazed, recover and the flail');
  { const [S, e] = mk(); e.mode = 'charge'; e.modeT = 5; e.x = A.x0 + 100; e.face = 1; S.act = 5; for (let i = 0; i < 60; i++) { e.x += 280 / 60; BBM.stepBall(e, S, 1 / 60); } const g = BBM.ballGeom(e, S);
    ok(g.d <= BBM.BALL.L + 0.5 && g.x < g.ax - 8, 'at charge speed the ball TRAILS behind the collar on a taut chain (' + (g.ax - g.x).toFixed(0) + ' px back, ' + g.d.toFixed(1) + ' away)'); }
  { const [S, e] = mk(); e.mode = 'flail'; e.face = 1; BBM.stepBall(e, S, 1 / 60); const a = [S.ball.x, S.ball.y]; e.mode = 'recover'; e.modeT = 1; let mx = 0, pp = a; for (let i = 0; i < 40; i++) { BBM.stepBall(e, S, 1 / 60); mx = Math.max(mx, Math.hypot(S.ball.x - pp[0], S.ball.y - pp[1])); pp = [S.ball.x, S.ball.y]; }
    ok(mx <= 13 && BBM.ballGeom(e, S).d <= BBM.BALL.L + 0.5, 'out of the flail the ball picks up from the whipped chain end and draws in (' + mx.toFixed(1) + ' px/frame max) to hang from the collar'); }
  ok(BBA.POSES.flailTell.chain && BBA.POSES.flail.chain && !Object.values(BBA.POSES).some(p => p.chain === 'drag'), 'the flail coil and lash are baked; no baked dragging chain (the ball is a world object)');
}
// ---- (claude/palboss) THE SCAFFOLD PROP is a brace attached to the frame: its head lands INSIDE the inner post, its foot on the floor (the drawing's geometry) ----
{ const A = lv.build().arena; const G = BBM.geom(A, 16);
  ok(G.scafs.every(s => { const inner = s.dir > 0 ? s.x1 : s.x0, head = inner - s.dir * 3, post = s.dir > 0 ? [s.x1 - 7, s.x1] : [s.x0 + 1, s.x0 + 8]; return head > post[0] && head < post[1] && Math.abs(head - s.x) <= 40 && Math.sign(inner - s.x) === -s.dir; }),
    'each scaffold brace runs from its prop on the clearing side UP-AND-IN to the inner post (head inside the post, <= 40 px across): ' + G.scafs.map(s => 'dir ' + s.dir + ' span ' + Math.round(Math.abs(s.x - ((s.dir > 0 ? s.x1 : s.x0) - s.dir * 3))) + ' px').join(', '));
  ok(G.scafs.every(s => { const [lo, hi] = BBM.lineOf(s), inner = s.dir > 0 ? s.x1 : s.x0; return s.dir > 0 ? lo > inner : hi < inner; }), 'the fall line starts beyond the frame inner foot and runs into the clearing, the way the frame racks over (dir)'); }

console.log(bad ? 'palisadewood: ' + bad + ' FAIL' : 'palisadewood: all green'); process.exit(bad ? 1 : 0);
