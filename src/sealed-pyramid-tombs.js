// src/sealed-pyramid-tombs.js - THE SEALED PYRAMID's SECOND HALF: the way UP from the Scarab Mother's lair to the king's burial chamber (claude/pyramidlevel,
// the OPUS extension, 2026-10-13). Daniel 10-13: "way too short" - mummies and skeletons from tombs, a poison area, a fire area, a water area, the old desert
// content reused, the Scarab Mother a MINI mid-level and a NEW boss at the end (scratch/briefs-sealedpyramid-1013.md LANE A). src/sealed-pyramid.js calls
// buildTombHalf() once the first half and her lair are carved; everything here is the SAME RULE (one machine, src/sealed-pyramid-hands.js):
//   TREAD A PALE PLATE AND ITS TRAP FIRES ON WHATEVER STANDS IN ITS REACH - and the tomb's deeper traps are its hazards:
//     GAS    THE EMBALMERS' GAS: the plate opens the jets under its reach and a green cloud stands in it a beat (it unmakes the dead as surely as the living)
//     OIL    THE OIL CHANNELS: the plate tips its brazier into a channel cut in the floor and the fire RUNS the channel, then burns a beat (a mummy's linen catches)
//     FLOOD  THE SLUICES: the plate opens a sluice - a BORE runs the crypt's floor first (it drowns what stands there), then the WATER RISES and you swim up on it
//   and THE TOMBS: a lid cracks (told: the crack, the dust, '!'), and the dead get up - MUMMIES (heavy: they tread the plates) and THE TOMB GUARD (src/mummy.js
//   SKEL: the mummy's machine in bone, light - it walks the reaches without firing them).
// Ambient hazards reused from the earlier levels (A9 / brief item 3): the Burial Caverns' breathing gas vents (L.gasVents), the Burial Caverns' giving courses
// (L.crumble), the desert's venom and fire scorpions, the Buried City's BRASS WARDEN (construct) and sand-drowned, the tomb jackals and dart-blowers.
//
// FIVE SECTIONS (columns; floors are the solid surface rows):
//   493-610   THE HALL OF THE DEAD       the tombs taught (a lid cracks, a mummy gets up), the groove they rise in (lure the risen under the stone),
//                                        EXAM: THE BRASS WARDEN standing in the upper hall's groove, the stone's plate before him
//   611-735   THE EMBALMERS' GALLERY     POISON: the breathing vents (cross between breaths), the gas trap taught on a guard, the gas corridor spent (pale stones,
//                                        refuge shelves; a mummy treads them behind you), the blowers' niche gassed from below,
//                                        EXAM: THE OLD STINGER (venom scorpion elite) on the vents, the gas plate before him
//   736-862   THE OIL CHANNELS           FIRE: the channel taught on a guard, the long channel spent (refuges), THE OIL FALL (the fire poured from a high walk onto
//                                        the squad below), EXAM: THE TOMB-WARDEN II in the last channel
//   863-962   THE FLOODED CRYPT          WATER: the cistern (the sluice taught: the bore, then swim up on the water - REQUIRED), THE CRYPT (the bore drowns the risen
//                                        squad; the water is the only way to the high door - REQUIRED), EXAM: THE BRASS WARDEN II guarding the crypt's sluice plate
//   963-1006  THE KING'S STAIR           A14 PLATFORMING (its own exam): narrow courses over the scarab well, the old ones GIVE (crumble), the dart volley spent
//                                        from a plate-course before the last run
//   1007-1047 THE BURIAL CHAMBER         THE TOMB-KING'S SARCOPHAGUS's arena (claude/pyramidboss, LANE B: src/tomb-king.js): floor + two side ledges (on chains),
//                                        a switch on each wall that swings its counterweight across the floor, three pale plates firing the chamber's traps
//                                        (two ceiling blocks, two dart walls), four floor alcoves for his dead; the level's gate beyond its east door
// ART IS PLACEHOLDER (readable shapes, src/sealed-pyramid-hands.js drawTombHalf): lane C draws the kit (work/claude/lane-done/claude-pyramidlevel.md ART list).

/* THE ROWS of the second half (floors) */
export const TH = { hall: 57, upper: 51, gas: 51, gasHi: 48, oil: 48, oilHi: 42, cistern: 48, lip: 42, crypt: 54, landing: 30, stair: 34, burial: 24, W: 1052 };
/* THE ARENA SLOTS: MINI_SLOT is the Scarab Mother's lair (her antechamber, mid-level) - since claude/pyramidboss she is the level's MINI there (L.mini; her east door
   is its portcullis, L.mini.gate); BOSS_SLOT is the burial chamber at the end - THE TOMB-KING'S SARCOPHAGUS's arena (L.arena, src/tomb-king.js).
   (claude/pyramidboss, LANE B) The side ledges came down to row 21 (three rows over the floor, a base jump: at row 17 no hero could reach them - src/reachcore.js
   JUMP_UP 3). A SWITCH (a lever) on each wall at its ledge's end - struck from the ledge, or a jump from the floor under it - throws that side's COUNTERWEIGHT (a stone
   on a chain from the roof at `anchor`) across the floor's near half (`sweep`). The three pale plates are the chamber's traps (plateTraps: the west block, the middle
   plate's two dart walls, the east block; plateReach: where each fires - every plate stands before its reach). The two ceiling slots hold the blocks; four floor
   ALCOVES his Grave Call raises the dead from; `king`: where he stands asleep (where the placeholder great sarcophagus stood) */
export const MINI_SLOT = { sx: 452, R: 57, W: 40, eastDoor: { col: 492, y0: 51, y1: 56 }, check: 448 };
export const BOSS_SLOT = { x0: 1007, x1: 1046, floor: 24, roof: 4, westDoor: { col: 1006, y0: 18, y1: 23 }, eastDoor: { col: 1047, y0: 18, y1: 23 }, gate: 1049, check: 1003,
  ledges: [{ x0: 1009, x1: 1014, y: 21 }, { x0: 1039, x1: 1044, y: 21 }],
  switches: [{ x: 1008, y: 18, sweep: [1007, 1022], anchor: 1016 }, { x: 1045, y: 18, sweep: [1031, 1046], anchor: 1037 }],
  plates: [[1017, 1018], [1026, 1027], [1035, 1036]], plateTraps: [['tkBlockW'], ['tkDartsW', 'tkDartsE'], ['tkBlockE']], plateReach: [[[1019, 1023]], [[1007, 1025], [1028, 1046]], [[1030, 1034]]],
  slots: [[1019, 1023], [1030, 1034]], alcoves: [1012, 1021, 1032, 1041], king: 1032 };
/* each new use's arc (tile columns) - read by tools/sealed-pyramid.mjs alongside the first half's ARCS */
export const ARCS2 = {
  rise: { teach: [499, 510], test: [517, 556], remix: [562, 592], exam: [594, 610] },              /* THE TOMBS: the lid taught; the risen squad in the groove; the pair in the upper hall; the warden's tomb behind him */
  gas: { teach: [637, 648], test: [651, 668], remix: [672, 690], exam: [702, 724] },               /* the guard gassed; the corridor spent; the niche gassed from below; THE OLD STINGER */
  burn: { teach: [745, 760], test: [767, 796], remix: [806, 832], exam: [836, 851] },              /* the guard's linen; the long channel spent; THE OIL FALL; THE TOMB-WARDEN II */
  flood: { teach: [864, 878], test: [885, 950], exam: [930, 950] },                               /* the cistern (swim up, REQUIRED); the crypt (the bore drowns the squad, the water the only way up, REQUIRED); THE BRASS WARDEN II at the sluice */
  climb: { teach: [963, 972], test: [973, 987], exam: [988, 1003] },                               /* THE KING'S STAIR (A14): the giving courses; the dart plate spent; the last run */
};
export const SECTIONS2 = [['THE HALL OF THE DEAD', 493], ['THE EMBALMERS\' GALLERY', 611], ['THE OIL CHANNELS', 736], ['THE FLOODED CRYPT', 863], ['THE KING\'S STAIR', 963], ['THE BURIAL CHAMBER', 1007]];
/* the route's needs in the second half (src/stuck-spots.js + the walker's hints): [column, the row he stands on] */
export const SPOTS2 = { flood1: [864, 47], flood1up: [880, 41], flood2: [944, 53], flood2up: [952, 29], stairPlate: [985, 25] };

export function buildTombHalf(B) {
  const { set, block, ent, air, T, TS, sign, mummy, guard, blower, jackal, scarab, foe, ledge, lamp, decor, interiors, structures, plats } = B;
  const traps = [], tombs = [], gasVents = [], crumble = [], pools = [];
  const skel = (x, y, squad, o) => foe('mummy', x, y, squad, Object.assign({ cnSkin: 'tombskel' }, o || {}));                    /* THE TOMB GUARD: the mummy's machine in bone (src/mummy.js SKEL) */
  const venom = (x, y, squad, o) => foe('scorpion', x, y, squad, Object.assign({ cnSkin: 'venomscorpion' }, o || {}));             /* THE VENOM SCORPION (the desert's second cast, reused) */
  const firesc = (x, y, squad, o) => foe('scorpion', x, y, squad, Object.assign({ cnSkin: 'firescorpion' }, o || {}));             /* THE FIRE SCORPION (reused: its sting leaves the ground burning) */
  const brass = (x, y, squad, o) => foe('construct', x, y, squad, o);                                                             /* THE BRASS WARDEN: the Buried City's clockwork construct (a callback) */
  const drowned = (x, y, squad, o) => foe('ambusher', x, y, squad, Object.assign({ cnSkin: 'sanddrowned' }, o || {}));            /* THE SAND-DROWNED (the Buried City's, reused) */
  /* A TOMB: a lidded niche in the wall at floor level (or on a shelf). Its dead wait inside (tombWait: the ent is spawned by the hands when the lid gives).
     wake: the columns a hero in which (within `dy` rows) cracks the lid - told at once, the dead out TOMB.crack s later */
  const tomb = (id, x, row, kind, wake, squad, o) => { tombs.push({ id, x, row, kind, wake, dy: 7 }); (kind === 'skel' ? skel : mummy)(x, row - 1, squad, Object.assign({ tombWait: id, face: -1 }, o || {})); };
  const vent = (x, y, phase) => gasVents.push({ x, y, phase, period: 3.4, hitT: 0, litT: 0 });

  // ================= THE LAIR'S EAST DOOR: the way on past the Scarab Mother - her PORTCULLIS (claude/pyramidboss: L.mini.gate; her death lifts it) =================
  for (let y = MINI_SLOT.eastDoor.y0; y <= MINI_SLOT.eastDoor.y1; y++) set(MINI_SLOT.eastDoor.col, y, T.PORT);

  // ================= 6. THE HALL OF THE DEAD (493-610): the tombs taught; the groove the risen walk; the upper hall; EXAM: THE BRASS WARDEN =================
  const HA = TH.hall, UP = TH.upper;
  air(493, 560, HA - 12, HA - 1); interiors.push([493, 560, HA - 12, HA - 1, 'pyTombs']);
  /* (no shrine of its own past her lair: the one at 448 before her door is the hall's - A10b spacing; the next is the gallery's at 615) */
  sign(499, HA - 1, 'THE HALL OF THE DEAD. WHEN A LID CRACKS, THE DEAD GET UP.');
  lamp(503, HA - 11); lamp(530, HA - 11); lamp(552, HA - 11);
  decor.push({ kind: 'robbers', x: 501, y: HA - 1 });                                                        /* (a callback: the Buried City's robbers came this far - a sand-gate key and a broken hourglass by their bones) */
  tomb('h1', 506, HA, 'mummy', [499, 512], 'hallH1');                                                       /* THE FIRST TOMB (taught where it is cheap: one of the dead, on the flat) */
  ledge('shelf', 510, 515, HA - 4); tomb('h2', 513, HA - 4, 'skel', [507, 520], 'hallH2');                   /* a tomb on a shelf: the bones drop to you */
  /* THE GROOVE OF THE RISEN: the stone's plate at the hall's west end; three tombs in its road; their dead get up as you come to the plate and walk the groove to you */
  air(524, 525, HA - 14, HA - 13);
  traps.push({ id: 'hallStone', kind: 'stone', plates: [[520, 521, HA]], inner: [[540, 541, HA]], zone: [524, 556, HA - 2, HA - 1], home: 524, end: 556, row: HA, drop: [HA - 14, HA - 13], reset: 5.0, section: 'test' });
  ent('tplate', 520, HA - 1, { trap: 'hallStone' }); ent('rollstone', 524, HA - 1, { trap: 'hallStone' });
  sign(518, HA - 1, 'THE DEAD RISE IN THE STONE\'S ROAD. TREAD ITS PLATE WHEN THEY WALK IT.');
  tomb('h3', 534, HA, 'mummy', [517, 560], 'hallSquad'); tomb('h4', 546, HA, 'skel', [517, 560], 'hallSquad'); tomb('h5', 553, HA, 'mummy', [517, 560], 'hallSquad');
  ledge('shelf', 529, 532, HA - 4); ledge('shelf', 543, 545, HA - 4); ledge('shelf', 549, 552, HA - 7); blower(550, HA - 8, 'hallBlower');
  decor.push({ kind: 'groove', x0: 524, x1: 556, y: HA - 1 }, { kind: 'bones', x0: 537, x1: 539, y: HA - 1 });
  drowned(528, HA - 1, 'hallDrowned');                                                                     /* (a sand-drowned under a drift of the hall's sand: the Buried City's) */
  /* THE UPPER HALL: two steps up; a pair of tombs; the warden's groove */
  block(557, 560, HA - 3, HA - 1); air(557, 610, UP - 11, UP - 1); interiors.push([557, 610, UP - 11, UP - 1, 'pyTombs']);
  tomb('h6', 570, UP, 'skel', [562, 590], 'upperPair'); tomb('h7', 576, UP, 'mummy', [562, 590], 'upperPair');
  jackal(582, UP - 1, 'upperPair'); lamp(566, UP - 11); lamp(600, UP - 11);
  ledge('shelf', 565, 569, UP - 3); ledge('shelf', 586, 590, UP - 3);
  /* EXAM: THE BRASS WARDEN (the Buried City's construct, its elite) stands in the upper groove; its stone rolls WEST from the niche by his back; his tomb-guard behind him */
  air(608, 609, UP - 13, UP - 12);
  traps.push({ id: 'hallExam', kind: 'stone', plates: [[586, 587, UP]], zone: [589, 608, UP - 2, UP - 1], home: 608, end: 589, row: UP, drop: [UP - 13, UP - 12], reset: 5.0, section: 'exam' });
  ent('tplate', 586, UP - 1, { trap: 'hallExam' }); ent('rollstone', 608, UP - 1, { trap: 'hallExam' });
  sign(584, UP - 1, 'THE BRASS WARDEN. HIS STONE RUNS FROM BEHIND HIM - IT TAKES ONLY A SHARE OF HIM.');
  brass(598, UP - 1, 'hallWarden', { elite: true, gate: 611 });
  tomb('h8', 604, UP, 'skel', [592, 610], 'hallWarden');
  decor.push({ kind: 'groove', x0: 589, x1: 608, y: UP - 1 }, { kind: 'bones', x0: 594, x1: 596, y: UP - 1 });
  air(611, 618, UP - 6, UP - 1); interiors.push([611, 618, UP - 6, UP - 1, 'pyTombs']);                                                                             /* his door (the elite's gate) and the passage on */

  // ================= 7. THE EMBALMERS' GALLERY (611-735): POISON =================
  const GA = TH.gas, GH = TH.gasHi;
  ent('check', 615, GA - 1);                                                                                 /* CHECKPOINT SIX */
  air(619, 668, GA - 12, GA - 1); interiors.push([619, 668, GA - 12, GA - 1, 'pyGas']);
  sign(617, GA - 1, 'THE EMBALMERS\' GALLERY. THE VENTS BREATHE ON A CYCLE: CROSS BETWEEN BREATHS.');
  vent(622, GA, 0); vent(626, GA, 1.1); vent(630, GA, 2.2);                                                  /* the breathing vents (the Burial Caverns' kit): taught on the flat */
  venom(634, GA - 1, 'gasVenom'); lamp(621, GA - 11); lamp(646, GA - 11);
  /* THE GAS TAUGHT: the plate, the jets under its reach, a guard on his beat in it */
  traps.push({ id: 'gas1', kind: 'gas', plates: [[637, 638, GA]], zone: [641, 648, GA - 3, GA - 1], jets: [642, 645, 648], gasT: 2.4, reset: 4.0, section: 'teach' });
  ent('tplate', 637, GA - 1, { trap: 'gas1' });
  sign(635, GA - 1, 'TREAD THE PLATE: THE GAS FILLS ITS REACH AND UNMAKES WHAT STANDS THERE.');
  guard(645, GA - 1, 641, 648, 'gasGuard');
  decor.push({ kind: 'bones', x0: 643, x1: 644, y: GA - 1 }, { kind: 'jars', x0: 640, x1: 641, y: GA - 4 });
  /* THE GAS CORRIDOR (SPEND IT): its plate before it, two pale stones in it, refuge shelves over the cloud; a mummy out of its tomb treads the stones behind you */
  traps.push({ id: 'gas2', kind: 'gas', plates: [[651, 652, GA]], inner: [[658, 659, GA], [664, 665, GA]], zone: [654, 668, GA - 3, GA - 1], jets: [655, 658, 661, 664, 667], gasT: 2.6, reset: 4.4, section: 'test' });
  ent('tplate', 651, GA - 1, { trap: 'gas2' });
  ledge('shelf', 655, 657, GA - 3); ledge('shelf', 661, 663, GA - 3);
  tomb('g1', 660, GA, 'skel', [650, 672], 'gasCorr'); tomb('g2', 666, GA, 'mummy', [650, 672], 'gasCorr');
  /* THE BLOWERS' NICHE (GAS IT FROM BELOW): up two steps; a long niche gallery over the floor with its blowers; the plate on the floor fires its jets INTO the niche */
  block(669, 735, GH, GA - 1); air(669, 735, GH - 12, GH - 1); interiors.push([669, 735, GH - 12, GH - 1, 'pyGas']);
  ledge('shelf', 673, 675, GH - 3); ledge('walk', 677, 690, GH - 6); blower(681, GH - 7, 'niche'); blower(688, GH - 7, 'niche');
  traps.push({ id: 'gas3', kind: 'gas', plates: [[672, 673, GH]], zone: [677, 690, GH - 9, GH - 7], jets: [678, 682, 686, 690], jetRow: GH - 6, gasT: 2.6, reset: 4.4, section: 'test' });
  ent('tplate', 672, GH - 1, { trap: 'gas3' });
  sign(670, GH - 1, 'THE BLOWERS\' NICHE: ITS PLATE IS DOWN HERE. GAS THEM OVER YOUR HEAD.');
  vent(694, GH, 0.6); vent(697, GH, 2.0); lamp(675, GH - 11); lamp(700, GH - 11);
  jackal(692, GH - 1, 'nicheFloor'); scarab(684, GH - 1, 'nicheFloor');
  /* EXAM: THE OLD STINGER (the venom scorpion's elite) on the vents, the gas plate before him, his tomb-guard behind */
  traps.push({ id: 'gasExam', kind: 'gas', plates: [[702, 703, GH]], zone: [706, 724, GH - 3, GH - 1], jets: [707, 711, 715, 719, 723], gasT: 2.6, reset: 5.0, section: 'exam' });
  ent('tplate', 702, GH - 1, { trap: 'gasExam' });
  sign(700, GH - 1, 'THE OLD STINGER. HE STANDS ON THE VENTS: GAS HIM - IT TAKES ONLY A SHARE.');
  venom(714, GH - 1, 'stinger', { elite: true, gate: 727 }); vent(718, GH, 1.2); vent(721, GH, 2.6);
  tomb('g3', 722, GH, 'skel', [708, 726], 'stinger');
  decor.push({ kind: 'jars', x0: 708, x1: 710, y: GH - 4 }, { kind: 'bones', x0: 712, x1: 713, y: GH - 1 });
  block(727, 740, GH - 12, GH - 7); air(736, 740, GH - 6, GH - 1); interiors.push([736, 740, GH - 6, GH - 1, 'pyGas']);                                                                          /* the door's lintel (the elite's gate under it) */

  // ================= 8. THE OIL CHANNELS (736-862): FIRE =================
  const OI = TH.oil, OH = TH.oilHi;
  ent('check', 737, OI - 1);                                                                                 /* CHECKPOINT SEVEN */
  air(741, 800, OI - 12, OI - 1); interiors.push([741, 800, OI - 12, OI - 1, 'pyOil']);
  sign(739, OI - 1, 'THE OIL CHANNELS. A PLATE TIPS ITS BRAZIER: THE FIRE RUNS THE CHANNEL.');
  lamp(744, OI - 11); lamp(770, OI - 11); lamp(790, OI - 11);
  /* THE CHANNEL TAUGHT: its plate, its brazier at the head, a mummy guard walking the channel (its linen catches) */
  traps.push({ id: 'oil1', kind: 'oil', plates: [[745, 746, OI]], zone: [749, 760, OI - 2, OI - 1], head: 748, chan: [749, 760], runV: 240, burnT: 2.6, reset: 5.0, section: 'teach' });
  ent('tplate', 745, OI - 1, { trap: 'oil1' });
  sign(743, OI - 1, 'TREAD THE PLATE AS THE GUARD WALKS THE CHANNEL: HIS LINEN CATCHES.');
  guard(755, OI - 1, 749, 760, 'oilGuard');
  firesc(764, OI - 1, 'oilScorpion'); skel(735, GH - 1, 'gasDoor');   /* (one tomb guard already up, at the gallery's door: it walks the passage) */
  /* THE LONG CHANNEL (SPEND IT): the plate before it, pale stones in it, refuges over the flame; the risen walk it - a mummy's tread fires it on you */
  traps.push({ id: 'oil2', kind: 'oil', plates: [[767, 768, OI]], inner: [[776, 777, OI], [786, 787, OI]], zone: [770, 796, OI - 2, OI - 1], head: 769, chan: [770, 796], runV: 220, burnT: 3.0, reset: 5.6, section: 'test' });
  ent('tplate', 767, OI - 1, { trap: 'oil2' });
  ledge('shelf', 773, 775, OI - 3); ledge('shelf', 782, 784, OI - 3); ledge('shelf', 791, 793, OI - 3);
  tomb('o1', 780, OI, 'skel', [766, 800], 'oilCorr'); tomb('o2', 794, OI, 'mummy', [766, 800], 'oilCorr');
  /* up to THE OIL FALL's room */
  block(797, 800, OI - 3, OI - 1); air(797, 862, OH - 12, OH - 1); interiors.push([797, 862, OH - 12, OH - 1, 'pyOil']); block(801, 862, OH, OI - 1);
  /* THE OIL FALL (FIRE FROM ABOVE): a high walk with a channel in its gutter; at its end the burning oil pours onto the floor below, where the risen gather */
  ledge('shelf', 802, 804, OH - 3); ledge('walk', 806, 818, OH - 5);
  traps.push({ id: 'oil3', kind: 'oil', plates: [[806, 807, OH - 5]], zone: [820, 832, OH - 2, OH - 1], head: 808, chan: [820, 832], pour: [809, 818, OH - 5], runV: 260, burnT: 3.0, reset: 6.0, section: 'test' });
  ent('tplate', 806, OH - 6, { trap: 'oil3' });
  sign(805, OH - 6, 'THE OIL FALL: ITS FIRE POURS ON THE FLOOR BELOW. LET THEM GATHER THERE.');
  tomb('o3', 824, OH, 'skel', [804, 834], 'oilFall'); tomb('o4', 829, OH, 'mummy', [804, 834], 'oilFall'); firesc(831, OH - 1, 'oilFall');
  lamp(812, OH - 11); lamp(840, OH - 11);
  /* EXAM: THE TOMB-WARDEN II stands in the last channel; its brazier by the plate; his tomb-guard behind him */
  traps.push({ id: 'oilExam', kind: 'oil', plates: [[836, 837, OH]], zone: [839, 851, OH - 2, OH - 1], head: 838, chan: [839, 851], runV: 240, burnT: 3.0, reset: 6.0, section: 'exam' });
  ent('tplate', 836, OH - 1, { trap: 'oilExam' });
  sign(834, OH - 1, 'THE TOMB-WARDEN. HIS WRAPS SMOULDER - THE CHANNEL TAKES ONLY A SHARE OF HIM.');
  guard(845, OH - 1, 839, 851, 'oilWarden', { elite: true, gate: 853 });
  tomb('o5', 850, OH, 'skel', [838, 852], 'oilWarden');
  block(853, 862, OH - 12, OH - 7);                                                                          /* the door's lintel */

  // ================= 9. THE FLOODED CRYPT (863-962): WATER =================
  const CI = TH.cistern, LP = TH.lip, CR = TH.crypt, LD = TH.landing;
  ent('check', 858, OH - 1);                                                                                 /* CHECKPOINT EIGHT */
  /* THE CISTERN (TEACH, REQUIRED): drop in; its sluice in the west wall; tread the plate: the bore runs its floor, then the water rises to the lip */
  air(863, 878, CI - 14, CI - 1); interiors.push([863, 878, CI - 14, CI - 1, 'pyCrypt']);
  air(879, 884, LP - 8, LP - 1); interiors.push([879, 884, LP - 8, LP - 1, 'pyCrypt']);                                                                             /* the lip and the way on (floor LP) */
  sign(861, OH - 1, 'THE CISTERN. ITS SLUICE FLOODS IT: THE BORE FIRST, THEN THE WATER RISES - SWIM UP ON IT.');
  pools.push({ id: 'flood1', x0: 863 * TS, x1: 879 * TS, y: (LP - 1) * TS + 4, swim: true, clear: true, bottom: CI * TS, crypt: true });   /* (its high mark a row over the lip: you swim onto it) */
  traps.push({ id: 'flood1', kind: 'flood', plates: [[864, 865, CI]], zone: [867, 878, CI - 2, CI - 1], sluice: 863, dir: 1, pool: 'flood1', low: CI, high: LP - 1, riseT: 3.0, holdT: 9.0, drainT: 3.5, reset: 6.0, section: 'teach' });
  ent('tplate', 864, CI - 1, { trap: 'flood1' });
  guard(873, CI - 1, 867, 878, 'cisternGuard');
  /* THE CRYPT (TEST, REQUIRED): a deep hall of the drowned dead; the way on is the high door at its east end - only the water reaches it */
  air(885, 950, LD - 4, CR - 1); interiors.push([885, 950, LD - 4, CR - 1, 'pyCrypt']);
  air(951, 962, LD - 6, LD - 1); interiors.push([951, 962, LD - 6, LD - 1, 'pyStair']);                     /* THE HIGH DOOR's landing (floor LD) */
  ledge('shelf', 886, 890, LP + 4); ledge('shelf', 896, 900, CR - 4); ledge('shelf', 912, 916, CR - 4); ledge('shelf', 926, 930, CR - 7);
  sign(887, CR - 1, 'THE CRYPT. ITS DOOR IS HIGH: ONLY THE WATER TAKES YOU THERE. ITS SLUICE IS AT THE FAR END.');
  pools.push({ id: 'flood2', x0: 885 * TS, x1: 951 * TS, y: (LD - 1) * TS + 4, swim: true, clear: true, bottom: CR * TS, crypt: true });
  traps.push({ id: 'flood2', kind: 'flood', plates: [[944, 945, CR]], zone: [886, 941, CR - 2, CR - 1], sluice: 951, dir: -1, pool: 'flood2', low: CR, high: LD - 1, riseT: 5.0, holdT: 12.0, drainT: 5.0, reset: 7.0, section: 'exam' });
  ent('tplate', 944, CR - 1, { trap: 'flood2' });
  tomb('c1', 902, CR, 'mummy', [892, 936], 'cryptSquad'); tomb('c2', 914, CR, 'skel', [892, 936], 'cryptSquad'); tomb('c3', 924, CR, 'mummy', [892, 936], 'cryptSquad');
  blower(928, CR - 8, 'cryptBlower'); lamp(890, CR - 12); lamp(920, CR - 12); lamp(946, CR - 12); lamp(955, LD - 5);
  decor.push({ kind: 'sarcophagus', x: 908, y: CR - 1 }, { kind: 'sarcophagus', x: 919, y: CR - 1 }, { kind: 'bones', x0: 932, x1: 934, y: CR - 1 });
  /* EXAM: THE BRASS WARDEN II keeps the sluice's plate at the crypt's east end - lure him into the bore's reach; brass sinks (the bore takes a share) */
  brass(938, CR - 1, 'cryptWarden', { elite: true });

  // ================= 10. THE KING'S STAIR (963-1006): A14 PLATFORMING - the courses over the scarab well =================
  const ST = TH.stair;
  /* (the stair has no shrine of its own: the crypt's at 858 and the one before the burial chamber at 1003 bracket it - A10b spacing) */
  air(963, 1003, 14, ST - 1); interiors.push([963, 1003, 14, ST, 'pyStair']);   /* (its room runs down over the well's floor: the scarab well is in it) */
  for (let x = 963; x <= 1003; x++) set(x, ST, T.SPIKE); decor.push({ kind: 'scarabpit', x0: 963, x1: 1003, y: ST });
  const course = (x0, x1, y, giving) => { ledge('cornice', x0, x1, y); if (giving) crumble.push({ x0, x1, row: y, tile: T.ONEWAY, quiet: 0 }); };
  course(965, 967, LD, false); course(970, 972, LD - 2, true); course(975, 977, LD - 2, false); course(980, 982, LD - 4, true);
  course(985, 987, LD - 4, false);                                                                           /* THE PLATE-COURSE: tread it and the volley flies over the last run */
  course(990, 992, LD - 6, true); course(995, 997, LD - 6, true);
  traps.push({ id: 'stairDarts', kind: 'darts', plates: [[985, 987, LD - 4]], zone: [963, 999, LD - 8, LD - 7], wall: 962, dir: 1, rows: [LD - 8, LD - 7], reset: 3.8, section: 'exam' });
  ent('tplate', 985, LD - 5, { trap: 'stairDarts' }); ent('dartwall', 962, LD - 7, { trap: 'stairDarts' });
  decor.push({ kind: 'dartholes', x: 962, y0: LD - 8, y1: LD - 7 });
  sign(960, LD - 1, 'THE KING\'S STAIR. THE OLD COURSES GIVE UNDER YOU: DO NOT STAND.');
  lamp(968, 18); lamp(990, 18);
  /* the top: the landing before the burial chamber (floor BU) */
  const BU = TH.burial;
  air(1000, 1006, BU - 6, BU - 1); block(1000, 1006, BU, ST - 1); for (let x = 1000; x <= 1003; x++) set(x, ST, T.SOLID);
  ent('check', BOSS_SLOT.check, BU - 1);                                                                     /* CHECKPOINT TEN: before the burial chamber (A10b) */

  // ================= 11. THE BURIAL CHAMBER (1007-1047): THE TOMB-KING'S SARCOPHAGUS (claude/pyramidboss, LANE B: src/tomb-king.js) - the level's machine in one room =================
  const S = BOSS_SLOT, F = S.floor;
  air(S.x0, S.x1, S.roof, F - 1); interiors.push([S.x0, S.x1, S.roof, F - 1, 'pyBurial']);
  air(S.westDoor.col, S.westDoor.col, S.westDoor.y0, S.westDoor.y1); air(S.eastDoor.col, S.eastDoor.col, S.eastDoor.y0, S.eastDoor.y1);
  for (const l of S.ledges) { ledge('ledge', l.x0, l.x1, l.y); decor.push({ kind: 'chains', x0: l.x0, x1: l.x1, y: l.y }); }   /* the side ledges on their chains */
  /* THE CHAMBER'S TRAPS (the level's own engine, src/sealed-pyramid-hands.js; `tk`: inert until his phase two arms them): the west and east blocks in their ceiling
     slots, the middle plate's two dart walls (each fires its wall's side of the floor - the plate between them is clear of both) */
  for (const [x0, x1] of S.slots) air(x0, x1, S.roof - 2, S.roof - 1);
  const [pw, pm, pe] = S.plates, [sw, se] = S.slots;
  traps.push({ id: 'tkBlockW', kind: 'block', plates: [[pw[0], pw[1], F]], zone: [sw[0], sw[1], S.roof, F - 1], slot: [sw[0], sw[1], S.roof - 2, S.roof - 1], land: F - 1, reset: 6.0, arena: true, tk: true, section: 'boss' });
  traps.push({ id: 'tkBlockE', kind: 'block', plates: [[pe[0], pe[1], F]], zone: [se[0], se[1], S.roof, F - 1], slot: [se[0], se[1], S.roof - 2, S.roof - 1], land: F - 1, reset: 6.0, arena: true, tk: true, section: 'boss' });
  traps.push({ id: 'tkDartsW', kind: 'darts', plates: [[pm[0], pm[1], F]], zone: [S.x0, pm[0] - 1, F - 2, F - 1], wall: S.westDoor.col, dir: 1, rows: [F - 2, F - 1], reset: 6.0, arena: true, tk: true, section: 'boss' });
  traps.push({ id: 'tkDartsE', kind: 'darts', plates: [[pm[0], pm[1], F]], zone: [pm[1] + 1, S.x1, F - 2, F - 1], wall: S.eastDoor.col, dir: -1, rows: [F - 2, F - 1], reset: 6.0, arena: true, tk: true, section: 'boss' });
  ent('tplate', pw[0], F - 1, { trap: 'tkBlockW' }); ent('tblock', sw[0], S.roof - 1, { trap: 'tkBlockW' }); ent('tplate', pe[0], F - 1, { trap: 'tkBlockE' }); ent('tblock', se[0], S.roof - 1, { trap: 'tkBlockE' });
  ent('tplate', pm[0], F - 1, { trap: 'tkDartsW' }); ent('dartwall', S.westDoor.col, F - 1, { trap: 'tkDartsW' }); ent('dartwall', S.eastDoor.col, F - 1, { trap: 'tkDartsE' });
  decor.push({ kind: 'dartholes', x: S.westDoor.col, y0: F - 2, y1: F - 1 }, { kind: 'dartholes', x: S.eastDoor.col, y0: F - 2, y1: F - 1 });
  ent('tombking', S.king, F - 1, { face: -1 });                                                              /* HE STANDS ASLEEP where the placeholder great sarcophagus stood */
  lamp(S.x0 + 4, S.roof + 6); lamp(S.x1 - 4, S.roof + 6); lamp(Math.round((S.x0 + S.x1) / 2), S.roof + 3);
  air(S.eastDoor.col + 1, TH.W - 2, F - 6, F - 1);
  ent('gate', S.gate, F - 1);                                                                                /* THE LEVEL'S GATE: it opens once THE TOMB-KING is down (gateAfterBoss) */
  /* THE ARENA (L.arena): his walls shut both doors; `tk` hands src/tomb-king.js the chamber's fittings */
  const arena = { x0: S.x0 * TS, x1: (S.x1 + 1) * TS, floor: F * TS, trigger: (S.x0 + 3) * TS, wallL: S.westDoor.col, wallR: S.eastDoor.col, boss: 'tombking', music: 'tombking',
    tint: '#c8a040', tintA: 0.07, start: [S.x0 + 4, F - 1], y0: S.roof * TS, y1: (F + 1) * TS, tk: S };

  return { traps, tombs, gasVents, crumble, pools, arena };
}
