// src/draft/unburied-field.js — THE UNBURIED FIELD, a DRAFT greybox (brief .claude/briefs/unburied-field.md, agreed with Daniel
// 2026-09-21: the optional Death Knight level off the Witchlight Stair). NOT WIRED: tools/unburied-field-draft.mjs measures it.
// THE GHOST BATTLE IS STILL BEING FOUGHT. Three acts, each built round the battle's verbs, enemies as ENCOUNTERS (3-5, a
// BANNER-BEARER at the heart of most: while he stands, the dead round him rise) with quiet between - no even sprinkle.
//   c 0-129    1 THE BARROW LINE     trenches to drop into and climb out of, grave mounds, COVER (shields, wagons) from the
//                                    ridge's VOLLEYS (horn-warned, marked as zones); the banner rule taught on small fights
//   c 130-299  2 THE BROKEN CHARGE   the HIGH ROUTE over the wreckage (dry, exposed to volleys) or the LOW ROUTE through a long
//                                    trench (sheltered, slow, crowded); a CAVALRY LANE (red cross: get off the ground); the
//                                    TOPPLED SIEGE TOWER, a climb of ladders and broken decks; THE STANDARD-BEARER (mini)
//   c 300-419  3 THE CHAPEL OF THE FALLEN ORDER   the ruined chapel, the SEALED CRYPT ambush (the one ambush), THE FIRST
//                                    DEATH KNIGHT
// NEW flags a build implements: 'corpse' ents (the risen dead), 'bannerbearer' foes, volley zones, 'cover' props, the cavalry
// lane, 'ballista'/'trebuchet' engines, ARROW PEGS (a volley into a palisade leaves pegs to stand on - optional here: the reach
// model cannot ride them, so nothing on the route needs one).
export const UF = {
  W: 420, H: 48, G: 36,                         // G: the field's standing row (the ground is row 37)
  ACTS: { barrow: [0, 129], charge: [130, 299], chapel: [300, 419] },
  TRENCHES: [[22, 31], [58, 71], [96, 107]],    // act 1 trenches: 4 rows deep
  LOW: [150, 226], HIGH: [148, 228],            // act 2's two routes over the same stretch
  LANE: [150, 226],                              // the cavalry lane: the low trench's lip is the field there
  TOWER: [236, 256],                             // the toppled siege tower, climbed from row 36 to row 20
  MINI: { x0: 266, x1: 294, gate: 296, wallL: 265 },
  AMBUSH: { wallL: 318, wallR: 346 },
  ARENA: { x0: 356, x1: 412 },
  VOLLEYS: [[10, 50], [72, 128], [148, 228]],    // ridge volley zones (columns): horn, then arrows across them; cover stops them
};
function painter(W, H, T) {
  const grid = new Uint8Array(W * H), ents = [];
  const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  const block = (x0, x1, y0, y1, t = T.SOLID) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, t); };
  return { grid, ents, set, block, plat: (x, y, n) => block(x, x + n - 1, y, y, T.ONEWAY), ent: (t, x, y, o = {}) => ents.push({ t, x, y, ...o }) };
}
export function build(T) {
  const { W, H, G } = UF, TS = 16, P = painter(W, H, T), { set, block, plat, ent } = P, encounters = [], ropes = [];
  const air = (x0, x1, y0, y1) => block(x0, x1, y0, y1, T.AIR);
  const meet = (name, foes) => { encounters.push({ name, n: foes.length }); for (const [t, x, y, o] of foes) ent(t, x, y, Object.assign({ face: -1, enc: name }, o || {})); };
  const cover = (x, kind) => ent('cover', x, G, { kind });            // NEW: a shield wall, a wagon, a mantlet: the volleys stop at it
  block(0, W - 1, G + 1, H - 1);

  // ---- 1. THE BARROW LINE ----
  for (const [a, b] of UF.TRENCHES) { air(a, b, G + 1, G + 4); plat(a, G + 2, 2); plat(b - 1, G + 2, 2); }   // a trench, a step out at each end
  for (const [a, b] of [[40, 44], [84, 88], [114, 118]]) block(a, b, G - 1, G);                               // grave mounds
  cover(18, 'shields'); cover(47, 'wagon'); cover(76, 'mantlet'); cover(112, 'shields');
  ent('silver', 65, G + 4); ent('check', 8, G); ent('check', 80, G);
  ent('sign', 5, G, { text: 'THE DEAD HERE STILL FIGHT THEIR BATTLE. CUT THE BANNER-BEARERS OR THE FALLEN RISE.' });
  ent('sign', 16, G, { text: 'A HORN, THEN THE VOLLEY. GET BEHIND SOMETHING.' });
  meet('THE FIRST BANNER', [['bannerbearer', 36, G], ['corpse', 34, G], ['corpse', 38, G]]);
  meet('THE TRENCH GUARD', [['zombie', 62, G + 4], ['zombie', 67, G + 4], ['bonearcher', 74, G]]);
  meet('THE MOUND LINE', [['bannerbearer', 92, G], ['corpse', 90, G], ['corpse', 94, G], ['wight', 100, G + 4]]);

  // ---- 2. THE BROKEN CHARGE: the low route is a long trench, the high route the wreckage over it ----
  const [l0, l1] = UF.LOW; air(l0, l1, G + 1, G + 5); plat(l0, G + 3, 2); plat(l1 - 1, G + 3, 2); plat(l1 - 2, G, 3); plat(l0, G, 3);   // the long trench (5 deep), two steps out at each end
  block(l0 - 2, l0 - 1, G - 2, G); block(l1 + 1, l1 + 2, G - 2, G);                                            // its ramparts (3 rows: one jump)
  for (const [x, row, n] of [[148, 32, 6], [155, 30, 5], [161, 31, 6], [168, 29, 5], [174, 31, 6], [181, 29, 6], [188, 31, 5], [194, 29, 6], [201, 31, 5], [207, 30, 6], [214, 31, 6], [221, 32, 5]])
    plat(x, row, n);                                                                                            // THE HIGH ROUTE: wreckage, broken wagons, a siege engine's frame
  ent('ballista', 188, 28); ent('trebuchet', 230, G, { aim: [240, 20] });                                      // NEW: the engines you work
  ent('check', 142, G); ent('sign', 144, G, { text: 'HIGH OVER THE WRECKS IS DRY AND IN THE VOLLEYS. LOW IN THE TRENCH IS SHELTERED, SLOW AND FULL.' });
  meet('THE TRENCH MELEE', [['bannerbearer', 186, G + 5], ['corpse', 182, G + 5], ['corpse', 190, G + 5], ['zombie', 196, G + 5], ['husk', 204, G + 5]]);
  meet('THE WRECK ARCHERS', [['bonearcher', 176, 30], ['bonearcher', 210, 29], ['harpy', 196, 24]]);
  // THE TOPPLED SIEGE TOWER: lying at an angle, climbed by its ladders and broken decks to its top, then down to the field
  const [t0, t1] = UF.TOWER; block(t1 + 1, t1 + 2, 20, G);                                                    // its fallen base, a wall you climb, not cross
  for (const [x, row, n] of [[t0, 33, 5], [t0 + 5, 30, 5], [t0 + 10, 27, 5], [t0 + 5, 24, 5], [t0 + 10, 21, 7]]) plat(x, row, n);   // the broken decks
  ropes.push([t1, 21, G]);                                                                                      // and its ladder up the side
  ent('silver', t0 + 13, 20);                                                                                   // silver 2: on the tower's top deck
  plat(t1 + 3, 21, 4); block(t1 + 7, 262, 22, G);                                                               // off the top onto the fallen base's crest, and down
  meet('THE TOWER CREW', [['bonegob', t0 + 7, 29], ['bonearcher', t0 + 12, 26], ['bannerbearer', t0 + 2, G], ['corpse', t0 + 4, G]]);
  // THE STANDARD-BEARER's stretch: open field, the gate behind him
  const M = UF.MINI; for (let y = G - 4; y <= G; y++) set(M.gate, y, T.PORT); block(M.gate - 1, M.gate + 1, G - 9, G - 5);
  ent('standardbearer', 284, G, { face: -1, mini: true }); ent('check', 263, 21);
  ent('sign', 268, G, { text: 'THE ARMY\'S GREAT BANNER. EVERY TIME HE PLANTS IT, THE FIELD RISES. TAKE IT FROM HIM.' });

  // ---- 3. THE CHAPEL OF THE FALLEN ORDER ----
  ent('check', 302, G); block(348, 350, G - 12, G - 3);                                                        // the chapel's broken arch (walked under)
  const A2 = UF.AMBUSH; ent('sign', 314, G, { text: 'THE FALLEN ORDER\'S CRYPT. THE DOOR SHUTS BEHIND YOU.' });
  ent('silver', 332, G - 3); plat(330, G - 2, 5);                                                              // silver 3: on the crypt's tomb
  ent('check', 352, G); ent('deathknight', 390, G, { face: -1 });
  for (const [x, y0, y1] of ropes) for (let y = y0; y <= y1; y++) set(x, y, T.NET);                         /* ropes hung LAST */
  return {
    W, H, grid: P.grid, ents: P.ents, START: { x: 3, y: G }, pools: [], falls: [], moversExtra: [], interiors: [], gusts: [], encounters,
    volleys: UF.VOLLEYS.map(([a, b]) => ({ x0: a * TS, x1: b * TS, period: 6, horn: 1.5 })), cavalry: { x0: UF.LANE[0] * TS, x1: UF.LANE[1] * TS, row: G, period: 14 },
    ambushes: [{ name: 'THE SEALED CRYPT', row: G, wallL: A2.wallL, wallR: A2.wallR, waves: [[['wight', 324], ['zombie', 330], ['husk', 338]], [['bonearcher', 322], ['wight', 334], ['zombie', 342]]] }],
    mini: { x0: M.x0 * TS, x1: (M.x1 + 1) * TS, floor: (G + 1) * TS, y0: (G - 12) * TS, y1: (G + 2) * TS, trigger: (M.x0 + 3) * TS, wallL: M.wallL, gate: M.gate, boss: 'standardbearer' },
    arena: { x0: UF.ARENA.x0 * TS, x1: UF.ARENA.x1 * TS, floor: (G + 1) * TS, trigger: (UF.ARENA.x0 + 4) * TS, wallL: UF.ARENA.x0 - 1, wallR: UF.ARENA.x1, boss: 'deathknight' },
  };
}
