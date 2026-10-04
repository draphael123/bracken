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
//   c 266-299  5 THE STANDARD         open field and THE BARROW RIDER (mini) at the gate - the old banner is his lance now
//   c 300-373  6 THE CHAPEL OF THE FALLEN ORDER   the ruined chapel and THE SEALED CRYPT ambush (one wave, one captain)
//   c 374-419  7 THE DEATH KNIGHT         forty tiles of chapel floor, two tomb ledges, and the hero himself: the class you buy, as
//                                     the boss (2026-09-25; THE FIRST DEATH KNIGHT, the scythe, is THE REAPER on the bench, RULES P)
//   (and since 2026-09-25 THE BROKEN BRIDGES, c 265-324 in final columns, grown in between the tower and the Rider: see below)
//
// NEW FLAGS a build/renderer must answer (NONE of them exist in src/main.js yet - see the Lane C report for the exact
// list): 'corpse' ents (the fallen, until a banner puts them back up), 'bannerbearer' foes, volley zones bound to the
// bearer that owns them (kill him and that stretch of ridge goes quiet - the brief's "the field changes as you go"),
// 'cover' props that stop a volley, the cavalry lane hazard, 'ballista'/'trebuchet'/'oilbarrel' engines, ARROW PEGS
// (L.pegs: a volley into a palisade leaves its arrows standing a few seconds - climbable, and never the only way on;
// tools/unburied.mjs proves the level still crosses with all four peg walls deleted), 'barrowrider' (mini, in the Standard-Bearer's place since 2026-09-24) and
// 'bloodknight' (boss: THE DEATH KNIGHT; 'deathknight', the old scythe, is benched). EHP has no entries for any of these: F10 (a level must bring a foe the game has never fought,
// and its boss does not count) is satisfied by that fact alone.
import { UF as GEOM } from './draft/unburied-field.js';
/* THE BROKEN BRIDGES (2026-09-25, docs/briefs/unburied-deathknight.md): sixty columns cut in at 265 with grow(), between the
   toppled tower and the Barrow Rider's barrow. Everything below is still written in the greybox's columns (the draft's 420) and
   grow() slides the Rider, the chapel and the arena sixty east; UF, exported here, is the level's FINAL geometry, and the tools
   read that one (tools/unburied.mjs). The bridges themselves are written in final columns (D5). */
const BRG = { at: 265, n: 60, ravine: [273, 316], bed: 46,
  /* the decks, flush with the field, on timber trestles; the gaps between them are what the jumps are (S2: 2 and 3 tiles) */
  spans: [[273, 275], [279, 284], [287, 291], [295, 300], [304, 307], [310, 313]],
  trestles: [[274, 275], [280, 283], [288, 290], [296, 299], [305, 306], [311, 312]],
  /* the stream bed's stakes, under the east end of every three-tile gap - where a short jump comes down */
  stakes: [[277, 278], [293, 294], [302, 303], [315, 316]] };
const X = x => x >= BRG.at ? x + BRG.n : x;
export const UF = Object.assign({}, GEOM, {
  W: GEOM.W + BRG.n,
  ACTS: { barrow: [0, 129], charge: [130, X(299)], chapel: [X(300), GEOM.W + BRG.n - 1] },
  SECTIONS: { barrowline: [0, 69], shieldcrossing: [70, 129], brokencharge: [130, 229], toppledtower: [230, 264], bridges: [265, 324], standard: [325, X(299)], chapel: [X(300), X(373)], arena: [X(374), X(419)] },
  PEGS: GEOM.PEGS.filter(p => p[0] < 300),   /* the chapel's peg wall is gone (it stood on nothing over the crypt stair) */
  MINI: { x0: X(GEOM.MINI.x0), x1: X(GEOM.MINI.x1), gate: X(GEOM.MINI.gate), wallL: X(GEOM.MINI.wallL) },
  AMBUSH: { wallL: X(GEOM.AMBUSH.wallL), wallR: X(GEOM.AMBUSH.wallR) },
  ARENA: { x0: X(GEOM.ARENA.x0), x1: X(GEOM.ARENA.x1) },
  ENGINES: GEOM.ENGINES.map(([x, t]) => [X(x), t]),
  BRIDGES: BRG,
  /* THE GLINT SPOTS (tools/unburied-look.mjs 6): where a hero stands to be shown each thing the route needs next (hero), where he stands to have it OFF screen (far), and the engine that ends it */
  GLINTS: [{ id: 'ub-ballista-130', hero: [124, 36], far: [113, 36], engine: { t: 'ballista', x: 130 } }, { id: 'ub-ballista-188', hero: [183, 28], far: [170, 28], engine: { t: 'ballista', x: 188 } },
    { id: 'ub-oil-200', hero: [196, 41], engine: { t: 'oilbarrel', x: 200 } }, { id: 'ub-trebuchet-230', hero: [223, 36], far: [215, 36], engine: { t: 'trebuchet', x: 230 } },
    { id: 'ub-rope-ladder', hero: [277, 45], far: [305, 45] }, { id: 'ub-oil-396', hero: [390, 36], engine: { t: 'oilbarrel', x: 396 } }, { id: 'ub-ballista-418', hero: [412, 36], engine: { t: 'ballista', x: 418 } }],
});

/* THE SET PIECES, in FINAL columns: [id, kind, col, standing row, sprite w px, h px, opts]. A deco stands on its row (bottom-centre on the tile); the bbox it fills in tiles is
   what UF.SETPIECES lists for tools/unburied-look.mjs (a set piece on every screen). The art is src/redraw/unburied_sets.js (+ unburied_siege.js, unburied_chapel.js). */
const G0 = GEOM.G, SET = [];
const S = (id, kind, x, y, w, h, o = {}) => SET.push({ id, kind, x, y, w, h, o });
const bbox = s => ({ id: s.id, x0: Math.floor((s.x * 16 + 8 - s.w / 2) / 16), x1: Math.floor((s.x * 16 + 8 + s.w / 2 - 1) / 16), y0: Math.floor(((s.y + 1) * 16 - s.h) / 16), y1: s.y });
/* THE DEAD CAMP (0-20): the host's slate and raven, a cold fire, the rack, and the last brazier still lit */
S('camp-brazier', 'ubBrazier', 1, G0, 18, 34); S('camp-rack', 'ubRack', 3, G0, 34, 36); S('camp-ring', 'ubFireRing', 6, G0, 44, 26); S('camp-tent', 'ubTent', 17, G0, 76, 60);
/* THE MASS-GRAVE PITS: the dead laid in rows, the spoil heaped at the lips with the spades in it, the handcart, the crosses stacked waiting */
S('pit-1', 'ubPit', 27, G0 + 4, 176, 22, { w: 11 }); S('spoil-1a', 'ubSpoil', 21, G0, 46, 24); S('spoil-1b', 'ubSpoil', 33, G0, 46, 24, { v: 1 }); S('handcart', 'ubHandcart', 38, G0, 44, 30);
S('pit-2', 'ubPit', 65, G0 + 4, 240, 22, { w: 15, v: 1 }); S('spoil-2a', 'ubSpoil', 57, G0, 46, 24, { v: 1 }); S('spoil-2b', 'ubSpoil', 72, G0, 46, 24);
S('crosses', 'ubCrosses', 86, G0, 30, 34); S('pit-3', 'ubPit', 102, G0 + 4, 208, 22, { w: 13, v: 2 }); S('spoil-3a', 'ubSpoil', 94, G0, 46, 24); S('spoil-3b', 'ubSpoil', 109, G0, 46, 24, { v: 1 });
S('mound-dead', 'ubMoundDead', 116, G0 + 3, 80, 64);
S('line-brazier-a', 'ubBrazier', 88, G0, 18, 34); S('line-brazier-b', 'ubBrazier', 122, G0, 18, 34);
S('shield-wall', 'ubShieldWall', 78, G0 + 2, 144, 46, { w: 144 });
/* WHERE THE CHARGE BROKE: fallen warhorses in both armies' barding, the snapped lances on the stake lines, the supply wagons overturned in the lane - two of them burning */
S('horse-field-a', 'ubHorse', 50, G0, 60, 34); S('horse-field-b', 'ubHorse', 140, G0, 60, 34, { v: 1 });
S('horse-lane-a', 'ubHorse', 165, G0 + 5, 60, 34); S('horse-lane-b', 'ubHorse', 191, G0 + 5, 60, 34, { v: 1 }); S('horse-lane-c', 'ubHorse', 215, G0 + 5, 60, 34);
for (const [x, v, burning] of [[158, 0, false], [171, 1, false], [184, 0, true], [197, 0, false], [210, 1, true], [220, 1, false]]) S('wagon-' + x, 'ubWagon', x, G0 + 5, 64, 64, { v, burning });
for (const x of [35, 91, 145, 365]) S('lances-' + x, 'ubLances', x, G0, 56, 38, { w: 56, v: x % 3 });
/* THE SIEGE WORKS: the trebuchet's emplacement, the gun-deck's furniture (racks, dead ballistae, the one hanging off the edge, mantlets, the working ballista's barbette) and the gantries the swings hang from */
S('treb-emplace', 'ubEmplace', 230, G0, 112, 36);
S('barbette-188', 'ubBarbette', 188, 30, 46, 38);
S('gantry-168', 'ubGantry', 168, 28, 48, 126); S('gantry-196', 'ubGantry', 196, 28, 48, 126);
S('rack-156', 'ubBoltRack', 156, 29, 26, 32); S('rack-175', 'ubBoltRack', 175, 30, 26, 32); S('rack-203', 'ubBoltRack', 203, 30, 26, 32);
S('bdead-162', 'ubBallistaDead', 162, 30, 46, 36); S('bdead-183', 'ubBallistaDead', 183, 28, 46, 36, { v: 1 }); S('bdead-209', 'ubBallistaDead', 209, 29, 46, 36);
S('bhang-153', 'ubBallistaHang', 153, 34, 34, 44);
S('mantlet-177', 'ubMantlet', 177, 30, 30, 34); S('mantlet-198', 'ubMantlet', 198, 28, 30, 34, { v: 1 });
/* THE GUN-DECK: one timber battery on trestles - the twelve runs of the high route (row, first col, length), a trestle bent under each (R.structures kind 'ubtrestle') */
const DECK_RUNS = [[148, 32, 6], [155, 30, 5], [161, 31, 6], [168, 29, 5], [174, 31, 6], [181, 29, 6], [188, 31, 5], [194, 29, 6], [201, 31, 5], [207, 30, 6], [214, 31, 6], [221, 32, 5]];
const FIRE_AT = SET.filter(s => s.o.burning).map(s => ({ id: s.id, x: s.x, y: GEOM.G + 2, up: 14, burning: true }));   /* the fire stands on the bed (row G+3's top is y = (G+3)*16) */

UF.SETPIECES = SET.filter(s => s.w >= 32 && s.h >= 24).map(bbox);   /* what tools/unburied-look.mjs counts: a set piece on every screen */
UF.SETPIECES.push(...DECK_RUNS.map(([x, row, n]) => ({ id: 'deck-' + x, x0: x, x1: x + n - 1, y0: row, y1: 42 })), { id: 'tower-decks', x0: 228, x1: 245, y0: 17, y1: 36 }, { id: 'tower-shell', x0: 246, x1: 259, y0: 17, y1: 36 });
UF.SETPIECES.push(...[[130, 36, 40, 34], [188, 28, 40, 34], [200, 41, 44, 30], [230, 36, 56, 56], [396, 36, 44, 30], [418, 36, 40, 34]].map(([x, y, w, h]) => bbox({ id: 'engine-' + x, x, y, w, h })));
UF.FIRES = [...FIRE_AT, { id: 'camp-brazier', x: 1, y: GEOM.G, up: 18 }];

/* THE TILE KIT'S MAP (final columns): the field's ground BY SECTION of the road, and its ledges BY WHAT THEY ARE (first match wins) - src/redraw/unburied_tiles.js */
const TILEKIT = { G: GEOM.G, bed: BRG.bed, ravine: [BRG.at, BRG.at + BRG.n - 1], gap: BRG.ravine, stoneFrom: 360, gateStone: [355, 357], hide: [246, 247], towerBase: [257, 258, 20, GEOM.G],
  zones: [['camp', [0, 20]], ['spoil', [21, 129]], ['mud', [130, 229]], ['works', [230, 264]], ['approach', [265, 359]]],
  pits: GEOM.TRENCHES, revet: [[21, 32], [57, 72], [72, 84], [95, 108], [148, 228]],
  ledges: [[148, 228, 29, 32, 'deck'], ...[157, 170, 183, 196, 209, 219].map(x => [x, x + 2, GEOM.G + 3, GEOM.G + 3, 'wagon']), [332, 334, GEOM.G - 2, GEOM.G - 2, 'wagon'], [346, 348, GEOM.G - 2, GEOM.G - 2, 'wagon'],
    [230, 264, 18, 35, 'tower'], [380, 384, GEOM.G - 2, GEOM.G - 2, 'tomb'], [442, 445, GEOM.G - 2, GEOM.G - 2, 'tomb'], [462, 465, GEOM.G - 2, GEOM.G - 2, 'tomb'], [360, 479, 0, 47, 'stone']] };
export function buildUnburiedField({ painter, T, TS, grow }) {
  const UF = GEOM, { W, H, G } = GEOM;   /* the greybox's columns, all of them: the bridges are grown in at the end */
  const L = painter(W, H), { set, block, floor, plat, ent, coins } = L;
  const encounters = [], ropes = [], pools = [], moversExtra = [], pegs = [], garrison = [], elites = [];
  const region = (x0, x1, y0, y1, t) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, t); };
  const air = (x0, x1, y0, y1) => region(x0, x1, y0, y1, T.AIR);
  const spikeRow = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.SPIKE); };
  const meet = (name, x0, x1, foes) => { encounters.push({ name, x0, x1, n: foes.length }); for (const [t, x, y, o] of foes) ent(t, x, y, Object.assign({ face: -1, enc: name }, o || {})); };
  const cover = (x, kind, row = G) => ent('cover', x, row, { kind });        // a shield wall, a wagon, a mantlet: the volleys stop at it
  /* CHURNED MUD: a row dug out of the floor with shallow water in it. Wading is slow, and the trench is where the crowd is. */
  const mud = (x0, x1, top) => { air(x0, x1, top, top); pools.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y: top * TS + 4, shallow: true, depth: 12, mud: true }); };
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
  meet('THE TRENCH GUARD', 58, 74, [['zombie', 62, G + 4], ['hound', 67, G + 4, { cnSkin: 'gravehound' }], ['bonearcher', 74, G]]);

  // ---- 2. THE SHIELD CROSSING (c 70-129): sixty columns of open ground under the ridge. Cover to cover, on the horn ----
  /* THE OLD TRENCH LINE (the rework, 2026-09-24): the first army's own trench across the foot of the crossing, two rows deep and
     eleven long, stepped at each end so it is RUN, not jumped - and down in it the ridge's arrows go over you (sheltered(): a
     trench is cover). The first cover of the crossing, where a mantlet stood. Its walls are timber and wattle (trenchRevet). */
  air(73, 83, G + 1, G + 1); air(74, 82, G + 2, G + 2);
  cover(92, 'wagon'); cover(112, 'shields'); cover(124, 'mantlet');
  ent('check', 80, G + 2);
  ent('sign', 72, G, { text: 'THE RIDGE HAS THE RANGE ON ALL OF THIS. GO WHEN THE HORN STOPS.' });
  pegWall(104, 26, [33, 31, 29, 27], 'a shelf of coins over the crossing'); plat(106, 25, 5); coins([107, 24], [109, 24], [110, 24]);
  plat(101, 27, 3);                                                                                          // and the long way to that shelf, for anyone who will not wait for a volley
  /* A CORPSE MOUND THAT GIVES WAY: SOFT over a mass-grave pit, with a step out of it (B3 - a pocket always has a way out) */
  region(114, 118, G - 1, G - 1, T.SOFT); air(114, 118, G, G + 3); plat(114, G + 1, 2); plat(117, G + 1, 2);
  ent('sign', 120, G, { text: 'THE MOUNDS ARE NOT GROUND. THEY ARE WHAT IS LEFT OF THE SECOND DAY.' });
  coins([88, G], [98, G + 4], [116, G + 3], [127, G]);
  meet('THE MOUND LINE', 86, 102, [['bannerbearer', 93, G], ['corpse', 89, G], ['corpse', 95, G], ['wight', 100, G + 4]]   /* off the stake line (90-92) */);
  meet('THE COVER RUN', 110, 128, [['bonearcher', 111, G], ['corpse', 116, G - 2], ['hound', 121, G, { cnSkin: 'gravehound' }], ['husk', 126, G]]);

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
  meet('THE CHARGE LANE', 152, 172, [['corpse', 154, G + 5], ['hound', 158, G + 5, { cnSkin: 'gravehound' }], ['bonegob', 164, G + 5], ['corpse', 170, G + 5]]);
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
  ent('check', 240, G); ent('check', 261, 20); ent('check', 263, G);   /* and one on the ground road the trebuchet opens, so a death at the Barrow Rider does not send you back up the tower */   /* on the crest ledge (259-262, row 21), not beside it */
  coins([t0 + 2, 32], [t0 + 7, 29], [t0 + 12, 26], [t0 + 8, 23], [t0 + 15, 20], [260, 21]);
  ent('sign', 237, G, { text: 'THEY GOT THIS FAR AND IT WENT OVER WITH THEM STILL IN IT.' });
  meet('THE TOWER CREW', 236, 250, [['bonegob', t0 + 7, 29], ['bonearcher', t0 + 12, 26], ['bannerbearer', t0 + 2, G], ['corpse', t0 + 4, G]]);

  // ---- 5. THE STANDARD (c 266-299): open field, the gate behind him ----
  const M = UF.MINI; for (let y = G - 4; y <= G; y++) set(M.gate, y, T.PORT); block(M.gate - 1, M.gate + 1, G - 9, G - 5);
  ent('barrowrider', 284, G, { face: -1, mini: true });
  plat(272, G - 2, 3); plat(286, G - 2, 3);   /* two wrecked carts' beds: a jump's worth of ground off the floor, and the ride goes under them */
  ent('sign', 268, G, { text: 'HIS BARROW, AND HIS HORSE IN IT. WHEN HE RIDES, GET OFF THE GROUND.' });

  // ---- 6. THE CHAPEL OF THE FALLEN ORDER (c 300-373) ----
  ent('check', 302, G); block(348, 350, G - 1, G);   /* THE CHAPEL'S ARCH, FALLEN (2026-09-25). Its crown hung here at rows 24-33, two rows over the
     road with sky behind it and nothing under it (tools/architecture.mjs listed it); it lies on the nave floor now, two rows of it, and
     you step over it between its two broken columns */
  /* THE LOOK PASS (2026-09-24): what is left of the nave's columns, either side of the arch and along the far wall. Scenery
     only - deco stands behind the play and nothing collides with it. */
  ent('deco', 347, G, { kind: 'brokenPillar', v: 0 }); ent('deco', 351, G, { kind: 'brokenPillar', v: 1 }); ent('deco', 355, G, { kind: 'brokenPillar', v: 1 });
  const A2 = UF.AMBUSH; ent('sign', 314, G, { text: 'THE FALLEN ORDER\'S CRYPT. THE DOOR SHUTS BEHIND YOU.' });
  ent('silver', 322, G - 3); plat(320, G - 2, 5);                                                              // silver 3: on the crypt's tomb
  /* THE CHAPEL'S PEG WALL IS GONE (2026-09-25). It stood at 330 across the only way on and the middle of THE SEALED CRYPT, then
     (2026-09-24) at 363 over THE CRYPT STAIR - hung over the stair's pit on nothing, a timber wall standing in the air
     (tools/architecture.mjs). Three peg walls are left on the field; its gallery and the gallery's coins went with it. */
  ent('oilbarrel', 336, G, { spill: [329, 344] });   /* the crypt's pitch: burn the crowd where it stands */
  ent('ballista', 358, G, { aim: [372, G] });
  ent('check', 352, G); ent('check', 370, G);                                                                   // B6: one outside the arena walls
  air(360, 367, G + 1, G + 4); plat(360, G + 2, 2); plat(366, G + 2, 2);                                      /* THE CRYPT STAIR: down under the wall, and up */
  coins([363, G + 4], [364, G + 4]);   /* the stair's own coins, at the bottom of it */
  coins([307, G], [316, G], [326, G], [344, G], [356, G], [366, G]);
  meet('THE CHAPEL YARD', 303, 316, [['corpse', 308, G + 1], ['bannerbearer', 311, G + 1], ['corpse', 313, G], ['wight', 316, G]]);   /* 308 and 311 stand IN the crater (308-312 is a row down): at G they stood over its air and dropped a row on the first frame (tools/newlevel.mjs) */
  meet('THE BROKEN NAVE', 352, 370, [['bonearcher', 354, G], ['husk', 357, G], ['zombie', 364, G + 4], ['corpse', 369, G]]);   /* the zombie keeps the crypt stair */

  // ---- 7. THE DEATH KNIGHT (c 374-419): forty tiles, two tomb ledges, and the dead that get up for him ----
  const A = UF.ARENA; plat(382, G - 2, 4); plat(402, G - 2, 4);                                                // A12: the room has footing off the floor as well as on it
  ent('bloodknight', 396, G, { face: -1 });   /* THE DEATH KNIGHT, the hero himself (src/unburied-foes.js updateBloodKnight) */
  ent('deco', 377, G, { kind: 'brokenPillar', v: 0 }); ent('deco', 411, G, { kind: 'brokenPillar', v: 0 });   /* the chapel's last two columns, at the walls of his room */
  for (const [x, y0, y1] of ropes) for (let y = y0; y <= y1; y++) set(x, y, T.NET);                         /* ropes hung LAST */
  /* THE GRAVES THE BATTLE LEFT (look pass 2026-09-24). The field is dense with the fight - cover every dozen tiles, stakes, signs,
     the fallen lying where they fell - so the sprinkler (DRESS.unburied) finds little open ground, and these are set by hand on
     the few stretches nothing uses: a headstone on the barrow, a cross in each of the first craters, spears and a shield where
     the charge broke, the tower crew's banner in the dirt. Scenery only: deco collides with nothing. */
  for (const [kind, x, y, v] of [['fieldGrave', 85, G - 2, 0], ['fieldGrave', 11, G + 1, 1], ['crookedCross', 54, G + 1, 1], ['bones', 28, G + 4, 0], ['brokenSpears', 136, G, 1],
    ['bones', 204, G + 5, 1], ['stuckShield', 244, G, 0], ['fallenBanner', 254, G, 0], ['oldStandard', 260, G, 0]]) ent('deco', x, y, { kind, v });
  /* THE REWORK'S SCENERY (2026-09-24): planted pikes and broken shields where the lines held and broke, a mangonel and a ram the siege
     left, the barrows the dead went into, and the two armies' colours - the order's red on the west of the field, the host's slate
     grey on the east, and both where they met. Scenery only: deco collides with nothing, and the crows sit on all of it. */
  for (const [kind, x, y, v] of [['plantedSpears', 38, G, 0], ['plantedSpears', 143, G, 1], ['plantedSpears', 243, G, 1], ['shieldPile', 94, G, 0], ['shieldPile', 110, G, 1], ['shieldPile', 318, G, 0],
    ['catapultWreck', 137, G, 0], ['batteringRam', 299, G, 0], ['barrowMound', 49, G, 1], ['barrowMound', 278, G, 0], ['barrowMound', 291, G, 1],
    ['armyBanner', 88, G - 2, 1], ['armyBanner', 128, G, 1], ['armyBanner', 238, G, 1], ['armyBanner', 261, 20, 1], ['armyBanner', 317, G, 0],   /* (Daniel 10-03: the armies' colours as you walk - the host's slate in the west, the Order's red on the chapel in the east) */
    ['trenchRevet', 74, G + 2, 1], ['trenchRevet', 82, G + 2, 0],
    ['brokenCart', 273, G, 0], ['brokenCart', 287, G, 0]]) ent('deco', x, y, { kind, v });   /* the Barrow Rider's two ledges are what is left of these carts' beds (B9: they are held up by something) */
  /* THE GARRISON ROW the brief asks for, kept small: the encounters are the level and this is the battle going on round them.
     No blanket calm. A build reads it off L.garrison the way GARRISON in src/level.js is read. */
  garrison.push(['corpse', 10], ['zombie', 6], ['bonearcher', 4], ['bonegob', 3], ['wight', 2], ['husk', 2]);
  elites.push(['bannerbearer', 128, G, { face: -1 }], ['wight', 260, 21, { face: -1 }]);
  const R0 = {
    /* ONE TRACK, FIELD AND FIGHT (Daniel, 2026-09-25): the whole level plays Night on Bald Mountain, and the arena names the same
       track, so the chapel door neither switches nor restarts it (playFile returns on the track already playing). The field's own
       loop, audio/unburied.ogg ("Haunting Chiptune Loop"), stays in the library and the sound test; no level plays it now. */
    music: 'unburied',   /* (claude/unburiedart, Daniel 2026-10-03) "March of the Wizards" by Aureolus_Omicron, CC-BY 4.0 (audio/unburied.ogg; credit in MUSIC_CREDITS and audio/CREDITS.txt): the field's own track again. The arena still names deathknight (the boss lane's) */
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
    ambient: [{ x0: 0, x1: 300 * TS, kind: 'battlefield' }, { x0: 300 * TS, x1: 99999, kind: 'hall', bell: true }],   /* a wind over the dead field, and the stone's hush under the chapel (claude/identity0: it had no zone and played the wood's birdsong) */
    tints: [[318, 419, [34, 28, 52], 0.14]],   /* under the chapel's walls the light goes cold and grey */
    masonry: [[318, W - 1, 20, H - 1], [295, 297, G - 9, G - 5]],   /* THE CHAPEL OF THE FALLEN ORDER is laid stone from its crypt door to the Death Knight's back wall, and so is the gate's lintel */   /* (its old loop, "Haunting Chiptune Loop [Void Estate]", CC0 - audio/CREDITS.txt - is retired from the level: see music below) */
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: G }, pools, falls: [], moversExtra, interiors: [], gusts: [], encounters, pegs, garrison, elites,
    volleys: UF.VOLLEYS.map(([a, b], i) => ({ x0: a * TS, x1: b * TS, period: 6, horn: 1.5, bearer: UF.VOLLEY_BEARER[i] })),
    cavalry: { x0: UF.LANE[0] * TS, x1: UF.LANE[1] * TS, row: G, period: 14 },
    /* RULE Q: ONE wave, led by a named captain of the level's own roster, and the room opens the moment he is down. */
    /* its captain is the GRAVE CAPTAIN (the husk: ELITE.husk, AMBUSH_LEADERS - a wight is neither, so the old 'THE CRYPT WARDEN'
       tag on one was never read and the husk led the room all along). The room is one floor wall to wall now: nothing stands in it. */
    ambushes: [{ name: 'THE SEALED CRYPT', row: G, wallL: A2.wallL, wallR: A2.wallR, check: [302, G],
      waves: [[['husk', 338, G, { elite: true }], ['wight', 328, G], ['zombie', 324, G], ['corpse', 342, G]]] }],
    mini: { x0: M.x0 * TS, x1: (M.x1 + 1) * TS, floor: (G + 1) * TS, y0: (G - 12) * TS, y1: (G + 2) * TS, trigger: (M.x0 + 3) * TS, wallL: M.wallL, gate: M.gate, boss: 'barrowrider', name: 'THE BARROW RIDER' },
    arena: { x0: A.x0 * TS, x1: A.x1 * TS, floor: (G + 1) * TS, trigger: (A.x0 + 4) * TS, wallL: A.x0 - 1, wallR: A.x1, boss: 'bloodknight', music: 'deathknight' },   /* Night on Bald Mountain: the dead rise for one night - the level's own track, kept (L.music) */
  };

  // ---- 4b. THE BROKEN BRIDGES (c 265-324, final columns; 2026-09-25) ----
  /* THE LEVEL'S SENTENCE FOR THIS STRETCH: the old army's bridges over the ravine are broken, and the ridge's archers have the range on
     every plank. Nine rows down to a stream bed, stone-cold and staked where a short jump comes down; the decks lie flush with the field
     on timber trestles, and the gaps between them are two and three tiles (S2: a real jump is 3.2, so a three can be missed). A miss is
     a fall to the bed and a walk back to the ladder at the west wall - the bridgehead, before the first gap: the whole crossing again.
     THE TOLD VOLLEY is the bridges' own: a WHISTLE, then SHADOWS on the planks where the arrows come down (one on you, one either
     side), then the arrows. Step out of your shadow (often that is a jump), get behind a broken mantlet or an overturned cart, or hold
     a guard up: a blow from straight overhead is a blow from the front for every guard in the game (damagePlayer: fromX === P.x). */
  const Bp = grow(L, R0, BRG.at, BRG.n), R = Bp.R;
  /* what grow() cannot know to move: this level's own fields, in tiles */
  R.masonry = R0.masonry.map(([a, b, y0, y1]) => [X(a), X(b), y0, y1]);
  R.tints = R0.tints.map(([a, b, c, k]) => [X(a), X(b), c, k]);
  R.encounters = R0.encounters.map(e => ({ ...e, x0: X(e.x0), x1: X(e.x1) }));
  R.pegs = R0.pegs.map(p => ({ ...p, x: X(p.x) }));
  R.elites = R0.elites.map(([t, x, y, o]) => [t, X(x), y, o]);
  for (const e of L.ents) { if (Array.isArray(e.aim)) e.aim = [X(e.aim[0]), e.aim[1]]; if (Array.isArray(e.spill)) e.spill = [X(e.spill[0]), X(e.spill[1])]; }   /* an engine's mark */
  /* the stretch itself */
  const [r0, r1] = BRG.ravine, bed = BRG.bed, c0 = BRG.at, c1 = BRG.at + BRG.n - 1;
  Bp.floor(c0, c1, G + 1);                                                                          // the field, bank to bank
  for (let y = G + 1; y < bed; y++) for (let x = r0; x <= r1; x++) Bp.set(x, y, T.AIR);            // THE RAVINE
  for (const [a, b] of BRG.spans) for (let x = a; x <= b; x++) Bp.set(x, G + 1, T.PLANK);           // the decks that are left
  for (const [a, b] of BRG.stakes) for (let x = a; x <= b; x++) Bp.set(x, bed, T.SPIKE);            // stakes in the stream bed
  for (let y = G + 2; y < bed; y++) Bp.set(r0, y, T.NET);                                           // THE WAY OUT: a rope ladder up the west wall, under the first deck
  R.structures = BRG.trestles.map(([a, b]) => ({ x0: a, x1: b, top: G + 2, floor: bed, kind: 'timber' }));   /* B9: every deck stands on its trestle */
  const bent = (t, x, y, o = {}) => Bp.ent(t, x, y, o);
  for (const [x, kind] of [[269, 'cart'], [281, 'brokenMantlet'], [297, 'cart'], [311, 'brokenMantlet'], [319, 'brokenMantlet']]) bent('cover', x, G, { kind });   /* COVER: what the first army left on its bridges */
  bent('check', 318, G);   /* the far bank, outside the Barrow Rider's barrow: a fall in the ravine costs the crossing, not the tower */
  bent('sign', 266, G, { text: 'THE BRIDGES. A WHISTLE, THEN SHADOWS: STEP OUT, GET UNDER COVER, OR RAISE A SHIELD.' });
  /* S1: bodies where the ground is already hard - two bowmen on the far bank covering the last gap, a bone goblin on the middle deck */
  const enc = [['bonearcher', 321, G], ['bonearcher', 323, G], ['bonegob', 298, G]];
  R.encounters.push({ name: 'THE FAR BANK', x0: 295, x1: 324, n: enc.length });
  for (const [t, x, y] of enc) bent(t, x, y, { face: -1, enc: 'THE FAR BANK' });
  Bp.coins([274, G], [283, G], [290, G], [299, G], [306, G], [312, G]);                              // along the decks: every gap has a coin past it
  for (const [kind, x, y, v] of [['brokenSpears', 268, G, 0], ['fallenBanner', 322, G, 1], ['bones', 285, bed - 1, 0], ['bones', 308, bed - 1, 1], ['stuckShield', 291, bed - 1, 0]]) bent('deco', x, y, { kind, v });
  /* THE TOLD VOLLEY over the bridges (stepField in src/unburied-foes.js): px, the stretch it covers; period, whistle and fall in seconds */
  R.bridgeVolley = { x0: c0 * TS, x1: (c1 + 1) * TS, period: 4.6, whistle: 1.2, spread: 44, r: 12 };
  for (const s of SET) Bp.ent('deco', s.x, s.y, Object.assign({ kind: s.kind }, s.o));   /* the set pieces */
  R.ubFires = FIRE_AT.map(f => ({ x: f.x * TS + 8, y: (GEOM.G + 3) * TS, w: 40, h: 24 }));   /* live flame on the burning wagons' beds */
  R.noDress = SET.map(bbox).map(b => [b.x0 - 1, b.x1 + 1, b.y0 - 1, b.y1 + 1]);   /* the sprinkler leaves them be */
  R.structures.push(...DECK_RUNS.map(([x, row, n]) => ({ x0: x, x1: x + n - 1, top: row + 1, floor: GEOM.G + 6, kind: 'ubtrestle' })));   /* B9: every plank of the gun-deck stands on a trestle */
  R.facades = (R.facades || []).concat([[228, 264, 17, 36, 'ubtower']]);   /* THE TOPPLED TOWER, drawn */
  R.unburied = TILEKIT;   /* the field's own tile kit reads this (src/redraw/unburied_tiles.js; main.js hooks it beside the canal's and the theatre's) */
  return Bp.done();
}
