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
  meet('THE MOUND LINE', 86, 102, [['bannerbearer', 93, G], ['corpse', 89, G], ['corpse', 95, G], ['wight', 100, G + 4]]   /* off the stake line (90-92) */);
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
  ent('trebuchet', 230, G, { aim: [246, 33], knocks: 'tower' });   /* its stone breaks the tower open at the foot - its palisade (246) and its fallen base (257) - a ground road under the climb; the climb stays (B4) */                                                 // the engines you work
  ent('check', 142, G); ent('check', 196, G + 5);
  ent('sign', 140, G, { text: 'HIGH IS DRY BUT IN THE VOLLEYS. LOW IN THE TRENCH IS SHELTERED, AND SLOW.' });
  ent('sign', 148, G - 3, { text: 'HORNS AND DUST ON THE HORIZON. THE HORSE COME DOWN THIS LANE AND THEY DO NOT STOP.' });
  ent('sign', 227, G - 3, { text: 'SIEGE OIL AND A TREBUCHET STILL LOADED. BOTH OF THEM WORK.' });
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
  ent('check', 240, G); ent('check', 261, 20); ent('check', 263, G);   /* and one on the ground road the trebuchet opens, so a death at the Standard-Bearer does not send you back up the tower */   /* on the crest ledge (259-262, row 21), not beside it */
  coins([t0 + 2, 32], [t0 + 7, 29], [t0 + 12, 26], [t0 + 8, 23], [t0 + 15, 20], [260, 21]);
  ent('sign', 237, G, { text: 'THEY GOT THIS FAR AND IT WENT OVER WITH THEM STILL IN IT.' });
  meet('THE TOWER CREW', 236, 250, [['bonegob', t0 + 7, 29], ['bonearcher', t0 + 12, 26], ['bannerbearer', t0 + 2, G], ['corpse', t0 + 4, G]]);

  // ---- 5. THE STANDARD (c 266-299): open field, the gate behind him ----
  const M = UF.MINI; for (let y = G - 4; y <= G; y++) set(M.gate, y, T.PORT); block(M.gate - 1, M.gate + 1, G - 9, G - 5);
  ent('standardbearer', 284, G, { face: -1, mini: true });
  ent('sign', 268, G, { text: 'THE ARMY\'S GREAT BANNER. EVERY TIME HE PLANTS IT, THE FIELD RISES. TAKE IT FROM HIM.' });

  // ---- 6. THE CHAPEL OF THE FALLEN ORDER (c 300-373) ----
  ent('check', 302, G); block(348, 350, G - 12, G - 3);                                                        // the chapel's broken arch (walked under)
  /* THE LOOK PASS (2026-09-24): what is left of the nave's columns, either side of the arch and along the far wall. Scenery
     only - deco stands behind the play and nothing collides with it. */
  ent('deco', 347, G, { kind: 'brokenPillar', v: 0 }); ent('deco', 351, G, { kind: 'brokenPillar', v: 1 }); ent('deco', 355, G, { kind: 'brokenPillar', v: 1 });
  const A2 = UF.AMBUSH; ent('sign', 314, G, { text: 'THE FALLEN ORDER\'S CRYPT. THE DOOR SHUTS BEHIND YOU.' });
  ent('silver', 322, G - 3); plat(320, G - 2, 5);                                                              // silver 3: on the crypt's tomb
  /* THE CHAPEL'S PEG WALL LEFT THE CRYPT (2026-09-24). It stood at 330, rows 26-36, on solid floor: across the ONLY way on (the
     pegs or nothing) and across the middle of THE SEALED CRYPT, with the room's captain locked east of it and the hero west.
     It stands in the nave now, over THE CRYPT STAIR - the way down under it and up again - as every other peg wall on this field
     stands over a trench. tools/unburied.mjs crosses the field with every stake wall as rock; tools/ambush-reach.mjs asks the room. */
  ent('oilbarrel', 336, G, { spill: [329, 344] });   /* the crypt's pitch: burn the crowd where it stands */
  ent('ballista', 358, G, { aim: [372, G] });
  ent('check', 352, G); ent('check', 370, G);                                                                   // B6: one outside the arena walls
  air(360, 367, G + 1, G + 4); plat(360, G + 2, 2); plat(366, G + 2, 2);                                      /* THE CRYPT STAIR: down under the wall, and up */
  pegWall(363, 26, [34, 32, 30, 28], 'the chapel\'s gallery and its coins'); plat(365, 25, 4); coins([366, 24], [368, 24]);
  coins([307, G], [316, G], [326, G], [344, G], [356, G], [366, G]);
  meet('THE CHAPEL YARD', 303, 316, [['corpse', 308, G + 1], ['bannerbearer', 311, G + 1], ['corpse', 313, G], ['wight', 316, G]]);   /* 308 and 311 stand IN the crater (308-312 is a row down): at G they stood over its air and dropped a row on the first frame (tools/newlevel.mjs) */
  meet('THE BROKEN NAVE', 352, 370, [['bonearcher', 354, G], ['husk', 357, G], ['zombie', 364, G + 4], ['corpse', 369, G]]);   /* the zombie keeps the crypt stair */

  // ---- 7. THE FIRST DEATH KNIGHT (c 374-419): forty tiles, two tomb ledges, and the dead he raises off the floor ----
  const A = UF.ARENA; plat(382, G - 2, 4); plat(402, G - 2, 4);                                                // A12: the room has footing off the floor as well as on it
  ent('deathknight', 396, G, { face: -1 });
  ent('deco', 377, G, { kind: 'brokenPillar', v: 0 }); ent('deco', 411, G, { kind: 'brokenPillar', v: 0 });   /* the chapel's last two columns, at the walls of his room */
  for (const [x, y0, y1] of ropes) for (let y = y0; y <= y1; y++) set(x, y, T.NET);                         /* ropes hung LAST */
  /* THE GRAVES THE BATTLE LEFT (look pass 2026-09-24). The field is dense with the fight - cover every dozen tiles, stakes, signs,
     the fallen lying where they fell - so the sprinkler (DRESS.unburied) finds little open ground, and these are set by hand on
     the few stretches nothing uses: a headstone on the barrow, a cross in each of the first craters, spears and a shield where
     the charge broke, the tower crew's banner in the dirt. Scenery only: deco collides with nothing. */
  for (const [kind, x, y, v] of [['fieldGrave', 85, G - 2, 0], ['fieldGrave', 11, G + 1, 1], ['crookedCross', 54, G + 1, 1], ['bones', 28, G + 4, 0], ['brokenSpears', 136, G, 1],
    ['bones', 204, G + 5, 1], ['stuckShield', 244, G, 0], ['fallenBanner', 254, G, 0], ['oldStandard', 260, G, 0]]) ent('deco', x, y, { kind, v });
  /* THE GARRISON ROW the brief asks for, kept small: the encounters are the level and this is the battle going on round them.
     No blanket calm. A build reads it off L.garrison the way GARRISON in src/level.js is read. */
  garrison.push(['corpse', 10], ['zombie', 6], ['bonearcher', 4], ['bonegob', 3], ['wight', 2], ['husk', 2]);
  elites.push(['bannerbearer', 128, G, { face: -1 }], ['wight', 260, 21, { face: -1 }]);
  return {
    music: 'unburied',
    /* THE LOOK (Daniel 2026-09-24: "it uses the forest theme/tiles ... it needs a graveyard theme, something similar to the level
       that is after Waymeet"). The Hexed Fields' graveyard family - its graves and crosses, fog in the hollows, rim-lit dark
       layers, a night wash - but its own hour and its own horizon: an EMBER DUSK over a ridge where the ghost army still stands,
       the siege wreck in the middle distance, dead straw grass over peat with the dead in it (src/redraw/unburied_world.js).
       tools/skins.mjs asserts none of it falls through to the forest kit again. */
    palette: { sky: 'unburied', far: 'unburied', mid: 'unburied', near: 'unburied', dress: 'battlefield', ledges: 'beam', boneSoil: true,
      haze: 'rgba(150,108,118,0.10)', grass: '#8a8258', grassL: '#aca276', grassD: '#5a5438', dirt: '#4c3c32', dirtL: '#604c3e', dirtD: '#30261f',
      stone: '#77716c', stoneD: '#4c4844', stoneL: '#9c968e', canopy: ['#1a1418', '#261c22', '#32242c'], nearCol: '#3e3428', nearDark: '#241c17', grade: ['#b0685a', 0.12] },   /* grade: an ember soft-light, where the default is the wood's green */
    night: true, nightA: 0.1,   /* a light wash, so the lamps and the hero's glow read; the dusk is in the sky, not in a navy blanket */
    weather: [{ x0: 0, x1: 99999, kind: 'mist' }],   /* low ground fog, the whole field */
    tints: [[318, 419, [34, 28, 52], 0.14]],   /* under the chapel's walls the light goes cold and grey */
    masonry: [[318, W - 1, 20, H - 1], [295, 297, G - 9, G - 5]],   /* THE CHAPEL OF THE FALLEN ORDER is laid stone from its crypt door to the Death Knight's back wall, and so is the gate's lintel */   /* its own sound (Daniel 2026-09-24): "Haunting Chiptune Loop [Void Estate]", CC0 - audio/CREDITS.txt */
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: G }, pools, falls: [], moversExtra, interiors: [], gusts: [], encounters, pegs, garrison, elites,
    volleys: UF.VOLLEYS.map(([a, b], i) => ({ x0: a * TS, x1: b * TS, period: 6, horn: 1.5, bearer: UF.VOLLEY_BEARER[i] })),
    cavalry: { x0: UF.LANE[0] * TS, x1: UF.LANE[1] * TS, row: G, period: 14 },
    /* RULE Q: ONE wave, led by a named captain of the level's own roster, and the room opens the moment he is down. */
    /* its captain is the GRAVE CAPTAIN (the husk: ELITE.husk, AMBUSH_LEADERS - a wight is neither, so the old 'THE CRYPT WARDEN'
       tag on one was never read and the husk led the room all along). The room is one floor wall to wall now: nothing stands in it. */
    ambushes: [{ name: 'THE SEALED CRYPT', row: G, wallL: A2.wallL, wallR: A2.wallR, check: [302, G],
      waves: [[['husk', 338, G, { elite: true }], ['wight', 328, G], ['zombie', 324, G], ['corpse', 342, G]]] }],
    mini: { x0: M.x0 * TS, x1: (M.x1 + 1) * TS, floor: (G + 1) * TS, y0: (G - 12) * TS, y1: (G + 2) * TS, trigger: (M.x0 + 3) * TS, wallL: M.wallL, gate: M.gate, boss: 'standardbearer', name: 'THE STANDARD-BEARER' },
    arena: { x0: A.x0 * TS, x1: A.x1 * TS, floor: (G + 1) * TS, trigger: (A.x0 + 4) * TS, wallL: A.x0 - 1, wallR: A.x1, boss: 'deathknight', music: 'deathknight' },   /* Night on Bald Mountain: the dead rise for one night */
  };
}
