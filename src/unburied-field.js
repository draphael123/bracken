// unburied-field.js — THE UNBURIED FIELD (Lane C, 2026-09-23/25). Brief: .claude/briefs/unburied-field.md, agreed with
// Daniel 2026-09-21. The optional Death Knight class level off THE WITCHLIGHT STAIR: clearing it opens the hero 'reaper'
// for coins. Promoted from the greybox (src/draft/unburied-field.js, reconciled against the brief in a9c854c/09f43eb) -
// the geometry below is that greybox's, unchanged, moved onto the shared level painter so it can sit in LEVELS.
//
// THE GHOST BATTLE IS STILL BEING FOUGHT. Three acts, SEVEN SECTIONS (F1), encounters of 3-5 with quiet between plus a
// modest GARRISON row (the brief asks for one) so the density bar (3.5-4.5/screen) is not one even sprinkle:
//   c 0-69     1 THE BARROW LINE      trenches to drop into and climb out of, grave mounds, craters, the first stake line;
//                                     the banner rule (a BANNER-BEARER's standard raises the fallen near it) taught small
//   c 70-129   2 THE SHIELD CROSSING  the ridge's VOLLEYS (horn-warned, marked as zones) and COVER to cross between -
//                                     shields, wagons, mantlets; the first ARROW PEGS; a corpse mound that gives way
//   c 130-229  3 THE BROKEN CHARGE    HIGH ROUTE over the wreckage (dry, exposed, its own cover) or LOW ROUTE through a
//                                     long trench of churned mud (sheltered, slow, crowded); a CAVALRY LANE (red cross:
//                                     get off the ground); catapult arms to swing the trench gaps; a ballista and a
//                                     trebuchet you work
//   c 230-265  4 THE TOPPLED TOWER    a wrecked siege tower lying at an angle: ladders, ropes, broken decks, and the
//                                     trebuchet shot that knocks its top deck loose
//   c 266-299  5 THE STANDARD         open field and THE STANDARD-BEARER (mini) at the gate
//   c 300-373  6 THE CHAPEL OF THE FALLEN ORDER   the ruined chapel and THE SEALED CRYPT ambush (one wave, one captain)
//   c 374-419  7 THE FIRST DEATH KNIGHT   forty tiles of chapel floor, two tomb ledges, and the dead he can raise off it
//
// NEW FLAGS a build/renderer must answer (NONE of them exist in src/main.js yet - see the Lane C report for the exact
// list): 'corpse' ents (the fallen, until a banner puts them back up), 'bannerbearer' foes, volley zones bound to the
// bearer that owns them (kill him and that stretch of ridge goes quiet - the brief's "the field changes as you go"),
// 'cover' props that stop a volley, the cavalry lane hazard, 'ballista'/'trebuchet'/'oilbarrel' engines, ARROW PEGS
// (L.pegs: a volley into a palisade leaves its arrows standing a few seconds - climbable, and never the only way on;
// tools/unburied.mjs proves the level still crosses with all four peg walls deleted), 'standardbearer' (mini) and
// 'deathknight' (boss). EHP has no entries for any of these: F10 (a level must bring a foe the game has never fought,
// and its boss does not count) is satisfied by that fact alone.
import { UF as GEOM } from './draft/unburied-field.js';
export const UF = GEOM;

export function buildUnburiedField({ painter, T, TS }) {
  const { W, H, G } = UF;
  const L = painter(W, H), { set, block, floor, plat, ent, coins } = L;
  const encounters = [], ropes = [], pools = [], moversExtra = [], pegs = [], garrison = [], elites = [];
  const region = (x0, x1, y0, y1, t) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, t); };
  const air = (x0, x1, y0, y1) => region(x0, x1, y0, y1, T.AIR);
  const spikeRow = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.SPIKE); };
  const meet = (name, x0, x1, foes) => { encounters.push({ name, x0, x1, n: foes.length }); for (const [t, x, y, o] of foes) ent(t, x, y, Object.assign({ face: -1, enc: name }, o || {})); };
  const cover = (x, kind, row = G) => ent('cover', x, row, { kind });        // a shield wall, a wagon, a mantlet: the volleys stop at it
  /* CHURNED MUD: a row dug out of the floor with shallow water in it. Wading is slow, and the trench is where the crowd is. */
  const mud = (x0, x1, top) => { air(x0, x1, top, top); pools.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y: top * TS + 4, shallow: true, depth: 12 }); };
  /* A STAKE LINE: a three-wide notch with the stakes standing in it. Hop it, or take the hurt - never a pit you cannot leave. */
  const stakes = (x0, x1) => { air(x0, x1, G + 1, G + 1); spikeRow(x0, x1, G + 1); };
  const crater = (x0, x1) => air(x0, x1, G + 1, G + 1);
  /* ARROW PEGS: a palisade wall, and the rows a volley leaves arrows standing in. NOTHING ON THE ROUTE NEEDS ONE - the reach
     model cannot ride a peg, so a peg is always a shortcut or the way to a payment, and the tool deletes all four and re-walks. */
  const pegWall = (x, top, rows, why) => { region(x, x + 1, top, G, T.PALISADE); pegs.push({ x, top, rows, why, life: 3.5 }); };
  floor(0, W - 1, G + 1);

  // ---- 1. THE BARROW LINE (c 0-69): the rule taught small - a bearer stands, the dead round him get up ----
  for (const [a, b] of UF.TRENCHES) { air(a, b, G + 1, G + 4); plat(a, G + 2, 2); plat(b - 1, G + 2, 2); }   // a trench, a step out at each end
  for (const [a, b] of UF.MOUNDS) block(a, b, G - 1, G);                                                     // grave mounds: one step up, two rows (E4)
  for (const [a, b] of UF.CRATERS) crater(a, b);
  for (const [a, b] of UF.STAKES) stakes(a, b);
  mud(62, 70, G + 4);                                                                                        // the second trench has water in the bottom of it
  cover(18, 'shields'); cover(47, 'wagon');
  ent('silver', 65, G + 3); ent('check', 6, G);   /* off the crater's lip (8-13) */
  ent('sign', 5, G, { text: 'THE DEAD HERE STILL FIGHT THEIR BATTLE. CUT THE BANNER-BEARERS OR THE FALLEN RISE.' });
  ent('sign', 16, G, { text: 'A HORN, THEN THE VOLLEY. GET BEHIND SOMETHING.' });
  ent('sign', 33, G, { text: 'STAKE LINE. THEY PLANTED THESE AGAINST HORSE, AND THE HORSE STILL COMES.' });
  coins([12, G], [26, G + 4], [43, G - 2], [55, G], [66, G + 3]);
  meet('THE FIRST BANNER', 32, 42, [['bannerbearer', 38, G], ['corpse', 33, G], ['corpse', 39, G], ['zombie', 41, G - 2]]);   /* off the stake line (34-36): 34 and 36 stood over the notch and fell into it */   // 41 sits on the grave mound (G-1..G solid): the mound's top is G-2
  meet('THE TRENCH GUARD', 58, 74, [['zombie', 62, G + 4], ['zombie', 67, G + 4], ['bonearcher', 74, G]]);

  // ---- 2. THE SHIELD CROSSING (c 70-129): sixty columns of open ground under the ridge. Cover to cover, on the horn ----
  cover(76, 'mantlet'); cover(92, 'wagon'); cover(112, 'shields'); cover(124, 'mantlet');
  ent('check', 80, G);
  ent('sign', 72, G, { text: 'THE RIDGE HAS THE RANGE ON ALL OF THIS. GO WHEN THE HORN STOPS.' });
  pegWall(104, 26, [33, 31, 29, 27], 'a shelf of coins over the crossing'); plat(106, 25, 5); coins([107, 24], [109, 24], [110, 24]);
  plat(101, 27, 3);                                                                                          // and the long way to that shelf, for anyone who will not wait for a volley
  /* A CORPSE MOUND THAT GIVES WAY: SOFT over a mass-grave pit, with a step out of it (B3 - a pocket always has a way out) */
  region(114, 118, G - 1, G - 1, T.SOFT); air(114, 118, G, G + 3); plat(114, G + 1, 2); plat(117, G + 1, 2);
  ent('sign', 120, G, { text: 'THE MOUNDS ARE NOT GROUND. THEY ARE WHAT IS LEFT OF THE SECOND DAY.' });
  coins([88, G], [98, G + 4], [116, G + 3], [127, G]);
  meet('THE MOUND LINE', 86, 102, [['bannerbearer', 92, G], ['corpse', 90, G], ['corpse', 94, G], ['wight', 100, G + 4]]);
  meet('THE COVER RUN', 110, 128, [['bonearcher', 111, G], ['corpse', 116, G - 2], ['zombie', 121, G], ['husk', 126, G]]);

  // ---- 3. THE BROKEN CHARGE (c 130-229): the low route is a long trench of mud, the high route the wreckage over it ----
  const [l0, l1] = UF.LOW; air(l0, l1, G + 1, G + 5); plat(l0, G + 3, 2); plat(l1 - 1, G + 3, 2); plat(l1 - 2, G, 3); plat(l0, G, 3);   // the long trench (5 deep), two steps out at each end
  block(l0 - 2, l0 - 1, G - 2, G); block(l1 + 1, l1 + 2, G - 2, G);                                            // its ramparts (3 rows: one jump)
  mud(160, 186, G + 5); mud(206, 222, G + 5);                                                                  // and the bottom of it is churned to mud
  for (const [x, row, n] of [[148, 32, 6], [155, 30, 5], [161, 31, 6], [168, 29, 5], [174, 31, 6], [181, 29, 6], [188, 31, 5], [194, 29, 6], [201, 31, 5], [207, 30, 6], [214, 31, 6], [221, 32, 5]])
    plat(x, row, n);                                                                                            // THE HIGH ROUTE: wreckage, broken wagons, a siege engine's frame
  pegWall(154, 24, [33, 31, 29, 27, 25], 'the high route without the long way round');
  cover(159, 'mantlet', 29); cover(202, 'shields', 30); cover(218, 'wagon', 30);   /* each seated on its own ledge (159 and 202 were a row low, standing in the plank) */
  /* WRECKS IN THE CHARGE LANE (C5): the cavalry rides the trench floor, and these are the ground you get off it onto - one
     jump up, never more than seven tiles from the next, so the escape is in sight from anywhere in the lane */
  for (const x of [157, 170, 183, 196, 209, 219]) plat(x, G + 3, 3);                                // the brief: the high route is DRY AND EXPOSED - exposed is not bare
  for (const [x, period, phase] of UF.SWINGS) moversExtra.push({ kind: 'swing', px: x * TS, py: 22 * TS, arm: 88, x: 0, y: 0, w: 48, h: 8, period, phase });   // catapult arms and chains over the trench gaps
  ent('ballista', 130, G, { aim: [150, G + 5] }); ent('ballista', 188, 28, { aim: [210, 30] });
  ent('oilbarrel', 200, G + 5, { spill: [190, 212] });                                                          // knock it over and the trench takes a line of fire
  ent('trebuchet', 230, G, { aim: [257, 33], knocks: 'tower' });   /* its stone breaks the tower's fallen base open at the foot: a way through under the climb */                                                 // the engines you work
  ent('check', 142, G); ent('check', 196, G + 5);
  ent('sign', 140, G, { text: 'HIGH OVER THE WRECKS IS DRY AND IN THE VOLLEYS. LOW IN THE TRENCH IS SHELTERED, SLOW AND FULL.' });
  ent('sign', 148, G - 3, { text: 'HORNS AND DUST ON THE HORIZON. THE HORSE COME DOWN THIS LANE AND THEY DO NOT STOP.' });
  ent('sign', 228, G, { text: 'SIEGE OIL AND A TREBUCHET STILL LOADED. BOTH OF THEM WORK.' });
  coins([152, G + 5], [166, 28], [178, G + 5], [190, 30], [204, G + 5], [216, 29], [224, G]);
  meet('THE CHARGE LANE', 152, 172, [['corpse', 154, G + 5], ['zombie', 158, G + 5], ['bonegob', 164, G + 5], ['corpse', 170, G + 5]]);
  meet('THE TRENCH MELEE', 180, 206, [['bannerbearer', 186, G + 5], ['corpse', 182, G + 5], ['corpse', 190, G + 5], ['zombie', 199, G + 5], ['husk', 204, G + 5]]);
  meet('THE WRECK ARCHERS', 174, 212, [['bonearcher', 176, 30], ['bonearcher', 210, 29], ['harpy', 196, 24]]);
  meet('THE RAMPART', 214, 229, [['wight', 218, G + 5], ['corpse', 222, G + 5], ['bonegob', 227, G - 3], ['zombie', 224, 31]]);   // 227-228 is the rampart wall (G-2..G solid): its top is G-3

  // ---- 4. THE TOPPLED SIEGE TOWER (c 230-265): lying at an angle, climbed by its ladders and broken decks, then down ----
  const [t0, t1] = UF.TOWER; block(t1 + 1, t1 + 2, 20, G);                                                     // its fallen base, a wall you climb, not cross
  for (const [x, row, n] of [[t0, 33, 5], [t0 + 5, 30, 5], [t0 + 10, 27, 5], [t0 + 5, 24, 5], [t0 + 10, 21, 7]]) plat(x, row, n);   // the broken decks
  ropes.push([t1, 21, G]);                                                                                      // and its ladder up the side
  pegWall(246, 18, [31, 29, 27], 'the tower\'s top deck without its ladder');
  ent('silver', t0 + 13, 20);                                                                                   // silver 2: on the tower's top deck
  plat(t1 + 3, 21, 4); block(t1 + 7, 262, 22, G);                                                               // off the top onto the fallen base's crest, and down
  ent('check', 240, G); ent('check', 263, 21);
  coins([t0 + 2, 32], [t0 + 7, 29], [t0 + 12, 26], [t0 + 8, 23], [t0 + 15, 20], [260, 21]);
  ent('sign', 233, G, { text: 'THEY GOT THIS FAR AND IT WENT OVER WITH THEM STILL IN IT.' });
  meet('THE TOWER CREW', 236, 250, [['bonegob', t0 + 7, 29], ['bonearcher', t0 + 12, 26], ['bannerbearer', t0 + 2, G], ['corpse', t0 + 4, G]]);

  // ---- 5. THE STANDARD (c 266-299): open field, the gate behind him ----
  const M = UF.MINI; for (let y = G - 4; y <= G; y++) set(M.gate, y, T.PORT); block(M.gate - 1, M.gate + 1, G - 9, G - 5);
  ent('standardbearer', 284, G, { face: -1, mini: true });
  ent('sign', 268, G, { text: 'THE ARMY\'S GREAT BANNER. EVERY TIME HE PLANTS IT, THE FIELD RISES. TAKE IT FROM HIM.' });

  // ---- 6. THE CHAPEL OF THE FALLEN ORDER (c 300-373) ----
  ent('check', 302, G); block(348, 350, G - 12, G - 3);                                                        // the chapel's broken arch (walked under)
  const A2 = UF.AMBUSH; ent('sign', 314, G, { text: 'THE FALLEN ORDER\'S CRYPT. THE DOOR SHUTS BEHIND YOU.' });
  ent('silver', 322, G - 3); plat(320, G - 2, 5);                                                              // silver 3: on the crypt's tomb
  pegWall(330, 26, [34, 32, 30, 28], 'the chapel\'s gallery and its coins'); plat(332, 25, 4); coins([333, 24], [335, 24]);
  ent('oilbarrel', 336, G, { spill: [333, 344] });   /* clear of the gallery's peg wall at 330: fire burns palisade */
  ent('ballista', 358, G, { aim: [372, G] });
  ent('check', 352, G); ent('check', 370, G);                                                                   // B6: one outside the arena walls
  coins([307, G], [316, G], [326, G], [344, G], [356, G], [366, G]);
  meet('THE CHAPEL YARD', 303, 316, [['corpse', 308, G], ['bannerbearer', 311, G], ['corpse', 313, G], ['wight', 316, G]]);
  meet('THE BROKEN NAVE', 352, 370, [['bonearcher', 354, G], ['zombie', 360, G], ['husk', 364, G], ['corpse', 368, G]]);

  // ---- 7. THE FIRST DEATH KNIGHT (c 374-419): forty tiles, two tomb ledges, and the dead he raises off the floor ----
  const A = UF.ARENA; plat(382, G - 2, 4); plat(402, G - 2, 4);                                                // A12: the room has footing off the floor as well as on it
  ent('deathknight', 396, G, { face: -1 });
  for (const [x, y0, y1] of ropes) for (let y = y0; y <= y1; y++) set(x, y, T.NET);                         /* ropes hung LAST */
  /* THE GARRISON ROW the brief asks for, kept small: the encounters are the level and this is the battle going on round them.
     No blanket calm. A build reads it off L.garrison the way GARRISON in src/level.js is read. */
  garrison.push(['corpse', 10], ['zombie', 6], ['bonearcher', 4], ['bonegob', 3], ['wight', 2], ['husk', 2]);
  elites.push(['bannerbearer', 128, G, { face: -1 }], ['wight', 260, 21, { face: -1 }]);
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: G }, pools, falls: [], moversExtra, interiors: [], gusts: [], encounters, pegs, garrison, elites,
    volleys: UF.VOLLEYS.map(([a, b], i) => ({ x0: a * TS, x1: b * TS, period: 6, horn: 1.5, bearer: UF.VOLLEY_BEARER[i] })),
    cavalry: { x0: UF.LANE[0] * TS, x1: UF.LANE[1] * TS, row: G, period: 14 },
    /* RULE Q: ONE wave, led by a named captain of the level's own roster, and the room opens the moment he is down. */
    ambushes: [{ name: 'THE SEALED CRYPT', row: G, wallL: A2.wallL, wallR: A2.wallR, check: [302, G], captain: 'wight',
      waves: [[['wight', 328, G, { captain: true, name: 'THE CRYPT WARDEN' }], ['zombie', 324, G], ['husk', 338, G], ['corpse', 342, G]]] }],   // 330-331 is the gallery peg wall: the captain stands clear of it
    mini: { x0: M.x0 * TS, x1: (M.x1 + 1) * TS, floor: (G + 1) * TS, y0: (G - 12) * TS, y1: (G + 2) * TS, trigger: (M.x0 + 3) * TS, wallL: M.wallL, gate: M.gate, boss: 'standardbearer', name: 'THE STANDARD-BEARER' },
    arena: { x0: A.x0 * TS, x1: A.x1 * TS, floor: (G + 1) * TS, trigger: (A.x0 + 4) * TS, wallL: A.x0 - 1, wallR: A.x1, boss: 'deathknight' },
  };
}
