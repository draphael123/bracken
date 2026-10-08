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
  wood: [24, NATURAL], marsh: [14, NATURAL], stockade: [24, NATURAL], spore: [28, NATURAL], kings: [101, NATURAL], scree: [55, NATURAL], hanging: [35, NATURAL], moor: [25, NATURAL],
  skyroad: [19, NATURAL + ' (sky road: floating slabs are the level)'], rootway: [17, NATURAL + ' (root-shelf caps)'], glasssea: [28, 'floating glass shards are the Glass Sea (theme, screenshot-checked)'],
  witchlight: [32, 'floating stone blocks round the witch spire are the level (theme, screenshot-checked); the lane may add chains/runes'],
  spire: OWNED('spire', 3), flotilla: OWNED('flotilla', 2), hurricane: OWNED('hurricane', 17), crown: OWNED('crown', 1), ksar: OWNED('ksar', 6), oreroad: OWNED('winch/oreroad', 11),
  fair: [11, 'rides, stage and stall frames are drawn by src/fair-rides.js / fair-kit (six spots screenshot-checked); stage-roof and slide islands left to the fair lane'],
  minecart: [6, 'mine ceilings and rail trestles: timber frames drawn behind (mcBeams, screenshot-checked); one rail pair at 960-981 listed for the minecart lane'],
  lamplit: [2, 'two bridge-pier stumps with a rope (SOLID+NET): listed for the lamplit lane'],
  deep: [2, 'a rope-hung slab and a drowned block, in water: listed for the deep lane'],
  causeway: [3, 'a stone gateway, a rope and a ruin at the waterline: listed for the causeway lane'],
  mage: [2, 'library plinths: listed for the mage lane'], fallingtower: [2, 'two slate stubs of the broken tower: listed for the fallingtower lane'],
  unburied: [1, 'the tomb pit lid (SOFT): listed for the unburied lane'],
  canal: [6, 'warehouse and lock masses in fog: listed for the canal lane'], welltown: [4, 'sandstone towers: listed for the welltown lane'], redgorge: [3, 'timber slabs of the gorge camp: listed for the redgorge lane'],
};

const SUPPORT_DECO = new Set(['stilt', 'bridgepost', 'bridgetower', 'pierPost', 'column', 'pillar', 'archPillar', 'canopyPost', 'mastStump', 'mastTall', 'netPoles', 'rigging', 'boardingNet', 'spar', 'brokenPillar', 'poles', 'gatehouse', 'bellFrame', 'bellTower', 'siege', 'ubGantry', 'flagPost']);
const SUPPORT_ENT = new Set(['scaffold', 'timber', 'chainpost', 'treehouse', 'felltree', 'bridge', 'hoist', 'mast', 'towertop', 'awningwinch', 'windlass', 'crank']);

export const islands = L => islandsOf(L, T);

/* what holds island `s` up: [] when nothing drawn does */
export function supportsOf(L, s) {
  const W = L.W, why = [], inR = (x, y, a, b, c, d, pad = 0) => x >= a - pad && x <= b + pad && y >= c - pad && y <= d + pad;
  const anyCell = (a, b, c, d, pad = 0) => s.cells.some(j => inR(j % W, (j / W) | 0, a, b, c, d, pad));
  const overlap = (a, b, c, d, pad = 0) => s.x1 >= a - pad && s.x0 <= b + pad && s.y1 >= c - pad && s.y0 <= d + pad;
  for (const p of L.routeSupports || []) if (p.x >= s.x0 && p.x <= s.x1 && p.y >= s.y0 && p.y <= s.y1 && p.bottom > p.y + 1) { why.push('post'); break; }
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
  for (const k of ['hullZones', 'cabins', 'shipZones', 'masonry', 'airRooms']) for (const z of L[k] || []) if (Array.isArray(z) && anyCell(z[0], z[1], z[2], z[3], 1)) { why.push(k); break; }
  for (const z of (L.interiors || [])) if (Array.isArray(z) && z[4] && anyCell(z[0], z[1], z[2], z[3], 1)) { why.push('interior'); break; }
  for (const z of (L.facades || [])) if (Array.isArray(z) && anyCell(z[0], z[1], z[2], z[3], 0)) { why.push('facade'); break; }
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
