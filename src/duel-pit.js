// src/duel-pit.js - THE DUEL PIT's floor (claude/pvpduel, Daniel 11-05: a basic PvP mode for the demo, ONE ARENA). The tavern's roped-off DUEL PIT
// is the way in; this is the sanded ring behind the rope, built from THE ARENA SET (src/redraw/arena_*: the Arena Yard's sand, ashlar, oak planks and
// crowd stand) so no new art is needed. A small walled ring two party-views wide at most, three oak planks to fight over, nothing that hurts.
// No `trial` flag (co-op must stay ON: the seats ARE the duellists); `openYard` keeps the death cost off; `duelPit` is what src/pvp-duel.js keys on.
export const DP = { W: 26, H: 20, FLOOR: 17, START: 12, SPOTS: [5, 20, 9, 16] };   /* SPOTS: where seats 1..4 stand at a round's start (columns) */

export function buildDuelPit({ painter }) {
  const { W, H, FLOOR: F } = DP, L = painter(W, H);
  const { block, plat, ent } = L;
  const gy = F - 1;
  block(0, W - 1, F, H - 1); block(0, 1, 0, F - 1); block(W - 2, W - 1, 0, F - 1);   // the ring, walled both sides
  plat(3, 14, 5); plat(18, 14, 5); plat(10, 11, 6);                                   // three oak planks (pvpduel3: every one is a JUMP from the one below - a flat jump peaks 51 px = 3.2 tiles): low left, low right, the high middle (drop through with DOWN+JUMP); nothing hurts
  for (const x of [3, 22]) ent('deco', x, gy, { kind: 'brazier' });
  for (const x of [8, 17]) ent('deco', x, gy, { kind: 'pennonPole', v: x & 1 });
  ent('deco', 13, gy, { kind: 'weaponRack' });
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: DP.START, y: gy }, pools: [], falls: [], moversExtra: [], interiors: [],
    openYard: true, duelPit: { floor: F, spots: DP.SPOTS, gate: null }, duskStart: -1, duskLen: 1, music: 'arenayard', reachExact: true, noCoin: true,
    palette: { set: 'arena', sky: 'autumn', near: 'none', noFg: true, noNear: true, dress: 'arena', haze: 'rgba(200,120,80,0.12)', grass: '#6a8a3a', grassL: '#9ac050', grassD: '#3a5a24', dirt: '#34302a', dirtL: '#524c44', dirtD: '#24201c' },
  };
}
