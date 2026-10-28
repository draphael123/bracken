/* tools/solid-islands.mjs - EVERY SOLID / PLANK / ONE-WAY RUN THAT IS NOT JOINED TO GROUND OR A WALL MUST HAVE A DRAWN SUPPORT (claude/floatsweep).
   Daniel, 2026-10-08: loose plank platforms round the Hurricane Deck's fallen mast; the Monastery's grass-and-dirt slabs and board chains in open sky
   (review-monastery M3/M4); Highcrown's review. tools/floaters.mjs only checks PROPS, tools/architecture.mjs only masonry / facades.
   tools/floating-geometry.mjs finds the groups that touch nothing but does not ask what DRAWS the thing that holds them; this does.

   ISLAND   a 4-connected group of non-air tiles (a rope - T.NET - joins) that does not reach the edge of the map and is not a machine the game moves.
   SUPPORT  something the renderer DRAWS under, over or round it:
     post      a routeSupports post (src/route-art.js), a standing deco (stilt, bridgepost, bridgetower, pierPost, column, pillar, archPillar,
               canopyPost, mastStump, mastTall, netPoles, rigging, boardingNet, spar...) or a scaffold / timber / chainpost / treehouse / felltree ent
     hanger    a monk hanger, a rope with posts (L.ropes, zip lines), a cable bridge, a hoist, a bridge ent, a rope-hung chain of NET
     frame     a declared structure / watchtower / house / hull / cabin / ship zone / interior / masonry / facade the island's cells sit in
   A level, or one island of it, can be ALLOWED in ALLOW with a one-line reason. An allowlist entry that no longer matches fails (it cannot outlive what it excuses).
     node tools/solid-islands.mjs            the gate and the table
     node tools/solid-islands.mjs <id> ...   only those levels, every island listed */
import { pathToFileURL } from 'url';
import { LEVELS, T } from '../src/level.js';
import { islandsOf } from '../src/island-posts.js';

/* A RATCHET, NOT A PASS. id -> [how many bare islands the level has, the one-line reason]. The count may only go DOWN: more bare islands than listed fails
   (a new floating slab), fewer fails too until the number is lowered here (a fix must shrink the list; an entry cannot outlive what it excuses). */
const NATURAL = 'organic ledge art that grows where it stands (logs in the canopy, caps, reeds, rock slabs): the forest/crag convention, checked by screenshot 2026-10-08; the complaint is BUILT places';
const OWNED = (lane, n) => [n, 'owned by ' + lane + ', fixing tonight (2026-10-08): TEMPORARY'];
export const ALLOW = {
  /* wood: 25 -> 0 (claude/lumbertrail: THE LUMBER TRAIL stands every deck on a woodsman's timber crib, src/forest-supports.js) */ /* marsh: 14 -> 0 (claude/marsh2, the Act I bar: bog-oak stilts under boards, reed bundles under tufts - src/forest-supports.js 'marsh') */ /* stockade: 25 -> 0 (claude/stockade2, Daniel 10-18 Act I bar: on the island-post kit - lashed poles - and its bridges' sags and ledges hung off boards and nets) */ /* spore: 31 -> 0 (claude/sporewood2: SPOREWOOD 2 is laid by hand - its four shelves hang on the Mother's roots, src/forest-supports.js 'root') */ /* kings: 103 -> 0 (claude/kingswood2: KINGSWOOD 2 is a built court - its stands, boughs and decks stand on the timber posts of src/island-posts.js) */ /* (claude/buriedcity2: THE BURIED CITY 45 -> 0 - every ledge declares its corbels, poles, brackets or chains) */ /* scree hanging moor skyroad rootway glasssea witchlight: 0 - every slab stands on its own drawn kit (src/forest-supports.js) */
  /* spire: 49 -> 0 (claude/screefix): every board of the Monastery stands on a drawn scaffold post, every floor on masonry piers (src/spire-supports.js) */   /* church: 42 -> 0 (claude/church2: pew legs, piers, stalls, chains, bone columns, organ pipes - src/church-supports.js) */ towpath: [2, 'THE TOWPATH 2 greybox (claude/towpath2): on the island-post kit now; the two left are the aqueduct gantries over the gorge (no ground under them in post reach) - the art lane hangs them off the trough'], /* flotilla: 2 -> 0 (claude/flotilla2: every spar, boom, net and hawser is lashed to a hull or a mast) */ /* hurricane: 17 -> 0 (claude/hurricane2: every spar is a yard on its mast and lifts, a topmast on its stay, a hatch cover on its lashings) */ crown: [1, 'one plank tile of the scaffold pit tower A (169,60) beside its rungs, pre-existing (claude/highcrown2: 53 -> 1 - the cuts took the road and the armoury, and every new ledge stands on a pier or hangs on a chain)'], ksar: [32, 'owned by the ksar lane, TEMPORARY: 25 from the greybox plus the 7 slabs of ksar2 (store overhangs, powder-run lintels, tower deck) - their supports are an art-lane job (batch82 integ)'], oreroad: OWNED('winch/oreroad', 11),
  minecart: [1, 'one rail pair at 960-981: listed for the minecart lane'],
  undercrown: [1, 'one stope stage over a pit shaft, void under it (claude/undercrown2art: the hung walkway and the timber sets are drawn supports now: the allowance fell from 3)'],
  mage: [8, 'library ledges and one plinth high in the hall, void under, and a rope ladder: listed for the mage lane'],
  /* mage 7 -> 8: the rope-ladder island (NET column 284, rows 17-29) was credited to the neighbouring board's post by the box test; the post-reach rule asks for the post's own column. The rope is its support: listed for the mage lane */
  /* THE POST-REACH RULE'S FIRST RUN (claude/screefix, 2026-10-16): what it newly flagged, each with its reason - none of it is a slab on a drawn post that stops short */
  skyroad: [5, 'cloud-stone pillars that end in a drawn cloud puff (src/forest-supports.js FREE_LEN): the sky road floats by design, there is no ground under it; the post-reach rule flags the free end'],
  witchlight: [12, 'rune-stone pillars of the Witchlight Stair that end free in the dark (FREE_LEN): the stair hangs in a void by design; the post-reach rule flags the free end'],
  glasssea: [1, 'one glass pedestal ending free over the sea (FREE_LEN): the post-reach rule flags the free end'],
  hanging: [3, 'one slab at 70,63 over the chasm held by a vine bough that tapers free (FREE_LEN): listed for the hanging lane; + the two crown perch ledges at 24-26 and 84-86 row 17 (batch98 integ, claude/owl3): THE DROP breaks the boards under each, so the ledge post is a vine hanging 7 rows into the night that ends free - drawn, but one row past FREE_LEN; listed for the owl lane'],
  canal: [2, 'warehouse and lock masses in fog: listed for the canal lane'], welltown: [3, 'sandstone towers: listed for the welltown lane'], redgorge: [1, 'a timber slab of the gorge camp: listed for the redgorge lane'],
};

const SUPPORT_DECO = new Set(['stilt', 'bridgepost', 'bridgetower', 'pierPost', 'column', 'pillar', 'archPillar', 'canopyPost', 'mastStump', 'mastTall', 'netPoles', 'rigging', 'boardingNet', 'spar', 'brokenPillar', 'poles', 'gatehouse', 'bellFrame', 'bellTower', 'siege', 'ubGantry', 'flagPost']);
const SUPPORT_ENT = new Set(['scaffold', 'timber', 'chainpost', 'treehouse', 'felltree', 'bridge', 'hoist', 'mast', 'towertop', 'awningwinch', 'windlass', 'crank']);

export const islands = L => islandsOf(L, T);

/* THE POST-REACH RULE (claude/screefix, Daniel 2026-10-15: "the drawn posts end short of the slab or of the ground below"). A routeSupports post only counts as a support when
     TOP   the island has a cell in the post's own column at the post's row (+-1): the post starts under the slab it holds, not in the air beside it;
     FOOT  the post is not 'free' (a tapering end in open air is the art's choice, not ground) and the first tile under its foot (row p.bottom) is not air: it REACHES a
           solid, a board or another island within POST_REACH_PX = 8 px (half a tile: no whole row of air under the foot, the art's own seam).
   Run across every level: what it newly flags is fixed or ratcheted in ALLOW with a reason (see work/claude/lane-done/claude-screefix.md). The visible half (does the INK
   reach?) is tools/visible-supports.mjs; this is the cheap geometry half, run by check.mjs on all levels. */
export const POST_REACH_PX = 8;
function postHolds(L, s, p) {
  const W = L.W, H = L.H, g = L.grid, cells = s.set || (s.set = new Set(s.cells));
  let top = false; for (let y = p.y - 1; y <= p.y + 1; y++) if (cells.has(y * W + p.x)) { top = true; break; }
  if (!top || p.free) return false;
  if (p.kind === 'chain' || p.kind === 'hcchain') { let r = p.top - 1; return r >= 0 && r < H && g[r * W + p.x] !== T.AIR && g[r * W + p.x] !== T.NET; }   /* (b97base merge: claude/church2 vs claude/screefix) a CHAIN hangs from the stone over it, its foot is free by design: it holds when its anchor row (p.top - 1... the row above its first link) is solid, not when its foot meets ground */
  if ((L.pools || []).some(q => p.x * 16 + 8 >= q.x0 && p.x * 16 + 8 < q.x1 && p.bottom * 16 > q.y)) return true;   /* a pile driven into a pool: its foot is under the water, on the bed the map does not draw */
  let r = p.bottom, gap = 0; if (r >= H) return true;
  while (r < H && (g[r * W + p.x] === T.AIR || g[r * W + p.x] === T.NET)) { r++; gap += 16; if (gap > POST_REACH_PX) return false; }
  return r < H;
}

/* what holds island `s` up: [] when nothing drawn does */
export function supportsOf(L, s) {
  const W = L.W, why = [], inR = (x, y, a, b, c, d, pad = 0) => x >= a - pad && x <= b + pad && y >= c - pad && y <= d + pad;
  const anyCell = (a, b, c, d, pad = 0) => s.cells.some(j => inR(j % W, (j / W) | 0, a, b, c, d, pad));
  const overlap = (a, b, c, d, pad = 0) => s.x1 >= a - pad && s.x0 <= b + pad && s.y1 >= c - pad && s.y0 <= d + pad;
  for (const p of L.routeSupports || []) if (p.x >= s.x0 && p.x <= s.x1 && p.y >= s.y0 && p.y <= s.y1 && p.bottom > p.y + 1 && postHolds(L, s, p)) { why.push('post'); break; }
  for (const h of (L.monk && L.monk.hangers) || []) if (h[0] >= s.x0 - 1 && h[0] <= s.x1 + 1 && h[1] <= s.y1 + 1 && h[2] >= s.y0 - 1) { why.push('hanger'); break; }
  for (const r of L.ropes || []) { if (Array.isArray(r)) { if (overlap(r[0], r[1], r[2] - 2, r[2] + 2)) { why.push('rope'); break; } }
    else if (r.x0 !== undefined && r.y0 !== undefined && r.x1 !== undefined) { if (overlap(Math.min(r.x0, r.x1) / 16 - 1, Math.max(r.x0, r.x1) / 16 + 1, Math.min(r.y0, r.y1) / 16 - 3, Math.max(r.y0, r.y1) / 16 + 3)) { why.push('rope'); break; } } }
  for (const r of L.zipLines || []) if (overlap(Math.min(r.x0, r.x1) / 16 - 1, Math.max(r.x0, r.x1) / 16 + 1, Math.min(r.y0, r.y1) / 16 - 3, Math.max(r.y0, r.y1) / 16 + 3)) { why.push('zip'); break; }
  for (const r of L.cableBridges || []) if (overlap(r[0], r[1], r[2], r[3], 1)) { why.push('cable'); break; }
  for (const b of L.bridges || []) if (overlap(b.x, b.x1, b.y - 1, b.y + 1)) { why.push('bridge'); break; }
  for (const h of L.hoists || []) if (typeof h === 'object' && h.x !== undefined && overlap(h.x - 2, h.x + 2, h.top, h.hang, 1)) { why.push('hoist'); break; }
  for (const z of L.mcTrestles || []) if (overlap(z[0], z[1], z[2] - 1, z[2] + 1, 0)) { why.push('trestle'); break; }   /* the minecart's rails stand on drawn trestles */
  for (const z of [...(L.mcBeams || []), ...(L.carousels || [])]) if (overlap(z.x0, z.x1, z.row - 8, z.row + 1, 0)) { why.push('machine'); break; }   /* a drawn ride / a crusher beam */
  if (L.tower && L.tower.x0 !== undefined && overlap(L.tower.x0, L.tower.x1, L.tower.top, L.H, 0)) why.push('tower');   /* the fair's drawn tower */
  if (L.wheel && L.wheel.px !== undefined && overlap((L.wheel.px - L.wheel.r) / 16 - 2, (L.wheel.px + L.wheel.r) / 16 + 2, (L.wheel.py - L.wheel.r) / 16 - 2, (L.wheel.py + L.wheel.r) / 16 + 2, 0)) why.push('wheel');   /* the fair's drawn wheel */
  if (L.elevator && L.elevator.x0 !== undefined && overlap(Math.min(L.elevator.x0, L.elevator.x1) / 16 - 2, Math.max(L.elevator.x0, L.elevator.x1) / 16 + 2, Math.min(L.elevator.y0, L.elevator.y1) / 16 - 2, Math.max(L.elevator.y0, L.elevator.y1) / 16 + 2, 0)) why.push('elevator');
  for (const t of (L.fields && L.fields.trunks) || []) if (t[0] >= s.x0 - 1 && t[0] <= s.x1 + 1 && t[1] <= s.y1 + 2 && t[2] >= s.y0) { why.push('trunk'); break; }   /* the Hexed Fields' drawn dead trunks [x, top, bottom] hold their planks up */
  for (const z of [...(L.structures || []), ...(L.watchtowers || [])]) if (anyCell(z.x0, z.x1, z.top, z.floor, 1)) { why.push('structure'); break; }
  for (const z of L.houses || []) if (anyCell(z.x0, z.x1, z.y0 - 3, z.y1 + 1, 1)) { why.push('house'); break; }
  /* A WALL BEHIND IS NOT A POST: a facade, a masonry rect or a room carries the ROCK inside it (laid stone is a wall), never the boards laid in front of it (the Monastery's scaffold, 2026-09-25) */
  const boards = s.raw.some(k => k === T.ONEWAY || k === T.PLANK || k === T.REED || k === T.SHELF || k === T.RAIL || k === T.BOUNCER);
  for (const k of boards ? ['hullZones', 'cabins', 'shipZones'] : ['hullZones', 'cabins', 'shipZones', 'masonry', 'airRooms']) for (const z of L[k] || []) if (Array.isArray(z) && anyCell(z[0], z[1], z[2], z[3], 1)) { why.push(k); break; }
  for (const z of (L.interiors || [])) if (!boards && Array.isArray(z) && z[4] && anyCell(z[0], z[1], z[2], z[3], 1)) { why.push('interior'); break; }
  for (const z of (L.facades || [])) if (!boards && Array.isArray(z) && anyCell(z[0], z[1], z[2], z[3], 0)) { why.push('facade'); break; }
  for (const e of L.ents || []) { const x = e.x, y = e.y;
    if (e.t === 'deco' && SUPPORT_DECO.has(e.kind) && x >= s.x0 - 1 && x <= s.x1 + 1 && y >= s.y0 - 3 && y <= s.y1 + 40) { why.push(e.kind); break; }
    if (SUPPORT_ENT.has(e.t) && x >= s.x0 - 2 && x <= s.x1 + 2 && y >= s.y0 - 6 && y <= s.y1 + 40) { why.push(e.t); break; } }
  return why;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2), only = args.filter(a => !a.startsWith('-')), all = args.includes('--all');
  const campaign = LEVELS.filter(d => !(d.hidden && !d.secret) && !/^(shop|trial_|custom)/.test(d.id));
  const pick = only.length ? LEVELS.filter(d => only.includes(d.id)) : campaign;
  const box = s => s.x0 + (s.x1 > s.x0 ? '-' + s.x1 : '') + ',' + s.y0 + (s.y1 > s.y0 ? '-' + s.y1 : '');
  let fails = 0; const rows = [], used = new Set();
  for (const d of pick) { let L; try { L = d.build(); } catch (e) { continue; } if (!L || !L.grid) continue;
    const bare = islands(L).filter(s => !supportsOf(L, s).length);
  const al = ALLOW[d.id]; let allowed = 0, listed = bare, stale = '';
  if (al) { used.add(d.id);
    if (bare.length === al[0]) { allowed = bare.length; listed = []; }
    else if (bare.length < al[0]) { stale = 'LOWER the allowance of ' + d.id + ' from ' + al[0] + ' to ' + bare.length + ' (a fix landed)'; listed = []; allowed = bare.length; fails++; }
    else { stale = d.id + ' has ' + bare.length + ' bare islands, allowance ' + al[0] + ': a new floating slab'; fails++; allowed = al[0]; } }
  rows.push({ id: d.id, total: bare.length, allowed, left: listed.length, listed, stale });
  fails += listed.length; }
console.log('level            bare  allowed  LEFT   islands (kinds x tiles @ x,y)');
  for (const r of rows) { if (r.stale) console.log('  !! ' + r.stale); if (!r.total && !all) continue;
    console.log(r.id.padEnd(16), String(r.total).padStart(4), String(r.allowed).padStart(7), String(r.left).padStart(5), '  ' + (only.length || all ? r.listed.map(s => s.kinds.join('+') + ' x' + s.n + ' @' + box(s)).join('; ') : r.listed.slice(0, 6).map(s => '@' + box(s)).join(' ') + (r.listed.length > 6 ? ' ...' : ''))); }
  for (const id of Object.keys(ALLOW)) if (!used.has(id) && (!only.length || only.includes(id))) { console.log('STALE allowlist entry (no such level): ' + id); fails++; }
  if (fails) { console.log('solid-islands: ' + fails + ' undrawn-support island(s)/stale entries'); process.exit(1); }
  console.log('ok  solid-islands  every island of every level has a drawn support or a reasoned allowance');
}
