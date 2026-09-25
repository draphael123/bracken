/* tools/keep-rework.mjs — THE UNDERWATER KEEP, REWORKED, holds to what it was reworked for (docs/briefs/keep-rework-2.md).
   Node only. It fails when:
     - THE LEADFOOT or THE KEEPER OF THE VAULT comes back anywhere in src/ (Daniel, 2026-09-25, removed both);
     - a section of the approach loses its own wall or its landmark;
     - a whirlpool's lever is inside its own pull, not in water over a floor, or too far to be "just outside" it; or the level
       stops using them in different ways: one GUARDING AN AIR POCKET, one BESIDE A FOE, and one IN THE EXAM (S1, S3);
     - fewer than five foes stand where the ground makes them worse (S1: a knight at a landing, a wheel, a whirlpool, failing stone);
     - THE KING'S DOOR (S3) is not an exam: its whirlpool, a knight, the gated captain, its only air inside a whirlpool's pull,
       a checkpoint at its door and none in it, no free heart in it;
     - two checkpoints on the main route are closer than 40 route tiles, except the pair that ends outside the arena (S4);
     - there is more than one free heart per two checkpoints (S5; dead-end hearts, `stash`, are paid for and do not count). */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { LEVELS, T, TS } from '../src/level.js';
import { pacing } from './pacing.mjs';
import { KEEP_ROOMS, KEEP_LANDMARKS } from '../src/keep-looks.js';
import { airBoxes } from '../src/deepair.js';

const out = [];
// 1. WHAT WENT STAYS GONE
{ const dir = new URL('../src/', import.meta.url), hits = [];
  for (const f of readdirSync(dir)) if (f.endsWith('.js')) { const s = readFileSync(new URL(f, dir), 'utf8'); if (/\bleadfoot\b|vaultKeeper|vault-keeper|KEEPER OF THE VAULT/.test(s)) hits.push(f); }
  assert.deepEqual(hits, [], 'the Leadfoot or the Keeper of the Vault is back in: ' + hits.join(' '));
  assert(!existsSync(new URL('../src/vault-keeper.js', import.meta.url)), 'src/vault-keeper.js is back'); out.push('no Leadfoot, no Vault Keeper'); }
const lv = LEVELS.find(l => l.id === 'keep'), L = lv.build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
const S = Object.fromEntries(L.keepSections.map(s => [s.name, s]));
// 2. EVERY SECTION ITS OWN WALL AND LANDMARK
{ const walls = L.interiors.filter(r => String(r[4]).startsWith('keep'));
  assert.equal(new Set(walls.map(r => r[4])).size, KEEP_ROOMS.length, 'every wall painter is used once: ' + walls.map(r => r[4]));
  for (const m of L.keepLandmarks) { assert(KEEP_LANDMARKS.includes(m.k), 'no painter for landmark ' + m.k); const r = walls.find(w => w[4] === m.room); assert(r && m.x >= r[0] && m.x <= r[1], m.k + ' is not in its own room'); }
  out.push(walls.length + ' walls, ' + L.keepLandmarks.length + ' landmarks'); }
// 3. THE WHIRLPOOLS
const W = L.whirlpools, eye = w => [w.x + 0.5, w.y + 0.5], dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const inPull = (w, x, y) => dist(eye(w), [x + 0.5, y + 0.5]) < w.r;
{ assert(W.length >= 4, 'whirlpools: ' + W.length);
  for (const w of W) { const [lx, ly] = w.lever, d = dist(eye(w), [lx + 0.5, ly + 0.5]);
    assert(d >= w.r, 'the lever of the whirlpool at ' + w.x + ',' + w.y + ' is inside its own pull');
    assert(d <= w.r + 18, 'the lever of the whirlpool at ' + w.x + ',' + w.y + ' is ' + d.toFixed(1) + ' tiles off: not "just outside" it');
    assert.equal(at(lx, ly), T.AIR, 'lever in rock at ' + lx + ',' + ly); assert.notEqual(at(lx, ly + 1), T.AIR, 'lever over nothing at ' + lx + ',' + ly);
    assert.equal(at(w.x, w.y), T.AIR, 'whirlpool eye in rock at ' + w.x + ',' + w.y);
    assert(L.pools.some(p => p.swim && (w.x + 0.5) * TS > p.x0 && (w.x + 0.5) * TS < p.x1 && w.y * TS > p.y), 'whirlpool at ' + w.x + ',' + w.y + ' is not in the water'); }
  const air = airBoxes(L).filter(b => b.kind === 'room' || b.kind === 'vent');
  const guards = W.filter(w => air.some(b => inPull(w, Math.floor((b.l + b.r) / 2 / TS), Math.floor((b.t + b.b) / 2 / TS))));
  const beside = W.filter(w => L.ents.some(e => (e.t === 'drownedknight' || e.t === 'drownedcaptain') && dist(eye(w), [e.x + 0.5, e.y + 0.5]) < w.r + 4));
  assert(guards.length >= 1, 'no whirlpool guards an air pocket'); assert(beside.length >= 1, 'no whirlpool stands beside a foe');
  out.push(W.length + ' whirlpools (' + guards.length + ' guarding air, ' + beside.length + ' beside a knight)'); }
// 4. S1: FOES WHERE THE GROUND MAKES THEM WORSE
{ const why = [];
  for (const e of L.ents.filter(e => e.t === 'drownedknight' || e.t === 'drownedcaptain')) {
    const r = W.some(w => dist(eye(w), [e.x, e.y]) < w.r + 5) ? 'by a whirlpool' : (L.crumbles || []).some(c => Math.abs(e.x - (c.x0 + c.x1) / 2) < 7 && Math.abs(e.y - c.row) < 4) ? 'past failing stone'
      : (L.deep.gates || []).some(g => Math.abs(g.wheel[0] - e.x) < 5) ? 'at a sluice wheel you stand still to strike' : e.gate !== undefined ? 'holding a gate'
      : (L.deep.props || []).some(p => p.k === 'statue' && Math.abs(p.x - e.x) < 9 && p.y < e.y + 3) ? 'at the landing past a column' : null;
    if (r) why.push(e.t + '@' + e.x + ',' + e.y + ' ' + r); }
  assert(why.length >= 5, 'S1 wants five placements where a foe and the ground are one problem: ' + why.join('; '));
  out.push('S1: ' + why.length + ' placements'); }
// 5. S3: THE KING'S DOOR IS AN EXAM
const X = S["THE KING'S DOOR"], A = L.arena, inX = e => e.x >= X.x0 && e.x <= X.x1;
{ assert(X, 'no exam section'); assert(W.some(w => w.x >= X.x0 && w.x <= X.x1), 'no whirlpool in the exam');
  assert(L.ents.some(e => e.t === 'drownedknight' && inX(e)), 'no knight in the exam'); const cap = L.ents.find(e => e.t === 'drownedcaptain' && inX(e));
  assert(cap && cap.elite && cap.gate !== undefined, 'the captain does not hold the exam\'s door');
  const air = airBoxes(L).filter(b => b.l / TS >= X.x0 && b.l / TS < X.x1 && b.kind !== 'bell');
  for (const b of air) assert(W.some(w => w.x >= X.x0 && inPull(w, Math.floor((b.l + b.r) / 2 / TS), Math.floor((b.t + b.b) / 2 / TS) + 1)), 'air in the exam outside a whirlpool: ' + JSON.stringify(b));
  const checks = L.ents.filter(e => e.t === 'check');
  assert(checks.some(c => c.x === X.x0), 'no checkpoint at the exam\'s door'); assert(checks.some(c => c.x > X.x0 && c.x < A.wallL && c.x >= A.wallL - 4), 'no checkpoint outside the arena');
  const inside = checks.filter(c => c.x > X.x0 && c.x <= X.x1); assert.deepEqual(inside.map(c => c.x), [], 'checkpoints inside the exam');
  assert(!L.ents.some(e => e.t === 'mend' && !e.stash && inX(e)), 'a free heart in the exam (S5)');
  out.push('S3: the exam ' + X.x0 + '-' + X.x1 + ', ' + air.length + ' air (in the pull)'); }
// 6. S4 and S5 along the main route
{ const r = pacing(lv), c = r.stats.checkAt, end = r.cum[r.cum.length - 1];
  const gaps = c.slice(1).map((v, i) => [c[i], v]), close = gaps.filter(([a, b], i) => b - a < 40 && i < gaps.length - 1);
  assert.deepEqual(close, [], 'S4: checkpoints closer than 40 route tiles: ' + JSON.stringify(close));
  const free = L.ents.filter(e => e.t === 'mend' && !e.stash).length;
  assert(free <= Math.floor(c.length / 2), 'S5: ' + free + ' free hearts for ' + c.length + ' checkpoints');
  out.push('S4: ' + c.length + ' checkpoints on the route, closest pair ' + Math.min(...gaps.slice(0, -1).map(([a, b]) => b - a)) + ' route tiles, worst gap ' + r.stats.maxCheckGap + '; S5: ' + free + ' free hearts'); }
console.log('keep-rework  ' + out.join('; '));
