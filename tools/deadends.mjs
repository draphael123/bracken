// tools/deadends.mjs — where does a walk run into a wall for nothing?
// A floor that carries on for forty tiles past its last way onward, into a wall, with nothing at
// the end, is a dead end whatever else is on it. This finds every walkable run, works out which of
// its columns lead somewhere else (a jump up to another run, a drop, a ladder, a doorway), and
// reports each wall-ended TAIL past the last of those that is long and has nothing in it.
// "Nothing" means no coin, silver, quest item, relic, key, sign, checkpoint, NPC or doorway.
// usage: node tools/deadends.mjs [levelId] [minTail=8]
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';

const want = process.argv[2] && isNaN(+process.argv[2]) ? process.argv[2] : null;
const MIN = +(process.argv.find(a => /^\d+$/.test(a)) || 8);

const solid = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.SOFT || t === T.ICE || t === T.WEB || t === T.CLIMB;
const oneway = t => t === T.ONEWAY || t === T.PLANK || t === T.SHELF || t === T.RAIL || t === T.REED || t === T.CRYST || t === T.NET;
const stand = t => solid(t) || oneway(t) || t === T.BOUNCER;
// the knight's measured jump: rows up -> tiles across
const REACH = [4.0, 3.6, 3.2, 2.5];
const GOOD = new Set(['coin', 'silver', 'stray', 'relic', 'key', 'sign', 'check', 'npc', 'doorway', 'gate', 'shop']);
const WORTH = { silver: 4, stray: 4, relic: 4, key: 4, npc: 2, doorway: 10, gate: 10, shop: 10 };

let total = 0;
for (const lv of LEVELS) {
  if (lv.hidden || (want && lv.id !== want)) continue;
  const L = lv.build(), W = L.W, H = L.H, g = L.grid;
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x];
  const runs = [];
  for (let y = 0; y < H - 1; y++) { let x0 = -1;
    for (let x = 0; x <= W; x++) {
      const ok = x < W && stand(at(x, y + 1)) && !solid(at(x, y)) && at(x, y) !== T.SPIKE && !solid(at(x, y - 1));
      if (ok && x0 < 0) x0 = x;
      if (!ok && x0 >= 0) { runs.push({ y, x0, x1: x - 1 }); x0 = -1; }
    } }
  const exitCols = r => { const c = new Set();
    for (const o of runs) { if (o === r) continue;
      const dy = r.y - o.y;                                   // positive: o is higher
      if (dy >= 1 && dy <= 3) { for (let x = r.x0; x <= r.x1; x++) { const d = x < o.x0 ? o.x0 - x : x > o.x1 ? x - o.x1 : 0; if (d <= REACH[dy]) c.add(x); } }
    }
    // a floor you can drop through goes down anywhere; a ladder or rock face goes up
    for (let x = r.x0; x <= r.x1; x++) { if (oneway(at(x, r.y + 1)) && at(x, r.y + 1) !== T.CRYST) c.add(x);
      if (at(x, r.y) === T.NET || at(x, r.y - 1) === T.NET || at(x - 1, r.y) === T.CLIMB || at(x + 1, r.y) === T.CLIMB) c.add(x); }
    // an end with no wall is a drop, and a drop goes somewhere
    // (and a portcullis at the end is a door: a winch or a key or a boss opens it)
    if (!solid(at(r.x0 - 1, r.y)) || at(r.x0 - 1, r.y) === T.PORT) c.add(r.x0);
    if (!solid(at(r.x1 + 1, r.y)) || at(r.x1 + 1, r.y) === T.PORT) c.add(r.x1);
    for (const e of L.ents) if (e.t === 'doorway' && e.y === r.y && e.x >= r.x0 && e.x <= r.x1) c.add(e.x);
    return c; };
  const out = [];
  // a boss floor is walled in on purpose: the fight is what is at the end of it
  const TSZ = 16, rooms = [L.arena, L.mini].filter(Boolean);
  const inRoom = (x, y) => rooms.some(A => x * TSZ >= A.x0 - TSZ && x * TSZ <= A.x1 + TSZ && (A.y0 === undefined || (y * TSZ >= A.y0 && y * TSZ <= A.y1)) && (A.y0 !== undefined || Math.abs(y * TSZ - (A.floor - TSZ)) <= 4 * TSZ || (A.roof !== undefined && Math.abs(y * TSZ - (A.roof - TSZ)) <= 4 * TSZ)));
  // a run nobody can get onto is not a dead end, it is a roof (reach.mjs says if anything that matters is up there)
  const R = floodReach(L, T), gotOnto = r => R.assisted || [...Array(r.x1 - r.x0 + 1)].some((_, k) => R.seen.has((r.x0 + k) + ',' + r.y));
  for (const r of runs) {
    if (r.x1 - r.x0 + 1 < MIN) continue;
    if (inRoom((r.x0 + r.x1) >> 1, r.y) || !gotOnto(r)) continue;
    const c = [...exitCols(r)].sort((a, b) => a - b);
    const tails = [];
    if (!c.length) tails.push([r.x0, r.x1, 'a closed run with no way on at all']);
    else {
      if (solid(at(r.x0 - 1, r.y))) tails.push([r.x0, c[0] - 1, 'past the last way on']);
      if (solid(at(r.x1 + 1, r.y))) tails.push([c[c.length - 1] + 1, r.x1, 'past the last way on']);
    }
    for (const [a, b, why] of tails) {
      const len = b - a + 1; if (len < MIN) continue;
      // one lonely coin forty tiles out is not a reason to walk forty tiles: a tail has to pay about
      // one point every ten tiles, where a coin, a sign or a checkpoint is a point and loot is four
      const stuff = L.ents.filter(e => GOOD.has(e.t) && e.x >= a && e.x <= b && e.y >= r.y - 4 && e.y <= r.y + 3);
      const score = stuff.reduce((s, e) => s + (WORTH[e.t] || 1), 0);
      if (score * 10 < len) out.push(`  row ${r.y}  x ${a}-${b}  ${len} tiles ${why}: ${stuff.length ? stuff.map(e => e.t).join(', ') : 'nothing'}`);
    }
  }
  if (out.length || want) console.log(`== ${lv.id}: ${out.length} dead end${out.length === 1 ? '' : 's'}`);
  for (const o of out) console.log(o);
  total += out.length;
}
console.log(total ? `\n${total} dead ends.` : '\nno dead ends.');
