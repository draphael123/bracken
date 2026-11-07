/* tools/causeway3.mjs - THE DROWNED CAUSEWAY 2 (claude/causeway3w, the greybox): node proofs. Node only: no page, no port, no Chrome.
     node tools/causeway3.mjs            every check (~5 s)
   What it proves: the flag both ways (off: master's Causeway exactly - hashed in a child process against the base's; on: CAUSEWAY 2, the reach copied cell for cell
   368 columns east); lintCauseway3 + the kit's lintTide + lintPulls; THE STORM BUILDS (30 / 22 / 15 s); each verb is REQUIRED where the level says so (the
   channels' own dry windows are shorter than the fastest walk, the sluice's hold longer than the slowest; the boats lift you to the sea walls only at high water;
   the shrouds are out of reach from the road; the undercroft's door is out of reach drained); the sea arch's breath with and against the tide; THE COLLAPSE is
   fair for the slowest hero and kills one who stops; reach from START to every shrine, every silver and the arena with the boats as rides; the hands in a stub world. */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';

const SELF = fileURLToPath(import.meta.url);
const ROOT = process.env.CW3_ROOT ? resolve(process.env.CW3_ROOT) : resolve(dirname(SELF), '..');
const arg = k => { const a = process.argv.find(q => q.startsWith('--' + k)); return a ? (a.split('=')[1] ?? true) : null; };
const imp = p => import(pathToFileURL(resolve(ROOT, p)).href);
/* the child: build the 'causeway' row with the flag as asked and print its hash (a fresh process: the flag is read at build time) */
if (arg('child')) {
  const { LEVELS } = await imp('src/level.js');
  const L = LEVELS.find(l => l.id === 'causeway').build();
  const h = createHash('sha1').update(JSON.stringify([L.W, L.H, Array.from(L.grid), L.ents, L.pools, L.ambushes || null, (L.moversExtra || []).length, L.arena])).digest('hex').slice(0, 12);
  const tail = createHash('sha1').update(JSON.stringify(Array.from({ length: L.H }, (_, y) => Array.from(L.grid.slice(y * L.W + L.W - 47, y * L.W + L.W))))).digest('hex').slice(0, 12);
  console.log(JSON.stringify({ W: L.W, cw3: !!L.cw3, h, tail })); process.exit(0);
}
/* the flag-off build's hash on the base (claude/waterkit e08836df8, built by this tool's --child with CW3_ROOT at a checkout of the base). Re-stamp if master's
   Causeway changes before the merge: CW3=0 CW3_ROOT=<base checkout> node tools/causeway3.mjs --child */
const BASE_OFF = '86df98cd6d71';
let ok = 0; const VERBOSE = !!arg('v'); const pass = (c, m) => { assert.ok(c, m); ok++; if (VERBOSE) console.log('  ok ' + m); };
const child = env => { const r = spawnSync(process.execPath, [SELF, '--child'], { env: { ...process.env, CW3: env }, encoding: 'utf8' }); if (r.status !== 0) throw new Error(r.stderr); return JSON.parse(r.stdout.trim().split('\n').pop()); };

/* ---------- 1. THE FLAG ---------- */
const OFF = child('0'), ON = child('1');
pass(!OFF.cw3 && OFF.W === 612, 'flag off: master Causeway (612 columns)');
pass(OFF.h === BASE_OFF, 'flag off: the build hash is the base hash (' + OFF.h + ' vs ' + BASE_OFF + ')');
pass(ON.cw3 && ON.W === 980, 'flag on: CAUSEWAY 2 (980 columns, x1.6)');
pass(ON.tail === OFF.tail, 'flag on: the reach (master\'s last 47 columns) kept cell for cell');

process.env.CW3 = '1';
const { LEVELS, T } = await imp('src/level.js');
const { CW3, CW3_TABLES, lintCauseway3, cw3On } = await imp('src/causeway3.js');
const { lintTide, tideInit, tideStep, tideStrike, gauge, floatY, lineY } = await imp('src/tide-kit.js');
const { lintPulls, classOf } = await imp('src/pull-field.js');
const { floodReach } = await imp('src/reachcore.js');
const { MOVE, HERO_RUN, HERO_MOVE_IDS } = await imp('src/hero-move.js');
const { breathCapacity } = await imp('src/deepair.js');
const { makeCauseway3Hands } = await imp('src/causeway3-hands.js');
const TS = 16;
pass(cw3On(), 'CW3=1 turns it on for Node tools');
const L = LEVELS.find(l => l.id === 'causeway').build();
pass(L.cw3 && L.W === CW3.W, 'built on');
const at = (x, y) => L.grid[y * L.W + x];

/* ---------- 2. THE LEVEL'S OWN LINT + THE KIT'S ---------- */
{ const bad = lintCauseway3(L, T); pass(!bad.length, 'lintCauseway3: ' + bad.join('; '));
  const badT = lintTide({ tides: L.cw3Tides, pools: L.pools, checkpoints: L.ents.filter(e => e.t === 'check') }); pass(!badT.length, 'lintTide: ' + badT.join('; '));
  const badP = lintPulls({ pulls: L.cw3Pulls }); pass(!badP.length, 'lintPulls: ' + badP.join('; ')); }
pass(L.ents.filter(e => e.t === 'check').length === CW3.checks.length && CW3.checks.length === 6, 'START + six shrines on 980 columns (one per area exam, at the 200-route-tile cap; master: 10 on 612): ' + L.ents.filter(e => e.t === 'check').map(e => e.x).join(' '));
pass(L.ents.filter(e => e.t === 'silver').length === 3, 'three silvers, one an act (save bits)');
pass((L.ambushes || []).map(a => a.name).join('|') === 'THE DROWNED CHAPEL', 'one ambush room (the island chapel)');
pass(L.ents.some(e => e.elite && e.t === 'tideguard' && e.x === 556 && e.gate === 564), 'the gated elite holds the lee (gate 564)');
pass(!L.ents.some(e => e.x <= CW3.END && ['crab', 'tidecrab'].includes(e.t)), 'no tide crab on the new road (master\'s tidecrab skin reads master\'s CT, which this road does not run)');
pass(L.causeTide === undefined && !L.tidegates, 'master\'s road tide (CT) is not run: the kit has the sea');
pass(L.arena.boss === 'kraken' && L.arena.x1 === (610 + CW3.OFF) * TS && L.arena.wallL === 565 + CW3.OFF, 'THE KRAKEN\'s reach at its shifted columns');
pass(L.ents.some(e => e.t === 'kraken' && e.x === 604 + CW3.OFF) && L.ents.filter(e => e.t === 'knell' && e.x > CW3.END).length === 2, 'the Kraken and his two knell bells, shifted');
pass(L.pools.some(p => p.krakenSea && p.x0 === (566 + CW3.OFF) * TS), 'his sea, shifted');
{ const src = (await import('node:fs')).readFileSync(resolve(ROOT, 'src/main.js'), 'utf8');
  pass(/const krkCol = c => c \+ \(L && L\.arena \? Math\.round\(L\.arena\.x1 \/ TS\) - 610 : 0\)/.test(src) && (src.match(/krkCol\(KRK_TIDE_AT/g) || []).length === 3, 'main.js reads KRK_TIDE_AT through krkCol (3 uses): his tide sections follow the reach'); }
for (const [name, tb] of Object.entries(CW3_TABLES)) pass(tb !== undefined, 'table row ' + name);

/* ---------- 3. THE STORM BUILDS ---------- */
const tideT = id => L.cw3Tides.find(t => t.id === id);
for (const a of CW3.acts) { const t = tideT(a.id), sum = Object.values(t.cycle).reduce((s, v) => s + v, 0) / t.rate; pass(Math.abs(sum - a.every) < 0.05, a.id + ' turns every ' + sum.toFixed(1) + ' s');
  for (const ph of ['warn', 'turn']) pass(t.cycle[ph] / t.rate >= 1.5 - 1e-9, a.id + ' ' + ph + ' tell ' + (t.cycle[ph] / t.rate).toFixed(2) + ' s >= 1.5'); }
pass(tideT('act1').hi === 24 && tideT('act2').hi === 20 && tideT('act3').hi === 20, 'act I\'s sea fills the cuts only; acts II and III come over the road');
pass(L.darkZones.length === 2 && L.darkZones[1].dark > L.darkZones[0].dark && L.darkZones.every(z => z.storm), 'dusk over act II, night over act III (lightning lifts it)');
pass(L.storm2 && L.storm2.zones[0][0] >= 594 * TS && L.storm2.zones[0][1] <= 767 * TS, 'told lightning over act III\'s dark mile and the last bell (not over THE COLLAPSE)');

/* ---------- 4. THE VERBS ARE REQUIRED ---------- */
/* a kit run of one tide: the longest stretch its line is under `row` (the stones dry) - natural, and after a sluice struck at high water */
function dryWindows(id, row, sluiceAt) {
  const K = tideInit({ tides: [tideT(id)], pools: [] }); const S = K.tides[0], dt = 1 / 60; let best = 0, run = 0, struck = false;
  for (let t = 0; t < 120; t += dt) {
    if (sluiceAt && !struck && S.ph === 'high') { struck = true; run = 0; best = 0; const v = S.verbs.find(q => q.t === 'sluice'); tideStrike(K, { l: v.x * TS, r: v.x * TS + 16, t: (v.y + 1) * TS - 20, b: (v.y + 1) * TS - 6 }); }
    tideStep(K, dt); const dry = lineY(K, id) > row * TS;
    if (dry) { run += dt; best = Math.max(best, run); } else { run = 0; if (sluiceAt && struck && best > 0) break; }
  }
  return best;
}
const run = h => MOVE.RUN * HERO_RUN[h].ground, fastest = Math.max(...HERO_MOVE_IDS.map(run)) * (1 + MOVE.SPRINT_BONUS), slowest = Math.min(...HERO_MOVE_IDS.map(run));
for (const [id, x0, x1, label] of [['race1', 103, 144, 'THE STONES (act I)'], ['last', 703, 759, 'THE LAST BELL (act III)']]) {
  const walk = (x1 - x0) * TS, nat = dryWindows(id, 28, false), held = dryWindows(id, 28, true);
  pass(nat < walk / fastest, label + ': its own dry window ' + nat.toFixed(1) + ' s < the fastest walk ' + (walk / fastest).toFixed(1) + ' s (the sluice is required)');
  pass(held > walk / slowest * 1.25, label + ': the sluice\'s dry window ' + held.toFixed(1) + ' s > the slowest walk with its hops ' + (walk / slowest * 1.25).toFixed(1) + ' s');
}
/* the rips: a swimmer cannot cross (grip over a swim), and each leaves him at a near bank's rungs */
for (const id of ['rip1', 'rip3']) { const f = L.cw3Pulls.find(p => p.id === id); pass(classOf(f) === 'rip' && f.dir[0] < 0, id + ': a rip (' + f.strength + ' px/s) back to the near bank');
  const x = f.box[0]; pass(at(x, 26) === T.NET && at(x - 1, 26) === T.SOLID, id + ': the near bank\'s rungs at ' + x); }
/* THE BOATS: at high water a hop under the sea wall; at low water far below it */
const jumpH = (MOVE.JUMPV * MOVE.JUMPV - MOVE.APEX_VY * MOVE.APEX_VY) / (2 * MOVE.GRAV) + MOVE.APEX_VY * MOVE.APEX_VY / (2 * MOVE.GRAV * MOVE.APEX_G);
for (const [tid, fid, wallX, wallTop] of [['act1', 'b1', 176, 21], ['last', 'b3', 767, 17]]) {
  const T0 = tideT(tid), f = T0.floats.find(q => q.id === fid), deckAt = k => Math.max(f.top * TS, Math.min(f.y * TS, (T0.lo + (T0.hi - T0.lo) * k) * TS - f.free));
  pass(f.x1 === wallX - 1, fid + ' lies against the sea wall');
  pass(deckAt(1) - wallTop * TS < jumpH - 4, fid + ': at high water her deck is ' + (deckAt(1) - wallTop * TS).toFixed(0) + ' px under the wall top (a jump: ' + jumpH.toFixed(0) + ')');
  pass(deckAt(0) - wallTop * TS > jumpH + 40, fid + ': at low water ' + (deckAt(0) - wallTop * TS).toFixed(0) + ' px under it (no way up)'); }
{ const cove = 160; pass(CW3.R * TS - 21 * TS < jumpH + 1 ? at(cove - 1, CW3.R) === T.SOLID && cove < 176 - 10 : true, 'the cove keeps the road ' + (176 - cove) + ' columns off the sea wall: the wall is met only from the cove'); }
/* THE CANNON: the fallen tower is 18 rows; its hole is the way */
{ const gun = L.ents.find(e => e.t === 'cannon'); pass(gun && gun.hole && gun.hole[0] === 240 && at(243, 18) === T.SOLID && at(243, 6) === T.SOLID, 'the gun\'s hole is the only way through the fallen toll tower (18 rows of it)'); }
/* THE RIGGING: her shrouds' lowest rung is out of reach from the road, a leap from high water's surface */
{ let lo = 0; for (let y = 0; y < 30; y++) if (at(314, y) === T.NET) lo = y; const headFromRoad = CW3.R * TS - jumpH - MOVE.BODY_H;
  pass(headFromRoad > (lo + 1) * TS, 'the shrouds (lowest rung row ' + lo + ') are out of reach from the road: head at ' + headFromRoad.toFixed(0) + ' px > ' + (lo + 1) * TS);
  pass(CW3.HI * TS - (lo + 1) * TS <= 3 * TS, 'the shrouds hang ' + (CW3.HI - lo - 1) + ' rows over high water\'s surface (a swimmer\'s leap)'); }
/* THE FLOODGATE: the door is ten rows over the floor (drained: no way up); flooded the water stands at its sill */
{ const C = tideT('crypt'), doorY = 27, floorY = 39; pass(at(433, doorY) === T.AIR && at(432, doorY) === T.AIR && floorY - doorY >= 8, 'the undercroft\'s door is ' + (floorY - doorY) + ' rows over its floor');
  pass(C.hi <= doorY && C.mode === 'manual' && C.verbs[0].t === 'lever', 'flooded, the water stands at the door; a kit LEVER chamber (its mark survives a death)'); }
/* THE SEA ARCH: breath between air bells - with the flood and at slack inside a breath; against the ebb not (hold the ring) */
{ const A = CW3.arch, cap = breathCapacity(L), seg = Math.max(A.posts[0] - A.x0, ...A.posts.slice(1).map((p, i) => p - A.posts[i]), A.x1 - A.posts[A.posts.length - 1]) * TS;
  const with_ = seg / (96 + A.strength), slack = seg / 96, against = seg / (96 - A.strength);
  pass(with_ < cap * 0.6 && slack < cap, 'the arch: the longest stretch between airs ' + (seg / TS) + ' cols - ' + with_.toFixed(1) + ' s with the flood, ' + slack.toFixed(1) + ' s at slack (breath ' + cap + ' s)');
  pass(against > cap, 'against the ebb it is ' + against.toFixed(1) + ' s (out of breath): hold the ring at an air bell and wait for the flood');
  const f = L.cw3Pulls.find(p => p.id === 'arch'); pass(classOf(f) === 'strong' && f.posts.length === 3 && f.tide === 'act2', 'the arch current is STRONG (swimmable), signed by act II\'s tide, with a ring at each air bell');
  for (const x of A.posts) pass((L.airRooms || []).some(([a, b, y0, y1]) => x >= a && x <= b && y0 <= 26 && y1 >= 27), 'an air bell (L.airRooms) at the ring ' + x); }
/* THE LAMPS: the gate stands until its lamp is lit */
{ const g = CW3.lampGate; pass(at(g.col, 23) === T.PORT && at(g.col, 0) === T.PORT && L.ents.some(e => e.t === 'lantern' && e.x === g.lamp && e.dark), 'THE PILGRIMS\' GATE (col ' + g.col + ') shut, its storm lamp dark');
  pass(L.reachDoors.some(d => d.x0 === g.col), 'the reach model opens it (the rule: a lit lamp)'); }

/* ---------- 5. THE COLLAPSE: fair for the slowest hero, and the sea takes one who stops ---------- */
{ const C = CW3.chase, gaps = 3, hop = 0.35, span = (C.x1 - C.trigger) * TS;
  for (const h of HERO_MOVE_IDS) { const t = span / run(h) + gaps * hop, front = (span - (C.smash[1] + 1 - C.trigger) * TS) / C.speed + C.crack + CW3.arms.tell;
    pass(front - t >= 6, 'THE COLLAPSE, ' + h + ': runs it in ' + t.toFixed(1) + ' s, the road behind him lasts ' + front.toFixed(1) + ' s (' + (front - t).toFixed(1) + ' s spare)'); }
  pass(C.speed < slowest * 0.75, 'the front (' + C.speed + ' px/s) is under 3/4 of the slowest legs (' + slowest.toFixed(1) + ')');
  for (const [a, b] of [[831, 833], [857, 859], [881, 883]]) pass(b - a + 1 <= 3 && at(a - 1, CW3.R) === T.SOLID && at(b + 1, CW3.R) === T.SOLID, 'a 3-tile break at ' + a); }

/* ---------- 6. REACH (rides: the boats; the reach model swims the pools at their high line; the gun's hole and the lamp's gate open) ---------- */
{ const Rr = floodReach(L, T, { rides: true }), has = (x, y) => [-1, 0, 1].some(dx => [0, -1, 1, -2].some(dy => Rr.seen.has(Rr.key(x + dx, y + dy))));
  for (const c of L.ents.filter(e => e.t === 'check')) pass(has(c.x, c.y), 'reach: the shrine at ' + c.x + ',' + c.y);
  for (const s of L.ents.filter(e => e.t === 'silver')) pass(has(s.x, s.y), 'reach: the silver at ' + s.x + ',' + s.y);
  pass(has(L.arena.trigger / TS + 2, CW3.R - 1), 'reach: THE KRAKEN\'s reach'); }

/* ---------- 7. THE HANDS in a stub world ---------- */
{ const grid = L.grid.slice(); const marks = new Set(), said = [], props = [{ t: 'lantern', x: CW3.lampGate.lamp * TS + 8, y: 24 * TS, lit: false }], fell = [], opened = [];
  const Lw = { ...L, grid }, P = { x: 3 * TS, y: 18 * TS, dead: false, swim: false };
  const H = makeCauseway3Hands({ L: Lw, players: [P], hero: () => P, enemies: () => [], props: () => props, parts: () => [], marks: () => marks, poolLevel: (p, y) => { p.y = y; }, moveBody: (b, dx) => { b.x += dx; },
    holding: () => false, view: () => ({ x0: 0, y0: 0, x1: 320, y1: 180 }), VW: () => 320, VH: () => 180, number: (x, y, t) => said.push(t), burst: () => {}, shake: () => {}, damagePlayer: () => 'hit',
    asPlayer: (p, fn) => fn(), upright: p => !p.dead, openGateCol: c => opened.push(c), breakTile: (x, y) => { grid[y * L.W + x] = T.AIR; }, fallOut: (pp, why) => { fell.push(why); pp.dead = true; }, sound: () => {} });
  Lw.pools = L.pools.map(p => ({ ...p }));
  H.clear(); pass(H.on() && H.read().chase.st === 'wait', 'hands: on, THE COLLAPSE waiting');
  const step = (s, f) => { for (let t = 0; t < s; t += 1 / 60) { if (f) f(1 / 60); H.update(1 / 60); } };
  step(1); pass(H.read().tides.find(t => t.id === 'act1').ph === 'low', 'hands: act I starts at low water (the safe phase)');
  /* the sluice: struck at the stones */
  { const g0 = H.read().tides.find(t => t.id === 'race1'); H.strike({ l: 100 * TS, r: 100 * TS + 16, t: 20 * TS - 20, b: 20 * TS - 6 }); step(0.1); const g1 = H.read().tides.find(t => t.id === 'race1');
    pass(g0.ph !== 'low' && g1.held, 'hands: the stones\' sluice holds its channel out (' + g0.ph + ' -> held)'); }
  /* the floodgate: a mark */
  { H.strike({ l: 408 * TS, r: 408 * TS + 16, t: 39 * TS - 20, b: 39 * TS - 6 }); step(3); pass([...marks].some(m => /crypt:lever/.test(m)) && H.read().tides.find(t => t.id === 'crypt').k === 1, 'hands: the floodgate lever fills the undercroft, and its mark is kept'); }
  /* the lamp gate */
  { props[0].lit = true; step(0.1); pass(opened.includes(CW3.lampGate.col) && marks.has('cw3:gate:' + CW3.lampGate.col), 'hands: a lit gate lamp lifts THE PILGRIMS\' GATE (a mark)'); }
  /* an arm: told before it slams */
  { P.x = 650 * TS; P.y = 24 * TS; step(0.05); const a = H.read().arms.find(q => q.x === 652); pass(a.st === 'tell', 'hands: the arm at 652 is TOLD first (shadow + bulge)'); step(CW3.arms.tell + 0.1); pass(H.read().arms.find(q => q.x === 652).st !== 'tell', 'hands: ... then it slams'); }
  /* THE COLLAPSE: the slowest hero runs it and lives; a hero who stops is taken */
  for (const [label, speed, lives] of [['the slowest hero running', slowest, true], ['a hero who stops at 840', 0, false]]) {
    grid.set(L.grid); H.clear(); fell.length = 0; P.dead = false; P.swim = false; P.x = (CW3.chase.trigger + 1) * TS; P.y = 24 * TS;   /* (main.js's mendAll lays the road again on a respawn; here, a fresh copy) */
    let t = 0; while (t < 60 && !P.dead && H.read().chase.st !== 'done') { const dt = 1 / 60; t += dt;
      if (P.x < 840 * TS || speed > 0) P.x = Math.min((CW3.chase.x1 + 2) * TS, P.x + (speed || slowest) * dt * (P.x < 840 * TS || speed > 0 ? 1 : 0));
      const tx = Math.floor(P.x / TS), gapped = [[831, 833], [857, 859], [881, 883]].some(([a, b]) => tx >= a && tx <= b);
      if (!gapped && grid[24 * L.W + tx] === T.AIR) { P.swim = true; P.y = 32 * TS; }   /* the road went from under him */
      H.update(dt); }
    pass(lives ? !P.dead && P.x >= CW3.chase.x1 * TS : P.dead && fell[0] === 'THE SEA TAKES THE ROAD' && Math.abs(P.x / TS - 840) < 1.5, 'hands: THE COLLAPSE, ' + label + ' -> ' + (P.dead ? 'taken at ' + (P.x / TS).toFixed(0) : 'reaches the light\'s steps') + ' (front at ' + H.read().chase.front.toFixed(0) + ')'); }
  pass([805, 806, 807].every(c => grid[24 * L.W + c] === T.AIR) && grid[24 * L.W + 904] === T.SOLID, 'hands: the smash arm broke the road behind the trigger; the light steps stand'); }

console.log('causeway3: ' + ok + ' ok');
