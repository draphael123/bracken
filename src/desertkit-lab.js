// src/desertkit-lab.js - THE DESERT KIT'S TEST ROOM (claude/desertkit, 11-05). Not on the road, on no level list: a level declaration in DATA, the shape
// every desert lane copies (docs/desertkit.md). tools/sun-kit.mjs, storm-kit.mjs, sink-sand.mjs, mirage-kit.mjs and sun-puzzle.mjs run it; a later lane
// can hang it on the dev level list (browser owed) to feel it. Placeholder everything: the art is owed.
//
// THE SUN COURT (LAB), 72 x 26 tiles, floor top on row 22 (feet at y 22 x 16), west to east:
//   0-6 a rock overhang (shade, the checkpoint) | 7-14 open sand | 15-19 an OASIS POOL (water cools) | 20-27 SUN-GLASS (hot) | 28-29 a glass arch (shade)
//   28-52 THE STORM (gusts both ways, a lee behind the spire) | 34-37 an awning | 38-42 a QUICKSAND PIT | 43-52 DUNE SAND (stop and you sink) with
//   a spire's shadow on it (47-48) | 54-56 a gap with a MIRAGE BRIDGE over it (2 deep, you climb out) | 58 a MIRAGE DOOR | 59-61 a MIRAGE OASIS |
//   62-71 THE SUN ROOM (a temple hall, no sunstroke): a shaft of sun down column 66, two mirrors on the high ledge (row 9), a SUN-DOOR (the east wall,
//   x 71 rows 19-21) whose eye is at 70,15, a PRIEST CACHE (eye 69,5, niche 70,4..6) only his beam opens, and a SUN-LAMP.
// Tile codes are src/level.js T's: 0 AIR, 1 SOLID, 2 ONEWAY, 3 SPIKE.
export const DESERTKIT_LAB = {
  id: 'desertkitlab', name: 'THE SUN COURT (LAB)', w: 72, h: 26,
  /* the grid as rects [x0, y0, x1, y1, tile], painted in order over AIR */
  tiles: [
    [0, 22, 71, 25, 1],                 /* the floor */
    [0, 16, 6, 16, 1],                  /* the overhang's roof */
    [38, 22, 52, 22, 0],                /* the quicksand pit + the dune sand: AIR on the surface row, rock under */
    [54, 22, 56, 23, 0],                /* the gap under the mirage bridge: 2 deep */
    [62, 0, 71, 0, 1], [61, 0, 61, 18, 1],   /* the hall's roof and west wall (open at the floor: the way in) */
    [71, 1, 71, 18, 1],                 /* the east wall over the sun-door; its leaf (71,19..21) is drawn shut by sun-puzzle gridOf */
    [66, 0, 66, 0, 0],                  /* the sun shaft through the roof */
    [62, 19, 64, 19, 2], [65, 16, 67, 16, 2], [62, 13, 64, 13, 2], [65, 10, 70, 10, 2],   /* the stair of ledges up to the mirror ledge */
    [67, 8, 69, 8, 2],                  /* the cache ledge (the priest stands here and beams UP) */
  ],
  checkpoints: [{ x: 3, y: 21 }],
  sunKit: {
    profile: 'glare',
    cool: [[0, 17, 6, 21], [28, 17, 29, 21], [34, 17, 37, 21], [47, 17, 48, 21]],   /* overhang, glass arch, awning, the spire's shadow on the dune */
    water: [[15, 20, 19, 21]],                                                      /* the oasis pool */
    hot: [[20, 21, 27, 21]],                                                        /* the sun-glass */
    zones: [{ box: [62, 0, 71, 21], profile: 'interior' }],                         /* the hall: no sunstroke indoors - the sun is a beam here */
  },
  storms: [
    { id: 'court', box: [28, 8, 52, 21], dirs: [1, -1], cycle: { calm: 3.2, warn: 1.4, gust: 1.6 }, sight: { calm: 260, gust: 120 }, lee: [[49, 17, 50, 21]] },
  ],
  sinkSand: [
    { id: 'pit', x0: 38, x1: 42, y: 22, mode: 'pit' },
    { id: 'dune', x0: 43, x1: 52, y: 22, mode: 'dune' },
  ],
  mirages: [
    { id: 'bridge', kind: 'ledge', box: [54, 22, 56, 22] },
    { id: 'door', kind: 'door', box: [58, 19, 58, 21] },
    { id: 'oasis', kind: 'oasis', box: [59, 20, 61, 21] },
    { id: 'well', kind: 'oasis', box: [15, 20, 19, 21], real: true },   /* the real oasis: it never shimmers */
  ],
  sunRooms: [
    { id: 'hall', box: [62, 1, 70, 21],
      sources: [{ x: 66, y: 0, dir: 'S' }],
      mirrors: [{ x: 66, y: 9, state: '/' }, { x: 70, y: 9, state: '/' }],
      doors: [
        { id: 'sundoor', kind: 'sun', eye: [70, 15], opens: [71, 19, 71, 21], mode: 'latch' },
        { id: 'cache', kind: 'cache', eye: [69, 5], opens: [70, 4, 70, 6], optional: true },
        { id: 'lamp', kind: 'lamp', eye: [62, 9] },
      ] },
  ],
};
/* a fresh copy with its grid built: { ...DESERTKIT_LAB, W, H, grid, tileAt } */
export function labLevel() {
  const L = JSON.parse(JSON.stringify(DESERTKIT_LAB)), W = L.w, H = L.h, grid = new Uint8Array(W * H);
  for (const [x0, y0, x1, y1, t] of L.tiles) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid[y * W + x] = t;
  L.W = W; L.H = H; L.grid = grid;
  L.tileAt = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? 1 : grid[y * W + x];
  return L;
}
