/* src/checkpoint-thin.js - WHICH CHECKPOINTS THE BUILD THROWS AWAY (claude/checkpoints, 2026-09-29).
   Daniel, 2026-09-28, the Salt & Sanctuary direction: "too many checkpoints is part of the problem". The campaign stood one shrine every
   ~45 route tiles (four hundred of them); the rule now is one per SECTION, about every 120-160 walked route tiles, and always one right
   before each boss door, mini arena and ambush room (RULES-LEVELS-AND-BOSSES.md, S4). src/level.js checkpoints() takes these
   coordinates out of a level's list, on the level's FINAL grid, before it fills any run.
   NOT HAND-EDITED: node tools/checkpoint-thin.mjs --write picks the set for every level from the walked route (tools/pacing.mjs) and rewrites
   this table; tools/checkpoint-gaps.mjs holds the result (max gap, min spacing, a checkpoint before every door) and fails a listed drop that names
   a checkpoint no level has any more. THIN.off lets the picker build a level with every checkpoint still standing. */
export const THIN = { off: false };
/* WHAT STAYS BECAUSE A LEVEL'S OWN MECHANIC OR EXAM PINS IT WHERE IT STANDS (hand-edited; each with the tool that reads it). The picker keeps these, and
   tools/checkpoint-rule.mjs lets them stand closer than MIN to a neighbour, as it does a door checkpoint. The checkpoint just outside a boss arena's wall needs no entry: the picker finds it. */
export const CHECK_PIN = {
  hanging: [[10, 37], [96, 37]],   /* tools/hanging-exam.mjs: the lantern stair keeps both checkpoints that bracket its bridge (S3: the exam has one before it and one outside) */
  witchlight: [[519, 26]],   /* tools/whelps.mjs: a checkpoint at WL.EXAM[0], the door of the exam (S3) */
  fallingtower: [[30, 299], [40, 239], [54, 217], [50, 179], [57, 116], [7, 56], [84, 146]],   /* (claude/fallingtower2: the crown's last climb is THE OUTER FACE now - its checkpoint stands on the face's top plank, 7,56) */   /* tools/tower-ascent.mjs: a checkpoint on EACH of the tower's floors (a floor is a section: 7 of them, the mini's door covers the burst cistern), and the last before the sky on the crown's last climb; tools/tower-chase.mjs: ONE on the spiral stair, at its FOOT (84,146 since claude/archmage3: ten flights deep with THE ORRERY LOFT, and you come out of his ring on its LEFT; claude/towerscroll: the rising dark's start line wants a shrine just under it, src/chase.js; boarding the carpet sets the door one) */
  keep: [[634, 58]],   /* tools/keep-rework.mjs: a checkpoint at THE KING'S DOOR's first column (the exam's door, S3; the one outside the arena is found by the picker) */
  burial: [[369, 21]],   /* tools/burial2.mjs: a checkpoint at the exam's door (S3, within 3 columns of column 367) */
  marsh: [[391, 17]],   /* tools/raft-call.mjs: the dock checkpoint - a death on the Grove raft wakes you on the dock, and the raft comes back to you */
};
export const CHECK_DROP = {
  wood: [[55,21],[126,21],[166,21],[175,21],[266,21],[281,11],[368,11],[453,14]],
  marsh: [[47,21],[163,17],[206,17],[216,17],[313,17]],
  stockade: [[36,19],[135,19],[224,19],[299,19],[331,19],[421,11]],
  spore: [[63,11],[132,19],[283,13],[371,13],[408,13]],
  kings: [[43,19],[153,21],[241,13],[405,20],[566,11]],
  scree: [[58,19],[105,19],[222,13],[493,18],[500,18],[534,8]],   /* (claude/scree2: the rockslide chase grew 96 columns in at 339 - 404/438 are 500/534 now; the ropeway's own shrine (493) goes for the chase's shrine on the gorge bank (441); the slope's 330 went with the slope; and the pasture's 58, 56 tiles from the start: difficulty v2, one a section) */
  hanging: [[12,51],[43,79],[98,107]],
  spire: [[8,195],[13,117],[21,217],[22,55],[30,99],[72,151]],
  moor: [[25,21],[52,21],[204,21],[296,13],[399,13],[406,13],[494,13]],
  storm: [[29,35],[76,35],[173,31],[190,31],[258,31],[274,31],[306,31],[351,29],[388,29],[425,29],[503,28],[533,29]],
  crown: [[12,95],[196,63],[282,63],[326,63],[395,63],[660,63],[750,51]],
  longwater: [[4,7],[165,27],[319,25],[442,26]],
  reef: [[9,27],[152,17],[272,11],[414,29]],
  flotilla: [[8,25],[35,23],[118,21],[187,24]],
  hurricane: [[30,19],[186,19],[292,19],[474,19],[509,16],[572,19],[654,19],[666,26]],
  lamplit: [[10,9],[52,21],[134,22],[180,37],[246,21],[263,21],[348,37],[420,21],[436,21],[522,22],[578,21]],
  deep: [[8,27],[12,209],[14,237],[16,81],[40,129],[40,176],[54,41],[60,242],[62,63],[66,103],[76,137],[78,47],[86,121]],
  keep: [[4,58],[60,58],[194,43],[327,43],[562,58]],
  causeway: [[9,17],[163,23],[318,23],[499,18]],
  harbor: [[5,29],[95,29],[252,29],[735,29],[866,29]],
  waymeet: [[8,35],[60,20],[127,35],[372,31],[652,35]],
  undercrown: [[6,23],[22,23],[47,105],[50,33],[62,55],[68,33],[86,140],[94,121],[99,121]],
  fields: [[6,33],[99,31],[200,33],[253,33],[337,33],[343,33],[460,33],[541,27],[599,27],[637,33]],
  burial: [[5,17],[180,21],[364,70]],
  mage: [[5,39],[40,39],[260,39],[281,29],[362,39],[391,39],[421,39],[442,39],[482,39],[545,27],[556,18],[567,10],[600,15],[645,15],[683,15],[691,15],[709,15],[732,15]],
  fallingtower: [[14,149],[15,191],[24,263],[30,83],[50,185]],
  burning: [[404,25]],
  witchlight: [[45,78],[80,76],[143,76],[171,76],[242,50],[256,40],[290,40],[360,40],[476,25]],
  oreroad: [[5,36],[41,36],[64,36],[100,36],[124,36],[148,28],[200,21],[229,27],[266,34],[300,30],[350,20],[382,16],[415,12],[454,12]],
  unburied: [[6,36],[80,38],[196,41],[261,20],[263,36],[484,36]],
  caravan: [[5,23],[128,29],[266,27],[378,30],[463,30]],
};
