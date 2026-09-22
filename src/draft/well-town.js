// src/draft/well-town.js — THE WELL TOWN (desert arc level 2) as a GREYBOX DRAFT: the structure, not the level (not in LEVELS,
// nothing loads it). Measured by `node tools/draft-level.mjs well-town`. Brief: docs/desert-arc-brief.md.
//
// THE RULE: WATER IS CARRIED. A skin you fill at wells (src/desert-rules.js: three sips). It cures sunstroke, and poured it softens
// a MUD WALL to nothing or puts out a fire. Bandits hold the wells. Said three ways (C4): the wells are the only blue in a white town,
// every mud wall is cracked and dark where water would take it, and the skin on the HUD shows its sips.
// SEVEN SECTIONS: THE CARAVAN GATE (fill the skin at the first well; a mud wall hides a stray - the rule taught) · THE LOWER MARKET
//   (stalls, awnings, THE SHOP; THE COVERED BAZAAR: a long roof with a walkway on it) · THE WELL SQUARE (THE GREAT WELL: its windlass
//   is the machine, F5 - it lowers you into the cisterns, and back) · THE CISTERNS (under the town: a pillared hall, cool, dark; the
//   street above is choked with rubble) · THE MUD QUARTER (mud-brick lanes shut by mud walls; a well between them; THE DOVECOTE, a
//   tower you climb) · THE BANDITS' ROOST (rooftops, a burning barricade to douse) · THE KASBAH (the Bandit King's courtyard).
import { SLOPE } from '../slopes.js';
export const WELLTOWN_H = 42, BASE = 30;
const TS = 16;
const P = s => s.trim().split(/\s+/).flatMap(t => { const m = t.match(/^([A-Z0-9]+)x(\d+)$/); return m ? Array(+m[2]).fill(m[1]) : [t]; });
/* F flat, U/D a full step up/down (masonry), R2/L2 gentle sand; '#section', '@landmark' */
export const PIECES = [
  ...P(`#gate Fx6 R2 Fx6 L2 Fx8 @well1 Fx6 @gatearch Fx4 Fx6 @alley Fx8 U Fx6 D Fx8`),
  ...P(`#market Fx6 @shop Fx10 U Fx5 U Fx5 D Fx4 D Fx4 @bazaar Fx24 U Fx4 U Fx4 D D Fx5`),
  ...P(`#square Fx6 U Fx4 U Fx5 D Fx3 D Fx4 @greatwell Fx10 U Fx5 U Fx5 D D Fx8 Fx4`),
  ...P(`#cisterns Fx4 @rubble Fx6 @pillarhall Fx50 Fx6 @cistup Fx4 Fx6`),
  ...P(`#mud Fx6 @mud1 Fx4 Fx6 U Fx4 D @well2 Fx8 U Fx4 U Fx4 D D Fx4 @mud2 Fx4 Fx6 @dovecote Fx8 Fx8`),
  ...P(`#roost Fx6 @roost Fx30 @fire Fx4 Fx6 U Fx4 U Fx4 D D Fx6`),
  ...P(`#kasbah Fx8 U Fx4 U Fx6 D D Fx8 @mud3 Fx4 Fx8 U Fx6 D Fx10 #arena Fx40`),
];
export function build(T) {
  const H = WELLTOWN_H, cols = [], marks = {}, sections = {}; let lvl = 0;
  for (const p of PIECES) {
    if (p[0] === '#') { sections[p.slice(1)] = cols.length; continue; } if (p[0] === '@') { marks[p.slice(1)] = cols.length; continue; }
    if (p === 'F') cols.push({ lvl, t: 'F' }); else if (p === 'U') { lvl++; cols.push({ lvl, t: 'F' }); } else if (p === 'D') { lvl--; cols.push({ lvl, t: 'F' }); }
    else if (p === 'R2') { lvl++; cols.push({ lvl, t: SLOPE.R2A }, { lvl, t: SLOPE.R2B }); } else if (p === 'L2') { cols.push({ lvl, t: SLOPE.L2B }, { lvl, t: SLOPE.L2A }); lvl--; }
    else throw new Error(p);
  }
  const W = cols.length + 2, grid = new Uint8Array(W * H), set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  const rock = (x, y0, y1 = H - 1) => { for (let y = y0; y <= y1; y++) set(x, y, T.SOLID); };
  const top = x => BASE - cols[Math.max(0, Math.min(cols.length - 1, x))].lvl, on = x => top(x) - 1;
  cols.forEach((c, x) => { const r = BASE - c.lvl; if (c.t === 'F') rock(x, r); else { set(x, r, c.t); rock(x, r + 1); } });
  for (let y = 0; y < H; y++) { set(W - 2, y, T.SOLID); set(W - 1, y, T.SOLID); }
  const ents = [], ent = (t, x, y, e = {}) => ents.push({ t, x, y, ...e }), shade = [], moversExtra = [], wells = [], mudWalls = [], fires = [];
  /* A MUD WALL is a bricked-up DOORWAY: the house wall runs on above it (a 3-row wall on its own was jumped - a jump climbs 3 - and the
     rule was not load-bearing), so the only way through is to pour */
  const mud = (x) => { const g = top(x); for (let y = g - 10; y < g; y++) { set(x, y, T.SOLID); set(x + 1, y, T.SOLID); } mudWalls.push({ x0: x, x1: x + 1, y0: g - 3, y1: g - 1 }); };
  const well = x => { wells.push({ x, y: on(x) }); ent('well', x, on(x)); };
  const plank = (x0, n, row) => { for (let i = 0; i < n; i++) set(x0 + i, row, T.PLANK); };
  for (const sec of ['market', 'square', 'mud', 'kasbah']) { const a = sections[sec], b = Object.values(sections).filter(v => v > a).sort((u, v) => u - v)[0] ?? W;
    for (let x = a + 3; x < b - 4; x += 9) { const g = top(x); if ([0, 1, 2].every(d => top(x + d) === g)) for (let d = 0; d < 3; d++) if (grid[(g - 3) * W + x + d] === T.AIR) set(x + d, g - 3, T.PLANK); } }   // balconies: a board three rows up
  // 1 THE CARAVAN GATE
  ent('check', 3, on(3)); ent('sign', 5, on(5), { text: 'THE WELL TOWN. WATER IS CARRIED HERE: FILL YOUR SKIN AT A WELL. POUR IT AND MUD GIVES WAY.' });
  well(marks.well1 + 2);
  { const x = marks.gatearch, g = top(x); for (let dx = 0; dx < 4; dx++) for (let y = g - 9; y < g - 3; y++) set(x + dx, y, T.SOLID); ent('deco', x, on(x), { kind: 'gateArch', behind: true }); }   // THE GATE: its arch overhead
  { /* THE FIRST MUD WALL is optional: a little house on the street, its doorway bricked with mud and a stray inside; the street
       goes over its roof (crates to climb), so the rule is taught without being forced */
    const x = marks.alley, g = top(x); for (let dx = 0; dx < 6; dx++) for (let y = g - 4; y < g; y++) set(x + 2 + dx, y, T.SOLID);
    for (let dx = 1; dx < 5; dx++) for (let y = g - 3; y < g; y++) set(x + 2 + dx, y, T.AIR);   // its room
    mudWalls.push({ x0: x + 2, x1: x + 2, y0: g - 3, y1: g - 1, optional: true }); ent('stray', x + 5, on(x + 5));
    set(x, g - 1, T.CRATE); set(x + 1, g - 1, T.CRATE); set(x + 1, g - 2, T.CRATE); }
  // 2 THE LOWER MARKET
  ent('shop', marks.shop + 4, on(marks.shop + 4)); ent('awning', marks.shop + 4, on(marks.shop + 4)); plank(marks.shop + 10, 4, top(marks.shop + 10) - 3); ent('check', sections.market + 2, on(sections.market + 2));
  { const x0 = marks.bazaar, g = top(x0); for (let x = x0; x < x0 + 24; x++) set(x, g - 6, T.SOLID); for (let x = x0 - 2; x < x0 + 26; x++) set(x, g - 7, T.ONEWAY);   // THE COVERED BAZAAR: a roof, a walkway on it
    for (const px of [x0 - 3, x0 + 26]) for (let y = g - 7; y < g; y++) set(px, y, T.NET); shade.push([x0 * TS, (x0 + 24) * TS, (g - 6) * TS, g * TS + 1]); ent('silver', x0 + 12, g - 9); }
  // 3 THE WELL SQUARE: THE GREAT WELL, its windlass a lift down into the cisterns
  const gx = marks.greatwell + 4, sg = top(gx), floorC = BASE + 7;   // the cistern floor's top row
  ent('check', sections.square + 2, on(sections.square + 2));
  well(gx - 3); ent('greatwell', gx - 1, on(gx - 1)); ent('check', marks.greatwell - 2, on(marks.greatwell - 2));
  for (let y = sg; y < floorC; y++) { set(gx, y, T.AIR); set(gx + 1, y, T.AIR); }
  moversExtra.push({ kind: 'lift', x: gx * TS, w: 32, y0: (sg - 1) * TS, y1: (floorC - 1) * TS, name: 'windlass' });
  // 4 THE CISTERNS: rubble chokes the street; the hall runs under it from the well to a shaft of rungs up
  const c0 = gx, c1 = marks.cistup + 1;
  for (let x = c0; x <= c1; x++) for (let y = BASE + 3; y < floorC; y++) set(x, y, T.AIR);                       // the hall, four rows high
  for (let x = c0 + 6; x < c1 - 2; x += 8) for (let y = BASE + 3; y < floorC; y++) set(x, y, T.SOLID);           // its pillars (one tile, a jump over each? no: a gap under) ...
  for (let x = c0 + 6; x < c1 - 2; x += 8) for (let y = BASE + 5; y < floorC; y++) set(x, y, T.AIR);            // ... pillars from the roof, the floor passes under them
  shade.push([c0 * TS, (c1 + 1) * TS, (BASE + 3) * TS, floorC * TS + 1]); ent('check', c0 + 4, floorC - 1); ent('stray', marks.pillarhall + 30, floorC - 1);
  { const x = marks.rubble; for (let dx = 0; dx < 3; dx++) for (let y = top(x + dx) - 7; y < top(x + dx); y++) set(x + dx, y, T.SOLID); ent('sign', x - 3, on(x - 3), { text: 'THE STREET IS DOWN. THE WELL GOES UNDER IT.' }); }   // the rubble, 7 rows: no way over
  for (let y = top(c1) ; y < floorC; y++) { set(c1 - 1, y, T.NET); set(c1, y, T.NET); }                        // the rungs up out of it
  ent('check', c1 + 3, on(c1 + 3));
  // 5 THE MUD QUARTER
  mud(marks.mud1); well(marks.well2 + 3); mud(marks.mud2); ent('check', marks.well2, on(marks.well2)); ent('check', marks.dovecote + 7, on(marks.dovecote + 7));
  { const x = marks.dovecote, g = top(x); for (let y = g - 12; y < g; y++) { set(x, y, T.SOLID); set(x + 4, y, T.SOLID); } for (let y = g - 12; y < g; y++) set(x + 2, y, T.NET);   // THE DOVECOTE: a tower, rungs up its middle
    for (let dx = 0; dx <= 4; dx++) set(x + dx, g - 13, T.SOLID); set(x + 2, g - 13, T.NET); ent('silver', x + 2, g - 15); for (let y = g - 12; y < g; y++) { set(x + 1, y, T.AIR); set(x + 3, y, T.AIR); }
    for (let y = g - 3; y < g; y++) { set(x, y, T.AIR); set(x + 4, y, T.AIR); } }   /* a door through its foot (its walls stood across the lane: nothing got past), a hatch in its roof */
  // 6 THE BANDITS' ROOST: rooftops, a burning barricade
  { const x0 = marks.roost; for (let k = 0; k < 4; k++) { const hx = x0 + k * 8, g = top(hx); for (let dx = 0; dx < 6; dx++) for (let y = g - 3 - (k % 2); y < g; y++) set(hx + dx, y, T.SOLID); }   // four houses, roofs to run
    ent('check', x0 - 2, on(x0 - 2)); ent('silver', x0 + 11, top(x0 + 8) - 5); ent('stray', x0 + 26, top(x0 + 24) - 5); }
  { const x = marks.fire; fires.push({ x: x * TS + 8, y: on(x) * TS + 16 }); ent('fire', x, on(x), { barricade: true }); ent('relic', x + 8, on(x + 8)); }
  // 7 THE KASBAH
  mud(marks.mud3); ent('check', sections.kasbah + 3, on(sections.kasbah + 3)); const ax0 = sections.arena; ent('check', ax0 - 3, on(ax0 - 3)); ent('well', ax0 + 20, on(ax0 + 20), { arena: true });
  const arena = { x0: ax0 * TS, x1: (ax0 + 40) * TS, floor: top(ax0) * TS, trigger: (ax0 + 5) * TS, wallL: ax0 - 1, wallR: ax0 + 40, boss: 'banditking', tint: '#e8dcc0', tintA: 0.08 };
  // the garrison: ~4 a screen, bandits holding the wells, water-thieves on the roofs, scorpions in the cisterns
  const ROSTER = { gate: ['bandit', 'scorpion'], market: ['bandit', 'thief', 'bandit', 'archer'], square: ['bandit', 'archer', 'thief', 'bandit'], cisterns: ['scorpion', 'thief', 'scorpion', 'bandit'],
    mud: ['bandit', 'thief', 'archer', 'bandit'], roost: ['archer', 'bandit', 'thief', 'archer'], kasbah: ['bandit', 'archer', 'bandit', 'thief'] };
  const secOf = x => { let s = 'gate'; for (const [k, v] of Object.entries(sections)) if (k !== 'arena' && x >= v) s = k; return s; };
  const busy = new Set(ents.filter(e => ['check', 'sign', 'well', 'shop', 'greatwell', 'relic', 'fire'].includes(e.t)).map(e => e.x));
  const spot = x => { const cis = secOf(x) === 'cisterns' && x > c0 && x < c1 - 1; const y = cis ? floorC - 1 : on(x); if (grid[(y + 1) * W + x] !== T.SOLID) return null; for (let yy = y - 2; yy <= y; yy++) if (grid[yy * W + x] !== T.AIR) return null; return [-1, 0, 1].some(d => busy.has(x + d)) ? null : y; };
  let k = 0;
  for (let w0 = 0; w0 + 24 <= ax0 - 1; w0 += 24) { const sec = secOf(w0), n = sec === 'gate' ? 3 : 4;
    for (let i = 0; i < n; i++) { let x = w0 + 3 + Math.floor(i * 20 / n), y = null; while (x < w0 + 23 && (y = spot(x)) === null) x++; if (y === null) continue; const t = ROSTER[sec][k++ % ROSTER[sec].length]; ent(t, x, y); busy.add(x); } }
  return { W, H, grid, ents, START: { x: 4, y: on(4) }, pools: [], falls: [], moversExtra, interiors: [], sections, marks, arena, shade, wells, mudWalls, fires, draft: true, palette: { set: 'town' } };
}
/* the level as the player plays it: every mud wall poured away (tools/draft-level.mjs measures reach on this; the rule's own check
   measures it shut) */
export function asPlayed(L, T) { const g = L.grid.slice(); for (const m of L.mudWalls) for (let y = m.y0; y <= m.y1; y++) for (let x = m.x0; x <= m.x1; x++) g[y * L.W + x] = T.AIR; return { ...L, grid: g }; }
export const meta = {
  name: 'THE WELL TOWN', orientation: 'h', landmarks: ['gatearch', 'bazaar', 'greatwell', 'pillarhall', 'dovecote', 'roost'], sun: false, density: [3.5, 4.5], foes: ['bandit', 'thief', 'archer', 'scorpion'],
  async extra(L, { ok, R, floodReach, slopeReachGrid, T, TS, want }) {
    // THE RULE IS LOAD-BEARING: shut, the mud walls cut the way; softened, it opens
    const opened = asPlayed(L, T);
    const Ro = floodReach(slopeReachGrid(opened, T), T, { rides: true }); const ax0 = L.arena.x0 / TS;
    const reached = RR => { for (let x = ax0; x < ax0 + 40; x++) for (let y = 0; y < L.H; y++) if (RR.seen.has(x + ',' + y)) return true; return false; };
    const Rs = floodReach(slopeReachGrid(L, T), T, { rides: true });
    ok(!reached(Rs) && reached(Ro), `the rule is load-bearing: with the ${L.mudWalls.length} mud walls shut the Kasbah cannot be reached; softened, it can`);
    // THE WATER BUDGET: walking left to right with a three-sip skin, filled at every well passed, never short at a wall or a fire
    const events = [...L.wells.map(w => [w.x, 'well']), ...L.mudWalls.filter(m => !m.optional).map(m => [m.x0, 'mud']), ...L.fires.map(f => [Math.floor(f.x / TS), 'fire'])].sort((a, b) => a[0] - b[0]);
    let sips = 0, short = null, spent = 0; for (const [x, k] of events) { if (k === 'well') sips = 3; else { if (sips <= 0 && !short) short = k + '@' + x; sips--; spent++; } }
    ok(!short && L.wells[0].x < Math.min(...L.mudWalls.map(m => m.x0)), `the water budget: ${spent} pours on the road (walls and the barricade), ${L.wells.length} wells, a three-sip skin never runs dry${short ? ' - SHORT at ' + short : ''}; the first well comes before the first wall`);
    const shop = want('shop')[0]; ok(shop && Ro.near(shop.x, shop.y), 'THE SHOP (the arc\'s hub) stands on the road and is reached');
    const lift = L.moversExtra.find(m => m.name === 'windlass'); ok(lift && R.seen.size > 0 && [...Ro.seen].some(k => { const [x, y] = k.split(',').map(Number); return y >= L.H - 6 && x > L.marks.greatwell && x < L.marks.cistup; }), 'THE GREAT WELL\'s windlass carries you down into the cisterns (the only way past the rubble)');
  },
};
