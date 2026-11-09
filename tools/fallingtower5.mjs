// tools/fallingtower5.mjs - FALLING TOWER 5: A TOWER THAT FALLS, THE LEVEL (claude/ft5a; scratch/lane-reports/ft5-plan.md sec 2, 4, 6). Node only: no page.
//   FLAG OFF   master's tower and master's Folly, byte for byte (their hashes), no Folly -> tower transition row, no FT5 on either level
//   ACTS       four (I the tip, II it goes over, III freefall, the fall), their story and roll angles rising; every floor in its act
//   THE LEAN   Act II floors are 1:2 sawtooth, Act III 1:1; THE BEND is planks -> 1:1 -> 1:2 -> flat (the climb turns into the run)
//   SHRINES    START + three: the Reading Room's braced room (Act I's end), the Lab's (Act II's end), THE CROWN (FT5_ARENA.check, before the arena)
//   CHUNKS     the three profiles' timings; every chunk comes back; a hero running the SNAP chains at 92 px/s is never on one when it goes; the
//              Library's QUICK chunks, the Lab's pillar bridge and the Reading Room's flip are LOAD-BEARING (the reach fill without each)
//   REACH      the whole level is reached from the START: every floor's top, the bend, the run, the crown, the arena's ground
//   POISON     the engine's lint; hurts + never kills (ft4 spare); climbs at 2 / 6 / 12 s a landing (never caught briskly, never on a ride, never past a
//              cap, caught when dawdling); the run (axis x) the same; IT GOES OVER hands y -> x with no gap; co-op: lowest seat + per-seat contact
//   RUNTIME    the pieces told then laid (shelves, dome, the shear carrying a body two rows, the bell after the Sexton, the tip-over's roll kick), the
//              peel, the breather, chunks under the poison gone; the roll; the slab; the Folly's lurch; the lines routed to the hint box
//   SPOTS      the skeleton set's four spots stand on their `from` foes (plan sec 7); FT5_ARENA is sane (ft5b's box)
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const MASTER = { fallingtower: '61e6b5b3edb55d0f', mage: '6be348b9b7f8517b' };   /* master 85d152eb8, measured with this file's hash() before any FT5 line */
globalThis.__FT5 = false;
const { LEVELS, T } = await import('../src/level.js');
const { entryFor, FT5_ROW } = await import('../src/transitions.js');
const { floodReach } = await import('../src/reachcore.js');
const { chaseSpec, chaseStep, newChase, chaseProblems, HERO_RUN } = await import('../src/chase.js');
const { crumbleInit, crumbleStep } = await import('../src/tower-collapse.js');
const { FT5, FT5_ARENA, CRUMBLE5, POISON, BEND, RUN } = await import('../src/tower-fall5.js');
const FL = await import('../src/ft5-level.js');
const { isCallout } = await import('../src/hint-lines.js');
const { SLAB, FT5_SAY } = await import('../src/ft5-lines.js');
const TS = 16, out = [];
const hash = L => { const h = createHash('sha1'); h.update(Buffer.from(L.grid)); h.update(JSON.stringify(L.ents)); h.update(JSON.stringify(L.chases || [])); return h.digest('hex').slice(0, 16); };
const lv = id => LEVELS.find(l => l.id === id);

// ---- FLAG OFF: master's levels ----
{ const ft = lv('fallingtower').build(), mg = lv('mage').build();
  assert.equal(hash(ft), MASTER.fallingtower, 'with FT5 off THE FALLING TOWER is not master\'s');
  assert.equal(hash(mg), MASTER.mage, 'with FT5 off THE MAGE\'S FOLLY is not master\'s');
  assert.ok(!ft.ft5 && !mg.follyFt5 && !mg.follyTip, 'FT5 data on a level with the flag off');
  assert.equal(entryFor('mage'), null, 'a Folly -> tower transition row with the flag off');
  assert.ok(!/JUMP WHAT BREAKS/.test(lv('fallingtower').rule), 'the FT5 rule line shows with the flag off');
  out.push('flag off: both hashes are master\'s, no transition row'); }

// ---- FLAG ON ----
globalThis.__FT5 = true;
const L = lv('fallingtower').build(), W = L.W, F = L.ft5, at = (x, y) => L.grid[y * W + x];
assert.equal(entryFor('mage', 'fallingtower'), FT5_ROW, 'no Folly -> tower row with FT5 on'); assert.ok(FT5_ROW.beats.every(b => b.id === 'walk' || b.id === 'fade'), 'the Folly row is not a gate-end walk-out');
assert.ok(lv('mage').build().follyFt5, 'the Folly does not carry its FT5 ending with the flag on');
assert.equal(lv('fallingtower').rule, 'CLIMB WHAT FALLS. JUMP WHAT BREAKS.');
assert.ok(F && W === FT5.W && L.H === FT5.H, 'the FT5 builder did not build');
const floors = Object.fromEntries(F.floors.map(f => [f.name, f]));
// ---- ACTS ----
assert.equal(F.acts.length, 4, 'four acts');
for (let i = 1; i < 4; i++) assert.ok(F.acts[i].story > F.acts[i - 1].story, 'the story angle does not rise at act ' + (i + 1));
assert.ok(F.acts[0].roll < F.acts[1].roll && F.acts[1].roll < F.acts[2].roll && F.acts[3].roll === 0 && F.acts[2].roll <= 6, 'the roll does not rise I < II < III (cap 6) and settle on the run');
for (const f of F.floors) { const mid = FL.actAt(F, (f.X0 + f.X1) >> 1, f.bot - 2); assert.equal(mid, f.act, f.name + ' is in act ' + mid + ', not ' + f.act); }
assert.equal(FL.actAt(F, BEND.steep.x0 + 2, BEND.steep.row0 - 3), 4, 'the bend is not the fall'); assert.equal(FL.actAt(F, 180, RUN.floor - 1), 4, 'the run is not the fall');
assert.ok(F.acts.every(a => FT5_SAY.includes(a.say) && isCallout(a.say)), 'an act banner is not routed to the hint box');
out.push('4 acts, story ' + F.acts.map(a => a.story).join('/') + ' deg, roll ' + F.acts.map(a => a.roll).join('/'));
// ---- THE LEAN ----
const count = (x0, x1, y0, y1, ids) => { let n = 0; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (ids.includes(at(x, y))) n++; return n; };
for (const f of F.floors) { const g2 = count(f.X0, f.X1, f.top, f.bot, [22, 23, 24, 25]), g1 = count(f.X0, f.X1, f.top, f.bot, [20, 21]);
  if (f.act === 2) assert.ok(g2 >= 12, f.name + ' (Act II) has ' + g2 + ' 1:2 slope tiles: its floor is not a run of slopes');
  if (f.act === 3 && f.kind !== 'flip') assert.ok(g1 >= 4, f.name + ' (Act III) has ' + g1 + ' 1:1 slope tiles'); }
{ const S = BEND.steep, G = BEND.gentle;
  for (let i = 0; i < S.n; i++) assert.equal(at(S.x0 + i, S.row0 - i), 20, 'the bend\'s 1:1 is broken at ' + i);
  for (let j = 0; j < G.n; j++) assert.ok(at(G.x0 + 2 * j, G.row0 - j) === 22 && at(G.x0 + 2 * j + 1, G.row0 - j) === 23, 'the bend\'s 1:2 is broken at ' + j);
  assert.equal(G.row0 - G.n + 1, RUN.floor, 'the 1:2 does not meet the run\'s floor'); assert.ok(at(RUN.x0, RUN.floor) === T.SOLID && at(RUN.x0, RUN.floor - 1) === T.AIR, 'the run does not start flat');
  assert.ok(F.outer.planks.length >= 6 && F.outer.planks.every(([x0]) => x0 >= BEND.face[0] && x0 + 2 <= BEND.face[1]), 'the Outer Face planks'); }
out.push('the lean: Act II floors 1:2 (' + F.floors.filter(f => f.act === 2).map(f => count(f.X0, f.X1, f.top, f.bot, [22, 23, 24, 25])).join('/') + ' tiles), Act III 1:1; the bend planks -> 1:1 -> 1:2 -> flat');
// ---- SHRINES ----
const checks = L.ents.filter(e => e.t === 'check');
assert.equal(checks.length, 3, 'START + three shrines (plan sec 2: four checkpoints), not ' + checks.map(e => e.x + ',' + e.y));
{ const rd = floors['THE READING ROOM'], lab = floors['THE ALCHEMY LAB'], lib = floors['THE LIBRARY STACKS'];
  assert.ok(L.START.y > lib.top && L.START.y < lib.bot && L.START.x >= lib.X0 && L.START.x <= lib.X1, 'the START is not in the library');
  const inB = (e, b) => e.x >= b.box[0] && e.x <= b.box[1] && e.y >= b.box[2] && e.y <= b.box[3];
  for (const id of ['reading', 'lab']) { const b = F.braced.find(q => q.id === id); assert.ok(b && checks.some(e => inB(e, b)), 'no shrine in the ' + id + ' braced room'); }
  assert.ok(checks.some(e => e.y >= rd.top && e.y < rd.bot) && checks.some(e => e.y >= lab.top && e.y < lab.bot), 'the act-end shrines are not on their floors');
  assert.ok(checks.some(e => e.x === FT5_ARENA.check.x && e.y === FT5_ARENA.check.y), 'no shrine at THE CROWN (FT5_ARENA.check)');
  for (const e of checks) assert.ok(L.grid[(e.y + 1) * W + e.x] !== T.AIR && at(e.x, e.y) === T.AIR, 'a shrine stands on nothing at ' + e.x + ',' + e.y); }
out.push('shrines: START ' + L.START.x + ',' + L.START.y + ' + ' + checks.map(e => e.x + ',' + e.y).join(' '));
// ---- CHUNKS ----
for (const c of L.crumbles) { const p = CRUMBLE5[c.kind]; if (p) { assert.equal(c.count, p.count, c.kind + ' count'); assert.equal(c.back, p.back, c.kind + ' back'); if (c.chain) assert.equal(c.gap, p.gap, c.kind + ' gap'); }
  assert.ok(Number.isFinite(c.back ?? 4), 'a chunk never comes back');
  for (let y = c.row; y < c.row + (c.rows || 1); y++) for (let x = c.x0; x <= c.x1; x++) assert.notEqual(at(x, y), T.AIR, 'a chunk lies over air at ' + x + ',' + y); }
{ const kinds = L.crumbles.reduce((m, c) => (m[c.kind] = (m[c.kind] || 0) + 1, m), {});
  assert.ok(kinds.teach >= 1 && kinds.quick >= 6 && kinds.snap >= 9, 'too few chunks of a profile: ' + JSON.stringify(kinds));
  for (const a of [1, 2, 3, 4]) assert.ok(L.crumbles.some(c => CRUMBLE5[c.kind] && FL.actAt(F, c.x0, c.row - 1) === a), 'act ' + a + ' has no chunk to jump (the verb is required every act)');
  out.push('chunks: ' + JSON.stringify(kinds)); }
/* RUN THE SNAP CHAINS: a hero at 92 px/s from the first chunk's edge is never standing on one when it goes, and a death puts them back */
{ const chains = [...new Set(L.crumbles.filter(c => c.kind === 'snap' && c.chain).map(c => c.chain))];
  for (const id of chains) { const Lc = { crumbles: L.crumbles.filter(c => c.chain === id).map(c => ({ ...c })) }; crumbleInit(Lc);
    const cs = Lc.crumbles.sort((a, b) => a.seq - b.seq), row = cs[0].row, x0 = cs[0].x0 * TS - 3, x1 = (cs[cs.length - 1].x1 + 1) * TS + 4, dt = 1 / 60; let x = x0, t = 0, fellUnder = 0, fell = 0;
    while (x < x1 + 40 && t < 6) { const b = { x, y: row * TS, ground: true }; for (const v of crumbleStep(Lc, x < x1 ? [b] : [], dt, () => {})) if (v.t === 'fall') { fell++; if (x > v.c.x0 * TS - 4 && x < (v.c.x1 + 1) * TS + 4) fellUnder++; } x += HERO_RUN * dt; t += dt; }
    assert.equal(fellUnder, 0, 'a SNAP chunk of ' + id + ' goes under a hero running it'); assert.ok(fell >= 1, 'the SNAP chain ' + id + ' never goes'); }
  out.push(chains.length + ' SNAP chains run at ' + HERO_RUN + ' px/s: never one under the hero'); }
/* QUICK: count 1.2 under weight, back 4 s after; TEACH 3 s */
{ const one = L.crumbles.find(c => c.kind === 'quick'), Lc = { crumbles: [{ ...one }] }; crumbleInit(Lc); const c = Lc.crumbles[0], b = { x: (c.x0 + 1) * TS, y: c.row * TS, ground: true }; let t = 0, downAt = -1, backAt = -1;
  for (let i = 0; i < 600; i++) { for (const v of crumbleStep(Lc, t < 2 ? [b] : [], 1 / 60, () => {})) { if (v.t === 'fall') downAt = t; if (v.t === 'back') backAt = t; } t += 1 / 60; }
  assert.ok(Math.abs(downAt - 1.2) < 0.05 && Math.abs(backAt - downAt - 4) < 0.05, 'QUICK timings: down ' + downAt.toFixed(2) + ' back ' + backAt.toFixed(2)); }
// ---- REACH ----
const reach = (L2, o = {}) => floodReach(L2, T, { rides: true, ...o });
const R = reach(L), stood = (R0, x, y) => R0.seen.has(x + ',' + y);
const tierReached = (R0, [x0, len, row]) => { for (let x = x0; x < x0 + len; x++) if (stood(R0, x, row - 1)) return true; return false; };
for (const f of F.floors) { const top = f.tiers.length ? f.tiers[f.tiers.length - 1] : [f.X0 + 4, f.X1 - f.X0 - 8, f.bot]; assert.ok(tierReached(R, top), f.name + "'s top (or its floor) is not reached"); }
for (let i = 0; i < BEND.steep.n; i++) assert.ok(stood(R, BEND.steep.x0 + i, BEND.steep.row0 - i), 'the 1:1 of the bend is not reached at ' + i);
assert.ok(F.outer.planks.every(p => tierReached(R, p)), 'an Outer Face plank is not reached');
for (let x = RUN.x0; x <= RUN.x1; x++) { const solidUnder = at(x, RUN.floor) !== T.AIR && at(x, RUN.floor - 1) === T.AIR; if (solidUnder) assert.ok(stood(R, x, RUN.floor - 1) || [...R.seen].some(k => k === x + ',' + (RUN.floor - 3)), 'the run is not reached at ' + x); }
assert.ok(stood(R, FT5_ARENA.check.x, FT5_ARENA.check.y) && stood(R, FT5_ARENA.crownSpot.x, FT5_ARENA.crownSpot.y), 'THE CROWN is not reached');
if (!F.field) { const gate = L.ents.find(e => e.t === 'gate'); assert.ok(gate && stood(R, gate.x, gate.y), 'the placeholder field\'s gate is not reached'); }
out.push('reach: every floor\'s top, the bend, the run, the crown' + (F.field ? '' : ', the placeholder field\'s gate') + ' (' + R.seen.size + ' cells)');
/* LOAD-BEARING: take each away and the climb stops */
{ const lib = floors['THE LIBRARY STACKS'], g = L.grid.slice(); for (const c of L.crumbles.filter(c => c.kind === 'quick' && c.row > lib.top && c.row < lib.bot)) for (let x = c.x0; x <= c.x1; x++) g[c.row * W + x] = T.AIR;
  assert.ok(!tierReached(reach({ ...L, grid: g }), lib.tiers[4]), "the Library's QUICK chunks are not the only way to the tier over them");
  const lab = floors['THE ALCHEMY LAB'], west = lab.tiers.find(t => t[2] === lab.tiers[4][2] && t[0] < lab.tiers[4][0]) || lab.tiers[5];
  assert.ok(!tierReached(reach({ ...L, reachSpans: L.reachSpans.filter(s => !(s[2] === west[2])) }), lab.tiers[lab.tiers.length - 1]), "the Lab's pillar bridge is not load-bearing");
  const rd = floors['THE READING ROOM']; assert.ok(!tierReached(reach({ ...L, glyphBridges: [] }), rd.tiers[rd.tiers.length - 1]), "the Reading Room's flip is not load-bearing");
  out.push('load-bearing: the Library\'s QUICK chunks, the Lab\'s pillar bridge, the Reading Room\'s flip'); }
// ---- THE POISON ----
const P2 = L.chases.find(c => c.id === 'act2'), P3 = L.chases.find(c => c.id === 'act3'), PR = L.chases.find(c => c.id === 'run');
assert.ok(P2 && P3 && PR && L.chases.length === 3, 'three poison chases (Act II, Act III, the run)');
assert.deepEqual(chaseProblems(L.chases), [], 'the chase lint');
{ const shr = checks.map(e => ({ x: e.x * TS + 8, y: (e.y + 1) * TS })).concat([{ x: L.START.x * TS + 8, y: (L.START.y + 1) * TS }]);
  assert.deepEqual(chaseProblems([P2], shr), [], 'Act II\'s poison has no shrine before its start line'); }   /* (Act III and the run have none, by design: plan sec 2, the poison never kills) */
for (const raw of L.chases) { const sp = chaseSpec(raw);
  assert.ok(sp.contact === 'hurt' && sp.ft4 && sp.ft5 && sp.dmg === POISON.dmg && sp.look === 'dark', raw.id + ': it must hurt (21), never kill (main.js spare), and be his poison');
  for (const r of sp.curve) assert.ok(r.speed * sp.rubber.slow < HERO_RUN * 0.8, raw.id + ' outruns a hero');
  assert.ok(sp.curve.slice(1).every(r => FT5_SAY.includes(r.warn)) && FT5_SAY.includes(sp.say), raw.id + ': a line is not routed'); }
assert.deepEqual(chaseSpec(P2).curve.map(r => r.speed), POISON.act2); assert.deepEqual(chaseSpec(P3).curve.map(r => r.speed), POISON.act3); assert.deepEqual(chaseSpec(PR).curve.map(r => r.speed), POISON.run);
function climb(raw, wait) { const sp = chaseSpec(raw), st = newChase(), dt = 1 / 30, land = raw.caps.map((c, i) => ({ row: Math.round((c.reach + 4) / TS), stop: Math.round((c.stop - 6) / TS) - 1, i }));
  let hero = sp.trigger - 1, contacts = [], i = -1, t = 0, worst = Infinity;
  const stepFor = secs => { for (let k = 0; k < secs / dt; k++) { for (const e of chaseStep(sp, st, hero, dt, true)) if (e.k === 'contact') contacts.push(i); t += dt; const cap = sp.caps[st.capI]; if (cap && st.phase === 'run') worst = Math.min(worst, st.pos - cap.stop); } };
  stepFor(wait); for (const l of land) { i = l.i; hero = l.row * TS - 7; stepFor(wait); }
  return { contacts, rides: land.filter(l => l.stop > l.row).map(l => l.i), worst, t }; }
for (const raw of [P2, P3]) { for (let i = 1; i < raw.caps.length; i++) assert.ok(raw.caps[i].reach < raw.caps[i - 1].reach, raw.id + ': caps out of climbing order at ' + i);
  for (const wait of [2, 6, 12]) { const r = climb(raw, wait);
    for (const c of r.contacts) assert.ok(c < 0 || !r.rides.includes(c + 1), raw.id + ' (wait ' + wait + ' s) caught the hero on a ride (landing ' + c + ')');
    assert.ok(r.worst >= -0.5, raw.id + ' passed a cap: ' + r.worst.toFixed(1));
    if (wait === 2) assert.equal(r.contacts.length, 0, raw.id + ' catches a hero who climbs briskly (2 s a landing)');
    if (wait === 12) { assert.ok(r.contacts.length > 0, raw.id + ' never reaches a hero who waits 12 s a landing: no pressure'); out.push(raw.id + ': ' + r.contacts.length + ' contacts at 12 s a landing (' + r.t.toFixed(0) + ' s), none at 2 s, none on a ride'); } } }
assert.ok(climb(P2, 6).rides.length >= 2, 'Act II\'s two pendulum rides are not held as rides');
/* THE RUN, axis x: a hero who runs (a hop at every hurdle and window costs 0.4 s) is never caught; one who stands about is */
{ const sp = chaseSpec(PR), hurdles = [...F.run.windows, ...F.run.buttresses, ...F.run.chains].map(w => w[0]).sort((a, b) => a - b);
  const go = (speed, pause) => { const st = newChase(), dt = 1 / 60; let x = sp.trigger + 1, hits = 0, t = 0, h = 0, wait = 0;
    while (x < sp.end + 20 && t < 120) { for (const e of chaseStep(sp, st, x, dt, true)) if (e.k === 'contact') hits++; if (wait > 0) wait -= dt; else { x += speed * dt; if (h < hurdles.length && x >= hurdles[h] * TS - 8) { h++; wait = pause; } } t += dt; }
    return { hits, t }; };
  const brisk = go(HERO_RUN * 0.9, 0.4), slow = go(HERO_RUN * 0.45, 2.0);
  assert.equal(brisk.hits, 0, 'the run catches a hero who runs it'); assert.ok(slow.hits > 0, 'the run never catches a hero who dawdles: no pressure');
  out.push('the run: ' + (sp.end - sp.trigger) / TS + ' tiles, brisk ' + brisk.t.toFixed(1) + ' s untouched, a dawdler caught ' + slow.hits + 'x'); }
/* IT GOES OVER: the shaft's safe line and the run's start line meet on the bend - a hero standing where the run starts has already crossed the shaft's */
{ const sp3 = chaseSpec(P3), spr = chaseSpec(PR), tx = Math.floor(spr.trigger / TS); let y = 0; while (y < L.H && (at(tx, y) === T.AIR)) y++;   /* the surface under the run's start column */
  const standY = (at(tx, y) >= 20 ? y + 1 : y) * TS; assert.ok(standY - 7 <= sp3.end + TS, 'the shaft\'s poison has not ended where the run\'s begins (no gap): ' + (standY - 7) + ' vs ' + sp3.end);
  assert.ok(spr.trigger >= BEND.steep.x0 * TS && spr.trigger <= (BEND.gentle.x0 + 2 * BEND.gentle.n) * TS, 'the run does not start on the bend');
  const over = F.pieces.find(p => p.id === 'over'); assert.ok(over && over.tell >= 1.5 && over.zone[0] <= tx && over.zone[1] >= tx, 'IT GOES OVER is not told over the hand-off');
  out.push('IT GOES OVER: the shaft\'s safe line (row ' + (sp3.end / TS).toFixed(1) + ') meets the run\'s start (col ' + tx + '), told ' + over.tell + ' s'); }
/* CO-OP: the band follows the lowest living human seat; a touch takes every seat as far back as the one it caught, nobody ahead */
{ const sp = chaseSpec(P2), a = { x: 300, y: 3000 }, b = { x: 320, y: 3200 }, ai = { x: 0, y: 3600, ai: true }, dead = { x: 0, y: 3700, dead: true };
  assert.equal(FL.leadHero(sp, [a, b, ai, dead]), 3200 - 7, 'the poison does not follow the lowest living human seat');
  const st = { pos: 3200 - 7 - sp.dir * sp.rubber.min }; assert.deepEqual(FL.seatsCaught(sp, st, [a, b, ai]), [b], 'the touch is not per seat');
  const spr = chaseSpec(PR); assert.equal(FL.leadHero(spr, [{ x: 900, y: 0 }, { x: 700, y: 0 }]), 700, 'the run does not follow the hindmost seat'); }
out.push('co-op: lowest seat leads the band, the touch is per seat (AI and the dead left out)');

// ---- RUNTIME ----
function rig() { const L2 = { ft5: JSON.parse(JSON.stringify({ ...F, rt: null })), crumbles: L.crumbles.map(c => ({ ...c })), moversExtra: [] }, grid = L.grid.slice(), log = { say: [], broke: [], carry: 0 };
  crumbleInit(L2); FL.ft5Reset(L2, null); const Pl = { x: 0, y: 0, dead: false, ground: true }; let mover = null, sexton = false; const chs = [];
  const c = { T, set: (x, y, t) => { grid[y * W + x] = t; }, tile: (x, y) => grid[y * W + x], say: s => log.say.push(s), sound: () => {}, shake: () => {}, dust: () => {},
    onMover: () => mover, sextonDown: () => sexton, crumbleBreak: (x0, x1, row) => log.broke.push([x0, x1, row]), chases: () => chs, carry: dy => { log.carry += dy; Pl.y += dy; } };
  const run = secs => { for (let i = 0; i < secs * 60; i++) FL.ft5Update(L2, Pl, 1 / 60, c); };
  const put = (tx, row) => { Pl.x = tx * TS + 8; Pl.y = row * TS; };
  return { L2, grid, log, Pl, c, run, put, chs, set mover(m) { mover = m; }, set sexton(v) { sexton = v; } }; }
const piece = id => F.pieces.find(p => p.id === id);
for (const p of F.pieces) { if (p.kind !== 'say') assert.ok(p.tell >= 1.0, p.id + ' goes untold'); assert.ok(FT5_SAY.includes(p.say), p.id + "'s line is not routed");
  for (const [x0, x1, row] of p.lay || []) for (let x = x0; x <= x1; x++) assert.equal(at(x, row), T.AIR, p.id + ' lays over something at ' + x + ',' + row); }
/* the roll: starts tipped (the Folly's lurch), eases to Act I's, then Act II's */
{ const r = rig(), lib = floors['THE LIBRARY STACKS']; assert.equal(r.L2.ft5.rt.roll, F.roll0, 'FT5 does not open tipped (the Folly\'s lurch carries over)');
  r.put(lib.X0 + 4, lib.bot - 1); r.run(3); assert.equal(r.L2.ft5.rt.roll, F.acts[0].roll, 'the roll does not settle to Act I\'s'); assert.ok(r.log.say.includes(F.acts[0].say), 'no Act I banner');
  const ob = floors['THE OBSERVATORY']; r.put(ob.X0 + 2, ob.bot - 1); r.run(3); assert.equal(r.L2.ft5.rt.roll, F.acts[1].roll, 'the roll does not go to Act II\'s'); }
/* THE SHELVES GO: on the zone, told 1.0 s, laid */
{ const r = rig(), p = piece('shelves'); r.put(p.zone[0] + 1, p.zone[3]); r.run(p.tell - 0.2); assert.equal(r.grid[p.lay[0][2] * W + p.lay[0][0]], T.AIR, 'the shelves land untold');
  r.run(0.4); for (const [x0, x1, row] of p.lay) for (let x = x0; x <= x1; x++) assert.equal(r.grid[row * W + x], T.ONEWAY, 'a case does not lie down as a ledge'); assert.ok(r.log.say.includes(p.say)); }
/* THE GALLERY SHEARS: only on the last book; told 2 s; the landing two rows down; a body on it carried; the lab still reached after */
{ const r = rig(), p = piece('shear'), [x0, x1, row] = p.ledges[0]; r.put(x0 + 1, row);
  r.mover = { ft5: 'x' }; r.run(1); assert.equal(r.grid[row * W + x0], T.ONEWAY, 'the gallery shears off the wrong ride');
  r.mover = { ft5: 'shear' }; r.run(0.1); r.mover = null; r.run(p.tell - 0.3); assert.equal(r.grid[row * W + x0], T.ONEWAY, 'the gallery shears untold'); r.run(0.4);
  assert.ok(r.grid[row * W + x0] === T.AIR && r.grid[(row + 2) * W + x1] === T.ONEWAY, 'the landing is not two rows down'); assert.equal(r.log.carry, 32, 'a body on it is not carried');
  const R2 = reach({ ...L, grid: r.grid }), lab = floors['THE ALCHEMY LAB']; assert.ok(tierReached(R2, lab.tiers[0]), 'after the shear the lab is not reached'); }
/* THE BELL: never while the Sexton stands; then told, the deck breaks under it, and it plugs the well */
{ const r = rig(), p = piece('bell'); r.put(p.zone[0] + 4, p.deck); r.run(2); assert.equal(r.log.broke.length, 0, 'the bell falls with the Sexton standing');
  r.sexton = true; r.run(p.tell - 0.1); assert.equal(r.log.broke.length, 0, 'the bell falls untold'); r.run(0.3);
  assert.deepEqual(r.log.broke, [[p.bays[0], p.bays[1], p.deck]], 'the deck under the bell does not break'); assert.ok(r.log.say.includes(p.after2)); }
/* IT GOES OVER: the roll kicks to 6 and then settles to the run's 0 */
{ const r = rig(), p = piece('over'); r.L2.ft5.rt.roll = 5.5; r.put(p.zone[0] + 1, p.zone[3] - 1); r.run(0.6); assert.ok(r.L2.ft5.rt.roll >= 5.9, 'the tip-over does not kick the roll: ' + r.L2.ft5.rt.roll);
  r.put(RUN.x0 + 20, RUN.floor - 1); r.run(10); assert.equal(r.L2.ft5.rt.roll, 0, 'the roll does not settle on the run'); assert.ok(r.log.say.includes(p.say)); }
/* THE PEEL: planks under the Act III poison come off; the top one never */
{ const r = rig(), pl = F.outer.planks, mid = pl[3]; r.chs.push({ sp: { id: 'act3', ft5: true, axis: 'y', zone: null }, st: { phase: 'run', pos: mid[2] * TS - 4 } }); r.put(0, 0); r.run(0.1);
  for (const [x0, , row] of pl) assert.equal(r.grid[row * W + x0], row > mid[2] ? T.AIR : T.PLANK, 'the face at row ' + row + ' peels wrong'); }
/* THE POISON takes the chunks it rises past; a braced ledge holds it once */
{ const r = rig(), b = F.breathers[0], q = { sp: { id: 'act3', ft5: true, axis: 'y', zone: null }, st: { phase: 'run', pos: (b.box[3] + 6) * TS, hold: 0 } }; r.chs.push(q);
  r.put(0, 0); r.run(0.05); const under = r.L2.crumbles.filter(c => c.row * TS > q.st.pos + 24); assert.ok(under.length && under.every(c => c.gone), 'chunks under the poison are not gone');
  assert.ok(r.L2.crumbles.filter(c => c.row * TS < q.st.pos).every(c => !c.gone), 'a chunk over the poison is gone');
  r.put(b.box[0] + 1, b.box[3] + 1); r.run(0.05); assert.equal(q.st.hold, b.hold, 'the braced ledge does not hold the poison'); q.st.hold = 0; r.run(0.5); assert.equal(q.st.hold, 0, 'the braced ledge holds it twice'); }
out.push('runtime: the roll (opens at ' + F.roll0 + '), the shelves, the shear (+carry, lab reached), the bell after the Sexton, IT GOES OVER (+6 -> 0), the peel, chunks under the poison gone, the breather');
/* THE SLAB: told, slides, gone, back at its socket */
{ const m = { ft5: 'slab', sx: 100, sy: 200, x: 100, y: 200, w: 32, h: 8, dir: 1, st: 'wait', t: 0 }, ev = [], dt = 1 / 60; let t = 0;
  for (let i = 0; i < 60 * 14; i++) { const e = FL.slabStep(m, dt, t < 1 ? 1 : 0); if (e) ev.push([e, +t.toFixed(2)]); t += dt; }
  assert.deepEqual(ev.map(e => e[0]), ['tell', 'go', 'gone', 'back'], 'the slab cycle: ' + JSON.stringify(ev));
  assert.ok(Math.abs(ev[1][1] - SLAB.tell) < 0.05 && Math.abs(ev[2][1] - ev[1][1] - SLAB.ride) < 0.05 && Math.abs(ev[3][1] - ev[2][1] - SLAB.back) < 0.05, 'the slab timings: ' + JSON.stringify(ev));
  assert.ok(L.moversExtra.some(q => q.ft5 === 'slab'), 'the level has no slab'); }
/* THE FOLLY: two lines (0 s, 0.8 s), the frame tipping to 2.5 deg and staying */
{ const Lf = { follyFt5: true }, said = []; const c = { say: s => said.push(s), shake: () => {}, sound: () => {} };
  for (let i = 0; i < 60 * 2; i++) FL.follyStep(Lf, 1 / 60, c); assert.deepEqual(said, FL.FOLLY.lines, 'the Folly\'s lines'); assert.equal(Lf.follyTip, FL.FOLLY.roll);
  assert.equal(FL.tiltOf(Lf, true, false), -FL.FOLLY.roll, 'the Folly does not tip'); const L0 = {}; FL.follyStep(L0, 1, c); assert.ok(!L0.follyTip, 'the Folly tips with FT5 off');
  for (const s of FL.FOLLY.lines) assert.ok(isCallout(s), s + ' is not routed'); }
assert.ok(FT5_SAY.every(s => isCallout(s)), 'an FT5 line is not routed to the hint box');
out.push('the slab (tell ' + SLAB.tell + ' s, ride ' + SLAB.ride + ' s, back ' + SLAB.back + ' s); the Folly\'s lurch (2 lines, 2.5 deg); ' + FT5_SAY.length + ' lines routed');
// ---- SPOTS: the skeleton set (plan sec 7), and FT5_ARENA ----
{ const S = L.bonesSpots; assert.deepEqual(Object.keys(S).sort(), ['archer1', 'mage1', 'soldier1', 'soldier2']);
  for (const [k, s] of Object.entries(S)) assert.ok(L.ents.some(e => e.t === s.from && e.x === s.x && e.y === s.y), 'the skeleton spot ' + k + ' has no ' + s.from + ' at ' + s.x + ',' + s.y);
  const A = L.ft5Arena; assert.deepEqual(A, { ...FT5_ARENA, crownSpot: { ...FT5_ARENA.crownSpot }, check: { ...FT5_ARENA.check } });
  assert.ok(A.x0 > 0 && A.x1 < W && A.y0 >= 0 && A.y1 < L.H && A.x1 - A.x0 === 64 && A.y0 < A.sea && A.sea < A.y1, 'FT5_ARENA is not a box in the grid');
  assert.ok(A.crownSpot.x < A.x0 && A.check.x < A.crownSpot.x && at(A.crownSpot.x, A.crownSpot.y + 1) === T.SOLID && at(A.crownSpot.x, A.crownSpot.y) === T.AIR, 'the crown spot does not stand on the crown west of the box');
  out.push('skeleton spots ' + Object.entries(S).map(([k, s]) => k + '@' + s.x + ',' + s.y).join(' ') + '; FT5_ARENA ' + JSON.stringify({ x0: A.x0, x1: A.x1, y0: A.y0, y1: A.y1, sea: A.sea })); }
console.log('ok  fallingtower5  ' + out.join('; '));
