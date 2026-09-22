// src/draft/kings-pyramid.js — THE KING'S PYRAMID (desert arc level 7, the finale) as a GREYBOX DRAFT: a CLIMB, the structure, not
// the level (not in LEVELS). Measured by `node tools/draft-level.mjs kings-pyramid`. Brief: docs/desert-arc-brief.md.
//
// THE RULE: THE KING'S LIGHT. The pyramid is black. Sunlight comes down the light-wells from the apex into each gallery through a PORT
// in its roof, and the way up out of each gallery is shut by a SUN-DOOR in the roof that lifts when its PLATE is lit - so every gallery
// is a mirror room (src/light.js): turn the mirrors to carry the port's beam to the plate. Sunlight burns the dead: the beams are also
// your weapon against the king's court. The puzzles grow up the pyramid; THE GRAND GALLERY has no mini, it is the build-up.
// SEVEN SECTIONS, bottom to top: THE SUNLESS DOOR · THE GALLERY OF MIRRORS · THE GRAND GALLERY · THE QUEEN'S CHAMBER · THE AIR SHAFTS ·
// THE KING'S STAIR · THE CAPSTONE WAY · then THE SKELETON KING (the arena: src/skeleton-king.js's room, under the capstone).
import { TS } from './_kit.js';
export const KP = { W: 52, gap: 9, galleries: 21 };
/* the puzzle for a gallery whose way up is EAST (a west-exit gallery is the same room mirrored). y offsets are rows above the floor
   (the floor's top row is 0; the mirror row is 4). Each is its own small room; the check proves each opens, and none as built. */
const ROOMS = [
  { ports: [12], mirrors: [[12, 4, '/']] },                                                          // A: one mirror, turned wrong
  { ports: [8, 24], mirrors: [[8, 4, '\\'], [24, 4, '/']], pillars: [[18, 4]] },                     // C: a hung pillar shades the near port; use the far one
  { ports: [10], mirrors: [[10, 2, '/'], [30, 2, '\\'], [30, 4, '\\']] },                            // B: down, along, up, along - three mirrors
];
export function build(T) {
  const { W, gap, galleries: N } = KP, bottom = 12 + gap * N + 12, fr = k => bottom - gap * k, afl = fr(N), H = bottom + 3;   /* the chamber's floor IS the last door's row (3 rows of rock between them cut the king off) */
  const grid = new Uint8Array(W * H).fill(T.SOLID), set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const ents = [], ent = (t, x, y, e = {}) => ents.push({ t, x, y, ...e }), galleries = [], doors = [];
  /* THE PUZZLES GROW: the one-mirror rooms low down, the shaded-port rooms in the middle, the three-mirror rooms at the top (cycling the
     templates left the first section and the last just as hard) */
  const ORDER = [0, 0, 1, 0, 1, 0, 1,  1, 0, 2, 1, 1, 2, 1,  2, 1, 2, 2, 1, 2, 2];
  for (let k = 0; k < N; k++) {
    const f = fr(k), east = k % 2 === 0, mx = x => east ? x : W - 1 - x, room = ROOMS[ORDER[k]];
    air(3, W - 4, f - 8, f - 1);                                                                         // the gallery, eight rows
    const ex = east ? W - 8 : 5;                                                                          // the way up: a hole in the roof at this end...
    for (let x = ex; x < ex + 3; x++) set(x, f - 9, T.SOLID);                                              // ...shut by the SUN-DOOR (the roof tiles over it)
    doors.push({ tiles: [[ex, f - 9], [ex + 1, f - 9], [ex + 2, f - 9]] });
    const lx = east ? ex - 3 : ex + 3; for (let d = 0; d < 3; d++) { set(lx + d, f - 3, T.ONEWAY); set(ex + d, f - 6, T.ONEWAY); }   // the stair of ledges up to it, a jump (3 rows) apart (at f-4 the first was four rows up: nothing climbed)
    const plate = { x: mx(W - 5), y: f - 1 - 4 }; ent('sunplate', plate.x, plate.y, { hung: true });
    const mirrors = room.mirrors.map(([x, dy, st]) => ({ x: mx(x), y: f - 1 - dy, state: east ? st : (st === '/' ? '\\' : '/'), turnable: true }));
    for (const m of mirrors) ent('mirror', m.x, m.y, { state: m.state, hung: true });
    for (const [px, dy] of (room.pillars || [])) for (let y = f - 8; y <= f - 1 - dy; y++) set(mx(px), y, T.SOLID);
    const ports = room.ports.map(x => ({ x: mx(x), y: f - 8, dir: 'S' }));
    galleries.push({ k, f, east, plate, mirrors, ports, template: ROOMS.indexOf(room) });
  }
  // THE SKELETON KING's chamber on top: forty wide, twelve high, the last door opens into its floor
  air(6, 45, afl - 11, afl - 1);
  const NAMES = ['sunless', 'mirrors', 'grand', 'queen', 'shafts', 'stair', 'capstone'], sections = {}; NAMES.forEach((n, i) => sections[n] = fr(i * 3) - 1); sections.arena = afl;
  const marks = { sunless: fr(0), mirrors: fr(3), grand: fr(6), queen: fr(9), shafts: fr(12), stair: fr(15) };
  // THE GRAND GALLERY: galleries 6-8 are one tall hall (the build-up), its three doors and puzzles still in it... kept as three for the draft
  // pickups, checkpoints (every section's first gallery, and one under the king), the start
  for (let i = 0; i < 7; i++) { const g = galleries[i * 3]; ent('check', g.east ? 6 : W - 7, g.f - 1); }
  { const g = galleries[N - 1]; ent('check', g.east ? W - 14 : 13, g.f - 1); }
  for (const k of [2, 9, 16]) { const g = galleries[k]; ent('silver', g.east ? 20 : W - 21, g.f - 5); }
  for (const k of [4, 11, 18]) { const g = galleries[k]; ent('stray', g.east ? 26 : W - 27, g.f - 1); }
  { const g = galleries[10]; ent('relic', g.east ? 32 : W - 33, g.f - 1); }
  // the court: gilded guards, priests who re-wrap the fallen, shadow things that live in the dark - three a gallery
  const COURT = ['gildedguard', 'kingpriest', 'shadow'];
  let n = 0; for (const g of galleries) for (const fx of [16, 27, 38]) { let x = g.east ? fx : W - 1 - fx; if (ents.some(e => Math.abs(e.x - x) <= 1 && e.y === g.f - 1)) x++; ent(COURT[n++ % 3], x, g.f - 1); }
  const arena = { x0: 6 * TS, x1: 46 * TS, floor: afl * TS, trigger: 10 * TS, wallL: 5, wallR: 46, boss: 'skeletonking', tint: '#e8c24a', tintA: 0.08 };
  return { W, H, grid, ents, START: { x: 8, y: fr(0) - 1 }, pools: [], falls: [], moversExtra: [], interiors: [], sections, marks, arena, galleries, doors, draft: true, palette: { set: 'kingpyramid' } };
}
export function asPlayed(L, T) { const g = L.grid.slice(); for (const d of L.doors) for (const [x, y] of d.tiles) g[y * L.W + x] = T.AIR; return { ...L, grid: g }; }
export const meta = {
  name: "THE KING'S PYRAMID", orientation: 'v', landmarks: ['sunless', 'mirrors', 'grand', 'queen', 'shafts', 'stair'], sun: false, density: [3.5, 4.5], foes: ['gildedguard', 'kingpriest', 'shadow'],
  async extra(L, { ok, log, T, at, R }) {
    const { solve, trace, visible, makeOpaque } = await import('../light.js'); const opaque = makeOpaque(T), opts = { opaque, W: L.W, H: L.H };
    let dead = [], open = [], turns = [];
    for (const g of L.galleries) { const s = solve(at, g.ports, g.mirrors, [g.plate], opts), b = trace(at, g.ports, g.mirrors, [g.plate], opts);
      if (!s) dead.push(g.k); if (b.hit.size) open.push(g.k); turns.push(s ? s.turns : -1); }
    log('    turns to open each gallery, bottom to top: ' + turns.join(' '));
    ok(dead.length === 0, `every gallery's sun-door can be opened with the mirrors in it (${dead.length} cannot: ${dead.join(' ')})`);
    ok(open.length === 0, `none is open as built (${open.join(' ') || 'none'})`);
    const lo = turns.slice(0, 7), hi = turns.slice(-7), avg = a => a.reduce((s, v) => s + v, 0) / a.length;
    ok(avg(hi) > avg(lo), `the puzzles grow up the pyramid: ${avg(lo).toFixed(1)} turns a gallery in the first section's reach, ${avg(hi).toFixed(1)} in the last`);
    // THE DARK: as built, how much of the floor you can stand on can be seen (only the ports' straight beams, and their glow)
    let cells = 0, seen = 0; for (const g of L.galleries) { const b = trace(at, g.ports, g.mirrors, [], opts); for (let x = 3; x < L.W - 3; x++) { if (!R.seen.has(x + ',' + (g.f - 1))) continue; cells++; if (visible(b, x, g.f - 1)) seen++; } }
    ok(cells > 0 && seen / cells < 0.3, `THE PYRAMID IS BLACK: as built, ${Math.round(100 * seen / cells)}% of the floor can be seen (the rest is dark until you route the light)`);
  },
};
