// tools/stormhold3.mjs - STORMHOLD 3, THE OUTER WORKS (claude/stormhold3, scratch/brief-stormhold3-1024.md). Node only.
// Replaced the old stormhold2 check (the castle town it asserted is gone). tools/watchtowers.mjs proves the towers, keys and ropes in
// full and tools/bells.mjs the alarm machinery; tools/lance4.mjs proves the Lance's bridge and fight. This file asserts what the
// brief asked of the LEVEL that nothing else checks:
//   1. OUTSIDE THE WALLS: no house interiors, no doorways, no indoor band (RULE OF THE ROAD: Stormhold is outside the walls) -
//      the one room is the Barbican's own gate passage.
//   2. THE CASTLE APPROACH, in order: THE ROAD IN, THE BARBICAN, THE OUTER BAILEY, THE CURTAIN WALL, THE GATEHOUSE, THE LONG BRIDGE;
//      the castle on the skyline grows faster than the default as you climb (L.castleGrow).
//   3. TOWERS CLIMBED FROM OUTSIDE: each watchtower is laid stone with a masons' scaffold on its face, its key on the top deck.
//   4. MURDER HOLES: told drops (unstable weights that wind back up) in holes in the Barbican's vault.
//   5. THE KEPT BEATS: two live bells with sentries; a cutter on a real rope span; the dry moat too wide to jump (the rope crosses it).
//   6. THE WALL-WALK (A14): a real platforming exam - spiked breaches in the walk, jumpable, no shrine inside it.
//   7. THE BRIDGEHEAD EXAM: a foe under a fire cage between the last shrine and the arena, one shrine just outside the arena.
//   8. FEWER CHECKPOINTS (Daniel's difficulty direction): at most one per named area + one before the boss, none closer than 80 columns.
//   9. NO FIRE ARCHERS in Stormhold.
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { STORM_TOWN } from '../src/stormhold-town.js';

const TS = 16, L = LEVELS.find(l => l.id === 'storm').build(), G = (x, y) => L.grid[y * L.W + x];

// ---- 1. OUTSIDE THE WALLS ----
assert.equal(L.indoorRow, undefined, 'no indoor band');
assert.equal(L.ents.filter(e => e.t === 'doorway').length, 0, 'no doorways: nothing to go inside');
assert.equal((L.houses || []).length, 0, 'no houses');
assert.ok((L.interiors || []).length <= 1, 'one room at most - the Barbican passage');
for (const [x0, x1] of L.interiors || []) assert.ok(x0 >= 92 && x1 <= 150, 'the only room is the Barbican\'s passage: ' + x0 + '-' + x1);

// ---- 2. THE CASTLE APPROACH ----
assert.deepEqual(L.playtestSections.map(s => s.name), ['THE ROAD IN', 'THE BARBICAN', 'THE OUTER BAILEY', 'THE CURTAIN WALL', 'THE GATEHOUSE', 'THE LONG BRIDGE'], 'the brief\'s sections, in order');
for (let i = 1; i < L.playtestSections.length; i++) assert.equal(L.playtestSections[i].x0, L.playtestSections[i - 1].x1 + 1, 'the sections tile the level');
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
const ropedCutters = L.ents.filter(e => e.t === 'cutter' && e.bridge !== undefined && (L.bridges || []).some(b => b.x === e.bridge));
assert.ok(ropedCutters.length >= 1, 'a cutter holds a real rope walkway');
let moat = 0, best = 0; for (let x = 200; x < 270; x++) { if (G(x, 34) === T.AIR && G(x, 35) === T.AIR) { moat++; best = Math.max(best, moat); } else moat = 0; }
assert.ok(best >= 7, 'the dry moat is too wide to jump (' + best + ' columns): the Bell Watch\'s rope crosses it');
assert.ok(L.zipLines.some(z => z.x0 < 236 * TS && z.x1 > 247 * TS), 'a tower rope crosses the moat');

// ---- 6. THE WALL-WALK ----
const wall = L.playtestSections[3], walk = 29;
const breaches = []; for (let x = wall.x0; x <= wall.x1; x++) if (G(x, walk) === T.AIR && G(x - 1, walk) === T.SOLID && x > 334) { let w = 0; while (G(x + w, walk) === T.AIR) w++; let sp = false; for (let y = walk; y < walk + 8; y++) if (G(x, y) === T.SPIKE) sp = true; breaches.push([x, w, sp]); }
assert.ok(breaches.length >= 3, 'the wall-walk is breached in three places: ' + JSON.stringify(breaches));
for (const [x, w, sp] of breaches) { assert.ok(w <= 4, 'breach @' + x + ' is a jump (' + w + ')'); assert.ok(sp, 'breach @' + x + ' bites (spikes, not an untold death)'); }
const checks = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b);
assert.ok(!checks.some(x => x >= breaches[0][0] && x <= breaches[breaches.length - 1][0]), 'no shrine inside the wall-walk exam');

// ---- 7. THE BRIDGEHEAD EXAM ----
const P0 = STORM_TOWN.BRIDGE, arenaCheck = checks.filter(x => x > P0 - 5 && x < P0 + 5);
assert.equal(arenaCheck.length, 1, 'one checkpoint just outside the arena');
const examStart = Math.max(...checks.filter(x => x < arenaCheck[0]));
const examCage = L.ents.find(e => e.t === 'weight' && e.lamp && e.x > examStart && e.x < arenaCheck[0]);
assert.ok(examCage, 'a fire cage rehearses the Lance\'s verb in the bridgehead exam');
assert.ok(L.ents.some(e => (e.t === 'pike' || e.t === 'shield' || e.t === 'brute') && Math.abs(e.x - examCage.x) < 8 && e.x > examStart), 'a foe stands by the exam\'s fire cage');

// ---- 8. FEWER CHECKPOINTS ----
assert.ok(checks.length <= L.playtestSections.length, 'at most a shrine a section: ' + checks.join(','));
for (let i = 1; i < checks.length; i++) assert.ok(checks[i] - checks[i - 1] >= 80, 'shrines ' + checks[i - 1] + ' and ' + checks[i] + ' are too close');

// ---- 9. NO FIRE ARCHERS ----
assert.equal(L.ents.filter(e => e.t === 'archer' && e.fire).length, 0, 'no fire archers in Stormhold');

console.log('Stormhold 3: ' + L.W + ' columns, outside the walls (one room: the Barbican passage); ' + L.playtestSections.length + ' sections; three towers climbed on their scaffolds; ' +
  holes.length + ' murder holes; ' + sentries.length + ' bells; a moat of ' + best + ' under a rope; ' + breaches.length + ' breaches in the wall-walk; the bridgehead exam (shrine ' + examStart + ' -> cage@' + examCage.x + ' -> arena shrine ' + arenaCheck[0] + '); shrines at ' + checks.join(', ') + '.');
