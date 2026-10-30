import { lanceLookouts } from './lance-support.js';
// ============================================================================================
// LEVEL 10 - STORMHOLD 3, THE OUTER WORKS (claude/stormhold3; scratch/brief-stormhold3-1024.md, Daniel 10-24 live:
// "not sure the enterable buildings make sense ... other ideas to make it look like a castle approach?").
// RULE OF THE ROAD: STORMHOLD = OUTSIDE THE WALLS; THE KITCHEN GATE = FIRST TIME INSIDE THE CASTLE; HIGHCROWN = HER COURT.
// So there are NO INTERIORS here any more: the indoor band (rows 0-18), the houses, the doorways and the market town are
// gone. What is left is a switchback road climbing UNDER the castle's walls, the castle growing on the skyline as you go.
//
// THE ONE SENTENCE (kept): THREE GATES. EVERY KEY HANGS IN A WATCHTOWER. The towers are climbed from OUTSIDE now - the
// masons' scaffolds still stand against their faces - the key is at the top, and the tower's rope rides you back down to
// its gate. Three towers, three keys, three gates:
//   THE GATE WATCH  (the road)        the brass key -> THE BARBICAN gate     @ GATES.brass
//   THE BELL WATCH  (the bailey)      the iron key  -> THE INNER GATE        @ GATES.iron   (its rope goes over the dry moat)
//   THE WALL WATCH  (the curtain)     the bone key  -> THE BRIDGE GATE       @ GATES.bone   (the gatehouse's far end)
// Every tower is LEFT of its gate (a rope runs east: updateTowerSlides), and every tower has ladders back down (the reach
// model does not ride a rope down, so nothing depends on one - except the moat, which the reach model's rope crosses).
//
// SEVEN SECTIONS (each ends at its exam's shrine, A10c - the Rootway recipe; claude/lance4 lane 2, STORMHOLD 4: +180 for THE HAUL LINES):
//   1. THE ROAD IN      0-91     the failed siege's camp debris, the Gate Watch, the gate dogs   (no shrine: the road is short)
//   2. THE BARBICAN     92-150   the outer gate's passage, MURDER HOLES overhead (told drops: strike one
//                                loose on whoever is under it - the Lance's own verb, taught small)    -> shrine @ 152
//   3. THE OUTER BAILEY 151-267  stables, carts, the smithy yard (open air), the rope walkway and its
//                                cutter, the first ALARM, the Bell Watch, the dry moat                 -> shrine @ 254
//   4. THE CURTAIN WALL 268-395  the sally stair into the ditch, the wall face on the masons' scaffold,
//                                THE WALL-WALK (A14's platforming exam: breached hoardings, arrow-slit
//                                towers, a pike on the walk), the Wall Watch                         -> shrine @ 388 (its deck)
//   5. THE HAUL LINES   396-575  the masons' ropes over THE KING'S DITCH: two lines taught over its flat bottom, three over the
//                                spiked gorge with THE MANGONEL throwing (a ring on your rope), a line it parts, THE BARBICAN
//                                TOWER and its engine to wreck                                        -> shrine @ 579
//   6. THE GATEHOUSE    576-669  THE GATEHOUSE BELL (ring it: they run to it, the gate drops on them), THE STORM LANCE
//                                (the Storm Chapter's knight), the bridgehead exam: a gate tower and its bell
//   7. THE LONG BRIDGE  670-797  THE QUEEN'S LANCE, and the MAIN GATE that shuts when he falls (-> the Kitchen Gate)
// The road climbs: the camp on row 37, the road 36, the bailey 34, the ditch 44, the wall-walk 29, the bridge 30.
// ============================================================================================
const H0 = 396;      // THE HAUL LINES' first column (claude/lance4 lane 2, STORMHOLD 4)
const G0 = H0 + 180; // THE GATEHOUSE's first column (the gatehouse is laid in G0 offsets: it moved +180 as one)
const P0 = G0 + 94;  // the Long Bridge's first pier
export const STORM_TOWN = {
  W: P0 + 128, H: 46, G0,
  GATES: { brass: 94, iron: 262, bone: P0 - 2 },
  BRIDGE: P0,
  SECTIONS: [{ name: 'THE ROAD IN', x0: 0, x1: 91 }, { name: 'THE BARBICAN', x0: 92, x1: 150 }, { name: 'THE OUTER BAILEY', x0: 151, x1: 267 },
    { name: 'THE CURTAIN WALL', x0: 268, x1: H0 - 1 }, { name: 'THE HAUL LINES', x0: H0, x1: G0 - 1 }, { name: 'THE GATEHOUSE', x0: G0, x1: P0 - 1 }, { name: 'THE LONG BRIDGE', x0: P0, x1: P0 + 127 }],
};

export function stormholdTown({ painter, T, TS }) {
  const { W, H } = STORM_TOWN;
  const L = painter(W, H);
  const { block, floor, plat, ent, coins, set } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const bridges = [], masonry = [], facades = [], ladders = [], scaffolds = [];
  const gateCol = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.PORT); };
  const laid = (x0, x1, y0, y1) => { block(x0, x1, y0, y1); masonry.push([x0, x1, y0, y1]); };   // what the masons built: coursed ashlar, not crag
  const ladder = (x, y0, y1) => ladders.push([x, y0, y1]);                                      // hung LAST (RULES I): nothing is dug after them
  const span = (x0, x1, y, o) => { const opt = o || {};
    for (let x = x0; x <= x1; x++) set(x, y, opt.give ? T.SHELF : T.PLANK);
    bridges.push({ x: x0, x1, y, sway: opt.sway || 0, cut: !!opt.cut });
    ent('deco', x0, y - 1, { kind: 'bridgepost' }); ent('deco', x1, y - 1, { kind: 'bridgepost' }); };
  const spikesAt = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.SPIKE); };

  // ============================ 1. THE ROAD IN (0-91): the failed siege's camp, THE GATE WATCH ============================
  floor(0, 37, 37);
  ent('sign', 3, 36, { text: 'STORMHOLD. THE GATES ARE LOCKED, AND EVERY KEY HANGS IN A WATCHTOWER.' });
  // the camp the last siege left in the snow: torn tents, a cold fire, a cart with a wheel off, the stakes they never finished
  ent('deco', 9, 36, { kind: 'tent', v: 1 }); ent('deco', 14, 36, { kind: 'campfire' }); ent('deco', 20, 36, { kind: 'cart', v: 1 });
  ent('deco', 25, 36, { kind: 'spearRack' }); ent('deco', 34, 36, { kind: 'stakeFence', v: 1 });
  laid(28, 31, 35, 36);   // a fallen merlon off the outer wall, the first thing to stand on
  plat(5, 34, 5); plat(16, 33, 5);   // the siege's broken mantlets, propped on their stakes: a higher way through the camp
  ent('sprig', 17, 36, { face: -1 }); ent('archer', 29, 34, { face: -1 }); ent('sprig', 23, 36, { face: -1 });
  coins([6, 35], [12, 35], [19, 34], [29, 33], [33, 35]);
  floor(38, 91, 36);
  // THE GATE WATCH: a stone tower outside the outer wall, climbed by the masons' scaffold on its west face - two rope ladders
  // in a switchback, a board between them, the hoarding deck on top. A Scalder over the top ladder: when the pot tips, get off it.
  const T1 = { x0: 43, x1: 52, top: 21, floor: 36, kind: 'stone', key: 'brass', gate: STORM_TOWN.GATES.brass, name: 'THE GATE WATCH' };
  laid(46, 52, 22, 35);
  plat(41, 31, 5); plat(41, 26, 5); plat(43, 21, 10);   // the scaffold's two boards, and the hoarding deck on the tower's top
  ladder(45, 31, 35); ladder(41, 26, 31); ladder(45, 21, 26);
  scaffolds.push({ x0: 40, x1: 45, top: 21, floor: 36, kind: 'timber', scaffold: true });
  ent('shield', 43, 30, { face: 1 });                     // a guard on the first board, between the ladders
  ent('scalder', 45, 20, { face: 1, post: [45, 45] });   // over the top ladder
  ent('key', 49, 20, { kind: 'brass' }); ent('brazier', 51, 20);
  ent('sign', 40, 35, { text: 'THE GATE WATCH HOLDS THE BRASS KEY. WHEN THE POT TIPS, GET OFF THE LADDER.' });
  ent('sign', 52, 20, { text: 'A ROPE RUNS DOWN TO THE GATE. UP TAKES THE HANDLE, JUMP LETS GO, DOWN DROPS.' });   /* THE ZIP LINE's one lesson (src/zipline.js) */
  coins([43, 29], [44, 25], [47, 20], [50, 20]);
  // the road to the barbican: the gate's dogs loose on it, a flyer through the rope's arc, rubble off the wall to hop
  laid(62, 64, 35, 35); laid(75, 76, 34, 35);
  plat(56, 33, 5); plat(63, 30, 4); plat(70, 33, 3);   // the siege's toppled belfry, its two decks still in the snow
  ent('hound', 60, 35, { face: -1 }); ent('hound', 68, 35, { face: -1 }); ent('harpy', 72, 29); ent('shield', 80, 35, { face: -1 });
  ent('deco', 57, 35, { kind: 'lanternPost' }); ent('deco', 84, 35, { kind: 'warStandard', v: 0 });
  coins([58, 34], [63, 33], [70, 34], [76, 32], [82, 34]);
  ent('sign', 89, 35, { text: 'THE BARBICAN. ITS KEY IS UP THE GATE WATCH: FOLLOW THE ROPE.' });

  // ============================ 2. THE BARBICAN (92-150): the outer gate's passage and its MURDER HOLES ============================
  floor(92, 146, 36); laid(90, 97, 22, 29);
  ent('lockgate', STORM_TOWN.GATES.brass, 35, { needs: 'brass', h: 6 }); gateCol(STORM_TOWN.GATES.brass, 30, 35);
  facades.push([87, 89, 20, 35, 'tower', { town: true, roof: true }]);
  // the passage: a vault of laid stone over the road, five rows of headroom, and a hole in it every eight columns. A stone hangs
  // in each: when one SPARKS (!!) it is coming down - step out from under. Strike one loose yourself and it comes down on
  // whoever is under it: the Lance's verb (a weight over his lane), taught in miniature.
  laid(98, 146, 26, 30);
  const holes = [104, 112, 120, 128, 136, 142];
  for (const hx of holes) { air(hx, hx, 27, 30); ent('weight', hx, 27, { len: 4, unstable: true, crane: true }); }
  ent('sign', 99, 35, { text: 'MURDER HOLES OVERHEAD. WHEN A STONE SPARKS, STEP OUT FROM UNDER IT.' });
  ent('sign', 109, 35, { text: 'STRIKE A STONE LOOSE AND IT FALLS ON WHOEVER STANDS UNDER IT.' });
  ent('shield', 111, 35, { face: -1 }); ent('pike', 119, 35, { face: -1 }); ent('sapper', 125, 35, { face: -1 });
  ent('brute', 134, 35, { face: -1 }); ent('hearthgob', 140, 35, { face: -1 });   /* the passage's exam: the brute stands under a hole */
  ent('torch', 101, 33); ent('torch', 117, 33); ent('torch', 132, 33);
  coins([103, 34], [113, 34], [121, 34], [129, 34], [137, 34], [144, 34]);
  laid(147, 150, 35, 35);   // the step up out of the passage into the bailey
  facades.push([144, 146, 18, 25, 'tower', { town: true, roof: true }]);
  ent('check', 152, 33);

  // ============================ 3. THE OUTER BAILEY (151-267): stables, the smithy yard, THE BELL WATCH, the dry moat ============================
  floor(151, 235, 34);
  // THE STABLES: open stalls under a lean-to (a hay loft you can stand on), a higher loft at the end, carts and hay in the yard
  plat(157, 31, 10); plat(169, 28, 6);
  for (const [k, x, v] of [['hayBale', 158, 0], ['trough', 163, 0], ['hayBale', 166, 1], ['cart', 172, 0], ['waterButt', 177, 0]]) ent('deco', x, 33, { kind: k, v });
  ent('deco', 155, 33, { kind: 'lanternPost' }); ent('deco', 189, 33, { kind: 'lanternPost' });
  coins([158, 30], [162, 30], [166, 30], [170, 27], [174, 27]);
  ent('sign', 154, 33, { text: 'THE OUTER BAILEY. THE STABLE YARD IS HELD.' });
  // THE SMITHY YARD: the forge out in the open, its lean-to roof, and THE ROPE WALKWAY off the roof - a span across the yard to a
  // hoarding stub, a cutter working it from the far end (S7, a hard road that pays): the yard below is the safe way past.
  ent('deco', 184, 33, { kind: 'forge' }); ent('deco', 188, 33, { kind: 'anvil' }); ent('brazier', 191, 33); ent('deco', 195, 33, { kind: 'barrels' });
  plat(180, 31, 3); plat(182, 28, 7);   // up the slack-tub stand onto the smithy's lean-to
  span(189, 193, 28, { give: true });
  plat(194, 28, 3); ent('cutter', 195, 27, { face: -1, bridge: 189 });
  ent('silver', 196, 27);
  ent('sign', 181, 33, { text: 'THE ROPE FRAYS WHERE HE STANDS ON IT. DO NOT LINGER, OR TAKE THE YARD.' });
  ent('sapper', 186, 33, { face: -1 }); ent('shield', 199, 33, { face: -1 });
  coins([183, 27], [186, 27], [190, 27], [192, 27]);
  // THE FIRST BELL (the level teaches Highcrown's alarm before Highcrown does): a sentry who runs for it if he sees you, and a grate
  // across the yard if he rings it - catch him, break the bell, or fight the garrison through the grate.
  plat(200, 30, 5); plat(228, 31, 5);   // the bailey wall's fighting steps: over the bell, and over the moat's bowman
  ent('sentry', 205, 33, { section: 'bailey', range: 6, face: -1 });
  ent('bell', 208, 33, { section: 'bailey' });
  ent('sign', 201, 33, { text: 'SENTRIES RUN FOR THEIR BELLS. CATCH HIM, OR BREAK IT FIRST.' });
  // THE BELL WATCH: stone, climbed on the masons' scaffold against its west face - three ladders, two boards, the deck on top.
  // A sentry stands the second board, on the ladder route: ring him and a grate shuts the key off on the deck above, and his watch turns out there.
  const T2 = { x0: 216, x1: 226, top: 18, floor: 34, kind: 'stone', key: 'iron', gate: STORM_TOWN.GATES.iron, name: 'THE BELL WATCH' };
  laid(219, 226, 19, 33);
  plat(214, 29, 5); plat(214, 24, 5); plat(216, 18, 11);
  ladder(218, 29, 33); ladder(214, 24, 29); ladder(218, 18, 24);
  ladder(227, 18, 33);   // the garrison's own ladder down its east face to the moat side (a hero who drops off the deck there climbs back)
  scaffolds.push({ x0: 213, x1: 218, top: 18, floor: 34, kind: 'timber', scaffold: true });
  ent('scalder', 214, 23, { face: 1, post: [214, 214] });   // over the second ladder
  ent('scalder', 218, 17, { face: 1, post: [218, 218] });   // over the third
  ent('sentry', 216, 23, { section: 'bellwatch', range: 3, face: -1 });
  ent('bell', 217, 23, { section: 'bellwatch' });
  ent('hearthgob', 215, 28, { face: 1 });
  ent('key', 222, 17, { kind: 'iron' }); ent('brazier', 225, 17);
  ent('sign', 213, 33, { text: 'THE BELL WATCH HOLDS THE IRON KEY. UP THE SCAFFOLD ON ITS FACE.' });
  ent('sign', 226, 17, { text: 'THE ROPE RUNS OVER THE MOAT TO THE INNER GATE. HOLD UP AT ITS HANDLE.' });
  coins([216, 28], [217, 22], [220, 17], [223, 17]);
  // THE DRY MOAT: twelve columns of the bailey are a spiked ditch, too wide for any jump. The Bell Watch's rope is the way over
  // (src/zipline.js; the reach model knows the rope - src/reachcore.js). A fall is the spikes' bite and back to safe ground.
  ent('archer', 230, 33, { face: -1 });
  floor(236, 269, 34); air(236, 247, 34, 36); spikesAt(236, 247, 37);
  ent('sign', 232, 33, { text: "THE DRY MOAT. THE BELL WATCH'S ROPE GOES OVER IT." });
  ent('check', 254, 33);   /* THE BAILEY's exam (the tower, the bell, the moat) ends here */
  laid(259, 265, 22, 29);
  ent('lockgate', STORM_TOWN.GATES.iron, 33, { needs: 'iron', h: 5 }); gateCol(STORM_TOWN.GATES.iron, 29, 33);
  ent('sign', 257, 33, { text: 'THE INNER GATE. ITS KEY IS IN THE BELL WATCH.' }); plat(266, 31, 3);   // the sally port's step
  facades.push([255, 258, 20, 33, 'tower', { town: true, roof: true }], [266, 269, 20, 33, 'tower', { town: true, roof: true }]);
  coins([250, 33], [256, 33]);

  // ============================ 4. THE CURTAIN WALL (268-395): the ditch, the wall face, THE WALL-WALK, THE WALL WATCH ============================
  block(270, 271, 34, 45);   // the sally pier
  block(272, 333, 44, 45);   // the ditch floor, under the wall
  for (const [x, y] of [[272, 36], [274, 38], [276, 40], [278, 42]]) plat(x, y, 2);   // THE SALLY STAIR, two rows a step
  laid(288, 290, 42, 43); laid(299, 300, 43, 43);   // stone fallen off the wall
  ent('sign', 268, 33, { text: 'THE WAY ON IS OVER THE CURTAIN WALL. DOWN INTO THE DITCH, THEN UP ITS FACE.' });
  ent('sprig', 285, 43, { face: -1 }); ent('sapper', 294, 43, { face: -1 }); ent('shield', 305, 43, { face: -1 }); ent('sprig', 312, 43, { face: -1 });
  ent('harpy', 282, 38); ent('archer', 318, 43, { face: -1 });
  plat(292, 40, 4); plat(306, 41, 5); plat(314, 40, 3);   // the ditch's fallen hoarding, leant on the rubble
  coins([281, 42], [289, 40], [296, 42], [304, 42], [312, 42], [318, 42]);
  // the face: the masons' scaffold still stands against the wall, so the climb zig-zags between its boards and the wall's own
  // sills, two rows a step. A Scalder on the hoarding over the sills: the wall side is poured on, the scaffold side is not.
  for (const y of [40, 36, 32, 30]) plat(325, y, 3);   // the scaffold's boards
  for (const y of [42, 38, 34]) plat(330, y, 4);       // wall sills
  plat(330, 29, 4);                                    // the hoarding at the wall top
  scaffolds.push({ x0: 324, x1: 328, top: 30, floor: 44, kind: 'timber', scaffold: true });
  ent('scalder', 332, 28, { face: -1, post: [330, 333] });
  ent('sign', 320, 43, { text: 'THE WALL. HE POURS DOWN THE WALL SIDE ONLY: WAIT ON THE SCAFFOLD.' });
  ent('harpy', 328, 33);
  coins([326, 39], [331, 37], [326, 35], [331, 33], [326, 31], [331, 28]);
  // THE WALL-WALK (A14: the level's real platforming section, with its own exam): the hoardings are breached in three places,
  // spiked where the walk fell in; arrow-slit towers with a bowman on each cover the jumps, a beam of the old hoarding still
  // stands over the widest breach, and a pike holds the walk between the second and third.
  laid(334, 387, 29, 45);
  facades.push([334, 384, 22, 28, 'curtain', { town: true }]);
  laid(340, 342, 27, 28); laid(371, 373, 27, 28);   // the arrow-slit towers
  ent('archer', 341, 26, { face: -1 }); ent('archer', 372, 26, { face: -1 });
  const breach = (x0, x1) => { air(x0, x1, 29, 34); spikesAt(x0, x1, 35); };
  breach(350, 352); breach(360, 363); breach(378, 380);
  plat(361, 26, 2);   // the hoarding's last beam over the wide breach
  ent('shield', 356, 28, { face: -1 }); ent('pike', 367, 28, { face: -1 }); ent('harpy', 376, 23);
  ent('sign', 336, 28, { text: 'THE WALL-WALK IS BREACHED. JUMP THE GAPS - THE OLD HOARDING BEAM STILL HOLDS.' });
  coins([345, 27], [351, 25], [357, 27], [362, 24], [368, 27], [379, 25], [383, 27]);
  // THE WALL WATCH: stone, on the wall's east end, climbed outside like the others: a ladder off the walk, a board, the deck
  const T3 = { x0: 384, x1: 395, top: 20, floor: 29, kind: 'stone', key: 'bone', gate: STORM_TOWN.GATES.bone, name: 'THE WALL WATCH' };
  laid(388, 395, 21, 45);
  plat(384, 25, 4); plat(384, 20, 12);
  ladder(387, 25, 28); ladder(384, 20, 25);
  scaffolds.push({ x0: 384, x1: 387, top: 20, floor: 29, kind: 'timber', scaffold: true });
  ent('scalder', 384, 19, { face: 1, post: [384, 384] });
  ent('archer', 386, 24, { face: -1 });
  ent('key', 391, 19, { kind: 'bone' }); ent('brazier', 394, 19);
  ent('check', 388, 19);   /* (stormhold4, Q5) THE CURTAIN WALL's exam (the breached walk, the Wall Watch) ends on its deck: the shrine before the haul lines */
  ent('sign', 382, 28, { text: 'THE WALL WATCH HOLDS THE BONE KEY. ITS HAUL LINES GO OVER THE DITCH TO THE GATEHOUSE.' });
  ent('sign', 393, 19, { text: 'DOWN DROPS YOU OFF A LINE. STRIKE DOWN AS YOU FALL - A SHIELD CANNOT FACE UP.' });
  ent('sign', 395, 19, { text: 'TWO LINES OVER THE DITCH. JUMP OFF ONE AND TOUCH THE OTHER.' });
  coins([385, 24], [389, 19], [392, 19]);

  // ============================ 5. THE HAUL LINES (396-575): THE KING'S DITCH, the haul tower, the gorge, THE BARBICAN TOWER and its MANGONEL ============================
  /* (claude/lance4 lane 2, scratch/brief-lance4-1029.md s4) The masons' ropes, strung from the Wall Watch over THE KING'S DITCH (the gorge, upstream of
     the bridge) to the BARBICAN TOWER on the gatehouse's outer face. They are zip lines (src/zipline.js): JUMP kicks you off one and a TOUCH in the air
     takes another - the Lance's P2 ropes, learned here. THE CASTLE'S MANGONEL on the barbican throws at the line you ride (src/haul-lines.js: a dotted arc
     and a red ring on your rope 1.3 s ahead; a ring only lands where another line that goes on is in reach, so the escape is always drawn).
       TEACH  (396-441) the Wall Watch's deck -> LINE A over the ditch's flat bottom; LINE B runs two rows under A's second half to the haul tower. A ends
              in the air over the ditch: ride it out and you drop to the bottom - and walk back to the Wall Watch's ladder (no bite). A shielded pike
              stands under A's first stretch: drop on him (DOWN) and strike down as you fall (P2a, the helm).
       TEST   (442-530) the HAUL TOWER (stone, the masons' scaffold on its face) -> L1 long and east-down over the spiked gorge; L2 starts ABOVE it on a mast
              and crosses under it (an X): L1 -> L2 is a jump UP (455-480); L2 -> L3 a DROP (500-520). L1 and L2 end in the air: a fall is the
              teeth's bite and back to the last footing (the hazard rule).
       REMIX  (528-575) a rider on L3 draws A STONE FOR THE LINE: it parts L3 ahead of you and the cut end whips down (the Lance's P2b, seen first and
              harmless here) - jump UP onto L4 before it goes. L4 sets you on the barbican's plinth: climb its face and WRECK the mangonel (5 blows). */
  const haul = [], post = (x, r) => [x * TS + 8, r * TS - 12];
  const line = (id, x0, r0, x1, r1, g0, g1, o) => { const [X0, Y0] = post(x0, r0), [X1, Y1] = post(x1, r1);
    haul.push({ x0: X0, y0: Y0, x1: X1, y1: Y1, speed: 180, haul: id, posts: [[X0, Y0, g0 * TS], [X1, Y1, g1 * TS]], ...(o || {}) }); };
  // ---- TEACH: THE KING'S DITCH (flat bottom, no teeth) ----
  block(396, 441, 42, 45);
  ladder(396, 20, 41);   /* the Wall Watch's east face: a miss on the lines walks back here (~10 s) */
  ent('shield', 404, 41, { face: -1 });   /* under line A's first stretch: the drop-strike, taught (A SHIELD CANNOT FACE UP) */
  ent('deco', 399, 41, { kind: 'barrels' }); ent('deco', 420, 41, { kind: 'cart', v: 1 });   /* the masons' stone-cart, in the ditch they work from */
  line('A', 395, 20, 428, 26, 20, 42, { endsAir: true });            /* off the Wall Watch's deck; it ends in the air over the ditch (a sheerleg on the bottom holds it) */
  line('B', 412, 25, 440, 30, 42, 30);            /* two rows under A's second half (412-428), to the haul tower's landing */
  coins([401, 21], [407, 22], [416, 26], [424, 27], [432, 28], [409, 41], [430, 41]);
  // ---- THE HAUL TOWER: a stone stack the masons built to haul from, their scaffold on its west face (a landing, a board, the top) ----
  laid(442, 446, 15, 45);
  plat(437, 30, 5); plat(437, 22, 4); plat(437, 14, 10);   /* the landing, the board, and the top deck: timber over the stack's top course (the line leaves off it) */
  ladder(441, 22, 29); ladder(437, 14, 21);
  scaffolds.push({ x0: 436, x1: 441, top: 14, floor: 42, kind: 'timber', scaffold: true });
  ent('sign', 438, 29, { text: 'THE HAUL TOWER. UP THE SCAFFOLD: THE LINES OVER THE GORGE START AT ITS TOP.' });
  ent('sign', 444, 13, { text: 'THE MANGONEL THROWS AT THE LINE YOU RIDE. A RED RING: GET ONTO ANOTHER LINE BEFORE IT.' });
  ent('brazier', 438, 13); coins([438, 21], [443, 13]);
  // ---- TEST + REMIX: THE GORGE (its teeth the whole way to the barbican) ----
  block(447, 556, 44, 45); spikesAt(447, 556, 43);
  line('L1', 446, 14, 496, 23, 14, 44, { stones: true, endsAir: true });                  /* long, east and down; it ends in the air on a mast */
  line('L2', 455, 13.2, 522, 29.9, 44, 44, { stones: true, endsAir: true });              /* from a mast ABOVE L1, steeper: it crosses under L1 at ~490 (the X) */
  line('L3', 500, 26.6, 552, 35.5, 44, 44, { stones: true, endsAir: true, cutAt: 546 * TS + 8, cutTrig: 527 * TS });   /* under L2's tail; THE REMIX's line */
  line('L4', 528, 29.8, 564, 37, 44, 37, { stones: true });               /* over L3's last stretch, down to the barbican's plinth */
  coins([452, 16], [462, 16], [470, 18], [486, 22], [508, 28], [516, 29], [534, 31], [542, 32], [552, 34]);
  // ---- THE BARBICAN TOWER on the gatehouse's outer face: its plinth (where L4 sets you down), a ladder up its face, THE MANGONEL on top ----
  laid(557, 565, 37, 45); laid(566, 575, 17, 45);
  ladder(565, 16, 36);
  ent('deco', 559, 36, { kind: 'warStandard', v: 1 });
  ent('sign', 562, 36, { text: 'THE BARBICAN. CLIMB IT AND WRECK THE MANGONEL: FIVE BLOWS.' });
  coins([565, 30], [565, 24], [568, 16]);
  const mangonel = { x: 571, y: 16 };   /* (src/haul-lines.js) its frame on the barbican's top; off its east side you drop into the gatehouse yard */

  // ============================ 6. THE GATEHOUSE (576-669): THE GATEHOUSE BELL, THE STORM LANCE, the bridgehead's bell-gate exam ============================
  /* (claude/lance4 lane 2) every gatehouse column is G0 + n: the section moves as one when the level grows in front of it */
  floor(G0, P0 - 1, 30);
  ent('check', G0 + 3, 29);   /* THE HAUL LINES' exam (the gorge, the parted line, the barbican) ends in the gatehouse yard */
  // THE GATEHOUSE BELL (the TEACH for the Lance's P1, src/bell-gate.js): a bell on the gallery by the portcullis passage. Ring it and it
  // tolls three times: the pike it calls RUNS TO IT - to the gate - and on the third toll the portcullis drops on whoever is under it.
  laid(G0 + 18, G0 + 24, 19, 25);
  plat(G0 + 12, 27, 5);   /* the bell's gallery: one held jump off the yard */
  ent('gatebell', G0 + 15, 26, { id: 'gatehouse', gate: G0 + 21, gy0: 26, gy1: 29 });
  ent('sign', G0 + 9, 29, { text: 'RING THE BELL: THEY RUN TO IT, AND THE GATE DROPS ON WHOEVER IS UNDER IT.' });
  ent('pike', G0 + 28, 29, { face: -1, answers: 'gatehouse' }); ent('pike', G0 + 34, 29, { face: -1 }); ent('shield', G0 + 40, 29, { face: -1 }); ent('stormshaman', G0 + 45, 29, { face: -1 });
  plat(G0 + 28, 27, 5); plat(G0 + 40, 27, 5); plat(G0 + 49, 27, 4); plat(G0 + 62, 27, 5); plat(G0 + 84, 27, 4);   // the gatehouse's fighting galleries along the yard wall
  ent('torch', G0 + 17, 29); ent('deco', G0 + 26, 29, { kind: 'banner', v: 0 }); ent('deco', G0 + 49, 29, { kind: 'banner', v: 1 });
  facades.push([G0 + 7, G0 + 17, 19, 29, 'curtain', { town: true }], [G0 + 25, G0 + 52, 19, 29, 'curtain', { town: true }]);
  coins([G0 + 8, 28], [G0 + 21, 28], [G0 + 31, 28], [G0 + 37, 28], [G0 + 43, 28], [G0 + 50, 28]);
  // (THE STORM LANCE, the Storm Chapter's knight, holds G0 + 56: src/order-chapters.js ORDER_AT.storm / level.js ELITES.storm)
  // THE BRIDGEHEAD EXAM (RULES S3): the last stretch before his door is a GATE TOWER like the three on his bridge - a bell on its lookout and a
  // portcullis under it. Two pikes and the shielded captain charge at the rung bell: the Lance's P1 opening, exactly. No checkpoint inside
  // it; the one at the first pier closes it.
  ent('sign', G0 + 66, 29, { text: 'A GATE TOWER. RING ITS BELL FROM THE LOOKOUT: THEY CHARGE AT IT, AND THE GATE DROPS ON THE THIRD TOLL.' });
  plat(G0 + 72, 27, 5); ent('deco', G0 + 74, 29, { kind: 'bridgetower' });
  facades.push([G0 + 72, G0 + 76, 21, 26, 'tower', { town: true, roof: true }]);
  ent('gatebell', G0 + 75, 26, { id: 'bridgehead', gate: G0 + 74, gy0: 28, gy1: 29 });
  ent('pike', G0 + 79, 29, { face: -1, answers: 'bridgehead' }); ent('pike', G0 + 81, 29, { face: -1, answers: 'bridgehead' }); ent('shield', G0 + 83, 29, { face: -1, answers: 'bridgehead' });
  coins([G0 + 62, 26], [G0 + 74, 26], [G0 + 85, 28]);
  laid(P0 - 4, P0 - 1, 19, 24);
  ent('lockgate', STORM_TOWN.GATES.bone, 29, { needs: 'bone', h: 5 }); gateCol(STORM_TOWN.GATES.bone, 25, 29);
  ent('deco', P0 - 7, 29, { kind: 'lanternPost' });
  facades.push([P0 - 9, P0 - 5, 20, 29, 'tower', { town: true, roof: true }]);

  // ============================ 7. THE LONG BRIDGE (670-797): seven piers, the Queen's Lance, THE MAIN GATE ============================
  // one height the whole way, so his charge has one line to run and the piers are the rhythm. Under the spans, far down, the
  // gorge's teeth: a plank he splinters out from under you is a fall onto rock (the spikes' bite and back to the last footing -
  // the hazard rule, never an untold death), and every gap he tears is three planks: a jump for every hero.
  const BY = 30;
  ent('check', P0 - 1, BY - 1);
  ent('sign', P0, BY - 1, { text: "THE QUEEN'S LANCE HOLDS THE BRIDGE. RING A TOWER BELL FROM ITS LOOKOUT: HE ANSWERS IT." });
  const piers = [], spans = [], signal = [];
  for (let k = 0; k < 7; k++) { const px0 = P0 + k * 18, px1 = px0 + 4, gateTower = k % 2 === 1; piers.push([px0, px1]);
    block(px0, px1, BY, 45);
    if (k > 0) { const s0 = px0 - 13, s1 = px0 - 1; span(s0, s1, BY, { sway: k >= 3 ? 2 : 1 }); spans.push([s0, s1]); }
    if (k >= 1 && k <= 5) { ent('deco', px0 + 2, BY - 1, { kind: 'bridgetower' }); plat(px0, BY - 3, 5); if (!gateTower) ent('brazier', px0 + 4, BY - 4); }   // a lookout on every tower pier
  }
  span(P0 + 113, P0 + 121, BY, { sway: 2 }); spans.push([P0 + 113, P0 + 121]);   // the last span, to the main gate
  block(P0, W - 1, 44, 45); for (const [s0, s1] of spans) spikesAt(s0, s1, 43);   // the gorge floor: rock teeth under every span
  /* THE END LOOKOUTS (src/lance-support.js lanceLookouts): on the first pier and the last, built like the five between. With them
     every pier carries one - the seven his LANCE VAULT goes up onto and the ballista's bolt flies under. */
  const ends = lanceLookouts({ plat, ent }, P0, BY);
  const lookouts = [ends[0], ...piers.slice(1, 6).map(([px0]) => [px0, px0 + 4, BY - 3]), ends[1]];
  /* (claude/lance4, scratch/brief-lance4-1029.md s3) THE GATE TOWERS on piers 1, 3 and 5: each lookout carries an ALARM BELL, and a portcullis
     hangs under it across the deck (src/lance-support.js bellStrike). Ring it from the lookout - where his charge cannot reach you - and
     it tolls three times: HE ANSWERS THE BELL (a lance charge at that tower), and the third toll drops the gate. On him: PINNED. Ahead of
     him: a gate across his lane, and he runs into it. Over each lookout the tower's TOP (one held jump up), where its SIGNAL ROPE starts:
     east and downhill over his head to the next pier's lookout, with a POST on that pier's deck holding the line's stay (strike it: the
     line frays, parts and whips down along its run). The fire cages are gone from the bridge (Q3). */
  for (const k of [1, 3, 5]) { const px0 = P0 + k * 18;
    plat(px0 + 1, BY - 6, 3);   // the tower top
    facades.push([px0, px0 + 4, BY - 8, BY - 4, 'tower', { town: true, roof: true }]);
    ent('lancebell', px0 + 3, BY - 4, { gate: px0 + 2, gy0: BY - 2, gy1: BY - 1, tower: k });
    const x0 = (px0 + 3) * TS + 8, y0 = (BY - 6) * TS - 12, x1 = (px0 + 18) * TS + 8, y1 = (BY - 3) * TS - 12;
    signal.push({ x0, y0, x1, y1, signal: k, post: [x1, BY * TS], posts: [[x0, y0, (BY - 6) * TS]] }); }
  ent('sign', P0 + 15, BY - 1, { text: 'A GATE TOWER. RING ITS BELL: THE GATE DROPS ON THE THIRD TOLL.' });
  for (const x of [8, 26, 44, 62, 80, 98]) { ent('deco', P0 + x, BY - 1, { kind: 'lanternPost' }); coins([P0 + x + 4, BY - 2]); }
  ent('silver', P0 + 71, BY - 2);
  // THE MAIN GATE: the castle's own, at the bridge's end. Its portcullis is up while he holds the bridge; in his last stand he falls
  // back under it as it comes down, and when he falls it SLAMS shut - the way on is round with the supply carts (THE KITCHEN GATE).
  block(W - 2, W - 1, 20, 45); floor(P0 + 122, W - 1, BY);
  laid(W - 7, W - 3, 20, 25);
  ent('deco', W - 5, BY - 1, { kind: 'gatehouse' }); ent('gate', W - 3, BY - 1);
  /* THE GREAT BELL on the gatehouse's hoarding (a timber gallery off the gatehouse wall, over the last span): reached from the last lookout
     (or the last signal rope, which lands there). In his last stand, ring it while he stands under the main gate and the portcullis drops
     on him at once. */
  plat(W - 13, BY - 5, 6);
  ent('lancebell', W - 9, BY - 6, { gate: W - 5, gy0: 26, gy1: BY - 1, great: true });
  ent('lance', P0 + 18, BY - 1);

  // ---- THE TOWERS' ROPES: from each top deck's east edge down to the foot of its own gate. UP grabs, JUMP lets go. ----
  const rope = (x0, top, x1, endRow, groundRow) => ({ x0: x0 * TS + 8, y0: top * TS - 12, x1: x1 * TS + 8, y1: endRow * TS - 12,
    posts: [[x0 * TS + 8, top * TS - 12, top * TS], [x1 * TS + 8, endRow * TS - 12, groundRow * TS]] });
  const zipLines = [rope(52, T1.top, 88, 36, 36), rope(226, T2.top, 252, 34, 34), ...haul, ...signal];   /* (stormhold4) the Wall Watch's rope is HAUL LINE A (the teach); then B and L1-L4 (src/haul-lines.js), then the Lance's signal ropes */   /* each rope ends ON its landing's floor (the hero's feet = the rope + 12) */
  const watchtowers = [T1, T2, T3];

  // THE LADDERS, LAST: nothing is dug after this line
  for (const [x, y0, y1] of ladders) for (let y = y0; y <= y1; y++) set(x, y, T.NET);

  return {
    watchtowers, structures: scaffolds, zipLines, ropes: zipLines, noDoorKeys: true, mangonel, zipTransfer: true,   /* (stormhold4) THE MANGONEL (src/haul-lines.js); the reach model rides rope to rope here (src/reachcore.js) */
   /* every key hangs on a tower: the play bot's stall answer 'go and find a door' (src/playtest.js) has nothing to find */
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 36 }, pools: [], falls: [], moversExtra: [], interiors: [[98, 146, 31, 35, 'stone']],   /* THE BARBICAN's passage: not a house, the gate's own vault - drawn as laid stone overhead, and the snow stays out */ bridges, houses: [], masonry, facades, masonryKit: 'limestone', climbLook: true,
    calm: [[39, 53, 19, 35], [212, 227, 16, 33], [322, 334, 27, 43], [383, 396, 18, 28], [396, 447, 12, 41], [556, 576, 14, 36]],   /* (stormhold4) and the haul tower and the barbican: the climbs between the lines */   /* the climbs carry their own authored encounters: the garrison stays off them (F4: a climb, then a fight) */
    playtestSections: STORM_TOWN.SECTIONS,
    checkRun: 200,   /* (stormhold4: 160 -> 200 - the Wall Watch's deck to the gatehouse yard is 191 over THE HAUL LINES, one area's exam; the brief's five shrines, Q5) */   /* one shrine a named area (A10c): the road in and the barbican share the first (152), so the filler must not put one back at 76 */
    duskStart: -1, duskLen: 1, music: 'stormhold', night: true, glowNight: true, nightA: 0.26,
    palette: { set: 'village', sky: 'crag', far: 'crag', mid: 'crag', near: 'crag', dress: 'crag', haze: 'rgba(150,160,200,0.16)',
      grass: '#cfd8e2', grassL: '#eef4ff', grassD: '#9aa8bc', dirt: '#4a4a58', dirtL: '#62626e', dirtD: '#32323c',
      canopy: ['#3a3a48', '#4a4a5a', '#5a5a6c', '#6a6a80'] },
    weather: [{ x0: 0, x1: 99999, kind: 'snow' }], ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    castle: true, castleGrow: 1.6,   // the castle on the skyline, drawn behind everything - and it comes CLOSER every section (drawCastleBack)
    /* THE ALARMS (Highcrown's bell, taught before Highcrown): catch the sentry, break his bell, or his watch turns out (and in the
       bailey a grate drops across the yard; it lifts once the garrison is down, or after 20 s regardless). */
    alarms: [
      { id: 'bailey', gates: [[211, 30, 33]], garrison: [{ t: 'sprig', x: 210, y: 33 }, { t: 'sprig', x: 213, y: 33 }] },
      { id: 'bellwatch', gates: [[221, 13, 17]], garrison: [{ t: 'hearthgob', x: 217, y: 17 }, { t: 'hearthgob', x: 219, y: 17 }] },   /* rung, a grate drops across the deck between the ladder and the key, and his watch turns out on your side of it */
    ],
    /* THE LONG BRIDGE, for THE QUEEN'S LANCE (src/main.js updateLance; src/lance-support.js): his lookouts (all seven: the vault's
       perches), the spans his charge tears up, the gate towers (their bells: src/lance-support.js), and the main gate he falls back under in his last stand. */
    arena: { x0: P0 * TS, x1: (W - 1) * TS, floor: BY * TS, trigger: (P0 + 6) * TS, wallL: P0 - 1, wallR: W - 1, boss: 'lance', music: 'lance', tint: '#6a7a9a', tintA: 0.10, fx: 'dust',
      lookouts, spans, piers, bellTowers: [1, 3, 5], mainGate: W - 5, fallPct: 0.12 },   /* fallPct: a fall through a gap he tore bites 12% (a walked-into pit, 27%: survival.js HAZARD) */   /* "Boss Battle #3 [8-bit re-upload]" V3 by nene, CC0 - THE QUEEN'S LANCE's own boss track (audio/CREDITS.txt) */
  };
}
