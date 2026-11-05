// src/drake-caldera.js - THE CALDERA (LAB ROOM): a greybox room for THE FIRE DRAKE (claude/drakewire, lane D1; design: claude/heartplan
// work/claude/lane-done/claude-heartplan.md section 2). NOT ON ANY ROAD: a hidden LEVELS row (like the retired yards), so bossLab and the page
// tools can fight the drake before THE HEART OF THE MOUNTAIN's level greybox exists (art before live - Daniel 10-10). When the Heart's greybox
// lands, its arena reuses this geometry (32-tile caldera, the seal in the middle, two basalt ledges outside the P2 ring) and this row stays
// hidden for the lab (saves count levels by index: a row is never removed).
// Pure (no canvas): src/level.js imports it, and node tools read it.
export const DC = {
  W: 60, H: 24, FLOOR: 18,          // the floor's top row (an ent at row FLOOR-1 stands on it)
  shrine: 6, start: 3,
  wallL: 14, wallR: 47,             // the door column (shut when it wakes) and the far wall
  x0: 15, x1: 46,                   // the caldera floor inside the walls: 32 tiles = 512 px
  trigger: 18, drake: 31,
  ledges: [[19, 20], [41, 42]],     // two basalt ledges two rows up (32 px: over the breath's 22 and the sweep's 12), outside the P2 ring (145 px)
  ledgeRow: 16,
};
export const DC_SIGN = 'THE CALDERA. THE FIRE DRAKE IS CHAINED TO THE SEAL: BAIT ITS LUNGE PAST THE SCORCHED RING.';
export function buildDrakeCaldera({ painter, T, TS }) {
  const { W, H, FLOOR } = DC, L = painter(W, H), { block, set, ent } = L;
  block(0, W - 1, FLOOR, H - 1);                                   // the floor, wall to wall
  block(0, 0, 0, FLOOR - 1);                                       // the west edge
  block(DC.wallL, DC.wallL, 0, FLOOR - 7);                         // the door's lintel: the 6-row arena wall (main.js setWall) shuts the rest
  block(DC.wallR, W - 1, 0, FLOOR - 1);                            // the far wall, floor to sky
  for (const [a, b] of DC.ledges) for (let x = a; x <= b; x++) set(x, DC.ledgeRow, T.ONEWAY);
  ent('check', DC.shrine, FLOOR - 1);
  ent('sign', DC.shrine + 3, FLOOR - 1, { text: DC_SIGN });
  ent('firedrake', DC.drake, FLOOR - 1, { face: -1 });
  const seal = ((DC.x0 + DC.x1 + 1) / 2) * TS;                     // 496: the seal's centre, the middle of the caldera floor
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: DC.start, y: FLOOR - 1 }, pools: [], falls: [], moversExtra: [], drakeLab: true, music: 'theme',
    palette: { dress: 'none', haze: 'rgba(200,90,40,0.18)', sky: [[60, 24, 18], [150, 60, 30]] }, ambient: [{ x0: 0, x1: W * TS, kind: 'blaze2' }],   /* a volcanic caldera: no forest kit, no birdsong */
    arena: { x0: DC.x0 * TS, x1: (DC.x1 + 1) * TS, floor: FLOOR * TS, trigger: DC.trigger * TS, wallL: DC.wallL, wallR: DC.wallR, boss: 'firedrake', music: 'boss3',
      tint: '#a03a1a', tintA: 0.12, seal,
      ledges: DC.ledges.map(([a, b]) => [a * TS, (b + 1) * TS, (FLOOR - DC.ledgeRow) * TS]),
      ledgeTiles: DC.ledges.map(([a, b]) => [a, b, DC.ledgeRow]) },
  };
}
