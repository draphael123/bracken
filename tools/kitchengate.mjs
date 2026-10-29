// tools/kitchengate.mjs - THE KITCHEN GATE and LORD GRUBBAG THE GLUTTON (claude/kitchengate, the opus greybox; Node, no page - tools/kitchengate-probe.mjs is the page smoke).
//   THE ROAD: the Undercrown > THE KITCHEN GATE > Highcrown (append-only LEVELS: the level is pushed after the array); a map node on the road; the old-save rule in
//   src/main.js (a save with Highcrown open keeps it - PROG.crownOpen once, kitchenRoadMig - and the kitchens themselves need only the Undercrown, so a save already past
//   them finds them UNLOCKED as an extra, never as a new requirement: proven here on the gate function over a fake PROG); gated by level-quality; the rule line; five areas.
//   THE ROUTE: the fill reaches every shrine, silver and the boss; every REQUIRED machine is a LOCK (each copper's steam, each great spit, each tallow door, each hook rail);
//   the optional ones are not; a COLD great spit (its four spits at rest) is no stair; the rule is taught, tested, remixed and examined, three ways (steam, spit, trail).
//   THE HANDS IN A FAKE WORLD: a stoke -> the fire roars and dies back; the steam lifts; the great spit turns only while it roars; the trail burns to the tallow door and melts
//   it, burning a cook on it; the butcher burns (x2); the grease pot goes over; the pages open the vault; what melted stays through a reset.
//   THE BOSS, PURE (claude/kitchengate2 rework): seated (never moves); B15 floors; THE SERVING LINE - a dish heals (capped), knocked off -> HUNGRY; a bomb fizzes on the slow line, batted it reaches him -> STUNNED; a chilli -> TOO HOT;
//   the lob lands on your platform, the fling at your height; P1 four moves, P2 grease + bell (attendants), P3 grab - seven told, each its own poses (B16/B17); the bot reads the line.
//     node tools/kitchengate.mjs
import { readFileSync } from 'node:fs';
import { install } from './node-canvas.mjs'; install();
const { LEVELS, T } = await import('../src/level.js');
const { floodReach } = await import('../src/reachcore.js');
const { KITCHEN, SECTIONS, KG_RULE, ARCS, WHEEL, oldCol, KG_INS } = await import('../src/kitchen-gate.js');
const { flyHop, hopWindow } = await import('./kg-hop.mjs');   /* (claude/kitchengate3) THE HOOK-TO-HOOK HOP, flown in Node */
const { HERO_MOVE_IDS } = await import('../src/hero-move.js');
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
ok(SECTIONS.every((s, i) => i === 0 || s[1] === SECTIONS[i - 1][2]) && SECTIONS[SECTIONS.length - 1][2] === L.W && SECTIONS.length === 7, 'seven named areas tile the level (claude/kitchengate3: THE HANGING LARDER and THE CARVERY let in): ' + SECTIONS.map(s => s[0]).join(', '));
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
ok(checks.length === 4 && ['THE UNDERCELLARS', 'THE SPIT HALL', 'THE GREASE KITCHENS', 'THE FEAST HALL'].map(n => SECTIONS.find(s => s[0] === n)).every(s => checks.some(c => c.x > s[2] - 10 && c.x <= s[2])), 'a shrine closes each old area (A10c; the larder and the carvery share the spans either side - no new shrine): ' + checks.map(c => c.x).join(' '));
const nextAfter = x => checks.find(c => c.x > x) || boss;
const without = (what, o) => floodReach({ ...L, ...o }, T);
const lockOf = (name, x, o) => { const n = nextAfter(x), r = without(name, o); ok(!at(n, r), 'REQUIRED: ' + name + ' is a LOCK - without it ' + n.t + '@' + n.x + ' is out of reach'); };
const potOff = id => ({ kgPots: L.kgPots.filter(p => p.id !== id), reachVents: L.reachVents.filter(v => v.x !== L.kgPots.find(p => p.id === id).x || v.y !== L.kgPots.find(p => p.id === id).f - 1) });
for (const id of ['sculleryCopper', 'brewCopper', 'trenchCopper']) lockOf('the copper ' + id + "'s steam", L.kgPots.find(p => p.id === id).x, potOff(id));
for (const w of L.kgWheels) lockOf('the great spit ' + w.id, w.hx, { kgWheels: L.kgWheels.filter(q => q !== w) });
for (const d of L.kgDoors) lockOf('the tallow door ' + d.id, d.x0 - 2, { kgDoors: L.kgDoors.filter(q => q !== d) });
const rails = L.zipLines.map((z, i) => ({ z, i, col: Math.floor(Math.min(z.x0, z.x1) / TS) }));
for (const r of rails.filter(q => !q.z.race)) lockOf('the hook rail at ' + r.col + (r.z.haul ? ' (a HAUL LINE)' : r.z.hop ? ' (a hand-off)' : ''), r.col, { zipLines: L.zipLines.filter(z => z !== r.z) });
{ const race = rails.find(q => q.z.race); ok(race && at(boss, without('race rail', { zipLines: L.zipLines.filter(z => z !== race.z) })), 'the hook rail over THE OVERTURNED POT is the HIGH route: optional (the low route slides the grease)'); }
/* A COLD GREAT SPIT IS NO STAIR: its four spits at rest, laid as footing, do not reach what it is for */
for (const w of L.kgWheels) { const g = Uint8Array.from(L.grid);
  for (let k = 0; k < WHEEL.n; k++) { const q = spitAt(w, spitAngle(w, w.rest, k)), row = Math.floor(q.y / TS); for (let x = Math.floor((q.x - WHEEL.w / 2) / TS); x <= Math.floor((q.x + WHEEL.w / 2 - 1) / TS); x++) if (g[row * L.W + x] === T.AIR) g[row * L.W + x] = T.ONEWAY; }
  const n = nextAfter(w.hx), r = floodReach({ ...L, grid: g, kgWheels: L.kgWheels.filter(q => q !== w) }, T); ok(!at(n, r), 'a COLD great spit (' + w.id + ', its spits at rest) is no stair: ' + n.t + '@' + n.x + ' stays out of reach'); }
{ const kinds = new Set(L.kgFires.flatMap(f => [...(f.pots.length ? ['copper'] : []), ...(f.wheels.length ? ['spit'] : []), ...(f.trails.length ? ['trail'] : [])]));
  ok(kinds.size === 3 && L.kgFires.length >= 8, 'STRIKE A BELLOWS, three ways (' + [...kinds].join(', ') + '), ' + L.kgFires.length + ' fires'); }
{ const firstOf = k => Math.min(...Object.values(ARCS[k]).map(a => a[0])); const ord = k => { const v = ARCS[k], seq = ['teach', 'test', 'develop', 'remix', 'exam'].filter(s => v[s]).map(s => v[s][0]); return seq.every((x, i) => i === 0 || x > seq[i - 1]); };
  ok(['copper', 'spit', 'trail', 'hooks', 'grease'].every(ord) && firstOf('copper') < firstOf('spit') && firstOf('spit') < firstOf('trail'), 'the rule is TAUGHT, TESTED, REMIXED and EXAMINED in that order (copper, then spit, then trail)'); }
ok(L.kgHooks === undefined && L.zipLines.length >= 4 && L.slick.length >= 3, 'the kitchens\' ground: ' + L.zipLines.length + ' meat-hook rails, ' + L.slick.length + ' grease floors');
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
  const cook = { t: 'sprig', alive: true, x: oldCol(233) * TS + 8, y: 24 * TS, hp: 20 }, bu = { t: 'butcher', alive: true, x: oldCol(292) * TS, y: 24 * TS, hp: 64, mode: 'walk' }; foes.push(cook, bu);
  const D1 = L.kgDoors.find(d => d.id === 'door1').x0;
  ok(grid[20 * L.W + D1] === T.SOLID, 'the tallow door stands');
  H.stoke('stove1'); step(3); ok(rd().doors.find(d => d.id === 'door1').state === 'gone' && grid[20 * L.W + D1] === T.AIR && said.includes(KG_SAY.melts), 'the stove trail burns to the tallow door and it MELTS (its cells open)');
  ok(cook.hp < 20, 'the cook on the trail burns (' + cook.hp + ' hp left)');
  H.stoke('stove2'); step(1); ok(bu.kgBurn > 0 && H.takeFoe(bu, 10) === 20, 'THE BUTCHER on a burning trail BURNS: a blade takes him double');
  step(K.regrease + K.burnFor + 2); ok(rd().trails.find(t => t.id === 'trail2').state === 'raw', 'a trail with no door greases back over (' + K.regrease + ' s)');
  /* the race */
  P.x = (L.kgRace.trig + 1) * TS; P.y = L.kgRace.f * TS; P.ground = true; step(0.1); ok(rd().race.state === 'on' && said.includes(KG_SAY.race), 'past the trigger the great grease pot goes over: the fire runs east');
  const f0 = rd().race.front; step(1); ok(Math.abs(rd().race.front - f0 - L.kgRace.v) < 3, 'its front runs ' + L.kgRace.v + ' px/s');
  /* the pages and the vault */
  for (const [x, y] of L.kgPages) { P.x = x * TS + 8; P.y = (y + 1) * TS; step(0.05); }
  ok(rd().pages === 3 && rd().vault && grid[22 * L.W + L.kgVault.x0] === T.AIR, 'the three recipe pages open THE SPICE VAULT');
  /* a reset (a death): the grid laid again - what melted stays melted, the pages stay picked up, the race is armed again */
  grid.set(L.grid); H.reset(); ok(grid[20 * L.W + D1] === T.AIR && rd().pages === 3 && rd().vault && rd().race.state === 'armed', 'a death keeps the melted door and the open vault; the grease pot stands again');
  ok(H.hoist('stove1').state === 'cut' && H.hoist('spit1').state === 'hang', 'the pilot reads a bellows as a cleat: done once its door is gone, waiting while its fire is banked');
  /* (claude/kitchengate2) THE SERVING LINES, THE STOVE FLARES, THE ATTENDANT */
  { const B = id => L.kgBelts.find(b => b.id === id), rb = id => rd().belts.find(b => b.id === id);
    const cl = B('cellarLine'); P.x = (cl.x0 + 2) * TS; P.y = cl.f * TS; P.ground = true; P.vy = 0; const xa = P.x; step(1); ok(P.x - xa > cl.v * 0.8, 'a serving line carries a hero standing on it (' + Math.round(P.x - xa) + ' px in 1 s, east)');
    const fl = B('farLine'); P.x = (fl.x0 + 6) * TS; P.y = fl.f * TS; const xb = P.x; step(1); ok(xb - P.x > fl.v * 0.8, 'the spit hall\'s far line runs WEST, back toward the trench (' + Math.round(xb - P.x) + ' px)');
    P.x = 0; P.y = 0; step(4); ok(rb('cellarLine').items.length >= 1 && rb('cellarLine').items.every(q => q.kind === 'dish'), 'dishes ride the cellar line (TEACH: dishes only, nothing to hurt you)');
    const it = rb('cellarLine').items.find(q => q.state === 'ride'); P.x = it.x - 20; P.y = cl.f * TS; const n0 = rd().n.knocked; H.strike({ l: it.x - 6, r: it.x + 6, t: cl.f * TS - 14, b: cl.f * TS });
    ok(rd().n.knocked === n0 + 1 && rb('cellarLine').items.some(q => q.state === 'fall'), 'a blow knocks a dish off the line');
    P.x = 0; P.y = 0; const tc = B('trailCounter'); let bomb = null; for (let i = 0; i < 60 * 14 && !bomb; i++) { H.update(1 / 60); bomb = rb('trailCounter').items.find(q => q.kind === 'bomb' && q.state === 'ride'); }
    ok(!!bomb, 'bombs ride the trail counter (the remix: every ' + tc.bomb + 'rd item)');
    H.strike({ l: bomb.x - 6, r: bomb.x + 6, t: tc.f * TS - 14, b: tc.f * TS }); ok(rb('trailCounter').items.some(q => q.kind === 'bomb' && q.state === 'bat'), 'a blow BATS a bomb along the line');
    const nf = rd().n.fizz; for (let i = 0; i < 60 * 16 && rd().n.fizz === nf; i++) H.update(1 / 60); ok(rd().n.fizz > nf, 'a bomb left alone goes off ON the line (its fuse ' + K.line.fuse + ' s, the counter ' + ((tc.x1 - tc.x0 + 1) * TS / tc.v).toFixed(1) + ' s long)');
    const seenSt = new Set(); for (let i = 0; i < 60 * 3; i++) { H.update(1 / 60); seenSt.add(H.flareState('vaultGriddle')); } ok(['glow', 'flame', 'out'].every(q => seenSt.has(q)), 'a stove flare runs its rhythm: glow (the tell), flame, out');
    const vg = L.kgFlares.find(f => f.id === 'vaultGriddle'); P.x = (vg.x0 + 1) * TS + 8; P.y = vg.f * TS; P.ground = true; const d0 = dmg.length; let flamed = false; for (let i = 0; i < 60 * 3; i++) { H.update(1 / 60); if (H.flareState('vaultGriddle') === 'flame') flamed = true; }
    ok(flamed && dmg.length > d0, 'standing in it as it flares burns'); P.x = (vg.x0 - 3) * TS; const d1 = dmg.length; step(3); ok(dmg.length === d1, 'off the griddle, nothing');
    ok(L.kgBelts.length >= 4 && L.kgFlares.length >= 4 && ['teach', 'test', 'remix', 'exam'].every(k => ARCS.belt[k]) && ['teach', 'test', 'exam'].every(k => ARCS.flare[k]), 'THE SERVING LINES taught, tested, remixed, examined (' + L.kgBelts.map(b => b.id).join(', ') + '); THE STOVE FLARES taught, tested, examined (' + L.kgFlares.length + ')');
    ok(L.zipLines.every(z => z.meat && (z.dir === 1 || z.dir === -1)), 'every hook rail is a chain-driven MEAT-HOOK RAIL: it runs one way (hold on to ride, jump to let go)');
    ok(L.kgProps.length >= 20 && new Set(L.kgProps.map(p => p.kind)).size >= 8, 'the kitchen\'s dressing: ' + L.kgProps.length + ' props of ' + new Set(L.kgProps.map(p => p.kind)).size + ' kinds (ovens, spice racks, flour, blocks, vents, basins, hatches, pans)');
    /* THE ATTENDANT: a plate thrown in an arc onto where you stand; his tray turns a blow from the front */
    const at = { t: 'attendant', alive: true, x: oldCol(240) * TS, y: 24 * TS, w: 10, h: 18, hp: 30, mode: 'walk', modeT: 0, face: -1, vx: 0, vy: 0 }; foes.push(at);
    P.x = oldCol(240) * TS - 120; P.y = 24 * TS; P.ground = true; P.face = 1; P.atk = -1; const d2 = dmg.length; let aimed = false; for (let i = 0; i < 60 * 3; i++) { H.attendant(at, 1 / 60); if (at.mode === 'aim') aimed = true; }
    ok(aimed, 'THE ATTENDANT aims a plate (a yellow !) at range'); ok(dmg.length > d2, 'the plate lands on the ring where you stood');
    P.x = at.x - 24; P.atk = 0.1; at.mode = 'walk'; at.kgGcd = 0; H.attendant(at, 1 / 60); ok(at.mode === 'guard' && H.takeFoe(at, 10) === 0, 'close in and he raises his TRAY: a blow from the front is turned');
    P.x = at.x + 20; ok(H.takeFoe(at, 10) === 10, 'from behind it lands');
    P.x = at.x - 24; at.modeT = 0.001; H.attendant(at, 1 / 60); ok(at.mode === 'bashTell', 'then he swings it (told)'); foes.length = 0; }
}

// ---- (claude/kitchengate3, Daniel 10-29) THE LEVEL, LONGER: THE HANGING LARDER and THE CARVERY, THE HOOK-TO-HOOK HOP, THE HAUL LINE, THE FLUE ----
{ ok(KG_INS.length === 2 && L.W === oldCol(432) && L.arena.x0 === oldCol(390) * TS && L.arena.x1 === (oldCol(428) + 1) * TS, 'two rooms let in (' + KG_INS.map(q => q[1] + ' columns before old ' + q[0]).join(', ') + '): the level is ' + L.W + ' wide; HIS HALL is the old one moved whole (' + L.arena.x0 / TS + '-' + (L.arena.x1 / TS - 1) + ')');
  const hand = L.zipLines.filter(z => z.hop && z.hand), hauls = L.zipLines.filter(z => z.haul);
  ok(hand.length >= 5 && hauls.length >= 2, hand.length + ' hand-off rails (the hop), ' + hauls.length + ' haul lines (a chain that runs uphill)');
  ok(hauls.every(z => { const dy = z.y1 - z.y0, dx = z.x1 - z.x0, down = dy > 0 ? Math.sign(dx) : -Math.sign(dx); return z.dir === -down; }), 'every HAUL LINE runs UPHILL (src/zipline.js dir against its slope): it hauls you up');
  /* THE HOP, FLOWN FOR EVERY HERO'S LEGS: from the middle of the red stretch he catches the rail it hands to (holding on the way it runs, or nothing); riding on to the END never does (the hop is the
     only way), and every point of the red stretch catches */
  for (const z of hand) { const col = Math.round((z.x0 - 8) / TS), lo = Math.min(...z.hop), hi = Math.max(...z.hop), mid = (lo + hi) / 2, bad = [];
    for (const hero of HERO_MOVE_IDS) for (const hold of [z.dir, 0]) {
      const r = flyHop(L.zipLines, z, z.dir > 0 ? Math.min(z.x0, z.x1) + 8 : Math.max(z.x0, z.x1) - 8, mid, { hero, hold }); if (r.caught !== z.hand) bad.push(hero + '/' + hold + ' mid:' + (r.fail || 'other rail'));
      const e = flyHop(L.zipLines, z, z.dir > 0 ? Math.min(z.x0, z.x1) + 8 : Math.max(z.x0, z.x1) - 8, null, { hero, hold }); if (e.caught === z.hand) bad.push(hero + '/' + hold + ' end catches it');
      for (const hx of [lo, hi]) { const q = flyHop(L.zipLines, z, z.dir > 0 ? Math.min(z.x0, z.x1) + 8 : Math.max(z.x0, z.x1) - 8, hx, { hero, hold }); if (q.caught !== z.hand) bad.push(hero + '/' + hold + ' at ' + ((hx - 8) / TS).toFixed(1)); } }
    ok(!bad.length, 'THE HAND-OFF at column ' + col + ' (red ' + ((lo - 8) / TS).toFixed(1) + '-' + ((hi - 8) / TS).toFixed(1) + '): every hero, every point of the red stretch, takes the next rail; riding to the end drops him ' + bad.slice(0, 4).join(' ')); }
  { const w = hopWindow(L.zipLines, hand[0], hand[0].hand, { hero: 'knight', hold: 1 }); ok(w.xs.length * 2 / 200 >= 0.18, 'the teach hand-off\'s window is a fair read: ' + (w.xs.length * 2 / 200).toFixed(2) + ' s at the rail\'s pace'); }
  /* THE HAUL LINE OVER THE CARVERY's SERVING LINE: its low end is in reach from the line's floor, and nowhere else is the carvery wall climbed */
  { const cb = L.kgBelts.find(b => b.id === 'carveLine'), hl = hauls.find(z => z.x0 / TS > cb.x0 && z.x0 / TS < cb.x1); ok(cb && cb.dir === -1 && cb.bomb && cb.foes && hl, 'THE CARVERY: the serving line runs AT you (west) with bombs and a cook, under THE HAUL LINE (the remix: a rail over a conveyor)'); }
  /* THE FLUE: a flare out of the coal bed under a hand-off's next rail, tall enough to take a rider off his hook; from the perch it is reached tIn..tOut s after the hook is taken (flown) */
  { const fl = L.kgFlares.find(f => f.bed === 'coals'), z = hand.find(q => q.flue), fx0 = fl.x0 * TS - 4, fx1 = (fl.x1 + 1) * TS + 4, worst = [];
    for (const hero of HERO_MOVE_IDS) { const r = flyHop(L.zipLines, z, Math.min(z.x0, z.x1) + 8, (z.hop[0] + z.hop[1]) / 2, { hero, hold: 1 }); if (r.caught !== z.hand) { worst.push(hero + ' missed'); continue; }
      const c2 = z.hand, sl = (c2.y1 - c2.y0) / (c2.x1 - c2.x0), feet = x => c2.y0 + sl * (x - c2.x0) + 12, tIn = r.t + Math.max(0, fx0 - r.at[0]) / c2.speed, tOut = r.t + (fx1 - r.at[0]) / c2.speed;
      if (tIn < z.flue.tIn - 0.12 || tOut > z.flue.tOut + 0.12) worst.push(hero + ' ' + tIn.toFixed(2) + '-' + tOut.toFixed(2));
      if (feet((fx0 + fx1) / 2) < fl.f * TS - fl.h) worst.push(hero + ' rides over the flame'); }
    ok(fl && z && !worst.length, 'THE FLUE cuts the hooks: every hero reaches it ' + z.flue.tIn + '-' + z.flue.tOut + ' s after taking the perch\'s hook, low enough for its flame (' + fl.h + ' px) to take him off ' + worst.join(' '));
    /* the read: a hook taken in the glow or the flame passes it as it dies; one taken as the flame ends meets the next */
    const ph = t => { const q = ((t + fl.phase) % fl.period + fl.period) % fl.period; return q < fl.tell ? 'glow' : q < fl.tell + fl.on ? 'flame' : 'out'; }, pass = b => { for (let t = z.flue.tIn; t <= z.flue.tOut; t += 0.02) if (ph(b + t) === 'flame') return false; return true; };
    const safe = []; for (let b = 0; b < fl.period; b += 0.05) if (pass(b)) safe.push(+b.toFixed(2));
    ok(pass(0.05) && pass(fl.tell) && !pass(fl.tell + fl.on) && safe.length * 0.05 / fl.period > 0.35 && safe.length * 0.05 / fl.period < 0.7, 'the flue\'s read: take the hook as it glows or flares (' + fl.tell + ' s) and you pass; as its flame dies (' + (fl.tell + fl.on) + ' s) you meet the next - ' + Math.round(safe.length * 0.05 / fl.period * 100) + '% of its beat is safe');
    /* the pilot's hands read it the same way (H.flueClear) - in a fake world */
    const W2 = { TS, T, L, sfx: {}, players: () => [], enemies: () => [], number() {}, burst() {}, dust() {}, shake() {}, seen() {}, asPlayer: (p, f) => f(), damage: () => 'hit', cellSet() {}, solidAt: () => false, tileAt: () => T.AIR, text() {} };
    const H2 = makeKitchenHands(W2); H2.reset(); const okAt = []; for (let i = 0; i < 60 * fl.period; i++) { H2.update(1 / 60); okAt.push(H2.flueClear(z)); }
    ok(okAt.some(Boolean) && okAt.some(q => !q), 'the pilot waits on the perch for the flue (H.flueClear: clear ' + Math.round(okAt.filter(Boolean).length / okAt.length * 100) + '% of its beat, with a margin)'); }
  /* the reach model takes the hand-off only from a rail that has one: without its red stretch the teach rail reaches no further than its own pit */
  { const t1 = hand[0], r0 = floodReach(L, T), r1 = floodReach({ ...L, zipLines: L.zipLines.map(z => z === t1 ? { ...z, hand: null, hop: null } : z) }, T), n = nextAfter(Math.round(t1.x1 / TS));
    ok(at(n, r0) && !at(n, r1), 'the reach model rides the hand-off (src/reachcore.js z.hand): with it ' + n.t + '@' + n.x + ' is reached, without it not'); }
  { const ord = k => { const v = ARCS[k], seq = ['teach', 'test', 'remix', 'exam'].filter(q => v[q]).map(q => v[q][0]); return seq.length === 4 && seq.every((x, i) => i === 0 || x > seq[i - 1]); };
    ok(ord('hop'), 'THE HOP is TAUGHT (safe), TESTED twice over coals, REMIXED (a haul line over a serving line, the flue) and EXAMINED (the hearth trench), in that order'); }
}

// ---- LORD GRUBBAG, PURE (claude/kitchengate2: REWORKED - seated, the serving line, bombs and chillies, the lob and the fling, P2 grease + bell, P3 grab) ----
{ const A = L.arena;
  const G = GBM.geom(A, TS), S = GBM.newFight(G), said = [], hits = [], spawned = [];
  const w = { number: (x, y, t) => said.push(t), sound() {}, shake() {}, music() {}, mark() {}, dust() {}, fx() {}, stove() {}, burst() {}, smash() {}, spawnAdd: (x, y) => { const a = { t: 'attendant', x, y, alive: true }; spawned.push(a); return a; },
    hit: (b, d, n) => { hits.push(n); return null; }, hitArea: (b, d, n) => hits.push(n), hitHero: (h, d, n) => hits.push(n) };
  const e = { t: 'grubbag', x: G.chairX, y: G.floorY, w: GBM.GB.w, h: GBM.GB.h, hp: 1000, maxHp: 1000, mode: 'sit', modeT: 0, face: -1, alive: true };
  const P = { x: G.chairX - 100, y: G.floorY, ground: true, alive: true };
  ok(G.belt.x1 - G.belt.x0 >= 200 && G.belt.y === G.floorY - 2 * TS && L.grid[(A.belt[2]) * L.W + A.belt[0]] === T.ONEWAY, 'THE SERVING LINE: a conveyor ' + (G.belt.x1 - G.belt.x0) + ' px long, two rows up, one-way (jump up onto it)');
  ok(G.belt.x1 < G.chairX - GBM.GB.w / 2 && G.chairX - GBM.GB.w / 2 - G.belt.x1 >= 40, 'room on the floor between the line\'s end and his belly to strike him (' + Math.round(G.chairX - GBM.GB.w / 2 - G.belt.x1) + ' px)');
  const floor = mode => { e.mode = mode; S.ward = 0; S.hungry = 0; return GBM.takeBlow(e, S, 100)[0]; };
  const modes = Object.keys(POSE_GB).filter(m => !GBM.gbOpen({ mode: m }));
  ok(modes.every(m => floor(m) >= 40), 'B15: no mode of his is ever under 0.4x outside his opening (' + modes.map(m => m + ' ' + floor(m)).join(', ') + ')');
  e.mode = 'sit'; S.ward = 1; ok(GBM.takeBlow(e, S, 100)[1] === 'WARDED' && GBM.takeBlow(e, S, 100)[0] === 40, 'WARDED: x0.4 and told'); S.ward = 0;
  ok(GBM.takeBlow(e, S, 100)[1] === 'WELL FED' && GBM.takeBlow(e, S, 100)[0] === 45, 'well fed: x0.45 and told (WELL FED)');
  S.hungry = 2; ok(GBM.takeBlow(e, S, 100)[0] === 70, 'HUNGRY: x0.7'); S.hungry = 0;
  const run = (s, f, ee = e, SS = S, PP = P) => { for (let i = 0; i < Math.round(s * 60); i++) { GBM.stepGrubbag(ee, SS, 1 / 60, [PP], w); if (f && f()) return true; } return false; };
  /* SEATED: whatever he does, he never leaves his chair or turns */
  { const S9 = GBM.newFight(G), e9 = { ...e, mode: 'sit', hp: 1000 }; S9.restT = 0; let moved = false; for (let i = 0; i < 60 * 90; i++) { GBM.stepGrubbag(e9, S9, 1 / 60, [P], w); if (e9.x !== G.chairX || e9.face !== -1) moved = true; if (i === 60 * 30) e9.hp = 600; if (i === 60 * 60) e9.hp = 250; if (GBM.gbOpen(e9)) e9.modeT = 0; }
    ok(!moved, 'SEATED: through all three phases he never leaves his chair, never turns (no belly flop, no slam)'); }
  ok(!POSE_GB.flopTell && !POSE_GB.forkTell && !POSE_GB.slamTell && !POSE_GB.floodTell && Object.values(POSE_GB).every(p => !p.fork && !p.cauldron && !p.noChair), 'no fork, no tureen, no pot in his hands, never out of the chair (Daniel 10-27: they clipped)');
  ok(Object.values(POSE_GB).every(p => p.hand[1] < -20 && p.far[1] < -20), 'every hand stays up off the floor line (no arm through the boards)');
  /* THE LINE: a dish heals (capped), a knocked-off dish -> HUNGRY; a bomb gulped -> STUNNED; a bomb's fuse on the slow line; a batted bomb; a chilli -> TOO HOT */
  e.mode = 'sit'; S.restT = 99; S.lineT = 99; S.ceil = 1000; S.healLeft = 1000 * GBM.GB.dish.cap; e.hp = 800;
  S.items.push({ id: 900, kind: 'dish', x: G.belt.x1 - 6, state: 'wait' }); run(0.05); ok(e.hp === 800 + Math.round(e.maxHp * GBM.GB.dish.heal) && said.some(s => s.includes(GBM.GB_SAY.eats)), 'a dish that reaches him: he eats it, HEALED ' + GBM.GB.dish.heal * 100 + '% (shown)');
  run(1); e.hp = 990; S.items.push({ id: 903, kind: 'dish', x: G.belt.x1 - 6, state: 'wait' }); run(0.05); ok(e.hp === 1000, 'never healed over the top of his phase');
  run(1); e.hp = 500; S.ceil = 600; S.healLeft = 0; S.items.push({ id: 904, kind: 'dish', x: G.belt.x1 - 6, state: 'wait' }); run(0.05); ok(e.hp === 500 && said.includes(GBM.GB_SAY.full), 'capped at ' + GBM.GB.dish.cap * 100 + '% a phase: past it a dish heals nothing (TOO FULL)');
  run(1); e.mode = 'sit'; S.ward = 0;
  const dish = { id: 901, kind: 'dish', x: G.belt.x0 + 60, state: 'ride' }; S.items.push(dish); ok(GBM.strikeItem(S, dish, w, dish.x - 20) && dish.state === 'fall' && S.hungry > 0, 'a dish struck on the line is KNOCKED OFF: he goes HUNGRY');
  run(2); ok(!S.items.includes(dish), 'and it falls and smashes on the floor');
  { const S4 = GBM.newFight(G), e4 = { ...e, mode: 'sit', hp: 1000 }; S4.restT = 99; S4.ceil = 1000; const bomb = { id: 1, kind: 'bomb', x: G.belt.x0 + 6, state: 'ride', fuse: GBM.GB.line.fuse }; S4.items.push(bomb); S4.lineT = 99;
    const need = (G.belt.x1 - G.belt.x0) / GBM.GB.line.v; run(need + 1, () => bomb.state === 'gone', e4, S4); ok(bomb.state === 'gone' && S4.n.fizz === 1 && hits.includes('bomb') && e4.mode !== 'stun', 'a bomb left on the slow line goes off ON THE LINE (fuse ' + GBM.GB.line.fuse + ' s, the line ' + need.toFixed(1) + ' s long): it singes, and no opening');
    const bomb2 = { id: 2, kind: 'bomb', x: G.belt.x0 + 6, state: 'ride', fuse: GBM.GB.line.fuse }; S4.items.push(bomb2); run(0.5, null, e4, S4); ok(GBM.strikeItem(S4, bomb2, w, bomb2.x - 20) && bomb2.state === 'bat', 'a blow on a bomb BATS it along the line');
    run(3, () => e4.mode === 'gulp', e4, S4); ok(e4.mode === 'gulp', 'batted, it reaches him before its fuse: he GULPS it');
    const hp0 = e4.hp; run(1, () => e4.mode === 'stun', e4, S4); ok(e4.mode === 'stun' && e4.hp < hp0 && said.includes('STUNNED') && GBM.gbOpen(e4), 'it goes off in him (-' + (hp0 - e4.hp) + ') and he is STUNNED: the opening (gold ring, timer)');
    S4.purse = 1e6; ok(GBM.takeBlow(e4, S4, 100)[0] === 200, 'stunned: x2'); S4.purse = 30; ok(GBM.takeBlow(e4, S4, 100)[0] === 45 && S4.purse === 0, 'capped (' + GBM.GB.stun.cap * 100 + '% of him an opening): past the cap a blade still lands well fed (never under the floor)');
    run(GBM.GB.stun.t + 0.6, null, e4, S4); ok(S4.ward > 0 && said.includes(GBM.GB_SAY.ward), 'he coughs it up behind a told WARD (' + GBM.GB.ward + ' s): no chain-lock (B3)');
    const b3 = { id: 3, kind: 'bomb', x: G.belt.x1 - 6, state: 'ride', fuse: 3 }; S4.items.push(b3); run(0.1, null, e4, S4); ok(b3.state === 'wait' && e4.mode !== 'gulp', 'a bomb that arrives while he is warded waits on his platter');
    run(GBM.GB.ward + GBM.GB.coughRest + 1, () => e4.mode === 'gulp', e4, S4); ok(e4.mode === 'gulp', 'and he gulps it when he is himself again'); }
  { const S5 = GBM.newFight(G), e5 = { ...e, mode: 'sit', hp: 1000 }; S5.restT = 99; S5.lineT = 99;
    ok(GBM.stokeStove(S5, w) && S5.stove.next, 'a blow on the pepper stove\'s bellows: the next item out is a RED-HOT CHILLI'); ok(!GBM.stokeStove(S5, w), 'and only once until it cools');
    S5.lineT = 0.01; run(0.05, null, e5, S5); const ch = S5.items.find(q => q.kind === 'chilli'); ok(ch && ch.state === 'ride', 'the chilli comes out of the hatch onto the line');
    run(12, () => e5.mode === 'hot', e5, S5); ok(e5.mode === 'hot' && GBM.gbOpen(e5) && said.includes(GBM.GB_SAY.hot), 'it reaches him: TOO HOT - an opening (' + GBM.GB.hot.t + ' s)');
    const c2 = { id: 9, kind: 'chilli', x: G.belt.x0 + 50, state: 'ride' }; S5.items.push(c2); ok(GBM.strikeItem(S5, c2, w, c2.x - 10) && c2.state === 'fall' && S5.n.lost === 1, 'a chilli struck is KNOCKED OFF (lost): spare the chillies'); }
  /* THE ITEMS: dishes, a bomb every few */
  { const S6 = GBM.newFight(G), e6 = { ...e, mode: 'sit', hp: 1000 }; S6.restT = 99; S6.lineT = 0; for (let i = 0; i < 60 * 40; i++) { GBM.stepGrubbag(e6, S6, 1 / 60, [P], w); for (const q of S6.items) if (q.kind === 'bomb') q.state = 'gone'; e6.mode = 'sit'; S6.restT = 99; }
    ok(S6.n.dishes >= 4 && S6.n.bombs >= 1 && S6.n.dishes > S6.n.bombs * 2, 'the line brings dishes, and a bomb every ' + GBM.GB.line.bombEvery + ' items (' + S6.n.dishes + ' dishes, ' + S6.n.bombs + ' bombs in 40 s)'); }
  /* THE THROWS: the lob lands ON the platform you stand on; the fling flies at your height */
  { const S7 = GBM.newFight(G), e7 = { ...e, mode: 'lobTell', modeT: 0.01 }, shelf = G.plats.find(p => !p.belt), Ps = { x: (shelf.x0 + shelf.x1) / 2, y: shelf.y, ground: true, alive: true };
    GBM.stepGrubbag(e7, S7, 1 / 60, [Ps], w); const c = S7.throws[0]; ok(c && c.ty === shelf.y && Math.abs(c.tx - Ps.x) < 1, 'THE HIGH LOB lands ON the shelf the hero stands on (ring at y ' + (c && c.ty) + ', the shelf ' + shelf.y + ', the floor ' + G.floorY + ')');
    let top = 1e9; for (let t = 0; t <= c.T; t += 0.02) top = Math.min(top, GBM.throwAt({ ...c, t }).y); ok(top < shelf.y - 60, 'it arcs high over the platforms (its top ' + Math.round(shelf.y - top) + ' px over the shelf)');
    const Pb = { x: G.belt.x0 + 80, y: G.belt.y, ground: true, alive: true }, S8 = GBM.newFight(G), e8 = { ...e, mode: 'flingTell', modeT: 0.01 }; GBM.stepGrubbag(e8, S8, 1 / 60, [Pb], w); const f = S8.flings[0];
    ok(f && f.ty === G.belt.y - GBM.GB.fling.lift, 'THE FLAT FLING flies at the height the hero stands at (on the line: y ' + (f && f.ty) + ')');
    const hits0 = hits.length; for (let i = 0; i < 120 && S8.flings.length; i++) GBM.stepGrubbag(e8, S8, 1 / 60, [Pb], w); ok(hits.slice(hits0).includes('fling'), 'standing, it hits');
    const S8b = GBM.newFight(G), e8b = { ...e, mode: 'flingTell', modeT: 0.01 }, Pj = { ...Pb }; GBM.stepGrubbag(e8b, S8b, 1 / 60, [Pj], w); Pj.y = G.belt.y - 30; Pj.ground = false; const hits1 = hits.length; for (let i = 0; i < 120 && S8b.flings.length; i++) GBM.stepGrubbag(e8b, S8b, 1 / 60, [Pj], w);
    ok(!hits.slice(hits1).includes('fling'), 'jumped, it goes under'); }
  /* THE PHASES: P1 lob/fling/belch/sweep; P2 + grease + bell; P3 + grab */
  const S2 = GBM.newFight(G), e2 = { ...e, hp: 1000, maxHp: 1000, mode: 'sit', modeT: 0 }; S2.restT = 0;
  const seen = new Set(); const runP = (s, PP) => { for (let i = 0; i < Math.round(s * 60); i++) { GBM.stepGrubbag(e2, S2, 1 / 60, [PP], w); seen.add(e2.mode); if (GBM.gbOpen(e2)) e2.modeT = 0; S2.items = []; S2.adds = []; } };
  runP(60, { x: G.belt.x0 + 60, y: G.belt.y, ground: true, alive: true }); runP(40, { x: G.x0 + 20, y: G.floorY, ground: true, alive: true });
  ok(['lobTell', 'flingTell', 'belchTell', 'sweepTell'].every(m => seen.has(m)) && !seen.has('greaseTell') && !seen.has('bellTell') && !seen.has('grabTell'), 'P1: THE HIGH LOB, THE FLAT FLING, THE BELCH, THE SWEEP (only at a hero on the line) ' + [...seen].filter(m => /Tell$/.test(m)).join(' '));
  e2.hp = 600; seen.clear(); runP(70, { x: G.x0 + 40, y: G.floorY, ground: true, alive: true }); ok(S2.ph === 2 && seen.has('greaseTell') && seen.has('bellTell') && !seen.has('grabTell'), 'P2 (' + GBM.GB.p2 + '): THE GREASE SPILL and THE SERVICE BELL join');
  ok(spawned.length >= 1 && S2.n.adds >= 1, 'the bell sends attendants down the line (' + S2.n.adds + ' so far, never more than ' + GBM.GB.bell.maxAdds + ' at once)');
  e2.hp = 250; seen.clear(); runP(40, { x: G.chairX - GBM.GB.w / 2 - 60, y: G.floorY, ground: true, alive: true }); ok(S2.ph === 3 && seen.has('grabTell'), 'P3 (' + GBM.GB.p3 + '): THE GRAB joins');
  /* THE GREASE: the floor burns both ways from the cauldron; up on the line you are safe */
  { const Sg = GBM.newFight(G), eg = { ...e, mode: 'greaseTell', modeT: 0.01, hp: 600 }, Pf = { x: G.x0 + 30, y: G.floorY, ground: true, alive: true }, Pl = { x: G.belt.x0 + 40, y: G.belt.y, ground: true, alive: true }, hg = [];
    Sg.restT = 99; Sg.lineT = 99; const wg = { ...w, hitHero: (h, d, n) => hg.push(h.x === Pf.x ? 'floor' : 'line') }; for (let i = 0; i < 60 * 5; i++) { GBM.stepGrubbag(eg, Sg, 1 / 60, [Pf, Pl], wg); Sg.restT = 99; }
    ok(hg.includes('floor') && !hg.includes('line'), 'THE GREASE SPILL: the burning wave reaches the far end of the floor; a hero up on the line is safe'); }
  /* B16 / B17 */
  const tells = GBM.MOVES;
  ok(tells.length >= 7 && tells.every(k => POSE_GB[k + 'Tell'] && POSE_GB[k] && JSON.stringify(POSE_GB[k + 'Tell']) !== JSON.stringify(POSE_GB[k])), 'B16/B17: seven told attacks, each its own windup and release pose (' + tells.join(', ') + ')');
  ok(['eat', 'gulp', 'stun', 'hot', 'recover', 'sleep', 'wake', 'sit'].every(k => POSE_GB[k]), 'and his eating, gulping, stunned, too hot, coughing, sleeping and waking each their own');
  ok(/OWN_WARD = new Set\(\['grubbag'/.test(src('src/boss-greed.js')) && /grubbag: e => e\.mode === 'stun' \|\| e\.mode === 'hot'/.test(src('src/boss-greed.js')), 'boss-greed knows his openings and his own ward');
  /* THE BOT reads the line: it goes for a dish, bats a bomb, spares a chilli, stokes the stove when it is hot */
  { const pl = (S0, items, Pp) => { S0.items = items; return GBM.gbPlan({ P: { x: G.belt.x0 + 30, y: G.floorY, vy: 0, face: 1, ground: true, atk: -1, ...Pp }, e: { ...e, mode: 'sit' }, S: S0, reach: 30, t: 1, rng: () => 0.9, mem: {} }); };
    const S3 = GBM.newFight(G); S3.stove.st = 'cool'; S3.stove.t = 9;
    ok(/dish/.test(pl(S3, [{ id: 1, kind: 'dish', x: G.belt.x0 + 120, state: 'ride' }]).why), 'the bot goes for a dish on the line');
    ok(/bomb/.test(pl(S3, [{ id: 2, kind: 'bomb', x: G.belt.x0 + 120, state: 'ride', fuse: 4 }]).why), 'the bot goes to bat a bomb');
    const p3 = pl(S3, [{ id: 3, kind: 'chilli', x: G.belt.x0 + 50, state: 'ride' }], { x: G.belt.x0 + 30, y: G.belt.y }); ok(!p3.atk, 'the bot never swings at a chilli (' + p3.why + ')');
    const S3b = GBM.newFight(G); ok(/stove/.test(pl(S3b, []).why), 'the bot stokes the pepper stove when it is hot'); } }

console.log(bad ? '\nkitchengate: ' + bad + ' FAILED' : '\nok  kitchengate');
process.exit(bad ? 1 : 0);
