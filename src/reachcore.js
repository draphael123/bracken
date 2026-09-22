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
const BUD_UP = Math.floor((420 * 420) / (2 * G) / TSZ);       // a bud pad throws you a tier: five rows (floor, not ceil: 89 px is not six rows)

export function floodReach(L, T, opts = {}) { // opts.maxUp: cap a plain jump's rise (2 = only the comfortable ones)
  const W = L.W, H = L.H, g = L.grid.slice(); // a copy: the things the PLAYER can open are opened in it first
  /* opts.noAssist: THE PLAIN MODEL. Nothing that moves and nothing that is only there sometimes - no hex vine, no
     grown cap, no ghost furniture, no cart, no wheel, no swing, no lily pad, and the fields' phantom planks are air
     while its shrinking bales are rock. What this fill reaches is what the slowest hero reaches with nothing but his
     legs; the difference between it and the full fill is the list of climbs a level owes a second route to
     (tools/reach.mjs --plain). Earned: a bale bank on the lane out of the Hexed Fields that only a vine could put
     you on, and only if you were already riding it up. */
  const plain = !!opts.noAssist;
  if (plain && L.fields) {
    for (const [x0, x1, y] of (L.fields.phantoms || [])) for (let x = x0; x <= x1; x++) if (g[y * W + x] === T.PLANK) g[y * W + x] = T.AIR;
    for (const s of (L.fields.shrinks || [])) for (let y = s.y0; y <= s.y1; y++) for (let x = s.x0; x <= s.x1; x++) g[y * W + x] = T.SOLID;
  }
  // a gun laid on a hull opens the hull, and a stowed boarding plank becomes a bridge: both are one blow, so the
  // model treats them as already done rather than calling the far side unreachable
  for (const e of (L.ents || [])) {
    if (e.t === 'cannon' && e.hole) { const [x0, x1, y0, y1] = e.hole; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y * W + x] = T.AIR; }
    if (e.t === 'plank' && e.span) { for (let x = e.span[0]; x <= e.span[1]; x++) { const i = e.row * W + x; if (g[i] === T.AIR) g[i] = T.ONEWAY; } }
    /* THE MONASTERY'S BELLS: one blow brings a tower's bridge down, and it stays down - a bell is a plank that rings */
    if (e.t === 'tbell' && e.span) { const [x0, x1, row] = e.span; for (let x = x0; x <= x1; x++) { const i = row * W + x; if (g[i] === T.AIR) g[i] = T.PLANK; } }
    /* ITS PRAYER WHEELS: struck from their own floor, a wheel's stair stands either way, so the full fill has both at once. The
       plain fill has the stair as it was built and nothing else: a climb that needs it turned is a climb on the --plain list */
    if (e.t === 'pwheel' && !plain) for (const [x0, y, w] of [...(e.a || []), ...(e.b || [])]) for (let x = x0; x < x0 + w; x++) { const i = y * W + x; if (g[i] === T.AIR) g[i] = T.ONEWAY; }
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
  const lifts = (plain ? [] : (L.moversExtra || [])).filter(m => m.kind === 'lift' || m.kind === 'growcap' || (m.kind === 'hexvine' && !opts.fairVines)).map(m => m.cwBand ? { kind: 'counterweight', ...m.cwBand }   /* A COUNTERWEIGHT PAIR is one ride: board either basket, get off the other anywhere from the top of its rise to the foot of its fall */
    : ({ kind: m.kind + (m.group ? ' ' + m.group : ''), x0: Math.floor(m.x / TSZ), x1: Math.floor((m.x + m.w - 1) / TSZ), y0: Math.floor(Math.min(m.y0, m.y1) / TSZ), y1: Math.floor(Math.max(m.y0, m.y1) / TSZ) }));
  /* THE OTHER RIDES. A platform mover (ent 'mover': a run of `range` tiles, or a rise of `rise` tiles when vertical) and
     a ferry raft (x0..x1 along one row) are a band of footing: step on anywhere along the run, step off anywhere along it.
     They were why a third of the rivers and decks came back ASSISTED with their silver in doubt. */
  if (!plain) for (const e of (L.ents || [])) if (e.t === 'mover') lifts.push(e.vert ? { kind: 'mover ' + (e.ghost || ''), x0: e.x, x1: e.x + (e.len || 2) - 1, y0: e.y - (e.rise || e.range || 4), y1: e.y } : { kind: 'mover ' + (e.ghost || ''), x0: e.x, x1: e.x + (e.len || 2) - 1 + (e.range || 0), y0: e.y, y1: e.y });
  /* A GLYPH CROSSING (the Witchlight Stair): a pair of brief glyphs either side of a gap in a road with a ceiling over it -
     you fall up, walk the underside and drop on the other side, from either end. L.glyphBridges [x0, x1, floor row].
     A FOURTH NUMBER makes it a CLIMB instead of a crossing (the Falling Tower's Reading Room): the room turns over, you
     walk its ceiling, and the second glyph puts you down on the gallery, so the pair joins a band of rows and not one. */
  if (!plain) for (const [x0, x1, y, yb] of (L.glyphBridges || [])) lifts.push({ kind: 'glyph', x0, x1, y0: Math.min(y, yb ?? y), y1: Math.max(y, yb ?? y) });
  if (!plain) for (const m of (L.moversExtra || [])) if (m.x0 !== undefined && m.x1 !== undefined && m.y !== undefined && m.kind !== 'lift' && m.kind !== 'growcap' && m.kind !== 'hexvine') lifts.push({ kind: m.kind, x0: Math.floor(m.x0 / TSZ), x1: Math.floor((m.x1 + (m.w || 16) - 1) / TSZ), y0: Math.floor(m.y / TSZ), y1: Math.floor(m.y / TSZ) });
  const swings = (plain ? [] : (L.moversExtra || [])).filter(m => m.kind === 'swing').map(m => { const pts = []; for (let k = -6; k <= 6; k++) { const th = 0.9 * k / 6; pts.push([Math.floor((m.px + Math.sin(th) * m.arm) / TSZ), Math.floor((m.py + Math.cos(th) * m.arm) / TSZ) - 1]); } return pts; });
  /* THE RIDES THE TOOLS ASK ABOUT (opts.rides): the lily pads, a wasp you pogo off, a water wheel's paddles, the width of a
     wind column and the great kite's flight. These are why Bracken Wood read 16% reachable and the Marsh 7%. The coin
     sprinkler in level.js does NOT pass the option, so no gold moves: only the audits see further. */
  const extraFoot = [], springs = new Set(), buds = new Set(), groups = []; let flight = null;
  if (opts.rides && !plain) {
    for (const e of (L.ents || [])) {
      if (e.t === 'pad') for (const dx of (e.big ? [-1, 0, 1] : [-1, 0])) extraFoot.push((e.x + dx) + ',' + (e.y - 1));   /* a big pad is two tiles wide, centred on its column: it reaches half into both neighbours */
      if (e.t === 'pad' && e.spring && !e.big) for (const dx of [-1, 0]) buds.add((e.x + dx) + ',' + (e.y - 1));
      if (e.t === 'wasp' && !opts.noFoes) { extraFoot.push(e.x + ',' + (e.y - 1)); springs.add(e.x + ',' + (e.y - 1)); }
    }
    for (const m of (L.moversExtra || [])) if (m.kind === 'wheel' && m.r) { const cells = [];
      for (let a = 0; a < 24; a++) { const th = a / 24 * Math.PI * 2; cells.push([Math.floor((m.px + Math.cos(th) * m.r) / TSZ), Math.floor((m.py + Math.sin(th) * m.r) / TSZ) - 1]); }
      for (const [cx, cy] of cells) extraFoot.push(cx + ',' + cy); groups.push({ cells, set: new Set(cells.map(([cx, cy]) => cx + ',' + cy)) }); }
    const kite = (L.ents || []).find(e => e.t === 'stormkite');
    if (L.flight && kite) flight = { x: kite.x, y: kite.y, x1: Math.floor(L.flight.x1 / TSZ) };
  }
  /* opts.fairVines: A VINE IS ITS LEAF. The full fill rides a hex vine up from its bud like a lift, and only a hero who is
     standing on the bud when he strikes the spill can do that - a long reach does it, a maul does not. Fair, a vine is
     the ledge its grown leaf makes and nothing else, and the fill has to JUMP onto it. The leaf stands eight pixels over
     a tile line, and it is counted as the whole row higher, so a leaf only just out of a jump reads as out of it: the
     lane's leaf was fifty-six pixels over the lane against a fifty-one pixel jump. */
  if (opts.fairVines && !plain) for (const m of (L.moversExtra || [])) if (m.kind === 'hexvine') {
    const r = Math.floor(Math.min(m.y0, m.y1) / TSZ) - 1;
    for (let x = Math.floor(m.x / TSZ); x <= Math.floor((m.x + m.w - 1) / TSZ); x++) extraFoot.push(x + ',' + r); }
  /* EVERY ASSIST AS A BAND (kind, x0..x1, y0..y1 in tiles): the lifts, the swings' arcs, the wheels, the pads, and the
     fields' phantom planks and shrinking bales. tools/reach.mjs --plain boards them one at a time from what the plain
     fill can reach, so its report is a list of climbs and not one wall followed by everything behind it. */
  const assists = lifts.map(lf => ({ ...lf }));
  for (const arc of swings) { const xs = arc.map(p => p[0]), ys = arc.map(p => p[1]); assists.push({ kind: 'swing', x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }); }
  for (const grp of groups) { const xs = grp.cells.map(p => p[0]), ys = grp.cells.map(p => p[1]); assists.push({ kind: 'wheel', x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }); }
  if (!plain) for (const e of (L.ents || [])) if (e.t === 'pad') assists.push({ kind: 'pad', x0: e.x - 1, x1: e.x, y0: e.y - 1, y1: e.y - 1 });
  if (!plain && L.fields) { for (const [x0, x1, y] of (L.fields.phantoms || [])) assists.push({ kind: 'phantom planks', x0, x1, y0: y - 1, y1: y - 1 });
    for (const sh of (L.fields.shrinks || [])) assists.push({ kind: 'shrinking bales ' + sh.group, x0: sh.x0, x1: sh.x1, y0: sh.y0 - 1, y1: sh.y1 }); }
  /* one band per ride: a wheel's four paddles are one wheel, and were being written down as four climbs */
  { const had = new Set(); for (let i = assists.length - 1; i >= 0; i--) { const a = assists[i], k = [a.kind, a.x0, a.x1, a.y0, a.y1].join(); if (had.has(k)) assists.splice(i, 1); else had.add(k); } }
  const assisted = !L.reachExact && (!!(L.moversExtra && L.moversExtra.some(m => m.kind !== 'lift' && m.kind !== 'swing' && m.kind !== 'growcap' && m.kind !== 'hexvine')) || (L.ents || []).some(e => ['mover', 'cart'].includes(e.t)) || !!(L.gusts && L.gusts.length));

  // every tile you could be standing on
  const key = (x, y) => x + ',' + y;
  const footing = new Set();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
    if (stand(at(x, y)) && !solid(at(x, y - 1)) && at(x, y - 1) !== T.SPIKE) footing.add(key(x, y - 1));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (climbable(at(x, y))) footing.add(key(x, y));
  for (const k0 of extraFoot) footing.add(k0);
  // SWIM WATER (the Long Water): every open cell of a swimmable pool is somewhere you can be - you swim to any
  // neighbour, and at the surface you can leap out. A tide pool counts at its high water; a boss's tide does not.
  const water = new Set(), surfRow = new Map();
  for (const p of (L.pools || [])) { if (!p.swim || p.arenaTide) continue; const topPx = p.streetTide ? p.base + p.tideHi : p.y; const r0 = Math.floor(topPx / TSZ), r1 = Math.floor(((p.bottom ?? topPx + 64) - 1) / TSZ);
    for (let x = Math.floor(p.x0 / TSZ); x < Math.ceil(p.x1 / TSZ); x++) for (let y = r0; y <= r1; y++) if (!solid(at(x, y))) { water.add(key(x, y)); footing.add(key(x, y)); surfRow.set(key(x, y), r0); } }

  const seen = new Set(), q = [];
  const push = (x, y) => { const k = key(x, y); if (footing.has(k) && !seen.has(k)) { seen.add(k); q.push([x, y]); } };
  // start where the knight starts, and fall to whatever is under it
  { let sy = L.START.y; while (sy < H - 1 && !footing.has(key(L.START.x, sy))) sy++; push(L.START.x, sy); }
  for (const [sx, sy] of (opts.seeds || [])) push(sx, sy);   /* (only where there is footing: a seed on a vine's leaf is nothing to a fill with no vine) */

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
    const springy = at(x, y + 1) === T.BOUNCER || springs.has(key(x, y)), up = springy ? BOUNCE_UP : buds.has(key(x, y)) ? BUD_UP : Math.min(JUMP_UP, opts.maxUp || JUMP_UP);
    for (const v of vents) if (Math.abs(v.x - x) <= 1 && v.y === y) { const top = Math.floor(v.y + 1 - (v.h || 112) / TSZ);
      const half = opts.rides ? Math.max(3, Math.ceil((v.w || 0) / 2 / TSZ)) : 3;
      for (let ty = top - 1; ty <= v.y; ty++) for (let dx = -half; dx <= half; dx++) push(v.x + dx, ty); }
    for (const lf of lifts) if (x >= lf.x0 - 2 && x <= lf.x1 + 2 && y >= lf.y0 - 2 && y <= lf.y1) for (let ty = lf.y0 - 1; ty <= lf.y1; ty++) for (let dx = -2; dx <= lf.x1 - lf.x0 + 2; dx++) push(lf.x0 + dx, ty);
    for (const arc of swings) if (arc.some(([ax, ay]) => Math.abs(ax - x) <= 2 && y - ay >= -1 && y - ay <= 3)) for (const [ax, ay] of arc) for (let dy = -3; dy <= 2; dy++) for (let dx = -3; dx <= 3; dx++) push(ax + dx, ay + dy);
    for (const grp of groups) if (grp.set.has(key(x, y))) for (const [gx, gy] of grp.cells) push(gx, gy);   /* a wheel carries you round to any of its paddles */
    /* the great kite: take hold of it and the Sky Road lets you down anywhere along it */
    if (flight && Math.abs(x - flight.x) <= 3 && Math.abs(y - flight.y) <= 3) for (let cx = flight.x; cx <= flight.x1; cx++) { let cy = 0; while (cy < H - 1 && !footing.has(key(cx, cy))) cy++; if (footing.has(key(cx, cy))) push(cx, cy); }
    // stand in a doorway and press talk: you come out at the other one
    for (const dr of doors) if (Math.abs(dr.x - x) <= 1 && dr.y === y) { const to = doorTo.get(dr.to); if (to) { let ty = to.y; while (ty < H - 1 && !footing.has(key(to.x, ty))) ty++; push(to.x, ty); } }
    // swim: any way through the water, and a leap out at the surface (a jump from the top row of the pool)
    /* A LEAP NEEDS SKY OVER THE SURFACE. Two pools that overlap by a row gave the lower one a "surface" under two rows of
       rock, and the leap went up through the rock: the Deep's flooded shelf tunnel read as joined to the trench along its
       whole floor, which is how the dead-end finder called it no dead end. Leap only from open water, up a clear column. */
    if (water.has(key(x, y))) { for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) push(x + dx, y + dy); const sr = surfRow.get(key(x, y)); if (y <= sr + 1 && !solid(at(x, sr - 1))) for (let dx = -3; dx <= 3; dx++) for (let dy = 0; dy >= -JUMP_UP - 1; dy--) { if (solid(at(x + dx, sr + dy))) break; push(x + dx, sr + dy); } }
    // walk, and step up or down one
    for (const dx of [-1, 1]) for (const dy of [-1, 0, 1]) push(x + dx, y + dy);
    // climb
    if (climbable(at(x, y))) { push(x, y - 1); push(x, y + 1); }
    if (climbable(at(x, y - 1))) push(x, y - 1);
    // A ROPE IS CLIMBED DOWN AS WELL AS UP. Rungs were footing and a jump could go UP them, but nothing
    // could step onto one from directly above - so a shaft entered at the top of its own rope read as
    // sealed. That is what stranded thirty rows of the Undercrown and everything they led to.
    if (at(x, y + 1) === T.NET) push(x, y + 1);
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
      if (u === T.ONEWAY || u === T.PLANK || u === T.SHELF || u === T.REED || u === T.NET) { let ny = y + 2;   /* and you let go of the bottom of a rope the same way */
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
  return { seen, footing, assisted, assists, key, near, jumpNear, expand };
}
