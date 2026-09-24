// src/campaign-order.js — THE ORDER A PLAYER WALKS THE CAMPAIGN IN, worked out once and imported by everything
// that needs it. Pure: no page, no port, no Chrome, and no import - so the tools (through the shim at
// tools/campaign-order.mjs) and the game itself (CATCH-UP XP in src/main.js asks how deep a level sits) read ONE walk.
//
// WHY THIS FILE EXISTS. Two tools asked "what is the level before this one?" and both answered it by reading
// LEVELS in ARRAY order - tools/curve.mjs, which measures the difficulty ramp step by step, and
// tools/one-new-foe.mjs, whose whole rule (F10) is a set difference against every EARLIER level. The array is
// an APPEND LOG: THE BURNING VILLAGE, THE WITCHLIGHT STAIR and THE ORE ROAD were each appended at the end on
// purpose, because the map's nodes and the saves count levels by index and inserting one in the middle moves
// everything after it. So the array's tail is three levels that belong in the middle of the campaign, and six
// of the twenty-eight visible levels were being measured against a level the player has not reached yet.
// The order is the GATE CHAIN and nothing else. Both tools import this now, so they cannot disagree again -
// which is the same reason THREAT lives in one place instead of two.
//
// AND THE CHAIN IS A TREE, NOT A LINE. Two levels hang off a predecessor that another level already continues:
// THE BURNING VILLAGE off the Stockade (which SPOREWOOD continues) and STORMWRECK HARBOR off the Causeway
// (which WAYMEET continues). So there is no single true "order they are walked", and this does not invent one
// and then hide the invention. What IS well defined for every level but the first is THE LEVEL IT NEEDS, and
// `prev` is the only thing a caller should measure a level AGAINST. `road`, `branches` and `order` are a
// PRINTING and accumulation convenience - at a fork the longer continuation is taken as the road and the
// shorter one comes after it, which is a choice, so anything whose answer depends on that choice is a result
// that needs saying out loud rather than trusting.

// THE THREE WAYS A LEVEL IS GATED. `needs` is the campaign road. The two secret levels are gated on a clock
// and a body count instead - `needsTime: { id: 'kings', t: 180 }` and `needsKills: { id: 'crown', pct: 0.8 }` -
// and they still name the level you must be standing in, so they place just as exactly. A tool that reads only
// `needs` has NO POSITION AT ALL for those two and silently drops them or leaves them wherever the array put
// them; both are wrong, so all three are read here.
export const gateOf = lv => (lv && (lv.needs || (lv.needsTime && lv.needsTime.id) || (lv.needsKills && lv.needsKills.id))) || null;

// Takes anything with an `id` - LEVELS themselves, or a tool's own per-level rows - and a way to read the gate
// off it. Returns the chain, and every awkward case named rather than smoothed away.
export function chainOf(items, prevOf = gateOf) {
  const byId = new Map(items.map(i => [i.id, i]));
  const kids = new Map(items.map(i => [i.id, []]));
  const prev = new Map(items.map(i => [i.id, prevOf(i) || null]));
  const roots = [], orphans = [], cyclic = [];
  for (const i of items) {
    const p = prev.get(i.id);
    if (!p) { roots.push(i.id); continue; }
    // A gate naming something that is not in this population is NOT a position. Hand it back as an orphan and
    // let the caller say so; do not drop it into the line at whatever spot the array happened to give it.
    if (!byId.has(p)) { orphans.push(i.id); continue; }
    kids.get(p).push(i.id);
  }
  // A gate loop would hang every walk below it, so it is found before anything is walked.
  for (const i of items) {
    const seen = new Set([i.id]);
    for (let c = prev.get(i.id); c && byId.has(c); c = prev.get(c)) { if (seen.has(c)) { cyclic.push(i.id); break; } seen.add(c); }
  }

  // HOW FAR THE CHAIN STILL RUNS from each level, which is what picks the road at a fork.
  const runOf = new Map();
  const runLen = id => { if (runOf.has(id)) return runOf.get(id); let n = 0;
    for (const k of kids.get(id)) n = Math.max(n, 1 + runLen(k)); runOf.set(id, n); return n; };
  const pickOrder = id => kids.get(id).slice().sort((a, b) => runLen(b) - runLen(a));   // stable: ties keep array order

  const road = [], branches = [], placed = new Set();
  const walk = (startId, into) => { for (let id = startId; id; ) {
    into.push(id); placed.add(id);
    const next = pickOrder(id);
    for (const spur of next.slice(1)) branches.push({ from: id, start: spur });
    id = next[0];
  } };
  if (!cyclic.length && roots.length) {
    for (const i of items) runLen(i.id);
    walk(roots[0], road);
    for (const extra of roots.slice(1)) branches.push({ from: null, start: extra });   // a second root is its own road
    for (let i = 0; i < branches.length; i++) { branches[i].ids = []; walk(branches[i].start, branches[i].ids); }
  }
  const order = road.concat(...branches.map(b => b.ids));
  const forks = [...kids].filter(([, v]) => v.length > 1);
  const leaves = items.filter(i => !kids.get(i.id).length).map(i => i.id);
  return { byId, kids, prev, roots, orphans, cyclic, road, branches, order, placed, forks, leaves, runLen, pickOrder };
}

/* HOW DEEP A LEVEL SITS: the number of levels its gate chain needs before it (the first level is 0). This is the one
   number that is well defined for EVERY level, a spur as much as the road - it is `prev` walked to the root, and
   needs no choice at a fork. src/xp.js is fitted so a hero's level is about the number of levels he has finished,
   so this is also THE LEVEL A HERO IS EXPECTED TO BE when he walks in (the catch-up XP in src/main.js reads it).
   A level in a gate loop, or whose chain leaves the population, reads null: no depth, not a guess. */
export function depthsOf(items, prevOf = gateOf) {
  const C = chainOf(items, prevOf), out = {};
  for (const i of items) { let n = 0, ok = true; const seen = new Set([i.id]);
    for (let p = C.prev.get(i.id); p; p = C.prev.get(p)) { if (!C.byId.has(p) || seen.has(p)) { ok = false; break; } seen.add(p); n++; }
    out[i.id] = ok ? n : null; }
  return out;
}
