// tools/fallingtower4.mjs - FALLING TOWER 4, LANE B: THE TOWER COMES DOWN AROUND YOU (claude/ft4b; scratch/brief-fallingtower4-1029.md section 2, Daniel's
// four recs 10-29 16:00; src/tower-front.js + src/tower-ascent.js). Node only: no page.
//   ACTS     three acts over the seven floors in order (I the Library + Reading Room, II the Observatory + Pendulum Gallery + Alchemy Lab, III the Bell
//            Loft + the Crown), a banner for each; the debris quickens by act (4.4 / 3.5 / 2.5 s, two shadows in act III)
//   SHRINES  FOUR (Daniel #4): the observatory's braced room (act I's end), the lab's (act II's, before the Sexton), the Outer Face's top plank (act III's),
//            the spiral stair's foot (before him) - and each act's braced room holds its shrine
//   FRONT    acts II and III each have a COLLAPSE FRONT (src/chase.js's chaser): the engine's own lint is clean against the level's shrines; it HURTS and
//            THROWS YOU UP (never kills); its caps come in climbing order; a hero who climbs at a walker's pace with long waits is never caught on a
//            RIDE (the telescope, the pendulums, the poison stones, the treasury, the crown walk) - only on a plain stair if he dawdles - and the front
//            never passes the landing over a hero who has not stood on it; act III's front waits for THE BELL FALLS (main.js)
//   PIECES   five set pieces, each told (>= 1.0 s), each laying only into air: THE SHELVES GO (three cases in sequence, the last held by its cracked pillar
//            until struck), THE DOME COMES IN (two frozen ribs - a SECOND STAIR from the telescope's low step to its high one, proved with the reach
//            fill with the telescope taken away), THE GALLERY SHEARS (only on the last pendulum; the far half drops two rows, a body on it is carried,
//            the rope is let down to the new ledge and the lab is still reached), THE BELL FALLS (after the Sexton: told, the deck under it breaks,
//            act III's front then may start), THE OUTER FACE PEELS (planks under the front go, the top plank never)
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { chaseSpec, chaseStep, newChase, chaseProblems, HERO_RUN } from '../src/chase.js';
import { FT4, FT4_LINES, ft4Reset, ft4Update, actAt } from '../src/tower-front.js';
import { TOWER } from '../src/tower-ascent.js';
import { readFileSync } from 'node:fs';
const TS = 16, lv = LEVELS.find(l => l.id === 'fallingtower'), L = lv.build(), W = L.W, F4 = L.ft4, at = (x, y) => L.grid[y * W + x];
const floors = Object.fromEntries(L.towerFloors.map(f => [f.name, f]));
const out = [];
// ---- ACTS ----
assert.equal(F4.acts.length, 3, 'three acts');
const order = ['THE LIBRARY STACKS', 'THE READING ROOM', 'THE OBSERVATORY', 'THE PENDULUM GALLERY', 'THE ALCHEMY LAB', 'THE BELL LOFT', 'THE OPEN CROWN'], want = [1, 1, 2, 2, 2, 3, 3];
order.forEach((n, i) => { const f = floors[n]; assert.equal(actAt(F4, f.top + 2), want[i], n + ' is not in act ' + want[i]); assert.equal(actAt(F4, f.bot - 2), want[i], n + "'s foot is not in act " + want[i]); });
for (const a of F4.acts) assert.ok(FT4_LINES.includes(a.say), 'act ' + a.n + "'s banner is not a listed line");
{ const d = L.ft2.floors; assert.ok(d[0].every === 4.4 && d[2].every === 3.5 && d[4].every === 3.5 && d[5].every === 2.5 && d[5].n === 2, 'the debris is not tied to the act: ' + d.map(f => f.every + '/' + f.n)); }
out.push('3 acts (I: library, reading room / II: observatory, pendulums, lab / III: bell loft, crown), banners, debris 4.4/3.5/2.5 s (two shadows in III)');
// ---- SHRINES ----
const checks = L.ents.filter(e => e.t === 'check');
assert.equal(checks.length, 4, 'four shrines (Daniel 10-29 #4), not ' + checks.length + ': ' + checks.map(e => e.x + ',' + e.y));
{ const rows = checks.map(e => e.y).sort((a, b) => b - a), ob = floors['THE OBSERVATORY'], lab = floors['THE ALCHEMY LAB'];
  assert.ok(checks.some(e => e.y >= ob.top && e.y < ob.bot && e.x < 24), "no shrine in the observatory's braced room (act I's end)");
  assert.ok(checks.some(e => e.y >= lab.top && e.y < lab.top + 6), "no shrine in the lab's braced room (act II's end, before the Sexton)");
  assert.ok(checks.some(e => e.x < TOWER.X0 && e.y < TOWER.SKY + 10), "no shrine on the Outer Face's top plank (act III's end)");
  assert.ok(checks.some(e => e.x >= L.spiral.x0), "no shrine at the spiral stair's foot (before him)"); void rows;
  for (const b of F4.braced) assert.ok(checks.some(e => e.x >= b.box[0] && e.x <= b.box[1] && e.y >= b.box[2] && e.y <= b.box[3]), 'the braced room ' + b.id + ' holds no shrine'); }
out.push('4 shrines: ' + checks.map(e => e.x + ',' + e.y).join(' '));
// ---- THE FRONTS ----
const shrinesPx = checks.map(e => ({ x: e.x * TS + 8, y: (e.y + 1) * TS })).concat([{ x: L.START.x * TS + 8, y: (L.START.y + 1) * TS }]);
const fronts = L.chases.filter(c => c.ft4);
assert.equal(fronts.length, 2, 'acts II and III each have a front');
assert.deepEqual(chaseProblems(L.chases, shrinesPx), [], 'the chase lint fails the fronts');
assert.ok(/c\.sp\.after === 'bell'/.test(readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')), "main.js no longer holds act III's front for the bell");
for (const raw of fronts) { const sp = chaseSpec(raw);
  assert.equal(sp.contact, 'hurt', raw.id + ' kills (Daniel #2: it hurts and throws you up)'); assert.ok(sp.dmg <= 25 && sp.knockTo && sp.knockTo.length >= 6, raw.id + ': its blow or its throw');
  assert.ok(sp.caps.length >= 6, raw.id + ' has too few caps'); for (let i = 1; i < sp.caps.length; i++) assert.ok(sp.caps[i].reach < sp.caps[i - 1].reach && sp.caps[i].stop <= sp.caps[i - 1].stop, raw.id + ': caps out of climbing order at ' + i);
  for (const r of sp.curve) assert.ok(r.speed * sp.rubber.slow < HERO_RUN * 0.8, raw.id + ' outruns a hero');
  assert.ok(sp.drawZone && sp.drawZone[0] <= TOWER.X0 * TS && sp.drawZone[1] >= (TOWER.X1 + 1) * TS, raw.id + ' is not drawn wall to wall'); }
/* THE CLIMB, SIMULATED: the hero stands on each landing in turn (feet on its row), waits `wait` s, then is on the next. Every contact is recorded with the
   landing he stood on; a landing whose stop is lower than its own row is a RIDE's - the front must never reach him there. And it never passes caps[i].stop
   while landing i is unstood. */
function climb(raw, wait) { const sp = chaseSpec(raw), st = newChase(), dt = 1 / 30, land = raw.caps.map((c, i) => ({ row: Math.round((c.reach + 4) / TS), stop: Math.round((c.stop - 6) / TS) - 1, i }));
  let hero = sp.trigger - 1, contacts = [], i = -1, t = 0, worst = Infinity;
  const stepFor = secs => { for (let k = 0; k < secs / dt; k++) { for (const e of chaseStep(sp, st, hero, dt, true)) if (e.k === 'contact') contacts.push(i); t += dt; const cap = sp.caps[st.capI]; if (cap && st.phase === 'run') worst = Math.min(worst, st.pos - cap.stop); } };
  stepFor(wait);
  for (const l of land) { i = l.i; hero = l.row * TS - 7; stepFor(wait); }
  return { contacts, rides: land.filter(l => l.stop > l.row).map(l => l.i), worst, t };
}
for (const raw of fronts) for (const wait of [2, 6, 12]) { const r = climb(raw, wait);
  for (const c of r.contacts) assert.ok(c < 0 || !r.rides.includes(c + 1) || c === -1, raw.id + ' (wait ' + wait + ' s) caught the hero on a ride (landing ' + c + ')');
  assert.ok(r.worst >= -0.5, raw.id + ' passed a cap: ' + r.worst.toFixed(1));
  if (wait === 12) { assert.ok(r.contacts.length > 0, raw.id + ' never reaches a hero who waits 12 s a landing: it is no pressure'); out.push(raw.id + ': ' + r.contacts.length + ' contacts at 12 s a landing (' + r.t.toFixed(0) + ' s), none on a ride'); }
  if (wait === 2) assert.equal(r.contacts.length, 0, raw.id + ' catches a hero who climbs briskly (2 s a landing): ' + r.contacts); }
// ---- THE SET PIECES ----
const P = id => F4.pieces.find(p => p.id === id);
for (const id of ['shelves', 'dome', 'shear', 'bell']) { const p = P(id); assert.ok(p, 'no set piece ' + id); assert.ok(FT4_LINES.includes(p.say), id + "'s line is not listed"); }
assert.ok(F4.peel && F4.peel.front === 'front3' && FT4_LINES.includes(F4.peel.say), 'no OUTER FACE PEELS');
assert.ok(FT4.piece.tell >= 1.0 && FT4.shear.tell >= 2.0 && FT4.bell.tell >= 1.0, 'a set piece goes untold');
for (const p of F4.pieces) for (const it of p.items || []) { const [x0, x1, row] = it.span; assert.ok((it.tell ?? FT4.piece.tell) >= 1.0, p.id + ': an item goes untold');
  if (it.lay !== false) for (let x = x0; x <= x1; x++) assert.equal(at(x, row), T.AIR, p.id + ' lays a tile over something at ' + x + ',' + row); }
{ const sup = id => (L.ftSupports || []).find(s => s.id === id), s = sup('lib-top'), C = P('shelves').items[2];
  assert.ok(s && s.kind === 'ramp' && C.hold === 'lib-top', "THE SHELVES GO's last case is not held by the lib-top pillar");
  for (const [x0, x1, row] of s.spans) for (let x = x0; x <= x1; x++) assert.equal(at(x, row), T.AIR, 'lib-top lays over something');
  assert.equal(P('shelves').items.length, 3, 'three cases'); }
/* THE DOME's ribs are a second stair: take the telescope away (its fly band) and lay the ribs - the observatory's top step is still reached */
{ const ob = floors['THE OBSERVATORY'], top = L.towerFloors[2], grid = L.grid.slice(), noScope = (L.rigBands || []).filter(b => !(b[2] >= ob.top && b[3] <= ob.bot));
  const R0 = floodReach({ ...L, rigBands: noScope }, T, { rides: true }), tierTop = (() => { const sc = L.moversExtra.find(m => m.role === 'scope'); return Math.round(sc.y / TS); })();
  for (const it of P('dome').items) { const [x0, x1, row] = it.span; for (let x = x0; x <= x1; x++) grid[row * W + x] = T.ONEWAY; }
  const R1 = floodReach({ ...L, grid, rigBands: noScope }, T, { rides: true }), hiStep = ob.bot - 10 - 15;
  const reached = R => [...R.seen].some(k => { const [x, y] = k.split(',').map(Number); return y === hiStep - 1 && x >= 45 && x <= 54; });
  assert.ok(!reached(R0), 'without the telescope the high step is reached anyway (the ribs prove nothing)'); assert.ok(reached(R1), "the dome's ribs are no stair: the high step is not reached by them");
  assert.ok(P('dome').items.every(it => it.slick), 'the ribs are not frozen (realm floors: his ice, act II)'); void top; void tierTop; }
out.push("the dome's ribs are a second stair (the reach fill, telescope taken away)");
// ---- RUNTIME: the pieces in ft4Update, with a made-up world ----
function rig() { const L2 = { ft4: JSON.parse(JSON.stringify(F4)), slick: [], crumbles: (L.crumbles || []).map(c => ({ ...c })) }, grid = L.grid.slice(), log = { say: [], hurt: [], carry: 0, broke: [] };
  ft4Reset(L2); const Pl = { x: 0, y: 0, dead: 0, ground: true }; let mover = null, sexton = false, sdown = false, front = null;
  const c = { T, set: (x, y, t) => { grid[y * W + x] = t; }, tile: (x, y) => grid[y * W + x], hurt: (x, d, n) => log.hurt.push(n), say: s => log.say.push(s), sound: () => {}, shake: () => {}, dust: () => {}, burst: () => {},
    onMover: () => mover, sextonDown: () => sexton, supportDown: () => sdown, crumbleBreak: b => log.broke.push(b), carry: dy => { log.carry += dy; Pl.y += dy; }, slick: z => L2.slick.push(z), front: () => front, busy: false };
  const run = secs => { for (let i = 0; i < secs * 60; i++) ft4Update(L2, Pl, 1 / 60, c); };
  return { L2, grid, log, Pl, c, run, set mover(m) { mover = m; }, set sexton(v) { sexton = v; }, set sdown(v) { sdown = v; }, set front(f) { front = f; } }; }
/* THE GALLERY SHEARS: nothing until the last pendulum; then told 2 s; the ledges drop two rows; a body on the landing rides it down; the rope meets the new ledge */
{ const r = rig(), p = P('shear'), [lx0, lx1, lrow] = p.ledges[0]; r.Pl.x = (lx0 + 1) * TS; r.Pl.y = lrow * TS;
  r.mover = { role: 'swing' }; r.run(3); assert.equal(r.grid[lrow * W + lx0], T.ONEWAY, 'the gallery shears without the last pendulum');
  r.mover = { ft4: 'shear' }; r.run(FT4.shear.tell - 0.2); assert.equal(r.grid[lrow * W + lx0], T.ONEWAY, 'the gallery shears untold');
  r.run(0.4); for (const [x0, x1, row] of p.ledges) { assert.equal(r.grid[row * W + x0], T.AIR, 'a sheared ledge is still where it was'); assert.equal(r.grid[(row + 2) * W + x1], T.ONEWAY, 'a sheared ledge is not two rows down'); }
  assert.equal(r.log.carry, 32, 'a body on the sheared half is not carried down with it'); assert.ok(r.log.say.includes(p.say), 'the shear is not said');
  const [rx, ry0, ry1] = p.rope[0]; for (let y = ry0; y <= ry1; y++) assert.equal(r.grid[y * W + rx], T.NET, 'the rope is not let down to the sheared ledge');
  const R = floodReach({ ...L, grid: r.grid }, T, { rides: true }), lab = floors['THE ALCHEMY LAB'];
  assert.ok([...R.seen].some(k => +k.split(',')[1] < lab.top + 4), 'after the shear the lab is not reached'); }
out.push('the gallery shears only on the last pendulum, told 2 s, two rows; a body rides it; the lab is still reached');
/* THE SHELVES GO: three cases in sequence on the zone; the last is held until its pillar is down */
{ const r = rig(), p = P('shelves'), z = p.zone; r.Pl.x = (z[0] + 2) * TS; r.Pl.y = z[3] * TS; r.run(0.1);
  assert.ok(r.log.say.includes('THE SHELVES GO'), 'the shelves do not go on the zone'); r.run(5);
  const S = r.L2.ft4.rt.pieces.shelves; assert.deepEqual(S.items.map(q => q.st), ['down', 'down', 'held'], 'the cases: ' + S.items.map(q => q.st));
  r.sdown = true; r.run(1); assert.equal(S.items[2].st, 'down', 'the last case does not lie down when its pillar goes'); }
/* THE DOME COMES IN: on the telescope; the ribs land as slick ledges */
{ const r = rig(); r.mover = { role: 'scope' }; r.run(0.5); assert.equal(r.grid[P('dome').items[0].span[2] * W + P('dome').items[0].span[0]], T.AIR, 'a rib lands untold');
  r.run(3); for (const it of P('dome').items) assert.equal(r.grid[it.span[2] * W + it.span[0]], T.ONEWAY, 'a rib did not land'); assert.equal(r.L2.slick.length, 2, 'the ribs are not slick'); }
/* THE BELL FALLS: not while the Sexton stands; then told, the deck under it breaks, and it is down (act III's front may start) */
{ const r = rig(), p = P('bell'); r.Pl.x = 40 * TS; r.Pl.y = p.deck * TS; r.run(2); assert.equal(r.L2.ft4.rt.bell.st, 'hang', 'the bell falls with the Sexton standing');
  r.sexton = true; r.run(FT4.bell.tell - 0.1); assert.equal(r.log.broke.length, 0, 'the bell falls untold'); r.run(3);
  assert.ok(r.log.broke.length === 1 && r.log.broke[0][0] <= F4.bell.x && r.log.broke[0][1] >= F4.bell.x, 'the deck under the bell does not break'); assert.equal(r.L2.ft4.rt.bell.st, 'down', 'the bell is not down');
  assert.ok(r.log.say.includes(p.after), 'its after-line is not said'); }
/* THE OUTER FACE PEELS: a plank under the running front goes; one over it stays; the top plank is never in the list */
{ const r = rig(), led = F4.peel.ledges, mid = led[4]; r.front = { st: { phase: 'run', pos: mid[2] * TS - 4 } }; r.run(0.1);
  for (const [x0, len, row] of led) assert.equal(r.grid[row * W + x0], row > mid[2] ? T.AIR : T.PLANK, 'the face at row ' + row + ' peels wrong');
  const top = L.ft2.outer.ledges[L.ft2.outer.ledges.length - 1]; assert.ok(!led.some(l => l[2] === top[2]), 'the top plank (the shrine\'s) can peel'); }
out.push('the shelves go in sequence (the last held by its pillar); the ribs land told and frozen; the bell waits for the Sexton, told, breaks the deck; the face peels under the front');
console.log('ok  fallingtower4  ' + out.join('; '));
