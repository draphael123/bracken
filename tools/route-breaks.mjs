/* tools/route-breaks.mjs [levelId] [--strict] — THE ROUTE-BREAK AUDIT (2026-09-22). Daniel found Gale Moor impossible by
   playing it: the downdraft cliff's stone lips were laid over its rope and cut it in three. That is a CLASS of bug - something
   laid over a climb piece after it - and this looks for every member of the class in every level, with the reach model.
     A  CUT ROPES      a rope (NET) column broken by a short run of something that is not air: the climb stops under it
     B  CAPPED ROPES   a rope whose top cell has solid over it and nowhere to step off beside it: a climb to nothing
     C  NEAR MISSES    a platform (3+ wide) nobody reaches that sits exactly one row too high over footing that IS reached,
                       within two columns: a ledge that was meant to be jumped to and is a jump short
     D  TALL WALLS     a wall of 4+ rows across reached road with footing beyond it that is not reached: something standing
                       across the way on
     E  LOST THINGS    a silver, checkpoint, gate or quest item the reach model cannot get to
   Each finding is printed with its level, place and what is there. Without --strict it exits 0 (a report); with --strict it
   fails on A, B and E (the ones that are always a bug). C and D need an eye: some are deliberate. */
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';

const only = process.argv.slice(2).find(a => !a.startsWith('--')), strict = process.argv.includes('--strict');
const SOLIDISH = new Set([T.SOLID, T.CRATE, T.PALISADE, T.PORT, T.SOFT, T.ICE, T.WEB, T.CLIMB]);
const STAND = new Set([...SOLIDISH, T.ONEWAY, T.PLANK, T.SHELF, T.RAIL, T.CRYST, T.NET]);
const NAME = Object.fromEntries(Object.entries(T).map(([k, v]) => [v, k]));
export function audit(L) {
  const W = L.W, H = L.H, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : L.grid[y * W + x];
  const R = floodReach(L, T, { rides: true }), reached = (x, y) => R.seen.has(x + ',' + y);
  const out = [];
  // A + B: the ropes, column by column
  for (let x = 0; x < W; x++) {
    const ys = []; for (let y = 0; y < H; y++) if (at(x, y) === T.NET) ys.push(y);
    if (!ys.length) continue;
    for (let i = 1; i < ys.length; i++) { const a = ys[i - 1] + 1, b = ys[i] - 1; if (b < a || b - a > 2) continue;
      const cells = []; for (let y = a; y <= b; y++) cells.push(at(x, y));
      if (cells.some(t => t !== T.AIR)) out.push({ k: 'A', x, y: a, what: 'rope at x ' + x + ' cut by ' + cells.map(t => NAME[t]).join('+') + ' at rows ' + a + (b > a ? '-' + b : '') }); }
    /* the top of each run */
    for (let i = 0; i < ys.length; i++) { if (i > 0 && ys[i - 1] === ys[i] - 1) continue; const top = ys[i];
      if (!SOLIDISH.has(at(x, top - 1))) continue;
      const off = [-1, 1].some(dx => !SOLIDISH.has(at(x + dx, top)) && STAND.has(at(x + dx, top + 1))) || [-1, 1].some(dx => !SOLIDISH.has(at(x + dx, top - 1)) && SOLIDISH.has(at(x + dx, top)));
      if (!off && reached(x, top)) out.push({ k: 'B', x, y: top, what: 'rope at x ' + x + ' row ' + top + ' capped by ' + NAME[at(x, top - 1)] + ' with no step off' }); }
  }
  // C: platforms nobody reaches, a jump short
  const seenPlat = new Set();
  for (let y = 1; y < H; y++) for (let x = 0; x < W; x++) {
    if (seenPlat.has(x + ',' + y) || at(x, y) !== T.AIR || !STAND.has(at(x, y + 1)) || at(x, y - 1) !== T.AIR) continue;
    let x1 = x; while (x1 + 1 < W && at(x1 + 1, y) === T.AIR && STAND.has(at(x1 + 1, y + 1))) x1++;
    for (let q = x; q <= x1; q++) seenPlat.add(q + ',' + y);
    if (x1 - x < 2) continue;
    let any = false; for (let q = x; q <= x1 && !any; q++) any = reached(q, y); if (any) continue;
    let below = null; for (let q = x - 2; q <= x1 + 2 && !below; q++) if (reached(q, y + 4)) below = [q, y + 4];
    if (below) out.push({ k: 'C', x, y, what: 'ledge ' + x + '-' + x1 + ' row ' + y + ' unreached; footing reached 4 rows under it at ' + below.join(',') });
  }
  // D: tall walls across reached road
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (!reached(x, y) || !SOLIDISH.has(at(x + 1, y))) continue;
    let h = 0; while (h < 12 && SOLIDISH.has(at(x + 1, y - h))) h++; if (h < 4) continue;
    let far = x + 2; while (far < W && SOLIDISH.has(at(far, y))) far++; if (far - x > 4) continue;       /* a thin wall, not the edge of a hill */
    if (STAND.has(at(far, y + 1)) && at(far, y) === T.AIR && !reached(far, y)) out.push({ k: 'D', x: x + 1, y, what: h + '-row wall at x ' + (x + 1) + ' row ' + y + '; the road beyond (' + far + ',' + y + ') is unreached' });
  }
  // E: things the reach model cannot get to
  const MUST = new Set(['silver', 'check', 'gate', 'stray', 'key', 'relic']);
  for (const e of L.ents || []) if (MUST.has(e.t)) {
    /* the pickup box of tools/collectables.mjs: from reached footing up to three columns off and up to a jump under it */
    let ok = false; for (let dy = -2; dy <= 5 && !ok; dy++) for (let dx = -3; dx <= 3 && !ok; dx++) ok = reached(e.x + dx, e.y + dy);
    if (!ok) out.push({ k: 'E', x: e.x, y: e.y, what: e.t + (e.kind ? ' (' + e.kind + ')' : '') + ' at ' + e.x + ',' + e.y + ' is out of reach' + (R.assisted ? ' (assisted level: may be a ride the model cannot follow)' : '') });
  }
  /* one finding per spot and kind: a long cut or a wide wall is one thing, not twenty */
  const keep = []; for (const f of out) if (!keep.some(g => g.k === f.k && Math.abs(g.x - f.x) <= 2 && Math.abs(g.y - f.y) <= 2)) keep.push(f);
  return { findings: keep, assisted: R.assisted };
}

if (import.meta.url === 'file:///' + process.argv[1].replace(/\\/g, '/').replace(/^\//, '') || process.argv[1].endsWith('route-breaks.mjs')) {
  /* THE AUDIT MUST SEE THE BUG IT WAS WRITTEN FOR: lay Gale Moor's lips back over its rope and it has to be found */
  { const L = LEVELS.find(l => l.id === 'moor').build(), D = L.downCliffs[0], rope = [...Array(L.W).keys()].find(x => x * 16 >= D.x0 && x * 16 <= D.x1 && L.grid[20 * L.W + x] === T.NET);   /* the cliff's rope, read off the level: the rework moved it (docs/briefs/gale-moor-rework.md) */ for (const row of [18, 14, 10]) L.grid[row * L.W + rope] = T.ONEWAY;
    const f = audit(L).findings.filter(q => q.k === 'A' && q.x === rope);
    if (f.length < 3) { console.error('SELF-TEST FAILED: the old Gale Moor cut rope was not found: ' + JSON.stringify(f)); process.exit(2); } }
  let bad = 0, total = 0; const counts = {};
  for (const lv of LEVELS) { if (lv.hidden && !lv.secret) continue; if (only && lv.id !== only) continue;
    let L; try { L = lv.build(); } catch (err) { console.log('== ' + lv.id + ': FAILED TO BUILD ' + err.message); bad++; continue; }
    const { findings, assisted } = audit(L); total += findings.length;
    for (const f of findings) counts[f.k] = (counts[f.k] || 0) + 1;
    if (!findings.length) continue;
    console.log('== ' + lv.id + (assisted ? ' (assisted)' : '') + ': ' + findings.length);
    for (const f of findings.sort((a, b) => a.k.localeCompare(b.k) || a.x - b.x)) console.log('  ' + f.k + '  ' + f.what);
    if (findings.some(f => 'ABE'.includes(f.k))) bad++;
  }
  console.log('\n' + total + ' findings: ' + (Object.entries(counts).map(([k, n]) => k + ' ' + n).join(', ') || 'none') + '. A cut ropes, B capped ropes, C near misses, D tall walls, E lost things.');
  if (strict && bad) process.exit(1);
}
