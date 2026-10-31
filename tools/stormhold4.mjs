// tools/stormhold4.mjs - STORMHOLD 4, THE OUTER WORKS WITH THE HAUL LINES (claude/lance4 lane 2, scratch/brief-lance4-1029.md s4). Node only.
// Replaced tools/stormhold3.mjs (its asserts are kept below, retargeted: the gatehouse moved +180 and its exam is a bell-gate now).
// tools/watchtowers.mjs proves the towers, keys and ropes; tools/bells.mjs the alarms; tools/lance4.mjs the Lance's bridge and fight. This file:
//   1. OUTSIDE THE WALLS: no house interiors, no doorways, no indoor band - the one room is the Barbican's own gate passage.
//   2. THE CASTLE APPROACH, in order, now SEVEN areas: ... THE CURTAIN WALL, THE HAUL LINES, THE GATEHOUSE, THE LONG BRIDGE; the castle grows on the skyline.
//   3. TOWERS CLIMBED FROM OUTSIDE (stone, a masons' scaffold, the key on top).   4. MURDER HOLES.   5. THE KEPT BEATS (bells, cutter, moat).
//   6. THE WALL-WALK (A14).
//   7. THE BELL-GATES (src/bell-gate.js): THE GATEHOUSE BELL teaches (a pike it calls runs under its gate in time), THE BRIDGEHEAD EXAM is a gate
//      tower (two pikes and a shielded captain answer it) between the last shrine and the arena - driven in Node: the gate takes them.
//   8. FIVE SHRINES (Q5): 152, 254, the Wall Watch's deck, the gatehouse yard, the arena's; none closer than 80; at most one an area.
//   9. NO FIRE ARCHERS.
//  10. THE HAUL LINES: A (the Wall Watch's rope) and B over the ditch's flat bottom, a ladder back up; the haul tower; L1-L4 over the spiked gorge;
//      every transfer window (A->B drop, L1->L2 up, L2->L3 drop, L3->L4 up) >= 7 tiles inside the brief's reach; L1-L3 end in the air (the lines are
//      the way); L4 sets you on the barbican's plinth; anchored to the gorge floor; the reach model crosses ONLY rope to rope.
//  11. THE RIDE, DRIVEN (src/zipline.js zipStep + src/haul-lines.js haulStep, with a body that falls): every transfer made with the real keys' flags,
//      the mangonel's ring 1.3 s ahead with the escape in reach, never two stones, the remix's stone parts L3, the parted line drops its rider, the engine wrecked in 5.
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { STORM_TOWN } from '../src/stormhold-town.js';
import { floodReach } from '../src/reachcore.js';
import { zipStep, lineY, norm } from '../src/zipline.js';
import { HAUL, haulStep, haulState, inTransfer, escapeRun } from '../src/haul-lines.js';
import { BELLGATE, makeGateBell, gateBellStep, answerRun } from '../src/bell-gate.js';
import { LANCE4 } from '../src/lance-support.js';

const TS = 16, L = LEVELS.find(l => l.id === 'storm').build(), G = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
const { G0 } = STORM_TOWN, P0 = STORM_TOWN.BRIDGE;
const sec = name => L.playtestSections.find(s => s.name === name);

// ---- 1. OUTSIDE THE WALLS ----
assert.equal(L.indoorRow, undefined, 'no indoor band');
assert.equal(L.ents.filter(e => e.t === 'doorway').length, 0, 'no doorways: nothing to go inside');
assert.equal((L.houses || []).length, 0, 'no houses');
assert.ok((L.interiors || []).length <= 1, 'one room at most - the Barbican passage');
for (const [x0, x1] of L.interiors || []) assert.ok(x0 >= 92 && x1 <= 150, 'the only room is the Barbican\'s passage: ' + x0 + '-' + x1);

// ---- 2. THE CASTLE APPROACH ----
assert.deepEqual(L.playtestSections.map(s => s.name), ['THE ROAD IN', 'THE BARBICAN', 'THE OUTER BAILEY', 'THE CURTAIN WALL', 'THE HAUL LINES', 'THE GATEHOUSE', 'THE LONG BRIDGE'], 'the brief\'s sections, in order');
for (let i = 1; i < L.playtestSections.length; i++) assert.equal(L.playtestSections[i].x0, L.playtestSections[i - 1].x1 + 1, 'the sections tile the level');
assert.equal(L.W, 798, 'the level is ~800 columns (618 + 180)'); assert.equal(P0, 670, 'the bridge moved +180'); assert.equal(G0, 576, 'the gatehouse moved +180');
assert.ok(L.castle && L.castleGrow > 0.9, 'the castle on the skyline comes on faster than a far landmark (castleGrow ' + L.castleGrow + ')');

// ---- 3. TOWERS CLIMBED FROM OUTSIDE ----
assert.equal(L.watchtowers.length, 3, 'three watchtowers');
for (const t of L.watchtowers) {
  assert.ok(t.floor - t.top >= 8, t.name + ' is a real climb: ' + (t.floor - t.top) + ' rows');
  assert.ok((L.masonry || []).some(([x0, x1, y0, y1]) => x0 >= t.x0 - 1 && x1 <= t.x1 && y0 <= t.top + 1 && y1 >= t.floor - 9), t.name + ' is laid stone');
  assert.ok((L.structures || []).some(s => s.scaffold && s.x1 >= t.x0 - 1 && s.x0 <= t.x0 + 4), t.name + ' has the masons\' scaffold on its face');
  const key = L.ents.find(e => e.t === 'key' && e.kind === t.key);
  assert.ok(key && key.y === t.top - 1 && key.x >= t.x0 && key.x <= t.x1, t.name + ': the ' + t.key + ' key is on the top deck');
}

// ---- 4. MURDER HOLES ----
const barb = L.playtestSections[1];
const holes = L.ents.filter(e => e.t === 'weight' && e.unstable && e.crane && e.x >= barb.x0 && e.x <= barb.x1);
assert.ok(holes.length >= 4, 'murder holes in the Barbican vault: ' + holes.length);
for (const h of holes) { assert.equal(G(h.x, h.y - 1), T.SOLID, 'murder hole @' + h.x + ' is cut through laid stone'); assert.equal(G(h.x, h.y + h.len), T.AIR, 'a stone drops out of hole @' + h.x + ' into the passage'); }

// ---- 5. THE KEPT BEATS ----
const sentries = L.ents.filter(e => e.t === 'sentry' && e.section), bells = L.ents.filter(e => e.t === 'bell' && e.section);
assert.ok(sentries.length >= 2, 'two sentries carry a bell section: ' + sentries.length);
for (const s of sentries) assert.ok((L.alarms || []).some(a => a.id === s.section) && bells.some(b => b.section === s.section), 'sentry@' + s.x + ' has a live alarm and a bell');
assert.ok(L.ents.some(e => e.t === 'cutter' && e.bridge !== undefined && (L.bridges || []).some(b => b.x === e.bridge)), 'a cutter holds a real rope walkway');
let moat = 0, best = 0; for (let x = 200; x < 270; x++) { if (G(x, 34) === T.AIR && G(x, 35) === T.AIR) { moat++; best = Math.max(best, moat); } else moat = 0; }
assert.ok(best >= 7, 'the dry moat is too wide to jump (' + best + ' columns): the Bell Watch\'s rope crosses it');
assert.ok(L.zipLines.some(z => z.x0 < 236 * TS && z.x1 > 247 * TS), 'a tower rope crosses the moat');

// ---- 6. THE WALL-WALK ----
const wall = sec('THE CURTAIN WALL'), walk = 29;
const breaches = []; for (let x = wall.x0; x <= wall.x1; x++) if (G(x, walk) === T.AIR && G(x - 1, walk) === T.SOLID && x > 334 && x < 388) { let w = 0; while (G(x + w, walk) === T.AIR) w++; let sp = false; for (let y = walk; y < walk + 8; y++) if (G(x, y) === T.SPIKE) sp = true; breaches.push([x, w, sp]); }
assert.ok(breaches.length >= 3, 'the wall-walk is breached in three places: ' + JSON.stringify(breaches));
for (const [x, w, sp] of breaches) { assert.ok(w <= 4, 'breach @' + x + ' is a jump (' + w + ')'); assert.ok(sp, 'breach @' + x + ' bites (spikes, not an untold death)'); }
const checks = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b);
assert.ok(!checks.some(x => x >= breaches[0][0] && x <= breaches[breaches.length - 1][0]), 'no shrine inside the wall-walk exam');

// ---- 7. THE BELL-GATES ----
const gbs = L.ents.filter(e => e.t === 'gatebell');
assert.equal(gbs.length, 2, 'two bell-gates: the gatehouse bell (teach) and the bridgehead\'s gate tower (exam)');
const answering = id => L.ents.filter(e => e.answers === id);
for (const b of gbs) {
  for (let y = b.gy0; y <= b.gy1; y++) assert.equal(G(b.gate, y), T.AIR, b.id + ': its gate column is open at row ' + y + ' (the bars hang up until it drops)');
  assert.ok(G(b.gate, b.gy1 + 1) === T.SOLID, b.id + ': the gate drops onto the floor');
  assert.ok(G(b.x, b.y + 1) === T.ONEWAY || G(b.x, b.y + 1) === T.SOLID, b.id + ': the bell stands on a deck');
  assert.ok(b.gy1 + 1 - (b.y + 1) <= 3, b.id + ': its deck is one held jump (3 rows) off the floor');
  const a = answering(b.id); assert.ok(a.length >= 1, b.id + ': a foe answers it');
  for (const e of a) assert.ok(e.x > b.gate && Math.abs(e.x - b.gate) * TS <= BELLGATE.run * BELLGATE.answer, b.id + ': the ' + e.t + '@' + e.x + ' can reach the gate while it runs');
}
const teach = gbs.find(b => b.id === 'gatehouse'), exam = gbs.find(b => b.id === 'bridgehead');
assert.ok(teach && teach.x >= G0 && teach.x < G0 + 30, 'the gatehouse bell is in the gatehouse yard');
assert.ok(L.ents.some(e => e.t === 'sign' && Math.abs(e.x - teach.x) <= 8 && /RING THE BELL/.test(e.text) && /UNDER IT/.test(e.text)), 'its sign says the verb: RING THE BELL ... UNDER IT');
{ const a = answering('gatehouse').sort((p, q) => p.x - q.x)[0]; assert.ok(Math.abs(a.x - teach.gate) * TS / BELLGATE.run <= LANCE4.bell.span + 0.05, 'the teach\'s pike is under the gate by the third toll (' + (Math.abs(a.x - teach.gate) * TS / BELLGATE.run).toFixed(2) + ' s)'); }
const arenaCheck = checks.filter(x => x > P0 - 5 && x < P0 + 5); assert.equal(arenaCheck.length, 1, 'one checkpoint just outside the arena');
const examStart = Math.max(...checks.filter(x => x < arenaCheck[0]));
assert.ok(exam && exam.x > examStart && exam.x < arenaCheck[0], 'the bridgehead exam\'s gate tower stands between the last shrine (' + examStart + ') and the arena');
{ const a = answering('bridgehead'); assert.ok(a.filter(e => e.t === 'pike').length >= 2 && a.some(e => e.t === 'shield'), 'two pikes and the shielded captain answer the bridgehead bell'); }
assert.ok(!L.ents.some(e => e.t === 'weight' && e.lamp && e.x >= G0), 'no fire cage left in the gatehouse (Q3: the cages are gone; the bell-gate rehearses the Lance)');
assert.ok(!L.ents.some(e => e.t === 'winch' && e.x >= G0 && e.x < P0), 'the gatehouse winch became its bell');
/* DRIVEN: ring the exam's bell; the foes it calls run; the third toll drops the gate and it takes them */
function ringDriven(b) { const pr = makeGateBell(b, b.x * TS + 8, (b.y + 1) * TS, TS); const grid = L.grid.slice();
  const foes = L.ents.filter(e => e.answers === b.id || (e.t === 'pike' && Math.abs(e.x - b.gate) < 30 && e.x > b.gate)).map(e => ({ t: e.t, x: e.x * TS + 8, y: (e.y + 1) * TS, w: 10, h: 12, alive: true, answers: e.answers, stagger: 0, vy: 0, face: -1 }));
  const mb = (q, dx, dy) => { const nx = q.x + dx, c = Math.floor((nx + Math.sign(dx) * q.w / 2) / TS), r = Math.floor((q.y - 1) / TS); if (dx && grid[r * L.W + c] === T.PORT) return { hitX: true, ground: true }; q.x = nx; return { ground: true }; };
  let crushed = 0, closed = false; const hb = { l: pr.x - 4, r: pr.x + 4, t: pr.y - 10, b: pr.y };
  const io = { TS, hb, P: { x: pr.x - 30, y: pr.y, dead: false }, enemies: foes, hitSet: new Set(), overlap: (a, c) => a.l < c.r && a.r > c.l && a.t < c.b && a.b > c.t,
    closeGate: (col, y0, y1) => { closed = true; for (let y = y0; y <= y1; y++) grid[y * L.W + col] = T.PORT; }, openGate: (col, y0, y1) => { for (let y = y0; y <= y1; y++) grid[y * L.W + col] = T.AIR; },
    crush: e => { e.alive = false; crushed++; }, say: () => {}, sfx: () => {} };
  for (let f = 0; f < 240; f++) { gateBellStep(pr, 1 / 60, io); io.hb = null; for (const e of foes) if (e.alive) answerRun(e, 1 / 60, mb); }
  return { crushed, closed, called: foes.filter(e => e.answers === b.id).length }; }
{ const r = ringDriven(teach); assert.ok(r.closed && r.crushed >= 1, 'the gatehouse bell, rung: its pike runs to it and the gate takes it (' + JSON.stringify(r) + ')'); }
const examRun = ringDriven(exam); assert.ok(examRun.closed && examRun.crushed >= 2, 'the bridgehead bell, rung: the gate takes two of the three that charge at it (' + JSON.stringify(examRun) + ')');

// ---- 8. FIVE SHRINES ----
assert.equal(checks.length, 5, 'five shrines (Q5, +29% length): ' + checks.join(','));
assert.ok(checks.length <= L.playtestSections.length, 'at most a shrine a section: ' + checks.join(','));
for (let i = 1; i < checks.length; i++) assert.ok(checks[i] - checks[i - 1] >= 80, 'shrines ' + checks[i - 1] + ' and ' + checks[i] + ' are too close');
const T3 = L.watchtowers[2]; assert.ok(checks.some(x => x >= T3.x0 && x <= T3.x1 && L.ents.find(e => e.t === 'check' && e.x === x).y === T3.top - 1), 'a shrine on the Wall Watch\'s deck, before the haul lines');
assert.ok(checks.some(x => x >= G0 && x <= G0 + 6), 'a shrine at the gatehouse yard\'s landing, after them');
for (const x of checks) assert.ok(!(x > sec('THE HAUL LINES').x0 && x < sec('THE HAUL LINES').x1), 'no shrine inside the haul lines (' + x + ')');

// ---- 9. NO FIRE ARCHERS ----
assert.equal(L.ents.filter(e => e.t === 'archer' && e.fire).length, 0, 'no fire archers in Stormhold');

// ---- 10. THE HAUL LINES ----
const H = id => L.zipLines.find(z => z.haul === id);
const [A, B, L1, L2, L3, L4] = ['A', 'B', 'L1', 'L2', 'L3', 'L4'].map(H); for (const z of [A, B, L1, L2, L3, L4]) { assert.ok(z, 'six haul lines'); norm(z); assert.equal(z.speed, 180, z.haul + ' runs at 180'); assert.equal(z.dir, 1, z.haul + ' rides east'); }
assert.equal(L.zipLines.indexOf(A), 2, 'line A is the Wall Watch\'s own rope (the third tower rope)');
assert.equal(A.y0, T3.top * TS - 12, 'line A starts on the Wall Watch\'s deck');
assert.ok(L.zipTransfer, 'the level says the reach model rides rope to rope (src/reachcore.js)');
/* a hero on any line meets no rock */
for (const z of [A, B, L1, L2, L3, L4]) for (let px = z.x0 + 8; px <= z.x1 - 5; px += 4) { const feet = lineY(z, px) + 12;
  for (const [ox, oy] of [[-5, -2], [5, -2], [-5, -22], [5, -22], [0, -12]]) { const t = G(Math.floor((px + ox) / TS), Math.floor((feet + oy) / TS)); assert.ok(t !== T.SOLID && t !== T.SPIKE, z.haul + ': a rider meets rock at px ' + px); } }
/* the teach is over the ditch's flat bottom: no teeth under A or B, and a ladder up the Wall Watch's east face */
for (let x = 396; x <= 441; x++) { let y = 21; while (y < L.H && [T.AIR, T.NET, T.ONEWAY].includes(G(x, y))) y++; assert.ok(G(x, y) === T.SOLID && G(x, y - 1) !== T.SPIKE, 'the ditch under the teach is flat ground at ' + x); }
{ let net = 0; for (let y = T3.top; y <= 41; y++) if (G(396, y) === T.NET) net++; assert.ok(net >= 41 - T3.top, 'a ladder from the ditch bottom up to the Wall Watch\'s deck (a miss walks back)'); }
assert.ok(L.ents.some(e => e.t === 'shield' && e.x * TS > A.x0 && e.x * TS < A.x0 + 0.5 * (A.x1 - A.x0) && e.y === 41), 'a shield stands under line A\'s first stretch (the drop-strike)');
assert.ok(L.ents.some(e => e.t === 'sign' && /JUMP OFF ONE AND TOUCH THE OTHER/.test(e.text)) && L.ents.some(e => e.t === 'sign' && /SHIELD CANNOT FACE UP/.test(e.text)), 'the teach\'s two signs');
/* THE WINDOWS: each transfer >= 7 tiles, in the brief's reach (up: 1-2.5 rows over; down: 1-3 rows under) */
const windowOf = (a, b, up) => { let run = 0, bestRun = 0; for (let px = Math.max(a.xa, b.xa); px <= Math.min(a.xb, b.xb); px += 2) { const dy = lineY(b, px) - lineY(a, px), ok = inTransfer(a, b, px) && (up ? dy <= -14 && dy >= -40 : dy >= 14 && dy <= 48); run = ok ? run + 2 : 0; bestRun = Math.max(bestRun, run); } return bestRun / TS; };
const wins = { 'A->B': windowOf(A, B, false), 'L1->L2': windowOf(L1, L2, true), 'L2->L3': windowOf(L2, L3, false), 'L3->L4': windowOf(L3, L4, true) };
for (const [k, v] of Object.entries(wins)) assert.ok(v >= 7, 'the ' + k + ' window is >= 7 tiles (' + v.toFixed(1) + ')');
/* REQUIRED: A, L1, L2 and L3 end in the air (A over the ditch, the rest over the teeth); B lands on the haul tower, L4 on the barbican's plinth */
const footUnder = z => { const c = Math.floor(z.xb / TS); for (let r = Math.floor((z.y1 + 12) / TS); r < L.H; r++) if (G(c, r) !== T.AIR && G(c, r) !== T.NET) return [r, G(c, r), G(c, r - 1)]; return null; };
for (const z of [L1, L2, L3]) { const [r, , over] = footUnder(z); assert.ok(over === T.SPIKE || G(Math.floor(z.xb / TS), r) === T.SPIKE, z.haul + ' ends in the air over the teeth (row ' + r + ')'); assert.ok(r * TS - (z.y1 + 12) > 5 * TS, z.haul + ' ends far over them'); }
{ const [r] = footUnder(A); assert.ok(r * TS - (A.y1 + 12) > 5 * TS, 'line A ends in the air over the ditch'); }
for (const [z, x0, x1] of [[B, 437, 441], [L4, 557, 565]]) { const c = Math.floor(z.xb / TS), r = Math.round((z.y1 + 12) / TS); assert.ok(c >= x0 && c <= x1 && (G(c, r) === T.ONEWAY || G(c, r) === T.SOLID), z.haul + ' sets you down on footing at ' + c + ',' + r); }
/* the gorge: too wide to jump, teeth the whole way */
{ let sp = 0; for (let x = 447; x <= 556; x++) if (G(x, 43) === T.SPIKE) sp++; assert.ok(sp >= 100, 'the gorge under the test is teeth for ' + sp + ' columns'); }
/* ANCHORED: every haul line's posts reach the gorge floor / a deck; the haul tower and the barbican are laid stone down to the gorge floor */
for (const z of [A, B, L1, L2, L3, L4]) for (const [px, , gy] of z.posts) { const c = Math.floor(px / TS), r = Math.round(gy / TS); assert.ok([T.SOLID, T.ONEWAY].includes(G(c, r)) || G(c, r) === T.SPIKE && G(c, r + 1) === T.SOLID, z.haul + ': its post at ' + c + ' stands on something (row ' + r + ')'); }
for (const [x0, x1] of [[442, 446], [566, 575]]) assert.ok((L.masonry || []).some(([a, b, , y1]) => a <= x0 && b >= x1 && y1 >= L.H - 1), 'laid stone ' + x0 + '-' + x1 + ' stands on the gorge floor');
/* THE MANGONEL on the barbican's top, and a ladder up the barbican from the plinth */
assert.ok(L.mangonel && G(L.mangonel.x, L.mangonel.y + 1) === T.SOLID && G(L.mangonel.x, L.mangonel.y) === T.AIR, 'the mangonel stands on the barbican\'s top');
{ let net = 0; for (let y = L.mangonel.y; y <= 36; y++) if (G(565, y) === T.NET) net++; assert.ok(net >= 36 - L.mangonel.y, 'a ladder up the barbican from the plinth'); }
/* THE REACH MODEL: with rope-to-rope the fill crosses to the gatehouse and the bridge; without it the far side is out of reach (the lines are the way) */
const seen = floodReach(L, T), seenNo = floodReach({ ...L, zipTransfer: false }, T);
const has = (s, x0, x1, y0, y1) => { for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) if (s.has(x + ',' + y)) return true; return false; };
const R = s => (s.seen || s.reach || s);
const rs = R(seen), rn = R(seenNo);
assert.ok(rs instanceof Set || rs.has, 'floodReach returns the reached cells');
assert.ok(has(rs, 557, 565, 36, 36), 'the reach model rides the haul lines to the barbican plinth');
assert.ok(has(rs, G0, G0 + 10, 29, 29) && has(rs, P0, P0 + 4, 29, 29), 'and on into the gatehouse yard and onto the bridge');
assert.ok(!has(rn, 557, 565, 36, 36) && !has(rn, G0, G0 + 10, 29, 29), 'without rope-to-rope the far side is out of reach: the transfers are required');

// ---- 11. THE RIDE, DRIVEN ----
const noop = () => {}, SFX = new Proxy({}, { get: () => noop });
function rig() { for (const z of L.zipLines) { z.cut = 0; z.whip = 0; } delete L.haulState;
  const P = { x: 0, y: 0, vx: 0, vy: 0, face: 1, ground: false, hp: 100, hurt: 0, hitSet: new Set() }, keys = {}, marks = new Set(), log = { stones: [], dmg: 0, said: [] };
  const zc = { P, L, keys, upPress: false, jumpPress: false, SFX, callout: noop, burst: noop, sparks: noop, number: noop };
  const hc = { P, L, hb: null, hitSet: P.hitSet, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, marks, damage: (x, d) => { log.dmg += d; P.hurt = 0.3; }, sfx: noop, say: (x, y, t) => log.said.push(t), burst: noop, shake: noop };
  /* one frame: the rope, the engine, then the body moves (a body off the rope falls: g 1000) and lands on the first footing under it */
  const step = (dt = 1 / 60) => { zipStep(zc, dt); zc.upPress = zc.jumpPress = false; haulStep(hc, dt); const H2 = haulState(L); if (H2.stones.length > log.stones.length) log.stones = H2.stones.slice();
    if (P.hurt > 0) P.hurt -= dt;
    if (!P.zip) { P.vy = Math.min(600, P.vy + 1000 * dt); }
    const ny = P.y + P.vy * dt, nx = P.x + P.vx * dt; P.ground = false;
    if (!P.zip && P.vy >= 0) { const c = Math.floor(nx / TS), r0 = Math.floor(P.y / TS), r1 = Math.floor(ny / TS); for (let r = r0; r <= r1; r++) { const t = G(c, r); if (r * TS >= P.y - 0.01 && r * TS <= ny + 0.01 && (t === T.SOLID || t === T.ONEWAY || t === T.SPIKE)) { P.y = r * TS; P.vy = 0; P.ground = t !== T.SPIKE; P.spiked = t === T.SPIKE; P.vx = 0; return; } } }
    P.x = nx; P.y = ny; };
  return { P, keys, zc, hc, step, log, marks }; }
const boardAt = (r, z, x) => { r.P.x = x; r.P.y = lineY(z, x) + 12; r.P.ground = true; r.keys.up = true; r.step(); r.keys.up = false; assert.equal(r.P.zip, z, 'UP takes ' + z.haul + ' at ' + Math.round(x / TS)); };
const rideTo = (r, z, tile) => { for (let f = 0; f < 900 && r.P.zip === z && r.P.x < tile * TS; f++) r.step(); };
const kick = (r, how) => { if (how === 'jump') r.zc.jumpPress = true; else r.keys.down = true; r.step(); r.keys.down = false; };
const until = (r, fn, n = 120) => { for (let f = 0; f < n && !fn(); f++) r.step(); return fn(); };
/* A -> B over the ditch (DOWN), and B to the haul tower's landing; a rider who rides A out drops into the ditch (no teeth) */
{ const r = rig(); boardAt(r, A, A.x0 + 4); rideTo(r, A, 418); kick(r, 'down'); assert.ok(until(r, () => r.P.zip === B), 'a DOWN off line A over its second half is caught by line B');
  until(r, () => r.P.ground, 600); assert.ok(r.P.ground && Math.abs(r.P.y - 30 * TS) < 2 && r.P.x > 436 * TS, 'line B sets him on the haul tower\'s landing (' + Math.round(r.P.x / TS) + ',' + r.P.y / TS + ')');
  assert.equal(haulState(L).stones.length + r.log.stones.length, 0, 'no stones in the teach'); }
{ const r = rig(); boardAt(r, A, A.x0 + 4); until(r, () => !r.P.zip, 900); until(r, () => r.P.ground, 300); assert.ok(r.P.ground && !r.P.spiked && Math.abs(r.P.y - 42 * TS) < 2, 'riding line A out drops him on the ditch\'s bottom, unhurt (' + Math.round(r.P.x / TS) + ',' + r.P.y / TS + ')'); }
/* L1 -> L2 (JUMP up) -> L3 (DOWN) -> L4 (JUMP up) -> the barbican's plinth, with the mangonel throwing and the remix's stone parting L3 behind him */
{ const r = rig(); boardAt(r, L1, L1.x0 + 4);
  assert.ok(until(r, () => r.log.stones.length >= 1, 90), 'the mangonel throws within 1.5 s of a ride on L1');
  const s1 = r.log.stones[0]; assert.equal(s1.z, L1, 'the first ring is on L1 - the rope he rides');
  assert.ok(Math.abs(s1.tx - (r.P.x + 180 * HAUL.lead)) < 24, 'the ring is 1.3 s ahead at line speed (' + Math.round((s1.tx - r.P.x) / TS) + ' tiles)');
  assert.ok(escapeRun(L, L1, r.P.x, s1.tx) >= HAUL.escape * TS, 'the escape (L2) is in reach for 7+ tiles before the ring');
  rideTo(r, L1, 461); kick(r, 'jump'); assert.ok(until(r, () => r.P.zip === L2), 'a JUMP off L1 at 461 is caught by L2 above');
  until(r, () => !haulState(L).stones.length, 120); assert.equal(r.log.dmg, 0, 'off the ringed line in time: the stone misses');
  rideTo(r, L2, 503); assert.ok(haulState(L).stones.length <= 1, 'never two stones in flight');
  kick(r, 'down'); assert.ok(until(r, () => r.P.zip === L3), 'a DOWN off L2 at 503 is caught by L3 under it');
  rideTo(r, L3, 531); const cut = haulState(L).stones.find(s => s.cut); assert.ok(cut && cut.z === L3 && cut.tx > r.P.x, 'past the remix\'s trigger, a stone for the LINE, ahead of him on L3');
  rideTo(r, L3, 536); kick(r, 'jump'); assert.ok(until(r, () => r.P.zip === L4), 'a JUMP off L3 at 536 is caught by L4 above');
  until(r, () => L3.cut > 0, 120); assert.ok(L3.cut > 0 && L3.whip > 0, 'the stone parts L3 (it whips down; re-strung in ' + HAUL.restring + ' s)');
  until(r, () => r.P.ground, 900); assert.ok(r.P.ground && r.P.x >= 557 * TS && Math.abs(r.P.y - 37 * TS) < 2, 'L4 sets him on the barbican\'s plinth (' + Math.round(r.P.x / TS) + ',' + r.P.y / TS + ')');
  assert.equal(r.log.dmg, 0, 'the clean ride takes no stone');
  /* the engine: five blows wreck it, and it throws no more */
  const m = haulState(L).m; for (let k = 0; k < HAUL.hp; k++) { r.hc.hb = { l: m.x - 4, r: m.x + 4, t: m.y - 20, b: m.y }; r.P.hitSet.clear(); r.step(); }
  r.hc.hb = null; assert.ok(m.wrecked && r.marks.has('mang:' + L.mangonel.x), 'five blows wreck the mangonel (marked for the run)');
  const r2 = rig(); r2.marks.add('mang:' + L.mangonel.x); boardAt(r2, L1, L1.x0 + 4); for (let f = 0; f < 240; f++) r2.step(); assert.equal(r2.log.stones.length, 0, 'a wrecked mangonel throws nothing'); }
/* a rider who stays on a ringed line is hit (12) and lets go; a rider still on L3 when it parts falls */
{ const r = rig(); boardAt(r, L1, L1.x0 + 4); until(r, () => r.log.stones.length >= 1, 90); until(r, () => !haulState(L).stones.length || !r.P.zip, 200);
  assert.ok(r.log.dmg === HAUL.dmg && !r.P.zip, 'staying on the ringed line: the stone hits (' + r.log.dmg + ') and he lets go'); }
{ const r = rig(); boardAt(r, L3, 515 * TS); until(r, () => L3.cut > 0, 300); r.step(); assert.ok(L3.cut > 0 && r.P.zip !== L3, 'still on L3 when the stone parts it: he falls'); }

console.log('Stormhold 4: ' + L.W + ' columns, ' + L.playtestSections.length + ' areas; three towers; ' + holes.length + ' murder holes; ' + sentries.length + ' bells; a moat of ' + best + '; ' + breaches.length + ' breaches; ' +
  'THE HAUL LINES: windows ' + Object.entries(wins).map(([k, v]) => k + ' ' + v.toFixed(1)).join(', ') + ' tiles; the reach model crosses only rope to rope; the ride driven clean (stones dodged, L3 parted behind him, the mangonel wrecked in 5); ' +
  'bell-gates: the gatehouse teach takes its pike, the bridgehead takes ' + examRun.crushed + ' of ' + examRun.called + '; shrines at ' + checks.join(', ') + '.');
