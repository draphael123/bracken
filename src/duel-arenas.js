// src/duel-arenas.js - THE DUEL ARENAS (claude/duelarenas; plan scratch/lane-reports/duel2-plan.md section 3, Daniel 11-12: "a few other arenas"; new-arena duels rank like any duel).
// The whole feature sits behind DUEL_ARENAS (default OFF). Flag OFF: the Pit is the only arena, the settings carry no `arena` key, no extra level is registered, and src/duel-pit.js is untouched
// (its level hash is pinned by tools/duel-arenas.mjs).
//
// AN ARENA IS DATA: { id, level (the hidden level's id), name, line (one plain sentence for the picker), kit ('arena' = THE ARENA SET's art, 'generic' = a palette on the level
// path), W, H, floor (the row the seats stand ON), spots (4 floor columns, >= 4 apart), music, foeDoors (the floor columns goblins walk in from, src/duel-foes.js FOE_ARENAS - the one
// copy), hops (the bots' climbing map: [row, x0, x1] for every standing surface, the floor first; [] = nothing to climb) }.
// ADDING AN ARENA (the next slice): (1) a builder here (a painter level: walls, floor, planks, routeSupports - nothing floats - and `duelPit: { floor, spots, gate: null, arena: <id>,
// kit, foeDoors, hops }`); (2) its row in ARENAS + ARENA_ORDER; (3) its FOE_ARENAS line in src/duel-foes.js; (4) one `if (DUEL_ARENAS) LEVELS.push(...)` line in src/level.js;
// (5) its case in tools/duel-arenas.mjs (ARENA_CASES). The picker, RANDOM, the banner, the remembered setting and the proofs read this table - nothing else changes.
import { DP } from './duel-pit.js';
import { FOE_ARENAS } from './duel-foes.js';

export const DUEL_ARENAS_FLAG = false;   /* THE SHIP SWITCH (one line): true = every player sees the ARENA row. ?duelarenas (or window.__DUELARENAS) turns it on for a tester */
export const DUEL_ARENAS = DUEL_ARENAS_FLAG || (typeof globalThis !== 'undefined' && (!!globalThis.__DUELARENAS || (!!globalThis.location && /[?&]duelarenas(=|&|$)/.test(String(globalThis.location.search)))));

/* ---- THE STOCKADE: a tall goblin camp, four lashed tiers up to a lookout. Every tier is one flat jump (a rise of 3 rows) from the one below it and overlaps
   the one below by at least a column, so it is jumped onto from straight under (never from an edge) and climbed tier by tier: the floor reaches only the low ledges. [row, x0, x1] of each board run. ---- */
export const STK = { W: 24, H: 22, FLOOR: 19, START: 11, SPOTS: [4, 19, 8, 15],
  PLANKS: [[16, 2, 5], [16, 18, 21], [13, 4, 19], [10, 4, 10], [10, 13, 19], [7, 10, 13]],
  /* THE POLES (the camp's own routeSupports kind 'stkpost', src/route-art.js): [col, deck row, bottom row]. A pole runs down to the first thing under it: the floor, or the board a tier down. */
  POLES: [[5, 16, 19], [18, 16, 19], [6, 13, 19], [11, 13, 19], [17, 13, 19], [6, 10, 13], [9, 10, 13], [14, 10, 13], [17, 10, 13], [10, 7, 13], [13, 7, 13]] };

/* ---- THE ROOTWAY HOLLOW (duelarenas-b): a wide root cave, 30 x 18 (34 would put the four seats 400 px apart - wider than the co-op frame - so it is 30: tools/duel-arenas.mjs measures it).
   Floor row 15, flat jumps of 3 rows like the Stockade: two low root shelves (r12, against the walls), ONE long root (r9) that overlaps both, three top shelves (r6: the two corners and a crown over the
   middle). TWO SPORE VENTS stand on the floor under the crown: a told puff (5 s, 2 s on) that lifts whoever stands over it up through the long root onto the crown. They only lift - the existing 'vent'
   prop, no heat / ember / glass flag; the lift is the whole of what it does (the proof reads main.js's vent block). Every shelf stands on the Rootway's own gnarled roots (kind 'root', src/forest-supports.js FOREST_KIT.rootway). ---- */
export const ROOT = { W: 30, H: 18, FLOOR: 15, START: 14, SPOTS: [5, 24, 11, 18],
  PLANKS: [[12, 2, 7], [12, 22, 27], [9, 7, 22], [6, 4, 9], [6, 12, 17], [6, 20, 25]],
  /* [col, deck row, bottom row]: a root runs down to the first thing under it */
  POLES: [[4, 12, 15], [7, 12, 15], [22, 12, 15], [25, 12, 15], [7, 9, 12], [22, 9, 12], [10, 9, 15], [19, 9, 15], [4, 6, 12], [9, 6, 9], [12, 6, 9], [17, 6, 9], [20, 6, 9], [25, 6, 12]],
  /* the vents: col, the floor row they stand on, h (px of lift column), period / on (s), phase (the two are half a period apart: one is never more than 3 s from a puff) */
  VENTS: [{ col: 13, floor: 15, h: 140, period: 5, on: 2, phase: 0 }, { col: 16, floor: 15, h: 140, period: 5, on: 2, phase: 2.5 }] };

/* ---- THE KITCHEN (duelarenas-b): a tight hall, 20 x 14, a solid low ceiling (rows 0-2), floor row 12. Iron-bracketed beams at r6 against both walls and a trestle table at r9 whose legs stand
   on the floor; the beams overlap the table by a column, the table is a flat jump from the floor. No feature. Kitchen Gate art (kgKit, art only) over one room rectangle (interiors). ---- */
export const KIT = { W: 20, H: 14, FLOOR: 12, START: 9, SPOTS: [3, 16, 7, 12], CEIL: 2,
  PLANKS: [[9, 8, 11], [6, 2, 8], [6, 11, 17]],
  /* demo-supports kinds (src/demo-supports-art.js): a knee BRACE bolted to the wall under each beam, a TRESTLE under the table (a leg at each end down to the floor, an X-brace, a cap beam) */
  BRACES: [{ x: 2, y: 6, dir: 1, span: 4 }, { x: 17, y: 6, dir: -1, span: 4 }], TRESTLE: { x: 8, y: 9, span: 3, bottom: 12 } };

export const ARENAS = {
  pit: { id: 'pit', level: 'duel_pit', name: 'THE DUEL PIT', line: 'THE DUEL PIT - THREE OAK PLANKS OVER SAND.', kit: 'arena', W: DP.W, H: DP.H, floor: DP.FLOOR, spots: DP.SPOTS, music: 'arenayard', foeDoors: FOE_ARENAS.pit.doors, hops: [] },
  stockade: { id: 'stockade', level: 'duel_stockade', name: 'THE STOCKADE', line: 'THE STOCKADE - FOUR LASHED TIERS UP TO A LOOKOUT.', kit: 'generic', W: STK.W, H: STK.H, floor: STK.FLOOR, spots: STK.SPOTS, music: 'stockade', foeDoors: FOE_ARENAS.stockade.doors,
    hops: [[STK.FLOOR, 2, STK.W - 3], ...STK.PLANKS] },
  rootway: { id: 'rootway', level: 'duel_rootway', name: 'THE ROOTWAY HOLLOW', line: 'THE ROOTWAY HOLLOW - TWO SPORE VENTS LIFT YOU UP.', kit: 'generic', W: ROOT.W, H: ROOT.H, floor: ROOT.FLOOR, spots: ROOT.SPOTS, music: 'rootway', foeDoors: FOE_ARENAS.rootway.doors,
    hops: [[ROOT.FLOOR, 2, ROOT.W - 3], ...ROOT.PLANKS], vents: ROOT.VENTS },
  kitchen: { id: 'kitchen', level: 'duel_kitchen', name: 'THE KITCHEN', line: 'THE KITCHEN - A TIGHT, LOW HALL UNDER THE BEAMS.', kit: 'generic', W: KIT.W, H: KIT.H, floor: KIT.FLOOR, spots: KIT.SPOTS, music: 'kitchengate', foeDoors: FOE_ARENAS.kitchen.doors,
    hops: [[KIT.FLOOR, 2, KIT.W - 3], ...KIT.PLANKS] },
};
export const ARENA_ORDER = ['pit', 'stockade', 'rootway', 'kitchen'];
export const ARENA_CHOICES = [...ARENA_ORDER, 'random'];   /* what the ARENA row cycles through (SETTING_CHOICES.arena) */
export const RANDOM_LINE = 'RANDOM - ONE OF THEM, PICKED WHEN THE FIGHT STARTS.';
export const arenaName = c => c === 'random' ? 'RANDOM' : (ARENAS[c] || ARENAS.pit).name;
export const arenaLine = c => c === 'random' ? RANDOM_LINE : (ARENAS[c] || ARENAS.pit).line;
export const arenaLevelId = id => (ARENAS[id] || ARENAS.pit).level;
export const cleanArena = v => DUEL_ARENAS && ARENA_CHOICES.includes(v) ? v : 'pit';
/* the arena a built level is (the Pit's level carries no `arena` field: it is the one the runtime always knew) */
export const arenaOfLevel = L => (L && L.duelPit && ARENAS[L.duelPit.arena] ? L.duelPit.arena : 'pit');
/* THE PICK AT MATCH START: a named arena stays; RANDOM draws from the arenas that are actually BUILT (have(id): is its level in the game) - never a missing one, the Pit when nothing else is
   there. rnd: () => 0..1. Flag OFF: always the Pit. */
export function resolveArena(choice, rnd = Math.random, have = () => true) {
  if (!DUEL_ARENAS) return 'pit';
  const built = ARENA_ORDER.filter(id => have(id));
  if (choice === 'random') return built.length ? built[Math.min(built.length - 1, Math.floor(rnd() * built.length))] : 'pit';
  return ARENAS[choice] && built.includes(choice) ? choice : 'pit';
}

/* THE STOCKADE'S BUILDER (a hidden painter level, as src/duel-pit.js). Stockade palette ONLY (dress 'camp', ledges 'lashed', sky night): NO level-runtime kit flag (no L.stkKit, no horn, no tower code). */
export function buildStockade({ painter }) {
  const { W, H, FLOOR: F, START } = STK, L = painter(W, H), { block, plat, ent } = L, gy = F - 1;
  block(0, W - 1, F, H - 1); block(0, 1, 0, F - 1); block(W - 2, W - 1, 0, F - 1);   // the camp, walled both sides, floored wall to wall
  for (const [row, x0, x1] of STK.PLANKS) plat(x0, row, x1 - x0 + 1);               // the tiers: lashed boards (one-way: jump up through, DOWN+JUMP back through)
  for (const x of [3, 20]) ent('torch', x, gy);                                       // two camp torches on the floor, nothing that hurts
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: START, y: gy }, pools: [], falls: [], moversExtra: [], interiors: [],
    routeSupports: STK.POLES.map(([x, y, bottom]) => ({ x, y, bottom, kind: 'stkpost' })),   /* a lashed pole under every board (art only, no tile changes) */
    openYard: true, duelPit: { floor: F, spots: STK.SPOTS, gate: null, arena: 'stockade', kit: 'generic', foeDoors: FOE_ARENAS.stockade.doors, hops: ARENAS.stockade.hops },
    duskStart: -1, duskLen: 1, music: 'stockade', reachExact: true, noCoin: true,
    palette: { dress: 'camp', ledges: 'lashed', sky: 'night', near: 'none', noFg: true, noNear: true, haze: 'rgba(24,18,44,0.3)', grass: '#4a5a2c', grassL: '#6a7e3a', grassD: '#2e3a1c', dirt: '#3a2c20', dirtL: '#5a4632', dirtD: '#241a12' },
  };
}

/* THE ROOTWAY HOLLOW'S BUILDER. The Rootway's PALETTE only (the same colours / myc / mushroom values as src/rootway.js) and NO level-runtime kit flag (never L.rootway: its hoists, hunter and Huntmaster stay in THE ROOTWAY). */
export function buildRootwayHollow({ painter }) {
  const { W, H, FLOOR: F, START } = ROOT, L = painter(W, H), { block, plat, ent } = L, gy = F - 1;
  block(0, W - 1, F, H - 1); block(0, 1, 0, F - 1); block(W - 2, W - 1, 0, F - 1);
  for (const [row, x0, x1] of ROOT.PLANKS) plat(x0, row, x1 - x0 + 1);
  for (const v of ROOT.VENTS) ent('vent', v.col, v.floor - 1, { period: v.period, on: v.on, h: v.h, phase: v.phase });   /* the spore vent: lifts, never hurts (no heat / ember / glass / incense / gale flag) */
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: START, y: gy }, pools: [], falls: [], moversExtra: [], interiors: [],
    routeSupports: ROOT.POLES.map(([x, y, bottom]) => ({ x, y, bottom, kind: 'root' })),   /* the Rootway's gnarled roots under every shelf (art only, no tile changes) */
    openYard: true, duelPit: { floor: F, spots: ROOT.SPOTS, gate: null, arena: 'rootway', kit: 'generic', foeDoors: FOE_ARENAS.rootway.doors, hops: ARENAS.rootway.hops, vents: ROOT.VENTS },
    duskStart: -1, duskLen: 1, music: 'rootway', reachExact: true, noCoin: true,
    palette: { sky: [[64, 96, 112], [196, 168, 120]], noNear: true, noFg: true, near: 'mushroom', myc: true, dress: 'myc', haze: 'rgba(150,130,120,0.18)', grass: '#5a8a3a', grassL: '#8ac050', grassD: '#34562a', dirt: '#4a3a30', dirtL: '#5e4a3a', dirtD: '#33261e', canopy: ['#2a1f38', '#4e3a50', '#8a5a3a', '#c88a3a'] },
  };
}

/* THE KITCHEN'S BUILDER. Kitchen Gate art through its art-only kit flag (kgKit: src/main.js tiles, dressing, ambient glow and the room painter - nothing in the level runtime reads it) over ONE room rectangle
   in `interiors` (the Gate paints its halls per room); the palette is the Gate's own as the fallback. NOT L.kitchen, no hoists / fires / pots / doors: none of the Gate's machinery. */
export function buildKitchenHall({ painter }) {
  const { W, H, FLOOR: F, START, CEIL } = KIT, L = painter(W, H), { block, plat } = L, gy = F - 1;
  block(0, W - 1, F, H - 1); block(0, 1, 0, F - 1); block(W - 2, W - 1, 0, F - 1); block(0, W - 1, 0, CEIL);   // the hall: walled both sides, floored, a solid low ceiling
  for (const [row, x0, x1] of KIT.PLANKS) plat(x0, row, x1 - x0 + 1);
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: START, y: gy }, pools: [], falls: [], moversExtra: [], interiors: [[2, W - 3, CEIL + 1, F - 1, 'cellar']],
    routeSupports: [...KIT.BRACES.map(b => ({ kind: 'demo', style: 'brace', ...b, bottom: b.y + b.span })), { kind: 'demo', style: 'trestle', ...KIT.TRESTLE }],
    kgKit: true,
    openYard: true, duelPit: { floor: F, spots: KIT.SPOTS, gate: null, arena: 'kitchen', kit: 'generic', foeDoors: FOE_ARENAS.kitchen.doors, hops: ARENAS.kitchen.hops },
    duskStart: -1, duskLen: 1, music: 'kitchengate', reachExact: true, noCoin: true,
    palette: { hall: true, sky: 'night', dress: 'none', ledges: 'beam', haze: 'rgba(255,170,90,0.10)', dirt: '#5e4a3a', dirtL: '#7a6450', dirtD: '#3a2c22', grass: '#8a7058', grassL: '#a88a6a', grassD: '#5a4636' },
  };
}

/* THE DUEL PIT'S OWN PLANKS' STANDS (draw only, flag ON only: src/main.js draws them from the arena set's own oak post, src/redraw/arena_props.js drawPlankStands; the level, its hash and flag OFF are untouched).
   [col, deck row, bottom row]: a post under each end of every plank, down to the sand (the Pit's planks: plat(3,14,5), plat(18,14,5), plat(10,11,6), floor row 17). tools/duel-arenas.mjs asserts these match the built grid. */
export const PIT_STANDS = [[3, 14, 17], [7, 14, 17], [18, 14, 17], [22, 14, 17], [10, 11, 17], [15, 11, 17]];

/* THE VENT WAIT (pure): the bots' use of a spore vent. me: { x, y (feet), ground }, foe: { x, y }, vents: [{ col, floor, h }], hops: the arena's boards (the floor first). Only from the floor, and only when the foe is two tiers (6 rows)
   or more above and a vent within 12 columns lifts to a board over its column - the lift peaks about 20 px above its column's top (vy -190 against gravity 1000), so a board qualifies when its top is >= 8 px below that
   peak. Returns { tx (the vent's middle), ok (standing on it: WAIT for the puff, do not jump), board (the highest such board over it) } or null. */
export function ventGoal(me, foe, vents, hops, TS = 16) {
  if (!vents || !vents.length || !hops || !hops.length || !me || !foe || !me.ground) return null;
  const myRow = Math.round(me.y / TS), foeRow = Math.round(foe.y / TS);
  if (myRow !== hops[0][0] || foeRow > myRow - 6) return null;
  let best = null, bd = 1e9;
  for (const v of vents) {
    const tx = v.col * TS + TS / 2, d = Math.abs(me.x - tx); if (d > 12 * TS || d >= bd) continue;
    const peak = v.floor * TS - v.h - 20; let board = null;
    for (const h of hops) { if (h[0] === hops[0][0] || v.col < h[1] || v.col > h[2] || h[0] * TS - peak < 8) continue; if (!board || h[0] < board[0]) board = h; }
    if (board) { bd = d; best = { tx, ok: d <= 4, board }; } }
  return best;
}

/* THE BOTS' CLIMB (pure; src/pvp-duel.js botThink calls it when the arena has hops). me: { x, y (feet), ground }, foe: { x, y }, hops: [[row, x0, x1]...] (the floor first), TS: tile px.
   When the foe stands a tier (3 rows) or more above us, find the board we can jump onto from where we stand - up 1..3 rows, over (or at most one column beside) our own footing - that gets us nearest his row,
   and return { tx: the x to walk to, jump: true once we are on it, row, board: [row, x0, x1] the one we mean to land on }; null = nothing to climb for (same tier, below, or no board in reach). */
export function hopGoal(me, foe, hops, TS = 16) {
  if (!hops || !hops.length || !me || !foe || !me.ground) return null;
  const myRow = Math.round(me.y / TS), foeRow = Math.round(foe.y / TS);
  if (foeRow > myRow - 3) return null;
  const col = Math.floor(me.x / TS);
  let mine = null;   // the footing we stand on: the run whose row is ours and whose columns hold us (the floor is the first run)
  for (const h of hops) if (h[0] === myRow && col >= h[1] && col <= h[2]) { mine = h; break; }
  if (!mine) return null;
  let best = null, bd = 1e9;
  for (const h of hops) { const rise = myRow - h[0]; if (rise < 1 || rise > 3) continue;
    const gap = Math.max(0, h[1] - mine[2] - 1, mine[1] - h[2] - 1); if (gap > 1) continue;
    const d = Math.abs(h[0] - foeRow) * 100 + Math.max(0, h[1] - col, col - h[2]);   /* nearest his row first, then the board nearest to where we stand */
    if (d < bd) { bd = d; best = h; } }
  if (!best) return null;
  const lo = Math.max(best[1], mine[1]), hi = Math.min(best[2], mine[2]), under = lo <= hi;   // under: part of our footing is right under the board
  const c = under ? Math.min(hi, Math.max(lo, col)) : best[1] > mine[2] ? mine[2] : mine[1];   // a column of ours under it; else our edge nearest it (the board is one column beside)
  const tx = c * TS + TS / 2;
  return { tx, jump: under ? col >= lo && col <= hi : Math.abs(me.x - tx) <= 7, row: best[0], board: best };
}
