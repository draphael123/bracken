// src/draft/witchlight-v2.js — THE WITCHLIGHT STAIR, REDESIGNED: a DRAFT greybox (brief .claude/briefs/witchlight-redesign.md,
// agreed with Daniel 2026-09-22 after he played 1cfd6c7: "climb and go right with a massive enemy gauntlet... looks like a
// repeat"). NOT WIRED: the build session replaces src/witchlight.js's buildWitchlight with this layout (and dresses it).
// tools/witchlight-v2.mjs measures it. Five PLACES, each built round ONE piece of the loose magic, then all three at the top:
//   c 0-49     1 THE BRAMBLE FOOT       out of the cavern mouth; a slab over the brambles; the first rune column (silver 1)
//   c 50-139   2 THE DRIFTING AQUEDUCT  its arches hang in the air as slabs: three gaps between the surviving piers, seven
//                                       slabs (sliding, SINKING, rising), a stretch of arch to stand on; a fall lands in the
//                                       gorge and a rope up each pier's face brings you back; BROOMS that sweep you off
//   c 140-219  3 THE UPSIDE-DOWN CLOISTER  brambles fill the floor, so you walk the CEILING: glyph up, ceiling, glyph down onto a
//                                       safe pocket, up again. The Folly's toggle glyphs (not brief ones), a roof of TILES (the
//                                       flip needs a tile ceiling within 14 rows); ARMOUR that walks the ceiling with you
//   c 220-259  4 THE RUNE STAIR          the one vertical: 36 rows on three rune columns with STAGGERED timing, a floating
//                                       chunk of the tower's library (silver 2), imps riding the columns with you
//   c 250-332  5 THE TOPIARY MAZE        hedges to go under and over, clipped statues (silver 3 on a hedge top), then THE HEDGE
//                                       WARDEN at the gate between his braziers (src/hedge-warden.js, unchanged)
//   c 333-429    THE STAIR'S TOP        a last rune column onto THE GATE GARGOYLE's arena: slabs (some CRACKED) over the garden
//                                       terrace - fall off and you land on the terrace, and rune columns take you back up
// Enemies are ENCOUNTERS (3-5, round the place's verb) with quiet between - no even GARRISON sprinkle (Daniel, 2026-09-22).
// Flags a build must implement are marked NEW: slab `sink`, slab `cracked`, broom `sweep`, armour `ceiling`, the light zones.
export const WL2 = {
  W: 430, H: 92, FOOT: 80, PIER: 76, GORGE: 88, CLOISTER: 76, ROOF: [63, 66], STAIR: [76, 40], GARDEN: 40, TOP_CATCH: 40,
  PLACES: { foot: [0, 49], aqueduct: [50, 139], cloister: [140, 219], runestair: [220, 259], garden: [250, 332], top: [333, 429] },
  PIERS: [[50, 53], [78, 82], [106, 110], [134, 139]],
  BRAMBLES: [[150, 165], [176, 192], [200, 211]],
  MINI: { x0: 300, x1: 331, gate: 332, wallL: 299, braziers: [305, 326] },
  ARENA: { x0: 346, x1: 425 },
  LIGHT: [[0, 139, 'dusk'], [140, 259, 'twilight'], [260, 429, 'witchlight']],   // NEW: the light by place, not by column
  MARKS: { cavern: 4, aqueduct: 92, colonnade: 180, library: 243, orrery: 316, tower: 426 },
};

function painter(W, H, T) {
  const grid = new Uint8Array(W * H), ents = [];
  const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  const block = (x0, x1, y0, y1, t = T.SOLID) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, t); };
  return { grid, ents, set, block, plat: (x, y, n) => block(x, x + n - 1, y, y, T.ONEWAY), ent: (t, x, y, o = {}) => ents.push({ t, x, y, ...o }) };
}

export function build(T) {
  const { W, H, FOOT, PIER, GORGE } = WL2, TS = 16, P = painter(W, H, T), { set, block, plat, ent } = P;
  const ropes = [], encounters = [], glyphBridges = [];
  const rope = (x, y0, y1) => ropes.push([x, y0, y1]);
  const rune = (x, row, top, phase = 0) => ent('vent', x, row, { rune: true, h: (row + 1 - top) * TS, period: 4.4, on: 2.4, lift: 200, w: 16, phase });
  const slab = (x, row, o) => ent('mover', x, row, Object.assign({ len: 3, slab: true, speed: 30 }, o));
  const fly = (t, x, row, o) => ent(t, x, row - 5, Object.assign({ face: -1 }, o || {}));
  /* AN ENCOUNTER: a named group of 3-5 on one stretch, built round the place's verb - the build fights it as one read */
  const meet = (name, x0, x1, foes) => { encounters.push({ name, x0, x1, n: foes.length }); for (const [t, x, row, o] of foes) ent(t, x, row, Object.assign({ face: -1, enc: name }, o || {})); };

  // ---- 1. THE BRAMBLE FOOT ----
  block(0, 49, FOOT + 1, H - 1); block(0, 9, 0, FOOT - 6);                         // the ground; the cavern's roof
  for (let y = FOOT + 1; y <= FOOT + 5; y++) for (let x = 22; x <= 33; x++) set(x, y, T.AIR);
  block(25, 30, FOOT + 5, FOOT + 5, T.SPIKE); plat(22, FOOT + 3, 2); plat(32, FOOT + 3, 2);
  slab(22, FOOT + 1, { range: 9 });
  rune(40, FOOT, FOOT - 11); plat(37, FOOT - 9, 7); ent('silver', 42, FOOT - 10);
  block(44, 46, FOOT - 1, FOOT); block(47, 49, FOOT - 3, FOOT);             // two steps up to the aqueduct's first pier
  ent('check', 45, FOOT - 2); ent('sign', 12, FOOT, { text: 'THE TOWER STAIR. ITS LOOSE SPELLS: SLABS DRIFT, RUNES LIFT, GLYPHS TURN YOU OVER.' });
  meet('THE CAVERN MOUTH', 12, 20, [['zombie', 14, FOOT], ['zombie', 18, FOOT], ['bonearcher', 20, FOOT]]);

  // ---- 2. THE DRIFTING AQUEDUCT ----
  for (const [a, b] of WL2.PIERS) block(a, b, PIER + 1, H - 1);                     // the surviving piers, their tops the road
  block(54, 133, GORGE + 1, H - 1);                                                  // the gorge floor under the gaps
  slab(54, PIER + 1, { range: 8 }); slab(66, PIER + 1, { range: 9 });                 // gap 1: two sliders that meet
  slab(83, PIER + 1, { len: 4, range: 1, speed: 4, sink: true });   /* (range 0 divides by zero in the mover code: a sinking slab is a slab that barely drifts) */                               // gap 2: a slab that SINKS under you (NEW)
  slab(88, PIER + 3, { vert: true, rise: 5, period: 4.6 });                          //        one that rises to the arch
  plat(92, PIER - 3, 5);                                                             //        a stretch of arch still hanging
  slab(97, PIER + 1, { range: 6 });                                                  //        and a slider to the pier
  slab(111, PIER + 1, { range: 10, speed: 26 }); slab(123, PIER + 1, { range: 8, speed: 40 });   // gap 3: two, out of step
  for (const [a] of WL2.PIERS.slice(1)) rope(a - 1, PIER + 1, GORGE);                  // a rope up each pier's face out of the gorge
  ent('check', 80, PIER); ent('sign', 51, PIER, { text: 'THE AQUEDUCT FELL APART AND ITS ARCHES FLOAT. A FALL IS ONLY A CLIMB BACK UP.' });
  meet('THE BROOMS OVER THE FIRST GAP', 54, 82, [['broom', 60, PIER - 5, { sweep: true }], ['broom', 72, PIER - 6, { sweep: true }], ['zombie', 80, PIER], ['bonearcher', 82, PIER]]);
  meet('THE SECOND PIER', 106, 110, [['husk', 108, PIER], ['imp', 109, PIER - 5], ['bonegob', 110, PIER]]);
  meet('THE WIDE GAP', 111, 139, [['broom', 118, PIER - 5, { sweep: true }], ['broom', 128, PIER - 6, { sweep: true }], ['zombie', 137, PIER], ['bonearcher', 139, PIER]]);

  // ---- 3. THE UPSIDE-DOWN CLOISTER ----
  block(140, 219, PIER + 1, H - 1); block(142, 217, WL2.ROOF[0], WL2.ROOF[1]);      // its floor and its roof (tiles: the flip needs them)
  for (const [a, b] of WL2.BRAMBLES) block(a, b, PIER, PIER, T.SPIKE);               // brambles: you do not walk this floor
  const up = x => ent('glyph', x, PIER), down = x => ent('glyph', x, WL2.ROOF[1] + 1, { ceiling: true });
  up(147); down(169); up(173); down(194); up(198); down(214);
  glyphBridges.push([147, 169, PIER + 1], [173, 194, PIER + 1], [198, 214, PIER + 1]);   /* reachcore: over the brambles on the roof */
  ent('check', 143, PIER); ent('check', 171, PIER);
  ent('sign', 141, PIER, { text: 'THE CLOISTER FLOOR IS BRAMBLE. THE GLYPHS TURN YOU OVER: WALK THE ROOF, AND COME DOWN WHERE IT IS SAFE.' });
  meet('THE ARMOUR ON THE ROOF', 150, 170, [['armour', 156, WL2.ROOF[1] + 1, { ceiling: true }], ['armour', 164, WL2.ROOF[1] + 1, { ceiling: true }], ['imp', 160, PIER - 3], ['zombie', 170, PIER]]);
  meet('THE SECOND WALK', 176, 199, [['armour', 184, WL2.ROOF[1] + 1, { ceiling: true }], ['imp', 188, PIER - 3], ['husk', 196, PIER]]);
  meet('THE CLOISTER DOOR', 200, 219, [['armour', 206, WL2.ROOF[1] + 1, { ceiling: true }], ['apprentice', 216, PIER], ['zombie', 218, PIER]]);

  // ---- 4. THE RUNE STAIR ----
  block(220, 221, 36, PIER - 6); block(220, 249, PIER + 1, H - 1);                   // its west wall (the cloister comes in under it), its floor
  block(250, 259, WL2.GARDEN + 1, H - 1);                                            // the garden's edge is its east wall
  rune(226, PIER, 62, 0); plat(228, 63, 11);                                          // three columns, staggered: ride one, step
  rune(237, 62, 49, 1.5); plat(240, 51, 9);                                           // into the next as it lights
  rune(247, 50, 37, 3.0);
  block(241, 244, 42, 44); ent('silver', 243, 41);                                    // the floating chunk of the tower's library: the last column's
                                                                                      // top steps you off onto it (a column lets you off only at its top)
  ent('check', 224, PIER); ent('check', 242, 50);
  ent('sign', 223, PIER, { text: 'THE RUNE STAIR. THE COLUMNS LIGHT ONE AFTER ANOTHER: RIDE ONE AND STEP INTO THE NEXT.' });
  meet('THE STAIR FOOT', 222, 240, [['zombie', 230, PIER], ['husk', 234, PIER], ['bonearcher', 234, 62]]);
  meet('THE IMPS IN THE SHAFT', 222, 249, [['imp', 228, 70], ['imp', 238, 57], ['imp', 244, 44]]);

  // ---- 5. THE TOPIARY MAZE and THE GARDEN GATE ----
  const G = WL2.GARDEN, M = WL2.MINI, hedges = [];
  block(250, 429, G + 1, H - 1);
  const hedge = (x0, x1, y0, y1) => { block(x0, x1, y0, y1); hedges.push([x0, x1, y0, y1]); };
  hedge(262, 270, G - 7, G - 3);                                                      // a tall hedge you go UNDER (three rows)
  hedge(275, 276, G - 1, G);                                                          // a low one you hop
  hedge(280, 288, G - 5, G - 3); plat(278, G - 2, 2); ent('silver', 284, G - 6);      // a tall one you go up (silver 3 on top)
  hedge(292, 293, G - 1, G);
  ent('check', 296, G); ent('sign', 256, G, { text: 'THE TOWER GARDEN. GO UNDER THE TALL HEDGES AND OVER THE SHORT ONES.' });
  meet('THE TOPIARY', 260, 294, [['topiary', 266, G], ['topiary', 278, G], ['apprentice', 284, G], ['topiary', 290, G]]);
  ent('hedgewarden', 318, G, { face: -1, mini: true });
  hedge(M.gate - 1, M.gate + 2, G - 12, G - 5); for (let y = G - 4; y <= G; y++) set(M.gate, y, T.PORT);

  // ---- THE STAIR'S TOP: onto the Gargoyle's slabs ----
  const A = WL2.ARENA;
  rune(340, G, 25); plat(342, 27, 8);                                                 // the last column, up to the arena's lip
  const S = [[350, 30, { range: 8 }], [364, 28, { range: 1, speed: 4, len: 4, cracked: true }], [372, 31, { range: 9 }], [386, 28, { range: 1, speed: 4, len: 4, cracked: true }],
    [392, 29, { range: 10 }], [408, 28, { range: 1, speed: 4, len: 4, cracked: true }]];
  for (const [x, row, o] of S) slab(x, row, Object.assign({ arena: true }, o));
  rune(384, G, 26, 0.8); rune(404, G, 26, 2.6);                                       // back up after a fall to the terrace
  block(426, 429, 0, H - 1); ent('gargoyle', 424, 22, { face: -1 });                  // the tower, and him over its gate
  ent('check', 336, G); ent('sign', 334, G, { text: "THE STAIR'S TOP. SOMETHING IS BOLTED OVER THE TOWER GATE, AND IT IS AWAKE." });

  for (const [x, y0, y1] of ropes) for (let y = y0; y <= y1; y++) set(x, y, T.NET);   /* EVERY ROPE IS HUNG LAST (the Gale Moor bug) */
  return {
    W, H, grid: P.grid, ents: P.ents, START: { x: 3, y: FOOT }, music: 'witchlight', pools: [], falls: [], moversExtra: [], interiors: [], gusts: [],
    glyphBridges, encounters, marks: WL2.MARKS, light: WL2.LIGHT, places: WL2.PLACES,
    mage: { shelves: [], skins: [[426, 429, 0, H - 1, 'tower']], hedges, chains: [], hung: [], outside: 300 },
    witch: { braziers: M.braziers.map(x => [x, G]) },
    mini: { x0: M.x0 * TS, x1: (M.x1 + 1) * TS, floor: (G + 1) * TS, y0: (G - 12) * TS, y1: (G + 2) * TS, trigger: (M.x0 + 3) * TS, wallL: M.wallL, gate: M.gate, boss: 'hedgewarden', name: 'THE HEDGE WARDEN' },
    arena: { x0: A.x0 * TS, x1: A.x1 * TS, floor: (G + 1) * TS, y0: 12 * TS, trigger: (A.x0 + 4) * TS, wallL: A.x0 - 1, wallR: A.x1, boss: 'gargoyle', music: 'boss4' },
  };
}
