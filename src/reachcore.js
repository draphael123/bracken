// src/reachcore.js — where can the knight actually stand?
// Flood-fills the standable tiles of a built level from its START using the knight's real numbers. Shared
// by tools/reach.mjs (which reports what the fill never touches) and by the coin sprinkler in level.js
// (which only lays gold where the fill says you can get to it).
//
// It follows doorways (each names the doorway it lets out at) and vents (ride the column, steer off the
// top). It cannot model a mover, a swing or a gust, so a level that leans on those comes back ASSISTED and
// its misses may be a ride away. A level can say L.reachExact when its movers are only boss props.
import { slopeReachGrid } from './reach-slopes.js';   /* THE SLOPES REACH RULE, one line inside floodReach below */
const RUN = 92, JUMPV = -320, G = 1000, TSZ = 16;        // the knight's numbers from main.js
const JUMP_UP = Math.floor((JUMPV * JUMPV) / (2 * G) / TSZ);  // 3 tiles of rise (ceil made it 4: a jump nobody can make)
const JUMP_ACROSS = 6;                                        // with a run-up, about six tiles of float
const BOUNCE_UP = Math.ceil((480 * 480) / (2 * G) / TSZ);     // a spring throws you much higher
const BUD_UP = Math.floor((420 * 420) / (2 * G) / TSZ);       // a bud pad throws you a tier: five rows (floor, not ceil: 89 px is not six rows)

export function floodReach(L, T, opts = {}) { // opts.maxUp: cap a plain jump's rise (2 = only the comfortable ones); opts.across: a real hero's jump, not the model's six (tools/checkpoint-stand.mjs)
  /* SLOPES, and it has to be the FIRST line: a slope tile is the cell you stand in, ON THE ROCK UNDER IT, so the fill
     reads slopes as AIR and stands on that rock. Pessimistic by up to 16 px and never optimistic - the reasoning is in
     src/reach-slopes.js. A level with no slopes gets the SAME OBJECT back, so nothing about today's 30 levels changes,
     and the mapping is IDEMPOTENT (a second pass finds no slopes left), so a caller that already wrapped its level -
     tools/caravan-level.mjs and tools/draft-level.mjs both do - is not harmed by this one. tools/slopes.mjs asserts both. */
  L = slopeReachGrid(L, T);
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
  /* THE FAIR'S OWN GIVES (src/harvest-fair.js): a secret wall that says `reach` is one heavy blow (every hero has one), the gallery's planks stand once three targets are hit, and a striker's pad throws
     you as high as its launch: all of it is something every hero can do, so the fill counts it as done (the plain fill does not: it is legs and nothing else) */
  const strikeUp = new Map();
  if (!plain) {
    for (const w of (L.walls || [])) if (w.reach) for (let y = w.y0; y <= w.y1; y++) for (let x = w.x0; x <= w.x1; x++) g[y * W + x] = T.AIR;
    for (const gl of (L.galleries || (L.gallery ? [L.gallery] : []))) for (const [x0, x1, row] of (gl.planks || [])) for (let x = x0; x <= x1; x++) if (g[row * W + x] === T.AIR) g[row * W + x] = T.ONEWAY;
    /* (claude/fairfix3) and a bull's-eye's BARS drop once its targets are struck - the corn's bars over chimney one and the shutter over the night lane's end are the way on now */
    for (const gl of (L.galleries || [])) for (const [x0, x1, y0, y1] of (gl.bars || [])) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y * W + x] = T.AIR;
    /* THE WELL TOWN (src/well-town.js): a MUD WALL is one pour from a skin every hero carries (and the wells to fill it stand on the road before each), and
       THE DRY CISTERN's vault door opens on the four water-skins the level lays down: both count as done, like the fair's one-blow walls (the plain fill: legs only). The live level only (L.welltown): the draft, src/draft/well-town.js, measures its walls shut itself */
    if (L.welltown) for (const m of [...(L.mudWalls || []), ...(L.vaultDoors || [])]) for (let y = m.y0; y <= m.y1; y++) for (let x = m.x0; x <= m.x1; x++) g[y * W + x] = T.AIR;
    /* THE RED GORGE (src/red-gorge.js, claude/redgorge): a JAM is one released burst (a wheel by it, and every flood banks behind its gate), and THE OLD NEST's vault opens on the four
       feathers the level lays down: both count as done (the plain fill: legs only). tools/redgorge.mjs proves each JAM is a lock with a real jump */
    if (L.redgorge) for (const m of [...(L.jams || []), ...(L.vaultDoors || [])]) for (let y = m.y0; y <= m.y1; y++) for (let x = m.x0; x <= m.x1; x++) g[y * W + x] = T.AIR;
    /* THE UNDERWELL (src/underwell.js, claude/underwell): a BROOD NEST seals a tunnel until a torch burns it (the oil and the torch are on the road before it: tools/underwell.mjs proves each nest burns) and THE DRY FOUNTAIN's vault opens on the three taps the level lays down: both count as done, like the gorge's jams (the plain fill: legs only) */
    if (L.underwell) for (const m of [...(L.nests || []), ...(L.vaultDoors || [])]) for (let y = m.y0; y <= m.y1; y++) for (let x = m.x0; x <= m.x1; x++) g[y * W + x] = T.AIR;
    /* THE SKY ROAD (src/sky-road.js, claude/skyroad): THE RIDERS' LOFT opens on the four kite cloths the level lays down: done, like the old nest (tools/skyroad.mjs proves it is a lock) */
    if (L.skyroad) for (const m of (L.vaultDoors || [])) for (let y = m.y0; y <= m.y1; y++) for (let x = m.x0; x <= m.x1; x++) g[y * W + x] = T.AIR;
    /* THE ROOTWAY (src/rootway.js, claude/rootway): a HOIST is one blow on its cleat (or one arrow struck back through its rope) and what it drops STAYS - a span
       across its gap, a cage as a 2x2 step where it lands - so both count as done; THE TROPHY LOFT opens on the four tags the level lays down (tools/rootway.mjs proves
       each required hoist is a lock). A boss cage is winched back up: not footing. The plain fill: legs only */
    if (L.rootway) { for (const m of (L.vaultDoors || [])) for (let y = m.y0; y <= m.y1; y++) for (let x = m.x0; x <= m.x1; x++) g[y * W + x] = T.AIR;
      for (const h of (L.hoists || [])) { if (h.boss) continue; if (h.span) for (let x = h.span[0]; x <= h.span[1]; x++) { const i = h.span[2] * W + x; if (g[i] === T.AIR) g[i] = T.ONEWAY; }
        if (h.land) for (let y = h.land[1]; y <= h.land[1] + 1; y++) for (let x = h.land[0]; x <= h.land[0] + 1; x++) g[y * W + x] = T.SOLID; } }
    for (const s of (L.strikers || [])) strikeUp.set(s.x + ',' + (s.row - 1), Math.floor((s.launch * s.launch) / (2 * G) / TSZ));
  }
  // a gun laid on a hull opens the hull, and a stowed boarding plank becomes a bridge: both are one blow, so the
  // model treats them as already done rather than calling the far side unreachable
  for (const e of (L.ents || [])) {
    if (e.t === 'cannon' && e.hole) { const [x0, x1, y0, y1] = e.hole; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y * W + x] = T.AIR; }
    if (e.t === 'plank' && e.span) { for (let x = e.span[0]; x <= e.span[1]; x++) { const i = e.row * W + x; if (g[i] === T.AIR) g[i] = T.ONEWAY; } }
    /* GALE MOOR's half-built frame (claude/moor2, src/moor-rocks-hands.js): one blow on its rope as the gust blows lays it over the gap - a plank that waits for the wind */
    if (e.t === 'gustframe' && e.span) { for (let x = e.span[0]; x <= e.span[1]; x++) { const i = e.row * W + x; if (g[i] === T.AIR) g[i] = T.PLANK; } }
    /* THE MONASTERY'S BELLS: one blow brings a tower's bridge down, and it stays down - a bell is a plank that rings (and THE BANDIT KSAR's ROOF BRIDGE: one blow cuts its gong's rope and it comes down for good) */
    if ((e.t === 'tbell' || e.t === 'ksbridge') && e.span) { const [x0, x1, row] = e.span; for (let x = x0; x <= x1; x++) { const i = row * W + x; if (g[i] === T.AIR) g[i] = T.PLANK; } }
    /* ITS PRAYER WHEELS: struck from their own floor, a wheel's stair stands either way, so the full fill has both at once. The
       plain fill has the stair as it was built and nothing else: a climb that needs it turned is a climb on the --plain list */
    /* A BLOCK WITH A PLACE TO GO (claude/unburied4, the Unburied Field's mantlets): pushed to the foot of the wall it is there for, it is a step - one walk, so done, like the gun's hole */
    if (e.t === 'pushblock' && e.stepAt) { const i = e.stepAt[1] * W + e.stepAt[0]; if (g[i] === T.AIR) g[i] = T.ONEWAY; }
    if (e.t === 'pwheel' && !plain)for (const [x0, y, w] of [...(e.a || []), ...(e.b || [])]) for (let x = x0; x < x0 + w; x++) { const i = y * W + x; if (g[i] === T.AIR) g[i] = T.ONEWAY; }
  }
  /* FAILING STONE THAT IS THE WAY ON (the Falling Tower's observers' gallery, src/tower-collapse.js): stand on it and it counts
     down and goes, every time, so it is a floor you can go DOWN through and nothing else - a one-way to the model. Only `opens`:
     every other failing section is footing that comes back, and the model is right to stand on it. */
  for (const c of (L.crumbles || [])) if (c.opens) for (let y = c.row; y < c.row + (c.rows || 1); y++) for (let x = c.x0; x <= c.x1; x++) { const i = y * W + x; if (g[i] === T.SOLID) g[i] = y === c.row ? T.ONEWAY : T.AIR; }
  const solid = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.SOFT || t === T.ICE || t === T.WEB || t === T.CLIMB;
  const stand = t => solid(t) || t === T.ONEWAY || t === T.PLANK || t === T.SHELF || t === T.RAIL || t === T.BOUNCER || t === T.REED || t === T.CRYST || t === T.NET;
  const climbable = t => t === T.CLIMB; // a NET is one-way rungs: a rope ladder is climbed by hopping rung to rung, so it is footing, not a ladder
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x];
  const doors = (L.ents || []).filter(e => (e.t === 'doorway' || e.t === 'ringdoor') && e.id);   /* (a RINGDOOR is the Undead Archmage's ring as a door - the Falling Tower's parapet to his spiral stair, src/spiral-chase.js: walked into, not pressed, and the same pair to the fill) */
  const doorTo = new Map(doors.map(d => [d.id, d]));
  const vents = (L.ents || []).filter(e => e.t === 'vent');
  // the rides the model CAN follow, from L.moversExtra: a pulley lift (stand on it anywhere along its run and step
  // off anywhere along it) and a swinging bucket (board it near any point of its arc, get off near any other)
  const lifts = (plain ? [] : (L.moversExtra || [])).filter(m => m.kind === 'lift' || m.kind === 'growcap' || (m.kind === 'hexvine' && !opts.fairVines)).map(m => m.cwBand ? { kind: 'counterweight', ...m.cwBand }   /* A COUNTERWEIGHT PAIR is one ride: board either basket, get off the other anywhere from the top of its rise to the foot of its fall */
    : ({ kind: m.kind + (m.group ? ' ' + m.group : ''), x0: Math.floor(Math.min(m.x, m.x + (m.lean || 0)) / TSZ), x1: Math.floor((Math.max(m.x, m.x + (m.lean || 0)) + m.w - 1) / TSZ), y0: Math.floor(Math.min(m.y0, m.y1) / TSZ), y1: Math.floor(Math.max(m.y0, m.y1) / TSZ) }));   /* a LEANING sprout (Sporewood) rides its whole footprint, from its root to where it sets you down */
  /* THE OTHER RIDES. A platform mover (ent 'mover': a run of `range` tiles, or a rise of `rise` tiles when vertical) and
     a ferry raft (x0..x1 along one row) are a band of footing: step on anywhere along the run, step off anywhere along it.
     They were why a third of the rivers and decks came back ASSISTED with their silver in doubt. */
  if (!plain) for (const e of (L.ents || [])) if (e.t === 'mover') lifts.push(e.vert ? { kind: 'mover ' + (e.ghost || ''), x0: e.x, x1: e.x + (e.len || 2) - 1, y0: e.y - (e.rise || e.range || 4), y1: e.y } : { kind: 'mover ' + (e.ghost || ''), x0: e.x, x1: e.x + (e.len || 2) - 1 + (e.range || 0), y0: e.y, y1: e.y });
  /* A GLYPH CROSSING (the Witchlight Stair): a pair of brief glyphs either side of a gap in a road with a ceiling over it -
     you fall up, walk the underside and drop on the other side, from either end. L.glyphBridges [x0, x1, floor row].
     A FOURTH NUMBER makes it a CLIMB instead of a crossing (the Falling Tower's Reading Room): the room turns over, you
     walk its ceiling, and the second glyph puts you down on the gallery, so the pair joins a band of rows and not one. */
  if (!plain) for (const [x0, x1, y, yb] of (L.glyphBridges || [])) lifts.push({ kind: 'glyph', x0, x1, y0: Math.min(y, yb ?? y), y1: Math.max(y, yb ?? y) });
  /* A CABLEWAY LINE (the Ore Road): its buckets are a clock of platforms along one cable - board anywhere along it, leave anywhere. L.cableBridges [x0, x1, y0, y1] */
  if (!plain) for (const [x0, x1, y0, y1] of (L.cableBridges || [])) lifts.push({ kind: 'cable', x0, x1, y0, y1 });
  /* THE FLY LINES AND THE BARGE (THE MASKWRIGHT'S THEATRE's battens; THE FOG CANAL's barge on a reach or a lock, src/canal-rig.js): a platform that runs between two stops - board it at either, leave it at either. L.rigBands [x0, x1, y0, y1] */
  if (!plain) for (const [x0, x1, y0, y1] of (L.rigBands || [])) lifts.push({ kind: 'fly line', x0, x1, y0, y1 });
  if (!plain) for (const m of (L.moversExtra || [])) if (m.x0 !== undefined && m.x1 !== undefined && m.y !== undefined && m.kind !== 'lift' && m.kind !== 'growcap' && m.kind !== 'hexvine') lifts.push({ kind: m.kind, x0: Math.floor(m.x0 / TSZ), x1: Math.floor((m.x1 + (m.w || 16) - 1) / TSZ), y0: Math.floor(m.y / TSZ), y1: Math.floor(m.y / TSZ) });
  const swings = (plain ? [] : (L.moversExtra || [])).filter(m => m.kind === 'swing').map(m => { const pts = []; for (let k = -6; k <= 6; k++) { const th = 0.9 * k / 6; pts.push([Math.floor((m.px + Math.sin(th) * m.arm) / TSZ), Math.floor((m.py + Math.cos(th) * m.arm) / TSZ) - 1]); } return pts; });
  /* THE RIDES THE TOOLS ASK ABOUT (opts.rides): the lily pads, a wasp you pogo off, a water wheel's paddles, the width of a
     wind column and the great kite's flight. These are why Bracken Wood read 16% reachable and the Marsh 7%. The coin
     sprinkler in level.js does NOT pass the option, so no gold moves: only the audits see further. */
  const extraFoot = [], springs = new Set(), buds = new Set(), groups = []; let flight = null;
  /* A FLY LINE'S TWO STOPS ARE LEDGES (THE MASKWRIGHT'S THEATRE): a batten stands at its high stop or its low one until its lock is struck, so each
     stop is somewhere you can stand - which is how the model steps from one batten across to the next */
  if (!plain) for (const [x0, x1, y0, y1] of (L.rigBands || [])) for (let x = x0; x <= x1; x++) for (const y of [y0, y1]) extraFoot.push(x + ',' + (y - 1));
  if (opts.rides && !plain) {
    for (const e of (L.ents || [])) {
      if (e.t === 'mover' && e.slab && !e.range && !e.vert && !e.sink) for (let x = e.x; x < e.x + (e.len || 3); x++) extraFoot.push(x + ',' + (e.y - 1));   /* A SLAB HELD STILL IS A LEDGE (the Witchlight Stair's cracked ledges and the Gargoyle's slabs): the band below only boards a mover from two tiles off */
      if (e.t === 'pad') for (const dx of (e.big ? [-1, 0, 1] : [-1, 0])) extraFoot.push((e.x + dx) + ',' + (e.y - 1));   /* a big pad is two tiles wide, centred on its column: it reaches half into both neighbours */
      if (e.t === 'pad' && e.spring && !e.big) for (const dx of [-1, 0]) buds.add((e.x + dx) + ',' + (e.y - 1));
      if (e.t === 'wasp' && !opts.noFoes) { extraFoot.push(e.x + ',' + (e.y - 1)); springs.add(e.x + ',' + (e.y - 1)); }
    }
    for (const m of (L.moversExtra || [])) if (m.kind === 'wheel' && m.r) { const cells = [];
      for (let a = 0; a < 24; a++) { const th = a / 24 * Math.PI * 2; cells.push([Math.floor((m.px + Math.cos(th) * m.r) / TSZ), Math.floor((m.py + Math.sin(th) * m.r) / TSZ) - 1]); }
      for (const [cx, cy] of cells) extraFoot.push(cx + ',' + cy); groups.push({ cells, set: new Set(cells.map(([cx, cy]) => cx + ',' + cy)) }); }
    /* A CHAIR-O-PLANE (the Harvest Fair, claude/fairfix3; src/fair-rides.js): its near chairs are footing along the front of the ring, and one hop to the next carries you
       round to any of them - the model treats the front run as one ride, as it treats a wheel's paddles */
    for (const c of (L.chairos || [])) { const cells = [];
      for (let a = 0; a < 24; a++) { const th = a / 24 * Math.PI * 2, s = Math.sin(th); if (s <= 0.15) continue; cells.push([Math.floor((c.cx + Math.cos(th) * c.R) / TSZ), Math.floor((c.cy - (1 - s) / 2 * 24) / TSZ) - 1]); }
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
  /* A GUST YOU RIDE (Gale Moor, docs/briefs/gale-moor-rework.md): a zone that says `carry: n` takes a jump that starts in it, or
     one tile short of it, n tiles further downwind (both ways when it alternates). Its gap is wider than any jump on purpose, so
     without this every tool called the far bank of a ride unreachable - and fixing that one row by hand would have been a lie.
     opts.rides only, with the other rides: the plain fill is legs and nothing else. */
  const carries = (opts.rides && !plain) ? (L.gusts || []).filter(z => z.carry > 0).map(z => ({ x0: Math.floor(z.x0 / TSZ) - 1, x1: Math.ceil(z.x1 / TSZ), y0: Math.floor(z.y0 / TSZ), y1: Math.ceil(z.y1 / TSZ), n: z.carry, dir: z.dir, alt: !!z.alt })) : [];
  const carryAt = (x, y) => { let l = 0, r = 0; for (const c of carries) if (x >= c.x0 && x <= c.x1 && y >= c.y0 && y <= c.y1) { if (c.dir > 0 || c.alt) r = Math.max(r, c.n); if (c.dir < 0 || c.alt) l = Math.max(l, c.n); } return [l, r]; };
  const assisted = !L.reachExact && (!!(L.moversExtra && L.moversExtra.some(m => m.kind !== 'lift' && m.kind !== 'swing' && m.kind !== 'growcap' && m.kind !== 'hexvine')) || (L.ents || []).some(e => ['mover', 'cart'].includes(e.t)) || !!(L.gusts && L.gusts.length)
    || !!L.sanctum);   /* A PORTAL IS A RIDE THE FILL CANNOT FOLLOW: the Falling Tower's gate stands past the sanctum's second door, on purpose (tools/tower-ascent.mjs). The tower read ASSISTED only because the bell loft had lifts in it; when the lifts became the Sexton's deck (2026-09-25) the bot called its gate UNREACHABLE */

  // every tile you could be standing on
  const key = (x, y) => x + ',' + y;
  const footing = new Set();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
    if (stand(at(x, y)) && !solid(at(x, y - 1)) && at(x, y - 1) !== T.SPIKE) footing.add(key(x, y - 1));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (climbable(at(x, y))) footing.add(key(x, y));
  for (const k0 of extraFoot) footing.add(k0);
  /* DEEP WATER THAT HURTS IS NOT A FLOOR (THE FOG CANAL, L.noWade): a fall into it costs health and hands you back to the bank (L.waterHurts), so the
     canal's bed under it is nowhere anyone walks - only the barge (its L.rigBands) crosses. Only a level that says so: no other level's fill moves */
  if (L.noWade) for (const p of (L.pools || [])) { if (p.swim || p.shallow) continue; const r0 = Math.floor(p.y / TSZ), r1 = Math.floor(((p.bottom ?? p.y + 64) - 1) / TSZ);
    const onRide = (x, y) => (L.rigBands || []).some(([a, b, y0, y1]) => x >= a && x <= b && y >= y0 - 1 && y <= y1);   /* (claude/canalfix) her deck at any level her water can stand at stays footing: a lock that starts FULL must not drown its own low stop */
    for (let x = Math.floor(p.x0 / TSZ); x < Math.ceil(p.x1 / TSZ); x++) for (let y = r0; y <= r1; y++) if (!onRide(x, y)) footing.delete(key(x, y)); }
  // SWIM WATER (the Long Water): every open cell of a swimmable pool is somewhere you can be - you swim to any
  // neighbour, and at the surface you can leap out. A tide pool counts at its high water; a boss's tide does not.
  const water = new Set(), surfRow = new Map();
  for (const p of (L.pools || [])) { if (!p.swim || p.arenaTide) continue; const topPx = p.streetTide ? p.base + p.tideHi : p.y; const r0 = Math.floor(topPx / TSZ), r1 = Math.floor(((p.bottom ?? topPx + 64) - 1) / TSZ);
    for (let x = Math.floor(p.x0 / TSZ); x < Math.ceil(p.x1 / TSZ); x++) for (let y = r0; y <= r1; y++) if (!solid(at(x, y))) { water.add(key(x, y)); footing.add(key(x, y)); surfRow.set(key(x, y), r0); } }

  /* A ZIP LINE (src/zipline.js, claude/zipline): take hold anywhere along its run - UP with the rope in your reach, or a touch from a jump - ride it downhill, and let go at its low end onto the floor under its foot. A frayed one
     (the Fair's bunting rope, `snap`) snaps over its pit and carries nobody across, so the fill leaves it out. board(x, y): is the rope within a hand's reach of a hero standing in this cell, or a jump above it? land: the footing under its foot. */
  const zips = plain ? [] : (L.zipLines || []).filter(z => !z.snap).flatMap(z => {
    const dx = z.x1 - z.x0, dy = z.y1 - z.y0, xa = Math.min(z.x0, z.x1), xb = Math.max(z.x0, z.x1), slope = dx ? dy / dx : 0, hang = z.hang ?? 12;
    const dirs = z.dir !== undefined && z.dir !== 0 ? [z.dir] : Math.abs(dy) < 2 ? [1, -1] : [(dy > 0 ? 1 : -1) * Math.sign(dx)];
    return dirs.map(dir => ({ xa, xb, dir, ly: px => z.y0 + slope * (Math.max(xa, Math.min(xb, px)) - z.x0),
      land() { const lx = dir > 0 ? xb : xa, row = Math.floor((z.y0 + slope * (lx - z.x0) + hang - 1) / TSZ), out = [];
        for (let k = -1; k <= 3; k++) { const cx = Math.floor(lx / TSZ) + dir * k; let ny = row; while (ny < H - 1 && !footing.has(key(cx, ny))) ny++; if (footing.has(key(cx, ny))) out.push([cx, ny]); } return out; },
      board(x, y) { const px = x * TSZ + 8, feet = (y + 1) * TSZ; if (dir > 0 ? (px < xa - 10 || px > xb - 12) : (px > xb + 10 || px < xa + 12)) return false; const l = this.ly(px); return l >= feet - 72 && l <= feet - 4; } })); });
  const zipLand = new Map();
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
  /* A LIFT IS NOT BOARDED THROUGH A WALL: a hero beside it (up to two columns off its footprint) steps on only along open ground - a solid tile between him and the footprint at his own height shuts it. (THE PUPPETEER's batten stands in the lee of the stage door's wall: with the elite's gate shut on that door the fill boarded it through the wall and walked round the gate - tools/elites.mjs.) */
  const wallBetween = (x, y, lf) => { if (x >= lf.x0 && x <= lf.x1) return false; const step = x < lf.x0 ? 1 : -1, edge = x < lf.x0 ? lf.x0 : lf.x1; for (let tx = x + step; tx !== edge + step; tx += step) if (solid(at(tx, y))) return true; return false; };
  // everywhere you can get to from one tile (push is handed in, so tools/traps.mjs can run it backwards)
  /* THE SKY ROAD's CLOAK (src/sky-road.js, claude/skyroad; only a level with L.skyroad, and never the plain fill or opts.noGlide). Hold jump as you fall
     and you GLIDE - about 2.3 columns a row dropped, at a hero's run; the fill allows 6 + 2 a row - and a glide that meets a THERMAL's column (a vent with
     thermal: true, any of its rows at or under your feet) rides it: the column's ledges, and a fresh glide off its top. Sun-stones, the disc and clouds are
     the live game's; the fill counts every thermal as lit (tools/skyroad.mjs proves each stone is a lock). */
  const sky = L.skyroad && !plain && !opts.noGlide, therm = sky ? vents.filter(v => v.thermal) : [], tTop = v => Math.floor(v.y + 1 - (v.h || 112) / TSZ);
  const rowFoot = new Map(); if (sky) for (const k0 of footing) { const [fx, fy] = k0.split(',').map(Number); if (!rowFoot.has(fy)) rowFoot.set(fy, []); rowFoot.get(fy).push(fx); }
  const ridden = new Set();
  /* a glide sinks as it goes: d columns out it is at least (d - 6) / 2 rows under its start (and no more than 3 over it) - every column on the way needs open air in that band */
  const glideAcross = (x, dx, y, r) => { const s1 = Math.sign(dx); for (let c = x + s1, d = 1; c !== x + dx; c += s1, d++) { const lo = Math.max(0, y - 3 + Math.max(0, Math.ceil((d - 6) / 2))); let ok = false; for (let rr = lo; rr <= r && !ok; rr++) ok = !wall(at(c, rr)); if (!ok) return false; } return true; };
  const glideFrom = (x, y, push) => {
    for (let dy = 0; dy <= 34 && y + dy < H; dy++) { const span = 6 + 2 * dy, r = y + dy;
      for (const fx of (rowFoot.get(r) || [])) { const dx = fx - x; if (Math.abs(dx) <= span && (!dx || glideAcross(x, dx, y, r))) push(fx, r); } }
    for (const v of therm) { if (ridden.has(v) || v.y < y - 2) continue; const dx = v.x - x; if (Math.abs(dx) - 1 > 6 + 2 * Math.max(0, v.y - y) || (dx && !glideAcross(x, dx, y, v.y))) continue; ride(v, push); }
  };
  const ride = (v, push) => { if (ridden.has(v)) return; ridden.add(v); const top = tTop(v);
    for (let ty = top - 1; ty <= v.y; ty++) for (let dx = -3; dx <= 3; dx++) push(v.x + dx, ty);
    glideFrom(v.x, top - 1, push); };
  const expand = (x, y, push) => {
    if (sky) { glideFrom(x, y, push); for (const v of therm) if (Math.abs(v.x - x) <= 1 && y <= v.y && y >= tTop(v) - 1) ride(v, push); }
    const springy = at(x, y + 1) === T.BOUNCER || springs.has(key(x, y)), up = strikeUp.has(key(x, y)) ? strikeUp.get(key(x, y)) : springy ? BOUNCE_UP : buds.has(key(x, y)) ? BUD_UP : Math.min(JUMP_UP, opts.maxUp || JUMP_UP);
    for (const v of vents) if (Math.abs(v.x - x) <= 1 && v.y === y) { const top = Math.floor(v.y + 1 - (v.h || 112) / TSZ);
      const half = opts.rides ? Math.max(3, Math.ceil((v.w || 0) / 2 / TSZ)) : 3;
      for (let ty = top - 1; ty <= v.y; ty++) for (let dx = -half; dx <= half; dx++) push(v.x + dx, ty); }
    for (const lf of lifts) if (x >= lf.x0 - 2 && x <= lf.x1 + 2 && y >= lf.y0 - 2 && y <= lf.y1 && !wallBetween(x, y, lf)) for (let ty = lf.y0 - 1; ty <= lf.y1; ty++) for (let dx = -2; dx <= lf.x1 - lf.x0 + 2; dx++) push(lf.x0 + dx, ty);
    for (const zl of zips) if (zl.board(x, y)) for (const [lx, ly] of (zipLand.get(zl) || (zipLand.set(zl, zl.land()), zipLand.get(zl)))) push(lx, ly);   /* a zip line: on it anywhere, off at its foot */
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
      const span = tight ? 1 : Math.round((opts.across || JUMP_ACROSS) * (1 - Math.abs(dy) / (up + 1.5)));
      const apex = y - Math.min(up, head);
      const [cl, cr] = tight ? [0, 0] : carryAt(x, y);   /* a gust behind you: the same arc, further (above) */
      for (let dx = -span - cl; dx <= span + cr; dx++) if (!dx || across(x, dx, apex, Math.min(y, y + dy))) push(x + dx, y + dy);
    }
    // fall: straight down, and out to either side
    const fa = opts.across || JUMP_ACROSS; for (const dx of [-fa, -2, 0, 2, fa]) { let ny = y;
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
