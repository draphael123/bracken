// src/reachcore.js — where can the knight actually stand?
// Flood-fills the standable tiles of a built level from its START using the knight's real numbers. Shared
// by tools/reach.mjs (which reports what the fill never touches) and by the coin sprinkler in level.js
// (which only lays gold where the fill says you can get to it).
//
// It follows doorways (each names the doorway it lets out at) and vents (ride the column, steer off the
// top). It cannot model a mover, a swing or a gust, so a level that leans on those comes back ASSISTED and
// its misses may be a ride away. A level can say L.reachExact when its movers are only boss props.
const RUN = 92, JUMPV = -320, G = 1000, TSZ = 16;        // the knight's numbers from main.js
const JUMP_UP = Math.floor((JUMPV * JUMPV) / (2 * G) / TSZ);  // 3 tiles of rise (ceil made it 4: a jump nobody can make)
const JUMP_ACROSS = 6;                                        // with a run-up, about six tiles of float
const BOUNCE_UP = Math.ceil((480 * 480) / (2 * G) / TSZ);     // a spring throws you much higher

export function floodReach(L, T, opts = {}) { // opts.maxUp: cap a plain jump's rise (2 = only the comfortable ones)
  const W = L.W, H = L.H, g = L.grid.slice(); // a copy: the things the PLAYER can open are opened in it first
  // a gun laid on a hull opens the hull, and a stowed boarding plank becomes a bridge: both are one blow, so the
  // model treats them as already done rather than calling the far side unreachable
  for (const e of (L.ents || [])) {
    if (e.t === 'cannon' && e.hole) { const [x0, x1, y0, y1] = e.hole; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y * W + x] = T.AIR; }
    if (e.t === 'plank' && e.span) { for (let x = e.span[0]; x <= e.span[1]; x++) { const i = e.row * W + x; if (g[i] === T.AIR) g[i] = T.ONEWAY; } }
  }
  const solid = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.SOFT || t === T.ICE || t === T.WEB || t === T.CLIMB;
  const stand = t => solid(t) || t === T.ONEWAY || t === T.PLANK || t === T.SHELF || t === T.RAIL || t === T.BOUNCER || t === T.REED || t === T.CRYST || t === T.NET;
  const climbable = t => t === T.CLIMB; // a NET is one-way rungs: a rope ladder is climbed by hopping rung to rung, so it is footing, not a ladder
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x];
  const doors = (L.ents || []).filter(e => e.t === 'doorway' && e.id);
  const doorTo = new Map(doors.map(d => [d.id, d]));
  const vents = (L.ents || []).filter(e => e.t === 'vent');
  // the rides the model CAN follow, from L.moversExtra: a pulley lift (stand on it anywhere along its run and step
  // off anywhere along it) and a swinging bucket (board it near any point of its arc, get off near any other)
  const lifts = (L.moversExtra || []).filter(m => m.kind === 'lift' || m.kind === 'growcap').map(m => ({ x0: Math.floor(m.x / TSZ), x1: Math.floor((m.x + m.w - 1) / TSZ), y0: Math.floor(Math.min(m.y0, m.y1) / TSZ), y1: Math.floor(Math.max(m.y0, m.y1) / TSZ) }));
  const swings = (L.moversExtra || []).filter(m => m.kind === 'swing').map(m => { const pts = []; for (let k = -6; k <= 6; k++) { const th = 0.9 * k / 6; pts.push([Math.floor((m.px + Math.sin(th) * m.arm) / TSZ), Math.floor((m.py + Math.cos(th) * m.arm) / TSZ) - 1]); } return pts; });
  const assisted = !L.reachExact && (!!(L.moversExtra && L.moversExtra.some(m => m.kind !== 'lift' && m.kind !== 'swing' && m.kind !== 'growcap')) || (L.ents || []).some(e => ['mover', 'cart'].includes(e.t)) || !!(L.gusts && L.gusts.length));

  // every tile you could be standing on
  const key = (x, y) => x + ',' + y;
  const footing = new Set();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
    if (stand(at(x, y)) && !solid(at(x, y - 1)) && at(x, y - 1) !== T.SPIKE) footing.add(key(x, y - 1));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (climbable(at(x, y))) footing.add(key(x, y));
  // SWIM WATER (the Long Water): every open cell of a swimmable pool is somewhere you can be - you swim to any
  // neighbour, and at the surface you can leap out. A tide pool counts at its high water; a boss's tide does not.
  const water = new Set(), surfRow = new Map();
  for (const p of (L.pools || [])) { if (!p.swim || p.arenaTide) continue; const topPx = p.streetTide ? p.base + p.tideHi : p.y; const r0 = Math.floor(topPx / TSZ), r1 = Math.floor(((p.bottom ?? topPx + 64) - 1) / TSZ);
    for (let x = Math.floor(p.x0 / TSZ); x < Math.ceil(p.x1 / TSZ); x++) for (let y = r0; y <= r1; y++) if (!solid(at(x, y))) { water.add(key(x, y)); footing.add(key(x, y)); surfRow.set(key(x, y), r0); } }

  const seen = new Set(), q = [];
  const push = (x, y) => { const k = key(x, y); if (footing.has(k) && !seen.has(k)) { seen.add(k); q.push([x, y]); } };
  // start where the knight starts, and fall to whatever is under it
  { let sy = L.START.y; while (sy < H - 1 && !footing.has(key(L.START.x, sy))) sy++; push(L.START.x, sy); }

  // can a body (14px: one tile) get across the columns between x and x+dx at some height from row rTop down to
  // rBot? A jump is not a teleport: the stacks between two chimney shafts stop it (the model used to jump
  // straight through walls, which is how five pits with one ladder passed every tool)
  // (only rock stops it: a gate opens, a crate breaks, a web burns - the tools that care about those check them)
  const wall = t => t === T.SOLID;
  const across = (x, dx, rTop, rBot) => { const s = Math.sign(dx);
    for (let c = x + s; c !== x + dx; c += s) { let ok = false; for (let r = rTop; r <= rBot && !ok; r++) ok = !wall(at(c, r)); if (!ok) return false; }
    return true; };
  // everywhere you can get to from one tile (push is handed in, so tools/traps.mjs can run it backwards)
  const expand = (x, y, push) => {
    const springy = at(x, y + 1) === T.BOUNCER, up = springy ? BOUNCE_UP : Math.min(JUMP_UP, opts.maxUp || JUMP_UP);
    for (const v of vents) if (Math.abs(v.x - x) <= 1 && v.y === y) { const top = Math.floor(v.y + 1 - (v.h || 112) / TSZ);
      for (let ty = top - 1; ty <= v.y; ty++) for (let dx = -3; dx <= 3; dx++) push(v.x + dx, ty); }
    for (const lf of lifts) if (x >= lf.x0 - 2 && x <= lf.x1 + 2 && y >= lf.y0 - 2 && y <= lf.y1) for (let ty = lf.y0 - 1; ty <= lf.y1; ty++) for (let dx = -2; dx <= lf.x1 - lf.x0 + 2; dx++) push(lf.x0 + dx, ty);
    for (const arc of swings) if (arc.some(([ax, ay]) => Math.abs(ax - x) <= 2 && y - ay >= -1 && y - ay <= 3)) for (const [ax, ay] of arc) for (let dy = -3; dy <= 2; dy++) for (let dx = -3; dx <= 3; dx++) push(ax + dx, ay + dy);
    // stand in a doorway and press talk: you come out at the other one
    for (const dr of doors) if (Math.abs(dr.x - x) <= 1 && dr.y === y) { const to = doorTo.get(dr.to); if (to) { let ty = to.y; while (ty < H - 1 && !footing.has(key(to.x, ty))) ty++; push(to.x, ty); } }
    // swim: any way through the water, and a leap out at the surface (a jump from the top row of the pool)
    if (water.has(key(x, y))) { for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) push(x + dx, y + dy); const sr = surfRow.get(key(x, y)); if (y <= sr + 1) for (let dy = -JUMP_UP - 1; dy <= 0; dy++) for (let dx = -3; dx <= 3; dx++) push(x + dx, sr + dy); }
    // walk, and step up or down one
    for (const dx of [-1, 1]) for (const dy of [-1, 0, 1]) push(x + dx, y + dy);
    // climb
    if (climbable(at(x, y))) { push(x, y - 1); push(x, y + 1); }
    if (climbable(at(x, y - 1))) push(x, y - 1);
    // jump: anything within the arc, near side first
    let head = 0; while (head < up && !solid(at(x, y - 1 - head))) head++; // no jumping up through a ceiling
    for (let dy = -Math.min(up, head); dy <= 0; dy++) {
      // a ledge right under a ceiling: your head hits the rock just as your feet clear the lip, and you drop
      // straight back - there is no float left to cross with (the Sunspire's side routes found this one)
      const tight = head < up && -dy >= head;
      const span = tight ? 1 : Math.round(JUMP_ACROSS * (1 - Math.abs(dy) / (up + 1.5)));
      const apex = y - Math.min(up, head);
      for (let dx = -span; dx <= span; dx++) if (!dx || across(x, dx, apex, Math.min(y, y + dy))) push(x + dx, y + dy);
    }
    // fall: straight down, and out to either side
    for (const dx of [-JUMP_ACROSS, -2, 0, 2, JUMP_ACROSS]) { let ny = y;
      if (dx && (wall(at(x + dx, y)) || !across(x, dx, y, y))) continue; // walk off the edge: nothing in the way, and not into a wall
      while (ny < H - 1 && !footing.has(key(x + dx, ny)) && !wall(at(x + dx, ny))) ny++;
      if (footing.has(key(x + dx, ny))) push(x + dx, ny); }
    // DOWN ON A LEDGE FALLS THROUGH IT. The model had no drop-through at all, so a room whose only door is
    // the planking in its ceiling read as sealed - which is how a silver in Kingswood spent months being
    // reported unreachable when you get in by pressing down on the boards over it.
    { const u = at(x, y + 1);
      if (u === T.ONEWAY || u === T.PLANK || u === T.SHELF || u === T.REED) { let ny = y + 2;
        while (ny < H - 1 && !footing.has(key(x, ny)) && !wall(at(x, ny))) ny++;
        if (footing.has(key(x, ny))) push(x, ny); } }
    // crystal gives way under you, so a crystal floor is also a way DOWN (the Sunspire's geodes)
    if (at(x, y + 1) === T.CRYST) { let ny = y + 1;
      while (ny < H - 1 && !footing.has(key(x, ny))) ny++;
      if (footing.has(key(x, ny))) push(x, ny); }
  };
  while (q.length) { const [x, y] = q.pop(); expand(x, y, push); }
  const near = (x, y) => { for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (seen.has(key(x + dx, y + dy))) return true; return false; };
  // a coin is got if you can stand under it within a jump: up to four rows below it, two to either side
  // (or inside the column of a vent you can stand in: you ride up through it)
  const inVent = (x, y) => vents.some(v => Math.abs(v.x - x) <= 1 && y <= v.y && y >= Math.floor(v.y + 1 - (v.h || 112) / TSZ) && near(v.x, v.y));
  // - with open air between you and it: a coin on a roof is not got from the room under the roof
  const clearCol = (x, y0, y1) => { for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) if (solid(at(x, y)) && !climbable(at(x, y))) return false; return true; }; // (a rock face you cling to is not in the way)
  const jumpNear = (x, y) => { for (let dy = -2; dy <= 4; dy++) for (let dx = -2; dx <= 2; dx++) if (seen.has(key(x + dx, y + dy)) && clearCol(x + dx, y, y + dy) && clearCol(x, y, y + dy)) return true; return inVent(x, y); };
  return { seen, footing, assisted, key, near, jumpNear, expand };
}
