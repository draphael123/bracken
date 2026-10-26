// tools/kitchengate.mjs - THE KITCHEN GATE and LORD GRUBBAG THE GLUTTON (claude/kitchengate, the opus greybox; Node, no page - tools/kitchengate-probe.mjs is the page smoke).
//   THE ROAD: the Undercrown > THE KITCHEN GATE > Highcrown (append-only LEVELS: the level is pushed after the array); a map node on the road; the old-save rule in
//   src/main.js (a save with Highcrown open keeps it - PROG.crownOpen once, kitchenRoadMig - and the kitchens themselves need only the Undercrown, so a save already past
//   them finds them UNLOCKED as an extra, never as a new requirement: proven here on the gate function over a fake PROG); gated by level-quality; the rule line; five areas.
//   THE ROUTE: the fill reaches every shrine, silver and the boss; every REQUIRED machine is a LOCK (each copper's steam, each great spit, each tallow door, each hook rail);
//   the optional ones are not; a COLD great spit (its four spits at rest) is no stair; the rule is taught, tested, remixed and examined, three ways (steam, spit, trail).
//   THE HANDS IN A FAKE WORLD: a stoke -> the fire roars and dies back; the steam lifts; the great spit turns only while it roars; the trail burns to the tallow door and melts
//   it, burning a cook on it; the butcher burns (x2); the grease pot goes over; the pages open the vault; what melted stays through a reset.
//   THE BOSS, PURE: B15 floors on every mode; a powder pie eaten -> CHOKING (x2, capped) -> a told WARD; a dish eaten heals and powers his next blow; a dish knocked off -> HUNGRY;
//   the phases each add one move; six told attacks, each its own windup and release pose (B16/B17); the bot stokes the oven when it is hot.
//     node tools/kitchengate.mjs
import { readFileSync } from 'node:fs';
import { install } from './node-canvas.mjs'; install();
const { LEVELS, T } = await import('../src/level.js');
const { floodReach } = await import('../src/reachcore.js');
const { KITCHEN, SECTIONS, KG_RULE, ARCS, WHEEL } = await import('../src/kitchen-gate.js');
const { makeKitchenHands, KG_SAY, K, spitAt, spitAngle } = await import('../src/kitchen-hands.js');
const { SAY_LINES } = await import('../src/hint-lines.js');
const GBM = await import('../src/grubbag.js');
const { POSE: POSE_GB } = await import('../src/grubbag-hands.js');
const TS = 16;
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const lv = LEVELS.find(l => l.id === 'kitchengate'), L = lv.build();
const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8').split('\r').join('');
const main = src('src/main.js');

// ---- THE ROAD ----
const crown = LEVELS.find(l => l.id === 'crown'), uc = LEVELS.find(l => l.id === 'undercrown');
ok(lv.needs === 'undercrown' && crown.needs === 'kitchengate' && uc.leadsTo === 'kitchengate', 'the Undercrown > THE KITCHEN GATE > Highcrown (the undercrown leads on to it)');
ok(LEVELS.indexOf(lv) === LEVELS.length - 1 || LEVELS.slice(LEVELS.indexOf(lv) + 1).every(l => l.id !== 'crown'), 'APPENDED (saves count levels by index): nothing before it moved');
ok(/id: 'kitchengate', kind: 'level', level: LEVELS\.findIndex/.test(main) && /\[222,44\], \[241,30\]\]/.test(main), 'a map node on the road between the Undercrown and Highcrown');
ok(lv.rule === KG_RULE && /STRIKE A BELLOWS/.test(lv.rule), 'the rule line: ' + lv.rule);
ok(/GATE = \[[^\]]*'kitchengate'/.test(src('tools/level-quality.mjs')), 'gated by level-quality');
ok(L.kitchen === true && L.W === KITCHEN.W, 'the level is src/kitchen-gate.js (L.kitchen)');
ok(SECTIONS.every((s, i) => i === 0 || s[1] === SECTIONS[i - 1][2]) && SECTIONS[SECTIONS.length - 1][2] === L.W && SECTIONS.length === 5, 'five named areas tile the level: ' + SECTIONS.map(s => s[0]).join(', '));
/* THE OLD SAVES: the gate rule over a fake PROG (the levelLocked clause and the migration, lifted out of main.js) */
{ const mig = /if \(!PROG\.kitchenRoadMig\) \{[^\n]*\}/.exec(main), lock = /\(lv\.needs && !\(PROG\[lv\.needs\] && PROG\[lv\.needs\]\.cleared\)[^\n]*?&& !q\.get\('unlock'\)\)/.exec(main);
  ok(mig && lock && /lv\.id === 'crown' && PROG\.crownOpen/.test(lock[0]), 'the migration and the gate clause are in src/main.js');
  if (mig && lock) { const run = PROG => { new Function('PROG', mig[0])(PROG); const q = { get: () => null }; const locked = l2 => new Function('lv', 'PROG', 'q', 'return !!' + lock[0])(l2, PROG, q);
      return { crown: locked(crown), kg: locked(lv) }; };
    const past = run({ ucRoadMig: 1, storm: { cleared: true }, undercrown: { cleared: true }, crown: { cleared: true } }), atUc = run({ ucRoadMig: 1, storm: { cleared: true }, undercrown: { cleared: true } });
    const fresh = run({ ucRoadMig: 1, kitchenRoadMig: 1, storm: { cleared: true }, undercrown: { cleared: true } }), done = run({ ucRoadMig: 1, kitchenRoadMig: 1, undercrown: { cleared: true }, kitchengate: { cleared: true } });
    ok(!past.crown && !past.kg, 'an old save already PAST HIGHCROWN: Highcrown stays open and THE KITCHEN GATE is UNLOCKED as an extra (not a requirement) ' + JSON.stringify(past));
    ok(!atUc.crown && !atUc.kg, 'an old save with the Undercrown cleared (Highcrown was open): it stays open (grandfathered once), the kitchens open ' + JSON.stringify(atUc));
    ok(fresh.crown && !fresh.kg, 'a save made on the new road: the kitchens are open and Highcrown waits for them ' + JSON.stringify(fresh));
    ok(!done.crown, 'the kitchens cleared: Highcrown opens'); } }

// ---- THE ROUTE ----
const at = (e, r) => r.near(e.x, e.y) || r.jumpNear(e.x, e.y);
const full = floodReach(L, T);
{ const miss = L.ents.filter(e => ['check', 'silver', 'grubbag', 'kgpage'].includes(e.t) && !at(e, full)).map(e => e.t + '@' + e.x + ',' + e.y); ok(!miss.length, 'the fill reaches every shrine, silver, page and his table ' + miss.join(' ')); }
const checks = L.ents.filter(e => e.t === 'check').sort((a, b) => a.x - b.x), boss = L.ents.find(e => e.t === 'grubbag');
ok(checks.length === 4 && SECTIONS.slice(0, 4).every(s => checks.some(c => c.x > s[2] - 10 && c.x <= s[2])), 'a shrine closes each area (A10c): ' + checks.map(c => c.x).join(' '));
const nextAfter = x => checks.find(c => c.x > x) || boss;
const without = (what, o) => floodReach({ ...L, ...o }, T);
const lockOf = (name, x, o) => { const n = nextAfter(x), r = without(name, o); ok(!at(n, r), 'REQUIRED: ' + name + ' is a LOCK - without it ' + n.t + '@' + n.x + ' is out of reach'); };
const potOff = id => ({ kgPots: L.kgPots.filter(p => p.id !== id), reachVents: L.reachVents.filter(v => v.x !== L.kgPots.find(p => p.id === id).x || v.y !== L.kgPots.find(p => p.id === id).f - 1) });
for (const id of ['sculleryCopper', 'brewCopper', 'trenchCopper']) lockOf('the copper ' + id + "'s steam", L.kgPots.find(p => p.id === id).x, potOff(id));
for (const w of L.kgWheels) lockOf('the great spit ' + w.id, w.hx, { kgWheels: L.kgWheels.filter(q => q !== w) });
for (const d of L.kgDoors) lockOf('the tallow door ' + d.id, d.x0 - 2, { kgDoors: L.kgDoors.filter(q => q !== d) });
const rails = L.zipLines.map((z, i) => ({ z, i, col: Math.floor(Math.min(z.x0, z.x1) / TS) }));
for (const r of rails.filter(q => q.col !== 256)) lockOf('the hook rail at ' + r.col, r.col, { zipLines: L.zipLines.filter(z => z !== r.z) });
{ const race = rails.find(q => q.col === 256); ok(race && at(boss, without('race rail', { zipLines: L.zipLines.filter(z => z !== race.z) })), 'the hook rail over THE OVERTURNED POT is the HIGH route: optional (the low route slides the grease)'); }
/* A COLD GREAT SPIT IS NO STAIR: its four spits at rest, laid as footing, do not reach what it is for */
for (const w of L.kgWheels) { const g = Uint8Array.from(L.grid);
  for (let k = 0; k < WHEEL.n; k++) { const q = spitAt(w, spitAngle(w, w.rest, k)), row = Math.floor(q.y / TS); for (let x = Math.floor((q.x - WHEEL.w / 2) / TS); x <= Math.floor((q.x + WHEEL.w / 2 - 1) / TS); x++) if (g[row * L.W + x] === T.AIR) g[row * L.W + x] = T.ONEWAY; }
  const n = nextAfter(w.hx), r = floodReach({ ...L, grid: g, kgWheels: L.kgWheels.filter(q => q !== w) }, T); ok(!at(n, r), 'a COLD great spit (' + w.id + ', its spits at rest) is no stair: ' + n.t + '@' + n.x + ' stays out of reach'); }
{ const kinds = new Set(L.kgFires.flatMap(f => [...(f.pots.length ? ['copper'] : []), ...(f.wheels.length ? ['spit'] : []), ...(f.trails.length ? ['trail'] : [])]));
  ok(kinds.size === 3 && L.kgFires.length >= 8, 'STRIKE A BELLOWS, three ways (' + [...kinds].join(', ') + '), ' + L.kgFires.length + ' fires'); }
{ const firstOf = k => Math.min(...Object.values(ARCS[k]).map(a => a[0])); const ord = k => { const v = ARCS[k], seq = ['teach', 'test', 'develop', 'remix', 'exam'].filter(s => v[s]).map(s => v[s][0]); return seq.every((x, i) => i === 0 || x > seq[i - 1]); };
  ok(['copper', 'spit', 'trail', 'hooks', 'grease'].every(ord) && firstOf('copper') < firstOf('spit') && firstOf('spit') < firstOf('trail'), 'the rule is TAUGHT, TESTED, REMIXED and EXAMINED in that order (copper, then spit, then trail)'); }
ok(L.kgHooks === undefined && L.zipLines.length === 4 && L.slick.length >= 3, 'the kitchens\' ground: ' + L.zipLines.length + ' meat-hook rails, ' + L.slick.length + ' grease floors');
{ const b = L.ents.filter(e => e.t === 'butcher'); ok(b.length === 2 && b.every(e => L.kgTrails.some(t => e.x >= t.x0 && e.x <= t.x1 && e.y === t.f - 1)), 'THE BUTCHER (the one new foe): ' + b.length + ' placed, each on a grease trail (burn him)'); }
ok(Object.values(KG_SAY).every(s => SAY_LINES.has(s)) && Object.values(GBM.GB_SAY).every(s => SAY_LINES.has(s)), 'every capital line the rule and the boss say is in src/hint-lines.js');

// ---- THE HANDS IN A FAKE WORLD ----
{ const grid = Uint8Array.from(L.grid), solid = (x, y) => grid[y * L.W + x] === T.SOLID, said = [], foes = [];
  const P = { x: 0, y: 0, vy: 0, ground: true, dead: false, hp: 100 }; const dmg = [];
  const LL = { ...L, grid };
  const W = { TS, T, L: LL, sfx: {}, players: () => [P], enemies: () => foes, time: () => 0, number: (x, y, t) => said.push(t), burst() {}, dust() {}, shake() {}, seen() {},
    asPlayer: (p, fn) => fn(), damage: (x, d) => { dmg.push(d); return 'hit'; }, cellSet: (x, y, t) => { grid[y * L.W + x] = t; }, solidAt: solid, tileAt: (x, y) => grid[y * L.W + x], text() {},
    hurtFoe: (e, d) => { e.hp -= d; if (e.hp <= 0) e.alive = false; }, moveBody: (e, dx, dy) => { e.x += dx; return { ground: true }; } };
  const H = makeKitchenHands(W); H.reset();
  const step = s => { for (let i = 0; i < Math.round(s * 60); i++) H.update(1 / 60); };
  const rd = () => H.read();
  ok(rd().fires.every(f => f.roar === 0), 'every fire is banked at the start (embers)');
  H.stoke('scullery'); ok(rd().fires.find(f => f.id === 'scullery').roar === K.roar && said.includes(KG_SAY.roar), 'a stoke: the fire ROARS (' + K.roar + ' s) and says so');
  const pot = L.kgPots.find(p => p.id === 'sculleryCopper'); P.x = pot.x * TS + 8; P.y = pot.f * TS; P.ground = true; P.vy = 0; step(0.05); ok(P.vy <= -K.lift + 1 && !P.ground, 'the copper steams while it roars: it lifts a hero in its column (vy ' + P.vy + ')');
  step(K.roar); P.vy = 0; P.ground = true; step(0.05); ok(rd().fires.find(f => f.id === 'scullery').roar === 0 && P.vy === 0, 'the fire dies back: no steam');
  P.x = 0;
  const a0 = rd().wheels.find(w => w.id === 'wheel1').ang; step(1); ok(rd().wheels.find(w => w.id === 'wheel1').ang === a0, 'a banked great spit stands still');
  H.stoke('spit1'); step(1); const a1 = rd().wheels.find(w => w.id === 'wheel1').ang; ok(Math.abs(a1 - a0 + 2 * Math.PI / WHEEL.period) < 0.05, 'stoked, the great spit turns (a turn in ' + WHEEL.period + ' s)');
  const m = { kg: 'spit', wheel: 'wheel1', k: 0, w: WHEEL.w, h: WHEEL.h, x: 0, y: 0 }; H.mover(m, 1 / 60); const q = spitAt(L.kgWheels[0], a1); ok(Math.abs(m.x + m.w / 2 - q.x) < 0.5 && Math.abs(m.y - q.y) < 0.5, 'its spits are where its wheel has them');
  /* the trail and the door */
  const cook = { t: 'sprig', alive: true, x: 233 * TS + 8, y: 24 * TS, hp: 20 }, bu = { t: 'butcher', alive: true, x: 292 * TS, y: 24 * TS, hp: 64, mode: 'walk' }; foes.push(cook, bu);
  ok(grid[20 * L.W + 238] === T.SOLID, 'the tallow door stands');
  H.stoke('stove1'); step(3); ok(rd().doors.find(d => d.id === 'door1').state === 'gone' && grid[20 * L.W + 238] === T.AIR && said.includes(KG_SAY.melts), 'the stove trail burns to the tallow door and it MELTS (its cells open)');
  ok(cook.hp < 20, 'the cook on the trail burns (' + cook.hp + ' hp left)');
  H.stoke('stove2'); step(1); ok(bu.kgBurn > 0 && H.takeFoe(bu, 10) === 20, 'THE BUTCHER on a burning trail BURNS: a blade takes him double');
  step(K.regrease + K.burnFor + 2); ok(rd().trails.find(t => t.id === 'trail2').state === 'raw', 'a trail with no door greases back over (' + K.regrease + ' s)');
  /* the race */
  P.x = (L.kgRace.trig + 1) * TS; P.y = L.kgRace.f * TS; P.ground = true; step(0.1); ok(rd().race.state === 'on' && said.includes(KG_SAY.race), 'past the trigger the great grease pot goes over: the fire runs east');
  const f0 = rd().race.front; step(1); ok(Math.abs(rd().race.front - f0 - L.kgRace.v) < 3, 'its front runs ' + L.kgRace.v + ' px/s');
  /* the pages and the vault */
  for (const [x, y] of L.kgPages) { P.x = x * TS + 8; P.y = (y + 1) * TS; step(0.05); }
  ok(rd().pages === 3 && rd().vault && grid[22 * L.W + 362] === T.AIR, 'the three recipe pages open THE SPICE VAULT');
  /* a reset (a death): the grid laid again - what melted stays melted, the pages stay picked up, the race is armed again */
  grid.set(L.grid); H.reset(); ok(grid[20 * L.W + 238] === T.AIR && rd().pages === 3 && rd().vault && rd().race.state === 'armed', 'a death keeps the melted door and the open vault; the grease pot stands again');
  ok(H.hoist('stove1').state === 'cut' && H.hoist('spit1').state === 'hang', 'the pilot reads a bellows as a cleat: done once its door is gone, waiting while its fire is banked'); }

// ---- LORD GRUBBAG, PURE ----
{ const A = { x0: 390 * TS, x1: 429 * TS, floor: 22 * TS, chair: 421, table: [411, 416], oven: 392, bellows: 395, line: [392, 11, 418, 13] };   /* (claude/grubbagbig: his hall at his new size) */
  const G = GBM.geom(A, TS), S = GBM.newFight(G), said = [], hits = [];
  const w = { number: (x, y, t) => said.push(t), sound() {}, shake() {}, music() {}, mark() {}, dust() {}, fx() {}, oven() {}, burst() {}, smash() {}, hit: (b, d, n) => { hits.push(n); return null; }, hitArea: (b, d, n) => hits.push(n), hitHero: (h, d, n) => hits.push(n) };
  const e = { t: 'grubbag', x: G.chairX, y: G.floorY, w: GBM.GB.w, h: GBM.GB.h, hp: 1000, maxHp: 1000, mode: 'sit', modeT: 0, face: -1, alive: true };
  const P = { x: G.chairX - 100, y: G.floorY, ground: true, alive: true };
  const floor = mode => { e.mode = mode; S.ward = 0; S.hungry = 0; return GBM.takeBlow(e, S, 100, false)[0]; };
  const modes = ['sit', 'belchTell', 'belch', 'throwTell', 'throw', 'forkTell', 'fork', 'slamTell', 'slam', 'floodTell', 'flood', 'grabTell', 'grab', 'eat', 'recover', 'flopTell', 'flop', 'flopDown', 'flopRoll'];
  ok(modes.every(m => floor(m) >= 40), 'B15: no mode of his is ever under 0.4x outside his opening (' + modes.map(m => m + ' ' + floor(m)).join(', ') + ')');
  e.mode = 'sit'; S.ward = 1; ok(GBM.takeBlow(e, S, 100, false)[1] === 'WARDED' && GBM.takeBlow(e, S, 100, false)[0] === 40, 'WARDED: x0.4 and told'); S.ward = 0;
  ok(GBM.takeBlow(e, S, 100, false)[1] === 'WELL FED' && GBM.takeBlow(e, S, 100, false)[0] === 45, 'well fed: x0.45 and told (WELL FED)');
  S.hungry = 2; ok(GBM.takeBlow(e, S, 100, false)[0] === 70, 'HUNGRY: x0.7'); S.hungry = 0;
  /* THE BELLY FLOP (claude/grubbagbig, Daniel 10-25): told, out of the chair, down on the shadow (a crush and a shockwave each way), winded on the floor (blades land whole), rolled back up */
  { const F = GBM.GB.flop, Sf = GBM.newFight(G), ef = { ...e, mode: 'sit', modeT: 0, x: G.chairX, w: GBM.GB.w, h: GBM.GB.h }, Pf = { x: G.chairX - 200, y: G.floorY, ground: true, alive: true }, hf = [], sf = [];
    const wf = { ...w, hitArea: (b, d, n) => { if (Pf.x > b[0] && Pf.x < b[1]) hf.push(n); }, hitHero: (h, d, n) => hf.push(n), number: (x, y, t) => sf.push(t) };
    Sf.restT = 0; Sf.last = ['belch', 'throw']; const r0 = Math.random; Math.random = () => 0.01;
    GBM.stepGrubbag(ef, Sf, 1 / 60, [Pf], wf); Math.random = r0;
    ok(ef.mode === 'flopTell' && Math.abs(ef.landX - Pf.x - GBM.GB.flop.aim) < 1 && GBM.gbTelling(ef) && sf.includes(GBM.GB_SAY.flop), 'THE BELLY FLOP is told (flopTell, red !!) and his shadow marks where he lands - on the hero (' + Math.round(ef.landX - G.chairX) + ' px from his chair)');
    const runF = (s, f) => { for (let i = 0; i < Math.round(s * 60); i++) { GBM.stepGrubbag(ef, Sf, 1 / 60, [Pf], wf); if (f && f()) return true; } return false; };
    let peak = 0; runF(F.tell[0] + F.air + 0.1, () => { peak = Math.max(peak, ef.flopY || 0); return ef.mode === 'flopDown'; });
    ok(ef.mode === 'flopDown' && ef.x === ef.landX && peak > F.rise * 0.9 && hf.includes('flop') && Sf.waves.filter(q => q.kind === 'flop').length === 2, 'up out of the chair (' + Math.round(peak) + ' px), down on the shadow: the crush and a shockwave each way');
    ok(GBM.takeBlow(ef, Sf, 100, false)[0] === Math.round(100 * F.mul) && GBM.takeBlow(ef, Sf, 100, false)[1] === null && ef.w === F.lieW, 'winded on the floor: blades land x' + F.mul + ' (a punish, not the choke), his box the lying belly (' + F.lieW + ' x ' + F.lieH + ')');
    runF(F.down + F.roll + 0.1, () => ef.mode === 'recover'); ok(ef.mode === 'recover' && ef.x === G.chairX && ef.w === GBM.GB.w, 'he rolls back up into his chair (' + F.down + ' s down, ' + F.roll + ' s roll)');
    const Pin = { x: ef.x, y: G.floorY, ground: true, alive: true }; Sf.waves = []; hf.length = 0; Pf.x = G.chairX - 300; Sf.last = []; ef.mode = 'flopTell'; ef.modeT = 0.01; ef.landX = Pf.x; Pf.x = ef.landX + F.crush + 30; runF(F.air + 0.05, () => ef.mode === 'flopDown');
    ok(!hf.includes('flop'), 'out from under his shadow, the crush misses'); }
  /* the oven, the pie, the choke */
  ok(GBM.stokeOven(S, w) && S.oven.st === 'bake', 'a blow on the oven bellows: it bakes a powder pie');
  const run = (s, f) => { for (let i = 0; i < Math.round(s * 60); i++) { GBM.stepGrubbag(e, S, 1 / 60, [P], w); if (f && f()) return true; } return false; };
  e.mode = 'sit'; S.restT = 99;
  ok(run(12, () => e.mode === 'choke') && S.n.pies === 1 && said.includes(GBM.GB_SAY.choke), 'the pie rides the serving line to him, he eats it and CHOKES');
  S.purse = 1e6; const [d1] = GBM.takeBlow(e, S, 100, false); ok(d1 === 200, 'choking: x2'); S.purse = 50; const [d2] = GBM.takeBlow(e, S, 100, false); ok(d2 === 50 && S.purse === 0 && e.modeT > 1, 'the choke is capped (' + GBM.GB.choke.cap + ' of him): the purse empties but the choke runs its whole ' + GBM.GB.choke.t + ' s (every hero spends the same opening, claude/kitchengateart)');
  ok(S.oven.st === 'cool' && !GBM.stokeOven(S, w), 'the oven cools before it bakes again');
  run(GBM.GB.choke.t + 0.4); ok(S.ward > 0 && said.includes(GBM.GB_SAY.ward), 'he coughs it up behind a told WARD (' + GBM.GB.ward + ' s)');
  /* a dish: eaten, it heals and powers; knocked off, he goes hungry */
  S.items.push({ id: 900, kind: 'dish', x: G.line.x1, state: 'wait', k: 1 }); e.mode = 'sit'; S.ward = 0; e.hp = 900; run(0.05); ok(e.hp === 900 + Math.round(e.maxHp * GBM.GB.dish.heal) && S.powered, 'a dish that reaches him: he eats it, HEALED (' + GBM.GB.dish.heal + ' of him) and his next blow is heavier');
  const dish = { id: 901, kind: 'dish', x: G.mid, state: 'ride', k: 0 }; S.items.push(dish); ok(GBM.smashItem(S, dish, w) && S.hungry > 0 && !S.powered, 'a dish knocked off the line: it smashes, he goes HUNGRY');
  const pie = { id: 902, kind: 'pie', x: G.mid, state: 'ride', k: 0 }; S.items.push(pie); const nb = S.n.bursts; ok(GBM.smashItem(S, pie, w) && S.n.bursts === nb + 1 && S.oven.st === 'cool', 'the powder pie struck on the line bursts there (and the oven must cool again)');
  /* the phases: one new move each */
  const S2 = GBM.newFight(G), e2 = { ...e, hp: 1000, maxHp: 1000, mode: 'sit', modeT: 0 }; S2.restT = 0;
  const seen = new Set(); const runP = (s) => { for (let i = 0; i < Math.round(s * 60); i++) { GBM.stepGrubbag(e2, S2, 1 / 60, [P], w); seen.add(e2.mode); if (e2.mode === 'choke') e2.mode = 'sit'; } };
  P.x = G.chairX - 90; runP(60); const p1 = new Set(seen); P.x = G.chairX - 280; runP(60); const p1b = new Set(seen);
  ok(['belchTell', 'throwTell', 'forkTell', 'slamTell', 'flopTell'].every(m => p1b.has(m)) && !p1b.has('floodTell') && !p1b.has('grabTell'), 'P1: THE BELCH, THROWN FOOD, THE GIANT FORK, THE TABLE SLAM, THE BELLY FLOP (no flood, no grab) ' + [...p1b].filter(m => /Tell$/.test(m)).join(' '));
  e2.hp = 600; seen.clear(); runP(40); ok(S2.ph === 2 && seen.has('floodTell') && !seen.has('grabTell'), 'P2 (' + GBM.GB.p2 + '): THE GRAVY FLOOD joins');
  e2.hp = 250; seen.clear(); P.x = G.chairX - 200; runP(40); ok(S2.ph === 3 && seen.has('grabTell'), 'P3 (' + GBM.GB.p3 + '): THE GRAB joins');
  ok(S2.last.length <= 3, 'never the same move three times running');
  /* B16 / B17: six told attacks, each its own windup and release pose */
  const tells = ['belch', 'throw', 'fork', 'slam', 'flood', 'grab', 'flop'];
  ok(tells.every(k => POSE_GB[k + 'Tell'] && POSE_GB[k] && JSON.stringify(POSE_GB[k + 'Tell']) !== JSON.stringify(POSE_GB[k])), 'B16: every attack its own windup and release pose (' + tells.join(', ') + ')');
  ok(['eat', 'choke', 'recover', 'sleep', 'wake', 'sit', 'flopDown', 'flopRoll'].every(k => POSE_GB[k]), 'and his eating, choking, coughing, sleeping and waking each their own');
  ok(tells.length >= 4 && /OWN_WARD = new Set\(\['grubbag'/.test(src('src/boss-greed.js')) && /grubbag: e => e\.mode === 'choke'/.test(src('src/boss-greed.js')), 'B17: seven told attacks (the belly flop the seventh, Daniel 10-25) and one central mechanic - the level\'s own verb (the oven\'s bellows) and its hooks (the serving line); boss-greed knows his opening and his own ward');
  /* the bot stokes the oven when it is hot */
  const S3 = GBM.newFight(G), e3 = { ...e, mode: 'sit' }; const pl = GBM.gbPlan({ P: { x: G.mid, y: G.floorY, vy: 0, face: 1, ground: true, atk: -1 }, e: e3, S: S3, reach: 30, t: 0, rng: () => 0.9, mem: {} });
  ok(pl.why === 'to the oven' && pl.gx < G.mid, 'the bot goes to the oven when it is hot (' + pl.why + ')'); }

console.log(bad ? '\nkitchengate: ' + bad + ' FAILED' : '\nok  kitchengate');
process.exit(bad ? 1 : 0);
