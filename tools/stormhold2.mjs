// tools/stormhold2.mjs — THE STORMHOLD REWORK (claude/stormhold2, docs/level-design/wood-to-highcrown-design.md
// "## 11. STORMHOLD"): Daniel played the held branch and it "still didn't seem appropriate". Node only. tools/watchtowers.mjs
// and tools/bells.mjs already prove the towers/keys/ropes and the alarm machinery in full; this file asserts the five
// things this lane's brief asked for that nothing else checks:
//   1. LONGER than the held branch it was built from (672 columns, docs/level-design/wood-to-highcrown-design.md "## 11").
//   2. TALL WATCHTOWERS, each at least six rows of climb, with its key on the top deck (a light sanity check; the full
//      geometry - the ladder, the rope, the sign - is tools/watchtowers.mjs's job).
//   3. WALKWAYS: at least one rope span outside the boss's own bridge (a tower-to-roof or roof-to-roof crossing).
//   4. THE AUDIT'S BEATS: every sentry's bell (tools/bells.mjs proves the alarm itself fires, drops and lifts); a
//      cutter that actually holds a rope (bridge) to cut, not a bystander; an EXAM at the bridgehead - a foe placed
//      under a fire-cage weight, between a checkpoint and the arena, per RULES S3.
//   5. NO FIRE ARCHERS anywhere in Stormhold, and the Lance's own lookouts and archers untouched (tools/lance-support.mjs
//      proves those in full: two end lookouts, no fire, told and cleared).
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';

const TS = 16, L = LEVELS.find(l => l.id === 'storm').build();
const HELD_BRANCH_WIDTH = 672;   // origin/claude/stormhold, 5f3ede7 - the branch this lane's brief says "still didn't seem appropriate"

// ---- 1. LONGER ----
assert.ok(L.W > HELD_BRANCH_WIDTH, 'Stormhold is longer than the held branch it was built from: ' + L.W + ' > ' + HELD_BRANCH_WIDTH);

// ---- 2. TALL WATCHTOWERS, KEYS AT THE TOP (tools/watchtowers.mjs proves the rest: ladder, rope, sign) ----
assert.equal(L.watchtowers.length, 3, 'three watchtowers');
for (const t of L.watchtowers) {
  assert.ok(t.floor - t.top >= 6, t.name + ' is a real climb, not a step: ' + (t.floor - t.top) + ' rows');
  const key = L.ents.find(e => e.t === 'key' && e.kind === t.key);
  assert.ok(key && key.y === t.top - 1 && key.x >= t.x0 && key.x <= t.x1, t.name + ': the ' + t.key + ' key is on the top deck');
}

// ---- 3. WALKWAYS: a rope span off the boss's own bridge (a tower-to-roof / roof-to-roof crossing) ----
const P0 = L.arena.x0 / TS, bridgeBridges = new Set();
for (let k = 0; k < 8; k++) bridgeBridges.add(P0 + k * 18 - 13);   // the Lance's own spans start here; anything else is a town walkway
const townBridges = (L.bridges || []).filter(b => b.x < P0 - 20);
assert.ok(townBridges.length >= 1, 'at least one rope walkway stands in the town, off the boss\'s own bridge');

// ---- 4. THE AUDIT'S BEATS ----
// sentries and bells: tools/bells.mjs drives the real update (rung, dropped, lifted, quiet, the 20s clock); here, just that
// they exist and are wired to a live alarm section, which is the level's half of that contract.
const sentries = L.ents.filter(e => e.t === 'sentry' && e.section), bells = L.ents.filter(e => e.t === 'bell' && e.section);
assert.ok(sentries.length >= 2, 'at least two sentries carry a bell section: ' + sentries.length);
for (const s of sentries) assert.ok((L.alarms || []).some(a => a.id === s.section) && bells.some(b => b.section === s.section), 'sentry@' + s.x + ',' + s.y + ' (' + s.section + ') has a live alarm and a bell');

// cutters: a `cutter` entity with a `bridge` field that names a REAL span in L.bridges (the audit's gap: Stormhold's
// cutters had no rope - a cutter with no bridge just idles as a melee foe, per updateCutter in src/main.js).
const ropedCutters = L.ents.filter(e => e.t === 'cutter' && e.bridge !== undefined && (L.bridges || []).some(b => b.x === e.bridge));
assert.ok(ropedCutters.length >= 1, 'at least one cutter holds a real rope: ' + ropedCutters.map(c => c.x + ',' + c.y + '->' + c.bridge).join('; '));

// THE EXAM (RULES S3): a checkpoint opens it, a foe stands under a fire-cage weight, and it ends at the checkpoint
// outside the arena with nothing in between.
const checks = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b);
const arenaCheck = checks.filter(x => x > L.arena.x0 / TS - 5 && x < L.arena.x0 / TS + 5);
assert.ok(arenaCheck.length === 1, 'one checkpoint just outside the arena: ' + arenaCheck.join(','));
const examStart = Math.max(...checks.filter(x => x < arenaCheck[0]));
assert.ok(!checks.some(x => x > examStart && x < arenaCheck[0]), 'RULES S3: no checkpoint inside the exam (' + examStart + '-' + arenaCheck[0] + ')');
const examCage = L.ents.find(e => e.t === 'weight' && e.x > examStart && e.x < arenaCheck[0] && e.lamp);
assert.ok(examCage, 'a fire-cage weight rehearses the Lance\'s own verb in the exam');
const examFoe = L.ents.find(e => e.x > examStart && e.x < arenaCheck[0] && Math.abs(e.x - examCage.x) < 12 && (e.t === 'pike' || e.t === 'shield' || e.t === 'brute'));
assert.ok(examFoe, 'a foe stands under the exam\'s fire cage, not just decoration');

// ---- 5. NO FIRE ARCHERS (his own lookouts and archers stay as on master: tools/lance-support.mjs proves those) ----
const fireArchers = L.ents.filter(e => e.t === 'archer' && e.fire);
assert.equal(fireArchers.length, 0, 'no fire archers anywhere in Stormhold: found ' + fireArchers.map(e => e.x + ',' + e.y).join('; '));

console.log('Stormhold2: ' + L.W + ' columns (held branch was ' + HELD_BRANCH_WIDTH + '); three towers, all a real climb, keys on their decks; ' +
  townBridges.length + ' town walkway(s) off the boss bridge; ' + sentries.length + ' bell(s) live; ' + ropedCutters.length +
  ' cutter(s) holding a real rope; the exam (checkpoint ' + examStart + ' -> cage@' + examCage.x + ' -> foe@' + examFoe.x + ' -> arena checkpoint ' + arenaCheck[0] + '); no fire archers.');
