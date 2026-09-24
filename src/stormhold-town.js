// ============================================================================================
// LEVEL 10 - STORMHOLD, THE CASTLE TOWN (docs/briefs/stormhold-town.md).
// What is left of the goblins after Kingswood, the Stockade and the crags has fallen back up the
// mountain and taken a town that is not theirs: stone houses, a market square, a wall with towers on
// it, and the Queen's castle over all of it in the snow.
//
// THE ONE SENTENCE: STORMHOLD IS LOCKED FROM ABOVE. Every gate's key hangs at the top of a watchtower,
// and the tower's rope is the way back down to its gate. Three towers, three keys, three gates:
//   THE GATE WATCH  (timber, outside the barbican)  the brass key  -> the barbican gate      @ 84
//   THE BELL WATCH  (stone, over the close)         the iron key   -> the inner gate        @ 346
//   THE WALL WATCH  (timber, on the curtain wall)   the bone key   -> the bridge gate       @ 542
// Every tower is LEFT of its gate (a rope runs east: updateTowerSlides), every gate column is sealed from
// the indoor band to the street, and every tower has a ladder back down (the reach model does not ride a
// rope, so nothing depends on one).
//
// Seven sections (F1): THE ROAD IN 0-89, THE MARKET SQUARE 90-179, SMOKE ROW 180-269, THE BELL CLOSE
// 270-349, THE HALLS 350-429, THE CURTAIN WALL 430-543, THE LONG BRIDGE 544-671.
// Rows 0-18 are the indoor band (house interiors). The street steps up the mountain: the road stands on
// row 35, the town on 31, the Halls on 29, the wall-walk on 28, the bridge on 29; the gorge floor on 43.
// ============================================================================================
export const STORM_TOWN = {
  W: 672, H: 46,
  GATES: { brass: 84, iron: 346, bone: 542 },
  BRIDGE: 544,                 // P0, the first pier; the bone gate is two columns west of it
  SECTIONS: [{ name: 'THE ROAD IN', x0: 0, x1: 89 }, { name: 'THE MARKET SQUARE', x0: 90, x1: 179 }, { name: 'SMOKE ROW', x0: 180, x1: 269 },
    { name: 'THE BELL CLOSE', x0: 270, x1: 349 }, { name: 'THE HALLS', x0: 350, x1: 429 }, { name: 'THE CURTAIN WALL', x0: 430, x1: 543 },
    { name: 'THE LONG BRIDGE', x0: 544, x1: 671 }],
};

export function stormholdTown({ painter, T, TS }) {
  const { W, H } = STORM_TOWN;
  const L = painter(W, H);
  const { block, floor, plat, ent, coins, set } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const interiors = [], bridges = [], roofs = [], masonry = [], facades = [], ladders = [];
  const gateCol = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.PORT); };
  const room = (x0, x1, y0, y1, st = 'stone') => { air(x0, x1, y0, y1); interiors.push([x0, x1, y0, y1, st]); };
  const roof = (x0, x1, y) => { block(x0, x1, y - 2, y); roofs.push([x0, x1, y]); };   // three courses of slate, a house under it, and a road on top
  const ladder = (x, y0, y1) => ladders.push([x, y0, y1]);                              // hung LAST (RULES I): nothing is dug after them
  const span = (x0, x1, y, o) => { const opt = o || {};
    for (let x = x0; x <= x1; x++) set(x, y, opt.give ? T.SHELF : T.PLANK);
    bridges.push({ x: x0, x1, y, sway: opt.sway || 0, cut: !!opt.cut });
    ent('deco', x0, y - 1, { kind: 'bridgepost' }); ent('deco', x1, y - 1, { kind: 'bridgepost' }); };
  block(0, W - 1, 0, 18);   // the indoor band is solid rock; every room is cut out of it

  // ---- THE HOUSES' INSIDES (the band). The keys are not in them any more: the hill folk and the loot are. ----
  room(6, 30, 6, 13, 'hall');   // THE HEARTH HOUSE, open on the latch: the doorway teaches itself
  ent('doorway', 9, 13, { id: 'hearth-in', to: 'hearth-out', lock: [6, 30], label: 'THE HEARTH HOUSE' });
  ent('torch', 12, 13); ent('brazier', 20, 13); ent('deco', 26, 13, { kind: 'barrels' });
  ent('hearthgob', 18, 13, { face: -1 });
  ent('doorway', 29, 13, { id: 'hearth-back', to: 'hearth-far', lock: [6, 30], label: 'OUT THE BACK' });
  coins([12, 12], [16, 12], [20, 12], [23, 12], [24, 12], [25, 12], [26, 11], [27, 12]);
  ent('sign', 7, 13, { text: 'HEARTH GOBLINS SLEEP BY THE FIRE UNTIL YOU COME CLOSE.' });
  room(38, 66, 6, 14, 'stone');   // THE SMITHY: the forge breathes up to the shelf, and the first of the hill folk is on it
  ent('doorway', 41, 14, { id: 'smithy-in', to: 'smithy-out', lock: [38, 66], label: 'THE SMITHY' });
  ent('brazier', 46, 14); ent('deco', 52, 14, { kind: 'anvil' }); ent('torch', 60, 14);
  ent('hearthgob', 50, 14, { face: -1 }); ent('hearthgob', 58, 14, { face: -1 }); ent('miner', 62, 14, { face: -1 });
  plat(47, 13, 3); plat(50, 11, 3); plat(54, 10, 4);
  coins([44, 13], [48, 13], [52, 13], [56, 9], [58, 9], [60, 13], [63, 13], [64, 13]);
  ent('stray', 56, 9, { kind: 'folk' });
  ent('vent', 52, 14, { heat: true, h: 90, period: 3.4, on: 1.5, lift: 240, w: 12 });
  ent('doorway', 65, 14, { id: 'smithy-back', to: 'smithy-far', lock: [38, 66], label: 'OUT THE SLACK-TUB DOOR' });
  ent('sign', 39, 14, { text: 'THE SMITHY. THE BACK DOOR IS PAST THE SHELF.' });
  room(74, 98, 6, 13, 'earth');   // THE TANNERY: hides on racks you climb, and the second of the hill folk under the spider
  ent('doorway', 77, 13, { id: 'tan-in', to: 'tan-out', lock: [74, 98], label: 'THE TANNERY' });
  ent('torch', 82, 13); ent('hearthgob', 88, 13, { face: -1 }); ent('spider', 92, 7, { drop: 90 });
  ent('stray', 95, 13, { kind: 'folk' }); coins([80, 12], [84, 12], [88, 12], [90, 12], [92, 12], [93, 12]);
  plat(80, 11, 3); plat(85, 9, 3); plat(90, 11, 3); coins([81, 10], [86, 8], [91, 10]);
  for (const x of [79, 84, 89, 94]) ent('deco', x, 6, { kind: 'banner', v: x % 2, hang: true });
  ent('sprig', 82, 13, { face: 1 }); ent('sprig', 88, 13, { face: -1 });
  ent('doorway', 97, 13, { id: 'tan-back', to: 'tan-far', lock: [74, 98], label: 'OUT PAST THE PITS' });
  room(106, 160, 4, 15, 'hall');   // THE LONGHOUSE: the officers' feast, three chandeliers to cut down, the last of the hill folk in the rafters
  ent('doorway', 109, 15, { id: 'long-in', to: 'long-out', lock: [106, 160], label: 'THE LONGHOUSE' });
  ent('torch', 114, 15); ent('brazier', 124, 15); ent('brazier', 142, 15); ent('torch', 154, 15);
  ent('hearthgob', 120, 15, { face: -1 }); ent('hearthgob', 134, 15, { face: 1 }); ent('brute', 146, 15, { face: -1 });
  plat(112, 14, 3); plat(115, 12, 3); plat(118, 11, 4); plat(123, 10, 3); plat(128, 8, 5); plat(136, 10, 4); ent('archer', 129, 7, { face: -1 });
  ent('stray', 130, 7, { kind: 'folk' });
  ent('doorway', 159, 15, { id: 'long-back', to: 'long-far', lock: [106, 160], label: 'OUT THE GABLE END' });
  coins([116, 10], [120, 10], [126, 7], [130, 7], [137, 9], [139, 9], [150, 14], [154, 14], [155, 14], [156, 14], [157, 14]);
  for (const x of [121, 138, 152]) ent('weight', x, 4, { len: 4, lamp: true, hang: true });
  plat(124, 14, 5); plat(142, 14, 5); ent('sapper', 146, 15, { face: -1 }); ent('hearthgob', 128, 15, { face: 1 });
  ent('sign', 107, 15, { text: 'THE LONGHOUSE. CUT A CHANDELIER DOWN ON WHOEVER IS UNDER IT.' });

  // ============================ 1. THE ROAD IN (0-89): the road under the wall, and THE GATE WATCH ============================
  floor(0, 89, 36);
  ent('sign', 4, 35, { text: 'STORMHOLD. THE GATES ARE LOCKED, AND EVERY KEY HANGS IN A WATCHTOWER.' });
  ent('npc', 8, 35, { kind: 'squire' });
  roof(14, 26, 31);   // the Hearth House
  ent('doorway', 17, 35, { id: 'hearth-out', to: 'hearth-in', kind: 'goblin' });
  ent('doorway', 23, 35, { id: 'hearth-far', to: 'hearth-back', kind: 'goblin' });
  ent('sign', 12, 35, { text: 'THIS DOOR IS ON THE LATCH. STAND IN A DOORWAY AND PRESS E.' });
  ent('torch', 11, 35); ent('check', 29, 35);
  ent('sprig', 31, 35, { face: -1 }); ent('shield', 36, 35, { face: -1 });
  coins([6, 34], [10, 34], [28, 34], [33, 33], [37, 34]);
  // THE GATE WATCH: two rope ladders in a switchback, a landing between them, and a Scalder over the upper one.
  // The landing is out of his reach: that is the lesson (step off the ladder when the pot tips).
  const T1 = { x0: 40, x1: 47, top: 23, floor: 36, kind: 'timber', key: 'brass', gate: STORM_TOWN.GATES.brass, name: 'THE GATE WATCH' };
  plat(T1.x0, T1.top, T1.x1 - T1.x0 + 1);   // the top deck
  plat(41, 30, 5);                          // the landing
  ladder(46, 30, 35); ladder(41, 23, 30);   // up the east side to the landing, up the west side to the deck: the rope leaves from the east edge, clear of the ladder's top
  ent('sprig', 44, 29, { face: -1 });
  ent('scalder', 41, 22, { face: 1, post: [41, 41] });
  ent('key', 44, 22, { kind: 'brass' }); ent('brazier', 40, 22);
  ent('sign', 39, 35, { text: 'THE GATE WATCH HOLDS THE BRASS KEY. WHEN THE POT TIPS, GET OFF THE LADDER.' });
  coins([43, 29], [45, 29], [46, 26], [45, 22]);
  roof(56, 68, 31);   // a shut cottage under the tower's rope
  ent('deco', 52, 35, { kind: 'lanternPost' }); ent('archer', 62, 28, { face: -1 });
  ent('sprig', 72, 35, { face: -1 }); ent('hound', 60, 35, { face: -1 }); ent('hound', 66, 35, { face: -1 }); ent('check', 76, 35);   /* the gate's dogs, loose on the road */
  coins([54, 34], [58, 34], [64, 34], [70, 34], [74, 34]);
  // THE BARBICAN: the wall's gatehouse, sealed from the band to the arch; the brass gate in its passage
  block(82, 88, 19, 29); masonry.push([82, 88, 19, 29]);
  ent('lockgate', 84, 35, { needs: 'brass', h: 6 }); gateCol(84, 30, 35);
  block(87, 89, 34, 35);   // the step up into the town
  facades.push([77, 81, 20, 35, 'tower', { town: true, roof: true }], [90, 94, 20, 31, 'tower', { town: true, roof: true }]);
  ent('sign', 79, 35, { text: 'THE BARBICAN. ITS KEY IS UP THE GATE WATCH: FOLLOW THE ROPE.' });

  // ============================ 2. THE MARKET SQUARE (90-179): stalls, a well, the ambush, the roof road ============================
  floor(90, 179, 32);
  roof(91, 97, 27);   // the chandler's, against the wall
  ent('check', 95, 31);
  // the square itself (the ambush room, 98-138: AMBUSH.storm in level.js) - a town's furniture with a goblin army camped in it
  for (const [k, x, v] of [['counter', 103, 0], ['wares', 108, 0], ['kegStack', 113, 0], ['well', 119, 0], ['counter', 125, 0], ['wares', 129, 1], ['hayBale', 133, 0], ['cart', 136, 0]]) ent('deco', x, 31, { kind: k, v });   /* the traders' counters and shelves, a well, a cart come in with hay */
  ent('deco', 101, 31, { kind: 'lanternPost' }); ent('deco', 137, 31, { kind: 'lanternPost' });
  for (const x of [104, 118, 132]) ent('deco', x, 22, { kind: 'bunting', hang: true });
  coins([102, 30], [106, 30], [110, 29], [116, 30], [122, 29], [128, 30], [134, 30]);
  ent('sign', 99, 31, { text: 'THE MARKET SQUARE. THE GOBLINS KEEP THEIR SERJEANT HERE.' });
  facades.push([98, 138, 24, 31, 'townrow']);   /* the houses round the square, behind it */
  // the rows beyond it, and the ROOF ROAD over them: up the lean-to at the Smithy's east end, back west along the slates
  roof(139, 151, 27); roof(154, 170, 27);   // the cooper's and the Smithy
  ent('doorway', 157, 31, { id: 'smithy-out', to: 'smithy-in', kind: 'goblin' });
  ent('doorway', 168, 31, { id: 'smithy-far', to: 'smithy-back', kind: 'goblin' });
  plat(171, 29, 3); plat(172, 27, 2);
  ent('archer', 146, 24, { face: 1 }); ent('stormshaman', 162, 24, { face: -1 });
  ent('silver', 140, 23); coins([142, 24], [148, 24], [152, 23], [156, 24], [160, 24], [166, 24], [170, 24]);
  ent('shield', 146, 31, { face: -1 }); ent('hearthgob', 151, 31, { face: -1 }); ent('brute', 162, 31, { face: -1 }); ent('sapper', 176, 31, { face: -1 }); ent('check', 173, 31);
  ent('sign', 170, 31, { text: 'THE ROOFS ARE A ROAD. UP THE LEAN-TO.' });

  // ============================ 3. SMOKE ROW (180-269): forges, the tannery, THE CHIMNEYS ============================
  floor(180, 269, 32);
  ent('sign', 181, 31, { text: 'SMOKE ROW. THEY WORK IRON FOR THE CASTLE HERE.' });
  ent('deco', 185, 31, { kind: 'forge' }); ent('brazier', 189, 31);
  roof(192, 206, 27);   // the tannery
  ent('doorway', 195, 31, { id: 'tan-out', to: 'tan-in', kind: 'goblin' });
  ent('doorway', 204, 31, { id: 'tan-far', to: 'tan-back', kind: 'goblin' });
  ent('hearthgob', 199, 31, { face: -1 });
  roof(210, 222, 27);   // a forge house
  ent('brute', 214, 31, { face: -1 }); ent('sapper', 220, 31, { face: -1 }); ent('brazier', 208, 31);
  ent('check', 190, 31);
  coins([184, 30], [194, 30], [202, 30], [212, 30], [218, 30], [224, 30]);
  // THE CHIMNEYS: the old sootworks gorge. The span is down; the stacks stand a hop apart and the sweeps live in them.
  air(228, 252, 32, 43);
  for (const [x0, top] of [[230, 31], [234, 29], [239, 30], [243, 29], [248, 30]]) { block(x0, x0 + 1, top, 43); ent('chimpot', x0 + 1, top - 1); }   // up-hops are two tiles, drops three
  ladder(228, 32, 43); for (const [lx, top] of [[232, 31], [236, 29], [241, 30], [245, 29], [252, 32]]) ladder(lx, top, 43);   // a rope ladder down every shaft
  ent('sweep', 234, 28, { face: -1 }); ent('sweep', 243, 28, { face: -1 });
  ent('deco', 227, 31, { kind: 'lanternPost' }); ent('deco', 254, 31, { kind: 'lanternPost' });
  ent('sign', 225, 31, { text: 'THE SPAN IS DOWN: CLIMB THE STACKS. EVERY SHAFT HAS A LADDER.' }); ent('check', 223, 31);
  coins([232, 28], [235, 27], [240, 28], [244, 27], [246, 27], [251, 29], [237, 40], [246, 40]);
  ent('rockgoblin', 262, 31, { face: -1 }); ent('check', 258, 31);
  coins([257, 30], [264, 30], [268, 30]);

  // ============================ 4. THE BELL CLOSE (270-349): THE BELL WATCH ============================
  floor(270, 349, 32);
  // the roof way: a lean-to, two roofs stepping up, and a window halfway up the tower (skips the first Scalder)
  plat(267, 30, 2); plat(269, 28, 2); roof(272, 281, 29); roof(284, 292, 27);
  // THE BELL WATCH: stone, over the street (you walk through its arch), three ladders inside with the floors alternating
  const T2 = { x0: 296, x1: 303, top: 21, floor: 32, kind: 'stone', key: 'iron', gate: STORM_TOWN.GATES.iron, name: 'THE BELL WATCH' };
  block(296, 296, 19, 27); block(303, 303, 22, 27); masonry.push([296, 303, 19, 27]);
  air(296, 296, 22, 24);            // the west window, off the second roof
  air(303, 303, 23, 24);            // the east window, where the archer across the close can see in
  plat(297, 28, 6); plat(297, 25, 6); plat(297, 21, 7);   // the first floor, the second floor, the belfry deck (out through the east arch)
  ladder(297, 28, 31); ladder(302, 25, 27); ladder(297, 21, 24);
  ent('scalder', 298, 27, { face: -1, post: [298, 298] });   // over the first ladder
  ent('scalder', 301, 20, { face: -1, post: [301, 302] });   // over the second
  ent('key', 299, 20, { kind: 'iron' }); ent('brazier', 298, 20);
  ent('silver', 297, 24);
  facades.push([297, 302, 19, 31, 'tower', { town: true, lit: false }]);
  ent('sign', 294, 31, { text: 'THE BELL WATCH HOLDS THE IRON KEY. IN BY THE ARCH, OR OVER THE ROOFS.' });
  ent('check', 274, 31); coins([270, 28], [275, 26], [279, 26], [286, 24], [290, 24], [299, 27], [300, 24], [298, 20]);
  // the close: a churchyard under the tower, the east house and its archer, and the inner wall
  facades.push([315, 337, 24, 31, 'townrow']);
  for (const [x, v] of [[312, 0], [318, 1], [324, 2], [330, 0]]) ent('deco', x, 31, { kind: 'grave', v });
  ent('deco', 336, 31, { kind: 'yew', v: 1 });
  roof(306, 314, 27); ent('archer', 311, 24, { face: -1 });
  ent('check', 306, 31); ent('shield', 320, 31, { face: -1 }); ent('sprig', 327, 31, { face: -1 }); ent('pike', 316, 31, { face: -1 }); ent('rockgoblin', 334, 31, { face: -1 });
  coins([316, 30], [322, 30], [330, 29], [338, 30]);
  block(344, 348, 19, 26); masonry.push([344, 348, 19, 26]);
  ent('lockgate', 346, 31, { needs: 'iron', h: 5 }); gateCol(346, 27, 31);
  ent('check', 340, 31);
  ent('sign', 342, 31, { text: 'THE INNER GATE. ITS KEY IS IN THE BELL WATCH.' });
  facades.push([338, 343, 20, 31, 'tower', { town: true, roof: true }], [349, 353, 20, 29, 'tower', { town: true, roof: true }]);

  // ============================ 5. THE HALLS (350-429): the officers' houses, the Longhouse, THE KEEP GATE ============================
  floor(347, 429, 30);
  ent('check', 351, 29);
  ent('sign', 353, 29, { text: 'THE HALLS. THE OFFICERS FEAST IN THE LONGHOUSE.' });
  roof(355, 370, 25);   // the Longhouse
  ent('doorway', 358, 29, { id: 'long-out', to: 'long-in', kind: 'cottage' });
  ent('doorway', 368, 29, { id: 'long-far', to: 'long-back', kind: 'cottage' });
  roof(374, 384, 25);
  ent('deco', 372, 29, { kind: 'banner', v: 0 }); ent('deco', 386, 29, { kind: 'banner', v: 1 }); ent('torch', 356, 29); ent('torch', 385, 29);
  ent('brute', 376, 29, { face: -1 }); ent('archer', 382, 29, { face: -1, fire: true });
  coins([356, 28], [362, 27], [366, 28], [372, 27], [378, 28], [384, 27]);
  // THE KEEP GATE (F5): a portcullis held up on a winch. Strike the winch and it drops on whatever is under it; it winds
  // itself back up. The pikes come through that passage.
  block(396, 402, 19, 25); masonry.push([396, 402, 19, 25]);
  ent('winch', 393, 29, { gate: 399, gy0: 26, gy1: 29, drop: true, hold: 6 });
  ent('sign', 390, 29, { text: 'THE KEEP GATE. STRIKE THE WINCH AND IT DROPS ON WHAT IS UNDER IT.' });
  ent('check', 388, 29);
  ent('pike', 405, 29, { face: -1 }); ent('pike', 411, 29, { face: -1 }); ent('shield', 417, 29, { face: -1 });
  ent('torch', 404, 29); ent('deco', 422, 29, { kind: 'banner', v: 0 });
  facades.push([403, 429, 22, 29, 'townrow'], [0, 12, 28, 35, 'townrow'], [27, 38, 28, 35, 'townrow']);
  ent('check', 425, 29); coins([392, 28], [399, 28], [408, 28], [414, 28], [420, 28], [426, 28]);

  // ============================ 6. THE CURTAIN WALL (430-543): the gorge, the wall face, the walk, THE WALL WATCH ============================
  // (the agreed greybox, src/draft/curtain-wall.js, rebuilt in place: no hoist, no rods, no Gate Serjeant - see the brief §12)
  block(430, 431, 30, 45);   // the sally pier
  block(432, 499, 44, 45);   // the gorge floor, under the wall
  for (const [x, y] of [[433, 32], [435, 34], [437, 36], [439, 38], [441, 40], [443, 42]]) plat(x, y, 2);   // THE SALLY STAIR, two rows a step
  block(452, 454, 42, 43); block(463, 464, 43, 43);   // rubble off the wall
  ent('sign', 431, 29, { text: 'THE WAY ON IS OVER THE CURTAIN WALL. DOWN, THEN UP ITS FACE.' });
  ent('check', 446, 43);
  ent('sprig', 450, 43, { face: -1 }); ent('sapper', 458, 43, { face: -1 }); ent('shield', 470, 43, { face: -1 }); ent('sprig', 478, 43, { face: -1 });
  coins([445, 42], [453, 40], [460, 42], [468, 42], [476, 42], [484, 42]);
  // the face: the masons' scaffold still stands against the wall, so the climb zig-zags between its boards and the
  // wall's own sills, two rows a step. A Scalder on the hoarding over the wall's sills: the wall side is poured on, the
  // scaffold side is not.
  const scaffold = { x0: 490, x1: 494, top: 30, floor: 44, kind: 'timber', scaffold: true };
  for (const y of [40, 36, 32, 30]) plat(491, y, 3);   // the scaffold's boards
  for (const y of [42, 38, 34]) plat(496, y, 4);       // wall sills
  plat(496, 29, 4);                                    // the hoarding at the wall top
  block(500, 530, 29, 45); masonry.push([500, 530, 29, 45]);
  ent('scalder', 498, 28, { face: -1, post: [496, 499] });
  ent('sign', 486, 43, { text: 'THE WALL. HE POURS DOWN THE WALL SIDE ONLY: WAIT ON THE SCAFFOLD.' });
  ent('harpy', 494, 33);
  coins([492, 39], [497, 37], [492, 35], [497, 33], [492, 31], [497, 28]);
  facades.push([500, 522, 20, 28, 'curtain', { town: true }]);
  // the wall-walk: two wall towers with a bowman on each, and the shield-wall on the walk (ELITES.storm holds its gate at 523)
  block(508, 510, 27, 28); block(517, 519, 27, 28); masonry.push([508, 510, 27, 28], [517, 519, 27, 28]);
  ent('archer', 509, 26, { face: -1, fire: true }); ent('archer', 518, 26, { face: -1 });
  ent('check', 503, 28);
  coins([505, 27], [512, 27], [515, 27], [521, 27]);
  // THE WALL WATCH: timber, on the wall's east end; a switchback like the Gate Watch, a Scalder over the upper ladder
  const T3 = { x0: 524, x1: 530, top: 22, floor: 29, kind: 'timber', key: 'bone', gate: STORM_TOWN.GATES.bone, name: 'THE WALL WATCH' };
  plat(T3.x0, T3.top, T3.x1 - T3.x0 + 1); plat(525, 25, 4);
  ladder(529, 25, 28); ladder(525, 22, 25);
  ent('scalder', 525, 21, { face: 1, post: [525, 525] });
  ent('key', 528, 21, { kind: 'bone' }); ent('brazier', 524, 21);
  ent('sign', 521, 28, { text: 'THE WALL WATCH HOLDS THE BONE KEY. THE ROPE GOES DOWN TO THE BRIDGE GATE.' });
  coins([527, 24], [528, 24], [527, 21]);
  // the bridgehead yard, and the bridge gate
  floor(531, 543, 30);
  block(540, 543, 19, 24); masonry.push([540, 543, 19, 24]);
  ent('lockgate', STORM_TOWN.GATES.bone, 29, { needs: 'bone', h: 5 }); gateCol(STORM_TOWN.GATES.bone, 25, 29);
  ent('check', 534, 29); ent('deco', 537, 29, { kind: 'lanternPost' });
  facades.push([535, 539, 20, 29, 'tower', { town: true, roof: true }]);

  // ============================ 7. THE LONG BRIDGE (544-671): seven spans, six piers, and the Queen's Lance ============================
  // one height the whole way, so his charge has one line to run and the piers are the rhythm (unchanged, shifted right)
  const BY = 30, P0 = STORM_TOWN.BRIDGE;
  ent('check', P0 + 2, BY - 1);
  ent('sign', P0, BY - 1, { text: 'THE QUEEN\'S LANCE CANNOT TURN MID-CHARGE. STAND ON A LOOKOUT AND LET HIM PASS.' });
  for (let k = 0; k < 7; k++) { const px0 = P0 + k * 18, px1 = px0 + 4;
    block(px0, px1, BY, 45);
    if (k > 0) { const s0 = px0 - 13, s1 = px0 - 1; span(s0, s1, BY, { sway: k >= 3 ? 2 : 1 }); }
    if (k >= 1 && k <= 5) { ent('deco', px0 + 2, BY - 1, { kind: 'bridgetower' }); plat(px0, BY - 3, 5); ent('brazier', px0 + 4, BY - 4); }   // a lookout on every tower pier
    if (k > 0) ent('weight', px0 - 7, BY - 9, { len: 6, lamp: true });   // a fire cage over every span: cut its chain as he goes under it
  }
  span(P0 + 113, P0 + 121, BY, { sway: 2 });   // the last span, to the gatehouse
  ent('archer', P0 + 20, BY - 1, { face: 1, fire: true }); ent('archer', P0 + 56, BY - 1, { face: -1, fire: true });
  ent('rockgoblin', P0 + 92, BY - 1, { face: -1 }); ent('archer', P0 + 110, BY - 1, { face: -1, fire: true });
  for (const x of [8, 26, 44, 62, 80, 98]) { ent('deco', P0 + x, BY - 1, { kind: 'lanternPost' }); coins([P0 + x + 4, BY - 2]); }
  ent('silver', P0 + 71, BY - 2);
  block(W - 2, W - 1, 20, 45); floor(P0 + 122, W - 1, BY);
  ent('deco', W - 4, BY - 1, { kind: 'gatehouse' }); ent('gate', W - 3, BY - 1);
  ent('lance', P0 + 18, BY - 1);

  // ---- THE TOWERS' ROPES: from each top deck's east edge down to the foot of its own gate. UP grabs, JUMP lets go. ----
  const rope = (x0, top, x1, endRow, groundRow) => ({ x0: x0 * TS + 8, y0: top * TS - 12, x1: x1 * TS + 8, y1: endRow * TS - 12,
    posts: [[x0 * TS + 8, top * TS - 12, top * TS], [x1 * TS + 8, endRow * TS - 12, groundRow * TS]] });
  const zipLines = [rope(47, T1.top, 80, 31, 36), rope(302, T2.top, 342, 27, 32), rope(530, T3.top, 538, 26, 30)];
  const watchtowers = [T1, T2, T3];

  // THE LADDERS, LAST: nothing is dug after this line
  for (const [x, y0, y1] of ladders) for (let y = y0; y <= y1; y++) set(x, y, T.NET);

  // THE HOUSES. Every roof has a house under it, walls down to the street: stone below, a timber jetty under the eaves.
  const houses = roofs.map(([x0, x1, y]) => { const mx = (x0 + x1) >> 1; let fy = y + 1; while (fy < H && L.grid[fy * W + mx] === T.AIR) fy++;
    const drs = L.ents.filter(e => e.t === 'doorway' && !e.lock && e.y === fy - 1 && e.x > x0 && e.x < x1).map(e => e.x);
    return { x0: x0 + 1, x1: x1 - 1, y0: y + 1, y1: fy - 1, door: drs.length ? drs[0] : null, door2: drs.length > 1 ? drs[1] : null, seed: x0, stone: true }; }).filter(h => h.y1 >= h.y0 + 1);

  return {
    watchtowers, structures: [...watchtowers.filter(t => t.kind === 'timber'), scaffold], zipLines, ropes: zipLines,
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 35 }, pools: [], falls: [], moversExtra: [], interiors, bridges, houses, masonry, facades, masonryKit: 'limestone', climbLook: true,
    calm: [[39, 48, 21, 35], [295, 304, 18, 31], [487, 500, 27, 43], [523, 531, 20, 28]],   /* the climbs carry their own authored encounters: the garrison stays off them (F4: a climb, then a fight) */
    playtestSections: STORM_TOWN.SECTIONS,
    indoorRow: 18,   // rows 0-18 are the insides of the houses: the camera never shows them from the street, nor the street from inside
    duskStart: -1, duskLen: 1, music: 'stormhold', night: true, glowNight: true, nightA: 0.26,
    quest: { n: 3, item: 'folk', name: 'HILL FOLK', npc: 'squire', done: 'THEY ARE OUT OF THEIR CELLARS', reward: 'relic', relic: 'shoes' },
    palette: { set: 'village', sky: 'crag', far: 'crag', mid: 'crag', near: 'crag', dress: 'crag', haze: 'rgba(150,160,200,0.16)',
      grass: '#cfd8e2', grassL: '#eef4ff', grassD: '#9aa8bc', dirt: '#4a4a58', dirtL: '#62626e', dirtD: '#32323c',
      canopy: ['#3a3a48', '#4a4a5a', '#5a5a6c', '#6a6a80'] },
    weather: [{ x0: 0, x1: 99999, kind: 'snow' }], ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    castle: true,   // the castle grows over the whole level: drawn behind everything
    arena: { x0: P0 * TS, x1: (W - 1) * TS, floor: BY * TS, trigger: (P0 + 6) * TS, wallL: P0 - 1, wallR: W - 1, boss: 'lance', music: 'musCastle', tint: '#6a7a9a', tintA: 0.10, fx: 'dust' },
  };
}
