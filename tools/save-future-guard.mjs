/* tools/save-future-guard.mjs - A SAVE FROM A NEWER BUILD NEVER CRASHES THIS ONE (claude/levelguard, 11-10). Node only, no page.
   The batch155 rollback scare: an older main.js read a newer save and threw (LEVELS[levelIndex] undefined, then drawWorld). Here a save names a level index past the
   end of LEVELS and a level id this build has not got: the load path must not throw, must land on a valid level, and must keep every unknown field. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS } from '../src/level.js';
import { loadProgress, migrateProgress } from '../src/progression.js';
import { safeLevelIndex } from '../src/level-guard.js';
const rd = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
class Fake { constructor() { this.m = new Map(); } getItem(k) { return this.m.has(k) ? this.m.get(k) : null; } setItem(k, v) { this.m.set(k, String(v)); } removeItem(k) { this.m.delete(k); } }
const n = LEVELS.length, valid = i => Number.isInteger(i) && i >= 0 && i < n && typeof LEVELS[i].build === 'function';

/* the rules */
assert.equal(safeLevelIndex(LEVELS, 3, {}), 3, 'a good index is kept');
assert.equal(safeLevelIndex(LEVELS, LEVELS[5].id, {}), 5, 'a good id is turned into its index');
for (const bad of [n, n + 999, -1, 1.5, NaN, undefined, null, 'level-from-the-future', {}, [], '__proto__'])
  assert.ok(valid(safeLevelIndex(LEVELS, bad, {})), 'unknown want ' + String(bad) + ' falls back to a valid level');
const known = LEVELS.find(l => l.id !== 'custom' && l.id !== 'tavern' && l.id !== 'shop');
assert.equal(LEVELS[safeLevelIndex(LEVELS, n + 5, { mapNodeId: known.id })].id, known.id, 'falls back to the last level the save knows');
assert.equal(LEVELS[safeLevelIndex(LEVELS, n + 5, { mapNodeId: 'future-node' })].id, 'tavern', 'else the inn');
assert.ok(valid(safeLevelIndex([], 0, {})) || safeLevelIndex([], 0, {}) === 0, 'an empty list still answers');
assert.ok(valid(safeLevelIndex(LEVELS, n + 5, null)) && valid(safeLevelIndex(LEVELS, n + 5, 'junk')), 'a junk save object is read as empty');

/* a future save through the real load path */
const S = migrateProgress(null).progress;
const future = { ...S, levelIndex: n + 40, lastLevelId: 'level-from-the-future', mapNodeId: 'future-node', futureField: { a: [1, 2, { b: 3 }] }, hero: S.hero };
const raw = JSON.stringify(future), K = 'bracken.progress.2', st = new Fake(); st.setItem(K, raw);
let res; assert.doesNotThrow(() => { res = loadProgress(st, K, raw, []); }, 'loading a save with an unknown level does not throw');
const P = res.progress;
assert.deepEqual(P.futureField, future.futureField, 'unknown fields survive the load'); assert.equal(P.levelIndex, n + 40, 'the unknown index is kept, not rewritten'); assert.equal(P.mapNodeId, 'future-node');
const after = JSON.parse(st.getItem(K) || '{}'); assert.deepEqual(after.futureField, future.futureField, 'and survive the write back'); assert.ok(st.getItem(K), 'the save is never wiped');
for (const want of [P.levelIndex, P.lastLevelId, P.mapNodeId]) assert.ok(valid(safeLevelIndex(LEVELS, want, P)), 'the load lands on a valid level for ' + want);
assert.ok(LEVELS[safeLevelIndex(LEVELS, P.levelIndex, P)].id, 'and that level has an id');

/* the wiring, read from the source */
const main = rd('src/main.js');
assert.ok(/import \* as LG from '\.\/level-guard\.js'/.test(main), 'main.js imports the guard');
assert.ok(/function\* loadLevelG\(i\) \{\s*\{ const gi = LG\.safeLevelIndex\(LEVELS, i, PROG\)/.test(main), 'loadLevelG routes its index through the guard before anything reads LEVELS[i]');
assert.ok(/function drawWorld\(cx, cy, showPlayer\) \{\s*if \(!L\) \{/.test(main), 'drawWorld draws a dark frame, never throws, with no level object');
console.log('save-future-guard ok: ' + n + ' levels, unknown index / id / junk all land on a valid level, unknown save fields kept, loadLevelG + drawWorld guarded');
