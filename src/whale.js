// src/whale.js - THE WHALE (claude/whale, the OPUS GREYBOX of the level, 2026-11-06; scratch/plan-water-1105.md section 1 item 9 + section 3a ("Whale breath (same
// engine, flesh skin)") + section 2 + section 4; the concept brief scratch/brief-whale-1025.md - the 11-05 plan wins where they differ).
// A NEW level, built from nothing. OFF THE ROAD until its art pass merges and the browser proofs run (art before live): an APPENDED, HIDDEN row in src/level.js (no map
// node, not on the demo list; dev only ?level=whale). WH_SHIPS is the road switch: false = the live game is unchanged (the row is hidden, nothing needs it, every
// main.js hunk is behind WHH.on() = L.whale). Its place when it ships: the main road THE UNDERWATER KEEP -> THE WHALE -> THE DROWNED CAUSEWAY, through claude/greatdune's
// road-insert table (its route-insert module is not on this base - the row to add is in the lane report). Old saves: the brief's rule (a save past the Keep keeps the
// Causeway open; the Whale shows unplayed, never a wall) is the route-insert table's job - no save migration is written here.
//
// THE RULE (L.rule): THE WHALE BREATHES. THE BREATH IS YOURS TO CALL.
//   THE BREATH is THE TIDE KIT (src/tide-kit.js) in a flesh skin - not a second engine. Every bile pool in the whale is a kit tide on ONE shared cycle (they start
//   together and every forced breath is put to all of them in the same frame, so they never drift: tools/whale.mjs steps them a thousand times and compares):
//     kit phase   fall          low        warn                rise          high        turn
//     the whale   INHALE (4.5)  HOLD (1.5) THE HEART QUICKENS  EXHALE (4.0)  REST (3.0)  IT GASPS (1.5)      = 16 s
//                 bile drains,  still       (1.5, the tell:     bile rises,   pockets     (the tell: one deep
//                 gust to the              heartbeat + 3 beats) gust to the    flooded     shudder)
//                 throat, the                                  maw, the
//                 membranes open                               membranes shut
//   A NERVE CLUSTER (a glowing white-pink knot in the flesh) struck FORCES THE NEXT BREATH: it flares and the body shudders (WH.nerve.flare s, told), then
//     HOLDING (low)            -> it CALLS THE EXHALE  (the kit's BELL verb: the warn starts now - short, still three beats, never untold)
//     QUICKENS / EXHALE / REST -> it CALLS THE INHALE  (the kit's SLUICE verb: the bile turns back from where it is and is held out WH.nerve.hold s)
//     IT GASPS / INHALE        -> it is drawing in already (nothing is spent)
//     Each cluster then cools WH.nerve.cool s (dim): no spamming. A FORCED inhale also unseals a SEALED membrane (the Gullet's cardia: the one required strike).
//   THE BILE drains BREATH only (the game's own swim breath + the shared quiet drain, A13) - it is never a damage water, never a knock.
//   THE GUST is THE PULL FIELD (src/pull-field.js, 'current', in the air): driven by the breath's phase (toward the throat on the inhale, toward the maw on the exhale).
//   THE TONGUE is a kit LIFT (the exhale lifts it), the stomach's wreck rafts are kit FLOATS on the bile.
//
// SIX NAMED AREAS (TEACH -> TEST -> REMIX -> EXAM -> BOSS). Columns; rows: smaller is higher. START + TWO shrines (fewer checkpoints, Daniel).
//      0-49   THE MAW            TEACH SAFE: the breath drawn, a shallow bile dip that cannot kill, the first nerve, a membrane that opens on the inhale
//     50-125  THE TONGUE + TEETH TEST: the tongue rides the breath (call the exhale to lift it level); REMIX: a debris raft lifted to a ledge, the baleen comb that only
//                                an inhale opens, the gust that takes the crabs; EXAM: the comb climb with the bile rising; SHRINE ONE
//    126-170  THE GULLET         a shaft down (swallowed); the exhale's up-draught, the inhale's pull; THE CARDIA - a SEALED membrane only a forced inhale opens (REQUIRED)
//    171-262  THE STOMACH        bile basins; gut leeches; the drowned hulls; the sailor's strongbox (silver); EXAM: the three wreck rafts the exhale lifts; the elite
//    263-322  THE RIB CAGE       the gust exam over the void: ribs a jump apart, the exhale throws you back, the inhale draws you on; SHRINE TWO (the boss door)
//    323-399  THE HEART CHAMBER  THE PARASITE QUEEN (src/parasite-queen.js) rooted on the beating heart; three nerves on the shelves; the heart's own breath
// Foes: THE GASTRIC POLYP (the one new foe, src/gastric-polyp.js), the gut leech (THE BOG LEECH reskinned: src/bog-leech.js, L.reskin), the barnacle crab (crab
// reskin), the merrow brute (a swallowed one, the elite). NO GOBLINS. NO TIMBER except the swallowed ships (wreck rafts, drowned hulls: they ARE ships).
export const WH_SHIPS = false;   /* (the road switch: flip with the art pass - route-insert row in the lane report) */
export const WH = {
  W: 400, H: 48, BED: 46,
  AS: 323, AE: 386, AF: 40,
  nerve: { flare: 0.8, cool: 6, hold: 3, coolArena: 6 },
  gust: 40, ribGust: 75,
};
export const WH_RULE = 'THE WHALE BREATHES. THE BREATH IS YOURS TO CALL. STRIKE A NERVE AND IT BREATHES NOW.';
/* THE BREATH: the kit cycle (seconds per kit phase) and what the whale is doing in each - the HUD lung and the signs read these names */
export const BREATH = { fall: 4.5, low: 1.5, warn: 1.5, rise: 4, high: 3, turn: 1.5 };
export const BREATH_NAME = { fall: 'INHALE', low: 'HOLD', warn: 'THE HEART QUICKENS', rise: 'EXHALE', high: 'REST', turn: 'IT GASPS' };
export const BREATH_LEN = Object.values(BREATH).reduce((a, b) => a + b, 0);
/* the heart's own breath in the boss chamber (P3 runs it at WH_HEART.p3Rate: 16 s -> 11 s) */
export const WH_HEART = { p3Rate: BREATH_LEN / 11 };
export const SECTIONS = [['THE MAW', 0, 49], ['THE TONGUE AND TEETH', 50, 125], ['THE GULLET', 126, 170], ['THE STOMACH', 171, 262], ['THE RIB CAGE', 263, 322], ['THE HEART CHAMBER', 323, 399]];
/* THE RULE'S ARC in columns (TAUGHT, TESTED, REMIXED, EXAMINED, the BOSS) - read by tools/whale.mjs */
export const ARCS = {
  breath: { teach: [0, 49], test: [50, 75], remix: [76, 103], exam: [104, 125], boss: [323, 386] },
  nerve: { teach: [28, 46], test: [50, 75], remix: [148, 156], exam: [206, 236], boss: [323, 386] },
  tongue: { teach: [50, 75], test: [76, 92], remix: [213, 236], exam: [104, 125] },
  membrane: { teach: [40, 46], test: [90, 96], remix: [150, 156], exam: [323, 386] },
  gust: { teach: [93, 103], test: [126, 153], remix: [93, 103], exam: [263, 322] },
};
export const WH_SIGNS = {
  lore: 'THE WHALE TOOK THE KEEP\'S LAST AIR, AND YOU WITH IT. YOU WAKE ON ITS TONGUE.',
  breath: 'IT BREATHES. IN: THE BILE DRAINS AND THE WAY OPENS. OUT: THE BILE RISES AND THE WAY SHUTS. THE LUNG UP TOP SAYS WHICH.',
  dip: 'BILE. IT TAKES YOUR BREATH, NOT YOUR BLOOD. CLIMB OUT.',
  nerve: 'A NERVE. STRIKE THE GLOWING KNOT AND THE WHALE BREATHES NOW: OUT IF IT IS HOLDING, IN IF IT IS BREATHING OUT.',
  membrane: 'A MEMBRANE. IT OPENS ON THE INHALE. WAIT FOR IT, OR CALL IT.',
  tongue: 'THE TONGUE RISES WHEN IT BREATHES OUT. CALL THE EXHALE AND IT LIFTS LEVEL.',
  raft: 'A RAFT OF SWALLOWED WRECK. THE EXHALE LIFTS IT TO THE LEDGE.',
  comb: 'THE BALEEN COMB. ONLY AN INHALE PARTS IT.',
  gust: 'THE BREATH BLOWS THROUGH HERE. LET IT TAKE THEM.',
  climb: 'THE COMB. CLIMB BEFORE THE BILE COMES UP.',
  gullet: 'THE GULLET. DOWN. IT BREATHES UP AT YOU ON THE EXHALE.',
  cardia: 'THE CARDIA. IT IS SEALED: ONLY A BREATH YOU CALL WILL OPEN IT. CALL THE INHALE.',
  polyp: 'A GASTRIC POLYP. IT SWELLS OUT ON THE EXHALE AND SPITS. ON THE INHALE IT SHRINKS INTO THE FLESH.',
  leech: 'GUT LEECHES IN THE BILE. ROLL TO SHAKE ONE OFF. THE INHALE TEARS THEM LOOSE.',
  strongbox: 'A SAILOR\'S STRONGBOX, DOWN IN THE BILE.',
  rafts: 'THREE RAFTS. GET ABOARD LOW. THE EXHALE LIFTS THEM: CROSS BEFORE THEY FALL.',
  log: 'A CAPTAIN\'S LOG, SCRAWLED: "THERE IS A THING IN THE HEART. IT DRINKS WHAT THE WHALE DRINKS."',
  ribs: 'THE RIBS. THE EXHALE THROWS YOU BACK. CROSS ON THE INHALE, OR CALL IT.',
  boss: 'THE HEART. SOMETHING IS ROOTED IN IT. STRIKE A NERVE WHILE IT HOLDS: THE EXHALE TEARS IT OFF ITS ROOTS.',
};

export function buildWhale({ painter, T, TS }) {
  const { W, H, BED } = WH;
  const L = painter(W, H), { set, block, ent, plat } = L;
  const fill = (x0, x1, y0, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v); };
  const air = (x0, x1, y0, y1) => fill(x0, x1, y0, y1, T.AIR);
  const net = (x, y0, y1) => fill(x, x, y0, y1, T.NET);   /* SINEW (art owed: a strand of pale sinew down the wet flesh) */
  const rock = (x0, x1, top) => block(x0, x1, top, BED - 1);   /* FLESH (art owed: the level's own kit) */
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const foe = (t, x, y, o) => ent(t, x, y, Object.assign({ face: -1 }, o || {}));
  const pools = [], tides = [], nerves = [], membranes = [], pulls = [], movers = [], rigBands = [], doors = [];
  /* A BILE POOL + ITS KIT TIDE (one per basin; every one on THE BREATH, see the header). Hidden verbs: the nerve puts the kit's own BELL or SLUICE to every breath
     tide at once, by striking these off-map props with a made-up blow (src/whale-hands.js force) - so a forced breath IS the kit's bell / sluice, not a copy */
  const bile = (id, x0, x1, base, lo, hi, o = {}) => {
    pools.push({ id, x0: x0 * TS, x1: (x1 + 1) * TS, y: lo * TS, base: base * TS, bottom: base * TS, swim: true, clear: true, bile: true, wh: true });
    const n = tides.length, hx = -8 - n * 6;
    tides.push({ id, pools: [id], lo, hi, cycle: o.cycle || BREATH, rate: 1, first: 'low', firstT: o.firstT ?? 3, safe: 'low', grace: 4,
      floats: o.floats || [], lifts: o.lifts || [], foes: { gastricpolyp: 'high', crab: 'flee' }, breath: o.breath !== false,
      verbs: [{ t: 'bell', x: hx, y: -4, hidden: true }, { t: 'sluice', x: hx - 3, y: -4, hold: WH.nerve.hold, hidden: true }] });
  };
  /* A NERVE CLUSTER at x, y (the row it sits in). o.tides: the tides it forces ('breath' = every breath tide; 'heart' = the chamber's); o.on: the float it rides */
  const nerve = (id, x, y, o = {}) => { nerves.push({ id, x, y, tides: o.tides || 'breath', arena: !!o.arena, on: o.on || null }); ent('nerve', x, y, { id }); };
  /* A MEMBRANE: a column of flesh that opens on the inhale (kind 'breath') or only to a forced one ('sealed'). Laid SHUT (T.PORT); the reach fill opens it (L.reachDoors) */
  const membrane = (id, x0, x1, y0, y1, kind = 'breath') => { fill(x0, x1, y0, y1, T.PORT); membranes.push({ id, x0, x1, y0, y1, kind }); doors.push({ x0, x1, y0, y1 }); ent('membrane', x0, y1, { id }); };
  /* THE GUST: a breath-driven current (sign by phase: + toward the throat on the inhale, - toward the maw on the exhale) */
  const gust = (id, box, dir, strength, phases) => pulls.push({ id, kind: 'current', box, dir, strength, curve: 'flat', water: false, tide: 'breath', phases, weight: { hero: 1, foe: 0.6, shot: 0.6 }, col: '#f0d0d8', gust: true });
  const lift = (tid, id, x0, x1, yLo, yHi) => { tides.find(q => q.id === tid).lifts.push({ id, x0, x1, yLo, yHi }); rigBands.push([x0, x1, yHi, yLo]);
    movers.push({ kind: 'tongue', wh: 'lift', lid: id, tide: tid, x: x0 * TS, x0: x0 * TS, x1: x0 * TS, y: yLo * TS, w: (x1 - x0 + 1) * TS, h: 8 }); };
  const raft = (tid, id, x0, x1, rest, top) => { tides.find(q => q.id === tid).floats.push({ id, x0, x1, y: rest, top, free: 4 }); rigBands.push([x0, x1, top, rest]);
    movers.push({ kind: 'wreckraft', wh: 'float', fid: id, tide: tid, x: x0 * TS, x0: x0 * TS, x1: x0 * TS, y: (rest - 1) * TS, w: (x1 - x0 + 1) * TS, h: 8 }); };

  /* the whale's belly under everything */
  block(0, W - 1, BED, H - 1);

  // ================= 1. THE MAW (0-49): TEACH SAFE =================
  block(0, 49, 0, 24);                                                   /* the roof of the mouth */
  rock(0, 49, 36);                                                       /* the root of the tongue: the floor */
  block(2, 2, 25, 29); block(17, 17, 25, 28); block(41, 41, 25, 27);     /* BALEEN hanging from the roof */
  sign(2, 35, WH_SIGNS.lore); sign(6, 35, WH_RULE); sign(12, 35, WH_SIGNS.breath);
  coins([8, 35], [11, 35]);
  plat(4, 33, 4); plat(9, 30, 4); plat(14, 33, 3); plat(26, 34, 3); plat(30, 32, 3); plat(34, 30, 2); plat(37, 28, 3); ent('silver', 38, 27);   /* BALEEN SHELVES up the cheek: the first silver, high over the membrane (a pocket) */
  air(18, 25, 36, 37); net(18, 36, 37); bile('maw', 18, 25, 38, 38, 36); sign(16, 35, WH_SIGNS.dip);   /* a shallow bile dip: two rows, it cannot kill */
  coins([21, 37], [24, 37]);
  sign(29, 35, WH_SIGNS.nerve); nerve('n1', 32, 35);                     /* TEACH: the first nerve, on the floor, nothing near it */
  sign(41, 35, WH_SIGNS.membrane);
  membrane('m1', 44, 45, 25, 35);                                        /* the first membrane: roof to floor - it opens on the inhale */
  coins([47, 35]); foe('crab', 47, 35);   /* the first foe waits past the membrane: a barnacle crab */

  // ================= 2. THE TONGUE AND TEETH (50-125) =================
  block(50, 125, 0, 18);
  rock(50, 52, 36);
  block(53, 67, 42, BED - 1); bile('tongue', 53, 67, 42, 41, 38);        /* the channel under the tongue */
  lift('tongue', 'tg1', 53, 67, 40, 36);                                 /* THE TONGUE: heaves to row 36 (level) on the exhale, drops to 40 on the inhale */
  net(53, 37, 41); net(67, 37, 41);                                      /* sinew up both walls: fall in, climb out */
  sign(50, 35, WH_SIGNS.tongue); nerve('n2', 51, 35);                    /* TEST: call the exhale and the tongue lifts level */
  rock(68, 75, 36); coins([70, 35], [72, 35]); plat(69, 33, 3); plat(72, 30, 3);
  foe('crab', 71, 35);
  /* REMIX 1: THE DEBRIS RAFT - a raft of swallowed wreck in a well; the exhale lifts it to the high ledge */
  block(76, 84, 42, BED - 1); bile('well', 76, 84, 42, 41, 33); net(76, 37, 41);
  raft('well', 'raft1', 78, 81, 41, 33);
  sign(73, 35, WH_SIGNS.raft); nerve('n3', 74, 35);
  rock(85, 103, 33);                                                     /* the high ledge */
  coins([87, 32], [90, 32]); plat(86, 30, 4); plat(97, 29, 4);
  foe('gastricpolyp', 89, 32, { face: 1, squad: 'comb-court' });                              /* the polyp taught on the ledge (art owed: a stalk out of the flesh floor) */
  sign(86, 32, WH_SIGNS.polyp);
  /* REMIX 2: THE BALEEN COMB - a membrane only an inhale parts */
  sign(91, 32, WH_SIGNS.comb);
  block(93, 94, 19, 29); membrane('m2', 93, 94, 30, 32);
  /* REMIX 3: THE GUST TAKES THEM - two crabs on the ledge's lip; the exhale blows them back into the comb well */
  gust('g1', [95, 26, 103, 32], [1, 0], WH.gust, { fall: 1, rise: -1 });
  sign(96, 32, WH_SIGNS.gust); foe('crab', 99, 32, { squad: 'comb-court' }); foe('crab', 102, 32, { squad: 'comb-court' });
  /* EXAM: THE COMB CLIMB - baleen plates up out of a well the exhale floods (the line reaches row 30: the first plate goes under) */
  block(104, 121, 44, BED - 1); bile('comb', 104, 121, 44, 43, 30);
  sign(101, 32, WH_SIGNS.climb);
  block(106, 107, 31, 43); block(110, 111, 29, 43); block(114, 115, 27, 43); block(118, 119, 25, 43);
  net(104, 34, 43); net(121, 30, 43);                                    /* sinew: a fall into the well is a climb back, not a death (the comb is an exam of time) */
  coins([106, 30], [110, 28], [114, 26], [118, 24]);
  foe('gastricpolyp', 115, 26, { face: -1 });
  rock(122, 129, 23); ent('check', 125, 22);                             /* SHRINE ONE, on the plateau over the comb */
  coins([123, 22]);

  // ================= 3. THE GULLET (126-170): DOWN =================
  block(122, 170, 0, 16);
  block(130, 152, 44, BED - 1); bile('gullet', 130, 152, 44, 43, 37);   /* the gullet's sump: the exhale floods it to row 37 */
  sign(127, 22, WH_SIGNS.gullet);
  block(146, 152, 28, 28); block(130, 138, 33, 33); block(144, 152, 38, 38); net(143, 38, 43);   /* sinew shelves on its walls; sinew up the last one from the sump */
  gust('g2', [130, 17, 152, 43], [0, 1], WH.gust, { fall: 1, rise: -1 });   /* the inhale pulls you down it; the exhale breathes up at you */
  foe('gastricpolyp', 132, 32, { face: 1 }); foe('gastricpolyp', 150, 27, { face: -1 });
  coins([133, 32], [136, 32], [146, 37]); air(126, 129, 40, 43); ent('silver', 127, 43);   /* the second silver: in an air pocket in the gullet's wall, off its sump (the way on is east) */
  block(153, 170, 17, 35); rock(153, 170, 40);                           /* the east wall, and the passage to the stomach under it */
  sign(145, 37, WH_SIGNS.cardia); nerve('nreq', 149, 37);                /* THE REQUIRED STRIKE: the cardia only opens to a breath you call */
  membrane('cardia', 153, 154, 36, 39, 'sealed');
  sign(158, 39, WH_SIGNS.log); foe('crab', 166, 39);

  // ================= 4. THE STOMACH (171-262) =================
  block(171, 262, 0, 14);
  block(171, 205, 44, BED - 1); bile('gutA', 171, 205, 44, 43, 37); net(171, 40, 43);   /* BASIN A: walk its bed at the inhale, swim it at the exhale */
  plat(174, 40, 7); plat(182, 38, 7); plat(190, 40, 7); plat(198, 39, 5);                  /* DROWNED HULLS (swallowed ships: tarred, barnacled - art owed) */
  sign(173, 39, WH_SIGNS.leech);
  foe('leech', 179, 43, { squad: 'gut-brood' }); foe('leech', 195, 43, { squad: 'gut-brood' });
  foe('gastricpolyp', 186, 37, { face: -1, squad: 'gut-brood' });
  ent('silver', 200, 43); coins([198, 43], [202, 43]); sign(197, 43, WH_SIGNS.strongbox);   /* THE SAILOR'S STRONGBOX (one of the level's three silvers) */
  rock(206, 212, 36); net(205, 36, 43);
  sign(207, 35, WH_SIGNS.rafts); nerve('nst', 210, 35);
  /* BASIN B: THE THREE RAFTS (the platforming exam) - board them low, the exhale lifts all three level with the far ledge; cross before they fall */
  block(213, 234, 44, BED - 1); bile('gutB', 213, 234, 44, 43, 33); net(213, 37, 43);
  raft('gutB', 'rB1', 214, 217, 43, 33); raft('gutB', 'rB2', 221, 224, 43, 33); raft('gutB', 'rB3', 228, 231, 43, 33);
  foe('leech', 226, 43);
  coins([215, 32], [222, 32], [229, 32]);
  rock(235, 262, 33);
  foe('merrowbrute', 248, 32, { elite: true });                         /* THE ELITE: a swallowed merrow brute on the ledge (the void of the ribs behind him) */
  foe('gastricpolyp', 241, 32, { face: 1 });
  coins([238, 32], [255, 32], [259, 32]); plat(238, 30, 5); plat(244, 27, 4); plat(248, 30, 4); plat(253, 30, 5); plat(258, 30, 4);   /* bone shelves over the ledge */

  // ================= 5. THE RIB CAGE (263-322): THE GUST EXAM OVER THE VOID =================
  block(263, 322, 0, 14);
  air(263, 313, 17, H - 1);                                              /* the void: a fall here is a real death (taught: the bile everywhere before it was a climb) */
  for (const [x0, top] of [[266, 32], [272, 31], [278, 32], [284, 31], [290, 32], [296, 31], [302, 32], [308, 31]]) block(x0, x0 + 2, top, H - 1);   /* THE RIBS */
  gust('g3', [263, 16, 313, 34], [1, 0], WH.ribGust, { fall: 0.4, rise: -1 });   /* the exhale throws you back toward the maw; the inhale draws you gently on */
  sign(260, 32, WH_SIGNS.ribs); nerve('nr1', 267, 31); nerve('nr2', 291, 31);
  coins([273, 30], [285, 30], [297, 30]); plat(272, 28, 3); plat(284, 28, 3); plat(296, 28, 3); plat(308, 28, 3);   /* the high ribs: a second way over (the gust blows hardest up here: nothing shelters you) */
  foe('gastricpolyp', 285, 30, { face: -1 });
  ent('silver', 309, 27);   /* (on the last high rib: a climb off the pillar in the gust) */
  rock(314, 322, 32); ent('check', 318, 31);                             /* SHRINE TWO: the boss door */
  sign(320, 31, WH_SIGNS.boss);

  // ================= 6. THE HEART CHAMBER (323-399): THE PARASITE QUEEN =================
  const AS = WH.AS, AE = WH.AE, AF = WH.AF;
  block(AS, 399, 0, 12);
  block(AS, 399, AF, BED - 1);                                           /* the chamber floor (row 40) */
  block(AS, 328, 36, AF - 1); block(381, AE, 36, AF - 1); block(343, 346, 38, AF - 1);   /* THE SHELVES (top 36) and THE VALVE (top 38) */
  block(329, 330, 38, AF - 1); block(379, 380, 38, AF - 1);   /* a step up to each shelf */
  plat(331, 34, 6); plat(349, 36, 6); plat(373, 34, 6); plat(352, 32, 3);   /* THE RIBS OF THE CHAMBER: the way up off the floor at the exhale, and off the HEART CRUSH */
  bile('heart', AS, AE, AF, AF, 37.5, { breath: false });               /* the heart's own breath floods the floor 2.5 rows; the shelves and the valve stay dry */
  nerve('A1', 325, 35, { tides: 'heart', arena: true }); nerve('A2', 345, 37, { tides: 'heart', arena: true }); nerve('A3', 384, 35, { tides: 'heart', arena: true });
  ent('parasitequeen', 362, AF - 1, { face: -1 });
  ent('silver', 397, 39);                                                /* (the third silver: behind the heart, after the fight) */
  ent('gate', 394, 39);

  const sections = SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 }));
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 35 }, pools, falls: [], moversExtra: movers,
    music: 'deep', night: false, rule: WH_RULE, whale: true,
    whTides: tides, whNerves: nerves, whMembranes: membranes, whPulls: pulls, whGusts: pulls.map(p => ({ id: p.id, x: p.box[0], x1: p.box[2] })), reachDoors: doors, rigBands,
    reskin: { leech: 'gutleech', crab: 'barnaclecrab' },
    sections,
    palette: { set: 'reef', sky: 'storm', far: 'reef', mid: 'reef', near: 'reef', fg: 'reef', dress: 'reef', haze: 'rgba(170,70,90,0.16)',   /* flesh rose (art owed: its own kit - flesh, bone, bile; NO timber) */
      grass: '#7a3a48', grassL: '#a85a68', grassD: '#4a1e2a', dirt: '#5a2430', dirtL: '#7e3a48', dirtD: '#2e1018', canopy: ['#3a1420', '#5a2030', '#7a3040', '#9a4a5a'] },
    ambient: [{ x0: 0, x1: 99999, kind: 'cave' }],
    tints: [[0, 125, [220, 120, 140], 0.12], [126, 262, [190, 100, 120], 0.16], [263, 322, [160, 80, 110], 0.2], [323, 400, [140, 50, 80], 0.24]],
    arena: { x0: AS * TS, x1: (AE + 1) * TS, floor: AF * TS, y0: 13 * TS, trigger: (AS + 3) * TS, wallL: AS - 1, wallR: AE + 1, boss: 'parasitequeen', music: 'boss4', tint: '#5a1a2a', tintA: 0.12, fx: 'motes',
      shelves: [[AS, 328], [381, AE]], valve: [343, 346], valveTop: 38, nerves: ['A1', 'A2', 'A3'], tide: 'heart', heartX: 362 * TS },
  };
}

/* THE LEVEL'S OWN CHECKS (tools/whale.mjs): every nerve sits on flesh (or rides a float); every membrane is laid shut; every breath tide is on the one cycle;
   every bile pool has a tide; the shrines are few. -> [problems] */
export function lintWhale(L, T) {
  const bad = [], at = (x, y) => L.grid[y * L.W + x];
  const standable = (x, y) => at(x, y) === T.SOLID || at(x, y) === T.ONEWAY;
  for (const n of L.whNerves) { if (!standable(n.x, n.y + 1) && !n.on) bad.push('nerve ' + n.id + ' does not sit on flesh'); if (at(n.x, n.y) !== T.AIR) bad.push('nerve ' + n.id + ' is buried'); }
  for (const m of L.whMembranes) for (let y = m.y0; y <= m.y1; y++) for (let x = m.x0; x <= m.x1; x++) if (at(x, y) !== T.PORT) bad.push('membrane ' + m.id + ' not laid shut at ' + x + ',' + y);
  const br = L.whTides.filter(t => t.breath);
  for (const t of br) { if (JSON.stringify(t.cycle) !== JSON.stringify(br[0].cycle) || t.first !== br[0].first || t.firstT !== br[0].firstT || t.rate !== br[0].rate || t.safe !== br[0].safe || t.grace !== br[0].grace) bad.push('tide ' + t.id + ' is off the one breath');
    if (!t.verbs.some(v => v.t === 'bell' && v.hidden) || !t.verbs.some(v => v.t === 'sluice' && v.hidden)) bad.push('tide ' + t.id + ' has no hidden bell + sluice for the nerves'); }
  for (const p of L.pools) if (p.wh && !L.whTides.some(t => (t.pools || []).includes(p.id))) bad.push('bile ' + p.id + ' has no tide');
  if (L.whMembranes.filter(m => m.kind === 'sealed').length !== 1) bad.push('one sealed membrane (the required strike)');
  if ((L.arena.nerves || []).length !== 3) bad.push('the chamber has three nerves');
  const checks = L.ents.filter(e => e.t === 'check').length; if (checks > 2) bad.push(checks + ' shrines (Daniel: fewer)');
  return bad;
}
