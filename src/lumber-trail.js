// src/lumber-trail.js - THE LUMBER TRAIL (claude/lumbertrail, the OPUS greybox; scratch/brief-first2.md sec.1, scratch/review-first2.md).
// BRACKEN WOOD reworked: level id 'wood' (the game's FIRST level, no `needs`), its boss THE HORNET QUEEN unchanged. The old wood read as a tutorial
// corridor (nine signs and four cloned lesson bays in two minutes; the felling rule optional, its first pine at 78%). This is ONE felled-timber trail:
// the woodsman's cabin hands over the FELLING verb in minute one (a marked pine, four strokes, it creaks and LEANS the way it will fall, and the line it
// will lie along is drawn on the ground - src/felling.js, main.js fellStroke), and the trail asks for three DIFFERENT fells:
//   A BRIDGE   (required: the cabin gully, taught where a miss is a climb back out; again at THE TARN, the exam, with wasps over it and a badger on the far bank)
//   A LEAN-TO  (required: the camp's pine laid up against the cliff is the only way out of the lumber camp)
//   A DROP     (the ridge pine felled out over the hollow comes down on the goblin crew below - a fight during the rule, A5 - and is the way down to them)
// The control lessons are the trail's work, not bays: the heavy cut on the skid road's shield goblin, the plunge on the ford's wasps and the down attack on the
// far bank's sprigs (ONE sign for both), the parry at the camp gate (the sworn sword), the rising cut on the wasp stretch of the ridge. Each stretch has its
// own ground (the gully, the stump slope, the ford's stones and raft, the camp's sawpit and log stacks, the cliff, the ridge, the hollow log, the tarn).
// The first moving platform (the log raft over the deep pool) is signed. The Hornet Queen's comb hangs from the great pine at her west wall (the pine you can
// fell into her clearing): her arena is the old one to the column, so her numbers stand (67% with flasks at the last 12-seed row, scratch/review-first2.md).
// FIVE NAMED AREAS + the clearing, a shrine closing each area's exam (A10c), one before the boss:
//      0-104  THE WOODSMAN'S CABIN   TEACH  the cabin, the woodsman's mark, the GULLY BRIDGE (required), the dodge, the SKID ROAD stump slope + the heavy cut   shrine 102
//    105-205  THE FORD               TEST   down to the river: the ford's stones (shallow), the LOG RAFT over the deep pool (the first ride, signed), the plunge on
//                                           the ford's wasps, the down attack on the far bank's sprigs, the badger, a vine pocket                                   shrine 203
//    206-300  THE LUMBER CAMP        REMIX  the camp gate's sworn sword (the parry), the sawpit, the log stacks, THE BRIAR MAUL (the Thorn Chapter's knight, the
//                                           area's exam, his gate), the LEAN-TO up the cliff (required)                                                             shrine 298
//    301-409  THE HIVE PINES         REMIX  the ridge's wasps (the rising cut), THE DROP onto the goblin crew in the hollow, the HOLLOW LOG (over or through)      shrine 407
//    410-509  THE TARN               EXAM   the tarn BRIDGE under wasps and a charging badger, the helm pit (plunge the shields), the climb to the hive                shrine 506
//    510-549  THE HIVE CLEARING      BOSS   THE HORNET QUEEN
// Every number is a FINAL column: nothing here is grown in after (tools/lumber-trail.mjs pins the beats).
import { FELL_STROKES } from './felling.js';
export const SECTIONS = [["THE WOODSMAN'S CABIN", 0, 104], ['THE FORD', 105, 205], ['THE LUMBER CAMP', 206, 300], ['THE HIVE PINES', 301, 409], ['THE TARN', 410, 509], ['THE HIVE CLEARING', 510, 549]];
/* THE FELLS: the trail's marked pines, by their role (tools/lumber-trail.mjs reads these) */
export const FELLS = {
  gully: { x: 25, y: 21, len: 12, dir: 1, row: 22, mark: true, req: true },                     /* the cabin's: a bridge over the gully, flush with its banks */
  leanto: { x: 266, y: 16, len: 11, dir: 1, head: [276, 11], mark: true, req: true },          /* the camp's: laid up against the cliff, the only way out */
  drop: { x: 333, y: 10, len: 12, dir: 1, head: [345, 17], mark: true, drop: true },           /* the ridge's: out over the hollow, onto the crew under it */
  tarn: { x: 415, y: 12, len: 14, dir: 1, row: 13, mark: true, req: true },                    /* the tarn's: the exam's bridge */
  sett: { x: 149, y: 21, len: 8, dir: 1, head: [156, 24], mark: true, drop: true },          /* the ford's far bank: the first DROP, a small pine over the crew's hollow (A4: the verb again by col 150) */
  hive: { x: 515, y: 6, len: 10, dir: 1, mark: true },                                                      /* the Queen's: the old west-wall pine, laid across her near comb as a perch at her height */
};
export const GATE_COL = 510, STROKES = FELL_STROKES;

export function buildLumberTrail({ painter, T, TS }) {
  const W = 550, H = 28, L = painter(W, H);
  const { block, floor, plat, spikes, crate, ent, coins, set } = L;
  const sign = (x, y, text, o = {}) => ent('sign', x, y, { text, ...o });
  const deco = (kind, x, y, o = {}) => ent('deco', x, y, { kind, ...o });
  const fell = k => { const f = FELLS[k]; const o = { len: f.len, dir: f.dir }; for (const q of ['row', 'head', 'drop', 'mark', 'req']) if (f[q] !== undefined) o[q] = f[q]; o.role = k; ent('felltree', f.x, f.y, o); };
  const pools = [], moversExtra = [], lessons = [];
  const water = (x0, x1, yTop, o = {}) => pools.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y: yTop * TS + (o.shallow ? 4 : 0), shallow: !!o.shallow, depth: o.shallow ? 12 : (o.bed - yTop) * TS, ...(o.bed ? { bottom: o.bed * TS } : {}) });   /* bed: the row the water's floor is (a deep pool's swim reaches down to it) */
  const swing = (col, pivotRow, arm, phase) => moversExtra.push({ kind: 'swing', px: col * TS + 8, py: pivotRow * TS, arm, x: col * TS + 8 - 16, y: pivotRow * TS + arm, w: 32, h: 8, period: 3.3, phase, vine: true });   /* (x, y: where it hangs at rest - main.js swings it from the first frame) */
  /* A LOG DECK: a one-way run of split timber three rows over the ground beside it (the woodsmen's skids and cribs: src/forest-supports.js stands each on a crib post) */
  const deck = (x, row, n) => plat(x, row, n);

  // ================= 1. THE WOODSMAN'S CABIN (0-104): TEACH - the mark, the gully bridge, the dodge, the skid road and the heavy cut =================
  floor(0, 26, 22);
  sign(5, 21, 'ARROWS/WASD MOVE   Z JUMP   X SWING', { pyro: 'ARROWS/WASD MOVE   Z JUMP   X STAFF   TAP C: AN EMBER   HOLD C: THE JET', paladin: 'ARROWS/WASD MOVE   Z JUMP   X MAUL, SLOW AND HEAVY' });
  deco('cabin', 10, 21); deco('stump', 15, 21, { v: 0 });   /* the woodsman's chopping block, the axe in it (the art lane draws the block + axe; the woodsman who hands it over stands beside it, drawn as dressing: src/redraw/lumber_trail_tiles.js dress) */
  sign(18, 21, "THE WOODSMAN'S MARK IS ON THE PINES. FOUR STROKES FELL ONE: IT FALLS THE WAY IT LEANS.");
  coins([12, 20], [13, 19], [14, 20], [20, 20], [22, 20]);
  deck(7, 19, 6); coins([8, 18], [10, 18], [12, 18]); deck(16, 19, 4);   /* the cabin's woodshed roof */
  fell('gully');
  /* THE GULLY: ten columns wide, too wide for any jump; five rows down to a dry bed, and the near wall is a stair back up - a miss in minute one is a climb, not a death */
  block(27, 36, 27, 27); block(27, 29, 25, 26); block(27, 27, 23, 24);
  deco('rock', 31, 26, { v: 0 }); deco('fern', 34, 26, { v: 1 });
  sign(32, 26, 'A HELD JUMP IS HIGHER THAN A TAPPED ONE. THE STEPS AT THE WEST WALL LEAD BACK UP.');   /* (only read by whoever fell in: the stair out asks for a held jump) */
  floor(37, 51, 22);
  ent('badger', 41, 21, { face: -1 }); ent('sprig', 45, 21, { face: -1 });   /* the far side of the gully: a badger that charges back along the trunk you just felled (a hit there is a fall into the gully: a climb, not a death) */
  deco('hiveBg', 47, 21, { v: 1 }); ent('wasp', 46, 15); ent('wasp', 48, 14);   /* THE HIVE IS FELT FROM THE START: a paper comb in the pines, two wasps posted high over it */
  block(52, 54, 25, 27);   /* a dip three wide: jumped or dodged, and a hop back out if not */
  coins([40, 20], [41, 19], [42, 20], [53, 23]);
  deck(38, 19, 5); coins([39, 18], [41, 18]); deck(50, 19, 3);
  /* THE SKID ROAD: a stump slope the felled timber was dragged down - every stump its own height */
  floor(55, 64, 22); block(65, 69, 21, 27); block(70, 74, 20, 27); block(75, 80, 19, 27); block(81, 104, 18, 27);
  deck(59, 19, 3); coins([59, 18], [61, 18]);   /* a log crib by the road */
  deck(66, 18, 3);
  sign(66, 20, 'A RAISED SHIELD TURNS A CUT. HOLD X AND LET GO: THE SHIELD CHARGE GOES THROUGH IT.', { pyro: 'A RAISED SHIELD TURNS A CUT. HOLD X: THE BELLOWS GO THROUGH IT.', paladin: 'A RAISED SHIELD TURNS A CUT. HOLD X: THE OVERHEAD GOES THROUGH IT.', pirate: 'A RAISED SHIELD TURNS A CUT. HOLD X: THE PISTOL GOES THROUGH ANY GUARD.', reaper: 'A RAISED SHIELD TURNS A CUT. HOLD X: THE PLANTED BLADE GOES THROUGH ANY GUARD.', warden: 'A RAISED SHIELD TURNS A CUT. HOLD X: THE SHAFT GOES ROUND IT, BOTH SIDES AT ONCE.' });
  ent('sprig', 71, 19, { face: -1 }); ent('shield', 78, 18, { face: -1 }); ent('thorn', 88, 17, { face: -1 });   /* the skid road's guard: the heavy cut, met on the slope */
  lessons.push({ kind: 'heavyblow', x0: 65, x1: 86 });
  deck(76, 16, 4); coins([76, 15], [78, 15]);
  deck(84, 15, 4); ent('spit', 85, 14, { face: -1 });   /* the spitter on the log crib over the top of the slope */
  /* THE LOG ROUND (the pushblock's teaching use, backlog #12): a ledge four rows over the slope's top, a round of pine pushed under it is the step */
  ent('pushblock', 90, 17, { stepAt: [93, 17] }); block(94, 94, 14, 14); ent('silver', 94, 13);
  deck(99, 15, 3);
  ent('shield', 99, 17, { face: -1 }); ent('sprig', 101, 17, { face: -1 });   /* the area's exam: a guard and a sprig on the top with the spitter over them */
  coins([83, 16], [88, 16], [92, 16]);
  ent('check', 102, 17);

  // ================= 2. THE FORD (105-205): TEST - the ford, the log raft (the first ride, signed), the plunge and the down attack, the badger =================
  block(105, 108, 19, 27); block(109, 111, 22, 27);
  block(112, 126, 25, 27); water(112, 126, 24, { shallow: true });   /* the ford: knee-deep over a gravel bed, down in the river's cut */
  block(127, 129, 22, 27);   /* the raft's landing stone: three rows up out of the ford */
  deck(119, 22, 2); coins([119, 21], [120, 21]);   /* the old ford's footbridge, all but one span gone: its posts in the water */
  coins([114, 23], [122, 23], [125, 23]);
  ent('wasp', 114, 21, { pogo: true }); ent('wasp', 119, 20, { pogo: true }); ent('wasp', 123, 21, { pogo: true });   /* the plunge: bounce across the wasps over the ford and stay out of the slow water */
  sign(110, 21, 'DOWN+X IN THE AIR: PLUNGE. BOUNCE OFF A FOE, OR COME DOWN AMONG THEM ON THE GROUND.', { pyro: 'DOWN+X IN THE AIR: FIREDROP. BOUNCE OFF WHAT YOU HIT, OR LAND AMONG THEM.', paladin: 'DOWN+X IN THE AIR: HAMMERFALL. BOUNCE OFF A FOE, OR SHAKE THE GROUND UNDER THEM.', warden: 'DOWN+X IN THE AIR: PLUNGE. PIN A FOE, VAULT OFF IT, OR CRACK THE GROUND AHEAD.' });
  /* THE DEEP POOL: the first moving platform in the game, a log raft, SIGNED at its landing; the pool is the lethal look (a quiet drain, swum out of) */
  block(130, 146, 27, 27); water(130, 146, 23, { bed: 27 });
  block(145, 146, 23, 26);   /* a drowned stump under the far bank: whoever misses the raft swims to it and climbs out (a swim costs, it does not hold you) */
  ent('mover', 130, 22, { len: 5, range: 12 });   /* (its run touches the landing stone at one end and the far bank at the other) */
  sign(128, 21, 'A LOG RAFT DRIFTS OVER THE DEEP POOL: STEP ON AND RIDE IT ACROSS.');
  /* (the raft's run is calm: the first ride is taught where a miss is a swim, A4 - the plunge's wasps hang over the ford instead) */
  coins([134, 19], [138, 19], [142, 19]);
  block(147, 165, 22, 27); for (let x = 152; x <= 156; x++) for (let y = 22; y <= 23; y++) set(x, y, T.AIR);   /* the far bank: a sawdust hollow two rows down, the crew in it, and a marked pine leaning over it */
  fell('sett');
  ent('sprig', 153, 23, { face: -1 }); ent('sprig', 155, 23, { face: -1 }); ent('lurker', 156, 23, { face: -1 });   /* the down attack: three bunched in the hollow - come down among them off the decks */
  lessons.push({ kind: 'down', x0: 147, x1: 162 });
  coins([160, 20]); deck(158, 19, 4); coins([150, 18], [152, 18], [158, 18], [159, 18]);   /* perches over the crew: come down among them */
  block(163, 165, 21, 27); block(166, 175, 19, 27); block(176, 205, 17, 27);   /* the bank steps up off the ford: a stump, then the bank */
  deck(168, 16, 3); coins([168, 15], [169, 15]); deck(178, 14, 4); coins([179, 13]);
  sign(172, 18, 'A BADGER OUT OF ITS SETT. ON ITS ! IT CHARGES: JUMP IT, THEN COME DOWN ON ITS BACK.');
  ent('badger', 182, 16, { face: -1 }); ent('crow', 186, 11);
  /* THE VINE POCKET: a vine off a pine bough swings up to a ledge in the canopy, and a silver on it */
  swing(192, 10, 70, 0.4); deck(196, 10, 7); coins([196, 9], [198, 9]); ent('vault', 199, 9);
  deco('hiveBg', 188, 16, { v: 2 });
  ent('thorn', 190, 16, { face: -1 }); ent('shield', 196, 16, { face: -1 }); ent('spit', 200, 16, { face: -1 });   /* the area's exam: the badger with a thorn and a spitter behind him */
  ent('check', 203, 16);

  // ================= 3. THE LUMBER CAMP (206-300): REMIX - the camp gate's parry, the sawpit, the log stacks, THE BRIAR MAUL, the LEAN-TO =================
  floor(206, 227, 17); floor(228, 236, 19); floor(237, 276, 17);
  deco('fence', 207, 16, { v: 0 }); deco('fence', 224, 16, { v: 1 });
  sign(209, 16, 'A PERFECT GUARD: RAISE C AS HIS SWORD FLASHES. HE REELS - YOUR RIPOSTE CUT IS HEAVY.', { pyro: 'PARRY: HOLD DOWN AS HIS SWORD RISES. THE FLARE CATCHES IT - THEN RIPOSTE.', reaper: 'PARRY: HOLD THE WARD, LET GO AS HIS SWORD FLASHES. HE REELS - THEN RIPOSTE.', paladin: 'PARRY: RAISE THE AEGIS AS HIS SWORD FLASHES. HE REELS - THEN RIPOSTE.', pirate: 'PARRY: TAP C AS HIS SWORD FLASHES. THE CUTLASS BINDS IT - THEN RIPOSTE.', warden: 'PARRY: TAP C AS HIS SWORD FLASHES. THE SHAFT TURNS IT - THEN RIPOSTE.', geomancer: 'PARRY: RAISE THE WARD AS HIS SWORD FLASHES. STONE TURNS IT - THEN RIPOSTE.', berserker: 'PARRY: TAP C AS HIS SWORD FLASHES. BRACE AND TAKE IT - THEN RIPOSTE.' });
  ent('swornsword', 217, 16, { face: -1, lesson: 'parry' });   /* the camp gate's watchman: the slowest blow in the game, one at a time, his sword FLASHES on the beat */
  lessons.push({ kind: 'parry', x0: 207, x1: 226 });
  coins([212, 15], [214, 14], [220, 15]); deck(211, 14, 3); deck(221, 14, 3);
  /* THE SAWPIT: two rows down, the saw frame over it */
  ent('cage', 233, 18, { kind: 'bird' }); ent('lurker', 235, 18, { face: -1 });
  coins([229, 17], [232, 16], [236, 17]);
  /* THE LOG STACKS: step up, and a spitter on the top stack */
  block(240, 243, 15, 16); block(244, 246, 13, 16); ent('spit', 245, 12, { face: -1 }); coins([241, 14], [245, 11]);
  deck(249, 13, 3); coins([249, 12], [250, 12]);
  /* THE BRIAR MAUL (src/order-chapters.js ORDER_AT.wood: the Thorn Chapter's knight, the camp's exam) stands in the yard at 254 and holds his gate at 260 */
  ent('thorn', 258, 16, { face: -1 });
  /* THE LEAN-TO: the camp ends under the cliff. Its marked pine, felled, lies up against the cliff top: the only way out of the camp */
  fell('leanto');
  sign(264, 16, 'THE CAMP ENDS AT THE CLIFF. ITS PINE LEANS UP AT THE TOP: FELL IT AND CLIMB THE TRUNK.');
  block(277, 300, 11, 27);
  ent('shield', 281, 10, { face: -1 }); ent('spit', 288, 10, { face: -1 }); ent('wasp', 291, 7);   /* the skid landing's guard, met at the top of the lean-to */
  /* THE WOODSMEN'S STORE: a cave dug into the foot of the cliff off the yard, where the camp kept its tools - a dead end with their wages in it */
  for (let x = 277; x <= 285; x++) for (let y = 14; y <= 16; y++) set(x, y, T.AIR);
  coins([282, 16], [283, 16], [284, 16], [285, 16]); ent('cage', 280, 16, { kind: 'bird' });
  coins([279, 10], [282, 10], [285, 10]); deck(281, 8, 4); deck(292, 8, 4); coins([282, 7], [293, 7]);
  ent('check', 298, 10);

  // ================= 4. THE HIVE PINES (301-409): REMIX - the ridge's wasps (the rising cut), THE DROP onto the crew, the HOLLOW LOG =================
  block(301, 334, 11, 27);
  /* THE CREW'S DEN: dug into the ridge's foot from the hollow, the goblins' bolt-hole - a dead end with what they took */
  for (let x = 325; x <= 334; x++) for (let y = 14; y <= 16; y++) set(x, y, T.AIR);
  coins([325, 16], [326, 16], [327, 16], [328, 16]);
  sign(303, 10, 'WASPS HANG OVER THE RIDGE. UP+X: THE RISING CUT REACHES ONE OVER YOUR HEAD.');
  deco('hiveBg', 311, 10, { v: 0 }); deco('hiveBg', 326, 10, { v: 1 }); ent('thorn', 312, 10, { face: -1 });
  ent('wasp', 308, 7); ent('wasp', 314, 6); ent('crow', 319, 5); ent('wasp', 323, 7); ent('badger', 320, 10, { face: -1 });
  deck(316, 8, 3); coins([316, 7], [317, 7], [318, 7]); deck(305, 8, 3); deck(326, 8, 3);
  coins([306, 9], [312, 9], [321, 9]);
  /* THE DROP: the ridge's last pine leans out over the hollow, and the goblin crew stands under its line */
  fell('drop');
  sign(329, 10, 'THIS PINE LEANS OUT OVER THE HOLLOW. FELL IT ON THE GOBLINS BELOW.');
  ent('shield', 331, 10, { face: -1 });   /* the crew's lookout on the lip, by the pine: the hollow at his back */
  floor(335, 352, 17); deck(336, 14, 3);
  ent('sprig', 338, 16, { face: -1 }); ent('shield', 341, 16, { face: -1 }); ent('sprig', 343, 16, { face: -1 }); ent('badger', 346, 16, { face: -1 });
  coins([348, 15], [350, 15]);
  /* THE HOLLOW LOG: a fallen giant across the hollow. Over the top for coins and wasps, or through the hollow for quiet */
  block(350, 351, 14, 16);
  block(353, 385, 11, 13);
  floor(353, 392, 17);
  sign(350, 13, 'THE FALLEN GIANT: OVER THE TOP FOR COINS, OR THROUGH THE HOLLOW FOR QUIET.');
  ent('spit', 366, 16, { face: -1 }); ent('badger', 373, 16, { face: -1 }); ent('lurker', 380, 16, { face: -1 });   /* the hollow: a badger charging down the tunnel at you */
  coins([358, 16], [363, 16], [372, 16], [382, 16]);
  ent('wasp', 362, 7); ent('wasp', 368, 7); ent('wasp', 375, 6); coins([357, 10], [361, 10], [365, 10], [369, 10], [377, 10], [381, 10]);
  /* up a vine from the log's top into the canopy: a high pocket with a silver in it */
  swing(371, 4.5, 64, 1.6); deck(376, 6, 6); ent('silver', 377, 5); coins([376, 5], [378, 5]);
  block(393, 397, 15, 27); block(398, 416, 13, 27);
  deck(401, 10, 3); coins([401, 9], [402, 9]); deck(388, 14, 3); deck(395, 12, 3); deck(409, 10, 3);
  ent('thorn', 395, 14, { face: -1 }); ent('sprig', 403, 12, { face: -1 }); ent('spit', 402, 9, { face: -1 });
  ent('check', 407, 12);

  // ================= 5. THE TARN (410-509): EXAM - the tarn bridge under wasps and the badger, the helm pit, the climb to the hive =================
  sign(411, 12, 'THE TARN. FELL ITS PINE FOR A BRIDGE - THE WASPS AND THE BADGER WILL NOT WAIT.');
  fell('tarn');
  /* the tarn: twelve columns of deep water in a cleft, its surface five rows under the banks; a stone on the near side is the way out of it */
  block(417, 428, 23, 27); block(417, 417, 16, 22); water(418, 428, 18, { bed: 23 });
  ent('wasp', 420, 9, { pogo: true }); ent('wasp', 424, 9, { pogo: true }); ent('crow', 427, 8);
  coins([420, 11], [424, 11]); coins([424, 22], [425, 22], [426, 22], [427, 22]);   /* the tarn's bed: a woodsman's lost purse - a deep dive for it costs you */
  block(429, 441, 13, 27);
  ent('badger', 432, 12, { face: -1 }); ent('sprig', 438, 12, { face: -1 });   /* he charges back along the trunk: a hit throws you the way he runs, over the water you just crossed */
  coins([435, 11], [438, 11]);
  /* THE HELM PIT: shields on stumps over a thorn bed - plunge the helm, land behind, cut */
  sign(440, 12, 'SHIELD GOBLINS HIDE BEHIND IRON. PLUNGE THE HELM, LAND BEHIND, CUT.', { pyro: 'SHIELD GOBLINS HIDE BEHIND IRON. ARC AN EMBER OVER, OR FIREDROP THE HELM.', paladin: 'SHIELD GOBLINS HIDE BEHIND IRON. HAMMERFALL THE HELM, LAND BEHIND, STRIKE.' });
  block(442, 451, 17, 27); spikes(442, 451, 16);
  for (const x of [443, 448]) { block(x, x + 3, 13, 16); ent('shield', x + 1, 12, { face: -1 }); }   /* (four wide: room to land behind him) */   /* two stumps level with the banks, a shield goblin on each: no way round him, the thorns either side */
  block(452, 470, 13, 27);
  ent('cage', 455, 12, { kind: 'bird' }); deck(454, 10, 3);
  deck(459, 10, 3); coins([459, 9], [460, 9], [461, 9]); deck(465, 10, 3);
  ent('spit', 466, 12, { face: -1 }); ent('sprig', 468, 12, { face: -1 });
  deco('hiveBg', 462, 12, { v: 2 }); ent('wasp', 463, 7);
  block(471, 478, 11, 27); block(479, 549, 9, 27);
  block(483, 492, 8, 8);   /* THE HIVE KNOLL: the last rise before the door, the comb in sight over it */
  swing(474, 4.75, 60, 2.4); deck(480, 5, 6); coins([480, 4], [481, 4], [482, 4]);   /* a last vine up into the pines over the hive's door: coins, and a look at the comb */
  coins([473, 10], [476, 10], [483, 8], [488, 8]); deck(472, 8, 3); deck(487, 5, 4); deck(496, 6, 4); coins([488, 4], [497, 5]);
  ent('shield', 489, 7, { face: -1 }); ent('sprig', 493, 8, { face: -1 }); ent('thorn', 498, 8, { face: -1 });
  /* the quiet walk to the hive's door */
  coins([500, 7], [503, 7]); deck(501, 6, 3);
  ent('check', 506, 8);

  // ================= 6. THE HIVE CLEARING (510-549): THE HORNET QUEEN - the old clearing to the column (her numbers stand) =================
  /* (the old builder's section 9, original columns 284-323, shifted +226: the gate, the right wall, the two low combs, the paper combs and drips, the Queen, and the
     dead pine at the west wall that four strokes lay across the near comb as a third perch at her height - and her COMB HANGS FROM IT: the art lane hangs the
     comb's paper from the pine's boughs, so the pine you fell is the one her comb is on) */
  sign(510, 8, 'THE HIVE. HER STING STICKS IN WOOD: LURE HER DIVE ONTO A PERCH OR HER PINE, THEN CUT.');
  ent('gate', GATE_COL, 8);
  block(549, 549, 0, 8);
  plat(518, 6, 3); plat(541, 6, 3);
  deco('hiveBg', 522, 8); deco('hiveBg', 540, 8);
  deco('drip', 519, 5, { hang: true }); deco('drip', 526, 4, { hang: true }); deco('drip', 535, 5, { hang: true }); deco('drip', 544, 4, { hang: true });
  deco('hiveBg', 519, 2, { v: 0, hang: true });   /* her comb, hung in the great pine's crown (greybox: the art lane draws it on the boughs) */
  ent('queen', 530, 3);
  fell('hive');

  const ret = {
    routeSupports: [277, 281, 285, 325, 330, 334].map(x => ({ x, y: 13, bottom: 17, kind: 'crib', post: true })),   /* the store's and the den's roof props: timber posts under the beam (art: drawn as props, never collision) */
    lumberKit: true,   /* (claude/lumbertrailart) the trail's own tile kit, supports, props and landmark: src/redraw/lumber_trail_*.js */
    tints: [[0, 104, [255, 214, 140], 0.10], [105, 205, [140, 196, 214], 0.12], [206, 300, [214, 150, 84], 0.10], [301, 409, [30, 76, 50], 0.14], [410, 509, [60, 96, 140], 0.18], [510, 549, [240, 180, 40], 0.16]],   /* the cabin glade's gold, the ford's cool mist, the camp's smoke-amber, the ridge's deep green, the tarn's cold blue, the hive's amber */
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 21 }, pools, falls: [], moversExtra, lessons, fellRamps: true,
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, ''), name, x0, x1 })),
    duskStart: 5800, duskLen: 1000, music: 'brackenwood',
    weather: [{ x0: 0, x1: 104 * TS, kind: 'pollen' }, { x0: 105 * TS, x1: 206 * TS, kind: 'mist' }, { x0: 410 * TS, x1: 430 * TS, kind: 'mist' }, { x0: 470 * TS, x1: 99999, kind: 'rain' }],
    ambient: [{ x0: 0, x1: 108 * TS, kind: 'forest' }, { x0: 108 * TS, x1: 166 * TS, kind: 'water' }, { x0: 166 * TS, x1: 410 * TS, kind: 'forest' }, { x0: 410 * TS, x1: 442 * TS, kind: 'water' }, { x0: 442 * TS, x1: 506 * TS, kind: 'forest' }, { x0: 506 * TS, x1: 99999, kind: 'hive' }],
    arena: { x0: 514 * TS, x1: 547 * TS, floor: 9 * TS, trigger: 518 * TS, wallL: 513, wallR: 547, boss: 'queen', tint: '#e0b040', tintA: 0.12, fx: 'bees' },
  };
  return ret;
}
