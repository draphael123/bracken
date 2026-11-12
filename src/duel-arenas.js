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

export const ARENAS = {
  pit: { id: 'pit', level: 'duel_pit', name: 'THE DUEL PIT', line: 'THE DUEL PIT - THREE OAK PLANKS OVER SAND.', kit: 'arena', W: DP.W, H: DP.H, floor: DP.FLOOR, spots: DP.SPOTS, music: 'arenayard', foeDoors: FOE_ARENAS.pit.doors, hops: [] },
  stockade: { id: 'stockade', level: 'duel_stockade', name: 'THE STOCKADE', line: 'THE STOCKADE - FOUR LASHED TIERS UP TO A LOOKOUT.', kit: 'generic', W: STK.W, H: STK.H, floor: STK.FLOOR, spots: STK.SPOTS, music: 'stockade', foeDoors: FOE_ARENAS.stockade.doors,
    hops: [[STK.FLOOR, 2, STK.W - 3], ...STK.PLANKS] },
};
export const ARENA_ORDER = ['pit', 'stockade'];
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
